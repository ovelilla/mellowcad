# Italian (`it`) — plan

The second language after the pilot, through skill `add-language`, phase by phase, as French did
(`docs/plans/fr-language.md`, `docs/i18n/fr.md`): `it` from nothing to `live` at `/it`, with the
whole site — the editor, the six "Use" pages written by hand, the command pages' notes, the
exercises, the generated pages — and the command language of AutoCAD 2027 in Italian. Session 09
of the visibility plan (`docs/plans/seo/09-italiano.md`). What does not fit is fixed in the
system, never in the language.

## Progress

Each phase lands on `main` when it closes (skill `finish-feature`), so a session that resumes
starts from `main` and from the table below; its work in progress is on the branch
`worktree-it-language`.

| Phase | State |
| --- | --- |
| 0 | Done 11/11/2026: this plan; `runacc.sh`'s Italian banner |
| 1 | Done 11/11/2026: registered as a `draft`; `docs/i18n/it.md` |
| 3–4 | Next |

## 0. Research (11/11/2026)

Moved to `docs/i18n/it.md` in phase 1: the pack and its install, the help, `acad.pgp`, the
keywords' format, fonts, plurals, length, input and the search texts.

## Decisions

- **Tag `it`, URL `/it`**, `og:locale` `it_IT`, «Italiano» in the selector: one Italian (Italy,
  Switzerland, San Marino), as AutoCAD has one (`it-IT`). No prefix map entry.
- **Register** (phase 2, from Autodesk's ITA help and the pack): the editor labels as Italian
  AutoCAD does; the landing addresses the reader with the informal imperative, as Italian software
  sites do («Digita L. Premi Invio. Disegna.»), Autodesk's «Invio» for the key.
- **Typography:** « » without inner spaces, the Italian practice, and no space before `: ; ! ?`;
  what is copied from AutoCAD keeps its own spacing.
- **Order of the phases as French's**: 0, 1, 3–4, 2, 5, 6 (the command notes name each command in
  Italian: `Comando OFFSET`, `Comando TAGLIA (TRIM)`).

## Phases

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `docs` | `runacc.sh`'s Italian banner; this plan |
| 1 | `feat(i18n)` | `routing.ts` (`it`: `draft`, `localized`, `latin`, «Italiano», `it_IT`), `catalogs`, the docs' quotes, empty site and editor catalogs, the editor's entry point (`exports`, tsdown, tsconfig, `api.md`, README, changeset), `docs/i18n/it.md` |
| 3–4 | `feat(engine)` | the engine's catalog whole: the interface by id from the installed pack (`propose-interface.mjs`), the command language from the console (`console-pair.mjs --select`, `probe.sh --lang it --lang-only`), `getcname` and the ITA help, the messages rebuilt as ICU; its entry point; `· it` in every coverage heading |
| 2 | `feat(i18n)` | the site's catalog from the search texts, the editor's catalog by id, the six "Use" pages, the command notes and the exercises (Sonnet agents, one brief, each file read before the commit), the generated pages |
| 5 | — | nothing: latin, left to right; plurals as above |
| 6 | `feat(i18n)` | the gate, a production build (`●`), every language's landing first load before and after (Brotli q11; `/fr` is 130 bytes under 250 KiB: trim before `live` if one passes), screenshots, `live`; the drafting toggles' lines and the cursor's readouts from the Italian desktop (the owner's mouse); what each command words where English shares (`several`); a model's reread; what names or counts the languages by hand (README, packages and guides, issue forms, `docs/i18n/README.md`, the launch kit, the landing's commands section); after the push, `gsc-prioritize.mjs`'s weight for `/it`, IndexNow, Bing, the directories' listings |

## Unverified

Until the console has run (phase 4): which of several table strings a prompt uses (213
`several`), the capitals of an `initget` the table does not hold (-OSNAP's three), U's name, and
the names the tables lack.
