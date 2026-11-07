---
title: "AutoCAD exercise: a gasket"
metaTitle: "AutoCAD exercise for beginners: a gasket"
description: "Draw a gasket in AutoCAD: a rounded plate, a bore, four holes copied from one, centre lines and dimensions, solved step by step. Practise it free online."
figure: "The gasket, 120 by 80, dimensioned."
---

Draw this gasket, in millimetres: a plate 120 by 80 with its corners rounded to a radius of 10, a bore of 40 in the middle and four holes of 10, their centres 12 from the edges, with the bore's centre lines and the dimensions. Everything is typed: the first point of a command is where you type it, and each point after it is measured from the last one. The outline, the centre lines and the dimensions each go on their own layer.

## Steps

### Draw the outline [#outline]

Make Outline the current layer in the Layer control. <Command id="RECTANG" /> draws the plate in one go: choose <Keyword command="RECTANG" id="Fillet" /> and type the radius, `10`, then the first corner, `0,0`, and the other corner, `120,80`, measured from the first.

### Draw the bore [#bore]

<Command id="CIRCLE" /> at the plate's middle, `60,40`: choose <Keyword command="CIRCLE" id="Diameter" /> and type `40`.

### Copy the holes [#holes]

Draw one hole, a circle at `12,12` with a <Keyword command="CIRCLE" id="Diameter" /> of `10`, then copy it with <Command id="COPY" />: pick the circle, press Enter, take its centre, `12,12`, as the base point, and type where each copy goes from there: `96,0`, then `96,56`, then `0,56`. Enter ends the copies.

### Draw the centre lines [#centreLines]

Make Centre lines current. Two lines with <Command id="LINE" /> cross at the bore's centre and run 6 past its edge: from `60,14`, `0,52` up; from `34,40`, `52,0` across. Enter ends each one.

### Dimension it [#dimensions]

Make Dimensions current. <Command id="DIMLINEAR" /> takes two points and then where the dimension line goes: the length from `0,10` to `120,0` further on, placed below; the height on the right; the holes' spacing, 96 and 56. A point typed at its prompts touches no object, so each of these is created non-associative, and the command line says so. <Command id="DIMDIAMETER" /> picks a circle and places its diameter: the bore's, then one hole's.
