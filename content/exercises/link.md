---
title: "AutoCAD exercise: a link with tangent lines"
metaTitle: "AutoCAD advanced exercise: a link, tangents"
description: "Draw a link in AutoCAD: two bosses joined by lines tangent to both with the Tangent object snap, the arcs between them trimmed, and its dimensions. Free online."
figure: "A link of two bosses 90 apart, joined by tangent lines, dimensioned."
---

Draw this link, in millimetres: two bosses 90 apart, of radius 20 and 12, bored to radius 10 and 6, joined by lines tangent to both, with the arcs between the lines trimmed away. The tangent lines take the Tangent object snap at both ends; <Command id="TRIM" /> then turns each boss's circle into an arc.

## Steps

### Draw the bosses [#bosses]

On the Outline layer, four circles with <Command id="CIRCLE" />, each by its radius: `20` and `10` at `0,0`, `12` and `6` at `90,0`.

### Draw the tangent lines [#tangents]

<Command id="LINE" />, then type `_TAN`, the Tangent object snap for one point, and pick the large circle near its top; `_TAN` again and pick the small one near its top. The line touches both. The same along the bottom.

### Trim the arcs [#trim]

<Command id="TRIM" />: pick each boss between the two lines, on the side that faces the other. The inner arcs are gone and each circle is an arc.

### Draw the centre lines [#centreLines]

On Centre lines, the axis through both centres and a line across each boss.

### Dimension it [#dimensions]

On Dimensions, the distance between the centres with <Command id="DIMLINEAR" />, the bosses' radii with <Command id="DIMRADIUS" /> and their bores with <Command id="DIMDIAMETER" />.
