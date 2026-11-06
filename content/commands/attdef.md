---
title: "ATTDEF in AutoCAD"
metaTitle: "ATTDEF in AutoCAD: block attributes and alias"
description: "How AutoCAD's ATTDEF (ATT) defines a block attribute: its modes, tag, prompt and default value, then where its text goes. Try it free in your browser."
figure: "A door tag: the attribute NUM centred in a circle, its prompt the tag itself and its default value 1, ready to join a block."
related: ["BLOCK", "INSERT", "ATTEDIT", "ATTDISP", "EATTEDIT"]
coverage: "7fca3d8c038a"
---

ATTDEF defines an attribute: a tag, a prompt and a default value, placed in the drawing as a line of text. Select it with the other objects when you make a block with <Command id="BLOCK" />, and each reference to that block holds a value of its own for it: a door's number, a part's code, a room's name. Until then the definition shows its tag.

AutoCAD's ATTDEF opens the Attribute Definition dialog, which MellowCAD does not have: here ATTDEF asks at the command line what <Command id="-ATTDEF" /> asks, as AutoCAD's console does. It says the current modes and asks for one to change, until Enter goes on. Then the tag: no spaces, as a space ends it, and lower case is made upper case; Enter alone says <Message id="tagCannotBeNull" />. Then the prompt that <Command id="INSERT" /> will ask the value by, Enter taking the tag, and the default value. Last, where the text goes, with <Command id="TEXT" />'s questions: a start point, the height and the rotation. The height and the justification are TEXT's, shared both ways. Enter at the start point puts the definition one line below the last one defined, with its height, rotation, style and justification, so a block's attributes stack one under another.

## Options

### Invisible

The value does not show on the references, until <Command id="ATTDISP" /> turns it on. Each mode is a switch: choosing it flips it between `Y` and `N`, writes the modes again and asks once more. The modes stay set for the next ATTDEF.

### Constant

Every reference holds the same value, which ATTDEF asks for instead of a prompt and a default; INSERT never asks it.

### Verify

INSERT asks the value a second time, to check it, after asking every value once.

### Preset

INSERT does not ask the value: each reference takes the default.

### Lock position

On at first: the attribute stays where the block puts it.

### Justify

Asks where the text hangs from its point, as TEXT does: <Keyword id="Left" />, <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, or one of the nine points by top, middle and bottom, left, centre and right. The start point prompt then asks for the point it names: middle centre centres the value in a tag.

### Style

Asks for the text style to use, which becomes the current one; <Keyword id="?" /> lists the drawing's styles.

## Missing

The Attribute Definition dialog: ATTDEF asks at the command line. The Annotative and Multiple lines modes, which AutoCAD 2027 lists after Lock position, and a multiline attribute's lines. Fields, the Align and Fit justifications, and Style's `?` asking which styles to list.

## Questions

### What is the shortcut for ATTDEF in AutoCAD?

`ATT`, then Enter or Space; `DDATTDEF` too. `-ATT` is <Command id="-ATTDEF" />, the command-line form, which ATTDEF runs here too. `_ATTDEF` works in any language of AutoCAD.

### How do I create a block with attributes in AutoCAD?

Draw the symbol, then run ATTDEF for each attribute and place its text where the value should show. Run <Command id="BLOCK" />, pick a base point and select the symbol and the attributes, in the order INSERT should ask them. Each <Command id="INSERT" /> of the block then asks a value for each attribute, offering its default.

### What is the difference between the tag, the prompt and the default value?

The tag names the attribute, as an identifier: it is what the definition shows, and the field <Command id="EATTEDIT" /> labels. The prompt is the question INSERT asks for its value. The default is the value offered, which Enter accepts.

### How do I edit an attribute definition?

Double-click it before it joins a block: <Command id="TEXTEDIT" /> opens its tag, prompt and default value. Once in a block, the values of each reference are edited with <Command id="ATTEDIT" /> or <Command id="EATTEDIT" />.
