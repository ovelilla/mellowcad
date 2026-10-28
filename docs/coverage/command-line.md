# Command line

### Command window · Ctrl+9 · F2

**Implemented:** one prompt line, as AutoCAD's starts: `Command:`, and while a command runs its name
and the question it asks — `LINE Specify next point or [Undo]:`, with the value Enter keeps
(`<10.00>`), written at the drawing's precision as AutoCAD writes it at LUPREC (UNITS sets it;
AutoCAD's `<10.0000>` is LUPREC 4), an angle at AUPREC's (`<90>`) — WHY 2 places in a new drawing,
where acadiso.dwt starts at 4: a starting precision is the template's choice, not a command's
behaviour, and every `<…>` and report follows the one the drawing has, the arrays' distances
without their trailing zeros as AutoCAD writes them (`<6>`, `<-4.3514>`; arrays/p116, p130); the
dynamic-input tooltip shows the question alone, up to its `or` (its keywords are the chips below
it), or with its colon when it offers none. An alias is echoed as typed with the name it runs (`Command: l LINE`, es
`Comando: l LINEA`); a command started from the tool palette is echoed as AutoCAD's ribbon macro
(`^C^C_line`) echoes it, `Command: _line` (desktop line/d19; every other button's macro is
**unverified**), and is a command run: Enter at `Command:` repeats it, U names it (`CIRCLE`, es
`CIRCULO`; probes circle/p159, p191, p192); the rail's Circle modes run the ribbon's macros, `_circle`
and the mode answered at its prompt, the prompt that answer opens written on the answer's line as the
desktop writes it (`Specify center point for circle or [3P/2P/Ttr (tan tan radius)]: _2p Specify
first end point of circle's diameter: 0,0`, desktop circle/d01, d02; ARC's, `_arc` and `_c`,
desktop arc/d03, d04; ELLIPSE's, `_ellipse` and `_c` or `_a`, acad.cuix, probes ellipse/p105,
p107, p198); the prompt is headed by the
command typed, a dash one's with its dash (`-LINETYPE Enter an option [?/Set]:`, es `-TIPOLIN`). The history writes each prompt with its
answer: what was typed (a value, a keyword, `<45`, FROM; a coordinate the tooltip reads from the
prompt's base point, DYNPICOORDS 0, with the `@` it was read with: `5,-12` typed in COPY's tooltip
is written `@5,-12`, desktop move after d02), bare for a pick or Enter, `*Cancel*` after
Escape (es `*Cancelado*`; at `Command:` Escape writes `Command: *Cancel*`, es `Comando: *Cancelar*`,
desktop passes line/d08, d19, d27), and an object snap on the line its pick answers
(`Specify first point: _endp of`, typed `end of`; FROM's `Base point:` and `<Offset>:` on lines of
their own), ahead of what answering it reported
(`Current line-width is 0.0000`). Mid-command a command name is not run: what is neither a keyword
nor what the question asks — typed at the command line or in the tooltip — is written as its answer
and refused in the words of the input function behind the question, as AutoCAD 2023's console
refuses it, and the question is asked again: `Invalid point.` / `Point or option keyword required.`
(a 2D point's at ARC's, PLINE's, MIRROR's and POLYGON's Edge's later points, ELLIPSE's other endpoint and
CIRCLE's 2P and 3P ones, which refuse a Z or `*` typed there too, circle/p16, p18, p180),
`Requires numeric distance, two points, or option keyword.` and its forms (from a base point,
`second point`), `Requires valid numeric angle…`, `Requires numeric value.`,
`Requires an integer value.`, `Invalid option keyword.`, at `Select objects:` `*Invalid selection*`
and
`Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object`
(MIRROR and JOIN without SUbobject/Object, STRETCH without Group too), at a single object's pick
`*Invalid selection*` and `Expects a point or` its keywords, and CIRCLE's, Ttr's and POLYGON's own
(`Requires numeric radius, point on circumference, or "D".`); es in Autodesk's table's words
(`Punto no válido.`, `Se requiere un punto o una opción.`, `*Designación no válida*` /
`Requiere un punto o Ventana/úLTimo/…`, `Opción no válida.`). A transparent command — what AutoCAD
2023's console runs so of what exists here: ZOOM, PAN, DIST, ID, LTSCALE, ATTDISP, ELEV, -OSNAP,
COLOR / -COLOR, LINETYPE / -LINETYPE, LWEIGHT / -LWEIGHT, -VIEW, SNAP, UNITS, DIMSTYLE and
STYLE, SETVAR and every system variable (workspace.md), and 3DORBIT (AutoCAD 2027's desktop, view/d04), `'ZOOM`, `'Z`, `'PAN`, `'P` (es `'ENCUADRE`, `'E`) typed mid-command at the command line or
in the tooltip — runs inside the running one as AutoCAD 2023's console runs it: its prompts headed
`>>` (`>>Specify first corner:`), echoed as typed (`Specify next point or [Undo]: 'z 'ZOOM`), then
`Resuming LINE command.` (es `Reanudando el comando LINEA.`) and the running command's question
again, its preview, box, selection set and undo step as they were (ZOOM Object asks a
`>>Select objects:` of its own, then refuses, view/p145; LINE's next point is still from its own
last point after `'ID` or `'DIST`); what the transparent one reports is not headed (`Distance = …`,
`Current osnap modes: End`; -LWEIGHT's `>>Current lineweight: >>BYLAYER` is, as the console writes
it); a change AutoCAD regenerates for (LTSCALE, ATTDISP) says `Regen queued.` (es
`La regeneración está en espera.`), and once the interrupted command ends `Regenerating model.`;
-VIEW's views turn the view, so transparently they say `** Requires a regen, cannot be transparent.`
(es `** Regeneración necesaria, no puede ser transparente.`) and change nothing; UNITS' modal
dialog resumes it once closed (workspace/p303); DIMSTYLE and STYLE, which ask nothing here (a
palette), run in place and the running command resumes at once; Escape cancels only the transparent one
(`>>Specify first corner: *Cancel*`), the Command menu's Cancel (^C^C) both, as U does; `'LINE` says
`** That command may not be invoked transparently **` (es
`** Este comando no funciona de forma transparente **`) before the prompt's own refusal, a second
`'ZOOM` inside one, or `'ZOOM` inside ZOOM, is refused as any answer, `'FOO` too, but a system
variable nests in a transparent command and anything transparent at a variable's prompt
(workspace.md, SETVAR); at the Command
prompt `'ZOOM` runs ZOOM (not transparently: an empty drawing's Extents says `Regenerating model.`),
`'LINE` and `'_LINE` are refused saying so, and `'FOO`, as `FOO`, says
`Unknown command "FOO".  Press F1 for help.` (es
`Comando "FOO" desconocido. Pulse F1 para obtener ayuda.`; the 2027 console);
`'AREA` and `'UCSICON` name the system variables, not the commands, there and mid-command, and
every other variable SETVAR knows is typed by its name (workspace.md, SETVAR). Above the line, the running command's temporary prompt history
(CLIPROMPTLINES 3: "displays above the command window while a command is in progress"; typed as a
variable from 0 to 50, program-wide, a step U takes back, workspace/p214, p218), which fades
once the command ends (after 6 s: AutoCAD documents no time); F2, or the arrow at its end, expands
the whole history up to 12 lines over the drawing ("a list of commands and prompts that you have
used to expand up … from the command line"), and Escape or a press on the drawing collapses it;
Ctrl+9 hides and shows it, from a field too, and it comes back while something is typed — WHY docked
into the workspace's grid: nothing floats on the drawing here, but it behaves as the floating
one-line window AutoCAD starts with (F2 opens the text window only on a docked one)

**Missing:** the questions of every command but LINE, PLINE, CIRCLE, ARC, RECTANG, POLYGON, ELLIPSE,
SPLINE, MOVE, COPY, STRETCH, ERASE, EXPLODE, JOIN, COPYCLIP, CUTCLIP, COPYBASE, ROTATE, SCALE,
MIRROR, OFFSET, TRIM, EXTEND, FILLET, CHAMFER, BREAK, BREAKATPOINT, ARRAY, ARRAYRECT, ARRAYPOLAR,
ARRAYPATH, HATCH, TEXT, MTEXT, the dimension commands, UCS, UCSICON, PLAN, ZOOM, -VIEW, LTSCALE,
-LINETYPE, -LWEIGHT, -COLOR, -OSNAP, ATTDISP, NAVVCUBE, ELEV, DIST, AREA, ID, VPOINT, PAN, TEXTEDIT,
ATTDEF, BLOCK, -INSERT, PASTECLIP and MATCHPROP (`Select objects:` and its counts, COPYBASE's
`Specify base point:` first) (the others show their name and keywords, `ATTEDIT:`, and write no
prompt lines), what was typed for a command's whole name or `_` and its global name (AutoCAD keeps
`line` and `_line` as typed; here they echo the command language's name — WHY: the landing's scripts
type `_CIRCLE` so that a Spanish reader sees CIRCULO), the text window (Ctrl+F2; TEXTSCR, es
PANTTEXT), COMMANDLINE / COMMANDLINEHIDE (es LINEACOM / OCULTARLINEACOM), floating, resizing, transparency and the window's Customize menu, the dynamic prompt's
Down-arrow list, the system variables SETVAR does not know yet (workspace.md, SETVAR's Missing),
**unverified** whether AutoCAD runs VIEW, LAYER, PROPERTIES, MATCHPROP,
BLOCKSPALETTE and EATTEDIT transparently (the console does not know them, or hangs on LAYER; refused
here), **unverified**: the prompt line's head while one runs (`'ZOOM >>Specify first corner:` here;
the console shows no head) and the dynamic prompt's `>>`, the selection modes `Expects a point or`
lists but `Select objects:` does not take (Group and Multiple; at a single object's
pick — BREAK's, UCS OBject's, ARRAYPATH's path — the others are taken, one object of what they
find), the last keyword AutoCAD 2023 leaves out of a single pick's list (`[Exit/Undo]` expects
`Exit`: an off-by-one, all are listed here); **unverified**: what the history writes for a length and an
angle typed in the tooltip's two fields (`100<45` here), and Insertion's `of` (every other snap's
`of` or `to`, es `de` / `a`, is 2027's: drafting-aids.md, Object snap overrides)

### Command names

**Implemented:** names and aliases of the command language (the engine's catalog), case-insensitive;
`_` plus the global name in every language, English included (`_LINE`); `'` before a transparent
one mid-command, and an unknown name's refusal (both under Command window); Enter/Space repeats;
autocomplete. While a command asks for a value or a point, what is typed there answers it —
coordinates absolute (the relative default is the tooltip's, DYNPICOORDS), `@` relative, `#` the
prompt's wrong answer, as the desktop's command window refuses it even with DYNMODE 3 (d02; the
tooltip takes it, d11) — and a
command name is no answer: it is not run; Enter or Space with nothing typed is the prompt's Enter. A
distance or an angle takes a point as well, typed or picked, as AutoCAD's input does: measured from
the prompt's base point (CIRCLE's radius to `25,20` is the point on the circumference; ROTATE's
angle; VPOINT's Rotate angles from the origin), or, with none, the first of two and then
` Specify second point:` — es ` Designe segundo punto:`, its leading space kept in the history: on a
line of its own after a typed first point, on the picked one's line after a pick
(`Specify fillet radius <0.0000>:  Specify second point:`), as the table's string has no new line —
(FILLET's radius, CHAMFER's distances, OFFSET's distance, RECTANG's and ELEV's elevation and
thickness, ARRAYRECT's spacings, ARRAYPOLAR's angles, DIMLINEAR's Rotated and every dimension's text
Angle, SCALE's reference length and Points' new length, ROTATE's reference angle and Points' new
angle), where a number or a keyword still answers the question and a wrong answer gets the
question's own refusal (`Requires numeric distance or two points.`) — AutoCAD 2023's console; after
a refusal at the second point an angle's two points start over under the same words
(transforms/p136, p158), a distance keeping its first, also where the command refuses what the two
measure in its own words (OFFSET's zero: offset/p140, p144); an angle is the line's heading in the
UCS (transforms/p143); a transparent command at the second point keeps the first (transforms/p204); the
line to the second point is amber and dashed, as ROTATE's and SCALE's on the desktop (transforms/d04-2,
d08-2), the other commands' **unverified**

**Missing:** the `.` prefix (`._LINE`, `_.ERASE`, which the 2027 console runs, erase/p04: refused
here as an unknown command, since nothing can be redefined), `_`
with a global alias (`_` selects global command names; aliases belong to each language's acad.pgp),
a compass letter at an angle prompt (2027 reads `S` at TEXT's rotation as 270°, text/p117; here
refused as no angle; N, E and W **unverified**, TEXT-D7)

### Keywords

**Implemented:** the abbreviation (the capitals of the word, anywhere in it), the whole word, or the
word's start as far as its first capital and on (`OB` for `Object`, `EXI` for `eXit`, `C` for
PLINE's `CEnter` before CLose is offered; not `E` for `eXit`, and a number is no keyword's start:
`3` at CIRCLE's first prompt is a point, not `3P`), case-insensitive; `_` plus the global
abbreviation or word (`_C`); typed at the prompt or into a value box and confirmed; the command
always receives the global id. An answer that starts several on offer, hidden ones included, and is
no one's abbreviation or word (`C` at PLINE's arc prompt, `CO` at ARRAYRECT's, `O` at UCSICON's and
ATTDISP's, `T` at TEXT's justifications) is `Ambiguous response, please clarify...` (es
`Respuesta ambigua, especifique...`) and the question which: `PLINE CEnter or CLose?`, every match
joined by `or` (`ON or OFF or ORigin?`; es `o`) and named in the words AutoCAD declares it with, in
their declared order — `TLeft or TCenter or TRight?` at TEXT's and ATTDEF's `[…/TL/TC/TR/…]`, whose
`TLE` is TLeft too, `OFf or ON?` at ATTDISP's `[Normal/ON/OFF]` (tables 21616, 25908; es
`SIZquierda o SCentro o SDerecha?`) —, answered by any keyword of the prompt (`CE`, `close`, `_CE`,
`A` for Angle) or asked again for one as ambiguous; Enter there is `Invalid option keyword.` (es
`Opción no válida.`) and the question again, anything else — `FOO`, a point typed or picked, an
object snap's name (`CEN`, although it starts `CEnter`) — the prompt's own refusal, and the prompt
again. An answer that reaches past the capitals of several is the first of them, without asking:
`TH`, `THR` at OFFSET's `Through` and hidden `Thru`, `CE`, `CENTR` at ELLIPSE's `Center` and hidden
`Centre` (es `CE` at POL's `cEntro`/`Cerrar` is cEntro). A keyword is its `initget` word, checked
against Autodesk's tables (en and es) at every prompt with keywords: where the prompt lists it
otherwise, the list keeps the listed form and the declared word is what is typed — SPLINE `Tangency`
at `[start Tangency]`/`[end Tangency]` (`TANGENC`), ELLIPSE `Included` (`INCLUDEDANGLE` refused),
PLAN `Current` (`CURRENTUCS` refused), SPLINE `Square`, HATCH `Select`, ATTDEF `Lock`, BREAK
`First`, ARC `Ce`, ARRAYRECT `Unit`, ARRAYPOLAR `Angle`, `Fill`, `ROTate`, ARRAYPATH `Align`,
`Fill`; es `Atravesar` at `[punto a Atravesar]` (`ATRAV`; `PUNTO` refused), `Actual` at
`[scp Actual/…]`, `cuaDrada`, `Tangencia`, `Incluido`, `Designar`, `Bloquear`, `Primer`, `Unidad`,
`ángUlo`, `Relleno`, `Girar`, `ALinear`, `Llenar`. Unlisted declared words: OFFSET's `Thru` (es
`Pun`), ELLIPSE's `Centre` (es `cEntro` at the elliptical arc's first prompt, ellipse/p111) and
the arc's measure in use, `Angle` or `Parameter` (ellipse/p114, p234), and PLINE's `LIne` in line mode and `ARc` in arc mode, which ask the
same prompt again; ARRAYPOLAR's `ROWs` (es `Filas`), not built and so refused, keeps `R` asking
`ROWs or ROTate?` (arrays/p210). At a point prompt an object snap's name is read before the keywords: `CEN`,
`CENT`, `CENTER`, `_CEN` at PLINE's arc prompt are the Center snap, not `CEnter`, and `CENTER` at
ZOOM's first prompt is the snap although it spells `Center` (es `CEN`, `CENTRO` at POL's arc prompt;
`E` names `cEntro`). AutoCAD 2023's console; the Spanish words from Autodesk's table, the Spanish
matches by the same rule (**unverified**: no Spanish console)

**Missing:** PLINE's and DIST's arc prompt keep the listed `CEnter` and `Second pt`: the console
asks `CEnter or CLose?` although the table declares `CE` and `Second` (es `Segundo`/`Segundopto`
**unverified**); FILLET's Spanish `[Radio]` at `Designe una polilínea 2D o` and the second object's
prompt keeps the listed word, which AutoCAD declares `RAdio` (only `R` differs, its hidden Trim's
there); a declared order other than the listed one is kept only where two offered words can be
ambiguous (TEXT, ATTDEF, ATTDISP, ARRAYPOLAR) — CIRCLE's `2P 3P Ttr`, ZOOM's, ROTATE's `Reference Copy`,
FILLET's and CHAMFER's orders have no such pair; unlisted declared words of options not built here:
VPOINT `Tripod`, FILLET's and CHAMFER's second-object
`Polyline`/`mUltiple`/`uNdo`/`Trim`, AREA `Entity`

### `Select objects:` · selection modes

**Implemented:** what every command that takes a set asks it with (`tools/objectSelection.ts`),
answered as AutoCAD 2023's console answers: a pick (`1 found`; of what lies in the pick box the
newest, however near the others: 2027's ERASE and TRIM, probes trim/p400–p403), Shift+pick removing, a window
clicked from a point on nothing (`Select objects: Specify opposite corner: 2 found`; left→right a
window, right→left a crossing), a press dragged on nothing a lasso, as 2027's PICKAUTO 5 draws it —
the dragged path closed, a window lasso if it sets off rightwards and a crossing lasso leftwards,
decided on its first stretch (a crossing released right of its press stays one, desktop
erase/d09-4), Space with the button held cycling Window → Fence → Crossing (d04), each said on a
line of its own in the place of the prompt's (`Window Lasso  Press Spacebar to cycle options`, es
`Ventana Forma irregular: pulse la barra espaciadora para recorrer las opciones.`), taking what
WPolygon, CPolygon or Fence would along it (a path that crosses itself as drawn), Shift at the press
removing, its count on the next line (`3 found, 5 total`, d09) —, what a window or a lasso under
way would take glowing as the hover does (SELECTIONPREVIEW 3, d02-1, d03-1, d05-1; ERASE's fading),
a point typed there — `@` from LASTPOINT, a number a
direct distance from it towards the cursor, LASTPOINT itself after — picking the object at it or, on
nothing, starting that window (a wrong opposite corner, a keyword or Enter says
`Invalid window specification.`, then the prompt the window started at, and asks the opposite corner
again on its line: `Select objects: Specify opposite corner:`,
`Remove objects: Specify opposite corner:`, ARRAYPATH's
`Select path curve: Specify opposite corner:`; a window of no size finds `0 found`), and the modes
typed there, never listed in its prompt — Window and Crossing whichever way they are drawn and BOX
by its direction (`Specify first corner:`, `Specify opposite corner:`, picked on one line:
`Specify first corner: Specify opposite corner: 2 found`; a wrong corner or Enter says
`Invalid window specification.` and asks the first corner again; `@` at a first corner is LASTPOINT
and a number there a direct distance from it, at an opposite corner both from the first corner,
LASTPOINT left as it was, erase/p149), Last (the
last object on a layer that is on), ALL (objects on layers that are off too), Fence
(`Specify first fence point or pick/drag cursor:`, `Specify next fence point or [Undo]:`), WPolygon
and CPolygon (`First polygon point or pick/drag cursor:`, `Specify endpoint of line or [Undo]:`;
`Invalid point, polygon segment is zero length.`,
`Invalid point, polygon segments cannot intersect.` for a point whose own edge crosses another and
for Enter while the closing edge does — the points kept, Enter refused again until Undo takes the
last back or a point mends it; a fence's point on the one before refused with the first of them too;
a number at their points a direct distance, the first from LASTPOINT, the next from the point
before, which `@` is from too — `@` at the first is LASTPOINT, p159, p160 —, LASTPOINT left as it
was), a fence's or polygon's wrong point
`Invalid response.`, Enter on a fence of one point or a polygon of two ending the selection,
Previous (the set the last command was given, selected before it too, EXPLODE's the pieces it made,
p236, p258; what a command erases leaves it for good, U bringing it back or not — after ERASE and
U, `No previous selection set.`, p111, p234 —, while U of a MOVE keeps it, p162, p240),
Remove (`Remove objects:`, which refuses as `Select objects:` does) and Add, Undo (the last
selection back, silently, at `Remove objects:` asking `Select objects:` again, p145, p156;
`All selections have been undone.` with none left), AUto (this prompt's
own behaviour), SIngle (the first selection that finds anything closes the set), and SUbobject and
Object where the set takes sub-objects — there `S` says `Ambiguous response, please clarify...` and
asks `SIngle or SUbobject?`, while in a set of whole objects — MIRROR's, JOIN's, STRETCH's, ZOOM
Object's, EXPLODE's, COPYCLIP's, the arrays', BLOCK's, whose refusals list no `SUbobject/Object`
(erase/p02, p138, p223, p251, p259, p260; CUTCLIP's does) — `S` is taken and does nothing, `SI`
being SIngle (p153, p154, p158; MIRROR's probed), and `SU` is refused —: in
SUbobject a pick, a window, a fence or a polygon finds `0 found` (no object
here has sub-objects), Last and ALL are refused with its own list
(`Window/Crossing/BOX/Fence/…/SIngle/SUbobject/Object`), Previous takes its set, and Object goes
back. Each says what it found on the line AutoCAD says it — after a pick on the prompt's line, after
a typed answer on a line of its own: `2 found (1 duplicate), 3 total`,
`1 found, 1 removed, 2 total`, the total once a selection has found anything (after Undo too, and
what was refused counts: `1 found, 0 total`, erase/p241); `0 found` on nothing stands alone, but a
find a command's filter empties (DIMSPACE's: no dimension) totals (`0 found, 0 total`, p244);
objects on a locked layer are counted, then left out: `1 was on a locked layer.`, and under it what
the command refuses, also left out (EXPLODE's `1 was not able to be exploded.`, p219); at `Remove
objects:` neither is said (p243, p247). A set selected before the command is counted on the line
of an alias's expansion or a macro's echo (`E ERASE 1 found`, the Delete key's `_.erase 1 found`),
on a line of its own after a name typed whole (`ERASE` / `1 found`, desktop erase/d11; console p01),
and sifted the same way — one on a locked layer, which `Command:` selects, counted and left out
(MOVE's `2 found` / `1 was on a locked layer.`, Previous holding the other, properties/p381), by
every command taking a set, as its own `Select objects:` leaves a window's locked finds out
(COPYCLIP's too, which changes nothing; ZOOM Object frames a preselection whole, counting nothing); with nothing left the command asks `Select objects:`, closing the set at
the first selection that adds something (EXPLODE's, p241, p242). The set is dropped as the command
ends or is cancelled, so the next one asks `Select objects:` — `(ssget "_I")` is nil after MOVE,
COPY, ROTATE, SCALE, MIRROR, STRETCH, JOIN, ARRAYRECT, EXPLODE, -BLOCK, and LINE, ID and ZOOM started
with one (p249–p251, p261, p262, p264), nothing selected after Escape (desktop d10) — but by COPYCLIP
of a preselection (p250; not of a set picked at its prompt, p263) and PASTECLIP, which leaves what it
pasted selected (p263); **unverified** whether a cancelled noun-verb command keeps its preselection
(dropped here, no probe reaches it). Enter on an empty set ends the
command silently, but EXPLODE's says `None found.` (p204, p205); es in Autodesk's table's words
(`Designe objetos`, `Elimine objetos`,
`1 encontrados (1 duplicados), 2 total`, `Designe primera esquina`,
`Designación de ventana no válida.`, `Precise primer punto del borde o designe/arrastre cursor`,
`Se han anulado todas las designaciones.`, `1 estaba en una capa bloqueada.`; the modes
Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Añadir/Eliminar/Previo/desHacer/AUto/úNico/Subobjeto/Objeto,
so `S` is Subobjeto there; after a global `_S` the question names the global words,
`SIngle o SUbobject?`, p130, p131)

**Missing:** Group (`Enter group name:`, `Invalid group name.`, p134) and Multiple (its picks
counted at Enter, `2 selected, 2 found`, p135); SUbobject's faces, edges and vertices and the Ctrl+pick that
selects them (no object here has sub-objects); a pick or a typed point on an object on a locked
layer (here it finds nothing and starts a window; AutoCAD says `1 found` / `1 was on a locked
layer.`, erase/p211, p257; at `Command:` it is selected, properties/d02-1); **unverified** whether
the commands that change nothing (COPYCLIP, ZOOM Object) leave locked finds out at `Select
objects:` as the edits do (the console never gave them one); a point typed there or at a single object's pick tests the whole
drawing, where AutoCAD tests only what the view shows (`No object found` off the screen, LASTPOINT
moved all the same: pieces/p158, p159; on it, p176); PICKFIRST (a set selected before the command is always taken; with
PICKFIRST 0 AutoCAD ignores it, erase/p230); the lasso `pick/drag cursor` offers at a fence's or
polygon's first point; PICKADD, PICKAUTO, PICKDRAG and SELECTIONPREVIEW as variables (their
defaults are the behaviour); the Previous set lasts the session, not the drawing

### Typed and confirmed

**Implemented:** a keyword runs on Enter or Space after it is typed, never on its letter alone, as
at AutoCAD's prompt (`C` Enter closes LINE; run on its letter, the Enter then repeated LINE); the
box's chips show each abbreviation

**Missing:** the dynamic prompt's Down arrow list of options, clicking a keyword in the command line

### Undo · `U` · `UNDO` · `REDO` · `MREDO` · Ctrl+Z / Ctrl+Y

**Implemented:** one step per command: what a command draws and sets folds into one ("The effects of
the last command (Line) will be undone, removing all 3 of the lines created by it"); a command that
changed nothing is a step too, which U and REDO name and which takes nothing back: ID, an ERASE or
MOVE of an empty set, -COLOR kept with Enter, a command cancelled (move/p07, p233, p235, p237), a
view command that leaves the view (view/p364–p369), but not UNDO and MREDO cancelled (p239,
p240); Ctrl+Z inside a
command is acad.cuix's `_u` typed at its prompt and written so
(`Specify next point or [Close/Undo]: _u`), and the command goes on: LINE's Undo keyword ("only the
previous line segment is undone because you are still in the Line Command"), a refusal where the
prompt has no Undo (`Invalid point.` at LINE's first point, `Requires numeric distance or second
point.` at `Length of line:`; desktop d09, probes p103, p115); from the Quick Access Toolbar the
running command ends first and goes whole ("Click Undo on the Quick Access toolbar to cancel the
entire series of line segments"); U (a command of its own, es `H`) writes what it took back, as
AutoCAD 2023's console does: the command's name as echoed (`LINE` for `L`, `-LAYER`, `AUPREC`),
`LTSCALE Regenerating model.` for one that regenerated (LINE with a transparent LTSCALE in it too,
and -VIEW, VPOINT and PLAN only when they turned the line of sight, never ZOOM: view/p337, p339,
p340–p343, p349, p350), an edit made outside a command by where it was made — `CHPROP` (es `CAMBPROP`) for
the top bar's drop-downs on objects, `Modify Property` for the Properties palette, `Grip Edit` (es
`Editar pinzamiento`) for a grip, `'CLAYER` for the current layer from a drop-down, nothing for
CECOLOR, CELTYPE or CELWEIGHT set from one (desktop properties/d05-1 to d05-3b, arrays/d14, d20;
`properties.md`) —, and with nothing left `Everything has been undone`, then `Nothing to undo`; REDO
only right after a U that took something back, writing the command's name
(`LTSCALE Regenerating model.` while more is left to redo), then `Everything has been redone` once
nothing is and `Regenerating model.` last; what ZOOM, PAN, -PAN, -VIEW, VPOINT, PLAN and 3DORBIT do
to the view is part of their step, or an entry of the command a transparent ZOOM or -PAN ran in,
which its Undo keyword takes back too (view/p358–p360); the wheel, the wheel button and the ViewCube
are steps of their own at the Command prompt (`INTELLIZOOM`, `INTELLIPAN`, `'.VIEWCUBEACTION`,
`GROUP menu item`) and entries of the running command inside one (desktop view/d01, d02, d05;
`workspace.md`, `view.md`);
otherwise `REDO must immediately follow the U or UNDO command.`, or `Nothing to redo` once another
command ran or nothing is left; UNDO says
`Current settings: Auto = On, Control = All, Combine = Yes, Layer = Yes` and asks
`Enter the number of operations to undo or [Auto/Control/BEgin/End/Mark/Back] <1>:`
(`Requires an integer between 1 and 32767, or option keyword.`): a number takes back that many,
their names on one line (`CIRCLE LINE`, then `Everything has been undone` if it ran out); Mark
leaves a place that Back, U and a number stop at (`Mark encountered`), which then goes and REDO puts
back silently; Back with no mark asks `This will undo everything. OK? <Y>` (`Yes or No, please.`);
BEgin (and the unlisted Group) and End make one step of the commands between them, which U names
`GROUP CIRCLE LINE` and REDO `GROUP LINE CIRCLE`, their marks dropped, an empty one `GROUP`; while
one is open, U, a number and Back stop at its start (`Start of Group encountered.` /
`Must enter UNDO END to go back further.`) and Back asks nothing; BEgin with one open closes it and
leaves a step U takes back without a word before the new one (`GROUP CIRCLE`, then nothing, then
`GROUP LINE`); Control asks `Enter an UNDO control option [All/None/One/Combine/Layer] <All>:` (es
`Indique una opción de control DESHACER [Todas/Ninguna/Una/Combinar/CApa] <Todas>`;
`Invalid option keyword.`; Enter is All): None and One drop every step kept and turn Auto off, All
turns it back on; with None nothing is kept — U says
`U command disabled.  Use UNDO command to turn it on`, REDO
`REDO command disabled. Use UNDO C to turn it on.`, MREDO asks nothing and says
`REDO and MREDO commands disabled. Use UNDO C to turn it on.` (es from the table:
`Comando H desactivado. Utilice el comando DESHACER para activarlo`,
`Comando REHACER desactivado. Usar DESHACER C para activarlo.`), a command's own Undo steps its
prompt back and leaves what it drew, and UNDO asks Control at once; with One only the last step is
kept (no ZOOMs joined) and UNDO asks `Enter an option [Control] <1>:`
(`Requires an integer value 1, or option keyword.`; es `Indique una opción [Control] <1>`,
`Requiere un valor 1 entero, o una opción.`); Combine's
`Combine zoom and pan operations? [Yes/No] <Yes>:` and Layer's
`Combine layer dialog operations? [Yes/No] <Yes>:` offer Yes whatever the setting
(`Yes or No, please.`; es `¿Combinar operaciones de zoom y encuadre? [Sí/No] <Sí>`,
`¿Combinar operaciones de cuadro de diálogo de capa?`), and with Combine No each ZOOM is its own
step, with Layer No each edit of the Layer Properties Manager (p315; with Yes consecutive ones are
one step, `'.-LAYER '.-LAYER`, desktop d04-3, `properties.md` Layers); Auto's `Enter UNDO Auto mode [ON/OFF] <On>:` offers the setting (es
`Indique modo automático de DESHACER [ACT/DES] <ACT>`); the settings line says them all (es
`Auto = Des, Control = Ninguna, Combinar = No, Capa = Sí`), per drawing and not saved, so NEW and
OPEN bring `Auto = On, Control = All, Combine = Yes, Layer = Yes` back (UNDOCTL, rectang/p305); once None or One has dropped the steps
AutoCAD's own start puts beneath the first command, taking back the last one says
`Everything has been undone` at once; a U that finds nothing leaves REDO the undo before it; REDO
does the whole last undo again; MREDO (es `MREHACER`) asks `Enter number of actions or [All/Last]:`
(es `Indique número de acciones o [Todas/úLtima]`; UNDO's refusal; Enter is 1, though the prompt
shows no default) and does that many of the steps the undos took back again, whatever U, UNDO, REDO
and MREDO ran since, writing them as REDO does (a mark silently), All all of them, Last the last
undo's whole, once (`The last UNDO operation has been already redone.`, es
`Ya se ha repetido la última operación DESHACER.`); after an undo that found nothing Last says
nothing, and a number or All with nothing to redo `Everything has been redone`; any other command,
even one that changes nothing (LIST, ID, ZOOM), leaves nothing to redo (`Nothing to redo`); Ctrl+Y
and the shortcut menu's Redo run acad.cuix's `^C^C_mredo 1`: the running command cancelled, then
MREDO answered `1`, both written; es
`Indique el número de operaciones a deshacer o [Auto/Control/Inicio/Fin/Marca/Retorno] <1>`,
`Marca encontrada`, `GRUPO`, `Esto lo deshará todo. ¿De acuerdo? <S>` (`Sí o No.`), the refusal
`Requiere un nº entero entre 1 y 32767, o una opción.`; the shortcut menu's
Undo runs U (acad.cuix's `^C^C_u`), and so does Ctrl+Z at the Command prompt (`_u`), writing what U
writes; es from the table (`Ya se ha deshecho todo`, `Todo repetido`, `Nada que repetir`,
`REHACER debe ir directamente a continuación del comando H o DESHACER.`,
`No hay nada que se pueda deshacer`)

**Missing:** what Auto joins (WHY: Auto makes one step of a menu macro's commands, and no menu here
runs more than one), Combine
and Layer from one session to the next (AutoCAD keeps them in the registry, as its console shows;
here they last the session, as the running object snaps do); what the top bar's buttons write (nothing here; AutoCAD's are the Quick Access Toolbar's own, not
macros); Ctrl+Shift+Z still redoes, silently, though AutoCAD binds nothing to it
