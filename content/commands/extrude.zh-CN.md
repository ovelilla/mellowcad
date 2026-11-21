---
title: "AutoCAD EXTRUDE（拉伸）三维命令"
metaTitle: "CAD三维拉伸命令（EXTRUDE）用法与快捷键 EXT"
description: "CAD三维拉伸怎么用：按提示顺序讲解 AutoCAD 的 EXTRUDE（快捷键 EXT）如何将闭合的二维轮廓拉伸为三维实体：高度、方向和倾斜角。在浏览器中免费试用。"
figure: "一条闭合的 L 形多段线拉伸 20 成为实体，然后以“隐藏”视觉样式从东南方向观察。"
sourceHash: "53bfe3dd1e9c"
---

EXTRUDE（拉伸）命令将闭合的二维轮廓转换为三维实体，每个轮廓沿垂直于其平面的方向按指定高度拉出。选择轮廓（圆、椭圆、闭合多段线或样条曲线、面域），按 Enter 键，然后输入高度或用一个点指定高度；上一次的高度是下一次执行的默认值。每个轮廓各自成为一个实体，位于当前图层上，轮廓本身被删除，与 DELOBJ 的默认设置相同。整个命令是一步，可以用放弃撤销。

MellowCAD 的三维只有实体，且仍是部分支持：开放轮廓在 AutoCAD 中会生成曲面，这里则显示 <Message id="sweepRefusedType" />，并从选择集中删除。

## Options

### MOde

询问 <Keyword id="SOlid" /> 或 <Keyword id="SUrface" />。<Keyword id="SOlid" /> 是默认值，也是唯一可用的模式：由于还没有曲面对象，<Keyword id="SUrface" /> 会被拒绝。

### Direction

代替高度，用两个点指定方向和长度：轮廓沿这条线拉伸，线是倾斜的，拉伸也是倾斜的。方向位于轮廓平面内时显示 <Message id="directionParallel" />，命令结束。

### Path

与 AutoCAD 相同，该选项会列出，但尚未实现：选择它会被拒绝，并再次询问高度。

### Taper

询问一个 −90 到 90 度之间的角度，然后再次询问高度：正角度使实体随高度增加而收窄，负角度使其变宽。在到达高度之前收拢的圆会结束于一个点，成为圆锥；倾斜角无法处理的轮廓不生成任何对象。

### Expression

用表达式指定高度：`2*3` 即 6。目前只支持算术运算。

## Missing

路径，即沿路径扫掠。曲面模式和开放轮廓（AutoCAD 会将其生成曲面）：目前还没有曲面对象。实体的面，以及在对象内部单击找到的区域，这些由 <Command id="PRESSPULL" /> 处理。对椭圆、样条曲线或与下一段成角相交的圆弧使用倾斜角。表达式的参数和函数。对带曲面侧面的拉伸实体执行 <Command id="EXPLODE" />（AutoCAD 会将其分解为曲面和面域）。拉伸实体的夹点，以及在“特性”选项板中编辑其高度和倾斜角。

## Questions

### CAD拉伸的快捷键是什么？

输入 `EXT`，然后按 Enter 键或空格键。也可以输入完整命令名，在任何语言版本的 AutoCAD 中都可以输入 `_EXTRUDE`。

### CAD二维图怎么拉伸成三维？

将轮廓画成一个闭合对象（闭合多段线、圆或面域），执行 EXTRUDE，选择它，按 Enter 键并输入高度。从上方看，实体与其轮廓一样：请用 ViewCube，或 <Command id="-VIEW" /> 和 <Keyword command="VIEW" id="SEiso" /> 转动视图，以三维方式查看。

### CAD拉伸为什么不能生成实体？

轮廓是开放的，或自相交。直线、圆弧或开放多段线在 AutoCAD 中会生成曲面，而 MellowCAD 还没有曲面：EXTRUDE 显示 <Message id="sweepRefusedType" />，并将它们从选择集中删除；自相交的轮廓显示 <Message id="sweepSelfIntersecting" />，同样被删除。请用 <Command id="JOIN" /> 将各段合并，用 <Command id="REGION" /> 将它们创建为面域，或用 <Command id="PRESSPULL" /> 在其内部单击。

### 带孔的图形怎么拉伸？

先将它创建为一个面域：对外轮廓和孔执行 <Command id="REGION" />，再用 <Command id="SUBTRACT" /> 从外轮廓的面域中减去孔的面域。拉伸该面域，孔就贯穿整个实体。也可以执行 <Command id="PRESSPULL" />，在外轮廓和孔之间单击。

### CAD怎么沿路径拉伸？

目前还不行：<Keyword id="Path" /> 会列出，但会被拒绝，SWEEP 也尚未实现。<Keyword id="Direction" /> 沿两点之间的直线拉伸。
