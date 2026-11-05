---
title: "DIMDIAMETER in AutoCAD"
metaTitle: "DIMDIAMETER in AutoCAD: diameter dimension"
description: "How AutoCAD's DIMDIAMETER (DDI) dimensions a circle or an arc, prompt by prompt: pick it, then place the diameter in or out. Try it free in your browser."
figure: "A large circle dimensioned inside and a small one outside: each circle picked, then the text placed."
related: ["DIMRADIUS", "DIMLINEAR", "DIMANGULAR", "DIMSTYLE"]
coverage: "d3b725db2ae6"
---

DIMDIAMETER dimensions the diameter of a circle, an arc or a polyline's arc segment, with <Command id="DIMRADIUS" />'s prompts: pick the curve, and the command line says the measurement at once; then place the dimension, and the command ends. Its text is the diameter after the diameter sign. Placed inside the circle, one line runs from the text to an arrowhead on the rim; placed outside, the line crosses the circle from rim to rim, its far arrowhead pointing back in from a short stub, as ISO-25 draws it.

## Options

### Text

Asks for the text to write instead of the measurement, which it offers as the default: Enter keeps the measurement. In what you type, `<>` stands for the measurement with its sign, so `<> THRU` writes the diameter followed by THRU.

### Angle

Asks for the angle of the text, which is then drawn at that angle, its middle on the line, and the line stops at it. 0 puts it back along the line.

## Missing

Mtext: a dimension's text is one line, set with <Keyword id="Text" /> at the command line, never in the text editor. The sign is drawn Ø, where AutoCAD writes ∅: the drawing font has no ∅. On an arc, the arrowheads stay between its ends, where AutoCAD draws an arc extension line. As with <Command id="DIMRADIUS" />, a curve inside a block reference cannot be picked, the style's centre lines are not drawn and its settings for text outside the curve are not offered. A dimension is not associative: it does not follow the curve it measures.

## Questions

### What is the shortcut for DIMDIAMETER in AutoCAD?

`DDI`, or `DIMDIA`, then Enter or Space. The full name works too, and `_DIMDIAMETER` in any language of AutoCAD.

### How do I dimension a small hole?

Place the text outside the circle: the dimension line then crosses the hole with an arrowhead on each side, and the text stands clear of it. Inside, the text needs room within the circle.

### Can DIMDIAMETER dimension an arc?

Yes: an arc or a polyline's arc segment, as a circle, and it reports the diameter of the arc's circle. Anything else says <Message id="notCircleOrArc" /> and asks again.

### How do I add THRU or a note to a diameter dimension?

Choose <Keyword id="Text" /> before placing it and type `<> THRU`: `<>` is the measurement with its sign. Once placed, the Properties palette's Text override changes it.
