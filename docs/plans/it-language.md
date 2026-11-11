# Italian (`it`) — summary

The second language after the pilot: `it` from nothing to `live` at `/it` on 12/11/2026, in one
session over two days (session 09 of the visibility plan, `docs/plans/seo/09-italiano.md`),
through skill `add-language` phase by phase. Its words, sources, register and typography, the
desktop, what stays unverified and its review are `docs/i18n/it.md`. What did not fit was fixed in
the system (scripts, a hook, the catalog's shape), never in the language; each commit says what.

- **Tag `it`, URL `/it`**, `og:locale` `it_IT`, «Italiano» in the selector: one Italian, as
  AutoCAD has one (`it-IT`).
- **The command language before the site's text**, as French: the command notes name each
  command in Italian (`Comando TAGLIA (TRIM) in AutoCAD`).
- **The language pack** was found where French's was (ceethreedee.com's list, now under
  `/cad-news/`) and installed on the owner's AutoCAD, then the 2027.1 update again.

| Phase | Commits | What |
| --- | --- | --- |
| 0 | `a30039ef` docs | The research and this plan; `runacc.sh`'s Italian banner |
| 1 | `de865eff` feat(i18n) | Registered as a `draft` (`localized`, `latin`): `routing.ts`, `catalogs`, the diagrams' fixture, the docs' quotes (« », unspaced) and a label's colon; empty catalogs; the editor's `./locales/it` entry and its changeset; `docs/i18n/it.md` |
| 3–4 | `9d3fcaf2` feat(engine) | The engine's catalog whole: the interface by id from the installed pack, the command language from the console (420 probes, `names/*.it.txt`), the messages rebuilt as ICU; SPLINEDIT's fit data prompt words Delete and Tangents of its own (new `promptKeywords` slots in every language); `· it` in every coverage heading (`coverage-names.mjs`, new); `italianPrompts.test.ts`; the worktree hook links the console's tracer |
| 2 | `8e37f5b4` feat(i18n) | `messages/it.json` from the search texts, the editor's catalog by id, the "Use" pages, the 97 command notes and the 12 exercises (six agents, one brief), the dialogs' titles from the pack's dialog resources, the generated pages |
| 6 | `29cde598` fix(engine) | The desktop: the drafting toggles write `on` and `off`, the ViewCube's back face is RETRO |
| 5 | — | Nothing: latin, left to right; plurals as `it.md` says |
| 6 | feat(i18n): Italian goes live; fix(i18n): Italian reread by a model | Measured, then `live`; the hand-named lists; the reread (`it.md`, "Going live", "Review") |

## What is left

Each item is in `docs/i18n/it.md`, "Unverified": what no probe showed (the unused
`feedback.measure*` readout, our own messages, a few LIST lines and answer forms), and what Italian
words per command where English shares one prompt (ARRAYRECT's and ARRAYPOLAR's grip prompt,
`enterAnOption`), which wait for prompt ids of their own. Skill `language-review` takes the rest,
and keeps the language current after the next AutoCAD update.
