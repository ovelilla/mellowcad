---
title: "LINETYPE in AutoCAD"
metaTitle: "LINETYPE in AutoCAD: command, Set and alias"
description: "How AutoCAD's LINETYPE (LT) works: the current linetype for new objects, the linetypes loaded, ByLayer, and why a dashed line can show solid. Try it free."
figure: "A plate whose hole is drawn with HIDDEN current and its two axes with CENTER, then LINETYPE set back to ByLayer."
related: ["LTSCALE", "LAYER", "LWEIGHT", "PROPERTIES"]
coverage: "4c2e2169854b"
---

LINETYPE sets the linetype new objects are drawn with. AutoCAD opens the Linetype Manager; MellowCAD has none yet, so LINETYPE runs the command-line form AutoCAD has too, <Command id="-LINETYPE" />. It says the current linetype, `ByLayer` at first, and asks for an option again after each answer, until Enter ends it. ByLayer means each object takes its layer's linetype; a linetype named instead is the object's own. The whole run is one step that <Command id="U" /> takes back, and typed with an apostrophe inside a command, its linetype applies to what that command draws next.

Every drawing has six linetypes loaded: Continuous and, from AutoCAD's metric file acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM and DASHDOT. A pattern is laid on each line as AutoCAD lays it, centred along its length with equal dashes at both ends.

## Options

### ?

Lists linetypes in two columns, name and description. At the option prompt, the linetypes of acadiso.lin; at Set's prompt, those loaded in the drawing whose names match what you type, all of them with `*`.

### Set

Asks the linetype's name, offering the current one; type a loaded linetype's name, or <Keyword id="BYLayer" />. A name that is not loaded is not found, as AutoCAD says it, and the option prompt comes back; Enter keeps the current one.

## Missing

The Linetype Manager, and loading, creating or describing linetypes: only the six above exist, and the listing describes only Continuous. A linetype scale for each object (CELTSCALE): only the drawing's, <Command id="LTSCALE" />. ByBlock. PSLTSCALE and MSLTSCALE, as there is no paper space. Spanish AutoCAD's linetype names: they are English here in every language. PLINEGEN: a new polyline starts its pattern again at each vertex, unless PEDIT's Ltype gen turns it on.

## Questions

### What is the shortcut for LINETYPE in AutoCAD?

`LT`, then Enter or Space; `LTYPE` and `DDLTYPE` too. The full name works as well, and `_LINETYPE` in any language of AutoCAD.

### Why does my dashed line show as a solid line?

A line shorter than one repeat of its pattern is drawn solid, as in AutoCAD: CENTER's pattern is about 51 units long at the default scale. Raise or lower <Command id="LTSCALE" /> to fit the pattern to the drawing. Check, too, that the object's linetype, or its layer's when it is ByLayer, is not Continuous.

### How do I change the linetype of an existing object?

Select it and choose the linetype in the Linetype row of the Properties palette, or copy it from another object with <Command id="MATCHPROP" />. LINETYPE only sets the linetype of objects drawn after it.

### How do I change the linetype scale in AutoCAD?

Type <Command id="LTSCALE" /> and the new factor: 2 makes every dash twice as long, in the whole drawing.
