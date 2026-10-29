# MellowCAD editor

The whole drafting editor as one React component, `CadEditor`: the canvas with AutoCAD's chrome
around it — the top bar, the tool palette, the palettes, the command line, the status bar, the
ViewCube — its menus and dialogs, and its words in three languages. Built on
[`@mellowcad/engine`](../../cad/README.md) and [`@mellowcad/react`](../react/README.md), with
Base UI, compiled with the React Compiler, and shipped with its stylesheet.

It is the package `@mellowcad/editor`, ESM only, not published yet. The engine,
`@mellowcad/react` and React 19 are peers: a page has one of each.

## Entry points

| Import                            | What                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| `@mellowcad/editor`               | `CadEditor`, its pieces and their types                    |
| `@mellowcad/editor/locales/<tag>` | the editor's words in one language each: `en`, `es`, `ar` |
| `@mellowcad/editor/styles.css`    | its stylesheet                                             |

What they export, signature by signature, and what the stylesheet asks of a page, is
[`api.md`](api.md).

## On a page

```tsx examples/editor-vite/src/main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { CadEditor } from "@mellowcad/editor"
import "@mellowcad/editor/styles.css"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CadEditor />
  </StrictMode>
)
```

```css examples/editor-vite/src/index.css
/* What the editor asks of the page around it: the two fonts it reads, and a
   body without margin, since the editor fills the window. Its stylesheet
   styles nothing outside its root. */
:root {
  --font-sans: system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  color-scheme: dark;
}

body {
  margin: 0;
}
```

That is all of [`examples/editor-vite`](../../examples/editor-vite), a Vite app. What the page
gives the editor, and what the editor takes:

- **The stylesheet styles only the editor**: its root, `[data-mellowcad-editor]`, and what is
  inside it, never `<html>` or `<body>`. It is Tailwind 4's output, in Tailwind's cascade layers
  (`properties`, `theme`, `base`, `components`, `utilities`).
- **The fonts are the page's**: `--font-sans` and `--font-mono`, set on the root or above it. The
  editor declares neither.
- **It fills the window** (`100svh`), so the page's body has no margin and nothing else scrolls
  around it.
- **It is the page's application**: it takes every key on the page wherever focus sits, as AutoCAD
  takes the keyboard, and keeps the drawing on this device (`localStorage`), restoring it on the
  next visit.

## Languages

```tsx
import { CadEditor } from "@mellowcad/editor"
import { ar } from "@mellowcad/editor/locales/ar"
import { ar as engineAr } from "@mellowcad/engine/locales/ar"

export const Arabic = () => (
  <CadEditor editorLocale={ar} engineLocale={engineAr} dir="rtl" />
)
```

The editor's words and the engine's are two catalogs, one per package, each English when left
out. `dir` mirrors the chrome; the drawing never mirrors. The editor sets `lang` and `dir` on its
own root and leaves the page's `<html>` alone. A language module is not a client module: a
server page loads the catalogs and passes them as props.

## What else a page may give it

- `mark`, the product's glyph on the application menu.
- `languages`, the page in each language the host offers (`locale`, `href`, `name`, `current`),
  listed in the application menu.
- `layoutStorage`, the `localStorage` keys under which this device keeps the palette panel's
  width and fold (`palette`) and the status bar's Customization (`statusBar`). Without a key,
  nothing is kept. With `palette`, put `paletteLayoutScript(key)` in a `<script>` in the page's
  `<head>`: it lays the panel out as the page is parsed, so the drawing does not jump once the
  scripts run.
- `sheet`, the id and `view-transition-name` of the canvas's cell, for a page that grows into it.

## Replacing a piece

Each of the nine pieces is a slot of `components`, by its name: `TopBar`, `ToolRail`,
`PalettePanel`, `CommandLine`, `StatusBar`, `ViewportControls`, `ViewCube`, `NavigationBar`,
`DynamicInput`. A slot takes a component of the host's, which renders in the piece's place and
is handed what the piece is (`PieceProps`: the engine and its state; `TopBarProps` and
`StatusBarProps` add what the page gave for those two), or `null`, which takes the piece out with
its zone, from the first paint, and the canvas takes the room.

```tsx examples/editor-next/app/page.tsx
import { CadEditor } from "@mellowcad/editor"

import { HostTopBar } from "./host-top-bar"

// A server component may hand the editor a client component (`HostTopBar`
// comes from a "use client" module) or `null`, never a function of its own:
// the top bar is the host's, and the palette panel is gone with its zone.
export default function Page() {
  return <CadEditor components={{ TopBar: HostTopBar, PalettePanel: null }} />
}
```

[`examples/editor-next`](../../examples/editor-next) is that Next app, with its top bar and its
fonts from `next/font`.

- **A replacement renders inside the editor's root**: the editor's colour tokens, its fonts and
  its popups' container reach it. Its zone, the zone's size and border, stay the editor's.
- **Its classes are the host's to compile**: the stylesheet holds only the editor's own. Tailwind's
  utilities are global classes, so the host's `.flex` or `.px-2` and the editor's are the same
  rule under Tailwind 4's default theme; a host that changes the theme (its spacing, say) changes
  the editor's utilities too. Keyframes (`spin`, `enter`, `exit`, `prompt-fade`) and Tailwind's
  `--tw-*` properties are the document's, shared the same way.
- **The menus and dialogs the engine opens are not slots** — the shortcut menu, the object snap
  menu, selection cycling, the UNITS dialog: the engine waits on their answer.

## The pieces

The nine pieces are exported too, to wrap one in its own slot or to compose one inside a
replacement:

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

A piece renders only inside `CadEditor`. Outside it there is no root: no tokens, the English
words whatever the page's language, popups in `<body>` with no styles; and the menus and dialogs
that `CadEditor` mounts are missing, so a command that opens one waits for an answer that never
comes. A page with fewer pieces is `CadEditor` with the others turned off.

## Versioning

The catalog's keys are public API, as the engine's are (`EditorLocale` is typed from `en`):
adding one is a minor version, renaming or removing one, or changing a message's arguments, a
major. So are what the stylesheet asks of a page: its root attribute, its layers and the
variables it reads.
