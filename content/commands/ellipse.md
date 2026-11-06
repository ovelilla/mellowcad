---
title: "ELLIPSE in AutoCAD"
metaTitle: "ELLIPSE in AutoCAD: axis, center, arc and alias"
description: "How AutoCAD's ELLIPSE (EL) works, prompt by prompt: an axis and the other half-axis, by its Center, Rotation, an elliptical Arc. Try it free in your browser."
figure: "An ellipse by the two ends of an axis, one by its Center, and half an elliptical Arc, from 0 to 180 degrees."
related: ["CIRCLE", "ARC", "OFFSET", "BREAK"]
coverage: "a38e3e28b70a"
---

ELLIPSE draws an ellipse from the two ends of one axis, then the distance from its middle to the end of the other axis: half the other axis's length. Either axis can be the longer one. It is a true ellipse, as AutoCAD's, not a polyline, so Center, Quadrant and Nearest snap to it, and its grips move it and set each half-axis. While you give the second end, an amber dashed line runs from the first; at the distance, the ellipse follows the cursor. The ellipse is made on the current layer, with the properties current when it is fixed.

## Options

### Arc

Draws an elliptical arc: the same prompts as an ellipse, then a start angle and an end angle, counter-clockwise from the end of the first axis you gave.

### Center

Starts from the centre: then the end of one axis, then the distance to the other.

### Rotation

Instead of the distance: the angle the ellipse is turned by about its first axis, as a circle seen at that angle. 0 draws a circle; an angle within 0.6 degrees of 90 is refused with <Message id="invalid" />.

### Parameter

In an arc, instead of the start or end angle: the angle on the circle the ellipse is drawn from, AutoCAD's parameter. <Keyword id="Angle" /> goes back to angles.

### Included angle

In an arc, instead of the end angle: how far it sweeps from the start. Enter takes 180, half the ellipse.

## Missing

Isocircle, offered by AutoCAD only with the isometric snap style, which is not built here. PELLIPSE 1, an ellipse drawn as a polyline. Hatching or dimensioning an ellipse, and the Intersection, Tangent and Perpendicular snaps on it. The arrow grips at an elliptical arc's ends, drawn square here, and typing a length or angle while a grip is hot. A point with a Z at the distance is measured in plan, where AutoCAD measures it in space.

## Questions

### What is the shortcut for ELLIPSE in AutoCAD?

`EL`, then Enter or Space. The full name works too, and `_ELLIPSE` in any language of AutoCAD.

### How do I draw half an ellipse in AutoCAD?

Choose <Keyword id="Arc" />, give the axis and the distance, then a start angle of `0` and an end angle of `180`. Or press Enter at <Keyword id="Included angle" />, which sweeps 180 by default.

### How do I draw an ellipse from its center?

Choose <Keyword id="Center" />, give the centre, then the end of one axis, then the distance from the centre to the end of the other: the ellipse's two half-axes.

### How do I draw an isometric circle in AutoCAD?

AutoCAD draws it with ELLIPSE's Isocircle, once the snap style is isometric. Neither is built in MellowCAD yet.
