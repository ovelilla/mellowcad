---
title: "ATTEDIT in AutoCAD"
metaTitle: "ATTEDIT in AutoCAD: edit block attributes"
description: "How AutoCAD's ATTEDIT (ATE) changes the attribute values of a block reference, one field per prompt, in one undo step. Try it free in your browser."
figure: "Three door tags, references to a block with the attribute NUM: ATTEDIT picks the last, inserted as 2, and its box makes it 3."
related: ["EATTEDIT", "ATTDEF", "INSERT", "ATTDISP"]
coverage: "5c6313d43bc8"
---

ATTEDIT changes the attribute values of one block reference. It asks you to select the reference, then opens a box with a field for each of its attributes, labelled by the attribute's prompt and filled with its value, as AutoCAD's Edit Attributes dialog is. Retype the values, Tab moving from one field to the next, and Enter, AutoCAD's OK, applies them in one step that <Command id="U" /> takes back; Escape, its Cancel, changes nothing.

The pick takes the object under the box. Anything but a block reference is refused, and so is a reference whose block has no attributes, and the question is asked again; a pick on nothing asks again in silence. The block's definition is not changed, nor are its other references: each holds values of its own. <Command id="EATTEDIT" /> edits the same values in a box labelled by tag, and a double-click on a reference with attributes runs it.

## Missing

`-ATTEDIT`, the command-line form that edits attributes one by one or globally, and its aliases `-ATE` and `ATTE`. Edit Attributes' Previous and Next buttons, for a block with more attributes than one page holds, and its Block name line. ATTIPEDIT, which edits one attribute in place, and its Ctrl+double-click. An unlocked attribute's own grip on a reference, and the attribute rows of the Properties palette.

## Questions

### What is the shortcut for ATTEDIT in AutoCAD?

`ATE`, then Enter or Space; `DDATTE` too. `_ATTEDIT` works in any language of AutoCAD.

### How do I edit block attributes in AutoCAD?

Type `ATE` and pick the reference, or double-click it, which runs <Command id="EATTEDIT" />. Change the values in the box and press Enter. To change the attributes themselves, their tag, prompt or position, edit the definitions and redefine the block with <Command id="BLOCK" />.

### Why does ATTEDIT say the block has no editable attributes?

Because the block of the reference you picked holds no attributes: ATTEDIT edits the values of a reference to a block that has them. A definition that has not joined a block yet is edited with <Command id="TEXTEDIT" />, a double-click on it.

### What is the difference between ATTEDIT and EATTEDIT?

Both edit one reference's values. ATTEDIT's box labels each field by the attribute's prompt, as AutoCAD's Edit Attributes dialog does; <Command id="EATTEDIT" />'s, the Enhanced Attribute Editor, by its tag. In AutoCAD, EATTEDIT also has tabs for each attribute's text options and properties.
