---
title: "CAD 練習圖：樓梯平面圖"
metaTitle: "AutoCAD 建築練習題：樓梯平面圖"
description: "AutoCAD 建築練習：繪製直線樓梯平面圖，以一條線加矩形陣列排出 10 階踏面，並畫上樓箭頭與標註。免費線上練習，附逐步解說。"
figure: "直線樓梯的平面圖，280 × 100 公分，箭頭指向上樓方向。"
sourceHash: "ff6e60262cd9"
---

以平面圖繪製一座直線樓梯，單位為公分：長 280、寬 100，10 階深 28 的踏面，以及表示上樓方向的箭頭。此圖面的標註比例已設定為公分單位的平面圖，因此標註在此尺寸下清晰可讀。只畫一階踏面的邊線，其餘由矩形陣列放置。

## Steps

### 繪製輪廓 [#outline]

在「輪廓線」圖層上，以 <Command id="RECTANG" />（矩形）指令從 `0,0` 畫到 `280,100`：即樓梯的輪廓。

### 繪製第一階踏面 [#tread]

第一階踏面的邊線：以 <Command id="LINE" />（線）指令從 `28,0` 向上 `0,100`，再按 Enter。

### 陣列踏面 [#array]

<Command id="ARRAYRECT" />（矩形陣列）指令沿著樓梯複製它：選取該線並按 Enter，再選擇 <Keyword command="ARRAYRECT" id="COUnt" />，`9` 行、`1` 列，以及 <Keyword command="ARRAYRECT" id="Spacing" />，行間距 `28`、列間距 `1`；只有一列時，列間距不起作用。<Keyword command="ARRAYRECT" id="eXit" /> 將其保留為關聯式陣列，之後可用其掣點編輯。

### 繪製箭頭 [#arrow]

以 <Command id="PLINE" />（聚合線）指令從 `14,50` 沿樓梯畫到相距 `226,0` 處；接著選擇 <Keyword command="PLINE" id="Width" />，起點寬度 `10`、終點寬度 `0`，最後一段為 `24,0`：即箭頭。按 Enter 結束。

### 標註 [#dimensions]

在「標註」圖層上，執行 <Command id="DIMLINEAR" />（線性）指令三次：下方的長度、右側的寬度，以及上方一階踏面的 28。
