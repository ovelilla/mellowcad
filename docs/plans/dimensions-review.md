# Dimensions review (DIMLINEAR, DIMALIGNED, DIMBASELINE, DIMCONTINUE, DIMSPACE, DIMRADIUS, DIMDIAMETER, DIMANGULAR, DIMSTYLE)

> **Status:** plan, 2026-10-27. Phases 0–4 done in one session with skill `command-review`, the
> twentieth review of `docs/coverage/roadmap.md`'s order; the execution goes to a fresh session
> (the context of this one is spent on three subagents' reports and a desktop pass).
>
> It owns **the dimension objects and styles**: the dimension entity of every kind (its
> measurement text, how each kind is drawn, its grips, its palette rows, its shortcut menu), the
> dimension style table (its undo, -DIMSTYLE, the drawing's styles), and the dimension commands'
> shared prompts (Text and Angle, the base-dimension pick, Last).

## 1. Summary

63 findings: 0 critical, 11 high, 38 medium, 14 low.

| Block | Commands | High | Medium | Low |
| --- | --- | --- | --- | --- |
| DOB | the dimension object | 2 | 3 | 0 |
| DSY | DIMSTYLE, -DIMSTYLE, the style table | 1 | 1 | 2 |
| DLN | DIMLINEAR, DIMALIGNED, the Text and Angle options | 2 | 10 | 5 |
| DRD | DIMRADIUS, DIMDIAMETER | 2 | 7 | 2 |
| DAG | DIMANGULAR | 2 | 9 | 1 |
| DCH | DIMBASELINE, DIMCONTINUE, Last | 2 | 5 | 4 |
| DSP | DIMSPACE | 0 | 3 | 0 |

The worst:

- **Every dimension reads otherwise than AutoCAD's**: ISO-25 suppresses trailing zeros and writes a
  decimal comma (DIMZIN 8, DIMDSEP `,`): AutoCAD draws `12,5` and `100`, mellowcad `12.50` and
  `100.00` (DOB-01, p02).
- **A dimension's grips are not AutoCAD's**: no text grip and no dimension-line end grips, and the
  text cannot be moved off its centre (DOB-02, d01, d03). Style edits are not undoable (DSY-01, p05,
  d05).
- **Geometry**: DIMLINEAR on a circle measures a chord's projection, not the diameter (DLN-01);
  the H/V choice ignores AutoCAD's bands and hysteresis (DLN-02); an outside radial dimension is
  drawn as DIMTOFL 0 and an inside one from the centre (DRD-01, DRD-02); a line pair's obtuse
  sector near the other line gives the reflex angle (DAG-01); angular extension lines never run
  inward (DAG-06); `@` in a chain is relative to the chain, not LASTPOINT (DCH-01); an aligned base
  chains aligned dimensions where AutoCAD chains rotated ones (DCH-02).

**Evidence:**

- About 180 console probes in es-ES and en-US: p00–p16 (the reviewer: the object, the style
  table), p100–p169 (DLN), p200–p269 (DCH, DSP), p300–p369 (DRD, DAG).
- A desktop pass in the English profile, with the owner's mouse: d01–d07.
- The `acadres` and `AcDimRes` tables; the catalog sweep for the dimension ids.

## 2. Inventory

Commit `a40d07e`; AutoCAD 26.0, `_VERNUM` X.118.0.0 (p00); the tables of 2026-10-20 (2027,
current: the sweep found no `es-2027` or `en-2027` key).

- **Tools**: `cad/application/tools/DimensionTool.ts`, `RadialDimensionTool.ts`,
  `AngularDimensionTool.ts`, `DimensionChainTool.ts`, `DimSpaceTool.ts`, `lastDimension.ts`,
  `dimensionTextOptions.ts`; registration in `cad/application/runtimeTools.ts`,
  `cad/application/CommandLine.ts`; DIMSTYLE in `cad/application/runtimeCommands.ts`.
- **The object**: `cad/domain/dimensions.ts`, `cad/domain/dimStyles.ts`; transforms in
  `cad/domain/entityTransforms.ts`; grips in `cad/application/tools/selectToolGrips.ts`; palette
  rows in `cad/application/EngineState.ts`; the file in `cad/serialization/drawingFile.ts`; the
  clipboard in `cad/application/clipboard.ts`; EXPLODE's refusal in
  `cad/application/tools/ExplodeTool.ts`.
- **The style table**: `cad/application/runtimeStyles.ts`, `components/cad/styles-control.tsx`
  (the Styles palette standing in for the Dimension Style Manager, TEXT-D58).
- **Catalogs**: `cad/locales/en.json`, `es.json`, `ar.json`.
- **Tests**: `dimensions.test.ts`, `dimensionPrompts.test.ts`, `dimensionChains.test.ts`,
  `dimensionSpacing.test.ts`, `radialDimensions.test.ts`, `angularDimensions.test.ts` (all in
  `cad/application/tools/`), `cad/application/styles.test.ts`, and the dimension cases of
  `englishSurface.test.ts`, `invalidAnswers.test.ts`, `measuredAnswers.test.ts`,
  `elevation.test.ts`, `ucs.test.ts`, `currentProperties.test.ts`,
  `currentPropertyCommands.test.ts`, `transforms.test.ts`, `drawingFile.test.ts`,
  `shortcutMenu.test.ts`.
- **Knowledge**: `docs/coverage/dimensions.md`; rules `cad-engine.md` (Dimensions, Style tables),
  `cad-tools.md`, `cad-catalogs.md`, `cad-runtime.md`; skill `extend-model` (a dimension kind, a
  style table).
- **Related**: DIMHORIZONTAL, DIMVERTICAL, DIMROTATED (2027 commands not built, DLN-08); the DIMxxx
  variables typed as commands (DSY-04, for the Workspace review); EXPLODE of a dimension (known,
  pieces/p258); the transforms of a dimension (owned by the Transforms review, modify.md p212,
  p273–p275).
- **Owned areas cited**: point input, snaps, Ortho/Polar/OTRACK, dynamic input, the command line,
  undo, current properties, grips, the palette (LINE); `Select objects:` and preselection (ERASE);
  a single object's pick, locked objects, a typed point at a pick (Pieces, TRIM, Corners).

## 3. Probes

Console inputs are `scripts/research/probes/dimensions/<id>.txt` (`.plain` untraced, `.es` / `.en`
one locale), run with `scripts/research/probe.sh dimensions <ids>`; the desktop pass is
`scripts/research/probes/dimensions/d01-d07.sh` with `lib-dsk-en.sh`. Transcripts and screenshots
are in `research/probes/dimensions/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version; every DIMxxx variable of the console's ISO-25 |
| p01, p02, p15 | `Dimension text =`, the drawn text (EXPLODE's MTEXT), Text's default: DIMZIN 8 and DIMDSEP |
| p03–p16 | DIMSTYLE in the console; -DIMSTYLE's options, Save, Restore, `?`, STatus, Variables, Apply, case, U; DIMSCALE typed and U; transparency; Standard's values |
| p100–p169 | DIMLINEAR and DIMALIGNED: names, the object pick, H/V, Text, Angle, Rotated, LASTPOINT, ELEVATION, UCS, preselection, exploded geometry; DIMHORIZONTAL/VERTICAL/ROTATED |
| p200–p269 | DIMBASELINE, DIMCONTINUE: the base, Last, the origin, `@`, Undo, DIMDLI, an aligned base; DIMSPACE: base, set, value, preselection, U |
| p300–p369 | DIMRADIUS, DIMDIAMETER, DIMANGULAR: refusals, typed and locked picks, `@`, LASTPOINT, inside and outside layouts exploded, DIMTOFL, the four sectors, circle form, names |
| p400–p402 | the execution's: Last after a SAVEAS and OPEN (D69); a pick on a radial at DIMBASELINE's and DIMCONTINUE's Select (D70) |
| d01–d07 | grips of every kind; their hover menus; the text grip's drag; the Properties palette of every kind; the Dimension Style Manager, New…, U; DIMLINEAR's H/V on the jig; Enter at DIMRADIUS's location; the shortcut menu over a dimension |

## 4. Matrix

Cells are `state · probe · test`. Scratch tests are in `research/review/dimensions/<letter>/`
(`a`: DLN, `b`: DCH and DSP, `c`: DRD and DAG, `r`: the reviewer's DOB and DSY), gitignored.

### The dimension object (DOB)

| Row | State |
| --- | --- |
| H | **Measurement text:** differs DOB-01 · p01, p02, p15, p366 · scratch r. **How each kind is drawn:** see DLN, DRD, DAG |
| I | **Grips:** differs DOB-02 · d01-1, d03-1 · dimensions.test.ts:371. **Hover menus:** differs DOB-05 · d02. **Palette:** differs DOB-03 · d04 · dimensions.test.ts:412, :427 |
| J | **File round-trip:** match (mellowcad's own format) · drawingFile.test.ts:1185, :1199. **Clipboard:** owned (Clipboard review) |
| O | **Transforms:** owned (Transforms review, modify.md p212, p273–p275); the text position, DXF 11, not modelled · known. **EXPLODE:** known (pieces/p258, ExplodeTool's WHY). **Shortcut menu:** differs DOB-04 · d07-1 · shortcutMenu.test.ts:107 |

### DIMSTYLE and the style table (DSY)

| Row | State |
| --- | --- |
| A | **DIMSTYLE, D, DIMSTY, DST, DDIM; es ACOESTIL, ACES, ACOEST, AES, DCOTA:** match · styles.test.ts:505, :514. **'DIMSTYLE transparent:** match · p12. **-DIMSTYLE, es -ACOESTIL:** differs DSY-02 · p04, p10. **'-DIMSTYLE refused:** p09 (built with DSY-02) |
| B | **-DIMSTYLE's options, Save, Restore, `?`, redefine, Apply:** differs DSY-02 · p04–p11, p16 |
| F | **U of a create, an edit, a delete, the current style:** differs DSY-01 · p05, p06, d05 · scratch r. **U of the drop-down's assignment:** match · styles.test.ts:201 |
| H | **The table:** Standard and Annotative absent · differs DSY-03 · p07, p10, p14, d05-1. **Copy of ISO-25, made current:** match · d05-2 · styles.test.ts:67. **Case-blind names:** match · p08 · styles.test.ts:75 |
| K | **es `Estilo de cota actual`, `aNotativo/Guardar/Restituir/Estado/Variables/Aplicar`:** built with DSY-02 · p10, p11 |
| O | **DIMxxx typed (DIMSCALE, DIMTXT), overrides, U names `DIMSCALE`:** known after DSY-04 · p06. **The Dimension Style Manager:** known (TEXT-D58, D10) · d05 |

### DIMLINEAR / DIMALIGNED (DLN)

Columns: P1 first origin `<select object>` · P2 `Select object to dimension` · P3 second origin ·
P4 location · P5 Text · P6 Angle · P7 Rotated.

| Row | State |
| --- | --- |
| A | **Names, aliases, es:** match · p100, p101 · scratch a. **DIMHORIZONTAL, DIMVERTICAL, DIMROTATED:** differs DLN-08 · p112, p113. **Repeat:** match · p102. **'DIMLINEAR refused:** match · p103 |
| B | **P1 Enter → P2:** match · p104 · dimensions.test.ts:154. **P2:** nothing match · p104 · dimensionPrompts.test.ts:98; circle differs DLN-01 · p109, p114, p115; ellipse/spline/dimension differ DLN-06 · p116, p117, p120; block reference differs DLN-07 · p148; locked differs DLN-03 · p121. **P4 keywords and lists:** match · p01, p137 · dimensionPrompts.test.ts:19, :57. **P5:** match · p126, p127 · dimensions.test.ts:120; a second Text with Enter differs DLN-11 · p164. **P6:** match · p129 · dimensions.test.ts:137; 0 or Enter differs DLN-10 · p163; `<30` differs DLN-12 · p130. **P7:** FOO match · p135 · measuredAnswers.test.ts:254; default differs DLN-14 · p165 |
| C | **Point forms:** owned. **P2 typed point:** differs DLN-04 · p104. **LASTPOINT:** differs DLN-05 · p140. **H/V:** differs DLN-02 · p139, p141, p142, d06 |
| D | owned; Ortho at P4 (UseBasePoint false) for the execution's check · p01 trace |
| E | `'ZOOM` owned · p155 |
| F | **U names the command:** match · p154 · dimensions.test.ts:198 |
| G | **Enter at P2, P3, P4 ends, nothing made:** untested · p105, p123, p124 |
| H | **Current properties:** match · p157 · currentProperties.test.ts:119. **ELEVATION:** differs DLN-09 · p158, p169 · elevation.test.ts:416. **UCS:** match · p159 · ucs.test.ts:350. **Geometry:** match · p160–p162 · dimensions.test.ts:247, :255; text centred under an Angle differs DLN-15 · p168. **Preselection dropped, nothing left selected:** untested · p149–p153 |
| K | match but DIMALIGNED's Angle (DLN-13) · p01, p143 |
| L | match but DLN-04 and DOB-01 · p01, p104 |
| N, O | DLN-16, DLN-17 |

### DIMRADIUS / DIMDIAMETER (DRD)

Columns: ① `Select arc or circle` · ② location `[Mtext/Text/Angle]` · ③ `Dimension text =`.

| Row | State |
| --- | --- |
| A | match · p327, p328, p338 · scratch c |
| B | **①** FOO match · p307 · invalidAnswers.test.ts:425; a line, ellipse, text, dimension, straight segment differ DRD-04 · p309–p314, p327; nothing match · p310. **②** Text/Angle match · p319, p321 · radialDimensions.test.ts:172, :194; `<>` differs DRD-08 · p320, p329. **③** order differs DRD-03 · p300 |
| C | **① typed point:** differs DRD-05. **② `@`, LASTPOINT:** differs DRD-07 · p318, p336. **UCS:** match · p325 |
| F | U match · p322 |
| G | **Enter at ①:** match · p308. **Enter at ②:** differs DRD-11 · p317, p333, d06 |
| H | **Locked:** differs DRD-06 · p315. **Outside layout:** differs DRD-01 · p301, p303, p306. **Inside layout:** differs DRD-02 · p300, p302. **Arc beyond its sweep:** known · p304. **Properties:** match · p323 · currentProperties.test.ts:129 |
| K | es location prompt settled (was **unverified**): match · p300 es |
| O | DRD-09, DRD-10 |

### DIMANGULAR (DAG)

Columns: ① `Select arc, circle, line, or <specify vertex>` · ② `Select second line` · ③ vertex ·
④ first endpoint · ⑤ second endpoint · ⑥ location `[Mtext/Text/Angle/Quadrant]` · ⑦ the report.

| Row | State |
| --- | --- |
| A | DIMANG, DAN, ACOANG match; ACOANGULO differs DAG-10 · p334, p337 |
| B | **①** arc, polyline arc match · p340, p341, p368 · angularDimensions.test.ts:217; text/ellipse differ DAG-04 · p354, p355. **②** same line and parallels differ DAG-03 · p349, p350; a circle differs DAG-04 · p358; two segments of one polyline differ DAG-07 · p367; sectors 15°, 100°, 195°, 280° match, 160° differs DAG-01 · p344–p348. **③–⑤** match · p352, p360, p361 · :52, :82. **⑥** Text, Angle match · p359 · :349; Quadrant known. **⑦** `°` in the report differs DAG-02 · p01, p342, p359; DIMADEC rounding match · p365 |
| C | **Typed point at ①, ②:** differs DAG-08. **⑥ `@`, LASTPOINT:** differs DAG-09 · p335, p362. **UCS:** match · p364 |
| F | U match · p363 |
| G | **Enter at ②, ③, ④:** match · p331, p332, p357. **Enter at ⑥:** differs DAG-12 · p369, d06 |
| H | **Circle form's second endpoint:** differs DAG-05 · p342, p343. **Inward extension lines:** differs DAG-06 · p342 |
| K | es match but the circle form's ⑤, DAG-11 · p342 es, p361 es |

### DIMBASELINE / DIMCONTINUE (DCH)

Columns: Sel `Select base dimension` / `Select continued dimension` · Org
`Specify second extension line origin or [Select/Undo] <Select>` · Txt the report.

| Row | State |
| --- | --- |
| A | match · p269 |
| B | **Sel** match · p200, p201, p226, p227, p237 · dimensionChains.test.ts:221–276. **Org** match · p202, p228 · :256–288; Undo at depth 0 differs DCH-03 · p213, p215 |
| C | **Sel typed point:** differs DCH-06 · p208, p227. **Org `@`:** differs DCH-01 · p229, p230. **LASTPOINT untouched:** match · p231 |
| F | Undo at depth 2, 1 match · p214 · :322; U names the command · p216 |
| G | Enter at Sel ends, at Org goes to Sel: match · p202 · :290, :298 |
| H | **The origin a pick takes:** match · p208–p210 · :187. **Last:** match · p211, p212; with an offset UCS differs DCH-08 · p241. **Default origin, DIMDLI step:** match · p203–p207, p234 · :65, :75. **Aligned base:** differs DCH-02 · p240. **Spacing source:** differs DCH-04 · p233, p242–p244, p264. **Last made an angular:** differs DCH-05 · p224. **A radial last skipped:** match · p223. **Properties, style:** match · p232, p233 · currentPropertyCommands.test.ts:87. **Preselection dropped:** match · p238 |
| K | es `un origen` settles the sweep · p202 es |
| O | DCH-07, DCH-09, DCH-10, DCH-11 |

### DIMSPACE (DSP)

| Row | State |
| --- | --- |
| A | match · p269 |
| B | **Base:** Last match · p257 · dimensionPrompts.test.ts:243; a non-dimension or nothing differs DSP-02 · p258, p259. **Value:** `-5` match · p250 · :225; FOO, `7FOO`, `12,10` differ DSP-03 · p251, p268, p225; 0 match · p249 · dimensionSpacing.test.ts:86 |
| F | U one step, named · p260 · :164 |
| G | Enter at each prompt match · p248, p261, p262 · :117 |
| H | **Preselection:** differs DSP-01 · p246. **Ranking, sides, aligned, Auto, DIMSCALE:** match · p247, p248, p252, p253, p256, p263, p266 · :51, :60, :94 |
| K | es match · p250, p257 |

## 5. Findings

Each finding lists its probe and test; the scenario, fix and regression test are in one line where
they are short. Decisions are §6.

### High

#### DOB-01 — The measurement is written with trailing zeros and a decimal point; ISO-25 suppresses them and writes a comma

- **Severity:** high · **Row:** H, L · **Status:** verified
- **Where:** `cad/domain/dimensions.ts` (`formatMeasurement`), `cad/application/tools/DimensionTool.ts` (`measurementOf`)
- **AutoCAD:** p02 (both languages): drawn `12,5`, `100`, `0,5`, `1234,57`, `45°`; the report `Dimension text = 12.5`, `= 100` (point, zeros suppressed); Text's default `<12.5>` (p15); with DIMADEC 2, `22,50°` drawn and `22.5` reported (p366); the palette's Primary Units: Decimal separator `,`, Suppress trailing zeros Yes, Precision 0.00 (d04-3).
- **mellowcad:** scratch r: `12.50`, `100.00`; `Dimension text = 12.50`.
- **Fix:** D1. **Regression test:** `dimensions.test.ts` (the drawn text and the report, p02, p01, p15); every test and the English surface snapshot asserting `100.00` move to `100`.
- **Coverage:** DIMZIN and DIMDSEP leave "Not modelled"; every `Dimension text = 100.00` in `dimensions.md`.

#### DOB-02 — A dimension's grips are its definition points and the line's midpoint; AutoCAD's are the origins, the dimension line's ends and the text

- **Severity:** high · **Row:** I · **Status:** verified
- **Where:** `cad/application/tools/selectToolGrips.ts` (`case "dimension"`), `cad/application/tools/SelectTool.ts`
- **AutoCAD:** d01-1: linear and aligned, five (two origins, the two ends of the dimension line, the text); radius three (centre, the arrow's point on the rim, the text); diameter three (the two rim points, the text); two-line angular five (the vertex side's end, the two picks, a point on the arc, the text). d03-1: the text grip's plain drag is Move with Dim Line — the line goes through the point and the text stays where it was put (DXF 11 (30.06,20), flag 70 +128).
- **mellowcad:** `dimensions.test.ts:371`: three grips, the line's at its midpoint; the text always centred.
- **Fix:** D2. **Regression test:** `dimensions.test.ts` grips per kind (d01-1), the text grip's drag (d03-1).
- **Coverage:** a "Grips" line in each entry; modify.md's "text position (DXF 11) not modelled" changes with it.

#### DSY-01 — A dimension style edit is not undoable; U takes back the command before it

- **Severity:** high · **Row:** F · **Status:** verified
- **Where:** `cad/application/runtimeStyles.ts` (`createDimStyle`, `updateDimStyle`), `CadRuntime` (`setCurrentDimStyle`, `removeDimStyle`)
- **AutoCAD:** p05: U after `-DIMSTYLE _S Plans` echoes `-DIMSTYLE`, removes Plans and puts ISO-25 back current. d05: after the Dimension Style Manager's New… and Close, U echoes `DIMSTYLE` and does the same. p06: U after `DIMSCALE 2` echoes `DIMSCALE`.
- **mellowcad:** scratch r: create, edit and set current then U leave the style; U says `Everything has been undone`.
- **Fix:** D6 (TEXT-D45's analogue). **Regression test:** `styles.test.ts` (p05, d05).
- **Rules:** `cad-runtime.md` "Settings are split on purpose" (the dimension style edits are not undoable) is stale; `runtimeStyles.ts`'s comment too.

#### DLN-01 — DIMLINEAR on a picked circle takes the diameter through the pick; AutoCAD's runs along the measured direction

- **Severity:** high · **Row:** B · **Status:** verified (by the reviewer, p109: `= 100`; mellowcad 70.71)
- **Where:** `DimensionTool.ts` (`planOrigins`, circle)
- **AutoCAD:** pick 35.36,35.36 on r50: location 0,90 gives origins (±50,0), 100 (p109); 90,0 gives (0,±50) (p114); Rotated 30 gives (±43.30,±25) (p115). DIMALIGNED takes the diameter through the pick (p147, p167).
- **Fix:** D30. **Regression test:** `dimensions.test.ts` p109, p114, p115, p147; `dimensions.test.ts:178` picks at 0° and always passes.

#### DLN-02 — H/V is chosen by how far the location escapes each way; AutoCAD decides in the bands and keeps the last direction elsewhere

- **Severity:** high · **Row:** C, P · **Status:** verified (p139, p141, p142; desktop d06: the first state horizontal, a corner keeps the last band's direction)
- **Where:** `DimensionTool.ts` (`resolveRotation`, `offered`)
- **Fix:** D32. **Regression test:** `dimensions.test.ts`, p141/p142 with the cursor at the console's pixel, and the hysteresis through moves (d06).

#### DRD-01 — An outside radial or diameter dimension is drawn as DIMTOFL 0 (a centre mark, no inner line); ISO-25 has DIMTOFL 1

- **Severity:** high · **Row:** H · **Status:** verified
- **AutoCAD:** p301: a line from the centre to the rim, the leader to the text, one arrow, no mark; p303: the diameter's line across, two outside arrows, no mark; p306 (DIMTOFL 0): the mark, no inner line.
- **Where:** `cad/domain/dimensions.ts` (radial outside branch) · **Fix:** D90 · **Tests:** `radialDimensions.test.ts:60`, `:108` pin today's picture.

#### DRD-02 — Inside, the radius line runs from the centre and the diameter gets two arrows; AutoCAD draws one run from the text to one arrow

- **Severity:** high · **Row:** H · **Status:** verified
- **AutoCAD:** p300 (`LINE 26.39→47.5`, text at (30,1.90), one arrow), p302 (one arrow); with Angle the text sits on the line (p321).
- **Fix:** D91 · **Tests:** `radialDimensions.test.ts:50`, `:99` pin today's picture. The Missing "landing (needs text measurement)" loses its reason.

#### DAG-01 — Two lines: a location in the obtuse sector near the other line gives the reflex of the acute one

- **Severity:** high · **Row:** B ② · **Status:** verified (by the reviewer, p346: `= 150`; mellowcad 330°)
- **Where:** `AngularDimensionTool.ts` (`rayEndpoint`) · **Fix:** D97 · **Test:** `angularDimensions.test.ts`, p344–p348; `:267` only tries perpendicular lines.

#### DAG-06 — Angular extension lines are drawn only outward; AutoCAD draws them inward too

- **Severity:** high · **Row:** H · **Status:** verified
- **AutoCAD:** p342: arc at r42.4 inside endpoints at 50 → two LINEs 49.375→41.18; outside p340 → 50.625→71.25.
- **Where:** `cad/domain/dimensions.ts` (angular extension lines) · **Fix:** D99 · **Test:** `angularDimensions.test.ts:146` pins it.

#### DCH-01 — `@dx,dy` at the second-origin prompt is relative to the chain's origin; AutoCAD's to LASTPOINT

- **Severity:** high · **Row:** C · **Status:** verified (by the reviewer, p229: `= 130`)
- **AutoCAD:** p229: after DIMLINEAR 0,0 / 100,0 / 50,-30, DIMBASELINE `@80,0` gives 130, origin (130,-30); p230 DIMCONTINUE; LASTPOINT stays the DIMLINEAR's location through the run (p231).
- **Where:** `DimensionChainTool.ts` (`lastPoint: this.state.chain.origin`) · **Fix:** D60, after DLN-05 · **Test:** `dimensionChains.test.ts:305` asserts the wrong result.

#### DCH-02 — An aligned base chains aligned dimensions; AutoCAD chains rotated (linear) ones at the base's angle

- **Severity:** high · **Row:** H · **Status:** verified
- **AutoCAD:** p240: aligned base 0,0→60,80, DIMBASELINE to 200,0 gives 120 and a rotated dimension (DXF 50 at 233.13°); p219.
- **Fix:** D61 · **Test:** rewrite `dimensionChains.test.ts:105–117` from p240, p219.

### Medium

| Id | Finding | Probe · test | Fix |
| --- | --- | --- | --- |
| DOB-03 | The palette's rows are a Dimension group (Measurement, Text override, Type, Rotation) and Definition points; AutoCAD's title names the kind and its groups are General, Misc (Dim style, Annotative), Lines & Arrows, Text (Text position X/Y, Text rotation, Measurement greyed, Text override), Fit, Primary Units, Alternate Units, Tolerances, with no definition point | d04-1 to d04-7 · dimensions.test.ts:412, :427 | D3 |
| DOB-04 | The shortcut menu over a selected dimension has no Dimension Style ▸ | d07-1 · shortcutMenu.test.ts:107 | D4 |
| DOB-05 | The grips' hover menus are not built and the coverage does not say so | d02-1, d02-2 | D5 |
| DSY-02 | -DIMSTYLE (es -ACOESTIL) is unknown | p04, p07, p08, p10, p11, p16 · scratch r | D7 |
| DLN-03 | An object on a locked layer cannot be picked at `Select object to dimension:`; AutoCAD dimensions it | p121 · scratch a | D38 |
| DLN-04 | A point typed at `Select object to dimension:` is refused; AutoCAD picks with it | p104, p106 | D39 |
| DLN-05 | DIMLINEAR and DIMALIGNED never set LASTPOINT (the location is LASTPOINT after) | p140 | D40 |
| DLN-06 | An ellipse, spline or dimension picked says `No object selected.`; AutoCAD `Object selected is not a line, arc or circle.` (es table 18669) | p116, p117, p120 | D36 |
| DLN-07 | A line inside a block reference cannot be picked (AutoCAD's prompt picks nested objects) | p148 | D37 |
| DLN-08 | DIMHORIZONTAL, DIMVERTICAL, DIMROTATED (es ACOHORIZONTAL, ACOVERTICAL, ACOGIRADA) are absent, from coverage too | p100, p101, p112, p113 | D31 |
| DLN-09 | A dimension lies at its location's Z; AutoCAD's at the current ELEVATION | p158, p169 · elevation.test.ts:416 (wrong) | D33 |
| DLN-10 | Angle 0 or Enter turns a vertical or aligned text horizontal; AutoCAD's 0 is the default orientation (every dimension command, through the helper) | p132, p143, p163 | D34 |
| DLN-11 | A second Text with Enter keeps the override; AutoCAD clears it | p164 | D35 |
| DLN-12 | `<30` at the Angle prompt is refused; AutoCAD takes 30 | p130 | D41 |
| DRD-03 | `Dimension text =` comes after the location; AutoCAD writes it after the pick, before the location prompt | p300 · dimensionPrompts.test.ts:150 | D93 |
| DRD-04 | A non-circular object at `Select arc or circle` is skipped in silence; AutoCAD `Object selected is not a circle or arc.` | p309, p311, p312, p314, p327 · radialDimensions.test.ts:147 | D94 |
| DRD-05 | A typed point at `Select arc or circle` is refused | p300 | D95 |
| DRD-06 | A circle on a locked layer is refused; AutoCAD dimensions it | p315 | D95 |
| DRD-07 | LASTPOINT is never set, and `@` at the location reads from the centre, not the pick | p300, p301, p318, p336 | D96 |
| DRD-08 | Text's `<>` drops the R and ∅ | p320, p329 · radialDimensions.test.ts:181 | D103 |
| DRD-11 | Enter at the location ends with nothing; AutoCAD places the dimension at the cursor | p317, p333, d06 (COM) | D11 |
| DAG-02 | `Dimension text = 90°` and Text's `<90°>`: AutoCAD writes no degree sign there (the drawn text has it) | p01, p342, p359 · dimensionPrompts.test.ts:165 | D102 |
| DAG-03 | The same line twice, or parallel lines, stay silent; AutoCAD says `Lines are parallel.` and ends | p349, p350 · angularDimensions.test.ts:298 | D94 |
| DAG-04 | The angular refusals are missing (`Object selected is not a line, arc or circle.`, `Object selected is not a line.`) | p354, p355, p358 | D94 |
| DAG-05 | The circle form's second endpoint is not projected onto the circle | p342, p343 · angularDimensions.test.ts:239 | D98 |
| DAG-07 | Two straight segments of one polyline are refused as a line pair | p367 | D105 |
| DAG-08 | A typed point at ① and ② is refused; locked lines skipped (AutoCAD side unverified for DIMANGULAR, p315 by analogy) | p340 ff. | D95 |
| DAG-09 | `@` at the location reads from the vertex, and LASTPOINT is never set | p335, p340, p362 | D96 |
| DAG-10 | es ACOANGULO is not a 2027 name: ACOANGULAR is the command, ACOANG its alias | p334, p363 | D100 |
| DAG-12 | Enter at the location ends with nothing; AutoCAD places the dimension at the cursor | p369, d06 (DIMRADIUS's, the same jig) | D11 |
| DCH-03 | The Undo keyword with nothing placed is silent; AutoCAD `Command has been completely undone.` | p213, p215 · dimensionChains.test.ts:335 | D64 |
| DCH-04 | Baseline spacing uses the base's DIMDLI; AutoCAD the current style's, times the base's DIMSCALE | p233, p242–p244, p264 | D62 |
| DCH-05 | After a DIMLINEAR then a DIMANGULAR, the chain silently starts from the linear; AutoCAD chains the angular | p224 | D63 |
| DCH-06 | A point typed at `Select base dimension:` is refused; AutoCAD picks there | p208, p227 | D39 |
| DCH-07 | Last is the last dimension in the drawing; AutoCAD's is the last made in this session: after SAVEAS and OPEN, DIMBASELINE asks `Select base dimension:` | p400 | D69 |
| DSP-01 | A preselection is dropped; AutoCAD takes it as the set to space | p246, p239 | D66 |
| DSP-02 | A base pick on a non-dimension or on nothing is silent | p258, p259 | D94 |
| DSP-03 | The value is a distance field; AutoCAD's is a keyword prompt read by its leading number (`FOO` lines up, `7FOO` is 7, `12,10` is 12) | p225, p251, p268 | D65 |

### Low

| Id | Finding | Probe · test | Fix |
| --- | --- | --- | --- |
| DSY-03 | The table lacks Standard (imperial: DIMTXT 0.18, DIMTAD 0, DIMTIH On) and Annotative | p07, p10, p14, d05-1 | D8 |
| DSY-04 | DIMxxx variables typed as commands (DIMSCALE, DIMTXT) are unknown; AutoCAD makes overrides, U names them | p06 | D9 |
| DLN-13 | DIMALIGNED's es Angle prompt is `Designe ángulo de texto de cota`, not `Precise…`; the helper's field label too | p143 · dimensionPrompts.test.ts:134 (wrong) | D44 |
| DLN-14 | A second Rotated shows `<30>`; AutoCAD's default is always `<0>` and Enter keeps the rotation | p165 | D42 |
| DLN-15 | With an explicit Angle, AutoCAD centres the text on the dimension line | p129, p168 | D43 |
| DLN-16 | The rollover at the object prompts is `THEME.selected`; the rule says `THEME.entityHover`, width 2 (DIMRADIUS, DIMANGULAR, the chains, DIMSPACE too: DRD-09, DCH-11) | dimensions.test.ts:186 | D104 |
| DLN-17 | Tests: `dimensions.test.ts:178` always passes; 2023 citations re-probed (p01, p104, p126, p129, p137) | — | D68 |
| DRD-09 | The rollover (DLN-16's) in RadialDimensionTool and AngularDimensionTool | radialDimensions.test.ts:155, angularDimensions.test.ts:307 | D104 |
| DRD-10 | The diameter sign is U+00D8 where AutoCAD draws ∅ (U+2205), and the coverage has no note of it | p302 | D106 |
| DAG-11 | The circle form's es second endpoint is `Precise segundo punto final del ángulo` | p342 es | D101 |
| DCH-08 | Last with an offset UCS measures from the UCS's origin; AutoCAD's from the WCS's | p222, p241 | D67 |
| DCH-09 | A pick on a radial dimension at Select says `No object selected.`; AutoCAD `Linear, ordinate, or angular associative dimension required.` and asks again, as for Last on one | p237, p401, p402 | D70 |
| DCH-10 | Stale comments: DIMCONTINUEMODE "0 default" (p00 reads 1), "no angular dimension here yet", 2023 citations (re-probed, they hold) | p00, p202, p211, p226 | D68 |
| DCH-11 | The rollover (DLN-16's) in DimensionChainTool and DimSpaceTool | — | D104 |

## 6. Decisions

The owner does not answer technical questions (AGENTS.md); each is the most standard option.

- **DIMS-D1** (DOB-01): `DimStyle` gains `decimalSeparator` (DIMDSEP, `,` for ISO-25) and `suppressTrailingZeros` (DIMZIN's 8, on for ISO-25; DIMAZIN 0 leaves angles alone, p366). The drawn text uses both; the report and Text's default use a point and the suppression (p01, p15). A file without them reads ISO-25's values (a version bump). The palette's Measurement row reads as the drawn text (d04: `40`; a fractional value there unverified).
- **DIMS-D2** (DOB-02): grips per kind as d01-1. A dimension stores an optional user text position (DXF 11 with flag 128, absent when the text is centred); every transform maps it through `mapDimensionPoints`. The text grip's drag is Move with Dim Line (d03-1); a dimension line end's drag stretches the line's location; the origins' drags restate the measurement. The diameter's two rim grips move the line's direction through the centre.
- **DIMS-D3** (DOB-03): the palette takes AutoCAD's title per kind and its groups, with the rows the model has (Dim style editable through the drop-down; Text override and Text position X/Y editable; Arrow size, Ext line ext, Ext line offset, Center mark size, Text height, Text offset, Dim scale overall, Decimal separator, Suppress trailing zeros, Precision read from the style, read-only, since an edit there is an override AutoCAD keeps per object and overrides are not modelled). Type, Rotation and the definition-point rows go: AutoCAD has none.
- **DIMS-D4** (DOB-04): the edit menu over a selection of dimensions gains Dimension Style ▸ listing the table's styles (one step through `setSelectionDimStyle`); Precision ▸ and Remove Style Overrides go to Missing (overrides).
- **DIMS-D5** (DOB-05): the hover menus go to Missing with d02's contents.
- **DIMS-D6** (DSY-01): the dimension style table goes through history commands as the text style's (TEXT-D45): create, edit, rename, delete and set current are one step each, U names it `DIMSTYLE` (`ACOESTIL`, unverified in es), one made mid-command joins that command.
- **DIMS-D7** (DSY-02): -DIMSTYLE (es -ACOESTIL) with the Current line, Save (a new name, `That name is already in use, redefine it? <N>:` for one in use, any case, p08), Restore (a name, `?`, Enter's `Select dimension:`, p16), `?` (`Named dimension styles:`), Apply (the selected dimensions take the current style, p16), STatus and Variables (the modelled variables in AutoCAD's three columns; the rest are not listed); ANnotative to Missing; U names it `-DIMSTYLE` (p05); `'-DIMSTYLE` refused (p09).
- **DIMS-D8** (DSY-03): Standard and Annotative stay out: Annotative is inert without annotative scaling (TEXT-D50) and Standard's look needs DIMTAD 0 and DIMTIH On, which are not modelled. Missing says so.
- **DIMS-D9** (DSY-04): the DIMxxx variables typed as commands go to the Workspace review (system variables typed as commands) and to Missing (overrides).
- **DIMS-D10**: the Styles palette stays the Dimension Style Manager's stand-in (TEXT-D58); d05's dialog is written into Missing.
- **DIMS-D11** (DRD-11, DAG-12): Enter at a radial or angular location places the dimension at the cursor's location (the jig's point), as the desktop does through COM (d06) and the console at its fixed cursor.
- **DIMS-D12**: the execution runs in a fresh session, blocks in §12's order.
- **DIMS-D30 to D44** (DLN): D30 a linear dimension of a circle takes its origins from the resolved direction at placement, DIMALIGNED keeps the diameter through the pick; D31 DIMHORIZONTAL, DIMVERTICAL, DIMROTATED as modes of `DimensionTool` (DIMROTATED asks its angle first); D32 the band rule with hysteresis, first horizontal (p141, p142, d06); D33 every dimension at the current ELEVATION; D34 Angle 0 or Enter stores no text angle; D35 Text's box not preloaded, Enter clears; D36 the message `Object selected is not a line, arc or circle.` (18669); D37 a nested pick through `insertGeometry`; D38 `picksLocked()` at the object pick; D39 a typed point at an object pick through `typedPick` (DCH-06 too); D40 `setsLastPoint()` at P1, P3, P4; D41 `<a` at a lone angle field filed with the point-input owner's parse; D42 Rotated shows `<0>`, Enter keeps the rotation; D43 the text centred under an explicit Angle to Missing; D44 DIMALIGNED asks `specifyAngleOfDimensionText`, the unused key stays.
- **DIMS-D60 to D70** (DCH, DSP): D60 `@` reads the runtime's LASTPOINT; D61 an aligned base chains rotated dimensions at its axis; D62 spacing = the current style's DIMDLI × the base style's DIMSCALE; D63 Last stops at an angular dimension (Select is asked) until angular chaining exists, still skips radial ones; D64 `commandCompletelyUndone` at depth 0; D65 DIMSPACE's value read as its leading number (`FOO` → 0), no two-point distance, a negative refused; D66 a preselection is the set (`preselect`, the count with the base); D67 Last's reference is the WCS origin; D68 tests pinning wrong behaviour are rewritten in their block's commit, citations re-pointed at 2027 probes; D69 Last ranges over the dimensions made since the drawing was opened or started (p400), so a reopened drawing asks Select; D70 a pick on a radial (or a non-chainable dimension) at Select writes `associativeDimensionRequired` and asks again (p401, p402).
- **DIMS-D90 to D106** (DRD, DAG): D90 DIMTOFL on `DimStyle` (1 for ISO-25), the outside branch follows it; D91 the radial runs laid out with the measured text width; D92 runs end at the arrow's base only where it shows; D93 the report after the pick; D94 message ids `notCircleOrArc`, `notLineArcOrCircle`, `notALine`, `dimLinesParallel` (with its period; FILLET's `linesParallel` stays), the two-line form ending after it; D95 the object prompts through `typedPick`, locked objects taken; D96 point prompts declare `setsLastPoint()`, picks set LASTPOINT, `@` reads it; D97 the line pair takes the sector holding the location's bearing; D98 the circle form's second endpoint projected radially; D99 angular extension lines inward or outward, DIMEXO and DIMEXE; D100 es names `ACOANGULAR`, `ACOANG`; D101 a prompt id for the circle form's second endpoint (es `Precise…`); D102 no `°` in the report or Text's default; D103 `<>` substitutes the prefixed measurement; D104 the rollover `THEME.entityHover`, width 2, everywhere (DLN-16, DRD-09, DCH-11); D105 the second line excludes the same segment, not the same entity; D106 the ∅ (U+2205) where the font has it, else a WHY and a coverage note.

## 7. Tests proposed

- **Regression tests**: each finding's, in the lowest layer, citing its probe.
- **Untested cells**: Enter at DIMLINEAR's P2–P4 (p105, p123, p124); the preselection dropped by every drawing dimension command (p149–p153); DIMDIAMETER's current properties (p323); DIMSPACE's Enter on an empty set (p262), aligned at 30° (p256), aligned with rotated (p263).
- **Old citations**: every "AutoCAD 2023's console" in the dimension tools and tests re-pointed at the 2027 probe that confirmed it (p01, p104, p126, p129, p137, p202, p211, p226, p257, p300, p361).

## 8. What is not tested and why

The presenters' drawing of the text (canvas and SVG: `cad-scene.md`), the arrow's fill; what the
desktop alone shows (hover menus, d02; the palette's look).

## 9. What could not be reviewed and why

- The transforms of a dimension: owned by the Transforms review (modify.md); only the text
  position (D2) changes them.
- Ortho and Polar at the location prompts (UseBasePoint false in the trace, an anchor in
  mellowcad): the execution checks them on the harness against the trace's flag; the desktop pass
  ran out of its time before them.
- The dashed rubber band at DIMLINEAR's P3 and DIMANGULAR's ④/⑤ (UseDashedLine true): render, not
  probed on the desktop.
- Spanish desktop labels (the palette's, the Dimension Style Manager's): the pass ran in English.

## 10. Refuted in the adversarial pass

- `'DIMRADIUS` at LINE's prompt: mellowcad writes AutoCAD's two lines (p338; the scratch test read
  only the last).
- Enter at DIMLINEAR's first prompt ending the command: both ask `Select object` (p104).
- A radial last breaking a chain: both skip it (p223).
- DIMSPACE's Auto ignoring DIMSCALE: p255 is a per-dimension override; a saved style gives 50 in
  both (p266).
- The help's "same type (rotated or aligned)" for DIMSPACE: AutoCAD spaces them together (p263).
- DIMALIGNED on a circle ignoring the location: p167 honours it, as mellowcad does.
- The catalog sweep's `radius` row: CIRCLE's prompt, not a dimension command's.

## 11. Coverage ↔ code ↔ AutoCAD; rules ↔ code

Coverage claims that do not hold: DIMLINEAR "circle diameter" (DLN-01), "H/V inferred from drag"
(DLN-02), the refusal list (DLN-06), Rotated's `<0.00>` (it is `<0>`, p134); DIMALIGNED's es Angle
(DLN-13); the chains' "inherits kind" (DCH-02), "DIMDLI spacing" (DCH-04); DIMSPACE's refusals for
picks (DSP-02); DIMRADIUS's report order (DRD-03) and "DIMCEN centre mark" (DRD-01);
DIMDIAMETER's landing reason (DRD-02) and "Ø symbol" (DRD-10); DIMANGULAR's ACOANGULO (DAG-10),
`Dimension text = 90°` (DAG-02), "<180° for a line pair" (DAG-01); DIMSTYLE's "U of a style edit"
(DSY-01); "Not modelled: DIMTOFL" (DRD-01). Absent from Missing: DIMHORIZONTAL/VERTICAL/ROTATED,
nested picks, -DIMSTYLE, the grips' menus, the Dimension Style Manager, Standard and Annotative.
Settled: the radial es location prompt (p300 es; its **unverified** goes).

Rules that do not hold: `cad-tools.md` "A dimension lies at the height of the point placing its
dimension line" (stale, DLN-09); "LASTPOINT … `setsLastPoint()`" (broken, DLN-05, DRD-07, DAG-09);
"a typed point is its pick (`typedPick`)" (broken, DLN-04, DRD-05, DAG-08, DCH-06); "Pick feedback
… `THEME.entityHover`" (broken, DLN-16); the Undo keyword's refusal (broken, DCH-03);
`cad-catalogs.md` "silence reads as a bug" (broken, DRD-04, DAG-03, DAG-04, DSP-02) and the
preselection counted by `preselect` (broken, DSP-01); `cad-runtime.md` "the dimension style edits
… are not undoable" (stale after DSY-01).

Checked and holding: `mapDimensionPoints` for every transform; `withCurrentProperties`; the
style's DIMxxx on `DimStyle`, `clampDimStyle` the gate; names case-blind; the chains' layer and
style (DIMCONTINUEMODE 1); the Text and Angle helper shared by every command, its prompts where
AutoCAD's are.

## 12. Order of execution and estimate

One subagent per block, the reviewer commits each; blocks go one after another (shared catalogs
and snapshots).

1. **DOB** (DOB-01 to DOB-05): the format first, since every other block's expected strings read
   it; then the text position, the grips, the palette, the menu. Large: a model field, a file
   version, many tests' strings and the English snapshot.
2. **DSY** (DSY-01 to DSY-04): the history commands, -DIMSTYLE. Medium.
3. **DLN** (DLN-01 to DLN-17): with the shared pick (typed point, locked objects), LASTPOINT and
   rollover mechanisms built in DimensionTool first, reused by the next blocks. Large.
4. **DRD and DAG** (DRD-01 to DRD-11, DAG-01 to DAG-12): DIMTOFL on the style, the radial layouts,
   the angular sector and extension lines, the refusals. Large.
5. **DCH and DSP** (DCH-01 to DCH-11, DSP-01 to DSP-03): after DLN's LASTPOINT. Medium.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/dimensions.md`: every entry per its findings; DIMHORIZONTAL, DIMVERTICAL,
  DIMROTATED entries; -DIMSTYLE; the grips and their menus; the palette; the Dimension Style
  Manager and Standard/Annotative in Missing; "Not modelled" loses DIMZIN, DIMDSEP, DIMTOFL.
- `docs/coverage/spanish.md`: ACOANGULAR.
- Rules: `cad-tools.md` (a dimension at the current ELEVATION; a refusal object from `takes()`
  hides the point from LASTPOINT), `cad-runtime.md` (style edits undoable), `cad-engine.md`
  (a dimension's optional text position goes through `mapDimensionPoints`).
- Catalogs: the new messages (D36, D94), DIMSTYLE's prompts and messages (D7), the names (D31,
  D100), the circle form's prompt (D101).
- Roadmap: the review's state `plan`, then `done`; it owns the dimension objects and styles; the
  DIMxxx variables typed go to the Workspace review (D9).

## 14. Template improvements

- **annex-probes.md §4**: a `com send` ending in a space leaves LINE waiting for its next point:
  end it with `\n\n` (or draw with PLINE); the Properties palette's groups fold by the arrow at the
  header's right, and the fold persists in the profile: unfold them before closing (Dimensions).
- **template §4.8**: the reviewer greps, in Phase 1, the rules' shared contracts
  (`setsLastPoint`, `typedPick`, `picksLocked`, `THEME.entityHover`) across all the review's tools
  and hands that sweep to one subagent by name: three subagents found LASTPOINT broken each in its
  tools.
- **template §4.3**: a scratch test asserts AutoCAD's answer; one that only dumps values (DLN's
  first pass) proves nothing when the plan cites it.
