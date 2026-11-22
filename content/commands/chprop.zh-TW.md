---
title: "AutoCAD CHPROP（變更性質）指令"
metaTitle: "CAD 變更性質（CHPROP）：以指令行修改性質"
description: "AutoCAD CHPROP 用法：選取物件，再於指令行中變更其顏色、圖層、線型與線型比例、線粗或厚度。可在瀏覽器中免費試用。"
figure: "對穿過板上孔的一條線執行 CHPROP：顏色 1 與線型 CENTER，成為中心線，仍在原本的圖層上。"
sourceHash: "4ba30c3c6070"
---

CHPROP（變更性質）指令在指令行中變更所選物件的性質：即「性質」選項板的「一般」各列，以提示的方式詢問。選取物件，或在指令之前選取，再選擇要變更的性質；每變更一項後會再次詢問，直到按 Enter 結束。每個性質的提示都會以選集的值作為預設值，物件之間不同時則為 <Message id="varies" />，在此按 Enter 會讓每個物件保留各自的值。所做的設定在指令結束時才套用，因此按 Esc 會讓每個物件保持原狀。位於鎖住圖層上的物件會被計數並排除，每個都顯示 <Message id="objectOnLockedLayer" />。整個執行過程是一個步驟，可由 <Command id="U" /> 退回。

## Options

### Color

1 到 255 的顏色號碼、`red` 之類的名稱、`BYLAYER`，或 <Keyword id="Truecolor" /> 及其 `Red,Green,Blue`，與 <Command id="COLOR" /> 接受的方式相同；COLOR 拒絕的值在此也會被拒絕，並再次詢問。

### LAyer

圖層的名稱，不分大小寫。不能作為圖層名稱的名稱會顯示 <Message id="invalidLayerName" />，圖面中沒有的名稱會說明找不到；兩者都會再次詢問。CHPROP 不會建立圖層。

### LType

線型的名稱，不分大小寫，或 `ByLayer`。圖面尚未載入的線型會從 acad.lin 載入，這是 AutoCAD 以英吋為單位的檔案，與 AutoCAD 相同，即使在公制圖面中也是如此；該檔案中也沒有的名稱會說明找不到，並回到性質提示。

### ltScale

物件本身的線型比例，只對這些物件乘以 <Command id="LTSCALE" /> 的比例：一個距離，可輸入或以兩點量取；負值會取其絕對值，0 會顯示 <Message id="valueMustBeNonzero" /> 並再次詢問。

### LWeight

以公釐為單位的線粗，與 <Command id="LWEIGHT" /> 相同，會捨入到最接近的標準線粗，或 `ByLayer`；`?` 會列出各線粗。

### Thickness

一個距離，可輸入或以兩點量取，也可以是負值或零。它會設定在選集中的線、圓、弧與聚合線上，沿各自的法線方向；對其他類型的物件，指令結束時會說明無法變更其厚度。

## Missing

「透明度」、「材料」與「可註解」，此處的物件沒有這些性質，因此提示不會列出。「顏色」、「線型」與「線粗」中的 ByBlock，以及「線粗」的「預設」。與索引顏色相同的全彩會讀回為索引顏色：`255,0,0` 會以 `1 (red)` 提供。顏色表。文字與屬性定義的厚度，保持不變。CHANGE，其「性質」會以相同的提示詢問，並多一個「高程」。

## Questions

### AutoCAD CHPROP 有快捷鍵嗎？

它沒有指令別名：請輸入 `CHPROP`，在任何語言版本的 AutoCAD 中都可輸入 `_CHPROP`。在指令提示按 Enter 會重複它。

### CHPROP 和 PROPERTIES 有什麼差別？

它們變更相同的性質。<Command id="PROPERTIES" /> 在選項板中顯示這些性質，還包括每個物件的幾何資料；CHPROP 則在指令行中詢問，讓雙手留在鍵盤上。

### 如何從指令行變更物件的顏色？

輸入 `CHPROP`，選取物件，按 Enter，選擇 <Keyword id="Color" /> 並輸入顏色，例如以 `1` 代表紅色。再按 Enter 結束。

### 如何將多個物件移到另一個圖層？

執行 CHPROP，選取物件，選擇 <Keyword id="LAyer" /> 並輸入圖層的名稱。該圖層必須已存在：請先在 <Command id="LAYER" /> 中建立。
