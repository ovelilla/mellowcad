---
title: "ATTDISP in AutoCAD"
metaTitle: "ATTDISP in AutoCAD: show or hide attributes"
description: "How AutoCAD's ATTDISP shows block attributes: Normal, ON to show the invisible ones too, OFF to hide them all. Saved with the drawing. Try it free online."
figure: "Two desks whose part numbers are invisible attributes: ATTDISP ON shows them under each desk, beside the visible numbers."
related: ["ATTDEF", "ATTEDIT", "EATTEDIT", "BLOCK"]
coverage: "e3b0c44298fc"
---

ATTDISP sets which attributes the block references in the drawing show. It asks for the setting, offering the current one, Normal in a new drawing; any other word says the keyword is invalid and asks again, and Enter keeps it. A change redraws the whole drawing, `Regenerating model.` as AutoCAD 2027 says it, and is saved with the drawing as ATTMODE, a step that <Command id="U" /> takes back. Typed with an apostrophe inside a command, it runs there too.

It changes only what shows: an invisible attribute keeps its value, and a hidden one can still be edited with <Command id="ATTEDIT" /> or <Command id="EATTEDIT" />.

## Options

### Normal

Shows each attribute as it was defined: the visible ones, not those defined with <Command id="ATTDEF" />'s <Keyword command="ATTDEF" id="Invisible" />.

### ON

Shows every attribute, the invisible ones too.

### OFF

Hides every attribute, the visible ones too.

## Questions

### How do I show invisible attributes in AutoCAD?

Type `ATTDISP` and choose <Keyword id="ON" />: every attribute shows, the invisible ones too. <Keyword id="Normal" /> hides them again.

### Why are my block attributes not showing?

<Command id="ATTDISP" /> may be <Keyword id="OFF" />, which hides every attribute, or <Keyword id="Normal" /> with the attributes defined as invisible. Choose <Keyword id="ON" /> to see them all. A reference whose block has no attributes shows none, whatever the setting.

### How do I hide attribute values in AutoCAD?

Define them invisible: <Command id="ATTDEF" />'s <Keyword command="ATTDEF" id="Invisible" /> mode, before you make the block. ATTDISP <Keyword id="OFF" /> hides every attribute at once, in the whole drawing.
