---
title: "AutoCAD ATTDEF（定义属性）命令"
metaTitle: "CAD 定义属性命令（ATTDEF）块属性与快捷键 ATT"
description: "CAD 块属性怎么定义？ATTDEF（快捷键 ATT）定义块属性：模式、标记、提示和默认值，然后指定文字的位置。在浏览器中免费试用。"
figure: "门编号标记：属性 NUM 居中位于圆内，提示即标记本身，默认值为 1，可以加入块中。"
sourceHash: "f0fc3d8763e7"
---

ATTDEF（定义属性）命令定义属性：一个标记、一个提示和一个默认值，以一行文字的形式放在图形中。用 <Command id="BLOCK" /> 创建块时，将它与其他对象一起选中，此后该块的每个参照都为它保存各自的值：门的编号、零件的代号、房间的名称等。在此之前，属性定义显示其标记。

AutoCAD 的 ATTDEF 打开“属性定义”对话框，MellowCAD 没有这个对话框：这里 ATTDEF 在命令行中询问 <Command id="-ATTDEF" /> 所询问的内容，与 AutoCAD 控制台版相同。它先显示当前的模式，并要求选择要更改的模式，直到按 Enter 键继续。然后是标记：不能包含空格，因为空格会结束输入，小写字母转换为大写；直接按 Enter 键显示 <Message id="tagCannotBeNull" />。然后是 <Command id="INSERT" /> 询问值时使用的提示（按 Enter 键则使用标记），以及默认值。最后是文字的位置，使用 <Command id="TEXT" /> 的提问：起点、高度和旋转角度。高度和对正方式与 TEXT 共用，双向生效。在起点处按 Enter 键，属性定义放在上一个属性定义下方一行，使用其高度、旋转角度、样式和对正方式，因此块的各个属性逐行向下排列。

## Options

### Invisible

值不显示在参照上，直到用 <Command id="ATTDISP" /> 将其打开。每种模式都是一个开关：选择它即在 `Y` 和 `N` 之间切换，重新显示各模式并再次提问。这些模式保留到下一次 ATTDEF。

### Constant

每个参照都保存相同的值；ATTDEF 询问该值，而不询问提示和默认值；INSERT 不会询问它。

### Verify

INSERT 在逐一询问所有值之后，再次询问该值以进行验证。

### Preset

INSERT 不询问该值：每个参照都取默认值。

### Lock position

初始为打开：属性保持在块所放置的位置。

### Justify

与 TEXT 相同，询问文字相对于其点的对正方式：<Keyword id="Left" />、<Keyword id="Center" />、<Keyword id="Right" />、<Keyword id="Middle" />，或按上、中、下和左、中、右组合的九个点之一。随后起点的提示会询问该选项所指的点：正中可以使值在标记中居中。

### Style

询问要使用的文字样式，该样式成为当前样式；<Keyword id="?" /> 列出图形中的样式。

## Missing

“属性定义”对话框：ATTDEF 在命令行中提问。注释性和多行模式（AutoCAD 2027 将其列在锁定位置之后），以及多行属性的各行。字段、对齐和布满两种对正方式，以及样式的 `?` 询问要列出哪些样式。

## Questions

### CAD 定义属性快捷键是什么？

输入 `ATT`，然后按 Enter 键或空格键；`DDATTDEF` 也可以。`-ATT` 是 <Command id="-ATTDEF" />，即命令行形式，这里 ATTDEF 运行的也是它。在任何语言版本的 AutoCAD 中都可以输入 `_ATTDEF`。

### CAD 怎么创建带属性的块？

先绘制符号，然后对每个属性运行一次 ATTDEF，并将其文字放在值要显示的位置。运行 <Command id="BLOCK" />，拾取基点，按 INSERT 询问的顺序选择符号和各属性。此后每次用 <Command id="INSERT" /> 插入该块，都会为每个属性询问一个值，并提供其默认值。

### CAD 属性的标记、提示和默认值有什么区别？

标记是属性的名称，相当于标识符：属性定义显示的就是它，<Command id="EATTEDIT" /> 中的字段也以它为标签。提示是 INSERT 询问其值时的问题。默认值是提供的值，按 Enter 键即接受。

### CAD 属性定义怎么修改？

在它加入块之前双击它：<Command id="TEXTEDIT" /> 打开其标记、提示和默认值。加入块之后，每个参照的值用 <Command id="ATTEDIT" /> 或 <Command id="EATTEDIT" /> 编辑。
