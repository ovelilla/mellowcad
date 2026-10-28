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
`Selected object does not have an area` (es `El objeto seleccionado no tiene área`), asked again;
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
2027's console does (p324, p325, p359)

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
