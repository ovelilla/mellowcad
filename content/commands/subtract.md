---
title: "SUBTRACT in AutoCAD"
metaTitle: "SUBTRACT in AutoCAD: cut solids and regions"
description: "How AutoCAD's SUBTRACT (SU) works: the solids or regions to keep, Enter, then those to take away from them, holes and areas included. Try it free online."
figure: "A cylinder taken out of a box by SUBTRACT, a hole through it: the box picked first, then the cylinder."
related: ["UNION", "INTERSECT", "REGION", "CYLINDER", "SLICE"]
coverage: "895b786600ba"
---

SUBTRACT takes 3D solids away from other solids, or regions away from regions in the same plane: a cylinder taken out of a box leaves a hole through it, a circle taken out of a square a square with a hole. It asks twice. First it says <Message id="subtractFrom" /> and asks for the objects to keep, until Enter; then <Message id="subtractWhat" /> and asks for the objects to take away, until Enter again. As in AutoCAD 2027, a set selected before it is dropped and asked for again.

The first set's solids become one solid, and every solid of the second set is taken out of it and erased, whether it overlapped or not. Regions go plane by plane: the first set's regions in a plane are joined, the second set's in that plane are taken out of them and erased, and a region in a plane where the first set has none is left as it was. A solid result is a composite solid, no longer a box or a cylinder, with no history. When nothing is left it says <Message id="nullSolid" /> or <Message id="nullRegion" /> and erases them. The whole command is one undo step. MellowCAD's 3D is still partial: solids exist, surfaces and meshes do not.

## Missing

Surfaces, which do not exist here. Curved faces that meet along a curve MellowCAD has no exact form for yet: cylinders, cones, spheres or tori whose axes neither coincide nor run parallel (two cylinders may also cross); a cone with anything but a plane or a solid on its axis; a torus or a revolved solid with a plane neither square to its axis nor through it, or with a solid off its axis; an extruded solid with anything but a plane or a face extruded its way. These are refused, and the solids left as they were; so are a cut that meets an edge tangentially, faces almost but not quite on one surface, and a very thin sliver between a cut and an edge. Previous after SUBTRACT says there is no previous selection set, where AutoCAD finds none of the erased objects. No solid history is kept (SOLIDHIST, SHOWHISTORY).

## Questions

### What is the shortcut for SUBTRACT in AutoCAD?

`SU`, then Enter or Space. The full name works too, and `_SUBTRACT` in any language of AutoCAD.

### How do I subtract one solid from another?

Draw the solid to take away where it overlaps the other: a cylinder through a box, for a hole. Run SUBTRACT, pick the box and press Enter, then pick the cylinder and press Enter: the box is left with a hole and the cylinder is gone. The order matters, as what you pick first is what remains.

### Why is SUBTRACT not working?

Often the order: what to keep goes in the first set, what to take away in the second. When the first set holds no solid or region, or the second holds none that is not in the first already, it says <Message id="noSolidsOrRegionsSelected" /> and ends; when nothing of the second can be taken out of the first, such as a solid out of a region or a region in another plane, it says <Message id="subtractNeedsTwo" /> and changes nothing. Lines and polylines must be made regions first. When it says that one boolean operation failed, the solids meet in a way MellowCAD cannot work out yet, and are left as they were.

### How do I subtract an area in AutoCAD?

To cut one 2D shape out of another, make both regions with <Command id="REGION" /> and SUBTRACT the inner one from the outer: a square with a circle taken out becomes one region with a hole. To measure an area without changing the drawing, <Command id="AREA" /> takes spaces out of its running total with <Keyword command="AREA" id="Subtract" />.

### Can I subtract without deleting the object?

SUBTRACT erases what it takes away, as AutoCAD's does. To keep it, copy it in place first: <Command id="COPY" />, the object and Enter, a base point of 0,0, then Enter again to copy it by 0,0, onto itself. SUBTRACT then uses up one of the two.
