---
title: "CAD 练习图：L 形支架"
metaTitle: "CAD 入门练习图：L 形支架"
description: "适合 CAD 入门的 AutoCAD 练习图：用相对坐标画出 L 形支架的轮廓、圆角和两个孔，并进行基线标注。附分步解答，可免费在线练习。"
figure: "100 × 80 的 L 形支架，尺寸从左下角起标注。"
sourceHash: "5c7cd5d57c92"
---

按以下尺寸绘制支架（单位：mm）：总长 100；底板高 20；立板宽 30、高 80；内角倒圆角，半径 10；底板上有一个直径 8 的孔，立板上有一个直径 10 的孔，各位于所在部分的中间。轮廓用一次 <Command id="LINE" />（直线）命令画出，每一点都以相对上一点的距离输入；所有尺寸都从左下角起标注。

## Steps

### 绘制轮廓 [#outline]

在“轮廓线”图层上，用 <Command id="LINE" /> 命令从 `0,0` 起，之后每一点都以相对上一点的位移输入：`100,0`、`0,20`、`-70,0`、`0,60`、`-30,0`。<Keyword command="LINE" id="Close" /> 选项画出回到起点的最后一条边并结束命令。

### 内角倒圆角 [#fillet]

<Command id="FILLET" />（圆角）命令：选择 <Keyword command="FILLET" id="Radius" /> 选项，输入 `10`，然后拾取在内角相交的两条直线，即底板的上边和立板的侧边。

### 绘制孔 [#holes]

用 <Command id="CIRCLE" />（圆）命令画两个圆，均使用 <Keyword command="CIRCLE" id="Diameter" /> 选项：在底板的 `80,10` 处画直径 `8` 的圆，在立板的 `15,65` 处画直径 `10` 的圆。

### 标注尺寸 [#dimensions]

在“标注”图层上，用 <Command id="DIMLINEAR" />（线性）命令从 `0,0` 标注到底板上的孔 `80,10`，放在下方：80。<Command id="DIMBASELINE" />（基线）命令从同一条第一尺寸界线继续标注：输入右端点 `#100,0`（# 表示从原点起算），然后按两次 Enter 键结束。左侧同样向上标注：先到上方的孔，再到顶端 `#0,80`。最后用 <Command id="DIMRADIUS" />（半径）命令标注圆角，用 <Command id="DIMDIAMETER" />（直径）命令标注每个孔。
