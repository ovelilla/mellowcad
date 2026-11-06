---
title: "TORUS in AutoCAD"
metaTitle: "TORUS in AutoCAD: 3D torus, options and alias"
description: "How AutoCAD's TORUS (TOR) draws a 3D solid ring, prompt by prompt: centre, the ring's radius, the tube's radius, Diameter, 3P, 2P and Ttr. Try it free online."
figure: "A torus of radius 30 round a tube of radius 8, seen from the south-east in the Conceptual visual style."
related: ["SPHERE", "CYLINDER", "REVOLVE", "SUBTRACT"]
coverage: "8078941886ea"
---

TORUS draws a 3D solid ring, a doughnut: give the centre, then the radius of the ring, from the centre to the middle of the tube, then the radius of the tube. The ring lies on the UCS's XY plane, at the centre's Z. A point at the tube's prompt is measured from the ring's point, the one the radius was given at. The ring's radius is the primitives' shared default, and the tube's radius a default of its own, which Enter takes. The torus lies on the current layer, and Undo takes it back in one step.

A negative ring radius with a wider tube makes a ball like a rugby ball, its ends pointed; a ring narrower than its tube, an apple. In 2D Wireframe and Hidden it is drawn as lines round the tube and round the ring, as many as `ISOLINES` says. <Command id="LIST" /> shows its position, normal, torus radius and tube radius, and the Properties palette lets you type both. Its grips move it, set the ring's radius and set the tube's. It is a 3D solid for <Command id="UNION" />, <Command id="SUBTRACT" /> and the rest of MellowCAD's 3D, which is solids only and still partial.

## Options

### 3P

At the centre: asks for three points, and the ring is the circle through them, in their plane.

### 2P

At the centre: asks for the two ends of the ring's diameter.

### Ttr

At the centre: pick two lines, circles or arcs, under the Tangent snap, and give a radius: the ring touches both, at their height.

### Diameter

At the ring's radius: asks for the torus' diameter instead. At the tube's: asks for the tube's diameter. Each offers twice its default.

### 2Point

At the tube's radius: asks for two points, and the tube's radius is the distance between them.

## Missing

<Command id="EXPLODE" /> of a torus, which AutoCAD turns into a surface: MellowCAD has no surfaces, so it says it could not explode it. Move, Rotate, Scale and Mirror from a hot grip, and the silhouette AutoCAD's `DISPSILH` draws.

## Questions

### What is the shortcut for TORUS in AutoCAD?

`TOR`. Type it and press Enter or Space, then give the centre, the ring's radius and the tube's: `0,0,0`, `30` and `8` draw the session's torus.

### What is the difference between the radius and the tube radius?

The radius runs from the centre of the torus to the middle of the tube; the tube radius is the tube's own. A torus 76 across the outside with a tube 16 thick has a radius of 30 and a tube radius of 8.

### How do I draw a torus shaped like a rugby ball?

Give a negative radius, then a tube radius larger than its size: `-5` and `8` make a closed shape pointed at both ends. A tube radius no larger than that is refused, and asked again.

### Why does my torus look like two circles?

You are looking at it from above, in plan. Turn the view: a corner of the ViewCube, <Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" />, or <Command id="3DORBIT" />. <Command id="VSCURRENT" /> with <Keyword command="VSCURRENT" id="Conceptual" /> shades it.
