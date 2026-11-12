---
title: "DIVIDE in AutoCAD"
metaTitle: "DIVIDE in AutoCAD: divide a line or circle"
description: "How AutoCAD's DIVIDE (DIV) works: points or blocks at equal parts of a line, a circle, an arc or a polyline, and why the points seem missing. Try it free."
figure: "PDMODE 3 so the points show as crosses, then a line divided into 5 and a circle into 6, which starts at its 0° point."
related: ["MEASURE", "PTYPE", "POINT", "BREAK"]
coverage: "e55dc9a02b8e"
---

DIVIDE marks an object into equal parts. Select one line, arc, circle, ellipse, elliptical arc, polyline, 3D polyline or spline, by picking it or typing a point on it, then give the number of segments, from 2 to 32767: DIVIDE puts a point object at each division and ends. It does not cut the object, which stays whole. An open object divided into 5 gets 4 points, from its start; a closed one gets 5, its start among them: a circle from its 0° point, counter-clockwise, a closed polyline from its first vertex. The points lie on the object, at its height, on the current layer with the current colour, linetype and lineweight.

The points are drawn as the drawing's point style says, and the default is a dot that hides under the line: set a visible figure with <Command id="PTYPE" />, or PDMODE, first. The whole division is one step that <Command id="U" /> takes back, and its points are the Previous selection set, ready to erase or move. Any other object, a text or a block reference, gets <Message id="cannotDivideObject" />, and the command ends. The Draw tools' Points drop-down starts DIVIDE too.

## Options

### Block

Instead of points, references of a block already in the drawing: give its name, then whether to align each one with the object, <Keyword id="Yes" /> (the default) or <Keyword id="No" />, then the number of segments. Aligned, each reference turns with the object at its place, along a line or tangent to an arc; not aligned, every one keeps the UCS's X. A name with no block behind it is refused, and the name asked again. The block's variable attributes are left out, as in AutoCAD.

## Missing

A helix, which MellowCAD cannot draw yet. Blocks along an object that does not lie in the UCS's plane are laid in the UCS's plane, where AutoCAD's help puts them in the object's own. A circle's points always start along the UCS's X, where AutoCAD starts them at the snap angle, SNAPANG, which MellowCAD does not have.

## Questions

### What is the shortcut for DIVIDE in AutoCAD?

`DIV`, then Enter or Space. The full name works too, and `_DIVIDE` in any language of AutoCAD.

### Why is the DIVIDE command not working?

It most likely is: the points are there, drawn as dots on the line. Open <Command id="PTYPE" /> (`DDPTYPE`) and choose a cross or a circle, or type PDMODE and `3`: every point in the drawing changes at once. To pick them, use the Node object snap, `NOD`.

### How do I divide a line into equal parts?

Run DIVIDE, select the line and type the number of parts, `5` for five. The four points between the parts are where to snap: the Node object snap finds them.

### How do I divide a circle into equal parts?

The same way: select the circle and type the number of parts. A closed object gets as many points as parts, so 6 gives six points, the first at the circle's 0° point, then counter-clockwise.

### How do I split a line into separate pieces?

DIVIDE only marks the places. To cut the line there, use <Command id="BREAK" />, or <Command id="BREAKATPOINT" /> at each point, snapping to it with Node.
