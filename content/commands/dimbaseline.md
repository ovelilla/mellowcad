---
title: "DIMBASELINE in AutoCAD"
metaTitle: "DIMBASELINE in AutoCAD: baseline dimensions"
description: "How AutoCAD's DIMBASELINE (DBA) stacks dimensions from one base line, prompt by prompt: next origins, spacing, Select and Undo. Try it free in your browser."
figure: "A stepped profile dimensioned 30 from its left edge, then 70 and 100 from the same edge, each a line further out."
related: ["DIMCONTINUE", "DIMLINEAR", "DIMSPACE", "DIMSTYLE"]
coverage: "1473df4fa533"
---

DIMBASELINE draws dimensions that all measure from one extension line, the base: each goes from the first extension line of the last dimension to the next point you give, its dimension line one step further out. It starts from the last linear or aligned dimension made since the drawing was opened, so it usually follows <Command id="DIMLINEAR" /> or <Command id="DIMALIGNED" />; with none, it asks which to start from. The command line says each measurement as it is made. Enter at the origin prompt chooses <Keyword id="Select" />, and Enter there ends the command, as Escape does.

The step is the current dimension style's baseline spacing, 3.75 in ISO-25, times the base's overall scale. As in AutoCAD, each new dimension measures along its base's direction, and takes the base's dimension style and layer, with the current colour, linetype and lineweight.

## Options

### Select

Asks for the base dimension: pick a linear or aligned one, near the extension line to measure from. A point typed there picks too. A radius or a diameter dimension is refused with <Message id="associativeDimensionRequired" />, and the question asked again.

### Undo

Takes back the last dimension made and goes on from the one before, as many times as there are. Once none is left, its answer is <Message id="commandCompletelyUndone" /> and the prompt stays.

## Missing

A dimension is not associative: the dimensions do not follow the objects they measure. An angular dimension cannot be a base: AutoCAD takes one made last or picked; here, made last, the command asks for a dimension, and picked it is refused as a radial one is. Ordinate dimensions do not exist yet.

## Questions

### What is the shortcut for DIMBASELINE in AutoCAD?

`DBA`, then Enter or Space. The full name works too, and `_DIMBASELINE` in any language of AutoCAD.

### How do I change the spacing of baseline dimensions?

It is the dimension style's baseline spacing: <Command id="DIMSTYLE" /> (`D`) opens the styles in the Styles palette, where it is under Lines, as in AutoCAD. Dimensions already drawn keep their places; <Command id="DIMSPACE" /> spaces them again, evenly.

### How do I start from another dimension?

Press Enter at the first prompt, or choose <Keyword id="Select" />, and pick the dimension near the extension line to measure from: every new dimension starts there.

### What is the difference between DIMBASELINE and DIMCONTINUE?

DIMBASELINE measures every dimension from the same extension line, each on a line further out. <Command id="DIMCONTINUE" /> puts them end to end on one line, each from where the last one ended.
