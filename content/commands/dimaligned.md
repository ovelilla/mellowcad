---
title: "DIMALIGNED in AutoCAD"
metaTitle: "DIMALIGNED in AutoCAD: aligned dimension command"
description: "How AutoCAD's DIMALIGNED (DAL) dimensions a slanted edge, prompt by prompt: two origins or an object, then a line parallel to them. Try it free in your browser."
figure: "A triangle's slanted side dimensioned along its length: its two ends, then where the line goes."
related: ["DIMLINEAR", "DIMANGULAR", "DIMCONTINUE", "DIMSTYLE"]
coverage: "f5b12c4ce804"
---

DIMALIGNED measures the true distance between two points: its dimension line runs parallel to the line through them, at whatever angle, where <Command id="DIMLINEAR" /> measures only along X or Y. Its prompts are <Command id="DIMLINEAR" />'s: the first and the second extension line origins, or Enter and a pick on a line, an arc or a polyline segment for its two ends, then the dimension line's location, on either side. A circle picked gives its diameter through the point you picked. The command line says the measurement, and the command ends.

## Options

### Text

Asks for the text to write instead of the measurement, which it offers as the default: Enter keeps the measurement. In what you type, `<>` stands for the measurement.

### Angle

Asks for the angle of the text, which is then drawn at that angle instead of along the dimension line. 0 puts it back along the line.

## Missing

Mtext: a dimension's text is one line, set with <Keyword id="Text" /> at the command line, never in the text editor. With an angle set by <Keyword id="Angle" />, AutoCAD centres the text on the dimension line; here it stays above it, as without one. A dimension is not associative: it does not follow the object it measures.

## Questions

### What is the shortcut for DIMALIGNED in AutoCAD?

`DAL`, or `DIMALI`, then Enter or Space. The full name works too, and `_DIMALIGNED` in any language of AutoCAD.

### What is the difference between DIMLINEAR and DIMALIGNED?

On a slanted edge, <Command id="DIMLINEAR" /> gives its width or its height, as its dimension line is horizontal or vertical; DIMALIGNED gives its length, with the line parallel to the edge. On an edge along X or Y both give the same number.

### How do I dimension a slanted line in AutoCAD?

With DIMALIGNED: press Enter at the first prompt, pick the line and place the dimension on the side you want. Or pick its two ends, with the Endpoint object snap so the origins are exact.

### How do I write my own text on a dimension?

Choose <Keyword id="Text" /> before placing it and type the text: `<>` stands for the measurement, so `<> mm` writes it followed by its unit, and Enter with nothing typed keeps the measurement alone. Once placed, the Properties palette's Text override changes it.
