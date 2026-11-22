---
title: "CAD 練習圖：圓桌與椅子"
metaTitle: "CAD 平面圖練習：圓桌與 6 張椅子"
description: "AutoCAD 練習：繪製圓桌與 6 張椅子，先畫一張椅子，再繞桌子的中心點環形陣列，並加上標註，附逐步解說。免費線上練習。"
figure: "直徑 120 的圓桌與 6 張椅子的平面圖，以公分標註。"
sourceHash: "1e307bf5e17a"
---

繪製一張直徑 120 的圓桌與 6 張椅子，單位為公分：每張椅子的椅面為 44 × 40，四角以半徑 4 倒圓角，椅背深 8，椅面前緣距桌緣 8。在桌子上方畫一張椅子，再以環形陣列放置全部 6 張。此圖面的標註比例已設定為公分。

## Steps

### 繪製桌子 [#table]

在「輪廓線」圖層上，以 <Command id="CIRCLE" />（圓）指令於 `0,0` 繪製，<Keyword command="CIRCLE" id="Diameter" /> `120`。

### 繪製椅子 [#chair]

椅面位於桌子上方：以 <Command id="RECTANG" />（矩形）指令，<Keyword command="RECTANG" id="Fillet" /> 為 `4`，從 `-22,68` 畫到相距 `44,40` 處。接著將圓角設回 `0`，畫椅背：從 `-22,108` 到相距 `44,8` 處。<Command id="RECTANG" /> 指令會保留其圓角半徑，直到您變更為止。

### 陣列椅子 [#array]

<Command id="ARRAYPOLAR" />（環形陣列）指令：選取椅面與椅背，按 Enter，指定桌子的中心點 `0,0`，再選擇 <Keyword command="ARRAYPOLAR" id="Items" />，輸入 `6`。每張椅子在放置時會隨之旋轉，因此 6 張都面向桌子。

### 標註 [#dimensions]

在「標註」圖層上，以 <Command id="DIMDIAMETER" />（直徑）指令標註桌子，置於內側；再以 <Command id="DIMLINEAR" />（線性）指令標註上方椅子的寬度 44，以及含椅背的深度 48。
