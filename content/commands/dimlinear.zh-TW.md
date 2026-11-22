---
title: "AutoCAD 尺寸標註：DIMLINEAR（線性）指令"
metaTitle: "CAD 尺寸標註指令：線性標註（DIMLINEAR）與快捷鍵 DLI"
description: "AutoCAD 的 DIMLINEAR（DLI）如何進行尺寸標註，依提示逐步說明：兩個原點或一個物件，再放置水平或垂直的標註線。可在瀏覽器中免費試用。"
figure: "矩形標註兩次：上緣以兩個角點標註，右緣則按 Enter 後點選該邊標註。"
sourceHash: "e48a0a6f18c9"
---

DIMLINEAR（線性）指令沿 X 或 Y 測量兩點之間的距離，並繪製為標註：兩條延伸線、一條帶有箭頭的標註線，以及標註線上方的測量值。依序指定第一條與第二條延伸線原點，再指定標註線位置；與 AutoCAD 相同，放置的位置決定測量方向：放在兩點的上方或下方時水平測量，放在兩點旁邊時垂直測量。也可以在第一個提示下按 Enter，點選一條線、一個弧、聚合線的一段或一個圓：以其兩個端點，或圓的直徑，做為原點。指令行接著顯示測量值，指令隨即結束。

標註以目前的標註型式繪製，新圖面中為 ISO-25：以逗點做為小數分隔符號，且不顯示結尾零，與 AutoCAD 公制圖面的寫法相同。<Command id="DIMHORIZONTAL" />、<Command id="DIMVERTICAL" /> 與 <Command id="DIMROTATED" /> 只能以輸入方式執行，是固定於單一方向的 DIMLINEAR。

## Options

### Text

要求輸入要寫入的文字以取代測量值，並以測量值做為預設值：按 Enter 即保留測量值。在輸入的文字中，`<>` 代表測量值，因此 `<> mm` 會寫出測量值並接著單位。

### Angle

要求指定標註文字的角度，文字便以該角度繪製，而不沿著標註線。輸入 0 會讓文字回到沿標註線的方向。

### Horizontal

無論標註線放在哪裡，都沿 X 測量，標註線保持水平；之後提示只提供 <Keyword id="Text" /> 與 <Keyword id="Angle" />。

### Vertical

無論標註線放在哪裡，都沿 Y 測量，標註線保持垂直。

### Rotated

要求指定標註線的角度，預設為 `0`，並沿此角度測量兩個原點之間的距離。在斜邊上，輸入斜邊本身的角度即可得到其長度，與 <Command id="DIMALIGNED" /> 相同。

## Missing

多行文字：標註的文字為單行，透過指令行的 <Keyword id="Text" /> 設定，不使用文字編輯器。以 <Keyword id="Angle" /> 設定角度時，AutoCAD 會讓文字置中於標註線上；這裡文字則與未設定角度時一樣，位於標註線上方。標註不是關聯式標註：不會隨著所測量的物件變動。

## Questions

### AutoCAD 線性標註的快捷鍵是什麼？

`DLI` 或 `DIMLIN`，然後按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可以輸入 `_DIMLINEAR`。

### AutoCAD 有哪些標註指令？

<Command id="DIMLINEAR" /> 用於水平與垂直距離，<Command id="DIMALIGNED" /> 用於沿斜邊的距離，<Command id="DIMRADIUS" /> 與 <Command id="DIMDIAMETER" /> 用於弧與圓，<Command id="DIMANGULAR" /> 用於角度，<Command id="DIMCONTINUE" /> 與 <Command id="DIMBASELINE" /> 用於成串的標註，<Command id="DIMSPACE" /> 用於平均調整其間距，<Command id="DIMSTYLE" /> 用於設定其外觀。AutoCAD 的 DIM（在一個提示下建立任何類型的標註）與 QDIM（一次標註多個物件），MellowCAD 目前還沒有。

### 為什麼修改物件時標註不會跟著變動？

MellowCAD 的標註目前還不是關聯式標註，正如 <Message id="nonAssociativeDimension" /> 所說：標註保留其指定時的點。請將兩者一起拉伸：以一個 <Command id="STRETCH" /> 框選窗同時框住要移動的端點與該處的標註原點，測量值便會重新計算；或將原點的掣點拖曳到新位置。

### 如何變更標註文字與箭頭的大小？

與 AutoCAD 相同，在標註型式中設定：<Command id="DIMSTYLE" />（`D`）會開啟標註型式；AutoCAD 使用「標註型式管理員」，這裡則是「型式」選項板。目前型式的文字高度、箭頭大小、整體比例與小數位數都在那裡設定，使用該型式的所有標註都會隨之更新。
