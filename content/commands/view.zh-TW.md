---
title: "AutoCAD VIEW（視圖管理員）指令"
metaTitle: "CAD 等角視圖與上視圖：VIEW 指令用法"
description: "AutoCAD VIEW（V、-VIEW）如何切換到六個正投影視圖與四個等角視圖，以及每個正投影視圖所設定的 UCS。可以在瀏覽器中免費試用。"
figure: "在平面視圖中繪製的階梯狀塊體：-VIEW 與「西南等角」後，從西南上方以「隱藏」視覺型式檢視。"
sourceHash: "261c8657f5f7"
---

VIEW 將視圖轉到 AutoCAD 的十個預設視圖之一：六個正投影視圖，正對模型的一面；以及四個等角視圖，從一個角向下看。圖面中沒有任何東西移動。VIEW 會執行指令行形式的 <Command id="-VIEW" />：其第一個提示列出 <Keyword id="Orthographic" />，接著詢問要看哪一面；它也直接接受視圖的名稱，就像 AutoCAD 的功能表所回答的：<Command id="-VIEW" />，再輸入 <Keyword id="SWiso" />。每個視圖都會將整個圖面放入畫面，並顯示 <Message id="regeneratingModel" />。

圖面左上角的視圖控制列出同樣的十個視圖並執行 <Command id="-VIEW" />，ViewCube 的面與角也會轉到這些視圖，但 UCS 保持不變。每次 VIEW 都是一個退回步驟，因此 <Command id="U" /> 會退回視圖及其設定的 UCS。在其他指令中加上單引號輸入時，會拒絕並顯示 <Message id="requiresRegen" />。MellowCAD 的 3D 只有實體，而且仍不完整。

## Options

### Orthographic

詢問要看哪一面，預設為 <Keyword id="Top" />，因此在該處按 Enter 會得到平面視圖：<Keyword id="Top" />、<Keyword id="Bottom" />、<Keyword id="Front" />、<Keyword id="BAck" />、<Keyword id="Left" /> 或 <Keyword id="Right" />。每個視圖都是正立的：「上」顯示 X 向右、Y 向上，「前」顯示 X 向右、Z 向上，從下方看的「下」則 X 向左。在第一個提示輸入時，各面不必經過此選項即可使用。

每個面也會將 UCS 轉為面向您，從世界的軸出發（無論原本的 UCS 為何），原點位於 `0,0,0`，與 <Command id="UCS" /> 的正投影選項相同：選擇「前」之後，其 XY 平面就是前面，因此繪製的物件平貼於螢幕，UCS 命名為 `*FRONT*`。選擇「上」之後，UCS 為世界的軸，命名為 `*TOP*`。

### SWiso

西南等角：從前方偏左的角向下看，看到前面、左面與頂面。UCS 保持不變。這是範例中的視圖。

### SEiso

東南等角：從前方偏右的角向下看，看到前面、右面與頂面。UCS 保持不變。

### NEiso

東北等角：從後方偏右的角向下看，看到後面、右面與頂面。UCS 保持不變。

### NWiso

西北等角：從後方偏左的角向下看，看到後面、左面與頂面。UCS 保持不變。

## Missing

具名視圖：<Keyword id="Orthographic" /> 是第一個提示唯一列出的選項，AutoCAD 則還列出 `?`、「刪除」、「還原」、「儲存」、「設定」與「視窗」，在該處輸入的名稱會被拒絕。「視圖管理員」：AutoCAD 中 VIEW 所開啟的對話方塊。沒有繪製任何物件時，視圖保持目前的縮放，AutoCAD 則會將圖面範圍放入畫面。UCSORTHO 與 UCSBASE 變數：正投影視圖一律從世界的軸對齊 UCS。<Command id="UCS" /> 的 <Keyword command="UCS" id="Previous" /> 清單中的已對齊 UCS。

## Questions

### CAD 如何切換到等角視圖？

輸入 <Command id="-VIEW" />，再輸入 <Keyword id="SWiso" /> 得到西南等角；<Keyword id="SEiso" />、<Keyword id="NEiso" /> 與 <Keyword id="NWiso" /> 則是其他三個角。或在左上角的視圖控制中選擇「西南等角」，或按一下 ViewCube 頂部的角。<Command id="VSCURRENT" /> 搭配 <Keyword command="VSCURRENT" id="Hidden" /> 會隱藏後方的邊。

### 上視圖的指令是什麼？

<Command id="-VIEW" />，再輸入 <Keyword id="Top" />，同時也會將 UCS 設為世界的軸。<Command id="PLAN" /> 則是俯視目前的 UCS，並保持 UCS 不變。

### 為什麼切換到前視圖後 UCS 改變了？

正投影視圖會將 UCS 轉為面向您，讓繪製的物件位於螢幕上。<Command id="UCS" /> 加上 Enter 會回到世界；<Command id="U" /> 會同時退回視圖及其 UCS。

### 等角視圖與等角圖是一樣的嗎？

不一樣。等角視圖是從一個角觀看 3D 模型。等角圖則是 2D，使用 SNAP 的等角型式在等角平面上繪製，MellowCAD 尚未提供。

### 「視圖管理員」在哪裡？

VIEW 在指令行執行 <Command id="-VIEW" />：沒有「視圖管理員」，具名視圖（儲存、還原）也尚未提供。
