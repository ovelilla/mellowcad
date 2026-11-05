---
title: "COPY in AutoCAD"
metaTitle: "COPY in AutoCAD: command, multiple copies, alias"
description: "How AutoCAD's COPY (CO, CP) works, prompt by prompt: a base point, then as many copies as you place, with Undo and Exit, or one by displacement. Try it free."
figure: "A circle copied three times along X from one base point, then Enter."
related: ["MOVE", "ARRAY", "OFFSET", "MIRROR"]
coverage: "864449738b24"
---

COPY places copies of the objects you select: select them, give a base point, then a second point for each copy. As in AutoCAD, whose copy mode is Multiple by default, it keeps asking for one more until you press Enter or choose Exit, every copy measured from the same base point. The copies keep the objects' layer, colour and every other property. Objects selected before the command are the ones it copies, and while you place a copy the set follows the cursor.

## Options

### Displacement

Chosen at the base point prompt, or by Enter there: asks for one move as a vector, `30,0` placing one copy 30 along X, and ends. Its default is the last one COPY used in that drawing.

### Exit

Ends the command, as Enter does once a copy is placed.

### Undo

Takes back the last copy placed. Taking back the first one says <Message id="commandCompletelyUndone" /> and asks for the second point again.

## Missing

COPYMODE's Single (copy once and end) is not offered: COPY is always Multiple, so the base point prompt lists only <Keyword id="Displacement" />. The second point's Array, AutoCAD's row of evenly spaced copies, is not offered either.

## Questions

### What is the shortcut for COPY in AutoCAD?

`CO` or `CP`, then Enter or Space. The full name works too, and `_COPY` in any language of AutoCAD.

### How do I make several copies at once?

Keep placing: each point you give is one more copy from the same base point, until Enter. For copies in rows, columns or round a centre, <Command id="ARRAY" /> makes them in one go.

### How do I copy an object a set distance?

Give the base point, then type the second point as the distance: `30,0` copies it 30 along X, as dynamic input reads a point after the first from it. Or point the cursor the way to go, with Ortho or polar tracking, and type only the distance.

### Why is there no Array option in COPY?

MellowCAD does not offer it yet. For a row of evenly spaced copies, <Command id="ARRAYRECT" /> with one row makes the same, and keeps them as one array you can edit.
