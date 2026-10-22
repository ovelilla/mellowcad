# Arrays review (ARRAYRECT, ARRAYPOLAR, ARRAYPATH)

> **Status:** plan, 2026-10-22 — phases 0–4 in one session with skill `command-review`, the
> fifteenth review of `docs/coverage/roadmap.md`'s order. It owns **the array object**. Executed
> in the same session: ARR `ef58183`, APO `566528d`, APA `4dbdb66`, AYJ `d940a70`; AYO `b6b2317`
> in a second session (§12a). Left: AYG (the grips and palette), in a fresh session (§12).

## 1. Summary

0 critical, 5 high, 22 medium and 22 low findings over six blocks.

The worst: AutoCAD 2027 makes **one associative array object** by default (ARRAYASSOCIATIVITY 1:
`Associative = Yes`, an INSERT of an anonymous block, the source consumed into it) where mellowcad
says `Associative = No` and adds loose copies (AYO-01). Escape at the main prompt keeps the array
in AutoCAD and makes nothing here (AYJ-01). `AR`, `ARRAY`, `MA` and `MATRIZ` are ARRAY, which asks
the array type, not ARRAYRECT (ARR-01). ARRAYPATH drags the source onto the path's start where
AutoCAD repeats it in place from the source (APA-01), and always runs from the curve's own start
where AutoCAD starts at the end nearer the pick (APA-02).

Pieces' analogues: the path pick says nothing of a locked curve where AutoCAD says
`1 was on a locked layer.` (APA-03, BRP-01's); a typed object snap there is refused where AutoCAD
takes the snapped point as the pick (APA-05, BRP-03's); its rollover is the selection blue, not the
shared `rollover` (APA-15, BRJ-02's); the ghost equals the commit (BRJ-01's: refuted, APA scratch
`look`), but it is a dashed blue copy where AutoCAD draws the items as objects (AYJ-02).

Evidence: about 260 console probes in es-ES and en-US (p00–p421) and a desktop pass in the owner's
Spanish profile (d01–d10).

| Block | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| ARR — ARRAYRECT's command line (and ARRAY) | 0 | 1 | 7 | 4 |
| APO — ARRAYPOLAR's command line | 0 | 0 | 7 | 7 |
| APA — ARRAYPATH's command line and path pick | 0 | 2 | 6 | 10 |
| AYJ — the three commands' jig: Escape and the look | 0 | 1 | 1 | 1 |
| AYO — the array object | 0 | 1 | 0 | 0 |
| AYG — the array's grips, menus and palette | 0 | 0 | 1 | 0 |

## 2. Inventory

- **Commit** `34d8947`; AutoCAD 2027 `26.0`, `X.118.0.0`; tables `research/strings/all_es.tsv` of
  2026-10-20 (the build the Pieces review used).
- **Tools**: `cad/application/tools/ArrayTool.ts` (ARRAYRECT), `ArrayPolarTool.ts`,
  `ArrayPathTool.ts`; `objectSelection.ts` (`Select objects:`, the path pick's modes);
  `ghostLook.ts` (`rollover`, `drawn`).
- **Registration**: `runtimeTools.ts` (`defaultTools`), `CommandLine.ts` (`TOOL_COMMANDS`),
  `cad/locales/{en,es,ar}.json` names (`ARRAYRECT`: `AR`, `ARRAY`; `ARRAYPOLAR`: `ARPOLAR`;
  `ARRAYPATH`: `ARPATH`; es `MATRIZRECTANG`, `MATRIZ`, `MA`, `MATRIZPOLAR`, `MATRIZCAMINO`).
  Not transparent (p107, p203, p365: refused, as here).
- **Catalogs**: `commands.prompts.{selectGripToEditArrayOr, enterNumberOfColumns, …,
  specifyCenterPointOfArray, …, selectPathCurve, enterPathMethod, …}`, messages `arrayType`,
  `maximumItems`, `pathCurveIsArrayed`, `filteredOut`, `positiveNonzero`,
  `requiresPositiveInteger`, `requiresDistance`, `requiresAngle`; keywords of the three commands.
- **The object**: none — no array entity; copies are plain geometry (`AddEntitiesCommand`,
  ARRAYPATH's `ReplaceEntitiesCommand`). No grips, no palette rows, nothing in serialization.
- **UI**: the rail (Modify), `content/commands.ts`, the Command shortcut menu (owned).
- **Tests**: `transforms.test.ts` (`describe("ARRAYRECT")` :1824, `ARRAYPOLAR` :2067, :2084),
  `inquiry.test.ts` (`describe("ARRAYPATH")` :800, misfiled), `selectionModes.test.ts`,
  `selection.test.ts:1439`, `invalidAnswers.test.ts:385, :393`, `dynamicInputEnter.test.ts:222`,
  `measuredAnswers.test.ts:227`, `ambiguousKeywords.test.ts:145`, `keywords.test.ts:67`,
  `currentProperties.test.ts:218`, `ucs.test.ts:360`, `englishSurface.test.ts:899–904` and its
  snapshot, `content/__snapshots__/transcripts.txt`.
- **Knowledge**: `docs/coverage/modify.md` (the three entries), `command-line.md` (aliases,
  transparency lists), `coordinate-systems.md` (ARRAYRECT's rows, ARRAYPATH's path);
  `.claude/rules/cad-tools.md` ("Reuse before writing": ARRAYPATH's path pick; "Pick feedback";
  "Dynamic input": ARRAYRECT's values), `cad-catalogs.md`, `cad-engine.md`.
- **Related tools**: ARRAY (the type question, not implemented: ARR-01); ARRAYEDIT,
  ARRAYCLOSE (not implemented: Missing); EXPLODE, LIST, U, COPY, MOVE of an array (AYO-01);
  ARRAYASSOCIATIVITY, ARRAYTYPE (p00), AUPREC, LUPREC (defaults' format).
- **Areas cited, not reviewed again**: `Select objects:` and the preselection (ERASE review, SEL;
  checked p169–p178: each array goes through `ObjectSelector.preselect`, counts `1 found`, leaves
  nothing selected); a single object's pick with modes (Pieces review, BRP); the command line,
  transparency, undo, the shortcut menus (LINE review); placement (MOVE, COPY review).
- **Areas this review takes**: the array object (AYO, AYG).

## 3. Probes

Console inputs: `scripts/research/probes/arrays/<id>.txt` (`.plain` untraced, `.es`/`.en` one
locale), run with `scripts/research/probe.sh arrays <ids>`; p411b runs with
`runacc.sh -i …\arr411.dwg` on p411a's drawing. Desktop: `dsk.sh` with `lib-dsk.sh`
(`dsk.sh setup d01 d01b …`). Transcripts and screenshots: `research/probes/arrays/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | version, ARRAYASSOCIATIVITY (1), ARRAYTYPE (0), ARRAYEDITSTATE, PICKFIRST, OSMODE, MAXARRAY (nil) |
| p01–p06 | each command by default (one INSERT `*U2`, the source consumed) and with `_AS _N` (loose copies, the source kept) |
| p100–p179 | ARRAYRECT and ARRAY: names, every prompt and keyword, refusals, Unit cell, COLumns, Rows, Total, Expression, Levels, Base point, clicK, UPdate, point forms, snaps, transparency, undo, properties, Z, UCS, drawing order; the preselection of all three (p169–p178) |
| p200–p279 | ARRAYPOLAR: names, the centre, Items, Angle between, Fill angle, ROTate items, overruns, signs, AUPREC, Base point, Axis, ROWs, Levels, clicK, UPdate, point forms, snaps, transparency, undo, properties, Z, UCS, the cap |
| p300–p379 | ARRAYPATH: where items go (the source, the pick's end, Align, Divide, Measure, arcs, circles, polylines, splines, ellipses, a sloping line, a turned UCS), the path pick (locked, snaps, modes, Enter, Group, non-curves), every prompt, transparency, undo |
| p400–p422 | the array object: its block structure, LIST of each kind, EXPLODE, layers and colours, base points, path association (STRETCH, ERASE of the path), a pick on an item, U, COPY, SAVEAS and reopen, END on an item, a turned UCS, a mixed set, ARRAYEDIT; p422 where ARRAYASSOCIATIVITY and ARRAYTYPE live (`_AS _N`, SAVEAS, OPEN of a drawing saved at 1: both read as last set, so the registry) |
| d01–d03 | the jig of each command (the preview, its grips, the polar centre, the path pick's rollover); d01b each grip hovered mid-command; d01c the column-count grip dragged (`** TOTAL DE COLUMNAS **`) |
| d04–d06 | each finished array selected: its grips and every multifunctional menu |
| d07 | the Properties palette of each array (and the contextual Array ribbon tab) |
| d08, d08b, d08c | Escape at the main prompt: Yes keeps the array, No keeps the copies (d08c's polar run is ambiguous, see §9) |
| d09 | the right button at the main prompt; d10 the rollover at `Command:` over an item |

## 4. Matrix

Columns per command: **ARRAYRECT** — SO `Select objects:`, M the main prompt, CC/CR COUnt's
columns and rows, SC/SR Spacing's columns `or [Unit cell]` and rows, U1/U2 Unit cell's corners,
LC/LD COLumns' count and distance, RC/RD/RE Rows' count, distance and elevation. **ARRAYPOLAR** —
Ce the centre, M, I Items, AB Angle between, F Fill angle, R ROTate items. **ARRAYPATH** — SPC
`Select path curve:`, M, METH, DIV#, MSP, M#, ALN.

### ARR — ARRAYRECT (and ARRAY)

| Row | Cells |
| --- | --- |
| A | `ARRAYRECT`, `MATRIZRECTANG` match · p102, p106 · transforms:1873; `AR`/`ARRAY`/`MA`/`MATRIZ` differs ARR-01 · p100, p101, p103, p104, p204; `_.` known (LINE) · p105; repeat match · p106; `'ARRAYRECT` match · p107 |
| B | M text: differs ARR-11 (en `]<eXit>`), missing keywords AYO-01/known · p01, p04; M FOO match · p108 · invalidAnswers:385; M a point or number differs ARR-06 · p109; M Enter match · p143 · dynamicInputEnter:222; M es letters match · p179.es; CC/CR match (Expression known) · p110–p115 · transforms:1836, 1858; SC text and `Unit` match · p116 · transforms:1844, 1899; SC/SR `0` differs ARR-02 · p117, p120; SC `-5`, FOO match · p118, p119; SC two points match · p122; SR FOO differs ARR-07 · p121; U1 Enter, FOO, `5`, `0` match · p124–p127 · transforms:1920–2048; U2 FOO, a number match · p128, p130; LC/LD match (Total, Expression known) · p131–p134; RC/RD/RE match · p135–p138 · transforms:1871; Base point, Levels known · p139, p140; clicK, UPdate differs ARR-12 · p141, p142; defaults' format differs ARR-10 · p116, p130, p179.en |
| C | U1/U2 `@`, `@dx,dy`, `d<a` match · p144–p146; `*x,y` in a turned UCS differs ARR-04 · p147; LASTPOINT after Unit cell differs ARR-05 · p148; after a plain run match · p149 |
| D | U1/U2 `_END`, `_CEN` match · p150, p151; ORTHOMODE 1 with a typed point (ignored) match · p152, p153 |
| E | `'_ZOOM _E` at M, U1, SC match · p154, p157, p158; `'_LINE` match · p156; `'ORTHOMODE` at a count differs ARR-09 · p155 |
| F | `_U` match (echo untested) · p159.plain · transforms:2049; `_UNDO 2` match · p160; U after nothing match · p161; REDO unverified (§9) |
| G | Enter at each value keeps it · p143; `_LINE` at M refused match · p163; Escape: AYJ-01 |
| H | copies' layer, colour, lineweight are the source's: untested · p164.en; Z 5 kept: untested · p166; column by column match · p04, p122; negative spacing match · p118; a line's rows 1 apart match · p168; turned UCS default differs ARR-03 · p165; a set out of drawing order differs ARR-08 · p167; the object itself AYO-01 |
| I, J | AYO-01, AYG-01 |
| K | catalog sweep settled: `specifyDistanceBetweenColumns`, `…OfCell`, `…Rows`, `unitCellOppositeCorner`, `positiveNonzero`, `selectGripToEditArrayOr`, `requiresDistance`, `requiresPositiveInteger` match · p116–p135; dynamic-input labels unverified |
| L | match but ARR-06, ARR-07, ARR-09; the echo of `_ARRAYRECT` owned (LINE p39) |
| M, P, Q | AYJ |
| N | §7 |
| O | ARR-09 (transparency at a number box: every command) |

### APO — ARRAYPOLAR

| Row | Cells |
| --- | --- |
| A | `_ARRAYPOLAR`, `MATRIZPOLAR` match · p05, p201 · transforms:2137; `ARPOLAR` differs APO-10 · p200; `AR`/`ARRAY` ARR-01 · p204; `_.` known · p202; repeat untested · p202; `'ARRAYPOLAR` untested · p203 |
| B | Ce en text match (Base point, Axis known) · transforms:2090; Ce es text differs APO-09 · p201; Ce FOO untested · p205; Ce Enter differs APO-06 · p206; M FOO, `_Y` untested · p207, p211; M a point or number differs APO-12 · p208, p209; M `R` differs APO-07 · p210; M letters untested · p262, p263; M text differs APO-13 · p05; I refusals untested · p212; I `1` untested · p213; I over 1000 differs APO-08 · p278, p279; AB FOO untested · p214; AB `0`/negative, F `0` differs APO-04 · p214, p219; AB span ≥ 360 differs APO-02 · p267, p268, p271; AB two points match · p265 · measuredAnswers:227; AB/F at AUPREC 2 differs APO-11 · p264, p275; F negative then AB differs APO-03 · p274, p276, p277; F `400` differs APO-05 · p217; R FOO untested · p222; the overrun question: not asked by the console (p267), desktop unverified |
| C | Ce `x,y`, `x,y,z`, `@`, `@dx,dy`, `d<a`, a number, `*x,y` untested · p223–p229; LASTPOINT kept untested · p229, p273 |
| D | Ce `_CEN`, `_INT`, `_END` untested · p231, p232, p234; ORTHOMODE n/a (no command here) · p233 |
| E | `'_ZOOM _E` at Ce, M, F, R untested · p235–p239; `'_LINE` untested · p238 |
| F | `_U` untested · p240, p242; `_UNDO 2`, `_REDO` untested · p241 |
| G | Enter at I, AB, F, R untested · p243; another command at Ce, I, M untested · p244; Escape AYJ-01 |
| H | order (source item 1, item by item) untested · p247; ROTate Yes, No (the set's extents centre carried) untested · p245–p248, p252; properties untested · p249; turned UCS, Z untested · p250, p251 |
| K | `specifyCenterPointOfArray` es APO-09; the rest match · p05, p212–p219 |
| L | match but APO-09, APO-13 |
| N | §7 |

### APA — ARRAYPATH

| Row | Cells |
| --- | --- |
| A | `MATRIZCAMINO` match · p362 · inquiry:930; `_.`, repeat, `'ARRAYPATH` untested · p363–p365; `ARPATH` differs APA-14 · p361 |
| B | SPC words, FOO match · p350, p372 · invalidAnswers:393; SPC Enter differs APA-04 · p349; SPC `G` differs APA-16 · p355; SPC a non-curve differs APA-09 · p346; SPC an arrayed object match · p347 · inquiry:894; SPC `L` match · p353 · selectionModes:839; SPC `P`, `ALL` differs APA-10 · p354, p356; SPC W, C untested (start: APA-02) · p351, p352; M text differs APA-13 · p06; M FOO untested · p327; M a point, `0` differs APA-11 · p328, p329; M clicK, UPdate differs APA-17 · p323, p324; METH, DIV#, MSP, M#, ALN refusals and defaults untested · p330–p336, p373–p375; MSP default format differs APA-13 · p307, p334; `Maximum items` said again differs APA-12 · p367, p373; Fill entire path match · p333 · inquiry:828 |
| C | SPC a typed point is a pick, LASTPOINT kept match · p357 · selectionModes:1246; on nothing a window match · p348 · selectionModes:1284 |
| D | SPC typed `_END`, `_NEA`, `_MID` differs APA-05 · p342–p344; locked curves differs APA-03 · p338–p341 |
| E | `'ZOOM` at SPC, M, MSP, M# untested · p366, p367; `'_LINE` at M untested · p368 |
| F | `_U` match (echo untested) · p369, p370 · inquiry:840 |
| G | Enter keeps each answer untested · p330, p334, p336; Escape AYJ-01 |
| H | where items go differs APA-01, APA-02 · p06, p300–p305, p314, p317, p318, p376–p378; Divide, Measure counts · p306, p374; polylines, splines, ellipses differs APA-06 · p308, p359, p360; a sloping path differs APA-07 · p311; turned UCS spacing differs APA-08 · p310; Z 5 kept untested · p309; properties untested · p316 |
| K | `specifyNumberOfItemsOr` es `Introduzca…` match (the console, not the table) · p373; the rest match · p331–p373 |
| L | match but APA-09 to APA-14 |
| M | ghost equals commit (BRJ-01) refuted; rollover differs APA-15 |
| N | §7 |

### AYJ — the jig (all three)

| Row | Cells |
| --- | --- |
| G | Escape at M keeps the array (Yes) and the copies (No) differs AYJ-01 · d08, d08b, d08c (path) · scratch `me/look.test.ts` |
| M, Q | the preview: items drawn as objects, own colours, grips on them (d01-1, d02-2, d03-2), nothing at the polar centre prompt (d02-1), the path not highlighted (d03-2) — differs AYJ-02 · scratch `me/look.test.ts` (dashed `#38bdf8` copies, the source glowing, a centre cross, the path outlined); Unit cell's rubber band dashed (UseDashedLine 1) unverified AYJ-03 |
| P | the right button at M: Enter, Cancel, Recent input, the options, Snap overrides, Pan, Zoom, SteeringWheels, QuickCalc (d09-1); mellowcad's Command menu: Enter, Cancel, the options · scratch `me/menu.test.ts` — owned (LINE: the Command menu; Recent input and QuickCalc not built) |

### AYO, AYG — the array object

| Row | Cells |
| --- | --- |
| H | one INSERT `*U2` of a block of item INSERTs of `*U1` (the source in its frame) · p400; the array on CLAYER and CECOLOR, items keep their own · p403; base point the source's extents centre (rect, polar) or the path's start · p403–p406; a pick on an item takes the array · p408 — differs AYO-01 |
| F | U puts the source back, its handle kept · p409 — AYO-01 |
| I | grips and menus (d01-1, d04, d05, d06), palette rows (d07), rollover tooltip (d10) — differs AYG-01 |
| J | SAVEAS and reopen keeps the ARRAY · p411a, p411b; COPY makes a second array · p410 — AYO-01 |
| O | EXPLODE gives each item's objects, on their layers (p402, p415, p418); END snaps inside it (p412); a path array follows its path (p407) and outlives it (p416); ARRAYEDIT (p419–p421) — AYO-01 |

## 5. Findings

### High

#### AYO-01 — Every array is one associative array object in AutoCAD; mellowcad makes loose copies and says `Associative = No`

- **Severity:** high · **Row:** H, I, J · **Status:** verified
- **Where:** `ArrayTool.ts:43`, `ArrayPolarTool.ts:45`, `ArrayPathTool.ts:45` (the `WHY
  Associative = No`); `arrayType` in the catalogs.
- **AutoCAD:** p00 ARRAYASSOCIATIVITY 1; p01–p03 `Type = Rectangular  Associative = Yes` (es
  `Tipo = Rectangular  Asociativa = Sí`), one `INSERT *U2`, the source erased. p400: `*U2` holds
  one INSERT of `*U1` per item, `*U1` the source at the base point. LIST (p401, p405, p406):
  `ARRAY`, `Array type`, `Base point`, the counts and spacings, `Rotate objects`, `Method`,
  `Start offset`… p403: the array on CLAYER L2 and CECOLOR 5, the line inside on L1 red. Base
  point: the source's extents centre (p403, p404; polar p405 with the centre apart), the path's
  start (p406). p408: a pick on an item erases the whole array. p409: U brings the source back
  (`2D7`). p410: COPY makes a second ARRAY. p411a/b: it survives SAVEAS and OPEN. p412: `_END` on
  an item's line snaps (25,0). p402, p415, p418: EXPLODE gives each item's objects, layers kept
  (a path line in the set: `1 was not able to be exploded.`). p407: STRETCH of the path's end
  from 100 to 50 leaves 9 items; p416: erasing the path leaves the array. With `_AS _N` (`Create
  associative array [Yes/No] <Yes>:`) the copies are loose and the source stays (p04–p06), and
  the answer is kept (p364: the next run says `Associative = No`; the desktop read
  ARRAYASSOCIATIVITY 0 after d08b).
- **mellowcad:** scratch `me/look.test.ts`, `arrays/a/arr.test.ts`: `Type = Rectangular
  Associative = No`, 11 copies added beside the source, no ASsociative keyword.
- **Scenario:** an AutoCAD user arrays a bolt pattern and clicks one bolt to move the pattern:
  here the click takes one loose bolt. Their next habit — a grip on the array to add a column,
  the palette's Columns row — has nothing to act on.
- **Fix:** model the array object (ARRAYS-D1): a block reference of an anonymous block holding
  the source in the array's frame, with the array's parameters, its items derived; the three
  commands make it by default, `ASsociative` offered with `[Yes/No] <Yes>` and its answer kept
  (ARRAYS-D3); EXPLODE, LIST-free palette rows, U, the file, picks and snaps through the items;
  a path array keeps its path's geometry and id. The layouts of ARR, APO and APA are pure
  functions the object derives its items from (ARRAYS-D2), so those blocks land first.
- **Regression test:** an arrays test file: each command makes one object (p01–p03), on CLAYER
  and CECOLOR (p403), its base point (p403–p406), EXPLODE (p402, p418), U (p409), the file
  round trip (p411), END on an item (p412), a pick on an item (p408), `_AS _N` (p04–p06).
- **Coverage, rules, catalogs:** the three entries' WHY and Missing; `arrayType` takes the answer;
  `extend-model`'s checklist for a new entity property; `cad-engine.md` "Blocks".

#### AYJ-01 — Escape at the main prompt keeps the array in AutoCAD; mellowcad makes nothing

- **Severity:** high · **Row:** G · **Status:** verified
- **Where:** `ArrayTool.ts`, `ArrayPolarTool.ts`, `ArrayPathTool.ts`: `onDeactivate` drops the
  state; the commit is only eXit and Enter.
- **AutoCAD:** d08: `… <Salir>: *Cancelado*`, then 5 objects and 4 arrays where there were 5 and 3
  (the circle consumed into a new array). d08b: with `_AS _N`, Escape leaves the source and its 11
  copies (6 → 17 objects). d08c: ARRAYPATH with No, Escape at M left 30 copies.
- **mellowcad:** scratch `me/look.test.ts`: one object after Escape.
- **Scenario:** a user sees the preview right and presses Escape to leave, as they leave every
  AutoCAD grip prompt: here the array is gone.
- **Fix:** Escape at the main prompt commits what eXit would (the rule's exception: `onDeactivate`
  is the commit point, `cad-tools.md` "Ordering and undo"); Escape at a value's prompt keeps the
  values given before it (unverified: §9), ARRAYS-D4.
- **Regression test:** each command, Escape at M makes what Enter makes (d08, d08b, d08c).

#### ARR-01 — `AR`, `ARRAY`, `MA` and `MATRIZ` start ARRAYRECT; in AutoCAD they are ARRAY, which asks the array type

- **Severity:** high · **Row:** A · **Status:** verified (APO-01 found it too)
- **Where:** `cad/locales/en.json:393`, `es.json:381`.
- **AutoCAD:** p100, p101.en, p103.es, p104.es, p204: after `Select objects:`,
  `Enter array type [Rectangular/PAth/POlar] <Rectangular>:` (es
  `Indique el tipo de matriz [Rectangular/CAmino/POlar] <Rectangular>:`, keywords `CAmino`/`PAth`),
  `_PO` goes on to `Type = Polar…` and the centre, `_X` is `Invalid option keyword.`;
  `acad.pgp`: `AR,*ARRAY`, es `MA,*MATRIZ`.
- **mellowcad:** scratch `a/arr.test.ts` ("AR runs ARRAY", "MA runs MATRIZ"): straight to
  ARRAYRECT's main prompt.
- **Scenario:** `AR`, a pick, Enter, `PO`: AutoCAD starts a polar array, mellowcad refuses `PO` at
  the rectangular array's prompt.
- **Fix:** ARRAY as a command of its own: `Select objects:`, the type (default ARRAYTYPE's,
  Rectangular), the set handed to the chosen tool (ARRAYS-D10). The names move to it; ARRAYRECT
  keeps its own name only.
- **Regression test:** p100–p104, p204 in both languages.

#### APA-01 — ARRAYPATH re-centres the items on the path's start; AutoCAD leaves the source where it is and steps from it

- **Severity:** high · **Row:** H · **Status:** verified (in person: p06)
- **Where:** `ArrayPathTool.ts` `enterEdit` (`basePoint: centroid`), `itemEntity`, `create`
  (`ReplaceEntitiesCommand`).
- **AutoCAD:** p06/p314: line 0,0→100,0, circle r2 at 10,10, path picked at 50,0: with `_AS _N`
  the source kept and 16 copies at x = 16…106, y = 10 (17 items, floor(100/6)+1, past the path's
  end); the default, exploded, the same 17 (p314). Base point is
  `Specify base point or [Key point] <end of path curve>:` (p317); Base point 10,10 gives
  mellowcad's layout (p318). Align Yes: item k is the source moved by P(s)−P(0) then turned about
  P(s) by θ(s)−θ(0) (p305: source 70,0→80,0 on an arc r50, item 2 `(66.8736 20.6864)–(76.4269
  23.6416)`; p308 a polyline); Align No moves only (p304).
- **mellowcad:** scratch `c/h.test.ts`: centres 0,0…96,0; the arc p302 at 50,0 where AutoCAD has
  80,10 and 78.2276,19.5051.
- **Scenario:** a symbol drawn beside a line, arrayed along it: mellowcad drags it onto the line.
- **Fix:** the base is the path's start; item k the frame transform above; with No the source is
  item 1 and n−1 copies are added (ARRAYS-D50, D52).
- **Regression test:** p06's 17 centres, p305's item 2, p304's moved item.

#### APA-02 — ARRAYPATH always runs from the curve's own start; AutoCAD starts at the end nearer the pick

- **Severity:** high · **Row:** H, B · **Status:** verified (in person: p300)
- **Where:** `makePath` from `entity.start` / `startAngle`; the pick point dropped.
- **AutoCAD:** p300: picked at 90,0, items at 10, 4 … −86; p303 an arc picked at −50,0 runs
  clockwise; a mode starts at the end nearer its last point (p376: W −10,−10 → 110,5 from the 100
  end; p377 reversed corners from the 0 end; p378 a Crossing); a snapped pick too (p342, p343); a
  circle always from angle 0 counter-clockwise (p301, p315); an exact midpoint is a tie AutoCAD
  breaks either way (p06, p344 forward, p310, p311 reversed): kept out of tests.
- **mellowcad:** scratch `c/h.test.ts` p300, p376, p377: from 0,0.
- **Fix:** keep the pick point (and a mode's last point through `ModeFind`); reverse an open path
  whose far end is nearer (ARRAYS-D51).
- **Regression test:** p300, p303, p376, p377: the first two centres.

### Medium

#### ARR-02 — A spacing of 0 is taken and piles the copies on the source

- **Where:** `ArrayTool.ts:507`. **AutoCAD:** p117, p120: `Value must be nonzero.` (es `El valor
  debe ser diferente de cero.`), asked again; AllowZero 0 at the four distances, 1 at the
  elevation (p135). **mellowcad:** `a/arr.test.ts` "refuses a zero spacing". **Fix:** refuse with
  `valueMustBeNonzero` (ARRAYS-D11). **Test:** p117, p120 in both languages.

#### ARR-03 — In a turned UCS the default spacing is 6 where AutoCAD's is 8.1962

- **Where:** `ArrayTool.ts:628` `defaultSpacing`. **AutoCAD:** p165 (`_UCS _Z 30`, a circle r2):
  1.5 × the WCS extents box measured along the UCS axes, 1.5 × 4(cos30 + sin30); p310 the same for
  ARRAYPATH (APA-08), p414 for the object. **Fix:** ARRAYS-D13. **Test:** p165.

#### ARR-04 — `*x,y` at Unit cell's corners is read in the UCS

- **Where:** `ArrayTool.ts:461` parses with the frame's UCS. **AutoCAD:** p147. **mellowcad:**
  `a/arr.test.ts` "*x,y corners" (LINE reads it right). **Fix:** ARRAYS-D15. **Test:** p147.

#### ARR-05 — Unit cell's corners set LASTPOINT; AutoCAD's keep it

- **AutoCAD:** p148: LASTPOINT 10,10 after `3,4` and `30,20`. **mellowcad:** 30,20. **Fix:**
  `setsLastPoint` false / put back (ARRAYS-D14). **Test:** p148.

#### ARR-07 — `FOO` at Spacing's rows offers an option keyword the prompt lacks

- **Where:** `ArrayTool.ts:200`. **AutoCAD:** p121 `Requires numeric distance or two points.`;
  p119, p138 keep `…, or option keyword.` **Fix:** ARRAYS-D12. **Test:** p121.

#### ARR-09 — A transparent command at a number box is refused

- **Row:** E, O. **Area:** transparency (LINE review): new evidence, every number box (POLYGON's
  sides too). **AutoCAD:** p155 `'ORTHOMODE` at the count: `>>Enter new value for ORTHOMODE <0>:`,
  `Resuming ARRAYRECT command.` **mellowcad:** `Requires a positive nonzero integer or option
  keyword.`, the answers after it slip (`a/arr.test.ts`, `a/probe-transp.test.ts`). **Fix:** the
  runtime lets `'cmd` through a `number` box as through a `distance` one (p158) (ARRAYS-D18).
  **Test:** p155 and POLYGON's sides.

#### ARR-12 — clicK and UPdate are not in Missing, nor Base point's, Levels' and Total's words

- **AutoCAD:** p139–p142, p133, p136. **Fix:** ARRAYS-D21.

#### APO-02 — An Angle between whose span reaches 360 overlaps the copies; AutoCAD fits a full turn

- **Where:** `ArrayPolarTool.ts:470`. **AutoCAD:** p267, p268, p271: 6 items 60° apart, AB `<60>`,
  F `<360>` after, no question; AB 61 keeps F `<305>` (p269), AB 72 is exactly 360 (p270).
  **mellowcad:** `b/apo-b.test.ts`: F `<450>`. **Fix:** ARRAYS-D34. **Test:** the three probes.

#### APO-03 — A clockwise fill turns counter-clockwise when Angle between is set; defaults show a sign

- **AutoCAD:** p274, p276, p277: F `<90>` unsigned after `-90`, the ring kept clockwise.
  **mellowcad:** `<-90>`, `<-18>`, then AB 30 makes +150. **Fix:** ARRAYS-D35. **Test:** p274,
  p276, p277.

#### APO-04 — Angle between `0` or negative, and Fill `0`, are taken; AutoCAD refuses them

- **AutoCAD:** p214 AB: `Value must be positive and nonzero.`; p219 F: `The parameter cannot be
  set to 0.  Enter a non-zero number or expression.` (es `El parámetro no se puede establecer en 0.
  Introduzca un número distinto de cero o una expresión.`). **mellowcad:** `b/apo-b.test.ts`,
  `b/apo-c.test.ts`. **Fix:** ARRAYS-D31, D32 (a new message key). **Test:** p214, p219.

#### APO-05 — A Fill angle beyond 360 is used as typed; AutoCAD takes it modulo a turn

- **AutoCAD:** p217: F `400`, 6 items over 40°. **Fix:** ARRAYS-D33. **Test:** p217.

#### APO-06 — Enter at the centre ends the command; AutoCAD refuses it and asks again

- **AutoCAD:** p206 (AllowNone 0): `Point or option keyword required.` **Fix:** ARRAYS-D37
  (BRS-01's pattern). **Test:** p206.

#### APO-07 — `R` at the main prompt opens ROTate items; AutoCAD asks `ROWs or ROTate?`

- **AutoCAD:** p210: `Ambiguous response, please clarify...`, `ROWs or ROTate?` **Fix:** ROWs
  offered hidden, unhandled (ARRAYS-D30). **Test:** p210; englishSurface:901.

#### APO-08 — Items stops at 1000 with the wrong words; AutoCAD takes up to 32767

- **AutoCAD:** p278 takes 1001; p279 refuses 200000 with `Requires an integer between 1 and 32767,
  or option keyword.` **Fix:** ARRAYS-D43, the three commands' counts. **Test:** p278, p279.

#### APA-03 — A locked curve at the path pick starts a window or is passed over; AutoCAD says `1 was on a locked layer.` (BRP-01's analogue)

- **Where:** `pathModes`' `one` passes no `locked`; `pickCurve` uses `ctx.pick`. **AutoCAD:**
  p338 a typed pick on a locked line: `1 was on a locked layer.` (es `1 estaba en una capa
  bloqueada.`), the prompt again, no `No object found`; p339 a Window round it; p340, p341 a
  Window round a locked and an unlocked line: said, then the unlocked one. **mellowcad:**
  `c/pick.test.ts` p338–p341. **Fix:** ARRAYS-D54. **Test:** p338, p340 in both languages.

#### APA-04 — Enter at `Select path curve:` ends the command; AutoCAD asks again

- **AutoCAD:** p349. **Fix:** ARRAYS-D56. **Test:** p349.

#### APA-05 — A typed object snap at `Select path curve:` is refused; AutoCAD takes the snapped point as the pick (BRP-03's analogue)

- **AutoCAD:** p342 `_END` `of 95,1` picks the line at 100,0 and starts there; p343 `_NEA`; p344
  `_MID`; LASTPOINT kept (unlike BREAK's). **mellowcad:** `*Invalid selection*` (`c/pick.test.ts`).
  **Fix:** ARRAYS-D55. **Test:** p342, p343.

#### APA-06 — Polyline, spline and ellipse paths are refused in silence; Missing lists only a multi-segment polyline

- **AutoCAD:** p308, p359, p360. **Fix:** ARRAYS-D65: a polyline (any) is built (the layout
  takes a polyline's length parameter: `polylineParamAt`); splines and ellipses go to Missing.
  **Test:** p308.

#### APA-07 — A path not level with the UCS is arrayed in plan; AutoCAD arrays along it in 3D

- **AutoCAD:** p311. **Fix:** Missing (ARRAYS-D65). 

#### APA-08 — In a turned UCS ARRAYPATH's default spacing differs

- **AutoCAD:** p310. **Fix:** ARR-03's measure (ARRAYS-D13). **Test:** p310.

#### AYJ-02 — The preview is dashed blue copies; AutoCAD draws the items as the drawing draws them

- **Row:** M, Q. **Where:** the three `buildOverlay`s. **AutoCAD:** d01-1, d02-2, d03-2: the items
  solid in their own colours (the array object, with its grips: AYG-01); the polar centre prompt
  shows no ghost (d02-1); the path is not highlighted at the main prompt (d03-2). **mellowcad:**
  `me/look.test.ts`: `#38bdf8` dashed copies, the source in the selection glow, a cross at the polar
  centre in the selection colour, the path outlined in it. **Fix:** items through
  `ghostLook.drawn(…, "plain")`, the source hidden (`hiddenEntityIds`) and drawn as item 1, no
  cross, no outline (ARRAYS-D5). **Test:** the scene's strokes at each prompt.

#### AYG-01 — The array's grips, multifunctional menus and palette rows

- **Row:** I. **AutoCAD:** rectangular (d01-1, d04): base square (Move, Level count), column
  spacing and row spacing arrows (no menu), column count (Column count, Total column spacing, Axis
  angle), row count (Row count, Total row spacing, Axis angle), total square (Row and column count,
  Total row and column spacing); a drag of the column count asks `** TOTAL DE COLUMNAS **`
  `Especifique el número de columnas:` live (d01c); the same grips at the main prompt (the prompt's
  name). Polar (d02-2, d05): base (Stretch radius, Row count, Level count, Item count, Fill angle),
  centre, angle between; the ring of the base point drawn grey while selected. Path (d03-2, d06):
  base (Move, Row count, Level count), spacing. Palette (d07): `Matriz (rectangular)` with
  Geometry Base X/Y/Z and Misc Columns, Column spacing, Rows, Row spacing, Row elevation
  increment, Levels, Level spacing, Axis angle; polar: Base, Centre X/Y/Z, Radius, Direction,
  Items, Angle between items, Fill angle, Rows…, Rotate items; path: Base, Path length, Method,
  Fill entire path, Items, Item spacing, Start offset, Rows…, Align items. Rollover tooltip
  `Matriz (rectangular)` with Color, Layer, Linetype (d10). The contextual Array ribbon tab: n/a
  (no ribbon). **Fix:** AYG's block after AYO (ARRAYS-D6); the English labels need an en-US pass or
  `ax26res.dll` (§9).

### Low

- **ARR-06** — a point or number at ARRAYRECT's main prompt is refused with words; AutoCAD asks
  again silently (p109, p129). ARRAYS-D17.
- **ARR-08** — copies of a set picked out of drawing order come in selection order (p167).
  ARRAYS-D16.
- **ARR-10, APO-11, APA-13** — defaults keep trailing zeros: AutoCAD writes `<6>`, `<-4.3514>`,
  `<33.33>`, `<100>` (p116, p130, p179.en, p264, p275, p307, p334). ARRAYS-D20.
- **ARR-11, APO-13, APA-13** — English writes `…/eXit]<eXit>:` with no space; Spanish keeps it
  (p01, p05, p06). ARRAYS-D19: recorded, not built.
- **APO-09** — the Spanish centre prompt is 2023's `Precise el punto central de la matriz`; 2027
  asks `Especifique el punto central de la matriz` (p201, AcArrayRes:5646). ARRAYS-D41.
- **APO-10, APA-14** — `ARPOLAR`, `ARPATH` are no 2027 alias (p200, p361). ARRAYS-D39, D62.
- **APO-12, APA-11** — a point or number at the main prompt: as ARR-06 (p208, p209, p328, p329).
- **APO-14, APA-18** — coverage claims and tests: §7, §11.
- **APO-15** — the tests protect less than they look (§7).
- **APA-09** — a pick on a non-curve says nothing; AutoCAD `1 was filtered out` (p346). ARRAYS-D57.
- **APA-10** — `P` and `ALL` leave out a line: AutoCAD says the arrayed one and `n were filtered
  out`, ALL still takes the curve (p354, p356). ARRAYS-D57.
- **APA-12** — `Maximum items = N` not said again after a refusal or a transparent command (p367,
  p373). ARRAYS-D60.
- **APA-15** — the path pick's rollover is `THEME.selected` at 2.5, not `ghostLook.rollover`;
  AutoCAD thickens the line in its own colour (d03-1). ARRAYS-D66.
- **APA-16** — `G` at the path pick refused; AutoCAD asks `Enter group name:` (p355). Missing.
- **APA-17** — clicK and UPdate missing from Missing (p323, p324). ARRAYS-D63.
- **AYJ-03** — Unit cell's rubber band is solid; the trace says UseDashedLine 1 (p123):
  **unverified** on the desktop. ARRAYS-D7.

## 6. Decisions

- **ARRAYS-D1** — the array object is a block reference (`insert`) of an anonymous block holding
  the source in the array's frame, with optional array parameters (kind, counts, spacings, axis
  angle, ring, path geometry and id, method, align) from which its items are derived — AutoCAD's own
  model (p400), and every insert path (draw, pick, bounds, snaps, transforms, the palette's
  General rows, the clipboard) serves it; EXPLODE gives the items' objects (p402), not nested
  references.
- **ARRAYS-D2** — each kind's layout is one pure `domain/` function (`rectangularItems`,
  `polarItems`, `pathItems`) shared by the tools' previews, their No commit and the object.
- **ARRAYS-D3** — ASsociative `[Yes/No] <Yes>`: a session setting shared by the three commands,
  never the drawing's (p364 kept it for the next run; p422: OPEN of a drawing saved at 1 still
  reads 0 after `_AS _N`, in both locales, ARRAYTYPE likewise — the registry).
- **ARRAYS-D4** — Escape at a main prompt commits; at a value's prompt the values given before
  stay (the desktop showed only the main prompt).
- **ARRAYS-D5** — the preview draws through `ghostLook.drawn` plain; the source is hidden and is
  item 1.
- **ARRAYS-D6** — the grips and palette come after the object, in AYG's block.
- **ARRAYS-D7** — Unit cell's rubber band dashed only once a desktop probe shows it.
- **ARRAYS-D8** — the array's parameters are stored in its **block's** coordinates: the block holds
  the source as picked, its base point the array's (the extents centre, the polar centre, the
  path's start), the reference there at rotation 0 and scale 1 (p414: 0 in a turned UCS too), the
  columns' direction a parameter of their own. Every transform of the reference (MOVE, ROTATE,
  SCALE, MIRROR, STRETCH, grips, UCS frames, `mapEntities`) then carries the array with no code
  that knows of it, as attributes are carried.
- **ARRAYS-D9** — a path array keeps its path's geometry (in block coordinates) and the path's id;
  following edits of the path (p407: STRETCH of its end moves the items) is Missing in coverage,
  not built; erasing the path leaves the array (p416), which holds by itself.
- **ARRAYS-D10** — ARRAY is a command: `Select objects:`, the type, the set handed on (p204);
  `AR`, `ARRAY`, `MA`, `MATRIZ` move to it (APO's D40 merged here).
- **ARRAYS-D11** — the four distances refuse 0 (`valueMustBeNonzero`); the elevation takes it.
- **ARRAYS-D12** — Spacing's rows refuse without "option keyword"; COLumns' and Rows' distances
  keep it.
- **ARRAYS-D13** — the default spacing is 1.5 × the extents, along the UCS axes, of the WCS
  extents box (p165, p310).
- **ARRAYS-D14** — Unit cell's corners keep LASTPOINT (p148).
- **ARRAYS-D15** — Unit cell's typed corners are read as a click's are (the runtime's parse),
  never by the tool.
- **ARRAYS-D16** — copies in drawing order (`selectedInDrawingOrder`).
- **ARRAYS-D17** — a point or number at a main prompt asks again silently, in all three (D38, D59
  merged).
- **ARRAYS-D18** — transparency at a number box is the runtime's fix, for every command.
- **ARRAYS-D19** — the English `]<eXit>` is recorded in coverage, not built: `tight` is per
  question, not per language, and it changes no letter typed (D42, D67 merged).
- **ARRAYS-D20** — the arrays' defaults drop trailing zeros (D36, D61 merged).
- **ARRAYS-D21** — Missing gains clicK, UPdate and the words of Base point, Levels, Total,
  Expression, Axis, ROWs, Tangent direction, Z direction, Key point (p133–p142, p253–p260,
  p317–p324); the unverified marks probes settled go.
- **ARRAYS-D22** — `currentProperties.test.ts:218` is rewritten (it writes fields that no longer
  exist); 2023 citations become 2027 probes.
- **ARRAYS-D30** — ROWs hidden and unhandled at ARRAYPOLAR's main prompt.
- **ARRAYS-D31, D32** — Angle between ≤ 0 refused with `positiveNonzero`; Fill 0 with a new key
  (`parameterCannotBeZero`; ar takes the English).
- **ARRAYS-D33** — |fill| > 360 becomes |fill| mod 360, signed; 720 and −400 unverified.
- **ARRAYS-D34** — a span reaching 360 becomes a full turn in the ring's direction; the desktop's
  question (table 5669) stays unverified in Missing.
- **ARRAYS-D35** — the ring keeps its direction apart from its size; defaults unsigned.
- **ARRAYS-D37** — Enter at the centre refused (`pointOrKeywordRequired`) and asked again.
- **ARRAYS-D39, D62** — `ARPOLAR`, `ARPATH` removed (an alias no AutoCAD has; the englishSurface
  walk starts them by their names). A removed name is a catalog change: `cad/README.md`
  "Versioning" says whether it is major.
- **ARRAYS-D41** — the es centre prompt `Especifique el punto central de la matriz`.
- **ARRAYS-D43** — counts up to 32767 (`requiresIntegerBetweenOrKeyword`), all three commands.
- **ARRAYS-D44** — ARRAYPOLAR and ARRAYPATH rows in `currentProperties.test.ts` (DERIVED, p249,
  p316).
- **ARRAYS-D50** — ARRAYPATH's base is the path's start; the source stays in place, item 1.
- **ARRAYS-D51** — an open path starts at the end nearer the pick (typed, snapped, or a mode's
  last point); a circle at parameter 0, counter-clockwise; midpoint ties out of tests.
- **ARRAYS-D52** — Align Yes: move by P(s)−P(0), turn about P(s) by θ(s)−θ(0); No: move only.
- **ARRAYS-D53** — Measure: floor(L/s)+1 open, floor(L/s) closed; Divide keeps the count, step
  L/(n−1) open, L/n closed; a count over the maximum capped.
- **ARRAYS-D54** — the locked curve: `onLockedLayer`'s counted words, once per locked object
  found, then the prompt again.
- **ARRAYS-D55** — typed snaps at the path pick are the pick and set the start; LASTPOINT kept.
- **ARRAYS-D56** — Enter at `Select path curve:` asks again.
- **ARRAYS-D57** — a non-curve says `1 was filtered out`; P and ALL say the arrayed line too.
- **ARRAYS-D58, D63** — Group at the path pick, clicK, UPdate: Missing.
- **ARRAYS-D60** — `Maximum items = N` said again before the count prompt is asked again.
- **ARRAYS-D64** — Missing records the 2027 prompts of ARRAYPATH's options (p317–p324).
- **ARRAYS-D65** — polylines are built as paths; splines, ellipses, sloping and tilted paths
  Missing.
- **ARRAYS-D66** — the path pick's rollover is `ghostLook.rollover`.
- **ARRAYS-D68** — ARRAYPATH's tests move from `inquiry.test.ts` into a new arrays test file with the
  others, each value citing a 2027 probe.

## 7. Tests proposed

Regression tests first: each finding's. Then, by file (a new
new arrays test file in `cad/application/tools/` gathers the three commands' tests from `transforms.test.ts`
and `inquiry.test.ts`, ARRAYS-D68):

- the untested cells above, each from its scratch test (`research/review/arrays/{a,b,c,me}`);
- `transforms.test.ts:1825` defaults without a probe, :1920, :1990 `acc/wn…` → p124–p130; :2049
  the echo (p159); :2068 a collapsed ring passes (assert positions, p248); :2085 → p05, p214, p263;
  :2137 the 2023 Spanish (APO-09);
- `inquiry.test.ts:806` asserts APA-01's bug; :845 `new Set(orientations).size > 1` always passes;
  :840 no echo; :888, :930 no probe ids;
- `selectionModes.test.ts:839`, :1246 `acc/bk…` → p353, p347, p348, p357; :947 still 2023-only;
- `invalidAnswers.test.ts:385`, :393 → p108, p114, p350; `measuredAnswers.test.ts:227` → p265;
  `dynamicInputEnter.test.ts:222` → p143; `ambiguousKeywords.test.ts:145` (`CO`) and
  `keywords.test.ts:67` (`EXI`) still need a 2027 probe;
- `currentProperties.test.ts:218` (ARRAYS-D22, D44); `ucs.test.ts:360` (types the spacing, so it
  never meets ARR-03);
- `englishSurface.test.ts:899–904` and its snapshot (APO-07, APO-10, APA-14).

## 8. What is not tested and why

The dynamic-input labels (`Column spacing`, `Fill angle`…: a desktop's English pass); the canvas
pixels of the preview (the scene's strokes are asserted, the browser is not opened).

## 9. What could not be reviewed and why

- d08c's polar run: ARRAYASSOCIATIVITY had been left at 0 by d08b's `_AS _N` (restored at once,
  no es-ES console run fell in the window), and the count did not move: Escape at ARRAYPOLAR's
  main prompt is **unverified** (ARRAYS-D4 applies it to all three).
- Escape at a value's prompt, Space against Enter, the 360° overrun question, the English labels
  of the menus and the palette, clicK's grip pick: the desktop, AYG's session.
- REDO after `_U` (a Lisp between them made the console say `Nothing to redo`), `-5` at Unit
  cell's first corner, Enter at the opposite corner keeping the spacing, fills of 720 and −400,
  Angle between with 1 item, a tilted circle or arc path, non-integer defaults of ARRAYPATH: out of
  the subagents' ranges; the coverage entries say **unverified**.

## 10. Refuted in the adversarial pass

- APO-01: ARR-01's duplicate.
- The ghost differs from the commit (BRJ-01's analogue): the same 17 centres (`c/look.test.ts`).
- The newest of two curves under the pick: taken (p345).
- LASTPOINT after a typed path pick: kept, as here (p357, p358); after ARRAYPOLAR's centre: kept,
  as here (p229, p273) — the earlier reviews' "a typed point sets LASTPOINT" does not hold here.
- ROTate No carries the set's extents centre, not a vertex average (p245–p252): as here.
- `_.ARRAYRECT`, the `_` of the echo, `'ORTHOMODE` refused everywhere, REDO's step name: owned by
  the LINE review's areas.
- es `Introduzca el número de elementos o` against the table's `Indique…`: the console says
  `Introduzca` (p373 es).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| ARRAYRECT `MATRIZ†`, `MA†` | p103, p104 | false: ARRAY (ARR-01) |
| `Type = Rectangular  Associative = No` | p01 | no longer true: Yes (AYO-01) |
| defaults `<15.00>`, `<60.00>`, `<360.00>` | p116, p214 | false (ARR-10, APO-11) |
| 1.5 × width and height | p165 | false in a turned UCS (ARR-03) |
| Unit cell's `Precise esquina opuesta` unverified | p123 | holds: settled |
| the 2023 console's Unit cell refusals | p124–p130 | hold in 2027 |
| MAXARRAY's message | p00 | MAXARRAY is nil in 2027: unverified |
| es `Precise el punto central de la matriz` | p201 | false (APO-09) |
| "the fill becomes that many steps" | p267, p274 | false past 360 and clockwise (APO-02, APO-03) |
| ARRAYPATH: "the source is consumed into the array" | p06 | holds for Yes only (APA-01) |
| "leaving out the arrayed objects with `1 was filtered out`" | p354, p356 | false for P and ALL (APA-10) |
| Missing: "multi-segment polyline path" | p308, p359, p360 | too narrow (APA-06) |
| ARRAYPATH JSDoc "the first item sits at the path's start" | p06 | false (APA-01) |

Rules: `cad-tools.md` "Pick feedback" says a path curve's rollover is `THEME.selected` 2–2.5 —
**stale** (d03-1: the standard rollover; APA-15); "Reuse before writing" lists ARRAYPATH's pick
among those passing `one` — holds, without `locked` (APA-03); "Dynamic input" (ARRAYRECT's values
are prompts its keywords open) holds. Checked and holding: `cad-catalogs.md` (yes-or-no
questions, keyword ids), "What a new object wears" (copies are DERIVED: p164, p249, p316).

## 12. Order of execution and estimate

1. **ARR** (this session): ARR-01 (the ARRAY command), ARR-02 to ARR-12, ARR-09 in the runtime.
2. **APO** (this session): APO-02 to APO-15.
3. **APA** (this session): APA-01 to APA-18, with the layouts as `domain/` functions (ARRAYS-D2),
   which AYO derives from.
4. **AYJ** (this session): AYJ-01, AYJ-02 (the source hidden as item 1 only once AYO makes it
   one; until then the source stays drawn, the copies plain), AYJ-03 recorded.
5. **AYO** (a fresh session; no mouse): the object, skill `extend-model` — the largest block.
6. **AYG** (a fresh session; the owner's mouse for an en-US desktop pass of the labels and the
   grips' drags): the grips during the command and at `Command:`, the multifunctional menus, the
   palette rows and their edits.

Blocks 1–4 share the catalogs and snapshots: one after another.

## 12a. Executed

| Block | Commit | Outcome |
| --- | --- | --- |
| ARR | `ef58183` | ARR-01 to ARR-08, ARR-10 fixed (ARRAY is a command of its own, `ArrayCommandTool`); ARR-09 **refuted**: `'ZOOM` already passes a number box, p155 failed on ORTHOMODE, a variable not built (drafting-aids Missing), regression test kept; ARR-11, ARR-12 recorded. ARRAY at the prompt and in U's echo: unverified |
| APO | `566528d` | APO-02 to APO-12 fixed; counts to 32767 for all three (`arrayCounts.ts`), the preview capped at 1000 items with a WHY; a Fill of 720 taken as a full turn, −400 as 40° clockwise: unverified; APO-13 to APO-15 recorded and tested |
| APA | `4dbdb66` | APA-01 to APA-13, APA-15 to APA-18 fixed; the three layouts in `cad/domain/arrays.ts` (ARRAYS-D2); `ModeFind.last`, `one.lockedAsksAgain`, `one.named`, `Tool.onAskAgain` added; a closed polyline's start and direction unverified; ARRAYPATH's copies keep the selection's order (D16 was ARRAYRECT's) |
| AYJ | `d940a70` | AYJ-01 and AYJ-02 fixed (Escape commits; the items drawn plain); ARRAYPOLAR's Escape and Escape at a value's prompt unverified; AYJ-03 recorded |
| AYO | `b6b2317` | AYO-01 fixed: one array object by default (an `insert` of an anonymous `*U<n>` block, its parameters in the block's coordinates, ARRAYS-D8), ASsociative kept for the session (p422: the registry, ARRAYS-D3), the source hidden as item 1 in the preview (D5); the path association Missing (ARRAYS-D9); unreferenced anonymous blocks left out on save and the `<No>` default of a second run unverified; no cap on the derived items (a WHY in `blocks.ts`) |

## 13. Changes the execution makes

- Coverage: the three entries (Implemented, Missing, unverified marks, the WHY of Associative =
  No until AYO), a new ARRAY entry, `command-line.md`'s alias list.
- Rules: `cad-tools.md` "Pick feedback" (the path pick's rollover), "Reuse before writing" (the
  path pick's `locked`, typed snaps), and once AYO lands `cad-engine.md` "Blocks" (the array).
- Catalogs: ARRAY's names and type question, `parameterCannotBeZero`, es
  `specifyCenterPointOfArray`, the aliases removed.
- Roadmap: row 15 `plan`, owning the array object; the analogues for the Properties review.

## 14. Template improvements proposed

- A desktop pick near the drawing area's edge can land under the command line: the selection
  misses, a window starts, and the keywords typed next run as commands (`_AS` → CONEXIONBD, `_N`
  → NORMAS: a palette and a dialog to close). Keep a figure in the middle third of the view, and
  read `com hist` between cases before the next one types (annex-probes §4).
- A keyword answer on the desktop can set a registry variable for good (`_AS _N` →
  ARRAYASSOCIATIVITY 0): list every keyword of the session that writes one in the `dsk.sh`
  header, read it after the case and restore it before the next (annex-probes §4).
- When the command's object is not modelled, the desktop pass of its grips, menus and palette
  goes in the review's first session anyway: it sizes the object's block before the plan.
- A Windows dialog left open by a desktop accident is closed with a posted `WM_COMMAND IDCANCEL`
  when UIA's Invoke cannot (Configurar normas).
