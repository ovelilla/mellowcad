---
title: "SLICE in AutoCAD"
metaTitle: "SLICE in AutoCAD: cut 3D solids with a plane"
description: "How AutoCAD's SLICE (SL) works, prompt by prompt: the solids, a plane by two points, 3points, an object or the UCS, then the side to keep. Try it free online."
figure: "A cylinder sliced through its axis by two points, the half on the picked side kept: seen from the south-east."
related: ["SECTION", "SUBTRACT", "UNION", "EXTRUDE"]
coverage: "95423f0dfd53"
---

SLICE cuts 3D solids with a plane and keeps the part on one side of it, or both parts as two solids. It asks for the solids to slice, until Enter: as in AutoCAD 2027, a set selected before it is dropped and asked for again, and what is not a solid is passed over. Then the plane: by default you give two points, and it stands upright through them, square to the UCS's XY plane; the options give it another way. Last, a point on the side to keep, or Enter to keep both.

Every solid of the set is cut by the same plane. One that the plane misses, or only touches on a face, along an edge or at a corner, stays as it was, and SLICE says so. A cut solid is no longer a box or a cylinder, and has no history. The whole command is one undo step. MellowCAD's 3D is still partial: solids exist, surfaces and meshes do not.

## Options

### Object

Takes the plane of an object you pick: a circle, an ellipse, an arc, a 2D polyline or a planar spline, a tilted circle too. A line, or the solid itself, has no plane of its own: it says <Message id="unableToExtractPlane" /> and asks again. Enter ends the command.

### Surface

Asks for a surface to cut along. MellowCAD has no surfaces yet, so a pick says <Message id="noSurfacesSelected" />, and Enter ends the command.

### Zaxis

Asks for a point on the plane, then a point on its Z axis, the line square to it. The two cannot be the same point.

### View

The plane parallel to the screen, through a point you give; Enter takes 0,0,0.

### XY

The UCS's XY plane, through a point you give: a point at a height makes a level cut there. Enter takes the UCS's origin.

### YZ

The UCS's YZ plane, through a point you give; Enter takes the UCS's origin.

### ZX

The UCS's ZX plane, through a point you give; Enter takes the UCS's origin.

### 3points

Three points on the plane, which may then tilt any way. It is the first prompt's default, so Enter there chooses it. The second point must differ from the first, and the third must not lie on the line through them.

### Both

At the side prompt, and its default, so Enter chooses it: both parts are kept. The solid keeps one, and the other becomes a new solid with the same layer, colour, linetype and lineweight, not the current ones. A point instead keeps the side it lies on and discards the other; a point on the plane is refused.

## Missing

Surfaces, as the cutting plane and as objects to slice, and meshes. A planar 3D polyline as the plane's object, which AutoCAD takes. A torus or a revolved solid cut neither square to its axis nor along it, and the other cuts MellowCAD has no exact form for yet, which say that one boolean operation failed.

## Questions

### What is the shortcut for SLICE in AutoCAD?

`SL`, then Enter or Space. The full name works too, and `_SLICE` in any language of AutoCAD.

### How do I use SLICE in AutoCAD 3D?

Select the solid and press Enter. Pick two points the cut runs through: the plane stands upright through them. Then pick a point on the side to keep, or press Enter to keep both halves and move one away with <Command id="MOVE" />. For a cut at an angle, choose <Keyword id="3points" /> and give three points on it.

### Can SLICE cut lines or 2D objects?

No: SLICE cuts 3D solids, and passes lines, regions and blocks over; a set of them alone ends the command. To cut 2D objects, use <Command id="TRIM" /> or <Command id="BREAK" />. In AutoCAD SLICE also cuts surfaces and meshes, which MellowCAD does not have yet.

### Why does SLICE say the slicing plane does not intersect the solid?

Because the plane misses it, or only touches it on a face, along an edge or at a corner: that solid is left whole. Check how the plane was given. With two points it stands upright, so two points on a solid's top face cut it vertically, not level; for a level cut choose <Keyword id="XY" /> and give a point at the height of the cut.
