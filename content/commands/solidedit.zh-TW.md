---
title: "AutoCAD SOLIDEDIT（實體編輯）指令"
metaTitle: "CAD 實體編輯（SOLIDEDIT）：編輯 3D 實體的面"
description: "AutoCAD SOLIDEDIT（實體編輯）依提示順序編輯 3D 實體的面：擠出、移動、旋轉、偏移、錐形、刪除與複製。可以在瀏覽器中免費試用。"
figure: "以 SOLIDEDIT 將方塊的頂面向上擠出 15、推拔角度 15 度：方塊上多了一個截頭角錐，從東南方檢視。"
sourceHash: "775cdc271d4f"
---

SOLIDEDIT 以面為單位編輯 3D 實體。它先說明每次編輯是否經過檢查，再詢問要編輯什麼：<Keyword id="Face" />，接著是面的選項，然後是面，最後是該選項需要的值。每次編輯都立即完成，並再次詢問面的選項，因此一次執行可以進行多次編輯；<Keyword id="eXit" /> 或按 Enter 會離開面的選項，再離開指令。相鄰的面會跟著變化：將方塊的頂面上移，側面會延長與它相接。

實體保留其圖層與性質，但失去其建立方式：方塊不再是方塊。整次執行是一個退回步驟，其中的 <Keyword id="Undo" /> 則可以逐一退回各次編輯。在 `Command:` 提示按 Enter 會從第一個問題重新執行。「實體編輯」面板的面按鈕可以直接執行各個面的選項。MellowCAD 的 3D 只有實體，而且仍不完整。

## Options

### Face

面的選項。各選項都會要求選取面，直到按 Enter：按一下或輸入一點，會選取該處最靠近您的面，或該處一條邊的兩個面；選取已選過的面，會改選其後方的面。選取面之後，<Keyword id="ALL" /> 會選取該實體的所有面；<Keyword id="Remove" /> 改為將面從選集中移除，<Keyword id="Undo" /> 則退回上一次點選。點選空白處會顯示 <Message id="noSolidsDetected" />。只能選取同一個實體的面。

### Extrude

要求高度與推拔角度：每個面長成一個角柱，加到實體上；高度為負值時則從實體中挖除。角度為正值時，角柱隨高度向內收窄。在高度提示按 Enter，會使用基本型實體或 <Command id="EXTRUDE" /> 上次使用的高度。

### Move

要求基準點與第二點：平面沿其法線移動兩點連線在法線方向上的距離，相鄰的面一起跟著移動。在第二點提示按 Enter，會以基準點作為位移。

### Rotate

要求一個軸：以兩點指定，或沿 UCS 的 <Keyword id="Xaxis" />、<Keyword id="Yaxis" />、<Keyword id="Zaxis" />，或以 <Keyword id="View" /> 垂直於螢幕；然後要求角度：面依右手定則繞該軸旋轉。

### Offset

要求距離：面沿其法線向外移動，距離為負值時向內移動，相鄰的面一起跟著移動，曲面則繞其軸偏移。向內偏移達到包圍實體之方塊最長邊的一半時會被拒絕，並說明最多可以偏移多少。

### Taper

要求基準點、沿推拔軸的一點與角度：面以其與通過基準點之平面的交線為軸傾斜，角度為正值時沿軸向內傾斜。

### Delete

移除孔的內壁，將孔填滿；或移除圓角、倒角的面帶，恢復其原本取代的邊。

### Copy

將每個平面複製成面域，位於原處或依兩點移動，放在目前的圖層並使用目前的性質。

### Undo

在面的選項中，退回此次執行的上一次編輯；沒有可退回的編輯時，顯示 <Message id="commandCompletelyUndone" />。

### eXit

離開面的選項，回到第一個問題；在第一個問題中則離開指令。按 Enter 效果相同。

## Missing

<Keyword id="Edge" /> 與 <Keyword id="Body" />，以及面的 <Keyword id="coLor" /> 與 <Keyword id="mAterial" />：會列出但會拒絕；「擠出」的 <Keyword id="Path" />、「旋轉」的「以物件定軸」及其 <Keyword id="Reference" /> 角度亦同。以框選、籬選與多邊形框選選取面。移動、旋轉、推拔或複製曲面，偏移與其他相鄰面相接的曲面，刪除不是孔壁或面帶的面，以及使實體形狀大幅改變、導致某個面將另一個面吃掉的編輯。在以推拔角度擠出的面旁邊進行的編輯。向外偏移過遠而無法建立的情況：AutoCAD 會不作聲地放棄，MellowCAD 則照樣建立。指定距離或角度時的預覽。

## Questions

### AutoCAD 如何編輯 3D 實體？

執行 SOLIDEDIT，選擇 <Keyword id="Face" />，再選擇要做的事：以 <Keyword id="Extrude" /> 或 <Keyword id="Move" /> 移動面讓實體變高，以 <Keyword id="Delete" /> 填補孔，以 <Keyword id="Taper" /> 使側面傾斜。選取面，按 Enter，再回答該選項的提示。若只要快速推或拉，<Command id="PRESSPULL" /> 也可以拖曳面。

### 如何擠出 3D 實體的面？

SOLIDEDIT、<Keyword id="Face" />、<Keyword id="Extrude" />，選取面並按 Enter，再指定高度與推拔角度：範例中的 `15` 與 `15` 會在方塊頂面上長出一個截頭角錐。

### 如何移除實體上的孔？

SOLIDEDIT、<Keyword id="Face" />、<Keyword id="Delete" />，選取孔的內壁並按 Enter：孔即被填滿。同樣的方式也可以移除圓角或倒角。

### SOLIDEDIT 與 PRESSPULL 有什麼不同？

<Command id="PRESSPULL" /> 以拖曳或距離，沿面的垂直方向移動一個面。SOLIDEDIT 除此之外還能推拔、旋轉、偏移、刪除與複製面，而且可以一次處理多個面。
