---
title: "UNITS in AutoCAD"
metaTitle: "UNITS in AutoCAD: Drawing Units and precision"
description: "How AutoCAD's UNITS (UN) works: the Drawing Units dialog, a precision of 0 to 8 places, the insertion scale in millimetres, centimetres or metres. Try it free."
figure: "UNITS opened over a 100 by 60 plate, then ID on its far corner: the coordinates at the drawing's precision, two places."
related: ["DIST", "AREA", "DIMSTYLE", "LTSCALE"]
coverage: "f776933e5835"
---

UNITS opens the Drawing Units dialog, which sets how the drawing writes lengths and what one drawing unit stands for. As in AutoCAD the dialog is modal: the command lasts until OK or Cancel closes it, OK's change is one step that <Command id="U" /> takes back, and Cancel or Escape changes nothing. Typed with an apostrophe, `'UNITS`, it opens inside a running command, which goes on once the dialog closes. The status bar's units and the application menu's Drawing Units open it too.

Length's Type is Decimal, and its Precision, from 0 to 8 decimal places, is what every length is written with: coordinates, distances, areas, the defaults offered in the prompts. A new drawing starts at two places here, where AutoCAD's metric template starts at four. Insertion Scale says what a drawing unit is, millimetres, centimetres or metres; the status bar and the dynamic input show it. Sample Output shows a point at the precision chosen.

## Missing

The other length types, Architectural, Engineering, Fractional and Scientific, and scientific notation for a huge length. The Angle group: angles are decimal degrees, counterclockwise from the east, at the precision AUPREC sets, typed. The other insertion units, inches and feet among them; Lighting; Direction; and -UNITS, the command-line form.

## Questions

### What is the shortcut for UNITS in AutoCAD?

`UN`, then Enter or Space; `DDUNITS` too. The full name works as well, and `_UNITS` in any language of AutoCAD.

### How do I set the drawing units to millimetres or metres?

Open UNITS and choose Millimeters, Centimeters or Meters under Insertion Scale. A drawing unit is still one unit: draw a 5 m wall as 5 in metres or 5000 in millimetres. The choice says which, and the status bar and the dynamic input show it.

### How do I change the number of decimal places?

Choose the Precision in UNITS, from `0` to `0.00000000`. It changes how lengths are written, never the geometry: a line drawn 10.125 long stays 10.125 long at any precision.

### Why don't my dimensions follow the precision set in UNITS?

A dimension writes its value with its dimension style's own precision, not the drawing's. Change it in <Command id="DIMSTYLE" />, under Primary Units.

### Can I draw in feet and inches?

Not yet: lengths are decimal, and the insertion scale offers millimetres, centimetres and metres. Architectural and engineering units are missing.
