# French (`fr`) — summary

The first language after the pilot: `fr` from nothing to `live` at `/fr` on 9/11/2026, in one
session (session 08 of the visibility plan, `docs/plans/seo/08-frances.md`), through skill
`add-language` phase by phase. Its words, sources, register and typography, deviations, what stays
unverified and its review are `docs/i18n/fr.md`. What did not fit was fixed in the system (scripts,
the generator, skills), never in the language; each commit says what.

- **Tag `fr`, URL `/fr`**, `og:locale` `fr_FR`, «Français» in the selector: one French for every
  French-speaking reader, as AutoCAD has one (`fr-FR`). The tag is the segment: no prefix.
- **The command language before the site's text.** The notes of the 97 command pages name each
  command in French in their title and lead (`Commande DECALER (OFFSET)`), so phases 3–4 came
  before phase 2, unlike pt-BR's order, and the engine's `interface` went with them.

| Phase | Commits | What |
| --- | --- | --- |
| 0 | `2294f28f` docs | The research and this plan; `runacc.sh`'s French banner |
| 1 | `916ed1ef` feat(i18n) | Registered as a `draft` (`localized`, `latin`): `routing.ts`, `catalogs`, the diagrams' fixture, the docs' quotes (« … », spaced with U+00A0); empty catalogs; the editor's `./locales/fr` entry and its changeset; `docs/i18n/fr.md` |
| 3–4 | `56d4d087` feat(engine), `937a6d96` fix(engine), `d5dd288c` fix(research) | The engine's catalog whole: the interface by id from the installed pack (`propose-interface.mjs`, new), the command language from the console (439 probes and our own `names/*.fr.txt`), `getcname` and the FRA help, 89 messages rebuilt as ICU from the console's filled lines; `· fr` in every coverage heading; `frenchPrompts.test.ts`. Then LIST's lines from the console and its formats (1,098 of 1,168 lines), Autodesk's no-break spaces back, and `console-pair.mjs` keeping them |
| 2 | `a0465e3b` feat(i18n) | `messages/fr.json` written from the search texts, the editor's catalog by id, the six "Use" pages, the 97 command notes and the 12 exercises (four agents, one brief), the generated pages; a label's French colon in the generator (`LABEL_END`) |
| 5 | — | Nothing: latin, left to right; plurals as `fr.md` says |
| 6 | feat(i18n): French goes live | Verified, then `live`, below |

## Phase 6, as done

- **Gate and a production build** in a clean worktree: 1,325 pages, every one `○` or `●` but the
  search's function. `/fr` and its pages lose `noindex` and join the selector, `hreflang`, the
  sitemap and `llms.txt`, all from `LIVE_LOCALES`. «Next up» never listed the language;
  `CONTENT_UPDATED` is the day's.
- **Budgets** (`.claude/rules/i18n.md`): French's engine catalog weighs 34.7 KB gzipped, 1.20×
  English's 28.8 (Spanish and pt-BR 1.19), and reaches `/fr/draw` only (`DECALER` in no other
  `draw.html` and no client chunk). No static body near 20 MB: the largest is a 1.8 MB client
  chunk (the docs' server chunks, 13.6 MB, and their 24 MB source maps are not served). The
  landing's first load is below.
- **What did not fit** (the landing at 360 px; the editor at 1280×720, its palettes and menus):
  the header's button wrapped, «Dessiner» since phase 2. The Layers palette's scroll edge cuts
  «Verrouiller» as it cuts whichever column falls there: not a truncation.
- **AZERTY**: Ctrl+&, Ctrl+ç and Ctrl+Z work, and the dead keys compose wherever a field has the
  focus; on the drawing only the Windows way reaches the command line (`fr.md`, "Input"). Found
  for every language: an emulated composition on the drawing is dropped, so skill
  `browser-verify` says so and `pt-BR.md`'s line is corrected.
- **Named by hand**, now with French: the README, the issue forms, the engine's and the editor's
  READMEs, guides and "Languages" pages (the engine's still said four since phases 3–4), the
  launch kit; the landing's commands section names DECALER beside DESFASE and DESLOCAMENTO, in
  every language. The directories' listings are the owner's (`docs/next-seo.md` §7).
- **Indexing**: no URL is queued by hand. `gsc-prioritize.mjs` (in ~/seo-data/scripts) rebuilds
  Google's queue from the published sitemap before each batch, and weighs `/fr` at 0.5, between
  pt-BR's 0.6 and Arabic's 0.35: the French pages join it after their push.

### The landing's first load

Brotli, in KiB, on three production builds:

| Build                      | `/`   | `/es` | `/pt-br` | `/ar` | `/fr` |
| -------------------------- | ----- | ----- | -------- | ----- | ----- |
| `bab3a216`, before French  | 247.7 | 249.0 | 249.2    | 272.0 | —     |
| `a0465e3b`, French a draft | 247.7 | 249.0 | 249.1    | 272.0 | 249.9 |
| French live, as committed  | 247.8 | 249.0 | 249.3    | 272.2 | 249.8 |

French's landing is the wordiest latin one (its HTML 43.1 KiB, Spanish's 42.2): live, `/fr` first
weighed 255,981 bytes, 19 under 250 KiB, so nine of its strings were shortened before the commit
(the hero figure's description, two leads, two bodies, a Status line, three FAQ answers): 255,837
bytes. The others grew only by the clause that names French. Every latin language has been within
a few KiB of 250 since session 04 (6/11): what the landing gains next is measured first, and pays
for itself.

## What is left

Each item is in `docs/i18n/fr.md`: what no probe showed ("Unverified": the dynamic input's
labels, the measure readout, our own messages). What French words per command where English shares
one, and the drafting toggles' lines from the French desktop, were done the same day, after going
live ("Per command", "The desktop"); so was a model's reread of the hand-written French, no native
speaker being available ("Review"), after which `/fr` first weighed 255,870 bytes (`/`, 253,682),
its landing's strings 30 bytes shorter: within a build's noise of the commit's. Skill
`language-review` takes the rest, and keeps the language current after the next AutoCAD update.
