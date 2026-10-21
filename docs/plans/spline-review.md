# SPLINE review

> **Status:** plan, 2026-10-21 — phases 0–4 of skill `command-review`, the seventh review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (SPL, SPD, SOB), one commit each.

## 1. Summary

2 high, 21 medium and 11 low findings over three blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| SPL | SPLINE and its rail entry: prompts, answers, points, aids, properties | 1 | 7 | 5 |
| SPD | what the desktop shows while SPLINE asks: the jig and dynamic input | 0 | 3 | 1 |
| SOB | the spline object (this review owns it): its curve, snaps, measures, render, grips, palette | 1 | 11 | 5 |

The worst: every fit spline through three or more points is another curve than AutoCAD's — its free
ends follow Bessel's parabola where AutoCAD's have zero curvature (SOB-01; p01's control points
differ by a third of a unit on a 30-unit spline, and Midpoint, Nearest, dashes and every measure with
them); Enter at the first prompt ends the command where AutoCAD refuses it in the prompt's words
(SPL-01, ELL-01's analogue); and a typed tangent loses its length, which AutoCAD uses as the
derivative itself (SOB-02).

The analogues ELLIPSE left, probed first: Enter refused at the first prompt (differs, SPL-01: p106,
d05); the rail as the ribbon's macros (differs, SPL-07: acad.cuix `^C^C_^RSPLINE _M _FIT` and
`^C^C_^RSPLINE _M _CV`); TAN/PER with no base from LASTPOINT (differs, SPL-34: p242, p243, p274); the
jig in the current colour with amber dashed lines (differs, SPD-01, SPD-02: d01, d02, d07) and the
DYNMODE 3 box at every point prompt (the next point matches; the tangents differ, SPD-03: d04);
`<a` (match: honoured at the next point on the desktop, d03, though the console ignores it, p208);
MIRROR's −Z normal (refuted: a mirrored spline keeps +Z, p320). The options kept (SPLMETHOD,
SPLKNOTS, SPLDEGREE) are RECTANG's area: kept for the session (p104), no OPEN test due.

## 2. Inventory

Commit `e6439e5`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The command:** `cad/application/tools/SplineTool.ts` (`currentProperties.ts`,
  `coordinateInput.ts`, `DynamicInput.ts`, `directDistance.ts`, `ucsHeading.ts`); `defaultTools`
  (`runtimeTools.ts`: `spline`), `TOOL_COMMANDS` (`CommandLine.ts`: SPLINE); not transparent.
  Catalogs: `commands.names` SPLINE (`SPL`), the keywords Method, Knots, Degree, Fit, CV, Chord,
  Square root, Uniform, start Tangency, end Tangency, Undo, Close, the prompts
  `specifyFirstPointOr`, `enterSplineCreationMethod`, `enterKnotParameterization`,
  `enterDegreeOfSpline`, `enterNextPoint`, `enterNextPointOr`, `enterThirdPointOr`,
  `specifyStartTangent`, `specifyEndTangent`, the messages `splineSettingsFit`, `splineSettingsCv`,
  the labels `splineStartTangent`, `splineEndTangent`, `splineDegree`, in `en.json`, `es.json`,
  `ar.json`. The rail's single Spline entry (`tool-rail.tsx`), the landing's filing
  (`content/commands.ts`: SPLINE).
- **The object:** `cad/domain/splines.ts`, `cad/geometry/nurbs.ts`, the spline parts of
  `entities*.ts`, `entityTransforms.ts`, `entityQueries.ts`, `entityProperties.ts`, `objectArea.ts`,
  `boundary.ts`; its scene in `SceneBuilder.ts` (one `path`), both presenters; its snaps in
  `snapping/providers.ts`; its grips in `selectToolGrips.ts`, `selectToolOverlay.ts`,
  `selectToolEdits.ts`; its palette rows in `EngineState.ts`; its part of the file in
  `cad/serialization/drawingFile.ts` (no DXF: the app reads and writes none); `clipboard.ts`; read by
  `curveCrossings.ts`, `EdgeEditTool.ts`, `BreakTool.ts`, `OffsetTool.ts`, `ExplodeTool.ts`.
- **Tests:** `drawing.test.ts` (SPLINE, 2262–2474), `currentProperties.test.ts`,
  `ambiguousKeywords.test.ts`, `locale.test.ts`, `englishSurface.test.ts`, `invalidAnswers.test.ts`,
  `providers.test.ts`, `entities.test.ts`, `nurbs.test.ts`, `drawingFile.test.ts`,
  `selection.test.ts`, `editing.test.ts`, `transforms.test.ts`; none in `lastPoint.test.ts`,
  `normals.test.ts`, `SceneBuilder.test.ts`, `objectArea.test.ts`, and no `splineFiles.test.ts`.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after SPLINE; LINE and ID reading
  the LASTPOINT it leaves; MIRROR, ROTATE, SCALE, MOVE, STRETCH, BREAK, EXPLODE and AREA on the
  object; CECOLOR, CELTYPE, CELWEIGHT, CLAYER, ELEVATION, THICKNESS, a UCS; SPLMETHOD, SPLKNOTS,
  SPLDEGREE.
- **Areas owned:** the spline object (SOB). **Cited:** LINE's (the command line, point input,
  object snaps, Ortho, OTRACK, dynamic input, undo, current properties, grips, the palette, files,
  render), CIRCLE's (tangent constructions), RECTANG's (options kept for the session), ELLIPSE's
  (the ellipse object, for EOB-04's analogue).
- **Knowledge:** `docs/coverage/draw.md` (SPLINE), `drafting-aids.md`, `modify.md`,
  `properties.md`, `command-line.md`, `spanish.md`; rules `cad-tools.md`, `cad-catalogs.md`,
  `cad-engine.md`, `cad-scene.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/spline/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh spline <ids>` in es-ES and en-US;
the desktop's are `dsk.sh` with `lib-dsk.sh` in the same folder. Transcripts and screenshots are in
`research/probes/spline/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p02 | ACADVER; a Fit and a CV spline through 0,0 10,10 20,0 30,10 with MPDUMP and every prompt's flags |
| p100–p105 | names and aliases in en and es; `_.SPLINE`, `_SPL`; Enter repeats (and keeps CV, p104); `'_SPLINE` at LINE |
| p106–p114 | the first prompt's Enter, `FOO`, `0`, `-5`, other keywords; local and global capitals at every prompt; Degree `0`, `11`, `2.5`, `-1`; Object |
| p115–p131 | each next point (Fit after 1, 2, 3; CV after 1, 2, 3), the tangents, toLerance: refusals, Enter, `0`, negatives; Undo at every depth |
| p132–p143, p157 | `'_ZOOM`, `'_-PAN`, `'ORTHOMODE`, `'_-OSNAP`, `'_LINE` at every prompt; U, REDO, UNDO 2, MREDO (untraced) |
| p144–p156 | local letters at the Fit and CV prompts; after Undo back to one point (`_T`, Enter); Degree's hidden keywords |
| p200–p234 | point entry at every point prompt: `x,y,z`, `@`, `d<a`, `#`, `*` in UCS Z 30, a number, `<a`; the tangents typed; LASTPOINT; ELEVATION, UCS; CLAYER, CECOLOR, CELTYPE, CELWEIGHT, CELTSCALE, THICKNESS; each changed mid-command |
| p240–p277 | `_END`, `_MID`, `_CEN`, `_QUA`, `_INT`, `_NEA`, `_PER`, `_TAN`, `_FRO`, `_M2P` at each prompt; TAN/PER from LASTPOINT; TAN and PER at the tangents; Ortho with typed points |
| p300–p308 | the curve: natural ends (a data table over 2–5 points and the three parameterizations), tangents given at several lengths, closed fit, CV degrees 1–10 open and closed |
| p310–p331 | snaps on the object (END, MID, NEA, INT, TAN, PER, CEN, QUA, NOD, GCEN, INS); AREA, LIST, length; EXPLODE; MIRROR, ROTATE, SCALE, MOVE, STRETCH, BREAK; a DASHED plot (p328); DWG and DXF round trip |
| d00–d10 | the desktop, owner's Spanish profile: the Fit jig and Ortho; the tangents' jigs; `<45` then 10; DYNMODE 3 at every point prompt; the Down list and Enter; the right button; the CV jig; the grips of a fit and a CV spline, their hover menus, drags and the triangle grip; the Properties palette of a fit, a CV and a closed spline |
| d11, d12 | through COM only: Enter at the start tangent; `_T` after Undo back to one point |

The desktop ran in the owner's Spanish profile. The palette's English labels are paired by id from
`ax26res.dll` (en-US and es-ES) instead of a pass in the English profile (§13).

## 4. Matrix

Cells read `state · AutoCAD probe · mellowcad test` (`s:` a scratch test of
`research/review/spline/`). Columns: **1** first point (Fit, CV), **M/K/D** Method, Knots, Degree,
**F1–F3** a fit next point after one, two, three or more points, **ST**, **ET** the start and end
tangent, **C1–C3** a CV next point after one, two, three or more.

### SPL — the command

| Row | 1 | M/K/D | F1 | F2 | F3 | ST | ET | C1 | C2, C3 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A names, aliases en/es | match · p100, p101 · `drawing.test.ts:2310`, `locale.test.ts:690` | | | | | | | | |
| A `_.SPLINE`, `_SPL` | known · p102 (command-line.md, the `.` prefix and `_` with a global alias) | | | | | | | | |
| A rail | differs SPL-07 · acad.cuix · s:a/extra | | | | | | | | |
| A Enter repeats; `'_SPLINE` at LINE | match · p103, p104, p105 · untested | | | | | | | | |
| B text en, es | match · p01, p02, p108, p111, p118, p122 · `drawing.test.ts:2263`, `locale.test.ts:690` (es F3, CV, Degree, tangents untested) | | | | | | | | |
| B settings line | match · p01, p02, p108 · `drawing.test.ts:2290`, `locale.test.ts:704` | | | | | | | | |
| B keywords, capitals | match · p108–p110, p144–p146 · `ambiguousKeywords.test.ts:359` (2023's citations, SPL-08) | Degree's hidden keywords differ SPL-04 · p153–p155 | match | match | match | n/a | n/a | n/a (`dummy` refused in both, p130) | match |
| B Enter | differs SPL-01 · p106, d05 | match · p109, p111–p113 | match (ends, nothing drawn) · p116 | match · p121 | match · p01 | match (no tangent) · d11 (p118's tangent was the console's cursor) | match · p147 | match · p127 | match · p128, p02 |
| B `0`, negative | match · p107 | match · p111, p112 | `0` match · p117; `-5` differs SPL-06 | | | match · p119 | match · p122 | | |
| B `FOO`, another prompt's keyword | match · p106 | Degree differs SPL-04 · p111 | match · p115 | match · p120 | match · p124 | match · p118 | match · p122 | differs SPL-05 · p127, p138 | match · p128, p129 |
| B the loop after Undo | | | after Undo back to one point differs SPL-02 · p125, p128, p152, p156, d12 | | | | | | |
| C `x,y`, `@…`, `d<a`, `*` | match · p202, p203, p205, p217 · `drawing.test.ts:2328` (the rest untested) | | | | | untested · p213, p214 | untested · p210 | untested · p221 | untested · p216 |
| C `x,y,z` | the first point's Z is the plane · untested · p200 | | differs SPL-31 · p200, p201, p216, p265 | | | | | | |
| C `@` alone | untested · p259 | | untested (re-asked silently in both) · p204 | | | untested (no tangent) · p257 | untested · p258 | | |
| C a number | | | untested · p207 | untested (with F8) · p254 | | untested · p211 | untested · p215 | | |
| C `<a` | refused in both · p209 | | match · d03 (honoured; the console's p208 is its artefact) · untested | | | unverified · p212 | unverified · p256 | | unverified · p222 |
| C LASTPOINT | untested · p217, p259, p218, p202, p213, p219, p221, p276; after the end tangent differs SPL-32 · p210, p220 | | | | | | | | |
| D overrides | END, MID, CEN, QUA, INT, NEA untested · p240, p241 | | PER, TAN untested · p244, p245 | p246, p255 | | ordinary TAN, PER untested · p249, p251, p267 | deferred TAN differs SPL-33 · p250, p262, p263, p270, p272, p273; PER, NEA untested · p264, p266 | | TAN untested · p275 |
| D TAN, PER from LASTPOINT | differs SPL-34 · p242, p243, p253, p274; inside the circle refused in both · p252 | | | | | | | | |
| D FRO; M2P | untested · p247, p271; M2P known (drafting-aids.md) · p248 | | | | | | | | |
| D Ortho | typed points ignore it · p254; the pick bends from the last point · d01-4, d07-4 · untested | | | | | | | | |
| E transparent | match · p132–p140 · s:a/more (untested); `'ORTHOMODE` known; `'_LINE` at C1 SPL-05 | | | | | | | | |
| F Undo keyword | | | 4→2 match · p125 · `drawing.test.ts:2355`; 2→1 and at 1 differs SPL-02 | | | | | | |
| F U, REDO, UNDO 2, MREDO | match · p104, p142, p143, p157 · s:a/extra (untested) | | | | | | | | |
| G another command | match · p187-like at every prompt but C1 (SPL-05) · s:a/probes | | | | | | | | |
| G Escape, right button | owned (LINE); Escape discards the curve (`*Cancelado*`, d06) · `drawing.test.ts:2371` | | | | | | | | |
| H geometry | (block SOB) | | | | | | | | |
| H properties | set before: match · p226 · `currentProperties.test.ts:277` (layer untested); CELTSCALE known; changed mid-command differs SPL-30 · p227–p233, p260, p261, p268, p277 | | | | | | | | |
| H planes, ELEVATION | the first point's ELEVATION untested · p223, p226; later points differ SPL-31 · p223, p231, p234, p265; UCS Z 30 and X 90 untested · p224, p225 (210's sign differs, points equal: refuted, §10) | | | | | | | | |
| K catalog sweep | es-several ×4 settled as the catalog has them (p01.es, p02.es); `firstPoint`, `splineDegree` no-source labels (desktop: unseen in English) | | | | | | | | |
| L history | match line by line but SPL-01, SPL-02, SPL-04, SPL-05, SPL-06 and the owned echoes (`SPL SPLINE`, es `H`, picks without coordinates) | | | | | | | | |
| N tests | SPL-08, SPL-35 | | | | | | | | |

### SPD — the jig and dynamic input

| Prompt | Jig (d01, d02, d07) | Ortho | DYNMODE 3 (d04) |
| --- | --- | --- | --- |
| 1 | none | n/a | X and Y · match (owned) |
| F1 | an amber dashed line from the first point · differs SPD-02 (ours a solid two-point ghost) | bends · untested | a length and an angle · match |
| F2, F3 | the ghost in CECOLOR through the points and the cursor, and the amber dashed line from the last point · differs SPD-01, SPD-02 | bends (`Orto: 15.9728 < 90°`) · untested | a length and an angle · match |
| ST, ET | the amber dashed line from the first or the last point, the ghost following the tangent · differs SPD-01, SPD-02 (ours solid, theme-coloured) | bends · untested | a length and an angle · differs SPD-03 (ours one `X,Y` field) |
| C1–C3 | the frame a light-grey fine dashed polyline, the ghost in CECOLOR, the amber dashed line · differs SPD-01, SPD-02, SPD-04 | bends · untested | as F1–F3 · match |
| Down list | Método, Nudos, Objeto; finalizar Tangencia, toLerancia, desHacer, Cerrar (d05) · match but Object and toLerance (known) | | |
| Right button | the menu with the prompt's options (d06) · owned (LINE) | | |

### SOB — the spline object

| Row | Fit open | Fit closed | CV open | CV closed |
| --- | --- | --- | --- | --- |
| Curve | differs SOB-01 · p01, p300, p301 · s:c/geom | match · p303, p307 · untested | match · p304 · untested | differs SOB-03, SOB-04 · p305 |
| Tangents | differs SOB-02 · p302, p306, p308 | match (dropped at Close) · p307 | n/a | n/a |
| Knots | match · p300, p301 · `nurbs.test.ts:22` (uncited) | match | match | match |
| END | match · p312 | match · p311 | match · p310 | differs SOB-04 · p311 |
| MID | differs SOB-01, SOB-08 · p312 | differs SOB-05 · p311 | differs SOB-08 · p310 | differs SOB-05 · p311 |
| NEA | differs SOB-01, SOB-09 · p312 | unverified (same code) | differs SOB-09 · p310 | unverified |
| INT | unverified (same code) | unverified | differs SOB-10 · p310, p313 | unverified |
| INT with itself | match (none) · p331 | | | |
| TAN, PER, GCEN | known · p313, p315, p316, p311 (GCEN of a closed one 10,10 and 40,10) | | | |
| CEN, QUA, INS, NOD | match (none) · p310–p312 | | | |
| MIRROR | match (+Z kept) · p320 | untested | match · p320 | untested |
| ROTATE, MOVE, SCALE | match · p321 (SCALE's stored tangent SOB-15) | untested | untested | untested |
| STRETCH | match · p322 | untested | match · p323 | untested |
| BREAK | known · p326 (reason refined, SOB-12) | known | known · p325 | known |
| EXPLODE | differs SOB-11 · p319, p324 | | | |
| AREA, length | differs SOB-07, SOB-08 · p327, p317 | differs SOB-08 · p327 | differs SOB-07, SOB-08 · p327 | differs SOB-07 · p317 |
| Linetype | differs SOB-06 · p328 | | | |
| Grips | squares at the fit points · match · d08; triangle grip and hover menus known | | round at the vertices, the frame dashed · differs SOB-17 · d09 | |
| Palette | differs SOB-16 · d10-1 | differs SOB-16 · d10-3 | differs SOB-16 · d10-2 | |
| File, autosave, clipboard | match · s:c/object (untested in the repo) | | | |

## 5. Findings

### High

#### SPL-01 — Enter at the first prompt ends the command

- **Severity:** high · **Row:** B, G · **Status:** verified
- **Where:** `SplineTool.ts` `commitTypedPoint` (empty text → `endCommand`), `onEnter` → `acceptDefault` false at `first`
- **AutoCAD:** AllowNone false at `Specify first point or [Method/Knots/Object]:` and its CV form (p01, p02); Enter → `Point or option keyword required.` (es `Se requiere un punto o una opción.`) and the prompt again (p106; desktop d05 the same with DYNMODE 3)
- **mellowcad:** s:r "enter first": the prompt, then `Command:`; Space and the box's Enter the same (s:a/extra)
- **Scenario:** `SPL`, `M`, `CV`, Enter by habit → the command and its settings prompt are gone → AutoCAD asks again
- **Fix:** an `onEnter` at `first` that reports `pointOrKeywordRequired` and returns true, the box's empty commit the same (ELL-01's way; SPLINE-D1)
- **Regression test:** `drawing.test.ts` "SPLINE › Enter at the first point", Fit and CV, en and es, the keyboard and the box, p106
- **Coverage:** draw.md gains the refusal; `cad-tools.md`'s Enter rule holds again

#### SOB-01 — A fit spline's free ends follow Bessel's parabola; AutoCAD's have zero curvature

- **Severity:** high · **Row:** H, D · **Status:** verified (the reviewer's p01, the subagent's data table)
- **Where:** `splines.ts:146-153`, `nurbs.ts:285-315` (`besselStartDerivative`, `besselEndDerivative`)
- **AutoCAD:** a clamped cubic at AutoCAD's knots with C″ = 0 at each free end reproduces all 21 open fit
  splines of p01, p300, p301, p302, p306, p308 to six decimals; p01 (0,0 10,10 20,0 30,10, Chord):
  3.3333,5.5556 · 10,16.6667 · 20,−6.6667 · 26.6667,4.4444; p300#1 (0,0 10,10 20,0): 3.3333,5 · 10,15 ·
  16.6667,5; the two-point case is a straight cubic (d03: knots 0,0,0,0,10,10,10,10)
- **mellowcad:** s:c/geom p01: 3.3333,6.6667 · 10,16 · 20,−6 · 26.6667,3.3333; p300#1 3.3333,6.6667 ·
  10,13.3333 · 16.6667,6.6667
- **Scenario:** any fit spline through three or more points, ended with Enter → another curve, up to
  0.33 off on a 30-unit spline (p312's MID 18.3019,0.7707 against 18.25785084,0.77956010)
- **Fix:** natural rows (C″ = 0) in the interpolation solve; the Bessel helpers go (SPLINE-D40)
- **Regression test:** `nurbs.test.ts` or a new `splines.test.ts`: the data table's control points,
  each citing its probe; `drawing.test.ts`: p01 drawn through the command
- **Coverage:** draw.md's Missing "the end tangents AutoCAD computes … (undocumented)" goes; the
  comment at `editing.test.ts:1979` becomes stale

### Medium

#### SPL-02 — Undo back to one point returns to the one-point prompt; AutoCAD keeps the two-point one

- **Severity:** medium · **Row:** F, B, L · **Status:** verified
- **Where:** `SplineTool.ts` `question()` (`points.length === 2`), `commandOptions()`, `invokeNextOption` Undo
- **AutoCAD:** after Undo back to one point the prompt stays `Enter next point or [end Tangency/toLerance/Undo]:`
  (es `Precise el punto siguiente o …`, 57995), CV `Enter next point or [Undo]:` (57493); start Tangency
  is no longer offered; Undo at one point is taken and does nothing, silently (p125, p126, p128, p146,
  p150, p152, p156); `_T` there asks the same prompt again on the desktop (d12; the console's p148
  asked the end tangent: the desktop is what a user meets); Enter adds nothing (p149, p150). Desktop
  d02: after a start tangent the prompt keeps `[iniciar Tangencia/toLerancia]` (as ours)
- **mellowcad:** `[start Tangency]` (CV `Enter next point:`), then `_U` refused, `Point or option keyword
  required.` (CV `Invalid point.`) (s:a/probes p125, p128)
- **Fix:** a flag "a second point was given" on the drawing state picks the prompt id and keywords;
  Undo at one point a silent no-op; end Tangency at one point asks again (SPLINE-D2)
- **Regression test:** `drawing.test.ts`, p125, p128, p156, d12

#### SPL-07 — The rail has one Spline entry; the ribbon has Spline Fit and Spline CV

- **Severity:** medium (ELL-05's) · **Row:** A, F, L · **Status:** verified
- **Where:** `components/cad/tool-rail.tsx:206-208`
- **AutoCAD:** acad.cuix, Home > Draw (`ID_PanelDraw`, the expanded row): `ID_RBN_CMDBTN_SPLINE`
  "Ajuste de spline" → `ID_SURF_SPLINE_KNOT` `^C^C_^RSPLINE _M _FIT`, `RBN_01740420` "VC de spline" →
  `ID_SURF_SPLINECV` `^C^C_^RSPLINE _M _CV`; the Draw menu's `ID_Spline` is `^C^C^R_spline`. Both
  buttons set the method; Enter after them repeats SPLINE (p104 keeps CV)
- **mellowcad:** the rail runs SPLINE in whatever method was used last (s:a/extra)
- **Fix:** a flyout of two entries, Spline Fit and Spline CV, each a `ribbonMacro()` `{ command:
  "SPLINE", answers: ["_m", "_fit"] }` and `["_m", "_cv"]` (SPLINE-D7; ELL-05, ARC-D3); labels from the
  ribbon's tooltips (en `Spline Fit`, `Spline CV`; es `Ajuste de spline`, `VC de spline`)

#### SPL-30 — The current properties are read when SPLINE ends; AutoCAD fixes them at the second point

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `SplineTool.ts` `splineOf` (`layerId` read each time), `commitPending` (`withCurrentProperties`)
- **AutoCAD:** `'_-COLOR 3` at the first, the second point or the start tangent → green (p229, p227,
  p261; CV p268); at the third or later and at the end tangent → BYLAYER (p228, p233, p230; CV p260);
  `'_CLAYER L1` at the third → layer 0 (p232); after Undo back to one point the first capture holds
  (p277)
- **mellowcad:** green in all (s:b2, s:b7); the layer set after two points wins (s:b4)
- **Fix:** capture `currentProperties(ctx)` and the layer when the spline first holds two points, kept
  through Undo (SPLINE-D20; ELL-08's way)
- **Regression test:** `currentProperties.test.ts`, p227, p228, p230, p232, p277

#### SPL-31 — The spline is flattened onto its first point's plane; AutoCAD 2027 keeps each point's Z

- **Severity:** medium · **Row:** C, D, H · **Status:** verified
- **Where:** `SplineTool.ts` `placePoint` (`withZOf(point, points[0])`), `splineOf` (`onPlaneOf`);
  `entityTypes.ts:151` (`points: Vec2[]`)
- **AutoCAD:** p200 fit points `[0,0,5],[10,10,5],[20,0,8],[30,10,-3]`; p216 the same for CV; p269 `_END`
  of a line at Z 10 → `[100,0,10]`; p265 each 2D point takes ELEVATION (7, 5, 5), not the first's Z;
  p231, p234 `'_ELEVATION` mid-command lifts only the later points
- **mellowcad:** every point at the first point's Z (s:b)
- **Fix:** none in this review: the kernel has no 3D NURBS. Missing line with the probes; the
  projection pinned by a test; `cad-tools.md`'s flat-object rule says SPLINE is flat by limitation
  (SPLINE-D21)

#### SPL-32 — LASTPOINT after the end tangent is the tangent's point; AutoCAD leaves the last fit point

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p210 (end tangent `@1,1` from 30,10) → `(30 10 0)`; p220 (`25,5` from 20,0) → `(20 0 0)`;
  Enter at the end tangent (p276), Close (p219, p221) and the start tangent (p213, p214, p271) leave
  it too, as ours
- **mellowcad:** `31,11` and `25,5` (s:b)
- **Fix:** `ctx.setLastPoint(lastPoint(state))` before `endCommand()` in the end tangent (SPLINE-D22)
- **Regression test:** `lastPoint.test.ts`, p210, p220, p219, p276

#### SPL-33 — `_TAN` at the end tangent is deferred in AutoCAD; mellowcad aims at the tangent point

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD:** the end leaves along the circle's tangent at its point nearest the spline's end, signed
  toward the pick: p250 `[0,1]`, p262 `[0,-1]`, p263 `[-0.6,0.8]`, p270 `[0,1]`, p273 `[0,1]`; an end
  inside the circle is accepted, p272 `[-0.707107,0.707107]`; the start tangent's `_TAN` is the
  ordinary one (p249, p267), as ours
- **mellowcad:** p262 `[-16.67,-14.91]`, p263 `[-44.60,-10.54]`; p272 refused
- **Fix:** `defersSnap("tangent")` at the end tangent for circles and arcs: the tangent direction at
  the circle's point nearest the last point, signed toward the pick (SPLINE-D23); other objects
  Missing, unprobed
- **Regression test:** `drawing.test.ts`, p250, p262, p263, p272; p249 for the start

#### SPL-34 — `_PER` or `_TAN` at the first point is refused; AutoCAD computes it from LASTPOINT

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD:** p242 `[30,0]`, p243 `[213.333333,14.90712]`, p274 (CV) `[30,0]`; p253 TAN then TAN, each from
  the point before, nothing deferred; LASTPOINT inside the circle refused in both (p252)
- **Fix:** `snapsFromLastPoint()` at `first`, Fit and CV (SPLINE-D24; ELL-07, ARC-04, REC-03, PGN-02)

#### SPD-01 — The jig's spline wears the theme's colour; AutoCAD's the current one

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** d01-2, d01-3, d02-1, d02-3, d07-1–3: the ghost red with CECOLOR 1
- **mellowcad:** `buildOverlay` draws it in `THEME.rubberBand` (s:r "jig": `path #e2e8f0`)
- **Fix:** `currentColor(ctx)` (EDK-01, ADK-01, PGN-03); the rule's list in `cad-tools.md` gains SPLINE

#### SPD-02 — The jig has no amber dashed line; its tangent line is solid

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** an amber dashed line from the last point (the first at the start tangent) to the cursor at
  every next point and tangent prompt, Fit and CV (d01-1, d01-3, d02-1, d02-3, d04, d07); with one point
  it is the only thing drawn (d01-1); UseDashedLine true at every next and tangent prompt (p01, p02)
- **mellowcad:** a solid two-point ghost at F1, no line at F2+, a solid theme-coloured line at the
  tangents (s:r "jig")
- **Fix:** `THEME.dashedRubberBand`, `dash: [2, 3]` from the anchor to the cursor; at F1 the line alone
  (EDK-02)

#### SPD-03 — Dynamic input at the tangents is a coordinate box; AutoCAD's a length and an angle

- **Severity:** medium · **Row:** D, Q · **Status:** verified
- **AutoCAD:** d04-5 `Precise tangente final:` `12.1573` `< 10°`; d04-6 `Precise tangente inicial:`
  `8.5225` `< 70°`, measured from the last (first) point, as the next point's
- **mellowcad:** `openPointInput` gives one `X,Y` field (s:r "st dyn", "et dyn")
- **Fix:** the tangents open the next point's length-and-angle session, from their anchor (EDK-03's way)

#### SOB-02 — A given tangent keeps only its direction; AutoCAD uses it as the derivative itself

- **Severity:** medium · **Row:** H · **Status:** verified (typed points; a picked tangent's length on the
  desktop is the same input, d02)
- **Where:** `splines.ts:163-177` (`scaledTangent`)
- **AutoCAD:** the first derivative with respect to the raw knot parameter is the stored vector:
  p302#1 a start tangent at 100,0 → CV1 471.404521,0 (4.714045 at distance 1); p306#1 Uniform, start 1,0,
  end 0,1 → 0.333333,0 … 30,9.666667; p306#2; SPLINE stores the start tangent as typed (point − first
  point, p308) and the end tangent normalised (p306#0, p210, p123)
- **mellowcad:** the direction scaled by the chords: p306#1 4.714045,0 … 30,5.285955
- **Fix:** SPLINE-D41; transforms keep the curve (SPLINE-D42, SOB-15)
- **Regression test:** `nurbs.test.ts`/`splines.test.ts` p302, p306; `entities.test.ts:357-372` compares
  the vectors, not their directions

#### SOB-03 — A closed CV spline's degree drops to vertices − 1; AutoCAD's to the vertex count

- **Severity:** medium · **Row:** H, I · **Status:** verified
- **AutoCAD:** p305: three vertices at degree 3 → 3; four at degree 5 → 4 (p129, p146 too)
- **mellowcad:** 2 and 3; `drawing.test.ts:2436` pins 2
- **Fix:** min(degree, n − 1) open, min(degree, n) closed (SPLINE-D43)

#### SOB-04 — A closed CV spline starts elsewhere than AutoCAD's

- **Severity:** medium · **Row:** D, M · **Status:** verified
- **AutoCAD:** p305's five starts reproduced at u = n − degree of our parametrisation (20,3.333 /
  10,6.667 / 25,5 / 20,0 / 15,5); p311 `_END` 46.66666667,16.66666667; p328's dashes symmetric about it
- **mellowcad:** 10,6.667 / 5,5 / 5,5 / 0,0 / 10,6.667; `_END` 46.666667,3.333333
- **Fix:** rotate the control loop in `controlCurve`, the stored points as picked (SPLINE-D44)

#### SOB-05 — Midpoint finds nothing on a closed spline

- **Severity:** medium · **Row:** D · **Status:** verified
- **Where:** `providers.ts:190` (`!entity.closed`)
- **AutoCAD:** p311: 20,20 on the closed fit square, 33.33333333,3.33333333 on the closed CV one: halfway
  along from the start (unlike a whole ellipse, ellipse/p304)
- **Fix:** SPLINE-D45

#### SOB-06 — A dashed spline is dashed from its start; AutoCAD centres the pattern over its length

- **Severity:** medium · **Row:** M · **Status:** verified
- **Where:** `SceneBuilder.ts:901-915` (one `path`, the raw `dash`)
- **AutoCAD:** p328 (plot): open or closed, laid as a line centred over its length (an open fit spline
  177 long: 0–22.5 / 40.5–79.5 / 97.5–136.8 / 154.8–177; an open CV 0–43 / 61–104); under one period
  solid; a closed one has a dash across its start, not a circle's whole periods
- **Fix:** a `linetypedSpline` beside `linetypedEllipse`, each dash a piece of the curve (SPLINE-D46;
  AOB-01, EOB-03)

#### SOB-07 — AREA of a spline that crosses its chord or itself reports the net area

- **Severity:** medium · **Row:** I · **Status:** verified
- **AutoCAD:** p327 an open CV spline `Area = 85.84165405`, the sum of its two loops against the chord
  (48.545827 + 37.295827); p317 a closed bowtie `Area = 39.7222`
- **mellowcad:** 11.25 and 0.00 (`splineArea`, `objectArea.ts:54-59`)
- **Fix:** the sum of the absolute loop areas, split at the curve's crossings with itself and its chord
  (SPLINE-D47)

#### SOB-08 — Length, perimeter, area and Midpoint are measured on chords

- **Severity:** medium · **Row:** D, I · **Status:** verified
- **AutoCAD → mellowcad:** p327 the closed fit square's area 610.00000000 → 609.98 (seen at the
  default precision), perimeter 87.61720462 → 87.616648; an open CV's length 44.39570038 → 44.394234;
  p310 MID 19.15356356,4.27082073 → 19.153151,4.270882; p317 perimeter 42.5520 → 42.551565
- **Where:** `splines.ts:226-271`
- **Fix:** Gauss quadrature on the curve's spans (SPLINE-D48)

#### SOB-09 — Nearest can return a chord's point, off the curve

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD:** p310 14.92870540,4.90021635
- **mellowcad:** 14.92814,4.900503: nearer than any point of the curve (`closestPointOnSpline` keeps a
  chord point when it beats Newton's)
- **Fix:** candidates compared as points of the curve (SPLINE-D49); `closestPointOnEllipse` checked in
  the same change

#### SOB-10 — Intersection with a spline is taken on its chords, unrefined

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD → mellowcad:** with a line 23.73737697,4.06565576 → 23.73679,4.065802 (p310); a circle
  14.00038988,5.06839918 → 14.000393,5.068668; another spline 25.94795735,4.21145489 → 25.94798,4.211628
  (p313)
- **Where:** `providers.ts:1066-1100` (`collectShapes`)
- **Fix:** each crossing refined onto the curves (SPLINE-D49)

#### SOB-11 — EXPLODE reports `N were not able to be exploded.`; AutoCAD names each spline

- **Severity:** medium · **Row:** I, L · **Status:** verified
- **AutoCAD:** `Cannot explode SPLINE` per spline (es `No se puede descomponer SPLINE`), p324; with a line
  in the set the line explodes and the spline gets its line (p319)
- **mellowcad:** `2 were not able to be exploded.` (`ExplodeTool.ts:44`)
- **Fix:** SPLINE-D50

#### SOB-16 — The palette has one Misc group; AutoCAD's has Data Points and Misc

- **Severity:** medium (EOB-06's) · **Row:** I · **Status:** verified
- **AutoCAD:** d10-1 (fit): Puntos auxiliares — Número de puntos de ajuste (read-only), Punto de ajuste
  actual (a stepper), Punto de ajuste X, Y, Z, Parametrización de nudos, Marco de vértices de control;
  Varios — Método, Grado (read-only), Cerrado, Periódica (read-only), Plana (read-only), Inicio vector de
  tangente X, Y, Z, Vector de tangente final X, Y, Z, Ajustar tolerancia. d10-2 (CV): Número de puntos de
  apoyo, Punto de apoyo actual, Punto de apoyo X, Y, Z, Peso (−1), Marco…; Varios: Método, Grado,
  Cerrado, Periódica, Plana. d10-3 (closed fit): no tangent rows, Área (read-only)
- **mellowcad:** one `misc` group: Method, Degree, Knot parameterization, Closed, Area (closed)
- **Fix:** AutoCAD's two groups and rows, in its order (SPLINE-D60); the current point a stepper with
  editable X and Y as the polyline's current vertex (a grip move through `splineWithPoint`); Method,
  Degree, Closed and the CV frame read-only (SPLINEDIT and CVSHOW are not built: palette editing stays
  in Missing); Fit tolerance 0 and Weight −1 constant (no toLerance, no weights); Z the plane's
  elevation; no Planar Z column. English labels by id (§13)

### Low

#### SPL-04 — The Degree prompt: `2.5` re-asked silently; its hidden keywords refused

- **AutoCAD:** p111, p153–p155, p318: `2.5`, `FOO` and a point → `Requires an integer between -32768 and
  32767, or option keyword.` (es `Requiere un nº entero entre -32768 y 32767, o una opción.`); hidden
  Method / Degree / Object (es Método / Grado / Objeto) return to the first prompt, the degree unchanged;
  `0`, `11`, `-1` re-asked silently (match)
- **mellowcad:** `2.5` silent; `FOO`, `_M`, `_D`, `_O` → `Requires an integer value.`
- **Fix:** the integer-range refusal with the two bounds; the three hidden keywords (Object as Method:
  back to the first prompt, since Object is not built) (SPLINE-D4)

#### SPL-05 — CV's `Enter next point:` refuses with `Invalid point.`

- **AutoCAD:** p127, p138: `Point or option keyword required.` though no keyword is declared
- **Fix:** that refusal at C1 (SPLINE-D5)

#### SPL-06 — A negative direct distance at a next point is re-asked silently

- **AutoCAD:** p117: `-5` → −4.640670,−1.861232, backwards along the cursor, as LINE's
- **Where:** `SplineTool.ts` `commitNext` (`if (!(distance > 0)) return`)
- **Fix:** follow LINE's direct distance (SPLINE-D6)

#### SPL-08 — 2023's citations and marks 2027 now settles

- `ambiguousKeywords.test.ts:359` cites `acc/k8–k12, k23`; `SplineTool.ts:296` "AutoCAD 2023 asks no
  tangent" (p124, p129, p303 confirm it in 2027); draw.md "Wording from AutoCAD 2023's console";
  spanish.md's two unverified marks (the knot capitals, p108, p113.es; `Precise tangente` at the
  closure, never asked, p124.es); `englishSurface.test.ts:477` "enter keeps it periodic" is Enter
  repeating SPLINE; `drawing.test.ts:2263`, `locale.test.ts:690`, `invalidAnswers.test.ts:197` cite no
  probe (SPLINE-D8)

#### SPL-35 — The tests hold almost none of rows C, D and H

- No test of LASTPOINT, Z, ELEVATION, a UCS, a snap override, a typed tangent or a property changed
  mid-command; the SPLINE block cites no probe (SPLINE-D26)

#### SPD-04 — The CV frame is solid in the crosshair's colour; AutoCAD's light grey and finely dashed

- **AutoCAD:** d07-1–3; selected, the frame dashed in a muted red (d09-1, d09-3)
- **mellowcad:** `FRAME` `THEME.crosshair`, solid, while drawing and on selection
- **Fix:** a dashed frame, `THEME.crosshair` at the jig's dash (SPLINE-D61); the selection's frame
  dashed too

#### SOB-12 — Coverage stale or unproven

- draw.md: the end tangents settled (SOB-01); Close re-cited to p303; the degree rule's closed case
  (SOB-03); Midpoint open only (SOB-05); the Nearest and Intersection claims (SOB-09, SOB-10); "Wording
  from AutoCAD 2023"; modify.md: BREAK's reason (a CV spline p325; a fit spline broken at fit points
  stays a fit spline with raw end tangents p326); MIRROR keeps a spline's +Z (p320)

#### SOB-13 — The tests pin our curve, not AutoCAD's

- `nurbs.test.ts` holds no AutoCAD value and builds Bessel's ends (`:42`, `:71`); `providers.test.ts:502`
  a symmetric fit spline only; `expectSameShape` compares tangent directions; no `splineFiles.test.ts`,
  no spline in `SceneBuilder.test.ts` or `objectArea.test.ts`

#### SOB-14 — A closed fit spline with a start tangent is modelled though nothing makes one

- `entityTypes.ts:156-161`, `splines.ts:139-144`; AutoCAD drops it (p307#3), so does the tool;
  `splineControlFrame` exported and unused (SPLINE-D52: the branch stays for files, documented)

#### SOB-15 — SCALE keeps AutoCAD's stored tangent; ours must keep the scaled curve

- p321: SCALE 2 doubles the fit points and keeps the start tangent 3,4 and the knots; the curve is the
  scaled one. Once SOB-02 lands, scaling must keep our curve equal to AutoCAD's (SPLINE-D42)

#### SOB-17 — A CV spline's grips are squares; AutoCAD's are round

- **AutoCAD:** d09-1, d09-3: round grips at the vertices (squares at a fit spline's fit points, d08-1)
- **Fix:** a round vertex grip for a CV spline (SPLINE-D62); the triangle grip and the hover menus stay
  in Missing

## 6. Decisions taken

| Id | Decision (why) |
| --- | --- |
| SPLINE-D1 | SPL-01 by an `onEnter` at `first` (ELLIPSE's way) |
| SPLINE-D2 | SPL-02 by a "second point given" flag; `_T` at one point asks again (the desktop over the console) |
| SPLINE-D4 | SPL-04's range refusal and hidden keywords; Object returns to the first prompt (not built) |
| SPLINE-D5 | SPL-05's refusal at C1 |
| SPLINE-D6 | SPL-06 follows LINE |
| SPLINE-D7 | SPL-07 a flyout of two ribbon macros; the bare SPLINE stays typed |
| SPLINE-D8 | SPL-08 citations and wording |
| SPLINE-D9 | toLerance and Object stay unbuilt; Missing gets their words: `Specify fit tolerance <0.0000>:` (es `Precise tolerancia de ajuste <0.0000>:`, p115, p131), `Select spline-fit polyline:` (es `Designe polilínea de ajuste de spline:`, Enter → `None found.`, p114) |
| SPLINE-D10 | Space stays Enter (the console reads a space as a pick, p141: its artefact) |
| SPLINE-D20 | properties captured at the second point, kept through Undo |
| SPLINE-D21 | no 3D spline; Missing, the projection pinned |
| SPLINE-D22 | LASTPOINT the last fit point after the end tangent |
| SPLINE-D23 | deferred Tangent at the end tangent, circles and arcs only |
| SPLINE-D24 | `snapsFromLastPoint()` at the first point |
| SPLINE-D25 | `<a` honoured at the next point (d03); at the tangents too, unverified |
| SPLINE-D26 | the untested cells become tests citing their probes |
| SPLINE-D40 | natural free ends; the Bessel helpers go |
| SPLINE-D41 | a tangent is C′ at the raw parameter, as stored: the start as typed, the end unit |
| SPLINE-D42 | SCALE keeps the curve: the tangent unchanged with Chord knots, ×s Uniform, ×√s Square root; ROTATE and MIRROR map it as a vector |
| SPLINE-D43 | a CV degree min(d, n − 1) open, min(d, n) closed |
| SPLINE-D44 | a periodic CV curve starts at u = n − degree, the loop rotated, the points as picked |
| SPLINE-D45 | Midpoint of a closed spline halfway along from its start |
| SPLINE-D46 | a spline's linetype centred over its length; solid under one period |
| SPLINE-D47 | a spline's area the sum of its loops' absolute areas |
| SPLINE-D48 | length, area and midpoint by quadrature, with a named cap on the spans |
| SPLINE-D49 | Nearest and Intersection refined onto the curve |
| SPLINE-D50 | EXPLODE refuses each spline with `Cannot explode SPLINE` |
| SPLINE-D51 | GCEN, TAN, PER on splines and BREAK of a spline stay in Missing, their probes cited |
| SPLINE-D52 | the closed-with-tangent branch stays for files, said so; the unused export goes |
| SPLINE-D60 | the palette's groups and rows as AutoCAD's, read-only but the current point (SOB-16) |
| SPLINE-D61 | the CV frame dashed, while drawing and selected |
| SPLINE-D62 | round grips at a CV spline's vertices |

## 7. Tests proposed

Regression tests first (in each finding), then the untested cells:

- `drawing.test.ts` SPLINE: p01 through the command (SOB-01); Enter at the first prompt (SPL-01);
  Undo to one point (SPL-02); the rail's macros (SPL-07); the jig's colour, dashed line and boxes
  (SPD-01–04); the Degree refusals (SPL-04); C1's refusal (SPL-05); `-5` (SPL-06); deferred TAN at the
  end (SPL-33); TAN/PER from LASTPOINT (SPL-34); `@`, a number, `x,y,z` projected (SPL-31), FRO; the
  transparent set; U names SPLINE; es CV prompts, F3, Degree, tangents.
- `lastPoint.test.ts`: p210, p219, p220, p276 (SPL-32), p217, p259.
- `currentProperties.test.ts`: p227, p228, p230, p232, p277 (SPL-30).
- `nurbs.test.ts` / `splines.test.ts`: the natural ends' table, the tangents, the closed CV degree and
  start, length, area, midpoint, nearest (SOB-01–09).
- `providers.test.ts`: MID closed (p311), NEA (p310), INT (p310, p313), END of a closed CV (p311).
- `SceneBuilder.test.ts`: a DASHED spline's dashes (p328).
- `objectArea.test.ts`: p327, p317.
- `splineFiles.test.ts`: the file round trip, the clipboard (s:c/object).
- `EngineState`/palette: d10's rows (SOB-16).
- Old citations to re-probe: `ambiguousKeywords.test.ts:359` (2023) → p108–p110, p144–p146.

## 8. What is not tested and why

- What the browser alone shows: the grips' round shape is the presenter's (a primitive's `shape`
  field is tested instead); the palette's look.
- The triangle grip and the hover menus: not built (Missing).

## 9. What could not be reviewed and why

- `<a` at the tangents and CV's next points, Polar, OTRACK, snap mode, running snaps under the cursor,
  Shift: the desktop pass did not reach them.
- EXT, PAR, APP on a spline; INT and NEA on a closed spline (the same code as the open one's).
- A spline in a rotated or tilted UCS, with thickness, as an object.
- The palette's English labels seen on screen: paired by id instead (§13).

## 10. Refuted in the adversarial pass

- **SPL-03** (Enter at the start tangent takes the cursor's direction): the console's artefact; the
  desktop gives no tangent (d11: StartFitTangent 0,0,0), as ours.
- **EOB-04's analogue** (MIRROR turns the normal): a mirrored spline keeps +Z (p320); ours matches.
- **The normal's sign in `_UCS _X 90`:** AutoCAD's 210 is (0,1,0), ours (0,−1,0), with the same world
  points (p224, s:b2): AutoCAD derives 210 from the points and shows it nowhere.
- **A spline's self-intersection:** none in either (p331); p314 picked off the crossing.
- **A closed fit spline differs:** the same curve and start (p303, p307).
- **MREDO All's `Nothing to redo`** in p143: the Lisp in between; p157 without it matches.
- **`'_ELEVATION`, `'_CLAYER`, `'_CECOLOR`, `'ORTHOMODE` refused here:** known (command-line.md).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | State |
| --- | --- |
| draw.md: "Undo" | holds down to two points only (SPL-02) |
| draw.md: Close "AutoCAD 2023's console asks no tangent" | holds in 2027 (p124, p303): re-cite |
| draw.md: "Degree 1–10, lowered to vertices − 1 when fewer" | false for a closed CV spline (SOB-03) |
| draw.md: "Midpoint (halfway along), Nearest and Intersection snaps (against the chords…)" | Midpoint false when closed (SOB-05); Nearest, Intersection off the curve (SOB-09, SOB-10) |
| draw.md Missing: "the end tangents AutoCAD computes … (undocumented)" | no longer true: natural ends (SOB-01) |
| draw.md: "EXPLODE refuses it, as AutoCAD's does" | the refusal holds, its words differ (SOB-11) |
| draw.md: "palette rows Method, Degree, Knot parameterization, Closed, Area" | holds, but AutoCAD's are others (SOB-16) |
| draw.md: "Wording from AutoCAD 2023's console" | stale (SPL-08) |
| drafting-aids.md:209: "SPLINE keep[s] its plane" on the Z guide | likely untrue of AutoCAD (SPL-31): Missing |
| spanish.md: knot capitals, `Precise tangente` unverified | settled (p108, p113.es, p124.es) |
| modify.md: MIRROR's ellipse −Z note | a spline keeps +Z (p320): say so |

| Rule | State |
| --- | --- |
| `cad-tools.md`: a point prompt the console asks again at Enter reports its refusal | broken at SPLINE's first prompt (SPL-01) |
| `cad-tools.md`: an Undo keyword refuses when there is nothing to undo | SPLINE's takes it silently at one point (p125): note the exception |
| `cad-tools.md`: a flat object lies in the plane of its first point | SPLINE is flat by limitation, not by AutoCAD (SPL-31) |
| `cad-tools.md`: the jig wears the current colour (list of tools) | SPLINE not in it (SPD-01) |

Checked and holding: the prompts in both languages, the settings line, the keywords and their
capitals, the tangent flow, Close (periodic, no tangent asked), Degree 1–10 open, one undo step,
the options kept for the session (p104), Escape discarding the curve (d06), STRETCH moving fit points
and vertices (p322, p323), MIRROR, ROTATE, MOVE (p320, p321), the file and the clipboard round trip.

## 12. Order of execution and estimate

1. **SPL** (the command; about half a session): SPL-01, 02, 04–08, 30–35. Catalogs: the integer-range
   refusal (`requiresIntegerBetweenOrKeyword` or a new id), the rail labels (`messages/`), `cad/locales`
   for any new prompt id. Blocks nothing.
2. **SPD** (the jig; small): SPD-01–04, after SPL (the tangent session shares SPL's code).
3. **SOB** (the object; the largest): SOB-01–17; SOB-01 and SOB-02 first (the curve), then the measures
   (SOB-07–10 share the quadrature and the refinement), SOB-03–06, SOB-11, the palette and grips
   (SOB-16, 17), the docs (SOB-12–14). The snapshot `englishSurface.txt` changes with SOB-16 and
   SOB-11.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/draw.md` SPLINE rewritten: the 2027 probes, the natural ends, the tangents as stored,
  the closed CV degree and start, Midpoint on a closed spline, the measures, the palette, the rail's two
  entries; Missing: toLerance and Object with their words (D9), the 3D spline (SPL-31), the deferred
  Tangent at the end on other objects (SPL-33), `<a` at the tangents unverified, the triangle grip and
  hover menus, GCEN / TAN / PER, BREAK (refined reason), palette editing.
- `drafting-aids.md` (TAN/PER from LASTPOINT, deferred TAN at the end tangent, the Z guide line),
  `modify.md` (EXPLODE's words, MIRROR keeps +Z, BREAK's reason), `spanish.md` (settled marks),
  `command-line.md` if the integer-range refusal changes its Missing line.
- `cad-tools.md`: the jig's colour list gains SPLINE; the Undo-at-one-point exception; SPLINE flat by
  limitation.
- Catalogs: the Degree prompt's range refusal; `Cannot explode {name}` (es `No se puede descomponer
  {name}`); the palette's new rows. Their English, by `ax26res.dll` id (es seen on d10):
  69 `Number of fit points` (Número de puntos de ajuste), 101 `Current Fit point` (Punto de ajuste
  actual), 72 `Fit point X/Y/Z` (Punto de ajuste X/Y/Z), 71 `Number of control points` (Número de
  puntos de apoyo), 73 `Current Control point` (Punto de apoyo actual), 70 `Control point X/Y/Z`,
  `Weight` (Punto de apoyo X/Y/Z, Peso), 74 `Data Points` (Puntos auxiliares), 910 `Knot
  parameterization`, 911 `Chord;SqrtChord;Uniform` (Cuerda;RaízcuadradaCuerda;Uniforme), 1248 `Display
  CV frame` or 912 `CV frame` (the Spanish row is cut at `Marco de vértices d…`: both start so; 912's
  `Marco de vértices de control` is taken, **unverified**), 913 `Show;Hide` (Mostrar;Ocultar), 914
  `Method`, 915 `Fit;Control Vertices` (Ajustar;Vértices de control), 278 `Degree`, 251 `Closed`, 916
  `Periodic` (Periódica), 96 `Planar` (Plana), 75 `Start tangent vector X/Y/Z` (Inicio vector de
  tangente X/Y/Z), 76 `End tangent vector X/Y/Z` (Vector de tangente final X/Y/Z), 99 `Fit tolerance`
  (Ajustar tolerancia), 253 `Area`.
- Roadmap: SPLINE `done`, owning the spline object.

## 14. Template improvements

- The desktop launcher opened the English profile because it passed no `/language` (fixed in
  `e6439e5`); the trap entry that blamed the launch went with it.
- The Properties palette floated on the second monitor and Ctrl+1 did not reach AutoCAD: open it with
  `com send "_PROPERTIES\n"` and capture it by its window handle (`acad.sh wins`, `acad.sh shot <hwnd>`)
  (annex-probes.md §4).
- Subagents cannot write report files: they return the report as text, and the reviewer keeps it in
  the scratchpad (template §4.8).
- The console's answer at a jig prompt to Enter or a keyword is checked on the desktop: p118 and p148
  differed from d11 and d12. A COM-only desktop probe settles it without the owner's mouse; COM's
  space is an Enter, so `_T \n` is two answers (annex-probes.md §4).
