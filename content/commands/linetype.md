---
title: "LINETYPE in AutoCAD"
metaTitle: "LINETYPE in AutoCAD: command, Set and alias"
description: "How AutoCAD's LINETYPE (LT) works: loading linetypes from acadiso.lin, the current one for new objects, ByLayer, and why a dashed line can show solid."
figure: "A plate whose hole is drawn with HIDDEN current and its two axes with CENTER, then LINETYPE set back to ByLayer."
related: ["LTSCALE", "LAYER", "LWEIGHT", "PROPERTIES"]
coverage: "7097d8b7888d"
---

LINETYPE sets the linetype new objects are drawn with. AutoCAD opens the Linetype Manager; MellowCAD has none yet, so LINETYPE runs the command-line form AutoCAD has too, <Command id="-LINETYPE" />. It says the current linetype, `ByLayer` at first, and asks for an option again after each answer, until Enter ends it. ByLayer means each object takes its layer's linetype; a linetype named instead is the object's own. The whole run is one step that <Command id="U" /> takes back, and typed with an apostrophe inside a command, its linetype applies to what that command draws next.

A drawing holds its own linetypes, saved with it and in its DXF. A new one has six: Continuous and, from AutoCAD's metric file acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM and DASHDOT; the others load from acadiso.lin, and a DXF brings its own, ISO and complex ones too, whose text, such as GAS_LINE's `GAS`, is drawn along the line. A pattern is laid on each line as AutoCAD lays it, centred along its length with equal dashes at both ends, scaled by <Command id="LTSCALE" /> and by the object's own linetype scale, which <Command id="CHPROP" /> and the Properties palette set and CELTSCALE gives new objects.

## Options

### ?

Lists linetypes in two columns, name and description. At the option prompt it asks which file to list, acadiso.lin by default or acad.lin, AutoCAD's file in inches, and lists its linetypes in the file's order; at Set's prompt, those loaded in the drawing whose names match what you type, all of them with `*`, sorted by name.

### Load

Asks which linetypes to load, a name or several separated by commas, wildcards too (`DASH*`), then which file to search, acadiso.lin at first and then the one you searched last. Each one found is loaded and said, in the file's order; one already loaded is asked about first, and <Keyword id="Yes" />, the default, loads it again. A name the file does not have, or a file other than acadiso.lin and acad.lin, is said.

### Set

Asks the linetype's name, offering the current one; type a loaded linetype's name, or <Keyword id="BYLayer" />. One acadiso.lin has is loaded first, as AutoCAD does; any other is not found, as AutoCAD says it, and the option prompt comes back. Enter keeps the current one.

## Missing

The Linetype Manager, and creating linetypes or loading them from a file of your own. The shapes of complex linetypes such as BATTING or ZIGZAG, drawn as the gaps they stand in. ByBlock. PSLTSCALE and MSLTSCALE, as there is no paper space. The acadiso.lin of each language's AutoCAD, whose names Spanish or German AutoCAD loads (TRAZOS, STRICHLINIE): Load reads the English one in every language, though a drawing made with them opens with its own. PLINEGEN: a new polyline starts its pattern again at each vertex, unless PEDIT's Ltype gen turns it on.

## Questions

### What is the shortcut for LINETYPE in AutoCAD?

`LT`, then Enter or Space; `LTYPE` and `DDLTYPE` too. The full name works as well, and `_LINETYPE` in any language of AutoCAD.

### Why does my dashed line show as a solid line?

A line shorter than one repeat of its pattern is drawn solid, as in AutoCAD: CENTER's pattern is about 51 units long at the default scale. Raise or lower <Command id="LTSCALE" /> to fit the pattern to the drawing. Check, too, that the object's linetype, or its layer's when it is ByLayer, is not Continuous.

### How do I change the linetype of an existing object?

Select it and choose the linetype in the Linetype row of the Properties palette, or copy it from another object with <Command id="MATCHPROP" />. LINETYPE only sets the linetype of objects drawn after it.

### How do I change the linetype scale in AutoCAD?

Type <Command id="LTSCALE" /> and the new factor: 2 makes every dash twice as long, in the whole drawing.

### How do I load a linetype in AutoCAD?

AutoCAD loads one in the Linetype Manager. Here, type `-LINETYPE`, choose <Keyword id="Load" />, type the linetype's name, such as `HIDDEN2` or `ACAD_ISO02W100`, and press Enter to search acadiso.lin. <Keyword id="Set" /> loads one acadiso.lin has as it makes it current.
