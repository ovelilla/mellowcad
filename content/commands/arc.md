---
title: "ARC in AutoCAD"
metaTitle: "ARC in AutoCAD: 3 points, centre and alias"
description: "How AutoCAD's ARC (A) works, prompt by prompt: three points, Start-Center-End or Center-Start-End, and Ctrl for clockwise. Try it free in your browser."
figure: "Three arcs: through three points, from a start round a Center to an end, and from a Center, its start, then its end."
related: ["CIRCLE", "ELLIPSE", "PLINE", "FILLET"]
coverage: "33b311c7838f"
---

ARC draws an arc through three points by default: its start, a point it passes through, and its end. Or it draws one round a centre, from a start point to an end, the way the ribbon's Start, Center, End and Center, Start, End buttons run it. As in AutoCAD, an arc given by its centre runs counter-clockwise from its start, and the end only sets where it stops: it need not lie on the arc. While you place the points, the arc follows the cursor, with an amber dashed line from the start or the centre. The arc lies in the plane of its first point. An arc that cannot be made, three points on one line or an end on the start, says <Message id="invalid" /> and draws nothing.

## Options

### Center

At the first prompt: give the centre first, then the start point and the end point. At the second prompt, after the start: the centre comes next, then the end. At the end of either, hold Ctrl to run the arc clockwise instead.

## Missing

The options that finish an arc by its Angle, its chord Length, a Direction or a Radius instead of an end point, and End at the second point, which leads to them; the ribbon's buttons for those ways are missing too. Continue: Enter at the first prompt, which in AutoCAD draws an arc tangent to the last line or arc, ends ARC here. The included-angle box dynamic input shows at the end of a centre mode.

## Questions

### What is the shortcut for ARC in AutoCAD?

`A`, then Enter or Space. The full name works too, and `_ARC` in any language of AutoCAD.

### How do I draw an arc in AutoCAD by three points?

Run ARC and give three points: the start, any point the arc passes through, and the end. That is the default, with no option to choose.

### Why does my arc go the wrong way?

An arc drawn by its centre runs counter-clockwise from its start, as in AutoCAD. Swap the start and the end, or hold Ctrl while you give the end point to run it clockwise.

### How do I draw an arc tangent to two lines?

Use <Command id="FILLET" /> with a radius: it draws the arc tangent to both lines and trims them to it. For an arc tangent to the segment before it, draw it in a polyline, with the arc option of <Command id="PLINE" />.
