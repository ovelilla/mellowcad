---
title: "AutoCAD COPYCLIP（複本截取）指令"
metaTitle: "CAD 複製貼上：COPYCLIP（複本截取）與 Ctrl+C"
description: "AutoCAD 的 COPYCLIP（Ctrl+C）如何搭配 CUTCLIP、COPYBASE 與 PASTECLIP 使用：將物件複製到剪貼簿，再於指定點貼上。可在瀏覽器中免費試用。"
figure: "以 COPYCLIP 複製板件上的孔，再以 PASTECLIP 貼在 65,20：複本以左下角對齊該點，成為第二個孔。"
sourceHash: "f84c995e7c2b"
---

COPYCLIP（複本截取）指令會將選取的物件，連同其使用的圖層、型式與圖塊，複製到剪貼簿；圖面不會變更，在指令之前選取的物件仍保持選取。按 Ctrl+C 即可執行，並會取消正在執行的指令。接著 <Command id="PASTECLIP" />（Ctrl+V）會要求指定插入點：物件跟隨游標移動，並依目前的 UCS 以其範圍的左下角放在該點上，整個貼上為一個步驟，可用 <Command id="U" /> 退回。可以貼到同一個圖面，也可以貼到另一個圖面：剪貼簿是系統的剪貼簿，因此只要瀏覽器允許網頁讀取剪貼簿，另一個分頁中的圖面也能讀取。貼上的圖層、型式或圖塊若與圖面中既有的同名，則使用圖面原有的。

<Command id="CUTCLIP" />（Ctrl+X）會複製物件並將其刪除，如同 ERASE。<Command id="COPYBASE" />（Ctrl+Shift+C）會先要求指定基準點，之後 PASTECLIP 便以該點而非左下角放置物件，讓物件準確落在想要的位置。按 Ctrl+A 會選取圖面中的所有物件。

## Missing

PASTEBLOCK 與 CUTBASE，因此 Ctrl+Shift+V 與 Ctrl+Shift+X 交由瀏覽器處理，Ctrl+Shift+A 亦同。PASTEORIG、PASTESPEC、在視窗之間拖曳物件，以及將其他程式的文字貼上為多行文字。PASTECLIP 在插入點提示下隱藏的 INSERT 選項，因此貼上時無法調整比例、旋轉或分解。

## Questions

### COPY 與 COPYCLIP 有何不同？

<Command id="COPY" /> 在同一個圖面中，從基準點到第二點放置複本。COPYCLIP 將物件放到剪貼簿，再以 PASTECLIP 貼到此圖面或其他圖面。

### 如何以基準點複製？

按 Ctrl+Shift+C，或輸入 `COPYBASE`，指定基準點並選取物件。之後按 Ctrl+V，即以該點放置物件。

### 如何將物件從一個圖面複製到另一個圖面？

選取物件並按 Ctrl+C，開啟另一個圖面後按 Ctrl+V，再點選插入點。物件的圖層、型式與圖塊會一併帶過去。

### 為什麼無法貼上？

瀏覽器可能會詢問是否允許網頁讀取剪貼簿：請允許。若拒絕，PASTECLIP 會貼上同一網頁中最後複製的內容。若未複製任何內容，則不會貼上任何東西。
