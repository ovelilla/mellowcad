---
title: "OFFSET in AutoCAD"
metaTitle: "OFFSET in AutoCAD: command, options and alias"
description: "How AutoCAD's OFFSET (O) works, prompt by prompt: a distance or Through, Erase and Layer, one object and one side at a time. Try it free in your browser."
figure: "A rectangle offset 6 inside and a circle offset 6 outside, each picked, then its side."
related: ["TRIM", "EXTEND", "FILLET", "COPY"]
coverage: "7971fa1b0ecd"
---

OFFSET draws a copy of an object parallel to it, at a distance you type or through a point you pick: a line gives a parallel line, a circle or an arc a concentric one, a polyline an outline inside or outside it, an ellipse or a spline a spline that follows it. As in AutoCAD, it takes one object at a time: you give the distance once, then pick an object and the side to put its copy on, as many times as you like. Enter ends it.

## Options

### Through

Instead of a distance, each copy passes through a point you pick or type. It is the first prompt's default, so Enter there chooses it until a distance has been given; from then on Enter repeats the last distance, in that drawing.

### Erase

Asks whether to erase each source object once it is offset, <Keyword id="Yes" /> or <Keyword id="No" /> (the default). With <Keyword id="Yes" />, the copy replaces the object. The choice is kept for the rest of the session, and the next OFFSET says it in its first line.

### Layer

Asks where the copies go: on the <Keyword id="Current" /> layer, or on the <Keyword id="Source" /> object's (the default). Kept for the session too.

### Exit

Ends the command, as Enter does at the object prompt.

### Multiple

At the side prompt: keep offsetting the same object without picking it again, each copy one distance further out from the last, until Enter or <Keyword id="Exit" />.

### Undo

Takes back the last copy, whichever object it came from, and asks for an object again. With no copy left to take back, it says so.

## Missing

OFFSETGAPTYPE 1 and 2: the corners of an offset polyline are always closed as with 0, the segments extended to meet. A spline's or an ellipse's offset is within AutoCAD's tolerance, but its knots fall where MellowCAD puts them, not where AutoCAD does. Through on a spline shows X and Y in its tooltip, not the distance.

## Questions

### What is the shortcut for OFFSET in AutoCAD?

`O`, then Enter or Space. The full name works too, and `_OFFSET` in any language of AutoCAD.

### Why can't I offset an object?

OFFSET offsets lines, arcs, circles, 2D polylines, ellipses and splines. It refuses text, multiline text, block references, dimensions and hatches with <Message id="cannotOffsetObject" />, and so it does when the distance would shrink a circle, an arc or a polyline to nothing. An object on a locked layer cannot be picked, and a 3D polyline is passed over.

### How do I offset the same line several times?

Pick the line, then type the letter of <Keyword id="Multiple" /> at the side prompt: each pick on that side makes one more copy, each a distance beyond the last. Or keep the default and pick the newest copy each time.

### How do I put the offset copies on the current layer?

Choose <Keyword id="Layer" /> at the first prompt, then <Keyword id="Current" />. From then on every copy goes on the layer that is current, until you choose <Keyword id="Source" /> again.
