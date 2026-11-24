---
title: "AutoCAD REDO（重做）命令"
metaTitle: "CAD 重做命令（REDO）：Ctrl+Y 与 MREDO"
description: "CAD 重做怎么用：AutoCAD REDO（重做）在 U 或 UNDO 之后立即恢复被放弃的内容；MREDO 和 Ctrl+Y 逐步重做，以及 REDO 为什么不起作用。在浏览器中免费试用。"
figure: "在板上绘制一个孔，用 U 放弃，再用 REDO 恢复。"
sourceHash: "d88f63f885fd"
---

REDO（重做）命令恢复上一次 <Command id="U" /> 或 <Command id="UNDO" /> 放弃的内容：被放弃的内容全部重新绘制出来，因此在 UNDO 放弃五个命令之后，REDO 会恢复这五个命令。它在执行时写出这些命令的名称，没有可重做的内容后提示 <Message id="everythingRedone" />。它不询问任何内容，也没有选项。

它只在放弃之后立即有效。在其他情况下，它提示 <Message id="redoMustFollowUndo" />；一旦执行了其他命令（即使是 LIST 或 ZOOM 这样不做任何修改的命令），则提示 <Message id="nothingToRedo" />。用 UNDO 的“控制”选项中的“无”关闭放弃功能后，REDO 提示它已被禁用。

<Command id="MREDO" /> 逐步重做：它询问操作的数目，或者 <Keyword command="MREDO" id="All" /> 或 <Keyword command="MREDO" id="Last" />，然后重做被放弃的步骤中相应数目的步骤，无论之后执行过多少 U、UNDO 和 REDO；<Keyword command="MREDO" id="Last" /> 是上一次放弃的全部内容，只能重做一次（<Message id="alreadyRedone" />）。Ctrl+Y 和快捷菜单中的“重做”以 1 执行 MREDO，并取消正在执行的命令。

## Missing

Ctrl+Shift+Z 也会重做，并且不输出任何内容，而 AutoCAD 没有为它指定任何功能。快速访问工具栏中的“放弃”和“重做”按钮不在历史记录中写入任何内容，而 AutoCAD 的这两个按钮会写入自己的内容。

## Questions

### CAD 重做快捷键是什么？

Ctrl+Y，它重做一步（MREDO 1）。REDO 本身没有快捷键：请输入 `REDO`，或在任何语言版本的 AutoCAD 中输入 `_REDO`。

### CAD 重做为什么不起作用？

REDO 只恢复紧接在它之前的 U 或 UNDO 所放弃的内容。执行了任何其他命令之后，即使该命令没有做任何修改，也没有可重做的内容：请在放弃之后立即重做。

### CAD 中 REDO 和 MREDO 有什么区别？

REDO 恢复上一次放弃的全部内容，并且只能紧接在放弃之后执行。<Command id="MREDO" /> 逐个重做若干个被放弃的步骤，或者全部重做，并且在 REDO 之后仍然有效。

### CAD 怎么重复上一个命令？

在命令提示下按 Enter 键或空格键：上一个命令会重新开始。REDO 不重复命令；它恢复一次放弃的内容。
