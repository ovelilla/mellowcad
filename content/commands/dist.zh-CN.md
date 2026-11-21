---
title: "AutoCAD DIST（距离）命令"
metaTitle: "CAD 测量距离命令（DIST）用法与快捷键 DI"
description: "CAD 怎么测量距离：AutoCAD 的 DIST（快捷键 DI）用法，两点间的距离及其角度和 X、Y、Z 增量，或一串点的总长度。在浏览器中免费试用。"
figure: "沿 100 × 60 板的对角线执行 DIST：距离、XY 平面中的角度和各增量。"
sourceHash: "31fbe420bc43"
---

DIST（距离）命令测量两点之间的距离。拾取、捕捉或输入第一个点和第二个点，命令在命令行中写出距离、XY 平面中的倾角、与 XY 平面的夹角，以及 X、Y、Z 增量，然后结束。每个点都按其实际位置（包括 Z 值）测量，因此得到的是空间中的真实距离。在第一个点提示下按 Enter 键，从上一个指定的点开始；在第二个点提示下按 Enter 键，测量回到第一个点的距离。数值按图形的精度显示，角度按 AUPREC 显示。

## Options

### Multiple

在第二个点提示下选择 <Keyword id="Multiple" />：测量一串点而不是一段距离，每指定下一个点之前都会写出累计距离，并显示在光标上方，直到按 Enter 键或选择 <Keyword id="Total" />。

### Arc

改为沿圆弧测量，使用 PLINE 的圆弧选项：<Keyword id="Angle" />、<Keyword id="Center" />、<Keyword id="Close" />、<Keyword id="Direction" />、<Keyword id="Line" />、<Keyword id="Radius" />、<Keyword id="Second pt" />、<Keyword id="Undo" />。每段圆弧的长度都计入累计距离。

### Close

回到第一个点，加上最后这一段，写出总计，然后结束。

### Length

沿上一段的方向加上一段输入长度的距离。

### Undo

放弃这一串中的最后一个点。

### Total

写出这一串的总计，然后结束；按 Enter 键效果相同。

## Missing

MEASUREGEOM，即功能区中的“测量”工具，它在一个循环中使用 DIST 的提示，并提供半径、角度、面积、体积和快速选项：这里功能区的“距离”按钮执行 DIST。在“圆弧”选项的 <Keyword id="Center" /> 下，包含角按度读取，而 AutoCAD 2027 会将在此输入的数值读作沿光标方向的距离。

## Questions

### CAD 测量距离的快捷键是什么？

输入 `DI`，然后按 Enter 键或空格键。也可以输入完整命令名，在任何语言版本的 AutoCAD 中都可以输入 `_DIST`。

### CAD 怎么测量两点之间的距离？

输入 `DI`，然后拾取两个点，可以用对象捕捉捕捉到对象的端点或圆心。距离连同角度和增量写在命令行中。

### CAD 怎么测量多条线段的总长度？

在第二个点提示下选择 <Keyword id="Multiple" />，然后继续拾取点：每个点处都会显示累计距离，按 Enter 键写出总计。

### CAD 三维怎么测量距离？

指定带 Z 值的点，或捕捉到位于各自高度的对象：DIST 测量空间中的真实距离，并写出与 XY 平面的夹角和 Z 增量。

### CAD 中 DIST 显示的小数位数不够怎么办？

长度按图形的精度显示，这里新图形为两位小数。可以在 <Command id="UNITS" /> 中设置更多位数，最多八位。
