# Korean (`ko`) — summary

The ninth language after the pilot and the second CJK one: `ko` from nothing to `live` at `/ko` on
20/11/2026, in one session (the Korean session of the visibility plan, `docs/next-seo.md`, L8),
through skill `add-language`, with Japanese as its model (`docs/plans/ja-language.md`). Its words,
sources, register, typography, fonts, input, deviations, measurements and review are
`docs/i18n/ko.md`.

- **`global`, as the owner asked, checked first** against Autodesk's files: Korean AutoCAD keeps
  the English command names (the KOR help titles `OFFSET(명령)`), aliases (`acad_ko.pgp` =
  `acad_en.pgp` but the shell commands' prompts) and option letters, and words its prompts in
  Korean (`[명령 취소(U)]`), which `/ko/draw` prints in English: the differences page says so in
  every language.
- **The pack opened, never installed**: the 2027.1 update's `ko-KR` resources and the pack's
  `acad.pgp` and `acad.CUIX`, paired by id with `propose-interface.mjs --pack`. The help names no
  command in Korean: the ribbon's words (`acad.CUIX`) do.
- **Tag `ko`, URL `/ko`**, `og:locale` `ko_KR`, «한국어» in the selector, script `korean`: the
  system's faces, no web font; the card's face cut to its characters; `keep-all` line breaking.
- **What Korea searches** (Google's and Naver's suggestions): «무료 캐드», «캐드 웹», «오토캐드
  명령어», «캐드 단축키», «캐드 연습도면», «dxf 뷰어», and each command by its ribbon word and its
  English name in Hangul (오프셋, 트림, 필렛).

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `77a3a0b1` docs | The type checked against the pack and the help; fonts, IME, search, what Korea searches |
| Draft (phases 1–5) | `33f9c2f4` feat(i18n) | Registered as a draft; the interface from the pack; the site, the editor, the "Use" pages, the 103 command notes and the 12 exercises (eight agents, one brief); a second CJK script's system faces, `:lang(ko)`, the card; the differences page's section in every language |
| Live (phase 6) | feat(i18n): Korean goes live | A model's second reading and its fixes (every option word checked against the tables); measured, no cut needed; checked in Chrome with the IME; `live` |

## What is left

- **The Korean prompts**, with Japanese's: a command language of their own (the `label(K)` form,
  the tables `research/strings/all_ko.tsv`, the console with the pack installed on the owner's
  AutoCAD: ask first). Nothing a user types changes.
- **A native reader** (`docs/i18n/ko.md`, "Review"), and the desktop's words no table holds (the
  ViewCube's faces and compass, the drafting toggles' lines), which need the pack installed too.
- **`/fr` has some 270 bytes left under 250 KiB**: Chinese, live, will need the next cut on every
  landing (`docs/i18n/ja.md`, "Going live", lists the last ones).
