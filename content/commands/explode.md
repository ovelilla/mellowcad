---
title: "EXPLODE in AutoCAD"
metaTitle: "EXPLODE in AutoCAD: command, alias and undo"
description: "How AutoCAD's EXPLODE (X) works: a polyline into lines and arcs, a block into its objects, text into lines, a hatch into its lines. Try it free in your browser."
figure: "A rectangle, one polyline, exploded into four lines, and one of them then erased on its own."
related: ["JOIN", "BLOCK", "PEDIT", "INSERT"]
coverage: "6c7f855e4115"
---

EXPLODE breaks a compound object into the objects it is made of. Select the objects and press Enter: a polyline becomes lines and arcs along its centreline, a block reference the objects of its block, one level down, multiline text one line of text for each line it shows, and a pattern hatch the lines of its pattern. Each piece keeps the object's layer and properties; a block's pieces keep their own. A wide polyline loses its width, and EXPLODE says so. Lines, circles, arcs, single-line text and dimensions cannot be exploded: they are refused as they are selected, and a spline, an ellipse or a solid hatch when the selection closes. The explode is one step that Undo takes back.

## Missing

Dimensions, which AutoCAD explodes into lines, arrowheads and text and MellowCAD refuses. A hatch whose pattern is not shipped here is refused as a solid one, and exploded multiline text sits where the font draws it, a hair off AutoCAD's place.

## Questions

### What is the shortcut for EXPLODE in AutoCAD?

`X`, then Enter or Space. The full name works too, and `_EXPLODE` in any language of AutoCAD.

### How do I undo an explode in AutoCAD?

Type <Command id="U" /> or press Ctrl+Z straight away: the explode is one undo step. Later, <Command id="JOIN" /> turns lines and arcs that meet end to end back into one polyline, and <Command id="BLOCK" /> makes objects one block again.

### Can I explode text in AutoCAD?

Multiline text, yes: each line becomes a single-line text. Single-line text is already the smallest piece, and EXPLODE refuses it.

### How do I explode a block in AutoCAD?

Select the block reference and press Enter: it becomes the objects of its block, where the reference drew them. A block inside it stays a block: explode it again. Attributes come back as their definitions, without the values.
