# Inquiry review (DIST, AREA, ID)

> **Status:** plan, 2026-10-27. The twenty-first review of `docs/coverage/roadmap.md`'s order, with
> skill `command-review`. Blocks IDP+INQ, DST and ARE are executed (index below); block IQD (the
> desktop) waits for a session with the owner's mouse, after which the plan shrinks to its index.
>
> It owns no cross-cutting area. It settles the analogues left for it: AREA Object of a hatch
> (hatch/p320) and of a block reference with attributes (Blocks review), and the circle review's
> COB-03 (AREA Object refusing a typed point).

## Summary

No critical and no high finding. 15 medium and 11 low, in four blocks:

| Block | Prefix | Medium | Low |
| --- | --- | --- | --- |
| ID and the shared cells | IDP, INQ | 3 (IDP-01, INQ-01, INQ-04) | 5 (IDP-02, INQ-03, INQ-06 to INQ-08) |
| DIST | DST | 6 (DST-01 to DST-05, DST-07) | 2 (DST-06, DST-08) |
| AREA | ARE | 6 (ARE-01 to ARE-05, ARE-07) | 4 (ARE-06, ARE-08, ARE-10, ARE-12) |
| Desktop | IQD | — | — (to probe) |

The worst three:

- **DIST's Multiple points reads `@`, a bare number and Length's point from the run's end**, where
  AutoCAD reads them from LASTPOINT, which Length and Undo do not move (DST-01, DST-02, p158–p169).
- **AREA's `Select objects:` refuses a typed point, a bare number and a typed snap, and passes over
  a locked object** (ARE-01, ARE-04; COB-03, circle/p241, p219, p220, p228).
- **`-0.0000` where AutoCAD writes `0.0000`**, in `formatLength`, which every report shares (IDP-01,
  p315, p355).

**Evidence:** 180 console probes in es-ES and en-US (p100–p169, p200–p258, p300–p361) on AutoCAD
2027 (ACADVER 26.0, X.118); the `acadres` tables of 2026-10-20; `acad.cuix`'s ribbon macros; 170
scratch tests in `research/review/inquiry/{a,b,c}/`. No desktop probe yet.

## Executed

| Block | Findings | Commit |
| --- | --- | --- |
| IDP + INQ | IDP-01, IDP-02, INQ-01, INQ-03, INQ-04, INQ-06 to INQ-08 | `d9de70d` |
| DST | DST-01 to DST-08 (p170–p172 added: Ortho's base and Arc's LASTPOINT) | `65a7baa` |
| ARE | ARE-01 to ARE-08, ARE-10 (through `onAskAgain`), ARE-12; COB-03 closed | `f36ebf7` |
| IQD | the desktop: open | — |

Left by the execution: ATTDISP's and MATCHPROP's buttons are apostrophe macros too
(`'_attdisp`, `'_matchprop`) and do not say `transparentMacro` yet; where a closed wide
polyline's line falls in Add area against `Total area` is unprobed.

## Inventory

At commit `34f2471`.

- **Tools:** `cad/application/tools/MeasureTool.ts` (DIST as `measure`, AREA as `measurearea`),
  `cad/application/tools/IdTool.ts`; helpers `arcSegmentInput.ts` (DIST's Arc, owned by the PLINE
  review), `lastDrawnPoint.ts`, `objectSelection.ts` (`lastObject`), `cad/domain/objectArea.ts`,
  `cad/domain/units.ts` (`formatLength`).
- **Registration:** `runtimeTools.ts:161-163`, `CommandLine.ts:303-305` (`TOOL_COMMANDS`),
  `runtimeCommands.ts` (`TRANSPARENT_COMMANDS` has DIST and ID; the AREA variable),
  `CadRuntime.ts` (`variableNamed`).
- **Catalogs:** `cad/locales/{en,es,ar}.json`: names DIST/DI, AREA/AA, ID; `keywords.DIST`,
  `keywords.AREA`; the prompts and messages the sweep lists below.
- **The object:** none; AREA Object reads `objectArea`.
- **UI:** the rail (`components/cad/tool-rail.tsx:272`, a Measure flyout and ID), the landing
  (`content/commands.ts:115-117`, group inquiry).
- **Tests:** `cad/application/tools/inquiry.test.ts`, `cad/domain/objectArea.test.ts`, and the
  inquiry lines of `englishSurface.test.ts`, `transparentCommands.test.ts`, `lastPoint.test.ts`,
  `undoEcho.test.ts`, `locale.test.ts`, `settingsPrompts.test.ts`, `measuredAnswers.test.ts`,
  `dynamicInputEnter.test.ts`.
- **Knowledge:** `docs/coverage/inquiry.md`; rules `cad-tools.md`, `cad-runtime.md`,
  `cad-catalogs.md`.
- **Related:** U, UNDO, REDO after each; `'ZOOM`, `'-OSNAP`, `'ORTHOMODE` at each prompt; LINE and
  CIRCLE as hosts of `'DIST` and `'ID`; MEASUREGEOM, the ribbon's macro for Distance and Area;
  LASTPOINT, ELEVATION, the UCS, LUPREC, AUPREC.
- **Areas cited:** the command line, point input, object snaps, Ortho, undo (LINE review), the
  polyline's arc prompts (PLINE review), `Select objects:` and the preselection (ERASE review), a
  single object's pick (Pieces review).
- **Left out:** LIST, which is not built (INQUIRY-D1).

## Probes

Inputs in `scripts/research/probes/inquiry/` (`.plain` untraced, `.es` one locale), run with
`scripts/research/probe.sh inquiry <ids>`; transcripts in `research/probes/inquiry/`.

| Id | What it asks |
| --- | --- |
| p100–p104 | DIST: the report, LASTPOINT and DISTANCE after; `DI`, `DIST`, `_.DIST`; repeat |
| p105, p106 | MEASUREGEOM; MEDIRGEOM (es) |
| p107–p123 | DIST's refusals, `0`, negatives and Enter at each prompt; Length, its refusals and `0`; Undo, Close, Total |
| p124–p134 | DIST's point forms: `x,y,z`, `@`, polar, `*` and `#` in UCS Z30, a bare number, `<30` |
| p135–p141 | DIST's typed overrides; Ortho with a typed point and with a bare number |
| p142–p151 | AUPREC, LUNITS, LUPREC, AUNITS; rotated and tilted UCS; ELEVATION; zero vector |
| p152–p156 | DIST's Arc: Undo, Enter, CLose, LASTPOINT |
| p157–p169 | Length's first direction; `@`, a bare number and LASTPOINT after Length and Undo |
| p170–p172 | (DST execution, en only) Ortho's base at Multiple's next point after a Length; LASTPOINT after Arc follows a Length |
| p200–p211 | AREA: names, repeat, `'AREA`, refusals, Enter and Undo at each depth, Total |
| p212–p218 | Add and Subtract by points and objects; Entity, eXit; es words; `Select objects:` refusals |
| p219–p229 | Object: a bare number, a locked layer, each type (arc, wide and open polylines, hatch, ...), typed snaps, the newest |
| p230–p258 | Z and UCS, bow-tie, `@`, units, `'AREA` mid-AREA, line, text, dimension, region, block reference, the variables after Add, LASTPOINT after a pick, PERIMETER, Enter at Add |
| p300–p318 | ID: names, Enter, refusals, every point form, overrides, Z, the report's spacing, UCS, units |
| p320–p333 | `'ID`, `'DIST`, `'AREA`, `'_AREA` at LINE and CIRCLE; `'ZOOM`, `'-OSNAP`, `'ORTHOMODE` at each prompt |
| p340–p344 | U, `UNDO 2`, REDO after each (untraced) |
| p345–p358 | the preselection at start and what is left selected; an override finding nothing; LUPREC 0 rounding; LASTPOINT after each |
| p359–p361 | `'_AREA` at Command:; `MEASUREGEOM _distance` and `_area` (the ribbon's macros) |

## Matrix

A row the same at every prompt takes one cell. `a`, `b`, `c` are the scratch folders
`research/review/inquiry/{a,b,c}/`.

### DIST

| Row | First point | Second point | Multiple's next point | Length |
| --- | --- | --- | --- | --- |
| A | match · p100–p104 · a/dist:29, :63, :70; `_.DIST` known (command-line.md); MEASUREGEOM differs DST-05 | | | |
| B | match · p107 · inquiry.test.ts:177 | match · p108–p111 · a/dist:103–137 | match · p112–p114, p122, p123 · a/dist:146–212 | differs DST-06 (`0`) · p115, p162 |
| C | match · p124–p133 | match · p124–p133; `<a` unverified (desktop) · p134 | differs DST-01 (`@`, number) · p160, p165–p167 | differs DST-01, DST-03 · p157, p158, p164 |
| C LASTPOINT | match · p107 | match · p111, p356 · lastPoint.test.ts:123 | differs DST-02 (Undo) · p169; match after Arc's Undo · p168 | match · p116, p118 |
| D | match · p135–p138; M2P known | match; Ortho with a number differs DST-04 · p141 | unverified (desktop) | n/a: a length |
| E | match · p321, p323, p329, p330 (subagent C) | | | |
| F | match · p341, p343 · undoEcho (ID only: untested for DIST) | | Undo · match · p120, p152 | |
| H | nothing made; the report to full precision, 3D, UCS Z30 and X90, ELEVATION, AUPREC, LUPREC · match · p124, p142, p144, p146–p151 · a/dist:561–597; DISTANCE differs DST-07 | | | |
| K | match · p100 es, p112 es, p115 es · a/dist:38, :612 | | | |
| L | match · p100, p107, p108, p112, p115, p134 | | | |
| M, P, Q | the readout chip: no source (IQD) | | | |

### AREA

| Row | First corner | Next point | Object's `Select objects:` | AREA variable |
| --- | --- | --- | --- | --- |
| A | match · p200–p202 · b/pr:30, b/rp:5 | | | match · p203, p204 |
| B | match · p205–p207, p212, p217; Enter in Add before a measure differs ARE-02 · p258; eXit after a measure differs ARE-02 · p215 | `[Arc/Length/Undo]` known; Enter, refusals match · p208, p209; Undo match · p241 | match · p213, p217, p218 | — |
| C | match · p206, p207, p234 | match · p234; Z differs ARE-05 · p249–p256 | typed point, number: differs ARE-01 · circle/p241, p219, p240 | — |
| C LASTPOINT | match · p208, p357 | match · p211 | a pick: differs ARE-06 · p253 | — |
| D | match · p227 | match · p227 | `_CEN` differs ARE-01 · p228; locked differs ARE-04 · p220 | — |
| E | `'AREA` in a mode differs ARE-10 · p255 | match · p331 | | `'_AREA` differs INQ-01 · p325, p359 |
| F | U after AREA · match · p342, p343 · b, c scratch | Undo · match · p241 · inquiry.test.ts:563 | | |
| H | | UCS, bow-tie · match · p231–p233; LUPREC 0 · p237 | every type · match · p215, p221–p225, p242–p246, hatch/p320 · objectArea.test.ts; wide polyline's warning differs ARE-08 · p222 | after Add or Subtract differs ARE-03 · p212–p214; PERIMETER differs ARE-07 · p257 |
| I, M | | | rollover colour differs INQ-03 | |
| K | match · p212 es, p216 · inquiry.test.ts:738, :767 | | | |
| L | match but the findings above | | | |
| Q | the green fill known; the readout chip IQD | | | |

### ID and shared

| Row | ID's `Specify point:` |
| --- | --- |
| A | match · p300, p301, p354; `_.ID` known; the rail's ID ends the running command differs INQ-04 |
| B | match · p302–p304 · inquiry.test.ts:201, :214 |
| C | match · p305–p309 · c/id.test.ts; `<a` unverified (desktop) |
| D | match · p310–p314, p352 · c/id.test.ts |
| E | `'ID`, `'DIST` at LINE and CIRCLE, `'ZOOM`, `'-OSNAP` at the three · match · p320–p333 · transparentCommands.test.ts:28 |
| F | U, `UNDO 2`, REDO name each run · match · p340–p344 · undoEcho.test.ts:252 (ID) |
| H | the report's spacing, UCS Z30 and X90 · match · p315–p317; `-0` differs IDP-01 · p315, p355 |
| Preselection | DIST, AREA drop it · match · p350, p351; ID keeps it differs IDP-02 · p349; nothing left after · match · p345–p348 |
| K | match · p302 es, p315 es; ar: interface only |
| L | match; `ID` echoed for `_ID` is the command line's convention (owned) |

### Catalog sweep (`--from` MeasureTool.ts, IdTool.ts, runtimeCommands.ts)

0 es-2027, 0 en-2027, 0 es-differs. `es-several` settled by the console: `distSecondPointOr`
(31581, p321), `specifyFirstPoint`, `specifyNextPointOr`, `specifyFirstCornerPointOr` (p324);
`selectObjects`, `allSegmentsUndone`, `commandCompletelyUndone` match their transcripts (p213,
p241, p152). `no-source` settled: `idReport` (p315), `distanceReport` (p321), `areaReport` (p324),
`keywordLabels.DIST.Multiple` (p321). The `feedback.measure*` readout keys stay no-source (IQD).

## Findings

### Medium

#### DST-01 — Multiple points reads `@`, a bare number and Length's point from the run's end

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `MeasureTool.ts:411` (`askPoint`'s `lastPoint: this.basePoint()`), `:377`, `:261`, `:884`
- **AutoCAD:** Length leaves LASTPOINT at the last point given (p118's trace: `BasePoint [10,0,0]`
  with the run at 6,0). p158 `_M 10,0 _L -4 _L 6,5` → `Distance = 20.4031`; p160 `_L 5 @0,5` →
  `22.0711`; p165 `_U @0,5` → `11.1803`; p166 `_L 5 5` → `16.9558`; p167 `_U 5` → `24.7255`.
- **mellowcad:** a/dist:253–296 read 19, 20, 5, 20 and 15.
- **Scenario:** Multiple, `10,0`, Length 5, `@0,5` → mellowcad measures to 15,5, AutoCAD to 10,5.
- **Fix:** in `multiple` and `length`, `@` and Length's point read `ctx.lastPoint`, and the bare
  number's anchor follows it (INQUIRY-D10).
- **Regression test:** `inquiry.test.ts`, the five cases, citing p158, p160, p165–p167.
- **Coverage:** "a point there giving the length from the last one" → from LASTPOINT.

#### DST-02 — Multiple's Undo of a line moves LASTPOINT to the run's end; AutoCAD keeps it

- **Severity:** medium · **Row:** C/F · **Status:** verified
- **Where:** `MeasureTool.ts:743-757`
- **AutoCAD:** p169 `_M 10,0 _U _T` → LASTPOINT `(10.0 0.0 0.0)`; Arc's Undo moves it to the run's
  end (p168).
- **mellowcad:** a/dist:304 reads ` X = 0.0000`.
- **Fix:** the line's Undo keeps LASTPOINT (`ctx.setLastPoint(ctx.lastPoint)`); Arc's stays.
- **Regression test:** `inquiry.test.ts`, citing p169 and p168.

#### DST-03 — The first Length runs along the UCS's X axis; AutoCAD along what was drawn last, else the WCS's east

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `MeasureTool.ts:321`
- **AutoCAD:** p157 (`_UCS _Z 30`, `_L 10`, `10,10`) → `25.0597`, along the WCS's X; p164 (after
  `_LINE 50,50 50,60`) → `24.1421`, north.
- **mellowcad:** a/dist:232, :239 read 20 and 10.
- **Fix:** with one point, Length goes along `run.startTangent` (`lastDrawnDirection`, else east).
- **Regression test:** `inquiry.test.ts`, citing p157 and p164.
- **Coverage:** "the UCS's X axis before there is one" is false.

#### DST-04 — A bare number at DIST's second point ignores Ortho

- **Severity:** medium · **Row:** D · **Status:** verified · area: point input and Ortho (LINE review)
- **Where:** `CadRuntime.ts` `directDistance` → `atDistance`, which reads the raw cursor
- **AutoCAD:** p141 `ORTHOMODE 1`, `_DIST 0,0 5` → `Angle in XY Plane = 0`, `Delta X = 5.0000`.
- **mellowcad:** a/dist:548 reads 22°; LINE under the same conditions gives 5,0, and a click at
  DIST's second point is bent.
- **Fix:** the generic direct distance takes the direction Ortho resolves from the tool's anchor,
  as LINE's does. **Alternative:** DIST declares its own direct distance.
- **Regression test:** `inquiry.test.ts`, F8 then `5`, citing p141.

#### DST-05 — The entry's heading names MEASUREGEOM, which is another command and is not built; the ribbon's Distance and Area run it

- **Severity:** medium (a gap missing from the entry) · **Row:** A · **Status:** verified
- **Where:** `docs/coverage/inquiry.md:3`, `MeasureTool.ts:53`, `tool-rail.tsx:272`
- **AutoCAD:** p105 `Move cursor or [Distance/Radius/Angle/ARea/Volume/Quick/Mode/eXit] <eXit>:`
  (es MEDIRGEOM, `Desplace el cursor o [Distancia/RAdio/ángUlo/áRea/Volumen/ráPido/Modo/Salir]
  <Salir>:`, p106). acad.cuix's ribbon buttons are `^C^C_MEASUREGEOM _distance` and `_area`: DIST's
  and AREA's prompts, then `Enter an option [...] <Distance>:` in a loop (p360, p361).
- **mellowcad:** `Unknown command "MEASUREGEOM"`; the rail runs DIST and AREA and ends.
- **Fix:** the heading and the JSDoc lose MEASUREGEOM; Missing gains MEASUREGEOM with its loop;
  the rail keeps DIST and AREA with a `WHY` (INQUIRY-D11, D30).

#### DST-07 — DIST sets DISTANCE, which mellowcad lacks and the entry does not say

- **Severity:** medium (a gap missing from the entry) · **Row:** H · **Status:** verified
- **AutoCAD:** p100 `(getvar "DISTANCE")` → `5.0`.
- **Fix:** a Missing line (INQUIRY-D12).

#### ARE-01 — AREA's `Select objects:` refuses a typed point, a bare number and a typed object snap

- **Severity:** medium · **Row:** C/D · **Status:** verified · the circle review's COB-03
- **Where:** `MeasureTool.ts:526` (`takes()` → `"objectOrLast"`), `:877-882`
- **AutoCAD:** circle/p241 `Select objects: 10,0` measures the circle; p219 a bare number picks at
  that distance from LASTPOINT; p228 `_CEN` then `of 2,10` asks again, nothing measured; p218, p240
  a point on nothing or off the screen asks again, silent.
- **mellowcad:** b/md:104, :136, :148 refuse with `*Invalid selection*`; b/ob:93 refuses `CEN`, then
  the click measures.
- **Fix:** the pick takes a typed point through `typedPick` (a miss asks again silently, as the
  console) and a typed override (`takesSnapOverride`), as TRP-01, CRP-01, OFP-01 did.
- **Regression test:** `inquiry.test.ts`, citing circle/p241, p219, p228.
- **Coverage:** "picks one object, or `Last`" gains "or a typed point"; COB-03 closed in the roadmap.

#### ARE-02 — Leaving Add or Subtract: eXit never says the total and Enter always does; AutoCAD says it after a measure, and neither before

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `MeasureTool.ts:664-669` (WHY citing 2023's `acc/ar3, ar5`), `:477-480`
- **AutoCAD:** p215 `_A _E _L` Enter `_X` → `Total area = 78.5398`; p216 es `SA` → `Área total =
  0.0000` after a measure; p254, p258 nothing measured → no line, for eXit and for Enter.
- **mellowcad:** b/md:66, :78 end silent after a measure; b/ta writes `Total area = 0.0000` before
  one.
- **Fix:** eXit and Enter write `totalArea` when the mode has measured (`this.shown`), never before.
- **Regression test:** rewrite `inquiry.test.ts:666`'s third case; add p258's.
- **Coverage:** "eXit … ends the command without a word, the total unsaid" is no longer true.

#### ARE-03 — After Add or Subtract, the AREA variable is AutoCAD's running total; mellowcad's is the last area

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `MeasureTool.ts:852`
- **AutoCAD:** p212 (+100 −12.5) `(getvar "AREA")` → `87.5`; p213 → `0.0`; p214 → `-12.5`; a plain
  run keeps its area (p211, p248).
- **Fix:** in a mode, the variable takes the total.
- **Regression test:** `inquiry.test.ts`, `'AREA` after p212's run.

#### ARE-04 — AREA's Object pick passes over an object on a locked layer; AutoCAD measures it

- **Severity:** medium · **Row:** D/H · **Status:** verified
- **Where:** `MeasureTool.ts:796-799`; no `picksLocked()`
- **AutoCAD:** p217's trace `"AllowObjectOnLockedLayer":true`; p220 (en) a locked circle →
  `Area = 78.5398, Circumference = 31.4159`.
- **mellowcad:** b/md:157 asks again.
- **Fix:** `picksLocked()` true at `areaObject`; `Last` takes a locked last object too.
- **Regression test:** `inquiry.test.ts`, citing p220.

#### ARE-05 — Corners off the UCS's XY plane: AutoCAD measures in 3D and refuses some with `Lines are not coplanar.`; mellowcad measures the plan

- **Severity:** medium (a gap missing from the entry) · **Row:** H · **Status:** verified; AutoCAD's rule is not
- **AutoCAD:** p256, a 3D triangle → `Area = 61.2372, Perimeter = 36.5028`; p249–p252 refuse a
  fourth point with `Lines are not coplanar.` even where it is coplanar (p251), and accept one that
  is not (p252) without counting it the way any plane explains.
- **Fix:** a Missing line with the probes (INQUIRY-D20); no rule is guessed.

#### ARE-07 — PERIMETER is not modelled, and the entry does not say

- **Severity:** medium (a gap missing from the entry) · **Row:** H · **Status:** verified
- **AutoCAD:** p257 `'PERIMETER` → `PERIMETER = 34.1421 (read only)`; the last perimeter, not a
  total (p212).
- **Fix:** a Missing line beside DISTANCE's (INQUIRY-D21).

#### INQ-01 — `'_AREA` is refused as a non-transparent command

- **Severity:** medium · **Row:** E · **Status:** verified
- **Where:** `CadRuntime.ts` `variableNamed` (its JSDoc: "never `_` and a global one")
- **AutoCAD:** p325 `'_AREA` at LINE → `AREA = 0.0000 (read only)`, `Resuming LINE command.`; p359
  at Command: the same.
- **mellowcad:** c/area-var.test.ts: `** That command may not be invoked transparently **`.
- **Fix:** `variableNamed` takes the `_` global form (INQUIRY-D32); UCSICON follows.
- **Regression test:** `settingsPrompts.test.ts`, `'_AREA` at Command: and at LINE, en and es.

#### INQ-04 — The rail's ID ends the running command; AutoCAD's ID button is `'_id`, run transparently

- **Severity:** medium · **Row:** A/E · **Status:** verified
- **Where:** `CadRuntime.ts` `setActiveTool`; rule `cad-runtime.md` "Transparent commands"
- **AutoCAD:** acad.cuix (en-us and es-es) `ID_Id` = `'_id `; p320 is what `'_ID` does at LINE.
- **mellowcad:** c/rail.test.ts: LINE ends, no `Resuming LINE command.`
- **Fix:** a rail entry whose macro starts with an apostrophe runs through `runTransparently`
  (INQUIRY-D34), as `navigate` does for PAN and ZOOM.
- **Regression test:** `transparentCommands.test.ts`.

#### IDP-01 — A negative value that rounds to zero is written `-0.0000`

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `cad/domain/units.ts` `formatLength` (`toFixed`)
- **AutoCAD:** p315 `12345.6789,-0.00004` → ` X = 12345.6789     Y = 0.0000     Z = 0.0000`; p355
  (LUPREC 0) `0.2,-0.4` → `Y = 0`; `13.5,-2.5` → `14`, `-3`.
- **mellowcad:** c/id.test.ts reads `Y = -0.0000` and `Y = -0`.
- **Fix:** `formatLength` writes a zero result unsigned (INQUIRY-D31). It reaches every report.
- **Regression test:** `units.test.ts` and the ID report, citing p315, p355.

### Low

- **DST-06** — Length `0` adds a point of no length; AutoCAD adds none (p115, p162). Fix:
  INQUIRY-D13.
- **DST-08** — Two Missing items no longer hold: angles are already written at AUPREC (p142), and
  the Spanish report is already the table's (p100 es). Both leave Missing.
- **ARE-06** — A click at `Select objects:` leaves LASTPOINT; AutoCAD sets it to the pick (p253).
  Fix: the pick sets it on a hit, the typed one through `typedPick`.
- **ARE-08** — A wide polyline's report lacks `Polyline's width ignored in area calculation.`
  (table 20179, es `Grosor de polilínea ignorado en cálculo de área.`; p222). Fix: a message
  `polylineWidthIgnored` after the report, for a closed wide polyline (the open one unprobed).
- **ARE-10** — `'AREA` at a mode's first corner: AutoCAD says the last area and total again after
  `Resuming AREA command.` (p255; the report is part of the prompt's message, p212's trace). Fix:
  through the hook the runtime has for a resumed prompt; with none, a Missing line.
- **ARE-12** — Stale against 2027: the entry lists `[Undo]` as AutoCAD's next-point prompt (2027's
  is `[Arc/Length/Undo]`, p206: mellowcad leaves Arc and Length out, known); the es ` (modo
  AÑADIR)` unverified mark is settled (p212 es); 2023 citations in `MeasureTool.ts:442-446,
  :586-588, :664, :772`, `runtimeCommands.ts:25-31`, `inquiry.test.ts:588, :664`,
  `objectArea.test.ts:15` → p203, p204, p208, p210, p212, p215, p241.
- **IDP-02** — ID keeps the preselection while it runs; AutoCAD drops it as ID starts (p349). Fix:
  `ctx.selection.clear()` in `onActivate` (INQUIRY-D33).
- **INQ-03** — AREA Object's rollover is `THEME.selected`; `cad-tools.md` "Pick feedback" says a
  single object's pick wears the rollover (`rollover`, `ghostLook.ts`), as OFFSET's moved to
  (OFJ-04). AutoCAD's look: IQD.
- **INQ-06** — `new MeasureTool("distance", "measure", "d")`: the `"d"` hint is shown nowhere (the
  rail shows DIST's `DI`). Fix: drop it (INQUIRY-D35); the English surface snapshot changes.
- **INQ-07** — 2023 citations the 2027 probes confirm: `inquiry.md` (ID's report, `'AREA`),
  `runtimeCommands.ts:26`, `MeasureTool.ts:553`, `transparentCommands.test.ts:25`,
  `lastPoint.test.ts:27, :123, :484`, `settingsPrompts.test.ts:277`, `inquiry.test.ts:175, :232`
  (its describe says "2026") → p302, p308, p315, p320, p321, p324, p356.
- **INQ-08** — `lastPoint.test.ts:466` is titled for a transparent command it never runs;
  `inquiry.test.ts:275` passes by coincidence (both readings give 5, DST-01); the AutoCAD values
  of `inquiry.test.ts:75–163, :476–795` cite no probe.

## Decisions

- **INQUIRY-D1** — LIST stays out: it is not built (the roadmap's 2.5D gaps), and a review does not
  add commands. Its words for a hatch (hatch/p320, p369) and the block reference's (unprobed) wait
  in the roadmap for whoever builds it. AREA Object of both was checked (p320 match, p246 match).
- **INQUIRY-D10** — Multiple points' relative input and Length's point read `ctx.lastPoint`, the
  runtime's (`cad-tools.md`).
- **INQUIRY-D11** — MEASUREGEOM goes to Missing, not as DIST's alias: its first prompt is another.
- **INQUIRY-D12** — DISTANCE goes to Missing: no command reads it here.
- **INQUIRY-D13** — Length `0` adds no point, as AutoCAD's.
- **INQUIRY-D20** — Corners off the plane go to Missing with p249–p256; AutoCAD's refusal rule
  contradicts itself across the probes, and a guessed one is worse than the plan's area.
- **INQUIRY-D21** — PERIMETER goes to Missing beside DISTANCE (D12): the same kind of variable, and
  neither is asked for.
- **INQUIRY-D30** — The rail keeps DIST and AREA, with a `WHY`: their prompts are MEASUREGEOM's
  Distance and Area word for word; MEASUREGEOM's loop is the missing part.
- **INQUIRY-D31** — `formatLength` writes zero unsigned: AutoCAD's `rtos` does, and every report
  shares it.
- **INQUIRY-D32** — A variable is found by `_NAME` too, as the console finds it.
- **INQUIRY-D33** — ID drops the preselection as DIST and AREA do.
- **INQUIRY-D34** — A rail entry with an apostrophe macro runs transparently.
- **INQUIRY-D35** — The `"d"` hint goes.

## Tests proposed

Each finding's regression test above, in `inquiry.test.ts` unless named. Then the untested cells:
DIST's LASTPOINT after Multiple, Close and Arc (p121, p154, p155); its typed overrides and tilted UCS
(p135–p138, p147); ID's Enter, overrides, UCS and units (p303, p310–p317); U, `UNDO 2` and REDO
after DIST and AREA (`undoEcho.test.ts`, p341–p343); the preselection at each start (p349–p351);
`'ID` and `'DIST` at CIRCLE's radius (p322, p323); AREA's `0` and negative first corner (p206,
p207), its Undo from three points (p241), UCS and bow-tie (p231–p233), LASTPOINT after it (p357).
The 2023 citations of INQ-07 and ARE-12 replaced by their 2027 probes.

## What is not tested and why

The readout chip's layout and the dashed run (presentation, and their source is IQD's); what
TypeScript guarantees of the states.

## What could not be reviewed and why

Desktop only, block IQD: the on-screen feedback of DIST and AREA (mellowcad's readout chip —
Distance, Angle, ΔX, ΔY, ΔZ; Area, Perimeter — has no source: is it what AutoCAD shows, and is
AutoCAD's green fill under AREA what MEASUREGEOM shows), the rollover at AREA's `Select objects:`,
`<a` then a number at DIST and ID (the console's fixed cursor, p134, p309), Ortho and Polar at
AREA's next point (its trace says `UseBasePoint: false`, the code anchors them at the last point),
Escape at each prompt and what it leaves selected, the shortcut menus.

## Refuted in the adversarial pass

- `#` at the command line is refused by AutoCAD too (p131).
- `<30` ignored by the console: the fixed cursor's artefact (p134); IQD.
- `_.DIST`, `_.ID`, `_M2P`, `'ORTHOMODE`, LUNITS 4: already in Missing (command-line.md,
  drafting-aids.md, workspace.md).
- The trace's `dummy` keyword at Multiple's prompt: a placeholder, not a hidden keyword (p112).
- The bow-tie's area 0 matches (p233); `0` and `-5` at the first corner match (p206, p207); the
  newest under the pick matches (p229); a block reference with attributes has no area in both
  (p246).
- ARE-11, `Command has been completely undone.` at a later Undo after earlier Undos at one point
  (p210): an artefact of AutoCAD's undo counter that a clean run does not show (p241).
- The echo `ID` for `_ID` and `_END of …` on one line: the command line's convention (LINE review).
- ARE-09 is INQ-03; INQ-05 is DST-05.

## Coverage ↔ code ↔ AutoCAD, rules ↔ code

Do not hold: "the UCS's X axis before there is one" (DST-03), "a point there giving the length from
the last one" (DST-01), the heading's MEASUREGEOM (DST-05), Missing's AUPREC and Spanish report
(DST-08), "eXit … the total unsaid" (ARE-02), "the last area AREA measured" after a mode (ARE-03),
"picks one object, or Last" (ARE-01, ARE-04), `[Undo]` as AutoCAD's prompt (ARE-12). Rules:
`cad-tools.md` "Pick feedback" broken at AREA's pick (INQ-03), its `typedPick` sentence (ARE-01);
`cad-runtime.md`'s apostrophe macro (INQ-04); `variableNamed`'s JSDoc (INQ-01).

Checked and holding: every other claim of both DIST paragraphs and the ID paragraph; `setsLastPoint`
of DIST's second point (p356); `'AREA`'s words (p324); the AREA Object reports by type.

## Order of execution and estimate

1. **IDP + INQ** (ID and the shared cells): IDP-01 first, since `formatLength` reaches every
   report and may move snapshots; then INQ-01, INQ-04, IDP-02, INQ-03, INQ-06 to INQ-08. Small.
2. **DST**: DST-01 to DST-04, DST-06; DST-05, DST-07, DST-08 in the entry. Medium.
3. **ARE**: ARE-01, ARE-04, ARE-06 (one pick path), ARE-02, ARE-03, ARE-08, ARE-10, ARE-12;
   ARE-05, ARE-07 in the entry. Medium.
4. **IQD**: a desktop session with the owner's mouse; its findings, if any, a block of their own.

## Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/inquiry.md`: the heading, every claim above, Missing gains MEASUREGEOM, DISTANCE,
  PERIMETER, corners off the plane; loses AUPREC and the Spanish report.
- `cad/locales/{en,es,ar}.json`: `polylineWidthIgnored` (ARE-08).
- `cad-runtime.md`: the rail's apostrophe macros run transparently whatever the command (INQ-04).
- The roadmap: Inquiry `plan`, then `done`; COB-03 closed; LIST's analogues left for LIST.

## Template improvements

Applied on 2026-10-27 (template §1.1, matrix.md H):

- A command whose ribbon button runs another command (DIST's runs MEASUREGEOM) is found by reading
  the button's macro in acad.cuix in Phase 1, not at the end (INQ-04, DST-05): add it to §1.1's UI.
- The read-only system variables a command sets (DISTANCE, PERIMETER, AREA) are a row H cell of
  their own: `(getvar …)` after each run.
