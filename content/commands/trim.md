---
title: "TRIM in AutoCAD"
metaTitle: "TRIM in AutoCAD: command, modes and alias"
description: "How AutoCAD's TRIM (TR) works, prompt by prompt: Quick and Standard modes, cutting edges, fence and crossing, and Shift to extend. Try it free in your browser."
figure: "A line cut back to the two lines that cross it: each end picked once, in Quick mode."
related: ["EXTEND", "OFFSET", "FILLET", "BREAK"]
coverage: "2434994f52aa"
---

TRIM cuts an object back to where other objects cross it: you pick the piece to take away, and it goes up to the nearest crossing on either side. It starts in Quick mode, as AutoCAD's does: every object is a cutting edge, and an object that nothing crosses is deleted whole. Holding Shift as you pick extends the object to the nearest edge instead, as <Command id="EXTEND" /> does. Each pick is one step that Undo takes back; Enter ends the command.

## Options

### cuTting

Chooses which objects cut: select them, or press Enter to take every object. From then on only those cut, whatever the mode, until the command ends.

### Fence

Asks for the points of a line, as many as you like until Enter: every object it crosses is trimmed where it crosses, in one step. Standard mode lists it; Quick mode takes it too, and a pick on nothing there starts a two-point fence by itself.

### Crossing

Asks for the two corners of a window: everything its outline crosses is trimmed, in one step. An object wholly inside the window is not one it crosses.

### mOde

Switches between <Keyword id="Quick" /> and <Keyword id="Standard" />. In Standard mode TRIM first asks for the cutting edges (Enter takes them all), leaves an object that no edge crosses with <Message id="doesNotIntersectCuttingEdge" />, lists Fence and Edge, and a pick on nothing starts a crossing window. The mode is TRIM's and EXTEND's both, and lasts the session.

### Edge

Standard mode only. With <Keyword id="Extend" />, an edge also cuts where it would cross if it were extended — a line both ways, an arc round its circle; <Keyword id="No extend" /> is the default.

### eRase

Erases objects without leaving the command: select them, then Enter erases them, as one step of TRIM's that Undo can take back.

### Undo

Listed once the prompt has had an answer — a pick, a fence, a window: takes back the last trim, and with nothing left to take back says so.

## Missing

Project: AutoCAD's projection option (None, Ucs, View) is not offered, and everything is worked out projected on the UCS's XY plane, which is AutoCAD's default, Ucs. A fence cannot be dragged with the cursor yet, only picked point by point. The trim mode and Edge's choice last the session, where AutoCAD keeps them from one session to the next. An object at an angle to the UCS, a spline aside, neither cuts nor is trimmed.

## Questions

### What is the shortcut for TRIM in AutoCAD?

`TR`, then Enter or Space. The full name works too, and `_TRIM` in any language of AutoCAD.

### Why does TRIM delete the whole line?

Because TRIM is in Quick mode, AutoCAD's default since its 2021 release: a pick on an object that no edge crosses deletes it. Choose <Keyword id="mOde" /> and then <Keyword id="Standard" /> to have TRIM leave it and say so instead.

### How do I trim many lines at once?

Pick on an empty spot and pick a second point: every object that fence crosses is trimmed in one step. Or choose <Keyword id="Crossing" /> and draw a window over the pieces to remove.

### How do I extend a line with TRIM?

Hold Shift as you pick the line near the end to extend: it grows to the nearest edge, as with <Command id="EXTEND" />, and the next pick without Shift trims again.
