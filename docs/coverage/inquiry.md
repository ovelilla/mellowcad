# Measurement and inquiry

### `DIST` · es `DIST` / `DI` · `AREA` / `AA`

**Implemented:** Distance and Area modes; AREA asks
`Specify first corner point or [Object/Add area/Subtract area] <Object>:`,
`Specify next point or [Undo]:` and from the third point `[Undo/Total] <Total>:` (es
`Precise primer punto de esquina o [Objeto/Añadir área/Sustraer área] <Objeto>`,
`Precise punto siguiente o [desHacer/Total] <Total>`; AutoCAD 2027 lists `[Arc/Length/Undo]`
there, p206, whose Arc and Length are missing), its points picked or typed (a bare number at the
first corner from LASTPOINT, p206, p207; in the UCS, p231, p232; a bow-tie's area 0, p233), Enter
before the third refused (`Point or option keyword required.`, p208), Undo taking back a point and
keeping the first corner with AutoCAD's `All segments already undone.` /
`Command has been completely undone.` (p241), LASTPOINT left at the last corner (p208, p357), the
corners drawn as AutoCAD's desktop draws them: the rubber band, solid, and from the second point the
polygon closed through the cursor filled translucent green under it, no area or perimeter shown
(desktop d03-1 to d03-3); Total or Enter reports `Area = …, Perimeter = …` (es
`Área = …, Perímetro = …`) and ends, as AutoCAD's does; Add area and Subtract area keep a running
total, as AutoCAD 2027's console does (p212–p216): the first corner asks `[Object/Subtract area]` or
`[Object/Add area]` with no default (the mode's own keyword taken unlisted), the points
` (ADD mode)Specify next point or [Undo]:` and Object `(SUBTRACT mode) Select objects:` (es
`(modo AÑADIR) Designe objetos`, `(modo SUSTRAER)`, ` (modo AÑADIR)Precise punto siguiente o`,
p212 es), each area reported then `Total area = …` (es `Área total = …`, below zero when more is
subtracted); Object goes on picking until Enter, which, as a refusal at the first corner and
`Resuming AREA command.` after `'AREA` there do (p213, p255), says the mode's last area and total
again; Enter at the first corner ends; the first corner also takes two words it declares but does
not list: Entity (es `Entidad`), Object under its old name, and eXit (es `SAlir`), which ends the
command as Enter does: both write the total once the run has measured something, and nothing before
(p215, p216, p254, p258); Object (Enter at the first corner) picks one object — clicked, a point
typed (circle/p241), a bare number at that distance from LASTPOINT towards the cursor (p219), where
a typed object snap finds its point (p228), or `Last` —, an object on a locked layer too (p220); a
point on nothing or off the screen is asked again without a word, anything else but `Last` refused
with `*Invalid selection*` / `Expects a point or Last` (p218, p240); a pick puts LASTPOINT there,
`Last` leaves it (p253); Enter there ends without a word (p217); it reports a circle's area and
`Circumference`, an ellipse's,
a closed polyline's or spline's and a hatch's (its islands left out, their perimeters added:
hatch/p320) `Perimeter`, and an open
polyline's, spline's or elliptical arc's `Length` with the area its chord closes; a closed wide
polyline's report is followed by `Polyline's width ignored in area calculation.` (es
`Grosor de polilínea ignorado en cálculo de área.`, p222; an open one's unprobed); anything else
`Selected object does not have an area` (es `El objeto seleccionado no tiene área`), asked again,
a spline in no plane too (spline3d/s01, s14), where one in a tilted plane is measured in it (s02,
s15);
DIST asks `Specify first point:` (es `Precise primer punto`; `Invalid point.`) and
`Specify second point or [Multiple points]:` (es `Especifique segundo punto o [puntos Múltiples]`;
`Point or option keyword required.`), Enter at the first taking LASTPOINT and at the second
measuring to the first (LASTPOINT again), as AutoCAD's do; Multiple points asks
`Specify next point or [Arc/Close/Length/Undo/Total] <Total>:` (es
`Precise punto siguiente o [Arco/Cerrar/Longitud/desHacer/Total] <Total>`; Close once there is a
segment), writing the run so far before each (`Distance = 10.00`, es `Distancia = …`) and again
after a refusal, and the run to the cursor heading the dynamic prompt once it has a segment
(`Distance = 45.0546` above `Specify next point or`, at Length the run so far; desktop d02-1, e02-1),
the run drawn as a solid rubber band to the cursor, no readout (d02-1); Close goes back to the first point, Close, Total and Enter write the run and end;
Length asks `Specify length of line:` (es `Precise longitud de línea`;
`Requires numeric distance or second point.`, Enter too; Escape there goes back to the next point,
`Specify length of line: *Cancel*` and the run said again, es `*Cancelado*`, desktop d05, e01) and
goes on along the last segment (back
for a negative length; before there is one the way a first arc leaves, along what was drawn last,
else the WCS's east, p157, p164), a point there giving the length from LASTPOINT (p118, p158), and
`0` adding no point, the run said again once it has a segment (p115, p162); Undo takes back a point
(`All segments already undone.` at the first); a typed `@`, a bare number and Ortho at the next
point read from LASTPOINT, which each point given moves and Length and a line's Undo leave where it
was (p160, p165–p167, p169–p171), and which switching to Arc and an arc's Undo put at the run's end
(p168, p172); Close leaves it at the last point given (p121); Arc asks
PLINE's arc prompt and options, `[Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]` with no
`<Total>` (es `[ángUlo/cEntro/Cerrar/Dirección/líNea/Radio/Segundo pto./desHacer]`), each arc's
length added to `Distance = …`, said again on switching to Arc or Line, its refusal
`2D point or option keyword required.` and the run (Total too, pline/p146); Escape at a prompt an
arc option opened (`Specify second point on arc: *Cancel*`) goes back to the arc's endpoint prompt,
saying the run again, and at that prompt cancels (desktop d05); its CLose closes with
the tangent arc, straight and silent where none leaves that way (p146, p147), and Undo stays in Arc
whatever the segment left (p148), CEnter's included angle `Specify included angle:` with no Ctrl
clause (p145), as AutoCAD 2027's console does (the first arc leaves as PLINE's does, the way the
last line, arc or polyline drawn ends heading — a clockwise arc the way it was drawn, `<270>`,
p115 —, else east — the chord's `<0>` or `<90>` after Angle and Radius); its
two points picked or typed (one without a Z at the current elevation), the 3D distance, the angle in
and from the UCS's XY plane (0–360, as AutoCAD prints them) and ΔX / ΔY / ΔZ in the UCS, at the
command prompt in AutoCAD's words
(`Distance = …,  Angle in XY Plane = …,  Angle from XY Plane = …` /
`Delta X = …,  Delta Y = …,   Delta Z = …`; es `Distancia = …, Ángulo en el plano XY = …, …`, p100),
the angles at AUPREC (p142), and the command ends, as DIST does; while the second point is picked
the rubber band alone, solid, from the first, no marker or readout (desktop d01-1 to d01-3; the
dimension of its length that AutoCAD's dimensional input adds is drafting-aids.md's); Escape cancels
at every prompt but those a keyword opened (desktop d05); a bare number at the second point
runs towards the cursor as Ortho bends it from the first (p141), a typed point left alone (p140);
the object snaps and FROM typed at either point (p135–p138); `'AREA` or
`'_AREA`, at the Command prompt or mid-command, reads the AREA system variable, the last area AREA
measured in the session, or after Add area or Subtract area the total (p211–p214, p248):
`AREA = 50.00 (read only)` (es `AREA = 50.00 (sólo lectura)`), as AutoCAD
2027's console does (p324, p325, p359). AREA's Object measures a level 3D polyline as a polyline at its Z (3dpoly/p16) and refuses one whose vertices are not at one Z with `3D Polyline vertices had differing Z coordinates.` (es `Vértices de polilínea 3D con coordenadas diferentes.`, table 20170), AREA and PERIMETER 0, and ends (p15); in Add or Subtract area unprobed.

**Missing:** MEASUREGEOM (es MEDIRGEOM), another command with DIST's and AREA's prompts inside a
loop: `Move cursor or [Distance/Radius/Angle/ARea/Volume/Quick/Mode/eXit] <eXit>:` (es
`Desplace el cursor o [Distancia/RAdio/ángUlo/áRea/Volumen/ráPido/Modo/Salir] <Salir>:`, p105,
p106), then after each measure `Enter an option [...] <Distance>:` until eXit (p360, p361), with
Radius, Angle, Volume and Quick; the ribbon's Distance and Area buttons run it
(`^C^C_MEASUREGEOM _distance`, `_area`), the rail DIST and AREA, whose prompts are its Distance and
Area word for word; AREA's corners off the UCS's XY plane,
which AutoCAD measures in 3D (p256: `Area = 61.2372, Perimeter = 36.5028`) and of which it refuses
some later ones with `Lines are not coplanar.` by a rule p249–p252 do not settle (a coplanar one
refused, p251, one off the plane taken, p252): mellowcad measures their plan; AREA's Arc and Length
at its next point (AutoCAD's Length steps back at Escape as DIST's does, desktop d05), an
object at an angle to the UCS (not highlighted here; AutoCAD says `Object not parallel with UCS.`),
Arc's CEnter → Angle reading a number as a point (2027's console asks it as a point, `90` there a
distance along the cursor, p145: degrees here, until the desktop shows it); the `?` badge beside the
cursor at DIST's and AREA's prompts is with the other cursor badges in drafting-aids.md

### `ID` · es `ID`

**Implemented:** `Specify point:` (es `Precise punto`; `Invalid point.`), picked, snapped or typed,
then ` X = …     Y = …     Z = …` (one space ahead, a value that rounds to zero unsigned, as AutoCAD
2027's console writes it, p315, p355) in the current UCS at the command prompt (p316, p317); the Z
is the object's with an object snap and the elevation plane's otherwise (p313); Enter ends it
without a word (p303); a preselection is dropped as it starts, as DIST and AREA drop it (p349–p351);
the rail's ID is its button's macro `'_id`, run inside a running command as `'ID` typed there
(acad.cuix, p320)

### `LIST` / `LI` / `LS` · es `LIST` / `LS` / `LT`

**Implemented:** `Select objects:` (es `Designe objetos`), a set of whole objects (`FOO` refused
with the modes up to `SIngle`, p421), objects on a locked layer taken in silence (p426); Enter on
nothing ends without a word (p421); a preselection is listed at once, without the prompt, and
dropped (p421, p440), the set staying the Previous one (p420); not transparent (`'LIST` refused,
p425); one undo step U names `LIST` (p440). The order is the set's as AutoCAD builds it: picks as
picked (p435), what one mode finds at once — ALL, a window, Previous — newest first (p420), a
preselection newest first (p421). Each object's report is written at the command prompt in AutoCAD
2027's columns, word for word in English and Spanish (acdb26res.dll's tables; the console,
QAFLAGS 2, p400–p446): its type and `Layer: "0"` (es `Capa`), `Space: Model space` (es
`Espacio: Espacio modelo`), `Color: 1 (red)    Linetype: "DASHED"` when either is not ByLayer (an
index colour by number and name, any other `255,128,0`; a linetype as acadiso.lin names it,
`BYLAYER` / es `PORCAPA` for the other, p401, p427), `LineWeight: 0.30 mm` and `Thickness =`
(es `GrosorLínea`, `Alt-objeto`) when set; every point and direction in the current UCS (p424),
`Extrusion direction relative to UCS:` and the normal when it is not the UCS's Z (p424, p436,
p437, each type's line where the console puts it); lengths at LUPREC and angles at AUPREC,
padded as the console's printf widths pad them (`%9`, `%6`, `%-9`: p423, p438), the areas of an
LWPOLYLINE and a HATCH unpadded (p438, p441). LINE: from and to, the length and angle in the XY
plane, `In Current UCS,` and the `3D Length` and angle from the plane when it rises (p401, p427),
the deltas. CIRCLE: centre, radius, circumference, area. ARC: centre, radius, start and end angle
and length, or off the UCS's plane the length and `total angle` (p436). ELLIPSE: area and
circumference, or an arc's length, centre, the axes as vectors, an arc's ends and ELLIPSE's
angles, the radius ratio (p404). SPLINE: length, or closed area and circumference — no area for
one that crosses itself (p429, p444) —, order, `Planar`/`Non-Planar`, `Rational`, `Periodic`,
the parametric range on its own knots (a fit spline's chord sums, p405), the control points (a
periodic one's loop, p406) with each weight (p429), and a fit spline's fit points (a closed one's
first again), `Fit point tolerance: 1.0000E-10` and its tangents (p428). LWPOLYLINE: `Open` or
`Closed` (es `Abrir`, `Cerrada`), its thickness, `Constant width` or each segment's widths, area
and length or perimeter, each vertex `at point` with its segment's arc (bulge, centre, radius,
angles, p407, p408). A fitted polyline is AutoCAD's POLYLINE, its VERTEX entries and END
SEQUENCE: a Fit's joints `(Inserted by curve fitting)`, a Spline's frame `(Spline control point)`
round its curve's points `(Inserted by spline fitting)` (p409, p430, pedit/p177); Decurve makes
it an LWPOLYLINE again (p409). A 3D polyline: `Open space` / `Closed space`, its vertices' vector
area, its length, each VERTEX `Space` (p410, 3dpoly/p08). TEXT and ATTDEF: style, `Annotative: No`,
`Typeface = Arial`, the point its justification names (`start`, `mid`, `top/left`…, p431),
height, text or default, prompt and tag, the rotation (none off the UCS's plane, p436), width
factor, obliquing, an ATTDEF's flags, generation (p411, p413). MTEXT: location, width, normal,
rotation, text height, `Multiple (1x = 4.1667)` or `Exactly (0.48x = 2.0000)`, attachment
(`TopLeft`, es `SIzquierda`…), flow direction, contents (p412, p432). DIMENSION: `associative:
no`, the type (`horizontal`, `vertical`, `rotated` and its angle, `aligned`, `<linear, not
parallel to UCS>` off the plane, `arc` for an angular one, `radial`, `diameter`), its defining
points (a linear one's where its line meets the second extension line; an angular one's arc point
a third of the way round, p415), the text angle, the text position `default` or `user specified`
(a radial one's always), `default text` or `dimension text modifier: …`, the style, a radial
one's `DIMUPT On` override as the console writes it (p416, p439), `Annotative: No` (p414). HATCH:
pattern, `Annotative: No`, scale and angle (not SOLID's), `Not associative`, area, origin (p417).
BLOCK REFERENCE: block name, insertion point, the three scales and rotation (none off the plane,
p437), `InsUnits:` the drawing's unit, `Unit conversion: 1.0000`, `Scale uniformly: No`,
`Allow exploding: Yes`, then each ATTRIBUTE as the reference shows it (its Y scale the height,
X over Y the width factor: 7.5000 and 0.6667 at 2 by 3, p418) and END SEQUENCE. ARRAY:
rectangular, polar and path, each row of the console's report (arrays/p401–p406, p419, p434).
WHY no `Handle = 2d7` line: the model has no handles, and an id made up as one would read as
AutoCAD's. WHY every line at once, with no `Press ENTER to continue:` (es
`Pulse INTRO para continuar:`) each screenful: the pause pages AutoCAD's text window, whose height
is the desktop's (the console pauses every few lines without QAFLAGS 2, p422), and the history here
scrolls. WHY on the top bar, after the linetype, not the rail: it is the ribbon's Properties
panel's (acad.cuix RBN_01740411, `^C^C_list`), which the top bar is here

**Missing:** the area of an open curve-fit polyline, which AutoCAD's LIST and AREA give larger
than the curve closed by its chord (p409, p445: 138.8091 where it closes 127.9336; no bulge on
its last vertex explains it, p446); a spline's length as AutoCAD's console approximates it
(32.6835 for the exact 32.6829, p406, p428, p444; here exact); a dimension's default text position
as the console's font sets it (11.9014 over a line at 10, where the desktop's palette reads 11.875,
dimensions/d04-2, as here; with a text angle the console's lies on the line, p433); DIMANGULAR's
two-line form, `type: angular` with each line's points (p415: the model keeps the three-point
one); `associative: yes` for a dimension picked on its object (p416, p439: none is associative
here); the MTEXT `Text height:` line p432's two leave out, for no reason p442 and p443 found; the
desktop's pause and its text window; **unverified**, unprobed: a hatch off the UCS's plane, an
ATTDEF's extrusion line, a fitted polyline's thickness, a closed spline-fit one's order, a 3D
polyline's Spline (`Open spline space`), a closed spline in no plane, an open heavy polyline's
last widths, a clockwise ring (`CW`, es `Horaria` from table 27647), a path array's Divide
spacing, the ring's and the path's rows (one and a half times the source, as ARRAYRECT's
defaults), what no model here holds (ByBlock, `LineWeight: Default`, per-object linetype scale,
transparency, groups, a block's units other than the drawing's)
