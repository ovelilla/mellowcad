# Sweeps review (EXTRUDE, REVOLVE, PRESSPULL)

> **Status:** plan, 2026-11-03. Group 1, the console blocks EXT, RVL, PPL and SWO, probed and
> reviewed in one session; its execution follows in the same session, one commit per block
> (§12). Group 2, the desktop block SWD (grips, palette, isolines with RGD-02's series, the jigs,
> PRESSPULL's clicks), needs the owner's mouse and goes in a later session (§13).
>
> This review owns the profiles a sweep takes (their kinds, sift and base), the swept solid
> (its faces, history, LIST, transforms, EXPLODE, file) and PRESSPULL's bounded areas. It cites:
>
> - the LINE review (object snaps, point input, the command line, undo, transparency);
> - ERASE's (`Select objects:`, preselection), Workspace's (the rail's macros);
> - the 3D primitives review (the solid object, its snaps, isolines and file;
>   `docs/plans/primitives-review.md`), whose LASTPOINT rule (PLP) it applies to the sweeps;
> - the Regions review (the booleans, a composite's grip, RGD-02; `docs/plans/regions-review.md`);
> - View's (`'ZOOM` that needs a regen), LIST's (review 32) and MASSPROP's (review 30).

## 1. Summary

**Findings:** 0 critical, 5 high, 21 medium, 15 low.

| Block | What                                               | Critical | High | Medium | Low |
| ----- | -------------------------------------------------- | -------- | ---- | ------ | --- |
| EXT   | EXTRUDE                                            | 0        | 1    | 5      | 4   |
| RVL   | REVOLVE                                            | 0        | 2    | 6      | 3   |
| SLP   | LASTPOINT in the three (executed with EXT and RVL) | 0        | 0    | 2      | 1   |
| PPL   | PRESSPULL, its console cells                       | 0        | 0    | 3      | 3   |
| SWO   | the swept solid as an object                       | 0        | 1    | 5      | 4   |

The worst:

- **EXTRUDE measured a picked height from the wrong point.** AutoCAD's base is the mean of 20
  points spaced by arc length round a polyline, of 19 by parameter round a spline, and a region's
  centroid. mellowcad took the middle of the box (EXT-01; p101–p107, x04, x09).
- **EXTRUDE tapered every run after a tapered one.** AutoCAD offers the last taper as Taper
  angle's default and applies it only when that option is answered (SWO-01; p335, p336).
- **REVOLVE's Object axis ran from the line's start, and along the nearest segment of a
  polyline.** AutoCAD takes the chord between the object's two ends, from the end nearer the pick
  (RVL-03; p233–p237, p265–p267). **Its X, Y and Z were the WCS's**, where AutoCAD's are the UCS's,
  through its origin (RVL-04; p205, p211, p224).

**Evidence:**

- 176 console probes in es-ES and en-US, pt-BR where its words are asked: `sweeps/p100–p169`,
  `p200–p267`, `p300–p336`, `p400`, `p401`.
- The earlier 2027 probes, rerun on the same build today: `extrude/x01–x12`, `i1–i9`,
  `revolve/r01–r09`, `presspull/p01`.
- `acad.cuix`'s MenuGroup and RibbonRoot (Home > Modeling) and each language's `acad.pgp`.
- The tables of 2026-10-31. AutoCAD 2027, ACADVER 26.0, X.118.0.0 (p100). Tree at e6951e03.

## 2. Inventory

- **Tools:** `cad/application/tools/ExtrudeTool.ts`, `RevolveTool.ts`, `PresspullTool.ts`,
  `sweepSettings.ts`, `heightPick.ts`; `objectSelection.ts` as they use it; registration in
  `runtimeTools.ts` (one `SweepSettings` shared by EXTRUDE and REVOLVE) and `CommandLine.ts`.
- **The object:**
  - `cad/geometry/sweeps.ts` (`extrusionBrep`, `revolutionBrep`, `revolveSide`),
    `faceDomains.ts` (the swept faces' isolines), `solids.ts`, `massProperties.ts`;
  - `cad/domain/sweptSolids.ts` (`sweepProfile`, `createSweptSolid`, `sweepMapped`),
    `solidModeling.ts` (`pressPulledSolid`), `solids.ts` (`solidFaceRegions`), `boundary.ts`;
  - `cad/application/tools/listReport.ts`, `EngineState.ts` (the palette's rows), `selectToolGrips.ts`,
    `clipboard.ts`, `ExplodeTool`;
  - `cad/serialization/drawingFile.ts` (version 47's history).
- **Catalogs:** the names; `extrude*`, `revolve*`, `presspull*`, `sweep*`, `closedProfiles*`,
  `direction*`, `enterExpression`, `eraseDefiningObjects`, `taperAngleRange`, `expressionSyntax`,
  `list*` of the history; en, es, pt-BR.
- **The UI:** the rail's Modeling group (`packages/editor/src/tool-rail.tsx`: EXTRUDE's drop-down
  with REVOLVE, PRESSPULL beside it); the landing's `content/commands.ts` (Draw); the ribbon's
  macros `^C^C^R_extrude _MO _SO;`, `^C^C^R_revolve _MO _SO;`, `^C^C_presspull` (acad.cuix
  `ID_Extrude`, `ID_Revolve`, `ID_Presspull`, Home > Modeling).
- **Tests:** `cad/application/solidSweeps.test.ts`, `solidHeights.test.ts`;
  `cad/geometry/sweeps.test.ts`, `faceRegions.test.ts`; the three rows of
  `tools/currentProperties.test.ts`; `englishSurface.txt`.
- **Knowledge:** `docs/coverage/draw.md` EXTRUDE, REVOLVE, PRESSPULL; the rules `cad-tools.md`,
  `cad-catalogs.md`, `cad-engine.md`, `cad-runtime.md`, `testing.md`.

The names match each language's `acad.pgp` (en `EXT`, `REV`; es `EXT`, `RV`, `PULSARTIRAR`; pt-BR
`EX`, `REV`); no alias is another command's name. No `acc/…` citation is left in the inventory.
The catalog sweep (`--from` the three tools) leaves no `lang-2027` or `en-2027`; its
`lang-differs` and `lang-several` keys were settled by the console (row K below).

Shared contracts swept by subagent A for all three tools: LASTPOINT and `typedPick` (SLP).

## 3. Probes (`scripts/research/probes/sweeps/`)

| Ids       | What they ask                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| p100      | ACADVER, a rectangle extruded                                                                                                         |
| p101–p107 | the height's base: an L, a triangle, a region, rectangles both ways, after a ZOOM, a picked height                                    |
| p108–p127 | LASTPOINT at every prompt of EXTRUDE, REVOLVE and PRESSPULL                                                                           |
| p128–p141 | defaults, a negative height, taper by Expression, Enter at Expression, Direction's refusals, `'ZOOM`, U, REDO, UNDO 2                 |
| p143–p169 | ELEVATION, UCS Z 30 and X 90, the sift (self-intersecting, mixes), DELOBJ, OPEN, MOde, LASTPOINT's base, names, `'EXTRUDE`, `_.`      |
| p200–p226 | REVOLVE's names, MOde, axis points and their forms, UCS Z 30 and origin, X/Y/Z, `'ZOOM`, U, REDO, Enter at each prompt, a command typed |
| p227–p252 | a typed point at the angles; the Object axis on lines, polylines, arcs, splines, rays; windows; self-intersecting; preselection; pt-BR |
| p253–p263 | PRESSPULL's names, `'PRESSPULL`, Multiple, Enter, typed points, `'ZOOM`, U, preselection, bare numbers                                 |
| p264–p267 | REVOLVE's U, the Object axis picked near an end, by distance                                                                          |
| p300–p309 | the B-rep against MPDUMP: bulged and wide polylines, an ellipse, an elliptical loop, a CV spline, grips (MPGRIPDATA), several faces    |
| p310–p320 | the history through MOVE, ROTATE, SCALE, MIRROR, booleans, SOLIDEDIT; EXPLODE of planar and curved sweeps                             |
| p321–p336 | snaps on the new edges; save and open; order of several profiles; UCS X 90; Direction vector's LIST; es/pt-BR LIST; merges; a taper's next run |
| p400–p401 | the ribbon's macros for EXTRUDE and REVOLVE                                                                                           |

The transcripts are in `research/probes/sweeps/` (gitignored). p142, p146's tail and p152 settle
nothing (a slip, two coincident ends); p324 counts in es-ES only (p334 reruns it per language).
The scratch tests are in `research/review/sweeps/{a,b,c,r}/`.

## 4. Matrix

A row the same at every prompt takes one cell. `SS` is `cad/application/solidSweeps.test.ts`.

### EXT (EXTRUDE)

Columns: Select objects to extrude or [MOde]; Closed profiles creation mode; height (with and
without default); taper; Enter expression; Direction's start and end; Erase defining objects.

| Row | Cell                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------- |
| A   | names en/es/pt-BR, `_`: match · x01, x02 · SS:50; repeat: untested · p169; `'EXTRUDE`: untested · p168; `_.`: known        |
| A   | the rail's button: differs EXT-10 (p400)                                                                                   |
| B   | Select: FOO, the sift, Enter, a preselection (`2 found`): match/untested · x10, x11, p141, p148 · SS:154                   |
| B   | the sift of a self-intersecting profile: differs EXT-04                                                                    |
| B   | MOde: Enter, FOO, SOlid, capitals, its own line: match · x02, p150, p165                                                   |
| B   | height: FOO, 0, Enter: match · x01, x03 · SS:50, :117; Enter with a default: untested · p128; negative: differs EXT-06      |
| B   | taper: Enter, FOO, range, Expression: match/untested · x01, x06, p130 · SS:80                                              |
| B   | Expression: a refused value differs EXT-02; Enter differs EXT-03; 0's words differ EXT-09                                  |
| B   | Direction: FOO and Enter differ EXT-05; coincident, parallel: match · x02, x11 · SS:136                                    |
| B   | Erase: FOO, Enter, `<No>`: match · x07 · SS:44                                                                             |
| C   | height by a point in plan: differs EXT-01; `@3,4`, `*53,4` in UCS Z 30, `x,y,z` off the plan: untested · p154, p155, p163  |
| C   | taper by a point: differs EXT-08 (unverified rule, desktop)                                                                |
| C   | Direction's end typed at the command line is absolute: untested · p113; a bare number: untested · p156                     |
| C   | LASTPOINT: differs SLP-01                                                                                                  |
| D   | owned (LINE, OSN): p152, p153 settle nothing new                                                                           |
| E   | `'ZOOM W`, `'ORTHOMODE`: owned, contract match · p137, p166; `'ZOOM E` refused for a regen: owned (View) · p137           |
| F   | U, REDO, UNDO 2, an empty run, U after DELOBJ: untested · p138–p141                                                        |
| G   | Enter at each prompt: in row B; Escape, the right button: desktop (SWD)                                                    |
| H   | layer: match · x10 · SS:61; CECOLOR, CELWEIGHT: untested · p161; CELTYPE: unverified; ELEVATION, THICKNESS ignored: untested · p143 |
| H   | several profiles, the first picked giving the base: untested · p106; DELOBJ −2, 2: untested · p147                         |
| H   | a run after a tapered one: differs SWO-01                                                                                  |
| J   | DELOBJ program-wide: match · p149; the height and taper defaults across OPEN: differs EXT-07                               |
| K   | prompts, defaults, MOde's form in es and pt-BR: match · p128, p130, p150; `extrudeValueNonzero` (lang-differs) is the console's for a typed 0 · x03 |
| L   | the history: match where row B does                                                                                        |
| M   | the jig, ghost and rubber band from the base: desktop (SWD)                                                                |
| N   | §7                                                                                                                         |

### RVL (REVOLVE)

Columns: Select objects to revolve or [MOde]; MOde; axis start or [Object/X/Y/Z] <Object>; axis
endpoint; Select an object; angle or [STart angle/Reverse/EXpression] <360>; start angle <0.0>;
Enter expression; Erase defining objects.

| Row | Cell                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------- |
| A   | names en/es/pt-BR: untested · p200–p202; `'REVOLVE` refused: untested · p203; `_.`, `_REV`: known; the rail: differs RVL-11  |
| B   | MOde: FOO, Enter: untested · p204; axis start: FOO, a command, a bare number: untested · r01, p206, p226                      |
| B   | axis endpoint: Enter and keywords differ RVL-06                                                                               |
| B   | angle: FOO, another prompt's keyword, `_R` after STart: untested · p226, p232; 0 or a turn: match · r05, r07 · SS:293         |
| B   | start angle FOO: match · r01 · SS:258; Erase: untested · p252; es and pt-BR capitals: untested · p250, p251                   |
| B   | a profile across or square to the axis: differs RVL-01; self-intersecting: differs RVL-02                                     |
| C   | axis points: `@`, `x,y`, `10<90`, `*x,y` in UCS Z 30: untested · p207–p210; `#30,10` refused: RVL-06 (its words)             |
| C   | a typed point at the angle or start angle: differs RVL-07; LASTPOINT: differs SLP-02                                          |
| D   | `_END`, `_MID` at the axis points: untested · p214                                                                            |
| E   | `'ZOOM E` at the axis start: owned, contract match · p215; at the angle refused for a regen: unverified, desktop (RVL-09)      |
| F   | U, REDO, UNDO 2, an empty run, U after DELOBJ: untested · p216–p219, p264                                                     |
| G   | Enter at the selection, the axis start, `Select an object:`, the start angle, the angle: untested · p200, r01, p221–p223        |
| G   | Enter at Expression: differs RVL-05; a pick on nothing at `Select an object:`: differs RVL-08                                |
| H   | current properties: match · p249 (RVL-10's citation); UCS X 90: untested · p212; UCS Z 30 and a moved origin: differs RVL-04  |
| H   | the Object axis: differs RVL-03; arcs, splines and arc segments by their chord: known → closed by RVL-03 · p236, p237, p266    |
| H   | rays and xlines: n/a (no such objects); a window with one object: untested · p242                                             |
| H   | two profiles in handle order, a region with a hole, preselection taken and none left: untested · p246–p248                    |
| J   | `<360>` and `<0.0>` never change: untested · p223, r02 (RVL-10)                                                               |
| K   | prompts, keywords and refusals: untested · p204–p251; pt-BR's `lang-several` settled: 46200, 24271, 33626 as the catalog       |
| L   | the history: match but the findings                                                                                          |
| M   | the jig's angle round the axis: known (Missing); desktop (SWD)                                                                |

### PPL (PRESSPULL, the console's cells)

Column: Select object or bounded area (and Multiple).

| Row | Cell                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------- |
| A   | names, es `PULSARTIRAR` echoing `PRESIONARTIRAR`, repeat: untested · p253–p255; `'PRESSPULL` refused: untested · p256 |
| B   | FOO: match · p01 · SS:450; `_M` twice: untested · p262; Enter after Multiple with nothing taken: differs PPL-01       |
| B   | a bare number: unverified (the console's cursor), desktop (PPL-03)                                                   |
| C   | a typed point: the console reads it from its fixed cursor (p126, p158, p159, p164): unverified, desktop (SLP-03, PPL-02) |
| E   | `'ZOOM E`: untested · p259                                                                                           |
| F   | U after an empty run names PRESSPULL: untested · p260                                                                |
| H   | a closed object pulled: kept, `1 extrusion(s) created`: differs PPL-06 · p164, p160                                  |
| K   | es and pt-BR words: match · p263                                                                                     |
| L   | the answer against the colon: differs PPL-04                                                                         |
| —   | preselection dropped, none left: untested · p261                                                                     |
| I, M, P, Q | the clicks on faces and areas, the height prompt, Ctrl, the hover, the drag: desktop (SWD)                    |

### SWO (the swept solid)

| Row | Cell                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| H   | bulged and wide polylines, an ellipse, an elliptical loop, a CV and a fit spline, a hole, a 5° slot: match/untested · p300–p304, p307, x04, x08, x09 |
| H   | collinear segments and co-circular arcs: differs SWO-05 · p309, p330, p331                                                  |
| H   | a region of two faces: differs SWO-02 · p306, p332                                                                          |
| H   | a whole turn of an ellipse or spline: volume match, seam edges differ SWO-06 · r04, p308                                    |
| H   | several profiles picked out of order make solids in the order picked: untested · p325; a circle in UCS X 90: untested · p326 |
| L   | `Taper angle: 330`, Direction's height, the Direction vector padded, in a turned and a tilted UCS: match/untested · p310, p327–p329 |
| K   | es and pt-BR history lines: match; the bounding box's words: differs SWO-03                                                 |
| I   | MOVE, ROTATE, SCALE, MIRROR keep the extrusion's history: untested · p310; the revolution's Direction vector: differs SWO-04 |
| O   | UNION, SUBTRACT, SOLIDEDIT and PRESSPULL drop the history: untested · p313, p314                                            |
| O   | EXPLODE of a planar sweep: same regions, other order, SWO-07; of a curved one: refused here (no SURFACE), coverage SWO-08     |
| D   | snaps on spline, ellipse and revolved edges, a cone's apex: owned (SPK), contract match · p321–p323                         |
| J   | AutoCAD's DWG keeps the history; mellowcad's file round trip: match · p324 (es-ES), p334                                    |
| I   | grips: none here; AutoCAD's GripData now known (p305): known, SWO-09; the palette's rows: desktop (SWD)                      |
| M   | isolines per swept face: desktop (SWD, with RGD-02's series)                                                               |
| N   | §7                                                                                                                          |

## 5. Findings

### High

#### EXT-01 — A picked height was measured from the middle of the profile's box

- **Severity:** high · **Row:** C/H · **Status:** verified
- **Where:** `ExtrudeTool.ts:381` (`base()`), its JSDoc; draw.md EXTRUDE ("in plan its distance
  from the middle").
- **AutoCAD:** the height prompt's traced BasePoint, the same in es-ES and en-US:
  - `RECTANG 0,0 10,20` gives `[4.7368421052631575, 9.473684210526317, 0]` (x01; p105 after a
    ZOOM, so not the cursor); `RECTANG 10,20 0,0` gives `[5.263157894736842, 10.526315789473683]`
    (p104): the start vertex counts;
  - an L `[7.421052631578948, 5.078947368421053]` (p101), a triangle (p102), x09's polylines with
    arcs; the same L as a region `[7.5, 5, 0]` (p103); a circle and an ellipse their centres;
    x04's fit spline `[52.21160707146115, 5.464714391301693]`;
  - the rule, fitted to 1e-15: a polyline, the mean of 20 points at arc lengths k·L/19, k = 0…19
    (the start twice); a spline (a circle and an ellipse by symmetry), the mean of 19 points at
    parameters k/19, k = 0…18; a region, its area centroid;
  - p107: a pick at 20,30 makes `Extrusion height: 25.5792`.
- **mellowcad:** scratch `a/extrude.test.ts:80`, `:87`: 25.0000; every polyline, region and spline
  base off (circles pass).
- **Scenario:** a rectangle, EXTRUDE, a click above it in plan → a height AutoCAD would not make.
- **Fix:** SWEEPS-D1. **Regression test:** the scratch cases into SS, citing p101–p107, x04, x09.
- **Coverage, rules or catalogs affected:** draw.md EXTRUDE.

#### SWO-01 — EXTRUDE re-applied the previous run's taper when this run gave none

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `ExtrudeTool.ts:339`, `:522` (`this.settings.taper` read in every run).
- **AutoCAD:** p336 (es-ES, en-US): `_EXTRUDE … _T 10 5`, then `_EXTRUDE _L "" 5` on another
  circle: MASSPROP `Volume: 392.6991` (π·5²·5); p335: LIST `Taper angle: 0`.
- **mellowcad:** scratch `c/taper.test.ts`: 327.5255, `Taper angle: 10`.
- **Scenario:** after one tapered extrusion every later one is tapered.
- **Fix:** SWEEPS-D66. **Regression test:** SS, citing p335, p336.

#### RVL-03 — The Object axis ran from the line's start, and along a polyline's nearest segment

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `RevolveTool.ts:451–500` (`takeAxisObject`).
- **AutoCAD:**
  - p265 (es, en): a line 0,0→0,10 picked at `0,9` → ` Direction vector: X = 0.0000    Y =
    -1.0000`, Z 0 to 20;
  - p233: a polyline 100,0→100,20→130,20 picked at `120,20` → `-0.8321 -0.5547`, the chord of its
    ends from the nearer end; p234 at `100,10` → `0.8321 0.5547`; p235, p267: nearer by straight
    distance, not along the curve;
  - p236, p237, p266: an arc, a spline, an arc segment, each by its chord; r08 (no pick) and p242
    (a window) from the start.
- **mellowcad:** scratch `b/rvl.test.ts:62`, `:72`, `:94`: `Y = 1.0000`, Z −20 to 0; the second
  segment's `X = 1.0000`.
- **Scenario:** REVOLVE, a pick near a line's far end → the solid turns the other way; on a
  polyline it turns about another axis.
- **Fix:** SWEEPS-D31. **Regression test:** p265, p233–p235, p267, p236 into SS; SS:327 picked the
  line's midpoint, a tie (RVL-10).
- **Coverage:** draw.md REVOLVE; the Missing line on an arc or spline axis closes.

#### RVL-04 — X, Y and Z were the WCS's axes, through its origin

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:** `RevolveTool.ts:271` (`ORIGIN`, `UNIT[id]`).
- **AutoCAD:** p211, UCS Z 30, `_X` 90: ` Direction vector: X = 1.0000` and the box 10..20 / 0..5 /
  0..5 in the UCS; p224, `_Y` read in the WCS: `-0.5000 0.8660`; p205, UCS origin 5,0, `_Y`: Lower
  Bound X 0.0000, Z −20.0000. UCS X 90 matches (p212, r06).
- **mellowcad:** scratch `b/rvl.test.ts:112`: `0.8660 -0.5000`, the box 5.3349..20 / −8.6603..5;
  Lower Bound X −5, Z −25.
- **Scenario:** a rotated or moved UCS, `REVOLVE L ⏎ Y 90` → another solid.
- **Fix:** SWEEPS-D37. **Regression test:** p211, p205, p224 into SS.

### Medium

#### EXT-02 — After Expression gave a refused value the next answer was swallowed

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `ExtrudeTool.ts:603–625` (`openExpression`: on a refusal its box stays open).
- **AutoCAD:** p132, p133 (es, en, pt-BR): `Enter expression: 0` → `Value must be nonzero.` and the
  height prompt again, `-3` there makes it; a taper of `100` → the range's words and the taper
  prompt again.
- **mellowcad:** scratch `a/extrude.test.ts:262`, `:275`.
- **Fix:** SWEEPS-D6.

#### EXT-03 — Enter at `Enter expression:` was refused; AutoCAD ends EXTRUDE, nothing made

- **Severity:** medium · **Row:** B/G · **Status:** verified
- **AutoCAD:** p131 (three languages): `Enter expression:` then `Command:`.
- **mellowcad:** scratch `a/extrude.test.ts:252`: the syntax message, asked again.
- **Fix:** SWEEPS-D7.

#### EXT-04 — A self-intersecting profile was said at the extrusion, not sifted with the set

- **Severity:** medium · **Row:** B/H/K · **Status:** verified
- **Where:** `ExtrudeTool.ts:348–360`, `:478–482`; `sweepSelfIntersecting`.
- **AutoCAD:** p146: `Cannot sweep or extrude a self-intersecting curve.`, `1 object removed from
  selection set.`, the set asked again; p162 (a TEXT, a figure 8, a circle): that line, `Cannot
  sweep or extrude an object of this type.`, `2 objects removed from selection set.`, then the
  height; es `No se puede barrer ni extruir una curva que interseca consigo misma.`, pt-BR `Não é
  possível efetuar a varredura ou extrusão de uma curva de autointersecção.`
- **mellowcad:** scratch `a/extrude.test.ts:328`, `more.test.ts:59`, `:103`: no sift, the message
  later and without its period; es worded otherwise.
- **Fix:** SWEEPS-D8, D9. **Coverage:** draw.md's "not probed" goes.

#### EXT-07 — The height and taper defaults reset with a new drawing; AutoCAD's outlive OPEN

- **Severity:** medium · **Row:** J · **Status:** verified
- **Where:** `ExtrudeTool.ts:105` (`onNewDrawing`); `sweepSettings.ts` (**unverified**).
- **AutoCAD:** p149: taper 15 and height 7, SAVEAS, OPEN of a drawing saved before → `<7.0000>`,
  `<15>`; DELOBJ 0 stays 0.
- **mellowcad:** scratch `a/extrude.test.ts:493`.
- **Fix:** SWEEPS-D12.

#### EXT-08 — A point given for the taper is read in a temporary UCS (the rule is the console's)

- **Severity:** medium · **Row:** C · **Status:** verified in the console; the desktop decides
- **AutoCAD:** p111, p115–p118: the point is moved into a UCS whose origin is the profile's start
  and whose X is its normal; the angle is atan(Y / d), d the height the console's fixed cursor
  read when Taper was typed (`60,10` → `2.14746830`; after a ZOOM `5.57342604`).
- **mellowcad:** scratch `a/extrude.test.ts:289`: `14.14213562`.
- **Fix:** SWEEPS-D13: none before the desktop (SWD); the coverage says **unverified**.

#### SLP-01 — EXTRUDE never moved LASTPOINT

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `ExtrudeTool.ts` (no `setsLastPoint()`; its point prompts declare a refusal).
- **AutoCAD:** p108–p114, p144, p153: the height prompt opening sets it to its base (EXT-01's), a
  height typed or picked leaves it there, also after Taper; Direction's start and end set it, an
  end refused as parallel too; a typed pick at the set sets it; in UCS Z 30 the base is read in
  the UCS.
- **mellowcad:** scratch `a/extrude.test.ts:109–150`: 7,7,7 throughout (the typed pick passes).
- **Fix:** SWEEPS-D3, after EXT-01.

#### SLP-02 — REVOLVE never moved LASTPOINT

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p119–p125, p151: the axis start sets it; the angle prompt opening sets it to the
  projection on the axis of the first profile's perimeter centroid (p151's L: `0,5.357142857142857,0`
  = 375/70), kept after a typed angle, a point, Object, X or STart; a typed pick at the set sets
  it.
- **mellowcad:** scratch `a/extrude.test.ts:159–181`.
- **Fix:** SWEEPS-D4.

#### RVL-01 — A profile across the axis or square to it was refused after the angle

- **Severity:** medium · **Row:** B/G · **Status:** verified
- **AutoCAD:** r05, p245 (three languages): the refusal straight after the axis endpoint or `_Y`,
  the command ended (`Command: 90` → `Unknown command "90".`); r07 the same for `_Z`.
- **mellowcad:** scratch `b/rvl.test.ts:33`; SS:370 asserts the wrong order, citing r05.
- **Fix:** SWEEPS-D36.

#### RVL-02 — A self-intersecting profile was said `Unable to revolve…` alone, after the angle

- **Severity:** medium · **Row:** B/K · **Status:** verified
- **AutoCAD:** r04, p244: `Cannot revolve a self-intersecting curve.` / `Unable to revolve the
  selected object.`; es `No se puede efectuar la revolución de una curva que interseca consigo
  misma.`; pt-BR `Não é possível revolver uma curva de autointersecção.`; at the axis.
- **mellowcad:** scratch `b/rvl.test.ts:46`.
- **Fix:** SWEEPS-D36 and a message in the three catalogs (the console's words; no table string).
- **Coverage:** the Missing line's reason ("no table string") is stale: it goes.

#### RVL-05 — Enter at `Enter expression:` was refused; AutoCAD goes back to the angle

- **Severity:** medium · **Row:** G · **Status:** verified
- **AutoCAD:** p225 (three languages): the angle prompt again, saying nothing.
- **mellowcad:** scratch `b/rvl.test.ts:131`. **Fix:** back to the angle with its `start`.

#### RVL-06 — The axis endpoint refused in a keyword prompt's words

- **Severity:** medium · **Row:** B/G · **Status:** verified
- **AutoCAD:** p220 (Enter), p206 (`_Y`), p213 (`#30,10`): `Invalid point.`, es `Punto no válido.`,
  pt-BR `Ponto inválido.`. **mellowcad:** `Point or option keyword required.` (`b/rvl.test.ts:142`).
- **Fix:** `{ refusal: "invalidPoint" }`, Enter reporting it.

#### RVL-07 — A typed coordinate at the angle or start angle asked a second point

- **Severity:** medium · **Row:** C · **Status:** verified in the console
- **AutoCAD:** p227–p231, p120, p124, p157: its first number is the angle in degrees (`5,7.5` → 5,
  `0,12.5` → a whole turn; a start angle `0,12.5` → 0), though the trace's getangle reads another
  angle from its base.
- **mellowcad:** ` Specify second point:`, nothing made (`b/rvl.test.ts:154`).
- **Fix:** SWEEPS-D32; a click waits for the desktop (SWD).

#### RVL-08 — A pick on nothing at `Select an object:` said `No object found`; AutoCAD starts a window

- **Severity:** medium · **Row:** C/G · **Status:** verified
- **AutoCAD:** p241: `Specify opposite corner:` (es `Designe esquina opuesta:`), PromptingForCorner.
- **mellowcad:** scratch `b/rvl.test.ts:171`. **Fix:** the AUto window of `ONE_OBJECT_MODES`
  (`startWindow`, as BREAK's).

#### PPL-01 — Enter after Multiple with nothing taken ended PRESSPULL; AutoCAD asks again

- **Severity:** medium · **Row:** G · **Status:** verified
- **AutoCAD:** p257 (three languages), p01. **mellowcad:** scratch `b/presspull.test.ts:27`.
- **Fix:** SWEEPS-D35.

#### PPL-03 — A bare number at the pick: the console's answer depends on its cursor

- **Severity:** medium · **Row:** B · **Status:** unverified (desktop)
- **AutoCAD:** p01, p263: `7`, `-5`, `0` → `Click a face, curve, or inside a bounded area`; p127,
  p160: a `7` landing in an area pulls it. mellowcad says `2D point or option keyword required.`
- **Fix:** none before the desktop (SWEEPS-D91).

#### PPL-06 — A closed object pulled was kept silently; AutoCAD says `1 extrusion(s) created`

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p164: a rectangle pulled 5 → `1 extrusion(s) created`, `(sslength (ssget "X"))` 2;
  p160 the same for an area. **mellowcad:** scratch `a/presspull.test.ts:36`: nothing said.
- **Fix:** report `presspullExtruded` with the count of objects and areas made too.
- **Coverage:** settles PRESSPULL's **unverified** "says … and is kept or erased".

#### SWO-02 — A region of several faces made one solid; AutoCAD one per face

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `sweptSolids.ts:24` (`sweepProfile` returns a region's faces as one profile).
- **AutoCAD:** p306, p332: two rectangles, REGION, UNION → one region; EXTRUDE or REVOLVE → two
  solids, the face of the rectangle drawn second first (handle 2DD).
- **mellowcad:** scratch `c/bodies.test.ts` "p306", "p332": one two-lump solid.
- **Fix:** SWEEPS-D60.

#### SWO-04 — A revolution's Direction vector: MIRROR turned it round, SCALE kept it unit

- **Severity:** medium · **Row:** I/L · **Status:** verified
- **Where:** `sweptSolids.ts:66–82` (`sweepMapped`, "**unverified**: no MIRROR probe").
- **AutoCAD:** p311: ROTATE 30 `-0.5000 0.8660`, MIRROR about y = 40 `-0.5000 -0.8660`, SCALE 2
  `-1.0000 -1.7321`; p333: mirrors about x = 0 and y = x, SCALE 0.5 and 4.
- **mellowcad:** scratch `c/history.test.ts`. **Fix:** SWEEPS-D62.

#### SWO-05 — Collinear segments and co-circular arcs stayed separate faces; AutoCAD merges them

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** p330: a polyline with a vertex mid-side and two arcs on one circle → 6 faces, 12
  edges, 8 vertices; p331 (REVOLVE 90) 6 / 12 / 8; p309: two quarter arcs turned whole → one
  sphere face, no edge.
- **mellowcad:** scratch `c/bodies.test.ts`: 8 / 18 / 12, 7 / 15 / 10, two sphere faces and an
  equator; volumes match.
- **Scenario:** extra edges drawn and snapped, more regions on EXPLODE, half a side taken by a click.
- **Fix:** SWEEPS-D63.

#### SWO-06 — A revolution face turned whole had no seam edge; AutoCAD keeps the profile

- **Severity:** medium · **Row:** H/M · **Status:** verified (the topology; the drawing, desktop)
- **AutoCAD:** r04: the ellipse turned whole, edges the profile's `EllipticalArc3d` and a
  `CircularArc3d` r55, a vertex (55,0,0); p308: three circles and the spline. Analytic faces have
  none (p305's torus, p309).
- **mellowcad:** scratch `c/bodies.test.ts` "r04", "p308": no seam.
- **Fix:** SWEEPS-D64.

#### SWO-08 — draw.md: EXTRUDE "explodes as BOX does" is false for a curved side

- **Severity:** medium · **Row:** O · **Status:** verified
- **AutoCAD:** p317: a SURFACE and two REGIONs; p318 (REVOLVE 90) two SURFACEs and four REGIONs;
  p320 a SURFACE and six REGIONs. mellowcad: `1 was not able to be exploded.`
- **Fix:** SWEEPS-D69 (coverage only).

### Low

#### EXT-05 — Direction's prompts refused in a keyword prompt's words

- **AutoCAD:** p134: `Invalid point.` for FOO and Enter at both (es, pt-BR as RVL-06).
- **mellowcad:** `a/extrude.test.ts:202`, `:480`, `more.test.ts:98`. **Fix:** SWEEPS-D10.

#### EXT-06 — A negative height listed negative

- **AutoCAD:** p129: `-5` → `Extrusion height: 5.0000`, the next default `<-5.0000>`.
- **mellowcad:** `a/extrude.test.ts:228`. **Fix:** SWEEPS-D11.

#### EXT-09 — Zero from Expression in a typed zero's words, es and pt-BR

- **AutoCAD:** x03 (a typed 0): es `El valor debe ser diferente de cero.`; p132 (an expression's
  0): es `No puede ser un valor igual a cero.`, pt-BR `Este valor precisa ser diferente de zero.`
  (BOX's, 22257). English is the same. **Fix:** SWEEPS-D14.

#### EXT-10 — The rail's EXTRUDE did not run the ribbon's macro

- **AutoCAD:** acad.cuix `ID_Extrude` (Home > Modeling) `^C^C^R_extrude _MO _SO;`; p400: the MOde
  prompt answered `_MO`, `Closed profiles creation mode [SOlid/SUrface] <Solid>: _SO`, the set
  asked again (es `[Sólido/SUperficie] <Sólido>`).
- **mellowcad:** scratch `r/rail.test.ts`: `_extrude` and the density line only.
- **Fix:** SWEEPS-D90 (`ribbonMacro`, as SPLINE's).

#### RVL-09 — `'ZOOM E` at the angle zoomed; AutoCAD's console refused it for a regen

- **AutoCAD:** p215: `** Requires a regen, cannot be transparent.` at the angle, a zoom at the
  axis start; p137 refused it at EXTRUDE's height with the circle outside the generated view.
- **Fix:** none (SWEEPS-D34): View owns `'ZOOM`; the desktop (SWD) tells the trigger.

#### RVL-10 — A stale setting and citations

- `sweepSettings.ts`: `angle` is read by nothing, and AutoCAD keeps no angle (p223, r02);
  `currentProperties.test.ts:138` cites r01 (p249 holds the properties); SS:327 picks the
  line's midpoint, which hid RVL-03. **Fix:** SWEEPS-D30.

#### RVL-11 — The rail's REVOLVE did not run the ribbon's macro

- **AutoCAD:** acad.cuix `ID_Revolve` `^C^C^R_revolve _MO _SO;`, p401. **Fix:** SWEEPS-D90.

#### SLP-03 — A point typed at PRESSPULL's pick is a pick in the console (from its cursor)

- **AutoCAD:** p126, p158, p159, p164: read as an offset from the console's fixed cursor,
  LASTPOINT moved there; `57,14.9` landed on 5,5 and pulled the rectangle.
- **Fix:** none before the desktop (SWEEPS-D5, D91); the coverage's claim that the console refuses
  every point is corrected.

#### PPL-02 — A failed pick after Multiple said `Click a face…`; the console says nothing

- **AutoCAD:** p258, p01 (from its cursor, as SLP-03). **Fix:** desktop first (SWEEPS-D91).

#### PPL-04 — The pick's answer is written against the colon

- **AutoCAD:** p01, p263 (three languages): `Select object or bounded area:5,5`; the trace's
  Message has no trailing space. **mellowcad:** a space; SS:455, :457 assert it.
- **Fix:** `answerForms.presspullSelect: "tight"` in en, es and pt-BR.

#### PPL-05 — PRESSPULL's tests

- SS:575 asserts `volume > 235` (near always-passing: `toBeCloseTo(75π)`); no test of PPL-01, U
  after an empty run, `'ZOOM`, the names or the preselection.

#### SWO-03 — LIST worded a solid's box as a region's in es and pt-BR

- **AutoCAD:** p329, p311: es `Caja de contorno: Límite inferior X = …` with 18 spaces before
  `Límite superior`; pt-BR `Caixa delimitadora. Limite inferior. X = …`, 17 spaces,
  `Limite superior. X`. A region keeps `Cuadro delimitador:`. English is one.
- **mellowcad:** scratch `c/lang.test.ts`. **Fix:** SWEEPS-D61 (a key of its own; composites too).

#### SWO-07 — EXPLODE of an extrusion gave its side regions in the other order

- **AutoCAD:** p316, p319: −X, +Y, +X, −Y, then top and bottom (from the profile's last edge back).
- **mellowcad:** −Y, +X, +Y, −X (`c/explode.test.ts`). **Fix:** SWEEPS-D65.

#### SWO-09 — A swept solid's grips: AutoCAD's are known now (p305), none here

- p305's MPGRIPDATA: an extrusion's profile corners and midpoints at its base and one on the top;
  a revolution's profile at the start angle, a point on the axis and one at the end angle; a torus'
  centre and quadrants. **Fix:** SWEEPS-D67 (coverage cites p305; the look is SWD's).

#### SWO-10 — The object's tests

- `cad/geometry/sweeps.test.ts:320` asserts only a sphere's volume, `:340` (r04) no edge count
  (hid SWO-06); SS:232, :438 read es and pt-BR LIST by `arrayContaining`, no box line (hid SWO-03);
  SS:200 round-trips an extrusion only; no history through a transform, no run after a taper, no
  region of several faces.

## 6. Decisions

- **SWEEPS-D1:** a pure `profileBase` in `domain/sweptSolids.ts`, found once as the set closes and
  kept with each profile: a polyline's 20 arc-length points, a spline's (circle's, ellipse's) 19
  parameter points, a region's centroid; a 3D polyline the polyline's, **unverified**. One base
  for the rubber band, Ortho, the pick and LASTPOINT.
- **SWEEPS-D2:** REVOLVE's angle base is the projection on the axis of the first profile's
  perimeter centroid (p151).
- **SWEEPS-D3:** EXTRUDE: `setsLastPoint()` at Direction's start and end; `ctx.setLastPoint(base)`
  each time the height prompt opens. The taper's console value (its temporary UCS) is left.
- **SWEEPS-D4:** REVOLVE: `setsLastPoint()` at the axis points; `ctx.setLastPoint` to D2's base as
  the angle prompt opens.
- **SWEEPS-D5:** PRESSPULL's typed picks wait for the desktop; the coverage's claim is corrected.
- **SWEEPS-D6:** a refused expression reopens its prompt's own box before the refusal.
- **SWEEPS-D7:** Enter at EXTRUDE's Expression ends the command, nothing made, nothing said.
- **SWEEPS-D8:** a self-intersecting loop is sifted as the set closes: each kind's line once,
  self-intersecting first, then one count line (p162).
- **SWEEPS-D9:** the type line and the count line become keys of their own in the three
  catalogs, `sweepSelfIntersecting` takes the console's words and period; `sweepRefused` stays,
  unused (a key's removal is a major version).
- **SWEEPS-D10:** `invalidPoint` at Direction's two prompts, for FOO and Enter.
- **SWEEPS-D11:** the history stores `|height|`; the default keeps the sign.
- **SWEEPS-D12:** the height and taper defaults are program-wide (no reset on a new drawing).
- **SWEEPS-D13:** the taper by a point stays as it is, **unverified**, until the desktop.
- **SWEEPS-D14:** an expression's 0 says BOX's words (22257), a typed 0 the distance's.
- **SWEEPS-D15:** the scratch tests move into `solidSweeps.test.ts` as they are, with their
  citations.
- **SWEEPS-D30:** REVOLVE's `<360>` and `<0.0>` are fixed: `SweepSettings.angle` is dropped.
- **SWEEPS-D31:** the Object axis is the chord of the object's ends, from the end nearer the pick
  (from the start without one): lines, polylines, arcs, splines; closed curves refused.
- **SWEEPS-D32:** a typed coordinate at the angle and start angle takes its first number as
  degrees (p228, p230); a click waits for the desktop.
- **SWEEPS-D33:** an axis off the profile's plane stays Missing; p249 (ELEVATION 7 about Y) is
  one more case AutoCAD makes.
- **SWEEPS-D34:** `'ZOOM E` at REVOLVE's angle is left to View and the desktop.
- **SWEEPS-D35:** after Multiple, Enter with nothing taken asks again.
- **SWEEPS-D36:** REVOLVE refuses a profile (one side, square, self-intersecting) as the axis is
  complete, whichever way it was given, and ends.
- **SWEEPS-D37:** X, Y and Z are the UCS's, through its origin.
- **SWEEPS-D60:** one solid per face of a region, the face drawn second first as p306 and p332
  show; the general order stays **unverified**.
- **SWEEPS-D61:** `listSolidBounds`, a key of its own beside `listRegionBounds`.
- **SWEEPS-D62:** a revolution's axis is carried as a vector: rotated, reflected as a vector,
  scaled; normalised only when made (p327's 0.6, −0.8).
- **SWEEPS-D63:** consecutive collinear lines and co-circular or co-elliptical arcs of a loop
  are merged in `sweeps.ts` before sweeping; REGION is left alone.
- **SWEEPS-D64:** a seam edge (the profile, and a ring for a closed one) only on a revolution
  surface turned whole; analytic surfaces keep none.
- **SWEEPS-D65:** an extrusion's sides are built from the last edge back, so EXPLODE reads them in
  ACIS's order; BOX's p09 order is checked unchanged.
- **SWEEPS-D66:** the taper is per run; the setting is only Taper angle's `<default>`. Direction's
  history keeps the taper given in its run (x06).
- **SWEEPS-D67:** the grips stay a gap; the coverage cites p305.
- **SWEEPS-D68:** `turnIsolines` is left until RGD-02's series (SWD).
- **SWEEPS-D69:** EXPLODE of a curved sweep stays refused (no SURFACE); the coverage says so.
- **SWEEPS-D90:** the rail's EXTRUDE and REVOLVE declare `ribbonMacro()` with `_MO`, `_SO`, as
  SPLINE's; Enter repeats the bare command.
- **SWEEPS-D91:** PRESSPULL's typed point, bare number and failed pick after Multiple are read
  from the console's fixed cursor: left to the desktop, through COM.

## 7. Tests proposed

Regression tests first, each from its scratch test (D15): EXT-01 to EXT-07, EXT-09, EXT-10, SLP-01,
SLP-02, RVL-01 to RVL-08, RVL-11, PPL-01, PPL-04, PPL-06, SWO-01 to SWO-07 into
`cad/application/solidSweeps.test.ts` (the commands) and `cad/geometry/sweeps.test.ts` (SWO-05,
SWO-06, the merge and the seams), the rail's into the same file beside SPLINE's pattern.

Then the untested cells: REVOLVE's names, U, REDO, Enter at each prompt, preselection, two
profiles, a region with a hole; EXTRUDE's U and REDO, CECOLOR and CELWEIGHT (p161), ELEVATION
(p143), DELOBJ −2 and 2 (p147), preselection's count (p148); PRESSPULL's names, `'PRESSPULL`,
`'ZOOM`, U after an empty run, preselection (p253–p261); the history through MOVE, ROTATE, SCALE,
MIRROR, a boolean, SOLIDEDIT (p310–p314); several profiles' order (p325); a revolution's file
round trip. `currentProperties.test.ts:138` cites p249; SS:575 asserts 75π.

## 8. What is not tested and why

The jig, ghost and rubber band, the dynamic input's boxes, Escape and the right button, the
grips' look, the palette, the isolines and the seam edges as drawn: desktop cells (SWD). DXF:
this app writes none. MIRROR3D and ROTATE3D: not commands here.

## 9. What could not be reviewed and why

- PRESSPULL's clicks (objects, areas, faces, Ctrl, the height prompt and its refusals, Multiple
  with picks): the console has no cursor of its own (SWD).
- CELTYPE on a sweep (not probed); a 3D polyline's base; the general order of a multi-face region.
- The clipboard (the console's is not Windows'): mellowcad's side passes a solid whole.

## 10. Refuted in the adversarial pass

- "The MOde prompt with no leading newline is written on the line before": p165 writes it on its
  own, as mellowcad does.
- "A height in space is projected onto the plane": p163, a 3D distance, as mellowcad.
- "REVOLVE's defaults follow the last answer": p223, r02 (fixed).
- "A typed `x,y` at the axis endpoint is relative": absolute at the command line, p209.
- "REVOLVE and PRESSPULL treat a preselection otherwise": REVOLVE takes it, PRESSPULL drops it,
  both as mellowcad (p246, p261).
- The snaps on spline, ellipse and revolved edges, LIST in a turned UCS, Direction's height, the
  file, the booleans' dropping of the history: all match.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim                                                                    | State                     |
| ------------------------------------------------------------------------ | ------------------------- |
| EXTRUDE: a height by a point "in plan its distance from the middle"      | false (EXT-01)            |
| EXTRUDE: "the last one its default" (taper)                              | holds, but it is applied (SWO-01) |
| EXTRUDE: "a region's faces are each a solid"                             | false in the code (SWO-02) |
| EXTRUDE: "It … explodes as BOX does"                                     | false for a curved side (SWO-08) |
| EXTRUDE: self-intersecting "where AutoCAD's console was not probed"      | settled (EXT-04)          |
| EXTRUDE: grips and palette rows **unverified**                           | grips settled by p305 (SWO-09); rows SWD |
| REVOLVE: "a line from its start or a polyline's straight segment nearest" | false (RVL-03)           |
| REVOLVE: "X, Y or Z, the UCS's axis through its origin"                  | holds as a claim; the code is the WCS's (RVL-04) |
| REVOLVE: an arc or spline as the axis, refused (**unverified**)          | no longer true (RVL-03)   |
| REVOLVE: self-intersecting "no table string to word it in es and pt-BR"  | stale (RVL-02)            |
| REVOLVE: "mirrors as BOX does"                                           | false for its history (SWO-04) |
| PRESSPULL: "a typed point says `Click a face…` (the console's answer to every point)" | false (SLP-03) |
| PRESSPULL: whether a closed object pulled says `%d extrusion(s) created`, kept (**unverified**) | settled (PPL-06) |
| `sweepSettings.ts`: the defaults per drawing (**unverified**)             | false (EXT-07)            |
| cad-tools.md "LASTPOINT is the runtime's … a prompt opening on a base: a solid's height" | broken in EXTRUDE, REVOLVE (SLP-01, SLP-02) |

Checked and holding: the rest of the three entries' Implemented paragraphs; cad-catalogs.md's
yes-or-no question (Erase defining objects), `promptForms`; cad-tools.md's `ObjectSelector` and
its preselection; cad-engine.md's "A solid … moves only by `transformEntity`".

## 12. Order of execution and estimate

One subagent per block, one after another (they share the catalogs and `solidSweeps.test.ts`):

1. **EXT** (with SLP-01, SWO-01): EXT-01 first (the base), then SLP-01, SWO-01, EXT-02 to EXT-07,
   EXT-09, EXT-10; catalogs for EXT-04 and EXT-09. About two hours.
2. **RVL** (with SLP-02): RVL-01 to RVL-08, RVL-10, RVL-11. About two hours.
3. **PPL**: PPL-01, PPL-04, PPL-05, PPL-06. Under an hour.
4. **SWO**: SWO-02 to SWO-07, SWO-10 (kernel: the merge, the seams, the side order), SWO-08 and
   SWO-09 in the coverage. About two hours.

EXT-08, RVL-09, SLP-03, PPL-02 and PPL-03 wait for SWD.

## 13. Group 2: the desktop (SWD)

A session with the owner's mouse, `scripts/research/probes/sweeps/d<n>.sh` (es-ES, and en-US
for the English labels):

- **Grips and palette:** p305's solids (an extrusion, a tapered one, a region with a hole, a
  revolution with STart, a torus): their grips, each hover menu, a plain drag of each kind; the
  Properties palette's rows under Geometry and Solid History, Reverse's.
- **Isolines and RGD-02's series** (ISOLINES 4 then 6, SE Isometric, through COM and shots
  alone): a whole cylinder; REVOLVE of a rectangle through 180°; a cylinder minus a box over
  x < 0 (d03's case) and over y < 0; SLICE at x = 0; EXTRUDE of a half disc; UNION of the 180°
  revolution with a box apart; SOLIDEDIT offset of its curved face; r04's and p308's whole turns
  (are the seams drawn?).
- **The jigs:** EXTRUDE's rubber band and ghost from the base (a rectangle, an L); the taper by a
  click (EXT-08); REVOLVE's angle by a click (RVL-07); DYNMODE 3 at each point prompt (Direction's
  end and the axis endpoint in the box); Escape and the right button at each prompt; MOde from the
  Down list; `'ZOOM _E` and `_W` at REVOLVE's angle (RVL-09).
- **PRESSPULL:** a click on a closed object, inside an area, on a face, with Ctrl, on nothing,
  with and without Multiple; its height prompt (FOO, 0, Enter); Escape and Enter after Multiple
  with picks; the hover without Ctrl; an area off the UCS's plane; U's name; a typed point and a
  bare number through COM (SLP-03, PPL-02, PPL-03).

## 14. Changes to coverage, rules, catalogs and roadmap

- draw.md EXTRUDE, REVOLVE, PRESSPULL: each claim of §11 corrected; the settled **unverified**
  marks gone; EXPLODE's refusal of a curved sweep and the grips' p305 in Missing.
- cad-tools.md: the base of a sweep's height (one `profileBase`), with LASTPOINT's "a prompt
  opening on a base" naming EXTRUDE's and REVOLVE's.
- Catalogs: the sift's lines (EXT-04), the expression's zero (EXT-09), REVOLVE's self-intersecting
  message (RVL-02), `listSolidBounds` (SWO-03), `answerForms.presspullSelect` (PPL-04), in en, es
  and pt-BR.
- Roadmap: review 28 `plan`, then `done` with what it owns (the profiles and their base, the swept
  solid, PRESSPULL's areas) once SWD lands; the LASTPOINT suspects of ExtrudeTool and RevolveTool
  struck; RGD-02 handed to SWD.

## 15. Template improvements

- annex-probes.md §2: a prompt's traced `BasePoint` is evidence of its own: varied profiles
  fitted it to 1e-15 (EXT-01), where the coverage had written a guess.
- annex-probes.md §2: a command whose pick the console cannot click (PRESSPULL) reads a typed
  point from the console's fixed cursor: such a probe's answers wait for the desktop (SLP-03).
- template §4.1: read the ribbon's macros (RibbonRoot) of each command before the rail's cell:
  EXTRUDE's and REVOLVE's answer MOde (EXT-10).
- template §4.8: give a whole run after a run with options (a taper, a start angle) to one
  subagent by name: SWO-01 was found by the object's subagent, not the command's.
