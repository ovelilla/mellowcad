---
title: "PEDIT in AutoCAD"
metaTitle: "PEDIT in AutoCAD: edit polylines, Join and Width"
description: "How AutoCAD's PEDIT (PE) works: turn lines into a polyline, Join, Width, Fit and Spline, Edit vertex, Multiple, prompt by prompt. Try it free in your browser."
figure: "Three lines meeting end to end: PEDIT turns the first into a polyline, joins the other two to it and gives it a width of 2."
related: ["PLINE", "JOIN", "EXPLODE", "SPLINE"]
coverage: "e1a413c15bad"
---

PEDIT edits a polyline. Pick one at `Select polyline or [Multiple]:`, or select it before the command; double-clicking a polyline runs PEDIT on it too. Pick a line, an arc or a spline instead and it says <Message id="objectNotPolyline" /> and asks whether to turn it into one, Yes by default: the new polyline takes its place and its properties. Then it asks for an option again and again, each one applied at once, until Enter ends it. A 3D polyline gets a shorter list, with no width, no curve fit and no linetype generation, and its spline option is <Keyword id="Spline curve" />. Escape keeps what was done; the whole edit is one step that <Command id="U" /> takes back.

## Options

### Multiple

Edits several polylines at once: select them, say whether to convert the lines, arcs and splines among them, then each option is applied to all. Its Join asks a fuzz distance and a <Keyword id="Jointype" />: <Keyword id="Extend" /> trims or extends the end segments to meet, <Keyword id="Add" /> bridges the gap with a new segment, <Keyword id="Both" /> extends where it can and adds where it cannot.

### Close

Closes the polyline with a segment from its last vertex to its first, an arc where the last segment is an arc. On a closed polyline the option is <Keyword id="Open" />, which takes that segment away.

### Join

Adds lines, arcs and open polylines that meet the polyline's ends, end to end, and says how many segments it added. A closed polyline cannot be joined to: <Message id="cannotJoinClosedPolyline" />.

### Width

One width for every segment, typed or measured by two points; 0 takes the width away.

### Edit vertex

Puts an X on the first vertex and asks what to do there: <Keyword id="Next" /> and <Keyword id="Previous" /> step the X, <Keyword id="Move" /> moves the vertex, <Keyword id="Insert" /> adds one after it, <Keyword id="Break" /> and <Keyword id="Straighten" /> remember the vertex, you step the X to another, and <Keyword id="Go" /> breaks the polyline between the two or makes one straight segment of what lies between, <Keyword id="Width" /> sets the next segment's start and end widths, <Keyword id="Tangent" /> gives the vertex a direction for a later Fit, and <Keyword id="eXit" /> goes back.

### Fit

Draws a smooth curve of arcs through every vertex, tangent where they meet, as AutoCAD's curve fit lays them. The vertices stay, and editing them reshapes the curve.

### Spline

Fits a B-spline to the polyline, framed by its vertices rather than passing through them: quadratic or cubic, with SPLINETYPE, and as fine as SPLINESEGS. A 3D polyline's is <Keyword id="Spline curve" />. SPLINE's Object turns such a polyline into a true spline.

### Decurve

Takes the Fit or Spline curve away: straight segments between the vertices again.

### Ltype gen

<Keyword id="ON" /> lays the linetype in one pattern along the whole polyline, so a dashed polyline with short segments still shows dashes; <Keyword id="OFF" />, the default, starts the pattern again at each vertex.

### Reverse

Turns the polyline round: its vertices the other way, the arcs and widths with them.

### Undo

Takes back the last option of this run, and goes on asking.

## Missing

PEDITACCEPT: picking a line, an arc or a spline always asks before converting it. PLINECONVERTMODE: a spline becomes a polyline of straight segments, far more of them than AutoCAD makes, never arcs. A fitted polyline shows in the Properties palette as a plain polyline, without AutoCAD's 2D Polyline title and its Fit/Smooth row. Multiple with only 3D polylines in the set asks the 3D prompt, where AutoCAD asks the 2D one. There are no meshes to edit.

## Questions

### What is the shortcut for PEDIT in AutoCAD?

`PE`, then Enter or Space. The full name works too, and `_PEDIT` in any language of AutoCAD. Double-clicking a polyline also runs it.

### How do I join lines into a polyline?

Run PEDIT, pick one of the lines and press Enter to turn it into a polyline, then choose <Keyword id="Join" /> and select the others: those that meet end to end become one polyline. <Command id="JOIN" /> does the same in one step.

### Why is PEDIT not working on my object?

PEDIT edits polylines, and offers to convert lines, arcs and splines; anything else, text, a circle, a block, is refused and asked again. An object on a locked layer says <Message id="objectOnLockedLayer" />. Join adds only objects whose ends meet the polyline's exactly: for gaps, use <Keyword id="Multiple" /> and a fuzz distance.

### How do I change the width of a polyline?

Choose <Keyword id="Width" /> and type the width: every segment takes it. For one segment, use <Keyword id="Edit vertex" />, step to the vertex where it starts and choose its <Keyword id="Width" />.

### How do I make a polyline curved?

<Keyword id="Fit" /> passes arcs through every vertex; <Keyword id="Spline" /> makes a smoother curve that its vertices frame. <Keyword id="Decurve" /> straightens it again.
