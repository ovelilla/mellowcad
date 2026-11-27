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
| Ribbon's Home tab | Home; Draw, Modify, Annotation, Layers, Block, Properties, Utilities, Clipboard; Pin | ホーム; 作成, 修正, 注釈, 画層, ブロック, プロパティ, ユーティリティ, クリップボード; ピン留め † | X ID_TabHome, ID_PanelDraw … RBN_00011049 and every button's and list member's uid (`ribbon.mjs --cuix` on the pack's acad.CUIX, 2026-11-24); Pin † ours: AutoCAD's pin has no name, the word undoes acadres 49183 `Unpin` |
| Ribbon's other tabs | Insert, Annotate, 3D Tools, View; Retain Attribute Display, Display All Attributes, Hide All Attributes; More Colors...; Select Color...; 2D Wireframe, Hidden, Conceptual | 挿入, 注釈, 3D ツール, 表示; 属性表示指定通り, すべての属性を表示, ずべての属性を非表示; その他の色...; 色選択...; 2D ワイヤフレーム, 隠線処理, コンセプト | X ID_TabInsert, ID_TabAnnotate, ID_TAB_3D_TOOLS, ID_TabView, each panel's and button's uid (acad.CUIX by uid, 2026-11-24); AcWindows.resources.dll's BAML (`AcAttmode1/2/0`, `mMoreColorsLabel`); AcDimRes 318; tables 41794, 41445, 8027; `ずべての属性を非表示` is Autodesk's (for `すべて`), kept as written; the pack's files (`~/autocad-packs`) | no |
| Ribbon's style lists | Manage Text Styles..., Manage Dimension Styles... | 文字スタイル管理..., 寸法スタイル管理... | X AcWindows.resources.dll's BAML (the menu item before `Commands[^^C^^C_STYLE]` and `[^^C^^C_DIMSTYLE]`), 2026-11-26; the pack's files (`~/autocad-packs`) | no |
| Command window | Type a command, Close, Recent Commands | ここにコマンドを入力、閉じる、最近使用したコマンド | X AcWindows.resources.dll's BAML (features/commandline/commandlinecontrol.baml: TextBlock_14, Button_1's and Button_3's ToolTip), 2026-11-26; the pack's files (`~/autocad-packs`) | no |
| Ribbon tooltips | Line's: Creates straight line segments; LINE; Press F1 for more help — and so each button's description (147), a control's own title (18) and the extended paragraph (120) | 直線セグメントを作成; LINE; ヘルプを表示するには F1 キー | X acad.CUIX's MenuGroup.cui (each button's macro: HelpString, CLICommand), AcWindows.resources.dll's BAML (`TT_` controls), AcCommandToolTips.resources.dll's BAML (extended), AdWindows.resources.dll's BAML (`mHelpInfo`): scripts/research/ribbon-tips.mjs, 2026-11-26; the pack's files (`~/autocad-packs`) | no |
| Ribbon's right-click menu | Show Tabs, Show Panels, Show Panel Titles, Close; The Ribbon does not have any tabs or panels currently loaded. | タブを表示, パネルを表示, パネルのタイトルを表示, 閉じる; 現在ロードされているリボンにはタブやパネルが存在しません。 | X AdWindows.resources.dll's BAML (`system:String_99` to `_101`, `_81`), AcWindows.resources.dll's RibbonMenuClose, 2026-11-26; the pack's files (`~/autocad-packs`) | no |
| Quick Access Toolbar's Customize | Customize Quick Access Toolbar; New, Open, Save, Save As..., Undo, Redo, Match Properties, Properties (its list) | クイック アクセス ツールバーをカスタマイズ; 新規作成, 開く, 上書き保存, 名前を付けて保存..., 元に戻す, やり直し, プロパティ コピー, プロパティ | X AdWindows.resources.dll's BAML (`system:String_102`), AcWindows.resources.dll's BAML (the `AcQAT…` items' Text), 2026-11-26; the pack's files (`~/autocad-packs`) | no |
| Ribbon's Array Creation tab | Array Creation; Type, Columns, Items, Rows, Levels, Properties, Close; Rectangular, Polar, Path; Columns: Between: Increment: Total: (Fill:); Associative, Rotate Items, Direction, Method, Divide, Measure, Align Items, Close Array; Column Count: Specifies the number of columns. — and so each field's and toggle's tooltip (20) | 配列複写作成; タイプ, 列, 項目, 行, レベル, オブジェクト プロパティ管理, 閉じる; 矩形状, 円形状, パス; 列: 間隔: 増分: 合計: 間隔: 埋める:; 自動調整, 項目を回転, 方向, 方式, ディバイダ, メジャー, 項目を位置合わせ, 配列複写 を閉じる; 列数: 列数を指定 | X RBN_01740514, RBN_01740500, RBN_01740507, their panels' and buttons' uids (`ribbon.mjs --source`); AcWindows.resources.dll's BAML (the fields' TextBlocks, the types' TextBoxes, the toggles' and methods' texts, `TT_AcRectArrayColumnCount` to `TT_AcArrayCreationClose`), 2026-11-26; the pack's files | no |
| Ribbon's Array tab, the selection's | Array; Total: (Columns' and Rows'); Total Column Distance: Specifies the total distance between the first and last columns.; Total Row Distance: Specifies the total distance between the first and last rows. | 配列複写; 合計:; 列全体の長さ: 列の最初と最後の項目との総距離を指定; 行全体の長さ: 最初と最後の行の全体の長さを指定 | X RBN_01740317, RBN_01740329, RBN_01740323 (the tab); AcWindows.resources.dll's BAML (the Totals' TextBlocks, the same word as Levels'; `TT_AcRectArrayColumnSpan`, `TT_AcArrayRowSpan`), 2026-11-27; the pack's files | no |
| Ribbon's Hatch Creation tab | Hatch Creation; Boundaries, Pattern, Properties, Close; Pick Points, Select, Solid, Pattern, Angle, Close Hatch Creation; Hatch Pattern Scale: Expands or contracts a predefined or custom hatch pattern — and so each control's tooltip (8) | ハッチング作成; 境界, パターン, プロパティ, 閉じる; 点をクリック, 選択, 塗り潰し, パターン, 角度, ハッチング作成 を閉じる; ハッチング パターンの尺度: 定義済みまたはカスタム ハッチング パターンを拡大/縮小 | X RBN_01738148, its panels' and buttons' uids (`ribbon.mjs --source`), Close Hatch Creation's break (`&#xD;`); AcWindows.resources.dll's `TT_AcHatchPickPointsButton` to `TT_AcHatchScaleSpinner` (Solid's, Pattern's and Scale's names their titles), MM_1928's HelpString, 2026-11-26; the pack's files | no |
| Ribbon's Text Editor tab | Text Editor; Style, Paragraph, Close; Justification, Close Text Editor; Text Style; Text Height: Sets the character height in drawing units for new or selected text; Top Left TL to Bottom Right BR (Justification's list, 9); Multiline Text - Text Style Change: This change will affect all text objects using this style, not just the selection. Do you want to change the text style?; Yes, No | テキスト エディタ; 文字スタイル, 段落, 閉じる; 位置合わせ, テキスト エディタ を閉じる; 文字スタイル; 文字高さ: 新しいまたは選択した文字の文字高さを作図単位で設定します; 左上 TL, 中心上 TC, 右上 TR, 左中央 ML, 中央 MC, 右中央 MR, 左下 BL, 中心下 BC, 右下 BR; マルチ テキスト - 文字スタイルの変更: この変更は、選択した文字オブジェクトだけでなく、このスタイルを使用するすべての文字に反映されます。文字スタイルを変更しますか?; はい, いいえ | X ID_MText_Tab, ID_PanelIPE_Style, ID_PanelIPE_Paragraph, ID_PanelIPE_Close, AcIPEJustificationMenu, AcIPECloseButton, AcIPEFontStyleGallery (`ribbon.mjs --source`), Close Text Editor's break (`&#xD;`), Text Style's joined (Text Style's break joined with no space, as the panel's `文字スタイル`); AcWindows.resources.dll's `TT_AcIPEFontSizeCombo` (Text Height's name its title); P acmtedRes 1024–1032 (as is, the tab and the two letters); T AcTaskDialogs TaskDialog_7 (Yes, No the Unsaved Changes dialog's), 2026-11-26; the pack's files | no |
| Viewport controls | Visual Style Controls (the style label's name); (Fast), after a style's name | 表示スタイル コントロール; (高速) | P acadres 62833; P acadres 18992 (the viewport controls' label off 2D Wireframe, desktop solid-inquiry/d03, d11), 2026-11-26 | no |
| Ribbon's minimize button | Show Full Ribbon; Minimize to Tabs, Minimize to Panel Titles, Minimize to Panel Buttons, Cycle through All | リボン全体を表示; タブのみを表示, パネル タイトルのみを表示, パネル ボタンのみを表示, すべてを循環 | X AdWindows.resources.dll's BAML (`ID_MinimizeToTabs`, `ID_MinimizeToPanelTitles`, `ID_MinimizeToPanelButtons`, `ID_CycleThroughAll`, `system:String_83`), 2026-11-24; the pack's files (`~/autocad-packs`) | no |
| Quick Access Toolbar's lists | Undo 1 command, Undo 3 commands; Redo 1 command, Redo 3 commands; Group of commands; - Mark - | 1 個のコマンドを元に戻す; 3 個のコマンドを元に戻す; 1 個のコマンドをやり直す; 3 個のコマンドをやり直す; Group of commands; - Mark - | P acadres 4853–4856 (two forms, 1 and the rest, as AutoCAD's), 4860, 4861 (the last two English's: no command language here); desktop 2026-11-25 (es) | yes |
| Application menu | Drawing Utilities; Units; Drawing; Other Formats; Open Documents; each page's heading and descriptions | 図面ユーティリティ; 単位設定; 図面; その他の形式; 開いているドキュメント; … | X AcWindows.resources.dll's BAML (`AcNew` to `AcDrawingUtilities_Units`: name and description; New ▸ Drawing's without the template and Save As' two without DWG, DWT and DWS: this program chooses none and writes neither), AdWindows.resources.dll's `system:String_95`; the pack's files (`~/autocad-packs`) | yes |
| Title bar's title | A new drawing's name (Drawing1.dwg) | Drawing1.dwg | P acadres 4125 is `Drawing.dwg` in the pack's table too, and the language has no command language here | yes |
| Title bar's Help ▾ | Help; Send Feedback | ヘルプ; フィードバックを送信 | X ACAD_379 (`ID_Help`, the Help menu's first item), XLS_7254 (`ID_SendFeedback`); the pack's files (`~/autocad-packs`) | yes |
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
| Title bar | Application menu; New; Open; Save; Save As | アプリケーション メニュー; 新規作成; 開く; 上書き保存; 名前を付けて保存 | D acadres 7013:1278; X ID_New, ID_Open, ID_Save, ID_Saveas |
| Title bar | Object color; Saved on this device | オブジェクトの色; このデバイスに保存済み † | P gridres 109 |
| Command line | Command line; Command history | コマンド ライン; コマンド ヒストリ | P acadres 4233; P dwgaidsRes 1328 |
| Shortcut menu | Repeat {command}; Deselect All; Properties; Dimension Style | 繰り返し {command}; すべてを選択解除; オブジェクト プロパティ管理; 寸法スタイル管理 | X ACAD_1897, ACAD_1931, ACAD_334, ACAD_2000 |
| Properties | Properties; General; Geometry; Misc | プロパティ; 一般; ジオメトリ; その他 | P AcVMToolsRes 47008, acopmRes 133, ax26res 19, acopmRes 135 |
| Properties | Color; Layer; Linetype; Linetype scale; Lineweight; Thickness; Elevation | 色; 画層; 線種; 線種尺度; 線の太さ; 厚さ; 高度 | P acopmRes 136–140, 175; ax26res 59 |
| Properties | \*VARIES\*; No selection | \*各種\*; 何も選択されていません | P ax26res 782, acopmRes 177 |
| Properties | Rotation; Text height; Text override; Annotative; Associative; Normal X | 回転角度; 文字高さ; 寸法値の優先; 異尺度対応; 自動調整; 法線 X | P ax26res 254, 185, 211; acopmRes 276; D AcDimRes 104:31074; P ax26res 28 |
| Properties | Justify (TEXT) | 左寄せ(L), 中央(MC)… with AutoCAD's own letters | P ax26res 126 |
| Layers | Layers; Status, Name, On, Lock (the toolbar: Layer Properties Manager, below) | 画層; 状態, 名前, 表示, ロック | X ID_PanelLayers; N AcLayer; D AcDimRes 101:54536 |
| Layers | Layer - Not Deleted; - Current Layer Off; - Name Already Exists | 画層 - 削除できません; 画層 - 現在の画層が非表示; 画層 - 名前が既に存在します | T AcTaskDialogs |
| Layers | Invalid characters in layer name.; the rename hint | 画層名に無効な文字があります。; 選択した画層の名前をもう一度クリックすると名前を変更できます † | N AcLayer LayerErrorInvalidChars |
| Palettes' frame | Layer Properties Manager (its title bar); Close, Properties (the title bar's buttons); Move, Size, Close, Allow Docking (its properties menu); the three Ctrl hints while it is dragged | 画層プロパティ管理; 閉じる, プロパティ; 移動, サイズ, 閉じる, ドッキングを許可; ドッキングさせたくない場合は［Ctrl］キーを押してください。 ドッキングさせたい場合は［Ctrl］キーを押してください。 ドッキングしたくない場合は、［Ctrl］キーを放してください。 | X WorkspaceRoot XLS_00014402 (acad.CUIX); adui26res.dll 61536, 15, MENU 134 (PaletteOptionsMenu: 32775, 32776, 32774, 32778), 17, 19, 20 (the 2027.1 update's acadlp.adix) |
| Palettes' anchoring | Anchor Left, Anchor Right, Auto-hide (the properties menu); Auto-hide (the title bar's button) | アンカー 左, アンカー 右, 自動的に隠す; 自動的に隠す | adui26res.dll MENU 134 (PaletteOptionsMenu: 32793, 32791, 32777; the trailing < and > drawn apart, a physical side's sign), 14 (the language pack's acadlp.adix, ~/autocad-packs: the 2027.1 update was not on disk; its menu's Move, Size, Close and Allow Docking read as the 2a's from the update) |
| Layer Properties Manager | New Layer (Alt+N), Delete Layer (Alt+D), Set Current (Alt+C) (its toolbar); Current layer: {0}; {0}: {2} layers displayed of {1} total layers, {0}: {2} of {1} total (the status line, the shorter where the longer does not fit); All (the filter it names) | 新規作成(Alt+N), 画層を削除(Alt+D), 現在に設定(Alt+C); 現在の画層: {0}; {0}: 表示されている画層 {2} 個、画層の総数 {1} 個, {0}: 合計 {2} / {1}; すべて | AcLayer.resources.dll's tbbtnNewLayer_, tbbtnDeleteLayer_, tbbtnCurrentLayer_ (`.ToolTipText`, the Alt key this language's), CurrentLayerStatusText, OverallStatusText, OverallStatusText_Shortening; acdb26res.dll 9050 (the language pack's acadlp.adix, ~/autocad-packs: the 2027.1 update was not on disk); 9050 reads `すべて(A)`, its accelerator left out |
| Blocks palette | Current Drawing (its tab); Current Drawing Blocks; Filter... (the filter's hint); Extra Large Icon, Large Icon, Medium Icon, Small Icon, List (the view); Options; Insertion Point, Scale, Uniform Scale, Rotation, Angle | 現在の図面; 現在の図面のブロック; フィルタ; 特大アイコン, 大アイコン, 中アイコン, 小アイコン, 一覧; オプション; 挿入位置, 尺度, XYZ 尺度を均一に設定, 回転, 角度 | AcWindows.resources.dll's BP_Tab_CurrentDrawing, BP_CurrentDrawingTitle; its BAMLs blockstream/palettetabshareddictionary (the hint, TextBlock_39), viewmodeswitcher, insertionoptionsusercontrol (X:, Y:, Z: as English's) (the language pack's acadlp.adix, ~/autocad-packs: the 2027.1 update was not on disk) |
| Properties palette | Style (a text's row, in its Text category) | 文字スタイル | P ax26res 39 (the language pack's acadsharedlp.adix, ~/autocad-packs: the 2027.1 update was not on disk) |
| Dialogs | Drawing Units; Insertion scale; Sample output; Decimal | 単位管理; 挿入尺度; サンプル出力; 十進表記 | D unitsRes 500; P ax26res 157 |
| Dialogs | Save Drawing As; File name:; Files of type:; Saveas Options; DXF Options; Decimal places of accuracy (0 to 16) | 図面に名前を付けて保存; ファイル名:; ファイルの種類:; 名前を付けて保存オプション; DXF オプション; 精度を入力 (0 から 16) | P acadres 21405; D acadres 131:13008, 131:13009, 2489:title; P acadres 4850; D acadres 5103:958 |
| Dialogs | Point Style; Set Size Relative to Screen | 点スタイル管理; スクリーンに対する相対サイズ | D acddptyperes 101 |
| Dialogs | Properties - Locked objects; Multiline Text - Unsaved Changes; OK; Cancel; Close | プロパティ - ロックされたオブジェクト; マルチ テキスト - 変更が保存されていません; OK; キャンセル; 閉じる | T AcTaskDialogs; D unitsRes 500:1, 500:2; AcDimRes 101:1 |
| Text style | Text Style; Current text style:; Styles:; All styles; Styles in use; Font; Font Name:; Size; Height; Set Current; New...; Delete; Apply; Cancel; Close; New Text Style; Style Name:; OK | 文字スタイル管理; 現在の文字スタイル:; スタイル:; すべてのスタイル; 使用中のスタイル; フォント; フォント名:; サイズ; 高さ; 現在に設定; 新規作成...; 削除; 適用; キャンセル; 閉じる; 新しい文字スタイル; スタイル名:; OK | D acadres 515 (title, 33884, 967, 2098, 920, 2097, 33886, 1258, 1257, 1259, 915, 917), 306 (2105, 1); P acadres 9038, 9039, 9033, 5835 (Close, what Cancel becomes after Apply) |
| Dim styles | Dimension Style Manager; Current dimension style:; Styles:; List:; All styles; Styles in use; Set Current; New...; Modify...; Close; Set current; Rename; Delete (the manager, its list's menu) | 寸法スタイル管理; 現在の寸法スタイル:; スタイル:; 一覧:; すべてのスタイル; 使用中のスタイル; 現在に設定; 新規作成...; 修正...; 閉じる; 現在に設定; 名前変更; 削除 | D AcDimRes 701 (title, 3018, 3010, 3033, 3027, 3028, 1); P AcDimRes 5601, 5610, 5611; the Styles list's shortcut menu, AcDimRes MENU 706 (0xA5A4, 0xA5A1, 0xA5A2) |
| Dim styles | Create New Dimension Style; New Style Name:; Start With:; Continue; Cancel; New Dimension Style:; Modify Dimension Style:; OK; Lines; Symbols and Arrows; Text; Fit; Primary Units (Create New, New and Modify, their tabs) | 寸法スタイルを新規作成; 新しいスタイル名:; 開始元:; 続ける; キャンセル; 寸法スタイルを新規作成:; 寸法スタイルを修正:; OK; 寸法線; シンボルと矢印; 寸法値; フィット; 基本単位 | D AcDimRes 702 (title, 3003, 3005, 3045, 2), 304:1; P AcDimRes 5609, 5608, 6000–6003, 6013 |
| Dim styles | Dimension lines; Baseline spacing:; Extension lines; Extend beyond dim lines:; Offset from origin:; Arrowheads; Arrow size:; Center marks; None; Mark; Text appearance; Text height:; Text placement; Offset from dim line:; Scale for dimension features; Use overall scale of:; Fine tuning; Draw dim line between ext lines; Linear dimensions; Precision; Decimal separator:; Zero suppression; Trailing; Angular dimensions; Precision: (the tabs' groups and labels) | 寸法線; 並列寸法の寸法線間隔:; 寸法補助線; 補助線延長長さ:; 起点からのオフセット:; 矢印; 矢印のサイズ:; 中心マーク; なし; マーク; 寸法値の表示; 文字の高さ:; 寸法値の配置; 寸法線からのオフセット:; 寸法図形の尺度; 全体の尺度:; 微調整; 寸法線を寸法補助線の内側に記入; 長さ寸法; 精度:; 十進数の区切り:; 0 省略表記; 末尾; 角度寸法; 精度: | D AcDimRes 302 (2563, 2567, 2569, 2574, 2575), 301 (2570, 2579, 2571, 2702, 2703), 303 (2619, 2622, 2628, 2626), 305 (2590, 2682, 2591, 2687), 307 (2592, 2713, 2596, 2602, 2653, 2603, 2606) |
| Dim styles | ',' (Comma); '.' (Period); ' ' (Space) (the Decimal separator list) | ',' (カンマ); '.' (ピリオド); ' ' (スペース) | P acdb26res 6151, 6150, 6152 |
| Descriptions | RIBBON, RIBBONCLOSE | リボンを表示; リボンを非表示 | the 2027 help pages (GUID-EC71B17B, GUID-A9EE8263, JPN), clipped |

Also ours (†): the canvas's name 作図領域; the save state (保存中…, 保存済み); the Blocks palette's
text; the "…of the selected objects" labels; the palette's fold, unfold and width; the Point
Style's 点の表示イメージ; the dashed command-line tools'
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
