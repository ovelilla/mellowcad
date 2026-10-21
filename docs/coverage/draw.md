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
`Línea de longitud cero creada en (…)`) at the drawing's precision, while two picks on one point (a
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

### `RECTANG` / `REC` · es `RECTANG` / `REC`

**Implemented:** `Specify first corner point or [Chamfer/Elevation/Fillet/Thickness/Width]:` (es
`Precise primer punto de esquina o [Chaflán/Elevación/eMpalme/Alt-objeto/Grosor]`) and
`Specify other corner point or [Area/Dimensions/Rotation]:` (es
`Precise esquina opuesta o [áRea/Cotas/rOtación]`), neither taking Enter
(`Point or option keyword required.`); two-corner closed polyline. The first prompt's options ask a
value offering the one they keep for the session, negative ones too: Chamfer
`Specify first chamfer distance for rectangles` and `Specify second chamfer distance for rectangles`
(its `<default>` the last second distance, or with none the first just given), Fillet
`Specify fillet radius for rectangles` (its default Chamfer's first distance, and it sets both),
Elevation `Specify the elevation for rectangles` and Thickness `Specify thickness for rectangles`
(instead of ELEVATION and THICKNESS), and Width `Specify line width for rectangles` (es
`Precise grosor de línea para rectángulos`, its keyword `Grosor` at that prompt only, `Anchura`
being Area's), a value or two points (`Requires numeric distance or two points.`), never PLINEWID:
every side and fillet that wide, a negative width listed as typed and drawn as none (acc/w6).
Chamfer and Fillet replace each other, and 0 (0 x 0) turns them off; each corner is cut the first
distance back along the side reaching it and the second along the side leaving it, the polyline
starting where the first corner's cut begins, eight vertices — doubled and plain when the cuts do
not fit on a side, as the console leaves them.
`Current rectangle modes:  Chamfer=10.00 x 5.00  Elevation=…  Fillet=…  Thickness=…  Width=…  Rotation=30`
lists the ones not 0 (es
`Modos de rectángulo actuales:  Chaflán=…  Elevación=…  Empalme=…  Alt-objeto=…  Grosor=…  Rotación=…`).
Area: `Enter area of rectangle in current units <100.00>:` (`Requires numeric value.`,
`Value must be positive and nonzero.`),
`Calculate rectangle dimensions based on [Length/Width] <Length>:`,
`Enter rectangle length <10.00>:` or `Enter rectangle width`, the other side giving the area with
the chamfers or fillets when they fit, laid along the turned +X and +Y and made at once. Dimensions:
`Specify length for rectangles` and `Specify width for rectangles` (the sides Area keeps too, its
computed one included), then the other corner picks the quadrant — read along the UCS, not along the
turned sides, as AutoCAD 2023's console reads it (WHY in the tool). Rotation:
`Specify rotation angle or [Pick points] <0>:`, an angle, a point measured from the first corner, or
Pick points' `Specify first point:` and `Specify second point:` (`Invalid point.`), kept for the
session. The words are Autodesk's 2027 Spanish string table's. An Elevation other than 0 puts the
rectangle that high above the UCS's XY plane whatever the corners' Z; at 0 the first corner fixes
the plane (**unverified**: the help only says it "Specifies the Z-value for the rectangle")

**Missing:** a length of 0 at Area, which here makes nothing (the console a polyline of no size at
the origin); Enter at Pick points' first point (the console takes its own cursor there; refused here
as `Invalid point.`)

### `POLYGON` / `POL` · es `POLIGONO` / `PG`†

**Implemented:** `Enter number of sides <4>:` (es `Indique número de lados <4>:`), a count outside
3–1024 or not whole refused with `Requires an integer between 3 and 1024.` (es
`Requiere un nº entero entre 3 y 1024.`, the table's `Requires an integer between %d and %d` with
the period AutoCAD's input functions end it with) and asked again;
`Specify center of polygon or [Edge]:` (es `Precise centro de polígono o [Lado]:`),
`Enter an option [Inscribed in circle/Circumscribed about circle] <I>:` (es
`Indique una opción [Inscrito en el círculo/Circunscrito alrededor del círculo] <I>:`), then
`Specify radius of circle:` (es `Precise radio de círculo:`); the count (POLYSIDES) and the option
are the next run's `<default>`, for the session; Inscribed puts the vertices on the radius,
Circumscribed the edges' midpoints; a picked radius sizes and turns it, a typed one draws the bottom
edge level in the UCS ("Specifying the radius draws the bottom edge of the polygon at the current
snap rotation angle"); Edge's `Specify first endpoint of edge:` and
`Specify second endpoint of edge:` (es `Precise primer punto final de lado:`,
`Precise segundo punto final de lado:`) build it counterclockwise from that edge; a closed polyline
in the plane of its centre or first endpoint, with THICKNESS. English wording and geometry from
AutoCAD 2023's own console, Spanish from the 2027 Spanish language pack's string table, paired with
the English by id

**Missing:** a point at `Specify radius of circle:` typed as a coordinate (a distance only here),
SNAPANG (no rotated snap here: a typed radius levels the bottom edge with the UCS), POLYSIDES as a
variable

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
p105–p107); Enter afterwards repeats CIRCLE and U names it CIRCLE (es CIRCULO; p159, p191, p192);
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
the last circle's (CIRCLERAD: per session, whichever mode made it, p162); a radius or diameter
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
p107, p149); ARCSCE and ARCCSE, this app's names for those buttons (AutoCAD knows neither, p105),
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
`Specify center of elliptical arc:` — Center keeps the Arc chosen before it),
`Specify start angle or [Parameter]:`, `Specify end angle or [Parameter/Included angle]:` and
`Specify included angle for arc <180>:` (Enter draws half); Parameter asks
`Specify start parameter or [Angle]:` and `Specify end parameter or [Angle/Included angle]:` (es
`Precise ángulo inicial o [Parámetro]`, `Precise parámetro inicial o [ángUlo]`,
`Precise parámetro final o [ángUlo/ángulo Incluido]`), the choice holding from the start to the end
prompt until Angle; a parameter is u in `p(u) = c + a·cos(u) + b·sin(u)`, a point given there is
taken by its angle from the major axis as u (`0,25` on 0,0 → 100,0, 25 starts at 5.28,11.18), and
Included angle sweeps in the end prompt's measure (90 from an angle of 30: to angle 120, or after
Parameter to u 139.1); the first axis's semi-axis runs to the first endpoint (from a centre, to the
endpoint given), where angle and parameter 0 lie, and a longer other axis is it turned a quarter
left — AutoCAD 2023's console, its refusals included
(`Requires valid numeric angle, second point, or option keyword.`). ELLIPSEC and ELLIPSEARC (the
ribbon's Center and Elliptical Arc) start at the centre's and the arc's first prompt. A rotation in
the refused band says `*Invalid*` and ends the command, as AutoCAD's does. Axis-End, Center, Arc
(start/end angle + Included angle), Rotation (with AutoCAD's 89.4°–90.6° refusal); DXF model (centre
+ major-axis vector + ratio + parameters); centre/quadrant/endpoint/nearest snaps; both radii
editable in the palette

**Missing:** Isocircle: AutoCAD offers it only under the isometric snap style (SNAPSTYL 1, not built
here), as `[Arc/Center/Isocircle]`, `Specify center of isocircle:`,
`Specify radius of isocircle or [Diameter]:` and `Specify diameter of isocircle:`; `PELLIPSE` = 1
(polyline approximation), axis grips (only the centre grips), ratio and angles as palette rows,
OFFSET / HATCH / boundary / BREAK / JOIN / FILLET / DIM on an ellipse, tangent and perpendicular
snaps, ellipse intersections; the ribbon's `_c` / `_a` answer in the history of ELLIPSEC and
ELLIPSEARC, a zero-length first axis (AutoCAD takes it and then says `*Invalid*`); Spanish from the
2027 Spanish language pack's string table, paired with the English by id

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
`Specify start tangent:` and `Specify end tangent:`. Fit: a cubic through the points (n + 2 control
vertices, knots the unnormalised chord sums LIST reports), Knots Chord / Square root / Uniform,
start Tangency after the first point, end Tangency ending the command, Close from the third point,
periodic, ending the command (AutoCAD 2023's console asks no tangent there). CV: Degree 1–10,
lowered to vertices − 1 when fewer, knots 1 apart, Close from the third point (periodic). Undo;
Method, Knots and Degree kept for the session (SPLMETHOD / SPLKNOTS / SPLDEGREE, Not-saved); Escape
discards the curve; one undo step; the control frame while drawing CV. Endpoint, Midpoint (halfway
along), Nearest and Intersection snaps (against the chords of a tessellation a hundred-thousandth of
the size off the curve); a grip per fit point or control vertex, with the frame of a CV spline;
palette rows Method, Degree, Knot parameterization, Closed, Area (read-only); STRETCH moves the
points in the window; EXPLODE refuses it, as AutoCAD's does. Wording from AutoCAD 2023's console and
resources and the 2027 Spanish language pack's

**Missing:** toLerance and Object (not offered: a tolerance above 0 is an approximation Autodesk
does not document, and there are no spline-fit polylines to convert), the end tangents AutoCAD
computes when none is given (undocumented; here the parabola through the three end points),
SPLINEDIT, CVSHOW / CVHIDE, the triangular grip and the multifunction grip menus (add / remove
point, tangent, refine), weights, palette editing, TRIM / EXTEND of a spline an edge reaches (TRIM's
row), BREAK / JOIN / OFFSET / FILLET / HATCH / DIM on a spline or against one, Perpendicular /
Tangent / Geometric Center snaps, PEDIT Spline, BLEND

### `TEXT` / `DTEXT` / `DT` · es `TEXTO` / `T`†

**Implemented:** single-line text, 13 justifications, text styles table, as AutoCAD 2023's console
asks it: `Current text style:  "Standard"  Text height:  2.5000  Annotative:  No  Justify:  Left`
(es `Estilo de texto actual:  … Altura de texto: … Anotativo: … Justificar:`),
`Specify start point of text or [Justify/Style]:` — the point the justification names,
`Specify middle point of text`, `Specify top-left point of text`… (es
`Precise punto inicial de texto`, `Precise punto medio de texto`…), without the keywords after
Justify, whose `Enter an option [Left/Center/Right/Middle/TL/TC/TR/ML/MC/MR/BL/BC/BR]:` (es
`[Izquierda/Centro/Derecha/Medio/SIZ/…]`) is also answered unlisted at the first prompt (`MC` there
asks the middle point at once) —, Style's `Enter style name or [?] <Standard>:` (Enter keeps it;
`Cannot find text style "NAME".`, es `No se puede encontrar estilo de texto "NAME".`; `?` lists the
styles as the console lists them, `Text styles:` … `Current text style: "Standard"`),
`Specify height <2.50>:`, `Specify rotation angle of text <0.00>:`, then `Enter text:` (es
`Escriba el texto`) a line at a time

**Missing:** Align and Fit justifications, `?`'s `Enter text style(s) to list <*>:` and its pages,
in-place caret editing (the text is typed in the box: `Enter text:` is DTEXT's command-line prompt),
content edit from the palette; **unverified**: how the `Current text style` line names a
justification other than Left (its keyword here, `Justify:  MC`)

### `MTEXT` / `T` / `MT` / `-MTEXT` · es `TEXTOM` / `-TEXTOM`

**Implemented:** two corners or Width; as AutoCAD 2023's console asks it:
`Current text style:  "Standard"  Text height:  2.5  Annotative:  No`, `Specify first corner:`,
`Specify opposite corner or [Height/Justify/Line spacing/Rotation/Style/Width]:` and its keywords'
`Specify height <2.50>:`, `Enter justification [TL/TC/TR/ML/MC/MR/BL/BC/BR] <TL>:` (nine
attachments; the box hangs off the attachment point however it was dragged),
`Enter line spacing type [At least/Exactly] <At least>:` and
`Enter line spacing factor or distance <1x>:` (a factor `nx` or a distance, 0.25x–4x, else
`Please specify a line spacing value between 1.04 (0.25x) and 16.67 (4x), inclusive.`),
`Specify rotation angle <0.00>:` and `Enter style name or [?] <Standard>:` (`Invalid style name`)
looping back to the corner, Width's `Specify width:`; es from Autodesk's MTEXT table
(`Precise la primera esquina`, `Indique la esquina opuesta o`, `Indique la altura`,
`Indique la justificación`, `Indique el tipo de interlineado [Al menos/Exactamente]`,
`Indique el ángulo de rotación`, `Indique la anchura`, `Nombre de estilo no válido`); word wrap from
Arial's widths (a longer word overflows), single spacing 5/3 of the height; MTJIGSTRING `abc` jig
and flow arrow; the editor is the dynamic-input box made multi-line and drawn in place (Enter breaks
a paragraph, Ctrl+Enter or a click outside the frame keeps, Escape discards); `-MTEXT` takes the
lines at `MText:` (es `textoM:`); contents kept as AutoCAD's string (`P`, escapes; inline codes
survive but are not drawn); Insertion snap, width grip, palette rows (line space
factor/distance/style, defined width), TEXTEDIT and double-click, EXPLODE to TEXT

**Missing:** Columns (the keyword is not offered), drawing inline formatting (height, font, colour,
stacking, underline…), the editor's ruler, tabs, indents and lists, background mask, text frame, the
Text Formatting toolbar, MTEXTFIXED 2 (horizontal while typing; here always as drawn), a caret on
the canvas, Node snap on MTEXT (OSNAPNODELEGACY 0; where its points fall is undocumented), defined
height and the column-height grip, Annotative, `?`'s own listing (here TEXT's: MTEXT's table words
it `Style name: … Font files: …`), what a click with no drag does (undocumented)

### `HATCH` / `H` / `BH` · es `SOMBREA` / `SB`† / `SMB`†

**Implemented:** -HATCH's command line for both names (WHY: the Hatch Creation tab and the Hatch and
Gradient dialog, where HATCH sets its properties, do not exist here):
`Current hatch pattern:  ANSI31` (es `Patrón de sombreado actual:`), then
`Specify internal point or [Properties/Select objects]:` (es
`Precise punto interno o [Propiedades/Designar objetos]`) until Enter makes the hatch — each
internal point says `Selecting everything...`, `Selecting everything visible...`,
`Analyzing the selected data...`, `Analyzing internal islands...` (es `Seleccionándolo todo...` …)
and traces the area (boundary tracing, Outer island style), Select objects asks `Select objects:`
(MOVE's counts and modes) and goes back to the internal point, with an empty set too; Undo, which
the prompt declares but does not list (es `desHacer`), takes back the last internal point's
boundaries without a word and asks again, leaving what Select objects took, and with no internal
point left says `No boundary to Undo.` (es `Ningún contorno por deshacer.`); Properties asks
`Enter a pattern name or [?/Solid] <ANSI31>:` (`Unknown pattern name.`), then for a pattern
`Specify a scale for the pattern <1.00>:` and `Specify an angle for the pattern <0.00>:` (es
`Indique nombre de patrón o [?/Sólido]`, `Nombre de patrón desconocido.`,
`Precise escala del patrón`, `Precise ángulo del patrón`); SOLID + ANSI31, live preview, single
undo, paint order behind the boundary, area hit-test, single grip; the hatch lies at the height of
its boundary: the object nearest an internal point (-HATCH's Nearest ray casting) or the first
object selected fixes it, and objects at another height are neither traced nor taken ("enclosed
areas can be hatched only if they are in a plane parallel to the XY plane of the current UCS";
objects "not all at the same elevation" give `Valid hatch boundary not found.`); which object fixes
the plane is **unverified**; objects at an angle to the UCS's XY plane are not taken

**Missing:** the metric pattern file (acadiso.pat defines ANSI31 at 3.175 spacing; the imperial
0.125 is used, so a millimetre drawing needs HPSCALE ≈ 25), chained open-object boundaries,
HPGAPTOL, HPASSOC, HPSEPARATE=1, Normal/Ignore island styles, -HATCH's other keywords (draW
boundary, remove Boundaries, Advanced, DRaw order, Origin, ANnotative, hatch COlor, LAyer,
Transparency) and `?`'s `Enter pattern(s) to list <*>:` with its pages, HATCHEDIT/HE, gradients,
user-defined patterns + Double, Origin, `-HATCH` draw order/colour/layer/transparency, annotative,
the other ~70 predefined patterns

### `BLOCK` / `B` / `-BLOCK` · es `BLOQUE` / `BQ`†

**Implemented:** -BLOCK's command line: `Current settings: Object conversion=Convert`,
`Enter block name or [?]:` (Enter ends; a name with `<>/\":;?*|,=` and the like says
`Invalid block name.`), `Specify insertion base point:` (`Invalid point.`), then `Select objects:`
with its modes and counts (es `Parámetros actuales: conversión de objetos=Convertir` — the word
**unverified** —, `Indique nombre de bloque o [?]`, `Especifique un punto base de inserción`,
`Nombre de bloque no válido.`); `?` list, Convert mode, layer-0 inheritance on insert; attribute
definitions ask in pick order (a window or crossing picks them in reverse order of creation), and
the converted reference asks their values as INSERT does

**Missing:** the base point's Annotative and mOde (Retain/Delete), `?`'s
`Enter block(s) to list <*>:` and AutoCAD's table of counts (here the names), "block already exists"
redefine prompt, ATTSYNC / ATTREDEF / BATTMAN / BATTORDER (redefining leaves existing attributes as
they were, as AutoCAD does)

### `INSERT` / `I` / `-INSERT` · es `INSERT` / `IN`†

**Implemented:** -INSERT's command line: `Enter block name or [?] <B1>:` (the last block inserted,
or else the last defined, INSNAME's), `Specify insertion point or [Scale/Rotate]:`, Scale's
`Specify scale factor for XYZ axes <1.00>:` (uniform; `Requires numeric distance or two points.`)
and Rotate's `Specify rotation angle <0.00>:` (`Requires valid numeric angle or two points.`), each
back to the point (es `Indique nombre de bloque o [?]`,
`Precise punto de inserción o [Escala/Girar]`, `Precise factor de escala para ejes XYZ`,
`Precise ángulo de rotación`); mirrored flag; attribute values at the command line (ATTDIA 0, ATTREQ
1): `Enter attribute values` (es `Indique valores de atributo`), each asked by its prompt (its tag
when it has none) with its default, `Prompt one <def1>:`, `Verify attribute values` (es
`Verificar valores de atributo`) for Verify mode, Preset takes its default, Constant is drawn from
the block; the reference is added once all are given (one undo step, Escape cancels the whole
insertion)

**Missing:** the X scale, Y scale and rotation AutoCAD asks after the point when Scale and Rotate
were not given (here the point places the reference at the session's scale and angle),
`Units: Millimeters   Conversion:    1.0000`, a name not in the drawing (AutoCAD searches for a
drawing file, `"FOO.dwg": Can't find file in search path:` … `*Invalid*`; here
`Block "FOO" is not defined.` and the name again), Basepoint/Corner/XYZ/Explode/Repeat, non-uniform
X/Y/Z scale (the ellipse exists now, but this also needs `InsertEntity.scale` split into X/Y and a
per-axis `scaleEntity`), inserting an external drawing + INSUNITS, ATTDIA 1 (the Edit Attributes
dialog at insertion), ATTREQ 0

### `ATTDEF` / `ATT` / `-ATTDEF` · es `ATRDEF` / `AT`† / `-ATRDEF` / `-AT`†

**Implemented:** -ATTDEF's command-line sequence for both names (ATTDEF's dialog is not built, as
BLOCK's is not): the modes line on two lines, as AutoCAD 2023's console prints it
(`Current attribute modes:` /
`Invisible=N  Constant=N  Verify=N  Preset=N  Lock position=Y  Annotative=N  Multiple line=N`, then
`Enter an option to change [Invisible/Constant/Verify/Preset/Lock position] <done>:`, es
`Indique una opción para modificar [Invisible/Constante/Verificable/Predefinido/Bloquear posición] <terminado>`;
es `Modos de atributo actuales:` / `Invisible=N  Constante=N … Anotativo=N  línea Múltiple=N`, the
last two always N here) and Invisible / Constant / Verify / Preset / Lock position toggles (AFLAGS,
per session, initially Lock position), `Enter attribute tag name:` (uppercased; Enter says
`Tag cannot be null`, es `El identificador no puede ser nulo`; spaces and `!` refused),
`Enter attribute prompt:` (Enter = the tag), `Enter default attribute value:` or, for Constant,
`Enter attribute value:`, a leading `\` keeps blanks; then
`Current text style:  "Standard"  Text height:  2.50  Justify:  Left` (es
`Estilo de texto actual:  "Standard"  Altura del texto: …`) and TEXT's prompts in TEXT's words and
refusals (Justify, Style, start point, height, rotation) with Enter at the start point stacking
below the previous definition; a loose definition shows its tag, always (ATTMODE governs references
only), has Insertion snap, palette rows and TEXTEDIT / double-click for Tag, Prompt and Default

**Missing:** Multiple lines (ATTMULTI) and Annotative (not offered), fields, Align/Fit (as TEXT),
the Attribute Definition dialog

### `ATTEDIT` / `ATE` / `EATTEDIT` · es `ATREDIT` / `EDITATR`

**Implemented:** pick a reference with attributes and edit its values in the dynamic-input box (not
asked through the command line's question: the pick's prompt is not in the string tables extracted,
so it keeps `ATTEDIT:`), one field per attribute labelled by prompt (ATTEDIT's Edit Attributes) or
by tag (EATTEDIT's Attribute tab); Tab moves, Enter is OK, Escape Cancel; one undo step;
double-click on a reference with attributes opens EATTEDIT

**Missing:** -ATTEDIT, ATTIPEDIT and Ctrl+double-click, EATTEDIT's Text Options and Properties tabs
and Select Block button, moving an unlocked attribute with grips, attribute rows editable in the
Properties palette

### `ATTDISP` · es `ATRVIS`

**Implemented:** `Enter attribute visibility setting [Normal/ON/OFF] <Normal>:` (the current one; es
`Indique parámetro de visibilidad de atributo [Normal/ACT/DES]`), `Invalid option keyword.` for
anything else; Normal / ON / OFF (ATTMODE, saved in the drawing, undoable), `Regenerating model.`
when it changes, as AutoCAD 2023's console says it; Enter keeps the setting
