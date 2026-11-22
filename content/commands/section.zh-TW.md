---
title: "AutoCAD SECTION（剖面）指令"
metaTitle: "CAD 剖面指令（SECTION）：3D 實體的斷面"
description: "AutoCAD SECTION（剖面，SEC）依提示逐步說明如何在平面切過 3D 實體處建立面域：三點、物件、Z軸、視圖、XY、YZ、ZX。可免費線上試用。"
figure: "一個有貫穿孔的方塊，以通過孔中心的 ZX 平面切割：SECTION 建立斷面輪廓，移到前方，為兩個矩形，中間是孔的間隙。"
sourceHash: "f1c01b76c810"
---

SECTION（剖面）指令建立 3D 實體的斷面：在平面切過每個實體處建立一個面域，實體本身保持不變。它會詢問實體，直到按 Enter：如同 AutoCAD 2027，在指令前選取的選集會被捨棄並重新詢問，不是實體的物件會被略過，選集中沒有實體時會顯示 <Message id="noSolidsSelected" />。接著詢問平面：預設為指定平面上的三點，其他選項則以其他方式指定平面，與 <Command id="SLICE" /> 相同。

平面切過的每個實體都會得到一個位於該平面上的面域：有貫穿孔的方塊會得到含孔間隙的輪廓，沿軸切割的圓柱會得到一個矩形。位於實體某個面上的平面會得到該面。平面未切到的實體會顯示 <Message id="sectionMissedOne" />。面域使用目前的圖層和性質，而不是實體的；<Command id="MOVE" /> 可將面域移出以便檢視，<Command id="AREA" /> 和 <Command id="MASSPROP" /> 可以測量它，<Command id="EXTRUDE" /> 可將它轉成實體。整個指令為一個退回步驟。MellowCAD 的 3D 目前只有實體，且仍屬部分功能。

## Options

### Object

使用點選物件的平面：圓、橢圓、弧、2D 雲形線或 2D 聚合線。

### Zaxis

詢問平面上的一點，再詢問其 Z 軸（與平面垂直的線）上的一點。

### View

與螢幕平行、通過指定點的平面。

### XY

UCS 的 XY 平面，通過指定的點：指定某個高度的點，即可在該處建立水平斷面。按 Enter 則使用 UCS 的原點。

### YZ

UCS 的 YZ 平面，通過指定的點；按 Enter 則使用 UCS 的原點。

### ZX

UCS 的 ZX 平面，通過指定的點；按 Enter 則使用 UCS 的原點。範例中的斷面就是通過孔中心的這個平面。

### 3points

平面上的三點，平面因此可以朝任何方向傾斜。這是第一個提示的預設值，因此在該處指定的點就是三點中的第一點。

## Missing

曲面和網面，MellowCAD 沒有這些物件。以平面的 3D 聚合線作為平面的物件，AutoCAD 可以接受。MellowCAD 尚無精確形式的切割，與 <Command id="SLICE" /> 相同，會顯示有一個布林運算失敗。SECTIONPLANE 和即時剖面，AutoCAD 的功能區以它們取代 SECTION：在此 SECTION 需以輸入方式執行。

## Questions

### AutoCAD 如何建立 3D 實體的剖面？

執行 SECTION，選取實體並按 Enter，再指定平面：<Keyword id="ZX" /> 加上通過中間的一點，會從前到後切開它；<Keyword id="XY" /> 加上某個高度的一點，會水平切開它。面域位於實體內部：以 <Command id="MOVE" /> 將它移出即可看到。

### SECTION 和 SLICE 有什麼不同？

<Command id="SLICE" /> 將實體切成兩部分，保留其中一部分或兩者。SECTION 讓實體保持完整，在平面切過處繪製一個面域。

### CAD 剖面的快捷鍵是什麼？

輸入 `SEC`，再按 Enter 或空白鍵。

### 為什麼 SECTION 顯示平面與實體不相交？

平面沒有切到實體：請檢查指定平面的方式。<Keyword id="XY" />、<Keyword id="YZ" /> 和 <Keyword id="ZX" /> 是 UCS 的平面，因此點的高度或位置錯誤時，平面會落在實體之外。
