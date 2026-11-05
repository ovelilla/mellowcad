---
title: "PLINE in AutoCAD"
metaTitle: "Polyline in AutoCAD: PLINE command and options"
description: "How AutoCAD's PLINE (PL) works, prompt by prompt: lines and arcs in one polyline, Width and Halfwidth, Length, Close and Undo. Try it free in your browser."
figure: "A line, a tangent arc and a line back, then a head 10 wide tapering to 0: one polyline."
related: ["PEDIT", "JOIN", "RECTANG", "EXPLODE"]
coverage: "5eb484a31065"
---

PLINE draws a polyline: one object made of straight segments and arcs joined end to end, each with a width. After the start point it says the current width; then each point adds a segment, until Enter or <Keyword id="Close" /> ends it. As in AutoCAD, it starts with lines: <Keyword id="Arc" /> switches to arcs, each tangent to the segment before it, and <Keyword id="Line" /> switches back. Enter at the start point continues from the end of the last line, arc or polyline drawn.

## Options

### Arc

Arc mode: each endpoint draws an arc tangent to the last segment, or, as the first segment, leaving the way the last line, arc or polyline drawn ends. Hold Ctrl to switch its direction. The options below shape the next arc.

### Close

Listed once there is a segment: closes the polyline back to its start and ends the command; in arc mode, with a tangent arc.

### Halfwidth

As <Keyword id="Width" />, but each width is measured from the centre of the segment to its edge.

### Length

A line of the length you give, the way the polyline heads: along the last segment, or tangent to the last arc. A negative length goes back.

### Undo

Takes back the last segment and goes on in the mode of the one before. With none left it says <Message id="allSegmentsUndone" />

### Width

The starting width, then the ending width, each typed or picked from the last vertex: 10 to 0 tapers to a point, as an arrowhead does. The ending width carries on to the next segments and, as PLINEWID, to the next PLINE.

### Angle

Arc mode: the arc's included angle, then its endpoint, its centre or its radius.

### Center

Arc mode: the arc's centre, then its endpoint, its included angle or the length of its chord.

### Direction

Arc mode: the direction the arc leaves the last vertex, in place of the tangent, then its endpoint.

### Line

Arc mode: back to straight segments.

### Radius

Arc mode: the arc's radius, then its endpoint or its included angle. A negative radius draws the major arc.

### Second pt

Arc mode: a point the arc passes through, then its endpoint: an arc through three points.

## Missing

PLINEGEN: a new polyline lays its linetype segment by segment, as with PLINEGEN 0 (PEDIT's Ltype gen turns it on for one polyline). A dashed linetype on a wide segment is drawn solid. A wide segment's preview is not drawn in a dimmer shade, and the arc prompt is written on one line where AutoCAD breaks it in two.

## Questions

### What is the shortcut for PLINE in AutoCAD?

`PL`, then Enter or Space. The full name works too, and `_PLINE` in any language of AutoCAD.

### How do I draw a curved polyline?

Choose <Keyword id="Arc" />: each point then ends an arc tangent to the segment before it, until <Keyword id="Line" />. To smooth a polyline already drawn through its vertices, use <Command id="PEDIT" /> and its <Keyword command="PEDIT" id="Fit" /> or <Keyword command="PEDIT" id="Spline" />.

### Why is my polyline drawn thick?

A width given in an earlier PLINE is kept, and the next polyline starts with it, as the line after its start point says. Choose <Keyword id="Width" /> and give 0 twice to draw thin again. With <Command id="FILL" /> off, wide polylines show as outlines.

### How do I join lines into a polyline?

Run <Command id="JOIN" /> and select lines, arcs and polylines that meet end to end: each chain becomes one polyline. Or run <Command id="PEDIT" /> on a line, answer <Keyword command="PEDIT" id="Yes" /> to turn it into a polyline, and add the rest with <Keyword command="PEDIT" id="Join" />.

### How do I find the area or length of a polyline?

Run <Command id="AREA" />, press Enter for <Keyword command="AREA" id="Object" /> and pick the polyline: a closed one reports its area and perimeter, an open one its length.
