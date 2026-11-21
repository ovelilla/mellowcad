---
title: "CAD 练习图：法兰盘"
metaTitle: "CAD 机械图练习：带键槽的法兰盘"
description: "AutoCAD 机械练习图：在轴孔上修剪出键槽，用环形阵列画出 8 个孔，再画中心线并标注直径。附分步解答，可免费在线练习。"
figure: "外径 140 的法兰盘，含键槽、8 个孔和直径标注。"
sourceHash: "32f94d57ae25"
---

按以下尺寸绘制法兰盘（单位：mm）：外径 140；轴孔直径 60，带一个宽 16 的键槽，键槽顶面距圆心 36；8 个直径 14 的孔均布在直径 110 的螺栓孔中心圆上；另画出中心线。键槽由一个矩形修剪进轴孔而成；孔由一个圆和环形阵列得到。

## Steps

### 绘制圆 [#circles]

在“轮廓线”图层上，以 `0,0` 为圆心画两个圆，均使用 <Keyword command="CIRCLE" id="Diameter" /> 选项：`140` 和 `60`。

### 切出键槽 [#keyway]

用 <Command id="RECTANG" />（矩形）命令从 `-8,20` 画到相对其 `16,16` 处：矩形与轴孔相交。<Command id="TRIM" />（修剪）命令在对象与其他对象相交处将其剪断：在矩形两边之间拾取轴孔的圆弧，再在轴孔内拾取矩形的底边。剩下的就是键槽，即它的两个侧面和顶面。

### 阵列孔 [#holes]

先在中心圆上画一个孔：在 `55<22.5`（距原点 55、角度 22.5° 处）画一个圆，<Keyword command="CIRCLE" id="Diameter" /> 为 `14`。<Command id="ARRAYPOLAR" />（环形阵列）命令：选择该圆，按 Enter 键，指定中心点 `0,0`；<Keyword command="ARRAYPOLAR" id="ASsociative" /> 选择 <Keyword command="ARRAYPOLAR" id="No" />，得到 8 个独立的圆，标注时可以拾取；<Keyword command="ARRAYPOLAR" id="Items" /> 输入 `8`，使其沿整个圆周分布。然后在“中心线”图层上，以 `0,0` 为圆心画中心圆，直径 `110`。

### 绘制中心线 [#centreLines]

仍在“中心线”图层上，用 <Command id="LINE" />（直线）命令画两条过圆心、长 156 的直线：水平线从 `-78,0` 起，向右 `156,0`；竖直线从 `0,-78` 起，向上 `0,156`。

### 标注尺寸 [#dimensions]

在“标注”图层上，用 <Command id="DIMDIAMETER" />（直径）命令标注轴孔、一个孔、中心圆和外轮廓，每个都在尚无标注穿过的位置拾取；再用 <Command id="DIMLINEAR" />（线性）命令标注键槽顶面的宽度：16。
