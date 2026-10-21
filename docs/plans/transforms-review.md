# Transforms review (ROTATE, SCALE, MIRROR, STRETCH)

> **Status:** plan, 2026-10-22 — phases 0–4 of skill `command-review`, the tenth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (SCL, REF, ROT, JIG, MIR, STR).

## 1. Summary

5 high, 24 medium and 13 low findings over six blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| SCL | SCALE itself | 1 | 3 | 4 |
| REF | the Reference options, owned: ROTATE's reference and new angle, SCALE's reference and new length, Points | 1 | 7 | 2 |
| ROT | ROTATE itself | 0 | 2 | 2 |
| JIG | the look of ROTATE's, SCALE's and MIRROR's drag and of Reference's prompts | 0 | 4 | 1 |
| MIR | MIRROR itself | 1 | 3 | 2 |
| STR | STRETCH itself | 1 | 5 | 2 |

The worst: a point at SCALE's factor scales by its distance from the base, where AutoCAD divides
that distance by half the largest side of the set's extents — a click 50 from the base of a
100-long line leaves it as it is in AutoCAD and makes it fifty times longer here (SCL-03: p219,
desktop d06, d07); ROTATE's new angle has no `[Points]` and no `<default>`, and Enter there ends
ROTATE unturned where AutoCAD turns by the default less the reference (REF-01: p105–p107, d04);
mirrored TEXT and MTEXT only move their insertion point, where AutoCAD (MIRRTEXT 0) mirrors the
text's box and keeps it readable (MIR-01: p283); STRETCH never bends an arc, where AutoCAD moves
the caught end and keeps the chord height (STR-01: p271).

The analogues MOVE and COPY left, checked first: STRETCH by a zero displacement changes nothing
and is the step U names, as MOVE (MOVE-D3 holds: p249–p253); STRETCH's LASTPOINT is the second
point however given, the base after Enter (p249, p254–p257), but its `Specify displacement` is not
MOVE's (STR-05); its drag is MOVE's (desktop d09, MOVE-D6 holds). ROTATE's, SCALE's and MIRROR's
copies go in pick order where AutoCAD's go in drawing order (ROT-02, SCL-04, MIR-04: CPY-03's
analogue); U after a run that changed nothing names it in every one (p132, p133, p206, p207, p248,
p252, p253: STP-01 holds). Each of the four leaves nothing selected and the edited set as Previous,
MIRROR No its originals (p287–p289: ERASE's contract holds).

## 2. Inventory

Commit `618a3ee`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The commands:** `cad/application/tools/RotateTool.ts`, `ScaleTool.ts`, `MirrorTool.ts`,
  `StretchTool.ts` (over `PlacementTool.ts`, MOVE's area); `defaultTools`, `TOOL_COMMANDS` (ROTATE,
  SCALE, MIRROR, STRETCH); none transparent (p103, p163, p222, p225). The transforms of
  `cad/domain/entityTransforms.ts` (`rotateEntity`, `scaleEntity`, `mirrorEntity`, `stretchEntity`
  and their `*Copy`). Catalogs: names ROTATE (`RO`; es GIRA, `GI`), SCALE (`SC`; ESCALA, `ES`),
  MIRROR (`MI`; SIMETRIA, `SI`), STRETCH (`S`; ESTIRA, `EI`), keywords Copy, Reference, Points, Yes,
  No, Displacement, prompts `specifyRotationAngleOr`, `specifyTheReferenceAngle`,
  `specifyTheNewAngle`, `specifyScaleFactorOr`, `specifyReferenceLength`, `specifyNewLengthOr`,
  `specifyFirstPoint`, `specifySecondPoint`, `specifyFirstPointOfMirrorLine`,
  `specifySecondPointOfMirrorLine`, `eraseSourceObjects`, the dynamic-input labels, messages
  `rotateSettings`, `rotatingCopy`, `scalingCopy`, `stretchSelection`, `requiresAngle`,
  `requiresDistance`; `ar` has no command language. The rail (`components/cad/tool-rail.tsx`), the
  landing's filing (`content/commands.ts`).
- **The area owned:** the Reference options — ROTATE's `Specify the reference angle` and
  `Specify the new angle` with Points, SCALE's `Specify reference length` and
  `Specify new length` with Points; the runtime's two-point measure they lean on
  (`cad/application/runtimeMeasure.ts`).
- **Tests:** `transforms.test.ts`, `dynamicInputEnter.test.ts`, `invalidAnswers.test.ts`,
  `measuredAnswers.test.ts`, `lastPoint.test.ts`, `blocks.test.ts`, `normals.test.ts`,
  `tiltedUcs.test.ts`, `elevation.test.ts`, `polylineWidths.test.ts`, `currentProperties.test.ts`,
  `settingsPrompts.test.ts`, `selection.test.ts`, `selectionModes.test.ts`,
  `newDrawingResets.test.ts`, `transparentCommands.test.ts`, `englishSurface.test.ts`,
  `cad/application/locale.test.ts`.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after each; ERASE Last and
  Previous after their copies; ID before STRETCH's Displacement (STR-05).
- **Areas cited:** LINE's (the command line, point input, object snaps, Ortho, Polar, dynamic
  input, transparency, undo, the shortcut menus, grips — whose missing grip modes Rotate, Scale and
  Mirror stay in drafting-aids.md's Missing), ERASE's (`Select objects:`, preselection, what a
  command leaves selected), MOVE's (placement: STRETCH's base and second point; the drag's look).
  Differences found in them: REF-09 (transparency at a measured second point), STR-05 (placement's
  `Specify displacement`).
- **Knowledge:** `docs/coverage/modify.md` (ROTATE, SCALE, MIRROR, STRETCH); rules `cad-tools.md`,
  `cad-engine.md`, `cad-catalogs.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/transforms/<id>.txt` (`.plain.txt` untraced, `.es.txt`
/ `.en.txt` one locale only), run with `scripts/research/probe.sh transforms <ids>` in es-ES and
en-US; the desktop's are `dsk.sh` with `lib-dsk.sh` (MOVE's `drag.ps1`). Transcripts and screenshots
are in `research/probes/transforms/` (gitignored). The common drawing: a circle 200,200 r20, a line
0,50–50,100, the line 0,0–100,0 that `_L` takes, `_ZOOM _W -50,-50 700,700`.

| Id | What it asks |
| --- | --- |
| p00 | ACADVER, `_VERNUM` |
| p100–p159 | ROTATE: names, `_.`, `'ROTATE`; Copy twice; Reference typed, by points, Points, Enter at each prompt; defaults at AUPREC 0 and 4 and after a Reference run; FOO, −30, 0, 400, `_P`, `_LINE`; every point form at the angle, `<30`, `_END`, Ortho; transparency at each prompt; U, REDO, MREDO, a zero turn, a zero Copy; MPDUMP of every type; Copy picked out of order; CLAYER and CECOLOR; Z; UCS Z 30 and X 90; ANGDIR and ANGBASE; noun-verb; Previous; the Spanish letters; Enter, FOO and `@` at the reference's second point |
| p160–p219 | SCALE: names; FOO, Enter, 0, −2, `_P`, 1e-12 at the factor; Copy; Reference typed, by points, 0, −5, FOO, Enter; the new length typed, a point, 0, −5, Enter; Points, Enter at its points, a number; defaults across runs; every point form and snap at the factor; Ortho; transparency at each prompt; U, REDO, UNDO 2, MREDO, a scale by 1, a Copy by 1; `_LINE` at each prompt; MPDUMP of every type; Copy picked out of order; Z, UCS Z 30 and X 90; selection after; the Spanish letters; a point at the factor over ten selections (p219) |
| p220–p289 | MIRROR: names; FOO, Enter, `x,y,z`, `@`, equal points at each point; the point forms, a number, snaps, Ortho, transparency; Yes and No; U; MPDUMP of every type, text and MTEXT, a set out of order; properties, Z, UCS. STRETCH: names; a zero displacement three ways and U; LASTPOINT by each path; `_D` with `@`, a number, `_D`; FOO at its selection; a pick, W, two windows, duplicates, pick and window, Fence, Last, ALL, CP, WP, Remove; every type caught in part. The four commands' selection and Previous afterwards, verb-noun and noun-verb |
| d01–d12 | the drag of ROTATE (the set, the originals, the rubber band, the field), Copy, Reference and Points with the mouse; SCALE's drag and its factor against the distance (d06, d07: a click and a typed point measured), Reference; STRETCH's drag; MIRROR's drag and its Erase prompt; the right button at ROTATE's angle; Polar and Ortho at ROTATE's angle |

## 4. Matrix

Cells read `state · probe · test`; "scratch" is `research/review/transforms/<a|b|c|r>/`. Rows the
same at every prompt take one cell.

### SCL — SCALE

Columns: base point (MOVE's placement: contract), factor (Fa).

| Row | Cells |
| --- | --- |
| A | SCALE, SC, ESCALA, ES, Enter repeat: match · p160, p161 · scratch b replay; `_.SCALE`: known (command-line.md) · p162; `'SCALE` refused: match · p163; `ES`†: stale, SCL-07 |
| B | text en/es, no `<default>` at Fa (table 21190): match · p160, p161 · `transforms.test.ts:753`; keywords `Reference Copy` declared, `[Copy/Reference]` listed, es C, R: match · p164, p218; FOO and another prompt's keyword: `Requires numeric distance, second point, or option keyword.`: match · p164, p169, p209 · `invalidAnswers.test.ts:140`; 0, −2, `@`: differs SCL-01 · p167, p168, p193; 1e-12: differs SCL-05 · p170; Enter: the last factor, 1 at first: match · p165, p166 · `dynamicInputEnter.test.ts:128`; after a Reference run: differs SCL-02 · p188; Copy said at each Copy, still listed: match · p171 · `transforms.test.ts:851` |
| C | a point at Fa (`x,y`, `@dx,dy`, `d<a`): differs SCL-03 · p191, p192, p194, p219, d06, d07; LASTPOINT the base after every path: untested · p191, p192, p195 · scratch b replay |
| D | `_MID` at Fa: differs SCL-03 · p197; Ortho with a typed point: n/a (ORTHOMODE as a command is known) · p200 |
| E | `'ZOOM`, `'-OSNAP` at Fa: match · p201, p203 · scratch b |
| F | U, REDO, UNDO 2, MREDO; U after a scale by 1; a Copy by 1 leaves a duplicate U takes back: untested · p205–p208 · scratch b scale |
| G | another command typed at Fa: refused: match · p209 |
| H | line, arc, circle, polyline widths, MTEXT: match · p210 · scratch b replay; TEXT: untested · p210; ellipse arc: match · p211 · `transforms.test.ts:1432`; spline: untested · p211; block reference position: match · p211; its scale: unverified (MPDUMP has none) · `blocks.test.ts:324`; dimension, hatch's pattern scale: untested · p212 · scratch b h; handles kept in place, new for Copy: match · p171; Copy out of order: differs SCL-04 · p213; Z, thickness, a line's rise: untested · p214 · scratch b z; UCS Z 30, X 90: untested · p215, p216 |
| K | sweep: `specifyNewLengthOr` es-several settled as 21191 · p176; `positiveNonzero` is 20519 · p174 |
| L | match but the findings · p171, p176, p182 |
| M, P, Q | the drag: JIG-02 · d06 |
| N | SCL-06, SCL-08 |

### REF — the Reference options

Columns: RF (ROTATE's reference angle), R2 (its second point), NA (new angle), RL (SCALE's
reference length and its second point), NL (new length), P1/P2 (Points' points).

| Row | RF | R2 | NA | RL | NL | P1/P2 |
| --- | --- | --- | --- | --- | --- | --- |
| B text | match · p105 | differs REF-02 · p106 | differs REF-01 · p105 | match · p172, p176 | match · p172 | ROTATE's: REF-01 · p106; SCALE's: match · p182 |
| B default | `<0>`, but the last after a run: differs REF-03 · p111 | — | differs REF-01, REF-03 · p105, p111 | the last: match · p187 · `transforms.test.ts:783` | the last: match · p187 | — |
| B FOO | match · p158 · `invalidAnswers.test.ts:161` | differs REF-05 · p158 | REF-01 · p135 | match · p173 · `invalidAnswers.test.ts:164` | match · p177 | match · p182 |
| B 0, negative | match (an angle) · p113 | — | match · p150 | differs REF-07 · p174, p175 | differs REF-08 · p178, p179 | — |
| G Enter | `<default>`: match · p108 | differs REF-06 · p157 | differs REF-01 · p107 | match · p172 | match · p180 | P1 known (Missing) · p183; P2 differs REF-10 · p184 |
| C points | typed and picked: match · p105, p126 | `@` from the first: match · p159 | a point from the base: match · p151 | match · p176 | a point from the base: match · p181 | a number at P1 is the new length: match · p185 |
| C LASTPOINT | the base | differs REF-04 · p126 | the base · p151 | the base: match · p176 | the base · p181 | the base: match · p182 |
| D snaps | `_END`: match · p126 | match · p126 | — | match · p199 | `_END`: match · p198 | match · p199 |
| E `'ZOOM` | match · p128 | match · p129 | match · p130 | match · p204 | match · p204 | P1 match; P2 differs REF-09 · p204 |
| H Copy into Reference | match · p150 | — | — | match · p189 | — | — |
| K | `specifyTheReferenceAngle`, `specifyTheNewAngle`: settled · p105 | REF-02 | REF-01 | match | match | match |
| M | JIG-03 · d04 | JIG-03 · d04 | JIG-01 · d04 | JIG-03 · d08 | JIG-02 · d08 | JIG-03 · d05, d08 |

### ROT — ROTATE

Columns: base point (contract), rotation angle (RA).

| Row | Cells |
| --- | --- |
| A | ROTATE, RO, GIRA, GI, repeat: match · p100, p101 · `englishSurface.test.ts:835`; `_.ROTATE`: known · p102; `'ROTATE` refused: match · p103; `GI`†: stale, ROT-03 |
| B | text en/es and `Current positive angle…` first: match · p101, p104 · `transforms.test.ts:644`; keywords `Reference Copy` declared, `[Copy/Reference]` listed: match · p104, p156; Enter the last angle: match · p109 · `dynamicInputEnter.test.ts:111`; FOO, −30, 0, 400, `_P`, `_LINE`: match · p113–p117 · `invalidAnswers.test.ts:128`; the defaults at AUPREC 0 and 4: match, the entry's claim false (ROT-03) · p110 |
| C | a point at RA is its bearing from the base, `@`, `@dx,dy`, `d<a`, `@d<a`: match · p118–p122 · `measuredAnswers.test.ts:188`; `<30`: differs ROT-01 · p123; LASTPOINT the base: match · p118 |
| D | `_END` at RA: match · p124; Ortho with a typed point unbent: match · p125; Ortho and Polar with the cursor: match · d12 |
| E | `'ZOOM`, `'-OSNAP` at RA: match · p127 |
| F | U, REDO, MREDO; a zero turn is the step U names; a zero Copy leaves a duplicate: match · p131–p134 · scratch a |
| G | another command typed: refused · p115; the right button: a menu, Copiar and Referencia among Intro, Cancelar…: owned (LINE's shortcut menus) · d11 |
| H | every type to 1e-14, text, block, dimension: match · p137, p138; handles kept: match · p104; Copy out of order: differs ROT-02 · p139; the copy's properties: match · p140, but no `DERIVED` row (ROT-04); Z, UCS Z 30, X 90: match · p141–p144 · `tiltedUcs.test.ts:109`; ANGDIR, ANGBASE: known (workspace.md, UNITS) · p145–p147, p155 |
| K, L | settled · p101; the history matches but REF-01, REF-02 |
| M, P, Q | JIG-01, JIG-04 · d01–d03 |
| N | ROT-04 |

### JIG — the drag's look

| Prompt | AutoCAD (desktop) | mellowcad | State |
| --- | --- | --- | --- |
| ROTATE's angle, new angle | the set turned, drawn as itself; the originals faded (not under Copy); an amber dashed line from the base (d01–d04) | a blue dashed ghost, originals drawn as they are, a blue dashed arm | differs JIG-01 |
| SCALE's factor, new length | the same, scaled (d06, d08) | the same as ROTATE's | differs JIG-02 |
| RF, RL, P1 | nothing but the cursor (d04-1, d05-1, d08-1) | an arm from the base at RF and RL | differs JIG-03 |
| R2, P2, RL's second point | an amber dashed line from the first point, no set (d04-2, d05-2) | `THEME.selected` dashed at R2 | differs JIG-03 |
| the angle's and length's field | RA, NA and NL hold the default (0, 1.0000), Fa the dragged factor (d01, d06, d08) | the dragged bearing and distance | differs JIG-04 |
| MIRROR's second point, Erase | the reflection as itself; the originals keep the selection's glow; an amber dashed line from the first point; the reflection still drawn at Erase (d10) | a dashed ghost, a `THEME.selected` axis; nothing at Erase | differs JIG-05 |

### MIR — MIRROR

Columns: P1, P2, E (Erase source objects).

| Row | Cells |
| --- | --- |
| A | MIRROR, MI, SIMETRIA, SI, repeat: match · p220, p221; `'MIRROR`: match · p222; `SI`†: stale, MIR-06 |
| B | text en/es (tables 21151, 21152): match · p226 · `transforms.test.ts:920`; FOO `Invalid 2D point.` / `Invalid option keyword.`: match · p226 · `invalidAnswers.test.ts:85`; `S`, and `Y` refused in Spanish: match · p231, p232 |
| C | `x,y,z` and `*x,y` refused: match · p233, p234, p241; `@dx,dy`, polar: match · p237; a number at P2: untested · p238; equal points: differs MIR-03 · p235, p236; LASTPOINT P2: match · p239 · `lastPoint.test.ts:58` |
| D | `_END`, `_MID`, Ortho with a typed point: untested · p242, p243 |
| E | `'ZOOM` at P1, `'-OSNAP` at E: untested · p244, p245 |
| F | U after No, Yes, a zero line: untested · p246–p248 |
| G | Enter at P1, P2: differs MIR-02 · p228, p229; Enter at E is No: match · p230 · `transforms.test.ts:922` |
| H | Yes in place, handles kept: match · p227 · `transforms.test.ts:957`; No out of order: differs MIR-04 · p284; arc, bulge, spline, dimension, block: match · p282 · `blocks.test.ts:332`; hatch's angle: differs MIR-05 · p282; text, MTEXT: differs MIR-01 · p283; properties, Z, thickness: match · p285 · `currentProperties.test.ts:194`; UCS Z 30: untested · p240; X 90: match · p286 · `tiltedUcs.test.ts:132` |
| M, P, Q | JIG-05 · d10 |

### STR — STRETCH

| Row | Cells |
| --- | --- |
| A | STRETCH, S, ESTIRA, EI, repeat: match · p223, p224; `'STRETCH`: match · p225; `EI`†: stale, STR-08 |
| B | the selection line en/es: match · p223, p224; FOO lists the modes without Group: match · p258 · `invalidAnswers.test.ts:232`; a pick, W, Fence, WP move whole; two windows stretch each; pick and window; CP; Remove: match · p262–p270 · `selectionModes.test.ts:677`; Last, ALL: differs STR-03 · p268; a duplicate window or pick: differs STR-04 · p265, p279 |
| C | LASTPOINT the second point, the base at Enter, `_D 3,4`, `@`, `@5,0`, a pick: match · p249, p250, p254–p257 · `lastPoint.test.ts:619`; Displacement from LASTPOINT: differs STR-05 · p251, p259, p260; `_D` at the displacement: differs STR-07 · p261 |
| F | a zero displacement, three ways, and U: match (MOVE-D3) · p249–p253 · scratch c |
| H | a line's end, polyline vertices, circles: match · p271; arcs: differs STR-01 · p271; a polyline arc segment: differs STR-02 · p271, p281; text, MTEXT, block by the insertion point: match · p272; a dimension's origin: match · p273; its line point and text: differs STR-06 · p274, p275; hatch: refuted (§10) · p276, p277, p280; splines: match · p278 |
| M, P, Q | the drag as MOVE's: match · d09 |

### The four commands' selection

`(ssget "_I")` nil after each, Previous the edited set (MIRROR No: the originals; a zero mirror line:
the set): match · p287–p289 · `selection.test.ts:1432`, scratch c shared.

## 5. Findings

### High

#### SCL-03 — A point at the scale factor scales by its distance; AutoCAD divides it by half the largest side of the set's extents

- **Severity:** high · **Row:** C, D, M · **Status:** verified
- **Where:** `cad/application/tools/ScaleTool.ts` `resolveDirectFactor`, shared by the click, a typed
  point and the preview; the class JSDoc; `runtimeMeasure.ts`' comment on SCALE's factor
- **AutoCAD:** p219, a point `@10,0` from the base: a 100 line → 0.2 (k 50), a 30×10 or 10×30
  rectangle → 0.667 (15), a 20×20 square → 1 (10), a 45° line of extents 30×30 → 0.667 (15), a circle
  r5 → 2 (5), a POINT → 10 (k 1), two lines of extents 210×100 → 0.0952 (105); the base at 500,500
  and VIEWSIZE 3000 change nothing. p191, p192, p197 agree; desktop d06 (the dragged field 0.8058 at
  10 units, 1.6010 at 20, the line and circle's extents 25×20) and d07 (a click, `#50,20`).
- **mellowcad:** scratch b `scale.test.ts` "p219": a point 10 away scales by 10.
- **Scenario:** a 100-long line, SCALE, base, a click 50 away → AutoCAD leaves it as it is → here
  fifty times longer.
- **Fix:** divide the distance by k, half the largest side of the originals' extents in the UCS
  frame (`entitiesBounds(originals, ctx.blocks)`), 1 when they are a point (TRANSFORMS-D10). The
  new length, the reference length and Points stay direct (p176, p181, p182, p198).
- **Regression test:** `transforms.test.ts`: p219's cases, a click and the preview.
- **Coverage, rules or catalogs affected:** modify.md SCALE; the JSDoc and `runtimeMeasure.ts`;
  `cad-tools.md` "A distance or an angle takes a point too" names the exception.

#### REF-01 — ROTATE's new angle lacks `[Points]` and its `<default>`; Enter there ends unturned

- **Severity:** high · **Row:** B, G · **Status:** verified (was **unverified** in Missing)
- **Where:** `RotateTool.ts` `question()` (`specifyTheNewAngle`), `commitAngle`
- **AutoCAD:** p105 `Specify the new angle or [Points] <0>:` (es `Precise el nuevo ángulo o
  [Puntos] <0>:`, table 21188; desktop d04-cl3); p107 Enter after a reference of 30 turns by −30;
  p106, p154 Points asks `Specify first point:` and ` Specify second point:`, the angle between
  them; p135 FOO there `Requires valid numeric angle, second point, or option keyword.`; p111 the
  default is the last new angle.
- **mellowcad:** scratch a `rotate.test.ts` "p105", "p107": `Specify the new angle:`, Enter ends.
- **Scenario:** ROTATE, Reference by two points on an edge, then Points on the edge to align with
  → refused here; Enter for the last new angle → nothing turns.
- **Fix:** the new angle names `specifyTheNewAngleOr` with `{ angle: lastNewAngle }`, offers Points
  (the angle between two points, measured by the runtime), Enter takes the default
  (TRANSFORMS-D1).
- **Regression test:** `transforms.test.ts` p105, p106, p107, p154; es `P` (p156).
- **Coverage, rules or catalogs affected:** modify.md ROTATE (Missing's line goes); a prompt id
  `specifyTheNewAngleOr` (en, es); the English surface.

#### MIR-01 — Mirrored TEXT and MTEXT only move their insertion point; AutoCAD mirrors the text's box and keeps it readable

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `cad/domain/entityTransforms.ts`, the text, MTEXT and ATTDEF cases of the mirror
- **AutoCAD:** p283 (MIRRTEXT 0, mirror line x = 0): TEXT at 10,10, 30° → position
  (−22.668, 17.314), rotation 330°, BaseLeft; a right-justified TEXT aligned at 50,40 →
  AlignmentPoint (−32.527, 40), BaseRight; MTEXT TopLeft at 10,80 → TopRight at (−10, 80).
- **mellowcad:** scratch c `mirror.test.ts` "p283": rotation 30° kept, anchors mirrored as points,
  the MTEXT still top-left.
- **Scenario:** mirror half a labelled part → AutoCAD's labels sit where the mirrored text was,
  readable → here each runs the other way from the far side of its anchor.
- **Fix:** with MIRRTEXT 0 (the only value here), mirror the text's box and keep it readable: the
  rotation reflected (2α − θ, plus π where needed so it reads left to right), the anchor taken from
  the mirrored opposite end of the box, the justification kept; MTEXT's and ATTDEF's attachment
  swaps left and right (TRANSFORMS-D20).
- **Regression test:** `transforms.test.ts`, p283's three objects.
- **Coverage, rules or catalogs affected:** modify.md MIRROR (Implemented: MIRRTEXT 0's result;
  Missing keeps the variable).

#### STR-01 — STRETCH never bends an arc

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `entityTransforms.ts` `stretchEntity`'s circle, arc and ellipse case; `StretchTool`'s
  JSDoc ("circles and arcs never deform")
- **AutoCAD:** p271, window x 90..110, displacement 10,5: the arc centre 50,100 r50 0°–90° with its
  start caught → start (110,105), end (50,150), centre (55.586, 94.948), r 55.3347, the chord height
  14.645 kept; an arc with its centre caught and both ends out stays.
- **mellowcad:** scratch c `stretch.test.ts` "p271": the first stays, the second moves whole.
- **Scenario:** stretch an outline whose fillet arcs end in the window → here the arcs come loose.
- **Fix:** an arc's stretch points are its ends; one caught refits the arc through the moved and the
  fixed end with the same chord height on the same side; both caught move it whole; the centre
  alone, nothing. Circles as now (TRANSFORMS-D24).
- **Regression test:** `transforms.test.ts`, p271's two arcs.
- **Coverage, rules or catalogs affected:** modify.md STRETCH; the JSDocs.

### Medium

#### SCL-01 — 0, a negative or `@` at the factor ends SCALE; AutoCAD refuses and asks again

- **Severity:** medium · **Row:** B, C · **Status:** verified
- **Where:** `ScaleTool.ts`' commit ("a no-op that ends", no WHY)
- **AutoCAD:** p167, p168, p193: `Value must be positive and nonzero.` (es `El valor debe ser
  positivo y diferente de cero.`, 20519), the prompt again.
- **mellowcad:** scratch b "p167, p168, p193": the command ends; the 2 typed next is an unknown
  command.
- **Fix:** report `positiveNonzero` and keep asking, as `CircleTool` does (TRANSFORMS-D11).
- **Regression test:** `transforms.test.ts`, en and es; it replaces "refuses a non-positive factor",
  which pins the wrong ending.

#### SCL-02 — Enter at the factor after a Reference run scales by 1

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p188: Reference 50 → 100, then SCALE, Enter: the line doubles again.
- **mellowcad:** scratch b "p188": unchanged.
- **Fix:** every run that scales sets the last factor (TRANSFORMS-D12).
- **Regression test:** `dynamicInputEnter.test.ts` (p188).

#### SCL-04 — SCALE Copy adds its copies in pick order

- **Severity:** medium · **Row:** H · **Status:** verified · CPY-03's analogue
- **AutoCAD:** p213: the copy of the object earlier in the drawing is appended first.
- **mellowcad:** scratch b "p213": pick order.
- **Fix:** the originals in drawing order, one helper for ROTATE, SCALE and MIRROR, moved out of
  `PlacementTool.ts` (TRANSFORMS-D13).
- **Regression test:** `transforms.test.ts` (p213) with ERASE Last after it.

#### REF-03 — ROTATE's defaults after a Reference run are not that run's

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p111: after `_R 12.5 40` the next ROTATE offers `<28>` (the 27.5° turn, AUPREC 0),
  `_R` offers `<13>` and the new angle `<40>`; Enter, Enter turns 27.5° again. p112.
- **mellowcad:** scratch a "p111": `<0>`, `<0>`.
- **Fix:** keep the turn, the reference and the new angle as per-drawing defaults (`onNewDrawing`)
  (TRANSFORMS-D2).
- **Regression test:** `transforms.test.ts` (p111, p112).

#### REF-04 — LASTPOINT after picked reference points is the last pick; AutoCAD's is the base

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p126, p152, p106: LASTPOINT the base after the reference's points.
- **mellowcad:** scratch a "p126": the second reference point.
- **Fix:** the reference angle measured by the runtime (TRANSFORMS-D3), which keeps LASTPOINT as
  SCALE's reference length does (p176: match).
- **Regression test:** `lastPoint.test.ts` (p126).

#### REF-06 — Enter at the reference's second point ends ROTATE; AutoCAD goes on to the new angle

- **Severity:** medium · **Row:** G · **Status:** verified
- **AutoCAD:** p157: Enter → `Specify the new angle or [Points] <0>:`.
- **mellowcad:** scratch a "p157": `Command:`.
- **Fix:** with TRANSFORMS-D3: the runtime's second point takes Enter as SCALE's does (p184's
  console reading is its cursor, so the reference taken stays **unverified**).
- **Regression test:** `transforms.test.ts` (p157).

#### REF-07 — A reference length of 0 or a negative is taken as the default

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p174, p175: `Value must be positive and nonzero.`, the prompt again.
- **mellowcad:** scratch b "p174, p175": 1 taken, the new length asked.
- **Fix:** refuse with `positiveNonzero` (TRANSFORMS-D11).
- **Regression test:** `transforms.test.ts`.

#### REF-08 — A new length of 0 or a negative ends SCALE unscaled

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p178, p179: refused as REF-07.
- **mellowcad:** scratch b "p178, p179": the command ends.
- **Fix:** TRANSFORMS-D11. **Regression test:** `transforms.test.ts`.

#### REF-09 — A transparent command at a runtime-measured ` Specify second point:` drops the first point

- **Severity:** medium · **Row:** E · **Status:** verified · **Area:** transparency (LINE's review)
- **Where:** `CadRuntime.ts` `measuringFrom()`: the measure is dropped once the session changed
- **AutoCAD:** p204: `'_ZOOM _E` at Points' second point → `Resuming SCALE command.` /
  ` Specify second point: 30,0`, the line scaled.
- **mellowcad:** scratch b `measure.test.ts`: back to `Specify first point:` (and to the reference
  length at its second point; OFFSET's and FILLET's distances by two points alike, AutoCAD
  unprobed there).
- **Fix:** keep the measure across a transparent command (TRANSFORMS-D15).
- **Regression test:** `transparentCommands.test.ts` (p204).

#### REF-10 — Enter at Points' second point ends SCALE unscaled, a gap the entry does not list

- **Severity:** medium · **Row:** G · **Status:** verified on mellowcad's side; AutoCAD's length is
  its cursor's (p183, p184: the new length's drag reading)
- **Fix:** none until a desktop probe; Missing names P2 beside P1 (TRANSFORMS-D16).

#### ROT-01 — `<30` at the rotation angle is the angle in AutoCAD; here an angle override

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p123: `<30` answers 30°, ROTATE ends (end 86.6025, 50).
- **mellowcad:** scratch a "p123": `Angle Override: 30`, the prompt again.
- **Fix:** `answersAngleOverride()` true at the rotation angle, as ELLIPSE's
  (TRANSFORMS-D4); RF and NA unprobed, left as they are.
- **Regression test:** `transforms.test.ts` (p123).

#### ROT-02 — ROTATE Copy adds its copies in pick order

- **Severity:** medium · **Row:** H · **Status:** verified · CPY-03's analogue
- **AutoCAD:** p139: `ERASE _L` erases the copy of the object later in the drawing.
- **Fix:** TRANSFORMS-D13. **Regression test:** `transforms.test.ts` (p139).

#### JIG-01 — ROTATE drags a dashed blue ghost; AutoCAD drags the set as itself

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** desktop d01, d02: the set turned, solid in its own colours; the originals faded where
  they were; an amber dashed line from the base to the cursor; under Copy the originals as they are
  (d03); the new angle the same (d04-3).
- **mellowcad:** scratch r `look.test.ts` "d01".
- **Fix:** the drag drawn as PlacementTool's — one helper for the set as itself and the amber line —
  and `fadedEntityIds` for the originals unless Copy (TRANSFORMS-D30).
- **Regression test:** `transforms.test.ts`, beside "the drag of MOVE and COPY".

#### JIG-02 — SCALE drags a dashed blue ghost

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** desktop d06, d08-3: as ROTATE's.
- **Fix:** TRANSFORMS-D30. **Regression test:** as JIG-01.

#### JIG-03 — Reference's prompts draw a line from the base; AutoCAD draws nothing until the second point

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** d04-1, d05-1, d08-1: nothing at the reference's first prompt or Points' first point;
  d04-2, d05-2, d08: the second point an amber dashed line from the first, no set.
- **mellowcad:** scratch r "d04": an arm from the base at RF; RL's too.
- **Fix:** with TRANSFORMS-D3 the runtime draws the second point's line; nothing at the first.
- **Regression test:** `transforms.test.ts`.

#### JIG-05 — MIRROR drags a dashed ghost and loses it at Erase

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** d10: the reflection as itself, the originals with the selection's glow, an amber
  dashed line from the first point; at `Erase source objects?` the reflection stays drawn.
- **mellowcad:** scratch r "d10".
- **Fix:** TRANSFORMS-D30, and the erase phase keeps the reflection.
- **Regression test:** `transforms.test.ts`.

#### MIR-02 — Enter at a mirror-line point ends MIRROR; AutoCAD refuses

- **Severity:** medium · **Row:** G · **Status:** verified
- **AutoCAD:** p228, p229: `Invalid 2D point.`, the prompt again (AllowNone false, p226).
- **mellowcad:** scratch c "p228", "p229": the command ends.
- **Fix:** refuse and keep asking (`cad-tools.md`: a point prompt asked again at Enter)
  (TRANSFORMS-D21).
- **Regression test:** `invalidAnswers.test.ts`, en and es.

#### MIR-03 — A mirror line of no length ends MIRROR in silence

- **Severity:** medium · **Row:** C, L · **Status:** verified
- **AutoCAD:** p235, p236: `Points must be distinct.` (es `Los puntos tienen que ser distintos.`,
  21153), then `Command:`; p248: U names MIRROR.
- **Fix:** a message `pointsMustBeDistinct` (en, es, ar), then end (TRANSFORMS-D22).
- **Regression test:** `transforms.test.ts` (p235, p236).

#### MIR-04 — MIRROR No adds its copies in pick order

- **Severity:** medium · **Row:** H · **Status:** verified · CPY-03's analogue
- **AutoCAD:** p284. **Fix:** TRANSFORMS-D13. **Regression test:** `transforms.test.ts` (p284).

#### STR-02 — A polyline arc segment stretched at one end keeps its bulge; AutoCAD keeps its chord height

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p281: bulge −1 → −0.908153 with the end 100,0 → 110,5 (the chord height 50 kept).
- **Fix:** a segment with one end moved takes the bulge that keeps its height (TRANSFORMS-D24).
- **Regression test:** `transforms.test.ts` (p281).

#### STR-03 — Last and ALL move their objects whole; AutoCAD stretches nothing of them

- **Severity:** medium · **Row:** B, H · **Status:** verified
- **AutoCAD:** p268: `_L` and `_ALL` find their objects and nothing moves; a pick, Fence and WP move
  whole (p262, p267, p269).
- **Fix:** objects added by Last or ALL are neither framed nor whole (TRANSFORMS-D25; Previous and
  Group unprobed).
- **Regression test:** `transforms.test.ts` (p268).

#### STR-04 — An object found again by a later window or pick changes how it stretches

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p265, p279: `1 found (1 duplicate)` — the first addition rules; p264: two windows on
  two objects stretch each.
- **Fix:** each object keeps how it was first added and is stretched by its own frame only
  (TRANSFORMS-D25).
- **Regression test:** `transforms.test.ts` (p264, p265, p279).

#### STR-05 — STRETCH's `Specify displacement` reads from LASTPOINT; MOVE's from the UCS origin

- **Severity:** medium · **Row:** C · **Status:** verified · **Area:** placement (MOVE's review)
- **AutoCAD:** p251 (trace: UseBasePoint false, a Displacement keyword), p259 `ID 7,8`, `_D @10,5` →
  (17,13); p260 `_D 10` → 10 from 7,8 towards the cursor; Enter keeps LASTPOINT.
- **mellowcad:** scratch c "p251", "p259", "p260".
- **Fix:** a `PlacementTool` hook: STRETCH's displacement keeps LASTPOINT (TRANSFORMS-D26).
- **Regression test:** `lastPoint.test.ts` (p251, p259, p260).

#### STR-06 — A stretched dimension's line follows both origins, not its own point

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p274: the window over the second origin and the dimension line's point raises the
  line; p273 (the origin alone) as here; p275 the text alone moves the text and the line.
- **Fix:** the line moves when its point (DXF 10) is caught (TRANSFORMS-D27); the text's own
  position is not modelled: Missing.
- **Regression test:** `transforms.test.ts` (p273, p274).

### Low

#### SCL-05 — A tiny factor is applied in silence; AutoCAD says `Extremely small scale factor ignored.`

- **Severity:** low · **Status:** verified for the message (p170, es `Factor de escala demasiado
  pequeño ignorado.`, 21197); the threshold and what follows are **unverified** (the console then
  read its cursor) · **Fix:** none until the desktop; Missing (TRANSFORMS-D14).

#### SCL-06 — Stale citations and a false JSDoc

- **Severity:** low · `ScaleTool.ts` cites 2023's console and "2026's prompt" (2027 agrees: p160,
  p172, p187); its JSDoc's factor (SCL-03); tests without a probe: `transforms.test.ts` SCALE,
  `dynamicInputEnter.test.ts:128` (p165, p166), `polylineWidths.test.ts:561` (`acc/w8` → p210).

#### SCL-07 — The † on ES is stale

- **Severity:** low · p161: it runs in the installed es-ES, as MOV-01 found; GI, SI and EI alike
  (ROT-03, MIR-06, STR-08: p101, p221, p224).

#### SCL-08 — Paths that hold and no test holds

- **Severity:** low · LASTPOINT after every path, U, REDO, UNDO 2, MREDO, a Copy by 1, Z, the UCS,
  hatch and dimension, the Spanish letters (p195–p217): the scratch tests move into the test files.

#### REF-02 — ROTATE's reference second point is ` Specify second point:` (es ` Designe segundo punto:`)

- **Severity:** low · **Row:** B, K, L · **Status:** verified · p106 (table 26278), desktop d04-cl3
  (`Precise ángulo de referencia <0>:  Designe segundo punto:` on one line)
- **Fix:** TRANSFORMS-D3, the runtime's `secondPointOfDistance`.

#### REF-05 — A refusal at the reference's second point

- **Severity:** low · **AutoCAD:** p158, p136: `Requires valid numeric angle or two points.`, and the
  two points start over · **Fix:** TRANSFORMS-D3, as the runtime's measure refuses.

#### ROT-03 — The ROTATE entry's false claims

- **Severity:** low · "defaults written at the drawing's precision where AutoCAD's AUPREC 0 writes
  `<0>`": both follow AUPREC (p110); `Specify second point:` (REF-02); "Enter there ends ROTATE,
  **unverified**" (REF-01); `GI`†.

#### ROT-04 — ROTATE's tests cite nothing, and ROTATE Copy has no `DERIVED` row

- **Severity:** low · `transforms.test.ts` ROTATE, `dynamicInputEnter.test.ts:111`,
  `invalidAnswers.test.ts:128`, `measuredAnswers.test.ts:188`, `blocks.test.ts:321`,
  `settingsPrompts.test.ts:207` (p104, p105, p109, p110, p113, p118, p138, p158);
  `currentProperties.test.ts` (p140).

#### JIG-04 — The angle and length fields show the dragged reading; AutoCAD's show the default

- **Severity:** low · **Row:** Q · **Status:** verified · d01, d04-3, d08-3: RA, NA and NL hold the
  default; d06: Fa shows the dragged factor (distance / k, SCL-03)
- **Fix:** `setDefault` at RA, NA and NL (TRANSFORMS-D31).

#### MIR-05 — A mirrored hatch's pattern angle reads 180°; AutoCAD's 0°

- **Severity:** low · p282 about the Y axis · **Fix:** none until a hatch at 30° is probed;
  **unverified** in Missing (TRANSFORMS-D28).

#### MIR-06 — MIRROR's drift

- **Severity:** low · `SI`†; `cad-tools.md` names "MIRROR's later points" 2D where both are (p233);
  tests without a probe (`transforms.test.ts` MIRROR p220, p226; `invalidAnswers.test.ts:85` p226;
  `lastPoint.test.ts:58` p239; `tiltedUcs.test.ts:132` p286; `blocks.test.ts:332` p282).

#### STR-07 — `_D` at STRETCH's displacement asks the second point; refused here

- **Severity:** low · p261 · **Fix:** with STR-05's hook (TRANSFORMS-D29).

#### STR-08 — STRETCH's drift

- **Severity:** low · `EI`†; the JSDocs of `StretchTool` (arcs) and `stretchEntity` (bulges); the
  comment on a zero displacement cites p249–p253; `selectionModes.test.ts:684` `toEqual` on a point;
  `elevation.test.ts:672` without a 2027 probe; tests without a probe (`invalidAnswers.test.ts:232`
  p258, `selectionModes.test.ts:677` p269).

## 6. Decisions taken

| Id | Decision | Why |
| --- | --- | --- |
| TRANSFORMS-D1 | Build the new angle's Points and `<default>` | the probes settled the Missing line; a common gesture |
| TRANSFORMS-D2 | ROTATE's turn, reference and new angle are per-drawing defaults, set by every run | p111; as the factor (rectang/p314) |
| TRANSFORMS-D3 | ROTATE's reference angle measured by the runtime (an angle box, no snap of its own), as SCALE's reference length | `cad-tools.md`: never a two-point measure in a tool; it settles REF-02, REF-04 to REF-06 and JIG-03 at once |
| TRANSFORMS-D4 | `<a` answers the rotation angle only | p123; RF and NA unprobed |
| TRANSFORMS-D10 | SCALE's k from the extents in the UCS frame | a tool works in the UCS frame; the WCS reading unprobed (a 45° UCS) |
| TRANSFORMS-D11 | 0 and negatives refused with `positiveNonzero` at the factor, reference and new length | p167, p174, p178 |
| TRANSFORMS-D12 | every SCALE run sets the factor's default | p188 |
| TRANSFORMS-D13 | one drawing-order helper for ROTATE, SCALE and MIRROR copies | CPY-03; the helper leaves `PlacementTool.ts` |
| TRANSFORMS-D14, D16 | the tiny factor and Enter at Points' points stay in Missing | the console reads its cursor there |
| TRANSFORMS-D15 | the runtime keeps a measure across a transparent command | p204 |
| TRANSFORMS-D20 | MIRRTEXT 0's mirror for TEXT, MTEXT, ATTDEF | p283; the variable stays Missing |
| TRANSFORMS-D21 | Enter refused at the mirror line's points | p228, p229 |
| TRANSFORMS-D22 | `pointsMustBeDistinct` (21153) | p235 |
| TRANSFORMS-D24 | arc ends and polyline arc segments keep their chord height | p271, p281; hatch loops left as they are |
| TRANSFORMS-D25 | each STRETCH object keeps how it was first added; Last and ALL stretch nothing | p264, p265, p268, p279; Previous and Group unprobed |
| TRANSFORMS-D26, D29 | a `PlacementTool` hook for STRETCH's displacement from LASTPOINT, with its `_D` | p251, p259–p261 |
| TRANSFORMS-D27 | a dimension's line follows its own point; the text's position Missing | p273–p275 |
| TRANSFORMS-D28 | a stretched hatch caught in part keeps stretching its loop (AutoCAD's associative default), with a WHY; a mirrored hatch's angle unverified | p276, p277, p280, p282 |
| TRANSFORMS-D30 | ROTATE's, SCALE's and MIRROR's drags drawn by one helper with PlacementTool's | d01–d10; one look for every transform |
| TRANSFORMS-D31 | the angle and length fields show the default | d01, d04, d08 |

## 7. Tests proposed

The regression test of each finding first, in the files named there, each citing its probe. Then:
`transforms.test.ts` gains p104, p109 (ROTATE), p171, p187 (SCALE), p220, p226 (MIRROR), p223, p249
(STRETCH) as citations on the tests that already hold them; the scratch tests of SCL-08 move as they
are; `currentProperties.test.ts` gains ROTATE Copy's row (p140); `lastPoint.test.ts` p126, p251,
p259; `invalidAnswers.test.ts` the Spanish refusals (p113, p226). Old citations replaced:
`polylineWidths.test.ts:561` `acc/w8` → p210; `elevation.test.ts:672` stays without a 2027 probe
(§9).

## 8. What is not tested and why

The dynamic-input labels' Spanish (`rotationAngle`, `referenceAngle`, `newAngle`, `scaleFactor`,
`referenceLength`, `newLength`, `mirrorFirstPoint`, `mirrorSecondPoint`): the desktop shows them in
the tooltip only as the prompt's words (d01, d06, d10), and the harness holds the catalog; the
badge on the cursor (a turning arrow, SCALE's square, COPY's dots: d01, d06, d03) is the
presentation's.

## 9. What could not be reviewed and why

- Escape at each prompt with a preselection, and the right button at the Reference prompts and at
  MIRROR's: no desktop time left in this session (the erase/d10 pass covers Escape at `Select
  objects:`).
- STRETCH with a 3D displacement on 2027, Previous and Group at its selection, an arc with both ends
  caught and its centre out, a dimension with both origins caught and its point out, noun-verb
  STRETCH's geometry: subagent C's range was spent.
- SCALE's k in a turned UCS, a block reference's scale after SCALE, the Reference defaults across
  OPEN: subagent B's range was spent.
- `<a` at ROTATE's reference and new angle on the desktop.

## 10. Refuted in the adversarial pass

- `<1.00>` against AutoCAD's `<1.0000>` at SCALE's lengths: the LUPREC 2 deviation with its WHY.
- A stretched hatch caught in part: AutoCAD's associative hatch stretches its loop as here (p276);
  a non-associative one stays (p277), and associativity is not modelled (MOVE-D11).
- "Only the last window is used" (the help): p264, both windows count.
- STRETCH by zero: AutoCAD writes a `db.modified` that changes no geometry; U as here (p249–p253).
- The console's 3399.45 at Points' Enter and its 6.7989 after a tiny factor: its fixed cursor.
- ROTATE's `<0.00>` default against AUPREC: both follow AUPREC (p110).
- Half the diagonal, base to centre or the view's size as SCALE's k: p219.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Source | State |
| --- | --- | --- |
| modify.md ROTATE: the reference's `Specify second point:` | p106 | false (REF-02) |
| modify.md ROTATE: "Enter there ends ROTATE, **unverified**" | p107 | false (REF-01) |
| modify.md ROTATE: the defaults' precision against AUPREC | p110 | false (ROT-03) |
| modify.md SCALE: a point at the factor (implied a distance) | p219 | false (SCL-03) |
| modify.md SCALE Missing: "2023's console scales by a length of its own" at Points | p183, p184 | no longer the reason (REF-10) |
| modify.md MIRROR: the text mirrored | p283 | false (MIR-01) |
| modify.md STRETCH: "Last … moving whole" | p268 | false (STR-03) |
| modify.md STRETCH: "MOVE's … base point" | p251 | false at the Displacement (STR-05) |
| modify.md: `GI`†, `ES`†, `SI`†, `EI`† | p101, p161, p221, p224 | stale |
| `cad-tools.md` "Never write a two-point distance in a tool" | RotateTool's refP1/refP2 | broken (REF-02); the rule names angles too |
| `cad-tools.md` "a point prompt the console asks again at Enter… returns `true`" | MirrorTool | broken (MIR-02) |
| `cad-tools.md` "Every creating command has a row" | ROTATE Copy | broken (ROT-04) |
| `cad-tools.md` "MIRROR's later points" 2D | p233 | stale (MIR-06) |
| `cad-tools.md` "A distance or an angle takes a point too" | SCALE's factor | an exception to name (SCL-03) |

Checked and holding: the prompts and messages en and es; Copy's report and its place; the four
commands' names and aliases; the UCS and Z of every transform; arcs and bulges mirrored
(`cad-engine.md`); a run that does nothing is a step (`cad-tools.md`); a command's end drops the
selection (`cad-runtime.md`).

## 12. Order of execution and estimate

| Order | Block | Blocks it | Size |
| --- | --- | --- | --- |
| 1 | SCL | — | small: the factor's k, refusals, defaults, copy order helper |
| 2 | REF | after SCL (both edit `ScaleTool.ts`) | large: ROTATE's reference by the runtime, the new angle's Points and default, the measure across transparency |
| 3 | ROT | after REF | small |
| 4 | JIG | after REF (the states it draws) | medium: one drag helper for three tools |
| 5 | MIR | after JIG (`MirrorTool.ts`) | medium: the text mirror |
| 6 | STR | — | medium: arcs, bulges, the adding modes, the displacement hook |

The catalogs (`specifyTheNewAngleOr`, `pointsMustBeDistinct`) and the English surface snapshot are
shared: the blocks run one after another.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/modify.md`: ROTATE, SCALE, MIRROR, STRETCH rewritten per block; the † dropped.
- `cad-tools.md`: the two-point rule names angles; SCALE's factor named as its exception; MIRROR's
  points both 2D; the drag of every transform is PlacementTool's.
- Catalogs: `specifyTheNewAngleOr`, `pointsMustBeDistinct` (en, es).
- Roadmap: Transforms `done`, owning the Reference options.

## 14. Template improvements

- A jig's reading can differ from a plain distance: on the desktop, read the object after a click
  at a known distance, not only the look (SCALE's k came from d06's field, d07's click).
- A desktop surprise goes at once to the subagent owning that prompt (SCALE's k was settled by ten
  console cases within the hour).
- Each subagent writes in a scratchpad folder of its own: two overwrote a shared helper.
- Give a subagent covering a command and its options 70 probe ids, not 60: B's and C's ranges ran out
  before their last questions.
- On the desktop, wait a second after typing a command before the first pick: a pick sent at once
  missed and the command ended with nothing selected (d11's first try).
