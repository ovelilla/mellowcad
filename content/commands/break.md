---
title: "BREAK in AutoCAD"
metaTitle: "BREAK in AutoCAD: break a line, break at point"
description: "How AutoCAD's BREAK (BR) works, prompt by prompt: the pick is the first point, then the second, or First point; break at a point. Try it free online."
figure: "A line broken between two points given with First point, and a circle broken from where it was picked counter-clockwise to a second point."
related: ["BREAKATPOINT", "TRIM", "JOIN", "ERASE"]
coverage: "706a61939f46"
---

BREAK cuts a gap out of an object, or splits it in two. Select the object: as in AutoCAD, the point you picked it at is the first break point, so the next prompt asks only for the second, and the part between the two is removed. A line, an arc, an open polyline, an elliptical arc or a spline loses the part between the points and becomes two objects; a circle or an ellipse loses the part running counter-clockwise from the first point to the second, and a closed polyline the part between them in the order of its vertices: each becomes one open object. A point off the object is taken at its nearest point, and one past an end cuts to that end. While you give the second point, the part BREAK would keep is shown over the object. The break is one step that Undo takes back.

## Options

### First point

At the second break point: give the first break point again, then the second, when where you picked the object is not where the gap starts.

## Missing

An arc, a circle or an ellipse that does not lie level with the UCS, which AutoCAD breaks and MellowCAD does not find. A whole ellipse that <Command id="MIRROR" /> has turned over, which AutoCAD breaks the other way round.

## Questions

### What is the shortcut for BREAK in AutoCAD?

`BR`, then Enter or Space. The full name works too, and `_BREAK` in any language of AutoCAD.

### How do I break a line at a point?

Run <Command id="BREAKATPOINT" />, select the line and give the point: it becomes two lines that meet there. In BREAK, type `@` at the second break point for the same.

### How do I break a line between two points?

Select the line, choose <Keyword id="First point" />, then give the first and the second point: the part between them is removed. Or pick the line at the first point, and give only the second.

### Why can't I break a block or a text?

BREAK breaks lines, arcs, circles, polylines, ellipses and splines. A block reference says <Message id="cannotBreakBlock" />, and a text, a dimension or a hatch <Message id="objectCannotBeBroken" />; <Command id="EXPLODE" /> a block first to break its pieces.

### Which way does BREAK cut a circle?

Counter-clockwise, from the first point to the second, as in AutoCAD. Give the points the other way round to keep the other part.
