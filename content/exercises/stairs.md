---
title: "AutoCAD exercise: stairs in plan"
metaTitle: "AutoCAD architecture exercise: stairs in plan"
description: "Draw a straight flight of stairs in plan in AutoCAD: ten treads from one line and a rectangular array, the arrow going up and dimensions. Free, step by step."
figure: "A straight flight of stairs in plan, 280 by 100 centimetres, its arrow pointing up the flight."
---

Draw a straight flight of stairs in plan, in centimetres: 280 long and 100 wide, ten treads of 28, and the arrow that shows the way up. The drawing's dimension scale is set for a plan in centimetres, so its dimensions read at this size. One tread's edge is drawn; a rectangular array places the others.

## Steps

### Draw the outline [#outline]

On the Outline layer, <Command id="RECTANG" /> from `0,0` to `280,100`: the flight's outline.

### Draw the first tread [#tread]

The first tread's edge, a <Command id="LINE" /> from `28,0`, `0,100` up, and Enter.

### Array the treads [#array]

<Command id="ARRAYRECT" /> copies it along the flight: pick the line and press Enter, then choose <Keyword command="ARRAYRECT" id="COUnt" />, `9` columns and `1` row, and <Keyword command="ARRAYRECT" id="Spacing" />, `28` between the columns and `1` between the rows, which does nothing with a single row. <Keyword command="ARRAYRECT" id="eXit" /> keeps it as an associative array, which its grips edit later.

### Draw the arrow [#arrow]

<Command id="PLINE" /> from `14,50`, along the flight to `226,0` further on; then <Keyword command="PLINE" id="Width" />, `10` at the start and `0` at the end, and a last segment of `24,0`: the arrowhead. Enter ends it.

### Dimension it [#dimensions]

On Dimensions, <Command id="DIMLINEAR" /> three times: the length below, the width on the right and one tread, 28, above.
