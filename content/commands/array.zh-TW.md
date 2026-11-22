---
title: "AutoCAD ARRAY（陣列）指令"
metaTitle: "CAD 陣列指令（ARRAY）：矩形、環形與路徑"
description: "AutoCAD 陣列（ARRAY、AR）依提示逐步說明：矩形、環形與路徑陣列，建立之前即可即時編輯。可在瀏覽器中免費試用。"
figure: "一個正方形及其中的圓以預設值陣列：按 Enter 建立矩形陣列，4 行 3 列。"
sourceHash: "5e0a412c9f13"
---

ARRAY（陣列）指令以某種排列方式複製選集：成行成列、繞著中心點，或沿著路徑。它先要求選取物件，再要求陣列類型，按 Enter 即為矩形陣列，然後將選集交給 <Command id="ARRAYRECT" />、<Command id="ARRAYPOLAR" /> 或 <Command id="ARRAYPATH" />，這些指令會直接繼續，不再要求選取物件。每個指令都會立即顯示陣列，並透過其選項與掣點即時編輯，直到按 Enter 建立：一個陣列物件，或在指定為非關聯式時建立個別的複本。整個執行過程是一個退回步驟，在指令提示按 Enter 會重複 ARRAY。

## Options

### Rectangular

行與列，需要時還可沿 Z 堆疊層：<Command id="ARRAYRECT" />。開始時為 4 行 3 列，間距為選集大小的 1.5 倍。

### PAth

沿著線、弧、圓或聚合線：<Command id="ARRAYPATH" />。它會要求路徑曲線，再沿著它排列各項目，每個項目隨路徑轉向而旋轉。

### POlar

繞著中心點：<Command id="ARRAYPOLAR" />。它會要求中心點，開始時為整圈 6 個項目。

## Missing

提供的類型永遠是「矩形」：不會讀取設定 AutoCAD 預設值的變數 ARRAYTYPE。

## Questions

### AutoCAD 陣列的快捷鍵是什麼？

`AR`，再按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可輸入 `_ARRAY`。<Command id="ARRAYRECT" />、<Command id="ARRAYPOLAR" /> 與 <Command id="ARRAYPATH" /> 沒有指令別名，輸入完整名稱時會略過類型的詢問。

### 如何建立環形陣列？

選擇 <Keyword id="POlar" />，或執行 <Command id="ARRAYPOLAR" />，再點選中心點：選集會繞著它複製，開始時為 6 個項目。以 <Keyword command="ARRAYPOLAR" id="Items" /> 變更個數，以 <Keyword command="ARRAYPOLAR" id="Fill angle" /> 設定它們佈滿的角度。

### 如何分解陣列？

選取陣列並執行 <Command id="EXPLODE" />：陣列會變成其項目的物件，每個物件位於其原本的圖層。若要一開始就得到個別的複本，請在按 Enter 之前，對 <Keyword command="ARRAYRECT" id="ASsociative" /> 回答 <Keyword command="ARRAYRECT" id="No" />。

### 陣列建立後如何修改？

選取陣列。其掣點可以修改它：基準點上的方形掣點用來移動，箭頭掣點設定個數與間距，在個數箭頭作用中時輸入的數字即為個數。「性質」選項板會列出其行數、列數與間距，或其項目數與角度，可重新輸入。目前還沒有 ARRAYEDIT。
