---
title: "AutoCAD REGION（面域）命令"
metaTitle: "CAD 面域命令（REGION）怎么用与快捷键 REG"
description: "AutoCAD REGION（面域，快捷键 REG）怎么把闭合图形转换为面域：它查找哪些环，为什么创建不了面域，面域有什么用。在浏览器中免费试用。"
figure: "首尾相接闭合的四条直线和其中的一个圆：用窗口框选两者后执行 REGION，创建两个面域并删除原对象。"
sourceHash: "69a5423c3d5c"
---

REGION（面域）命令将闭合图形转换为面域：面域是没有厚度的平面区域，每个面域由其环围成。选择对象并按 Enter 键，对象构成的每个环都成为一个面域。闭合对象本身就是一个环：圆、椭圆、闭合的多段线或样条曲线。开放对象（直线、圆弧、椭圆弧、开放的多段线和样条曲线）按端点首尾相连，不会在相交处相连；不闭合的链会被舍弃。随后命令行报告找到的环数、拒绝的环数及原因，以及创建的面域数；不选择任何对象就按 Enter 键，显示 <Message id="regionNoneFound" />。

构成面域的对象被删除，其他对象保留；面域使用当前图层和特性，而不是原对象的。一个环位于另一个环内部时，生成独立的面域，而不是在外面域上开孔：可以用 <Command id="SUBTRACT" /> 从一个面域中减去另一个。面域显示为其边，并可捕捉其边；“特性”选项板显示其面积和周长，<Command id="AREA" />、<Command id="LIST" /> 和 <Command id="MASSPROP" /> 也可以测量。<Command id="UNION" />、<Command id="SUBTRACT" /> 和 <Command id="INTERSECT" /> 合并同一平面上的面域，<Command id="EXTRUDE" />、<Command id="REVOLVE" /> 和 <Command id="PRESSPULL" /> 将面域变为三维实体，<Command id="EXPLODE" /> 将其还原为直线、圆弧和圆。整个命令是一个放弃步骤。

## Missing

没有 AutoCAD 的 `DELOBJ`：构成面域的对象总是被删除。没有 BOUNDARY（可以根据一点周围的区域创建面域），也不能根据图案填充的边界创建面域。不能用夹点编辑面域：夹点会显示，但拖动不起作用。在快速模式下，面域的边不能用作 <Command id="TRIM" /> 的剪切边或 <Command id="EXTEND" /> 的边界边；带有椭圆边或样条曲线边的面域不能用 <Command id="HATCH" /> 填充。MellowCAD 没有曲面，因此面域不能与曲面合并；“特性”选项板中也没有“材质”一行。

## Questions

### CAD 面域命令怎么用？

执行 REGION（或输入 `REG`），选择闭合图形，或首尾相接可以闭合的直线，然后按 Enter 键。在本页的演示中，用窗口框选四条直线和一个圆，创建两个面域，命令行报告已提取 2 个环、已创建 2 个面域。

### CAD 面域创建不了是什么原因？

图形没有首尾相接地闭合。相交的直线，或彼此没有接上的直线，都不能闭合：REGION 只按端点连接开放对象，哪怕一丝间隙也会舍弃整条链。自相交的环（例如蝴蝶结形）会被拒绝，并计入自交的数目。可以用半径为 0 的 <Command id="FILLET" /> 连接端点，或用 <Command id="TRIM" /> 修剪多出的部分，然后重试。

### CAD 怎么做带孔的面域？

分别为外轮廓和孔创建面域，然后执行 <Command id="SUBTRACT" />：选择外轮廓，按 Enter 键，再选择孔，按 Enter 键。结果是一个面域，用 <Command id="EXTRUDE" /> 可以将其变为带通孔的实体。

### CAD 怎么查面域的面积？

选择面域，在“特性”选项板中查看“面积”；或执行 <Command id="AREA" />，选择 <Keyword command="AREA" id="Object" /> 并拾取面域。<Command id="MASSPROP" /> 还会给出周长、质心和惯性矩。
