---
title: "PYRAMID in AutoCAD"
metaTitle: "PYRAMID in AutoCAD: 3D pyramid, sides and alias"
description: "How AutoCAD's PYRAMID (PYR) draws a 3D solid pyramid, prompt by prompt: sides, base, height, Edge, Inscribed and Top radius for a frustum. Try it free online."
figure: "A pyramid of six sides, its base 25 to the middle of each side and 40 high, seen from the south-east in the Hidden visual style."
related: ["CONE", "POLYGON", "BOX", "WEDGE"]
coverage: "2bcbeaeb2bb1"
---

PYRAMID draws a 3D solid pyramid: its first line says how many sides the base has and how its radius is read, then it asks for the centre of the base, the radius and the height. The base is a regular polygon, as <Command id="POLYGON" /> draws one, of 4 sides at first: a typed radius turns it towards the cursor, a point towards itself. The height rises along the UCS's Z, a negative one goes down, and a point gives it by how far it is from the base. The sides and how the radius is read are kept for the next PYRAMID; the radius and the height are the primitives' shared defaults. The pyramid lies on the current layer, and Undo takes it back in one step.

<Command id="LIST" /> shows its position, both radii of the base and of the top, its height, rotation and number of sides, and the Properties palette lets you type the radii, the sides and the height. Its grips move it, set its height, and size the base from a corner or the middle of a side. It is a 3D solid for <Command id="UNION" />, <Command id="SUBTRACT" /> and the rest of MellowCAD's 3D, which is solids only and still partial; <Command id="EXPLODE" /> turns it into a region per face.

## Options

### Edge

At the base's centre: asks for both ends of one side of the base, which is drawn to that side's left.

### Sides

At the base's centre: asks for the number of sides, 3 to 32, then the centre again.

### Inscribed

At the radius: reads the radius to a corner of the base, the polygon inscribed in that circle, and asks it again.

### Circumscribed

At the radius, once <Keyword id="Inscribed" /> is chosen: reads the radius to the middle of a side, the polygon round that circle, as at first, and asks it again.

### 2Point

At the height: asks for two points, and the height is the distance between them.

### Axis

At the height: asks for the apex. The pyramid runs from the base's centre to that point in any direction, its base square to the axis.

### Top

At the height: asks for the top radius, read as the base's, then the height again. The pyramid ends in a smaller polygon instead of a point, a frustum; a top as large as the base makes a prism.

## Missing

<Command id="BOX" />'s: Move, Rotate, Scale and Mirror from a hot grip, the 3D commands of its own, and the visual styles <Command id="VSCURRENT" /> lacks. Its type, inscribed or circumscribed, typed in the Properties palette. The dotted dimensions AutoCAD draws while you give the radius and an edge.

## Questions

### What is the shortcut for PYRAMID in AutoCAD?

`PYR`. Type it and press Enter or Space, then give the centre of the base, the radius and the height.

### How do I draw a hexagonal pyramid?

Choose <Keyword id="Sides" /> before the base's centre and type `6`, then give the centre, the radius and the height: `0,0`, `25` and `40` draw the session's pyramid. The next PYRAMID keeps six sides.

### How do I draw a pyramid with a given base side?

Choose <Keyword id="Edge" /> and give both ends of one side: a side from `0,0` to `50,0` makes a square base of 50, with the default 4 sides.

### How do I draw a truncated pyramid?

At the height, choose <Keyword id="Top" />, type the top radius, then the height. The pyramid ends in a smaller polygon, its sides as many as the base's.
