---
title: "AutoCAD UCSICON（UCS 图标）命令"
metaTitle: "CAD坐标图标怎么关闭：UCSICON（UCS 图标）"
description: "AutoCAD UCSICON 怎么显示或隐藏 UCS 图标，并将其放在原点或角落：开、关、非原点、原点，以及图标显示的内容。在线免费试用。"
figure: "UCSICON 非原点将图标移到角落；UCS 将原点移到块的台阶上，原点选项则在该处显示图标，X 为红色，Y 为绿色，Z 为蓝色。"
sourceHash: "c431e70eda01"
---

UCSICON（UCS 图标）命令显示或隐藏 UCS 图标，即表示当前 UCS 的位置和方向的 X、Y 轴，并说明图标的位置：位于 UCS 的原点，或位于图形的左下角。它唯一的提示以当前状态作为默认值，按 Enter 键即保持不变。该设置保存在图形中，每次 UCSICON 是一个放弃步骤。

该图标是 AutoCAD 2027 的三维样式图标：一条 X 轴和一条 Y 轴，各端有一个字母；UCS 为世界坐标系时，原点处有一个方框。在非平面视图中，Z 轴显示 UCS 的 Z 方向，沿视线方向的轴则不显示。在“二维线框”中图标为白色；在“隐藏”和“概念”中，X 为红色，Y 为绿色，Z 为蓝色。加撇号输入 `'UCSICON`，则改为设置 UCSICON 系统变量，即使在其他命令中也可以：取值 0 到 3，其中 1 显示图标，2 将其放在原点。

## Options

### ON

显示图标。

### OFF

隐藏图标。UCS 仍然存在，绘制的对象仍位于其中。

### Noorigin

无论原点在何处，都将图标保持在图形的左下角。

### ORigin

在 UCS 的原点显示图标，这是默认设置。原点位于屏幕之外，或离屏幕边缘太近而放不下图标时，图标移到左下角，直到原点重新出现在视图中。

## Missing

没有“全部”（在 AutoCAD 中将设置应用于所有视口；这里只有一个视口）、“可选”（图标的夹点）和“特性”（“UCS 图标”对话框，包括二维样式、大小、线宽和颜色）。

## Questions

### CAD坐标图标怎么关闭？

输入 `UCSICON`，按 Enter 键，然后选择 <Keyword id="OFF" />。<Keyword id="ON" /> 将其重新显示。

### CAD坐标图标怎么移到原点？

执行 UCSICON，然后选择 <Keyword id="ORigin" />：图标位于 UCS 的原点上。如果图标仍在角落，说明原点在屏幕之外或离边缘太近：请平移或缩小视图。<Keyword id="Noorigin" /> 将图标保持在角落。

### CAD坐标图标上的方框是什么意思？

表示 UCS 是世界坐标系。用 <Command id="UCS" /> 移动或旋转 UCS，方框就会消失；执行 <Command id="UCS" /> 并按 Enter 键，恢复世界坐标系，方框也随之出现。

### CAD坐标图标的样式、大小或颜色怎么改？

在 AutoCAD 中，使用 UCSICON 的“特性”，即“UCS 图标”对话框。MellowCAD 尚无该对话框：图标按 AutoCAD 2027 的默认样式（三维样式）显示。
