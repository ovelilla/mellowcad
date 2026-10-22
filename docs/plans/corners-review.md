# Corners review (FILLET, CHAMFER)

> **Status:** plan, 2026-10-22 — phases 0–4 of skill `command-review`, the thirteenth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (CRS, CRP, CRG, CRJ).

## 1. Summary

2 high, 15 medium and 8 low findings over four blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| CRS | the command line: values refused, defaults, Undo after a transparent command, Spanish letters | 0 | 3 | 5 |
| CRP | the picks: typed object snaps, locked layers, a mode's find | 1 | 2 | 0 |
| CRG | what it produces: the new object's properties, polyline corners, refusals per type | 1 | 6 | 2 |
| CRJ | the look: the ghost, the rollover, Polyline's preview, the refusal at the cursor | 0 | 4 | 1 |

The worst: a selection mode finds an object on a locked layer and FILLET or CHAMFER edits it, where
AutoCAD says `The object is on a locked layer.` and asks again (CRP-03: p274); the arc and the bevel
take the lineweight, linetype scale and thickness of the object picked **second**, where mellowcad
gives them the first line's thickness and no lineweight, so a fillet between two 0.50 lines is a
thin arc (CRG-01: p229, p313, p332, p334).

The analogues TRIM left, checked first: a typed object snap override at the object prompt is the
pick in AutoCAD and refused here (TRP-01's analogue differs: CRP-01, p257–p269); a locked object
picked says `The object is on a locked layer.` — FILLET's words, not TRIM's `1 was on a locked
layer.` — and is passed over in silence here (TRP-03's analogue differs: CRP-02, p270–p276); every
type it cannot handle is said in AutoCAD's words, and passed over in silence here (TRG-04's
analogue differs: CRG-06, CRG-07); a polyline's arc segments are read as arcs by FILLET, and CHAMFER
cuts them as chords as AutoCAD 2027 does (TRG-01's analogue holds: p209–p217); Undo is listed from
FILLET's and CHAMFER's first prompt on, says `Command has been completely undone.` with nothing to
take back and counts the fillets, radii and Polyline runs as the console does (TRS-03 and TRS-04's
analogues hold: p148–p155, p169); a preselection is dropped by AutoCAD too (TRS-02's analogue holds:
p162–p164).

## 2. Inventory

Commit `0fdf11e`; AutoCAD 26.0 (`_VERNUM` X.118.0.0, p00), tables of 2026-10-20 (`all_es.tsv`).

- **The commands:** `cad/application/tools/FilletTool.ts`, `ChamferTool.ts`, `cornerObjects.ts`
  (objects, picks, refusals, planes), `polylineCorners.ts`, `curveFillets.ts`, `roundFillets.ts`,
  `lineCorner.ts`, `commandSettings.ts`; `objectSelection.ts` (the single object's pick), `typedPick.ts`;
  `cad/geometry/primitives.ts` (`filletLines`, `capParallelLines`), `cad/geometry/bulgeArcs.ts`,
  `cad/domain/polylines.ts`. Registered in `defaultTools`, `TOOL_COMMANDS`; not transparent (p106).
  Catalogs: FILLET (`F`; es EMPALME, `MP`), CHAMFER (`CHA`; es CHAFLAN, `CH`), keywords Undo,
  Polyline, Radius, Distance, Multiple, the prompts and messages of the coverage entries; `ar` holds
  only the rail's labels. The rail's flyout (`components/cad/tool-rail.tsx`), the landing's filing
  (`content/commands.ts`).
- **Tests:** `cornerDirection.test.ts`, `cornerModes.test.ts`, `cornerRefusals.test.ts`,
  `parallelFillet.test.ts`, `editing.test.ts` (3576–5280), `polylineWidths.test.ts`,
  `elevation.test.ts`, `normals.test.ts`, `tiltedUcs.test.ts`, `currentPropertyCommands.test.ts`,
  `lastPoint.test.ts`, `invalidAnswers.test.ts`, `englishSurface.test.ts`, `savedSettings.test.ts`,
  `measuredAnswers.test.ts`; `currentProperties.test.ts` has no row for them (CRG-09).
- **Related tools, reviewed in their part:** U, UNDO, REDO, MREDO after them; ID for LASTPOINT;
  -LAYER Lock, Off, Freeze; CHPROP for the overrides; 'LTSCALE, 'ZOOM, '-PAN, '-OSNAP inside them.
- **Areas owned:** corners of lines, arcs and polylines — the corner geometry, the Polyline
  option, the joins, the refusals per pair (blocks CRG, CRJ).
- **Areas cited:** LINE's (command line, point input, object snaps, dynamic input, transparency,
  undo, the shortcut menus), ERASE's (`Select objects:`, the pick, the preselection), PLINE's (the
  polyline object), ARC's and CIRCLE's objects, RECTANG's (FILLETRAD, CHAMFERA, CHAMFERB in the
  drawing: rectang/p302, p316, p317), TRIM's (the analogues). Differences found in them: CRP-01
  (typed overrides at a single object's pick: LINE's object snaps, TRIM's hook), CRP-03 (the single
  object's pick in `ObjectSelector`: ERASE's selection).
- **Knowledge:** `docs/coverage/modify.md` (FILLET, CHAMFER); rules `cad-tools.md`,
  `cad-catalogs.md`, `cad-engine.md`, `cad-runtime.md`, `testing.md`.

## 3. Probes

Console inputs are `scripts/research/probes/corners/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh corners <ids>` in es-ES and en-US;
the desktop's are `dsk.sh` (`dsk.sh setup d01 …`) with `lib-dsk.sh` (TRIM's view and Shift
helper). Transcripts and screenshots are in `research/probes/corners/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | ACADVER, `_VERNUM`, FILLETRAD, CHAMFERA, CHAMFERB, TRIMMODE, CHAMMODE, FILLETPOLYARC |
| p100–p169 | the command line: names (FILLET, F, CHAMFER, CHA, EMPALME, MP, CHAFLAN, CH, `_.`, `'FILLET`), repeat; every prompt's text, declared keywords and Spanish letters; FOO, 0, −5, two points, Enter, Space, another prompt's words at each; Multiple; transparency at each prompt; Undo at each depth, with nothing, after a refusal, a miss, a Polyline run, 'LTSCALE; U, REDO, UNDO 2, MREDO after, U after an empty run; preselection; the Spanish messages |
| p170–p239, p310–p339 | what it produces, MPDUMP: two lines (crossing, apart, R0, too large, parallel, collinear, oblique); CHAMFER's distances; line, ARC, CIRCLE pairs; polylines adjacent, one apart, an open one's ends, closed, joined, with widths; arc segments; Polyline on every vertex kind, too short, parallel, diverging; ellipse, elliptical arc, spline, text, MTEXT, insert, hatch, dimension at each prompt; layers, overrides on either object, current properties, Z and thickness, normal −Z, UCS Z 30 and X 90, a layer changed between the picks |
| p240–p309 | the picks: every point form at each object prompt and LASTPOINT after a hit and a miss; `_END`, `_MID`, `_INT`, `_NEA`, `_PER`, `_CEN`, an override finding nothing; ORTHOMODE, OSMODE; locked, Off and frozen layers, a Window round a locked line; the newer of two under a pick; every selection mode at each prompt |
| d01–d13 | the desktop (Spanish profile): FILLET's ghost (d01), Shift's (d02), CHAMFER's and Shift's (d03); the first prompt's rollover on a line, a polyline's segment, an ellipse, a locked line (d04); Polyline's prompt (d05); a line with a parallel and a meeting polyline segment (d06); the right button (d07); Multiple, Escape and U (d08); DYNMODE 3 (d09, d13); Radius by two points, then Polar (d10); Escape and what stays selected (d11); Ctrl+Z inside Multiple (d12) |

## 4. Matrix

Cells read `state · probe · test`; "scratch" is the gitignored `research/review/corners/` (`a` the
command line, `b` what it produces, `c` the picks, `r` the look). Columns: F1, F2 (FILLET's first
and second object), FR (Radius), FP (FILLET's Polyline); C1, C2, CD (Distance's two prompts), CP
(CHAMFER's Polyline). A row the same at every prompt takes one cell.

### CRS — the command line

| Row | F1, C1 | F2, C2 | FR, CD | FP, CP |
| --- | --- | --- | --- | --- |
| A names, aliases, `_` forms | match · p100–p103 · `editing.test.ts:3591`, `:4833`, `englishSurface.test.ts:929`; the † of MP and CH stale (CRS-06) | — | — | — |
| A `_.FILLET`, repeat, `'FILLET` | `_.` known (command-line.md); repeat and the transparent refusal untested · p104–p106 | — | — | — |
| A preselection | dropped, nothing selected after: untested · p162–p164 · scratch a | — | — | — |
| B text, settings line | match, Trim, Angle, mEthod known · p100, p101, p107–p112 · `cornerRefusals.test.ts:222` | match; the Spanish double space before `[Radio]` known · p100 | match · p107, p110 | FP match · p109; CP lists `Distance/Angle/Method` (CRS-05) · p112 |
| B keywords declared, letters | match but Spanish `R` (CRS-04) · p100, p101, p165, p168 | match · p100 | — | `M` at C2 and CP is Method: known · p122, p125 |
| B Enter, Space | ends: match · p131, p132 | asks again: match · p129, p130, p133 · `cornerRefusals.test.ts:203` | FR keeps: match · p136; CD Enter Enter differs CRS-02 · p137 | FP ends, Multiple asks F1: match · p134, p135 |
| B `0`, a negative | a pick at that distance: untested · p120 | as F1 · p120 | `0` taken: untested; −5 differs CRS-01 · p116, p119 | — |
| B FOO, another prompt's words | match · p113, p117, p123 · `cornerModes.test.ts:55`, `invalidAnswers.test.ts:357` | match · p114, p121 · `cornerRefusals.test.ts:449` | `Requires numeric distance or two points.`: untested · p116, p119 | match · p115, p118, p124 |
| B Multiple | match · p126–p128 · `editing.test.ts:4435`, `:5247` | — | — | — |
| E 'ZOOM, '-PAN, '-OSNAP, 'LINE | match · p140–p147 · scratch a; 'ZOOM's `>>` text and 'ORTHOMODE known (view.md, command-line.md) | as F1 | as F1 | as F1 |
| F Undo listed, with nothing, what it counts | listed from the start, `Command has been completely undone.`: untested · p148–p155, p169 · scratch a | refused: match · p121 | — | refused: match · p124 |
| F after a transparent command | differs CRS-03 · p156 | — | — | — |
| F after the command, an empty run | match · p157–p161 · `savedSettings.test.ts:104` · scratch a | — | — | — |
| G another command typed | refused as a selection: untested · p138, p139 | as F1 | — | — |
| G Escape, Ctrl+Z, what stays selected | Escape keeps Multiple's fillets, one U takes the run back, nothing selected · d08, d11; Ctrl+Z inside is the command's Undo · d12 | Escape: nothing kept · d11 | — | — |
| K catalog sweep | 25 ok; es-several and no-source settled by the console · p100, p109, p112, p113, p148, p166, p167 | — | dynamic input's labels: known (drafting-aids.md, a `<default>` shown as the placeholder) · d13 | — |
| L history | match line by line but CRS-01–03 · p100–p169 · scratch a | — | — | — |

### CRP — the picks

| Row | F1, C1 | F2, C2 | FP, CP |
| --- | --- | --- | --- |
| C `x,y`, `@dx,dy`, a point on nothing | match · p240, p242, p249, p253–p255 · `cornerModes.test.ts:431`, `:450`, `:464`, `:493` | match · p240, p250 | match · p251, p252, p306, p307 · `cornerModes.test.ts:474` |
| C `x,y,z`, `@`, `d<a`, `*x,y`, `#x,y`, a number | untested · p241, p243–p247, p256 · scratch c | untested · p248 | — |
| C LASTPOINT after a hit and a miss | untested · p241, p247, p249 · `lastPoint.test.ts:905` (a miss) | untested · p250 | untested · p252, p307 |
| D typed overrides | differs CRP-01 · p258, p262, p263, p264, p268, p309 | differs CRP-01 · p257, p259–p261, p267 | differs CRP-01 · p269 |
| D ORTHOMODE, OSMODE with a typed point | no effect: untested · p265, p266 | — | — |
| C a locked object picked | differs CRP-02 · p270, p275 | differs CRP-02 · p271 | differs CRP-02 · p276 |
| C a locked object a mode finds | differs CRP-03 · p274 | — | — |
| C Off, frozen | not found, asked again: untested · p272; frozen n/a | — | — |
| C the newer of two under a pick | untested · p278 | untested · p277, p279–p281 | — |
| B selection modes | match · p282–p289 · `cornerModes.test.ts:55`, `:81`, `:107`, `:130`; refused modes untested · p290–p296 | match · p296, p298, p308 · `cornerModes.test.ts:150`, `:286` | match · p300 · `cornerRefusals.test.ts:140` |
| B where a found circle stands | the horizontal diameter (0° or 180°): match · p303–p305 · `cornerModes.test.ts:233` | — | — |
| P running snaps, rollover | snaps off at the object prompts: match · d01-1 (the pickbox alone); rollover: CRJ | — | — |

### CRG — what it produces

| Case | FILLET | CHAMFER |
| --- | --- | --- |
| two lines: crossing, apart, R0, too large, oblique, picks' sides | match · p170–p179 · `cornerDirection.test.ts:68`, `:78`, `:97` · scratch b | match · p180–p182, p185–p187 · `cornerDirection.test.ts:120` |
| parallel, collinear | match · p175, p176 · `parallelFillet.test.ts:91`, `:148` | match · p183, p184 · `cornerRefusals.test.ts:244`, `:262` |
| line, ARC, CIRCLE pairs | match · p189–p195, p321 · `cornerDirection.test.ts:157` · scratch b; a tie known · p188 | refused, asked again: match · p196–p198 · `editing.test.ts:5065` |
| polyline: adjacent, one apart, closed's ends | match · p199, p200, p202 · `editing.test.ts:3771` | match · p224 |
| an open polyline's first and last of three | differs CRG-03 · p201 | differs CRG-03 · p328 |
| a line and a polyline, two polylines, handles | match · p203–p205 · `editing.test.ts:3985`, `:4155` | match · p203, p204 |
| widths | match · p206–p208 · `polylineWidths.test.ts:637`, `:657` | match · p208 |
| arc segments | arcs: match · p209–p213, p217 · `editing.test.ts:3807`; two adjacent arcs differ CRG-04 · p322 | chords: match · p215, p216 · `editing.test.ts:5104`; with a line refused: match · p214 |
| Polyline: square, mixed, parallel, R0 | match · p218, p221, p223 · `editing.test.ts:3741`, `:4365`, `:4505`; arc–arc vertex differs CRG-04 · p219 | match · p224, p225 · `editing.test.ts:4915` |
| Polyline: too short | differs CRG-02 · p220 | differs CRG-02 · p226 |
| Polyline: diverging lines round an arc | report differs CRG-05 · p222 | — |
| TEXT, MTEXT, HATCH, INSERT, DIMENSION | differs CRG-06 · p231–p235, p238, p239, p310–p312 | differs CRG-06 · p316–p318 |
| ELLIPSE, elliptical arc, SPLINE | differs CRG-07 · p228, p230, p236, p237, p324–p326 | differs CRG-07 · p314, p315, p319, p327 |
| layer: shared, different, changed between picks | match · p329, p330, p339 · `editing.test.ts:4764` · scratch b | as FILLET |
| current CECOLOR, CELTYPE, CELWEIGHT, CELTSCALE, ELEVATION, THICKNESS | not taken: match · p333 · `currentPropertyCommands.test.ts:33` | as FILLET |
| the objects' lineweight, linetype scale, thickness | differs CRG-01 · p229, p313, p331, p332, p334 | differs CRG-01 · p332, p334 |
| normal −Z ARC with a line | differs CRG-08 · p335 | — |
| normal −Z polyline, UCS Z 30, UCS X 90 | match · p335–p338 · `tiltedUcs.test.ts:452` · scratch b | — |
| I, J the result an ordinary object, saved and opened identical | untested · scratch b `contract.test.ts` | as FILLET |

### CRJ — the look (desktop d01–d13, scratch r)

| Row | AutoCAD | mellowcad | State |
| --- | --- | --- | --- |
| Q the first prompt's cursor and rollover on a line | the pickbox alone, the line thickened · d01-1 | the rollover, width 2 | match |
| Q the second prompt's ghost | the result in the selection's glow, the pieces it removes dimmed in place; the side follows the cursor · d01-2, d01-3, d06-2 | the first line whole in the glow, the trimmed lines in the rollover's grey over the untouched originals, the arc thin in the rubber band's colour | differs CRJ-01 |
| Q the cursor on nothing at the second prompt | the first object in the glow · d01-4 | the same | match |
| Q Shift held | the sharp corner in the glow, the rest dimmed · d02-1, d03-2 | the corner, as the ghost | differs CRJ-01 |
| Q CHAMFER's ghost | as FILLET's · d03-1 | as FILLET's | differs CRJ-01 |
| Q a polyline's segment under the pickbox | that segment alone · d04-2 | the whole polyline | differs CRJ-02 |
| Q a locked object under the pickbox | faded, no rollover, a padlock badge · d04-4 | the rollover | differs CRJ-03 (the padlock and the fade: Properties' review) |
| Q Polyline's prompt over a polyline | every corner as it would be, in the glow · d05-1 | the polyline in the glow | differs CRJ-04 |
| Q a second object that makes no corner | the circle-and-slash, the refusal's words at the cursor · d06-1 | both objects highlighted | differs CRJ-05 |
| P the right button | Intro, Cancelar, Entrada reciente, the keywords, Encuadre, Zoom, SteeringWheels, Calculadora rápida · d07 | Enter, Cancel, the keywords · scratch r | known (workspace.md: Recent Input, Pan, Zoom, SteeringWheels, QuickCalc) |
| P Radius by two points, Polar | the crosshair, running snaps, a dashed rubber band, Polar bends it · d09-2, d10 | the same · scratch r | untested |
| D dynamic input at Radius and Distance | the whole prompt and the default selected in the box · d13 | the prompt and a label, the default as the placeholder | known (drafting-aids.md) |
| Q the second prompt's Spanish double space | `aplicar esquina o  [Radio]` · d01-cl2 | one space | known |

## 5. Findings

### High

#### CRP-03 — A selection mode takes an object on a locked layer, and FILLET or CHAMFER edits it

- **Severity:** high · **Row:** C · **Status:** verified (the reviewer reran p274 and the scratch test)
- **Where:** `cad/application/tools/objectSelection.ts` — the single object's pick (`one`) never
  leaves a locked find out, where a set sifts its finds.
- **AutoCAD:** p274 (es-ES and en-US): `_W 20,-30 40,70` round the locked line alone → `The object
  is on a locked layer.` and the first prompt again; the dump keeps `(2D9 LINE LK)(10 30.0 -20.0
  0.0)(11 30.0 60.0 0.0)`.
- **mellowcad:** scratch c `crp.test.ts` "p274 then a pick": the locked line is trimmed to
  30,0–30,60; Polyline's Window rounds a locked polyline; `L` takes a locked line drawn last.
- **Scenario:** a locked wall layer, `F` `W` round a corner, a pick → mellowcad trims the locked
  wall → AutoCAD refuses → the lock no longer protects the drawing.
- **Fix:** CORNERS-D43, D44. **Alternative:** an `accept` filter per tool (BREAK, UCS OBject and
  ARRAYPATH share the hole).
- **Regression test:** `cornerModes.test.ts`: p274, Last and Polyline's Window over a locked
  object.
- **Coverage, rules or catalogs affected:** modify.md; the single object's pick in `cad-tools.md`.

#### CRG-01 — The arc and the bevel take the second object's lineweight, linetype scale and thickness

- **Severity:** high · **Row:** H · **Status:** verified (the reviewer read p332's dump)
- **Where:** `FilletTool.ts` (`fillet`, `cap`), `ChamferTool.ts` (`chamfer`), `roundFillets.ts`
  (`filletRound`): `carryPlane` from the first line.
- **AutoCAD:** p332: overrides on the line picked second (red, DASHED, ltscale 2, 0.50, thickness 3)
  → the ARC `"LinetypeScale":2,"LineWeight":"LineWeight050","Thickness":3`, colour and linetype
  ByLayer, the bevel the same; p331, p229: the overrides on the line picked first leave the arc
  plain (the order of the picks, not of the drawing); p313: a CIRCLE or ARC picked second gives
  them too; p334: thickness 3 then 5 → the arc and the bevel 5.
- **mellowcad:** scratch b `crg.test.ts` "p332": no lineweight, no thickness; "p331, p229", "p334":
  thickness 3.
- **Scenario:** two 0.50 walls filleted → AutoCAD's arc is 0.50 → mellowcad's is thin (LWDISPLAY
  is on here) → the corner looks broken.
- **Fix:** CORNERS-D20.
- **Regression test:** `editing.test.ts` beside the layer tests: p229, p313, p332, p334; correct
  `elevation.test.ts:599` and `:629` (CORNERS-D28).
- **Coverage, rules or catalogs affected:** modify.md ("the arc takes the first line's elevation and
  thickness", the bevel's too); `cad-tools.md` "FILLET's arc and CHAMFER's bevel … `carryPlane`
  alone" is stale; the per-object linetype scale is not modelled: Missing.

### Medium

#### CRP-01 — A typed object snap override is refused at the object prompts

- **Severity:** medium · **Row:** D · **Status:** verified
- **Where:** `FilletTool.ts`, `ChamferTool.ts`: no `takesSnapOverride`, so `CadRuntime.pointModifier`
  passes `_END` to the prompt, which refuses it.
- **AutoCAD:** p257 `_END` / `of 99,1` at F2 picks at 100,0, LASTPOINT 100,0; p262 `_PER` from
  LASTPOINT keeps the side of the snapped point; p260 `_INT` at the crossing takes the newer, the
  first object again → `Cannot fillet an entity with itself.`; p263 `_CEN` on a circle → nothing at
  the centre, asked again; p264 nothing found → `No Endpoint found for specified point.` (es `No se
  ha encontrado ptoFINal para el punto designado.`), `*Invalid selection*`, the Expects line; p267,
  p268 (CHAMFER), p269 (FP: `1 line was filleted`).
- **mellowcad:** scratch c `crp.test.ts` CRP-01: `_END` is `*Invalid selection*`, then `99,1` is
  picked raw (LASTPOINT 99,1); p262 keeps the wrong side.
- **Scenario:** first line picked → `PER`, a point beside the other → refused, the next point taken
  raw → AutoCAD picks at the snapped point.
- **Fix:** CORNERS-D40, D41 (TRIM's hook, commit `5d3b71b`).
- **Regression test:** `cornerModes.test.ts`, the scratch block as is.
- **Coverage, rules or catalogs affected:** modify.md; `snapNotFound` exists.

#### CRP-02 — A locked object picked is passed over in silence

- **Severity:** medium · **Row:** C · **Status:** verified
- **Where:** `cornerObjects.ts` (`pickFilletObject`), `FilletTool.pickAt`, `ChamferTool.pickAt`.
- **AutoCAD:** p270 (F1), p271 (F2), p275 (C1), p276 (FP): `The object is on a locked layer.` (es
  `El objeto está en una capa bloqueada.`), the same prompt again, LASTPOINT the pick.
- **mellowcad:** scratch c "p270", "p271", "p275", "p276": asked again, nothing said.
- **Fix:** CORNERS-D42, D45 (OFFSET's `objectOnLockedLayer`, TRIM's `lockedAt`).
- **Regression test:** `cornerRefusals.test.ts`, en and es.

#### CRS-01 — A negative radius or chamfer distance is taken in silence

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `FilletTool.setRadius`, `ChamferTool.setDistance`; `takes()` is null at the radius.
- **AutoCAD:** p116, p119: `-5` → `Value must be positive.` (es `El valor debe ser positivo.`) and
  the same prompt (AllowNegative false, AllowZero true).
- **mellowcad:** scratch a `crs.test.ts:37`, `:43`, `:57`: back to the object prompt, or on to the
  second distance; `F R -5 5` then reads the `5` as a pick.
- **Fix:** CORNERS-D1. **Regression test:** FR, CD1, CD2 refuse −5 and take 0, en and es.

#### CRS-02 — Distance's second default after Enter at the first is the first distance

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `ChamferTool.ts`: the second prompt's `enter` and `askDistance`'s default.
- **AutoCAD:** p137: with 10 and 5, `_D` Enter → `Specify second chamfer distance <5.0000>:`, Enter
  keeps 10 / 5; a typed first becomes the second's default (p110, p111).
- **mellowcad:** scratch a `crs.test.ts:80`: `<10.00>`, and Enter sets CHAMFERB to 10.
- **Fix:** CORNERS-D2. **Regression test:** p137 beside `editing.test.ts:4833`.
- **Coverage:** CHAMFER's "whose default is the first just given" narrows to a typed first.

#### CRS-03 — Undo after a transparent 'LTSCALE takes back only LTSCALE

- **Severity:** medium · **Row:** E, F · **Status:** verified for FILLET (CHAMFER runs the same code)
- **Where:** `FilletTool.undoStep`, `ChamferTool`'s: `ctx.undo()` once for a fillet step.
- **AutoCAD:** p156: a fillet, `'_LTSCALE 2`, `_U` → `Command has been completely undone.`,
  `Regenerating model.`; LTSCALE and the fillet both back.
- **mellowcad:** scratch a `crs.test.ts:98`, `:110`: the message, LTSCALE back, the fillet kept.
- **Fix:** CORNERS-D3 (TRIM's TRS-07). **Regression test:** p156, FILLET and CHAMFER.
- **Rules:** `cad-tools.md` "Ordering and undo" already says it: the code is brought to it.

#### CRG-02 — Polyline's corners too short: AutoCAD cuts them in turn

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `polylineCorners.ts` (`cutPolylineCorners`): both corners sharing a short segment are
  dropped.
- **AutoCAD:** p220, a closed 20×20 square at R15: `2 lines were filleted`, `2 were too short`, the
  corners at 20,0 and 0,20 rounded (`[0,0] [5,0 b.4142] [20,15] [20,20] [15,20 b.4142] [0,5]`); p226
  CHAMFER D15,15 the same.
- **mellowcad:** `0 lines were filleted`, `4 were too short`, nothing changed.
- **Fix:** CORNERS-D21. **Regression test:** p220, p226 beside `editing.test.ts:4505`.

#### CRG-03 — An open polyline's first and last of three segments close it

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `polylineCorners.ts` (`segmentPair`): "one apart" is tried before "an open one's ends".
- **AutoCAD:** p201 (0,0 100,0 100,100 20,30 at R10) closes it:
  `[12.3288,0] [100,0] [100,100] [5.7437,17.5258 b.6925]`; p328 CHAMFER closes it too; p200, whose
  crossing lies past the first segment's end, replaces the middle segment.
- **mellowcad:** `Lines diverge`, `*Invalid*`.
- **Fix:** CORNERS-D22. **Regression test:** p201, p328 beside `editing.test.ts:4336`.

#### CRG-04 — An arc–arc vertex is rounded on the other side

- **Severity:** medium · **Row:** H · **Status:** verified for this shape; the general rule unverified
- **Where:** `curveFillets.ts` (`solveCornerFillet` through Polyline and two segments picked).
- **AutoCAD:** p219 (Polyline, R5) at 100,100: `[101.4071,1.0870 b.4950] [99.3754,100.4624 b-.0773]
  [100.4624,99.3754 b.4950]`, the fillet's circle inside both arcs' circles (centre 96.43,96.43),
  each arc running on past the vertex; p322 picking the two segments the same.
- **mellowcad:** `[100.5266,99.6007 b-.0658] [99.6007,100.5266]`, centre 103.57,103.57.
- **Fix:** CORNERS-D23. **Regression test:** p219, p322.

#### CRG-05 — Polyline reports `1 was divergent` where AutoCAD writes no reasons line

- **Severity:** medium · **Row:** L · **Status:** verified
- **AutoCAD:** p222: `2 lines were filleted` alone; the geometry is the same.
- **Fix:** CORNERS-D24. **Regression test:** p222.

#### CRG-06 — TEXT, MTEXT, HATCH, block references and dimensions are passed over in silence

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `cornerObjects.ts` (`pickFilletObject`, `isCornerEntity`).
- **AutoCAD:** FILLET's first prompt: TEXT, MTEXT, HATCH `Fillet requires 2 lines, arcs, or
  circles.` (es `Empalme requiere 2 líneas, arcos o círculos.`), INSERT `… (not block
  references).` (es `… (no referencias a bloque).`), DIMENSION `… (not dimensions).` (es `… (no
  cotas).`), the prompt again (p231–p235); the second prompt: TEXT, INSERT, DIMENSION the same
  words and the prompt again (p238, p310, p311), HATCH and MTEXT `Cannot fillet between these two
  entities.` and the end (p239, p312), whose Spanish is `Imposible empalmar estos dos objetos.`
  (`estos`, another string than p323's `esos`); CHAMFER's first prompt: TEXT, HATCH `Chamfer
  requires 2 lines.` (es `Chaflán requiere 2 líneas.`), INSERT `Chamfer requires 2 lines (not block
  references).` (p316–p318).
- **mellowcad:** nothing said, the prompt again.
- **Fix:** CORNERS-D25. **Regression test:** a table in `cornerRefusals.test.ts`, en and es.

#### CRG-07 — ELLIPSE and SPLINE are objects of FILLET and CHAMFER in 2027

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** both taken at the first prompt (p228, p230); FILLET of a line and a spline: at R0
  the spline extended and the line trimmed (p237), at R5 an arc and both trimmed (p326); a line and
  an ellipse: at R0 the line trimmed to it and the ellipse kept (p324), apart nothing and no word
  (p236), at R5 `Unable to fillet curves.` (es `No se pueden empalmar curvas.`, p325); CHAMFER takes
  either first, then with a line `Cannot chamfer between these two entities.` (es `Imposible hacer
  un chaflán entre estas dos entidades.`) and ends (p314, p315, p319, p327).
- **mellowcad:** neither taken, nothing said; Missing does not list it.
- **Fix:** CORNERS-D26.

#### CRJ-01 — The ghost is not the result in the selection's glow over the pieces dimmed

- **Severity:** medium · **Row:** Q · **Status:** verified
- **Where:** `FilletTool.buildOverlay`, `ChamferTool.buildOverlay`: no `hiddenEntityIds` nor
  `fadedEntityIds`; the strokes are the selected glow, the rollover grey and the rubber band.
- **AutoCAD:** d01-2, d01-3, d02-1, d03-1, d03-2, d06-2: what the click makes — the lines trimmed,
  the arc or bevel, a joined polyline — drawn whole in the selection's glow, and each piece it
  removes drawn dimmed in place.
- **mellowcad:** scratch r `look.test.ts` d01-2: the first line whole in the glow (its removed piece
  too), the trimmed lines in the rollover's grey over the originals painted as they are, the arc
  thin in the rubber band's colour; d06-2 the join in the rollover's grey.
- **Scenario:** a user reads the ghost to see which corner and what goes → here the part that goes
  still shows full, highlighted on the first line → the eye has to sort three strokes.
- **Fix:** CORNERS-D60. **Regression test:** `look`-style tests in `cornerModes.test.ts` or a new
  `cornerLook.test.ts`, citing d01–d03, d06.

#### CRJ-03 — A locked object gets the rollover

- **Severity:** medium · **Row:** Q · **Status:** verified
- **AutoCAD:** d04-4: the locked line faded, no rollover, a padlock beside the pickbox.
- **mellowcad:** scratch r d04-4: the rollover, then a click says nothing (CRP-02).
- **Fix:** CORNERS-D61. **Regression test:** no rollover over a locked object at F1, F2, FP.

#### CRJ-04 — Polyline's prompt shows the polyline, not its corners as they would be

- **Severity:** medium · **Row:** Q · **Status:** verified
- **AutoCAD:** d05-1: every corner rounded at the current radius, in the glow, the old corners
  dimmed; d05-2 a line there: no rollover.
- **mellowcad:** scratch r d05-1: the polyline in the glow.
- **Fix:** CORNERS-D62.

#### CRJ-05 — A second object that makes no corner shows no refusal at the cursor

- **Severity:** medium · **Row:** Q · **Status:** verified
- **AutoCAD:** d06-1: a line, then a polyline segment parallel to it → the circle-and-slash beside
  the pickbox and `Imposible empalmar esos dos objetos.` in the cursor's tooltip, the first object
  alone in the glow.
- **mellowcad:** scratch r d06-1: both objects highlighted, no badge.
- **Fix:** CORNERS-D63 (TRIM's `CursorBadge` "refused").

### Low

#### CRS-04 — Spanish `R` at FILLET's first prompt opens the radius; AutoCAD's is Recortar

- **Severity:** low · **Row:** B, K · **Status:** verified (p168 es; the desktop's first d01 run
  opened `Indique la opción de modo Recortar` from `R` too)
- **Fix:** CORNERS-D4.

#### CRS-05 — CHAMFER's Polyline prompt lists `[Distance/Angle/Method]` in 2027

- **Severity:** low · **Status:** verified (p112, p118, p122, p125: es `Seleccione una polilínea 2D
  o [Distancia/ángUlo/Método]:`, `M` there `Enter trim method [Distance/Angle] <Distance>:`)
- **Fix:** coverage only (Missing names both prompts).

#### CRS-06 — The coverage entries: settled marks, a stale †, 2023 wording

- **Severity:** low · **Status:** verified
- **Fix:** CORNERS-D7: the † of MP and CH goes (p103); every Spanish **unverified** settled (p148,
  p166, p167, p113–p118, p174, p176, p182, p184, p196–p198, p214, p323); "English wording from AutoCAD
  2023" becomes 2027's; the second prompt declares only the modes and Radius (p100); the Undo model
  (a refusal, a miss, Multiple no step; Enter at the radius one: p152, p169); a missed typed pick
  sets LASTPOINT (p249, p250, p252, p255, p307).

#### CRS-07 — Tests and comments cite AutoCAD 2023 where 2027 settles the cell

- **Severity:** low · **Status:** verified
- **Fix:** `cornerRefusals.test.ts` (acc/i*, j6, k*, l*, u*, x*, y*, z* → p121, p122, p124,
  p125, p129, p130, p134, p135), the `onEnter` JSDoc of both tools, the WHY of Multiple still
  listed (no deviation: p126, p127); `cornerRefusals.test.ts:449`'s comment (`M` at CHAMFER's
  second prompt is Method in 2027, p122); `cornerModes.test.ts` (acc → p240–p308), `parallelFillet.test.ts`
  (acc/c*–h* → p175, p176), `editing.test.ts`' acc citations (→ p199–p227), `polylineWidths.test.ts`
  (acc/w19–w23 → p206–p208), `lastPoint.test.ts` (acc/dd* → p247, p249).

#### CRS-08 — TRIM's Undo after a transparent command says all undone after `Regenerating model.`

- **Severity:** low · **Row:** L · **Status:** verified (found executing CRS-03: TRIM's area,
  `docs/plans/trim-review.md`)
- **AutoCAD:** trim/p164: `Command has been completely undone.` then `Regenerating model.`.
- **mellowcad:** `editing.test.ts`' TRIM case asserted the last line only; the message came last.
- **Fix:** the message before `ctx.undoTo`, as CRS-03's. **Regression test:** that case, both lines.

#### CRG-08 — The fillet between a normal −Z ARC and a line comes out at −Z

- **Severity:** low · **Status:** verified (p335: the new arc at +Z, centre −35,28.28)
- **Fix:** CORNERS-D27.

#### CRG-09 — The geometry's unverified marks and citations

- **Severity:** low · **Status:** verified
- **Fix:** with CRS-06; `cornerRefusals.test.ts:112` is titled "still makes the corner" and asserts
  `Lines diverge`: retitle it; `:342` asserts only the last line: assert nothing was made.

#### CRJ-02 — The rollover over a polyline highlights it whole, not the segment

- **Severity:** low · **Row:** Q · **Status:** verified (d04-2 against scratch r d04-2)
- **Fix:** CORNERS-D64.

## 6. Decisions taken

- **CORNERS-D1** — A negative radius or distance says `valueMustBePositive` and asks the same
  prompt (PLINE's widths, RECTANG's fillet do so).
- **CORNERS-D2** — CHAMFER's second default is the first distance when it was typed, CHAMFERB when
  Enter kept the first (p110, p111, p137).
- **CORNERS-D3** — Every step of FILLET's and CHAMFER's Undo marks `ctx.historyDepth()` and goes
  back with `ctx.undoTo`, the rule TRIM follows.
- **CORNERS-D4** — Trim is offered hidden at FILLET's first prompt and left `unhandled`, as UCS's
  `F`: Spanish `R` then is no radius (p168).
- **CORNERS-D5** — The preselection stays dropped (p162–p164), held by a test.
- **CORNERS-D6** — The Undo model stays; its scratch tests move into `editing.test.ts`.
- **CORNERS-D7** — The coverage edits of CRS-06 and CRS-05.
- **CORNERS-D8** — `_.`, 'ORTHOMODE and 'ZOOM's prompt stay with their owners' entries.
- **CORNERS-D20** — The arc, the cap and the bevel carry the second picked object's lineweight and
  thickness (its linetype scale once modelled), keep the layer rule, take no colour or linetype.
- **CORNERS-D21** — Polyline cuts its corners in turn from the second vertex, the closing one last,
  each against the polyline as already cut (p220, p226).
- **CORNERS-D22** — For an open polyline's ends one apart, the crossing decides: past the first
  segment's end is "one apart", before its start closes it (p200 against p201, p328).
- **CORNERS-D23** — At an arc–arc vertex the fillet's circle goes on both arcs' centre side, after a
  probe of a vertex turning with the arcs in the execution's ids (p340 on).
- **CORNERS-D24** — No "divergent" count for an arc between diverging lines (FILLETPOLYARC 1); the
  catalog key stays.
- **CORNERS-D25** — Each type is refused in the console's words at each prompt as probed; the
  Spanish `estos` gets a message id of its own with the same English; ATTDEF is TEXT until probed.
- **CORNERS-D26** — CHAMFER takes an ELLIPSE or SPLINE and refuses the pair in the console's words;
  FILLET takes an ELLIPSE (rollover d04-3) and says `Unable to fillet curves.` at a radius, nothing
  where they do not meet; FILLET's spline, and the ellipse's R0 trim, go to Missing (a partial
  command, not a reinvented one) and stay untaken there.
- **CORNERS-D27** — A fillet built in a ±Z plane is written at +Z (p335).
- **CORNERS-D28** — `elevation.test.ts:599` and `:629` are corrected to p334.
- **CORNERS-D29** — A layer changed between the picks is tested through the current layer's
  setter; CLAYER typed is not this review's.
- **CORNERS-D40** — CRP-01 through `Tool.takesSnapOverride` and `snapsFromLastPoint`, as TRIM.
- **CORNERS-D41** — No override while Radius or Distance is asked or a mode is open: those are
  point prompts already.
- **CORNERS-D42** — The locked message only when nothing selectable is under the pick (TRIM's
  `lockedAt`); a locked and an unlocked object under one pick was not probed.
- **CORNERS-D43** — CRP-03 is fixed in `ObjectSelector`'s single object's pick, for every tool
  using it (BREAK, UCS OBject, ARRAYPATH get it too; their reviews probe their words).
- **CORNERS-D44** — A mode finding locked and unlocked objects takes the newest unlocked silently;
  the message only when nothing unlocked is left (p274).
- **CORNERS-D45** — The message is OFFSET's `objectOnLockedLayer`: the same words.
- **CORNERS-D46** — A found circle stands at 180°, which p303–p305 match; the coverage note narrows
  to "0° or 180°".
- **CORNERS-D47** — A missed typed pick setting LASTPOINT goes into the entry and a test.
- **CORNERS-D60** — The ghost: the result in the selected glow, the originals hidden
  (`hiddenEntityIds`) and their removed pieces drawn dimmed, as TRIM's TRJ-01 dims a piece; Shift's
  corner and CHAMFER's bevel the same, one resolver with the commit.
- **CORNERS-D61** — No rollover over a locked object at the object prompts; the padlock and the fade
  of locked layers (LAYLOCKFADECTL) go to the Properties review (roadmap).
- **CORNERS-D62** — Polyline's prompt previews `cutPolylineCorners`' result in the glow, the
  polyline hidden and its old corners dimmed.
- **CORNERS-D63** — A second object the pair refuses shows the "refused" badge; the tooltip's words
  follow the runtime's tooltip (the prompt there now), noted in Missing if it cannot carry them.
- **CORNERS-D64** — The rollover draws the segment a pick on a polyline takes.

## 7. Tests proposed

The regression tests are in each finding. The untested cells, by file:

- `editing.test.ts`: the Undo model (p148–p161, p169), repeat and `'FILLET` (p105, p106),
  another command typed (p138, p139), the transparent commands at each prompt (p140–p147).
- `cornerModes.test.ts`: `x,y,z`, `@`, `d<a`, `*x,y`, `#x,y`, numbers, LASTPOINT after a hit and a
  miss (p241–p256, p307), ORTHOMODE and OSMODE (p265, p266), the newer of two (p277–p281), the
  refused modes (p290–p296).
- `cornerDirection.test.ts`, `editing.test.ts`: the untested geometry cells of CRG (p171, p174, p177,
  p179, p182, p186, p187, p189–p195, p200, p202, p225, p321, p333, p335–p339).
- `invalidAnswers.test.ts:357`: cite p113.

## 8. What is not tested and why

The screenshots' colours and widths (presentation: the look is held by which entities draw with
which stroke, not by pixels); the right button's missing entries (known); Shift held over a fence
(FILLET has none).

## 9. What could not be reviewed and why

The English profile's desktop (the owner's is Spanish; the English labels come from the console);
a vertex turning with the arcs (CRG-04's general rule, probed in the execution); ATTDEF; ARC or
CIRCLE with a polyline segment and the tilted planes of `normals.test.ts` (2023 evidence, kept);
the per-object linetype scale (not modelled); 0° against 180° for a found circle; a locked and an
unlocked object under one pick; CHAMFER's two found at the first prompt, a mode finding nothing,
parallel lines found by a mode (2023 evidence, kept).

## 10. Refuted in the adversarial pass

- TRS-01's analogue (the first Enter taken once): FILLET and CHAMFER end at it (p131, p132).
- TRS-02's: the preselection is dropped in AutoCAD too (p162–p164).
- TRS-03's: Undo with nothing says completely undone and stays (p148, p149), as here.
- TRS-04's, TRP-05's: Undo is listed from the first prompt in both (p100, p101).
- TRG-01's for CHAMFER: AutoCAD 2027 cuts an arc segment as its chord (p215, p216, p225).
- p188's line–arc tie: in Missing; p321 with an unequal pick matches.
- Arc angles stored past 2π, p207's width on the last vertex: no difference a user meets.
- p299, p301: the probes' figures, not differences.
- Trim, Angle and mEthod in the prompts and the Expects lines: Missing.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | Test | State |
| --- | --- | --- | --- |
| FILLET's arc takes the first line's elevation and thickness | p334 | `elevation.test.ts:599` | false (CRG-01) |
| the bevel takes the first line's elevation and thickness | p334 | `elevation.test.ts:629` | false (CRG-01) |
| CHAMFER's second default is the first just given | p137 | scratch a | false after Enter (CRS-02) |
| the second prompt's words "which the table declares beside it" | p100 | — | no longer true in 2027 (CRS-06) |
| the Spanish messages **unverified** | p148, p166, p167, p174, p176, p182, p184, p196–p198, p214, p323 | scratch a, b | hold: the marks go |
| the polylines' corners too short are left alone | p220 | `editing.test.ts:4505` | false (CRG-02) |
| an open polyline's first and last close it | p201 | — | false for three segments (CRG-03) |

| Rule | Claim | State |
| --- | --- | --- |
| `cad-tools.md`, "What a new object wears" | FILLET's arc and CHAMFER's bevel: `carryPlane` alone | stale (CRG-01) |
| `cad-tools.md`, "Ordering and undo" | a transparent command run since a step goes back with it | broken (CRS-03) |
| `cad-tools.md`, `ObjectSelector` | a single object's pick holds one, with `modes` and `one` | holds; the locked filter is added (CRP-03) |

Checked and holding: the rest of both entries' Implemented (the matrices' match and untested
cells), the FILLET and CHAMFER paragraph of `cad-tools.md` (arc segments against ARC and CIRCLE,
`foundFilletObject`, `cornerPairRefusal`, OCS cuts), `cad-engine.md`'s `coplanar` and the widths.

## 12. Order of execution and estimate

1. **CRS** (the command line): CRS-01–CRS-07 — small, the catalog untouched but citations. ~1 h.
2. **CRP** (the picks): CRP-01–CRP-03 — the selector's locked filter and the snap hook. ~1.5 h.
3. **CRG** (what it produces): CRG-01–CRG-09 — the properties, two polyline rules, the refusals per
   type (new messages in en, es, ar), ellipses and splines in part; probes from p340. ~3 h.
4. **CRJ** (the look): CRJ-01–CRJ-05 — after CRG (the ellipse's rollover) and CRP (the locked
   pick). ~2 h.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/modify.md`, FILLET and CHAMFER: what each block fixes, the marks settled, Missing
  gaining FILLET's spline and the ellipse's R0 trim, the per-object linetype scale, CHAMFER's
  Polyline prompt's Angle and Method.
- `cad-tools.md`: "What a new object wears" (the second object's lineweight and thickness), the
  single object's pick (no locked find).
- Catalogs: the refusals per type (`Fillet requires 2 lines, arcs, or circles.` and its two
  variants, `Chamfer requires 2 lines.` and its variant, `Unable to fillet curves.`, `Cannot chamfer
  between these two entities.`, the Spanish `estos`); `valueMustBePositive` and
  `objectOnLockedLayer` exist.
- Roadmap: Corners done, owning the corners of lines, arcs and polylines; the Properties review
  takes the locked layers' fade and padlock (CORNERS-D61); the Pieces review checks BREAK's single
  object's pick after CRP-03 and its words for a locked find.

## 14. Template improvements

- **A Spanish desktop types keywords in their global form** (`_R`, `_D`): Spanish `R` at FILLET's
  first prompt is Recortar, and a desktop step typing `R` opened the Trim mode's prompt
  (annex-probes.md §4).
- **A prompt that takes spaces swallows the rest of a `com send`** (-LAYER's name list took
  `BLQ _LO BLQ`): every answer on a line of its own (annex-probes.md §4, beside the `DASHED
  acadiso.lin` trap).
- **Hover every refusal on the desktop**: AutoCAD shows a pair's refusal at the cursor before the
  click (d06-1) — row Q asks for it (matrix.md).
- **Probe ranges by block weight**: the geometry block of two commands spent 100 ids and the picks'
  70, both short of their last questions; give a geometry block 100 and say so (template §4.8).
- **Subagents' reports**: all three could not write `report.md` in the scratchpad; the prompt asks
  for the text only (template §4.8 says so; the reviewer's prompt should not ask for the file).
