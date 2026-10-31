# MellowCAD editor

The whole MellowCAD drafting editor as one React component, `CadEditor`: the drawing with the
chrome an AutoCAD user expects around it — the top bar, the tool palette, the palettes, the command
line, the status bar, the ViewCube — its menus and dialogs, and its words in English, Spanish and
Arabic. It is the editor of [mellowcad.com/draw](https://mellowcad.com/draw), built on
[`@mellowcad/engine`](../../cad/README.md) and [`@mellowcad/react`](../react/README.md), and it
ships its own stylesheet.

It is not on npm yet. Once it is:

```sh
npm install @mellowcad/editor @mellowcad/react @mellowcad/engine
```

The engine, `@mellowcad/react` and React 19 are peers: a page has one of each. The package is ESM
only and ships its TypeScript declarations.

## Quick start

The whole of [`examples/editor-vite`](../../examples/editor-vite), a Vite app:

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

Type `L` and Enter, click twice, press Escape: that is AutoCAD's LINE. Reload the page and the
drawing is still there.

## What it asks of the page

- **Two fonts.** Set `--font-sans` and `--font-mono` on the page, or on any element around the
  editor. The editor declares neither.
- **The whole window.** The editor is `100svh` high and as wide as its parent. Give the body no
  margin and put nothing above or below it: your own controls go in the editor's
  [slots](docs/customizing.md).
- **The whole keyboard.** It takes every key on the page wherever focus is, as AutoCAD does, so a
  command can be typed at any moment. A text field keeps what is typed in it, save the function
  keys and AutoCAD's Ctrl shortcuts.
- **Nothing else.** The stylesheet styles only the editor's root, `[data-mellowcad-editor]`, and
  what is inside it, never `<html>` or `<body>`. The editor sets `lang` and `dir` on its own root
  and leaves the page's alone.

By default it keeps the drawing in this browser's `localStorage` and restores it on the next
visit. To keep it somewhere else, see [Saving drawings](docs/drawings.md).

## Props

Every prop is optional.

- **Languages**: `engineLocale` for the commands, prompts and drawing, `editorLocale` for the
  editor's own words, and `dir="rtl"` to mirror the chrome. See [Languages](docs/languages.md).
- **The drawing**: `store`, where it is kept, and `onEngine`, which hands you the engine to save,
  open or run commands from your own code. See [Saving drawings](docs/drawings.md).
- **The chrome**: `components`, your own top bar, status bar or other piece, or none; `mark`, your
  product's glyph on the application menu; `languages`, the page in each language you offer, in
  that menu; `layoutStorage`, the `localStorage` keys under which the palette panel and the status
  bar are remembered; `help`, where F1 opens help; and `sheet`, an id and a `view-transition-name`
  for the drawing's cell. See [Customizing](docs/customizing.md).

`engineLocale`, `store`, `onEngine` and `help` go to the engine, so they are read once, when the
editor starts. To change one, mount a new editor: give it a new `key`.

## Guides

| Guide                               | What it covers                                                           |
| ----------------------------------- | ------------------------------------------------------------------------ |
| [Customizing](docs/customizing.md)  | Replacing or removing the top bar, the status bar and the other pieces   |
| [Saving drawings](docs/drawings.md) | Your own store, and saving and opening drawings from your code           |
| [Languages](docs/languages.md)      | Spanish and Arabic, right to left, the language menu, your own words     |
| [Next.js](docs/nextjs.md)           | Server pages, catalogs loaded on the server, fonts and the layout script |
| [API reference](api.md)             | Every export, with its signature and its documentation                   |

What each command does, with its prompts and options, is in the user's
[command reference](https://mellowcad.com/docs/commands).

## Entry points

| Import                            | What                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `@mellowcad/editor`               | `CadEditor`, its pieces and their types                   |
| `@mellowcad/editor/locales/<tag>` | The editor's words in one language each: `en`, `es`, `ar` |
| `@mellowcad/editor/styles.css`    | The stylesheet                                            |

## Versioning

The editor follows semantic versioning, as the engine does. What it promises is what the
[API reference](api.md) lists: every export and every type it reaches, the shape of its catalog
(`EditorLocale`), and what the stylesheet asks of a page — its root attribute, its cascade layers
and the two font variables. While the version is 0.x, a breaking change bumps the minor version.
Each release is in the [changelog](CHANGELOG.md).

## License

MIT ([LICENSE](LICENSE)): the code, not the MellowCAD name or logo.

AutoCAD is a registered trademark of Autodesk, Inc. MellowCAD is an independent project, not
affiliated with or endorsed by Autodesk; AutoCAD is named only to describe what it is compatible
with.
