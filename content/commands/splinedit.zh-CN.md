---
title: "AutoCAD SPLINEDIT（编辑样条曲线）命令"
metaTitle: "CAD编辑样条曲线（SPLINEDIT）用法与快捷键 SPE"
description: "AutoCAD SPLINEDIT（编辑样条曲线，快捷键 SPE）怎么用：按提示顺序说明闭合、合并、拟合数据、编辑顶点、转换为多段线和反转。在浏览器中免费试用。"
figure: "通过五个拟合点的样条曲线，用 SPLINEDIT 闭合后：成为通过所有点的光滑闭合环。"
sourceHash: "bedcaab2fac3"
---

SPLINEDIT（编辑样条曲线）命令编辑样条曲线。在 `Select spline:` 提示下拾取一条，或在命令前选择它；双击样条曲线也会对其执行 SPLINEDIT。选择其他对象时显示 <Message id="objectNotSpline" /> 并再次询问；用 PEDIT 的“样条曲线”拟合过的多段线会不加提示地转换为同一曲线的样条曲线。然后反复询问选项，每个选项立即生效，直到选择 <Keyword id="eXit" /> 或按 Enter 键。样条曲线显示其拟合点的夹点；编辑顶点时，显示其控制点和控制框架。整个编辑是一个可以用 <Command id="U" /> 放弃的步骤。在其任何提示下都可以输入 `'ZOOM`。

## Options

### Close

光滑地闭合样条曲线：拟合样条曲线通过其拟合点闭合，控制点样条曲线在其顶点上闭合。对于闭合的样条曲线，该选项为 <Keyword id="Open" />，并且不提供“合并”。

### Join

按 JOIN 对样条曲线的规则，合并与其端点相接的开放曲线，并报告合并了多少条。

### Fit data

编辑样条曲线经过的点。控制点样条曲线没有拟合点，因此先在其曲线上为其生成拟合点。其选项：<Keyword id="Add" /> 拾取一个拟合点并在其后反复添加新点（在开放样条曲线的第一个点处，选择 <Keyword id="After" /> 或 <Keyword id="Before" />）；<Keyword id="Delete" /> 删除拟合点，最少保留两个，闭合样条曲线保留三个（<Message id="cannotDeleteBeyond" />）；<Keyword id="Move" /> 用 <Keyword id="Next" /> 和 <Keyword id="Previous" /> 或 <Keyword id="Select point" /> 逐个切换拟合点，并将当前点移到指定的点；<Keyword id="Purge" /> 清除拟合数据，留下控制点样条曲线；<Keyword id="Tangents" /> 设置起点和端点方向，或 <Keyword id="System default" />；<Keyword id="Close" /> 和 <Keyword id="eXit" /> 与第一个提示中相同。拾取的不是拟合点时，显示 <Message id="notAFitPoint" />。

### Edit vertex

编辑控制点；拟合样条曲线在第一次编辑时失去其拟合数据。<Keyword id="Add" /> 在样条曲线上拾取的点处添加一个顶点；<Keyword id="Delete" /> 删除一个顶点，最少保留两个，闭合样条曲线保留三个；<Keyword id="Elevate order" /> 提高阶数，最高 26，不能降低；<Keyword id="Move" /> 移动顶点，切换方式与拟合数据的“移动”相同；<Keyword id="Weight" /> 设置顶点的权值，先显示 <Message id="splineMadeRational" />，使曲线更靠近或更远离该顶点。拾取的不是顶点时，显示 <Message id="notAControlVertex" />。

### convert to Polyline

询问 0 到 99 之间的精度，默认值为 10，并用由直线段组成的多段线替换样条曲线，精度越高，段数越多；样条曲线不平放在与 XY 平面平行的平面上时，得到三维多段线。它会结束命令。精度在本次会话中保留，PEDIT 的转换也使用它。

### Reverse

反转样条曲线的方向，第一个点变为最后一个：<Message id="splineReversed" />。

### Undo

放弃上一个选项，整个“拟合数据”或“编辑顶点”一次放弃。没有可放弃的内容时：<Message id="commandCompletelyUndone" />。

### eXit

结束命令，与按 Enter 键相同。

## Missing

没有“扭折”（在拟合点或顶点处形成尖角）、“公差”（在公差范围内重新拟合样条曲线），也没有闭合样条曲线的“切线”。“转换为多段线”从拟合样条曲线生成的顶点比 AutoCAD 多得多，从不生成圆弧，并且总是替换样条曲线。`Select spline:` 提示下没有“编组”。逐个切换点时，AutoCAD 在当前点上绘制的 `+` 标记没有提供。

## Questions

### CAD编辑样条曲线的快捷键是什么？

输入 `SPE`，然后按 Enter 键或空格键。也可以输入完整的命令名；在任何语言版本的 AutoCAD 中，`_SPLINEDIT` 都有效。双击样条曲线也会执行它。

### CAD样条曲线怎么转换成多段线？

执行 SPLINEDIT，拾取样条曲线并选择 <Keyword id="convert to Polyline" />；精度为 10 时得到光滑的多段线。对样条曲线执行 <Command id="PEDIT" />，也会提出将其转换。

### CAD样条曲线怎么添加或移动点？

选择 <Keyword id="Fit data" /> 编辑它经过的点，然后选择 <Keyword id="Add" /> 或 <Keyword id="Move" />。选择 <Keyword id="Edit vertex" /> 编辑构成其框架的控制点。

### CAD样条曲线怎么闭合？

选择 <Keyword id="Close" />：样条曲线光滑地闭合，在首尾相接处没有尖角。<Keyword id="Open" /> 将其重新打开。

### CAD两条样条曲线怎么合并？

选择 <Keyword id="Join" />，然后选择端点与该样条曲线相接的样条曲线；或使用 <Command id="JOIN" />。
