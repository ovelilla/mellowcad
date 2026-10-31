# Languages

The editor speaks English, Spanish and Arabic. Its words come in two catalogs, one per package:

- **`editorLocale`**, the editor's own words: menus, tooltips, the palettes' labels, the dialogs.
  From `@mellowcad/editor/locales/<tag>`.
- **`engineLocale`**, the engine's: command names and aliases, prompts, keywords, the messages on
  the command line, and the names the engine gives (tools, snaps, colours). From
  `@mellowcad/engine/locales/<tag>`.

Each one is English when left out. Pass both, in the same language:

```tsx
import { CadEditor } from "@mellowcad/editor"
import { es } from "@mellowcad/editor/locales/es"
import { es as engineEs } from "@mellowcad/engine/locales/es"

export const Spanish = () => (
  <CadEditor editorLocale={es} engineLocale={engineEs} />
)
```

A Spanish user types Spanish AutoCAD's commands (`LINEA`, `L`), and `_LINE` still reaches the
global one. Arabic has no AutoCAD of its own, so its command language is the global one. Which
words each part covers, and how the engine's language works, is in the engine's
[Languages](../../../cad/docs/languages.md).

The editor sets its catalog's tag as `lang` on its own root and leaves the page's `<html>` alone.
`engineLocale` is read once, when the editor starts.

## Right to left

```tsx
import { CadEditor } from "@mellowcad/editor"
import { ar } from "@mellowcad/editor/locales/ar"
import { ar as engineAr } from "@mellowcad/engine/locales/ar"

export const Arabic = () => (
  <CadEditor editorLocale={ar} engineLocale={engineAr} dir="rtl" />
)
```

`dir="rtl"` mirrors the chrome: the tool palette moves to the right, the palettes to the left, the
ViewCube to the top left. The drawing never mirrors, and neither does what is typed: the command
line, the dynamic input and the coordinates read left to right in every language.

## Loading a language

A catalog is a module of its own, and a language costs nothing until it is imported. Load the one
the page needs, before rendering the editor:

```tsx
import { createRoot } from "react-dom/client"
import { CadEditor } from "@mellowcad/editor"
import "@mellowcad/editor/styles.css"

const [{ es }, { es: engineEs }] = await Promise.all([
  import("@mellowcad/editor/locales/es"),
  import("@mellowcad/engine/locales/es"),
])

createRoot(document.getElementById("root")!).render(
  <CadEditor editorLocale={es} engineLocale={engineEs} />
)
```

On a server, load them there and pass them as props: see [Next.js](nextjs.md).

## The language menu

`languages` lists the page in each language you offer, under Language in the application menu.
Each entry is a link:

```tsx
<CadEditor
  languages={[
    { locale: "en", href: "/draw", name: "English", current: true },
    { locale: "es", href: "/es/draw", name: "Español", current: false },
  ]}
/>
```

`name` is the language named in itself. Choosing one follows its `href`: the page decides what
the new language loads. Without `languages`, the menu has no Language entry.

## Your own words

An `EditorLocale` is a tag and its messages, and any message left out is English's. To reword a
few of the editor's words, give a catalog with only those:

```tsx
import { CadEditor, type EditorLocale } from "@mellowcad/editor"

const english: EditorLocale = {
  tag: "en",
  messages: { TopBar: { savedHint: "Saved to your account" } },
}

export const Editor = () => <CadEditor editorLocale={english} />
```

Over another language, spread its messages under yours:

```tsx
import type { EditorLocale } from "@mellowcad/editor"
import { es } from "@mellowcad/editor/locales/es"

export const spanish: EditorLocale = {
  ...es,
  messages: {
    ...es.messages,
    TopBar: { ...es.messages.TopBar, savedHint: "Guardado en tu cuenta" },
  },
}
```

The keys are those of the English catalog, `@mellowcad/editor/locales/en`, which `EditorLocale`
is typed from. A message with no arguments is a plain string; one with arguments is compiled at
build time with `icu-minify/compile`, as the engine's are
([Messages are compiled at build time](../../../cad/docs/languages.md#messages-are-compiled-at-build-time)).
To reword the engine's words, use `extendLocale` from `@mellowcad/engine`.

## Versioning

The catalog's shape is public API: `EditorLocale` is typed from the English catalog, and yours is
written against it. Renaming, moving or removing a key, or changing a message's arguments, is a
breaking change. Adding a key is not: your catalog falls back to English for it.
