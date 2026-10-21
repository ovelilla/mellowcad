# ELLIPSE review

> **Status:** plan, 2026-10-21 — phases 0–4 of skill `command-review`, the sixth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (ELL, EDK, EOB), one commit each.

## 1. Summary

2 high, 16 medium and 12 low findings over three blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| ELL | ELLIPSE and its rail modes: prompts, answers, points, aids, properties | 1 | 7 | 7 |
| EDK | what the desktop shows while ELLIPSE asks: the jig and dynamic input | 0 | 3 | 0 |
| EOB | the ellipse object (this review owns it): snaps, render, transforms, grips, palette, storage | 1 | 6 | 5 |

The worst: Enter (and the right button's Enter) at any ELLIPSE prompt but Included angle ends the
command, losing the points given, where AutoCAD refuses in the prompt's words and asks again
(ELL-01, the analogue of ARC-01 and PGN-01); Nearest finds nothing on an ellipse or an elliptical
arc, though the coverage says it does (EOB-01); and a point picked at Rotation or at Included angle
is read by its distance or as an end angle where AutoCAD reads its heading from the centre
(ELL-03, ELL-06), so the mouse draws another ellipse than AutoCAD's.

The analogues ARC and RECTANG/POLYGON left, probed first: the rail's modes as the ribbon's macros
(differ, ELL-05: acad.cuix `^C^C_ellipse _c` and `^C^C_ellipse _a`); Enter refused where there is no
default (differs, ELL-01); TAN/PER with no base from LASTPOINT (differs, ELL-07); the jig in the
current colour with amber dashed lines (differs, EDK-01, EDK-02); Ortho and `<a` on the desktop
(match: Ortho bends the other endpoint, the distance and the angles, d01–d02; `<45` is honoured at
the other endpoint, d03, though the console ignores it); dynamic input with DYNMODE 3 at every
point prompt (differs at the other endpoint, EDK-03); the options kept (match: ELLIPSE keeps
nothing, p06, p07, so no OPEN test is due).

## 2. Inventory

Commit `ed7bfeb`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The command:** `cad/application/tools/EllipseTool.ts` (`currentProperties.ts`,
  `coordinateInput.ts`, `DynamicInput.ts`); `defaultTools` (`runtimeTools.ts`: `ellipse`,
  `ellipsecenter`, `ellipsearc`), `TOOL_COMMANDS` (`CommandLine.ts`: ELLIPSE, ELLIPSEC,
  ELLIPSEARC); not transparent. Catalogs: `commands.names` ELLIPSE (`EL`), the keywords Arc,
  Center, Centre, Rotation, Parameter, Angle, Included angle, the label of Included angle, the
  prompts `specifyAxisEndpointOfEllipseOr` … `specifyIncludedAngleForArc` and the ten dynamic-input
  labels, in `en.json`, `es.json`, `ar.json`. The rail's Ellipse flyout (`tool-rail.tsx`), the
  landing's filing (`content/commands.ts`: ELLIPSE, ELLIPSEC and ELLIPSEARC as variants).
- **The object:** `cad/domain/ellipses.ts` and the ellipse parts of `entities*.ts`,
  `entityTransforms.ts`, `entityQueries.ts`, `entityProperties.ts`, `objectArea.ts`,
  `geometry/primitives.ts`; its scene in `SceneBuilder.ts` (one `ellipse` primitive), both
  presenters; its snaps in `snapping/providers.ts`; its grips in `selectToolGrips.ts` (the centre
  only); its palette rows in `EngineState.ts`; its part of the file in `cad/serialization/` (no
  DXF: the app reads and writes none). Cut by `EdgeEditTool.ts` and `BreakTool.ts` through
  `ellipseCut`.
- **Tests:** `drawing.test.ts` (ELLIPSE, 1213–1549), `currentProperties.test.ts`,
  `normals.test.ts`, `ambiguousKeywords.test.ts`, `locale.test.ts`, `englishSurface.test.ts`,
  `providers.test.ts`, `entities.test.ts`, `SceneBuilder.test.ts`, `drawingFile.test.ts`,
  `objectArea.test.ts`, `breaking.test.ts`, `editing.test.ts` (TRIM/EXTEND of an ellipse),
  `primitives.test.ts`, `SvgScenePresenter.test.ts`.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after ELLIPSE; LINE and ID
  reading the LASTPOINT it leaves; MIRROR, ROTATE, SCALE, STRETCH, BREAK and AREA on the object;
  CECOLOR, CELTYPE, CELWEIGHT, CLAYER, ELEVATION, a UCS.
- **Areas owned:** the ellipse object (EOB). **Cited:** LINE's (the command line, point input,
  object snaps, Ortho, OTRACK, dynamic input, undo, current properties, grips, the palette, files,
  render), CIRCLE's (tangent constructions), RECTANG's (options kept for the session).
- **Knowledge:** `docs/coverage/draw.md` (ELLIPSE), `drafting-aids.md`, `modify.md`,
  `properties.md`, `command-line.md`; rules `cad-tools.md`, `cad-catalogs.md`, `cad-engine.md`,
  `cad-scene.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/ellipse/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh ellipse <ids>` in es-ES and en-US;
the desktop's are `dsk.sh` with `lib-dsk.sh` in the same folder. Transcripts and screenshots are in
`research/probes/ellipse/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p04 | ACADVER; axis, centre, arc 30→120 and Rotation 45 with MPDUMP; the flags of every prompt |
| p05–p07 | ELLIPSEC and ELLIPSEARC typed (unknown); Included's `<180>` and Parameter not kept by the next run |
| p100–p107 | names and aliases in en and es; `_.ELLIPSE`; Enter at `Command:` after `_C` and `_A`; `'_ELLIPSE` at LINE |
| p108–p124 | each keyword in local and global form, es `E` (cEntro), the hidden Angle; another prompt's keyword |
| p125–p134 | Enter at every prompt |
| p135–p154 | `0`, negatives, `FOO` per prompt; Rotation 0 to 100; start = end; Included 0, −90 |
| p155–p186 | point entry per prompt (`x,y,z`, `@`, `d<a`, `@d<a`, `#`, `*` in UCS Z 30, a number, `<a`); a point at distance, Rotation, start, Included; LASTPOINT per mode |
| p187–p199 | another command mid-prompt; `'_ZOOM`, `'_-PAN`, `'ORTHOMODE`, `'_-OSNAP` at each prompt; `_U` at each; U, REDO, UNDO 2, MREDO (untraced) |
| p200–p218 | the geometry of each mode; distance = semi-axis, 0, −5, a point; a zero first axis; Rotation 0–400 and the band |
| p219–p239 | a point at Rotation and Included; whole-turn arcs; ends before starts, negatives, over 360; Parameter; the first axis shorter |
| p240–p257 | CLAYER, CECOLOR, CELTYPE, CELWEIGHT, ELEVATION, THICKNESS; a typed Z; UCS Z 30 and X 90; the same changed mid-command |
| p260–p299 | `_END`, `_MID`, `_CEN`, `_QUA`, `_INT`, `_NEA`, `_PER`, `_TAN`, `_FRO`, `_M2P` at each prompt; TAN/PER from LASTPOINT; Ortho with typed points; `<45` per prompt |
| p300–p314 | snaps on the object: QUA (turned, UCS Z 30, an arc's sweep), MID, END, CEN, NEA, INT, TAN, PER |
| p320–p338 | MIRROR, ROTATE, SCALE, STRETCH, BREAK and AREA on an ellipse and an elliptical arc; a DASHED plot (p330, en only) |
| d01 | the jig at the other endpoint, the distance and Rotation; Ortho at each (DYNMODE 0, CECOLOR red) |
| d02 | the arc's start and end angle jigs; Ortho at the end angle |
| d03 | `<45` then 10 at the other endpoint; `<90` then 4 at the distance |
| d04, d05 | DYNMODE 3 at every prompt; the Down list; Enter refused at the start angle |
| d06 | the right button at the first prompt (menu) and at the other endpoint (Enter, refused) |
| d07 | the grips of an ellipse and an elliptical arc, their hover, the quadrant's and the end's drags |
| d08 | the Properties palette of an ellipse and an elliptical arc (Spanish labels) |

The desktop ran in the owner's AutoCAD, Spanish profile, at last; its English labels are not seen.

## 4. Matrix

Cells read `state · AutoCAD probe · mellowcad test` (`s:` a scratch test of
`research/review/ellipse/`). Columns: **1** first prompt `[Arc/Center]`, **1a** the arc's
`[Center]`, **Cc** centre, **2** other endpoint, **2c** endpoint of axis (centre mode), **D**
distance, **R** Rotation, **S** start angle or parameter, **E** end, **I** included angle.

### ELL — the command

| Row | 1 | 1a | Cc | 2 | 2c | D | R | S | E | I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A names, aliases en/es | match · p100–p103 · `locale.test.ts`, englishSurface | | | | | | | | | |
| A `_.ELLIPSE` | known · p104 (command-line.md, the `.` prefix) | | | | | | | | | |
| A ELLIPSEC, ELLIPSEARC | AutoCAD knows neither (p05, p104); kept as typed names (ELLIPSE-D5) | | | | | | | | | |
| A rail start | differs ELL-05 · cuix, p105, p107, p198 · s:A/extra | | | | | | | | | |
| A Enter repeats; `'_ELLIPSE` at LINE | match · p105, p106 · s:A/mirror (untested) | | | | | | | | | |
| B text en, es | match · p01–p04 · `drawing.test.ts:1295`, `locale.test.ts` | match p03 | match p02 | match | match | match | match p04 | match p03 | match | match |
| B keywords | match · p108–p113 · `ambiguousKeywords.test.ts` | differs ELL-10 · p111.es | n/a | n/a | n/a | match p113 | n/a | differs ELL-11 · p114, p115 | differs ELL-11 | n/a |
| B Enter | differs ELL-01 · p125 | ELL-01 · p131 | ELL-01 · p129 | ELL-01 · p126 | ELL-01 · p130 | ELL-01 · p127 | ELL-01 · p128 | ELL-01 · p132 | ELL-01 · p133 | match · p134 · `drawing.test.ts:1332` |
| B `0`, negative | match p135 | | | known ELL-09 · p205 | | differs ELL-04 · p136, p137, p202, p203 | match p142, p143 | untested p148 | | match p153, p154 (storage EOB-08) |
| B `FOO` | match p139 | match p119 | match p147 | match p140 | match p197 | match p138 | match p141 | match p144 · `drawing.test.ts:1455` | match p145 · `:1439` | match p146 · `:1475` |
| B Rotation band | | | | | | | match · p149–p151, p208–p218 · `drawing.test.ts:1281` (90 only) | | | |
| C `x,y` | match | match | match | match | match | match p171, p204 (from the centre) | differs ELL-03 · p178, p219, p298 | match p179, p231 | match p231 | differs ELL-06 · p182, p237, p299 |
| C `x,y,z` | match p155, p242 (s:B) | | | match p170, p243 (refused) | differs ELL-12 · p184, p245 | differs ELL-14 · p177 | | | | |
| C `@…`, `d<a` | match p156, p157 | | match p183 | match p163–p165 | match p184 | match p172, p174 | | match p180 | | |
| C `@` alone | match p186 | | | known ELL-09 · p166 | | differs ELL-04 · p173 | | | | |
| C `#`, `*` in UCS Z 30 | match p158, p159 | | | match p167, p159 | | match p176 | | | | |
| C a number | match p161 | | | match p168 | match p185 | match p01 | | | | |
| C `<a` | match p162 (refused) | | | match d03 (honoured; the console's p169, p290 are its artefact) | match p293 (desktop unprobed) | match p175, p291, d03 | unverified | differs ELL-13 · p181, p292 | | unverified |
| C LASTPOINT | match at the first (p156); after the command differs ELL-02 · p100, p109, p171, p178, p184 · s:A/lp2 | | | | | | | | | |
| D overrides | match · p260–p265, p278, p285 · s:B | | | match · p268, p269 | | match · p270–p277, p280, p286 | differs ELL-03 · p294 | match p282, p283 | match p282, p284 | differs ELL-06 · p297 |
| D TAN, PER from LASTPOINT | differs ELL-07 · p266, p267, p287 | | differs ELL-07 · p295 | | | | | | | |
| D Ortho | typed points ignore it · match p288, p289; the pick bends at 2, D, S, E (d01, d02) · untested | | | | | | | | | |
| D M2P, `'ORTHOMODE` | known (drafting-aids.md) · p279, p190 | | | | | | | | | |
| E transparent | match · p188–p194 · s:A/trans | | | | | | | | | |
| F `_U` mid; U, REDO, UNDO 2, MREDO 1 | match · p195–p199 · s:A/extra (untested; the rail's step name ELL-05) | | | | | | | | | |
| G another command | match · p187 | | | | | | | | | |
| G right button | owned (LINE); at 2 its Enter is refused, `Punto 2D no válido.` (d06), so ELL-01 | | | | | | | | | |
| H geometry | match · p01, p200, p207, p201 · `drawing.test.ts:1214` | | | | | | | | | |
| H properties | match · p240 (CELTSCALE known) · `currentProperties.test.ts`; the arc's are fixed at the distance: differs ELL-08 · p253, p257 | | | | | | | | | |
| H planes | untested · p241, p242, p244, p246–p248, p252, p255, p256 · s:B | | | | | | | | | |
| K catalog sweep | `es-several` at 1 (25430, 25457): the console says 25457, the catalog's · p01.es; ten `no-source` labels (EDK-03) | | | | | | | | | |
| L history | match line by line but ELL-01, ELL-04, ELL-05, ELL-10, ELL-11, ELL-12, ELL-13 | | | | | | | | | |
| N tests | ELL-15 | | | | | | | | | |

### EDK — the jig and dynamic input

| Prompt | Jig (d01–d03) | Ortho | DYNMODE 3 (d04, d05) |
| --- | --- | --- | --- |
| 1, Cc | none | n/a | X and Y · match (owned) |
| 2, 2c | an amber dashed line from the first point, no ghost · differs EDK-02 | bends · match (anchor) | the axis's length and angle · differs EDK-03 |
| D | the ghost in CECOLOR, an amber dashed line centre → cursor · differs EDK-01, EDK-02 | bends (`Orto: 10.1105 < 90°`) · untested | one length, along the other axis · match |
| R | the same · differs EDK-01, EDK-02 | n/a | an angle arc, no field · presentation (refuted, §10) |
| S | the whole ellipse's ghost and the dashed line · differs EDK-01, EDK-02 | untested | an angle from the major axis (`221`) · match |
| E | the arc's ghost and the dashed line · differs EDK-01, EDK-02 | bends, measured from the major axis (`< 270°`) · untested | the same · match |
| Down list | `Arco`, `Centro` at 1; `Parámetro` at S · match (owned) | | |

### EOB — the ellipse object

| Row | Ellipse | Elliptical arc |
| --- | --- | --- |
| END | match · p305 (none) · `providers.test.ts:143` | untested |
| MID | match · p304 (none) | differs EOB-02 · p303 |
| CEN | match · p306 · `providers.test.ts:130` | untested |
| QUA | match · p300, p301 (its own axes, not the UCS's) | match · p302 (on the sweep only) · untested |
| NEA | differs EOB-01 · p307 | differs EOB-01 |
| INT, TAN, PER | known · p308–p314 | known |
| ROTATE, SCALE | match · p322, p323 · untested | match |
| MIRROR | differs EOB-04 · p321 | differs EOB-04 · p320 (`entities.test.ts:860` pins ours) |
| STRETCH | match · p326, p331 · untested | differs EOB-05 · p324, p332, p333, p336–p338 |
| BREAK | match · p334 (`breaking.test.ts` cites 2023); mirrored differs EOB-04 · p329 | (BREAK's entry) |
| AREA | match · p328 · `objectArea.test.ts:24` (uncited) | match · p328 |
| Grips | differs EOB-07 · d07 | differs EOB-07 · d07 |
| Palette | differs EOB-06 · d08 | differs EOB-06 · d08 |
| Whole turns, parameters, a tie | differs EOB-08, EOB-09, EOB-10 · p152, p220, p224, p226, p235, p236, p148, p168 | |
| File, autosave, clipboard | match · s:C/files (untested in the repo) | match |
| Linetype | differs EOB-03 · p330 | differs EOB-03 · p330 |

## 5. Findings

### High

#### ELL-01 — Enter at any ELLIPSE prompt but Included angle ends the command

- **Severity:** high · **Row:** B, G · **Status:** verified
- **Where:** `EllipseTool.ts` — `commitTypedPoint` returns `false` on empty text, the distance,
  Rotation and angle sessions have no `commitRaw`, no `onEnter`
- **AutoCAD:** every prompt is AllowNone false (p03, p04); Enter is refused in each input
  function's words and asked again: p125, p131 `Point or option keyword required.` (es `Se requiere
  un punto o una opción.`); p126 `Invalid 2D point.` (`Punto 2D no válido.`); p129, p130 `Invalid
  point.` (`Punto no válido.`); p127 `Requires numeric distance, second point, or option keyword.`
  (`Requiere una distancia numérica, un segundo punto o una opción.`); p128 `Requires valid numeric
  angle or second point.`; p132, p133 `Requires valid numeric angle, second point, or option
  keyword.` (`Requiere un ángulo numérico válido, un segundo punto o una opción.`). The right
  button's Enter at 2 the same (d06); Enter with only the cursor's reading in the box at S the same
  (d05).
- **mellowcad:** s:R/r "enter first/other/dist/start": the bare prompt, then `Command:`
- **Scenario:** two axis ends given, Enter by habit → the command and its points are gone → AutoCAD
  asks again
- **Fix:** refuse Enter at each prompt in its words (ArcTool's and PolygonTool's way); the parameter
  prompts take the angle prompts' words; Included keeps `<180>`
- **Regression test:** `drawing.test.ts` "ELLIPSE › Enter", every prompt, en and es, p125–p133

#### EOB-01 — Nearest finds nothing on an ellipse or an elliptical arc

- **Severity:** high · **Row:** D · **Status:** verified
- **Where:** `snapping/providers.ts` `nearestProvider` (line, circle, arc, polyline, spline only)
- **AutoCAD:** p307: `_NEA` at 40,16 on the ellipse 0,0 → 50,0, 25 → 39.546219,15.297847
- **mellowcad:** s:C/object `p307`: `No Nearest found for specified point.`; `closestOnEntity`
  already gives the point
- **Fix:** an ellipse in `nearestProvider` through `closestOnEntity` (ELLIPSE-D40)
- **Regression test:** `providers.test.ts`, p307, and an arc off its sweep
- **Coverage:** draw.md claims "nearest snaps": true once fixed

### Medium

#### ELL-02 — LASTPOINT after ELLIPSE is the last point given; AutoCAD leaves the centre

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** after every mode and after Rotation's `*Invalid*`, LASTPOINT is the centre: p100,
  p109, p113, p171, p178 `(50.0 0.0 0.0)`; p184 centre mode `(10.0 10.0 0.0)`
- **mellowcad:** s:A/lp2: the endpoint (centre mode), the second end (picked ends); typed ends land
  on the centre by chance (the distance prompt's anchor)
- **Fix:** `ctx.setLastPoint(center)` on adding and at `*Invalid*` (ELLIPSE-D2)
- **Regression test:** `lastPoint.test.ts` or `drawing.test.ts`, p184 and picked ends

#### ELL-03 — A point at Rotation is read by its distance; AutoCAD reads its heading

- **Severity:** medium · **Row:** C, D · **Status:** verified
- **Where:** `EllipseTool.ts` `pointedRotation` (`acos(reach / half)`), click, preview, live value
- **AutoCAD:** getangle from the centre, UseAngleBase (p04): p178 `60,30` → ratio 0.3162, `50,25` →
  `*Invalid*`; p219 `100,100` → 0.447214; p298 (axis at 45°) `50,100` → `*Invalid*` (measured from
  the UCS's X, not from the axis); p294 `_END` → 0.780869
- **mellowcad:** s:R/r "rot point" 0.6325; s:B p219 1, p298 0.707
- **Fix:** the point's heading from the centre in the UCS, then the band (ELLIPSE-D3)
- **Regression test:** `drawing.test.ts`, p178, p219, p298, p294

#### ELL-04 — A zero, negative or `@` distance is asked again silently

- **Severity:** medium · **Row:** B, C · **Status:** verified
- **AutoCAD:** p136, p137, p173, p202, p203: `Value must be positive and nonzero.` (es `El valor debe
  ser positivo y diferente de cero.`), the prompt again (AllowZero, AllowNegative false)
- **mellowcad:** the prompt again, no line; `drawing.test.ts:1541` does not assert the message
- **Fix:** report `positiveNonzero` (ELLIPSE-D6)

#### ELL-05 — The rail's Center and Arc run this app's ELLIPSEC and ELLIPSEARC

- **Severity:** medium · **Row:** A, F, L · **Status:** verified (the echo was known)
- **AutoCAD:** acad.cuix: `ID_EllipseCe` `^C^C_ellipse _c`, `ID_EllipseAr` `^C^C_ellipse _a`,
  `ID_EllipseAx` `^C^C_ellipse`; Enter after `_ELLIPSE _C …` repeats ELLIPSE at the axis prompt
  (p105, p107); U names `ELLIPSE` (p198); ELLIPSEC and ELLIPSEARC are unknown (p05)
- **mellowcad:** s:R/r "rail center": echo `ELLIPSEC`, Enter repeats ELLIPSEC, U writes ELLIPSEC
- **Fix:** `ribbonMacro()` `{ command: "ELLIPSE", answers: ["_c"] }` and `["_a"]`; the typed names
  stay and join `CommandLine.ts`' WHY (ELLIPSE-D5; ARC-D3)

#### ELL-06 — A point at Included angle is taken as the end angle

- **Severity:** medium · **Row:** C, D · **Status:** verified
- **Where:** `advanceWithPoint`'s `endAngle` case ignores `included`; the preview reads the end
  angle's field, so a typed included value does not lock the rubber band either
- **AutoCAD:** the point's heading from the centre, from the UCS's X, is the sweep: p182 EndParam
  3.2611; p237 → 63.8675,−24.0192 (= Included 90); p299 (axis at 45°) EndParam π/2; p297 `_END`
- **mellowcad:** s:B p237 ends at 50,25; p299 −1.9106
- **Fix:** in `included`, a point is `commitIncluded(heading)`; the preview reads `included`
  (ELLIPSE-D4)

#### ELL-07 — `_TAN` or `_PER` at the first point or the centre is refused

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD:** from LASTPOINT: p266 (`ID 30,30`, `_PER` on a line) → 30,0; p267 (`_TAN` to a circle)
  → 213.3333,14.9071; p295 centre mode → 30,0; LASTPOINT inside the circle: `No found for
  specified point.` then `Point or option keyword required.` (p287, matches today)
- **Fix:** `snapsFromLastPoint()` at the first phase (ARC-04, REC-03, PGN-02)

#### ELL-08 — An elliptical arc takes the current properties at the end, not at the distance

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** `'-COLOR 3` at the start or end angle leaves the arc BYLAYER (p253, p257); at 1, 2 or
  D a full ellipse is green (p249–p251)
- **mellowcad:** green in every case (s:B p253, p257)
- **Fix:** the properties read when the ellipse is fixed (`finish`), carried to the add
  (ELLIPSE-D22; REC-10's analogue)

#### EDK-01 — The jig's ellipse wears the theme's colour; AutoCAD's the current one

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** d01-3b, d01-4, d01-5b, d02-1, d02-2: the ghost red with CECOLOR 1
- **mellowcad:** `buildOverlay` draws it in `THEME.rubberBand`
- **Fix:** `currentColor(ctx)` (ADK-01, PGN-03); the rule's list in `cad-tools.md` gains ELLIPSE

#### EDK-02 — The jig's lines are solid; AutoCAD's are amber and dashed

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** d01-1b (the other endpoint: a dashed amber line from the first point, no ghost),
  d01-4 and d01-5b (distance, Rotation: centre → cursor), d02-1, d02-2 (the angles: centre →
  cursor); the trace's UseDashedLine true at D, S, E (p03)
- **Fix:** `THEME.dashedRubberBand`, `dash: [2, 3]` (ADK-02)

#### EDK-03 — Dynamic input at the other endpoint is a coordinate box; AutoCAD's is the axis's length and angle

- **Severity:** medium · **Row:** D, Q · **Status:** verified
- **AutoCAD:** d04-2: the axis dimensioned, its length field (`20.2871`) and its angle (`11°`), as
  LINE's next point; the endpoint of axis of the centre mode alike (unprobed apart)
- **mellowcad:** s:R/dyn "ell second": one `X,Y` field; LINE's next point has Length and Angle
- **Fix:** the second point's box a length and an angle from the first point (or the centre), as
  LINE's (REC-05's analogue)

#### EOB-02 — Midpoint on an elliptical arc is refused; AutoCAD gives the point halfway along it

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD:** p303: 29.7236,20.1029, halfway along the length, not at the mid parameter; none on a
  whole ellipse (p304)
- **Fix:** `ellipseMidpoint` takes that meaning and `midpointProvider` offers it (ELLIPSE-D41)

#### EOB-03 — A dashed ellipse is dashed from its start, unfitted

- **Severity:** medium · **Row:** M · **Status:** verified
- **AutoCAD:** p330 (plot): a whole ellipse laid as a circle (whole stretched periods from its
  start, solid under one period), an elliptical arc centred over its length as a line and an arc
- **mellowcad:** one `ellipse` primitive with a raw `dash`, no offset; a tiny ellipse dashed
- **Fix:** a `linetypedEllipse` beside `linetypedCircle` and `linetypedArc`, each dash an ellipse
  piece (ELLIPSE-D42; AOB-01's analogue)

#### EOB-04 — MIRROR keeps an ellipse's normal and negates its parameters; AutoCAD turns the normal

- **Severity:** medium · **Row:** H, J (transforms) · **Status:** verified
- **AutoCAD:** p320, p321: Normal 0,0,−1, parameters kept, the major axis to the mirrored end;
  p329: BREAK of a mirrored whole ellipse keeps three quarters (Area 3570.243)
- **mellowcad:** normal +Z, parameters negated; BREAK keeps the other quarter; the palette of a
  mirrored arc reads 260°/350° where AutoCAD reads 10°/100°
- **Fix:** an ellipse mirrors as a half-turn in 3D (ELLIPSE-D43); `entities.test.ts:860` rewritten

#### EOB-05 — STRETCH never reshapes an elliptical arc; AutoCAD moves its caught end

- **Severity:** medium · **Row:** transforms · **Status:** verified (the difference), the rule
  unverified
- **AutoCAD:** p324, p333, p336, p337: the caught end moves, the other stays, the arc an affine
  image keeping its parameter sweep; p332 unexplained (an end 0.14 outside the window moved)
- **Fix:** none now: a Missing entry in modify.md's STRETCH, citing the probes (ELLIPSE-D44)

#### EOB-06 — The palette's rows are not AutoCAD's

- **Severity:** medium · **Row:** I · **Status:** verified
- **AutoCAD:** d08: one Geometry group, for an ellipse and an arc alike: Inicio X/Y/Z, Centro X/Y/Z,
  Fin X/Y/Z, Radio mayor, Radio menor, Relación del radio, Ángulo inicial, Ángulo final (0 and 360
  for a whole one), Vector de radio mayor X/Y/Z, Vector de eje menor X/Y/Z, Área; Inicio, Fin, the
  vectors and Área greyed, the rest editable
- **mellowcad:** the radii, Radius ratio, the angles (arc) or Area (whole), and a Center group;
  ratio and angles read-only; no Start, End, vectors; no Area on an arc
- **Fix:** AutoCAD's rows in its order, one Geometry group; Radius ratio, Start angle and End angle
  editable through `applyEllipseProperty` (ELLIPSE-D64; AOB-04's analogue)

#### EOB-07 — An ellipse has only its centre grip

- **Severity:** medium · **Row:** I · **Status:** verified (known in Missing; the desktop now
  settles it)
- **AutoCAD:** d07: the centre and four quadrants, on an elliptical arc also an arrow at each end
  (the four quadrants kept off the sweep); no hover menu; a quadrant's drag sets that half-axis to
  the cursor's distance from the centre, its direction and the other half kept (d07-3, d07-4); an
  end's drag moves the end to the cursor's heading from the centre, the ellipse kept (d07-7)
- **Fix:** the grips in `selectToolGrips.ts` and the three other files of the split (ELLIPSE-D63)

### Low

#### ELL-09 — A zero-length first axis is asked again silently

- **Severity:** low · **Row:** B · **Status:** verified (known)
- **AutoCAD:** p205, p206, p166: taken; the distance asked; then `*Invalid*` (`*No válido*`) and the end
- **mellowcad:** the second prompt again, no line; the next answer becomes a direct distance
- **Fix:** as AutoCAD (ELLIPSE-D26); the Missing line goes

#### ELL-10 — Spanish `E` (cEntro) at the elliptical arc's first prompt is refused

- **AutoCAD:** p03.es declares `Centro` and `cEntro` there; p111.es `E` → `Precise centro de arco
  elíptico:` · **Fix:** `promptKeywords.specifyAxisEndpointOfEllipticalArcOr.Centre` in es (ELLIPSE-D7)

#### ELL-11 — The hidden keyword of the current measure is refused at the angle prompts

- **AutoCAD:** each start and end prompt declares Angle and Parameter (p03, p233; es `ángUlo`,
  `Parámetro`); p114, p115.es, p234 → the prompt again, no line · **Fix:** offered hidden (ELLIPSE-D8)

#### ELL-12 — The centre mode's endpoint of axis refuses a Z

- **AutoCAD:** p130, p197 `Invalid point.`; p184, p245 a Z taken, dropped onto the centre's plane;
  the axis mode's other end is 2D (p170) · **Fix:** `takes()` `point2d` only in the axis mode
  (ELLIPSE-D9)

#### ELL-13 — `<45` at the start angle is an Angle Override; AutoCAD takes it as the angle

- **AutoCAD:** p181, p292: the start angle 45, the end prompt next · **Fix:** at an angle-only box
  `<a` answers the angle (ELLIPSE-D10), Rotation and Included unprobed

#### ELL-14 — A 3D point at the distance is measured in plan

- **AutoCAD:** p177: ratio 0.5385 (the 3D distance) · **Fix:** none: a Missing line (ELLIPSE-D11)

#### ELL-15 — The tests cite AutoCAD 2023 and leave cells open

- `drawing.test.ts:1389`, `:1425` cite 2023's console (`acc/e1–e7`): 2027's p03, p116–p118,
  p144–p146, p179, p232, p233 hold them; `:1541` does not assert ELL-04's message; `EllipseTool.ts`
  cites 2023 too. **Fix:** cited to 2027 (ELLIPSE-D14)

#### EOB-08 — A whole-turn arc loses its start, or is stored as an empty range

- **AutoCAD:** start = end, Included 0 or 360, Parameter 45 45 (p152, p153, p220, p224, p226, p235,
  p236): a closed ellipse keeping StartParam (0.857072 → 7.140257)
- **mellowcad:** a full ellipse from 0, or (360) a range whose end equals its start, not full
- **Fix:** one whole-ellipse form, every whole turn through it; the kept start goes to Missing
  (ELLIPSE-D21)

#### EOB-09 — Stored parameters are not normalised

- **AutoCAD:** StartParam in [0, 2π), EndParam above it (p134, p148, p154, p179, p180)
- **mellowcad:** negatives and ends below starts (the same curve) · **Fix:** normalised by the
  factory (ELLIPSE-D12)

#### EOB-10 — With a ratio of 1 the stored major axis is the turned one

- **AutoCAD:** p168: the first axis stays major on a tie · **Fix:** `createEllipse` keeps it (ELLIPSE-D12)

#### EOB-11 — The coverage on the ellipse is stale

- draw.md claims "nearest snaps" (EOB-01), lists BREAK in Missing (built), "ratio and angles as
  palette rows" (rows exist, not editable); MID and NEA on ellipses absent from drafting-aids.md;
  the quadrant's own axes and sweep filter unnoted; properties.md's linetype without the ellipse;
  modify.md's STRETCH silent on ellipses. **Fix:** with each block

#### EOB-12 — The object's tests lack citations and assertions

- `providers.test.ts:143` promises "a whole ellipse none" and checks the arc only; `:116`, `:130`,
  `objectArea.test.ts:24` uncited; `breaking.test.ts` and `ellipses.ts`' `ellipseCut` cite 2023's
  `acc/be*` (p334 holds them); nothing pins QUA's UCS independence (p301) or sweep (p302)

## 6. Decisions

- **ELLIPSE-D1** Enter refuses at every prompt in p125–p133's words; the parameter prompts as the
  angle ones (same input function); Included keeps `<180>`.
- **ELLIPSE-D2** LASTPOINT is the centre after ELLIPSE and after Rotation's `*Invalid*`.
- **ELLIPSE-D3, D4** a point at Rotation or Included is its heading from the centre in the UCS,
  from the X axis (p298, p299 settle the frame); Rotation then meets the band.
- **ELLIPSE-D5** the rail runs `_ellipse _c` and `_ellipse _a`; ELLIPSEC and ELLIPSEARC stay typed
  names (removing one is a major version) and join the WHY.
- **ELLIPSE-D6** `positiveNonzero`, the catalog's existing message.
- **ELLIPSE-D7** es `cEntro` through `promptKeywords`, the prompt's own spelling.
- **ELLIPSE-D8** the current measure's keyword hidden, re-asking.
- **ELLIPSE-D9** the centre mode's endpoint takes a Z, projected to the centre's plane.
- **ELLIPSE-D10** `<a` at an angle-only box answers the angle, in the runtime; if it cannot route it
  without breaking other commands, a Missing line citing p181.
- **ELLIPSE-D11** the 3D distance goes to Missing: the runtime's measure is planar and the case rare.
- **ELLIPSE-D12** the factory normalises the parameters and keeps the first axis on a tie.
- **ELLIPSE-D14** every regression test cites its 2027 probe.
- **ELLIPSE-D21** one whole-ellipse form; a closed arc's kept start goes to Missing (no field for it
  without changing the file).
- **ELLIPSE-D22** the properties are taken in `finish()`, before the arc's angles; the layer is
  assumed to follow the colour (unprobed: CLAYER is no command here).
- **ELLIPSE-D26** a zero first axis is taken, the distance asked, then `*Invalid*` and the end.
- **ELLIPSE-D40** Nearest through `closestOnEntity`, running and typed alike.
- **ELLIPSE-D41** Midpoint on an arc halfway along its length; `ellipseMidpoint` takes that meaning.
- **ELLIPSE-D42** dashes: the circle's loop rule when whole, the centred rule when an arc, each dash
  an ellipse piece; the arc-length inversion a named, capped table.
- **ELLIPSE-D43** MIRROR turns an ellipse's normal to −Z and keeps its parameters; an arc stays as
  it is (arc/p212).
- **ELLIPSE-D44** STRETCH of an elliptical arc stays as it is, a Missing line citing p324–p338,
  until a series of probes fits one rule.
- **ELLIPSE-D46** INT, TAN and PER on an ellipse stay Missing, citing p308–p314.
- **ELLIPSE-D47** a WHY at the quadrant provider: an ellipse keeps its own axes in a turned UCS (p301).
- **ELLIPSE-D61** the jig: the ghost in `currentColor`, the lines amber and dashed from the first
  point at 2 and from the centre at D, R, S, E (d01, d02).
- **ELLIPSE-D62** the other endpoint's box a length and an angle from the first point; the endpoint of
  axis from the centre alike (d04-2; the centre mode's unprobed, the same input function).
- **ELLIPSE-D63** the grips of d07: four quadrants, an arc's two end arrows; a quadrant's drag sets
  its half-axis to the cursor's distance, keeping its direction and the other half (the longer stays
  major through `createEllipse`); an end's drag puts the end on the cursor's heading from the
  centre, measured as the arc's angles are.
- **ELLIPSE-D64** the palette's rows of d08 in its order, one Geometry group; English labels
  `Start X`, `Center X`, `End X`, `Major radius`, `Minor radius`, `Radius ratio`, `Start angle`,
  `End angle`, `Major axis vector X`, `Minor axis vector X`, `Area` — the English profile unseen,
  so **unverified** in the coverage; Spanish copied from d08.

## 7. Tests proposed

- Regression tests, in each finding, citing its probe.
- `drawing.test.ts`: the Rotation band's edges (p149, p150, p208–p218); a distance equal to the
  semi-axis (p201); a point at the distance (p204); the arc's ends before starts, negatives and
  over 360 (p221–p227); the planes (p241–p248, p255, p256); the rail's echo, Enter and U; `_U` and
  transparency at each prompt (p188–p197); `'_ELLIPSE` at LINE (p106); U, REDO, UNDO 2, MREDO (p198,
  p199); Ortho bending the pick at 2, D, S, E (d01, d02).
- `providers.test.ts`: END of an arc, CEN of an arc, QUA on a turned UCS (p301) and off the sweep
  (p302), MID none on a whole ellipse (p304).
- `editing.test.ts` / `entities.test.ts`: ROTATE and SCALE (p322, p323), STRETCH of a whole ellipse
  (p326, p331).
- `ellipseFiles.test.ts`: the round trip of a styled, elevated, tilted, mirrored ellipse and arc
  (`arcFiles.test.ts`' model).

## 8. Not tested, and why

The presenters' pixels of an ellipse (one primitive, both presenters, `SvgScenePresenter.test.ts`
covers the primitive); the Down list and the right button's menu (LINE's, owned); the dynamic
input's dimension lines (presentation).

## 9. Not reviewed, and why

- The English profile on the desktop (the owner's AutoCAD is Spanish): the palette's English labels
  and the dynamic-input labels in English stay as worded, **unverified**.
- Escape once and twice mid-ELLIPSE; Space (the console is line-based; the runtime treats it as
  Enter, so ELL-01 covers it); Polar; OTRACK along an axis; EXT along an elliptical arc.
- STRETCH's rule (EOB-05); `<a` at Rotation and Included (ELL-13).
- CLAYER changed mid-command (no CLAYER here; `'-LAYER` refused at a point prompt).

## 10. Refuted in the adversarial pass

- `<30` then 100 at the other endpoint going along the cursor (p169, p290): the console's artefact;
  the desktop honours `<45` (d03), as mellowcad does.
- TAN's `No found for specified point.`: AutoCAD's own words (p335).
- QUA should follow the UCS (as AOB-02): an ellipse keeps its own axes (p301); mellowcad matches.
- AREA's 2 decimals: LUPREC, known (properties.md).
- Rotation's dynamic input shows no field on the desktop (d04-4): typing still answers it; a field
  there is presentation.
- Arc parameters differing by 2π: the same arc (EOB-09 is about storage only).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| draw.md "centre/quadrant/endpoint/nearest snaps" | p307 | false: Nearest (EOB-01) |
| draw.md "both radii editable in the palette" | d08 | holds; AutoCAD's other rows missing (EOB-06) |
| draw.md Missing "BREAK on an ellipse" | — | stale: built (`BreakTool.ts`) |
| draw.md Missing "axis grips" | d07 | settled; built by EOB-07 |
| draw.md Missing "the ribbon's `_c` / `_a`" | cuix, p105 | built by ELL-05 |
| draw.md Missing "a zero-length first axis" | p205 | built by ELL-09 |
| draw.md "AutoCAD 2023's console" | p03, p116–p118, p144–p146 | 2027 agrees; cited anew |
| `cad-tools.md` "The jigs of LINE, PLINE, CIRCLE, ARC, RECTANG and POLYGON wear `currentColor`" | d01 | gains ELLIPSE |
| `cad-catalogs.md` "OFFSET's `Thru`, ELLIPSE's `Centre`" (hidden options) | p03 | holds; es `cEntro` spelled per prompt |

Checked and holding: the prompts' text en and es, `FOO`'s words, the Rotation band, the Parameter
equation and Included's measure, the first axis's frame, the planes, the overrides at D, S, E,
ROTATE, SCALE, AREA, the file round trip, the hidden `Centre`.

## 12. Order of execution and estimate

1. **ELL** (the command) — Enter, LASTPOINT, the points at Rotation and Included, the distance's
   refusal, the rail's macros, TAN/PER, the arc's properties, the zero axis, the keywords, the 3D
   endpoint, `<a`, citations. The largest: about two hours.
2. **EDK** (the jig and the box) — after ELL, which rewrites the phases the overlay reads. One hour.
3. **EOB** (the object) — independent of ELL, after it for the snapshots: Nearest, Midpoint, dashes,
   MIRROR, grips, palette, storage, coverage, tests. About three hours.

## 13. Changes the execution makes

- `docs/coverage/draw.md` ELLIPSE rewritten: what each block built, the 2027 probes, Missing
  (STRETCH of an arc, a closed arc's kept start, a 3D distance, INT/TAN/PER, the English palette
  labels **unverified**); `drafting-aids.md` (Nearest, Midpoint, Quadrant on an ellipse);
  `modify.md` (MIRROR, STRETCH, BREAK of an ellipse); `properties.md` (an ellipse's linetype);
  `command-line.md` (the rail's ELLIPSE macros).
- `cad-tools.md`: ELLIPSE joins the jigs in `currentColor`.
- Catalogs: es `promptKeywords` for `cEntro`; the palette's new rows in en, es, ar.
- The roadmap: ELLIPSE `done`, owning the ellipse object.

## 14. Template improvements (proposed)

- Annex-probes §4: a desktop pass in the owner's Spanish profile reads only Spanish labels; plan the
  English ones from `ax26res.dll` or a second pass, so the palette's English is not left unverified.
- Annex-probes §4: Escape with the dynamic input's Down list open cancels the command (d05): close
  the list with the arrow keys or Enter, never Escape, mid-probe.
- Template §4.8: two subagents found the same differences under different ids (the point at
  Rotation and Included, the distance's refusal): give each a disjoint list of prompts as well as
  of rows.
