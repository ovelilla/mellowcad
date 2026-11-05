---
title: "ARRAY in AutoCAD"
metaTitle: "ARRAY in AutoCAD: rectangular, polar and path"
description: "How AutoCAD's ARRAY (AR) works, prompt by prompt: rectangular, polar and path arrays, edited live before they are made. Try it free in your browser."
figure: "A square and its circle arrayed with the defaults: Enter for a rectangular array, 4 columns and 3 rows."
related: ["ARRAYRECT", "ARRAYPOLAR", "ARRAYPATH", "COPY", "EXPLODE"]
coverage: "99b1e20cbbd4"
---

ARRAY copies a selection in a pattern: in columns and rows, round a centre, or along a path. It asks for the objects, then for the type of array, Enter taking a rectangular one, and hands the selection to <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> or <Command id="ARRAYPATH" />, which go on without asking for the objects again. Each shows the array at once and edits it live, through its options and its grips, until Enter makes it: one array object, or loose copies if you said it should not be associative. The whole run is one undo step, and Enter at the command prompt repeats ARRAY.

## Options

### Rectangular

Columns and rows, and levels stacked along Z if you want them: <Command id="ARRAYRECT" />. It starts with 4 columns and 3 rows, one and a half times the selection's size apart.

### PAth

Along a line, an arc, a circle or a polyline: <Command id="ARRAYPATH" />. It asks for the path curve, then lays the items along it, each turned as the path turns.

### POlar

Round a centre point: <Command id="ARRAYPOLAR" />. It asks for the centre and starts with 6 items over a full turn.

## Missing

The type offered is always Rectangular: ARRAYTYPE, the variable that sets AutoCAD's default, is not read.

## Questions

### What is the shortcut for ARRAY in AutoCAD?

`AR`, then Enter or Space. The full name works too, and `_ARRAY` in any language of AutoCAD. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> and <Command id="ARRAYPATH" /> have no alias, and typed in full they skip the question of the type.

### How do I make a circular array?

Choose <Keyword id="POlar" />, or run <Command id="ARRAYPOLAR" />, and pick the centre point: the selection is copied round it, 6 items at first. Change the count with <Keyword command="ARRAYPOLAR" id="Items" />, and set the angle they fill with <Keyword command="ARRAYPOLAR" id="Fill angle" />.

### How do I explode an array?

Select it and run <Command id="EXPLODE" />: the array becomes its items' objects, each object on its own layer. To get loose copies from the start, answer <Keyword command="ARRAYRECT" id="No" /> to <Keyword command="ARRAYRECT" id="ASsociative" /> before you press Enter.

### How do I change an array after it is made?

Select it. Its grips change it: the square at the base point moves it, the arrows set the counts and the spacing, and a number typed while a count arrow is hot is the count. The Properties palette lists its columns, rows and spacing, or its items and angles, to retype. ARRAYEDIT is not there yet.
