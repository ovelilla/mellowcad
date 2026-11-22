---
title: "AutoCAD EXTRUDE（擠出）指令"
metaTitle: "CAD 擠出指令（EXTRUDE）用法與快捷鍵 EXT"
description: "AutoCAD 擠出指令 EXTRUDE（EXT）如何將封閉的 2D 輪廓變成 3D 實體，逐一提示說明：高度、方向、推拔角度。可在瀏覽器中免費線上試用。"
figure: "一條封閉的 L 形聚合線擠出 20 成為實體，再以「隱藏」視覺型式從東南方檢視。"
sourceHash: "53bfe3dd1e9c"
---

EXTRUDE（擠出）指令將封閉的 2D 輪廓變成 3D 實體，每個輪廓都依您指定的高度，垂直於其平面直接拉出。選取輪廓（圓、橢圓、封閉的聚合線或雲形線、面域）並按 Enter，再輸入高度或以一點指定；上次的高度會成為下次執行的預設值。每個輪廓各自成為一個實體，位於目前的圖層上，輪廓則依 DELOBJ 的預設值刪除。整個指令是一個步驟，退回一次即可復原。

MellowCAD 的 3D 僅有實體，而且仍不完整：AutoCAD 會將開放的輪廓變成曲面，此處則顯示 <Message id="sweepRefusedType" />，並將其從選集中移除。

## Options

### MOde

要求選擇 <Keyword id="SOlid" /> 或 <Keyword id="SUrface" />。<Keyword id="SOlid" /> 是預設值，也是唯一可用的選項：目前還沒有曲面物件，<Keyword id="SUrface" /> 會被拒絕。

### Direction

以兩點代替高度指定方向與長度：輪廓沿該直線擠出，直線傾斜時實體也隨之傾斜。方向位於輪廓平面內時，會顯示 <Message id="directionParallel" />，並結束指令。

### Path

與 AutoCAD 一樣會列出，但尚未實作：選擇此選項會被拒絕，並再次要求輸入高度。

### Taper

要求輸入 −90 到 90 度之間的角度，再次要求輸入高度：正角度使實體隨高度收窄，負角度使其變寬。在達到高度之前就收攏的圓會結束於一點，成為圓錐；推拔角度無法套用的輪廓不會產生任何物件。

### Expression

以表示式指定高度：`2*3` 為 6。目前僅支援算術運算。

## Missing

路徑，即沿路徑掃掠。曲面模式，以及 AutoCAD 會將其建立為曲面的開放輪廓：目前還沒有曲面物件。實體的面，以及在物件內部點選所找到的區域，這些由 <Command id="PRESSPULL" /> 處理。橢圓、雲形線，或與下一個線段以角點相接的弧上的推拔角度。表示式的參數與函數。對側面為曲面的擠出實體執行 <Command id="EXPLODE" />，AutoCAD 會將其變成曲面與面域。其掣點，以及在「性質」選項板中編輯其高度與推拔角度。

## Questions

### AutoCAD 擠出指令的快捷鍵是什麼？

輸入 `EXT`，再按 Enter 或空白鍵。輸入完整名稱也可以，而 `_EXTRUDE` 在任何語言版本的 AutoCAD 中都適用。

### CAD 2D 圖面如何擠出成 3D？

將外形畫成一個封閉物件（封閉的聚合線、圓或面域），執行 EXTRUDE，選取物件，按 Enter 並輸入高度。從上方看，實體與其外形相同：請以 ViewCube 或 <Command id="-VIEW" /> 與 <Keyword command="VIEW" id="SEiso" /> 轉動視圖，以 3D 檢視。

### 為什麼 EXTRUDE 擠出後不是實體？

輪廓是開放的，或與自身相交。線、弧或開放的聚合線在 AutoCAD 中會產生曲面，而 MellowCAD 目前還沒有曲面：EXTRUDE 會顯示 <Message id="sweepRefusedType" />，並將其從選集中移除；與自身相交的輪廓會顯示 <Message id="sweepSelfIntersecting" />，同樣會被移除。請以 <Command id="JOIN" /> 接合各段，以 <Command id="REGION" /> 將其建立為面域，或以 <Command id="PRESSPULL" /> 在其內部點選。

### 如何擠出有孔的形狀？

將其建立為一個面域：對外形與孔執行 <Command id="REGION" />，再以 <Command id="SUBTRACT" /> 從外形的面域減去孔的面域。擠出該面域，孔就會貫穿實體。也可以執行 <Command id="PRESSPULL" />，在外形與孔之間點選。

### 如何沿路徑擠出？

目前還不行：<Keyword id="Path" /> 會列出但會被拒絕，SWEEP 也尚未實作。<Keyword id="Direction" /> 可沿兩點之間的直線擠出。
