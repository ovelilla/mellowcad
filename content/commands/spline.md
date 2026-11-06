---
title: "SPLINE in AutoCAD"
metaTitle: "SPLINE in AutoCAD: command, Fit, CV and alias"
description: "How AutoCAD's SPLINE (SPL) works, prompt by prompt: a curve through fit points or pulled by control vertices, Knots, Degree, tangents and Close. Try it free."
figure: "A fit spline through five points, and below it a CV spline on five vertices placed the same way: the first passes through them, the second is pulled towards them."
related: ["PLINE", "PEDIT", "SPLINEDIT", "ELLIPSE"]
coverage: "36b4ce8c1c8b"
---

SPLINE draws a smooth curve, in one of two ways: through points you give (Fit, the default), or pulled towards control vertices you place (CV). It opens by saying its settings, `Method=Fit   Knots=Chord`, then asks for the first point; Enter there is refused, as in AutoCAD. Each point after it bends the curve, the ghost following the cursor, and Enter ends it. Points can be picked, snapped or typed, a typed length runs along the cursor, and a point keeps its Z, so a spline can rise in space. Escape drops the curve; the whole spline is one step that <Command id="U" /> takes back. The ribbon's Spline Fit and Spline CV buttons run SPLINE with the method already answered.

## Options

### Method

<Keyword id="Fit" /> or <Keyword id="CV" />. A fit spline passes through every point you give; a CV spline passes through its first and last vertex only, and the others pull it towards them, so it comes out smoother and further from them. The method, like the knots and the degree, is kept for the rest of the session.

### Knots

How a fit spline spaces its points along the curve: <Keyword id="Chord" /> (the default, by the distance between them), <Keyword id="Square root" /> of that distance, or <Keyword id="Uniform" />, all the same. Through the same points each makes a slightly different curve.

### Degree

A CV spline's degree, from 1 (straight lines between the vertices) to 10; 3, the default, is a cubic. With fewer vertices than the degree needs, the curve takes the highest it can.

### Object

Turns a polyline that PEDIT's Spline option has fitted, 2D or 3D, into a CV spline of the same curve, and erases the polyline, in one step. Anything else is refused with <Message id="onlySplineFittedPolylines" />.

### start Tangency

Offered after the first point: the direction the curve leaves it in, picked or typed from that point.

### end Tangency

The direction the curve arrives at its last point in, then the spline ends.

### Undo

Takes back the last point, down to the first.

### Close

From the third point: joins the end back to the start in one smooth loop, with no corner, and ends the command.

## Missing

Fit tolerance: a fit spline always passes exactly through its points, and the toLerance option is not offered. While it is drawn, the spline is no object to snap or track to yet, as AutoCAD's is. Object always erases the polyline (DELOBJ). On a finished spline there are no CVSHOW or CVHIDE and no grip menus to add or remove a point, the Properties palette edits its points but not its method, degree, knots, weights or closing, and Geometric Center, Perpendicular and Tangent do not snap to it. HATCH does not find a spline as a boundary, and BLEND does not exist yet.

## Questions

### What is the shortcut for SPLINE in AutoCAD?

`SPL`, then Enter or Space. The full name works too, and `_SPLINE` in any language of AutoCAD.

### What is the difference between Fit and CV?

A fit spline goes through the points you click, which suits a curve that must touch them. A CV spline is shaped by its control vertices, which it only approaches, which suits a fair, smooth shape. Choose with <Keyword id="Method" /> at the first prompt.

### How do I convert a spline to a polyline?

Run <Command id="PEDIT" /> and pick the spline: it says <Message id="objectNotPolyline" /> and offers to turn it into one, then asks a precision from 0 to 99, 10 by default. The polyline follows the spline with short straight segments, more of them than AutoCAD makes.

### How do I convert a polyline to a spline?

Fit the polyline with <Command id="PEDIT" />'s Spline option, then run SPLINE and choose <Keyword id="Object" />: the polyline becomes a spline of the same curve.

### Can I explode a spline in AutoCAD?

No: <Command id="EXPLODE" /> refuses a spline, as AutoCAD does. To break it into pieces, convert it to a polyline with <Command id="PEDIT" /> first, then explode that into lines.
