---
title: "AutoCAD VIEW（视图管理器）命令"
metaTitle: "CAD 等轴测视图与俯视图怎么切换（VIEW）"
description: "AutoCAD VIEW（快捷键 V、-VIEW）怎么切换到六个正交视图和四个等轴测视图，以及每个正交视图设置的 UCS。在线免费试用。"
figure: "以平面方式画出的阶梯块：执行 -VIEW 和 SW Isometric 后，以“隐藏”视觉样式从西南上方观察。"
sourceHash: "261c8657f5f7"
---

VIEW（视图管理器）命令将视图转到 AutoCAD 的十个预设视图之一：六个正交视图，正对模型的某一面；四个等轴测视图，从某个角向下看。图形中的对象都不移动。VIEW 执行命令行形式 <Command id="-VIEW" />：其第一个提示列出 <Keyword id="Orthographic" />，随后询问要看哪一面；它也直接接受视图名，与 AutoCAD 的菜单所回答的一样：<Command id="-VIEW" />，然后 <Keyword id="SWiso" />。每个视图都会缩放到整个图形，并显示 <Message id="regeneratingModel" />。

图形左上角的视图控件列出同样的十个视图并执行 <Command id="-VIEW" />；ViewCube 的面和角也会转到这些视图，但保持 UCS 不变。每次 VIEW 是一个放弃步骤，因此 <Command id="U" /> 可以放弃视图及其设置的 UCS。在其他命令中加撇号输入时，它会拒绝并显示 <Message id="requiresRegen" />。MellowCAD 的三维只有实体，并且仍不完整。

## Options

### Orthographic

询问要看哪一面，默认为 <Keyword id="Top" />，因此在此处按 Enter 键得到平面视图：<Keyword id="Top" />、<Keyword id="Bottom" />、<Keyword id="Front" />、<Keyword id="BAck" />、<Keyword id="Left" /> 或 <Keyword id="Right" />。每个视图都是正立的：俯视 X 向右、Y 向上，前视 X 向右、Z 向上，仰视从下方看，X 向左。在第一个提示下直接输入各面，不选择该选项也可以。

每个正交视图还会将 UCS 转为正对观察者，无论原来的 UCS 如何，都从世界坐标系的轴出发，原点位于 `0,0,0`，与 <Command id="UCS" /> 的正交选项相同：前视之后，其 XY 平面为前面，因此绘制的对象平贴屏幕，UCS 命名为 `*FRONT*`。俯视之后，UCS 具有世界坐标系的轴，命名为 `*TOP*`。

### SWiso

西南等轴测：从前方偏左的角向下看，可以看到前面、左侧面和顶面。UCS 保持不变。这是演示中的视图。

### SEiso

东南等轴测：从前方偏右的角向下看，可以看到前面、右侧面和顶面。UCS 保持不变。

### NEiso

东北等轴测：从后方偏右的角向下看，可以看到后面、右侧面和顶面。UCS 保持不变。

### NWiso

西北等轴测：从后方偏左的角向下看，可以看到后面、左侧面和顶面。UCS 保持不变。

## Missing

没有命名视图：第一个提示只列出 <Keyword id="Orthographic" /> 一个选项，而 AutoCAD 还列出 `?`、删除、恢复、保存、设置和窗口；在此处输入名称会被拒绝。没有视图管理器（AutoCAD 中 VIEW 打开它）。没有绘制任何对象时，视图保持当前缩放，而 AutoCAD 会缩放到图形界限。没有 UCSORTHO 和 UCSBASE 变量：正交视图总是从世界坐标系的轴出发对齐 UCS。对齐后的 UCS 不在 <Command id="UCS" /> 的 <Keyword command="UCS" id="Previous" /> 列表中。

## Questions

### CAD 等轴测视图怎么调出来？

输入 <Command id="-VIEW" />，然后选择 <Keyword id="SWiso" /> 得到西南等轴测；<Keyword id="SEiso" />、<Keyword id="NEiso" /> 和 <Keyword id="NWiso" /> 得到其他三个角。也可以在左上角的视图控件中选择“西南等轴测”，或单击 ViewCube 的一个上角。用 <Command id="VSCURRENT" /> 选择 <Keyword command="VSCURRENT" id="Hidden" /> 可以隐藏后面的边。

### CAD 俯视图的命令是什么？

<Command id="-VIEW" />，然后选择 <Keyword id="Top" />，它还会将 UCS 设置为世界坐标系的轴。<Command id="PLAN" /> 则从正上方观察当前 UCS，并保持其不变。

### CAD 切换到前视图后 UCS 为什么变了？

正交视图会将 UCS 转为正对观察者，使绘制的对象平贴屏幕。执行 <Command id="UCS" /> 并按 Enter 键恢复为世界坐标系；<Command id="U" /> 将视图及其 UCS 一起放弃。

### CAD 等轴测视图和等轴测图是一回事吗？

不是。等轴测视图是从某个角观察三维模型。等轴测图是二维的，用 SNAP 的等轴测样式在等轴测平面上绘制，MellowCAD 尚不具备。

### CAD 视图管理器在哪里？

VIEW 在命令行中执行 <Command id="-VIEW" />：没有视图管理器，命名视图（保存、恢复）在这里也尚不具备。
