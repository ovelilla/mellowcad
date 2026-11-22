---
title: "AutoCAD DIST（距離）指令"
metaTitle: "CAD 量距離：DIST（距離）用法與快捷鍵 DI"
description: "AutoCAD 的 DIST（DI）如何使用：兩點之間的距離及其角度與 X、Y、Z 差值，或一連串點的總長度。可在瀏覽器中免費試用。"
figure: "沿 100 × 60 板件的對角線執行 DIST：距離、XY 平面內的角度與各差值。"
sourceHash: "31fbe420bc43"
---

DIST（距離）指令測量兩點之間的距離。點選、鎖點或輸入第一點與第二點後，指令會在指令提示下寫出距離、XY 平面內的角度與距 XY 平面的夾角，以及 X、Y、Z 差值，然後結束。每個點都在其所在位置測量，包含其 Z 值，因此距離為空間中的實際距離。在第一點的提示下按 Enter，會從上次指定的點開始；在第二點的提示下按 Enter，會量回到第一點。數值依圖面的精確度顯示，角度則依 AUPREC。

## Options

### Multiple

在第二點的提示下選擇 <Keyword id="Multiple" />：改為一連串的點，而不是單一段距離；在每個下一點之前會寫出目前累計的距離，並顯示在游標上方，直到按 Enter 或選擇 <Keyword id="Total" /> 為止。

### Arc

改為沿弧測量，使用 PLINE 的弧選項：<Keyword id="Angle" />、<Keyword id="Center" />、<Keyword id="Close" />、<Keyword id="Direction" />、<Keyword id="Line" />、<Keyword id="Radius" />、<Keyword id="Second pt" />、<Keyword id="Undo" />。每個弧的長度都會加入累計。

### Close

回到第一點，加入最後這一段，寫出總長並結束。

### Length

沿上一段的方向，加入一段指定長度的距離。

### Undo

退回這一連串點中的最後一個點。

### Total

寫出這一連串點的總長並結束；按 Enter 也一樣。

## Missing

MEASUREGEOM，即功能區的「測量」工具，會在迴圈中提出 DIST 的提示，並提供半徑、角度、面積、體積與快速選項：這裡功能區的「距離」按鈕執行的是 DIST。在「弧」選項的 <Keyword id="Center" /> 下，夾角以度讀取，而 AutoCAD 2027 會將該處輸入的數字讀取為沿游標方向的距離。

## Questions

### AutoCAD DIST 的快捷鍵是什麼？

`DI`，然後按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可以輸入 `_DIST`。

### AutoCAD 如何量距離？

輸入 `DI`，然後點選兩個點，可使用物件鎖點準確落在物件的端點或中心點上。距離會連同角度與差值寫在指令提示下。

### 如何測量多個線段的總長度？

在第二點的提示下選擇 <Keyword id="Multiple" />，並繼續點選：每個點都會顯示目前累計的距離，按 Enter 即寫出總長。

### 如何測量 3D 距離？

指定點時包含其 Z 值，或鎖點到位於其高度的物件：DIST 會測量空間中的實際距離，並寫出距 XY 平面的夾角與 Z 差值。

### 為什麼 DIST 顯示的小數位數不夠？

它以圖面的精確度寫出長度，這裡新圖面為兩位小數。在 <Command id="UNITS" /> 中可設定更多位數，最多八位。
