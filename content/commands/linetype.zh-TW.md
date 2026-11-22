---
title: "AutoCAD LINETYPE（線型）指令"
metaTitle: "CAD 線型指令（LINETYPE）載入與快捷鍵 LT"
description: "AutoCAD 線型指令 LINETYPE（LT）的用法：從 acadiso.lin 載入線型、新物件的目前線型、ByLayer，以及虛線為何顯示為實線。"
figure: "一塊板件：以 HIDDEN 為目前線型繪製其孔，以 CENTER 繪製兩條軸線，再將 LINETYPE 設回 ByLayer。"
sourceHash: "d15530a865c1"
---

LINETYPE（線型）指令設定新物件繪製時所用的線型。AutoCAD 會開啟「線型管理員」；MellowCAD 目前還沒有，因此 LINETYPE 執行 AutoCAD 也有的指令行版本 <Command id="-LINETYPE" />。指令顯示目前的線型（一開始為 `ByLayer`），每次回答後再次要求選擇選項，直到按 Enter 結束。ByLayer 表示每個物件採用其圖層的線型；指定線型名稱時，則是物件自己的線型。整次執行是一個步驟，<Command id="U" /> 即可退回；在指令中加上撇號輸入時，其線型會套用於該指令接下來繪製的物件。

圖面有自己的線型，隨圖面與其 DXF 一起儲存。新圖面有六種：Continuous，以及來自 AutoCAD 公制線型檔 acadiso.lin 的 DASHED、HIDDEN、CENTER、PHANTOM 與 DASHDOT；其他線型從 acadiso.lin 載入，DXF 則帶入自己的線型，包括 ISO 線型與複雜線型，其文字（例如 GAS_LINE 的 `GAS`）會沿線繪製。樣式以 AutoCAD 的方式套用在每條線上：沿線長置中，兩端的虛線長度相等，並依 <Command id="LTSCALE" /> 與物件本身的線型比例調整比例；物件本身的線型比例由 <Command id="CHPROP" /> 與「性質」選項板設定，新物件則由 CELTSCALE 指定。

## Options

### ?

以名稱與描述兩欄列出線型。在選項提示下，會詢問要列出哪個檔案，預設為 acadiso.lin，或 AutoCAD 的英制檔案 acad.lin，並依檔案中的順序列出其線型；在設定的提示下，則列出圖面中已載入、名稱符合所輸入內容的線型（輸入 `*` 列出全部），依名稱排序。

### Load

詢問要載入哪些線型（一個名稱，或以逗號分隔的多個名稱，也可使用萬用字元，如 `DASH*`），再詢問要搜尋哪個檔案，一開始為 acadiso.lin，之後則為上次搜尋的檔案。找到的每個線型都會依檔案中的順序載入並顯示；已載入的線型會先詢問，選擇預設的 <Keyword id="Yes" /> 會重新載入。檔案中沒有的名稱，或 acadiso.lin 與 acad.lin 以外的檔案，都會顯示訊息。

### Set

詢問線型名稱，並提供目前的線型；輸入已載入線型的名稱，或 <Keyword id="BYLayer" />。acadiso.lin 中有的線型會先載入，與 AutoCAD 相同；其他線型則以 AutoCAD 的訊息顯示找不到，並回到選項提示。按 Enter 保留目前的線型。

## Missing

「線型管理員」，以及建立線型或從您自己的檔案載入線型。BATTING 或 ZIGZAG 等複雜線型的形狀，以其所在位置的間隙繪製。ByBlock。PSLTSCALE 與 MSLTSCALE，因為沒有圖紙空間。各語言版本 AutoCAD 的 acadiso.lin，西班牙文或德文版 AutoCAD 會載入其中的名稱（TRAZOS、STRICHLINIE）：載入在每種語言中都讀取英文版的檔案，但以這些線型製作的圖面開啟時會保留自己的線型。PLINEGEN：新聚合線會在每個頂點重新開始其樣式，除非以 PEDIT 的「線型生成」選項將其打開。

## Questions

### AutoCAD 線型指令的快捷鍵是什麼？

輸入 `LT`，再按 Enter 或空白鍵；`LTYPE` 與 `DDLTYPE` 也可以。輸入完整名稱也可以，而 `_LINETYPE` 在任何語言版本的 AutoCAD 中都適用。

### CAD 虛線為什麼顯示為實線？

比其樣式一次重複還短的線會繪製為實線，與 AutoCAD 相同：在預設比例下，CENTER 的樣式長約 51 個單位。請調高或調低 <Command id="LTSCALE" />，使樣式符合圖面。同時檢查物件的線型（為 ByLayer 時則為其圖層的線型）不是 Continuous。

### 如何變更既有物件的線型？

選取物件，在「性質」選項板的「線型」列中選擇線型，或以 <Command id="MATCHPROP" /> 從另一個物件複製。LINETYPE 只設定之後繪製的物件的線型。

### 如何在 AutoCAD 中變更線型比例？

輸入 <Command id="LTSCALE" /> 與新的係數：2 會使整個圖面中的每段虛線長度加倍。

### 如何在 AutoCAD 中載入線型？

AutoCAD 在「線型管理員」中載入。此處請輸入 `-LINETYPE`，選擇 <Keyword id="Load" />，輸入線型名稱，例如 `HIDDEN2` 或 `ACAD_ISO02W100`，然後按 Enter 搜尋 acadiso.lin。<Keyword id="Set" /> 會在將 acadiso.lin 中的線型設為目前線型時將其載入。
