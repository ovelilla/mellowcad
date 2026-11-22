---
title: "AutoCAD COLOR（顏色）指令"
metaTitle: "CAD 顏色指令（COLOR）：物件顏色、ByLayer"
description: "AutoCAD 顏色（COLOR、COL）如何設定新物件的顏色：ByLayer、以名稱或號碼指定的索引顏色，或 RGB 全彩。可在瀏覽器中免費試用。"
figure: "一塊以 ByLayer 繪製的板，其孔為紅色，其內孔為全彩 0,128,255，最後將 COLOR 設回 ByLayer。"
sourceHash: "f0bfb2cf8fe7"
---

COLOR（顏色）指令設定新物件繪製時所用的顏色。AutoCAD 會開啟「選取顏色」對話方塊；MellowCAD 目前還沒有，因此 COLOR 會執行 AutoCAD 也有的指令行形式 <Command id="-COLOR" />。它會要求預設物件顏色，並提供目前的顏色，新圖面中為 `BYLAYER`：ByLayer 表示每個物件採用其圖層的顏色，改選其他顏色則為物件本身的顏色。輸入 1 到 255 的索引顏色號碼，或前七種之一的名稱，或選擇 <Keyword id="Truecolor" />。按 Enter 會保留目前的顏色，變更是一個步驟，可由 <Command id="U" /> 退回。

無法辨識的字詞會顯示 <Message id="colorRequired" />，0、負數或大於 255 的數字則顯示 <Message id="invalidColorNumber" />；兩者都會再次詢問。在指令中加上單引號輸入 `'COLOR` 時，其後繪製的每個物件都會採用新的顏色：<Command id="LINE" /> 的每個線段採用其開始繪製時的目前顏色。COLOR 只設定之後繪製的物件；已繪製的物件以「性質」選項板或頂端列的顏色清單變更。

## Options

### Truecolor

要求以紅、綠、藍三個 0 到 255 的值指定顏色，以逗號分隔，不加空格：`0,128,255` 為中藍色。即使某個索引顏色有相同的 RGB，它仍保持為全彩：輸入 `255,0,0` 之後，COLOR 提供的是 `255,0,0`，而不是 red。

### BYLAYER

新物件採用其圖層的顏色，與一開始相同。

### RED

索引顏色 1，也可輸入 `1`。

### YELLOW

索引顏色 2，也可輸入 `2`。

### GREEN

索引顏色 3，也可輸入 `3`。

### CYAN

索引顏色 4，也可輸入 `4`。

### BLUE

索引顏色 5，也可輸入 `5`。

### MAGENTA

索引顏色 6，也可輸入 `6`。

### WHITE

索引顏色 7，也可輸入 `7`：在深色背景上為白色，在淺色背景上為黑色。

## Missing

「選取顏色」對話方塊、顏色表與 HSL 形式。ByBlock。透明度（CETRANSPARENCY），以及各類型的預設值 HPCOLOR、HPLAYER、DIMLAYER 與 TEXTLAYER。

## Questions

### AutoCAD 顏色指令的快捷鍵是什麼？

`COL`，再按 Enter 或空白鍵；`COLOUR` 也可以。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可輸入 `_COLOR`。

### AutoCAD 如何變更物件的顏色？

選取物件，在頂端列的顏色清單或「性質」選項板的「顏色」列中選擇顏色：一個步驟即完成變更。也可以使用 <Command id="MATCHPROP" /> 複製其他物件的顏色。COLOR 只設定其後繪製之物件的顏色。

### AutoCAD 的 ByLayer 是什麼意思？

表示物件採用其圖層的顏色，因此在「圖層性質管理員」中變更圖層的顏色，會變更該圖層上所有 ByLayer 的物件。這是預設值，可讓圖面的顏色依圖層整理：<Command id="LAYER" />。

### AutoCAD 如何使用 RGB 顏色？

選擇 <Keyword id="Truecolor" />，並輸入以逗號分隔的三個值，例如 `0,128,255`。
