---
title: "REGION in AutoCAD"
metaTitle: "REGION in AutoCAD: command, loops and alias"
description: "How AutoCAD's REGION (REG) turns closed shapes into regions, which loops it finds, why it makes none, and what a region is for. Try it free in your browser."
figure: "Four lines closed end to end and a circle inside them: REGION, with a window round both, makes two regions and erases the objects."
related: ["SUBTRACT", "UNION", "EXTRUDE", "AREA", "MASSPROP"]
coverage: "341f131dab32"
---

REGION turns closed shapes into regions: flat areas with no thickness, each bounded by its loops. Select the objects and press Enter; every loop they make becomes a region. A closed object is a loop of its own: a circle, an ellipse, a closed polyline or spline. Open ones — lines, arcs, elliptical arcs, open polylines and splines — are chained end to end, never where they cross, and a chain that does not close is dropped. The command line then counts the loops it found, those it rejected and why, and the regions it created; Enter on nothing says <Message id="regionNoneFound" />.

The objects that went into a region are erased, the others kept, and the regions take the current layer and properties, not the objects'. A loop inside another makes a region of its own, not a hole in it: <Command id="SUBTRACT" /> takes one from the other. A region draws as its edges and snaps at them; the Properties palette shows its area and perimeter, which <Command id="AREA" />, <Command id="LIST" /> and <Command id="MASSPROP" /> measure too. <Command id="UNION" />, <Command id="SUBTRACT" /> and <Command id="INTERSECT" /> combine regions in one plane, <Command id="EXTRUDE" />, <Command id="REVOLVE" /> and <Command id="PRESSPULL" /> turn them into 3D solids, and <Command id="EXPLODE" /> gives back their lines, arcs and circles. The whole command is one undo step.

## Missing

AutoCAD's `DELOBJ`: the objects that went into a region are always erased here. BOUNDARY, which can make a region from the area round a point, and a region from a hatch's boundary. Editing a region by its grips: they show, but dragging one changes nothing. Its edges as a cutting or boundary edge for <Command id="TRIM" /> and <Command id="EXTEND" /> in Quick mode, and <Command id="HATCH" /> of a region with an elliptical or spline edge. Regions combined with surfaces, which MellowCAD does not have, and the Material row in the Properties palette.

## Questions

### How do I use the REGION command in AutoCAD?

Run REGION (or `REG`), select the closed shapes or the lines that close one end to end, and press Enter. The session's window round four lines and a circle makes two regions, and the command line counts two loops extracted and two regions created.

### Why does REGION not create a region?

The shape is not closed end to end. Lines that cross, or that stop short of one another, close nothing: REGION chains open objects only by their ends, and a gap of a hair is enough to drop the chain. A loop that crosses itself, like a bow tie, is rejected and counted under self intersections. Join the ends with <Command id="FILLET" /> at radius 0, or <Command id="TRIM" /> what overshoots, and try again.

### How do I make a region with a hole?

Make a region of the outline and one of the hole, then run <Command id="SUBTRACT" />: pick the outline, Enter, the hole, Enter. The result is one region, and <Command id="EXTRUDE" /> turns it into a solid with the hole through it.

### How do I find the area of a region?

Select it and read Area in the Properties palette, or run <Command id="AREA" />, choose <Keyword command="AREA" id="Object" /> and pick it. <Command id="MASSPROP" /> adds the perimeter, the centroid and the moments of inertia.
