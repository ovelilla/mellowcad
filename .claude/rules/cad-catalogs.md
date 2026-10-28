---
paths:
  - "cad/locales/**"
  - "cad/i18n/**"
  - "cad/application/tools/**"
---

# Engine catalogs, prompts and keywords

The catalog's public contract — `EngineLocale`, `interface` against `commands`, what `names`,
`keywords`, `keywordLabels` and `promptKeywords` hold, a command language complete or absent, ICU
compiled by the host, versioning — is `cad/README.md`. Keep it true; do not repeat it here. Where a
wording comes from: `autocad-research.md`.

## Catalogs

- **Every word the engine shows is in `cad/locales/en.json`**, nowhere else in `cad/`. A tool
  reaches it through `ctx.text` and holds no text: a dynamic-input field names its prompt by id
  (`{ id, prompt: "length", kind }`), worded when the state is built, so switching language rewords
  an open prompt. User data (a block name in a `?` listing) is the only text a tool passes on as is.
- **`domain/` exposes ids, never display names** (colours, linetypes, hatch patterns, `ByLayer`).
  Data names stay data (layer, style and block names, `Standard`, `Continuous`, `ANSI31`); a
  default name is fixed when the object is made, in the command language of that moment.
- **Spanish is Spanish AutoCAD's, copied, never translated**: names from the help pages that share
  the English GUIDs, aliases from its `acad.pgp`, prompts and keyword capitals from its string
  tables and the console (they beat the help). What no source shows is worded in Autodesk's style
  and marked **unverified** in `docs/coverage/`. In Spanish `H` undoes and `U` is UNIR.
- A language translates the whole `interface` but `linetype` and `hatchPattern` (drawing data).
- `names` and `keywords` are words, not compiled messages. Messages are ICU: `{count, plural, …}`,
  never a hand-made plural.
- **After editing `en.json`, `es.json` or `ar.json`, run `npm run locales`** and commit the
  compiled `.ts` too: the engine imports it (no parser ships), and `cad/locales/locales.test.ts`
  fails on drift. That test also holds every command language to English's full list, no name or
  alias shared by two commands, and no two keywords of one prompt on one abbreviation.
- **The catalog's shape is public API**: renaming, moving or removing a key, or changing a
  message's arguments or tags, is a major version (README, "Versioning"). A new vocabulary a host
  shows goes in `EngineNames` and the README's table.
- **Technical values never go through `Intl`**: lengths and angles are `formatLength` /
  `formatAngle` and enter a message formatted; counts go through the formatter (latin digits, no
  grouping). A failure a user reads is a code (`DrawingFileError.code`), worded by the catalog.

## Messages

When a command deliberately does nothing, say so with `ctx.report(ctx.text.message(id, values))`:
silence reads as a bug. The words are AutoCAD's own, in `commands.messages`; if the exact string
cannot be verified, leave the message out, never invent one. A report AutoCAD lays out in
columns or lines (ID, DIST, UCS `?`) is one message with its spaces and `\n` kept.

## Prompts

**A tool names the question it asks** in `question()`, by an id in `commands.prompts` whose
text is AutoCAD's prompt up to the keyword list (`Specify next point or`: no list, no colon). The
runtime builds the rest: `LINE Specify next point or [Undo]:`, the dynamic prompt, the history line.

- **A prompt is never written with `ctx.report`**, with one exception: a prompt the console prints
  again without a new question, written as `ctx.report(text, "prompt")` and left open for the
  answer (`objectSelection.ts`' wrong window corner re-asking `Select objects:`, `PanTool.ts`).
- Return the question of every state, also those answering the same one (LINE's tracking
  offset, the deferred tangent). Convert a command whole: one that names no question shows
  `NAME [keywords]:` and writes no prompt lines.
- A `ToolQuestion` (`{ id, enter }`) shows what Enter keeps: a length (`<10.0000>`), a point or a
  phrase id (`<use first point as displacement>`), or a text as written (`{ name: "0,0,0" }`). A
  keyword Enter keeps is `defaultOption()`'s, unless the prompt names it short (PLAN's
  `<Current>`: a phrase). `tight: true` where the default touches what precedes it
  (`[Zdepth]<0,0,0>:`), `open: true` where no colon follows (`OK? <Y>`): read the table, never
  assume the space or the colon. A prompt that names something carries it in `values`; a name or
  string, `takesSpaces` (d06).
- **A yes-or-no question** lists no keywords: hidden `Yes` and `No`, `enter: { name: "N" }`, and
  `{ refusal: "yesOrNoPlease" }`.
- The `or` belongs to the text: a state that offers none of the keywords AutoCAD lists there takes
  the id without it (`specifyStartPointOfText` beside `specifyStartPointOfTextOr`). A wording no
  source confirms is not invented: return `null` and keep `NAME [keywords]:`.
- A report the answer produces is written after the answered prompt by itself. A table string that
  starts with a space (` Specify second point:`) keeps it in `commands.prompts`.
- Every `Select objects:` is an `ObjectSelector`; a set selected before the command is counted by
  its `preselect`, which also keeps it as the Previous set.

## Keywords

**Options are named by their global keyword, never by a letter.** `commandOptions()` returns
`{ id: "Close" }`, plus `value` when the chip shows a state (`{ id: "Rotate items", value: "Yes" }`,
the value a keyword of the same command). `invokeOption(id)` switches on ids and returns
`"continue"` or `"end"`. The abbreviation (the capitals; digits count, so `3P` is typed whole; `?`
is its own) is resolved by the runtime from `commands.keywords.<NAME>`: comparing a key with a
letter breaks when the language changes. Every keyword a tool offers is in its command's table.

- A keyword AutoCAD answers with a **sub-prompt** (OFFSET's Erase: `Erase source object after
  offsetting? [Yes/No] <No>:`) is a phase whose `question()` names it, with that answer as
  `defaultOption()`, never a chip toggled in place.
- A keyword one prompt spells otherwise (`initget` is per prompt: Spanish FILLET's `[Radio]` at
  `Designe polilínea 2D o`) goes in `commands.promptKeywords.<promptId>`, never a second keyword id.
  Two prompts of one command that spell a keyword apart need prompt ids of their own, even with the
  same words (-VIEW's `viewOption`, `viewOrthographic`). An option spelled at another prompt names
  it (`{ id: "Window", hidden: true, prompt: "selectObjects" }`): the selection modes live once,
  in `promptKeywords.selectObjects`.
- **`initget` against the list.** A keyword listed with a gloss (`Ttr (tan tan radius)`), or listed
  otherwise than declared (TEXT's `TLeft` listed `TL`, ATTDISP's `OFf` listed `OFF`), has a
  `commands.keywordLabels.<NAME>` entry for every command name offering it; the `keywords` word is
  the declared one, which answers and which `Ambiguous response` names. A language labels only what
  English labels (keep English's label even when equal to the word). Spanish often declares
  otherwise where English does not (`Atravesar`, `Actual`): read both tables' `initget`. The
  console outranks the table (PLINE keeps `CEnter`, pline/p103).
- A prompt whose declared order is not the listed one names it in its question (`declared: ["OFF",
  "Normal", "ON"]`), only where two words on offer can be ambiguous.
- A word the `initget` declares and the list leaves out is a **hidden option**, after the shown
  ones (OFFSET's `Thru`, ELLIPSE's `Centre`), only once the console shows what it does; one opening
  an option not built here stays refused and is noted in the coverage entry. Where its letters would
  answer another word, offer it still (hidden, or listed where AutoCAD lists it) and leave it
  `unhandled` in `invokeOption`.
- The runtime matches answers (`matchKeywords`), and two keywords of one prompt may share their
  first letters — AutoCAD asks which (`CEnter or CLose?`): never re-letter one for that, nor for an
  object snap's name (`CEN` at a point prompt is Center). `resolveKeyword` is the stricter match
  for words a tool reads itself (a style name, `?`).
