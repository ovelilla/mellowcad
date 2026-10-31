# Customizing the editor

The editor is nine pieces round the drawing. Each one is a slot of the `components` prop: give it
a component of your own and it renders in the piece's place, or give it `null` and the piece is
gone, with the room it took.

## The pieces

| Slot               | The piece                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| `TopBar`           | Across the top: the application menu, Quick Access, layers and properties   |
| `ToolRail`         | Down the start side: the tool palette                                       |
| `PalettePanel`     | Down the end side: Properties, Layers, Blocks and Styles, as tabs           |
| `CommandLine`      | Under the drawing: the command line and its history                         |
| `StatusBar`        | Across the bottom: the coordinates, the drafting modes and Customization    |
| `ViewportControls` | On the drawing, top start corner: `[Top]`, the preset views                 |
| `ViewCube`         | On the drawing, top end corner                                              |
| `NavigationBar`    | On the drawing, under the ViewCube: Pan, Zoom and Orbit                     |
| `DynamicInput`     | On the drawing, at the cursor: the fields typed into while a command runs   |

In a right-to-left page the start side is the right.

## Replacing a piece

A replacement is handed what the piece is: `PieceProps`, the engine and its state, and for the
top bar and the status bar what you gave `CadEditor` for them (`mark` and `languages`, the status
bar's `storageKey`).

```tsx
"use client"

import type { TopBarProps } from "@mellowcad/editor"

export function MyTopBar({ engine, state }: TopBarProps) {
  return (
    <nav className="flex w-full items-center gap-1 px-2">
      <span>My app</span>
      <button onClick={() => engine.runCommand("_QSAVE")}>Save</button>
      <span className="ms-auto">{state.entityCount} objects</span>
    </nav>
  )
}
```

```tsx
<CadEditor components={{ TopBar: MyTopBar }} />
```

- **`state` changes when the drawing or a mode does**, not with every mouse move. The cursor's
  coordinates and the dynamic input are left out of it; read them with
  `useEngineSelector(engine, (state) => state.cursorUcs)` from `@mellowcad/react`, in the
  smallest component that shows them.
- **Everything a control does is a call to the engine**: `runCommand("_LINE")`,
  `setActiveTool("line")`, `toggleSnap()`. After a click, `engine.focusSurface()` gives the keys
  back to the drawing, so the next one types a command.
  [Building a host](../../../cad/docs/host.md) goes through the state and the calls piece by piece.
- **It renders inside the editor's root**, in the piece's zone: the editor's colours, its fonts and
  its language reach it. The zone's size and border stay the editor's, so the drawing keeps its
  place whatever the piece renders.
- **Its classes are yours to compile.** The editor's stylesheet holds only the classes the editor
  uses. It is Tailwind 4's output, and Tailwind's classes are global: your `.flex` and the editor's
  are the same rule under Tailwind's default theme, and a theme of yours that changes the spacing
  changes the editor's too.

## Removing a piece

```tsx
<CadEditor components={{ PalettePanel: null, NavigationBar: null }} />
```

A piece set to `null` is gone from the first paint, and the drawing takes its room. A slot you
leave out keeps the editor's piece.

## Wrapping a piece

The nine pieces are exported, so a replacement can render the editor's own piece and add to it:

```tsx
"use client"

import { TopBar, type TopBarProps } from "@mellowcad/editor"

export function TopBarWithHelp(props: TopBarProps) {
  return (
    <>
      <TopBar {...props} />
      <a href="/help">Help</a>
    </>
  )
}
```

A piece renders only inside `CadEditor`. Outside it there is no root to give it colours or words,
and the menus and dialogs the editor mounts are missing, so a command that opens one would wait
for an answer that never comes. For a page with fewer pieces, turn the others off.

## What is not a slot

The menus and dialogs the engine opens are part of the editor, not slots: the shortcut menu at the
cursor, the object snap menu, selection cycling, the UNITS dialog and the task dialogs for locked
objects and for unsaved text. The engine waits on their answer, so the editor always keeps them.

## The rest of the chrome

- **`mark`** is your product's glyph on the application menu's button, which shows a menu icon
  without it.
- **`help`** is where F1 opens help, in a new tab, as AutoCAD does: `index` with no command running,
  and `command` while one runs, with `{command}` replaced by its global name in lower case.

  ```tsx
  <CadEditor help={{ index: "/help", command: "/help/commands#{command}" }} />
  ```

  F1 during LINE opens `/help/commands#line`. Without `help`, F1 is the browser's.
- **`layoutStorage`** names the `localStorage` keys under which this browser remembers the palette
  panel's width and fold (`palette`) and what the status bar shows (`statusBar`). A part without a
  key is not remembered. On a page rendered on a server, `palette` needs
  [the layout script](nextjs.md#the-palette-panel-at-the-first-paint) too, or the panel shows as
  the window's width decides until the scripts run, then changes.
- **`sheet`** gives the drawing's cell an `id` and a `view-transition-name`, for a page that grows
  into the editor with a view transition.
