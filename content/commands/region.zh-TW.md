---
title: "AutoCAD REGION（面域）指令"
metaTitle: "CAD 面域指令（REGION）用法與快捷鍵 REG"
description: "AutoCAD REGION（面域，REG）如何將封閉的形狀轉成面域、它會找到哪些迴路、為什麼沒有建立面域，以及面域的用途。可在瀏覽器中免費試用。"
figure: "四條首尾相接封閉的線，以及其中的一個圓：執行 REGION，以窗選框住兩者，建立兩個面域並刪除原物件。"
sourceHash: "69a5423c3d5c"
---

REGION（面域）指令將封閉的形狀轉成面域：沒有厚度的平坦區域，每個都由其迴路圍成。選取物件並按 Enter；它們構成的每個迴路都會成為一個面域。封閉的物件本身就是一個迴路：圓、橢圓、封閉的聚合線或雲形線。開放的物件——線、弧、橢圓弧、開放的聚合線和雲形線——會首尾相接串連，絕不在交叉處串連；無法封閉的串連會被捨棄。接著指令行會顯示找到的迴路數、被拒絕的迴路數及其原因，以及建立的面域數；未選取任何物件就按 Enter 時，會顯示 <Message id="regionNoneFound" />。

構成面域的物件會被刪除，其他物件保留；面域使用目前的圖層和性質，而不是原物件的。位於另一個迴路內的迴路會成為獨立的面域，而不是其中的孔：<Command id="SUBTRACT" /> 可以將一個從另一個中減去。面域以其邊顯示，鎖點也落在邊上；「性質」選項板顯示其面積和周長，<Command id="AREA" />、<Command id="LIST" /> 和 <Command id="MASSPROP" /> 也能測量。<Command id="UNION" />、<Command id="SUBTRACT" /> 和 <Command id="INTERSECT" /> 可以合併同一平面上的面域，<Command id="EXTRUDE" />、<Command id="REVOLVE" /> 和 <Command id="PRESSPULL" /> 可以將面域轉成 3D 實體，<Command id="EXPLODE" /> 則會還原其線、弧和圓。整個指令為一個退回步驟。

## Missing

AutoCAD 的 `DELOBJ`：在此構成面域的物件一律會被刪除。BOUNDARY，它可以從一點周圍的區域建立面域，以及從填充線的邊界建立面域。以掣點編輯面域：掣點會顯示，但拖曳不會改變任何內容。在快速模式下，以其邊作為 <Command id="TRIM" /> 和 <Command id="EXTEND" /> 的切割邊或邊界邊，以及對具有橢圓或雲形線邊的面域使用 <Command id="HATCH" />。面域與曲面的組合（MellowCAD 沒有曲面），以及「性質」選項板中的「材料」列。

## Questions

### AutoCAD 的 REGION 指令如何使用？

執行 REGION（或 `REG`），選取封閉的形狀，或首尾相接構成封閉形狀的線，再按 Enter。範例中以窗選框住四條線和一個圓，會建立兩個面域，指令行顯示擷取了兩個迴路並建立了兩個面域。

### 為什麼 REGION 沒有建立面域？

形狀沒有首尾相接地封閉。交叉的線或彼此未接觸的線都無法封閉：REGION 只依端點串連開放的物件，即使只差一點點，串連也會被捨棄。自身相交的迴路（例如蝴蝶結形）會被拒絕，計入自身相交的項目。請以半徑 0 的 <Command id="FILLET" /> 接合端點，或以 <Command id="TRIM" /> 修剪超出的部分，然後再試一次。

### 如何建立有孔的面域？

為外形和孔各建立一個面域，再執行 <Command id="SUBTRACT" />：點選外形，按 Enter，點選孔，按 Enter。結果是一個面域，<Command id="EXTRUDE" /> 可以將它轉成一個貫穿孔的實體。

### 如何查詢面域的面積？

選取面域，在「性質」選項板中讀取「面積」；或執行 <Command id="AREA" />，選擇 <Keyword command="AREA" id="Object" /> 並點選面域。<Command id="MASSPROP" /> 還會顯示周長、形心和慣性矩。
