---
title: "CAD 3D 練習圖：軸承座"
metaTitle: "AutoCAD 3D 建模練習題（進階）：軸承座"
description: "AutoCAD 3D 實體練習：擠出軸承座並聯集，再以圓柱差集出軸孔與兩個螺栓孔，附逐步解說。免費線上練習 3D 實體。"
figure: "軸承座的平面圖，100 × 60，凸轂、軸孔與螺栓孔皆已標註。"
model: "軸承座實體，從東南方以「概念」視覺型式檢視。"
sourceHash: "5579d6bd5a86"
---

建立此軸承座的模型，單位為公釐：底座 100 × 60，四角圓角半徑 10，厚 12；中央立著直徑 40、高 40 的凸轂；直徑 20 的軸孔貫穿凸轂，兩個直徑 10 的螺栓孔貫穿底座，間距 76。底座與凸轂由各自的輪廓擠出，再聯集為一個實體；軸孔與螺栓孔則是從中差集掉的圓柱。

## Steps

### 繪製平面圖 [#plan]

在「輪廓線」圖層上，以 <Command id="RECTANG" />（矩形）指令，<Keyword command="RECTANG" id="Fillet" /> 為 `10`，從 `0,0` 畫到 `100,60`；再於其中心點 `50,30` 畫一個 <Keyword command="CIRCLE" id="Diameter" /> 為 `40` 的圓。

### 擠出底座與凸轂 [#extrude]

以 <Command id="EXTRUDE" />（擠出）指令將輪廓擠出 `12` 高，再將圓擠出 `40` 高：得到兩個實體。

### 聯集 [#union]

<Command id="UNION" />（聯集）指令：選取兩者後按 Enter。兩者成為一個實體。

### 繪製圓柱 [#holes]

以 <Command id="CYLINDER" />（圓柱）指令將軸孔與一個螺栓孔畫成圓柱：軸孔位於 `50,30`，<Keyword command="CYLINDER" id="Diameter" /> `20`，高 `40`；螺栓孔位於 `12,30`，直徑 `10`，高 `12`。再以 <Command id="COPY" />（複製）指令將螺栓孔從 `12,30` 複製到相距 `76,0` 處。

### 差集 [#subtract]

<Command id="SUBTRACT" />（差集）指令：選取塊體並按 Enter，再選取三個圓柱並按 Enter。軸孔與螺栓孔即貫穿實體。

### 轉動視圖 [#view]

使用 <Command id="-VIEW" /> 指令的 <Keyword command="VIEW" id="SEiso" />、<Command id="VSCURRENT" />（視覺型式）指令的 <Keyword command="VSCURRENT" id="Conceptual" />，再以 <Command id="ZOOM" />（縮放）指令的 <Keyword command="ZOOM" id="Extents" /> 與 `0.8x` 將實體置於畫面中。
