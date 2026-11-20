---
title: "RAY in AutoCAD"
metaTitle: "RAY in AutoCAD: draw a line to infinity"
description: "How AutoCAD's RAY command draws construction lines that start at a point and run to infinity one way, and how they trim into lines. Try it free."
figure: "Rays from one start point through three points, each running on past the edge of the view."
related: ["XLINE", "LINE", "TRIM", "EXTEND"]
coverage: "0445fcc9ee6d"
---

RAY draws rays: construction lines that start at a point and run to infinity in one direction. Pick the start point, then a through point: the ray starts at the first and passes through the second. Every further point makes another ray from the same start, until Enter ends the command. A through point on the start is refused with <Message id="invalid" />. Each ray is on the current layer with the current colour, linetype and lineweight.

A ray runs across the view however far you pan or zoom, and the drawing's extents leave it out, as in AutoCAD. The Endpoint snap finds its start, Nearest, Perpendicular and Intersection work along it. <Command id="TRIM" /> and <Command id="BREAK" /> turn the stretch that holds the start into a line, and <Command id="EXTEND" /> runs the start back to an edge behind it. <Command id="XLINE" /> draws lines that run both ways.

## Missing

LENGTHEN and JOIN of a ray are not checked against AutoCAD yet, nor the menus of its grips.

## Questions

### What is the RAY command in AutoCAD?

A construction line with a start: it begins at a point and runs on forever in one direction. Use it as a reference to draw against, then trim it into a line or erase it.

### Does RAY have a shortcut?

No: AutoCAD gives RAY no alias, so type `RAY` in full. It is in the expanded Draw panel of the ribbon, and here in the Draw tools beside Construction Line.

### How do I make a ray stop at a line?

Trim it: run <Command id="TRIM" /> and pick the part past the line. What is left from the start to the line is a line object.

### What is the difference between a ray and a line?

A line has two ends; a ray has one, its start, and runs on without end. In a DXF file a ray is saved as a RAY, and opens as one.
