# CIRCLE review

> **Status:** plan, waiting for the owner's approval. Third review of the order in
> `docs/coverage/roadmap.md` ("Command reviews"), with skill `command-review`. Phases 0–4 ran in one
> session (2026-10-21), with three subagents probing the console and two desktop passes with the
> owner's mouse (d01–d15).

## 1. Summary

| Severity | CIR | CTN | COB | CDK | Total |
| -------- | --- | --- | --- | --- | ----- |
| Critical | 0   | 0   | 0   | 0   | 0     |
| High     | 2   | 3   | 0   | 0   | 5     |
| Medium   | 6   | 6   | 4   | 2   | 18    |
| Low      | 2   | 3   | 2   | 3   | 10    |

No finding loses or corrupts a drawing. The five highs are gestures a daily user makes:

- **Tangent circles:** the ribbon's Tan, Tan, Tan (3P with `_TAN` three times) is refused with
  `No found for specified point.` (CTN-01); 2P with two Tangents draws another circle (CTN-02); one
  Tangent or Perpendicular among 2P's or 3P's points gives a circle that is not tangent, silently
  (CTN-05). AutoCAD defers every one of them and solves the circle; nothing here does.
- **The command:** Enter at a prompt with no default ends CIRCLE and drops what was given; AutoCAD
  refuses it in that prompt's words and asks again (CIR-05). A command started from the rail is not
  repeated by Enter and its undo step has no name, LINE's too (CIR-09).

The prompts, keywords, refusals of typed words, CIRCLERAD, LASTPOINT, transparency, undo and the
properties a circle takes (made at the end, with the properties then, p11–p15) match 2027. The
circle object files, picks and snaps as AutoCAD's, but lays its linetype otherwise (COB-01) and puts
its quadrants on the WCS in a rotated UCS (COB-02). The desktop showed the jig in the current colour
with an amber dashed size line, and no chord at 2P or 3P (CDK).

## 2. Inventory

Reviewed on 2026-10-21 over `ab2edeb`, AutoCAD 2027 (ACADVER 26.0, `_VERNUM` X.118.0.0), string
tables regenerated 2026-10-20. Baseline green: typecheck, and the 91 test files of
`cad/application`, `cad/domain`, `cad/scene` and `cad/serialization` (2468 tests).

**The command's own surface:** `cad/application/tools/CircleTool.ts` and what it imports
(`currentProperties.ts`, `threePointPlane.ts`, `coordinateInput.ts`), `circlesTangentToBoth` and
`circleFrom3Points` in `cad/geometry/primitives.ts`; registration in `cad/application/runtimeTools.ts`
(four entries sharing one CIRCLERAD) and `TOOL_COMMANDS` (`cad/application/CommandLine.ts`: CIRCLE,
CIRCLED, CIRCLE2P, CIRCLE3P — the last three this app's own names, unknown to AutoCAD, p21); CIRCLE's
and CIRCLED's names, keywords, `keywordLabels` and prompts in `cad/locales/en.json`, `es.json`,
`ar.json`; the rail's flyout, `content/commands.ts`; the coverage entry in `docs/coverage/draw.md`.
Tests: the CIRCLE parts of `drawing.test.ts`, `lastPoint.test.ts`, `measuredAnswers.test.ts`,
`invalidAnswers.test.ts`, `dynamicInputEnter.test.ts`, `undoCommand.test.ts`, `undoEcho.test.ts`,
`mredoCommand.test.ts`, `englishSurface.test.ts`, `ambiguousKeywords.test.ts`, `elevation.test.ts`,
`tiltedUcs.test.ts`, `currentProperties.test.ts`, `primitives.test.ts`.

**The object:** the circle in the entity modules (`createCircle`, `onPlaneOf`, transforms, bounds,
`closestOnEntity`), its scene and dashes (`cad/application/SceneBuilder.ts`, both presenters, the
plane camera for a tilted one), its grips (`selectToolGrips.ts`, `SelectTool.ts`), its palette rows
(`EngineState.ts`, `runtimeProperties.ts`), its part of `cad/serialization/drawingFile.ts` and the
clipboard, the snaps it offers (`cad/application/snapping/providers.ts`), AREA Object on it.

**Related tools:** U, UNDO, REDO, MREDO after CIRCLE; the current-property commands and `'-COLOR`,
`'CLAYER`, `'ELEVATION` mid-command; LINE's deferred Tangent (`deferredSnap.ts`) as the mechanism a
deferred Tangent at CIRCLE would extend; POLYGON, which shares the `Specify radius of circle` prompt
id; AREA Object; the ribbon's six Circle entries (acad.cuix: `^C^C_circle`, `^C^C_circle \_d`,
`_circle _2p`, `_circle _3p`, `_circle _ttr`, `_circle _3p _tan \_tan \_tan \`).

**Areas this review owns** (roadmap row 3): the circle object (COB) and tangent constructions — Ttr,
TTT, the deferred Tangent and Perpendicular at CIRCLE's prompts and the geometry behind them (CTN).
**Cited from LINE's review** (`git show 16b4188:docs/plans/line-review.md`), only CIRCLE's contract
checked: the command line, point input, object snaps, Ortho, Polar, OTRACK, dynamic input, undo,
current properties, grips, the palette, files, render. **From PLINE's review**
(`git show 84cbabf:docs/plans/pline-review.md`): its analogues (§4.1), run first.

## 3. Probes

Console inputs are `scripts/research/probes/circle/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh circle <ids>` in es-ES and en-US;
the desktop's are `dsk.sh` in the same folder. Transcripts, plots and screenshots are in
`research/probes/circle/` (gitignored). Setup of p01–p10: circle A (0,0) r10, circle B (40,0) r10,
line L (−20,−15)–(60,−15).

| Id | What it asks |
| --- | --- |
| p01, p02 | 3P `_TAN`×3 → (20,−4.5) r10.5; 2P `_TAN` `_TAN` → (10,0) r20 |
| p03, p04, p08, p09, p10 | one Tangent or Perpendicular among 2P's and 3P's points |
| p05, p06, p07 | `_TAN` at the centre (taken), `_TAN` at the radius (the circle tangent to B, r18.2843), `_PER` at the radius (r35) |
| p11–p15 | `'-COLOR`, `'THICKNESS`, `'CLAYER`, `'ELEVATION` mid-CIRCLE: the circle takes them (made at the end) |
| p16, p18, p20 | 2P's second point with a Z or `*`: `Invalid 2D point.` |
| p17, p19 | the radius by a 3D point is its 3D distance (r13); `*20,0` at the radius in UCS Z 30 |
| p21 | `_CIRCLED`, `_CIRCLE2P`, `_CIRCLE3P`: unknown commands |
| p100–p104 | names and aliases (`_C`, `_.CIRCLE`, es `CIRCULO` / `C`), repeat, `'_CIRCLE` at LINE |
| p105–p107, p191, p192 | the ribbon's macros typed: echoes, Enter repeating `CIRCLE` |
| p108–p120 | the centre's, radius's and diameter's answers: `FOO`, `_D`, Enter, `2`, `0`, `-5`, `_3P`, es `D`, CIRCLERAD 0 and 7 |
| p121–p130 | 2P's and 3P's answers: `FOO`, equal and collinear points (`*Invalid*`), Enter at each |
| p131–p134 | `_U` at each prompt; `_LINE` at the radius |
| p135–p149, p163–p168, p172–p179 | point entry: direct distance, `<45`, `@`, `@d<a`, `#`, `*`, LASTPOINT after each prompt, a 2P first point with a Z, a diameter by a 3D point, Ortho with a typed point |
| p150–p156, p169–p171 | overrides at each prompt; `'ZOOM E`, `'-PAN`, `'ORTHOMODE`, `'-OSNAP`, `'LINE` |
| p157–p161, p176, p193 | U, UNDO 2, REDO, MREDO and their echoes (untraced) |
| p162 | CIRCLERAD set by 2P, 3P and the diameter |
| p180–p190 | 3D points at 3P's and 2P's later points, typed (refused) and snapped (flattened) |
| p187, p188 | Ttr's radius in Spanish, `Precise radio del círculo`; POLYGON's `Precise radio de círculo` |
| p194–p196 | Ttr `FOO`; Ortho with a direct distance at 2P and 3P |
| p200–p208 | properties: layer, colours (ACI, true colour), DASHED, lineweight, CELTSCALE, ELEVATION, THICKNESS, rotated and tilted UCS |
| p210–p218 | snaps on a circle: CEN, QUA (and in UCS Z 30), NEA, TAN from a point, INT of two circles |
| p220–p222 | DXF and DWG out and back in; the console's clipboard (none) |
| p230–p233 | plots of DASHED circles of 0.9 to 4.55 periods, a lineweight, a flipped and a tilted circle |
| p240–p242 | MIRROR keeps the normal; AREA Object on a circle, typed point; on a tilted one |
| p300–p310 | Ttr: typed points, the radius's answers, Enter at each prompt, `_TAN` on nothing |
| p311–p329, p378–p380 | Ttr's objects (line, circle, arc as its circle, polyline segment, ellipse, spline, text), which of the fitting circles, heights, UCS Z 30 |
| p330–p337 | TTT, 2P TT, and one Tangent or Perpendicular with points, by pick: the choice rule |
| p338–p347 | Tangent and Perpendicular at the radius, the diameter and the centre (from LASTPOINT) |
| p350–p367 | `_TAN` and `_PER` finding nothing at every point prompt |
| p370–p377 | Tangent on a line at 2P and 3P; Enter with CIRCLERAD 0 at the radius and the diameter |
| d01–d02 | the ribbon's Center, Diameter, 2-Point and 3-Point: echoes; the ghost in CECOLOR, the amber dashed size line; no chord at 2P, nothing after 3P's first point |
| d03–d04 | Tan, Tan, Radius and Tan, Tan, Tan: the Deferred Tangent marker and tooltip, no highlight; `Circle does not exist.`; `Invalid 2D point.` at TTT's third point |
| d05–d07 | dynamic input at the centre and the radius (`• 4.0000` and Diameter in the Down list); the right button's menu at the radius; Ctrl+Z inside CIRCLE |
| d08–d11 | the grips (centre, four quadrants, the radius shown on hover, no menu), a quadrant drag, the palette, a double-click (Quick Properties) |
| d12–d15 | Ortho at the radius but not at 2P's or 3P's picks; Ttr's click on nothing or an ellipse; DASHED circles on screen; grips and a typed radius in UCS Z 30 |

## 4. Matrix

`match` and `untested` cite probe · test; the scratch tests are in `research/review/circle/` (R:
the reviewer's; A, B, C: the subagents'), and move into the command's tests in the execution.

### CIR — the command

| Row | Centre | Radius / diameter | 2P | 3P | Ttr |
| --- | --- | --- | --- | --- | --- |
| A names, aliases, repeat | match · p102, p103 · englishSurface:382; `_C`, `_.CIRCLE` known (command-line.md) | — | — | — | — |
| A rail entries | differs CIR-04, CIR-09 · d01, d02, p191, p192 | | | | |
| A `'CIRCLE` at LINE | match · p104 | | | | |
| B prompt texts en/es | match · p106–p108 · drawing:56 (uncited) | match · p113, p118 | match · p121 | match · p122 | differs CIR-08 (es radius) |
| B keywords g/l | match · p108, p117, p165 | match · p116, p118 | — | — | — |
| B `FOO`, `0`, negative | match · p108, p112 | match · p113 · measuredAnswers:50; diameter untested · p118 | differs CIR-01 (2D words) | differs CIR-01 | match · p301–p303, p308 |
| B Enter, no default | differs CIR-05 · p109 | differs CIR-05 · p114, p119, p376, p377 | differs CIR-05 · p126, p127 | differs CIR-05 · p128–p130 | differs CIR-05 · p306, p309, p310 |
| B Enter with CIRCLERAD | — | match · p115, p120 · dynamicInputEnter:83 | — | — | match · p305 |
| B degenerate | — | — | differs CIR-07 · p123, p164, p166 | differs CIR-07 · p124, p125 | match · p317, p318 (`Circle does not exist.`) |
| C typed forms | match · p139, p168, p174 | match · p140, p141, p163, p173, p179 | differs CIR-01 (`<a`, Z, `*`) · p16, p18, p137 | differs CIR-01 · p180, p181 | — |
| C 3D | owned (elevation) · p147 | differs CIR-02 · p17, p148, p184 | match (flat) · p186, p190 | differs CIR-06 · p185, p189 | differs CTN-13 |
| C LASTPOINT | match · p139 | match · p143, p144, p146 · lastPoint:57 (cites 2023) | match · p138 | untested · p124, p145 | match · p304 |
| D overrides (END, MID, CEN, QUA, INT, NEA) | owned · p169–p171 | owned | owned | owned | — |
| D Tangent, Perpendicular | CTN-04 | CTN-03 | CTN-02, CTN-05 | CTN-01, CTN-05 | CTN-11 |
| D Ortho, a typed point or distance | match · p149, p195, p196 | match · d12 | match | match | — |
| D Ortho, a pick | — | match · d12 | differs CIR-12 · d12 | differs CIR-12 · d12 | — |
| E transparent | match · p152, p156 | match · p153, p155 | match | match | — |
| F U, UNDO, REDO, MREDO | match · p157, p158, p161 · undoEcho (uncited) | | | | |
| F `_U` / Ctrl+Z inside | match · p131 | match · p132, d07 | differs CIR-01 · p133 | differs CIR-01 · d07 | match |
| G another command typed | — | match · p134 | — | — | — |
| G Escape, right button | owned · d06 | | | | |
| H properties, mid-command too | match · p11–p15, p200–p208 · R/analogues | | | | |
| K catalogs | match but CIR-08 · sweep `--from CircleTool.ts` | | | | |
| L history | match but CIR-04, CIR-05, CIR-07, CIR-01 · p105–p107, A/probes | | | | |

### CTN — tangent constructions

| Row | State |
| --- | --- |
| Ttr prompts, radius answers, `Circle does not exist.` and the end | match · p300–p305, p317, p318 · drawing:242, :258 |
| Ttr Enter at the tangents and at the radius with CIRCLERAD 0 | differs CIR-05 · p306, p309, p310 |
| Ttr objects: line (infinite), circle, arc (its circle) | match · p311, p312, p380 |
| Ttr polyline segment | known (Missing) · p313 |
| Ttr ellipse, spline, text | match (refused both) · p314–p316; the coverage's claim is wrong (CTN-14) |
| Ttr which circle | differs CTN-08 · p378, p379 (19 other cases match) |
| Ttr typed `_TAN` and point; a click on nothing or an ellipse | differs CTN-11, CTN-12 · p300, p307, d13 |
| Ttr height | differs CTN-13 · p321, p327–p329 |
| Ttr in UCS Z 30 | match · p326 |
| TTT (3P `_TAN`×3) | differs CTN-01 · p01, p330–p333 |
| 2P TT | differs CTN-02 · p02, p334 |
| one Tangent or Perpendicular with points | differs CTN-05, CTN-06, CTN-07 · p03, p04, p08–p10, p335–p337, p370, p371 |
| the radius: Tangent | differs CTN-03 · p06, p338–p340 |
| the radius and the diameter: Perpendicular; the diameter's Tangent | match · p07, p341, p342 |
| the centre | differs CTN-04 · p05, p343–p347 |
| overrides finding nothing, at every prompt | match (snap words) · p350–p367; the prompt's refusal is CIR-01's at the 2D prompts |

### COB — the circle object

| Row | State |
| --- | --- |
| H layer, ACI and true colour, linetype, lineweight, elevation, thickness, rotated and tilted UCS | match · p200–p208 · B/h |
| H CELTSCALE | known (properties.md) · p200 |
| I grips: centre and four quadrants, no menu, a quadrant drag sets the radius | match · d08, d09 · selection:328 |
| I a value typed with a quadrant grip hot is the radius from the centre | untested · d15 · B/i |
| I grips in UCS Z 30 at the OCS quadrants | untested · d15 |
| I Ortho on a quadrant drag | unverified (COB-04) |
| I the palette's rows and groups | differs COB-06, COB-05 · d10 |
| I double-click | differs CDK-05 · d11 |
| J the drawing file, autosave, clipboard | match · p220, p221 · B/j |
| M dashes | differs COB-01 · p230–p233, d14 |
| M lineweight, tilted outline | owned · match · p230, p233 |
| snaps: CEN, NEA, TAN from a point, INT, CEN of a tilted circle | match · p210, p213–p216 · B/s |
| snaps: QUA in a rotated UCS | differs COB-02 · p212, p217 |
| AREA Object, typed point | differs COB-03 · p241 |
| MIRROR keeps the normal | match · p240 |

### CDK — the desktop

| Row | State |
| --- | --- |
| M the ghost's colour | differs CDK-01 · d01, d02 · R/desk |
| M the radius and diameter line | differs CDK-02 · d01, d05 |
| M 2P's and 3P's chords | differs CDK-03 · d02 |
| P, Q Ttr's pick: marker, tooltip, no highlight | differs CDK-04 · d03, d13 |
| Q Ttr's radius: nothing drawn | match · d03 · R/desk |
| P right button at the radius | owned (workspace.md Missing: Recent Input, Pan, Zoom, SteeringWheels, QuickCalc) · d06 |
| D dynamic input at the centre and radius | owned · d05 |

## 5. Findings

### High

#### CIR-05 — Enter at a prompt with no default ends CIRCLE; AutoCAD refuses it in the prompt's words and asks again

- **Severity:** high · **Row:** B, G · **Status:** verified (reviewer, R/verify)
- **Where:** `CircleTool.ts:604-616` (`openPointInput`'s `commitRaw`), `:656-666` and `:677-685`
  (the radius's with CIRCLERAD 0), `:270` (Ttr's empty session)
- **AutoCAD:** every prompt is `AllowNone:false` (traced). Centre `Point or option keyword required.`
  (p109; es `Se requiere un punto o una opción.`); radius with CIRCLERAD 0
  `Requires numeric radius, point on circumference, or "D".` (p114, p376); diameter
  `Requires numeric distance or second point.` (p119, p377); 2P's and 3P's first point
  `Invalid point.` (p126, p128), their later points `Invalid 2D point.` (p127, p129, p130); Ttr's
  tangents `Requires a TAN object-snap and selection of Circle, Arc, or Line.` (p309, p310); Ttr's
  radius `Requires numeric distance or two points.` (p306). Each asks the prompt again.
- **mellowcad:** each ends the command, silently; the centre or the points given are lost.
  `dynamicInputEnter.test.ts:76-81` pins it.
- **Scenario:** the session's first CIRCLE, a centre picked, Enter → mellowcad is back at
  `Command:`; AutoCAD asks the radius again.
- **Fix:** each `commitRaw` and Ttr's session refuse on empty text in the prompt's words (LINE's
  `refuseNoLength` pattern). · **Alternative:** a `takes()` refusal the runtime writes on Enter.
- **Regression test:** `dynamicInputEnter.test.ts` (replacing :76-81) and `drawing.test.ts`, each
  prompt in en and es, citing p109, p114, p119, p126–p130, p306, p309, p310.
- **Coverage:** draw.md CIRCLE: "none at first, when Enter ends the command" becomes the refusal.
  CTN-09 and CTN-10 were merged into this finding.

#### CIR-09 — a command started from the rail is not repeated by Enter, and its undo step has no name

- **Severity:** high · **Row:** A, F, L (the command line, LINE's area) · **Status:** verified
  (reviewer, R/verify: LINE too)
- **Where:** `cad/application/CadRuntime.ts`, `setActiveTool`: it writes `_circle2p` but neither
  pushes the command into the repeat history nor names the step, as `runCommand` does
- **AutoCAD:** the ribbon runs `^C^C_circle…`; Enter after it starts `CIRCLE` again (p191, p192);
  U writes `CIRCLE` (p159), `UNDO 2` `CIRCLE CIRCLE` (p158).
- **mellowcad:** after `tool("circle2p")` and two picks, Enter does nothing; U writes `U` alone.
  The same after the rail's Line.
- **Scenario:** a circle from the rail, then Space for the next: nothing happens.
- **Fix:** a rail start is a command run: push the global name and name the step; the circle
  entries push and name `CIRCLE` (their macros run `_circle`). · **Alternative:** each entry's
  own name (no AutoCAD source).
- **Regression test:** `undoEcho.test.ts` (rail 2P, U → `CIRCLE`, p159); `CadRuntime.test.ts`
  (rail start, Enter → `CIRCLE` at the centre, p192); the same for the rail's Line.
- **Coverage:** command-line.md (the rail's echo and repeat); a finding in LINE's area, noted there.

#### CTN-01 — 3P with three Tangents (the ribbon's Tan, Tan, Tan) is refused

- **Severity:** high · **Row:** D · **Status:** verified (reviewer, R/analogues)
- **Where:** `CircleTool.ts:324-399` (no deferral); `CadRuntime.ts` `overrideMissed`
- **AutoCAD:** p01: (20,−4.5) r10.5; eighteen cases (T2 below), lines and circles, pick order
  irrelevant; d04 the ribbon's macro, `Circle does not exist.` when no circle fits.
- **mellowcad:** `No found for specified point.` `Invalid point.` at the third Tangent, no circle.
- **Scenario:** Tan, Tan, Tan on two holes and an edge → refused.
- **Fix:** CircleTool defers Tangent and Perpendicular at 2P's and 3P's points and solves the
  circle at the last point (CIRCLE-D31): a pure Apollonius solver in `cad/geometry/` over the
  2³ sign sets, a point a circle of radius 0, a line `n·c + d = ±r`; the solution chosen by
  CIRCLE-D30. None fits: `Circle does not exist.` and the end (d04).
- **Regression test:** `drawing.test.ts`: p01, p330a, p331a, p332a (three lines: the incircle),
  p333a, p333b; `primitives.test.ts` for the solver (every result tangent, the count).

**T2, TTT.** A, B, L as p01; T, a triangle (0,0), (60,0), (30,40); C3, three circles.

| Probe | Picks | AutoCAD |
| --- | --- | --- |
| p01 | A (0,10), B (40,10), L (20,−15) | (20,−4.5) r10.5 |
| p330a | A (0,−10), B (40,−10), L | (20,37.5) r52.5 |
| p330d | A (−10,0), B (30,0), L | (9.3649,6.2702) r21.2702 |
| p331a | A (0,10), B (40,10), L (−15,−15) | (−29.3649,83.7298) r98.7298 |
| p331c | L first, then A, B | (20,−4.5) r10.5 |
| p332a | T, mid-sides | (30,15) r15 |
| p332b | T, on the sides' extensions | (−20,40) r40 |
| p333a / p333b | C3, inward / outward picks | (20,8.3333) r11.6667 / r31.6667 |

#### CTN-02 — 2P with two Tangents draws another circle

- **Severity:** high · **Row:** D · **Status:** verified (reviewer, R/analogues)
- **AutoCAD:** each end is where the line of the two centres crosses its circle, the crossing
  nearer the pick (p02 (10,0) r20, p334: T3); a line gives the foot of the perpendicular from the
  other centre (p374 (0,−12.5) r2.5).
- **mellowcad:** p02 → (20,10) r20; p334c (20,0) r10 → (23.09,8.52) r16.08; p374 refused.
- **Fix, test:** CTN-01's deferral; `drawing.test.ts` p334a–d, p374.

**T3, 2P TT** (A, B as p01): p334a (−7.07,7.07), (32.93,7.07) → (10,0) r20; p334b (7.07,7.07),
(47.07,7.07) → (30,0) r20; p334c (7.07,7.07), (32.93,7.07) → (20,0) r10; p334d (−7.07,7.07),
(47.07,7.07) → (20,0) r30.

#### CTN-05 — one Tangent or Perpendicular among 2P's or 3P's points gives a circle that is not tangent

- **Severity:** high · **Row:** D · **Status:** verified (reviewer p04; subagent C, T4)
- **Where:** `CircleTool.ts:324-364`; `CadRuntime.ts` `overrideMissed` (`defersSnap` absent counts
  as true, so a first point's Tangent is let through and the raw pick taken); `getConstraintAnchor`
  (`:410`) turns a later point's into an ordinary snap from p1 or p2
- **AutoCAD (T4):** p08 2P Tangent A then (60,20) → (34.7434,11.5811) r26.6228; p09 2P (20,20) then
  Tangent B → (26.4645,13.5355) r9.1421; p03 3P Tangent A, (60,20), (70,0) → (29.8824,−7.5588)
  r40.8235; p04 3P (20,20), (25,25), Tangent B → (28.8404,16.1596) r9.6385; p336 Tangent A,
  Tangent B, (20,30) in any order → (20,15) r15; p337d 3P Perpendicular L, (0,20), (40,20) →
  (20,−15) r40.3113 (the centre on L); p10 Perpendicular L, Tangent A, Tangent B → (20,−15) r35.
- **mellowcad:** p08 (30,15) r30.41; p09 (32.06,14.56) r13.23; p03 (33.46,−5.77) r36.99; p04
  (32.5,12.5) r14.58; p336 (20,10) r20; p337d (20,8.21) r23.21; p10 (24.63,0.79) r16.46.
- **Scenario:** 3P, a Tangent to a hole and two points → a circle through the raw pick, not tangent;
  nothing says so.
- **Fix, test:** CTN-01's deferral (a point a constraint too); `drawing.test.ts` p03, p04, p08, p09,
  p10, p336a, p337d.

### Medium

#### CIR-01 — 2P's second point and 3P's later points are 2D prompts in AutoCAD

- **Severity:** medium · **Row:** B, C, F · **Status:** verified (R/analogues, A/probes)
- **Where:** `CircleTool.ts:229-244` (`takes()` null at p2 and p3)
- **AutoCAD:** `10,0,5`, `@10,0,5`, `*20,0`, `<45`, `FOO`, `_U` → `Invalid 2D point.` (es
  `Punto 2D no válido.`), asked again (p16, p18, p20, p121, p122, p132, p133, p137, p180, p181).
- **mellowcad:** a Z or `*` taken (2P draws the circle); `FOO` and `_U` say `Invalid point.`;
  `<45` gives `Angle Override: 45`.
- **Fix:** `takes()` "point2d" at p2 and p3; the shared point2d path refuses `<a` too (p137 is its
  only evidence; ARC's, PLINE's, ELLIPSE's 2D prompts take the same path).
- **Regression test:** `invalidAnswers.test.ts` (p122, p137, en and es); `drawing.test.ts` p16.
- **Coverage:** command-line.md's list of 2D prompts gains CIRCLE's. CIR-10 merged here.

#### CIR-02 — a radius or diameter given by a point at another height is measured in plan

- **Severity:** medium · **Row:** C · **Status:** verified (R/analogues)
- **Where:** `CircleTool.ts:303`, `:489`, `:498` (`V.distance`, 2D)
- **AutoCAD:** centre 0,0,0, `3,4,12` → r13 (p17, `Only2d:false`); the diameter by `3,4,12` → r6.5
  (p148); `_END` on a point at Z 5 → r11.18 (p184).
- **mellowcad:** r5, r2.5, r10.
- **Fix:** the 3D distance from the centre at the radius and the diameter (the rubber band too).
- **Regression test:** `measuredAnswers.test.ts`: p17, p148, p184.

#### CIR-04 — the rail's Center, Diameter, 2-Point and 3-Point echo names AutoCAD does not have

- **Severity:** medium · **Row:** A, L · **Status:** verified (d01, d02, p105–p107)
- **AutoCAD:** `Command: _circle`, then the macro's answer on the prompt's line:
  `Specify radius of circle or [Diameter]: _d Specify diameter of circle:` (d01),
  `… [3P/2P/Ttr (tan tan radius)]: _3p Specify first point on circle:` (d02), `_2p` and `_ttr` alike.
- **mellowcad:** `_circled` and then `Specify diameter of circle:` (R/analogues p21), `_circle2p`.
- **Fix:** the rail's circle entries run AutoCAD's macros (CIRCLE-D1): `_circle`, and the mode's
  keyword answered at its prompt. CIRCLED, CIRCLE2P and CIRCLE3P stay typable (CIRCLE-D2).
- **Regression test:** `drawing.test.ts`: each entry's log (d01, d02).
- **Coverage:** command-line.md: the rail's circle modes echo as the ribbon's.

#### CIR-06 — 3P through points at different heights is tilted here; AutoCAD draws it flat in the first point's plane

- **Severity:** medium · **Row:** C, H · **Status:** verified (A/more)
- **Where:** `CircleTool.ts:747-766` (`planeThrough`)
- **AutoCAD:** a typed Z at 3P's later points is refused (p180, p181); snapped 3D points come back
  with Z 0 (the trace), the circle at the first point's Z, normal +Z (p185, p189: (5,5,5) r7.0711).
- **mellowcad:** p189 → elevation 4.472, normal (0,0.447,0.894), r7.5.
- **Fix:** the later points' X and Y in the first point's plane, as 2P (CIRCLE-D12).
- **Regression test:** `tiltedUcs.test.ts:457` and `elevation.test.ts` replaced: p189.
- **Coverage:** draw.md: "3P … lies in the plane of the three" removed.

#### CIR-07 — a 2P or 3P that makes no circle stays silently at the prompt; AutoCAD writes `*Invalid*` and ends

- **Severity:** medium · **Row:** B, G, L · **Status:** verified (A/probes)
- **Where:** `CircleTool.ts:513-525`, `:588`
- **AutoCAD:** equal points, `@`, `0`, collinear points → `*Invalid*` (es `*No válido*`) and
  `Command:`; LASTPOINT the last point given (p123–p125, p136, p164, p166).
- **mellowcad:** the prompt again, no word; `drawing.test.ts:168-175` pins it.
- **Fix:** report `*Invalid*` and end; LASTPOINT stays the runtime's.
- **Regression test:** `drawing.test.ts` replacing :168 (p123, p124).

#### CIR-12 — Ortho bends 2P's and 3P's later picks; AutoCAD's have no base point

- **Severity:** medium · **Row:** D, modes · **Status:** verified (d12; R/ortho)
- **Where:** `CircleTool.ts:410-421` (`getConstraintAnchor` at p2 and p3)
- **AutoCAD:** 2P's and 3P's later prompts are `UseBasePoint:false` (trace); with Ortho on, 2P
  (40,10) then a pick at (55,18) → (47.52,14.01) r8.48, unbent; 3P likewise; the radius's pick is
  bent (r 5.99 for (26,43) from (20,40)) (d12).
- **mellowcad:** 2P → (47.5,10) r7.5; 3P bent; the radius matches.
- **Fix:** no anchor at p2 and p3 (Polar and OTRACK's guides follow). A direct distance there is
  already unconstrained in both (p195, p196): it reads LASTPOINT.
- **Regression test:** `drawing.test.ts`: F8, the d12 picks.

#### CTN-03 — a Tangent at the radius measures to the tangent line's touch; AutoCAD makes the circle tangent to the object

- **Severity:** medium · **Row:** D · **Status:** verified (R/analogues)
- **AutoCAD:** to a circle or an arc (its circle), the radial point nearer the pick: centre (20,20),
  Tangent B → r18.2843 (p06), the far side r38.2843 (p338a), a centre inside the circle r8 or r12
  (p338b, c), an arc r38.2843 (p340); to a line, the distance r35 (p339). The diameter keeps the
  ordinary snaps (p342), the Perpendicular matches (p07, p341).
- **mellowcad:** p06 r26.4575; a line or the centre inside refused.
- **Fix:** CIRCLE-D33 at the radius only. **Regression test:** `drawing.test.ts` p06, p338a, p339.

#### CTN-06 — a Tangent on a line at 2P's or 3P's points is refused

- **Severity:** medium · **Row:** D · **Status:** verified (C/ctn)
- **Where:** `cad/application/tools/deferredSnap.ts:43-50` (a circle or an arc only)
- **AutoCAD:** p370 2P Tangent L then (60,20) → (60,2.5) r17.5; p371 3P → (65,2.8571) r17.8571;
  p332 TTT on three lines.
- **Fix:** CIRCLE's deferral takes a line (CIRCLE-D31). **Regression test:** p370, p371.

#### CTN-08 — Ttr chooses among the fitting circles by the sum of distances; AutoCAD by the sum of squares

- **Severity:** medium · **Row:** D (Ttr) · **Status:** verified (C/ctn2)
- **Where:** `CircleTool.ts:554-558` (`reach`)
- **AutoCAD:** p378c (overlapping circles (0,0) r10 and (15,0) r10, picks (9.682,2.5), (25,0), r2)
  → (10.16667,6.37486); p379b → (3.5,6.06218); p379c → (7.5,−14.13329). The squared sum fits all
  45 cases without a tie (Ttr, TTT, 2P TT); ties fall either way and are left out of tests.
- **mellowcad:** (7.5,2.78388), (3.5,−6.06218), (−0.5,−3.96863).
- **Fix:** `reach` squared (CIRCLE-D30). **Regression test:** p378c, p379b, p379c.

#### CTN-11 — Ttr's prompts refuse a typed `_TAN` and point

- **Severity:** medium · **Row:** C, D (Ttr) · **Status:** verified (C/ctn)
- **Where:** `CircleTool.ts:286-292` (`wantsSnap` false), so `pointModifier` never runs
- **AutoCAD:** `_TAN` then `0,10` picks the object there (p300, p307, p321).
- **mellowcad:** `TAN` → `Requires a TAN…`; the typed point refused.
- **Fix:** the tangent prompts take an override and a typed point as a pick (CIRCLE-D36).
- **Regression test:** `drawing.test.ts` p300.

#### CTN-12 — Ttr's other refusal: a typed point, a click on nothing or on an ellipse

- **Severity:** medium · **Row:** B, P (Ttr) · **Status:** verified (p300, p314, d13)
- **AutoCAD:** table 20418 `*Requires a TAN object-snap and selection of Circle, Arc, or Line.`
  (es `*Necesita una referencia a un objeto tangente y que se designe un círculo, arco o línea.`)
  after a typed point, a `_PER`, a Tangent on an ellipse or spline (p300, p314, p315, p373) and a
  click on nothing or on an ellipse (d13); table 26317 (no `*`) after `FOO`, Enter and a Tangent
  finding nothing (p307–p309).
- **mellowcad:** the plain form after a typed point; a click on nothing or an ellipse says nothing.
- **Fix:** a catalog key for 20418 (CIRCLE-D35), said at those answers.
- **Regression test:** `invalidAnswers.test.ts` p300 en and es; `drawing.test.ts` a click on nothing.

#### CTN-14 — the coverage entry misstates Ttr and leaves out the deferred cases

- **Severity:** medium · **Row:** O · **Status:** verified
- **Where:** `docs/coverage/draw.md`, CIRCLE
- Missing lists "Ttr on … ellipses and splines" (AutoCAD refuses them, p314, p315); "at the height
  of the first pick's drawing plane" (CTN-13); "when Enter ends the command" (CIR-05); nothing on
  2P's or 3P's Tangents, the radius's Tangent or the centre's.
- **Fix:** CIRCLE-D38, with the execution's other coverage changes (§13).

#### COB-01 — a circle's linetype is laid from screen east, clockwise and not fitted; AutoCAD lays it from its start, counter-clockwise, in whole stretched periods

- **Severity:** medium · **Row:** M · **Status:** verified (plots p230–p233; screen d14)
- **Where:** `SceneBuilder.ts:879-899` (a plain circle primitive), `:1498-1510` (`dashFor`);
  `cad/adapters/CanvasScenePresenter.ts:76`, `cad/adapters/SvgScenePresenter.ts:176-184`;
  `cad/application/planeCamera.ts:126-135` (a tilted one's dashes in screen pixels)
- **AutoCAD:** from the StartPoint (OCS X), counter-clockwise about the normal, a dash first; n =
  max(2, round(L/P)) periods stretched to fit; under one period solid (k 0.98 solid, 1.4 two, 2.6
  three; p231, p232, d14). A −Z circle runs clockwise in plan from 180°; a tilted one at true length
  in its plane (p233).
- **mellowcad:** r10 DASHED → `[423.33, 211.67]` unscaled, 3.3 periods, from 3 o'clock clockwise;
  k 0.98 a 115° gap (B/m).
- **Fix:** the circle's dashes computed in world units in SceneBuilder, as arcs or elliptical arcs
  (CIRCLE-D20; LINE's RND-02 for lines, PLINE's POB-02 for polylines).
- **Regression test:** `SceneBuilder.test.ts`: p230, p231, p232, p233 cases.
- **Coverage:** properties.md Linetypes: the **unverified** note becomes the rule. Analogue for
  ARC's review.

#### COB-02 — a Quadrant snap in a rotated UCS takes the WCS quadrants; AutoCAD's are along the UCS

- **Severity:** medium · **Row:** snaps on the object · **Status:** verified (B/s)
- **Where:** `cad/application/snapping/providers.ts:273-283`
- **AutoCAD:** UCS Z 30, `_QUA 9.9,0` → (8.660254,5) (p212); `0,9.9` → (−5,8.660254) (p217). The
  grips stay at the OCS quadrants (d15): only the snap turns.
- **mellowcad:** (10,0) and (0,10).
- **Fix:** for a circle parallel to the UCS's XY, the quadrants at the UCS X's angle + k·90°
  (CIRCLE-D21). **Regression test:** `providers.test.ts` p212, p217.
- **Coverage:** drafting-aids.md Object snaps. Analogue for ARC.

#### COB-03 — AREA Object refuses a point typed at `Select objects:`

- **Severity:** medium · **Row:** O · **Status:** verified (B/a)
- **Where:** `cad/application/tools/MeasureTool.ts:526` (`"objectOrLast"`)
- **AutoCAD:** `10,0` on a circle r10 → `Area = 314.1593, Circumference = 62.8319` (p241).
- **mellowcad:** `*Invalid selection*`, `Expects a point or Last` — though a point was given.
- **Fix:** handed to the Inquiry review (CIRCLE-D6), with p241: the fix is the shared
  `objectOrLast` prompt, which DIMSPACE and TEXTEDIT ask too.

#### COB-06 — a circle's palette splits Center into a group of its own; AutoCAD's one Geometry group starts with it

- **Severity:** medium · **Row:** I, Q · **Status:** verified (d10, B/i)
- **Where:** `EngineState.ts` (singleEntityInfo, the circle's rows)
- **AutoCAD:** Geometry: Center X, Center Y, Center Z, Radius, Diameter, Circumference, Area,
  Normal X, Normal Y, Normal Z (the last three greyed) (d10).
- **mellowcad:** Geometry: Radius, Diameter, Circumference, Area, Normal X/Y/Z; then Center: X, Y, Z.
- **Fix:** one group in AutoCAD's order, labels `Center X`… (es from the help page's GUID, the
  desktop's Spanish **unverified**, as PLINE's). **Regression test:** `palettePanel.test.ts`.

#### CDK-01 — the ghost and the rubber band are the theme's colour; AutoCAD's are the current colour

- **Severity:** medium · **Row:** M, Q · **Status:** verified (d01, d02; R/desk)
- **Where:** `CircleTool.ts:425` (`THEME.rubberBand`)
- **AutoCAD:** CECOLOR red: the ghost circle red at every mode (d01, d02, d05).
- **Fix:** `currentColor(ctx)`, as LINE's and PLINE's (CIRCLE-D4). **Regression test:**
  `drawing.test.ts` with `-COLOR 1`, the ghost's stroke.

#### CDK-04 — Ttr's pick highlights the object; AutoCAD shows the Deferred Tangent marker and tooltip

- **Severity:** medium · **Row:** P, Q · **Status:** verified (d03, d13; R/desk)
- **Where:** `CircleTool.ts:460-469`
- **AutoCAD:** over a line or a circle, the green deferred-tangent glyph with `Deferred Tangent`,
  the object not highlighted (d03); over an ellipse the plain Tangent marker (d13).
- **Fix:** CIRCLE-D5: the marker and tooltip at Ttr's prompts and at a deferred Tangent of 2P and 3P
  (LINE's Missing "the deferred marker and its tooltip" closes with it). **Regression test:** the
  scene at Ttr's prompt over a line holds the deferred marker, no highlight.

### Low

#### CIR-08 — Ttr's radius in Spanish is `Precise radio del círculo`; this app uses POLYGON's wording

- **Severity:** low · **Row:** K · **Status:** verified (p187, p188, p300; A/more)
- **Where:** `CircleTool.ts:221` (`specifyRadiusOfCircle`, POLYGON's too)
- **Fix:** a prompt id of its own for Ttr (table 20419), CIRCLE-D13. CTN-15 merged here.

#### CIR-11 — the WHY and the Missing item on 2P at different heights are stale

- **Severity:** low · **Row:** O · **Status:** verified (p147, p186, p190)
- **Where:** `CircleTool.ts:729-731`; draw.md Missing. AutoCAD flattens 2P's second point into the
  first's plane and refuses a typed Z (p16): mellowcad matches. **Fix:** cite p190, move to
  Implemented (CIRCLE-D15).

#### CTN-04 — a Tangent or Perpendicular at the centre is measured from LASTPOINT in AutoCAD

- **Severity:** low · **Row:** D · **Status:** verified (C/ctn)
- **AutoCAD:** LASTPOINT (60,−15), `_TAN` to A at (0,10) → centre (3.9621,9.1816) (p343, p05);
  other LASTPOINTs p344, p346, p347; `_PER` L → (60,−15) (p345).
- **mellowcad:** the raw pick (0,10); (20,−15).
- **Fix:** CIRCLE-D32. **Regression test:** p343, p345.

#### CTN-07 — a Perpendicular on a circle at 3P's first point is taken; AutoCAD refuses it

- **Severity:** low · **Row:** D · **Status:** verified (p337f)
- **AutoCAD:** `No Perpendicular found for specified point.` `Invalid point.`; 2P's first point
  takes it (p335e). **Fix:** in CIRCLE's deferral.

#### CTN-13 — Ttr's circle takes the current elevation; AutoCAD the objects' common height

- **Severity:** low · **Row:** H · **Status:** verified (C/ctn2)
- **Where:** `CircleTool.ts:560`
- **AutoCAD:** objects at Z 3 → Z 3 (p327); at Z 0 with ELEVATION 5 → Z 0 (p321); at Z 3 and 7 → the
  elevation (p328, p329). **Fix:** CIRCLE-D34.

#### COB-04 — Grips' Missing lists an Ortho-aware radius drag that already works

- **Severity:** low · **Row:** I · **Status:** unverified on AutoCAD's side
- **Where:** `docs/coverage/drafting-aids.md:270`. **Fix:** reword it as **unverified**.

#### COB-05 — Circumference and Area are read-only here; AutoCAD edits them

- **Severity:** low · **Row:** I · **Status:** verified (d10: not greyed, Normal greyed)
- **Fix:** both editable, setting the radius (`applyEntityProperty`); properties.md's Missing
  "Area/Circumference rows" goes. With COB-06.

#### CDK-02 — the radius and diameter line is solid; AutoCAD's is amber and dashed

- **Severity:** low · **Row:** M · **Status:** verified (d01, d05; trace `UseDashedLine:true`)
- **Fix:** `THEME.dashedRubberBand`, dashed, as PLINE's chord. With CDK-01.

#### CDK-03 — 2P and 3P draw a chord AutoCAD does not

- **Severity:** low · **Row:** M · **Status:** verified (d02; R/desk)
- **Where:** `CircleTool.ts:449-455`
- **AutoCAD:** 2P only the ghost circle; 3P nothing after the first point, then the ghost.
- **Fix:** the chord removed.

#### CDK-05 — a double-click on a circle opens Quick Properties in AutoCAD

- **Severity:** low · **Row:** I · **Status:** verified (d11)
- **Fix:** to draw.md's Missing (Quick Properties is workspace.md's Missing), CIRCLE-D8.

## 6. Decisions taken

| Id | Decision | Why |
| --- | --- | --- |
| CIRCLE-D1 | the rail's circle entries echo and answer as the ribbon's macros (`_circle`, `_d`, `_2p`, `_3p`) | d01, d02: what an AutoCAD user reads |
| CIRCLE-D2 | CIRCLED, CIRCLE2P, CIRCLE3P stay typable, with the WHY in `CommandLine.ts` | removing a name is a major version (`cad/README.md`); typing them breaks nothing |
| CIRCLE-D3 | CIR-09 is fixed in the runtime for every rail entry, LINE's too | one cause, the command line's |
| CIRCLE-D4 | the ghost in `currentColor`, the size line `THEME.dashedRubberBand` dashed | LINE's and PLINE's jig, d01 |
| CIRCLE-D5 | the deferred-tangent marker and tooltip at Ttr's prompts and a deferred Tangent | d03; the marker is OSN's glyph set |
| CIRCLE-D6 | COB-03 handed to the Inquiry review, not fixed here | its fix is the shared `objectOrLast` prompt |
| CIRCLE-D7 | the palette's one Geometry group in d10's order, Circumference and Area editable | d10 |
| CIRCLE-D8 | the double-click's Quick Properties to Missing | a palette of its own, workspace.md's |
| CIRCLE-D10 | Enter with no default refused in each prompt's words | p109–p130 |
| CIRCLE-D11 | a degenerate 2P or 3P writes `*Invalid*` and ends | p123, p124 |
| CIRCLE-D12 | 2P's and 3P's later points in the first point's plane; `planeThrough` leaves CircleTool | p185, p189, p190 |
| CIRCLE-D13 | Ttr's radius gets a prompt id of its own | `cad-catalogs.md`: two wordings, two ids |
| CIRCLE-D14 | a rail start repeats and names its step by the global command (`CIRCLE`) | p159, p191, p192 |
| CIRCLE-D15 | 2P's Missing item to Implemented, the WHY citing p190 | settled |
| CIRCLE-D20 | a circle's dashes in world units in SceneBuilder | covers tilted circles, both presenters alike |
| CIRCLE-D21 | quadrants along the UCS for a circle parallel to its XY, the OCS's otherwise (**unverified**) | p212; the tilted case unprobed |
| CIRCLE-D22 | a shared fix for `objectOrLast` (the Inquiry review's) | DIMSPACE, TEXTEDIT ask it |
| CIRCLE-D23 | a `circleFiles.test.ts` beside LINE's `lineFiles.test.ts` | B/j, p220, p221 |
| CIRCLE-D30 | every tangent construction takes the solution with the least Σ\|touch − pick\|² | 45 cases fit; ties left to the kernel's order |
| CIRCLE-D31 | 2P's and 3P's deferral in CircleTool over a pure Apollonius solver in `cad/geometry/` | LINE's `deferredPair` yields a line, not a circle |
| CIRCLE-D32 | the centre's Tangent and Perpendicular measured from LASTPOINT, the answer nearer the pick | p343–p347 |
| CIRCLE-D33 | the radius's Tangent: the circle tangent to the object; on a line its distance | p06, p338–p340 |
| CIRCLE-D34 | Ttr's height: the objects' common Z, else the elevation | p321, p327–p329 |
| CIRCLE-D35 | a catalog key for table 20418, the starred refusal | p300, d13 |
| CIRCLE-D36 | Ttr's prompts take an override and a typed point | p300 |
| CIRCLE-D37 | Enter with CIRCLERAD 0 refused at all three radius prompts | p306, p376, p377 |
| CIRCLE-D38 | the coverage rewrite of §13 | CTN-14 |

(D9, D16–D19, D24–D29, D39 not used. D24 of the subagent, keep the palette until the desktop
answered, is superseded by d10 and D7.)

## 7. Tests proposed

Regression tests are in each finding. Untested cells to pin, by file:

- `drawing.test.ts`: the diameter's `0` and negative (p118); CIRCLERAD set by 2P, 3P and the
  diameter (p162); the prompts and log of :56-74 citing p106, p115, p120; Ttr's choice with a case
  that separates sum from squared sum (p378c), Spanish `Circle does not exist.` (p317).
- `lastPoint.test.ts:57-66`: re-cite p143, p144, p138 (2023's console now); 3P's third (p145).
- `measuredAnswers.test.ts:22-64`: re-cite p113, p163, p140.
- `invalidAnswers.test.ts:133-157`: cite p113, p118, p194.
- `ambiguousKeywords.test.ts:126`: assert the radius prompt after `2` (p112), not a `not.toContain`.
- `selection.test.ts`: a typed radius with a quadrant grip hot (d15).
- `drawingFile.test.ts`: a tilted circle round-trips (p221).
- `primitives.test.ts`: `circlesTangentToBoth` on overlapping circles (p378) and r = R; the
  Apollonius solver.
- `tiltedUcs.test.ts`, `objectArea.test.ts`: cite p205, p207, p241.

## 8. What is not tested, and why

The dynamic-input boxes at the radius (the aligned dimension, d05) and the grip's hover dimension
(d08): LINE's dynamic input and grips, presentation. The right button's menu entries this app does
not have (d06): workspace.md's Missing.

## 9. What could not be reviewed, and why

- AutoCAD's Spanish desktop: the launched instance opened the English profile both times, so the
  palette's and Quick Properties' Spanish labels and PLINE's pending desktop items
  (`docs/plans/pline-review.md`, "Still open") stay open.
- Escape and U after it: the console has no Escape (p193 inconclusive); the desktop's `*Cancel*`
  matches (d02, d07).
- Ctrl+Z at the radius on the desktop with DYNMODE 3 wrote
  `Requires numeric distance, second point, or option keyword.` (d07) where the console writes the
  radius's own words (p132): whether dynamic input changes the refusal is **unverified**.
- TTT when nothing fits beyond d04's single case; TTT and the deferral at mixed heights; a Quadrant
  on a tilted circle or under a tilted UCS; the clipboard on AutoCAD's side (none in the console).
- A Z or `#` typed in the dynamic-input box at CIRCLE's 2D prompts.

## 10. Refuted in the adversarial pass

| Suspicion | Why refuted |
| --- | --- |
| CIR-03: `'THICKNESS` mid-CIRCLE refused | THICKNESS is no command here at all: the Workspace review's (system variables typed) |
| properties set mid-command should be the start's (PLN-06's analogue) | AutoCAD makes the circle at the end, with the properties then (p11–p15); mellowcad matches |
| CTN-04 "the centre prompt is left pending" | the centre is taken at the raw pick (C/ctn2); the finding was reworded |
| ties in Ttr's and 2P's choice | AutoCAD's pick among equal solutions is not consistent (p323, p324, p378e) |
| Ttr on ellipses and splines as a gap | AutoCAD refuses them (p314, p315) |
| NEA finding nothing | the harness's 1000×800 view against the console's; matches at 942×534 (p218) |
| a tilted circle's bounds | picks, windows and ZOOM E go through the plane camera and match |
| `2`, `3` as keyword abbreviations | direct distances in both (p112) |
| Ortho on a direct distance at 2P and 3P | AutoCAD ignores it too (p195, p196) |
| the grips turning with a rotated UCS | they stay at the OCS quadrants (d15), as here |

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

Rows that do not hold:

| Claim | Probe | State |
| --- | --- | --- |
| draw.md: Enter at the radius with CIRCLERAD 0 ends the command | p114, p376 | false (CIR-05) |
| draw.md: 3P in the plane of the three | p181, p189 | no longer true in 2027 (CIR-06) |
| draw.md: Ttr at the first pick's height | p321, p327 | false (CTN-13) |
| draw.md Missing: Ttr on ellipses and splines; Ttt | p314, p315; p01 | false; Ttt false (CTN-01: built in the execution) |
| draw.md Missing: 2P at different heights **unverified** | p190 | settled (CIR-11) |
| properties.md Missing: Area/Circumference rows | d10 | false as worded (COB-05) |
| properties.md Linetypes **unverified**: a pattern round a circle | p230–p233 | settled, and differs (COB-01) |
| drafting-aids.md Grips Missing: Ortho on the radius drag | B/i | false as worded (COB-04) |
| command-line.md: the rail's modes echoed by this app's names | d01, d02 | changes (CIR-04) |
| `cad-tools.md` (What a new object wears): a command adding its object at its end wears its start's properties (PLINE) | p11–p15 | holds for PLINE; CIRCLE takes the end's, as AutoCAD: the rule gains the distinction |
| `cad-runtime.md` (Snapping): a Tangent with no base is let through unless `defersSnap()` says false | C/ctn trace | holds, but a tool without `defersSnap` lets it through and takes the raw pick: the rule names the default |

Checked and holding: the coverage's prompts, keywords, CIRCLERAD, the 0-or-less refusal, digits as
capitals, the plane of the centre and of 2P's first point, THICKNESS, Ttr's objects and its
`Circle does not exist.`; the rules' every-mutation-through-a-Command (`AddEntityCommand`, the
grip's and the palette's commands), one undo step, preview equals commit, `entityScenePrimitive`
for the ghosts, a fixed preview id, `ctx.pick`, the parameterised class with a private `active`.

## 12. Order of execution and estimate

| # | Block | Findings | Estimate | Blocks |
| --- | --- | --- | --- | --- |
| 1 | CIR | CIR-01, 02, 04, 05, 06, 07, 08, 09, 11, 12 | 3 h | — |
| 2 | CTN | CTN-01 to 08, 11 to 14 | 5 h (the solver) | CIR (the 2D prompts, Enter, the anchor) |
| 3 | COB | COB-01, 02, 04, 05, 06 (COB-03 handed over) | 3 h | — |
| 4 | CDK | CDK-01 to 05 | 2 h | CTN (the deferred marker) |

No desktop is needed in the execution.

## 13. Changes to coverage, rules, catalogs and roadmap

- draw.md CIRCLE: rewritten from the probes (CIR-05, CIR-06, CIR-11, CTN-01 to CTN-14); Missing
  gains the rail's Tan, Tan, Tan entry, Quick Properties on a double-click, a Quadrant on a tilted
  circle (**unverified**).
- command-line.md: the rail's echo and repeat (CIR-04, CIR-09), CIRCLE's 2D prompts (CIR-01).
- properties.md: the circle's palette (COB-05, COB-06), the linetype round a circle (COB-01).
- drafting-aids.md: Quadrant along the UCS (COB-02), Grips' Missing (COB-04), the deferred marker
  (CDK-04, LINE's Missing).
- Catalogs: a Ttr radius prompt id (CIR-08), table 20418's refusal (CTN-12), the palette's labels
  (COB-06); `npm run locales`.
- Rules: `cad-tools.md` (an object made at the command's end wears the end's properties unless
  AutoCAD fixes them at the start — PLINE's p39 against CIRCLE's p11; `defersSnap`'s default),
  `cad-runtime.md` (a rail start is a command run).
- Roadmap: row 3 `done`, owning the circle object and tangent constructions; analogues for ARC
  (dashes, Quadrant, 3P's plane, Enter refusals), the Inquiry review (COB-03) and every rail entry
  (CIR-09).

## 14. Template improvements

- **Start from the analogues** paid again: PLINE's and LINE's list gave six findings in the first
  hour (CTN-01 to 03, CIR-01, CIR-02, CDK-01).
- **Read the trace's flags before the desktop**: `UseBasePoint:false` predicted CIR-12 and
  `UseDashedLine:true` CDK-02; annex-probes.md §2 could say so.
- **The ribbon's macros**: a command with rail variants reads acad.cuix (a zip; `unzip` is not
  installed, Python's `zipfile` reads it) for what each button types (annex-probes.md §4).
- **A choice among solutions is a data table**: picks varied to separate candidate rules, a
  fitting script, ties kept out of tests (annex-probes.md §3).
- **Scratch tests' console output is swallowed**: write with `appendFileSync` to a file
  (annex-probes.md §5).
- **Desktop traps**: a `com send` answer with a space at a string prompt (`DASHED acadiso.lin`)
  is one answer; FILEDIA 0 for -LINETYPE's file, restored after (annex-probes.md §4).
