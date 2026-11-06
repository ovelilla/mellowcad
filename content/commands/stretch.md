---
title: "STRETCH in AutoCAD"
metaTitle: "STRETCH in AutoCAD: crossing window and alias"
description: "How AutoCAD's STRETCH (S) works: a crossing window over the ends to move, a base point and a second point, and why it sometimes just moves. Try it free online."
figure: "A rectangle and a circle stretched 40 to the right by a crossing window over the right side: the corners inside it move, and the circle with them."
related: ["MOVE", "SCALE", "EXTEND", "TRIM"]
coverage: "75c27e9d62b5"
---

STRETCH moves the part of a drawing a crossing window catches and stretches what joins it to the rest. Select with a crossing window, dragged from right to left, or a crossing polygon, over the ends and vertices to move; then give a base point and a second point, as in <Command id="MOVE" />. What the window catches moves by that distance: a line's ends, a polyline's vertices, an arc's ends, a hatch's boundary, a dimension's origins. What lies wholly inside it moves whole; a circle, a text or a block reference moves when its centre or insertion point is inside. Objects picked one by one, or found by Window, move whole too. The stretch is one step that Undo takes back.

## Options

### Displacement

Chosen at the base point prompt, or by Enter there, its default: asks for the move as a vector, `40,0` stretching 40 along X. At the second point, Enter does the same with the base point: its coordinates are the move.

## Missing

An elliptical arc with one end in the window, which AutoCAD reshapes: here it moves whole with its centre in the window, else stays. A non-associative hatch caught in part, which AutoCAD leaves where it is. A dimension's text at its default place stays when only it is caught.

## Questions

### What is the shortcut for STRETCH in AutoCAD?

`S`, then Enter or Space. The full name works too, and `_STRETCH` in any language of AutoCAD.

### Why does STRETCH just move the objects?

Because the whole object is inside the window, or you picked it: STRETCH moves those whole. Drag a crossing window, from right to left, over only the ends you want to move.

### How do I stretch by an exact distance?

Give the base point, then type the move: `40,0` stretches 40 along X, read relative to the base point with dynamic input on. Or point the cursor the way to go, with Ortho or polar tracking, and type only the distance.

### Can I stretch a block in AutoCAD?

A block reference moves whole when its insertion point is inside the window, and stays when it is not: its insides do not stretch. <Command id="EXPLODE" /> it first to stretch its pieces.
