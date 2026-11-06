---
title: "UCS in AutoCAD"
metaTitle: "UCS in AutoCAD: command, options and World"
description: "How AutoCAD's UCS moves and turns the user coordinate system, prompt by prompt: origin and 3 points, Object, View, X, Y, Z, ZAxis, Named, World. Try it free."
figure: "A box seen from the south-east: UCS moves the origin to its top, and a circle drawn at 30,20 after it lies on the top face, not on the ground."
related: ["PLAN", "3DORBIT", "BOX", "EXTRUDE"]
coverage: "12fe27c4ce91"
---

UCS sets the user coordinate system: an origin and X and Y axes anywhere in space, so its XY plane can tilt. The coordinates you type are read in it, and what you draw lies in its XY plane: with the origin moved to a box's top, a circle centred at `30,20` lies on the top. It first says the current UCS's name — `*WORLD*`, `*NO NAME*` or the name it was saved under — then asks for the new origin or an option; Enter there goes back to World. A point is the origin, with its Z, and a point without a Z lies at the current elevation. Then a point on the positive X axis and a point on the XY plane, read in the current UCS: Enter at either keeps the axes as they are. One point moves the UCS; three turn it any way.

The commands then work in the UCS's XY plane: <Command id="LINE" /> and <Command id="CIRCLE" /> draw on it, and <Command id="BOX" /> and <Command id="EXTRUDE" /> rise from it along its Z. Every object keeps its own plane when the UCS changes, and <Command id="PLAN" /> looks straight down on the current UCS. The UCS is saved in the drawing, and each run is one undo step. MellowCAD's 3D is solids only, and still partial.

## Options

### Face

Listed as AutoCAD 2027 lists it, to align the UCS with a face of a solid. MellowCAD asks for the face, but does not align to one yet: every pick finds none.

### NAmed

Saved UCSs, by name. <Keyword id="Save" /> stores the current one, asking <Keyword id="Yes" /> or <Keyword id="No" /> before it replaces a name already saved; <Keyword id="Restore" /> makes a saved one current, its name typed in any case; <Keyword id="Delete" /> takes names, with commas and wildcards; <Keyword id="?" /> lists them, each with its origin and axes. A name holds spaces, but not `<>/\":;|,=*?` or a backquote: <Message id="invalidUcsName" />.

### OBject

Aligns the UCS with an object you pick: a line, circle, arc, ellipse, polyline, spline, text, multiline text, attribute definition or block reference. The origin and the X axis go where AutoCAD puts them for each kind, and the Z is the object's own normal, so the UCS lies in the object's plane. An object on a locked layer can be picked. A hatch says <Message id="ucsNoCoordinateSystem" />, and UCS ends with the UCS as it was.

### Previous

Goes back to the UCS before, up to ten back in a session, named ones and orthographic ones among them. With none left: <Message id="noPreviousUcs" />.

### View

Turns the XY plane square to your line of sight, X along the screen's horizontal, keeping the origin: text drawn after it reads flat on the screen of a 3D view.

### World

Back to the world coordinate system, which never moves. It is the first prompt's default, so Enter there chooses it, and it sets the elevation back to 0 too.

### X

Turns the UCS about its X axis: 90 degrees by default, an angle typed, or a point that gives it. A positive angle turns it by the right-hand rule, so 90 stands the XY plane up on the old X axis.

### Y

Turns the UCS about its Y axis, as <Keyword id="X" /> does about X.

### Z

Turns the UCS about its Z axis, as <Keyword id="X" /> does about X: 30 turns X and Y 30 degrees counter-clockwise, seen from above.

### ZAxis

A new origin, Enter keeping the current one, then a point on the positive Z axis: the XY plane stands square to it, its X kept level with the world's XY plane. Two points that are one say <Message id="pointsAreCoincident" />. Its <Keyword id="Object" /> takes a line, an arc, an open polyline or a spline: the origin at the end nearest the pick, Z along it pointing away.

## Missing

<Keyword id="Face" />, which aligns the UCS with a solid's face: it asks for one but finds none yet. Apply and SEction, listed at the first prompt and refused here, since there is one viewport and there are no section objects. The UCS dialog (UCSMAN), the icon's grips and its right-click menu, and the icon showing the new UCS while you place it. The crosshair turning with the UCS: it stays upright on screen until <Command id="PLAN" /> lines the view up with it. UCSFOLLOW, UCSVP and the dynamic UCS. <Keyword id="OBject" /> on a dimension, and Group at its pick. The depth an orthographic UCS keeps. The pause, Press ENTER to continue, in a long list.

## Questions

### How do I reset the UCS to World in AutoCAD?

Run UCS and press Enter: <Keyword id="World" /> is the default. To look straight down on the drawing again, run <Command id="PLAN" /> and choose <Keyword command="PLAN" id="World" />.

### How do I rotate the UCS?

Run UCS, choose <Keyword id="Z" /> and type the angle: `30` turns X and Y 30 degrees counter-clockwise. <Keyword id="X" /> and <Keyword id="Y" /> tilt the XY plane up, 90 degrees by default.

### What is the difference between the UCS and the WCS?

The world coordinate system (WCS) never moves; the user coordinate system (UCS) is the one you move and turn. At the start they are the same, and UCS says the current one is `*WORLD*`. Coordinates you type are read in the UCS, and what you draw lies in its XY plane.

### How do I draw on a face of a 3D solid?

Move the UCS onto it. On a box's top, its origin alone is enough: UCS, then a corner of the top, then Enter, as the session does. For a side, give three points: the origin at a corner, a point along an edge for X, and one more on the face for Y. Then draw: what you draw lies on the face.
