---
title: "MEASURE in AutoCAD"
metaTitle: "MEASURE in AutoCAD: points at a set distance"
description: "How AutoCAD's MEASURE (ME) works: points or blocks at a set length along a line, arc, circle or polyline, from the end you pick near. Try it free online."
figure: "A polyline 190 long measured every 15 from the end picked near: twelve points, the last 10 short of the far end."
related: ["DIVIDE", "PTYPE", "POINT", "DIST"]
coverage: "289548d5e445"
---

MEASURE marks an object at a set length. Select one line, arc, circle, ellipse, elliptical arc, polyline, 3D polyline or spline, then give the length, typed or as two points: MEASURE puts a point object every that length along the object, as far as one fits, and ends. It does not measure a distance for you, nor cut the object. It starts from the end nearer where you picked, so pick near the end to measure from; what is left over is at the other end, and when the length goes into the object a whole number of times, the far end gets a point too. A circle starts at its 0° point and runs counter-clockwise wherever it is picked; a closed polyline starts at its first vertex.

The points are drawn as the drawing's point style says, a dot by default: set a visible figure with <Command id="PTYPE" />, or PDMODE, first. The points lie on the object, on the current layer with the current colour, linetype and lineweight; the whole run is one step that <Command id="U" /> takes back, and the points are the Previous selection set. A length longer than the object gets <Message id="objectNotThatLong" />, and one so short it would make more than 32767 points <Message id="objectTooLong" />, both making nothing. Any other object gets <Message id="cannotMeasureObject" />. The Draw tools' Points drop-down starts MEASURE too.

## Options

### Block

Instead of points, references of a block already in the drawing: give its name, then whether to align each one with the object, <Keyword id="Yes" /> (the default) or <Keyword id="No" />, then the length. Aligned, each reference turns with the object at its place, along a line or tangent to an arc, whichever end the measuring starts from; not aligned, every one keeps the UCS's X. A name with no block behind it is refused, and the name asked again.

## Missing

Which way a closed polyline picked past its middle runs: here it is measured backwards from its first vertex, as AutoCAD measures a closed ellipse or spline, but AutoCAD's own polyline has not been checked. A circle's points always start along the UCS's X, where AutoCAD starts them at the snap angle, SNAPANG, which MellowCAD does not have.

## Questions

### What is the shortcut for MEASURE in AutoCAD?

`ME`, then Enter or Space. The full name works too, and `_MEASURE` in any language of AutoCAD.

### Does MEASURE measure distances?

No: it places points at a length you give. To read the distance between two points, use <Command id="DIST" />; for an object's length, <Command id="LIST" /> or <Command id="AREA" />.

### Which end does MEASURE start from?

The end nearer the point where you selected the object. Pick it close to the end you want the first length measured from.

### Why can't I see the points MEASURE made?

They are drawn as dots, the default point style. Open <Command id="PTYPE" /> and choose a cross or a circle, or set PDMODE to `3`: every point changes at once.

### What is the difference between MEASURE and DIVIDE?

<Command id="DIVIDE" /> splits an object into a number of equal parts; MEASURE steps along it by a length, leaving any remainder at the far end.
