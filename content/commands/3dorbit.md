---
title: "3DORBIT in AutoCAD"
metaTitle: "3DORBIT in AutoCAD: 3D orbit and its shortcut"
description: "How AutoCAD's 3D orbit (3DORBIT, 3DO, ORBIT) turns the view as you drag, how to leave it, orbit with Shift and the wheel, and get back to plan. Try it free."
figure: "A box first seen in plan: 3DORBIT, a drag across and down, then Enter, and the box is seen from above its front corner."
related: ["VSCURRENT", "VIEW", "PLAN", "ZOOM"]
coverage: "a71091de5a66"
---

3DORBIT turns the view round the drawing as you drag; nothing in the drawing moves or changes. Dragging across turns the camera about the world's Z axis, dragging up and down raises or lowers it, round the middle of the drawing under the centre of the screen, in parallel projection. It starts by saying how to leave it: while it runs you can only orbit, and Enter or Escape ends it, dragged or not.

Holding Shift and the wheel button orbits from anywhere, even inside another command, and the Orbit button on the navigation bar runs it too. Typed with an apostrophe, `'3DORBIT`, it works inside another command, which goes on after it. Each drag is a step for <Command id="ZOOM" />'s <Keyword command="ZOOM" id="Previous" />, and the whole run is one undo step, so <Command id="U" /> puts the view back. To see the solids as solids, not as wires, use <Command id="VSCURRENT" />; MellowCAD's 3D is solids only, and still partial.

## Missing

The right-click menu, with its projections, visual styles and other navigation modes. Orbiting about the selected objects only. Perspective. 3DFORBIT, 3DCORBIT and the rest of AutoCAD's 3D navigation.

## Questions

### What is the shortcut for 3D orbit in AutoCAD?

`3DO` or `ORBIT`, then Enter or Space. Without typing anything, hold Shift and the wheel button and drag.

### How do I orbit with the mouse?

Hold Shift, press the wheel button and drag: across to turn the model round, up and down to look at it from higher or lower. Let go and you are back in the command you were in.

### How do I exit 3D orbit?

Press Enter or Escape. The view stays where you left it.

### How do I get back to the plan view after orbiting?

Run <Command id="PLAN" /> and press Enter, or <Command id="-VIEW" /> and <Keyword command="VIEW" id="Top" />, or click the top of the ViewCube. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> steps back one drag at a time.
