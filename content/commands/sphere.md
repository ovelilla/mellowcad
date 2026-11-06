---
title: "SPHERE in AutoCAD"
metaTitle: "SPHERE in AutoCAD: 3D sphere command and options"
description: "How AutoCAD's SPHERE draws a 3D solid sphere, prompt by prompt: centre and radius, Diameter, 3P, 2P and Ttr, and why it shows as lines. Try it free online."
figure: "A sphere of radius 25 from its centre, seen from the south-east in the Conceptual visual style."
related: ["TORUS", "CYLINDER", "SLICE", "SUBTRACT"]
coverage: "61b5f0982c03"
---

SPHERE draws a 3D solid sphere: give the centre, then the radius. A radius picked with the mouse is read on the plane through the centre, and the last radius is offered as a default that Enter takes, shared with <Command id="CYLINDER" />, <Command id="CONE" /> and the other primitives. The sphere lies on the current layer, and Undo takes it back in one step.

In 2D Wireframe and Hidden it is drawn as lines: meridians and parallels, as many as `ISOLINES` says, and nothing else snaps on it but its centre. <Command id="LIST" /> shows its position and radius, and the Properties palette lets you type the radius or the diameter. Its grips move it and, at each quarter of its equator, set its radius. It is a 3D solid for <Command id="UNION" />, <Command id="SUBTRACT" /> and the rest of MellowCAD's 3D, which is solids only and still partial.

## Options

### 3P

At the centre: asks for three points, and the sphere is centred on the circle through them, with its radius.

### 2P

At the centre: asks for the two ends of a diameter, anywhere in space.

### Ttr

At the centre: pick two lines, circles or arcs, under the Tangent snap, and give a radius: the centre lies on the circle of that radius that touches both, at their height.

### Diameter

At the radius: asks for the diameter instead, offering twice the last radius.

## Missing

<Command id="EXPLODE" /> of a sphere, which AutoCAD turns into a surface: MellowCAD has no surfaces, so it says it could not explode it. Move, Rotate, Scale and Mirror from a hot grip, and the 3D commands of its own (3DMOVE, 3DROTATE, 3DSCALE). The silhouette AutoCAD's `DISPSILH` draws. The visual styles <Command id="VSCURRENT" /> lacks beyond 2D Wireframe, Hidden and Conceptual.

## Questions

### How do I make a sphere in AutoCAD?

Run SPHERE, give the centre, then the radius: `0,0,0` and `25` draw the session's sphere. Turn the view to see it round, with a corner of the ViewCube or <Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" />.

### Why does my sphere look like a circle with lines?

2D Wireframe and Hidden draw a sphere as its meridians and parallels; in plan they are a circle and lines through it. <Command id="VSCURRENT" /> with <Keyword command="VSCURRENT" id="Conceptual" /> shades it, and `ISOLINES` sets how many lines it shows.

### How do I make a hemisphere?

Draw the sphere, then cut it through its centre with <Command id="SLICE" />: three points on the plane, or <Keyword command="SLICE" id="XY" /> and the centre, and the side to keep.

### How do I draw a sphere by its diameter?

At the radius, choose <Keyword id="Diameter" /> and type the diameter. With <Keyword id="2P" />, the two ends of a diameter place it too.
