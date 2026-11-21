---
title: "AutoCAD CHPROP（更改特性）命令"
metaTitle: "CAD 更改特性命令（CHPROP）：命令行修改对象特性"
description: "CAD 怎么用命令修改对象特性？CHPROP：选择对象，在命令行中更改其颜色、图层、线型及线型比例、线宽或厚度。在浏览器中免费试用。"
figure: "对横穿板孔的一条直线执行 CHPROP：颜色 1、线型 CENTER，成为一条轴线，仍在原来的图层上。"
sourceHash: "4ba30c3c6070"
---

CHPROP（更改特性）命令在命令行中更改所选对象的特性：即“特性”选项板中“常规”部分的各行，以提示的方式询问。选择对象（也可以在命令之前选择），然后选择要更改的特性；每更改一项后再次询问，直到按 Enter 键结束。每个特性的提示以选择集的值作为默认值，对象各不相同时显示 <Message id="varies" />，此时按 Enter 键会保留每个对象各自的值。所设置的内容在命令结束时才应用，因此按 Esc 键会使所有对象保持原样。锁定图层上的对象会被计数并排除，每个都显示 <Message id="objectOnLockedLayer" />。整个运行过程是一步，<Command id="U" /> 可以一步放弃。

## Options

### Color

输入 1 到 255 的颜色号、`red` 之类的名称、`BYLAYER`，或选择 <Keyword id="Truecolor" /> 并输入 `Red,Green,Blue`，与 <Command id="COLOR" /> 命令接受的方式相同；COLOR 拒绝的值在这里同样被拒绝，并再次询问。

### LAyer

输入图层名，不区分大小写。不能用作图层名的名称显示 <Message id="invalidLayerName" />，图形中不存在的名称则提示找不到；两种情况都会再次询问。CHPROP 不创建图层。

### LType

输入线型名，不区分大小写，或输入 `ByLayer`。图形中尚未加载的线型从 acad.lin（AutoCAD 以英寸为单位的线型文件）加载，与 AutoCAD 相同，即使在公制图形中也是如此；该文件中也没有的名称会提示找不到，并返回特性提示。

### ltScale

对象自身的线型比例，仅对这些对象与 <Command id="LTSCALE" /> 的比例相乘：输入一个距离，或用两点量取；负值取其绝对值，0 会显示 <Message id="valueMustBeNonzero" /> 并再次询问。

### LWeight

以毫米为单位的线宽，与 <Command id="LWEIGHT" /> 命令一样舍入到最接近的标准线宽，或输入 `ByLayer`；输入 `?` 列出所有线宽。

### Thickness

输入一个距离，或用两点量取，负值和零也可以。厚度设置在选择集中的直线、圆、圆弧和多段线上，沿各自的法线方向；对其他类型的对象，命令结束时提示无法更改其厚度。

## Missing

透明度、材质和注释性：这里的对象没有这些特性，因此提示中不列出。颜色、线型和线宽的 ByBlock，以及线宽的“默认”。与索引颜色相同的真彩色读回时显示为索引颜色：`255,0,0` 显示为 `1 (red)`。配色系统。文字和属性定义的厚度，保持不变。CHANGE 命令，其“特性”选项询问同样的提示，另有“标高”。

## Questions

### CAD CHPROP 命令有快捷键吗？

它没有快捷键（命令别名）：输入 `CHPROP`，在任何语言版本的 AutoCAD 中都可以输入 `_CHPROP`。在命令提示下按 Enter 键可重复该命令。

### CAD 中 CHPROP 和 PROPERTIES 有什么区别？

二者更改同样的特性。<Command id="PROPERTIES" /> 在选项板中显示特性，还显示每个对象的几何信息；CHPROP 在命令行中询问，双手不必离开键盘。

### CAD 怎么用命令修改对象颜色？

输入 `CHPROP`，选择对象，按 Enter 键，选择 <Keyword id="Color" /> 并输入颜色，例如 `1` 表示红色。再按 Enter 键完成。

### CAD 怎么把多个对象移到另一个图层？

运行 CHPROP，选择这些对象，选择 <Keyword id="LAyer" /> 并输入图层名。图层必须已经存在：请先在 <Command id="LAYER" /> 中创建。
