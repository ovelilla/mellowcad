---
title: "AutoCAD ARRAY（阵列）命令"
metaTitle: "CAD 阵列命令（ARRAY）怎么用：矩形、环形、路径 AR"
description: "CAD 阵列怎么用？ARRAY（快捷键 AR）按提示顺序讲解：矩形阵列、环形阵列和路径阵列，在创建之前实时编辑。在浏览器中免费试用。"
figure: "一个正方形和其中的圆按默认值阵列：按 Enter 键选择矩形阵列，4 列 3 行。"
sourceHash: "5e0a412c9f13"
---

ARRAY（阵列）命令按一定的排列方式复制选择集：按列和行、绕中心或沿路径。它先要求选择对象，再询问阵列类型（按 Enter 键选择矩形），然后将选择集交给 <Command id="ARRAYRECT" />、<Command id="ARRAYPOLAR" /> 或 <Command id="ARRAYPATH" />，后者不再要求选择对象。每种阵列都立即显示，并通过其选项和夹点实时编辑，直到按 Enter 键创建：一个阵列对象，或者在设为非关联时得到各自独立的副本。整个命令是一个放弃步骤，在命令提示下按 Enter 键会重复 ARRAY。

## Options

### Rectangular

按列和行排列，需要时还可以沿 Z 方向叠加层：<Command id="ARRAYRECT" />。初始为 4 列 3 行，间距为选择集尺寸的 1.5 倍。

### PAth

沿直线、圆弧、圆或多段线排列：<Command id="ARRAYPATH" />。它要求选择路径曲线，然后沿路径排列各项目，每个项目随路径的方向转动。

### POlar

绕中心点排列：<Command id="ARRAYPOLAR" />。它要求指定中心点，初始为 6 个项目，布满整圆。

## Missing

提供的类型始终是矩形：不读取设置 AutoCAD 默认值的系统变量 ARRAYTYPE。

## Questions

### CAD 阵列快捷键是什么？

输入 `AR`，然后按 Enter 键或空格键。也可以输入完整的命令名；在任何语言版本的 AutoCAD 中都可以输入 `_ARRAY`。<Command id="ARRAYRECT" />、<Command id="ARRAYPOLAR" /> 和 <Command id="ARRAYPATH" /> 没有快捷键，输入完整命令名时会跳过类型的提问。

### CAD 环形阵列怎么做？

选择 <Keyword id="POlar" />，或者运行 <Command id="ARRAYPOLAR" />，然后拾取中心点：选择集绕中心点复制，初始为 6 个项目。用 <Keyword command="ARRAYPOLAR" id="Items" /> 修改项目数，用 <Keyword command="ARRAYPOLAR" id="Fill angle" /> 设置项目所布满的角度。

### CAD 阵列后怎么分解？

选择阵列并运行 <Command id="EXPLODE" />：阵列变为各项目中的对象，每个对象位于其各自的图层上。如果一开始就要得到独立的副本，在按 Enter 键之前，对 <Keyword command="ARRAYRECT" id="ASsociative" /> 回答 <Keyword command="ARRAYRECT" id="No" />。

### CAD 阵列创建后怎么修改？

选择阵列。用夹点修改：基点处的方形夹点移动阵列，箭头夹点设置数量和间距，数量箭头夹点为热夹点时输入的数字即为数量。“特性”选项板列出其列数、行数和间距，或项目数和角度，可以重新输入。目前还没有 ARRAYEDIT。
