# RECTANG, POLYGON review

> **Status:** plan, 2026-10-21 — phases 0–4 of skill `command-review`, the fifth review of
> `docs/coverage/roadmap.md`'s order; the execution follows in the same session, block by block
> (REC, PGN, KEP), one commit each.

## 1. Summary

2 high, 21 medium and 11 low findings over three blocks.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| REC | RECTANG | 0 | 11 | 4 |
| PGN | POLYGON | 1 | 4 | 5 |
| KEP | options kept for the session (every command; this review owns the area) | 1 | 6 | 2 |

The worst: Enter at POLYGON's centre or Edge's first endpoint ends the command where AutoCAD asks
again in the prompt's words (PGN-01, the analogue of ARC-01); TEXT, MTEXT and ATTDEF each keep a
height of their own where AutoCAD shares TEXTSIZE (KEP-01); and the values AutoCAD saves in the
drawing (FILLETRAD, CHAMFERA/B, TEXTSIZE, ORTHOMODE, SNAPMODE, GRIDMODE…) or keeps per drawing
(CIRCLERAD, POLYSIDES, OFFSETDIST, HPNAME…) live on tools here for the whole session, survive NEW
and OPEN and never reach the file (KEP-02, KEP-04, KEP-05).

ARC's analogues, probed first: Enter refused (POLYGON differs, RECTANG matches); the Ortho base
(matches: the desktop bends RECTANG's corner and Edge's end though the trace says UseBasePoint
false); TAN/PER with no base from LASTPOINT (both differ); the jig in the current colour with amber
dashed lines (both differ); the LASTPOINT of a point typed relative in the box (both match today).

## 2. Inventory

Commit `61411f0`; AutoCAD 26.0 (`_VERNUM` X.118.0.0), tables of 2026-10-20 (`all_es.tsv`).

- **RECTANG:** `cad/application/tools/RectangleTool.ts` (`ucsHeading.ts`, `currentProperties.ts`,
  `coordinateInput.ts`); `TOOL_COMMANDS` (`CommandLine.ts`), `defaultTools`
  (`runtimeTools.ts`); its catalog keys in `cad/locales/en.json`, `es.json`, `ar.json`; the object
  is a polyline (PLINE's review owns it); the rail's Rectangle flyout (`tool-rail.tsx`, macro
  `^C^C_rectang` in `acad.cuix`, echoed `_rectang`); `content/commands.ts`. Tests:
  `rectangle.test.ts`, `cornerDirection.test.ts` (FILLET/CHAMFER, cited 2023), `elev.test.ts`,
  `polylineWidths.test.ts`, `locale.test.ts`, `lastPoint.test.ts`, `measuredAnswers.test.ts`,
  `ucs.test.ts`, `currentProperties.test.ts`, `englishSurface.test.ts`, `content/figures.test.ts`.
- **POLYGON:** `cad/application/tools/PolygonTool.ts`, the same registration points, macro
  `^C^C_polygon`. Tests: `drawing.test.ts` (POLYGON's describe), `invalidAnswers.test.ts`,
  `currentProperties.test.ts`, `elev.test.ts`, `englishSurface.test.ts`.
- **Related:** CECOLOR, CELTYPE, CELWEIGHT, CLAYER, ELEVATION, THICKNESS, PLINEWID (RECTANG and
  POLYGON ignore it), LASTPOINT, ORTHOMODE, SNAPANG (Missing), POLYSIDES; U, UNDO, REDO, MREDO;
  the file.
- **KEP's inventory:** every option a tool or the runtime keeps between runs — RECTANG's modes and
  sizes, POLYGON's sides and I/C, CIRCLERAD (`runtimeTools.ts`), FILLET's radius, CHAMFER's
  distances, OFFSET's distance, Erase and Layer, HATCH's pattern, scale and angle, TEXT's height,
  style, justification and rotation, MTEXT's and ATTDEF's, INSERT's block, ROTATE's angle, SCALE's
  factor, MOVE's displacement, SPLINE's method and knots, TRIMEXTENDMODE, UNDO Control, the drafting
  toggles (`CadRuntime.ts`) and the settings already on the document.
- **Areas cited, not reviewed again:** the command line, point input, object snaps, Ortho, Polar,
  dynamic input, undo, current properties, grips, the palette, files and render (LINE's review);
  the polyline object (PLINE's).

## 3. Probes

Console inputs: `scripts/research/probes/rectang/` and `scripts/research/probes/polygon/`, run with
`scripts/research/probe.sh <command> <ids>` in es-ES and en-US; the desktop's are
`scripts/research/probes/rectang/dsk.sh`. Transcripts and screenshots: `research/probes/rectang/`,
`research/probes/polygon/` (gitignored).

| Id | What it asks |
| --- | --- |
| rectang p00 | ACADVER, `_VERNUM` |
| rectang p01–p12 | the two corners and their flags; every first-prompt option with its flags; Area, Dimensions, Rotation, Pick points; Enter; `_TAN` and `_PER` at the first corner from LASTPOINT; LASTPOINT after `@` and Dimensions; `<45` at the corner and at Rotation; `_TAN`, `_APPINT`, `_NOD`, `_GCEN`, `_EXT`, `_PAR` finding nothing; a rectangle of no area, plain, chamfered and filleted |
| rectang p100–p192 | names and aliases; every prompt's `0`, negatives, `FOO`, another prompt's keyword; point entry; transparent commands; U, UNDO, REDO, MREDO; properties, ELEVATION, THICKNESS, UCS Z 30, X 90, a raised UCS; the options' geometry; DXF out and in; the modes line in both languages; FILLET's and CHAMFER's cornerDirection cases on 2027 (p180–p192) |
| rectang p300–p321 | KEP: storage of each kept option by the OPEN test (a blank drawing saved, the value set, saved again, both reopened); U over a command's values |
| polygon p00–p12 | the prompts' flags; Enter and `FOO` at each; Edge; `_TAN` at the centre and Edge's first endpoint; a typed point and `@` at the radius; `<45` at the radius and the edge; LASTPOINT after each mode |
| polygon p100–p153 | the start vertex for n = 3–9, Inscribed and Circumscribed; UCS Z 30, X 90, SNAPANG; names; POLYSIDES; point entry; transparent commands; undo; properties; DXF; refusals |
| d01 | RECTANG's other corner: the ghost in CECOLOR, no line; Ortho flattens it and the pick makes a rectangle of no area |
| d02 | POLYGON's radius: the ghost and an amber dashed line from the centre; Edge's end: the ghost alone, bent by Ortho |
| d03 | `<45` then `10` at RECTANG's other corner: along 45° from the first corner |
| d04 | Pick points' second point: no rubber line |
| d05 | dynamic input at the other corner: the sides' length and width; `10,5` relative; `10` Tab `4` makes 10 × 4 |
| d06 | POLYGON's dynamic input: the radius a lone distance; Edge's end a distance and an angle, relative |
| d07 | the right button at RECTANG's first corner; the Down list at POLYGON's centre |

## 4. Matrix

States as in the skill's `matrix.md`. Scratch tests: `research/review/rectang/R/` (the reviewer),
`A/` (RECTANG), `C/` (KEP), `research/review/polygon/B/` (POLYGON).

### REC — RECTANG

| Row | First corner | Option values | Other corner | Area / Dimensions | Rotation / Pick points |
| --- | --- | --- | --- | --- | --- |
| A | `RECTANG`, `REC` match · p101; `RECTANGLE` differs REC-06; `_.RECTANG`, `_REC` known; repeat match · p100; `'_RECTANG` match · p102; rail `_rectang` match | | | | |
| B | match · p02, p04, p104–p106 · `rectangle.test.ts` | negatives at Chamfer, Fillet differ REC-07; the rest match · p107–p111 | match · p02, p04 | a negative side differs REC-08; Dimensions after Rotation match, Rotation after Dimensions differs REC-09 · p159, p177; es refusal differs REC-13 | match · p116, p117, p120; Enter at Pick points known / differs REC-12; the prompt written again differs REC-14 |
| C | match · p122, p124, p126, p129 | n/a | `@`, `d<a`, `@d<a`, `*` match · p123, p125, p126, p165; a point of no area differs REC-01; `<a` then a number differs REC-02 (desktop d03; the console ignores it, p08, p128) | a point at a value match · p106, p179 | match · p130 |
| D | `_TAN`, `_PER` differ REC-03 · p05, p06; a snap finding nothing match · p10 | n/a | Ortho match · d01 (bends; UseBasePoint false notwithstanding) | n/a | Rotation's base the first corner match · p01 |
| E | match · p132–p136, p175 (`'ORTHOMODE` known) | | | | |
| F | match · p166, p167, p173 · `e.test.ts` | | | | |
| G | another command typed match · p138–p140; Escape and the menu owned (LINE) · d07 | | | | |
| H | layer, colour, linetype, lineweight match · p141; properties changed at the other corner differ REC-10 · p169, p146; ELEVATION and THICKNESS match · p141, p142; Elevation in a raised UCS differs REC-11 · p145, p178; UCS Z 30, X 90 match · p143, p144; geometry match · p02, p149–p160, p172 | | | | |
| I | owned (PLINE) | | | | |
| J | DXF n/a (none here); the file match · `A/c.test.ts` | | | | |
| K | match · p02, p03, p161, p162, p174 (es); `firstCorner`, `otherCorner`, `firstPoint` unverified (dynamic-input labels) | | | | |
| L | match but REC-14 · p116, p135 | | | | |
| M, Q | the ghost differs REC-04 · d01, d04 | | | | |
| D (DYN) | | | the box differs REC-05 · d05 | | |
| N | REC-15 | | | | |

### PGN — POLYGON

| Row | Sides | Centre or [Edge] | Inscribed / Circumscribed | Radius | Edge's endpoints |
| --- | --- | --- | --- | --- | --- |
| A | `POLYGON`, `POL`, `POLIGONO`, `PG` match · p107–p110 (the † goes, PGN-10); repeat with the defaults match · p111; `'_POLYGON` match · p114 | | | | |
| B | `FOO`, 2, 3.5, 1025, 0, −3 match · p08, p118 · `drawing.test.ts`; `3.0`, `1e1` differ PGN-08 · p153 | Enter differs PGN-01 · p02; `FOO` match · p08 | match · p08, p117 · `invalidAnswers.test.ts` | Enter differs PGN-01; −5, 0, `@` differ PGN-06 · p08, p124 | Enter differs PGN-01 · p03; `FOO` match · p119 |
| C | n/a | match · p121, p123, p124, p126–p128, p131, p151 | n/a | a typed point match · p06, p102, p123 (untested, PGN-09) | a bare number, Z refused, `*` match · p120, p132–p134; a zero edge differs PGN-07 · p125; `<a` then a number differs PGN-04 (unverified on the desktop) |
| D | n/a | `_TAN` differs PGN-02 · p04 | n/a | Ortho from the centre match · d02 | `_TAN` at the first differs PGN-02 · p05; Ortho match · d02 |
| E | match · p138–p142 | | | | |
| F | match · p144, p152 | | | | |
| G | another command typed match · p145, p146 | | | | |
| H | properties, ELEVATION, THICKNESS, PLINEWID ignored match · p136, p137; UCS Z 30, X 90 match · p104, p135; the start vertex of a typed radius differs PGN-05 · p100, p101; a picked radius and Edge match · p102, p103 | | | | |
| J | DXF n/a; the file owned (LINE) | | | | |
| K | match · p01, p08 (es); dynamic-input labels unverified | | | | |
| L | match · p01, p03 | | | | |
| M, Q | | | | the ghost and its line differ PGN-03 · d02 | the ghost's colour differs PGN-03 · d02 |
| D (DYN) | match · d06 | match · d07 | | match · d06 | match · d06 |
| N | PGN-10 | | | | |

### KEP — options kept for the session

| Option | AutoCAD | mellowcad | State |
| --- | --- | --- | --- |
| RECTANG's modes and sizes | program-wide · p306, p308 | session | match |
| POLYSIDES, POLYGON's I/C | per drawing, not saved · p301, p309 | session | differs KEP-05 |
| CIRCLERAD, OFFSETDIST, HPNAME/HPSCALE/HPANG/HPDOUBLE/HPSPACE, INSNAME, ROTATE/SCALE/MOVE defaults, TEXT's rotation, UNDO Control | per drawing, not saved · p301, p303, p305, p310, p311, p314, p315, p321 | session | differs KEP-05 |
| FILLETRAD, CHAMFERA/B, TEXTSIZE, TEXT's justification | saved in the drawing · p302, p311, p316 | session | differs KEP-02 |
| TEXTSIZE shared by TEXT, MTEXT, ATTDEF | yes · p312, p313 | three fields | differs KEP-01 |
| TEXT's Style sets TEXTSTYLE | yes · p313 | no | differs KEP-03 |
| ORTHOMODE, SNAPMODE, SNAPUNIT, GRIDMODE, GRIDUNIT | saved in the drawing · p304, p321 | session | differs KEP-04 |
| -MTEXT's Justify, Rotation, Line spacing | reset every run · p312 | kept | differs KEP-06 |
| U over a value a command set | taken back · p317 | not | differs KEP-07 |
| PLINEWID, ELEVATION, THICKNESS, LTSCALE, FILLMODE, LWDISPLAY, UCSICON, ATTMODE, AUPREC, LUPREC, DIMSCALE | saved in the drawing · p301, p303, p304 | on the document | match |
| SPLMETHOD/SPLKNOTS/SPLDEGREE, AFLAGS, OFFSET's Erase and Layer, TRIMEXTENDMODE, OSMODE, POLARMODE, POLARANG, AUTOSNAP, SELECTIONCYCLING | program-wide or registry · p301–p304, p310, p321 | session | match; coverage notes missing KEP-09 |
| LASTPOINT | per drawing · p321 | reset by NEW and OPEN · `lastPoint.test.ts` | match |

## 5. Findings

### High

#### PGN-01 — Enter at POLYGON's centre or Edge's first endpoint ends the command

- **Severity:** high · **Row:** B, G · **Status:** verified
- **Where:** `cad/application/tools/PolygonTool.ts:283-318` (no empty-text branch), `:343`
- **AutoCAD:** polygon/p02, p03 (es-ES and en-US): `Point or option keyword required.` at the
  centre (es `Se requiere un punto o una opción.`), `Invalid point.` at Edge's first endpoint,
  `Invalid 2D point.` at its second, `Requires numeric distance or second point.` at the radius
  (es `Requiere una distancia numérica o un segundo punto.`), each asked again.
- **mellowcad:** `R/analogues.test.ts`: Enter at the centre ends POLYGON and the next answer reads
  `Unknown command "0,0"`; the same at Edge's first endpoint; at the radius it asks again silently.
- **Scenario:** a pick missed, Enter pressed to "go on" → the command is gone and the coordinates
  typed next run as a command.
- **Fix:** an empty answer at each point prompt reports the prompt's refusal and returns `true`
  (RECTANG's `commitTypedPoint`); the radius reports `requiresNumericDistanceOrSecondPoint` (its
  `takes()` refusal). **Regression test:** `drawing.test.ts`, the four refusals in en and es,
  citing p02 and p03.

#### KEP-01 — TEXT, MTEXT and ATTDEF each keep a height; AutoCAD shares TEXTSIZE

- **Severity:** high · **Row:** H (defaults) · **Status:** verified (the reviewer read p313)
- **Where:** `TextTool.ts:69`, `MTextTool.ts:71`, `AttDefTool.ts:98`
- **AutoCAD:** rectang/p313: after `-TEXT … 3`, `-MTEXT` lists `Text height:  3` and `-ATTDEF`
  `Text height:  3.0000`; p312: MTEXT's Height 4 makes TEXTSIZE 4.
- **mellowcad:** `C/c2.test.ts`: after TEXT at 3, -MTEXT and -ATTDEF list `2.50`.
- **Fix:** one TEXTSIZE in `DocumentSettings` (KEP-02), read and set by the three.
  **Regression test:** `text.test.ts`, TEXT at 3 then -MTEXT and -ATTDEF at 3, citing p313.

### Medium

#### REC-01 — A rectangle of no area is not made; RECTANG asks again

- **Row:** C, H · **Where:** `RectangleTool.ts:307-308`, `:548`
- **AutoCAD:** rectang/p11, p164 (`5,5` `15,5` → four vertices on one line; `5,5` twice → four
  at 5,5), p123 (`@` alone), p115 (Dimensions × 0), p117; desktop d01 (Ortho flattens the ghost and
  the pick makes it); p12: with Chamfer or Fillet, eight vertices, doubled and plain.
- **mellowcad:** `R/desk.test.ts`, `A/h.test.ts`: nothing made, the prompt asked again.
- **Fix:** make it; cuts never fit, so the existing doubled-corner rule applies.
  `rectangle.test.ts`'s "ignores a degenerate rectangle" asserts the opposite and goes.

#### REC-02 — `<a` then a distance at the other corner runs towards the cursor, not along the angle

- **Row:** C, D · **Where:** `RectangleTool.ts:635-657` (a bare number reaches the runtime's direct
  distance without the override)
- **AutoCAD:** desktop d03: `<45`, then `10` → the 7.0711 square along 45° from the first corner
  (the console, with no cursor, ignores the override: p08, p128).
- **mellowcad:** `R/desk.test.ts`: `Angle Override: 45` echoed, then the corner 10 towards the
  cursor (49.91, 21.32); LINE honours it (`R/line.test.ts`).
- **Fix:** the box's direct distance reads the angle override as LINE's does
  (`DynamicInputSession.directDistance` or `pointAlongCursor`). PGN-04 is the same path.

#### REC-03 — `_TAN` or `_PER` at the first corner is refused; AutoCAD measures it from LASTPOINT

- **Row:** D · **Where:** `RectangleTool.ts` (no `snapsFromLastPoint()`)
- **AutoCAD:** rectang/p05 (LASTPOINT 30,0, `_TAN` on a circle r10 → corner 3.3333,9.4281), p06
  (`_PER` → 10,0).
- **mellowcad:** `R/analogues.test.ts`: `No found for specified point.` then the refusal.
- **Fix:** `snapsFromLastPoint()` at the first corner (ArcTool's). **Regression test:**
  `rectangle.test.ts`, citing p05 and p06.

#### REC-04 — The ghost wears the theme's colour; Pick points draws a rubber line AutoCAD does not

- **Row:** M, Q · **Where:** `RectangleTool.ts:271-292`
- **AutoCAD:** desktop d01: the rectangle in CECOLOR (red), no line from the first corner; d04: no
  rubber line at Pick points' second point.
- **mellowcad:** `R/analogues.test.ts`: `path #e2e8f0` (THEME.rubberBand) at the corner, a line at
  Pick points.
- **Fix:** the ghost in `currentColor(ctx)`; nothing at Pick points. **Regression test:**
  `drawing.test.ts`' `jig()` helper, citing d01 and d04.

#### REC-05 — Dynamic input at the other corner is a coordinate box; AutoCAD's is the two sides

- **Row:** D (dynamic input) · **Where:** `RectangleTool.ts:620-632`
- **AutoCAD:** desktop d05: with DYNMODE 3 the box shows the length and width along the turned
  sides; `10` Tab `4` makes a 10 × 4 rectangle; `10,5` typed is relative to the first corner.
- **mellowcad:** `R/desk.test.ts`: `10` Tab `4` → the 4 taken as a direct distance (3.53 × 1.88).
- **Fix:** two distance fields, the length and the width, laid in the cursor's quadrant along the
  turned sides; a coordinate typed in the first still reads as one (RECTANG-D62).

#### REC-06 — `RECTANGLE` is an alias of AutoCAD's and unknown here

- **Row:** A · **Where:** `cad/locales/en.json` and `es.json`, `names.RECTANG`
- **AutoCAD:** rectang/p101 (both locales); `acad.pgp` en-us and es-es list `RECTANGLE, *RECTANG`.
- **mellowcad:** `A/h.test.ts`: `Unknown command "RECTANGLE".`
- **Fix:** add it in en and es; the coverage heading gains it.

#### REC-07 — Chamfer and Fillet take a negative value; AutoCAD refuses it

- **Row:** B · **Where:** `RectangleTool.ts:351-363`, `:454`
- **AutoCAD:** rectang/p01 (AllowNegative false), p107, p108: `-5` → `Value must be positive.`
  (es `El valor debe ser positivo.`), asked again.
- **mellowcad:** `A/h.test.ts`: taken; the second chamfer offers `<-5.00>`, a fillet draws inside
  out.
- **Fix:** refuse with `valueMustBePositive` at both chamfer distances and the fillet.

#### REC-08 — A negative side at Area keeps the other side's sign wrong

- **Row:** B, H · **Where:** `RectangleTool.ts:432`
- **AutoCAD:** rectang/p159: Area 50, Length −10 → `[[5,5],[-5,5],[-5,0],[5,0]]`; Width −5 →
  `[[50,5],[40,5],[40,0],[50,0]]`.
- **mellowcad:** `A/h.test.ts`: `[[5,5],[-5,5],[-5,10],[5,10]]` and `[[50,5],[60,5],[60,0],[50,0]]`.
- **Fix:** the other side from the signed one; `cornersFit` on the absolute values.

#### REC-09 — Rotation after Dimensions keeps the Dimensions; AutoCAD drops them

- **Row:** H · **Where:** `RectangleTool.ts:225`, `:524`
- **AutoCAD:** rectang/p177: `5,5 _D 4 3 _R 30 9,9` → the two-corner rectangle
  `[[5,5],[9.7321,7.7321],[9,9],[4.2679,6.2679]]`; Rotation then Dimensions keeps 4 × 3.
- **mellowcad:** `A/h.test.ts`: a 4 × 3 turned 30°.
- **Fix:** `sized = false` when Rotation is chosen.

#### REC-10 — The current properties are read at the end, not at the first corner

- **Row:** H · **Where:** `RectangleTool.ts:586`
- **AutoCAD:** rectang/p169, p146: `'_-COLOR 3` at the other corner → ByLayer; p171, p147: set at
  the first corner, it applies.
- **mellowcad:** `A/h.test.ts`: green.
- **Fix:** take `currentProperties` with the first corner (PLINE's pline/p39); a mid-command row
  in `currentProperties.test.ts`.

#### REC-11 — RECTANG's Elevation adds the UCS origin's Z; AutoCAD stores it as given

- **Row:** H · **Where:** `RectangleTool.ts:578-581`
- **AutoCAD:** rectang/p145 (UCS origin 0,0,5, Elevation 2 → `"Elevation":2`; in UCS X 90 with its
  origin moved 3, still 2), p178 (`ID` on its corner: `Z = -3.0000` in the UCS). The reviewer read
  both. ELEVATION, the variable, does add it (p170).
- **mellowcad:** `A/h.test.ts`: 7 (5 in the X 90 case).
- **Fix:** the option's value is the object's OCS elevation as typed. `elev.test.ts`'s "whatever
  the corners' Z" asserts the old value and changes.

#### PGN-02 — `_TAN` at the centre or at Edge's first endpoint is refused; AutoCAD measures it from LASTPOINT

- **Row:** D · **Where:** `PolygonTool.ts` (no `snapsFromLastPoint()`)
- **AutoCAD:** polygon/p04 (LASTPOINT 30,0, `_TAN` on a circle r10 → centre 3.3333,9.4281), p05
  (Edge's first endpoint, the same point).
- **mellowcad:** `R/analogues.test.ts`: `No found for specified point.`, refused.
- **Fix:** `snapsFromLastPoint()` at the centre and Edge's first endpoint.

#### PGN-03 — The jig wears the theme's colour; the radius line is solid white

- **Row:** M, Q · **Where:** `PolygonTool.ts:224-252`
- **AutoCAD:** desktop d02: the polygon in CECOLOR (red); at the radius an amber dashed line from
  the centre to the cursor; at Edge's end the ghost alone.
- **mellowcad:** `R/analogues.test.ts`: `path #e2e8f0`, `segment #e2e8f0` solid.
- **Fix:** ghost `currentColor(ctx)`, the line `THEME.dashedRubberBand` dashed (ArcTool's
  `rubberLine`).

#### PGN-05 — A typed radius starts the vertex list at another corner

- **Row:** H · **Where:** `PolygonTool.ts:449` (`levelAngle`), `:407`, `:433`
- **AutoCAD:** polygon/p100, p101, p01: the same polygon, its first vertex at 90° + 180°/n for an
  even n and at 90° for an odd one, in the UCS (p104) and turned by SNAPANG (p105), then
  counterclockwise; a picked radius starts at the pick (Inscribed) or the pick + 180°/n
  (Circumscribed), as here (p102).
- **mellowcad:** `B/b.test.ts`: −90° + 180°/n.
- **Scenario:** the start moves the polyline's start point, a linetype's phase, LIST and EXPLODE
  order, DIVIDE's start.
- **Fix:** start at `ucsRotation + π/2 + (n even ? π/n : 0)`. **Regression test:** the full lists
  for n = 3–8, I and C, replacing `drawing.test.ts`' `some()` checks.

#### PGN-06 — A zero or negative radius is refused silently

- **Row:** B · **Where:** `PolygonTool.ts:352-357`, `:406`
- **AutoCAD:** polygon/p08, p124: `-5`, `0`, `@` → `Value must be positive and nonzero.` (es
  `El valor debe ser positivo y diferente de cero.`).
- **mellowcad:** `B/b.test.ts`: asked again with no line.
- **Fix:** report `positiveNonzero` (CircleTool's radius).

#### KEP-02 — Values AutoCAD saves in the drawing live on tools: FILLETRAD, CHAMFERA, CHAMFERB, TEXTSIZE, TEXT's justification

- **Row:** J · **Where:** `FilletTool.ts:140`, `ChamferTool.ts:116-117`, `TextTool.ts:69,71`
- **AutoCAD:** rectang/p302, p316 (reopened: `Radius = 3.0000`, `Dist1 = 2.0000, Dist2 = 1.0000`),
  p311 (`Text height:  3.0000 … Justify:  MC`).
- **mellowcad:** `C/c.test.ts`: none in the file; kept across NEW and OPEN.
- **Fix:** `DocumentSettings` and the file (RECTANG-D43). The coverage entries of FILLET and CHAMFER
  say "for the session".

#### KEP-03 — TEXT's Style does not make the style current

- **Row:** H · **Where:** `TextTool.ts:504`
- **AutoCAD:** rectang/p313: after `-TEXT _S S2`, TEXTSTYLE is `"S2"` and -MTEXT and -ATTDEF list
  it.
- **mellowcad:** `C/c2.test.ts`: the current style stays Standard.
- **Fix:** Style sets the document's current text style (MTEXT's and ATTDEF's too, RECTANG-D47).

#### KEP-04 — ORTHOMODE, SNAPMODE, SNAPUNIT, GRIDMODE and GRIDUNIT are session state; AutoCAD saves them in the drawing

- **Row:** J · **Where:** `CadRuntime.ts:3035-3105`
- **AutoCAD:** rectang/p304, p321: the default after opening the blank drawing, the value after
  opening the one saved with it.
- **mellowcad:** `C/c.test.ts`: not in the file; kept across NEW.
- **Fix:** `DocumentSettings` and the file (RECTANG-D44); `drafting-aids.md`' **unverified** on
  their persistence is settled.

#### KEP-05 — Values AutoCAD keeps per drawing, unsaved, survive NEW and OPEN here

- **Row:** J · **Where:** CIRCLERAD (`runtimeTools.ts:85`), `PolygonTool.ts:80,82`,
  `OffsetTool.ts:162`, `HatchTool.ts:96-98`, `InsertTool.ts:68`, `RotateTool.ts:105`,
  `ScaleTool.ts:98-101`, `PlacementTool.ts:81`, `TextTool.ts:70`, UNDO Control (`Command.ts:160`)
- **AutoCAD:** each back to its default after OPEN: p301, p303, p305, p309, p310, p311, p314, p315,
  p321.
- **mellowcad:** `C/c.test.ts`, `C/c2.test.ts`: each survives NEW and OPEN.
- **Fix:** a `Tool.onNewDrawing()` hook the runtime calls on every tool at NEW and OPEN, resetting
  the shared CIRCLERAD itself (RECTANG-D41). Downgraded from high: it shows only after NEW or OPEN.

#### KEP-06 — -MTEXT keeps Justify, Rotation and Line spacing for the next run

- **Row:** B · **Where:** `MTextTool.ts:73,76-78`
- **AutoCAD:** rectang/p312: the second run offers `<TL>`, `<0>`, `<At least>`, `<1x>`.
- **mellowcad:** `C/c2.test.ts`: `<MC>`, `<20>`, `<Exactly>`.
- **Fix:** reset them in `onActivate` (RECTANG-D45).

#### KEP-07 — U does not take back a value the command set

- **Row:** F · **Area:** undo (LINE's review) · **Where:** `FilletTool.ts`, `ChamferTool.ts`,
  `TextTool.ts`
- **AutoCAD:** rectang/p317 (untraced): U after FILLET, CHAMFER, -TEXT, CIRCLE, POLYGON puts
  FILLETRAD, CHAMFERA, TEXTSIZE, CIRCLERAD and POLYSIDES back.
- **mellowcad:** `C/c3.test.ts`: kept; a radius-only FILLET leaves no undo step.
- **Fix:** the drawing-saved ones become settings changed inside the command's run, so its step
  holds them; CIRCLERAD and POLYSIDES stay a gap (RECTANG-D48).

### Low

- **REC-12 — Enter at Pick points' points is refused; AutoCAD takes the cursor.** rectang/p118,
  p119 (AllowNone true; the console takes its fixed cursor). Fix: the cursor's point at both;
  Missing's "no counterpart here" goes (the browser has a cursor). `RectangleTool.ts:641-643`.
- **REC-13 — Spanish Area refusal.** rectang/p112 es-ES: `El valor debe ser positivo y distinto de
  cero.` (the reviewer read it); CIRCLE's and LINE's keep «diferente». Fix: a message id of its
  own.
- **REC-14 — After a refusal at Rotation the console writes no prompt again.** rectang/p116, p135
  (the getangle's Message is empty); the desktop is unprobed. Not fixed: a Missing note
  (RECTANG-D63).
- **REC-15 — Stale docs and 2023 citations.** The coverage entry's "negative ones too", the
  Elevation **unverified** (settled by p148, p142, p143, with REC-11), Area's length 0 (on 2027 the
  first vertex the first corner and three NaN, p114); every `acc/…` in `RectangleTool.ts`,
  `rectangle.test.ts`, `polylineWidths.test.ts` and `cornerDirection.test.ts` re-cited to its 2027
  probe (p02, p04, p109, p111–p114, p118, p153–p158, p161, p162, p172, p174, p180–p192).
- **PGN-04 — `<a` then a distance at Edge's end runs towards the cursor.** `B/b5.test.ts`,
  `R/desk.test.ts`; the console ignores the override (p09), the desktop unprobed at this prompt
  (RECTANG's d03 honours it). **Unverified**; fixed with REC-02's path (RECTANG-D65).
- **PGN-07 — A zero-length Edge draws nothing.** polygon/p125: `@` `@` makes four vertices at one
  point and ends. Fix: make it (RECTANG-D64).
- **PGN-08 — The side count takes `3.0` and `1e1`.** polygon/p153 refuses both; `+5` is taken.
- **PGN-09 — The coverage's Missing says a typed point at the radius is missing; it works.**
  polygon/p06, p102, p123; untested. Fix: the line goes, tests cite the probes.
- **PGN-10 — 2023 citations and `PG`†.** The entry's "AutoCAD 2023's own console" and the test's
  "As AutoCAD 2023 lists it" re-cited (p01, p03, p08, p100); `PG` verified (p108).
- **KEP-08 — `cad-tools.md` § "System variables" is stale**: its examples (FILLET's radius,
  CHAMFER's distances) are saved in the drawing; HATCH's are per drawing; "Not-saved" spans two
  scopes. Rewritten as four storage kinds with the OPEN test (RECTANG-D40).
- **KEP-09 — The coverage does not say which registry variables last only the session here**
  (OSMODE, POLARANG, POLARMODE, AUTOSNAP, DYNMODE, SELECTIONCYCLING); OFFSET's **unverified**
  `Sí`/`Actual` is settled by p310.

## 6. Decisions

- **RECTANG-D1–D6** (RECTANG's subagent): scratch tests asserting AutoCAD in `A/h.test.ts` only;
  the cornerDirection probes under `rectang/`; p137 dropped (Lisp between undo commands drops the
  redo state); `'-COLOR` and `'ELEV` standing in for `'CECOLOR`, `'ELEVATION`; two decimals against
  four and the alias echo left to their owners.
- **RECTANG-D40:** a value's storage is the console's OPEN test, not the help's "Saved in:", which
  says Not-saved for two scopes.
- **RECTANG-D41:** values kept per drawing and unsaved reset at NEW and OPEN through an optional
  `Tool.onNewDrawing()`; the runtime resets the shared CIRCLERAD itself.
- **RECTANG-D42:** undoing NEW (possible here, not in AutoCAD, whose NEW opens another document)
  does not bring back the old drawing's unsaved values; a WHY and a coverage note.
- **RECTANG-D43:** FILLETRAD, CHAMFERA, CHAMFERB, TEXTSIZE and TEXT's justification on
  `DocumentSettings`, written when not the default, read tolerantly, the file version bumped.
- **RECTANG-D44:** ORTHOMODE, SNAPMODE, SNAPUNIT, GRIDMODE, GRIDUNIT on `DocumentSettings` and the
  file; an F-key toggle stays out of undo until a desktop probe says otherwise.
- **RECTANG-D45:** MTEXT resets Justify, Rotation and Line spacing each run and reads TEXTSIZE.
- **RECTANG-D46:** program-wide and registry values stay for the session (no preferences store
  here), noted in each coverage entry.
- **RECTANG-D47:** TEXT's, MTEXT's and ATTDEF's Style set the current text style.
- **RECTANG-D48:** U puts back what became a document setting (KEP-07); CIRCLERAD and POLYSIDES
  stay out of undo, a gap in their entries.
- **RECTANG-D60:** Ortho stays at RECTANG's other corner and Edge's end: the desktop bends both
  (d01, d02) whatever the trace's UseBasePoint.
- **RECTANG-D61:** a rectangle of no area is made as AutoCAD makes it; with Chamfer or Fillet the
  cuts never fit, so the doubled plain corners (p12).
- **RECTANG-D62:** REC-05's two fields are the length and the width along the turned sides, their
  signs from the cursor's quadrant as the corner reads it; a coordinate typed in the first field is
  still a point relative to the first corner (d05). If the dynamic-input session cannot hold two
  distance fields without a new kind, the executor adds the smallest one and says so.
- **RECTANG-D63:** REC-14 is noted in Missing, not built, until a desktop probe shows the same.
- **RECTANG-D64:** a zero-length Edge makes the degenerate polygon (p125).
- **RECTANG-D65:** PGN-04 rides on REC-02's fix; its desktop check stays in Missing.

## 7. Tests proposed

Each finding's regression test first, in the files named; then the untested cells:

- `rectangle.test.ts`: Enter and `FOO` at every prompt in es; LASTPOINT after Area, Dimensions,
  Pick points (p131); `@` alone (p123); the es modes line with every mode (p162).
- `drawing.test.ts` (POLYGON): Enter at the four prompts; the typed point and `@` at the radius
  (p06, p102, p123); the centre's Z (p131); Edge's 2D refusals (p132, p133); UCS Z 30 and X 90
  (p104, p135); es `PG` (p108); PLINEWID ignored (p136).
- New `newDrawingResets.test.ts` (KEP-05): one assertion per value after NEW and after OPEN.
- `drawingFile.test.ts`: KEP-02's and KEP-04's settings round trip.
- Citations to re-probe: every `acc/…` of REC-15 and PGN-10 (done by the probes above; only the
  citation changes).

## 8. Not tested, and why

The rail's icons and the landing's filing (presentation); TypeScript's guarantees on the state
unions; grips and the palette (the polyline's, PLINE's review).

## 9. Not reviewed, and why

- The desktop in the Spanish profile (the launched instance opened the English one again): the
  dynamic-input labels `firstCorner`, `otherCorner`, `firstPoint`, `numberOfSides`, `radius`
  stay **unverified**.
- Escape once and twice, whether options set before an Escape stay, REC-14 and PGN-04 on the
  desktop.
- MDI's NEW on the desktop (the console has no NEW, p300: OPEN stands in); registry against
  program-wide across a restart; whether U takes back an F8.

## 10. Refuted in the adversarial pass

- **Ortho at RECTANG's other corner and Edge's end** (the trace's UseBasePoint false): the desktop
  bends both (d01, d02); mellowcad matches.
- **`No found for specified point.`** for a Tangent finding nothing: AutoCAD writes the same (p10,
  es `No se ha encontrado para el punto designado.`).
- **LASTPOINT after a point typed relative in the box** (ARC-13's analogue): the runtime's base is
  the first corner and Edge's first endpoint, so LASTPOINT is the point given (d05, p07, p12) — it
  stays so only while `getConstraintAnchor()` returns them.
- **`<a` ignored at the other corner** (p128): the console's artefact; the desktop honours it
  (REC-02).
- MREDO All redoing one step (p137): Lisp between the undo commands; p173 matches.
- PLINEWID applied to POLYGON: AutoCAD ignores it too (p136).
- HPNAME's default ANGLE in the console: an imperial template; this app is metric.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| RECTANG: Chamfer and Fillet "negative ones too" | p107, p108 | false (REC-07) |
| RECTANG: Elevation "at 0 the first corner fixes the plane" (**unverified**) | p122, p142, p143, p148 | holds, but REC-11 |
| RECTANG Missing: Area's length 0 "a polyline of no size at the origin" | p114 | no longer true in 2027 (REC-15) |
| RECTANG Missing: Enter at Pick points' first point | p118, p119 | the reason is wrong (REC-12) |
| POLYGON: "English wording and geometry from AutoCAD 2023's own console" | p01, p03, p100 | wording holds; the start vertex false (PGN-05) |
| POLYGON Missing: a point at the radius | p06, p102 | false: it works (PGN-09) |
| POLYGON: `PG`† | p108 | holds; † goes |
| FILLET, CHAMFER: radius and distances "for the session" | p302, p316 | false (KEP-02) |
| CIRCLE, POLYGON, OFFSET, ROTATE, SCALE, MOVE, HATCH: "for the session" | p301–p315 | false: per drawing (KEP-05) |
| drafting-aids: Ortho/Snap/Grid persistence **unverified** | p304, p321 | settled (KEP-04) |
| OFFSET's Erase/Layer es `Sí`/`Actual` **unverified** | p310 | holds |

| Rule | Claim | State |
| --- | --- | --- |
| `cad-tools.md` § System variables | FILLET's radius, CHAMFER's distances, HATCH's HP* are Not-saved session fields | stale (KEP-08) |
| `cad-tools.md` § Points | `getConstraintAnchor()`: none where Ortho leaves the pick alone, whatever UseBasePoint says | holds (d01, d02 prove the "whatever") |
| `cad-tools.md` § What a new object wears | the jigs wear `currentColor` | broken by RECTANG and POLYGON (REC-04, PGN-03) |
| `cad-tools.md` § Dynamic input | RECTANG's corners refuse Enter in `commitRaw` | holds |

Checked and holding beside these: the rules on catalogs (every prompt by id, keywords by global
word), on commands (`AddEntityCommand`, one undo step), on LASTPOINT (`ctx.lastPoint` for a first
point), on flat objects (`onPlaneOf` the first point), THICKNESS (POLYGON's `withCurrentThickness`,
RECTANG's own).

## 12. Order of execution and estimate

1. **REC** — RECTANG (REC-01 to REC-15): the tool, the catalogs (`RECTANGLE`, REC-13's message),
   tests, coverage. The largest piece is REC-05's two fields. About two hours with its subagent.
2. **PGN** — POLYGON (PGN-01 to PGN-10): the tool, tests, coverage. An hour. It shares REC-02's path
   (after REC).
3. **KEP** — the area (KEP-01 to KEP-09): `DocumentSettings` and the file (a version bump),
   `Tool.onNewDrawing()`, TEXT, MTEXT, ATTDEF, FILLET, CHAMFER, the drafting toggles, the rule,
   five coverage files. Three hours; after REC and PGN, which it touches (POLYGON's sides).

## 13. Changes the execution makes

- **Coverage:** `draw.md` (RECTANG, POLYGON, CIRCLE's CIRCLERAD scope), `modify.md` (FILLET,
  CHAMFER, OFFSET, MOVE, ROTATE, SCALE), `drafting-aids.md` (Ortho, Snap, Grid in the file; the
  registry notes), the text and hatch entries where their kept values are described.
- **Rules:** `cad-tools.md` § System variables rewritten (KEP-08); § What a new object wears adds
  RECTANG and POLYGON to the jigs in `currentColor`.
- **Catalogs:** `RECTANGLE` in en and es; REC-13's Spanish message.
- **Roadmap:** row 5 `done`, owning "options kept for the session" (KEP).

## 14. Template improvements (proposed)

- annex-probes.md §2: the trace's `UseBasePoint` false does not predict Ortho where the command
  draws its own jig — RECTANG's corner and POLYGON's edge are bent (d01, d02); and `<a` then a
  number at such a prompt is ignored by the console but honoured on the desktop (p08, d03). The
  flag says where to look, the desktop decides.
- annex-probes.md §4: `com get DYNMODE` read 3 where Lisp read −1 after a restore: check a restored
  DYNMODE with `com eval '(getvar "DYNMODE")'`.
- annex-probes.md §3: a desktop pass with DYNMODE 3 at every point prompt (the dimensional fields
  are per command: RECTANG's sides, d05).
- template §1.3: an area spanning every command (KEP) settles storage with the console's OPEN
  test, since the console has no NEW (p300).
