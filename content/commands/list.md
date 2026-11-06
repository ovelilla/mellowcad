---
title: "LIST in AutoCAD"
metaTitle: "LIST in AutoCAD: object properties, alias LI"
description: "How AutoCAD's LIST (LI, LS) works: select objects and read each one's type, layer, colour, points, length and area at the command line. Try it free online."
figure: "LIST of a plate's hole: the circle's layer, centre, radius, circumference and area."
related: ["PROPERTIES", "ID", "DIST", "AREA", "MASSPROP"]
coverage: "851e8fc0ebef"
---

LIST writes a report of each object you select at the command prompt, in AutoCAD 2027's columns and words. Each starts with its type, its layer and its space, then its colour, linetype, lineweight and thickness where they are not ByLayer or zero, then what the type has: a line's ends, length, angle and deltas; a circle's centre, radius, circumference and area; an arc's angles and length; a polyline's vertices, widths, area and length; a spline's control and fit points; a text's style, height and justification; a dimension's type, points and style; a hatch's pattern, scale and area; a block reference's name, insertion point, scales and attributes; an array's rows and items; a region's area, perimeter and bounding box.

Points are in the current UCS, lengths at the drawing's precision and angles at AUPREC. Objects selected before LIST are listed at once, without the prompt, and Enter on nothing ends it without a word. Every line comes at once: AutoCAD's text window pauses at `Press ENTER to continue:` each screenful, while the history here scrolls. There is no `Handle` line: objects here have no handles.

## Missing

The area of an open curve-fit polyline: here it is the area of the curve closed by its chord, and AutoCAD's is larger. A spline's length is exact here, where AutoCAD's is a close approximation. A DIMANGULAR made from two lines is listed by its three points, and no dimension is ever `associative: yes`. AutoCAD's pause and text window. What objects here do not have: ByBlock, a lineweight of Default, a linetype scale of their own, transparency and groups.

## Questions

### What is the shortcut for LIST in AutoCAD?

`LI` or `LS`, then Enter or Space. The full name works too, and `_LIST` in any language of AutoCAD.

### What does the LIST command show?

Everything AutoCAD's LIST says of the object: its type, layer, space and properties that are not ByLayer, then its geometry, each point and length as numbers. Select several objects and each one gets its report.

### How do I find the length or area of an object?

LIST it: a line's length, a circle's circumference and area, a polyline's length or perimeter and area. To add up several areas, use <Command id="AREA" />.

### How do I see the coordinates of a line's endpoints?

LIST the line: `from point` and `to point`, in the current UCS. For a single point, <Command id="ID" /> with an object snap.

### What is the difference between LIST and PROPERTIES?

LIST writes a report you read and copy from the history. <Command id="PROPERTIES" /> shows the same values in a palette, where you can change them.
