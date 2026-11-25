---
title: "AutoCAD DIMBASELINE（基線式）標註指令"
metaTitle: "CAD 基線式標註（DIMBASELINE）用法與快捷鍵 DBA"
description: "AutoCAD 的 DIMBASELINE（DBA）如何從同一條基準線堆疊標註，依提示逐步說明：下一個原點、間距、選取與退回。可在瀏覽器中免費試用。"
figure: "階梯形輪廓從左邊緣標註 30，再從同一邊緣標註 70 與 100，每個標註都比前一個更往外一層。"
sourceHash: "619fc0d438e9"
---

DIMBASELINE（基線式）指令繪製的標註都從同一條延伸線（基準）開始測量：每個標註從上一個標註的第一條延伸線，量到指定的下一個點，其標註線比前一個更往外一個間距。它從開啟圖面後最後建立的線性或對齊式標註開始，因此通常接在 <Command id="DIMLINEAR" /> 或 <Command id="DIMALIGNED" /> 之後；若沒有這樣的標註，則會詢問要從哪一個開始。指令行會在建立每個標註時顯示其測量值。在原點提示下按 Enter 會選擇 <Keyword id="Select" />，在該提示下再按 Enter 即結束指令，與按 Esc 相同。

間距為目前標註型式的基準線間距，ISO-25 為 3.75，再乘以基準標註的整體比例。與 AutoCAD 相同，每個新標註都沿著基準標註的方向測量，並採用基準標註的標註型式與圖層，以及目前的顏色、線型與線粗。

## Options

### Select

要求選取基準標註：點選一個線性或對齊式標註，點選位置靠近要做為測量起點的延伸線。在此提示下輸入點也可以點選。半徑或直徑標註會被拒絕，並顯示 <Message id="associativeDimensionRequired" />，然後再次詢問。

### Undo

退回最後建立的標註，並從前一個標註繼續，可重複到沒有標註為止。沒有可退回的標註時，會回應 <Message id="commandCompletelyUndone" />，提示保持不變。

## Missing

標註不是關聯式標註：標註不會隨著所測量的物件變動。角度標註無法做為基準：AutoCAD 接受最後建立或點選的角度標註；這裡若最後建立的是角度標註，指令會要求選取標註，若點選角度標註，則與半徑或直徑標註一樣被拒絕。目前還沒有座標式標註。

## Questions

### AutoCAD 基線式標註的快捷鍵是什麼？

`DBA`，然後按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可以輸入 `_DIMBASELINE`。

### 如何變更基線式標註的間距？

即標註型式的基準線間距：<Command id="DIMSTYLE" />（`D`）會開啟「標註型式管理員」，該設定與 AutoCAD 一樣位於「線」頁籤上。已繪製的標註保持原位；<Command id="DIMSPACE" /> 可以重新平均調整其間距。

### 如何從另一個標註開始？

在第一個提示下按 Enter，或選擇 <Keyword id="Select" />，在該標註上靠近要做為測量起點的延伸線處點選：之後的每個新標註都從那裡開始。

### DIMBASELINE 與 DIMCONTINUE 有何不同？

DIMBASELINE 讓每個標註都從同一條延伸線開始測量，每個都在更往外一層的標註線上。<Command id="DIMCONTINUE" /> 則將標註首尾相接排在同一條線上，每個都從上一個結束處開始。
