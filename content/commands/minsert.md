---
title: "MINSERT in AutoCAD"
metaTitle: "MINSERT in AutoCAD: a block in rows and columns"
description: "How AutoCAD's MINSERT places a block in rows and columns as one object, what it asks, and why EXPLODE refuses it. Try it free in your browser."
figure: "A seat made a block, then laid by MINSERT in three rows of five: one object."
related: ["INSERT", "ARRAYRECT", "BLOCK", "EXPLODE"]
coverage: "90d7dc421e15"
---

MINSERT inserts a block defined in the drawing many times over, in rows and columns, as one object. It asks what <Command id="-INSERT" /> asks — the block's name (Enter takes the one offered, the last block inserted), the insertion point, the X and Y scale factors and the rotation angle — then the number of rows and the number of columns (Enter is 1), then the distance between rows and the distance between columns. Only the distances the counts need are asked, and one row of one column is a plain block reference. A block with attributes asks their values last, once, and every copy shows them.

The rows run along the block's Y axis and the columns along its X axis, both turned by the rotation; the distances are in drawing units, whatever the scale, and a negative one lays the copies down or to the left. At the distance between rows, two points pick a unit cell instead: its width is the distance between columns and its height the distance between rows. The result is AutoCAD's MInsert block: it moves, copies, rotates, scales and mirrors as one, <Command id="LIST" /> adds its rows and columns, and the Properties palette shows them as Columns, Column spacing, Rows and Row spacing, each to be typed. <Command id="EXPLODE" /> counts it as minserted and leaves it whole, as AutoCAD does. A DXF opens and saves it as AutoCAD's own.

## Options

### ?

At the block's name: lists the blocks in the drawing, as <Command id="BLOCK" /> does, and ends.

### Scale

At the insertion point: asks one factor for both axes, then asks for the point again. After the point, the X and Y factors are not asked.

### Rotate

At the insertion point: asks the angle, which turns each copy and the whole grid, then asks for the point again. After the point, the rotation is not asked.

## Missing

At the insertion point, Basepoint, X, Y and Z, and at the X scale, Corner and XYZ, as -INSERT lacks them; the `~` that opens a drawing file; annotative blocks, which do not exist here. A linear dimension picks the whole MINSERT, not an object inside one of its copies. The Properties palette's Annotative, Block Unit and Unit factor.

## Questions

### What is the MINSERT command in AutoCAD?

Multiple insert: it places a block in a rectangular grid of rows and columns, as one object. Change the counts or the spacing later in the Properties palette.

### How do I explode a MINSERT block?

You cannot: <Command id="EXPLODE" /> says it was minserted and leaves it, in AutoCAD as here, even after its rows and columns are set to 1. Insert the block again with <Command id="-INSERT" />, or lay the copies with <Command id="ARRAYRECT" />, whose array explodes into its items.

### Does MINSERT have a shortcut?

No: AutoCAD gives MINSERT no alias and no ribbon button, so type `MINSERT` in full. `_MINSERT` works in any language of AutoCAD.

### What is the difference between MINSERT and ARRAY?

MINSERT repeats one block as a single reference that cannot be exploded. <Command id="ARRAYRECT" /> repeats any objects as an associative array, with grips to change its counts and spacing, which <Command id="EXPLODE" /> breaks up.
