---
title: "AutoCAD 3DORBIT（3D 環轉）指令"
metaTitle: "CAD 3D 環轉（3DORBIT）用法與快捷鍵 3DO"
description: "AutoCAD 3D 環轉（3DORBIT、3DO、ORBIT）：拖曳旋轉視圖、結束的方法、以 Shift 加滾輪環轉，以及回到平面視圖。可在瀏覽器中免費試用。"
figure: "一個先以平面視圖檢視的方塊：3DORBIT 向旁邊與向下拖曳，再按 Enter，方塊便從其前方角點的上方檢視。"
sourceHash: "66fc1859c8fd"
---

3DORBIT（3D 環轉）指令會隨著拖曳繞著圖面旋轉視圖；圖面中沒有任何物件移動或改變。橫向拖曳會讓相機繞世界的 Z 軸旋轉，上下拖曳則將其升高或降低，旋轉中心是螢幕中央下方的圖面中間，採用平行投影。指令開始時會說明如何結束：執行期間只能環轉，按 Enter 或 Esc 即可結束，無論是否已拖曳。

按住 Shift 與滾輪按鈕，可從任何地方環轉，即使在其他指令中亦可；導覽列上的「環轉」按鈕也會執行它。加上單引號輸入 `'3DORBIT`，可在其他指令中使用，結束後該指令會繼續。每次拖曳都是 <Command id="ZOOM" /> 的 <Keyword command="ZOOM" id="Previous" /> 的一步，整個執行過程是一個退回步驟，因此 <Command id="U" /> 會將視圖還原。若要將實體顯示為實體而非線架構，請使用 <Command id="VSCURRENT" />；MellowCAD 的 3D 只有實體，且仍不完整。

## Missing

右鍵功能表，及其中的投影、視覺型式與其他導覽模式。只繞著選取的物件環轉。透視。3DFORBIT、3DCORBIT 與 AutoCAD 其餘的 3D 導覽。

## Questions

### AutoCAD 3D 環轉的快捷鍵是什麼？

`3DO` 或 `ORBIT`，再按 Enter 或空白鍵。不輸入任何內容時，按住 Shift 與滾輪按鈕並拖曳即可。

### 如何用滑鼠環轉？

按住 Shift，按下滾輪按鈕並拖曳：橫向拖曳讓模型旋轉，上下拖曳則從較高或較低處檢視。放開後即回到原本的指令中。

### 如何結束 3D 環轉？

按 Enter 或 Esc。視圖會停留在放開時的位置。

### 環轉之後如何回到平面視圖？

執行 <Command id="PLAN" /> 並按 Enter，或執行 <Command id="-VIEW" /> 並選擇 <Keyword command="VIEW" id="Top" />，或按一下 ViewCube 的頂面。<Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> 會一次退回一次拖曳。
