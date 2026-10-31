# Drawings and files

A drawing leaves the engine in two ways: **autosave**, which writes every change to a store you
choose, and **files**, which the user saves and opens with AutoCAD's commands. Both carry the same
text, the drawing file.

## Autosave

Pass a `DrawingStore` and the engine restores the drawing from it when it starts, then writes it
back after every change:

```ts
interface DrawingStore {
  read(): string | null
  write(text: string): void
}
```

- `write` is called once a burst of changes settles (about a third of a second), and once more on
  `dispose()` and when the page is hidden or left, so the last change is never lost.
- `read` is called once, when the engine starts. Text that is not a drawing gives an empty one,
  never an error.
- `state.saveState` (`"idle"`, `"saving"`, `"saved"`) and `state.lastSavedAt` drive a save
  indicator.

The engine has two stores built in:

| Store                              | Where it keeps the drawing                                                  |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `createMemoryDrawingStore(text?)`  | In memory while the page lives, starting from `text` if given               |
| `createLocalStorageDrawingStore()` | In this browser's `localStorage`, the same slot the MellowCAD editor uses    |

The second one shares, and overwrites, the drawing someone drew at mellowcad.com/draw on the same
device: use it only for an editor that should continue that drawing. `readSavedDrawingSummary()`
reads how many objects and layers that slot holds without loading it, for a "continue drawing"
link. `null` from `createLocalStorageDrawingStore()` means there is no storage (a server, or a
browser that blocks it).

### Your own store

`write` is synchronous and `read` runs before the engine exists, so a store backed by a server
fetches the drawing first and sends each write without waiting:

```ts
import { CadEngine, type DrawingStore } from "@mellowcad/engine"

const url = "/api/drawings/42"
const saved = await fetch(url).then((response) => (response.ok ? response.text() : null))

const store: DrawingStore = {
  read: () => saved,
  write: (text) => {
    void fetch(url, { method: "PUT", body: text, keepalive: true })
  },
}

const engine = new CadEngine(canvas, { store })
```

The engine already waits for changes to settle, so `write` is not called on every mouse move.
`keepalive` lets the last write finish while the page closes.

## The drawing file

A drawing file is JSON in world coordinates, readable by other tools:

```json
{
  "type": "easycad-drawing",
  "version": 38,
  "generator": "mellowcad",
  "settings": { "unit": "mm", "precision": 2 },
  "layers": [{ "id": "0", "name": "0", "color": "#e2e8f0", "visible": true, "locked": false }],
  "currentLayerId": "0",
  "entities": [
    { "id": "e1", "type": "line", "layerId": "0", "start": { "x": 0, "y": 0 }, "end": { "x": 10, "y": 0 } },
    { "id": "e2", "type": "circle", "layerId": "0", "center": { "x": 0, "y": 0 }, "radius": 5 }
  ]
}
```

(A real file has more settings and tables: styles, blocks, the UCS.)

- **The format is versioned.** Each release that changes it bumps `version`, and every release
  still opens the files of the ones before. A file from a newer version is refused, with a message
  asking to update.
- **The reader is tolerant.** Unknown fields are ignored, and an object it cannot read is skipped
  instead of failing the whole file.
- SAVE names a file `drawing-<date>.ecad.json` (`suggestedFileName()`), and OPEN accepts `.json`
  and `.ecad`.

### Saving and opening yourself

`serializeDrawing()` returns the file's text, and `loadDrawing(text)` replaces the drawing with
one, framed in the view and with an empty undo history:

```ts
async function saveToServer() {
  await fetch("/api/drawings/42", { method: "PUT", body: engine.serializeDrawing() })
}

async function openFromServer() {
  const text = await fetch("/api/drawings/42").then((response) => response.text())
  try {
    engine.loadDrawing(text)
  } catch (error) {
    alert((error as Error).message) // worded for the user
  }
}
```

### SAVE and OPEN

When the user saves (SAVE, or QSAVE with Ctrl+S) or opens (OPEN, Ctrl+O), `CadEngine` downloads
the file or shows a file picker, as the browser allows; a bad file is reported on the command
line.
`saveDrawingToFile()` and `openDrawingFromFile()` do the same from a button. `newDrawing()` is
NEW: an empty drawing, which U brings back from.

## The clipboard

COPYCLIP (Ctrl+C), CUTCLIP (Ctrl+X) and PASTECLIP (Ctrl+V) use the system clipboard, as AutoCAD
does between its drawings. The text copied is a small drawing file, so objects travel between two
tabs, or two engines, with their layers and styles. When the browser refuses to read the
clipboard, PASTECLIP pastes what was last copied in the page. `pasteFromClipboard()` is PASTECLIP
from a button.

## Pictures of a drawing

The canvas is a picture already; for one elsewhere, render a `Scene` with a presenter:

- **SVG, anywhere.** `new SvgScenePresenter().render(scene)` returns an `<svg>` document as a
  string, in a browser, on a server or at build time. `themePalette()` makes it use CSS custom
  properties instead of fixed colours, and `themeCustomProperties()` declares them.
- **A block's thumbnail.** `engine.buildBlockPreview(id, width, height)` frames one block, for a
  palette of blocks.
- **The objects alone.** `buildDrawingPreview(document, { width, height })` frames a drawing with
  no grid, cursor or markers, for a thumbnail or an Open Graph image. Its `document` is a
  recording's (`recordDemo`, see [Without a browser](headless.md#demos)).

To turn a drawing file into a picture on a server, open it in a `CadDriver` and render its scene,
as the [headless guide](headless.md) shows.
