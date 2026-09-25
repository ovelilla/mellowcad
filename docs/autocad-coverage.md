# AutoCAD coverage

What each implemented command actually does, and which documented AutoCAD options it still lacks.
Read the row for a command **before extending it** — the gaps are deliberate and already researched.

This file is not auto-loaded. It has no `applyTo`. Update the affected row when you finish a feature;
do not append a narrative of the work.

Conventions used below: `missing:` lists options that exist in AutoCAD and not here. A parenthetical
gives the reason when the gap is blocked on something else rather than merely unbuilt.

## Draw

| Command                    | Implemented                                                                                                                                                                                                                                      | Missing                                                                                                                                                                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LINE` / `L`               | segments, Close, Undo, Continue (Enter at first-point prompt), polar dynamic input                                                                                                                                                               | —                                                                                                                                                                                                                                                                                                                                     |
| `PLINE` / `PL`             | straight segments, arc segments via bulges (tangent-continuous), open + closed, Continue                                                                                                                                                         | leading-arc direction options (Angle/CEnter/Direction/Radius/Second pt), Halfwidth/Width, Arc-mode CLose (AutoCAD closes with a tangent arc; here Close always closes with a straight segment)                                                                                                                                                                                                                                              |
| `RECTANG` / `REC`          | two-corner closed polyline                                                                                                                                                                                                                       | Chamfer, Fillet, Width, Elevation, Thickness, Area, Dimensions, Rotation                                                                                                                                                                                                                                                              |
| `POLYGON` / `POL`          | edge count, Inscribed / Circumscribed                                                                                                                                                                                                            | Edge option                                                                                                                                                                                                                                                                                                                           |
| `CIRCLE` / `C`             | Center-Radius, Center-Diameter, 2P, 3P                                                                                                                                                                                                           | Ttr (tangent-tangent-radius), Ttt (tangent-tangent-tangent)                                                                                                                                                                                                                                                                           |
| `ARC` / `A`                | 3-point, Start-Center-End, Center-Start-End; CCW storage invariant                                                                                                                                                                               | remaining SCE/SCA/SCL/SEA/SED/SER permutations, Continue                                                                                                                                                                                                                                                                              |
| `ELLIPSE` / `EL`           | Axis-End, Center, Arc (start/end angle + Included angle), Rotation (with AutoCAD's 89.4°–90.6° refusal); DXF model (centre + major-axis vector + ratio + parameters); centre/quadrant/endpoint/nearest snaps; both radii editable in the palette | Isocircle (needs isometric snap), `PELLIPSE` = 1 (polyline approximation), the Parameter mode of the arc prompts, axis grips (only the centre grips), ratio and angles as palette rows, OFFSET / HATCH / boundary / TRIM / EXTEND / BREAK / JOIN / FILLET / DIM on an ellipse, tangent and perpendicular snaps, ellipse intersections |
| `TEXT` / `DTEXT` / `DT`    | single-line text, 13 justifications, text styles table, Style and Justify keywords                                                                                                                                                               | Align and Fit justifications, MTEXT, in-place caret editing, content edit from the palette                                                                                                                                                                                                                                            |
| `HATCH` / `H` / `BH`       | SOLID + ANSI31, Select objects, Pick internal point (boundary tracing, Outer island style), Scale / Angle / pattern name, live preview, single undo, paint order behind the boundary, area hit-test, single grip                                 | the metric pattern file (acadiso.pat defines ANSI31 at 3.175 spacing; the imperial 0.125 is used, so a millimetre drawing needs HPSCALE ≈ 25), chained open-object boundaries, HPGAPTOL, HPASSOC, HPSEPARATE=1, Normal/Ignore island styles, HATCHEDIT/HE, gradients, user-defined patterns + Double, Origin, `-HATCH` draw order/colour/layer/transparency, annotative, the other ~70 predefined patterns                                                                           |
| `BLOCK` / `B` / `-BLOCK`   | name + `?` list, base point, object selection, Convert mode, layer-0 inheritance on insert                                                                                                                                                       | Mode Retain/Delete keywords, "block already exists" redefine prompt                                                                                                                                                                                                                                                                   |
| `INSERT` / `I` / `-INSERT` | name + `?`, insertion point, Scale (uniform), Rotate, mirrored flag                                                                                                                                                                              | Basepoint/Corner/XYZ/Explode/Repeat, non-uniform X/Y/Z scale (the ellipse exists now, but this also needs `InsertEntity.scale` split into X/Y and a per-axis `scaleEntity`), inserting an external drawing + INSUNITS                                                                                                                 |

## Modify

| Command                         | Implemented                                                                                                                | Missing                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `MOVE` / `M`                    | noun-verb and verb-noun, box select, displacement + angle field                                                            | —                                                                                                               |
| `COPY` / `CO`                   | repeated placement (AutoCAD Multiple behaviour)                                                                            | Array option, Undo keyword mid-command                                                                          |
| `ROTATE` / `RO`                 | pivot + angle, Copy, Reference                                                                                             | Reference Points sub-option                                                                                     |
| `SCALE` / `SC`                  | factor, Copy, Reference                                                                                                    | —                                                                                                               |
| `MIRROR` / `MI`                 | two-point axis, erase-source Yes/No prompt                                                                                 | MIRRTEXT                                                                                                        |
| `ARRAYRECT`                     | columns/rows/spacing, live preview                                                                                         | base point, associative arrays                                                                                  |
| `ARRAYPOLAR`                    | item count, fill angle, rotate items                                                                                       | base point, angle-between alternative, associative                                                              |
| `ARRAYPATH`                     | Divide / Measure, Align                                                                                                    | multi-segment polyline path, associative                                                                        |
| `TRIM` / `EXTEND`               | Quick mode over line/circle/arc/polyline (straight and arc segments), Shift to swap mode                                   | Edge, Project, eRase, fence drag                                                                                |
| `OFFSET` / `O`                  | Distance, Through, Multiple, Erase, Layer; line/circle/arc/polyline (straight and arc bulges, with corner joins)           | OFFSETGAPTYPE, ellipses (their parallel curve is a spline, so an ellipse deliberately never highlights)         |
| `FILLET` / `F`                  | two objects, Radius, Polyline (all corners at once), line-arc and arc-arc corners, overrun guard                           | Trim-mode toggle, Multiple                                                                                      |
| `CHAMFER` / `CHA`               | distance chamfer between two lines                                                                                         | Angle, Method, Polyline, Multiple, Trim toggle                                                                  |
| `STRETCH` / `S`                 | crossing-window stretch via `PlacementTool`                                                                                | —                                                                                                               |
| `EXPLODE` / `X`                 | polyline → lines/arcs, block reference → contents (one nesting level), fresh ids, layer-0 reverts to real layer 0          | ByBlock resolution, non-uniform-scale → ellipse conversion                                                      |
| `JOIN` / `J`                    | lines + arcs + polylines merged into one polyline, arcs become bulges                                                      | 2-vertex closed "lens" case, collinear-gap joining                                                              |
| `BREAK` / `BR` / `BREAKATPOINT` | line/arc/circle, `[F]` re-specify first point, CCW circle break                                                            | polylines (EXPLODE first)                                                                                       |
| `MATCHPROP` / `MA`              | layer, colour, linetype, lineweight (clears unset overrides)                                                               | settings dialog to choose which properties to match                                                             |
| `TEXTEDIT` / `ED`               | retype in place, Single/Multiple mode, double-click to edit                                                                | palette content edit, MTEXT and dimension targets                                                               |
| `PURGE` / `PU`                  | unreferenced block definitions, all or by id, undoable, per-block delete in the palette disabled with a reason when in use | layers / text styles / dim styles, the Purge dialog, "one level at a time", Purge Nested Items, unnamed objects |

## Dimensions

| Command                          | Implemented                                                                                                                                                                                   | Missing                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `DIMLINEAR` / `DIMLIN` / `DLI`   | Text, Angle, Horizontal, Vertical, Rotated, object selection (line/arc endpoints, circle diameter, nearest polyline segment), H/V inferred from drag, DIMEXO/DIMEXE offsets                   | Mtext (no MTEXT object)                                                                               |
| `DIMALIGNED` / `DAL`             | Text, Angle, object selection                                                                                                                                                                 | Mtext (no MTEXT object)                                                                               |
| `DIMBASELINE` / `DBA`            | Select, Undo, chains from the first extension-line origin, DIMDLI spacing, inherits kind/rotation/style                                                                                       | DIMASSOC associativity (id-stability cost, deferred), ordinate chaining, angular chaining             |
| `DIMCONTINUE` / `DCO`            | Select, Undo, chains from the second extension-line origin, DIMDLI spacing, inherits kind/rotation/style                                                                                      | DIMASSOC associativity (deferred), ordinate chaining, angular chaining                                |
| `DIMSPACE`                       | Select base dimension, select dimensions to space, numeric value, Auto (2×DIMTXT, DIMSCALE-aware), 0 = line up, per-side ranking, linear + aligned                                            | angular dimensions, "if necessary" collision-only respacing (always respaces, by design)              |
| `DIMRADIUS` / `DIMRAD` / `DRA`   | Text, Angle, arc/circle/polyline-arc-segment selection, DIMCEN centre mark, direction from the picked location                                                                                | Mtext, extension beyond the arc sweep (clamped to the sweep), DIMCEN negative centrelines             |
| `DIMDIAMETER` / `DIMDIA` / `DDI` | Text, Angle, Ø symbol, centre mark, opposite-side stub with arrowhead                                                                                                                         | Mtext, leader landing segment (needs text measurement), DIMTOFL/DIMATFIT, DIMCEN negative centrelines |
| `DIMANGULAR` / `DIMANG` / `DAN`  | arc, circle, line pair and three-point vertex forms; Text, Angle; reflex angle chosen by location; <180° for a line pair; DIMADEC formatting                                                  | Quadrant (deferred), DIMAUNIT, chaining and spacing (see DIMBASELINE/DIMSPACE)                        |
| `DIMSTYLE`                       | style manager, set current, New with Start-With copy and auto-name, rename, delete guarded against in-use/current, edit Lines/Symbols and Arrows/Text/Fit/Primary Units, assign per selection | Override, Compare, "Use For" sub-styles, Description, All/In-use filter                               |
| `STYLE`                          | text-style manager, set current, assign per selection, delete guarded against in-use/current                                                                                                  | font, width factor, oblique angle, DIMTXSTY interaction with DIMTXT                                   |

**DIMSTYLE variables honoured**: DIMTXT, DIMASZ, DIMEXE, DIMEXO, DIMGAP, DIMDEC, DIMSCALE, DIMDLI,
DIMCEN (positive/mark branch), DIMADEC.
**Not modelled**: DIMCEN negative (centrelines), DIMTOFL and DIMATFIT (text-fit logic), DIMASSOC,
DIMCONTINUEMODE (moot with a single style), DIMAUNIT, DIMTXSTY height override, DIMPOST (kept empty).

Aliases for `DIMSTYLE` and `STYLE` are deliberately absent: `D`, `DDIM`, `DIMSTY`, `DST` and `ST`
could not be verified against acad.pgp, and an unverified alias is worse than none.

## View

| Command      | Implemented                                                                                     | Missing                                             |
| ------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `ZOOM` / `Z` | Window (click-click or drag), Extents, All, Previous (bounded history), Scale (nX only), Object | Realtime and Dynamic (mitigated by the mouse wheel) |
| `PAN` / `P`  | left-drag pan, hand cursor, Previous, Escape                                                    | —                                                   |

## Measurement and inquiry

| Command                | Implemented                           | Missing                                                                 |
| ---------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| `DIST` / `MEASUREGEOM` | Distance and Area modes, undo-a-point | pick-an-existing-object modes, Radius, Angle, Volume, typed coordinates |

## Properties and tables

| Feature                   | Implemented                                                                                   | Missing                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Layers                    | colour, visibility, lock, current layer, ByLayer resolution, selection respects hidden/locked | —                                                                                    |
| Linetypes + `LTSCALE`     | 6 patterns, ByLayer and ByObject                                                              | per-object ltscale                                                                   |
| Lineweights + `LWDISPLAY` | 24 standard values, ByLayer and ByObject                                                      | polyline width                                                                       |
| Colour                    | ByLayer and ByObject per-object override                                                      | —                                                                                    |
| Properties palette        | geometry rows per entity type, editable (retype a value), closed-polyline area                | polyline vertex rows, multi-selection editing, Area/Circumference rows, text content |

## Drafting aids

| Feature                   | Implemented                                                                                                                                                         | Missing                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Object snaps              | Endpoint, Midpoint, Center, Node, Quadrant, Intersection, Extension, Perpendicular, Tangent, Nearest, Apparent Intersection, Parallel; AutoCAD's default on/off set | remaining osnaps, per-entity opt-in still required for every new entity type (OSOPTIONS-like, deliberate) |
| Osnap override menu       | Shift + right-click, one-shot override                                                                                                                              | —                                                                                                         |
| `OSNAP` tracking (OTRACK) | acquisition by dwell, alignment guides, precedence over constraints                                                                                                 | —                                                                                                         |
| Polar tracking (F10)      | angle increments, guides, mutually exclusive with Ortho, Shift override                                                                                             | additional angles list, "track using all polar angles"                                                    |
| Ortho (F8)                | constraint with Shift temporary override                                                                                                                            | —                                                                                                         |
| Snap mode (F9)            | grid snap, polar snap                                                                                                                                               | isometric snap, SNAPBASE, SNAPANG, persistence in the file                                                |
| Dynamic input (DYN)       | distance/angle fields, hard-lock on typed values, absolute `#`, relative `@`, `x,y`, `dist<ang`, multi-field forms, keyword prompts                                 | —                                                                                                         |
| Selection cycling         | badge, Shift+Space, selection list box                                                                                                                              | placement options, subobject filtering, type icons in the list, LEGACYCTRLPICK                            |
| Grips                     | move, lengthen, radius, arc end, polyline insert/remove vertex, curvature, multi-select move, magnetism with capture/release hysteresis                             | Ortho/tracking-aware radius and angle drag, insert vertex on an arc segment                               |

## Clipboard and files

| Command                                                    | Implemented                                                                                                                                                                                                         | Missing                                                                                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COPYCLIP` / `CUTCLIP` / `COPYBASE` / `PASTECLIP` / Ctrl+A | all four plus select-all, `Clipboard` port with a session fallback, table reconciliation across drawings (destination name wins), single undo on paste, bounded read timeout, editable-field guard for Ctrl+C/X/V/A | PASTEBLOCK, PASTEORIG, CUTBASE, PASTESPEC/OLE, drag and drop between windows, a Clipboard UI panel, foreign text pasted as MTEXT, listening to the native `paste` event |
| `QSAVE` / `OPEN` (Ctrl+S / Ctrl+O)                         | `FileTransport` port, versioned tolerant JSON, transparent localStorage autosave                                                                                                                                    | File System Access API handles, drag-and-drop open, unsaved-changes prompt                                                                                              |

## Blocks palette

`BLOCKSPALETTE` implements the Current Drawing tab only: thumbnails rendered through the real
`SceneBuilder`, wildcard filter (`?` / `*`), click to INSERT, per-block delete guarded when in use.
Missing: Recent / Favorites / Libraries tabs, drag and drop, context menu, icon/list toggle, and the
Insertion Point / Scale / Uniform Scale / Rotation / Auto-Placement / Repeat Placement / Explode
checkboxes.

## Roadmap

Agreed ordering. The rule behind it: **close model gaps before command gaps**, because every new
entity type multiplies the "Adding an entity type" checklist that a future Z coordinate would force
us to walk again, whereas a command costs the same before or after Z.

1. **Text measurement strategy** (stroke font vs an adapter measurement port), then **MTEXT**.
   Several dimension gaps above are blocked on this.
2. **Block attributes** — ATTDEF plus INSERT prompting for values.
3. **SPLINE** — the largest single remaining feature; its cost does not grow by waiting. The ellipse
   gaps that read "needs a spline" (OFFSET, FILLET) unblock with it.
4. **UCS + ELEVATION/THICKNESS** — the real bridge to 3D. Requires an explicit decision between
   2.5D (elevation + thickness reusing the current entities) and true 3D solids (a separate kernel).

Deferrable indefinitely at no extra cost: PASTEBLOCK/PASTEORIG/CUTBASE, DIMARC, DIMORDINATE, the
modern `DIM` command, POINT with DIVIDE/MEASURE, XLINE/RAY, GROUP, LENGTHEN, ALIGN, per-object
ltscale, isometric drafting mode.

Blocks family, not on the near-term path: ByBlock resolution, non-uniform scale (the ellipse exists
now; what is left is a per-axis scale vocabulary), inserting external drawing files + INSUNITS,
`-BLOCK` Mode keywords, `-INSERT` Basepoint/Corner/XYZ/Explode/Repeat, BASE, WBLOCK, BEDIT, MINSERT,
XREF, BREPLACE, dynamic blocks, DIVIDE/MEASURE with a block, a block table manager.

DXF import/export and plot-to-PDF remain end-of-roadmap and unscheduled.
