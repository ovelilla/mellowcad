# Korean (`ko`)

> **Command language:** `global`, English AutoCAD's. **Status:** `live` since 20/11/2026.
> **Review:** none by a native speaker yet; a model's second reading (see "Review").

`/ko/draw` is AutoCAD with its interface in Korean — the palettes, the ribbon's words, the menus,
the tooltips, the status bar and the dialogs as Korean AutoCAD words them — and a command line
that speaks English AutoCAD: the same names, aliases, prompts and option letters as `/draw`.

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Korean (culture `ko-KR`):
  `Autodesk_AutoCAD_2027_Korean_Language_Pack.exe`, 245,459,096 bytes, SHA-256
  `2d79dcf86060a2ef91cf8cabac73679f6a93613158b38e4b638c853ab8a79e05`, at
  `https://up1.autodesk.com/prd/2027/ACD/13D044FF-9A71-3BFB-8914-AA18ADD34FEA/` (ceethreedee.com's
  "Civil 3D 2027 Download all the extensions"). **Not installed**: opened with 7-Zip's own Linux
  build, never run (20/11/2026). The string tables are the 2027.1 update's (`ko-KR/acadlp.adix`
  and `ko-KR/acadsharedlp.adix` of `AutoCAD_2027.1_Update.exe`, which every culture's DLLs ride
  in): `research/strings/all_ko.tsv`; `acad.pgp` and `acad.CUIX` are the pack's.
- **The interface words** were paired by id, English resource against Korean, with
  `propose-interface.mjs --lang ko --catalog engine|editor --pack <folder>`
  (`research/proposals/ko-*.md`): the engine's interface 222 labels settled by one wording, 196 by
  several (the catalog row's place decided), 99 by none (ours, marked below); the editor's 103,
  94 and 89.
- **The commands' Korean names** are the ribbon's and the menus' (`acad.CUIX`'s `MenuMacro`
  names: `간격띄우기` for `^C^C_offset`): the KOR help titles a command `OFFSET(명령)` and gives it
  no Korean name.
- **Help.** `https://help.autodesk.com/cloudhelp/2027/KOR/AutoCAD-Core/files/GUID-<id>.htm`; the
  help MCP searches it with `locale: "ko_KR"`.

## Why `global`

Korean AutoCAD keeps **the English command names** (the help types `OPTIONS를 입력합니다`),
**English's aliases letter for letter** (`acad_ko.pgp` differs from `acad_en.pgp` only in the
prompts of the shell commands DEL, DIR, NOTEPAD, SH, SHELL, START and TYPE; its synonyms list is
English's) and **English's keyword letters**, which it lists in parentheses after a Korean label:
`다음 점 지정 또는 [명령 취소(U)]:` (20619), `간격띄우기 거리 지정 또는 [통과점(T)/지우기(E)/도면층(L)]
<통과점>:` (22470), `원에 대한 중심점 지정 또는 [3점(3P)/2점(2P)/Ttr - 접선 접선 반지름(T)]:` (20410). So
everything a Korean AutoCAD user types works in `/ko/draw` as in their AutoCAD.

## Deviations

- **The prompts are English** where Korean AutoCAD words them in Korean (`[Undo]` where it lists
  `[명령 취소(U)]`). Not forced by the platform: the Korean prompts are a command language of
  their own, Japanese's next piece too (`docs/plans/ja-language.md`): every prompt and message
  from the tables, the `label(K)` form the engine does not write yet, and the console to settle
  what the tables cannot, which needs the pack installed on the owner's AutoCAD. What a user types
  does not change with them. `WHY` in `i18n/engine.ts`; the differences page says it.
- **Missing:** drawing text in Korean. TEXT and MTEXT draw what is typed, Hangul included, in the
  system's face, but measure it as Arial's average glyph (`domain/textFontMetrics.ts` covers latin
  only), so a Korean label's box and centring are approximate.

## Interface terms

Korean AutoCAD's own words, paired by id (`P dll id` a string table, `D dll dialog:control` a
dialog, `N assembly key` a .NET resource, `X uid` acad.CUIX, `T AcTaskDialogs` a task dialog read
as text). **†** is ours: no Autodesk resource gives it. The pairing's raw output is
`research/proposals/ko-*.md`; the Properties palette's choice lists are `ax26res`'s `;`-separated
strings, and the tools' descriptions keep acad.CUIX's help strings (`동심원, 평행선 및 평행 곡선을
작성합니다`). None of it was seen on the desktop: the pack is not installed, so the ViewCube's faces
(`평면도`… `좌측면도`, AcVMToolsRes 629–634, the ids Japanese's 上 前 左 have) and compass are
unverified there.

### The editor (`packages/editor/src/locales/ko.json`)

| Area | English | Korean | Source |
| --- | --- | --- | --- |
| Ribbon's Home tab | Home; Draw, Modify, Annotation, Layers, Block, Properties, Utilities, Clipboard; Pin | 홈; 그리기, 수정, 주석, 도면층, 블록, 특성, 유틸리티, 클립보드; 고정 † | X ID_TabHome, ID_PanelDraw … RBN_00011049 and every button's and list member's uid (`ribbon.mjs --cuix` on the pack's acad.CUIX, 2026-11-24); Pin † ours: AutoCAD's pin has no name, the word undoes acadres 49183 `Unpin` |
| Ribbon's other tabs | Insert, Annotate, 3D Tools, View; Retain Attribute Display, Display All Attributes, Hide All Attributes; More Colors...; Select Color...; 2D Wireframe, Hidden, Conceptual | 삽입, 주석, 3D 도구, 뷰; 속성 화면표시 유지, 모든 속성 표시, 모든 속성 숨기기; 추가 색상...; 색상 선택...; 2D 와이어프레임, 숨김, 개념 | X ID_TabInsert, ID_TabAnnotate, ID_TAB_3D_TOOLS, ID_TabView, each panel's and button's uid (acad.CUIX by uid, 2026-11-24); AcWindows.resources.dll's BAML (`AcAttmode1/2/0`, `mMoreColorsLabel`); AcDimRes 318; tables 41794, 41445, 8027; the pack's files (`~/autocad-packs`) | no |
| Ribbon's minimize button | Show Full Ribbon; Minimize to Tabs, Minimize to Panel Titles, Minimize to Panel Buttons, Cycle through All | 전체 리본 표시; 탭으로 최소화, 패널 제목으로 최소화, 패널 버튼으로 최소화, 모두 순환 | X AdWindows.resources.dll's BAML (`ID_MinimizeToTabs`, `ID_MinimizeToPanelTitles`, `ID_MinimizeToPanelButtons`, `ID_CycleThroughAll`, `system:String_83`), 2026-11-24; the pack's files (`~/autocad-packs`) | no |
| Status bar | Model space; MODEL | 모형 공간; 모형 | P acadres 21486, 20008 |
| Status bar | Coordinates | 좌표 | P ax26res 4; X ID_PanelCoord |
| Status bar | Grid; Snap mode; Snap; Grid Snap; Polar Snap | 그리드; 스냅 모드; 스냅; 그리드 스냅; PolarSnap | P acadres 21453, 20021, 21452; D dwgaidsRes 130:1109, 130:1106 |
| Status bar | Snap settings; Snap X spacing; Snap X; Polar distance; Polar snap distance | 스냅 설정 †; 스냅 X 간격두기; 스냅 X †; 극좌표 방향 간격; 극좌표 스냅 간격 † | X XLSR_0955 (스냅 설정 드롭다운); D dwgaidsRes 130:1002, 130:1098 |
| Status bar | Ortho mode; Polar tracking; Polar angle; Polar tracking angle | 직교 모드; 극좌표 추적; 극좌표 각도; 극좌표 추적 각도 † | P acadres 20023, dwgaidsRes 2; D dwgaidsRes 131:1023 |
| Status bar | Object snap; Object snap settings; Object snap tracking | 객체 스냅; 객체 스냅 설정; 객체 스냅 추적 | P dwgaidsRes 5; X XLS_3DSNAP_0009; P acadres 25573 |
| Status bar | Selection cycling; Selection cycling settings; Display selection list box | 선택 순환; 선택 순환 설정 †; 선택 순환 리스트 상자 표시 | P dwgaidsRes 1317; D dwgaidsRes 1309:1311 |
| Status bar | Show lineweight; Units; Clean screen; Customization | 선가중치 표시; 단위; 화면 정리; 사용자화 | D acadres 2500:2505; P acadres 4611; X XLS_6102, ID_PanelCustomization |
| Ribbon | Draw; Modify; Annotation; Block; Utilities; Modeling; Solid Editing | 그리기; 수정; 주석; 블록; 유틸리티; 모델링; 솔리드 편집 | X ID_PanelDraw, ID_PanelModify, ID_PanelBasicAnnotation, XLS_1707, ID_PanelStandard_Clipboard, ID_Panel3D_Modeling, ID_PanelSolidEdit |
| Draw | Circle; Arc; Ellipse; Spline; Rectangle; Text | 원; 호; 타원; 스플라인; 직사각형; 문자 | X ID_RBN_SPLITBTN_CIRCLE, …ARC, …ELLIPSE_0001, XLS_SM_00015799, ID_RBN_CMDBTN_RECTANG_0001, ACAD_2428 |
| Modify | Trim; Fillet; Fillet Edge; Break; Array; Edit Polyline; Extrude faces | 자르기; 모깎기; 모서리 모깎기; 끊기; 배열; 폴리선 편집; 면 돌출 | X ID_RBN_CMDBTN_TRIM, …FILLET, ID_RBN_0173, …BREAK, ACAD_853, …PEDIT, …FACEEXTRU_0001 |
| Annotate | Dimension; Continue; Attributes | 치수; 연속; 속성 | X ID_RBN_CMDBTN_DIMENSION, …DIMCONTIN; X XLS_00010863 |
| Utilities | Measure; Points | 측정; 점 | X ID_RBN_SPLITBTN_MEASURE, ACAD_1033 |
| 3D | Extrude | 돌출 | X ID_RBN_8052 |
| Snaps | From; Point Filters; None; Osnap Overrides | 시작점; 점 필터; 없음; 객체 스냅 재지정 | X ACAD_3, ACAD_1863, ACAD_14, ACAD_2602 |
| ViewCube | Home; Parallel; Set Current View as Home; WCS; New UCS; Unnamed | 홈; 평행; 현재 뷰를 홈으로 설정; WCS; 새 UCS; 미지정 | P AcVMToolsRes 47021, 47022, 47026, 47009, 47042, 47010 |
| ViewCube | Rotate clockwise; counterclockwise; View the face above… | 시계 방향으로 회전; 시계 반대 방향으로 회전; 위쪽 면 보기… | † (AcArrayRes 5024–5025 have 시계 반대 방향, 시계 방향) |
| Navigation bar | Navigation bar; Zoom; Zoom Extents; Window; Previous; In; Out | 탐색 막대; 줌; 줌 범위; 줌 윈도우; 줌 이전; 줌 확대; 줌 축소 | X ACAD_159; P AcVMToolsRes 47094, 47098, 47105, 47102, 47099, 47101 |
| Viewport | View controls: {name} | 뷰 조정: {name} | P acadres 49037 |
| Title bar | Application menu; New; Open; Save; Save As | 응용프로그램 메뉴; 새로 만들기; 열기; 저장; 다른 이름으로 저장 | D acadres 7013:1278; X ACAD_673, ACAD_674, ACAD_UIE_31, ACAD_32 |
| Title bar | Undo; Redo; Drawing Units…; Language; Send Feedback | 명령 취소; 명령 복구; 도면 단위…; 언어; 피드백 보내기 | X XLS_UIE_1068, XLS_UIE_0019; D unitsRes 500:title; P acadres 5878; X XLS_7254 |
| Title bar | Object color; Saving…; Saved; Saved on this device | 객체 색상; 저장 중…; 저장됨 †; 이 장치에 저장됨 † | P gridres 109, AcPltRes 5319 |
| Command line | Command line; Type a command (LINE, TR, CO…); Command history | 명령행; 명령 입력(LINE, TR, CO…); 명령 사용 내역 | P acadres 4233; N AcWindows (by text, "Type a command"); P dwgaidsRes 1328 |
| Shortcut menu | Shortcut menu; Repeat {command}; Enter; Cancel | 바로 가기 메뉴; 반복 {command}; 입력; 취소 | N AcCustomize NAME_ShortcutMenu; X ACAD_1897, ACAD_1758 |
| Shortcut menu | Clipboard; Copy with Base Point; Paste; Copy Selection; Deselect All | 클립보드; 기준점을 사용하여 복사; 붙여넣기; 선택 복사; 모두 선택해제 | X RBN_00011049, ACAD_1974, ACAD_58, XLS_1005, ACAD_1931 |
| Shortcut menu | Undo; Redo; Properties; Dimension Style | 명령 취소; 명령 복구; 특성; 치수 스타일 | X ACAD_639, ACAD_686, ACAD_334, ACAD_2000 |
| Properties | Properties; General; No selection; Object type; \*VARIES\*; Custom color | 특성; 일반; 선택 요소가 없습니다; 객체 유형; \*다양함\*; 사용자 색상 | P AcVMToolsRes 47008, acopmRes 133, 177; D acopmRes 133:1034; P ax26res 782, gridres 81 |
| Properties | Color; Layer; Linetype; Lineweight; Text style; Dim style | 색상; 도면층; 선종류; 선가중치; 문자 스타일; 치수 스타일 | P acopmRes 136–138, 140, 94; ax26res 148 |
| Properties | Current layer; color; linetype; lineweight | 현재 도면층; 현재 색상; 현재 선종류; 현재 선가중치 | P acadres 21502, 21504, 21505, 21529 |
| Properties | Color of the selected objects (and its five siblings) | 선택한 객체의 색상 … | † |
| Layers | Layers; New layer; Delete layer; Set current; Current layer | 도면층; 새 도면층; 도면층 삭제; 현재로 설정; 현재 도면층 | X ID_PanelLayers; P LaytransRes 26; N AcLayer IDS_DEL_TITLE; D AcDimRes 101:54536; P acadres 21502 |
| Layers | Status, Name, On, Lock, Color, Linetype, Lineweight; On/Off; Locked/Unlocked | 상태, 이름, 켜기, 잠금, 색상, 선종류, 선가중치; 켜기/끄기; 잠금/잠금해제 | N AcLayer Status, Name, On, Lock, Color, Linetype, Lineweight; P AcOpmExtRes 238, 237; P ax26res 921, 1002 |
| Layers | Objects; Layer color; Layer list; Next/Previous columns; the rename hint | 객체; 도면층 색상 †; 도면층 리스트 †; 다음 열 †, 이전 열 †; 선택한 도면층의 이름을 다시 클릭하면 이름을 바꿀 수 있습니다 † | P acadres 21092 |
| Layers | Layer - Not Deleted; - Current Layer Off; - Rename | 도면층 - 삭제되지 않음; 도면층 - 현재 도면층 끄기; 도면층 - 이름바꾸기 | T AcTaskDialogs |
| Layers | Layer - Name Already Exists; The name, {name}, is already in use. | 도면층 - 이름이 이미 있음 † (after %ObjectName% - 이름이 이미 있음); 이름 {name}은(는) 이미 사용 중입니다. | T AcTaskDialogs |
| Layers | Layers 0 and Defpoints; Xref-dependent layers; Layers containing objects | 도면층 0 및 정의점; 외부 참조에 종속된 도면층; 객체가 포함된 도면층 | T AcTaskDialogs |
| Layers | Invalid characters in layer name.; The following characters are not valid in layer names: | 도면층 이름에 유효하지 않은 문자가 있습니다.; 다음 문자는 도면층 이름에 사용할 수 없습니다: | N AcLayer LayerErrorInvalidChars, IDS_NOM_BAD_CHARSET_ESN_LAYER |
| Dialogs | Drawing Units; Length; Type; Precision; Decimal; Insertion scale; Sample output | 도면 단위; 길이; 유형; 정밀도; 십진; 삽입 축척; 샘플 출력 | D unitsRes 500:title, 500:1000, 500:1001, 500:1003, 500:1017, 500:1013; P unitsRes 28 |
| Dialogs | Units to scale inserted content:; Millimeters; Centimeters; Meters | 삽입된 컨텐츠를 축척할 단위:; 밀리미터; 센티미터; 미터 | D unitsRes 500:1011; P acadres 3404–3406 |
| Dialogs | Save Drawing As; File name:; Files of type:; Tools; Options…; Save | 다른 이름으로 도면 저장; 파일 이름:; 파일 유형:; 도구; 옵션…; 저장 | P acadres 21405; D acadres 131:13008, 131:13009, 131:13005; P acadres 13111; D acadres 131:1 |
| Dialogs | MellowCAD Drawing (*.ecad.json) | MellowCAD 도면 (*.ecad.json) | † (after acadres 6's 도면 (*.dwg)) |
| Dialogs | Saveas Options; DXF Options; Format; BINARY; Select objects; Save thumbnail preview image | 다른 이름으로 저장 옵션; DXF 옵션; 형식; 이진; 객체 선택; 썸네일 미리보기 이미지 저장 | D acadres 2489:title; P acadres 4850; D acadres 5103:9387, 5103:1361, 5103:1403, 5103:1539 |
| Dialogs | Decimal places of accuracy (0 to 16) | 정확성을 위한 소수 구분 기호 (0-16) | D acadres 5103:958 (Autodesk's wording, as it stands) |
| Dialogs | Point Style; Point Size:; Set Size Relative to Screen; in Absolute Units; Invalid input. | 점 스타일; 점 크기:; 화면에 상대적인 크기 설정; 절대 단위로 크기 설정; 잘못된 입력 값입니다. | D acddptyperes 101:title, 101:1003, 101:1001, 101:1002; P acddptyperes 13 |
| Dialogs | Point display images | 점 표시 이미지 | † |
| Dialogs | Properties - Locked objects; One or more selected objects are locked…; Number of objects removed… | 특성 - 잠긴 객체; 선택한 객체 중 하나 이상이 잠겨 있어 업데이트할 수 없습니다.; 선택 세트에서 제거된 객체 수: {count, number} | T AcTaskDialogs |
| Dialogs | Multiline Text - Unsaved Changes; Do you want to save your text changes?; Yes; No; Cancel | 여러 줄 문자 - 저장되지 않은 변경 사항; 문자 변경 사항을 저장하시겠습니까?; 예; 아니요; 취소 | T AcTaskDialogs; N AcWindows BP_YesValue, BP_NoValue (Windows' task-dialog buttons) |
| Dialogs | OK; Cancel; Close; Selection | 확인; 취소; 닫기; 선택 | D unitsRes 500:1, 500:2; AcDimRes 101:1; acadres 25307:title |
| Dim styles | Styles; Dimension; Text; New; Current: | 스타일; 치수; 문자; 새로 만들기; 현재: | D AcDimRes 101:39467; X XLS_Name_Dimension; P AcDimRes 6001; D AcDimRes 101:11612; D acfilterres 101:1035 |
| Dim styles | Lines; Symbols and arrows; Text; Fit; Primary units | 선; 기호 및 화살표; 문자; 맞춤; 1차 단위 | P AcDimRes 6000, 6013, 6001, 6002, 6003 |
| Dim styles | Baseline spacing; Extend beyond dim lines; Offset from origin | 기준선 간격; 치수선 너머로 연장; 원점에서 간격띄우기 | D AcDimRes 302:2567, 302:2574, 302:2575 |
| Dim styles | Arrow size; Center mark size; Text height; Offset from dim line | 화살표 크기; 중심 표식 크기; 문자 높이; 치수선에서 간격띄우기 | D AcDimRes 301:2579; P ax26res 176; D AcDimRes 303:2622, 303:2626 |
| Dim styles | Use overall scale of; Draw dim line between ext lines | 전체 축척 사용; 치수보조선 사이에 치수선 그리기 | D AcDimRes 305:2682, 305:2687 |
| Dim styles | Precision; Angular precision; Decimal separator; Suppress trailing zeros | 정밀도; 각도 정밀도; 소수 구분 기호; 후행 0 억제 | D AcDimRes 307:2713; P ax26res 220; D AcDimRes 307:2596; P ax26res 235 |
| Dim styles | ',' (Comma); '.' (Period); ' ' (Space); Yes; No | ',' (쉼표); '.' (마침표); ' ' (공백); 예; 아니오 | P acdb26res 6151, 6150, 6152; acopmRes 43, 44 |
| Text styles | Size; Height; the height hint | 크기; 높이; 높이가 0이면 고정되지 않으므로 TEXT 명령이 매번 높이를 묻습니다. † | N AcCustomize PROP_CAT_Size; P acopmRes 145 |
| Blocks | Blocks; the filter, its label, the empty and no-match texts; {count} in drawing | 블록; 필터(? 및 * 사용 가능) †, 블록 필터 †, 정의된 블록이 없습니다. 객체를 그린 후 BLOCK을 실행하십시오. †, 필터와 일치하는 블록이 없습니다. †; 도면에 #개 † | N AcWindows BP_PaletteSetName |
| Palettes | Palettes; Fold; Show; Palette width | 팔레트; 팔레트 접기 †; 팔레트 표시 †; 팔레트 폭 † | X ID_PanelPalettes; P acadres 5974 (폭) |

Also ours (†): the canvas's name 도면 영역 (after acadres 7015:1861's 도면 영역의 바로 가기 메뉴); the save state 저장됨, 이 장치에 저장됨; the ViewCube's roll arrows and the four adjacent-face tooltips (위쪽/아래쪽/왼쪽/오른쪽 면 보기); 스냅 설정, 스냅 X, 스냅 Y, 극좌표 스냅 간격, 극좌표 추적 각도, 선택 순환 설정; MellowCAD 도면 (*.ecad.json); 도면층 색상, 도면층 리스트, 다음 열, 이전 열, the rename hint, 도면층 - 이름이 이미 있음; the six "…of the selected objects" labels (선택한 객체의 …); the Styles palette's height hint; the Blocks palette's filter, its label, its empty and no-match texts and its count (도면에 #개); the palette's fold, unfold and width; the Point Style's 점 표시 이미지; and the messages composed from sourced words: `{name}을(를) 현재 도면층으로 설정`, `{name} 색상/선종류/선가중치`, `도면층 {name} 삭제`, `도면층 {name} 이름바꾸기`, `{name}을(를) 현재로 설정`, `{name} 이름바꾸기`, `{name} 삭제`. Overridden against the most frequent wording because the row's place says otherwise: `measure` 측정 (the ribbon's split button, not MEASURE's 길이 분할), `dimchain` 연속 (the ribbon, not 계속), `ShortcutMenu.enter` 입력 (X ACAD_1758), `Units.decimal` 십진 (unitsRes 28), `PointStyle.invalid` 잘못된 입력 값입니다. (acddptyperes 13), `NavigationBar.extents` 줌 범위, `ViewCube.unnamed` 미지정, MText's No 아니요 (the task dialog's button) beside the palette's 아니오. Dialog labels keep the colon as the Korean resource writes it, after the accelerator (`파일 이름(&N):` → `파일 이름:`); the Layer dialogs' "The following layers…" lines end in a period, as Korean AutoCAD writes them before the list.

### The engine (`cad/locales/ko.json`, `interface`)

| Area | English | Korean | Source |
| --- | --- | --- | --- |
| Draw | Line; Polyline; 3D Polyline; Circle; Diameter circle; 2-Point circle; 3-Point circle | 선; 폴리선; 3D 폴리선; 원; 원, 중심점, 지름; 원, 2점; 원, 3점 | X ID_RBN_CMDBTN_LINE, …PLINE, …3DPOLY, ID_RBN_SPLITBTN_CIRCLE, ID_CircleDia, ID_Circle2pt, ID_Circle3pt |
| Draw | Arc; Start, Center, End arc; Center, Start, End arc; Ellipse; Center ellipse; Elliptical arc | 호; 호, 시작점, 중심점, 끝점; 호, 중심점, 시작점, 끝점; 타원; 타원, 중심점; 타원형 호 | X ID_RBN_SPLITBTN_ARC, ID_ArcStCeEn, ID_ArcCeStEn, ID_RBN_SPLITBTN_ELLIPSE_0001, ID_EllipseCe, ID_RBN_CMDBTN_ELLIPSEAR |
| Draw | Spline; Spline Fit; Spline CV; Edit Spline; Edit Polyline | 스플라인; 스플라인 맞춤; 스플라인 CV; 스플라인 편집; 폴리선 편집 | P ax26res 312; X ID_RBN_CMDBTN_SPLINE, ID_RBN_8218, ID_RBN_CMDBTN_SPLINEDIT, …PEDIT |
| Draw | Rectangle; Polygon; Hatch; Text; Multiline text; Edit text | 직사각형; 폴리곤; 해치; 문자; 여러 줄 문자; 문자 편집 | X ID_RBN_CMDBTN_RECTANG_0001, …POLYGON_0001, …BHATCH_0001, ACAD_2428, ID_RBN_0020; D texteditRes 101:title |
| Draw | Multiple Points; Point Style; Construction Line; Ray; 2D Solid; 3D Face; Wipeout | 다중 점; 점 스타일; 구성선; 광선; 2D 솔리드; 3D 면; 객체 가리기 | X ID_RBN_CMDBTN_POINTMULT, ACAD_171, ID_RBN_CMDBTN_XLINE, …RAY, ID_Solid, ACAD_288, ID_RBN_CMDBTN_WIPEOUT |
| Modify | Move; Copy; Rotate; Mirror; Scale; Stretch | 이동; 복사; 회전; 대칭; 축척; 신축 | X ID_RBN_CMDBTN_* |
| Modify | Offset; Trim; Extend; Fillet; Chamfer; Erase; Explode; Join | 간격띄우기; 자르기; 연장; 모깎기; 모따기; 지우기; 분해; 결합 | X ID_RBN_CMDBTN_* |
| Modify | Break; Break at point; Array; Rectangular, Polar, Path array | 끊기; 점에서 끊기; 배열; 직사각형 배열, 원형 배열, 경로 배열 | X ID_RBN_CMDBTN_BREAK, …BREAKSELE, ACAD_357; D AcArrayRes 146:1044, 146:1045; X XLS_00021840 |
| Modify | Match properties; Change properties | 특성 일치; 특성 변경 † | X ACAD_335 (ID_UIE_Ai_propch is left `Chprop`) |
| Clipboard | Copy; Cut; Copy with base point; Paste | 클립 복사; 잘라내기; 기준점을 사용하여 복사; 붙여넣기 | X ID_RBN_CMDBTN_COPYCLIP_0002, …CUTCLIP_0001, …COPYBASE_0002, …PASTECLIP_0001 |
| Inquiry | Measure; Measure (segments); Divide; Area; List; ID Point; Region/Mass Properties | 측정; 길이 분할; 등분할; 면적; 리스트; ID 점; 영역/질량 특성 | X ID_RBN_SPLITBTN_MEASURE, ID_RBN_0140, ID_RBN_CMDBTN_DIVIDE, …AREA, RBN_01740411, ACAD_189, ACAD_187 |
| Block | Create block; Insert block; Define, Edit attributes; Attribute display; Purge | 블록 작성; 블록 삽입; 속성 정의, 속성 편집; 속성 화면표시; 소거 | X ID_RBN_SPLITBTN_CREATEBLOCK, MM_1614, ID_RBN_CMDBTN_ATTDEF, ID_RBN_SPLITBTN_ATTRIBUTE, ACAD_147, ID_RBN_CMDBTN_PURGE |
| Block | MINSERT (the tool, the palette's MInsert Block); its Insertion point X; Columns, Column spacing, Rows, Row spacing | 다중 삽입 블록 †; 삽입점 X †; 열, 열 간격 조정, 행, 행 간격 조정 † | 다중 삽입 from acadres 22686 (다중 삽입할 수 없습니다); ax26res 299, 42 and 266–269 not read (the pack is no longer opened): the array's rows' words |
| Annotate | Linear; Aligned; Horizontal; Vertical; Rotated; Angular; Radius; Diameter | 선형; 정렬; 수평; 수직; 회전된 치수; 각도; 반지름; 지름 | X ID_RBN_CMDBTN_DIM*; P ax26res 974, 975; X XLS_0033 |
| Annotate | Baseline; Continue; Adjust space; Leader | 기준선; 연속; 공간 조정; 지시선 | X ID_RBN_CMDBTN_DIMBASELI, …DIMCONTIN, …DIMSPACE; P ax26res 297 |
| 3D | Union; Subtract; Intersect; Box; Wedge; Pyramid; Cylinder; Cone; Sphere; Torus | 합집합; 차집합; 교집합; 상자; 쐐기; 피라미드; 원통; 원추; 구; 토러스 | X ACAD_374, ACAD_375, ACAD_376, ID_RBN_CMDBTN_BOX, …WEDGE, …PYRAMID, …CYLINDER, …CONE, …SPHERE, …TORUS |
| 3D | Extrude; Revolve; Presspull; Slice; Section; Fillet Edge; Chamfer Edge | 돌출; 회전; 눌러 당기기; 슬라이스; 단면; 모서리 모깎기; 모서리 모따기 | X ID_RBN_8052, ID_RBN_CMDBTN_REVOLVE, …PRESSPULL, ACAD_305, ACAD_306, ID_RBN_0173, ID_RBN_0174 |
| 3D | Solid Editing; Extrude, Move, Rotate, Offset, Taper, Delete, Copy faces | 솔리드 편집; 면 돌출, 면 이동, 면 회전, 면 간격띄우기, 면 테이퍼, 면 삭제, 면 복사 | X ID_PanelSolidEdit, ACAD_1947–1954 |
| Tools | Undo; Multiple redo; System variables; Object snap modes; Snap mode | 명령 취소; 다중 명령 복구 †; 변수 설정; 객체 스냅 모드; 스냅 모드 | X ACAD_53, ACAD_754 (ID_Setvar); P acadres 21513, 20021 |
| Tools | Color; Linetype; Lineweight; Linetype scale; Fill; Elevation; Angle precision | 색상; 선종류; 선가중치; 선종류 축척; 채우기; 고도; 각도 정밀도 | P acopmRes 136, 139; X ID_Fill, ID_Elev; P ax26res 220 |
| Tools | Layer (command line); Dimension style (command line); UCS icon (variable) | 도면층(명령행) †; 치수 스타일(명령행) †; UCS 아이콘(시스템 변수) † | † |
| Views | Zoom; Pan; Pan by points; Regen; Regen All; Viewpoint; Plan view; Preset views; 3D Orbit; Visual Styles | 줌; 초점이동; 초점이동, 점; 재생성; 전체 재생성; 관측점; 평면도; 뷰 사전 설정; 3D 궤도; 비주얼 스타일 | P AcVMToolsRes 47094, 47090; X ID_PanPick, ACAD_64, ACAD_65, MM_0539, ACAD_112; P AcVMToolsRes 4229, 4156; X ID_PanelVisualStyles |
| Views | Top; Bottom; Front; Back; Left; Right | 평면도; 저면도; 정면도; 배면도; 좌측면도; 우측면도 | P AcVMToolsRes 4230–4235 |
| Views | SW, SE, NE, NW Isometric; Custom View | 남서, 남동, 북동, 북서 등각투영; 사용자 뷰 | P AcVMToolsRes 4982–4985, acadres 40867 |
| ViewCube | Faces TOP … RIGHT; compass N E S W | 평면도 저면도 정면도 배면도 좌측면도 우측면도; 북 동 남 서 | P AcVMToolsRes 629–634; D unitsRes 501:1051–1054 (the compass unverified on the desktop) |
| Snaps | Endpoint; Midpoint; Center; Node; Quadrant; Intersection | 끝점; 중간점; 중심; 노드; 사분점; 교차점 | P acadres 70–75 |
| Snaps | Insertion; Perpendicular; Tangent; Nearest; Apparent Intersection | 삽입; 직교; 접점; 근처점; 가상 교차점 | P acadres 76–79, 32997 |
| Snaps | Extension; Parallel | 연장선; 평행 | D dwgaidsRes 135:1067, 135:1060 |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White; ByLayer | 빨간색, 노란색, 초록색, 하늘색, 파란색, 선홍색, 흰색; ByLayer | P colorRes 103–109, acui26res 14–21; P acadres 4221 |
| Objects | Line … Ray (the palette's object names) | 선, 원, 호, 타원, 스플라인, 폴리선, 3D 폴리선, 문자, 여러 줄 문자, 속성 정의, 치수, 해치, 블록 참조, 3D 솔리드, 영역, 점, 솔리드, 3D 면, 지시선, 객체 가리기, 래스터 이미지, 테이블, 다중 지시선, X선, 광선 | P ax26res 279–316, 341, 437, 706, 731; X XLS_Name_Dimension |
| Properties | {count} objects; All ({count}) | #개의 객체; 전체 ({count}) | P acadres 21354; acopmRes 73 |
| Properties | Array (Rectangular), (Polar), (Path) | 배열(직사각형), 배열(원형), 배열(경로) | P ax26res 1218, 1220, 1219 |
| Properties | Rotated, Aligned, Angular, Radial, Diametric Dimension | 회전된 치수, 정렬된 치수, 각도 치수, 반지름 치수, 지름 치수 | P ax26res 287–292 |
| Properties | General groups: Geometry; Misc; Text; Position; Pattern; Attributes; Solid History | 형상; 기타; 문자; 위치; 패턴; 속성; 솔리드 사용 내역 | P ax26res 19, 25, 32, 929, 48, 1500, 655 |
| Properties | Data Points; Lines & Arrows; Fit; Primary Units; Definition points | 데이터 점; 선 및 화살표; 맞춤; 1차 단위; 정의점 † | P ax26res 74, 143, 141, 142 |
| Properties | Start X; End X; Center X; Delta X; Normal X; Position X; Scale X | X 시작; X 끝; X 중심; X 증분; 법선 X; X 위치; X 축척 | P ax26res 7, 10, 14, 52, 28, 31, 43 |
| Properties | Major, Minor axis vector X; Text alignment X; Basepoint X; Second point X; Direction vector X | 장축 벡터 X, 단축 벡터 X; 문자 정렬 X; 기준점 X; 두 번째 점 X; 방향 벡터 X | P ax26res 47, 46, 36, 64, 65, 66 |
| Properties | Start, End tangent vector X; Origin X; Base X; Text position X; First X | 시작 접선 벡터 X, 끝 접선 벡터 X; 원점 X; 기준 X; 문자 위치 X; 첫 번째 점 X † | P ax26res 75, 76, 358, 430, 223 |
| Properties | Vertex; Vertices; Current Vertex; Global width; Fit/Smooth | 정점; 정점; 현재 정점; 전역 폭; 맞춤/부드러움 | P ax26res 553, 271 (정점의 수), 18, 318, 60 |
| Properties | Radius; Diameter; Area; Circumference; Arc length; Total angle | 반지름; 지름; 면적; 원주; 호 길이; 전체 각도 | P ax26res 252, 262, 253, 263, 90, 89 |
| Properties | Rotation; Text height; Text override; Annotative; Associative; Justify | 회전; 문자 높이; 문자 재지정; 주석; 연관; 자리맞추기 | P ax26res 254; D AcDimRes 303:2622; P ax26res 211, 925, 111, 54 |
| Properties | Invisible; Verify; Constant; Preset; Lock position; Tag; Prompt | 숨김; 검증; 상수; 사전 설정; 잠금 위치; 태그; 프롬프트 | P ax26res 257, 259, 258, 260, 359, 34, 33 |
| Properties | Method; Degree; Knot parameterization; Fit tolerance; Weight; CV frame | 메서드; 차수; 매듭 매개변수화; 공차 맞춤; 가중치; CV 프레임 | P ax26res 914, 278, 910, 99, 1255, 912 |
| Properties | Columns; Column spacing; Rows; Row spacing; Levels; Level spacing | 열; 열 간격 조정; 행; 행 간격 조정; 수준; 레벨 간격 | P ax26res 266, 267, 268, 269, 1197, 1198 |
| Properties | Arrow size; Ext line ext; Ext line offset; Text pos vert; Decimal separator | 화살표 크기; 치수보조선 연장; 치수보조선 간격띄우기; 문자 세로 위치; 소수 구분 기호 | P ax26res 174, 217, 182, 191, 149 |
| Properties | Yes; No; Show; Hide; Visible; Hidden | 예; 아니오; 표시; 숨기기; 표시; 숨김 | P ax26res 659, 799, 49 |
| Properties | At least; Exactly; Fit; Control Vertices; Chord; SqrtChord; Uniform; Custom | 최소한; 정확히; 맞춤; 조정 정점; 현; SqrtChord; 균일; 사용자화 | P ax26res 122, 915, 911 |
| Properties | User-defined; Predefined; Custom; Normal; Outer; Divide; Measure | 사용자 정의; 미리 정의; 사용자; 일반; 외부; 등분할; 길이 분할 | P ax26res 84, 114, 1202 |
| Properties | Clockwise; Counter-clockwise; Circumscribed; Inscribed | 시계 방향; 시계 반대 방향; 외접; 내접 | P ax26res 1210, 820 |
| Properties | Gradient: Linear … Inverted curved | 선형; 원통형; 반전된 원통형; 구형; 반구형; 곡선형; 반전된 구형; 반전된 반구형; 반전된 곡선형 | P ax26res 329 |
| Properties | Leader type; arrow; dim text | 화살표 없는 선; 화살표 없는 스플라인; 화살표 있는 선; 화살표 있는 스플라인; 닫고 채움; 중심; 위 | P ax26res 115, 1069, 192 |
| Properties | Justify (TEXT) | 왼쪽, 중심, 오른쪽, 중간, 맨 위 왼쪽 … 맨 아래 오른쪽 (no letters, as Korean AutoCAD) | P ax26res 126 |

Also ours (†): 특성 변경 (Korean AutoCAD leaves CHPROP's menu name `Chprop`; the help's word), 다중 명령
복구, the dashed command-line tools' (명령행), UCS 아이콘(시스템 변수), 정의점 (the Korean help's word for
defpoints), 첫 번째 점 X/Y (after ax26res 65's 두 번째 점), 기준 Z (after ax26res 430's 기준 X; 기준 Y),
and the descriptions of SNAP, DXFIN, DXFOUT, INSERT, PURGE, PROPERTIES, CLEANSCREENON and
CLEANSCREENOFF, written as acad.CUIX's help strings are (`…합니다`, no period); QNEW, STYLE,
BLOCKSPALETTE and UNITS take their HelpString cut to what the English says (ID_QNew says 빈 도면,
ID_Style adds 또는 지정, ID_BlocksPalette 열거나 닫습니다, ID_Units 각도 for distances), and RIBBON and
RIBBONCLOSE the 2027 help pages' (리본을 표시합니다, 리본을 숨깁니다: GUID-EC71B17B, GUID-A9EE8263). Overridden
against a single pairing because the row's place says otherwise: `dimrotated` 회전된 치수 (AcDimRes
5853 is left `ROTATED`), `setvar` 변수 설정 (the only pairing is an Express Tools title left in
English), `U`'s description 가장 최근의 작업을 취소합니다 (ID_U's HelpString, like every other
description, not acadres 16161's clipped label), `deltaX/Y/Z` X 증분 (the palette's ax26res 52, not
LIST's acadres 56865), `vertices` 정점 (the pairing, 교점, is a .NET enum of SECTION), and the
compass 북 동 남 서 (unitsRes 501, as Japanese; the single pairing is the untranslated `N`). Colour
4 is 하늘색 (colorRes, acui26res, acadres 4507) over AcOpmExtRes' 청록색; ByLayer stays `ByLayer` as
acadres 4221 and the Properties toolbar show it (colorRes' button says 도면층별).

## The site's words

The site, the "Use" pages, the 103 command notes and the 12 exercises were written from the
English by agents on one brief (register, the glossary above, the ribbon's command names, the
search texts), each file through `docs:check`. Their choices with no Autodesk word, for the native
reader: **단축키** for alias, what Korean users call it and search («캐드 단축키»; the help says
명령 별칭, used once where the commands' page defines the word) †, 키보드 단축키 for the keys' page †,
편집기 for the editor †, the landing's groups 구성 and 조회 및 뷰 †, CAD 실무자 and 교사·강사 †, 제도 보조
도구 for drafting aids †, 피처 히스토리 †, 연습도면 for an exercise (the search word) †, the title
block's 도면 번호, 개정, 축척, 시트 †, 이동 경로 for the breadcrumb †; the exercises' layers 외형선,
중심선, 숨은선, 치수 (KS drafting), 키홈, 피치원, 축 구멍, 보스, 반단면, 직렬 치수 and 병렬 치수,
디딤판 and 단너비 (stairs), 등각투상도 and 아이소메트릭, 단붙이 축 (a stepped shaft; 계단축 is said too),
대지 경계 (the plot of land); the floor plan's 벽, 문, 창, 개구부, 문짝, 경첩 and 열림 궤적 (a door's
swing) †. From the KOR help where the pack's interface has none: 여러 줄(MLINE), 객체 가리기 (WIPEOUT),
기하학적 공차 (TOLERANCE), 테이블, 다중 지시선. A particle after a latin word is chosen by how a
Korean reads it (OFFSET → 오프셋은, `#` → 샵을), and after an argument whose last sound is unknown the
sentence is written to need none, or takes Autodesk's `을(를)`.

## Command names

The ribbon's and the menus' Korean names (acad.CUIX `MenuMacro` names, 20/11/2026), in brackets in
the commands' titles; Korean searchers type them and the English name in Hangul (오프셋, 트림, 필렛,
스트레치, 어레이, 미러), which the descriptions carry:
-OSNAP 객체 스냅 · 3DORBIT 3D 궤도 · 3DPOLY 3D 폴리선 · ARC 호 · AREA 면적 · ARRAY 배열 · ARRAYPATH 경로
배열 · ARRAYPOLAR 원형 배열 · ARRAYRECT 직사각형 배열 · ATTDEF 속성 정의 · ATTDISP 속성 화면표시 ·
ATTEDIT 속성 편집 · BLOCK 블록 작성 · BOX 상자 · BREAK 끊기 · CHAMFER 모따기 · CHAMFEREDGE 모서리 모따기 ·
CHPROP 특성 변경 † (the menu leaves it `Chprop`) · CIRCLE 원 · COLOR 색상 · CONE 원추 · COPY 복사 ·
COPYCLIP 클립 복사 · CYLINDER 원통 · DIMALIGNED 정렬 · DIMANGULAR 각도 · DIMBASELINE 기준선 ·
DIMCONTINUE 연속 · DIMDIAMETER 지름 · DIMLINEAR 선형 · DIMRADIUS 반지름 · DIMSPACE 공간 조정 · DIMSTYLE
치수 스타일 · DIST 거리 · DIVIDE 등분할 · EATTEDIT 속성 편집 · ELLIPSE 타원 · ERASE 지우기 · EXPLODE 분해
· EXTEND 연장 · EXTRUDE 돌출 · FILLET 모깎기 · FILLETEDGE 모서리 모깎기 · HATCH 해치 · ID ID 점 · INSERT
블록 삽입 · INTERSECT 교집합 · JOIN 결합 · LAYER 도면층 특성 · LEADER 지시선 · LINE 선 · LINETYPE 선종류 ·
LIST 리스트 · LTSCALE 선종류 축척 · LWEIGHT 선가중치 · MASSPROP 영역/질량 특성 · MATCHPROP 특성 일치 ·
MEASURE 길이 분할 · MIRROR 대칭 · MOVE 이동 · MTEXT 여러 줄 문자 · OFFSET 간격띄우기 · PAN 초점이동 ·
PEDIT 폴리선 편집 · PLAN 평면도 · PLINE 폴리선 · POLYGON 폴리곤 · PRESSPULL 눌러 당기기 · PROPERTIES 특성
· PTYPE 점 스타일 · PURGE 소거 · PYRAMID 피라미드 · RAY 광선 · RECTANG 직사각형 · REDO 명령 복구 · REGION
영역 · REVOLVE 회전 · ROTATE 회전 · SCALE 축척 · SECTION 단면 · SLICE 슬라이스 · SNAP 스냅 · SOLIDEDIT
솔리드 편집 · SPHERE 구 · SPLINE 스플라인 · SPLINEDIT 스플라인 편집 · STRETCH 신축 · STYLE 문자 스타일 ·
SUBTRACT 차집합 · TEXT 단일 행 문자 · TEXTEDIT 문자 편집 · TORUS 토러스 · TRIM 자르기 · UCS · UCSICON UCS
아이콘 · UNDO 명령 취소 · UNION 합집합 · UNITS 단위 · VIEW 명명된 뷰 · VSCURRENT 비주얼 스타일 · WEDGE 쐐기
· XLINE 구성선 · ZOOM 줌.

## Register

- **합니다체**, as Autodesk's Korean help; plain and dry. The editor's labels as Korean AutoCAD
  words them.
- Korean spacing and **Western punctuation** (`.`, `,`, `:`, `?`), quotes “…”, as the help.
  Particles attach to a latin word or a digit as it is read («AutoCAD에서», «DXF 파일을»).
- Keys as the help writes them: «Enter 키를 누릅니다», no brackets. Ribbon paths «홈 탭 > 그리기
  패널».
- **Commands by their global name**, the ribbon's Korean word in parentheses in titles and at a
  first mention («OFFSET(간격띄우기) 명령»).

## Search texts

Google's (`hl=ko`, `gl=kr`) and Naver's suggestions (80 seeds, 20/11/2026) and the visibility
audit (`~/seo-data/audit-2026-11-05/languages.md`, B.2: Korea 61 on its index; «오토캐드» 445,
«캐드 무료» 37, «오토캐드 명령어» 3 on its one scale). Naver takes about half of Korea's searches;
no results page was read (Brave refused Korea).

- **The generic terms** take «캐드» more than «오토캐드»: «무료 캐드» (프로그램, 추천, 사이트, 뷰어),
  «캐드 무료», «웹 캐드» and «캐드 웹» (무료, 사이트), «온라인 캐드» (무료, 그리기, 편집). «오토캐드
  무료» and «오토캐드 웹» look for Autodesk's own products: never a claim.
- **A command** is searched by its ribbon word and by its English name in Hangul, both: «캐드
  오프셋» and «오토캐드 간격띄우기», «캐드 필렛» and «캐드 모깎기», «캐드 트림» and «캐드 자르기»,
  «캐드 스트레치» and «캐드 신축», «캐드 어레이» and «캐드 배열»; with 사용법, 단축키, 안될때, 설정.
- **The command list**: «오토캐드 명령어» (모음, 정리, pdf) and «캐드 단축키» (모음): an alias is a
  «단축키» to its searchers.
- **Practice**: «캐드 연습도면» (모음, pdf, 초보, 2d, 3d, 건축, 토목), «오토캐드 연습 문제».
- **DXF**: «dxf 뷰어» (온라인, 무료, 사이트, 웹), «dxf 파일 열기», «dxf 편집» (편집기, 무료).
- **The guides**: «캐드 평면도 그리기», «오토캐드 좌표 입력», «오토캐드 3d», «오토캐드 단축키»,
  «오토캐드 사용법»; the differences page answers «오토캐드 호환» (ZWCAD, 캐디안, 지스타캐드, BricsCAD,
  the compatible programs sold in Korea).

## Script and font

- **The system's Korean faces**, no web font: `--font-sans` and `--font-mono` take Inter or Geist
  Mono first (latin and digits), then Apple SD Gothic Neo, Malgun Gothic, Noto Sans CJK KR and Noto
  Sans KR (`lib/fonts.ts`, `KOREAN_SYSTEM_FACES`). WHY: Japanese's; Google's Noto Sans KR is some
  120 `unicode-range` files too.
- **The share card** takes Noto Sans KR 600 (SIL OFL) cut to the characters of the Korean cards
  (`assets/fonts/noto-sans-kr-card-600.woff`, `assets/fonts/README.md`), held to them by a test.
- **No italic and no tracking**, as Japanese. `:lang(ko)` in both stylesheets.
- **Line breaks**: Korean spaces its words, and a browser breaks Hangul between any two syllables
  unless told otherwise: `word-break: keep-all` keeps a word whole, as Korean sites do.

## Plurals

`Intl.PluralRules("ko")` has only `other`: a plural is its `other`, and a count is never a noun's
form.

## Input

Hangul is typed through an IME's composition, which `isImeKey` hands to the IME (Japanese's fix):
a composing Enter or Escape never answers the command line, the dynamic input or a field that
commits on Enter. A command is typed in English mode (한/영): in Hangul mode a Korean keyboard
types jamo (`ㅣ` for L), in AutoCAD too (unverified on the desktop: the pack is not installed). On
the drawing no IME composes (no editable target), so a command typed there is latin as typed.

## Going live

On 20/11/2026, from production builds (every page `○` or `●` but `/api/search` and `/mcp`):

- **The landing's first load**, Brotli q11 of every response until the network is idle, in bytes,
  `main` before Korean (`77a3a0b1`, Japanese live), Korean a draft (`33f9c2f4`) and live: `/`
  253,481 → 253,477 → 253,521, `/es` 254,747 → 254,809 → 254,772, `/pt-br` 254,995 → 255,064 →
  255,069, `/ar` 278,375 → 278,381 → 278,395, `/fr` 255,748 → 255,722 → 255,734 (266 under
  250 KiB), `/it` 254,820 → 254,753 → 254,834, `/de` 255,117 → 255,149 → 255,150, `/ru` 288,698 →
  288,634 → 288,735, `/pl` 269,484 → 269,621 → 269,598, `/cs` 269,422 → 269,512 → 269,422, `/hu`
  269,852 → 269,917 → 269,875, `/ja` 255,612 → 255,724 → 255,647; `/ko` 255,445 → 255,390, under
  the 250 KiB of a page with no script font. The same page measures alike run after run; between
  builds a landing moves by up to 140 bytes either way, so Korean's cost is within that noise:
  its `:lang(ko)` rules share Japanese's selectors where they match, and no cut was needed.
- **The checks in Chrome**: `/ko` at 360 px, nothing wider than the viewport, the H1 breaking
  between words (`keep-all`) in the system's Korean face; `/ko/draw` at 1280×720, no text clipped
  in the bars, the palettes or any of the 37 drop-downs and menus; both cards; the docs' search
  finding 간격띄우기, 자르기, 연습도면 and 좌표. **The IME**: with `LINE` in the command line, a
  composing Enter (`isComposing`, `keyCode` 229) left it there, a Hangul syllable composed through
  Chrome's IME (`Input.imeSetComposition`) went into the field, and a plain Enter ran LINE.
- **A second reading of the code** found `keep-all`, set on every element in Korean, beating the
  footer's `break-all`, and `CHAMFEREDGE(모서리` unbreakable at some 324 of a 328 px heading: the
  rule is the root's, inherited (`html:lang(ko)`), with `overflow-wrap: break-word` behind it;
  checked at 320 px, the long headings break and nothing scrolls sideways.

## Review

**No native reader yet**: pending, as Arabic's and Japanese's. Instead, on 20/11/2026, **a model's
second reading**: an agent given the task and a sample, not this file's reasoning — the landing's,
the editor's and the engine's catalogs, six command notes (OFFSET, TRIM, HATCH, LINE, LAYER,
DIMLINEAR), three "Use" pages and two exercises, each beside its English — read as a Korean
technical editor who uses Korean AutoCAD. It found five sentences whose meaning drifted
(DIMLINEAR's text "above" where AutoCAD centres it on the line; LAYER's buttons read as layers),
option words Korean AutoCAD contradicts (TRIM's 빠른 모드 and 자르기 모서리 for 빠른 작업 (13161)
and 절단 모서리 (16430); HATCH's 정상 for 일반 (25777)), the command history named four ways, and
patterns fixed in every file: 해요체 (사용해 보세요, …나요?) among 합니다체, descriptions with no
predicate, a particle glued to a `<Message>` whose text shows in English, 안될 for 안 될. Every
option word the notes name in Korean was then checked against its command's prompt in the tables
(some 40 changed: FILLET's 승인 for 수락 (5631), ARRAYRECT's 전체 for 합계 (5634), UCSICON's
words (40271)…); those without a table string (-PURGE's, UCS's SEction) stay **unverified**.

Where a native reader should look first: the terms marked † above, the search titles and
descriptions (written from the suggestions, never tested against a Korean searcher), the particles
after latin words, the exercises' drafting words (KS usage), and the ViewCube's faces and compass,
never seen on the desktop.
