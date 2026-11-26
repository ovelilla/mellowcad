# Next.js

`CadEditor` is a client component, so a server page renders it like any other. On the server it
renders its layout, the empty zones and the canvas; in the browser it builds the engine once the
page has hydrated, and the pieces fill in.

[`examples/editor-next`](../../../examples/editor-next) is a Next app with the editor, its fonts
and a title bar of its own.

## The layout

The editor's stylesheet, and the two fonts it reads from `next/font`:

```tsx examples/editor-next/app/layout.tsx
import { Geist_Mono, Inter } from "next/font/google"
import type { ReactNode } from "react"

import "@mellowcad/editor/styles.css"
import "./globals.css"

// The editor reads its fonts from the host: next/font writes each family to
// the variable the editor asks for, on <html>.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

Give the body no margin: Tailwind's preflight does, if the app has it.

## What a server page can pass

The props of a client component cross from the server to the browser, so they must be data React
can serialize:

- **Data**: the catalogs, `dir`, `languages`, `feedback`, `layoutStorage`, `help`, `sheet`.
- **Elements**: `mark`, rendered on the server.
- **In `components`**, a client component (exported from a `"use client"` module) or `null`,
  never a function of the server page's own:

```tsx examples/editor-next/app/page.tsx
import { CadEditor } from "@mellowcad/editor"

import { HostTitleBar } from "./host-title-bar"

// A server component may hand the editor a client component (`HostTitleBar`
// comes from a "use client" module) or `null`, never a function of its own:
// the title bar is the host's, and the palettes are gone with their columns.
export default function Page() {
  return (
    <CadEditor components={{ TitleBar: HostTitleBar, PaletteContent: null }} />
  )
}
```

`store` and `onEngine` are functions, so a server page cannot pass them. Wrap the editor in a
client component of yours that does, and give that one only data:

```tsx
"use client"

import type { DrawingStore } from "@mellowcad/engine"
import { CadEditor } from "@mellowcad/editor"

function serverStore(id: string, saved: string | null): DrawingStore {
  return {
    read: () => saved,
    write: (text) => {
      // keepalive lets the last write finish as the page closes; browsers
      // refuse it for a body over 64 KB.
      void fetch(`/api/drawings/${id}`, {
        method: "PUT",
        body: text,
        keepalive: text.length < 60_000,
      })
    },
  }
}

export function DrawingEditor({
  id,
  saved,
}: {
  id: string
  saved: string | null
}) {
  return <CadEditor key={id} store={() => serverStore(id, saved)} />
}
```

The server page reads the drawing and hands over its text, so the editor starts with it and no
request waits in the browser:

```tsx
import { DrawingEditor } from "./drawing-editor"
import { readDrawing } from "./drawings" // yours: the file's text, or null for a new drawing

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DrawingEditor id={id} saved={await readDrawing(id)} />
}
```

More on stores in [Saving drawings](drawings.md).

## Languages on the server

A catalog is a plain module, not a client one: load it in the server page and pass it as a prop,
so the editor starts in the page's language without another request. Import each language only
where it is used, and each one is its own chunk:

```tsx
import { CadEditor } from "@mellowcad/editor"

async function catalogs(lang: string) {
  if (lang === "es") {
    const [{ es }, { es: engine }] = await Promise.all([
      import("@mellowcad/editor/locales/es"),
      import("@mellowcad/engine/locales/es"),
    ])
    return { editorLocale: es, engineLocale: engine }
  }
  if (lang === "ar") {
    const [{ ar }, { ar: engine }] = await Promise.all([
      import("@mellowcad/editor/locales/ar"),
      import("@mellowcad/engine/locales/ar"),
    ])
    return { editorLocale: ar, engineLocale: engine, dir: "rtl" as const }
  }
  return {} // English is built in
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return <CadEditor {...await catalogs(lang)} />
}
```

The editor sets `lang` and `dir` on its own root; the page's `<html>` is the layout's to set. See
[Languages](languages.md).

## The palettes at the first paint

With `layoutStorage.palette`, the editor remembers where each palette shows, floating, docked or anchored
at a side, its size and which were open, and with `layoutStorage.ribbon` the ribbon's minimize
state and what its right-click menu shows (Show Tabs, Show Panels, Show Panel Titles), which
moves no zone, so only the state is laid out before the first paint. The server cannot know any of them, and a docked or anchored palette takes its column's or strip's width off the
drawing, so a script in the page's `<head>` for each lays it out from `localStorage` as the page
is parsed, before anything is painted:

```tsx
import { paletteLayoutScript, ribbonLayoutScript } from "@mellowcad/editor"
import type { ReactNode } from "react"

const PALETTE_KEY = "my-app:palette"
const RIBBON_KEY = "my-app:ribbon"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: paletteLayoutScript(PALETTE_KEY) }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: ribbonLayoutScript(RIBBON_KEY) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

```tsx
<CadEditor
  layoutStorage={{
    palette: PALETTE_KEY,
    ribbon: RIBBON_KEY,
    statusBar: "my-app:status-bar",
    properties: "my-app:properties",
  }}
/>
```

The key in each script and in `layoutStorage` must be the same. Without the scripts the editor
still works: the panel opens or folds by the window's width and the ribbon shows whole until the
scripts run, then each takes what this browser remembered. A key is a promise to your users:
renaming it forgets what they kept. `paletteLayoutScript` and `ribbonLayoutScript` are plain
functions, so a server component may call them.
