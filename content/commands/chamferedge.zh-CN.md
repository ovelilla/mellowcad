---
title: "AutoCAD CHAMFEREDGE（倒角边）命令"
metaTitle: "CAD 三维倒角边命令（CHAMFEREDGE）怎么用"
description: "CAD 三维实体怎么倒角？CHAMFEREDGE 按提示顺序讲解：一个面上的边、环、距离 1 和距离 2，为三维实体的边倒角。在浏览器中免费试用。"
figure: "从东南方向观察的长方体：CHAMFEREDGE 以两个距离均为 6，对前角处的两条顶边倒角，两个倒角交于一条线。"
sourceHash: "43b1908ad4b3"
---

CHAMFEREDGE（倒角边）命令为三维实体的边倒角。命令先显示当前的两个距离，然后要求选择一条边，选择第一条之后继续选择同一个面上的其他边，直到按 Enter 键：单击选择光标下的边，输入一个点则选择通过该点的边。与已选的边不共享面的边会显示 <Message id="edgesOneFace" />，属于另一个实体的边会显示 <Message id="chamferMultipleBodies" />。选择边的同时，实体按倒角后的样子显示。然后按 Enter 键，命令要求再按一次 Enter 键接受倒角，或者为本次倒角更改距离；这次按 Enter 键即完成倒角。

第一个距离沿各边共有的面量取；只有一条边时，沿 AutoCAD 所取的面量取：长方体的前顶边取前面，圆柱体的边缘取顶面。两个平面之间的直边变为一条平面带，孔或边缘的圆边变为一段圆锥面，在角上相遇的倒角交于一条线。下次运行时会再次提供这些距离。实体保留其图层和特性，但失去其创建方式：长方体不再是长方体。整个命令是一个放弃步骤。MellowCAD 的三维仅限实体，目前仍不完整。

## Options

### Loop

选择一个面周围的所有边：拾取一条边，然后选择 <Keyword id="Accept" /> 接受显示的环，或选择 <Keyword id="Next" /> 切换到该边所属另一个面的环。<Keyword id="Edge" /> 返回单条边的选择。

### Distance

要求输入第一个距离，然后输入第二个距离，每个距离可以输入数值，也可以用两点之间的距离指定；0 或更小的值会显示 <Message id="distanceTooSmall" />。<Keyword id="Expression" /> 以公式输入距离。在接受提示下，它要求输入基面的距离和其他曲面的距离，仅用于本次倒角。

## Missing

三条倒角边交汇的角。与曲面相邻的直边、偏离圆柱体轴线的圆边，以及球体、圆环体、拉伸实体或旋转实体的任何边：这里会因建模错误而失败。AutoCAD 在接受提示下显示的两个箭头夹点，每个距离一个。用 <Command id="CHAMFER" /> 拾取实体的边，AutoCAD 也允许这样做。拾取时以网格显示的倒角，以及曲面。

## Questions

### CAD 三维实体的边怎么倒角？

运行 CHAMFEREDGE，选择 <Keyword id="Distance" /> 并输入两个距离，拾取一个面上的边，然后按两次 Enter 键：一次结束拾取，一次接受倒角。示例中的 `6` 和 `6` 对长方体的两条顶边倒角。

### CAD 中 CHAMFEREDGE 为什么提示边必须属于同一个面？

一次倒角的各条边共享一个面：第一个距离沿该面量取。另一个面上的边请在第二次运行中倒角。

### CAD 三维实体为什么用 CHAMFER 倒不了角？

AutoCAD 的 <Command id="CHAMFER" /> 也可以为实体的边倒角，但 MellowCAD 的还不能：请使用 CHAMFEREDGE；要为边倒圆角，请使用 <Command id="FILLETEDGE" />。

### CAD 孔的边怎么倒角？

在孔与平面相交处拾取其圆边：倒角是围绕孔的一段圆锥面。
