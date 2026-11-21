---
title: "AutoCAD LINETYPE（线型）命令"
metaTitle: "CAD 线型怎么设置：LINETYPE 命令与快捷键 LT"
description: "CAD 线型怎么设置：AutoCAD LINETYPE（线型，快捷键 LT）从 acadiso.lin 加载线型、设置新对象的当前线型、ByLayer，以及虚线为什么显示成实线。在浏览器中免费试用。"
figure: "一块板，其中的孔以 HIDDEN 为当前线型绘制，两条轴线以 CENTER 绘制，然后 LINETYPE 设回 ByLayer。"
sourceHash: "d15530a865c1"
---

LINETYPE（线型）命令设置新对象使用的线型。AutoCAD 会打开线型管理器；MellowCAD 还没有线型管理器，因此 LINETYPE 执行 AutoCAD 也有的命令行版本 <Command id="-LINETYPE" />。它先显示当前线型（最初为 `ByLayer`），每次回答后再次询问选项，直到按 Enter 键结束。ByLayer 表示每个对象使用其图层的线型；指定线型名称时，该线型就是对象自身的线型。整个过程是一步，可以用 <Command id="U" /> 放弃；在其他命令中以撇号透明输入时，设置的线型应用于该命令接下来绘制的对象。

图形保存自己的线型，随图形和其 DXF 文件一起保存。新图形有六种：Continuous，以及来自 AutoCAD 公制文件 acadiso.lin 的 DASHED、HIDDEN、CENTER、PHANTOM 和 DASHDOT；其他线型从 acadiso.lin 加载，DXF 文件则带来自己的线型，包括 ISO 线型和复杂线型，其中的文字（例如 GAS_LINE 的 `GAS`）沿线绘制。与 AutoCAD 一样，图案在每条线上沿长度居中排列，两端的划线等长，并按 <Command id="LTSCALE" /> 和对象自身的线型比例缩放；对象的线型比例由 <Command id="CHPROP" /> 和“特性”选项板设置，新对象的则由 CELTSCALE 指定。

## Options

### ?

分两列列出线型：名称和说明。在选项提示下选择时，询问要列出哪个文件，默认为 acadiso.lin，也可以是 AutoCAD 的英制文件 acad.lin，并按文件中的顺序列出其线型；在设置的提示下选择时，按名称排序列出图形中已加载且名称与输入内容匹配的线型，输入 `*` 列出全部。

### Load

询问要加载的线型，可以是一个名称，也可以是用逗号分隔的多个名称，也可以使用通配符（`DASH*`），然后询问要搜索的文件，最初为 acadiso.lin，之后为上次搜索的文件。找到的每个线型都会按文件中的顺序加载并显示；已加载的线型会先询问，选择 <Keyword id="Yes" />（默认值）则重新加载。文件中没有的名称，或 acadiso.lin 和 acad.lin 以外的文件，都会提示出来。

### Set

询问线型名称，并提供当前线型；输入已加载的线型名称，或 <Keyword id="BYLayer" />。acadiso.lin 中有的线型会像 AutoCAD 一样先加载；其他名称则按 AutoCAD 的提示报告找不到，并回到选项提示。按 Enter 键保持当前线型。

## Missing

线型管理器，以及创建线型或从自己的文件加载线型。BATTING 或 ZIGZAG 等复杂线型的形，绘制为它们所占的间隙。ByBlock。PSLTSCALE 和 MSLTSCALE，因为没有图纸空间。各语言版本 AutoCAD 自己的 acadiso.lin，西班牙语或德语 AutoCAD 加载的就是其中的名称（TRAZOS、STRICHLINIE）：在所有语言中，加载都读取英文版的文件，不过用这些线型绘制的图形打开时会带着自己的线型。PLINEGEN：新多段线在每个顶点处重新开始其图案，除非用 PEDIT 的线型生成将其打开。

## Questions

### CAD 线型快捷键是什么？

输入 `LT`，然后按 Enter 键或空格键；`LTYPE` 和 `DDLTYPE` 也可以。也可以输入完整的命令名；在任何语言版本的 AutoCAD 中都可以使用 `_LINETYPE`。

### CAD 线型不显示虚线怎么办？

与 AutoCAD 一样，短于一个图案重复长度的线会显示为实线：在默认比例下，CENTER 的图案长约 51 个单位。增大或减小 <Command id="LTSCALE" />，使图案与图形相适应。同时检查对象的线型（为 ByLayer 时则是其图层的线型）不是 Continuous。

### CAD 怎么修改已有对象的线型？

选择对象，在“特性”选项板的“线型”行中选择线型，或者用 <Command id="MATCHPROP" /> 从另一个对象复制。LINETYPE 只设置之后绘制的对象的线型。

### CAD 线型比例怎么设置？

输入 <Command id="LTSCALE" /> 和新的比例因子：2 使整个图形中的每段划线长一倍。

### CAD 线型怎么加载？

AutoCAD 在线型管理器中加载线型。在这里，输入 `-LINETYPE`，选择 <Keyword id="Load" />，输入线型名称（例如 `HIDDEN2` 或 `ACAD_ISO02W100`），然后按 Enter 键在 acadiso.lin 中搜索。<Keyword id="Set" /> 在把 acadiso.lin 中的线型置为当前时会同时加载它。
