# ERASE review

> **Status:** plan, 2026-10-21 — phases 0–4 of skill `command-review`, the eighth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (ERA, SEL in two commits, PRE, CYC).

## 1. Summary

3 high, 16 medium and 14 low findings over four blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| ERA | ERASE itself: names, its end, the Delete key, U, the look of its set | 0 | 3 | 5 |
| SEL | `Select objects:` and its modes (this review owns it): counts, filters, preselection, Previous, the set's life | 1 | 12 | 5 |
| PRE | selecting with the mouse, with no command and at `Select objects:` (owned): lasso, window, Escape, badges | 2 | 1 | 3 |
| CYC | selection cycling (owned) | 0 | 0 | 1 |

The worst: a set a command was given stays selected when the command ends or is cancelled, so the
next command takes it as its preselection — MOVE then ERASE erases what was just moved without
asking (SEL-43, PRE-01: `(ssget "_I")` is nil after every command but COPYCLIP, p249–p251, d10); a
press and drag on nothing draws a rectangle where AutoCAD 2027 draws a lasso, window rightwards,
crossing leftwards, Space cycling it to fence (PRE-02, d04, d05, d09); and ERASE says
`n objects erased.`, which AutoCAD never writes (ERA-01, p00, d09).

The analogues SPLINE left, probed first: EXPLODE's per-object refusal falls under each selection's
count, inside `Select objects:` — counted in `found`, kept out of the set and the total, silent at
`Remove objects:`, after the locked-layer line (differs, SEL-40: p213–p219, spline/p319); a
preselection EXPLODE refuses whole asks `Select objects:` again and closes at the first selection
that adds something (differs, SEL-41: p02, p241, p242); its empty set says `None found.` (differs,
SEL-42: p205, p216). The count line itself: after a full name typed, on a line of its own; after an
alias or a macro, on the echo's line (PRE-06: d11, p01). A ribbon macro's report line opening the
next prompt on its own line (SPL-07's analogue) does not arise: ERASE's macros (`^C^C_erase`,
`^C^C_erase;`) print no report.

## 2. Inventory

Commit `6a5a7fd`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The command:** `cad/application/tools/EraseTool.ts` over `SelectionActionTool.ts`;
  `defaultTools` (`erase`), `TOOL_COMMANDS` (ERASE); not transparent (p04, p324, p325). Catalogs:
  `commands.names` ERASE (`E`; es BORRA, `B`), the message `erased`, in `en.json`, `es.json`,
  `ar.json`. The rail's Erase (`components/cad/tool-rail.tsx`), the Edit menu's Erase
  (`cad/application/runtimeShortcutMenu.ts`), the Delete key (`SelectTool.ts`), the landing's
  filing (`content/commands.ts`).
- **The area owned:** `objectSelection.ts` (`ObjectSelector`, `countPreselection`, `lastObject`),
  `boxSelection.ts`, `typedPick.ts`; with no command `SelectTool.ts`' picks and windows and the
  runtime's Previous set (`CadRuntime.ts`); `SelectionCycling.ts` and
  `components/cad/selection-cycling-list.tsx`. Every tool holding an `ObjectSelector` is a user,
  checked only in its contract with it: `ExplodeTool`, `JoinTool`, `CopyClipTool`, `PlacementTool`
  (MOVE, COPY, STRETCH), `RotateTool`, `ScaleTool`, `MirrorTool`, the arrays, `DimSpaceTool`,
  `HatchTool`, `BlockTool`, `ZoomTool`, `BreakTool`, `UcsTool`, `EdgeEditTool`, `FilletTool`,
  `ChamferTool`, `MatchPropTool`.
- **Tests:** `selection.test.ts`, `selectionModes.test.ts`, `selectionCycling.test.ts`,
  `transforms.test.ts` (EXPLODE), `undoEcho.test.ts`, `invalidAnswers.test.ts`, `locale.test.ts`,
  `foreignHost.test.ts`, `shortcutMenu.test.ts`, `englishSurface.test.ts`.
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO and OOPS after ERASE; EXPLODE's,
  DIMSPACE's, HATCH's and ARRAYPATH's filters at their set; Previous after MOVE, COPY, EXPLODE and U.
- **Areas cited:** LINE's (the command line, transparency, undo, grips, the palette), SPLINE's
  (EXPLODE's `Cannot explode SPLINE`).
- **Knowledge:** `docs/coverage/modify.md` (ERASE, EXPLODE), `command-line.md` (`Select objects:`),
  `drafting-aids.md` (Selection cycling, Selecting with no command), `spanish.md`; rules
  `cad-tools.md`, `cad-catalogs.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/erase/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh erase <ids>` in es-ES and en-US; the
desktop's are `dsk.sh` with `lib-dsk.sh` and `drag.ps1` (a press, moves and a release with the
button held between screenshots) in the same folder. Transcripts and screenshots are in
`research/probes/erase/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p04 | ACADVER; ERASE's end; a preselection then ERASE, MOVE, EXPLODE; OOPS and U; `'ERASE` |
| p100–p164 | the modes typed at `Select objects:`: W, C, BOX, L, ALL, F, WP, CP, P, R, A, U, AU, SI, SU, O, G, M, CL, `?`, FOO; their prompts, refusals, counts, `@` and numbers, `_END`, `'ZOOM`, `'ORTHOMODE`; Spanish capitals; MIRROR's `S` |
| p200–p261 | typed points at `Select objects:`, Enter and Space, transparency, `_U`, locked and off layers; EXPLODE's, JOIN's, DIMSPACE's, HATCH's and ARRAYPATH's filters; preselection for every set command; Previous after each command and U; `(ssget "_I")` after each command; the refusal lists |
| p300–p331 | ERASE's names and aliases (`DELETE`), repeat, U, REDO, MREDO, OOPS, every type erased, locked objects, `-PURGE` and EXPLODE's reports |
| d01–d14 | with no command: hover, pick, a clicked window and crossing, the lasso and Space, Fence from the implied window, Shift, Escape; at ERASE's prompt: the cursor, the fade, a lasso, Shift+pick, the right button; Escape after a pick; the Delete key and a preselection's echo; SELECTIONCYCLING's badge, list and Shift+Space; the minus badge |

## 4. Matrix

States as `matrix.md`; a row the same at every prompt takes one cell. Tests are scratch tests in
`research/review/erase/` until the execution moves them.

### ERA — ERASE

| Row | Cell |
| --- | --- |
| A names | ERASE, E, `_ERASE`: match · p00, p301 · `selection.test.ts:888`; BORRA, B: untested · p300; `DELETE`: differs ERA-02 · p302; `_E` in es and `_.ERASE`: known (command-line.md) · p301, p04; Enter repeats: untested · p303; `'ERASE`: untested · p04, p324, p325 |
| A rail, menus, keys | the Edit menu's `^C^C_erase`: match · `shortcutMenu.test.ts:125`; the Delete key: differs ERA-03 · d11; Backspace: unverified ERA-04 |
| B/G/L its end | `n objects erased.`: differs ERA-01 · p00, p03, p300–p304, d09; Enter on an empty set silent: untested · p304; Escape: match · d10 · `selection.test.ts:932` |
| F undo | U echoes ERASE / BORRA: match · p03, p305 · `undoEcho.test.ts:105`; REDO, UNDO 1, MREDO 1, depth: untested · p306, p320–p322; OOPS: known · p307, p309 |
| H what it erases | every type: untested · p310, p323; a hatch's boundary: known (HPASSOC) · p311; locked objects: match · p312, p331 · `selectionModes.test.ts:155`; the handle back after U: untested · p314 |
| K | the sweep of its ids: match · `catalog-sweep.mjs --from` (0 `es-2027`, 0 `en-2027`); `ar` interface only |
| M/Q look | the hovered and selected objects faded, a red × beside the cursor: differs ERA-09 (fade) · d09-2, d09-4; the badge: known (CURSORBADGE) |
| P | pick, window, lasso, right button at its prompt: see SEL and PRE |
| J, I, C, D, E | n/a: ERASE asks no point; its set's prompt is SEL's |

### SEL — `Select objects:` and its modes

| Row | Cell |
| --- | --- |
| B counts | picks, duplicates, totals, `0 found` alone, Remove's `removed`: match · p100, p101, p200, p252 · `selectionModes.test.ts:28, 61, 668`; a set at 0 still totals: untested · p211, p241 |
| B modes | W, C, BOX, L, ALL, F, WP, CP, AU, SI, SU, O, Undo: match · p100–p121, p128–p132 · `selectionModes.test.ts`; Last on off and locked layers, prefixes past the capitals, a zero window, Undo after Add: untested · p106, p108, p146, p147, p157; G, M: known · p134, p135; CL: refused in 2027 · p136, SEL-07 |
| B Remove | Undo there: differs SEL-04 · p145, p156; the locked line there: differs SEL-48 · p243, p247 |
| B MIRROR's `S` | differs SEL-05 · p153, p158 |
| B refusal lists | ERASE, MOVE, COPY, ROTATE, SCALE, CUTCLIP with sub-objects; MIRROR, JOIN, ZOOM Object, DIMSPACE, STRETCH whole: untested · p137, p138, p259; EXPLODE, COPYCLIP, the arrays, -BLOCK whole here with sub-objects: differs SEL-44 · p02, p138, p223, p251, p259, p260 |
| B filters | EXPLODE's line under each count: differs SEL-40 · p213–p219; ARRAYPATH's `1 was filtered out`: match · p223 · `selectionModes.test.ts:641`; DIMSPACE: differs SEL-45 · p221, p244; HATCH: differs SEL-46 · p222; JOIN takes anything: untested · p220 |
| C points | `x,y`, a window on nothing, a wrong corner (`acc/sw…`, `wn11` re-probed): match · p200, p201, p252, p164 · `selectionModes.test.ts:668, 697`; `@`, a number, LASTPOINT after: untested · p200, p202, p203; numbers and `@` at later corners and points: untested · p116, p120, p150–p152; `@` at a mode's first point: differs SEL-01 · p149, p159, p160; DIMSPACE's typed base: differs SEL-51 · p221, p256 |
| D | `_END` at a corner: untested · p124 |
| E | `'ZOOM`, `'-PAN` at `Select objects:` and a corner: untested · p122, p207, p210; `'ORTHOMODE`: known (transparent variables, command-line.md) · p123, p161, p163; `'LINE`: match · p209 |
| F | `_U` there is the Undo mode: untested · p208; Previous after MOVE, COPY, U of MOVE: match / untested · p232, p240, p246, p162 · `selectionModes.test.ts:188, 208`; after U of ERASE: differs SEL-03 · p111, p234, p238, p239; after EXPLODE: differs SEL-49 · p236, p258 |
| G | Enter on an empty set silent but EXPLODE's `None found.`: differs SEL-42 · p204, p205, p216, p245; Enter at Remove: untested · p206; another command: match · p209 |
| H the set's life | preselection counted after the echo for every set command: untested · p01, p217, p224–p229; a preselection EXPLODE refuses: differs SEL-41 · p241, p242; what stays selected after a command: differs SEL-43 · p249–p251, p261; PICKFIRST 0: n/a, SEL-52 · p230 |
| K | every es string of these prompts and messages: match · p139–p142; the clarify prompt after `_S` in es: differs SEL-08 · p130, p131 |
| L | the lines' layout: match · p252–p258 |
| N | `selectionModes.test.ts`: the `acc/…` citations re-probed (p115, p117, p118, p164, p200, p223, p237); `:400` and `:95` pin ERA-01; `:462` pins SEL-05; `:494` checks Last only |

### PRE — selecting with the mouse

| Row | Cell |
| --- | --- |
| P hover at `Command:` | the object thickened, the rollover tooltip: match · d01-1 · `selection.test.ts:44`; on a selected object: known (Missing) · d14-3 |
| P picks | a pick selects, another adds, Shift+pick removes: match · d01, d07 · `selection.test.ts:53, 62` |
| P clicked window | rightwards a window, leftwards a crossing, Shift at the first click removes: match · d02, d03, d07 · `selection.test.ts:144–199`; its prompt `Specify opposite corner or [Fence/WPolygon/CPolygon]:` and Fence from it: known · d02, d06 |
| P press and drag | differs PRE-02 · d04, d05, d09-4 |
| P Escape | with a window under way keeps the set: match · d08 · `selection.test.ts:199`; at `Select objects:` after a pick: differs PRE-01 · d10 |
| Q window | blue and green fills: match; the outline white, solid or dashed: differs PRE-04 · d02-1, d03-1; what it will take previewed: differs PRE-03 · d02-1, d03-1 |
| Q cursor | the pick box alone at `Select objects:`: known (Missing, now d09-1); the minus badge: differs PRE-05 · d14 |
| L | a preselection's count after a full name: differs PRE-06 · d11, p01; after an alias or the Delete key's macro: match · d11 |

### CYC — selection cycling

| Row | Cell |
| --- | --- |
| A default | SELECTIONCYCLING 0: match · p01 · `selectionCycling.test.ts:24` |
| P badge, Shift+Space | the badge over a stack, Shift+Space walking it at `Command:` and at `Select objects:`: match · d12, d13 · `selectionCycling.test.ts:34, 77, 114` |
| P list | a click opens `Selection` with the candidates, hovering previews, a click chooses: match · d12 · `selectionCycling.test.ts:127–177`; its last entry `None`: differs CYC-01 · d12-2; whether it opens again after Shift+Space: unverified (click.ps1's jiggle restarts the stack, d12-7) |

## 5. Findings

Each finding's probes, transcripts and scratch test are in the subagents' reports, kept in the
scratchpad of the session; what follows is what the execution needs.

### High

#### SEL-43 — the set stays selected when a command ends, and the next command takes it

- **Severity:** high · **Row:** H · **Status:** verified (reviewer: p249, scratch `after.test.ts`)
- **Where:** no command clears `ctx.selection` as it ends (`PlacementTool.ts`, `RotateTool.ts`,
  `ScaleTool.ts`, `MirrorTool.ts`, `ArrayTool.ts`); `ExplodeTool.ts` selects the pieces,
  `JoinTool.ts` the result
- **AutoCAD:** `(ssget "_I")` is nil after MOVE, COPY, ROTATE, SCALE, MIRROR, STRETCH, JOIN,
  ARRAYRECT, EXPLODE, LINE and ID with a preselection (p236, p249–p251, p258, p261); only COPYCLIP
  keeps it (p250)
- **mellowcad:** MOVE, then `E` Enter: `ERASE 1 found` and the moved line is erased
- **Fix:** ERASE-D22 · **Regression test:** `selection.test.ts`, a command ending, then ERASE asks
  `Select objects:`; the loop over the commands, citing p249–p251

#### PRE-01 — Escape at `Select objects:` leaves what was picked selected, with grips

- **Severity:** high · **Row:** G · **Status:** verified (reviewer: d10, scratch `esc.test.ts`)
- **Where:** `SelectionActionTool.onDeactivate`, `PlacementTool`, the runtime's cancel path
- **AutoCAD:** ERASE, a pick, Escape: nothing selected (d10)
- **mellowcad:** the line stays selected with its grips after ERASE, MOVE, EXPLODE, ROTATE, STRETCH
- **Fix:** ERASE-D22 (one path: a command's end or cancel) · **Regression test:**
  `selection.test.ts`, citing d10

#### PRE-02 — a press and drag on nothing draws a rectangle; AutoCAD 2027 draws a lasso

- **Severity:** high · **Row:** P · **Status:** verified (d04, d05, d09-4; help "To Select Objects",
  PICKAUTO 5 "Begins a window or crossing lasso selection if the cursor is not directly over an
  object when you click and drag")
- **Where:** `SelectTool.ts` and `ObjectSelector`'s `dragging` step
- **AutoCAD:** the path the cursor drags, closed; rightwards a window lasso (blue, solid), leftwards
  a crossing lasso (green, dashed); Space with the button held cycles Window → Fence → Crossing,
  each said on a line of its own: `Window Lasso  Press Spacebar to cycle options` (table 63424 with
  25090/25092/25095; es `Ventana Forma irregular: pulse la barra espaciadora para recorrer las
  opciones.`); released, it selects as a WPolygon, CPolygon or Fence would, and at
  `Select objects:` its count stands on the line after (`3 found, 5 total`, d09)
- **mellowcad:** the rectangle of the press and the release
- **Fix:** ERASE-D40 · **Regression test:** `selection.test.ts` and `selectionModes.test.ts`, a
  drag through a path enclosing one line and crossing another, both directions and the Space cycle,
  citing d04, d05, d09
- **Coverage:** `command-line.md` and `drafting-aids.md` say "a window dragged": rewritten

### Medium

| Id | One line | Where | AutoCAD | Fix |
| --- | --- | --- | --- | --- |
| ERA-01 | ERASE says `n objects erased.`; AutoCAD writes nothing | `EraseTool.ts` | p00, p03, p300–p304, d09 | no report; the key stays (ERASE-D30) |
| ERA-02 | no `DELETE` alias | `en.json`, `es.json` names | acad.pgp `DELETE, *ERASE` / `*BORRA`, p302 | add it to both |
| ERA-03 | the Delete key erases outside ERASE: no echo, U nameless, Enter repeats the command before | `SelectTool.ts` (Delete), dead `CadRuntime.deleteSelection` | cuix `MM_1561` `^C^C_erase;`, d11 `Command: _.erase 1 found` | ERASE-D31 |
| SEL-01 | `@` at a mode's first point (window, fence, polygon) refused | `objectSelection.ts` `commitTyped` | p149, p159, p160 | LASTPOINT as `@`'s base there |
| SEL-03 | after U of an ERASE, Previous still finds the restored objects (SEL-50 merged) | `CadRuntime.ts` Previous set | p111, p234, p238, p239; after U of MOVE kept, p162, p240 | ERASE-D24 |
| SEL-04 | Undo at `Remove objects:` stays in Remove | `ObjectSelector.undo` | p145, p156 | Undo goes back to `Select objects:` |
| SEL-05 | a whole-object set's `S` starts SIngle; 2027 takes it and does nothing | `objectSelection.ts` modes | p153, p158; `SI` closes, p154 | ERASE-D25 |
| SEL-40 | EXPLODE says what it cannot explode once, after the set, and keeps those in it | `ExplodeTool.ts`, `ObjectSelector.select` | p213–p219, spline/p319 | ERASE-D20 |
| SEL-41 | a preselection EXPLODE refuses whole ends the command | `SelectionActionTool.begin`, `countPreselection` | p02, p241, p242 | ERASE-D21 |
| SEL-42 | EXPLODE's empty set silent (ERA-05 merged) | `ObjectSelector.close` | p205, p216, p328, p329: `None found.` (20841, es `No hallada.`) | a `noneFound` option and message |
| SEL-44 | EXPLODE, COPYCLIP, ARRAYRECT, ARRAYPOLAR, ARRAYPATH's set and BLOCK take sub-objects; AutoCAD's take whole objects (SEL-06 merged) | their `selectionInput` / `takes` | p02, p138, p223, p251, p259, p260 | `"wholeObjects"`; CUTCLIP keeps sub-objects |
| SEL-45 | DIMSPACE leaves an angled dimension out and a non-dimension silent; the total starts late | `DimSpaceTool.ts` `accept`, `ObjectSelector.select` | p221, p244: `0 found`, `0 found, 0 total` | count the raw find; `accept` keeps every dimension |
| SEL-46 | HATCH's set leaves an open line out silently; AutoCAD finds it | `HatchTool.ts` `accept` | p222 | no `accept` at selection; left out when tracing |
| SEL-49 | after EXPLODE, Previous is the pieces; here none | `ExplodeTool.ts` | p236, p258 | ERASE-D23 |
| SEL-51 | a point typed at DIMSPACE's `Select base dimension:` refused | `DimSpaceTool.ts` | p221, p256 | `typedPick`, as BREAK |
| PRE-03 | a window, crossing or lasso does not preview what it will take | `buildSelectionBoxOverlay` callers | d02-1, d03-1, d05-1 (SELECTIONPREVIEW 3) | ERASE-D41 |

### Low

| Id | One line | Fix |
| --- | --- | --- |
| ERA-04 | Backspace erases the selection, no `WHY` (unverified in AutoCAD) | ERASE-D32 |
| ERA-06 | -PURGE's words are not PURGE's here (`Deleting block "B1".`, `1 block deleted.`, `No unreferenced blocks found.`, p326, p327, p330) | to the Blocks review (ERASE-D33) |
| ERA-07 | stale knowledge: `spanish.md`'s unverified counts, a comment naming a `Nothing selected.` message, modify.md's ERASE entry, the `.` prefix note | rewritten |
| ERA-08 | tests asserting ERA-01 under a "2023 console" heading; ERASE's tests cite no probe | re-cited |
| ERA-09 | ERASE's hovered and selected objects glow; AutoCAD fades them (d09-2, d09-4) | ERASE-D34 |
| SEL-07 | coverage: CLass refused in 2027 (p136), SUbobject and Object now taken | rewritten |
| SEL-08 | es: the clarify prompt after a global `_S` lists local words; AutoCAD the global ones (p130, p131) | the global words when the answer was global |
| SEL-47 | `cad-tools.md`'s "filter the pick instead of refusing" contradicted by its own examples (p221, p222, p244) | rewritten |
| SEL-48 | `Remove objects:` says the locked line (p243, p247: silent) | part of ERASE-D20 |
| SEL-52 | Missing lacks PICKFIRST (p230) and the locked pick's window | recorded |
| PRE-04 | the window's outline blue or green; AutoCAD's white (d02-1, d03-1) | THEME's selection strokes |
| PRE-05 | the minus badge from Shift alone, at `Command:` and `Select objects:`; AutoCAD only over a selected object with no command (d14-1 to d14-6) | shown there only |
| PRE-06 | a preselection's count on the echo's line after a full name; AutoCAD on its own line (d11, p01) | ERASE-D42 |
| CYC-01 | the Selection list lacks its last entry, `None` (es `Ninguna`), which picks nothing (d12-2) | add it |

## 6. Decisions

- **ERASE-D20:** a filter that speaks is `ObjectSelectorOptions.refuse` (`rejects(entity)`, a
  message id taking `count`); the locked layer is its built-in first filter. In `select()`: `found`
  counts the raw find, then each filter says its line in order (locked, then the command's), the
  survivors join the set, duplicates are counted against the set, `counted` (the total) follows
  the raw find; at `Remove objects:` no filter speaks. `accept` stays the silent filter before the
  count (ARRAYPATH's source, BREAK's flat objects).
- **ERASE-D21:** `countPreselection` becomes `ObjectSelector.preselect(ctx)`: it counts the
  preselection, runs D20's filters, remembers the survivors as Previous; none surviving opens
  `Select objects:` closing at the first selection that adds something.
- **ERASE-D22:** the runtime drops the selection when a command ends or is cancelled, but for
  COPYCLIP (p250); grip edits are SelectTool's and keep theirs; a transparent command's suspend is
  untouched. Whether a cancelled noun-verb command keeps its preselection is unverified (no probe
  reaches it): dropped too, the standard (d10 drops the verb-noun one).
- **ERASE-D23:** EXPLODE remembers its pieces as Previous and selects nothing.
- **ERASE-D24:** erasing an object takes it out of the Previous set for good (the runtime drops its
  id when the document loses it); U does not restore it (p111). After MOVE's U the set stays (p162).
- **ERASE-D25:** in a whole-object set an `S` that SIngle's capitals do not reach is taken and does
  nothing, with a `WHY` (p153, p158).
- **ERASE-D30:** the `erased` key stays, unused (template §8.3).
- **ERASE-D31:** with a selection, Delete runs `_.erase` as acad.cuix's Delete does (an echo, U and
  repeat as typed); `deleteSelection` goes.
- **ERASE-D32:** Backspace stays beside Delete, `WHY` a Mac's Delete key arrives as Backspace;
  coverage notes it.
- **ERASE-D33:** PURGE's report wording (ERA-06) goes to the Blocks review, which owns PURGE.
- **ERASE-D34:** at ERASE's `Select objects:` the hovered object and the set draw faded (the
  object's colour at reduced opacity, as COMMANDPREVIEW's erase preview), not glowing; only ERASE.
- **ERASE-D40:** the lasso is a polygon of the dragged path (a point kept per few pixels), closed,
  taken as WPolygon (rightwards) or CPolygon (leftwards), or as a Fence after Space; its line said
  as it starts and at each Space; with no command and at `Select objects:`, through
  `boxSelection.ts`' polygon and fence queries. A path that crosses itself is taken as drawn
  (AutoCAD's lasso has no zero-length or crossing refusal on the desktop).
- **ERASE-D41:** a window, crossing or lasso under way previews what it would take as the hover
  does (`THEME.entityHover`), skipping objects already selected.
- **ERASE-D42:** a preselection's count goes on a line of its own after a full name typed, on the
  echo's line after an alias or a menu macro (`B` → `BORRA 1 encontrados`, the Delete key's
  `_.erase 1 encontrados`).

## 7. Tests proposed

Every finding's regression test, in its file, citing its probe. Then the untested cells, by file:
`selectionModes.test.ts` (Last on off and locked layers, prefixes, a zero window, Undo after Add,
`@` and numbers at corners and later points, `_END` at a corner, `'ZOOM` at a corner and at the
prompt, `_U` at the prompt, Enter at Remove, Previous after COPY and U of MOVE, the refusal lists);
`selection.test.ts` (ERASE in Spanish, repeat, every type, the handle after U); `undoEcho.test.ts`
(REDO, MREDO). Old citations: `selectionModes.test.ts`' `acc/…` and the 2023 heading replaced by
the 2027 probes listed in §4 N.

## 8. What is not tested and why

The window's and lasso's fills (pixels); the rollover tooltip's delay; the Selection list's look
(React, `browser-verify` only if it changes).

## 9. What could not be reviewed

Space and the right button at `Select objects:` beyond d09's right button; Backspace in AutoCAD;
which candidate a click takes after Shift+Space (d13: the click tool's jiggle restarts the stack);
whether a cancelled noun-verb command keeps its preselection; MATCHPROP's destination set (unknown
to the console); a click on a locked object at `Select objects:` (known Missing).

## 10. Refuted

- `'ORTHOMODE` at `Select objects:` and at its modes' points (p123, p161, p163): transparent system
  variables are Missing (command-line.md); worse here, since the value typed next is read as a pick.
- ZOOM's own prompt during `'ZOOM` (view.md); `'LINE`'s echo (pinned by `transparentCommands.test.ts`).
- `_E` in Spanish and `_.ERASE`: Missing (command-line.md).
- A hatch's boundary erased without `Hatch boundary associativity removed.`: HPASSOC is Missing.
- OOPS: Missing; its 2027 behaviour (p307, p309) goes into the entry.
- ALL and Last skipping frozen layers: no freezing here.
- The preselection echo on one line in the console (p01): every console echo ends its line; the
  desktop settled it (PRE-06).
- A locked object in a preselection (p231): unreachable, picks skip locked objects.

## 11. Coverage, rules ↔ code

Rows that do not hold: modify.md ERASE (`n objects erased.`, ERA-01) and EXPLODE (where the count
is said, SEL-40); command-line.md (CLass, SUbobject/Object, "a window dragged", SEL-07, PRE-02);
drafting-aids.md (the minus badge unverified → PRE-05; the crosshair at `Select objects:` settled
by d09-1); spanish.md:123 (ERA-07); `cad-tools.md` "Pick feedback" (SEL-47); `cad-runtime.md`'s
"Shift held … the runtime draws AutoCAD's minus badge … with no command and wherever
`questionInput` says the question takes a set" (PRE-05). Checked and holding: `cad-tools.md`'s
ObjectSelector and SelectionActionTool bullets, `cad-catalogs.md`'s `countPreselection` line (to be
renamed with D21), `cad-runtime.md`'s Selection cycling section.

## 12. Order of execution and estimate

1. **ERA** (small): ERA-01–04, 07–09; catalogs (DELETE), the Delete key's macro, the fade.
2. **SEL, filters and preselection:** SEL-40–42, 44–48, 51, 52 (D20, D21); EXPLODE's, DIMSPACE's,
   HATCH's contracts.
3. **SEL, the set's life and the modes:** SEL-43 with PRE-01 (D22), SEL-01, 03–05, 07, 08, 49 (D23,
   D24, D25).
4. **PRE:** PRE-02 (the lasso, the largest), PRE-03–06.
5. **CYC:** CYC-01.

Blocks 2 and 3 touch `objectSelection.ts` and the snapshots: one after the other. Block 4 relies on
block 3's selection lifecycle.

## 13. Changes to coverage, rules, catalogs and roadmap

modify.md (ERASE, EXPLODE), command-line.md (`Select objects:`), drafting-aids.md (Selection
cycling, Selecting with no command), spanish.md; `cad-tools.md` (Pick feedback, ObjectSelector's
`refuse` and `preselect`), `cad-catalogs.md` (`countPreselection`), `cad-runtime.md` (the minus
badge, the selection dropped at a command's end); catalogs: `DELETE`, `noneFound`, the lasso's
lines, the cycling list's `None`; roadmap: ERASE done, owning `Select objects:` and its modes,
preselection and selection cycling; PURGE's wording noted for the Blocks review.

## 14. Template improvements

- annex-probes.md §4: a press and drag needs the button held between screenshots —
  `scripts/research/probes/erase/drag.ps1` is the pattern; promote it to an `acad.sh drag` tool.
- annex-probes.md §4: `acad.sh click` jiggles the cursor by 3 px before clicking, which restarts
  selection cycling's stack; a probe of which candidate a click takes needs a click without it.
- annex-probes.md §4: a key held across a screenshot (Shift's badge) is a SendInput key-down in one
  process and its key-up in another, the screenshot between.
- template §4.1: ask what each prompt leaves selected afterwards (`(ssget "_I")`): SEL-43 was found
  only because a subagent thought to read it.
