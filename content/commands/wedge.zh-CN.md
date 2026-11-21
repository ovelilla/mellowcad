---
title: "AutoCAD WEDGE（楔体）命令"
metaTitle: "CAD三维楔体怎么画：WEDGE 命令与快捷键 WE"
description: "AutoCAD WEDGE（楔体，快捷键 WE）怎么画三维实体楔体：按提示顺序说明两个角点和高度、中心、立方体、长度和两点。在浏览器中免费试用。"
figure: "用两个角点和高度创建的 60 × 40 × 25 楔体，斜面从第一个角点一端向下倾斜，以“隐藏”视觉样式从东南方向观察。"
sourceHash: "06fba2eeb7be"
---

WEDGE（楔体）命令创建三维实体楔体：顶面从一端向另一端向下倾斜的长方体。它的询问与 <Command id="BOX" /> 相同：第一个角点、其他角点，然后是高度。高的一端在第一个角点处，斜面沿 UCS 的 X 方向向另一个角点一侧下降；另一个角点的 X 值较小时，楔体反向。高度沿 UCS 的 Z 方向升高，为负值时向下。长度、宽度和高度采用 <Command id="BOX" /> 的默认值，按 Enter 键即采用。楔体位于当前图层上，放弃一步即可撤销。

<Command id="LIST" /> 显示其位置、长度、宽度、高度和旋转，在“特性”选项板中可以输入这些值。其夹点与 <Command id="BOX" /> 的相同。它是三维实体，可以用于 <Command id="UNION" />、<Command id="SUBTRACT" /> 和 MellowCAD 的其他三维功能；MellowCAD 的三维只有实体，并且仍不完整。<Command id="EXPLODE" /> 将其每个面分解为一个面域。

## Options

### Center

在第一个提示下：询问中心点，然后询问角点、<Keyword id="Cube" /> 或 <Keyword id="Length" />。楔体以该点为中心，高度方向也是如此，其高的一端位于所给角点的对面。

### Cube

在其他角点提示下：询问长度，创建各边都等于该长度的楔体。与 <Command id="BOX" /> 的不同，它沿 UCS 的 X 方向延伸，为负值时反向。

### Length

在其他角点提示下：询问长度（沿 UCS 的 X 方向），然后询问宽度（沿其 Y 方向）；为负值时反向。指定点时只取其距离，从不取其方向。

### 2Point

在高度提示下：询问两点，高度为两点之间的距离。

## Missing

与 <Command id="BOX" /> 相同：热夹点没有移动、旋转、缩放和镜像，没有相应的三维命令，指定角点时没有虚线尺寸，也没有 <Command id="VSCURRENT" /> 缺少的视觉样式。在平面视图中，高的一端下方的端点捕捉找到的是顶面的角点，而 AutoCAD 找到的是底面的角点。

## Questions

### CAD楔体的快捷键是什么？

`WE`。输入后按 Enter 键或空格键，然后指定第一个角点、其他角点和高度：输入 `0,0`、`60,40` 和 `25`，即得到演示中的楔体。

### CAD楔体的斜面朝哪个方向？

从第一个角点一端沿 UCS 的 X 方向向下倾斜。要改变方向，请在 X 值较小的位置指定其他角点，使其旋转 180°；或在之后用 <Command id="ROTATE" /> 旋转它。

### CAD三棱柱怎么画？

楔体就是一种三棱柱：两端各是一个直角三角形，沿宽度方向延伸。其他三角形，请用 <Command id="PLINE" /> 画成闭合图形，再用 <Command id="EXTRUDE" /> 拉伸。

### CAD怎么从中心画楔体？

选择 <Keyword id="Center" /> 并指定中心点，然后指定角点、<Keyword id="Cube" /> 或 <Keyword id="Length" />：楔体以该点为中心，高度方向也是如此。
