---
title: "AutoCAD exercise: a round table and chairs"
metaTitle: "AutoCAD exercise: a round table, six chairs"
description: "Draw a round table with six chairs in AutoCAD: one chair, then a polar array round the table's centre, and its dimensions, step by step. Free online."
figure: "A round table of 120 with six chairs, in plan, dimensioned in centimetres."
---

Draw a round table of 120 with six chairs, in centimetres: each chair a seat 44 by 40 with corners rounded to 4 and a back 8 deep, its front 8 from the table's edge. Draw one chair above the table and let a polar array place all six. The drawing's dimension scale is set for centimetres.

## Steps

### Draw the table [#table]

On the Outline layer, <Command id="CIRCLE" /> at `0,0`, <Keyword command="CIRCLE" id="Diameter" /> `120`.

### Draw a chair [#chair]

The seat, above the table: <Command id="RECTANG" /> with a <Keyword command="RECTANG" id="Fillet" /> of `4`, from `-22,68` to `44,40` further on. Then the back, with the fillet set back to `0`, from `-22,108` to `44,8` further on. <Command id="RECTANG" /> keeps its fillet radius until you change it.

### Array the chairs [#array]

<Command id="ARRAYPOLAR" />: pick the seat and the back, press Enter, give the table's centre, `0,0`, then <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Each chair turns as it is placed, so all six face the table.

### Dimension it [#dimensions]

On Dimensions, <Command id="DIMDIAMETER" /> on the table, placed inside, and <Command id="DIMLINEAR" /> for the top chair's width, 44, and its depth with the back, 48.
