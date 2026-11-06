---
title: "CONE in AutoCAD"
metaTitle: "CONE in AutoCAD: 3D cone, frustum and options"
description: "How AutoCAD's CONE draws a 3D solid cone or a frustum, prompt by prompt: base, radius, height, Top radius, Elliptical and Axis endpoint. Try it free online."
figure: "A cone of radius 20 and height 40, from the centre of its base, seen from the south-east in the Hidden visual style."
related: ["CYLINDER", "PYRAMID", "REVOLVE", "SUBTRACT"]
coverage: "71113eef991e"
---

CONE draws a 3D solid cone: give the centre of its base, then the radius, then the height, and it narrows to a point. It asks what <Command id="CYLINDER" /> asks, with <Keyword id="Top" /> at the height for a cone cut short. The base lies on the UCS's XY plane, at the centre's Z, and the height rises along its Z; a negative one points it down, and a point gives it by how far it is from the base. The radius and the height are offered as defaults that Enter takes, shared with the other primitives. The cone lies on the current layer, and Undo takes it back in one step.

<Command id="LIST" /> shows its position, normal, base radius, top radius and height, and the Properties palette lets you type them. Its grips move it, set its height, its base radius at each quarter of the base, and its top radius. The apex snaps as an endpoint. It is a 3D solid for <Command id="UNION" />, <Command id="SUBTRACT" /> and the rest of MellowCAD's 3D, which is solids only and still partial.

## Options

### 3P

At the base's centre: asks for three points, and the base is the circle through them, in their plane.

### 2P

At the base's centre: asks for the two ends of the base's diameter.

### Ttr

At the base's centre: pick two lines, circles or arcs, under the Tangent snap, and give a radius: the base touches both.

### Elliptical

At the base's centre: the base is an ellipse, given by both ends of its first axis and the end of the second, or with <Keyword id="Center" /> from its centre. A top radius shrinks the same ellipse.

### Diameter

At the radius: asks for the diameter instead, offering twice the last radius.

### 2Point

At the height: asks for two points, and the height is the distance between them.

### Axis

At the height: asks for the apex. The cone runs from the base's centre to that point in any direction, its base square to the axis.

### Top

At the height: asks for the top radius, then the height again. The cone ends in a circle instead of a point, a frustum; a top as wide as the base makes a cylinder's sides, a wider one a cone widening up. It offers the last cone's top radius, 0 at first.

## Missing

<Command id="EXPLODE" /> of a cone, which AutoCAD turns into its base and a surface: MellowCAD has no surfaces, so it says it could not explode it. Typing a round cone into an elliptical one in the Properties palette. With `ISOLINES` at 0, the dot AutoCAD draws at the apex. And <Command id="CYLINDER" />'s: the hot grip's Move, Rotate, Scale and Mirror, the dotted dimensions while you give the radius, and the visual styles <Command id="VSCURRENT" /> lacks.

## Questions

### How do I draw a cone in AutoCAD?

Run CONE, give the centre of the base, the radius and the height: `0,0`, `20` and `40` draw the session's cone. Turn the view to see it, with a corner of the ViewCube or <Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" />.

### How do I draw a truncated cone?

At the height, choose <Keyword id="Top" />, type the top radius, then the height. The cone ends in a circle of that radius.

### How do I draw an upside-down cone?

Type a negative height: the cone points down from its base. Or choose <Keyword id="Axis" /> and give the apex wherever it goes.

### Can the base of a cone be an ellipse?

Yes: choose <Keyword id="Elliptical" /> at the base's centre and give its axes. A top radius makes the top the same ellipse, smaller.
