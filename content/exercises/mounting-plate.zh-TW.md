---
title: "CAD 3D 練習圖：安裝板"
metaTitle: "AutoCAD 3D 入門練習題：安裝板"
description: "AutoCAD 3D 入門練習：建立面域、以差集挖出孔，再一次擠出即成安裝板實體，附逐步解說。免費線上練習 3D 實體。"
figure: "板的輪廓，100 × 60，含 4 個孔，已標註。"
model: "厚 10 的板實體，從東南方檢視，隱藏線已移除。"
sourceHash: "87b8f906b0fd"
---

建立一塊厚 10 的安裝板模型，單位為公釐：輪廓 100 × 60，四角圓角半徑 8，另有 4 個直徑 10 的孔，其中心距邊緣 15。一開始是平面的。輪廓與圓先變成面域，在板仍是平面時差集出孔，再以一次擠出使其成為帶孔的實體。

## Steps

### 繪製平面輪廓 [#profile]

在「輪廓線」圖層上，以 <Command id="RECTANG" />（矩形）指令，<Keyword command="RECTANG" id="Fillet" /> 為 `8`，從 `0,0` 畫到 `100,60`。再於 `15,15` 畫一個 <Keyword command="CIRCLE" id="Diameter" /> 為 `10` 的圓，並以 <Command id="COPY" />（複製）指令從其中心點複製到 `70,0`、`70,30` 與 `0,30`。

### 建立面域 [#region]

<Command id="REGION" />（面域）指令將封閉物件轉為面域：選取輪廓與 4 個圓，再按 Enter。五個封閉迴路，五個面域。

### 差集出孔 [#subtract]

<Command id="SUBTRACT" />（差集）指令：選取板的面域並按 Enter，再選取 4 個圓的面域並按 Enter。只剩下一個面域，其中有 4 個孔。

### 轉動視圖 [#view]

<Command id="-VIEW" /> 指令的 <Keyword command="VIEW" id="SEiso" /> 從東南上方檢視；<Command id="VSCURRENT" />（視覺型式）指令的 <Keyword command="VSCURRENT" id="Hidden" /> 隱藏被面遮住的部分。按一下 ViewCube 也能轉動視圖。

### 擠出 [#extrude]

<Command id="EXTRUDE" />（擠出）指令：選取面域，按 Enter，輸入高度 `10`。板連同孔成為一個實體。<Command id="ZOOM" />（縮放）指令的 <Keyword command="ZOOM" id="Extents" /> 將其置於畫面中，比例 `0.8x` 則在四周留出空間。
