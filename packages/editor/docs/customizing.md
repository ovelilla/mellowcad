# Customizing the editor

The editor is nine pieces round the drawing, in AutoCAD's frame: the title bar across the top,
then the ribbon's band, the drawing with its palettes, the command line and the status bar. Each
piece is a slot of the `components` prop: give it a component of your own and it renders in the
piece's place, or give it `null` and the piece is gone, with the room it took. The ribbon's band
keeps its height while the ribbon is open (`RIBBONCLOSE` closes it, `RIBBON` brings it back): the
full ribbon's, or the one its minimize state takes, which a `Ribbon` of your own reads and sets
with `useRibbonLayout()`.

## The pieces

| Slot               | The piece                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| `TitleBar`         | Across the top: the application menu, Quick Access and the save state       |
| `Ribbon`           | Under it: the ribbon, Home, Insert, Annotate, 3D Tools and View             |
| `PaletteContent`   | What Properties, the Layer Properties Manager and Blocks each hold          |
| `CommandLine`      | Under the drawing: the command line and its history                         |
| `StatusBar`        | Across the bottom: the coordinates, the drafting modes and Customization    |
| `ViewportControls` | On the drawing, top start corner: `[Top]`, the preset views                 |
| `ViewCube`         | On the drawing, top end corner                                              |
| `NavigationBar`    | On the drawing, under the ViewCube: Pan, Zoom and Orbit                     |
| `DynamicInput`     | On the drawing, at the cursor: the fields typed into while a command runs   |

In a right-to-left page the start side is the right.

## Replacing a piece

A replacement is handed what the piece is: `PieceProps`, the engine and its state, and for the
title bar and the status bar what you gave `CadEditor` for them (`mark`, `languages`, `feedback`
and whether there is `help`, the status bar's `storageKey`). A `PaletteContent` is also handed
`palette`, the palette it fills: `"properties"`, `"layers"` or `"blocks"`; each palette's frame,
floating, docked or anchored at a side, stays the editor's.

```tsx
"use client"

import type { TitleBarProps } from "@mellowcad/editor"

export function MyTitleBar({ engine, state }: TitleBarProps) {
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
<CadEditor components={{ TitleBar: MyTitleBar }} />
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
<CadEditor components={{ PaletteContent: null, NavigationBar: null }} />
```

A piece set to `null` is gone from the first paint, and the drawing takes its room. A slot you
leave out keeps the editor's piece.

## Wrapping a piece

The nine pieces are exported, so a replacement can render the editor's own piece and add to it:

```tsx
"use client"

import { TitleBar, type TitleBarProps } from "@mellowcad/editor"

export function TitleBarWithHelp(props: TitleBarProps) {
  return (
    <>
      <TitleBar {...props} />
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
  without it. The button is 48 × 32, as AutoCAD's: a mark of 20 px fits it.
- **`feedback`** is the page Send Feedback opens, in a new tab: an entry of the Help ▾ list at the
  title bar's end, named as AutoCAD names it in each language. Point it at wherever your users
  report a problem (a form, an issue tracker, a `mailto:` link), with what you know already filled
  in. Without `feedback`, the list has no Send Feedback; without it and `help`, there is no Help ▾.
- **`help`** is where F1 and the title bar's Help button open help, in a new tab, as AutoCAD does:
  `index` with no command running, and `command` while one runs, with `{command}` replaced by its
  global name in lower case.

  ```tsx
  <CadEditor help={{ index: "/help", command: "/help/commands#{command}" }} />
  ```

  F1 during LINE opens `/help/commands#line`. A command with a page of its own is listed in
  `commands`, by its global name in lower case, and F1 opens that page instead:

  ```tsx
  <CadEditor
    help={{
      index: "/help",
      command: "/help/commands#{command}",
      commands: { offset: "/help/commands/offset" },
    }}
  />
  ```

  Without `help`, F1 is the browser's.
- **`layoutStorage`** names the `localStorage` keys under which this browser remembers the palette
  panel's width and fold (`palette`), the ribbon's minimize state (`ribbon`) and what the status
  bar shows (`statusBar`). A part without a key is not remembered. On a page rendered on a server,
  `palette` and `ribbon` need [their layout scripts](nextjs.md#the-palettes-at-the-first-paint)
  too, or the panel and the ribbon show as they start until the scripts run, then change.
- **`sheet`** gives the drawing's cell an `id` and a `view-transition-name`, for a page that grows
  into the editor with a view transition.
