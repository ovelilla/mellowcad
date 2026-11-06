---
title: "SPLINEDIT in AutoCAD"
metaTitle: "SPLINEDIT in AutoCAD: edit splines, alias SPE"
description: "How AutoCAD's SPLINEDIT (SPE) works: Close, Join, Fit data, Edit vertex, convert to Polyline and Reverse, prompt by prompt. Try it free in your browser."
figure: "A spline through five fit points, closed by SPLINEDIT: a smooth loop through them all."
related: ["SPLINE", "PEDIT", "JOIN", "LIST"]
coverage: "045e0480586f"
---

SPLINEDIT edits a spline. Pick one at `Select spline:`, or select it before the command; double-clicking a spline runs SPLINEDIT on it too. Anything else says <Message id="objectNotSpline" /> and asks again; a polyline fitted by PEDIT's Spline is turned into a spline of the same curve, without a word. Then it asks for an option again and again, each applied at once, until <Keyword id="eXit" /> or Enter. The spline shows its fit points' grips, and while you edit its vertices, its control vertices and frame. The whole edit is one step that <Command id="U" /> takes back. Typed `'ZOOM` works at any of its prompts.

## Options

### Close

Closes the spline smoothly: a fit spline through its fit points, a CV spline on its vertices. On a closed spline the option is <Keyword id="Open" />, and Join is not offered.

### Join

Joins open curves that meet its ends, by JOIN's rules for a spline, and says how many it joined.

### Fit data

Edits the points the spline passes through. A CV spline, which has none, is first given fit points on its curve. Its options: <Keyword id="Add" /> picks a fit point and adds new ones after it, again and again (at an open spline's first point, <Keyword id="After" /> or <Keyword id="Before" />); <Keyword id="Delete" /> removes fit points, down to two, three on a closed spline (<Message id="cannotDeleteBeyond" />); <Keyword id="Move" /> steps through the fit points with <Keyword id="Next" /> and <Keyword id="Previous" />, or <Keyword id="Select point" />, and moves the current one to the point you give; <Keyword id="Purge" /> drops the fit data, leaving a CV spline; <Keyword id="Tangents" /> sets the start and end directions, or <Keyword id="System default" />; <Keyword id="Close" /> and <Keyword id="eXit" /> as at the first prompt. A pick that is no fit point says <Message id="notAFitPoint" />.

### Edit vertex

Edits the control vertices; a fit spline loses its fit data at the first edit. <Keyword id="Add" /> puts a vertex at the point you pick on the spline; <Keyword id="Delete" /> removes one, down to two, three on a closed spline; <Keyword id="Elevate order" /> raises the order, up to 26, never down; <Keyword id="Move" /> moves vertices, stepping as Fit data's Move does; <Keyword id="Weight" /> sets a vertex's weight, after <Message id="splineMadeRational" />, so the curve pulls nearer to it or further away. A pick that is no vertex says <Message id="notAControlVertex" />.

### convert to Polyline

Asks a precision from 0 to 99, 10 by default, and replaces the spline with a polyline of straight segments, more of them the higher the precision; a 3D polyline where the spline does not lie flat, parallel to the XY plane. It ends the command. The precision is kept for the session, and PEDIT's conversion uses it too.

### Reverse

Turns the spline round, its first point last: <Message id="splineReversed" />.

### Undo

Takes back the last option, a whole Fit data or Edit vertex at once. With none left: <Message id="commandCompletelyUndone" />.

### eXit

Ends the command, as Enter does.

## Missing

Kink, which puts a sharp corner at a fit point or vertex; toLerance, which refits the spline within a tolerance; Tangents of a closed spline. convert to Polyline makes far more vertices of a fit spline than AutoCAD does, never arcs, and always replaces the spline. Group at `Select spline:`. The `+` AutoCAD draws on the current point while you step through the points.

## Questions

### What is the shortcut for SPLINEDIT in AutoCAD?

`SPE`, then Enter or Space. The full name works too, and `_SPLINEDIT` in any language of AutoCAD. Double-clicking a spline also runs it.

### How do I convert a spline to a polyline?

Run SPLINEDIT, pick the spline and choose <Keyword id="convert to Polyline" />; a precision of 10 gives a smooth polyline. <Command id="PEDIT" /> on a spline offers to convert it too.

### How do I add or move points on a spline?

Choose <Keyword id="Fit data" /> to work on the points it passes through, then <Keyword id="Add" /> or <Keyword id="Move" />. Choose <Keyword id="Edit vertex" /> to work on the control vertices that frame it.

### How do I close a spline?

Choose <Keyword id="Close" />: it closes smoothly, without a corner where it meets itself. <Keyword id="Open" /> opens it again.

### How do I join two splines?

Choose <Keyword id="Join" /> and select the spline whose end meets this one's, or use <Command id="JOIN" />.
