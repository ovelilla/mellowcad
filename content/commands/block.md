---
title: "BLOCK in AutoCAD"
metaTitle: "BLOCK in AutoCAD: how to create a block"
description: "How AutoCAD's BLOCK (B) makes a block, prompt by prompt: a name, a base point and the objects; redefining one, attributes. Try it free in your browser."
figure: "A chair, a rectangle and a line, made the block B1: its name, a base point at the middle of its front edge, both objects picked."
related: ["INSERT", "ATTDEF", "EXPLODE", "PURGE"]
coverage: "c5a9278fcf30"
---

BLOCK stores a set of objects in the drawing under a name, so that <Command id="INSERT" /> can place it again as often as you like, each copy a reference to that one definition. It asks for a name, then the insertion base point — the point every reference is placed by — then the objects. Enter ends the selection and defines the block, and the objects you picked become a reference to it, where they were. The whole command is one step that Undo takes back.

AutoCAD's BLOCK opens the Block Definition dialog, which MellowCAD does not have: here BLOCK asks at the command line what <Command id="-BLOCK" /> asks, as AutoCAD's console does. A name may hold spaces and up to 255 characters, but none of `< > / \ " : ; ? * | , =` nor a backquote: Enter alone or such a name says <Message id="invalidNewBlockName" /> and asks again. A name the drawing already has, in any case, asks whether to redefine that block, <Keyword id="Yes" /> or <Keyword id="No" /> (the default, which ends the command).

## Options

### ?

Lists the blocks in the drawing: it asks which to list, `*` for all by default or a name with wildcards, writes the names that match and a count of each kind, then ends. Anonymous blocks, such as an array's, are counted, never named.

## Missing

AutoCAD's Block Definition dialog: BLOCK asks at the command line. At the base point, the Annotative and Mode options (Retain, Delete): the objects are always converted to a reference. ATTREQ 0, which skips the attribute values' box, and ATTSYNC, ATTREDEF, BATTMAN and BATTORDER: a redefined block leaves its references' attributes as they were, as AutoCAD does. ByBlock: an object inside a block cannot take the reference's own colour, linetype or lineweight, as one drawn ByBlock does in AutoCAD. In a turned UCS, AutoCAD 2027 moves the objects it converts; here they stay where they were, on purpose.

## Questions

### What is the shortcut for BLOCK in AutoCAD?

`B`, then Enter or Space. In AutoCAD it opens the Block Definition dialog; here it asks at the command line, as `-B` (<Command id="-BLOCK" />) does. `_BLOCK` works in any language of AutoCAD.

### How do I create a block in AutoCAD?

Type `B`, a name, then pick the base point — a corner, or the middle of the edge the block will sit on — and select the objects. Enter defines the block and turns the objects into a reference to it. A selection made before the command is taken too, after the base point.

### How do I redefine a block?

Run BLOCK with the block's name and answer <Keyword id="Yes" />, then give a base point and select the new objects: every reference to the block shows the new definition. The objects cannot include a reference to the block itself; such a set is refused and the command ends.

### How do I make a block with attributes?

Define the attributes first with <Command id="ATTDEF" />, then select them with the other objects: they join the block in the order you pick them. The reference that replaces them opens a box with a field for each attribute, labelled by its prompt and filled with its default: Enter applies the values, Escape keeps the defaults.

### How do I explode a block?

<Command id="EXPLODE" /> turns a reference back into the objects it shows, one level of nesting at a time, each on its own layer and in its own colour. Attributes come back as their definitions; the values are dropped.
