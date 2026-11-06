---
title: "3DPOLY in AutoCAD"
metaTitle: "3DPOLY in AutoCAD: 3D polyline command, 3P"
description: "How AutoCAD's 3DPOLY (3P) works: a 3D polyline of straight segments, each point at its own Z, with Close and Undo, and how it differs from PLINE. Try it free."
figure: "A 3D polyline climbing 15 at each corner of a 60 by 40 rectangle on the ground, seen from the south-east."
related: ["PLINE", "PEDIT", "SPLINE", "UCS"]
coverage: "2df5ebfcf91d"
---

3DPOLY draws a 3D polyline: straight segments through points that each have a Z of their own, as one object. Give the start point, then an endpoint for each segment, until Enter ends it; even a start point alone is kept, as a polyline of one vertex. Enter at the start point is refused with <Message id="invalidPoint" />: there is no Continue option, which LINE has. A point typed with a Z keeps it, `30,0,15`; one typed without, or clicked, lies at the elevation of the work plane, and a point snapped to an object takes the object's Z there. Points are read in the current UCS.

Unlike a <Command id="PLINE" /> it has no plane, no arcs, no widths and no thickness, and it is drawn continuous whatever its linetype, which it keeps. The whole polyline is one step that <Command id="U" /> takes back; Escape keeps what was drawn. PEDIT edits it with a shorter list of options, and its Spline curve fits a smooth curve to it.

## Options

### Close

From the second segment on: draws a segment back to the start point and ends.

### Undo

Takes back the last vertex, and goes on from the one before it. With no segment left: <Message id="all3dSegmentsUndone" />.

## Missing

A curve-fitted 3D polyline reads None in the Properties palette's Fit/Smooth, which AutoCAD calls Quadratic or Cubic, and cannot be changed there. It cannot be a hatch boundary or ARRAYPATH's path, and the palette has no Material row. Dynamic input asks the start point in one box, its Z typed after a second comma, where AutoCAD shows X, Y and Z fields. The grips' hover menus, Stretch, Add Vertex, Remove Vertex and the rest.

## Questions

### What is the shortcut for 3DPOLY in AutoCAD?

`3P`, then Enter or Space. The full name works too, and `_3DPOLY` in any language of AutoCAD.

### What is the difference between PLINE and 3DPOLY?

A <Command id="PLINE" /> lies in one plane and can have arcs and widths. A 3D polyline has only straight segments, but each vertex can be at a different height: a pipe run, a road's centre line, a cable.

### How do I draw a 3D polyline at different heights?

Type each point with its Z, `x,y,z`, or snap to objects at the heights you want. Under dynamic input a point after the first is relative: `60,0,15` goes 60 along X and 15 up from the last one.

### How do I make a 3D polyline smooth?

<Command id="PEDIT" /> it and choose its Spline curve: a smooth curve framed by the vertices. Decurve straightens it again.
