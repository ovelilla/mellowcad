---
title: "AutoCAD CHAMFER（倒角）指令"
metaTitle: "CAD 倒角指令（CHAMFER）：距離與快捷鍵 CHA"
description: "AutoCAD 倒角（CHAMFER、CHA）依提示逐步說明：兩個距離、兩條線或聚合線的角點、多重與 Shift。可在瀏覽器中免費試用。"
figure: "四條線，接著將兩個距離都設為 10 並使用「多重」：兩個角點被切成倒角，另兩個保持尖角。"
sourceHash: "e43c5b72ffc8"
---

CHAMFER（倒角）指令以一條直線斜邊切去兩條線之間的角。點選第一條線，再點選第二條線：兩條線各自修剪或延伸到斜邊，第一條依第一個距離，第二條依第二個距離，再以斜邊連接。可用於兩條線、聚合線的兩個直線段，或一條線與一條聚合線，後者會接合成一條聚合線。與 AutoCAD 相同，第一行會顯示目前的距離，這些距離儲存在圖面中；兩者皆為 0（預設值）時會形成尖角，兩條線相交。點選第二條線時，將形成的角會顯示在線上。

## Options

### Undo

退回本次執行中的最後一個倒角，以及隨之所做的距離變更。

### Polyline

要求一條 2D 聚合線，並將其每個角點倒角，然後顯示已倒角的線段數，以及未倒角的原因。

### Distance

要求第一個與第二個倒角距離。第二個距離會提供第一個距離作為預設值，因此在此按 Enter 會讓斜邊等距，在直角上為 45 度。

### Multiple

每次倒角後持續要求第一條線，直到按 Enter 或 Esc。

## Missing

「角度」，以一個距離與一個角度設定斜邊；「方式」與「修剪」：CHAMFER 一律以兩個距離作業，且一律修剪線。在 AutoCAD 中斜邊會採用第二條線的線型比例，此處則不會。

## Questions

### AutoCAD 倒角指令的快捷鍵是什麼？

`CHA`，再按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可輸入 `_CHAMFER`。

### AutoCAD 如何做 45 度倒角？

選擇 <Keyword id="Distance" />，輸入距離，並在第二個距離提示按 Enter：在直角上，兩個相等的距離會形成 45 度的斜邊。

### CHAMFER 和 FILLET 有什麼差別？

CHAMFER 以直線斜邊連接兩條線；<Command id="FILLET" /> 則以與兩者相切的弧連接。兩者都會將線修剪或延伸到該處，且在設為 0 或點選第二條線時按住 Shift，都會形成尖角。

### CAD 倒角指令沒有作用怎麼辦？

它會說明原因：距離超出線的端點時顯示 <Message id="chamferDistanceTooLarge" />，平行線顯示 <Message id="linesParallel" />，弧或圓則顯示 <Message id="chamferRequiresLines" />。兩個距離皆為 0 時，會形成尖角，而不是斜邊。

### 如何將矩形的每個角點倒角？

矩形是聚合線：選擇 <Keyword id="Polyline" /> 並點選它，每個角點都會以目前的距離倒角。
