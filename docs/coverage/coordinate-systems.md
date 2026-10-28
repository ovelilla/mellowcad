# Coordinate systems

The UCS is an origin and X and Y axes in space, so its XY plane can tilt. Every object keeps a
normal (DXF 210) and, a line aside, its points in the OCS of that normal, as DXF stores them; what
is drawn in a tilted UCS takes its Z as the normal. The commands work in the UCS's XY plane.

### `UCS` · es `SCP`

**Implemented:** `Current ucs name:  *WORLD*` (`*NO NAME*` / the name), then
`Specify origin of UCS or [Face/NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:` (Face
listed as 2027 lists it, probes ucs/p100, p101),
`Specify point on X-axis or <accept>:`, `Specify point on the XY plane or <accept>:`, NAmed's
`Enter an option [Restore/Save/Delete/?]:`, `Enter name of UCS to restore or [?]:`,
`Enter name to save current UCS or [?]:` (Enter saves none; `Invalid UCS name.`),
`UCS "AA" already exists.  Replace it? <N>:` (No or Enter ends with nothing saved;
`Yes or No, please.`), `Enter UCS name(s) to delete <none>:` (`Deleted 1 UCS name.`,
`  No matching UCS names found.`), `Enter UCS name(s) to list <*>:` and its listing as AutoCAD lays
it out (`Current ucs name: "AA"`, `Saved coordinate systems:`, each `"NAME"` with its
`     Origin = <…>, X Axis = <…>` / `     Y Axis = <…>, Z Axis = <…>` in the drawing's units),
`Select object to align UCS:`, ZAxis's Object `Select object:`, Previous with none
`No previous coordinate system saved.`; each refusing as AutoCAD 2023's console does
(`Point or option keyword required.`, `Invalid point.`,
`Requires valid numeric angle or second point.`, `Invalid option keyword.`, OBject's
`*Invalid selection*` +
`Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group`); es from Autodesk's
table (`Indique origen de SCP o [Cara/gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ] <Univ>`,
`Precise punto en eje X o <Aceptar>`, `Precise nuevo punto de origen u [Objeto] <0,0,0>`,
`Indique una opción [Rest/Guardar/Supr/?]`, `Designe el objeto a alinear con el SCP`,
`Suprimidos 1 nombre de SCP.`, `Sí o No.`); origin (with its Z; one given without a Z lies at
ELEVATION above the current UCS's plane, p144), then a point on X, then one on the XY plane, each
with its Z: the point on X typed in the UCS moved to that origin (`100,0`, `200,50` lays X along
200,50, p111, p113), the third in the frame of the new origin and the new X, its Y the current Z ×
the new X (`100,20` after that X keeps Z up, p151; `0,-10` after X along `10,0` turns Z down, p120);
3point reads its points in the current UCS (Enter accepts at each: at the X point the axes stay, at
the third Y is laid in the current XY plane); NAmed Restore / Save (asks Yes/No before replacing) / Delete (commas and wildcards; deleting
the current one leaves it `*NO NAME*`) / `?` (origin and axes relative to the current UCS); OBject
(line, circle, arc, ellipse, polyline segment, spline, text, multiline text, attribute definition,
block reference, as aCADemia's table gives them; the origin at the object's Z there, the Z its
normal — a line's, its extrusion, the line in the new XZ plane); Previous (10, per session, with
their names); View (XY square to the line of sight, X and Y along the screen's horizontal and
vertical, the origin kept); World (Enter's default); X / Y / Z (UCSAXISANG 90 by default, typed, or
one point, clicked or typed, its heading from the UCS's origin in its XY plane, 0 on the origin,
p124, p125, p402; turned by the right-hand rule); ZAxis (a new origin, Enter keeping the current
one, then a point on the positive Z, Enter keeping the Z, one on the origin `Points are coincident`
— es `Los puntos coinciden` — and asked again, p129; X laid parallel to the WCS's XY plane by the
arbitrary-axis rule, as aCADemia's captures show) and its Object (a line, circular or elliptical
arc, open polyline or spline: the origin at the end nearest the pick, Z along the tangent pointing
away); at OBject's and ZAxis Object's picks the selection modes (Window, Last, Crossing, BOX, ALL,
Fence, WPolygon, CPolygon) take the newest object found, read with no pick as AutoCAD 2023's console
reads it — OBject at the object's start (a line's first end, a circle's angle 0, an arc's start),
ZAxis Object at the end nearest the WCS origin; a point typed there is a pick of the newest object
under it, as a click is, LASTPOINT staying at that point, and on nothing — typed or clicked —
`No object found`, which ends OBject with the UCS as it was and asks ZAxis Object again; one undo
step; saved in the drawing; World (its keyword and the first prompt's Enter) puts ELEVATION back
to 0, the WCS current or not, in the same undo step, as -VIEW's orthographic views do; Previous,
a restored name and orthoGraphic reaching the WCS keep it, as an iso -VIEW and PLAN do (p152,
p153, p400, p403).
The X / Y / Z and ZAxis prompts are AutoCAD 2023's console's
(`Specify rotation angle about X axis <90>:`, `Specify new origin point or [Object] <0,0,0>:`,
`Specify point on positive portion of Z-axis`; es `Precise ángulo de rotación sobre eje X`,
`Precise punto en parte positiva del eje Z`); a name Restore cannot find says
`Cannot find UCS "NAME".` (es `Imposible encontrar el SCP "NAME".`) and asks again; the words the
first prompt declares and does not list (its `initget`, table 25652), answered as AutoCAD 2023's
console answers them: Origin (`O`, `Specify new origin point <0,0,0>:`, the axes kept,
`Invalid point.`), 3point (`Specify new origin point <0,0,0>:`,
`Specify point on positive portion of X-axis <101.0000,0.0000,0.0000>:`,
`Specify point on positive-Y portion of the UCS XY plane <99.5528,0.8944,0.0000>:` — a unit along
the current X, then square to the new X in the current XY plane, written in the current UCS;
`Coincident with first point`, `Points are colinear`, which the first prompt's points now say too),
Entity (OBject's older name), Move (`Specify new origin point or [Zdepth]<0,0,0>:`, the default
against the list as the string writes it; Zdepth `Specify Zdepth<0>:`, a distance or two points
along the current Z, `Requires numeric distance or two points.`), orthoGraphic
(`Enter an option [Top/Bottom/Front/BAck/Left/Right]<Top>:`, its default the orthographic UCS the
current one was set as, else Top) and its six views typed straight (`T`, `B`, `FR`, `BA`, `L`,
`RI`): at the WCS's origin with the console's axes (Bottom's X is -1,0,0), the UCS named `*TOP*` …
`*RIGHT*` until another is set (saved in the drawing; -VIEW's orthographic views name it too),
Restore, Save, Delete and `?` (NAmed's prompts; the listing asks the first prompt again), New
(`Specify origin of new UCS or [ZAxis/3point/OBject/View/X/Y/Z] <0,0,0>:`: a point moves the origin,
Enter is World whatever its `<0,0,0>` says, its words and the unlisted Origin and Entity do what the
first prompt's do); es from the table (`ORigen`, `3p`, `Entidad`, `DEsplazar`, `Ortogonal` — so `O`
is Ortogonal there —, `Nuevo`, `SUperior` … `Derecha`, `profundidadZ`, `*SUPERIOR*`,
`Precise nuevo punto de origen o [profundidadZ]<0,0,0>`; **unverified**, no Spanish console);
LASTPOINT where the console leaves it — the WCS's origin as UCS starts (so `@` and a number at its
first prompt and at OBject's pick are from there), then the last point given: an origin (3point's
and ZAxis' Enter giving the current one), ZAxis' Z point, 3point's third point, OBject's pick, the
first prompt's third point, typed or clicked (`*100,100` is the WCS's 100,100, p401) — never a
point on X, an angle given by a point, nor Enter at Origin, Move or New; U the WCS's origin, but
where a UCS made at the first prompt left it, REDO where the UCS left it (p163, p164); U after a
run that changed nothing but moved it (OBject on nothing) the WCS's origin too (p166)

**Missing:** the listing's `Press ENTER to continue:` (the console pauses there; no page is
long enough here), Group at OBject's picks, **unverified**: where OBject reads an ellipse, a
polyline or a spline taken by a mode (at its start here), a point default at the drawing's precision
(`<5.00,5.00,1.00>`, where AutoCAD's LUPREC 4 writes `<5.0000,5.0000,1.0000>`); **unverified**: es's
replace prompt, composed from the table's `El SCP "AA" ya existe. Reemplácelo.` and the yes-or-no
question's `? <N>`; Face (no solids; listed at the first prompt and declared at New's, `F` is
refused rather than read as `FRont`), Apply, the Zdepth an orthographic UCS keeps (UCSBASE,
ORTHOGRAPHICUCS), Previous after 3point's Enter left the UCS as it was (the console steps back to
that same UCS), the name New's Enter leaves (**unverified**), OBject on a dimension (its UCS at
creation is not stored) or a hatch, UCSMAN, the icon's grips (UCSSELECTMODE), UCSFOLLOW, UCSVP,
UCSDETECT, the crosshair turning with the UCS (it stays upright on screen; PLAN makes the two agree)

### `UCSICON` · es `SIMBSCP`

**Implemented:** `Enter an option [ON/OFF/Noorigin/ORigin] <ON>:` (es
`Indique una opción [ACT/DES/Sin origen/Origen] <ACT>`; `Invalid option keyword.`), the current
state as the default: ON / OFF / Noorigin / ORigin (UCSICON, saved in the drawing, undoable, 3 by
default); the icon of 2D wireframe — X and Y arms with their letters, a square at the origin when
the UCS is the WCS — on the origin while it fits, else in the lower-left corner (lifted clear of the
status readout); off the plan its arms are projected, and with the XY plane seen edge-on it is the
broken pencil (**unverified** for a 2D icon); `'UCSICON`, at the Command prompt or mid-command (es
also bare, `UCSICON`, its command being SIMBSCP), sets the system variable as AutoCAD 2023's console
asks it: `Enter new value for UCSICON <3>:` (es `Indique nuevo valor para UCSICON <3>`), 1 for the
icon shown plus 2 for it at the origin (else `Requires an integer between 0 and 3.`), one undo step

**Missing:** All, Selectable, Properties (the UCS Icon dialog: style, size, colour)

### `ELEV` · es `ELEV`

**Implemented:** `Specify new default elevation <0.00>:`, then
`Specify new default thickness <0.00>:` (es `Precise nueva elevación por defecto`,
`Precise nueva altura de objeto por defecto`), each offering the current value (a negative thickness
extrudes down), what is no distance refused with `Requires numeric distance or two points.`, as
AutoCAD 2023's console does; ELEVATION and THICKNESS are saved in the drawing and change as one undo
step once both are answered (Escape at the second changes neither)

**Missing:** the variables typed by name (no SETVAR yet)

**The last point (LASTPOINT):** 0,0,0 in a new drawing, then the last point a prompt took — picked,
snapped, typed, FROM's base until its offset is given (Enter at `<Offset>` leaves it there, probe
line/p164) or a length along the cursor; LINE's Undo steps it back to the vertex before —, and the WCS's origin as UCS starts, which only a point given at its prompts moves
(after X / Y / Z, View, World, Previous or a restored name it is still there: `ID @` reads `-30,0,0`
in a UCS at 30,0), while -VIEW's orthographic UCS leaves it; when U takes a UCS back, where it was
if the UCS was made at its first prompt, else the WCS's origin, REDO putting it again where the UCS
left it. `@` at a first point is relative to it, and Enter at DIST's first point takes it. A number
typed for a point, at the command line or in the box, is a direct distance from the prompt's base
point, from LASTPOINT where it has none (a first point), towards the cursor — the other way when
negative, LASTPOINT itself at `0` — at every prompt that picks a point, as AutoCAD 2023's console
takes `5` at LINE's, CIRCLE's, ID's and -PAN's first point and at CIRCLE 2P's second (LINE's again
in 2027's, p159, Ortho not bending it there, p160; each prompt
refusing what is no number, `FOO`, in its own words), and at a window's corners (ZOOM's,
`Select objects:`' — the first from LASTPOINT, the opposite one from the first corner) and at a
fence's and a polygon's points (the first from LASTPOINT, the next from the point before), at
`Select objects:`, at BREAK's `Select object:` and at TRIM's, EXTEND's, FILLET's and CHAMFER's
object prompts, where it is a typed pick — but at ARRAYRECT's unit cell's first corner it is the
cell's side; the cursor's last place on the drawing is kept while the mouse is off it, and with
none, or one on the point, it runs along the UCS's X (WHY: the console's cursor is fixed on its
screen, so its heading follows the view). A distance given by a point (CIRCLE's radius), a window's
corner (ZOOM Window's first one too), DIST's second point, COPY's second points and a keyword
(LINE's Close) leave it, and a transparent command keeps the one it interrupts (`@` after `'ID` is
still from the point before) — AutoCAD 2023's console, each followed by `ID @`. The runtime keeps
it, so every command shares it.

**What follows the UCS:** typed coordinates (`x,y`, `x,y,z`, `d<a`, cylindrical `d<a,z`, spherical
`d<a<b`, `@`, `#` from its origin — the tooltip's alone: the command window refuses it, even with
DYNMODE 3 (desktop d02, console probes line/p15, p28); `*` for the WCS — absolute, even at a second
point the box reads relative —, `@*` relative in the WCS), the angle fields of
LINE, PLINE, SPLINE, MOVE, COPY and ROTATE, the
status readout (X, Y and Z), the Properties palette's coordinate rows (X, Y and Z) and a line's
deltas (read and retyped), DIST's deltas and angles, ID, Ortho,
polar tracking and its readout, OTRACK guides, the snap lattice and the grid with its tinted axes;
the rotation TEXT, MTEXT, ATTDEF and INSERT ask for; HATCH's angle and origin (HPORIGIN 0,0);
DIMLINEAR's horizontal / vertical / Rotated; RECTANG; ARRAYRECT's rows and columns, its unit
cell's sides (arrays/p147) and the default spacing it and ARRAYPATH offer, the extents box measured
along the UCS's axes (p165, p310; in a tilted UCS the box in its plane, **unverified**); POLYGON's
first vertex before the cursor moves; BLOCK, which defines its objects in the UCS. **Not yet:** the
text angle of a dimension (Angle) and palette rotations (they stay in the WCS, as AutoCAD's TEXT and INSERT rows do).
In a tilted UCS all of it works in its XY plane, and so does every command: what is drawn lies in
it (or above it at ELEVATION), ROTATE turns about the UCS's Z and MIRROR's plane holds it. A WCS
point typed with `*` and no Z lies on the WCS's XY plane in every UCS, turned or tilted, whatever
ELEVATION (2027's console, probes line/p152, p153, p163). The commands with flat
geometry — TRIM, EXTEND, BREAK, OFFSET, JOIN, HATCH, ARRAYPATH's path and the dimensions — take
only objects parallel to the UCS's XY plane (and lines); AutoCAD projects some of the others
(PROJMODE), which is left out.

**How a typed number and angle are read** (decimal units, AUNITS 0; 2027's console, probes
line/p150, p151, p165): a number in a point, alone as a direct distance or in a value box as a
decimal (`.5`, `5.`, `+5`), with an exponent (`1e1`), a fraction (`1/2`) or a whole and a fraction
(`1-1/2`); `1'6"`, `0x10` and a dangling comma (`5,5,`) are the prompt's wrong answer. An angle —
after `<` in a point, in the angle override and in the tooltip's angle fields — as a number, in
degrees and minutes (`30d`, `30d30'`), radians (`0.5r`), grads (`50g`) or a surveyor's bearing
(`N45dE`, read from +X; the other quadrants `N…W`, `S…E`, `S…W` as the help describes them,
**unverified** in the console). **Missing:** seconds (`30d30'15"`), a bare bearing (`N`, `E`), the
other length units' forms (architectural `1'6"`, engineering; UNITS offers decimal only) and the
angle units AUNITS 1–4 (UNITS offers decimal degrees only).

**Where a point's Z comes from:** an object snap gives the object's Z there (OSNAPZ 0, not exposed;
a line's is interpolated along it, and Intersection needs the two objects to meet in 3D, while
Apparent Intersection is where they cross on the screen, on the first one — **unverified**, the
help only says it snaps where two objects "do not intersect in 3D space"; objects in different
planes have no Intersection yet); an OTRACK point the acquired point's (**unverified**), or that
plus the rise along its `+Z` / `-Z` guide; an
absolute point typed without a Z, or the bare cursor, ELEVATION above the XY plane of the UCS
(ELEV and DIST say so; one conceptual page keeps the last Z instead), a `*` one Z 0 in the WCS; a
relative one (`@*` too), a
typed length or angle, the last point's. Ortho, Polar and the snap lattice leave it alone, except
on the `+Z` / `-Z` guide of a 3D view, where the point is the base point's in plan and the height is
where the cursor is drawn along the guide (a snapped object's, under a snap), and a typed length
the base point's plus that length up or down. What LINE
draws has a Z at each end; a flat object (PLINE, SPLINE, CIRCLE, ARC, ELLIPSE, RECTANG, POLYGON,
TEXT, MTEXT, ATTDEF, INSERT) lies in the plane of the first point that fixed it,
and the others are projected onto it — what AutoCAD's PLINE does, and its CIRCLE 3P and ARC
through points at different heights (circle/p189, arc/p06). A dimension
lies at the current ELEVATION, whatever the Z of its origins or of its location, typed or snapped
(dimensions/p158, p169, p324); DIMBASELINE / DIMCONTINUE take the base dimension's
(**unverified**). Its origins' own Z is not kept (one elevation per dimension here; AutoCAD keeps
each definition point's).
MOVE, COPY, STRETCH and PASTECLIP displace in 3D, SCALE scales about a 3D base point, and BLOCK's
base point and the clipboard's have a Z. LINE, CIRCLE, ARC, PLINE and POLYGON give what they draw
the THICKNESS; RECTANG uses its own and TEXT none. The editing commands keep the Z: TRIM, EXTEND and
BREAK work in the UCS's XY plane (PROJMODE 1, EDGEMODE 0, not exposed) and give a line's new end
the Z along its slope; OFFSET keeps the plane, rise and thickness; FILLET, CHAMFER and JOIN need
their objects in one plane (FILLET and CHAMFER join two lines in any plane they share); HATCH lies
in its boundary's; a grip drags to a point as a click does.
