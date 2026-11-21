---
title: "AutoCAD REVOLVE（旋转）命令"
metaTitle: "CAD旋转成实体命令（REVOLVE）用法与快捷键 REV"
description: "AutoCAD REVOLVE（旋转，快捷键 REV）怎么用：按提示顺序说明如何将二维轮廓绕轴旋转成三维实体，轴、对象、X、Y、Z。在浏览器中免费试用。"
figure: "带凸缘的轮廓绕 Y 轴旋转一整圈形成的线轴，以“隐藏”视觉样式从东南方向观察。"
sourceHash: "dc0576311912"
---

REVOLVE（旋转）命令将闭合的二维轮廓绕轴旋转成三维实体：一条边位于轴上的矩形生成圆柱体，轴旁的圆生成圆环。选择轮廓（圆、椭圆、闭合的多段线或样条曲线、面域）并按 Enter 键；用两点或某个选项指定轴，然后指定角度，按 Enter 键旋转一整圈。每个轮廓变为当前图层上的一个实体，并按 DELOBJ 的默认设置被删除。整个命令是一个可以放弃的步骤。

轴位于轮廓所在的平面内，整个轮廓位于轴的一侧；否则，在询问角度之前命令就以 <Message id="revolveOneSide" /> 结束。角度按右手定则绕轴旋转，方向从轴的第一点指向第二点；负角度朝反方向旋转。MellowCAD 的三维只有实体，并且仍不完整：AutoCAD 会将开放轮廓旋转成曲面，这里会拒绝开放轮廓。

## Options

### MOde

与 <Command id="EXTRUDE" /> 一样，询问 <Keyword id="SOlid" /> 还是 <Keyword id="SUrface" />：由于尚无曲面对象，只接受默认值 <Keyword id="SOlid" />。

### Object

轴提示的默认值，按 Enter 键即选择它：拾取直线、多段线、圆弧或样条曲线，轴为其两个端点之间的直线，从靠近拾取点的端点开始。闭合对象没有端点：显示 <Message id="revolveClosedAxis" />，命令结束。

### X

UCS 的 X 轴，通过其原点。

### Y

UCS 的 Y 轴，通过其原点：像演示中那样画在它右侧的轮廓，旋转后成为沿 Y 方向放置的零件。

### Z

UCS 的 Z 轴，通过其原点。位于 UCS 的 XY 平面上的轮廓与它垂直，因此 REVOLVE 显示 <Message id="revolvePerpendicular" /> 并结束：Z 用于竖立的轮廓。

### STart

在角度提示下指定起点角度，其默认值始终为 0。轮廓先旋转到该角度，然后再次询问角度。

### Reverse

反转轴的方向，使角度朝反方向旋转，然后再次询问角度。

### EXpression

与 <Command id="EXTRUDE" /> 中一样，用算术表达式指定角度。

## Missing

轴不在轮廓所在的平面内时，AutoCAD 会将轮廓旋转成曲面：这里 REVOLVE 显示 <Message id="revolveUnable" /> 并结束。不能用椭圆弧或实体的边作为“对象”轴。没有曲面模式，也不接受开放轮廓，因为尚无曲面对象。预览不随光标旋转：指定角度时显示的是一整圈。不能对旋转生成的实体执行 <Command id="EXPLODE" />（AutoCAD 会将其分解为曲面和面域）。没有它的夹点，也不能在“特性”选项板中编辑其角度。

## Questions

### CAD旋转成实体的快捷键是什么？

输入 `REV`，然后按 Enter 键或空格键。也可以输入完整的命令名；在任何语言版本的 AutoCAD 中，`_REVOLVE` 都有效。

### CAD怎么把轮廓绕轴旋转成三维实体？

在轴线旁边把截面的一半画成一个闭合对象，例如闭合多段线或面域。执行 REVOLVE，选择轮廓并按 Enter 键；再按 Enter 键选择 <Keyword id="Object" /> 并拾取轴线，或指定轴的两个端点；然后按 Enter 键旋转一整圈。

### CAD旋转成实体为什么不成功？

最常见的原因是轴穿过了轮廓：REVOLVE 显示 <Message id="revolveOneSide" /> 并结束。请把轴移到轮廓的边上或轮廓之外；轮廓的一条边位于轴上是允许的。轴与轮廓所在平面垂直时，显示 <Message id="revolvePerpendicular" />；开放轮廓会被拒绝，因为 MellowCAD 尚无曲面。

### CAD怎么只旋转一部分角度？

在角度提示下输入角度，例如 90 或 270。<Keyword id="STart" /> 让旋转从更靠后的角度开始，<Keyword id="Reverse" /> 让它朝反方向旋转。
