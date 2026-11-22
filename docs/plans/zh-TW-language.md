# Traditional Chinese (`zh-TW`) — plan

The eleventh language after the pilot and the fourth CJK one: `zh-TW` from nothing to `live` at
`/zh-tw`, through skill `add-language`, as the last language of the visibility plan's criterion
(`docs/next-seo.md`, L8: AutoCAD 2027 ships in it, and it has demand). The owner's brief
(22/11/2026): check first that Autodesk's Traditional Chinese pack is `global` as the Simplified
one is, take the interface's words from it (ax26res, acappres, acad.cuix), its own vocabulary and
never the Simplified words converted character by character, and mark † or unverified what no
source settles. Simplified Chinese is the case it follows (`docs/plans/zh-CN-language.md`,
`docs/i18n/zh-CN.md`, done on 22/11/2026). Once docs/i18n/zh-TW.md exists it holds the language's
words, sources and review, and this plan shrinks to a summary.

## Which Chinese: `zh-TW`, Taiwan first

Autodesk ships one Traditional Chinese culture, `zh-TW` (`CULTURES`), worded as Taiwan words
AutoCAD: 指令 for command, 圖層, 物件 for object, 圖面 for drawing, 檔案, 性質 for properties, 掣點
for grips, 聚合線, 雲形線, 填充線. Its readers:

- **Taiwan**, on Google: the visibility audit (`~/seo-data/audit-2026-11-05/languages.md`, B.2)
  gives it a topic share of 0.78 × Spain's but no index (the World Bank has no Taiwan): with some
  22 million internet users against Spain's 45 million and Google's share alike, about 38 on its
  scale, Poland's and China's order.
- **Hong Kong and Macau** read Traditional too, on Google, and get the same suggestions as Taiwan
  for every seed below; their own words differ here and there (Hong Kong drafting is taught largely
  in English), and Autodesk ships them no culture of their own. The pages are Taiwan's.

**Tag `zh-TW`**, Autodesk's culture and the catalogs' form, **URL `/zh-tw`** (lower case,
`PREFIXES`), `<html lang="zh-TW">`, hreflang `zh-TW`, `og:locale` `zh_TW`, «繁體中文» in the
selector beside «简体中文». No second hreflang (`zh-HK`) on the same pages: every alternate is one
more link on every page of every language, and Hong Kong's Chinese searchers type what Taiwan's
do; revisit if Search Console shows Hong Kong served `/zh-cn`.

## The type: `global`, as Simplified Chinese

Checked on 22/11/2026 against Autodesk's own files, without installing anything:

- **The pack**: `Autodesk_AutoCAD_2027_Traditional_Chinese_Language_Pack.exe`, 245,456,216 bytes,
  SHA-256 `8f97863fa1f323d75ea99d170a7cb85cf612bfff1c3f85520f97a37025a11348`, at
  `https://up1.autodesk.com/prd/2027/ACD/413574A9-36C1-3DC1-B33D-1C42229DD732/` (ceethreedee.com's
  "Civil 3D 2027 Download all the extensions", as Simplified Chinese's). Opened with 7-Zip's own
  Linux build, never run. The tables and the interface's DLLs come from the 2027.1 update
  (`AutoCAD_2027.1_Update.exe`, 1,436,060,768 bytes, SHA-256
  `9adb25e6e9dce620f5635f82e2637331061cebd93eceafcacf4c6cd889618845`): its `zh-TW/acadlp.adix` and
  `acadsharedlp.adix`, `open-pack.sh --lang zh-TW` → `research/strings/all_zh-TW.tsv`; `acad.pgp`,
  `acadSynonymsGlobalDB.pgp` and `acad.CUIX` from the pack. Not installed on the owner's AutoCAD:
  nothing here needs its console.
- **The command names are English.** The CHT help titles every command `OFFSET (指令)` and types
  «為了方便起見，會重複 OFFSET 指令。若要結束指令，請按 Enter。», with no Chinese name beside it.
- **The aliases are English's, letter for letter**: `acad_zh-TW.pgp` against `acad_en.pgp`
  differs only in the prompts of the shell commands (DEL, DIR, SH, SHELL, START, TYPE, NOTEPAD:
  `*作業系統指令:`) and in whitespace; its `acadSynonymsGlobalDB.pgp` has Chinese only in its
  comments.
- **The keyword letters are English's**, in parentheses after a Chinese label:
  `指定下一點或 [退回(U)]:` (20619), `指定偏移距離或 [通過(T)/刪除(E)/圖層(L)] <通過>:` (22470),
  `指定圓的中心點或 [三點(3P)/兩點(2P)/相切、相切、半徑(T)]:` (20410).
- **The prompts and messages are Chinese**, and Taiwan's, not the Simplified ones in other
  characters: 退回 where Simplified has 放弃, 中心點 for 圆心, 相切 for 切点.

So a Taiwanese AutoCAD user types exactly what `/draw` takes, and reads the prompts in Chinese
where `/zh-tw/draw` prints them in English: the deviation Japanese, Korean and Simplified Chinese
already record, on the differences page in every language.

## The research, item by item

1. **AutoCAD and its pack**: above. Help:
   `https://help.autodesk.com/cloudhelp/2027/CHT/AutoCAD-Core/files/GUID-<id>.htm` (OFFSET's
   answers 200, `<title>OFFSET (指令)`); the help MCP answers in `zh_TW`. Its register: impersonal
   and plain, half-width parentheses in its titles, «請按 Enter», a space between a Chinese run and
   a latin word. The interface words are the pack's, paired by id with
   `propose-interface.mjs --lang zh-TW --pack <folder>` (`research/proposals/zh-TW-*.md`): the
   engine's 241 labels settled by one source, 197 by several, 100 by none; the editor's 100, 97,
   89. Where several, **the ids Simplified Chinese's row chose**, read in Traditional's resource
   (a scratch pairing: 401 of the engine's 544 keys and 196 of the editor's 301 settle so), which
   is the row's place again and never Simplified's word: Traditional's own resource at the same
   id. The ribbon and the menus name each command (`acad.CUIX`: 偏移, 修剪, 鏡射 for MIRROR, 擠出
   for EXTRUDE, 迴轉 for REVOLVE, 比例 for SCALE, 填充線 for HATCH).
2. **`acad.pgp`**: English's aliases, none meaning another command.
3. **The keywords' format**: `label(K)`, as Simplified Chinese; `/zh-tw/draw` lists English's
   `[Undo]`, and the letters typed are the same.
4. **Fonts**: Inter and Geist Mono have no Han characters. No web font: Traditional Chinese's
   system faces (PingFang TC on Apple's systems, Microsoft JhengHei on Windows, Noto Sans CJK TC
   and Source Han Sans TC on Android and Linux) behind Inter and Geist Mono, as Simplified's. **No
   Simplified or Japanese face in the stack**: they draw shared Han characters in their own
   region's forms (骨, 直, 角), and Traditional's forms are Taiwan's standard; `lang="zh-TW"` stays
   on everything Chinese. The share card takes Noto Sans TC 600 cut to its characters. No faked
   italic, no tracking; `:lang(zh)`'s rules are already shared with Simplified's.
5. **Plurals**: `Intl.PluralRules("zh-TW")` has only `other`.
6. **Length**: as Simplified's, about half English's width; a browser breaks between any two
   characters, which is right for Chinese. Checked in the browser: the landing at 360 px, the
   editor at 1280×720.
7. **Input (IME)**: Taiwan types through Zhuyin (注音) or Cangjie (倉頡) composition, which
   `isImeKey` hands to the IME. A command is typed in the IME's English mode (Shift), as in
   AutoCAD. Checked in Chrome.
8. **Search in the docs**: zbsearch's `multilingual` tokenizer, as Simplified's; checked once
   built (偏移, 修剪, 練習).

## Search texts

Google's suggestions (`hl=zh-TW&gl=tw` and `hl=zh-HK&gl=hk`), 37 seeds (22/11/2026), in a scratch
file: both regions return the same lists. No results page was read. Taiwan spaces «cad» from the
Chinese about as often as it runs it in, and says 指令 for command, 快捷鍵 for both the aliases and
the keys, 線上 for online, 檢視 for viewing, 開啟 for opening, 教學 for a tutorial.

- **The generic terms**: «線上cad» (繪圖, 檢視, 免費, 編輯), «cad線上» (版, 看, 檢視, 開啟, 編輯),
  «cad 線上免費», «cad 免費» (版, 軟體, 下載), «免費cad軟體» (推薦), «免費cad繪圖軟體», «網頁版cad»;
  «autocad 線上» (版, 免費, 編輯) and «autocad 免費 版» look for Autodesk's: never a claim.
- **A command** is searched by its ribbon word, with 指令 or 快捷鍵: «cad 偏移指令», «cad 修剪指令»,
  «cad 圓角指令», «cad 陣列», «cad 鏡射指令», «cad 偏移快捷鍵», «cad 圓角快捷鍵»; the English name
  too («cad offset 指令», «cad offset 用法»).
- **The command list**: «cad 指令大全», «autocad 指令表», «autocad 指令 對照 表», «cad快捷鍵大全».
- **Practice**: «cad 練習圖», «cad 練習題», «cad 平面圖 練習», «cad 教學», «cad 入門».
- **DXF**: «dxf 線上 檢視», «dxf 線上 開啟», «dxf 線上 編輯», «dxf 檢視器», «dxf檔 線上開啟», «dxf檔
  是什麼».
- **The guides**: «cad 平面圖» (教學, 範例), «cad 座標» (輸入, 指令), «cad 3d» (轉2d, 繪圖, 建模),
  «cad快捷鍵» (設定), «cad 入門».

## Register

The CHT help's: 書面語, impersonal, plain and dry, 您 only where a sentence addresses the reader's
own things; the editor's labels as Taiwanese AutoCAD words them (`圖層`, `物件鎖點`, `性質`).
**Taiwan's usage, never the mainland's**: 指令 (not 命令), 檔案 (not 文件), 物件 (not 对象), 預設,
滑鼠, 螢幕, 軟體, 程式, 資訊, 視窗, 介面, 圖面. Full-width punctuation in Chinese text (，。：；？！、
「」『』), Taiwan's corner quotes rather than “”, a half-width space between Chinese and a latin
word or a number, none next to full-width punctuation. Keys as the help writes them: «按 Enter».
Commands by their global name, the ribbon's word in full-width parentheses at a first mention and
in titles («OFFSET（偏移）指令»).

## Phases and commits

1. **Plan** (`docs: Traditional Chinese plan`): this file.
2. **Draft** (`feat(i18n): Traditional Chinese as a draft at /zh-tw`): phases 1–5 — registration
   (`global`, `zh_TW`, «繁體中文», script `traditional-chinese`, `/zh-tw`); the engine's
   `interface` and the editor's catalog from the pack; the site's catalog, the "Use" pages, the
   104 command notes and the 12 exercises (agents on one brief, from the English, with Taiwan's
   names list and glossary); the system faces as a fourth CJK script, the card's face; the
   differences page's entry, in every language.
3. **Live** (`feat(i18n): Traditional Chinese goes live`): the landings measured against the draft
   (`/fr` was some 1,800 bytes under its 250 KiB with Simplified Chinese live; a live language
   adds some 100 to every landing), the engine's catalog against English's (`cad/size.test.ts`),
   the search index and the export's file count; the browser pass with the IME; a model's second
   reading of a sample by an agent without this plan's conclusions, and its fixes; `live`, the
   brief and `docs/i18n/README.md`. **Not pushed**: `main` holds `29ef9678` and `d5337ab1`, and a
   push is one a day at most with the owner's word (`docs/next-vercel-usage.md` §4); the new URLs
   join the end of the indexing queue (`docs/next-seo.md` §7) once published.

## Unverified

Every interface term the pack does not give (marked in docs/i18n/zh-TW.md), the desktop's words no
table holds (the pack is not installed), Hong Kong's own usage, and the whole site copy until a
native reader reviews it.
