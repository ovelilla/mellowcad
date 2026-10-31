# Languages

One file per language besides English, `docs/i18n/<tag>.md`, named by its tag in
`i18n/routing.ts`: its words and where each comes from, what it does otherwise than AutoCAD and why,
how it is written, and how far it has been reviewed. A `live` language without one fails
`i18n/languages.test.ts`. Adding a language: skill `add-language`; keeping them current: skill
`language-review`. How the code handles languages: `.claude/rules/i18n.md` and
`.claude/rules/cad-catalogs.md`.

| File    | Language | Command language | Status |
| ------- | -------- | ---------------- | ------ |
| `es.md` | Spanish  | `localized`      | `live` |
| `ar.md` | Arabic   | `global`         | `live` |

A file covers both of its languages (`COMMAND_LANGUAGE`): the **interface language** — palettes,
menus, tooltips, the landing — and, for a `localized` one, the **command language** copied from
its AutoCAD (names, aliases, prompts, keywords), whose names each command's entry in
`docs/coverage/` also gives after `· <tag>`. A `global` language's command language is English
AutoCAD's, and its file says why.

## What a language's file holds

In this order, each section only where it applies:

1. **The status lines**: its `COMMAND_LANGUAGE`, its `LOCALE_STATUS` and since when, and its
   review — by a native speaker or not, and what is still to settle.
2. **Sources** (a `localized` language: its help, its language pack, its console) or **how the
   terms were chosen** (a `global` one).
3. **Deviations**: what it does otherwise than AutoCAD, each forced by the platform or by what does
   not exist, with the `WHY` it has in the code; and what it still lacks.
4. **Interface terms**: a table of `Area | English | <language>`, plus `Source | Verified` for a
   `localized` language.
5. **Register**: how the landing and the editor address the reader, the punctuation, the words
   chosen between variants.
6. **Search texts**: what people search in that language, and the title and description written
   from it.
7. **Command language** (`localized`): where each piece of the catalog comes from, and what no
   source has settled.
8. **Script and font**, **plurals**, **length** and **input** where the language differs from
   English in them: what the research of `add-language` found.
9. **Review**: where a native reviewer should look first.

## Marks

- **Verified** (a `localized` language's terms): **yes**; **partial**, read in prose or an older
  release; **no**, not confirmed anywhere yet — settle it from the product before relying on it.
- **unverified**: a wording no source shows, written in Autodesk's style until a probe settles it.
- **†**: a term still to settle. In a `global` language, a choice between competing terms that a
  native review settles first; in a `localized` one, a word no current source confirms (Spanish's
  aliases from transcriptions of its `acad.pgp`).
- **(C)**, **(M)**, **(L)** (a `global` language's terms): the word courses and books in that
  language use, the standard technical or mathematical term, or worded from the English for want of
  any precedent.

## Never translated

- **Drawing data:** layer, block and style names (`0`, `Standard`, `ISO-25`), linetype names
  (`Continuous`, `Dashed`…) and hatch pattern names (`SOLID`, `ANSI31`). They are the drawing's, as
  in AutoCAD, so `cad/locales/es.json` leaves `interface.linetype` and `interface.hatchPattern` out.
- **Technical values:** a point for decimals, a comma between coordinates, latin digits, in every
  language.
- **Brand and notation:** MellowCAD, AutoCAD, DWG, DXF, the axis names X and Y; GitHub, npm, MIT
  and the packages' names (`@mellowcad/engine`).

## Sources of a `localized` language

- **Autodesk's help** in that language uses the same GUIDs as the English one: the page's URL with
  the language's folder in place of `ENU` (`ESP`, `PTB`, `FRA`, `DEU`, `ITA` answer for 2027).
  Find the page in English, then read it in the language's folder (skill `autocad-research`).
- **The language pack's string tables**: its `acadres.dll` and the other resource DLLs hold every
  prompt, keyword list and message by the same ids as English's, so each pairs with its English
  one (`scripts/research/extract-strings.mjs`, skill `autocad-research`). A message assembled at
  run time from pieces (`%d line%s %sed`) is composed the same way in the translation; one the
  table words twice is marked unverified.
- **Its console and desktop**, once the pack is installed: they settle what a table cannot (which
  string a prompt uses, the `initget` capitals), and beat it (`.claude/rules/autocad-research.md`).

## Search texts

A page's title, description and lead are written from what people search in that language, never
translated from the English ones. Each language's claims are what its research found; redo it
before rewriting the copy.
