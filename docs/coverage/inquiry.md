# Measurement and inquiry

### `DIST` / `MEASUREGEOM` · es `DIST` / `DI` · `AREA` / `AA`

**Implemented:** Distance and Area modes; AREA asks
`Specify first corner point or [Object/Add area/Subtract area] <Object>:`,
`Specify next point or [Undo]:` and from the third point `[Undo/Total] <Total>:` (es
`Precise primer punto de esquina o [Objeto/Añadir área/Sustraer área] <Objeto>`,
`Precise punto siguiente o [desHacer/Total] <Total>`), its points picked or typed, Enter before the
third refused (`Point or option keyword required.`), Undo taking back a point and keeping the first
corner with AutoCAD's `All segments already undone.` / `Command has been completely undone.`, the
live area and perimeter on the readout; Total or Enter reports `Area = …, Perimeter = …` (es
`Área = …, Perímetro = …`) and ends, as AutoCAD's does; Add area and Subtract area keep a running
total, as AutoCAD 2023's console does: the first corner asks `[Object/Subtract area]` or
`[Object/Add area]` with no default (the mode's own keyword taken unlisted), the points
` (ADD mode)Specify next point or [Undo]:` and Object `(SUBTRACT mode) Select objects:` (es
`(modo AÑADIR) Designe objetos`, `(modo SUSTRAER)`; the points' es
` (modo AÑADIR)Precise punto siguiente o` composed as the English, **unverified**), each area
reported then `Total area = …` (es `Área total = …`, below zero when more is subtracted); Object
goes on picking until Enter, which, as a refusal at the first corner does, says the mode's last area
and total again; Enter at the first corner writes the total and ends; the first corner also takes
two words it declares but does not list: Entity (es `Entidad`), Object under its old name, and eXit
(es `SAlir`), which ends the command without a word, the total unsaid; Object (Enter at the first
corner) picks one object, or `Last`, and reports a circle's area and `Circumference`, an ellipse's,
a closed polyline's or spline's and a hatch's (its islands left out, their perimeters added:
hatch/p320) `Perimeter`, and an open
polyline's, spline's or elliptical arc's `Length` with the area its chord closes; anything else
`Selected object does not have an area` (es `El objeto seleccionado no tiene área`), asked again;
DIST asks `Specify first point:` (es `Precise primer punto`; `Invalid point.`) and
`Specify second point or [Multiple points]:` (es `Especifique segundo punto o [puntos Múltiples]`;
`Point or option keyword required.`), Enter at the first taking LASTPOINT and at the second
measuring to the first (LASTPOINT again), as AutoCAD's do; Multiple points asks
`Specify next point or [Arc/Close/Length/Undo/Total] <Total>:` (es
`Precise punto siguiente o [Arco/Cerrar/Longitud/desHacer/Total] <Total>`; Close once there is a
segment), writing the run so far before each (`Distance = 10.00`, es `Distancia = …`) and again
after a refusal; Close goes back to the first point, Close, Total and Enter write the run and end;
Length asks `Specify length of line:` (es `Precise longitud de línea`;
`Requires numeric distance or second point.`, Enter too) and goes on along the last segment (back
for a negative length; the UCS's X axis before there is one), a point there giving the length from
the last one; Undo takes back a point (`All segments already undone.` at the first); Arc asks
PLINE's arc prompt and options, `[Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]` with no
`<Total>` (es `[ángUlo/cEntro/Cerrar/Dirección/líNea/Radio/Segundo pto./desHacer]`), each arc's
length added to `Distance = …`, said again on switching to Arc or Line, its refusal
`2D point or option keyword required.` and the run (Total too, pline/p146); its CLose closes with
the tangent arc, straight and silent where none leaves that way (p146, p147), and Undo stays in Arc
whatever the segment left (p148), CEnter's included angle `Specify included angle:` with no Ctrl
clause (p145), as AutoCAD 2027's console does (the first arc leaves as PLINE's does, the way the
last line, arc or polyline drawn ends heading — a clockwise arc the way it was drawn, `<270>`,
p115 —, else east — the chord's `<0>` or `<90>` after Angle and Radius); its
two points picked or typed (one without a Z at the current elevation), the 3D distance, the angle in
and from the UCS's XY plane (0–360, as AutoCAD prints them) and ΔX / ΔY / ΔZ in the UCS, on the
readout while the second point is picked and then at the command prompt in AutoCAD's words
(`Distance = …,  Angle in XY Plane = …,  Angle from XY Plane = …` /
`Delta X = …,  Delta Y = …,   Delta Z = …`), and the command ends, as DIST does; `'AREA` or
`'_AREA`, at the Command prompt or mid-command, reads the AREA system variable, the last area AREA
measured in the session: `AREA = 50.00 (read only)` (es `AREA = 50.00 (sólo lectura)`), as AutoCAD
2027's console does (p324, p325, p359)

**Missing:** pick-an-existing-object modes, Radius, Angle, Volume, Arc and Length at its next point
and its green fill, an object at an angle to the UCS (not highlighted here; AutoCAD says
`Object not parallel with UCS.`),
angles at the drawing's precision (`53.13`, where AUPREC 0 writes `53`), Arc's CEnter → Angle
reading a number as a point (2027's console asks it as a point, `90` there a distance along the
cursor, p145: degrees here, until the desktop shows it), the Spanish report in the table's words (`Distancia = …, Ángulo en el plano XY = …, Ángulo a partir del plano XY = …` /
`Incremento X = …, Incremento Y = …,   Incremento Z = …`)

### `ID` · es `ID`

**Implemented:** `Specify point:` (es `Precise punto`; `Invalid point.`), picked, snapped or typed,
then ` X = …     Y = …     Z = …` (one space ahead, a value that rounds to zero unsigned, as AutoCAD
2027's console writes it, p315, p355) in the current UCS at the command prompt (p316, p317); the Z
is the object's with an object snap and the elevation plane's otherwise (p313); Enter ends it
without a word (p303); a preselection is dropped as it starts, as DIST and AREA drop it (p349–p351);
the rail's ID is its button's macro `'_id`, run inside a running command as `'ID` typed there
(acad.cuix, p320)
