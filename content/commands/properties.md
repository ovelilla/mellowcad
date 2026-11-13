---
title: "PROPERTIES in AutoCAD"
metaTitle: "PROPERTIES in AutoCAD: the palette, Ctrl+1, PR"
description: "How AutoCAD's PROPERTIES palette (PR, Ctrl+1) works: General and Geometry rows, *VARIES*, one object type at a time, the current settings. Try it free online."
figure: "A circle selected at the Command prompt, its grips showing, then PROPERTIES: the palette opens beside the drawing on the circle's rows."
related: ["MATCHPROP", "LAYER", "LIST", "COLOR"]
coverage: "42267b03e3fa"
---

PROPERTIES opens the Properties palette. As in AutoCAD it is a palette, not a dialog: it stays open beside the drawing, here as a tab of the palette panel, while you select and draw, until <Command id="PROPERTIESCLOSE" /> closes it. Ctrl+1 shows and hides it, and typed with an apostrophe, `'PROPERTIES`, it opens inside a running command. On a wide window it is open from the start.

With objects selected, it shows their properties, and you change one by typing or choosing a new value in its row. General comes first, in AutoCAD's order: Color, Layer, Linetype, Lineweight and Thickness, `*VARIES*` where the selected objects differ. Below it each type's own rows: a line's start and end points, length and angle; a circle's centre, radius, diameter, circumference and area; an arc's, an ellipse's, a polyline's vertices and widths, a spline's points, a text's, a block reference's. Coordinates are in the current UCS, and rows that only report, such as a line's Length, are greyed. The drop-down at the top lists `All` and each type with its count: choose one to see and edit only that type. With nothing selected, General shows the current layer, colour, linetype and lineweight, which you set there for new objects. Each edit is one step that <Command id="U" /> takes back.

## Missing

General's Linetype scale for several objects at once or, with none selected, for new ones (CELTSCALE); Plot style, Transparency and Hyperlink, and Material. The geometry rows of several objects of one type at once, a text's contents and attribute values cannot be edited here. Quick Select, the PICKADD toggle, auto-hide, docking and floating the palette.

## Questions

### What is the shortcut for PROPERTIES in AutoCAD?

Ctrl+1, which also hides the palette again. Typed: `PR`, `CH` or `MO`, then Enter or Space. The full name works too, and `_PROPERTIES` in any language of AutoCAD.

### The Properties palette has disappeared: how do I get it back?

Press Ctrl+1 or type `PR`: the palette shows again, as a tab of the palette panel beside the drawing. Ctrl+1 pressed while it shows hides it, which is often how it went.

### How do I change the properties of several objects at once?

Select them all, then change the row: every selected object takes the new value. A row whose values differ says `*VARIES*` until you set it. To change only the circles, say, among them, choose that type in the drop-down at the top.

### What is the difference between PROPERTIES and MATCHPROP?

PROPERTIES shows and sets the values of the objects selected. <Command id="MATCHPROP" /> copies them from one object to others, without typing a value.
