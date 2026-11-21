---
title: "AutoCAD PLINE（多段线）命令"
metaTitle: "CAD多段线命令（PLINE）用法与快捷键 PL"
description: "CAD多段线怎么画：AutoCAD PLINE（多段线，快捷键 PL）按提示顺序讲解，直线和圆弧组成一条多段线，宽度和半宽、长度、闭合和放弃。在浏览器中免费试用。"
figure: "一段直线、一段相切圆弧、一段折回的直线，再加一个从宽 10 渐变到 0 的箭头：一条多段线。"
sourceHash: "216b83656483"
---

PLINE（多段线）命令绘制多段线：由首尾相接的直线段和圆弧段组成的一个对象，每段都有宽度。指定起点后，它显示当前线宽；然后每指定一个点就添加一段，直到按 Enter 键或选择 <Keyword id="Close" /> 结束。与 AutoCAD 一样，它从直线开始：<Keyword id="Arc" /> 切换为圆弧，每段圆弧都与前一段相切，<Keyword id="Line" /> 切换回直线。在起点处按 Enter 键，会从上次绘制的直线、圆弧或多段线的端点继续。

## Options

### Arc

圆弧模式：每个端点绘制一段与上一段相切的圆弧；作为第一段时，沿上次绘制的直线、圆弧或多段线终止时的方向引出。按住 Ctrl 键可以切换方向。下面的选项决定下一段圆弧的形状。

### Close

有了一段之后才列出：将多段线闭合回起点并结束命令；在圆弧模式下以一段相切圆弧闭合。

### Halfwidth

与 <Keyword id="Width" /> 相同，但每个宽度都从线段的中心量到其边缘。

### Length

沿多段线的前进方向绘制指定长度的直线：沿上一段直线方向，或与上一段圆弧相切。负的长度向反方向绘制。

### Undo

放弃最后一段，并以前一段的模式继续。没有可放弃的线段时，提示 <Message id="allSegmentsUndone" />

### Width

先询问起点宽度，再询问端点宽度，都可以输入或从最后一个顶点拾取：从 10 到 0 会像箭头一样逐渐收尖。端点宽度会延续到后面的线段，并作为 PLINEWID 延续到下一次 PLINE。

### Angle

圆弧模式：圆弧的包含角，然后是其端点、圆心或半径。

### Center

圆弧模式：圆弧的圆心，然后是其端点、包含角或弦长。

### Direction

圆弧模式：圆弧从最后一个顶点引出的方向，代替切线方向，然后是其端点。

### Line

圆弧模式：回到直线段。

### Radius

圆弧模式：圆弧的半径，然后是其端点或包含角。负的半径绘制优弧。

### Second pt

圆弧模式：圆弧经过的一个点，然后是其端点：即三点圆弧。

## Missing

PLINEGEN：新多段线逐段生成线型，与 PLINEGEN 为 0 时相同（PEDIT 的线型生成可以对单条多段线打开它）。有宽度的线段上的虚线线型显示为实线。有宽度的线段的预览不以较暗的颜色绘制，圆弧提示写在一行中，而 AutoCAD 将其分为两行。

## Questions

### CAD多段线快捷键是什么？

输入 `PL`，然后按 Enter 键或空格键。也可以输入完整的命令名；在任何语言版本的 AutoCAD 中都可以使用 `_PLINE`。

### CAD怎么画带弧线的多段线？

选择 <Keyword id="Arc" />：此后每个点都结束一段与前一段相切的圆弧，直到选择 <Keyword id="Line" />。要让已绘制的多段线经过其顶点变得光滑，请使用 <Command id="PEDIT" /> 及其 <Keyword command="PEDIT" id="Fit" /> 或 <Keyword command="PEDIT" id="Spline" />。

### CAD多段线为什么画出来是粗的？

之前的 PLINE 中指定的宽度会保留，下一条多段线也从这个宽度开始，起点之后的那一行会显示它。选择 <Keyword id="Width" /> 并两次输入 0，即可恢复为细线。<Command id="FILL" /> 关闭时，有宽度的多段线只显示轮廓。

### CAD多段线怎么合并成一个整体？

执行 <Command id="JOIN" />，选择首尾相接的直线、圆弧和多段线：每一串都变成一条多段线。或者对一条直线执行 <Command id="PEDIT" />，回答 <Keyword command="PEDIT" id="Yes" /> 把它转换为多段线，再用 <Keyword command="PEDIT" id="Join" /> 添加其余对象。

### CAD怎么测量多段线的长度或面积？

执行 <Command id="AREA" />，按 Enter 键选择 <Keyword command="AREA" id="Object" />，然后选择多段线：闭合多段线给出面积和周长，开放多段线给出长度。
