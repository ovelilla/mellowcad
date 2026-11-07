---
title: "AutoCAD exercise: a flange"
metaTitle: "AutoCAD practice drawing: a flange with keyway"
description: "Draw a flange in AutoCAD: a bore with a keyway trimmed into it, eight holes in a polar array, centre lines and diameters, solved step by step. Free online."
figure: "The flange, 140 across, with its keyway, eight holes and diameters."
---

Draw this flange, in millimetres: 140 across, a bore of 60 with a keyway 16 wide whose top is 36 from the centre, eight holes of 14 on a pitch circle of 110, and its centre lines. The keyway is a rectangle trimmed into the bore; the holes are one circle and a polar array.

## Steps

### Draw the circles [#circles]

On the Outline layer, two circles at `0,0`, each by its <Keyword command="CIRCLE" id="Diameter" />: `140` and `60`.

### Cut the keyway [#keyway]

<Command id="RECTANG" /> from `-8,20` to `16,16` further on: it crosses the bore. <Command id="TRIM" /> cuts an object where the others cross it: pick the bore's arc between the rectangle's sides, then the rectangle's bottom, inside the bore. What is left is the keyway, its two sides and its top.

### Array the holes [#holes]

A hole on the pitch circle: a circle at `55<22.5`, 55 from the origin at 22.5°, with a <Keyword command="CIRCLE" id="Diameter" /> of `14`. <Command id="ARRAYPOLAR" />: pick it, press Enter and give the centre, `0,0`; <Keyword command="ARRAYPOLAR" id="ASsociative" /> and <Keyword command="ARRAYPOLAR" id="No" /> leave eight separate circles, which a dimension can pick, and <Keyword command="ARRAYPOLAR" id="Items" />, `8`, spreads them round the whole circle. Then, on Centre lines, the pitch circle at `0,0`, its diameter `110`.

### Draw the centre lines [#centreLines]

Still on Centre lines, two lines with <Command id="LINE" /> through the centre, 156 long: from `-78,0`, `156,0` across; from `0,-78`, `0,156` up.

### Dimension it [#dimensions]

On Dimensions, <Command id="DIMDIAMETER" /> on the bore, a hole, the pitch circle and the outline, each picked where no dimension crosses it yet, then <Command id="DIMLINEAR" /> across the keyway's top: 16.
