---
title: "AutoCAD SPHERE（圓球）指令"
metaTitle: "CAD 圓球（SPHERE）：繪製 3D 球體與選項"
description: "AutoCAD SPHERE（圓球）依提示順序繪製 3D 實體圓球：中心點與半徑、直徑、三點、兩點、相切、相切、半徑，以及為何顯示為線條。可以在瀏覽器中免費試用。"
figure: "從中心點繪製半徑 25 的圓球，從東南方以「概念」視覺型式檢視。"
sourceHash: "b0a92ceaf418"
---

SPHERE 繪製 3D 實體圓球：指定中心點，再指定半徑。以滑鼠點選的半徑在通過中心點的平面上讀取；上次的半徑會作為預設值提供，按 Enter 即可使用，此預設值與 <Command id="CYLINDER" />、<Command id="CONE" /> 及其他基本型實體共用。圓球位於目前的圖層，退回可以一次將它退回。

在「2D 線架構」與「隱藏」中，圓球以線條繪製：經線與緯線，數量由 `ISOLINES` 決定，除了中心點之外，沒有其他點可以鎖點。<Command id="LIST" /> 顯示其位置與半徑，「性質」選項板可以輸入半徑或直徑。其掣點可以移動圓球，赤道上的四個四分點掣點則可以設定半徑。它是 3D 實體，可以用於 <Command id="UNION" />、<Command id="SUBTRACT" /> 及 MellowCAD 的其他 3D 指令；MellowCAD 的 3D 只有實體，而且仍不完整。

## Options

### 3P

在中心點提示：要求三點，圓球以通過這三點的圓為中心與半徑。

### 2P

在中心點提示：要求直徑的兩個端點，可以位於空間中任何位置。

### Ttr

在中心點提示：在相切點鎖點下點選兩條線、圓或弧，再指定半徑：中心點位於與兩者相切、該半徑的圓上，高度與它們相同。

### Diameter

在半徑提示：改為要求直徑，預設值為上次半徑的兩倍。

## Missing

圓球的 <Command id="EXPLODE" />：AutoCAD 會將它轉換成曲面，MellowCAD 沒有曲面，因此會說明無法分解。從熱掣點進行的移動、旋轉、比例與鏡射，以及其專屬的 3D 指令（3DROTATE、3DSCALE）：<Command id="3DMOVE" /> 可以移動圓球。AutoCAD 的 `DISPSILH` 所繪製的輪廓線。<Command id="VSCURRENT" /> 除了「2D 線架構」、「隱藏」與「概念」之外所缺少的視覺型式。

## Questions

### AutoCAD 如何畫圓球？

執行 SPHERE，指定中心點，再指定半徑：`0,0,0` 與 `25` 即可繪製範例中的圓球。若要看到球形，請轉動視圖：按一下 ViewCube 的角，或使用 <Command id="-VIEW" /> 與 <Keyword command="VIEW" id="SEiso" />。

### 為什麼圓球看起來像一個有線條的圓？

「2D 線架構」與「隱藏」以經線與緯線繪製圓球；在平面視圖中，它們就是一個圓與穿過它的線條。<Command id="VSCURRENT" /> 搭配 <Keyword command="VSCURRENT" id="Conceptual" /> 可以為它描影，`ISOLINES` 則設定顯示的線條數。

### 如何畫半球？

先繪製圓球，再以 <Command id="SLICE" /> 從中心點切開：指定平面上的三點，或使用 <Keyword command="SLICE" id="XY" /> 與中心點，然後指定要保留的一側。

### 如何以直徑繪製圓球？

在半徑提示選擇 <Keyword id="Diameter" />，再輸入直徑。使用 <Keyword id="2P" /> 指定直徑的兩個端點，也可以放置圓球。
