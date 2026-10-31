# Languages

The engine speaks English, Spanish and Arabic, with Brazilian Portuguese on its way, and a host can
reword any of it or add a language of its own. A language is passed to the engine, never registered
globally, so one page can run two engines in two languages.

## Two languages in one

As in AutoCAD's language packs, a language has two parts:

- **The interface** (`interface`): what a host shows around the drawing — tool labels, palette
  rows, the names of snaps, colours, ByLayer, views and the ViewCube's faces.
- **The command language** (`commands`): command names and aliases, prompts, keywords,
  command-line messages, and everything drawn on the canvas.

| Language             | Interface        | Command language                                                                          |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| English              | Built in         | Built in, the global one                                                                  |
| Spanish              | `es`             | Spanish AutoCAD's: `LINEA`, `DESFASE`, `[Cerrar/desHacer]`                                |
| Arabic               | `ar`             | The global one, as there is no Arabic AutoCAD                                             |
| Brazilian Portuguese | `pt-BR` (`ptBR`) | Brazilian Portuguese AutoCAD's, in progress: `LINHA`, `DESLOCAMENTO`, `[Fechar/Desfazer]` |

In every language, `_` before a global name or keyword reaches the global vocabulary — `_LINE`,
`_C` — as AutoCAD's scripts and macros rely on. A keyword whose global id has a space is typed as
one word there (`_LINESPACING` for MTEXT's `Line spacing`).

Commands are always written left to right, also on an Arabic page: `state.commandLine.lang` is
the command language's BCP 47 tag, for the `lang` attribute of whatever shows the prompts.

## Choosing one

```ts
import { CadDriver, CadEngine, commandCatalog } from "@mellowcad/engine"
import { ar } from "@mellowcad/engine/locales/ar"
import { es } from "@mellowcad/engine/locales/es"

const engine = new CadEngine(canvas, { locale: es })
engine.setLocale(ar) // rewords the state and an open prompt; the history stays as written

new CadDriver({ locale: es }) // headless
commandCatalog(es) // every command's name, aliases and description, in Spanish
```

`recordDemo(script, { locale })` and `engineText(locale)` take one too. Import a language only
where it is used, or load it on demand with `import("@mellowcad/engine/locales/es")`: English needs
no import.

## Rewording a few words

`extendLocale` lays your words over a language, key by key, and returns a new language:

```ts
import compile from "icu-minify/compile" // at build time, never in the page's bundle
import { extendLocale } from "@mellowcad/engine"
import { es } from "@mellowcad/engine/locales/es"

const spanish = extendLocale(es, {
  interface: { tool: { line: "Línea recta" } },
  commands: {
    messages: { unknownCommand: compile('No existe el comando "{name}".') },
  },
})
```

What you give wins, everything else is the base's, and the base is untouched. A list of names is
replaced whole. To reword English, start from `en` (`@mellowcad/engine/locales/en`).

Giving `commands` to a language without a command language (Arabic) gives it one, with the rules
below: a command it does not name loses its aliases.

## A language of your own

A language is an `EngineLocale`:

```ts
interface EngineLocale {
  tag: string // BCP 47, for plurals; digits stay latin
  interface: DeepPartial<InterfaceCatalog>
  commands?: DeepPartial<CommandCatalog>
}
```

English's catalog, [`locales/en.json`](../locales/en.json), is the reference: its keys are every
word the engine says, and its type is the type of every other language.

- **`interface` may leave out any key.** That key is shown in English, and only that key.
- **`commands` is complete or absent.** Without it, the command language is the global one:
  English's names, aliases, prompts and keywords. With it, the language should name everything,
  because what it leaves out degrades:
  - a command it does not name is reached by its **global name alone** (`ERASE`, never `E`):
    English's aliases are English's, and another language gives the same letters to other
    commands (`U` is JOIN's in Spanish);
  - a keyword it does not name is its global word (`Close`);
  - any other message is English's.
- **`names`** maps a global name to the language's name and then its aliases
  (`"OFFSET": ["DESFASE", "DF", "EQ"]`). No two commands may share one.
- **`keywords`** gives each command's keywords by their global id. The letters a user types are the
  capitals anywhere in the word (`desHacer` → `H`), as AutoCAD's `initget` reads them. A keyword
  is typed and confirmed with Enter or Space, never run on a letter alone.
- **`keywordLabels`** gives a keyword the gloss AutoCAD lists it with (`Ttr (tan tan radius)`), or
  the form it lists a keyword declared otherwise in (`TL` for TEXT's `TLeft`). A language labels
  only what English labels. A label that only repeats the command's word gives way to the word a
  prompt spells its own way (`promptKeywords`).
- **`promptKeywords`** spells a keyword differently at one prompt, by the prompt's id: each
  AutoCAD prompt declares its own, so Spanish FILLET lists `[RAdio]` but
  `Designe polilínea 2D o [Radio]:`. A keyword it leaves out is spelled as in `keywords`.
- A linetype's or hatch pattern's name is drawing data, the same in every language, and may be left
  out.

### Messages are compiled at build time

Messages are ICU MessageFormat, the syntax of next-intl and FormatJS:
`{count, plural, one {…} other {…}}`, `{name}`, and a `<keywords>` tag. The engine ships only a
formatter of under 1 KB, with no parser, so a catalog holds **compiled** messages, and your build
compiles them with `icu-minify/compile`:

```ts
import compile from "icu-minify/compile" // in your build, never in the page's bundle
import type { EngineLocale } from "@mellowcad/engine"

const fr: EngineLocale = {
  tag: "fr",
  interface: { byLayer: "DuCalque" }, // a message without arguments is already compiled
  commands: {
    names: { LINE: ["LIGNE", "L"] /* …every command */ },
    messages: { unknownCommand: compile('Commande "{name}" inconnue.') },
  },
}
```

- A message takes the arguments English's takes.
- Lengths and angles arrive already formatted, with a point and latin digits, as AutoCAD writes
  them in every language. Counts are formatted by the engine: latin digits, no grouping.
- In ICU, a `<` followed by a letter opens a tag: write `'<'`.

## Names a host shows

What the engine names, a host reads from its state and never copies. `state.names`
(`EngineNames`) holds, in the interface language:

| Field           | Keyed by                   | Where a host shows it                      |
| --------------- | -------------------------- | ------------------------------------------ |
| `snaps`         | `SnapType`                 | Snap menus, the status bar                 |
| `colors`        | `STANDARD_COLORS[].id`     | Colour pickers                             |
| `byLayer`       | —                          | Colour, linetype and lineweight pickers    |
| `linetypes`     | `LINETYPES[].id`           | Linetype pickers (a missing one is its id) |
| `views`         | `ViewPreset`, and `custom` | The view menu (`state.view.preset`)        |
| `viewCubeFaces` | `ViewCubeFace`             | The ViewCube (`state.viewCube`)            |
| `compass`       | `CompassLetter`            | The ViewCube's compass                     |

Tool labels and aliases are `state.tools`, command descriptions `commandCatalog()`, and property
rows come worded in `state.properties.info`. A shortcut menu (`state.shortcutMenu`) brings the
prompt's options worded in the command language (`option.label`) and the command its Repeat runs
(`repeat`); its fixed entries come as ids (`action`) for you to word. Your own chrome — its
buttons, its menus' other items — is yours to translate.

## Versioning

The catalog's shape is public API: `EngineLocale` is typed from `en.json`, and your catalog is
written against it. Renaming, moving or removing a key, or changing a message's arguments or tags,
is a breaking change. Adding a key is not: your language falls back to English for it, or to the
global name for a new command.
