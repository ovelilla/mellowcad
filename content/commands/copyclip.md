---
title: "COPYCLIP in AutoCAD"
metaTitle: "COPYCLIP in AutoCAD: Ctrl+C, copy and paste"
description: "How AutoCAD's COPYCLIP (Ctrl+C) works with CUTCLIP, COPYBASE and PASTECLIP: copy objects to the clipboard and paste them at a point. Try it free online."
figure: "COPYCLIP of a plate's hole, then PASTECLIP at 65,20: the copy laid there by its lower-left corner, a second hole."
related: ["COPY", "PASTECLIP", "COPYBASE", "CUTCLIP", "INSERT"]
coverage: "271ee9d97894"
---

COPYCLIP copies the objects you select to the clipboard, with the layers, styles and blocks they use; the drawing does not change, and objects selected before it stay selected. Ctrl+C runs it, cancelling a command that is running. <Command id="PASTECLIP" />, Ctrl+V, then asks for an insertion point: the objects follow the cursor and land with the lower-left corner of their extents at the point, in the current UCS, all in one step that <Command id="U" /> takes back. Paste into the same drawing or another one: the clipboard is the system's, so a drawing in another tab can read it, if the browser lets the page read the clipboard. Where a pasted layer, style or block has the name of one the drawing already has, the drawing's own is used.

<Command id="CUTCLIP" />, Ctrl+X, copies the objects and erases them, as ERASE does. <Command id="COPYBASE" />, Ctrl+Shift+C, asks for a base point first, and PASTECLIP then places the objects by that point instead of their corner, so they land exactly where you mean. Ctrl+A selects every object in the drawing.

## Missing

PASTEBLOCK and CUTBASE, and so Ctrl+Shift+V and Ctrl+Shift+X, which are left to the browser, as is Ctrl+Shift+A. PASTEORIG, PASTESPEC, dragging objects between windows, and text from another program pasted as multiline text. PASTECLIP's hidden INSERT options at its point, so a paste cannot be scaled, turned or exploded as it lands.

## Questions

### What is the difference between COPY and COPYCLIP?

<Command id="COPY" /> places copies in the same drawing, from a base point to a second point. COPYCLIP puts the objects on the clipboard, to paste with PASTECLIP into this drawing or another.

### How do I copy with a base point?

Press Ctrl+Shift+C, or type `COPYBASE`, give the base point and select the objects. Ctrl+V then places them by that point.

### How do I copy objects from one drawing to another?

Select them and press Ctrl+C, open the other drawing and press Ctrl+V, then pick the insertion point. Their layers, styles and blocks come with them.

### Why does paste not work?

The browser may ask whether the page can read the clipboard: allow it. If it refuses, PASTECLIP pastes what was last copied in the same page. With nothing copied, it pastes nothing.
