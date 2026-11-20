# Japanese (`ja`) — plan

The eighth language after the pilot and the first CJK one: `ja` from nothing to `live` at `/ja`,
through skill `add-language`, as the Japanese session of the visibility plan (`docs/next-seo.md`,
L8). The owner's brief (20/11/2026): a `global` language as Arabic, because Japanese AutoCAD keeps
the English command names, checked first. Once docs/i18n/ja.md exists it holds the language's
words, sources and review, and this plan shrinks to a summary.

## The type: `global`, and what Japanese AutoCAD does otherwise

Checked on 20/11/2026 against Autodesk's own files, without installing anything:

- **Autodesk ships AutoCAD 2027 in Japanese** (culture `ja-JP`, one of the 14 in `CULTURES`):
  `Autodesk_AutoCAD_2027_Japanese_Language_Pack.exe`, 246,483,672 bytes, SHA-256
  `4e3527431bbf8f1034e90bfdae9d738a2136b1e11cd0596155f141b7944547a4`, at
  `https://up1.autodesk.com/prd/2027/ACD/D808EB0B-3606-3DD4-A91A-DF098CAA789D/` (ceethreedee.com's
  list, as Hungarian's). Opened with 7-Zip, never run; the tables come from the 2027.1 update's
  `ja-JP/acadlp.adix` (the copy the owner's AutoCAD extracted to its Temp folder), `acad.pgp`,
  `acad.CUIX` and `acadsharedlp.adix` from the pack. Not installed on the owner's AutoCAD: nothing
  here needs its console.
- **The command names are English.** The JPN help titles every command `OFFSET[オフセット]
  (コマンド)` and types `OFFSET`; its sessions echo `Command: OFFSET`.
- **The aliases are English's, letter for letter**: `acad_ja.pgp` against `acad_en.pgp` differs
  only in the prompts of five shell commands (DEL, DIR, NOTEPAD, SH, SHELL), not in one alias.
- **The keyword letters are English's**, in parentheses after a Japanese label:
  `次の点を指定 または [元に戻す(U)]:` (20619), `オフセット距離を指定 または [通過点(T)/消去(E)/画層(L)]
  <通過点>:` (22470), `円の中心点を指定 または [3 点(3P)/2 点(2P)/接、接、半(T)]:` (20410).
- **The prompts and messages are Japanese**: `コマンド:` (20216), `オフセット距離を指定`.

So a Japanese AutoCAD user types exactly what `/draw` takes today — names, aliases, keyword
letters, defaults, the order of the prompts — and reads the prompts in Japanese where `/ja/draw`
will print them in English. That is the deviation of this type, recorded in docs/i18n/ja.md and
on the differences page; it is not forced by the platform but by scope: the Japanese prompts are
a command language of their own (every prompt and message from the tables, the `label(K)` keyword
form the engine cannot write yet, and the console to settle them, which needs the pack installed
on the owner's AutoCAD), and they come later as their own piece of work, without changing a single
thing a user types. The visibility audit had classified Japanese «localized, English names»
(`~/seo-data/audit-2026-11-05/languages.md` B.5) for the same reason.

## The research, item by item

1. **AutoCAD and its pack**: above. Help: `https://help.autodesk.com/cloudhelp/2027/JPN/AutoCAD-Core/files/GUID-<id>.htm`;
   the help MCP answers in `ja_JP`. The interface words (palettes, ribbon, dialogs, menus) are
   the pack's, paired by id with `propose-interface.mjs --pack <folder>` (new option: the pack is
   not installed): engine 205 settled by one source, 211 by several, 90 by none; editor 95, 102,
   89 (`research/proposals/ja-*.md`).
2. **`acad.pgp`**: English's aliases, none meaning another command.
3. **The keywords' format**: Japanese AutoCAD lists `label(K)`, the global keyword's capitals in
   parentheses; `/ja/draw` lists English's `[Undo]`, and the letters typed are the same.
4. **Fonts**: Inter and Geist Mono have no kana or kanji. No web font: the site and the editor
   take the system's Japanese face (Hiragino Sans on Apple, Yu Gothic UI and Meiryo on Windows,
   Noto Sans CJK JP on Android and Linux), what Japanese sites and Autodesk's own JPN pages do —
   a Japanese web font is split into some 120 `unicode-range` files and a page fetches dozens
   (Noto Sans JP's Google CSS), far over the 275 KiB landing. The share card (Satori, no system
   fonts) takes Noto Sans JP 600 cut to the card's characters. Japanese has no italic: the
   synthesized oblique is turned off, and so is negative tracking.
5. **Plurals**: `Intl.PluralRules("ja")` has only `other`: every plural is its `other`.
6. **Length**: shorter than English in characters but full-width, and with no spaces a line
   breaks anywhere (headings take `word-break: auto-phrase`, which Chrome breaks by phrase).
   Checked in the browser: the landing at 360 px, the editor at 1280×720 (rail tooltips, palette
   labels, the status bar, the top bar's palette toggles, drop-downs, the dialogs).
7. **Input (IME)**: Japanese is typed through composition. The command line and the dynamic input
   (`useCommandLineInput`, `useDynamicInput`) took the Enter and Space that confirm a conversion as
   the prompt's: a fix for every language, as a composing keydown (`isComposing`, `keyCode` 229)
   now belongs to the IME; the same in the editor's text fields that commit on Enter (layer and
   style names, the save dialog). Latin typed on the canvas never composes (no editable target).
8. **Search**: the docs' search (zbsearch, `multilingual`) segments Japanese with
   `Intl.Segmenter`: «オフセット», «距離», «円» are found (tested 20/11/2026).

## Search texts

Google's suggestions (`hl=ja`, `gl=jp`, 29 seeds, 20/11/2026), the audit's Trends and results
pages (`languages.md` B.2–B.4: Japan 68 on its index; «cad 無料» 116, «autocad コマンド» 40,
«オートキャド» 186 on its one scale; «cad 無料 ブラウザ» ranks edraw, cad-kenkyujo, cadbim-3dcg,
unicraft, monoist and KulmanLab #9), and a search of the browser-CAD results (Autodesk's viewers,
wavespeed's DXF viewer, Google Drive's CAD Viewer).

- **The generic terms**: «cad 無料» (おすすめ, ブラウザ, 2d, 3d, 初心者, mac), «cad ブラウザ» (無料,
  フリー, ブラウザ上 2d), **«autocad 互換 フリーソフト»** (an AutoCAD-compatible free program: 互換,
  互換 フリー, 互換ソフト 無料), «フリー CAD». «autocad 無料» seeks AutoCAD itself (体験版, 学生): never
  a claim. Home title: «無料のブラウザ CAD｜AutoCAD のコマンドで作図 — MellowCAD»; the description
  with «インストール不要», «AutoCAD 互換の操作», «2D と 3D ソリッド(一部)».
- **The command list**: «autocad コマンド 一覧» (よく使う, pdf): «AutoCAD コマンド一覧».
- **A command**: «autocad オフセット» (やり方, 通過点, 連続, できない), «autocad トリム», «autocad
  ハッチング», «autocad 寸法», «autocad 線分»: the Japanese name AutoCAD's help gives it, after the
  global name as the help writes both («OFFSET[オフセット]»): «AutoCAD の OFFSET[オフセット]コマンド»,
  the metaTitle with «使い方» and the alias.
- **Practice**: «autocad 練習図面 無料», «autocad 練習問題» (初心者, 機械, 土木), «cad 練習図面»:
  «AutoCAD 練習問題・練習図面(無料)».
- **DXF**: «dxf ビューア» (オンライン, ブラウザ, 無料, インストール 不要, web), «dxf 開き方», «dxf
  編集» (ブラウザ, フリー, フリーソフト): «DXF ファイルをオンラインで開く(無料の DXF ビューア)» and
  «DXF をオンラインで編集(無料)».
- **The guides**: «間取り図 cad» (フリー, 作成, 書き方), «autocad 平面図 書き方»: the floor plan;
  «autocad 座標入力»: coordinates; «autocad 3d» (使い方, 作図方法, 2d 3d 変換): 2D to 3D;
  «autocad ショートカットキー 一覧»: shortcuts; «ijcad autocad 違い», «jwcad autocad 違い»: the
  word «違い» for the differences page.
- **Competition**: Jw_cad (free, Windows, the Japanese architecture standard; its users search
  «jw_cad 使い方», «dxf jww 変換»), the AutoCAD-compatible programs (IJCAD, BricsCAD, ARES, DraftSight,
  図脳RAPID, V-nas, TFAS), Autodesk's own web viewer and trial, and a dense Japanese CAD media
  (cad-kenkyujo, capa, winschool). No browser CAD with AutoCAD's commands in Japanese.

## Register

です・ます, as Autodesk's Japanese help; the editor's labels as Japanese AutoCAD words them
(`[ホーム]タブ`, `画層`, `オブジェクト スナップ`), Autodesk's spacing between Japanese and latin
words or digits («AutoCAD で», «3D ソリッド», «[Enter]を押します») and its katakana (`ユーザ`,
`ビューア`). Full-width 、。「」（）where the sentence is Japanese, half-width in what is typed; keys
in brackets as the help: «[Enter]». Commands by their global name, the help's Japanese name in
brackets where it helps («OFFSET[オフセット]コマンド»).

## Phases and commits

1. **Plan** (`docs: Japanese plan`): this file, `propose-interface.mjs --pack`.
2. **IME** (`fix(editor): …`): composition never answers a prompt or commits a field; tests.
3. **Draft** (`feat(i18n): Japanese as a draft at /ja`): phases 1–5 — registration (`global`,
   `ja_JP`, «日本語», script `japanese`); the engine's `interface` from the pack; the site's and the
   editor's catalogs, the "Use" pages, the 101 command notes and the 12 exercises (agents on one
   brief); the system face stack in both layouts, the `:lang(ja)` rules, the card's face; the
   differences page's entry.
4. **Live** (`feat(i18n): Japanese goes live`): measured (every landing before and after: each live
   language adds ~230 bytes to every landing and `/fr` had 121 to spare), the browser pass, a
   model's second reading of a sample by an agent without this plan's conclusions, `live`, the
   brief and `docs/i18n/README.md`.

## Unverified

Every interface term the pack does not give (marked in docs/i18n/ja.md), and the whole site
copy until a native reader reviews it.
