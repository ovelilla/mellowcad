---
title: "AutoCAD ATTDEF（定義屬性）指令"
metaTitle: "CAD 定義屬性（ATTDEF）：圖塊屬性與快捷鍵 ATT"
description: "AutoCAD 定義屬性（ATTDEF、ATT）如何定義圖塊屬性：其模式、標籤、提示與預設值，以及文字放置的位置。可在瀏覽器中免費試用。"
figure: "一個門號標記：屬性 NUM 置中於圓內，其提示即為標籤本身，預設值為 1，可以加入圖塊。"
sourceHash: "f0fc3d8763e7"
---

ATTDEF（定義屬性）指令定義一個屬性：標籤、提示與預設值，以一行文字放置在圖面中。以 <Command id="BLOCK" /> 建立圖塊時，將它與其他物件一起選取，該圖塊的每個參考都會為它保有各自的值：門的編號、零件的代碼、房間的名稱。在此之前，屬性定義會顯示其標籤。

AutoCAD 的 ATTDEF 會開啟「屬性定義」對話方塊，MellowCAD 沒有這個對話方塊：此處 ATTDEF 在指令行中詢問 <Command id="-ATTDEF" /> 所詢問的內容，與 AutoCAD 的主控台相同。它會顯示目前的模式，並要求選擇要變更的模式，直到按 Enter 繼續。接著是標籤：不可有空格，因為空格會結束輸入，小寫字母會轉為大寫；只按 Enter 會顯示 <Message id="tagCannotBeNull" />。接著是 <Command id="INSERT" /> 詢問值時所用的提示，按 Enter 即使用標籤，然後是預設值。最後是文字的位置，使用 <Command id="TEXT" /> 的提示：起點、高度與旋轉角度。高度與對正方式與 TEXT 共用，雙向相通。在起點提示按 Enter，會將屬性定義放在上一個定義的下一行，沿用其高度、旋轉角度、型式與對正方式，因此圖塊的各屬性會一個接一個往下排列。

## Options

### Invisible

值不會顯示在參考上，直到 <Command id="ATTDISP" /> 將其打開。每個模式都是一個切換開關：選擇它會在 `Y` 與 `N` 之間切換，重新顯示各模式並再次詢問。各模式會保留給下一次的 ATTDEF。

### Constant

每個參考都保有相同的值，ATTDEF 會改為詢問此值，而不詢問提示與預設值；INSERT 永遠不會詢問它。

### Verify

INSERT 在每個值都詢問過一次之後，會再次詢問此值，以便確認。

### Preset

INSERT 不會詢問此值：每個參考都採用預設值。

### Lock position

預設為打開：屬性會停留在圖塊放置它的位置。

### Justify

與 TEXT 相同，詢問文字以哪一點對齊其點：<Keyword id="Left" />、<Keyword id="Center" />、<Keyword id="Right" />、<Keyword id="Middle" />，或以上、中、下與左、中、右組合的九個點之一。起點提示接著會要求所選的點：正中會將值置中於標記內。

### Style

詢問要使用的文字型式，該型式會成為目前的型式；<Keyword id="?" /> 會列出圖面的型式。

## Missing

「屬性定義」對話方塊：ATTDEF 在指令行中詢問。AutoCAD 2027 列在「鎖住位置」之後的「可註解」與「多行」模式，以及多行屬性的各行。功能變數、「對齊」與「填入」對正方式，以及「型式」的 `?` 詢問要列出哪些型式。

## Questions

### AutoCAD 定義屬性的快捷鍵是什麼？

`ATT`，再按 Enter 或空白鍵；`DDATTDEF` 也可以。`-ATT` 是 <Command id="-ATTDEF" />，即指令行形式，此處 ATTDEF 也執行此形式。在任何語言版本的 AutoCAD 中都可輸入 `_ATTDEF`。

### AutoCAD 如何建立帶屬性的圖塊？

繪製符號，再為每個屬性執行 ATTDEF，並將其文字放在值要顯示的位置。執行 <Command id="BLOCK" />，點選基準點，並依 INSERT 詢問的順序選取符號與各屬性。之後每次以 <Command id="INSERT" /> 插入該圖塊，都會為每個屬性詢問值，並提供其預設值。

### 標籤、提示與預設值有什麼差別？

標籤是屬性的名稱，作為識別碼：它是屬性定義所顯示的內容，也是 <Command id="EATTEDIT" /> 為欄位標示的名稱。提示是 INSERT 詢問其值時的問題。預設值是提供的值，按 Enter 即接受。

### 如何編輯屬性定義？

在加入圖塊之前按兩下它：<Command id="TEXTEDIT" /> 會開啟其標籤、提示與預設值。加入圖塊之後，各參考的值以 <Command id="ATTEDIT" /> 或 <Command id="EATTEDIT" /> 編輯。
