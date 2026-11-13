# German (`de`) — plan

The third language after the pilot, through skill `add-language`, phase by phase, as Italian did
(`docs/plans/it-language.md`, `docs/i18n/it.md`): `de` from nothing to `live` at `/de`, with the
whole site — the editor, the six "Use" pages written by hand, the command pages' notes, the
exercises, the generated pages — and the command language of AutoCAD 2027 in German. The German
session of the visibility plan (`docs/next-seo.md`, L8). What does not fit is fixed in the system, never
in the language.

## Progress

Each phase lands on `main` when it closes (skill `finish-feature`), so a session that resumes
starts from `main` and from the table below; its work in progress is on the branch
`worktree-german`.

| Phase | State |
| --- | --- |
| 0 | Done 13/11/2026: this plan; `runacc.sh`'s German banner |
| 1 | Done 13/11/2026: registered as a `draft`; `docs/i18n/de.md` |
| 3–4 | Done 13/11/2026: the engine's catalog whole, the desktop's words; `promptTails` |
| 2 | Done 13/11/2026: the site, the editor, the "Use" pages, the 101 command notes, the 12 exercises |
| 6 | Next |

## 0. Research (13/11/2026)

The research — the language pack and its install, `acad.pgp`, the keywords' format, fonts,
plurals, length, input and the search texts — is in `docs/i18n/de.md`.

### Decisions

- **Tag `de`, URL `/de`**, `og:locale` `de_DE`, «Deutsch» in the selector: one German for
  Germany, Austria and Switzerland, as AutoCAD has one (`de-DE`). No prefix map entry. Swiss
  German writes ss for ß; this follows `de-DE`, as AutoCAD does.
- **Register:** Autodesk's, formal: «Sie», as its tables (431 strings) and help address the user;
  the landing too («Geben Sie L ein. Drücken Sie die Eingabetaste.»), the key as Autodesk names it
  in prose (Eingabetaste; `EINGABETASTE` in a prompt).
- **Typography:** „…“ (U+201E, U+201C), ‚…‘ inside, no space before `: ; ! ?`; compounds with
  a hyphen where a name joins a noun (`AutoCAD-Befehle`, `DXF-Datei`). What is copied from AutoCAD
  keeps its own marks (its tables quote with `"`).
- **Order of the phases as Italian's**: 0, 1, 3–4, 2, 5, 6 (the command notes name each command in
  German: `Befehl VERSETZ (OFFSET)`).

## Phases

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `docs` | `runacc.sh`'s German banner; this plan |
| 1 | `feat(i18n)` | `routing.ts` (`de`: `draft`, `localized`, `latin`, «Deutsch», `de_DE`), `catalogs`, the docs' quotes („ “), empty site and editor catalogs, the editor's entry point (`exports`, tsdown, tsconfig, `api.md`, README, changeset), its page in `docs/i18n` |
| 3–4 | `feat(engine)` | the engine's catalog whole: the interface by id from the installed pack (`propose-interface.mjs --like it`), the command language from the console (`console-pair.mjs --select`, `probe.sh --lang de --lang-only`), `getcname` and the DEU help, the messages rebuilt as ICU; its entry point; `· de` in every coverage heading; `germanPrompts.test.ts`; the toggles and readouts from the German desktop |
| 2 | `feat(i18n)` | the site's catalog from the search texts, the editor's catalog by id, the six "Use" pages, the command notes and the exercises (Sonnet agents, one brief, each file read before the commit), the generated pages |
| 5 | — | nothing: latin, left to right; plurals as above |
| 6 | `feat(i18n)` | the gate, a production build (`●`), every language's landing first load before and after (Brotli q11; `/fr` is 508 bytes under 250 KiB: trim before `live` if one passes), screenshots for long words, QWERTZ, `live`; a model's reread; what names or counts the languages by hand (README, packages and guides, issue forms, `docs/i18n/README.md`, the launch kit, the landing's commands section); after the push, `gsc-prioritize.mjs`'s weight for `/de`, IndexNow, the directories' listings |

## Unverified

Until the console has run (phase 4): which of several table strings a prompt uses (221
`several`), the capitals of an `initget` the table does not hold (-OSNAP's three), U's name, and
the names the tables lack.
