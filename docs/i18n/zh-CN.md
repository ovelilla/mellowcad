# Simplified Chinese (`zh-CN`)

> **Command language:** `global`, English AutoCAD's. **Status:** `live` since 22/11/2026.
> **Review:** none by a native speaker yet; a model's second reading (see "Review").

`/zh-cn/draw` is AutoCAD with its interface in Simplified Chinese — the palettes, the ribbon's
words, the menus, the tooltips, the status bar and the dialogs as Chinese AutoCAD words them — and
a command line that speaks English AutoCAD: the same names, aliases, prompts and option letters
as `/draw`. Traditional Chinese (`zh-TW`, Taiwan and Hong Kong) is a language of its own, not yet
begun (`docs/plans/zh-CN-language.md`).

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Simplified Chinese (culture `zh-CN`):
  `Autodesk_AutoCAD_2027_Simplified_Chinese_Language_Pack.exe`, 245,437,712 bytes, SHA-256
  `20c5eed2bb46f270ddc48954e36df1fda4f44cb8a8c8782b57995c7ed688692a`, at
  `https://up1.autodesk.com/prd/2027/ACD/C30B4111-67F5-3C8A-A546-54354E2B9F16/` (ceethreedee.com's
  "Civil 3D 2027 Download all the extensions"). **Not installed**: opened with 7-Zip's own Linux
  build, never run (21/11/2026). The string tables and the interface's DLLs are the 2027.1
  update's (`zh-CN/acadlp.adix` and `zh-CN/acadsharedlp.adix` of `AutoCAD_2027.1_Update.exe`,
  1,436,060,768 bytes, SHA-256
  `9adb25e6e9dce620f5635f82e2637331061cebd93eceafcacf4c6cd889618845`):
  `research/strings/all_zh-CN.tsv`; `acad.pgp`, `acadSynonymsGlobalDB.pgp` and `acad.CUIX` are the
  pack's.
- **The interface words** were paired by id, English resource against Chinese, with
  `propose-interface.mjs --lang zh-CN --catalog engine|editor --pack <folder>`
  (`research/proposals/zh-CN-*.md`): the engine's interface 237 labels settled by one wording, 190
  by several (the catalog row's place decided), 99 by none (ours, marked below); the editor's 102,
  95 and 89.
- **The commands' Chinese names** are the ribbon's and the menus' (`acad.CUIX`'s ribbon `Text`
  and `MenuMacro` names: `偏移` for `^C^C_offset`): the CHS help titles a command `OFFSET（命令）`
  and gives it no Chinese name.
- **Help.** `https://help.autodesk.com/cloudhelp/2027/CHS/AutoCAD-Core/files/GUID-<id>.htm`; the
  help MCP searches it with `locale: "zh_CN"`.

## Why `global`

Chinese AutoCAD keeps **the English command names** (the help: «OFFSET 命令将重复»), **English's
aliases letter for letter** (`acad_zh-CN.pgp` differs from `acad_en.pgp` only in the prompts of the
shell commands DEL, DIR, NOTEPAD, SH, SHELL, START and TYPE, and in whitespace; its synonyms list
has no Chinese entry) and **English's keyword letters**, which it lists in parentheses after a
Chinese label: `指定下一点或 [放弃(U)]:` (20619), `指定偏移距离或 [通过(T)/删除(E)/图层(L)] <通过>:`
(22470), `指定圆的圆心或 [三点(3P)/两点(2P)/切点、切点、半径(T)]:` (20410). So everything a Chinese
AutoCAD user types works in `/zh-cn/draw` as in their AutoCAD.

## Deviations

- **The prompts are English** where Chinese AutoCAD words them in Chinese (`[Undo]` where it lists
  `[放弃(U)]`). Not forced by the platform: the Chinese prompts are a command language of their
  own, Japanese's and Korean's next piece too (`docs/plans/ja-language.md`): every prompt and
  message from the tables, the `label(K)` form the engine does not write yet, and the console to
  settle what the tables cannot, which needs the pack installed on the owner's AutoCAD. What a
  user types does not change with them. `WHY` in `i18n/engine.ts`; the differences page says it.
- **Missing:** drawing text in Chinese. TEXT and MTEXT draw what is typed, Han characters
  included, in the system's face, but measure it as Arial's average glyph
  (`domain/textFontMetrics.ts` covers latin only), so a Chinese label's box and centring are
  approximate.

## Interface terms

Chinese AutoCAD's own words, paired by id (`P dll id` a string table, `D dll dialog:control` a
dialog, `N assembly key` a .NET resource, `X uid` acad.CUIX, `T AcTaskDialogs` a task dialog read
as text). **†** is ours: no Autodesk resource gives it. The pairing's raw output is
`research/proposals/zh-CN-*.md`; the Properties palette's choice lists are `ax26res`'s
`;`-separated strings, and the tools' descriptions keep acad.CUIX's help strings. A label keeps
the punctuation its resource writes (the half-width colon of a dialog's `文件名:`, the parentheses
of `阵列(矩形)`), as Korean's and Japanese's keep theirs; full-width punctuation is for the text that
is ours. None of it was seen on the desktop: the pack is not installed, so the ViewCube's faces
(俯视 前视 左视…, AcVMToolsRes 629–634, the ids Japanese's 上 前 左 have) and compass (北 东 南 西,
unitsRes 501) are unverified there. Two palette words are Autodesk's as they stand, though they
read oddly: a 2D solid's object name 实线 (ax26res 311; the tool, after ID_Solid, says 二维填充) and
MINSERT's Columns row 分栏 (ax26res 266).

### The editor (`packages/editor/src/locales/zh-CN.json`)

| Area | English | Chinese | Source |
| --- | --- | --- | --- |
| Ribbon's Home tab | Home; Draw, Modify, Annotation, Layers, Block, Properties, Utilities, Clipboard; Pin | 默认; 绘图, 修改, 注释, 图层, 块, 特性, 实用工具, 剪贴板; 固定 † | X ID_TabHome, ID_PanelDraw … RBN_00011049 and every button's and list member's uid (`ribbon.mjs --cuix` on the pack's acad.CUIX, 2026-11-24); Pin † ours: AutoCAD's pin has no name, the word undoes acadres 49183 `Unpin` |
| Ribbon's other tabs | Insert, Annotate, 3D Tools, View; Retain Attribute Display, Display All Attributes, Hide All Attributes; More Colors...; Select Color...; 2D Wireframe, Hidden, Conceptual | 插入, 注释, 三维工具, 视图; 保留属性显示, 显示所有属性, 隐藏所有属性; 更多颜色...; 选择颜色...; 二维线框, 隐藏, 概念 | X ID_TabInsert, ID_TabAnnotate, ID_TAB_3D_TOOLS, ID_TabView, each panel's and button's uid (acad.CUIX by uid, 2026-11-24); AcWindows.resources.dll's BAML (`AcAttmode1/2/0`, `mMoreColorsLabel`); AcDimRes 318; tables 41794, 41445, 8027; the pack's files (`~/autocad-packs`) | no |
| Ribbon's minimize button | Show Full Ribbon; Minimize to Tabs, Minimize to Panel Titles, Minimize to Panel Buttons, Cycle through All | 显示完整的功能区; 最小化为选项卡, 最小化为面板标题, 最小化为面板按钮, 循环浏览所有项 | X AdWindows.resources.dll's BAML (`ID_MinimizeToTabs`, `ID_MinimizeToPanelTitles`, `ID_MinimizeToPanelButtons`, `ID_CycleThroughAll`, `system:String_83`), 2026-11-24; the pack's files (`~/autocad-packs`) | no |
| Quick Access Toolbar's lists | Undo 1 command, Undo 3 commands; Redo 1 command, Redo 3 commands; Group of commands; - Mark - | 放弃 1 个命令; 放弃 3 个命令; 重做 1 个命令; 重做 3 命令; Group of commands; - Mark - | P acadres 4853–4856 (two forms, 1 and the rest, as AutoCAD's), 4860, 4861 (the last two English's: no command language here); desktop 2026-11-25 (es) | yes |
| Application menu | Drawing Utilities; Units; Drawing; Other Formats; Open Documents; each page's heading and descriptions | 图形实用工具; 单位; 图形; 其他格式; 打开文档; … | X AcWindows.resources.dll's BAML (`AcNew` to `AcDrawingUtilities_Units`: name and description; New ▸ Drawing's without the template and Save As' two without DWG, DWT and DWS: this program chooses none and writes neither), AdWindows.resources.dll's `system:String_95`; the pack's files (`~/autocad-packs`) | yes |
| Title bar's title | A new drawing's name (Drawing1.dwg) | Drawing1.dwg | P acadres 4125 is `Drawing.dwg` in the pack's table too, and the language has no command language here | yes |
| Title bar's Help ▾ | Help; Send Feedback | 帮助; 发送反馈 | X ACAD_378 (the Help menu, `ID_MnHelp`: its `ACAD_379` is English in the zh-CN acad.CUIX), XLS_7254 (`ID_SendFeedback`); the pack's files (`~/autocad-packs`) | yes |
| Status bar | Model space; MODEL | 模型空间; 模型 | P acadres 21486, 20008 |
| Status bar | Coordinates | 坐标 | P ax26res 4; X ID_PanelCoord |
| Status bar | Grid; Snap mode; Snap; Grid Snap; Polar Snap | 栅格; 捕捉模式; 捕捉; 栅格捕捉; PolarSnap | P acadres 21453, 20021 (`捕捉模式(F9)` less the key), 21452; D dwgaidsRes 130:1109, 130:1106 |
| Status bar | Snap settings; Snap X spacing; Snap X; Polar distance; Polar snap distance | 捕捉设置; 捕捉 X 轴间距; 捕捉 X †; 极轴距离; 极轴捕捉距离 † | X XLSR_0955 (“捕捉设置”下拉菜单); D dwgaidsRes 130:1002, 130:1003, 130:1098 |
| Status bar | Ortho mode; Polar tracking; Polar angle; Polar tracking angle | 正交模式; 极轴追踪; 极轴角; 极轴追踪角度 † | P acadres 20023, dwgaidsRes 2; D dwgaidsRes 131:1023 (极轴角设置) |
| Status bar | Object snap; Object snap settings; Object snap tracking | 对象捕捉; 对象捕捉设置; 对象捕捉追踪 | P dwgaidsRes 5; X XLS_3DSNAP_0009; P acadres 25573 |
| Status bar | Selection cycling; Selection cycling settings; Display selection list box | 选择循环; 选择循环设置 †; 显示选择循环列表框 | P dwgaidsRes 1317; D dwgaidsRes 1309:1311 |
| Status bar | Show lineweight; Units; Clean screen; Customization | 显示线宽; 单位; 全屏显示; 自定义设置 | D acadres 2500:2505; P acadres 4611; X XLS_6102, ID_PanelCustomization |
| Ribbon | Draw; Modify; Annotation; Block; Utilities; Modeling; Solid Editing | 绘图; 修改; 注释; 块; 实用工具; 建模; 实体编辑 | X ID_PanelDraw, ID_PanelModify, ID_PanelBasicAnnotation, XLS_1707, ID_PanelStandard_Clipboard, ID_Panel3D_Modeling, ID_PanelSolidEdit |
| Draw | Circle; Arc; Ellipse; Spline; Rectangle; Text | 圆; 圆弧; 椭圆; 样条曲线; 矩形; 文字 | X ID_RBN_SPLITBTN_CIRCLE, …ARC, …ELLIPSE_0001, XLS_SM_00015799, ID_RBN_CMDBTN_RECTANG_0001, ACAD_2428 |
| Modify | Trim; Fillet; Fillet Edge; Break; Array; Edit Polyline; Extrude faces | 修剪; 圆角; 圆角边; 打断; 阵列; 编辑多段线; 拉伸面 | X ID_RBN_CMDBTN_TRIM, …FILLET, ID_RBN_0173, …BREAK, ACAD_853, …PEDIT, …FACEEXTRU_0001 |
| Annotate | Dimension; Continue; Attributes | 标注; 连续; 属性 | X ID_RBN_CMDBTN_DIMENSION, …DIMCONTIN; X XLS_00010863 |
| Utilities | Measure; Points | 测量; 点 | X ID_RBN_SPLITBTN_MEASURE, ACAD_1033 |
| 3D | Extrude | 拉伸 | X ID_RBN_8052 |
| Snaps | From; Point Filters; None; Osnap Overrides | 自; 点过滤器; 无; 捕捉替代 | X ACAD_3, ACAD_1863, ACAD_14, ACAD_2602 (`捕捉替代(V)` less the letter) |
| ViewCube | Home; Parallel; Set Current View as Home; WCS; New UCS; Unnamed | 主页; 平行; 将当前视图设定为主视图; WCS; 新 UCS; 未命名 | P AcVMToolsRes 47021, 47022, 47026, 47009, 47042, 47010 |
| ViewCube | Rotate clockwise; counterclockwise; View the face above… | 顺时针旋转; 逆时针旋转; 查看上方的面… | † (AcArrayRes 5024–5025 have 逆时针, 顺时针) |
| Navigation bar | Navigation bar; Zoom; Zoom Extents; Window; Previous; In; Out | 导航栏; 缩放; 范围缩放; 窗口缩放; 缩放上一个; 放大; 缩小 | X ACAD_159; P AcVMToolsRes 47094, 47098, 47105, 47102, 47099, 47101 |
| Viewport | View controls: {name} | 视图控件: {name} | P acadres 49037 |
| Title bar | Application menu; New; Open; Save; Save As | 应用程序菜单; 新建; 打开; 保存; 另存为 | D acadres 7013:1278; X ACAD_673, ACAD_674, ACAD_UIE_31, ACAD_32 |
| Title bar | Undo; Redo; Language; Send Feedback | 放弃; 重做; 语言; 发送反馈 | X XLS_UIE_1068, XLS_UIE_0019; P acadres 5878; X XLS_7254 |
| Title bar | Object color; Saving…; Saved; Saved on this device | 对象颜色; 正在保存…; 已保存 †; 已保存到此设备 † | P gridres 109, AcPltRes 5319 |
| Command line | Command line; Type a command (LINE, TR, CO…); Command history | 命令行; 键入命令（LINE、TR、CO…）; 命令历史记录 | P acadres 4233; N AcWindows (by text: the command line's `键入命令`, a BAML TextBlock); P dwgaidsRes 1328 (命令历史记录背景) |
| Shortcut menu | Shortcut menu; Repeat {command}; Enter; Cancel | 快捷菜单; 重复{command}; 确认; 取消 | N AcCustomize NAME_ShortcutMenu; X ACAD_1897 (`重复%s(&R)`), ACAD_1758 (the menu's NameRef `确认(&E)`), ACAD_1923 |
| Shortcut menu | Clipboard; Copy with Base Point; Paste; Copy Selection; Deselect All | 剪贴板; 带基点复制; 粘贴; 复制选择; 全部不选 | X RBN_00011049, ACAD_1974, ACAD_58, XLS_1005, ACAD_1931 |
| Shortcut menu | Undo; Redo; Properties; Dimension Style | 放弃; 重做; 特性; 标注样式 | X ACAD_639, ACAD_686, ACAD_334, ACAD_2000 |
| Properties | Properties; General; No selection; Object type; \*VARIES\*; Custom color | 特性; 常规; 无选择; 对象类型; \*多种\*; 自定义颜色 | X ACAD_334; P acopmRes 133, 177; D acopmRes 133:1034; P ax26res 782, gridres 81 |
| Properties | Color; Layer; Linetype; Lineweight; Text style; Dim style | 颜色; 图层; 线型; 线宽; 文字样式; 标注样式 | P acopmRes 136–138, 140, 94; ax26res 148 |
| Properties | Current layer; color; linetype; lineweight | 当前图层; 当前颜色; 当前线型; 当前线宽 | P acadres 21502, 21504, 21505, 21529 |
| Properties | Color of the selected objects (and its five siblings) | 选定对象的颜色 … | † (选定对象 as in AcTaskDialogs' 一个或多个选定对象已锁定) |
| Layers | Layers; New layer; Delete layer; Set current; Current layer | 图层; 新图层; 删除图层; 置为当前; 当前图层 | X ID_PanelLayers; P LaytransRes 26; N AcLayer IDS_DEL_TITLE; D AcDimRes 101:54536; P acadres 21502 |
| Layers | Status, Name, On, Lock, Color, Linetype, Lineweight; On/Off; Locked/Unlocked | 状态, 名称, 开, 锁定, 颜色, 线型, 线宽; 开/关; 锁定/解锁 | N AcLayer Status, Name, On, Lock, Color, Linetype, Lineweight; P AcOpmExtRes 238, 237; P ax26res 921, 1002 |
| Layers | Objects; Layer color; Layer list; Next/Previous columns; the rename hint | 对象; 图层颜色 †; 图层列表 †; 下一组列 †, 上一组列 †; 再次单击选定图层的名称可将其重命名 † | P acadres 21092 (图层颜色 in acadres 4217's sentence) |
| Layers | Layer - Not Deleted; - Current Layer Off; - Rename | 图层 - 未删除; 图层 - 关闭当前图层; 图层 - 重命名 | T AcTaskDialogs |
| Layers | The selected layer was not deleted.; The following layers cannot be deleted:; the four bullets | 未删除选定的图层。; 无法删除以下图层:; 图层 0 和图层 Defpoints, 当前图层, 包含对象的图层, 依赖外部参照的图层 | T AcTaskDialogs |
| Layers | The current layer will be turned off…; Turn…off; the note; Keep…on | 当前图层将被关闭。希望执行什么操作？; 关闭当前图层; 从现在起，创建的对象将不会显示在图形中，直至重新打开图层。; 使当前图层保持打开状态 | T AcTaskDialogs |
| Layers | The selected layer cannot be renamed.; The following layers cannot be renamed:; Layer 0 | 无法重命名选定图层。; 无法重命名以下图层:; 图层 0 | T AcTaskDialogs |
| Layers | Layer - Name Already Exists; The name, {name}, is already in use.; You will need to enter a different name. | 图层 - 名称已经存在 † (after %ObjectName% - 名称已经存在); 名称 {name} 已在使用。; 您需要输入其他名称。 | T AcTaskDialogs |
| Layers | Invalid characters in layer name.; The following characters are not valid in layer names: | 图层名中包含无效的字符。; 图层名称中不得含有以下字符: | N AcLayer LayerErrorInvalidChars, IDS_NOM_BAD_CHARSET_ESN_LAYER (its first line) |
| Palettes' frame | Layer Properties Manager (its title bar); Close, Properties (the title bar's buttons); Move, Size, Close, Allow Docking (its properties menu); the three Ctrl hints while it is dragged | 图层特性管理器; 关闭, 特性; 移动, 大小, 关闭, 允许固定; 按 Ctrl 键可防止固定窗口。 按 Ctrl 键允许固定窗口。 松开 Ctrl 键可防止固定窗口。 | X WorkspaceRoot XLS_00014402 (acad.CUIX); adui26res.dll 61536, 15, MENU 134 (PaletteOptionsMenu: 32775, 32776, 32774, 32778), 17, 19, 20 (the 2027.1 update's acadlp.adix) |
| Palettes' anchoring | Anchor Left, Anchor Right, Auto-hide (the properties menu); Auto-hide (the title bar's button) | 锚点居左, 锚点居右, 自动隐藏; 自动隐藏 | adui26res.dll MENU 134 (PaletteOptionsMenu: 32793, 32791, 32777; the trailing < and > drawn apart, a physical side's sign), 14 (the language pack's acadlp.adix, ~/autocad-packs: the 2027.1 update was not on disk; its menu's Move, Size, Close and Allow Docking read as the 2a's from the update) |
| Dialogs | Drawing Units; Length; Type; Precision; Decimal; Insertion scale; Sample output | 图形单位; 长度; 类型; 精度; 小数; 插入时的缩放单位; 输出样例 | D unitsRes 500:title, 500:1000, 500:1001, 500:1003, 500:1017, 500:1013; P unitsRes 28 |
| Dialogs | Units to scale inserted content:; Millimeters; Centimeters; Meters | 用于缩放插入内容的单位:; 毫米; 厘米; 米 | D unitsRes 500:1011; P acadres 3404–3406 |
| Dialogs | Save Drawing As; File name:; Files of type:; Tools; Options…; Save | 图形另存为; 文件名:; 文件类型:; 工具; 选项…; 保存 | P acadres 21405; D acadres 131:13008, 131:13009, 131:13005; P acadres 13111; D acadres 131:1 |
| Dialogs | MellowCAD Drawing (*.ecad.json) | MellowCAD 图形 (*.ecad.json) | † (after acadres 6's 图形 (*.dwg)) |
| Dialogs | AutoCAD 20xx DXF (*.dxf) | as English | P acadres 4711, 18756, 33800, 51521, 51928 (unchanged in Chinese) |
| Dialogs | Saveas Options; DXF Options; Format; BINARY; Select objects; Save thumbnail preview image | 另存为选项; DXF 选项; 格式; 二进制; 选择对象; 保存缩略图预览图像 | D acadres 2489:title; P acadres 4850; D acadres 5103:9387, 5103:1361, 5103:1403, 5103:1539 |
| Dialogs | Decimal places of accuracy (0 to 16) | 精确的小数位数 (0 到 16) | D acadres 5103:958 |
| Dialogs | Point Style; Point Size:; Set Size Relative to Screen; in Absolute Units; Units; Invalid input. | 点样式; 点大小:; 相对于屏幕设置大小; 按绝对单位设置大小; 单位; 输入无效。 | D acddptyperes 101:title, 101:1003, 101:1001, 101:1002; P acddptyperes 11, 13 |
| Dialogs | Point display images | 点显示图像 | † |
| Dialogs | Properties - Locked objects; One or more selected objects are locked…; Number of objects removed… | 特性 - 锁定的对象; 一个或多个选定对象已锁定，无法更新。; 从选择集中删除的对象数: {count, number} | T AcTaskDialogs |
| Dialogs | Multiline Text - Unsaved Changes; Do you want to save your text changes?; Yes; No; Cancel | 多行文字 - 未保存的更改; 是否保存文字更改？; 是; 否; 取消 | T AcTaskDialogs; N AcWindows BP_YesValue, BP_NoValue |
| Dialogs | OK; Cancel; Close; Selection | 确定; 取消; 关闭; 选择集 | D unitsRes 500:1, 500:2; AcDimRes 101:1; acadres 25307:title |
| Text style | Text Style; Current text style:; Styles:; All styles; Styles in use; Font; Font Name:; Size; Height; Set Current; New...; Delete; Apply; Cancel; Close; New Text Style; Style Name:; OK | 文字样式; 当前文字样式:; 样式:; 所有样式; 正在使用的样式; 字体; 字体名:; 大小; 高度; 置为当前; 新建...; 删除; 应用; 取消; 关闭; 新建文字样式; 样式名:; 确定 | D acadres 515 (title, 33884, 967, 2098, 920, 2097, 33886, 1258, 1257, 1259, 915, 917), 306 (2105, 1); P acadres 9038, 9039, 9033, 5835 (Close, what Cancel becomes after Apply); 920's trailing space dropped |
| Dim styles | Dimension Style Manager; Current dimension style:; Styles:; List:; All styles; Styles in use; Set Current; New...; Modify...; Close; Set current; Rename; Delete (the manager, its list's menu) | 标注样式管理器; 当前标注样式:; 样式:; 列出:; 所有样式; 正在使用的样式; 置为当前; 新建...; 修改...; 关闭; 置为当前; 重命名; 删除 | D AcDimRes 701 (title, 3018, 3010, 3033, 3027, 3028, 1); P AcDimRes 5601, 5610, 5611; the Styles list's shortcut menu, AcDimRes MENU 706 (0xA5A4, 0xA5A1, 0xA5A2) |
| Dim styles | Create New Dimension Style; New Style Name:; Start With:; Continue; Cancel; New Dimension Style:; Modify Dimension Style:; OK; Lines; Symbols and Arrows; Text; Fit; Primary Units (Create New, New and Modify, their tabs) | 创建新标注样式; 新样式名:; 基础样式:; 继续; 取消; 新建标注样式:; 修改标注样式:; 确定; 线; 符号和箭头; 文字; 调整; 主单位 | D AcDimRes 702 (title, 3003, 3005, 3045, 2), 304:1; P AcDimRes 5609, 5608, 6000–6003, 6013 |
| Dim styles | Dimension lines; Baseline spacing:; Extension lines; Extend beyond dim lines:; Offset from origin:; Arrowheads; Arrow size:; Center marks; None; Mark; Text appearance; Text height:; Text placement; Offset from dim line:; Scale for dimension features; Use overall scale of:; Fine tuning; Draw dim line between ext lines; Linear dimensions; Precision; Decimal separator:; Zero suppression; Trailing; Angular dimensions; Precision: (the tabs' groups and labels) | 尺寸线; 基线间距:; 尺寸界线; 超出尺寸线:; 起点偏移量:; 箭头; 箭头大小:; 圆心标记; 无; 标记; 文字外观; 文字高度:; 文字位置; 从尺寸线偏移:; 标注特征比例; 使用全局比例:; 优化; 在尺寸界线之间绘制尺寸线; 线性标注; 精度:; 小数分隔符:; 消零; 后续; 角度标注; 精度: | D AcDimRes 302 (2563, 2567, 2569, 2574, 2575), 301 (2570, 2579, 2571, 2702, 2703), 303 (2619, 2622, 2628, 2626), 305 (2590, 2682, 2591, 2687), 307 (2592, 2713, 2596, 2602, 2653, 2603, 2606) |
| Dim styles | ',' (Comma); '.' (Period); ' ' (Space) (the Decimal separator list) | “,” (逗点); “.” (句点); “ ” (空格) | P acdb26res 6151, 6150, 6152 |
| Blocks | Blocks; the filter, its label, the empty and no-match texts; {count} in drawing | 块; 过滤器（允许使用 ? 和 *）†, 过滤块 †, 未定义任何块。请先绘制对象，然后运行 BLOCK 命令。†, 没有与过滤器匹配的块。†; 图形中有 # 个 † | N AcWindows BP_PaletteSetName |
| Palettes | Palettes; Fold; Show; Palette width | 选项板; 折叠选项板 †; 显示选项板 †; 选项板宽度 † | X ID_PanelPalettes; P acadres 5974 (宽度) |

Also ours (†): the canvas's name 绘图区域 (after acadres 7015:1861's 绘图区域中使用快捷菜单); the save state 已保存, 已保存到此设备; the ViewCube's roll arrows and the four adjacent-face tooltips (查看上方/下方的面, 查看左侧/右侧的面); 捕捉 X, 捕捉 Y, 极轴捕捉距离, 极轴追踪角度, 选择循环设置; MellowCAD 图形 (*.ecad.json); 图层颜色, 图层列表, 下一组列, 上一组列, the rename hint, 图层 - 名称已经存在; the six "…of the selected objects" labels (选定对象的…); the Blocks palette's filter, its label, its empty and no-match texts and its count (图形中有 # 个); the palette's fold, unfold and width; the Point Style's 点显示图像; the command line's parentheses and list (`（LINE、TR、CO…）`, full-width as Chinese text writes them, after 键入命令); and the messages composed from sourced words: `将 {name} 置为当前图层`, `{name} 的颜色/线型/线宽`, `删除图层 {name}`, `重命名图层 {name}`. Overridden against the most frequent wording because the row's place says otherwise: `measure` 测量 (the ribbon's split button, not MEASURE's 定距等分), `dimchain` 连续 (the ribbon, not the buttons' 继续), `ShortcutMenu.enter` 确认 (the command menu's own label, PopMenuRoot ACAD_1758 `确认(&E)` and acadres 310:1901, not the macro's name 输入), `ViewCube.home` 主页 (the cube's menu, AcVMToolsRes 47021, not the Home tab's 默认), `SelectionCycling.title` 选择集 (acadres 25307:title, not 选择), `Units.decimal` 小数 (unitsRes 28), `Units.insertionScale` 插入时的缩放单位 (the dialog's group, unitsRes 500:1017, not acadres 796's 插入比例), `SaveAs.binary` 二进制 (the dialog, not acadres 20557's BINARY), `DimStyle.lines` 线 (the dialog's tab, AcDimRes 6000, not 直线), `DimStyle.fit` 调整 (AcDimRes 6002, not 布满), `DimStyle.textHeight` 文字高度 (AcDimRes 303:2622, not 文本高度), `PointStyle.invalid` 输入无效。 (acddptyperes 13), `NavigationBar.window` 窗口缩放 (AcVMToolsRes 47105, not 缩放窗口), `ViewCube.unnamed` 未命名. Dialog labels drop the accelerator and keep the half-width colon the Chinese resource writes after it (`文件名(&N):` → `文件名:`, `点大小(&S):` → `点大小:`); a label English writes without a colon (Units' 类型, 精度) takes none, unless the resource writes one (the Primary Units page's `精度(&P):` → `精度:`). The task dialogs' list headings end in the resource's half-width colon (`无法删除以下图层:`), and `Repeat {command}` keeps the resource's `重复%s` with no space before the command name.

### The engine (`cad/locales/zh-CN.json`, `interface`)

| Area | English | Chinese | Source |
| --- | --- | --- | --- |
| Draw | Line; Polyline; 3D Polyline; Circle; Diameter circle; 2-Point circle; 3-Point circle | 直线; 多段线; 三维多段线; 圆; 圆, 圆心、直径; 圆, 两点; 圆, 三点 | P ax26res 298, 296, 280, 285; X ID_CircleDia, ID_Circle2pt, ID_Circle3pt (Name) |
| Draw | Arc; Start, Center, End arc; Center, Start, End arc; Ellipse; Center ellipse; Elliptical arc | 圆弧; 圆弧, 起点、圆心、端点; 圆弧, 圆心、起点、端点; 椭圆; 椭圆, 中心点; 椭圆弧 | P ax26res 282; X ID_ArcStCeEn, ID_ArcCeStEn; P ax26res 293; X ID_EllipseCe, ID_RBN_CMDBTN_ELLIPSEAR |
| Draw | Spline; Spline Fit; Spline CV; Edit Spline; Edit Polyline | 样条曲线; 样条曲线拟合; 样条曲线控制点; 编辑样条曲线; 编辑多段线 | P ax26res 312; X ID_RBN_CMDBTN_SPLINE, ID_RBN_8218, ID_RBN_CMDBTN_SPLINEDIT, …PEDIT |
| Draw | Rectangle; Polygon; Hatch; Text; Multiline text; Edit text | 矩形; 多边形; 图案填充; 单行文字; 多行文字; 编辑文字 | X ID_RBN_CMDBTN_RECTANG_0001, …POLYGON_0001; P ax26res 295; X ID_Text (and its ribbon button), ID_RBN_0020; D texteditRes 101:title |
| Draw | Multiple Points; Point Style; Construction Line; Ray; 2D Solid; 3D Face; Wipeout | 多点; 点样式; 构造线; 射线; 二维实体; 三维面; 区域覆盖 | X ID_RBN_CMDBTN_POINTMULT, ACAD_171, ID_RBN_CMDBTN_XLINE, …RAY, ID_Solid (Name's last part), ACAD_288, ID_RBN_CMDBTN_WIPEOUT |
| Modify | Move; Copy; Rotate; Mirror; Scale; Stretch | 移动; 复制; 旋转; 镜像; 缩放; 拉伸 | X ID_RBN_CMDBTN_* |
| Modify | Offset; Trim; Extend; Fillet; Chamfer; Erase; Explode; Join | 偏移; 修剪; 延伸; 圆角; 倒角; 删除; 分解; 合并 | X ID_RBN_CMDBTN_* |
| Modify | Break; Break at point; Array; Rectangular, Polar, Path array | 打断; 打断于点; 阵列; 矩形阵列, 环形阵列, 路径阵列 | X ID_RBN_CMDBTN_BREAK, …BREAKSELE, ACAD_357; D AcArrayRes 146:1044, 146:1045; X XLS_00021840 |
| Modify | Match properties; Change properties | 特性匹配; 更改特性 † | X ACAD_335 (ID_UIE_Ai_propch is left `Chprop`) |
| Clipboard | Copy; Cut; Copy with base point; Paste | 复制剪裁; 剪切; 带基点复制; 粘贴 | X ID_RBN_CMDBTN_COPYCLIP_0002, …CUTCLIP_0001, …COPYBASE_0002, …PASTECLIP_0001 |
| Inquiry | Measure; Measure (segments); Divide; Area; List; ID Point; Region/Mass Properties | 测量; 定距等分; 定数等分; 面积; 列表; 点坐标; 面域/质量特性 | X ID_RBN_SPLITBTN_MEASURE, ID_RBN_CMDBTN_MEASURE, …DIVIDE, ACAD_186, RBN_01740411, ACAD_189, ACAD_187 |
| Block | Create block; Insert block; Define, Edit attributes; Attribute display; Purge | 创建块; 插入块; 定义属性, 编辑属性; 属性显示; 清理 | X ID_RBN_SPLITBTN_CREATEBLOCK, MM_1614, ID_RBN_CMDBTN_ATTDEF, ID_RBN_SPLITBTN_ATTRIBUTE, ACAD_147, ID_RBN_CMDBTN_PURGE |
| Block | MINSERT (the tool, the palette's MInsert Block); its Insertion point X; Columns, Column spacing, Rows, Row spacing | 多重插入块; 插入点 X 坐标; 分栏, 列间距, 行数, 行间距 | P ax26res 299, 42, 266–269 |
| Annotate | Linear; Aligned; Horizontal; Vertical; Rotated; Angular; Radius; Diameter | 线性; 对齐; 水平; 垂直; 转角标注; 角度; 半径; 直径 | X ID_RBN_CMDBTN_DIM*; P ax26res 974, 975, 292 |
| Annotate | Baseline; Continue; Adjust space; Leader | 基线; 连续; 调整间距; 引线 | X ID_RBN_CMDBTN_DIMBASELI, …DIMCONTIN, …DIMSPACE; P ax26res 297 |
| 3D | Union; Subtract; Intersect; Box; Wedge; Pyramid; Cylinder; Cone; Sphere; Torus | 并集; 差集; 交集; 长方体; 楔体; 棱锥体; 圆柱体; 圆锥体; 球体; 圆环体 | X ACAD_374, ACAD_375, ACAD_376, ID_RBN_CMDBTN_BOX, …WEDGE, …PYRAMID, …CYLINDER, …CONE, …SPHERE, …TORUS |
| 3D | Extrude; Revolve; Presspull; Slice; Section; Fillet Edge; Chamfer Edge | 拉伸; 旋转; 按住并拖动; 剖切; 截面; 圆角边; 倒角边 | X ID_RBN_8052, ID_RBN_CMDBTN_REVOLVE, …PRESSPULL, ACAD_305, ACAD_306, ID_RBN_0173, ID_RBN_0174 |
| 3D | Solid Editing; Extrude, Move, Rotate, Offset, Taper, Delete, Copy faces | 实体编辑; 拉伸面, 移动面, 旋转面, 偏移面, 倾斜面, 删除面, 复制面 | X ID_PanelSolidEdit, ACAD_1947–1954 |
| Tools | Undo; Multiple redo; System variables; Object snap modes; Snap mode | 放弃; 多重重做 †; 设置变量; 对象捕捉模式; 捕捉模式 | X ACAD_53, ID_Setvar; P acadres 21513, 20021 |
| Tools | Color; Linetype; Lineweight; Linetype scale; Fill; Elevation; Angle precision | 颜色; 线型; 线宽; 线型比例; 填充; 标高; 角度精度 | P acopmRes 136, 138, 140, 139; X ID_Fill, ID_Elev; P ax26res 220 |
| Tools | Layer (command line); Dimension style (command line); UCS icon (variable) | 图层(命令行) †; 标注样式(命令行) †; UCS 图标(系统变量) † | † |
| Views | Zoom; Pan; Pan by points; Regen; Regen All; Viewpoint; Plan view; Preset views; 3D Orbit; Visual Styles | 缩放; 平移; 平移, 点; 重生成; 全部重生成; 视点; 平面视图; 预设视图; 三维动态观察; 视觉样式 | P AcVMToolsRes 47094, 47090; X ID_PanPick, ACAD_64, ACAD_65, MM_0539, ACAD_112; P AcVMToolsRes 4229, 4156; X ID_PanelVisualStyles |
| Views | Top; Bottom; Front; Back; Left; Right | 俯视; 仰视; 前视; 后视; 左视; 右视 | P AcVMToolsRes 4230–4235 |
| Views | SW, SE, NE, NW Isometric; Custom View | 西南, 东南, 东北, 西北等轴测; 自定义视图 | P AcVMToolsRes 4982–4985, acadres 40867 |
| ViewCube | Faces TOP … RIGHT; compass N E S W | 俯视 仰视 前视 后视 左视 右视; 北 东 南 西 | P AcVMToolsRes 629–634; D unitsRes 501:1051–1054 (neither seen on the desktop) |
| Snaps | Endpoint; Midpoint; Center; Node; Quadrant; Intersection | 端点; 中点; 圆心; 节点; 象限点; 交点 | P acadres 70–75 |
| Snaps | Insertion; Perpendicular; Tangent; Nearest; Apparent Intersection | 插入点; 垂足; 切点; 最近点; 外观交点 | P acadres 32998, 77–79, 32997 |
| Snaps | Extension; Parallel | 延长线; 平行线 | D dwgaidsRes 135:1067, 135:1060 |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White; ByLayer | 红, 黄, 绿, 青, 蓝, 洋红, 白; ByLayer | P colorRes 103–109, acui26res 14–21; P acadres 4221, colorRes 16 |
| Objects | Line … Ray (the palette's object names) | 直线, 圆, 圆弧, 椭圆, 样条曲线, 多段线, 三维多段线, 文字, 多行文字, 属性定义, 标注, 图案填充, 块参照, 三维实体, 面域, 点, 实线, 三维面, 引线, 区域覆盖, 光栅图像, 表格, 多重引线, 构造线, 射线 | P ax26res 279–316, 341, 437, 706, 731; X XLS_Name_Dimension |
| Properties | {count} objects; All ({count}) | # 个对象; 全部 ({count}) | P acadres 21354; acopmRes 73 |
| Properties | Array (Rectangular), (Polar), (Path) | 阵列(矩形), 阵列(环形), 阵列(路径) | P ax26res 1218, 1220, 1219 |
| Properties | Rotated, Aligned, Angular, Radial, Diametric Dimension | 转角标注, 对齐标注, 角度标注, 半径标注, 直径标注 | P ax26res 292, 287, 288, 291, 289 |
| Properties | General groups: Geometry; Misc; Text; Position; Pattern; Attributes; Solid History | 几何图形; 其他; 文字; 位置; 图案; 属性; 实体历史记录 | P ax26res 19, 25, 32, 929, 48, 1500, 655 |
| Properties | Data Points; Lines & Arrows; Fit; Primary Units; Definition points; Center; Block | 数据点; 直线和箭头; 调整; 主单位; 定义点 †; 圆心; 块 | P ax26res 74, 143, 141, 142, 13, 727 |
| Properties | Start X; End X; Center X; Delta X; Normal X; Position X; Scale X | 起点 X 坐标; 端点 X 坐标; 圆心 X 坐标; 增量 X; 法向 X 坐标; 位置 X 坐标; X 比例 | P ax26res 7, 10, 14, 52, 28, 31, 43 |
| Properties | Major, Minor axis vector X; Text alignment X; Basepoint X; Second point X; Direction vector X | 长轴矢量 X 坐标, 短轴矢量 X 坐标; 文字对齐 X 坐标; 基点 X 坐标; 第二点 X 坐标; 方向矢量 X 坐标 | P ax26res 47, 46, 36, 64, 65, 66 |
| Properties | Start, End tangent vector X; Origin X; Base X (array); Text position X; First X | 起点切向矢量 X 坐标, 端点切向矢量 X 坐标; 原点 X; 基点 X; 文字位置 X 坐标; 第一点 X 坐标 † | P ax26res 75, 76, 358, 1187, 223 |
| Properties | Vertex; Vertices; Current Vertex; Segments; Start, End segment width; Global width; Fit/Smooth | 顶点; 顶点; 当前顶点; 线段 †; 起始线段宽度, 终止线段宽度; 全局宽度; 拟合/平滑 | P ax26res 553, 271 (顶点数), 18, 1158, 1159, 318, 60 |
| Properties | Radius; Diameter; Area; Circumference; Arc length; Total angle | 半径; 直径; 面积; 周长; 弧长; 总角度 | P ax26res 252, 262, 253, 263, 90, 89 |
| Properties | Rotation; Text height; Text override; Annotative; Associative; Justify | 旋转; 文字高度; 文字替代; 注释性; 关联; 对正 | P ax26res 254, 185, 211, 925, 111, 54 |
| Properties | Invisible; Verify; Constant; Preset; Lock position; Tag; Prompt | 不可见; 验证; 固定; 预设; 锁定位置; 标记; 提示 | P ax26res 257, 259, 258, 260, 359, 34, 33 |
| Properties | Method; Degree; Knot parameterization; Fit tolerance; Weight; CV frame | 方式; 阶次; 节点参数化; 拟合公差; 权值; 控制点框架 | P ax26res 914, 278, 910, 99, 1255, 912 |
| Properties | Columns; Column spacing; Rows; Row spacing; Levels; Level spacing (arrays) | 列; 列间距; 行; 行间距; 级别; 层间距 | P ax26res 1189, 1190, 1194, 1195, 1197, 1198 |
| Properties | Items; Angle between items; Fill angle; Rotate items; Item spacing; Align items | 项数; 项目间的角度; 填充角度; 旋转项目; 项目间距; 对齐项目 | P ax26res 1191, 1193, 1211, 1212, 1192, 1205 |
| Properties | Arrow size; Ext line ext; Ext line offset; Text pos vert; Decimal separator | 箭头大小; 尺寸界线范围; 尺寸界线偏移; 垂直放置文字; 小数分隔符 | P ax26res 174, 217, 182, 191, 149 |
| Properties | Yes; No; Show; Hide; Visible; Hidden | 是; 否; 显示; 隐藏; 可见; 隐藏 | P ax26res 659, 799, 49 |
| Properties | At least; Exactly; Fit; Control Vertices; Chord; SqrtChord; Uniform; Custom | 至少; 精确; 拟合; 控制点; 弦; 弦长平方根; 统一; 自定义 | P ax26res 122, 915, 911 |
| Properties | User-defined; Predefined; Custom; Outer; Divide; Measure; None | 用户定义; 预定义; 自定义; 外部; 定数等分; 定距等分; 无 | P ax26res 84, 114, 1202, 118, 658 |
| Properties | Clockwise; Counter-clockwise; Circumscribed; Inscribed | 顺时针; 逆时针; 外切; 内接 | P ax26res 1210, 820 |
| Properties | Gradient; Gradient: Linear … Inverted curved | 渐变色; 直线形; 圆柱形; 反转圆柱形; 球形; 半球形; 曲线形; 反转球形; 反转半球形; 反转曲线形 | P ax26res 1419, 329 |
| Properties | Leader type; arrow; dim text | 无箭头直线; 无箭头样条曲线; 有箭头直线; 有箭头样条曲线; 实心闭合; 居中; 上方 | P ax26res 115, 1069, 192 |
| Properties | Justify (TEXT) | 左对齐, 居中, 右对齐, 中间, 左上, 中上, 右上, 左中, 正中, 右中, 左下, 中下, 右下 (no letters, as Chinese AutoCAD) | P ax26res 126 |
| Descriptions | U, REDO, -OSNAP, FROM, NEW, QSAVE, SAVE, OPEN, PASTECLIP, DIMSTYLE, LAYER, LAYERCLOSE, PROPERTIESCLOSE | acad.CUIX's HelpString, whole (撤消上一个动作, 恢复上一个用 UNDO 或 U 命令放弃的效果, 设置执行对象捕捉模式, …) | X ID_U, ID_Redo, ID_Osnap, ID_From, ID_New, ID_Save, ID_UIE_Save, ID_Open, ID_Pasteclip, ID_Ddim, ID_Layer, ID_LayerClose, ID_PropertiesClose |
| Descriptions | QNEW, SAVEAS, STYLE, BLOCKSPALETTE, UNITS, PURGE | the HelpString cut to the English: 创建新的图形文件; 以新文件名保存当前图形; 创建和修改文字样式; 打开“块”选项板; 控制坐标和距离的显示精度和格式; 删除图形中未使用的块定义 | X ID_New (for ID_QNew), ID_Saveas, ID_Style, ID_BlocksPalette, ID_Units, ID_Purge |
| Descriptions | SNAP, DXFIN, DXFOUT, INSERT, PROPERTIES, CLEANSCREENON, CLEANSCREENOFF | 限制光标按指定的捕捉间距移动 †; 打开 DXF 文件 †; 将当前图形保存为 DXF 文件 †; 从“块”选项板插入块 †; 显示选定对象的特性 †; 清除屏幕上的工具栏和选项板 †; 恢复“全屏显示”之前的显示状态 † | † (全屏显示 is ID_CleanScreen's Name; 捕捉间距 acadres' SNAP prompt) |
| Descriptions | RIBBON, RIBBONCLOSE | 显示功能区; 隐藏功能区 | the 2027 help pages' (GUID-EC71B17B, GUID-A9EE8263, CHS), no final period |

Also ours (†): 更改特性 (Chinese AutoCAD leaves CHPROP's menu name `Chprop`; the names list's word, after the
help's 更改对象的特性), 多重重做 (MREDO has no name of its own: ID_Redo is 重做; 多重 as in 多重插入块,
多重引线), the dashed command-line tools' (命令行) and UCS 图标(系统变量) (half-width parentheses, as
the palette's 阵列(矩形)), 定义点 (defpoints), 第一点 X/Y 坐标 (after ax26res 65's 第二点 X 坐标),
线段 for Segments (after ax26res 1158's 起始线段宽度; the only pairings, 分段 and 段, are a render
setting and a .NET enum), and the descriptions of SNAP, DXFIN, DXFOUT, INSERT, PROPERTIES,
CLEANSCREENON and CLEANSCREENOFF, written as acad.CUIX's help strings are (no final period); QNEW,
SAVEAS, STYLE, BLOCKSPALETTE, UNITS and PURGE take their HelpString cut to what the English says
(ID_QNew says 空白的图形文件, ID_Saveas adds 的副本, ID_Style 或指定, ID_BlocksPalette 打开或关闭,
ID_Units 角度 for distances, ID_Purge lists 命名项目，如块定义和图层). Overridden against the most
frequent/single pairing because the row's place says otherwise: `dimrotated` 转角标注 (AcDimRes 5853
is left `ROTATED`; the palette's ax26res 292), `setvar` 设置变量 (the only pairing is an Express
Tools title left in English; ID_Setvar's Name), `U`'s description 撤消上一个动作 (ID_U's HelpString,
like every other description, not acadres 16161's 放弃最后一个动作), the compass 北 东 南 西 (unitsRes
501, as Korean and Japanese; the single pairings are the untranslated `N` `E` `W`), `insertionPointX/Y/Z`
插入点 X 坐标 (the palette's ax26res 42, not AcBIMUnderlayRes' 插入点 X), `gradientLinear` 直线形 and
`gradientInvCylinder` 反转圆柱形 (the palette's ax26res 329, not AcAuthEnvironRes' 线性 and AcFieldRes'
反转柱形), `text` 单行文字 (ID_Text and its ribbon button, the names list's TEXT; the most frequent 文字
is the palette's group and object), `copyclip` 复制剪裁 (the ribbon's, not COPY's 复制), `measure` 测量
(the ribbon's split button, not MEASURE's 定距等分), `dimcontinue` 连续 (the ribbon, not 继续),
`dimvertical` 垂直 (ax26res 975; the ribbon's 竖直 is the geometric constraint's), `scale` 缩放 (the
ribbon, not the palette's 比例, which the palette rows keep), the snaps' 圆心, 切点, 垂足, 插入点,
延长线, 平行线 (acadres 72–78, dwgaidsRes 135, not the more frequent 中心/居中, 相切, 垂直, 平行),
`fit` 调整 and `fitPoints` 拟合 (ax26res 141 and 915: the dimension's group and the spline's method),
`constant` 固定 (ax26res 258, not acdb26res' 常数), `degree` 阶次 (ax26res 278, not acadres' 阶数),
`minsertColumns` 分栏 and `minsertRows` 行数 (ax26res 266, 268: MInsert's rows; arrays keep 1189's 列
and 1194's 行), and the ViewCube's faces 俯视 … 右视 (AcVMToolsRes 629–634, the id Korean and Japanese
took, not the Aec 顶部/底部). Colour 4 is 青 (colorRes 107, acui26res 17, acadres 4507); ByLayer stays
`ByLayer` as acadres 4221, colorRes 16 and the Properties toolbar show it (AecBaseRes' 随图层 is
Architecture's). `*VARIES*` is not an `interface` key (ax26res 782 says *多种*).

## Register

- **The help's 书面语**: impersonal, plain and dry, short sentences; 可以 and 请 where natural, 您
  only where a sentence addresses the reader. The editor's labels as Chinese AutoCAD words them.
- **Mainland usage**, never Taiwan's: 命令 (not 指令), 文件 (not 档案), 默认, 鼠标, 屏幕, 信息.
- **Full-width punctuation** in Chinese text (，。：；？！、（）“”《》); a half-width space between a
  Chinese run and a latin word, a code span or a number («OFFSET 命令», «按 Enter 键», «2D 图形»),
  none next to full-width punctuation. The generated pages end a list item's label with a
  full-width colon and quote with “…” (`lib/docs/generate.ts`).
- Keys as the help writes them: «按 Enter 键», «Esc 键», «Shift 键».
- **Commands by their global name**, the ribbon's word in full-width parentheses in titles and at
  a first mention («OFFSET（偏移）命令»).

## Search texts

Baidu's suggestions and Google's (`hl=zh-CN`, `gl=cn` and `gl=sg`), 78 seeds (21/11/2026), and the
visibility audit (`~/seo-data/audit-2026-11-05/languages.md`, B.2: China 40 on its Google-only
index, Google 2.3 % of China's searches; Wikipedia's Chinese «AutoCAD», 11,592 views in 12 months).
No results page was read. Google's Chinese suggestions mix Taiwan's words (指令, 档案): the copy
uses the mainland's.

- **The generic terms** say «cad», rarely «autocad»: «在线cad» (画图, 查看, 编辑, 看图), «cad在线»
  (画图工具, 网页版), «网页版cad» and «cad网页版» (在线设计, 在线画图), «免费cad软件», «cad免费版».
  Baidu's «cad» is mostly viewers («cad快速看图», «cad看图王»). «autocad在线» and «autocad免费» look
  for Autodesk's own products: never a claim.
- **A command** is searched by its ribbon word after «cad», with 命令, 快捷键, 怎么用, 怎么操作:
  «cad偏移命令快捷键», «cad修剪怎么操作», «cad圆角命令怎么用», «cad阵列», «cad镜像», «cad拉伸»; the
  English name too («cad offset», «cad中OFFSET是什么意思», «CAD TR命令»).
- **The command list**: «cad快捷键命令大全» (一览表, 图片, 使用方法), «cad命令大全» (图表, 完整版):
  an alias is a «快捷键» to its searchers (the help's word is 命令别名).
- **Practice**: «cad练习图», «cad练图100例», «cad练习题», «cad绘图练习», «cad入门» (简单图, 图纸),
  «cad机械图», «cad户型图», «cad平面图».
- **DXF**: «dxf在线查看» (查看器, 预览, 打开), «dxf文件用什么打开», «dxf在线编辑器», «dxf查看器».
- **The guides**: «cad平面图怎么画», «cad户型图», «cad坐标» (输入, 相对坐标), «cad三维» (建模,
  三维转二维), «cad快捷键», «cad入门»; the differences page answers «autocad和中望cad区别» (ZWCAD
  中望, GstarCAD 浩辰, the compatible programs sold in China).

## The site's words

The site, the "Use" pages, the 104 command notes and the 12 exercises were written from the
English by agents on one brief (register, the names list, the search texts), each file through
`docs:check`. Its choices with no Autodesk word, for the native reader: **快捷键** for alias, what Chinese
users call it and search («cad快捷键命令大全»; the help's 命令别名 named once on the commands and the
shortcuts pages: «快捷键即 AutoCAD 所说的命令别名», «快捷键（命令别名）») †; 键盘快捷键 for the keys' page,
with F 功能键 and Ctrl 组合键 †; 选项字母 for "option letters" (the letter in a prompt's 通过(T)) †;
编辑器 for the editor †; 图形 for a drawing as the help has it, and 题图 for an exercise's given drawing
(its "The drawing" heading) †; the landing's groups 组织 and 查询与视图 †; 制图员 for drafters and 创客
for makers †; 机房 for the lab †; 实体图元 for primitives (the help's «三维实体图元») and 特征历史 for a
feature history †; MellowCAD 自有的版本化格式 for "MellowCAD's own versioned format" †; 面包屑导航
for the breadcrumb †; 练习图 for an exercise in titles and links (the search word; 练习 for the kind and
in running text) †; the title block's 图号, 版次, 比例 and 张次 with «第 1 张，共 1 张» (a Chinese title
block's 共 张 第 张) †; the exercises' layers 轮廓线, 中心线, 虚线 (hidden lines as Chinese drafting
names the layer, where AutoCAD's linetype says 隐藏线) and 标注 †; 数据一览 for "in numbers" †;
等轴测 and 西南等轴测 (the help's view names); 窗口 / 窗交 and 亮显 are the help's. 您 is used where the
English addresses the reader's own things (您的设备, the privacy page), never 你. GDPR is cited as
«GDPR 第 6 条第 1 款 (f) 项», and the EU–U.S. framework as «欧盟—美国数据隐私框架».

The notes' and pages' own choices, for the native reader: 开启线, 门扇, 门轴 and 洞口边线 for a door's
swing, leaf, hinge and jambs (Chinese architectural drafting) †; 锁定角度 for a typed `<30` (the help
calls it 角度替代) †; 钩线 for LEADER's hook line †; 嵌套项目 and 孤立数据 for -PURGE's options, in no
table †; 目标对象 for MATCHPROP's destination †; 水平折线 for a radius dimension's landing (the
multileader's 基线 would read as a baseline) †; the exercises' parts as GB drafting names them —
轴承座, 凸台, 轴孔, 螺栓孔, 法兰盘 with its 螺栓孔中心圆 (not a gear's 分度圆), 垫片, 键槽, 阶梯轴 and 轴肩,
带轮 with 轮毂, 腹板 and 轮缘, 连杆, 安装板, 直跑楼梯 with 踏步, 地块 and 地块边界, the shaft's 主视图 †.
Dialog and palette labels the tables do not hold were written as Chinese AutoCAD words them and
are **unverified**: the Dimension Style Manager's rows beyond those of the editor's catalog, the
Enhanced Attribute Editor (增强属性编辑器), the Linetype Manager's 全局比例因子 and 当前对象缩放比例,
HATCH's contextual tabs (图案填充创建, 图案填充编辑器), the Drafting Settings dialog (草图设置) and
the menu shown while panning. Option words in prose are each command's own, from its prompt in
the tables (`pair.mjs --lang zh-CN`); a question's title is written as it is searched, «CAD» run
into the Chinese («CAD阵列后怎么分解？»), and its answer's prose spaced.

## Command names

The ribbon's and the menus' Chinese names (acad.CUIX, 21/11/2026), in brackets in the commands'
titles. Chinese AutoCAD gives one word to two commands three times, and so does this site:
STRETCH and EXTRUDE are 拉伸, SCALE and ZOOM 缩放, ROTATE and REVOLVE 旋转; Chinese searchers mean
STRETCH and SCALE by «cad拉伸» and «cad缩放», and the global name in the title tells them apart:
-OSNAP 对象捕捉 · 3DORBIT 三维动态观察 · 3DPOLY 三维多段线 · ARC 圆弧 · AREA 面积 · ARRAY 阵列 ·
ARRAYPATH 路径阵列 · ARRAYPOLAR 环形阵列 · ARRAYRECT 矩形阵列 · ATTDEF 定义属性 · ATTDISP 属性显示 ·
ATTEDIT 编辑属性 · BLOCK 创建块 · BOX 长方体 · BREAK 打断 · CHAMFER 倒角 · CHAMFEREDGE 倒角边 · CHPROP
更改特性 † (the menu leaves it `Chprop`; the help: «更改对象的特性») · CIRCLE 圆 · COLOR 颜色 · CONE
圆锥体 · COPY 复制 · COPYCLIP 复制剪裁 · CYLINDER 圆柱体 · DIMALIGNED 对齐 · DIMANGULAR 角度 ·
DIMBASELINE 基线 · DIMCONTINUE 连续 · DIMDIAMETER 直径 · DIMLINEAR 线性 · DIMRADIUS 半径 · DIMSPACE
调整间距 · DIMSTYLE 标注样式 · DIST 距离 · DIVIDE 定数等分 · EATTEDIT 编辑属性 · ELLIPSE 椭圆 · ERASE
删除 · EXPLODE 分解 · EXTEND 延伸 · EXTRUDE 拉伸 · FILLET 圆角 · FILLETEDGE 圆角边 · HATCH 图案填充 ·
ID 点坐标 · INSERT 插入块 · INTERSECT 交集 · JOIN 合并 · LAYER 图层特性 · LEADER 引线 · LINE 直线 ·
LINETYPE 线型 · LIST 列表 · LTSCALE 线型比例 · LWEIGHT 线宽 · MASSPROP 面域/质量特性 · MATCHPROP 特性匹配
· MEASURE 定距等分 · MINSERT 多重插入块 · MIRROR 镜像 · MOVE 移动 · MTEXT 多行文字 · OFFSET 偏移 · PAN
平移 · PEDIT 编辑多段线 · PLAN 平面视图 · PLINE 多段线 · POLYGON 多边形 · PRESSPULL 按住并拖动 ·
PROPERTIES 特性 · PTYPE 点样式 · PURGE 清理 · PYRAMID 棱锥体 · RAY 射线 · RECTANG 矩形 · REDO 重做 ·
REGION 面域 · REVOLVE 旋转 · ROTATE 旋转 · SCALE 缩放 · SECTION 截面 · SLICE 剖切 · SNAP 捕捉 ·
SOLIDEDIT 实体编辑 · SPHERE 球体 · SPLINE 样条曲线 · SPLINEDIT 编辑样条曲线 · STRETCH 拉伸 · STYLE 文字样式
· SUBTRACT 差集 · TEXT 单行文字 · TEXTEDIT 编辑文字 · TORUS 圆环体 · TRIM 修剪 · UCS · UCSICON UCS 图标 ·
UNDO 放弃 · UNION 并集 · UNITS 单位 · VIEW 视图管理器 · VSCURRENT 视觉样式 · WEDGE 楔体 · XLINE 构造线 ·
ZOOM 缩放.

## Script and font

- **The system's Simplified Chinese faces**, no web font: `--font-sans` and `--font-mono` take Inter
  or Geist Mono first (latin and digits), then PingFang SC, Hiragino Sans GB, Microsoft YaHei UI,
  Microsoft YaHei, Noto Sans CJK SC, Source Han Sans SC and Noto Sans SC (`lib/fonts.ts`,
  `SIMPLIFIED_CHINESE_SYSTEM_FACES`). WHY: Japanese's; a Chinese web font is a hundred
  `unicode-range` files and more. **No Japanese face among them**: Han characters Chinese shares
  with Japanese are drawn otherwise in a Japanese face (直, 骨), so the stack names Chinese faces
  only, and `lang="zh-CN"` stays on everything Chinese.
- **The share card** takes Noto Sans SC 600 (SIL OFL) cut to the characters of the Chinese cards
  (`assets/fonts/noto-sans-sc-card-600.woff`, `assets/fonts/README.md`), held to them by a test.
- **No italic and no tracking**, as Japanese; a line keeps its punctuation off its start
  (`line-break: strict`). `:lang(zh)` in both stylesheets, sharing Japanese's rules.
- **Line breaks**: Chinese does not space its words, and a browser breaks between any two
  characters, which is how Chinese breaks: no `keep-all` (Korean's), and no phrase rule (Chrome's
  `auto-phrase` segments Japanese only).

## Plurals

`Intl.PluralRules("zh-CN")` has only `other`: a plural is its `other`, a count takes its measure
word («3 个对象»).

## Input

Chinese is typed through an IME's composition (Pinyin, Wubi), which `isImeKey` hands to the IME
(Japanese's fix): a composing Enter or Escape never answers the command line, the dynamic input
or a field that commits on Enter. A command is typed in the IME's English mode (Shift), as in
AutoCAD; in Chinese mode the IME composes the letters, and its punctuation is full-width (`，` for
`,`), which neither AutoCAD nor `/zh-cn/draw` takes as a coordinate separator (AutoCAD's
unverified on the desktop: the pack is not installed). On the drawing no IME composes (no editable
target), so a command typed there is latin as typed.

## Reaching the site from China

Unverified. The pages are files served through Cloudflare's free plan, which has no network in
mainland China and is commonly reachable from it, slowly; nothing on a page calls a service China
blocks (the fonts are self-hosted, the analytics same-origin). Not tested from inside China.
Baidu's webmaster tools (submitting the sitemap) need an account of the owner's.

## Going live

On 22/11/2026, from production builds (`vercel build`, offline; every page `○` or `●` but `/mcp`):

- **The landing's first load**, Brotli q11 of every response until the network is idle, in bytes,
  Chinese a draft (`435cae6c`) and live with the cut below: `/` 253,707 → 252,007, `/es` 255,000 →
  253,397, `/pt-br` 255,312 → 253,604, `/ar` 278,613 → 276,959, `/fr` 256,009 → 254,200 (1,800
  under 250 KiB), `/it` 255,095 → 253,498, `/de` 255,339 → 253,784, `/ru` 288,798 → 287,271, `/pl`
  269,762 → 268,070, `/cs` 269,635 → 267,973, `/hu` 270,175 → 268,452, `/ja` 255,985 → 254,188,
  `/ko` 255,580 → 253,897; `/zh-cn` 255,069 → 253,166, under the 250 KiB of a page with no script
  font: the system's faces cost it nothing.
- **`/fr` was 9 bytes over 250 KiB with Chinese a draft** (its `:lang(zh)` rules and routing
  tables reach every landing), and going live adds some 100 more. **The cut**: a server
  component's inlined SVG is written twice, in the HTML and in the router's payload, a JavaScript
  string that escapes every `"`, so Brotli found nothing of the first copy in the second (4.3 KB
  of `/fr` were the figures' payload copies). `inlineSvg` (`lib/svg-inline.ts`) quotes their
  attributes singly, which the string leaves alone: the payload's copy now matches the HTML's
  between tags, some 1.7 KB less on every landing, and on every docs page with a figure.
- **The checks in Chrome**: `/zh-cn` at 360 px, nothing wider than the viewport, the H1 in the
  system's Chinese face behind Inter, `line-break: strict`, the hreflang set with `zh-CN` and
  «简体中文» in every landing's language links; `/zh-cn/draw` at 1280×720, no text clipped in the
  bars or the palettes, the placeholder «键入命令（LINE、TR、CO…）»; the share card. **The IME**:
  with `LINE` in the command line, a composing Enter (`keyCode` 229) left it there, a character
  composed through Chrome's IME (`Input.imeSetComposition`) went into the field, and a plain Enter
  ran LINE. The list of the landing's examples (`L（LINE）、TR（TRIM）和EXT（EXTRUDE）`) is
  `Intl.ListFormat`'s for `zh-CN`: CLDR's, unspaced around 和.

## Review

**No native reader yet**: pending, as Japanese's and Korean's. Instead, on 22/11/2026, **a model's
second reading**: an agent given the task and a sample, not this file's reasoning — the site's,
the editor's and the engine's catalogs, six command notes (OFFSET, TRIM, HATCH, LINE, LAYER,
DIMLINEAR), three "Use" pages and two exercises, each beside its English — read as a mainland
technical editor who uses Chinese AutoCAD. It found the editor's and the engine's catalogs
faithful to Chinese AutoCAD, no Taiwan usage, and: meaning that drifted (HATCH returning "to the
picked point" where AutoCAD returns to the prompt for one; the open-DXF page promising input
"exactly" Chinese AutoCAD's; the privacy page's 负责人 for the GDPR's controller, 控制者; the FAQ's
标准 for "the spec"), option words Chinese AutoCAD contradicts (-HATCH's 绘制边界 and 颜色 for
绘图边界 and 图案填充颜色, 25031), and patterns then fixed in every file: 快捷键 naming both the
aliases and the keys' page (the keys are now 键盘快捷键), 别名 beside 快捷键, 撤销 and 撤回 beside
AutoCAD's 放弃, 账户 beside 账号, «0 图层», the flange's bolt circle named three ways, «CAD» run into
the Chinese in some titles and spaced in others (now spaced everywhere, as the help spaces latin
words), and calques (从不, 作为一个步骤, 相对其…处). Every option word the 104 notes name in Chinese
was then checked against its command's prompt in the tables (14 changed: the hot grip's 比例缩放,
25365; ARRAYRECT's 轴夹角, AcArrayRes 5734; SPLINE's 阶次, 1829…). UNDO's search title keeps
«撤销», what its searchers type, beside AutoCAD's 放弃.

Where a native reader should look first: the terms marked † above, the search titles and
descriptions (written from the suggestions, never tested against a Chinese searcher), the
dialog and palette labels the tables do not hold (marked unverified above), the exercises' GB
drafting words, and the ViewCube's faces and compass, never seen on the desktop.
