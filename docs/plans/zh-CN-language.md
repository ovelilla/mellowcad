# Simplified Chinese (`zh-CN`) — plan

The tenth language after the pilot and the third CJK one: `zh-CN` from nothing to `live` at
`/zh-cn`, through skill `add-language`, as the Chinese session of the visibility plan
(`docs/next-seo.md`, L8). The owner's brief (21/11/2026): `global` as Japanese and Korean, and the
region decided here (`zh-CN` the likely one by market). Japanese and Korean are the cases it
follows (`docs/plans/ja-language.md`, `docs/plans/ko-language.md`, `docs/i18n/ja.md`,
`docs/i18n/ko.md`). Once docs/i18n/zh-CN.md exists it holds the language's words, sources and
review, and this plan shrinks to a summary.

## Which Chinese: `zh-CN`

Autodesk ships AutoCAD 2027 in both scripts (`CULTURES`: `zh-CN` Simplified, `zh-TW`
Traditional). Simplified first, because its readers are where AutoCAD is used most:

- **Mainland China** is AutoCAD's largest market by users, and the Simplified suggestions run
  deep on every engine read (below): «cad快捷键命令大全», «cad偏移命令快捷键», «cad练图100例». Its
  search is Baidu's, then Bing's (cn.bing.com) and the smaller ones; Google holds 2.3 % (the
  visibility audit, `~/seo-data/audit-2026-11-05/languages.md` B.2: China 40 on its Google-only
  index). Bing already crawls and indexes this site (`docs/next-seo.md` §7). Singapore and
  Malaysia read Simplified too, on Google.
- **Taiwan and Hong Kong** read Traditional, on Google: «autocad 指令» 14 on the audit's one scale.
  `zh-TW` is a later language of its own, cheap after this one (the same structure, the other
  culture's resources), never a conversion of these words: its terms differ (指令 for 命令, 檔案
  for 文件, 圖層 for 图层).
- **Wikipedia's Chinese «AutoCAD» article**, which serves both, had 11,592 views in 12 months
  (Japanese's 7,354).

**Tag `zh-CN`**, Autodesk's culture and the catalogs' form (`pt-BR`'s), **URL `/zh-cn`** (lower
case, `PREFIXES`), `<html lang="zh-CN">`, hreflang `zh-CN`, `og:locale` `zh_CN`, «简体中文» in
the selector (the name a reader looks for beside a future «繁體中文»).

**Unverified: reaching the site from mainland China.** The pages are files served through
Cloudflare's free plan, which has no network in China and is commonly reachable from it, slowly;
nothing on a page calls a service China blocks (no Google Fonts, no third-party script: the fonts
are self-hosted, the analytics same-origin). Not tested from inside China: no session sends the
site's address to an outside testing service without the owner. Baidu's own webmaster tools
(submitting the sitemap) need an account of the owner's: noted for the owner, not done.

## The type: `global`, and what Chinese AutoCAD does otherwise

Checked on 21/11/2026 against Autodesk's own files, without installing anything:

- **The pack**: `Autodesk_AutoCAD_2027_Simplified_Chinese_Language_Pack.exe`, 245,437,712 bytes,
  SHA-256 `20c5eed2bb46f270ddc48954e36df1fda4f44cb8a8c8782b57995c7ed688692a`, at
  `https://up1.autodesk.com/prd/2027/ACD/C30B4111-67F5-3C8A-A546-54354E2B9F16/` (ceethreedee.com's
  list, as Korean's). Opened with 7-Zip's own Linux build, never run. The tables and the
  interface's DLLs come from the 2027.1 update (`AutoCAD_2027.1_Update.exe`, 1,436,060,768 bytes,
  SHA-256 `9adb25e6e9dce620f5635f82e2637331061cebd93eceafcacf4c6cd889618845`, at
  `https://up1.autodesk.com/prd/2027/ACD/DB48EE8C-BA9A-332A-9F6F-3F6296E95477/`): its
  `zh-CN/acadlp.adix` and `acadsharedlp.adix`; `acad.pgp`, `acadSynonymsGlobalDB.pgp` and
  `acad.CUIX` from the pack. Not installed on the owner's AutoCAD: nothing here needs its console.
- **The command names are English.** The CHS help titles every command `OFFSET（命令）` and types
  «OFFSET 命令将重复», with no Chinese name beside it.
- **The aliases are English's, letter for letter**: `acad_zh-CN.pgp` against `acad_en.pgp` differs
  only in the prompts of the shell commands (DEL, DIR, SH, SHELL, START, TYPE, NOTEPAD) and in
  whitespace; its `acadSynonymsGlobalDB.pgp` has no Chinese synonym.
- **The keyword letters are English's**, in parentheses after a Chinese label, as Japanese and
  Korean: `指定下一点或 [放弃(U)]:` (20619), `指定偏移距离或 [通过(T)/删除(E)/图层(L)] <通过>:`
  (22470), `指定圆的圆心或 [三点(3P)/两点(2P)/切点、切点、半径(T)]:` (20410).
- **The prompts and messages are Chinese.**

So a Chinese AutoCAD user types exactly what `/draw` takes, and reads the prompts in Chinese where
`/zh-cn/draw` prints them in English: Japanese's and Korean's deviation, recorded in
docs/i18n/zh-CN.md and on the differences page. Its Chinese prompts are a later piece, with
theirs.

## The research, item by item

1. **AutoCAD and its pack**: above. Help:
   `https://help.autodesk.com/cloudhelp/2027/CHS/AutoCAD-Core/files/GUID-<id>.htm`; the help MCP
   answers in `zh_CN`. Its register: impersonal and plain («可以…», «请按 Enter 键»), a space
   between a Chinese run and a latin word or a number («OFFSET 命令», «按 Enter 键»), full-width
   punctuation. The interface words are the pack's, paired by id with
   `propose-interface.mjs --pack <folder>`: the engine's 237 settled by one source, 190 by
   several, 99 by none; the editor's 102, 95, 89 (`research/proposals/zh-CN-*.md`). The ribbon and
   the menus name each command (`acad.CUIX`: 偏移 for OFFSET, 修剪 for TRIM, 圆角 for FILLET).
2. **`acad.pgp`**: English's aliases, none meaning another command.
3. **The keywords' format**: `label(K)`, as Japanese and Korean; `/zh-cn/draw` lists English's
   `[Undo]`, and the letters typed are the same.
4. **Fonts**: Inter and Geist Mono have no Han characters. No web font: Simplified Chinese's system
   faces (PingFang SC on Apple's systems, Microsoft YaHei on Windows, Noto Sans CJK SC and Source
   Han Sans SC on Android and Linux) behind Inter and Geist Mono, as Japanese's and Korean's; a
   Chinese web font is a hundred `unicode-range` files and more. **The order matters more than
   for Korean**: Han characters are shared with Japanese, and a Japanese face draws 直 and 骨
   otherwise, so `:lang(zh-CN)`'s stack names no Japanese face and `lang` stays on everything
   Chinese. The share card takes Noto Sans SC 600 cut to its characters. No faked italic, no
   tracking.
5. **Plurals**: `Intl.PluralRules("zh-CN")` has only `other`.
6. **Length**: Chinese runs about half English's width or less. It does not space its words, and a
   browser breaks between any two characters, which is right for Chinese (no `keep-all`, unlike
   Korean); full-width punctuation never starts a line (the browser's default `line-break`).
   Checked in the browser: the landing at 360 px, the editor at 1280×720.
7. **Input (IME)**: Chinese is typed through Pinyin (or Wubi) composition, which `isImeKey`
   (Japanese's fix) hands to the IME. A command is typed in the IME's English mode (Shift), as in
   AutoCAD; in Chinese mode the IME composes the letters and turns `,` into `，`, which AutoCAD does
   not take as a separator either (unverified on the desktop: the pack is not installed). Checked
   in Chrome.
8. **Search in the docs**: zbsearch's `multilingual` tokenizer on unspaced Chinese; checked once
   built (偏移, 修剪, 练习).

## Search texts

Baidu's suggestions and Google's (`hl=zh-CN`, `gl=cn` and `gl=sg`), 78 seeds (21/11/2026), in a
scratch file. No results page was read. Google's Chinese suggestions mix Taiwan's words (指令,
档案): the copy uses the mainland's (命令, 文件).

- **The generic terms** say «cad», rarely «autocad»: «在线cad» (画图, 查看, 编辑, 看图), «cad在线»
  (画图工具, 网页版), «网页版cad» (制图, 编辑器), «cad网页版» (在线设计, 在线画图), «免费cad软件»
  (哪个好用), «cad免费版». Baidu's «cad» is mostly viewers («cad快速看图», «cad看图王»), products of
  their own. «autocad在线» and «autocad免费» look for Autodesk's: never a claim. Home title: «在线
  CAD 网页版 — 免费，使用 AutoCAD 命令画图» or the like, from these words.
- **A command** is searched by its ribbon word after «cad», with 命令, 快捷键, 怎么用, 怎么操作:
  «cad偏移命令快捷键», «cad修剪怎么操作», «cad圆角命令怎么用», «cad阵列», «cad镜像», «cad拉伸»; the
  English name too («cad offset», «cad中OFFSET是什么意思», «CAD TR命令»). Titles name both: «AutoCAD
  OFFSET（偏移）命令», the description the alias as a «快捷键».
- **The command list**: «cad快捷键命令大全» (一览表, 图片, 使用方法), «cad命令大全» (图表, 完整版),
  «autocad常用命令大全»: an alias is a «快捷键» to its searchers, as to Korea's.
- **Practice**: «cad练习图» (图纸), «cad练图100例», «cad练习题», «cad绘图练习», «cad入门» (简单图,
  图纸), «cad机械图», «cad户型图», «cad平面图»: the exercises are «练习图».
- **DXF**: «dxf在线查看» (查看器, 预览, 打开), «dxf文件用什么打开», «dxf在线编辑器», «dxf查看器».
- **The guides**: «cad平面图怎么画» and «cad户型图» (the floor plan), «cad坐标» (输入, 相对坐标:
  coordinates), «cad三维» (建模, 三维转二维: 2D to 3D), «cad快捷键» (the keys), «cad入门» (getting
  started); «autocad和中望cad区别», «cad和autocad区别» (ZWCAD 中望, GstarCAD 浩辰, the
  compatible programs sold in China, and 天正 on top of AutoCAD): the differences page.
- **Competition**: the compatible programs, the free viewers (CAD快速看图, CAD看图王), and in the
  browser CAD梦想画图 and 在线CAD; a dense culture of Baidu Zhidao, CSDN and Zhihu answers. None with
  AutoCAD's commands as a Chinese AutoCAD user types them.

## Register

The help's: 书面语, impersonal, plain and dry, no 您 where none is needed; the editor's labels as
Chinese AutoCAD words them (`图层`, `对象捕捉`, `特性`). Full-width punctuation in Chinese text
(，。：；？！、（）“”), a half-width space between Chinese and a latin word or a number, none
before or after full-width punctuation. Keys as the help writes them: «按 Enter 键». Commands by
their global name, the ribbon's word in full-width parentheses at a first mention and in titles
(«OFFSET（偏移）命令»).

## Phases and commits

1. **Plan** (`docs: Chinese plan`): this file.
2. **Draft** (`feat(i18n): Simplified Chinese as a draft at /zh-cn`): phases 1–5 — registration
   (`global`, `zh_CN`, «简体中文», script `chinese`, `/zh-cn`); the engine's `interface` from the
   pack; the site's and the editor's catalogs, the "Use" pages, the command notes and the
   exercises (agents on one brief); the system faces as a third CJK script, `:lang(zh)` rules, the
   card's face; the differences page's entry, in every language.
3. **Live** (`feat(i18n): Simplified Chinese goes live`): `/fr` had some 270 bytes left under its
   250 KiB with Korean live, and a live language adds some 100 to every landing: the next cut on
   every landing first, then measured; the browser pass with the IME; a model's second reading of
   a sample by an agent without this plan's conclusions; `live`, the brief and
   `docs/i18n/README.md`.

## Unverified

Every interface term the pack does not give (marked in docs/i18n/zh-CN.md), the desktop's words no
table holds, reaching the site from mainland China, and the whole site copy until a native reader
reviews it.
