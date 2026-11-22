---
title: "AutoCAD DIMCONTINUE（連續式）標註指令"
metaTitle: "CAD 連續式標註（DIMCONTINUE）用法與快捷鍵 DCO"
description: "AutoCAD 的 DIMCONTINUE（DCO）如何從上一個標註首尾相接地連續標註，依提示逐步說明：下一個原點、選取與退回。可在瀏覽器中免費試用。"
figure: "階梯形輪廓標註 30，再沿同一條線連續標註 40 與 30：指定兩個原點，再按兩次 Enter。"
sourceHash: "11fa474694fd"
---

DIMCONTINUE（連續式）指令繪製首尾相接的一串標註：每個標註從前一個標註的第二條延伸線開始，量到指定的下一個點，位於同一條標註線上。它延續開啟圖面後最後建立的線性或對齊式標註，因此通常接在 <Command id="DIMLINEAR" /> 或 <Command id="DIMALIGNED" /> 之後；若沒有這樣的標註，則會詢問要延續哪一個。指令行會在建立每個標註時顯示其測量值。在原點提示下按 Enter 會選擇 <Keyword id="Select" />，在該提示下再按 Enter 即結束指令，與按 Esc 相同。

與 AutoCAD 相同，每個新標註都沿著基準標註的方向測量，並採用基準標註的標註型式與圖層，以及目前的顏色、線型與線粗。

## Options

### Select

要求選取要延續的標註：點選一個線性或對齊式標註，點選位置靠近要從其繼續的延伸線。在此提示下輸入點也可以點選。半徑或直徑標註會被拒絕，並顯示 <Message id="associativeDimensionRequired" />，然後再次詢問。

### Undo

退回這串標註中的最後一個標註，並從前一個標註繼續，可重複到沒有標註為止。沒有可退回的標註時，會回應 <Message id="commandCompletelyUndone" />，提示保持不變。

## Missing

標註不是關聯式標註：一串標註不會隨著所測量的物件變動。角度標註無法延續：AutoCAD 會延續最後建立或點選的角度標註；這裡若最後建立的是角度標註，指令會要求選取標註，若點選角度標註，則與半徑或直徑標註一樣被拒絕。目前還沒有座標式標註。

## Questions

### AutoCAD 連續式標註的快捷鍵是什麼？

`DCO`，然後按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可以輸入 `_DIMCONTINUE`。

### DIMCONTINUE 與 DIMBASELINE 有何不同？

DIMCONTINUE 將標註首尾相接排在同一條線上，每個都從上一個結束處開始。<Command id="DIMBASELINE" /> 則讓所有標註都從同一條延伸線開始測量，每個都在更往外一層的標註線上。

### 如何從不是最後一個的標註繼續？

在第一個提示下按 Enter，或選擇 <Keyword id="Select" />，在該標註上靠近要從其繼續的延伸線處點選：這串標註便從那裡延伸。

### 為什麼 DIMCONTINUE 要求選取標註？

因為沒有可延續的標註：開啟圖面後沒有建立任何線性或對齊式標註（與 AutoCAD 剛開啟圖面時相同），或最後建立的是角度標註。請點選要從其繼續的標註。
