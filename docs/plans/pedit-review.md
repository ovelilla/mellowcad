# PEDIT, SPLINEDIT review (3DPOLY, PEDIT, SPLINEDIT; the 3D polyline object)

> **Status:** console blocks executed, 2026-11-05 (TPL, TPO, SPE, PED, LPT: §15); block PSD, the
> three commands' look on the desktop with the owner's mouse, is next, in a session of its own.
> Phases 0–3 in one session with three subagents, the execution in the same session.

## 1. Summary

**Findings:** 0 critical, 1 high, 18 medium, 17 low; one more medium unverified until the desktop
(TPL-03).

| Block | What                                               | Critical | High | Medium | Low |
| ----- | -------------------------------------------------- | -------- | ---- | ------ | --- |
| TPL   | 3DPOLY, the command                                | 0        | 0    | 1 (+1) | 2   |
| TPO   | the 3D polyline object (the area)                  | 0        | 0    | 1      | 2   |
| LPT   | LASTPOINT and the object picks of the three tools  | 0        | 0    | 3      | 2   |
| PED   | PEDIT                                              | 0        | 1    | 4      | 5   |
| SPE   | SPLINEDIT and the spline's conversion              | 0        | 0    | 9      | 6   |
| PSD   | the three on the desktop (to come)                 | –        | –    | –      | –   |

The worst:

- **`@dx,dy` at Edit vertex's Move and Insert reads from LASTPOINT**, not from the marked vertex
  AutoCAD's traced BasePoint names: the vertex lands somewhere else (PED-01, pedit/p227, p251).
- **PEDIT's Width and Edit vertex's Width and Tangent take no point**, typed or clicked, where
  AutoCAD measures one from the X or two (LPT-02, pedit/p303–p305); SPLINEDIT's point prompts leave
  LASTPOINT wrong, so `@` after a Move lands elsewhere (LPT-01, p335).
- **A 3D polyline is drawn dashed** where AutoCAD draws it continuous whatever its linetype
  (TPO-01, 3dpoly/p118, p122); a spline in a tilted plane converts to a 2D polyline where AutoCAD
  makes a 3D one (SPE-10).

## 2. Inventory

Commit `64fecab5`; AutoCAD 2027 (ACADVER 26.0, X.118.0.0); the tables of 2026-10-31.

**3DPOLY** — `cad/application/tools/Polyline3dTool.ts`; registration (`TOOL_COMMANDS`
`polyline3d`, no transparency); catalogs `polyline3d`, names 3DPOLY / 3P, es 3DPOL / 3P, pt-BR
POLI3D / P3 (each `acad.pgp`), prompts `specifyStartPointOfPolyline`, the endpoint prompts,
message `all3dSegmentsUndone`; the rail (`tool-rail.tsx`, Draw; acad.cuix `ID_3dpoly`,
`^C^C_3dpoly `, Home ▸ Draw expanded); `content/commands.ts` (draw); tests
`polyline3d.test.ts`, `currentProperties.test.ts` (FROM_SCRATCH), the English surface walk.

**The 3D polyline object (the area this review owns)** — `cad/domain/polylines3d.ts`, its type
and factory, its scene (`SceneBuilder.ts`), picking (`viewPick.ts`), snaps (`snapEntities`), grips
(`selectToolGrips.ts`), palette rows (`singleEntityInfo`, `runtimeProperties.ts`), its file field
(`drawingFile.ts`, version 36), and what other commands do with one (draw.md's 3DPOLY entry: MOVE
to UCS OBject); tests `polyline3d.test.ts`, `polylineSnaps.test.ts`, `list.test.ts`,
`chprop.test.ts`, `drawingFile.test.ts`.

**PEDIT** — `cad/application/tools/PolylineEditTool.ts`, `cad/domain/polylineFits.ts`,
`cad/geometry/arcFit.ts`, JOIN's polyline chain (`JoinTool.ts`); catalogs `pedit`, names PEDIT /
PE, es EDITPOL / PE, pt-BR EDITARP / EDP; the double-click at `Command:` on a polyline or 3D
polyline (`CadRuntime.doubleClick`, DoubleClickRoot.cui `ID_Pedit`); the rail's flyout `pedit`;
tests `pedit.test.ts`, `peditFit.test.ts`, `promptForms.test.ts`, `solidCommands.test.ts`.

**SPLINEDIT** — `cad/application/tools/SplineEditTool.ts`, `cad/domain/splineEditing.ts`,
`cad/domain/splineEdits.ts`, `cad/domain/splineJoin.ts`; catalogs `splinedit`, names SPLINEDIT /
SPE, es EDITSPLINE / SPE, pt-BR EDITARSPLINE / ESPL; the rail (flyout `pedit`); acad.cuix
`ID_Splinedit` (`^C^C^R_splinedit `) and DoubleClickRoot.cui `DC_0012` (SPLINE → SPLINEDIT); tests
`splinedit.test.ts`.

**Related:** SPLINETYPE, SPLINESEGS (PEDIT's entry); PLINE (the polyline object, its review);
JOIN (Pieces review), TRIM / EXTEND (their review): PED-05 and PED-08 are this review's findings
in their areas. **Areas:** owns the 3D polyline object. Cites the LINE review (the command line,
transparency, undo, point input, snaps), ERASE's (`Select objects:`, preselection), PLINE's (the
polyline object), SPLINE's (the spline object), Pieces' (single object's pick with modes), Corners'
(CRP-01's locked picks), Solid edits' and Solid inquiry's (SED-06, VSD-04: LASTPOINT at a click).

## 3. Probes

Inputs in `scripts/research/probes/3dpoly/`, `scripts/research/probes/pedit/` and
`scripts/research/probes/splinedit/`; transcripts and plots in `research/probes/` (gitignored).
es-ES and en-US unless marked. Earlier evidence: `3dpoly/p01–p79`, `d01–d03`; `pedit/p01–p199`;
`spline-knots/k11–k146`, `spline3d/s*`, all on 2027.

| Id                     | What it asks                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------- |
| 3dpoly/p100–p104       | `@dx,dy`, `d<a`, `@d<a`, `@`; `*` in a turned UCS; `#` refused; a bare number; `<45`   |
| 3dpoly/p105–p107       | LASTPOINT after the start alone, after Close, after Undo                               |
| 3dpoly/p108–p110       | `_INT`, `_PER`, `_NEA`, `_FRO`, `_M2P`; ORTHOMODE 1 with a typed point                 |
| 3dpoly/p111–p114       | transparent commands at each prompt; Undo after `'LTSCALE`; U / REDO / UNDO 2 / MREDO   |
| 3dpoly/p115–p116       | MPDUMP with every current property; `'-COLOR`, `'CLAYER` mid-command                   |
| 3dpoly/p117            | Undo after `'LTSCALE`, two segments                                                    |
| 3dpoly/p118, p122      | plots (en): a DASHED 3D polyline beside a LINE and a PLINE, PLINEGEN 0 and 1           |
| 3dpoly/p119–p126       | SAVEAS and OPEN; preselection; repeat; stored linetype; ROTATE / SCALE / MIRROR; UNDO Control None; Close at two |
| pedit/p200–p215        | the entry's **unverified** marks (Width's Enter, Multiple's empty set and order, fuzz, Ambos, arc Extend, tangents, Break, EXTEND, JOIN, a closed three, END) |
| pedit/p216–p226        | names in three languages; repeat; `'PEDIT`; refusals at each prompt; Width 0; Tangent's Enter |
| pedit/p227–p230, p251  | `@` at Move and Insert; a Z, `*`, a command at Move; `_END`, ORTHOMODE                 |
| pedit/p231–p237, p247  | transparent commands at seven prompts; Undo after a transparent change; U, UNDO 2, MREDO (untraced) |
| pedit/p238–p246, p249, p250, p252, p253 | refusals at Move; walk's eXit; what conversions and Break wear; UCS; preselection; 3D Break, Straighten; Multiple of 3D ones; LASTPOINT in Edit vertex; Reverse's tangent |
| pedit/p300–p308        | LASTPOINT at PEDIT's prompts; a typed pick, an override at it, a locked or overlapping polyline |
| pedit/p320–p338        | LASTPOINT at SPLINEDIT's point prompts; a typed pick, an override, a locked spline      |
| splinedit/p100–p103    | repeat; es and pt-BR names; a Fit polyline at `Select spline:`                         |
| splinedit/p104–p113    | the entry's **unverified** marks: own knots' Close, Open, Add, Delete, Reverse; closed Delete; Select point's miss; closed walks; Undo at After/Before |
| splinedit/p114–p120    | point forms at Move; `_END`; ORTHOMODE; a typed Z                                      |
| splinedit/p121–p132    | transparent commands at eight prompts; U, REDO, MREDO, UNDO 2 (untraced)               |
| splinedit/p133–p141, p155 | refusals at every prompt; the precision's; `E` at Fit data                          |
| splinedit/p142–p144, p157, p164 | what convert to Polyline makes: properties, a level plane, a tilted one (PEDIT's too) |
| splinedit/p145–p147, p158 | preselection: two splines, a line, what is left selected                            |
| splinedit/p148–p152, p159, p163 | the precision kept, shared with PEDIT, the OPEN test; Elevate order's default |
| splinedit/p153–p156, p160–p162, p165, p166 | closed Deletes and walks; a vertex miss; a spline-fit 3D polyline; `@` at Add |

## 4. Matrix

States per matrix.md. Rows I, M, P, Q and Escape and the right button of G are block PSD's.

### TPL — 3DPOLY

| Row | Cell                                                       | State                                                |
| --- | ---------------------------------------------------------- | ---------------------------------------------------- |
| A   | names, aliases in three languages; `'3DPOLY` refused       | match · pgp, p18 · polyline3d.test.ts:152, :160      |
| A   | Enter's repeat; the rail                                   | untested · p121 · tool-rail.tsx                       |
| B   | prompts, keywords, Enter, FOO; pt-BR capitals              | match · p01–p03, p06, p08 · :59, :82                 |
| B   | Close with two vertices refused                            | untested · p126                                      |
| C   | `@`, polar, `@` alone, `*` turned, `#` refused, a number   | untested · p100–p103                                 |
| C   | `<45` then a number                                        | untested · p104 (the console ignores it; PEDIT-D14)  |
| C   | LASTPOINT after start, Close, Undo                         | untested · p105–p107                                 |
| D   | INT, PER, NEA, FRO; ORTHOMODE typed; Ortho off the plan    | untested · p108–p110; M2P known (drafting-aids.md)   |
| E   | `'ZOOM`, `'ORTHOMODE`, `'-OSNAP`, `'LINE` at each prompt   | untested · p111                                      |
| E/F | the segment's Undo after a transparent change              | differs TPL-01 · p112, p117                          |
| F   | U, REDO, UNDO 2, MREDO echo `3DPOLY`                       | untested · p113                                      |
| F   | Undo under UNDO Control None                               | differs TPL-02 · p125                                |
| G   | Enter; a command typed mid-prompt                          | match · p05 · :82; untested · p114                   |
| H   | current properties, ELEVATION, no thickness; fixed at start | untested · p115, p116                               |
| H   | preselection dropped, nothing left selected                | untested · p120                                      |
| K   | sweep `--from`, es and pt-BR; trace keywords               | match · p06                                          |
| L   | history                                                    | match · p111 (but TPL-01's regeneration line)        |
| M   | the jig                                                    | unverified TPL-03 · p01, p116 traces → PSD           |
| N   | tests                                                      | TPL-04                                               |

### TPO — the 3D polyline object

| Row | Cell                                                       | State                                                |
| --- | ---------------------------------------------------------- | ---------------------------------------------------- |
| H   | MOVE, COPY, STRETCH, EXPLODE, BREAK, OFFSET, FILLET, CHAMFER, TRIM, EXTEND, JOIN, AREA, DIMLINEAR, UCS OBject | match · p20–p79 · polyline3d.test.ts:179–1145 |
| H   | ROTATE, SCALE (Z too), MIRROR                              | untested · p124                                      |
| I   | grips; palette rows                                        | match · d01–d03 · chprop.test.ts:289; hover menus known |
| J   | DWG round trip; mellowcad's file, fitted ones too          | match · p119 · drawingFile.test.ts:548               |
| K   | `Ortho` off the plan from a vertex at Z 50                 | match · scratch (30,0,50); TPO-02 is its type        |
| M   | its linetype drawn                                         | differs TPO-01 · p118, p122, p123                    |
| N   | tests                                                      | TPO-03                                               |

### LPT — LASTPOINT and the object picks (all three tools)

| Prompt                                                       | State                               |
| ------------------------------------------------------------ | ----------------------------------- |
| PEDIT `Select polyline`, SPLINEDIT `Select spline`: a typed pick sets it | untested · p300, p320   |
| the same picks: a click (in plan, off it)                    | differs LPT-04 · VSD-04, SED-06     |
| an override typed at the pick                                | differs LPT-05 · p306, p327         |
| a locked object at the pick                                  | differs LPT-03 · p307, p328         |
| two overlapping objects: the newest                          | untested · p308                     |
| PEDIT Edit vertex Move, Insert: the point given              | untested · p301, p302               |
| PEDIT Width (two points), Edit vertex Width, Tangent         | differs LPT-02 · p303–p305, p333    |
| PEDIT Edit vertex entered and left: kept                     | untested · p250, p332               |
| SPLINEDIT fit and vertex Move, fit Add, Tangents, vertex Add and Delete, fit Delete | differs LPT-01 · p321–p338 |

### PED — PEDIT

| Row | Cell                                                       | State                                                |
| --- | ---------------------------------------------------------- | ---------------------------------------------------- |
| A   | names in three languages; double-click on a polyline       | match · p216–p218 · pedit.test.ts:145, :152          |
| A   | the alias echoed with the name                             | owned (LINE review, the command line)                |
| A   | repeat; `'PEDIT` refused; rail echo; double-click on a 3D one | untested · p219, p220                             |
| B   | refusals at the main, vertex and 3D prompts; Ltype gen; Width 0; Tangent's Enter | untested · p221–p226          |
| B   | Width's Enter; a fuzz never given; Spanish `<Ambos>`       | untested · p200, p202, p205, p206                    |
| B   | pt-BR words at three prompts                               | differs PED-09 · p09, p12, p39, p205                 |
| C   | `@` at Move and Insert                                     | differs PED-01 · p227, p251                          |
| C   | a Z, `*`, a command at Move: `Invalid 2D point.`; the UCS  | untested · p228, p229, p238                          |
| D   | `_END` at Move; ORTHOMODE with a typed Insert              | untested · p230                                      |
| E   | transparent commands at seven prompts                      | untested · p231–p234; ZOOM's `>>` list owned (View)  |
| F   | Undo after a transparent change; UNDO 2; MREDO; U after nothing; 3D's Undo | untested · p235–p237, p247         |
| G   | Escape keeps; walk's eXit                                  | match · p47 · :405; untested · p239                  |
| G   | Multiple's empty set                                       | differs PED-02 · p201                                |
| H   | converted line and arc, Break's piece, a rotated UCS       | untested · p240, p241, p243                          |
| H   | a tilted arc converted                                     | unverified · p242 (harness not checked)              |
| —   | preselection of one; nothing left selected                 | untested · p244                                      |
| —   | a run after options: Jointype kept; the fuzz               | untested · p204; differs PED-03 · p204               |
| —   | 3D Break, Straighten; Multiple of 3D ones                  | untested · p245, p246; known · p40, p249 (PEDIT-D29) |
| O   | Multiple's order; tangent between straight runs; a closed three; END on the curve | untested · p202, p203, p208, p214, p215 |
| O   | Extend of an arc end                                       | differs PED-04 · p207                                |
| O   | JOIN of a Fit polyline                                     | differs PED-05 · p213                                |
| O   | Reverse's tangent                                          | differs PED-06 · p209, p252                          |
| O   | Break from the first vertex                                | differs PED-07 · p210                                |
| O   | EXTEND of a fitted one                                     | differs PED-08 · p211, p212                          |
| K   | sweep `--from`, es and pt-BR; console-pair pt-BR           | match but PED-09                                     |
| L   | a two-line prompt written on one line                      | owned (LINE review) · drawing.test.ts:3735           |
| N   | tests                                                      | PED-10                                               |

### SPE — SPLINEDIT

| Row | Cell                                                       | State                                                |
| --- | ---------------------------------------------------------- | ---------------------------------------------------- |
| A   | names in three languages; repeat; rail echo                | match · p101, p102; untested · p100                  |
| A   | `'SPLINEDIT` refused                                       | known · k146                                         |
| A   | double-click on a spline                                   | differs SPE-01 · DoubleClickRoot.cui                 |
| B   | refusals at every prompt; English `E` at Fit data          | untested · p133–p140, p155                           |
| B   | global `_E` at Fit data in Spanish                         | differs SPE-13 · p139                                |
| B   | the precision's refusals (both commands)                   | match · p141, p150, p151 · splinedit.test.ts:673     |
| B   | the precision kept and shared (SWO-01)                     | differs SPE-04 · p148, p152, p159, p163              |
| B   | Elevate order's default                                    | untested · p149                                      |
| B   | a Fit polyline at `Select spline:`                         | untested · p103 (was **unverified**)                 |
| B   | own knots' Close, Open, Reverse                            | untested · p104, p105, p109 (were **unverified**)    |
| B   | own knots' Add and Delete on a closed one                  | differs SPE-07 · p106, p107                          |
| B   | Delete on a closed one: its floor, its knot                | differs SPE-05, SPE-06 · p107, p108, p153, p154, p156 |
| B   | Select point's miss                                        | differs SPE-11 · p110, p160                          |
| B   | closed walks: Previous at the first; CV Next at the last   | untested · p111, p161                                |
| B   | a closed fit spline's walk                                 | differs SPE-08 · p112                                |
| B   | Undo at `[After/Before]`                                   | differs SPE-12 · p113                                |
| C   | `@`, a number, `*`, polar at Move; `@` at Add              | untested · p114, p115, p118, p119, p166              |
| C   | a typed Z at Move                                          | differs SPE-09 · p120                                |
| D   | `_END`, ORTHOMODE at Move                                  | untested · p116, p117                                |
| E   | transparent commands at eight prompts                      | untested · p121–p129                                 |
| F   | U, REDO, MREDO, UNDO 2, U after nothing                    | untested · p130–p132                                 |
| G   | a command typed at a prompt                                | untested · p136, p137                                |
| H   | convert to Polyline: properties, a level plane             | untested · p142, p144                                |
| H   | convert to Polyline in a tilted plane (PEDIT's too)        | differs SPE-10 · p143, p157, p164                    |
| —   | preselection: two splines; a line; nothing left            | differs SPE-02, SPE-03 · p145, p146, p158; untested · p147 |
| —   | a spline-fit 3D polyline                                   | untested · p165                                      |
| K   | sweep, pt-BR, console-pair                                 | match · p141 pt-BR; labels differ SPE-14             |
| L   | history                                                    | match                                                |
| N   | tests                                                      | SPE-15                                               |

## 5. Findings

### High

#### PED-01 — `@dx,dy` at Edit vertex's Move and Insert is read from LASTPOINT, not from the X

- **Severity:** high · **Row:** C · **Status:** verified (reviewer: p227's dump)
- **Where:** `PolylineEditTool.ts`, the Move and Insert answers.
- **AutoCAD:** p227: the X on (10,0), LASTPOINT elsewhere (`_ID 100,100`, the pick 5,0), `@5,5` →
  the vertex at (15,5); the trace `"BasePoint":[10,0,0],"UseBasePoint":true,"UseDashedLine":false`.
  p251: Insert `@0,5` from the X on (20,0) → (20,5). LASTPOINT is the pick through Edit vertex
  (p250) and the point given after Move (p301).
- **mellowcad:** (10,5): `@` from the pick.
- **Fix:** the X's vertex (its Z on a 3D polyline) is the base of a relative point at both
  prompts (PEDIT-D20). **Regression test:** pedit.test.ts, p227 and p251. **Coverage:** PEDIT's
  Edit vertex.

### Medium

#### TPL-01 — 3DPOLY's Undo takes back a transparent command run after the segment

- **Severity:** medium · **Row:** E, F · **Status:** verified (reviewer: p117 en)
- **Where:** `Polyline3dTool.ts` (the `marks` and `ctx.undoTo`).
- **AutoCAD:** p112, p117: `'_LTSCALE 2` then `_U` → `(getvar "LTSCALE")` `2.0`; `Regenerating
  model.` after the Undo's prompt.
- **mellowcad:** LTSCALE back to 1. PLINE's does take it back (pline/p26).
- **Fix:** drop the marks; the Undo steps back the vertex alone (PEDIT-D11). **Regression test:**
  polyline3d.test.ts, p112, p117. **Rules:** `cad-tools.md`'s Undo bullet names 3DPOLY's as the
  exception.

#### TPO-01 — A 3D polyline is drawn with its linetype; AutoCAD draws it continuous

- **Severity:** medium · **Row:** M · **Status:** verified (reviewer: p122.png)
- **Where:** `SceneBuilder.ts`, the 3D polyline's segments.
- **AutoCAD:** p118, p122 (plots, en): a DASHED 3D polyline continuous between a dashed LINE and
  a dashed PLINE, PLINEGEN 0 and 1; p123: the object keeps `DASHED`.
- **mellowcad:** each segment dashed.
- **Fix:** drawn continuous; the stored linetype and its palette row stay (PEDIT-D10). The screen
  is PSD's. **Coverage:** draw.md's "its linetype is laid per segment (**unverified**)".

#### LPT-01 — SPLINEDIT's point prompts leave LASTPOINT where AutoCAD does not

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `SplineEditTool.ts`: its point steps refuse with `pointOrKeywordRequired`, so the
  runtime does not read them as points, and there is no `setsLastPoint()`.
- **AutoCAD:** fit and vertex Move → the point moved to (p321, p325); fit Add's new point → it
  (p329), Enter there → the existing point (p338); Tangents → the end fit point (p323, p330,
  p334); vertex Add, vertex Delete, fit Delete → unchanged (p324, p331, p337). `F M 10,10 @5,0`
  lands at 15,10 (p335, p336).
- **mellowcad:** unchanged at Move, Add and Tangents; set at the Adds and Deletes.
- **Fix:** `setsLastPoint()` per step as above, `ctx.setLastPoint` at Tangents' end (PEDIT-D13).
  **Regression test:** splinedit.test.ts, a case per prompt, p335, p336.

#### LPT-02 — PEDIT's Width and Edit vertex's Width and Tangent take no point

- **Severity:** medium · **Row:** B, C · **Status:** verified
- **Where:** `PolylineEditTool.ts`: `wantsSnap()` is true there but the pointer and typed points
  are not taken.
- **AutoCAD:** p305: Width `10,10` → ` Specify second point:` `13,14` → width 5, LASTPOINT kept;
  p303: Edit vertex's Width measures from the X (`10,10` → `<14.1421>`); p304: Tangent a
  direction from the X; LASTPOINT on the X after both (p303, p304, p333).
- **mellowcad:** a typed point asked again in silence; a click does nothing.
- **Fix:** `wantsSnap()` false at the three, so the runtime measures (from the X; Width its own
  second point), LASTPOINT on the X after Edit vertex's two (PEDIT-D12). **Regression test:**
  pedit.test.ts; :256's title claims a point it does not test.

#### LPT-03 — A locked object at `Select polyline` or `Select spline:` is not said

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** the `one` options of both tools' `ObjectSelector`.
- **AutoCAD:** PEDIT `The object is on a locked layer.` (es `El objeto está en una capa
  bloqueada.`) and the prompt again (p307); SPLINEDIT `1 was on a locked layer.` (es `1 estaba en
  una capa bloqueada.`) and the prompt again (p328).
- **mellowcad:** PEDIT silent; SPLINEDIT starts a window.
- **Fix:** `locked` as CRP-01 gave it (catalog keys `objectOnLockedLayer`, `onLockedLayer`).

#### PED-02 — Multiple with an empty set ends PEDIT

- **Severity:** medium · **Row:** G · **Status:** verified
- **AutoCAD:** p201: Enter at Multiple's `Select objects:` → `Select polyline or [Multiple]:`.
- **mellowcad:** `Command:`.
- **Fix:** back to the first prompt in silence (PEDIT-D21).

#### PED-03 — Multiple Join's fuzz distance is not kept

- **Severity:** medium · **Row:** B (a run after options) · **Status:** verified
- **AutoCAD:** p204: after 5, the next run asks `<5.0000>`, after OPEN too: program-wide, as
  Jointype.
- **mellowcad:** `<0.0000>` each run.
- **Fix:** a session field beside Jointype (PEDIT-D22). **Coverage:** both kept for the session.

#### PED-04 — Extend never grows an arc end segment

- **Severity:** medium · **Row:** O · **Status:** verified
- **AutoCAD:** p207: an arc end (10,0)→(15,5) and a line (12,9)→(2,9), Extend, fuzz 6 → the arc
  grown on its circle to (13,9), bulge 0.7207592200561265, the line from (13,9): `2 segments added
  to polyline`.
- **mellowcad:** `0 segments added to polyline`.
- **Fix:** an arc end meets a straight end's line on its circle within the fuzz; arc with arc
  stays in Missing, **unverified** (PEDIT-D23).

#### PED-05 — JOIN of a Fit polyline keeps it and joins its frame

- **Severity:** medium · **Row:** O (JOIN, Pieces review's area) · **Status:** verified
- **AutoCAD:** p213: a fitted polyline and a line → `2 objects converted to 1 polyline`, both
  erased, a new polyline of the curve's vertices and bulges plus the line.
- **mellowcad:** `1 segment joined into 1 polyline`, the frame grown, unfitted.
- **Fix:** a fitted polyline joins as its `polylineCurve`, into a new object (PEDIT-D24); a
  spline-fit one unprobed (Missing).

#### SPE-01 — A double-click on a spline does nothing

- **Severity:** medium · **Row:** A · **Status:** verified
- **Where:** `CadRuntime.doubleClick`.
- **AutoCAD:** acad.cuix DoubleClickRoot.cui `DC_0012`: SPLINE → `ID_Splinedit`,
  `^C^C^R_splinedit `.
- **Fix:** a spline branch starting `_splinedit` on it, at its main prompt (PEDIT-D44); `^R`'s echo
  is PSD's.

#### SPE-02 — Two splines selected before SPLINEDIT: AutoCAD edits the newer at once

- **Severity:** medium · **Row:** preselection · **Status:** verified (reviewer: p145 en)
- **AutoCAD:** p145 at the main prompt at once; p158 closes the newer.
- **mellowcad:** `Select spline:`.
- **Fix:** the newest spline of the set (PEDIT-D42).

#### SPE-04 — The conversion's precision is not kept; AutoCAD keeps it, shared by both commands

- **Severity:** medium · **Row:** B (SWO-01) · **Status:** verified
- **AutoCAD:** p148: `<5>` after 5; p152: PEDIT's answer is SPLINEDIT's next default and its own;
  p159, p163: kept through OPEN, not saved.
- **mellowcad:** `<10>` each time.
- **Fix:** one program-wide value both tools read (PEDIT-D40); whether U restores it unprobed.

#### SPE-05 — Delete on a closed spline goes below three

- **Severity:** medium · **Status:** verified
- **AutoCAD:** `Cannot delete beyond this.` at three, back at Fit data's or Edit vertex's prompt
  (p107, p108, p153, p154, p156).
- **mellowcad:** nothing said at three; down to two.
- **Fix:** the floor is three on a closed spline.

#### SPE-06 — Delete on a closed CV spline drops the wrong knot

- **Severity:** medium · **Status:** verified (the entry's **unverified** mark)
- **AutoCAD:** p108: knots [0,1,3,4]; p153: [0,1,4,5].
- **mellowcad:** [0,2,3,4]; [0,2,3,5].
- **Fix:** the periodic case of `controlVertexDeleted` fitted to both probes.

#### SPE-07 — Add and Delete on a closed spline's own knots make them chord

- **Severity:** medium · **Status:** verified
- **AutoCAD:** uniform own knots stay Uniform: 0..5 after Add (p106), 0..3 after Delete (p107).
- **mellowcad:** chord; the curve up to 3 units off.
- **Fix:** keep Uniform; non-uniform own knots stay **unverified** (Missing).

#### SPE-08 — A closed fit spline's Move walk ends a point early

- **Severity:** medium · **Status:** verified
- **AutoCAD:** p112: four fit points, a fourth Next reaches the closing point, `<P>`, and moving it
  moves the first; Previous at the first stays (p111); a closed CV spline stops at its last
  vertex (p161).
- **mellowcad:** `<P>` at the fourth point already.
- **Fix:** n + 1 stops on a closed fit spline, the last the first (PEDIT-D41).

#### SPE-09 — A Z typed at Edit vertex's Move is dropped

- **Severity:** medium · **Status:** verified
- **AutoCAD:** p120: `1,2,7` → the vertex (1,2,7).
- **mellowcad:** (1,2,0) (`onPlane`).
- **Fix:** keep the Z (the spline leaves its plane); Fit data's Move and Add and vertex Add go
  through the same path, unprobed: the fix probes one before changing them.

#### SPE-10 — convert to Polyline of a tilted spline makes a 2D polyline; AutoCAD a 3D one

- **Severity:** medium · **Status:** verified (reviewer: p143 en, PolyType SimplePoly)
- **Where:** `splineEditing.ts` (`isLevelSpline`).
- **AutoCAD:** p143, p157 (in the tilted UCS), p164 (PEDIT): a 3D polyline; p144: a plane
  parallel to XY gives a 2D one at its elevation.
- **Fix:** a 2D polyline only for a normal of ±Z (PEDIT-D43). **Coverage:** both entries' "in its
  plane".

### Low

- **TPL-02** — Under UNDO Control None 3DPOLY's Undo keeps the vertex; AutoCAD steps back (p125).
  Fix: drop the guard copied from PLINE (pline/p42).
- **TPL-04** — polyline3d.test.ts: :59 asserts a doubled last line through an odd `concat`; :133
  claims the pick's elevation without a probe; the untested cells above become its tests.
- **TPO-02** — `Polyline3dTool.getConstraintAnchor()` typed `Vec2` while it returns the vertex's
  Z (`cad-tools.md`: the anchor keeps its Z); behaviour right (Ortho off the plan, scratch).
- **TPO-03** — tests: ROTATE, SCALE, MIRROR (p124) and the plots' linetype (p122).
- **LPT-04** — A click that picks the polyline or spline leaves LASTPOINT; a typed pick sets it
  (p300, p320), a click the cursor's point on the work plane (VSD-04, SED-06).
- **LPT-05** — An override typed at the pick leaves LASTPOINT on the typed point; AutoCAD the
  snapped one (p306, p327).
- **PED-06** — Reverse turns a given tangent half round; AutoCAD resets it to 0 (p209, p252).
- **PED-07** — Break from a fitted polyline's first vertex leaves the rest fitted; AutoCAD a
  polyline of its curve's vertices from the X (p210).
- **PED-08** — EXTEND of a spline-fit polyline says `Object does not intersect an edge.`; AutoCAD
  `Path does not intersect with the bounding edge.` (p212). A Fit one's arc grown off the edge
  (p211) goes to Missing (PEDIT-D27).
- **PED-09** — pt-BR: the 3D prompt `Insira uma opção […/curva Spline/…]` (p09, p39), the fuzz's
  `[Tipounião]` and Jointype's `<aMbos>` (p12, p205) (PEDIT-D28).
- **PED-10** — pedit.test.ts's header cites p01–p146 (p199 now); the untested cells become tests.
- **SPE-03** — A non-spline selected before it is dropped in silence; AutoCAD says `Object
  selected is not a spline.` and asks (p146).
- **SPE-11** — Select point finding nothing: `Not a fit point.` (p110), `Not a control vertex.`
  (p160), and the prompt again; silent here.
- **SPE-12** — Undo at `[After/Before]`: `All the additions are undone.` (22391) and `Specify new
  fit point to add <exit>:` (p113); nothing here. A new message in every language.
- **SPE-13** — Spanish `_E` at Fit data is eXit (global `EXit`, p139); refused here.
- **SPE-14** — pt-BR: the open main prompt lists `REverter`, the closed one `Reverter` (p102,
  p108, p110); After/Before listed `[Antes/Depois]` (p113).
- **SPE-15** — the entry's settled **unverified** marks (p103–p105, p109, p111, p161), the stale
  WHY at `addWhere`, splinedit.test.ts:687's 800–950 range, and tests for the untested cells.

### Unverified

- **TPL-03** — 3DPOLY's jig: AutoCAD's endpoint prompt has a dashed band from its base (p116's
  trace) and appends the polyline at its start (p01's), so the chain on the screen is the object;
  here one solid ghost. Medium if the desktop confirms it (PSD).

## 6. Decisions

- **PEDIT-D10** TPO-01 changes the drawing only; the linetype stays on the object (p123).
- **PEDIT-D11** TPL-01 drops the per-segment marks: no transparent change goes back (p117).
- **PEDIT-D12** LPT-02: the runtime measures (`wantsSnap()` false), the shared mechanism.
- **PEDIT-D13** LPT-01: LASTPOINT per step as the probes give it.
- **PEDIT-D14** `<a` stays honoured at 3DPOLY's points: the console ignores it (p104), the
  desktop honours it elsewhere (rectang/d03).
- **PEDIT-D15** M2P stays a known gap.
- **PEDIT-D20** PED-01: the X is the base of `@` at Move and Insert.
- **PEDIT-D21** PED-02: an empty Multiple set returns to the first prompt.
- **PEDIT-D22** PED-03: the fuzz is a session value beside Jointype.
- **PEDIT-D23** PED-04: arc with line only.
- **PEDIT-D24** PED-05: a fitted source joins as its curve, a new object.
- **PEDIT-D25** PED-06: Reverse sets a given tangent to 0.
- **PEDIT-D26** PED-07: an empty piece from the start leaves the rest a polyline of its curve.
- **PEDIT-D27** PED-08: the spline-fit refusal's words; Fit's grown arc to Missing.
- **PEDIT-D28** PED-09's pt-BR words.
- **PEDIT-D29** Multiple of 3D polylines alone stays in Missing, its effects now probed (p249).
- **PEDIT-D40** SPE-04: one program-wide precision for both commands.
- **PEDIT-D41** SPE-08: n + 1 stops on a closed fit spline.
- **PEDIT-D42** SPE-02: the newest spline of a preselection.
- **PEDIT-D43** SPE-10: a 2D polyline only for a normal of ±Z, in both commands.
- **PEDIT-D44** SPE-01: a double-click on a spline runs `_splinedit` on it.

## 7. Tests proposed

The regression tests are in each finding. Then, by file, the untested cells: polyline3d.test.ts
(3dpoly/p100–p126), pedit.test.ts and peditFit.test.ts (p200–p253: refusals, transparency, undo,
the UCS, Multiple's order, p208, p214, p215), splinedit.test.ts (splinedit/p100–p166). Each comes
from the review's scratch tests and keeps its probe's citation. No `acc/…` citation is left in the
inventory.

## 8. What is not tested and why

The 3D polyline's linetype on the screen (TPO-01) is the scene's: a scene test reads the dash of
its primitives, the pixels are PSD's. Escape, the right button, the jigs, the X, the rollovers and
dynamic input are the desktop's (PSD).

## 9. What could not be reviewed and why

The desktop cells (block PSD): 3DPOLY's jig and Escape, a click on the last vertex, dynamic input's
boxes; the X's look, Move's and Insert's bands, Escape inside Edit vertex, the rollover at
`Select polyline`; SPLINEDIT's look at each prompt (the glow, the grips, the hot grip, the band),
`^R`'s echo; the 3D polyline's grips' hover menus and a fitted polyline's grips and palette
(Missing). The console could not make a closed spline on non-uniform knots of its own; whether U
restores the precision; a tilted arc converted by PEDIT on the harness side (p242).

## 10. Refuted

- `'ZOOM _E`'s `** Requires a regen, cannot be transparent.` at 3DPOLY (p111): the console's.
- MID just past a Fit joint (p215): a tie inside the aperture at the joint, kept out of tests.
- A preselection's `@` at SPLINEDIT Add (p166) and Tangents' typed point (k66): both match.
- p142's linetype scale: no object linetype scale is modelled; p165: the same frame.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim                                                                  | State                         |
| ---------------------------------------------------------------------- | ----------------------------- |
| 3DPOLY: "its linetype is laid per segment" (**unverified**)            | false · TPO-01                |
| 3DPOLY: "The jig draws the chain and the next segment in its colour"   | no probe · TPL-03             |
| PEDIT: Width "a value or two points"                                   | false · LPT-02                |
| PEDIT: Jointype "kept for the session"                                 | holds; the fuzz too · PED-03  |
| PEDIT: the **unverified** marks                                        | settled · p200–p215           |
| SPLINEDIT: Delete "down to two vertices"                               | false on a closed one · SPE-05 |
| SPLINEDIT: convert to Polyline "in its plane"                          | false when tilted · SPE-10    |
| SPLINEDIT: the **unverified** marks                                    | settled · p103–p113, p161     |
| `cad-tools.md`: a transparent command run since a step goes back with it | holds for PLINE; not 3DPOLY · TPL-01 |
| `cad-tools.md`: the anchor keeps its Z                                 | type only · TPO-02            |
| `cad-tools.md`: LASTPOINT set after every answer whose question takes a point | broken in SPLINEDIT · LPT-01 |
| `cad-tools.md`: a single object's pick says a locked one (CRP-01)      | broken in both · LPT-03       |

Checked and holding: preselection of one (PEDIT, SPLINEDIT); nothing left selected; one undo step
per run and its echo; the 3D polyline's WCS vertices and no plane (`cad-engine.md`); a fitted
polyline's frame and curve; carryOverrides on conversion; `currentProperties.test.ts`' rows.

## 12. Order of execution and estimate

1. **TPL** (small): TPL-01, TPL-02, TPL-04.
2. **TPO** (small): TPO-01 to TPO-03.
3. **SPE** (large): SPE-01 to SPE-15; SPE-04 and SPE-10 touch PEDIT's prompts too.
4. **PED** (large): PED-01 to PED-10; PED-05 in JoinTool, PED-08 in the TRIM/EXTEND path.
5. **LPT** (medium): LPT-01 to LPT-05, last, over the point prompts the blocks before left.
6. **PSD** (desktop, the owner's mouse): a later session; TPL-03 settled there.

## 13. Changes to coverage, rules, catalogs and roadmap

- **Coverage:** draw.md's 3DPOLY (TPO-01, TPL-01, TPL-02, the jig **unverified**); modify.md's
  PEDIT (PED-01 to PED-09, LPT-02, LPT-03, the settled marks, Missing's new lines) and SPLINEDIT
  (SPE-01 to SPE-14, LPT-01, LPT-03, the settled marks); pieces' JOIN and TRIM / EXTEND for PED-05
  and PED-08.
- **Rules:** `cad-tools.md` (TPL-01's exception to the Undo bullet).
- **Catalogs:** SPE-12's message in every language; PED-09's and SPE-14's pt-BR words.
- **Roadmap:** review 31 `plan`, then `done` owning the 3D polyline object.

## 14. Template improvements proposed

- **matrix.md C:** a point typed and clicked at every prompt that takes one, a value prompt that
  also takes two points included (LPT-02 was in the entry as implemented).
- **annex-probes.md §2:** a traced `BasePoint` at a later prompt is the base of `@`: probe `@dx,dy`
  there after an `_ID` elsewhere (PED-01).
- **template §4.1:** read DoubleClickRoot.cui with the other roots, for each object type the review
  touches (SPE-01).
- **annex-probes.md §2:** an object's linetype is plotted beside a LINE of the same linetype as
  its control (TPO-01).

## 15. Execution

| Id               | What it was                                                                   | Commit   |
| ---------------- | ----------------------------------------------------------------------------- | -------- |
| TPL-01           | 3DPOLY's Undo took back a transparent command run since                       | 8609726e |
| TPL-02           | its Undo stopped under UNDO Control None                                      | 8609726e |
| TPL-04           | tests (p100–p126)                                                             | 8609726e |
| TPO-01           | a 3D polyline drawn with its linetype                                         | 4b468230 |
| TPO-02, TPO-03   | the anchor's type; ROTATE, SCALE, MIRROR tests                                | 4b468230 |
| SPE-01           | no double-click on a spline                                                   | 9727b8f1 |
| SPE-02, SPE-03   | a preselection of several splines, or of none                                 | 9727b8f1 |
| SPE-04           | the conversion's precision not kept nor shared                                | 9727b8f1 |
| SPE-05 to SPE-08 | a closed spline's Delete floor and knot, own knots, the walk                  | 9727b8f1 |
| SPE-09           | a Z typed at Edit vertex's Move (Fit data's **unverified**)                   | 9727b8f1 |
| SPE-10           | a tilted spline converted to a 2D polyline                                    | 9727b8f1 |
| SPE-11 to SPE-15 | the misses' words, After/Before's Undo, Spanish `_E`, pt-BR labels, tests     | 9727b8f1 |
| PED-01           | `@` at Move and Insert from LASTPOINT                                         | 601379bd |
| PED-02 to PED-04 | Multiple's empty set, the fuzz kept, an arc end's Extend                      | 601379bd |
| PED-05           | JOIN of a Fit polyline                                                        | 601379bd |
| PED-06 to PED-10 | Reverse's tangent, Break's empty piece, EXTEND's words, pt-BR, tests          | 601379bd |
| LPT-01 to LPT-05 | LASTPOINT at SPLINEDIT's prompts; Width's points; locked picks; picks' points | b1a995e0 |

- **SPE-14 in part:** pt-BR lists After/Before `[Antes/Depois]`; the catalog has no per-language
  order of a prompt's keywords, so the order stays English's (pt-BR.md's deviations, Missing).
- **SPE-04** became one object `CadRuntime` hands both tools (`defaultTools` takes SPLINEDIT's);
  whether U restores the precision is unprobed (Missing).
- **LPT-03** gave both picks' modes the locked refusal too (`lockedAsksAgain`): **unverified** for a
  window, in the coverage.
- **For PSD's session, first:** Multiple Join's fuzz keeps `wantsSnap()` true as Width did before
  LPT-02; its refusal words name two points (pedit/p12), so a point there is probably refused here
  as Width's was: a console probe and a test settle it before the desktop.
- The template improvements of §14 are applied in matrix.md's A, C and M rows (template.md's and
  annex-probes.md's budgets are full).
