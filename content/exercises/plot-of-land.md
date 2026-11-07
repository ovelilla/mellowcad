---
title: "AutoCAD exercise: a plot of land"
metaTitle: "AutoCAD civil exercise: plot area and sides"
description: "Draw a plot of land in AutoCAD from its sides' lengths and angles with polar coordinates, then measure its area and dimension it. Free, step by step, online."
figure: "A plot of land of five sides, in metres, each side dimensioned and one angle."
---

Draw this plot of land, in metres, from its sides' lengths and directions: 40 at 0°, 30 at 80°, 35 at 155° and 25 at 230°, then back to the start. Measure its area and perimeter, and dimension each side and the angle at its second corner. Polar coordinates, a length and an angle, draw each side from the end of the one before. The drawing's dimension scale is set for metres.

## Steps

### Draw the boundary [#boundary]

On the Outline layer, <Command id="PLINE" /> from `0,0`, then each side as its length and its angle: `40<0`, `30<80`, `35<155` and `25<230`, each measured from the last point. <Keyword command="PLINE" id="Close" /> draws the fifth side and closes the boundary: one object, which <Command id="AREA" /> can measure.

### Measure its area [#area]

<Command id="AREA" />, then <Keyword command="AREA" id="Object" />, and pick the boundary: the command line gives its area, in square metres, and its perimeter.

### Dimension it [#dimensions]

On Dimensions, <Command id="DIMALIGNED" /> and Enter at its first prompt: it then asks for an object, and a pick on a side dimensions that side, parallel to it. Place each one outside the plot. <Command id="DIMANGULAR" /> on the two sides that meet at `40,0` gives the angle between them, 100°.
