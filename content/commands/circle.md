---
title: "CIRCLE in AutoCAD"
metaTitle: "CIRCLE in AutoCAD: 2P, 3P, Ttr and alias"
description: "How AutoCAD's CIRCLE (C) works, prompt by prompt: centre and radius or Diameter, 2P, 3P and Ttr, a circle tangent to two objects. Try it free in your browser."
figure: "Three circles: centre and radius, two ends of a diameter (2P), centre and Diameter."
related: ["ARC", "ELLIPSE", "OFFSET", "DIMRADIUS"]
coverage: "b82177668cf1"
---

CIRCLE draws a circle from its centre and its radius, typed or given by a point on the circle, or in one of the other ways its first prompt offers. Enter at the radius repeats the last circle's size, kept for the drawing. While you give the radius, an amber dashed line runs from the centre to the cursor, past the rim when you give the diameter, as AutoCAD draws it. The circle lies in the plane of its first point, at the current elevation if the point has no Z of its own.

## Options

### 3P

Through three points. Typed with Tangent snaps, `_TAN` at each, it is AutoCAD's Tan, Tan, Tan: the circle touching three objects.

### 2P

From the two ends of a diameter.

### Ttr

Tangent to two objects, with a radius: pick each line, circle or arc near where the circle should touch it, then give the radius. Of the circles that fit, it draws the one that touches nearest your picks; when none does, it says <Message id="circleDoesNotExist" />.

### Diameter

At the radius prompt: give the diameter instead, typed or as a point.

## Missing

Ttr on a polyline segment, which AutoCAD takes and MellowCAD refuses; the tool palette's Tan, Tan, Tan entry (typing it, 3P with three Tangent snaps, works); Quick Properties on a double-click of a circle.

## Questions

### What is the shortcut for CIRCLE in AutoCAD?

`C`, then Enter or Space. The full name works too, and `_CIRCLE` in any language of AutoCAD.

### How do I draw a circle tangent to two lines?

Choose <Keyword id="Ttr" />, pick the first line, then the second, near where the circle should touch them, and type the radius.

### How do I draw a circle tangent to three objects?

Choose <Keyword id="3P" /> and type `_TAN` before each of the three points, picking each object near where the circle should touch it.

### How do I draw a circle by its diameter?

Give the centre, then choose <Keyword id="Diameter" /> and type it. Or choose <Keyword id="2P" /> and give the two ends of the diameter.
