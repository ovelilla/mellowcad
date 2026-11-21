---
title: "CAD 三维练习图：轴承座"
metaTitle: "CAD 三维建模练习题（进阶）：轴承座"
description: "AutoCAD 三维机械练习图：用拉伸和并集建成轴承座，再用圆柱体差集挖出轴孔和两个螺栓孔。附分步解答，可免费在线练习三维实体。"
figure: "轴承座平面图，100 × 60，标注凸台、轴孔和螺栓孔尺寸。"
model: "轴承座实体，从东南方向观察，“概念”视觉样式。"
sourceHash: "5579d6bd5a86"
---

按以下尺寸创建轴承座模型（单位：mm）：底板 100 × 60，厚 12，四角圆角半径 10；中间有一个直径 40、高 40 的凸台；一个直径 20 的轴孔贯通凸台，两个直径 10 的螺栓孔贯通底板，孔距 76。底板和凸台由各自的轮廓拉伸而成，再合并为一个实体；轴孔和螺栓孔是从中减去的圆柱体。

## Steps

### 绘制平面图 [#plan]

在“轮廓线”图层上，用 <Command id="RECTANG" />（矩形）命令，将 <Keyword command="RECTANG" id="Fillet" /> 设为 `10`，从 `0,0` 画到 `100,60`；再在其中心 `50,30` 处画一个圆，<Keyword command="CIRCLE" id="Diameter" /> 为 `40`。

### 拉伸底板和凸台 [#extrude]

用 <Command id="EXTRUDE" />（拉伸）命令将轮廓拉伸 `12` 高，再将圆拉伸 `40` 高，得到两个实体。

### 合并 [#union]

<Command id="UNION" />（并集）命令：选择两个实体并按 Enter 键。二者合为一个实体。

### 绘制圆柱体 [#holes]

用 <Command id="CYLINDER" />（圆柱体）命令将轴孔和一个螺栓孔画成圆柱体：轴孔位于 `50,30`，<Keyword command="CYLINDER" id="Diameter" /> 为 `20`，高 `40`；螺栓孔位于 `12,30`，直径 `10`，高 `12`。然后用 <Command id="COPY" />（复制）命令复制螺栓孔：从 `12,30` 起，再输入相对坐标 `76,0`。

### 差集 [#subtract]

<Command id="SUBTRACT" />（差集）命令：选择轴承座并按 Enter 键，再选择三个圆柱体并按 Enter 键。轴孔和螺栓孔即被挖通。

### 转换视图 [#view]

选择 <Command id="-VIEW" /> 命令的 <Keyword command="VIEW" id="SEiso" /> 选项和 <Command id="VSCURRENT" />（视觉样式）命令的 <Keyword command="VSCURRENT" id="Conceptual" /> 选项，再用 <Command id="ZOOM" />（缩放）命令的 <Keyword command="ZOOM" id="Extents" /> 选项并输入 `0.8x`，使实体充满视图。
