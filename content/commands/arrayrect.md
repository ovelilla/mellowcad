---
title: "ARRAYRECT in AutoCAD"
metaTitle: "Rectangular array in AutoCAD: ARRAYRECT command"
description: "How AutoCAD's ARRAYRECT works, prompt by prompt: columns, rows and levels, their spacing, associative or not. Try it free in your browser."
figure: "A square and its circle in 5 columns and 3 rows, 16 and 14 apart: the count given, then the spacing."
related: ["ARRAY", "ARRAYPOLAR", "ARRAYPATH", "COPY"]
coverage: "584d69d3e912"
---

ARRAYRECT copies a selection in columns and rows, and in levels if you want them, as one array object. It asks for the objects, says the type and whether the array is associative, and shows it at once: 4 columns along the UCS's X and 3 rows along its Y, one and a half times the selection's size apart. Then one prompt edits it live until Enter makes it, through its options or the preview's grips, as in AutoCAD: click one of its arrows, then click where it should go or type a number, to set a count or a spacing. Escape there makes the array too. The objects selected become its first item.

## Options

### ASsociative

<Keyword id="Yes" />, the default, makes one array object: its grips and the Properties palette change it later, and <Command id="EXPLODE" /> breaks it into its items. <Keyword id="No" /> makes separate copies beside the objects selected. The answer is kept for the session, by ARRAYPOLAR and ARRAYPATH too.

### COUnt

The number of columns, then of rows, from 1 to 32767 each.

### Spacing

The distance between columns, then between rows, negative to the left or below. Or <Keyword id="Unit cell" />: the two corners of a rectangle whose sides are both distances.

### COLumns

The number of columns and the distance between them.

### Rows

The number of rows, the distance between them, and an elevation each row rises over the one before it.

### Levels

Copies stacked along the UCS's Z: the number of levels, then the distance between them, or with <Keyword id="Total" /> the distance from the first level to the last.

### eXit

Makes the array and ends the command, as Enter does.

## Missing

Base point; Total at the distances between columns and between rows (Levels has it); Expression, which ties a value to the drawing's parameters. ARRAYEDIT and ARRAYCLOSE, which edit an array's source or replace its items. The menus of the array's grips (Column Count, Total Column Spacing, Axis Angle…) and Ctrl to cycle them, so a total spacing or an axis angle cannot be set from a grip; nor does a grip write its lines at the command line. The palette's Base X and Base Y cannot be retyped.

## Questions

### How do I start a rectangular array?

Type `ARRAYRECT`, which has no alias, or `AR` for <Command id="ARRAY" /> and Enter at its question, since rectangular is its default. Select the objects and press Enter: the array is drawn at once, ready to edit.

### How do I set the distance between rows and columns?

Choose <Keyword id="Spacing" /> and type the distance between columns, then between rows; a negative one goes left or down. With <Keyword id="Unit cell" />, two corners give both at once. Or drag the arrows at the second column and row.

### How do I make the copies separate objects?

Choose <Keyword id="ASsociative" /> and answer <Keyword id="No" /> before you press Enter: each copy is an object of its own. An associative array can be broken into its items later with <Command id="EXPLODE" />.

### How do I make a 3D array?

Choose <Keyword id="Levels" />: the rows and columns are copied up along the UCS's Z, as many levels as you say, the distance apart you give. <Keyword id="Rows" /> also asks for an elevation, which lifts each row over the one before it.
