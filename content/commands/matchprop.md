---
title: "MATCHPROP in AutoCAD"
metaTitle: "MATCHPROP in AutoCAD: Match Properties and alias"
description: "How AutoCAD's MATCHPROP (MA) works: pick a source object, then the objects that take its layer, colour, linetype, lineweight and styles. Try it free online."
figure: "A plate and its hole, a vertical axis red and Center on its layer, and a horizontal line on layer 0 that MATCHPROP turns into the same axis."
related: ["PROPERTIES", "LAYER", "LINETYPE", "LWEIGHT"]
coverage: "2914168c7f23"
---

MATCHPROP copies the properties of one object onto others, AutoCAD's Match Properties brush. Pick the source object, or select one before the command; it takes one on a locked layer too. It then says which properties it copies, `Current active settings:` and the list, and asks for the destination objects: each pick or window paints them at once, until Enter ends it. A destination on a locked layer is left as it is, with <Message id="matchpropLockedDestination" />. The cursor carries AutoCAD's paintbrush, and the whole run is one step that <Command id="U" /> takes back. Typed with an apostrophe, `'MATCHPROP`, it runs inside another command.

What it copies are the Property Settings' defaults: the layer, the colour and the lineweight; the linetype, except to hatches, multiline text and attribute definitions; the thickness; between texts the style, height and rotation, and from one single-line text to another the justification too; between dimensions the dimension style; between hatches the pattern, scale and angle, but not the origin.

## Missing

The Settings option and its Property Settings dialog: every property it knows is always copied, and the first prompt does not list `[Settings]`. Linetype scale, transparency and plot style, which objects do not have here; a polyline's widths, a text's width factor and obliquing angle, and the annotative properties. AutoCAD's preview of the change under the cursor.

## Questions

### What is the shortcut for MATCHPROP in AutoCAD?

`MA`, then Enter or Space; `PAINTER` is an alias too. The full name works as well, and `_MATCHPROP` in any language of AutoCAD.

### How do I copy the properties of one line to another?

Run MATCHPROP, pick the line whose properties you want, then pick the lines that should take them and press Enter. They go on its layer, with its colour, linetype and lineweight.

### Why is Match Properties not working?

A destination on a locked layer is not changed: unlock the layer first. A property is copied only between objects that have it: a dimension style goes only to dimensions, a text style only to texts, a pattern only to hatches. And a linetype is not copied to a hatch or to multiline text, as in AutoCAD.

### How do I match the properties of a dimension or a hatch?

Pick a dimension as the source and other dimensions as destinations: they take its dimension style, with its layer and colour. A hatch passes its pattern, scale and angle to other hatches, and each keeps its own origin.
