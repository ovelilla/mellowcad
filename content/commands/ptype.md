---
title: "PTYPE in AutoCAD"
metaTitle: "PTYPE in AutoCAD: point style, DDPTYPE, PDMODE"
description: "How AutoCAD's PTYPE (DDPTYPE) works: the Point Style dialog, its twenty figures, the point size, PDMODE and PDSIZE, and why points look invisible. Try it free."
figure: "PTYPE opens the Point Style dialog; its OK writes PDMODE and PDSIZE, typed here as 35 and 8, then three points drawn inside a plate."
related: ["POINT", "DIVIDE", "MEASURE", "-OSNAP"]
coverage: "27eb08083a91"
---

PTYPE opens the Point Style dialog, which sets how every point object of the drawing is drawn: the ones <Command id="POINT" /> draws, and the ones <Command id="DIVIDE" /> and <Command id="MEASURE" /> leave. `DDPTYPE` is its alias, as in AutoCAD. The style belongs to the drawing, not to a point: change it and all of them change at once, and it is saved with the drawing. The button sits beside ID Point among the Utilities tools; typed with an apostrophe, `'PTYPE`, it opens inside a running command.

The dialog shows twenty figures in four rows of five, the current one chosen: a dot, nothing, a plus, a cross and a short tick, then each of them inside a circle, inside a square, and inside both. Under them, Point Size, and how it is read: Set Size Relative to Screen, a percentage of the view's height, or Set Size in Absolute Units, drawing units. The default is 5 % relative to the screen. OK writes the choice as one step that <Command id="U" /> takes back; Cancel or Escape changes nothing. A size that is not a number, or below 0, is refused (Invalid input.) and the dialog stays open.

What the dialog writes are two variables, which can also be typed at the command line: PDMODE, the figure (0 to 4, plus 32 for the circle, 64 for the square, 96 for both: 35 is a cross in a circle), and PDSIZE, the size (a positive number is drawing units, a negative one a percentage of the screen, 0 is 5 %).

## Missing

The dialog's Help button. A point sized relative to the screen keeps that size on the screen as you zoom, where AutoCAD keeps it only until the drawing is next regenerated.

## Questions

### What is DDPTYPE in AutoCAD?

The alias of PTYPE: both open the Point Style dialog, in every language of AutoCAD.

### Why are my points not visible?

The default point style is a dot one pixel wide, which a line drawn through it hides, and PDMODE 1 draws nothing at all. Open PTYPE and choose a cross or a circled figure, or type PDMODE and `3`. With a size relative to the screen they stay visible at any zoom.

### How do I change the size of points?

In PTYPE, type the Point Size: a percentage of the screen with Set Size Relative to Screen, so a point keeps its size as you zoom, or drawing units with Set Size in Absolute Units, so it grows and shrinks with the drawing. Or type PDSIZE: a negative value is the percentage.

### Can I give one point its own style?

No: in AutoCAD and here, the point style is the drawing's, and every point object follows it. To mark places differently, insert a block at them; <Command id="DIVIDE" /> and <Command id="MEASURE" /> can place a block instead of points.
