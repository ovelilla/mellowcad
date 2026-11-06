---
title: "UCSICON in AutoCAD"
metaTitle: "UCSICON in AutoCAD: UCS icon on, off, origin"
description: "How AutoCAD's UCSICON shows or hides the UCS icon and puts it at the origin or in the corner: ON, OFF, Noorigin, ORigin, and what it shows. Try it free."
figure: "UCSICON Noorigin sends the icon to the corner; UCS moves the origin onto the block's step, and ORigin draws the icon there, its X red, Y green and Z blue."
related: ["UCS", "PLAN", "VIEW"]
coverage: "c9ece977cc06"
---

UCSICON shows or hides the UCS icon, the X and Y arms that show where the current UCS is and which way it points, and says where it sits: at the UCS's origin, or in the lower-left corner of the drawing. Its one prompt offers the current state as the default, so Enter keeps it. The setting is saved in the drawing, and each UCSICON is an undo step.

The icon is AutoCAD 2027's 3D one: an arm for X and one for Y, a letter at each end, and a square at the origin while the UCS is the world's. Off the plan a Z arm shows where the UCS's Z points, and an arm seen end-on is left out. In 2D Wireframe it is white; in Hidden and Conceptual its X is red, Y green and Z blue. Typed with an apostrophe, `'UCSICON` sets the UCSICON variable instead, even inside another command: 0 to 3, where 1 shows the icon and 2 puts it at the origin.

## Options

### ON

Shows the icon.

### OFF

Hides the icon. The UCS is still there, and what you draw still lies in it.

### Noorigin

Keeps the icon in the lower-left corner of the drawing, wherever the origin is.

### ORigin

Draws the icon at the UCS's origin, the default. When the origin is off the screen, or so near its edge that the icon would not fit, the icon goes to the lower-left corner until the origin is back in view.

## Missing

All, which in AutoCAD applies the setting to every viewport (there is only one here); Selectable, the icon's grips; and Properties, the UCS Icon dialog, with the 2D style, the size, the line width and the colours.

## Questions

### How do I turn off the UCS icon in AutoCAD?

Type `UCSICON`, press Enter, then <Keyword id="OFF" />. <Keyword id="ON" /> brings it back.

### How do I move the UCS icon to the origin?

UCSICON, then <Keyword id="ORigin" />: the icon sits on the UCS's origin. If it stays in the corner, the origin is off the screen or too near its edge: pan or zoom out. <Keyword id="Noorigin" /> keeps it in the corner.

### What does the square on the UCS icon mean?

That the UCS is the world coordinate system. Move or turn the UCS with <Command id="UCS" /> and the square goes; <Command id="UCS" /> and Enter bring the world back, and the square with it.

### How do I change the UCS icon's style, size or colour?

In AutoCAD, with UCSICON's Properties, the UCS Icon dialog. MellowCAD does not have it yet: the icon is drawn as AutoCAD 2027 draws it by default, the 3D style.
