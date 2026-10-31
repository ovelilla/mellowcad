# Building a host

A host is the page around the engine: the canvas, and whatever chrome you give it. This guide
goes from a bare canvas to a full editor, one piece at a time. Every piece is optional: the engine
works with the canvas alone, and each piece you add is a view of the state and a few calls.

If you use React, [`@mellowcad/react`](../../packages/react/README.md) does the wiring of this
page for you, and [`@mellowcad/editor`](../../packages/editor/README.md) is all of it, built.

## The canvas

```ts
import { CadEngine, createMemoryDrawingStore } from "@mellowcad/engine"

const engine = new CadEngine(canvas, { store: createMemoryDrawingStore() })
```

- **Give the canvas a size with CSS.** The engine reads the canvas's box, sets its pixel buffer to
  that size times the screen's pixel ratio, and follows it when the box changes. Do not set the
  `width` and `height` attributes yourself.
- **Build the engine in the browser, once the canvas is in the document**, and call
  `engine.dispose()` when it leaves. On a server there is no engine; render the canvas empty.
- **Pass a `store`** if the drawing should survive a reload; without one nothing is saved. See
  [Drawings and files](drawings.md).

The canvas is focusable (`tabindex="0"`). Give it an `aria-label`.

## Keys, the wheel and focus

The engine takes keys, the wheel and the right-click only from its **scope**, and only while it is
active: from a press or a focus inside the scope until the next one outside. Inactive, it hears no
keys, the wheel scrolls the page and the browser's context menu works.

| `scope`              | Use it for                                                                    |
| -------------------- | ----------------------------------------------------------------------------- |
| none (the canvas)    | A drawing embedded in a page of other content                                 |
| an element           | A canvas with your own controls around it: pass the element that holds both  |
| `"document"`         | A full-page editor: every key reaches the engine wherever focus is            |

Inside the scope, a text field keeps the keys typed in it, except the function keys (F3, F8…) and
AutoCAD's global Ctrl shortcuts, which work wherever focus is, as in AutoCAD. An open menu
(`role="menu"`) and a modal dialog (`role="dialog"` with `aria-modal="true"`) keep every key, so
their arrows and Enter never reach the prompt. The editor at
[mellowcad.com/draw](https://mellowcad.com/draw) uses `"document"`.

`engine.focusSurface()` gives focus back to the drawing, for example after a dialog closes.

## The command line

Everything the command line shows is `state.commandLine`:

- `prompt`: what stands before the input, `Command:` or `LINE Specify next point or [Undo]:`;
  `promptSegments` is the same text in spans, the `[Close/Undo]` list set apart for styling;
- `buffer`: what the user has typed, on the drawing or in your field;
- `lines`: the history, each line with its `kind` (`command`, `prompt`, `info` or `error`), and
  `recent`, the last few lines AutoCAD shows above the prompt;
- `suggestions`: the commands that match what is typed, for an autocomplete list;
- `lang`: the language of the prompts, for the `lang` attribute of what shows them.

A field to type commands in needs two calls: `setCommandLineText` for what is typed, and
`commandLineKey` for the keys that act: Enter and Space answer, the arrows go through the commands
already run, Tab completes a name and Escape goes back to the drawing. It returns whether the
engine took the key.

```ts
const field = document.querySelector<HTMLInputElement>("#command")!
field.autocomplete = "off"
field.spellcheck = false

field.addEventListener("input", () => engine.setCommandLineText(field.value))
field.addEventListener("keydown", (event) => {
  if (engine.commandLineKey(event.key)) event.preventDefault()
})
engine.subscribe(() => {
  const { buffer } = engine.getState().commandLine
  if (field.value !== buffer) field.value = buffer
})
```

Typing on the drawing reaches the same buffer, so a field is optional: a line that shows `prompt`
and `buffer` is enough to draw.

## Dynamic input

While a command asks for a point or a value, AutoCAD shows a box at the cursor with a field per
value: a length and an angle for LINE's next point. That is `state.dynamicInput`, or `null` when
there is none:

- `screen` is where the cursor is, in the canvas's pixels; `engine.clientFromScreen(screen)` gives
  the page's coordinates to place the box at, `clearance` pixels below it.
- `prompt` is the question, and `fields` the values, each with its `label`, the `value` typed, a
  `placeholder` with the live reading, a `unitSuffix` and whether it is `active`.

Keys typed on the drawing fill the active field, so a box that only shows `fields` already works.
To let the user type in real fields, each field sends its text to `setDynamicInputText(text,
field.id)` and its keys to `dynamicInputKey(field.id, key, modifiers)`, preventing the browser's
action when it returns true; after a Tab, focus moves to the field now active. Before taking focus
for the box, ask `engine.mayTakeFocus(document.activeElement)`, so the box never steals it from a
menu or a field the user is typing in. `@mellowcad/react`'s `useDynamicInput` does all of this,
and its source is the reference.

The keywords on offer, `[Close/Undo]`, are `state.commandOptions`: show them as buttons that call
`engine.invokeToolOption(option.keyword)`.

## Toolbars and buttons

`state.tools` lists every tool with its `id`, its `label` in the interface language and the alias
a user types (`shortcut`). A button calls `setActiveTool(id)`, and `state.activeToolId` says which
one to show pressed:

```ts
for (const tool of engine.getState().tools) {
  const button = document.createElement("button")
  button.textContent = tool.label
  button.title = tool.shortcut ?? ""
  button.addEventListener("click", () => engine.setActiveTool(tool.id))
  toolbar.append(button)
}
```

A button can also run any command, `runCommand("_ZOOM")`: the `_` and the global name work in
every language. File buttons are `runFileButton("quickAccess", "save")` and its siblings, which
run what AutoCAD's Quick Access Toolbar runs.

## The status bar

| AutoCAD's button | Key | State                      | Call                       |
| ---------------- | --- | -------------------------- | -------------------------- |
| Object snap      | F3  | `snapActive`               | `toggleSnap()`             |
| Selection cycling | F4 | `selectionCycling.active`  | `toggleSelectionCycling()` |
| Grid             | F7  | `gridVisible`              | `toggleGrid()`             |
| Ortho            | F8  | `orthoActive`              | `toggleOrtho()`            |
| Snap mode        | F9  | `snapModeActive`           | `toggleSnapMode()`         |
| Polar tracking   | F10 | `polarActive`              | `togglePolar()`            |
| Object snap tracking | F11 | `objectSnapTrackingActive` | `toggleObjectSnapTracking()` |
| Lineweight       |     | `lwDisplay`                | `toggleLineweightDisplay()` |

The keys work without any button while the engine is active. Which object snaps run is
`state.snapEnabled`, set one by one with `setSnapEnabled(type, on)`, and named for a menu in
`state.names.snaps`. `state.coordinates` is the cursor's position as AutoCAD's status bar writes
it.

## Menus at the cursor

A right-click opens one of AutoCAD's shortcut menus, Shift+right-click the object snap menu, and a
click over overlapping objects may open the Selection list. The engine says which one is open and
where; you draw it and send back the choice. Each position is in the canvas's pixels: place the
menu at `clientFromScreen(at)`.

| Menu                 | State                                            | Choose                                                    | Dismiss                   |
| -------------------- | ------------------------------------------------ | --------------------------------------------------------- | ------------------------- |
| Shortcut menu        | `shortcutMenu`: `at`, `groups` of entries        | `chooseShortcutMenuAction`, `chooseShortcutMenuOption`    | `closeShortcutMenu()`     |
| Object snap override | `snapOverrideMenu`: the position                 | `setSnapOverride(type)`                                   | `closeSnapOverrideMenu()` |
| Selection list       | `selectionCycling`: `listAt`, `candidates`       | `chooseCyclingCandidate(id)`                              | `closeCyclingList()`      |

A shortcut menu's fixed entries come as ids (`"erase"`, `"undo"`): word them in your interface.
Its options come worded already (`option.label`), and `repeat` is the command its Repeat entry
runs. Escape on the drawing closes whichever menu is open.

## Layers and properties

- **Layers**: `state.layers` (each with its `entityCount`) and `state.currentLayerId`. The ribbon's
  layer drop-down is `applyLayerControl(id)`: it moves the selection to the layer, or makes the
  layer current with nothing selected. A layer manager has `createLayer`, `newLayer`,
  `updateLayer`, `removeLayer` and `setCurrentLayer(id, "manager")`.
- **Colour, linetype, lineweight**: the drop-downs are `applyColorControl`,
  `applyLinetypeControl` and `applyLineweightControl`, showing `selectionColor` and its
  siblings, or the current values with nothing selected. Their lists are `STANDARD_COLORS`,
  `LINETYPES` and `LINEWEIGHTS`, named in `state.names`.
- **The Properties palette** is `state.properties`: a type filter (`filters`,
  `setPropertiesFilter`) and `info`, the rows to show in groups. A row with `edit` can be retyped:
  `setSelectionProperty(row.edit.property, text)`.

Every change these calls make to the drawing is one undo step.

## Palettes and dialogs

The engine keeps track of the chrome AutoCAD's commands open, so that typing `LAYER` or `UNITS`
opens what it opens in AutoCAD:

- `state.palette` says whether the palette panel is open and which palette it shows
  (`properties`, `layers`, `blocks`, `styles`); `showPalette`, `closePalette` and `togglePalette`
  change it.
- `state.unitsDialog`, `state.lockedObjectsDialog` and `state.unsavedTextDialog` are dialogs to
  show; `setUnitsDialog(false)`, `closeLockedObjectsDialog()` and `answerUnsavedText(answer)` close
  them.
- `state.commandLine.visible` and `state.cleanScreen` say what Ctrl+9 and Ctrl+0 have hidden.
- `state.viewCube` is the ViewCube, with the `viewCube…` methods to drive it.

A host that leaves one of them out simply has nothing to show when it opens.

## Help

F1 is AutoCAD's help for the running command. Pass `onHelp`, and it is called with the command's
global name (`"LINE"`, whatever the language) or `null` at the Command prompt. Without it, F1 is
the browser's.

```ts
import { CadEngine } from "@mellowcad/engine"

new CadEngine(canvas, {
  onHelp: (command) =>
    window.open(`https://mellowcad.com/docs/commands#${command?.toLowerCase() ?? ""}`),
})
```
