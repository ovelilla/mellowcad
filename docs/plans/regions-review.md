# Regions review (REGION, UNION, SUBTRACT, INTERSECT)

> **Status:** group 1 executed, 2026-11-03: the console blocks RGN, BLN, BSL and RGO, one commit
> each (§1, Execution). Group 2, the desktop block RGD (§12), needs the owner's mouse in a session of
> its own; once it lands, the plan shrinks to its summary and index.
>
> This review owns the region object (loops, plane, drawing, picking, snaps, grips, palette rows,
> transforms, EXPLODE, file) and the booleans of regions and solids. It cites:
>
> - the LINE review (object snaps, point input, the command line, undo, transparency);
> - ERASE's (`Select objects:`, its modes, Previous, preselection);
> - Workspace's (the rail's macros);
> - the 3D primitives review (the solid object, its snaps, `docs/plans/primitives-review.md`);
> - LIST's (review 32) and MASSPROP's (review 30) reports, as contracts only.

## 1. Summary

**Findings:** 0 critical, 3 high, 14 medium, 10 low.

| Block | What                                                 | Critical | High | Medium | Low |
| ----- | ---------------------------------------------------- | -------- | ---- | ------ | --- |
| RGN   | REGION                                               | 0        | 1    | 4      | 3   |
| BLN   | UNION, SUBTRACT, INTERSECT: the commands and regions | 0        | 2    | 4      | 2   |
| BSL   | the booleans of solids                               | 0        | 0    | 1      | 3   |
| RGO   | the region object in other commands                  | 0        | 0    | 5      | 2   |

The worst:

- **REGION, UNION, SUBTRACT and INTERSECT act at once on a preselection.** AutoCAD 2027 ignores
  it and asks `Select objects:`, while MOVE and EXTRUDE take the same set in the same run.
  - mellowcad converts or unites gripped objects the user never picked for it.
  - SUBTRACT takes the grips as its first set (RGN-01, BLN-01; p129, p335, p349).
- **With a window or ALL, AutoCAD keeps the newest object** (its layer, colour, handle); mellowcad
  keeps the oldest (BLN-02, p315; s07 and b01 under ALL).
- **SUBTRACT misses AutoCAD's two refusals**: `No solids, surfaces, or regions selected.` and the
  first subset's `At least two …`. Where the first-picked plane has nothing to take, it cuts
  another plane that AutoCAD leaves alone (BLN-03, BLN-04).

**Evidence:**

- 136 console probes, in es-ES and en-US, and in pt-BR where its words or names are asked:
  `regions/p100–p137`, `p200–p222`, `p300–p349` and `p400`.
- The committed earlier probes `region/*` and `union/*`, from 2026-10-31 on the same build.
- `acad.cuix`'s MenuGroup and each language's `acad.pgp`.
- The tables of 2026-10-31.
- AutoCAD 2027, ACADVER 26.0, X.118.0.0 (p100). Tree at 96e8a896.

## Execution

| Block | Findings                                                                         | Commit   |
| ----- | -------------------------------------------------------------------------------- | -------- |
| RGN   | RGN-01 to RGN-08; the colinear line's order settled by p150 (REGIONS-D2)         | c3706f83 |
| BLN   | BLN-01 to BLN-08, BSL-02; BLN-05 in SUBTRACT's Missing (REGIONS-D70)             | 3e4dc75e |
| BSL   | BSL-01, BSL-03 (in UNION's Missing, REGIONS-D77), BSL-04                         | b148a08c |
| RGO   | RGO-01 to RGO-07; HATCH of a region of elliptical or spline edges in its Missing | f0e78c57 |

## 2. Inventory

- **Tools:**
  - `cad/application/tools/RegionTool.ts`;
  - `RegionBooleanTool.ts` (RegionBooleanTool for UNION and INTERSECT, SubtractTool);
  - `SelectionActionTool.ts` and `objectSelection.ts`, as these use them;
  - registration in `CommandLine.ts`.
- **The object:**
  - `cad/geometry/planarRegions.ts`;
  - `cad/domain/regions.ts`, `regionModeling.ts`, `solidModeling.ts`, `entityTransforms.ts`;
  - `cad/geometry/solidBooleans.ts`;
  - `cad/application/SceneBuilder.ts` (2D Wireframe), `snapping/SnapEngine.ts`, `providers.ts`,
    `viewPick.ts`, `tools/selectToolGrips.ts`, `EngineState.ts` (the palette), `clipboard.ts`;
  - `cad/serialization/drawingFile.ts`.
- **Other commands on a region:**
  - `ExplodeTool`, `BreakTool`, `OffsetTool`, `EdgeEditTool`, `cornerObjects.ts`, `HatchTool`;
  - `listReport.ts`, `ucsObjects.ts`, `DimensionTool`, `RadialDimensionTool`.
- **Catalogs:** the names, `region*`, `subtract*`, `nullRegion`, `nullSolid`, `booleanFailed`
  and `booleanNeedsTwo`, in en, es and pt-BR.
- **The rail and the landing:**
  - `packages/editor/src/tool-rail.tsx`: REGION in Draw; UNION's drop-down in Modify;
  - `content/commands.ts`;
  - the macros `^C^C_region`, `^C^C_union`, `^C^C_subtract` and `^C^C_intersect` (acad.cuix
    MenuGroup).
- **Tests:**
  - `cad/application/regionCommands.test.ts`, `solidBooleans.test.ts`;
  - `cad/geometry/planarRegions.test.ts`, `solidBooleans.test.ts`;
  - `englishSurface.txt`;
  - the region arbitrary in `test/arbitraries.ts`.
- **Knowledge:**
  - `docs/coverage/draw.md` REGION; `modify.md` UNION / SUBTRACT / INTERSECT and EXPLODE;
  - rules `cad-engine.md`, `cad-runtime.md`, `cad-tools.md`, `cad-catalogs.md`, `testing.md`.

Shared contracts swept by subagent A for all four tools: `setsLastPoint`, `typedPick`,
`takesLocked`. LASTPOINT holds everywhere (p109–p111, p130, p131): a typed pick at
`Select objects:` is LASTPOINT; `ALL` leaves it.

## 3. Probes (`scripts/research/probes/regions/`)

| Ids       | What they ask                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| p100      | ACADVER, a circle to a region                                                                                                                                   |
| p101–p105 | REGION's names, `_.`, repeat, `'REGION`, U, UNDO 2, an empty run and U                                                                                          |
| p106–p113 | preselection; the colinear message; LASTPOINT after the four commands; `'ZOOM`, `'-OSNAP` at the prompt                                                         |
| p114–p137 | REGION's loops: ellipses, splines, UCS Z 30 and X 90, ELEVATION, THICKNESS, shared vertex, arc chain, gaps, duplicates, current properties, order, locked layer |
|           | (continued) pt-BR `None found.`, REDO, preselection with a MOVE control, bulged/Fit/Spline polylines, colinear lines, a lone arc, 3D polylines, figure 8         |
| p200–p204 | the region's snaps: arc and line, spline and ellipse edges, grips, tilted in plan, SE iso                                                                       |
| p205–p212 | STRETCH in part, tilted transforms, MIRROR of an arc edge, ARRAYRECT and ARRAYPOLAR, EXPLODE (curved, tilted), save (p212 void, superseded by p219)             |
| p213–p222 | AREA Add/Subtract, DIST, ID; MATCHPROP (void: none in the console); -HATCH of a region; TRIM/EXTEND Quick; the edge under the cursor; DWG and DXF; picks; QUA   |
| p300–p303 | the booleans' names in en, es, pt-BR; `'UNION` transparently                                                                                                    |
| p304–p313 | SUBTRACT's sets: a line first, one object in both, `_P`, a line second; U and REDO after each; empty sets                                                       |
| p314–p321 | which region survives (picks, window); opposite normals; parallel planes; three in pairs; a lone plane; SUBTRACT's first subset; locked layer                   |
| p322–p330 | solids: pick order, three and one apart, INTERSECT of three, one in both sets, coaxial cuts, sphere minus box, a turned box, a shared face                       |
| p331–p342 | preselection for the three; `(ssget "_I")` and Previous after; SUBTRACT's planes; a region and a box across the sets                                            |
| p343–p349 | k03–k08 reruns with counts; a cylinder lying on a box; preselection controls (EXTRUDE takes it, SLICE does not)                                                 |
| p400      | pt-BR `U` at `Comando:` runs UNIAO (`acad.pgp` `U, *UNIAO`)                                                                                                     |

The transcripts are in `research/probes/regions/` (gitignored). The scratch tests are in
`research/review/regions/{a,b,c,r}/`.

## 4. Matrix

A row that is the same at every prompt takes one cell. Columns: REGION's one prompt;
SUBTRACT's two sets; UNION's and INTERSECT's one set.

### RGN (REGION)

| Row | Cell                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------- |
| A   | names, aliases en/es/pt-BR, repeat: match · n01, p101 · `regionCommands.test.ts:197`; `'REGION` refused: untested · p102 |
| B   | Enter on an empty set: match · p05, p127, p135 · `:174`                                                                   |
| B   | the colinear message: differs RGN-02                                                                                      |
| C   | a typed pick, LASTPOINT: untested · p130, p131                                                                            |
| D   | n/a (no point prompt)                                                                                                     |
| E   | `'ZOOM`, `'-OSNAP`: owned (LINE), contract match · p112                                                                   |
| F   | U, UNDO 2, REDO, an empty run is a step: untested · p103–p105, p128                                                       |
| G   | Enter: match; a command typed at the prompt: untested · p05; Escape: desktop (RGD)                                        |
| H   | loops: untested · p114–p122, p132, p136                                                                                   |
| H   | a Spline-fit polyline: differs RGN-03                                                                                     |
| H   | order: differs RGN-04                                                                                                     |
| H   | a shared vertex: differs RGN-05                                                                                           |
| H   | duplicates: differs RGN-06, RGN-07                                                                                        |
| H   | properties: untested · p124 (CELTSCALE ignored there too)                                                                 |
| H   | locked layer: untested · p126                                                                                             |
| H   | preselection: differs RGN-01                                                                                              |
| H   | `ssget "_I"` and Previous: untested · p107                                                                                |
| K   | sweep: lang-several `regionNoneFound` settled (22303/22419, REGIONS-D1); plurals console-confirmed                        |
| L   | history: match but RGN-01, -02, -05                                                                                       |
| N   | the tests: RGN-08                                                                                                         |

### BLN (the three commands, regions)

| Row | Cell                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------- |
| A   | names, aliases en/es/pt-BR: match · p300–p302                                                                   |
| A   | pt-BR `U`: differs BLN-08                                                                                       |
| A   | es `_UNI`: known (command-line.md, `_` with a global alias)                                                     |
| A   | transparency refused: untested · p303                                                                           |
| B   | SUBTRACT's reports en/es/pt: match · p304, p305, p317 · `regionCommands.test.ts:235` (en)                       |
| B   | Enter on an empty first or second set: untested · b07, p312                                                     |
| B   | a first set with nothing, one object in both, `_P`, a line second: differs BLN-04                               |
| F   | U names each, REDO, a run that made nothing is a step: match · b09, p307–p313, p337                             |
| G   | a command typed at `Select objects:`: untested · p311; Escape: desktop                                          |
| H   | the first picked survives: untested · p314                                                                      |
| H   | a window or ALL: differs BLN-02                                                                                 |
| H   | opposite normals unite: untested · p316                                                                         |
| H   | parallel planes: UNION and INTERSECT match · p317; SUBTRACT differs BLN-03                                      |
| H   | INTERSECT of three in pairs, and a lone plane: untested · p318, p319                                            |
| H   | SUBTRACT's planes: differs BLN-03 · p320, p338–p342                                                             |
| H   | locked layer: untested · p321                                                                                   |
| H   | preselection: differs BLN-01                                                                                    |
| H   | `ssget "_I"`: untested · p331, p334; Previous after UNION: untested · p334                                      |
| H   | Previous after SUBTRACT: differs BLN-05                                                                         |
| K   | every message the code has: match · p308, p317, p318, p321                                                      |
| K   | 22205 and 22214 have no key: BLN-03, BLN-04                                                                     |
| L   | match where the behaviour does                                                                                  |
| N   | BLN-06; draw.md stale: BLN-07                                                                                   |

### BSL (solids)

| Row | Cell                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H   | pick order: untested · p322                                                                                                                                                |
| H   | three solids, one apart; INTERSECT of three; coaxial cuts; a turned box; a shared face: untested or match · p323–p330 · `cad/geometry/solidBooleans.test.ts:61, :129`      |
| H   | k03–k08 with counts: match · p343–p347 · BSL-04 for the counts                                                                                                             |
| H   | a cylinder lying on a box: differs BSL-03 (topology only)                                                                                                                  |
| H   | a region and solids across SUBTRACT's sets: BLN-03 · p340–p342                                                                                                             |
| H   | ALL keeps the newest: BSL-02                                                                                                                                               |
| J   | round trip of a curved composite: untested, BSL-01                                                                                                                         |
| I   | a composite's grips and palette: desktop (RGD)                                                                                                                             |

### RGO (the object)

| Row | Cell                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D   | END, MID, NEA, INT (corner, edge×line, two regions), PER, TAN, CEN from the rim and none at the centre, spline and ellipse-arc edges: untested · p200–p201, p218, p220, s01, s02 |
| D   | in SE iso: untested · p204                                                                                                                               |
| D   | INT on an ellipse edge: known (drafting-aids.md)                                                                                                         |
| D   | QUA in a turned or tilted UCS: differs RGO-02 · p203, p222                                                                                               |
| D   | APP of an arc and a line: differs RGO-05 · p200                                                                                                          |
| D   | GCEN, NOD: known; INS none: untested                                                                                                                     |
| D   | INT and APP kept on a region (help: "3D solids" only): untested · p200                                                                                   |
| H   | MOVE, COPY, ROTATE, SCALE, MIRROR, tilted too: untested · e02, p206, p207                                                                                |
| H   | STRETCH caught in part: differs RGO-01 · e02, p205                                                                                                       |
| H   | ARRAYRECT and ARRAYPOLAR: untested · p208, p209                                                                                                          |
| H   | EXPLODE of curved and tilted regions: untested · p210, p211; the pieces' order known                                                                     |
| I   | grips: untested · p202, p203, s01, s03                                                                                                                   |
| I   | palette rows: match · d02 · snapshot                                                                                                                     |
| I   | palette layer and colour edits, U `CHPROP`: untested                                                                                                     |
| J   | DWG and DXF in AutoCAD · p219; mellowcad's round trip of every edge kind: untested; copy and paste: untested                                             |
| O   | AREA Add/Subtract, DIST, ID: untested · p213                                                                                                             |
| O   | refusals: BREAK, OFFSET, PEDIT, TRIM, EXTEND, JOIN untested · e01, e08–e10; FILLET and CHAMFER differ RGO-03                                             |
| O   | -HATCH of a region: differs RGO-04 · p215                                                                                                                |
| O   | TRIM/EXTEND Quick: known, settled RGO-06 · p216, p217, e07                                                                                               |
| O   | dimensions and UCS OBject on an edge: untested · e03–e05                                                                                                 |
| O   | linetype dashes: untested · p07                                                                                                                          |
| O   | picks and windows: untested · p221                                                                                                                       |
| O   | MATCHPROP: desktop                                                                                                                                       |
| N   | the tests: RGO-07                                                                                                                                        |

## 5. Findings

### High

#### RGN-01 — REGION acts at once on a preselection; AutoCAD ignores it and asks `Select objects:`

- **Severity:** high · **Row:** H · **Status:** verified on the console; the desktop
  reconfirms it through COM (RGD, REGIONS-D71).
- **Where:** `SelectionActionTool.ts:81-83` (`begin` → `preselect`).
- **AutoCAD:** p129 (en-US, es-ES).
  - MOVE takes `(sssetfirst nil (ssget "_X"))`: `2 found`.
  - In the same run, `_REGION` asks `Select objects:` (es `Designe objetos:`); Enter gives
    `None found.`.
  - p106's trace shows no implied set.
- **mellowcad:** scratch `a/rgn.test.ts`: `REGION`, `2 found`, `2 loops extracted.`,
  `2 Regions created.`
- **Fix:** a `SelectionActionTool` hook, `takesPreselection()`, true by default. REGION, UNION,
  SUBTRACT and INTERSECT say false: the set is dropped and the prompt asked.
- **Regression test:** `regionCommands.test.ts` (p129).
- **Coverage, rules or catalogs affected:**
  - draw.md REGION;
  - command-line.md's preselection line (an exception per command);
  - `SelectionActionTool`'s JSDoc.

#### BLN-01 — UNION, SUBTRACT and INTERSECT act on a preselection; AutoCAD asks

- **Severity:** high · **Row:** H · **Status:** verified (console; RGD reconfirms)
- **Where:** as RGN-01. `SubtractTool.onActivate` takes the grips as its first set.
- **AutoCAD:**
  - p335: MOVE takes the set; then `(ssget "_I")` gives 2, `_UNION` asks `Select objects:`, and
    `_SUBTRACT` writes its first report and asks.
  - p331–p333 for each command.
  - p349: EXTRUDE takes the set and SLICE does not, so it is per command, not the console.
- **mellowcad:** scratch `c/booleans.test.ts`: `UNION`, `2 found`, run at once.
- **Fix:** RGN-01's hook.
- **Regression test:** `regionCommands.test.ts` (p335) for the three commands.
- **Coverage, rules or catalogs affected:** modify.md. The Missing line "a preselection's part
  in SUBTRACT (**unverified**)" becomes Implemented.

#### BLN-02 — With a window, a crossing or ALL, AutoCAD keeps the newest object; mellowcad the oldest

- **Severity:** high · **Row:** H · **Status:** verified
- **Where:**
  - `RegionBooleanTool.ts:73-80` and `SubtractTool.run`: the set in `ctx.selection` order;
  - `combineRegions` and `combineSolids` keep `members[0]`.
- **AutoCAD:**
  - p315: regions on layers A, B and C, made in that order. `_UNION _W` gives `3 found`, and the
    survivor is on `Layer: "C"`, handle 2df, the newest.
  - Under ALL: s07 (layer A, green, the newest), b01 (2DA kept), p316, p319, p323, p329.
  - Picks keep their order: p314, p322.
- **mellowcad:** scratch `c/booleans.test.ts`: the oldest survives.
- **Fix:** JoinTool's pattern (`selectionAdded` reverses what a window, crossing or ALL finds),
  kept as the set's order and passed to `run`. Picks stay as picked.
- **Regression test:**
  - `regionCommands.test.ts` (p315: id and layer of the newest);
  - `solidBooleans.test.ts` (s07: ALL keeps the newest, replacing BSL-02's assertion).
- **Coverage, rules or catalogs affected:**
  - modify.md: Missing's "which object keeps its own when the set was taken by ALL" becomes
    Implemented, for windows too;
  - JoinTool's WHY ("the named modes keep the drawing's order (unprobed)") is now probed for ALL.

### Medium

#### RGN-02 — `All open edges cannot be colinear.` is never said

- **Severity:** medium · **Row:** B, K, L · **Status:** verified
- **Where:** `regionModeling.ts:108-112`: colinear points fall back to +Z.
- **AutoCAD:**
  - One line (p105, p135), or two colinear lines apart (p133): `All open edges cannot be
    colinear.` / `0 loops extracted.` / `0 Regions created.`
  - Among two circles, before `2 loops extracted.` (p107).
  - A lone arc does not say it (p134).
  - es `Todas las aristas abiertas no pueden ser colineales.`; pt-BR `Todas as arestas abertas
    não podem ser colineares.`
  - The tables lack it.
- **mellowcad:** scratch: the two counts only.
- **Fix:** `RegionExtraction.openColinear` (REGIONS-D3), said where `Open objects must be
  coplanar.` is said (REGIONS-D2). It takes a key, `regionOpenEdgesColinear`, worded from the
  console in the three languages.
- **Regression test:** `regionCommands.test.ts`, en, es and pt-BR (p105, p107, p133, p135).

#### RGN-03 — A Spline-fit polyline's region is its chord polygon, not its curve

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `regionModeling.ts:150, :197` (`polylineCurve` → `regionCurvesOf`).
- **AutoCAD:** p132. PEDIT Spline of the rectangle 80,0–100,10, then REGION, gives one SPLINE
  edge: Area 135.555556, Perimeter 44.910132, the exact periodic cubic B-spline.
- **mellowcad:** 134.68967, from 32 line edges.
- **Fix:** a Spline-fit polyline becomes one NURBS edge built from its frame (SPLINETYPE's
  degree) (REGIONS-D75).
- **Regression test:** p132's area and one spline edge.
- **Coverage, rules or catalogs affected:** draw.md's "fitted ones by their curve" is false for
  Spline-fit until fixed.

#### RGN-04 — Regions are made in the wrong order: AutoCAD makes the open chains' first, then the closed objects' in drawing order

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `regionModeling.ts:95-127`.
- **AutoCAD:** p125, a circle at 50, a square of lines, a circle at 30, a RECTANG: the regions
  come out as the square, the circle at 50, the circle at 30, the rectangle. Also p114, p116,
  p117, p136, p210.
- **mellowcad:** the closed objects first.
- **Scenario:** `MOVE L` (or EXTRUDE `L`) after REGION takes another region.
- **Fix:** the closed objects' regions are appended after the chains' (REGIONS-D4).
- **Regression test:** p125's order.

#### RGN-05 — Loops meeting only at a vertex report an extra rejected outline

- **Severity:** medium · **Row:** H, L · **Status:** verified
- **Where:** `planarRegions.ts:383` (`loopsFromCurves`).
- **AutoCAD:** p120 (two triangles sharing a vertex) and p137 (a figure 8): `2 loops extracted.`
  / `2 Regions created.`
- **mellowcad:** `3 loops extracted.`, `1 loop rejected.`, `Self intersections … : 1 loop.`,
  `2 Regions created.`
- **Fix:** an outline is added only round faces sharing an edge, never one whose walk passes a
  node twice. p10 and p13 keep theirs.
- **Regression test:** p120 and p137's lines.

#### BLN-03 — SUBTRACT ignores AutoCAD's first-subset rule

- **Severity:** medium · **Row:** H, B · **Status:** verified
- **Where:** `regionModeling.ts:481` (`if (taken.length === 0) continue`), `solidModeling.ts`,
  `SubtractTool.run`.
- **AutoCAD:** the first subset is the solids if any, else the first-picked region's plane (the
  UNION help's "first subset").
  - When nothing of the second set can be taken from that subset, AutoCAD says 22214 and changes
    nothing: `At least two solids, surfaces, or coplanar regions must be selected.`, es `Hay que
    designar al menos dos sólidos, superficies o regiones coplanares.`, pt-BR `Pelo menos dois
    sólidos, superfícies ou regiões coplanares precisam estar selecionados.` (p317, p320, p341,
    p342).
  - Otherwise the first set's other planes are each joined, whether or not something is taken
    from them (p338: a+b joined into 157.0796; p339, p340, b10).
- **mellowcad:**
  - silent in p317 and p320, and it cuts in p320;
  - p338's two regions left apart;
  - silent in p341 and p342.
- **Fix:** REGIONS-D41, with a key of its own for 22214 (REGIONS-D42).
- **Regression test:** p317, p320, p338 in `regionCommands.test.ts`; p341, p342 in
  `solidBooleans.test.ts`.
- **Coverage, rules or catalogs affected:** modify.md's **unverified** about SUBTRACT's planes
  goes, and `subtractRegions`' docstring with it.

#### BLN-04 — SUBTRACT never says `No solids, surfaces, or regions selected.` (22205)

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:**
  - p304: a first set of one line gives `1 found`, then 22205, and the command ends before the
    second prompt.
  - The same object in both sets, regions (p305) or solids (p325), gives 22205.
  - `_P` at the second set finds the first set, then gives 22205 (p306).
  - A second set of only a line gives 22205 (p336).
  - An empty second set is silent (p312).
  - es `No se ha designado sólido, superficie o región.`; pt-BR `Não há sólidos, superfícies ou
    regiões selecionados.`
- **mellowcad:** asks the second set after p304's line; silent in the rest.
- **Fix:** REGIONS-D44.
- **Regression test:** p304, p305, p336 (regions) and p325 (solids).
- **Coverage, rules or catalogs affected:** modify.md's "what is neither … passed over" is false
  for SUBTRACT.

#### BLN-06 — The region booleans' languages and b10's SUBTRACT are untested

- **Severity:** medium · **Row:** N · **Status:** verified
- **What has no test:**
  - es and pt-BR for `nullRegion`, `booleanNeedsTwo`, `subtractFrom` and `subtractWhat`
    (p308, p317, p318);
  - b10's joined squares and the circle left at Z 5;
  - Enter on an empty first set;
  - REDO and UNDO 2 (p337, p309).
- **Fix:** the tests.

#### BLN-08 — pt-BR `U` is UNIAO's alias; here it is an unknown command

- **Severity:** medium · **Row:** A · **Status:** verified
- **AutoCAD:** p400: the pt-BR `acad.pgp` has `U, *UNIAO`, and `U` at `Comando:` runs UNIAO
  (`2 encontrado(s)`, one region left). pt-BR's local name of U is `D`.
- **mellowcad:** scratch `r/p400.test.ts`: `Comando "U" desconhecido.`
- **Fix:** add `U` to pt-BR's UNION names. Ctrl+Z stays `_u`, the global form (REGIONS-D72).
- **Regression test:** `locale.test.ts` or `regionCommands.test.ts` (p400).

#### BSL-01 — A composite's file round trip is tested for two boxes only

- **Severity:** medium · **Row:** J, N · **Status:** verified (it holds)
- **Fix:** round-trip k05's tee (NURBS edges), k07's half sphere and k03's two shells, compared
  through the file.

#### RGO-01 — STRETCH leaves a region caught in part; AutoCAD moves it whole

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `entityTransforms.ts:392` (`vertices.every(inFrame)`), `:533`, and the WHY at
  `:480`.
- **AutoCAD:**
  - e02: a crossing over two of four corners moves the square whole, 5..15.
  - p205: a crossing over an edge with no corner, or over a circle's rim without its centre,
    leaves the region.
- **Fix:** as a solid, `regionGripPoints(...).some(inFrame)` moves it whole (REGIONS-D24).
- **Regression test:** e02 and p205.
- **Coverage, rules or catalogs affected:** draw.md's **unverified** goes.

#### RGO-02 — QUA on a region's circle or arc edge follows the UCS; AutoCAD takes the region's own axes

- **Severity:** medium · **Row:** D · **Status:** verified
- **Where:** `providers.ts:357-373` (`quadrantTurn`).
- **AutoCAD:**
  - p222, UCS Z 30: a circle region at 0,0, r 10, gives (10,0,0), where a plain circle gives
    the UCS's.
  - p203: a tilted circle region in plan gives (20,0,0) and (30,0,0), where a plain circle
    refuses as oblique.
- **mellowcad:** (8.6603,5); `No Quadrant found` in plan.
- **Fix:** a region's edges take their quadrants at their own OCS angles, whatever the UCS and
  obliqueness.
- **Regression test:** p222 and p203. p203's (25,0,±5) is a tie, kept out (REGIONS-D20).

#### RGO-03 — FILLET and CHAMFER pass over a region in silence

- **Severity:** medium · **Row:** O · **Status:** verified
- **Where:** `cornerObjects.ts:141-180` (`typeRefusal`).
- **AutoCAD:** e06: `Fillet requires 2 lines, arcs, or circles.` and `Chamfer requires 2 lines.`
  (es `Empalme requiere 2 líneas, arcos o círculos.`, `Chaflán requiere 2 líneas.`), then the
  prompt again.
- **Fix:** a `region` case taking the existing keys. A region picked second is unprobed: the same
  words, assumed.

#### RGO-04 — -HATCH's Select objects cannot take a region; AutoCAD hatches it, its holes as islands

- **Severity:** medium · **Row:** O · **Status:** verified
- **Where:** `HatchTool.ts:864-871` (`BOUNDARY_TYPES`).
- **AutoCAD:** p215: `-HATCH _S` of a holed region, then SOLID, gives a hatch of 2 loops; AREA
  gives 321.4602 and 111.4159.
- **mellowcad:** `Unable to hatch the boundary.`
- **Fix:** a selected region gives its faces' loops in its plane (REGIONS-D73).

#### RGO-05 — Apparent Intersection finds nothing between an arc or circle and a line

- **Severity:** medium · **Row:** D · **Status:** verified
- **Owner:** the object snaps are the LINE review's (`docs/plans/line-review.md`); this is new
  evidence there.
- **Where:** `providers.ts:1034-1046`: segments only.
- **AutoCAD:** p200: `(osnap '(19.5 3.1 0) "_app")` gives (19.5394,3,0), an arc edge across a
  line edge. Plain ARC and LINE objects behave the same.
- **Fix:** arcs and circles crossed in plan, as Intersection crosses them (REGIONS-D74).

### Low

#### RGN-06 — Two coincident circles make two stacked regions; AutoCAD reports 3 but makes one per place

- **AutoCAD:** p123. **Fix:** a duplicate is counted, its source erased, no second region
  (REGIONS-D5).

#### RGN-07 — Of two coincident lines, mellowcad uses the first; AutoCAD uses the later and keeps the first

- **AutoCAD:** p123. **Fix:** prefer the later source.

#### RGN-08 — REGION's tests

- **Holes:**
  - no row in `currentProperties.test.ts`;
  - `regionCommands.test.ts:179` asserts the colour only;
  - `:189` cites no probe and does not assert U's echo.
- **Fix:** the untested cells above become tests: LASTPOINT, locked layer, UCS, ELEVATION,
  THICKNESS, gaps, Previous, transparency, UNDO 2, REDO.

#### BLN-05 — Previous after SUBTRACT says `No previous selection set.`; AutoCAD finds `0 found`

- **AutoCAD:** p334. After ERASE it says `No previous selection set.` (erase p111, p234), so this
  is SUBTRACT's own.
- **Fix:** none; it goes to SUBTRACT's Missing (REGIONS-D70).

#### BLN-07 — draw.md's REGION Missing says "SUBTRACT, UNION and INTERSECT of solids and surfaces (none yet)"

- **Fix:** "of surfaces".

#### BSL-02 — `solidBooleans.test.ts:59-70` pins the oldest's survival under ALL and cites s07, which shows the newest kept

- **Fix:** with BLN-02.

#### BSL-03 — A cylinder lying on a box: AutoCAD V10 E17 F10, mellowcad V10 E16 F9

- **AutoCAD:** p348; the volume (1282.7433) and the one shell agree.
- **Fix:** the s04 test cites p348 and asserts its volume and shell; the topology goes to Missing,
  beside tangency.

#### BSL-04 — `cad/geometry/solidBooleans.test.ts` cites k03–k08 without counts for k05 and k06

- **AutoCAD:** p343–p347 rerun them: k05 V6 E6 F7, k06 V6 E8 F8.
- **Fix:** the counts, the citations, and the k05 WHY citing p345's MPDUMP volume
  (1866.9126769560326, the kernel's exact figure).

#### RGO-06 — TRIM and EXTEND Quick: AutoCAD uses a region's edges; Missing's **unverified** is settled

- **AutoCAD:** p216, p217. The Standard set takes the region silently and it is no edge (e07);
  `1 was not a valid edge…` is no longer 2027's.
- **Fix:** Missing reworded, and `EdgeEditTool.ts:2350`'s WHY re-cited to e07 and p216.

#### RGO-07 — The "a region in the other commands" tests protect less than their titles say

- **Where:** `regionCommands.test.ts:344, :350, :359, :368`.
- **Fix:** the scratch tests of `b/` move in: snaps, transforms, refusals in en and es, grips,
  EXPLODE, files.

## 6. Decisions

- **REGIONS-D1:** `regionNoneFound` is table 22303/22419, which REGION's console prints in es and
  pt-BR.
- **REGIONS-D2:** the colinear line goes where `Open objects must be coplanar.` goes, after the
  rejected objects' line. That order is unprobed: probe it in the execution.
- **REGIONS-D3:** "colinear" means every open object is straight with all its ends on one line
  (p133); an arc alone is not (p134).
- **REGIONS-D4:** chains first, then closed objects in selection order (p114, p125); the order
  among chains as the kernel gives it.
- **REGIONS-D5:** a coincident duplicate loop is still counted in `N Regions created.` (p123).
- **REGIONS-D20:** ties stay out of tests (p203, p204).
- **REGIONS-D21:** the order and direction of EXPLODE's pieces is the known Missing item.
- **REGIONS-D22:** a test that types a point under an override moves the cursor off the object
  first. The harness parks it at the view's centre.
- **REGIONS-D24:** a region caught in part by STRETCH moves whole when a corner or a whole loop's
  centre is caught (e02, p205).
- **REGIONS-D25:** MATCHPROP on a region is a desktop cell.
- **REGIONS-D40:** the three booleans and REGION drop a preselection and ask (p129, p335, p349).
- **REGIONS-D41:** SUBTRACT's first subset is the solids if any, else the first-picked region's
  plane. With nothing of the second set for it, 22214 and nothing done; otherwise every other
  plane of the first set is joined.
- **REGIONS-D42:** 22205 and 22214 get keys of their own. 22214 spells "two"; `booleanNeedsTwo`
  (UNION's and INTERSECT's "2") stays.
- **REGIONS-D43:** a window's, a crossing's and ALL's finds are taken newest first; picks as
  picked.
- **REGIONS-D44:** 22205 at the first set ends the command before the second prompt. At the
  second it is said only when the set found something.
- **REGIONS-D70:** BLN-05 is recorded in Missing, not fixed: the Previous set is ERASE's area,
  and only SUBTRACT keeps an emptied set there.
- **REGIONS-D71:** RGN-01 and BLN-01 are executed in group 1, on the console's evidence.
  - The control in the same run (MOVE and EXTRUDE take the set, SLICE does not) points to the
    command's registration, which the desktop shares.
  - RGD's d01 reconfirms it through COM; a refutation there reverts it.
- **REGIONS-D72:** pt-BR's `U` alias is added to UNION. The global `_U` and Ctrl+Z's `_u` are
  untouched.
- **REGIONS-D73:** RGO-04 is implemented for a region in any plane the hatch object can take. A
  plane it cannot take goes to HATCH's Missing.
- **REGIONS-D74:** RGO-05 crosses arcs and circles in plan. Off the plan, if it needs more than
  the screen crossing the segments use, it goes to drafting-aids.md's Missing.
- **REGIONS-D75:** RGN-03 is fixed if the Spline-fit curve is a B-spline of the frame
  (`polylineFits.ts`); else it goes to REGION's Missing.
- **REGIONS-D76:** SLICE drops a preselection too (p349). It is review 29's (Solid edits): left in
  command-line.md's Missing and noted in the roadmap.
- **REGIONS-D77:** BSL-03's shell is a topology difference, not fixed here. The cylinder shares
  only the contact line's end vertices with the box, where ACIS keeps that line as an edge; the
  volume and the one solid agree. It goes to UNION's Missing.

## 7. Tests proposed

The regression tests of each finding above, then the untested cells, moved from the scratch
tests:

- `research/review/regions/a/rgn.test.ts` → `regionCommands.test.ts` (REGION).
- `c/booleans.test.ts` → `regionCommands.test.ts` and `solidBooleans.test.ts`.
- `b/*.test.ts` → `regionCommands.test.ts` ("a region in the other commands"): snaps,
  transforms, files.

No old `acc/…` citation was found in the inventory.

## 8. Not tested, and why

- Whether the region's edges are dashed per edge on the screen: presentation, checked by the
  scene's primitives only.
- The palette's look: desktop d02 of the earlier session.

## 9. Not reviewed, and why

- **Escape and the right button** at each prompt (desktop).
- **What only the desktop shows:**
  - the selection's highlight, the first set's highlight while SUBTRACT asks the second;
  - a composite's grips and palette;
  - the rollover on a region's edges;
  - MATCHPROP;
  - BSL-03's wireframe edge.
- **Unprobed:**
  - objects on off or frozen layers;
  - colinear open polylines;
  - FILLET with a region picked second;
  - running snaps (OSMODE) on a region;
  - STRETCH of a tilted region caught in part;
  - a HATCH internal point inside a region;
  - pt-BR `'UNION`.

## 10. Refuted in the adversarial pass

- **`'REGION` echoed without `_`, and `_.REGION`:** the command line's (LINE review), known.
- **es `_UNI`:** known (command-line.md, `_` with a global alias).
- **CELTSCALE:** AutoCAD gives the region LTS 1 too (p124).
- **`_CEN` at an arc edge's centre taken:** the harness's parked cursor (REGIONS-D22).
- **INT on an ellipse edge; GCEN and NOD:** known (drafting-aids.md).
- **REDO after U `Nothing to redo` (p309, b09):** the `(ssget)` between them; p337 redoes.
- **A pick on a locked object starting a window:** known (command-line.md, erase/p211).
- **SPK-01 carried over to regions:** refuted. The help names 3D solids only, and p200 finds INT
  and APP on a region.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim                                                            | State                                 |
| ---------------------------------------------------------------- | ------------------------------------- |
| draw.md REGION "fitted ones by their curve"                      | false for Spline-fit (RGN-03)         |
| draw.md REGION "round more than one, their outline too"          | holds for faces sharing an edge only (RGN-05) |
| draw.md REGION snaps list                                        | QUA (RGO-02); APP missing (RGO-05)    |
| draw.md REGION "FILLET and CHAMFER refuse it"                    | in silence (RGO-03)                   |
| draw.md REGION STRETCH **unverified**                            | false (RGO-01)                        |
| draw.md REGION Missing: TRIM Standard refuses, Quick unverified  | no longer true / settled (RGO-06)     |
| draw.md REGION Missing "of solids and surfaces (none yet)"       | stale (BLN-07)                        |
| modify.md "what is neither … passed over"                        | false for SUBTRACT (BLN-04)           |
| modify.md "The first object of a set keeps…" (b01, s07)          | false under ALL and windows (BLN-02)  |
| modify.md Missing: preselection in SUBTRACT, **unverified**      | settled (BLN-01)                      |
| modify.md Missing: SUBTRACT's plane with nothing, **unverified** | settled (BLN-03)                      |

Checked and holding:

- The rest of both entries.
- `cad-engine.md`'s "A region and a solid are the kernel's" and "A boolean … is the kernel's".
- `cad-tools.md`'s one undo step per run (p105, p307, p308, p312, p313).
- The `SelectionActionTool` rule, which gains RGN-01's exception.

## 12. Order of execution and estimate

Group 1, this session, one commit per block, in this order:

1. **RGN:** RGN-01 to RGN-08. RGN-01's hook comes first: BLN uses it. About 2 h.
2. **BLN:** BLN-01 to BLN-08, and BSL-02 with BLN-02. About 2 h.
3. **BSL:** BSL-01, BSL-03, BSL-04. About 30 min.
4. **RGO:** RGO-01 to RGO-07. About 2 h.

Group 2, the desktop, a session of its own with the owner's mouse, block **RGD**:

- **d01**, through COM: a preselection, then REGION, UNION and SUBTRACT; MOVE as the control
  (REGIONS-D71).
- **d02:** SUBTRACT's first set while the second is asked: highlighted or not; Escape at each set.
- **d03:** a composite solid's grips and Properties palette.
- **d04:** the rollover and selection highlight of a region's edges; MATCHPROP onto and from a
  region.
- **d05:** BSL-03's composite in 2D Wireframe; a hatched region.
- The browser's look against the PNGs, by one subagent (template §4.8).

## 13. Changes the execution makes

- **Coverage:**
  - draw.md REGION: the preselection, order, colinear message, snaps, STRETCH, refusals, HATCH,
    Missing;
  - modify.md UNION / SUBTRACT / INTERSECT: the preselection, newest first, the first subset,
    22205, 22214, Previous in Missing, BSL-03's topology;
  - modify.md HATCH or draw.md HATCH: a region selected;
  - drafting-aids.md: APP of arcs;
  - command-line.md: preselection exceptions.
- **Catalogs:**
  - `regionOpenEdgesColinear`, and keys for 22205 and 22214, in en, es and pt-BR;
  - pt-BR UNION `U`.
- **Rules:**
  - `cad-tools.md`'s `SelectionActionTool` line: commands that drop a preselection;
  - `cad-runtime.md` Snapping: a region's QUA by its own axes.
- **Roadmap:** review 27 `plan`, then `done` with its areas.

## 14. Template improvements

- **A control in the same run settles a console suspicion.** p129's MOVE before REGION, and
  p349's EXTRUDE and SLICE, settled the preselection without the desktop. annex-probes.md §2: a
  behaviour that may be the console's carries a known command as its control.
- **`acad.pgp` aliases that shadow a built-in command** (pt-BR `U, *UNIAO`): the Phase 1 diff of
  the pgp should flag an alias equal to another command's local or global name. matrix.md row A.
- **Windows' PATH can be missing from the shell** (`cmd.exe: command not found` in
  `runacc.sh`). The subagent brief says to export it; better, `runacc.sh` adds
  `/mnt/c/Windows/System32` itself.
