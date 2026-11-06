---
title: "LWEIGHT in AutoCAD"
metaTitle: "LWEIGHT in AutoCAD: lineweight command and alias"
description: "How AutoCAD's LWEIGHT (LW) works: the lineweight for new objects in millimetres, the 24 standard values, ByLayer, and lineweights on screen. Try it free."
figure: "A plate outlined at 0.70 mm, then 0.1 typed for its hole, rounded to 0.09 mm: the two weights as the screen shows them."
related: ["LINETYPE", "LAYER", "PROPERTIES", "PLINE"]
coverage: "fa00dc2007c1"
---

LWEIGHT sets the lineweight new objects are drawn with, in millimetres. AutoCAD opens the Lineweight Settings dialog; MellowCAD has none yet, so LWEIGHT runs the command-line form AutoCAD has too, <Command id="-LWEIGHT" />. It says the current lineweight, `BYLAYER` at first, and asks for a new one: one of AutoCAD's 24 standard values, from 0.00 to 2.11 mm. Any other value is set to the nearest standard one, saying so, and a negative one is refused with <Message id="invalidLineweightNumber" />. Enter keeps the current lineweight. Each change is a step that <Command id="U" /> takes back.

Lineweights show on screen here from the start: AutoCAD shows them only once the status bar's Lineweight button (LWDISPLAY) is on, but with no layouts or plotting in MellowCAD, the screen is the only place they could show. The button turns them off and on. A wide polyline shows its width in plan, not its lineweight.

## Options

### ?

Lists the values it takes, ByLayer and the 24 standard lineweights, then asks again.

### BYLAYER

New objects take their layer's lineweight, as they do at first.

## Missing

ByBlock and Default (LWDEFAULT), lineweights in inches, the Lineweight Settings dialog and the drop-down's Lineweight Settings… entry.

## Questions

### What is the shortcut for LWEIGHT in AutoCAD?

`LW`, then Enter or Space; `LINEWEIGHT` is an alias too. The full name works as well, and `_LWEIGHT` in any language of AutoCAD.

### Why is the lineweight not showing in AutoCAD?

In AutoCAD, lineweights show on screen only with the status bar's Lineweight button on (LWDISPLAY 1); it starts off. Here it starts on. The thin lineweights all draw as the screen's thinnest line, so the difference shows on the thicker ones; and an object whose lineweight is ByLayer takes its layer's.

### How do I change the lineweight of an existing object?

Select it and choose the lineweight in the Lineweight row of the Properties palette, or in the layer's own lineweight in the Layer Properties Manager when the object is ByLayer. LWEIGHT only sets the lineweight of objects drawn after it.

### What lineweights does AutoCAD have?

24 fixed values in millimetres: 0.00, 0.05, 0.09, 0.13, 0.15, 0.18, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50, 0.53, 0.60, 0.70, 0.80, 0.90, 1.00, 1.06, 1.20, 1.40, 1.58, 2.00 and 2.11. Type another, 0.45 say, and LWEIGHT takes the nearest, the thinner on a tie.
