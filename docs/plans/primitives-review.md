# 3D primitives review (BOX, WEDGE, CYLINDER, CONE, SPHERE, TORUS, PYRAMID)

> **Status:** group 1 executed, 2026-11-03: the console blocks PBX, SHD, PCY, PST, PPY, PLP, SPK,
> STF, SWR and SFL, one commit each (index below). Group 2 reviewed on the desktop the same day
> (d01–d13, the owner's mouse): its blocks PDT (the seven's behaviour) and PDJ (their jig) follow
> in the same session; once they land the plan shrinks to its summary and index.
>
> It owns the solid object (its B-rep, 2D Wireframe and isolines, picking, snaps, transforms,
> file), a height or radius given with the mouse off the plan, the primitives' grips, palette
> rows and shared defaults. It cites the LINE review (object snaps, point input, the command line,
> undo), ERASE's (`Select objects:`), Arrays', Clipboard's and the 3D interaction review's
> (`docs/plans/3d-interaction-review.md`: the aids off the plan).

## Summary

**Findings:** 0 critical, 5 high, 19 medium, 23 low, in ten console blocks and two desktop ones.

| Block | What                                                    | Critical | High | Medium | Low |
| ----- | ------------------------------------------------------- | -------- | ---- | ------ | --- |
| PBX   | BOX, WEDGE                                              | 0        | 3    | 3      | 1   |
| SHD   | the primitives' shared defaults                         | 0        | 0    | 1      | 0   |
| PCY   | CYLINDER, CONE                                          | 0        | 0    | 2      | 4   |
| PST   | SPHERE, TORUS (and the refusal of the bare point prompts) | 0      | 0    | 1      | 1   |
| PPY   | PYRAMID                                                 | 0        | 0    | 0      | 4   |
| PLP   | LASTPOINT in the seven                                  | 0        | 0    | 3      | 0   |
| SPK   | the solid's snaps and picking                           | 0        | 1    | 2      | 5   |
| STF   | transforms and other commands on a solid                | 0        | 0    | 1      | 2   |
| SWR   | 2D Wireframe, ISOLINES, REGEN                           | 0        | 0    | 1      | 1   |
| SFL   | file and clipboard                                      | 0        | 0    | 0      | 1   |
| PDT   | the desktop: what the seven read and keep               | 0        | 1    | 2      | 2   |
| PDJ   | the desktop: the jig (dynamic input, rubber band, ghost) | 0       | 0    | 3      | 1   |

The worst:

- **Intersection and Apparent Intersection find points on a solid's edges**, where AutoCAD finds
  none (its help says so too): with the default OSMODE a line crossing a box shows a marker AutoCAD
  never shows (SPK-01, p400, p401).
- **BOX drawn towards a smaller X keeps Rotation 0** (AutoCAD 180, as WEDGE already does here), its
  edges and grips on a frame turned the other way (PBX-01, p123); **after Length, the height is
  measured from the length's end** (AutoCAD: the far corner), and **a width given by a point is
  its distance from the length's end** (AutoCAD: square to the length's line) (PBX-02, PBX-03, p124).
- **None of the seven moves LASTPOINT as AutoCAD does**: a centre, an axis endpoint, 2Point's
  second point, the height prompt's base (the far corner, the base's centre) are LASTPOINT there;
  here the round solids never move it and the others leave the first corner (PLP-01 to PLP-03).

**Evidence:** 167 console probes in es-ES and en-US (pt-BR where its words are asked), p100–p158,
p200–p248, p300–p356, p400–p426, on AutoCAD 2027 (ACADVER 26.0, X.118.0.0; p01); the committed
build probes `solid/*` (2026-10-31 to 11-01, same build); `acad.cuix`'s RibbonRoot and MenuGroup;
each language's `acad.pgp`; the tables of 2026-10-31.

## Execution

| Block | Findings                                                                 | Commit   |
| ----- | ------------------------------------------------------------------------ | -------- |
| PBX   | PBX-01 to PBX-07 (BOX's Cube by a point from the centre doubled, p500)   | 3f031cad |
| SHD   | SHD-01                                                                   | 13cd770b |
| PCY   | PCY-01 to PCY-06                                                         | 7c7ad69a |
| PST   | PST-01, PST-02                                                           | bb26a486 |
| PPY   | PPY-01 to PPY-04; CONE's Top radius drifted as PYRAMID's (PPY-02, p248) | bf57cc9b |
| PLP   | PLP-01 to PLP-03                                                         | f80bb46b |
| SPK   | SPK-01 to SPK-08; an edge-on circle's Center from its rim (osnapz/o07)  | ed93ef45 |
| STF   | STF-01 to STF-03; ARRAYRECT's base Z for every object (arrays/p436)     | 08fa1e24 |
| SWR   | SWR-01, SWR-02: REGEN and REGENALL (p502)                                | faa3a067 |
| SFL   | SFL-01                                                                   | 9e4ae037 |

Left open by the execution, each in its coverage entry: a box turned 180 runs its edges as a box
turned, where ACIS mirrors p01's (BOX); a Cube by a point from the centre, doubled as Length's,
**unverified** (BOX); a typed window with no width on the screen finds nothing (p426,
command-line.md); `Oblique, non-uniformly scaled objects were ignored.` before a refused Quadrant
(osnapz/o07, drafting-aids.md); an elliptical cylinder's isoline offers NEA and CEN in AutoCAD
(p403), and NEA, PER and MID off the geometry in SE Isometric differ a little (s09); `20<45` at
BOX's Length read as an absolute point (p109: 87.0148), untested and in no entry yet. PRIM-D41's suspects are in the
roadmap for reviews 27 to 31.

## Inventory

- **Tools**: `cad/application/tools/BoxTool.ts` (BOX, WEDGE), `RoundSolidTool.ts` (CYLINDER, CONE,
  SPHERE, TORUS), `PyramidTool.ts`, `solidDefaults.ts`, `heightPick.ts`; `CommandLine.ts`
  (`TOOL_COMMANDS`), `CadRuntime.ts` (`setsLastPoint`, `startDrawingValues`).
- **The object**: `cad/geometry/solids.ts`, `brepCurves.ts`, `brepQueries.ts`;
  `cad/domain/solids.ts` (`solidStretchPoints`), `entityTransforms.ts`, `entityAffine.ts`,
  `objectArea.ts`, `solidGrips.ts`; `cad/application/SceneBuilder.ts` (2D Wireframe, isolines),
  `viewPick.ts`, `snapping/SnapEngine.ts`, `snapping/providers.ts`, `clipboard.ts`,
  `runtimeProperties.ts`, `tools/ExplodeTool.ts`; `cad/serialization/drawingFile.ts`
  (`solid3d`, versions 43–46, ISOLINES), `systemVariables.ts`.
- **Catalogs**: the seven's names (es `PRISMARECT`, `CUÑA`, `CILINDRO`/`CIL`, `CONO`, `ESFERA`,
  `TOROIDE`/`TOR`, `PIRAMIDE`/`PIR`; pt-BR `CAIXA`, `CUNHA`/`CN`, `CILINDRO`/`CIL`, `CONE`,
  `ESFERA`, `TOROIDE`/`TORO`, `PIRAMIDE`/`PIR`), their prompts, keywords and refusals in `en`,
  `es`, `pt-BR`.
- **UI**: the rail's primitives flyout (`packages/editor/src/tool-rail.tsx`), in acad.cuix's
  `ID_Panel3D_Modeling` order (Box, Cylinder, Cone, Sphere, Pyramid, Wedge, Torus; macros
  `^C^C_box ` …: match); `content/commands.ts` (filed under `draw`).
- **Tests**: `cad/application/solidCommands.test.ts`, `solidPrimitives.test.ts`,
  `solidHeights.test.ts`, `cad/geometry/solids.test.ts`, `cad/domain/solidGrips.test.ts`,
  `englishSurface.test.ts` (the seven walks), `tools/currentProperties.test.ts`,
  `visualStyles.test.ts` (2D Wireframe).
- **Knowledge**: `docs/coverage/draw.md` (BOX to PYRAMID), `.claude/rules/cad-tools.md`,
  `cad-runtime.md`, `cad-catalogs.md`, `cad-engine.md` (the solid paragraph), `cad-scene.md`.
- Commit `867931fe`; AutoCAD 2027 R26.0; tables of 2026-10-31.

## Probes

Console inputs are `scripts/research/probes/primitives/<id>.txt` (`.plain` untraced, `.es` /
`.en` / `.pt` one locale), run with `scripts/research/probe.sh primitives <ids>`. Transcripts in
`research/probes/primitives/` (gitignored). Several es-ES runs of p105–p124 and p213–p229 were
stopped by LIST's paging before QAFLAGS was added; what precedes it stands.

| Id                 | What it asks                                                                    |
| ------------------ | ------------------------------------------------------------------------------- |
| p01                | ACADVER and \_VERNUM                                                            |
| p100–p104          | es `CU`; `_.BOX`; `WE`; repeat by Enter; `'_BOX` at LINE                        |
| p105–p107          | 0 and negatives; another prompt's keyword; the local letters, pt-BR's `C`       |
| p108–p113          | `@`, polar, `#` / `*` after `_UCS _Z 30`, a typed Z, bare numbers, `<a`         |
| p114–p117          | snaps and a raised point for Cube; FRO and M2P; Ortho                           |
| p118–p125          | transparency; Enter; a command mid-prompt; properties; quadrants; Length's bases |
| p140–p154          | `_U` at every prompt of the seven; U, UNDO 2, REDO, MREDO; `(ssget "_I")`       |
| p155–p158          | the shared defaults across OPEN, the chain, Ttr's radius, PYRAMID's Type        |
| p200–p210          | CYLINDER–TORUS: aliases, repeat, `'`, another prompt's keyword, CONE's Top twice |
| p211–p215, p237–p239 | Enter and FOO at the point prompts; zero heights; pt-BR CONE's Enter          |
| p216–p224, p242, p246, p248 | `@`, bare numbers, `<a`, `*`, a raised radius point, polar, CONE's top |
| p225–p235, p243, p244 | Ttr, TAN, FRO, Ortho, transparency, properties, mid-command settings        |
| p236, p247         | Elliptical's distance to the first axis and its default                         |
| p240, p241         | five ellipses tilted by Axis endpoint; an apple's and a lemon's poles           |
| p300–p326          | PYRAMID: names, repeat, Sides, keywords, every point form, snaps, transparency  |
| p340–p356          | LASTPOINT in the seven; 2Point's FOO in five; pt-BR's height; WEDGE's centre    |
| p400–p407          | the solids' snaps (plan, SE Isometric, running), picks, CEN at a centre         |
| p408–p416, p420–p425 | ID/DIST/MOVE's LASTPOINT; MIRROR, SCALE, STRETCH, ARRAYRECT, EXPLODE; plots  |
| p417–p419, p426    | ISOLINES and REGEN; every kind to a DWG and back; a typed point at `Select objects:` |
| d01–d04            | desktop: the height, a radius, BOX's corner, length and width, Ortho and `<30` with the mouse |
| d05–d07            | desktop: Escape at every keyword's prompt, what a cancelled run keeps, U, the right button |
| d08–d10            | desktop: a turned box's and wedge's grips, the hover and markers, an apple's isolines |
| d11–d13            | desktop: each prompt's jig and dynamic input; es-ES's menu; pt-BR's Enter by COM |

## Matrix

States and citations per cell; `sP` is `solidPrimitives.test.ts`, `sC` `solidCommands.test.ts`.
Rows I, M, P, Q, dynamic input, Escape and the right button are PDT's in every block.

### PBX — BOX, WEDGE

Prompts: first corner `[Center]`, center, other corner / corner `[Cube/Length]`, length, width,
height `[2Point]`, 2Point's two points.

| Row | Cell | State |
| --- | --- | --- |
| A | names, aliases (en `WE`, pt-BR `CN`); es `CU` | match · n01, n02, p101 · sC:278, sP:357; **differs PBX-05** · p100 |
| A | repeat by Enter; `'_BOX` at LINE refused | untested · p103, p104 |
| A | the rail, acad.cuix order and macro | match · acad.cuix `ID_Panel3D_Modeling` |
| B | prompts and keywords, three languages | match · p01–p13, w01–w04 · sC, sP |
| B | Enter, FOO, 0, negatives, another prompt's keyword | match · p04–p06, p11, p12, p105, p106, p119 · sC:198; untested p106 |
| C | `x,y`, `x,y,z`, `@`, polar, `*` in a rotated UCS, bare numbers | match / untested · p07, p108–p112, p125 |
| C | a width or height given by a point after Length | **differs PBX-02, PBX-03** · p108, p109, p124 |
| C | a Cube or Length from a raised point | **differs PBX-04** · p114, p125 |
| C | WEDGE from its centre, Length by a point | **differs PBX-06** · p356 |
| C | `<a` at the other corner, Ortho's width side | unverified (PBX-07) · p113, p116, p117 |
| C | LASTPOINT | **differs PLP-03** |
| D | `_END`, `_MID`, `_FRO` at every point prompt; `_M2P` | owned (LINE) · p114, p115; known (drafting-aids.md) |
| E | `'ORTHOMODE`, `'ZOOM`, `'-OSNAP`, `'LINE` | owned · p118 |
| F | `_U` at every prompt; U, UNDO 2, REDO, MREDO, their names | untested · p140, p146, p147 |
| G | Enter at each prompt; a command typed mid-prompt | untested · p119, p120 |
| H | layer, colour, linetype, lineweight, ELEVATION, no THICKNESS, UCS | match · p07, p121, w05 · currentProperties (no probe cited) |
| H | settings changed transparently mid-command | untested · p122 |
| H | a corner at a smaller X | **differs PBX-01** · p123 |
| K | the words of every prompt and refusal, es and pt-BR | match · p05, p06, p11, p12, w03, w04 |
| L | the history line by line | match (the echo of an alias, owned) |

### SHD — the shared defaults

| Cell | State |
| --- | --- |
| BOX's length and width to WEDGE; the height to WEDGE, PYRAMID, CYLINDER, CONE, with its sign | match · x06, x07, p156 · sP:711 |
| the radius among CYLINDER, CONE, SPHERE, TORUS, PYRAMID; Ttr's radius; an Axis endpoint's length as the height | untested · x01, p156, p157 |
| U does not restore them | untested · p148 |
| across OPEN: kept, but the top radius | **differs SHD-01** · p155, p158 |

### PCY — CYLINDER, CONE

Prompts: centre `[3P/2P/Ttr/Elliptical]`, base radius `[Diameter]`, diameter, 3P's and 2P's
points, Ttr's tangents and radius, Elliptical's points, its Center and distance to the first axis,
height `[2Point/Axis endpoint(/Top radius)]` and its hidden Center or Top, 2Point, axis endpoint,
top radius.

| Row | Cell | State |
| --- | --- | --- |
| A | names, aliases, repeat, `'` | match / untested · n02, p200–p204 |
| B | prompt words, keywords and capitals, three languages | match · c01–c13, k01–k04, p245 |
| B | Enter, FOO at the point prompts; another prompt's keyword; CONE refuses `_C` | untested · p205–p211, p238 |
| B | a height of 0 in es and pt-BR | **differs PCY-01** · c06, k04, p214 |
| B | the distance to the first axis offers the shared radius | **differs PCY-02** · p151, p236, p247 |
| B | CONE's Top asked twice offers `<0.0000>` | **differs PCY-04** · p207 |
| B | pt-BR CONE: Enter at a height with no default ends it | **differs PCY-05** · k04, p215, p239 |
| C | `@`, bare `@`, numbers, polar, `*`; a raised radius point | untested · p216–p224, p242, p246, p248 |
| C | `<a` then a number | unverified (PDT) · p223 |
| D | Ttr on lines, circles, arcs; no deferred TAN at 3P; FRO; Ortho; Ttr's radius by two points | match / untested · c03, p225–p229 |
| E | transparency at every prompt | owned · p230–p232 |
| H | current properties, mid-command settings, tilted UCS with ELEVATION | untested · p234, p235, p243 |
| H | an elliptical base tilted by Axis endpoint | **differs PCY-03** · p240 |
| N | AutoCAD values without a source | **PCY-06** |

### PST — SPHERE, TORUS

| Row | Cell | State |
| --- | --- | --- |
| A | names, aliases, pt-BR `TOR` refused | match · n03, p200–p202 · sP:1851 |
| B | prompts, keywords, refusals but the bare point prompts | match · h01–h03, r01–r09 |
| B | Enter, FOO, a keyword at the bare 3P, 2P and tube 2Point prompts | **differs PST-01** · p143, p144, p153, p154, p212, p237, p350 |
| B | TORUS's diameter 0, then −10 | untested · p213 |
| C | `@` at the tube from the ring's point | untested · p217 |
| D | an apple's and a lemon's poles as Endpoints | holds, Missing says otherwise: **PST-02** · p241, p402 |
| H | current properties, UCS | match · h04, r04, p234 |

### PPY — PYRAMID

Prompts: centre `[Edge/Sides]`, Sides, Edge's two points, base radius `[Inscribed]` /
`[Circumscribed]`, height `[2Point/Axis endpoint/Top radius]`, top radius, axis endpoint, 2Point.

| Row | Cell | State |
| --- | --- | --- |
| A | names, aliases, the repeat writing the Type line again, `'` | match / untested · n02, p300–p303 · sP:678 |
| B | Sides 3 to 32, 4.5, −4, 0; keywords of other prompts; Enter at Edge and the axis | untested · p304–p313 |
| B | 2Point's refusals | **differs PST-01** · p312 |
| B | es and pt-BR words for a zero height, axis, 2Point, edge | **differs PPY-01** · y03, y06, p311, p351 |
| B | pt-BR: Enter at a height with no default ends it | **differs PPY-03** · y03, p352 |
| B | pt-BR's Sides refusal (`Requer um inteiro entre 3 e 32.`) | match · y03, p305 (the sweep's AcDimRes:5318 is another string) |
| C | every point form; `@` at the top radius | untested · p314–p318; **differs PPY-02** · p315 |
| C | a typed radius' turn in a rotated UCS; `<a` | unverified (PDT) · p317, p319 |
| D | END, MID, FRO at each prompt; Ortho with typed points | untested · p320–p322 |
| E | transparency | owned · p323, p324 |
| H | properties, mid-command settings | untested · p325, p326 |
| K | the sweep's pt-BR flags on three prompts | refuted by the console · y02, p305 |

### PLP — LASTPOINT

| Command | State |
| --- | --- |
| CYLINDER, CONE, SPHERE, TORUS | **differs PLP-01** · p343–p348, p353 |
| PYRAMID: Edge, Axis endpoint, 2Point; the centre and radius | **differs PLP-02** · p340, p349; match for the rest |
| BOX, WEDGE: Length, Center, Cube, 2Point; two corners | **differs PLP-03** · p341, p342, p356; match for two corners |
| the rubber band's base (`UseBasePoint`, `UseDashedLine`) | match at the distances and the height; where the trace has no base (other corner, Edge's second, axis endpoint, Elliptical) Ortho is PDT's |

### SPK — snaps and picking

| Cell | State |
| --- | --- |
| END, MID, NEA, PER on the edges, plan and SE Isometric, every kind | match · s01, s02, s09, s10, p402, p403 · sC:449, sP:1171, 1514, 1833 |
| CEN and QUA of circles and ellipses, frustums | untested · p402, p403 |
| CEN from a sphere's, a doughnut's isoline; END at an apex | match · s06, s07, s10 |
| INT and APP with a solid's edge | **differs SPK-01** · p400, p401 |
| CEN at a circle's or a cylinder's centre itself | **differs SPK-02** · s03, p407 |
| a typed `x,y,z` at `Select objects:` off the plan | **differs SPK-03** · p426 |
| the edge found in plan under another (wedge END, elliptical cylinder QUA) | **differs SPK-04** · p402 |
| NEA at an apex | **differs SPK-05** · p402 |
| CEN near a lemon's centre, zoomed in | **differs SPK-06** · p402 |
| CEN and a pick on an apple's outer equator | unverified (SPK-07, PDT) · p402, p407 |
| running snaps (OSMODE 4133, 512, 2) | untested · p404 |
| picks, windows, crossings, fences in plan; clicks in SE Isometric | untested · p405, p406 |
| GCE, NOD, TAN to an ellipse | known (drafting-aids.md) |
| N | **SPK-08** |

### STF — transforms and other commands

| Cell | State |
| --- | --- |
| MOVE, COPY, ROTATE, SCALE, MIRROR, in a tilted UCS, tilted solids mirrored | match · t01, t02 · sC:322, 350; untested p410, p424 |
| SCALE −2 and 0 refused | untested · p411 |
| STRETCH of a box, sphere, torus, a cone by its apex, a pyramid frustum by a corner | match · t03, t05, t06, p412, p423 · sC:370, sP:1884 |
| STRETCH of a cylinder by its seam or its base's centre | **differs STF-01** · p412, p425 |
| ARRAYRECT of a box | items match; the Base point's Z **differs STF-02** · p413 |
| ID, DIST, MOVE on a vertex: LASTPOINT | untested · p408 |
| AREA's Object, every kind | untested but box and cone · c01, k01, h01, r01, r05, w01, y01 |
| EXPLODE of the planar kinds; the curved ones (SURFACE) | match · p09, w07, y08; known, an apple's two POINTs: **STF-03** · p414 |
| OFFSET, TRIM, BREAK… refused | match · e01–e10 · sC:399 |

### SWR — 2D Wireframe, ISOLINES

| Cell | State |
| --- | --- |
| ISOLINES 0, 2047 taken; FOO, −1, 2048 refused; `'ISOLINES` inside BOX | match / untested · v01, p417 · sC:474 |
| ISOLINES reaching existing solids; REGEN, REGENALL | **differs SWR-01** · p417 |
| a solid under CECOLOR, CELTYPE, CELWEIGHT; a dashed linetype | untested · p415, p420 |
| CELTSCALE: a 3DSOLID keeps 1 | n/a here (no CELTSCALE) · p421 · PRIM-D63 |
| DISPSILH | known |
| N | **SWR-02** |

### SFL — file and clipboard

| Cell | State |
| --- | --- |
| every kind saved and opened, ISOLINES; AutoCAD's DWG keeps each primitive | untested but a box · p418, p419 · sC:474 |
| a version 43 file read back | untested |
| COPYBASE / PASTECLIP between drawings | owned (Clipboard) · contract holds |
| N | **SFL-01** |

### PDT, PDJ — the desktop (group 2)

Desktop probes d01–d13 (`scripts/research/probes/primitives/d<id>.sh`, each header saying what it
saw; screenshots in `research/probes/primitives/desk/`), 2026-11-03 with the owner's mouse: en-US
(d01–d11), es-ES (d12) and pt-BR (d13, COM alone), plan and SE Isometric. Scratch tests
`research/review/primitives/e/` (the cursor, the aids, dynamic input), `f/` (Escape, U, the
defaults, the right button), `h/` (grips); the browser's screenshots of the same scenes beside
AutoCAD's in the session's scratchpad (`g/`). PDT is the seven's behaviour, PDJ their jig.

| Row | Cell | State |
| --- | --- | --- |
| C | CYLINDER's, CONE's, PYRAMID's height read from the cursor in SE Isometric, up, down, aside | untested · d01 · scratch e/d01 (sH:81 holds them under a snap only) |
| C | a radius picked in SE Isometric with its centre off the work plane; CONE's top | **differs PDT-02** · d02 |
| C | `<30` at BOX's other corner, then a click or a number; a bare number there, a direct distance (p117's refusal was the console's) | untested · d03 a–c |
| C | the width's side with the cursor exactly on the length's line | **differs PDT-04** · d03 f (settles PBX-07, PRIM-D6) |
| D | Ortho at BOX's other corner | **differs PDT-01** · d03 d |
| D | Ortho at Length and the width, clicked and typed | untested · d03 e |
| D | Ortho and `<30` at Edge's second point, the axis endpoint, Elliptical's three points (bent and locked from the first point, the base's centre, the ellipse's centre) | untested · d04 · scratch e/d04 |
| D | dynamic input: what the height, radius, tube, top, length, width and other corner boxes read | **differs PDJ-01** · d01, d03 c, d11 |
| D | dynamic input: `10,5` typed at the other corner is relative; the Down arrow's list | owned (LINE; the list's look: known, drafting-aids.md) · d11, d12 |
| F | U after a run cancelled halfway: `BOX`, nothing undone | untested · d06 · scratch f/d06 (undoEcho.test.ts:254 holds the rule for ID) |
| G | one Escape cancels the command at every prompt a keyword opens, none steps back | untested · d05 · scratch f/d05 |
| G | what a cancelled run leaves as the next one's default | **differs PDT-03** · d06 |
| G | the right button: Enter, Cancel, the visible keywords, Osnap Overrides; Enter where no option | untested · d07, d12 · scratch f/d07 (Recent Input, SteeringWheels, QuickCalc: known, workspace.md) |
| I | a box and a wedge turned 180: their grips and drags | match but the wedge's base arrow: **differs PDT-05** · d08 · scratch h/d08 |
| K | pt-BR's Enter at CONE's and PYRAMID's height with no default ends them on the desktop too | known (PRIM-D20, D40) · d13 |
| M | the ghost at the height of the seven, at SPHERE's radius, TORUS's tube | match · d01, d11 |
| M | the dashed rubber band from the centre, ring point or base at the round solids' prompts | **differs PDJ-02** · d02, d07, d11, d12 |
| M | the ghost at the base radius, the ring, Elliptical's axes, the Top radius, the axis endpoint, BOX's length and width | **differs PDJ-03** · d11 |
| M | PYRAMID's base ghost | **differs PDJ-04** · d11 |
| P | the rollover and its tooltip, Endpoint's and Center's markers on a solid | match · d09 |
| Q | the crosshair off the plan (AutoCAD's three coloured arms) | known (coordinate-systems.md, UCS's Missing) · d09, d11 |
| D | an apple's isolines at its outer equator: drawn, picked, Center to the torus' centre | match · d10 (SPK-07 refuted) |

## Findings

### High

#### PBX-01 — BOX drawn towards a smaller X keeps Rotation 0; AutoCAD turns it 180, as WEDGE

- **Severity:** high · **Row:** H · **Status:** verified (reviewer: p123 en)
- **Where:** `cad/application/tools/BoxTool.ts:431` (`back` only for WEDGE)
- **AutoCAD:** p123, es and en: corners `0,0,0`→`-10,20`, `100,0,0`→`90,-20` and Center `200,0,0`
  → `190,-20` give `Rotation: 180`; `50,0,0`→`60,-20` gives 0. Its MPDUMP starts the edges at
  `-10,0,5`. p105 likewise with a direct distance.
- **mellowcad:** scratch `a/box.test.ts`: Rotation 0, the first edge at `-10,0,0`.
- **Scenario:** a box drawn right to left → LIST and the palette say 0 where AutoCAD says 180; the
  edge found in plan and the grips' frame differ.
- **Fix:** WEDGE's `back` rule for BOX, in corner and centre modes (PRIM-D2).
- **Regression test:** `solidCommands.test.ts`, the four corners of p123 and its edge order.
- **Coverage:** BOX's "Two corners make a box on the UCS's axes" says so.

#### PBX-02 — After Length, the height is measured from the length's end; AutoCAD from the far corner

- **Severity:** high · **Row:** C · **Status:** verified (reviewer: p124 en)
- **Where:** `BoxTool.ts:544` (`askHeight(footprint, this.widthBase(state), ctx)`) and
  `getConstraintAnchor` at the height.
- **AutoCAD:** the trace's BasePoint at the height is the far corner (p108, p03, p10, p13, x07);
  p124: `_BOX 600,0,0 _L 10 6 600,0,0` makes `Height: 11.6619`; from the centre, `_C 800,0,0 _L 10 6
  800,0,0` makes 5.8310 at Z −2.9155.
- **mellowcad:** 10 and 5 (scratch `a/box.test.ts`).
- **Scenario:** Length, then the height picked in plan or the cursor read along the Z → another
  height; the rubber band starts elsewhere (PDT).
- **Fix:** PRIM-D3. **Regression test:** `solidCommands.test.ts`, p124's two cases.

#### PBX-03 — BOX's width given by a point is its distance from the length's end; AutoCAD's is square to the length's line

- **Severity:** high · **Row:** C · **Status:** verified (reviewer: p124 en)
- **Where:** `BoxTool.ts:355` (`distanceTo(widthBase, point)`)
- **AutoCAD:** p124 `_BOX 0,0,0 _L 10 0,6 4` makes `Width: 5.5688` (6·cos 21.85°, the length's
  heading towards the console's cursor), Position 3.6042,4.4455; p108 `@0,6` 5.5688; p109 `@5<135`
  2.9139. WEDGE keeps the distance in space from the length's end (p124 `300,6` 11.6619; p125
  `210,6,8` 10), which mellowcad does.
- **mellowcad:** 9.5567, 6 and 5.
- **Fix:** PRIM-D4. **Regression test:** `solidCommands.test.ts`, citing p124, p108, p109.

#### SPK-01 — Intersection and Apparent Intersection find points on a solid's edges; AutoCAD finds none

- **Severity:** high · **Row:** D · **Status:** verified (reviewer: p400 en, scratch run)
- **Where:** `cad/application/snapping/providers.ts:895-903`, `:1255-1264` (only a solid's own
  pairs are skipped)
- **AutoCAD:** p400 (plan), p401 (SE Isometric), es and en: `_INT` and `_APP` on a line over a box,
  two boxes at Z 0 and 5, a box's own crossing edges: `No Intersection found for specified point.`,
  `No found for specified point.`. Help (Drafting Settings, Object Snap tab, 2027): intersections
  and apparent intersections "do not work with edges or corners of 3D solids".
- **mellowcad:** scratch `d/snaps.test.ts`: INT (0,10,0), (10,5,0), (10,5,5), (5,0,5); APP (5,20,0)
  and (10,20,0) on a box's own edges.
- **Scenario:** OSMODE 4133, a line drawn over a box → an Intersection marker AutoCAD never shows,
  and the click takes it.
- **Fix:** no INT or APP candidate from any solid edge (PRIM-D60). **Regression test:**
  `solidCommands.test.ts`, p400 and p401's cases.
- **Rules:** `cad-engine.md`'s solid paragraph says it.

#### PDT-01 — Ortho bends BOX's and WEDGE's other corner, so under Ortho two corners make no box; AutoCAD leaves the corner as picked

- **Severity:** high · **Row:** D · **Status:** verified (reviewer: scratch e/d03 d)
- **Where:** `cad/application/tools/BoxTool.ts:291-297` (`getConstraintAnchor` gives the first
  corner at `other`)
- **AutoCAD:** d03 d (en-US, ORTHOMODE 1): `BOX 0,0,0`, a click at 10.07,6.07, 5: Length 10.0742,
  Width 6.0663; `<30` there still locks it (d03 a, b).
- **mellowcad:** `Box of zero width not permitted.` twice, nothing made.
- **Scenario:** Ortho on (F8), BOX by two clicks → refused until Ortho is turned off.
- **Fix:** PRIM-D80. **Regression test:** `solidCommands.test.ts`, d03 d's box; WEDGE alike.

### Medium

#### PBX-04 — BOX's Cube or Length from a raised point takes the distance in space; AutoCAD in plan

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `BoxTool.ts:352` (`distanceTo` → `length3`)
- **AutoCAD:** p114 `_BOX 0,0,0 _C 0,30,8`: Length 30, Rotation 90, the next default `<30.0000>`;
  p125 Length from `300,30,8`: 30. WEDGE's stays in space (p125: 31.0483), as here.
- **mellowcad:** 31.0483 for BOX. **Fix:** PRIM-D5. **Regression test:** `solidCommands.test.ts`.

#### PBX-05 — es `CU` (`acad.pgp`: `CU, *CUÑA`) is unknown

- **Severity:** medium · **Row:** A · **Status:** verified
- **Where:** `cad/locales/es.json:610`
- **AutoCAD:** p100 (es-ES): `Comando: CU`, `CUÑA`, a wedge made.
- **mellowcad:** `Comando "CU" desconocido`. **Fix:** `"WEDGE": ["CUÑA", "CU"]`; coverage's title.
- **Regression test:** `solidPrimitives.test.ts`'s es names, citing p100.

#### PBX-06 — WEDGE from its centre, Length by a point, is half as long

- **Severity:** medium · **Row:** C · **Status:** verified (WEDGE); BOX's same path **unverified**
- **AutoCAD:** p356 `_WEDGE _C 1,2,0 _L 4,6,0 6 5`: `Length: 10.0000`, Rotation 0 (twice the
  point's distance, as a typed length from the centre, w09).
- **mellowcad:** 5 (scratch `c/pyramid.test.ts`). **Fix:** from the centre a length by a point is
  doubled as a typed one; the execution probes BOX's case (`_BOX _C … _L <point>`) first.

#### SHD-01 — The shared defaults survive OPEN in AutoCAD, all but the top radius; here OPEN resets them

- **Severity:** medium · **Row:** SHD · **Status:** verified (reviewer: p155 en)
- **Where:** `CadRuntime.loadDrawing` → `startDrawingValues` → `resetSolidDefaults`;
  `solidDefaults.ts:9` ("Per drawing and not saved, as CIRCLERAD").
- **AutoCAD:** p155: after `_.OPEN` of a drawing saved before any default, BOX offers `<10.0000>`
  and `<6.0000>`, CYLINDER the last radius, TORUS `<1.0000>`; opening a drawing saved with older
  values offers the newer ones (not saved in it); CONE's and PYRAMID's top radius `<0.0000>`. p158:
  PYRAMID's ` 6 sides  Inscribed` and TORUS's `<0.0000>` tube diameter after a diameter survive OPEN.
- **mellowcad:** scratch `a/shared.test.ts`: `Specify length:`.
- **Fix:** PRIM-D1. **Rules:** `cad-tools.md`'s "System variables" (a program-wide value is a session
  field) holds once fixed; coverage's **unverified** goes.

#### PCY-02 — Elliptical's distance to the first axis offers no default; AutoCAD offers the shared radius

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** p151 `Specify distance to first axis <5.0000>:`; p236, p247: `<7.0000>` after a
  radius of 7, kept over ellipses, `<3.0000>` after a SPHERE of 3; Enter takes it. CYLINDER and
  CONE alike.
- **mellowcad:** `Specify distance to first axis:`, Enter refused. **Fix:** PRIM-D23.

#### PCY-03 — An elliptical base tilted by Axis endpoint lies turned 90° when the second axis is the longer

- **Severity:** medium · **Row:** H · **Status:** verified; settles the coverage's **unverified**
- **Where:** `RoundSolidTool.ts:991`, `seamOf` (`:1215`, an ellipse always `axes.y`)
- **AutoCAD:** p240, five ellipses (second axis at 90°, 0°, 45°, 90°, 180°) tilted to the axis
  (−5,10,10): the turn in the plane is dropped; the major lies along the arbitrary axis' −X
  (0.8944, 0.4472, 0), the minor along its Y; the seam at the second axis' end (Y when it is the
  minor; −X when the major: major 8, seam at 162.1554,3.5777,0).
- **mellowcad:** cases 4–5 put the major along Y. **Fix:** PRIM-D24 (CONE shares the path).

#### PST-01 — The bare point prompts of SPHERE, TORUS and PYRAMID refuse with `Invalid point.`; here `Point or option keyword required.`

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `RoundSolidTool.ts:315-349` (3P, 2P, the tube's 2Point), `PyramidTool.ts:203`
  (`twoFirst`, `twoSecond`)
- **AutoCAD:** p143, p144, p153, p154 (untraced), p212 (pt-BR too), p237, p312, p350: Enter, FOO and
  a keyword at SPHERE's 3P first and second and 2P's ends, TORUS's 3P three points, 2P's ends and
  the tube's 2Point, PYRAMID's 2Point: `Invalid point.` (es `Punto no válido.`, pt-BR `Ponto
  inválido.`). SPHERE's third 3P point, and CYLINDER's and CONE's 3P, 2P, Axis, Elliptical, and BOX's
  2Point say `Point or option keyword required.` (p141, p151, p152, p140): match.
- **Fix:** PRIM-D7 (`{ refusal: "invalidPoint" }` per phase). **Coverage:** SPHERE's and PYRAMID's
  refusal claims.

#### PLP-01 — CYLINDER, CONE, SPHERE and TORUS never move LASTPOINT

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `RoundSolidTool.ts:315-349` (every point prompt declares a refusal, so
  `CadRuntime.setsLastPoint()` is false; the tool has none and never calls `setLastPoint`)
- **AutoCAD:** p343–p348, p353, en and es: a centre sets it; a radius, diameter, height, top or tube
  (typed or a point) does not; Axis endpoint and 2Point set their point; CYLINDER's and CONE's 3P,
  2P, Elliptical and Ttr leave the circle's centre; SPHERE's 3P the third point, 2P the second, Ttr
  nothing; TORUS the tube prompt's base (the ring's point). The rule under PLP-01 to PLP-03: a point
  answer sets it, a distance never does, and a height or tube prompt opening sets it to its base
  (p349, p356).
- **mellowcad:** scratch `c/lastpoint.test.ts`: 7,7,7 (the value before the run) in every case.
- **Scenario:** `CYLINDER 1,2,0 5 8`, then LINE `@5,0` → from the old LASTPOINT; AutoCAD from 1,2.
- **Fix:** PRIM-D41.

#### PLP-02 — PYRAMID's Edge, Axis endpoint and 2Point leave LASTPOINT wrong

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p340, p349: Edge — its first endpoint while the second is asked, then the base's
  centre; Axis endpoint its point; 2Point its second. **mellowcad:** 7,7,7 or the centre.
- **Fix:** PRIM-D41.

#### PLP-03 — BOX and WEDGE leave LASTPOINT wrong but after two corners

- **Severity:** medium · **Row:** C · **Status:** verified
- **AutoCAD:** p341, p342, p356: the footprint's far corner (the height's base) after Length,
  typed or by points, and from the centre at the centre's Z; a Cube the first corner or the centre;
  2Point its second point. **mellowcad:** the first corner, 7,7,7 from the centre, the other corner
  after 2Point. **Fix:** PRIM-D41, after PBX-02's far corner.

#### SPK-02 — `_CEN` at a circle's centre itself takes it; AutoCAD finds none

- **Severity:** medium · **Row:** D · **Status:** verified · the object snaps are the LINE review's
  (`docs/plans/line-review.md`); this is new evidence there
- **Where:** `providers.ts:288-299` (`notable`), `SnapEngine.ts:355`
- **AutoCAD:** p407 `(osnap '(0.2 0.1 0) "_cen")` on a CIRCLE and on a cylinder: nil; s03 likewise.
- **mellowcad:** scratch `d/p407.test.ts`: (0,0,0), (20,0,0); an elliptical cone's base centre at
  its apex in plan (p402). **Fix:** PRIM-D65.

#### SPK-03 — A typed `x,y,z` at `Select objects:` off the plan drops its Z

- **Severity:** medium · **Row:** picking · **Status:** verified · `Select objects:` is the ERASE
  review's (`docs/plans/erase-review.md`); new evidence there
- **AutoCAD:** p426, SE Isometric, a sphere at 50,10,5 r5: `55,10,5` finds it; `50,10,5` starts a
  window. **mellowcad:** the opposite; a click at the same world points matches.
- **Fix:** a typed point at `Select objects:` is projected along the line of sight, as a click.

#### STF-01 — STRETCH takes a cylinder by its seam's vertex; AutoCAD by its base's centre

- **Severity:** medium · **Row:** STF · **Status:** verified
- **Where:** `cad/domain/solids.ts:461-465` (`solidStretchPoints`)
- **AutoCAD:** p412: a crossing over the seam finds the cylinder and leaves it; p425: one over the
  base's centre moves a cylinder and a frustum; p412, p423: a cone by its apex, a pyramid frustum by
  a top corner move. **mellowcad:** the seam moves it, the centre does not.
- **Fix:** PRIM-D61. **Coverage:** BOX's "moves it whole once the window takes a vertex" is BOX's.

#### SWR-01 — REGEN and REGENALL are unknown; ISOLINES changes the solids at once

- **Severity:** medium · **Row:** O · **Status:** verified
- **AutoCAD:** p417: after `ISOLINES 16`, a 16-only isoline neither snaps nor picks until `_REGEN`
  (`Regenerating model.`). **mellowcad:** at once; `Unknown command "REGEN"`.
- **Fix:** PRIM-D62.

#### PDT-02 — A radius picked in a 3D view with its centre off the work plane is read on the work plane; AutoCAD on the plane through the centre

- **Severity:** medium · **Row:** C · **Status:** verified (scratch e/d02; the browser's ghost too)
- **Where:** `RoundSolidTool.ts:617` (`distanceTo(state.center, at)`, `at` on the work plane), the
  top at `:693`, the ghost's `reach` at `:561`; `PyramidTool.ts:383-384`
- **AutoCAD:** d02, SE Isometric, a click 100 px right of the centre's pixel: CYLINDER, SPHERE,
  PYRAMID (circumscribed) and TORUS at 300,100,30 give 25.8839, as at z 0 (25.8846); CONE's top
  28.3120, in the top's plane at the height the cursor read when Top was typed (the ghost's top
  sits there).
- **mellowcad:** 57.8858 (PYRAMID 81.8629 inscribed), CONE's top 54.1128; the ghost well past the
  cursor.
- **Fix:** PRIM-D82. **Regression test:** `solidHeights.test.ts`, the five at z 30, CONE's top.

#### PDT-03 — A size answered in a cancelled run is the next run's default; AutoCAD keeps the shared defaults only from a solid made

- **Severity:** medium · **Row:** G · **Status:** verified (scratch f/d06)
- **Where:** `PyramidTool.ts:659` (sides), `:505` (radius), `:540` (top), `:249` (Inscribed);
  `RoundSolidTool.ts:936`, `:729`, `:735`, `:719` (Diameter); `BoxTool.ts:510`, `:586`
- **AutoCAD:** d06: `PYRAMID _S 6`, Escape → the next ` 4 sides  Circumscribed`; `CYLINDER 0,0,0 7`,
  Escape → `<2.0000>`; `BOX 0,0,0 _L 12`, Escape → `<10.0000>`; CONE's `_T 2`, Escape → `<0.0000>`.
- **mellowcad:** ` 6 sides`, `<7.0000>`, `<12.0000>`; a cancelled PYRAMID's top leaks to CONE.
- **Fix:** PRIM-D83. **Regression test:** `solidPrimitives.test.ts` beside `:1287`, d06's four.

#### PDJ-01 — Dynamic input reads no distance from the cursor, and BOX's other corner shows one X,Y field

- **Severity:** medium · **Row:** D · **Status:** verified (scratch e/d01, e/dynplan; the browser)
- **Where:** `BoxTool.ts:684`, `:700`, `RoundSolidTool.ts:1157-1190`, `PyramidTool.ts:678`: no label,
  no `dynamicInput.setLive` (CIRCLE's at `CircleTool.ts:458`)
- **AutoCAD:** d01, d11: the height's box reads the cursor (31.5291 up, 30.9048 down: its size)
  beside a dotted dimension from the base; the radius 25.8846 beside one from the centre; the tube
  28.0104, the top 111.5499, the length 49.1578 with its angle, the width 5.1103; the other corner
  a length and a width field (10.0742, 5.0467), a `10` typed there the length (d03 c, dynamic input
  on).
- **mellowcad:** the prompt's words or the default in the box, one `X,Y` field at the other corner.
- **Fix:** PRIM-D81. **Coverage:** BOX's Missing loses "the height box's reading of the cursor".

#### PDJ-02 — The round solids draw no dashed rubber band at their distance prompts

- **Severity:** medium · **Row:** M · **Status:** verified (the browser: g/m-d11-sphere-radius,
  m-d11-torus-tube, m-d07-cylinder-height)
- **Where:** `RoundSolidTool.ts:537-588` (no `THEME.dashedRubberBand`; CIRCLE's at
  `CircleTool.ts:766-771`); PyramidTool alike
- **AutoCAD:** d02, d07, d11, d12: an amber dashed line from the centre, the ring's point or the base
  to the cursor at the radius, tube, top and height (in plan too).
- **Fix:** PRIM-D86.

#### PDJ-03 — Several prompts draw no ghost, or a wrong one

- **Severity:** medium · **Row:** M · **Status:** verified (the browser)
- **Where:** `RoundSolidTool.ts:566-584` (only SPHERE at the radius; Elliptical and Top fall to
  `[]`; the axis endpoint a height), `BoxTool.ts:310-341` (only `other` and `height`)
- **AutoCAD:** d11: CYLINDER's and CONE's base circle and TORUS's ring through the cursor at the
  radius; the ellipse at Elliptical's axes; the frustum at Top; the cylinder leaning to the cursor
  at Axis endpoint; a line from the corner at BOX's Length and the footprint at its width.
- **Fix:** PRIM-D87.

### Low

- **PDT-04** — With the cursor exactly on the length's line, a typed width always goes right
  (`BoxTool.ts:593`); AutoCAD's goes right only with the cursor past the length's end, left between
  and behind its start (d03 f, SNAPMODE putting the cursor on the line). PRIM-D84.
- **PDT-05** — A wedge's base arrow sits under its centre (`solidGrips.ts:96`); AutoCAD's under its
  tall end with the top's (d08: 20,10,-0.1 and 20,10,5 on a wedge turned 180). PRIM-D85.
- **PDJ-04** — PYRAMID's base ghost is its outline alone (`PyramidTool.ts:330-341`); AutoCAD's has
  its edges to the centre, a pyramid of no height (d11). PRIM-D87.

- **PBX-07** — A typed width's side with the cursor on the length's line flips with the console's
  floating noise (right at 22°, 26°, 31°, left at 159°, 164°: p03, x07, p124), so the coverage's
  "the right one with the cursor on the line" rests on an artefact; under Ortho the console takes
  the raw cursor's side (p116), ignores a bare number at the other corner (p117) and `<a` there
  (p113), where mellowcad bends them. **Unverified**: PDT (rectang/d01, d03 suggest mellowcad's).
  PRIM-D6.
- **PCY-01** — CYLINDER's and CONE's height 0 says BOX's words in es and pt-BR
  (`RoundSolidTool.ts:918`): the console's `El valor debe ser diferente de cero.` / `O valor deve
  ser diferente de zero.` (c06, k04, p214); 2Point and the axis keep `No puede ser un valor igual a
  cero.` / `Este valor precisa ser diferente de zero.` (c07, p214). PRIM-D21.
- **PCY-04** — CONE's Top radius asked twice in one run offers what was just typed; AutoCAD
  `<0.0000>` (p207). PRIM-D25. Escape after Top: PDT.
- **PCY-05** — pt-BR's CONE ends with nothing made at Enter on a height with no default (k04, p215,
  p239: `StringResult ""`, `CommandEnded`); en, es and pt-BR's CYLINDER refuse. PRIM-D20.
- **PCY-06** — AutoCAD values in tests without a source: `sP:820`'s starred Ttr line (p244), the
  round solids' rows of `currentProperties.test.ts` (p234, p235), BOX's and PYRAMID's (p121, p325).
- **PST-02** — TORUS's Missing says an apple's or a lemon's poles are no Endpoints here; both
  programs snap them (p241, p402: 0,0,±3.4641; 50,0,3). To Implemented, with a test.
- **PPY-01** — PYRAMID's zero refusals in es and pt-BR (`PyramidTool.ts:363`, `:387`, `:496`):
  height 0 `El valor debe ser diferente de cero.` / `O valor deve ser diferente de zero.` (y03,
  p351); an axis or 2Point of no length `El valor no puede ser cero.` / `Este valor precisa ser
  diferente de zero.` (y06, p311); an edge of none `El valor debe ser positivo y distinto de cero.`
  (y06). PRIM-D42.
- **PPY-02** — A point typed at Top radius is measured from a base the cursor moved while it was
  taken (`PyramidTool.ts:124-130`): p315 `_T @2,0` 2.0000 / 2.8284, here 2.0000302 / 2.8285.
  CONE's is right (p248).
- **PPY-03** — pt-BR's PYRAMID ends at Enter on a height with no default (y03, p352). PRIM-D40.
- **PPY-04** — PYRAMID's coverage: the 2Point refusal (PST-01), the top's `-1` cited to y03–y06
  (p309 shows it), the es words (PPY-01), the console cursor's artefact in a rotated UCS too (p317).
- **SPK-04** — In plan, the edge found under another: wedge `_END` at 90.05,0.05 gives (90,0,0),
  an elliptical cylinder's `_QUA` the top's (5,3,8); here (90,0,5) and (5,3,0) (p402). To Missing
  beside CYLINDER's Nearest; WEDGE's "ACIS's order decides the edge found in plan" is false for END.
- **SPK-05** — NEA at a cone's apex finds nothing; AutoCAD the apex (p402: 55,0,8).
- **SPK-06** — A lemon's Center within 0.3 of its centre, zoomed in, finds nothing; AutoCAD finds
  it (p402: 150.02,0.02 at a 10-unit view). Cause unverified.
- **SPK-07** — An apple's 0° meridian reaches its outer equator here (CEN and a pick there); in
  AutoCAD neither (p402, p407). **Unverified** as geometry: PDT (PRIM-D64).
- **SPK-08** — `solidCommands.test.ts:449-473`: a dead `void top`, an INT check that only tests the
  next prompt, `answer(cad, "\u001b")` typing text for Escape; `:491`'s title "read only (d03)"
  stale against g01. `commandLog()` is capped: a `written()` sliced by its old length returns `[]`
  once full (scratch runs, review D).
- **STF-02** — ARRAYRECT of a box: Base point Z 0 here, AutoCAD the box's 3D centre (p413: 5,10,2.5;
  level spacing 7.5). The array object is the Arrays review's.
- **STF-03** — TORUS's Missing says an apple or a lemon explodes as SPHERE's, a SURFACE; AutoCAD
  makes two POINTs of an apple (p414). Docs.
- **SFL-01** — The file round trip is tested for a box only (sC:474); every kind, ISOLINES and a
  version 43 file read back are untested (p418, p419; scratch passes).
- **SWR-02** — ISOLINES' FOO and −1 refusals untested (v01).

## Decisions taken

- **PRIM-D1:** the primitives' defaults are session values, kept across OPEN and NEW (NEW as OPEN:
  the console has none); the top radius alone resets on OPEN (p155, p158).
- **PRIM-D2:** BOX's footprint takes WEDGE's `back` rule, in corner and centre modes.
- **PRIM-D3:** after Length, the height's base is the far corner (the length's end plus the
  width's side; from the centre, the centre plus half of each); it feeds `getConstraintAnchor`,
  `pickedHeight` and a typed point.
- **PRIM-D4:** BOX's width from a point is its distance square to the length's line in plan, its
  side the cross product's sign; WEDGE's stays the distance in space from the length's end.
- **PRIM-D5:** BOX's Cube or Length from a point takes its plan distance and heading; WEDGE's stays
  in space.
- **PRIM-D6:** a typed width's side keeps today's rule until PDT; the coverage drops "the right one".
- **PRIM-D7:** each prompt PST-01 lists declares `{ refusal: "invalidPoint" }`.
- **PRIM-D20, D40:** pt-BR's Enter ending CONE and PYRAMID is not reproduced: a defect of one
  translation (an empty keyword status), en, es and pt-BR's CYLINDER refuse. A `WHY`, a note in
  `docs/i18n/pt-BR.md` and in each coverage entry; PDT checks it on the desktop.
- **PRIM-D21:** a height of 0 uses `valueMustBeNonzero` (the input function's words); 2Point and
  the axis keep `boxValueNonzero` (the command's).
- **PRIM-D23:** the distance to the first axis offers and takes the shared radius; an ellipse does
  not change it.
- **PRIM-D24:** a base tilted by Axis endpoint: the major along the arbitrary axis' −X, the minor
  along its Y, the seam at the second axis' end; equal axes take the "second not longer" branch,
  kept out of tests.
- **PRIM-D25:** CONE's top radius becomes the default when the cone is made, not when it is
  answered.
- **PRIM-D41:** LASTPOINT is fixed in the three tools (`setsLastPoint()` at their point phases,
  `ctx.setLastPoint(base)` when a height or tube prompt opens); the runtime's default is left alone.
  ArrayPolarTool, ExtrudeTool, SolideditTool, SplineEditTool, PlaneCutTool and RevolveTool declare
  a refusal at a point prompt without `setsLastPoint()` too: suspects for their reviews (27–31).
- **PRIM-D42:** one new key for a solid's axis or 2Point of no length (es `El valor no puede ser
  cero.`, pt-BR `Este valor precisa ser diferente de zero.`); the height `valueMustBeNonzero`, the
  edge `areaPositiveNonzero`.
- **PRIM-D43:** a test of TORUS's ring point moves the harness cursor to the console's corner
  (289.98397,116.30379), as the existing helpers do.
- **PRIM-D60:** no INT or APP candidate from any solid edge (help, p400, p401).
- **PRIM-D61:** a solid's stretch points are its vertices off closed circles and ellipses, the
  centres of its circular and elliptical edges, and a sphere's or torus' centre.
- **PRIM-D62:** ISOLINES keeps reaching the solids at once (there is no display list here: a `WHY`
  and a coverage note); REGEN and REGENALL are added as redraws that echo `Regenerating model.`.
- **PRIM-D63:** when CELTSCALE lands, a 3DSOLID keeps linetype scale 1 (p421); noted in BOX's entry.
- **PRIM-D64:** an apple's isolines wait for PDT.
- **PRIM-D65:** Center is found by touch for every curve, as for a sphere and a torus (SPK-02), in
  the object snaps' area under this review's ID.

- **PRIM-D80:** BOX's and WEDGE's other corner is exempt from Ortho (d03 d); `<a` still locks it
  (d03 a, b); Polar there is unprobed and left as it is.
- **PRIM-D81:** the height, radius, diameter, tube, top, length and width prompts label their box
  and feed `setLive` with the cursor's reading (its size), as CIRCLE does; BOX's other corner shows
  RECTANG's length and width fields. The dotted dimension is drawn as CIRCLE's radius one.
- **PRIM-D82:** a radius, diameter, tube or top picked freely (no snap, not typed) is read where the
  line of sight meets the plane through the centre (for the top, the top's plane at the height the
  cursor read last), as `PointResolver.onBasePlane`; a snapped or typed point keeps its distance in
  space (p242). The ghost reads it alike.
- **PRIM-D83:** a run keeps its answers in its state and writes the shared defaults when the solid is
  made, as PRIM-D25 does for CONE's top; Inscribed and Diameter, unprobed one by one, follow d06.
- **PRIM-D84:** on the length's line the width goes right with the cursor past the length's end,
  left otherwise.
- **PRIM-D85:** a wedge's base arrow sits under its tall end, with the top's; a wedge turned 0 is
  taken from d08's frame (MPGRIPDATA needs the desktop).
- **PRIM-D86:** the dashed rubber band runs from each distance prompt's base (the centre, the ring's
  point, the base's centre, the top's centre) to the cursor, as CIRCLE's.
- **PRIM-D87:** the ghosts of PDJ-03 and PDJ-04 are drawn as AutoCAD's d11 shows them; Cube's and
  2Point's, unprobed, stay as they are.

## Tests proposed

The regression tests are in each finding. The untested cells, by file:

- `solidCommands.test.ts`: BOX's repeat, `'_BOX`, another prompt's keyword, `*` and bare numbers
  (p103–p112, p125); U, UNDO 2, REDO, MREDO and their names for the seven (p146, p147); the
  preselection dropped (p149, p150); mid-command settings (p122); every kind's round trip and a
  version 43 file (p418, p419); picks, windows, fences (p405, p406); running snaps (p404);
  MIRROR of tilted solids, SCALE's refusals, ID/DIST/MOVE's LASTPOINT on a vertex (p408–p411, p424);
  AREA of every kind; ISOLINES' refusals (v01, p417).
- `solidPrimitives.test.ts`: the round solids' Enter, FOO and keywords of other prompts (p205–p211,
  p238), `@` and bare numbers (p216–p222), Ttr on a circle and an arc (p225), Ortho (p228),
  current properties and a tilted UCS (p234, p235, p243); PYRAMID's Sides bounds, Edge's and the
  axis' Enter, every point form, transparency (p304–p326); the shared defaults' chain (p156, p157).
- `currentProperties.test.ts`: the probe of each row (p121, p234, p325).

- PDT's untested cells: `solidHeights.test.ts`, the free cursor's height for CYLINDER, CONE and
  PYRAMID (d01); `solidCommands.test.ts`, `<30` and a bare number at the other corner, Ortho at
  Length and the width (d03), U after a cancelled BOX (d06); `solidPrimitives.test.ts`, Ortho and
  `<30` at the five base-less prompts (d04), one Escape at each keyword's prompt (d05), the Command
  menu's keywords and a right-click as Enter (d07).

## What is not tested and why

- The look of the rubber band, the ghost, grips and isolines on the canvas: presentation, PDT's
  screenshots against the harness's scene.
- The ZOOM `>>` prompt's keyword list and an apostrophe command's echo (`'CYLINDER` for
  `'_CYLINDER`): the View and LINE reviews' areas.

## What could not be reviewed and why

- Everything only the desktop shows (PDT): the jig and what it reads from the cursor (the height,
  the radius, a width's side, Ortho and `<a` where the trace has no base — the other corner, Edge's
  second point, the axis endpoint, Elliptical's points), dynamic input, Escape and the right
  button at every prompt, U after an Escape halfway, grips and the palette against g01 and d10, the
  hover and the snap markers on a solid, an apple's isolines (SPK-07), the pt-BR Enter quirks.
- NEW: the console has none (PRIM-D1 takes OPEN's answer).
- CLAYER on a solid: mellowcad has no `-LAYER` to set it in a scratch test (properties match).
- An elliptical cylinder's STRETCH; a top centre against a base centre.

## Refuted in the adversarial pass

- `@` measured from LASTPOINT rather than the prompt's base, at the second axis, the tube, the
  height and the axis: AutoCAD takes the base, as here (p216–p220).
- A direct distance at the second axis from the first axis' end: AutoCAD runs it from the centre,
  as here (p221).
- PPY-02's analogue at CONE's top radius: right (p248).
- 3P deferring TAN: AutoCAD defers none, as here (p226).
- p114's Center corner not doubled: `_MID` took another candidate (p114's trace); doubling holds.
- Every turn or top radius the console's fixed cursor gave in a rotated UCS or after `_ZOOM _E`
  (p110, p317, p320) and `<a` ignored at a jig prompt (p113, p223, p319): the console's artefact,
  for PDT.
- The sweep's pt-BR flags on `pyramidCenterOr`, `pyramidBaseRadiusOr`, `specifyBaseRadiusOr`, and
  `requiresIntegerBetween` (AcDimRes:5318 is another string): the console prints the catalog's.
- `_.BOX`, `_.PYRAMID`, `_M2P`: known (command-line.md, drafting-aids.md).

- SPK-07, an apple's isoline at its outer equator: the desktop draws the meridians out to it, and
  a hover there highlights the apple and finds Center at its centre (d10), as here; p407's nil was
  the console's.
- The browser's G-10 (the first point's empty `X,Y` box) and G-11 (the Down arrow's list): a rule
  (`cad-tools.md`) and a deviation with its `WHY` (drafting-aids.md). G-8 (the crosshair's coloured
  arms off the plan): known, UCS's Missing. G-12 (tracking along an edge's own line drawn across
  the view where AutoCAD labels an Extension, d09-mid): the probe ran with DYNMODE 0 and Polar
  unknown, so unverified; for the 3D interaction review.

## Coverage ↔ code ↔ AutoCAD, rules ↔ code

Rows that do not hold:

| Claim | State |
| --- | --- |
| BOX: two corners make a box on the UCS's axes | false for a smaller X (PBX-01) |
| BOX: a point gives its distance and heading (Cube, Length, width) | false for a raised point and the width (PBX-03, PBX-04) |
| BOX: the right one with the cursor on the line | the console's noise (PBX-07) |
| BOX: the per-drawing defaults reset on OPEN, **unverified** | false (SHD-01) |
| BOX: snaps as its edges; STRETCH by a vertex | INT and APP false (SPK-01); a cylinder's by its centre (STF-01) |
| WEDGE: ACIS's order decides the edge found in plan | false for END (SPK-04) |
| CYLINDER: Elliptical's `Specify distance to first axis:` | it offers the radius (PCY-02) |
| CYLINDER: an elliptical base tilted, its other in-plane turns **unverified** | settled, differs (PCY-03) |
| SPHERE: refusals are CYLINDER's | false at the bare points (PST-01) |
| TORUS: the poles as Endpoints, **unverified**, none here | both snap them (PST-02) |
| TORUS: an apple explodes as SPHERE's | two POINTs (STF-03) |
| PYRAMID: 2Point's `Point or option keyword required.`; the es words; the top's citation | false (PST-01, PPY-01, PPY-04) |
| `solidDefaults.ts:9`: per drawing, as CIRCLERAD | false (SHD-01) |
| `cad-tools.md`: LASTPOINT is the runtime's, a tool with a refusal at a point prompt says `setsLastPoint()` | broken in the three tools (PLP-01 to PLP-03) |
| `cad-engine.md`: a solid snapped as its edges, only at a sphere's or torus' centre and an apex | stale: no INT or APP; an apple's and a lemon's poles are Endpoints |
| `cad-catalogs.md`: the words differ per input function | broken (PCY-01, PPY-01, PST-01) |

Checked and holding: the prompts and keywords in three languages, the refusals but those above,
the tilted UCS and ELEVATION, current properties, one undo step and U's names, the preselection
dropped, the transforms but STRETCH's cylinder, AREA, EXPLODE's planar kinds, the file, `base ??
ctx.lastPoint` for `@` (p216–p220, p315), the hidden options (CYLINDER's Center, CONE's Top),
`a distance takes a point… the runtime measures` (p229).

## Order of execution and estimate

Group 1, one commit per block, in this order (each blocks the next only where said):

1. **PBX** — BoxTool's frame, far corner, width and raised points, WEDGE's centre, `CU`; about
   half a day. PLP-03 needs its far corner.
2. **SHD** — the defaults across OPEN; an hour.
3. **PCY** — the height's words, the first axis' default, the tilted ellipse, CONE's top, pt-BR's
   note, the sources; half a day.
4. **PST** — `Invalid point.` per phase (RoundSolidTool and PyramidTool), the poles' test and entry;
   an hour.
5. **PPY** — the zero words and the new key, the top's drift, pt-BR's note, the entry; two hours.
6. **PLP** — LASTPOINT in the three tools; two hours.
7. **SPK** — INT and APP, Center by touch, a typed point at `Select objects:`, NEA at an apex,
   the entries; half a day.
8. **STF** — STRETCH's points, ARRAYRECT's Z, the entries; two hours.
9. **SWR** — REGEN and REGENALL, ISOLINES' tests and `WHY`; an hour.
10. **SFL** — every kind's round trip and a version 43 file; an hour.

Group 2, after the desktop session (d01–d13), one commit per block:

11. **PDT** — Ortho at the other corner, the radius on the centre's plane, the defaults from a solid
    made, the width on the line, the wedge's base arrow, d01–d07's untested cells; half a day.
12. **PDJ** — the boxes' live readings and BOX's two fields, the dashed rubber band, the missing
    ghosts; half a day. After PDT: PDT-02's plane is what the ghost and the box read.

## Changes the execution makes

- **Coverage** (`docs/coverage/draw.md`, BOX to PYRAMID): every row of the table above; LASTPOINT
  in each entry; SHD's defaults; REGEN in its place; the **unverified** marks settled (OPEN, the
  poles, the tilted ellipse).
- **Rules**: `cad-tools.md` (the height or tube prompt's base is LASTPOINT; the defaults are
  session values), `cad-engine.md` (no INT or APP on a solid; the poles), `cad-catalogs.md` if a
  key's choice per input function needs a line.
- **Catalogs**: es `CU`; the new zero key in en, es, pt-BR; `npm run locales`.
- **i18n**: `docs/i18n/pt-BR.md`, the Enter quirk (PRIM-D20, D40).
- **PDT, PDJ**: BOX's Missing loses the height box's reading; the unverified side on the line
  (PBX-07) and an apple's isoline (SPK-07) settled; CYLINDER's and PYRAMID's "the cursor's
  reading **unverified** on the desktop" settled (d01); each entry says what a cancelled run keeps.
- **Roadmap**: review 26's state `plan`, `done` after PDT and PDJ; the suspects of PRIM-D41 for reviews 27
  to 31.

## Template improvements

- **`commandLog()` is capped**: a scratch `written()` sliced by the log's old length returns `[]`
  once it is full, and long scratch runs read "not found" (review D lost an hour). annex-probes.md
  §5: a fresh harness per case, or slice from the end.
- **LIST in a probe needs `QAFLAGS 2` from the first line**: three subagents lost es-ES runs to
  LIST's paging. annex-probes.md §2 says it for LIST; make it the first line of every probe that
  lists.
- **A command's own help sometimes settles a snap's absence** (SPK-01: "do not work with edges or
  corners of 3D solids"): template §4.1, read the Drafting Settings help for the object type before
  probing snaps one by one.
- **A refusal key chosen per input function**: three subagents found the same mix (the command's
  words or the input function's) in three tools; template §4.5 asks, per prompt, which of the two a
  refusal is, from the trace's AllowZero/AllowNone.
- **A cursor exactly on a line, on the desktop**: SNAPMODE 1 with SNAPUNIT 1 puts it there (d03 f),
  where the console's fixed cursor and a hand-placed pixel cannot (PBX-07). annex-probes.md §4.
- **A keyword typed mid-jig freezes what the jig read**: CONE's Top measured in the plane of the
  height the cursor gave when `T` was typed (d02); a desktop probe moves the cursor to a known
  place before typing a keyword. annex-probes.md §4.
- **The browser's look against the desktop's screenshots, by a subagent given the PNGs**: rows M
  and Q of seven commands in one pass (twelve findings, four refuted as known or ruled). Template
  §4.8: such a subagent gets the known gaps first (the crosshair, the Down list, the first point's
  box), or it reports them.
