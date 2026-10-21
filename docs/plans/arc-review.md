# ARC review

> **Status:** plan, 2026-10-21 — the fourth review of `docs/coverage/roadmap.md`'s order, with skill
> `command-review`. Phases 0–4 ran in one session, three subagents probing the console and one
> desktop pass with the owner's mouse (d01–d10, the English profile `enu`); the execution follows in
> the same session, block by block, the owner having waived the wait for approval.

## 1. Summary

| Severity | ARC | AOB | ADK | Total |
| -------- | --- | --- | --- | ----- |
| Critical | 0   | 0   | 0   | 0     |
| High     | 2   | 1   | 0   | 3     |
| Medium   | 6   | 3   | 1   | 10    |
| Low      | 4   | 3   | 1   | 8     |

No finding loses or corrupts a drawing. The three highs are gestures a daily user makes:

- Enter at any ARC prompt after the first ends the command and drops the points given; AutoCAD
  refuses it in that prompt's words and asks again (ARC-01, CIRCLE's CIR-05 again).
- At a centre mode's end point, `@0,10` or `@10<90` is read from the start point; AutoCAD reads it
  from the centre (ARC-02).
- Dragging an arc's middle grip changes its radius about a fixed centre; AutoCAD's default grip
  mode, Stretch, bends the arc through both ends and the cursor (AOB-05, desktop d08).

CIRCLE's analogues all held: 3P lies flat in the first point's plane (ARC-03), a Tangent or
Perpendicular at the first point is measured from LASTPOINT (ARC-04), a degenerate arc is `*Invalid*`
and the end (ARC-05), the rail's modes are the ribbon's macros (ARC-08), the jig wears the current
colour with amber dashed lines (ADK), the arc's linetype and Quadrant are laid as the circle's now
are (AOB-01, AOB-02). The prompts, keywords, refusals of typed words, LASTPOINT, transparency, undo,
the properties an arc takes (made at its end, as CIRCLE p11) and the file round trip match 2027.

## 2. Inventory

Reviewed on 2026-10-21 over `3c07b9e`, AutoCAD 2027 (ACADVER 26.0, `_VERNUM` X.118.0.0, p00), string
tables of 2026-10-20. Baseline green: typecheck, and the ten test files that run ARC (389 tests).

**The command's own surface:** `cad/application/tools/ArcTool.ts` and what it imports
(`threePointPlane.ts`, `currentProperties.ts`, `coordinateInput.ts`, `arcFrom3Points`); its three
registrations in `cad/application/runtimeTools.ts` and `TOOL_COMMANDS` (ARC, ARCSCE, ARCCSE — the
last two this app's names, unknown to AutoCAD, p105); ARC's names, keywords and prompts in
`cad/locales/en.json`, `es.json` (`ar.json` has none: the global language); the rail's flyout
(`components/cad/tool-rail.tsx`), `content/commands.ts`; the coverage entry in
`docs/coverage/draw.md`. Tests: the ARC parts of `drawing.test.ts`, `invalidAnswers.test.ts`,
`lastPoint.test.ts`, `undoEcho.test.ts`, `undoCommand.test.ts`, `mredoCommand.test.ts`,
`englishSurface.test.ts`, `currentProperties.test.ts`, `elev.test.ts`, `tiltedUcs.test.ts`,
`normals.test.ts`.

**The object (owned here):** the arc in the entity modules (`createArc`, `arcStartPoint`,
`arcMidpoint`, `arcSweepAngle`, transforms), its scene and dashes (`SceneBuilder.ts`, both
presenters), its grips (`selectToolGrips.ts`, `SelectTool.ts`), its palette rows (`EngineState.ts`,
`entityProperties.ts`), its part of `cad/serialization/drawingFile.ts` and the clipboard, the snaps
it offers (`cad/application/snapping/providers.ts`).

**Related tools:** U, UNDO, REDO, MREDO after ARC; `'-COLOR`, `'CELWEIGHT`, `'THICKNESS`, `'ELEV`
mid-command; MIRROR of an arc; LINE's message for a zero-length line (found on the way, AOB-07).

**Areas cited, not reviewed again:** the command line, point input, object snaps, Ortho, Polar,
dynamic input, undo, current properties, grips, the palette, files, render (LINE review); the
polyline's arc prompts (PLINE review); the ribbon macros, the deferred and LASTPOINT-based Tangent
(CIRCLE review). The catalog sweep reran for ArcTool's ids: 10 ok, 1 `es-several` (settled by
ARC-10), 3 `no-source` (the dynamic-input labels `startPoint`, `centerPoint`, `endPoint`).

## 3. Probes

Console inputs are `scripts/research/probes/arc/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh arc <ids>` in es-ES and en-US; the
desktop's are `dsk.sh` in the same folder. Transcripts, plots and screenshots are in
`research/probes/arc/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | ACADVER, `_VERNUM` |
| p01–p05 | 3P, CSE, SCE by typed points with MPDUMP; `FOO` at each prompt; the flags (start AllowNone; 3P second UseBasePoint from the start; 3P end none; centre-mode end from the centre) |
| p06, p07 | 3P through points at different heights (flat at the first's Z); a Z, `*`, `<45` at the later prompts |
| p08–p17 | `_TAN` and `_PER` at every prompt: from LASTPOINT at the first point and CSE's centre (p14–p16), from the previous point after it, finding nothing (`No found for specified point.`), coincident points (`*Invalid*`) |
| p100–p107 | names and aliases (`_A`, `_.ARC`, es `ARCO`, `A`), ARCSCE typed (unknown), Enter repeating ARC, `'_ARC` at LINE |
| p108–p125 | Enter at the start with nothing and with a line; `0`, `_E`, `_A`, `_L`, `_C` where they are another prompt's; Enter at every later prompt; a Z at the 2D prompts |
| p126–p143 | point entry: `@` forms per prompt, `@` alone, `#`, `*` in UCS Z 30, `<a` per prompt, LASTPOINT after each mode |
| p144–p149 | `'_ZOOM`, `'_-PAN`, `'_-OSNAP`, `'ORTHOMODE`, `'_LINE` mid-ARC; `_U` and another command at each prompt; U, REDO, UNDO 2, MREDO (untraced) |
| p150–p161, p192–p194 | properties: layer, colours, DASHED, lineweight, CELTSCALE, ELEVATION, THICKNESS, a typed Z, UCS Z 30 and X 90; the same changed mid-command |
| p162–p171, p188–p191 | degenerate arcs: the end on the start ray or at the centre, centre = start (`Radius must be non-zero.`), collinear 3P, end = start; the sweep always counter-clockwise |
| p172–p187 | overrides at the later prompts (PER, TAN, CEN, FRO, M2P, END, QUA, MID, INT, NEA); ORTHOMODE 1 with typed points |
| p200 | plot of six DASHED arcs, measured along their length |
| p201–p211 | snaps on an arc: QUA in UCS Z 30 and on a tilted arc, END, MID, CEN, NEA, INT (and beyond its end), TAN and PER off the sweep |
| p212–p215 | MIRROR; a mirrored insert exploded; DXF 2018 of arcs (clockwise-made, elevated, thick, tilted) written and reopened |
| d01–d02 | the ribbon's 3-Point, dynamic input on and off: `_arc`; an amber dashed line from the start at the second point; at the end the ghost in CECOLOR alone |
| d03–d04 | Start, Center, End and Center, Start, End: the macros' echoes; the amber dashed line from the start or the centre; the ghost and the amber line from the centre at the end; Ctrl held turns the ghost, Ctrl at the pick makes it clockwise |
| d05 | dynamic input: the Down lists (Center; Center, End; Angle, chord Length), the included-angle box at a centre mode's end |
| d06 | Ortho bends only a centre mode's end, not 3P's points, SCE's centre or CSE's start; the right button's menu at the start and the second point |
| d07–d09 | grips (ends, middle, centre), their hover menus (middle Stretch, Radius; ends Stretch, Lengthen; centre none), the middle grip's Stretch drag, the Properties palette |
| d10 | DASHED arcs on screen as on the plot |

## 4. Matrix

Prompts: S start, 2 3P's second, E3 3P's end, Cs SCE's centre, Cc CSE's centre, St CSE's start,
Ec a centre mode's end.

### ARC — the command

| Row | S | 2 | E3 | Cs | Cc | St | Ec |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A names, aliases | match p101 · drawing.test.ts:667; `_A`, `_.ARC` known (command-line.md) | | | | | | |
| A rail start | differs ARC-08 (p101, p107, cuix) | | | | | | |
| A repeat, transparent | untested p100, p106 | | | | | | |
| B text en | match p01–p03 | match | match | match | match | match | known (no `or [Angle/chord Length]`) |
| B text es | match p01 | match | match | match | match | match | differs ARC-10 (p02, p118) |
| B keywords | match p01 | known (End) | n/a | n/a | n/a | n/a | known (Angle, Length) |
| B `FOO` | match p04 · invalidAnswers.test.ts:62 | match p04 | match p04 | match p05 | untested p147 | untested p147 | differs ARC-11 (p164) |
| B Enter | differs ARC-09 (p108); Continue known (p109) | differs ARC-01 (p113) | ARC-01 (p114) | ARC-01 (p115) | ARC-01 (p116) | ARC-01 (p117) | ARC-01 (p118) |
| B another prompt's keyword | untested p119 (`_E`) | known p122 | untested p123 | untested p123 | n/a | n/a | known p120, p121 |
| C absolute, Z | untested p124, p153 | match p07 | match p07 | untested p125 | untested | untested p124 | untested |
| C relative `@` | n/a | untested p126 | untested p126 | untested p128 | n/a | untested p127 | differs ARC-02 (p127, p129) |
| C `@` alone | n/a | ARC-05 (p132) | ARC-05 | untested | n/a | ARC-05 (p130) | ARC-02, ARC-05 (p131) |
| C `*` in UCS Z 30 | untested p134 | match p134 | match | match | untested | match | untested |
| C `<a` | match p135 | differs ARC-07 (p136) | differs ARC-07 (p07) | differs ARC-07 (p137) | match p138 | differs ARC-07 (p139) | untested p140 |
| C LASTPOINT after | untested p141–p143 · lastPoint.test.ts:49 (3P only, 2023 cite) | | | | | | |
| D TAN, PER | differs ARC-04 (p14, p15) | untested p09, p172 | untested p10, p178 | untested p173, p174 | differs ARC-04 (p16) | untested p175, p176 | untested p12, p13, p177 |
| D finding nothing | match p17 | match p17 | match p17 | match | match p13 | match | match |
| D other overrides | untested p186, p187 | untested p183 (M2P known) | untested p179, p186 | untested p181, p187 | untested | untested p182 | untested p180 |
| D Ortho, Polar | n/a | differs ARC-07 (d06) | ARC-07 (p01 flags) | ARC-07 (d06) | n/a | ARC-07 (d06) | match d06; Polar unverified |
| D typed point with Ortho | n/a | untested p184 | untested p184 | untested p185 | n/a | untested p185 | untested p185 |
| D dynamic input | owned (LINE); the included-angle box at Ec known with Angle (d05) | | | | | | |
| E transparent | untested p144–p146; `'ORTHOMODE` known (drafting-aids.md) | | | | | | |
| F undo | untested p147, p149 · undoEcho.test.ts:207 | | | | | | |
| G ending | ARC-01; another command untested p148; Escape owned (LINE) | | | | | | |
| H properties | match p150, p151 · currentProperties.test.ts:56; CELTSCALE known | | | | | | |
| H mid-command | untested p157–p161, p194 (made at the end, as CIRCLE p11) | | | | | | |
| H plane, heights | differs ARC-03 (p06, p152, p192); centre modes untested p153, p154 | | | | | | |
| H UCS | untested p155, p156; tiltedUcs.test.ts:496 asserts the tilt ARC-03 refutes | | | | | | |
| H degenerate | differs ARC-05 (p11, p17, p162–p170, p190, p191), ARC-06 (p188, p189) | | | | | | |
| K catalogs | ARC-10; the sweep's `no-source` labels unverified | | | | | | |
| L history | match p100, p101, p149 but ARC-08, ARC-10 | | | | | | |
| N tests | ARC-12 | | | | | | |

### AOB — the arc object

| Row | Cell |
| --- | --- |
| D snaps on it | END, MID, CEN, NEA, INT match (p202, p204, p205; untested); QUA differs AOB-02 (p201, p211; WCS p203 untested); PER differs AOB-03 (p208, p209); TAN off the sweep refused, untested (p207); INT on one object extended known (p206) |
| H tilted | QUA, MID untested (p210) |
| H transforms | MIRROR keeps +Z and CCW (p212), a mirrored insert exploded (p213): untested |
| I grips | the middle grip differs AOB-05 (d07, d08); the ends' Stretch **unverified** (d07 shows Stretch, Lengthen; the drag not seen); the hover menus known |
| I palette | differs AOB-04 (d09) |
| J files | untested (p214, p215; drawingFile.test.ts:77 only a plain arc) — AOB-06 |
| M linetype | differs AOB-01 (p200, d10) |
| M lineweight, SVG | the same primitive as the canvas; not probed apart |

### ADK — the desktop

| Row | Cell |
| --- | --- |
| M ghost | differs ADK-01 (d01–d04) |
| M rubber band | differs ADK-02 (d02–d04) |
| M Ctrl | match d03 · drawing.test.ts:748 (Ctrl held turns it, released turns back, at the pick clockwise) |
| P right button | owned (LINE); its options as the prompt's (d06) |
| Q look | the grips' squares match (d07); the rail's labels refuted (§10) |

## 5. Findings

### High

#### ARC-01 — Enter at any later ARC prompt ends the command

- **Severity:** high · **Row:** B, G · **Status:** verified
- **Where:** `cad/application/tools/ArcTool.ts:370` (`commitTypedPoint` returns false on `""`; no
  `onEnter`)
- **AutoCAD:** p113–p118: Enter is refused and the prompt asked again — 3P second and Ec
  `2D point or option keyword required.` (es `Se requiere un punto 2D o una opción.`), E3, Cs, St
  `Invalid 2D point.` (es `Punto 2D no válido.`), Cc `Invalid point.` (es `Punto no válido.`)
- **mellowcad:** scratch `verify.test.ts` p113, p118: the bare prompt line, then `Command:`
- **Scenario:** two points given, Enter by habit or a stray right-click → ARC is gone with its points
  → AutoCAD would have kept asking.
- **Fix:** each later phase refuses Enter in its prompt's words, as `CircleTool`'s `refuseEnter`
  (CIR-05), from `onEnter` and from `commitTypedPoint` on empty text.
- **Regression test:** `drawing.test.ts`, one case per prompt, en and es, citing p113–p118.

#### ARC-02 — A centre mode's end reads `@` from the start point, not the centre

- **Severity:** high · **Row:** C · **Status:** verified
- **Where:** `ArcTool.ts:387` (`previousPoint` returns the second point given, CSE's start)
- **AutoCAD:** p127: CSE `0,0`, `@10,0`, `@0,10` → end `[0,10,0]`, EndAngle 1.5708; p129 `@10<90` the
  same; p131 `@` is the centre (`*Invalid*`, ARC-05). SCE's second point is the centre already (p128).
- **mellowcad:** `verify.test.ts` p127: EndAngle 0.7854
- **Fix:** at a centre mode's end, `previousPoint` is `centerOf(p1, p2)`; 3P's end stays relative to
  its second point (p126).
- **Regression test:** `drawing.test.ts`, p127 and p129.

#### AOB-05 — The middle grip's drag changes the radius; AutoCAD stretches the arc through it

- **Severity:** high · **Row:** I · **Status:** verified
- **Where:** `cad/application/tools/selectToolGrips.ts:88` (`role: { kind: "radius" }`)
- **AutoCAD:** desktop d08: arc 40,25 → 50,30 → 60,25, the middle grip dragged to 50,34 → the arc
  through both ends and 50,34 (centre 50,23.9245, r 10.0577), its ghost drawn so; d07: the middle
  grip's hover menu is Stretch, Radius — Stretch the default ("The default grip mode is STRETCH",
  help GUID-BBEA1F71)
- **mellowcad:** `selection.test.ts:400` asserts the radius edit about the fixed centre
- **Fix:** the middle grip stretches: the arc through the start, the cursor and the end (three-point,
  the stored sweep CCW), refused when collinear. A new grip role (`arcMiddle`) in the four select
  files; Radius stays a hover option not built (known, as PLINE's).
- **Regression test:** `selection.test.ts`, d08's drag.
- **Coverage:** `drafting-aids.md` (grips): the arc's middle grip Stretch; the ends' Stretch unverified
  (ARC-D5).

### Medium

#### ARC-03 — 3P through points at different heights tilts into their plane

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `ArcTool.ts:312` (`planeThrough`)
- **AutoCAD:** p06: `_END` at (0,0,5), (0,10,0), (10,0,0) → centre (5,5,5), normal +Z; p152 a typed
  `0,0,7` first point with ELEVATION 5 → flat at Z 7; p192 `'ELEV` mid-ARC → flat at Z 0, thickness 3.
  The later prompts are 2D (p07): their X and Y count, in the first point's plane.
- **mellowcad:** `analogues.test.ts` p06: normal (0, 0.4472, 0.8944); subagent B's p152, p192 tilted
- **Fix:** 3P solves in plan and lies `onPlaneOf(arc, p1)`, as every mode; `threePointPlane.ts`,
  now unused, goes.
- **Regression test:** `tiltedUcs.test.ts:496` rewritten to p06's flat arc; p152 and p192 in
  `drawing.test.ts`.
- **Coverage, rules:** draw.md "in the plane of the three" → the first point's; `cad-tools.md`'s
  "Three points fix their own plane (ARC's …)" deleted.

#### ARC-04 — A Tangent or Perpendicular at the first point or CSE's centre is refused

- **Severity:** medium · **Row:** D · **Status:** verified
- **Where:** `ArcTool.ts` (no `snapsFromLastPoint`)
- **AutoCAD:** p14: LASTPOINT 30,0, `_TAN` on a circle r10 → start (3.3333, 9.4281); p15 `_PER` on a
  line from LASTPOINT 0,10 → (0,−15); p16 CSE's centre `_TAN` → (3.3333, 9.4281). With LASTPOINT
  inside the circle nothing is found (p08, p13).
- **mellowcad:** `analogues.test.ts` p14–p16: `No found for specified point.` and the prompt again
- **Fix:** `snapsFromLastPoint()` true at the first prompt (CIRCLE's CTN-04).
- **Regression test:** `drawing.test.ts`, p14–p16.

#### ARC-05 — A degenerate arc keeps the command asking, or adds a zero-sweep arc

- **Severity:** medium · **Row:** H, C · **Status:** verified
- **Where:** `ArcTool.ts:332` (`if (!arc) return`), `arcFromCenterStartEnd` (`ArcTool.ts:405`)
- **AutoCAD:** `*Invalid*` (es `*No válido*`) and the end of ARC, no object: three coincident points
  (p17), the second on the start (p11), collinear (p168), the end between or on the start (p169,
  p170), `@` alone at St (p130); a centre mode's end on the start ray (p162, p166) or at the centre
  (p112, p190, p191, p131)
- **mellowcad:** 3P keeps asking silently; a centre mode adds a full circle (`s 0, e 0`) or a 270°
  arc (`b.test.ts`, `c.test.ts`)
- **Fix:** one degenerate check per mode at the end point: `*Invalid*` (`invalid` message), then
  `endCommand`, LASTPOINT the last point given (as CIRCLE's CIR-07).
- **Regression test:** `drawing.test.ts`, p17, p168, p162, p190.

#### ARC-07 — Ortho, Polar and `<angle` act at prompts AutoCAD gives no base

- **Severity:** medium · **Row:** C, D · **Status:** verified (Polar unverified)
- **Where:** `ArcTool.getConstraintAnchor` (`ArcTool.ts:210`)
- **AutoCAD:** d06: Ortho bends only a centre mode's end, from the centre (3P's second and end, SCE's
  centre and CSE's start picked as is); `<a` refused at 2 (p136, `2D point or option keyword
  required.`), E3 (p07), Cs (p137), St (p139) with `Invalid 2D point.`, taken at Ec (p140)
- **mellowcad:** the anchor at every later prompt bends them and takes `<a` (`Angle Override`)
- **Fix:** an anchor only at a centre mode's end; the Tangent and Perpendicular there measure from
  LASTPOINT (`snapsFromLastPoint`, p09, p10, p172–p176 match); the dynamic-input box keeps its
  relative reading (d05 shows it from the previous point).
- **Regression test:** `drawing.test.ts`, Ortho at each prompt (d06), `<45` at 2 and St.

#### ARC-08 — The rail's SCE and CSE echo, repeat and undo as this app's names

- **Severity:** medium · **Row:** A · **Status:** verified
- **Where:** `ArcTool` (no `ribbonMacro`), `CommandLine.ts:246`
- **AutoCAD:** acad.cuix: `^C^C_arc \_c \` (Start, Center, End), `^C^C_arc _c` (Center, Start, End);
  d03, d04 `Command: _arc`, `…[Center/End]: _c`; Enter afterwards repeats ARC as 3P (p101, p107); U
  names ARC (p149)
- **mellowcad:** subagent A's `a.test.ts`: `_arcsce`, Enter repeats ARCSCE, U names ARCSCE
- **Fix:** `ribbonMacro()` — SCE `{ command: "ARC", answers: [MACRO_PAUSE, "_c"] }`, CSE
  `{ command: "ARC", answers: ["_c"] }` (CIR-04); ARCSCE and ARCCSE typed run the same (ARC-D3).
- **Regression test:** `drawing.test.ts`, the echo, Enter and U after each rail start; the English
  surface snapshot.

#### ARC-09 — Enter at the start with nothing to continue ends silently

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p108: `No line or arc to continue.` then `*Invalid*` (es
  `No hay línea o arco que se pueda continuar.`, `*No válido*`, table 20149), the end
- **mellowcad:** `verify.test.ts` p108: nothing
- **Fix:** at the start, `continuePoint` finding nothing reports both lines and ends; with something
  to continue it still ends (Continue is a gap, ARC-D4).
- **Regression test:** `drawing.test.ts`, p108 in en and es.

#### AOB-01 — A dashed arc starts a full dash at its start and is dashed when shorter than a period

- **Severity:** medium · **Row:** M · **Status:** verified
- **Where:** `cad/application/SceneBuilder.ts:890`
- **AutoCAD:** p200, d10: the pattern is centred over the arc's length as on a line
  (`centredPattern`, line/p207) — r10 0–180° `D12.76 g5.95 D12.71`; an arc shorter than a period
  solid
- **Fix:** `linetypedArc` beside `linetypedCircle`: the runs of `centredPattern(pattern, r·sweep)`,
  each dash an `arcScenePrimitive`; solid when the layout is null (ARC-D6).
- **Regression test:** `SceneBuilder.test.ts`, subagent C's five arcs in degrees.

#### AOB-02 — Quadrant on an arc uses its own axes in a rotated UCS

- **Severity:** medium · **Row:** D · **Status:** verified
- **Where:** `cad/application/snapping/providers.ts:303`
- **AutoCAD:** p201 (UCS Z 30): `_QUA` near either end gives the UCS's 90° point (−5, 8.6603), only
  those on the arc; p211 on a tilted arc the UCS's quadrant; p203 the WCS's on the arc only
- **Fix:** `quadrantTurn(entity, ucs)` for the arc, filtered by the sweep (COB-02).
- **Regression test:** `providers.test.ts`, p201 and p211.

#### AOB-03 — Perpendicular on an arc lands off the arc

- **Severity:** medium · **Row:** D · **Status:** verified
- **Where:** `providers.ts:364`
- **AutoCAD:** p208: both feet off the sweep → `No Perpendicular found for specified point.`; p209
  the foot on the arc though the other is nearer
- **Fix:** keep the feet on the sweep, as Tangent already does.
- **Regression test:** `providers.test.ts`, p208, p209.

#### ADK-01 — The jig's arc is drawn in the theme's colour

- **Severity:** medium · **Row:** M · **Status:** verified
- **Where:** `ArcTool.buildOverlay` (`THEME.rubberBand`)
- **AutoCAD:** d01–d04: the ghost in CECOLOR (red)
- **Fix:** `currentColor(ctx)`, as LINE, PLINE and CIRCLE (CDK-01).
- **Regression test:** `drawing.test.ts`'s jig cases, an ARC one per mode.

### Low

#### ARC-06 — Centre = start: no `Radius must be non-zero.`

- **Severity:** low · **Status:** verified · **AutoCAD:** p188, p189: the end prompt follows, then
  `Radius must be non-zero.` (es `El radio no debe ser cero.`, table 20158) and `*Invalid*` ·
  **mellowcad:** keeps asking · **Fix:** a message `radiusMustBeNonZero`, said with ARC-05's end.

#### ARC-10 — The Spanish centre-mode end says «del arco»

- **Severity:** low · **Status:** verified · **AutoCAD:** p02, p118 es: table 8423,
  `Precise punto final de arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o […]`;
  405 (`del arco`) is Continue's (p109) · **Fix:** `specifyEndPointOfArcCtrl` in es takes 8423's
  stem; the coverage entry's quote too.

#### ARC-11 — A wrong answer at a centre mode's end is `Invalid 2D point.`

- **Severity:** low · **Status:** verified · **AutoCAD:** p164, p118: `2D point or option keyword
  required.` (the prompt declares Angle and chord Length) · **Fix:** that refusal there (ARC-D2).

#### ARC-12 — ARC's tests cite no probe and its entry claims the tilted plane

- **Severity:** low · **Row:** N · **Status:** verified · `drawing.test.ts:666–759`,
  `lastPoint.test.ts:49` (2023's `acc/lp*`), `currentProperties.test.ts:56`, `elev.test.ts:159`
  cite nothing of 2027; draw.md's ARC entry says "in the plane of the three" · **Fix:** cite the
  probes; the entry rewritten.

#### AOB-04 — The arc's palette rows are not AutoCAD's

- **Severity:** low · **Row:** I · **Status:** verified (English labels; Spanish unverified)
- **Where:** `EngineState.ts:996`, `entityProperties.ts:305`
- **AutoCAD:** d09: one Geometry group — Start X/Y/Z (grey), Center X/Y/Z, End X/Y/Z (grey), Radius,
  Start angle, End angle, Total angle, Arc length, Area (grey), Normal X/Y/Z (grey); General as a
  circle's (Thickness last)
- **mellowcad:** Geometry `Radius*, Length, Angle*, Start angle*, End angle*, Normal`, then a Center
  group; Total angle editable
- **Fix:** AutoCAD's rows and order in one Geometry group (COB-06), Total angle, Arc length and Area
  read-only, the Start and End rows added read-only.
- **Regression test:** `palettePanel.test.ts`, the arc's rows.

#### AOB-06 — An arc's file round trip holds only a plain arc

- **Severity:** low · **Row:** J · **Status:** verified · `drawingFile.test.ts:77`; p214, p215
  (AutoCAD keeps a clockwise-made, elevated, thick and tilted arc) · **Fix:** an `arcFiles.test.ts`
  as `circleFiles.test.ts`: the JSON, the autosave and the clipboard of those arcs.

#### AOB-07 — LINE's `Zero length line created at` writes the UCS point

- **Severity:** low · **Row:** L (LINE's command line, LINE review) · **Status:** verified ·
  **AutoCAD:** p201, p210: WCS (`(-5.0000, 8.6603, 0.0000)` in UCS Z 30) · **Where:**
  `LineTool.ts:959` · **Fix:** the WCS point; draw.md's LINE entry reworded.

#### ADK-02 — The rubber lines are solid white

- **Severity:** low · **Row:** M · **Status:** verified
- **AutoCAD:** d02–d04: amber dashed — from the start at 3P's second and SCE's centre, from the centre
  at CSE's start and at a centre mode's end (to the cursor); none at 3P's end
- **Fix:** `THEME.dashedRubberBand` with `dash: [2, 3]`, as CIRCLE's size line (CDK-02).

## 6. Decisions taken

- **ARC-D1:** End, Angle, chord Length, Direction, Radius and Continue stay the entry's gaps: the
  review fixes what is built (the roadmap's reviews come before features).
- **ARC-D2:** a centre mode's end refuses in AutoCAD's words, `2D point or option keyword required.`,
  though its keywords are not offered: the console's words are the spec (subagent A proposed the
  reverse, ARC-D11, overruled).
- **ARC-D3:** ARCSCE and ARCCSE (es ARCOICF, ARCOCIF) stay typed names running the macros: removing a
  name is a major version (`CommandLine.ts`' WHY).
- **ARC-D4:** Enter at the start with something to continue still ends ARC until Continue is built.
- **ARC-D5:** the end grips keep their swing until a desktop probe shows what Stretch does to an
  arc's end (d07 shows the menu, not the drag).
- **ARC-D6:** an arc's dashes are laid dash by dash as arcs (true in any view), not one arc with an
  offset.
- **ARC-D7:** AOB-02 and AOB-03 stay on the arc entity: a polyline's arc segments (PLINE's object)
  are analogues to probe, not changed unprobed.

## 7. Tests proposed

Regression tests are in each finding. The untested cells, by file: `drawing.test.ts` — the
`_TAN`/`_PER` after the first point (p09, p10, p172–p178), FRO (p179, p182), typed points with
Ortho (p184, p185), `'_ZOOM`/`'_-PAN`/`'_LINE` mid-ARC (p144, p146), `_U` and another command at
each prompt (p147, p148), the properties changed mid-command (p157–p161, p194), UCS Z 30 and X 90
(p155, p156), a typed Z at the centre modes' first point (p153, p154); `lastPoint.test.ts` — SCE and
CSE (p142, p143), 3P re-cited to p141; `undoEcho.test.ts` — p149; `providers.test.ts` — END, MID,
CEN, NEA, INT and TAN on an arc (p202–p207), the tilted arc (p210); `transforms.test.ts` — p212,
p213.

## 8. What is not tested, and why

The rail's icons and labels (chrome); the canvas pixels of a dashed arc beyond its primitives (the
scene is the contract, `cad-scene.md`); Ctrl's live turn of the ghost, held on a move (the harness
passes `ctrlKey` per gesture, which `drawing.test.ts:748` holds).

## 9. What could not be reviewed, and why

- **The Spanish profile:** the launched instance opened `enu` again, so the palette's Spanish
  labels, and PLINE's and CIRCLE's pending Spanish desktop items, stay open.
- **The end grips' Stretch, a number typed with a grip hot, Ortho on a grip drag:** not seen (ARC-D5).
- **Polar** at ARC's prompts: assumed to follow Ortho's base, unprobed (ARC-07).
- **EXT and APPINT along an arc** need a dwell on the desktop.
- **A dashed tilted or thick arc**, a dashed polyline arc segment: not plotted.

## 10. Refuted in the adversarial pass

- **The rail's labels** (`Arc`, `Start, Center, End arc` against the ribbon's `3-Point`, `Start,
  Center, End`): chrome, worded as CIRCLE's rail is (`2-Point circle`); recognised on sight.
- **The ghost turning with Ctrl only at the pick** (annex-probes.md's trap): d03 shows the jig reads
  Ctrl held during the move too; mellowcad does (`onPointerMove` reads `ctrlKey`).
- **A dashed line at 3P's end with dynamic input on** (d01): dynamic input's dimension, gone with
  DYNMODE 0 (d02) — dynamic input is LINE's area.
- **Escape on the Down list cancelling ARC** (d05): the list's own handling, unconfirmed as
  behaviour (a second Escape may have been read); not a finding.
- **3P's tie at p10:** AutoCAD breaks it either way; p178 repeated it without the tie, matching.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| draw.md: 3P "through points at different heights, in the plane of the three" | p06, p152 | false (ARC-03) |
| draw.md: es `Precise punto final del arco (mantenga…)` | p02 | false (ARC-10) |
| properties.md:74: an arc's dashes "**unverified** … theirs runs from the start" | p200 | false (AOB-01) |
| drafting-aids.md:24: an arc's quadrants "at its OCS's (**unverified** in a rotated UCS)" | p201 | false (AOB-02) |
| `cad-tools.md`: "Three points fix their own plane (ARC's; not CIRCLE's)" | p06 | stale (ARC-03) |
| `cad-tools.md`: `takes()` "a 2D point (ARC's …)" | p04, p07 | holds |
| `cad-tools.md`: jigs wear `currentColor` (LINE, PLINE, CIRCLE) | d01 | broken for ARC (ADK-01) |

Checked and holding: the CCW storage invariant (`cad-engine.md`, p171), THICKNESS given by ARC
(p150), the properties made at the end (p157–p161), the 2D refusals (p04, p05, p07).

## 12. Order of execution and estimate

1. **ARC** (ARC-01 to ARC-12) — the tool, its catalogs, its tests; about two hours.
2. **ADK** (ADK-01, ADK-02) — the tool's overlay, after ARC (same file); half an hour.
3. **AOB** (AOB-01 to AOB-07) — scene, snaps, grips, palette, files; about two hours. Independent of
   the others but for the English surface snapshot.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/draw.md` ARC: the plane, the refusals, Enter, the degenerate cases, the macros, the
  jig, the es wording; Missing keeps the options, adds Continue's Enter (ARC-D4), the included-angle
  box (d05), the end grips (ARC-D5).
- `docs/coverage/drafting-aids.md`: an arc's Quadrant and Perpendicular, its grips;
  `properties.md`: an arc's dashes; `draw.md` LINE: the zero-length message.
- `cad-tools.md`: the three-point plane line deleted; ARC added to the jigs in `currentColor`.
- Catalogs: es `specifyEndPointOfArcCtrl` (ARC-10), a message `radiusMustBeNonZero` (ARC-06), the
  arc's palette labels (AOB-04).
- Roadmap: ARC done, owning the arc object; the CIRCLE row's stray cell fixed.

## 14. Template improvements

- The desktop opened the English profile a third time: annex-probes.md §4 should say how to start
  the Spanish one (`acad.exe /p <profile>` or `/language es-ES`, to be tried), or that a review needing
  it is scheduled with the owner's AutoCAD already open in Spanish.
- `com send` of a command that leaves a prompt (`_MPHIST 6` read `6` as its first answer) locks COM:
  `com hist` only, never `MPHIST` typed (annex-probes.md's traps).
- DYNMODE −1 shows dynamic input on this profile, and `com set` cannot write a negative value:
  restore it with `com eval '(setvar "DYNMODE" -1)'`.
- A grip's default drag is a probe of its own (d08): the hover menu (d07) does not show it.
