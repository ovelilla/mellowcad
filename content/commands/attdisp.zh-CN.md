---
title: "AutoCAD ATTDISP（属性显示）命令"
metaTitle: "CAD 属性显示命令（ATTDISP）显示或隐藏块属性"
description: "CAD 块属性怎么显示或隐藏？ATTDISP：普通，开（同时显示不可见属性），关（隐藏所有属性）。设置随图形保存。在浏览器中免费试用。"
figure: "两张办公桌的零件号是不可见属性：ATTDISP ON 将其显示在每张桌子下方，与可见的编号并列。"
sourceHash: "8821fdeb2077"
---

ATTDISP（属性显示）命令设置图形中的块参照显示哪些属性。它询问设置，并提供当前设置（新图形中为“普通”）；输入其他词会提示关键字无效并再次提问，按 Enter 键则保持不变。更改后整个图形重新生成，与 AutoCAD 2027 一样显示 `Regenerating model.`，该设置作为 ATTMODE 随图形保存，<Command id="U" /> 可以一步放弃。在命令中加撇号输入，也可以透明使用。

它只改变显示：不可见属性仍保留其值，隐藏的属性仍可以用 <Command id="ATTEDIT" /> 或 <Command id="EATTEDIT" /> 编辑。

## Options

### Normal

按定义时的设置显示各属性：显示可见属性，不显示用 <Command id="ATTDEF" /> 的 <Keyword command="ATTDEF" id="Invisible" /> 定义的属性。

### ON

显示所有属性，包括不可见属性。

### OFF

隐藏所有属性，包括可见属性。

## Questions

### CAD 怎么显示不可见的属性？

输入 `ATTDISP` 并选择 <Keyword id="ON" />：显示所有属性，包括不可见属性。选择 <Keyword id="Normal" /> 可以再次隐藏它们。

### CAD 块属性不显示是什么原因？

<Command id="ATTDISP" /> 可能设为 <Keyword id="OFF" />，即隐藏所有属性；或者设为 <Keyword id="Normal" />，而属性被定义为不可见。选择 <Keyword id="ON" /> 可以显示全部属性。如果参照的块没有属性，无论如何设置都不显示属性。

### CAD 怎么隐藏属性值？

将属性定义为不可见：在创建块之前，使用 <Command id="ATTDEF" /> 的 <Keyword command="ATTDEF" id="Invisible" /> 模式。ATTDISP <Keyword id="OFF" /> 可以一次隐藏整个图形中的所有属性。
