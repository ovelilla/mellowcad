---
title: "AutoCAD SPLINEDIT（編輯雲形線）指令"
metaTitle: "CAD 編輯雲形線（SPLINEDIT）與快捷鍵 SPE"
description: "AutoCAD SPLINEDIT（編輯雲形線，SPE）依提示順序說明：封閉、接合、擬合資料、編輯頂點、轉換為聚合線與反轉。可以在瀏覽器中免費試用。"
figure: "一條通過五個擬合點的雲形線，以 SPLINEDIT 封閉：成為通過所有點的平滑迴圈。"
sourceHash: "bedcaab2fac3"
---

SPLINEDIT 編輯雲形線。在 `Select spline:` 點選一條，或在指令之前選取；按兩下雲形線也會對它執行 SPLINEDIT。其他物件會顯示 <Message id="objectNotSpline" /> 並再次詢問；以 PEDIT 的「雲形線」擬合的聚合線則不作聲地轉換成相同曲線的雲形線。接著它反覆要求選項，每個選項都立即套用，直到選擇 <Keyword id="eXit" /> 或按 Enter。雲形線會顯示其擬合點的掣點；編輯頂點時，則顯示其控制頂點與控制框架。整次編輯是一個步驟，<Command id="U" /> 可以將它退回。在任何提示都可以輸入 `'ZOOM`。

## Options

### Close

平滑地封閉雲形線：擬合雲形線通過其擬合點，CV 雲形線則依其頂點。在封閉的雲形線上，此選項為 <Keyword id="Open" />，且不提供「接合」。

### Join

依 JOIN 對雲形線的規則，接合與其端點相接的開放曲線，並說明接合了幾個。

### Fit data

編輯雲形線通過的點。CV 雲形線沒有擬合點，會先在其曲線上產生擬合點。其選項：<Keyword id="Add" /> 點選一個擬合點並在其後加入新點，可以一再加入（在開放雲形線的第一點上，選擇 <Keyword id="After" /> 或 <Keyword id="Before" />）；<Keyword id="Delete" /> 移除擬合點，最少保留兩個，封閉的雲形線為三個（<Message id="cannotDeleteBeyond" />）；<Keyword id="Move" /> 以 <Keyword id="Next" /> 與 <Keyword id="Previous" /> 逐一切換擬合點，或使用 <Keyword id="Select point" />，再將目前的點移到您指定的點；<Keyword id="Purge" /> 捨棄擬合資料，留下 CV 雲形線；<Keyword id="Tangents" /> 設定起點與終點的切向，或使用 <Keyword id="System default" />；<Keyword id="Close" /> 與 <Keyword id="eXit" /> 與第一個提示相同。點選的不是擬合點時，顯示 <Message id="notAFitPoint" />。

### Edit vertex

編輯控制頂點；擬合雲形線在第一次編輯時失去其擬合資料。<Keyword id="Add" /> 在您於雲形線上點選的位置放置一個頂點；<Keyword id="Delete" /> 移除一個頂點，最少保留兩個，封閉的雲形線為三個；<Keyword id="Elevate order" /> 提升階數，最高到 26，不能降低；<Keyword id="Move" /> 移動頂點，切換方式與「擬合資料」的「移動」相同；<Keyword id="Weight" /> 在顯示 <Message id="splineMadeRational" /> 之後設定頂點的權值，使曲線更靠近或更遠離該頂點。點選的不是頂點時，顯示 <Message id="notAControlVertex" />。

### convert to Polyline

要求 0 到 99 的精確度，預設值為 10，並以直線段組成的聚合線取代雲形線，精確度越高線段越多；雲形線不平行於 XY 平面時，則產生 3D 聚合線。此選項會結束指令。精確度在此階段作業中保留，PEDIT 的轉換也會使用。

### Reverse

反轉雲形線，第一點變成最後一點：<Message id="splineReversed" />。

### Undo

退回上一個選項，「擬合資料」或「編輯頂點」整個一次退回。沒有可退回的選項時：<Message id="commandCompletelyUndone" />。

### eXit

結束指令，與按 Enter 相同。

## Missing

「扭折」（在擬合點或頂點放置尖角）；「公差」（在公差範圍內重新擬合雲形線）；封閉雲形線的「切向」。「轉換為聚合線」對擬合雲形線產生的頂點遠多於 AutoCAD，從不產生弧，而且一律取代雲形線。`Select spline:` 的「群組」。逐一切換點時，AutoCAD 在目前的點上繪製的 `+`。

## Questions

### AutoCAD 編輯雲形線（SPLINEDIT）的快捷鍵是什麼？

`SPE`，然後按 Enter 或空白鍵。也可以輸入完整名稱，在任何語言版本的 AutoCAD 中都可以使用 `_SPLINEDIT`。按兩下雲形線也會執行它。

### 如何將雲形線轉換成聚合線？

執行 SPLINEDIT，點選雲形線，選擇 <Keyword id="convert to Polyline" />；精確度 10 即可得到平滑的聚合線。對雲形線執行 <Command id="PEDIT" />，也會提議將它轉換。

### 如何在雲形線上加入或移動點？

選擇 <Keyword id="Fit data" /> 處理雲形線通過的點，再選擇 <Keyword id="Add" /> 或 <Keyword id="Move" />。選擇 <Keyword id="Edit vertex" /> 則處理框住雲形線的控制頂點。

### 如何封閉雲形線？

選擇 <Keyword id="Close" />：雲形線平滑地封閉，接合處沒有尖角。<Keyword id="Open" /> 可以再次將它開放。

### 如何接合兩條雲形線？

選擇 <Keyword id="Join" />，再選取端點與此雲形線相接的雲形線，或使用 <Command id="JOIN" />。
