---
title: "FILLET in AutoCAD"
metaTitle: "FILLET in AutoCAD: command, radius and options"
description: "How AutoCAD's FILLET (F) works, prompt by prompt: the radius, two lines, a polyline's corners, radius 0 and Multiple. Try it free in your browser."
figure: "Four lines, then Radius 15 and Multiple: two corners rounded, two left sharp."
related: ["CHAMFER", "FILLETEDGE", "TRIM", "OFFSET"]
coverage: "63730dd8d534"
---

FILLET rounds the corner between two objects with an arc of the radius you give, trimming or extending each object to it. Its first line says the mode and the current radius; then you pick the first object and the second, each on the side to keep, and the command ends. It takes lines, arcs, circles, ellipses, splines and the segments of a 2D polyline. Two lines need not meet: they are extended to the arc, as in AutoCAD. At radius 0, or with Shift held at the second pick, it makes a sharp corner instead.

## Options

### Undo

Takes back the last fillet, <Keyword id="Polyline" /> or radius given in this FILLET, one at a time. With nothing left to take back it says <Message id="commandCompletelyUndone" />

### Polyline

Asks for a 2D polyline and rounds every corner where two of its segments meet, in one step, then says how many it filleted and how many it passed over, parallel or too short for the radius. A rectangle drawn with <Command id="RECTANG" /> is such a polyline.

### Radius

Asks for the radius, also offered at the second prompt. It is the drawing's (FILLETRAD): the next FILLET starts with it, and it is saved with the drawing. 0 makes sharp corners; a negative radius is refused.

### Multiple

Asks for the first object again after each fillet, so you round corner after corner without starting over, until Enter.

## Missing

Trim: the objects are always trimmed or extended to the arc, as with TRIMMODE 1, AutoCAD's default; No trim is not offered. The arc does not take the second object's linetype scale, as no object has one of its own here. Before the click, the tooltip shows the prompt rather than why a pair cannot be filleted, and no padlock marks an object on a locked layer. A few rare pairs of ellipses or splines end otherwise: a closed spline with a line at radius 0, an arc that only touches an ellipse's offset, and such a pair in a tilted plane.

## Questions

### What is the shortcut for FILLET in AutoCAD?

`F`, then Enter or Space. The full name works too, and `_FILLET` in any language of AutoCAD.

### How do I fillet two lines?

Choose <Keyword id="Radius" />, type it, then pick each line on the side you want to keep. Lines that do not meet are extended to the arc, and lines that cross are trimmed back to it. Two parallel lines are joined by a half circle, whatever the radius. A line and a polyline's segment are joined into one polyline.

### What does a fillet radius of 0 do?

It makes a sharp corner: each line is trimmed or extended until they meet, and no arc is drawn. To make one sharp corner without changing the radius, hold Shift as you pick the second object.

### Why is FILLET not working?

It says why at the command line. <Message id="filletRadiusTooLarge" /> means the arc does not fit between the lines; <Message id="segmentsNotConsecutive" /> that two segments of one polyline are too far apart; text, blocks, dimensions and hatches are refused, objects at different heights are said to be non coplanar, and an object on a locked layer is not taken.

### How do I fillet the edges of a 3D solid?

Run <Command id="FILLETEDGE" />: choose <Keyword command="FILLETEDGE" id="Radius" /> if the radius is not the one it says, pick the solid's edges, then press Enter, and Enter again to accept the fillet. It works on 3D solids, which are still partial here.
