---
title: "EXTEND in AutoCAD"
metaTitle: "EXTEND in AutoCAD: command, boundaries and alias"
description: "How AutoCAD's EXTEND (EX) works, prompt by prompt: Quick and Standard modes, boundary edges, fence, crossing and Edge, and Shift to trim. Try it free online."
figure: "Two lines grown to the line across their path: each picked once near the end that grows, in Quick mode."
related: ["TRIM", "OFFSET", "FILLET", "JOIN"]
coverage: "2434994f52aa"
---

EXTEND lengthens an object until it meets another: you pick it near the end that should grow, and that end runs on to the nearest edge in its way. It extends lines, arcs, elliptical arcs, open polylines (along their end segment, straight or round its arc), 3D polylines and open splines. It starts in Quick mode, as AutoCAD's does: every object is a boundary. Holding Shift as you pick trims instead, as <Command id="TRIM" /> does. Each pick is one step that Undo takes back; Enter ends the command.

## Options

### Boundary

Chooses which objects bound: select them, or press Enter to take every object. From then on only those bound, whatever the mode, until the command ends.

### Fence

Asks for the points of a line, as many as you like until Enter: every object it crosses is extended from the end nearer where the fence crosses it, in one step. Standard mode lists it; Quick mode takes it too.

### Crossing

Asks for the two corners of a window: every object its outline crosses is extended, in one step.

### mOde

Switches between <Keyword id="Quick" /> and <Keyword id="Standard" />. In Standard mode EXTEND first asks for the boundary edges (Enter takes them all) and lists Fence and Edge. The mode is EXTEND's and TRIM's both, and lasts the session.

### Edge

Standard mode only. With <Keyword id="Extend" />, an object also stops where a boundary would be if it ran on — a line both ways, an arc round its circle — so a line can grow to one that falls short of its path; <Keyword id="No extend" /> is the default.

### Undo

Listed once the prompt has had an answer — a pick, a fence, a window: takes back the last extension, and with nothing left to take back says so.

## Missing

Project: AutoCAD's projection option (None, Ucs, View) is not offered, and everything is worked out projected on the UCS's XY plane, which is AutoCAD's default, Ucs. A fence cannot be dragged with the cursor yet, only picked point by point. The mode and Edge's choice last the session, where AutoCAD keeps them from one session to the next. An object at an angle to the UCS, a spline aside, neither bounds nor is extended, and a polyline smoothed by <Command id="PEDIT" />'s <Keyword command="PEDIT" id="Fit" /> is refused, where AutoCAD grows its last arc.

## Questions

### What is the shortcut for EXTEND in AutoCAD?

`EX`, then Enter or Space. The full name works too, and `_EXTEND` in any language of AutoCAD.

### Why does EXTEND say there is no edge?

Because nothing lies across the path that end would follow. A line says <Message id="noEdgeInThatDirection" /> when its other end would reach an edge, and a line or an arc <Message id="pathDoesNotIntersectBoundingEdge" /> otherwise; a polyline or a spline says <Message id="objectDoesNotIntersectEdge" />. Pick nearer the other end, or in Standard mode choose <Keyword id="Edge" /> and <Keyword id="Extend" /> to let a boundary that falls short count as if it ran on. A circle, a closed polyline, a whole ellipse, text or a hatch cannot be extended at all: <Message id="cannotExtendObject" />

### How do I extend several lines at once?

Pick on an empty spot and pick a second point: every object that fence crosses grows from its nearer end, in one step. Or choose <Keyword id="Crossing" /> and draw a window over the ends to extend.

### How do I trim with EXTEND?

Hold Shift as you pick: the piece is trimmed back to the nearest crossings, as <Command id="TRIM" /> would, and an object that nothing crosses is deleted. The next pick without Shift extends again.
