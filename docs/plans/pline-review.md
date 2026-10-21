# PLINE review

> **Status:** approved by the owner on 2026-10-21, §14 included; executing block by block in the
> review's own session. Second review of the order in `docs/coverage/roadmap.md` ("Command
> reviews"), with skill `command-review`. Phases 0–4 ran in one session, with three subagents and a
> desktop pass with the owner's mouse.

## 1. Summary

| Severity | PLN | PAC | POB | PDK | Total |
| -------- | --- | --- | --- | --- | ----- |
| Critical | 0   | 0   | 1   | 0   | 1     |
| High     | 3   | 0   | 1   | 0   | 4     |
| Medium   | 7   | 6   | 5   | 1   | 19    |
| Low      | 2   | 7   | 5   | 2   | 16    |

One finding corrupts a drawing: a closed polyline of two vertices (Close after one segment, or an
arc CLose after one arc) draws and measures without its closing segment, and a save and open drops
that segment's width (POB-01). The four highs are gestures a daily user makes:

- **The command:** PLINE's Undo after a transparent `'LTSCALE` or `'-COLOR` leaves the setting
  changed (PLN-01, LINE's LIN-01 again). After an arc drawn clockwise, Continue starts from the
  wrong end of the arc (PLN-02), and the first arc, Length and the chord's `<default>` head the
  wrong way (PLN-03, LINE's LIN-02 again, in `lastDrawnPoint` and `lastDrawnDirection`).
- **The object:** dragging a straight segment's midpoint grip inserts a vertex; AutoCAD's default
  stretches the segment, both vertices moving (POB-06, desktop d09).

The arc options' refusals are close to AutoCAD's, with differences at the edges (PAC). The widths,
their prompts, their Undo rule and PLINEWID all hold on 2027, unchanged from 2023's console. The
catalog sweep for PLINE's keys finds nothing to change.

## 2. Inventory

Reviewed on 2026-10-21 over `74e29ae`, AutoCAD 2027 (ACADVER 26.0, `_VERNUM` X.118.0.0), string
tables regenerated 2026-10-20 (PLINE's ids 21286–21328). Baseline green: typecheck and the 18 test
files that build a polyline (850 tests).

**The command's own surface:** `cad/application/tools/PolylineTool.ts` and what it imports
(`arcSegmentInput.ts`, `lastDrawnPoint.ts`, `currentProperties.ts`, `directDistance.ts`,
`ucsHeading.ts`), `cad/geometry/bulgeArcs.ts`; `defaultTools`, `TOOL_COMMANDS`; PLINE's keys in
`cad/locales/en.json`, `es.json`, `ar.json`; the rail's entry, `content/commands.ts`; the coverage
entry in `docs/coverage/draw.md`. Tests: `polylineArcs.test.ts`, `polylineWidths.test.ts`, the
PLINE parts of `drawing.test.ts`, `englishSurface.test.ts`, `locale.test.ts`,
`currentProperties.test.ts`, `elev.test.ts`, `elevation.test.ts`, `ambiguousKeywords.test.ts`,
`selection.test.ts`, `inquiry.test.ts`.

**The object:** `cad/domain/polylines.ts`, `cad/domain/polylineOutline.ts`, the polyline in the
entity modules; its grips (`selectToolGrips.ts`, `SelectTool.ts`), its palette rows
(`EngineState.ts`), its scene (`SceneBuilder.ts`), its part of `cad/serialization/drawingFile.ts`
and the clipboard.

**Related tools:** DIST's Arc (`MeasureTool.ts`), which shares `ArcSegmentInput`; ARC and LINE as
what Continue and the first arc read; U, UNDO, REDO, MREDO after PLINE; the current-property
commands as far as PLINE's object goes; PEDIT, reached by a double-click (not built).

**Areas this review owns** (roadmap row 2): the polyline object — widths, bulges, its grips, its
palette rows, how it draws and files (POB) — and the polyline's arc prompts, DIST's Arc too (PAC).
**Cited from LINE's review** (`git show 16b4188:docs/plans/line-review.md`), only PLINE's contract
checked: the command line, point input, object snaps, Ortho, Polar, OTRACK, dynamic input, undo,
current properties, grips, the palette, files, render.

**Method:** the reviewer ran console probes p01–p44 and the desktop (d01–d12), then three
subagents reviewed PLN's remaining rows, PAC and POB, each probing in its own range (p150–p195,
p100–p149, p200–p236) with scratch harness tests in `research/review/pline/` (gitignored; 194
tests, each failure a `differs` once the reviewer's own were cleared of two harness conventions —
the drawing's 2-place precision, deliberate, and the history's lines without `Command:`). The
reviewer verified in person every critical and high: POB-01 (p227, scratch), PLN-01 (p26, p43,
scratch), PLN-02 and PLN-03 (p32–p37, scratch), POB-06 (d09, scratch), and spot-checked p178,
p118 and p111.

**The desktop** ran on a launched instance whose profile is English (LOCALE ES, DYNMODE 3,
SHORTCUTMENU 11); settings were read and put back, and the instance was quit. Spanish palette and
grip-menu labels were therefore not seen (§9).

## 3. Probes

Console inputs are `scripts/research/probes/pline/<id>.txt` (`.plain.txt` runs untraced), run with
`scripts/research/probe.sh pline <ids>` in es-ES and en-US; the desktop's are `dsk.sh`. Transcripts,
plots and screenshots are in `research/probes/pline/` (gitignored). MPDUMP's LWPOLYLINE `vertices`
are `[x, y, bulge, startWidth, endWidth]`.

| Id | What it asks |
| --- | --- |
| p01 | prompts, `Current line-width is`; the first segment's list has no Close (21321) |
| p02 | Undo to nothing: `All segments already undone.` (es `Ya están deshechos todos los segmentos.`) |
| p03 | Close; LASTPOINT after it is the last vertex |
| p04 | Close after one segment: closed, two vertices, Length 20 |
| p05 | `_C` at the first segment: `2D point or option keyword required.` |
| p06 | Enter at the start point: Continue from a line |
| p07, p08 | Continue and a first arc after a symmetric clockwise arc (inconclusive; p32–p37 replace them) |
| p09 | the first arc after a 45° line: bulge −0.4142 |
| p10 | FOO at each prompt; an arc end straight ahead `*Invalid*` |
| p11–p13 | es only: `POL`, `A`, `N`, `H`, `C`; `MITAD`; `MITADG` at the first prompt re-asks silently |
| p14 | `'_PLINE` at CIRCLE's prompt refused |
| p15 | Enter at `Command:` repeats PLINE |
| p16 | LASTPOINT after PLINE's Undo is the vertex left |
| p17 | typed `@` adds a zero-length vertex |
| p18 | a 3D start sets Elevation; `@0,10,5` and `20,20,7` refused at the next point |
| p19, p20 | `#5,5` and `*20,0` refused at the next point; `d<a`, `@d<a`; UCS Z 30 |
| p21, p22 | a bare number; Ortho ignores a typed point |
| p23 | `'ZOOM E` (regen), `'ORTHOMODE`, `'-OSNAP`, `'CIRCLE`; es `Reanudando el comando POL.` |
| p24ᵖ, p25 | U, REDO, UNDO 2, MREDO after PLINE echo `PLINE` |
| p26, p27 | `'LTSCALE 2` / `'-COLOR 1` then PLINE's Undo: the setting back, the segment gone |
| p28 | END and MID overrides with typed points; an arc after them |
| p29 | `_TAN` at the start point: `No found for specified point.`, `Invalid point.`; `_PER` at the next |
| p30 | `_PL`, `_.PLINE`, `pline` (es `_PL` unknown) |
| p31 | Undo at the first segment, twice |
| p32 | Continue after a clockwise arc (ARC 0,10 7.0710678,7.0710678 10,0) starts at (10,0) |
| p33, p34 | the first arc and Length's first segment after it head (0,−1) |
| p35 | Continue and an arc |
| p36 | Angle 90 after it |
| p37 | Radius → Angle: the chord's default `<270>` |
| p38 | LASTPOINT after a refused arc end stays the start |
| p39, p40, p41 | `'-COLOR`, `'ELEVATION`, `'PLINEWID` mid-PLINE: the polyline keeps the start's |
| p42 | UNDO Control None: PLINE's Undo removes nothing |
| p43, p44 | PLINE's Undo goes back to a mark before each segment, a transparent change after it with it |
| p100–p108 | arc keywords: `S`, `SECOND`, es `SEGUNDO`, `SEGUNDOPTO`, `C` (`CEnter or CLose?`), `CE`, `CEN`, `CENTER`, hidden `ARc` |
| p109–p114 | Angle: ±90, 0 and 360 (`Value must be nonzero.`), CEnter, Radius, the chord's default, `'AUPREC` |
| p115 | DIST's Arc after a clockwise arc; `_T` refused |
| p116–p125 | CEnter, Direction, Radius, Second pt geometry, every `*Invalid*` (back to the arc prompt) |
| p126–p130 | arc CLose, Undo of an arc, `_CL` and `@` at the first arc prompt |
| p131–p136 | each option's path: Enter, FOO, 0, negative, another prompt's keyword |
| p137–p141 | points at sub-prompts: 3D, `*`, `#`, `@` from LASTPOINT, a bare number, two points |
| p142–p144 | transparent commands at sub-prompts; `'LTSCALE` survives the arc's Undo |
| p145–p148 | DIST's Arc: Radius, Angle, CEnter's Angle wording, Line, Total, CLose, Undo |
| p149 | table 21314, `Previous direction not UCS parallel, using 0.` |
| p150, p151 | es `POL`, `PL`; `'_PLINE` at `Command:` |
| p152–p165 | Length: Enter, FOO, a point, −5, 0, after an arc, a line, a closed polyline, a circle, nothing; UCS Z 30; Close variants; U after Close |
| p166–p172 | point forms at the start; UCS X 90; ELEVATION 5; LASTPOINT after Length and Enter |
| p173–p177 | TAN at the next point, FROm, Ortho with a distance, an override finding nothing, Close after a zero segment |
| p178, p184, p186, p191 | Enter at the start with nothing to continue: starts at the WCS origin, silently |
| p179–p183 | Enter at the first next point; `_CIRCLE` / `_LINE` typed; properties before and mid-PLINE |
| p185, p188–p190 | Continue whatever LASTPOINT, after an arc-ended, a closed polyline, a circle |
| p187 | a long transcript against the history |
| p192–p195 | END at Length; the first arc in UCS Z 30; es widths' refusal; direct distance 0 and −5 |
| p250–p258 | block PAC's: CEnter's included 0 and 360 `*Invalid*`; `ID @` after a refused option (the arc's start); a negative radius at the chord, after Angle or Radius; p258 the chord's `<30>` in UCS Z 30 (refuted a suspicion) |
| p200–p207 | Width and Halfwidth: defaults, refusals, a point, arc mode, Close, PLINEWID, U |
| p208–p218 | the width's Undo rule, eleven cases (2023's acc/w3–w7 hold) |
| p219–p227 | THICKNESS and ELEVATION, UCS X 90, back to the start, `@` with a taper, DXF codes, two vertices closed by an arc |
| p230–p236 | plots: wide joins, FILLMODE 0, DASHED along polylines, mitre limits, wide arcs |
| d01–d12 | desktop (`dsk.sh`): the ribbon's Polyline, the rubber band's colour, Escape, a wide and an arc jig, Ctrl at the pick, the right button, Ctrl+Z, dynamic input, the grips and their menus, the palette, grip drags, double-clicks, wide joins on screen |

## 4. Matrix

Columns, where they differ: **SP** start point · **NF** next point, first segment · **NL** next
point, later · **LL** `Specify length of line:` · **AE** the arc endpoint prompt · **SUB** an arc
option's sub-prompts. A cell is `state · probe · test`; scratch tests are in
`research/review/pline/<R|A|B|C>/`.

### PLN — the command

| Row | SP | NF / NL | LL | AE / SUB |
| --- | --- | --- | --- | --- |
| A names, aliases, echo, repeat | match · p30, p150, p15 · `locale.test.ts:404` | | | |
| A `'PLINE` | untested · p14, p151 | | | |
| A the rail | match · d01 `_pline` · scratch R/desk | | | |
| B text en, es | match · p01 · `drawing.test.ts`, `polylineArcs.test.ts:260` | match · p01 | match · p152 | see PAC |
| B keywords, Spanish capitals | n/a | match · p11 · `ambiguousKeywords.test.ts:246`; `MITADG` at NF known | | see PAC |
| B `FOO` | match · p10 | match · p10 | match · p152 · `polylineArcs.test.ts:205` | match · p10 |
| B `0`, `@`, negative | `@` untested · p17 | typed `@` match · p17; direct distance 0 and − **PLN-23** · p195 | match · p154 | |
| B Close, Close after one segment, back to the start | | untested · p03, p162–p164, p177; two vertices **POB-01** | | |
| B Enter | nothing to continue **PLN-22** · p178 | ends · p01 · `drawing.test.ts` | refused · p152 | refused · PAC |
| B Continue | from a line, a closed polyline, past a circle: untested · p06, p185–p190; clockwise arc **PLN-02** · p32 | | | |
| B the way the chain heads | | | after a clockwise arc **PLN-03** · p34; with nothing drawn, UCS X **PLN-21** · p161 | **PLN-03** · p33, p37; **PLN-21** · p193 |
| C point forms | match · p18, p166–p172 | 3D and `*` **PLN-04** · p18–p20 | a point · p153 | 3D and `*` **PLN-04** · p137 |
| C LASTPOINT | after Close, Undo, Enter: match · p03, p16, p179 | after a refused arc **PLN-07** · p38 | after Length **PLN-20** · p153, p171 | |
| D overrides | `_TAN` **PLN-05** · p29 | END, MID, PER, FROm, CEN missing: untested · p28, p29, p173–p176 | END untested · p192 | `_CEN` at a centre · p106 |
| D Ortho, Polar, OTRACK | | Ortho match · p22, p175 | | |
| E transparent | | match · p23 · scratch R/core; `'ORTHOMODE` owned (TRK-02) | | owned · p142, p143 |
| F own Undo | | | | |
| F — every depth, after Length, the mode it returns to | | match · p02, p31, p160 · `drawing.test.ts` | | match · p128, p129 |
| F — after a transparent command | | **PLN-01** · p26, p27, p43, p44 | | p144 (must not regress) |
| F — under UNDO Control None | | **PLN-08** · p42 | | |
| F Ctrl+Z | | match (`_u`) · d05 · scratch A | | |
| F U, REDO, UNDO n, MREDO after | match · p24, p25 | | | |
| G Escape | | keeps the chain, `*Cancel*` · d01, d02 · `drawing.test.ts` | | |
| G another command typed | | refused, `_LINE` is `LIne` · p180 | | |
| H geometry, plane, Normal | match · p18, p169, p170 · scratch A | | | |
| H properties set before | untested · p181 · `currentProperties.test.ts:51`, `elev.test.ts:153` | | | |
| H properties set mid-command | | **PLN-06** · p39, p182, p183; ELEVATION match · p40 | | |
| K es | match · p01, p152, p176, p187 | | | |
| L history | match · p187 · scratch A | | | |

### PAC — the polyline's arc prompts

| Row | AE | SUB |
| --- | --- | --- |
| B text en, es | match (the line break after `or` known) | match · p131–p136, p145 · `polylineArcs.test.ts:60`, `:101`, `:186` |
| B keywords | `S`, `SECOND`, `C` → `CEnter or CLose?` match · p100, p103; es `CE` **PAC-08** · p104; es `SEGUNDOPTO` **PAC-09** · p101 | another prompt's keyword refused · p131, p133 |
| B Enter, FOO | match · p10 · `polylineArcs.test.ts:159` | match but Direction's Enter **PAC-06** · p134 |
| B 0, 360, negative | | included 0 / 360 **PAC-02** · p110, p111; radius − and 0 **PAC-03** · p122, p136; Angle→Radius 0 **PAC-04** · p131; chord 0 **PAC-05** · p133 |
| H geometry | match · p109, p112–p117, p119, p121, p124 · `polylineArcs.test.ts:60`, `:85` | an impossible end re-asks the sub-prompt **PAC-01** · p118–p125 |
| G CLose, Line, Undo | match · p126–p129 · `polylineArcs.test.ts:116`, `:148` | |
| C points | | `@` from the arc's start **PAC-07** · p138; 3D, `*` PLN-04 · p137; two points for a radius match · p140 |
| E transparent | | `'AUPREC` rewrites the default **PAC-10** · p114 |
| O table 21314 | | **PAC-11** · p149 |
| DIST's Arc | prompts, Line, CLose match · p145, p147 · `inquiry.test.ts:334`; Undo **PAC-12** · p148; CEnter's Angle **PAC-13** · p145; clockwise arc PLN-03 · p115 | |
| Ctrl | at the pick turns the arc (bulge 2.288) · d03 · `polylineArcs.test.ts:171` | each sub-prompt's Ctrl: unverified (§9) |

### POB — the polyline object

| Row | Cell |
| --- | --- |
| Width, Halfwidth: wording, `<default>`, Enter, 0, negative, FOO, a point | match · p200–p202 · `polylineWidths.test.ts:56`, `:98`; Halfwidth refusals untested |
| Width in arc mode, going on, Close, arc CLose | match · p203–p205 · `polylineWidths.test.ts:112`, `:131` |
| PLINEWID: set with nothing drawn, after Escape, U | match · p206, p207, d02 · `polylineWidths.test.ts:154` |
| The width's Undo rule | match, as 2023 · p208–p218 · `polylineWidths.test.ts:176`–`:287` |
| The rubber band at the width prompts | **POB-09** · p200, d06 |
| THICKNESS, ELEVATION, UCS X 90, `@` with a taper, back to the start | untested · p219–p225 |
| A closed polyline of two vertices | **POB-01** · p04, p227 |
| Files: widths, bulges, properties through save, autosave, the clipboard; DXF codes | match · scratch C; p226; two vertices POB-01 |
| Render: mitres; FILLMODE 0 | right angles match · p230, p231, d12 · `polylineOutline.test.ts:13`; sharp corners **POB-03** · p233, p235; arc into a line **POB-04** · p236; arc wider than its diameter **POB-05** · p234; FILL-off lineweight **POB-10** · p231 |
| Render: linetype with PLINEGEN 0 | **POB-02** · p232; PLINEGEN 1 known |
| Grips: where, shapes | vertex squares, midpoint rectangles along the segment · d07; match in place, shape differs (cosmetic, POB-07) |
| Grips: a line segment's midpoint dragged | **POB-06** · d09 |
| Grips: a vertex dragged next to an arc | **POB-12** · d09 |
| Grips: an arc's midpoint dragged | match · d09 · `selection.test.ts:459` |
| Grips: hover menus, Ctrl+click | **POB-07** · d07 |
| The palette | **POB-08** · d08 |

### PDK — the desktop session

2026-10-21, a launched instance's English profile, the owner's mouse (`dsk.sh`).

| Row | Gesture | AutoCAD | mellowcad | State |
| --- | --- | --- | --- | --- |
| P | Polyline from the ribbon | `Command: _pline` (d01) | `_pline` | match |
| P, Q | the rubber band and the chain so far | in CECOLOR, red (d01) | `THEME.rubberBand` | **PDK-01** |
| P | Escape | the chain kept, `*Cancel*`; PLINEWID set (d01, d02) | the same | match |
| P, Q | a wide segment's jig | the tapered band, a dimmer shade (d02) | the band as drawn | match (shade: PDK-01) |
| P, Q | arc mode's jig | the wide arc and a dashed orange chord from its start (d03, d06) | the arc only | **PDK-02** |
| P | Ctrl held at the arc's pick | the other way (d03) | `polylineArcs.test.ts:171` | match |
| P | the right button at NL and AE | Enter, Cancel, Recent Input ▸ · the prompt's options as listed · Osnap Overrides ▸ · Pan, Zoom, SteeringWheels · QuickCalc (d04) | the same but known gaps | match (Recent Input, Pan, Zoom known) |
| F | Ctrl+Z | `_u` at each prompt (d05) | the same | match |
| D | dynamic input | length and angle at NL, ⬇ lists the options, Width's box with a dashed line from the last vertex, Length's box with the measuring line, the arc's pointer fields (d06) | | match but POB-09 |
| I | grips and menus | d07 | | POB-07 |
| I | the palette | d08 | | POB-08 |
| I | grip drags | d09 | | POB-06, POB-12 |
| P | a double-click on a polyline at `Command:` | PEDIT's `Enter an option [Close/Join/Width/Edit vertex/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:` (d10) | nothing | **PDK-03** |
| P | a double-click at NL | one vertex (d11) | `PolylineTool.ts:200` · scratch R/desk | match |
| M | wide joins, FILLMODE 0 on screen | mitred where widths meet, square where they change; outlines with each segment's ends and an arc's facets (d12) | | POB-03, POB-10 |

## 5. Findings

Each finding's scratch test is in `research/review/pline/<R|A|B|C>/`; in the execution it moves into
the file named as its regression test, citing its probe.

### Critical

#### POB-01 — a closed polyline of two vertices loses its closing segment

- **Severity:** critical · **Row:** H, J, M · **Status:** verified
- **Where:** `cad/domain/polylines.ts:124` (`closed && vertices.length > 2`); `parseWidths` in
  `cad/serialization/drawingFile.ts`; `polylineConstantWidth`
- **AutoCAD:** p04 `0,0 10,0 _C`: closed, Length 20. p227 `0,0 W 2 / A 10,10 / W 4 / CL`: bulges
  0.4142 and 2.4142, widths 2 and 4, Length 62.83, Area 314.16, a whole circle
- **mellowcad:** both bulges and widths stored, but Length 10 (p04) and 15.71 (p227), one band
  drawn, and after save and open the widths are `[[2, 2]]` (scratch C/object.test.ts, four failures)
- **Scenario:** an arc CLose after one arc → half a circle shows, the area is wrong, and the file
  drops the second width
- **Fix:** a closed polyline closes from two vertices in `polylineSegments` and every reader of
  it; `parseWidths` counts the closing segment
- **Regression test:** `cad/domain/` polyline tests and `drawingFile.test.ts`, citing p04, p227
- **Coverage, rules:** `cad-engine.md`'s "whose closing segment needs three" is stale

### High

#### PLN-01 — PLINE's Undo after a transparent command leaves that command's change

- **Severity:** high · **Row:** F · **Status:** verified
- **Where:** `cad/application/tools/PolylineTool.ts:510` (`undoLastVertex`, a local rollback only)
- **AutoCAD:** p26 `@10,0 @0,10 '_LTSCALE 2 _U`: `Regenerating model.`, LTSCALE 1, the second
  segment gone; p27 the same for `'-COLOR`; p43 a change before the last segment stays at the
  first Undo and goes at the second; p44 a Width answered after the change keeps it
- **mellowcad:** scratch R/core p26, p43: LTSCALE stays 2, no `Regenerating model.`
- **Fix:** mark `ctx.historyDepth()` when each segment is added (after its arc sub-prompts, p144),
  and Undo takes back with `ctx.undoTo(mark)` before the local rollback, as LINE does (LIN-01)
- **Regression test:** `drawing.test.ts`'s PLINE block, citing p26, p27, p43, p44, p144

#### PLN-02 — Continue after an arc drawn clockwise starts at its far end

- **Severity:** high · **Row:** B · **Status:** verified
- **Where:** `PolylineTool.ts:650` (`lastDrawnPoint(ctx.document)`, no LASTPOINT)
- **AutoCAD:** p32: `ARC 0,10 7.0710678,7.0710678 10,0`, then PLINE Enter `@5,0` → (10,0)–(15,0)
- **mellowcad:** (0,10)–(5,10) (scratch R/core p32)
- **Fix:** `continuePoint(ctx.document, ctx.lastPoint)`, as LINE's Continue (LIN-02)
- **Regression test:** `drawing.test.ts`, citing p32

#### PLN-03 — after an arc drawn clockwise, the chain heads the wrong way

- **Severity:** high · **Row:** B · **Status:** verified
- **Where:** `lastDrawnDirection` (`lastDrawnPoint.ts`), read by `PolylineTool.ts:602` and DIST
- **AutoCAD:** after the arc of p32 (drawn end (10,0), heading (0,−1)): a first arc to `@10,0` is a
  half circle, bulge 1 (p33); Length 10 goes to (20,−10) (p34); Radius → Angle offers `<270>` (p37);
  DIST's Arc the same (p115)
- **mellowcad:** heading (−1,0) from the stored end: the arc a near-full circle (bulge −4.9e8, the
  end within 1e-8 rad of straight back), Length to (10,0), `<180>` (scratch R/core, B/pac:114, :291)
- **Fix:** `lastDrawnDirection` takes LASTPOINT and reads a clockwise arc from its drawn end
- **Regression test:** `polylineArcs.test.ts`, `inquiry.test.ts`, citing p33, p34, p37, p115

#### POB-06 — a straight segment's midpoint grip inserts a vertex; AutoCAD stretches the segment

- **Severity:** high · **Row:** I · **Status:** verified
- **Where:** `cad/application/tools/selectToolGrips.ts:122` (`addVertex` role), `SelectTool.ts`
- **AutoCAD:** d09: `10,60 30,60 A 40,70 L 55,70`, the midpoint grip (20,60) dragged to (20,55):
  vertices (10,55.03) and (30,55.03), the arc after it re-bulged to 0.1702 (POB-12); menu d07
  `Stretch`, `Add Vertex`, `Convert to Arc`
- **mellowcad:** a new vertex at (20,55) (scratch R/desk, C; `selection.test.ts:424` pins it)
- **Fix:** the midpoint grip stretches its segment (both ends moved, the neighbouring arcs through
  their old midpoints); Add Vertex waits for the hover menu (Missing)
- **Regression test:** `selection.test.ts`, citing d09

### Medium

#### PLN-04 — a 2D point prompt takes a typed Z and `*x,y`

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** the runtime's `"point2d"` answer path; `PolylineTool.ts:822`, `arcSegmentInput.ts:312`
  parse typed text themselves
- **AutoCAD:** p18 `@0,10,5`, `20,20,7`; p19, p20 `*20,0`; p137 at CEnter's centre: refused,
  `2D point or option keyword required.` / `Invalid 2D point.`
- **mellowcad:** taken and projected (scratch R/core p18, p19; B/pac:241)
- **Fix:** refuse at the command line; the dynamic-input box keeps what it takes today
  (`elevation.test.ts:154`), unverified on the desktop (PLINE-D3)

#### PLN-05 — `_TAN` at the start point is taken

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD:** p29: `No found for specified point.`, `Invalid point.`, the start asked again
- **mellowcad:** the polyline starts at the picked point (scratch R/core p29)
- **Fix:** PLINE does not defer: the override finds nothing with no base (PLINE-D4)

#### PLN-06 — properties set mid-command reach the polyline; AutoCAD fixes them at the start

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `PolylineTool.ts:558` (`withCurrentProperties` at commit)
- **AutoCAD:** p39 `'-COLOR 1` mid-PLINE: the polyline stays BYLAYER; p182, p183: the layer,
  CELTYPE, CELWEIGHT, THICKNESS the same; p40 ELEVATION holds here already
- **mellowcad:** red, and the others too (scratch R/core p39; A :330–:350)
- **Fix:** take the current properties at `beginDrawing` (PLINE-D10)

#### PLN-20 — Length does not move LASTPOINT to the vertex it adds

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p171 `L 5`, `ID @` → `X = 15.0000`; p153 a point at Length → the new vertex
- **mellowcad:** the vertex before (scratch A :61, :181)
- **Fix:** `ctx.setLastPoint(end)` in `commitLength`

#### PLN-21 — with nothing drawn, the chain heads along the world X, not the UCS's

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `PolylineTool.ts:602` (`?? { x: 1, y: 0 }`)
- **AutoCAD:** UCS Z 30: p161 `L 10` → (8.6603, 5); p193 `A @0,10` → bulge 1
- **mellowcad:** (10,0); bulge 1.732 (scratch A :96, :409)
- **Fix:** the UCS's X (`cad-tools.md`: "A new orientation default starts at the UCS X axis")

#### PLN-22 — Enter at the start point with nothing to continue ends PLINE

- **Severity:** medium · **Row:** G · **Status:** verified
- **Where:** `PolylineTool.ts:650` (`if (!resume) return false`)
- **AutoCAD:** p178, p184, p186, p191: the polyline starts at the WCS origin, silently, whatever
  LASTPOINT and the UCS origin
- **mellowcad:** PLINE ends; the next answer is `Unknown command "0,0"` (scratch A :256–:272)
- **Fix:** start at the WCS origin (PLINE-D13); a tilted UCS unverified

#### PLN-23 — a direct distance of 0 or a negative one is ignored

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `PolylineTool.ts:786` (`if (!(distance > 0)) return`)
- **AutoCAD:** p195: `0` adds a zero-length vertex, `-5` runs the other way
- **mellowcad:** nothing added (scratch A :386–:408)
- **Fix:** drop the guard; `pointAlongCursor` and `appendVertex` already take both

#### PAC-01 — `*Invalid*` at an option's last answer asks that sub-prompt again

- **Severity:** medium · **Row:** B, H · **Status:** verified
- **Where:** `cad/application/tools/arcSegmentInput.ts:456` (`complete`)
- **AutoCAD:** p118 (a chord longer than the diameter), p119, p120 (Direction's end straight back
  or ahead), p123 (a Radius end beyond the diameter), p125 (Second pt collinear): `*Invalid*`, then
  the arc endpoint prompt
- **mellowcad:** the sub-prompt again (scratch B/pac:132–:164)
- **Fix:** cancel the option and ask the arc prompt (PLINE-D20)

#### PAC-02 — Angle's included angle takes 0 and 360

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p110, p111: `Value must be nonzero.` (es `El valor debe ser diferente de cero.`)
- **mellowcad:** 360 stores a bulge of 1.6e16 (scratch B/pac:88)
- **Fix:** refuse what normalises to 0 with a new `valueMustBeNonzero` (table 22257), CEnter's too
  (PLINE-D21)

#### PAC-03 — Radius refuses a negative radius; AutoCAD draws the major arc

- **Severity:** medium · **Row:** B, H · **Status:** verified
- **AutoCAD:** p122: −10 then a chord of 10 → bulge 3.7320508; p136: 0 `Value must be nonzero.`
- **mellowcad:** `Value must be positive and nonzero.` (scratch B/pac:148, :233)
- **Fix:** a negative radius is the major arc; `radiusArcBulge` takes it (PLINE-D22)

#### PAC-06 — Direction's tangent refuses Enter; AutoCAD keeps the way the chain heads

- **Severity:** medium · **Row:** B, G · **Status:** verified
- **AutoCAD:** p134: AllowNone; Enter then 10,20 after a line north → bulge −0.4142
- **mellowcad:** `Requires valid numeric angle or second point.` (scratch B/pac:223)
- **Fix:** an empty answer gives the start tangent, no `<default>` shown (PLINE-D23)

#### PAC-07 — `@` at a sub-prompt is relative to the arc's start, not LASTPOINT

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p138: Second pt `@5,5` then `@5,-5` ends at (20,0)
- **mellowcad:** (15,−5) (scratch B/pac:246)
- **Fix:** `lastPoint: ctx.lastPoint` in `typedPoint` (PLINE-D24)

#### PAC-12 — DIST's Undo of an arc goes back to the line prompt; 2027 stays in Arc

- **Severity:** medium · **Row:** F · **Status:** verified
- **Where:** `cad/application/tools/MeasureTool.ts:738`
- **AutoCAD:** p148: `_U`, `Distance = 10.0000`, the arc prompt again
- **mellowcad:** the line prompt (scratch B/pac:312; `inquiry.test.ts:375` pins 2023's)
- **Fix:** DIST keeps the mode; PLINE keeps its own rule (p128, p129) (PLINE-D27)

#### POB-02 — a polyline's linetype runs on from its start; AutoCAD lays it per segment

- **Severity:** medium · **Row:** M · **Status:** verified
- **Where:** `SceneBuilder.ts:939`
- **AutoCAD:** p232, DASHED, PLINEGEN 0: each segment laid as a line of its length, the dashes at
  a vertex merging; segments shorter than a period solid; PEDIT's help (GUID-648BDC21)
- **mellowcad:** one dashed path with no phase
- **Fix:** each segment through LINE's centred pattern (RND-02), arcs probed first (PLINE-D31)

#### POB-03 — sharp corners mitred up to 50 half-widths; AutoCAD stops at 4

- **Severity:** medium · **Row:** M · **Status:** verified
- **Where:** `cad/domain/polylineOutline.ts:27`, `:89`
- **AutoCAD:** p235: mitred at 29°, not at 28° (the tip 4 half-widths out); beyond, each band ends
  square at the vertex, overlapping (p230, p233, d12)
- **Fix:** mitre limit 4, square ends beyond (PLINE-D32)

#### POB-07 — the polyline's grip menus are missing and Ctrl+click is a gesture of our own

- **Severity:** medium · **Row:** I · **Status:** verified
- **Where:** `SelectTool.ts:178` (Ctrl+click removes a vertex)
- **AutoCAD:** d07: a vertex `Stretch Vertex`, `Add Vertex`, `Remove Vertex` with the segments'
  lengths shown; a straight segment's midpoint `Stretch`, `Add Vertex`, `Convert to Arc`; an arc's
  `Stretch`, `Add Vertex`, `Convert to Line` with its radius; midpoint grips are rectangles along
  the segment; Ctrl after a grip is hot cycles the menu (help GUID-BBEA1F71)
- **Fix:** drop Ctrl+click; the menus go to Grips Missing (PLINE-D35)

#### POB-08 — the palette's rows are not AutoCAD's

- **Severity:** medium · **Row:** I · **Status:** verified
- **Where:** `EngineState.ts:1036`
- **AutoCAD:** d08: General (Color, Layer, Linetype, Linetype scale, Plot style, Lineweight,
  Transparency, Hyperlink, Thickness) · 3D Visualization (Material) · Geometry (Current Vertex,
  Vertex X, Vertex Y, Start segment width, End segment width, Global width, Elevation, Area, Length —
  the last two greyed) · Misc (Closed `No`, Linetype generation `Disabled`)
- **mellowcad:** Closed read-only under Geometry, `Vertex`, extra `Vertices` and `Segments` rows
  (scratch C)
- **Fix:** AutoCAD's rows and groups; Closed editable (PLINE-D36)

#### POB-12 — a vertex grip keeps the next arc's bulge; AutoCAD bends it through its old midpoint

- **Severity:** medium · **Row:** I · **Status:** verified
- **Where:** `replacePolylineVertex` (via `withVertexAt`, `selectToolEdits.ts:24`)
- **AutoCAD:** d09: vertex (30,60) dragged to (30,55.03): the arc to (40,70) from 0.4142 to 0.1702,
  exactly the arc through its old midpoint (37.0711, 62.9289); the segment stretch the same
- **mellowcad:** 0.4142 kept (scratch R/desk)
- **Fix:** a moved vertex re-bulges each neighbouring arc through its old midpoint
  (`arcThroughBulge`) (PLINE-D9)

#### PDK-01 — the rubber band and the chain so far are a fixed colour

- **Severity:** medium · **Row:** Q · **Status:** verified
- **Where:** `PolylineTool.ts:343` (`THEME.rubberBand`)
- **AutoCAD:** d01: red with CECOLOR 1, the jig of a wide segment a dimmer shade (d02)
- **Fix:** `currentColor(ctx)`, as LINE (DSK-01)

### Low

- **PLN-07** — a refused arc end moves LASTPOINT (p38: it stays the start; scratch R/core p38).
  Fix: no LASTPOINT for an answer the tool refuses with `*Invalid*`.
- **PLN-08** — under UNDO Control None PLINE's Undo removes the segment; AutoCAD removes nothing
  (p42). Fix: follow the console (PLINE-D1).
- **PAC-04** — Angle → Radius refuses 0; AutoCAD takes it, a zero-length segment (p131).
- **PAC-05** — CEnter's chord 0 says `*Invalid*`; AutoCAD `Value must be nonzero.` (p133).
- **PAC-08** — es `CE` at the arc prompt opens cEntro; AutoCAD takes Cerrar (p104 es):
  `matchKeywords` prefers the keyword whose capitals start its word (PLINE-D26).
- **PAC-09** — es `SEGUNDOPTO` refused at the first arc prompt, which declares `Segundopto`
  (21326, p101); the later one declares `Segundo` (21301) (PLINE-D25).
- **PAC-10** — after `'AUPREC` at the chord prompt, the default is rewritten at the new precision;
  AutoCAD keeps `<79>` (p114).
- **PAC-11** — table 21314 `Previous direction not UCS parallel, using 0.` never said (p149).
- **PAC-13** — DIST's CEnter → Angle is `Specify included angle:` in 2027 (no Ctrl clause) and reads
  a point (p145) (PLINE-D28).
- **POB-04** — an arc meeting a line at an angle gets a wedge; AutoCAD cuts the line's band along
  the arc's end radius (p236; `polylineOutline.test.ts:51` pins the wedge).
- **POB-05** — an arc band wider than the diameter crosses the centre; AutoCAD stops there (p234).
- **POB-09** — no rubber band at the width prompts; AutoCAD's a dashed line from the last vertex
  (p200 trace, d06).
- **POB-10** — with FILL off a wide band's outline ignores the lineweight; the plot draws it (p231);
  on screen unverified.
- **POB-11** — 2023 citations (`acc/w1–w7` in `polylineWidths.test.ts`, the coverage entry) to the
  2027 probes p200–p218; `polylineOutline.ts` comments false (POB-03, POB-04).
- **PDK-02** — arc mode's jig lacks the dashed chord from the arc's start (d03, d06).
- **PDK-03** — a double-click on a polyline opens PEDIT in AutoCAD (d10); PEDIT is not built: to
  PLINE's and DBLCLKEDIT's Missing.

## 6. Decisions taken

| Id | Decision | Why |
| --- | --- | --- |
| PLINE-D1 | PLINE's Undo marks the history depth when a segment is added and takes back to it; under Control None the chain stays | LINE's mechanism; p42 |
| PLINE-D2 | Continue and the chain's first heading read LASTPOINT to tell a clockwise arc's drawn end | LIN-02's rule; document order stays |
| PLINE-D3 | 2D point prompts refuse a typed Z and `*` at the command line; the dynamic-input box is left | the console; the box is unverified |
| PLINE-D4 | No deferred snap at PLINE's start | p29 |
| PLINE-D9 | A moved vertex re-bulges neighbouring arcs through their old midpoints | d09, exact |
| PLINE-D10 | Current properties taken at the start, still one `AddEntityCommand` at the end | AutoCAD appends the object at the start; one undo step |
| PLINE-D13 | Enter with nothing to continue starts at the WCS origin, silently | p178, p191 |
| PLINE-D20 | `*Invalid*` at an option's last step returns to the arc prompt | p118–p125 |
| PLINE-D21 | `valueMustBeNonzero` (table 22257) for an included angle normalising to 0 | p110, p111 |
| PLINE-D22 | A negative radius is the major arc; Angle → Radius takes 0 | p122, p131 |
| PLINE-D23 | Enter at Direction's tangent keeps the chain's heading | p134 |
| PLINE-D24 | Typed points at sub-prompts read LASTPOINT | p138 |
| PLINE-D25 | es `Second pt` declared `Segundo`, labelled `Segundo pto.`; `SEGUNDOPTO` at the first arc prompt to Missing | the common prompt; one keyword per id |
| PLINE-D26 | `matchKeywords` prefers a keyword whose capitals start its word | p104; no re-lettering |
| PLINE-D27 | DIST's Undo keeps the mode; PLINE's goes to the segment left | p148, p128 |
| PLINE-D28 | DIST's CEnter → Angle takes 2027's wording; reading a number there as a point waits for the desktop | p145 |
| PLINE-D29 | PLINE's undo mark is taken after an arc's sub-prompts | p144 |
| PLINE-D30 | A polyline closes from two vertices everywhere | p04, p227 |
| PLINE-D31 | PLINEGEN 0: each straight segment laid with LINE's centred pattern; arcs probed first | p232 |
| PLINE-D32 | Mitre while the tip is within 4 half-widths, square ends beyond | p235 |
| PLINE-D33 | An arc meeting a line: the line's band cut along the arc's end radius; arc–arc unverified | p236 |
| PLINE-D34 | An arc band's half-width clamped at its radius | p234 |
| PLINE-D35 | The midpoint grip stretches; Ctrl+click goes; the menus to Missing | d07, d09; a reinvented gesture |
| PLINE-D36 | The palette takes AutoCAD's rows; Closed editable Yes/No; es labels from the Spanish help pages, **unverified** until a Spanish desktop | d08 |
| PLINE-D37 | A dashed line from the last vertex at the width prompts | p200, d06 |
| PLINE-D38 | FILL-off lineweight left until the screen is seen | plot only |
| PLINE-D40 | PDK-01: the rubber band and the chain wear `currentColor` | d01; LINE's DSK-01 |
| PLINE-D41 | PDK-02: the dashed chord in arc mode, amber as the width prompts' line (POB-09) | d03, d06: amber beside a white polyline, not the object's colour |
| PLINE-D42 | PLN-24 refuted (§10): Length keeps its measuring line | d06 |

Nothing here needs the owner but the approval itself: no data, publishing or spending.

## 7. Tests proposed

Regression tests first, each in its finding. Then the untested cells, by file:

- `drawing.test.ts` (PLINE): Close variants (p162–p164, p177), U after Close (p165), Enter at the
  first next point (p179), `_CIRCLE` / `_LINE` typed (p180), Continue cases (p185–p190), LASTPOINT
  after Close, Undo and Enter (p03, p16, p179), `@` and the zero-length vertex (p17), the 3D start
  (p18), Escape (d01).
- `polylineArcs.test.ts`: the keyword forms (p100–p108), every option's geometry not yet pinned
  (p109, p112–p116, p121, p124), the refusals of p131–p136, transparent commands at sub-prompts
  (p142, p143); its 2023 citation replaced by p09, p109–p136.
- `polylineWidths.test.ts`: Halfwidth's refusals and the es words (p201), THICKNESS with a width
  (p219), UCS X 90 (p220), `@` with a taper (p225); `acc/w1–w7` replaced by p200–p218.
- `currentProperties.test.ts`, `elev.test.ts`: PLINE's properties set before it (p181).
- `inquiry.test.ts`: DIST's Arc citations to p115, p145–p148.
- `drawingFile.test.ts`: a polyline with widths and bulges together; a closed one of two vertices.
- `polylineOutline.test.ts`: the mitre limit, the wide arc, Close against back to the start (p236).

## 8. What is not tested, and why

- Colours and shades (the wide jig's dimmer shade, d02): checked by eye against the screenshots.
- The cells LINE's review pins for every command (the echo of an alias, `'ORTHOMODE`, ZOOM's
  transparent prompt).

## 9. What could not be reviewed, and why

- **The Spanish desktop:** the launched instance opened the English profile, so the palette's and
  the grip menus' Spanish labels, and `*Cancelado*` inside PLINE, were not seen (PLINE-D36).
- **Ctrl at each sub-prompt** (the console cannot hold it; on the desktop a Ctrl held during a move
  was not read by the jig, only at the pick): Angle's, CEnter's, Direction's and Radius's endpoints,
  the chord directions.
- **The small `+` on the polyline's start point** while drawing (d01–d06): what it is was not
  settled; nothing is proposed.
- `<45` then a distance at the next point (p167: the console reads its fixed cursor), Polar and
  OTRACK with a direct distance, the dynamic-input box with a 3D point or `#` at PLINE's next
  point, PLN-22 in a tilted UCS, AutoCAD's p103 flip after `CEnter or CLose?` (likely the
  console's), table 21291 `Cannot close until two or more segments drawn.` (never reached), the
  arc–arc band join.

## 10. Refuted in the adversarial pass

| Suspicion | Why not |
| --- | --- |
| PLN-24: Length's preview, a line to the cursor, misleads | the desktop draws the same measuring line (d06); a wide one's band unverified |
| The Spanish `Value must be positive.` is table 22237's `Debe ser un valor positivo.` | the console writes the catalog's `El valor debe ser positivo.` (p201, p194) |
| A width answered by a point asks a second point | no (p202) |
| The width's Undo rule changed in 2027 | p208–p218 reproduce 2023's |
| `CEN` at the arc prompt is CEnter | the Center snap, in both (p105) |
| `CEnter or CLose?` should name the declared `CE` | AutoCAD names `CEnter` (p103) |
| A double-click at the next point should add a zero-length vertex | one vertex (d11), as here; a typed `@` adds one (p17), as here |
| `'ELEVATION` mid-PLINE reaches the polyline | it does not here either (p40) |
| The first-arc data of p07, p08 | the arc was symmetric, both ends heading alike; p32–p37 settle it |

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

Claims that do not hold:

- `docs/coverage/draw.md` PLINE: "Continue" after a clockwise arc (PLN-02), "the first one leaving
  along the last line, arc or polyline drawn, else east" (PLN-03, PLN-21), "each refusing as the
  console does" (PAC-01 to PAC-06), "Undo back to the mode of the segment left last" holds for
  PLINE but not DIST (PAC-12), "as AutoCAD 2023's console does (acc/w3–w7)" (POB-11); nothing on
  Enter with nothing to continue (PLN-22), properties fixed at the start (PLN-06), PEDIT (PDK-03).
- `docs/coverage/inquiry.md` DIST: Undo's mode (PAC-12), CEnter's Angle (PAC-13).
- `docs/coverage/drafting-aids.md` Grips: "polyline insert/remove vertex" as the midpoint grip
  (POB-06, POB-07); no polyline grip menus in Missing.
- `docs/coverage/properties.md`: Linetypes' "**unverified** … per segment or along a polyline"
  settled (POB-02); the polyline's palette rows (POB-08).

| Rule | Claim | Code | State |
| --- | --- | --- | --- |
| `cad-tools.md` Ordering and undo | a tool's Undo takes a transparent step back with `ctx.undoTo` | `PolylineTool.ts:510` | broken (PLN-01) |
| `cad-tools.md` Command shape | which end of an arc was drawn last is read off LASTPOINT | `PolylineTool.ts:602`, `:650` | broken (PLN-02, PLN-03) |
| `cad-tools.md` Points | a new orientation default starts at the UCS X | `PolylineTool.ts:602` | broken (PLN-21) |
| `cad-tools.md` Points | a tool moves LASTPOINT only through `ctx.setLastPoint` | `commitLength` | broken (PLN-20) |
| `cad-tools.md` What a new object wears | ghosts' colours are their reviews' | `PolylineTool.ts:343` | to settle: PLINE's is `currentColor` (PDK-01) |
| `cad-engine.md` Conventions | a hatch loop always closes, "whose closing segment needs three" | `polylines.ts:124` | stale (POB-01) |
| `cad-catalogs.md` Keywords | "(PLINE keeps `CEnter`)" | | holds; cite p103 |
| `cad-runtime.md` Answering | a wrong answer is refused, never run | PLINE's own `commitCoordinate` | broken (PLN-04) |

Behaviours without a rule: a tool's own refusal (`*Invalid*`) leaves LASTPOINT (PLN-07); a
command's properties are those current when its object starts (PLN-06).

## 12. Order of execution and estimate

One commit per block, each `fix(engine): PLINE review — <IDs>`, in this order:

1. **POB** — POB-01 first (the file), then POB-02 to POB-12. A day: the outline (POB-03 to
   POB-05), the per-segment linetype, the grips (POB-06, POB-12), the palette.
2. **PLN** — PLN-01 to PLN-08, PLN-20 to PLN-23. Half a day; PLN-03's `lastDrawnDirection` is
   what PAC's chord default reads.
3. **PAC** — PAC-01 to PAC-13, the catalogs (`valueMustBeNonzero`, es `Segundo`) and DIST. Half a
   day; after PLN (PLN-01's mark, PLINE-D29).
4. **PDK** — PDK-01 to PDK-03. An hour.

## 13. Changes to coverage, rules, catalogs and roadmap

- **Coverage:** `draw.md` PLINE (Continue, the heading, Enter with nothing, properties at the
  start, the arc options' refusals, the 2027 citations, PEDIT and `SEGUNDOPTO` to Missing);
  `inquiry.md` DIST; `drafting-aids.md` Grips (the stretch, the re-bulge, the menus to Missing);
  `properties.md` (Linetypes along a polyline, the polyline's palette).
- **Rules:** `cad-engine.md` (two-vertex closing; the outline's mitre limit if it becomes a rule),
  `cad-tools.md` (a command's properties are taken when its object starts; a refused answer keeps
  LASTPOINT), `cad-catalogs.md` (cite p103).
- **Catalogs:** `valueMustBeNonzero` in `en`, `es`; es `keywords.PLINE` / `keywords.DIST` `Second
  pt`; DIST's included-angle prompt; the English surface snapshot where English changes.
- **Roadmap:** row 2 `plan`, then `done` with this plan's index; it owns the polyline object and
  the polyline's arc prompts. Analogues for later reviews: the rubber band's colour in every other
  command (DSK-01, PDK-01); properties read at commit by any command that commits at its end
  (PLN-06: RECTANG? SPLINE? to check in their reviews); a 2D point prompt's own parsing (PLN-04) in
  ARC and MIRROR; `*Invalid*` returning to the parent prompt in ARC's options.

## 14. Template improvements

Confirmed by the owner and applied on 2026-10-21 (template §0, §4.1, §9; matrix.md H;
annex-probes.md §2, §4; `probe.sh`):

1. **Start from the previous review's analogues** (§4.1): LINE's list gave PLN-01 to PLN-03 in the
   first hour.
2. **A matrix row H cell for properties changed mid-command** (a transparent `'-COLOR` before the
   end): PLN-06 needed it and the matrix does not ask.
3. **Desktop traps** (annex-probes §4): Ctrl+1 docks the palette and shifts the drawing area —
   capture it last or recalibrate; a grip's hover menu sticks until Escape, so reselect between
   hovers; a click typed right after keys can be lost — wait after typing; a launched instance may
   open the English profile, so plan Spanish labels for a session in the owner's profile.
4. **A probe for one locale** (`p103`, `p104` broke in es): `probe.sh` could take `<id>.en.txt` /
   `<id>.es.txt` and run only that locale.
5. **Session sizing:** three subagents at 45–50 probes each, the reviewer's 44 and a desktop pass of
   twelve gestures fit one session.
