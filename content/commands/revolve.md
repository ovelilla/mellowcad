---
title: "REVOLVE in AutoCAD"
metaTitle: "REVOLVE in AutoCAD: command, axis and alias"
description: "How AutoCAD's REVOLVE (REV) turns a 2D profile round an axis into a 3D solid, prompt by prompt: the axis, Object, X, Y, Z. Try it free in your browser."
figure: "A flanged profile turned a whole turn round the Y axis: a spool, seen from the south-east in the Hidden visual style."
related: ["EXTRUDE", "PRESSPULL", "REGION", "UNION"]
coverage: "4fa97ff5892e"
---

REVOLVE turns closed 2D profiles round an axis into 3D solids: a rectangle with an edge on the axis makes a cylinder, a circle beside it a ring. Select the profiles — circles, ellipses, closed polylines or splines, regions — and press Enter; give the axis by two points or by one of its options, then the angle, Enter taking a whole turn. Each profile becomes a solid on the current layer and is erased, as DELOBJ says by default. The whole command is one step that Undo takes back.

The axis lies in the profile's plane, with the whole profile on one side of it, or the command ends with <Message id="revolveOneSide" /> before any angle is asked. The angle turns by the right-hand rule about the axis, from its first point to its second; a negative one turns the other way. MellowCAD's 3D is solids only, and still partial: open profiles, which AutoCAD turns into surfaces, are refused.

## Options

### MOde

Asks for <Keyword id="SOlid" /> or <Keyword id="SUrface" />, as <Command id="EXTRUDE" /> does: with no surface objects yet, only <Keyword id="SOlid" />, the default, is taken.

### Object

The axis prompt's default, so Enter chooses it: pick a line, a polyline, an arc or a spline, and the axis runs straight between its two ends, from the end nearer your pick. A closed object has no ends: <Message id="revolveClosedAxis" />, and the command ends.

### X

The UCS's X axis, through its origin.

### Y

The UCS's Y axis, through its origin: a profile drawn to the right of it, as in the session, turns into a part lying along Y.

### Z

The UCS's Z axis, through its origin. A profile on the UCS's XY plane is square to it, so REVOLVE answers <Message id="revolvePerpendicular" /> and ends: Z is for a profile that stands upright.

### STart

At the angle prompt: the angle to start from, its default always 0. The profile is turned there first, then the angle is asked again.

### Reverse

Turns the axis round, so the angle runs the other way, and asks the angle again.

### EXpression

The angle as an arithmetic expression, as in <Command id="EXTRUDE" />.

## Missing

An axis off the profile's plane, which AutoCAD turns the profile round into surfaces: here REVOLVE says <Message id="revolveUnable" /> and ends. An elliptical arc or an edge of a solid as the Object axis. SUrface mode and open profiles, with no surface objects yet. The preview turning with the cursor: while you give the angle, the whole turn is shown. <Command id="EXPLODE" /> of a revolved solid, which AutoCAD turns into surfaces and regions. Its grips, and its angle edited in the Properties palette.

## Questions

### What is the shortcut for REVOLVE in AutoCAD?

`REV`, then Enter or Space. The full name works too, and `_REVOLVE` in any language of AutoCAD.

### How do I revolve a profile around an axis?

Draw half the section as one closed object beside the axis line, a closed polyline or a region. Run REVOLVE, select the profile and press Enter; press Enter again for <Keyword id="Object" /> and pick the axis line, or give its two ends; then Enter for a whole turn.

### Why is REVOLVE not working?

Most often the axis crosses the profile: REVOLVE says <Message id="revolveOneSide" /> and ends. Move the axis to the profile's edge or beyond it; an edge lying on the axis is allowed. An axis square to the profile's plane gets <Message id="revolvePerpendicular" />, and an open profile is refused, as MellowCAD has no surfaces yet.

### How do I revolve only part of a turn?

Type the angle, 90 or 270, at the angle prompt. <Keyword id="STart" /> starts the turn further round, and <Keyword id="Reverse" /> turns it the other way.
