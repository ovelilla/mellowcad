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
   projection of objects at an angle to the UCS, and JOIN's 3D polyline.
3. **3D usability** — done: the `+Z` / `-Z` guide of Polar, Ortho and OTRACK with a typed length
   along it, the ViewCube (parts, drag, roll, triangles, Home, compass, its two menus, NAVVCUBE)
   the viewport controls' view menu and the navigation bar (Pan, Zoom, Orbit). Left, each a gap of
   its own: perspective,
   the ViewCube Settings dialog and its variables, SteeringWheels and
   ShowMotion, named views, the dynamic UCS (UCSDETECT), UCSFOLLOW, and the tracking label of
   OTRACK.

Left out of the 2.5D model, each a gap of its own: LIST, the `.X` / `.XY` point filters, OSNAPZ as
a variable, ARRAYRECT's Levels, CHPROP, and POINT's thickness (with POINT, below). 3DPOLY and SPLINE
3D are done: the objects whose stored points carry their Z (`draw.md`), a spline kept in its own
plane when it has one; trimming a 3D polyline, JOIN into one and PEDIT Spline are its own gaps.

Editing a spline is done in its three deliveries: the spline the model's, in space and on knots,
control points and weights of its own (DXF 40 / 10 / 41), as AutoCAD 2027 leaves TRIM's, BREAK's
and SPLINEDIT's pieces (probes spline-knots/k01–k16, draw.md's SPLINE); BREAK and TRIM / EXTEND
of a spline, by knot insertion (k01–k37, modify.md's TRIM and BREAK); OFFSET of a spline and of an
ellipse, an approximation within AutoCAD's 0.001 (k38–k56, modify.md's OFFSET); FILLET of an
ellipse, an elliptical arc or a spline, its centre on the curve's exact offset (corners/p389–p482,
modify.md's FILLET); JOIN of splines and elliptical arcs, each object a curve on its own parameter
joined end to end, and an elliptical arc's or a spline's single source with cLose
(pieces/p396–p440, modify.md's JOIN). Left: SPLINEDIT, a command gap.

Deferrable indefinitely at no extra cost: PASTEBLOCK/PASTEORIG/CUTBASE, DIMARC, DIMORDINATE, the
modern `DIM` command, POINT with DIVIDE/MEASURE, XLINE/RAY, GROUP, LENGTHEN, ALIGN, per-object
ltscale, isometric drafting mode.

Blocks family, not on the near-term path: ByBlock resolution, inserting external drawing files +
INSUNITS,
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
| 14  | Pieces           | BREAK, BREAKATPOINT, JOIN, EXPLODE                                                                                       | a single object's pick with modes                                                                                                                                                                                                  | done  |
| 15  | Arrays           | ARRAYRECT, ARRAYPOLAR, ARRAYPATH                                                                                         | the array object                                                                                                                                                                                                                   | done  |
| 16  | Properties       | LAYER, LAYERCLOSE, COLOR, -COLOR, LINETYPE, -LINETYPE, LTSCALE, LWEIGHT, -LWEIGHT, PROPERTIES, PROPERTIESCLOSE, FILL, MATCHPROP | the style tables (layers, colours, linetypes, lineweights)                                                                                                                                                                         | done  |
| 17  | Text             | TEXT, MTEXT, -MTEXT, TEXTEDIT, STYLE                                                                                     | the text objects and their editors                                                                                                                                                                                                 | done  |
| 18  | HATCH            | HATCH                                                                                                                    | the hatch object                                                                                                                                                                                                                   | done  |
| 19  | Blocks           | BLOCK, INSERT, ATTDEF, -ATTDEF, ATTEDIT, EATTEDIT, ATTDISP, BLOCKSPALETTE, PURGE                                         | blocks and attributes                                                                                                                                                                                                              | done  |
| 20  | Dimensions       | DIMLINEAR, DIMALIGNED, DIMBASELINE, DIMCONTINUE, DIMSPACE, DIMRADIUS, DIMDIAMETER, DIMANGULAR, DIMSTYLE                  | the dimension objects and styles                                                                                                                                                                                                   | done  |
| 21  | Inquiry          | DIST, AREA, ID                                                                                                           |                                                                                                                                                                                                                                    | done  |
| 22  | View             | ZOOM, PAN, -PAN, PLAN, VPOINT, -VPOINT, VIEW, -VIEW, 3DORBIT, NAVVCUBE; the ViewCube, the viewport controls, the navigation bar, the wheel | the view and its undo                                                                                                                                                                                                              | done  |
| 23  | UCS              | UCS, UCSICON, ELEV                                                                                                       |                                                                                                                                                                                                                                    | done  |
| 24  | Workspace        | UNITS, AUPREC, SETVAR, CLEANSCREENON, CLEANSCREENOFF; the status bar, the top bar, the tool palette, the palette panel, the shortcut menus | system variables typed as commands                                                                                                                                                                                                 | done  |
| 25  | Clipboard, files | COPYCLIP, CUTCLIP, COPYBASE, PASTECLIP, NEW, QNEW, QSAVE, SAVEAS, OPEN                                                    |                                                                                                                                                                                                                                    | done  |

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
the Pieces review probes BREAK's words; the Properties review drew the locked layers' fade and
padlock at `Command:` (LKD-02), at the commands' prompts they are still missing. JOIN reads a window's or a crossing's find newest first, `ssget`'s
order (pieces/p390); every other set keeps the drawing's, which `Select objects:` checks per
command (JNG-05: `docs/plans/pieces-review.md`). A single object's pick tests the newest object
under the pick box, locked or not, and a command passing `locked` says it once per locked object
a pick or a mode finds (BRP-01, BRP-02, BRP-05: FILLET's and BREAK's; ARRAYPATH's counted
`1 was on a locked layer.`, APA-03); UCS OBject's takes them, picked or found, in silence, and
ZAxis Object's refuses them in BREAK's words (UCB-01, UCB-02: `docs/plans/ucs-review.md`). A point typed
at `Select objects:` or a single object's pick off the screen still finds (BRP-04, pieces/p158):
for the `Select objects:` area. EXPLODE's texts from an MTEXT now stand where AutoCAD's do, MTEXT laid out by
ink (EXP-06 closed by TXO-03: `docs/plans/text-review.md`); ATTDEF's Current line still writes es
`SIZ` where TEXT's writes `SI` (TXT-08), and attributes share TEXT's layout: for the Blocks review.
The Styles palette stands in for AutoCAD's Text Style and Dimension Style dialogs (TEXT-D58), and
TEXTSIZE, TEXTSTYLE and the DIMxxx variables (which AutoCAD makes dimension overrides, DSY-04,
dimensions/p06: `docs/plans/dimensions-review.md`) are not typable: for the Workspace review.
The anonymous
blocks' purge on save and a block reference's grips, for the Blocks review. Objects on a locked
layer are selected at `Command:`, edits refuse them and a command given them as a preselection
says `1 was on a locked layer.` (LKD-01: `docs/plans/properties-review.md`); 2027's -BLOCK converts
what it takes into a reference by default (`Object conversion=Convert`, properties/p380), and a
layer a block definition uses cannot be deleted (LAY-02): for the Blocks review, BLOCK's and
PURGE's sides. LWDISPLAY, LAYLOCKFADECTL, CECOLOR, CELTYPE and CELWEIGHT typed as variables: for
the Workspace review (SETVAR). A hatch inside a block, mirrored with its reference, reflects its
pattern (HATCH-D75, built by the Blocks review: BOB-01, BOB-02), and LIST of a hatch has its words
in hatch/p320 and p369, for whoever builds LIST (INQUIRY-D1); HPNAME, HPSCALE, HPANG and HPORIGIN typed as variables, for the Workspace review
(`docs/plans/hatch-review.md`). The Blocks review settled what was left for it
above (`docs/plans/blocks-review.md`); it leaves ATTDIA, ATTREQ, AFLAGS, ATTMODE and INSNAME typed
as variables to the Workspace review, LIST of a block reference and its attributes to whoever builds
LIST (INQUIRY-D1: `docs/plans/inquiry-review.md`, which closed the circle review's COB-03), and the Edit Attributes dialog's stand-in (ATTEDIT's box, BLOCKS-D90) to whichever review
builds a dialog for it. The Dimensions review (`docs/plans/dimensions-review.md`) leaves angular
chaining, dimension overrides and the Dimension Style Manager in `dimensions.md`'s Missing. The Inquiry
review leaves the rail's other apostrophe macros (ATTDISP's, MATCHPROP's: `transparentMacro`) to
the Workspace review. The View review (`docs/plans/view-review.md`) left UCS Restore's not-found
words (`ucsUndefined`) and the `*TOP*` name after U to the UCS review, which settled them (UCS-D39,
UCS-D43), and leaves AutoCAD's `<command> GROUP` undo names for the other toolbar and menu buttons
to the Workspace review. The UCS review (`docs/plans/ucs-review.md`) leaves the landing's own UCS
icon (`components/marketing/ucs-icon.tsx`, still the 2D colours) to the landing, and to the
Workspace review the other chrome menus' echo (2027's ViewCube menu writes its prompts without the
answers, UCD-07) and every name prompt that may hold spaces (`takesSpaces`, UCD-05). The Workspace review
(`docs/plans/workspace-review.md`) settled the variables typed by name and SETVAR, those the
reviews before it left (the DIMxxx stay Missing: typed they make an override), and the rail's
apostrophe macros, and on the desktop (WSD) the `<command> GROUP` undo names, the chrome menus'
echo, the drafting toggles' echo and undo, MATCHPROP's button and the name prompts with spaces;
it leaves the Default menu's Undo labels, Ctrl+9's confirmation and the ribbon's Move during a grip
edit in Missing (`workspace.md`, `command-line.md`, `drafting-aids.md`). The Clipboard review
(`docs/plans/clipboard-review.md`), the last, found the console's PASTECLIP to be its text paste:
what an object paste takes, lands on and leaves selected is the desktop's (CFD); it leaves
PASTECLIP's INSERT keywords, foreign text pasted as MTEXT and PASTEBLOCK / CUTBASE in
`clipboard-and-files.md`'s Missing.
