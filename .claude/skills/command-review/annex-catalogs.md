# Annex: the catalogs against the 2027 tables

The engine's words were written from AutoCAD 2023's English table and the 2027 release's Spanish
language pack. The installed 2027 is updated, and **an update rewords prompts** (DIMANGULAR's
`Designe primer extremo` became `Designe primer punto final del ángulo`). The sweep finds every
catalog string that is not the current product's. It is an area of its own (template §1.3): the
first review owns it for every command at once; each later review reruns it for its command only.

## 1. Running it

```bash
node scripts/research/catalog-sweep.mjs                           # every key of commands, Spanish
node scripts/research/catalog-sweep.mjs --lang pt-BR              # another language's catalog
node scripts/research/catalog-sweep.mjs --from cad/application/tools/LineTool.ts  # a command's keys
node scripts/research/catalog-sweep.mjs --interface               # the interface too
```

`--from` takes the files that name the command's ids (its tool and the helpers it asks through).
The tables must be current (skill `autocad-research`, "The string tables"); the ones from before
the update stay in `research/strings/previous/`, which is what tells a 2027 rewording from a plain
difference.

## 2. Reading each state

| State          | What it means                                                                                                                                                           | What the review does                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `lang-2027`    | the translation is the release's language pack; the 2027 update reworded it                                                                                             | a finding: the catalog takes the 2027 words, after a console probe of the prompt in its language  |
| `en-2027`      | the English is 2023's; 2027 rewords it                                                                                                                                  | a finding, the same way in en-US                                                                  |
| `lang-differs` | the English matches a 2027 id, the translation matches neither table                                                                                                    | probe it: the console may build the prompt from two strings, or another id is the one asked       |
| `lang-several` | one English head, several translated ones (LINE's `Specify next point or` is `Precise punto siguiente o` at `[Undo]` and `Precise siguiente punto o` at `[Close/Undo]`) | the console says which id each prompt is; two wordings need two prompt ids (`cad-catalogs.md`)    |
| `en-near`      | the table's English differs in case, punctuation or spacing                                                                                                             | compare with the console; a dynamic-input label (`Offset`) usually has no table string of its own |
| `plural`       | an ICU plural                                                                                                                                                           | compared by hand with the table's singular and plural strings                                     |
| `no-source`    | composed by the engine, a label, or worded without a source                                                                                                             | the coverage entry must say **unverified** for any wording no probe settles                       |

Every state but `ok` is checked against the console before it becomes a finding: the table says
how a string is worded, the console which string a prompt uses.

## 3. Beyond the tables

- **Keywords** are not in the sweep: their capitals are per prompt (`initget`). A traced probe of
  each prompt (annex-probes.md) lists `g` (Spanish) and `l` (English): compare with
  `commands.keywords`, `keywordLabels` and `promptKeywords`.
- **`--interface`** matches short words loosely (`Top`, `Radius`): most of its hits are noise. The
  palettes' and ribbon's labels come from `ax26res.dll` and `acappres.dll`, which the tables do
  not hold; a label is compared with the desktop's screenshot instead.
- Some commands keep their words in DLLs the tables do not merge: MATCHPROP's in `acmatchRes.dll`
  (read it with `strtable.mjs`), the Layer Properties Manager's dialogs in
  AcTaskDialogs.resources.dll, a .NET resource read by string search (Properties review).
- **Arabic** has no AutoCAD language pack: its command language is the global one, and the sweep
  does not apply. Its interface is checked against `docs/i18n-glossary.md`.

## 4. Its findings

The first review settles every state the tables can settle — `lang-2027`, `en-2027`,
`lang-differs`, `en-near`, `plural` — and fixes them in one block, each change confirmed by its
probe. `lang-several` and `no-source` need the console prompt by prompt (which id a prompt uses), so each
command's own review settles its keys (row K). A later review that finds its
command's strings already swept only reruns `--from` and reports the cell (row K) as `match`.
