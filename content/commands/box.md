---
title: "BOX in AutoCAD"
metaTitle: "BOX in AutoCAD: 3D box command and options"
description: "How AutoCAD's BOX draws a 3D solid box, prompt by prompt: two corners and a height, Center, Cube, Length and 2Point. Try it free in your browser."
figure: "A box 60 by 40 by 25, from two corners and a height, seen from the south-east in the Hidden visual style."
related: ["WEDGE", "CYLINDER", "EXTRUDE", "UNION"]
coverage: "df8ced3ccdc9"
---

BOX draws a 3D solid box with its sides along the UCS's axes: give the first corner, the other corner, then the height. The height rises along the UCS's Z, a negative one goes down, and a point gives it by how far it is from the corner; a corner given at another Z than the first sets the height without asking. The last height, and the last length and width of a cube or Length, are offered as defaults that Enter takes, shared with the other primitives and <Command id="EXTRUDE" />. The box lies on the current layer, and Undo takes it back in one step.

The box keeps its sizes: <Command id="LIST" /> shows its position, length, width, height and rotation, and the Properties palette lets you type the first four. Its grips move it, stretch it and, off the plan, set its height. It is a 3D solid for <Command id="UNION" />, <Command id="SUBTRACT" /> and the rest of MellowCAD's 3D, which is solids only and still partial.

## Options

### Center

At the first prompt: asks for the centre, then a corner, <Keyword id="Cube" /> or <Keyword id="Length" />. The box is centred on the point, in height too.

### Cube

At the other corner: asks for a length, typed or shown, and makes a cube with every side that long. A typed length runs towards the cursor, a negative one away from it.

### Length

At the other corner: asks for the length, then the width. The length runs towards the cursor, so the box can lie at an angle; the width goes to the side the cursor is on.

### 2Point

At the height: asks for two points, and the height is the distance between them.

## Missing

Move, Rotate, Scale and Mirror from a hot grip, which AutoCAD cycles with Enter. The 3D commands of its own — 3DMOVE, 3DROTATE, 3DSCALE, MIRROR3D, ROTATE3D, ALIGN, 3DALIGN — with their gizmos, and moving its faces, edges and vertices one by one. The dynamic UCS. The dotted dimensions AutoCAD draws while you give the corner, the length and the width. <Command id="FILLET" /> and <Command id="CHAMFER" /> of its edges, which <Command id="FILLETEDGE" /> and <Command id="CHAMFEREDGE" /> do. Solid History's Record History and Show History, and the Material row. The visual styles <Command id="VSCURRENT" /> lacks beyond 2D Wireframe, Hidden and Conceptual.

## Questions

### How do I draw a 3D box in AutoCAD?

Run BOX, give one corner, then the opposite corner, then the height: `0,0`, `60,40` and `25` draw the session's box. <Keyword id="Length" /> and a width, instead of the opposite corner, turn the box to any angle.

### Why does my box look like a rectangle?

You are looking at it from above, in plan. Turn the view: a corner of the ViewCube, <Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" />, or <Command id="3DORBIT" />. <Command id="VSCURRENT" /> with <Keyword command="VSCURRENT" id="Hidden" /> hides the edges behind it.

### How do I draw a cube?

Give the first corner, then choose <Keyword id="Cube" /> and type the length of a side.

### How do I draw a box from its centre?

Choose <Keyword id="Center" /> and give the centre point, then a corner, <Keyword id="Cube" /> or <Keyword id="Length" />: the box is centred on the point, in height too.
