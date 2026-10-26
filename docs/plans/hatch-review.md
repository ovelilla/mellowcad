# HATCH review (HATCH, -HATCH)

> **Status:** plan, 2026-10-26 — phases 0–4 in one session with skill `command-review`, the
> eighteenth review of `docs/coverage/roadmap.md`'s order. It owns **the hatch object**: its
> pattern library, geometry, pick, grips, palette rows, transforms' contract, render and file.
> Commands: HATCH (H, BH), -HATCH (not registered before this review). Executed in the same
> session, block by block (§12).

## 1. Summary

0 critical, 5 high, 19 medium and 18 low findings over three blocks.

The worst:

- **The default hatch is not AutoCAD's.** 2027 starts a metric drawing on `ANGLE` from
  acadiso.pat (p00); mellowcad on ANSI31 at the imperial 0.125 spacing, so a default hatch is
  848 lines where AutoCAD draws 34 (HOB-01, p300). The generator itself is exact: fed acadiso's
  values it reproduces AutoCAD's exploded lines to 1e-6, dash phase included (p300–p307).
- **A pattern hatch is picked by its area here, by its lines in AutoCAD.** A click inside a hatch
  off its lines starts a window in AutoCAD (d06-2, p322, p324); here it selects the hatch
  (HOB-02); a crossing inside one finds nothing there (HOB-03). A SOLID hatch is picked by its
  area in both (d06-5). This is the analogue the Text review left (TXO-10).
- **The trace misses two everyday cases.** A second pick in an area already picked doubles the
  loop and the hatch comes out empty (HBD-01, p157: `This area has already been specified.`);
  text and MTEXT inside the area are not islands, so the pattern runs through a room's label
  (HBD-02, p166, p125, p147).
- **Escape under HATCH keeps what was picked** (d01-3): the ribbon's HATCH makes the hatch at each
  pick. -HATCH's Escape discards it (d02). Here both discard (HAT-16).

The analogues left by earlier reviews:

- MATCHPROP and a hatch's origin (`properties-review.md`): AutoCAD copies name, angle and scale
  and leaves the destination's pattern anchored where it was (d07). mellowcad matches
  (`entities.test.ts:1163`); the test gets the probe's citation.
- An area object's pick measuring 0 inside it (`text-review.md`, TXO-10): wrong for a pattern
  hatch (HOB-02), right for a SOLID (d06-5).

| Block | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| HOB — the hatch object: patterns, geometry, pick, grips, palette, transforms, render, file | 0 | 2 | 6 | 7 |
| HBD — the internal point and its boundary trace | 0 | 2 | 4 | 4 |
| HAT — HATCH / -HATCH: names, Properties, Select objects, Escape, preview, undo, catalogs | 0 | 1 | 9 | 7 |

Evidence: about 190 console probes in es-ES and en-US (p00–p04, p100–p169, p200–p263,
p300–p369), a desktop pass in the English profile (d01–d09), acadiso.pat and acad.pgp of the
installed 2027 (en and es), the `acadres` tables.

## 2. Inventory

Commit `b675b8f`. AutoCAD 2027, ACADVER 26.0, `_VERNUM` X.118.0.0 (p00); tables of 2026-10-20.

- **The tool:** `cad/application/tools/HatchTool.ts`; it imports `objectSelection.ts`
  (`ObjectSelector`), `currentProperties.ts`, `DynamicInput`, `coordinateInput.ts`.
- **The trace:** `cad/domain/boundary.ts` (`traceBoundaryLoops`).
- **The object:** `cad/domain/hatch.ts`, `hatchPatterns.ts`, `entityTypes.ts` (`HatchEntity`),
  `entityFactories.ts` (`createHatch`), `entityTransforms.ts` (every `case "hatch"`,
  `hatchLike`), `entityQueries.ts` (closest, bounds, draw order, crossing), `entityProperties.ts`,
  `objectArea.ts`; `cad/application/SceneBuilder.ts` (`hatchPrimitives`), `viewPick.ts`,
  `EngineState.ts` (palette rows), `tools/selectToolGrips.ts`, `clipboard.ts`,
  `cad/serialization/drawingFile.ts`.
- **Registration:** `runtimeTools.ts`, `CommandLine.ts`; `-HATCH` was in no table.
- **Catalogs:** `commands.names.HATCH`, `keywords.HATCH`, `keywordLabels.HATCH`, prompts
  `specifyInternalPointOr`, `enterPatternNameOr`, `patternName`, `patternScale`, `patternAngle`,
  messages `currentHatchPattern`, `hatchPatternUnknown`, `hatchTooDense`, `hatchNoBoundary`,
  `noBoundaryToUndo`, the four analysis lines, `listing.hatchPattern*`, `interface.hatchPattern`,
  in `en`, `es`, `ar`.
- **UI:** `components/cad/tool-rail.tsx`, `content/commands.ts`.
- **Tests:** `cad/application/tools/hatching.test.ts`, `cad/domain/boundary.test.ts`,
  `objectArea.test.ts`, and the hatch cases of `currentProperties.test.ts`, `elevation.test.ts`,
  `transforms.test.ts`, `ucs.test.ts`, `entities.test.ts`, `drawingFile.test.ts`,
  `newDrawingResets.test.ts`, `invalidAnswers.test.ts`, `englishSurface.txt`.
- **Knowledge:** `docs/coverage/draw.md` (HATCH), the hatch lines of `modify.md`, `inquiry.md`,
  `properties.md`; rules `cad-tools.md`, `cad-engine.md`, `cad-catalogs.md`, `cad-scene.md`.

Related tools, in the part that concerns a hatch: MOVE, COPY, ROTATE, SCALE, MIRROR, STRETCH,
EXPLODE, AREA, MATCHPROP, PROPERTIES, ERASE's pick, U / REDO, FILL.

Areas cited, not reviewed again: `Select objects:` and preselection (`erase-review.md`); the
command line, undo, current properties, grips, the palette, files, render (`line-review.md`);
placement (`move-review.md`); transforms (`transforms-review.md`); EXPLODE (`pieces-review.md`);
MATCHPROP (`properties-review.md`). Owned here: **the hatch object**.

## 3. Probes

Console inputs are `scripts/research/probes/hatch/<id>.txt` (`.plain` untraced, `.es` / `.en` one
locale), run with `scripts/research/probe.sh hatch <ids>`. The desktop pass is
`scripts/research/probes/hatch/d01-d09.sh` with `lib-dsk-en.sh`. Transcripts, screenshots, plots
and the desktop's history (`d-session.log`) are in `research/probes/hatch/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version and the HP variables (HPNAME `ANGLE`, HPSCALE 1, HPANG 0, HPORIGIN 0,0, HPSEPARATE 0, HPASSOC 1, HPDRAWORDER 3, HPGAPTOL 0, HPMAXLINES 100000, HPLAYER/HPCOLOR `.`) |
| p01–p04 | `_HATCH`'s console prompt, `_-HATCH`'s, Properties' refusals and `?`, `_T` |
| p100–p169 | the internal point: answers, Undo, point forms, LASTPOINT, `_END`, nested islands, text and MTEXT islands, loose lines, arcs, circles, ellipses, splines, a point on an edge, outside, a gap, off screen, off/frozen/locked layers, heights, the same area twice, two areas, an existing hatch, U and REDO |
| p200–p263 | names and aliases (en, es), transparency, the pattern name, scale and angle prompts, `?`, `_U`, `_G`, Select objects (open line, text, MTEXT, Window, empty), preselection, the Previous set, transparent commands at each prompt, U, UNDO 2, REDO, HP variables under U, current properties, ELEVATION, LUPREC and AUPREC |
| p300–p369 | the object: ANSI31 and ANGLE exploded line for line, scale, angle, HPORIGIN, a moved and a turned UCS, too dense, MOVE, COPY, ROTATE, SCALE, MIRROR (MIRRHATCH 0, 1), STRETCH, LIST, AREA, picks inside and on the edge (pattern and SOLID), crossings, draw order, DXF out and in, a plot with a linetype and lineweight, FILLMODE 0, the density threshold |
| d01–d09 | en-US desktop: HATCH with the ribbon (quick preview, the hatch made at each pick, Escape keeps it), -HATCH (preview, Escape discards), grips of an associative and a non-associative hatch and their hover menus, a centre-grip drag, the Properties palette, picks inside a pattern and a SOLID hatch, MATCHPROP's origin, the rollover tooltip and the double-click, running snaps at the internal point |

## 4. Matrix

The subagents' full reports, with every cell's two citations and their scratch tests
(`research/review/hatch/{a,b,c}/`), are kept with the transcripts. These are the cells that do not
hold, or hold untested; every other cell is `match` with its probe and test.

### HBD — the internal point

| Row | Cell | State |
| --- | --- | --- |
| B | the same area picked twice | differs HBD-01 · p157 |
| B | what each pick reports | differs HBD-03 · p104, p144, p119 |
| B | a point on a boundary or a shared edge | differs HBD-05 · p143, p122 |
| B | `0`, a bare number (direct distance) | differs HBD-08 · p102, p117 |
| B | `_Y` (another prompt's keyword) | untested · p101 |
| B | `_B`, hidden `_R`, `_D` | known · p108, p109, p101 |
| C | `x,y,z`, `@dx,dy`, `@`, `d<a`, `#x,y`, `*x,y` (refused), `x,y` in UCS Z 30 | untested · p110–p116 |
| C | LASTPOINT set by the pick and kept after | untested · p111, p113, p118 |
| D | a typed `_END` override | differs HBD-07 · p120, p121 |
| D | running snaps on a click: no marker, the raw point | match · d09 · `wantsSnap()` |
| H | Outer nesting: 3 loops in AutoCAD, 2 here (same area) | differs HBD-10 · p130 |
| H | island and island's island, arc + line, circle, closed polyline with an arc | untested · p131, p132, p136, p137, p142 |
| H | TEXT and MTEXT inside the area | differs HBD-02 · p166, p125, p134, p147 |
| H | ellipse and spline boundaries | known (ELLIPSE, SPLINE Missing) · p138–p141 · HBD-09 |
| H | objects at another height; the hatch's Z | differs HBD-04 · p153–p155, p167, p168 |
| H | layer off (not traced), locked (traced), an existing hatch (ignored) | untested · p151, p152, p159 |
| H | a tilted UCS | unverified · p156 (the console refuses a point off the plane) |
| F | U after a run: one step, echoes the name typed | untested · p128, p160 |
| N | `hatching.test.ts` cites `acc/h1–h23` (2023), boundary.test.ts:161 always passes | differs HBD-06 |

### HAT — the command

| Row | Cell | State |
| --- | --- | --- |
| A | `-HATCH`, `-H`, `-BH`, `-BHATCH`, `BHATCH`; es `-SOMBREA`, `-SMB` | differs HAT-01 · p200–p202, p255 |
| A | es `SB`, `SMB`; repeat by Enter; `'HATCH` refused | untested · p202, p204, p205 |
| B | `?`: back to the internal point, the listing's columns | differs HAT-04, HAT-12 · p212, p221 |
| B | `_S`, `_ANSI31` | differs HAT-09 · p207, p248, p254 |
| B | scale: two points; `<1.0000>` | differs HAT-05, HAT-11 · p209, p259 |
| B | angle `-30` stored 330 | differs HAT-10 · p210, p262 |
| B | angle by two points; `ansi31`; Window at Select objects | untested · p211, p217, p225 |
| B | HPNAME/HPSCALE/HPANG under U | differs HAT-03 · p242, p243 |
| B | Select objects: an open line, a text, an MTEXT alone | differs HAT-07 · p223, p226, p227 |
| B | the Previous set after HATCH | differs HAT-08 · p256, p257 |
| B | preselection ignored and dropped; nothing left selected | untested · p229–p232 |
| E | a transparent command at the pattern name | differs HAT-06 · p234, p238 |
| E | at the internal point, scale, angle, Select objects | untested · p233, p235–p237 |
| F | U's echo, UNDO 2, REDO, U of an empty run | untested · p239–p241, p247 |
| G | Escape under HATCH keeps the boundaries picked; under -HATCH discards | differs HAT-16 · d01-3, d02 |
| G | `_LINE` mid-prompt | untested · p244 |
| H | the hatch's Z is ELEVATION, on both routes | differs HAT-02 · p245, p250, p251, p261 |
| H | layer CLAYER, not the boundary's | untested · p246 |
| K | es ANSI31 description | differs HAT-13 · p212 es |
| K | catalog sweep (`--from HatchTool.ts`): 6 es-several, 3 no-source, all settled by the console | match · p02, p206, p208, p210 |
| M | quick preview under the cursor before a pick; the look after a pick | differs HAT-17 · d01-1, d01-2, d02-1, d02-2 |
| N | the Select objects and Properties describes | differs HAT-15 |
| O | coverage drift | differs HAT-14 |

### HOB — the hatch object

| Row | Cell | State |
| --- | --- | --- |
| H | HPNAME's default, the metric spacing | differs HOB-01 · p00, p300 |
| H | angle, scale, origin, dash phase, a moved and a turned UCS | match (generator) · p300–p307, p303, p304 · untested in the repo |
| H | members lying on a boundary edge | differs HOB-07 · p301 |
| H | the too-dense limit and its Spanish words | differs HOB-08, HOB-09 · p305, p363–p368 |
| I | a pick inside a pattern hatch, on its edge; a crossing inside | differs HOB-02, HOB-03 · p322, p324, p326, p327, d06-2 |
| I | a click inside a SOLID hatch | match · d06-5 · `hatching.test.ts:672` (the console's nil, p323, is its artefact) |
| I | MOVE, COPY, ROTATE, SCALE | match · p310–p313 · `transforms.test.ts:1532` |
| I | MIRROR with MIRRHATCH 0 | differs HOB-04 · p314, p316, p350–p354 |
| I | MIRRHATCH 1, STRETCH of an associative hatch | known |
| I | EXPLODE, AREA Object with an island | owned / match · pieces/p259, p263, p320 |
| I | grips of a non-associative hatch | differs HOB-13 · d03-1 to d03-5, d04 |
| I | Properties palette rows | differs HOB-14 · d05-1 |
| I | MATCHPROP: the origin is not copied | match · d07 · `entities.test.ts:1163` |
| I | a hatch made in a turned UCS reads its world angle | differs HOB-10 · p369 |
| I | double-click: the Hatch Editor tab and Quick Properties | known after this review (HOB-15) · d08-2 |
| J | save and reload; copy and paste | match / untested · `drawingFile.test.ts:1227`, scratch |
| M | pattern lines under the object's linetype; FILL off | differs HOB-05, HOB-06 · p340, p341 |
| N | the geometry, object and scene describes | differs HOB-11 |

## 5. Findings

### High

#### HOB-01 — The default hatch is imperial ANSI31 at 0.125; 2027 starts a metric drawing on ANGLE

- **Severity:** high (a known gap whose severity was understated) · **Row:** H · **Status:** verified
- **Where:** `cad/domain/hatchPatterns.ts` (`DEFAULT_HATCH_PATTERN_ID`, ANSI31 `deltaY: 0.125`)
- **AutoCAD:** p00 `HPNAME` `"ANGLE"`, MEASUREMENT 1; acadiso.pat `*ANGLE,Angle steel` /
  `0, 0, 0, 0, 6.985, 5.08, -1.905` / `90, …`, `*ANSI31` `45, 0, 0, 0, 3.175`; p300 ANSI31 at
  scale 1 over 0,0–100,50 explodes into 34 lines.
- **mellowcad:** scratch `c/geometry.test.ts`: 848 lines; with acadiso's values, 34/34 identical.
- **Scenario:** HATCH, a pick, Enter: AutoCAD draws ANGLE at 6.985; mellowcad a near-solid grey.
- **Fix:** HATCH-D60, D61, D62, D63. **Regression test:** p300, p301, p302, p306, p307 line for
  line in `hatching.test.ts`.

#### HOB-02 — A pattern hatch is picked anywhere inside it and on its boundary; AutoCAD only on its lines

- **Severity:** high · **Row:** I · **Status:** verified (by the reviewer, d06)
- **Where:** `cad/domain/entityQueries.ts:242-265`, `cad/application/viewPick.ts:131`
- **AutoCAD:** d06-1 no rollover inside an ANGLE hatch off its lines, d06-2 a click there starts a
  window, d06-3 a click on a dash selects it; p322 `(ssget '(30.0 10.0))` → nil, p324 es
  `Designe esquina opuesta:`, p327 the edge with the boundary erased → nil. d06-5: a SOLID is
  selected by a click inside.
- **mellowcad:** scratch `c/object.test.ts` and `c/edge.test.ts`: `['h']` where `[]` is expected;
  `hatching.test.ts:672` pins the opposite.
- **Scenario:** a click in an empty part of a hatched room to start a window selects the hatch.
- **Fix:** HATCH-D64. **Regression test:** p322, p324, p327, d06 in `hatching.test.ts`.
- **Rules:** `cad-engine.md` Modelling, "An entity that is an area (text, hatch) hit-tests as
  filled", becomes a SOLID hatch's rule.

#### HBD-01 — A second pick in an area already picked doubles the loop; the hatch comes out empty

- **Severity:** high · **Row:** B/H · **Status:** verified (by the reviewer, p157)
- **Where:** `HatchTool.ts:352`
- **AutoCAD:** p157 `60,30` → `This area has already been specified.` (es `Esta área ya se ha
  especificado.`, table 25009); one hatch, 1 loop, area 5000. The second pick writes none of the
  analysis lines.
- **mellowcad:** scratch `a/hbd.test.ts` p157: area −10000, 2 loops, no pattern line.
- **Fix:** HATCH-D1. **Regression test:** p157.

#### HBD-02 — Text and MTEXT inside the area are not islands; the pattern runs through them

- **Severity:** high · **Row:** H · **Status:** verified (by the reviewer, p166)
- **Where:** `cad/domain/boundary.ts:192-200`, `HatchTool.ts` `BOUNDARY_TYPES`
- **AutoCAD:** p166 a TEXT inside: 2 loops, area 20000 (unchanged); p125 the text's loop flagged
  `92 . 24` (text box), box 77.3943,42.2442–111.31,57.7558 for TEXT at 80,45 height 10; p123
  `textbox` (-0.0205,-0.1705)–(28.1719,10.1705); p134, p127 MTEXT the same; p147 (plot) the
  pattern leaves a clear box round the text.
- **mellowcad:** scratch p166, p134: 1 loop.
- **Fix:** HATCH-D5. **Regression test:** p125, p123, p134 in `boundary.test.ts` and
  `hatching.test.ts`.

#### HAT-16 — Escape under HATCH discards the boundaries picked; AutoCAD's HATCH keeps the hatch

- **Severity:** high · **Row:** G · **Status:** verified (desktop, by the reviewer)
- **Where:** `HatchTool.ts` `onDeactivate`; `hatching.test.ts:389`
- **AutoCAD:** d01: `_HATCH`, a pick, Escape → `*Cancel*` and the hatch stays (the ribbon's HATCH
  makes it at the pick, d01-2). d02: `_-HATCH`, a pick, Escape → `*Cancel*`, no hatch.
- **Scenario:** H, a click inside a room, Escape (the habit that closes the Hatch Creation tab):
  AutoCAD keeps the hatch, mellowcad drops it.
- **Fix:** HATCH-D45. **Regression test:** d01, d02, by name.

### Medium

| Id | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| HBD-03 | every pick writes the four analysis lines; AutoCAD writes the three gathering lines once per run, `Analyzing internal islands...` only when an area is found | p104, p144, p119, p157 | HATCH-D3 |
| HBD-04 | the internal point traces only the nearest object's height and lays the hatch there; AutoCAD traces every height parallel to the UCS and lays the hatch at ELEVATION | p153–p155, p167, p168 | HATCH-D4 |
| HBD-05 | a point on a boundary says `Valid hatch boundary not found.` or hatches a neighbour; AutoCAD `Point is directly on an object.` (es `El punto está directamente sobre un objeto.`, 25018) | p143, p122 | HATCH-D2 |
| HBD-07 | a typed object snap override at the internal point is refused; AutoCAD honours it | p120, p121 | HATCH-D8 |
| HAT-01 | `-HATCH` and its aliases are unknown | p200–p202, p255 | HATCH-D30, D47 |
| HAT-02 | the hatch lies at its boundary's height; AutoCAD at ELEVATION, both routes | p245, p250, p251, p261 | HATCH-D40 (with HBD-04) |
| HAT-03 | U leaves HPNAME, HPSCALE, HPANG as Properties set them | p242, p243, p260 | HATCH-D37 |
| HAT-04 | after `?` the pattern name is asked again; AutoCAD returns to the internal point | p212, p220, p221 | HATCH-D32 |
| HAT-05 | the scale prompt refuses two points | p209 | HATCH-D34 |
| HAT-06 | a transparent command at the pattern name is read as a pattern name | p234, p238 | HATCH-D41 |
| HAT-07 | `Unable to hatch the boundary.` (es `Imposible sombrear el contorno.`, 20770) is never said | p223, p226, p227 | HATCH-D38 |
| HAT-08 | HATCH's set becomes the Previous set; AutoCAD's does not | p256, p257 | HATCH-D39 |
| HAT-17 | no quick preview of the area under the cursor before a pick; after a pick the pattern shows in preview colour, where HATCH shows the hatch made and -HATCH only highlights the boundary | d01-1, d01-2, d02-1, d02-2 | HATCH-D46 |
| HOB-03 | a crossing wholly inside a pattern hatch takes it; AutoCAD's finds nothing | p322, p326 | HATCH-D64 |
| HOB-04 | MIRROR turns and moves the pattern; with MIRRHATCH 0 AutoCAD keeps angle, origin and scale | p314, p316, p350–p354 | HATCH-D65 |
| HOB-05 | pattern lines are dashed by the hatch's linetype; AutoCAD draws them continuous | p340 | HATCH-D66 |
| HOB-06 | FILL off still draws hatches; AutoCAD hides SOLID and pattern hatches alike | p341 | HATCH-D67 |
| HOB-13 | a non-associative hatch shows one grip; AutoCAD a round centre grip plus its boundary's vertex and edge grips | d03-1 to d03-5, d04 | HATCH-D72 |
| HOB-14 | the palette's Pattern rows: here Pattern, Scale, Angle, Boundaries; AutoCAD Type, Pattern name, Annotative, Angle, Scale, Origin X, Origin Y, Spacing, ISO pen width, Double, Associative, Island detection style, Background color, and Geometry's Area, Cumulative Area | d05-1 | HATCH-D73 |

### Low

| Id | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| HBD-06 | the Undo describe cites 2023 (`acc/h1–h23`); `boundary.test.ts:161` passes `[]` and tests nothing | p101, p103, p104, p106, p107, p124, p162, p164 | re-cite, fix |
| HBD-08 | a bare number at the internal point is refused; AutoCAD reads it as direct distance | p102, p117 | HATCH-D7 |
| HBD-09 | HATCH's Missing omits ellipse and spline boundaries | p138–p141 | HATCH-D9 |
| HBD-10 | Outer nesting stores 2 loops, AutoCAD 3 (same area, nothing seen) | p130, p126 | HATCH-D6 (recorded) |
| HAT-09 | `_ANSI31`, `_S` taken as AutoCAD takes them (`Current hatch pattern:  _ANSI31`) | p207, p244, p248, p254 | HATCH-D33 |
| HAT-10 | a negative angle is stored negative and offered `<-30>`; AutoCAD 330 | p210, p262 | HATCH-D36 |
| HAT-11 | the scale default follows LUPREC; AutoCAD `<%.4f>` always (25481) | p259 | HATCH-D35 |
| HAT-12 | the `?` listing: AutoCAD pads the name to 16 columns and writes `- ` before the .pat description | p221 | listing words |
| HAT-13 | es ANSI31 description: es acadiso.pat `ANSI albañilería de acero, ladrillo, piedra` | p212 es | HATCH-D43 |
| HAT-14 | coverage drift: `-HATCH`, `<1.00>`, the height claim, "not probed" | §11 | coverage |
| HAT-15 | the Select objects and Properties describes: no probe ids, weak counts (:325, :344, :358, :557), `<1.00>` pinned | §7 | rewrite with probes |
| HOB-07 | a pattern member lying on a boundary edge is drawn; AutoCAD leaves it out (23 extra lines for ANGLE over 0,0–100,50) | p301 | HATCH-D68 |
| HOB-08 | es too dense: the console says `Intervalo de sombreado demasiado denso o trazo demasiado pequeño.` (20134, 20772) | p305 es | catalog |
| HOB-09 | the too-dense cap is not HPMAXLINES (p363, p364); AutoCAD refuses between 27.8k and 32.1k members | p365, p367 | HATCH-D69 |
| HOB-10 | a hatch made in a turned UCS reads its world angle; AutoCAD keeps the angle typed (DXF 52) | p369, p330 | HATCH-D70 (Missing) |
| HOB-11 | geometry, object and scene describes: the imperial spacing pinned (:576), the wrong pick (:672), MIRROR's −30° (:688), weak counts (:602, :645, :651, :769), no probes | §7 | rewrite with probes |
| HOB-12 | coverage the probes settle: AREA of a hatch's islands (inquiry.md), MIRROR's rule (modify.md), FILL (properties.md) | p320, p314, p341 | coverage |
| HOB-15 | a double-click on a hatch does nothing here; AutoCAD opens the Hatch Editor tab and Quick Properties | d08-2 | HATCH-D74 (Missing) |

## 6. Decisions taken

The owner does not answer technical questions (AGENTS.md); each is the most standard option.

- **HATCH-D1:** a pick whose point lies inside what the loops picked so far fill (even-odd) says
  `areaAlreadySpecified` and gathers nothing.
- **HATCH-D2:** a point within the pick tolerance of a candidate boundary object says
  `pointOnObject` and gathers nothing; the tolerance is 1e-6 drawing units (typed) — the
  desktop's pickbox for a click stays **unverified**.
- **HATCH-D3:** the boundary set is gathered once per run, at its first pick, failed or not (the
  three gathering lines); `Analyzing internal islands...` only for a trace that finds an area.
- **HATCH-D4:** the internal point traces every visible object parallel to the UCS, whatever its
  height, projected; the hatch lies at ELEVATION (with HATCH-D40).
- **HATCH-D5:** a TEXT or MTEXT inside the traced face becomes a box loop: its ink extents widened
  by 0.2585·h each side (p123/p125; the right side measured 0.3138·h — the exact rule
  **unverified**), stored as a plain loop so the even-odd rule leaves it clear.
- **HATCH-D6:** Outer nesting keeps 2 loops; AutoCAD's third (not outermost, flag 6) needs loop
  flags in the model for nothing a user sees: recorded.
- **HATCH-D7:** a bare number at the internal point is direct distance from LASTPOINT towards the
  cursor (`directDistance` on the box).
- **HATCH-D8:** typed object snap overrides are honoured at the internal point; running snaps stay
  off on a click (d09).
- **HATCH-D9:** ellipse and spline boundaries stay a gap, listed in HATCH's Missing.
- **HATCH-D30:** `-HATCH` (en `-HATCH`, `-H`, `-BH`, `-BHATCH`; es `-SOMBREA`) runs the same tool;
  `BHATCH` joins HATCH's names, `-SMB` SOMBREA's (acad.pgp `-SMB, *SOMBREA`).
- **HATCH-D31:** HATCH keeps -HATCH's prompts (WHY unchanged: no ribbon, no dialog; the console's
  HATCH, p01, offers no Properties).
- **HATCH-D32:** `?` lists and returns to the internal point; `Enter pattern(s) to list <*>:` stays
  Missing.
- **HATCH-D33:** a pattern name answered with a leading `_` resolves without it; the
  `Current hatch pattern` line writes it as typed (`_ANSI31`); the object stores the registry id.
- **HATCH-D34:** the scale box is a distance: two points are measured by the runtime.
- **HATCH-D35:** the scale default is written `%.4f` always (25481), as LTSCALE's factor.
- **HATCH-D36:** HPANG is normalised to [0, 360°).
- **HATCH-D37:** Properties sets HPNAME, HPSCALE, HPANG through a command inside the run, so one U
  restores them and a cancel keeps them (p242, p243, p260).
- **HATCH-D38:** `Unable to hatch the boundary.` when Enter ends a run whose Select objects found
  objects and no loop; an empty run stays silent (p204).
- **HATCH-D39:** HATCH's Select objects leaves the Previous set as it was.
- **HATCH-D40:** the hatch's Z is ELEVATION by both routes; the Select objects route still takes
  only objects in one plane (the first one's).
- **HATCH-D41:** an apostrophe command typed at the pattern name runs transparently.
- **HATCH-D42:** open objects found with a real boundary stay out silently (AutoCAD's degenerate
  loop, p222, is invisible).
- **HATCH-D43:** pattern descriptions (the `?` listing) are acadiso.pat's, es from es acadiso.pat.
- **HATCH-D44:** no HPLAYER, HPCOLOR, HPTRANSPARENCY variables: `.` (use current) is what happens.
- **HATCH-D45:** started as HATCH (H, BH, SOMBREA…), Escape commits the boundaries gathered, as
  the ribbon's HATCH has made the hatch at each pick (d01-3); started as -HATCH it discards
  (d02). The deviation (no ribbon) keeps its WHY.
- **HATCH-D46:** at the internal point the area under the cursor is previewed before any pick
  (HPQUICKPREVIEW 1, d01-1, d02-1), traced on pointer move and reused while the cursor stays in
  the same face; after a pick HATCH draws the hatch as it will be made (the object's colour) and
  -HATCH highlights the boundaries gathered, without the pattern (d01-2, d02-2).
- **HATCH-D47:** `-HATCH` is a name of the same tool (`startedAs` heads the prompts, U echoes it),
  not a tool of its own: it asks the same prompts; only Escape differs (D45).
- **HATCH-D60:** acadiso.pat is transcribed for SOLID, ANGLE, ANSI31–ANSI38, LINE, NET, NET3, DASH,
  SQUARE, STEEL, BRICK, CROSS, ZIGZAG, HONEY, EARTH, DOTS, AR-SAND, AR-CONC, each `.pat` line
  quoted beside its data (as `linetypes.ts`); the rest stays Missing.
- **HATCH-D61:** HPNAME's initial value is `ANGLE` (p00).
- **HATCH-D62:** a `0` dash is a dot, drawn as the linetypes' dots are; what EXPLODE makes of a
  dot is **unverified** (Missing).
- **HATCH-D63:** `DRAWING_FILE_VERSION` is bumped; a hatch read from an older file whose pattern
  is ANSI31 has its scale divided by 25.4, so it draws as it was saved (the old registry held the
  imperial definition).
- **HATCH-D64:** a pattern hatch picks, crosses and fences by its pattern lines (the cached
  `hatchGeometry`), never by its area or boundary; a SOLID by its area (d06-5).
- **HATCH-D65:** MIRROR reflects a hatch's loops and keeps its angle, origin and scale
  (MIRRHATCH 0); MIRRHATCH 1 goes to Missing.
- **HATCH-D66:** pattern lines draw continuous, in the object's colour and lineweight.
- **HATCH-D67:** with FILL off a hatch draws nothing, SOLID or pattern.
- **HATCH-D68:** a pattern member lying on a loop edge is left out.
- **HATCH-D69:** the 100 000 cap stays as a safety cap, its comment corrected (not HPMAXLINES);
  AutoCAD's own threshold is recorded **unverified** in detail.
- **HATCH-D70:** angle and origin stay stored in world terms; the angle as typed in a turned UCS
  (DXF 52) and HPORIGIN's readout after a MOVE (the palette's Origin stays 0,0, d05-1) go to
  Missing.
- **HATCH-D71:** MATCHPROP's "origin not copied" holds (d07); its test cites d07.
- **HATCH-D72:** a hatch (non-associative here) gets AutoCAD's non-associative grips: a round
  centre grip at its extents' centre that moves the hatch (d03-5, d04), a square grip per loop
  vertex that stretches it, an edge-middle grip per straight segment that stretches the edge; the
  hover menus' Origin Point, Hatch Angle, Hatch Scale, Add / Remove Vertex and Convert to Arc go
  to Missing.
- **HATCH-D73:** the palette's rows in AutoCAD's order: Pattern — Type (`Predefined`), Pattern
  name, Annotative (`No`), Angle, Scale, Origin X, Origin Y (editable), Associative (`No`), Island
  detection style (`Outer`); Geometry — Elevation, Area, Cumulative Area (read-only). `Boundaries`
  goes. Spacing, ISO pen width, Double and Background color (greyed for a predefined pattern) go
  to Missing; their Spanish labels are glossary words, **unverified** (English pass only).
- **HATCH-D74:** a double-click on a hatch stays nothing; HATCHEDIT, the Hatch Editor tab and
  Quick Properties are Missing.
- **HATCH-D78:** a TEXT's island box runs along its baseline from the ink's start to the
  advance's end, not the ink's: p125's right side, 0.3138·h past the ink, is 0.2585·h past the
  advance, as every other side is past the ink (p123 at 20 too). An MTEXT's spans its lines'
  advances by Arial's ascent and descent plus 0.25·h, which p127 measures to 1e-3.
- **HATCH-D79:** a text box is an island only wholly inside the traced face and not inside one of
  its islands (Outer); at Select objects, only wholly inside a boundary taken (p228). A text across
  a boundary, or the pick inside a text's box, stays **unverified**.
- **HATCH-D80:** "already specified" is tested against the internal points' loops only, not what
  Select objects took (no probe mixes them).
- **HATCH-D81:** HPNAME (as typed), HPSCALE and HPANG are `DocumentSettings` fields the file leaves
  out, TEXT's rotation's pattern; each is set as it is answered, so an Escape mid-Properties keeps
  those answered (p260 cancels after all three: the order within is **unverified**).
- **HATCH-D82:** the pattern name's box is `askValueOrWord`'s, so `?` and Solid are the runtime's
  keywords and an apostrophe command runs there; the keyword's answer as typed reaches the tool
  (`invokeOption`'s `typed`), which keeps `_S`'s `_`. A shortcut-menu Solid, typed `_Solid` by the
  runtime, is `_SOLID` too (what AutoCAD's menu sends is **unverified**).
- **HATCH-D83:** the registry is in acadiso.pat's order, which `?` lists (p221).
- **HATCH-D84:** the quick preview is not drawn over an area already picked, and after a trace that
  found no area it traces again only once the cursor has moved 8 px; the internal points'
  boundaries are highlighted as their loops (the objects AutoCAD highlights are not kept), a text's
  island box not.
- **HATCH-D85:** Escape under HATCH makes what Select objects took as well as the internal points'
  areas (d01 tried a pick only).
- **HATCH-D86:** the scale's box is a distance's, so it shows the drawing's unit as every distance
  box does; BHATCH, -BHATCH and -BH are aliases here, echoed as such (Missing).

## 7. Tests proposed

Regression tests first, each citing its probe: every finding's above. Then:

- `hatching.test.ts`: the Pick internal point describe cites p100, p135, p146, p158; the Undo
  describe re-cites 2027 (p103, p104, p106, p107, p124, p162, p164); the point forms (p110–p116),
  LASTPOINT (p111, p118), layers off and locked (p151, p152), an existing hatch (p159), the circle
  and arc areas (p136, p137, p142); Select objects: the preselection (p229–p232), Window (p225);
  Properties: angle by two points (p211), `-2` (p208), transparent commands (p233, p235–p237),
  `_LINE` mid-prompt (p244); U's echo (p160, p239), UNDO 2 (p240), U of an empty run (p241); the
  geometry line for line (p300–p307), a moved and a turned UCS (p303, p304), MOVE (p310), COPY
  (p311), ROTATE (p312), SCALE (p313); copy and paste (scratch `c/clipboard.test.ts`).
- `boundary.test.ts`: an ignored type at :161, a point on an edge, a duplicate face, text boxes.
- `objectArea.test.ts:71` re-cites p320; `currentProperties.test.ts:112` cites p245, p246;
  `elevation.test.ts:750`, `:773` turn to p245, p250, p251; `entities.test.ts:1163` cites d07.

## 8. What is not tested and why

The rollover tooltip (d08-1) and the ribbon tabs are chrome this app does not have; the grip
hover menus beyond what is built (Missing); the preview's colours (presentation).

## 9. What could not be reviewed and why

- **Spanish labels on the desktop:** the pass ran in the English profile; the palette's Spanish
  rows stay glossary words, **unverified**.
- **MellowProbe on the desktop:** its NETLOAD failed in this instance (`loadmgd`), so the
  desktop's history came from AutoCAD's log (LOGFILEMODE), not `com hist`; nothing was lost.
- **A tilted UCS at the internal point** (p156): the console refuses a point off the plane.
- **The pickbox tolerance of `Point is directly on an object.`** for a click: not probed.
- **The exact too-dense rule:** ids ran out (p355–p368 bracket it).

## 10. Refuted in the adversarial pass

- **An open line found with a rectangle** (p222): AutoCAD keeps a degenerate second loop, which
  nobody sees: kept out (HATCH-D42).
- **The console's nil for a click inside a SOLID** (p323, p325, p328): a console artefact; the
  desktop selects it (d06-5).
- **Running snaps at the internal point:** AutoCAD takes the raw click too (d09).
- **MATCHPROP's origin:** matches (d07).
- **The centre grip at the centroid:** it is the extents' centre, as here (d03-5).
- **Transparency of the result:** the model has no transparency (p249): n/a.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| draw.md: "each internal point says `Selecting everything...` …" | p104 | false (HBD-03) |
| draw.md: "the hatch lies at the height of its boundary … which object fixes the plane is **unverified**" | p153–p155, p245 | false (HBD-04, HAT-02) |
| draw.md: "what AutoCAD says of it was not probed" (an open object) | p223 | settled (HAT-07) |
| draw.md: `<1.00>` scale default | p259 | false (HAT-11) |
| draw.md: Missing "the metric pattern file … the other ~70 patterns" | p00, p300 | understated (HOB-01) |
| draw.md: "area hit-test, single grip" | d06, d03 | false for a pattern hatch and for grips (HOB-02, HOB-13) |
| modify.md ~160: MIRROR's hatch angle, "the rule **unverified**" | p314 | settled (HOB-04) |
| inquiry.md:60: a hatch's islands **unverified** | p320 | settled, holds |
| properties.md:195: solid hatches with FILL off **unverified** | p341 | settled (HOB-06) |
| cad-engine.md: "An entity that is an area (text, hatch) hit-tests as filled" | p322, d06 | stale (HOB-02; text too since TXO-10) |
| cad-tools.md: "HATCH takes the first boundary's plane" | p153, p245 | stale (HBD-04) |
| cad-tools.md: `wantsSnap()` "False for an area prompt (HATCH's internal pick)" | p120, d09 | narrows to running snaps (HBD-07) |
| hatch.ts: `MAX_HATCH_LINES` "AutoCAD's HPMAXLINES" | p363, p364 | false (HOB-09) |
| HatchTool.ts: `takes()` "As AutoCAD 2023's console" | p208, p210 | re-cite |

Checked and holding: HPSEPARATE 0 (p158), HPDRAWORDER 3 (p321), HPGAPTOL 0 (p145), the visible
boundary set (p146), the Undo keyword (p103–p164), Select objects' counts (erase/p222), the
current properties (p245, p246), HP settings per drawing (rectang/p303, p258).

## 12. Order of execution and estimate

1. **HOB** — the pattern library and the default first: every later test prints the pattern's
   name and spacing. Then pick, crossing, MIRROR, render, FILL, grips, palette, file migration.
   The largest block.
2. **HBD** — the trace (duplicates, text islands, on an object, heights and ELEVATION with
   HAT-02, analysis lines, snaps, direct distance).
3. **HAT** — names, Properties' flow and undo, Select objects, transparency, Escape by name, the
   quick preview (on HBD's trace), catalogs, tests.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/draw.md` HATCH: heading with `-HATCH`, `-H`, `-BH`, `-BHATCH`, es `-SOMBREA`;
  Implemented and Missing rewritten from §5–§6; the deviations HATCH-D31, D45 with their WHY.
- `modify.md` (MIRROR, STRETCH, EXPLODE, MATCHPROP lines), `inquiry.md:60`, `properties.md:195`.
- `cad-engine.md` (area hit-test), `cad-tools.md` (HATCH's plane, `wantsSnap()`).
- Catalogs: messages `areaAlreadySpecified`, `pointOnObject`, `unableToHatchBoundary`; es
  `hatchTooDense`; the listing; the pattern descriptions and `interface.hatchPattern` for the new
  patterns; the names of `-HATCH`.
- The roadmap: HATCH `done`, owning the hatch object; the analogues for the reviews that follow.

## 14. Template improvements

- **A command with a ribbon twin** (HATCH and -HATCH, and later others): Escape, the preview and
  the look after a pick are cells under each name (d01 against d02).
- **When MellowProbe will not NETLOAD on the desktop**, AutoCAD's own log reads the history:
  `LOGFILEMODE 1`, put back; the log lands in AutoCAD's working directory, the repo's root, and is
  moved out at once.
- **Objects by handle at an entsel prompt**: `(handent "D8")` typed through COM picks without the
  mouse (MATCHPROP's source and destination, d07).
- **A pattern's geometry, line for line**: EXPLODE the hatch in the console and compare every
  line with the generator's (p300–p307).
