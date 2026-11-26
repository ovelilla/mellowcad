---
title: "DIMSTYLE in AutoCAD"
metaTitle: "DIMSTYLE in AutoCAD: dimension style command"
description: "How AutoCAD's DIMSTYLE (D) works: dimension styles from ISO-25, New, Set Current, and the settings for text height, arrows, scale and units. Try it free online."
figure: "Dimensions drawn in ISO-25, the current style: arrows, the text above the line and a comma as the decimal separator."
related: ["DIMLINEAR", "DIMALIGNED", "DIMSPACE", "STYLE"]
coverage: "9d45cbfb5c86"
---

DIMSTYLE manages the drawing's dimension styles: named sets of settings, arrow size, text height, overall scale, units and the rest, which every dimension takes from its style. A new drawing starts with ISO-25, current, the metric style AutoCAD starts with. DIMSTYLE opens the Dimension Style Manager, as in AutoCAD; typed with an apostrophe inside a command, `'DIMSTYLE`, it opens without ending that command.

The manager names the current style and lists the styles, all of them or only those in use. Set Current makes the selected style current. New... asks for a name, `Copy of` the style it starts with, then opens the new style's settings; it is current once the manager closes. Modify... opens the selected style's settings on the manager's tabs: Lines (baseline spacing, extension beyond the dimension line, offset from origin), Symbols and Arrows (arrow size, centre marks), Text (text height, offset from the dimension line), Fit (the overall scale, and whether a dimension line is drawn between the extension lines) and Primary Units (precision, decimal separator, trailing zeros, angular precision). OK applies them, and every dimension in that style is redrawn at once. A right-click on a style renames or deletes it; a name already in use is refused, and ISO-25, the current style and a style in use cannot be deleted. Everything done in the manager is one step U takes back.

## Missing

The manager's preview, Description, Override and Compare, no sub-styles for one kind of dimension, no Alternate Units or Tolerances, and only the settings listed above. A dimension variable typed at the command line, such as DIMSCALE, does not make an override of the current style. A new drawing has ISO-25 alone, without the Standard and Annotative styles that a new metric drawing in AutoCAD also holds.

## Questions

### What is the shortcut for DIMSTYLE in AutoCAD?

`D`, then Enter or Space; `DST`, `DIMSTY` and `DDIM` too, and `_DIMSTYLE` in any language of AutoCAD. <Command id="-DIMSTYLE" /> works at the command line instead: it saves the current settings as a new style, or makes a style current by name.

### How do I change the dimension text size in AutoCAD?

Select the style in the manager, press Modify... and change Text height, on Text, or Use overall scale of, on Fit, which multiplies every size of the style, arrows and offsets with the text. Every dimension in that style is redrawn at once. To change some dimensions alone, give them a style of their own.

### How do I apply a dimension style to existing dimensions?

Select the dimensions and choose the style in the Properties palette's Dim style row, or right-click them and pick it under Dimension Style: one undo step either way. New dimensions take the current style, which Set Current in the manager changes. The Dimension Style list on the ribbon (Annotate › Dimensions, and Home › Annotation's slide-out) does the same: with dimensions selected it restyles them, with nothing selected it makes the style current.

### How do I change the decimal separator of dimensions?

ISO-25 writes a comma, as `82,5`. On Primary Units, set Decimal separator to a period or a space; Precision and Suppress trailing zeros are there too. The command line still reports the measurement with a point, as AutoCAD's does.

### How do I create a new dimension style?

Press New..., name it and pick the style it starts with, then Continue: its settings open, and OK makes it. It is current once the manager closes, and every dimension drawn from then on takes it.
