---
applyTo: "cad/application/**,cad/locales/**,docs/autocad-coverage.md"
description: "How AutoCAD's behaviour and wording are established before they are built: Autodesk's help, AutoCAD's own console, its string tables, and what is marked unverified."
---

# Researching AutoCAD

Check a behaviour before building it, in this order:

1. **AutoCAD's console** (`accoreconsole.exe`) when an AutoCAD is installed. It answers with the
   real prompts, refusals and results, verbatim. It settles what a command does.
2. **AutoCAD's string tables** (`research/strings/`) for the exact wording, in English and in
   Spanish, by id. A message the English composes from pieces (`Cannot find %s "%s".` +
   `text style`) is composed from the same pieces in Spanish.
3. **Autodesk's help** for what the console cannot show (dialogs, palettes, the cursor). Read it
   with Playwright, as `testing.instructions.md` ("Playwright") says.

What none of them settles is written **unverified** in `docs/autocad-coverage.md`, with what was
seen instead. Cite the table id (`21682`) or the probe in tests and comments, so the next person
can check it again.

## The console

`scripts/research/runacc.sh probe.txt` feeds a file of answers, one per line, to AutoCAD 2023's
console and prints the transcript. Set `ACCORE` to use another install. There is no Spanish
console: `es-ES` still answers in English, so Spanish wording comes from the tables.

- **Keep a probe short.** A refused answer desyncs everything after it.
- **Typed points pick unreliably.** Select with `L` or a `W`/`C` window instead. To pick an arc by
  a typed point, `ZOOM E`, then `VIEWRES Y 20000`, `REGEN` and `PICKBOX 8` first.
- **Some commands hang or are missing.** TEXT's text entry and `LAYER` hang it (use `-LAYER`);
  `3DORBIT` crashes it; VIEW, PURGE, PROPERTIES, MATCHPROP, BLOCKSPALETTE and EATTEDIT are unknown
  to it.
- **Jig prompts echo twice, bare.** Put `(princ "M1")` markers between answers to see which input
  each prompt took. LISP in the middle of a prompt muddles the echo and undo; read state between
  commands instead: `(getvar "VIEWSIZE")` reads the view without making an undo step, and
  `(trans (getvar "LASTPOINT") 1 0)` gives LASTPOINT in the WCS. `QAFLAGS 2` makes LIST stop
  pausing.
- **The console's cursor is a fixed screen point**, about `289.985,116.3034` in the initial view.
  A direct distance takes its heading from it, so tests that reproduce a console value move the
  harness cursor there.
- **Some variables persist in the registry** (TRIMEXTENDMODE, UNDO's Combine and Layer) and
  carry from one probe to the next, including probes run in parallel. Set the ones a probe depends
  on at its start, and restore the defaults after a round: `TRIMEXTENDMODE 1`, `EDGEMODE 0`,
  `PROJMODE 1`, `AUTOSNAP 55`, `UNDOCTL 53`.
- **Menu macros** are in `acad.cuix`, a zip: Ctrl+Z is `_u`, Ctrl+Y and the menu's Redo are
  `^C^C_mredo 1`.

## The string tables

`research/strings/` is gitignored, because it holds Autodesk's text, not ours. Copy it along with
the project. Each table is `id<TAB>text`, with the text JSON-quoted:

| File                             | Source                                                          |
| -------------------------------- | --------------------------------------------------------------- |
| `st2023_en.tsv`                  | `acadres`, AutoCAD 2023 English                                 |
| `st2027_es.tsv`                  | `acadres`, AutoCAD 2027 Spanish                                 |
| `AcDimRes_*`, `acmtedRes_*`, `AcArrayRes_*`, `texteditRes_*` | the dimension, MTEXT, array and TEXTEDIT resources |
| `all_en.tsv`, `all_es.tsv`       | everything above merged                                         |

`node scripts/research/pair.mjs "<regex>"` prints every English string that matches, beside the
Spanish one of the same id. The Spanish came from the AutoCAD 2027 language pack: open
`x64/es-ES/acadlp/acadlp.adix` with 7-Zip and read the string tables of its resource DLLs. The
palettes' labels are in `ax24res.dll` / `ax26res.dll` and `acappres.dll`.

A keyword is the word the table declares for `initget`; the prompt lists its label. How both are
written in the catalogs is in `cad-tools.instructions.md`.
