---
title: "UNDO in AutoCAD"
metaTitle: "UNDO in AutoCAD: Mark, Back, U and Ctrl+Z"
description: "How AutoCAD's UNDO works: a number of steps back, Mark and Back, BEgin and End, Control, and how it differs from U and Ctrl+Z. Try it free online."
before: "A plate with two holes and a line across it, drawn by four commands: RECTANG, CIRCLE twice and LINE."
figure: "UNDO 2: the last two commands are taken back, the line and the second hole, and the plate keeps its first hole."
related: ["U", "REDO", "MREDO", "ERASE"]
coverage: "39a615ced84b"
---

UNDO takes back commands. A step is a whole command: everything one LINE drew goes at once, however many segments it had, and so does whatever a command set, such as LTSCALE. UNDO writes its current settings, then asks for the number of operations to undo or an option; Enter takes back one. It writes the names of the commands it took back on one line, `CIRCLE LINE`, and <Message id="everythingUndone" /> when it runs out; after that, <Message id="nothingToUndo" />. A command that changed nothing, such as ID or LIST, is a step too, and so is what ZOOM and PAN did to the view.

<Command id="U" /> is the short form: one step back, no question. Ctrl+Z at the Command prompt runs U; inside a command it is that command's own Undo, as AutoCAD's macro types it: LINE takes back its last segment and goes on. <Command id="REDO" />, right after, puts back what the last U or UNDO took.

## Options

### Auto

Asks <Keyword id="ON" /> or <Keyword id="OFF" />, offering the current setting, which the settings line then shows. In AutoCAD it makes one step of the commands a menu item runs; no menu here runs more than one, so here it joins nothing.

### Control

Asks how much undo to keep, <Keyword id="All" /> by default. <Keyword id="None" /> drops every step kept and turns undo off: U then says <Message id="uDisabled" />, and UNDO asks for Control at once. <Keyword id="One" /> keeps only the last step, and UNDO then asks for 1 or Control. All turns full undo back on. <Keyword id="Combine" /> says whether consecutive ZOOMs and PANs are one step, and <Keyword id="Layer" /> whether consecutive edits in the Layer Properties Manager are, Yes by default for both. The settings are the drawing's, and not saved with it: a new or opened drawing starts at All, Combine Yes and Layer Yes.

### BEgin

Starts a group: the commands run until <Keyword id="End" /> make one step, which U takes back whole and names `GROUP` with them. While a group is open, U, a number and Back stop at its start. BEgin with a group open closes it first.

### End

Closes the group BEgin opened.

### Mark

Leaves a mark in the steps. Back, U and a number stop at it, with <Message id="markEncountered" />.

### Back

Takes back every step to the last mark, and the mark with them. With no mark, it asks whether to undo everything, Yes by default.

## Missing

Auto joins nothing, as no menu here runs more than one command. Combine and Layer last the browser session, where AutoCAD keeps them from one session to the next. The top bar's Undo and Redo buttons write nothing in the history, where AutoCAD's Quick Access Toolbar writes its own. Ctrl+Shift+Z redoes too, silently, though AutoCAD binds nothing to it.

## Questions

### What is the shortcut for UNDO in AutoCAD?

Ctrl+Z, or `U` then Enter: one step back. UNDO has no alias; type it in full for a number of steps or its options, or `_UNDO` in any language of AutoCAD.

### What is the difference between U and UNDO?

<Command id="U" /> takes back the last command and asks nothing. UNDO asks how many to take back, and has Mark and Back to go back to a point you marked, BEgin and End to make several commands one step, and Control to limit undo or turn it off.

### How do I undo several commands at once?

Type `UNDO` and the number of commands, such as `5`. Or choose <Keyword id="Mark" /> before a series you may want to drop, and <Keyword id="Back" /> to go back to it.

### Why is the UNDO command not working?

Undo was turned off with Control <Keyword id="None" />: U says so, and UNDO asks for Control. Answer <Keyword id="All" /> to turn it back on. Steps taken before that are gone.

### How do I redo what I undid?

<Command id="REDO" /> right after U or UNDO puts back the whole of it. Ctrl+Y redoes one step at a time.
