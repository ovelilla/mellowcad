---
title: "AutoCAD UNDO（退回）指令"
metaTitle: "CAD 復原上一步：UNDO（退回）、U 與 Ctrl+Z"
description: "AutoCAD UNDO（退回）的用法：退回指定數目的步驟、標記與退回、開始與結束、控制，以及它與 U、Ctrl+Z 的不同。可以在瀏覽器中免費試用。"
before: "一塊有兩個孔、一條線橫越的板，由四個指令繪製：RECTANG、兩次 CIRCLE 與 LINE。"
figure: "UNDO 2：退回最後兩個指令，即那條線與第二個孔，板上保留第一個孔。"
sourceHash: "4be486fddde0"
---

UNDO 退回指令。一個步驟就是一整個指令：一次 LINE 所繪製的一切會一起退回，無論它有幾段；指令所做的設定（例如 LTSCALE）也是如此。UNDO 先寫出其目前的設定，再要求要退回的作業數目或選項；按 Enter 退回一個。它會在一行中寫出所退回的指令名稱，例如 `CIRCLE LINE`，全部退回時顯示 <Message id="everythingUndone" />；之後則顯示 <Message id="nothingToUndo" />。沒有變更任何東西的指令（例如 ID 或 LIST）也算一個步驟，ZOOM 與 PAN 對視圖所做的變更也是。

<Command id="U" /> 是簡短的形式：退回一個步驟，不詢問任何事。在指令提示按 Ctrl+Z 會執行 U；在指令執行中，則是該指令本身的「退回」，與 AutoCAD 巨集所輸入的相同：LINE 會退回其最後一段並繼續。緊接著執行 <Command id="REDO" />，可以恢復上一次 U 或 UNDO 所退回的內容。

## Options

### Auto

詢問 <Keyword id="ON" /> 或 <Keyword id="OFF" />，以目前的設定為預設值，設定行隨後會顯示該設定。在 AutoCAD 中，它將一個功能表項目所執行的多個指令合為一個步驟；此處沒有任何功能表會執行一個以上的指令，因此它不會合併任何東西。

### Control

詢問要保留多少退回資訊，預設為 <Keyword id="All" />。<Keyword id="None" /> 捨棄所有保留的步驟並關閉退回功能：U 隨後顯示 <Message id="uDisabled" />，UNDO 則立即要求「控制」。<Keyword id="One" /> 只保留最後一個步驟，UNDO 隨後要求 1 或「控制」。「全部」會重新打開完整的退回功能。<Keyword id="Combine" /> 設定連續的 ZOOM 與 PAN 是否合為一個步驟，<Keyword id="Layer" /> 設定在「圖層性質管理員」中的連續編輯是否合為一個步驟，兩者預設皆為「是」。這些設定屬於圖面，但不隨圖面儲存：新圖面或開啟的圖面一律從「全部」、「組合」為「是」與「圖層」為「是」開始。

### BEgin

開始一個群組：直到 <Keyword id="End" /> 為止所執行的指令合為一個步驟，U 會將它整個退回，並與指令一起以 `GROUP` 命名。群組開啟時，U、數目與「退回」都會停在其開頭。在群組開啟時執行「開始」，會先將它關閉。

### End

關閉「開始」所開啟的群組。

### Mark

在步驟中留下一個標記。「退回」、U 與數目會停在標記處，並顯示 <Message id="markEncountered" />。

### Back

退回直到上一個標記的所有步驟，標記也一併退回。沒有標記時，會詢問是否退回全部，預設為「是」。

## Missing

「自動」不會合併任何東西，因為此處沒有任何功能表會執行一個以上的指令。「組合」與「圖層」只在瀏覽器的階段作業中保留，AutoCAD 則會保留到下一個階段作業。Ctrl+Shift+Z 也會不作聲地重做，雖然 AutoCAD 沒有為它指定任何功能。

## Questions

### AutoCAD 復原（UNDO）的快捷鍵是什麼？

Ctrl+Z，或 `U` 再按 Enter：退回一個步驟。UNDO 沒有指令別名；若要退回多個步驟或使用其選項，請輸入完整名稱，或在任何語言版本的 AutoCAD 中輸入 `_UNDO`。

### U 與 UNDO 有什麼不同？

<Command id="U" /> 退回上一個指令，不詢問任何事。UNDO 會詢問要退回幾個，並有「標記」與「退回」可以回到您所標記的位置、「開始」與「結束」可以將多個指令合為一個步驟，以及「控制」可以限制或關閉退回功能。

### 如何一次退回多個指令？

輸入 `UNDO` 與指令的數目，例如 `5`。或在可能要捨棄的一系列操作之前選擇 <Keyword id="Mark" />，再以 <Keyword id="Back" /> 回到該處。

### CAD 為什麼無法復原（UNDO 沒有作用）？

退回功能已以「控制」的 <Keyword id="None" /> 關閉：U 會加以說明，UNDO 則會要求「控制」。回答 <Keyword id="All" /> 即可重新打開。在此之前的步驟已經無法恢復。

### 如何重做已退回的內容？

在 U 或 UNDO 之後緊接著執行 <Command id="REDO" />，會將退回的內容全部恢復。Ctrl+Y 則一次重做一個步驟。
