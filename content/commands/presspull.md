---
title: "PRESSPULL in AutoCAD"
metaTitle: "PRESSPULL in AutoCAD: faces, areas and options"
description: "How AutoCAD's PRESSPULL presses or pulls what you click, prompt by prompt: a closed object, an area inside objects, a solid's face. Try it free in your browser."
figure: "The area between a rectangle and a circle pressed 8 down: a plate with a hole, seen from the south-east in the Hidden visual style."
related: ["EXTRUDE", "SOLIDEDIT", "REGION", "BOX"]
coverage: "c3b44db7a838"
---

PRESSPULL extrudes what you click: a closed object, an area that objects close around the click, or a flat face of a 3D solid. Click, then type the height or move the cursor and click: a positive height pulls, a negative one presses. A closed object or an area becomes a new solid, the one <Command id="EXTRUDE" /> would make, and the objects stay; an area's islands are holes in it, as in the session. A face adds its prism to its solid or takes it out: a box's top pulled makes it taller. The prompt comes back for the next click until Enter, and the whole run is one step that Undo takes back.

Hold Ctrl and the face a click would take lights up; Ctrl+click offsets that face instead, its neighbours carried on to meet it, so a sloping side keeps its slope. As in AutoCAD, PRESSPULL works by clicks: a number or a point typed at its first prompt is answered with <Message id="presspullClick" />, and the prompt is asked again.

## Options

### Multiple

At the height prompt, or the offset distance's: keep clicking to add more — closed objects and areas, or faces of one solid — then press Enter, and one height serves them all. A face clicked after an object or an area is filtered out.

## Missing

A curved face, which AutoCAD offsets too: here the click finds no face. An offset whose neighbouring faces are cones, spheres or tori, or planes and curved faces together, or that would push a face through the one across it: the solid is left as it was. The areas IMPRINT and IMPLIEDFACE make on a face, and Ctrl+Shift+E. An open object, which AutoCAD extrudes into a surface: there are no surfaces yet. While you drag, the preview shows the face's prism or the new solid, not the solid as it will be, and a face lights up only with Ctrl. An area bounded off the UCS's plane is untested.

## Questions

### What is the difference between PRESSPULL and EXTRUDE?

<Command id="EXTRUDE" /> takes closed objects you select, erases them as DELOBJ says, and offers a direction, a taper and an expression. PRESSPULL takes clicks — a closed object, the area inside several objects, or a face of a solid, which it adds to or cuts from that solid — and keeps the objects. From an object, both make the same solid.

### How do I extrude a face of a solid?

Run PRESSPULL, click the face and give the distance: a positive one pulls it out and the solid grows, a negative one presses it in. Hold Ctrl as you click to offset the face instead. Only flat faces so far.

### Why is PRESSPULL not working?

It wants a click on something closed. PRESSPULL answers a number or a point typed at its first prompt, a click on an open object or on a curved face with <Message id="presspullClick" />, and asks again. Click on a closed object, inside an area that objects close in plan, or on a flat face of a solid.

### Is there a shortcut for PRESSPULL?

It has no alias: type PRESSPULL, or `_PRESSPULL` in any language of AutoCAD. Ctrl+Shift+E, AutoCAD's key for it, is not built yet.
