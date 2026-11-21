---
title: "AutoCAD PLAN（平面视图）命令"
metaTitle: "CAD 平面视图命令（PLAN）：UCS 与世界坐标系"
description: "CAD 怎么回到平面视图：AutoCAD PLAN（平面视图）正对当前 UCS、已保存的 UCS 或世界坐标系向下看，当前 UCS、UCS 和世界三个选项。在浏览器中免费试用。"
figure: "从西南方向看的台阶状块体，其 UCS 绕 Z 轴转了 30 度：PLAN 加 Enter 键正对该 UCS 向下看，X 轴朝右，因此块体显示为转过的样子。"
sourceHash: "50d157803309"
---

PLAN（平面视图）命令正对某个 UCS 的 XY 平面向下看，X 轴指向右方：即绘制时的平面视图。它询问使用哪个 UCS（当前 UCS、已保存的 UCS 或世界坐标系），按 Enter 键选择当前 UCS。然后缩放以显示整个图形，并提示 <Message id="regeneratingModel" />。

图形中的对象都不移动，UCS 也保持不变：PLAN 只转动视图。它是一个放弃步骤，因此 <Command id="U" /> 可以恢复视图，<Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> 可以退回到之前的视图。在 <Command id="3DORBIT" /> 或等轴测的 <Command id="VIEW" /> 之后，用它回到平面视图。MellowCAD 的三维只有实体，并且仍不完整。

## Options

### Current ucs

当前 UCS 的平面视图，为默认值。用 <Command id="UCS" /> 将 UCS 绕 Z 轴旋转 30 度后，图形显示为顺时针转过 30 度，使 UCS 的 X 轴指向右方；把 UCS 设在倾斜的面上后，则正对该面观看。

### Ucs

用 <Command id="UCS" /> 的 <Keyword command="UCS" id="NAmed" /> 保存的某个 UCS 的平面视图，按名称输入。对于未保存的名称，提示找不到该 UCS 并重新询问；<Keyword id="?" /> 像 UCS 一样列出已保存的 UCS，然后也重新询问。当前 UCS 不变。

### World

世界坐标系的平面视图：图形回到最初的样子，X 朝右、Y 朝上，无论当前 UCS 是什么，当前 UCS 都保持不变。

## Missing

图形中没有对象时，PLAN 保持原来的缩放，而 AutoCAD 会缩放到图形界限。

## Questions

### CAD 怎么回到平面视图？

输入 `PLAN` 并按两次 Enter 键：第二次按 Enter 键选择 <Keyword id="Current ucs" />。如果 UCS 已转动而需要世界坐标系的平面视图，请改为选择 <Keyword id="World" />。

### CAD 的 UCS 平面视图命令是什么？

使用 <Keyword id="Current ucs" /> 的 PLAN：它正对当前 UCS 向下看，X 轴朝右。先用 <Command id="UCS" /> 转动 UCS，再执行 PLAN 并按两次 Enter 键，就可以像在正放的平面上一样在转过的平面上绘图。

### CAD 平面视图为什么是斜的？

视图是一个转动过的 UCS 的平面视图。执行 PLAN 并选择 <Keyword id="World" />，图形就会重新以世界坐标系的 X 轴朝右显示；<Command id="UCS" /> 加 Enter 键也会把 UCS 恢复为世界坐标系。

### CAD 中 PLAN 会改变 UCS 吗？

不会。它只转动视图，UCS 保持不变。<Command id="VIEW" /> 的正交视图才会同时转动 UCS。
