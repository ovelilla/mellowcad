---
title: "AutoCAD 3DORBIT（三维动态观察）命令"
metaTitle: "CAD 三维动态观察（3DORBIT）怎么用与快捷键 3DO"
description: "CAD 三维动态观察快捷键是什么？3DORBIT（3DO、ORBIT）拖动时旋转视图；如何退出，按住 Shift 键和滚轮动态观察，以及如何回到平面视图。在浏览器中免费试用。"
figure: "先在平面视图中看到的长方体：3DORBIT，横向和向下拖动，再按 Enter 键，从前方角点的上方看到长方体。"
sourceHash: "66fc1859c8fd"
---

3DORBIT（三维动态观察）命令在拖动时使视图绕图形旋转；图形中的对象不会移动或改变。横向拖动使相机绕世界坐标系的 Z 轴转动，上下拖动使相机升高或降低，旋转中心是屏幕中央下方的图形中部，使用平行投影。命令开始时先提示如何退出：命令运行期间只能动态观察，无论是否拖动，按 Enter 键或 Esc 键都会结束命令。

按住 Shift 键和鼠标滚轮可以在任何时候动态观察，即使在其他命令中也可以；导航栏上的“动态观察”按钮同样运行此命令。加撇号输入 `'3DORBIT`，可以在其他命令中透明使用，结束后继续原来的命令。每次拖动都是 <Command id="ZOOM" /> 的 <Keyword command="ZOOM" id="Previous" /> 可以返回的一步，整个命令是一个放弃步骤，因此 <Command id="U" /> 会恢复视图。要将实体显示为实体而不是线框，请使用 <Command id="VSCURRENT" />；MellowCAD 的三维仅限实体，目前仍不完整。

## Missing

快捷菜单，以及其中的投影方式、视觉样式和其他导航模式。只绕选定对象动态观察。透视投影。3DFORBIT、3DCORBIT 以及 AutoCAD 的其他三维导航命令。

## Questions

### CAD 三维动态观察快捷键是什么？

输入 `3DO` 或 `ORBIT`，然后按 Enter 键或空格键。不输入任何内容时，按住 Shift 键和鼠标滚轮并拖动即可。

### CAD 怎么用鼠标旋转三维视图？

按住 Shift 键，按下鼠标滚轮并拖动：横向拖动使模型转动，上下拖动从较高或较低的位置观察。松开后，回到原来所在的命令。

### CAD 三维动态观察怎么退出？

按 Enter 键或 Esc 键。视图保持在松开时的位置。

### CAD 动态观察后怎么回到平面视图？

运行 <Command id="PLAN" /> 并按 Enter 键，或者运行 <Command id="-VIEW" /> 并选择 <Keyword command="VIEW" id="Top" />，或者单击 ViewCube 的顶面。<Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> 每次退回一次拖动。
