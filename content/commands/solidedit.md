---
title: "SOLIDEDIT in AutoCAD"
metaTitle: "SOLIDEDIT in AutoCAD: edit 3D solid faces"
description: "How AutoCAD's SOLIDEDIT edits a 3D solid's faces, prompt by prompt: Extrude, Move, Rotate, Offset, Taper, Delete and Copy. Try it free in your browser."
figure: "A box's top face extruded 15 up with a taper of 15 degrees by SOLIDEDIT: a frustum on the box, seen from the south-east."
related: ["PRESSPULL", "FILLETEDGE", "EXTRUDE", "SUBTRACT"]
coverage: "e42a290b8b15"
---

SOLIDEDIT edits a 3D solid by its faces. It says whether each edit is checked, then asks what to edit: <Keyword id="Face" />, then the face option, then the faces, then what the option needs. Each edit is made at once, and the face options are asked again, so one run can make several edits; <Keyword id="eXit" /> or Enter leaves the face options, then the command. A face's neighbours follow it: move a box's top up and its sides grow to meet it.

The solid keeps its layer and properties but loses what made it: a box is no longer a box. The whole run is one undo step, and its <Keyword id="Undo" /> takes back the edits one at a time inside it. Enter at the `Command:` prompt runs it again from the first question. The Solid Editing panel's faces button runs each face option directly. MellowCAD's 3D is solids only, and still partial.

## Options

### Face

The face options. Each asks for faces, until Enter: a click or a point typed takes the face nearest you under it, or the two faces of an edge there, and a face already taken gives the one behind it. Once a face is taken, <Keyword id="ALL" /> takes every face of its solid; <Keyword id="Remove" /> takes faces out of the set instead, and <Keyword id="Undo" /> takes back the last pick. A pick on nothing says <Message id="noSolidsDetected" />. Faces of one solid only.

### Extrude

Asks for a height and a taper angle: each face grows into a prism, added to the solid or, with a negative height, taken out of it, narrowing as it rises by a positive angle. Enter at the height takes the last height the primitives or <Command id="EXTRUDE" /> used.

### Move

Asks for a base point and a second point: a flat face moves as far as that runs along its normal, its neighbours carried with it. Enter at the second point takes the base point as the displacement.

### Rotate

Asks for an axis, by two points or along the UCS's <Keyword id="Xaxis" />, <Keyword id="Yaxis" /> or <Keyword id="Zaxis" />, or square to the screen by <Keyword id="View" />, then an angle: the face turns about it by the right-hand rule.

### Offset

Asks for a distance: the face moves out along its normal, or in with a negative one, its neighbours carried with it, round faces about their axis too. An offset as far in as half the largest side of the box round the solid is refused, and says how far it may go.

### Taper

Asks for a base point, a point along the axis of tapering and an angle: the face leans about where it meets the plane through the base point, a positive angle leaning it in along the axis.

### Delete

Takes away a hole's wall, closing the hole, or a fillet's or a chamfer's strip, giving back the edge it replaced.

### Copy

Makes a region of each flat face, where it lies or moved by two points, on the current layer and with the current properties.

### Undo

At the face options, takes back the last edit of this run; once there is none left, <Message id="commandCompletelyUndone" />.

### eXit

Leaves the face options for the first question, and that question's leaves the command; Enter does the same.

## Missing

<Keyword id="Edge" /> and <Keyword id="Body" />, and the faces' <Keyword id="coLor" /> and <Keyword id="mAterial" />, which are offered and refused, as are Extrude's <Keyword id="Path" />, Rotate's axis by object and its <Keyword id="Reference" /> angle. Crossing, Fence and CPolygon to select faces. Moving, rotating, tapering or copying a curved face, offsetting one among other neighbours, deleting one that is not a hole's wall or a strip, and an edit that changes the solid's shape so much that a face wears another away. Edits beside a face extruded with a taper. An offset too far out to make, which AutoCAD drops in silence and MellowCAD makes. A preview while you give a distance or an angle.

## Questions

### How do I edit a 3D solid in AutoCAD?

Run SOLIDEDIT, choose <Keyword id="Face" /> and then what to do: <Keyword id="Extrude" /> or <Keyword id="Move" /> a face to make the solid taller, <Keyword id="Delete" /> to fill a hole, <Keyword id="Taper" /> to slope a side. Pick the faces, press Enter and answer the option's prompts. For a quick push or pull, <Command id="PRESSPULL" /> drags a face too.

### How do I extrude a face of a 3D solid?

SOLIDEDIT, <Keyword id="Face" />, <Keyword id="Extrude" />, pick the face and press Enter, then the height and the taper angle: the session's `15` and `15` raise a frustum on a box's top.

### How do I remove a hole from a solid?

SOLIDEDIT, <Keyword id="Face" />, <Keyword id="Delete" />, pick the hole's wall and press Enter: the hole is filled. The same takes a fillet or a chamfer away.

### What is the difference between SOLIDEDIT and PRESSPULL?

<Command id="PRESSPULL" /> moves one face by a drag or a distance, square to itself. SOLIDEDIT does that and more: it tapers, turns, offsets, deletes and copies faces, several at once.
