---
title: "AutoCAD COLOR（颜色）命令"
metaTitle: "CAD 颜色命令（COLOR）：ByLayer、真彩色与快捷键 COL"
description: "CAD 颜色怎么设置？COLOR（快捷键 COL）设置新对象的颜色：ByLayer、按名称或编号指定的索引颜色，或 RGB 真彩色。在浏览器中免费试用。"
figure: "以 ByLayer 绘制的板，其孔为红色，镗孔为真彩色 0,128,255，然后将 COLOR 设回 ByLayer。"
sourceHash: "8f98a2a79cf5"
---

COLOR（颜色）命令设置绘制新对象时使用的颜色。AutoCAD 打开“选择颜色”对话框；MellowCAD 还没有该对话框，因此 COLOR 运行 AutoCAD 同样具有的命令行形式 <Command id="-COLOR" />。命令要求输入默认对象颜色，并提供当前颜色，新图形中为 `BYLAYER`：ByLayer 表示每个对象采用其图层的颜色，而另外选择的颜色是对象自身的颜色。输入索引颜色的编号（1 到 255）或前七种颜色之一的名称，或选择 <Keyword id="Truecolor" />。按 Enter 键保留当前颜色；更改是一步，<Command id="U" /> 可以一步放弃。

无法识别的词会显示 <Message id="colorRequired" />，0、负数或大于 255 的数会显示 <Message id="invalidColorNumber" />；然后再次询问。在其他命令中带撇号输入 `'COLOR`，此后绘制的每个对象都采用新颜色：<Command id="LINE" /> 的每一段采用开始绘制该段时的当前颜色。COLOR 只设置之后绘制的对象的颜色；已绘制的对象请用“特性”选项板或功能区的颜色列表（“默认”›“特性”）更改。

## Options

### Truecolor

要求以三个 0 到 255 的值（红、绿、蓝）输入颜色，用逗号分隔，不加空格：`0,128,255` 是中蓝色。即使某个索引颜色的 RGB 值与之相同，它仍是真彩色：输入 `255,0,0` 后，COLOR 提供的是 `255,0,0`，而不是红。

### BYLAYER

新对象采用其图层的颜色，与初始状态相同。

### RED

索引颜色 1（红），也可以输入 `1`。

### YELLOW

索引颜色 2（黄），也可以输入 `2`。

### GREEN

索引颜色 3（绿），也可以输入 `3`。

### CYAN

索引颜色 4（青），也可以输入 `4`。

### BLUE

索引颜色 5（蓝），也可以输入 `5`。

### MAGENTA

索引颜色 6（洋红），也可以输入 `6`。

### WHITE

索引颜色 7（白），也可以输入 `7`：在深色背景上为白色，在浅色背景上为黑色。

## Missing

“选择颜色”对话框、配色系统和 HSL 颜色模式。ByBlock。透明度（CETRANSPARENCY），以及按对象类型设置的默认值 HPCOLOR、HPLAYER、DIMLAYER 和 TEXTLAYER。

## Questions

### CAD 颜色快捷键是什么？

输入 `COL`，然后按 Enter 键或空格键；也可以输入 `COLOUR`。完整的命令名同样可用；在任何语言版本的 AutoCAD 中都可以输入 `_COLOR`。

### CAD 怎么改变对象的颜色？

选择对象，在功能区的颜色列表（“默认”›“特性”）或“特性”选项板的“颜色”行中选择颜色：一步即完成更改。也可以用 <Command id="MATCHPROP" /> 复制另一个对象的颜色。COLOR 只设置之后绘制的对象的颜色。

### CAD 中 ByLayer 是什么意思？

表示对象采用其图层的颜色，因此在图层特性管理器中更改图层的颜色，该图层上所有 ByLayer 对象的颜色都随之改变。这是默认值，使图形的颜色按图层组织：<Command id="LAYER" />。

### CAD 怎么使用 RGB 颜色？

选择 <Keyword id="Truecolor" />，输入用逗号分隔的三个值，例如 `0,128,255`。
