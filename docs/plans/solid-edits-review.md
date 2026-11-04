# Solid edits review (SLICE, SECTION, FILLETEDGE, CHAMFEREDGE, SOLIDEDIT)

> **Status:** group 1 executed, 2026-11-04: the console blocks SLC, FED, SUB and SOE (with the
> LASTPOINT sweep ELP), one commit each (Execution, below). Group 2, the desktop block SED (the
> sub-objects' Ctrl gestures and look, the hovers, previews and grips, Escape and the right
> button, the clicks the console reads from its cursor), needs the owner's mouse and goes in a
> later session (§13); then the plan shrinks to its summary and index.
>
> This review owns the sub-objects: Ctrl+click and Ctrl+Space at `Command:`, their highlight,
> grips and selection, and `Select objects:`'s SUbobject mode on solids. It cites:
>
> - the LINE review (object snaps, point input, the command line, undo, transparency);
> - ERASE's (`Select objects:`, preselection) and Workspace's (the rail's macros);
> - the 3D primitives review (the solid object, its LASTPOINT rule PLP, the shared defaults;
>   `docs/plans/primitives-review.md`), the Regions review (the booleans, RGN-01's dropped
>   preselection, BLN-02's order; `docs/plans/regions-review.md`) and the Sweeps review (EXTRUDE's
>   height and taper defaults, EXT-07; `docs/plans/sweeps-review.md`).

## 1. Summary

**Findings:** 0 critical, 9 high, 21 medium, 14 low.

| Block | What                                                    | Critical | High | Medium | Low |
| ----- | ------------------------------------------------------- | -------- | ---- | ------ | --- |
| SLC   | SLICE (and SECTION's shared prompts)                    | 0        | 3    | 2      | 3   |
| SEC   | SECTION's own cells                                     | 0        | 0    | 1      | 0   |
| ELP   | LASTPOINT in the three tools (executed with each block) | 0        | 0    | 2      | 1   |
| FED   | FILLETEDGE, CHAMFEREDGE                                 | 0        | 1    | 5      | 3   |
| SUB   | sub-objects (the area this review owns)                 | 0        | 0    | 1      | 1   |
| SOE   | SOLIDEDIT                                               | 0        | 5    | 10     | 6   |

The worst:

- **The UCS's axes and origin were the frame's.** SLICE's and SECTION's YZ and ZX cut at the
  WCS's X and Y in a UCS turned about Z, and missed the solid in one turned about Y; Enter's
  `<0,0,0>` was the WCS's origin (SLC-01, SLC-02). SOLIDEDIT's Rotate did the same with Xaxis,
  Yaxis and its origin (SOE-12, SOE-20).
- **SOLIDEDIT ended at Enter** wherever AutoCAD refuses it and asks again (eight prompts, SOE-01);
  **a pick on an edge took one face**, where AutoCAD takes both (SOE-04); **its taper always
  offered `<0>`**, where AutoCAD offers the last one, EXTRUDE's (SOE-02).
- **SLICE and SECTION took a preselection** AutoCAD drops (SLC-03); **CHAMFEREDGE's Distance at
  its accept prompt** asked the pick's prompts and saved what AutoCAD keeps for that run (FED-01).

**Evidence:**

- 228 console probes in es-ES and en-US, pt-BR where its words are asked: `solid-edits/p100`,
  `p101–p179`, `p200–p266`, `p300–p374`, `p400–p405`.
- The earlier 2027 probes, read on the same build: `slice/s01–s13`, `section/c01–c10`,
  `filletedge/f01–f07`, `chamferedge/c01–c07`, `solidedit/e01–e12`, `solid/e01–e10`,
  `regions/p349`.
- `acad.cuix`'s MenuGroup.cui (the Solid Editing macros) and each language's `acad.pgp`.
- The tables of 2026-10-31. AutoCAD 2027, ACADVER 26.0, X.118.0.0 (p100). Tree at ae43b3f3.

## Execution

| Block   | Findings                                                    | Commit   |
| ------- | ----------------------------------------------------------- | -------- |
| SLC     | SLC-01 to SLC-08, SEC-01, ELP-01                            | 5671b1ab |
| FED     | FED-01 to FED-09, ELP-02, SUB-01, SUB-02 (docs, EDITS-D49)  | ec871bc9 |
| SOE (1) | SOE-01, SOE-04 to SOE-10, SOE-16, SOE-21, ELP-03            | 59a9024f |
| SOE (2) | SOE-02, SOE-03, SOE-11 to SOE-15, SOE-17 to SOE-20          | f874966c |

Left for SED: SLC-03's preselection through COM, SOE-04's and SOE-05's reach by a click, and the
desktop cells of §13. What the execution found beside the plan:

- CHAMFERA and CHAMFERB go from 0 to 1 with a chamfer made from the pick's defaults (p234): set
  at the commit here; whether AutoCAD sets them as the command starts is **unverified** (Missing).
- The rail's echo of a macro AutoCAD spells in capitals is the tool's `buttonEcho` (FED-08).
- With no height given yet, Enter at SOLIDEDIT's extrusion height is refused (`Requires numeric
  distance, two points, or option keyword.`, p406); the shared height keeps its sign (p407). It is
  `SolidDefaults.height`, program-wide as the primitives' and EXTRUDE's both were (PRIM-D1,
  EXT-07), each command setting it when it did before.
- SOE-11's bound reads the solid's box in the tool's frame: in a tilted UCS, **unverified**.
- A planar 3D polyline as SLICE's plane (p165) and the `_.` prefix (p104, p360) stay in Missing.
- `cad-tools.md` is at its byte cap: SLC's and FED's lines were made room for by tightening the
  same sections (`test/knowledge.test.ts`).
- Outside this review: SETVAR's `?` listing files DELOBJ with the newer variables, where
  workspace/p127 lists it with the older (Workspace's area, when next touched).

## 2. Inventory

- **Tools:** `cad/application/tools/PlaneCutTool.ts` (SLICE and SECTION, one class by mode),
  `EdgeBlendTool.ts` (FILLETEDGE and CHAMFEREDGE), `SolideditTool.ts` (SOLIDEDIT's faces, its
  `ribbonMacro()` for the rail's face buttons); `objectSelection.ts` as they use it; registration
  in `runtimeTools.ts` (the sweep and primitive settings shared) and `CommandLine.ts`.
- **The kernel and the model:** `cad/geometry/solidEdits.ts` (cut, section, face edits),
  `solidBlends.ts` (fillets and chamfers), `cad/domain/solidModeling.ts`; `DocumentSettings`'
  FILLETRAD3D, CHAMFERA, CHAMFERB (file version 49).
- **Sub-objects:** `cad/application/subobjectPick.ts`, `cad/domain/solidSubobjects.ts`,
  `cad/application/Selection.ts` (the subobjects kept apart), `tools/SelectTool.ts` (Ctrl+click,
  Ctrl+Shift, the Ctrl hover, `cycleSubobject`), `selectToolOverlay.ts` (`pushSubobjects`),
  `selectToolState.ts`, `CadRuntime.ts` (Ctrl+Space), `objectSelection.ts`' SUbobject and Object
  modes, `promptRefusal.ts`.
- **Catalogs:** the names; `slice*`, `section*`, `plane*`, `filletEdge*`, `chamferEdge*`,
  `edgeLoopOption`, `solidedit*`, `faceEdit*`, `selectFaces*`, `removeFacesOr`, `facesFound*`,
  `solidValidation*`, `modelingError*`, `keywordLabels.SLICE` / `SOLIDEDIT`, their `promptForms`
  and `answerForms`; en, es, pt-BR.
- **The UI:** the rail's Solid Editing slots (`packages/editor/src/tool-rail.tsx`: `slice`, the
  `filletedge` flyout with `chamferedge`, the `solideditextrude` flyout with taper, move, copy,
  offset, delete and rotate); SECTION and plain SOLIDEDIT typed only; acad.cuix `ID_Slice
^C^C_slice`, `ID_Section ^C^C_section`, `ID_FILLET_EDGE ^C^C_FILLETEDGE`, `ID_CHAMFER_EDGE
^C^C_CHAMFEREDGE`, `ID_FaceExtru ^C^C_solidedit _face _extrude` and its six siblings
  (`ID_FaceColor` with `^R`), Edge's and Body's; the landing's `content/commands.ts`.
- **Tests:** `cad/application/sliceSection.test.ts`, `edgeBlends.test.ts`, `solidedit.test.ts`,
  `subobjects.test.ts`; `cad/geometry/solidEdits.test.ts`, `solidBlends.test.ts`; the subobject
  parts of `tools/selection.test.ts` and `selectionModes.test.ts`; the five walks of
  `englishSurface.test.ts`.
- **Knowledge:** `docs/coverage/modify.md` SLICE, FILLETEDGE / CHAMFEREDGE, SOLIDEDIT;
  `docs/coverage/draw.md` SECTION; `docs/coverage/command-line.md` Ctrl+click and the SUbobject
  lines; the rules `cad-tools.md`, `cad-catalogs.md`, `cad-engine.md`, `cad-runtime.md`,
  `testing.md`.

The names match each language's `acad.pgp` (en `SL`, `SEC`; es `CO`, `SC`; pt-BR `FAT`, `SECAO`).
pt-BR's `SEC, *SECAO` points at an alias, and AutoCAD answers `SEC` as an unknown command (p103):
the catalog's absence of `SEC` holds. No `acc/…` citation is in the inventory. The catalog sweep
(`--from` the three tools, es and pt-BR) leaves no `lang-2027` or `en-2027`; its `lang-several`,
`lang-differs` and `no-source` keys were settled by the console (row K of each block).

Shared contracts swept by subagent A across the three tools: LASTPOINT (ELP) and the
preselection of the five commands. The undo keyword and the runs after options went to the
subagent of each command (they are each command's own).

## 3. Probes (`scripts/research/probes/solid-edits/`)

| Ids       | What they ask                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| p100      | ACADVER; SLICE's LASTPOINT after two points and Both                                                                                           |
| p101–p113 | SLICE's and SECTION's names (en, es, pt-BR), `_.` and repeat, `'SLICE`; FOO, Enter, identical and collinear points at each plane prompt; another prompt's keyword |
| p114–p129 | LASTPOINT at every point prompt of SLICE, SECTION, FILLETEDGE, CHAMFEREDGE and SOLIDEDIT (p126 inconclusive, p136 replaces it)                 |
| p130–p145 | the preselection of the five commands with MOVE as the control; `(ssget "_I")` and the Previous set after (p137–p139 settle nothing)            |
| p140, p179 | the missed plane's words, one solid and among several (+pt-BR)                                                                                |
| p146–p151 | the plane in a UCS turned Z 30 and X 90: two points, XY, View; SECTION in the tilted UCS                                                        |
| p152–p162 | the half's properties (p158), a locked solid, a block reference, a region and a line in the set (p152–p156 slipped, rerun as p158–p162)          |
| p163–p178 | planar Object (a line, a 3D polyline, a tilted circle, a locked one), its modes, Surface, the order ALL makes, `'ZOOM`, `'ORTHOMODE`, U, REDO, `UNDO 2`, a UCS moved to Z 3, YZ and ZX in turned UCSs |
| p200–p239 | FILLETEDGE's and CHAMFEREDGE's names, repeat, `'FILLETEDGE`; refusals and hidden keywords at each prompt; Expression's Enter, 0 and refusals; sizes by two points; locked, another solid, the same edge twice, Chain on a box; UCS picks; the accept prompt's Distance; a failure; SAVEAS and OPEN; `'ZOOM`; U, REDO |
| p240–p264 | SUbobject mode at ERASE, MOVE, COPY, ROTATE, SCALE, LIST: faces, edges, vertices, a window, a crossing, duplicates, Remove, a locked solid, `_O`, ALL, L, P (p248, p250–p253, p255 settle only LIST's refusal or slipped) |
| p265–p266 | FILLETEDGE's back edge in 2D Wireframe; Enter at Expression with an edge taken                                                                  |
| p300–p349 | SOLIDEDIT's Undo at every level; U, REDO, `UNDO 2`; the taper's default; the face pick (hidden, edge, twice, nothing, locked, two solids, C, F, CP, ALL, Remove); refusals at every prompt; Enter at the height; UCS axes; Copy's properties; SOLIDCHECK; the rail's macro; `'SOLIDEDIT`; Edge, Body, coLor, mAterial; the offset's bound |
| p350–p374 | `'ZOOM` at the fifteen prompts; names; `_.`; View; an axis of no length; the shared height and taper (p363, p364, p369, p372, p373); the plurals; the walk's edits; Remove's Undo |
| p400–p405 | Enter's refusal at Rotate's second axis point and angle, Taper's axis point and angle (p400, p401); Move's displacement by Enter (p402); p403 slipped; Rotate's origin by Enter in a moved UCS (p404); SOLIDCHECK across OPEN (p405) |

The transcripts are in `research/probes/solid-edits/` (gitignored). The scratch tests are in
`research/review/solid-edits/{a,b,c,r}/`.

## 4. Matrix

A row the same at every prompt takes one cell. `SS` is `cad/application/sliceSection.test.ts`,
`EB` `edgeBlends.test.ts`, `SE` `solidedit.test.ts`.

### SLC and SEC (SLICE, SECTION)

Columns: S1 `Select objects to slice:` (SECTION `Select objects:`); S2 the start point with
`[planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points] <3points>` (SECTION `Specify first point on
Section plane by […]`); S3 `Specify second point on plane:`; S4 planar Object's pick; S5
Surface's pick; S6 Zaxis's two points; S7 View's point `<0,0,0>`; S8 XY/YZ/ZX's point
`<0,0,0>`; S9 3points' three; S10 the side `[keep Both sides] <Both>`. SECTION has no S5 and no
S10; its cells are SLICE's unless named.

| Row | Cell                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | names and aliases en/es/pt-BR (pt-BR `SEC` unknown, `SECAO` runs CORTE; es `CO` CORTE, en `CO` COPY): match · p101–p103, c10 · SS; `_.SLICE`, repeat: untested · p104 |
| A   | `'SLICE`, `'SECTION` refused as not transparent: untested · p105; the rail's `_slice` echo: match · acad.cuix `ID_Slice`                          |
| B   | FOO, Enter, identical and collinear points at S3, S6, S7, S8, S9: untested · p106–p110, p112, p113; S2 FOO, S10: match · SS:127                    |
| B   | another prompt's keyword (`_B` at S2, S3; `_XY` at S10; `_S` at SECTION's start): untested · p111, p113                                            |
| B   | S4: a line or the solid passed over silently, a locked circle taken: differs SLC-05; S4's and S5's modes and words: differs SLC-06                 |
| B   | S1 with a preselection: differs SLC-03; Enter on an empty S1: differs SLC-04; a locked solid `1 was on a locked layer.`, a block reference, a region and a line: untested · p157, p159–p162 |
| C   | owned (LINE): the box's base is the first point at S3, S9 and the plane point at S6's second (the traces' `UseBasePoint`): contract holds · p114, p116, p118 |
| C   | LASTPOINT: differs ELP-01                                                                                                                         |
| D   | owned (LINE): snaps at the point prompts, none at S4, S5; `'ORTHOMODE` then a typed point: untested · p169                                         |
| E   | `'ZOOM _E` at S2, S3, S7, S10 and `'ORTHOMODE`: untested · p168, p169                                                                              |
| F   | U, REDO, `UNDO 2` (`SECTION SLICE`): untested · p170; no Undo keyword: n/a                                                                         |
| G   | Enter at S4, S5 ends it: match · p171, p174 · SS:123; Escape, the right button: desktop (SED)                                                     |
| H   | the half's layer, colour, linetype, linetype scale and lineweight (the source's): untested · p158; Both and the side kept: match · s01–s05 · SS:40 |
| H   | two points, XY, View in a UCS turned Z 30 and X 90: untested · p146, p148–p150; YZ and ZX in a turned UCS: differs SLC-01; Enter's `<0,0,0>`: differs SLC-02 |
| H   | a tilted circle as the plane: untested · p166, p167; the order ALL makes: differs SLC-07; SECTION's regions on the current layer, its normal in a tilted UCS: untested · p151; a region where the plane holds a face: differs SEC-01 |
| I, J | owned (3D primitives, Sweeps' SWO): the halves and the regions are the solid's and the region's objects                                          |
| K   | prompts, messages and pt-BR's own wordings (`Especificar o primeiro no plano`, `splice 2D`, `promptForms.sliceStartOr` open): match · p103, p107, p110, p140, p164, p174, p179; `sliceMissed`'s pt-BR branch: match · p140 (the suspect refuted, §10) |
| L   | line by line as rows B and H, but SLC-04 and SLC-06                                                                                              |
| M, P, Q | desktop (SED): the rubber band (traced dashed at S3, S9, S6's second), the plane and side kept as the cursor moves (Missing's **unverified**), the hover at S4, S5 |
| N   | SS: `:113` `void circle` asserts nothing, `:183` colour only; `:174` cites s07 for `1 selected solid` (p140 is the source), t1 (none; p174); `solidEdits.test.ts:215` `toEqual` on a `Vec3`, `:248` no normal (SLC-08) |
| O   | SLICE and SECTION have no row in `currentProperties.test.ts` (SLC-08)                                                                             |

### FED (FILLETEDGE, CHAMFEREDGE)

Columns. FILLETEDGE: C1 `Select an edge or [Chain/Loop/Radius]`; C2 `Select an edge chain or
[Edge/Radius]`; C3 `Select edge of loop or [Edge/Chain/Radius]`; C4 `Enter an option
[Accept/Next] <Accept>`; C5 `Enter fillet radius or [Expression]`; C6 `Enter expression:`; C7
`Press Enter to accept the fillet or [Radius]:`; C8 its `Specify Radius or [Expression]`; C9 the
grip's `Specify radius or [eXit]:`. CHAMFEREDGE: K1 `Select an edge or [Loop/Distance]`; K2
`Select another edge on the same face`; K3 the loop's pick; K4 Accept/Next; K5, K6 `Specify
Distance1/2`; K7 the expression; K8 `Press Enter to accept the chamfer or [Distance]:`; K9 its
distances.

| Row | Cell                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | names en/es/pt-BR: match · p200, p202, p203 · EB:122; repeat: untested · p200; `'FILLETEDGE` refused: untested · p201; the rail's echo: differs FED-08 |
| B   | wording in three languages: match · f01, f03, c02, p203, p222; hidden keywords at C1–C3, K1–K3: differs FED-05                                |
| B   | FOO at C1: match · EB:62; at C2, C3, K2: untested · p205, p223; at C4, C7 `Invalid option keyword.`: untested · p211, p213                    |
| B   | Enter at C1, K1: match · EB:110, :204; at C4, C5, C8, K5, K6: untested · f03, p237, p211, p238; at C6, K7: differs FED-03                     |
| B   | 0 or a negative typed at C5, K5: match · f01, c01 · EB:69, :200; from Expression: differs FED-04; a bare number at C1, K1: differs FED-06       |
| B   | another prompt's keyword at C1, C4, C5, C7, K5: untested · p204, p211, p213, p237, p238; K9's prompts and what they save: differs FED-01        |
| C   | a typed point taking an edge in plan, off plan, in UCS Z 30 and X 90, the back edge in 2D Wireframe: untested · p219–p221, p265               |
| C   | a point on nothing or a line asked again silently: untested · p214, p239; a size by two points: untested · p209, p210; LASTPOINT: differs ELP-02 |
| D   | owned (LINE): the pick takes no snap (`wantsSnap()` false), a size by two points through the runtime: contract holds                         |
| E   | `'ZOOM _E` at C1, C4, C5, C7 zooms and resumes, at C6 taken as an expression: untested · p226–p228                                            |
| F   | U names it and restores FILLETRAD3D, REDO: untested · p229; U after a run that made nothing: untested · p230; no Undo keyword: untested · p231 |
| G   | a failure ends it, nothing saved: match · p224 · EB:187; Escape, the right button: desktop (SED)                                              |
| H   | the solid edited in place (handle, layer, colour kept; History None): untested · f01; the volumes: match · `solidBlends.test.ts`             |
| H   | the sizes saved only at the commit: differs FED-02; locked, another solid's edge, the same edge twice, Chain with no tangent: differs FED-07     |
| I   | the arrow grip: desktop (SED); CHAMFEREDGE's grips: known (modify.md Missing)                                                                 |
| J   | FILLETRAD3D, CHAMFERA, CHAMFERB saved in the drawing: match · p225 · `drawingFile.test.ts:237`                                               |
| K   | the sweep's `lang-several` keys as the catalog has them (es `filletEdgeLoopOr` and `chamferEdgeLoopOr` apart, pt-BR `Selecionar`/`Selecione`, `edgeLoopOption`, the `Edge` labels); `expressionSyntax`'s pt-BR comma and es space: match · f03, c02, p203, p207 |
| L   | line by line as row B, but FED-01, FED-03, FED-04, FED-07, FED-08                                                                             |
| M, P, Q | desktop (SED): the edge's hover, Ctrl+Space at the pick, the preview, the grip's drag                                                     |
| N   | EB: `:110` cites `filletedge/e09` (none; p200), `:187` cites c04 for "saving nothing" (p224); `:227` `toBeGreaterThan(0)`, `:242` any grip (FED-09) |

### SUB (sub-objects)

Columns: Ctrl+click, Ctrl+Space and Ctrl+Shift+click at `Command:` (desktop); SUbobject mode at
the `Select objects:` of ERASE, MOVE, COPY, ROTATE, SCALE and LIST.

| Row | Cell                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| B   | SUBOBJSELECTIONMODE 0, LEGACYCTRLPICK 2 by default: known (command-line.md Missing) · p240                                                  |
| B   | SU at LIST refused (its set lists no SUbobject): match · p248 · `ListTool.ts:39`; SU's ALL and L refused, P `No previous selection set.`: match · p256 · `selectionModes.test.ts:539` |
| B   | SU's pick of a face, an edge, a vertex; a window; a duplicate; Remove; a locked solid; `_O` after: differs SUB-01                            |
| B   | SU's crossing inside a face `0 found`: untested · p258; a pick on nothing starts a window: untested · p263                                  |
| H   | MOVE, ROTATE, SCALE of a face, an edge, a vertex reshape the solid; COPY copies the whole; ERASE leaves it: differs SUB-01                   |
| G   | `(ssget "_I")` after a SU run: nil · p241: untested                                                                                         |
| O   | the WHY at `objectSelection.ts:1051` and command-line.md's "no object here has sub-objects": stale, SUB-02                                   |
| N   | `subobjects.test.ts` cites the desktop alone; `selectionModes.test.ts:539` matches erase/p132 without citing it (SUB-02)                      |
| I, M, P, Q | desktop (SED): the Ctrl hover, Ctrl+click, Ctrl+Space's order, Ctrl+Shift, the grips and their look, a locked solid under Ctrl, a selected face as MOVE's or ERASE's preselection, the palette of a face, an edge, a vertex |

### SOE (SOLIDEDIT)

Columns: S the solids option; F the face option; SEL `Select faces`; REM `Remove faces`; H the
extrusion's height; TX its taper; MB, MS Move's base and second point; AX the axis prompt; A1,
A2 its two points; OR the origin; AN the angle; OF the offset; TB, TA, TG Taper's base, axis
point and angle.

| Row | Cell                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | names en/es/pt-BR (no `acad.pgp` alias): match · p358, p359 · SE:159; `_.SOLIDEDIT`: untested · p360; `'SOLIDEDIT` refused: untested · p338      |
| A   | Enter at `Command:` repeats SOLIDEDIT from S, after a rail run too: untested · p337; the rail's order and macros: match · acad.cuix · SE:176     |
| B   | prompts in three languages: match · e01–e12, p308 · SE:52, :159; FOO at S, F, REM, OF, MB, A1, TB: untested · p318, e11, p324, e06, p330, p333; at SEL, H, TX, AN, TG: match · e11, e07, e08 · SE:78, :93, :141 |
| B   | Enter at MB, A1, A2, AN, OF, TB, TA, TG: differs SOE-01 (p324, p328, p330, p333, p400, p401); at H: differs SOE-03; at SEL with none, MS, AX, OR: untested · p301, p329, p402, p310, p309 |
| B   | TX's `<0>`: differs SOE-02; 0, 90 and zero edits: differs SOE-10; the offset's bound: differs SOE-11; H −2 with TX −5: untested · p325           |
| B   | another prompt's keyword (`P` at OF, `R` at H): untested · p324, p325; C, F, CP at SEL: known (modify.md Missing; AutoCAD takes them, p318–p320) |
| B   | the pick: a hidden face, the nearest the viewer: untested · p311, p312; an edge: differs SOE-04; a face again: differs SOE-05; nothing or locked: differs SOE-09; a second solid passed over: untested · p315 (SOE-19) |
| B   | ALL with none refused, then counted: untested · p317; ALL and Remove's words, `/ALL` once a pick started: differs SOE-08; a point at AN: differs SOE-21 |
| C   | owned (LINE): the tool parses its typed points from its base, `*x,y,z` read: contract holds · p331, p332; LASTPOINT: differs ELP-03             |
| D   | owned (LINE): snaps at MB, MS, A1, A2, OR, TB, TA, none at the face pick (its WHY): contract holds                                              |
| E   | `'ZOOM _E` at all fifteen prompts (`>>`, `Resuming SOLIDEDIT command.`): untested · p350–p357                                                   |
| F   | its Undo at S and F: differs SOE-06; at SEL and REM: differs SOE-07; U names `SOLIDEDIT`, the whole run: match · p306 · SE:71; REDO, `UNDO 2`, U after an empty run: untested · p306, p307, p360 |
| G   | eXit at each level: match · e01 · SE:65; Escape, the right button: desktop (SED)                                                              |
| H   | the edits' geometry: match · e01–e12 · SE; Copy's region on the current layer and properties: untested · p334 (SOE-17)                        |
| H   | Xaxis and Yaxis in a turned UCS: differs SOE-12; the origin's `<0,0,0>` in a moved UCS: differs SOE-20; edits the kernel refuses: SOE-13; a huge offset: SOE-15; an axis of no length: SOE-16; SOLIDCHECK: differs SOE-14 |
| I, J | n/a: no object of its own; the solid's and the region's are the 3D primitives' and Regions' reviews'                                          |
| K   | the sweep's keys (`removeFacesOr`, pt-BR `solideditHeightOr`, `solideditExtrudeTaper`) and the plurals: match · p305, p308, p313, p317, p322, p368 |
| L   | line by line as e01, e11, p352, but SOE-06 to SOE-10                                                                                          |
| M, P, Q | desktop (SED): the face's hover and selected look, a click on an edge (SOE-04) and on a selected face (SOE-05), coLor's dialog, the rubber bands at MS, A2, TA (traced dashed), dynamic input |
| N   | SE: `:86–87` pins `<0>` after Undo (p370), `:132` "and Undo" with none answered, `:83`, `:104` volumes with no probe (SOE-18)                  |

## 5. Findings

### High

#### SLC-01 — YZ and ZX cut through the frame's axes, not the UCS's

- **Severity:** high · **Row:** H · **Status:** verified (reviewer: p147, p172 and the scratch test)
- **Where:** `PlaneCutTool.ts:65-69` (`AXIS_NORMAL`), `:501-503`. The frame of a UCS turned about
  Z is the WCS, of a tilted one its OCS (`ucsFrame.ts`): neither's X is the UCS's.
- **AutoCAD:** p147 (`_UCS _Z 30`, YZ through 2,0,0): 953.8120 kept, 46.1880 made; p173 (ZX
  through 0,2,0): 480.3848 kept; p172 (`_UCS _Y 90`, YZ through −3,0,0): 300 and 700. SECTION
  alike.
- **mellowcad:** scratch `a/cells.test.ts`: 826.7949 for p147 and p173 (the WCS's X and Y); p172
  `Slicing plane does not intersect the selected solid.`
- **Scenario:** a UCS turned to a part's side, `SLICE` `YZ` through a point → the cut lies along
  the world's axes, or misses → AutoCAD cuts square to the UCS's X → a wrong part.
- **Fix:** EDITS-D9. **Regression test:** `sliceSection.test.ts`, p147, p172, p173.
- **Coverage, rules:** modify.md's "XY, YZ and ZX the UCS's" becomes true; `cad-tools.md` names
  `ctx.ucs` for a prompt's UCS axes and origin.

#### SLC-02 — Enter's `<0,0,0>` at View, XY, YZ and ZX is the WCS's origin

- **Severity:** high · **Row:** H · **Status:** verified (reviewer: p177)
- **Where:** `PlaneCutTool.ts:62` (`ORIGIN`), `:291-294`.
- **AutoCAD:** p177 (`_UCS _O 0,0,3`, XY, Enter): the cut at Z 3, 300 and 700; SECTION's View by
  Enter makes its regions at Z 3.
- **mellowcad:** scratch `a/more.test.ts`: `Slicing plane does not intersect…`, one solid of 1000.
- **Fix:** EDITS-D9 (the UCS's origin). **Regression test:** p177.

#### SLC-03 — SLICE and SECTION act on a preselection AutoCAD drops

- **Severity:** high · **Row:** A, B · **Status:** verified (reviewer: p130)
- **Where:** `PlaneCutTool.ts:135` (`this.selector.preselect(ctx)`).
- **AutoCAD:** p130, p131: MOVE takes the set (`1 found`); in the same run SLICE asks `Select
objects to slice:` and Enter says `No objects selected.`; SECTION alike (regions/p349 too). The
  same control shows FILLETEDGE, CHAMFEREDGE and SOLIDEDIT dropping it, as they do here (p132–p134).
- **mellowcad:** scratch `a/cells.test.ts`: `SLICE`, `1 found`, then the plane prompt.
- **Fix:** EDITS-D4: no `preselect`; the selection cleared as `EdgeBlendTool` clears it.
  **Regression test:** p130, p131. SED reconfirms through COM.
- **Rules:** `cad-tools.md`' `takesPreselection()` line names the `ObjectSelector` tools that drop it.

#### FED-01 — CHAMFEREDGE's Distance at the accept prompt asks the pick's prompts and saves them

- **Severity:** high · **Row:** B, J · **Status:** verified (reviewer: p222, p234, scratch `b/fed2`)
- **Where:** `EdgeBlendTool.ts:292-300` (`askSize("distance1", "accept")`), `:615` (`commit`).
- **AutoCAD:** p222, p234 (en, es, pt-BR): `Specify base surface chamfer distance or [Expression]
<1.0000>:` and `Specify other surface chamfer distance or [Expression] <1.0000>:` (50252 with
  22196, 22197; es `Precise superficie de base distancia de chaflán o [Expresión]`, `Precise otra
superficie distancia de chaflán…`; pt-BR `Especifique a distância da superfície de base do chanfro
ou [Expressão]`, `…da outra superfície do chanfro…`). The chamfer takes them (970), CHAMFERA
  and CHAMFERB stay `(1.0 1.0)`.
- **mellowcad:** `Specify Distance1 or [Expression] <1.00>: 2`, `Specify Distance2 …: 3`; the
  settings become 2 and 3.
- **Scenario:** edges taken, Enter, `D 2 3`, Enter → the next run says `Distance1 = 2.0000,
Distance2 = 3.0000`; AutoCAD's `1.0000, 1.0000`.
- **Fix:** EDITS-D41. **Regression test:** `edgeBlends.test.ts`, p222, p234; the English surface
  snapshot changes.
- **Coverage:** modify.md's "Enter makes it, … the distances saved".

#### SOE-01 — Enter at a point or value prompt ends SOLIDEDIT; AutoCAD refuses it and asks again

- **Severity:** high · **Row:** B, G · **Status:** verified (reviewer: p324, p328, p400, p401, scratch `c/soe3`)
- **Where:** `SolideditTool.ts:359-387` (`onEnter` falls through to `false`).
- **AutoCAD:** the traces mark MB, A1, A2, AN, OF, TB, TA, TG `AllowNone: false`. Enter says
  `Invalid point.` at MB, A1, A2, TB, TA (p328, p330, p400, p401, p333), `Requires numeric distance
or two points.` at OF (p324), `Requires valid numeric angle, second point, or option keyword.` at
  AN (p400), `Requires valid numeric angle or two points.` at TG (p401), and asks again; es `Punto
no válido.`, `Requiere un ángulo numérico válido, un segundo punto o una opción.`, `Requiere un
ángulo numérico válido o dos puntos.`.
- **mellowcad:** `Command:` after Enter at all eight.
- **Scenario:** an Enter too many while moving a face → SOLIDEDIT ends, the edits so far kept →
  AutoCAD asks again → the user restarts the command and its face selection.
- **Fix:** EDITS-D80. **Regression test:** `solidedit.test.ts`, one case per prompt.

#### SOE-02 — The extrusion's taper always offers `<0>`; AutoCAD offers the last, EXTRUDE's

- **Severity:** high · **Row:** B, H · **Status:** verified (reviewer: p308, p372)
- **Where:** `SolideditTool.ts:176`, `:811`.
- **AutoCAD:** p308: `<10>` later in the run and in the next; p370: `<20>` after Undo, Enter then
  1172.2954; p372: after `EXTRUDE … _T 10`, SOLIDEDIT offers `<10>`; p373: after SOLIDEDIT's 15,
  EXTRUDE's Taper angle offers `<15>`.
- **mellowcad:** `<0>`, and 1359.0081 where AutoCAD has 1346.2285 (p308).
- **Fix:** EDITS-D81. **Regression test:** p308, p370, p372, p373; `SE:86-87` corrected.

#### SOE-04 — A pick on an edge takes one face; AutoCAD takes both

- **Severity:** high · **Row:** B · **Status:** verified in the console (reviewer: p313, p361);
  the click's reach waits for SED
- **Where:** `SolideditTool.ts:499` (`faceAt`).
- **AutoCAD:** p313: `5,0,10` (the top front edge) → `2 faces found.`, offset 1 → 1210; p361: in
  plan, a point on a face seen edge-on → `2 faces found.`
- **mellowcad:** `1 face found.`, 1100.
- **Scenario:** in 2D Wireframe a user clicks the lines they see, the edges → one face moves →
  AutoCAD takes the two and the user removes one.
- **Fix:** EDITS-D86. **Regression test:** p313, p361.

#### SOE-12 — Rotate's Xaxis and Yaxis are the frame's axes, not the UCS's

- **Severity:** high · **Row:** H · **Status:** verified (reviewer: p331, scratch `c/soe.test.ts`)
- **Where:** `SolideditTool.ts:641-649` (`toAngle`).
- **AutoCAD:** p331 (`_UCS _Z 30`, Xaxis): 1032.2701; p367 (Yaxis): 879.5664; p366 (`_UCS _Y
90`, Xaxis the WCS's −Z): 1088.1635. Zaxis holds (p332).
- **mellowcad:** 1088.1635, 911.8365, 1000.
- **Fix:** EDITS-D90. **Regression test:** p331, p366, p367.
- **Coverage, rules:** modify.md's "(the UCS's)" becomes true; `cad-tools.md` as SLC-01.

#### SOE-20 — Rotate's origin `<0,0,0>` is the WCS's origin

- **Severity:** high (with SLC-02) · **Row:** H · **Status:** verified (reviewer: p404, scratch
  `r/origin.test.ts`)
- **Where:** `SolideditTool.ts` (the origin's Enter).
- **AutoCAD:** p404 (`_UCS _O 10,0,0`, Yaxis, Enter, 10°): 1103.5901, the top reaching Z
  11.9175: the axis through the UCS's origin.
- **mellowcad:** 927.2631, about an axis through the WCS's.
- **Fix:** EDITS-D90. **Regression test:** p404.

### Medium

#### SLC-04 — Enter on an empty set is silent

- **Row:** L, G · **Status:** verified · **Where:** `PlaneCutTool.ts:391-408` (`closeSet`).
- **AutoCAD:** p130, p131 (en, es, pt-BR): SLICE says `No objects selected.` (33672; es `No hay
ningún objeto seleccionado.`, pt-BR `Nenhum objeto selecionado.`); SECTION writes
  `No objects selected.No Solids, Surfaces or Meshes selected.` on one line, neither string ending
  in a newline.
- **mellowcad:** nothing. **Fix:** EDITS-D6, a new message in three languages. **Test:** p130, p131.

#### SLC-05 — planar Object passes over in silence what AutoCAD refuses with words

- **Row:** B · **Status:** verified · **Where:** `PlaneCutTool.ts:433-452` (`takeObject`).
- **AutoCAD:** a line or the solid itself: `Unable to extract the plane of the selected object.`
  (22074; es `Imposible extraer el plano del objeto designado.`, pt-BR `Não é possível extrair o
plano do objeto selecionado.`; p164, p178); a circle on a locked layer: `The object is on a locked
layer.` (p178). A planar 3D polyline gives its plane (p165).
- **mellowcad:** asked again in silence; the locked circle taken.
- **Fix:** both said, the prompt asked again. **Test:** p164, p178. **Coverage:** Missing's
  **unverified** settled; the 3D polyline stays Missing (now probed).

#### SEC-01 — A region where the plane holds a face faces the plane's normal; AutoCAD the face's

- **Row:** H · **Status:** verified · **Where:** `solidSection` (`solidModeling.ts`).
- **AutoCAD:** p177 (View at Z 3 across the two halves): +Z for the lower half's top, −Z for the
  upper half's bottom.
- **mellowcad:** +Z for both (scratch `a/more.test.ts`). `solidEdits.test.ts:248` asserts no
  normal. **Fix:** the face's outward normal. **Test:** p177.

#### ELP-01 — SLICE and SECTION never move LASTPOINT

- **Row:** C · **Status:** verified · **Where:** `PlaneCutTool.ts:182-196` (`takes()`'s
  `{ refusal }` at every point phase, no `setsLastPoint()`).
- **AutoCAD:** p100, p114–p120, p135: every point answered sets it — the start, the second, both
  Zaxis points, a typed View, XY, YZ or ZX point, the side's point, planar Object's typed pick;
  Enter's `<0,0,0>` and the keywords keep it. The third 3points prompt opens on the first point
  and sets it there (after `0,0,2`, `10,0,8`: `0,0,2`).
- **mellowcad:** 7,7,7 (the value before) every time; planar Object's typed pick sets it.
- **Fix:** EDITS-D3: `setsLastPoint()` at the point phases, `ctx.setLastPoint(first)` as the third
  opens. **Test:** p114–p120, p135.

#### ELP-03 — Three SOLIDEDIT answers do not set LASTPOINT

- **Row:** C · **Status:** verified · **Where:** `SolideditTool.ts:215`, `:244-247`.
- **AutoCAD:** p123–p125, p136: the face's typed point, Move's base (Enter's displacement leaves it
  at 0,0,1) and Rotate's first axis point set it; the rest holds here (the second points, a typed
  origin, Enter's origin keeping it, Taper's points, angles and sizes by points keeping it).
- **mellowcad:** 7,7,7. **Fix:** `setsLastPoint()` at those three. **Test:** p123–p125, p136.

#### FED-02 — The sizes are saved when the blend is made; AutoCAD saves them when answered

- **Row:** B, J · **Status:** verified · **Where:** `EdgeBlendTool.ts:612-618`, `:653-655`.
- **AutoCAD:** p208, p209: FILLETRAD3D 3 and 5 after `No fillet to be computed.`, the next run's
  `Radius = 5.0000`; p210, p233: `(5.0 1.0)`, `(2.0 3.0)` after `No edges to chamfer.`; U puts
  them back (p230); a modelling failure rolls them back (p224).
- **mellowcad:** 1, and 1 and 1. **Fix:** EDITS-D40. **Test:** p208–p210, p224, p233.

#### FED-03 — Enter at `Enter expression:` is refused with the syntax message

- **Row:** B, G · **Status:** verified · **Where:** `EdgeBlendTool.ts:810-818`.
- **AutoCAD:** from the pick's Radius or Distance it ends the command with the count and nothing
  made (`1 edge(s) selected for fillet.`, `No fillet to be computed.`, p206, p266; `No edges to
chamfer.`, p232); from the accept prompt's size it goes back to the accept prompt silently (p212,
  p235).
- **mellowcad:** `The syntax is incorrect…` and the expression asked again. **Fix:** EDITS-D42.

#### FED-04 — An expression of 0 or less says `Radius too small. *Invalid*`

- **Row:** B · **Status:** verified · **Where:** `EdgeBlendTool.ts:642` (`takeSize`).
- **AutoCAD:** p208 (0), p236 (−1), p233 (the distances): the size prompt again, no words; a typed
  0 keeps its words (f01). **Fix:** EDITS-D43. **Test:** p208, p233, p236.

#### FED-05 — The hidden keywords are refused

- **Row:** B · **Status:** verified · **Where:** `EdgeBlendTool.ts:223-249` (`options()`).
- **AutoCAD:** each FILLETEDGE pick prompt declares Edge, Chain, Radius and Loop, each
  CHAMFEREDGE one Edge, Loop and Distance (traces of f01, p204, c01, c02): `_E` at C1, K1 taken
  silently (p205, p223), `_L` at C3, K3 stays, `_L` at C2 opens the loop's prompt (p205).
- **mellowcad:** `*Invalid selection*`. **Fix:** EDITS-D44.

#### FED-07 — Four refusals are silent

- **Row:** B, L · **Status:** verified (en, es, pt-BR) · **Where:** `EdgeBlendTool.ts:479`
  (`edgeUnder` passes over locked solids), `:497`, `:509-513` (`takeEdge`).
- **AutoCAD:** a locked solid's edge `The object is on a locked layer.` (p215); another solid's
  `Cannot fillet multiple bodies.` (22180, p216), `Chamfering multiple bodies not allowed.` (22191,
  p231), not taken; the same edge again `Edge has already been picked.` (22203, p217, FILLETEDGE
  only); Chain with no tangent neighbour `No adjacent tangent edges found in chain.` (29677, p218,
  again at each repeat, p236), the edge taken.
- **mellowcad:** silent. **Fix:** EDITS-D46, EDITS-D47. **Coverage:** Missing's **unverified**
  on another solid's edges settled.

#### SUB-01 — SUbobject mode finds nothing on a solid

- **Row:** B, H · **Status:** verified; known in part (command-line.md Missing: MOVE, ROTATE, SCALE
  and ERASE on sub-objects, phase 6c)
- **Where:** `objectSelection.ts:1054`, `:1402`.
- **AutoCAD:** a face, an edge or a vertex `1 found` (p241–p243); a window round a box `20 found`
  (p257); a duplicate `1 found (1 duplicate), 1 total`, Remove `1 found, 1 removed, 0 total`
  (p260); a locked solid `1 found`, `1 was on a locked layer.` (p254); `_O` then a pick `1 found,
1 total` (p259). MOVE moves the face, edge or vertex (1500, 1100, 1066.67; p244–p246, p262);
  ROTATE and SCALE reshape (p249, p261); COPY copies the whole solid (p247); ERASE leaves the
  geometry and drops the primitive (p241, p264).
- **mellowcad:** `0 found`; a point typed on a face starts a window (`Specify opposite corner:`).
- **Fix:** EDITS-D49: phase 6c's; what the console showed goes to Missing.

#### SOE-03 — Enter at the extrusion's height ends the command; AutoCAD takes the primitives' last height

- **Row:** B · **Status:** verified (reviewer: p369, p373)
- **AutoCAD:** the prompt shows no default; Enter extrudes by the last height BOX, CYLINDER or
  EXTRUDE took and asks the taper: p326 → 10, p343 → 6, p363 → 4 (a CYLINDER after the BOX), p364
  → 7 (EXTRUDE); an extrusion does not set it (p342). The primitives and EXTRUDE share it: BOX
  offers `<7.0000>` after EXTRUDE 7 (p369), EXTRUDE `<10.0000>` after BOX 10 (p373).
- **mellowcad:** `Command:`; BOX's and EXTRUDE's defaults apart (`runtimeTools.ts:111-112`).
- **Fix:** EDITS-D82, EDITS-D121. **Test:** p326, p363, p364, p369, p373.
- **Areas:** the 3D primitives' shared defaults and EXTRUDE's (reviews 26, 28): a finding of this
  review (template §1.3).

#### SOE-05 — A face picked again takes the next one behind it

- **Row:** B · **Status:** verified in the console; the click waits for SED
- **AutoCAD:** p316: the top twice gives the top and the back (Y to 11, 1210); p314 agrees.
- **mellowcad:** `1 face found.` again, 1100. **Fix:** EDITS-D87. **Test:** p316.

#### SOE-06 — SOLIDEDIT's own Undo never says `Command has been completely undone.`, and at the solids option takes back a face edit

- **Row:** F, L · **Status:** verified · **Where:** `SolideditTool.ts:289-303`, `:493` (`undoOne`).
- **AutoCAD:** p300, p301: the message with nothing done, at S the checking line written again;
  p302: the first U after two edits silent, the second and third with the message (es `Todos los
efectos del comando han sido deshechos.`, pt-BR `O comando foi desfeito completamente.`); p303:
  Undo at S after a Face edit keeps it (1200).
- **mellowcad:** nothing said; p303 back to 1000. **Fix:** EDITS-D84.

#### SOE-07 — Undo at `Select faces` and `Remove faces`

- **Row:** F, B · **Status:** verified · **Where:** `SolideditTool.ts:329`.
- **AutoCAD:** `Face selection has been completely undone.` (22440; es `La selección de cara se ha
deshecho completamente.`, pt-BR `A seleção de face foi completamente desfeita.`) at SEL with none
  (p304) and at REM once nothing is left to undo (p305, p368, p374); at REM Undo puts the removed
  face back (p305: 1210), and with none removed changes nothing (p374).
- **mellowcad:** silent; `faces.pop()` drops the last added face at REM. **Fix:** EDITS-D83.

#### SOE-08 — What Remove and ALL say, and when ALL is offered

- **Row:** B, L · **Status:** verified
- **AutoCAD:** p322, p323, p318: removing a face not in the set says nothing; ALL at REM says
  nothing; once a pick has started, `/ALL` stays offered with the set emptied, and takes every face
  of the solid picked (`6 faces found.`).
- **mellowcad:** `1 face found, 0 removed.`, `1 face found, 1 removed.`; the last face removed,
  `[Undo/Remove]` and ALL refused (`englishSurface.txt:5475` pins it). **Fix:** as AutoCAD.

#### SOE-09 — A pick on nothing, or on a locked solid, is silent

- **Row:** B, L · **Status:** verified
- **AutoCAD:** on nothing `No solids detected.` (22460; es `Ningún sólido detectado.`, pt-BR
  `Sólidos não detectados.`, p336); on a locked solid `The object is on a locked layer.` then `No
solids detected.` (p321).
- **mellowcad:** silent. **Fix:** both said. **Coverage:** Missing's **unverified** settled; the
  WHY at `SolideditTool.ts:527-529` goes.

#### SOE-10 — Zero and out-of-range values make an edit

- **Row:** B, F · **Status:** verified
- **AutoCAD:** OF 0 and H 0 `Value must be nonzero.` (p324, p325); TX 90 `Angle must be greater
than -90 degrees and less than 90 degrees.` (22251, p327); TG 0 `The taper angle must be
non-zero and between -90 and 90.` (22336, p333); Move by zero `No change due to a zero
displacement vector.` (22368, p328, p402); Rotate by 0 `No change due to a zero rotation angle.`
  (22369, p330). None edits or writes the validation lines.
- **mellowcad:** a no-op edit with `Solid validation…` (a step the Undo keyword then counts); H 0
  taken; 90 `Modeling Operation Error:`. **Fix:** EDITS-D88.

#### SOE-11 — The negative offset's bound is −(the solid's largest box side)/2

- **Row:** H · **Status:** verified
- **AutoCAD:** `The offset distance must be greater than -10.0000.` (22361), asked again: e04 (a
  10 box: −5), p344–p346 (20×10×6, any face: −10), p348 (two faces: −10), p347 (cylinder r5 h10:
  −5), p365 (6×10×40: −20).
- **mellowcad:** `Modeling Operation Error:` and back to the options. **Fix:** EDITS-D85.
  **Coverage:** the Deviation goes.

#### SOE-14 — SOLIDCHECK does not exist

- **Row:** K, L · **Status:** verified
- **AutoCAD:** p335 (three languages): with SOLIDCHECK 0 the line reads `…SOLIDCHECK=0` and no
  validation lines follow; p405: it outlives OPEN, saved in no drawing.
- **mellowcad:** `Unknown command "SOLIDCHECK"`; the `=1` is written in the catalogs.
- **Fix:** EDITS-D89.

#### SOE-21 — A point at Rotate's angle asks a second point; AutoCAD measures from the axis' second point

- **Row:** B, C · **Status:** verified (reviewer: p125's trace, scratch `r/origin.test.ts`)
- **AutoCAD:** p125: the angle prompt's trace `BasePoint [10,0,10]`, `UseBasePoint` true;
  `20,1.7633,10` gives 10°.
- **mellowcad:** ` Specify second point:`, the angle never given.
- **Fix:** the angle phase's anchor is the second axis point (the origin under X, Y, Z or View).
  **Test:** p125.

### Low

#### SLC-06 — planar Object's and Surface's picks take AutoCAD's entsel answers

- **AutoCAD:** p171: `_L` and FOO `*Invalid selection*`, `Expects a point or Group`; p174 at
  Surface a point on nothing `No surfaces selected.`. **mellowcad:** `_L` takes the last object,
  FOO lists the selection modes; Surface's FOO and point `*Invalid selection*`.
- **Where:** `PlaneCutTool.ts:111-124` (`ONE_OBJECT_MODES`), `:188`. **Fix:** a pick with no modes,
  `Expects a point or Group`.

#### SLC-07 — ALL's halves and regions in drawing order; AutoCAD's newest first

- **AutoCAD:** p176 (SLICE: the second box's halves first), p151 (SECTION); picks in their order
  (p175). **mellowcad:** the first box's first (scratch `a/order.test.ts`): `ERASE _L` takes
  another. As BLN-02. **Fix:** the set's order.

#### SLC-08 — Tests and citations

- `SS:113` `void circle`, `:183` colour only, `:174` and t1's citations (p140, p174);
  `solidEdits.test.ts:215` `toEqual` on a `Vec3`, `:248`; no `currentProperties.test.ts` row for
  SLICE's half and SECTION's region; modify.md's s07 and t1 citations.

#### ELP-02 — FILLETEDGE's and CHAMFEREDGE's typed edge does not set LASTPOINT

- **AutoCAD:** p121, p122: a point typed at `Select an edge` sets it; sizes by two points keep it.
  **Where:** `EdgeBlendTool.ts:199-210`. **Fix:** `setsLastPoint()` at the pick.

#### FED-06 — A bare number at the edge pick is refused

- **AutoCAD:** p204, p223: `0` picks at LASTPOINT (10,10,0, an edge there: `1 edge(s)`), `-1`
  misses silently. **Where:** `EdgeBlendTool.ts:742`. **Fix:** EDITS-D45 (`typedPick`).

#### FED-08 — The rail echoes `_filletedge`; the ribbon's macro is `^C^C_FILLETEDGE`

- **Where:** `CadRuntime.ts:1189` lowercases every echo. **AutoCAD:** acad.cuix `ID_FILLET_EDGE`,
  `ID_CHAMFER_EDGE`. **Fix:** EDITS-D48.

#### FED-09 — Tests and citations

- `EB:110` cites `filletedge/e09` (none: p200), `:187` cites c04 (p224), `:227`
  `toBeGreaterThan(0)`, `:242` any grip.

#### SUB-02 — A stale WHY and a false coverage line

- `objectSelection.ts:1051`'s WHY and command-line.md's "(no object here has sub-objects)", false
  since solids (p241); `subobjects.test.ts` and `selectionModes.test.ts:539` cite no probe.

#### SOE-13 — The kernel refuses edits AutoCAD makes

- p371: after the top extruded 2 with taper 5, Rotate of the front face by Xaxis −10, its Taper 5
  and Move of the left face −1 all succeed in AutoCAD (1218.2160); here `Modeling Operation
Error:` twice, then 103009 (`englishSurface.txt:5503-5526`). **Fix:** EDITS-D91 (Missing).

#### SOE-15 — A huge offset changes nothing in AutoCAD

- p349: offset 100000, silently nothing; here 20,001,200. **Fix:** EDITS-D91 (Missing).

#### SOE-16 — A rotation axis of no length

- p362: taken; a point at the angle then `No change due to a zero rotation angle.`; here the second
  point asked again silently (`SolideditTool.ts:616`). **Fix:** as AutoCAD.

#### SOE-17 — Copy's region has no row in `currentProperties.test.ts`

- p334: the current layer and properties, as here. **Fix:** the row.

#### SOE-18 — `solidedit.test.ts`

- `:86-87` pins `<0>` after Undo (p370), `:132` "and Undo" with none, `:83`, `:104` volumes no
  probe gives, `:111` an analogue of e12.

#### SOE-19 — Missing's "faces of several solids at once" is no gap

- p315: AutoCAD takes the first solid's faces and passes the second's pick in silence, as here.
  **Fix:** Implemented.

## 6. Decisions

- **EDITS-D1:** LASTPOINT is read mid-command with `'_SETVAR LASTPOINT` and Enter: transparent,
  it changes nothing.
- **EDITS-D2:** the alias on one line and the `'_X` echo are the command line's (LINE), not these
  tools'.
- **EDITS-D3:** the 3points rule is "the third prompt sets it to its base" (PLP's pattern), not a
  case of the second point.
- **EDITS-D4:** the preselection follows the console with MOVE as the control, as RGN-01 did; SED
  reconfirms it through COM, and a refutation there reverts it.
- **EDITS-D5:** SLC-01 and SLC-02 are high, as RVL-04 was.
- **EDITS-D6:** SECTION's two messages on one line as the console prints them: the console wins
  over the tables' spacing.
- **EDITS-D7:** p178's slipped tail is not rerun: its answers came before.
- **EDITS-D8:** SOLIDEDIT's cells are subagent C's; A's suspects for it (p125, the origin) were
  probed by the reviewer (SOE-20, SOE-21).
- **EDITS-D9:** the plane's normals and origin from `ctx.ucs` (XY its Z, YZ its X, ZX its Y,
  `<0,0,0>` its origin), in the tool's frame.
- **EDITS-D40:** a size is saved with `setCommandSettings` when its prompt is answered (the pick's
  Radius or Distance, the accept's Radius, f01), and rolled back by a modelling failure (p224).
- **EDITS-D41:** the accept prompt's Distance gets two prompt ids, `chamferEdgeBaseDistanceOr` and
  `chamferEdgeOtherDistanceOr` (50252 with 22196, 22197, worded from the console in three
  languages); its values serve that run only.
- **EDITS-D42:** Enter at `Enter expression:` from a pick's size ends the command with the count and
  `No fillet to be computed.` / `No edges to chamfer.`; from the accept's size it asks the accept
  prompt again.
- **EDITS-D43:** an expression of 0 or less asks the size again, silently.
- **EDITS-D44:** every keyword the `initget` declares is offered at each pick prompt, the unlisted
  hidden; the refusal lists the listed ones. `Chain` at the chain prompt stays (trace only).
- **EDITS-D45:** a bare number at the pick goes through `typedPick` / `ctx.pointAtDistance`, as
  BREAK's.
- **EDITS-D46:** locked solids' edges are found, then refused, as `lockedObjectAt` does; the new
  messages' es and pt-BR from the tables (22180, 22191, 22203, 29677), checked against the console.
- **EDITS-D47:** `Edge has already been picked.` is FILLETEDGE's alone; Chain repeats its message.
- **EDITS-D48:** (the reviewer, over B's first choice) the rail echoes the macro as acad.cuix
  spells it, `_FILLETEDGE`: Workspace's rule is the macro's echo, and its case is part of it.
- **EDITS-D49:** no partial SUbobject mode before phase 6c; the WHY and command-line.md corrected,
  p241–p264's facts in Missing.
- **EDITS-D50:** B's scratch tests move into `edgeBlends.test.ts`, `selectionModes.test.ts` and
  `subobjects.test.ts`, citing `solid-edits/p2xx`.
- **EDITS-D80:** Enter at a prompt the trace marks `AllowNone: false` refuses in that prompt's
  words and asks again.
- **EDITS-D81:** the extrusion's taper default is EXTRUDE's (one `SweepSettings` taper, set by
  either).
- **EDITS-D82:** one height shared by the primitives, EXTRUDE and the extrusion's Enter; an
  extrusion of SOLIDEDIT does not set it (p342).
- **EDITS-D83:** two face-selection undo stacks, the adds and the removes;
  `Face selection has been completely undone.` when the stack is or becomes empty.
- **EDITS-D84:** `Command has been completely undone.` when no edit of the run is left before or
  after the Undo; at S, Undo takes no face edit back (p303).
- **EDITS-D85:** the offset's bound checked before the kernel: −(largest box side)/2, worded at
  LUPREC.
- **EDITS-D86:** an edge under the pick box takes its two faces; SED confirms the reach.
- **EDITS-D87:** a face already taken gives the next one along the line of sight; SED confirms.
- **EDITS-D88:** a zero edit is said and makes no step.
- **EDITS-D89:** SOLIDCHECK a system variable (0 or 1), program-wide (p405: it outlives OPEN),
  read by the checking line and the validation lines.
- **EDITS-D90:** Rotate's X, Y and Z axes and its `<0,0,0>` from `ctx.ucs`.
- **EDITS-D91:** SOE-13 and SOE-15 go to Missing, not chased in the kernel now.
- **EDITS-D120:** the ELP findings are executed with their tool's block (ELP-01 with SLC, ELP-02
  with FED, ELP-03 with SOE).
- **EDITS-D121:** the shared height (p369, p373) is executed in SOE with SOE-03, though it touches
  BOX's and EXTRUDE's defaults (reviews 26, 28): one value, one fix.
- **EDITS-D122:** SOE is executed in two commits (§12): its dialogue, then its values and axes.
- **EDITS-D123:** SUB's fixes are docs and tests (EDITS-D49); they go in FED's commit, which moves
  B's scratch tests.

## 7. Tests proposed

Regression tests first, each in its finding. Then, by file:

- `sliceSection.test.ts`: p104, p105, p106–p113 (refusals and Enter), p146–p151 (the UCSs),
  p157–p162 (the sets), p158 (the half's properties), p166–p170 (the tilted circle, `'ZOOM`, undo).
- `edgeBlends.test.ts`: p200, p201, p205, p209–p214, p219–p221, p226–p231, p237–p239, p265.
- `selectionModes.test.ts`: SU's refusals cited (p248, p256), the crossing inside a face (p258).
- `solidedit.test.ts`: p301, p306, p307, p309–p312, p315, p317, p324, p325, p329, p334, p337, p338,
  p350–p357, p360, p402.
- `currentProperties.test.ts`: SLICE's half (DERIVED), SECTION's region and SOLIDEDIT's Copy
  (FROM_SCRATCH).

## 8. What is not tested and why

- The look of a sub-object, an edge's hover, a preview mesh, the grips: presentation, the desktop's
  (SED).
- TypeScript holds the prompts' ids and the keywords' shapes.

## 9. What could not be reviewed and why

- Escape mid-command, the right button, the rubber bands and jigs, dynamic input, clicks (not
  typed points) at the face, edge and object picks, the macros' echo and Ctrl+click: the desktop
  (SED).
- Whether a refused side point or second point sets LASTPOINT: no probe separates it from the
  answer after (**unverified**).

## 10. Refuted in the adversarial pass

- **pt-BR `sliceMissed`'s `o 1o. sólido selecionado`**: the console prints it for one solid missed
  among several (p140); s07 was a set of one, the other message (`sliceMissedOne`). console-pair
  paired the two.
- **`'ZOOM _E` refused for a regen** (RVL-09's analogue): AutoCAD zooms at every prompt of the five
  (p168, p226, p227, p350–p357).
- **A refused expression swallowing the next answer** (EXT-02's analogue): holds (p207).
- **SU at LIST**: AutoCAD refuses it too (p248).
- **A typed point on nothing at SLICE's plane prompts** re-asks as here (p163).
- **SOLIDEDIT's `<2points>` and `<0,0,0>` after a run with Xaxis**, the hidden-face pick, Copy by
  zero, Copy's properties, `'SOLIDEDIT`, the U, REDO and `UNDO 2` names: as here (p309–p312, p334,
  p338, p306, p307, p360, p362).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim                                                                     | Probe                 | State                         |
| ------------------------------------------------------------------------- | --------------------- | ----------------------------- |
| modify.md SLICE: "none left ending it silently"                           | p130                  | false for an empty set, SLC-04 |
| modify.md SLICE: View, XY, YZ, ZX "the UCS's", `<0,0,0>`                   | p147, p172, p177      | false, SLC-01, SLC-02          |
| modify.md SLICE: 22069, 22071 "from the tables"                           | p110                  | console-verified               |
| modify.md SLICE: Surface "(slice/t1)"                                     | p174                  | t1 has no input; p174          |
| modify.md SLICE: "`… 1 selected solid.`, s07"                             | p140                  | the source is p140             |
| modify.md SLICE Missing: a planar 3D polyline's plane **unverified**       | p164, p165            | settled, SLC-05                |
| draw.md SECTION: the empty set; a face's region                           | p131, p177            | false, SLC-04, SEC-01          |
| modify.md FILLETEDGE: "Enter makes it, the radius or the distances saved" | p208–p210, p222, p234 | false, FED-01, FED-02          |
| modify.md FILLETEDGE: "0 or less says `Radius too small`"                 | p208, p236            | typed only, FED-04             |
| modify.md FILLETEDGE Missing: another solid's edges **unverified**        | p216, p231            | settled, FED-07                |
| command-line.md: SUbobject `0 found` "(no object here has sub-objects)"   | p241–p264             | false, SUB-01, SUB-02          |
| modify.md SOLIDEDIT: `[Undo/Remove/ALL]` once a face is taken; ALL; Remove's words; Undo | p305, p318, p322, p323, p374 | false, SOE-07, SOE-08 |
| modify.md SOLIDEDIT: the face "nearest the viewer under it"              | p313, p316            | false on an edge or again, SOE-04, SOE-05 |
| modify.md SOLIDEDIT: Taper `<0>`; Xaxis, Yaxis "(the UCS's)"              | p308, p331, p366      | false, SOE-02, SOE-12          |
| modify.md SOLIDEDIT: "Each edit says … validation"; Undo there            | p300–p303, p328, p335 | false, SOE-06, SOE-10, SOE-14  |
| modify.md SOLIDEDIT Deviation: the offset's bound **unverified**          | p344–p348, p365       | settled, SOE-11                |
| modify.md SOLIDEDIT Missing: a pick on nothing **unverified**; several solids | p336, p315        | settled, SOE-09, SOE-19        |

Checked and holding: the names; the prompts in three languages; SLICE's normal (p2 − p1) × Z,
`distinct X,Y`, Zaxis, Both and the side, the half's properties, History None, s10, s11, the
missed messages; SECTION's c01–c09, its layer and tilted normal, "typed only"; FILLETEDGE's
`Radius =`, CHAMFERA and CHAMFERB 1 when 0, the saved variables, `Edges must belong to one face.`,
the typed edge, Chain, Loop, Next, two-point sizes, the counts, the accept prompt's form, one undo
step, the rail slot; SOLIDEDIT's dialogue for Remove, Add and FOO, Enter with no face, the edits'
geometry, Move's Enter at the second point, View, eXit, one step, the rail.

| Rule (file, section)                                         | Claim                                         | Code                             | State                    |
| ------------------------------------------------------------ | --------------------------------------------- | -------------------------------- | ------------------------ |
| `cad-tools.md`, Points: LASTPOINT                            | the runtime sets it; a refusing prompt says `setsLastPoint()` | `PlaneCutTool.ts:182`, `EdgeBlendTool.ts:199`, `SolideditTool.ts:215` | broken, ELP-01 to ELP-03 |
| `cad-tools.md`, Points: a tool works in the UCS's frame      | write as if the UCS were level                 | `PlaneCutTool.ts:65`, `SolideditTool.ts:641` | broken: a prompt naming the UCS's axes or origin (SLC-01, SLC-02, SOE-12, SOE-20) |
| `cad-tools.md`, Reuse: `takesPreselection()`                  | SelectionActionTool only                       | `PlaneCutTool.ts:135`            | incomplete, SLC-03       |
| `cad-tools.md`, a single object's pick: `typedPick`           | a bare number through `pointAtDistance`        | `EdgeBlendTool.ts:742`           | broken, FED-06           |
| `cad-tools.md`, Undo keyword                                 | says when there is nothing                     | `SolideditTool.ts:289`           | broken, SOE-06, SOE-07   |
| `cad-tools.md`, Dynamic input: Enter at a point prompt asked again | reports its refusal, returns true         | `SolideditTool.ts:359`           | broken, SOE-01           |
| `cad-tools.md`, What a new object wears                      | a row per creating command                     | `currentProperties.test.ts`      | missing rows, SLC-08, SOE-17 |
| `cad-engine.md`, Locked: never edited                        | a pick says the locked object                  | `EdgeBlendTool.ts:479`, `SolideditTool.ts:499` | silent, FED-07, SOE-09 |
| `cad-catalogs.md`, Messages: say a deliberate nothing         | zero edits said                                | `SolideditTool.ts`               | broken, SOE-10           |

## 12. Order of execution and estimate

One subagent per commit, one after another (they share the catalogs and the English surface
snapshot):

1. **SLC** (with SEC-01, ELP-01): SLC-01 to SLC-08, the catalogs for SLC-04, SLC-05. About two
   hours.
2. **FED** (with ELP-02, SUB-01, SUB-02): FED-01 to FED-09, the catalogs for FED-01 and FED-07, the
   SUbobject docs and tests. About two hours.
3. **SOE, its dialogue** (with ELP-03): SOE-01, SOE-04 to SOE-10, SOE-16, SOE-21; the catalogs for
   SOE-07, SOE-09, SOE-10. About two hours.
4. **SOE, its values and axes:** SOE-02, SOE-03 (the shared height), SOE-11 to SOE-15, SOE-17 to
   SOE-20. About two hours.

SOE-04's and SOE-05's reach, SLC-03's preselection and the desktop cells wait for SED.

## 13. Group 2: the desktop (SED)

A session with the owner's mouse, `scripts/research/probes/solid-edits/d<n>.sh` (es-ES, and en-US
for the English labels), on a box seen from (−1.3, −2.2, 1.6):

- **Sub-objects:** Ctrl's hover on a face, an edge, a vertex, with Ctrl pressed and the cursor
  still; Ctrl+click, Ctrl+Space's order, Ctrl+Shift+click; the grips and their colours; a locked
  solid under Ctrl; LIST, ERASE and MOVE with a face selected; the palette of a face, an edge, a
  vertex; SUBOBJSELECTIONMODE's filters and badges.
- **SOLIDEDIT:** a click on an edge (two faces?, SOE-04) and on a face taken (the one behind?,
  SOE-05); the face's hover and selected look; the rubber bands at MS, A2, TA; coLor's dialog;
  the rail's macro echo; Escape mid-run and U after; the right button at each prompt.
- **FILLETEDGE, CHAMFEREDGE:** the edge's hover, Ctrl+Space, the preview, the arrow grip and its
  `Specify radius or [eXit]:`, Escape after a size is answered (kept?), dynamic input at the pick.
- **SLICE, SECTION:** the preselection through COM (SLC-03); the plane and side as the cursor
  moves; the rubber band; the hovers at planar Object and Surface; LASTPOINT after a click at each
  pick and after Escape.

## 14. Changes to coverage, rules, catalogs and roadmap

- modify.md SLICE, FILLETEDGE / CHAMFEREDGE, SOLIDEDIT; draw.md SECTION: each claim of §11
  corrected; the settled **unverified** marks gone; Missing gains p241–p264's sub-objects, Edge's
  and Body's prompts (22357, 22363), mAterial's (33736), SOE-13, SOE-15; SOLIDEDIT's offset
  Deviation removed.
- command-line.md: the SUbobject lines; Ctrl+click's entry cites this plan.
- draw.md BOX / EXTRUDE: the shared height (SOE-03).
- `cad-tools.md`: a prompt naming the UCS's axes or origin reads `ctx.ucs`; the tools that drop a
  preselection; a size saved when answered, not at the commit.
- Catalogs (en, es, pt-BR): `noObjectsSelected` and SECTION's joined line (SLC-04), 22074 (SLC-05),
  `chamferEdgeBaseDistanceOr` / `chamferEdgeOtherDistanceOr` (FED-01), 22180, 22191, 22203, 29677
  (FED-07), 22440 (SOE-07), 22460 (SOE-09), 22251, 22336, 22368, 22369 (SOE-10), 22361 (SOE-11),
  the checking line's value (SOE-14).
- Roadmap: review 29 `plan`, then `done` with the sub-objects once SED lands; the LASTPOINT suspects
  SolideditTool and PlaneCutTool and SLICE's preselection struck; SUbobject mode on solids to phase
  6c (`docs/next-solids.md`).

## 15. Template improvements

Applied on 2026-11-04 (template.md §4.1, §4.8; matrix.md row B; annex-catalogs.md §1):

- **A suspect one subagent finds in its tool is a suspect in the others'.** A's SLC-01 (the
  frame's axes) was SOE-12 in C's tool, found apart, and A's hint gave SOE-20 and SOE-21, which C
  had not probed: §4.8 asks each subagent's report for "suspects in the others' tools", which the
  reviewer probes before the plan.
- **A shared default is a row of its own.** EXTRUDE's taper is SOLIDEDIT's, BOX's height
  EXTRUDE's (p369, p372, p373), which the 3D primitives' and Sweeps' reviews did not see: matrix
  row B's "a run after one with options" adds "and after another command's run that sets the same
  default".
- **A `differs` from console-pair on a message with siblings is a pairing to check**:
  `sliceMissed` paired with s07's one-solid message (`sliceMissedOne`) and looked wrong (§10);
  annex-catalogs.md §1 says to read the probe's set before trusting it.
- **Where a new variable lives is settled in the review**, with the OPEN test (p405), not left
  **unverified** for the execution (C's first EDITS-D89).
