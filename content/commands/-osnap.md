---
title: "-OSNAP in AutoCAD"
metaTitle: "OSNAP in AutoCAD: object snap modes, F3, -OSNAP"
description: "How AutoCAD's object snaps work: -OSNAP (-OS) sets the running modes, F3 turns them on and off, and END, MID or Shift + right-click force one. Try it free."
figure: "-OSNAP sets Midpoint and Center as the running snaps; LINE then goes from an edge's midpoint to the circle's centre, and the top edge shows its Midpoint marker."
related: ["SNAP", "FROM", "LINE", "ID"]
coverage: "e1d35963d839"
---

Object snaps put a pick exactly on a point of an object: an end, a midpoint, a centre. With object snapping on, the cursor near such a point shows its marker, in green, and its name in a tooltip; a click then lands on that point, not where the cursor is. The running snaps are the modes at work at every point prompt: at first Endpoint, Center, Intersection and Extension, as in AutoCAD. F3 turns object snapping on and off, writing `<Osnap on>` or `<Osnap off>`, and so does the Object snap button on the status bar, whose menu has a check box for each mode. With several snaps under the cursor, the nearest wins, and Tab cycles through the others. Ortho, Polar and snap mode never bend a snapped point.

-OSNAP sets the running snaps at the command line. It lists the modes running now, then asks for a list of modes: each by its capitals, separated with commas, as in `END,MID,CEN`, or `_END,_MID` in any language of AutoCAD. The list replaces the running set and turns object snapping on; <Keyword id="NONe" />, <Keyword id="OFF" /> or Enter alone clears it. A mode it does not know gets <Message id="invalidOsnapModes" />, and the question again. Typed with an apostrophe, `'-OSNAP`, it works inside another command. The running snaps last until the page is reloaded, then they are AutoCAD's four again: like AutoCAD, the drawing does not keep them.

For one point only, override them: type a mode's capitals at a point prompt, `MID` or `_MID`, or hold Shift and right-click to choose it from a menu. That snap alone is looked for, whatever runs, and only for that point; one that finds nothing refuses the point and asks again. Typed by its capitals, <Keyword id="NONe" /> turns snapping off for one point. The same menu offers <Command id="FROM" />: a base point, then an offset from it, so `@10,0` is 10 to its right.

## Options

### ENDpoint

The nearest end of a line, an arc, a polyline segment, an elliptical arc or a spline: a rectangle's corners, a polygon's vertices. Its marker is a square.

### MIDpoint

Halfway along a line, an arc, a polyline segment, an elliptical arc or a spline. A triangle.

### CENter

The centre of a circle, an arc or a polyline's arc. Pass the cursor over the curve itself: at the centre there is nothing to catch. A circle.

### NODe

A point object, the ones <Command id="POINT" />, <Command id="DIVIDE" /> and <Command id="MEASURE" /> make, whatever figure <Command id="PTYPE" /> gives them. Not among the running snaps at first. A circle with a cross.

### QUAdrant

The points of a circle or an arc at 0°, 90°, 180° and 270°, along the UCS's X and Y, and an ellipse's axis ends. A diamond.

### INTersection

Where two objects cross, or where a polar tracking path crosses an object. A cross.

### EXTension

Past the end of a line, an arc or a polyline's straight segment: pass the cursor over the end, then move away along the object's line. A dashed path shows from the end, and a distance typed runs along it. A plus.

### INSertion

The point a text, an attribute definition or a block reference hangs from.

### PERpendicular

The foot of the perpendicular from the last point onto a line, past its ends too, a circle, an arc or a polyline segment. At <Command id="LINE" />'s first point it waits for the next point: the line leaves the object square to it. A right angle.

### TANgent

The point of a circle or an arc where a line from the last point touches it. At <Command id="LINE" />'s first point it waits for the next point: the line leaves the curve tangent to it. A circle with a bar.

### NEArest

The point of an object nearest the cursor. An hourglass.

### APParent

Apparent Intersection: where two objects cross in the view, though they are at different heights; where they truly meet, it is their intersection.

### PARallel

Hold the cursor over a line for a moment, then move along its direction from the last point: a path parallel to the line holds the next point.

### NONe

No running snaps: object snapping finds nothing until a mode is set again.

### OFF

The same as <Keyword id="NONe" />: the running set is cleared.

## Missing

The Drafting Settings dialog that OSNAP and OS open in AutoCAD: here they are unknown commands, and the status bar's menu sets the modes. Geometric Center, as a mode and in the menus. Node on a dimension's definition points and the origin of its text: here it finds point objects only. Mid Between 2 Points, the temporary track point and the keys held down for a one-point snap (Shift + A, Shift + Q…). Intersection, Perpendicular and Tangent on ellipses, Perpendicular and Tangent on splines, and Extension from a polyline's arc end, or with its distance and angle in the tooltip. A Perpendicular or a Tangent that waits for the other point at the start of a command other than <Command id="LINE" /> and <Command id="CIRCLE" />. The aperture and marker settings, APERTURE and AUTOSNAP.

## Questions

### What is the OSNAP command in AutoCAD?

In AutoCAD, OSNAP (`OS`) opens the Drafting Settings dialog at its Object Snap tab, to choose the running snaps. MellowCAD has no such dialog: type `-OSNAP` or `-OS` and a list of modes, or check them in the menu of the status bar's Object snap button.

### What is the shortcut key for object snap?

F3 turns object snapping on and off, as in AutoCAD; the status bar's Object snap button does the same. Shift + right-click at a point prompt opens the menu of one-point snaps.

### Why is object snap not working?

F3 may have turned it off: its status bar button shows it. Or the mode is not running: set it with `-OSNAP` or the button's menu. The cursor has to come within about 10 pixels of the point, and for a centre, over the circle or the arc itself. Snaps only work while a command asks for a point.

### How do I snap to a point just once?

At the point prompt, type the mode's capitals, such as `END` or `TAN`, or choose it from the Shift + right-click menu. It works for that point only, whether that mode runs or not.

### Do the object snap settings stay?

Until the page is reloaded; then they are Endpoint, Center, Intersection and Extension again. AutoCAD does not keep them in the drawing either.
