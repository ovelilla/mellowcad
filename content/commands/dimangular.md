---
title: "DIMANGULAR in AutoCAD"
metaTitle: "DIMANGULAR in AutoCAD: angle dimension and alias"
description: "How AutoCAD's DIMANGULAR (DAN) measures angles: two lines, an arc, a circle or three points, then where the arc goes. Try it free in your browser."
figure: "Two lines meeting at 30 degrees: each line picked, then the dimension arc placed between them."
related: ["DIMLINEAR", "DIMALIGNED", "DIMRADIUS", "DIMSTYLE"]
coverage: "240cae2f2ce3"
---

DIMANGULAR dimensions an angle with an arc for its dimension line. What you pick first decides the rest, as in AutoCAD: a line asks for a second line, two segments of one polyline included; an arc is measured end to end about its centre; a circle, from the point you picked on it to a second point you give; and Enter instead asks for the angle's vertex, then its two endpoints. Then place the arc: where you put it chooses the angle measured. Between two lines it is the one of their four sectors that holds it; otherwise the angle or, across its sides, the reflex angle beyond 180°. The command line says the measurement in degrees, and the command ends.

## Options

### Text

Asks for the text to write instead of the measurement, which it offers as the default: Enter keeps the measurement. In what you type, `<>` stands for the measurement.

### Angle

Asks for the angle of the text, which is then drawn at that angle instead of along the dimension arc. 0 puts it back along the arc.

## Missing

Mtext: a dimension's text is one line, set with <Keyword id="Text" /> at the command line. Quadrant, which locks the dimension to one sector so its text can go outside it. Angle units other than decimal degrees (DIMAUNIT). An angular dimension cannot be chained or spaced: <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> and <Command id="DIMSPACE" /> take linear and aligned ones only. A line or an arc inside a block reference cannot be picked. Between two lines, the dimension keeps the points where its arc met them, not the lines: moved later, its arc keeps its extension lines from there, where AutoCAD measures against the lines again. A dimension is not associative: it does not follow the objects it measures.

## Questions

### What is the shortcut for DIMANGULAR in AutoCAD?

`DAN`, or `DIMANG`, then Enter or Space. The full name works too, and `_DIMANGULAR` in any language of AutoCAD.

### How do I dimension an angle greater than 180 degrees?

Press Enter at the first prompt, give the vertex and the two endpoints, then place the arc outside the angle between them: it measures the reflex angle, 360° less the other. An arc or a circle works the same way. Between two lines the angle is always under 180°.

### How do I dimension the angle of an arc?

Pick the arc at the first prompt: its centre is the vertex and its ends the extension lines' origins, so the next question is already where to place the dimension.

### Why does DIMANGULAR say the lines are parallel?

Two parallel lines, or the same line picked twice, make no angle: <Message id="dimLinesParallel" />, and the command ends.

### How do I change the decimals of an angle dimension?

In the dimension style: <Command id="DIMSTYLE" /> (`D`) opens it in the Styles palette, where Primary units' angular precision sets them, 0 in ISO-25. Every angular dimension in that style follows.
