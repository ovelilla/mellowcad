---
title: "AutoCAD 3D exercise: a mounting plate"
metaTitle: "AutoCAD 3D exercise for beginners: a plate"
description: "Model a mounting plate in AutoCAD 3D: regions, a subtraction for the holes and one extrusion make the solid, solved step by step. Practise 3D free online."
figure: "The plate's outline, 100 by 60 with four holes, dimensioned."
model: "The plate as a solid, 10 thick, seen from the south-east with hidden lines removed."
---

Model a mounting plate 10 thick, in millimetres: its outline 100 by 60 with corners of radius 8, and four holes of 10 whose centres are 15 from the edges. It starts flat. The outline and the circles become regions, the holes are subtracted while the plate is still flat, and one extrusion turns it into a solid with its holes.

## Steps

### Draw the profile [#profile]

On the Outline layer, <Command id="RECTANG" /> with a <Keyword command="RECTANG" id="Fillet" /> of `8`, from `0,0` to `100,60`. Then a circle at `15,15` with a <Keyword command="CIRCLE" id="Diameter" /> of `10`, and <Command id="COPY" /> it from its centre to `70,0`, `70,30` and `0,30`.

### Make regions [#region]

<Command id="REGION" /> turns closed objects into regions: pick the outline and the four circles, then Enter. Five loops, five regions.

### Subtract the holes [#subtract]

<Command id="SUBTRACT" />: pick the plate's region and press Enter, then the four circles' regions and Enter. One region is left, with four holes in it.

### Turn the view [#view]

<Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" /> look at it from the south-east and above; <Command id="VSCURRENT" /> and <Keyword command="VSCURRENT" id="Hidden" /> hide what faces hide. The ViewCube turns the view with a click too.

### Extrude it [#extrude]

<Command id="EXTRUDE" />: pick the region, press Enter and type the height, `10`. The plate is a solid, holes and all. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> frames it, and a scale of 0.8x leaves room round it.
