# Brazilian Portuguese (`pt-BR`) — summary

The pilot of the language system (`docs/next-languages.md`, phase 5): `pt-BR` from nothing to
`live` on 31/10/2026 through skill `add-language`, phase by phase. Its words, sources, deviations,
what stays unverified and its review are `docs/i18n/pt-BR.md`. What did not fit was fixed in the
system (scripts, skills, rules, tests), never in the language; each commit says what.

| Phase | Commits | What |
| --- | --- | --- |
| 0 | `10a39d7a` fix(research), `39ffd677` and `5baacd78` docs | The research and this plan; `open-pack.sh` (a pack opened without installing it, the tables from the update), `forms()` with the language's «ou», `probe.sh`'s language suffixes |
| 1 | `594eb80a` feat(i18n) | Registered as a draft at `/pt-br`: the segment apart from the tag (`localeSegment`, `segmentLocale`, `localeParams()`), the docs' suffixes and a draft's missing "Use" page, `catalogExport`'s `ptBR` |
| 2–3 | `ece5a3da` feat(i18n) | The site, the editor, the four "Use" pages and the engine's interface, from the pack's DLLs and `acad.cuix` |
| 4 | `5b58d009`, `b48a1b5e`, `cc5435a4`, `1afba9df` feat(engine) | The command language from its console (430 probes, `console-pair.mjs`), prompts per command, -OSNAP's three capitals, `promptForms` and `promptKeywordLabels`, the desktop and `answerForms` |
| 5 | — | Nothing: latin, left to right; its plurals in phases 2–4 |
| 6 | feat(i18n): Brazilian Portuguese goes live | Verified, then `live`, below |

## Phase 6, as done

- **Gate and a production build** in a clean worktree: 148 pages, every one `●` but the search's
  function. `/pt-br` and its pages lose `noindex` and join the selector, `hreflang` and the
  sitemap, all read from `LIVE_LOCALES`; `/pt-br/draw`'s HTML carries its own catalogs only.
  «Next up» never listed the language, so it keeps REGION; `CONTENT_UPDATED` was already the day's.
- **Found missing**: the editor's `SnapOverride.pointFilters`, added after phase 2: «Filtros de
  ponto», `ACAD_1863` of the installed pack's `acad.cuix`.
- **Budgets** (`.claude/rules/i18n.md`): the engine catalogs had passed their fixed 8 and 12 KB
  since 9–11/10 (English 24.0, Spanish 28.5, pt-BR 28.6 KB gzipped), growing with each command; a
  catalog is now held against English's (≤ 1.4×, Spanish and pt-BR 1.19) by `cad/size.test.ts`.
  The landing's first load, Brotli: `/` 239.2, `/es` 240.2, `/pt-br` 240.6, `/ar` 263.3 KB, within
  a tenth of 250 and 275 in every language; pt-BR adds 1.4 KB to English, and English grew 7.3 KB
  since 01/10. No static file near 20 MB.
- **What did not fit** (the landing at 360 px, the editor at 1280×720 with every drop-down and
  menu) was the layout's, fixed for every language: the palette toggle «Camadas» (Button's own
  inset), the panel's four tabs (`px-1`), the inquiry figure's «Ponto final» (its view; English's
  "Endpoint" was cut too), the try-it box's example (a smaller placeholder on a phone; Spanish's
  was cut too), the local-first diagram (its links as long as their words), the toolset's lists
  (a name never broken after its hyphen, no line starting with a dot). A palette row's label
  wraps, as English's already did; rule `ui.md` says so now.
- **Dead keys**: ABNT2's compose in the command line and the dynamic input both ways a browser
  delivers them; nothing added (`pt-BR.md`, "Input"; skill `browser-verify`).
- Fixed in the system: tests that named Spanish and Arabic by hand — `lib/docs/check.test.ts`,
  `content/figures.test.ts`, which replays every figure in every routed language now and keeps a
  live figure's tooltips inside it, and `content/diagrams.fixture.ts`, a `Record<AppLocale, …>`;
  skills `add-language` §6, `language-review` §6 and `browser-verify`.
