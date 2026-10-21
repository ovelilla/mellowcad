# LINE review

> **Status:** done, 2026-10-21 — reviewed, approved by the owner and executed overnight with skill
> `command-review`, the first review of `docs/coverage/roadmap.md`'s order. The full plan (matrices,
> findings, refuted suspicions, rules ↔ code) is in git: `git show 16b4188:docs/plans/line-review.md`.

## Summary

7 high, 24 medium and 28 low findings over thirteen blocks, all executed; none lost or corrupted
data. LINE now behaves as AutoCAD 2027's console and desktop show it at every prompt probed, and
the areas LINE owns — the catalogs, the command line, undo, point input, object snaps, tracking,
dynamic input, current properties, grips and the palette, files and render — were reviewed in
full. Evidence: about 120 console probes in es-ES and en-US and two desktop passes with the
owner's mouse; every test that reproduces AutoCAD cites its probe.

## Probes

Console inputs are `scripts/research/probes/line/<id>.txt` (`.plain.txt` runs untraced, for undo
depth), run with `scripts/research/probe.sh line <ids>` in es-ES and en-US; desktop ones are
`<id>.sh`. Transcripts are in `research/probes/line/` (gitignored).

| Id | What it asks |
| --- | --- |
| p01 | three points then Enter; es `Precise siguiente punto o [Cerrar/desHacer]` from the second segment |
| p02 | Undo at each depth to nothing (`All segments already undone.`, then `Specify first point:`) |
| p03 | Close after two segments; LASTPOINT |
| p04 | Close after one segment: `Point or option keyword required.` |
| p05 | Enter at the first point with nothing drawn: `No line or arc to continue.` |
| p06 | Continue from a line |
| p07 | Continue from an arc drawn 0,0 → 50,50 → 100,0: `Length of line:`, the line from (100,0) |
| p08 | Continue: FOO, `0` (`Zero length line created at (…)`), a negative direct distance |
| p09 | FOO at each prompt (`Invalid point.` / `Point or option keyword required.`); `0` at the next point |
| p10 | es only: LINEA, `H`, `C` |
| p11 | `'_LINE` at CIRCLE's prompt: `** That command may not be invoked transparently **` |
| p12 | Enter at `Command:` repeats LINE (echo `LINE`) |
| p13 | LASTPOINT after Enter and after an Undo |
| p14 | `@` at the first point; `@` at the next (zero-length line) |
| p15 | `x,y,z`, `@dx,dy,dz`, `d<a` (Z 0), `@d<a`, `#x,y` (refused), `*x,y` |
| p16 | UCS Z 30: `@`, `*`, `d<a` read in the UCS |
| p17 | a bare number (the console's cursor is a fixed pixel) |
| p18 | `<30` (`Angle Override: 30`) then a number — settle on the desktop |
| p19 | `'ZOOM E` in an empty drawing (`** Requires a regen, cannot be transparent.`), `'ORTHOMODE`, `'-OSNAP`, `'CIRCLE`; `Resuming LINE command.` |
| p20 | U, REDO, UNDO 2, MREDO 1 after LINE |
| p21 | CLAYER, CECOLOR 1, CELTYPE HIDDEN, CELWEIGHT 50, CELTSCALE 2, ELEVATION 5, THICKNESS 3 (en-US only: es has no HIDDEN) |
| p22 | UCS X 90: the line's Normal is the UCS's Z |
| p23 | `_C` at the first point, `_CLOSE` at `[Undo]` |
| p24 | deferred Tangent, Tangent–Tangent, deferred Perpendicular |
| p25 | `_END`, `_MID` with a typed point |
| p26 | `@` in a new drawing (0,0,0) |
| p27 | `@10<-45`, `@10<450`, `@-10<0` |
| p28 | DYNMODE 3 in the console: `#5,5` still refused |
| p29 | ORTHOMODE 1 and a bare number |
| p30 | LUNITS 4: `1'6",0` |
| p31 | ELEVATION 5: `@0,0,3`, then a 2D point back at Z 5 |
| p32 | CEN, QUA, NEA, INT, APP, PER, NON: `of` / `to` |
| p33 | es only: FIN, MED, CER, NIN (`de` / `a`) |
| p34 | FROM: `Base point:`, `<Offset>:`; Enter at `<Offset>` is LINE's Continue |
| p35 | M2P: `First point of mid:`, `Second point of mid:` |
| p36 | an override that finds nothing: `No Endpoint found for specified point.`, `Invalid point.` |
| p37 | -OSNAP: Enter clears to 0; no `Current osnap modes` line when empty |
| p38 | SNAP's prompt and keywords |
| p39 | `_L`, `_.LINE`, `line`, `L`, `LINE` and their echo |
| p40 | `FOO`, `'FOO`, `'_ZOOM`, `'_LINE` at `Command:` |
| p41ᵖ | U ×4 (`Everything has been undone`, `Nothing to undo`), REDO after each |
| p42ᵖ | UNDO Mark/Back, REDO, BEgin/End (`GROUP CIRCLE LINE`) |
| p43ᵖ | UNDO Control None and its messages; Combine refusals |
| p44 | UCS X 90 and THICKNESS 3 |
| p45 | -LAYER Make and Color |
| p60 | FILLET radius too large; CHAMFER |
| p61 | FILLET of non-coplanar lines: `Lines are non coplanar.` |
| p62 | ARRAYPOLAR Items |
| p63 | ARRAYRECT Spacing: es `Especificar la distancia entre columnas o [célula de Unidad]` |
| p64 | -TEXT Justify: es `SIZ/SC/…` |
| p65 | SPLINE Knots: es `[Cuerda/raíz cuaDrada/Uniforme]` |
| p66 | -HATCH: es `[Propiedades/Designar objetos/…]` |
| p67 | PLAN: `[Current ucs/Ucs/World]`, es `[scp Actual/SCP/Universal]` |
| p68 | HATCH: es `[Seleccionar objetos/eliminar Contornos]` |
| p69 | ARRAYPATH Items: es `Introduzca el número de elementos o` |
| p100ᵖ | UNDO 2, UNDO Enter |
| p101 | Control None and LINE's own Undo, dumped |
| p102 | Continue with −30 |
| p103 | `_U`/`_UNDO` at the first point, `_LINE` at the next |
| p104 | es only: `L`, `linea`, `_.LINEA` |
| p105ᵖ | Enter after an unknown command |
| p106ᵖ | UNDO refusals |
| p107ᵖ | REDO and MREDO right after a command; MREDO All, Last |
| p108ᵖ | Undo back to nothing, a new chain, U/REDO |
| p109ᵖ | UNDO Back with no mark |
| p110ᵖ | UNDO 2, REDO |
| p111ᵖ | UNDO One |
| p112 | `'ZOOM E` and `'ZOOM A` with objects |
| p113ᵖ | MREDO refusals and Enter |
| p114 | Enter at `Length of line:`: `Requires numeric distance or second point.` |
| p115 | Undo after Continue's tangent line: back to `Length of line:` |
| p116 | Continue from a PLINE ending in an arc, and from a closed one |
| p117 | `'LTSCALE 2` then LINE's Undo: LTSCALE back to 1 and the segment erased |
| p118 | `'-COLOR 1` then LINE's Undo |
| p150 | number forms inside a point (`1e1`, `1/2`, `1-1/2`, `.5`, `5.`) |
| p151 | angle forms (`30d`, `30d30'`, `0.5r`, `50g`, `N45dE`); cylindrical, spherical |
| p152 | `@*`, `*d<a`, `*x,y` in a turned UCS with ELEVATION 5 |
| p153 | `*x,y` in a tilted UCS |
| p154 | FROM: typed base, `@`, bare `x,y`, a bare number, an override at the base, FROM at the next point |
| p155 | -OSNAP: OFF, Enter, NON, ENDP/QUI, a list with FOO |
| p156 | echo of `_EXT`, `_PAR`, `_APPINT`, `_ENDP`, `_NEAR`; those that find nothing |
| p158 | SNAP: prompt, answers, refusals, Aspect, transparent |
| p159 | a number at the first point (from LASTPOINT) |
| p160 | Ortho with a number at the first point and with typed points |
| p161 | `<a` at the first point, a coordinate after it, a second override |
| p162 | Ortho with an override; a second override at `of` |
| p163 | `*` with ELEVATION 5; -OSNAP `_ENDP` / `_QUI` / `_APPINT` |
| p164 | Enter at `<Offset>` at the next point; LASTPOINT |
| p165 | a snap against `<a`; bare `1/2`, `0x10`, `1e1` |
| p166 | defaults of the drafting-aid variables (APERTURE 10, AUTOSNAP 63, POLARANG 90…) |
| p200 | `-COLOR Truecolor 255,0,0` against index 1 |
| p201 | a locked current layer |
| p202 | DASHED, HIDDEN, CENTER, PHANTOM, DASHDOT from acadiso.lin (`tblsearch`) |
| p203 | the same from acad.lin |
| p204 | defaults: LWDISPLAY 0, LTSCALE 1, CELTSCALE 1, LWDEFAULT 25 … |
| p205 | `-LINETYPE ?`: `<acadiso.lin>`, paging; es names `LÍNEAS_OCULTAS`, `CENTRO`… |
| p206 / p207 | plot to PNG (es-ES / en-US): dashes laid along lines of 100, 20, 5; CELTSCALE 2; DASHDOT |
| p208 | dead end: `dumpallproperties` is not defined in the console |
| p209 | `'ZOOM` All and Extents transparently with nothing drawn: `** Requires a regen, cannot be transparent.` |
| p210 | `'ZOOM 2` and `2X` transparently with nothing drawn: they zoom |
| p211 | FROM at `Command:` (unknown), FOO, U and Enter at `Base point:` and `<Offset>:`, an override at `<Offset>`, INT on one object |
| p212 | SNAP Aspect: snap on, the default becomes `<A>` (es `<asP>`), Enter opens Aspect |
| p213 | SNAP Aspect's spacings refuse FOO with `Requires numeric distance or two points.` |
| d02 | desktop, DYNMODE 3, typed at the command line through COM: `10,0` absolute, `#30,30` refused |
| d03–d20 | desktop, Spanish profile, the owner's mouse (`dsk.sh`): picks, the rubber band, the snap marker, both shortcut menus, Escape, Ctrl+Z, F-keys, dynamic input, Ortho, Polar, OTRACK, the angle override, grips, the palette, a double-click, the wheel, the ribbon, the rollover (§4, DSK) |

An INS override probe (TEXT then `_INS`) hung the console at TEXT's prompt and was dropped; INS's
echo stays unverified.

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| CAT-01 | en `Lines are non-coplanar.` is 2027's `non coplanar` | fixed | `4f61e91` |
| CAT-02 | ARRAYRECT's Spanish spacing prompt | refuted (p70) | `4f61e91` |
| UND-01 | es `Nada que deshacer` | `No hay nada que se pueda deshacer` | `626b283` |
| UND-02 | es integer refusals without the comma | fixed | `626b283` |
| UND-03 | Ctrl+Z mid-command ended it and undid the previous one | `_u` typed at the prompt | `626b283` |
| CLI-01 | unknown command without `Press F1 for help.` | AutoCAD's whole line | `2625477` |
| CLI-02 | `'ZOOM E` with nothing drawn ran | refused, `** Requires a regen…` | `2625477` |
| CLI-03 | stale coverage on transparent commands | fixed | `2625477` |
| LIN-01 | LINE's Undo after `'LTSCALE` / `'-COLOR` left the segment | history marks, `ctx.undoTo` | `6a3ba75` |
| LIN-02 | Continue from a clockwise arc left its far end | LASTPOINT tells the drawn end | `6a3ba75` |
| LIN-03 | Continue from a polyline ending in an arc | asks `Length of line:` | `6a3ba75` |
| LIN-04 | Enter at `Length of line:` ended LINE | refused | `6a3ba75` |
| LIN-05 | Undo after Continue's line | back to `Length of line:` | `6a3ba75` |
| LIN-06 | Undo of the first point was silent | `All segments already undone.` | `6a3ba75` |
| LIN-07 | typed zero-length segments skipped | drawn, counted, reported | `6a3ba75` |
| LIN-08 | es `[Cerrar/desHacer]` prompt | `Precise siguiente punto o` | `6a3ba75` |
| LIN-09 | `#x,y` at the command line | refused (with PIN-02) | `bb1b4a4` |
| PIN-01 | `*` point without a Z took ELEVATION | WCS Z 0 | `bb1b4a4` |
| PIN-02 | `#` typed in the command window accepted | refused; the box keeps it | `bb1b4a4` |
| PIN-03 | `1e1`, `1/2`, `1-1/2` refused | read | `bb1b4a4` |
| PIN-04 | `30d`, `0.5r`, `50g`, `N45dE` refused | read | `bb1b4a4` |
| PIN-05 | `0x10` read as 16 | refused | `bb1b4a4` |
| PIN-06 | a second `<a` replaced the first | refused, drops the first | `bb1b4a4` |
| OSN-01 | a typed point after an override not snapped | snapped | `e383cc7` |
| OSN-02 | an override finding nothing placed the cursor's point | refused, consumed | `e383cc7` |
| OSN-03 | FROM's typed base skipped FROM | goes through FROM | `e383cc7` |
| OSN-04 | FROM's prompts were messages | `Base point:`, `<Offset>:` | `e383cc7` |
| OSN-05 | Enter at `<Offset>` placed the base | the running prompt's Enter | `e383cc7` |
| OSN-06 | a number at `<Offset>` ran from LASTPOINT | from the base | `e383cc7` |
| OSN-07 | `_FRO` refused | taken | `e383cc7` |
| OSN-08 | -OSNAP Enter kept the set | clears it | `e383cc7` |
| OSN-09 | -OSNAP wrote `None` | no line | `e383cc7` |
| OSN-10 | `_APPINT` refused | taken | `e383cc7` |
| OSN-11 | a second override at `of` replaced the first | refused | `e383cc7` |
| OSN-12 | stale WHY and coverage on prepositions | settled | `e383cc7` |
| TRK-01 | SNAP a toggle of our own | AutoCAD's SNAP (spacing, ON, OFF, Aspect) | `399a448` |
| TRK-02 | ORTHOMODE and the aids' variables not typeable | Missing, until SETVAR | `399a448` |
| TRK-03 | F3–F11 wrote no echo | ` <Ortho on>`… in en and es | `399a448` |
| RND-01 | invented linetype patterns | acadiso.lin's | `5e4ba72` |
| RND-02 | dash pattern not centred | centred, solid under one period | `5e4ba72` |
| RND-03 | LWDISPLAY on without a WHY | WHY and note | `5e4ba72` |
| CPR-01 | true colour read back as index colour | Missing | `7ba4cc2` |
| CPR-02 | -LINETYPE named acad.lin | acadiso.lin | `7ba4cc2` |
| CPR-03 | Spanish acadiso.lin names | Missing (names stay data) | `7ba4cc2` |
| DYN-01 | dynamic input cannot be turned off | Missing | `4b15a28` |
| DYN-02 | the Down arrow listed nothing | AutoCAD's option list | `4b15a28` |
| DSK-01 | rubber band a fixed colour | the line's colour | `6a9591f` |
| DSK-02 | snap menu order and groups | AutoCAD's | `6a9591f` |
| DSK-03 | es `Modificaciones de REFENT` | fixed; menu order settled | `6a9591f` |
| DSK-04 | es `*Cancelado*` inside a command | fixed | `6a9591f` |
| DSK-05 | the rail wrote no echo | `Command: _line` | `6a9591f` |
| DSK-06 | no rollover tooltip | added | `6a9591f` |
| DSK-07 | the aids' look | AutoCAD's dark theme | `6a9591f` |
| DSK-08 | snap aperture 8 px | 10 px | `6a9591f` |
| EDT-01 | a line's end grip lengthened | stretches to the cursor | `500fff9` |
| EDT-02 | a midpoint grip moved the whole selection | moves its object | `500fff9` |
| EDT-03 | Length and Angle editable | read-only | `500fff9` |
| EDT-04 | a vertical line's grips on its start | at its ends and middle | `500fff9` |
| EDT-05 | a rising line's ends could not meet in plan | allowed | `500fff9` |
| EDT-06 | palette labels and groups | one Geometry group, `Delta X` | `500fff9` |
| FIL | a line's properties through files untested | tested | `16b4188` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the
points worth a later probe:

- the desktop: Shift's temporary Ortho (a synthetic Shift does not reach it), Extension, Parallel
  and Insertion hovered, the modes table's pairs with dynamic input, Escape during FROM, the
  rollover's delay, which of the snap tooltip and the dynamic-input box yields, and the echo of
  the other palette entries;
- the console: INS's override echo (the probe hung), what Enter does with the option list open
  and nothing marked, an F-key's echo inside a command.

Analogues for the reviews that own them (roadmap rows 2–25): the own Undo of PLINE, OFFSET, COPY,
FILLET, CHAMFER, TRIM, EXTEND, DIMBASELINE, DIMCONTINUE and TEXTEDIT still call `ctx.undo()` (a
transparent command between two commits breaks them as LIN-01 broke LINE; `ctx.undoTo` is the
fix); `lastDrawnDirection` and `lastDrawnPoint` still read a clockwise arc's stored end (LIN-02);
the other commands' ghosts keep the theme's colour (DSK-01); polylines, arcs and circles lay their
linetype from the start (RND-02); F4's echo.

## Template improvements

Applied on 2026-10-21 (template §9): subagents probe and run scratch tests in ranges of their own;
undo-depth probes untraced; a trailing Enter repeats; desktop typing through COM, keystrokes after
a click; `es-several` and `no-source` per command; pointer gestures, the look, every object snap
three ways and the modes in combination in the matrix. After the execution, confirmed by the owner and applied:
one subagent per block, the reviewer committing; an unused catalog key stays; every session ends
with the next one's prompt.
