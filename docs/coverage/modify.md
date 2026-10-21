# Modify

### `MOVE` / `M` · es `DESPLAZA` / `D`†

**Implemented:** `Select objects:` (es `Designe objetos:`), each pick writing what it found on that
line — `1 found`, `1 found (1 duplicate), 2 total`, a window's `Specify opposite corner: 3 found`,
Shift's `1 found, 1 removed, 1 total` (es `1 encontrados`, `1 encontrados, eliminados 1, 1 total`,
`Designe esquina opuesta:`) — with the selection modes (Command line, `Select objects:`), and
objects selected before it counted after the command's echo, `Command: M MOVE 1 found`;
`Specify base point or [Displacement] <Displacement>:` — Displacement, or Enter, asks
`Specify displacement <0.0000, 0.0000, 0.0000>:` (the last one given in the drawing, MOVE's own;
per drawing, not saved, NEW and OPEN putting it back to 0, rectang/p314, p315) and moves by
the point typed, then ends — and `Specify second point or <use first point as displacement>:` (es
`Precise punto base o [Desplazamiento] <Desplazamiento>`, `Precise desplazamiento`,
`Precise segundo punto o <usar primer punto como desplazamiento>`); noun-verb and verb-noun, box
select, displacement + angle field; the displacement is 3D (`@0,0,5` lifts); Enter at the second
point uses the first point as the displacement; a whole ellipse moves with its centre and stays for a quadrant alone
(ellipse/p326, p331)

**Missing:** the selection modes' gaps (Command line, `Select objects:`); an elliptical arc with an
end in the window: AutoCAD moves that end and keeps the other, the arc an affine image of itself
with its parameter sweep kept (ellipse/p324, p333, p336–p338; p332 moved an end lying 0.14 outside
the window), whose rule no probe has fixed yet (ELLIPSE-D44); here the arc moves whole with its
centre, else stays

### `COPY` / `CO` · es `COPIA` / `CP` / `DUP`†

**Implemented:** MOVE's selection and base point, then `Current settings:  Copy mode = Multiple` (es
`Parámetros actuales:  modo de copia = Múltiple`),
`Specify second point or <use first point as displacement>:` and once a copy is placed
`Specify second point or [Exit/Undo] <Exit>:` (es
`Precise el segundo punto o [Salir/desHacer] <Salir>`, with the `el` the program prints and its help
does not); repeated placement (AutoCAD Multiple behaviour), Undo taking back the last copy;
Displacement places one copy and ends, its `<default>` COPY's own last one, not MOVE's (rectang/p314),
back to 0 at NEW and OPEN

**Missing:** mOde (COPYMODE is always Multiple, so the base point offers `[Displacement]` alone),
Array (so the second point's `[Array]` is not offered)

### `ROTATE` / `RO` · es `GIRA` / `GI`†

**Implemented:** `Current positive angle in UCS:  ANGDIR=counterclockwise  ANGBASE=0` (es
`Ángulo actual positivo en SCP:  ANGDIR=en sentido horario inverso ANGBASE=0`), `Select objects:`
(MOVE's counts), `Specify base point:`, `Specify rotation angle or [Copy/Reference] <0>:` — Copy
says `Rotating a copy of the selected objects.` (es
`Girando una copia de los objetos seleccionados.`), again at each Copy, and stays listed — then
Reference's `Specify the reference angle <0>:` (typed, or two points: `Specify second point:`) and
`Specify the new angle:` (es `Precise punto base`,
`Precise ángulo de rotación o [Copiar/Referencia]`, `Precise ángulo de referencia`,
`Precise el nuevo ángulo`); pivot + angle (Enter takes the last angle, 0 in each drawing: per
drawing, not saved, rectang/p314),
Copy, Reference; about an axis parallel to the UCS's Z ("the Z axis of the UCS determines the axis
direction for rotating objects about a point"); an elliptical arc keeps its parameters
(ellipse/p322)

**Missing:** the new angle's `[Points]` and `<default>` (so it asks `Specify the new angle:`; Enter
there ends ROTATE, **unverified**); defaults written at the drawing's precision (`<0.00>`) where
AutoCAD's AUPREC 0 writes `<0>`

### `SCALE` / `SC` · es `ESCALA` / `ES`†

**Implemented:** `Select objects:`, `Specify base point:`,
`Specify scale factor or [Copy/Reference]:` — Copy says `Scaling a copy of the selected objects.`
(es `Escalando una copia de los objetos seleccionados.`), again at each Copy, and stays listed —
then Reference's `Specify reference length <1.0000>:` (typed, or two points) and
`Specify new length or [Points] <1.0000>:` (typed, or a point measured from the base point; Points
asks `Specify first point:` and the second, the length between them;
`Requires numeric distance, second point, or option keyword.`, at Points
`Requires numeric distance or two points.`), both defaults the last lengths given, 1 in each
drawing (a factor typed leaves them), as AutoCAD 2023's console asks them (es
`Precise factor de escala o [Copiar/Referencia]`, `Precise longitud de referencia`,
`Precise nueva longitud o [Puntos]`); factor (Enter takes the last one, 1 in each drawing — per
drawing, not saved, rectang/p315 —, though the prompt shows no default, as AutoCAD's 2026 one shows
none), Copy, Reference; in 3D about
the base point, elevation, a line's rise and thickness included; an elliptical arc keeps its
parameters and ratio (ellipse/p323)

**Missing:** Enter at Points' `Specify first point:` ends the command unscaled (AutoCAD 2023's
console scales by a length of its own there)

### `MIRROR` / `MI` · es `SIMETRIA` / `SI`†

**Implemented:** `Select objects:`, `Specify first point of mirror line:`,
`Specify second point of mirror line:`, `Erase source objects? [Yes/No] <No>:` (es
`Precise primer punto de línea de simetría`, `Especifique segundo punto de línea de simetría` —
Autodesk's table words the two otherwise —, `¿Borrar objetos de origen? [Sí/No] <No>`); two-point
axis, erase-source Yes/No prompt; the mirror plane holds the two points and the UCS's Z; a
mirrored spline keeps its +Z normal, as AutoCAD's does (spline/p320), unlike an ellipse

**Missing:** MIRRTEXT; an ellipse's normal: AutoCAD turns a mirrored ellipse over, its normal −Z,
its parameters kept and its major axis on the mirrored end (ellipse/p320, p321), where this app
keeps +Z and reflects the range, the same curve — its Start angle and End angle (260° and 350°
where AutoCAD reads 10° and 100°), and BREAK of it keeping the other piece (p329: AutoCAD keeps
three quarters, Area 3570.243), differ. WHY not built: an ellipse turned to −Z no longer reads in
plan here, so TRIM, EXTEND, BREAK, OFFSET, JOIN, HATCH and its grips would refuse it (ELLIPSE-D43)

### `ARRAYRECT` · es `MATRIZRECTANG` / `MATRIZ`† / `MA`†

**Implemented:** `Select objects:` (MOVE's counts), `Type = Rectangular  Associative = No` (es
`Tipo = Rectangular  Asociativa = No`, composed from the table's words: **unverified**), then
`Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:` (es
`Seleccione un pinzamiento para editar la matriz o [COntar/Espaciado/Columnas/Filas/Salir] <Salir>`)
over a live preview, 4 columns along the UCS's X and 3 rows along its Y, one and a half times the
selection's width and height apart (1 where it has none); COUnt asks
`Enter the number of columns <4>:` and `Enter the number of rows <3>:`, Spacing
`Specify the distance between columns or [Unit cell] <15.00>:` and
`Specify the distance between rows <1.00>:` — Unit cell asks
`Specify first corner point of unit cell:` and `Specify opposite corner:`, picked or typed, and the
cell's sides are the distances between columns and rows (negative to the left or below); Enter at
either corner leaves them, a positive number at the first makes both that (a square cell) and a
number at the opposite one is a direct distance from the first, `FOO`, `0` or a negative number at
the first says `Requires numeric nonzero value.` and leaves Unit cell, at the opposite one
`Invalid point.`, as AutoCAD 2023's console does (es `[célula de Unidad]`,
`Precise primer punto de esquina de la celda de unidad`,
`Necesita un valor numérico distinto de cero.`; the opposite corner's `Precise esquina opuesta`:
**unverified**, the table has two) —, COLumns the number and the distance of the columns, Rows those
of the rows and `Specify the incrementing elevation between rows <0.00>:` (each row that much
higher); es `Indique el número de columnas`, `Especificar la distancia entre columnas` (Spacing's;
COLumns' `Especifique…`), `Especifique la elevación incremental entre filas`; a count refuses 0
(`Value must be positive and nonzero.`) and a fraction
(`Requires a positive nonzero integer or option keyword.`); eXit or Enter makes the copies, one undo
step; Escape none

**Missing:** associative arrays (WHY Associative = No: an array object is not modelled, so the
copies are plain geometry, as with AutoCAD's ASsociative No — the keyword is not offered), the grips
the main prompt picks, Base point, Levels, Total, MAXARRAY's message, Expression (WHY not built: it
ties an associative array to the drawing's parameters, and with Associative = No and no Parameters
Manager it would only be a calculator; AutoCAD 2023's console:
`Enter the number of columns or [Expression] <4>:`, then `Enter expression<4>:`, arithmetic with
`^`, `%`, parentheses and functions — `sqrt(16)`, `max(2,5)`, `SQRT(9)` — refusing `FOO` with
`The syntax is incorrect or a variable is not defined.  Reenter the expression or value.` and a
fraction with `Requires an integer between 1 an 32767, or option keyword.`)

### `ARRAYPOLAR` · es `MATRIZPOLAR`

**Implemented:** `Select objects:`, `Type = Polar  Associative = No`,
`Specify center point of array:` (es `Precise el punto central de la matriz`), then
`Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>:` (es
`[Elementos/ángUlo entre/ángulo de Relleno/Girar objetos/Salir] <Salir>`) over a live preview, 6
items over 360° at first: Items `Enter number of items in array <6>:`, Angle between
`Specify angle between items <60.00>:` (the fill becomes that many steps), Fill angle
`Specify the angle to fill (+=ccw, -=cw) <360.00>:` (a whole turn spaces the items fill / count, any
other fill / (count − 1)), ROTate items `Rotate arrayed items? [Yes/No] <Yes>:` (es
`Indique el número de elementos de la matriz`, `Indique el ángulo entre elementos`,
`Precise el ángulo que se debe rellenar (+ =antihorario, -=horario)`,
`¿Girar elementos de la matriz?`); eXit or Enter makes the copies

**Missing:** associative (as ARRAYRECT's), Base point, Axis of rotation, ROWs, Levels, Expression
(as ARRAYRECT's), the grips, the 360° overrun question
(`Adjust angle between to fit items to 360 degrees?`)

### `ARRAYPATH` · es `MATRIZCAMINO`

**Implemented:** `Select objects:`, `Type = Path  Associative = No`, `Select path curve:` (es
`Seleccione la curva de trayectoria`; a line, a circle or an arc; one of the arrayed objects says
`Objects selected to be arrayed may not be selected as path curve.` and `1 was filtered out`; the
selection modes typed there — Window, Last, Crossing, BOX, ALL, Fence, WPolygon, CPolygon, Previous,
AUto — take the newest curve they find, leaving out the arrayed objects with `1 was filtered out`
and saying `No object found` with none, as AutoCAD 2023's console does; a point typed there picks as
a click does, leaving LASTPOINT as it was, and one on nothing — typed or clicked — starts a window
(`Specify opposite corner:`), as the AUto it lists makes it, which says nothing when it finds
nothing), then `Select grip to edit array or [Method/Items/Align items/eXit] <eXit>:` (es
`[Método/Elementos/ALinear elementos/Salir] <Salir>`) over a live preview: Method
`Enter path method [Divide/Measure] <Measure>:`, Items by Divide `Enter number of items along path`,
by Measure `Specify the distance between items along path`, `Maximum items = 11` and
`Specify number of items or [Fill entire path] <5>:`, Align items
`Align arrayed items to path? [Yes/No] <Yes>:` (es from the table); Measure at first, the items one
and a half times the selection's size apart and filling the path; the source is consumed into the
array, the path left in place

**Missing:** multi-segment polyline path, associative (as ARRAYRECT's), Base point, Tangent
direction, Rows, Levels, Z direction, Expression (as ARRAYRECT's), the grips

### `TRIM` / `EXTEND` · es `RECORTA` / `RR`† · `ALARGA` / `AL`†

**Implemented:** `Current settings: Projection=UCS, Edge=None, Mode=Quick` (es
`Parámetros actuales: Proyección=SCP, Arista=Ninguno, Modo=Rápido`; `Mode=Standard`, es
`Modo=Estándar`; `Edge=Extend`, es `Arista=Alargar`, in Standard mode only), then
`Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:` (es
`Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar]:`)
and EXTEND's `Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde]:` —
AutoCAD's words but Project, Fence unlisted as there; after the first edit `…/eRase/Undo]:` (es
`…para alargar, o [aristas de COrte/Captura/MOdo/bOrrar/desHacer]:`, EXTEND
`Seleccione un objeto que alargar o use la tecla Mayús y seleccione para recortar, o [aristas de COrte/Captura/MOdo/desHacer]:`,
as the 2027 Spanish language pack's string table, paired with the English by id words them), whose
Undo takes back the command's last edit and, back at its start, says
`Command has been completely undone.` and is offered no more (typed with nothing to take back, it is
taken saying nothing, as the console does); TRIM's eRase (`R`, es `O`) asks
`Select objects to erase or <exit>:` (es `Designe objetos que borrar o <salir>:`),
`Select objects to erase:` (es `Designe objetos que borrar:`) once its set holds something, as
`Select objects:` asks a set of whole objects (its modes, counts and refusal), Enter erasing the set
as one Undo step of the command's and asking the object again — with nothing in the set Enter ends
the command, as the console's does; EXTEND has none (`R` is refused); mOde (`O`, es `MO`) asks
`Enter a trim mode option [Quick/Standard] <Quick>:` (es
`Introduzca una opción de modo de recorte [Rápido/Estándar] <Rápido>:`; EXTEND
`Enter an extend mode option…`, es `…de modo de alargamiento…`), the mode in force its default,
which Enter keeps, anything else `Invalid option keyword.`; the mode is TRIM's and EXTEND's both
(TRIMEXTENDMODE) and lasts the session — AutoCAD keeps it in the registry, across sessions; Standard
lists Fence and Edge (`[cuTting edges/Fence/Crossing/mOde/Edge/eRase]`, EXTEND
`[Boundary edges/Fence/Crossing/mOde/Edge]`), starts the command with `Select cutting edges ...` (es
`Seleccione aristas de corte...`; EXTEND `Select boundary edges ...`, es
`Seleccione las aristas de contorno...`) and `Select objects or [mOde] <select all>:` (es
`Seleccione objetos o [MOdo] <seleccionar todo>:`), then `Select objects:` as its set holds
something — Enter with none takes every object, mOde there back to Standard asks it again, to Quick
takes every object —, leaves an object no edge crosses, saying
`Does not intersect with the cutting edge.` (es `No se interseca con la arista de corte.`), which
Undo does not count, and starts a crossing window at a pick on nothing, however it is drawn, its
opposite corner asked on the prompt; switched to mid-command, every object is an edge until some are
chosen; cuTting edges (`T`, es `CO`; EXTEND's Boundary edges `B`) says the settings again,
`Select cutting edges ...` and `Select objects or <select all>:` (es
`Seleccione objetos o <seleccionar todo>:`), in either mode, which stays: the objects chosen are the
only edges — whatever mode follows, and an edge's pieces with it —, Quick still deleting what none
crosses; a polyline is cut at its own vertices only when it is an edge itself, and otherwise trimmed
along it, past them, back to the nearest crossings (a closed one cut once refused as
`Curve must intersect cutting edges at least twice.`, **unverified**); Edge (`E`, es `A`, Standard's
alone — Quick refuses it) asks
`Enter an implied edge extension mode [Extend/No extend] <No extend>:` (es
`Indique modo de alargamiento de arista implícito [Alargar/No alargar] <No alargar>:`), the mode in
force its default, Enter keeping it; with Extend (EDGEMODE 1, shared and lasting the session as the
trim mode does) an edge cuts, and bounds an extension, where it would run on — a line both ways, an
arc and an elliptical arc round their whole curve, an open polyline from its ends along its end
segments (an arc end segment round its circle, **unverified**) —, never in Quick mode; a choice is
an Undo step joined to the edit after it, and a U right after it takes it back with the edit before
it, as the console does; a point typed picks there, as the console takes it (`@` from LASTPOINT, a
number a direct distance from it towards the cursor, which it then is), and a point on nothing,
clicked or typed, starts AutoCAD's crossing fence of two points
(`Specify next fence point or [Undo]:`, es `Precise punto del borde o [desHacer]`): its next point —
`@` and a number from the first, which stays LASTPOINT — closes it; Undo there keeps the first point
and asks again, Enter ends the command, the same point is
`Invalid point, polygon segment is zero length.` and anything else `Invalid response.`, as AutoCAD
2023's console has it (it also echoes the prompts once more, bare, around the fence, a jig's echo);
Fence (`F`, es `B`, unlisted) asks `Specify first fence point or pick/drag cursor:` (es
`Precise primer punto del borde o designe/arrastre cursor:`), then the next point until Enter — with
no point or one too —, Undo dropping the last point and refused at the first (`Invalid response.`),
its points leaving LASTPOINT; Crossing (`C`, es `Captura`) asks `Specify first corner:` (es
`Designe primera esquina:`), which takes the prompt's words unlisted (Fence, Crossing again, Undo as
the command's) and becomes LASTPOINT, Enter there ending the command, then the opposite corner on
the prompt said again (`…or [Crossing]: Specify opposite corner:`), anything but a point there
`Invalid window specification.` and the same again; a fence, or the window's outline walked
clockwise on screen from its first corner (TRIM "follows the rectangular crossing window boundary
clockwise from the first point", Autodesk's help; an object inside it is none it crosses), trims at
every place it meets an object, in its order, the object as it then is as if picked there, against
the drawing as it then is — so a line's pieces go one by one, and the piece left can be the new one,
as the console's handles show —; EXTEND extends an object at the first place only, and says
`No edge in that direction.` (es `No hay límite en esta dirección.`) once if it meets it again; an
object refused at its first place (`Circle must intersect twice.`,
`Path does not intersect with the bounding edge.`) is said once and left; all as one Undo step, a
fence's counted even when it crosses nothing, a window that crosses nothing
`No objects crossed by crossing window.` (es
`No hay objetos intersecados en la ventana de captura.`) and no step; anything else typed is
`*Invalid selection*` (es `*Designación no válida*`) and the words it expects as the console's
second line names them, Fence and then the prompt's words but its last
(`Expects a point or Fence/cuTting edges/Crossing/mOde/eRase` with Undo on offer, es
`Requiere un punto o Borde/aristas de COrte/Captura/MOdo/bOrrar`), at Crossing's first corner every
word declared but Undo; Quick mode over line/circle/arc/polyline (straight and arc segments)/ellipse
(whole or an arc of one), each an edge for the others and so is a spline, Shift to swap mode; a
spline no edge crosses is deleted too, a closed one cut once refused as a whole ellipse is, and a
closed one EXTEND refuses as a closed polyline; an elliptical arc grows round its ellipse from the
end its pick lies nearer in the ellipse's parameter (not along the curve, nor in a straight line),
and trims as an arc does, a whole ellipse as a circle, into an elliptical arc — cut once, it is left
as it is, `Curve must intersect cutting edges at least twice.` (es
`La curva debe intersecar las aristas de corte al menos dos veces.`), the pick counted for Undo; an
open polyline picked at any segment grows the end its pick lies nearer in the polyline's parameter
(the segment's index and how far along it: from the first half of the segments the start, so an end
segment's own end), straight or round an arc, and only that end
(`Object does not intersect an edge.` where it reaches none, though the other would); a polyline is
an edge of its own, so its picked segment is trimmed back to the segment's vertices and the
crossings on it, where it crosses itself too, whatever else crosses the polyline or nothing at all —
an open one shortened or split in two, a closed one opened from the cut's far end round to its near
one, keeping its direction and its handle, as AutoCAD 2023's console does; an object cut in two is
kept as the piece from its start — its handle, its place in the drawing — and the other piece is a
new object, which Last finds, U putting the object back whole (the console's LIST, line, arc,
polyline and elliptical arc alike); a trim of an object no edge crosses deletes it ("In Quick mode,
selecting an object that doesn't cross a boundary deletes the object instead"), a polyline of one
segment too, but a circle one edge crosses once is left as it is, `Circle must intersect twice.` (es
`Se requieren dos intersecciones para el círculo.`), the pick counted for Undo; an extend that
reaches no edge says why, as the console does — a line or an arc
`Path does not intersect with the bounding edge.` (es
`La trayectoria no se interseca con la arista de contorno.`), an open polyline's end
`Object does not intersect an edge.` (es `El objeto no se interseca con ninguna arista.`), an
elliptical arc too, a closed polyline, a whole ellipse or a circle `Cannot EXTEND this object.` (es
`Objeto no procesado por ALARGA.`), a dimension the path's — and Undo counts the pick, not a
circle's or a dimension's, then takes it back changing nothing
(`Command has been completely undone.` once none is left); worked out in the UCS's XY plane
(PROJMODE 1), a line's new end at the Z along its own slope; an object at an angle to that plane is
neither an edge nor trimmed (it does not highlight). English wording from AutoCAD 2023's own console
and the 2026 help

**Missing:** Project — AutoCAD's `Enter a projection option [None/Ucs/View] <Ucs>:` (es
`Indique opción de proyección [Ninguna/SCP/Vista] <SCP>:`), in both modes, its choice an Undo step
as Edge's, and the settings saying `Projection=None` or `View`: None cuts only where objects meet in
3D (an edge at another height cuts nothing, and Quick mode then deletes what no longer crosses one),
View projects along the line of sight; everything here is worked out projected on the UCS's XY
plane, which is Ucs, so `P` is refused as an option not built —, mOde at `Select objects:` once the
edges' set holds something (not offered here), the Spanish declared word of cuTting edges and
Boundary edges (`COrte` here, which the tables do not settle: **unverified**), the fence dragged
(`pick/drag cursor`), Shift held for a fence or a window (the console has no Shift: **unverified**),
PROJMODE, EDGEMODE and TRIMEXTENDMODE as variables (and across sessions, as AutoCAD keeps them in
the registry), a spline as an edge running on, projecting objects at an angle to the UCS onto its XY
plane; a spline an edge cuts or an open one EXTEND picks (the console leaves the piece on control
points and knots of its own — a trimmed one loses its fit points, a fit spline grows by a straight
piece along its end tangent behind a triple knot, a CV spline by a curved one —, which a spline
here, fit points or control vertices on uniform knots, cannot hold; so neither an open spline's
`Object does not intersect an edge.`); the piece after a polyline's own crossing, which the console
starts with a zero-length segment; **unverified**: the reasons when TRIM's Shift extends (EXTEND's,
the same code here), `Todos los efectos del comando han sido deshechos.` (one of the table's two
translations), and that a Shift-trim inside EXTEND deletes as TRIM's does

### `OFFSET` / `O` · es `DESFASE` / `DF`† / `EQ`†

**Implemented:** `Current settings: Erase source=No  Layer=Source  OFFSETGAPTYPE=0` (es
`Parámetros actuales: Borrar origen=No  Capa=Origen  OFFSETGAPTYPE=0`), then
`Specify offset distance or [Through/Erase/Layer] <Through>:` (es
`Precise distancia de desfase o [punto a Atravesar/Borrar/Capa] <punto a Atravesar>:`) — Enter takes
OFFSETDIST, `<Through>` in each drawing, then the last distance (per drawing, not saved: NEW and
OPEN bring `<Through>` back, rectang/p310), and two picks measure it
(`Specify second point:`); Erase asks `Erase source object after offsetting? [Yes/No] <No>:` (es
`¿Borrar objeto de origen tras desfase?`) and Layer
`Enter layer option for offset objects [Current/Source] <Source>:` (es
`Indique opción de capa para objetos desfasados [Actual/Origen]`), both program-wide, so kept for
the session and across NEW and OPEN, and reported by the next OFFSET (es `Borrar origen=Sí
Capa=Actual`, p310); `Select object to offset or [Exit/Undo] <Exit>:` (es
`Designe objeto a desplazar o [Salir/Deshacer] <Salir>:`),
`Specify point on side to offset or [Exit/Multiple/Undo] <Exit>:` (es
`Precise punto en lado de desplazamiento o [Salir/Múltiple/Deshacer] <Salir>:`) and Through's
`Specify through point or [Exit/Multiple/Undo] <Exit>:` (es `Precise punto a atravesar o …`);
Multiple asks `… [Exit/Undo] <next object>:` (es `<siguiente objeto>`), Through's too and steps out
from the last copy, Undo takes back the last copy; line/circle/arc/polyline (straight and arc
bulges, with corner joins); the copy keeps the source's elevation, rise and thickness; an object at
an angle to the UCS's XY plane does not highlight

**Missing:** OFFSETGAPTYPE, ellipses and splines (an ellipse's parallel curve is a spline, and
offsetting a spline is not built, so neither highlights, and `Cannot offset that object.` — es
`Imposible transponer este objeto.` — is never needed), what Undo says with nothing left to undo
(nothing here), Erase and Layer kept past the session (OPEN leaves them, p310; a restart is
unprobed)

### `FILLET` / `F` · es `EMPALME` / `MP`†

**Implemented:** `Current settings: Mode = TRIM, Radius = 0.0000` (es
`Parámetros actuales: Modo = Recortar, Radio = 0.0000`),
`Select first object or [Undo/Polyline/Radius/Multiple]:` (es
`Designe el primer objeto o [Deshacer/Polilínea/RAdio/múLtiple]:`),
`Select second object or shift-select to apply corner or [Radius]:` (es
`Designe el segundo objeto o use la tecla Mayús para aplicar esquina o [Radio]:`) — Shift on the
second pick applies a corner, as radius 0 does — and `Specify fillet radius <0.0000>:` (es
`Precise radio de empalme <0.0000>:`), the radius FILLETRAD, saved in the drawing (NEW and a drawing
opened bring theirs, rectang/p302, p316) and set inside the run, so U takes it back and a FILLET
that only set it is an undo step (p317); two lines, or two straight
segments of one polyline — adjacent, or one apart (the segment between, line or arc, is replaced by
the fillet), an open polyline's first and last closing it — rounded within it; one two or more away
says `Lines belonging to polylines must be consecutive or separated by one segment` (es
`Las líneas pertenecientes a polilíneas tienen que ser consecutivas o estar separadas por un segmento`),
then `*Invalid*` and the command ends, or in Multiple the first prompt again, and the first object
picked again — the same line, segment, arc or circle — `Cannot fillet an entity with itself.` and
the command ends, in Multiple too; a line and a straight segment of a polyline, picked in either
order, or straight segments of two polylines, joined into one polyline through the arc — the
polyline picked first, or the line's, with its layer, colour and direction: each object keeps its
run on its picked side (a line its kept end; a polyline from its first vertex to the cut, or from
the cut to its last), the other's reversed where it must be, what lies past either segment is
dropped and a closed one opens, and no radius is refused for its size (a cut past a kept end doubles
back to it); a line out of the polyline's plane says `Line and polyline are non coplanar.` (es
`La línea y la polilínea no son coplanares.`), two polylines apart `Two entities are non coplanar.`
(es `Los dos objetos no son coplanares.`), a parallel pair
`Cannot fillet between these two entities.` (es `Imposible empalmar esos dos objetos.`), and the
command ends with no `*Invalid*`, or in Multiple the first prompt again; an arc segment is an object
too, rounded against its circle where it crosses the other — a line, a straight segment or another
arc segment, of another polyline or of its own, adjacent or one apart (the one between removed) —,
the crossing nearest the picks, a line or the other circle extended to it, each kept on its picked
side and an arc on its circle, at radius 0 met there; where they do not cross, or the arc would fall
off what is kept, `Cannot fillet between these two entities.`, and within one polyline, as at a
tangent vertex, `Cannot fillet between these two entities.*Invalid*` on one line (es
`…objetos.*No válido*`); else `Lines are parallel`, `Lines diverge` or `Fillet radius is too large`
(also two lines a fillet would trim away; es `Las líneas son paralelas`,
`Las líneas son divergentes`), then `*Invalid*` (es `*No válido*`) and the command ends, or in
Multiple the first prompt again; two parallel lines are capped with a half circle, whatever the
radius, at the end of the first nearer its pick (its end point on a tie), the second's end on that
side extended or trimmed straight across to it and the first left as it is, the arc on the lines'
layer or the current one, with the second's thickness; where the second would turn back nothing is
made, and collinear lines say `Collinear lines connot be filleted.`, Autodesk's typo and all (es
`Las líneas colineales no pueden ser unidos con empalme.`), the command ending with no `*Invalid*`,
or in Multiple the first prompt again; an ARC or a CIRCLE is an object too, with a line or another
of them: the fillet lies on the side of each — of a line, or in or out of a circle — where the other
was picked, of those the one touching a line nearest its pick, else the one touching both nearest
theirs, and needs no crossing (a line and a circle apart are rounded where a fillet fits); a circle
is never trimmed, a line and an arc are trimmed or extended to the fillet, each kept on the side it
runs on from it, and the arc lies on their layer or the current one, as between lines; at radius 0
they meet at the crossing nearest a line's pick (two arcs nearest both picks), a line kept on its
picked side and an arc on its picked part — reached from the end its pick is nearer when the
crossing lies off it —, two circles left as they are without a word; where nothing fits,
`No valid fillet with radius 5.0000` (es `No hay un empalme válido con el radio 5.0000`) and the
command ends with no `*Invalid*`, or in Multiple the first prompt again; with a polyline,
`Cannot fillet between these two entities.` and the command ends; out of the other's plane — at
another height, or upright — `Two entities are non coplanar.` (es
`Los dos objetos no son coplanares.`), picked either first or second, and the command ends, or in
Multiple the first prompt again; in a tilted plane the other shares — a line lying in it, or another
ARC or CIRCLE — rounded in that plane as in plan, radius 0 and Multiple too, each pick read where
the line of sight meets the plane, and each object kept with its normal; Polyline's
`Select 2D polyline or [Radius]:` (es `Designe una polilínea 2D o [Radio]:`; both sub-prompts spell
Radio their own way, so `R` answers it) rounds every vertex where two segments meet — line–arc and
arc–arc ones too (FILLETPOLYARC 1) —, replaces an arc segment between two lines converging towards
it (radius 0 removes it, the lines meeting), leaves a corner too short alone, and reports
`4 lines were filleted` and then `1 was parallel    2 were too short` (parallel, too short,
divergent; a corner already sharp at radius 0 is counted; es
`4 líneas resultan unida(s) con empalme`, `1 resulta paralela(s)    2 resultan demasiado corta(s)`);
Multiple asks the first prompt again until Enter — Enter at Polyline's asks it too, and Enter at the
second prompt asks that again without a word, Multiple or not —, Multiple still listed in it;
anything but a polyline picked at Polyline's, or the newest a mode finds there, says
`Object selected is not a 2D polyline` (es `El objeto designado no es una polilínea 2D.`) and
Polyline's prompt is asked again; Undo takes back the last fillet or radius given in the command,
and back at its start says `Command has been completely undone.`; two lines at different heights or
one rising give `Lines are non coplanar.` (es `Las líneas no son coplanares.`, AutoCAD 2027's
console) and the first prompt again; a line trimmed or extended keeps its
direction, only its end at the arc moving (a line kept from 100,0 to 0,0 now runs from 100,0 to
30,0); the arc takes the first line's elevation and thickness, and lies on the lines' layer when
they share one, else on the current layer, ByLayer ("The layer affects object properties including
color and linetype"); two lines sloping in one tilted plane are filleted in it, and so is a polyline
in a tilted plane with the UCS left as it was — two of its segments, or it with a line or a polyline
lying in its plane, joined there; one off it is `Line and polyline are non coplanar.` /
`Two entities are non coplanar.`, as the console says. The object prompts take the selection modes
Window, Last, Crossing, BOX, Fence, WPolygon and CPolygon (not ALL), read as the console reads them:
a fence picks where it crosses; a line, an arc or a circle found otherwise stands picked at its
middle (a line keeps its longer side, an arc at radius 0 the part its middle lies on); a polyline
crossed by a window or polygon is taken at the first segment crossed, kept from its first vertex
wherever the window lies; one found whole (a window round it, Last) is taken but nothing is made of
it, without a word; of several found the newest is taken, and at the first prompt two or more are
both objects, the older of the two newest first, filleted at once — two parallel lines the newer
first, capped from it —; a line found by a mode other than a fence is capped from its end nearer the
origin, as the console reads it; none found asks again without a word; the first object found again
— the segment a crossing window or a fence finds of its polyline too — says
`Cannot fillet an entity with itself.` (es `No se puede empalmar un objeto consigo mismo.`) and
ends, in Multiple too, and a segment of its polyline two or more away is refused as a pick on it is.
A point typed at any of the three prompts is a pick there (`30,40`), the side it lies on kept, `@`
from LASTPOINT, a number a direct distance from it towards the cursor, which it becomes; on nothing
the prompt is asked again without a word. A wrong answer is refused `*Invalid selection*` then
`Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius` — the
console's list of the prompt's words leaves out the last, Multiple (and Trim, not offered here) —,
at the second prompt and Polyline's `…/CPolygon/Radius]:`, stray bracket and all — the first
prompt's words too at the second (`P`, `U`, `N`, `T`, whole or not), which the table declares beside
it and the console refuses — (es `*Designación no válida*`,
`Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Deshacer/Polilínea/RAdio`,
`…/Radio]:`). English wording from AutoCAD 2023's own console and the 2026 help, Spanish from the
2027 Spanish language pack's string table, paired with the English by id

**Missing:** Trim (TRIMMODE is always 1, so it is not listed), the console's choice between two
fillets of an ARC or a CIRCLE equally near a line's pick (a figure symmetric about it: the right one
at radius 15, the left at 200, acc/b1, b4 — here the first found), the zero-length arc the console
leaves at the origin where a cap would turn the second line back, `out of limits`; the double space
Autodesk's Spanish puts before `[Radio]` at the second prompt; **unverified**:
`Radio de empalme es demasiado grande` (composed as the English is, from the table's two strings)
and `Las líneas colineales no pueden ser unidos con empalme.` (the table's 20686 with its
`unidos con empalme`, 20638) and `Todos los efectos del comando han sido deshechos.` (one of the
table's two translations of `Command has been completely undone.`) and
`Imposible empalmar esos dos objetos.` (the table's 20678, beside the 2D fillet's other messages,
over 20706's `estos`) and `No hay un empalme válido con el radio` (20625, beside the 2D fillet's
prompts, over 20711's `Imposible hacer un empalme de radio`) and the Spanish refusal at the object
prompts (composed from the Spanish prompt's words, as the English is from its own), and where a
circle a mode finds stands picked (half way round from its angle 0: the console settles only the
side of a line it lies on)

### `CHAMFER` / `CHA` · es `CHAFLAN` / `CH`†

**Implemented:** `(TRIM mode) Current chamfer Dist1 = 0.0000, Dist2 = 0.0000` (es
`(Modo Recortar) Primera distancia de chaflán actual  = 0.0000, Segunda distancia = 0.0000`,
Autodesk's double space kept), `Select first line or [Undo/Polyline/Distance/Multiple]:` (es
`Designe la primera línea o [desHacer/Polilínea/Distancia/múLtiple]:`),
`Select second line or shift-select to apply corner or [Distance]:` (es
`Designe la segunda línea o use la tecla Mayús para aplicar esquina o [Distancia]:`) — Shift on the
second pick applies a corner, as both distances 0 do — and Distance's
`Specify first chamfer distance <0.0000>:` then `Specify second chamfer distance <…>:`, whose
default is the first just given (es `Precise  primera distancia de chaflán`,
`Precise  segunda distancia de chaflán`, double space and all), both CHAMFERA and CHAMFERB, saved in
the drawing (rectang/p302, p316) and set inside the run, so U takes them back (p317); distance
chamfer between two lines, or two straight segments of one polyline (as FILLET's: adjacent, one
apart, an open one's ends; the first distance on the one picked first), a line and a polyline's
straight segment, or segments of two polylines, joined into one polyline by the bevel as FILLET
joins them, the first distance on the one picked first (`D` 10, 5 on a corner at 100,80: 100,70 then
95,80 picking the polyline first, 100,75 then 90,80 the line); a distance running past the end of
its line or picked segment says `Chamfer distance is too large` (even with more polyline beyond), a
parallel pair `Lines are parallel`, and the command ends with no `*Invalid*`, as at FILLET's
coplanar messages; two lines with FILLET's refusals (`Chamfer distance is too large`), two parallel
lines `Lines are parallel` then `*Invalid*` (es `Las líneas son paralelas`, `*No válido*`), and
collinear ones `Collinear lines connot be chamfered.`, Autodesk's typo and all (es
`Las líneas colineales no pueden ser unidos con chaflán.`), with no `*Invalid*` — each ending the
command, or in Multiple asking the first prompt again; an arc segment of a polyline is picked too:
beside a line or another polyline it is `Cannot chamfer polyline arc segments.` (es
`Imposible unir con chaflán segmentos de arco de polilínea.`, composed as the English is,
**unverified**) and the command ends, or in Multiple the first prompt again; an ARC or a CIRCLE, at
either prompt, says `Chamfer requires 2 lines (not arc segments).` (es
`Chaflán requiere 2 líneas (no segmentos de arco).`, composed as the English is, **unverified**) and
the same prompt is asked again; within its polyline — adjacent, or one apart — it is cut as its
chord (the distance along the chord, `Chamfer distance is too large` and then `*Invalid*` past it,
`Lines are parallel` and `*Invalid*` for parallel chords), and what is left of it keeps its radius,
its turn and its side of a half circle (a half circle becomes the major arc; a chord longer than the
diameter opens the arc as far as it asks: the console's bulge `-1.0357` for 82.85 at radius 40);
Polyline's `Select 2D polyline or [Distance]:` (es `Seleccione una polilínea 2D o [Distancia]:`,
worded otherwise than FILLET's; anything else picked there refused as at FILLET's) bevels every
vertex, the first distance along the segment coming in, an arc segment as its chord
(`1 line was chamfered` at a line–arc vertex), and reports `4 lines were chamfered` (es
`4 líneas resultan unida(s) con chaflán`) and the reasons line; Multiple, Undo and Enter as
FILLET's, Undo taking back distances too; the same coplanar test and message as FILLET, two lines
sloping in one tilted plane chamfered in it, and a polyline in a tilted plane as FILLET works it; a
line trimmed or extended keeps its direction, only its cut end moving, and the bevel runs from the
first line's cut to the second's; the bevel takes the first line's elevation and thickness, and lies
on the lines' layer when they share one, else on the current layer, ByLayer (as FILLET's arc). The
object prompts take FILLET's selection modes and typed points, read as FILLET reads them, but the
first prompt too takes the newest found and asks the second; an ARC or a CIRCLE found says
`Chamfer requires 2 lines (not arc segments).`, the first line found or picked again — or its
polyline's segment — `Cannot chamfer an entity with itself.` (es
`No se puede achaflanar un objeto consigo mismo.`) and ends, in Multiple too, and segments of one
polyline two or more apart are refused in FILLET's words; a wrong answer is refused
`Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Distance`, at the
second prompt and Polyline's `…/CPolygon/Distance` (the first prompt's words refused at the second,
as FILLET's) (the console's `Distance/Angle`, Angle not offered; es
`…/desHacer/Polilínea/Distancia`, `…/Distancia`, **unverified** as FILLET's). Spanish from the 2027
Spanish language pack's string table, paired with the English by id

**Missing:** Angle, mEthod and Trim (CHAMMODE is always Distance and TRIMMODE 1, so they are not
listed, nor the second prompt's Angle and Method); **unverified**:
`Distancia de chaflán es demasiado grande` (composed as the English is) and
`Las líneas colineales no pueden ser unidos con chaflán.` (the table's 20686 with 20639's
`unidos con chaflán`)

### `STRETCH` / `S` · es `ESTIRA` / `EI`†

**Implemented:** `Select objects to stretch by crossing-window or crossing-polygon...` (es
`Designe objetos que estirar mediante ventana o polígono...`), then MOVE's selection, base point and
second point; crossing-window stretch via `PlacementTool`, a crossing polygon (CPolygon) framing as
a crossing window does, and what a pick, Last or a Fence takes moving whole; a 3D displacement moves
whole (Z included) what the window catches whole, and a line's caught end in Z; a polyline, spline,
hatch or dimension caught in part stays in its plane; Enter at the second point uses the first point
as the displacement

**Missing:** the selection modes' gaps (Command line, `Select objects:`)

### `ERASE` / `E` · es `BORRA` / `B`

**Implemented:** noun-verb and verb-noun (MOVE's `Select objects:` and its modes; Enter or Space
erases, Escape erases nothing), one undo step, `n objects erased.`; the Delete key erases the
selection

**Missing:** OOPS

### `EXPLODE` / `X` · es `DESCOMP` / `DP`†

**Implemented:** polyline → lines/arcs on its centreline, its widths lost with
`Exploding this polyline has lost width information.` / `The UNDO command will restore it.` for each
wide one (es `Al descomponer esta línea se ha perdido información de grosor.` /
`Se puede restituir con el comando DESHACER.`, the table's), block reference → contents (one nesting
level), fresh ids, layer-0 reverts to real layer 0, multiline text → one TEXT per line as drawn,
aligned by the attachment's column (Autodesk documents only "Explodes into text objects"); a
reference with attributes gives its definitions back and drops the values; anything else counted
with `1 was not able to be exploded.` (es `1 no se ha podido descomponer.`), but a spline, refused
by name, each one, after the count: `Cannot explode SPLINE` (es `No se puede descomponer SPLINE`;
spline/p319, p324)

**Missing:** ByBlock resolution, non-uniform-scale → ellipse conversion; where the count is said:
AutoCAD says it as the objects are found, under `2 found` and before the next `Select objects:`
(spline/p319), here once the set is done

### `JOIN` / `J` · es `UNIR` / `U`†

**Implemented:** `Select source object or multiple objects to join at once:`, then
`Select objects to join:` once one is picked (es
`Designe un objeto de origen o varios objetos para unirlos a la vez`,
`Seleccione objetos para unir`, a real history's), with MOVE's counts; lines + arcs + polylines
merged into one polyline at their elevation, arcs become bulges, a polyline's segments keep their
widths and a line or an arc joined after its end takes the width it ends at, before its start its
first segment's widths, as AutoCAD 2023's console joins them (acc/w11, w22); only objects in one
plane chain, and none at an angle to the UCS's XY plane is taken; nothing joined gives
`0 objects joined, n objects discarded from the operation` (forum captures; es
`0 objetos unidos, n objetos descartados de la operación`, a real history's)

**Missing:** a single source's own step (`Select lines to join to source:`: here the source and the
rest are one set), the result counts (`9 segments joined into 3 polylines`), 2-vertex closed "lens"
case, collinear-gap joining, a rising line or objects in different planes (AutoCAD makes a 3D
polyline: left out here)

### `BREAK` / `BR` / `BREAKATPOINT` · es `PARTE` / `P`† · `PARTIRENPUNTO`

**Implemented:** `Select object:` (es `Designe objeto:`; nothing there: `No object found`, es
`No se ha encontrado ningún objeto`), whose pick is the first point — a point typed there is one, of
the newest object under it (`@` from LASTPOINT, a number its direct distance, the point LASTPOINT
after; BREAKATPOINT then asks its break point) —, or a selection mode typed there (Window, Last,
Crossing, BOX, ALL, Fence, WPolygon, CPolygon) taking the oldest object it finds and asking
`Specify first break point:`, as AutoCAD 2023's console does; then
`Specify second break point or [First point]:` (es
`Precise segundo punto de ruptura o [Primer punto]`), First point asking
`Specify first break point:` and `Specify second break point:` (es
`Precise primer punto de ruptura`, `Precise segundo punto de ruptura`); BREAKATPOINT's
`Specify break point:` (es `Especifique el punto de interrupción`); the points picked or typed, `@`
at the second splitting at the first, the second becoming LASTPOINT; line/arc/circle (`@` and
BREAKATPOINT at a line's or an arc's end doing nothing, silently), CCW circle break, a circle's same
point twice refused with `Arc cannot be full 360 degrees` (es `Un arco no puede tener 360 grados`);
polylines, as the console's LIST shows them: an open one loses the part between the two points, a
closed one the part between them in its vertices' order — whichever is picked first, even the longer
way round — and is left open from the later point round to the earlier, an arc segment cut on its
own circle; the same point twice (`@`, BREAKATPOINT) splits one at a vertex too, a closed one at its
start vertex as well, and does nothing at an end or at that start vertex; an object broken in two is
kept as the piece from its start — its handle, its place in the drawing —, the other piece a new
object, which Last finds, and a circle is kept as the arc left (AutoCAD 2023's console's LIST);
ellipses, as the console's DXF parameters show them: a whole one loses what runs counter-clockwise
from the first point to the second and keeps its handle (ellipse/p334; `@` and BREAKATPOINT on it
`Cannot break a closed, periodic curve at only one point.`, es
`No es posible partir una curva periódica cerrada en un solo punto.`), an elliptical arc what lies
between the points in its parameter, whichever comes first, split by `@`, untouched at an end; text,
MTEXT, attribute definitions, dimensions and hatches `Object can't be broken` (es
`Imposible partir este objeto`), a block `Can't break a block` (es `Imposible partir un bloque`),
picked or found by a mode, and `Select object:` again; a line's pieces keep the Z along its slope;
an object at an angle to the UCS's XY plane is not taken

**Missing:** splines (they do not highlight; AutoCAD breaks a CV spline into pieces on control
points and knots of their own, which a spline here, on uniform knots, cannot hold, spline/p325, and
a fit spline broken at two fit points into fit splines whose end tangents are the curve's
derivatives there, p326), Group; a mirrored whole ellipse,
which AutoCAD breaks counter-clockwise about its −Z normal (ellipse/p329; MIRROR's entry)

### `MATCHPROP` / `MA` · es `IGUALARPROP` / `IP`† / `COPARPROP`†

**Implemented:** `Select source object:`, then `Select destination object(s):` with the selection
modes and counts, each selection painted as it is made, Enter ending (AutoCAD 2026's help; es
`Seleccione el objeto de origen`, `Seleccione objeto(s) de destino`, the help's words —
**unverified** in the program's); layer, colour, linetype, lineweight (clears unset overrides),
thickness between objects that have one

**Missing:** settings dialog to choose which properties to match (so the destination prompt offers
no `[Settings]`), the `Current active settings:` line (its list is not documented word for word),
the Polyline special property (a polyline's widths are not matched)

### `TEXTEDIT` / `ED` · es `EDITARTEXTO` / `ED`† / `DDEDIC`†

**Implemented:** `Current settings: Edit mode = Multiple` (es
`Parámetros actuales: Editar modo = Múltiple`), then `Select an annotation object or [Undo/Mode]:`
(`[Mode]` in Single mode; es `Designe un objeto de anotación o [desHacer/Modo]`), a pick or `Last`;
Mode asks `Enter a text edit mode option [Single/Multiple] <Multiple>:` (es
`Indique una opción de modo de edición de texto [Simple/Múltiple]`) and says the settings again when
answered, the mode kept for the session; Undo backs out its own edits, and with none says
`Command has been completely undone.`; refusals as AutoCAD 2023's console words them
(`*Invalid selection*` / `Expects a point or Last/Undo/Mode`, `Invalid option keyword.`); retype in
place, double-click to edit (the settings line first, as the command runs), multiline text in
MTEXT's editor (Escape discards, unchanged wording keeps its formatting), a loose attribute
definition as Edit Attribute Definition's Tag / Prompt / Default (Escape cancels)

**Missing:** palette content edit, dimension targets, a question while the editor is open (AutoCAD
edits in place and asks none, so the prompt reads `TEXTEDIT:`), the es mode name in the settings
line (**unverified**: the keyword's word, `Múltiple`, is assumed)

### `PURGE` / `PU` · es `LIMPIA` / `LI`†

**Implemented:** unreferenced block definitions, all or by id, undoable, per-block delete in the
palette disabled with a reason when in use

**Missing:** layers / text styles / dim styles, the Purge dialog, "one level at a time", Purge
Nested Items, unnamed objects
