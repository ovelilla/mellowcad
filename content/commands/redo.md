---
title: "REDO in AutoCAD"
metaTitle: "REDO in AutoCAD: command, Ctrl+Y and MREDO"
description: "How AutoCAD's REDO works: it puts back what the last U or UNDO took, right after it; MREDO and Ctrl+Y redo step by step. Try it free in your browser."
figure: "A hole drawn in a plate, taken back with U and put back with REDO."
related: ["UNDO", "U", "MREDO"]
coverage: "39a615ced84b"
---

REDO reverses the last <Command id="U" /> or <Command id="UNDO" />: what it took back is drawn again, all of it, so after an UNDO of five commands REDO puts back the five. It writes the commands' names as it does, then <Message id="everythingRedone" /> once nothing is left to redo. It asks nothing and has no options.

It works only right after the undo. Anywhere else it says <Message id="redoMustFollowUndo" />, and once another command has run, even one that changes nothing such as LIST or ZOOM, <Message id="nothingToRedo" />. With undo turned off by UNDO's Control None, REDO says it is disabled.

<Command id="MREDO" /> redoes step by step: it asks for a number of actions, or <Keyword command="MREDO" id="All" /> or <Keyword command="MREDO" id="Last" />, and redoes that many of the steps the undos took back, whatever U, UNDO and REDO ran since; Last is the whole of the last undo, once (<Message id="alreadyRedone" />). Ctrl+Y and the shortcut menu's Redo run MREDO with 1, cancelling the command that is running.

## Missing

Ctrl+Shift+Z redoes too, silently, though AutoCAD binds nothing to it. The top bar's Undo and Redo buttons write nothing in the history, where AutoCAD's Quick Access Toolbar writes its own.

## Questions

### What is the shortcut for REDO in AutoCAD?

Ctrl+Y, which redoes one step (MREDO 1). REDO itself has no alias: type `REDO`, or `_REDO` in any language of AutoCAD.

### Why does REDO not work?

REDO only reverses the U or UNDO just before it. After any other command there is nothing to redo, even if it changed nothing: undo, then redo at once.

### What is the difference between REDO and MREDO?

REDO puts back the whole of the last undo, and only right after it. <Command id="MREDO" /> redoes a number of the steps taken back, one by one, or all of them, and still works after a REDO.

### How do I repeat the last command in AutoCAD?

Press Enter or Space at the Command prompt: the last command starts again. REDO does not repeat a command; it reverses an undo.
