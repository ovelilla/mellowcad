---
title: "CAD 3D 練習圖：皮帶輪"
metaTitle: "AutoCAD 3D 練習題：以迴轉建立皮帶輪"
description: "AutoCAD 3D 練習：以封閉聚合線繪製皮帶輪的半剖面，繞 Y 軸迴轉成實體，附逐步解說。免費線上練習 3D 實體。"
figure: "皮帶輪的半剖面位於其軸線旁，與軸線的距離皆已標註。"
model: "皮帶輪實體，從東南方以「概念」視覺型式檢視。"
sourceHash: "f9c2a81b39fe"
---

將半剖面繞其軸線迴轉，建立此皮帶輪的模型，單位為公釐：軸孔直徑 20，輪轂長 30、直徑 40，腹板厚 10，輪緣寬 24、直徑從 90 到 110，置於輪轂中央。剖面以與軸線的距離繪製，軸線沿 Y 軸向上，因此每個直徑都以其一半繪製。

## Steps

### 繪製半剖面 [#profile]

在「輪廓線」圖層上，以 <Command id="PLINE" />（聚合線）指令從 `10,0` 畫一條封閉聚合線，之後每一點都是與上一點的相對距離：`10,0`、`0,10`、`25,0`、`0,-7`、`10,0`、`0,24`、`-10,0`、`0,-7`、`-25,0`、`0,10` 與 `-10,0`，再選擇 <Keyword command="PLINE" id="Close" />。

### 轉動視圖 [#view]

<Command id="-VIEW" /> 指令的 <Keyword command="VIEW" id="SEiso" /> 從東南上方檢視；<Command id="VSCURRENT" />（視覺型式）指令的 <Keyword command="VSCURRENT" id="Conceptual" /> 為各面加上陰影，最能呈現車削件的形狀。

### 迴轉 [#revolve]

<Command id="REVOLVE" />（迴轉）指令：選取剖面並按 Enter，再選擇 <Keyword command="REVOLVE" id="Y" />：Y 軸即為皮帶輪的軸線。按 Enter 接受預設角度，即完整一圈。<Command id="ZOOM" />（縮放）指令的 <Keyword command="ZOOM" id="Extents" /> 將其置於畫面中，比例 `0.8x` 則在四周留出空間。
