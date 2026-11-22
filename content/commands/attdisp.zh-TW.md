---
title: "AutoCAD ATTDISP（顯示屬性）指令"
metaTitle: "CAD 顯示屬性（ATTDISP）：顯示或隱藏屬性"
description: "AutoCAD 顯示屬性（ATTDISP）如何顯示圖塊屬性：一般、ON 連不可見的屬性也顯示、OFF 全部隱藏。隨圖面儲存。可線上免費試用。"
figure: "兩張書桌，其零件編號為不可見的屬性：ATTDISP ON 將它們顯示在每張書桌下方，在可見的編號旁。"
sourceHash: "8821fdeb2077"
---

ATTDISP（顯示屬性）指令設定圖面中的圖塊參考顯示哪些屬性。它會要求設定，並提供目前的設定，新圖面中為「一般」；其他任何字詞都會說明關鍵字無效並再次詢問，按 Enter 則保留目前設定。變更設定會重新繪製整個圖面，並如 AutoCAD 2027 一樣顯示 `Regenerating model.`，此設定以 ATTMODE 隨圖面儲存，是 <Command id="U" /> 可以退回的一個步驟。在指令中加上單引號輸入時，也可以在該指令中執行。

它只改變顯示的內容：不可見的屬性保留其值，隱藏的屬性仍可以 <Command id="ATTEDIT" /> 或 <Command id="EATTEDIT" /> 編輯。

## Options

### Normal

依各屬性的定義顯示：顯示可見的屬性，不顯示以 <Command id="ATTDEF" /> 的 <Keyword command="ATTDEF" id="Invisible" /> 定義的屬性。

### ON

顯示所有屬性，包括不可見的屬性。

### OFF

隱藏所有屬性，包括可見的屬性。

## Questions

### AutoCAD 如何顯示不可見的屬性？

輸入 `ATTDISP` 並選擇 <Keyword id="ON" />：所有屬性都會顯示，包括不可見的屬性。<Keyword id="Normal" /> 會再將它們隱藏。

### 為什麼圖塊屬性沒有顯示？

<Command id="ATTDISP" /> 可能設為 <Keyword id="OFF" />，會隱藏所有屬性；或設為 <Keyword id="Normal" />，而屬性定義為不可見。選擇 <Keyword id="ON" /> 即可全部看到。若參考的圖塊沒有屬性，無論設定為何都不會顯示任何屬性。

### AutoCAD 如何隱藏屬性值？

將屬性定義為不可見：在建立圖塊之前，使用 <Command id="ATTDEF" /> 的 <Keyword command="ATTDEF" id="Invisible" /> 模式。ATTDISP <Keyword id="OFF" /> 會一次隱藏整個圖面中的所有屬性。
