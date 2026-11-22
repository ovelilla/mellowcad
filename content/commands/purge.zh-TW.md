---
title: "AutoCAD PURGE（清除）指令"
metaTitle: "CAD 清除指令（PURGE）：刪除未使用的圖塊"
description: "AutoCAD PURGE（清除，PU）刪除未被使用的圖塊和線型：依名稱或一次全部，逐一確認或不確認，巢狀的也包含在內。可免費線上試用。"
figure: "兩個圖塊：TAG 放在牆上，BOX 唯一的參考已刪除：PURGE，所有名稱，不確認，只刪除 BOX。"
sourceHash: "7a22ff19d409"
---

PURGE（清除）指令移除圖面中已定義但未使用的項目；在此為圖塊和線型。AutoCAD 的 PURGE 會開啟「清除」對話方塊；MellowCAD 沒有這個對話方塊，因此 PURGE 會在指令行詢問 <Command id="-PURGE" /> 的提示，如同 AutoCAD 的主控台版本。它會顯示「巢狀項目」和「孤立的資料」設定（兩者皆為關閉），並詢問要清除的未使用物件的類型，提供 <Keyword id="Blocks" /> 和 <Keyword id="LTypes" />；在此按 Enter 即結束。

圖面中有參考放置某個圖塊，或使用中的圖塊定義包含它（不論巢狀多深）時，該圖塊即為使用中。刪除圖塊的最後一個參考後，其定義仍留在圖面中，<Command id="INSERT" /> 可以再次放置它：PURGE 才會將它刪除。保留的圖塊所包含的圖塊永遠不會被刪除；一串只互相包含的圖塊，會在一次執行中全部刪除。沒有可刪除的圖塊時，會顯示 <Message id="noUnreferencedBlocks" />。每次執行為一個步驟，<Command id="U" /> 即可復原。

## Options

### Blocks

詢問要清除的名稱，預設為 `*`，即所有未使用的圖塊，也可以輸入含萬用字元的名稱，以逗號分隔。接著詢問是否確認每一個要清除的名稱：<Keyword id="Yes" /> 為預設值，刪除每個圖塊前都會詢問；<Keyword id="No" /> 會全部刪除，並顯示每個名稱和數量。

### LTypes

如同 <Keyword id="Blocks" />，詢問名稱以及是否逐一確認，並刪除未被使用的線型。Continuous、目前的線型，以及圖層或物件使用的線型（包括圖塊內），一律保留；沒有可刪除的線型時，會顯示 <Message id="noUnreferencedLinetypes" />。<Command id="LINETYPE" /> 的「載入」可以將線型載回。

## Missing

「清除」對話方塊，以及其他所有類型：圖層、文字型式與標註型式、群組、材料、多重引線型式、表格型式與視覺型式、已註冊應用程式、長度為零的幾何圖形、空文字物件、孤立的資料，以及「全部」。「巢狀項目」和「孤立的資料」設定無法變更。

## Questions

### CAD 清除的快捷鍵是什麼？

輸入 `PU`，再按 Enter 或空白鍵。`-PU` 是 <Command id="-PURGE" />，即指令行版本，在此 PURGE 也執行它。在任何語言版本的 AutoCAD 中都可以使用 `_PURGE`。

### AutoCAD 如何清除未使用的圖塊？

輸入 `PU`，選擇 <Keyword id="Blocks" />，按 Enter 選擇所有名稱，再回答 <Keyword id="No" />，即可全部刪除而不逐一詢問。

### 為什麼圖塊無法清除？

因為它正在使用中：圖面中有參考放置它，或使用中的圖塊包含它，可能巢狀好幾層。刪除其參考，或分解包含它的圖塊，PURGE 就能將它刪除。

### 如何清除圖層？

在 AutoCAD 中，使用 PURGE 的「圖層」類型。此處尚未提供，PURGE 只清除圖塊和線型；請改在「圖層性質管理員」中刪除空的圖層。
