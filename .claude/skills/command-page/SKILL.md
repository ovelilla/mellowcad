---
name: command-page
description: Write a command's own page on the site (/docs/commands/<name>) in every live language — its notes (title, lead, options, what it lacks, the questions its searchers ask), the session the engine draws for it, the generated pages and their checks. Use when asked to give a command a page, to take the next batch of command pages, or when docs:check says a command's notes are out of date with its coverage entry.
---

# A command's page

The mechanics are `docs.md`'s ("A command's own page"); this is how to write one. The examples to
copy, structure and tone, are `content/commands/offset.md`, `trim.md` and `extend.md` with their
languages, the pages generated from them and `content/demos/commands/offset.ts`.

## Read first

1. Its entry in `docs/coverage/` (the `###` heading naming it in a code span): **the source of
   truth** for what MellowCAD does. Its Implemented and Missing paragraphs, whole.
2. Its words in the engine: `cad/locales/en.json`, `es.json`, `pt-BR.json` → `commands.names`,
   `commands.keywords` (the keys are the ids the notes use, the values each language's spelling),
   `commands.keywordLabels`, `commands.messages`.
3. What its searchers type, in each language: the visibility audit's autocomplete and results files
   (~/seo-data/audit-2026-11-05/: keywords-en-autocomplete.csv, keywords-es-pt-universe.csv,
   languages-autocomplete-ar.jsonl, the People-also-ask lists in keywords-en-serps.json and
   keywords-es-pt-serp-raw.json), and each language's register, glossary and "Search texts" in
   `docs/i18n/<tag>.md`.
4. `i18n.md`'s "Claims and copy": nothing it does not do; "same order, same option letters", never
   "same prompts"; 3D is "3D solids, still partial".

## The notes, `content/commands/<slug>.md` and one per language

- **Frontmatter**: `title` (the heading and the breadcrumb, the searched words first), `metaTitle`
  (the search result's, at most 48 characters: ` · MellowCAD` makes 60), `description` (at most
  160, its own, what the page answers and a try-it hook), `figure` (the session's caption, no
  double quotes); English only `related` (3–5 global names a reader goes on to) and `coverage`
  (leave it empty: `docs:check` prints the hash); a translation `sourceHash` (`docs:check` prints
  it, and it changes with every edit of the English).
- **Body**: the lead (what it does, what it makes, how it starts and ends), then `## Options` (a
  `###` per keyword id a user picks: sub-answers are told inside their option), `## Missing` (only
  when its coverage entry has one: the gaps a user would notice, in plain words, exactly; the page
  links the entry after it) and `## Questions` (3–5 searched questions, answered true of
  MellowCAD). Section names and option ids are the same in every language; a translation keeps
  the options and the number of questions, and asks what its own searchers ask («¿Cómo se llama
  el comando X en español?»).
- **The engine's words are elements**, never typed: `<Keyword id="Yes" />` (another command's:
  `command="TRIM"`), `<Message id="cannotOffsetObject" />`, `<Command id="EXTEND" />`. Names in
  titles and headings are typed.
- **Titles by language**: English `"<NAME> in AutoCAD"`, its metaTitle adding what the page has
  (`: command, options and alias`); Spanish the everyday word first, Spain's search, then both names
  («Recortar en AutoCAD: comando RECORTA (TRIM)»); Brazilian Portuguese the English name first, but
  where the Portuguese word is the one searched — escala, hachura, polilinha, cotas, the shapes
  (retângulo, polígono, elipse, arco), apagar, explodir: the audit's
  `keywords-es-pt-command-names-autocomplete.csv` counts both — («Comando OFFSET (DESLOCAMENTO) no
  AutoCAD», «Retângulo no AutoCAD: comando RETANGULO (RECTANG)»); Arabic «أمر
  ‹NAME› في الأوتوكاد: ‹term›», its metaTitle with the alias. Every Latin run in Arabic text outside
  code is isolated (FSI…PDI, `i18n.md`).
- Register: English plain and dry; Spanish «tú» with Autodesk's terms (designar, precisar,
  solicitud, Intro, Mayús); Portuguese «você» with Autodesk's («prompt», «faixa de opções»); Arabic
  Modern Standard with the glossary of `docs/i18n/ar.md`.

## The session, `content/demos/commands/<slug>.ts`

Exports `sessions`: the main one named after the slug with `from` its global name, spread into
`COMMAND_SESSIONS` (`content/figures.ts`); one more only where a figure per option says more
(HATCH's pattern gallery, up to 640 wide), or `<slug>Before`, the drawing as it was, drawn above
the session where the change reads best beside it (DIMSPACE, LTSCALE): its caption is the
frontmatter's `before`, in every language. A portable script (`marketing.md`, "Figures"): global
names with `_`, keywords by id, world coordinates, relative points after the first under dynamic
input, `frame` for dimensions; the setup drawn first, then the command as the page explains it.
Print its history in every language before trusting it (`renderSession` and `historyLine`, from a
scratch test you delete): no error line, something drawn.

## Generate and check

1. `npm run docs:check` names what is missing or stale, with the hashes to set.
2. `npx vitest run lib/docs/generate.test.ts -u -t "the page of <NAME>"` writes its pages; the
   reference's (`commands/index`) changes too, as it links the new page: run it once without `-t`
   when the batch is done.
3. Read the generated pages in every language: headings, letters, links, the access list.
4. `npx vitest run content/figures.test.ts lib/docs/sessions.test.ts`, the gate, and
   `finish-feature`. A batch is one commit; the plan's line in `docs/next-seo.md` §8 says what is
   left. Once the owner's push has deployed it, its pages join Google's indexing queue
   (`marketing.md`, "Metadata and SEO").
