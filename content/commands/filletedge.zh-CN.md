---
title: "AutoCAD FILLETEDGE（圆角边）命令"
metaTitle: "CAD 三维实体倒圆角：FILLETEDGE（圆角边）用法"
description: "CAD 三维倒圆角怎么用：按提示顺序讲解 AutoCAD 的 FILLETEDGE 如何将三维实体的边倒圆：边、链、环、半径和箭头夹点。在浏览器中免费试用。"
figure: "从东南方向观察的长方体：FILLETEDGE 以半径 8 将其右侧两条竖直边倒圆。"
sourceHash: "403a055efb24"
---

FILLETEDGE（圆角边）命令将三维实体的边倒圆。命令先显示当前半径，然后询问边，直到按 Enter 键：单击选择光标下的边（光标经过时边会亮显），输入一个点则选择穿过该点的边。每选择一条边，实体就按完成后的样子绘制，圆角已在其位置上。按 Enter 键后，命令统计边数，并提示再按一次 Enter 键接受，或修改半径；这次按 Enter 键即生成圆角。只能选择同一个实体的边：其他实体的边显示 <Message id="filletMultipleBodies" />，重复选择的边显示 <Message id="edgeAlreadyPicked" />。

两个平面之间的直边变为四分之一圆柱面，孔或边缘的圆形边变为四分之一圆环面；在角上相接的圆角会连接起来，三个圆角之间用一块球面连接。半径保存在图形中，下次再次提供。实体保留其图层和特性，但失去其创建方式：长方体不再是长方体。整个命令是一步放弃。MellowCAD 的三维只有实体，且仍是部分支持。

## Options

### Chain

选择拾取的边以及与之相切的所有边，一条接一条：例如竖直边已倒圆的块体顶部周围的八条边。没有相切的边时，显示 <Message id="noTangentChainEdges" />，只选择拾取的那条边。<Keyword id="Edge" /> 返回到逐条选择边。

### Loop

选择一个面周围的所有边：拾取一条边，然后对显示的环选择 <Keyword id="Accept" />，或选择 <Keyword id="Next" /> 改为该边所属另一个面的环。

### Radius

询问半径，可以输入，也可以用两点之间的距离指定；0 或更小的值显示 <Message id="radiusTooSmall" />。<Keyword id="Expression" /> 用公式指定半径。在接受提示下，它修改所显示圆角的半径。第一个圆角中间的箭头夹点可以通过拖动设置半径：单击夹点，移动，再单击；<Keyword id="eXit" /> 或 Esc 键则保持原样。

## Missing

两个半径不同的圆角相接，以及结束于曲面上的圆角。比相邻面还宽的圆角（AutoCAD 会使其越过下一条边）：这里会因建模错误而失败。曲面旁边的直边、偏离其圆柱轴线的圆形边，以及球体、圆环体、拉伸实体或旋转实体的任何边，也会以同样方式失败。在不同坡度的边上相接的某些圆角转角。除第一条边以外其他边上的箭头夹点，以及从夹点到光标的连线。用 <Command id="FILLET" /> 拾取实体的边（AutoCAD 也允许这样做）。拾取时以网格绘制的圆角预览，以及曲面。

## Questions

### CAD 三维实体的边怎么倒圆角？

执行 FILLETEDGE，选择 <Keyword id="Radius" /> 并输入半径，拾取边，然后按两次 Enter 键：第一次结束拾取，第二次接受圆角。示例中的 `8` 将长方体的两条边倒圆。

### CAD 怎么给一个面的所有边倒圆角？

选择 <Keyword id="Loop" />，拾取该面的一条边，然后选择 <Keyword id="Accept" />；如果显示的是另一个面的环，则选择 <Keyword id="Next" />。对于彼此相切相连的边（例如已倒圆的块体顶部），<Keyword id="Chain" /> 可以一次全部选中。

### CAD 三维实体为什么不能用 FILLET 倒圆角？

AutoCAD 的 <Command id="FILLET" /> 也能将实体的边倒圆，但 MellowCAD 的 FILLET 还不能：请使用 FILLETEDGE；倒斜角请使用 <Command id="CHAMFEREDGE" />。

### CAD 圆角半径怎么修改？

在拾取边之前或在接受提示下选择 <Keyword id="Radius" />，或拖动第一个圆角中间的箭头夹点。下次会再次提供上一次的半径。
