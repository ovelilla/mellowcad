# Modify

### `MOVE` / `M` · es `DESPLAZA` / `D`

**Implemented:** `Select objects:` (es `Designe objetos:`), each pick writing what it found on that
line — `1 found`, `1 found (1 duplicate), 2 total`, a window's `Specify opposite corner: 3 found`,
Shift's `1 found, 1 removed, 1 total` (es `1 encontrados`, `1 encontrados, eliminados 1, 1 total`,
`Designe esquina opuesta:`) — with the selection modes (Command line, `Select objects:`), and
objects selected before it counted on an alias's echo, `Command: M MOVE 1 found`, and on a line of
its own after the name typed whole (`Command: MOVE` / `1 found`, desktop erase/d11);
`Specify base point or [Displacement] <Displacement>:` — Displacement, or Enter, asks
`Specify displacement <0.0000, 0.0000, 0.0000>:` (the last one given in the drawing, MOVE's own;
per drawing, not saved, NEW and OPEN putting it back to 0, rectang/p314, p315), a point read as
the vector from the UCS origin (move/p109, p135): it makes the origin LASTPOINT as it opens, so
`@10,5` is 10,5, `@` alone nothing and Enter leaves LASTPOINT there (p119, p137, p149); a number
runs from the origin towards the cursor (p125, p126, p138), an object snap or a pick is the point
(p128), `<a` writes `Angle Override:` (p139), a point typed without a Z lies at the ELEVATION
(p241); then it ends — and
`Specify second point or <use first point as displacement>:` (es
`Precise punto base o [Desplazamiento] <Desplazamiento>`, `Precise desplazamiento`,
`Precise segundo punto o <usar primer punto como desplazamiento>`); noun-verb and verb-noun, box
select, displacement + angle field; the displacement is 3D (`@0,0,5` lifts); Enter at the second
point uses the first point as the displacement, LASTPOINT left at the base (p150), and a
second point however given, a number or the tooltip's fields too, is LASTPOINT after (p170; STRETCH's,
p242); a move by nothing changes nothing, its run still the
step U names (p195, p231); the drag draws the set as itself at the cursor, solid in each object's
colour, the originals faded where they were and an amber dashed line from the base point (desktop
d01); `D` from the Spanish `acad.pgp` (p101)

**Missing:** the selection modes' gaps (Command line, `Select objects:`); the drag's ghost wears
each object's colour only, not its linetype or lineweight, and a block reference's objects all
wear the reference's, where AutoCAD drags the set as itself (d01); what the desktop
draws at `Specify displacement` (no line from the origin here) and what a number does after `<a`
there are **unverified** (the console ignores it, p139)

### `COPY` / `CO` · es `COPIA` / `CP` / `DUP`

**Implemented:** MOVE's selection and base point, then `Current settings:  Copy mode = Multiple` (es
`Parámetros actuales:  modo de copia = Múltiple`),
`Specify second point or <use first point as displacement>:` and once a copy is placed
`Specify second point or [Exit/Undo] <Exit>:` (es
`Precise el segundo punto o [Salir/desHacer] <Salir>`, with the `el` the program prints and its help
does not); repeated placement (AutoCAD Multiple behaviour), Undo taking back the last copy and,
for the last of all, saying `Command has been completely undone.` (es `Todos los efectos del
comando han sido deshechos.`) and asking the first form again (p158, p159, p199); Enter at the first
form, nothing placed from the base, copies by the base point's coordinates and ends, also once Undo
took every copy back (p151, p159, p234, p06, desktop d06), and at `<Exit>` ends placing nothing
(p172); the copies are added in drawing order, whatever order the objects were picked in, so ERASE
Last takes the last object's copy (p201, p212, p223); Displacement places one copy and ends, its `<default>` COPY's own last one, not MOVE's (rectang/p314),
back to 0 at NEW and OPEN; a zero displacement — the second point at the base, a Displacement of
`0,0,0`, Enter and Enter — leaves a duplicate in place, which Undo takes back like any other
(p147, p193, p228–p232); the drag as MOVE's, the originals keeping the selection's glow (desktop
d02, d11); `CP` and `DUP` from the Spanish `acad.pgp` (p103)

**Missing:** mOde (COPYMODE is always Multiple, so the base point offers `[Displacement]` alone),
Array (so the second point's `[Array]` is not offered; the first form still refuses a wrong answer
with Array's keyword's `Point or option keyword required.`, es `Se requiere un punto o una
opción.`, where MOVE's says `Invalid point.`, p154–p158)

### `ROTATE` / `RO` · es `GIRA` / `GI`

**Implemented:** `Current positive angle in UCS:  ANGDIR=counterclockwise  ANGBASE=0` (es
`Ángulo actual positivo en SCP:  ANGDIR=en sentido horario inverso ANGBASE=0`), `Select objects:`
(MOVE's counts), `Specify base point:`, `Specify rotation angle or [Copy/Reference] <0>:` — Copy
says `Rotating a copy of the selected objects.` (es
`Girando una copia de los objetos seleccionados.`), again at each Copy, and stays listed — then
Reference's `Specify the reference angle <0>:` (typed, or two points the runtime measures in the
UCS, its ` Specify second point:` on the prompt's line after a pick; a refusal there starts the two
points over under the same words, where a number is the angle; Enter there takes the default:
p106, p126, p136, p143, p157, p158) and `Specify the new angle or [Points] <0>:` (typed, a point
measured from the base point, or Points' `Specify first point:` and ` Specify second point:`, the
angle of the line between them; Enter takes the default;
`Requires valid numeric angle, second point, or option keyword.`: p105–p107, p135, p154) (es
`Precise punto base`, `Precise ángulo de rotación o [Copiar/Referencia]`,
`Precise ángulo de referencia`, `Precise el nuevo ángulo o [Puntos]`, ` Designe segundo punto`,
p156); pivot + angle; at the rotation angle a point is its bearing from the base point and `<30`
is the angle, no angle override (p118, p123); Enter takes the last turn, Reference's prompts the
last reference and new angle, 0 in each drawing, every run setting the turn (per drawing, not
saved: rectang/p314, Reference's taken alike, unprobed; p109, p111, p112), each default and
ANGBASE written at AUPREC (`<0.0000>` at 4, `<31>` at 0 after 30.5, p110); LASTPOINT is the base
point however the angle is given (p106, p118, p126, p152, p154); Copy's copies go in drawing order
whatever the pick order, so ERASE Last takes the later one's (p139); each run is one step U names,
a turn by 0 too, and a Copy by 0 leaves a duplicate U takes back (p131–p134); nothing is left
selected and the set is Previous, the originals under Copy (p148, p149); about an axis parallel to
the UCS's Z ("the Z axis of the UCS determines the axis direction for rotating objects about a
point"), an object's Z kept whatever ELEVATION and the base point's, in a turned or tilted UCS
(p141–p144); an elliptical arc keeps its parameters (ellipse/p322); the drag as MOVE's, the set
turned, the originals faded but under Copy, drawn without the selection's glow from the base point
on, and the angle fields hold their defaults, not the dragged angle (desktop d01–d05); `GI` from the
Spanish `acad.pgp` (p101)

**Missing:** Enter at Points' points ends ROTATE unturned, **unverified** (SCALE's console reads
its cursor there); the drag's ghost as MOVE's (each object's colour only)

### `SCALE` / `SC` · es `ESCALA` / `ES`

**Implemented:** `Select objects:`, `Specify base point:`,
`Specify scale factor or [Copy/Reference]:` — a number is the factor; a point, picked or typed
(`x,y`, `@dx,dy`, a snap), is its distance from the base over half the largest side of the set's
extents in the UCS, 1 when they have no size, so a point that far leaves the set as it is (p191,
p192, p197, p219; desktop d06, d07), and the drag and the factor's field read the same; 0, a
negative or `@` say `Value must be positive and nonzero.` (es
`El valor debe ser positivo y diferente de cero.`) and ask again (p167, p168, p193) — Copy says
`Scaling a copy of the selected objects.` (es `Escalando una copia de los objetos seleccionados.`),
again at each Copy, and stays listed (p171) —
then Reference's `Specify reference length <1.0000>:` (typed, or two points) and
`Specify new length or [Points] <1.0000>:` (typed, or a point measured from the base point; Points
asks `Specify first point:` and the second, the length between them;
`Requires numeric distance, second point, or option keyword.`, at Points
`Requires numeric distance or two points.`; 0 or a negative at either length
`Value must be positive and nonzero.` and the prompt again, p174, p175, p178, p179; `'ZOOM` at the
second of two points keeps the first, p204), both defaults the last lengths given, 1 in each
drawing (a factor typed leaves them), as AutoCAD's console asks them (p172, p176, p182, p187; es
`Precise factor de escala o [Copiar/Referencia]`, `Precise longitud de referencia`,
`Precise nueva longitud o [Puntos]`); Enter at the factor takes the last one any run scaled by,
Reference's too, 1 in each drawing — per drawing, not saved, rectang/p315 —, though the prompt
shows no default (p160, p165, p166, p188); Copy's copies go in drawing order whatever the pick
order, so ERASE Last takes the later one's (p213); LASTPOINT is the base point however the factor
is given (p176, p182, p191–p196); each run is one step U names, a scale by 1 too (p205–p208);
nothing is left selected and the set is Previous (p217); in 3D about the base point, elevation, a
line's rise and thickness included (p214), in a turned or tilted UCS (p215, p216); a hatch's
pattern scale and a dimension's measurement scale (p212); an elliptical arc keeps its parameters
and ratio (ellipse/p323); the drag as ROTATE's, scaled, Reference's fields holding their defaults
(desktop d06, d08; under Copy unprobed); `ES` from the Spanish `acad.pgp` (p161)

**Missing:** Enter at Points' `Specify first point:` or ` Specify second point:` ends the command
unscaled (AutoCAD's console scales by its cursor's reading there, p183, p184); a tiny factor is applied in silence, where AutoCAD
says `Extremely small scale factor ignored.` (es `Factor de escala demasiado pequeño ignorado.`,
table 21197, p170): the threshold and what follows are **unverified** (the console read its cursor
after it); the drag's ghost as MOVE's (each object's colour only)

### `MIRROR` / `MI` · es `SIMETRIA` / `SI`

**Implemented:** `Select objects:`, `Specify first point of mirror line:`,
`Specify second point of mirror line:`, `Erase source objects? [Yes/No] <No>:` (es
`Precise primer punto de línea de simetría`, `Especifique segundo punto de línea de simetría` —
Autodesk's table words the two otherwise —, `¿Borrar objetos de origen? [Sí/No] <No>`, `S` its
Yes, p231); both points 2D: FOO, `x,y,z`, `*x,y` and Enter say `Invalid 2D point.` (es
`Punto 2D no válido.`) and ask again (p226, p228, p229, p233, p234, p241); a number at the second
point runs from the first towards the cursor (p238); a mirror line of no length (`@`, the first
point again) says `Points must be distinct.` (es `Los puntos tienen que ser distintos.`, table
21153) and ends, U naming MIRROR (p235, p236, p248); No's copies go in drawing order whatever the
pick order, so ERASE Last takes the later one's (p284); LASTPOINT is the second point, No and Yes
(p239); each run is one step U names (p246, p247); the mirror plane holds the two points and the
UCS's Z (p286); MIRRTEXT 0's result: a TEXT, MTEXT or ATTDEF keeps reading as it did in the
reflection of its box, its justification kept — one the reflection moves to the other side of the
half-plane of directions in (−90°, 90°] turns half round, its point at the image of the box's far
end along the baseline; one it stands on its head flips across the baseline; a right angle counts
by that half-plane too, 90° rightward and 270° leftward, so about y = x a text at 270° reads at
180°, about y = −x at 0°, and two mirrors give it back (trim/p01, p02); MTEXT's attachment swaps
left and right, or top and bottom (p283, p290–p294); a mirrored spline keeps its +Z normal, as
AutoCAD's does (spline/p320), unlike an ellipse; the reflection drags as MOVE's set, the originals
keeping the selection's glow, the amber dashed line from the first point, both still drawn at
`Erase source objects?` (desktop d10); `SI` from the Spanish `acad.pgp` (p221)

**Missing:** MIRRTEXT, the variable: 0 only, never mirrored text; the box a text turns back in is
the engine's (`measureTextWidth`, the capital height), AutoCAD's its glyphs' extents (p283's Hola
is 14.628 wide there, 14.356 here; flipped across its baseline it sits 0.08 higher there, p291); a
text inside a mirrored block reference, which AutoCAD mirrors with the block whatever MIRRTEXT
(Autodesk's support article), turns back here as a loose one; a mirrored hatch's pattern angle:
AutoCAD keeps 0° mirrored about the Y axis (p282), here 180°, the rule **unverified** (no hatch at
another angle probed); the drag's ghost as MOVE's (each object's colour only); an ellipse's
normal: AutoCAD turns a mirrored ellipse over, its normal −Z, its parameters kept and its major
axis on the mirrored end (ellipse/p320, p321), where this app keeps +Z and reflects the range, the same curve — its Start angle and End angle (260° and 350°
where AutoCAD reads 10° and 100°), and BREAK of it keeping the other piece (p329: AutoCAD keeps
three quarters, Area 3570.243), differ. WHY not built: an ellipse turned to −Z no longer reads in
plan here, so TRIM, EXTEND, BREAK, OFFSET, JOIN, HATCH and its grips would refuse it (ELLIPSE-D43)

### `ARRAY` / `AR` · es `MATRIZ` / `MA`

**Implemented:** `Select objects:` (MOVE's counts, a preselection counted), then
`Enter array type [Rectangular/PAth/POlar] <Rectangular>:` (es
`Indique el tipo de matriz [Rectangular/CAmino/POlar] <Rectangular>:`), Enter taking Rectangular,
anything but a keyword `Invalid option keyword.` (es `Opción no válida.`) and the question again;
the set is handed to ARRAYRECT, ARRAYPATH or ARRAYPOLAR, which go on from their `Type = …` line
without asking for objects again (AutoCAD 2027's console, arrays/p100, p101, p103, p104, p204). The
run stays ARRAY's: one undo step, which U names ARRAY, ARRAY heading the prompts, and Enter at
`Command:` repeats ARRAY (what AutoCAD heads them with and U writes after ARRAY: **unverified**)

**Missing:** ARRAYTYPE as the default (AutoCAD's is 0, Rectangular, p00; whether ARRAY sets it to
the last type chosen: **unverified**, so `<Rectangular>` always)

### `ARRAYRECT` · es `MATRIZRECTANG`

**Implemented:** `Select objects:` (MOVE's counts; ARRAY's set),
`Type = Rectangular  Associative = Yes` (es `Tipo = Rectangular  Asociativa = Sí`, arrays/p01,
p04), `= No` (es `= No`) once ASsociative No is the answer, then
`Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>:` (es
`Seleccione un pinzamiento para editar la matriz o [Asociativa/COntar/Espaciado/Columnas/Filas/Salir] <Salir>`)
over a live preview — the items as the drawing will draw them, each in its own colour, linetype and
lineweight, the source hidden and drawn as item 1 (desktop arrays/d01-1) — 4 columns along the UCS's X and 3 rows along its Y, one and a
half times the selection's extents apart, its width and height measured along the UCS's axes (1 where it has
none; p165, p168); a point or a number typed there is taken and the prompt asked again
without a word (p109, p129); ASsociative asks `Create associative array [Yes/No] <Yes>:` (es
`Crear matriz asociativa [Sí/No] <Sí>:`, AcArrayRes:5609; p04–p06), its default the answer
in force, which ARRAYRECT, ARRAYPOLAR and ARRAYPATH share for the session (p364: the next run says
`Associative = No`; WHY the session and not the drawing: AutoCAD keeps ARRAYASSOCIATIVITY in the
registry, a drawing saved at 1 opening at 0 after `_AS _N`, p422); COUnt asks `Enter the number of columns <4>:` and
`Enter the number of rows <3>:`, Spacing
`Specify the distance between columns or [Unit cell] <15>:` and
`Specify the distance between rows <1>:` — the defaults without trailing zeros, at the drawing's
precision, as AutoCAD writes them (`<6>`, `<-4.3514>`; p116, p130) — Unit cell asks
`Specify first corner point of unit cell:` and `Specify opposite corner:`, picked or typed (a
typed corner read as any typed point, `*x,y` in the WCS, p147), and the cell's sides along the
UCS's axes are the distances between columns and rows (negative to the left or below); neither
corner moves LASTPOINT (p148); Enter at the first corner leaves them (p124), at the opposite one
too (p129: whether it keeps the spacing is **unverified**), a positive number at the first makes
both that (a square cell, p126) and a number at the opposite one is a direct distance from the
first (p130), `FOO` or `0` at the first says `Requires numeric nonzero value.` and leaves Unit
cell (p125, p127; a negative number too, AutoCAD 2023's), at the opposite one `Invalid point.`
(p128) (es `[célula de Unidad]`, `Precise primer punto de esquina de la celda de unidad`,
`Precise esquina opuesta`, `Necesita un valor numérico distinto de cero.`) —, COLumns the number
and the distance of the columns, Rows those of the rows and
`Specify the incrementing elevation between rows <0>:` (each row that much higher); es
`Indique el número de columnas`, `Especificar la distancia entre columnas` (Spacing's; COLumns'
`Especifique…`), `Especifique la elevación incremental entre filas`; a count refuses 0
(`Value must be positive and nonzero.`, p111) and a fraction
(`Requires a positive nonzero integer or option keyword.`, p113) and more than 32767
(`Requires an integer between 1 and 32767, or option keyword.`, as ARRAYPOLAR's, p279); the
preview draws the first 1000 cells (as ARRAYPOLAR's); a distance refuses 0 with
`Value must be nonzero.` (es `El valor debe ser diferente de cero.`) and asks again, where the
elevation takes it (p117, p120, p135); `FOO` at Spacing's rows says
`Requires numeric distance or two points.` (es `Requiere una distancia numérica o dos puntos.`),
at the other distances `…, two points, or option keyword.` (p121, p138); `'ZOOM` at any prompt,
a count's too, resumes it (p154, p157, p158); eXit or Enter makes the array object below, or with
ASsociative No the copies, in the drawing's order whatever the pick's (p167), with the source's
layer, colour, lineweight and Z (p164, p166), the source kept; one undo step (U writes
`ARRAYRECT`, p159); Escape at the main prompt makes it too, the prompt written with `*Cancel*` (es
`*Cancelado*`; desktop d08, d08b), at a value's prompt with the values given before it
(**unverified**: the desktop showed the main prompt only), before the main prompt nothing.

The array object (the three commands'): one block reference, named for its kind — `Array
(Rectangular)`, `Array (Polar)`, `Array (Path)` (es `Matriz (rectangular)`, `Matriz (polar)`,
`Matriz (de ruta)`; AcArrayRes 9575, 39923, 887) in the palette's title, the rollover and the
selection list — to an anonymous block `*U<n>` holding the source where it stood, the source
consumed into it (p01–p03, p400); on the current layer, colour, linetype and lineweight, the
objects inside keeping theirs, those on layer 0 shown on its layer as in any block (p403); at the
source's extents centre (p403, p404), ARRAYPOLAR's at the centre, the extents centre its base point
(p405), ARRAYPATH's at the path's start (p406). Its items are derived from its parameters, kept in
the block's coordinates, so they are drawn, picked, bounded and snapped to as the drawing's own: a
pick on any item takes the array (p408), `_END` finds an item's end (p412), and MOVE, COPY (a
second array, p410), ROTATE, SCALE, MIRROR, STRETCH and the insertion grip carry it whole; EXPLODE
gives each item's objects, item by item, on their own layers (p402, p415, p418); U puts the source
back with its id (p409); the file keeps it (p411a, p411b); PASTECLIP lands it with an anonymous
block of its own. Its block is in no list of blocks (INSERT's `?` and default, BLOCK's `?`, the
Blocks palette, PURGE), a typed `*U1` is no block INSERT finds, and a drawing is saved without one
no reference places any more (AutoCAD's own purge of them: **unverified**)

**Missing:** the grips the main prompt picks, and so the preview's grips; the array object's own
grips, multifunctional menus and Properties rows (review block AYG: it keeps a block reference's
insertion grip and Block and Position rows, its Name `*U1`, and the palette's object filter counts
it with the block references); LIST's `ARRAY` report (p401, p403–p406); ARRAYEDIT (p419–p421) and
ARRAYCLOSE; no cap on the items but 32767 each way, a large array costing what as many loose
copies cost to draw and pick; Unit cell's rubber band dashed, as the trace's UseDashedLine 1 says (p123;
solid here: **unverified** on the desktop); Base point (`Specify base point or [Key point] <centroid>:`, es
`Especifique un punto base o [punto Clave] <centro de gravedad>:`, p140); Levels
(`Enter the number of levels or [Expression] <1>:`,
`Specify the distance between levels or [Total/Expression] <1>:`, es
`Indique el número de niveles o [Expresión] <1>:`,
`Especifique la distancia entre niveles o [Total/Expresión] <1>:`, p139); Total at COLumns' and
Rows' distances (`Enter total distance between start and end columns <12>:`, `… rows`, es
`Introduzca la distancia total entre los puntos inicial y final columnas <12>:`, `… filas`, p133,
p136); the hidden clicK (an integer asked with no prompt, `FOO` refused with
`Requires a positive nonzero integer.`, es `Requiere un nº entero positivo que no sea cero.`, p141)
and UPdate (the main prompt asked again, p142); the counts' `[Expression]` and the distances'
`[Total/Expression]`, which AutoCAD lists (p131, p135; English spells the elevation's
`[Expresson]`); English's `…/eXit]<eXit>:` with no space before the default, Spanish's with one
(p01, p04; WHY not built: the space is per question here, not per language, and it changes no
letter typed); 'ORTHOMODE at a count (p155: ORTHOMODE is no variable here, drafting-aids.md);
MAXARRAY's message (MAXARRAY is nil in 2027, p00: **unverified**); Expression (WHY not built: it
ties an associative array to the drawing's parameters, and with no Parameters Manager it would only
be a calculator; 2027's console: `Enter expression<4>:`, es
`Introduzca la expresión<4>:`, p134; AutoCAD 2023's: arithmetic with `^`, `%`, parentheses and
functions — `sqrt(16)`, `max(2,5)`, `SQRT(9)` — refusing `FOO` with
`The syntax is incorrect or a variable is not defined.  Reenter the expression or value.` and a
fraction with `Requires an integer between 1 an 32767, or option keyword.`)

### `ARRAYPOLAR` · es `MATRIZPOLAR`

**Implemented:** `Select objects:` (MOVE's counts; ARRAY's set), `Type = Polar  Associative = Yes`
(es `Tipo = Polar  Asociativa = Sí`, p02; `No` as ARRAYRECT's), `Specify center point of array:` (es
`Especifique el punto central de la matriz`, arrays/p201), where Enter says
`Point or option keyword required.` (es `Se requiere un punto o una opción.`) and asks again (p206);
then `Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>:`
(es `[Asociativa/Elementos/ángUlo entre/ángulo de Relleno/Girar objetos/Salir] <Salir>`; ASsociative
as ARRAYRECT's, p05) over a live preview, 6
items over 360° at first, drawn as ARRAYRECT's, nothing marking the centre, and no preview while the
centre is asked (desktop d02-1, d02-2); a point or a number typed there is taken and the prompt asked again
without a word (p208, p209); `R` asks `ROWs or ROTate?`, as AutoCAD's declared ROWs makes it
(p210). Items `Enter number of items in array <6>:` refuses 0 or less with
`Value must be positive and nonzero.`, a fraction with
`Requires a positive nonzero integer or option keyword.` and more than 32767 with
`Requires an integer between 1 and 32767, or option keyword.` (es
`Requiere un nº entero entre 1 y 32767, o una opción.`; p212, p278, p279); Angle between
`Specify angle between items <60>:` refuses 0 or less with `Value must be positive and nonzero.`
(es `El valor debe ser positivo y diferente de cero.`, p214) and makes the fill that many steps,
the ring's direction kept, and a full turn once they reach 360°, asking nothing (p267–p271); Fill
angle `Specify the angle to fill (+=ccw, -=cw) <360>:` keeps the count, its sign the ring's
direction, which Enter keeps (p216, p274, p276, p277), refuses 0 with
`The parameter cannot be set to 0.  Enter a non-zero number or expression.` (es
`El parámetro no se puede establecer en 0. Introduzca un número distinto de cero o una expresión.`,
p219) and takes one beyond a turn as its remainder (400 is 40°, p217; 720 and −400
**unverified**: here a whole number of turns is a full one, −400 is 40° clockwise); a whole turn
spaces the items fill / count, any other fill / (count − 1); both angles take two points (p265)
and show their defaults unsigned, without trailing zeros, at the drawing's precision (`<60>`,
`<33.33>`, `<100>` at AUPREC 2, p264, p275); ROTate items `Rotate arrayed items? [Yes/No] <Yes>:`
(es `Indique el número de elementos de la matriz`, `Indique el ángulo entre elementos`,
`Precise el ángulo que se debe rellenar (+ =antihorario, -=horario)`,
`¿Girar elementos de la matriz?`); eXit or Enter makes the array object (ARRAYRECT's), at the
centre (p02, p405), or with ASsociative No the copies with the source's layer and colour (p05,
p249), one undo step; the preview draws the first 1000 items (WHY: a count of thousands
redrawn on every move would hang the page), the commit all of them; Escape as ARRAYRECT's once the
centre is given, before it nothing (**unverified**: the desktop's polar run, d08c, was inconclusive)

**Missing:** the grips and the array object's, as ARRAYRECT's; Base point, at the centre and the main
prompt (`Specify base point or [Key point] <centroid>:`, es
`Especifique un punto base o [punto Clave] <centro de gravedad>:`, p253, p255); Axis of rotation
(`Specify first point on axis of rotation:`, `Specify second point on axis of rotation:`, es
`Especifique el primer punto en el eje de rotación:`,
`Especifique el segundo punto en el eje de rotación:`, p254); ROWs, declared here only so `R` is
ambiguous and refused when typed (es `Filas`; `Enter the number of rows or [Expression] <1>:`,
`Specify the distance between rows or [Total/Expression] <6>:`,
`Specify the incrementing elevation between rows or [Expresson] <0>:`, es
`Indique el número de filas o [Expresión] <1>:`,
`Especifique la distancia entre filas o [Total/Expresión] <6>:`,
`Especifique la elevación incremental entre filas o [Expresión] <0>:`, p256); Levels
(`Enter the number of levels or [Expression] <1>:`,
`Specify the distance between levels or [Total/Expression] <1>:`, es
`Indique el número de niveles o [Expresión] <1>:`,
`Especifique la distancia entre niveles o [Total/Expresión] <1>:`, p257); the hidden clicK (an
integer asked with no prompt, `Requires a positive nonzero integer.`, es
`Requiere un nº entero positivo que no sea cero.`, p258) and UPdate (the main prompt asked again,
p259); Expression (`Enter expression<6>:`, es `Introduzca la expresión<6>:`, p260; WHY not built:
as ARRAYRECT's) and the `[Expression]`, `[EXpression]` the value prompts list; English's
`…/eXit]<eXit>:` with no space before the default (p05; as ARRAYRECT's); the 360° overrun question
(`Adjust angle between to fit items to 360 degrees?`, table 5669), which the console never asks
(p267): whether the desktop does is **unverified**

### `ARRAYPATH` · es `MATRIZCAMINO`

**Implemented:** `Select objects:` (or ARRAY's set), `Type = Path  Associative = Yes` (es
`Tipo = Ruta  Asociativa = Sí`, p03; `No` as ARRAYRECT's), `Select path curve:` (es `Seleccione la curva de trayectoria`): a
line, an arc, a circle or a polyline, one segment or many (arrays/p308), level with the UCS; a
pick on one of the arrayed objects says
`Objects selected to be arrayed may not be selected as path curve.` and `1 was filtered out`
(p347), on any other object `1 was filtered out` (p346), on a curve on a locked layer
`1 was on a locked layer.` (es `1 estaba en una capa bloqueada.`, p338), the prompt asked again
each time; Enter asks it again (p349); a typed object snap is the pick, at its point (p342,
p343); the selection modes typed there — Window, Last, Crossing, BOX, ALL, Fence, WPolygon,
CPolygon, Previous, AUto — take the newest curve they find, after `1 was on a locked layer.` for
each locked one (a find of locked ones alone asks again, p339–p341); Last leaves out the arrayed
objects with `1 was filtered out` (p353); Previous and ALL first say the arrayed objects' line and
count all they found as filtered out, ALL still taking the curve (`2 were filtered out`, p354,
p356); a mode finding none says `No object found` (AutoCAD 2023's console; 2027's unprobed); a
point typed there picks as a click does, one on nothing — typed or clicked — starts a window
(`Specify opposite corner:`) that says nothing when it finds nothing (p348); LASTPOINT stays as
it was (p342, p357); its rollover is every single pick's (desktop d03-1). An open path runs from
the end nearer the pick — clicked, typed, snapped, a window's opposite corner, a fence's or a
polygon's last point (p300, p303, p342, p343, p376–p378); an exact midpoint, which AutoCAD breaks
either way (p06, p310, p344), runs from the curve's start here —; a circle from its angle 0,
counter-clockwise, wherever it is picked (p301, p315); a closed polyline from its first vertex,
its own way round (**unverified**). Then
`Select grip to edit array or [ASsociative/Method/Items/Align items/eXit] <eXit>:` (es
`[Asociativa/Método/Elementos/ALinear elementos/Salir] <Salir>`; ASsociative as ARRAYRECT's, p06)
over a live preview, the items drawn as
ARRAYRECT's and the path as the drawing draws it (d03-2); a point or a number typed there is taken and the prompt asked again
without a word (p328, p329). Method `Enter path method [Divide/Measure] <Measure>:`, Measure
going on from Divide's spacing (p334); Items by Divide `Enter number of items along path <17>:`,
by Measure `Specify the distance between items along path <6>:` (a distance or two points; 0 or
less `Value must be positive and nonzero.`; the defaults without trailing zeros, p307, p332,
p334), `Maximum items = 11` — said again before the count is asked again after a refusal or a
transparent command (p367, p373) — and `Specify number of items or [Fill entire path] <11>:`, a
count over the maximum taken as it (p373), Enter keeping the count (p375); a count up to 32767,
as ARRAYPOLAR's (p279), the preview the first 1000 items; Align items
`Align arrayed items to path? [Yes/No] <Yes>:` (es from the table; p330, p331, p336 refuse as the
console does). Measure at first, the items one and a half times the larger side of the set's
extents along the UCS's axes apart (p06, p310), filling the path: floor(L/s) + 1 items on an open
path, the last ones past its end as far as the source stands from it (p06), floor(L/s) on a closed
one (p301); Divide keeps the count, L/(n − 1) apart on an open path, L/n on a closed one (p306,
p374). The source stays where it is as item 1; item k is the source moved by how far the path's
point at k steps is from its start and, aligned, turned about that point as far as the path's
direction has turned there (p302, p303, p305, p308); Align No only moves it (p304). eXit or
Enter makes the array object (ARRAYRECT's) at the path's start, keeping the path's geometry and
which object it was (p03, p406), or with ASsociative No adds the copies, the source's layer, colour
and Z (p06, p309, p312, p316), one undo step U names (p369); the path is left in place, and erasing
it leaves the array (p416); Escape as ARRAYRECT's once the path is picked (desktop d08c: the copies
kept), before it nothing

**Missing:** the grips and the array object's, as ARRAYRECT's; the array following its path
(p407: STRETCH of the path's end from 100 to 50 leaves 9 items; WHY not built: the array keeps the
path's geometry and id, ARRAYS-D9, and following an edit of another object is associativity no
object here has yet); Group at `Select path curve:` (`Enter group name:`, es `Indique nombre de grupo:`,
`Invalid group name.`, es `Nombre de grupo no válido.`, p355; `*Invalid selection*` here);
splines and ellipses as paths (p359, p360; filtered out here); a path not level with the UCS,
which AutoCAD arrays along in 3D (p311; a sloping line is arrayed in plan here); Base point
(`Specify base point or [Key point] <end of path curve>:`, es
`Especifique un punto base o [punto Clave] <final de la curva de trayectoria>:`, p317, p318);
Tangent direction (`Specify first point of tangent direction vector or [Normal]:`,
`Specify second point of tangent direction vector:`, es
`Especifique el primer punto del vector de dirección de tangente o [NOrmal]:`,
`Especifique el segundo punto del vector de dirección de tangente:`, p319); Rows
(`Enter the number of rows or [Expression] <1>:`,
`Specify the distance between rows or [Total/Expression] <6>:`,
`Specify the incrementing elevation between rows or [Expresson] <0>:`, es
`Indique el número de filas o [Expresión] <1>:`,
`Especifique la distancia entre filas o [Total/Expresión] <6>:`,
`Especifique la elevación incremental entre filas o [Expresión] <0>:`, p320); Levels
(`Enter the number of levels or [Expression] <1>:`,
`Specify the distance between levels or [Total/Expression] <1>:`, es
`Indique el número de niveles o [Expresión] <1>:`,
`Especifique la distancia entre niveles o [Total/Expresión] <1>:`, p321); Z direction
(`Maintain Z direction for all items in the array? [Yes/No] <Yes>:`, es
`¿Mantener la dirección Z para todos los elementos de la matriz? [Sí/No] <Sí>:`, p322); the
hidden clicK (an integer asked with no prompt, `Requires a positive nonzero integer.`, es
`Requiere un nº entero positivo que no sea cero.`, p323) and UPdate (the main prompt asked again,
p324); Expression (as ARRAYRECT's) and the `[Expression]` the value prompts list; English's
`…/eXit]<eXit>:` with no space before the default (p06; as ARRAYRECT's)

### `TRIM` / `EXTEND` · es `RECORTA` / `RR` · `ALARGA` / `AL`

**Implemented:** `Current settings: Projection=UCS, Edge=None, Mode=Quick` (es
`Parámetros actuales: Proyección=SCP, Arista=Ninguno, Modo=Rápido`; `Mode=Standard`, es
`Modo=Estándar`; `Edge=Extend`, es `Arista=Alargar`, in Standard mode only), then
`Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:` (es
`Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar]:`)
and EXTEND's `Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde]:` —
AutoCAD's words but Project, Fence unlisted as there; objects selected before the command are its
only edges — `Select cutting edges ...` (`Select boundary edges ...`) and `1 found` after the
settings, Standard's edges' prompt skipped, nothing left selected; once the object prompt has had an
answer — a pick, hit, missed or refused, a fence, a window's first corner, a mOde or Edge answer,
Enter at their prompts included — it lists Undo, `…/eRase/Undo]:` (es
`…para alargar, o [aristas de COrte/Captura/MOdo/bOrrar/desHacer]:`, EXTEND
`Seleccione un objeto que alargar o use la tecla Mayús y seleccione para recortar, o [aristas de COrte/Captura/MOdo/desHacer]:`),
which before it is refused as anything else typed is; Undo takes back the command's last edit with
whatever followed it — a refusal, a fence or a window that changed nothing, a transparent
'LTSCALE —, and with no edit left says `Command has been completely undone.` (es
`Todos los efectos del comando han sido deshechos.`) and is listed no more, the trim mode kept and
the edge mode back (the Spanish console's runs disagree among themselves on Undo listed after a
miss and Crossing's window, p298, p301, p303, p308 against p241, p382: the English is followed);
Enter at the object prompt ends the command, but in Quick mode the first one, until an object is
picked or missed, a fence or a window drawn, edges chosen or U taken, is such an answer and asks
again, so the old `TR ⏎ ⏎` still trims; TRIM's eRase (`R`, es `O`) asks
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
takes every object, and once the set holds something mOde is `*Invalid*` (es `*No válido*`) and no
more (p283, p389) —, leaves an object no edge crosses, saying
`Does not intersect with the cutting edge.` (es `No se interseca con la arista de corte.`), and
starts a crossing window at a pick on nothing, however it is drawn, its opposite corner asked on the
prompt; switched to mid-command, every object is an edge until some are
chosen; cuTting edges (`T`, es `CO`; EXTEND's Boundary edges `B`) says the settings again,
`Select cutting edges ...` and `Select objects or <select all>:` (es
`Seleccione objetos o <seleccionar todo>:`), in either mode, which stays: the objects chosen are the
only edges — whatever mode follows, and an edge's pieces with it —, Quick still deleting what none
crosses; a polyline is cut at its own vertices only when it is an edge itself, and otherwise trimmed
along it, past them, back to the nearest crossings (a closed one cut once refused as
`Curve must intersect cutting edges at least twice.`, p184); Edge (`E`, es `A`, Standard's
alone — Quick refuses it) asks
`Enter an implied edge extension mode [Extend/No extend] <No extend>:` (es
`Indique modo de alargamiento de arista implícito [Alargar/No alargar] <No alargar>:`, No extend
declared `Noextend`, es `No`), the mode in force its default, Enter keeping it; with Extend
(EDGEMODE 1, shared and lasting the session as the trim mode does) an edge cuts, and bounds an
extension, where it would run on — a line both ways, an arc and an elliptical arc round their whole
curve, an open polyline from its ends along its end segments (an arc end segment round its circle,
p224) —, never in Quick mode; a choice is
an Undo step joined to the edit after it, and a U right after it takes it back with the edit before
it, as the console does; a point typed picks there, as the console takes it (`@` from LASTPOINT, a
polar point, `*x,y` in the WCS, a number a direct distance from it towards the cursor, which it then
is, hit, missed or refused; `#x,y` at the command line refused as anything else typed is: probes
trim/p240–p250), and so does an object snap typed there, its point the pick and LASTPOINT
(`_END of 99,1` trims at 100,0; Perpendicular from LASTPOINT; a crossing at the point is no bound
of a line; Enter at its `of` is the prompt's own: p259–p264) — the running snaps stay off there
and the Command menu offers no Snap Overrides (desktop d05-1); of two objects in the pick box the
newer is taken, however near the older lies, as at `Select objects:` (p256, p257, p402); an object on
a locked layer is no pick, `1 was on a locked layer.` (es `1 estaba en una capa bloqueada.`) and
then what a pick on nothing does (p251), yet it is an edge (p255); one on a layer that is off is
neither, in silence (p252–p254); nothing is left selected (p140); a point on nothing,
clicked or typed, starts AutoCAD's crossing fence of two points
(`Specify next fence point or [Undo]:`, es `Precise punto del borde o [desHacer]`): its next point —
`@` and a number from the first, which stays LASTPOINT, Ortho leaving it alone (no base point, desktop
d07) — closes it; Undo there keeps the first point
and asks again, Enter ends the command, the same point is
`Invalid point, polygon segment is zero length.` and anything else `Invalid response.`, as the
console has it (p297; it also echoes the prompts once more, bare, around the fence, a jig's echo);
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
`Path does not intersect with the bounding edge.`) is said once and left; all as one Undo step,
none where nothing changes, a window that crosses nothing saying
`No objects crossed by crossing window.` (es
`No hay objetos intersecados en la ventana de captura.`); anything else typed is
`*Invalid selection*` (es `*Designación no válida*`) and the words it expects as the console's
second line names them, the words the prompt declares but its last — Fence first, Project after
mOde, Undo once listed — of those built
(`Expects a point or Fence/cuTting edges/Crossing/mOde/eRase` with Undo listed, es
`Requiere un punto o Borde/aristas de COrte/Captura/MOdo/bOrrar`; EXTEND's
`Expects a point or Fence/Boundary edges/Crossing/mOde`), at Crossing's first corner every word
declared but Undo; Quick mode over line/circle/arc/polyline (straight and arc segments)/ellipse
(whole or an arc of one), each an edge for the others — a polyline's arc segment where it runs, not
at its chord (p171–p173) — and so is a spline, a block reference's objects, each an edge of its
type (p237), and a TEXT's or an MTEXT's box (this engine's measure of it, not AutoCAD's glyph
extents: p238, p412), an attribute definition and a hatch none (p203, p413); TRIM refuses a TEXT,
an attribute definition and a block reference with `Cannot TRIM this object.` (es
`Objeto no procesado por RECORTA.`), an MTEXT and a hatch with the same (es
`Este objeto no se puede RECORTAR.`), counted for Undo (p190, p192, p198, p202); a dimension is cut
by nothing, so Quick deletes it and Standard says `Does not intersect with the cutting edge.`
(p194, p239); Shift to swap mode (Shift's
trim inside EXTEND deletes what no edge crosses, as TRIM's Quick does: desktop d02); a
spline no edge crosses is deleted too, a closed one cut once refused as a whole ellipse is, and a
closed one EXTEND refuses as a closed polyline; an elliptical arc grows round its ellipse from the
end its pick lies nearer in the ellipse's parameter (not along the curve, nor in a straight line),
and trims as an arc does, a whole ellipse as a circle, into an elliptical arc — cut once, it is left
as it is, `Curve must intersect cutting edges at least twice.` (es
`La curva debe intersecar las aristas de corte al menos dos veces.`); an
open polyline picked at any segment grows the end its pick lies nearer in the polyline's parameter
(the segment's index and how far along it: from the first half of the segments the start, so an end
segment's own end), straight or round an arc, and only that end
(`Object does not intersect an edge.` where it reaches none, though the other would), its own other
segments bounding it but the one growing and its neighbour there (p236); a polyline is
an edge of its own, so its picked segment is trimmed back to the segment's vertices and the
crossings on it, where it crosses itself too, whatever else crosses the polyline or nothing at all —
an open one shortened or split in two, a closed one opened from the cut's far end round to its near
one, keeping its direction and its handle (p177, p180, p183); an object cut in two is
kept as the piece from its start — its handle, its place in the drawing — and the other piece is a
new object, which Last finds, U putting the object back whole (the console's LIST, line, arc,
polyline and elliptical arc alike); a trim of an object no edge crosses deletes it ("In Quick mode,
selecting an object that doesn't cross a boundary deletes the object instead"), a polyline of one
segment too, but a circle one edge crosses once is left as it is, `Circle must intersect twice.` (es
`Se requieren dos intersecciones para el círculo.`); an extend that
reaches no edge says why, as the console does — a line whose other end would reach one
`No edge in that direction.`, else a line or an arc
`Path does not intersect with the bounding edge.` (es
`La trayectoria no se interseca con la arista de contorno.`), an open polyline's end
`Object does not intersect an edge.` (es `El objeto no se interseca con ninguna arista.`), an
elliptical arc too, a closed polyline, a whole ellipse, a closed spline, an MTEXT or a hatch
`Cannot EXTEND this object.` (es `Este objeto no se puede ALARGAR.`), a circle, a TEXT, an
attribute definition or a block reference the same (es `Objeto no procesado por ALARGA.`: p191,
p193, p199, p207–p211, p410), a dimension the path's; worked out in the UCS's XY plane
(PROJMODE 1), a line's new end at the Z along its own slope; an object whose normal is −Z lies
level, trimmed and an edge in its own plane (p175); one standing upright on the plane, picked, is
`Object is perpendicular to UCS XY plane.` (es `El objeto es perpendicular al plano XY del SCP.`),
and what only such an edge crosses or bounds is left, `Edge is perpendicular to UCS XY plane.` (es
`La arista es perpendicular al plano XY del SCP.`), both counted for Undo, TRIM and EXTEND alike
(p220, p221, p411); an object at another angle is neither an edge nor trimmed (it does not
highlight). The look (desktop trim/d01–d09): hovering, the piece a click takes away is drawn faded
in place, as ERASE fades an object, the rest as it is (d01-1), Quick's delete fading the whole
object (d01-2); an extension draws the object as it would be, whole, in the selection's glow (Shift
in TRIM d01-3, EXTEND d02-1), and Shift in EXTEND TRIM's faded ghost (d02-2); a fence or a Crossing
window running draws so what it will trim, planned as its click would commit it, against a copy of
the drawing (d03-1, d04-1, d06-2); a red ✕ up and to the right of the pick box or the crosshair
where a click trims and while TRIM's fence or window runs, none where it extends (d01-3, d02-1),
and a circle-and-slash where the pick is refused (a circle cut once, a text: d09-1, d09-2). English
wording from AutoCAD 2027's console (probes trim/p100–p389) and the 2026 help

**Missing:** Project — AutoCAD's `Enter a projection option [None/Ucs/View] <Ucs>:` (es
`Indique opción de proyección [Ninguna/SCP/Vista] <SCP>:`), in both modes, its choice an Undo step
as Edge's, and the settings saying `Projection=None` or `View`: None cuts only where objects meet in
3D (an edge at another height cuts nothing, and Quick mode then deletes what no longer crosses one),
View projects along the line of sight; everything here is worked out projected on the UCS's XY
plane, which is Ucs, so `P` is refused as an option not built —, the fence dragged
(`pick/drag cursor`), Shift held for a fence or a window (the console has no Shift: **unverified**),
PROJMODE, EDGEMODE and TRIMEXTENDMODE as variables (and across sessions, as AutoCAD keeps them in
the registry), a spline as an edge running on, projecting objects at an angle to the UCS onto its XY
plane (so Quick deletes what only an object at an angle crosses, where the console cuts it at the
projection: p221); a pick inside a hatch, which the console takes for none and starts a fence at
(p196, p197), here the hatch, refused; a spline an edge cuts or an open one EXTEND picks (the console leaves the piece on control
points and knots of its own — a trimmed one loses its fit points, a fit spline grows by a straight
piece along its end tangent behind a triple knot, a CV spline by a curved one —, which a spline
here, fit points or control vertices on uniform knots, cannot hold; so neither an open spline's
`Object does not intersect an edge.`); the piece after a polyline's own crossing, which the console
starts with a zero-length segment; **unverified**: the reasons when TRIM's Shift extends (EXTEND's,
the same code here), and whether a crossing at the pick bounds the trim of an arc, a circle or a
polyline (a line's does not, p261; here theirs does); the circle-and-slash over what EXTEND
refuses (only TRIM's refusals were seen), the look of EXTEND's fence or window running (here its
hover's glow) and whether the ✕ shows while a fence crosses nothing (here it does)

### `OFFSET` / `O` · es `DESFASE` / `DF` / `EQ`

**Implemented:** `Current settings: Erase source=No  Layer=Source  OFFSETGAPTYPE=0` (es
`Parámetros actuales: Borrar origen=No  Capa=Origen  OFFSETGAPTYPE=0`), then
`Specify offset distance or [Through/Erase/Layer] <Through>:` (es
`Precise distancia de desfase o [punto a Atravesar/Borrar/Capa] <punto a Atravesar>:`) — Enter takes
OFFSETDIST, `<Through>` in each drawing, then the last distance (per drawing, not saved: NEW and
OPEN bring `<Through>` back, rectang/p310), and two picks measure it
(`Specify second point:`, asked again from the same first point when they measure zero, p140); 0
or a negative distance says `Value must be positive and nonzero.` (es
`El valor debe ser positivo y diferente de cero.`) and asks again (p113, p114); Erase asks
`Erase source object after offsetting? [Yes/No] <No>:` (es
`¿Borrar objeto de origen tras desfase?`) and Layer
`Enter layer option for offset objects [Current/Source] <Source>:` (es
`Indique opción de capa para objetos desfasados [Actual/Origen]`), both program-wide, so kept for
the session and across NEW and OPEN, and reported by the next OFFSET (es `Borrar origen=Sí
Capa=Actual`, p310); one object selected before OFFSET, of a type it offsets, is the first one:
the selection is dropped as it starts and the side or through point asked once the distance or
Through is given, Erase and Layer between (p165, p251, p290); several are dropped and the object
asked (p167, p287); `Select object to offset or [Exit/Undo] <Exit>:` (es
`Designe objeto a desplazar o [Salir/Deshacer] <Salir>:`),
`Specify point on side to offset or [Exit/Multiple/Undo] <Exit>:` (es
`Precise punto en lado de desplazamiento o [Salir/Múltiple/Deshacer] <Salir>:`) and Through's
`Specify through point or [Exit/Multiple/Undo] <Exit>:` (es `Precise punto a atravesar o …`);
the object is clicked or typed (`@` from LASTPOINT, a number its direct distance), a point on nothing
asked again in silence and a selection mode refused with `Expects a point or Exit` (es
`Requiere un punto o Salir`) (p240, p241, p245, p298); the pick puts LASTPOINT there, hit or miss
(p240, p241); an object on a locked layer says `The object is on a locked layer.` (es
`El objeto está en una capa bloqueada.`, p250); the side and through points are points, picked or
typed (`x,y`, `@` from the object's pick, polar, a number, FROM) with X and Y in the tooltip and
object snaps, Perpendicular measured from the pick (p253–p276, p285); a through point on the object
(a line, its extension, a circle's rim) says `Invalid through point.` (es
`Punto a atravesar no válido.`) and at a circle's centre `Cannot offset that object.` (es
`Imposible transponer este objeto.`), then asks for the next object (p273, p277, p278, p295, p296);
Multiple asks `… [Exit/Undo] <next object>:` (es `<siguiente objeto>`), Through's too and steps out
from the last copy, Multiple typed again there taken in silence (p131, p137); Undo takes back the
last copy, whichever object it came from, and asks for the object in the run's mode, out of
Multiple, and with no copy left says `Command has been completely undone.` (es
`Comando deshecho totalmente.`, table 22415) (p125, p132, p138, p157, p158, p166); a line
offsets to a parallel line, a circle or an arc to a concentric one, and one taken to its centre or
past says `Cannot offset that object.` and asks for the next object (p174–p176); a polyline as
AutoCAD's OFFSETGAPTYPE 0 makes it (`offsetPolyline`): a zero-length segment left out (p194), the
side judged against an arc as the arc (p226), the offset segments extended or trimmed to meet and,
where they do not, joined by an arc on the source vertex whose radius is the distance (p183,
p184), an arc that collapses dropped (p230, p231), a segment the offset reverses dropped (p187),
and an outline pinched apart made one polyline per loop, in the source's order, from the vertices
AutoCAD starts them at and with the collinear ones it keeps (p188), one point's copies one step
for Undo and U; each segment keeps its widths (p185, p186); a closed polyline on one straight line
(p192, a bulged one offsets, p193), or one with nothing left at the distance, cannot be offset;
TEXT, MTEXT, INSERT, DIMENSION and HATCH (ATTDEF too) are refused at the pick with the same words,
the object asked again (p201–p205); Through on a polyline measures to it with its open ends drawn
on along their tangents (p211, p212), and outside an arc's span cannot offset (p209); the copy
keeps the source's colour, linetype, lineweight, plane and elevation, a line's rise and a line's
or polyline's thickness, but a circle's or an arc's copy has none (p218, p219, p225, p232, p233);
Erase replaces the source with its copy at once (p159), and in Multiple erases it when the object
is left — `<next object>`, Exit, a refused point — after its copies (p216, p224); a circle, an arc
or a polyline tilted to the UCS is offset in its own plane, its normal kept, the point taken there
along the line of sight (p235, p239; an isometric view, p237), and one edge-on to the view says
`Cannot offset that object at current view direction.` (es
`Imposible transponer este objeto en la dirección de la vista actual.`, table 21223) at the pick
(p207, p234); the object under the cursor at `Select object to offset` rolls over with the plain
glow (desktop d01-4), the picked one turns selected, and the side and through points drag the
copies they would make drawn as the objects, solid in the source's colour, every piece of a split
polyline and a tilted object's copy in its plane (d01-5, d02, d03)

**Missing:** OFFSETGAPTYPE 1 and 2, ellipses and splines (AutoCAD offsets them into a SPLINE,
p196–p198, which is not built: neither is picked, OFFSET-D11), Erase and Layer kept past the
session (OPEN leaves them, p310; a restart is unprobed), a polyline of more than 2000 segments
(declined with `Cannot offset that object.`, the clean-up's cap), the ghost's linetype and
lineweight (it wears the source's colour only, as MOVE's); **unverified**: one object preselected
on a locked layer, dropped here and the object asked; which piece Multiple steps on
from once a polyline falls apart (the first here); Escape and Undo with Erase in Multiple (the
source kept here, the copies kept as at Escape, desktop d06); a line out of the UCS's XY plane
(offset in that plane here, its rise kept; one along the UCS's Z cannot be offset); a closed
polyline of more than two vertices on one straight line (refused as p192); a through point on an
arc's circle outside its span (refused as p209); an open polyline the offset pinches apart (its
pieces stitched as a closed one's, a piece doubled by two collinear offsets left out)

### `FILLET` / `F` · es `EMPALME` / `MP`

**Implemented:** `Current settings: Mode = TRIM, Radius = 0.0000` (es
`Parámetros actuales: Modo = Recortar, Radio = 0.0000`),
`Select first object or [Undo/Polyline/Radius/Multiple]:` (es
`Designe el primer objeto o [Deshacer/Polilínea/RAdio/múLtiple]:`),
`Select second object or shift-select to apply corner or [Radius]:` (es
`Designe el segundo objeto o use la tecla Mayús para aplicar esquina o [Radio]:`) — Shift on the
second pick applies a corner, as radius 0 does — and `Specify fillet radius <0.0000>:` (es
`Precise radio de empalme <0.0000>:`; a negative one says `Value must be positive.`, es
`El valor debe ser positivo.`, and is asked again, 0 taken, a word
`Requires numeric distance or two points.`: corners/p116), the radius FILLETRAD, saved in the
drawing (NEW and a drawing opened bring theirs, rectang/p302, p316) and set inside the run, so U
takes it back and a FILLET that only set it is an undo step (p317, corners/p159); two lines, or two
straight segments of one polyline — adjacent, or one apart (the segment between, line or arc, is
replaced by the fillet), an open polyline's first and last closing it — of three, where they cross
before the first one's start; past its end the one between is replaced (corners/p200, p201,
p386) — rounded within it; one two
or more away says `Lines belonging to polylines must be consecutive or separated by one segment` (es
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
layer or the current one, wearing the second's lineweight and thickness (p360, p361); where the
second would turn back nothing is
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
arc–arc ones too (FILLETPOLYARC 1), an arc–arc one, as two arc segments picked, on the side the
chords turn to, the arcs run on past the vertex where they turn against them (p219, p322,
p362–p365) —, replaces an arc segment between two lines converging towards it (radius 0 removes it,
the lines meeting; lines diverging round it leave its own vertices rounded, p222), cuts each corner
in turn from the second vertex, a closed one's first last, against what the corners before left of
its segments, leaving one too short alone (a 20 square at radius 15: two rounded, p220), and reports
`4 lines were filleted` and then `1 was parallel    2 were too short` (parallel, too short; a
corner already sharp at radius 0 is counted; es
`4 líneas resultan unida(s) con empalme`, `1 resulta paralela(s)    2 resultan demasiado corta(s)`);
Multiple asks the first prompt again until Enter — Enter at Polyline's asks it too, and Enter at the
second prompt asks that again without a word, Multiple or not —, Multiple still listed in it;
anything but a polyline picked at Polyline's, or the newest a mode finds there, says
`Object selected is not a 2D polyline` (es `El objeto designado no es una polilínea 2D.`) and
Polyline's prompt is asked again; Undo, listed from the first prompt on, takes back the last
fillet, Polyline run or radius given in the command — Enter at the radius gives one too — and what
ran since, a transparent 'LTSCALE too (corners/p153, p156, p169); a refusal, a miss or Multiple is
none (p152); with none left it says `Command has been completely undone.` (es
`Todos los efectos del comando han sido deshechos.`) and asks again (p148, p150); after the command
U, REDO, UNDO and MREDO take its whole run as one step named FILLET, one that changed nothing too
(p157–p161); two lines at different heights or one rising give `Lines are non coplanar.` (es
`Las líneas no son coplanares.`, AutoCAD 2027's console) and the first prompt again; a line trimmed
or extended keeps its direction, only its end at the arc moving (a line kept from 100,0 to 0,0 now
runs from 100,0 to 30,0); the arc, at the lines' elevation, wears the lineweight and thickness of
the object picked second — a line, an arc or a circle — and neither its colour nor its linetype
(p229, p313, p331, p332, p334), and lies on the lines' layer when they share one, else on the
current layer (the one current at the second pick, p339), ByLayer ("The layer affects object
properties including color and linetype"); one built in a plane facing -Z is written at +Z, the
objects it trims keeping theirs (p335, p336); two lines sloping in one tilted plane are filleted in it,
and so is a polyline in a tilted plane with the UCS left as it was — two of its segments, or it with
a line or a polyline lying in its plane, joined there; one off it is
`Line and polyline are non coplanar.` / `Two entities are non coplanar.`, as the console says. The
object prompts take the selection modes Window, Last, Crossing, BOX, Fence, WPolygon and CPolygon
(not ALL, Previous, Group, AUto, SIngle, Add nor Remove: `*Invalid selection*`, corners/p289–p296),
read as the console reads them: a fence picks where it crosses; a line, an arc or a circle found
otherwise stands picked at its middle (a line keeps its longer side, an arc at radius 0
the part its middle lies on); a polyline crossed by a window or polygon is taken at the first
segment crossed, kept from its first vertex wherever the window lies; one found whole (a window
round it, Last) is taken but nothing is made of it, without a word; of several found the newest is
taken, and at the first prompt two or more are both objects, the older of the two newest first,
filleted at once — two parallel lines the newer first, capped from it —; a line found by a mode
other than a fence is capped from its end nearer the origin, as the console reads it; none found
asks again without a word; the first object found again — the segment a crossing window or a fence
finds of its polyline too — says `Cannot fillet an entity with itself.` (es
`No se puede empalmar un objeto consigo mismo.`) and ends, in Multiple too, and a segment of its
polyline two or more away is refused as a pick on it is; a mode never takes an object on a locked
layer — of what it finds the newest unlocked is taken, and finding only locked ones it says
`The object is on a locked layer.` (es `El objeto está en una capa bloqueada.`) and asks again
(p274). A TEXT, an attribute definition, an MTEXT or a HATCH picked or found at the first prompt
says `Fillet requires 2 lines, arcs, or circles.` (es `Empalme requiere 2 líneas, arcos o círculos.`),
a block reference `Fillet requires 2 lines, arcs, or circles (not block references).` (es
`… (no referencias a bloque).`), a dimension `… (not dimensions).` (es `… (no cotas).`), and the
prompt is asked again (p231–p235, p378, p381); at the second prompt the same, but an MTEXT or a HATCH
says `Cannot fillet between these two entities.` (es `Imposible empalmar estos dos objetos.`, another
string than the parallel pair's) and the command ends (p238, p239, p310–p312). A closed ELLIPSE is
an object: with a line or another ellipse, at a radius, `Unable to fillet curves.` (es
`No se pueden empalmar curvas.`) and the command ends, crossing or not (p325, p366, p383, p384); at
radius 0 a line that misses it makes nothing and nothing is said (p236); with a polyline's segment
`Cannot fillet between these two entities.` (es `Imposible empalmar estos dos objetos.`) at any
radius (p367, p385). A point typed at any of the three prompts is a pick there (`30,40`), the side it lies on
kept, read as a first point is — `@` from LASTPOINT, a polar point, `*` in the WCS, its Z kept, a
number a direct distance from LASTPOINT towards the cursor; `#` refused (p240–p248) —, and it
becomes LASTPOINT, on nothing too, where the prompt is asked again without a word (p249, p250,
p252); ORTHOMODE and the running snaps leave it as typed (p265, p266). An object snap override
typed at any of them (`_END`, `_MID`, `_INT`, `_NEA`, `_PER` from LASTPOINT, `_CEN`) picks at the
point it finds, which becomes LASTPOINT (p257–p263, p269, p309) — `_INT` at the second prompt takes
the newer there, the first object again (p260) —, and one finding nothing says
`No Endpoint found for specified point.` (es `No se ha encontrado ptoFINal para el punto designado.`)
then the prompt's refusal (p264); at Radius's prompt and a mode's points it is a point. Of two
objects under a pick the newer is taken, whichever is nearer (p277–p281). A pick on nothing but an
object on a locked layer says `The object is on a locked layer.` and asks the same prompt again
(p270, p271, p276); one on a layer that is off is not found (p272). A wrong answer is refused
`*Invalid selection*` then
`Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius` — the
console's list of the prompt's words leaves out the last, Multiple (and Trim, not offered here) —,
at the second prompt and Polyline's `…/CPolygon/Radius]:`, stray bracket and all — the first
prompt's words too at the second (`P`, `U`, `N`, `T`, whole or not), which declares the modes and
Radius alone (corners/p100, p121, p124) — (es `*Designación no válida*`,
`Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Deshacer/Polilínea/RAdio`,
`…/Radio]:`); a command typed there (`LINE`, p138) is such an answer, and a transparent one that
cannot be (`'LINE`) says `** That command may not be invoked transparently **` first (p144);
'ZOOM, '-PAN and '-OSNAP run at every prompt and resume it (p140–p146). A selection made
before the command is dropped, and nothing is left selected after (p162–p164); Enter at `Command:`
repeats it, and `'FILLET` is refused as no transparent command (p105, p106). The look (desktop
corners/d01–d06): the first prompt's rollover thickens what a pick takes — a line, an arc, a
circle, a closed ellipse, a polyline's segment alone (d01-1, d04-2, d04-3) —, none over a type it
refuses nor over an object on a locked layer (d04-4); the second prompt's ghost is what the click
makes, worked out as the click works it out — the lines trimmed and the arc, Shift's sharp corner,
the cap, a joined polyline — in the selection's glow, over the objects it replaces drawn dimmed in
place, so what shows of them is what it removes, the side following the cursor (d01-2, d01-3,
d02-1, d06-2), a circle left as drawn; with the cursor on nothing, or on an object making nothing,
the first object alone in the glow (d01-4), and on one the pair refuses — the first again, a type
refused, parallel, a radius too large — the circle-and-slash beside the cursor (d06-1); Polyline's
prompt over a 2D polyline draws every corner as the current radius would round it, in the glow,
over the polyline dimmed (d05-1), and nothing over anything else (d05-2). Wording, English and
Spanish, from AutoCAD 2027's console (corners/p100–p169, p174, p176, p231–p239, p240–p309,
p310–p312, p323, p325, p360–p388) and its string tables

**Missing:** what AutoCAD makes of a closed ellipse with a line meeting it at radius 0 (the line
trimmed to it, p324) and with an arc or a circle (a fillet, p368), and of an elliptical arc or a
spline (a fillet, the spline extended at radius 0: p237, p326, p369) — such a pick is not taken and
the prompt is asked again without a word, and a mode does not take an ellipse or a spline; the
linetype scale the arc takes from the object picked second (`LinetypeScale` 2, p332: no per-object
linetype scale is modelled); Trim (TRIMMODE is always 1, so it is not listed; `T`, es `R`, is taken
as its word and refused as a wrong answer, so Spanish `R` never opens RAdio, p165, p168), the
console's choice between two fillets of an ARC or a CIRCLE equally near a line's pick (a figure
symmetric about it: the right one at radius 15, the left at 200, acc/b1, b4 — here the first found),
the zero-length arc the console leaves at the origin where a cap would turn the second line back,
`out of limits`; the double space Autodesk's Spanish puts before `[Radio]` at the second prompt;
the refusal's words in the cursor's tooltip before the click, over a pair that makes no corner
(`Imposible empalmar esos dos objetos.` in place of the prompt, desktop corners/d06-1: the dynamic
prompt here shows the prompt alone); the padlock beside the pick box over an object on a locked
layer and the locked layers' fade (LAYLOCKFADECTL, d04-4), left to the Properties review;
**unverified**: whether the first object, a polyline's segment, glows at the second prompt as that
segment alone (as the rollover; seen only with a line, d01-4), the circle-and-slash over the first
object again or a radius too large (shown here, as over d06-1's pair), whether a circle a mode
finds stands picked at its angle 0 or at 180° (here 180°, which p303–p305 match: the console
settles only that it is one of them), two closed ellipses at radius 0 (not taken), the arc–arc rule beyond p219, p322 and p362–p365, and an open polyline's
first and last of three that cross along the first segment itself (one apart here)

### `CHAMFER` / `CHA` · es `CHAFLAN` / `CH`

**Implemented:** `(TRIM mode) Current chamfer Dist1 = 0.0000, Dist2 = 0.0000` (es
`(Modo Recortar) Primera distancia de chaflán actual  = 0.0000, Segunda distancia = 0.0000`,
Autodesk's double space kept), `Select first line or [Undo/Polyline/Distance/Multiple]:` (es
`Designe la primera línea o [desHacer/Polilínea/Distancia/múLtiple]:`),
`Select second line or shift-select to apply corner or [Distance]:` (es
`Designe la segunda línea o use la tecla Mayús para aplicar esquina o [Distancia]:`) — Shift on the
second pick applies a corner, as both distances 0 do — and Distance's
`Specify first chamfer distance <0.0000>:` then `Specify second chamfer distance <…>:`, whose
default is the first when it was typed, CHAMFERB when Enter kept it (corners/p110, p111, p137; es
`Precise  primera distancia de chaflán`, `Precise  segunda distancia de chaflán`, double space and
all), each refusing a negative one as FILLET's radius and asked again (p119), both CHAMFERA and
CHAMFERB, saved in the drawing (rectang/p302, p316) and set inside the run, so U takes them back
(p317); distance chamfer between two lines, or two straight segments of one polyline (as FILLET's:
adjacent, one apart, an open one's ends, p328; the first distance on the one picked first), a line and a
polyline's straight segment, or segments of two polylines, joined into one polyline by the bevel as
FILLET joins them, the first distance on the one picked first (`D` 10, 5 on a corner at 100,80:
100,70 then 95,80 picking the polyline first, 100,75 then 90,80 the line); a distance running past
the end of its line or picked segment says `Chamfer distance is too large` (even with more polyline
beyond), a parallel pair `Lines are parallel`, and the command ends with no `*Invalid*`, as at
FILLET's coplanar messages; two lines with FILLET's refusals (`Chamfer distance is too large`), two
parallel lines `Lines are parallel` then `*Invalid*` (es `Las líneas son paralelas`, `*No válido*`),
and collinear ones `Collinear lines connot be chamfered.`, Autodesk's typo and all (es
`Las líneas colineales no pueden ser unidos con chaflán.`), with no `*Invalid*` — each ending the
command, or in Multiple asking the first prompt again; an arc segment of a polyline is picked too:
beside a line or another polyline it is `Cannot chamfer polyline arc segments.` (es
`Imposible unir con chaflán segmentos de arco de polilínea.`, corners/p167, p214) and the command
ends, or in Multiple the first prompt again; an ARC or a CIRCLE, at either prompt, says
`Chamfer requires 2 lines (not arc segments).` (es
`Chaflán requiere 2 líneas (no segmentos de arco).`, p167, p196–p198) and the same prompt is asked
again; a TEXT, an attribute definition, an MTEXT or a HATCH at the first prompt says
`Chamfer requires 2 lines.` (es `Chaflán requiere 2 líneas.`), a block reference
`Chamfer requires 2 lines (not block references).` (es `… (no referencias a bloque).`), a dimension
`Chamfer requires 2 lines (not dimensions).` (es `… (no cotas).`), the prompt asked again
(p316–p318, p376, p377, p382), and at the second the same, but an MTEXT or a HATCH
`Cannot chamfer between these two entities.` (es
`Imposible hacer un chaflán entre estas dos entidades.`) and the end (p371–p375); an ELLIPSE, an
elliptical arc or a SPLINE is taken at either prompt, and with a line, picked first or second, says
`Cannot chamfer between these two entities.` and the command ends (p314, p315, p319, p327, p370,
p380), and at Polyline's it is no 2D polyline (p379); within its polyline — adjacent, or one apart — it is cut as its chord (the distance along the
chord, `Chamfer distance is too large` and then `*Invalid*` past it, `Lines are parallel` and
`*Invalid*` for parallel chords), and what is left of it keeps its radius,
its turn and its side of a half circle (a half circle becomes the major arc; a chord longer than the
diameter opens the arc as far as it asks: the console's bulge `-1.0357` for 82.85 at radius 40);
Polyline's `Select 2D polyline or [Distance]:` (es `Seleccione una polilínea 2D o [Distancia]:`,
worded otherwise than FILLET's; anything else picked there refused as at FILLET's) bevels every
vertex, the first distance along the segment coming in, an arc segment as its chord
(`1 line was chamfered` at a line–arc vertex), each in turn as FILLET's (p226), and reports `4 lines were chamfered` (es
`4 líneas resultan unida(s) con chaflán`) and the reasons line; Multiple, Undo (p149, p154, p155,
a transparent 'LTSCALE taken back as FILLET's p156), Enter, transparency, the preselection and the
repeat as FILLET's, Undo taking back distances too; the same coplanar test and message as FILLET,
two lines sloping in one tilted plane chamfered in it, and a polyline in a tilted plane as FILLET
works it; a line trimmed or extended keeps its direction, only its cut end moving, and the bevel
runs from the first line's cut to the second's; the bevel, at the lines' elevation, wears the second
line's lineweight and thickness, and lies on the lines' layer when they share one, else on the
current layer, ByLayer, as FILLET's arc (p332, p334, p339). The object prompts take FILLET's selection modes, typed points and object snap
overrides (corners/p253–p256, p267, p268, p281, p307), read as FILLET reads them, and refuse a
locked object as FILLET's do (p275), but the first prompt too takes the newest found and asks the
second; an ARC or a CIRCLE found says `Chamfer requires 2 lines (not arc segments).`, the first line found or picked again — or
its polyline's segment — `Cannot chamfer an entity with itself.` (es
`No se puede achaflanar un objeto consigo mismo.`) and ends, in Multiple too, and segments of one
polyline two or more apart are refused in FILLET's words; a wrong answer is refused
`Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Distance`, at the
second prompt and Polyline's `…/CPolygon/Distance` (the first prompt's words refused at the second,
as FILLET's: p122, p125) (the console's `Distance/Angle`, Angle not offered; es
`…/desHacer/Polilínea/Distancia`, `…/Distancia`: p117, p118). The look is FILLET's: the rollover
(a line, a polyline's segment, an ellipse, an elliptical arc or a spline; none over an ARC, a
CIRCLE, a type refused or a locked object), the ghost of the cut lines and the bevel or Shift's
corner in the glow over the originals dimmed (desktop corners/d03-1, d03-2), the circle-and-slash
over a pair refused, and Polyline's corners at the current distances. Wording, English and Spanish,
from AutoCAD 2027's console (corners/p100–p169, p182, p184, p314–p319, p327, p370–p382) and its
string tables

**Missing:** the bevel's linetype scale from the second line, as FILLET's arc's; Angle, mEthod and
Trim (CHAMMODE is always Distance and TRIMMODE 1, so they are not listed, nor the second prompt's
and Polyline's Angle and Method: 2027 lists `Select 2D polyline or [Distance/Angle/Method]:`, es
`[Distancia/ángUlo/Método]`, and `M` at either prompt is Method's
`Enter trim method [Distance/Angle] <Distance>:`, refused here: corners/p112, p122, p125); the
refusal's words at the cursor, the padlock and the locked layers' fade, as FILLET's;
**unverified**: an ellipse or a spline with anything but a line (said as with one), and one a mode
finds (not taken)

### `STRETCH` / `S` · es `ESTIRA` / `EI`

**Implemented:** `Select objects to stretch by crossing-window or crossing-polygon...` (es
`Designe objetos que estirar mediante ventana o polígono...`), then MOVE's selection, its modes
without Group (p258), base point and second point (transforms/p223, p224). Each object stretches as
it was first added, a duplicate window or pick changing nothing (`1 found (1 duplicate)`, p265,
p279): one a crossing window, a crossing polygon (CPolygon) or a crossing lasso found is stretched
by that frame alone, two windows each stretching their own (p264, p269); one a pick, Window,
WPolygon or Fence found moves whole (p262, p263, p267, p269); one Last or ALL found neither
stretches nor moves (p268); Remove takes out (p270). What a frame catches: a line's ends, a
polyline's vertices, a spline's fit points or control vertices (p278); an arc's ends, one caught
refitting the arc through the moved and the fixed end with its chord height kept on the same side,
both moving it whole, its centre alone nothing; a polyline's arc segment with one end moved keeps
its chord height, with both its bulge (p271, p281); a circle by its centre, TEXT, MTEXT and a block
reference by their insertion point (p272); a linear or aligned dimension's origins one by one,
restating the measurement, and its line with its own point, DXF 10 where it meets the second
extension line (p273, p274); a hatch's loop vertices, as AutoCAD's associative hatch, the default
(p276). A 3D displacement moves whole (Z included) what the window catches whole, and a line's
caught end in Z; anything else caught in part stays in its plane. Enter at the second point uses
the first point as the displacement; the Displacement keeps LASTPOINT where it was, so `@10,5` and
a number run from it and Enter leaves it there, the point still read as the displacement from the
UCS origin (p251, p259, p260), and its hidden `Displacement` asks
`Specify second point or <use first point as displacement>:` from the origin (p261); LASTPOINT is
the second point however given and the base at Enter (p249, p250, p254–p257). A stretch by nothing
changes nothing, its run the step U names (MOVE-D3: p249–p253); the drag is MOVE's (desktop d09);
a whole ellipse moves with its centre in the window and stays for a quadrant alone (ellipse/p326,
p331)

**Missing:** the selection modes' gaps (Command line, `Select objects:`); an elliptical arc with an
end in the window: AutoCAD moves that end and keeps the other, the arc an affine image of itself
with its parameter sweep kept (ellipse/p324, p333, p336–p338; p332 moved an end lying 0.14 outside
the window), whose rule no probe has fixed yet (ELLIPSE-D44); here the arc moves whole with its
centre in the window, else stays. A dimension's text position (DXF 11), which a window over the
text alone moves with the line (p275), is not modelled. A non-associative hatch caught in part
stays in AutoCAD (p277): associativity is not modelled (MOVE-D11). **Unverified:** Previous, which
stretches nothing here as Last; a preselection, which moves whole (p289 runs noun-verb STRETCH, not
its geometry); a dimension with both origins caught and its own point out (its line stays); an
angular or radial dimension's line (it follows when both origins move); Enter at the
Displacement's second point; a hatch loop's arc segments, which keep their bulges

### `ERASE` / `E` / `DELETE` · es `BORRA` / `B` / `DELETE`

**Implemented:** noun-verb and verb-noun (MOVE's `Select objects:` and its modes; Enter or Space
erases, Escape erases nothing), one undo step that U names `ERASE`; nothing said once the set
closes, the history ending at `Select objects:` or a preselection's count, and Enter on an empty set
silent (erase/p00, p01, p304, desktop d09); `DELETE` from both `acad.pgp` files (erase/p302). At its
`Select objects:` the object under the cursor and the set draw faded in their own colour, AutoCAD's
erase preview, where other commands glow (desktop d09-2, d09-4), and so does what a window or lasso
under way would take. The Delete key with objects selected at `Command:` runs ERASE as acad.cuix's
`^C^C_erase;` does: echoed `_.erase 1 found`, U names it, Enter repeats it (desktop d11).
Backspace does the same: a Mac's Delete key reaches the browser as Backspace (AutoCAD's own
Backspace there is unverified)

**Missing:** OOPS, which in 2027 brings back the last set ERASE erased even after other commands, as
a step U names `OOPS`, and with nothing to bring back says nothing (erase/p307, p309)

### `EXPLODE` / `X` · es `DESCOMP` / `DP`

**Implemented:** `X` echoed `X EXPLODE`, es `DP` (`DESCOMP`), Enter repeats it (pieces/p240, p243,
p245); one undo step that U names `EXPLODE` (es `DESCOMP`, p247), which puts the exploded objects
back where they were in the drawing's order (`ERASE _L` then finds what was drawn after them,
p262). Polyline → lines/arcs on its centreline, each with every property, its plane and Z
(standing and −Z ones too, p248, p250, p251), its widths lost with
`Exploding this polyline has lost width information.` / `The UNDO command will restore it.` for each
wide one (es `Al descomponer esta línea se ha perdido información de grosor.` /
`Se puede restituir con el comando DESHACER.`, the table's; p249), block reference → contents (one
nesting level), placed as the reference drew them, fresh ids, their own colours and layers, layer-0
reverting to real layer 0 (p252); a reference with attributes gives its definitions back and drops
the values (p254). Multiline text → one TEXT per line as drawn, each Left at its line's drawn left
end whatever the attachment, wrapped lines included (p255–p257). A pattern hatch → its pattern's
lines clipped to its boundary, on its layer with its colour and lineweight, each with linetype
`Continuous` set (p259: 33 LINEs for ANSI31 over 100 × 50; p263). `Select objects:` takes whole
objects (its refusal lists no `SUbobject/Object`, erase/p02, p138). A spline, an ellipse or
elliptical arc and a SOLID hatch pass the count and are refused by name once the set is closed,
each one: `Cannot explode SPLINE`, `Cannot explode ELLIPSE`, `Cannot explode HATCH` (es
`No se puede descomponer …`; spline/p319, p324; pieces/p260, p261, p265). Anything else (lines,
circles, arcs, texts, attribute definitions, dimensions) is refused as it is found, under each
selection's count and after the locked layer's line, counted in `found` and kept out of the set and
its total: `1 found` / `1 was not able to be exploded.` (es `1 no se ha podido descomponer.`); at
`Remove objects:` nothing is said (erase/p213–p219, p248; pieces/p261). Enter on an empty set, after
everything was refused too, says `None found.` (es `No hallada.`, table 20841; p205, p216). A
preselection is counted and sifted the same way after the echo; with nothing left it asks
`Select objects:` and explodes at the first selection that adds something, with no Enter
(`1 found, 0 total` for a refused one, p241, p242, p254). It leaves nothing selected and the
pieces as the Previous set (`ERASE _P` → `2 found`, p236, p258)

**Missing:** a dimension, which 2027 explodes into its LINEs, a SOLID per arrowhead and an MTEXT
(pieces/p258): refused, as there is no SOLID object here (WHY at `ExplodeTool`'s refusal); a hatch
of a pattern this build does not ship is named like a SOLID one; the pattern's lines are made in
the generator's order, not AutoCAD's (p259 runs from the far corner); `Hatch boundary associativity
removed.` (es `Asociatividad del contorno del sombreado eliminada.`, p263), as no hatch is
associative here; exploded MTEXT's positions differ by the font's metrics (EXP-06, p255: OLD at
9.324693,39.822647 in AutoCAD, 10,40 here); ByBlock resolution, non-uniform-scale → ellipse
conversion

### `JOIN` / `J` · es `UNIR` / `U`†

**Implemented:** `Select source object or multiple objects to join at once:`, then
`Select objects to join:` once one is picked (es
`Designe un objeto de origen o varios objetos para unirlos a la vez`,
`Seleccione objetos para unir`; pieces/p300, p301), with MOVE's counts, Enter at the first prompt
ending silently (p309). The set is read in its order, a window's or a crossing's find newest first
(`ssget`'s order, p390, p341; a polygon's and a lasso's too, unprobed), and makes:

- **collinear lines** — touching, with gaps, overlapping, rising along one line in space — the
  source LINE, the set's first, stretched to the farthest ends along its own direction, its handle
  and properties kept: `2 lines joined into 1 line` (es `2 líneas unidas en 1 línea`; p300, p328,
  p329, p342, p349);
- **arcs of one circle** the source ARC, counter-clockwise from its start over every gap to the
  farthest end: `2 arcs joined into 1 arc` (es `2 arcos unidos en 1 arco`; p327, p344); arcs that
  reach back to its start ask
  `Combined arc segments form a circle.  Convert to circle? [Yes/No] <Yes>:` (es
  `Los segmentos de arco combinados forman un círculo. ¿Convertir en círculo? [Sí/No] <Sí>`), Yes or
  Enter a new CIRCLE with the source's properties, `2 arcs joined and converted to circle` (es
  `2 arcos unidos y convertidos a círculo`), No nothing, silently (p326, p382, p385–p387);
- **anything else** polylines, one per chain, each grown from a source — the set's first polyline,
  which keeps its handle, properties and widths (`1 segment joined into 1 polyline`,
  `2 segments joined into 1 polyline`, counting the segments added; es
  `1 segmento unido en 1 polilínea`; p322, p343, p356, p378–p380), else its first object, whose
  properties a new polyline wears (`2 objects converted to 1 polyline`,
  `4 objects converted to 2 polylines`; es `2 objetos convertidos en 1 polilínea`,
  `4 objetos convertidos a 2 polilíneas`; p319, p321, p333, p339, p340) — over whole objects that
  meet one of its ends in its plane, in the set's order and scanned again after each, until none
  fits or it closes (p324, p338, p377, p384); a lens closes in two vertices (p325); a polyline joins
  only by its ends and a closed one never (p373, p388, p389); arcs become bulges; a line or an arc
  after the polyline's end takes the width it ends at, before its start its first segment's widths
  (p354–p356); at the plane's elevation (p345), what touches in plan at another height discarded
  (p346).

What no result takes is counted after it, `, 1 object discarded from the operation` (es
`, 1 objeto descartado de la operación`; p319, p377); with nothing joined
`0 objects joined, 2 objects discarded from the operation` (es
`0 objetos unidos, 2 objetos descartados de la operación`; p334). One undo step, named JOIN / UNIR
(p360–p362).

**Missing:** a single source's own step (`Select lines to join to source:`, es
`Designe líneas que unir al origen`, and its `1 line joined to source` counts; p310, p311,
p348, p372, p383): here a source alone and Enter is a set of one,
`0 objects joined, 1 object discarded from the operation`; splines, elliptical arcs and helixes,
discarded here (AutoCAD: `2 objects joined into 1 spline`, p331, p374;
`2 elliptical arcs joined into 1 arc`, p332; an arc and an elliptical arc
`2 objects converted to 1 spline`, p375; cLose `Ellipse successfully closed.`, p369); objects
under a −Z normal, discarded (AutoCAD: a 3D polyline from such a polyline and a line, p353, a
spline from such an arc and a line, p352) and objects in a tilted plane (AutoCAD joins lines
drawn in UCS X 90 into a polyline of that normal, p351); a rising line is left out, where AutoCAD
2027 flattens one into the level polyline, its rise lost (p347, p330), yet joins nothing when the
level line is off Z 0 (p358) — neither copied (PIECES-D24); the order of a fence's and the named
modes' finds (the drawing's here, unprobed); a run that both grows a polyline and makes new ones
words its count as new polylines (unprobed)

### `BREAK` / `BR` / `BREAKATPOINT` · es `PARTE` / `P` · `PARTIRENPUNTO`

**Implemented:** `Select object:` (es `Designe objeto:`; nothing there: `No object found`, es
`No se ha encontrado ningún objeto`), whose pick is the first point — a point typed there is one, of
the newest object under it though nearer the older (`@` from LASTPOINT, a number its direct
distance, the point LASTPOINT after, found or not; BREAKATPOINT then asks its break point; p100,
p122, p123, p145, p176, p179) —, or a selection mode typed there (Window, Last, Crossing, BOX, ALL,
Fence, WPolygon, CPolygon; no Group, p115, p144) taking the oldest object it finds and asking
`Specify first break point:` (p125–p132); an object snap override typed or chosen there picks at
the point it finds, which is BREAK's first break point and LASTPOINT (`_END`, `_MID`, `_NEA`,
`_PER` from LASTPOINT, `_QUA`; `_INT` the newer object at the crossing; `_CEN` of a circle finds no
object at its centre, LASTPOINT there; p108–p114, p177), one finding nothing says so
(`No Center found for specified point.`) and the prompt refuses it, `*Invalid selection*` and its
Expects line, LASTPOINT kept (p115); the newest object under the pick is tested locked or not, one
on a locked layer saying `The object is on a locked layer.` (es
`El objeto está en una capa bloqueada.`) and `No object found` (p100, p105, p106, p124, desktop
d06), and a mode says that line once for each locked object it finds, then takes the oldest
unlocked one, or with none says `No object found` (p101–p104, p107, p178); a preselection is not
taken, and nothing is left selected nor a Previous set (p172–p175); then
`Specify second break point or [First point]:` (es
`Precise segundo punto de ruptura o [Primer punto]`), First point asking
`Specify first break point:` and `Specify second break point:` (es
`Precise primer punto de ruptura`, `Precise segundo punto de ruptura`), where First point, unlisted,
ends BREAK changing nothing (p150, p171); BREAKATPOINT's `Specify break point:` (es
`Especifique el punto de interrupción`); Enter (keyboard or right button) at a break point is
refused and the prompt asked again, `Point or option keyword required.` (es
`Se requiere un punto o una opción.`) at the second break points, `Invalid point.` (es
`Punto no válido.`) at the first and BREAKATPOINT's (p146, p149–p151, desktop d15); the points
picked or typed — object snaps, FROM and Ortho as at any point prompt (p116–p118, p120, p121), a
number a direct distance from the pick (p147, p148), a Z kept, `#` refused at `Select object:`
and `*` read in the WCS (p153–p157), a point typed in the box absolute, as the desktop's pointer
input shows it (d10-2, d10-4), `@` from the first point (p154, p160, p161) —, `@` at the second
splitting at the first, the second becoming LASTPOINT; one undo step named BREAK or BREAKATPOINT
(es PARTE, PARTIRENPUNTO), a run that changed nothing too (p166–p171); line/arc/circle (`@` and
BREAKATPOINT at a line's or an arc's end doing nothing, silently), CCW circle break, a circle's same
point twice refused with `Arc cannot be full 360 degrees` (es `Un arco no puede tener 360 grados`);
polylines, as the console's LIST shows them: an open one loses the part between the two points, a
closed one the part between them in its vertices' order — whichever is picked first, even the longer
way round — and is left open from the later point round to the earlier, an arc segment cut on its
own circle; the same point twice (`@`, BREAKATPOINT) splits one at a vertex too, a closed one at its
start vertex as well, and does nothing at an end or at that start vertex; an object broken in two is
kept as the piece from its start — its handle, its place in the drawing —, the other piece a new
object, which Last finds, and a circle is kept as the arc left (p205, p209–p219, p224, p225, p228);
ellipses, as the console's DXF parameters show them: a whole one loses what runs counter-clockwise
from the first point to the second and keeps its handle (ellipse/p334; `@` and BREAKATPOINT on it
`Cannot break a closed, periodic curve at only one point.`, es
`No es posible partir una curva periódica cerrada en un solo punto.`), an elliptical arc what lies
between the points in its parameter, whichever comes first, split by `@`, untouched at an end; text,
MTEXT, attribute definitions, dimensions and hatches `Object can't be broken` (es
`Imposible partir este objeto`), a block `Can't break a block` (es `Imposible partir un bloque`),
picked or found by a mode, and `Select object:` again (p180–p187); points off the object taken at
its nearest point, an arc's from its gap at its nearer end (p200–p204, p206, p218, p219); a line's
pieces keep the Z along its slope (p189), every piece the object's layer, colour, linetype,
lineweight, thickness and elevation (p194–p196, p198), in a turned UCS as in the WCS (p197); a
polyline not level with the UCS, standing up or under a −Z normal, broken in its OCS, a point lying
in its plane read there and any other where the line of sight meets it, the pieces keeping its
normal and elevation (p190, p192); the look: `Select object:`'s rollover the plain hover glow, as
FILLET's, over a text too, none over a locked object (desktop d01-1, d06-1, d06-2); at the second
break point the break the click would make, what it keeps in the selection's glow over the object
dimmed — nothing glowing where all of it goes, the object glowing where nothing changes —, off the
object at its nearest point, past an end to the end (d01-2–d01-4, d02-1, d03-1, d03-2, d04-2);
`Specify first break point:` the object plain (d04-1); BREAKATPOINT's point the object whole in the
glow (d14-1)

**Missing:** splines (they do not highlight; AutoCAD breaks a CV spline into pieces on control
points and knots of their own, which a spline here, on uniform knots, cannot hold, spline/p325, and
a fit spline broken at two fit points into fit splines whose end tangents are the curve's
derivatives there, p326); a point typed off the screen at `Select object:` (command-line.md's
`Select objects:` Missing); a mirrored whole ellipse,
which AutoCAD breaks counter-clockwise about its −Z normal (ellipse/p329; MIRROR's entry); an ARC,
CIRCLE or ELLIPSE not level with the UCS, `No object found` here: AutoCAD breaks one, a −Z one
reading the picks' WCS X,Y as OCS coordinates (p191, p193, p199, p229, p230), a tilted one by a rule
p188 does not settle (PIECES-D10); the ghost under a far Endpoint marker trails the raw cursor in
AutoCAD while the click takes the marker (desktop d13), here it follows the point the click takes
(PIECES-D30)

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
palette disabled with a reason when in use; an array's anonymous block is none of them (the drawing
is saved without it once unused, ARRAYRECT's entry)

**Missing:** layers / text styles / dim styles, the Purge dialog, "one level at a time", Purge
Nested Items, unnamed objects
