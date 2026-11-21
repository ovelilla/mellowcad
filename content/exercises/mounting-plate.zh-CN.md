---
title: "CAD 三维练习图：安装板"
metaTitle: "CAD 三维入门练习图：安装板"
description: "适合入门的 AutoCAD 三维练习图：先创建面域，用差集减去孔，再拉伸一次得到安装板实体。附分步解答，可免费在线练习三维建模。"
figure: "带 4 个孔的 100 × 60 板的轮廓，含尺寸标注。"
model: "厚 10 的板实体，从东南方向观察，已消隐。"
sourceHash: "87b8f906b0fd"
---

创建厚 10 的安装板模型（单位：mm）：轮廓 100 × 60，四角圆角半径 8；四个直径 10 的孔，孔心距边缘 15。先在平面上绘制：轮廓和圆转换为面域，在仍为平面时减去孔，再拉伸一次，即得到带孔的实体。

## Steps

### 绘制轮廓 [#profile]

在“轮廓线”图层上，用 <Command id="RECTANG" />（矩形）命令，将 <Keyword command="RECTANG" id="Fillet" /> 设为 `8`，从 `0,0` 画到 `100,60`。然后在 `15,15` 处画一个圆，<Keyword command="CIRCLE" id="Diameter" /> 为 `10`，再用 <Command id="COPY" />（复制）命令以其圆心为基点，复制到相对位置 `70,0`、`70,30` 和 `0,30` 处。

### 创建面域 [#region]

<Command id="REGION" />（面域）命令将闭合对象转换为面域：选择轮廓和四个圆，然后按 Enter 键。五个环，生成五个面域。

### 减去孔 [#subtract]

<Command id="SUBTRACT" />（差集）命令：选择板的面域并按 Enter 键，再选择四个圆的面域并按 Enter 键。最后剩下一个带四个孔的面域。

### 转换视图 [#view]

<Command id="-VIEW" /> 命令的 <Keyword command="VIEW" id="SEiso" /> 选项从东南上方观察；<Command id="VSCURRENT" />（视觉样式）命令的 <Keyword command="VSCURRENT" id="Hidden" /> 选项隐藏被面遮挡的部分。单击 ViewCube 也可以转换视图。

### 拉伸 [#extrude]

<Command id="EXTRUDE" />（拉伸）命令：选择面域，按 Enter 键，输入高度 `10`。板连同孔一起成为实体。<Command id="ZOOM" />（缩放）命令的 <Keyword command="ZOOM" id="Extents" /> 选项使其充满视图，比例 `0.8x` 在周围留出空白。
