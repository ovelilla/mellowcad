---
title: "HATCH in AutoCAD"
metaTitle: "HATCH in AutoCAD: patterns, options and alias"
description: "How AutoCAD's HATCH (H) fills an area, prompt by prompt: a point inside or its objects, the pattern, its scale and angle, islands. Try it free in your browser."
figure: "A rectangle with a circle in it, hatched with ANSI31 from one point inside: the circle is left clear, an island."
related: ["AREA", "REGION", "MATCHPROP", "EXPLODE"]
coverage: "fd014551a8a0"
---

HATCH fills a closed area with a pattern of lines, or solid. Pick a point inside the area and it finds the boundary in the objects around it, leaving clear what lies inside as an island — a circle in a rectangle, a text; or select the objects that bound it. Pick as many areas as you like: Enter, or Escape, makes one hatch of them all, on the current layer, behind its boundary. The whole command is one step that Undo takes back.

AutoCAD's HATCH sets its pattern in the Hatch Creation tab or a dialog, which MellowCAD does not have: here it asks at the command line what <Command id="-HATCH" /> asks, the pattern under <Keyword id="Properties" />. The two differ only in Escape, which under <Command id="-HATCH" /> drops the areas. Each hatch starts with the pattern, scale and angle the last one was given: ANGLE, at scale 1 and angle 0, in a new drawing.

## Options

### Properties

Asks for the pattern's name, in any case, offering the current one: <Keyword id="Solid" /> fills the area, and <Keyword id="?" /> lists the patterns with their descriptions, then goes back to the point. For a pattern it then asks the scale — a number above 0, or two points measured — and the angle, typed or by two points. The next hatch keeps all three.

<Session name="hatchPatterns" caption="SOLID and eleven patterns of acadiso.pat, each hatched in a square 30 across at scale 1, AR-CONC and AR-SAND at 0.08 and 0.1." />

### Select objects

Instead of a point inside, select the objects that bound the area; Enter goes back to the point. An object that closes no area is left out; when none of them bounds one, Enter says <Message id="unableToHatchBoundary" /> and makes nothing. A region gives its outline, its holes as islands.

### Undo

Not listed at the prompt, but taken there: it takes back the areas of the last point picked and asks again, leaving the objects selected. It says <Message id="noBoundaryToUndo" /> when no point is left to take back.

## Missing

Ellipses and splines as boundaries: an area they close is not found, and a region with such an edge is left out. Gap tolerance (HPGAPTOL): an area must be closed exactly. Associative hatches, the Normal and Ignore island styles, gradients, user-defined patterns and the rest of acadiso.pat's patterns. -HATCH's other options: drawing a boundary, removing boundaries, Advanced, draw order, origin, annotative, colour, layer and transparency. HATCHEDIT and the Hatch Editor, which a double-click opens in AutoCAD. MIRRHATCH 1: a mirrored hatch always keeps its pattern's angle. The menus of a hatch's grips.

## Questions

### What is the shortcut for HATCH in AutoCAD?

`H`, then Enter or Space; `BH` too. With no Hatch Creation tab, it asks at the command line, as `-H` (<Command id="-HATCH" />) does. `_HATCH` works in any language of AutoCAD.

### Why is HATCH not working?

Mostly because the area is not closed: it says <Message id="hatchNoBoundary" />, and the smallest gap is enough, as nothing bridges one. Close the outline and pick again. An area closed by an ellipse or a spline is not found yet, and objects on a layer that is off are not seen.

### Which hatch patterns are there, and can I download more?

A selection of acadiso.pat, AutoCAD's metric pattern file: SOLID, ANGLE, ANSI31 to ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL and ZIGZAG. <Keyword id="?" /> under <Keyword id="Properties" /> lists them. A pattern file of your own or downloaded cannot be loaded yet.

### How do I change the scale of a hatch?

Before you pick, under <Keyword id="Properties" />: the scale comes after the pattern's name. Once made, select the hatch and retype Scale in the Properties palette, or give it another hatch's pattern, scale and angle with <Command id="MATCHPROP" />. A scale so small that the pattern would need too many lines says <Message id="hatchTooDense" /> and makes no hatch.

### How do I find the area of a hatch?

Select it and read Area under Geometry in the Properties palette, its islands left out; with several selected, Cumulative Area adds them. Or run <Command id="AREA" />, choose <Keyword command="AREA" id="Object" /> and pick the hatch.
