---
title: "DIMCONTINUE in AutoCAD"
metaTitle: "DIMCONTINUE in AutoCAD: continued dimensions"
description: "How AutoCAD's DIMCONTINUE (DCO) chains dimensions end to end from the last one, prompt by prompt: next origins, Select and Undo. Try it free in your browser."
figure: "A stepped profile dimensioned 30, then continued 40 and 30 along the same line: two origins, then Enter twice."
related: ["DIMBASELINE", "DIMLINEAR", "DIMSPACE", "DIMALIGNED"]
coverage: "3dc9e0d59714"
---

DIMCONTINUE draws a chain of dimensions end to end: each one starts at the second extension line of the one before and measures to the next point you give, on the same dimension line. It continues the last linear or aligned dimension made since the drawing was opened, so it usually follows <Command id="DIMLINEAR" /> or <Command id="DIMALIGNED" />; with none, it asks which to continue. The command line says each measurement as it is made. Enter at the origin prompt chooses <Keyword id="Select" />, and Enter there ends the command, as Escape does.

As in AutoCAD, each new dimension measures along its base's direction, and takes the base's dimension style and layer, with the current colour, linetype and lineweight.

## Options

### Select

Asks for the dimension to continue from: pick a linear or aligned one, near the extension line to go on from. A point typed there picks too. A radius or a diameter dimension is refused with <Message id="associativeDimensionRequired" />, and the question asked again.

### Undo

Takes back the last dimension of the chain and goes on from the one before, as many times as there are. Once none is left, its answer is <Message id="commandCompletelyUndone" /> and the prompt stays.

## Missing

A dimension is not associative: a chain does not follow the objects it measures. An angular dimension cannot be continued: AutoCAD continues one made last or picked; here, made last, the command asks for a dimension, and picked it is refused as a radial one is. Ordinate dimensions do not exist yet.

## Questions

### What is the shortcut for DIMCONTINUE in AutoCAD?

`DCO`, then Enter or Space. The full name works too, and `_DIMCONTINUE` in any language of AutoCAD.

### What is the difference between DIMCONTINUE and DIMBASELINE?

DIMCONTINUE puts the dimensions end to end on one line, each from where the last one ended. <Command id="DIMBASELINE" /> measures them all from the same extension line, each on a line further out.

### How do I continue from a dimension that is not the last one?

Press Enter at the first prompt, or choose <Keyword id="Select" />, and pick the dimension near the extension line to go on from: the chain grows from there.

### Why does DIMCONTINUE ask me to select a dimension?

It has no dimension to continue: none linear or aligned was made since the drawing was opened, as in AutoCAD after opening one, or the last one made is angular. Pick the one to continue from.
