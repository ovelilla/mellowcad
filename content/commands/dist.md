---
title: "DIST in AutoCAD"
metaTitle: "DIST in AutoCAD: measure distance, alias DI"
description: "How AutoCAD's DIST (DI) works: the distance between two points with its angles and its X, Y and Z deltas, or the length of a run of points. Try it free online."
figure: "DIST along a 100 by 60 plate's diagonal: the distance, the angle in the XY plane and the deltas."
related: ["AREA", "ID", "LIST", "UNITS"]
coverage: "35c7e8a81fd9"
---

DIST measures the distance between two points. Pick, snap or type the first point and the second, and it writes at the command prompt the distance, the angle in the XY plane and the angle from it, and the deltas in X, Y and Z, then ends. Each point is measured where it is, its Z included, so the distance is the true one in space. Enter at the first point starts from the last point given, and at the second measures back to the first. The numbers follow the drawing's precision, and the angles AUPREC.

## Options

### Multiple

<Keyword id="Multiple" /> points, at the second prompt: a run of points instead of one span, the distance so far written before each next point and shown above the cursor, until Enter or <Keyword id="Total" />.

### Arc

Measures along arcs instead, with PLINE's arc options: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. Each arc's length is added to the run.

### Close

Goes back to the first point, adds that last span, writes the total and ends.

### Length

Adds a span of the length you type along the last one.

### Undo

Takes back the last point of the run.

### Total

Writes the run's total and ends; Enter does the same.

## Missing

MEASUREGEOM, the ribbon's Measure tools, which ask DIST's prompts inside a loop with Radius, Angle, Area, Volume and Quick: here the ribbon's Distance button runs DIST. At the Arc option's <Keyword id="Center" />, the included angle is read in degrees, where AutoCAD 2027 reads a number there as a distance along the cursor.

## Questions

### What is the shortcut for DIST in AutoCAD?

`DI`, then Enter or Space. The full name works too, and `_DIST` in any language of AutoCAD.

### How do I measure a distance in AutoCAD?

Type `DI`, then pick the two points, with object snaps to land on the objects' endpoints or centres. The distance is written at the command prompt with the angle and the deltas.

### How do I measure the total length of several segments?

At the second point choose <Keyword id="Multiple" /> points and go on picking: the distance so far is shown at each point, and Enter writes the total.

### How do I measure a distance in 3D?

Give the points with their Z, or snap to objects at their height: DIST measures the true distance in space and writes the angle from the XY plane and the delta in Z.

### Why does DIST show fewer decimals than I need?

It writes lengths at the drawing's precision, two places in a new drawing here. Set more in <Command id="UNITS" />, up to eight.
