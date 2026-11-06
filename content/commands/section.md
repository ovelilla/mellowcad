---
title: "SECTION in AutoCAD"
metaTitle: "SECTION in AutoCAD: cross-section of 3D solids"
description: "How AutoCAD's SECTION (SEC) makes a region where a plane cuts 3D solids, prompt by prompt: 3points, Object, Zaxis, View, XY, YZ, ZX. Try it free online."
figure: "A block with a hole through it, cut by the ZX plane through the hole's centre: SECTION makes the profile, moved out in front, two rectangles with the hole's gap between."
related: ["SLICE", "REGION", "SUBTRACT", "MASSPROP"]
coverage: "f38dcd242680"
---

SECTION makes a cross-section of 3D solids: a region where a plane cuts each one, and the solids stay as they were. It asks for the solids, until Enter: as in AutoCAD 2027, a set selected before it is dropped and asked for again, what is not a solid is passed over, and a set with none says <Message id="noSolidsSelected" />. Then the plane: by default you give three points on it, and the options give it another way, as at <Command id="SLICE" />.

Each solid the plane cuts gets its region, lying in the plane: a block with a hole through it gives the outline with the hole's gap, a cylinder cut along its axis a rectangle. A plane on one of a solid's faces gives that face. One the plane misses says <Message id="sectionMissedOne" />. The regions take the current layer and properties, not the solid's; <Command id="MOVE" /> takes one out to see it, <Command id="AREA" /> and <Command id="MASSPROP" /> measure it, and <Command id="EXTRUDE" /> turns it into a solid. The whole command is one undo step. MellowCAD's 3D is solids only, and still partial.

## Options

### Object

Takes the plane of an object you pick: a circle, an ellipse, an arc, a 2D spline or a 2D polyline.

### Zaxis

Asks for a point on the plane, then a point on its Z axis, the line square to it.

### View

The plane parallel to the screen, through a point you give.

### XY

The UCS's XY plane, through a point you give: a point at a height makes a level section there. Enter takes the UCS's origin.

### YZ

The UCS's YZ plane, through a point you give; Enter takes the UCS's origin.

### ZX

The UCS's ZX plane, through a point you give; Enter takes the UCS's origin. The session's section is this plane through the hole's centre.

### 3points

Three points on the plane, which may then tilt any way. It is the first prompt's default, so a point there is the first of the three.

## Missing

Surfaces and meshes, which MellowCAD does not have. A planar 3D polyline as the plane's object, which AutoCAD takes. The cuts MellowCAD has no exact form for yet, as at <Command id="SLICE" />, which say that one boolean operation failed. SECTIONPLANE and live sectioning, which AutoCAD's ribbon offers in SECTION's place: here SECTION is typed.

## Questions

### How do I make a section of a 3D solid in AutoCAD?

Run SECTION, select the solid and press Enter, then give the plane: <Keyword id="ZX" /> and a point through the middle cuts it front to back, <Keyword id="XY" /> and a point at a height cuts it level. The region lies inside the solid: <Command id="MOVE" /> it out to see it.

### What is the difference between SECTION and SLICE?

<Command id="SLICE" /> cuts the solid in two and keeps one part or both. SECTION leaves the solid whole and draws a region where the plane cuts it.

### What is the shortcut for SECTION in AutoCAD?

`SEC`, then Enter or Space.

### Why does SECTION say the plane does not intersect the solid?

The plane misses it: check how you gave it. <Keyword id="XY" />, <Keyword id="YZ" /> and <Keyword id="ZX" /> are the UCS's planes, so a point at the wrong height or side puts the plane outside the solid.
