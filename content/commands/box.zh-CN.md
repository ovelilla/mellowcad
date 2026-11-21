---
title: "AutoCAD BOX（长方体）命令"
metaTitle: "CAD长方体命令（BOX）怎么画：三维长方体与选项"
description: "CAD三维长方体怎么画？BOX 按提示顺序讲解：两个角点和高度，以及中心、立方体、长度和两点选项。在浏览器中免费试用。"
figure: "长 60、宽 40、高 25 的长方体，由两个角点和高度绘制，在隐藏视觉样式下从东南方向观察。"
sourceHash: "46936b3da48e"
---

BOX（长方体）命令绘制各边沿 UCS 轴方向的三维实体长方体：指定第一个角点、其他角点，然后指定高度。高度沿 UCS 的 Z 轴向上，负值向下；指定一个点时，高度为该点到角点的距离；其他角点的 Z 值与第一个角点不同时，由它确定高度，不再询问。上次的高度，以及立方体或长度选项上次的长度和宽度，作为默认值提供，按 Enter 键即可采用，与其他基本实体和 <Command id="EXTRUDE" /> 命令共用。长方体位于当前图层上，放弃可以一步撤销。

长方体保留其尺寸：<Command id="LIST" /> 命令显示其位置、长度、宽度、高度和旋转角度，在“特性”选项板中可以输入前四项。夹点可以移动和拉伸长方体，不在平面视图中时还可以设置其高度。它是一个三维实体，可用于 <Command id="UNION" />、<Command id="SUBTRACT" /> 以及 MellowCAD 的其他三维功能；MellowCAD 的三维仅限实体，目前仍不完整。

## Options

### Center

在第一个提示下：要求指定中心点，然后指定一个角点，或选择 <Keyword id="Cube" /> 或 <Keyword id="Length" />。长方体以该点为中心，高度方向也居中。

### Cube

在指定其他角点时：要求输入一个长度（输入数值或用光标指定），绘制各边都为该长度的立方体。输入的长度朝向光标方向，负值则背离光标。

### Length

在指定其他角点时：要求输入长度，然后输入宽度。长度朝向光标方向，因此长方体可以倾斜放置；宽度朝向光标所在的一侧。

### 2Point

在指定高度时：要求指定两个点，高度为两点之间的距离。

## Missing

热夹点的移动、旋转、缩放和镜像，AutoCAD 中按 Enter 键循环切换。三维专用命令（3DMOVE、3DROTATE、3DSCALE、MIRROR3D、ROTATE3D、ALIGN、3DALIGN）及其小控件，以及逐个移动其面、边和顶点。动态 UCS。指定角点、长度和宽度时 AutoCAD 绘制的虚线尺寸。用 <Command id="FILLET" /> 和 <Command id="CHAMFER" /> 处理其边，这里由 <Command id="FILLETEDGE" /> 和 <Command id="CHAMFEREDGE" /> 完成。实体历史记录的“记录历史”和“显示历史”，以及“材质”行。<Command id="VSCURRENT" /> 在二维线框、隐藏和概念之外缺少的视觉样式。

## Questions

### CAD三维长方体怎么画？

运行 BOX 命令，指定一个角点，然后指定对角点，再指定高度：`0,0`、`60,40` 和 `25` 即绘制出示例中的长方体。用 <Keyword id="Length" /> 和宽度代替对角点，可以使长方体转到任意角度。

### CAD画的长方体为什么看起来是矩形？

因为是从上方、在平面视图中观察。请转动视图：单击 ViewCube 的一个角，或使用 <Command id="-VIEW" /> 和 <Keyword command="VIEW" id="SEiso" />，或使用 <Command id="3DORBIT" />。<Command id="VSCURRENT" /> 的 <Keyword command="VSCURRENT" id="Hidden" /> 可以隐藏后面的边。

### CAD怎么画立方体？

指定第一个角点，然后选择 <Keyword id="Cube" /> 并输入边长。

### CAD怎么从中心画长方体？

选择 <Keyword id="Center" /> 并指定中心点，然后指定一个角点，或选择 <Keyword id="Cube" /> 或 <Keyword id="Length" />：长方体以该点为中心，高度方向也居中。
