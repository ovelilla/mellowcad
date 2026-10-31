# Drafting aids

### Object snaps

**Implemented:** Endpoint, Midpoint, Center, Quadrant, Intersection, Extension, Insertion,
Perpendicular, Tangent, Nearest, Apparent Intersection, Parallel; AutoCAD's running set (OSMODE
4133: Endpoint, Center, Intersection, Extension); the snap nearest the cursor wins ("a point closest
to the center of the aperture box"): a point under the aperture (APERTURE 10: Endpoint engages 10 px
from its point and not at 11, desktop line/d25), then the one already held within 13 px (the
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
heights; Perpendicular to lines (past their ends), circles, arcs (only a foot on the sweep, though
the other is nearer: arc/p208, p209) and polyline segments; Tangent to
circles, arcs and polyline arcs; Center and Quadrant of polyline arcs; a circle's Quadrants along
the UCS's X and Y when it lies parallel to the UCS's XY plane (UCS Z 30: circle/p212, p217), none
when it is oblique to it (interaction3d/i09; an arc's by the same rule, unprobed), only the snap
turning, not the grips (desktop
circle/d15), an arc's so too where its sweep passes (arc/p201, p203; tilted, p210, p211); an
ellipse's Quadrants at its own axis ends whatever the UCS, an elliptical arc's only on its sweep
(ellipse/p300–p302), its Midpoint halfway along an elliptical arc's length and none on a whole
ellipse (p303, p304), Nearest on both (p307); a spline's Endpoint, its Midpoint halfway along it
from its start in space, a closed one's too (spline/p310–p312, spline3d/s03), Nearest and Intersection on the curve, a
crossing found on its chords refined onto it (p310, p313); the
markers as AutoCAD's dark
theme draws them, green, 14 px with a 2 px stroke (square, triangle, circle with a cross, diamond,
✕, right angle, circle with a bar, hourglass; desktop line/d05, d21); a Tangent or Perpendicular a
command works out itself (LINE's first point, CIRCLE's 2P, 3P and Ttr, whose objects are picked as
under TAN with the running snaps silent) marked on the object under the cursor by its glyph trailing
three dots and `Deferred Tangent` / `Deferred Perpendicular` (es `Tangente diferida`,
`Perpendicular diferida`, tables 85, 86), the crosshair left on the pointer (desktop circle/d03);
the snap's name in a light grey box below and to the right of the cursor (d05, d21), with Polar's reading under it, and the
dynamic-input box under both — WHY: AutoCAD puts its dynamic-input box in that same place (d11);
which gives way with both showing is **unverified**; F3 turns object snapping on and off,
writing `Command:  <Osnap on>` / ` <Osnap off>` (es ` <Refent activado>` / ` <Refent desactivado>`;
tables 33112, 33113, desktop passes line/d10, d27). Every drafting toggle — F3, F7, F8, F9, F10,
F11, F4 and their status-bar buttons — echoes at `Command:` on a line of its own and inside a
command after the prompt asking, which stays (`Specify next point or [Undo]:  <Ortho off>`), and
its change is recorded into the last undo step: LINE, F7, U writes `LINE` and takes the line and
the grid back; LINE, Grid, LINE, U takes the second line only, U again the first and the grid;
inside a command it is that command's step; with nothing to undo it is none; REDO sets it again
(desktop workspace/d01, d01-2, d01-3; F3's, F10's and F11's by analogy with F7's and F8's); OSMODE and AUTOSNAP, as POLARMODE, POLARANG,
DYNMODE and SELECTIONCYCLING, are registry variables, which a drawing opened leaves (rectang/p304,
p321): here they last the session (RECTANG-D46); OSMODE typed (SETVAR, workspace.md) sets the
running snaps as a step U takes back, NOD's 8 and GCEN's 1024 kept without a snap and 16384
suspending them as F3 does, which it reads back (workspace/p214, p218, p223). A 3D polyline snaps as its segments, lines between its vertices at their Z: Endpoint at each vertex, Midpoint of each segment, Nearest, Perpendicular and Intersection on them (3dpoly/p21). Off the plan
every snap is found where its object is drawn (a point typed under an override as a pick there):
a vertical line, a point in plan, gives its top end, its middle and the point under the cursor, a
3D polyline's vertical segment too (interaction3d/i01, i07), and in plan its start (i06);
Perpendicular to a line is the foot in space, from a point at another height to a sloped or
vertical line, in plan as in SEISO (i04, i08, i14), to a circle in the circle's plane (i08), and
Tangent from the point projected onto the circle's plane (i04); Intersection needs the objects to
meet in space (none where they cross in plan at Z 0 and Z 30, i02), a vertical line meeting what it
passes through at that object's height (i06, i14); Apparent Intersection is at the newer object's
height in plan and on the older one in SEISO, whichever was drawn first (i02, i03, i12, i13),
and under an override it is a real crossing too (osnapz/o04). OSNAPZ (SETVAR, workspace.md: 0
or 1, program-wide, which OPEN and NEW leave, osnapz/o01–o03) at 1 finds every snap as at 0 — the
Perpendicular foot and the Tangent point in space, Intersection only where the objects meet (o05,
o09) — and gives it ELEVATION's Z in the UCS, turned or tilted (o04, o06): a line's, a circle's,
a text's, a 3D polyline's, a 3D spline's and those of a circle in another plane (o07, o10);
LASTPOINT and the point filters take that Z (`.Z` of `_END` is ELEVATION's, o08, filters/f25)

**Missing:** OSNAPZ 1 under OTRACK: an acquired point keeps its object's Z here, and its guide
with it (**unverified**: desktop pass `scripts/research/probes/osnapz/dsk.sh`, not run), and the
marker off the plan is drawn on the object (**unverified**, the same pass); snaps of an object seen
edge-on in plan (a circle in a vertical plane gives its Center from the rim in AutoCAD, none here:
osnapz/o07); Node and Geometric Center (no POINT object; a dimension's definition points snap as
Endpoint; Spanish `PUN` and `PUNTO` at OFFSET's distance are Node, `de`, where here PUNTO is refused
and PUN is Thru, offset/p109, p110), deferred Perpendicular and Tangent at the first point of a
command other than LINE and CIRCLE (refused there as finding nothing, as at PLINE's start, pline/p29),
Intersection on ellipses, Perpendicular and Tangent on ellipses (ellipse/p308–p314) and splines
(spline/p313, p315, p316), a closed spline's Geometric Center (spline/p311), a polyline arc segment's Quadrant in a rotated
UCS and Perpendicular off its sweep (**unverified**, left at its OCS's and both feet until PLINE's
object is probed), extended Intersection and extended Apparent
Intersection (picked object by object, as an override), Extension from a polyline's arc end, the
tooltip's distance and angle (`Extension: 12.00 < 0°`), the snapped object's blue glow while Tab
cycles (d26), APERTURE and AUTOSNAP's settings as variables, per-entity opt-in still required for every
new entity type (OSOPTIONS-like, deliberate), Intersection between objects in different planes,
the `Oblique, non-uniformly scaled objects were ignored.` line before Quadrant's refusal (i09),
Extension and Parallel along a vertical line (unprobed; none here); Extension from a 3D polyline's two ends alone (here every vertex is a segment's end, so offers it; unprobed)

### Object snap overrides and `FROM`

**Implemented:** Shift + right-click at a point prompt (on the press), one-shot override: FROM, the point filters
and the object snaps in AutoCAD's order and groups for what exists (desktop line/d06): From, Point Filters ▸ ·
Endpoint, Midpoint, Intersection, Apparent Intersection, Extension · Center, Quadrant, Tangent ·
Perpendicular, Parallel, Insertion, Nearest, None — the same entries as the Command menu's Snap
Overrides; typed at any point
prompt, in the box or at the command line, and at TRIM's and EXTEND's object prompt, FILLET's
and CHAMFER's and BREAK's `Select object:`, whose pick is the point found (trim/p259–p264,
corners/p257–p269, pieces/p108–p115, p177; modify.md), by
-OSNAP's words (END, MID, CEN, QUA, INT, EXT, INS, PER, TAN, NEA, APP or APPINT, PAR, NON; es
FIN, MED, CEN, CUA, INT, EXT, INS, PER, TAN, CER, APP, PAR, NIN) or `_` and the global word in any language (`_ENDP`, `_NEAR`, `_APPINT`: 2027 declares
`Appint`, table 27409), read before the prompt's keywords (`CEN` at PLINE's arc prompt is the snap,
not `CEnter`), as AutoCAD 2023's console reads them. The history writes the override with `of`
(END, MID, CEN, QUA, INT, APP, EXT) or `to` (NEA, PER, TAN, PAR), nothing after NON, es `de` / `a`
(`Specify first point: _END of 99,1`; probes line/p24, p25, p32, p33, p156; the menu's `_mid de`,
desktop d22); INS's `of` is **unverified** (the probe hung). A point typed after an override is
found there as a pick is (`_END of 99,1` is 100,0, p25; a deferred `_TAN to 10,0` at LINE's first
point, p24). An override that finds nothing refuses the point — `No Endpoint found for specified
point.`, then the prompt's own refusal (`Invalid point.`, `Point or option keyword required.`) —
and is gone (p36, p156, p211): Tangent, Extension, Parallel and Apparent Intersection are named by
nothing, `No found for specified point.`, as 2027 writes it (LINE-D11); es
`No se ha encontrado ptoFINal para el punto designado.` (puntoMEDio, CENtro, PERpendicular,
INTersección); Quadrant's, Nearest's and Insertion's names (`Quadrant`, `Nearest`, `Insert`; es
`CUAdrante`, `CERcano`, `INSerción`) come from table 27408, **unverified**. A second override
typed at the first's `of` is `Invalid point.`, and neither holds (p162). Enter at an override's `of`
is the prompt's own Enter, and the override never outlives its command (offset/p294). A Tangent or
Perpendicular
at a prompt with no base point measures from LASTPOINT where AutoCAD's does — CIRCLE's centre
(circle/p343, p345), ELLIPSE's first point and centre (ellipse/p266, p267, p295), SPLINE's first
point, Fit and CV (spline/p242, p243, p274), OFFSET's side and through points (offset/p263,
p285) —, a LASTPOINT inside the circle finding no tangent
(spline/p252). At SPLINE's end tangent a Tangent on a circle or an arc is deferred: the end leaves
along the circle where it is nearest the spline's end, pointing the pick's way (spline/p250, p262,
p263, p272); on other objects it is the ordinary one from the last point (unprobed).

FROM, typed at a point prompt (FROM, FRO, `_FRO`) or chosen from the menu, asks `Base point:` and
then `<Offset>:` (es `Punto base:`, `<Desfase>:`), prompts with no keywords (FOO or U there:
`Invalid point.`). The base is picked, typed or found by an override; at `<Offset>` `@x,y` runs from
the base, a number is a direct distance from it towards the cursor, a bare `x,y` is absolute at
the command line and from the base in the tooltip (LINE-D10: dynamic input's relative default), a
pick places the point it is on, an override finds its snap. Enter at either is the prompt's own:
LINE's Continue at its first point, its end at the next, LASTPOINT left at the base (probes
line/p34, p154, p164, p211). At `Command:` FROM is an unknown command (p211). Escape at its prompts
cancels the command, `Base point: *Cancel*` (desktop filters/d05).

**Missing:** in the menu, Temporary track point, Mid Between 2 Points, 3D Osnap ▸,
Geometric Center, Node and Osnap Settings… (none built), and its icons; M2P / MTP, TT (the temporary
tracking point), the temporary override keys (Shift+A,
Shift+Q, Shift+E…: TEMPOVERRIDES), INT and APPINT on one object asking ` and ` for the second
(p156, p211; here that pick finds nothing and is refused)

### Point filters · `.X` `.Y` `.Z` `.XY` `.XZ` `.YZ`

**Implemented:** typed at any point prompt — in the box or at the command line, FROM's `Base point:`
and `<Offset>:`, a transparent command's (`>>of`), MOVE's displacement, a distance or an angle
measured by points (CIRCLE's radius, OFFSET's distance, ROTATE's angle) — or chosen from the Shift +
right-click menu's and the Command menu's Osnap Overrides' Point Filters ▸ (es `Filtros para
puntos`), after From: `.X .Y .Z | .XY .XZ .YZ`, acad.cuix's `ID_MnPointFi`, whose macros type them
(desktop filters/d03, d04). A dot and X, Y and Z, each once, in any order and case (`.yx`, `.ZX`,
`.XYZ`, the whole point; `.Q` and a lone `.` are the prompt's wrong answer: probes filters/f13–f17,
f44). The next point gives those coordinates, `of` (es `de`, table 26329), and `(need YZ):` (es
`(falta YZ):`, 26266) asks the rest, the point whole answering the prompt as a pick there (f01–f05):
X, Y and Z in the UCS, origin and turn (f19, f20), a 2D point's Z the elevation (f21, f22), a number
at `(need Z)` the Z in the UCS (f02, f20). At a 2D point's prompt (PLINE's, ARC's) it asks `(need
Y)`, and a filter naming Z says `Z coordinates not allowed here.` (es `Aquí no están permitidas las
coordenadas Z.`, 26327), then the prompt's refusal (f38, f39, f52, f53). Each point given is picked,
typed (`@` from LASTPOINT, which the filter's points leave: f07, f26), found by an object snap
typed at `of` or `(need …)` (f23, f24), FROM's at `(need …)` (f55), or a number: at `of` and at a
`(need …)` of two a direct distance from the base point towards the cursor (f08, f27, f29), at a
`(need …)` of one that coordinate (f28, f49; the help's "a numeric value at any coordinate filter
prompt" is the console's at these only). A filter at `(need …)` replaces the last one, a coordinate
given twice keeping the later (f06, f57–f59). The prompt's keywords stay on offer at both, LINE's
Undo (f45, f46; es `H`, f50); Enter is the prompt's own, LINE's Continue (f09, f10); a wrong answer
gets the prompt's refusal (`Invalid point.`, `Point or option keyword required.`) and the prompt
is asked again without the filter (f11, f12, f48, f60); Escape cancels the command (desktop d05). A
filter, or FROM, at a filter's `of`, a filter at an object snap's `of` and one under an angle
override are the prompt's wrong answer, and neither holds after it (desktop d05; f42, f47). The
prompt line reads `LINE of` and `LINE (need YZ):`; the tooltip the question before it, `Specify next
point or of` (desktop d01, d02); the history `Specify first point: .X of 10,20` and `(need YZ):
30,40` on a line of its own, as the menu's macro writes it (d04; typed, the desktop puts `of` on a
line of its own too). Under OSNAPZ 1 a snap at `of` or `(need …)` gives ELEVATION's Z (f25,
osnapz/o08).

**Missing:** filters at `Select objects:` and a single object's pick, where AutoCAD takes them as a
point (f40, f63; here the prompt's wrong answer); the tool's own fields at `of` (the desktop keeps
LINE's distance and angle, d01; here a coordinate box, as FROM's); a filter inside FROM typed at
`(need …)` (refused here, **unverified**); FROM typed at a filter's `of` in the console, which takes
FROM's base point as the filter's (f32; the desktop refuses it, d05, as here); the menu's icons
(d04).

### `-OSNAP` / `-OS` · es `-REFENT` · pt-BR `-OSNAP` / `-OS`

**Implemented:** `Current osnap modes: End,Cen,Int,Ext` (no line when none runs), then
`Enter list of object snap modes:` — modes by their capitals, separated with commas (es Spanish's,
from 2026's -REFENT page, CF5780AD), `_APPINT` too, replacing the running set and turning object
snapping on; NONe, OFF (es NINguno, DES) or Enter clears it, OSMODE 0 (probes line/p37, p155,
p163); an unknown mode says `Invalid object snap modes.` and asks again (es
`Modos refent actuales: …`, `Indique lista de modo de referencia a objetos`,
`Modos no válidos de referencia a objetos.`)

**Missing:** OSNAP / OS (the Drafting Settings dialog; the status bar's Object snap menu stands in),
GCEnter and NODe in the list, a Spanish alias (none verified)

### `OSNAP` tracking (OTRACK)

**Implemented:** F11 turns it on and off, writing ` <Object Snap Tracking on>` / `off` (es
` <Rastreo de referencia a objetos activado>` / `desactivado`; desktop passes line/d10, d27);
acquisition by dwell on a snap under the aperture, up to seven points ("you can
acquire up to seven tracking points"), orthogonal guides along the UCS's axes whatever Polar's
increment ("By default, object snap tracking is set to orthogonal"), the crossing of two paths
(guides, Extensions, the Ortho / Polar line) winning over a snap that slides along one of them
(Extension, Parallel, Nearest); precedence over constraints; in a 3D view each acquired point's `+Z`
/ `-Z` guide too (`Endpoint: 75.5448 < +Z`, desktop interaction3d/d09), measured on the screen, a
crossing with it taken where it is drawn, on the Z guide, and a typed offset running up it; off the
plan a guide of the plane reads the cursor where its line of sight meets the acquired point's
plane, at that point's Z (8 px off the X guide of 0,100,50, `Endpoint: 101.6485 < 0°`, the point
101.648,100,50, d04), an acquired point dropped only once it is drawn a view's diagonal from the
cursor, and two guides cross where they are drawn crossing, on the first; drawn as
AutoCAD's dark theme draws it (desktop line/d13): an acquired point a small green `+`, the guide
green and dashed as Polar's, the point it gives a small ✕

**Missing:** the label of the tracking path (none here, in plan either), tracking with every polar
angle (POLARMODE), a typed distance along a guide at a later point measured from the acquired point
("use direct distance … along alignment paths from the acquired object snap point": only LINE's
first point does), Shift to avoid acquiring, Perpendicular or Tangent tracked from the last point

### Polar tracking (F10)

**Implemented:** F10 turns it on and off, writing ` <Polar on>` / ` <Polar off>` (es
` <Polar activado>` / `desactivado`; desktop passes line/d10, d27); angle increments from the UCS X
axis (the status bar's menu offers POLARANG's 90, 45, 30, 22.5, 18, 15, 10 and 5 as the desktop
writes them, `90, 180, 270, 360...`, 22.5 as `23, 45, 68, 90...`, desktop workspace/d01-m, e01-4 —
its first number plain where AutoCAD bolds it, the type roles having no bold figure — and choosing
one turns Polar on, silently), guides, mutually exclusive
with Ortho, Shift override; from a base point at another height than the work plane, the cursor
read where its line of sight meets the base point's plane, the path engaged where it is drawn (not
over its image on the work plane) and the point on it at the base point's Z, in a 3D view and in
plan (desktop interaction3d/d01, d04, d07: 8 px off the 0° path at 100,100,50, 101.648,100,50), a
click with no angle engaged on the work plane (d02); in a 3D view the `+Z` / `-Z` guide along the
UCS's Z, engaged within the same 12 px measured on the screen, the guide drawn nearer the cursor
winning against a polar angle, the Z on a tie (**unverified** rule); readout `Polar: 50.00mm < +Z` (**unverified** wording); the
path dashed green from the base point out of the view, a small ✕ on the point, the reading in a
light grey box below and to the right of the cursor (desktop line/d12); POLARANG typed (SETVAR,
workspace.md) in degrees, put in 0–360 (`-30` is 330, `400` is 40), a step U takes back
(workspace/p218, p223)

**Missing:** additional angles list, "track using all polar angles", POLARANG 0 (taken by AutoCAD,
p223; refused here: polar tracking needs an increment), POLARMODE (a registry variable, for the
session here: see Object snaps) and TRACKPATH as variables, the plane's angles measured in plan off
the plan

### Ortho (F8)

**Implemented:** constraint to the UCS's axes, from the prompt's base point (none at CIRCLE's 2P
and 3P later points, whose picks it leaves alone, desktop circle/d12, nor at ARC's but a centre
mode's end, bent about the centre, arc/d06); F8 turns it on and off, writing ` <Ortho on>` /
` <Ortho off>` (es ` <Orto activado>` / `desactivado`), and turning it on turns Polar off, as Polar
turns it off (desktop passes line/d10, d27); Shift held toggles it ("To turn Ortho off
temporarily, hold down the Shift key"; with it off, on), Polar yielding; from a base point at
another height, the cursor read on the base point's plane and the point at its Z (from 0,100,50 in
SEISO, the pointer on 80,100,0's pixel gives 129.875,100,50; in plan 70.29,100,50; desktop
interaction3d/d03, d07); in a 3D view its Z as a third axis, the one drawn nearest the cursor
winning (a sweep of d03: right within a few degrees, AutoCAD keeping −Z to 302° where the screen's
bisector is 300°); ORTHOMODE is saved in the drawing, NEW and a drawing opened bringing theirs (rectang/p304,
p321), Polar turning it off too; F8 is taken back with the last undo step (see Object snaps,
desktop workspace/d01); Ctrl+L, acad.cuix's `^O` (MM_0005), is F8's toggle and echo, taken from a
focused field too — Chrome does not reserve it (IDC_FOCUS_LOCATION is not in `accelerator_table.cc`'s
`kReservedCommandIds`, chromium 7f7e075), so the page receives it before the address bar; U takes
back the ORTHO command (p317), which is not built here

### `SNAP` / `SN` · es `FORZCURSOR` / `FC` · pt-BR `SNAP` / `SN` · snap mode (F9)

**Implemented:** grid snap on the UCS (from its origin, along its axes), the picks rounded to the
lattice (SNAPUNIT 10: 13,7 is 10,10, desktop pass line/d23), polar snap, stepping by POLARDIST, 0 at
first and then Snap X's spacing ("If this value is 0, the PolarSnap distance assumes the value for
Snap X Spacing", help GUID-66D637C9; workspace/p205), program-wide and typed as a variable (any
sign, p211; a step U takes back, p218; the status bar's Polar distance takes 0 too); under Ortho or
Polar from a base point at another height the lattice rounds the cursor on the base point's plane
(130,100,50 from 0,100,50), alone the work plane's (80,100,0; desktop interaction3d/d05); on the
`+Z` / `-Z` guide PolarSnap rounds the height and the grid leaves it (**unverified**). SNAP asks
`Specify snap spacing or [ON/OFF/Aspect] <10.0000>:` (es
`Precise distancia de resolución o [ACT/DES/asPecto]`): a spacing, typed or two points apart, sets
SNAPUNIT's X and Y and turns snap mode on; Enter turns it on; ON and OFF (es ACT, DES); Aspect asks
`Specify horizontal spacing <…>:` and `Specify vertical spacing <…>:` (es `Precise intervalo
horizontal`, `Precise intervalo vertical`) and turns it on, after which the default is `<A>` (es
`<asP>`, table 25931), which Enter opens. FOO says
`Requires numeric distance, two points, or option keyword.` (at Aspect's,
`Requires numeric distance or two points.`), 0 and −5 `Value must be positive and nonzero.`, and the
prompt stays; transparently its prompts are headed `>>` and `Resuming LINE command.` follows (2027's
console, probes line/p38, p158, p212, p213). F9 toggles it, writing ` <Snap on>` / ` <Snap off>`
(es ` <Forzcursor activado>` / `desactivado`; desktop passes line/d10, d27). SNAPMODE and SNAPUNIT
are saved in the drawing (rectang/p304, p321); U takes SNAP back, as it takes ORTHO back (p317), and
an F9 with the last undo step (see Object snaps; by analogy with F7 and F8, desktop workspace/d01)

**Missing:** Legacy, Style (isometric snap) and Type (grid or polar: the status bar's Snap menu,
Polar Snap then Grid Snap, es Referencia polar, Referencia a rejilla, desktop workspace/d01-m, e01-3,
chooses it here) — not listed, as they are not built (WHY: the prompt lists what is, as TRIM's
leaves out Project) —, the unlisted Rotate (SNAPANG), SNAPBASE; PolarSnap with a negative POLARDIST
steps by its size, as the desktop's does (POLARDIST −10 steps 10, desktop workspace/d08)

### Grid (F7)

**Implemented:** F7 shows and hides the grid, which follows the lattice while grid snap is on;
GRIDMODE is saved in the drawing (rectang/p304, p321); F7 writes ` <Grid on>` / ` <Grid off>` (es
` <Rejilla activado>` / ` <Rejilla desactivado>`, table 16646, desktop workspace/d01, e01) and is
taken back with the last undo step (see Object snaps, d01)

**Missing:** GRID, GRIDUNIT (the spacing is the lattice's or the zoom's here)

### Dynamic input (DYN)

**Implemented:** distance/angle fields, hard-lock on typed values, keys typed on the drawing going
into the box, Space as Enter in a value box, Tab after the X of a point as its comma, an answer the
prompt cannot take dropped, the angle of a direction (LINE, PLINE, SPLINE, MOVE, COPY, STRETCH)
shown acute ("all angles are displayed as 180 degrees or less") and a typed one read on the cursor's
side, absolute `#`, relative `@`, `*` for the WCS, `x,y`, `dist<ang` (all in the UCS), `x,y,z` and
cylindrical `dist<ang,z` / spherical `dist<ang<ang` in the same box, multi-field forms, keyword
prompts; on the Z guide (or straight above or below the base point) the length reads the height and
the angle `+Z` / `-Z`, and a typed length runs along it — LINE, MOVE, COPY, STRETCH and a grip move
go up or down, PLINE keeps its plane, SPLINE's next point goes up or down too (its points keep
their Z, draw.md, SPLINE); a typed angle brings it back to the plane
(**unverified**); Enter with nothing typed is the prompt's — a form's defaults or the `<default>`,
else the end of the command — never the cursor's reading, from the keyboard as from the right button;
the Down arrow, with nothing typed, in the box or on the drawing, opens the prompt's option list with
nothing marked, each further Down (or Up) moves the mark around it, Enter picks the marked option as
the Command menu does (echoed `_Close`) and Escape shuts the list, the command going on (desktop d11;
help: "press the DOWN ARROW key until a dot is displayed next to the option. Press Enter") — WHY the
options also show as chips under the prompt at all times: they are the always-visible list, the open
one shown by its brighter chips and the marked one by the selected row's colour

**Missing:** a numeric `<default>` shows only as the box's placeholder (where the box is not reading
the cursor), not in the prompt; turning dynamic input off — F12 and DYNMODE (F12 writes no echo in
AutoCAD, desktop d10, d27; here the key is left to the browser); the Up arrow's recent input (help:
"Press the Up Arrow key to display recent input"); **unverified**: Enter with the list open and
nothing marked (it only shuts the list here), whether Up and Down wrap at the list's ends, the
command-line echo of an option picked from the list

### Angle override

**Implemented:** `<angle` typed at a point prompt that has a base point, in the box or at the
command line: `Angle Override: 30` (es `Modo momentáneo de ángulo: 30`), the next point locked to
that heading from the base point in the UCS, the cursor read on the base point's plane and the
point at its Z (`<0` from 0,100,50, 132.849,100,50, desktop interaction3d/d05), over Ortho, Polar
and the snap lattice, object snaps
(`_END`, p165) and typed coordinates (`@10,0`, p161) still winning; for that one point. The angle in
any of the forms a typed angle takes (`30d30'`, `0.5r`, `50g`, `N45dE`: coordinate-systems.md). At a
first point, with no base, it is `Invalid point.`, and at CIRCLE's 2P and 3P later points, which
have none either, `Invalid 2D point.` (circle/p137; CIRCLE's radius has one, p173); a second `<angle` while one holds is the prompt's
wrong answer (`Point or option keyword required.`) and drops the first, so a length typed next runs
towards the cursor (2027's console, p161). At ELLIPSE's start and end angle (or parameter) it is
no override but the angle itself, the next prompt following (ellipse/p181, p292; its Rotation and
Included angle unprobed, so they keep the override); **unverified**: the echo of an angle typed in another
form than a number (what was typed here, `Angle Override: 50g`)

### Coordinates (status bar)

**Implemented:** the cursor's X, Y and Z in the current UCS, written as AutoCAD writes them
(`1.5000, 2.0039, 0.0000`; Absolute, COORDS 1), the Z the elevation plane's, at the drawing's
precision (LUPREC) — WHY shown by default: AutoCAD has hidden them since 2015 ("not displayed on the
status bar by default"), and there is no other readout of the cursor here; Customization hides them

**Missing:** Relative and Geographic, Specific (updating only on picks), Ctrl+I

### Selection cycling

**Implemented:** off by default (SELECTIONCYCLING 0, erase/p01); badge, Shift+Space at `Command:`
and at `Select objects:`, the Selection list box (es `Selección`) with the candidates by type and
AutoCAD's last row, None (es `Ninguna`), which selects nothing; the candidate offered glowing blue as
a selection does (desktop erase/d12, d13); SELECTIONCYCLING lasts the session (a registry
variable: see Object snaps), typed as a variable (SETVAR, workspace.md) from −2 to 2, the sign on
or off and 2 the list box, a step U takes back (workspace/p214, p218); Ctrl+W from 0 turns on the
list box too (**unverified**), writing ` <Selection Cycling on>` / ` <Selection Cycling off>` (es
` <Ciclo de selección activado>`; tables 16646, 4743, desktop workspace/d01) and taken back with the
last undo step (see Object snaps) — WHY F4 as well: browsers keep Ctrl+W

**Missing:** placement options, subobject filtering, type icons in the list, LEGACYCTRLPICK; whether
a click after Shift+Space opens the list again (**unverified**: d12-7 opened it, but the probe's
click moves the cursor first, which restarts the stack)

### Selecting with no command

**Implemented:** PICKADD at its default 2: a pick adds its object to the set, Shift+pick removes it
("To remove objects from the set, press SHIFT while selecting"); a window or crossing begun by a
click on nothing and closed by the next click, its outline white, solid or dashed, over a blue or
green fill (desktop erase/d02-1, d03-1), or a lasso dragged from a press on nothing (PICKAUTO 5,
PICKDRAG 2; command-line.md, `Select objects:`; d04, d05), adds what it finds, or removes it with
Shift held at either corner or at the press, and what it would take glows as it is drawn
(SELECTIONPREVIEW 3, d02-1); a click on nothing never empties the set:
Escape drops a window under way, and with none the selection; a command started with it takes it,
and its end or Escape drops it (but COPYCLIP's and PASTECLIP's, command-line.md, `Select objects:`;
erase/p249–p251, desktop d10), while a grip edit, no command, leaves it; a press on a selected
object off its grips, dragged, drags the set as itself, solid in its colours, the originals faded
where they were, with no grip, rubber band or tooltip (desktop move/d08-1), and released moves it
by the drag, writes nothing and drops the set, one step U and REDO name `DROPGEOM GROUP` (es
`SOLTARGEOM GRUPO`, d08) — a locked layer's objects in it stay where they are, and a press on one
boxes (**unverified**: AutoCAD's drag of a locked object was not probed); Shift held over a selected
object shows a minus badge beside the crosshair, and only there: none over nothing or an object not
selected, none at `Select objects:` (desktop erase/d14-1 to d14-6); a selected object keeps its colour and glows blue (the
selection effect, desktop line/d15); the crosshair is CURSORSIZE 5's, 5 % of the screen end to end
(here of the canvas's longer side), with the pick box at `Command:` and wherever objects are picked,
none at a point prompt (d03, d20); the rollover tooltip (ROLLOVERTIPS 1): an object hovered at
`Command:` names its type, Color, Layer and Linetype below and to the right of where the cursor came
over it (es `Línea`, `Color PorCapa`, `Capa 0`, `Tipo de línea PorCapa`, d20), after half a second
(**unverified** delay), in the editor's popover style

**Missing:** the command line's `Specify opposite corner or [Fence/WPolygon/CPolygon]:` and its
lasso options; PICKADD, PICKAUTO and PICKDRAG as variables, and the Properties palette's Toggle
PICKADD; CURSORBADGE and the other cursor badges (MOVE's, COPY's…, and the `?` beside the cursor at
DIST's, AREA's and ID's prompts, desktop inquiry/d01-2, d08-1, e03-1); whether a `+` badge shows with
PICKADD 0 (**unverified**); the crosshair hidden at `Select objects:` (AutoCAD shows the pick box
alone there, desktop erase/d09-1); the rollover tooltip on a selected object, its other rows (QPMODE's
properties per type, CUI's Rollover Tooltips), ROLLOVERTIPS and CURSORSIZE as variables; a copy by
a selection dragged with Ctrl (**unverified**: Ctrl held from the press drags nothing, it is the
sub-object pick, desktop move/d09); the right-button drag's menu (workspace.md)

### Grips
**Implemented:** a line's end grip stretches the end to the point given, off the line's axis too
(STRETCH, the default grip mode; desktop line/d15), and a number typed while it is hot is the line's
resulting length towards the cursor (the first of DYNDIVIS's default two fields, help 2027
"Dimension Input Settings"); every move grip (a line's midpoint, a centre, an insertion point) moves
its own object only, whatever else is selected (d15, `** ESTIRAR **` with two lines selected), a
justified TEXT's insertion point (DXF 10) beside its justification point (text/d02-1);
radius, MTEXT width; an arc's middle grip, Stretch its default (desktop arc/d07, d08): the arc bent
through its two ends and the point, stored counter-clockwise (40,25 → 50,30 → 60,25 dragged to its
middle at 50,33.98 is centre 50,23.9245, radius 10.0577, d09), left as it was, with nothing said,
on its chord; its ghost solid in the object's colour, the grip hot where it was taken; an arc's end
grip swings the end round the centre, the radius kept (AutoCAD's Stretch there **unverified**:
d07 shows its hover menu, Stretch and Lengthen, the drag not seen); a polyline's grips, Stretch their default (desktop pline/d09): a
vertex moves alone, a straight segment's midpoint moves the segment, both its ends by the drag, an
arc segment's midpoint bends the arc through the point, and an arc beside a vertex moved bends
through its old midpoint (0.4142 → 0.1702 on d09's quarter arc), one undo step each; vertex grips
squares, midpoint grips thin rectangles along their segment (d07); magnetism with capture/release
hysteresis; a grip drags to a point like a click (the elevation plane, or the
object's Z under a snap, or its own Z for a typed distance): a line's end takes that Z, a move grip
moves by it from its object's Z, every other grip stays in its object's plane; a line's grips sit at
its ends' own heights and their middle, so a vertical line shows three; an end dropped on the other
end in space is ignored (**unverified**); Ortho and Polar bend a line's end grip from where the
grip was (a raised line's, `Ortho: 79.7743 < -Z`, desktop interaction3d/d06); a circle's centre grip moves it and a quadrant grip sets
its radius (desktop circle/d08, d09): a number typed while it is hot is the radius, from the centre
(help GUID-01DE459C, desktop circle/d15), Ortho bends its drag as it bends a pick (**unverified**
on AutoCAD's side), and in a rotated UCS the grips stay at the circle's own quadrants, where the
Quadrant snap turns with the UCS (d15); blue squares 9 px across (GRIPSIZE's default), the one
under the cursor red (d15); a grip's edit at `Command:` is one undo step U and REDO name `Grip
Edit` (es `Editar pinzamiento`, table 6001; desktop arrays/d14, pline/d09); an array's own grips, squares
and arrows, and their drags: modify.md, the array object. A 3D polyline has a square grip at each vertex and none at its segments' middles (desktop 3dpoly/d01); a vertex goes to the point given, Z and all, as a line's end, and so does a spline's fit point or control vertex, whatever plane it lies in

**Missing:** the end grip's hover menu, `Stretch` and `Lengthen` (es `Estirar`, `Longitud`, d15),
and so Lengthen from a grip; an arc's hover menus (desktop arc/d07: the middle grip's `Stretch`,
`Radius`, an end's `Stretch`, `Lengthen`), so Radius and Lengthen from its grips, and a stretch
typed while its middle grip is hot; the Length Change field after a Tab (DYNDIVIS) and the angle fields;
the `** STRETCH **` prompt and its options at the command line, and the ribbon's Move during a grip
edit switching it to `** MOVE **` (`_move` echoed after the STRETCH prompt, desktop workspace/d02-8); the hover colour apart from the
dragged one (AutoCAD's hovered grip is pink, GRIPHOVER 11, the dragged one red), Enter (and Space)
cycling the grip modes — Enter keeps the edit hot, tracking-aware radius and angle drag,
any grip but move on a tilted object (it keeps only its move grips); a polyline's hover menus (d07)
— a vertex's `Stretch Vertex`, `Add Vertex`, `Remove Vertex` with its segments' lengths shown, a
straight segment's `Stretch`, `Add Vertex`, `Convert to Arc`, an arc's `Stretch`, `Add Vertex`,
`Convert to Line` with its radius — and Ctrl after a grip is hot cycling them (help GUID-BBEA1F71),
so adding or removing a vertex from a grip