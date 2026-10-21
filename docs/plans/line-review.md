# LINE review

> **Status:** approved by the owner on 2026-10-21, with leave to run it overnight; executing block by
> block. First review of the order in `docs/coverage/roadmap.md` ("Command reviews"), with skill
> `command-review`.

## 1. Summary

| Severity | CAT | LIN | CLI | UND | PIN | OSN | TRK | DYN | CPR | EDT | FIL | RND | DSK | Total |
| -------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ----- |
| Critical | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0     |
| High     | 0   | 2   | 0   | 0   | 0   | 2   | 1   | 0   | 0   | 1   | 0   | 1   | 0   | 7     |
| Medium   | 0   | 5   | 0   | 1   | 4   | 6   | 1   | 1   | 0   | 2   | 0   | 2   | 2   | 24    |
| Low      | 1   | 2   | 3   | 2   | 2   | 4   | 1   | 1   | 3   | 3   | 0   | 0   | 6   | 28    |

No finding loses or corrupts a drawing: every mutation goes through a command, the file round-trips
every property a line holds, and undo never drops objects. The seven highs are gestures an AutoCAD
user makes daily that end elsewhere here:

- **The command itself:** LINE's Undo after a transparent `'LTSCALE` or `'-COLOR` leaves the
  segment drawn (LIN-01), and Continue from an arc drawn clockwise leaves its far end (LIN-02).
- **The input pipeline:** an object snap override that finds nothing places the cursor's point
  instead of refusing (OSN-02); FROM with a base typed at the command line is skipped and stays
  pending (OSN-03); SNAP is a toggle of our own where AutoCAD asks the spacing (TRK-01).
- **The object:** every linetype's dashes are invented rather than acadiso.lin's (RND-01), and a
  line's end grip lengthens where AutoCAD's stretches (EDT-01, confirmed on the desktop).

The catalog sweep against the 2027 tables found the update's rewording already handled: no
catalog string is the release's language pack any more (DIMANGULAR was the one; DIMORDINATE is not
implemented). One other wording differs (CAT-01).

## 2. Inventory

Reviewed on 2026-10-21 over `4ba363f`, AutoCAD 2027 (ACADVER 26.0, `_VERNUM` X.118.0.0), string
tables regenerated 2026-10-20. Baseline green: the 36 test files in scope pass.

**The command's own surface:** `cad/application/tools/LineTool.ts` and what it imports
(`lastDrawnPoint.ts`, `deferredSnap.ts`, `directDistance.ts`, `currentProperties.ts`,
`ucsHeading.ts`); `defaultTools`, `TOOL_COMMANDS`; LINE's keys in `cad/locales/en.json`,
`es.json`, `ar.json`; the rail's entry; `content/commands.ts`; the coverage entry in
`docs/coverage/draw.md`; `LineTool.test.ts`, `locale.test.ts`, `englishSurface.test.ts`,
`currentProperties.test.ts` and every test that runs LINE.

**Related tools:** U, UNDO, REDO, MREDO; -OSNAP, FROM, SNAP; ARC and PLINE as what Continue reads;
the current-property commands as far as LINE's object goes; grips and the Properties palette for a
line; QSAVE, OPEN, NEW and the autosave for a line.

**Areas this review owns** (roadmap row 1), each a block: the catalogs (CAT), the command line
(CLI), undo (UND), point input (PIN), object snaps (OSN), Ortho, Polar, OTRACK and snap mode (TRK),
dynamic input (DYN), current properties (CPR), grips and the palette (EDT), files (FIL), render
(RND). None was owned before.

**Method:** the reviewer ran the console probes p01–p69 and the desktop, then three read-only
subagents reviewed LIN/CLI/UND, PIN/OSN/TRK/DYN and CPR/EDT/FIL/RND against them, each running
probes in its own id range (p100–p118, p150–p166, p200–p208) and scratch harness tests in
`research/review/line/` (gitignored; 230 tests, 92 failing, each failure a `differs`). The
reviewer verified every high in person: LIN-01 and LIN-02 (scratch tests and p117, p07), OSN-02,
OSN-03 and TRK-01 (scratch tests and p36, p154, p158), RND-01 (`cad/domain/linetypes.ts` against
p202). OSN-01 was downgraded from high to medium (typing a coordinate after an override is a
script idiom more than a gesture).

**The desktop, first pass, could not be driven by keys:** AutoCAD was in the foreground and `SendInput`
injected the keys, but the keyboard focus sat on an inner window and no key reached a prompt,
Unicode or virtual (SetFocus from outside did not move it); a real click in the drawing area gives
the focus, and that needs the owner's mouse. So the jig, dynamic input's tooltip, Escape and the
right button, grips and the palette rested on Autodesk's help. The owner then lent the mouse for
block DSK (§4): a click in the drawing area gives the focus, and the keys and clicks reach AutoCAD. COM's SendCommand still works for what is typed
at the command line (d02). A launched instance may open another language's profile with settings
of its own (the second one had DYNMODE 3): read and restore per instance.

## 3. Probes

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
| d02 | desktop, DYNMODE 3, typed at the command line through COM: `10,0` absolute, `#30,30` refused |
| d03–d20 | desktop, Spanish profile, the owner's mouse (`dsk.sh`): picks, the rubber band, the snap marker, both shortcut menus, Escape, Ctrl+Z, F-keys, dynamic input, Ortho, Polar, OTRACK, the angle override, grips, the palette, a double-click, the wheel, the ribbon, the rollover (§4, DSK) |

An INS override probe (TEXT then `_INS`) hung the console at TEXT's prompt and was dropped; INS's
echo stays unverified.

## 4. Matrix

Columns, where they differ: **FP** first point · **NU** next point `[Undo]` · **NC** next point
`[Close/Undo]` · **LL** `Length of line:` after Continue. A cell is `state · probe · test`; scratch
tests are named by what they assert. A row the same everywhere takes one cell.

### CAT — the catalogs against the 2027 tables

`node scripts/research/catalog-sweep.mjs` over every key of `commands`: 403 ok, 9 es-differs, 103
es-several, 17 en-near, 11 plural, 121 no-source, no es-2027 and no en-2027. Each non-ok state
the tables can settle was probed:

| Key | State | AutoCAD | Outcome |
| --- | --- | --- | --- |
| `linesNonCoplanar` | en-near | p61 `Lines are non coplanar.` | **CAT-01** |
| `specifyDistanceBetweenColumns` | es-differs | p70: COLumns asks `Especifique la distancia entre columnas o [Total/Expresión]`; Spacing's `Especificar …` (p63) is `specifyDistanceBetweenColumnsOfCell` | refuted |
| `specifyNumberOfItemsOr` | es-differs | p69 `Introduzca el número de elementos o` | refuted |
| `keywordLabels.TEXT.TL` | es-differs | p64 `SIZ` | refuted |
| `keywordLabels.SPLINE.Square root` | es-differs | p65 `raíz cuaDrada` | refuted |
| `keywordLabels.HATCH.Select objects` | es-differs | p66 `Designar objetos` (the tool follows -HATCH) | refuted |
| `keywordLabels.PLAN.Current ucs` | en-near | p67 | refuted |
| `filletRadiusTooLarge` | no-source (table 22013 `too big`) | p60 `Fillet radius is too large` | refuted |
| `matchpropSource` | es-differs | table 33551 `Designe objeto de origen`; the console lacks MATCHPROP | unverified, left to review 16 |
| `otherCorner`, `lengthen`, `trackingOffset`, `rows`, `items` | es-differs / en-near | dynamic-input labels with no table string | unverified, per command |
| `unknownCommand` | en-near | p40 | CLI-01 |
| `specifyNextPointOr` (LINE) | es-several | p01 | LIN-08 |
| `requiresIntegerValueOrKeyword`, `requiresIntegerBetweenOrKeyword` | composed | p106, p111, p113 | UND-02 |

`es-several` and `no-source` need the console prompt by prompt: the sweep cannot tell which id a
prompt uses, so each command's own review settles its keys (row K), as this one does for LINE.

### LIN — the command

| Row | FP | NU | NC | LL |
| --- | --- | --- | --- | --- |
| A invocation | match · p39, p104 · `locale.test.ts:355` | | | |
| B text en | match · p01 · `LineTool.test.ts:452` | match · p01 · `:466` | match · p01 · `:470` | match · p07 · `:531` |
| B text es | match · p01 | match · p01 | **LIN-08** · p01 | untested · p07 |
| B keywords | n/a | match `desHacer`/`Undo` · p01 | match · p01 · `:145` | n/a |
| B `FOO` | untested · p09 | untested · p09 | untested · p09 | match · p08 · `invalidAnswers.test.ts:281` |
| B `0`, `@` | `@` untested · p26 | **LIN-07** · p09, p14 | **LIN-07** · p32 | **LIN-07** · p08 |
| B negative | n/a | match · `LineTool.test.ts:306` | | untested · p102 (LIN-02) |
| B another prompt's keyword | untested · p23, p103 | untested · p04, p23 | n/a | **LIN-05** · p115 |
| B `#x,y` at the command line | | **LIN-09** · p15, p28, d02 | | |
| B Enter | match · p05 · `:553` | match (ends) · p01 · `dynamicInputEnter.test.ts:36` | | **LIN-04** · p114 |
| B Continue | from a line, a closed polyline: match · p06, p116 | | | **LIN-02** · p07; **LIN-03** · p116 |
| F own Undo | **LIN-06** · p02, p103, p108 | match · p02 · `:289` | match · `:175` | **LIN-05** · p115 |
| F Undo after a transparent command | | **LIN-01** · p117, p118 | | |
| F Undo under Control None | | match · p101, p43 · `undoCommand.test.ts:350` | | |
| F Ctrl+Z | **UND-03** | match (the keyword) · `LineTool.test.ts:257` | | **UND-03** |
| F U, REDO, UNDO n, MREDO after | match · p20, p108 · `:237` | | | |
| G Enter, Space | match · p05 · `:544` | ends · p01 · `:423` | | LIN-04 |
| G Escape, right button | unverified (help) · `:499`, `shortcutMenu.test.ts:197` | unverified (help) · `shortcutMenu.test.ts:153` | | LIN-04 |
| G another command typed | untested · p103 | | | |
| G LASTPOINT after Close, Undo, Enter | match · p03, p13, p02 · `lastPoint.test.ts:64` | | | |
| H geometry | untested · p15, p31, p27, p03 | | | |
| K words | ar match · `locale.test.ts:972`; es LIN-06, -07, -08 | | | |
| L history | match · `LineTool.test.ts:473`; lines missing LIN-06, -07 | | | |

### CLI — the command line

| Row | Cell |
| --- | --- |
| Names and aliases, en and es | match · p39, p104 · `locale.test.ts:355` |
| Echo of `line`, `_LINE` | known (Missing, with its WHY) · p39 |
| `_L`, `_.LINE` | known (Missing) · p39 (Spanish AutoCAD refuses `_L` too) |
| Unknown command | **CLI-01** · p40, p105 |
| Enter repeats, also after an unknown command | match · p12, p105 · `LineTool.test.ts:431` |
| Right button's Repeat | unverified (help) · `shortcutMenu.test.ts:57` |
| Refusals in each prompt's words | untested · p09, p23, p103 |
| `'_LINE` at `Command:` / mid-prompt | untested · p40; match · p11, p19 · `transparentCommands.test.ts:328` |
| `'_ZOOM` at `Command:`; `'_-OSNAP` mid-command | untested · p40, p19 |
| `'ORTHOMODE` | TRK-02 |
| `'ZOOM E` | **CLI-02** in an empty drawing · p19; match with objects · p112 |
| `Resuming LINE command.` | match · p19 · `transparentCommands.test.ts:183` |

### UND — undo and redo

| Row | Cell |
| --- | --- |
| U ×4, REDO refused after it | match · p41 · `undoEcho.test.ts:29` |
| Spanish | names match; **UND-01** |
| UNDO n, REDO; Enter = 1 | match · p100, p110 · `undoCommand.test.ts:36`; Enter untested · p100 |
| Refusals | en match · p106; es **UND-02** |
| Mark, Back, BEgin, End; Back with no mark | match · p42, p109 · `undoCommand.test.ts:86`, `:166`, `:209` |
| Control None, One | match · p43, p101, p111 · `undoCommand.test.ts:322`, `:379`; es **UND-02** |
| REDO, MREDO right after a command; MREDO All, Last, Enter, refusals | match · p107, p113 |
| Ctrl+Z at `Command:`, Ctrl+Y, the Default menu's Undo | match (acad.cuix macros) · `undoEcho.test.ts:154`, `mredoCommand.test.ts:288`, `shortcutMenu.test.ts:86` |
| Ctrl+Z mid-command | **UND-03** |

### PIN — point input

| Row | FP | NU |
| --- | --- | --- |
| `x,y` | match · p15, p16 · `LineTool.test.ts:63` | command line absolute · d02 (see LIN-09) |
| `x,y,z`; a 2D point after a 3D one | match · p15 · `coordinateInput.test.ts:196` | untested · p15 |
| `@dx,dy`; `@` | match · p26, p14 · `lastPoint.test.ts:25`, `coordinateInput.test.ts:105` | |
| `d<a`, `@d<a`, `@10<-45`, `@10<450`, `@-10<0` | match · p15, p16 · `LineTool.test.ts:73` | untested · p27 |
| `#x,y` at the command line | **PIN-02** (with LIN-09) · p15, p28, d02 | |
| `#x,y` in the tooltip | unverified (desktop) · `LineTool.test.ts:86` | |
| `*x,y`, `@*`; in a tilted UCS | match · p16, p152 · `coordinateInput.test.ts:170`; tilted untested · p153 | |
| Z of a `*` point without a Z | **PIN-01** · p152, p163 | |
| `1e1`, `1/2`, `1-1/2` | **PIN-03** · p150, p165 | |
| `0x10` | **PIN-05** · p165 | |
| Angle forms | **PIN-04** · p151 | |
| Cylindrical, spherical | untested at LINE · p151 · `coordinateInput.test.ts:229` | |
| Direct distance from LASTPOINT; with Ortho | match · p159 · `lastPoint.test.ts:370`; Ortho untested · p160, p29 | |
| Direct distance along Polar, an OTRACK guide | unverified (desktop) · `LineTool.test.ts:404` | |
| `<a` | refused at FP: untested · p161 | match · p18 · `LineTool.test.ts:342`, `:354` |
| `<a` then a coordinate or a snap (they win) | | untested · p161, p165 |
| A second `<a` | | **PIN-06** · p161 |
| LASTPOINT after each answer; after a FROM base | match · p13, p17; FROM: OSN-05 · p164 | |
| ELEVATION for 2D points | match · p31 · `coordinateInput.test.ts:207` | |
| Architectural units | known (UNITS Missing) · p30 | |

### OSN — object snaps

| Row | Cell |
| --- | --- |
| END, MID, CEN, QUA, NEA, INT, PER, NON picked | match · p25, p32 · `snapping.test.ts`, `LineTool.test.ts:608` |
| A typed point after an override | **OSN-01** · p25, p32, p24 |
| Echo `of` (END, MID, CEN, QUA, INT, APP, EXT), `to` (NEA, PER, TAN, PAR), none for NON; es `de` / `a` | untested · p25, p32, p33, p156 |
| es FIN, MED, CER, NIN; `_ENDP`, `_NEAR` | untested · p33, p156 |
| An override that finds nothing | **OSN-02** · p36, p156 |
| A second override at `of` | **OSN-11** · p162 |
| `_APPINT` | **OSN-10** · p156, p163 |
| Deferred TAN, TAN–TAN, PER, picked | match · p24 · `LineTool.test.ts:587`, `:633`, `:674` |
| Override with Ortho on | match · p162 · `snapping.test.ts:320` |
| FROM: prompts, typed base, bare number, Enter, `_FRO` | **OSN-04**, **OSN-03**, **OSN-06**, **OSN-05**, **OSN-07** · p34, p154, p164 |
| FROM `@x,y` and bare `x,y` with a picked base | match · p154 · `snapping.test.ts:475` |
| M2P | known · p35 (settles its wording) |
| -OSNAP Enter; the empty set's line | **OSN-08**, **OSN-09** · p37, p155 |
| -OSNAP list, OFF, NON, FOO, es | match · p37, p155 · `snapping.test.ts:473` |
| Tab cycling, aperture, markers | unverified (desktop) |
| OSMODE 4133 | match · p166 |

### TRK — Ortho, Polar, OTRACK, snap mode

| Row | Cell |
| --- | --- |
| SNAP | **TRK-01** · p38, p158 · `transparentCommands.test.ts:127` pins the invented message |
| SNAPUNIT, POLARANG, AUTOSNAP, POLARMODE defaults | match · p166 · `snapping.test.ts:131` |
| `'ORTHOMODE` and the other system variables | **TRK-02** · p19 |
| F3's echo | **TRK-03** · tables 33112, 33113 |
| F8, F9, F10, F11's echo | unverified (desktop) |
| Ortho with typed points (ignored), with a direct distance, with a snap | untested · p160, p29; match · p162 |
| Shift, Polar guides, OTRACK, the Z guide | unverified (desktop) · `LineTool.test.ts:629`, `zTracking.test.ts` |

### DYN — dynamic input

The console has none and the desktop's tooltip could not be typed into, so every AutoCAD answer
here is unverified. mellowcad's side, from scratch tests: the first point's box reads `x,y`
absolute, `@`, `#`; the next point's reads `x,y` relative, `#` absolute, `*` in the WCS; length
and angle with Tab and their lock; Enter with nothing typed is the prompt's. **DYN-01** and
**DYN-02** below.

### CPR — current properties on creation

| Row | Cell |
| --- | --- |
| CLAYER (a locked one too) | match · p21, p45, p201 · scratch passes |
| CECOLOR index, CELTYPE, CELWEIGHT; ByLayer stores nothing | match · p21, p45 · `currentProperties.test.ts:271`, `:289` |
| CECOLOR true colour equal to an index colour | **CPR-01** · p200 |
| CELTSCALE, the object's linetype scale | known (Linetypes Missing) · p21, p207 |
| ELEVATION, THICKNESS | untested / match · p21, p31 · `elev.test.ts:153` |
| Tilted UCS: Normal = the UCS's Z; THICKNESS along it | untested · p22, p44 · scratch passes |
| -LINETYPE's file; Spanish linetype names | **CPR-02**, **CPR-03** · p202, p205 |
| Every creating command in `FROM_SCRATCH` / `DERIVED` | match · `currentProperties.test.ts:45` |

### EDT — grips and the Properties palette

| Row | Cell |
| --- | --- |
| A line's grips: ends and midpoint | match (help) · `selectToolGrips.ts:33` |
| End grip drag | **EDT-01** (help) |
| Midpoint grip with two lines selected | **EDT-02** (help) |
| A vertical line's grips | **EDT-04** |
| The hover menu (Stretch, Lengthen); Enter/Space cycling | known in part (Grips Missing); unverified |
| General rows | match for Color, Layer, Linetype, Lineweight, Thickness · `CadRuntime.test.ts:589`; Linetype scale known; Hyperlink not in Missing |
| Start and End X Y Z editable; Delta read-only; in the UCS | match (help) · `CadRuntime.test.ts:461`, `:522`, `:536`; `tiltedUcs.test.ts:354` |
| Length and Angle | **EDT-03** (help) |
| Labels and groups | **EDT-06** (help) |
| A rising line's ends brought together in plan | **EDT-05** (unverified) |
| An edit is one undo step | match · `CadRuntime.test.ts:438` |

### FIL — files

Every property of a line (layer, colour, linetype, lineweight, elevation, deltaZ, thickness,
normal) survives QSAVE and OPEN, the autosave, COPYCLIP and PASTECLIP, and NEW's undo (scratch
tests pass); older files load (`drawingFile.test.ts:945`, `:804`). Untested: a line's `normal` in
`drawingFile.test.ts`, and the full property set through the autosave. No findings.

### RND — render

| Row | Cell |
| --- | --- |
| Linetype definitions | **RND-01** · p202, p203, p207 |
| The pattern along a line (centred; solid under one period) | **RND-02** · p207 |
| LTSCALE multiplies; lineweight only with LWDISPLAY | match · `SceneBuilder.test.ts:177`, `:192` |
| LWDISPLAY's default | **RND-03** · p204 |
| Thickness off the plan; a sloping line | match · `views.test.ts:185`, `:213` |
| Tilted thickness in plan; +Z thickness edge-on | untested · p44 · scratch passes |
| Rubber band colour | **RND-04** (unverified) |
| Both presenters' dashes | match for the mechanism · `SvgScenePresenter.test.ts:336`, `CanvasScenePresenter.test.ts:43` |

### DSK — the desktop session

2026-10-21, Spanish profile, with the owner's mouse (`scripts/research/probes/line/dsk.sh`, d03–d20;
screenshots in `research/probes/line/`). It settles the help-only cells above and the rows the
template gained after the first pass (matrix.md P and Q).

| Row | Gesture | AutoCAD | mellowcad | State |
| --- | --- | --- | --- | --- |
| P | LINE from the rail | the ribbon's Line runs `_line`, written `Comando: _line` (d19) | writes nothing | **DSK-05** |
| P | points picked, aids off | land where clicked (d03) | `LineTool.test.ts:19` | match |
| P, Q | the rubber band | a solid line in the colour the object will wear: red with CECOLOR 1 (d04) | `THEME.rubberBand`, fixed | **DSK-01** |
| P, D | a running Endpoint under the cursor | green square marker, the crosshair jumps onto the point, tooltip `Punto final` below and right (d05) | the crosshair jumps (`snapping.test.ts`); marker and tooltip look | **DSK-07** |
| P | Shift+right button | the snap menu: TT, From, Mid Between 2 Points, Point Filters ▸, 3D Osnap ▸ · Endpoint, Midpoint, Intersection, Apparent Intersect, Extension · Center, Geometric Center, Quadrant, Tangent · Perpendicular, Parallel, Node, Insert, Nearest, None · Osnap Settings… (d06) | another order and no groups | **DSK-02** |
| P | the right button at the next point | Intro, Cancelar, Entrada reciente ▸ · desHacer · Modificaciones de REFENT ▸ · Encuadre, Zoom, SteeringWheels · Calculadora rápida (d07) | order matches for what exists; es label | **DSK-03**; Pan, Zoom known |
| G | Escape | segments kept; es `*Cancelado*` inside a command, `*Cancelar*` at `Comando:` (d08, d19) | `*Cancelar*` always | **DSK-04** |
| F | Ctrl+Z inside LINE | answers `_u` at each prompt: a segment back, `Ya están anulados todos los segmentos.`, at the first point `Punto no válido.` and LINE stays (d09) | | UND-03 confirmed |
| D | F3, F8, F9, F10, F11, F12 | es ` <Refent desactivado>`, ` <Orto activado>`, ` <Forzcursor activado>`, ` <Polar activado>`, ` <Rastreo de referencia a objetos desactivado>`; F12 writes nothing; F8 on turns Polar off (d10) | nothing written | TRK-03 widened |
| D | the tooltip at the first point | `Precise primer punto:` and X, Y fields; `5,5` absolute (d11) | `dyn.test.ts` | match (look: DSK-07) |
| D | the tooltip at the next point | length on the line, angle by a dotted arc, `Precise siguiente punto o` with a ⬇; `10,0` relative, `#30,30` absolute, length Tab angle (d11) | `LineTool.test.ts:86`, `:93` | match; PIN-02 holds at the command line only |
| D | the Down arrow | lists `Cerrar`, `desHacer` under the prompt (d11) | chips always shown | DYN-02 verified |
| D | Ortho with picks | the point squared to the axis (d12) | `LineTool.test.ts:195` | match |
| D | Polar 30° with a typed distance | green dashed path, tooltip `Polar: 18.6707 < 30°`, `20` runs along it (d12) | `snapping.test.ts` | match (look: DSK-07) |
| C | `<30` then a number with the cursor elsewhere | the line at 30° (d14) | `LineTool.test.ts:342` | match, settles p18 |
| D | OTRACK from an acquired Endpoint | a small green `+`, green dashed guide, tooltip `Punto final: 15.0451 < 0°`, the pick on the guide (d13) | alignment `LineTool.test.ts:404`; the tooltip's distance known (Missing) | match (look: DSK-07) |
| I | a line's grips | blue squares at both ends and the middle, red under the cursor, the line glowing blue (d15) | `selectToolGrips.ts:33` | match (look: DSK-07) |
| I | the end grip's hover menu | `Estirar`, `Longitud` (d15) | not built | known; es label of the lengthen field `Alargar` → EDT-01 |
| I | an end grip dragged off its line | the end goes to the cursor (d15) | slides along the line | EDT-01 confirmed |
| I | the midpoint grip, two lines selected | `** ESTIRAR **`; only its line moves (d15) | both move | EDT-02 confirmed |
| I | the Properties palette | General: Color, Capa, Tipo de línea, Escala de tipo de línea, Estilo de trazado, Grosor de línea, Transparencia, Hipervínculo, Altura de objeto · Visualización 3D: Material · Geometría: Inicio X Y Z, Fin X Y Z, Incremento X Y Z, Longitud, Ángulo — the last five greyed (d16) | | EDT-03, EDT-06 confirmed |
| C | a double-click on one point | one segment, no zero-length line (d17) | the second pick skipped | match; LIN-07 stays for typed `0`, `@` |
| P | the wheel mid-command | zooms, LINE goes on (d18) | `viewUndo.test.ts` | match |
| Q | hovering a line at `Comando:` | it thickens, the pickbox shows, a tooltip `Línea · Color · Capa · Tipo de línea` (d20) | the highlight only | **DSK-06** |

A second pass the same night (d21–d27, `dsk.sh`'s second part), mouse lent for the night:

| Row | Gesture | AutoCAD | mellowcad | State |
| --- | --- | --- | --- | --- |
| D | each running snap hovered and picked, one OSMODE at a time: Endpoint, Midpoint, Center, Quadrant, Intersection, Perpendicular, Tangent, Nearest, Apparent Intersection | each lands on its point; green markers (square, triangle, circle with a cross, diamond, ✕, right angle, circle with a bar, hourglass); Center and Perpendicular leave the crosshair on the pointer, the marker on the point (d21) | the same points and crosshair rule (`snapping.test.ts`, `providers.test.ts`); glyphs per type (`SceneBuilder.ts` `pushSnapMarker`) | match (colour: DSK-07) |
| D | Midpoint picked from the Shift+right menu | written `_mid de`; the midpoint of the object under the cursor (d22) | `OSNAP_MENU_ANSWERS` | match |
| D | snap mode (F9) with picks | (13,7) → (10,10), (27.5,−14) → (30,−10) (d23) | scratch `research/review/line/D/snapmode.test.ts` passes | untested |
| D | a running snap with Ortho on | the snap wins (d24) | `snapping.test.ts:320` | match |
| D | the aperture | Endpoint engages up to 10 px from the point, not at 11 (APERTURE 10; d25) | 8 px (`pixelTolerance`) | **DSK-08** |
| D, Q | Tab over stacked snaps | cycles, the current snap's object glowing blue (d26) | cycles (`CadRuntime.ts:4339`) | match; the glow: DSK-07 |
| D | Shift for a temporary Ortho | a synthetic Shift is not read (TEMPOVERRIDES 1) | `LineTool.test.ts:615` | unverified (help only) |
| D, K | the English profile's echoes | ` <Ortho on>`, ` <Snap on>`, ` <Polar on>`, ` <Object Snap Tracking on>` and their `off`; `*Cancel*` inside a command and at `Command:` alike (d27) | nothing written | TRK-03 widened; DSK-04 is Spanish only |

Not reached: Extension, Parallel and Insertion hovered (they need an acquisition or a block), and
the modes table's pairs with dynamic input.

## 5. Findings

Each finding's scratch test is in `research/review/line/<A|B|C>/`; in the execution it moves into
the file named as its regression test, citing its probe.

### High

#### LIN-01 — LINE's Undo after a transparent command that made an undo step leaves the segment

- **Severity:** high · **Row:** F · **Status:** verified
- **Where:** `cad/application/tools/LineTool.ts:356` (`ctx.undo()` pops the last entry, whoever
  made it)
- **AutoCAD:** p117 `'_LTSCALE 2` then `_U`: `Regenerating model.`, LTSCALE back to 1, the segment
  erased, `Specify next point or [Undo]:`. p118 the same with `'-COLOR 1` (CECOLOR back to
  BYLAYER).
- **mellowcad:** two lines left while the prompt steps back, so the chain and the drawing part.
- **Fix:** before each segment the tool marks the history depth, and its Undo takes back everything
  down to and including that mark, through a `ToolContext` method. **Alternative:** fold a
  transparent command's entry into the tool's next one.
- **Regression test:** `LineTool.test.ts`, citing p117 and p118. PLINE's Undo has the same pattern:
  probed in its review (row 2).
- **Rules:** `cad-tools.md` "Ordering and undo" and `cad-runtime.md` "Commands and history" say what
  a tool's Undo takes back.

#### LIN-02 — Continue from an arc drawn clockwise leaves its far end

- **Severity:** high · **Row:** B · **Status:** verified
- **Where:** `cad/application/tools/lastDrawnPoint.ts:47-51`, `:127-131` (the stored CCW end)
- **AutoCAD:** p07: `ARC 0,0 50,50 100,0`, `LINE`, Enter, `30` → (100,0)–(100,−30); p102 `−30` →
  (100,30).
- **mellowcad:** the line leaves (0,0).
- **Fix:** an arc whose stored start is LASTPOINT is continued from its start, the tangent reversed.
  **Alternative:** keep the drawn sense on the arc for the session.
- **Regression test:** `LineTool.test.ts` Continue, citing p07, p102. PLINE's `lastDrawnDirection`
  shares `arcEndTangent`: probed in its review.

#### OSN-02 — an override that finds nothing places the cursor's point

- **Severity:** high · **Row:** D · **Status:** verified
- **Where:** `cad/application/snapping/SnapEngine.ts` and `CadRuntime.ts`'s `placePoint`: with no
  candidate under the override the raw point passes through
- **AutoCAD:** p36: `No Endpoint found for specified point.` then `Invalid point.` and the prompt
  again (es `No se ha encontrado ptoFINal para el punto designado.`, `Punto no válido.`); TAN, EXT,
  PAR and APPINT print an empty name (`No found for specified point.`); at the next point the
  refusal is the prompt's own (p156).
- **mellowcad:** `_END` then a click on nothing starts the line there.
- **Fix:** refuse with the mode's name and the prompt's refusal, keeping the override (LINE-D11).
- **Regression test:** `snapping.test.ts`; its "the line being drawn is not an object to intersect
  with" pins the raw point and is rewritten.

#### OSN-03 — a FROM base typed at the command line skips FROM and leaves it pending

- **Severity:** high · **Row:** D · **Status:** verified
- **Where:** `CadRuntime.ts`: `answerPrompt` ignores the pending FROM, which only
  `dispatchPointerDown` reads
- **AutoCAD:** p154 `Base point: 20,20`, then `<Offset>:`.
- **mellowcad:** `FROM`, `20,20` places the first point at 20,20 and the next click becomes a FROM
  base.
- **Fix:** typed answers go through FROM while it is pending or holds a base.
- **Regression test:** a FROM test file, citing p154.

#### TRK-01 — SNAP is a toggle of our own; AutoCAD asks the spacing

- **Severity:** high (a reinvented command) · **Row:** B · **Status:** verified
- **Where:** `cad/application/runtimeCommands.ts:148-158`; the message `snapMode` is invented
- **AutoCAD:** p38, p158: `Specify snap spacing or [ON/OFF/Aspect/Legacy/Style/Type] <10.0000>:`
  (declared ON/OFf/Rotate/Style/Type/Legacy/Aspect; es
  `Precise distancia de resolución o [ACT/DES/asPecto/Original/Estilo/Tipo]`); a spacing sets
  SNAPUNIT and turns snap on, Enter turns it on, OFF off; FOO
  `Requires numeric distance, two points, or option keyword.`; 0 and −5
  `Value must be positive and nonzero.`; Aspect asks the horizontal and vertical spacings;
  transparently `>>` and `Resuming LINE command.`
- **mellowcad:** `SN 5` toggles snap and `5` is an unknown command.
- **Fix:** a SNAP tool with spacing, ON, OFF and Aspect; Legacy, Style, Type and Rotate to Missing
  (LINE-D14).
- **Regression test:** `snapCommand.test.ts`, citing p158; `transparentCommands.test.ts:127` changes.

#### RND-01 — linetype definitions are invented

- **Severity:** high · **Row:** M · **Status:** verified
- **Where:** `cad/domain/linetypes.ts:34-41`
- **AutoCAD:** p202 (acadiso.lin, MEASUREMENT 1): DASHED 12.7 −6.35; HIDDEN 6.35 −3.175; CENTER
  31.75 −6.35 6.35 −6.35; PHANTOM 31.75 −6.35 6.35 −6.35 6.35 −6.35; DASHDOT 12.7 −6.35 0 −6.35.
  The plot (p207) shows them on paper.
- **mellowcad:** `[8,5]`, `[5,3]`, `[20,4,4,4]`, `[20,4,6,4,6,4]`, `[12,5,1,5]`.
- **Scenario:** a Center layer repeats every 32 units here, 50.8 in AutoCAD; an LTSCALE learned in
  AutoCAD gives another density.
- **Fix:** transcribe acadiso.lin with its lines quoted beside the data (LINE-D20); DASHDOT's 0 dash
  is a dot in both presenters.
- **Regression test:** `SceneBuilder.test.ts`, the dash array per linetype, citing p202.
- **Rules:** `cad-engine.md` "Transcribe a definition from AutoCAD's" then holds.

#### EDT-01 — a line's end grip lengthens where AutoCAD's stretches

- **Severity:** high · **Row:** I · **Status:** verified
- **Where:** `cad/application/tools/SelectTool.ts:217-236` (the point projected on the line)
- **AutoCAD:** d15: an end grip clicked, the cursor moved off the line and clicked → the end at the
  cursor. Hovering it lists `Estirar`, `Longitud` (Stretch, Lengthen), Lengthen being the second.
- **mellowcad:** dragging (100,0) to (150,50) leaves the end at (150,0). Its lengthen field is
  labelled `Alargar` in Spanish; AutoCAD's menu says `Longitud`.
- **Fix:** the end follows the cursor (LINE-D24).
- **Regression test:** the grips tests, citing d15.

### Medium

#### LIN-03 — Continue from a polyline ending in an arc does not ask `Length of line:`

- **Where:** `lastDrawnPoint.ts:54-63` · **AutoCAD:** p116 · **Fix:** the exit tangent of an arc
  segment (`segmentExitTangent`).

#### LIN-04 — Enter or the right button at `Length of line:` ends LINE

- **Where:** `LineTool.ts:669-674` (no `commitRaw`) · **AutoCAD:** p114 refuses with
  `Requires numeric distance or second point.` (AllowNone false) · **Fix:** refuse on empty text and
  return `true` · **Rules:** `cad-tools.md` "Dynamic input" holds then.

#### LIN-05 — Undo after Continue's line returns to `[Undo]`, not `Length of line:`

- **Where:** `LineTool.ts:343-356`, `:701-715` · **AutoCAD:** p115, where a second Undo is refused.

#### LIN-06 — Undo of the first point is silent

- **Where:** `LineTool.ts:335-341` · **AutoCAD:** p02, p103, p108 `All segments already undone.`
  (es `Ya están anulados todos los segmentos.`, table 20580 — not PLINE's 21294) · **Fix:** a
  message of LINE's own.

#### LIN-07 — a zero-length segment is neither drawn nor said

- **Where:** `LineTool.ts:782`, `:700`, `:834`, `:847` · **AutoCAD:** `0` and `@` at the next point,
  `0` at `Length of line:`, APP or PER landing on the start (p08, p09, p14, p32) draw a zero-length
  LINE, count it, and write `Zero length line created at (x, y, z)` (es
  `Línea de longitud cero creada en (…)`) · **Coverage:** Missing names only two picks on one point;
  `LineTool.test.ts:54` pins the skip with no source.

#### UND-03 — Ctrl+Z mid-command ends the command and silently undoes the previous one

- **Where:** `CadRuntime.ts:4232`, `:2035` · **AutoCAD:** acad.cuix binds Ctrl+Z to `_u` (no
  `^C^C`), so it answers the running prompt: `Invalid point.` at the first point (p103), the
  refusal at `Length of line:` (p115), the keyword at `[Undo]` · **Fix:** Ctrl+Z mid-command answers
  the prompt with `_u` · **Coverage:** "the running command ends first and goes whole" holds for the
  top bar's button only.

#### OSN-01 — a coordinate typed after an override is not snapped

- **Severity:** medium (downgraded from high) · **AutoCAD:** p25 `_END of 99,1` → 100,0; p24, p32 ·
  **Fix:** resolve a typed point through the override.

#### OSN-04 — FROM's prompts are messages of our own

- **Where:** catalog `fromBase`, `fromOffset`, `fromNeedsPoint` · **AutoCAD:** `Base point:`,
  `<Offset>:` (es `Punto base:`, `<Desfase>:`) as prompts, the history `Base point: _END of …`
  (p34, p154).

#### OSN-05 — Enter at `<Offset>` places the base point

- **Where:** `CadRuntime.ts` `commitFromOffset` (its WHY says unverified) · **AutoCAD:** it is the
  running prompt's Enter: LINE's Continue at the first point (p34), the end of LINE at the next, with
  LASTPOINT the base (p164) · `dynamicInputEnter.test.ts:203` pins the wrong behaviour.

#### OSN-06 — a bare number at `<Offset>` runs from LASTPOINT, not from the base

- **AutoCAD:** p154 lands 5 from the base · **Rules:** `cad-tools.md` "A tool never reads a bare
  number in its point box" broken for FROM's box.

#### OSN-07 — `_FRO` is refused

- **Where:** `CadRuntime.ts` `pointModifier` · **AutoCAD:** p34, p154 take it.

#### OSN-08 — -OSNAP Enter keeps the running set; 2027 clears it

- **Where:** `cad/application/tools/OsnapTool.ts:59-61` and its JSDoc · **AutoCAD:** p37, p155
  (OSMODE 0).

#### PIN-01 — a `*` point without a Z takes ELEVATION and the UCS origin's Z

- **Where:** `cad/application/input/coordinateInput.ts:145-154` · **AutoCAD:** WCS Z 0 (p152, p163) ·
  `coordinateInput.test.ts:201-205` pins z 3.

#### PIN-02 — `#x,y` at the command line is accepted (the same as LIN-09, owned here)

- **AutoCAD:** refused even with DYNMODE 3 (d02, p15, p28) · **Fix:** a leading `#` typed in the
  command window is refused; the tooltip keeps it.

#### PIN-03 — `1e1`, `1/2`, `1-1/2` inside a point are refused

- **Where:** `coordinateInput.ts:213`, `cad/domain/units.ts:368` · **AutoCAD:** read in decimal
  units (p150, p165) · `coordinateInput.test.ts:262` pins `1e5,0` refused.

#### PIN-04 — angle forms are refused

- **AutoCAD:** `30d`, `30d30'`, `0.5r`, `50g`, `N45dE` are read with AUNITS 0 (p151), in points, the
  angle override and angle fields.

#### TRK-02 — system variables like ORTHOMODE cannot be typed

- **AutoCAD:** p19 `>>Enter new value for ORTHOMODE <0>:` · **Order:** SETVAR is roadmap row 24;
  the gap goes to Missing until then (LINE-D15).

#### DYN-01 — dynamic input cannot be turned off

- F12 and DYNMODE do nothing, with no WHY and no Missing entry · **Fix:** Missing (LINE-D13).

#### EDT-02 — a line's midpoint grip moves the whole selection

- **Status:** verified (d15: with two lines selected the midpoint grip moved only its line, in
  `** ESTIRAR **`) · **Where:** `SelectTool.ts:783-800`.

#### EDT-03 — the palette edits a line's Length and Angle; AutoCAD's are read-only

- **Status:** verified (d16: Incremento X Y Z, Longitud and Ángulo greyed) · **Where:**
  `cad/application/EngineState.ts`, `cad/domain/entityProperties.ts:239-260` ·
  `CadRuntime.test.ts:438`, `:556` pin the edit.

#### RND-02 — a line's dash pattern is not centred

- **Where:** `cad/application/SceneBuilder.ts:1305-1322`, `cad/adapters/CanvasScenePresenter.ts:57-70`
  · **AutoCAD:** p207: every line begins and ends on an equal dash, `(L − m·period + first dash) / 2`
  with m whole periods, and is solid under one period (the rule fits the five lines measured) ·
  **Fix:** a phase computed in world units carried on the stroke (LINE-D21).

#### RND-03 — LWDISPLAY starts on with no WHY and no coverage note

- **Where:** `cad/domain/units.ts:89` · **AutoCAD:** p204 LWDISPLAY 0. AGENTS.md declares the
  deviation; the code and the coverage do not (template §4.7) · **Fix:** WHY and note (LINE-D22).

#### DSK-01 — the rubber band is a fixed colour; AutoCAD's is the colour the object will wear

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **Where:** `cad/application/tools/LineTool.ts:397` (`THEME.rubberBand`), `cad/scene/theme.ts:39`
- **AutoCAD:** d04: with CECOLOR 1 the rubber band is red, the colour the line takes.
- **Fix:** LINE's rubber band in the current colour, ByLayer resolved to the layer's. Whether the
  ghosts of MOVE, COPY and the others follow is their reviews' (the rule says the rubber band's
  colour for all). **Rules:** `cad-tools.md` "A ghost is drawn in the rubber band's colour" is
  wrong for LINE; the THEME comment was right. Replaces RND-04.

#### DSK-02 — the snap menu's order and groups are not AutoCAD's

- **Severity:** medium (a menu used by position) · **Row:** P · **Status:** verified
- **Where:** `components/cad/snap-override-menu.tsx:31-44`, whose comment claims AutoCAD's order
- **AutoCAD:** d06, the groups and order in the DSK table.
- **mellowcad:** From, Endpoint, Midpoint, Center, Quadrant, Intersection, Apparent Intersection,
  Perpendicular, Tangent, Extension, Insertion, Parallel, Nearest, None, ungrouped.
- **Fix:** AutoCAD's order with its separators for what exists (From; Endpoint, Midpoint,
  Intersection, Apparent Intersect, Extension; Center, Quadrant, Tangent; Perpendicular, Parallel,
  Insert, Nearest, None); TT, M2P, the filters, 3D osnaps, Geometric Center, Node and the settings
  stay out until built, as `cad-runtime.md` rules for shortcut menus.

### Low

- **CAT-01** — en `Lines are non-coplanar.` is 2027's `Lines are non coplanar.` (p61, table 20687).
- **LIN-08** — es `[Cerrar/desHacer]` prompt is `Precise siguiente punto o` (p01, table 21157): a
  prompt id of its own; `locale.test.ts:109`, `:360` pin the wrong text.
- **LIN-09** — `#x,y` at the command line, LINE's cell of PIN-02.
- **CLI-01** — the unknown-command message drops `  Press F1 for help.` (es
  `Pulse F1 para obtener ayuda.`) with no WHY (p40, p105).
- **CLI-02** — `'ZOOM E` mid-LINE in an empty drawing runs; AutoCAD says
  `** Requires a regen, cannot be transparent.` (p19; with objects it runs, p112).
- **CLI-03** — command-line.md "Command names" Missing still lists transparent `'` commands.
- **UND-01** — es `Nada que deshacer` is `No hay nada que se pueda deshacer` (p41, table 25742).
- **UND-02** — es integer refusals take a comma: `…32767, o una opción.`, `Requiere un valor 1
  entero, o una opción.` (p106, p111, p113).
- **PIN-05** — bare `0x10` is read as 16; AutoCAD refuses it (p165).
- **PIN-06** — a second `<a` replaces the first; AutoCAD refuses it (p161).
- **OSN-09** — -OSNAP with an empty set writes `Current osnap modes: None`; AutoCAD writes nothing
  (p37, p155).
- **OSN-10** — `_APPINT` is refused at a point prompt and in -OSNAP's list (p156, p163).
- **OSN-11** — a second override typed at `of` replaces the first; AutoCAD says `Invalid point.`
  (p162).
- **OSN-12** — docs drift: the `of` echo listed as Missing is built; the `OSNAP_MENU_ANSWERS` WHY
  and `command-line.md`'s unverified prepositions are settled by p24, p25, p32, p156 (INS stays
  unverified).
- **TRK-03** — F3, F8, F9, F10 and F11 write nothing; AutoCAD writes ` <Osnap on>`, ` <Ortho on>`,
  ` <Snap on>`, ` <Polar on>`, ` <Object Snap Tracking on>` and their `off` (d27, tables 33112,
  33113), es ` <Refent activado>`, ` <Orto activado>`, ` <Forzcursor activado>`, ` <Polar activado>`,
  ` <Rastreo de referencia a objetos activado>` and their `desactivado` (d10); F12 nothing.
- **DYN-02** — the Down arrow lists nothing; AutoCAD lists the options under the prompt (d11). The
  chips stay as the always-visible list; the Down arrow opens them.
- **CPR-01** — a true colour 255,0,0 reads back as index 1 (p200): to Colour Missing (LINE-D27).
- **CPR-02** — -LINETYPE names acad.lin; 2027's metric default is acadiso.lin, and `?` asks the
  file and pages (p202, p205).
- **CPR-03** — Spanish AutoCAD's acadiso.lin names its linetypes in Spanish (`LÍNEAS_OCULTAS`, p205):
  names stay drawing data, the gap to Missing (LINE-D26).
- **EDT-04** — a vertical line's three grips sit on its start (`selectToolGrips.ts:206-213` reads Z
  through `entityZAt`, not `lineStartZ` / `lineEndZ`).
- **EDT-05** — a rising line's ends cannot meet in plan through the palette (`entityProperties.ts:236`
  compares in 2D); unverified.
- **EDT-06** — palette labels `Δ X` (es `Delta X`) in two groups; AutoCAD's one Geometría group
  reads Inicio X Y Z, Fin X Y Z, Incremento X Y Z, Longitud, Ángulo (d16).
- **DSK-03** — the Command menu's es label is `Modificaciones de REFENT` (d07), not
  `Modificaciones de referencias`; the menu's order, unverified in the coverage, is settled.
- **DSK-04** — es Escape inside a command writes `*Cancelado*`; at `Comando:` `*Cancelar*` (d08,
  d19); English writes `*Cancel*` for both (d27). mellowcad writes `*Cancelar*` for both (scratch `research/review/line/D/rail.test.ts`).
- **DSK-05** — LINE started from the rail writes nothing; the ribbon's writes `Comando: _line` (d19).
- **DSK-06** — hovering an object at `Comando:` shows AutoCAD's rollover tooltip (`Línea`, Color,
  Capa, Tipo de línea; d20); absent here and not in Missing.
- **DSK-08** — the snap aperture is 8 px here; AutoCAD's APERTURE 10 engages at 10 px and not at 11
  (d25). Capture at 10, release a little beyond (`releaseTolerance`).
- **DSK-07** — the aids look otherwise than AutoCAD's dark theme: the snap marker cyan (AutoCAD's
  green), its tooltip a dark box above the cursor (a light box below and right; the WHY placing it
  above holds only with dynamic input showing), the selection amber (a blue glow), OTRACK's guide
  violet with a hollow square on the acquired point (green dashed, a small green `+`), the crosshair across the screen
  (CURSORSIZE 5, a pickbox only at `Comando:`). Recognition, not styling: each to AutoCAD's look
  (LINE-D31).

## 6. Decisions taken

| Id | Decision | Why |
| --- | --- | --- |
| LINE-D1 | LINE's Undo takes back down to a history mark set before each segment (LIN-01) | Keeps the runtime's grouping untouched and is what the console shows |
| LINE-D2 | Continue from an arc uses LASTPOINT to tell its drawn end (LIN-02) | Document order stays the rule; LASTPOINT is the runtime's and survives nothing else |
| LINE-D10 | FROM's `<Offset>` box keeps the dynamic-input relative default; the command line reads absolute | The DYN default; p154 at the command line |
| LINE-D11 | Reproduce `No found for specified point.` with AutoCAD's empty name for TAN, EXT, PAR, APPINT | Fidelity: it is what 2027 writes |
| LINE-D12 | Add F3's echo only; F8–F12's wait for the desktop | Only F3's is in the tables |
| LINE-D13 | DYN cannot be turned off: a Missing entry, not a feature now | Building it is a feature; the gap is recorded |
| LINE-D14 | SNAP gets its core (spacing, ON, OFF, Aspect); Legacy, Style, Type, Rotate to Missing | A partial command, never a reinvented one |
| LINE-D15 | `'ORTHOMODE` and the variables wait for SETVAR (roadmap row 24) | Ordered there already |
| LINE-D20 | Linetypes are acadiso.lin's | MEASUREMENT 1: the metric drawing's file |
| LINE-D21 | The dash phase is computed in world units and carried on the stroke | `cad-scene.md`: derived geometry in world units |
| LINE-D22 | LWDISPLAY stays on, with its WHY and a coverage note | Declared in AGENTS.md: no layouts or plotting |
| LINE-D23 | A line's Length and Angle become read-only — after the desktop confirms | The help marks them RO |
| LINE-D24 | A line's end grip stretches; Lengthen waits for the hover menu — after the desktop confirms | The help's default grip mode |
| LINE-D25 | A midpoint grip moves its own object — after the desktop confirms | The help |
| LINE-D26 | Linetype names stay drawing data; Spanish file names to Missing | `cad-catalogs.md`: data names stay data |
| LINE-D27 | True colour against index colour to Colour Missing | The model change outweighs the gap |
| LINE-D30 | A desktop block (DSK), with the owner's leave to use the mouse, settles the unverified cells; command-line input goes through COM, the rest by clicks and keys after a click in the drawing area | The only way to settle them |
| LINE-D31 | The aids take AutoCAD's dark-theme colours and placements (DSK-07) | AGENTS.md: a look that slows an AutoCAD user down is a finding |

Nothing here needs the owner but the approval itself: no data, publishing or spending.

## 7. Tests proposed

Regression tests first, each in its finding. Then the untested cells, by file:

- `LineTool.test.ts`: the refusals (p09, p23, p103), the geometry of p15, p31, p27, p03, Ctrl+Z at
  the first point (p103); prompts, messages and `<a` citing p01, p05, p07, p18.
- `locale.test.ts`: LIN-08, LIN-06's Spanish, `linea` and the unknown `_.LINEA` / `_L` (p104, p39).
- `englishSurface.test.ts`: LINE's walk with Enter on nothing, Continue from an arc, Undo at the
  first point.
- `dynamicInputEnter.test.ts`, `shortcutMenu.test.ts`: Enter and the right button at
  `Length of line:` (p114).
- `undoEcho.test.ts`, `undoCommand.test.ts`, `mredoCommand.test.ts`: UNDO Enter = 1 (p100), REDO and
  MREDO right after a command (p107); their `acc/…` citations replaced by p41–p43, p100, p106–p111,
  p113, which reconfirm them on 2027.
- `transparentCommands.test.ts`: `'ZOOM E` empty against with objects (p19, p112), `'_LINE` at
  `Command:` (p40).
- `snapping.test.ts`: the `of` / `to` / `de` / `a` echo, `_ENDP`, `_NEAR`, es FIN/MED/CER/NIN (p25,
  p32, p33, p156); `:131` citing p166.
- `coordinateInput.test.ts`, `lastPoint.test.ts`: `*` in a tilted UCS (p153), relative polar forms
  (p27), Ortho at the first point (p160), `<a` and a coordinate or snap after it (p161, p165);
  `acc/dd` citations moved to p159.
- `currentProperties.test.ts`, `elev.test.ts`, `tiltedUcs.test.ts`: LINE's layer, elevation,
  thickness and normal (p21, p22, p31, p44, p45), a locked layer (p201).
- `drawingFile.test.ts`, `CadRuntime.test.ts`: a line's `normal` and full property set through the
  file and the autosave.
- `SceneBuilder.test.ts`: tilted thickness in plan (p44).

## 8. What is not tested, and why

- Colours as such: the scene's tests pin ids and kinds; a colour is checked by eye against the
  desktop's screenshots (DSK-07).
- The scratch tests for cells already pinned elsewhere: they duplicate.

## 9. What could not be reviewed, and why

What the desktop passes did not reach (§4, DSK): Extension, Parallel and Insertion hovered, the
modes table's pairs with dynamic input, and Shift's temporary Ortho, which AutoCAD does not read
from a synthetic Shift (help only). Also not reviewed: the INS override's echo (the probe hung), Extension and
Parallel geometry, polar snap.

## 10. Refuted in the adversarial pass

| Suspicion | Why not |
| --- | --- |
| `#5,5` refused is a console artefact | d02: the desktop's command line refuses it too, so it is PIN-02 |
| UNDO 2 writes its names on two lines | the tracer's doing; untraced, one line (p100) |
| LINE's Undo under Control None removes the segment | it keeps it in AutoCAD too (p101) |
| Continue from a closed polyline | matches (p116) |
| Ortho bends a direct distance at the first point | matches (p160) |
| The angle override beats a snap | the snap wins (p165), as here |
| -OSNAP OFF keeps the modes with the off bit | OSMODE 0 in 2027 (p155), as here |
| A tilted LINE stores no normal; its thickness runs along +Z | both hold here (p22, p44) |
| A line's normal is lost on save | it survives (scratch test) |
| LINE refuses a locked current layer | neither does (p201) |
| FILLET's `Fillet radius is too big.` (table 22013) | the console writes `too large` (p60) |
| TEXT's `SIZ`, SPLINE's `raíz cuaDrada`, HATCH's `Designar objetos`, PLAN's `scp Actual`, ARRAYPATH's `Introduzca` | the console agrees with the catalog (p64–p69) |
| MPDUMP's Angle and Delta are the palette's | the .NET wrapper's, in other frames: no palette evidence |

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

Claims that do not hold:

- `docs/coverage/draw.md` LINE: Continue's tangent (LIN-02, LIN-03); "Undo steps back one segment
  at a time" (LIN-01, LIN-05, LIN-06); the zero-length Missing (LIN-07); "Ctrl+Z inside it is its
  Undo" only where Undo is on offer (UND-03).
- `docs/coverage/command-line.md`: the stale transparent entry (CLI-03), the `#` routing (LIN-09),
  `'FOO` without the F1 hint (CLI-01); Undo: `Nada que deshacer` (UND-01), the two composed
  refusals (UND-02), the Ctrl+Z claims (UND-03); SNAP "a toggle" (TRK-01); the unverified
  prepositions, settled (OSN-12).
- `docs/coverage/drafting-aids.md`: -OSNAP's `None` and "Enter keeps it" (OSN-08, OSN-09); FROM's
  Enter (OSN-05); the `of` echo in Missing (OSN-12); APP for APPint (OSN-10); no SNAP entry; Grips'
  "lengthen" and "multi-select move" (EDT-01, EDT-02).
- `docs/coverage/coordinate-systems.md`: `*` without a Z lies at WCS Z 0 in every UCS, not only a
  tilted one (PIN-01); LASTPOINT after FROM is the base (p164).
- `docs/coverage/properties.md`: Linetypes' patterns and acad.lin (RND-01, CPR-02); the palette's
  editable Length (EDT-03); nothing on LWDISPLAY's default (RND-03).

Settled unverified marks: es `PORCAPA` and `PorCapa` hold (p200, p205); `<S>` and `Control = Uno`
hold (p109, p111); `*` in a tilted UCS holds (p153).

| Rule | Claim | Code | State |
| --- | --- | --- | --- |
| `cad-tools.md` Ordering and undo | a tool's own Undo counts its own edits | `LineTool.ts:356` | broken (LIN-01) |
| `cad-runtime.md` Commands and history | a tool's Undo keyword steps back one | runtime | incomplete: transparent entries share the group |
| `cad-tools.md` Dynamic input | a point prompt re-asked at Enter refuses and returns `true` | `LineTool.ts:669-674` | broken (LIN-04) |
| `cad-tools.md` Answering, numbers | a bare number in a lone box is direct distance from the anchor | FROM's box | broken (OSN-06) |
| `cad-tools.md` Points | `*` reads WCS numbers | `coordinateInput.ts` | incomplete (PIN-01) |
| `cad-runtime.md` Snapping | an override is read after the prompt's keywords | `CadRuntime.ts:1121` reads it before | stale |
| `cad-catalogs.md` Messages | an unverifiable message is left out | `snapMode`, `fromBase`, `fromOffset`, `fromNeedsPoint` | broken (TRK-01, OSN-04) |
| `cad-engine.md` Style tables | transcribe a definition from AutoCAD's | `linetypes.ts` | broken (RND-01) |
| `cad-engine.md` Z and the normal | a line's ends through `lineStartZ` / `lineEndZ` | `selectToolGrips.ts:206-213` | broken (EDT-04) |
| `cad-tools.md` What a new object wears | a ghost in the rubber band's colour | `LineTool.ts:397` | wrong for LINE (DSK-01, d04) |

Behaviours without a rule: what an override does when it finds nothing; Ctrl+Z mid-command is `_u`
typed at the prompt; the dash phase.

## 12. Order of execution and estimate

One commit per block, in this order (each `fix(engine): LINE review — <IDs>`):

1. **CAT** — CAT-01. Minutes.
2. **UND** — UND-01, UND-02, UND-03, and the citations. An hour.
3. **CLI** — CLI-01 to CLI-03. An hour.
4. **LIN** — LIN-01 to LIN-09 (LIN-09 lands with PIN-02). Half a day.
5. **PIN** — PIN-01 to PIN-06. Half a day (PIN-03, PIN-04 touch `parseNumber` and the angle parser).
6. **OSN** — OSN-01 to OSN-12 (FROM's five together). Half a day.
7. **TRK** — TRK-01 (the SNAP tool, through skill `new-command`'s steps), TRK-02, TRK-03. Half a day.
8. **RND** — RND-01 to RND-03. Half a day.
9. **CPR** — CPR-01 to CPR-03 (notes and wording). An hour.
10. **DYN** — DYN-01, DYN-02 (notes). Minutes.
11. **DSK** — DSK-01 to DSK-08. Half a day.
12. **EDT** — EDT-01 to EDT-06. Half a day.
13. **FIL** — the tests of §7 only.

The blocks depend on nothing outside themselves.

## 13. Changes to coverage, rules, catalogs and roadmap

- **Coverage:** `draw.md` LINE; `command-line.md` (Command window, names, Undo); `drafting-aids.md`
  (overrides, -OSNAP, a SNAP entry, Grips, Dynamic input's Missing); `coordinate-systems.md`
  (`*`, LASTPOINT after FROM); `properties.md` (Linetypes, Lineweights, the palette, Colour).
- **Rules:** `cad-tools.md` (a tool's Undo and transparent steps; Ctrl+Z mid-command), `cad-runtime.md`
  (the override's order, what an override that finds nothing does), `cad-scene.md` (the dash phase).
- **Catalogs:** the messages and prompts above, in `en`, `es`, `ar` where they apply; the English
  surface snapshot where English changes.
- **Roadmap:** row 1 done with this plan's commit once executed. Analogues found while executing,
  for the reviews that own them: the own-Undo of PLINE, OFFSET, COPY (`PlacementTool`), FILLET,
  CHAMFER, TRIM and EXTEND (`EdgeEditTool`), DIMBASELINE and DIMCONTINUE (`DimensionChainTool`) and
  TEXTEDIT still call `ctx.undo()`, so a transparent command between two of their commits breaks them
  as LIN-01 broke LINE (`ctx.undoTo` is the fix); `lastDrawnDirection` (PLINE's first arc) and
  `lastDrawnPoint` still read a clockwise arc's stored end (LIN-02).

## 14. Template improvements

Confirmed by the owner and applied on 2026-10-21 (template §9), with the matrix's new rows P and Q,
every object snap three ways and the modes in combination:

1. **Subagents may probe and run scratch tests** in id ranges and folders of their own (template
   §4.8 says read-only). Here three of them wrote 45 probes and 230 scratch tests; read-only, the
   reviewer would have been the bottleneck. Nothing they write enters the repo but probe inputs.
2. **Undo-depth probes run untraced** (`<id>.plain.txt`, now in `probe.sh`): the tracer's own
   NETLOAD and MPTRACE leave undo steps, which made U look silent (annex-probes §2).
3. **The desktop's typed input goes through COM's SendCommand** wherever it is the command line
   being probed; keystrokes only for the tooltip, and a launched instance's profile read and put
   back on its own (annex-probes §4). Until the keystroke route works, desktop-only cells are
   planned as a session of their own.
4. **`es-several` and `no-source` are settled per command** (annex-catalogs §4): the sweep's owner
   settles what the tables can; which id a prompt uses needs the console at that prompt.
5. **A probe's trailing Enter at `Command:` repeats the last command** (p60, p61 repeated FILLET):
   end a probe on the command's own last answer (annex-probes §2).
6. **Session sizing** (template §1.4): with subagents probing, one session covered twelve blocks and
   about 110 probes; "about 30 probes" understated it.

## 15. Execution

| Block | Findings | Commit |
| ----- | -------- | ------ |
| CAT | CAT-01 (CAT-02 refuted, p70) | `4f61e91` |
| UND | UND-01 to UND-03 | `626b283` |
| CLI | CLI-01 to CLI-03 | `2625477` |
| LIN | LIN-01 to LIN-08 | `6a3ba75` |
| PIN | PIN-01 to PIN-06, LIN-09 | `bb1b4a4` |
