# Japanese (`ja`) — summary

The eighth language after the pilot and the first CJK one: `ja` from nothing to `live` at `/ja` on
20/11/2026, in one session (the Japanese session of the visibility plan, `docs/next-seo.md`, L8),
through skill `add-language`. Its words, sources, register, typography, fonts, input, deviations
and review are `docs/i18n/ja.md`. What did not fit was fixed in the system, never in the
language; each commit says what.

- **`global`, as the owner asked, checked first**: Japanese AutoCAD keeps the English command
  names, aliases (`acad_ja.pgp` = `acad_en.pgp`) and option letters, and words its prompts in
  Japanese (`[元に戻す(U)]`), which `/ja/draw` prints in English: the differences page says so in
  every language. The visibility audit had called it «localized, English names» for that reason.
- **The pack opened, never installed**: the 2027.1 update's `ja-JP` resources and the pack's
  `acad.pgp`, `acad.CUIX` and shared DLLs, paired by id with `propose-interface.mjs --pack`.
- **Tag `ja`, URL `/ja`**, `og:locale` `ja_JP`, «日本語» in the selector, script `japanese`: the
  system's faces, no web font; the card's face cut to its characters.

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `a381f9c3` docs | The type checked against the pack and the help; fonts, IME, search, what Japan searches; `propose-interface.mjs --pack` |
| IME | `60825eae` fix(editor) | `isImeKey`: a composing key is the IME's, in the command line, the dynamic input, the editor's fields and the landing's command box |
| Draft (phases 1–5) | `f4a7c3ee` feat(i18n) | Registered as a draft; the interface from the pack; the site, the editor, the "Use" pages, the 101 command notes and the 12 exercises (eight agents, one brief); the system faces, `:lang(ja)`, the card; a model's second reading and its fixes |
| FAQ | `962825fa` fix(site) | Multileaders and tables no longer among what a DXF leaves out, in every language (found by the second reading) |
| Live (phase 6) | feat(i18n): Japanese goes live | Measured; three cuts on every landing to stay under 250 KiB; `live` |

## What is left

- **The Japanese prompts**: a command language of their own, with the `label(K)` keyword form the
  engine does not write yet, from the tables (`research/strings/all_ja.tsv`) and the console, which
  needs the pack installed on the owner's AutoCAD (ask first). Nothing a user types changes.
- **A native reader** (`docs/i18n/ja.md`, "Review"), and the desktop's words no table holds (the
  ViewCube's compass, the drafting toggles' lines), which need the pack installed too.
- **Each live language still adds some 100 bytes to every landing** (its link in three lists, its
  hreflang link); Korean and Chinese will need the next cut (`docs/i18n/ja.md`, "Going live").
