---
title: "AutoCAD UNDO（放弃）命令"
metaTitle: "CAD 撤销（放弃）命令 UNDO：标记、后退与 Ctrl+Z"
description: "AutoCAD UNDO（放弃）怎么用：按步数放弃，标记和后退，开始和结束，控制，以及它和 U、Ctrl+Z 的区别。在线免费试用。"
before: "一块带两个孔、上面横画一条直线的板，由四个命令画成：RECTANG、两次 CIRCLE 和 LINE。"
figure: "UNDO 2：放弃最后两个命令，即直线和第二个孔，板上保留第一个孔。"
sourceHash: "b4fed2178b6a"
---

UNDO（放弃）命令放弃已执行的命令。一步是一个完整的命令：一次 LINE 画出的所有线段一起放弃，无论有多少段；命令所做的设置（例如 LTSCALE）也是如此。UNDO 先显示其当前设置，然后询问要放弃的操作数目或选项；按 Enter 键放弃一步。它在一行中显示所放弃的命令的名称，例如 `CIRCLE LINE`；全部放弃后显示 <Message id="everythingUndone" />，此后显示 <Message id="nothingToUndo" />。没有更改任何内容的命令（例如 ID 或 LIST）也是一步，ZOOM 和 PAN 对视图的更改也是。

<Command id="U" /> 是简化形式：放弃一步，不作询问。在命令提示下，Ctrl+Z 执行 U；在命令执行过程中，它是该命令自身的“放弃”，与 AutoCAD 的宏输入的内容相同：LINE 放弃其最后一段并继续。紧接着执行 <Command id="REDO" />，可以恢复上一次 U 或 UNDO 放弃的内容。

## Options

### Auto

询问 <Keyword id="ON" /> 或 <Keyword id="OFF" />，以当前设置作为默认值，之后设置行会显示它。在 AutoCAD 中，它将一个菜单项执行的多个命令合为一步；这里没有执行多个命令的菜单，因此它不会合并任何命令。

### Control

询问保留多少放弃信息，默认为 <Keyword id="All" />。<Keyword id="None" /> 丢弃所有保留的步骤并关闭放弃功能：此后 U 显示 <Message id="uDisabled" />，UNDO 直接询问“控制”。<Keyword id="One" /> 只保留最后一步，此后 UNDO 询问 1 或“控制”。“全部”重新打开完整的放弃功能。<Keyword id="Combine" /> 指定连续的 ZOOM 和 PAN 是否合为一步，<Keyword id="Layer" /> 指定在图层特性管理器中的连续编辑是否合为一步，两者默认都为“是”。这些设置属于图形，但不随图形保存：新建或打开的图形从“全部”、“合并”为“是”、“图层”为“是”开始。

### BEgin

开始一个编组：在 <Keyword id="End" /> 之前执行的命令合为一步，U 将其整体放弃，并以 `GROUP` 与这些命令一起显示。编组打开时，U、数目和“后退”在其开始处停止。编组打开时再选择“开始”，会先将其关闭。

### End

关闭“开始”打开的编组。

### Mark

在步骤中留下一个标记。“后退”、U 和数目在标记处停止，并显示 <Message id="markEncountered" />。

### Back

放弃到上一个标记为止的所有步骤，标记也一并删除。没有标记时，询问是否放弃全部，默认为“是”。

## Missing

“自动”不会合并任何命令，因为这里没有执行多个命令的菜单。“合并”和“图层”只在浏览器会话中保留，而 AutoCAD 会在各次会话之间保留它们。顶部栏的“放弃”和“重做”按钮不在历史记录中写入任何内容；AutoCAD 的快速访问工具栏则会写入自己的内容。Ctrl+Shift+Z 也会不加提示地重做，尽管 AutoCAD 没有为它指定任何功能。

## Questions

### CAD 放弃的快捷键是什么？

Ctrl+Z，或输入 `U` 再按 Enter 键：放弃一步。UNDO 没有快捷键；要按步数放弃或使用其选项，请输入完整的命令名；在任何语言版本的 AutoCAD 中，`_UNDO` 都有效。

### CAD 里 U 和 UNDO 有什么区别？

<Command id="U" /> 放弃上一个命令，不作任何询问。UNDO 询问要放弃多少步，并提供“标记”和“后退”以返回到标记的位置，“开始”和“结束”将多个命令合为一步，“控制”用于限制或关闭放弃功能。

### CAD 怎么一次放弃多步？

输入 `UNDO` 和命令的数目，例如 `5`。或者在可能要放弃的一系列操作之前选择 <Keyword id="Mark" />，然后用 <Keyword id="Back" /> 返回到该处。

### CAD 放弃命令为什么用不了？

放弃功能被“控制”的 <Keyword id="None" /> 关闭了：U 会显示这一点，UNDO 会询问“控制”。回答 <Keyword id="All" /> 将其重新打开。在此之前的步骤已经无法恢复。

### CAD 放弃后怎么恢复？

紧接着 U 或 UNDO 执行 <Command id="REDO" />，恢复其放弃的全部内容。Ctrl+Y 每次重做一步。
