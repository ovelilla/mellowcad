---
title: "AutoCAD EXTEND（延伸）命令"
metaTitle: "CAD 延伸命令（EXTEND）怎么用：边界与快捷键 EX"
description: "CAD 延伸怎么用：按提示顺序讲解 AutoCAD 的 EXTEND（快捷键 EX）：快速和标准模式、边界边、栏选、窗交和边，以及按住 Shift 键修剪。在浏览器中免费试用。"
figure: "两条直线延伸到横在其路径上的直线：在快速模式下，每条直线在要延伸的一端附近拾取一次。"
sourceHash: "b2c0044f8e87"
---

EXTEND（延伸）命令将对象延长到与另一个对象相交：在要延伸的一端附近拾取对象，该端点即延伸到其路径上最近的边。可以延伸直线、圆弧、椭圆弧、开放多段线（沿其端部线段延伸，直线段沿直线，圆弧段沿圆弧）、三维多段线和开放样条曲线。与 AutoCAD 相同，命令以快速模式开始：所有对象都是边界。拾取时按住 Shift 键则改为修剪，与 <Command id="TRIM" /> 相同。每次拾取都是一步，可以一次放弃；按 Enter 键结束命令。

## Options

### Boundary

选择用作边界的对象：选择它们，或按 Enter 键选择所有对象。此后，无论哪种模式，都只有这些对象作为边界，直到命令结束。

### Fence

询问一条线的各个点，可以指定任意多个，直到按 Enter 键：与这条线相交的每个对象都从靠近栏选线相交处的一端延伸，作为一步完成。标准模式会列出该选项；快速模式也接受它。

### Crossing

询问窗口的两个角点：与窗口边框相交的每个对象都被延伸，作为一步完成。

### mOde

在 <Keyword id="Quick" /> 和 <Keyword id="Standard" /> 之间切换。在标准模式下，EXTEND 先询问边界边（按 Enter 键选择全部），并列出“栏选”和“边”。该模式由 EXTEND 和 TRIM 共用，在本次会话中保持有效。

### Edge

仅用于标准模式。选择 <Keyword id="Extend" /> 时，对象也会在边界延长后所在的位置停止（直线向两端延长，圆弧沿其所在的圆延长），因此直线可以延伸到一条够不着其路径的直线；默认为 <Keyword id="No extend" />。

### Undo

提示得到过一次响应（拾取、栏选或窗口）后列出：放弃最后一次延伸；没有可放弃的操作时会给出提示。

## Missing

投影：不提供 AutoCAD 的投影选项（无、UCS、视图），所有计算都投影到 UCS 的 XY 平面上进行，这与 AutoCAD 的默认值 UCS 相同。栏选线还不能用光标拖动绘制，只能逐点拾取。模式和“边”的选择只在本次会话中有效，而 AutoCAD 会将其保留到下一次会话。与 UCS 成一定角度的对象（样条曲线除外）既不能作为边界，也不能被延伸；用 <Command id="PEDIT" /> 的 <Keyword command="PEDIT" id="Fit" /> 拟合过的多段线会被拒绝，而 AutoCAD 会延伸其最后一段圆弧。

## Questions

### CAD 延伸的快捷键是什么？

输入 `EX`，然后按 Enter 键或空格键。也可以输入完整命令名，在任何语言版本的 AutoCAD 中都可以输入 `_EXTEND`。

### CAD 延伸不了，为什么提示没有边？

因为该端点要延伸的路径上没有任何对象。直线的另一端能到达边时，直线显示 <Message id="noEdgeInThatDirection" />，否则直线或圆弧显示 <Message id="pathDoesNotIntersectBoundingEdge" />；多段线或样条曲线显示 <Message id="objectDoesNotIntersectEdge" />。请在靠近另一端的位置拾取，或在标准模式下选择 <Keyword id="Edge" /> 和 <Keyword id="Extend" />，使够不着的边界按延长后计算。圆、闭合多段线、完整的椭圆、文字和图案填充根本不能延伸：<Message id="cannotExtendObject" />

### CAD 怎么一次延伸多条线？

在空白处拾取，再拾取第二个点：与这条栏选线相交的每个对象都从较近的一端延伸，作为一步完成。也可以选择 <Keyword id="Crossing" />，在要延伸的端点上绘制一个窗口。

### CAD 怎么用 EXTEND 修剪？

拾取时按住 Shift 键：该部分被修剪到最近的交点，与 <Command id="TRIM" /> 相同；没有任何对象与之相交的对象会被删除。下一次不按 Shift 键拾取时，又恢复为延伸。
