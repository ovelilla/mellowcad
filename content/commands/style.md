---
title: "STYLE in AutoCAD: text styles"
metaTitle: "AutoCAD text style command: STYLE and alias"
description: "How AutoCAD's STYLE (ST) manages text styles: new, rename, delete, set current, a fixed height, and what a style does to TEXT and MTEXT. Try it free online."
figure: "A nameplate: STYLE, then TEXT, whose Style ? lists the drawing's style, Standard in Arial, and the plate's name written in it."
related: ["TEXT", "MTEXT", "DIMSTYLE", "TEXTEDIT"]
coverage: "1814a655a8f7"
---

STYLE manages the drawing's text styles: what a text is written with. Every text, multiline text and attribute has a style, and new ones take the current style, Standard in a new drawing. STYLE opens the Text Style dialog, as in AutoCAD. A selection made before it is dropped, as the dialog drops it, and typed with an apostrophe inside a command, `'STYLE`, it opens without ending that command, which goes on once the dialog closes.

The dialog names the current style and lists the styles, all of them or only those in use. New... asks for a name, offering `style1`, `style2`… the first free one, and makes a copy of the selected style, current. Set Current makes the selected style current; F2 edits its name, and a name already in use, in any case, is refused, as AutoCAD refuses it. Delete removes a style, but never Standard, the current style or one in use. Height gives a style a fixed height, applied by Apply: 0, the default, leaves it free, so <Command id="TEXT" /> asks for one each time; with a height set, TEXT does not ask. Cancel drops a height not applied, and reads Close once something has changed. Everything done in the dialog is one step that <Command id="U" /> takes back. With texts selected, the Style row of the Properties palette gives them another style, in one step.

## Missing

The dialog's preview. Font, font style and big font, width factor, oblique angle, and the Upside down, Backwards and Vertical effects: every style is drawn in Arial, upright, at width 1. Annotative styles, and the Annotative style a new AutoCAD drawing holds beside Standard. `-STYLE`, which asks it all at the command line.

## Questions

### What is the shortcut for STYLE in AutoCAD?

`ST`, then Enter or Space; `DDSTYLE` too. `_STYLE` works in any language of AutoCAD.

### How do I change the text style in AutoCAD?

For new text, make the style current with Set Current in the dialog STYLE opens, or with <Command id="TEXT" />'s <Keyword command="TEXT" id="Style" /> option. For text already written, select it and choose the style in the Style row of the Properties palette.

### How do I change the font of a text style?

In AutoCAD, in the Text Style dialog's Font Name. Not yet here: every style is drawn in Arial, and a style differs only in its name and its height.

### Why does TEXT not ask for the height?

The current style has a height of its own. Set its height to 0 in the Text Style dialog, then Apply, and <Command id="TEXT" /> asks for the height again, offering the last one used.
