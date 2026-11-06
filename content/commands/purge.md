---
title: "PURGE in AutoCAD"
metaTitle: "PURGE in AutoCAD: delete unused blocks"
description: "How AutoCAD's PURGE (PU) deletes blocks no reference uses, by name or all at once, verifying each or not, nested ones included. Try it free in your browser."
figure: "Two blocks, TAG placed on a wall and BOX whose one reference was erased: PURGE, all names, not verified, deletes BOX alone."
related: ["BLOCK", "INSERT", "ERASE", "BLOCKSPALETTE"]
coverage: "f85d339c420c"
---

PURGE removes what a drawing defines but does not use; here that is blocks. AutoCAD's PURGE opens the Purge dialog; MellowCAD has none, so PURGE asks at the command line what <Command id="-PURGE" /> asks, as AutoCAD's console does. It says the Nested items and Orphaned data settings, both off, and asks which type of unused objects to purge, offering only <Keyword id="Blocks" />; Enter there ends it.

A block is in use while a reference in the drawing places it, or the definition of a block in use holds it, however deep. Erasing a block's last reference leaves its definition in the drawing, where <Command id="INSERT" /> can place it again: PURGE is what deletes it. A block a kept block holds is never taken, and a chain of blocks that only hold one another goes in one run. With none to take, it says <Message id="noUnreferencedBlocks" />. Each run is one step that <Command id="U" /> takes back.

## Options

### Blocks

Asks the names to purge, `*` for every unused block by default, or names with wildcards, separated by commas. Then asks whether to verify each name: <Keyword id="Yes" />, the default, asks about each block before deleting it, <Keyword id="No" /> deletes them all and says each name and how many.

## Missing

The Purge dialog, and every other type: layers, linetypes, text and dimension styles, groups, materials, multileader, table and visual styles, registered applications, zero-length geometry, empty text objects, orphaned data, and All. The Nested items and Orphaned data settings cannot be changed.

## Questions

### What is the shortcut for PURGE in AutoCAD?

`PU`, then Enter or Space. `-PU` is <Command id="-PURGE" />, the command-line form, which PURGE runs here too. `_PURGE` works in any language of AutoCAD.

### How do I purge unused blocks in AutoCAD?

Type `PU`, choose <Keyword id="Blocks" />, press Enter for every name and answer <Keyword id="No" /> to delete them all without asking about each.

### Why can't I purge a block?

Because it is in use: a reference in the drawing places it, or a block in use holds it, maybe nested several levels deep. Erase its references, or explode the blocks that hold it, and PURGE can take it.

### How do I purge layers?

In AutoCAD, with PURGE's Layers type. Not yet here, where PURGE purges blocks alone; delete an empty layer in the Layer Properties Manager instead.
