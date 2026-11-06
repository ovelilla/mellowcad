---
title: "JOIN in AutoCAD"
metaTitle: "JOIN in AutoCAD: lines into a polyline and alias"
description: "How AutoCAD's JOIN (J) works: lines and arcs that meet into a polyline, collinear lines into one, arcs into a circle, curves into a spline. Try it free online."
figure: "Three lines joined into one polyline, which one pick of OFFSET then follows whole."
related: ["PEDIT", "EXPLODE", "BREAK", "PLINE"]
coverage: "d291b889c10e"
---

JOIN makes one object of several. Select them, as many as you like, and press Enter: lines and arcs that meet end to end become one polyline, joined to a polyline among them if there is one; lines on one straight line become one line, over any gap; arcs of one circle become one arc, and when they close, JOIN asks whether to make it a circle, <Keyword id="Yes" /> by default, or keep it as an arc with <Keyword id="No" />. Elliptical arcs of one ellipse become one arc, and a spline or an elliptical arc among curves that meet makes a spline. It then says what it made, and how many objects it left out. A polyline joins only by its ends, and a closed one joins nothing. The join is one step that Undo takes back.

## Options

### cLose

When an elliptical arc is the source, picked alone: makes its ellipse whole.

## Missing

AutoCAD's own step when a single line, arc or polyline is the source, picked alone (`Select lines to join to source:`): here it joins nothing. A closed object picked alone, which AutoCAD asks again for. Helixes, objects in a tilted plane or upside down, and lines that do not lie in one plane, which AutoCAD joins into a 3D polyline or flattens into a polyline.

## Questions

### What is the shortcut for JOIN in AutoCAD?

`J`, then Enter or Space. The full name works too, and `_JOIN` in any language of AutoCAD.

### How do I join lines into a polyline in AutoCAD?

Run JOIN, select the lines, with a window if you like, and press Enter: those that meet end to end become one polyline.

### Why does JOIN not work?

The objects must meet exactly, end to end and in one plane: a gap or a crossing leaves them out, and JOIN says how many it discarded. Only collinear lines, arcs of one circle and arcs of one ellipse are joined over a gap. A closed polyline joins nothing.

### How do I join arcs into a circle?

Select arcs of one circle that cover it all, and press Enter: JOIN asks whether to convert them to a circle, and <Keyword id="Yes" />, the default, does.
