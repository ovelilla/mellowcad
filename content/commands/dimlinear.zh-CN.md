---
title: "AutoCAD 尺寸标注：DIMLINEAR（线性）命令"
metaTitle: "CAD标注尺寸命令：线性标注（DIMLINEAR）快捷键 DLI"
description: "CAD标注尺寸怎么操作：按提示顺序讲解 AutoCAD 的线性标注 DIMLINEAR（快捷键 DLI）：两个原点或一个对象，再放置水平或垂直的尺寸线。在浏览器中免费试用。"
figure: "矩形标注两次：上边通过两个角点标注，右边按 Enter 键后拾取该边标注。"
sourceHash: "e48a0a6f18c9"
---

DIMLINEAR（线性）命令沿 X 或 Y 方向测量两点之间的距离，并将其绘制为标注：两条尺寸界线、一条带箭头的尺寸线，以及尺寸线上方的测量值。依次指定第一个和第二个尺寸界线原点，然后指定尺寸线位置；与 AutoCAD 相同，尺寸线的位置决定测量方向：放在两点的上方或下方时测量水平距离，放在旁边时测量垂直距离。也可以在第一个提示下按 Enter 键，然后拾取直线、圆弧、多段线线段或圆：其两个端点（或圆的直径）即为原点。随后命令行显示测量值，命令结束。

标注使用当前标注样式绘制，新图形中为 ISO-25：小数用逗号分隔，不显示末尾的零，与 AutoCAD 公制图形的写法相同。<Command id="DIMHORIZONTAL" />、<Command id="DIMVERTICAL" /> 和 <Command id="DIMROTATED" /> 只能输入使用，它们是限定为单一方向的 DIMLINEAR。

## Options

### Text

询问要代替测量值写入的文字，默认值为测量值：按 Enter 键保留测量值。输入的内容中，`<>` 代表测量值，因此 `<> mm` 写出测量值后跟单位。

### Angle

询问文字的角度，文字随后按该角度绘制，而不再沿尺寸线方向。输入 0 使文字恢复沿尺寸线方向。

### Horizontal

无论尺寸线放在哪里，都沿 X 方向测量，尺寸线保持水平；提示随后只提供 <Keyword id="Text" /> 和 <Keyword id="Angle" />。

### Vertical

无论尺寸线放在哪里，都沿 Y 方向测量，尺寸线保持垂直。

### Rotated

询问尺寸线的角度（默认为 `0`），并沿该方向测量两个原点之间的距离。对于斜边，输入其自身的角度即可得到它的长度，与 <Command id="DIMALIGNED" /> 相同。

## Missing

多行文字：标注文字只有一行，在命令行中用 <Keyword id="Text" /> 设置，不能在文字编辑器中编辑。用 <Keyword id="Angle" /> 设置角度后，AutoCAD 将文字居中放在尺寸线上；这里文字仍位于尺寸线上方，与未设置角度时相同。标注不是关联标注：不会随所测量的对象更新。

## Questions

### CAD线性标注的快捷键是什么？

输入 `DLI` 或 `DIMLIN`，然后按 Enter 键或空格键。也可以输入完整命令名，在任何语言版本的 AutoCAD 中都可以输入 `_DIMLINEAR`。

### CAD标注尺寸的命令有哪些？

<Command id="DIMLINEAR" /> 标注水平和垂直距离，<Command id="DIMALIGNED" /> 标注沿斜边的距离，<Command id="DIMRADIUS" /> 和 <Command id="DIMDIAMETER" /> 标注圆弧和圆，<Command id="DIMANGULAR" /> 标注角度，<Command id="DIMCONTINUE" /> 和 <Command id="DIMBASELINE" /> 标注成串的尺寸，<Command id="DIMSPACE" /> 调整它们的间距，<Command id="DIMSTYLE" /> 设置它们的外观。AutoCAD 的 DIM（在一个提示下创建任意类型的标注）和 QDIM（一次标注多个对象）在 MellowCAD 中尚不可用。

### 修改对象后，标注为什么不跟着变？

MellowCAD 的标注还不是关联标注，正如 <Message id="nonAssociativeDimension" /> 所示：标注保留创建时给定的点。可以将它们一起拉伸：在一个 <Command id="STRETCH" /> 交叉窗口中同时框住要移动的端点和该处的标注原点，测量值会重新计算；也可以将原点的夹点拖到新位置。

### CAD标注的文字和箭头大小怎么改？

与 AutoCAD 相同，在标注样式中修改：<Command id="DIMSTYLE" />（`D`）打开标注样式，这里位于“样式”选项板中，而 AutoCAD 使用“标注样式管理器”。在其中设置当前样式的文字高度、箭头大小、全局比例和小数位数，使用该样式的所有标注都会随之更新。
