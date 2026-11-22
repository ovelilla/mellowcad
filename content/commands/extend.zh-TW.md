---
title: "AutoCAD EXTEND（延伸）指令"
metaTitle: "CAD 延伸指令（EXTEND）用法與快捷鍵 EX"
description: "AutoCAD 延伸指令 EXTEND（EX）逐一提示說明：快速與標準模式、邊界邊、籬選、框選、邊，以及按住 Shift 修剪。可在瀏覽器中免費線上試用。"
figure: "兩條線延伸至橫跨其路徑的線：在快速模式下，各在要延伸的端點附近點選一次。"
sourceHash: "b2c0044f8e87"
---

EXTEND（延伸）指令將物件延長，直到與另一個物件相接：在要延長的端點附近點選物件，該端點就會延伸至路徑上最近的邊。可延伸的物件有線、弧、橢圓弧、開放的聚合線（沿其端點線段延伸，直線段直線延伸，弧線段沿弧延伸）、3D 聚合線與開放的雲形線。與 AutoCAD 一樣，指令以快速模式開始：所有物件都是邊界。點選時按住 Shift 鍵則改為修剪，與 <Command id="TRIM" /> 相同。每次點選是一個步驟，退回一次即可復原；按 Enter 結束指令。

## Options

### Boundary

選擇作為邊界的物件：選取這些物件，或按 Enter 以所有物件為邊界。此後無論模式為何，只有這些物件是邊界，直到指令結束。

### Fence

要求指定一條線的各點，可指定任意多點，直到按 Enter：與籬選線相交的每個物件，都從較靠近交點的一端延伸，一次完成。標準模式會列出此選項；快速模式也接受此選項。

### Crossing

要求指定窗選的兩個角點：外框所穿過的每個物件都會延伸，一次完成。

### mOde

在 <Keyword id="Quick" /> 與 <Keyword id="Standard" /> 之間切換。在標準模式下，EXTEND 會先要求選取邊界邊（按 Enter 選取全部），並列出籬選與邊選項。模式由 EXTEND 與 TRIM 共用，在整個階段作業中持續有效。

### Edge

僅限標準模式。選擇 <Keyword id="Extend" /> 時，物件也會停在邊界延長後所在的位置：線向兩端延長，弧沿其圓延長；因此線可以延伸至未達其路徑的另一條線。預設值為 <Keyword id="No extend" />。

### Undo

提示收到回應後（點選、籬選或窗選）才會列出：退回最後一次延伸；沒有可退回的項目時會顯示訊息。

## Missing

投影：不提供 AutoCAD 的投影選項（無、UCS、視圖），所有計算都投影在 UCS 的 XY 平面上進行，即 AutoCAD 的預設值 UCS。籬選目前還無法用游標拖曳，只能逐點點選。模式與邊的選擇只在階段作業中有效，而 AutoCAD 會在階段作業之間保留。與 UCS 成角度的物件（雲形線除外）既不能作為邊界，也不會被延伸；以 <Command id="PEDIT" /> 的 <Keyword command="PEDIT" id="Fit" /> 平滑化的聚合線會被拒絕，而 AutoCAD 會延長其最後一段弧。

## Questions

### AutoCAD 延伸指令的快捷鍵是什麼？

輸入 `EX`，再按 Enter 或空白鍵。輸入完整名稱也可以，而 `_EXTEND` 在任何語言版本的 AutoCAD 中都適用。

### CAD 延伸不了，為什麼顯示沒有邊？

因為該端點要延伸的路徑上沒有任何物件橫跨。線的另一端可以到達某個邊時，會顯示 <Message id="noEdgeInThatDirection" />，否則線或弧會顯示 <Message id="pathDoesNotIntersectBoundingEdge" />；聚合線或雲形線則顯示 <Message id="objectDoesNotIntersectEdge" />。請在靠近另一端的地方點選，或在標準模式下選擇 <Keyword id="Edge" /> 與 <Keyword id="Extend" />，讓未達路徑的邊界也能視為延長後的邊界。圓、封閉的聚合線、完整的橢圓、文字或填充線完全無法延伸：<Message id="cannotExtendObject" />

### 如何一次延伸多條線？

在空白處點選，再點選第二點：籬選線所穿過的每個物件都會從較近的一端延伸，一次完成。也可以選擇 <Keyword id="Crossing" />，在要延伸的端點上框出一個窗選。

### 如何用 EXTEND 修剪？

點選時按住 Shift 鍵：該段會修剪到最近的交點，與 <Command id="TRIM" /> 相同；沒有任何物件與其相交的物件會被刪除。下一次不按 Shift 點選，就恢復為延伸。
