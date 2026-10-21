# MOVE, COPY review

> **Status:** plan, 2026-10-21 — phases 0–4 of skill `command-review`, the ninth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (STP, PLC, MOV, CPY, DRG).

## 1. Summary

3 high, 10 medium and 10 low findings over five blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| STP | the undo step of a command that changes nothing (the undo area, LINE's review) | 1 | 0 | 0 |
| PLC | placement, owned: the base point, `Specify displacement`, a placement by nothing, the drag's look | 1 | 5 | 4 |
| MOV | MOVE itself | 0 | 1 | 2 |
| CPY | COPY itself | 1 | 2 | 2 |
| DRG | dragging a selection with no command | 0 | 2 | 2 |

The worst: U after a command that changed nothing — ID, an ERASE with nothing selected, a MOVE by
nothing — takes back the command before it, where AutoCAD takes back the empty command and names it
(STP-01: p07, p120, p231, p233); COPY, Enter, Enter, the in-place copy, does nothing, where AutoCAD
leaves a duplicate on top, and a copy at the base point is skipped too (PLC-05: p147, p193, p228–p232);
and Enter at COPY's first second point copies by the first point and goes on asking, where AutoCAD
ends COPY (CPY-01: p151, p159, p234, desktop d06).

The analogues ERASE left, checked first: MOVE's and COPY's `Select objects:` and preselection go
through `ObjectSelector.preselect` and drop the set at their end — after COPY's multiple copies, a
Displacement, Escape halfway with and without a preselection and Escape at a noun-verb MOVE's base
point, `(ssget "_I")` is nil and mellowcad leaves nothing selected (match: p01–p03, desktop dsk.sh
after d02; scratch `contract.test.ts`); a cancelled noun-verb command drops its preselection (ERASE's
D22, now settled); the Previous set after COPY is the originals, after MOVE the moved objects (match:
p04, p05).

## 2. Inventory

Commit `4bc0092`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The commands:** `cad/application/tools/MoveTool.ts`, `CopyTool.ts`, over `PlacementTool.ts`
  (the area owned); `defaultTools` (`move`, `copy`), `TOOL_COMMANDS` (MOVE, COPY); not transparent
  (p107, p108). Catalogs: `commands.names` MOVE (`M`; es DESPLAZA, `D`), COPY (`CO`, `CP`; es
  COPIA, `CP`, `DUP`), keywords `Displacement`, `Exit`, `Undo`, prompts `specifyBasePointOr`,
  `specifyDisplacement`, `specifySecondPointOr`, `copySecondPointOr`, `useFirstPointAsDisplacement`,
  the message `copyModeMultiple`, in `en.json`, `es.json`; `ar` has no command language. The rail's
  Move and Copy (`components/cad/tool-rail.tsx`), the landing's filing (`content/commands.ts`).
- **The area owned:** placement — `PlacementTool.ts` (base point, Displacement, second point, the
  drag's preview), used also by `StretchTool.ts` (whose own behaviour is the Transforms review's);
  `translateEntity` / `copyEntity` (`cad/domain/entityTransforms.ts`); with no command, a drag of
  the selection (`SelectTool.ts`' `beginSelectionDrag`, `selectToolOverlay.ts`' `buildMoveEdit`).
- **Tests:** `transforms.test.ts` (MOVE, COPY), `lastPoint.test.ts`, `dynamicInputEnter.test.ts`,
  `elevation.test.ts`, `zTracking.test.ts`, `tiltedUcs.test.ts`, `blocks.test.ts`,
  `currentProperties.test.ts`, `newDrawingResets.test.ts`, `invalidAnswers.test.ts`,
  `selection.test.ts`, `selectionModes.test.ts`, `selectionCycling.test.ts`, `shortcutMenu.test.ts`,
  `transparentCommands.test.ts`, `undoEcho.test.ts`, `CadRuntime.test.ts`, `locale.test.ts`,
  `englishSurface.test.ts`, `cad/domain/entities.test.ts`.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after MOVE and COPY; ID and ERASE
  as commands that change nothing (STP-01); STRETCH through `PlacementTool`.
- **Areas cited:** LINE's (the command line, point input, object snaps, Ortho, Polar, dynamic input,
  transparency, undo, the shortcut menus), ERASE's (`Select objects:`, preselection, what a command
  leaves selected). Differences found in them are STP-01 (undo) and PLC-07 (dynamic input's echo).
- **Knowledge:** `docs/coverage/modify.md` (MOVE, COPY, STRETCH), `command-line.md`,
  `drafting-aids.md` (Selecting with no command), `workspace.md` (the right button); rules
  `cad-tools.md`, `cad-engine.md`, `cad-catalogs.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/move/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh move <ids>` in es-ES and en-US; the
desktop's are `dsk.sh` with `lib-dsk.sh` and `drag.ps1` (ERASE's, with Ctrl and the right button).
Transcripts and screenshots are in `research/probes/move/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p07 | ACADVER; `(ssget "_I")` after COPY multiple, noun-verb COPY, Displacement; Previous after COPY and MOVE; COPY's Undo down to none, then Enter; U after ID and an empty ERASE |
| p100–p149 | names and aliases, `_`, `_.`, `'MOVE`; the base point: `FOO`, `0`, numbers, keywords of other prompts, `_O`, every point form, UCS, snaps, Ortho, transparency, another command; `Specify displacement`: Enter, each command's default, `FOO`, `0`, numbers, `@`, `<a`, `_END`, UCS, LASTPOINT, a zero Displacement and U |
| p150–p199 | the second points: Enter, `0`, `FOO`, `_D`, `_U`, `_E`, `_A`, every point form, `@` after `'ID`, LASTPOINT during and after COPY, snaps (on the object moved too), Ortho, transparency, another command, COPY's Undo to none, U/REDO/MREDO/UNDO 2, a zero placement, Spanish `H` and `S` |
| p200–p234 | what they produce: handles, the copies' order, properties kept against CLAYER and the rest, Z, rotated and tilted UCS, blocks with attributes, text, hatch, dimension, elliptical arc, spline, U's echoes, settings changed mid-command, STRETCH's wording, a zero COPY, U after a zero or empty MOVE, Enter at COPY's first second point |
| d01–d11 | the drag of MOVE and COPY (the set, the originals, the rubber band, the tooltip), Escape halfway, Ortho and Polar with a typed distance, the right button at each second point and its menus, COPY's desHacer from the menu, a selection dragged with the left button, with Ctrl, with the right button |

## 4. Matrix

States and citations as matrix.md. Columns: **B** the base point (`Specify base point or
[Displacement] <Displacement>:`, COPY's after `Current settings:`), **D** `Specify displacement
<x, y, z>:`, **M2** MOVE's second point, **C1** COPY's first second point (`[Array] <use first point
as displacement>`), **C2** COPY's later ones (`[Array/Exit/Undo] <Exit>`).

### MOV and CPY (the commands)

| Row | Cells |
| --- | --- |
| A names | MOVE, M, repeat; DESPLAZA, D: match · p100, p101 · scratch a "p100", "p101"; `englishSurface.test.ts:816`, `locale.test.ts:273` — the coverage's † stale (MOV-01). COPY, CO, CP; COPIA, CP, DUP: match · p102, p103 · scratch a "p102", "p103" (CPY-05). `_MOVE`: match · p104. `_.MOVE`, `_M` in en: known (command-line.md Missing) · p104–p106. `'MOVE`, `'COPY`: refused, match · p107, p108 |
| B prompts | text en/es at every column: match · p100–p103, p135, p150, p151, p156 · `transforms.test.ts:52, 90, 191`; COPY's `mOde`, `Array`: known · p113, p114, p160; keywords declared = listed (Displacement; Exit, Undo; es Desplazamiento, Salir, desHacer): match · traces p103, p158; C1's refusal words: differs CPY-04 · p156–p158 |
| B Enter | B → D: match · p119 · `transforms.test.ts:93`; M2 by the first point: match · p150; C1: differs CPY-01 · p151, p159, p234, d06; C2 ends: match · p172 |
| F inside | COPY's Undo at each depth: match · p158, p198; to none: differs CPY-02 · p158, p159, p199, d07; `_U` at C1 backs out nothing: match · p156 |
| F after | U, REDO, MREDO, UNDO 2 echo `MOVE` / `COPY` (es `DESPLAZA`, `COPIA`): untested · p194, p196, p197, p215–p219 · scratch c "harness" |
| H | MOVE keeps the handle: match · p200 · `transforms.test.ts:119`; COPY's copies in drawing order: differs CPY-03 · p201, p212, p223; properties kept against CLAYER, CECOLOR, CELTYPE, CELWEIGHT, THICKNESS, ELEVATION: colour match, the rest untested · p204 · `currentProperties.test.ts:183`; per-object LTSCALE: known (properties.md) · p204; Z, rotated and tilted UCS, a tilted circle: untested · p205–p210, p220; blocks with attributes, text, MTEXT, hatch, dimension, elliptical arc, spline: untested · p211–p214, p221 · scratch c "types"; associativity: n/a (not modelled, MOVE-D11); settings changed mid-command: untested · p224, p225 |
| J | a moved and a copied object round-trip: untested · scratch c "J" |
| K | the catalog sweep `--from` PlacementTool, MoveTool, CopyTool: `specifyBasePointOr`, `specifySecondPointOr`, `copySecondPointOr` es-several, each settled · p200, p201, p227; `useFirstPointAsDisplacement` no-source, settled · p200; the rest ok: match |
| L | the history line by line: match · p120, p157, p180, p186, p199 · scratch a, b; but CPY-02's missing line and PLC-07's echo |
| G | another command typed at B, D, M2, C2: refused in each prompt's words, match · p144, p145, p191, p192; Escape and the right button: see PLC and d05–d07 |
| Q | the cursor's badge (four arrows, MOVE's; COPY's own): known (CURSORBADGE, ERASE's review) · d01, d11 |

### PLC (placement, owned)

| Row | B | D | M2 | C1 / C2 |
| --- | --- | --- | --- | --- |
| C `x,y`, `x,y,z` | match · p130 | match, a vector · p135 | match, absolute · p161, p162 | match · p172, p173 |
| C `@dx,dy`, `@` | match, from LASTPOINT · p130 | differs PLC-02 · p135, p137 | match, from the base · p163–p165 | match, from the base · p172 |
| C `d<a`, `@d<a` | match · p130 | the vector match, LASTPOINT differs PLC-02 · p135 | match · p166, p167 | — |
| C `#`, `*` in UCS Z 30 | match · p130, p131 | match · p135, p136 | match · p168, p169 | — |
| C a bare number | match, from LASTPOINT · p117, p118, p132 | differs PLC-01 · p125, p126, p138 | match · p170; LASTPOINT differs MOV-02 | match · p174 |
| C `<a` | refused, match · p133 | differs PLC-04 · p139 | unverified (the console ignores it) · p171 | — |
| C LASTPOINT | — | differs PLC-02 · p119, p135, p149 | match but MOV-02 · p150, p161 | the base, during and after: match · p172, p173 · `lastPoint.test.ts:131` (cites 2023: PLC-09) |
| C the tooltip | — | — | — | `5,-12` echoed `@5,-12`: differs PLC-07 · desktop after d02 |
| D snaps | `_END`, `_MID`, `_FRO`: match · p140; M2P known · p140 | differs PLC-03 · p128 | `_END`, `_MID` on the object moved, `_INT`, `_PER`, `_NEA`, `_FRO`, `_TAN`: match · p175–p182 | match · p185 |
| D Ortho, Polar | a typed base ignores Ortho: match · p141 | unverified (the trace's UseBasePoint from 0,0,0, p135) | a typed point unbent, a number along Ortho: match · p183, p184, d03; Polar's number: match · d04 | — |
| E | `'ZOOM`, `'-OSNAP`, `'LINE` refused: match · p142; `'ORTHOMODE` known | match · p143 | match · p186, p188, p189 | match · p190 |
| F a placement by nothing | — | differs PLC-05 (COPY), STP-01 (MOVE) · p120, p122, p147 | differs STP-01 · p195, p231 | differs PLC-05 · p193, p228–p232 |
| G the right button | — | — | Enter, no menu: match · d05 · scratch r "d05" | C1 a menu with Array: known (Array) · d06; C2 Enter, Cancel, Exit, Undo, snaps: match but Array · d07 · scratch r "d07" |
| G Escape halfway | — | — | nothing moved, nothing selected: match · desktop after d02 · `transforms.test.ts:180` | the copies stay, nothing selected: match · desktop after d02 · scratch r |
| M, Q the drag | — | — | differs PLC-06 · d01, d03, d04 | differs PLC-06 · d02, d11 |

### DRG (a selection dragged, no command)

| Row | Cell |
| --- | --- |
| P a left drag on a selected object | moves by the drag, nothing written: match · d08 · scratch r "d08"; the set dropped: differs DRG-01 · d08; U's name: differs DRG-02 · d08, tables 52629, 52656 |
| M, Q its look | differs DRG-03 · d08-1 |
| P with Ctrl | Ctrl held from the press drags nothing (sub-object pick): unverified for a copy · d09 |
| P with the right button | Move Here, Copy Here, Paste as Block, Cancel: known (workspace.md Missing) · d10 |

### STP (undo, LINE's area)

| Row | Cell |
| --- | --- |
| F U after a command that changed nothing | differs STP-01 · p07, p120, p231, p233 · scratch r "undo", a "p120", c "zero" |

## 5. Findings

### High

#### STP-01 — U after a command that changed nothing takes back the command before it

- **Severity:** high · **Row:** F · **Status:** verified · **Area:** undo, LINE's review
- **Where:** `cad/application/commands/Command.ts:208` (`endGroup` returns on an empty group)
- **AutoCAD:** p07 (plain, both): `_LINE …`, `_ID 5,5`, `_U` → `ID`; `_ERASE` Enter, `_U` → `ERASE`
  (es `BORRA`), the line kept; p120, p231: a MOVE by nothing, `_U` → `MOVE` (es `DESPLAZA`); p233 a
  MOVE with nothing selected, `_U` → `MOVE`.
- **mellowcad:** scratch r "undo": after LINE and ID, `_U` writes `LINE` and erases it; the same
  after an empty ERASE; scratch a "p120", c "p231b", "p233".
- **Scenario:** LINE, then ID (or MOVE, Enter on an empty set) → U → the line is gone; AutoCAD only
  takes back the ID.
- **Fix:** a command's run that executed nothing still closes as a step named as the command was
  echoed (STP-D1), which U and REDO name; a view left where it was keeps making none (the view rule,
  `viewStep()`), and U, UNDO, REDO, MREDO make none of their own. · **Alternative:** a step only
  for MOVE and COPY — leaves ID and ERASE wrong.
- **Regression test:** `undoEcho.test.ts`: LINE, ID, `_U` writes `ID` and keeps the line; LINE,
  ERASE Enter, `_U` writes `ERASE` (p07); MOVE by `@`, `_U` writes `MOVE` (p195, p231).
- **Coverage, rules:** command-line.md (U); `cad-tools.md` "A whole run of a command is one undo
  step" says it holds for a run that changes nothing.

#### PLC-05 — A placement by nothing is skipped: COPY leaves no duplicate in place

- **Severity:** high · **Row:** F, H · **Status:** verified
- **Where:** `PlacementTool.ts:485-488` (`if (moves) this.place`), `:542` (`commitDisplacement`);
  the comment at `:73-77` declares the skip without a source
- **AutoCAD:** p147, p232: `_COPY _L` Enter Enter → 2 objects, `db.appended`; p193, p228: the second
  point at the base → a duplicate, the prompt `[Array/Exit/Undo] <Exit>`; p229 `_D 0,0,0`; p230 base
  `0,0` and Enter; p122: U names `COPY`. MOVE by nothing is a step (STP-01), the object untouched
  (p119 `db.modified`).
- **mellowcad:** scratch c "zero" p228–p232, a "p122/p147", b "p193": no object added.
- **Scenario:** a line selected → COPY, Enter, Enter (the in-place copy) → nothing; AutoCAD leaves
  the duplicate the user then moves or puts on another layer.
- **Fix:** COPY places at any displacement, the `placements` flags gone (every placement adds);
  MOVE executes nothing at a zero vector, its step from STP-01 (MOVE-D3). STRETCH as MOVE.
- **Regression test:** `transforms.test.ts`: those four inputs give 2 objects (p147, p193, p228–p230),
  COPY's Undo takes the zero copy back.
- **Coverage:** COPY's Implemented: "a zero displacement leaves a duplicate in place".

#### CPY-01 — Enter at COPY's first second point copies and should end COPY

- **Severity:** high · **Row:** B, G · **Status:** verified (desktop d06 too)
- **Where:** `PlacementTool.ts:459-466` (`commitSecondPoint` → `placeAt`, which loops)
- **AutoCAD:** p151, p234: `Specify second point or [Array] <use first point as displacement>:`,
  Enter, `Command:` — one copy by the base point's coordinates; p159 and p06 the same after COPY's
  Undo took every copy back; d06: the right button's Intro does the same.
- **mellowcad:** scratch b "p151", "p159", c "p234", r "p06": the copy placed, COPY still asking
  `[Exit/Undo] <Exit>`; `dynamicInputEnter.test.ts:155` asserts that.
- **Scenario:** COPY, base `10,0`, Enter → AutoCAD has made one copy and is at `Command:`; mellowcad
  still asks, and the next command typed is refused.
- **Fix:** Enter with nothing placed places by the base point and ends, as Displacement does. ·
  **Alternative:** none.
- **Regression test:** `transforms.test.ts` (p151, p159, p234); `dynamicInputEnter.test.ts:155`
  rewritten to it.

### Medium

#### PLC-01 — A number at `Specify displacement` is refused; AutoCAD takes it from the origin towards the cursor

- **Severity:** medium · **Row:** B, C · **Status:** verified
- **Where:** `PlacementTool.ts:518-536`; `wantsSnap()` false there (`:334`)
- **AutoCAD:** p138: `10` → `=>[-9.8943,-1.4502,0]`, 10 from 0,0 towards the console's cursor
  (-336.35,-49.30); p126 `-5` → (4.947,0.725); p125 `0` moves nothing. The trace: UseBasePoint from
  0,0,0 (p135).
- **mellowcad:** scratch a "p138", "p126", "p125": `Invalid point.`
- **Fix:** the Displacement prompt is a point prompt anchored at the UCS origin (MOVE-D2): snaps on,
  the anchor the origin, the point read as the vector from it.
- **Regression test:** `transforms.test.ts`, the cursor where the console's is (p138, p126).

#### PLC-02 — `Specify displacement` does not put LASTPOINT at the origin

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `PlacementTool.ts:507` (`askDisplacement`), `:532` (`@` and `#` stripped by hand)
- **AutoCAD:** p135: LASTPOINT 7,3 from ID, `@10,5` moves by 10,5 and leaves LASTPOINT 10,5; p137 `@`
  alone is a move by nothing; p149, p119: Enter at the default leaves LASTPOINT 0,0,0; p109: with
  the UCS's origin at 5,5, `@10,0` moves by 10,0.
- **mellowcad:** scratch a "p135 @dx,dy" (LASTPOINT 17,8), "p137 @" (`Invalid point.`), "p149".
- **Fix:** the prompt sets LASTPOINT to the UCS origin as it opens (MOVE-D1); the runtime reads `@`
  against it.
- **Regression test:** `lastPoint.test.ts` (p135, p137, p149).

#### PLC-03 — `Specify displacement` takes no object snap and no pick

- **Severity:** medium · **Row:** D, P · **Status:** verified (snap); the pick from the trace
- **Where:** `PlacementTool.ts:291-308, 334-341`
- **AutoCAD:** p128: `_END` of `99,1` → `=>[100,0,0]`, the line moved by 100,0, LASTPOINT 100,0.
- **mellowcad:** scratch a "p128" (`Invalid point.`), "a pick at Specify displacement" (ignored).
- **Fix:** with PLC-01 (MOVE-D2).
- **Regression test:** `transforms.test.ts`: `_D _END 99,1` moves by 100,0 (p128).

#### PLC-04 — `<a` at `Specify displacement` is refused; AutoCAD writes `Angle Override: 30`

- **Severity:** medium · **Row:** C · **Status:** verified (what the next number does: unverified)
- **AutoCAD:** p139 `<30` → `Angle Override: 30`, the prompt again (the console then ignores it,
  as at every prompt).
- **mellowcad:** scratch a "p139": `Invalid point.`
- **Fix:** with PLC-01 (an anchor at the origin, the runtime's `<a`).

#### PLC-06 — The drag draws a blue dashed ghost; AutoCAD drags the set as itself

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **Where:** `PlacementTool.ts:343-371` (`buildOverlay`)
- **AutoCAD:** d01 (MOVE): the set drawn solid in its own colour at the cursor, the originals faded
  where they were, a dashed amber rubber band from the base; d02, d11 (COPY): the originals keep
  the selection's glow, the copy drags solid; d03, d04 the same under Ortho and Polar.
- **mellowcad:** scratch r "overlay": the originals glow, the ghost `#38bdf8` dashed `[6, 4]`, the
  vector `#38bdf8` dashed `[2, 3]`.
- **Fix:** the ghost through `entityScenePrimitive` with each object's own style, the vector in
  `THEME.dashedRubberBand` dashed, MOVE's and STRETCH's originals in `fadedEntityIds` (MOVE-D6).
- **Regression test:** `transforms.test.ts`: the primitives while MOVE and COPY drag (d01, d11).

#### MOV-02 — LASTPOINT after a number at MOVE's second point stays at the base

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `PlacementTool.ts:479-501`; the runtime keeps no anchor once MOVE has ended in the answer
- **AutoCAD:** p170: base 3,4, `10` → the object at (-9.8789,-1.55156), LASTPOINT
  (-6.8789 2.44844 0), the destination.
- **mellowcad:** scratch b "p170": LASTPOINT 3,4; the tooltip's distance and angle the same.
- **Fix:** MOVE sets LASTPOINT to the destination as it places (`ctx.setLastPoint`); COPY keeps the
  base (p172, p173).
- **Regression test:** `lastPoint.test.ts` (p170).

#### CPY-02 — COPY's Undo of its last copy says nothing; AutoCAD says the command is undone

- **Severity:** medium · **Row:** F, L · **Status:** verified
- **Where:** `PlacementTool.ts:243-252` (`undoPlacement`)
- **AutoCAD:** p158, p159: `_U` / `Command has been completely undone.`; es (p199, d07)
  `Todos los efectos del comando han sido deshechos.`
- **mellowcad:** scratch b "p158", "p199 es": no line.
- **Fix:** report `commandCompletelyUndone` when the last copy goes.
- **Regression test:** `transforms.test.ts`, en and es (p158, p199).

#### CPY-03 — COPY adds its copies in selection order; AutoCAD in drawing order

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `PlacementTool.ts:416-419, 538-541`
- **AutoCAD:** p201: B picked, then A → A's copy appended first; p223: ERASE Last after it erases B's
  copy; p212 the same for references; p226: MOVE keeps the order.
- **mellowcad:** scratch c "harness" p201, p223: Last is A's copy.
- **Fix:** the originals in document order (MOVE-D5).
- **Regression test:** `transforms.test.ts`: picks B, A, the order and ERASE `_L` (p201, p223).

#### DRG-01 — A selection dragged with no command stays selected; AutoCAD drops it

- **Severity:** medium · **Row:** P · **Status:** verified
- **Where:** `SelectTool.ts` `beginSelectionDrag`, `placeMove`
- **AutoCAD:** d08: released, the line moved by the drag, `(ssget "_I")` nil.
- **mellowcad:** scratch r "d08": `selectedIds()` `["A"]`.
- **Fix:** drop the set when the drag places (MOVE-D8).
- **Regression test:** `selection.test.ts` (d08).

#### DRG-03 — A selection dragged draws dashed and blue, with grips; AutoCAD drags it as itself

- **Severity:** medium · **Row:** M, Q · **Status:** verified
- **Where:** `selectToolOverlay.ts` `buildMoveEdit`
- **AutoCAD:** d08-1: the line solid at the cursor, the original faded, no grips, no rubber band,
  no tooltip.
- **mellowcad:** `buildMoveEdit` draws the set `#38bdf8` dashed with its grips and a hot grip.
- **Fix:** as PLC-06 when the drag came from the selection (a move grip's drag is LINE's grips
  area, untouched).

### Low

#### PLC-07 — A coordinate typed in the tooltip is echoed without the `@` it was read with

- **Severity:** low · **Row:** L · **Status:** verified · **Area:** dynamic input, LINE's review
- **AutoCAD:** desktop after d02: COPY's second point, `5,-12` typed in the tooltip (DYNPICOORDS 0)
  → `Precise el segundo punto o [Matriz] <…>: @5,-12`.
- **mellowcad:** scratch r "tooltip echo": `…: 5,-12`.
- **Fix:** where the box reads a typed `x,y` relative, the history writes it with `@` (the runtime's
  answer echo), at every prompt.

#### PLC-08 — `cad-tools.md` lists part of PlacementTool's hooks

- **Severity:** low · **Status:** verified
- The rule names four hooks; the class has eight. **Fix:** a pointer to the class JSDoc.

#### PLC-09 — Citations: 2023's console and none

- **Severity:** low · **Row:** N · **Status:** verified
- `PlacementTool.ts:189-193` and `lastPoint.test.ts:121-135` cite AutoCAD 2023 (`acc/lp*`) for
  COPY's LASTPOINT: 2027 confirms it (p172, p173). `transforms.test.ts:43-267` (p100, p150, p156–p158,
  p200, p201, p216), `elevation.test.ts`' MOVE (p206), `blocks.test.ts:317` (p211),
  `dynamicInputEnter.test.ts:98` (p150) cite no probe.

#### PLC-10 — Paths that hold and no test holds

- **Severity:** low · **Row:** N · **Status:** verified
- p204 (a copy keeps layer, linetype, lineweight, thickness, Z), p205, p206, p207–p210, p212, p215–p219,
  p220, p224, p225, p131, p136, p172; the scratch tests move as they are.

#### MOV-01, CPY-05 — The † on DESPLAZA, D, COPIA, CP, DUP is stale

- **Severity:** low · **Row:** A · **Status:** verified
- p101, p103: the installed es-ES `acad.pgp` has `D`, `CP`, `DUP`. **Fix:** modify.md drops the †.

#### MOV-03 — MOVE's coverage entry holds STRETCH's ellipse claims

- **Severity:** low · **Status:** verified
- `modify.md:18-24` cite ellipse/p324, p326, p331, which run STRETCH. **Fix:** move both clauses to
  STRETCH's entry.

#### CPY-04 — COPY's first second point refuses as a point with no keyword

- **Severity:** low · **Row:** B · **Status:** verified
- **AutoCAD:** p156–p158: `Point or option keyword required.` (es `Se requiere un punto o una
  opción.`), as Array is a keyword there.
- **mellowcad:** scratch b: `Invalid point.`
- **Fix:** while Array is missing, that state `takes()` `{ refusal: "pointOrKeywordRequired" }`
  (MOVE-D9).

#### DRG-02 — U after a dragged selection names nothing; AutoCAD names it `DROPGEOM GROUP`

- **Severity:** low · **Row:** F, L · **Status:** verified (es); en from the tables
- **AutoCAD:** d08, d10: `_U` → `SOLTARGEOM GRUPO`; tables 52629 `DROPGEOM` / `SOLTARGEOM`, 52656
  `GROUP` / `GRUPO`.
- **mellowcad:** scratch r "d08": `U` alone.
- **Fix:** the drag's step named `DROPGEOM GROUP` (es `SOLTARGEOM GRUPO`), REDO the same.

#### DRG-04 — The coverage does not say a selection drags

- **Severity:** low · **Status:** verified
- drafting-aids.md, Selecting with no command: add the drag (d08) and Ctrl's copy as unverified
  (d09: Ctrl at the press is a sub-object pick).

## 6. Decisions taken

- **STP-D1:** every command's run is an undo step, also when it executed nothing (p07, p120, p233),
  named as echoed; a view left where it was and U, UNDO, REDO, MREDO keep making none.
- **MOVE-D1:** `Specify displacement` sets LASTPOINT to the UCS origin as it opens (p135, p109).
- **MOVE-D2:** `Specify displacement` is a point prompt anchored at the UCS origin: snaps, a pick, a
  number, `<a`; the point is the vector. No rubber band is drawn from the origin (unverified on the
  desktop: the console's UseBasePoint says only where Ortho and a number measure from).
- **MOVE-D3:** COPY places at any displacement; MOVE and STRETCH execute nothing at a zero one, the
  step coming from STP-D1.
- **MOVE-D5:** the set is placed in document order.
- **MOVE-D6:** the drag: the set in its own look at the cursor, the rubber band
  `THEME.dashedRubberBand` dashed; MOVE's originals faded, COPY's glowing; STRETCH as MOVE until the
  Transforms review probes it.
- **MOVE-D8:** a selection dragged with no command drops the set and makes a step named
  `DROPGEOM GROUP`, drawn as MOVE-D6 with no rubber band.
- **MOVE-D9:** while Array is missing, COPY's first second point refuses in `Point or option keyword
  required.`
- **MOVE-D10:** the hatch's single `origin` moves with it (AutoCAD moves the pattern's base points,
  p221; its `Origin` seed is not modelled).
- **MOVE-D11:** associativity and its messages are n/a (not modelled).
- **MOVE-D12:** per-object LTSCALE stays known (properties.md).

## 7. Tests proposed

The regression tests in each finding, then the scratch tests of PLC-10 into `transforms.test.ts`,
`lastPoint.test.ts`, `undoEcho.test.ts` and `elevation.test.ts`; `englishSurface.test.ts`' walk
gains Displacement and COPY's Undo and Exit (its holes). Old citations: `acc/lp*` (PLC-09).

## 8. Not tested, and why

The cursor's badge (CURSORBADGE, known); pixels of the drag (the scene's primitives are tested, the
canvas is the presenters'); the English labels of the right button's menus (a Spanish desktop pass;
the menus' items are ids, worded by the catalog LINE's review owns).

## 9. Not reviewed, and why

The rubber band at `Specify displacement` and what `<a` then a number does there (the desktop pass
was over before the console showed the prompt anchored at the origin); a copy by a Ctrl drag (d09);
`'PAN` at the prompts; COPYMODE's storage (mOde is Missing).

## 10. Refuted in the adversarial pass

- The ghost drawn without a rubber band in the trace (`UseDashedLine` false, p158, p161): the
  desktop draws a dashed one (d01) — the flag is not the jig's line.
- The right button at COPY's first second point opening no menu: AutoCAD's menu exists because of
  Array (d06), which is Missing; its Intro is CPY-01.
- LASTPOINT during COPY at the base: 2027 confirms 2023 (p172, p173), so only a citation (PLC-09).
- `5,-12` in the tooltip read relative: DYNPICOORDS 0, as command-line.md says; only the echo
  differs (PLC-07).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | State |
| --- | --- |
| MOVE: `D`† (modify.md:3), COPY: `CP`, `DUP`† (:27) | no longer unverified (MOV-01, CPY-05) |
| MOVE: the ellipse clauses (:18-24) | STRETCH's (MOV-03) |
| COPY: Displacement places one copy and ends | false at a zero vector (PLC-05) |
| COPY: no copy at the same point (PlacementTool.ts:73-77) | an undeclared deviation (PLC-05) |
| cad-tools.md "A whole run of a command is one undo step" | broken for a run that executes nothing (STP-01) |
| cad-tools.md, PlacementTool's reuse line | partial (PLC-08) |

Checked and holding: the prompts and keywords in en and es; MOVE's 3D displacement (p206); the
Displacement default per command and per drawing (p123, rectang/p314, p315); COPY's multiple
placement and its Undo at each depth; preview equals commit (`resolveSecond` shared); one commit per
placement; ghosts with `{ blocks: ctx.blocks }`; copies through `carryOverrides`; `showRise` and
`acuteHeading` for the live fields; no `WHY` in the files but the undeclared skip above.

## 12. Order of execution and estimate

1. **STP** (STP-01): the undo area first, as PLC-05's MOVE step leans on it. Small, wide: every test
   counting undo steps.
2. **PLC** (PLC-01 to PLC-10): `Specify displacement` as a point prompt, the zero placement, the
   drag's look, the echo, the docs. The largest.
3. **MOV** (MOV-01 to MOV-03).
4. **CPY** (CPY-01 to CPY-05).
5. **DRG** (DRG-01 to DRG-04).

## 13. Changes to coverage, rules, catalogs and roadmap

- modify.md: MOVE and COPY rewritten (Displacement as a point, the zero placement, the order, the
  messages), the † gone, the ellipse clauses to STRETCH; command-line.md: U after a command that
  changed nothing, the tooltip's `@` echo; drafting-aids.md: the drag of a selection.
- `cad-tools.md`: the PlacementTool line a pointer; the undo-step line.
- Catalogs: the undo name `DROPGEOM GROUP` (es `SOLTARGEOM GRUPO`).
- Roadmap: MOVE, COPY done, owning placement; the Transforms review checks STRETCH's look and its
  zero displacement against MOVE-D3 and D6.
- annex-probes.md §4: F10 and the function keys sent as keys open the ribbon's key tips (Polar by
  AUTOSNAP); the harness's 1 px per unit puts a grip under a press near a short line's end.

## 14. Template improvements

- Row F: "U after the command changed nothing" (an empty set, a zero vector, an inquiry): it found
  STP-01, wider than the command.
- Row H: "the order the objects are created in, from a set picked out of order" (CPY-03).
- annex-probes.md §4: function keys sent with SendInput reach the ribbon as Alt does (a QAT digit ran
  Plot): set the variable through COM instead; a desktop accident leaves files in AutoCAD's working
  directory (`plot.log` in the repo).
- §4.8: a subagent per prompt found the zero placement three times (PLC-05, under three ids): give
  the zero vector to one subagent.
