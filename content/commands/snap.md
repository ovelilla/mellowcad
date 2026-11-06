---
title: "SNAP in AutoCAD"
metaTitle: "SNAP in AutoCAD: snap mode, spacing and F9"
description: "How AutoCAD's SNAP (SN, F9) works: the cursor held to a lattice at the spacing you set, Aspect for X and Y apart, and polar snap. Try it free online."
figure: "SNAP 10 with the grid on, then LINE picked off the lattice: every point lands on it, and so does the cursor."
related: ["UCS", "LINE", "FROM"]
coverage: "f8b314c87047"
---

Snap mode holds the cursor to a lattice: each pick lands on the nearest of its points, so with a spacing of 10 a click at 13,7 is 10,10. The lattice is the current UCS's, from its origin along its axes. F9 turns snap mode on and off, writing `<Snap on>` or `<Snap off>`, and so does its button on the status bar. Only picks are rounded: a typed coordinate is taken as typed, and an object snap wins over the lattice. The grid (F7) draws a lattice of its own, and shows it whether snap is on or off.

The SNAP command sets the spacing: type it, or give two points that far apart, and snap mode turns on with it in X and Y. Enter turns it on as it is. A spacing of 0 or below is refused with <Message id="positiveNonzero" />. Typed with an apostrophe, `'SNAP`, it works inside another command. Snap mode and its spacing are saved with the drawing, and U takes a SNAP back.

The status bar's Snap menu chooses Polar Snap instead: along a polar tracking path the cursor steps by POLARDIST or, while POLARDIST is 0, by the snap's X spacing.

## Options

### ON

Turns snap mode on with the current spacing, as Enter does.

### OFF

Turns snap mode off; the spacing is kept.

### Aspect

Asks for a horizontal spacing, then a vertical one, and turns snap mode on: a lattice taller or wider than it is square. The prompt's default is then Aspect, so Enter asks them again.

## Missing

Style, isometric snap, and Type, grid or polar, at the prompt: the status bar's menu chooses the type. Legacy, the hidden Rotate (SNAPANG) and SNAPBASE. A negative POLARDIST, which AutoCAD's polar snap takes as its size: −10 steps 10.

## Questions

### What is the shortcut for SNAP in AutoCAD?

F9 turns snap mode on and off. The command is `SN`, then Enter or Space, to set the spacing; the full name works too, and `_SNAP` in any language of AutoCAD.

### What is the difference between SNAP and OSNAP?

Snap mode rounds the cursor to a lattice of points in space. Object snaps (F3) lock it to points on objects, endpoints, midpoints, centres. They work together, and an object snap wins where both find a point.

### Why does my cursor jump in steps?

Snap mode is on: press F9, or the status bar's snap button, to turn it off. Set a smaller spacing with SNAP if you want the steps finer.

### How do I set different X and Y snap spacing?

Run SNAP, choose <Keyword id="Aspect" />, and give the horizontal spacing, then the vertical one.

### Is there an isometric snap?

Not yet: SNAP's Style option, which turns the lattice for isometric drawing, is not offered.
