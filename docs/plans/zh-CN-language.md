# Simplified Chinese (`zh-CN`) — summary

The tenth language after the pilot and the third CJK one: `zh-CN` from nothing to `live` at
`/zh-cn` on 22/11/2026, in one session (the Chinese session of the visibility plan,
`docs/next-seo.md`, L8), through skill `add-language`, with Japanese and Korean as its models
(`docs/plans/ja-language.md`, `docs/plans/ko-language.md`). Its words, sources, register,
typography, fonts, input, deviations, measurements and review are `docs/i18n/zh-CN.md`.

- **Simplified first, as the owner leaned to by market**: mainland China, AutoCAD's largest by
  users, searching on Baidu and Bing (which already indexes this site), with Singapore and
  Malaysia on Google. Traditional Chinese (`zh-TW`, Taiwan and Hong Kong, on Google) is a later
  language of its own: its own culture's words (指令, 檔案, 圖層), never a conversion of these.
- **`global`, checked first** against Autodesk's files: Chinese AutoCAD keeps the English command
  names (the CHS help titles `OFFSET（命令）`), aliases (`acad_zh-CN.pgp` = `acad_en.pgp` but the
  shell commands' prompts, no Chinese synonym) and option letters, and words its prompts in
  Chinese (`[放弃(U)]`), which `/zh-cn/draw` prints in English: the differences page says so in
  every language.
- **The pack opened, never installed**: the 2027.1 update's `zh-CN` resources and the pack's
  `acad.pgp` and `acad.CUIX`, paired by id with `propose-interface.mjs --pack`; the commands'
  Chinese names are the ribbon's and the menus' (偏移, 修剪, 圆角; Autodesk's own 拉伸 for both
  STRETCH and EXTRUDE, 缩放 for SCALE and ZOOM, 旋转 for ROTATE and REVOLVE).
- **Tag `zh-CN`, URL `/zh-cn`**, `og:locale` `zh_CN`, «简体中文» in the selector, script
  `simplified-chinese`: the system's Chinese faces and never a Japanese one, no web font; the
  card's face cut to its characters.
- **What China searches** (Baidu's and Google's suggestions): «在线cad», «cad网页版»,
  «cad快捷键命令大全», «cad偏移命令快捷键», «cad练习图», «dxf在线查看».
- **The next cut on every landing**: `/fr` was 9 bytes over its 250 KiB with Chinese a draft; the
  figures' inlined SVG now quotes its attributes singly (`inlineSvg`), so Brotli finds the router
  payload's copy in the HTML's: some 1.7 KB less on each landing (`/fr` 254,200 bytes, 1,800
  under its 250 KiB).

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `d46a8585` docs | The region and the type checked against the pack and the help; fonts, IME, search, what China searches; the briefs' publication state corrected |
| Draft (phases 1–5) | `435cae6c` feat(i18n) | Registered as a draft; the interface from the pack; the site, the editor, the "Use" pages, the 104 command notes and the 12 exercises (nine agents, one brief); a third CJK script's system faces, `:lang(zh)`, the card; the differences page's section in every language |
| Live (phase 6) | feat(i18n): Simplified Chinese goes live | A model's second reading and its fixes in every file; `inlineSvg`, the cut; measured; checked in Chrome with the IME; `live` |

## What is left

- **The Chinese prompts**, with Japanese's and Korean's: a command language of their own (the
  `label(K)` form, the tables `research/strings/all_zh-CN.tsv`, the console with the pack
  installed on the owner's AutoCAD: ask first). Nothing a user types changes.
- **A native reader** (`docs/i18n/zh-CN.md`, "Review"), and the desktop's words no table holds
  (the ViewCube's faces and compass, the dialogs the notes name), which need the pack installed.
- **Reaching the site from mainland China**, untested; Baidu's webmaster tools need the owner's
  account.
- **Traditional Chinese** (`zh-TW`), if the owner wants it: its own pack, research and words.
