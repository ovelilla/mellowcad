# Draw

### `LINE` / `L` · es `LINEA` / `L`

**Implemented:** `LINE Specify first point:` (es `LINEA Precise primer punto:`), then
`Specify next point or [Undo]:` from it on — its Undo takes that point back — and `[Close/Undo]`
from the second segment (es `Precise punto siguiente o [desHacer]` /
`Precise siguiente punto o [Cerrar/desHacer]`, worded apart as the console words them); the history
writes each prompt with its answer (see Command window); what each prompt does not take refused in
its words (`Invalid point.` at the first point, `_U` and `_C` included; `Point or option keyword
required.` at the next); Undo steps back one segment at a time, taking back with it a transparent
command run since (`'LTSCALE`, `'-COLOR`), whose queued regeneration it does then; with no segment
left `All segments already undone.` (es `Ya están anulados todos los segmentos.`) and the first
point asked again; under UNDO Control None the prompt steps back and the segment stays; Close draws
back to the first point and ends; Continue, Enter or a right-click at the first point: from the end
of the last line, polyline or arc — an arc drawn clockwise from the end it was drawn to, the one
LASTPOINT is on —, from an arc or a polyline ending in an arc tangent to it asking only
`Length of line:` (es `Longitud de la línea:`; typed, negative the other way, or a pick at that
distance; Enter, the right button or a keyword refused with
`Requires numeric distance or second point.`), then on, its Undo going back to `Length of line:`;
with nothing to continue `No line or arc to continue.` (es
`No hay línea o arco que se pueda continuar.`) and the first point asked again; direct distance
along the cursor (negative: the other way), along an OTRACK guide or an Extension measured from the
acquired point (still the first point's question); a zero-length segment typed (`0`, `@`, `0` at
`Length of line:`) drawn, counted and said, `Zero length line created at (x, y, z)` (es
`Línea de longitud cero creada en (…)`) at the drawing's precision, the point in the WCS whatever
the UCS (arc/p201, p210), while two picks on one point (a
double click) draw none, as the desktop does; the `<angle` override; the length and angle fields,
the angle shown acute (0–180°) and a typed one read on the cursor's side; `@` at the first point
from LASTPOINT; a Tangent or Perpendicular override at the first point deferred until the next
(over a circle or an arc, and a Perpendicular's line, the green Deferred Tangent or Deferred
Perpendicular marker, the tangent or right-angle glyph trailing three dots, with its tooltip, es
`Tangente diferida`, `Perpendicular diferida`, tables 85, 86 — CIRCLE's, desktop circle/d03; then
asking for the next point): with a plain next point, the tangent from it or the foot of the
perpendicular (on a line, a circle or an arc), with a second Tangent the line touching
both circles — of the four, the one nearest the picks — and a Tangent with a Perpendicular to a line
the line touching the one square to the other; each end at its own point's Z, with THICKNESS; one U
undoes the whole command, Ctrl+Z inside it is `_u` typed at its prompt (its Undo, `Invalid point.`
at the first point)

**Missing:** a deferred snap on a polyline segment, an ellipse or a spline, two deferred
Perpendiculars; a pick whose object snap lands on the point before is skipped as a double click is
(**unverified**: the console draws a zero-length line for an APP or PER typed there, line/p32)

### `PLINE` / `PL` · es `POL` / `PL`†

**Implemented:** `Specify start point:`, `Current line-width is 0.0000` (at the drawing's
precision), `Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]:` (Close once a segment
exists, Undo from the start: `All segments already undone.` with none) and in arc mode
`Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Halfwidth/Line/Radius/Second pt/Undo/Width]:`
(es `Precise punto inicial`, `El grosor de la línea actual es`,
`Precise punto siguiente o [Arco/Cerrar/Mitad grosor/Longitud/desHacer/Grosor]`,
`Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o [ángUlo/cEntro/Cerrar/Dirección/Mitad grosor/líNea/Radio/Segundo pto./desHacer/Grosor]`,
`Segundo pto.` declared `Segundo`, p102, and `CE` Cerrar, p104; `C` asks
`CEnter or CLose?` in English, p103);
straight segments and arcs, open + closed; Continue, Enter or a right-click at the start point:
from the end of the last line, polyline or arc — an arc drawn clockwise from the end it was drawn
to, the one LASTPOINT is on (p32), a closed polyline from its first vertex (p189) —, whatever
LASTPOINT is and past a circle (p185, p190); with nothing to continue from the WCS's origin,
silently, whatever LASTPOINT and the UCS's origin (p178, p184, p186, p191); the arc's endpoint
tangent to the chain — the first one leaving the way the last line, arc or polyline drawn ends
heading, a clockwise arc the way it was drawn (p33, p35), else along the UCS's X (p193) — or the
other way while Ctrl is held, an end straight ahead `*Invalid*`, which keeps LASTPOINT (p38); Angle
(`Specify included angle:`, 0 and 360 refused `Value must be nonzero.`, es
`El valor debe ser diferente de cero.`, p110, p111; then the endpoint or `[CEnter/Radius]`,
Radius's `Specify direction of chord for arc … <0>:` defaulting to where the chain heads, `<270>`
after a clockwise arc (p37), written again as first written after `'AUPREC` (p114), its radius
taking 0, a segment of no length (p131), and a negative one as its size (p256, p257)), CEnter
(`Specify center point of arc:`, then the endpoint or `[Angle/Length]`, a negative chord the major
arc, 0 `Value must be nonzero.`, p117, p133), Direction
(`Specify the tangent direction for the start point of arc:`, Enter keeping the chain's heading
with no default shown, p134; `Specify endpoint of the arc …:`), Radius (the minor arc
counter-clockwise, a negative radius the major one, 0 `Value must be nonzero.`, p121, p122, p136;
or `[Angle]` and the chord's direction), Second pt (`Specify second point on arc:`,
`Specify end point of arc:`), each refusing as the console does (Enter where no default:
`Invalid 2D point.`, p131–p136), a typed `@` from LASTPOINT (p138), their angles and distances
measured by points as AutoCAD's are (p140, p141); an answer that makes no arc — a chord past the
diameter, an end straight ahead or back, collinear points, CEnter's included angle of 0 — is
`*Invalid*` and the arc prompt again, LASTPOINT at the arc's start (p118–p125, p250–p255), and an
arc's end is LASTPOINT whatever answered last (p117, p138); where the first arc or its chord's
default takes the heading of a line rising off the plane, `Previous direction not UCS parallel,
using 0.` (es `La dirección anterior no es paralela al SCP; usando 0.`, table 21314, p149);
transparent commands at the sub-prompts (p142, p143); arc-mode CLose with the tangent arc
(`*Invalid*` and a line where none leaves that way, p126, p127); Undo back to the mode of the
segment left last (p128, p129), taking back with the segment a transparent
command run since it was added (`'LTSCALE`, `'-COLOR`, p26, p27, p43, p44; one run at an arc's
sub-prompts stays, p144), whose queued regeneration it does then, and under UNDO Control None
removing nothing (p42); Length's `Specify length of line:` (es
`Precise longitud de línea:`), no default (Enter and `FOO`:
`Requires numeric distance or second point.`), a point measured from the last vertex, the line on
the way the chain heads — along the last segment, tangent to an arc, and as the first segment the
way the last line, arc or polyline drawn ends heading (p34), else along the UCS's X (p161) —, a
negative length back the other way and 0 a segment of no length, as the console's, its end
LASTPOINT (p153, p171); a 3D start point sets the polyline's height (p18) and after it a point typed
at the command line with a Z or `*` is refused (`2D point or option keyword required.`, at an arc
sub-prompt's point `Invalid 2D point.`; p18–p20, p137), the dynamic-input box taking it; `@` a
zero-length vertex (p17); direct distance along the cursor, 0 a zero-length vertex and a negative
one the other way (p195); a Tangent or Perpendicular override at the start point, with nothing to
measure from, finds nothing (`No found for specified point.`, `Invalid point.`, p29); in the first
vertex's plane, the others projected onto it; the layer, colour, linetype, lineweight and THICKNESS
current at the start point, whatever is set during the command (p39, p181–p183), in whose colour
the chain so far and the rubber band are drawn (desktop d01), in arc mode with an amber dashed
chord from the arc's start to the endpoint asked (d03, d06); Halfwidth and Width (es `Mitad grosor`, declared `Mitad`, and `Grosor`), in line and
arc mode alike: `Specify starting width <0.0000>:` and `Specify ending width <…>:`
(`Specify starting half-width`, `Specify ending half-width`; es `Precise grosor inicial`,
`Precise grosor final`, `Precise mitad de grosor inicial`, `Precise mitad de grosor final`), a value
or a point measured from the last vertex, an amber dashed line drawn to the cursor from it (p200, d06)
(`Requires numeric distance or second point.`; a negative one `Value must be positive.`, p201), the
starting width offering the one the next segment would end at,
the ending one the starting just given; the ending width runs on through the segments after it,
Close and arc CLose included, and is PLINEWID when the command ends — drawn or not, with the
polyline's undo step — and `Current line-width is` the next PLINE's start; Undo takes the width back
to PLINEWID's as the command started where every segment left has it, else to 0, whatever it was set
to, as AutoCAD 2027's console does (p208–p218). The object: Close after one segment, or arc CLose
after one arc, closes on two vertices — there and back (Length 20, p04), a whole circle (p227) —,
measured, drawn, picked and saved with its closing segment; a wide one's bands mitred where their
edges meet within 4 half-widths of the vertex (a corner of 29°, not of 28°), square and overlapping
beyond (p230, p233, p235), a line meeting an arc at an angle cut along the arc's radius there (p236),
an arc's band no wider inwards than its radius (p234), a closed one's start mitred and one drawn
back to its start square there (p236); its linetype laid segment by segment (PLINEGEN 0, p232);
its grips and palette rows: `drafting-aids.md` Grips, `properties.md` Properties palette

**Missing:** PEDIT, which a double-click on a polyline at `Command:` opens
(`Enter an option [Close/Join/Width/Edit vertex/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:`, d10;
nothing here); a wide band's jig in a dimmer shade (d02; as drawn here); **unverified**: the dashed
line at Second pt's `Specify second point on arc:`, CEnter's endpoint and Angle's centre (none
here); Spanish declares
`Mitadgrosor` at the first segment's prompt (21322; `Mitad` everywhere
here, **unverified** whether `MITADG` answers there), and `Segundopto` at the first arc prompt
(21326), where the console takes `SEGUNDOPTO` (p101), refused here (`Segundo` everywhere);
**unverified**: whether table 21314's angle is the line's heading in the plane (taken here) or 0,
and where else it is said; Ctrl held at each sub-prompt (the desktop reads it only at the pick); **unverified**: Continue with nothing to
continue in a tilted UCS (from the WCS's origin here), and a Z or `*` typed in the dynamic-input box
after the start (taken here); PLINEGEN 1 and a linetype's dashes along a wide
band (drawn solid); AutoCAD breaks the arc prompt after its `or`, written here on one line;
**unverified**: where two wide arcs meet at an angle (a wedge closes the outer corner here), how an
arc segment lays a linetype (from its start here), and a wide band's outline with FILL off, whose
lineweight the plot draws (p231) and the screen here does not

### `RECTANG` / `REC` / `RECTANGLE` · es `RECTANG` / `REC` / `RECTANGLE`

**Implemented:** `Specify first corner point or [Chamfer/Elevation/Fillet/Thickness/Width]:` (es
`Precise primer punto de esquina o [Chaflán/Elevación/eMpalme/Alt-objeto/Grosor]`) and
`Specify other corner point or [Area/Dimensions/Rotation]:` (es
`Precise esquina opuesta o [áRea/Cotas/rOtación]`), neither taking Enter or a word
(`Point or option keyword required.`; probes rectang/p02, p04); `RECTANGLE` is an alias in both
(p101); a two-corner closed polyline, one of no area too, its four vertices on a line or at one
point (p11, p164, `@` p123, Dimensions of 0 p115, a pick Ortho flattens, desktop d01), with Chamfer
or Fillet eight, doubled and plain (p12). The first prompt's options ask a value offering the one
they keep for the session (program-wide in AutoCAD: NEW and OPEN leave them, p306, p308): Chamfer `Specify first chamfer distance for rectangles` and
`Specify second chamfer distance for rectangles` (its `<default>` the last second distance, or with
none the first just given; p158, p02), Fillet `Specify fillet radius for rectangles` (its default
Chamfer's first distance, and it sets both; p172), both refusing a negative value with
`Value must be positive.` (es `El valor debe ser positivo.`; p107, p108), Elevation
`Specify the elevation for rectangles` and Thickness `Specify thickness for rectangles` (instead of
ELEVATION and THICKNESS), and Width `Specify line width for rectangles` (es
`Precise grosor de línea para rectángulos`, its keyword `Grosor` at that prompt only, `Anchura`
being Area's), a value or two points (`Requires numeric distance or two points.`; p111), never
PLINEWID (p307): every side and fillet that wide, a negative width listed as typed and drawn as none
(p02, p109). Chamfer and Fillet replace each other, and 0 (0 x 0) turns them off; each corner is cut
the first distance back along the side reaching it and the second along the side leaving it, the
polyline starting where the first corner's cut begins, eight vertices — doubled and plain when the
cuts do not fit on a side, as the console leaves them (p157, p158).
`Current rectangle modes:  Chamfer=10.00 x 5.00  Elevation=…  Fillet=…  Thickness=…  Width=…  Rotation=30`
lists the ones not 0 (es
`Modos de rectángulo actuales:  Chaflán=…  Elevación=…  Empalme=…  Alt-objeto=…  Grosor=…  Rotación=…`;
p161, p162, p174).
Area: `Enter area of rectangle in current units <100.00>:` (`Requires numeric value.`,
`Value must be positive and nonzero.`, es `El valor debe ser positivo y distinto de cero.`, where
CIRCLE's and LINE's say `diferente`; p112),
`Calculate rectangle dimensions based on [Length/Width] <Length>:` (p113),
`Enter rectangle length <10.00>:` or `Enter rectangle width`, the other side giving the area with
the chamfers or fillets when they fit (p153, p154), its sign the given side's, so a negative one
turns both (p159), laid along the turned +X and +Y and made at once. Dimensions:
`Specify length for rectangles` and `Specify width for rectangles` (the sides Area keeps too, its
computed one included), then the other corner picks the quadrant — read along the UCS, not along the
turned sides, as the console reads it (p155, p156; WHY in the tool); Rotation chosen after them
drops them, the corner a corner again (p177). Rotation:
`Specify rotation angle or [Pick points] <0>:`, an angle, a point measured from the first corner, or
Pick points' `Specify first point:` and `Specify second point:` (`Invalid point.`; Enter takes the
cursor, p118–p120), kept for the session (p116, p117). `_TAN` or `_PER` at the first corner is
measured from LASTPOINT (p05, p06); Ortho bends the other corner about the first (desktop d01, the
trace's UseBasePoint false notwithstanding; RECTANG-D60), and `<angle` then a distance there runs
along that angle from the first corner (d03; the console, with no cursor, ignores the override, p08,
p128). The layer and the current properties are those current at the first corner: set at the
other corner they do not reach it (p169, p146; at the first, p171, p147). The words are Autodesk's
2027 Spanish string table's. An Elevation other than 0 is the polyline's own elevation, as typed,
whatever the corners' Z and the UCS's origin (UCS origin 0,0,5 and Elevation 2: Elevation 2, Z −3
in the UCS; p145, p178), where ELEVATION, the variable, lies above the UCS's origin (UCS origin
0,0,5 and ELEVATION 4: Elevation 9, p170); at 0 the first corner fixes the plane (p122, p142, p143,
p148). The jig as the desktop draws it: the rectangle in
the current colour, no line from the first corner, nothing at Pick points' second point (desktop
d01, d04). Dynamic input at the other corner shows the sides' length and width along the turned
sides, their signs the cursor's quadrant: `10` Tab `4` makes 10 × 4 there; a coordinate typed in it
is the corner, relative to the first, and LASTPOINT (d05; after the two sides the corner too,
**unverified**); the command line still answers the corner, a number there a direct distance
(p08). WHY labelled `Length` and `Width` side by side: AutoCAD lays
its two fields unlabelled along the sides (d05), here a box like LINE's; the Spanish labels
`Longitud` and `Anchura` are **unverified** (the desktop ran in English), and so is the box after
Dimensions (a point's here)

**Missing:** a length or width of 0 at Area, which here makes nothing (2027 makes a polyline whose
vertices but the first are NaN, p114); after a refusal at Rotation's prompt the console writes no
prompt again (the getangle's message is empty; p116, p135), asked again in full here
(**unverified** on the desktop; RECTANG-D63)

### `POLYGON` / `POL` · es `POLIGONO` / `PG`

**Implemented:** `Enter number of sides <4>:` (es `Indique número de lados <4>:`), a count outside
3–1024 or not written as an integer (`3.5`, `3.0`, `1e1`; `+5` taken) refused with
`Requires an integer between 3 and 1024.` (es `Requiere un nº entero entre 3 y 1024.`, the table's
`Requires an integer between %d and %d` with the period AutoCAD's input functions end it with) and
asked again (probes polygon/p08, p118, p153); `Specify center of polygon or [Edge]:` (es
`Precise centro de polígono o [Lado]:`),
`Enter an option [Inscribed in circle/Circumscribed about circle] <I>:` (es
`Indique una opción [Inscrito en el círculo/Circunscrito alrededor del círculo] <I>:`), then
`Specify radius of circle:` (es `Precise radio de círculo:`); the count (POLYSIDES) and the option
are the next run's `<default>` (p01, p111), per drawing and not saved: NEW and OPEN bring `<4>` and
`<I>` back (rectang/p309); U leaves them, where AutoCAD's puts POLYSIDES back (rectang/p317,
RECTANG-D48); POLYSIDES typed as a variable (SETVAR, 3 to 1024) is a step U takes back
(workspace/p213, p218); Inscribed puts the vertices on the
radius, Circumscribed the edges' midpoints; a point at the radius, picked or typed (`@5,0` from the
centre), sizes and turns it, a vertex there (Inscribed) or an edge's midpoint (Circumscribed),
LASTPOINT left at the centre (p06, p102, p123); a typed radius draws the bottom edge level in the UCS
("Specifying the radius draws the bottom edge of the polygon at the current snap rotation angle"),
its first vertex on the UCS's Y axis, or half a side past it for an even count, then
counterclockwise (p100, p101, p104); a radius of 0 or less, `@` included, refused with
`Value must be positive and nonzero.` (es `El valor debe ser positivo y diferente de cero.`; p08,
p124). Edge's `Specify first endpoint of edge:` and `Specify second endpoint of edge:` (es
`Precise primer punto final de lado:`, `Precise segundo punto final de lado:`) build it
counterclockwise from that edge (p03, p103), the second a 2D point (a Z or `*` is
`Invalid 2D point.`, p132, p133); a zero-length edge makes the polygon of every vertex on one point
and ends (p125; RECTANG-D64). Enter is refused at each point prompt and asked again:
`Point or option keyword required.` at the centre (es `Se requiere un punto o una opción.`),
`Invalid point.` and `Invalid 2D point.` at Edge's endpoints (es `Punto no válido.`,
`Punto 2D no válido.`), `Requires numeric distance or second point.` at the radius (es
`Requiere una distancia numérica o un segundo punto.`; p02, p03). `_TAN` at the centre or Edge's
first endpoint is measured from LASTPOINT (p04, p05); Ortho bends the radius about the centre and
Edge's end about the first endpoint (desktop rectang/d02; RECTANG-D60), and `<angle` then a distance
at Edge's end runs along that angle (RECTANG's d03 path; the console ignores the override, p09). A
closed polyline in the plane of its centre or first endpoint, their Z kept (p131, p132), in a
tilted UCS too (p135), with the current layer and properties, ELEVATION and THICKNESS, never
PLINEWID (p136, p137). The jig as the desktop draws it: the polygon in the current colour, at the
radius an amber dashed line from the centre to the cursor, at Edge's end the ghost alone (d02).
Wording and geometry from AutoCAD 2027's console in both languages (p01–p153); `PG` runs it in
Spanish (p108)

**Missing:** SNAPANG (no rotated snap here: a typed radius levels the bottom edge with the UCS,
where AutoCAD turns it by SNAPANG, p105); `<angle` then a distance at
Edge's end is unprobed on the desktop (RECTANG-D65)

### `CIRCLE` / `C` · es `CIRCULO` / `C`

**Implemented:** `Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:`,
`Specify radius of circle or [Diameter] <10.0000>:` and `Specify diameter of circle <20.0000>:` with
CIRCLERAD (none while it is 0), 2P's `Specify first/second end point of circle's diameter:`, 3P's
`Specify first/second/third point on circle:`, Ttr's
`Specify point on object for first/second tangent of circle:`, `Specify radius of circle:` and
`Specify second point:` (es
`Precise punto central para círculo o [3P/2P/Ttr (Tangente tangente radio)]`,
`Precise radio de círculo o [Diámetro]`…, Ttr's radius `Precise radio del círculo`, table 20419,
probe circle/p187, where POLYGON's is `Precise radio de círculo`, p188); Center-Radius,
Center-Diameter, 2P, 3P (`3P` and `2P` typed whole: digits count as a keyword's capitals); the rail's
Center, Diameter, 2-Point and 3-Point run the ribbon's macros, `^C^C_circle`, `_circle \_d`,
`_circle _2p`, `_circle _3p`: echoed `_circle`, the centre prompt answered `_2p` or `_3p` (Diameter:
the radius prompt answered `_d` once the centre is given), the prompt that answer opens written on
its line (`…: _2p Specify first end point of circle's diameter: 0,0`, desktop circle/d01, d02;
p105–p107); Enter afterwards repeats CIRCLE and U names it CIRCLE (es CIRCULO; p159, p191, p192),
the button's own run `CIRCLE GROUP` (by analogy with LINE's, desktop workspace/d02);
CIRCLED, CIRCLE2P and CIRCLE3P, this app's names for those buttons (AutoCAD knows none, p21), run
the same macros typed; Ttr — two lines, circles or arcs (an arc as its whole circle, a line as its
whole line; p311, p312, p380), picked or typed after `_TAN` (`_TAN to 0,10`, p300), the radius
typed, as two points or Enter's CIRCLERAD, and of the circles that fit the one whose tangent points
lie nearest the picks by the sum of the squared distances (p378, p379; CIRCLE-D30; none:
`Circle does not exist.` and the command ends, p317), at the objects' height when they share one,
else at the current elevation (p321, p327–p329); at its objects a typed point or number, a `_PER`,
a click on nothing or on an ellipse and a Tangent on an ellipse or a spline are refused with
`*Requires a TAN object-snap and selection of Circle, Arc, or Line.` (es
`*Necesita una referencia a un objeto tangente y que se designe un círculo, arco o línea.`, table
20418; p300, p314, p315, p373, desktop d13), a word, Enter or a `_TAN` finding nothing with the
words without the star (table 26317, es `Requiere una REFENT TAN…`; p307–p309); Tan, Tan, Tan
(3P with `_TAN` three times) and any Tangent or Perpendicular among 2P's and 3P's points, deferred
and solved at the last point (p01–p04, p08–p10, p330–p337, p370, p371, desktop d04): a Tangent
touches a circle, an arc's whole circle or a line's whole line; at 3P a Perpendicular to a line
puts the centre on it (p337c–e, p10) and one on a circle is refused
(`No Perpendicular found for specified point.`, p337f); at 2P one on a circle is a Tangent (p335e)
and one on a line the foot from LASTPOINT, which a deferred pick leaves where it was (p335); 2P's
ends lie on the line through the two centres (a point's own, a circle's; on a line, the foot from
the other end's centre), each the crossing nearer its pick, the one met first turning
counter-clockwise from a pick as near both (p02, p334, p374); 3P's circle, of the up to eight that
fit, is the one whose touch points lie nearest the picks by the sum of the squared distances (a
point being its own touch, a centre on a line its centre); none: `Circle does not exist.` and the
command ends (d04); before the last point the ghost is the circle through the cursor; it lies in
the first point's plane, with no point at the objects' common height else the elevation
(**unverified**: AutoCAD's at mixed heights is unprobed); a `_TAN` at the radius makes the circle
tangent to the object, from the radial point nearer the pick on a circle or an arc's circle, the
centre inside it too, and to a line from its distance (p06, p338–p340), while the radius's
Perpendicular and the diameter's Tangent and Perpendicular are the ordinary snaps (p07, p341,
p342); the centre's Tangent and Perpendicular are measured from LASTPOINT, the answer nearer the
pick, and Ortho does not bend it (p343–p347); a radius or diameter of 0 or less is refused
(`Value must be positive and nonzero.`, and the prompt asks again, p113, p118), and so is Enter
at every prompt with no default, in that prompt's words, the prompt asked again and nothing given
lost: `Point or option keyword required.` at the centre,
`Requires numeric radius, point on circumference, or "D".` and
`Requires numeric distance or second point.` at the radius and the diameter with CIRCLERAD 0,
`Invalid point.` at 2P's and 3P's first point, `Invalid 2D point.` at their later ones,
`Requires a TAN object-snap and selection of Circle, Arc, or Line.` at Ttr's objects and
`Requires numeric distance or two points.` at its radius (es `Se requiere un punto o una opción.`…;
p109, p114, p119, p126–p130, p306, p309, p310, p376, p377); Enter at the radius or diameter takes
the last circle's (CIRCLERAD, whichever mode made it, p162; per drawing and not saved, NEW and OPEN
putting it back to 0, rectang/p301; U leaves it, where AutoCAD's puts it back, rectang/p317,
RECTANG-D48; typed as a variable, SETVAR, not negative, it is a step U takes back, workspace/p211,
p218); a radius or diameter
given by a point is its distance from the centre in space (`3,4,12` from the origin r13, p17, p148,
p184); in the plane of the centre or of the first 2P or 3P point, with THICKNESS: 2P's and 3P's
later points are 2D prompts, taken by their X and Y in that plane (a snapped point at another
height flattened, p185, p189, p190) and refusing a Z, `*` or `<angle` typed there with
`Invalid 2D point.` (es `Punto 2D no válido.`; p16, p18, p20, p137, p180, p181); they have no base
point, so Ortho and Polar bend only the radius's pick (desktop d12); 2P on one point or 3P on one
line says `*Invalid*` (es `*No válido*`) and ends, LASTPOINT the last point given (p123–p125, p164);
the jig as the desktop draws it: the ghost in the current colour (CECOLOR red, a red ghost, at every
mode), from the centre to the cursor an amber dashed size line, out past the rim at the diameter
(desktop d01, d05; the trace's UseDashedLine); at 2P the ghost alone, no chord, and at 3P nothing
after the first point, then the ghost through the two points and the cursor (d02); nothing at
Ttr's radius until it is given (d03); Ttr's objects picked as under TAN: the running snaps silent,
the object not highlighted, and over a line, a circle or an arc the green Deferred Tangent marker,
the tangent glyph trailing three dots, on the object with the crosshair left on the pointer, with
the tooltip `Deferred Tangent` (es `Tangente diferida`, table 85; d03), over an ellipse or a spline
the plain Tangent marker and `Tangent`, the click then refused (d13); the same deferred marker, or
`Deferred Perpendicular` (es `Perpendicular diferida`, table 86), where 2P and 3P will defer a
Tangent or Perpendicular typed

**Missing:** Ttr on polyline segments (AutoCAD takes them, p313; refused here with the starred
words, and no marker shows over them), Quick Properties on a double-click of a circle at `Command:`
(desktop d11; Quick Properties is workspace.md's Missing, Palette panel), where on an ellipse the
plain Tangent marker sits at Ttr (**unverified**: d13 shows it at the ellipse's top with the cursor
at its end; here the point nearest the cursor), the marker at 2P's Perpendicular on a line (the foot
from LASTPOINT; **unverified**, none here), the rail's Tan, Tan, Tan entry
(`_circle _3p _tan \_tan \_tan \`; typed it works)

### `ARC` / `A` · es `ARCO` / `A`

**Implemented:** `Specify start point of arc or [Center]:` — Center asks
`Specify center point of arc:` then `Specify start point of arc:` — then
`Specify second point of arc or [Center]:` — Center asks the centre next — and
`Specify end point of arc:`; a centre mode's end,
`Specify end point of arc (hold Ctrl to switch direction):`, runs clockwise while Ctrl is held (es
`Precise punto inicial del arco o [Centro]`, `Precise segundo punto de arco o`,
`Precise punto central del arco`, `Precise punto inicial del arco`, `Precise punto final del arco`,
and at a centre mode's end
`Precise punto final de arco (mantenga pulsada la tecla Ctrl para cambiar de dirección)`, table
8423, `del arco` being Continue's, 405; probes arc/p01–p03, p109, p118); 3-point, Start-Center-End,
Center-Start-End, stored counter-clockwise (p01–p03, p171); the rail's 3-Point, Start, Center, End
and Center, Start, End run the ribbon's macros, `^C^C_arc`, `_arc \_c \`, `_arc _c`: echoed
`_arc`, the second point or the start answered `_c`, the prompt it opens written on its line
(desktop d03, d04); Enter afterwards repeats ARC by three points and U names it ARC (es ARCO; p101,
p107, p149), the button's own run `ARC GROUP` (by analogy with LINE's, desktop workspace/d02); ARCSCE and ARCCSE, this app's names for those buttons (AutoCAD knows neither, p105),
run the same macros typed (ARC-D3); Enter at the start with nothing drawn to continue says
`No line or arc to continue.` and `*Invalid*` and ends (es
`No hay línea o arco que se pueda continuar.`, `*No válido*`, table 20149; p108); Enter at every
later prompt is refused in its words and asked again, nothing given lost:
`2D point or option keyword required.` at 3P's second and a centre mode's end, `Invalid point.` at
CSE's centre, `Invalid 2D point.` at 3P's end, SCE's centre and CSE's start (es
`Se requiere un punto 2D o una opción.`, `Punto no válido.`, `Punto 2D no válido.`; p113–p118); a
word is refused in the same words (p04, p05), at a centre mode's end too, which declares Angle and
chord Length though they are not offered (p164; ARC-D2); every point after the first is 2D, a Z or
`*` typed there refused (p07, p124, p125; at a centre mode's end **unverified**, refused here as a
word); `@` and the box read from the point before, at a centre mode's end from the centre (p126–p129,
p131), and the point given is LASTPOINT, the end point once ARC is done (p141–p143); a Tangent or
Perpendicular at the first point or CSE's centre is measured from LASTPOINT (p14–p16), at the later
points from the point before (p09, p10, p172–p176), at a centre mode's end from the centre (p12,
p13); only a centre mode's end has a base point: Ortho bends it about the centre and leaves 3P's
points, SCE's centre and CSE's start as picked (desktop d06), and `<angle` there is the prompt's
wrong answer (p07, p136, p137, p139), taken at the end (`Angle Override: 90`, a point typed after
it the point typed; p140); in the first point's plane, the later points by their X and Y, 3P too
(ends snapped at Z 5, 0 and 0 make a flat arc at Z 5, p06; a typed `0,0,7` with ELEVATION 5 at Z 7,
p152; `'ELEV` mid-ARC leaves it at the first point's, p192), with THICKNESS and the current
properties, taken at its end (p150, p151, p192); an arc that cannot be made says `*Invalid*` (es
`*No válido*`) and ends, nothing made, LASTPOINT the last point given: 3P's points coincident or
collinear, the end on the start (p11, p17, p132, p168–p170), a centre mode's end at the centre or on
the start's ray (p131, p162, p166, p190, p191), the ray asked before the radius (`@` at CSE's start,
the end on its ray, p130); a centre on the start with another end says `Radius must be non-zero.`
first (es `El radio no debe ser cero.`, table 20158; p188, p189); the jig as the desktop draws it:
the ghost in the current colour at every mode (CECOLOR red, a red ghost; desktop d01–d04), an amber
dashed line from the start to the cursor at 3P's second point and SCE's centre, from the centre at
CSE's start and at a centre mode's end, and at 3P's end the ghost alone (d02–d04)

**Missing:** End at the second point, Angle and chord Length at a centre mode's end, and the
Direction and Radius they lead to (the ribbon's SCA, SCL, SEA, SED, SER, CSA and CSL; those
prompts go without the `or` that introduces them; ARC-D1); Continue: Enter at the start with a line, a
polyline or an arc drawn ends ARC (AutoCAD asks the end of an arc tangent from it, p109; ARC-D4);
the included-angle box dynamic input shows at a centre mode's end, and its Down list's Angle and
chord Length (desktop d05); Polar at ARC's prompts (**unverified**: assumed to follow Ortho's base)

### `ELLIPSE` / `EL` · es `ELIPSE` / `EL`†

**Implemented:** `Specify axis endpoint of ellipse or [Arc/Center]:` (es
`Precise punto final de eje de elipse o [Arco/Centro]:`), `Specify other endpoint of axis:`,
`Specify distance to other axis or [Rotation]:` (es `Precise distancia de otro eje o [Rotación]:`),
Rotation's `Specify rotation around major axis:`; Center's `Specify center of ellipse:` then
`Specify endpoint of axis:`; Arc's `Specify axis endpoint of elliptical arc or [Center]:` (and
`Specify center of elliptical arc:` — Center keeps the Arc chosen before it; es `E` answers the
hidden `cEntro` there, p111), `Specify start angle or [Parameter]:`,
`Specify end angle or [Parameter/Included angle]:` and `Specify included angle for arc <180>:`
(Enter draws half); Parameter asks `Specify start parameter or [Angle]:` and
`Specify end parameter or [Angle/Included angle]:` (es `Precise ángulo inicial o [Parámetro]`,
`Precise parámetro inicial o [ángUlo]`, `Precise parámetro final o [ángUlo/ángulo Incluido]`), the
choice holding from the start to the end prompt until Angle, the measure in use offered unlisted and
asking the same prompt again (p114, p115, p234); a parameter is u in
`p(u) = c + a·cos(u) + b·sin(u)`, a point given there is taken by its angle from the major axis as
u (`0,25` on 0,0 → 100,0, 25 starts at 5.28,11.18; 2023's console, the angle's alone probed in
2027, p179), and Included angle sweeps in the end prompt's measure (90 from an angle of 30: to
angle 120, or after Parameter to u 139.1; p116, p118); the first axis's semi-axis runs to the first endpoint (from a centre, to the endpoint given), where
angle and parameter 0 lie, and a longer other axis is it turned a quarter left (p01, p184, p232,
p233). Every prompt but Included angle refuses Enter (and the right button's) in its input
function's words and asks again, nothing given lost: `Point or option keyword required.` at the
first prompts, `Invalid point.` at a centre and the centre mode's endpoint of axis,
`Invalid 2D point.` at the other endpoint, `Requires numeric distance, second point, or option
keyword.` at the distance, `Requires valid numeric angle or second point.` at Rotation,
`Requires valid numeric angle, second point, or option keyword.` at the start and end angles and
parameters (p125–p133, es too; desktop d06); `FOO` the same words (p138–p147). A distance of 0 or
less, or `@`, says `Value must be positive and nonzero.` and asks again (p136, p137, p173, p202,
p203); a point there is its distance from the centre (p171, p204). A point at Rotation, or at
Included angle, is its heading from the centre in the UCS, from its X axis — not from the axis drawn
—, picked, typed or snapped, in the preview too (Rotation `60,30` on 0,0 → 100,0: ratio 0.316228,
p178, p219, p294, p298; Included `50,100`: the sweep 90°, p182, p237, p297, p299). A rotation in the
refused band (89.4°–90.6°, every 180°: p149–p151, p208–p218) says `*Invalid*` and ends the command;
a zero-length first axis is taken, the distance asked, then `*Invalid*` and the end (p205, p206,
p166). The centre mode's endpoint of axis takes a Z, dropped onto the centre's plane (p184, p245);
the axis mode's other endpoint is a 2D point (p170). `_TAN` or `_PER` at the first point or the
centre measures from LASTPOINT (p266, p267, p295); `<45` at the start or end angle is that angle
(p181, p292). LASTPOINT is the centre after the ellipse and after `*Invalid*` (p100, p109, p113,
p166, p171, p178, p184). The current layer and properties are those of when the ellipse is fixed,
so an elliptical arc keeps them whatever is set at its angles (p249, p253, p257). The jig as the
desktop draws it: at the axis's other end (and the centre mode's endpoint of axis) an amber dashed
line from the first point (the centre) to the cursor, no ghost; at the distance, Rotation and the
start and end angles the ghost in the current colour (CECOLOR red, a red ghost; the whole ellipse at
the start angle, the arc at the end) and the dashed line from the centre to the cursor (desktop d01,
d02). Dynamic input at the axis's other end dimensions it from the first point with LINE's Length
and Angle, the angle shown acute: `50` Tab `30` puts the end 50 away at 30° in the UCS, LASTPOINT
there (d04-2); the centre mode's endpoint of axis the same from the centre (**unverified**:
unprobed, the same input function); a coordinate typed in it is the point, relative to the first,
and the command line still answers the point, a number there a direct distance. WHY a box like
LINE's: AutoCAD lays the length field on a dimension along the axis and the angle beside the
cursor (d04-2). The rail's Axis, End, Center and Elliptical Arc run ELLIPSE as the ribbon's
macros do (acad.cuix `^C^C_ellipse`, `_ellipse _c`, `_ellipse _a`): echoed `_ellipse`, the mode
answered at its first prompt, Enter repeating ELLIPSE and U and REDO naming it (p105, p107, p198);
ELLIPSEC and ELLIPSEARC, which AutoCAD knows not (p05), stay typed names running the same macros.
Not transparent (p106). AutoCAD 2027's console. The object is DXF's (centre, major-axis vector,
ratio and parameters), its range stored as AutoCAD stores it, the start in [0, 2π) and the end
after it (p134, p148, p154, p179, p180), a whole turn either way a whole ellipse (p152, p153, p220,
p224, p226, p235, p236), and with both axes equal the first one major (p168). Its snaps: Center
(p306); Endpoint at an arc's ends, none on a whole ellipse (p305); Quadrant at its own axis ends
whatever the UCS, on an arc only those its sweep passes (p300–p302); Midpoint halfway along an
arc's length, none on a whole ellipse (p303, p304); Nearest (p307). Its grips (desktop d07): the
centre moves it; the four quadrants, kept off an arc's sweep, set that half-axis to the cursor's
distance from the centre, its direction and the other half kept, the longer staying major (d07-3,
d07-4); an arc's two ends swing to the cursor's heading from the centre, the ellipse kept (d07-7);
the ghost in the object's colour, an amber dashed line from the centre, no hover menu. Its
Properties (desktop d08): one Geometry group for an ellipse and an arc alike, Start X Y Z, Center
X Y Z, End X Y Z, Major radius, Minor radius, Radius ratio, Start angle, End angle (0 and 360 on a
whole one), Major axis vector X Y Z, Minor axis vector X Y Z and Area (an arc's the segment its
chord closes, AREA's, p328); the centre, the radii, the ratio and an arc's angles retyped, the rest
greyed; Spanish as d08 shows (`Relación del radio`, `Vector de radio mayor X`,
`Vector de eje menor X`). Its linetype: properties.md; ROTATE, SCALE, STRETCH, BREAK, FILLET: modify.md

**Missing:** Isocircle: AutoCAD offers it only under the isometric snap style (SNAPSTYL 1, not built
here), as `[Arc/Center/Isocircle]`, `Specify center of isocircle:`,
`Specify radius of isocircle or [Diameter]:` and `Specify diameter of isocircle:`; `PELLIPSE` = 1
(polyline approximation); an arc's end grips are drawn square, not AutoCAD's arrows (d07-5), and a
length or an angle typed while a grip is hot is not built; a whole ellipse's Start angle and End
angle retyped (**unverified**: unprobed, read-only here); the palette's English labels
(**unverified**: the desktop seen in Spanish only); the start a closed elliptical arc keeps
(p220: StartParam 0.857072, EndParam 7.140257), which has no field here (ELLIPSE-D21);
HATCH / boundary / DIM on an ellipse (OFFSET, FILLET, JOIN: modify.md); the Intersection, Tangent and
Perpendicular snaps on an ellipse (`_INT` with a line, a circle and another ellipse at
45.825757,10, 38.186654,16.138304 and 14,24; from 100,60 `_TAN` at −26.144218,21.310091 and
`_PER` at 45.503239,10.361651, an arc's only on its sweep, −48.836572,−5.361651; p308–p314); a
mirrored ellipse's normal (modify.md, MIRROR); a point with a Z at the distance, which AutoCAD measures in space
(`50,25,10` on 0,0 → 100,0: ratio 0.5385, p177; here in plan, 0.5); `<a` at Rotation and Included
angle (**unverified**: unprobed, so the angle override every prompt with a base point has); Spanish
from the 2027 Spanish language pack's string table, paired with the English by id

### `SPLINE` / `SPL` · es `SPLINE` / `SPL`

**Implemented:** `Current settings: Method=Fit   Knots=Chord` (es
`Parámetros actuales: Método=Ajustar Nudos=Cuerda`; CV `Method=CV   Degree=3`, es
`Método=VC   Grado=3`) at the start and after each Method, Knots or Degree;
`Specify first point or [Method/Knots]:` (CV `[Method/Degree]`; es
`Precise primer punto o [Método/Nudos]:`), `Enter spline creation method [Fit/CV] <Fit>:`,
`Enter knot parameterization [Chord/Square root/Uniform] <Chord>:` (es
`[Cuerda/raíz cuaDrada/Uniforme]`), `Enter degree of spline <3>:`, then
`Enter next point or [start Tangency]:`, `[end Tangency/Undo]` and `[end Tangency/Undo/Close]` (es
`Especifique punto siguiente o`, but `Precise el punto siguiente o` at the third point, as
Autodesk's table words it), CV's `Enter next point:`, `[Undo]` and `[Close/Undo]`,
`Specify start tangent:` and `Specify end tangent:`. Enter at the first prompt is refused,
`Point or option keyword required.` (es `Se requiere un punto o una opción.`), and the prompt asked
again, Fit and CV (p106; desktop d05); CV's `Enter next point:` refuses a word in the same words,
though it declares no keyword (p127, p138). Fit: a cubic through the points (n + 2 control
vertices, knots the unnormalised chord sums LIST reports), Knots Chord / Square root / Uniform; a
free end has no curvature (natural: the control points of 21 open fit splines of p01, p300–p302,
p306, p308 to six decimals); start Tangency after the first point, end Tangency ending the command,
each the curve's derivative there by the raw knot parameter, stored as AutoCAD stores it: the start
as typed from the first point (p302, p308), the end a unit vector (p306, p210, p123); SCALE keeps
the scaled curve (p321). Close from the third point, periodic, ending the command and dropping a
start tangent (AutoCAD 2027's console asks no tangent there, p124, p303, p307). CV: Degree 1–10,
lowered to vertices − 1 when fewer, and to the vertex count when closed (p305, p129, p146), knots 1
apart, Close from the third point (periodic, starting where AutoCAD's does, p305, p311); at
the Degree prompt `0`, `11` and `-1` are asked again silently, `2.5` or a word refused with
`Requires an integer between -32768 and 32767, or option keyword.` (es `Requiere un nº entero
entre -32768 y 32767, o una opción.`), and the unlisted Method, Degree and Object go back to the
first prompt, the degree unchanged (p111, p153–p155). Undo, down to one point, where the prompt
stays the second point's (`[end Tangency/Undo]`, es `Precise el punto siguiente o`; CV `[Undo]`):
start Tangency is gone, Undo there does nothing, silently, and end Tangency asks the same prompt
again (p125, p128, p146, p152, p156; desktop d12, over the console's p148, which asks the tangent).
A typed length at a next point is direct distance along the cursor, a negative one backwards, as
LINE's (p117). Dynamic input at the next points and at both tangents is LINE's Length and Angle
from the last point (the first at the start tangent; desktop d04-2, d04-4, d04-5, d04-6): the
tangent is the offset of the point they give, a point typed in it relative to that base. Method,
Knots and Degree kept for the session (SPLMETHOD / SPLKNOTS / SPLDEGREE, Not-saved; p104; typed
as variables too, SETVAR, Degree 1 to 10, each a step U takes back, workspace/p214, p218); Escape
discards the curve; one undo step. The jig as the desktop draws it: at every next point and tangent
prompt an amber dashed line from the last point (the first at the start tangent) to the cursor,
alone while one point is held; from two points the ghost in the current colour (CECOLOR red, a red
ghost) through the points and the cursor, following the end tangent at its prompt, and CV's control
frame finely dashed in grey (desktop d01, d02, d07). The current layer and properties are those of
when the spline first holds two points: set at the first point, the second or the start tangent
they are worn, at the third or the end tangent not, and Undo back to one point keeps them
(p227–p233, p260, p261, p268, p277). LASTPOINT is the last fit point or vertex after the command,
also after an end tangent (p210, p219, p220, p221, p276). `_TAN` or
`_PER` at the first point measures from LASTPOINT (p242, p243, p274); at the end tangent a `_TAN`
on a circle or an arc is deferred: the end leaves along the circle's tangent where it is nearest
the spline's end, pointing the pick's way, an end inside the circle taken too (p250, p262, p263,
p270, p272, p273); the start tangent's is the ordinary one (p249, p267). `<a` at a next point holds
it to that angle (desktop d03). The rail's Spline Fit and Spline CV run SPLINE as the ribbon's
macros do (acad.cuix, Home > Draw: `^C^C_^RSPLINE _M _FIT`, `^C^C_^RSPLINE _M _CV`): echoed
`_spline`, the method answered, Enter repeating SPLINE in it and U naming SPLINE (p104, p142); they
have no typed name, as AutoCAD's have none. Not transparent (p105). The object: Endpoint; Midpoint halfway along from its start, a closed one's too (p310–p312);
Nearest and Intersection on the curve, a crossing found on a tessellation's chords and refined onto
it (p310, p313; none with itself, p331). Length, AREA and Midpoint measure the true curve by
quadrature, where AutoCAD's integrator runs slightly long (p332: a straight 30-long CV spline
measures `30.00062816`; p327's open CV `44.39570038` against the true 44.39441982), so their
decimals past the fourth or so differ from AutoCAD's (which integrator it uses is
**unverified**). AREA closes it with its chord and adds the loops the curve makes with the chord or
itself (p327 `85.84165405`, two loops of an open CV; p317 `39.7222`, a closed bowtie). A linetype is
laid as a line's, centred over the length, open or closed — one dash across a closed one's start —,
solid under one period (p328, measured on the plot). Grips: squares at a fit spline's fit points
(desktop d08-1), round at a CV spline's vertices (d09-1, d09-3), with its frame dashed (grey, where
d09 shows it a muted red: one frame drawing and selected, SPLINE-D61). The Properties palette has
AutoCAD's groups and rows (d10-1–d10-3): Data Points — Number of fit points (a closed fit spline
counts its first again at the end), Current Fit point, Fit point X, Y, Z, Knot parameterization, CV
frame; Misc — Method, Degree, Closed, Periodic, Planar, an open fit spline's Start and End tangent
vector X, Y, Z as stored, Fit tolerance, a closed one's Area; a CV spline's Number of control
points, Current Control point, Control point X, Y, Z and Weight instead, no tangents and no
tolerance. The current point steps through them and its X, Y and Z move it, one undo step each, as
a 3D polyline's current vertex; the rest is read-only; Fit tolerance reads 0, as d10 shows it. The English labels are `ax26res.dll`'s by id, the Spanish d10's; the CV frame row's English is
**unverified** (the Spanish row is cut at `Marco de vértices d…`: id 912 `CV frame` taken over 1248
`Display CV frame`). STRETCH moves the points in the window (p322, p323); MIRROR keeps its +Z
(p320); EXPLODE refuses it by name (`Cannot explode SPLINE`, modify.md). The drawing file holds the
end tangent as the derivative from version 29; an older file's, a direction at the length picked,
is read as unit. Wording from AutoCAD 2027's console (p01, p02, p100–p157, p300–p332, en and es) and
the 2027 Spanish language pack's. In space, as AutoCAD 2027's console keeps it (probes
spline/p200–p269, spline3d/s01–s16): each point keeps its Z (`0,0,5` `10,10,5` `20,0,8` `30,10,-3`
stay so, p200, p216, p269), one without a Z at ELEVATION as it then is (p223, p231, p234, p265), a
start or end tangent in space too (s10, s12, the end's unit); the knots are the chords in space and
the curve the cubic through them (p200's control points to six decimals). One whose points and
tangents lie in a plane is kept in it, as DXF 210 and flag 8 keep it — that plane's normal, facing
up (p223, s09, s11) —, and one on a line in the upright plane holding it, its normal Z × the line
(s07, s08); the rest lie in no plane: Planar `No` in the palette, no Area row, and AREA's
`Selected object does not have an area`, asked again (s01, s14), where one in a tilted plane is
measured in it (s02 `Area = 152.5819, Length = 32.5549`, s15). Its Endpoint, Midpoint (halfway
along in space: `16.4445,3.6988,7.5404`) and Nearest are at the curve's Z (s03), drawn and picked
through its points' Z in any view; STRETCH moves the caught points, Z and all (s06); a grip goes to
the point given, Z and all, a 3D polyline's vertex's way, and the palette's Fit point and Control
point Z are typed as X and Y are (desktop d10-1 shows them editable); UCS OBject on an open one in
no plane puts X towards its far end in space and Y level across it (s04), ZAxis Object its Z along
the end's tangent in space (s16). Saved with each point's Z from drawing file version 37.
On knots of its own, as AutoCAD 2027 leaves the pieces of TRIM, BREAK and SPLINEDIT (probes
spline-knots/k01–k16, desktop d01–d04): its knots (DXF 40) as AutoCAD holds them, never
normalised — an open one's clamped vector, a closed periodic one's one period (p311's `0 20 40 60
80`) — and a CV spline's weights (DXF 41), which pull the curve to their vertex; drawn, picked,
snapped and measured as any spline, the knots and weights kept by MOVE, ROTATE, SCALE, MIRROR,
STRETCH, a grip and the palette (a fit spline's custom knots unscaled, its tangents growing, k13;
a fit point moved, k14). A fit spline left without its fit data is a CV spline on its control
points and knots, TRIM's piece (k01, k03; d01: Method Control Vertices, Weight −1); one on knots
of its own is BREAK's, its fit points at their distinct values, a triple knot one parameter (k05,
k07; d02: Knot parameterization Custom, its cut ends' tangents the curve's derivatives there). A
rational spline's area is AutoCAD's to the last decimal (k15 `126.18152044`, k16 `249.09265361`),
its length the quadrature's, where AutoCAD's integrator is off in the fourth significant figure
(k15 `47.50408029` against 47.49583887, k16 `57.53346423` against 57.53357861), so its Midpoint
too (k15 `17.06187596,7.34503156`). The palette's Weight is the current vertex's on a rational
spline, −1 on another (d01, d03); a closed CV spline counts its vertices (d04-1: 4), and the
piece TRIM leaves of one is neither Closed nor Periodic (d04-2). Saved from drawing file version
38. TRIM, EXTEND, BREAK and BREAKATPOINT leave it so, cut on its own parameter by knot insertion
(spline-knots/k01–k37: modify.md's TRIM and BREAK): a trimmed one a CV spline, a broken or extended
fit spline a fit spline; FILLET's piece or growth of one a fit spline too (corners/p326, p441,
p448: modify.md's FILLET). SPLINEDIT edits its fit data, vertices, knots and weights, to a
degree of 25 on knots of its own (k57–k146: modify.md's SPLINEDIT)

**Missing:** toLerance and Object (not offered: a tolerance above 0 is an approximation Autodesk
does not document, and there are no spline-fit polylines to convert; AutoCAD asks
`Specify fit tolerance <0.0000>:`, es `Precise tolerancia de ajuste <0.0000>:`, p115, p131, and
`Select spline-fit polyline:`, es `Designe polilínea de ajuste de spline:`, whose Enter says
`None found.` and ends, p114); the deferred Tangent at the end tangent on a line, an ellipse or a
spline (unprobed: the ordinary Tangent from the last point here); `<a` at the tangents and at
CV's next points (**unverified**: the console ignores it, p212, p256, p222, so the angle override
every prompt with a base point has); CVSHOW / CVHIDE, the triangular grip and the
multifunction grip menus (Stretch / Add / Remove fit point and Tangent direction on a fit point,
d08-2, d08-3; Stretch / Insert / Refine / Remove vertex on a CV, d09-4), the palette's Weight
(d03 shows it editable; SPLINEDIT's Edit vertex Weight edits it: modify.md) and the
palette's Method, Degree, Knot parameterization, Closed and CV frame; weights only a file or a
piece of a weighted one holds; AutoCAD's Area of a self-crossing closed spline (**unverified**);
HATCH / DIM on a spline or against one (OFFSET, FILLET, JOIN: modify.md); Geometric Center (a closed
spline's, p311: 10,10 and 40,10; none on an open one, p310, p312), Perpendicular and Tangent on a
spline (p313, p315, p316) (SPLINE-D51); PEDIT Spline, BLEND

### `3DPOLY` / `3P` · es `3DPOL` / `3P`

**Implemented:** a 3D polyline — straight segments through points each at its own Z, a model type
of its own (DXF POLYLINE, flag 8: its vertices are world points, with no plane, elevation or
thickness) — as AutoCAD 2027's console asks it (probes 3dpoly/p01–p07): `Specify start point of
polyline:`, then `Specify endpoint of line or [Undo]:`, and `[Close/Undo]:` from the second segment
on (es `Precise punto inicial de polilínea:`, `Precise punto final de línea o [desHacer]:`,
`[Cerrar/desHacer]:`; Close typed before is `Point or option keyword required.`, es `Se requiere un
punto o una opción.`, p06, as `FOO` is, p02). Enter at the start is refused, `Invalid point.` (es
`Punto no válido.`), and asked again — no Continue (p03); later Enter ends, and keeps even the
start alone as a polyline of one vertex, which U takes back with the rest as `3DPOLY` (p05). Undo
steps back one vertex, `All segments already undone.` (es `Ya se han deshecho todos los
segmentos.`, table 20288) with none (p06); Close joins the start and ends. A point with no Z lies
at ELEVATION, a typed Z is kept, a pick lies at the elevation it is on (p04); points are read in the
UCS and stored in the WCS (p07). Not transparent (p18). The polyline wears what is current at its
start, and is added at the end, Escape included (**unverified**: the console cannot press Escape;
AutoCAD appends it at the start point, p01's trace). The jig draws the chain and the next segment
in its colour; dynamic input asks Length and Angle as PLINE does. Its name and alias, and the
ribbon's place (Home ▸ Draw, expanded, beside Spline Fit and Spline CV: acad.cuix ID_PanelDraw),
from the 2027 `acad.pgp` and `acad.cuix`. LINE's Continue starts at its last vertex, Z and all
(p23). It draws and is picked as its segments in any view; its linetype is laid per segment, as a
line's (**unverified**: PLINEGEN is a 2D polyline's). What the other commands do with one is in
their entries: MOVE, COPY, ROTATE, SCALE, MIRROR and the arrays carry it whole, STRETCH, EXPLODE,
BREAK, OFFSET, FILLET, CHAMFER, TRIM / EXTEND (modify.md), AREA (inquiry.md), DIMLINEAR
(dimensions.md), UCS OBject (coordinate-systems.md), the snaps and grips (drafting-aids.md), the
Properties palette (properties.md). Saved from drawing file version 36.

**Missing:** PEDIT's Spline and Decurve (a spline-fit 3D polyline, the palette's Fit/Smooth
Quadratic and Cubic), LIST of one (p08: `POLYLINE`, `Open space`, `area` of the vertices' vector
area, `length` in space, then each `VERTEX`), trimming and extending one (modify.md), JOIN into
one (pieces/p353), one as a hatch boundary or ARRAYPATH's path, the 3D Visualization group's
Material row (desktop d02), and the grips' hover menus (Stretch / Add / Remove Vertex, unprobed)

### `TEXT` / `DTEXT` / `DT` / `-TEXT` · es `TEXTO` / `T` / `TEXTODIN` / `-TEXTO`

**Implemented:** single-line text, 13 justifications, text styles table, as AutoCAD 2027's console
asks it (text/p101, p103, p106): `Current text style:  "Standard"  Text height:  2.5000
Annotative:  No  Justify:  Left` (es `Estilo de texto actual:  … Altura de texto: … Anotativo: …
Justificar:`; the justification named by its label in English, `TL`…`BR`, and by acmtedRes
57673–57684's words in Spanish, `Izquierda`…`SI`…`ID`, p106; a fixed-height style's height,
p121), `Specify start point of text or [Justify/Style]:` — the point the justification names,
`Specify middle point of text`, `Specify top-left point of text`… (es
`Precise punto inicial de texto`, `Precise punto medio de texto`…), without the keywords after
Justify, whose `Enter an option [Left/Center/Right/Middle/TL/TC/TR/ML/MC/MR/BL/BC/BR]:` (es
`[Izquierda/Centro/Derecha/Medio/SIZ/…]`) is also answered unlisted at the first prompt (`MC` there
asks the middle point at once) and refuses Enter and a wrong word with `Invalid option keyword.`
(es `Opción no válida.`, p156) —, Style's `Enter style name or [?] <Standard>:` (spaces typed key by key, `AB CD` whole, desktop
workspace/d06; MTEXT's and -ATTDEF's style by analogy; Enter keeps it;
`Cannot find text style "NAME".`, es `No se puede encontrar estilo de texto "NAME".`, and asked
again; a name or Enter writes the Current line again as the console does, the old style's name
with the new one's height, p110, p126, p156, p162, but not after a refused name, p142; `?` lists
the styles as the console lists them, `Text styles:` … `Current text style: "Standard"`, then the
Current line and the start point, p109), `Specify height <2.50>:` (0 or below:
`Value must be positive and nonzero.`, es `El valor debe ser positivo y diferente de cero.`, p111,
p112), `Specify rotation angle of text <0>:` (a negative one stored normalised, −30 as 330, p115),
then `Enter text:` (es `Escriba el texto`) a line at a time, leading spaces typed at the command
line kept (p155). Enter starts the next line Arial's line below, (ascent + descent + line gap) /
H = 2355/1466 = 1.60641 of the height (p122, desktop d01-4; MTEXT's single spacing stays 5/3), an
empty line ends, a click elsewhere starts another run, and Escape keeps the lines entered and
drops the one being typed (desktop d01-2); another command taking over keeps it. Enter at the
start point continues below the newest line this drawing session wrote that is still in the
drawing, forgotten at NEW and OPEN, not below one U took back or ERASE removed (p125, p128); with
none, `Point or option keyword required.` (es `Se requiere un punto o una opción.`) and the prompt
again (p120). The height is TEXTSIZE, which MTEXT and ATTDEF share; it and the justification are
saved in the drawing (rectang/p311, p313), the rotation is per drawing, not saved, `<0>` again at
NEW and OPEN (rectang/p311), kept from the UCS X axis (p131, p164). TEXTSIZE and the rotation are
set with the first line written, so a run that writes none leaves them (p163, desktop d01); the
justification is set at its answer. U takes back TEXTSIZE, the justification, the rotation and the
style Style made current (TEXTSTYLE, which MTEXT and ATTDEF then list, rectang/p313) with the
lines (p127, p162). The layer, colour, linetype and lineweight are those current at the start
point (p130, p165); ELEVATION is its Z, THICKNESS none (p130). The height and rotation bands are
dashed (desktop d01-5, d01-6). -TEXT (es -TEXTO) asks the same and one line, then ends; an empty
line adds nothing; U, UNDO and REDO name it `-TEXT` (p101, p118, p127, p129). Laid out as AutoCAD
lays out Arial, scaled by its H's ink height (1466 units, p301): along the baseline by the
advances, from A's overhang when it has one (AutoCAD's Center of Agh −12.418, p302, p327); Top the height
below the point, ML/MC/MR half of it, BL/BC/BR Arial's descent above it (434/1466 of the height),
Middle the ink's vertical middle on it (p302, p327). Its box (pick, bounds, windows, TRIM's edges,
MIRROR) is the ink's, AutoCAD's `(textbox)` (p301), but Arimo's ink, not Arial's (WHY: the package
ships only numbers read from an OFL font; the widths, line and descent are Arial's all the same): at
10, H's box tops at 9.611, not 10, A does not overhang (Center of Agh −12.428), and Middle sits up
to 2 % of the height off AutoCAD's (`measureTextInk`). A justified text has two grips, the point and
its insertion point (DXF 10), either moving it (desktop d02-1); Insertion snaps to the point (p305);
STRETCH moves it when the point is caught (p304). The palette's Text rows are Contents, Justify,
Height, Rotation and, for a justified text, Text alignment X/Y/Z (the point, editable), with
Position X/Y/Z greyed at the insertion point (desktop d04-1); a Left text shows Position alone,
editable (whether AutoCAD shows Text alignment greyed for it is unverified; es
`Alineación de texto X`, unverified). MATCHPROP's Text property: `modify.md`

**Missing:** Align and Fit justifications (en labels `Align` / `Fit`, es `Alinear` / `Ajustar`
when built), `?`'s `Enter text style(s) to list <*>:` and its `Press ENTER to continue:` pages
(p109), in-place caret editing (the text is typed in the box: `Enter text:` is DTEXT's
command-line prompt), content edit from the palette, the palette's Annotative, Width factor,
Obliquing, Upside down and Backward rows (desktop d04-1; not modelled), picking by the strokes
(AutoCAD's click inside the box but off the glyphs selects nothing, desktop d06-3; here the box is
the hit area: Arial's outlines cannot ship and the bundled faces' differ)

### `MTEXT` / `T` / `MT` / `-MTEXT` / `-T` · es `TEXTOM` / `TXM` / `MTEXT` / `-TEXTOM` / `-TXM`

**Implemented:** two corners or Width; as AutoCAD 2027's console asks it (text/p202, p213):
`Current text style:  "Standard"  Text height:  2.5  Annotative:  No`, `Specify first corner:`
(Enter or a word: `Invalid point.`, es `Punto no válido.`, and asked again, p201, p202, desktop
d05-6), `Specify opposite corner or [Height/Justify/Line spacing/Rotation/Style/Width]:` (a word,
a Z or another prompt's keyword: `2D point or option keyword required.`, es
`Se requiere un punto 2D o una opción.`, p203, p205, p214, p251; the first corner again, as a
click with no drag gives, makes a width-0 object, p204) and its keywords' `Specify height <2.5>:` (a point is its distance from the first
corner, p212; 0 or below `Value must be positive and nonzero.`, es
`El valor debe ser positivo y diferente de cero.`, p209, p210),
`Enter justification [TL/TC/TR/ML/MC/MR/BL/BC/BR] <TL>:` (nine attachments; the box hangs off the
attachment point however it was dragged, p208, p213),
`Enter line spacing type [At least/Exactly] <At least>:` (a wrong word at either:
`Invalid option keyword.`, es `Opción no válida.`, p213, p215) and
`Enter line spacing factor or distance <1x>:` (a factor `nx`, a distance, or a point typed or
picked, its distance from the first corner, p220, p265; 0.25x–4x, else
`Please specify a line spacing value between 1.04 (0.25x) and 16.67 (4x), inclusive.`, p216–p219;
below zero `Value must be positive.`, es `El valor debe ser positivo.`, p221),
`Specify rotation angle <0>:` (`<90>` after a point straight above, 400 as `<40>`, −30 as `<330>`,
p222–p224) and `Enter style name or [?] <Standard>:` (`Invalid style name`, p226) looping back to
the corner, Width's `Specify width:` (0 taken, Enter is 0 and asks the text, a point its distance,
−5 `Value must be positive.`, p227–p230, p269, p273). The declared words `Linespacing` and
`Atleast` (es `Interlineado`, `Almenos`) answer too, `_LINESPACING` and `_ATLEAST` in any language
(p200, p263). Heights, `<default>` and the range are written at the drawing's precision with
trailing zeros dropped: `2.5`, `3`, `3.14` and `1.31 (0.25x) and 20.94 (4x)` at LUPREC 2,
`<2.123457>` at 6, where TEXT keeps them (p202, p264, p266, p272). The bands at Height, Rotation,
Width and the spacing run dashed from the first corner (UseDashedLine in p209, p222, p228, p265).
The height is TEXT's TEXTSIZE, saved in the drawing, Style makes the style current (TEXTSTYLE),
and U takes both back with the object, naming `-MTEXT` (p226c, p250); Justify, Rotation and Line
spacing start again at `<TL>`, `<0>`, `<At least>` and `<1x>` every run, Enter at the spacing type
asking the factor (rectang/p312, p313). The first corner keeps its Z, ELEVATION its height, `@` at
the first corner reads LASTPOINT and at the opposite one the first corner, which leaves LASTPOINT
on the opposite corner (p206, p207, p270, p279); in a UCS the box squares up to its axes (p257,
p258). es from Autodesk's MTEXT table (`Precise la primera esquina`, `Indique la esquina opuesta
o`, `Indique la altura`, `Indique la justificación`, `Indique el tipo de interlineado [Al
menos/Exactamente]`, `Indique el ángulo de rotación`, `Indique la anchura`, `Nombre de estilo no
válido`), each box labelled by its own prompt (acmtedRes 1070); laid out as AutoCAD lays out
Arial, by Arimo's ink (TEXT's WHY, p303, p327, p332): a word wraps when the line's ink would pass the width ("HHH HHH"
at 10, ink 62.169, one line at 63, two at 62; a longer word overflows), each line's ink set
against the frame's edge (a first glyph's positive bearing left out, a negative one sticking out)
or centred in it, the first baseline the height or the first line's ink top below the top, At
least's single spacing 5/3 of the height plus the next line's ink above the height (OOO 16.844 at
10), the frame ending at the last line's ink bottom, Exactly's half the gap between lines below the
last baseline (30 for two lines at 10; ink past the height under Exactly not probed); the frame is
the defined width, or the widest line's ink, by that height (ActualWidth, ActualHeight); MTJIGSTRING `abc` jig and flow arrow
(desktop d05-1, d05-2); the editor is the dynamic-input box made multi-line and drawn in place
(Enter breaks a paragraph, Ctrl+Enter or a click outside the frame keeps; Escape with something
typed asks AutoCAD's task dialog `Multiline Text - Unsaved Changes` / `Do you want to save your text
changes?`, Yes keeping, No discarding and making nothing, Cancel back to the editor, d05-5; with
nothing typed it closes at once, d06; TEXTEDIT on an MTEXT asks the same when the wording changed);
`-MTEXT` takes the lines at `MText:` (es `textoM:`), each kept as typed, codes and all (`\P` a
break, `%%d`, `\`, `{`, `}`), joined by `\P`, and no line at all adds an empty MTEXT (p255, p268);
contents kept as AutoCAD's string (`\P`, escapes; inline codes survive but are not drawn);
Insertion snap; a grip at the attachment point and a width grip on the side that moves, both
sides for TC, MC and BC, each widening it about the attachment (desktop d03-1); palette rows
Contents, Justify, Text height, Rotation, Line space factor/distance/style, Defined width
(desktop d04-2; es `Altura de texto`, unverified); TEXTEDIT and double-click; EXPLODE to one Left
TEXT per line where AutoCAD's stand (p303; pieces/p255, p256). Aliases from acad.pgp: `-T`; es `TXM`, `-TXM` and
`MTEXT` (es `T` is TEXTO and `MT` nothing, p259, p260). The es title of the Unsaved Changes dialog,
`Texto de líneas múltiples - Cambios sin guardar`, and its question,
`¿Desea guardar los cambios del texto?`, are unverified (the tables hold only 25268,
`TEXTOM – Cambios sin guardar`)

**Missing:** Columns, listed in 2027 (`[…/Width/Columns]`; its
`Enter column type [Dynamic/Static/No columns] <Dynamic>:`, es
`Indique el tipo de columna [Dinámico/Estático/Sin columnas] <Dinámico>:`, then
`Specify column width: <75>:`, `Specify gutter width: <12.5>:`, `Specify column height: <25>:`,
p231, p232; the keyword is not offered), the Unsaved Changes dialog's
`Always perform my current choice` (a profile setting), drawing inline formatting (height, font,
colour, stacking, underline…), the editor's ruler, tabs, indents and lists, background mask, text
frame, the Text Editor ribbon tab, MTEXTFIXED 2 (horizontal while typing; here always as drawn), a
caret on the canvas, Node snap on MTEXT (OSNAPNODELEGACY 0: AutoCAD's finds the frame's four
corners, the defined width by the actual height, p307, p329, p330), defined height and the
column-height grip, Annotative, the palette's Direction, Defined height, Columns, Background mask
and Text frame rows (desktop d04-2), picking by the strokes (TEXT's), `?`'s 2027
`Enter style name(s) to list <*>:` and its own listing (p225; here TEXT's: MTEXT's table words it
`Style name: … Font files: …`), a preselection at MTEXT (the console hangs, p145)

### `HATCH` / `H` / `BH` / `BHATCH`, `-HATCH` / `-H` / `-BH` / `-BHATCH` · es `SOMBREA` / `SB` / `SMB` / `-SMB`, `-SOMBREA`

**Implemented:** both names run one tool asking -HATCH's command line, headed and echoed by the
name typed (`-SMB` is SOMBREA, acad.pgp; p200–p202, p255; WHY HATCH asks -HATCH's prompts: the
Hatch Creation tab and the Hatch and Gradient dialog, where HATCH sets its properties, do not exist
here, and the console's HATCH offers no Properties, p01): `Current hatch pattern:  ANGLE` (es
`Patrón de sombreado actual:`), then `Specify internal point or [Properties/Select objects]:` (es
`Precise punto interno o [Propiedades/Designar objetos]`) until Enter makes the hatch; Enter at
`Command:` repeats it by the name it ran as (p204), neither runs transparently (p205), and a run is
one undo step U, REDO and UNDO name so, one that made nothing too (p239–p241, p247). **Escape**
under HATCH makes the hatch of the boundaries gathered, at any prompt, in the run's step, and
under -HATCH drops them (desktop d01-3, d02; WHY: the ribbon's HATCH has made the hatch at each
pick, which Escape leaves; with no ribbon here it is made as the run ends, HATCH-D45). **The
preview** (HPQUICKPREVIEW 1): at the internal point the area under the cursor shows hatched in the
object's colour before a pick, traced as the cursor leaves the area it found (d01-1, d02-1); after
a pick HATCH draws the hatch as it will be made and highlights the internal points' boundaries,
-HATCH only highlights them (d01-2, d02-2); Select objects' boundaries glow as the selection.
**The internal point** (hatch/p100–p168): the run's first says `Selecting everything...`,
`Selecting everything visible...`, `Analyzing the selected data...` (es `Seleccionándolo
todo...` …), found or not, and no later one, Undo or not (p104, p119); a point inside an area
already picked says `This area has already been specified.` (es `Esta área ya se ha
especificado.`, p157), one on a boundary object `Point is directly on an object.` (es `El punto
está directamente sobre un objeto.`, p143, p122: within 1e-6, the desktop's pickbox for a click
**unverified**), and neither adds anything; else the area is traced (boundary tracing, Outer
island style) from every visible object parallel to the UCS whatever its height, as if flattened
(p153–p155), saying `Analyzing internal islands...`, or `Valid hatch boundary not found.`; an off
layer is not traced, a locked one is (p151, p152), a hatch never (p159); a TEXT or MTEXT in the
area is an island box kept clear (p166, p134): a TEXT's ink across its baseline and its advance
along it plus 0.2585·h each side (p123, p125), an MTEXT's lines' advances by the font's ascent and
descent plus 0.25·h (p127), the rule behind both margins **unverified**; a typed object snap
override moves the point (p120), the running snaps leave a click alone (d09); a bare number is
direct distance from LASTPOINT towards the cursor (p102, p117); `x,y`, `@dx,dy`, `@`, `d<a` are
read as the console reads them, `x,y,z`, `#x,y`, `*x,y` refused (p110–p116), and the point sets
LASTPOINT (p111, p113, p118); another command's name typed there is a wrong answer (p244).
**Select objects** asks `Select objects:` (MOVE's counts and modes, of whole objects, a Window too,
p225) and goes back to the internal point, with an empty set too; a set selected before the command
is ignored and dropped, and nothing is left selected after it (p229–p232); its set never becomes the
Previous one, nor do internal points (p256, p257); it finds every object, one that closes no area
too (`1 found` for an open line, erase/p222), which the hatch leaves out silently beside a boundary
(p222), while Enter ending a run whose set bounds no area says `Unable to hatch the boundary.` (es
`Imposible sombrear el contorno.`, table 20770; an open line, a TEXT, an MTEXT alone: p223, p226,
p227), an empty run nothing (p224, p204); a TEXT or MTEXT it takes inside a boundary it takes is an
island box (p228). Undo, which the prompt declares but does not list (es `desHacer`), takes back
the last internal point's boundaries without a word and asks again, leaving what Select objects
took, and with no internal point left says `No boundary to Undo.` (es `Ningún contorno por
deshacer.`). **Properties** asks `Enter a pattern name or [?/Solid] <ANGLE>:` (`Unknown pattern
name.`, p03): a name in any case (`ansi31` is ANSI31, p217), a leading `_` read without it and kept
in HPNAME as typed (`Current hatch pattern:  _ANSI31`, `_S` is `_SOLID`; p207, p248, p254; the
object stores the pattern's own name), `Solid`/`S` (`<Solid>` once current, p215, p263), and `?`,
which lists the patterns shipped as acadiso.pat's `?` writes them, in the file's order, the name
padded to 15 columns, ` - ` and the file's description, its leading space kept (es from es
acadiso.pat, p221), and goes back to the internal point (p212, p220); a transparent command runs there (`'ZOOM`, `'-PAN`, p234, p238), one
that is not one is refused and then `Unknown pattern name.` (p234), as at every other prompt with
its own refusal (p233, p235–p237). For a pattern it then asks `Specify a scale for the pattern
<1.0000>:` — a distance, two points measured (` Specify second point:`, p209), zero and below
`Value must be positive and nonzero.`, a word `Requires a distance (or numberX).` (p208), the
default `%.4f` whatever LUPREC (table 25481, p259) — and `Specify an angle for the pattern <0>:`,
by two points too (p211), kept in [0, 360°) (`-30` is 330, p210, p262), at AUPREC (es `Indique
nombre de patrón o [?/Sólido]`, `Nombre de patrón desconocido.`, `Precise escala del patrón`,
`Precise ángulo del patrón`). HPNAME, HPSCALE and HPANG are set as each is answered, inside the run:
one U takes them back with it, an Escape keeps them (p242, p243, p260); they are the next hatch's,
per drawing and not saved (NEW and OPEN bring the defaults back, rectang/p303). Paint order behind
the boundary; the hatch lies at ELEVATION by either route (p167, p168, p245, p250, p251, p261), on
the current layer with the current properties (p245, p246); Select objects takes only objects in
the plane of the first that bounds an area, and no route objects at an angle to the UCS's XY plane

**Implemented, the object (HATCH review, block HOB):** acadiso.pat's metric definitions of SOLID,
ANGLE, ANSI31–ANSI38, LINE, NET, NET3, DASH, SQUARE, STEEL, BRICK, CROSS, ZIGZAG, HONEY, EARTH, DOTS,
AR-SAND and AR-CONC, each `.pat` line quoted beside its data, HPNAME starting on ANGLE (p00), the
`?` listing's descriptions from en and es acadiso.pat; the pattern generated line for line as
AutoCAD's EXPLODE leaves it, dash phase included, for scale, angle, HPORIGIN and a moved or turned
UCS (p300–p307), a member lying on a loop edge left out (p301), a `0` dash a dot, drawn as a
linetype's dot is; MOVE, COPY, ROTATE, SCALE carry the pattern (p310–p313), MIRROR reflects the
loops and keeps angle, origin and scale (MIRRHATCH 0, p314, p316, p350–p354); a pattern hatch is
picked, crossed and fenced by its lines only — a click between them or on its boundary off them
starts a window (desktop d06-1 to d06-3, p322, p324, p326, p327) — and a SOLID anywhere inside
(d06-5); grips of a non-associative hatch (d03-1): a round centre grip at the extents' centre that
moves it (d03-5, d04), a square per loop vertex and a segment-middle grip per edge that stretch them
(an arc's bends, as a polyline's); the palette's Pattern rows Type (`Predefined`), Pattern name,
Annotative (`No`), Angle, Scale, Origin X, Origin Y (editable, read in the UCS), Associative
(`No`), Island detection style (`Outer`) and Geometry's Elevation, Area, Cumulative Area (d05-1;
the Spanish labels `Nombre de patrón`, `Origen X`, `Área acumulativa`… are glossary words,
**unverified** on the desktop); pattern lines drawn continuous in the object's colour and
lineweight whatever its linetype (p340); nothing drawn with FILL off, SOLID or pattern (p341);
MATCHPROP copies name, angle and scale and leaves the origin (d07); a drawing saved before file
version 32 reads an ANSI31 hatch at its scale over 25.4, as it was drawn with acad.pat's imperial
definition; the es too-dense message is the console's `Intervalo de sombreado demasiado denso o
trazo demasiado pequeño.` (p305 es). WHY a safety cap of 100 000 pattern segments
(`MAX_HATCH_LINES`): it is not HPMAXLINES (p363, p364); AutoCAD refused ANSI31 over 0,0–100,50
between about 27 800 and 32 100 members (p365, p367), by a rule **unverified**, so a hatch between
that and the cap is made here and refused there

**Missing:** ellipse and spline boundaries at the internal point (p138–p141: AutoCAD traces them;
here they bound nothing); Outer's third loop (p130: AutoCAD stores the island's island as a loop of
its own, flagged not outermost, filling the same area: here 2 loops); a text box's rule for
several MTEXT lines, an attribute, a text across a boundary or a pick inside a text's box
(**unverified**); a tilted UCS at the internal point (p156: the console refuses a point off the
plane, **unverified**); chained open-object boundaries, HPGAPTOL, HPASSOC, HPSEPARATE=1, Normal/Ignore island
styles, -HATCH's other keywords (draW boundary, remove Boundaries, Advanced, DRaw order, Origin,
ANnotative, hatch COlor, LAyer, Transparency) and `?`'s `Enter pattern(s) to list <*>:` with its
pages (HATCH-D32), the console HATCH's own prompt (`Pick internal point or [Select objects/remove
Boundaries]:`, p200) and the ribbon's (`[Select objects/Draw/Undo/seTtings]`, d01), BHATCH and
-BHATCH as commands of their own (typed whole they echo nothing more, and `-BH` echoes `-BHATCH`,
p201, p255; here aliases: `BHATCH HATCH`, `-BH -HATCH`), gradients, user-defined patterns + Double, `-HATCH` draw order/colour/layer/transparency,
annotative; the object: acadiso.pat's other ~60 patterns; what EXPLODE makes of a dot
(**unverified**: here a zero-length LINE); MIRRHATCH 1; the angle as typed in a turned UCS (DXF
52: AutoCAD keeps the angle typed, here its world angle is stored and shown, p369, p330) and
HPORIGIN's readout after a MOVE (the palette's Origin stays 0,0 there, d05-1; here it moves with
the hatch); the grips' hover menus (Stretch / Origin Point / Hatch Angle / Hatch Scale at the
centre, Add / Remove Vertex at a vertex, Add Vertex / Convert to Arc at an edge, d03-2 to d03-4);
the palette's Spacing, ISO pen width, Double and Background color rows (greyed for a predefined
pattern); a double-click, which in AutoCAD opens the Hatch Editor tab and Quick Properties
(d08-2): HATCHEDIT/HE, the Hatch Editor and Quick Properties

### `BLOCK` / `B` / `BMAKE` / `BMOD` / `ACADBLOCKDIALOG`, `-BLOCK` / `-B` · es `BLOQUE` / `BQ` / `MODBLQ` / `BMAKE` / `BMOD` / `ACADBLOCKDIALOG`, `-BLOQUE` / `-BQ`

**Implemented:** -BLOCK's command line, which BLOCK asks too (p151, p152; aliases from the 2027
`acad.pgp`): `Current settings: Object conversion=Convert` (es `Parámetros actuales: conversión de
objetos=Convertir`, p01); `Enter block name or [?]:` (spaces typed key by key, `AB CD` whole, as
at `?`'s `Enter block(s) to list`, desktop workspace/d06), where Enter, a name with one of `<>/\":;?*|,=` or a
backquote, `*U1` or over 255 characters says `Invalid block name.` (es `Nombre bloque no válido.`, -BLOCK's
own; INSERT's is `Nombre de bloque no válido.`) and asks again (p100–p111, desktop d09). A name the
table holds, in any case, keeps its spelling and asks `Block "B1" already exists. Redefine it?
[Yes/No] <N>:` (es `El bloque "B1" ya existe. ¿Desea redefinirlo? [Sí/No] <N>:`): No or Enter
ends, another answer says `Yes or No, please.` and asks `Redefine it? [Yes/No] <N>:` (p113–p118);
after the set, `Block "B1" redefined`, and its U writes `Regenerating model.` (p137). A set that
holds the block being redefined, at any depth, is refused with `Block "B1" references itself`,
`Regenerating model.`, `*Invalid*`, and the command ends (p117, p119). `?` asks `Enter block(s) to
list <*>:` (es `Indique bloque(s) a enumerar`), writes `Defined blocks.`, the names it matches
quoted, the table of User Blocks, External References, Dependent Blocks and Unnamed Blocks
(anonymous blocks counted, never named, whatever the pattern), and ends (p104, p105, p156); the
console's `Press ENTER to continue:` is its pager, left out where the history scrolls.
`Specify insertion base point:`: Enter or a word says `Point or option keyword required.` and asks
again (p01, p124, p125); a Z off 0, ELEVATION's too, says `Beware, Z insertion base is not zero.`
(es `Cuidado, la base de inserción de Z no es cero.`, p126, p127). Then `Select objects:` with its
modes and counts; a set selected before the command is counted after the base point and taken
(p132); Enter at an empty set defines an empty block and converts nothing (p131, p139). Convert
mode, layer-0 inheritance on insert; attribute definitions join in pick order (a window or crossing
picks them in reverse order of creation, p307–p309). The reference is converted with their
defaults and ATTEDIT's box opens on it, a field per attribute labelled by its prompt: Enter applies
the values, Escape keeps the defaults — the Edit Attributes dialog the desktop opens whatever ATTDIA
(d00, d01; the console, which shows no dialog, asks nothing, p134, p305). One undo step.

**Missing:** the base point's Annotative and mOde (Retain/Delete); BLOCK's Block Definition dialog
(d08); ATTREQ 0, which skips the values' dialog; ATTSYNC / ATTREDEF / BATTMAN / BATTORDER
(redefining leaves existing attributes as they were, as AutoCAD does). In a turned UCS AutoCAD
2027 moves the converted objects, its reference landing at the base point turned twice (p155,
desktop d09); here they stay where they were, a deviation (BLOCKS-D14): copying a defect that moves
the user's geometry is no muscle memory. ByBlock: an object drawn ByBlock inside a block takes the
reference's colour, linetype or lineweight in AutoCAD; it is not modelled here (`cad-engine.md`)

### `INSERT` / `I`, `-INSERT` / `-I` · es `INSERT` / `IN`, `-INSERT` / `-IN`

**Implemented:** INSERT opens the Blocks palette, as 2027's does, and writes nothing more (the
console's `*Insert a block from the Blocks palette` is the console's, p05; desktop d06); the rail's
Insert button runs it. A click on a block there asks -INSERT's point with the block chosen, writing
only the prompt line, and U and REDO name the step `-INSERT` (d06-6, d06-9). -INSERT's command line
(aliases from the 2027 `acad.pgp` and console, p200, p201; Enter repeats it, `'-INSERT` is refused,
p202): `Enter block name or [?] <B1>:` (spaces typed key by key, `AB CD` whole, desktop
workspace/d06; the last block inserted, or else the last named one
defined — an array's anonymous `*U<n>` neither listed by `?` nor found by name —; names found
case-blind, `b1` inserts B1, p210 —, INSNAME's: per drawing, not saved, so NEW and OPEN forget the
block inserted, rectang/p303; typed as a variable, SETVAR, `Enter new value for INSNAME, or . for
none <"">:`, a name no block has taken and `.` none, a step U takes back, workspace/p216, p218);
Enter with no block to offer says `Invalid block name.` (es `Nombre
de bloque no válido.`) and ends (p217, p238); `?` lists as -BLOCK's does, with -INSERT's table of
User Blocks and Unnamed Blocks, and ends (p02, p208, p238); `Specify insertion point or
[Scale/Rotate]:`, where Enter or a word says `Point or option keyword required.` and asks again
(p02, p216); Scale's `Specify scale factor for XYZ axes <1>:` (uniform, its default written as
`%g`; `Requires numeric distance or two points.`, p205) and Rotate's `Specify rotation angle <0>:`
(`Requires valid numeric angle or two points.`, p207; `45d30'` read, p237), each taking two points
through ` Specify second point:` (p236) and back to the point; every run starts at scale 1 and
angle 0 (p204) (es `Indique nombre de bloque o [?]`, `Especifique un punto de inserción o
[Escala/Girar]` — the console's, p02, p200, over table 20813's `Precise` —, `Precise factor de
escala para ejes XYZ`, `Precise ángulo de rotación`, ` Designe segundo punto`). After the point,
what Scale and Rotate left (p02, p203, p205–p207, p219): `Enter X scale factor, specify opposite
corner, or [Corner/XYZ] <1>:` (the list is part of AutoCAD's message, table 20819; Corner and XYZ
are not built; `FOO` says the console's `X2D corner
point, or option keyword.`, table 26313 with the console's `X`), `Enter Y scale factor <use X scale
factor>:` (`Requires numeric value.`; Enter takes X's, so X −1 then Enter is (−1, −1), p203) and
`Specify rotation angle <0>:` (`Requires valid numeric angle or second point.`; a point gives the
angle from the insertion point, as UseBasePoint does, the ghost turning with the cursor along a
dashed line); Scale skips X and Y, Rotate the rotation, even left at its default (p205–p207). At
Scale, X and Y, `0` says `Value must be nonzero.` and asks again, and a negative factor is taken
(Scale −2 is (−2, −2), p205) (es `Indique factor de escala X, precise esquina opuesta, o [Esquina/XYZ]`, `Xuna
esquina 2D o una opción.`, `Indique factor de escala Y <usar factor de escala X>`, `Requiere un
valor numérico.`, `El valor debe ser diferente de cero.`, `Requiere un ángulo numérico válido o un
segundo punto.`, p219). The reference keeps an X and a Y scale, its Z being |X| (p203, p205); a
negative one reflects it, and unequal ones draw a circle as an ellipse, an arc as an elliptical
arc, and map lines, polylines, splines, ellipses, a dimension's points and a hatch's loops and
pattern. The reference is dragged in as it will be drawn: each object in its own
colour, the attributes showing their defaults, then the values given (desktop d06-7). A hatch
inside a reflected reference draws its pattern reflected (plots p230, p231); EXPLODE keeps its
angle and its lattice through the origin (p227, p228; the scale it takes is the reference's,
**unverified**). The Properties palette files it under Geometry (Position X/Y/Z, Scale X/Y/Z, each
typed but Scale Z, which is |X| here), Misc (Name, read-only, and Rotation) and Attributes (a row
per tag, read-only) (desktop d03-2, d03-3; es `Posición X`, `Escala X` **unverified**). Attribute
values at the command line (ATTDIA 0, ATTREQ 1), after the rotation (p303): `Enter attribute values` (es `Indique valores de atributo`), each asked
by its prompt (its tag when it has none) with its default, `Prompt one <def1>:`, `Verify attribute
values` (es `Verificar valores de atributo`) for Verify mode, Preset takes its default, Constant is
drawn from the block; the reference is added once all are given (one undo step, Escape cancels the
whole insertion)

**Missing:** Corner and XYZ at the X scale, and a point there, its opposite corner (the box
ignores a click and refuses a typed point); text, an MTEXT, attributes and a polyline's arc
segments under unequal X and Y: AutoCAD maps them (a text stretched, an arc an elliptical one),
here they are drawn at X's size, their point where the map puts it, and the arcs stay arcs between
the mapped vertices; a reference nested in one rotated inside an unequally scaled one drops the
shear AutoCAD shows; a negative X typed at -INSERT draws its text and attributes backwards in
AutoCAD (desktop d02-1), here readable as MIRROR leaves them (MIRRTEXT 0, p332), since no text is
drawn backwards; the Properties palette's Annotative, Block Unit and Unit factor (d03-2); ByBlock
(not modelled, `cad-engine.md`); `Units: Millimeters   Conversion:    1.0000`; a name not in the
drawing (AutoCAD searches for a drawing file, `"FOO.dwg": Can't find file in search path:` …
`*Invalid*`; here `Block "FOO" is not defined.` and the name again); Basepoint, X, Y, Z, Explode
and REpeat at the point; inserting an external drawing + INSUNITS; ATTDIA 1 (the Edit Attributes
dialog at insertion); ATTREQ 0

### `ATTDEF` / `ATT` / `DDATTDEF` / `-ATTDEF` / `-ATT` · es `ATRDEF` / `AT` / `-ATRDEF` / `-AT`

**Implemented:** -ATTDEF's command-line sequence for every name (ATTDEF's dialog is not built, as
BLOCK's is not; aliases from the 2027 `acad.pgp`, p300, p301): the modes line on two lines, as
AutoCAD 2027's console prints it (`Current attribute modes:` /
`Invisible=N  Constant=N  Verify=N  Preset=N  Lock position=Y  Annotative=N  Multiple line=N`, then
`Enter an option to change [Invisible/Constant/Verify/Preset/Lock position] <done>:`, es
`Indique una opción para modificar [Invisible/Constante/Verificable/Predefinido/Bloquear posición] <terminado>`;
es `Modos de atributo actuales:` / `Invisible=N  Constante=N … Anotativo=N  línea Múltiple=N`, the
last two always N here; p03) and Invisible / Constant / Verify / Preset / Lock position toggles
(AFLAGS, per session, initially Lock position; typed as a variable, SETVAR, 0 to 63, a step U takes
back, workspace/p213, p218, but Multiple lines' 32, refused: -ATTDEF then asks a multiline
attribute's lines, p224, not built). `Enter attribute tag name:` takes no spaces, as
AutoCAD's: a space ends the tag, typed in the box or at the command line, and what follows answers
the next question (`A B` is tag A and prompt B, p313); `!` is taken (p314), lower case upper-cased,
and only Enter is refused, `Tag cannot be null` (es `El identificador no puede ser nulo`, p315).
`Enter attribute prompt:` (Enter = the tag), `Enter default attribute value:` or, for Constant,
`Enter attribute value:`; there and at INSERT's values a leading `\` escapes only a `\` or a blank
(`\X` stays `\X`, `\\Y` is `\Y`, `\ Z` is ` Z`, p311, p315, p329). Then
`Current text style:  "Standard"  Text height:  2.50  Justify:  Left` (es
`Estilo de texto actual:  "Standard"  Altura del texto: …  Justificar:  SI` after TL, p320; a
fixed-height style's height, text/p321) and TEXT's prompts in TEXT's words and refusals (Justify,
Style, start point, height, rotation). TEXTSIZE, the justification and the rotation are TEXT's,
shared both ways through the drawing (p326, p327). Style's Enter or a name writes the Current line
again, and `?` lists the styles, writes it and asks the start point, as TEXT's (p325). Enter at the
start point places the definition one line below the newest this drawing session defined that is
still in the drawing (its height, rotation, style and justification, p320); with none — U took it
back, NEW or OPEN came since, or only a TEXT was written — it says `Point or option keyword
required.` (after a justification `Invalid point.`, as TEXT's) and asks again (p321, p322, p324).
Style makes the style current (rectang/p313). A loose definition shows its tag, always (ATTMODE
governs references only), has TEXT's grips — one at a Left one's point, a justified one's two
(desktop d03-5, text/d02-1) —, Insertion snap, palette rows and TEXTEDIT / double-click for Tag,
Prompt and Default

**Missing:** 2027's modes prompt lists seven keywords
(`[Invisible/Constant/Verify/Preset/Lock position/Annotative/Multiple lines]`, es
`[…/aNotativo/líneas Múltiples]`, p319); Annotative and Multiple lines (ATTMULTI) are not offered,
nor Multiple lines' `Next line or <done>:` and `Specify location of multiline attribute:` (es
`Siguiente línea o <terminado>:`, `Indique la ubicación del atributo de líneas múltiples:`, p319);
fields, Align/Fit (as TEXT), `?`'s `Enter text style(s) to list <*>:` and its pages (as TEXT,
p325), the Attribute Definition dialog

### `ATTEDIT` / `ATE` / `DDATTE` / `EATTEDIT` · es `ATREDIT` / `ATR` / `DDATTE` / `EDITATR`

**Implemented:** ATTEDIT asks `Select block reference:` (es `Designe referencia a bloque:`) and
EATTEDIT `Select a block:` (es `Designe un bloque:`), words of atteditRes.dll (1) and
AcEAtteditRes.dll (43), which the merged tables lack. The pick takes the object under the box, the
rollover highlighting whatever it covers; anything but a reference is refused with ` That object is
not a block.` (es ` Este objeto no es un bloque.`) or, at EATTEDIT, `The selected entity is not a
block.` (es `La entidad seleccionada no es un bloque.`), a reference with no attributes with ` That
block has no editable attributes.` (es ` Este bloque no tiene atributos editables.`) or `The
selected block has no editable attributes.` (es ` El bloque seleccionado no contiene atributos
editables.`, the table's leading space kept), and the question is asked again (desktop d05;
atteditRes 3, 4; AcEAtteditRes 38, 37). A pick on nothing asks again in silence (the table's ` No
object found.`, atteditRes 2, is **unverified** there). Then the values are edited in the
dynamic-input box, one field per attribute labelled by prompt (ATTEDIT's Edit Attributes) or by tag
(EATTEDIT's Attribute tab); Tab moves, Enter is OK, Escape Cancel; one undo step. A double-click on
a reference with attributes writes `_eattedit` and `Select a block: 40.004639,19.953271,0.000000`
(the point picked, in the UCS) and opens EATTEDIT's box (desktop d04)

**Missing:** -ATTEDIT (p330) and its aliases `-ATE`, `ATTE` (es `-ATR`), unknown here; ATTIPEDIT
and Ctrl+double-click; the dialogs' other parts: Edit Attributes' Previous, Next and Block name,
EATTEDIT's Text Options and Properties tabs and Select Block button; an unlocked attribute's own
grip on a reference (desktop d02-1); attribute rows editable in the Properties palette

### `ATTDISP` · es `ATRVIS`

**Implemented:** `Enter attribute visibility setting [Normal/ON/OFF] <Normal>:` (the current one; es
`Indique parámetro de visibilidad de atributo [Normal/ACT/DES]`), `Invalid option keyword.` for
anything else, `O` asking `OFf or ON?`; Normal / ON / OFF (ATTMODE, saved in the drawing, undoable),
`Regenerating model.` when it changes, as AutoCAD 2027's console says it (p04, p334–p336;
transparently `Regen queued.`); Enter keeps the setting; U writes `ATTDISP` alone, with no
regeneration (p337)
