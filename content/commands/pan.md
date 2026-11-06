---
title: "PAN in AutoCAD"
metaTitle: "PAN in AutoCAD: command, shortcut P and -PAN"
description: "How AutoCAD's PAN (P) works: drag the view with the hand cursor or the wheel button, -PAN by two points, and PAN inside another command. Try it free online."
figure: "PAN dragged to the right and down, then Enter: the plate slides in the view, its coordinates unchanged."
related: ["ZOOM", "VIEW", "3DORBIT"]
coverage: "88dc8f54d9c8"
---

PAN slides the view; nothing in the drawing moves. It starts with <Message id="panExit" /> and asks nothing more: the cursor becomes a hand, and dragging with the left button moves the view with it, as often as you like, until Enter or Escape ends it. Without PAN, dragging with the mouse wheel button pans at any time, even in the middle of a command. Each PAN is an undo step, joined with the ZOOMs and PANs around it, so <Command id="U" /> takes the view back. Typed with an apostrophe, `'PAN` or `'P`, it works inside another command, which goes on after it.

<Command id="-PAN" /> pans by two points instead: a base point and a second point, the view moving by the distance between them; or a displacement typed at the first prompt, such as `50,0`, and Enter at the second. It is transparent too, and its own undo step.

## Missing

The shortcut menu AutoCAD shows on a right-click while panning, with Exit, Pan, Zoom, 3D Orbit, Zoom Window, Zoom Original and Zoom Extents.

## Questions

### What is the shortcut for PAN in AutoCAD?

`P`, then Enter or Space. Or no command at all: hold the mouse wheel down and drag. The full name works too, and `_PAN` in any language of AutoCAD.

### How do I pan with the mouse in AutoCAD?

Hold the wheel button down and drag: the view follows the cursor. Roll the wheel to zoom in and out about the cursor. On a trackpad, run PAN and drag with the left button.

### How do I pan while drawing?

Drag with the wheel button, or type `'P` at the command's prompt: the command waits while you pan, then asks again where it was.

### How do I pan by an exact distance?

Use <Command id="-PAN" />: type the displacement, such as `100,0`, and press Enter at the second point. The view moves 100 units along X.
