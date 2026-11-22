---
title: "AutoCAD TEXTEDIT（編輯文字）指令"
metaTitle: "CAD 編輯文字（TEXTEDIT）用法：ED 與 DDEDIT"
description: "AutoCAD TEXTEDIT（編輯文字，ED）如何依序編輯文字、多行文字與屬性定義，以及「退回」與「模式」選項。可以在瀏覽器中免費試用。"
figure: "以 TEXTEDIT 點選銘牌上拼錯的 PALTE，重新輸入為 PLATE，再按 Esc 結束指令。"
sourceHash: "2d0ed6fe5acc"
---

TEXTEDIT 編輯註解物件：它先說明目前的編輯模式（一開始為「多重」），再要求您選取一個物件。單行文字在原處開啟以便重新輸入，多行文字在 <Command id="MTEXT" /> 的編輯器中開啟，屬性定義則以其標籤、提示與預設值開啟。在「多重」模式中，接著會要求下一個物件，直到按 Esc 或 Enter 結束指令，整次執行是一個步驟，<Command id="U" /> 可以將它退回。在文字或屬性定義上按兩下會執行 TEXTEDIT；在多行文字上按兩下，則只為該物件開啟編輯器。

在單行文字的編輯器中按 Esc，會捨棄該次編輯並要求下一個物件；再按一次 Esc 則結束指令。鎖住圖層上的物件會顯示 <Message id="objectOnLockedLayer" /> 並再次詢問；點選其他物件則不作聲地再次詢問。在指令之前選取一個文字，會立即開啟它。

## Options

### Undo

退回此次執行的上一次編輯並再次詢問；沒有可退回的編輯時，說明指令已完全退回。

### Mode

要求編輯模式：<Keyword id="Single" /> 在編輯一個物件後結束指令，<Keyword id="Multiple" /> 則要求下一個物件。模式會保留給下一次 TEXTEDIT 使用，適用於所有圖面。

## Missing

標註文字：TEXTEDIT 不會編輯標註的文字，標註文字由 <Command id="DIMLINEAR" /> 的「文字」選項在放置時設定。在「性質」選項板中編輯文字的內容。輸入的 MTEDIT 與 -MTEDIT。編輯器開啟時，指令行顯示 `TEXTEDIT:`，AutoCAD 則是在原處編輯，不詢問任何事。

## Questions

### AutoCAD 編輯文字（TEXTEDIT）的快捷鍵是什麼？

`ED`，然後按 Enter 或空白鍵；也可以使用 AutoCAD 較舊的名稱 `DDEDIT` 與 `TEDIT`。在任何語言版本的 AutoCAD 中都可以使用 `_TEXTEDIT`。

### CAD 如何修改文字？

按兩下文字，或輸入 `ED` 再點選它；重新輸入後按 Enter。TEXTEDIT 接著會要求下一個要編輯的文字，直到按 Esc。其高度與旋轉是「性質」選項板中的列，其型式則是「文字型式」列。

### 如何依序編輯多個文字？

讓 TEXTEDIT 保持預設的 <Keyword id="Multiple" /> 模式：每編輯完一個文字，它就會要求下一個。<Keyword id="Mode" /> 與 <Keyword id="Single" /> 會讓它在編輯一個之後結束，與按兩下相同。

### 為什麼按兩下無法編輯文字？

文字可能位於鎖住的圖層上：請在「圖層性質管理員」中解鎖該圖層。TEXTEDIT 目前還不能編輯標註的文字，圖塊的屬性值則會開啟 <Command id="EATTEDIT" />。
