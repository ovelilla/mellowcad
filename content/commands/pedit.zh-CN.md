---
title: "AutoCAD PEDIT（编辑多段线）命令"
metaTitle: "CAD 编辑多段线（PEDIT）：合并与宽度，快捷键 PE"
description: "CAD 多段线怎么合并：AutoCAD PEDIT（编辑多段线，快捷键 PE）把直线转换为多段线，合并、宽度、拟合和样条曲线、编辑顶点、多条。在浏览器中免费试用。"
figure: "三条首尾相接的直线：PEDIT 把第一条转换为多段线，把另外两条合并进来，并赋予宽度 2。"
sourceHash: "bdc0bf10ac09"
---

PEDIT（编辑多段线）命令编辑多段线。在 `Select polyline or [Multiple]:` 提示下选择一条，或在命令之前选择；双击多段线也会对它执行 PEDIT。如果选择的是直线、圆弧或样条曲线，它会提示 <Message id="objectNotPolyline" />，并询问是否将其转换为多段线，默认为“是”：新多段线取代原对象并继承其特性。然后反复询问选项，每个选项立即生效，直到按 Enter 键结束。三维多段线的选项列表较短，没有宽度、曲线拟合和线型生成，其样条选项为 <Keyword id="Spline curve" />。按 Esc 键会保留已完成的修改；整个编辑是一步，可以用 <Command id="U" /> 放弃。

## Options

### Multiple

同时编辑多条多段线：选择它们，选择是否转换其中的直线、圆弧和样条曲线，然后每个选项都应用于所有多段线。其合并会询问模糊距离和 <Keyword id="Jointype" />：<Keyword id="Extend" /> 修剪或延伸端部线段使其相交，<Keyword id="Add" /> 用一条新线段连接间隙，<Keyword id="Both" /> 能延伸时延伸，不能延伸时添加。

### Close

用一段从最后一个顶点到第一个顶点的线段闭合多段线；最后一段为圆弧时，这一段也是圆弧。对于闭合的多段线，该选项为 <Keyword id="Open" />，它会去掉这一段。

### Join

把与多段线端点首尾相接的直线、圆弧和开放多段线添加进来，并显示添加了多少段。闭合的多段线不能合并：<Message id="cannotJoinClosedPolyline" />。

### Width

为所有线段指定一个宽度，可以输入，也可以用两点量取；0 去掉宽度。

### Edit vertex

在第一个顶点上放一个 X 标记，并询问在该处做什么：<Keyword id="Next" /> 和 <Keyword id="Previous" /> 移动 X 标记，<Keyword id="Move" /> 移动顶点，<Keyword id="Insert" /> 在其后添加一个顶点；<Keyword id="Break" /> 和 <Keyword id="Straighten" /> 记住该顶点，将 X 标记移到另一个顶点后，<Keyword id="Go" /> 在两点之间打断多段线，或把两点之间的部分变成一条直线段；<Keyword id="Width" /> 设置下一段的起点宽度和端点宽度，<Keyword id="Tangent" /> 为顶点指定方向，供之后的拟合使用，<Keyword id="eXit" /> 返回。

### Fit

按 AutoCAD 的曲线拟合方式，用圆弧绘制一条通过每个顶点的光滑曲线，圆弧在连接处相切。顶点保留，编辑顶点会改变曲线的形状。

### Spline

使用多段线的顶点作为框架拟合一条 B 样条曲线，曲线不通过这些顶点：按 SPLINETYPE 为二次或三次，精细程度由 SPLINESEGS 决定。三维多段线的对应选项为 <Keyword id="Spline curve" />。SPLINE 的“对象”选项可以把这样的多段线转换为真正的样条曲线。

### Decurve

去掉拟合或样条曲线：顶点之间恢复为直线段。

### Ltype gen

<Keyword id="ON" /> 沿整条多段线连续生成线型图案，因此由短线段组成的虚线多段线仍然显示划线；<Keyword id="OFF" />（默认值）在每个顶点处重新开始图案。

### Reverse

反转多段线：顶点顺序反过来，圆弧和宽度随之反转。

### Undo

放弃本次执行中的上一个选项，并继续询问。

## Missing

PEDITACCEPT：选择直线、圆弧或样条曲线时总是先询问再转换。PLINECONVERTMODE：样条曲线转换为由直线段组成的多段线，段数远多于 AutoCAD 生成的，并且不会生成圆弧。拟合后的多段线在“特性”选项板中显示为普通多段线，没有 AutoCAD 的“二维多段线”标题及其“拟合/平滑”行。选择集中只有三维多段线时，多条模式显示三维提示，而 AutoCAD 显示二维提示。没有可编辑的网格。

## Questions

### CAD 编辑多段线快捷键是什么？

输入 `PE`，然后按 Enter 键或空格键。也可以输入完整的命令名；在任何语言版本的 AutoCAD 中都可以使用 `_PEDIT`。双击多段线也会执行它。

### CAD 多段线怎么合并？

执行 PEDIT，选择其中一条直线并按 Enter 键把它转换为多段线，然后选择 <Keyword id="Join" /> 并选择其他直线：首尾相接的直线会合成一条多段线。<Command id="JOIN" /> 一步就能完成同样的操作。

### CAD 编辑多段线为什么选不中对象？

PEDIT 编辑多段线，并提供把直线、圆弧和样条曲线转换为多段线；其他对象（文字、圆、块）会被拒绝并重新询问。锁定图层上的对象会提示 <Message id="objectOnLockedLayer" />。合并只添加端点与多段线端点完全重合的对象：有间隙时，请使用 <Keyword id="Multiple" /> 和模糊距离。

### CAD 多段线宽度怎么改？

选择 <Keyword id="Width" /> 并输入宽度：所有线段都使用这个宽度。只修改一段时，使用 <Keyword id="Edit vertex" />，把标记移到该段起点所在的顶点，然后选择其 <Keyword id="Width" />。

### CAD 多段线怎么变圆滑曲线？

<Keyword id="Fit" /> 使圆弧通过每个顶点；<Keyword id="Spline" /> 生成一条以顶点为框架、更光滑的曲线。<Keyword id="Decurve" /> 再把它拉直。
