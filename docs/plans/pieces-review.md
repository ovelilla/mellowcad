# Pieces review (BREAK, BREAKATPOINT, JOIN, EXPLODE)

> **Status:** plan, 2026-10-22 — phases 0–4 of skill `command-review`, the fourteenth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (JNG with JNS, BRS, BRP, BRG, BRJ, EXP).

## 1. Summary

1 critical, 3 high, 16 medium and 14 low findings over seven blocks.

| Block | What | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- | --- |
| JNG | what JOIN makes: which object survives, its type, what it refuses | 1 | 2 | 3 | 2 |
| JNS | JOIN's command line: its reports, the source step, citations | 0 | 0 | 0 | 3 |
| BRS | BREAK's command line: Enter at the point prompts, First point twice | 0 | 1 | 0 | 2 |
| BRP | the picks: locked objects, typed object snaps, a mode's find, the typed box | 0 | 0 | 5 | 1 |
| BRG | what BREAK makes: objects not level with the UCS, citations | 0 | 0 | 1 | 2 |
| BRJ | BREAK's look: the ghost, the rollover, the prompts after First point | 0 | 0 | 1 | 2 |
| EXP | EXPLODE: dimensions, hatches, ellipses, MTEXT's justification, U's order | 0 | 0 | 5 | 3 |

The worst: JOIN with a line at an inner vertex of a polyline, or at a closed one, chains the
polyline's segments one by one and removes it whole, so a segment vanishes or the closed polyline
comes back open and doubled — AutoCAD joins nothing (JNG-01: p373, p388, p389); two collinear lines,
JOIN's commonest use, become a new polyline where AutoCAD keeps the source LINE (JNG-02: p300); a
polyline in the set never keeps its handle and properties (JNG-03: p343, p378–p380); Enter at
BREAK's break points ends it where AutoCAD refuses and asks again (BRS-01: p146, p149–p151, d15).

The analogues Corners left, checked first: BREAK's single object's pick passed a locked object
over in silence where AutoCAD says `The object is on a locked layer.` and then `No object found`
for each one it finds (CRP-03's analogue differs: BRP-01, BRP-02: p100–p107, p178, desktop d06);
FILLET's own pick, which this review's area owns, says it too when a mode's find mixes locked and
unlocked objects (BRP-05: p395); typed object snap overrides at `Select object:` are the pick, the
first break point and LASTPOINT in AutoCAD and refused here (CRP-01's analogue differs: BRP-03:
p108–p115, p177); the types BREAK does not treat are said in AutoCAD's words already (CRG-06's
analogue holds: p180–p187); the ghost is the result in the selection's glow over what is removed
dimmed, where mellowcad glows the whole object and dashes the removed piece red (CRJ-01's analogue
differs: BRJ-01: d01–d04, d14).

## 2. Inventory

Commit `0fd832a`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The commands:** `cad/application/tools/BreakTool.ts` (registered twice, `gap` and `atPoint`, in
  `runtimeTools.ts`), `JoinTool.ts`, `ExplodeTool.ts`, `SelectionActionTool.ts`,
  `objectSelection.ts` (the single object's pick, `ONE_OBJECT_MODES`, `takeOne`), `typedPick.ts`,
  `lockedPick.ts`; `cad/domain/` `polylineSpan`, `polylineParamAt`, `ellipseCut`, `carryPiece`,
  `carryOverrides`, `insertGeometry`, `mtextLineTexts`, `isWidePolyline`;
  `cad/application/commands/entityCommands.ts`. `TOOL_COMMANDS` in `CommandLine.ts`; none is
  transparent (p143, p246, p306). Catalogs: BREAK (`BR`; es PARTE, `P`), BREAKATPOINT (es
  PARTIRENPUNTO), JOIN (`J`; es UNIR, `U`), EXPLODE (`X`; es DESCOMP, `DP`), the keyword First
  point, the prompts and messages of their coverage entries; `ar` holds only the rail's labels. The
  rail (`components/cad/tool-rail.tsx`: BREAK's flyout with BREAKATPOINT, Join, Explode), the
  landing's filing (`content/commands.ts`, modify).
- **Tests:** `breaking.test.ts`, `selectionModes.test.ts` (BREAK, EXPLODE), `transforms.test.ts`
  (2537–2913), `polylineWidths.test.ts` (585, 607, 766), `elevation.test.ts` (517, 650–690),
  `normals.test.ts` (129), `blocks.test.ts` (358), `attributes.test.ts` (538), `mtext.test.ts`
  (351), `invalidAnswers.test.ts` (366), `lastPoint.test.ts` (960), `selection.test.ts` (1438),
  `currentProperties.test.ts` (262), `englishSurface.test.ts`.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after them; ID for LASTPOINT;
  -LAYER Lock, Off, Freeze; CHPROP for the overrides; 'ZOOM, '-PAN, '-OSNAP, 'ORTHOMODE inside
  BREAK; ERASE `_P` and `_L` after EXPLODE; FILLET's pick (p395), whose `one` this review owns.
- **Areas owned:** a single object's pick with modes (`ObjectSelector`'s `one`: BREAK's, FILLET's,
  CHAMFER's, UCS OBject's, ARRAYPATH's) — blocks BRP and BRJ.
- **Areas cited:** LINE's (command line, point input, object snaps, dynamic input, transparency,
  undo, the shortcut menus), ERASE's (`Select objects:`, the preselection, the window's order),
  PLINE's, ARC's, CIRCLE's, ELLIPSE's and SPLINE's objects, Corners' (`cornerPlane`, the ghost's
  look), the Properties review (the locked layer's padlock and fade, desktop d06-1), the Text
  review (MTEXT's layout, EXP-06).

## 3. Probes

Console inputs are `scripts/research/probes/pieces/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh pieces <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` (`dsk.sh setup d01 …`). Transcripts and screenshots are in
`research/probes/pieces/` (gitignored). Default figure: `_ZOOM _W -200,-200 200,200`, a line A
0,0 → 100,0, `ID 5,5` before the command, LASTPOINT and an entget dump after.

| Id | What it asks |
| --- | --- |
| p00 | the version, PICKFIRST, PEDITACCEPT, OSMODE |
| p100–p107, p178 | locked objects at BREAK's `Select object:`: picked, alone or with others in a Window, Last, Crossing; BREAKATPOINT's |
| p108–p115, p177 | typed object snaps at `Select object:` (`_END`, `_MID`, `_NEA`, `_INT`, `_CEN`, `_PER`, `_QUA`, one finding nothing; BREAKATPOINT's) |
| p116–p121 | object snaps, `_FRO`, `_M2P` and Ortho at the break points |
| p122–p136, p152, p179 | which object a pick and each mode takes; Off and Frozen layers |
| p138–p143 | names, aliases, `_.`, repeat, `'_BREAK` |
| p144–p151 | FOO, Enter, keywords of other prompts, `0`, `10`, `-5` at each prompt |
| p153–p161, p176 | point forms, `#` and `*` in a turned UCS, a bare number, `@`; p158/p159 the old acc/bk36 input |
| p162–p165 | transparent commands at each prompt |
| p166–p171 | U, REDO, UNDO 2, MREDO after BREAK, after a run that changed nothing, after Enter (untraced) |
| p172–p175 | the preselection, `(ssget "_I")` and `_P` after |
| p180–p187 | what BREAK cannot break: TEXT, MTEXT, ATTDEF, DIMENSION, HATCH, a block; by Last and Window |
| p188–p193, p199, p229, p230 | objects not level with the UCS: drawn in UCS X 90, under −Z |
| p194–p198 | the pieces' layer, colour, linetype, lineweight, ltscale, transparency, thickness, elevation; a turned UCS |
| p200–p228 | the geometry: lines, arcs, circles, open and closed polylines, ellipses, ends, handles |
| p240–p247 | EXPLODE's names, repeat, apostrophe, U |
| p248–p251 | EXPLODE of polylines: wide, tapered, with arcs, tilted, −Z |
| p252–p257 | EXPLODE of blocks (nested, ByBlock, attributes) and MTEXT (attachments, wrapping) |
| p258–p262 | EXPLODE of a dimension, an ANSI31 and a SOLID hatch, ALL over the refused types; U's order |
| p300–p312 | JOIN's names, repeat, apostrophe, FOO, Enter, a source alone |
| p313–p320, p336, p337, p366–p370 | the source step's prompts per type, cLose, refusals |
| p321–p358, p371–p384 | what JOIN makes: collinear lines, arcs of one circle, chains, polylines, splines, elliptical arcs, properties, Z, widths, UCS, −Z, T junctions |
| p360–p365 | U after JOIN, after nothing joined; the preselection |
| p385–p390 | Convert to circle's answers; a polyline's inner vertex; a closed polyline; a window's set order |
| p395 | FILLET's Window finding a locked and an unlocked line |
| d01–d03 | the desktop: BREAK's ghost on a line (on and off it, past its end), a circle, a closed polyline |
| d04, d05, d14 | First point's two prompts; BREAKATPOINT's break point |
| d06 | BREAK over a locked line and a text: hovered, then picked |
| d07, d08 | JOIN's and EXPLODE's rollover, set and result |
| d09–d12 | the right button; dynamic input (DYNMODE 3); Polar and Ortho at the second point; running snaps |
| d13 | where a click lands under a far Endpoint marker |
| d15 | Enter at the break points, through COM alone |

## 4. Matrix

### JNG, JNS — JOIN

Columns: P1 `Select source object or multiple objects to join at once:`, P2 `Select objects to
join:`.

| Row | P1 | P2 |
| --- | --- | --- |
| A names | match · p300–p303, p305 · `transforms.test.ts:2538`; `_.JOIN` known (command-line Missing, p304); `'_JOIN` match · p306 | — |
| B text, keywords, FOO | match · p300, p307 · `selectionModes.test.ts:648` | match · p308 |
| B Enter | ends silently · untested · p309 | a source alone: known (JNS-02) · p310, p311, p364 |
| F undo | one step named JOIN / UNIR · untested name · p360–p362 · `transforms.test.ts:2598` | — |
| H what it makes | differs JNG-01 to JNG-08 (§5); lines and arcs into a polyline, bulges, directions, widths, Z, turned UCS match · p321, p338, p340, p345, p350, p354–p356, p371, p384 · `transforms.test.ts:2627`, `polylineWidths.test.ts:766`, `elevation.test.ts:651` | — |
| K catalog | prompts `ok`; `nothingJoined` the table's 43251 + 33559 / 33577 · match | — |
| L history | the counts after a join: known (Missing); `0 objects joined …` match · p334, p358 · `elevation.test.ts:664` | — |
| preselection | joins at once, nothing left selected · match · p363, p365 · `selection.test.ts:1438` | — |
| C, D, E | n/a: no point prompt; the picks are ERASE's (owned) | owned |
| M, P, Q | the rollover, the set's glow, the result unselected · match · desktop d07 | match · d07 |

### BRS, BRP — BREAK's command line and picks

Columns: S `Select object:`, 2 `Specify second break point or [First point]:`, F1 `Specify first
break point:`, F2 `Specify second break point:`, AP BREAKATPOINT's `Specify break point:`.

| Row | S | 2 | F1 | F2 | AP |
| --- | --- | --- | --- | --- | --- |
| A names | `BR`, PARTE, `P`, PARTIRENPUNTO, repeat, `'_BREAK` match · p138–p143; `_.`, `_BR` known (command-line Missing) | | | | |
| B text | match (table 20348) · p117, p121 · `breaking.test.ts:116, 166` | match | match | match | match · `breaking.test.ts:780` |
| B keywords | the modes, no Group · match · p144, p115 | First · match | none · match | First hidden: differs BRS-02 · p150, p171 | none · match |
| B FOO | match · p144 · `invalidAnswers.test.ts:366` | match · p146 | match · p149 | match · p150 | match · p151 |
| B Enter | ends silently · match · p169 | differs BRS-01 · p146, d15 | differs BRS-01 · p149 | differs BRS-01 · p150 | differs BRS-01 · p151, d15 |
| C point forms | match · p145, p153–p157, p176 · `selectionModes.test.ts:1009, 1063`; off screen differs BRP-04 · p158 | match · p147, p148, p153–p155, p160 | match · untested | match · untested | match · p161 |
| C LASTPOINT | moved by a typed pick, even on nothing (p100, p133) · `lastPoint.test.ts:960` | the second point · match | match · untested | match | match · untested |
| C typed box | n/a | differs BRP-06 · d10-2 | match | differs BRP-06 | match |
| D typed snaps | differs BRP-03 · p108–p115, p177 | match · untested · p116, p118 | match · untested · p117 | match · untested | match · untested · p121 |
| D Ortho, Polar | n/a | none bends it · match · untested · p120, d11 | — | — | — |
| E transparent | match · p162 | match · p163 | match · p164 | match · p165 | match |
| F undo | U, REDO, UNDO 2, MREDO name BREAK / BREAKATPOINT, a run that changed nothing too · match · untested · p166–p171 | | | | |
| G | right button = Enter ends · match · d09-1, scratch `me/look.test.ts` | the shortcut menu (owned, LINE's) · d09-2 | | | |
| which object | a pick the newest under it, a mode the oldest · match · p122–p132, p179 · `selectionModes.test.ts:748`; Off · p135, p152 | | | | |
| locked | differs BRP-01, BRP-02, BRP-05 · p100–p107, p178, p395, d06 | | | | |
| preselection | ignored, nothing left selected, no Previous · match · untested · p172–p175 | | | | |
| L history | match but the locked lines | match | match | match | match |

### BRG — what BREAK makes

| Row | Cell |
| --- | --- |
| refusals per type | TEXT, MTEXT, DIMENSION, HATCH, block, by pick and Last · match · p180–p186 · `breaking.test.ts:709`; ATTDEF, a Window's TEXT · untested · p182, p187 |
| line | off and past the end, at the perpendicular foot · match · p200 · `breaking.test.ts:55, 68`; First with off points · untested · p201 |
| arc | a point in the gap to the nearer end, one inside radially · untested · p202–p204 |
| circle | counter-clockwise, the arc keeps the handle · match · p205 · `breaking.test.ts:209`; `@` and BREAKATPOINT refused · match · p207, p208 · `breaking.test.ts:288`; a point inside · untested · p206 |
| polylines | open, closed, the longer way round, `@`, vertices, ends · match · p210–p217 · `breaking.test.ts:330–480`; off points · untested · p218, p219; widths and arc segments · match · p209 · `polylineWidths.test.ts:607` |
| ellipses | whole and arc · match · p220–p223 · `breaking.test.ts:631–700` |
| ends | nothing done, nothing said · match · p226, p227 · `breaking.test.ts:570` |
| handles, order | the start's piece keeps it, the new one appended · match · p224, p225, p228 · `breaking.test.ts:241` |
| properties | colour · match · `breaking.test.ts:88`; layer, linetype, lineweight, thickness, elevation · untested · p194–p198; ltscale, transparency · n/a (not modelled) |
| Z, UCS | a sloping line's Z · match · p189 · `elevation.test.ts:517`; a turned UCS · untested · p197 |
| not level | differs BRG-01 · p188, p190–p193, p199, p229, p230 |

### BRJ — BREAK's look (desktop d01–d14, scratch `me/look.test.ts`)

| Prompt | AutoCAD | mellowcad | State |
| --- | --- | --- | --- |
| S rollover | the object in the rollover glow, as FILLET's (d01-1, corners/d01-1); a text too (d06-2); a locked object no glow, the padlock (d06-1) | `THEME.selected` width 2 | differs BRJ-02; padlock owned (Properties) |
| 2 ghost | what is kept in the selection's glow, what is removed dimmed; off the object at its perpendicular foot; past the end to the end (d01-2–d01-4, d02-1, d03-1, d03-2) | the whole object in `THEME.selected`, the removed piece dashed red | differs BRJ-01 |
| F1 | the object plain, unhighlighted (d04-1) | the whole object in `THEME.selected` | differs BRJ-03 |
| F2 | as 2 (d04-2) | as 2 | differs BRJ-01 |
| AP | the whole object in the glow (d14-1) | `THEME.selected` | differs BRJ-03 |
| dynamic input | S the prompt only; 2, F1, F2, AP the prompt and absolute X, Y fields (d10-1–d10-4) | the coordinate box | BRP-06 |
| snap markers | none at S (d12-1); running snaps at the break points (d12-2) | `wantsSnap` false at S | match · untested |

The ghost under a far Endpoint marker follows the raw cursor in AutoCAD while the click takes the
marker (d01-2, d04-2, d13: the first and second points both snapped to the line's ends and the
line was erased): ours follows the snapped point (PIECES-D30).

### EXP — EXPLODE

| Row | Cell |
| --- | --- |
| A | `X`, DESCOMP, `DP`, repeat · match · untested · p240, p242, p243, p245; `X` unknown in Spanish · match · p241; `_.EXPLODE` known; `'_EXPLODE` refused · match · p246 |
| B messages | the lost width once per wide polyline, both languages · match · p248, p249 · `polylineWidths.test.ts:585`; ellipse and SOLID hatch named after the set · differs EXP-02, EXP-03 · p260, p261 |
| F | one step, U names it · match · p247 · `transforms.test.ts:2599`; U puts the polyline last · differs EXP-05 · p262 |
| G, preselection | owned (ERASE's) · `transforms.test.ts:2813–2900` |
| H polyline | lines and arcs on the centreline, every property and Z, appended after · match · p248 · `transforms.test.ts:2568, 2613, 2661`; tilted, −Z · match · p250, p251 · `normals.test.ts:129` (ends only) |
| H block | one level, layer 0 back to 0, nested, transform, colours · match · p252 · `blocks.test.ts:358` (levels, layers); ByBlock · known · p253; attributes · match · p254 · `attributes.test.ts:538` |
| H MTEXT | one TEXT per line, wrapping · match · p255, p257 · `mtext.test.ts:351`; justification · differs EXP-04 · p256; positions · differs EXP-06 · p255 |
| H dimension, hatch, ellipse | differs EXP-01, EXP-02, EXP-03 · p258–p261 |
| H line, circle, arc, text, ATTDEF | counted as refused · match · p261 · `transforms.test.ts:2764` |
| K, L | Spanish and the history · match · p242, p247, p249, p261 |
| M, P, Q | the rollover, the set, the pieces unselected · match · desktop d08 |

## 5. Findings

### Critical

#### JNG-01 — JOIN loses a segment of a polyline met at an inner vertex, and opens a closed one

- **Severity:** critical · **Row:** H · **Status:** verified (in person)
- **Where:** `cad/application/tools/JoinTool.ts:153` `chainSegments` chains each polyline segment
  apart, then `run` removes the polyline whole.
- **AutoCAD:** p388 (polyline 0,0 → 50,0 → 50,50, line 50,0 → 100,0, the line picked first):
  `0 objects joined, 2 objects discarded from the operation`, nothing changed; p373, p389 a closed
  polyline: the same.
- **mellowcad:** scratch `me/jng01.test.ts`: one polyline `0,0 50,0 100,0`, the segment 50,0 →
  50,50 gone, nothing said; a closed one comes back open and doubled (`c/findings.test.ts`).
- **Scenario:** a line drawn from a corner of a polyline, JOIN, the two picked → a side of the
  polyline vanishes in silence → AutoCAD joins nothing → the drawing is damaged unless the user
  notices and undoes.
- **Fix:** PIECES-D23 — a polyline joins only at its ends, a closed one never; the chain grows
  from the source over whole objects. **Alternative:** none.
- **Regression test:** `transforms.test.ts` (JOIN): p388 both orders, p373, p389.

### High

#### JNG-02 — Collinear lines are joined into a polyline, not into the source LINE

- **Severity:** high · **Row:** H, L · **Status:** verified (in person)
- **Where:** `JoinTool.ts:99` always builds a polyline.
- **AutoCAD:** p300: `2 lines joined into 1 line`, LINE 2D7 kept, now 0,0 → 100,0, 2D8 erased
  (`db.modified "LINE" "2D7"`, `db.erased "LINE" "2D8"`); with a gap or overlapping too (p328,
  p329); the line picked first keeps its handle and properties (p342); collinear 3D lines one 3D
  LINE (p349).
- **mellowcad:** `c/findings.test.ts` p300, p328, p329, p342: a new polyline `0,0 50,0 100,0`.
- **Scenario:** two halves of a wall joined → a polyline with a vertex in the middle, new handle,
  other grips and palette → AutoCAD gives one line.
- **Fix:** PIECES-D20. **Regression test:** `transforms.test.ts`: p300, p328, p329, p342.

#### JNG-03 — The result never keeps a polyline's handle and properties

- **Severity:** high · **Row:** H · **Status:** verified (in person)
- **Where:** `JoinTool.ts:110` a new id, `carryOverrides` of the chain's first segment.
- **AutoCAD:** p343: line on A, red, DASHED picked first, polyline on B, blue, HIDDEN second →
  polyline 2DC kept with B, blue, HIDDEN (`1 segment joined into 1 polyline`); p380 the polyline
  wins though older; p378, p379 of two the one picked first; only lines and arcs make a new
  polyline, with the first's properties (p319, p339, p340).
- **mellowcad:** `c/findings.test.ts` p343: a new id on A, red, DASHED.
- **Fix:** PIECES-D22. **Regression test:** `transforms.test.ts`: p343, p378–p380, p354 (the id).

#### BRS-01 — Enter at a break point ends BREAK; AutoCAD refuses it and asks again

- **Severity:** high · **Row:** B, G · **Status:** verified (in person, console and desktop)
- **Where:** `BreakTool.ts:378` `commitTypedPoint` returns false on empty text.
- **AutoCAD:** p146, p150 and d15: `Point or option keyword required.` (es `Se requiere un punto o
  una opción.`) at both second-point prompts; p149, p151 and d15: `Invalid point.` (es `Punto no
  válido.`) at the first point and BREAKATPOINT's; AllowNone false at all four (trace).
- **mellowcad:** `a/brs.test.ts`: the command ends, nothing changed.
- **Scenario:** an object picked, Enter pressed by habit or by the right button → BREAK is gone →
  AutoCAD keeps asking.
- **Fix:** PIECES-D1; `cad-tools.md`'s "A point prompt the console asks again at Enter … returns
  `true`" already says it. **Regression test:** `breaking.test.ts`: p146, p149–p151.

### Medium

#### JNG-04 — Arcs of one circle become a polyline or nothing, not one ARC or Convert to circle

- **Severity:** medium · **Row:** B, H · **Status:** verified
- **AutoCAD:** p327: `2 arcs joined into 1 arc`, the source ARC kept, counter-clockwise from it
  over the gap; p344 the first picked keeps its handle and properties; closing the circle asks
  `Combined arc segments form a circle.  Convert to circle? [Yes/No] <Yes>:` (es `[Sí/No] <Sí>`),
  Yes or Enter `2 arcs joined and converted to circle`, a new CIRCLE (p326, p382, p386, p387), No
  nothing, silently (p385).
- **mellowcad:** p326 a polyline of two bulges; p327 `0 objects joined …` (`c/findings.test.ts`).
- **Fix:** PIECES-D21. **Regression test:** `transforms.test.ts`: p327, p344, p385–p387.

#### JNG-05 — A window's set takes another source and grows the chain otherwise

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p390: `ssget _C` / `_W` list newest first; p341 the window's result wears L2's
  properties; p377 a T joins L3 to L2, L1 discarded; p324 the square starts at 100,0.
- **mellowcad:** L1's properties, L1 + L2 joined, the square from 0,0 (`c/findings.test.ts`).
- **Area:** the window's order is `Select objects:` (ERASE's plan). **Fix:** PIECES-D25.

#### JNG-06 — Splines and elliptical arcs are not joined, and Missing does not say so

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p331 `2 objects joined into 1 spline`; p374 a line into a spline; p332 `2 elliptical
  arcs joined into 1 arc`; p375 an arc and an elliptical arc `2 objects converted to 1 spline`;
  p369 cLose `Ellipse successfully closed.`
- **mellowcad:** `0 objects joined, 2 objects discarded …`. **Fix:** PIECES-D26 (Missing).

#### BRP-01 — Locked objects at BREAK's `Select object:` are passed over without a word

- **Severity:** medium · **Row:** locked · **Status:** verified
- **Where:** `BreakTool.ts:139` (`one` without `locked`); `objectSelection.ts` `takeOne`.
- **AutoCAD:** each locked object found says `The object is on a locked layer.` (es `El objeto está
  en una capa bloqueada.`), once per object (p178: twice), then, with nothing else, `No object
  found` and the prompt again (p100, p101, p104, p106, desktop d06); with an unlocked one too, the
  oldest unlocked is taken after the line (p102, p103, p107).
- **mellowcad:** `a/brp.test.ts`: a pick says `No object found` only; a mode says nothing; a mixed
  find is taken in silence.
- **Fix:** PIECES-D3.

#### BRP-02 — A pick over a newer locked object and an older unlocked one breaks the older

- **Severity:** medium · **Row:** locked · **Status:** verified
- **AutoCAD:** p105: the newest under the pickbox is tested, locked or not: the locked line and
  `No object found`; p124 (the locked one older) takes A.
- **mellowcad:** `a/brp.test.ts` p105 asks the second break point of A (`ctx.pick` skips locked).
- **Fix:** PIECES-D3.

#### BRP-03 — Typed object snap overrides are refused at `Select object:`

- **Severity:** medium · **Row:** D · **Status:** verified
- **AutoCAD:** the snapped point is the pick, the first break point and LASTPOINT: `_END 99,1`
  first point 100,0 (p108), `_MID` (p109), `_NEA` (p110), `_PER` (p113), `_QUA` (p114); `_INT` the
  newer at the crossing (p111); `_CEN` on a circle `No object found` (p112); one finding nothing
  `No Center found for specified point.`, `*Invalid selection*`, the Expects line, LASTPOINT kept
  (p115); BREAKATPOINT the same (p177).
- **mellowcad:** `*Invalid selection*` and the Expects line, then the raw point is picked
  (`a/brp.test.ts` p108–p115).
- **Fix:** PIECES-D2 (CRP-01's `takesSnapOverride`).

#### BRP-05 — FILLET says nothing of the locked objects a mode finds beside unlocked ones

- **Severity:** medium · **Row:** locked · **Status:** verified
- **Where:** `objectSelection.ts` `takeOne`: `one.locked` only when every find is locked.
- **AutoCAD:** p395: FILLET's Window over a locked line and an unlocked one says `The object is on
  a locked layer.` and takes the unlocked one.
- **mellowcad:** takes it in silence (`takeOne`, the branch read).
- **Fix:** PIECES-D3: one line per locked object found, whatever else is found.

#### BRP-06 — A point typed in the box at the second break point is read relative to the first

- **Severity:** medium · **Row:** C · **Status:** verified (desktop fields)
- **Where:** `BreakTool.ts:384` `relativeByDefault: last !== null`.
- **AutoCAD:** the prompt has no base point (trace: UseBasePoint false) and its pointer input shows
  the cursor's absolute X and Y (d10-2: 45.2825, 12.0008 at the cursor 45.28,12; d10-4 the same
  at BREAKATPOINT's).
- **mellowcad:** `a/dyn.test.ts`: `60,0` in the box with the first point at 30,0 breaks at 90,0.
- **Fix:** PIECES-D7: absolute, `@` from LASTPOINT (the first point, which the pick set).

#### BRG-01 — BREAK refuses an object not level with the UCS, which AutoCAD breaks

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `BreakTool.ts` `breakable` (`readsInPlan`), the pick and the selector's `accept`.
- **AutoCAD:** p190 a polyline drawn in UCS X 90 broken in two LWPOLYLINEs of normal 0,−1,0, its
  handle kept; p192 a −Z polyline cut in its OCS; p188 a circle in UCS X 90 an ARC; −Z arcs and
  circles read the WCS X,Y as OCS (p191, p193, p199, p229, p230).
- **mellowcad:** `b/brg.test.ts`: `No object found`, the prompt again.
- **Fix:** PIECES-D10. The coverage's "an object at an angle … is not taken" is wrong.

#### BRJ-01 — BREAK's ghost glows the whole object and dashes the removed piece red

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **AutoCAD:** desktop d01-2, d01-3, d01-4, d02-1, d03-1, d03-2, d04-2: what the break keeps in the
  selection's glow, the piece it removes dimmed, as FILLET's ghost (corners/d01-2).
- **mellowcad:** `me/look.test.ts`: the object in `THEME.selected` width 2 and the removed piece
  `#ef4444` dashed.
- **Fix:** PIECES-D31: one outcome shared by the click and the ghost, drawn with `ghostLook.ts`'
  `drawn` (the kept pieces `glow`, the object `faded`, hidden).

#### EXP-01 — A dimension is refused; AutoCAD 2027 explodes it

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p258: 3 LINEs, 2 SOLIDs (the arrowheads) and an MTEXT `100`.
- **mellowcad:** `1 was not able to be exploded.`, `None found.` (`b/exp.test.ts`).
- **Fix:** PIECES-D11 (Missing, with a `WHY`).

#### EXP-02 — A hatch is refused at the count; AutoCAD explodes a pattern and names a solid one

- **Severity:** medium · **Row:** H, B · **Status:** verified
- **AutoCAD:** p259 an ANSI31 hatch into 33 LINEs clipped to its boundary, each `Continuous`; p260 a
  SOLID hatch `1 found`, then `Cannot explode HATCH` (es `No se puede descomponer HATCH`).
- **mellowcad:** `1 was not able to be exploded.`, `None found.` **Fix:** PIECES-D12.

#### EXP-03 — An ellipse is counted refused; AutoCAD passes it and names it as a spline

- **Severity:** medium · **Row:** B, L · **Status:** verified
- **AutoCAD:** p261: `6 found` / `5 were not able to be exploded.` / … / `Cannot explode ELLIPSE`
  (es `No se puede descomponer ELLIPSE`).
- **mellowcad:** `6 were not able to be exploded.`, `None found.` **Fix:** PIECES-D13.

#### EXP-04 — Exploded MTEXT's texts take the attachment's column; AutoCAD makes each Left

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `cad/domain/mtext.ts` `mtextLineTexts` (`justify: layout.align`).
- **AutoCAD:** p256 (Middle center): `OLD` and `LINES` TextLeft / BaseLeft at each line's drawn
  left end; p255 (Top left) Left too.
- **mellowcad:** `center` at the column (`b/exp.test.ts` p256). **Fix:** PIECES-D14.

#### EXP-05 — U after EXPLODE puts the polyline back at the end of the drawing's order

- **Severity:** medium · **Row:** F · **Status:** verified · **Area:** undo (LINE's plan)
- **Where:** `entityCommands.ts` `ReplaceEntitiesCommand.undo` and `RemoveEntitiesCommand.undo`
  re-add through `Document.addMany`, which appends.
- **AutoCAD:** p262: after `_U` the polyline is before the line drawn after it; `_ERASE _L` erases
  the line.
- **mellowcad:** `[L, P]`; `ERASE L` erases the polyline (`b/exp.test.ts` p262).
- **Fix:** PIECES-D15.

### Low

#### JNG-07 — Missing and a `WHY` describe 2027's 3D joins wrongly

- **Severity:** low · **Where:** `JoinTool.ts:55` ("AutoCAD joins a rising line into a 3D
  polyline") and the entry's Missing.
- **AutoCAD:** p347 a rising line joined into a level LWPOLYLINE, its rise lost; p358 at Z 10 not
  joined; p357 touching in plan only, discarded; p348 refused as a source; p349 collinear 3D lines
  one 3D LINE (JNG-02); a 3D polyline only from a −Z polyline and a line (p353), a spline from a −Z
  arc and a line (p352). **Fix:** PIECES-D24.

#### JNG-08 — Lines in a tilted plane are not joined

- **Severity:** low · **AutoCAD:** p351: lines drawn in UCS X 90, joined from the WCS, `2 objects
  converted to 1 polyline` of normal 0,−1,0. **mellowcad:** `0 objects joined …`
  (`c/more.test.ts`). **Fix:** PIECES-D26 (Missing).

#### JNS-01 — Coverage citations and the counts' example are stale

- **Severity:** low · "forum captures" and "a real history's" are settled by p300, p334, p358;
  Missing's `9 segments joined into 3 polylines` never came up: the 2027 forms are PIECES-D27's.

#### JNS-02 — A source alone and Enter writes a count AutoCAD does not

- **Severity:** low · known gap (the source step) · p310, p311, p364: AutoCAD asks `Select lines to
  join to source:`; mellowcad says `0 objects joined, 1 object discarded from the operation`.
  **Fix:** PIECES-D28.

#### JNS-03 — JOIN's tests cite nothing and hold no Spanish

- **Severity:** low · `transforms.test.ts:2538–2661` cite no probe; `:2584` pins a start at 0,0 no
  source gives; `:2598` does not check the step's name; `:2661` cannot tell the source;
  `elevation.test.ts:680` pins a deviation with a false `WHY`; `polylineWidths.test.ts:766` cites
  acc/w11, w22 (p354–p356 now).

#### BRS-02 — `_F` at the re-asked second point is refused; AutoCAD ends BREAK silently

- **Severity:** low · p150, p171: First is still declared there, ends the command, nothing changed,
  U names BREAK; mellowcad: `Point or option keyword required.` (`a/brs.test.ts`). **Fix:**
  PIECES-D4.

#### BRS-03 — BREAK's coverage and tests drift

- **Severity:** low · Missing "Group" is stale (no Group at `Select object:` in 2027: p115, p144);
  `P`† verified (p140); "as AutoCAD 2023's console does" is now p125–p132;
  `lastPoint.test.ts:959` cites acc/wn53, bk36–bk38, whose input finds nothing on 2027 (p158):
  re-base on p176; `breaking.test.ts:140` types `100,0` where relative and absolute agree.

#### BRP-04 — A point typed off the screen at `Select object:` still picks

- **Severity:** low · **Area:** `Select objects:` (ERASE's plan) · p158, p159: `No object found`
  in the initial view, LASTPOINT moved; with the line on screen p176 breaks it; mellowcad breaks it
  either way (`a/offscreen.test.ts`). **Fix:** PIECES-D5 (Missing, command line).

#### BRG-02 — BREAK's 2023 citations, a weak assertion

- **Severity:** low · every acc/ citation held on 2027 (hd → p213, p224, p225, p228; pb → p216–p219;
  pc → p210–p215; refusals → p207, p208, p223; be → p180–p187, p220–p222; bz → p226, p227; w9 →
  p209); `breaking.test.ts:601` `toMatch(/break point/)`.

#### BRG-03 — BREAK's untested cells

- **Severity:** low · p182, p187, p194–p198, p201–p204, p206, p218, p219, p197.

#### BRJ-02 — BREAK's rollover is blue, FILLET's and AutoCAD's the plain glow

- **Severity:** low · d01-1, d06-2 against corners/d01-1: one look; mellowcad `THEME.selected`
  where FILLET's `cornerRollover` is `THEME.entityHover` width 2. **Fix:** PIECES-D32.

#### BRJ-03 — After First point and at BREAKATPOINT's point the object is highlighted as picked

- **Severity:** low · d04-1: at `Specify first break point:` the object is drawn plain; d14-1:
  BREAKATPOINT's point glows the whole object (its result, both pieces kept). **Fix:** PIECES-D31.

#### EXP-06 — Exploded MTEXT's line positions differ by the font's metrics

- **Severity:** low · p255: 9.324693,39.822647 and 8.976808,22.985448 (pitch 16.837 for h10);
  mellowcad 10,40 and 10,23.333333. MTEXT's layout: the Text review.

#### EXP-07 — EXPLODE's tests cite nothing

- **Severity:** low · `transforms.test.ts:2568, 2613, 2661`, `blocks.test.ts:358`,
  `attributes.test.ts:538`, `mtext.test.ts:351` (text only), `normals.test.ts:129` (ends only);
  `polylineWidths.test.ts:585` cites acc/w8, w23 (p249 now).

#### EXP-08 — EXPLODE's coverage and untested cells

- **Severity:** low · `DP`† verified (p243); "Anything else is refused as it is found" wrong
  (p258–p261), the class JSDoc too; untested p240, p243, p245, p247, p250, p251, p252's transform
  and colours.

## 6. Decisions taken

- **PIECES-D1** (BRS-01): an empty answer at the second-point prompts reports
  `pointOrKeywordRequired`, at the first point and BREAKATPOINT's `invalidPoint`, and asks again.
- **PIECES-D2** (BRP-03): BREAK's `Select object:` takes typed overrides through
  `takesSnapOverride`, the snapped point its pick, first break point and LASTPOINT, as FILLET's
  (CRP-01).
- **PIECES-D3** (BRP-01, BRP-02, BRP-05): a single object's pick tests the newest object under the
  pickbox, locked or not; `one.locked` is said once per locked object a pick or a mode finds,
  whatever else it finds; then the oldest (or newest) unlocked one is taken, or, with none, `No
  object found` unless the command is `silent` (FILLET's p274 says no more).
- **PIECES-D4** (BRS-02): First is a hidden keyword at the re-asked second point and ends the
  command, changing nothing.
- **PIECES-D5** (BRP-04): left to the `Select objects:` area, noted in `command-line.md`'s Missing:
  a typed pick tests the whole drawing, not only what the view shows.
- **PIECES-D7** (BRP-06): a point typed in the box at a break point is absolute.
- **PIECES-D10** (BRG-01): a polyline not level with the UCS is cut in its OCS (`cornerPlane`'s
  way); ARC, CIRCLE and ELLIPSE not level stay refused and go to Missing with p188, p191, p199,
  p230 — AutoCAD reads a −Z one's picks as OCS coordinates, a rule two probes do not settle for
  the tilted ones.
- **PIECES-D11** (EXP-01): a dimension stays refused, with a `WHY` (no SOLID object) and Missing.
- **PIECES-D12** (EXP-02): a pattern hatch explodes into its pattern's lines, `Continuous`, the
  hatch's layer and colour (a probe of colour and layer first); a SOLID hatch passes the count and
  is named `Cannot explode HATCH`.
- **PIECES-D13** (EXP-03): an ellipse passes the count and is named, as a spline.
- **PIECES-D14** (EXP-04): each exploded line is a Left TEXT at its line's drawn left end; the
  positions' metrics (EXP-06) go to the Text review.
- **PIECES-D15** (EXP-05): undo puts a removed object back at the index it had (an ordered insert
  in `Document`); ERASE then U probed in the execution.
- **PIECES-D16, D17** (BRG-02, BRG-03, EXP-07, EXP-08, BRS-03, JNS-03): citations become the 2027
  probes, the untested cells get tests, the entries their corrections.
- **PIECES-D20** (JNG-02): collinear lines (touching, with a gap, overlapping, in 3D) become the
  source LINE stretched to the farthest ends, its id and properties.
- **PIECES-D21** (JNG-04): arcs of one circle become the source ARC, counter-clockwise over the
  gaps; closing the circle asks `Convert to circle? [Yes/No] <Yes>`: Yes a new CIRCLE, No nothing.
- **PIECES-D22** (JNG-03): the source is the first polyline of the set, else the first object; a
  polyline source keeps its id and properties; lines and arcs alone make a new polyline wearing
  the first's.
- **PIECES-D23** (JNG-01): the chain grows from the source over whole objects in the set's order
  until none fits; a polyline joins only by its ends, a closed one never; a lens closes in two
  vertices (p325), which closes that Missing gap.
- **PIECES-D24** (JNG-07): rising lines stay out — 2027 flattens one (p347) and refuses another
  (p358) —, the `WHY` and the entry rewritten with the probes.
- **PIECES-D25** (JNG-05): JOIN reads the set newest first where a window found it (p390); the
  window's order for other commands stays as it is and goes to the roadmap for `Select objects:`.
- **PIECES-D26** (JNG-06, JNG-08): splines, elliptical arcs, −Z objects and tilted planes go to
  Missing with their probes.
- **PIECES-D27**: JOIN reports what it made in 2027's words (`2 lines joined into 1 line`,
  `2 arcs joined into 1 arc`, `2 arcs joined and converted to circle`, `n objects converted to m
  polylines`, `n segments joined into 1 polyline`, the `, n objects discarded from the operation`
  suffix), each from the tables (21955/26784, 55013/17569, 16852/51416/42142, 32437/47058, 33567,
  33559/33577, 43251) checked against p300, p319, p321, p322, p327, p333, p356, p386.
- **PIECES-D28** (JNS-02): the source step stays Missing; the entry says what a source alone does
  here.
- **PIECES-D30**: the ghost follows the snapped point, which the click takes (`cad-tools.md`'s
  "Preview must equal commit"); AutoCAD's ghost trailing the raw cursor under a far marker (d13) is
  not copied.
- **PIECES-D31** (BRJ-01, BRJ-03): BREAK's ghost is its outcome: the kept pieces in the glow over
  the object faded at the second points, both pieces in the glow at BREAKATPOINT's, the object
  plain at `Specify first break point:`.
- **PIECES-D32** (BRJ-02): BREAK's rollover is FILLET's (`cornerRollover`'s stroke), and
  `cad-tools.md`'s "single prominent pick … `THEME.selected`" names its exceptions.

## 7. Tests proposed

The regression tests are in each finding. The untested cells, by file: `breaking.test.ts`
(p116–p121, p147, p148, p153–p161, p166–p175, p182, p187, p194–p204, p206, p218, p219, the 2023
citations to 2027's), `selectionModes.test.ts` (p125–p132: every mode, not only W and C),
`transforms.test.ts` (JOIN: p309, p334 es, p360–p362; EXPLODE: p240, p243, p245, p247, p250–p252),
`normals.test.ts` (the exploded pieces' normal), `mtext.test.ts` (justification),
`polylineWidths.test.ts` and `lastPoint.test.ts` (re-cited).

## 8. What is not tested and why

The ghost's colours beyond the strokes the harness reads (the canvas's glow is `SceneBuilder`'s);
the padlock at the cursor (the Properties review); the shortcut menu's entries (LINE's).

## 9. What could not be reviewed and why

Save and open of a broken polyline or ellipse (row J, LINE's area, no change here); the tilted
ARC, CIRCLE and ELLIPSE rule (PIECES-D10); how AutoCAD grows a chain beyond p324, p377, p384; the
English profile's desktop; Frozen layers (not modelled).

## 10. Refuted in the adversarial pass

- The pieces' linetype scale and transparency: n/a, not modelled (p194).
- The lost-width message for every polyline: a PLINEWID left at 2 in the probe (p249 rerun).
- EXPLODE of tilted and −Z polylines, of blocks, MTEXT wrapping, TEXT and ATTDEF refused: match.
- A text in JOIN's set refused at the pick: AutoCAD counts it and discards it (p320), as here.
- acc/w11, w22 changed in 2027: they hold (p354–p356).
- Ortho or Polar bending BREAK's second point: neither does (d11).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| BREAK: "an object at an angle … is not taken" | p190, p192 | false (BRG-01) |
| BREAK Missing: Group | p115, p144 | no longer true in 2027 |
| JOIN: "merged into one polyline" | p300, p327, p343 | false (JNG-02 to JNG-04) |
| JOIN: "none at an angle … is taken" | p351 | not 2027's (JNG-08) |
| JOIN Missing: "AutoCAD makes a 3D polyline" | p347, p349, p358 | not 2027's (JNG-07) |
| EXPLODE: "Anything else is refused as it is found" | p258–p261 | false (EXP-01 to EXP-03) |
| EXPLODE: "aligned by the attachment's column" | p256 | false (EXP-04) |

| Rule | Code | State |
| --- | --- | --- |
| `cad-tools.md`: a point prompt the console asks again at Enter returns `true` | `BreakTool.ts:378` | broken (BRS-01) |
| `cad-tools.md`: a tool with flat geometry acts only on `readsInPlan` objects, BREAK among them | `BreakTool.ts` `breakable` | stale with BRG-01 (polylines) |
| `cad-tools.md`: single prominent pick → `THEME.selected` | BREAK, FILLET | stale (BRJ-02) |
| `cad-engine.md`: coplanar means `coplanar(a, b)` (… JOIN …); `cad-tools.md`: JOIN chains one plane | `JoinTool.ts` `samePlane` | stale for JOIN: it discards, never refuses (p346) |

Checked and holding: `carryPiece` for BREAK's pieces, the start piece's id, widths through
`polylineSpan` (p209, p224, p225, p228); `insertGeometry` as EXPLODE's result (p252, p254);
every other claim of the three entries cited in §4.

## 12. Order of execution and estimate

1. **JNG with JNS** — the critical and highs first; the catalogs (D27's messages, D21's prompt)
   before BREAK's. About half the execution.
2. **BRS** — Enter and First at the break points; small.
3. **BRP** — the shared single object's pick (D3, FILLET's too), BREAK's typed snaps and box.
4. **BRG** — tilted and −Z polylines; tests and citations.
5. **BRJ** — the ghost and rollover, after BRG (the ghost shares its outcome).
6. **EXP** — hatches, ellipses, MTEXT, the order U restores (`Document`).

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/modify.md`: BREAK, JOIN and EXPLODE entries as each decision says;
  `docs/coverage/command-line.md` Missing: the typed pick off the screen (D5).
- `.claude/rules/cad-tools.md`: the single object's pick's locked lines (D3), the rollover (D32),
  BREAK's tilted polylines (D10), JOIN's planes; `cad-engine.md`'s coplanar line.
- Catalogs: JOIN's report messages and Convert to circle's prompt (en, es, ar), BREAK's refusals
  at Enter (existing ids), EXPLODE's `Cannot explode` names.
- Roadmap: Pieces owns a single object's pick with modes; the window's set order (JNG-05) and the
  typed pick off the screen (BRP-04) for `Select objects:`; EXP-06 for the Text review; UCS
  OBject's and ARRAYPATH's locked words for theirs.

## 14. Template improvements

- A single object's pick shared by several commands: probe a mode's find that mixes locked and
  unlocked objects for each (p395 found FILLET's).
- A scratch test of an edit that may replace an object asserts on what the drawing holds, not on
  `byId` of the original (JNG-01's first test errored instead of failing).
- On the desktop, a ghost under a far Endpoint marker trails the raw cursor while the click takes
  the marker (d13): read a click's result, not the ghost, when a marker shows.
- An Enter the console refuses at a jig prompt is confirmed on the desktop through COM alone, with
  no mouse, between two answers (`_BREAK\n30,0\n\n60,0\n`, d15).
