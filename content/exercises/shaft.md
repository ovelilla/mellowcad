---
title: "AutoCAD exercise: a stepped shaft"
metaTitle: "AutoCAD mechanical exercise: a stepped shaft"
description: "Draw a stepped shaft in AutoCAD: half its outline as a polyline, chamfered, mirrored about the axis, and its lengths as chain dimensions. Free, step by step."
figure: "A stepped shaft in side view, 150 long, its lengths dimensioned in a chain."
---

Draw this stepped shaft in side view, in millimetres: 150 long, with diameters of 30, 40 and 30 over lengths of 40, 60 and 50, and both ends chamfered 2 by 2. Draw the half above the axis as one polyline, chamfer it and mirror it; then the edges seen across the shaft, the axis and the lengths. The diameters are the ones given here.

## Steps

### Draw the upper half [#half]

On the Outline layer, one <Command id="PLINE" /> from `0,0`: up `0,15`, along `40,0`, up `0,5`, along `60,0`, down `0,-5`, along `50,0` and down `0,-15`, back to the axis. Enter ends it.

### Chamfer the ends [#chamfers]

<Command id="CHAMFER" />, then <Keyword command="CHAMFER" id="Distance" />: `2`, and Enter takes `2` for the second distance too. <Keyword command="CHAMFER" id="Multiple" /> chamfers one corner after another without starting again: pick the two segments at each end's corner.

### Mirror it [#mirror]

<Command id="MIRROR" />: pick the polyline, press Enter, then the mirror line from `0,0` to `150,0`, the axis, and Enter to keep the original.

### Draw the edges [#edges]

With <Command id="LINE" />, the edges seen across the shaft, each `0,30` up from the bottom: from `2,-15` and `148,-15` at the chamfers, and from `40,-15` and `100,-15` at the shoulders.

### Draw the axis [#axis]

On Centre lines, the axis: a line from `-8,0` to `166,0` further on.

### Dimension it [#dimensions]

On Dimensions, <Command id="DIMLINEAR" /> for the first length, 40, placed below. <Command id="DIMCONTINUE" /> carries on from its second extension line: `#100,-20`, then `#150,-15`, typed from the origin with #, and Enter twice to end it. A last <Command id="DIMLINEAR" /> gives the whole length, 150, further below.
