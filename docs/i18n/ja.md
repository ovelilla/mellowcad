# Japanese (`ja`)

> **Command language:** `global`, English AutoCAD's. **Status:** `live` since 20/11/2026.
> **Review:** none by a native speaker yet; a model's second reading (see "Review").

`/ja/draw` is AutoCAD with its interface in Japanese — the palettes, the ribbon's words, the menus,
the tooltips, the status bar and the dialogs as Japanese AutoCAD words them — and a command line
that speaks English AutoCAD: the same names, aliases, prompts and option letters as `/draw`.

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Japanese (culture `ja-JP`):
  `Autodesk_AutoCAD_2027_Japanese_Language_Pack.exe`, 246,483,672 bytes, SHA-256
  `4e3527431bbf8f1034e90bfdae9d738a2136b1e11cd0596155f141b7944547a4`, at
  `https://up1.autodesk.com/prd/2027/ACD/D808EB0B-3606-3DD4-A91A-DF098CAA789D/` (ceethreedee.com's
  "Civil 3D 2027 Download all the extensions"). **Not installed**: opened with 7-Zip's own Linux
  build, never run (20/11/2026). The string tables are the 2027.1 update's (`ja-JP/acadlp.adix` of
  `AutoCAD_2027.1_Update.exe`, which every culture's DLLs ride in): `research/strings/all_ja.tsv`;
  `acad.pgp`, `acad.CUIX` and `acadsharedlp.adix` (`ax26res.dll`…) are the pack's.
- **The interface words** were paired by id, English resource against Japanese, with
  `propose-interface.mjs --lang ja --catalog engine|editor --pack <folder>`
  (`research/proposals/ja-*.md`): the engine's interface 205 labels settled by one wording, 211 by
  several (the catalog row's place decided), 90 by none (ours, marked below); the editor's 95,
  102 and 89.
- **Help.** `https://help.autodesk.com/cloudhelp/2027/JPN/AutoCAD-Core/files/GUID-<id>.htm`; the
  help MCP searches it with `locale: "ja_JP"`. Its titles name each command `OFFSET[オフセット]
  (コマンド)`: the bracket names of the 101 commands with a page come from there (20/11/2026).

## Why `global`

Japanese AutoCAD keeps **the English command names** (the help types `OFFSET`), **English's
aliases letter for letter** (`acad_ja.pgp` differs from `acad_en.pgp` only in the prompts of five
shell commands: DEL, DIR, NOTEPAD, SH, SHELL) and **English's keyword letters**, which it lists in
parentheses after a Japanese label: `次の点を指定 または [元に戻す(U)]:` (20619), `オフセット距離を指定
または [通過点(T)/消去(E)/画層(L)] <通過点>:` (22470), `円の中心点を指定 または [3 点(3P)/2 点(2P)/接、接、半(T)]:`
(20410). So everything a Japanese AutoCAD user types works in `/ja/draw` as in their AutoCAD.

## Deviations

- **The prompts are English** where Japanese AutoCAD words them in Japanese (`[Undo]` where it
  lists `[元に戻す(U)]`). Not forced by the platform: the Japanese prompts are a command language of
  their own — every prompt and message from the tables, the `label(K)` form the engine does not
  write yet, and the console to settle what the tables cannot, which needs the pack installed on
  the owner's AutoCAD. They are the next piece of Japanese (`docs/plans/ja-language.md`); what a
  user types does not change with them. `WHY` in `i18n/engine.ts`; the differences page says it.
- **Missing:** drawing text in Japanese. TEXT and MTEXT draw what is typed, kana and kanji
  included, in the system's face, but measure it as Arial's average glyph (`domain/textFontMetrics.ts`
  covers latin only), so a Japanese label's box and centring are approximate.

## Interface terms

Japanese AutoCAD's own words, paired by id (`P dll id` a string table, `D dll dialog:control` a
dialog, `N assembly key` a .NET resource, `X uid` acad.CUIX, `T AcTaskDialogs` a task dialog read
as text). **†** is ours: no Autodesk resource gives it. The pairing's raw output is
`research/proposals/ja-*.md`; the Properties palette's choice lists are `ax26res`'s
`;`-separated strings, and the help strings in the tools' descriptions keep AutoCAD's clipped
style (`新しい図面ファイルを作成`). None of it was seen on the desktop: the pack is not installed.

| Area | English | Japanese | Source |
| --- | --- | --- | --- |
| Status bar | Model space; MODEL | モデル空間; モデル | P acadres 21395, 20008 |
| Status bar | Coordinates | 座標 | † (ax26res 4 has 座標表示, a palette row) |
| Status bar | Grid; Snap mode; Snap; Grid Snap; Polar Snap | グリッド; スナップ モード; スナップ; グリッド スナップ; PolarSnap | P acadres 21453, 20021, 21452; D dwgaidsRes 130:1109, 130:1106 |
| Status bar | Snap X spacing; Snap X; Polar distance; Polar snap distance | スナップ X 間隔; スナップ X †; 極間隔; 極スナップ間隔 † | D dwgaidsRes 130:1002, 130:1098 |
| Status bar | Ortho mode; Polar tracking; Polar angle; Polar tracking angle | 直交モード; 極トラッキング; 極角度; 極トラッキング角度 † | P acadres 20023, dwgaidsRes 2; D dwgaidsRes 131:1023 |
| Status bar | Object snap; Object snap settings; Object snap tracking | オブジェクト スナップ; オブジェクト スナップ設定; オブジェクト スナップ トラッキング | P dwgaidsRes 5; X XLS_3DSNAP_0009; P acadres 25573 |
| Status bar | Selection cycling; Display selection list box | 選択の循環; 選択循環リスト ボックスを表示 | P dwgaidsRes 1317; D dwgaidsRes 1309:1311 |
| Status bar | Show lineweight; Units; Clean screen; Customization | 線の太さを表示; 単位; フル スクリーン表示; カスタマイズ | P acadres 20049, 4611, 20059; X ID_PanelCustomization |
| Ribbon | Draw; Modify; Annotation; Block; Utilities; Modeling; Solid Editing | 作成; 修正; 注釈; ブロック; ユーティリティ; モデリング; ソリッド編集 | X ID_PanelDraw, ID_PanelModify, ID_PanelBasicAnnotation; P acadres 4601; X ID_PanelStandard_Clipboard, ID_Panel3D_Modeling, ID_PanelSolidEdit |
| Draw | Line; Polyline; Circle; Diameter circle; 2-Point circle | 線分; ポリライン; 円; 円、中心、直径; 円、2 点 | X ID_RBN_CMDBTN_LINE, …PLINE, ID_RBN_SPLITBTN_CIRCLE, ID_CircleDia, ID_Circle2pt |
| Draw | Arc; Start, Center, End arc; Ellipse; Spline | 円弧; 円弧、始点、中心、終点; 楕円; スプライン | X ID_RBN_SPLITBTN_ARC, ID_ArcStCeEn, ID_RBN_SPLITBTN_ELLIPSE_0001; P ax26res 312 |
| Draw | Rectangle; Polygon; Hatch; Text; Multiline text | 長方形; ポリゴン; ハッチング; 文字; マルチ テキスト | X ID_RBN_CMDBTN_RECTANG_0001, …POLYGON_0001, XLS_1709, ACAD_2428, ID_RBN_0020 |
| Modify | Move; Copy; Rotate; Mirror; Scale; Stretch | 移動; 複写; 回転; 鏡像; 尺度変更; ストレッチ | X ID_RBN_CMDBTN_* |
| Modify | Offset; Trim; Extend; Fillet; Chamfer; Erase; Explode; Join | オフセット; トリム; 延長; フィレット; 面取り; 削除; 分解; 結合 | X ID_RBN_CMDBTN_* |
| Modify | Break; Break at point; Array; Rectangular, Polar array | 部分削除; 点で部分削除; 配列複写; 矩形状配列複写, 円形状配列複写 | X ID_RBN_CMDBTN_BREAK, …BREAKSELE; D AcArrayRes 146 |
| Modify | Match properties; Change properties | プロパティ コピー; プロパティ変更 | X ACAD_335, ID_UIE_Ai_propch |
| Clipboard | Copy; Copy with base point; Paste | コピー クリップ; 基点コピー; 貼り付け | X ID_RBN_CMDBTN_COPYCLIP_0002, …COPYBASE_0002, …PASTECLIP_0001 |
| Inquiry | Measure; Measure (segments); Divide; Area; List; ID Point | 計測; メジャー; ディバイダ; 面積; オブジェクト情報; 位置表示 | X ID_RBN_SPLITBTN_MEASURE, ID_RBN_0140, …DIVIDE, …AREA, RBN_01740411, ACAD_189 |
| Block | Create block; Insert block; Purge | ブロック作成; ブロック挿入; 名前削除 | X ID_RBN_SPLITBTN_CREATEBLOCK, MM_1614, ID_RBN_CMDBTN_PURGE |
| Block | MINSERT (the tool, the palette's MInsert Block); its Insertion point X; Columns, Column spacing, Rows, Row spacing | ブロック一括挿入 †; 挿入点 X †; 列, 列の間隔, 行, 行の間隔 † | the help's bracket name (GUID-A780A2FA, 20853); ax26res 299, 42 and 266–269 not read (the pack is no longer opened): the array's rows' words (1189–1195) |
| Annotate | Linear; Aligned; Angular; Radius; Baseline; Continue; Rotated; Leader | 長さ寸法記入; 平行寸法記入; 角度寸法記入; 半径寸法記入; 並列寸法記入; 直列寸法記入; 回転寸法; 引出線記入 | X ID_RBN_CMDBTN_DIM*, XLS_0033, XLS_0203 |
| 3D | Union; Subtract; Intersect; Box; Extrude; Presspull | 和; 差; 交差; 直方体; 押し出し; 境界引き伸ばし | X ID_Union, ID_Subtract, ID_Intersect, ID_RBN_CMDBTN_BOX, ID_RBN_8052, …PRESSPULL |
| Tools | System variables; Viewpoint; Layer (command line) | 変数設定; 3D 視点; 画層(コマンド ライン) † | X ID_Setvar, MM_0539 |
| Snaps | Endpoint; Midpoint; Center; Node; Quadrant; Intersection | 端点; 中点; 中心; 点; 四半円点; 交点 | P acadres 70–75 |
| Snaps | Apparent Intersection; Perpendicular; Tangent; Nearest | 仮想交点; 垂線; 接線; 近接点 | P acadres 32997, 77, 78, 79 |
| Snaps | Insertion; Extension; Parallel | 挿入基点; 延長; 平行 | D dwgaidsRes 135:1055, 135:1067, 135:1060 |
| Snaps | From; Point Filters; Osnap Overrides | 基点設定; XYZ フィルタ; 優先オブジェクト スナップ | X ACAD_3, ACAD_1863, ACAD_2602 |
| Views | Top; Front; Left; SW Isometric | 平面図; 正面図; 左側面図; 南西アイソメ ビュー | P AcVMToolsRes 4230, 4232, 4234, 4982 |
| ViewCube | Faces TOP … RIGHT; compass N E S W | 上 下 前 後 左 右; 北 東 南 西 | P AcVMToolsRes 629–634; D unitsRes 501:1051–1054 (the compass unverified on the desktop) |
| ViewCube | Home; Parallel; Set Current View as Home; WCS; New UCS; Unnamed | ホーム; 平行投影ビュー; 現在のビューをホーム ビューに設定; WCS; UCS を新規作成; 名前なし | P AcVMToolsRes 47021, 47022, 47026, 47009, 47042, 47010 |
| ViewCube | Rotate clockwise (the roll arrows) | 時計回りに回転 | † |
| Navigation bar | Zoom Extents; Window; Previous; In; Out | オブジェクト範囲ズーム; 窓ズーム; 前画面ズーム; 拡大ズーム; 縮小ズーム | P AcVMToolsRes 47098, 47105, 47102, 44021, 44022 |
| Top bar | Application menu; New; Open; Save; Save As | アプリケーション メニュー; 新規作成; 開く; 上書き保存; 名前を付けて保存 | D acadres 7013:1278; X ID_New, ID_Open, ID_Save, ID_Saveas |
| Top bar | Drawing Units…; Object color; Saved on this device | 単位管理…; オブジェクトの色; このデバイスに保存済み † | D unitsRes 500:title; P gridres 109 |
| Command line | Command line; Type a command (LINE, TR, CO…); Command history | コマンド ライン; ここにコマンドを入力 (LINE、TR、CO…); コマンド ヒストリ | P acadres 4233; N AcWindows (by text); P dwgaidsRes 1328 |
| Shortcut menu | Repeat {command}; Deselect All; Properties; Dimension Style | 繰り返し {command}; すべてを選択解除; オブジェクト プロパティ管理; 寸法スタイル管理 | X ACAD_1897, ACAD_1931, ACAD_334, ACAD_2000 |
| Properties | Properties; General; Geometry; Misc | プロパティ; 一般; ジオメトリ; その他 | P AcVMToolsRes 47008, acopmRes 133, ax26res 19, acopmRes 135 |
| Properties | Color; Layer; Linetype; Linetype scale; Lineweight; Thickness; Elevation | 色; 画層; 線種; 線種尺度; 線の太さ; 厚さ; 高度 | P acopmRes 136–140, 175; ax26res 59 |
| Properties | \*VARIES\*; No selection | \*各種\*; 何も選択されていません | P ax26res 782, acopmRes 177 |
| Properties | Rotation; Text height; Text override; Annotative; Associative; Normal X | 回転角度; 文字高さ; 寸法値の優先; 異尺度対応; 自動調整; 法線 X | P ax26res 254, 185, 211; acopmRes 276; D AcDimRes 104:31074; P ax26res 28 |
| Properties | Justify (TEXT) | 左寄せ(L), 中央(MC)… with AutoCAD's own letters | P ax26res 126 |
| Layers | Layers; New layer; Delete layer; Status, Name, On, Lock; Set current | 画層; 画層を新規作成; 画層を削除; 状態, 名前, 表示, ロック; 現在に設定 | X ID_PanelLayers; N AcLayer; D AcDimRes 101:54536 |
| Layers | Layer - Not Deleted; - Current Layer Off; - Name Already Exists | 画層 - 削除できません; 画層 - 現在の画層が非表示; 画層 - 名前が既に存在します | T AcTaskDialogs |
| Layers | Invalid characters in layer name.; the rename hint | 画層名に無効な文字があります。; 選択した画層の名前をもう一度クリックすると名前を変更できます † | N AcLayer LayerErrorInvalidChars |
| Dialogs | Drawing Units; Insertion scale; Sample output; Decimal | 単位管理; 挿入尺度; サンプル出力; 十進表記 | D unitsRes 500; P ax26res 157 |
| Dialogs | Save Drawing As; File name:; Files of type:; Saveas Options; DXF Options; Decimal places of accuracy (0 to 16) | 図面に名前を付けて保存; ファイル名:; ファイルの種類:; 名前を付けて保存オプション; DXF オプション; 精度を入力 (0 から 16) | P acadres 21405; D acadres 131:13008, 131:13009, 2489:title; P acadres 4850; D acadres 5103:958 |
| Dialogs | Point Style; Set Size Relative to Screen | 点スタイル管理; スクリーンに対する相対サイズ | D acddptyperes 101 |
| Dialogs | Properties - Locked objects; Multiline Text - Unsaved Changes; OK; Cancel; Close | プロパティ - ロックされたオブジェクト; マルチ テキスト - 変更が保存されていません; OK; キャンセル; 閉じる | T AcTaskDialogs; D unitsRes 500:1, 500:2; AcDimRes 101:1 |
| Dim styles | Lines; Symbols and arrows; Text; Fit; Primary units | 寸法線; シンボルと矢印; 寸法値; フィット; 基本単位 | P AcDimRes 6000, 6013; D AcDimRes 305:2689; P ax26res 141, 142 |
| Dim styles | Baseline spacing; Offset from dim line; Use overall scale of; Decimal separator | 並列寸法の寸法線間隔; 寸法線からのオフセット; 全体の尺度; 十進数の区切り | D AcDimRes 302:2567, 303:2626, 305:2682, 307:2596 |

Also ours (†): the canvas's name 作図領域; the save state (保存中…, 保存済み); the Blocks palette's
text; the "…of the selected objects" labels; the palette's fold, unfold and width; the Point
Style's 点の表示イメージ; the Styles palette's height hint; the dashed command-line tools'
(コマンド ライン); UCS アイコン(システム変数); 複数回やり直し; 定義点; 1 点目 X/Y (after ax26res 65's
2 点目). Overridden against a single pairing because the row's place says otherwise: `dimrotated`
回転寸法, `setvar` 変数設定, `atLeast` 最小, `uniform` 均一, `controlPointX` 制御点 X. Dialog labels keep
AutoCAD's half-width colon (`ファイル名:`).

## The site's words

The site, the "Use" pages, the 101 command notes and the 12 exercises were written from the
English by agents on one brief (register, typography, the glossary above, the help's command
names, the search texts), each file through `docs:check`. Their choices with no Autodesk word,
for the native reader: 短縮コマンド for alias (the help says コマンド エイリアス; the Japanese web says
短縮コマンド) †, オプションの文字 for the option letters †, the landing's groups 整理 and 問い合わせとビュー †,
CAD オペレータ and メイカー †, the title block's 図番, 改訂, 尺度, シート, the exercises' layers 外形線,
中心線, 隠れ線, 寸法 (JIS drafting) and the floor plan's 壁, ドア, 窓, 寸法, 開閉軌跡 (a door's
swing), 丁番, 投げ縄 (lasso), 長穴 (slot), プーリ (searched as プーリー). Question marks are
half-width, as Autodesk's help writes them.

## Register

- **です・ます**, as Autodesk's Japanese help; plain and dry. The editor's labels as Japanese
  AutoCAD words them.
- **Autodesk's spacing**: a half-width space between Japanese and a latin word or a digit
  («AutoCAD で», «3D ソリッド», «DXF ファイル»), none beside full-width punctuation or brackets
  («OFFSET[オフセット]コマンド», «[Enter]を押します»).
- Full-width 、。「」：; keys and UI labels in half-width brackets as the help («[Enter]», «[ホーム]タブ
  > [修正]パネル»); 「…」 quotes. Autodesk's katakana, without the final long mark: ユーザ, ビューア,
  パラメータ, フォルダ. Technical values as typed (`10,20`, `@5<45`, `0.5`).
- **Commands by their global name**, the help's Japanese name in brackets in titles and at a
  first mention («OFFSET[オフセット]コマンド»).

## Search texts

Google's suggestions (`hl=ja`, `gl=jp`, 29 seeds, 20/11/2026) and the visibility audit's Trends and
results pages (`~/seo-data/audit-2026-11-05/languages.md`, B.2–B.4).

- **The generic terms** are «cad 無料» (おすすめ, ブラウザ, 2d, 3d, 初心者, mac), «cad ブラウザ» (無料,
  フリー), **«autocad 互換 フリーソフト»** (互換 フリー, 互換ソフト 無料) and «フリー CAD»; «インストール
  不要» is how a no-install tool is said. «autocad 無料» looks for AutoCAD itself (体験版, 学生):
  never a claim.
- **A command**: the Japanese word after «autocad» («autocad オフセット», やり方, 通過点, 連続,
  できない; «autocad トリム», «autocad ハッチング», «autocad 寸法», «autocad 線分»). Titles name both,
  the help's way: «AutoCAD の OFFSET[オフセット]コマンド».
- **The command list**: «autocad コマンド 一覧» (よく使う, pdf).
- **Practice**: «autocad 練習図面 無料», «autocad 練習問題» (初心者, 機械, 土木), «cad 練習図面».
- **DXF**: «dxf ビューア» (オンライン, ブラウザ, 無料, インストール 不要), «dxf 開き方»; «dxf 編集»
  (ブラウザ, フリー, フリーソフト).
- **The guides**: «間取り図 cad» and «autocad 平面図 書き方» (the floor plan), «autocad 座標入力»,
  «autocad 3d 使い方» and «autocad 2d 3d», «autocad ショートカットキー 一覧», «autocad 使い方»; the
  differences page answers «… autocad 違い» (IJCAD, Jw_cad, BricsCAD, ARES).
- **The results**: «autocad オンライン» is Autodesk's (five of the top twelve), capa.co.jp,
  winschool; «cad 無料 ブラウザ» edraw, cad-kenkyujo, cadbim-3dcg, unicraft, monoist and KulmanLab
  (#9); «autocad コマンド» Autodesk and a dense Japanese CAD media. Jw_cad (free, Windows) is the
  Japanese architecture standard; IJCAD, BricsCAD, ARES, DraftSight, 図脳RAPID, V-nas and TFAS are
  the AutoCAD-compatible programs searched against it. No browser CAD with AutoCAD's commands.

## Script and font

- **The system's Japanese face**, no web font: `--font-sans` and `--font-mono` take Inter or
  Geist Mono first (latin and digits), then Hiragino Sans, Hiragino Kaku Gothic ProN, Yu Gothic UI,
  Meiryo, Noto Sans CJK JP and Noto Sans JP (`lib/fonts.ts`, `JAPANESE_SYSTEM_FACES`). WHY: a
  Japanese web font is split into some 120 `unicode-range` files (Google's Noto Sans JP), and a page
  fetches dozens; Japanese sites, Autodesk's JPN pages included, use the system's.
- **The share card** (Satori draws no system font) takes Noto Sans JP 600 (SIL OFL) cut to the
  characters of the Japanese cards (`assets/fonts/noto-sans-jp-card-600.woff`,
  `assets/fonts/README.md`), held to them by a test.
- **No italic and no tracking**: Japanese has no italic (the browser slants the glyphs), and the
  headlines' negative tracking crowds kana. `:lang(ja)` in both stylesheets.
- **Line breaks**: a Japanese line breaks between any two characters; headlines take
  `word-break: auto-phrase` (Chrome breaks them by phrase, others as before) and running text
  `line-break: strict`.

## Plurals

`Intl.PluralRules("ja")` has only `other`: a plural is its `other`, and a count is never a noun's
form.

## Input

Japanese is typed through an IME's composition: Enter confirms a conversion and Escape drops it.
A composing key (`isComposing`, or `keyCode` 229, Safari's after `compositionend`) belongs to the
IME, never to the command line, the dynamic input or a field that commits on Enter (a layer's or
a style's name, Save Drawing As): `isImeKey` in `@mellowcad/react` and the editor. On the drawing
no IME composes (no editable target), so a command typed there is latin as typed.

## Command names

The help's Japanese names of the commands with a page (20/11/2026), the brackets of their titles:
-OSNAP[オブジェクト スナップ設定], 3DORBIT[3D オービット], 3DPOLY[3D ポリライン], ARC[円弧], AREA[面積計算], ARRAY[配列複写], ARRAYPATH[パス配列複写], ARRAYPOLAR[円形状配列複写], ARRAYRECT[矩形状配列複写], ATTDEF[属性定義], ATTDISP[属性表示], ATTEDIT[属性編集], BLOCK[ブロック登録], BOX[直方体], BREAK[部分削除], CHAMFER[面取り], CHAMFEREDGE[面取りエッジ], CHPROP[プロパティ変更], CIRCLE[円], COLOR[色設定], CONE[円錐], COPY[複写], COPYCLIP[コピー], CYLINDER[円柱], DIMALIGNED[平行寸法記入], DIMANGULAR[角度寸法記入], DIMBASELINE[並列寸法記入], DIMCONTINUE[直列寸法記入], DIMDIAMETER[直径寸法記入], DIMLINEAR[長さ寸法記入], DIMRADIUS[半径寸法記入], DIMSPACE[寸法線間隔], DIMSTYLE[寸法スタイル管理], DIST[距離計算], DIVIDE[ディバイダ], EATTEDIT[拡張属性編集], ELLIPSE[楕円], ERASE[削除], EXPLODE[分解], EXTEND[延長], EXTRUDE[押し出し], FILLET[フィレット], FILLETEDGE[フィレット エッジ], HATCH[ハッチング], ID[位置表示], INSERT[ブロック挿入], INTERSECT[交差], JOIN[結合], LAYER[画層管理], LEADER[引出線記入], LINE[線分], LINETYPE[線種設定], LIST[オブジェクト情報], LTSCALE[線種尺度], LWEIGHT[線の太さ], MASSPROP[マス プロパティ], MATCHPROP[プロパティ コピー], MEASURE[メジャー], MIRROR[鏡像], MOVE[移動], MTEXT[マルチ テキスト], OFFSET[オフセット], PAN[画面移動], PEDIT[ポリライン編集], PLAN[プラン ビュー], PLINE[ポリライン], POLYGON[ポリゴン], PRESSPULL[境界引き伸ばし], PROPERTIES[オブジェクト プロパティ管理], PTYPE[点スタイル管理], PURGE[名前削除], PYRAMID[角錐], RECTANG[長方形], REDO[やり直し], REGION[リージョン], REVOLVE[回転ソリッド], ROTATE[回転], SCALE[尺度変更], SECTION[断面], SLICE[切断], SNAP[スナップ], SOLIDEDIT[ソリッド編集], SPHERE[球], SPLINE[スプライン], SPLINEDIT[スプライン編集], STRETCH[ストレッチ], STYLE[文字スタイル管理], SUBTRACT[差], TEXT[文字記入], TEXTEDIT[文字編集], TORUS[トーラス], TRIM[トリム], UCS[UCS 管理], UCSICON[UCS アイコン管理], UNDO[元に戻す], UNION[和], UNITS[単位管理], VIEW[ビュー管理], VSCURRENT[ビューポート表示スタイル], WEDGE[くさび], ZOOM[ズーム].

## Going live

On 20/11/2026, from production builds of this worktree (every page `○` or `●` but `/api/search`
and `/mcp`):

- **The landing's first load**, Brotli q11 of every response until the network is idle, in bytes,
  Japanese a draft (`962825fa`) and live with the cuts below: `/` 253,905 → 253,320, `/es`
  255,198 → 254,666, `/pt-br` 255,462 → 254,927, `/ar` 278,828 → 278,310, `/fr` 256,143 →
  255,573 (427 under 250 KiB), `/it` 255,275 → 254,817, `/de` 255,628 → 255,073, `/ru` 289,143 →
  288,500, `/pl` 270,090 → 269,406, `/cs` 269,877 → 269,354, `/hu` 270,390 → 269,750; `/ja`
  256,186 → 255,554, under the 250 KiB of a page with no script font: the system's faces cost it
  nothing.
- **`/fr` was 143 bytes over 250 KiB with Japanese a draft** (`/ja` 186): its `:lang(ja)` rules,
  the routing tables' `ja` and the IME guard of the command box reach every landing. Going live
  added some 230 more (its link in three lists, its hreflang link in the head and the payload).
  Three cuts for every page, none seen: **the commands board's key cap is one utility**,
  `key-cap` in `marketing.css`, where a 190-character class list was written 298 times (151 caps,
  in the HTML and again in the payload): some 500 bytes; **the language links' classes sit on
  their list** (`[&_a]:…`) and **they carry no `hrefLang`** (Google reads the alternates from
  `<link rel="alternate">` and the sitemap): some 200; and the Japanese rules share Arabic's
  where they match. Each live language still adds some 100 bytes to every landing.
- **What did not fit** (the landing at 360 px, the editor at 1280×720): nothing overflows; the H1
  and the headings break by phrase (`auto-phrase`); the share card's headline broke after «[»,
  fixed in `cardSentences`.

## Review

**No native reader yet**: pending, as Arabic's. Instead, on 20/11/2026, **a model's second
reading**: an agent given the task and a sample, not this file's reasoning — the landing's and
the editor's catalogs, six command notes (OFFSET, TRIM, HATCH, LINE, LAYER, DIMLINEAR), three
"Use" pages and two exercises, each beside its English — read as a Japanese technical editor who
uses Japanese AutoCAD. It found two mistranslations (TRIM's «AutoCAD の既定の UCS» for the
Projection option's default value; «バージョン管理された形式», revision control, for a versioned
format), a term Japanese AutoCAD contradicts (孤立領域 where it says 島, 島の検出(I); ギャップ
許容差 for ギャップ許容値(G)), relative input read as absolute in an exercise, and patterns
fixed in every file: エイリアス beside 短縮コマンド, three wordings of "the full name works too",
English colons inside Japanese sentences, オン/オフ where the palette says 表示/非表示, «度» beside
«°». The catalogs of the editor and the engine it found faithful to Japanese AutoCAD.

Where a native reader should look first: the terms marked † above, the search titles and
descriptions (written from the suggestions, never tested against a Japanese searcher), the
exercises' drafting words (JIS usage), and whether 短縮コマンド (the Japanese web's word) should
give way to the help's コマンド エイリアス.
