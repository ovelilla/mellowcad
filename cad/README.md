# MellowCAD engine

A 2D drafting engine modelled on AutoCAD: its commands, aliases, prompts, keywords and object
snaps. It has no framework and no DOM outside `adapters/`: `CadEngine` binds it to a canvas, and
everything else — the runtime, the tools, the scene — runs headless, in a browser, on a server or
in a test.

It is the package `@mellowcad/engine`, ESM only, not published yet: a private npm workspace that
the app imports by name.

## Entry points

| Import                            | What                                |
| --------------------------------- | ----------------------------------- |
| `@mellowcad/engine`               | the engine; English is built in     |
| `@mellowcad/engine/locales/<tag>` | one language each: `en`, `es`, `ar` |

Nothing else is public: they are the package's `exports` (`cad/package.json`), no other path under
`cad/` is part of the API, and `cad/entryPoints.test.ts` fails if the app reaches one. What they
export, signature by signature, is `cad/api.md`. No module
has an import-time side effect (`"sideEffects": false`, one built module per source file), so a
bundler keeps only what a page uses, and a language costs nothing until it is imported.

## On a page

```ts
import { CadEngine, createMemoryDrawingStore } from "@mellowcad/engine"

const engine = new CadEngine(canvas, { store: createMemoryDrawingStore() })
engine.subscribe(() => render(engine.getState()))
engine.dispose() // when the canvas goes
```

The defaults are safe on any page:

- **`store`**, where the drawing is autosaved and restored from: none unless given. A change
  still waiting to be written is written on `dispose()` and as the page is hidden or left.
  `createMemoryDrawingStore()` keeps it while the page lives; a `DrawingStore` of the host's
  (`read`, `write`) keeps it anywhere. `createLocalStorageDrawingStore()` is this device's, the
  editor's drawing: an engine given it shares, and overwrites, what the editor saved.
- **`scope`**, what the engine takes keys, the wheel and the right-click from: its canvas unless
  given, and only once it is pressed or focused, until something outside is. Pass the element that
  also holds the host's controls for the canvas, or `"document"` to take the whole page wherever
  focus sits, as the editor does.

## Without a browser

`CadDriver` drives the same engine with no canvas, as a user would: commands typed, clicks in world
coordinates, keys. It runs in Node, on a server or in a test:

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

That is [`examples/engine-node`](../examples/engine-node), run with `node main.ts`. The package's
declarations name DOM types (`CadEngine` takes a canvas): a TypeScript project that checks them
(`skipLibCheck` off) has `"dom"` in its `lib`, even in Node.

React bindings are [`@mellowcad/react`](../packages/react/README.md), and the whole editor is
[`@mellowcad/editor`](../packages/editor/README.md).

## Languages

### Two languages in one

As in AutoCAD's language packs, a language has two parts:

- **the interface** (`interface`): what a host shows around the drawing — tool labels, palette
  rows, the names of snaps, colours, ByLayer, views and the ViewCube's faces;
- **the command language** (`commands`): command names and aliases, prompts, keywords,
  command-line messages, and everything drawn on the canvas.

Spanish has both, from Spanish AutoCAD 2026 (`LINEA`, `DESFASE`, `[Cerrar/desHacer]`). Arabic has
only the interface: there is no Arabic AutoCAD, so its command language is the global one, as for
whoever drafts in Arabic in the English product. In every language `_` and a global name or
keyword reaches the global vocabulary (`_LINE`, `_C`), as AutoCAD scripts rely on; a keyword id
with a space is typed as one word there (`_LINESPACING` for MTEXT's `Line spacing`).

The command language is always drawn left to right; `state.commandLine.lang` is its BCP 47 tag, for
the `lang` of whatever shows it.

### Choosing one

A language is passed, never registered, so one process can draw in several at once:

```ts
import { CadEngine, CadDriver, commandCatalog } from "@mellowcad/engine"
import { ar } from "@mellowcad/engine/locales/ar"
import { es } from "@mellowcad/engine/locales/es"

const engine = new CadEngine(canvas, { locale: es })
engine.setLocale(ar) // rewords the state and an open prompt; the scrollback stays as written

new CadDriver({ locale: es }) // headless
commandCatalog(es) // names, aliases and descriptions, in that language
```

`recordDemo(script, { locale })` and `engineText(locale)` take it too. Load the module only where
it is drawn (`import("@mellowcad/engine/locales/es")`): English needs none.

### The catalog

`cad/locales/en.json` is the reference: its keys are every word the engine says, and its type is
the type of every other language (`EngineLocale`).

```ts
interface EngineLocale {
  tag: string // BCP 47, for Intl: plurals, and digits pinned to latin
  interface: DeepPartial<InterfaceCatalog>
  commands?: DeepPartial<CommandCatalog>
}
```

- `interface` may leave out any key: that key is shown in English, and only that key.
- `commands` is **complete or absent**. Without it, the command language is the global one:
  English's names, aliases, prompts and keywords. With it, the language should name everything —
  the engine's own languages are tested for that — because what it leaves out degrades:
  - a command it does not name is reached by its **global name alone** (`ERASE`, never `E`):
    English's aliases are English's `acad.pgp`, and another language gives the same letters to
    other commands (`U` joins in Spanish);
  - a keyword it does not name is its global word (`Close`);
  - any other message is English's.
- `names` maps a global name to the language's name and then its aliases
  (`"OFFSET": ["DESFASE", "DF", "EQ"]`). No two commands may share one.
- `keywords` gives each command's keywords by their global id, the abbreviation in capitals
  anywhere in the word (`desHacer` → `H`), as AutoCAD's `initget` does. It is typed and
  confirmed with Enter or Space, never run on a letter alone.
- `keywordLabels` gives a keyword the gloss AutoCAD lists it with (`Ttr (tan tan radius)`), or
  the form it lists a keyword declared otherwise in (`TL` for TEXT's `TLeft`), shown in the
  prompt's list, its `<default>` and on its option; the word typed and named when AutoCAD asks
  which was meant stays the keyword. A language labels only what English labels, and lists
  English's label where it gives none.
- `promptKeywords` spells a keyword otherwise at one prompt, by the prompt's id: each AutoCAD
  prompt declares its own, so Spanish FILLET lists `[RAdio]` but `Designe polilínea 2D o
[Radio]:`. A keyword it leaves out is spelled as in `keywords`.
- A linetype's or hatch pattern's name is drawing data and may be left out in every language.

### Messages are compiled by the host

Messages are ICU MessageFormat — next-intl's and FormatJS's syntax: `{count, plural, one {…} other
{…}}`, `{name}`, a `<keywords>` tag. The engine ships only icu-minify's formatter (under 1 KB) and
**no parser**: a parser is FormatJS's, too heavy to send to a browser for messages that never
change at runtime. So a catalog holds compiled messages, and whatever compiles them runs at build
time:

```ts
import compile from "icu-minify/compile" // in the host's build, never in its bundle

const fr: EngineLocale = {
  tag: "fr",
  interface: { byLayer: "DuCalque" }, // no arguments: a plain string is already compiled
  commands: {
    names: { LINE: ["LIGNE", "L"] /* …every command */ },
    messages: { unknownCommand: compile('Commande "{name}" inconnue.') },
  },
}
```

A message takes the arguments English's takes. Lengths and angles arrive already formatted, with a
point and latin digits, as AutoCAD writes them in every language; counts are formatted by the
engine, latin digits and no grouping. In ICU a `<` followed by a letter is a tag: write `'<'`.

The engine's own catalogs are compiled the same way (`npm run locales` writes
`cad/locales/<tag>.ts` from `<tag>.json`).

### Replacing a few words

`extendLocale` lays a host's words over a language, key by key, and returns a new one:

```ts
import compile from "icu-minify/compile" // in the host's build, as above
import { extendLocale } from "@mellowcad/engine"
import { es } from "@mellowcad/engine/locales/es"

const spanish = extendLocale(es, {
  interface: { tool: { line: "Línea recta" } },
  commands: {
    messages: { unknownCommand: compile('No existe el comando "{name}".') },
  },
})
```

What it gives wins; everything else is the base's, and the base is untouched. A list of names is
replaced whole. Giving `commands` to a language without a command language (Arabic) gives it one,
with the rules above — a command it does not name loses its aliases. Use `en` from
`@mellowcad/engine/locales/en` as the base to reword English.

### Names a host shows

What the engine names, the host reads from it and never copies: `EngineState.names`
(`EngineNames`) has, in the interface language,

| Field           | Keyed by                   | Where a host shows it                      |
| --------------- | -------------------------- | ------------------------------------------ |
| `snaps`         | `SnapType`                 | snap menus, the status bar                 |
| `colors`        | `STANDARD_COLORS[].id`     | colour pickers                             |
| `byLayer`       | —                          | colour, linetype and lineweight pickers    |
| `linetypes`     | `LINETYPES[].id`           | linetype pickers (a missing one is its id) |
| `views`         | `ViewPreset`, and `custom` | the view menu (`state.view.preset`)        |
| `viewCubeFaces` | `ViewCubeFace`             | the ViewCube (`state.viewCube`)            |
| `compass`       | `CompassLetter`            | the ViewCube's compass                     |

Tool labels and aliases are `state.tools`; command descriptions are `commandCatalog()`; property
rows come worded in `state.properties.info`. The shortcut menu a right-click opens
(`state.shortcutMenu`) brings the prompt's options worded in the command language
(`option.label`) and the command Repeat runs (`repeat`); its fixed entries come as ids (`action`),
and over dimensions alone the style table's names (`dimensionStyle`, chosen with
`chooseShortcutMenuDimStyle`). The host's own chrome — its buttons, its menus' other items — is
the host's to translate.

## Versioning

The catalog's shape is public API: `EngineLocale` is typed from `en.json`, and a host's catalog is
written against it. Renaming, moving or removing a key, changing a message's arguments or tags, or
changing what a branch holds is a **breaking change, a major version**. Adding a key is not: a
host's language falls back to English for it, or to the global name for a new command.
