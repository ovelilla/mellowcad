---
title: "CAD 三维练习图：带轮"
metaTitle: "CAD 三维练习题：旋转生成带轮"
description: "AutoCAD 三维练习图：把带轮的半截面画成闭合多段线，绕 Y 轴旋转成实体。附分步解答，可免费在线练习三维建模。"
figure: "带轮的半截面及其轴线，标注到轴线的距离。"
model: "带轮实体，从东南方向观察，“概念”视觉样式。"
sourceHash: "f9c2a81b39fe"
---

将带轮的半截面绕其轴线旋转，创建以下带轮模型（单位：mm）：轴孔直径 20；轮毂长 30、直径 40；腹板厚 10；轮缘宽 24，直径从 90 到 110，位于轮毂中间。截面按到轴线的距离绘制，轴线沿 Y 轴向上，因此每个直径都按其一半绘制。

## Steps

### 绘制半截面 [#profile]

在“轮廓线”图层上，用 <Command id="PLINE" />（多段线）命令从 `10,0` 起画一条闭合多段线，之后每一点都相对上一点输入：`10,0`、`0,10`、`25,0`、`0,-7`、`10,0`、`0,24`、`-10,0`、`0,-7`、`-25,0`、`0,10`、`-10,0`，然后选择 <Keyword command="PLINE" id="Close" />。

### 转换视图 [#view]

<Command id="-VIEW" /> 命令的 <Keyword command="VIEW" id="SEiso" /> 选项从东南上方观察；<Command id="VSCURRENT" />（视觉样式）命令的 <Keyword command="VSCURRENT" id="Conceptual" /> 选项为各面着色，最能看清回转体零件的形状。

### 旋转 [#revolve]

<Command id="REVOLVE" />（旋转）命令：选择截面并按 Enter 键，然后选择 <Keyword command="REVOLVE" id="Y" />：Y 轴就是带轮的轴线。按 Enter 键接受默认角度，即旋转一整周。<Command id="ZOOM" />（缩放）命令的 <Keyword command="ZOOM" id="Extents" /> 选项使其充满视图，比例 `0.8x` 在周围留出空白。
