---
title: "AutoCAD CHAMFEREDGE（倒角邊）指令"
metaTitle: "CAD 倒角邊（CHAMFEREDGE）：3D 實體邊倒角"
description: "AutoCAD 倒角邊（CHAMFEREDGE）依提示逐步說明如何將 3D 實體的邊倒角：一個面的邊、迴路、距離 1 與距離 2。可在瀏覽器中免費試用。"
figure: "從東南方檢視的方塊：兩個距離都為 6 的 CHAMFEREDGE 將其前方角點的兩條頂邊倒角，兩者交於一條線。"
sourceHash: "43b1908ad4b3"
---

CHAMFEREDGE（倒角邊）指令將 3D 實體的邊倒角。它會顯示目前的兩個距離，然後要求選取邊，選取第一條之後，再要求同一個面上的其他邊，直到按 Enter：按一下會選取游標下的邊，輸入的點則選取通過該點的邊。與前面各邊沒有共用面的邊會顯示 <Message id="edgesOneFace" />，屬於其他實體的邊則顯示 <Message id="chamferMultipleBodies" />。每選取一條邊，實體就會以完成後的樣子顯示。接著按 Enter 會要求再按一次 Enter 接受，或變更此倒角的距離；該次 Enter 即建立倒角。

第一個距離沿著各邊共用的面量取；若只有一條邊，則沿 AutoCAD 所採用的面：方塊前方頂邊為前面，圓柱的邊緣則為頂面。兩個平面之間的直線邊會變成一條平面帶，孔或邊緣的圓形邊會變成一段圓錐面帶，在角點相接的倒角會接合於一條線。下次會再次提供這些距離。實體保留其圖層與性質，但不再保有其建立方式：方塊不再是方塊。整個指令是一個退回步驟。MellowCAD 的 3D 只有實體，且仍不完整。

## Options

### Loop

選取一個面周圍的所有邊：點選一條邊，然後選擇 <Keyword id="Accept" /> 接受所顯示的迴路，或選擇 <Keyword id="Next" />，改為該邊所屬另一個面的迴路。<Keyword id="Edge" /> 會回到逐一選取邊。

### Distance

要求第一個距離，再要求第二個距離，每個都可輸入，或以兩點之間的距離指定；0 或更小的值會顯示 <Message id="distanceTooSmall" />。<Keyword id="Expression" /> 以公式指定距離。在接受提示中，它會要求基準曲面的距離與另一個曲面的距離，僅用於此倒角。

## Missing

三條倒角邊相交的角點。與曲面相鄰的直線邊、不在其圓柱軸上的圓形邊，以及圓球、圓環、擠出或迴轉實體的任何邊：此處會以塑型錯誤失敗。AutoCAD 在接受提示中顯示的兩個箭頭掣點，每個距離一個。以 <Command id="CHAMFER" /> 點選實體的邊，AutoCAD 也允許此做法。點選時以網格顯示倒角，以及曲面。

## Questions

### AutoCAD 如何將 3D 實體的邊倒角？

執行 CHAMFEREDGE，選擇 <Keyword id="Distance" /> 並指定兩個距離，點選一個面的各邊，然後按兩次 Enter：一次結束點選，一次接受。範例中的 `6` 與 `6` 將方塊的兩條頂邊倒角。

### 為什麼 CHAMFEREDGE 說各邊必須屬於同一個面？

同一個倒角的各邊共用一個面：第一個距離沿著它量取。其他面的邊請在第二次執行時倒角。

### 為什麼 CHAMFER 對 3D 實體沒有作用？

AutoCAD 的 <Command id="CHAMFER" /> 也可將實體的邊倒角，但 MellowCAD 的目前還不行：請使用 CHAMFEREDGE，若要將邊倒圓角，則使用 <Command id="FILLETEDGE" />。

### 如何將孔的邊倒角？

在孔與平面相接處點選其圓形邊：倒角會是環繞孔的一段圓錐面帶。
