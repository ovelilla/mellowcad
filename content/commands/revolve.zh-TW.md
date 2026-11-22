---
title: "AutoCAD REVOLVE（迴轉）指令"
metaTitle: "CAD 迴轉指令（REVOLVE）用法與快捷鍵 REV"
description: "AutoCAD REVOLVE（迴轉，REV）依提示逐步說明如何將 2D 輪廓繞軸迴轉成 3D 實體：軸、物件、X、Y、Z。可在瀏覽器中免費試用。"
figure: "一個帶凸緣的輪廓繞 Y 軸迴轉一整圈：一個線軸，以視覺型式「隱藏」從東南方向檢視。"
sourceHash: "dc0576311912"
---

REVOLVE（迴轉）指令將封閉的 2D 輪廓繞軸迴轉成 3D 實體：一邊位於軸上的矩形會成為圓柱，軸旁的圓會成為圓環。選取輪廓——圓、橢圓、封閉的聚合線或雲形線、面域——並按 Enter；以兩點或其中一個選項指定軸，再指定角度，按 Enter 則迴轉一整圈。每個輪廓都會成為目前圖層上的一個實體，輪廓本身則依 DELOBJ 的預設值被刪除。整個指令為一個步驟，退回一次即可復原。

軸位於輪廓的平面上，且整個輪廓都在軸的同一側，否則指令會在詢問角度之前以 <Message id="revolveOneSide" /> 結束。角度依右手定則繞軸迴轉，方向為從軸的第一點到第二點；負值則反向迴轉。MellowCAD 的 3D 目前只有實體，且仍屬部分功能：開放的輪廓（AutoCAD 會將其轉成曲面）會被拒絕。

## Options

### MOde

如同 <Command id="EXTRUDE" />，詢問 <Keyword id="SOlid" /> 或 <Keyword id="SUrface" />：由於還沒有曲面物件，只接受預設值 <Keyword id="SOlid" />。

### Object

軸提示的預設值，因此按 Enter 即選擇它：點選一條線、聚合線、弧或雲形線，軸會以直線連接其兩個端點，從較靠近點選處的端點開始。封閉的物件沒有端點：顯示 <Message id="revolveClosedAxis" />，並結束指令。

### X

UCS 的 X 軸，通過其原點。

### Y

UCS 的 Y 軸，通過其原點：如範例所示，畫在 Y 軸右側的輪廓，會迴轉成沿 Y 軸放置的零件。

### Z

UCS 的 Z 軸，通過其原點。位於 UCS XY 平面上的輪廓與 Z 軸垂直，因此 REVOLVE 會以 <Message id="revolvePerpendicular" /> 回應並結束：Z 用於直立的輪廓。

### STart

在角度提示下選擇：起始角度，其預設值一律為 0。輪廓會先迴轉到該處，再次詢問角度。

### Reverse

將軸反向，使角度朝相反方向迴轉，並再次詢問角度。

### EXpression

如同 <Command id="EXTRUDE" />，以算術表示式指定角度。

## Missing

不在輪廓平面上的軸，AutoCAD 會將輪廓繞它迴轉成曲面：在此 REVOLVE 會顯示 <Message id="revolveUnable" /> 並結束。以橢圓弧或實體的邊作為「物件」軸。曲面模式和開放的輪廓，因為還沒有曲面物件。隨游標迴轉的預覽：指定角度時，顯示的是整圈。對迴轉實體使用 <Command id="EXPLODE" />，AutoCAD 會將它轉成曲面和面域。其掣點，以及在「性質」選項板中編輯其角度。

## Questions

### CAD 迴轉的快捷鍵是什麼？

輸入 `REV`，再按 Enter 或空白鍵。也可以輸入完整的指令名稱，在任何語言版本的 AutoCAD 中都可以使用 `_REVOLVE`。

### 如何將輪廓繞軸迴轉？

在軸線旁將斷面的一半畫成一個封閉物件，例如封閉的聚合線或面域。執行 REVOLVE，選取輪廓並按 Enter；再按一次 Enter 選擇 <Keyword id="Object" /> 並點選軸線，或指定其兩個端點；然後按 Enter 迴轉一整圈。

### 為什麼 REVOLVE 沒有作用？

最常見的原因是軸穿過輪廓：REVOLVE 會顯示 <Message id="revolveOneSide" /> 並結束。請將軸移到輪廓的邊上或其外側；位於軸上的邊是允許的。與輪廓平面垂直的軸會得到 <Message id="revolvePerpendicular" />；開放的輪廓會被拒絕，因為 MellowCAD 還沒有曲面。

### 如何只迴轉部分角度？

在角度提示下輸入角度，例如 90 或 270。<Keyword id="STart" /> 讓迴轉從更後面的位置開始，<Keyword id="Reverse" /> 則讓它朝相反方向迴轉。
