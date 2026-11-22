---
title: "AutoCAD PEDIT（編輯聚合線）指令"
metaTitle: "CAD 編輯聚合線指令（PEDIT）用法與快捷鍵 PE"
description: "AutoCAD PEDIT（編輯聚合線，PE）依提示逐步說明：將線轉成聚合線、接合、寬度、擬合與雲形線、編輯頂點、多重。可在瀏覽器中免費試用。"
figure: "三條首尾相接的線：PEDIT 將第一條轉成聚合線，接合另外兩條，再給予寬度 2。"
sourceHash: "6c9660c15d8a"
---

PEDIT（編輯聚合線）指令編輯聚合線。在 `Select polyline or [Multiple]:` 提示下點選一條聚合線，或在指令前選取；在聚合線上按兩下也會對它執行 PEDIT。若點選的是線、弧或雲形線，會顯示 <Message id="objectNotPolyline" />，並詢問是否將它轉成聚合線，預設為「是」：新的聚合線取代原物件，並沿用其性質。之後會反覆詢問選項，每個選項立即套用，直到按 Enter 結束。3D 聚合線的選項較少，沒有寬度、曲線擬合和線型生成，其雲形線選項為 <Keyword id="Spline curve" />。按 Esc 會保留已完成的編輯；整次編輯為一個步驟，<Command id="U" /> 即可復原。

## Options

### Multiple

一次編輯多條聚合線：選取它們，回答是否將其中的線、弧和雲形線轉換，之後每個選項都套用到全部。其「接合」會詢問連綴距離和 <Keyword id="Jointype" />：<Keyword id="Extend" /> 修剪或延伸端點線段使其相交，<Keyword id="Add" /> 以新線段連接間隙，<Keyword id="Both" /> 能延伸時延伸，不能時加入線段。

### Close

以一條從最後一個頂點到第一個頂點的線段封閉聚合線；最後一段是弧時，封閉的線段也是弧。在封閉的聚合線上，此選項變成 <Keyword id="Open" />，會移除該線段。

### Join

將與聚合線端點首尾相接的線、弧和開放的聚合線加入，並顯示加入了多少線段。封閉的聚合線無法接合：<Message id="cannotJoinClosedPolyline" />。

### Width

為所有線段設定同一個寬度，可以輸入，或以兩點量取；0 表示取消寬度。

### Edit vertex

在第一個頂點上標示一個 X，並詢問要在該處做什麼：<Keyword id="Next" /> 和 <Keyword id="Previous" /> 移動 X；<Keyword id="Move" /> 移動頂點；<Keyword id="Insert" /> 在其後加入一個頂點；<Keyword id="Break" /> 和 <Keyword id="Straighten" /> 會記住該頂點，將 X 移到另一個頂點後，<Keyword id="Go" /> 會在兩者之間切斷聚合線，或將兩者之間的部分變成一條直線段；<Keyword id="Width" /> 設定下一段的起點與終點寬度；<Keyword id="Tangent" /> 為頂點指定方向，供之後的擬合使用；<Keyword id="eXit" /> 返回上一層。

### Fit

以通過每個頂點、在相接處相切的弧，繪製一條平滑曲線，排列方式與 AutoCAD 的曲線擬合相同。頂點保留不變，編輯頂點會改變曲線的形狀。

### Spline

以聚合線擬合一條 B 雲形線，曲線由頂點框定，而不通過頂點：依 SPLINETYPE 為二次或三次，精細程度依 SPLINESEGS。3D 聚合線的此選項為 <Keyword id="Spline curve" />。SPLINE 的「物件」選項可將這種聚合線轉成真正的雲形線。

### Decurve

移除擬合或雲形線曲線：頂點之間再次成為直線段。

### Ltype gen

<Keyword id="ON" /> 沿整條聚合線以連續的圖案配置線型，因此線段很短的虛線聚合線仍會顯示虛線；<Keyword id="OFF" /> 為預設值，在每個頂點重新開始圖案。

### Reverse

反轉聚合線的方向：頂點順序顛倒，弧和寬度也隨之反轉。

### Undo

取消本次執行中的最後一個選項，然後繼續詢問。

## Missing

PEDITACCEPT：點選線、弧或雲形線時，一律先詢問再轉換。PLINECONVERTMODE：雲形線會轉成由直線段組成的聚合線，線段數遠多於 AutoCAD，且從不轉成弧。擬合後的聚合線在「性質」選項板中顯示為一般聚合線，沒有 AutoCAD 的「2D 聚合線」標題及其「擬合/平滑化」列。選集中只有 3D 聚合線時，「多重」會使用 3D 的提示，AutoCAD 則使用 2D 的提示。<Keyword id="Multiple" /> 不編輯多邊形網面。

## Questions

### CAD 編輯聚合線的快捷鍵是什麼？

輸入 `PE`，再按 Enter 或空白鍵。也可以輸入完整的指令名稱，在任何語言版本的 AutoCAD 中都可以使用 `_PEDIT`。在聚合線上按兩下也會執行它。

### 如何將多條線接合成一條聚合線？

執行 PEDIT，點選其中一條線，按 Enter 將它轉成聚合線，再選擇 <Keyword id="Join" /> 並選取其他線：首尾相接的線會成為一條聚合線。<Command id="JOIN" /> 可以一個步驟完成同樣的事。

### 為什麼 PEDIT 對我的物件沒有作用？

PEDIT 編輯聚合線，並可轉換線、弧和雲形線；其他物件（文字、圓、圖塊）會被拒絕，並再次詢問。鎖住的圖層上的物件會顯示 <Message id="objectOnLockedLayer" />。「接合」只加入端點與聚合線端點完全相接的物件：有間隙時，請使用 <Keyword id="Multiple" /> 和連綴距離。

### 如何變更聚合線的寬度？

選擇 <Keyword id="Width" /> 並輸入寬度：所有線段都會套用。若只改一段，請使用 <Keyword id="Edit vertex" />，將 X 移到該線段起點的頂點，再選擇其 <Keyword id="Width" />。

### 如何讓聚合線變成曲線？

<Keyword id="Fit" /> 以弧通過每個頂點；<Keyword id="Spline" /> 產生由頂點框定、更平滑的曲線。<Keyword id="Decurve" /> 則將它再次變直。
