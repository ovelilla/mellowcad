---
title: "ROTATE in AutoCAD"
metaTitle: "ROTATE in AutoCAD: command, Reference and alias"
description: "How AutoCAD's ROTATE (RO) works, prompt by prompt: base point and angle, Copy to keep the original, Reference to turn to an angle. Try it free in your browser."
figure: "A rectangle turned 30° about its corner with Copy, the original kept."
related: ["MOVE", "COPY", "MIRROR", "SCALE"]
coverage: "206bea7d17e9"
---

ROTATE turns the objects you select about a base point: select them, give the base point, then the angle — typed, or picked as a point whose direction from the base point is the angle. Its first line says which way is positive, counterclockwise by default (ANGDIR), and where 0 lies (ANGBASE). Enter at the angle repeats the last turn, 0 in a new drawing. The objects turn about an axis parallel to the UCS's Z through the base point, so in 3D they keep their height. The turn is one step that Undo takes back.

## Options

### Copy

Turns a copy and leaves the objects where they were, saying <Message id="rotatingCopy" />. The prompt then asks for the angle again.

### Reference

Turns from an angle you have to the one you want: asks for the reference angle (typed, or two points that measure it), then the new angle, and turns by the difference. To set a slanted edge level, pick its two ends as the reference and type 0.

### Points

At Reference's new angle: the new angle is that of a line between two points you pick, so the objects line up with an edge that is already drawn.

## Missing

While you give the angle, the turned set follows the cursor in each object's colour, but not its linetype or lineweight.

## Questions

### What is the shortcut for ROTATE in AutoCAD?

`RO`, then Enter or Space. The full name works too, and `_ROTATE` in any language of AutoCAD.

### How do I rotate an object to line up with another?

Choose <Keyword id="Reference" />, pick two points along the object's edge, then choose <Keyword id="Points" /> and pick two points along the line it should follow.

### How do I rotate an object and keep the original?

Choose <Keyword id="Copy" /> before giving the angle: the copy turns and the original stays.

### Why does ROTATE turn the wrong way?

A positive angle turns counterclockwise, as the first line's ANGDIR says. Type a negative angle, `-30`, to turn clockwise.
