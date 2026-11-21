---
title: "CAD 练习图：楼梯平面图"
metaTitle: "CAD 建筑平面图练习：直跑楼梯"
description: "AutoCAD 建筑练习图：用一条直线和矩形阵列画出直跑楼梯平面图的 10 个踏步，再画上楼方向箭头并标注尺寸。附分步解答，可免费练习。"
figure: "直跑楼梯平面图，280 × 100 cm，箭头指向上楼方向。"
sourceHash: "ff6e60262cd9"
---

绘制直跑楼梯的平面图（单位：cm）：长 280、宽 100，10 个踏步，踏步宽 28，并画出表示上楼方向的箭头。本图形的标注比例已按厘米单位的平面图设置，因此标注在此尺寸下清晰可读。只画一个踏步的边线，其余由矩形阵列放置。

## Steps

### 绘制轮廓 [#outline]

在“轮廓线”图层上，用 <Command id="RECTANG" />（矩形）命令从 `0,0` 画到 `280,100`：即楼梯段的轮廓。

### 绘制第一个踏步 [#tread]

第一个踏步的边线：用 <Command id="LINE" />（直线）命令从 `28,0` 起，向上 `0,100`，然后按 Enter 键。

### 阵列踏步 [#array]

<Command id="ARRAYRECT" />（矩形阵列）命令沿楼梯段复制这条线：选择直线并按 Enter 键，然后选择 <Keyword command="ARRAYRECT" id="COUnt" /> 选项，输入 `9` 列和 `1` 行；再选择 <Keyword command="ARRAYRECT" id="Spacing" /> 选项，列间距 `28`，行间距 `1`（只有一行时行间距不起作用）。<Keyword command="ARRAYRECT" id="eXit" /> 将其保留为关联阵列，以后可以用夹点编辑。

### 绘制箭头 [#arrow]

用 <Command id="PLINE" />（多段线）命令从 `14,50` 起，沿楼梯段画到相对其 `226,0` 处；然后选择 <Keyword command="PLINE" id="Width" /> 选项，起点宽度 `10`，端点宽度 `0`，再画最后一段 `24,0`：即箭头。按 Enter 键结束。

### 标注尺寸 [#dimensions]

在“标注”图层上，用 <Command id="DIMLINEAR" />（线性）命令标注三次：下方标总长，右侧标宽度，上方标一个踏步宽 28。
