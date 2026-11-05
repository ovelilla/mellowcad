---
title: "INTERSECT in AutoCAD"
metaTitle: "INTERSECT in AutoCAD: keep what solids share"
description: "How AutoCAD's INTERSECT (IN) works: two or more 3D solids, or regions in one plane, cut down to what they all share, the rest erased. Try it free online."
figure: "A box and a sphere that overlaps it, intersected: what they share is a ball with six flat faces, seen from the south-east."
related: ["UNION", "SUBTRACT", "SLICE", "REGION"]
coverage: "895b786600ba"
---

INTERSECT keeps only what two or more 3D solids have in common, or two or more regions in one plane, and erases the rest: a box and a sphere that overlaps it leave a ball with flat faces. It asks for objects until Enter, as <Command id="UNION" /> does, and passes over what is neither a solid nor a region. As in AutoCAD 2027, a set selected before it is dropped and asked for again. Solids and regions are worked out apart, the regions plane by plane.

The object picked first becomes the result, with its layer and colour, and the others are erased; with a window, a crossing or ALL it is the newest of them. The result is a composite solid, no longer a box or a sphere, with no history. When the objects have nothing in common it says <Message id="nullSolid" /> or <Message id="nullRegion" /> and erases them all, as AutoCAD does. The whole command is one undo step. MellowCAD's 3D is still partial: solids exist, surfaces and meshes do not.

## Missing

Surfaces, which do not exist here. Curved faces that meet along a curve MellowCAD has no exact form for yet: cylinders, cones, spheres or tori whose axes neither coincide nor run parallel (two cylinders may also cross); a cone with anything but a plane or a solid on its axis; a torus or a revolved solid with a plane neither square to its axis nor through it, or with a solid off its axis; an extruded solid with anything but a plane or a face extruded its way. These are refused with a message that one boolean operation failed, and the solids left as they were; so are a cut that meets an edge tangentially, faces almost but not quite on one surface, and a very thin sliver between a cut and an edge. A cylinder lying along a box's face unites into the right volume, but with one edge and one face fewer than AutoCAD's. No solid history is kept (SOLIDHIST, SHOWHISTORY), and which object a Fence or Previous keeps is unverified.

## Questions

### What is the shortcut for INTERSECT in AutoCAD?

`IN`, then Enter or Space. The full name works too, and `_INTERSECT` in any language of AutoCAD.

### What is the difference between UNION, SUBTRACT and INTERSECT?

All three make one object of 3D solids, or of regions in one plane. <Command id="UNION" /> keeps everything any of them covers, <Command id="SUBTRACT" /> keeps the first set less the second, and INTERSECT keeps only what all of them share. Each is one undo step, and each erases the objects it used up.

### How do I intersect lines in AutoCAD?

Not with INTERSECT, which works on solids and regions and passes lines over. To find where two lines cross, snap to it with the Intersection object snap; to make them meet, use <Command id="FILLET" /> with a radius of 0, <Command id="TRIM" /> or <Command id="EXTEND" />.

### Why does INTERSECT delete my objects?

Because they have nothing in common: with no shared part it says <Message id="nullSolid" />, or <Message id="nullRegion" /> for regions, and erases them, as AutoCAD does. <Command id="U" /> brings them back. One solid and one region, or two regions in different planes, are not intersected at all: it says <Message id="booleanNeedsTwo" /> and changes nothing.
