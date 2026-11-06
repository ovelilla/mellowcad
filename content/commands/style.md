---
title: "STYLE in AutoCAD: text styles"
metaTitle: "AutoCAD text style command: STYLE and alias"
description: "How AutoCAD's STYLE (ST) manages text styles: new, rename, delete, set current, a fixed height, and what a style does to TEXT and MTEXT. Try it free online."
figure: "A nameplate: STYLE, then TEXT, whose Style ? lists the drawing's style, Standard in Arial, and the plate's name written in it."
related: ["TEXT", "MTEXT", "DIMSTYLE", "TEXTEDIT"]
coverage: "199304ef0403"
---

STYLE manages the drawing's text styles: what a text is written with. Every text, multiline text and attribute has a style, and new ones take the current style, Standard in a new drawing. AutoCAD's STYLE opens the Text Style dialog; MellowCAD has none yet, so STYLE opens the text table of the Styles palette, where <Command id="DIMSTYLE" />'s dimension styles are too. A selection made before it is dropped, as the dialog drops it, and typed with an apostrophe inside a command, `'STYLE`, it opens without ending that command.

The table lists the styles with the current one marked. New makes a copy of the selected style, named `style1`, `style2`… the first free name, and makes it current. Set Current makes a style current; its name can be retyped, and a name already in use, in any case, is refused, as AutoCAD refuses it. Delete removes a style, but never Standard, the current style or one in use. Height gives a style a fixed height: 0, the default, leaves it free, so <Command id="TEXT" /> asks for one each time; with a height set, TEXT does not ask. Every change is a step that <Command id="U" /> takes back. With texts selected, the Style row of the Properties palette gives them another style, in one step.

## Missing

The Text Style dialog and its preview: STYLE opens the Styles palette instead. Font, font style and big font, width factor, oblique angle, and the Upside down, Backwards and Vertical effects: every style is drawn in Arial, upright, at width 1. Annotative styles, and the Annotative style a new AutoCAD drawing holds beside Standard. `-STYLE`, which asks it all at the command line.

## Questions

### What is the shortcut for STYLE in AutoCAD?

`ST`, then Enter or Space; `DDSTYLE` too. `_STYLE` works in any language of AutoCAD.

### How do I change the text style in AutoCAD?

For new text, make the style current in the Styles palette that STYLE opens, or with <Command id="TEXT" />'s <Keyword command="TEXT" id="Style" /> option. For text already written, select it and choose the style in the Style row of the Properties palette.

### How do I change the font of a text style?

In AutoCAD, in the Text Style dialog's Font Name. Not yet here: every style is drawn in Arial, and a style differs only in its name and its height.

### Why does TEXT not ask for the height?

The current style has a height of its own. Set its height to 0 in the Styles palette and <Command id="TEXT" /> asks for the height again, offering the last one used.
