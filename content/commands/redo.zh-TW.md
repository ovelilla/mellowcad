---
title: "AutoCAD REDO（重做）指令"
metaTitle: "CAD 重做指令（REDO）：Ctrl+Y 與 MREDO"
description: "AutoCAD REDO（重做）如何在 U 或 UNDO 之後，立即恢復上一次退回的內容；MREDO 和 Ctrl+Y 則逐步重做。可在瀏覽器中免費試用。"
figure: "在板件上繪製一個孔，以 U 退回，再以 REDO 恢復。"
sourceHash: "d88f63f885fd"
---

REDO（重做）指令取消上一次的 <Command id="U" /> 或 <Command id="UNDO" />：被退回的內容會全部重新繪製，因此在 UNDO 退回五個指令之後，REDO 會恢復這五個指令。執行時會顯示各指令的名稱，沒有可重做的內容時則顯示 <Message id="everythingRedone" />。它不詢問任何提示，也沒有選項。

它只能緊接在退回之後使用。在其他情況下會顯示 <Message id="redoMustFollowUndo" />；一旦執行了其他指令，即使是 LIST 或 ZOOM 這類不改變任何內容的指令，也會顯示 <Message id="nothingToRedo" />。以 UNDO 的「控制」選項設為「無」而關閉退回時，REDO 會顯示它已停用。

<Command id="MREDO" /> 逐步重做：它詢問動作數目，或 <Keyword command="MREDO" id="All" /> 或 <Keyword command="MREDO" id="Last" />，並重做該數目的已退回步驟，無論之後執行過哪些 U、UNDO 和 REDO；「最後一個」為上一次退回的全部內容，只能一次（<Message id="alreadyRedone" />）。Ctrl+Y 和快顯功能表中的「重做」會以 1 執行 MREDO，並取消正在執行的指令。

## Missing

Ctrl+Shift+Z 也會靜默地重做，雖然 AutoCAD 並未為它指定任何功能。快速存取工具列的「退回」和「重做」按鈕不會在指令歷程中寫入任何內容，AutoCAD 的這兩個按鈕則會寫入。

## Questions

### CAD 重做的快捷鍵是什麼？

Ctrl+Y，重做一個步驟（MREDO 1）。REDO 本身沒有指令別名：請輸入 `REDO`，或在任何語言版本的 AutoCAD 中輸入 `_REDO`。

### 為什麼 REDO 沒有作用？

REDO 只能取消緊接在它之前的 U 或 UNDO。執行其他任何指令之後，即使該指令沒有改變任何內容，也沒有可重做的內容：請在退回之後立即重做。

### REDO 和 MREDO 有什麼不同？

REDO 恢復上一次退回的全部內容，而且只能緊接在其後。<Command id="MREDO" /> 逐一重做指定數目的已退回步驟，或全部重做，在 REDO 之後也仍然可以使用。

### AutoCAD 如何重複上一個指令？

在「指令」提示下按 Enter 或空白鍵：上一個指令會再次開始。REDO 不會重複指令；它取消的是退回。
