---
title: "AutoCAD UCS（用户坐标系）命令"
metaTitle: "CAD用户坐标系 UCS 怎么用：选项与恢复世界坐标"
description: "AutoCAD UCS 怎么移动和旋转用户坐标系：按提示顺序说明原点与三点、对象、视图、X、Y、Z、Z 轴、命名、世界，以及怎么恢复世界坐标系。在线免费试用。"
figure: "从东南方向观察的长方体：UCS 将原点移到其顶面，之后在 30,20 处画的圆位于顶面上，而不是地面上。"
sourceHash: "8ac3b844fe16"
---

UCS 命令设置用户坐标系：在空间中任意位置的原点以及 X 轴和 Y 轴，因此其 XY 平面可以倾斜。输入的坐标在其中读取，绘制的对象位于其 XY 平面上：将原点移到长方体的顶面后，圆心为 `30,20` 的圆位于顶面上。它首先显示当前 UCS 的名称（`*WORLD*`、`*NO NAME*` 或保存时的名称），然后询问新原点或选项；在此处按 Enter 键恢复为世界坐标系。指定的点为原点，包括其 Z 值；没有 Z 值的点位于当前标高。然后询问正 X 轴上的一点和 XY 平面上的一点，均在当前 UCS 中读取：在任一提示下按 Enter 键，保持轴不变。一点移动 UCS；三点可以将其转向任意方向。

之后，命令在 UCS 的 XY 平面上工作：<Command id="LINE" /> 和 <Command id="CIRCLE" /> 在其上绘制，<Command id="BOX" /> 和 <Command id="EXTRUDE" /> 从其上沿其 Z 方向升起。UCS 改变时，每个对象保持其自身的平面；<Command id="PLAN" /> 从正上方观察当前 UCS。UCS 保存在图形中，每次执行是一个放弃步骤。MellowCAD 的三维只有实体，并且仍不完整。

## Options

### Face

与 AutoCAD 2027 一样列出，用于将 UCS 与实体的面对齐。MellowCAD 会询问面，但尚不能与面对齐：每次拾取都找不到面。

### NAmed

按名称保存的 UCS。<Keyword id="Save" /> 保存当前 UCS，替换已保存的名称之前询问 <Keyword id="Yes" /> 或 <Keyword id="No" />；<Keyword id="Restore" /> 将已保存的 UCS 置为当前，名称不区分大小写；<Keyword id="Delete" /> 删除名称，可以用逗号分隔，也可以使用通配符；<Keyword id="?" /> 列出它们，各附其原点和轴。名称可以包含空格，但不能包含 `<>/\":;|,=*?` 或反引号：<Message id="invalidUcsName" />。

### OBject

将 UCS 与拾取的对象对齐：直线、圆、圆弧、椭圆、多段线、样条曲线、单行文字、多行文字、属性定义或块参照。原点和 X 轴按 AutoCAD 对各类对象的规则放置，Z 为对象自身的法线，因此 UCS 位于对象所在的平面上。可以拾取锁定图层上的对象。拾取图案填充时显示 <Message id="ucsNoCoordinateSystem" />，UCS 结束，UCS 保持原样。

### Previous

恢复为之前的 UCS，一次会话中最多可后退十个，包括命名的和正交的 UCS。没有可恢复的 UCS 时：<Message id="noPreviousUcs" />。

### View

将 XY 平面转到与视线垂直，X 沿屏幕水平方向，原点保持不变：之后书写的文字在三维视图中平贴屏幕显示。

### World

恢复为世界坐标系，世界坐标系从不移动。它是第一个提示的默认值，因此在该提示下按 Enter 键即选择它，并且还会将标高恢复为 0。

### X

绕 UCS 的 X 轴旋转：默认 90 度，可以输入角度，或指定一点来确定角度。正角度按右手定则旋转，因此 90 使 XY 平面绕原 X 轴竖立起来。

### Y

绕 UCS 的 Y 轴旋转，与 <Keyword id="X" /> 绕 X 轴旋转相同。

### Z

绕 UCS 的 Z 轴旋转，与 <Keyword id="X" /> 绕 X 轴旋转相同：从上方看，30 使 X 和 Y 逆时针旋转 30 度。

### ZAxis

指定新原点（按 Enter 键保持当前原点），然后指定正 Z 轴上的一点：XY 平面与其垂直，X 与世界坐标系的 XY 平面保持水平。两点重合时显示 <Message id="pointsAreCoincident" />。其 <Keyword id="Object" /> 接受直线、圆弧、开放的多段线或样条曲线：原点位于靠近拾取点的端点，Z 沿对象指向远离该端点的方向。

## Missing

<Keyword id="Face" /> 用于将 UCS 与实体的面对齐：它会询问面，但尚找不到面。第一个提示中列出的“应用”和“截面”在这里会被拒绝，因为只有一个视口，也没有截面对象。没有 UCS 对话框（UCSMAN）、图标的夹点及其右键菜单，放置新 UCS 时图标也不会显示它。十字光标不随 UCS 旋转：它在屏幕上保持直立，直到 <Command id="PLAN" /> 使视图与 UCS 对齐。没有 UCSFOLLOW、UCSVP 和动态 UCS。不能对标注使用 <Keyword id="OBject" />，拾取时也没有“编组”。正交 UCS 不保留其深度。长列表中没有“按 ENTER 键继续”的暂停。

## Questions

### CAD坐标系怎么恢复成世界坐标？

执行 UCS 并按 Enter 键：<Keyword id="World" /> 是默认值。要重新从正上方观察图形，请执行 <Command id="PLAN" /> 并选择 <Keyword command="PLAN" id="World" />。

### CAD的 UCS 坐标系怎么旋转？

执行 UCS，选择 <Keyword id="Z" /> 并输入角度：`30` 使 X 和 Y 逆时针旋转 30 度。<Keyword id="X" /> 和 <Keyword id="Y" /> 使 XY 平面向上倾斜，默认 90 度。

### CAD的 UCS 和 WCS 有什么区别？

世界坐标系（WCS）从不移动；用户坐标系（UCS）是可以移动和旋转的坐标系。开始时两者相同，UCS 显示当前坐标系为 `*WORLD*`。输入的坐标在 UCS 中读取，绘制的对象位于其 XY 平面上。

### CAD怎么在三维实体的面上画图？

将 UCS 移到该面上。对于长方体的顶面，只移动原点就够了：执行 UCS，指定顶面的一个角点，然后按 Enter 键，与演示相同。对于侧面，指定三点：原点在一个角点，X 方向沿一条边取一点，Y 方向在该面上再取一点。然后绘图：绘制的对象位于该面上。
