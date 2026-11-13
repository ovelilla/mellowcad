---
title: "LTSCALE in AutoCAD: linetype scale"
metaTitle: "AutoCAD linetype scale: LTSCALE and alias"
description: "How AutoCAD's LTSCALE (LTS) sets the linetype scale for the whole drawing, so a dashed line shows its dashes at any size. Try it free in your browser."
before: "A plate 4 metres long, its hole drawn with HIDDEN and its axes with CENTER, at the default linetype scale of 1: the dashes too fine to see."
figure: "The same plate after LTSCALE 20: the dashes of the hole and the axes drawn 20 times longer."
related: ["LINETYPE", "LAYER", "PROPERTIES", "LWEIGHT"]
coverage: "7097d8b7888d"
---

LTSCALE sets the global linetype scale factor: how long the dashes and gaps of every dashed linetype are in the drawing. It asks for the new factor, offering the current one, 1.0000 in a new drawing: 2 makes every dash twice as long, 0.5 half as long. The factor must be more than 0, otherwise it says <Message id="positiveNonzero" /> and asks again, and `1/2` and `1e3` are read as numbers. A change redraws the whole drawing, `Regenerating model.` as AutoCAD 2027 says it, and is saved with the drawing; it is a step that <Command id="U" /> takes back. Typed with an apostrophe inside a command, `'LTSCALE`, the drawing is redrawn when that command ends.

Linetypes are patterns made for a drawing of the paper's size: in a drawing 4 metres across, in millimetres, CENTER's pattern, about 51 units long, repeats some 80 times across it, too fine to see, and a line shorter than one pattern is drawn solid. The scale to use is usually the drawing's own: 20 for a drawing to be read at 1:20, 50 at 1:50.

## Missing

The Linetype Manager, whose Global scale factor is LTSCALE and Current object scale CELTSCALE. PSLTSCALE and MSLTSCALE, as there is no paper space. The shapes of complex linetypes such as BATTING, drawn as their gaps.

## Questions

### What is the shortcut for LTSCALE in AutoCAD?

`LTS`, then Enter or Space. The full name works too, and `_LTSCALE` in any language of AutoCAD.

### Why does my dashed line show as a solid line?

Its pattern does not fit the drawing at the current scale. A line shorter than one repeat of its pattern is drawn solid; a long one at a small scale packs its dashes so close that it looks solid. Raise LTSCALE for a large drawing, lower it for a small one, until the dashes show.

### What LTSCALE should I use?

The drawing's scale: in a drawing of millimetres to be read at 1:50, `50`. For a drawing of the paper's size, 1.

### What is the difference between LTSCALE and the linetype itself?

The linetype, set with <Command id="LINETYPE" /> or the layer, is the pattern: dashes, dots and gaps. LTSCALE is how long that pattern is drawn, the same factor for every object in the drawing.
