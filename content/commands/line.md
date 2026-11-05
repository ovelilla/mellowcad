---
title: "LINE in AutoCAD"
metaTitle: "LINE in AutoCAD: command, Close, Undo and alias"
description: "How AutoCAD's LINE (L) works, prompt by prompt: points picked or typed, Undo and Close, and Enter to go on from the last line. Try it free in your browser."
figure: "A triangle: its first point typed, the next two from the last point, then Close."
related: ["PLINE", "OFFSET", "TRIM", "JOIN"]
coverage: "dbdee25fe28f"
---

LINE draws straight segments, each an object of its own: give the first point, then each next point, until Enter. A point is picked, taken with an object snap or typed. As in AutoCAD with dynamic input on, a point typed after the first is measured from the last one, so `80,0` draws 80 along X and the history writes it `@80,0`; a number alone is a distance along the cursor's direction, and `<30` holds the next point to 30°. Enter or a right-click at the first point goes on from the end of the last line, polyline or arc, tangent to an arc and asking only for the length. However many segments it draws, one U takes the whole command back.

## Options

### Undo

Takes back the last segment and asks again from the point before. With no segment left, it says <Message id="allLineSegmentsUndone" /> and asks for the first point again.

### Close

Offered from the second segment on: draws the last segment back to the first point and ends the command, closing the shape.

## Missing

Tangent or Perpendicular typed at the first point waits for the next one (a deferred snap), as in AutoCAD, but only over lines, circles and arcs, not over a polyline segment, an ellipse or a spline, and two deferred Perpendiculars are not solved.

## Questions

### What is the shortcut for LINE in AutoCAD?

`L`, then Enter or Space. The full name works too, and `_LINE` in any language of AutoCAD.

### How do I draw a line at an angle and a length?

Give the first point, then type the next one as length and angle: `@100<30` draws 100 at 30°. Or turn on polar tracking, follow its guide at that angle and type only the length.

### How do I go on from the last line I drew?

Run LINE and press Enter at the first point: it starts from the end of the last line, polyline or arc. From an arc, the line runs on tangent to it and LINE asks only its length. With nothing to go on from, it says <Message id="noLineOrArcToContinue" />.

### Why is my line made of separate pieces?

Each segment LINE draws is a line of its own, as in AutoCAD. For one object, draw with <Command id="PLINE" />, or join the lines afterwards with <Command id="JOIN" />.
