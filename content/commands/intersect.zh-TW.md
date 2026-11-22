---
title: "AutoCAD INTERSECT（交集）指令"
metaTitle: "CAD 交集指令（INTERSECT）用法與快捷鍵 IN"
description: "AutoCAD 交集指令 INTERSECT（IN）的用法：兩個以上的 3D 實體，或同一平面上的面域，只保留全部共有的部分，其餘刪除。可免費線上試用。"
figure: "方塊與和它重疊的圓球取交集：兩者共有的部分是有六個平面的球體，從東南方檢視。"
sourceHash: "c8ea61c0525d"
---

INTERSECT（交集）指令只保留兩個以上 3D 實體，或同一平面上兩個以上面域的共有部分，並刪除其餘部分：方塊與和它重疊的圓球會留下一個有平面的球體。指令會要求選取物件，直到按 Enter，與 <Command id="UNION" /> 相同，並略過既非實體也非面域的物件。與 AutoCAD 2027 一樣，在指令之前選取的選集會被取消，並再次要求選取。實體與面域分開計算，面域則逐一平面計算。

最先點選的物件成為結果，保留其圖層與顏色，其他物件則刪除；以窗選、框選或 ALL 選取時，則是其中最新的物件。結果是複合實體，不再是方塊或圓球，也沒有歷程。物件沒有共有部分時，會顯示 <Message id="nullSolid" /> 或 <Message id="nullRegion" />，並將其全部刪除，與 AutoCAD 相同。整個指令是一個退回步驟。MellowCAD 的 3D 仍不完整：有實體，但沒有曲面與網面。

## Missing

曲面，此處不存在。以 MellowCAD 目前還沒有精確形式的曲線相交的曲面：軸既不重合也不平行的圓柱、圓錐、圓球或圓環（兩個圓柱也可能交叉）；圓錐與平面或其軸上的實體以外的任何物件；圓環或迴轉實體與既不垂直於其軸、也不通過其軸的平面，或與偏離其軸的實體；擠出實體與平面或沿其擠出方向擠出的面以外的任何物件。這些情況會被拒絕，並顯示布林運算失敗的訊息，實體保持原狀；以相切方式與邊相交的切割、幾乎但並非完全位於同一曲面上的面，以及切割與邊之間非常薄的薄片，也是如此。沿方塊的面放置的圓柱會聯集為正確的體積，但比 AutoCAD 的結果少一條邊與一個面。不保留實體歷程（SOLIDHIST、SHOWHISTORY），以籬選或前一個選取時保留哪個物件，尚未驗證。

## Questions

### AutoCAD 交集指令的快捷鍵是什麼？

輸入 `IN`，再按 Enter 或空白鍵。輸入完整名稱也可以，而 `_INTERSECT` 在任何語言版本的 AutoCAD 中都適用。

### UNION、SUBTRACT 與 INTERSECT 有什麼不同？

三者都將 3D 實體，或同一平面上的面域，建立為一個物件。<Command id="UNION" /> 保留任一物件涵蓋的全部範圍，<Command id="SUBTRACT" /> 保留第一組減去第二組後的部分，INTERSECT 則只保留全部共有的部分。三者各為一個退回步驟，並刪除所用掉的物件。

### 如何在 AutoCAD 中讓線相交？

不能用 INTERSECT，它只處理實體與面域，並略過線。若要找出兩條線的交叉處，請以「交點」物件鎖點鎖定；若要使兩條線相接，請使用半徑為 0 的 <Command id="FILLET" />、<Command id="TRIM" /> 或 <Command id="EXTEND" />。

### 為什麼 INTERSECT 會刪除我的物件？

因為物件沒有共有部分：沒有共有部分時會顯示 <Message id="nullSolid" />，面域則顯示 <Message id="nullRegion" />，並將物件刪除，與 AutoCAD 相同。<Command id="U" /> 可以將其復原。一個實體與一個面域，或位於不同平面上的兩個面域，則完全不會取交集：會顯示 <Message id="booleanNeedsTwo" />，不做任何變更。
