---
title: "AutoCAD exercise: an L bracket"
metaTitle: "AutoCAD exercise for beginners: an L bracket"
description: "Draw an L bracket in AutoCAD with relative coordinates: its outline, a fillet, two holes and baseline dimensions, solved step by step. Practise it free online."
figure: "The L bracket, 100 by 80, dimensioned from its bottom left corner."
---

Draw this bracket, in millimetres: 100 long, a foot 20 high and an upright 30 wide and 80 high, the inside corner rounded to a radius of 10, a hole of 8 in the foot and one of 10 in the upright, each centred in its leg. The outline is one run of <Command id="LINE" />, each point typed as how far it goes from the last, and its dimensions all start from the bottom left corner.

## Steps

### Draw the outline [#outline]

On the Outline layer, <Command id="LINE" /> from `0,0`, then each point as a step from the last: `100,0`, `0,20`, `-70,0`, `0,60` and `-30,0`. <Keyword command="LINE" id="Close" /> draws the last side back to the start and ends the command.

### Round the inside corner [#fillet]

<Command id="FILLET" />: choose <Keyword command="FILLET" id="Radius" />, type `10`, then pick the two lines that meet at the inside corner, the foot's top and the upright's side.

### Draw the holes [#holes]

Two circles with <Command id="CIRCLE" />, each by its <Keyword command="CIRCLE" id="Diameter" />: `8` at `80,10`, in the foot, and `10` at `15,65`, in the upright.

### Dimension it [#dimensions]

On Dimensions, <Command id="DIMLINEAR" /> from `0,0` to the foot's hole, `80,10`, placed below: 80. <Command id="DIMBASELINE" /> goes on from the same first extension line: type the right end, `#100,0`, where # measures from the origin, then Enter twice to end it. The same up the left side, to the upper hole and then to the top, `#0,80`. <Command id="DIMRADIUS" /> on the fillet and <Command id="DIMDIAMETER" /> on each hole finish it.
