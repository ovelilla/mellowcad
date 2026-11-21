---
title: "CAD 练习图：圆桌和椅子"
metaTitle: "CAD 平面图练习：圆桌和 6 把椅子"
description: "AutoCAD 平面图练习：先画一把椅子，再绕圆桌中心环形阵列出 6 把，并标注尺寸。附分步解答，可免费在线练习。"
figure: "直径 120 的圆桌和 6 把椅子的平面图，尺寸单位为 cm。"
sourceHash: "1e307bf5e17a"
---

绘制直径 120 的圆桌和 6 把椅子（单位：cm）：每把椅子由 44 × 40、圆角半径 4 的座面和深 8 的靠背组成，座面前沿距桌边 8。在桌子上方画一把椅子，再用环形阵列放置全部 6 把。本图形的标注比例已按厘米设置。

## Steps

### 绘制桌子 [#table]

在“轮廓线”图层上，用 <Command id="CIRCLE" />（圆）命令在 `0,0` 处画圆，<Keyword command="CIRCLE" id="Diameter" /> 为 `120`。

### 绘制椅子 [#chair]

在桌子上方画座面：用 <Command id="RECTANG" />（矩形）命令，将 <Keyword command="RECTANG" id="Fillet" /> 设为 `4`，从 `-22,68` 画到相对其 `44,40` 处。然后将圆角改回 `0`，画靠背：从 `-22,108` 画到相对其 `44,8` 处。<Command id="RECTANG" /> 命令会保留圆角半径，直到再次修改。

### 阵列椅子 [#array]

<Command id="ARRAYPOLAR" />（环形阵列）命令：选择座面和靠背，按 Enter 键，指定桌子的中心 `0,0`，然后选择 <Keyword command="ARRAYPOLAR" id="Items" /> 并输入 `6`。每把椅子在放置时随之旋转，因此 6 把椅子都朝向桌子。

### 标注尺寸 [#dimensions]

在“标注”图层上，用 <Command id="DIMDIAMETER" />（直径）命令标注桌子，放在圆内；再用 <Command id="DIMLINEAR" />（线性）命令标注上方椅子的宽度 44，以及含靠背的深度 48。
