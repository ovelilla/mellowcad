# MellowCAD engine

The 2D drafting engine behind [MellowCAD](https://mellowcad.com), in TypeScript and with no
framework. It works the way AutoCAD does — the same commands and aliases, the same prompts and
keywords, object snaps, Ortho, Polar, grips, undo — so someone who drafts in AutoCAD every day can
draw with it from muscle memory.

Give it a `<canvas>` and it draws, takes the mouse and the keyboard, and runs commands. Give it
nothing and it runs headless, in Node, on a server or in a test.

```sh
npm install @mellowcad/engine
```

It is ESM only and ships its TypeScript declarations.

## Quick start

A canvas with a size, and a line under it for the prompt:

```html
<canvas
  id="drawing"
  style="display: block; width: 100%; height: 480px"
></canvas>
<output id="prompt"></output>
```

```ts
import { CadEngine, createMemoryDrawingStore } from "@mellowcad/engine"

const canvas = document.querySelector<HTMLCanvasElement>("#drawing")!
const prompt = document.querySelector<HTMLOutputElement>("#prompt")!

const engine = new CadEngine(canvas, { store: createMemoryDrawingStore() })

engine.subscribe(() => {
  const { commandLine, dynamicInput } = engine.getState()
  const typed =
    dynamicInput?.fields.find((field) => field.active)?.value ??
    commandLine.buffer
  prompt.textContent = `${commandLine.prompt} ${typed}`
})

engine.runCommand("LINE")
```

Click on the canvas, type `100`, press Enter, click again, press Escape: that is AutoCAD's LINE.
Type `C` and Enter at the Command prompt for a circle, `U` to undo it. The engine does the
rest:

- it sizes the canvas's pixels to its CSS box and the screen's pixel ratio, and follows it when
  the box changes;
- it takes the pointer, the wheel and the keys once the canvas is clicked or focused;
- it redraws when something changes, and tells the page through `subscribe`.

Call `engine.dispose()` when the canvas goes away.

## What the engine does, and what it leaves to you

The engine draws the drawing area: the objects, and what AutoCAD draws over them — the crosshair,
snap markers, tracking paths, grips, the selection and the tooltips at the cursor.

Everything around it is yours: the command line, toolbars, the status bar, palettes, dialogs and
menus. The engine's state says what each one shows, in the user's language, and its methods do
what each control does. You can build that chrome yourself, or take it ready-made:

- [`@mellowcad/react`](../packages/react/README.md): the canvas as a React component, the state as
  React state, and the wiring of the fields AutoCAD users type into;
- [`@mellowcad/editor`](../packages/editor/README.md): the whole editor, as on
  [mellowcad.com/draw](https://mellowcad.com/draw).

## Guides

| Guide                                    | What it covers                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| [How the engine works](docs/concepts.md) | Commands, the drawing, undo, the state, the scene, and how they fit        |
| [Building a host](docs/host.md)          | The canvas, focus and keys, the command line, dynamic input and the chrome |
| [Drawings and files](docs/drawings.md)   | Autosave, the drawing file, open and save, the clipboard, previews, SVG    |
| [Without a browser](docs/headless.md)    | `CadDriver`: scripts, tests and rendering on a server                      |
| [Languages](docs/languages.md)           | Spanish and Arabic, rewording a few words, a language of your own          |
| [API reference](api.md)                  | Every export, with its signature and its documentation                     |

What each command does, with its prompts and options, is in the user's
[command reference](https://mellowcad.com/docs/commands).

## Entry points

| Import                            | What                                |
| --------------------------------- | ----------------------------------- |
| `@mellowcad/engine`               | The engine; English is built in     |
| `@mellowcad/engine/locales/<tag>` | One language each: `en`, `es`, `ar` |

No other path is public. The package has no import-time side effects and ships one module per
source file, so a bundler keeps only what a page uses, and a language costs nothing until it is
imported.

## Versioning

The engine follows semantic versioning. What it promises is what the [API reference](api.md)
lists — every export, its signature and every type it reaches — and the shape of a language's
catalog (`EngineLocale`). While the version is 0.x, a breaking change bumps the minor version
(0.1 → 0.2), so npm's default range (`^0.1.2`) never takes one. Each release is in the
[changelog](CHANGELOG.md).

## License

MIT ([LICENSE](LICENSE)): the code, not the MellowCAD name or logo.

AutoCAD is a registered trademark of Autodesk, Inc. MellowCAD is an independent project, not
affiliated with or endorsed by Autodesk; AutoCAD is named only to describe what it is compatible
with.
