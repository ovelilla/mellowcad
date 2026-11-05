---
title: "Dimensioning in AutoCAD: DIMLINEAR"
metaTitle: "AutoCAD dimension command: DIMLINEAR and alias"
description: "How AutoCAD's DIMLINEAR (DLI) dimensions, prompt by prompt: two origins or an object, then the line, set horizontal or vertical. Try it free in your browser."
figure: "A rectangle dimensioned twice: its top edge by its two corners, its right edge by Enter and a pick on it."
related: ["DIMALIGNED", "DIMCONTINUE", "DIMBASELINE", "DIMRADIUS", "DIMSTYLE"]
coverage: "38f34fff1562"
---

DIMLINEAR measures the distance between two points along X or along Y and draws it as a dimension: two extension lines, a dimension line with its arrowheads, and the measurement above it. You give the first and the second extension line origins, then the dimension line's location, and where you place it chooses the direction, as in AutoCAD: above or below the two points it measures horizontally, beside them vertically. Press Enter at the first prompt instead and pick a line, an arc, a polyline segment or a circle: its two ends, or the circle's diameter, are the origins. The command line then says the measurement, and the command ends.

The dimension is drawn in the current dimension style, ISO-25 in a new drawing: a comma for decimals and no trailing zeros, as AutoCAD's metric drawings write it. <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> and <Command id="DIMROTATED" />, typed only, are DIMLINEAR held to one direction.

## Options

### Text

Asks for the text to write instead of the measurement, which it offers as the default: Enter keeps the measurement. In what you type, `<>` stands for the measurement, so `<> mm` writes it followed by its unit.

### Angle

Asks for the angle of the text, which is then drawn at that angle instead of along the dimension line. 0 puts it back along the line.

### Horizontal

Measures along X wherever you place the dimension line, which stays horizontal; the prompt then offers only <Keyword id="Text" /> and <Keyword id="Angle" />.

### Vertical

Measures along Y wherever you place the dimension line, which stays vertical.

### Rotated

Asks for the angle of the dimension line, `0` by default, and measures the distance between the origins along it. On a slanted edge, its own angle gives its length, as <Command id="DIMALIGNED" /> does.

## Missing

Mtext: a dimension's text is one line, set with <Keyword id="Text" /> at the command line, never in the text editor. With an angle set by <Keyword id="Angle" />, AutoCAD centres the text on the dimension line; here it stays above it, as without one. A dimension is not associative: it does not follow the object it measures.

## Questions

### What is the shortcut for DIMLINEAR in AutoCAD?

`DLI`, or `DIMLIN`, then Enter or Space. The full name works too, and `_DIMLINEAR` in any language of AutoCAD.

### What are the dimension commands in AutoCAD?

<Command id="DIMLINEAR" /> for horizontal and vertical distances, <Command id="DIMALIGNED" /> for a distance along a slanted edge, <Command id="DIMRADIUS" /> and <Command id="DIMDIAMETER" /> for arcs and circles, <Command id="DIMANGULAR" /> for angles, <Command id="DIMCONTINUE" /> and <Command id="DIMBASELINE" /> for chains, <Command id="DIMSPACE" /> to even out their spacing and <Command id="DIMSTYLE" /> for how they look. AutoCAD's DIM, which makes any kind from one prompt, and QDIM, which dimensions many objects at once, are not in MellowCAD yet.

### Why doesn't the dimension follow the object when I change it?

MellowCAD's dimensions are not associative yet, as <Message id="nonAssociativeDimension" /> says: a dimension keeps the points it was given. Stretch them together: catch the end you move and the dimension's origin there in one <Command id="STRETCH" /> crossing window, and the measurement is worked out again; or drag the origin's grip to its new place.

### How do I change the size of the dimension text and arrows?

In the dimension style, as in AutoCAD: <Command id="DIMSTYLE" /> (`D`) opens the dimension styles, in the Styles palette here where AutoCAD has the Dimension Style Manager. The current style's text height, arrow size, overall scale and decimals are set there, and every dimension in that style follows.
