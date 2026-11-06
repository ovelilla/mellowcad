---
title: "CYLINDER in AutoCAD"
metaTitle: "CYLINDER in AutoCAD: 3D cylinder and options"
description: "How AutoCAD's CYLINDER (CYL) draws a 3D solid cylinder, prompt by prompt: base, radius, height, 3P, 2P, Ttr, Elliptical and Axis endpoint. Try it free online."
figure: "A cylinder of radius 20 and height 40, from the centre of its base, seen from the south-east in the Hidden visual style."
related: ["CONE", "BOX", "SUBTRACT", "EXTRUDE"]
coverage: "be92ef012005"
---

CYLINDER draws a 3D solid cylinder: give the centre of its base, then the radius, then the height. The base lies on the UCS's XY plane, at the centre's Z, and the height rises along its Z; a negative one goes down, and a point gives it by how far it is from the base, as at <Command id="BOX" />. The radius and the height are offered as defaults that Enter takes, shared with the other primitives and <Command id="EXTRUDE" />. The cylinder lies on the current layer, and Undo takes it back in one step.

The cylinder keeps its sizes: <Command id="LIST" /> shows its position, normal, radius and height, and the Properties palette lets you type the radius and the height. Its grips move it, set its height and, at each quarter of the base, its radius. It is a 3D solid for <Command id="UNION" />, <Command id="SUBTRACT" /> and the rest of MellowCAD's 3D, which is solids only and still partial.

## Options

### 3P

At the base's centre: asks for three points, and the base is the circle through them, in their plane. Three points on the UCS's XY plane still make the cylinder rise along Z.

### 2P

At the base's centre: asks for the two ends of the base's diameter; the second is read in the first's plane.

### Ttr

At the base's centre: pick two lines, circles or arcs, under the Tangent snap, and give a radius: the base touches both, nearest the points picked, at their height.

### Elliptical

At the base's centre: the base is an ellipse. Give both ends of its first axis, then the end of the second; or choose <Keyword id="Center" /> and give its centre, the first axis' half length, then the end of the second axis.

### Diameter

At the radius: asks for the diameter instead, offering twice the last radius.

### 2Point

At the height: asks for two points, and the height is the distance between them.

### Axis

At the height: asks for the axis' other end. The cylinder runs from the base's centre to that point in any direction, its base square to the axis.

## Missing

<Command id="EXPLODE" /> of a cylinder, which AutoCAD turns into its two ends and a surface: MellowCAD has no surfaces, so it says it could not explode it. Move, Rotate, Scale and Mirror from a hot grip, and a height dragged past the base. The dotted dimensions AutoCAD draws while you give the radius, the ellipse's points and the axis. Typing a round cylinder into an elliptical one in the Properties palette. The silhouettes AutoCAD's `DISPSILH` draws. In plan, where the top circle hides the base's, the Nearest snap finds the base's circle, where AutoCAD finds the top's. The visual styles <Command id="VSCURRENT" /> lacks beyond 2D Wireframe, Hidden and Conceptual.

## Questions

### What is the shortcut for CYLINDER in AutoCAD?

`CYL`. Type it and press Enter or Space, then give the centre of the base, the radius and the height: `0,0`, `20` and `40` draw the session's cylinder.

### How do I draw a horizontal cylinder?

Choose <Keyword id="Axis" /> at the height and give the other end of the axis: from a base at `0,0,0`, the point `60,0,0` lays the cylinder along X.

### How do I make a hollow cylinder or a pipe?

Draw two cylinders from the same centre, the inner one narrower, then run <Command id="SUBTRACT" />: pick the outer one, Enter, the inner one, Enter.

### Why does my cylinder look like a circle?

You are looking at it from above, in plan. Turn the view: a corner of the ViewCube, <Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" />, or <Command id="3DORBIT" />.
