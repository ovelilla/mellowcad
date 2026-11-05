---
title: "SCALE in AutoCAD"
metaTitle: "SCALE in AutoCAD: Reference, Copy and alias"
description: "How AutoCAD's SCALE (SC) resizes objects about a base point, prompt by prompt: a factor, Copy, and Reference for a known length. Try it free in your browser."
figure: "A plate and its hole scaled on a copy by Reference, about its corner: the 40 long edge picked, then made 60."
related: ["ROTATE", "MOVE", "STRETCH", "LTSCALE"]
coverage: "02087c3a6d99"
---

SCALE makes the objects you select larger or smaller about a base point, which stays where it is: a factor of 2 doubles them, 0.5 halves them, the same in every direction. Select the objects, pick the base point, then type the factor, or move the cursor and pick: the objects follow it. Enter there, with nothing typed, scales by the last factor used. Each run is one step that Undo takes back.

It scales everything it takes as AutoCAD does: a hatch's pattern grows with its boundary, a dimension measures its new length, an object above the plane scales in Z about the base point too.

## Options

### Copy

Scales a copy and leaves the objects as they were: it says <Message id="scalingCopy" /> and asks for the factor again, <Keyword id="Copy" /> still listed.

### Reference

Asks a reference length, typed or picked as two points, then the length it should have: the factor is the new length over the reference. The new length is typed, or a point whose distance from the base point it is; <Keyword id="Points" /> asks two points instead and measures between them. Both lengths offer the last ones given, 1 in a new drawing.

## Missing

Enter at the first or second point of <Keyword id="Points" /> ends the command unscaled, where AutoCAD scales by the cursor's reading there. A tiny factor is applied in silence, where AutoCAD says it ignores it. The objects dragged are drawn as <Command id="MOVE" /> drags them, in their colour only.

## Questions

### What is the shortcut for SCALE in AutoCAD?

`SC`, then Enter or Space. `_SCALE` works in any language of AutoCAD.

### How do I scale with a reference in AutoCAD?

Choose <Keyword id="Reference" /> at the factor, pick the two ends of an edge whose length you know, then type the length it should have. Everything selected is scaled by the new length over the old, so a drawing at the wrong size comes right from one known dimension.

### How do I scale an object and keep the original?

Choose <Keyword id="Copy" /> at the factor: the copy is scaled, the original stays where it was.

### How do I change the linetype scale?

Not with SCALE, which resizes the objects: <Command id="LTSCALE" /> sets how long the dashes and gaps of every linetype are drawn.

### How do I set a plot or layout scale?

MellowCAD has no layouts, viewports or plotting: you draw at full size in model space, and SCALE changes the size of the objects themselves, not how they would print.
