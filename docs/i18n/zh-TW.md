# Traditional Chinese (`zh-TW`)

> **Command language:** `global`, English AutoCAD's. **Status:** `live` since 22/11/2026.
> **Review:** none by a native speaker yet; a model's second reading (see "Review").

`/zh-tw/draw` is AutoCAD with its interface in Traditional Chinese as Taiwanese AutoCAD words it —
the palettes, the ribbon's words, the menus, the tooltips, the status bar and the dialogs — and a
command line that speaks English AutoCAD: the same names, aliases, prompts and option letters as
`/draw`. It is Taiwan's Chinese, never Simplified Chinese's words in other characters
(`docs/i18n/zh-CN.md`): 物件 where Simplified says 对象, 性質 for 特性, 掣點 for 夹点, 鏡射 for 镜像,
填充線 for 图案填充, 聚合線 for 多段线, 指令 for 命令.

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Traditional Chinese (culture `zh-TW`):
  `Autodesk_AutoCAD_2027_Traditional_Chinese_Language_Pack.exe`, 245,456,216 bytes, SHA-256
  `8f97863fa1f323d75ea99d170a7cb85cf612bfff1c3f85520f97a37025a11348`, at
  `https://up1.autodesk.com/prd/2027/ACD/413574A9-36C1-3DC1-B33D-1C42229DD732/` (ceethreedee.com's
  "Civil 3D 2027 Download all the extensions"). **Not installed**: opened with 7-Zip's own Linux
  build, never run (22/11/2026). The string tables and the interface's DLLs are the 2027.1
  update's (`zh-TW/acadlp.adix` and `zh-TW/acadsharedlp.adix` of `AutoCAD_2027.1_Update.exe`,
  1,436,060,768 bytes, SHA-256
  `9adb25e6e9dce620f5635f82e2637331061cebd93eceafcacf4c6cd889618845`):
  `research/strings/all_zh-TW.tsv`; `acad.pgp`, `acadSynonymsGlobalDB.pgp` and `acad.CUIX` are the
  pack's.
- **The interface words** were paired by id, English resource against Traditional Chinese, with
  `propose-interface.mjs --lang zh-TW --catalog engine|editor --pack <folder>`
  (`research/proposals/zh-TW-*.md`): the engine's interface 241 labels settled by one wording, 197
  by several, 100 by none; the editor's 100, 97 and 89. Where an English label has several
  wordings, the row takes the wording of **the ids Simplified Chinese's row chose**
  (`docs/i18n/zh-CN.md`, its tables' sources), read in Traditional Chinese's resource: the row's
  place decided once, the words Taiwan's own (401 of the engine's 544 keys and 196 of the
  editor's 301 settle so). The rest was read by hand from the resource Simplified Chinese cites
  (a string table, a dialog, `acad.CUIX` by UID, a task dialog's BAML), and what none gives is
  ours, marked †.
- **The commands' Chinese names** are the ribbon's and the menus' (`acad.CUIX`'s ribbon `Text` and
  `MenuMacro` names: `偏移` for `^C^C_offset`): the CHT help titles a command `OFFSET (指令)` and
  gives it no Chinese name.
- **Help.** `https://help.autodesk.com/cloudhelp/2027/CHT/AutoCAD-Core/files/GUID-<id>.htm`; the
  help MCP searches it with `locale: "zh_TW"`.

## Why `global`

Taiwanese AutoCAD keeps **the English command names** (the help: «為了方便起見，會重複 OFFSET
指令。»), **English's aliases letter for letter** (`acad_zh-TW.pgp` differs from `acad_en.pgp` only
in the prompts of the shell commands DEL, DIR, NOTEPAD, SH, SHELL, START and TYPE, and in
whitespace; its synonyms list has Chinese only in its comments) and **English's keyword letters**,
which it lists in parentheses after a Chinese label: `指定下一點或 [退回(U)]:` (20619),
`指定偏移距離或 [通過(T)/刪除(E)/圖層(L)] <通過>:` (22470),
`指定圓的中心點或 [三點(3P)/兩點(2P)/相切、相切、半徑(T)]:` (20410). So everything a Taiwanese
AutoCAD user types works in `/zh-tw/draw` as in their AutoCAD.

## Deviations

- **The prompts are English** where Taiwanese AutoCAD words them in Traditional Chinese (`[Undo]`
  where it lists `[退回(U)]`). Not forced by the platform: the Chinese prompts are a command
  language of their own, the next piece of Japanese, Korean and Simplified Chinese too
  (`docs/plans/ja-language.md`): every prompt and message from the tables, the `label(K)` form the
  engine does not write yet, and the console to settle what the tables cannot, which needs the
  pack installed on the owner's AutoCAD. What a user types does not change with them. `WHY` in
  `i18n/engine.ts`; the differences page says it.
- **Missing:** drawing text in Chinese. TEXT and MTEXT draw what is typed, Han characters
  included, in the system's face, but measure it as Arial's average glyph
  (`domain/textFontMetrics.ts` covers latin only), so a Chinese label's box and centring are
  approximate.

## Interface terms

Taiwanese AutoCAD's own words, paired by id (`P dll id` a string table, `D dll dialog:control` a
dialog, `N assembly key` a .NET resource, `X uid` acad.CUIX, `T AcTaskDialogs n` a task dialog's
BAML read as text). **†** is ours: no Autodesk resource gives it. The pairing's raw output is
`research/proposals/zh-TW-*.md`; the Properties palette's choice lists are `ax26res`'s
`;`-separated strings, and the tools' descriptions keep acad.CUIX's help strings. A label keeps the
punctuation its resource writes (a dialog's half-width colon `檔名:`, the half-width parentheses
and the space of `陣列 (矩形)`, the menu's full-width comma of `圓，中心點、直徑`); full-width
punctuation is for the text that is ours. None of it was seen on the desktop: the pack is not
installed, so the ViewCube's faces (上 下 前 後 左 右, AcVMToolsRes 629–634) and compass (北 東 南
西, unitsRes 501) are unverified there. Some palette words are Autodesk's as they stand, though
they read oddly: a 2D solid's object name 實體 (ax26res 311; the tool, after ID_Solid, says 2D 實面),
an array's Level spacing 圖層間距 (ax26res 1198, where Levels is 層數), the shortcut menu's Copy
Selection 複本選取 (XLS_1005). Taiwan's rows and columns are the mainland's the other way round, and
Autodesk's follow Taiwan: Columns 行數, Rows 列 (ax26res 1189, 1194), MINSERT's 行數 and 列數
(266, 268).

### The editor (`packages/editor/src/locales/zh-TW.json`)

| Area | English | Traditional Chinese | Source |
| --- | --- | --- | --- |
| Ribbon's Home tab | Home; Draw, Modify, Annotation, Layers, Block, Properties, Utilities, Clipboard; Pin | 常用; 繪製, 修改, 註解, 圖層, 圖塊, 性質, 公用程式, 剪貼簿; 釘住 † | X ID_TabHome, ID_PanelDraw … RBN_00011049 and every button's and list member's uid (`ribbon.mjs --cuix` on the pack's acad.CUIX, 2026-11-24); Pin † ours: AutoCAD's pin has no name, the word undoes acadres 49183 `Unpin` |
| Status bar | Model space; MODEL; Coordinates | 模型空間; 模型; 座標 | P acadres 21486, 20008; P ax26res 4 |
| Status bar | Grid; Snap mode; Snap; Grid Snap; Polar Snap | 格線; 鎖點模式; 鎖點; 格線鎖點; PolarSnap | P acadres 21453, 20021 (`鎖點模式 (F9)` less the key), 21452; D dwgaidsRes 130:1109, 130:1106 |
| Status bar | Snap settings; Snap X spacing; Snap X; Polar distance; Polar snap distance | 鎖點設定; 鎖點 X 間距; 鎖點 X †; 極座標距離; 極座標鎖點距離 † | X XLSR_0955 (鎖點設定下拉式功能表, less 下拉式功能表); D dwgaidsRes 130:1002, 130:1098 |
| Status bar | Ortho mode; Polar tracking; Polar angle; Polar tracking angle | 正交模式; 極座標追蹤; 極座標角度; 極座標追蹤角度 † | P acadres 20023 (`正交模式 (F8)`), dwgaidsRes 2; D dwgaidsRes 131:1023 (極座標角度設定) |
| Status bar | Object snap; Object snap settings; Object snap tracking | 物件鎖點; 物件鎖點設定; 物件鎖點追蹤 | P dwgaidsRes 5; X XLS_3DSNAP_0009; P acadres 25573 |
| Status bar | Selection cycling; Selection cycling settings; Display selection list box | 選集循環; 選集循環設定 †; 顯示選集循環清單方塊 | P dwgaidsRes 1317; D dwgaidsRes 1309:1311 |
| Status bar | Show lineweight; Units; Clean screen; Customization | 顯示線粗; 單位; 清爽螢幕; 自訂 | D acadres 2500:2505; P acadres 4611; X XLS_6102, ID_PanelCustomization |
| Ribbon | Draw; Modify; Annotation; Block; Utilities; Modeling; Solid Editing | 繪製; 修改; 註解; 圖塊; 公用程式; 塑型; 實體編輯 | X ID_PanelDraw, ID_PanelModify, ID_PanelBasicAnnotation, XLS_1707, ID_PanelStandard_Clipboard, ID_Panel3D_Modeling, ID_PanelSolidEdit |
| Draw | Circle; Arc; Ellipse; Spline; Rectangle; Text | 圓; 弧; 橢圓; 雲形線; 矩形; 文字 | X (Simplified Chinese's ids) |
| Modify | Trim; Fillet; Fillet Edge; Break; Array; Edit Polyline; Extrude faces | 修剪; 圓角; 圓角邊; 切斷; 陣列; 編輯聚合線; 擠出面 | X (Simplified Chinese's ids) |
| Annotate | Dimension; Continue; Attributes | 標註; 連續式; 屬性 | X ID_RBN_CMDBTN_DIMENSION, …DIMCONTIN; X XLS_00010863 |
| Utilities | Measure; Points | 測量; 點 | X ID_RBN_SPLITBTN_MEASURE, ACAD_1033 |
| 3D | Extrude | 擠出 | X ID_RBN_8052 |
| Snaps | From; Point Filters; None; Osnap Overrides | 自; 點篩選; 無; 物件鎖點取代 | X ACAD_3 (`鎖點，自` less 鎖點), ACAD_1863, ACAD_14, ACAD_2602 (less the letter) |
| ViewCube | Home; Parallel; Set Current View as Home; WCS; New UCS; Unnamed | 首頁; 平行; 將目前視圖設定為主視圖; WCS; 新 UCS; 未具名 | P AcVMToolsRes 47021, 47022, 47026, 47009, 47042, 47010 |
| ViewCube | Rotate clockwise; counterclockwise; View the face above… | 順時鐘旋轉; 逆時鐘旋轉; 檢視上方的面… | † (AcArrayRes 5024–5025 have 逆時鐘方向, 順時鐘方向) |
| Navigation bar | Navigation bar; Zoom; Zoom Extents; Window; Previous; In; Out | 導覽列; 縮放; 縮放實際範圍; 縮放視窗; 縮放回前次; 拉近; 拉遠 | X ACAD_159; P AcVMToolsRes 47094, 47098, 47105, 47102, 47099, 47101 |
| Viewport | View controls: {name} | 視圖控制: {name} | P acadres 49037 |
| Title bar | Application menu; New; Open; Save; Save As | 應用程式功能表; 新建; 開啟; 儲存; 另存 | D acadres 7013:1278; X ACAD_673, ACAD_674, ACAD_UIE_31, ACAD_32 |
| Title bar | Undo; Redo; Drawing Units…; Language; Send Feedback | 退回; 重做; 圖面單位…; 語言; 傳送回饋 | X XLS_UIE_1068, XLS_UIE_0019; D unitsRes 500:title; P acadres 5878; X XLS_7254 |
| Title bar | Object color; Saving…; Saved; Saved on this device | 物件顏色; 正在儲存…; 已儲存 †; 已儲存至此裝置 † | P gridres 109, AcPltRes 5319 |
| Command line | Command line; Type a command (LINE, TR, CO…); Command history | 指令行; 鍵入指令（LINE、TR、CO…）; 指令歷程 | P acadres 4233; N AcWindows (by text: the command line's `鍵入指令`, a BAML TextBlock); P dwgaidsRes 1328 (指令歷程背景) |
| Shortcut menu | Shortcut menu; Repeat {command}; Enter; Cancel | 快顯功能表; 重複「{command}」; 輸入; 取消 | N AcCustomize; X ACAD_1897 (`重複「%s」(&R)`), ACAD_1758 (`輸入(&E)`), ACAD_1923 |
| Shortcut menu | Clipboard; Copy with Base Point; Paste; Copy Selection; Deselect All | 剪貼簿; 以基準點複製; 貼上; 複本選取; 取消全選 | X RBN_00011049, ACAD_1974, ACAD_58, XLS_1005, ACAD_1931 |
| Shortcut menu | Undo; Redo; Properties; Dimension Style | 退回; 重做; 性質; 標註型式 | X ACAD_639, ACAD_686, ACAD_334, ACAD_2000 |
| Properties | Properties; General; No selection; Object type; \*VARIES\*; Custom color | 性質; 一般; 未選取; 物件類型; \*各種\*; 自訂顏色 | X ACAD_334; P acopmRes 133, 177; D acopmRes 133:1034; P ax26res 782, gridres 81 |
| Properties | Color; Layer; Linetype; Lineweight; Text style; Dim style | 顏色; 圖層; 線型; 線粗; 文字型式; 標註型式 | P acopmRes 136–138, 140, 94; ax26res 148 |
| Properties | Current color; linetype; lineweight; layer | 目前的顏色; 目前的線型; 目前的線粗; 目前的圖層 | P acadres 21504, 21505, 21529, 21502 |
| Properties | Color of the selected objects (and its five siblings) | 選取物件的顏色 … † | † (選取的物件 as in T AcTaskDialogs 181) |
| Layers | Layers; New layer; Delete layer; Set current | 圖層; 新圖層; 刪除圖層; 設為目前的 | X ID_PanelLayers; P LaytransRes 26; N AcLayer (刪除圖層(&D)); D AcDimRes 101:54536 |
| Layers | Status, Name, On, Lock, Color, Linetype, Lineweight, Objects; On/Off; Locked/Unlocked | 狀態, 名稱, 打開, 鎖住, 顏色, 線型, 線粗, 物件; 打開/關閉; 已鎖住/解鎖 | N AcLayer; P AcOpmExtRes 238, 237; P ax26res 921, 1002; P acadres 21092 |
| Layers | Layer color; Layer list; Next/Previous columns; the rename hint | 圖層顏色 †; 圖層清單 †; 下一組欄 †, 上一組欄 †; 再按一下選取圖層的名稱即可更名 † | P acadres 4217 (圖層顏色 in its sentence); N AcLayer (在圖層清單中展示篩選) |
| Layers | Layer - Not Deleted; The selected layer was not deleted.; The following layers cannot be deleted:; the four bullets | 圖層 - 未刪除; 選取的圖層未被刪除。; 無法刪除以下圖層:; 圖層 0 和定義點, 目前的圖層, 包含物件的圖層, 外部參考從屬圖層 | T AcTaskDialogs 83 |
| Layers | Layer - Current Layer Off; the question; Turn…off; the note; Keep…on | 圖層 - 目前的圖層關閉; 將關閉目前的圖層。您想要做什麼？; 關閉目前的圖層; 從現在開始您建立的物件均不會顯示在圖面中，直至您重新打開圖層。; 保持目前圖層的打開狀態 | T AcTaskDialogs 87 |
| Layers | Layer - Rename; The selected layer cannot be renamed.; The following layers cannot be renamed:; Layer 0 | 圖層 - 更名; 無法更名選取的圖層。; 無法更名以下圖層:; 圖層 0 | T AcTaskDialogs 88 |
| Layers | Layer - Name Already Exists; The name, {name}, is already in use.; You will need to enter a different name. | 圖層 - 名稱已存在 † (after `%ObjectName% - 名稱已存在`); 名稱 {name} 已在使用。; 將需要輸入其他名稱。 | T AcTaskDialogs S4 |
| Layers | Invalid characters in layer name.; The following characters are not valid in layer names: | 圖層名稱中存在無效字元。; 以下字元在圖層名稱中無效: | N AcLayer |
| Dialogs | Drawing Units; Length; Type; Precision; Decimal; Insertion scale; Sample output | 圖面單位; 長度; 類型; 精確度; 十進位; 插入比例; 示範輸出 | D unitsRes 500; P unitsRes 28 |
| Dialogs | Units to scale inserted content:; Millimeters; Centimeters; Meters | 調整插入內容之比例的單位:; 公釐; 公分; 公尺 | D unitsRes 500:1011; P acadres 3404–3406 |
| Dialogs | Save Drawing As; File name:; Files of type:; Tools; Options…; Save | 圖面另存成; 檔名:; 檔案類型:; 工具; 選項…; 儲存 | P acadres 21405; D acadres 131:13008, 131:13009 |
| Dialogs | MellowCAD Drawing (*.ecad.json) | MellowCAD 圖檔 (*.ecad.json) | † (after acadres 6's 圖檔 (*.dwg)) |
| Dialogs | Saveas Options; DXF Options; Format; BINARY; Select objects; Save thumbnail preview image | 另存選項; DXF 選項; 格式; 二進位; 選取物件; 儲存縮圖預覽影像 | D acadres 2489:title; P acadres 4850; D acadres 5103 |
| Dialogs | Decimal places of accuracy (0 to 16) | 精確度小數位數 (0 到 16) | D acadres 5103:958 |
| Dialogs | Point Style; Point Size:; Set Size Relative to Screen; in Absolute Units; Invalid input. | 點型式; 點大小:; 設定大小相對於螢幕; 設定大小用絕對單位; 無效的輸入。 | D acddptyperes 101; P acddptyperes 13 |
| Dialogs | Point display images | 點顯示影像 † | † |
| Dialogs | Properties - Locked objects; One or more selected objects are locked…; Number of objects removed… | 性質 - 鎖住的物件; 一個或多個選取的物件已鎖住，無法更新。; 從選集中移除的物件數目: {count, number} | T AcTaskDialogs 181 |
| Dialogs | Multiline Text - Unsaved Changes; Do you want to save your text changes?; Yes; No; Cancel | 多行文字 - 未儲存的變更; 是否要儲存文字變更？; 是; 否; 取消 | T AcTaskDialogs 3 |
| Dim styles | Styles; Lines; Symbols and arrows; Text; Fit; Primary units | 型式; 線; 符號與箭頭; 文字; 填入; 主要單位 | P AcDimRes 6000–6003, 6013 |
| Dim styles | Baseline spacing; Extend beyond dim lines; Offset from origin; Offset from dim line | 基準線間距; 延伸至標註線外; 自原點偏移; 自標註線偏移 | D AcDimRes 302, 303 |
| Dim styles | Use overall scale of; Draw dim line between ext lines | 使用整體比例; 在延伸線之間繪製標註線 | D AcDimRes 305 |
| Dim styles | Precision; Angular precision; Decimal separator; Suppress trailing zeros | 精確度; 角度精確度; 小數分隔符號; 抑制結尾零 | D AcDimRes 307:2713; P ax26res 220, 149, 235 |
| Dim styles | ',' (Comma); '.' (Period); ' ' (Space) | 「,」(逗點); 「.」(小數點); 「 」(空格) | P acdb26res 6151, 6150, 6152 |
| Dim styles | Current:; New | 目前的:; 新建 | D acfilterres 101:1035; D AcDimRes 101:11612 |
| Text styles | Size; Height; the height hint | 大小; 高度; 高度為 0 表示不固定，TEXT 指令每次都會提示指定高度。 † | N AcCustomize; P acopmRes 145 |
| Blocks | Blocks; the filter, its label, the empty and no-match texts; {count} in drawing | 圖塊; 篩選（可使用 ? 和 *）†, 篩選圖塊 †, 未定義任何圖塊。請先繪製物件，再執行 BLOCK 指令。†, 沒有符合篩選的圖塊。†; 圖面中有 # 個 † | X XLS_1707 |
| Palettes | Palettes; Fold; Show; Palette width | 選項板; 收闔選項板 †; 顯示選項板 †; 選項板寬度 † | X ID_PanelPalettes; P acadres 5974 (寬度); N AcLayer (收闔圖層篩選) |

Also ours (†): the canvas's name 繪製區 (after acadres 7015:1861's 繪製區中的快顯功能表); the messages
composed from sourced words: `將 {name} 設為目前的圖層`, `{name} 的顏色/線型/線粗`, `刪除圖層 {name}`,
`更名圖層 {name}`, `將 {name} 設為目前的`, `更名 {name}`, `刪除 {name}`. 更名 is Autodesk's rename
(the task dialogs' 圖層 - 更名), 欄 Taiwan's table column (行 is Autodesk's for an array's). Dialog
labels drop the accelerator and keep the half-width colon the resource writes after it
(`檔名(&N):` → `檔名:`); a label English writes without a colon takes none. `Repeat {command}`
keeps the resource's corner brackets, `重複「%s」`.

### The engine (`cad/locales/zh-TW.json`, `interface`)

| Area | English | Traditional Chinese | Source |
| --- | --- | --- | --- |
| Draw | Line; Polyline; 3D Polyline; Circle; Diameter, 2-Point, 3-Point circle | 線; 聚合線; 3D 聚合線; 圓; 圓，中心點、直徑; 圓，兩點; 圓，三點 | X ID_RBN_CMDBTN_LINE; P ax26res 296, 280, 285; X ID_CircleDia, ID_Circle2pt, ID_Circle3pt (Name) |
| Draw | Arc; Start, Center, End; Center, Start, End; Ellipse; Center ellipse; Elliptical arc | 弧; 弧，起點、中心點、終點; 弧，中心點、起點、終點; 橢圓; 橢圓，中心點; 橢圓弧 | P ax26res 282; X ID_ArcStCeEn, ID_ArcCeStEn; P ax26res 293; X ID_EllipseCe, ID_RBN_CMDBTN_ELLIPSEAR |
| Draw | Spline; Spline Fit; Spline CV; Edit Spline; Edit Polyline | 雲形線; 雲形線擬合; 雲形線 CV; 編輯雲形線; 編輯聚合線 | P ax26res 312; X ribbon |
| Draw | Rectangle; Polygon; Hatch; Text; Multiline text; Edit text | 矩形; 多邊形; 填充線; 單行文字; 多行文字; 編輯文字 | X ribbon; P ax26res 295; X ID_Text |
| Draw | Multiple Points; Point Style; Construction Line; Ray; 2D Solid; 3D Face; Wipeout; 3D Mesh | 多個點; 點型式; 作圖線; 射線; 2D 實面; 3D 面; 遮蔽; 3D 網面 | X ID_RBN_CMDBTN_POINTMULT, ACAD_171, ID_RBN_CMDBTN_XLINE, …RAY, ID_Solid (Name's last part), ACAD_288, ID_RBN_CMDBTN_WIPEOUT |
| Modify | Move; Copy; Rotate; Mirror; Scale; Stretch | 移動; 複製; 旋轉; 鏡射; 比例; 拉伸 | X ID_RBN_CMDBTN_* |
| Modify | Offset; Trim; Extend; Fillet; Chamfer; Erase; Explode; Join | 偏移; 修剪; 延伸; 圓角; 倒角; 刪除; 分解; 接合 | X ID_RBN_CMDBTN_* |
| Modify | Break; Break at point; Array; Rectangular, Polar, Path array | 切斷; 切斷於點; 陣列; 矩形陣列, 環形陣列, 路徑陣列 | X ribbon; D AcArrayRes 146 |
| Modify | Match properties; Change properties | 複製性質; 變更性質 † | X ACAD_335 (ID_UIE_Ai_propch is left `Chprop`; the help: 變更物件的性質) |
| Clipboard | Copy; Cut; Copy with base point; Paste | 複本截取; 剪下; 以基準點複製; 貼上 | X ID_RBN_CMDBTN_COPYCLIP_0002, …CUTCLIP_0001, …COPYBASE_0002, …PASTECLIP_0001 |
| Inquiry | Measure; Measure (segments); Divide; Area; List; ID Point; Region/Mass Properties | 測量; 等距; 等分; 面積; 清單; 點位置; 面域/質量性質 | X ID_RBN_SPLITBTN_MEASURE, ID_RBN_CMDBTN_MEASURE, …DIVIDE, ACAD_186, RBN_01740411, ACAD_189, ACAD_187 |
| Block | Create block; Insert block; Define, Edit attributes; Attribute display; Purge | 建立圖塊; 插入圖塊; 定義屬性, 編輯屬性; 顯示屬性; 清除 | X ID_RBN_SPLITBTN_CREATEBLOCK, MM_1614, ID_RBN_CMDBTN_ATTDEF, ID_RBN_SPLITBTN_ATTRIBUTE, ACAD_147, ID_RBN_CMDBTN_PURGE |
| Block | MINSERT; its Columns, Column spacing, Rows, Row spacing | 插入圖塊陣列; 行數, 行間距, 列數, 列間距 | P ax26res 299, 266–269 |
| Annotate | Linear; Aligned; Horizontal; Vertical; Rotated; Angular; Radius; Diameter | 線性; 對齊式; 水平; 垂直; 旋轉標註; 角度; 半徑; 直徑 | X ribbon; P ax26res 974, 975, 292 |
| Annotate | Baseline; Continue; Adjust space; Leader | 基線式; 連續式; 標註空間; 引線 | X ID_RBN_CMDBTN_DIMBASELI, …DIMCONTIN, …DIMSPACE; P ax26res 297 |
| 3D | Union; Subtract; Intersect; Box; Wedge; Pyramid; Cylinder; Cone; Sphere; Torus | 聯集; 差集; 交集; 方塊; 楔形塊; 角錐; 圓柱; 圓錐; 圓球; 圓環 | X ACAD_374–376, ribbon |
| 3D | Extrude; Revolve; Presspull; Slice; Section; Fillet Edge; Chamfer Edge | 擠出; 迴轉; 按拉; 切割; 剖面; 圓角邊; 倒角邊 | X ID_RBN_8052, ribbon, ACAD_305, ACAD_306 |
| 3D | Solid Editing; Extrude, Move, Rotate, Offset, Taper, Delete, Copy faces | 實體編輯; 擠出面, 移動面, 旋轉面, 偏移面, 錐形面, 刪除面, 複製面 | X ID_PanelSolidEdit, ACAD_1947–1954 |
| Tools | Undo; Multiple redo; System variables; Object snap modes; Snap mode | 退回; 多重重做 †; 設定變數; 物件鎖點模式; 鎖點模式 | X ACAD_53, ID_Setvar; P acadres 21513, 20021 |
| Tools | Color; Linetype; Lineweight; Linetype scale; Fill; Elevation; Angle precision | 顏色; 線型; 線粗; 線型比例; 填滿; 高程; 角度精確度 | P acopmRes; X ID_Fill, ID_Elev; P ax26res 220 |
| Tools | Layer (command line); Dimension style (command line); UCS icon (variable) | 圖層(指令行) †; 標註型式(指令行) †; UCS 圖示(系統變數) † | † |
| Views | Zoom; Pan; Pan by points; Regen; Regen All; Viewpoint; Plan view; Preset views; 3D Orbit; Visual Styles | 縮放; 平移; 平移，點; 重生; 全部重生; 檢視點; 平面視圖; 預置視圖; 3D 環轉; 視覺型式 | P AcVMToolsRes 47094, 47090; X ID_PanPick, ACAD_64, ACAD_65, MM_0539, ACAD_112 |
| Views | Top; Bottom; Front; Back; Left; Right; SW, SE, NE, NW Isometric; Custom View | 上; 下; 前; 後; 左; 右; 西南, 東南, 東北, 西北等角; 自訂視圖 | P AcVMToolsRes 4230–4235, 4982–4985, acadres 40867 |
| ViewCube | Faces TOP … RIGHT; compass N E S W | 上 下 前 後 左 右; 北 東 南 西 | P AcVMToolsRes 629–634; D unitsRes 501:1051–1054 (neither seen on the desktop) |
| Snaps | Endpoint; Midpoint; Center; Node; Quadrant; Intersection | 端點; 中點; 中心點; 節點; 四分點; 交點 | P acadres 70–75 |
| Snaps | Insertion; Perpendicular; Tangent; Nearest; Apparent Intersection; Extension; Parallel | 插入點; 互垂點; 相切點; 最近點; 外觀交點; 延伸; 平行 | P acadres 32998, 77–79, 32997; D dwgaidsRes 135 |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White; ByLayer; Color {index} | 紅, 黃, 綠, 青, 藍, 洋紅, 白; ByLayer; 顏色 {index} | P colorRes 103–109, acui26res 14–21; P acadres 4221, colorRes 16 |
| Objects | Line … Ray, Polygon Mesh (the palette's object names) | 線, 圓, 弧, 橢圓, 雲形線, 聚合線, 3D 聚合線, 文字, 多行文字, 屬性定義, 標註, 填充線, 圖塊參考, 3D 實體, 面域, 點, 實體, 3D 面, 引線, 遮蔽, 點陣式影像, 表格, 多重引線, 作圖線, 射線, 多邊形網面 | P ax26res 279–316, 341, 437, 706, 731; X XLS_Name_Dimension |
| Properties | {count} objects; All ({count}) | # 個物件; 全部 ({count}) | P acadres 21354; acopmRes 73 |
| Properties | Array (Rectangular), (Polar), (Path) | 陣列 (矩形), 陣列 (環形), 陣列 (路徑) | P ax26res 1218, 1220, 1219 |
| Properties | Rotated, Aligned, Angular, Radial, Diametric Dimension | 旋轉標註, 對齊式標註, 角度標註, 半徑標註, 直徑標註 | P ax26res 292, 287, 288, 291, 289 |
| Properties | General groups: Geometry; Misc; Text; Position; Pattern; Attributes; Solid History; Mesh | 幾何圖形; 雜項; 文字; 位置; 樣式; 屬性; 實體歷程; 網面 | P ax26res 19, 25, 32, 929, 48, 1500, 655, 61 |
| Properties | Data Points; Lines & Arrows; Fit; Primary Units; Definition points; Center; Block | 資料點; 線與箭頭; 填入; 主要單位; 定義點; 中心點; 圖塊 | P ax26res 74, 143, 141, 142; T AcTaskDialogs 83 (圖層 0 和定義點); P ax26res 13, 727 |
| Properties | Start X; End X; Center X; Delta X; Normal X; Position X; Scale X | 起點 X; 終點 X; 中心點 X; 差值 X; 法線 X; 位置 X; 比例 X | P ax26res 7, 10, 14, 52, 28, 31, 43 |
| Properties | Major, Minor axis vector X; Text alignment X; Basepoint X; Second point X; Direction vector X | 長軸向量 X, 短軸向量 X; 文字對齊 X; 基準點 X; 第二點 X; 方向量 X | P ax26res 47, 46, 36, 64, 65, 66 |
| Properties | Start, End tangent vector X; Origin X; Base X (array); Text position X; Insertion point X; First X | 起點切線向量 X, 終點切線向量 X; 原點 X; 基準 X; 文字位置 X; 插入點 X; 第一點 X † | P ax26res 75, 76, 358, 1187, 223, 42 |
| Properties | Vertex; Current Vertex; Segments; Start, End segment width; Global width; Fit/Smooth | 頂點; 目前頂點; 線段 †; 起始線段寬度, 結束線段寬度; 整體寬度; 擬合/平滑化 | P ax26res 553, 18, 1158, 1159, 318, 60 |
| Properties | Radius; Diameter; Area; Circumference; Arc length; Total angle | 半徑; 直徑; 面積; 圓周; 弧長; 總角度 | P ax26res 252, 262, 253, 263, 90, 89 |
| Properties | Rotation; Text height; Text override; Annotative; Associative; Justify | 旋轉; 文字高度; 文字置換; 可註解; 關聯式; 對正 | P ax26res 254, 185, 211, 925, 111, 54 |
| Properties | Invisible; Verify; Constant; Preset; Lock position; Tag; Prompt | 不可見; 確認; 常數; 預置; 鎖住位置; 標籤; 提示 | P ax26res 257, 259, 258, 260, 359, 34, 33 |
| Properties | Method; Degree; Knot parameterization; Fit tolerance; Weight; CV frame | 方式; 次數; 節點參數; 擬合公差; 權值; CV 框 | P ax26res 914, 278, 910, 99, 1255, 912 |
| Properties | Columns; Column spacing; Rows; Row spacing; Levels; Level spacing (arrays) | 行數; 行間距; 列; 列間距; 層數; 圖層間距 | P ax26res 1189, 1190, 1194, 1195, 1197, 1198 |
| Properties | Items; Angle between items; Fill angle; Rotate items; Item spacing; Align items | 項目; 項目間的角度; 填滿角度; 旋轉項目; 項目間距; 對齊項目 | P ax26res 1191, 1193, 1211, 1212, 1192, 1205 |
| Properties | Arrow size; Ext line ext; Ext line offset; Text pos vert; Decimal separator | 箭頭大小; 延伸線延伸量; 延伸線偏移; 垂直文字位置; 小數分隔符號 | P ax26res 174, 217, 182, 191, 149 |
| Properties | M closed; N closed; M, N density; M, N vertex count | M 向封閉; N 向封閉; M 向密度, N 向密度; M 向頂點數, N 向頂點數 | P ax26res (the polygon mesh's rows, 94…) |
| Properties | Yes; No; Show; Hide; Visible; Hidden | 是; 否; 展示; 隱藏; 可見; 隱藏 | P ax26res 659, 799, 49 |
| Properties | At least; Exactly; Fit; Control Vertices; Chord; SqrtChord; Uniform; Custom | 最小; 精確; 擬合; 控制頂點; 弦; 平方根弦; 均勻; 自訂 | P ax26res 122, 915, 911 |
| Properties | User-defined; Predefined; Custom; Outer; Divide; Measure; None; Quadratic; Cubic | 使用者定義; 預先定義; 自訂; 外側; 等分; 等距; 無; 二次; 三次 | P ax26res 84, 114, 1202, 658, 118 |
| Properties | Clockwise; Counter-clockwise; Circumscribed; Inscribed | 順時鐘; 逆時鐘; 外切; 內接 | P ax26res 1210, 820 |
| Properties | Gradient; Gradient: Linear … Inverted curved | 漸層; 線性; 圓柱; 反轉的圓柱; 球形; 半球形; 曲線; 反轉的球形; 反轉的半球形; 反轉的曲線 | P ax26res 1419, 329 |
| Properties | Leader type; arrow; dim text | 無箭頭線; 無箭頭雲形線; 含箭頭線; 含箭頭雲形線; 封閉填滿; 置中; 上方 | P ax26res 115, 1069, 192 |
| Properties | Justify (TEXT) | 左, 中心, 右, 中央, 左上, 中上, 右上, 左中, 正中, 右中, 左下, 中下, 右下 (no letters, as Taiwanese AutoCAD) | P ax26res 126 |
| Descriptions | U, REDO, -OSNAP, FROM, NEW, QSAVE, SAVE, OPEN, PASTECLIP, DIMSTYLE, LAYER, LAYERCLOSE, PROPERTIESCLOSE | acad.CUIX's HelpString, whole (倒回最近的動作, 倒回先前 UNDO 或 U 指令的效果, 設定常駐式物件鎖點模式, …) | X ID_U, ID_Redo, ID_Osnap, ID_From, ID_New, ID_Save, ID_UIE_Save, ID_Open, ID_Pasteclip, ID_Ddim, ID_Layer, ID_LayerClose, ID_PropertiesClose |
| Descriptions | QNEW, SAVEAS, STYLE, BLOCKSPALETTE, UNITS, PURGE | the HelpString cut to the English: 建立一個新圖檔; 以新檔名儲存目前的圖面; 建立與修改文字型式; 開啟「圖塊」選項板; 控制座標和距離顯示的精確度和格式; 從圖面移除未使用的圖塊定義 | X ID_New (for ID_QNew), ID_Saveas, ID_Style, ID_BlocksPalette, ID_Units, ID_Purge |
| Descriptions | SNAP, DXFIN, DXFOUT, INSERT, PROPERTIES, CLEANSCREENON, CLEANSCREENOFF | 限制游標以指定的鎖點間距移動 †; 開啟 DXF 檔案 †; 將目前的圖面儲存為 DXF 檔案 †; 從「圖塊」選項板插入圖塊 †; 顯示選取物件的性質 †; 清除螢幕上的工具列和選項板 †; 回復「清爽螢幕」之前的顯示狀態 † | † (清爽螢幕 is ID_CleanScreen's Name; 鎖點間距 acadres 25946's SNAP prompt) |
| Descriptions | RIBBON, RIBBONCLOSE | 顯示功能區; 隱藏功能區 | the 2027 help pages' (GUID-EC71B17B, GUID-A9EE8263, CHT; RIBBON's reads 螢幕上將顯示顯示功能區, its doubled 顯示 left out), no final period |

Also ours (†): 變更性質 (Taiwanese AutoCAD leaves CHPROP's menu name `Chprop`; the help's 變更物件的性質),
多重重做 (MREDO has no name of its own; 多重 as in 多重引線), the dashed command-line tools' (指令行)
and UCS 圖示(系統變數), 第一點 X (after ax26res 65's 第二點 X), 線段 for Segments (after ax26res
1158's 起始線段寬度), and the descriptions marked above, written as acad.CUIX's help strings are (no
final period). Overridden against the most frequent wording, as Simplified Chinese's rows were,
because the row's place says otherwise: `measure` 測量 (the ribbon's split button, not MEASURE's 等距),
`dimcontinue` 連續式 and `dimbaseline` 基線式 (the ribbon), `dimspace` 標註空間 (the ribbon; the
menu says 標註間距), `scale` 比例 (the ribbon and the palette alike), `textPosVert` 垂直文字位置
(ax26res 191), the knot parameterization's 均勻 (ax26res 911, not the more frequent 等比例), the
spline method's 擬合 (ax26res 915, not the dimension fit's 佈滿 or 填入), MText line spacing's 最小
(ax26res 122), and the ViewCube's faces 上 … 右 (AcVMToolsRes 629–634). ByLayer stays `ByLayer` as
acadres 4221 and colorRes 16 show it. `*VARIES*` is not an `interface` key (ax26res 782 says
*各種*).

## Register

- **The CHT help's 書面語**: impersonal, plain and dry, short sentences; 可以 and 請 where natural,
  您 only where a sentence addresses the reader's own things. The editor's labels as Taiwanese
  AutoCAD words them.
- **Taiwan's usage, never the mainland's**: 指令 (not 命令), 檔案 (not 文件), 物件, 預設, 滑鼠,
  螢幕, 軟體, 程式, 資訊, 視窗, 儲存, 開啟, 建立, 選取, 設定, 執行.
- **Full-width punctuation** in Chinese text (，。：；？！、（）), **Taiwan's corner brackets** 「…」
  for quotes and for naming an interface item, as the CHT help does («「性質」選項板»); a half-width
  space between a Chinese run and a latin word, a code span or a number («OFFSET 指令», «按 Enter»,
  «2D 圖面»), none next to full-width punctuation. The generated pages end a list item's label
  with a full-width colon and quote with 「…」 (`lib/docs/generate.ts`).
- Keys as the help writes them: «按 Enter», «按 Esc», «Shift 鍵».
- **Commands by their global name**, the ribbon's word in full-width parentheses in titles and at
  a first mention («OFFSET（偏移）指令»).

## Search texts

Google's suggestions (`hl=zh-TW&gl=tw` and `hl=zh-HK&gl=hk`), 37 seeds (22/11/2026): both regions
return the same lists. No results page was read. Taiwan spaces «cad» from the Chinese about as
often as it runs it in.

- **The generic terms**: «線上cad» (繪圖, 檢視, 免費, 編輯), «cad 線上» (版, 看圖, 開啟, 編輯, 免費),
  «cad 免費» (版, 軟體), «免費cad軟體» (推薦), «免費cad繪圖軟體», «網頁版cad»; «autocad 線上» and
  «autocad 免費 版» look for Autodesk's own products: never a claim.
- **A command** by its ribbon word, with 指令 or 快捷鍵: «cad 偏移指令», «cad 修剪指令», «cad 圓角指令»,
  «cad 陣列», «cad 鏡射指令», «cad 偏移快捷鍵», «cad 圓角快捷鍵»; the English name too («cad offset
  指令», «cad offset 用法»).
- **The command list**: «cad 指令大全», «autocad 指令表», «autocad 指令 對照 表», «cad快捷鍵大全»: an
  alias is a «快捷鍵» to its searchers (the help's word is 指令別名).
- **Practice**: «cad 練習圖», «cad 練習題», «cad 平面圖 練習», «cad 教學», «cad 入門».
- **DXF**: «dxf 線上 檢視», «dxf 線上 開啟», «dxf 線上 編輯», «dxf 檢視器», «dxf檔 線上開啟», «dxf檔是什麼».
- **The guides**: «cad 平面圖» (教學, 範例), «cad 座標» (輸入, 指令), «cad 3d» (轉2d, 繪圖, 建模),
  «cad快捷鍵» (設定).

## The site's words

The site, the "Use" pages, the 104 command notes and the 12 exercises were written from the
English by agents on one brief (register, the names list, the search texts, `pair.mjs --lang
zh-TW` for every option word, the CHT help for dialogs), never from the Simplified Chinese files,
each file through `docs:check`. The landing's title «線上 CAD 免費繪圖，以 AutoCAD 指令繪製 2D 與 3D»
(«線上cad 繪圖», «線上cad 免費», «cad 3d 繪圖»), its H1 «免費線上 CAD，使用 AutoCAD 指令», the commands
page «CAD 指令大全：AutoCAD 指令表與快捷鍵大全», a command «CAD 偏移指令（OFFSET）用法與快捷鍵 O». Their
choices with no Autodesk word, for the native reader:

- **快捷鍵** for alias, as Taiwan searches («cad快捷鍵大全»), the help's 指令別名 named once
  («快捷鍵（指令別名）»); **鍵盤快捷鍵** for the keys' page, with F 功能鍵 and Ctrl 組合鍵 †;
  **選項字母** for "option letters" †; **空白鍵** for the space bar (the help's 空格鍵 also seen) †.
- The landing's groups **組織**, **查詢與視圖** and **檔案與剪貼簿** †; **繪圖輔助** for drafting aids
  (AutoCAD's dialog is 製圖設定) †; **路線圖**, **自造者** for makers, **繪圖員** for drafters †;
  **操作示範** for a session the engine draws, **版本化格式** for "versioned format" †.
- **階段作業** for a program session, the CHT help's (HPBOUNDRETAIN: «在此階段作業中»), never
  Windows' 工作階段; **分頁** for a browser tab (AutoCAD's tab is 頁籤) †; **強制回應** for modal, as
  Windows in Taiwan says it †.
- The geometry and modelling words: **實體基本物件** / **基本型實體** for primitives (the help's),
  **熱掣點** for the hot grip (the help's), **截頭角錐** for a frustum, **塊體** for a solid block (圖塊
  is AutoCAD's block), **板件** for a plate, **面帶** for a fillet's or chamfer's strip, **狹條** for a
  sliver, **控制框架** for the CV frame in prose, **優角** for a reflex angle, **扇區** for the sectors
  between two lines, **格點** for SNAP's grid points, **小控件** for the 3D gizmos, **塑型錯誤** †.
- A door's **門扇** and **開啟弧線**, its jambs **開口兩側** (Taiwanese architectural drafting) †;
  **鉤線** for LEADER's hook line †; **TRACE 物件** for a DXF trace (the tables leave `TRACE`) †.
- The exercises' parts as Taiwanese (CNS) drafting names them — 軸承座, 法蘭 (CNS also says 凸緣),
  墊片, 皮帶輪 with 輪轂, 腹板 and 輪緣, 連桿, 階梯軸 and 軸肩, 鍵槽, 螺栓孔, 節圓, 凸轂, L 型支架, 安裝板,
  階梯塊, 土地邊界, 直線樓梯 with 踏面, 半剖面 — and the layers 輪廓線, 中心線, 隱藏線 and 標註 (AutoCAD's
  word, where CNS says 尺度) †.
- UNDO's search title keeps **復原**, what its searchers type (Windows' Ctrl+Z), beside AutoCAD's
  退回.

Dialog and palette labels the tables do not hold were written as the CHT help words them and are
**unverified** on the desktop: 「製圖設定」 and its 「物件鎖點」頁籤, 「標註型式管理員」, 「增強型屬性編輯器」
(the help writes 增強屬性編輯器 too), 「線型管理員」, 「填充線建立」 and 「填充線編輯器」, the PAN shortcut
menu's entries, PROPERTIES' Quick Select and docking, the array grips' menu (worded from the
prompts), REGION's count messages, -PURGE's 巢狀項目 and 孤立的資料 (from the help), the Properties
palette's Block Unit and Unit factor. The CHT help's Object Snap tab says 單點 and 象限 where
acadres 73–74, which the engine's snaps take, say 節點 and 四分點. SPLINE's Degree is 次數, its
option's word, where its prompt says 角度 (an Autodesk slip, it seems). The engine prints F3's
`<Osnap on>` in English where Taiwanese AutoCAD prints «<打開物件鎖點>»: the prompts' deviation.

## Command names

The ribbon's and the menus' Traditional Chinese names (acad.CUIX, 22/11/2026), in brackets in the
commands' titles. Taiwanese AutoCAD keeps apart what Simplified Chinese AutoCAD merges: STRETCH 拉伸
and EXTRUDE 擠出, SCALE 比例 and ZOOM 縮放, ROTATE 旋轉 and REVOLVE 迴轉:
-OSNAP 物件鎖點 · 3DORBIT 3D 環轉 · 3DPOLY 3D 聚合線 · ARC 弧 · AREA 面積 · ARRAY 陣列 · ARRAYPATH
路徑陣列 · ARRAYPOLAR 環形陣列 · ARRAYRECT 矩形陣列 · ATTDEF 定義屬性 · ATTDISP 顯示屬性 · ATTEDIT 編輯屬性 ·
BLOCK 建立圖塊 · BOX 方塊 · BREAK 切斷 · CHAMFER 倒角 · CHAMFEREDGE 倒角邊 · CHPROP 變更性質 † · CIRCLE 圓 ·
COLOR 顏色 · CONE 圓錐 · COPY 複製 · COPYCLIP 複本截取 · CYLINDER 圓柱 · DIMALIGNED 對齊式 · DIMANGULAR 角度
· DIMBASELINE 基線式 · DIMCONTINUE 連續式 · DIMDIAMETER 直徑 · DIMLINEAR 線性 · DIMRADIUS 半徑 · DIMSPACE
標註空間 · DIMSTYLE 標註型式 · DIST 距離 · DIVIDE 等分 · EATTEDIT 編輯屬性 · ELLIPSE 橢圓 · ERASE 刪除 ·
EXPLODE 分解 · EXTEND 延伸 · EXTRUDE 擠出 · FILLET 圓角 · FILLETEDGE 圓角邊 · HATCH 填充線 · ID 點位置 ·
INSERT 插入圖塊 · INTERSECT 交集 · JOIN 接合 · LAYER 圖層性質 · LEADER 引線 · LINE 線 · LINETYPE 線型 · LIST
清單 · LTSCALE 線型比例 · LWEIGHT 線粗 · MASSPROP 面域/質量性質 · MATCHPROP 複製性質 · MEASURE 等距 · MINSERT
插入圖塊陣列 · MIRROR 鏡射 · MOVE 移動 · MTEXT 多行文字 · OFFSET 偏移 · PAN 平移 · PEDIT 編輯聚合線 · PLAN
平面視圖 · PLINE 聚合線 · POLYGON 多邊形 · PRESSPULL 按拉 · PROPERTIES 性質 · PTYPE 點型式 · PURGE 清除 ·
PYRAMID 角錐 · RAY 射線 · RECTANG 矩形 · REDO 重做 · REGION 面域 · REVOLVE 迴轉 · ROTATE 旋轉 · SCALE 比例 ·
SECTION 剖面 · SLICE 切割 · SNAP 鎖點 · SOLIDEDIT 實體編輯 · SPHERE 圓球 · SPLINE 雲形線 · SPLINEDIT
編輯雲形線 · STRETCH 拉伸 · STYLE 文字型式 · SUBTRACT 差集 · TEXT 單行文字 · TEXTEDIT 編輯文字 · TORUS 圓環 ·
TRIM 修剪 · UCS · UCSICON UCS 圖示 · UNDO 退回 · UNION 聯集 · UNITS 單位 · VIEW 視圖管理員 · VSCURRENT
視覺型式 · WEDGE 楔形塊 · XLINE 作圖線 · ZOOM 縮放.

## Script and font

- **The system's Traditional Chinese faces**, no web font: `--font-sans` and `--font-mono` take
  Inter or Geist Mono first (latin and digits), then PingFang TC, Microsoft JhengHei UI, Microsoft
  JhengHei, Noto Sans CJK TC, Source Han Sans TC and Noto Sans TC (`lib/fonts.ts`,
  `TRADITIONAL_CHINESE_SYSTEM_FACES`). WHY: Japanese's; a Chinese web font is a hundred
  `unicode-range` files and more. **No Simplified Chinese or Japanese face among them**: a Han
  character the three share is drawn in each region's form (骨, 直, 角), and Taiwan's standard
  forms are Traditional's; `lang="zh-TW"` stays on everything Chinese.
- **The share card** takes Noto Sans TC 600 (SIL OFL) cut to the characters of the Traditional
  Chinese cards (`assets/fonts/noto-sans-tc-card-600.woff`, `assets/fonts/README.md`), held to
  them by a test.
- **No italic and no tracking**, and a line keeps its punctuation off its start
  (`line-break: strict`): `:lang(zh)`'s rules in both stylesheets, Simplified Chinese's, reach
  Traditional too. A browser breaks between any two characters, which is how Chinese breaks.

## Plurals

`Intl.PluralRules("zh-TW")` has only `other`: a plural is its `other`, a count takes its measure
word («3 個物件»).

## Input

Taiwan types through an IME's composition (注音 Zhuyin, 倉頡 Cangjie), which `isImeKey` hands to the
IME (Japanese's fix): a composing Enter or Escape never answers the command line, the dynamic
input or a field that commits on Enter. A command is typed in the IME's English mode (Shift), as
in AutoCAD. On the drawing no IME composes (no editable target), so a command typed there is
latin as typed.

## Going live

On 22/11/2026, from production builds (`vercel build`, offline; every page `○` or `●` but `/mcp`):

- **The landing's first load**, Brotli q11 of every response until the network is idle, in bytes,
  Traditional Chinese a draft (`b3a9756c` and the review's fixes) and live: `/` 252,100 → 252,093,
  `/es` 253,500 → 253,454, `/pt-br` 253,684 → 253,763, `/ar` 277,021 → 277,050, `/fr` 254,310 →
  254,407 (1,593 under 250 KiB), `/it` 253,503 → 253,492, `/de` 253,837 → 253,837, `/ru` 287,352 →
  287,311, `/pl` 268,160 → 268,213, `/cs` 267,998 → 268,101, `/hu` 268,409 → 268,471, `/ja`
  254,278 → 254,230, `/ko` 254,073 → 253,973, `/zh-cn` 253,239 → 253,327; `/zh-tw` 253,494 →
  253,590, under the 250 KiB of a page with no script font. No cut was needed: going live added
  some 100 bytes to every landing, within a build's own drift.
- **The rest**: the search index `/zh-tw/search-index.json` 5.9 MB (Russian's 7.6 is the largest),
  the export 14,097 files; the editor's and the engine's catalogs reach `/zh-tw/draw` only (the
  one shared chunk with a Traditional Chinese word holds `LANGUAGE_NAMES`, every language's name).
- **The checks in Chrome**: `/zh-tw` at 360 px, nothing wider than the viewport, the H1 in the
  system's Traditional Chinese face behind Inter, `line-break: strict`, the hreflang set with
  `zh-TW` and «繁體中文» in every landing's language links; `/zh-tw/draw` at 1280×720, no text
  clipped in the bars or the palettes, the ViewCube's 上 and 北 東 南 西, the placeholder
  «鍵入指令（LINE、TR、CO…）». **The IME**: with `LINE` in the command line, a composing Enter
  (`keyCode` 229) left it there, a character composed through Chrome's IME
  (`Input.imeSetComposition`) went into the field, and a plain Enter ran LINE.

## Review

**No native reader yet**: pending, as Simplified Chinese's, Japanese's and Korean's. Instead, on
22/11/2026, **a model's second reading**: an agent given the task and a sample, not this file's
reasoning — the site's, the editor's and the engine's catalogs, six command notes (OFFSET, TRIM,
HATCH, LINE, LAYER, DIMLINEAR), three "Use" pages and two exercises, each beside its English — read
as a Taiwanese technical editor who uses Taiwanese AutoCAD, checking option words against the
zh-TW tables and the CHT help. It found no Simplified character and no mainland usage, the
typography clean and the claims the English's, and: a claim the rules forbid (LAYER's «提示與
AutoCAD 相同», now the prompts' order and option letters), a «目前» the FAQ added that promised the
Chinese prompts, TRIM's question naming one selection mode where its answer gives two, the space
bar called 空格鍵 where Autodesk's tables and the notes say 空白鍵 (63424), a 2D solid called 2D 實體
beside the tool's 2D 實面, 帳戶 and 帳號 for one account, a bare 基本型 for primitives, 量測 beside
Autodesk's 測量 (now 測量 everywhere), and a dozen calques (退回可以將它退回, 與 UCS 傾斜的物件), all
fixed. Its reading of the shortcut menu's Copy Selection as Autodesk's 複製選項 was checked against
the pack and is wrong: XLS_1005 says 複本選取, which stays. Before that, one pass over every file for
what the eight writers had settled apart: 階段作業 for a session (the CHT help's, HPBOUNDRETAIN),
never 工作階段; 截頭角錐; 擬合/平滑化 (ax26res 60); the exercises' names in the guides' links as
their own titles.

Where a native reader should look first: the terms marked † above, the search titles and
descriptions (written from Google's suggestions, never tested against a Taiwanese searcher), the
dialog and palette labels the tables do not hold (marked unverified above), the exercises' CNS
drafting words, Hong Kong's own usage, and the ViewCube's faces and compass, never seen on the
desktop.
