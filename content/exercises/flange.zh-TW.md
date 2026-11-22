---
title: "CAD 練習圖：法蘭"
metaTitle: "AutoCAD 機械練習圖：附鍵槽的法蘭"
description: "AutoCAD 機械練習題：在軸孔上修剪出鍵槽，以環形陣列排列 8 個孔，並繪製中心線與直徑標註，附逐步解說。免費線上練習。"
figure: "外徑 140 的法蘭，含鍵槽、8 個孔與直徑標註。"
sourceHash: "32f94d57ae25"
---

繪製此法蘭，單位為公釐：外徑 140，軸孔直徑 60，鍵槽寬 16，其頂邊距中心 36；8 個直徑 14 的孔位於直徑 110 的節圓上，並繪製中心線。鍵槽是修剪進軸孔的矩形；孔則是一個圓加上環形陣列。

## Steps

### 繪製圓 [#circles]

在「輪廓線」圖層上，於 `0,0` 畫兩個圓，各以 <Keyword command="CIRCLE" id="Diameter" /> 指定：`140` 與 `60`。

### 切出鍵槽 [#keyway]

以 <Command id="RECTANG" />（矩形）指令從 `-8,20` 畫到相距 `16,16` 處：矩形與軸孔相交。<Command id="TRIM" />（修剪）指令會在其他物件與某物件相交處將其剪斷：先點選矩形兩側邊之間的軸孔弧，再點選軸孔內的矩形底邊。剩下的就是鍵槽：其兩側邊與頂邊。

### 陣列孔 [#holes]

在節圓上畫一個孔：於 `55<22.5`（距原點 55、角度 22.5°）畫一個 <Keyword command="CIRCLE" id="Diameter" /> 為 `14` 的圓。<Command id="ARRAYPOLAR" />（環形陣列）指令：選取該圓，按 Enter，指定中心點 `0,0`；<Keyword command="ARRAYPOLAR" id="ASsociative" /> 選 <Keyword command="ARRAYPOLAR" id="No" />，會留下 8 個獨立的圓，標註時可以點選；<Keyword command="ARRAYPOLAR" id="Items" /> 輸入 `8`，使其佈滿整圈。接著在「中心線」圖層上，於 `0,0` 畫節圓，直徑 `110`。

### 繪製中心線 [#centreLines]

仍在「中心線」圖層上，以 <Command id="LINE" />（線）指令畫兩條通過中心、長 156 的線：橫線從 `-78,0` 向右 `156,0`；豎線從 `0,-78` 向上 `0,156`。

### 標註 [#dimensions]

在「標註」圖層上，以 <Command id="DIMDIAMETER" />（直徑）指令標註軸孔、一個孔、節圓與外輪廓，各在尚無標註穿過的位置點選；再以 <Command id="DIMLINEAR" />（線性）指令標註鍵槽頂邊的寬度：16。
