---
title: "AutoCAD 3D exercise: a bearing block"
metaTitle: "AutoCAD advanced 3D exercise: a bearing block"
description: "Model a bearing block in AutoCAD 3D: extrude, unite, then subtract a bore and two bolt holes as cylinders, solved step by step. Practise 3D solids free online."
figure: "The bearing block in plan, 100 by 60, its boss, bore and holes dimensioned."
model: "The bearing block as a solid, seen from the south-east in the Conceptual visual style."
---

Model this bearing block, in millimetres: a base 100 by 60 with corners of radius 10, 12 thick; a boss of 40 across standing 40 high in the middle; a bore of 20 through the boss and two bolt holes of 10 through the base, 76 apart. The base and the boss are extruded from their outlines and united into one solid; the bore and the holes are cylinders subtracted from it.

## Steps

### Draw the plan [#plan]

On the Outline layer, <Command id="RECTANG" /> with a <Keyword command="RECTANG" id="Fillet" /> of `10`, from `0,0` to `100,60`, and a circle at its centre, `50,30`, with a <Keyword command="CIRCLE" id="Diameter" /> of `40`.

### Extrude the base and the boss [#extrude]

<Command id="EXTRUDE" /> the outline `12` high, then the circle `40` high: two solids.

### Unite them [#union]

<Command id="UNION" />: pick both and press Enter. They are one solid.

### Draw the cylinders [#holes]

The bore and a bolt hole as cylinders, with <Command id="CYLINDER" />: the bore at `50,30`, <Keyword command="CYLINDER" id="Diameter" /> `20` and `40` high; a bolt hole at `12,30`, diameter `10` and `12` high. Then <Command id="COPY" /> the hole from `12,30` to `76,0` further on.

### Subtract them [#subtract]

<Command id="SUBTRACT" />: pick the block and press Enter, then the three cylinders and Enter. The bore and the holes go through.

### Turn the view [#view]

<Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" />, <Command id="VSCURRENT" /> and <Keyword command="VSCURRENT" id="Conceptual" />, then <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> and 0.8x to frame it.
