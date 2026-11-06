---
title: "TEXTEDIT in AutoCAD"
metaTitle: "TEXTEDIT in AutoCAD: edit text, ED and DDEDIT"
description: "How AutoCAD's TEXTEDIT (ED) edits text, multiline text and attribute definitions, one after another, with Undo and Mode. Try it free in your browser."
figure: "A nameplate's misspelt PALTE picked with TEXTEDIT and retyped PLATE, then Escape to end the command."
related: ["TEXT", "MTEXT", "ATTDEF", "PROPERTIES"]
coverage: "047bf1b8da19"
---

TEXTEDIT edits annotation objects: it says the current edit mode, Multiple at first, and asks you to select one. A single-line text opens to be retyped where it is, a multiline text in <Command id="MTEXT" />'s editor, an attribute definition as its tag, prompt and default value. In Multiple mode it then asks for the next object, until Escape or Enter ends the command, and the whole run is one step that <Command id="U" /> takes back. A double-click on a text or an attribute definition runs TEXTEDIT, and on a multiline text it opens the editor for that one object.

Escape in a single-line text's editor drops that edit and asks for the next object; a second Escape ends the command. An object on a locked layer says <Message id="objectOnLockedLayer" /> and asks again, and a pick on anything else asks again in silence. One text selected before the command opens at once.

## Options

### Undo

Takes back the last edit of this run and asks again; with none left, it says the command has been completely undone.

### Mode

Asks for the edit mode: <Keyword id="Single" /> ends the command after one object, <Keyword id="Multiple" /> asks for another. The mode is kept for the next TEXTEDIT, in every drawing.

## Missing

Dimension text: TEXTEDIT does not edit a dimension's text, which <Command id="DIMLINEAR" />'s Text option sets as it is placed. Editing a text's content in the Properties palette. MTEDIT, typed, and -MTEDIT. While the editor is open the command line reads `TEXTEDIT:`, as AutoCAD edits in place and asks nothing.

## Questions

### What is the shortcut for TEXTEDIT in AutoCAD?

`ED`, then Enter or Space; `DDEDIT` and `TEDIT` too, AutoCAD's older names. `_TEXTEDIT` works in any language of AutoCAD.

### How do I edit text in AutoCAD?

Double-click it, or type `ED` and pick it; retype it and press Enter. TEXTEDIT then asks for the next text to edit, until Escape. Its height and rotation are rows of the Properties palette, and its style the Style row.

### How do I edit several texts one after another?

Leave TEXTEDIT in <Keyword id="Multiple" /> mode, its default: after each text it asks for the next. <Keyword id="Mode" /> and <Keyword id="Single" /> make it end after one, as a double-click does.

### Why does double-click not edit my text?

The text may be on a locked layer: unlock the layer in the Layer Properties Manager. A dimension's text is not edited by TEXTEDIT yet, and a block's attribute values open <Command id="EATTEDIT" />.
