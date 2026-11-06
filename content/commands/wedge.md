---
title: "WEDGE in AutoCAD"
metaTitle: "WEDGE in AutoCAD: 3D wedge command and options"
description: "How AutoCAD's WEDGE (WE) draws a 3D solid wedge, prompt by prompt: two corners and a height, Center, Cube, Length and 2Point. Try it free in your browser."
figure: "A wedge 60 by 40 by 25, from two corners and a height, its slope falling from the first corner's end, seen from the south-east in the Hidden visual style."
related: ["BOX", "PYRAMID", "EXTRUDE", "UNION"]
coverage: "1282c3aa0398"
---

WEDGE draws a 3D solid wedge: a box whose top slopes from one end down to the other. It asks what <Command id="BOX" /> asks: the first corner, the other corner, then the height. The tall end is at the first corner, and the slope falls along the UCS's X to the other corner's side; a corner at a smaller X turns it round. The height rises along the UCS's Z, a negative one goes down. The length, width and height are <Command id="BOX" />'s defaults, which Enter takes. The wedge lies on the current layer, and Undo takes it back in one step.

<Command id="LIST" /> shows its position, length, width, height and rotation, and the Properties palette lets you type them. Its grips are <Command id="BOX" />'s. It is a 3D solid for <Command id="UNION" />, <Command id="SUBTRACT" /> and the rest of MellowCAD's 3D, which is solids only and still partial; <Command id="EXPLODE" /> turns it into a region per face.

## Options

### Center

At the first prompt: asks for the centre, then a corner, <Keyword id="Cube" /> or <Keyword id="Length" />. The wedge is centred on the point, in height too, its tall end opposite the corner given.

### Cube

At the other corner: asks for a length and makes a wedge with every side that long. Unlike <Command id="BOX" />'s, it runs along the UCS's X, backwards when negative.

### Length

At the other corner: asks for the length, along the UCS's X, then the width, along its Y; a negative one runs backwards. A point gives only its distance, never its heading.

### 2Point

At the height: asks for two points, and the height is the distance between them.

## Missing

<Command id="BOX" />'s: Move, Rotate, Scale and Mirror from a hot grip, the 3D commands of its own, the dotted dimensions while you give the corner, and the visual styles <Command id="VSCURRENT" /> lacks. In plan, the Endpoint snap under the tall end finds the top's corner, where AutoCAD finds the base's.

## Questions

### What is the shortcut for WEDGE in AutoCAD?

`WE`. Type it and press Enter or Space, then give the first corner, the other corner and the height: `0,0`, `60,40` and `25` draw the session's wedge.

### Which way does the wedge slope?

Down from the first corner's end, along the UCS's X. To turn it, give the other corner at a smaller X, which turns it 180°, or rotate it afterwards with <Command id="ROTATE" />.

### How do I draw a triangular prism?

A wedge is one: a right triangle at each end, swept along the width. For any other triangle, draw it closed with <Command id="PLINE" /> and <Command id="EXTRUDE" /> it.

### How do I draw a wedge from its centre?

Choose <Keyword id="Center" /> and give the centre point, then a corner, <Keyword id="Cube" /> or <Keyword id="Length" />: the wedge is centred on the point, in height too.
