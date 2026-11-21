---
title: "AutoCAD ZOOM（缩放）命令"
metaTitle: "CAD视图缩放命令（ZOOM）范围、窗口与快捷键 Z"
description: "AutoCAD ZOOM（视图缩放，快捷键 Z）怎么用：范围、窗口、上一个、比例与 nX、对象和全部，鼠标滚轮，以及在命令中透明缩放。在线免费试用。"
figure: "角落附近有一个小孔的板：先执行 ZOOM 范围，再用窗口框住小孔，小孔随即充满视图。"
sourceHash: "cd72af4956e4"
---

ZOOM（缩放）命令放大或缩小视图；图形中的对象既不移动，也不改变大小。其第一个提示接受一个角点（开始窗口缩放）、一个比例因子或一个选项。加撇号输入 `'ZOOM` 或 `'Z`，可以在其他命令中透明使用，之后该命令继续。鼠标滚轮以光标为中心放大和缩小，双击滚轮按钮相当于 ZOOM 范围。每次 ZOOM 是一个放弃步骤，连续的多次 ZOOM 合为一步，因此 <Command id="U" /> 也会撤销视图的变化。

## Options

### All

与 <Keyword id="Extents" /> 一样，显示所有已绘制的对象。

### Extents

在窗口允许的范围内尽可能大地显示所有已绘制的对象。没有绘制任何对象时，显示 <Message id="regeneratingModel" />；在其他命令中输入时，它会拒绝并显示 <Message id="requiresRegen" />，与 AutoCAD 相同。

### Previous

恢复为之前的视图，最多可后退 20 个视图。没有可恢复的视图时：<Message id="noPreviousView" />。

### Scale

比例因子：`2X` 将当前视图放大为两倍，`0.5X` 缩小为一半，不带 X 的 `2` 为 ZOOM 全部视图比例的两倍。图纸空间的比例因子 `nXP` 按 `nX` 读取：这里只有模型空间。在第一个提示下输入比例因子，不选择该选项也有同样效果。

### Window

拾取或拖动两个角点，显示该矩形区域。在第一个提示下拾取角点，效果相同。

### Object

显示所选的对象，或 ZOOM 之前选择的对象。

## Missing

实时：在第一个提示下按 Enter 键会结束 ZOOM，而 AutoCAD 会开始用鼠标实时缩放；这里由滚轮完成这一功能。没有动态、中心以及隐藏的左和 Vmax 选项。

## Questions

### CAD视图缩放的快捷键是什么？

输入 `Z`，然后按 Enter 键或空格键。也可以输入完整的命令名；在任何语言版本的 AutoCAD 中，`_ZOOM` 都有效。输入 `Z` 再输入 `E`，即为 ZOOM 范围。

### CAD怎么显示全部图形？

使用 <Keyword id="Extents" />：输入 `Z`，按 Enter 键，输入 `E`，按 Enter 键。或者双击鼠标滚轮按钮。

### CAD里 ZOOM XP 是什么意思？

`nXP` 按相对于图纸空间的比例缩放布局视口：`1/50XP` 使模型在图纸上以 1:50 显示。MellowCAD 没有布局，因此 `XP` 按 `X` 读取。

### CAD怎么缩放到某个对象？

选择 <Keyword id="Object" /> 并选择对象，或先选择对象再执行 ZOOM 对象：视图将其完整显示。

### CAD怎么返回上一个视图？

使用 <Keyword id="Previous" />，反复执行可以依次返回之前的视图，最多 20 个。
