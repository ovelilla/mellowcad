---
title: "CHAMFER in AutoCAD"
metaTitle: "CHAMFER in AutoCAD: command, distances and alias"
description: "How AutoCAD's CHAMFER (CHA) works, prompt by prompt: two distances, two lines or a polyline's corners, Multiple, Shift. Try it free in your browser."
figure: "Four lines, then Distance 10 for both and Multiple: two corners cut, two left sharp."
related: ["FILLET", "TRIM", "EXTEND", "CHAMFEREDGE"]
coverage: "e43888c866b6"
---

CHAMFER cuts the corner between two lines with a straight bevel. Pick the first line, then the second: each is trimmed or extended to the bevel, the first by the first distance and the second by the second, and the bevel joins them. It works on two lines, on two straight segments of a polyline, or on a line and a polyline, which it joins into one polyline. As in AutoCAD, its first line says the current distances, which are kept in the drawing; both 0, the default, makes a sharp corner, the lines meeting. While you pick the second line, the corner it would make is shown over the lines.

## Options

### Undo

Takes back the last chamfer of this run, and a change of the distances with it.

### Polyline

Asks for a 2D polyline and chamfers every corner of it, then says how many lines were chamfered and why any were not.

### Distance

Asks the first and the second chamfer distance. The second offers the first, so Enter there makes the bevel even, at 45 degrees on a square corner.

### Multiple

Keeps asking for a first line after each chamfer, until Enter or Escape.

## Missing

Angle, which sets the bevel by one distance and an angle, Method and Trim: CHAMFER always works by two distances and always trims the lines. The bevel takes the second line's linetype scale in AutoCAD, not here.

## Questions

### What is the shortcut for CHAMFER in AutoCAD?

`CHA`, then Enter or Space. The full name works too, and `_CHAMFER` in any language of AutoCAD.

### How do I make a 45-degree chamfer in AutoCAD?

Choose <Keyword id="Distance" />, type the distance and press Enter at the second: on a square corner, two equal distances make a 45-degree bevel.

### What is the difference between CHAMFER and FILLET?

CHAMFER joins two lines with a straight bevel; <Command id="FILLET" /> with an arc tangent to both. Both trim or extend the lines to it, and both make a sharp corner at 0 or with Shift held on the second line.

### Why does CHAMFER not work?

It says why: <Message id="chamferDistanceTooLarge" /> when a distance runs past the end of its line, <Message id="linesParallel" /> for parallel lines, and <Message id="chamferRequiresLines" /> for an arc or a circle. With both distances 0 it makes a corner, not a bevel.

### How do I chamfer every corner of a rectangle?

A rectangle is a polyline: choose <Keyword id="Polyline" /> and pick it, and every corner is chamfered at the current distances.
