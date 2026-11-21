---
title: "AutoCAD TEXTEDIT（编辑文字）命令"
metaTitle: "CAD文字怎么修改：TEXTEDIT（编辑文字）ED"
description: "AutoCAD TEXTEDIT（编辑文字，快捷键 ED、DDEDIT）怎么用：逐个编辑单行文字、多行文字和属性定义，以及放弃和模式选项。在浏览器中免费试用。"
figure: "用 TEXTEDIT 拾取铭牌上拼错的 PALTE，重新输入为 PLATE，然后按 Esc 键结束命令。"
sourceHash: "2d0ed6fe5acc"
---

TEXTEDIT（编辑文字）命令编辑注释对象：它显示当前编辑模式（起初为“多个”），并要求选择一个对象。单行文字在原位置打开以便重新输入，多行文字在 <Command id="MTEXT" /> 的编辑器中打开，属性定义以其标记、提示和默认值打开。在“多个”模式下，随后询问下一个对象，直到按 Esc 键或 Enter 键结束命令；整次执行是一个可以用 <Command id="U" /> 放弃的步骤。双击单行文字或属性定义会执行 TEXTEDIT，双击多行文字则为该对象打开编辑器。

在单行文字的编辑器中按 Esc 键，放弃该次编辑并询问下一个对象；再按一次 Esc 键结束命令。位于锁定图层上的对象显示 <Message id="objectOnLockedLayer" /> 并再次询问；拾取其他对象时，不加提示地再次询问。命令前选择了一个文字时，立即将其打开。

## Options

### Undo

放弃本次执行中的上一次编辑并再次询问；没有可放弃的编辑时，提示命令已全部放弃。

### Mode

询问编辑模式：<Keyword id="Single" /> 在编辑一个对象后结束命令，<Keyword id="Multiple" /> 继续询问下一个。该模式在所有图形中保留，供下一次 TEXTEDIT 使用。

## Missing

标注文字：TEXTEDIT 不编辑标注的文字，标注文字在放置时由 <Command id="DIMLINEAR" /> 的“文字”选项设置。不能在“特性”选项板中编辑文字内容。没有输入执行的 MTEDIT 和 -MTEDIT。编辑器打开时，命令行显示 `TEXTEDIT:`；AutoCAD 则在原位编辑，不作询问。

## Questions

### CAD编辑文字的快捷键是什么？

输入 `ED`，然后按 Enter 键或空格键；AutoCAD 的旧命令名 `DDEDIT` 和 `TEDIT` 也可以。在任何语言版本的 AutoCAD 中，`_TEXTEDIT` 都有效。

### CAD文字怎么修改？

双击文字，或输入 `ED` 并拾取文字；重新输入后按 Enter 键。TEXTEDIT 随后询问下一个要编辑的文字，直到按 Esc 键为止。其高度和旋转是“特性”选项板中的行，其样式在“样式”一行中。

### CAD怎么连续修改多个文字？

让 TEXTEDIT 保持默认的 <Keyword id="Multiple" /> 模式：每编辑完一个文字，就询问下一个。选择 <Keyword id="Mode" /> 和 <Keyword id="Single" />，则像双击一样，编辑一个后即结束。

### CAD文字双击为什么改不了？

文字可能位于锁定的图层上：请在图层特性管理器中解锁该图层。标注的文字暂时还不能用 TEXTEDIT 编辑，块的属性值会打开 <Command id="EATTEDIT" />。
