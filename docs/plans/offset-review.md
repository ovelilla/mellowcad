# OFFSET review

> **Status:** plan, 2026-10-22 — phases 0–4 of skill `command-review`, the eleventh review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (OFP, OFS, OFG, OFJ).

## 1. Summary

7 high, 19 medium and 10 low findings over four blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| OFP | the picks and points: `Select object to offset`, the side point, the through point | 1 | 6 | 1 |
| OFS | the command line: names, prompts, keywords, the distance, Undo, preselection | 1 | 4 | 4 |
| OFG | what it produces: every type, polylines, Through, Multiple, properties, planes | 5 | 7 | 3 |
| OFJ | the look: the ghost, the boxes, the menus, the rollover | 0 | 2 | 2 |

The worst: every point typed at `Specify point on side to offset` and `Specify through point` is
refused (`Point or option keyword required.`), where AutoCAD takes `x,y`, `@dx,dy` from the object's
pick, `d<a`, a number and the object snaps (OFP-02: p253–p276, p263–p266); one object selected
before OFFSET is dropped and asked for again, where AutoCAD goes straight to the side (OFS-05: p165,
p251, p290); a polyline offset inward keeps segments that vanished and crosses itself, never splits
in two, never drops the arcs a rounded corner loses (it makes nothing at all), and joins segments
that no longer meet with a jump instead of an arc round the vertex (OFG-01 to OFG-04: p183, p187,
p188, p230); which side a polyline goes to is judged against its arcs' chords (OFG-05: p226).

The analogues Transforms left, checked first: a two-point distance keeps its first point across
`'ZOOM` and asks the second again (REF-09 holds: p01, scratch r), and the runtime draws the amber
dashed line from it with the dragged reading in the box (JIG-03 holds: desktop d01-2, scratch r
`look.test.ts`); U after an OFFSET that offset nothing names it and keeps the drawing (STP-01 holds:
p02, p03); the copies' order matters only where one offset makes several objects, which AutoCAD
appends in the order of the source (OFG-03, CPY-03's analogue: p188). OFFSET leaves nothing
selected (p164, p252, p287).

## 2. Inventory

Commit `2f1b464`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The command:** `cad/application/tools/OffsetTool.ts` (its own geometry: `computeOffset`,
  `computeThrough`, `offsetPolyline`, the joins); `defaultTools`, `TOOL_COMMANDS` (OFFSET); not
  transparent (p107). Catalogs: names OFFSET (`O`; es DESFASE, `DF`, `EQ`), keywords Through, Thru,
  Erase, Layer, Yes, No, Current, Source, Exit, Undo, Multiple, `keywordLabels.OFFSET.Through`,
  prompts `specifyOffsetDistanceOr`, `eraseSourceObjectAfterOffsetting`,
  `enterLayerOptionForOffsetObjects`, `selectObjectToOffsetOr`, `specifyPointOnSideToOffsetOr`,
  `specifyThroughPointOr`, `nextObject`, the box's `offsetDistance`, message `offsetSettings`; `ar`
  has no command language. The rail (`components/cad/tool-rail.tsx`), the landing's filing
  (`content/commands.ts`), the demo (`content/demos/hero.ts`).
- **The runtime it leans on:** the two-point measure (`cad/application/runtimeMeasure.ts`,
  `CadRuntime.measurePoint`), `typedPick`, the object snap overrides (`pointModifier`), the command
  menu (`cad/application/runtimeShortcutMenu.ts`), `promptRefusal.ts`' `"object"` refusal.
- **Tests:** `editing.test.ts` (`describe("OFFSET"`), `ambiguousKeywords.test.ts`,
  `invalidAnswers.test.ts`, `measuredAnswers.test.ts`, `dynamicInputEnter.test.ts`,
  `currentProperties.test.ts`, `elevation.test.ts`, `polylineWidths.test.ts`,
  `englishSurface.test.ts`, `newDrawingResets.test.ts`, `locale.test.ts`, `commandCatalog.test.ts`,
  `DemoScript.test.ts`.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after it; ID for LASTPOINT; -LAYER
  Lock; SELECT and MOVE before Previous.
- **Areas cited:** LINE's (the command line, point input, object snaps, Ortho, Polar, dynamic input,
  transparency, undo, the shortcut menus), ERASE's (selection, preselection, what a command leaves
  selected, the pick cursor), MOVE's (the drag's look), Transforms' (the two-point measure, REF-09,
  JIG-03), RECTANG's (options kept for the session, rectang/p310). Differences found in them:
  OFP-08 (an override outliving its command: LINE's object snaps), OFP-09 (`Expects a point or
  Exit`: LINE's command line), OFJ-03 (the command menu's Snap Overrides: LINE's menus), OFS-02 (a
  measure of zero: Transforms' measure), OFS-07 (Node typed: LINE's object snaps), OFS-08 (a huge
  length's format: units).
- **Knowledge:** `docs/coverage/modify.md` (OFFSET); rules `cad-tools.md`, `cad-catalogs.md`,
  `cad-engine.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/offset/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh offset <ids>` in es-ES and en-US;
the desktop's are `dsk.sh` with `lib-dsk.sh` (Transforms' view). Transcripts and screenshots are in
`research/probes/offset/` (gitignored). The common drawing: the line 0,0–100,0 and
`_ZOOM _W -50,-50 300,300` (0.655 units a pixel, PICKBOX 3).

| Id | What it asks |
| --- | --- |
| p00 | ACADVER, `_VERNUM` |
| p01–p05 | the analogues: `'ZOOM` at the measure's second point; U after an empty run (two ways); Enter at the second point; OFFSETDIST in a blank drawing, the owner's profile and acadiso.dwt |
| p100–p169 | the command line: names (DESFASE, DF, EQ, `O`, `_O`, `_.OFFSET`, `'OFFSET`), repeat; the distance's keywords, Enter, 0, −5, FOO, `1E20`, es PUN, PUNTO, ATRAV; Erase and Layer, their letters and refusals; Exit, Undo and Multiple at each prompt, with nothing to undo and at each depth; the two-point distance by every form, `@`, FOO; OFFSETDIST by setvar and typed; transparency at each prompt; U, REDO, UNDO 2, MREDO; another command typed; what is left selected; one and two objects preselected |
| p170–p239 | what it produces, MPDUMP: line, 3D line, arc and circle out, in and collapsing, open and closed polylines, bulges convex and concave, widths, a vanishing segment, a split, a U, two-vertex closed, a zero-length segment, rounded corners collapsing; ellipse, elliptical arc, spline, xline, ray; text, MTEXT, block, dimension, hatch, point; edge-on, tilted and isometric planes; Through per type; Multiple per mode, with Erase and Layer Current; properties, thickness, UCS turned and tilted |
| p240–p298 | the picks and points: a typed point on, off and beside the object, a number, `@`; a shared endpoint; the selection modes; a locked layer; preselection; every point form at the side and through points, on the line, its extension, past its end, at a circle's centre and rim; `_END`, `_MID`, `_PER`, `_NEA`, `_CEN`, `_FRO`, `_M2P`; Ortho with a typed point and a snap; an override that finds nothing; Enter at an override's `of`; LASTPOINT after each |
| d01–d06 | the distance by two points with the mouse, the object prompt's rollover and cursor, the side's ghost and box; Through and Multiple with the mouse; a circle and an open polyline's ghosts; the right button at the distance and at the object; Ortho and Polar at the through point; Escape after a copy and U |

## 4. Matrix

Cells read `state · probe · test`; "scratch" is `research/review/offset/<a|b|c|r>/`. Rows the same
at every prompt take one cell. Columns: D (the distance, with its second point D2), E/L (Erase and
Layer), S (`Select object to offset`), P (the side point), T (the through point).

### OFP — the picks and points

| Row | S | P | T |
| --- | --- | --- | --- |
| C typed point | differs OFP-01 · p01, p240, p241, p297, p298 | differs OFP-02 · p253–p262 | differs OFP-02 · p270–p276 |
| C `#x,y` | — | refused: match · p261 · scratch c | match · p275 |
| C on the line, its extension, past the end | — | the left of the line's direction: match · p257–p259, p288 · scratch c | differs OFP-06 · p273, p277, p278 |
| C a circle's centre, rim | — | centre inward: match · p269 · scratch c | differs OFP-06 · p295, p296 |
| C LASTPOINT | differs OFP-03 · p240, p241 | the side point: untested (click) · p253 | the through point: untested (click) · p270 |
| D overrides | — | differs OFP-07 · p263–p266, p292 | `_END`, `_CEN`, `_FRO`: untested · p279–p281; `_PER` differs OFP-07 · p285; `_M2P`: known · p282 |
| D Ortho, Polar | — | a typed point wins (OFP-02), a snap wins (OFP-07) · p267, p268; the pick unbent: match · d05 | the same · p283, p284, d05 |
| D an override left pending | — | — | differs OFP-08 · p294 |
| B selection modes | refused: differs OFP-09 (words) · p245–p248, p286, p289 | — | — |
| B a locked layer | differs OFP-05 · p250 | — | — |
| A shared endpoint | the newest: untested · p244, p291 | — | — |
| G what is left selected | nothing: untested · p252, p287 | — | — |

### OFS — the command line

| Row | D / D2 | E/L | S | P / T |
| --- | --- | --- | --- | --- |
| A names | OFFSET, `O`, DESFASE: match · p100, p104, p106 · `editing.test.ts:4063`, `ambiguousKeywords.test.ts:408`; DF, EQ: untested, the † stale (OFS-09) · p101, p102; `_O`, `_.OFFSET`: known (command-line.md) · p103, p105, p169; `'OFFSET` refused: untested · p107; repeat: untested · p106 | — | — | — |
| A preselection | differs OFS-05 · p165, p251, p290; two objects: untested · p167, p287 | — | — | — |
| B text, keywords | match · p100, p108, p111 · `editing.test.ts:4063` | match · p119, p122, p123 · `editing.test.ts:4097` | match · p124 | match · p128, p134 |
| B Enter | `<Through>`, then the last: match · p106, p112, p148 · `dynamicInputEnter.test.ts:227` | the default: match · p119, p123 | Exit: match · p106 | Exit, `<next object>`: match · p129, p131, p135 · `editing.test.ts:4152` |
| B 0, negative | differs OFS-01 · p113, p114 | — | — | — |
| B FOO, another prompt's keyword | match · p115–p117 · `invalidAnswers.test.ts:158` | match · p120, p121, p123 | known (`Exit/Undo`): OFP-09 · p126, p127 | match · p130, p136 |
| B `M` again | — | — | — | differs OFS-06 · p131, p137 |
| B es PUN, PUNTO | differs OFS-07 · p109, p110 | — | — | — |
| B `1E20` | taken; its default differs OFS-08 · p118 | — | — | — |
| C two points | every form: match · p139, p141–p144 · `editing.test.ts:4206`, `measuredAnswers.test.ts:147`; `@` (zero) differs OFS-02 · p140; Enter at D2 is Through: untested · p04 | — | — | — |
| C LASTPOINT after the measure | unchanged: untested · p139 | — | — | — |
| E transparent | `'ZOOM` at D2 kept: match · p01 · `look.test.ts`; `'ZOOM`, `'-PAN`, `'-OSNAP`, `'LINE` refused: untested · p149, p154; `'ORTHOMODE`: known · p149 | untested · p150, p151 | untested · p152 | untested · p153 |
| F Undo keyword | — | — | with nothing: differs OFS-03 · p125; at each depth: match · p155, p156 | differs OFS-04 · p132, p138, p157, p158, p166 |
| F U, REDO, UNDO 2, MREDO, after Erase | match · p159–p161, p168; U after an empty run: match · p02, p03 | — | — | — |
| G another command typed | — | — | refused: match · p162 | refused: match · p163 |
| G Escape | the copies kept, U takes the run back: match · d06 | — | — | — |
| K | the sweep: es-several `specifyOffsetDistanceOr`, `specifyThroughPointOr` settled · p01, p270; `nextObject` sourced · p131; `keywordLabels.OFFSET.Through` es `punto a Atravesar` · d04-1, en: unverified (no English desktop pass); `offsetDistance`: n/a (the desktop's box is labelled by the prompt, d01-1) | match | match | match |
| L history | match but OFS-01, OFS-02, OFS-03, OFS-06's lines · every probe · scratch a replay | | | |
| OFFSETDIST | per drawing, `<Through>` first: match · p05, p106, p148; setvar and typed: known · p146, p147; the desktop's new drawing `<1.0000>`: unverified · d01-1 | | | |

### OFG — what it produces

| Source | Distance | Through | Multiple, Erase, Layer |
| --- | --- | --- | --- |
| LINE, a 3D line | match · p170, p171 · `editing.test.ts:3854`, `elevation.test.ts:547` | match · p208 · `editing.test.ts:3983` | steps from the last copy: match · p213 · `editing.test.ts:3999`; Through from the original: match · p214 · `editing.test.ts:4180` |
| ARC | out, in: match · p172, p173 · `editing.test.ts:3921`; collapsing: differs OFG-07 · p174, p175 | outside its span: differs OFG-11 · p209 | — |
| CIRCLE | out, in: match · p177 · `editing.test.ts:3898`; collapsing: differs OFG-07 · p176 | match · p210 | — |
| LWPOLYLINE straight | the L: match · p178 · `editing.test.ts:3942`; a rectangle out, in: untested · p179, p180; a vanishing segment: differs OFG-02 · p187; a split: differs OFG-03 · p188; a U: untested · p189–p191 (d03); two vertices closed: differs OFG-13 · p192; a zero-length segment: differs OFG-06 · p194 | beyond an open end: differs OFG-10 · p211; a corner: untested · p212 | Through from the original: untested · p215 |
| LWPOLYLINE with arcs | a D in, out: untested · p181, p182; concave in: untested · p184; concave out: differs OFG-04 · p183; the side inside a bulge: differs OFG-05 · p226; rounded corners collapsing: differs OFG-01 · p230, p231; two vertices bulged: untested · p193 | — | — |
| Widths | match · p185, p186 · `polylineWidths.test.ts:601` (cites `acc/w9`: OFG-15) | — | — |
| ELLIPSE, SPLINE | known (Missing: AutoCAD makes a SPLINE) · p196–p198 | — | — |
| TEXT, MTEXT, INSERT, DIMENSION, HATCH | differs OFG-08 · p201–p205 | — | — |
| XLINE, RAY, POINT, heavy POLYLINE | n/a (no such objects) · p195, p199, p200, p206 | — | — |
| Planes | tilted to the UCS, edge-on to the view: differs OFG-09 · p207, p234, p235, p239; isometric view: untested · p237, p238; UCS Z 30, X 90: untested · p220, p221, p223 | — | — |
| Properties | layer, colour, linetype, lineweight: match · p218, p232, p233, p236 · `currentProperties.test.ts:231`, `editing.test.ts:3837`; elevation: match · p171, p219, p225; thickness of circles and arcs: differs OFG-12 · p219, p232, p233; of lines, polylines: match · p218, p225 | — | Erase once: match · p216, p224 · `editing.test.ts:4021`, its moment differs OFG-14; Layer Current: untested · p217 · `editing.test.ts:4130` |
| I type kept | match · p170–p186 | — | — |
| J save and open | untested (round trip equal) · scratch b `produce2.test.ts` | — | — |

### OFJ — the look

| Row | D2 | S | P | T |
| --- | --- | --- | --- | --- |
| M the ghost | — | — | as the object itself: differs OFJ-01 · d01-5, d03 | differs OFJ-01 · d02 |
| M the source | — | the rollover glow: match · d01-4 · scratch a `hover.test.ts`; the rule says otherwise, OFJ-04 | selected: match · d01-5 · `look.test.ts` | match · d02-1 |
| M the amber line | match · d01-2 · `look.test.ts` | — | none: match · d01-5 | none: match · d02-1, d05 |
| D the box | one field, the dragged reading at D2: match · d01-1, d01-2 · `look.test.ts` | prompt, no field: match · d01-3 | X and Y fields: differs OFJ-02 · d01-5 | differs OFJ-02 · d02-1 |
| G the right button | the keywords and Snap Overrides: match · d04-1 · `look.test.ts` | Snap Overrides shown: differs OFJ-03 · d04-2 | — | — |
| Q the cursor | — | the pick box alone: known (drafting-aids.md Missing) · d01-3 | the crosshair: match · d01-5 | match · d02-1 |

## 5. Findings

### High

#### OFP-02 — Every typed point at the side and through prompts is refused

- **Severity:** high · **Row:** C, D · **Status:** verified
- **Where:** `OffsetTool.ts` `setDistance`, `enterThrough` (a keyword-only box kept at the side and
  through phases), `onPointerDown` (the one path that answers)
- **AutoCAD:** p253 `30,20` at the side → the copy at y=10; p254 `30,20,5`, LASTPOINT keeps the Z;
  p255, p272 `@0,-20` after `ID 0,50` is from the object's pick (50,0); p256 `@` is the pick itself;
  p260, p274 `20<90`; p262, p276 a number is direct distance from the pick (the console's cursor);
  p267, p283 a typed point wins over Ortho; p270 `30,20` at the through point → y=20.
- **mellowcad:** scratch c `offp.test.ts` "OFP-02": `Point or option keyword required.` (es `Se
  requiere un punto o una opción.`) for every form but `_FRO`.
- **Scenario:** OFFSET T, a line, `@0,500` → refused here, offset through it in AutoCAD.
- **Fix:** both prompts become point prompts: a `"coordinate"` box with Exit, Multiple and Undo
  among the keywords, answered by the runtime's typed path (absolute, `@`, polar, direct distance,
  overrides, FROM) (OFFSET-D21). It brings AutoCAD's X and Y fields (OFJ-02).
- **Regression test:** `editing.test.ts`: p253, p270, p272 (with OFP-03), p274.
- **Coverage, rules or catalogs affected:** modify.md OFFSET (Implemented).

#### OFS-05 — One object selected before OFFSET is asked for again; AutoCAD offsets it

- **Severity:** high · **Row:** A, G · **Status:** verified
- **Where:** `OffsetTool.ts` `onActivate` (`ctx.selection.clear()`), `setDistance`, `enterThrough`
- **AutoCAD:** p165, p251 one object preselected, `_OFFSET`, `10` → `Specify point on side to
  offset or [Exit/Multiple/Undo] <Exit>:`, then `Select object to offset`; p290 Through → `Specify
  through point`; p167, p287 two objects → `Select object to offset`, nothing left selected.
- **mellowcad:** scratch a `findings.test.ts` "OFS-05": `Select object to offset`, one object.
- **Scenario:** click a line, `O`, `10`, a click for the side → here the click picks an object (or
  nothing) → AutoCAD makes the copy.
- **Fix:** `onActivate` keeps one preselected object that offsets (`readsInPlan`, a type OFFSET
  takes), clears the selection, and the first distance or Through goes to its side or through
  point; several are cleared as now (OFFSET-D24).
- **Regression test:** `editing.test.ts`: p251, p290, p287.
- **Coverage, rules or catalogs affected:** modify.md OFFSET (Implemented).

#### OFG-01 — A polyline whose arcs collapse inward makes nothing; AutoCAD drops the arcs

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `offsetPolyline` (an arc of radius ≤ 0 returns `null` for the whole)
- **AutoCAD:** p230 a 100 square with corners rounded 10, offset 15 in → closed
  `[[15,15],[85,15],[85,85],[15,85]]`, no bulges; p231 offset 10 → `[[10,10],[90,10],[90,90],[10,90]]`.
- **mellowcad:** scratch b `findings.test.ts` "OFG-c": no copy, the side prompt left waiting.
- **Scenario:** a rectangle filleted 10 (RECTANG's Fillet), OFFSET 15 inside → nothing, in silence.
- **Fix:** OFG-02's clean-up drops a collapsed arc and joins its neighbours (OFFSET-D14).
- **Regression test:** `editing.test.ts`: p230, p231.
- **Coverage, rules or catalogs affected:** modify.md OFFSET.

#### OFG-02 — A segment that vanishes stays, and the copy crosses itself

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `offsetPolyline`, the joins (no check that a segment reversed)
- **AutoCAD:** p187 the trapezoid (0,0)(100,0)(55,40)(45,40) offset 15 in → the triangle
  `[[39.452989835235556,15],[60.547010164764444,15],[50,24.37512014645729]]` (handle 2D8).
- **mellowcad:** scratch b "OFG-d": four vertices, the top edge reversed (49.297,25)–(50.703,25).
- **Scenario:** any outline with a short edge offset inward → a bow tie here.
- **Fix:** the standard clean-up after the raw offset: drop reversed and collapsed segments, cut the
  self-intersections, keep the pieces at the full distance from the source (OFFSET-D14), in
  `domain/` as its own module (`cad-engine.md`, "Algorithms over a set of entities").
- **Regression test:** `editing.test.ts` or the module's own test: p187.
- **Coverage, rules or catalogs affected:** modify.md OFFSET.

#### OFG-03 — An offset that pinches a polyline apart stays one self-crossing polyline

- **Severity:** high · **Row:** H (CPY-03's analogue) · **Status:** verified
- **Where:** `OffsetTool.ts` `offsetPolyline` (always one shape), `emitCopy` (one entity)
- **AutoCAD:** p188 two squares joined by a neck 10 high, offset 10 in → two closed LWPOLYLINEs, the
  left (2D8, from (10,10), with the collinear (80,55)) appended before the right (2D9, from
  (120,45)).
- **mellowcad:** scratch b "OFG-e": one polyline of 12 vertices crossing the neck.
- **Fix:** OFG-02's clean-up returns each surviving loop; they are added in the source's order as
  one command (`AddEntitiesCommand`, or `ReplaceEntitiesCommand` under Erase), one step for the Undo
  keyword (OFFSET-D14).
- **Regression test:** `editing.test.ts`: p188, two polylines, the left first.
- **Coverage, rules or catalogs affected:** modify.md OFFSET.

#### OFG-04 — Offset segments that no longer meet are joined by a jump; AutoCAD rounds the vertex

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `joinOffsetSegments` (the `?? cur.a` fallbacks)
- **AutoCAD:** p183 a square with a concave top (bulge −0.5) offset 10 out →
  `[-10,-10],[110,-10],[110,100] b0.7207592200561265,[92,106] b−0.5,[8,106] b0.7207592200561265,
  [-10,100]`: arcs of radius 10 centred on the source's vertices (100,100) and (0,100).
- **mellowcad:** scratch b "OFG-f": `[(-10,-10),(110,-10),(92,106),(-10,100)]`, bulges
  `[0,0,-0.5268,0]`, an arc whose end is off its circle.
- **Fix:** where two offset segments do not meet, an arc centred on the source vertex with the
  distance as radius (OFFSET-D13; OFFSETGAPTYPE 0).
- **Regression test:** `editing.test.ts`: p183's vertices and bulges.
- **Coverage, rules or catalogs affected:** modify.md OFFSET ("with corner joins").

#### OFG-05 — The side of a polyline is judged against its arcs' chords

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `offsetSideSign` (`polylineSegments` gives chords)
- **AutoCAD:** p226 the D (an arc of bulge 1 from (100,0) to (100,100)), the side at (140,50)
  inside the arc's bulge → inward, `[[0,10],[100,10] b1,[100,90],[0,90]]`, as p181.
- **mellowcad:** scratch b "OFG-g": outward.
- **Scenario:** a slot, the side clicked inside near the round end → the copy goes outside.
- **Fix:** the side from the nearest point of `polylineSegmentGeometries`, an arc as an arc: inside
  its circle is towards its centre (OFFSET-D17).
- **Regression test:** `editing.test.ts`: p226.
- **Coverage, rules or catalogs affected:** —

### Medium

#### OFP-01 — A typed point at `Select object to offset` is refused

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `OffsetTool.ts` (no `answerTyped` at the select phase; `takes()` `"object"`)
- **AutoCAD:** p01, p240 `50,0` → the side prompt (`PromptedForEntity … "PickedPoint":[50,0,0]`);
  p241 `50,30` asks again with no message, LASTPOINT 50,30; p297 a number picks from LASTPOINT; p298
  `@50,-50` picks (50,0).
- **mellowcad:** scratch r `replay.test.ts` p01, scratch c "OFP-01": `*Invalid selection*` /
  `Expects a point or Exit/Undo`.
- **Fix:** `answerTyped` at the select phase reads the point with `typedPick` (BREAK, FILLET, TRIM
  do) and does what a click does; a miss asks again in silence; the selection modes stay refused
  (p245) (OFFSET-D20).
- **Regression test:** `editing.test.ts`: p240, p241, p298.
- **Coverage, rules or catalogs affected:** modify.md OFFSET; `typedPick`'s JSDoc cites 2023's
  `acc/…`: p297, p298 back it on 2027.

#### OFP-03 — The object's pick does not set LASTPOINT

- **Severity:** medium · **Row:** C · **Status:** verified (typed; a click unverified)
- **Where:** `OffsetTool.ts` `onPointerDown` (select)
- **AutoCAD:** p240 a pick at 50,0, Enter → LASTPOINT 50,0; p241 a miss at 50,30 → 50,30; p255,
  p272 `@` at the next prompt is from the pick.
- **mellowcad:** scratch c "OFP-03": `ID @` unchanged.
- **Fix:** `ctx.setLastPoint` at the select pick, hit or miss, clicked or typed (OFFSET-D23).
- **Regression test:** `editing.test.ts`: p240, p255.
- **Coverage, rules or catalogs affected:** —

#### OFP-05 — An object on a locked layer is passed over in silence

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `OffsetTool.ts` `pickSource` (`ctx.pick` skips locked layers)
- **AutoCAD:** p250 `The object is on a locked layer.` (es `El objeto está en una capa
  bloqueada.`, table 25121), the prompt again, no copy (the trace's `AllowObjectOnLockedLayer`).
- **mellowcad:** scratch c "OFP-05": nothing written.
- **Fix:** a pick that finds nothing looks again with locked layers; finding one, it reports a new
  message `objectOnLockedLayer` and asks again.
- **Regression test:** `editing.test.ts`: p250.
- **Coverage, rules or catalogs affected:** `en.json`, `es.json`, `ar.json` (one message).

#### OFP-06 — A through point on the object waits in silence, or stacks a duplicate circle

- **Severity:** medium · **Row:** C, H · **Status:** verified
- **Where:** `OffsetTool.ts` `placeThrough` (`if (!offset) return`), `computeThrough`
- **AutoCAD:** p273, p277, p278 `@`, a point on the line, on its extension → `Invalid through
  point.` (es `Punto a atravesar no válido.`, table 21221), then `Select object to offset`,
  LASTPOINT the point; p296 on a circle's rim → the same; p295 at its centre → `Cannot offset that
  object.` (21222), then `Select object to offset`.
- **mellowcad:** scratch c "OFP-06": no message and the prompt stays; on the rim a second circle of
  the same radius.
- **Scenario:** OFFSET T, a circle, a Quadrant snap on it → a duplicate circle here.
- **Fix:** `computeThrough` tells a point on the object (21221) from a radius of zero (21222);
  either is reported and the command goes back to `Select object` in its mode.
- **Regression test:** `editing.test.ts`: p277, p295, p296.
- **Coverage, rules or catalogs affected:** messages `invalidThroughPoint` and `cannotOffsetObject`
  (shared with OFG-07); modify.md Missing's "never needed" goes.

#### OFP-07 — No object snap at the side point; `_PER` finds nothing at the through point

- **Severity:** medium · **Row:** D · **Status:** verified (overrides); running snaps on a click
  unverified
- **Where:** `OffsetTool.ts` `wantsSnap()` (true only at the through point), no
  `snapsFromLastPoint()`
- **AutoCAD:** p263–p266 `_END`, `_MID`, `_NEA` at the side snap (110,1) or (110,3), so the copy
  goes up although the raw point is below; `_PER` at 99,-9 gives (70,20), from LASTPOINT (the pick);
  p268 the override beats Ortho; p285 `_PER` at the through point (70,20); p292 an override that
  finds nothing: `No Endpoint found for specified point.`, then `Point or option keyword required.`.
- **mellowcad:** scratch c "OFP-07": `_END` at the side refused; `_PER` at the through point `No
  Perpendicular found for specified point.`.
- **Fix:** `wantsSnap()` at the side too, `snapsFromLastPoint()` at both (OFFSET-D22), with OFP-03.
- **Regression test:** `editing.test.ts`: p263, p285.
- **Coverage, rules or catalogs affected:** the comment on `wantsSnap` goes.

#### OFP-08 — An object snap override left pending outlives the command

- **Severity:** medium · **Row:** D, G (LINE's object snaps) · **Status:** verified
- **Where:** `cad/application/CadRuntime.ts` (`snapping.clearOverride()` on Escape and on a placed
  point, not when Enter answers the override's `of` or the command ends)
- **AutoCAD:** p294 OFFSET T, a pick, `_END`, Enter at `of` → OFFSET ends; `_ID 40,40` → 40,40.
- **mellowcad:** scratch c "OFP-08": `ID 40,40` → `No Endpoint found for specified point.` /
  `Invalid point.`; LINE does the same (scratch c `offset-c.test.ts` "leak5").
- **Fix:** clear the override when Enter answers it and when the running command ends
  (OFFSET-D27).
- **Regression test:** `snapping.test.ts` or the runtime's: p294.
- **Coverage, rules or catalogs affected:** drafting-aids.md, Object snap overrides.

#### OFS-01 — 0 and a negative distance are refused without AutoCAD's words

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `OffsetTool.ts` `setDistance` (`if (!(distance > 0)) return`)
- **AutoCAD:** p113, p114 `Value must be positive and nonzero.` (es `El valor debe ser positivo y
  diferente de cero.`, 20519) and the prompt again.
- **mellowcad:** scratch a "OFS-01": the prompt again, no line.
- **Fix:** report `positiveNonzero` as CIRCLE does.
- **Regression test:** `invalidAnswers.test.ts`: p113, p114.
- **Coverage, rules or catalogs affected:** —

#### OFS-02 — A two-point distance of zero drops the first point

- **Severity:** medium · **Row:** C (Transforms' measure) · **Status:** verified
- **Where:** `CadRuntime.ts` `measurePoint` (clears `measuring` before `commitBox`)
- **AutoCAD:** p140 `10,10`, `@` at ` Specify second point:` → `Value must be positive and
  nonzero.`, ` Specify second point:` again; `10` there is the distance.
- **mellowcad:** scratch a "OFS-02": the distance prompt again, in silence, the first point lost.
- **Fix:** a refused commit keeps `measuring` and its first point; the refusal is OFS-01's
  (OFFSET-D3).
- **Regression test:** `measuredAnswers.test.ts`: p140.
- **Coverage, rules or catalogs affected:** command-line.md (the measure's first point kept: p140,
  p144).

#### OFS-03 — Undo with nothing to undo says nothing

- **Severity:** medium (known: Missing) · **Row:** F, L · **Status:** verified
- **Where:** `OffsetTool.ts` `undoStep` (`if (!step) return`)
- **AutoCAD:** p125 `_U` with no copy → `Command has been completely undone.` (es `Comando deshecho
  totalmente.`, 22415, not 13314's `Todos los efectos del comando han sido deshechos.`) and the same
  prompt; p155 the third `_U` after two copies.
- **mellowcad:** scratch a "OFS-03": nothing.
- **Fix:** a message of its own for 22415 (`commandCompletelyUndoneShort`, worded per table), since
  the Spanish differs from `commandCompletelyUndone`'s 13314 (`cad-catalogs.md`: two wordings, two
  ids) (OFFSET-D2).
- **Regression test:** `editing.test.ts`: p125 in en and es.
- **Coverage, rules or catalogs affected:** a message in `en`, `es`, `ar`; Missing's item goes.

#### OFS-04 — Undo at the side or through prompt stays there; AutoCAD asks for the object

- **Severity:** medium · **Row:** F · **Status:** verified
- **Where:** `OffsetTool.ts` `undoStep`
- **AutoCAD:** p157 in Multiple, two copies, `_U` → the last copy erased and `Select object to
  offset`; p158, p166 after a copy and a new object picked, `_U` at its side or through point takes
  the copy back and asks `Select object`; p132, p138 with nothing: OFS-03's words, then `Select
  object`.
- **mellowcad:** scratch a "OFS-04a–d": the copy goes, the prompt stays.
- **Scenario:** Multiple, `U`, a click on the next object → a copy here, the next object in AutoCAD.
- **Fix:** after the undo, or with nothing to undo, the phase is `select` in the run's mode.
- **Regression test:** `editing.test.ts:4152` rewritten to p157's sequence; p158, p166.
- **Coverage, rules or catalogs affected:** modify.md OFFSET; the class and `undoStep` JSDoc; the
  English surface snapshot.

#### OFG-06 — A zero-length segment blocks the offset

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `shiftedSegment` → `offsetPolyline`
- **AutoCAD:** p194 (0,0)(100,0)(100,0)(100,100) offset 10 → `[[0,10],[90,10],[90,100]]`.
- **mellowcad:** scratch b "OFG-h": nothing, in silence.
- **Fix:** zero-length segments dropped before the offset, their vertex with them (OFFSET-D19).
- **Regression test:** `editing.test.ts`: p194.

#### OFG-07 — An arc or circle that would collapse makes nothing and says nothing

- **Severity:** medium · **Row:** H, L · **Status:** verified
- **Where:** `OffsetTool.ts` `placeOffset` (`if (!offset) return // … wait`), `concentricRadius`
- **AutoCAD:** p174, p175 an arc r50 offset 60 or 50 in; p176 a circle r50 offset 60 in → `Cannot
  offset that object.` (es `Imposible transponer este objeto.`, 21222), then `Select object to
  offset`.
- **mellowcad:** scratch b "OFG-a": the side prompt stays, in silence.
- **Fix:** report `cannotOffsetObject` and go back to `Select object`.
- **Regression test:** `editing.test.ts`: p174, p176.
- **Coverage, rules or catalogs affected:** the message (OFP-06's); Missing's "never needed" goes.

#### OFG-08 — Text, MTEXT, blocks, dimensions and hatches are taken and never offset

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `pickSource` (every type taken), `computeOffset`
- **AutoCAD:** p201–p205 TEXT, MTEXT, INSERT, DIMLINEAR, a SOLID hatch → `Cannot offset that
  object.`, `Select object to offset`, nothing added; p206 a POINT the same.
- **mellowcad:** scratch b P1, P2, "OFG-b": the side prompt, and nothing at any click; ELLIPSE and
  SPLINE too (p196, p198: AutoCAD makes a SPLINE).
- **Fix:** those five refused at the pick with 21222 (OFFSET-D10); ELLIPSE and SPLINE left out of the
  pick in silence until built (OFFSET-D11).
- **Regression test:** `editing.test.ts`: p201–p205; an ellipse's pick leaves the prompt at
  `Select object`.
- **Coverage, rules or catalogs affected:** modify.md Missing.

#### OFG-09 — Objects tilted to the UCS are refused; AutoCAD refuses only those edge-on to the view

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `pickSource` (`readsInPlan`)
- **AutoCAD:** p239 a circle of normal (0,−.707,.707), UCS World, top view → offset to r60, its
  normal kept; p235 a WCS circle with UCS `_X 90` and the top view → offset; p237 in an isometric
  view → offset; p207, p234 a circle edge-on to the view → `Cannot offset that object at current
  view direction.` (es `Imposible transponer este objeto en la dirección de la vista actual.`,
  21223), whether or not it lies in the UCS.
- **mellowcad:** scratch b `tilt.test.ts`, P2: p239 and p235 not taken, in silence; p234 offset.
- **Fix:** an object with a plane (circle, arc, polyline) is offset in that plane, the side point
  taken along the view onto it; one edge-on to the view is refused with 21223 (OFFSET-D16). A line
  out of the UCS plane is not probed: it stays refused, noted in Missing.
- **Regression test:** `editing.test.ts` or `normals.test.ts`: p239, p234, p235.
- **Coverage, rules or catalogs affected:** modify.md ("does not highlight" is false on 2027); a
  message; `cad-tools.md` names OFFSET among the `readsInPlan` tools: it leaves that list.

#### OFG-10 — Through beyond an open polyline's end measures to the end vertex

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `computeThrough` (polyline)
- **AutoCAD:** p211 the L (0,0)(100,0)(100,100), through (130,150) → 30, `[[0,-30],[130,-30],
  [130,100]]`; p212 near the outer corner, the distance to the corner (36.0555127546399).
- **mellowcad:** scratch b "OFG-j": 58.309518948.
- **Fix:** the distance to the polyline with its open ends extended along their tangents
  (OFFSET-D15).
- **Regression test:** `editing.test.ts`: p211, p212.

#### OFG-11 — Through outside an arc's span makes an arc; AutoCAD refuses

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `computeThrough` (arc)
- **AutoCAD:** p209 an arc r50 from 0° to 90°, through (−80,−60) → `Cannot offset that object.`.
- **mellowcad:** scratch b "OFG-k": an arc of radius 100.
- **Fix:** refused with 21222 when the point's angle is outside the arc's span.
- **Regression test:** `editing.test.ts`: p209.

#### OFG-12 — A circle's or arc's copy keeps the thickness; AutoCAD's has none

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `OffsetTool.ts` `emitCopy` → `carryOverrides`
- **AutoCAD:** p219, p233 a circle, p232 an arc, thickness 3 at Z 7 → the copy's thickness 0, Z 7,
  colour, linetype and lineweight kept; a line (p218) and a polyline (p225, p236) keep theirs.
- **mellowcad:** scratch b "OFG-l": thickness 3.
- **Fix:** a circle's and arc's copy without thickness, with a `WHY` citing the probes (OFFSET-D12).
- **Regression test:** `editing.test.ts` or `elevation.test.ts`: p219, p232.
- **Coverage, rules or catalogs affected:** modify.md ("keeps … thickness" for lines and polylines
  only); `cad-tools.md` "a rebuilt object carries the source's" thickness names the exception.

#### OFJ-01 — The ghost is drawn in one grey; AutoCAD drags the copy as the object itself

- **Severity:** medium · **Row:** M · **Status:** verified
- **Where:** `OffsetTool.ts` `buildOverlay` (`THEME.rubberBand`)
- **AutoCAD:** desktop d01-5 (the line's copy solid, in its colour), d02-1, d02-2 (Through and
  Multiple), d03-1 to d03-4 (the circle, the U): MOVE's "as itself" (move/d01, `transformDrag.ts`).
- **mellowcad:** scratch r `look.test.ts` "SIDE-SCENE": a red line's copy in `#e2e8f0`.
- **Fix:** the copy drawn through `entityScenePrimitive` in `resolveEntityColor(source)`, as
  `transformDrag` draws a set; the source keeps `THEME.selected`.
- **Regression test:** `editing.test.ts`: a red line's ghost red (d01-5).
- **Coverage, rules or catalogs affected:** modify.md OFFSET (the look).

#### OFJ-02 — The side and through prompts show no X and Y fields

- **Severity:** medium · **Row:** D, Q · **Status:** verified
- **Where:** `OffsetTool.ts` `openKeywordPrompt` kept at those phases
- **AutoCAD:** d01-5, d02-1 `Precise punto en lado de desplazamiento o` and `Precise punto a
  atravesar o` with the cursor's X and Y.
- **mellowcad:** scratch r `look.test.ts` "SIDE", "THROUGH": `fields: []`.
- **Fix:** OFP-02's coordinate box.
- **Regression test:** with OFP-02's.

### Low

- **OFP-09** — A selection mode at `Select object to offset` is refused with `Expects a point or
  Exit/Undo`; AutoCAD says `Expects a point or Exit` (es `Requiere un punto o Salir`) (p245–p248,
  p286, p289), as at every `"object"` prompt (LINE's command line; `promptRefusal.ts`' WHY calls it
  an off-by-one, no platform forces it). Fix: OFFSET's select `takes()` names its refusal with
  `Exit` alone (OFFSET-D28); `invalidAnswers.test.ts:315` cites p245.
- **OFS-06** — `M` typed again in Multiple is refused here; AutoCAD's prompt still declares
  Multiple and asks again in silence (p131, p137). Fix: Multiple offered hidden there, doing nothing.
- **OFS-07** — In Spanish `PUN` and `PUNTO` at the distance are Node (`de`) on 2027, not Through
  or a refusal (p109, p110), against `ambiguousKeywords.test.ts:408`'s 2023 citations. Node is
  Missing (drafting-aids.md): the test's two cases are rewritten to what mellowcad does with the
  2027 citation and the gap noted (OFFSET-D5).
- **OFS-08** — `1E20`'s `<default>` is written in full; AutoCAD writes `<1.0000E+20>` (p118). The
  units' format, noted in Missing; its threshold is unprobed (OFFSET-D5).
- **OFS-09** — Drift: DF and EQ are DESFASE on 2027 (p101, p102: the † goes); `<next object>` is
  the console's (p131); tests without probes: `invalidAnswers.test.ts:158` (p115),
  `measuredAnswers.test.ts:147` (p139, p144), `dynamicInputEnter.test.ts:227` (p106, p112), the
  OFFSET block of `editing.test.ts`.
- **OFG-13** — A closed two-vertex straight polyline makes a crossed copy; AutoCAD refuses it,
  21222 (p192; bulged it offsets, p193) (OFFSET-D19).
- **OFG-14** — With Erase and Multiple, the source goes at the first copy here, at the object's end
  in AutoCAD (p216, p224: the copies appended, then the source erased at `<next object>`). Fix: erase
  it on leaving the object, in the run (OFFSET-D18).
- **OFG-15** — `acc/w9` (OffsetTool.ts, `polylineWidths.test.ts:601`) is re-cited to p185, p186.
- **OFJ-03** — The command menu at `Select object to offset` offers Snap Overrides; AutoCAD's does
  not at a prompt that takes no point (d04-2; at the distance it does, d04-1). LINE's menus: the
  group is shown only where the question takes a point.
- **OFJ-04** — `cad-tools.md` says the offset source hovers in `THEME.selected`; the desktop's
  rollover at `Select object to offset` is the plain glow (d01-4), which the code draws
  (`THEME.entityHover`), and the source turns selected once picked (d01-5): the rule is stale. The
  ellipse test (`editing.test.ts:3962`) counts `THEME.selected`, so it always passes: it asserts
  the prompt and the hover's colour instead (OFFSET-D30).

## 6. Decisions taken

| Id | Decision | Why |
| --- | --- | --- |
| OFFSET-D1 | Through with one preselected object goes to its through point | the same entry as the distance (p290 confirms) |
| OFFSET-D2 | OFS-03's words are a message of their own for table 22415 | its Spanish is not 13314's, which PlacementTool and FilletTool use |
| OFFSET-D3 | OFS-02 is fixed in the runtime's measure | the two-point distance is the runtime's (`cad-tools.md`) |
| OFFSET-D4 | `invalidAnswers.test.ts:315` follows OFP-09 | p245 |
| OFFSET-D5 | OFS-07 and OFS-08 are recorded, not fixed | Node (drafting-aids) and the units' format are other areas' gaps |
| OFFSET-D10 | text, MTEXT, blocks, dimensions and hatches are refused at the pick with 21222 | p201–p205 |
| OFFSET-D11 | ellipses and splines stay out of the pick, in silence | AutoCAD offsets them into a spline (p196–p198): its refusal would be false here |
| OFFSET-D12 | a circle's and arc's copy has no thickness | p219, p232, p233, however odd |
| OFFSET-D13 | where offset segments do not meet, an arc on the source vertex of the distance's radius | p183 |
| OFFSET-D14 | the polyline clean-up is the standard one: raw offset, reversed and collapsed segments dropped, self-intersections cut, pieces kept at the full distance, one object per loop in source order, a module in `domain/` | p187, p188, p230, p231 |
| OFFSET-D15 | Through on a polyline measures to it with its open ends extended | p211, p212 |
| OFFSET-D16 | an object with a plane is offset in it; edge-on to the view is refused with 21223; a line out of the UCS plane stays refused, in Missing | p207, p234, p235, p237, p239 |
| OFFSET-D17 | a polyline's side is judged against its true segments | p226 |
| OFFSET-D18 | Erase with Multiple erases the source on leaving the object | p216, p224 |
| OFFSET-D19 | zero-length segments dropped; a closed two-vertex straight polyline refused | p192, p194 |
| OFFSET-D20 | the object's typed pick is `answerTyped` with `typedPick`, no selection modes | p241, p245 |
| OFFSET-D21 | the side and through points are coordinate prompts the runtime answers | one typed-point path (`cad-tools.md`) |
| OFFSET-D22 | snaps at the side point; LASTPOINT is the base of Perpendicular at both points | p263–p266, p285 |
| OFFSET-D23 | the object's pick sets LASTPOINT, clicked as typed | p240, p241; a click is unverified |
| OFFSET-D24 | one preselected object is used, several are cleared | p165, p251, p287 |
| OFFSET-D25 | the pick's tolerance (8 px against PICKBOX 3, p242, p243) is ERASE's area, not reopened | it has its WHY |
| OFFSET-D26 | `_M2P` is known | drafting-aids.md Missing |
| OFFSET-D27 | OFP-08 is fixed in the runtime, here | OFFSET exposed it; LINE shows it too |
| OFFSET-D28 | OFP-09 is fixed for OFFSET's prompt only | the generic `"object"` refusal is unprobed elsewhere |
| OFFSET-D30 | the rule follows the desktop: the hover is the rollover, the picked source selected | d01-4, d01-5 |
| OFFSET-D31 | OFFSETDIST stays −1 in each drawing | the help and three consoles (p05); the desktop's `<1.0000>` is unexplained, unverified |

## 7. Tests proposed

Regression tests are in each finding. Untested cells, by file:

- `editing.test.ts` (OFFSET): DF, EQ, repeat (p101, p102, p106); Enter at the second point is
  Through (p04); the side on the line and past its end (p257–p259, p288); the circle's centre
  (p269); the shared endpoint (p244); a rectangle out and in, a D, a U (p179–p182, p189–p191); Layer
  Current with Multiple (p217); a polyline's Through from the original (p215); `_END`, `_CEN`,
  `_FRO` at the through point (p279–p281); nothing left selected (p252, p287); Escape keeps the
  copies (d06).
- `transparentCommands.test.ts`: `'ZOOM` at the Erase, Layer, select and side prompts (p150–p153).
- `measuredAnswers.test.ts`: LASTPOINT unchanged after the measure (p139).
- A save and open of an offset polyline with bulges and widths (scratch b `produce2.test.ts`).
- Citations: every OFFSET test cites its probe; `acc/w9` → p185.

## 8. What is not tested and why

The ghost's linetype and lineweight (MOVE's Missing, the same drag); the cursor's shape at the
object prompt (drafting-aids.md Missing); the box's label (`offsetDistance`), presentation.

## 9. What could not be reviewed and why

- Running snaps on a clicked side point, and a clicked pick's LASTPOINT: no desktop probe for them
  (OFP-03, OFP-07 settled by typed answers).
- English labels of the menus (the desktop pass was the Spanish profile).
- Erase and Layer after a restart (the console cannot restart).
- The scientific notation's threshold (OFS-08).
- Escape with Erase in Multiple; which piece Multiple steps from after a split.
- The desktop's OFFSETDIST of 1 in a new drawing (OFFSET-D31).

## 10. Refuted in the adversarial pass

- OFP-04 (one object preselected): OFS-05, the same finding.
- OFS-10 (the ellipse test always passes, the hover's colour): OFJ-04.
- A point on the line refused at the side: AutoCAD takes the left of the line's direction, and so
  does mellowcad (p257, p288).
- Ortho bending the side or through point: the trace's UseBasePoint is false and the desktop
  shows nothing bent (d05); mellowcad leaves it too.
- `#x,y` taken at the points: both refuse it (p261, p275).
- The U's side: p189–p191 match.
- The alias's echo on two lines, `'ORTHOMODE`, `_O`, `_.OFFSET`, OFFSETDIST typed: command-line.md
  owns them.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | State |
| --- | --- |
| modify.md: polylines "with corner joins" | false for p183, p187, p188, p194, p226, p230 (OFG-01 to OFG-06) |
| modify.md: "keeps the source's … thickness" | false for circles and arcs (OFG-12) |
| modify.md: "an object at an angle to the UCS's XY plane does not highlight" | no longer true on 2027 (OFG-09) |
| modify.md: "Undo takes back the last copy" | incomplete: it then asks for the object (OFS-04) |
| modify.md: `DF`†, `EQ`† | settled (p101, p102) |
| modify.md Missing: `Cannot offset that object.` "never needed" | false (OFG-07, OFG-08, OFP-06) |
| modify.md Missing: what Undo says with nothing left | settled (OFS-03) |
| `cad-tools.md` Pick feedback: the offset source in `THEME.selected` | stale for the hover (OFJ-04) |
| `cad-tools.md` `readsInPlan` names OFFSET | stale after OFG-09 |
| `cad-catalogs.md` Keywords: OFFSET's `Thru` | holds in English (p108); Spanish's `PUN` is Node (OFS-07) |

Checked and holding: the Current settings line (p100, p119, p122), every prompt's wording in both
languages (p100–p138), `<Through>` and OFFSETDIST per drawing (p05, p106, p148), the two-point
distance (p139–p144), Erase and Layer (p119–p123), Multiple (p131, p213, p214), Erase in one step
(p159), the copy's elevation, rise, layer, colour, linetype, lineweight (p171, p218, p219, p232,
p233, p236), widths (p185, p186), ellipses and splines in Missing (p196–p198), `cad-tools.md`'s
"Made from another", "One commit, one command", "A whole run … one undo step" (p02, p03, d06).

## 12. Order of execution and estimate

| Order | Block | Blocks what | Size |
| --- | --- | --- | --- |
| 1 | OFP | the prompts become point prompts: OFS-04's Select and OFJ-02 rest on it | medium |
| 2 | OFS | the preselection, Undo, the refusals, the measure of zero | small |
| 3 | OFG | the polyline clean-up (a `domain/` module), the refusals, the planes, Through, thickness | large |
| 4 | OFJ | the ghost, the menu, the rule | small |

## 13. Changes to coverage, rules, catalogs and roadmap

- modify.md OFFSET: Implemented and Missing rewritten as the blocks land; drafting-aids.md (an
  override cleared with its command; Node's `PUN`), workspace.md (Snap Overrides only where a point
  is asked), command-line.md (the measure's first point kept), the units' Missing (OFS-08).
- Catalogs: messages `cannotOffsetObject` (21222), `cannotOffsetAtViewDirection` (21223),
  `invalidThroughPoint` (21221), `objectOnLockedLayer` (25121), and 22415's undo message, in `en`,
  `es`, `ar`.
- Rules: `cad-tools.md` (the offset source's hover; OFFSET out of the `readsInPlan` list; the
  thickness exception).
- Roadmap: row 11 `plan`, then `done`; OFFSET owns no area.

## 14. Template improvements

- annex-probes.md §4: a desktop drawing's variable can start otherwise than the console's in every
  case tried (OFFSETDIST 1 against −1, p05): read the desktop's value before trusting a default.
- annex-probes.md §4: an Enter at a prompt that takes a keyword or Enter as Exit ends the command
  mid-script; plan each desktop step's Enter against the prompt it lands on (d03's first try).
- template §4.8: two subagents found the same thing from both ends (OFS-05 and OFP-04, the
  preselection; OFS-10, OFG-15 and OFP's note, the ellipse test): give the preselection and the
  existing tests' review to one subagent by name.
