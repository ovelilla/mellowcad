---
title: "AutoCAD SECTION（截面）命令"
metaTitle: "CAD三维截面命令（SECTION）用法与快捷键 SEC"
description: "AutoCAD SECTION（截面，快捷键 SEC）怎么用：按提示顺序说明如何在平面切过三维实体处创建面域，三点、对象、Z 轴、视图、XY、YZ、ZX。在线免费试用。"
figure: "带通孔的长方体被通过孔中心的 ZX 平面剖切：SECTION 生成的截面轮廓移到前方，是两个矩形，中间隔着孔的空隙。"
sourceHash: "f1c01b76c810"
---

SECTION（截面）命令创建三维实体的横截面：在平面切过每个实体的位置生成一个面域，实体保持不变。它询问实体，直到按 Enter 键为止：与 AutoCAD 2027 一样，命令前选择的集合会被放弃并重新询问，非实体对象被忽略，集合中没有实体时显示 <Message id="noSolidsSelected" />。然后询问平面：默认在平面上指定三点，其他选项以别的方式指定平面，与 <Command id="SLICE" /> 相同。

平面切到的每个实体都得到一个位于该平面内的面域：带通孔的长方体得到带有孔空隙的轮廓，沿轴线剖切的圆柱体得到一个矩形。平面与实体的某个面重合时，得到该面。平面没有切到的实体显示 <Message id="sectionMissedOne" />。面域使用当前图层和特性，而不是实体的；可以用 <Command id="MOVE" /> 将其移出来查看，用 <Command id="AREA" /> 和 <Command id="MASSPROP" /> 测量，用 <Command id="EXTRUDE" /> 将其变为实体。整个命令是一个放弃步骤。MellowCAD 的三维只有实体，并且仍不完整。

## Options

### Object

采用所拾取对象的平面：圆、椭圆、圆弧、二维样条曲线或二维多段线。

### Zaxis

先询问平面上的一点，再询问其 Z 轴（与平面垂直的直线）上的一点。

### View

与屏幕平行、通过指定点的平面。

### XY

UCS 的 XY 平面，通过指定点：指定某一高度上的点，就在该高度水平剖切。按 Enter 键采用 UCS 的原点。

### YZ

UCS 的 YZ 平面，通过指定点；按 Enter 键采用 UCS 的原点。

### ZX

UCS 的 ZX 平面，通过指定点；按 Enter 键采用 UCS 的原点。演示中的截面就是通过孔中心的这个平面。

### 3points

平面上的三点，平面可以向任意方向倾斜。它是第一个提示的默认值，因此在该提示下指定的点就是三点中的第一点。

## Missing

没有曲面和网格，MellowCAD 尚不具备。AutoCAD 接受平面的三维多段线作为确定平面的对象，这里不接受。与 <Command id="SLICE" /> 一样，MellowCAD 尚无精确表示的剖切结果会报告一次布尔运算失败。没有 SECTIONPLANE 和活动截面（AutoCAD 的功能区用它们代替了 SECTION）：这里 SECTION 需要输入命令执行。

## Questions

### CAD三维实体怎么做截面？

执行 SECTION，选择实体并按 Enter 键，然后指定平面：选择 <Keyword id="ZX" /> 并指定中间的一点，从前到后剖切；选择 <Keyword id="XY" /> 并指定某一高度上的一点，水平剖切。面域位于实体内部：用 <Command id="MOVE" /> 将其移出来查看。

### CAD截面和剖切有什么区别？

<Command id="SLICE" /> 将实体切成两部分，保留其中一部分或两部分都保留。SECTION 保持实体完整，在平面切过实体的位置画出一个面域。

### CAD截面命令的快捷键是什么？

输入 `SEC`，然后按 Enter 键或空格键。

### CAD截面为什么提示平面与实体不相交？

平面没有切到实体：请检查平面的指定方式。<Keyword id="XY" />、<Keyword id="YZ" /> 和 <Keyword id="ZX" /> 是 UCS 的平面，点的高度或位置不对，平面就会落在实体之外。
