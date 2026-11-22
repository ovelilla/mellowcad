---
title: "AutoCAD PLAN（平面視圖）指令"
metaTitle: "CAD 平面視圖指令（PLAN）：回到 UCS 或世界平面"
description: "AutoCAD PLAN（平面視圖）正對目前的 UCS、已儲存的 UCS 或世界座標系統往下看：目前的 UCS、UCS、世界，以及如何回到平面視圖。免費線上試用。"
figure: "從西南方向看的階梯狀方塊，其 UCS 繞 Z 旋轉 30 度：執行 PLAN 並按 Enter，正對該 UCS 往下看，其 X 軸朝右，因此方塊顯示為旋轉後的樣子。"
sourceHash: "50d157803309"
---

PLAN（平面視圖）指令正對 UCS 的 XY 平面往下看，其 X 軸朝右：也就是繪圖時的平面視圖。指令會詢問要使用哪個 UCS——目前的、已儲存的或世界座標系統——按 Enter 即使用目前的 UCS。接著縮放至整個圖面，並顯示 <Message id="regeneratingModel" />。

圖面中的物件都不會移動，UCS 也保持不變：PLAN 只轉動視圖。它是一個退回步驟，因此 <Command id="U" /> 可以將視圖復原，<Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> 則回到之前的視圖。在使用 <Command id="3DORBIT" /> 或等角 <Command id="VIEW" /> 之後，用它回到平面視圖。MellowCAD 的 3D 目前只有實體，且仍屬部分功能。

## Options

### Current ucs

目前 UCS 的平面視圖，為預設值。以 <Command id="UCS" /> 將 UCS 繞 Z 旋轉 30 度之後，圖面會顯示為順時鐘旋轉 30 度，使 UCS 的 X 軸朝右；將 UCS 設在斜面上之後，則會正對該面。

### Ucs

以 <Command id="UCS" /> 的 <Keyword command="UCS" id="NAmed" /> 儲存的 UCS 的平面視圖，需輸入其名稱。輸入未儲存的名稱時，會顯示找不到該 UCS 並再次詢問；<Keyword id="?" /> 如同 UCS 指令，列出已儲存的 UCS，然後也再次詢問。目前的 UCS 不會改變。

### World

世界座標系統的平面視圖：圖面回到最初的樣子，X 朝右、Y 朝上，不論目前的 UCS 為何，UCS 都保持不變。

## Missing

圖面中沒有任何物件時，PLAN 會維持原來的縮放，AutoCAD 則會縮放至圖面範圍。

## Questions

### AutoCAD 如何回到平面視圖？

輸入 `PLAN` 並按兩次 Enter：第二次 Enter 即選擇 <Keyword id="Current ucs" />。若 UCS 已旋轉，而您需要世界座標系統的平面視圖，請改為選擇 <Keyword id="World" />。

### UCS 的平面視圖要用哪個指令？

使用 PLAN 的 <Keyword id="Current ucs" />：它正對目前的 UCS 往下看，X 軸朝右。先以 <Command id="UCS" /> 旋轉 UCS，再執行 PLAN 並按兩次 Enter，就能在旋轉後的平面上如正向一般繪圖。

### 為什麼平面視圖中的圖面是旋轉的？

此視圖是旋轉後的 UCS 的平面視圖。執行 PLAN 並選擇 <Keyword id="World" />，即可再次以世界座標系統的 X 朝右檢視圖面；執行 <Command id="UCS" /> 並按 Enter，也會將 UCS 設回世界座標系統。

### PLAN 會改變 UCS 嗎？

不會。它只轉動視圖，UCS 保持不變。會同時轉動 UCS 的，是 <Command id="VIEW" /> 的正投影視圖。
