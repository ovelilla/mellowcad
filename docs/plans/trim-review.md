# TRIM / EXTEND review

> **Status:** plan, 2026-10-22 — phases 0–4 of skill `command-review`, the twelfth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (TMI, TRS, TRP with EDG, TRG, TRJ).

## 1. Summary

4 high, 15 medium and 10 low findings over six blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| TRS | the command line: Enter, preselection, Undo and what counts as a step, keywords | 2 | 2 | 4 |
| TRP | the picks at the object prompt: snaps, ties, locked layers, empty fences | 0 | 4 | 2 |
| EDG | edges and fences, the area this review owns | 0 | 0 | 1 |
| TRG | what it produces: arc segments as edges, blocks and text as edges, refusals | 2 | 5 | 2 |
| TRJ | the look: the ghost, the extension's preview, the fence's preview, the badges | 0 | 3 | 1 |
| TMI | MIRROR's text read twice (Transforms' area) | 0 | 1 | 0 |

The worst: an Enter at Quick mode's fresh prompt ends TRIM and EXTEND, where AutoCAD takes it once
as a step and keeps asking, so the old `TR ⏎ ⏎` and then picks still trims there and starts windows
here (TRS-01: p100, p116, p118, p120, and the desktop through COM); objects selected before the
command are dropped, where AutoCAD makes them the only cutting or boundary edges and skips the
edges' prompt (TRS-02: p141–p144); a polyline's arc segment cuts and bounds lines, arcs and circles
at its chord — a line trimmed against a rounded slot stops in mid-air, a circle it crosses is
deleted (TRG-01: p171–p173); a block reference and a text are no edge, so Quick deletes a wall that
only a door block crosses (TRG-02: p237, p238).

The analogues OFFSET left, checked first: the object pick takes a typed point and sets LASTPOINT,
hit or miss (OFP-01, OFP-03 hold: p240–p250, `editing.test.ts:748`); the object prompt's menu has
no Modificaciones de REFENT and the fence's next point has them (OFJ-03 holds: d05-1, d05-2,
scratch r `look.test.ts`); what cannot be trimmed or extended is said — not so for text, MTEXT,
blocks, hatches, dimensions and objects perpendicular to the UCS (OFG-07's analogue differs:
TRG-04, TRG-05, TRG-06); a command's own ghost — TRIM's is the piece dimmed in place, not a red
dashed line (OFJ-01's analogue differs: TRJ-01). The MIRROR property test OFFSET saw fail is no
flake: a text at 0°, 90°, 180° or 270° mirrored across a 45° or 135° line reads otherwise than
AutoCAD's in six of eight cases, and fast-check only rarely draws one (TMI-01: p01, p02).

## 2. Inventory

Commit `a42743b`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The command:** `cad/application/tools/EdgeEditTool.ts` (TRIM and EXTEND, its modes, edges,
  fences, eRase and every type's plan), `TrimTool.ts`, `ExtendTool.ts`; `curveCrossings.ts`,
  `objectSelection.ts`, `boxSelection.ts`, `typedPick.ts`, `domain/polylines.ts`' `polylineSpan`,
  `domain/ellipses.ts`' `ellipseCut`; `defaultTools`, `TOOL_COMMANDS`; not transparent (p104).
  Catalogs: names TRIM (`TR`; es RECORTA, `RR`) and EXTEND (`EX`; es ALARGA, `AL`), keywords
  cuTting, Boundary, Fence, Crossing, mOde, Quick, Standard, Edge, Extend, No extend, eRase, Undo,
  the `keywordLabels` of cuTting edges and Boundary edges, the prompts and messages of the coverage
  entry; `ar` has no command language. The rail (`components/cad/tool-rail.tsx`), the landing's
  filing (`content/commands.ts`).
- **The runtime it leans on:** the shared session object of TRIMEXTENDMODE and EDGEMODE
  (`runtimeTools.ts`), the command menu (`runtimeShortcutMenu.ts`), the object snap overrides
  (`CadRuntime.pointModifier`), `ctx.pick` and `Document.pickAll`.
- **Tests:** `editing.test.ts` (52–2141), `lastPoint.test.ts`, `invalidAnswers.test.ts`,
  `englishSurface.test.ts`, `tiltedUcs.test.ts`, `elevation.test.ts`, `polylineWidths.test.ts`,
  `currentProperties.test.ts`; `cornerRefusals`, `savedSettings`, `measuredAnswers` and `normals`
  name FILLET's trim mode only.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after it; ID for LASTPOINT;
  -LAYER Lock and Off; 'LTSCALE, 'ZOOM, '-PAN, '-OSNAP inside it; MIRROR's text (TMI).
- **Areas owned:** edges and fences — the edges' prompts, Fence, the implied fence, Crossing and
  Standard's implied window, Shift's other action (blocks EDG and TRP).
- **Areas cited:** LINE's (the command line, point input, object snaps, Ortho, Polar, dynamic
  input, transparency, undo, the shortcut menus), ERASE's (`Select objects:`, preselection, the
  pick), PLINE's (the polyline object), CIRCLE's, ARC's, ELLIPSE's and SPLINE's objects,
  Transforms' (MIRROR's text), OFFSET's (the analogues). Differences found in them: TRP-01 (typed
  overrides at a single object's pick: LINE's object snaps), TRP-02 (which of two objects a pick
  takes: ERASE's pick), TMI-01 (MIRRTEXT 0: Transforms').
- **Knowledge:** `docs/coverage/modify.md` (TRIM / EXTEND); rules `cad-tools.md`,
  `cad-catalogs.md`, `cad-engine.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/trim/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh trim <ids>` in es-ES and en-US; the
desktop's are `dsk.sh` with `lib-dsk.sh` and `shift.ps1` (OFFSET's view). Transcripts and
screenshots are in `research/probes/trim/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | ACADVER, `_VERNUM` |
| p01, p02 | MIRRTEXT 0: texts at 270°, 90°, 0° and 180° mirrored twice across a 45° and a 135° line |
| p100–p164 | the command line: names (TRIM, TR, RECORTA, RR, EXTEND, EX, ALARGA, AL, `_.`, `'TRIM`), repeat, Enter at the fresh prompt and after each kind of answer; FOO, 0, `_Q`, `_S`, `_X`, `_P`; mOde, Edge, Project, eRase, their Enter and refusals; Undo at each depth and with nothing; U, REDO, UNDO 2, MREDO, U after an empty run; transparency at each prompt and U after it; preselection in each mode; TRIMEXTENDMODE, EDGEMODE, PROJMODE (defaults, typed, storage, OPEN); the Spanish letters |
| p170–p239 | what it produces, MPDUMP: line, arc, circle (with elevation, thickness, normal −Z), polylines open and closed, straight and arc, widths, crossing themselves, as their own edge; splines; text, MTEXT, attdef, dimension, hatch, insert, point picked and as edges; EXTEND's refusal per type, which end grows, an end on a boundary, tangents; objects perpendicular and at 45° to the UCS; UCS turned; Z; Edge=Extend; Undo and U |
| p240–p309, p380–p389 | the picks and points: every point form at the object prompt and LASTPOINT after a hit, a miss and each refusal; locked, Off and frozen layers; two objects in the pickbox; `_END`, `_MID`, `_INT`, `_NEA`, `_PER`, an override's Enter; the edges' prompts and every selection mode there; mOde there; Fence, the implied fence, Crossing, Standard's window: words, Enter, Undo, zero length, crossing nothing, order |
| d01–d09 | the desktop (Spanish profile): TRIM's ghost, Shift's, EXTEND's; a fence by clicks and by a drag; the right button at the object and the fence; Standard's window; Ortho and Polar at the fence; Escape and U; what cannot be trimmed |

## 4. Matrix

Cells read `state · probe · test`; "scratch" is `research/review/trim/<a|b|c|r>/` (gitignored).
Columns: O (the object prompt), M/E/P (mOde, Edge, Project), R (eRase), K (the edges' prompts), F
(Fence and the implied fence), C (Crossing and Standard's window).

### TRS — the command line

| Row | O | M/E/P | R | K, F, C |
| --- | --- | --- | --- | --- |
| A names, aliases, repeat | match · p100–p103 · `englishSurface.test.ts:923`; the † of RR, AL stale (TRS-08) | — | — | — |
| A `_.TRIM`, `'TRIM` | known (command-line.md); refused: match · p104 | — | — | — |
| A preselection | differs TRS-02 · p141–p144 | — | — | — |
| B text, settings line | match · p100, p119, p145, p146 · `editing.test.ts:73` | match · p107, p110, p125 | match · p111, p112 | owned EDG |
| B listing | Project unlisted: known · p100–p103 | — | — | — |
| B keywords declared | match · p100, p106, p108 | `Noextend` differs TRS-06 · p125, p161 | match · p111 | — |
| B Enter | differs TRS-01 · p100, p116, p118, p120; after an edit, Standard, chosen edges: match · p117, p119, p152 | keeps: match · p107, p125 | ends or erases: match · p111, p153 | owned EDG |
| B FOO, another prompt's word | match · p105, p139 · `editing.test.ts:857` | match · p107, p125 | match · p112 | owned EDG |
| B the Expects line | TRIM match · p105; EXTEND differs TRS-05 · p103, p113, p268 | — | — | — |
| B Undo with nothing | differs TRS-03 · p114, p135, p155 | — | — | — |
| B Undo listed after a non-edit | differs TRS-04 · p107, p136, p161, p162; TRP-05 · p241, p273, p303 | — | — | — |
| E 'ZOOM, '-PAN, '-OSNAP | match · p121, p123 | match · p124, p125, p127 | match · p126 | — |
| E 'TRIMEXTENDMODE, 'EDGEMODE, 'PROJMODE | known ("as variables") · p122, p123 | — | — | — |
| F U at each depth | match · p115 · `editing.test.ts:62` | — | — | — |
| F after a transparent command | differs TRS-07 · p163, p164 | — | — | — |
| F after the command: U, UNDO 2, REDO, MREDO, an empty run | match · p130–p134, p149, p150 | — | — | — |
| F an Edge choice joined to the edit | match · p135, p137, p138 · `editing.test.ts:1662` | — | — | — |
| G another command typed | match · p139 | — | — | — |
| G Escape after edits, then U | match · d08 · `editing.test.ts` (Escape keeps) | — | — | — |
| G what is left selected | nothing: untested · p140, p141 | — | — | — |
| K catalog sweep, Spanish letters, `COrte` | match · p100, p101, p151, p154 · sweep 25 ok | — | — | — |
| K `Todos los efectos del comando han sido deshechos.` | match · p115 es (settles the coverage's mark) | — | — | — |
| L history | match line by line · p100–p164 · scratch a | — | — | — |
| storage of the three variables | per user, kept across OPEN: holds · p147, p148 · `runtimeTools.ts:83` | — | — | — |

### TRP and EDG — the picks, edges and fences

| Row | O | K | F | C |
| --- | --- | --- | --- | --- |
| C `x,y`, `@dx,dy`, a point on nothing | match · p240–p242, p248 · `editing.test.ts:748`, `:775` | — | match · p289–p293 · `editing.test.ts:1003` | match · p301, p302 |
| C `@`, `d<a`, `*x,y`, `#x,y`, a number | untested · p243–p247 · scratch c | — | a number from the first point: untested · p299 | — |
| C LASTPOINT after a hit, a miss, a refusal | untested · p240, p248–p250 | — | untouched: match · p291 | the first corner: match · p301 |
| C a locked object | differs TRP-03 · p251 | a locked edge cuts: untested · p255 | — | — |
| C an Off object | the fence starts: untested · p252, p253; no edge · p254 | — | — | — |
| C two objects in the pickbox | differs TRP-02 · p256, p257 | — | — | — |
| D typed overrides | differs TRP-01 · p259–p263 | — | `_END` at the first point: match · p266 | — |
| D an override's Enter, left pending | match · p264 | — | — | — |
| D Ortho, Polar | — | — | not bent: untested · d07, p265 · scratch r `ortho.test.ts` | — |
| B every selection mode at the edges' prompt | — | match · p272–p282 · scratch c | — | — |
| B mOde at the edges' prompts | — | empty: match · p284, p285; with a set: differs EDG-01 · p283, p389 | — | — |
| B chosen edges across modes, an edge's pieces | — | match · p286–p288 · `editing.test.ts:1381` | — | — |
| B an empty fence or window, then U | — | — | differs TRP-04 · p380, p381 | Undo listed: differs TRP-05 · p303, p382 |
| H a fence's order, the same object twice, EXTEND's | — | — | match · p294, p295, p300 | clockwise: match · p304–p306 |
| P a drag on nothing | — | — | known (`pick/drag cursor`) · d04 · scratch c | — |
| P Shift in EXTEND on an uncrossed line | deletes it: match · d02 · scratch r (settles the coverage's mark) | — | — | — |

### TRG — what it produces

| Row | Cell |
| --- | --- |
| H a line, an arc, a circle split: handles, order, properties, Z | match · p170, p174, p175, p231 · `editing.test.ts:149`, `:193`, `elevation.test.ts:485` |
| H polylines: closed with widths, split on a straight and an arc segment, crossing themselves, their own edge, cut once | match or untested · p177–p184 · `editing.test.ts:409`, `polylineWidths.test.ts:619` (settles the closed one cut once) |
| H the piece after a polyline's own crossing | known (zero-length segment) · p181 |
| H splines trimmed and extended | known · p187–p189 |
| H ellipses, elliptical arcs | match · p229, p230 · `editing.test.ts:1924` |
| H a polyline's arc segment as an edge | differs TRG-01 · p171–p173 |
| H a block and a text as edges | differs TRG-02 · p237, p238; a hatch is none: untested · p203 |
| H a level object with normal −Z | differs TRG-03 · p175 |
| H text, MTEXT, attdef, block, hatch picked | differs TRG-04 · p190–p202 |
| H a dimension picked | differs TRG-05 · p194, p239 |
| H an object or edge perpendicular to the UCS | differs TRG-06 · p220, p221; at 45°: known · p220 |
| H EXTEND to its own polyline | differs TRG-07 · p236 |
| H EXTEND's refusals per type | English match · p204–p211 · `editing.test.ts:565`; Spanish differs TRG-08 · p207, p209, p211 |
| H which end grows, an end on a boundary, tangents, two edges at a point | match or untested · p212–p219 · `editing.test.ts:626`, scratch b |
| H a UCS turned, a line at another Z | untested · p222, p223 |
| H Edge=Extend: a line, an end arc segment (settles the coverage's mark) | match · p224–p226 · `editing.test.ts:1690` |
| F Undo, U: the object back with its id | untested · p227, p228 |
| J save and open a trimmed drawing | untested · scratch b "J" |

### TRJ — the look

| Row | Cell |
| --- | --- |
| M TRIM's ghost | differs TRJ-01 · d01-1, d01-2 · scratch r `look.test.ts` |
| M Shift's and EXTEND's ghost | differs TRJ-02 · d01-3, d02-1, d02-2 |
| M a fence or a window running | differs TRJ-03 · d03-1, d04-1, d06-2 |
| Q the cursor's badges | differs TRJ-04 · d01-1, d09-1 |
| P the right button | match · d05-1, d05-2 · scratch r `look.test.ts` |
| Q the tooltip at the object prompt and the fence: no field | match · d01-1, d03-1 |

### TMI — MIRROR's text

| Row | Cell |
| --- | --- |
| H MIRRTEXT 0 at 0°, 90°, 180°, 270° across 45° and 135° | differs TMI-01 · p01, p02 · scratch r `mirror.test.ts` |

## 5. Findings

### High

#### TRS-01 — Quick's first Enter at a fresh object prompt ends TRIM and EXTEND; AutoCAD takes it once

- **Severity:** high · **Row:** G · **Status:** verified (console and desktop through COM)
- **Where:** `EdgeEditTool.ts:586` (`onEnter` returns false at the object prompt; its JSDoc cites
  2023's ta12).
- **AutoCAD:** p100, p116, p118, p120 (both languages); `com send "_TRIM\n\n\n"` on the desktop:
  after `_TRIM`, Enter writes the object prompt again with `/Undo]` (es `/desHacer]`), a pick then
  still trims (p118), `_U` says `Command has been completely undone.` (p116) and a second Enter
  ends. Not after an edit (p115, p117), in Standard after select-all (p119) or once edges were
  chosen (p152); after a refusal the next Enter is that first one (p246, p271).
- **mellowcad:** scratch a "TRS-a": the first Enter ends the command.
- **Scenario:** `TR ⏎ ⏎`, then picks → mellowcad has ended and the picks start windows → AutoCAD
  trims → the old habit breaks.
- **Fix:** TRIM-D1. **Regression test:** `editing.test.ts`: TR ⏎ lists Undo, U says completely
  undone, ⏎ ends; EXTEND the same; a refusal then ⏎.
- **Coverage:** Enter at the object prompt (Implemented).

#### TRS-02 — A preselection is dropped; AutoCAD makes it the cutting or boundary edges

- **Severity:** high · **Row:** A, G · **Status:** verified
- **Where:** `EdgeEditTool.ts:271` (`onActivate` clears the selection).
- **AutoCAD:** p141 (Quick), p142 (Standard), p143, p144 (EXTEND): the settings, `Select cutting
  edges ...` (`Select boundary edges ...`), `1 found`, then the object prompt — Standard's edges'
  prompt skipped; only the preselected objects cut (the line cut back to the one edge), EXTEND
  toward the other side says `No edge in that direction.`; nothing left selected.
- **mellowcad:** scratch a "TRS-e": nothing said, every object an edge.
- **Fix:** TRIM-D2. **Regression test:** `editing.test.ts`, p141–p144.
- **Coverage, rules:** preselection in Implemented; `cad-catalogs.md`'s `preselect` holds again.

#### TRG-01 — A polyline's arc segments cut and bound at their chords

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `EdgeEditTool.ts` `trimCrossParams`, `extendCrossParams`, `circleEdgeCrossPoints` read
  a polyline edge through `polylineSegments` (chords); only ellipse and spline targets go through
  `implicitEdges`.
- **AutoCAD:** p171: the line x=50 against the semicircle from 0,0 to 100,0 (bulge 1) is cut at
  50,−50; p172: grows to 50,−50; p173: the circle becomes an arc (0.304693 to 2.8369).
- **mellowcad:** scratch b: cut and grown at 50,0, the circle deleted (Quick sees no crossing).
- **Scenario:** a rounded slot drawn with PLINE Arc → a line trimmed against it stops in mid-air.
- **Fix:** TRIM-D10. **Regression test:** `editing.test.ts`, p171–p173.
- **Coverage, rules:** "each an edge for the others" holds again; `cad-tools.md`'s root finder
  names a polyline edge read through its segment geometries.

#### TRG-02 — A block reference and a text are no edge, so Quick deletes what only they cross

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** the three crossing functions and `implicitEdges` skip insert, text, MTEXT and attdef.
- **AutoCAD:** p237: a line crossing a reference's line is cut at x=50; p238: a line through a
  TEXT's box is cut at 80.649386, the box's side; p203: a hatch is no edge (the line is deleted).
- **mellowcad:** scratch b: the line deleted in both.
- **Fix:** TRIM-D11, TRIM-D12. **Regression test:** `editing.test.ts`, p237, p238.
- **Coverage:** Implemented gains both; MTEXT and attdef as edges stay unverified.

### Medium

#### TRS-03 — Undo with nothing to take back is taken in silence; 2027 refuses it

- **Severity:** medium · **Row:** B, F · **Status:** verified
- **Where:** `EdgeEditTool.ts` `commandOptions` (Undo hidden before the first edit, citing th3),
  `undoEdit`.
- **AutoCAD:** p114, p135, p155: `*Invalid selection*` and `Expects a point or
  Fence/cuTting edges/Crossing/mOde/Project` (es `*Designación no válida*`,
  `Requiere un punto o Borde/aristas de COrte/Captura/MOdo/Proyección`).
- **mellowcad:** scratch a "TRS-b": nothing said. `invalidAnswers.test.ts:433` pins the 2023
  silence.
- **Fix:** TRIM-D1's model: Undo neither offered nor taken until the run has a step.

#### TRS-07 — Undo after a transparent setting keeps the trim

- **Severity:** medium · **Row:** E, F · **Status:** verified
- **Where:** `EdgeEditTool.ts` `undoEdit` (`ctx.undo()` once per step).
- **AutoCAD:** p164: a trim, `'_LTSCALE 2`, `_U` → `Command has been completely undone.`, the trim
  and LTSCALE both back; 'ZOOM the same (p163, matched).
- **mellowcad:** scratch a "TRS-g": the message, LTSCALE back, the trim kept.
- **Fix:** mark `ctx.historyDepth()` at each step, take back with `ctx.undoTo(mark)`
  (`cad-tools.md`, "Ordering and undo").

#### TRP-01 — Typed object snap overrides are refused at the object prompt

- **Severity:** medium · **Row:** D · **Status:** verified
- **Where:** `EdgeEditTool.ts` `wantsSnap()` false there, so `CadRuntime.pointModifier` refuses
  the override.
- **AutoCAD:** p259 `_END` → `of 99,1` → picks 100,0, trims, LASTPOINT 100,0; p260–p263 `_MID`,
  `_INT`, `_NEA`, `_PER` (from LASTPOINT) alike; the prompt is a point prompt (trace).
- **mellowcad:** scratch c "p259": `*Invalid selection*`.
- **Fix:** TRIM-D20. **Regression test:** `editing.test.ts`, p259, p263.

#### TRP-02 — Of two objects in the pickbox the nearer is taken; AutoCAD takes the newer

- **Severity:** medium · **Row:** C · **Status:** verified at TRIM's object prompt
- **Where:** `Document.pickAll`'s order, which `ctx.pick` gives TRIM.
- **AutoCAD:** p256, p257: lines at y=0 (older) and y=2 (newer), a pick at 80,0.3 trims the newer.
- **mellowcad:** scratch c "p257": the older.
- **Fix:** TRIM-D22. Reopens ERASE's pick only with this evidence and its own probe.

#### TRP-03 — A locked object picked starts a fence in silence

- **Severity:** medium · **Row:** B, C · **Status:** verified
- **AutoCAD:** p251: `1 was on a locked layer.` (es `1 estaba en una capa bloqueada.`), then the
  fence's next point, LASTPOINT the pick; a locked line is still an edge (p255).
- **mellowcad:** scratch c "p251": the fence starts, nothing said.
- **Fix:** look again with locked layers; on a hit report `onLockedLayer` (count 1), then the
  fence.

#### TRP-04 — An implied fence that crosses nothing is a step of its own

- **Severity:** medium · **Row:** F · **Status:** verified
- **Where:** `EdgeEditTool.ts` `editAcross` (`pushStep(ids.length > 0)`).
- **AutoCAD:** p381: a trim, an implied fence crossing nothing, `_U` → the trim back,
  `Command has been completely undone.`; p380.
- **mellowcad:** scratch c "p381": U takes back the empty fence, the trim stays.
- **Fix:** TRIM-D1's model (TRIM-D23): only an edit is a step.

#### TRG-03 — A level object whose normal is −Z is neither trimmed nor an edge

- **Severity:** medium · **Row:** H · **Status:** verified (reached by a file; CIRCLE in a UCS X 180
  stores +Z here, −Z there: CIRCLE's object)
- **AutoCAD:** p175, second part: the circle (normal 0,0,−1) becomes an arc and cuts the line at
  −86.60254,50.
- **mellowcad:** scratch b "upside down": left, and no edge.
- **Fix:** TRIM-D13.

#### TRG-04 — Text, MTEXT, attdef, block references and hatches are refused in silence

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** TRIM `Cannot TRIM this object.` — es `Objeto no procesado por RECORTA.` (21680)
  for TEXT, attdef, INSERT, and `Este objeto no se puede RECORTAR.` (53) for MTEXT and HATCH; EXTEND
  `Cannot EXTEND this object.` — es `Objeto no procesado por ALARGA.` (20623), MTEXT
  `Este objeto no se puede ALARGAR.` (54); each counted for Undo (p190–p202; desktop d09-2).
- **mellowcad:** scratch b: nothing said.
- **Fix:** TRIM-D15.

#### TRG-05 — A dimension picked: Quick deletes it, Standard says it does not intersect

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p194 (Quick): erased, though an edge crosses its dimension line; p239 (Standard):
  `Does not intersect with the cutting edge.`
- **mellowcad:** scratch b: left, nothing said.
- **Fix:** TRIM-D16.

#### TRG-06 — An object or edge perpendicular to the UCS: AutoCAD says so and keeps what it crosses

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p220: `Object is perpendicular to UCS XY plane.` (es
  `El objeto es perpendicular al plano XY del SCP.`, 21678); p221: a line only it crosses says
  `Edge is perpendicular to UCS XY plane.` (es `La arista es perpendicular al plano XY del SCP.`,
  21676) and stays; both counted for Undo.
- **mellowcad:** p220 silent; p221 deletes the line (Quick).
- **Fix:** TRIM-D14. **Coverage:** "neither an edge nor trimmed" is wrong for the perpendicular case;
  Missing adds that Quick deletes what only an object at 45° crosses.

#### TRG-07 — EXTEND does not take an open polyline's own segments as boundaries

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p236: (0,50)(100,50)(100,0)(50,0)(50,20), picked at 50,18, grows to 50,50.
- **mellowcad:** `Object does not intersect an edge.`
- **Fix:** TRIM-D17.

#### TRJ-01 — TRIM's ghost is a red dashed piece over a repainted object; AutoCAD dims the piece in place

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **Where:** `EdgeEditTool.ts` `buildOverlay` (`entityHover` width 2 for what stays, `gripHot`
  dashed for what goes, `gripHot` dashed for Quick's delete).
- **AutoCAD:** d01-1, d01-2: the piece a click removes is drawn dimmed where it is (grey, thin,
  solid), the rest untouched; a line no edge crosses dimmed whole.
- **mellowcad:** scratch r `look.test.ts` "d01-1".
- **Fix:** TRIM-D31.

#### TRJ-02 — The extension's ghost is only the added piece, dashed

- **Severity:** medium · **Row:** M · **Status:** verified
- **AutoCAD:** d01-3 (Shift in TRIM), d02-1 (EXTEND): the object as it would be, whole, in the
  selection's glow, solid; Shift in EXTEND shows TRIM's dimmed ghost (d02-2).
- **mellowcad:** scratch r "d01-3": the added piece in `THEME.selected`, dashed.
- **Fix:** TRIM-D31.

#### TRJ-03 — A fence or a window running previews nothing

- **Severity:** medium · **Row:** M · **Status:** verified
- **AutoCAD:** d03-1, d04-1, d06-2: what the fence or window will trim is dimmed as it runs.
- **mellowcad:** scratch r "d03-1": the fence's path alone.
- **Fix:** TRIM-D32.

#### TMI-01 — MIRRTEXT 0 reads a text at a right angle to the axes otherwise than AutoCAD

- **Severity:** medium · **Row:** H (Transforms' area, MIRROR) · **Status:** verified
- **Where:** `cad/domain/entityTransforms.ts` `readableMirror`: a vertical text is judged by the
  sign of a `sin` that is zero when the reflection lies on the X axis.
- **AutoCAD:** p01 (45°): 270→180→270, 90→0→90, 0→90→0, 180→270→180; p02 (135°) the same
  readings. Every case fits one rule: a text turns back when its direction leaves the half-plane
  of directions in (−90°, 90°] — 90° counts as rightward, 270° as leftward — which makes two
  mirrors the identity for every angle.
- **mellowcad:** scratch r `mirror.test.ts`: six of eight fail (180° across 45° reads 90°); the
  property "mirroring twice … is the identity" fails when fast-check draws one (seed −1888588680).
- **Fix:** TRIM-D30. **Regression test:** `entities.test.ts`, p01 and p02 (the eight cells, both
  mirrors). **Coverage:** MIRROR's MIRRTEXT line cites p01, p02.

### Low

#### TRS-04 — Answers at mOde, Edge or Project, Enter included, list Undo

- **Severity:** low · **Row:** B, F · **Status:** verified
- **AutoCAD:** p107, p136, p157–p162: Undo listed after any answer there; U then says completely
  undone, keeping the mode (TRIMEXTENDMODE is not taken back) and putting EDGEMODE back.
- **mellowcad:** scratch a "TRS-d": not listed. `editing.test.ts:1435`, `:1662` pin it.
- **Fix:** TRIM-D1's model.

#### TRS-05 — EXTEND's Expects line before the first edit leaves out mOde

- **Severity:** low · **Row:** B · **Status:** verified (TRP-06 is the same finding)
- **Where:** `EdgeEditTool.ts` `takes()` drops the last word built, not the last declared.
- **AutoCAD:** p103, p113, p268: `Expects a point or Fence/Boundary edges/Crossing/mOde` — the
  declared list minus its last word (Project), then the words not built filtered out.
- **mellowcad:** `…Fence/Boundary edges/Crossing`; `editing.test.ts:874`, `:1366` pin it.

#### TRS-06 — Edge's second keyword is declared `Noextend`

- **Severity:** low · **Row:** K · **Status:** verified
- **AutoCAD:** traces of p125, p161: `{"g":"No","l":"Noextend"}`, listed `No extend` (es `No
  alargar`).
- **mellowcad:** `Noextend` typed is `Invalid option keyword.` (scratch a "TRS-f").
- **Fix:** TRIM-D3.

#### TRS-08 — Coverage citations

- **Severity:** low · **Row:** N · The title's † on RR and AL (both in the Spanish `acad.pgp`, p101);
  "English wording from AutoCAD 2023's own console" — every claim re-probed holds on 2027 but those
  above; the `acc/…` citations of tests and code to replace (lists in the scratch reports: a, b, c).

#### TRP-05 — Undo is listed after any pick, miss or refusal, and its message said

- **Severity:** low · **Row:** B, L · **Status:** verified
- **AutoCAD:** after a miss (p241, p297–p300, p380), a refusal (p273, p383), a window crossing
  nothing (p303, p382), a first corner (p301): Undo listed, also on the echoed
  `…/Undo]: Specify opposite corner:`; `_U` then says `Command has been completely undone.`;
  Standard's refusal is still no step (p388).
- **mellowcad:** scratch c "p303", "p383": not listed; `editing.test.ts:1487` pins it.
- **Fix:** TRIM-D1's model.

#### TRP-07 — `acc/…` citations of the picks, fences and windows

- **Severity:** low · `typedPick.ts`' JSDoc and the citations of `editing.test.ts:730–1290`; the
  2027 probes: typed points p242, p243, p247; fences p241, p289–p299; Crossing p301–p307; edges
  p272–p288.

#### EDG-01 — mOde at `Select objects:` once the edges' set holds something is `*Invalid*`

- **Severity:** low · **Row:** B · **Status:** verified
- **AutoCAD:** p283 `_O`, p389 `O` → `*Invalid*` (es `MO` → `*No válido*`).
- **mellowcad:** `*Invalid selection*` and the selection's words.
- **Coverage:** out of Missing (AutoCAD refuses it too).

#### TRG-08 — EXTEND's Spanish refusal of a closed polyline, a whole ellipse, a closed spline

- **Severity:** low · **Row:** H · **Status:** verified
- **AutoCAD:** p207, p209, p211: `Este objeto no se puede ALARGAR.` (54); the circle (p208)
  `Objeto no procesado por ALARGA.` (20623). English the same for all.
- **mellowcad:** 20623's words for all; `editing.test.ts:439`, `:2104` pin 2023's.
- **Fix:** TRIM-D15.

#### TRG-09 — The geometry's `acc/…` citations

- **Severity:** low · hd → p170, p174, p178, p229–p231; o1 → p176; tp, tq → p177; tr → p180, p183;
  x → p204–p208; e → p212; m → p213; w17, w18 → p233, p234; eg → p224–p226; sm3 → p185; t2, p12 →
  p187, p188. Not re-probed: o3, o4, sn5, sn11. The two unverified marks they carried hold.

#### TRJ-04 — No cursor badge

- **Severity:** low · **Row:** Q · **Status:** verified
- **AutoCAD:** d01-1, d03-1: a small red ✕ up and right of the pick box or crosshair while a click
  would trim or extend; d09-1, d09-2: a circle-and-slash over what cannot be (a circle crossed once,
  a text); no badge under Shift's extension (d01-3).
- **mellowcad:** none (`SceneBuilder.ts` draws the cycling and minus badges only).
- **Fix:** TRIM-D33.

## 6. Decisions taken

- **TRIM-D1** — One model of what counts, from the probes: the steps are the edits (and the Edge
  choice joined to the next one, p135–p138); Undo is listed once the run has had any answer at the
  object prompt — a pick, a miss, a refusal, a window, a mode, Edge or Project answer, Quick's first
  Enter — and refused with the prompt's words before; Undo with no edit left says
  `Command has been completely undone.` and stays listed; Quick's first Enter with no edit and no
  edges chosen is taken once as such an answer, the next ends. Why: it fits p100–p164 and
  p241–p389 together, where the 2023 model (every pick a step) does not.
- **TRIM-D2** — A preselection goes through the edges' selector's `preselect` (counted, `1 found`
  after `Select cutting edges ...`), becomes the edge set as cuTting edges' choice would, is
  cleared, and skips Standard's edges' prompt. Why: the shared mechanism (`cad-tools.md`).
- **TRIM-D3** — `Noextend` the declared word (es `No`), `keywordLabels` `No extend` / `No alargar`
  for TRIM and EXTEND; the old key stays unused (`cad/README.md`, "Versioning").
- **TRIM-D10** — A polyline edge reaches the closed forms as its segment geometries (lines and arcs),
  as `ownEdges` already gives them, in the three crossing functions and `prolonged`.
- **TRIM-D11** — A TEXT's, MTEXT's and attdef's edges are the four sides of the box this engine
  measures (`measureTextWidth`); the width differs from AutoCAD's glyph extents, the behaviour does
  not.
- **TRIM-D12** — A block reference's edges are its block's objects placed by `insertGeometry`,
  nested ones included up to `MAX_BLOCK_NESTING`.
- **TRIM-D13** — An object whose normal is ±Z is level for TRIM and EXTEND, cut in its OCS.
- **TRIM-D14** — Both perpendicular messages, counted for Undo; a perpendicular edge keeps Quick
  from deleting what it alone crosses.
- **TRIM-D15** — Message ids per table: TRIM's `Cannot TRIM this object.` (21680 and 53 in
  Spanish by type), EXTEND's 20623 and 54; the type decides which, as the console does.
- **TRIM-D16** — A dimension is in TRIM's set with no crossings of its own: Quick deletes it,
  Standard says it does not intersect; EXTEND keeps its path refusal.
- **TRIM-D17** — EXTEND grows an open polyline to its own other segments, never to the segment it
  grows nor its neighbour at the shared vertex.
- **TRIM-D20** — A typed or menu-chosen override answers the object prompt through a hook of its own
  (the snapped point becomes the pick), `wantsSnap()` staying false so running snaps never move a
  click and selection cycling keeps working (`cad-runtime.md`).
- **TRIM-D21** — Spanish refusing the global `_O` at the edges' prompts (p283, p284 es) is not
  copied: global forms answer every prompt here.
- **TRIM-D22** — Probe ERASE's `Select objects:` with the same pair first; if it too takes the
  newer, order `pickAll`'s hits inside the pickbox newest first for every pick; if not, TRIM's
  object pick alone takes the newest. Why: one rule where AutoCAD has one.
- **TRIM-D23** — An implied fence or a window that changes nothing is no step (TRIM-D1).
- **TRIM-D30** — `readableMirror` judges every text by one half-plane: a direction is rightward when
  its angle, normalised, lies in (−90°, 90°], 90° rightward and 270° leftward; a text turns back
  when the reflection changes the side. Why: it fits all eight cells of p01, p02 and p290–p294, and
  is antipodal, so two mirrors give back the text.
- **TRIM-D31** — TRIM's ghost hides nothing and draws the piece that goes with ERASE's faded look
  (`fadedColor`) over it; the extension's draws the object as it would be, whole, in
  `THEME.selected`'s glow, solid (as the selection effect draws it); Quick's delete fades the whole
  object.
- **TRIM-D32** — A fence or window running plans its edits as `editAcross` would, against a copy of
  the drawing, and draws each piece that goes faded; the preview equals the commit (one resolver,
  `cad-tools.md`).
- **TRIM-D33** — The ✕ badge beside the cursor while the hovered object has a plan, the
  circle-and-slash where it is refused, drawn as the cycling and minus badges are (`SceneBuilder`).

## 7. Tests proposed

- Every finding's regression test, in the lowest layer that shows it: `editing.test.ts` (TRS, TRP,
  EDG, TRG, the TRJ overlays), `invalidAnswers.test.ts:433` rewritten (TRS-03),
  `cad/domain/entities.test.ts` (TMI-01: the eight cells, both mirrors).
- The untested cells, by file: `editing.test.ts` — the point forms p243–p247, LASTPOINT after each
  answer p248–p250, an Off object p252–p254, a locked edge p255, nothing left selected p140, a
  polyline split on each segment kind p177–p179, a closed polyline cut once p184, which end grows
  and tangents p214–p219, a UCS turned p222, a line at another Z p223, Undo and U p227, p228, a
  hatch as no edge p203, Ortho at a fence (scratch r `ortho.test.ts`); a save and open
  (`DrawingFile` round trip of the trimmed objects).
- The old citations replaced by their 2027 probes: TRS-08, TRP-07, TRG-09.

## 8. What is not tested and why

- The exact width of a text's box against AutoCAD's glyph extents (the engine's own metrics,
  TRIM-D11).
- The badges' and the ghost's pixels: the overlay's primitives are tested, the canvas is the
  presenter's.

## 9. What could not be reviewed and why

- Running snaps and the Shift+right-click menu on a click at the object prompt (TRP-01's desktop
  half), a fence or window with Shift held, Ortho on a number at a fence point: a desktop pass of
  their own.
- A CV spline extended, MTEXT and attdef as edges, a dimension as an edge, the Undo of o3, o4: not
  probed.
- The English profile's menus and labels (the desktop pass ran in Spanish).

## 10. Refuted in the adversarial pass

- `'TRIMEXTENDMODE` and its kin refused, Project unlisted and refused: known (Missing).
- REDO saying `Nothing to redo` (p130): a Lisp line typed between U and REDO; p149 works.
- Spanish lacking `desHacer` after a mode change, and every Spanish run in Standard: the owner's
  profile held TRIMEXTENDMODE 0 after d06 for a while (isolated runs read it); rerun clean.
- p228–p231 running as EXTEND in a first batch: Shift held on the desktop (d01–d02) reached the
  console; rerun clean.
- The harness losing a line in p258; p247's 0.01: a misreading and the harness's whole-pixel cursor.
- A dragged fence trimming on release: known (`pick/drag cursor`).
- A circle crossed once, tangents, an edge through an end, a hatch as an edge, handles of every
  split: AutoCAD and the harness agree.
- TRP-06: the same finding as TRS-05.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

Rows that do not hold:

| Claim | State |
| --- | --- |
| Enter at the object prompt ends the command | false in Quick's first Enter (TRS-01) |
| Undo "typed with nothing to take back, it is taken saying nothing" | no longer true in 2027 (TRS-03) |
| a mode or Edge choice is no Undo listing | false (TRS-04) |
| "a fence's counted even when it crosses nothing" | false for the implied fence (TRP-04) |
| "each an edge for the others" (polyline arc segments) | false (TRG-01) |
| "an object at an angle … neither an edge nor trimmed" | false for the perpendicular case (TRG-06) |
| es `Objeto no procesado por ALARGA.` for a closed polyline, an ellipse | no longer true in 2027 (TRG-08) |
| Missing: mOde at `Select objects:` with a set | not a gap (EDG-01) |
| the † on RR and AL | stale (TRS-08) |
| unverified: Shift-trim inside EXTEND deletes; `Todos los efectos…`; `COrte`; a closed polyline cut once; an end arc segment under Edge=Extend | settled, hold (d02, p115, p100, p184, p224) |

| Rule | State |
| --- | --- |
| `cad-catalogs.md`: a preselection is counted by `preselect` | broken (TRS-02) |
| `cad-tools.md`: a tool's Undo refuses when there are none | broken (TRS-03) |
| `cad-tools.md`: a transparent command run since a step goes back with it | broken (TRS-07) |
| `cad-tools.md`: the one root finder (a polyline edge through its segments) | broken (TRG-01) |
| `cad-tools.md`: a tool with flat geometry acts only on `readsInPlan` objects | stale for ±Z (TRG-03) |
| `.claude/skills/autocad-research/console.md`: registry variables start at their defaults in an isolated run | stale: they start at the profile's (p109) |

Checked and holding: the settings line, mOde, Edge, eRase, Undo depth, the Edge step joined to an
edit, the variables' storage (`cad-tools.md`, "System variables"), `carryPiece`'s Z and properties
(p170, p235), the widths carried (p233, p234), the fence's objects planned against the drawing as it
then is (p294), Crossing's clockwise outline (p304), the shortcut menus (d05).

## 12. Order of execution and estimate

1. **TMI** — `readableMirror` and its tests; independent. Small.
2. **TRS** — TRIM-D1's model (TRS-01, TRS-03, TRS-04, TRS-07, TRP-04, TRP-05), preselection
   (TRS-02), the Expects line (TRS-05), `Noextend` (TRS-06), the catalogs, TRS-08's docs. Large; TRP
   relies on its model.
3. **TRP with EDG** — the overrides (TRP-01), the pick's order (TRP-02, after its probe of `Select
   objects:`), the locked layer (TRP-03), EDG-01, TRP-07. Medium.
4. **TRG** — edges (TRG-01, TRG-02, TRG-03, TRG-07), refusals (TRG-04, TRG-05, TRG-06, TRG-08),
   TRG-09. Large.
5. **TRJ** — the ghosts, the fence's preview, the badges, after TRG (the preview draws the plans
   TRG changes). Medium.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/modify.md` (TRIM / EXTEND): Implemented gains preselection, the first Enter, the
  Undo listing, typed overrides, the locked layer's words, blocks and text as edges, the refusals
  per type, the perpendicular messages, EXTEND to its own polyline, the ghosts; the 2023 citations
  become 2027's; the unverified marks above go; Missing loses mOde at `Select objects:` and gains the
  dragged fence's preview, Quick deleting what only an object at 45° crosses, MTEXT and attdef as
  edges (unverified). MIRROR's entry cites p01, p02.
- Catalogs: `Noextend`, its labels; `cannotTrimObject`, the table-53 and table-54 messages, the two
  perpendicular messages (en, es, ar's English).
- Rules: `cad-tools.md` (the root finder's polyline edges; `readsInPlan` and ±Z; the overrides at a
  single object's pick), `.claude/skills/autocad-research/console.md` (isolation reads the profile's registry values).
- Roadmap: row 12 `done`, owning edges and fences; FILLET's and BREAK's picks checked for TRP-01,
  TRP-02 and TRP-03's analogues.

## 14. Template improvements

- A registry variable a desktop probe changes reaches the console's isolated runs of that language
  (they start from the owner's profile): put it back at once and read it with `runacc.sh -r`
  before trusting a Spanish probe (annex-probes.md §4).
- A key held on the desktop (Shift through `shift.ps1`) reaches console runs going on at that
  moment: hold no key while subagents probe (annex-probes.md §4).
- A console answer to Enter at a jig prompt is checked on the desktop through COM alone, without
  the mouse: `com send "_TRIM\n\n\n"` and `com hist` tell one command asked twice from two
  commands (annex-probes.md §4).
- The first subagent's reports gave one Undo model only when read together (TRS-03, TRS-04, TRP-04,
  TRP-05): give the Undo keyword's listing and steps to one subagent across every prompt (§4.8).
