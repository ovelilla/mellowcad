# Roadmap

Agreed ordering. The rule behind it: **close model gaps before command gaps**, because every new
entity type multiplies the "Adding an entity type" checklist that a normal per entity would force
us to walk again, whereas a command costs the same before or after it.

1. **Z in the model (2.5D)** — done: Z along the world's Z with the normal fixed at +Z, stored as
   DXF stores it (what each command does with it is in its entry and under "Where a point's Z comes
   from"). 3D solids (ACIS: B-rep, booleans, shading) are off the roadmap: a separate kernel the
   size
   of everything built so far, which neither reuses nor cheapens any of this — a product decision,
   not a debt.
2. **Views and the tilted plane** — done: parallel views from any direction (-VPOINT, `-VIEW`'s
   presets, PLAN, 3DORBIT) that draw elevation and thickness, a normal per entity with its points
   in their OCS (DXF 210), and the tilted UCS the commands work in (X, Y, ZAxis, three points, View,
   OBject, UCSORTHO). It lifted the 2.5D deviations of CIRCLE 3P, ARC and FILLET / CHAMFER of
   sloping lines. Left, each a gap of its own: perspective and the rest of 3D navigation, saved
   views, UCS Face (no solids) and Apply, grips other than move on a tilted object, the Normal rows
   on types other than circle and arc, Intersection between objects in different planes, PROJMODE's
   projection of objects at an angle to the UCS, and JOIN's 3D polyline (it waits for 3DPOLY).
3. **3D usability** — done: the `+Z` / `-Z` guide of Polar, Ortho and OTRACK with a typed length
   along it, the ViewCube (parts, drag, roll, triangles, Home, compass, its two menus, NAVVCUBE)
   the viewport controls' view menu and the navigation bar (Pan, Zoom, Orbit). Left, each a gap of
   its own: perspective,
   the ViewCube Settings dialog and its variables, SteeringWheels and
   ShowMotion, named views, the dynamic UCS (UCSDETECT), UCSFOLLOW, and the tracking label of
   OTRACK.

Left out of the 2.5D model, each a gap of its own: SPLINE 3D (a 3D NURBS kernel) and 3DPOLY, LIST,
the `.X` / `.XY` point filters, OSNAPZ as a variable, ARRAYRECT's Levels, CHPROP, and POINT's
thickness (with POINT, below).

Editing a spline — OFFSET (which is also what the ellipse's OFFSET and FILLET wait for), TRIM /
EXTEND of one an edge reaches (its own knots), BREAK / JOIN, SPLINEDIT — is a command gap, so it
queues behind the model gap above.

Deferrable indefinitely at no extra cost: PASTEBLOCK/PASTEORIG/CUTBASE, DIMARC, DIMORDINATE, the
modern `DIM` command, POINT with DIVIDE/MEASURE, XLINE/RAY, GROUP, LENGTHEN, ALIGN, per-object
ltscale, isometric drafting mode.

Blocks family, not on the near-term path: ByBlock resolution, non-uniform scale (the ellipse exists
now; what is left is a per-axis scale vocabulary), inserting external drawing files + INSUNITS,
`-BLOCK` Mode keywords, `-INSERT` Basepoint/Corner/XYZ/Explode/Repeat, BASE, WBLOCK, BEDIT, MINSERT,
XREF, BREPLACE, dynamic blocks, DIVIDE/MEASURE with a block, a block table manager, ATTSYNC,
BATTMAN, ATTEXT / DATAEXTRACTION, multiline attributes.

DXF import/export and plot-to-PDF remain end-of-roadmap and unscheduled.

## Command reviews

Before more features, every implemented command is reviewed against AutoCAD 2027, one at a time,
with skill `command-review`, in this order. A review **owns** the cross-cutting areas it lists: it
reviews each in full, and the reviews after it cite its plan and check only their own contract
with the area. The order puts first the commands whose review settles what the later ones lean on.

| #   | Review           | Commands                                                                                                                 | Areas it owns                                                                                                                                                                                                                      | State |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | LINE             | LINE; -OSNAP, FROM, SNAP; U, UNDO, REDO, MREDO                                                                           | the catalog sweep (every command), the command line (names, aliases, repeat, Enter, Space, Escape, the right button, transparency, history), point input, object snaps, Ortho, Polar, OTRACK, dynamic input, undo, current properties, grips, the Properties palette, files, render | done  |
| 2   | PLINE            | PLINE                                                                                                                    | the polyline object (widths, bulges), the polyline's arc prompts (DIST's Arc too)                                                                                                                                                  | done  |
| 3   | CIRCLE           | CIRCLE, CIRCLED, CIRCLE2P, CIRCLE3P                                                                                      | the circle object, tangent constructions                                                                                                                                                                                           | done  |
| 4   | ARC              | ARC, ARCSCE, ARCCSE                                                                                                      | the arc object                                                                                                                                                                                                                     | done  |
| 5   | RECTANG, POLYGON | RECTANG, POLYGON                                                                                                         | options kept for the session                                                                                                                                                                                                       | done  |
| 6   | ELLIPSE          | ELLIPSE, ELLIPSEC, ELLIPSEARC                                                                                            | the ellipse object                                                                                                                                                                                                                 | done  |
| 7   | SPLINE           | SPLINE                                                                                                                   | the spline object                                                                                                                                                                                                                  | done  |
| 8   | ERASE            | ERASE; selecting with no command                                                                                         | `Select objects:` and its modes, preselection, selection cycling                                                                                                                                                                   | done  |
| 9   | MOVE, COPY       | MOVE, COPY                                                                                                               | placement (base point, displacement)                                                                                                                                                                                               | done  |
| 10  | Transforms       | ROTATE, SCALE, MIRROR, STRETCH                                                                                           | the Reference options                                                                                                                                                                                                              | done  |
| 11  | OFFSET           | OFFSET                                                                                                                   |                                                                                                                                                                                                                                    | done  |
| 12  | TRIM, EXTEND     | TRIM, EXTEND                                                                                                             | edges and fences                                                                                                                                                                                                                   | done  |
| 13  | Corners          | FILLET, CHAMFER                                                                                                          | corners of lines, arcs and polylines                                                                                                                                                                                               | done  |
| 14  | Pieces           | BREAK, BREAKATPOINT, JOIN, EXPLODE                                                                                       | a single object's pick with modes                                                                                                                                                                                                  |       |
| 15  | Arrays           | ARRAYRECT, ARRAYPOLAR, ARRAYPATH                                                                                         | the array object                                                                                                                                                                                                                   |       |
| 16  | Properties       | LAYER, LAYERCLOSE, COLOR, -COLOR, LINETYPE, -LINETYPE, LTSCALE, LWEIGHT, -LWEIGHT, PROPERTIES, PROPERTIESCLOSE, FILL, MATCHPROP | the style tables (layers, colours, linetypes, lineweights)                                                                                                                                                                         |       |
| 17  | Text             | TEXT, MTEXT, -MTEXT, TEXTEDIT, STYLE                                                                                     | the text objects and their editors                                                                                                                                                                                                 |       |
| 18  | HATCH            | HATCH                                                                                                                    | the hatch object                                                                                                                                                                                                                   |       |
| 19  | Blocks           | BLOCK, INSERT, ATTDEF, -ATTDEF, ATTEDIT, EATTEDIT, ATTDISP, BLOCKSPALETTE, PURGE                                         | blocks and attributes                                                                                                                                                                                                              |       |
| 20  | Dimensions       | DIMLINEAR, DIMALIGNED, DIMBASELINE, DIMCONTINUE, DIMSPACE, DIMRADIUS, DIMDIAMETER, DIMANGULAR, DIMSTYLE                  | the dimension objects and styles                                                                                                                                                                                                   |       |
| 21  | Inquiry          | DIST, AREA, ID                                                                                                           |                                                                                                                                                                                                                                    |       |
| 22  | View             | ZOOM, PAN, -PAN, PLAN, VPOINT, -VPOINT, VIEW, -VIEW, 3DORBIT, NAVVCUBE; the ViewCube, the viewport controls, the navigation bar, the wheel | the view and its undo                                                                                                                                                                                                              |       |
| 23  | UCS              | UCS, UCSICON, ELEV                                                                                                       |                                                                                                                                                                                                                                    |       |
| 24  | Workspace        | UNITS, AUPREC, SETVAR, CLEANSCREENON, CLEANSCREENOFF; the status bar, the top bar, the tool palette, the palette panel, the shortcut menus | system variables typed as commands                                                                                                                                                                                                 |       |
| 25  | Clipboard, files | COPYCLIP, CUTCLIP, COPYBASE, PASTECLIP, NEW, QNEW, QSAVE, SAVEAS, OPEN                                                    |                                                                                                                                                                                                                                    |       |

A review's state is `plan` while its plan runs, and `done` once executed, its plan reduced to an
index (LINE's: `docs/plans/line-review.md`); a command added later takes the place its area gives
it. Transforms found STRETCH's look and zero displacement MOVE's (MOVE-D3, D6 hold) and the
LASTPOINT of its Displacement its own (STR-05: `docs/plans/transforms-review.md`). The Blocks review takes PURGE's report words from ERASE's
(ERA-06: `docs/plans/erase-review.md`). OFFSET's object pick takes a typed point and sets LASTPOINT,
and its prompt offers no Snap Overrides (OFP-01, OFP-03, OFJ-03: `docs/plans/offset-review.md`):
TRIM's, FILLET's and BREAK's picks are checked for the same. TRIM's took typed object snap
overrides at its object pick, the newest of the objects a pick finds (ERASE's pick too, its reach
the drawn pick box) and `1 was on a locked layer.` (TRP-01 to TRP-03: `docs/plans/trim-review.md`):
FILLET's, CHAMFER's and BREAK's picks are checked for the same, and for their refusals said.
FILLET's and CHAMFER's took them too, and no single object's pick takes a locked find any more,
BREAK's included, which says nothing for one yet (CRP-01, CRP-03: `docs/plans/corners-review.md`):
the Pieces review probes BREAK's words, and the Properties review the locked layers' fade and
padlock the corners' desktop showed (d04-4). JOIN reads a window's or a crossing's find newest first, `ssget`'s
order (pieces/p390); every other set keeps the drawing's, which `Select objects:` checks per
command (JNG-05: `docs/plans/pieces-review.md`). A single object's pick tests the newest object
under the pick box, locked or not, and a command passing `locked` says it once per locked object
a pick or a mode finds (BRP-01, BRP-02, BRP-05: FILLET's and BREAK's); UCS OBject's and ARRAYPATH's
pass none and still say nothing of one: the UCS and Arrays reviews probe their words. A point typed
at `Select objects:` or a single object's pick off the screen still finds (BRP-04, pieces/p158):
for the `Select objects:` area. EXPLODE's texts from an MTEXT stand where this layout's metrics put
each line, not where AutoCAD's font does (EXP-06, pieces/p255): for the Text review.
