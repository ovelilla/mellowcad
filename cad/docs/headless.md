# Without a browser

`CadDriver` is the same engine as `CadEngine`, with no canvas: it is driven as a user would drive
it — commands typed, clicks in world coordinates, keys — and runs anywhere JavaScript does. Use it
to script drawings, to test code that builds on the engine, or to render drawings on a server.

## A first script

```ts examples/engine-node/main.ts
import { writeFileSync } from "node:fs"

import { CadDriver, SvgScenePresenter } from "@mellowcad/engine"

// The engine with no browser: typed commands and clicks in world
// coordinates, as a user would draw them. SAVE hands the drawing file to the
// host's transport, which here writes it to disk.
const cad = new CadDriver({
  files: {
    save: (text, fileName) => writeFileSync(fileName, text),
    open: async () => null,
  },
})

cad.command("RECTANG").click({ x: 0, y: 0 }).click({ x: 200, y: 100 })
cad.command("CIRCLE").click({ x: 100, y: 50 }).type("30").enter()
cad.command("SAVE")

// What the canvas would show, as an SVG document.
writeFileSync("drawing.svg", new SvgScenePresenter().render(cad.scene()))

console.log(cad.commandLog().join("\n"))
cad.dispose()
```

That is [`examples/engine-node`](../../examples/engine-node), run with `node main.ts`. The package's declarations name DOM types, because
`CadEngine` takes a canvas, so a TypeScript project that checks them (`skipLibCheck` off) has
`"dom"` in its `lib`, even in Node.

## Driving it

Every input returns the driver, so a gesture reads as one line. Points are world coordinates:
the driver projects them through its view, 1000×800 pixels at scale 1 unless `width` and
`height` say otherwise.

| Input                                  | What the user does                                              |
| -------------------------------------- | --------------------------------------------------------------- |
| `command("CIRCLE")`                    | Types a command at the `Command:` prompt and presses Enter      |
| `click(point)`, `doubleClick(point)`   | Picks a point                                                   |
| `type("30")`, `enter()`, `escape()`    | Types into the prompt's field, then Enter or Escape             |
| `option("Close")`                      | Answers `[Close/Undo]` with a keyword, by its global id         |
| `press("F8")`                          | Presses a key on the drawing                                    |
| `moveTo`, `drag`, `rightClick`, `wheel` | Moves, drags a window or a grip, right-clicks, zooms           |
| `select(...ids)`, `selectAll()`        | Sets the selection directly, with no clicks                     |
| `undo()`, `redo()`                     | U and REDO                                                      |

`option` names a keyword by its global id in every language, and types it as a user of the
command language would: `option("Close")` types `C` in English and `C` for `Cerrar` in Spanish.
An id the prompt does not offer throws, since it is a mistake in the script.

To read what happened:

| Reader                                 | What it returns                                                |
| -------------------------------------- | -------------------------------------------------------------- |
| `entities()`, `latest()`, `byId(id)`   | The drawing's objects, the last one added, one by its id       |
| `entityCount`, `typeCounts()`          | How many objects, and how many of each type                    |
| `selectedIds()`                        | The selection                                                  |
| `state()`                              | The same `EngineState` a page's engine has                     |
| `scene()`                              | The frame a canvas would show, for a presenter                 |
| `commandLog()`                         | The command line's history, as text                            |

## Options

```ts
import { CadDriver, createMemoryDrawingStore } from "@mellowcad/engine"
import { es } from "@mellowcad/engine/locales/es"

const cad = new CadDriver({
  locale: es, // the language it speaks
  store: createMemoryDrawingStore(), // where it autosaves, and what it starts from
  snap: true, // running object snaps, off by default
  polar: true, // polar tracking, off by default
})
```

Object snaps, polar tracking and the UCS icon start off, so a script lands exactly where it
clicks; turn them on when a script is about them. `entities` and `blocks` seed the drawing, and
`files` and `clipboard` stand in for SAVE, OPEN and the clipboard, which have no browser to use.

## In tests

The driver makes a test read like the steps a user takes:

```ts
import { CadDriver } from "@mellowcad/engine"
import { expect, it } from "vitest"

it("draws a line 100 long", () => {
  const cad = new CadDriver()
  cad.command("LINE").click({ x: 0, y: 0 }).type("@100,0").enter().escape()

  expect(cad.latest()).toMatchObject({ type: "line", end: { x: 100, y: 0 } })
  cad.dispose()
})
```

## A drawing file as a picture

On a server, a drawing file becomes SVG through a driver that starts from it:

```ts
import { CadDriver, SvgScenePresenter, createMemoryDrawingStore } from "@mellowcad/engine"

export function drawingToSvg(file: string): string {
  const cad = new CadDriver({ store: createMemoryDrawingStore(file), width: 800, height: 600 })
  cad.command("ZOOM").option("Extents")
  cad.press("F7") // no grid
  const svg = new SvgScenePresenter().render(cad.scene())
  cad.dispose()
  return svg
}
```

The scene is the frame a user would see, so the crosshair is in it. For the objects alone, see
[demos](#demos).

## Demos

A demo is a script that can be replayed: the landing page's animations and the figures in the
docs are demos. `demo()` starts one, each step returns a new script, and `recordDemo` replays it
on a fresh engine:

```ts
import { buildDrawingPreview, demo, recordDemo, transcript } from "@mellowcad/engine"

const script = demo({ width: 800, height: 400 })
  .command("LINE")
  .click(0, 0)
  .type("100")
  .enter()
  .escape()

const recording = await recordDemo(script)
transcript(recording) // the command line's history, line by line
buildDrawingPreview(recording.document, { width: 400, height: 200 }) // the objects alone, framed
```

A recording holds each step with the prompt it answered and the objects it added or removed, the
drawing as the session left it, and the last frame. `recordDemo(script, { locale })` records the
same script in another language.
