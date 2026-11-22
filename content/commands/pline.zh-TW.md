---
title: "AutoCAD PLINE（聚合線）指令"
metaTitle: "CAD 聚合線指令（PLINE）用法與快捷鍵 PL"
description: "AutoCAD PLINE（聚合線，PL）依提示逐步說明：直線與弧組成一條聚合線，寬度與半寬、長度、封閉與退回。可在瀏覽器中免費試用。"
figure: "一條直線、一段相切弧、一條回頭的直線，再加上寬 10 漸縮到 0 的箭頭：全部是一條聚合線。"
sourceHash: "216b83656483"
---

PLINE（聚合線）指令繪製聚合線：由直線段和弧首尾相接組成的單一物件，每一段都可以有寬度。指定起點後，會顯示目前的線寬；之後每指定一點就加入一段，直到按 Enter 或選擇 <Keyword id="Close" /> 結束。如同 AutoCAD，一開始繪製直線：<Keyword id="Arc" /> 切換成弧，每段弧都與前一段相切，<Keyword id="Line" /> 則切換回直線。在起點的提示下按 Enter，會從最後繪製的線、弧或聚合線的終點繼續。

## Options

### Arc

弧模式：每個終點繪製一段與上一段相切的弧；若為第一段，則沿著最後繪製的線、弧或聚合線結束時的方向出發。按住 Ctrl 可切換方向。以下的選項決定下一段弧的形狀。

### Close

有一段以上的線段時才列出：將聚合線封閉回起點並結束指令；在弧模式中以相切的弧封閉。

### Halfwidth

與 <Keyword id="Width" /> 相同，但每個寬度是從線段的中心量到邊緣。

### Length

依指定的長度，沿聚合線前進的方向繪製一條直線：沿最後一段直線的方向，或與最後一段弧相切。長度為負值時向後繪製。

### Undo

取消最後一段，並以前一段的模式繼續。沒有線段可取消時，會顯示 <Message id="allSegmentsUndone" />

### Width

先指定起點寬度，再指定終點寬度，可以輸入，或從最後一個頂點點選：10 到 0 會漸縮成一點，就像箭頭。終點寬度會延續到之後的線段，並以 PLINEWID 延續到下一次 PLINE。

### Angle

弧模式：指定弧的夾角，再指定其終點、中心點或半徑。

### Center

弧模式：指定弧的中心點，再指定其終點、夾角或弦長。

### Direction

弧模式：以弧離開最後一個頂點的方向取代相切方向，再指定其終點。

### Line

弧模式：切換回直線段。

### Radius

弧模式：指定弧的半徑，再指定其終點或夾角。半徑為負值時繪製優弧。

### Second pt

弧模式：指定弧通過的一點，再指定其終點：即通過三點的弧。

## Missing

PLINEGEN：新的聚合線逐段配置線型，與 PLINEGEN 為 0 時相同（PEDIT 的「線型生成」可對單一聚合線開啟）。有寬度的線段上的虛線線型會畫成實線。有寬度的線段預覽不會以較淡的顏色顯示，而弧的提示寫在一行中，AutoCAD 則分為兩行。

## Questions

### CAD 聚合線的快捷鍵是什麼？

輸入 `PL`，再按 Enter 或空白鍵。也可以輸入完整的指令名稱，在任何語言版本的 AutoCAD 中都可以使用 `_PLINE`。

### 如何繪製有弧度的聚合線？

選擇 <Keyword id="Arc" />：之後每一點都會結束一段與前一段相切的弧，直到選擇 <Keyword id="Line" />。若要讓已繪製的聚合線平滑地通過其頂點，請使用 <Command id="PEDIT" /> 的 <Keyword command="PEDIT" id="Fit" /> 或 <Keyword command="PEDIT" id="Spline" />。

### 為什麼我畫的聚合線很粗？

前一次 PLINE 指定的寬度會保留，下一條聚合線會以它開始，指定起點後的那一行會顯示這個寬度。選擇 <Keyword id="Width" /> 並輸入兩次 0，即可再畫細線。<Command id="FILL" /> 關閉時，有寬度的聚合線會顯示為外框。

### 如何將多條線接合成一條聚合線？

執行 <Command id="JOIN" />，選取首尾相接的線、弧和聚合線：每一串都會成為一條聚合線。也可以對一條線執行 <Command id="PEDIT" />，回答 <Keyword command="PEDIT" id="Yes" /> 將它轉成聚合線，再以 <Keyword command="PEDIT" id="Join" /> 加入其餘的線。

### 如何查詢聚合線的面積或長度？

執行 <Command id="AREA" />，按 Enter 選擇 <Keyword command="AREA" id="Object" />，再點選聚合線：封閉的聚合線會顯示其面積和周長，開放的則顯示其長度。
