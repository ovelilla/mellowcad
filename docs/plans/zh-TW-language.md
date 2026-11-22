# Traditional Chinese (`zh-TW`) — summary

The eleventh language after the pilot and the fourth CJK one: `zh-TW` from nothing to `live` at
`/zh-tw` on 22/11/2026, in one session (the last language of the visibility plan's criterion,
`docs/next-seo.md`, L8), through skill `add-language`, with Simplified Chinese as its model
(`docs/plans/zh-CN-language.md`). Its words, sources, register, typography, fonts, input,
deviations, measurements and review are `docs/i18n/zh-TW.md`.

- **Taiwan's Chinese**, for Taiwan and Hong Kong on Google, the one Traditional culture Autodesk
  ships; no second hreflang (`zh-HK`): Hong Kong's suggestions are Taiwan's, and each alternate is
  one more link on every page. Revisit if Search Console shows Hong Kong served `/zh-cn`.
- **`global`, checked first** against Autodesk's files, never run: Taiwanese AutoCAD keeps the
  English command names (the CHT help titles a command `OFFSET (指令)`), aliases (`acad_zh-TW.pgp`
  is English's but the shell commands' prompts) and option letters, and words its prompts in
  Taiwan's Chinese (`[退回(U)]`), which `/zh-tw/draw` prints in English: the differences page says
  so in every language.
- **The pack opened, never installed**: the 2027.1 update's `zh-TW` resources and the pack's
  `acad.pgp` and `acad.CUIX`, paired by id with `propose-interface.mjs --pack`; where a label has
  several wordings, the ids Simplified Chinese's row chose, read in Traditional's resource — the
  row's place decided once, the words Taiwan's own (物件, 性質, 掣點, 鏡射, 填充線, 聚合線), never
  Simplified's converted. Taiwan keeps apart what the mainland merges: STRETCH 拉伸 and EXTRUDE
  擠出, SCALE 比例 and ZOOM 縮放, ROTATE 旋轉 and REVOLVE 迴轉.
- **Tag `zh-TW`, URL `/zh-tw`**, `og:locale` `zh_TW`, «繁體中文» in the selector, script
  `traditional-chinese`: the system's Traditional Chinese faces, never a Simplified or Japanese
  one, no web font; the card's face cut to its characters.
- **What Taiwan searches** (Google's suggestions, `gl=tw` and `gl=hk`): «線上cad», «cad 指令大全»,
  «cad 偏移指令», «cad 練習圖», «dxf 線上 檢視».
- **No cut needed**: `/fr` stays 1,593 bytes under its 250 KiB with Traditional Chinese live.

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `fe99dae8` docs | The pack checked `global`; the region, fonts, IME, what Taiwan and Hong Kong search |
| Draft (phases 1–5) | `b3a9756c` feat(i18n) | Registered as a draft; the interface from the pack; the site, the editor, the "Use" pages, the 104 command notes and the 12 exercises (eight agents, one brief); a fourth CJK script's system faces, the card; the differences page's section in every language |
| Live (phase 6) | feat(i18n): Traditional Chinese goes live | A model's second reading and its fixes; measured; checked in Chrome with the IME; `live` |

## What is left

- **The Chinese prompts**, with Japanese's, Korean's and Simplified Chinese's: a command language
  of their own (the `label(K)` form, the tables `research/strings/all_zh-TW.tsv`, the console with
  the pack installed on the owner's AutoCAD: ask first). Nothing a user types changes.
- **A native reader** (`docs/i18n/zh-TW.md`, "Review"), and the desktop's words no table holds
  (the ViewCube's faces and compass, the dialogs the notes name), which need the pack installed.
- **The push**, with the owner's word (`docs/next-vercel-usage.md` §4), and then the new URLs, last
  in Google's indexing queue (`docs/next-seo.md` §7).
