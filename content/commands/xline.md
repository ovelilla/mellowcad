---
title: "XLINE in AutoCAD"
metaTitle: "XLINE in AutoCAD: the construction line command"
description: "How AutoCAD's XLINE (XL) draws construction lines of infinite length: through two points, horizontal, vertical, at an angle, bisecting or offset. Try it free."
figure: "Construction lines through a point, a horizontal one, and the bisector of the angle between two lines, each running across the whole view."
related: ["RAY", "LINE", "OFFSET", "TRIM"]
coverage: "a9f522d21bc5"
---

XLINE draws construction lines: lines of infinite length, which run across the whole view however far you pan or zoom, to lay out a drawing before the real lines go in. Pick a point, then a through point: an xline passes through both, and every further point makes another through the first, until Enter ends the command. A through point on the first point is refused with <Message id="invalid" />. Each xline is on the current layer with the current colour, linetype and lineweight.

An xline has no ends: zoom to the drawing's extents and it is left out, as in AutoCAD. The Midpoint snap finds the point it was drawn through, Nearest, Perpendicular and Intersection work along it, and <Command id="TRIM" /> or <Command id="BREAK" /> turn it into a ray, or two, which is how construction lines become drawing lines. <Command id="RAY" /> draws the half of it that starts at a point.

## Options

### Hor

Horizontal xlines, along the UCS's X axis, each through a point you give, until Enter.

### Ver

Vertical xlines, along the UCS's Y axis, each through a point you give.

### Ang

Xlines at an angle: type it, or give two points, then the through points. Enter at the angle takes 0. <Keyword id="Reference" /> measures the angle from a line you select, a line, an xline or a ray, anticlockwise: anything else is refused with <Message id="noUsableObjectSelected" />.

### Bisect

The xline that halves an angle: give its vertex, a point on its first side, then a point on its second side, and the bisector passes through the vertex. Each further point on the second side makes another bisector of the same first side.

### Offset

Xlines parallel to a line object, a line, an xline or a ray: give the distance, select the object and pick the side, again and again until Enter. <Keyword id="Through" /> passes each through a point you give instead. The distance is the one <Command id="OFFSET" /> remembers, and the one it offers next.

## Missing

LENGTHEN and JOIN of a construction line are not checked against AutoCAD yet, nor the menus of its grips.

## Questions

### What is the shortcut for XLINE in AutoCAD?

`XL`, then Enter or Space. The ribbon calls it Construction Line, in the expanded Draw panel; here it is in the Draw tools beside Ray.

### How do I draw a horizontal or vertical construction line?

Run XLINE, type `H` for Hor or `V` for Ver, and pick the points it passes through. Horizontal and vertical are the current UCS's.

### How do I trim a construction line?

With <Command id="TRIM" /> as any line: cut on one side, an xline becomes a ray; cut on both, a line. The same happens with <Command id="BREAK" />.

### Why does ZOOM Extents ignore my construction lines?

An xline has no extents: it runs to infinity both ways. AutoCAD leaves xlines and rays out of the drawing's extents, and so does MellowCAD.

### What is the difference between XLINE and RAY?

An xline runs to infinity both ways; a <Command id="RAY" /> starts at a point and runs one way only.
