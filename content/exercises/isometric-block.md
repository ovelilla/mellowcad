---
title: "AutoCAD isometric exercise: a stepped block"
metaTitle: "AutoCAD isometric drawing exercise: a block"
description: "Draw a stepped block in isometric in AutoCAD with LINE and polar coordinates along the 30°, 90° and 150° axes, and dimension it. Free, step by step, online."
figure: "A stepped block in isometric, 60 long, 40 deep and 40 high, its sizes dimensioned along its edges."
---

Draw this stepped block in isometric, in millimetres: 60 long, 40 deep and 40 high, with a step 20 deep and 20 high along its front. Every edge runs along one of the isometric axes: 30° and 210° for the length, 150° and 330° for the depth, 90° and 270° for the height. MellowCAD does not have AutoCAD's isometric drafting yet, its isometric snap and isocircles, so the edges are lines typed with polar coordinates, a length and an angle.

## Steps

### Draw the front of the step [#front]

On the Outline layer, <Command id="LINE" /> from `0,0`, the bottom front corner: `60<30`, `20<90`, `60<210`, then <Keyword command="LINE" id="Close" />.

### Draw the side [#side]

From `0,0` again, the left side: `40<150`, `40<90`, `20<330`, `20<270` and `20<330`. Enter ends the line on the step's front edge.

### Draw the top [#top]

The rest starts at corners already drawn: type `_END`, the Endpoint object snap for one point, and pick the corner. From the front's top right corner: `20<150`, `20<90`, `20<150` and `60<210`. Then two lines of `60<210`, from the riser's foot and from its top.

### Dimension it [#dimensions]

On Dimensions, <Command id="DIMALIGNED" /> along the edges, each placed beside its own: 60 and 40 at the bottom, 40 up the left, 20 up the right.
