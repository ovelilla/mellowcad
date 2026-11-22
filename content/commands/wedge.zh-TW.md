---
title: "AutoCAD WEDGE（楔形塊）指令"
metaTitle: "CAD 楔形塊（WEDGE）用法與快捷鍵 WE"
description: "AutoCAD WEDGE（楔形塊，WE）依提示順序繪製 3D 實體楔形塊：兩個角點與高度、中心點、立方塊、長度與兩點。可以在瀏覽器中免費試用。"
figure: "60 × 40 × 25 的楔形塊，由兩個角點與高度繪製，斜面從第一個角點那一端向下傾斜，從東南方以「隱藏」視覺型式檢視。"
sourceHash: "06fba2eeb7be"
---

WEDGE 繪製 3D 實體楔形塊：頂面從一端向另一端傾斜的方塊。它的詢問與 <Command id="BOX" /> 相同：第一個角點、另一個角點，然後是高度。較高的一端位於第一個角點，斜面沿 UCS 的 X 向另一個角點那一側下降；另一個角點的 X 較小時，方向會反過來。高度沿 UCS 的 Z 升起，負值則向下。長度、寬度與高度使用 <Command id="BOX" /> 的預設值，按 Enter 即可使用。楔形塊位於目前的圖層，退回可以一次將它退回。

<Command id="LIST" /> 顯示其位置、長度、寬度、高度與旋轉，「性質」選項板可以輸入這些值。其掣點與 <Command id="BOX" /> 的相同。它是 3D 實體，可以用於 <Command id="UNION" />、<Command id="SUBTRACT" /> 及 MellowCAD 的其他 3D 指令；MellowCAD 的 3D 只有實體，而且仍不完整。<Command id="EXPLODE" /> 會將它的每個面變成一個面域。

## Options

### Center

在第一個提示：要求中心點，再要求一個角點、<Keyword id="Cube" /> 或 <Keyword id="Length" />。楔形塊以該點為中心（高度方向也是），較高的一端位於所指定角點的對側。

### Cube

在另一個角點提示：要求長度，並建立每一邊都等於該長度的楔形塊。與 <Command id="BOX" /> 的不同，它沿 UCS 的 X 延伸，負值時向後延伸。

### Length

在另一個角點提示：要求長度（沿 UCS 的 X），再要求寬度（沿其 Y）；負值則向後延伸。以點指定時只取其距離，不取其方向。

### 2Point

在高度提示：要求兩點，高度即為兩點間的距離。

## Missing

與 <Command id="BOX" /> 相同的部分：從熱掣點進行的移動、旋轉、比例與鏡射，其專屬的 3D 指令，指定角點時的虛線標註，以及 <Command id="VSCURRENT" /> 所缺少的視覺型式。在平面視圖中，較高一端下方的端點鎖點會找到頂面的角點，AutoCAD 則會找到底面的角點。

## Questions

### AutoCAD 楔形塊（WEDGE）的快捷鍵是什麼？

`WE`。輸入後按 Enter 或空白鍵，再指定第一個角點、另一個角點與高度：`0,0`、`60,40` 與 `25` 即可繪製範例中的楔形塊。

### 楔形塊朝哪個方向傾斜？

從第一個角點那一端沿 UCS 的 X 向下傾斜。若要改變方向，請將另一個角點指定在 X 較小的位置，使它轉 180°，或在繪製後以 <Command id="ROTATE" /> 旋轉。

### 如何繪製三角柱？

楔形塊就是三角柱：兩端各是一個直角三角形，沿寬度方向延伸。若是其他三角形，請以 <Command id="PLINE" /> 繪製封閉的三角形，再以 <Command id="EXTRUDE" /> 擠出。

### 如何從中心點繪製楔形塊？

選擇 <Keyword id="Center" /> 並指定中心點，再指定一個角點、<Keyword id="Cube" /> 或 <Keyword id="Length" />：楔形塊以該點為中心，高度方向也是。
