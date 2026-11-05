---
title: "ARRAYPATH in AutoCAD"
metaTitle: "Path array in AutoCAD: ARRAYPATH command"
description: "How AutoCAD's ARRAYPATH works, prompt by prompt: the path curve, Measure or Divide, the items and their alignment. Try it free in your browser."
figure: "A small square at the start of an arc, arrayed along it: Divide, 7 items, each turned with the arc."
related: ["ARRAY", "ARRAYRECT", "ARRAYPOLAR", "PLINE"]
coverage: "be7e31ed7899"
---

ARRAYPATH copies a selection along a path, a line, an arc, a circle or a polyline, as one array object. It asks for the objects, says the type and whether the array is associative, asks for the path curve and shows the array at once: the items one and a half times the selection's size apart, as many as fit along the path, each turned as the path turns. An open path runs from the end nearer your pick, a circle counter-clockwise from its angle 0. Then one prompt edits the array live until Enter makes it, through its options or the preview's grips, as in AutoCAD. The objects selected stay where they are, as its first item.

## Options

### ASsociative

<Keyword id="Yes" />, the default, makes one array object, which its grips and the Properties palette change later; <Keyword id="No" /> makes separate copies beside the objects selected. The answer is kept for the session, by ARRAYRECT and ARRAYPOLAR too.

### Method

<Keyword id="Measure" />, the default, sets the items a distance apart, as many as fit; <Keyword id="Divide" /> spreads a number of items evenly over the whole path, one at each end of an open path.

### Items

By Divide, the number of items. By Measure, the distance between them, then how many, up to the most that fit, which it says; <Keyword id="Fill entire path" /> takes them all.

### Align items

<Keyword id="Yes" />, the default, turns each item as the path turns from its start; <Keyword id="No" /> only moves it along.

### eXit

Makes the array and ends the command, as Enter does.

## Missing

The array does not follow its path: edit the path later and the array keeps the one it was made on. Splines, ellipses and 3D polylines cannot be paths yet, nor a path out of the UCS's plane. Base point, Tangent direction, Rows, Levels, Z direction and Expression are not offered, nor a group at the path prompt, and the array's grips have no menus.

## Questions

### How do I array objects along a curve?

Type `ARRAYPATH`, select the objects, press Enter and pick the path near the end to start from; or type `AR` for <Command id="ARRAY" /> and choose <Keyword command="ARRAY" id="PAth" /> after the objects. Then set the spacing or the number of items, and press Enter to make it.

### Why doesn't my path array follow the path?

Here an array keeps the path as it was when the array was made: move or stretch the path later and the array stays as it is, where AutoCAD's associative path array would follow it. Erasing the path leaves the array too. If the items do not turn with the path, choose <Keyword id="Align items" /> and answer <Keyword id="Yes" />.

### How do I change the direction of a path array?

Pick the path near its other end: an open path runs from the end nearer the pick. A circle always runs counter-clockwise from its angle 0.

### How do I space items evenly along the whole path?

Choose <Keyword id="Method" />, then <Keyword id="Divide" />, then <Keyword id="Items" /> and type how many: they are spread evenly, the first and the last at the ends of an open path.
