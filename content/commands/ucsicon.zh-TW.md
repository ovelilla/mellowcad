---
title: "AutoCAD UCSICON（UCS 圖示）指令"
metaTitle: "CAD UCS 圖示（UCSICON）：打開、關閉與原點"
description: "AutoCAD UCSICON（UCS 圖示）如何顯示或隱藏 UCS 圖示，並將它放在原點或角落：打開、關閉、無原點、原點，以及圖示顯示的內容。可以在瀏覽器中免費試用。"
figure: "UCSICON 的「無原點」將圖示移到角落；UCS 將原點移到塊體的階梯上，再以「原點」在該處繪製圖示，X 為紅色、Y 為綠色、Z 為藍色。"
sourceHash: "c431e70eda01"
---

UCSICON 顯示或隱藏 UCS 圖示（顯示目前 UCS 的位置與方向的 X、Y 臂），並說明它的位置：位於 UCS 的原點，或圖面的左下角。它唯一的提示以目前的狀態作為預設值，因此按 Enter 會保持不變。此設定儲存在圖面中，每次 UCSICON 都是一個退回步驟。

此圖示是 AutoCAD 2027 的 3D 圖示：X 與 Y 各一支臂，各臂末端有字母，UCS 為世界座標系統時，原點處有一個方形。不在平面視圖時，Z 臂顯示 UCS 的 Z 方向，從正前方看去的臂則不繪製。在「2D 線架構」中圖示為白色；在「隱藏」與「概念」中，X 為紅色、Y 為綠色、Z 為藍色。加上單引號輸入 `'UCSICON`，即使在其他指令執行中，也會改為設定 UCSICON 變數：0 到 3，其中 1 顯示圖示，2 將它放在原點。

## Options

### ON

顯示圖示。

### OFF

隱藏圖示。UCS 仍然存在，繪製的物件仍位於其中。

### Noorigin

無論原點在哪裡，都將圖示保持在圖面的左下角。

### ORigin

在 UCS 的原點繪製圖示，這是預設值。原點位於螢幕外，或太靠近螢幕邊緣而放不下圖示時，圖示會移到左下角，直到原點回到視圖中。

## Missing

「全部」：在 AutoCAD 中將設定套用到每個視埠（此處只有一個）；「可選取」：圖示的掣點；以及「性質」：「UCS 圖示」對話方塊，包含 2D 型式、大小、線寬與顏色。

## Questions

### CAD 如何關閉 UCS 圖示？

輸入 `UCSICON`，按 Enter，再選擇 <Keyword id="OFF" />。<Keyword id="ON" /> 可以讓它重新顯示。

### 如何將 UCS 圖示移到原點？

UCSICON，再選擇 <Keyword id="ORigin" />：圖示就位於 UCS 的原點。若它仍停在角落，表示原點位於螢幕外或太靠近邊緣：請平移或縮小。<Keyword id="Noorigin" /> 會讓它保持在角落。

### UCS 圖示上的方形代表什麼？

代表 UCS 為世界座標系統。以 <Command id="UCS" /> 移動或旋轉 UCS 後，方形就會消失；<Command id="UCS" /> 加上 Enter 回到世界座標，方形也隨之出現。

### 如何變更 UCS 圖示的型式、大小或顏色？

在 AutoCAD 中，使用 UCSICON 的「性質」，也就是「UCS 圖示」對話方塊。MellowCAD 尚未提供：圖示以 AutoCAD 2027 的預設方式繪製，也就是 3D 型式。
