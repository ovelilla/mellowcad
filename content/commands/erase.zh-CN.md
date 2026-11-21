---
title: "AutoCAD ERASE（删除）命令"
metaTitle: "CAD删除命令（ERASE）怎么用：快捷键 E 与 Delete"
description: "CAD删除快捷键和用法：AutoCAD 的 ERASE（快捷键 E）选择对象后按 Enter 键即可删除，还有 Delete 键、ALL，以及删除后怎么恢复。在浏览器中免费试用。"
figure: "一个矩形及其两条对角线：拾取一条对角线，按 Enter 键，将其删除。"
sourceHash: "2de33971060a"
---

ERASE（删除）命令从图形中删除选定的对象。在 `Select objects:` 提示下选择对象，可以逐个拾取，也可以使用 AutoCAD 的任何选择方式（包括窗口和窗交），然后按 Enter 键或空格键：对象被删除，命令不再显示其他信息。按 Esc 键结束命令，不删除任何对象。与 AutoCAD 相同，命令执行前选定的对象会立即删除；选定对象后按 Delete 键，会对它们执行 ERASE。选择过程中，光标下的对象和已选定的对象以淡显方式绘制，与 AutoCAD 预览将要删除的对象相同。整个删除操作是一步，可以用放弃撤销。

## Missing

OOPS：在 AutoCAD 中，即使执行了其他命令，它也能恢复 ERASE 最后删除的一组对象。这里可以用 <Command id="U" /> 或 Ctrl+Z 撤销删除，但其后的操作也会一并撤销。

## Questions

### CAD删除的快捷键是什么？

输入 `E`，然后按 Enter 键或空格键；`DELETE` 也是它的别名。也可以在 `Command:` 提示下选择对象，然后按 Delete 键。也可以输入完整命令名，在任何语言版本的 AutoCAD 中都可以输入 `_ERASE`。

### CAD怎么删除图形中的所有对象？

执行 ERASE，在 `Select objects:` 提示下输入 `ALL`，然后按 Enter 键。锁定图层上的对象不会被删除，选择时会显示有多少个这样的对象。

### CAD删除的东西怎么恢复？

立即输入 <Command id="U" /> 或按 Ctrl+Z：删除操作是一步放弃。OOPS（即使执行了其他命令也能恢复最后删除的一组对象）尚未实现。

### ERASE 和 TRIM 有什么区别？

ERASE 删除整个对象。<Command id="TRIM" /> 只删除对象超出其相交边界的部分，保留其余部分。
