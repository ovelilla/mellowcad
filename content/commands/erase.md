---
title: "ERASE in AutoCAD"
metaTitle: "ERASE in AutoCAD: command, shortcut and Delete"
description: "How AutoCAD's ERASE (E) works: select the objects, Enter, gone; the Delete key, ALL, and how to get them back. Try it free in your browser."
figure: "A rectangle and its two diagonals: one diagonal picked, then Enter, and it is erased."
related: ["TRIM", "BREAK", "EXPLODE", "UNDO"]
coverage: "c1b206feb5d9"
---

ERASE removes the objects you select from the drawing. Select them at `Select objects:`, by picking them or with any of AutoCAD's selection modes, a window or a crossing among them, then press Enter or Space: they are gone, and the command says nothing more. Escape ends it erasing nothing. As in AutoCAD, objects selected before the command are erased at once, and the Delete key with objects selected runs ERASE on them. While you select, the object under the cursor and those already chosen draw faded, as AutoCAD previews what it will erase. The whole erase is one step that Undo takes back.

## Missing

OOPS, which in AutoCAD brings back the last set ERASE erased, even after other commands. Here <Command id="U" /> or Ctrl+Z takes the erase back, with whatever came after it.

## Questions

### What is the shortcut for ERASE in AutoCAD?

`E`, then Enter or Space; `DELETE` is an alias too. Or select the objects at `Command:` and press the Delete key. The full name works as well, and `_ERASE` in any language of AutoCAD.

### How do I erase everything in a drawing?

Run ERASE and type `ALL` at `Select objects:`, then Enter. Objects on a locked layer are left out, and the selection says how many were.

### How do I get back what I erased?

Type <Command id="U" /> or press Ctrl+Z straight away: the erase is one undo step. OOPS, which brings back the last erased set even after other commands, is not built yet.

### What is the difference between ERASE and TRIM?

ERASE removes whole objects. <Command id="TRIM" /> removes only the part of an object that runs past the edges it meets, and keeps the rest.
