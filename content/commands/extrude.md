---
title: "EXTRUDE in AutoCAD"
metaTitle: "EXTRUDE in AutoCAD: command, taper and alias"
description: "How AutoCAD's EXTRUDE (EXT) turns a closed 2D profile into a 3D solid, prompt by prompt: the height, Direction, Taper angle. Try it free in your browser."
figure: "A closed L-shaped polyline extruded 20 into a solid, then seen from the south-east in the Hidden visual style."
related: ["PRESSPULL", "REVOLVE", "REGION", "SUBTRACT"]
coverage: "870020bf2a80"
---

EXTRUDE turns closed 2D profiles into 3D solids, each pulled straight out of its plane by the height you give. Select the profiles — circles, ellipses, closed polylines or splines, regions — and press Enter, then type the height or show it with a point; the last height is the next run's default. Each profile becomes a solid of its own, on the current layer, and is erased, as DELOBJ says by default. The whole command is one step that Undo takes back.

MellowCAD's 3D is solids only, and still partial: an open profile, which AutoCAD turns into a surface, gets <Message id="sweepRefusedType" /> and is removed from the selection.

## Options

### MOde

Asks for <Keyword id="SOlid" /> or <Keyword id="SUrface" />. <Keyword id="SOlid" /> is the default and the one there is: with no surface objects yet, <Keyword id="SUrface" /> is refused.

### Direction

Instead of a height, two points give the direction and the length: the profiles are extruded along that line, slanted if it is. A direction lying in the profile's plane gets <Message id="directionParallel" />, and the command ends.

### Path

Listed, as in AutoCAD, but not built: choosing it is refused, and the height is asked again.

### Taper

Asks for an angle between −90 and 90 degrees, then the height again: a positive angle narrows the solid as it rises, a negative one widens it. A circle that closes before the height ends in a point, a cone; a profile the taper cannot take makes nothing.

### Expression

The height as an expression: `2*3` is 6. Only arithmetic so far.

## Missing

Path, the sweep along a path. SUrface mode and open profiles, which AutoCAD makes surfaces of: there are no surface objects yet. The faces of solids and the areas a click finds inside objects, which <Command id="PRESSPULL" /> takes. A taper on an ellipse, a spline, or an arc meeting the next segment at a corner. Expression's parameters and functions. <Command id="EXPLODE" /> of an extruded solid with curved sides, which AutoCAD turns into surfaces and regions. Its grips, and its height and taper angle edited in the Properties palette.

## Questions

### What is the shortcut for EXTRUDE in AutoCAD?

`EXT`, then Enter or Space. The full name works too, and `_EXTRUDE` in any language of AutoCAD.

### How do I extrude a 2D drawing into 3D?

Draw the outline as one closed object — a closed polyline, a circle, or a region — run EXTRUDE, select it, press Enter and type the height. From above, a solid looks like its outline: turn the view with the ViewCube, or <Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" />, to see it in 3D.

### Why does EXTRUDE not make a solid?

The profile is open, or crosses itself. A line, an arc or an open polyline makes a surface in AutoCAD, and MellowCAD has none yet: EXTRUDE says <Message id="sweepRefusedType" /> and removes them from the selection; a profile that crosses itself gets <Message id="sweepSelfIntersecting" />, and is removed too. Join the pieces with <Command id="JOIN" />, make a region of them with <Command id="REGION" />, or click inside them with <Command id="PRESSPULL" />.

### How do I extrude a shape with a hole?

Make one region of it: <Command id="REGION" /> on the outline and the hole, then <Command id="SUBTRACT" /> the hole's region from the outline's. Extrude that region, and the hole runs through the solid. Or run <Command id="PRESSPULL" /> and click between the outline and the hole.

### How do I extrude along a path?

Not yet: <Keyword id="Path" /> is listed but refused, and SWEEP is not built. <Keyword id="Direction" /> extrudes along the straight line between two points.
