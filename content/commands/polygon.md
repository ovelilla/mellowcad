---
title: "POLYGON in AutoCAD"
metaTitle: "POLYGON in AutoCAD: inscribed, circumscribed"
description: "How AutoCAD's POLYGON (POL) draws a regular polygon, prompt by prompt: the sides, a centre, Inscribed or Circumscribed, or an Edge. Try it free in your browser."
figure: "Two circles of radius 30, a hexagon inscribed in one and circumscribed about the other, and a pentagon by its Edge."
related: ["RECTANG", "CIRCLE", "PLINE", "EXPLODE"]
coverage: "70db02df0448"
---

POLYGON draws a regular polygon, every side and angle equal, as one closed polyline. It asks the number of sides, from 3 to 1024, then the centre and whether the polygon is inscribed in a circle or circumscribed about it, then that circle's radius. Or it is built on one of its sides with Edge. The number of sides and the choice of Inscribed or Circumscribed are the next POLYGON's defaults, in that drawing. A radius typed as a number draws the bottom edge level; one given as a point, picked or typed, sets both the size and the turn of the polygon. While you give the radius, the polygon follows the cursor, with an amber dashed line from the centre.

## Options

### Edge

Instead of a centre: give the two ends of one side, and the polygon is built counter-clockwise from it.

### Inscribed

The vertices lie on the circle: the radius runs from the centre to a vertex. The default.

### Circumscribed

The sides touch the circle at their midpoints: the radius runs from the centre to the middle of a side.

## Missing

A rotated snap: a radius typed as a number always draws the bottom edge level with the UCS, where AutoCAD turns it by the snap angle, SNAPANG.

## Questions

### What is the shortcut for POLYGON in AutoCAD?

`POL`, then Enter or Space. The full name works too, and `_POLYGON` in any language of AutoCAD.

### How do I draw a hexagon in AutoCAD?

Run POLYGON, type `6` for the sides, give the centre, choose <Keyword id="Inscribed" /> or <Keyword id="Circumscribed" />, and type the radius. Across its flats, a circumscribed hexagon is twice the radius you type.

### What is the difference between inscribed and circumscribed?

With <Keyword id="Inscribed" />, the polygon's corners touch the circle, so it fits inside it. With <Keyword id="Circumscribed" />, its sides touch the circle, so the circle fits inside it. With the same radius, the circumscribed polygon is the larger.

### How do I draw a polygon with a given side length?

Choose <Keyword id="Edge" /> and give the two ends of one side: `0,0`, then the length typed relative to it, as `40,0`. The other sides follow, counter-clockwise.
