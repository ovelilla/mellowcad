---
title: "AutoCAD HATCH（填充線）指令"
metaTitle: "CAD 填充線指令（HATCH）用法與快捷鍵 H"
description: "AutoCAD 填充線指令 HATCH（H）如何填滿區域，逐一提示說明：內部點或邊界物件、樣式、比例與角度、孤立物件。可在瀏覽器中免費線上試用。"
figure: "內有一個圓的矩形，從內部一點以 ANSI31 繪製填充線：圓保持空白，成為孤立物件。"
sourceHash: "adab8ef70a51"
---

HATCH（填充線）指令以線的樣式或單色填滿封閉區域。在區域內點選一點，指令會在周圍的物件中找出邊界，並將其內部的物件留白作為孤立物件，例如矩形中的圓或文字；也可以選取圍成區域的物件。可點選任意多個區域：按 Enter 或 Esc 會將所有區域建立為一個填充線，位於目前的圖層上，並置於其邊界後方。整個指令是一個步驟，退回一次即可復原。

AutoCAD 的 HATCH 在「填充線建立」頁籤或對話方塊中設定樣式，MellowCAD 沒有這些介面：此處改在指令行詢問 <Command id="-HATCH" /> 所詢問的內容，樣式在 <Keyword id="Properties" /> 下設定。兩者只有 Esc 不同：在 <Command id="-HATCH" /> 中按 Esc 會捨棄已選的區域。每個填充線都以上一個填充線的樣式、比例與角度開始；在新圖面中為 ANGLE，比例 1，角度 0。

## Options

### Properties

要求輸入樣式名稱（大小寫不拘），並提供目前的樣式：<Keyword id="Solid" /> 填滿區域，<Keyword id="?" /> 列出樣式及其描述，然後回到點的提示。若為樣式，接著會詢問比例（大於 0 的數字，或以兩點測量）與角度（直接輸入或以兩點指定）。下一個填充線會沿用這三項設定。

<Session name="hatchPatterns" caption="SOLID 與 acadiso.pat 的 11 種樣式，各以比例 1 填入邊長 30 的正方形，AR-CONC 與 AR-SAND 的比例為 0.08 與 0.1。" />

### Select objects

不點選內部點，而是選取圍成區域的物件；按 Enter 回到點的提示。未圍成區域的物件會被略過；如果沒有任何物件圍成區域，按 Enter 會顯示 <Message id="unableToHatchBoundary" />，不建立任何物件。面域會提供其外框，其孔則成為孤立物件。

### Undo

提示中不會列出，但可以輸入：退回最後一次點選的點所找到的區域並再次詢問，已選取的物件則保持選取。沒有可退回的點時，會顯示 <Message id="noBoundaryToUndo" />。

## Missing

以橢圓與雲形線作為邊界：由其圍成的區域找不到，含有這類邊的面域會被略過。間隙公差（HPGAPTOL）：區域必須完全封閉。關聯式填充線，以及正常與忽略孤立物件偵測型式。此處無法建立漸層、使用者定義的樣式，以及 acadiso.pat 中其餘的樣式：只有 DXF 中的填充線會帶入這些樣式，漸層保留其顏色，樣式保留其線。-HATCH 的其他選項：繪製邊界、移除邊界、進階、繪製順序、原點、可註解、顏色、圖層與透明度。HATCHEDIT 與「填充線編輯器」，在 AutoCAD 中按兩下填充線即會開啟。MIRRHATCH 1：鏡射後的填充線一律保留其樣式的角度。填充線掣點的功能表。

## Questions

### AutoCAD 填充線指令的快捷鍵是什麼？

輸入 `H`，再按 Enter 或空白鍵；`BH` 也可以。由於沒有「填充線建立」頁籤，指令會在指令行中詢問，與 `-H`（<Command id="-HATCH" />）相同。`_HATCH` 在任何語言版本的 AutoCAD 中都適用。

### CAD 填充線填不進去怎麼辦？

多半是因為區域未封閉：指令會顯示 <Message id="hatchNoBoundary" />，即使是最小的間隙也足以造成此狀況，因為間隙不會被忽略。請封閉外形後再點選。目前還無法偵測由橢圓或雲形線圍成的區域，位於關閉圖層上的物件也不會被偵測到。

### 有哪些填充線樣式？可以下載更多嗎？

提供 AutoCAD 公制樣式檔 acadiso.pat 中的一部分：SOLID、ANGLE、ANSI31 到 ANSI38、AR-CONC、AR-SAND、BRICK、CROSS、DASH、DOTS、EARTH、HONEY、LINE、NET、NET3、SQUARE、STEEL 與 ZIGZAG。<Keyword id="Properties" /> 下的 <Keyword id="?" /> 會列出這些樣式。目前還無法載入您自己的或下載的樣式檔，但 DXF 中的填充線無論使用何種樣式，開啟時都會保留其樣式，並以 AutoCAD 的方式繪製。

### 如何變更填充線的比例？

在點選之前，於 <Keyword id="Properties" /> 下設定：比例在樣式名稱之後詢問。建立之後，選取填充線並在「性質」選項板中重新輸入「比例」，或以 <Command id="MATCHPROP" /> 套用另一個填充線的樣式、比例與角度。比例太小、樣式需要過多線條時，會顯示 <Message id="hatchTooDense" />，不建立填充線。

### 如何查詢填充線的面積？

選取填充線，在「性質」選項板的「幾何圖形」下讀取「面積」，孤立物件不計入；選取多個時，「累計面積」會將其加總。也可以執行 <Command id="AREA" />，選擇 <Keyword command="AREA" id="Object" /> 並點選填充線。
