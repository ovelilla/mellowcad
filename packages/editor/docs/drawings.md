# Saving drawings

The editor saves the drawing on its own: after every change it writes it to a store, and when it
starts it restores what the store holds. You choose the store with the `store` prop. For anything
else — saving to your server on demand, opening a drawing, running a command — `onEngine` hands
you the engine.

What a store is, the drawing file and the engine's calls are in the engine's
[Drawings and files](../../../cad/docs/drawings.md); this page is how the editor takes them.

## The default: this browser

Without `store`, the editor keeps the drawing in this browser's `localStorage`
(`createLocalStorageDrawingStore`), under one fixed key. Every page of your site that keeps the
default shares that drawing, and each overwrites it. Where the browser has no storage, nothing is
kept.

## Your own store

`store` is a function that makes the store. The editor calls it once, when it starts:

```tsx
import { createMemoryDrawingStore } from "@mellowcad/engine"
import { CadEditor } from "@mellowcad/editor"

// Nothing is kept: every visit starts from an empty drawing.
export const Scratch = () => <CadEditor store={() => null} />

// In memory, starting from a drawing file's text.
export const Viewer = ({ text }: { text: string }) => (
  <CadEditor store={() => createMemoryDrawingStore(text)} />
)
```

A store backed by your server fetches the drawing before the editor starts, and sends each write
without waiting: the engine's [Your own store](../../../cad/docs/drawings.md#your-own-store) is
one. Pass it the same way, `store={() => store}`. In Next.js, the server page can read the drawing
for it ([Next.js](nextjs.md#what-a-server-page-can-pass)).

The editor writes once a burst of changes settles, about a third of a second after the last, and
once more when the page is hidden or closed. The top bar shows `Saving…`, then `Saved`, whose
hint says `Saved on this device`: for a store of your own, reword it (see
[Languages](languages.md#your-own-words)).

### Another drawing

The store is read once. To open another drawing in its own store, mount a new editor with a `key`:

```tsx
<CadEditor key={drawingId} store={() => storeFor(drawingId)} />
```

## The engine

`onEngine` is called with the engine once the editor has built it, and with `null` once it is
gone. Keep it, and call it from your own code:

| Call                       | What it does                                                         |
| -------------------------- | -------------------------------------------------------------------- |
| `serializeDrawing()`       | The drawing file's text                                              |
| `loadDrawing(text)`        | Replaces the drawing with a file's, framed and with an empty undo    |
| `newDrawing()`             | An empty drawing, as NEW                                             |
| `runCommand("_LINE")`      | Starts a command by its global name, as a button of AutoCAD's does   |
| `getState()`, `subscribe()` | What the editor shows, and a call when it changes                   |

An editor that the page around it, in another frame, asks for the drawing and hands drawings to:

```tsx
"use client"

import { useEffect, useState } from "react"
import type { CadEngine } from "@mellowcad/engine"
import { CadEditor } from "@mellowcad/editor"

type Request = { type: "save" } | { type: "open"; text: string }

export function EmbeddedEditor() {
  const [engine, setEngine] = useState<CadEngine | null>(null)

  useEffect(() => {
    if (!engine) return
    const onMessage = (event: MessageEvent<Request>) => {
      if (event.origin !== window.location.origin) return
      if (event.data.type === "save") {
        const text = engine.serializeDrawing()
        window.parent.postMessage({ type: "drawing", text }, event.origin)
      } else {
        try {
          engine.loadDrawing(event.data.text)
        } catch (error) {
          alert((error as Error).message) // worded for the user
        }
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [engine])

  return <CadEditor onEngine={setEngine} />
}
```

- **Until there is an engine, there is nothing to call.** It is built in the browser once the
  editor is on the page; on a server, and before that, `onEngine` has not been called.
- **In development, React's Strict Mode builds the engine twice.** You get the first one, then
  `null`, then the second: keep the last one you were handed.
- **The user's own commands still work.** SAVE (Ctrl+S) downloads the drawing file and OPEN
  (Ctrl+O) opens one, whatever the store; your calls are beside them, not instead.
