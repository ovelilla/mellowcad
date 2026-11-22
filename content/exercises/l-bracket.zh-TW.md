---
title: "CAD 練習圖：L 型支架"
metaTitle: "AutoCAD 入門練習題：L 型支架"
description: "AutoCAD 入門練習：以相對座標繪製 L 型支架的輪廓、圓角、兩個孔與基線式標註，附逐步解說。免費線上練習。"
figure: "100 × 80 的 L 型支架，自左下角點起標註。"
sourceHash: "5c7cd5d57c92"
---

繪製此支架，單位為公釐：長 100，底腳高 20，立板寬 30、高 80，內角以半徑 10 倒圓角；底腳上有直徑 8 的孔，立板上有直徑 10 的孔，各位於所在部位的中央。輪廓以一次 <Command id="LINE" />（線）指令畫完，每一點都以與上一點的距離輸入，所有標註都從左下角點起算。

## Steps

### 繪製輪廓 [#outline]

在「輪廓線」圖層上，以 <Command id="LINE" /> 指令從 `0,0` 開始，之後每一點都以與上一點的相對距離輸入：`100,0`、`0,20`、`-70,0`、`0,60` 與 `-30,0`。<Keyword command="LINE" id="Close" /> 會畫出回到起點的最後一邊並結束指令。

### 內角倒圓角 [#fillet]

<Command id="FILLET" />（圓角）指令：選擇 <Keyword command="FILLET" id="Radius" />，輸入 `10`，再選取在內角相交的兩條線：底腳的頂邊與立板的側邊。

### 繪製孔 [#holes]

以 <Command id="CIRCLE" />（圓）指令畫兩個圓，各以 <Keyword command="CIRCLE" id="Diameter" /> 指定：底腳上 `80,10` 處為 `8`，立板上 `15,65` 處為 `10`。

### 標註 [#dimensions]

在「標註」圖層上，以 <Command id="DIMLINEAR" />（線性）指令從 `0,0` 標到底腳的孔 `80,10`，置於下方：80。<Command id="DIMBASELINE" />（基線式）指令從同一條第一延伸線繼續標註：輸入右端點 `#100,0`（# 表示從原點量起），再按兩次 Enter 結束。左側向上也同樣處理，先標到上方的孔，再標到頂端 `#0,80`。最後以 <Command id="DIMRADIUS" />（半徑）指令標註圓角，以 <Command id="DIMDIAMETER" />（直徑）指令標註各孔。
