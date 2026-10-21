# Drafting aids

### Object snaps

**Implemented:** Endpoint, Midpoint, Center, Quadrant, Intersection, Extension, Insertion,
Perpendicular, Tangent, Nearest, Apparent Intersection, Parallel; AutoCAD's running set (OSMODE
4133: Endpoint, Center, Intersection, Extension); the snap nearest the cursor wins ("a point closest
to the center of the aperture box"): a point under the aperture, then the one already held (the
magnet), then Extension or Parallel, then Nearest, then Center, Perpendicular or Tangent of any
object the aperture crosses, however far (the centre from the rim: "the cursor must pass over the
circumference"), and under an override any snap of the object picked — the crosshair stays on the
pointer then, and the marker and the rubber band go to the point; Tab cycles through the snaps under
the cursor; a snap is never bent by Ortho or Polar ("Ortho is ignored when you … specify an object
snap"); Intersection and Apparent Intersection find where an engaged polar path crosses an object
("to find where a polar alignment path intersects another object"), and an OTRACK guide or an
Extension the cursor follows (**unverified**: the help names the polar path only), never the rubber
band; Extension prolongs a line, an arc or an open polyline's straight end from an end the cursor
passed over (the + marker, OTRACK off too), dashed from that end, a typed distance running along it
from the end; running Apparent Intersection is the visual crossing of two objects at different
heights; Perpendicular to lines (past their ends), circles, arcs and polyline segments; Tangent to
circles, arcs and polyline arcs; Center and Quadrant of polyline arcs; the tooltip above the cursor
— WHY: the dynamic-input box sits below and to the right of it

**Missing:** Node and Geometric Center (no POINT object; a dimension's definition points snap as
Endpoint), deferred Perpendicular and Tangent at the first point of a command other than LINE,
Perpendicular and Tangent on ellipses and splines, extended Intersection and extended Apparent
Intersection (picked object by object, as an override), Extension from a polyline's arc end, the
tooltip's distance and angle (`Extension: 12.00 < 0°`), per-entity opt-in still required for every
new entity type (OSOPTIONS-like, deliberate), Intersection between objects in different planes

### Object snap overrides

**Implemented:** Shift + right-click at a point prompt (on the press), one-shot override: FROM
(Enter at `<Offset>` takes the base point, **unverified**) and the object snaps, the same entries as
the Command menu's Snap Overrides; typed at any point prompt, in the box or at the command line, by
-OSNAP's words (END, MID, CEN, QUA, INT, EXT, INS, PER, TAN, NEA, APP, PAR, NON; es FIN, MED, CEN,
CUA, INT, EXT, INS, PER, TAN, CER, APP, PAR, NIN) or `_` and the global word in any language, read
before the prompt's keywords (`CEN` at PLINE's arc prompt is the snap, not `CEnter`), as AutoCAD
2023's console reads them; FROM typed into the box too

**Missing:** M2P / MTP, TT (the temporary tracking point), the `of` echo after an override
(`_mid of`), the temporary override keys (Shift+A, Shift+Q, Shift+E…: TEMPOVERRIDES)

### `-OSNAP` / `-OS` · es `-REFENT`

**Implemented:** `Current osnap modes: End,Cen,Int,Ext` (`None` when empty), then
`Enter list of object snap modes:` — modes by their capitals, separated with commas (es Spanish's,
from 2026's -REFENT page, CF5780AD), replacing the running set and turning object snapping on; NONe
or OFF (es NINguno, DES) clears it, Enter keeps it, an unknown mode says
`Invalid object snap modes.` and asks again (es `Modos refent actuales: …`,
`Indique lista de modo de referencia a objetos`, `Modos no válidos de referencia a objetos.`)

**Missing:** OSNAP / OS (the Drafting Settings dialog; the status bar's Object snap menu stands in),
GCEnter and NODe in the list, a Spanish alias (none verified)

### `OSNAP` tracking (OTRACK)

**Implemented:** acquisition by dwell on a snap under the aperture, up to seven points ("you can
acquire up to seven tracking points"), orthogonal guides along the UCS's axes whatever Polar's
increment ("By default, object snap tracking is set to orthogonal"), the crossing of two paths
(guides, Extensions, the Ortho / Polar line) winning over a snap that slides along one of them
(Extension, Parallel, Nearest); precedence over constraints; in a 3D view each acquired point's `+Z`
/ `-Z` guide too (**unverified** that AutoCAD offers it: the help names it for POLARMODE, which also
governs OTRACK), measured on the screen, a crossing with it taken where it is drawn, on the Z guide,
and a typed offset running up it; off the plan every guide is measured where it is drawn, at its
point's height, and two guides cross where they are drawn crossing, on the first

**Missing:** the label of the tracking path (none here, in plan either), tracking with every polar
angle (POLARMODE), a typed distance along a guide at a later point measured from the acquired point
("use direct distance … along alignment paths from the acquired object snap point": only LINE's
first point does), Shift to avoid acquiring, Perpendicular or Tangent tracked from the last point

### Polar tracking (F10)

**Implemented:** angle increments from the UCS X axis (the status bar's menu offers POLARANG's 90,
60, 45, 30, 22.5, 18, 15, 10 and 5, and choosing one turns Polar on), guides, mutually exclusive
with Ortho, Shift override; in a 3D view the `+Z` / `-Z` guide along the UCS's Z, engaged within the
same 12 px measured on the screen, the guide drawn nearer the cursor winning against a polar angle,
the Z on a tie (**unverified** rule); readout `Polar: 50.00mm < +Z` (**unverified** wording)

**Missing:** additional angles list, "track using all polar angles", POLARMODE and TRACKPATH as
variables, the plane's angles measured in plan off the plan

### Ortho (F8)

**Implemented:** constraint to the UCS's axes; Shift held toggles it ("To turn Ortho off
temporarily, hold down the Shift key"; with it off, on), Polar yielding; in a 3D view its Z as a
third axis, the one drawn nearest the cursor winning (**unverified**: AutoCAD does not publish the
rule)

### Snap mode (F9)

**Implemented:** grid snap on the UCS (from its origin, along its axes), polar snap; on the `+Z` /
`-Z` guide PolarSnap rounds the height and the grid leaves it (**unverified**)

**Missing:** isometric snap, SNAPBASE, SNAPANG, persistence in the file

### Dynamic input (DYN)

**Implemented:** distance/angle fields, hard-lock on typed values, keys typed on the drawing going
into the box, Space as Enter in a value box, Tab after the X of a point as its comma, an answer the
prompt cannot take dropped, the angle of a direction (LINE, PLINE, SPLINE, MOVE, COPY, STRETCH)
shown acute ("all angles are displayed as 180 degrees or less") and a typed one read on the cursor's
side, absolute `#`, relative `@`, `*` for the WCS, `x,y`, `dist<ang` (all in the UCS), `x,y,z` and
cylindrical `dist<ang,z` / spherical `dist<ang<ang` in the same box, multi-field forms, keyword
prompts; on the Z guide (or straight above or below the base point) the length reads the height and
the angle `+Z` / `-Z`, and a typed length runs along it — LINE, MOVE, COPY, STRETCH and a grip move
go up or down, PLINE and SPLINE keep their plane; a typed angle brings it back to the plane
(**unverified**); Enter with nothing typed is the prompt's — a form's defaults or the `<default>`,
else the end of the command — never the cursor's reading, from the keyboard as from the right button

**Missing:** a numeric `<default>` shows only as the box's placeholder (where the box is not reading
the cursor), not in the prompt

### Angle override

**Implemented:** `<angle` typed at a point prompt that has a base point, in the box or at the
command line: `Angle Override: 30` (es `Modo momentáneo de ángulo: 30`), the next point locked to
that heading from the base point in the UCS, over Ortho, Polar and the snap lattice, object snaps
(`_END`, p165) and typed coordinates (`@10,0`, p161) still winning; for that one point. The angle in
any of the forms a typed angle takes (`30d30'`, `0.5r`, `50g`, `N45dE`: coordinate-systems.md). At a
first point, with no base, it is `Invalid point.`; a second `<angle` while one holds is the prompt's
wrong answer (`Point or option keyword required.`) and drops the first, so a length typed next runs
towards the cursor (2027's console, p161); **unverified**: the echo of an angle typed in another
form than a number (what was typed here, `Angle Override: 50g`)

### Coordinates (status bar)

**Implemented:** the cursor's X, Y and Z in the current UCS, written as AutoCAD writes them
(`1.5000, 2.0039, 0.0000`; Absolute, COORDS 1), the Z the elevation plane's, at the drawing's
precision (LUPREC) — WHY shown by default: AutoCAD has hidden them since 2015 ("not displayed on the
status bar by default"), and there is no other readout of the cursor here; Customization hides them

**Missing:** Relative and Geographic, Specific (updating only on picks), Ctrl+I

### Selection cycling

**Implemented:** badge, Shift+Space, selection list box

**Missing:** placement options, subobject filtering, type icons in the list, LEGACYCTRLPICK

### Selecting with no command

**Implemented:** PICKADD at its default 2: a pick adds its object to the set, Shift+pick removes it
("To remove objects from the set, press SHIFT while selecting"); a window or crossing — dragged, or
begun by a click on nothing and closed by the next click (PICKAUTO, PICKDRAG 2) — adds what it
finds, or removes it with Shift held at either corner; a click on nothing never empties the set:
Escape drops a window under way, and with none the selection; Shift held shows a minus badge beside
the crosshair, here and at a prompt that takes a set (`Select objects:`), never at a single object's
pick where Shift means something else (TRIM's extend) — **unverified** beyond users' reports:
Autodesk's help does not describe it

**Missing:** the command line's `Specify opposite corner or [Fence/WPolygon/CPolygon]:` and its
lasso options; PICKADD, PICKAUTO and PICKDRAG as variables, and the Properties palette's Toggle
PICKADD; CURSORBADGE and the other cursor badges (MOVE's, COPY's…); whether a `+` badge shows with
PICKADD 0 (**unverified**)

### Grips

**Implemented:** move, lengthen, radius, arc end, polyline insert/remove vertex, curvature,
multi-select move, MTEXT width, magnetism with capture/release hysteresis; a grip drags to a point
like a click (the elevation plane, or the object's Z under a snap, or its own Z for a typed
distance): a line's end takes that Z, a move grip moves by it from its object's Z, every other grip
stays in its object's plane

**Missing:** Enter (and Space) cycling the grip modes — Enter keeps the edit hot,
Ortho/tracking-aware radius and angle drag, insert vertex on an arc segment, any grip but move on a
tilted object (it keeps only its move grips)
