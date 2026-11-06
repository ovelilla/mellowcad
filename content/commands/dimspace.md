---
title: "DIMSPACE in AutoCAD"
metaTitle: "DIMSPACE in AutoCAD: align and space dimensions"
description: "How AutoCAD's DIMSPACE evens out the gap between dimensions or lines them up at 0, with Auto's spacing from the text height. Try it free in your browser."
before: "A plate's top edge dimensioned in a chain of three, each dimension placed at a height of its own, as they were drawn."
figure: "DIMSPACE from the first dimension, the other two selected and the spacing 0: the chain lined up on one line."
related: ["DIMLINEAR", "DIMCONTINUE", "DIMBASELINE", "DIMSTYLE"]
coverage: "9cdf0638e687"
---

DIMSPACE adjusts the space between parallel linear and aligned dimensions. You select the base dimension, which stays where it is, then the dimensions to space; Enter ends the selection and asks for the spacing. Each dimension's line is then moved, away from the base in the order they lie, at that distance from the one before it. A spacing of 0 lines them all up on the base's line: a chain staggered as it was drawn reads as one. Its only change is where the dimension lines lie, in one step that <Command id="U" /> takes back.

The base is picked, or typed as a point, or taken with `Last`; one that is no dimension says <Message id="selectedObjectNotDimension" /> and asks again. A set selected before the command is the set to space. A dimension at an angle to the base is counted and left where it is, and a negative spacing is refused with <Message id="negativeSpacing" />.

## Options

### Auto

The default, Enter: a spacing of twice the text height of the base's dimension style, scaled by its overall scale, so the stack fits its own text.

## Missing

Angular dimensions, which DIMSPACE does not space yet. AutoCAD moves a dimension only where it needs to; here every dimension selected is respaced.

## Questions

### How do I align dimensions in AutoCAD?

Run DIMSPACE, pick the dimension the others should line up with, select them, press Enter and type `0`: every dimension line moves onto the base's.

### How do I make the spacing between dimensions equal?

Run DIMSPACE, pick the dimension nearest the object as the base, select the rest and press Enter twice: <Keyword id="Auto" /> spaces them by twice the text height. Or type the distance you want, such as `8`.

### What is the default dimension spacing in AutoCAD?

DIMSPACE's <Keyword id="Auto" /> is twice the text height of the dimension style. <Command id="DIMBASELINE" /> uses the style's baseline spacing instead, 3.75 in ISO-25, for each dimension it adds.

### Why does DIMSPACE not move a dimension?

It only spaces dimensions parallel to the base: one at another angle is counted and left where it is. Angular dimensions are not spaced yet.
