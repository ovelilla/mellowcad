---
title: "COLOR in AutoCAD"
metaTitle: "COLOR in AutoCAD: object color, ByLayer, alias"
description: "How AutoCAD's COLOR (COL) sets the colour of new objects: ByLayer, an index colour by name or number, or a true colour in RGB. Try it free in your browser."
figure: "A plate drawn ByLayer, its hole in red, its bore in the true colour 0,128,255, then COLOR set back to ByLayer."
related: ["LAYER", "PROPERTIES", "MATCHPROP", "LINETYPE", "LWEIGHT"]
coverage: "6b9706556fdf"
---

COLOR sets the colour new objects are drawn with. AutoCAD opens the Select Color dialog; MellowCAD has none yet, so COLOR runs the command-line form AutoCAD has too, <Command id="-COLOR" />. It asks for the default object colour, offering the current one, `BYLAYER` in a new drawing: ByLayer means each object takes its layer's colour, and a colour chosen instead is the object's own. Type an index colour's number or its name, or choose <Keyword id="Truecolor" />. Enter keeps the current colour, and the change is a step that <Command id="U" /> takes back.

A word it cannot read says <Message id="colorRequired" />, and 0, a negative number or one past 255 <Message id="invalidColorNumber" />; it asks again. Typed with an apostrophe inside a command, `'COLOR`, each object drawn after it takes the new colour: each segment of a <Command id="LINE" /> takes the colour current as it starts. COLOR sets only what comes next; the Properties palette or the top bar's colour list changes objects already drawn.

## Options

### Truecolor

Asks for a colour as three values from 0 to 255, red, green and blue, separated by commas with no space: `0,128,255` is a mid blue. A colour that is also an index colour, `255,0,0`, is stored as that index colour.

### BYLAYER

New objects take their layer's colour, as they do at first.

### RED

Index colour 1, also typed as `1`.

### YELLOW

Index colour 2, also typed as `2`.

### GREEN

Index colour 3, also typed as `3`.

### CYAN

Index colour 4, also typed as `4`.

### BLUE

Index colour 5, also typed as `5`.

### MAGENTA

Index colour 6, also typed as `6`.

### WHITE

Index colour 7, also typed as `7`: white on a dark background and black on a light one.

## Missing

The Select Color dialog, Color Books and the HSL form. The index colours 8 to 255: only 1 to 7 are taken. ByBlock. A true colour that matches an index colour is stored as that index colour, where AutoCAD keeps the RGB. Transparency (CETRANSPARENCY), and the per-type defaults HPCOLOR, HPLAYER, DIMLAYER and TEXTLAYER.

## Questions

### What is the shortcut for COLOR in AutoCAD?

`COL`, then Enter or Space; `COLOUR` too. The full name works as well, and `_COLOR` in any language of AutoCAD.

### How do I change the color of an object in AutoCAD?

Select it and choose the colour in the top bar's colour list or in the Color row of the Properties palette: it changes in one step. Or copy another object's colour with <Command id="MATCHPROP" />. COLOR only sets the colour of objects drawn after it.

### What does ByLayer mean in AutoCAD?

That the object takes its layer's colour, so changing the layer's colour in the Layer Properties Manager changes every ByLayer object on it. It is the default, and keeps a drawing's colours organised by layer: <Command id="LAYER" />.

### How do I use RGB colors in AutoCAD?

Choose <Keyword id="Truecolor" /> and type the three values separated by commas, such as `0,128,255`.
