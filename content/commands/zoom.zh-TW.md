---
title: "AutoCAD ZOOM（縮放）指令"
metaTitle: "CAD 縮放（ZOOM）用法與快捷鍵 Z"
description: "AutoCAD ZOOM（縮放，Z）的用法：實際範圍、視窗、前次、以 nX 指定比例、物件與全部、滑鼠滾輪，以及在指令中縮放。可以在瀏覽器中免費試用。"
figure: "一塊角落附近有小孔的板：ZOOM 實際範圍，再以視窗框住小孔，使它佈滿視圖。"
sourceHash: "cd72af4956e4"
---

ZOOM 放大或縮小視圖；圖面中沒有任何東西移動或改變大小。其第一個提示接受一個角點（開始視窗）、比例係數或選項。加上單引號輸入 `'ZOOM` 或 `'Z`，可以在其他指令中使用，之後該指令會繼續。滑鼠滾輪以游標為中心放大與縮小，按兩下滾輪按鈕則是 ZOOM 實際範圍。每次 ZOOM 都是一個退回步驟，連續的縮放合為一個步驟，因此 <Command id="U" /> 也會退回視圖。

## Options

### All

將所有繪製的物件放入畫面，與 <Keyword id="Extents" /> 相同。

### Extents

在視窗允許的範圍內，將所有繪製的物件盡可能放大放入畫面。沒有繪製任何物件時，會顯示 <Message id="regeneratingModel" />；在其他指令中輸入時，會拒絕並顯示 <Message id="requiresRegen" />，與 AutoCAD 相同。

### Previous

回到前一個視圖，最多可以回溯 20 個視圖。沒有可回溯的視圖時：<Message id="noPreviousView" />。

### Scale

比例係數：`2X` 放大為目前視圖的兩倍，`0.5X` 縮小為一半，不加 X 的 `2` 則是 ZOOM 全部視圖比例的兩倍。圖紙空間的係數 `nXP` 會當作 `nX` 讀取：此處只有模型空間。在第一個提示輸入係數，不必選擇此選項也有相同效果。

### Window

點選或拖曳兩個角點，將該矩形放入畫面。在第一個提示點選角點也有相同效果。

### Object

將您選取的物件，或在 ZOOM 之前選取的物件放入畫面。

## Missing

即時：在第一個提示按 Enter 會結束 ZOOM，AutoCAD 則會開始以滑鼠縮放；此處由滾輪來做。動態、中心點，以及隱藏的「左」與 Vmax。

## Questions

### AutoCAD 縮放（ZOOM）的快捷鍵是什麼？

`Z`，然後按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可以使用 `_ZOOM`。`Z` 再輸入 `E` 就是 ZOOM 實際範圍。

### CAD 如何縮放到整張圖面？

<Keyword id="Extents" />：輸入 `Z`，按 Enter，輸入 `E`，按 Enter。或按兩下滑鼠滾輪按鈕。

### AutoCAD 的 ZOOM XP 是什麼意思？

`nXP` 將配置視埠縮放到相對於圖紙空間的比例：`1/50XP` 會在圖紙上以 1:50 顯示模型。MellowCAD 沒有配置，因此 `XP` 會當作 `X` 讀取。

### AutoCAD 如何縮放到物件？

選擇 <Keyword id="Object" /> 並選取物件，或先選取物件再執行 ZOOM 物件：視圖會將它放入畫面。

### 如何回到前一個視圖？

<Keyword id="Previous" />，重複使用可以回到更早的視圖，最多 20 個。
