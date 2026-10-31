# How the engine works

This page is the mental model: what the engine is made of, how a drawing changes, and how a page
learns about it. Read it before [building a host](host.md); the [API reference](../api.md) has
the details.

## The pieces

```text
page ─── calls: runCommand, setActiveTool… ──▶ CadEngine
 ▲                                                │
 └────────── subscribe() + getState() ◀───────────┤
                                                  ▼
                            runtime: commands, snaps, undo
                               │                  │
                               ▼                  ▼
                            drawing ──────▶     scene
                                                  │
                                                  ▼
                                   presenter ──▶ <canvas>
```

- **`CadEngine`** is the engine on a page. It owns the canvas, listens to its pointer, wheel and
  keys, and draws a frame when something changed. It is the only part that knows about the
  browser.
- **The runtime** inside it does the drafting: the commands, their prompts, object snaps,
  tracking, the selection, undo. It never touches the DOM, which is why the same engine runs
  headless as [`CadDriver`](headless.md).
- **The drawing** is the model: its objects, layers, styles, blocks and settings.
- **The scene** is what to paint, as a flat list of shapes in screen pixels, and a **presenter**
  paints it: `CanvasScenePresenter` on a canvas, `SvgScenePresenter` as SVG markup.

The page talks to the engine in one direction with calls and hears back in the other through one
subscription. There are no events to wire one by one.

## Everything is a command

As in AutoCAD, a drawing changes only through commands. `LINE`, `MOVE`, `TRIM` or `LAYER` each
run a sequence of prompts — `Specify first point:`, `Specify next point or [Undo]:` — that the
user answers with clicks, typed values or keywords. Enter or Space ends a step or repeats the last
command; Escape cancels.

A host starts commands the way AutoCAD's own interface does:

- **Typed**: `runCommand("LINE")`, or the user typing on the drawing or in your command line
  field. A command is found by its name or alias in the command language (`L`, `LINE`, `LINEA` in
  Spanish), or by `_` and its global name in any language (`_LINE`).
- **From a button**: `setActiveTool("line")`, by the ids of `state.tools`. It runs the command as a
  ribbon button's macro would, so the command line echoes `_line`.
- **From a menu or a key**: Delete is `deleteSelection()` (ERASE), Ctrl+A is `selectAll()`, and
  the shortcut menus' entries have methods of their own.

`commandCatalog()` lists every command with its aliases and a description, and the
[command reference](https://mellowcad.com/docs/commands) says what each one asks and does.

## The drawing

**Objects** — lines, arcs, circles, polylines, splines, ellipses, text, dimensions, hatches and
block references (`EntityType`) — are stored in world coordinates. One drawing unit is one unit of
the drawing's `LengthUnit` (millimetres by default); the unit only says how lengths are written,
so changing it rescales nothing. Points are `Vec2` or `Vec3`: a flat object keeps its Z beside its
points.

**Layers** hold objects. Layer `0` always exists. An object takes its layer's colour, linetype and
lineweight ("ByLayer") unless it has its own. **Text and dimension styles** are named tables, as
in AutoCAD, and **blocks** are named groups of objects placed by references.

**A host never edits the drawing directly.** It runs a command, or calls a method that does what a
control of AutoCAD's does: `setSelectionColor`, `applyLayerControl`, `createLayer`,
`setSelectionProperty` and the others. That is what keeps undo and the command history right.

`CadEngine` does not hand out the drawing's objects either. What a host shows is already in the
state, worded for the user: the selection's properties as the Properties palette lists them, the
layers with how many objects each holds, the blocks. The whole drawing leaves as a file
(`serializeDrawing()`, see [Drawings and files](drawings.md)). Headless, `CadDriver` gives the
objects themselves (`entities()`).

## Undo

One command, or one gesture, is one undo step: a whole RECTANG, a grip drag, a change from the
Properties palette. U (`undo()`) takes the last step back and writes on the command line what it
took back; REDO (`redo()`) does it again. `state.canUndo` and `state.canRedo` say whether there
is something to undo or redo.

The host's own calls are steps too: `setSelectionColor` is one, as AutoCAD's colour drop-down is.
Loading a drawing starts an empty history.

## The state

`getState()` returns one immutable snapshot of everything a host may show:

| Area             | Fields (examples)                                                                     |
| ---------------- | ------------------------------------------------------------------------------------- |
| The prompt       | `commandLine` (prompt, typed text, history, suggestions), `commandOptions`            |
| Dynamic input    | `dynamicInput`: the box at the cursor, its fields and their values                    |
| Drafting aids    | `snapActive`, `orthoActive`, `polarActive`, `gridVisible`, `snapEnabled`…             |
| Selection        | `selectionCount`, `properties` (the Properties palette), `selectionLayerId`…          |
| Drawing          | `layers`, `currentLayerId`, `textStyles`, `dimStyles`, `blocks`, `documentUnit`…      |
| Menus and dialogs | `shortcutMenu`, `snapOverrideMenu`, `selectionCycling`, `palette`, `unitsDialog`…    |
| Words            | `tools` (labels and aliases), `names` (snaps, colours, linetypes, views)              |

A snapshot is the same object until something changes, and a new one keeps every part that did not
change. So a host can compare by identity and redraw only what changed:

```ts
let last = engine.getState().layers
engine.subscribe(() => {
  const { layers } = engine.getState()
  if (layers !== last) {
    last = layers
    renderLayerList(layers)
  }
})
```

`subscribe` calls its listener once per change and returns a function that unsubscribes. A few
parts change on every mouse move — `coordinates`, `cursorUcs`, `dynamicInput` — so render them in a
small element of their own. `@mellowcad/react`'s `useEditorState` leaves them out for that reason.

Every word in the state is in the user's language: prompts, tool labels, property rows and the
names of snaps and colours. A host shows them and does not keep its own copies.

## The scene

The canvas shows a `Scene`: a background colour and a flat list of `ScenePrimitive` — segments,
arcs, ellipses, paths, text — already projected to screen pixels, with their colours. The engine
builds one per frame, and `CanvasScenePresenter` paints it.

The same scene can become SVG: `SvgScenePresenter` turns it into markup anywhere, a server
included. `buildDrawingPreview` builds a scene of the objects alone, framed in a box, for
thumbnails, and `THEME` holds the colours the scene uses.

## What the engine asks of its host

The engine reaches the outside world through three small interfaces, so it never assumes a
browser:

| Port            | What it does                         | On a page (`CadEngine`)               | Headless (`CadDriver`) |
| --------------- | ------------------------------------ | ------------------------------------- | ---------------------- |
| `DrawingStore`  | Where the drawing is autosaved       | `store` option; none by default       | `store` option         |
| `FileTransport` | Where SAVE writes and OPEN reads     | A download and a file picker          | `files` option         |
| `Clipboard`     | What COPYCLIP writes, PASTECLIP reads | The system clipboard              | `clipboard` option     |

Each one is a pair of functions, so a host can put a drawing anywhere: see
[Drawings and files](drawings.md).

## Languages

The engine speaks two languages at once, as AutoCAD's language packs do: the **interface** (tool
labels, palette rows, the names of snaps and colours) and the **command language** (command
names, prompts, keywords and what is drawn on the canvas). English is built in; Spanish and Arabic
are one import away. See [Languages](languages.md).
