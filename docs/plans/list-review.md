# LIST and CHPROP review (review 32)

> **Status:** plan, 2026-11-27, one session: phases 0–4 with three subagents probing the console
> (CHPROP; LIST and the first half of its report; the second half), the catalog sweep and a
> COM-and-mouse desktop pass by the reviewer (chprop/d01, d02). Executed next, in the order of §12,
> one commit per block.
>
> It owns **LIST's report of every object**: each type's lines, their words in every localized
> language, the header every type shares, a point and a direction in the current UCS. It cites the
> LINE review (the command line, transparency, undo, dynamic input), ERASE's (`Select objects:`,
> preselection, locked layers), the Properties review (the style tables, -COLOR, -LINETYPE,
> -LWEIGHT), Arrays (the array object), 3D primitives and Regions (the solid and region objects),
> HATCH and Text.

## 1. Summary

| Block | What                                      | Critical | High | Medium | Low |
| ----- | ----------------------------------------- | -------- | ---- | ------ | --- |
| CHP   | CHPROP                                    | 0        | 0    | 1      | 4   |
| LST   | LIST, the command                         | 0        | 0    | 0      | 0   |
| LSR   | LIST's report, en and es                  | 0        | 2    | 7      | 6   |
| LSK   | LIST's report in the other 7 languages    | 0        | 0    | 1      | 2   |

The worst:

- **LIST of a POINT writes nothing**: `listReport`'s switch has no case for the type (LSR-01).
- **An object's own linetype scale is never listed**, though CHPROP, CELTSCALE and the palette set
  it: AutoCAD writes `Linetype scaling =    2.0000` under LineWeight (LSR-02).
- **CHPROP's Thickness refusal calls a region, a solid, a 3D face, an xline… `BLOCKs`** (CHP-01);
  and in pt-BR, de, pl and it LIST's columns are padded twice, its catalogs carrying spaces the
  code already adds, with a garbled pt-BR line (`para o pon       início no,`, LSK-01, LSK-02).

LIST the command matches AutoCAD in every cell probed (LST: no finding).

## 2. Inventory

- **Commit** `bbc3e620`; AutoCAD 2027 ACADVER 26.0, `X.118.0.0`; the tables of 2026-10-31 (en,
  es, pt-BR) to 2026-11-22 (zh-TW), the same build as the reviews before.
- **LIST**: `cad/application/tools/ListTool.ts`, `listReport.ts`, `blockListing.ts`; registration
  in `runtimeCommands.ts`; the catalogs' `commands.messages.list*` (233 keys with CHPROP's) in the
  ten command languages; ribbon: Properties panel slide-out (acad.cuix RBN_01740411,
  `^C^C_list`). Tests: `list.test.ts`, the LIST tests of `image.test.ts`, `mleader.test.ts`,
  `minsert.test.ts`, `xline.test.ts`, `solidPrimitives.test.ts`, `regionCommands.test.ts`,
  `solidSweeps.test.ts`, `xrefs.test.ts`, `undoEcho.test.ts`, the English surface walk.
- **CHPROP**: `cad/application/tools/ChPropTool.ts` with `ColorTool.ts`, `LweightTool.ts`,
  `linetypeFiles.ts`, `valueWordPrompt.ts`; tests `chprop.test.ts`, `linetypeTable.test.ts`,
  `undoEcho.test.ts`, `currentProperties.test.ts`; no ribbon button (none in acad.cuix).
- **Coverage**: `docs/coverage/inquiry.md` LIST, `docs/coverage/properties.md` CHPROP; the
  roadmap's "Command reviews".
- **Related**: -COLOR, -LINETYPE, -LWEIGHT (CHPROP's value prompts; Properties review), CELTSCALE,
  the Properties palette's Linetype scale row; every entity type of the model (LIST).

## 3. Probes

Inputs in `scripts/research/probes/<command>/`, transcripts in `research/probes/<command>/`.

| Ids | What | Where |
| --- | ---- | ----- |
| chprop/p100–p101 | Thickness and ltScale on every other type, the refusal words | console, 10 languages |
| chprop/p102–p110 | `_.CHPROP` and repeat; other prompts' keywords and `_BYLAYER`; transparency; U after a linetype load (`.plain`); a command typed mid-prompt; LASTPOINT after two points; `<varies>`; what is left selected; Escape at a value prompt | console, es and en |
| chprop/d01 | the set while CHPROP asks: highlighted and unchanged until Enter | desktop en-US, COM and one click |
| chprop/d02 | dynamic input: the property prompt lists its nine keywords at once; Color's box holds `1 (red)` selected; ltScale's `1.0000`; the desktop lists `[Truecolor/COlorbook]` | desktop en-US, keys |
| list/p100–p123 | the linetype scale line, POINT, LUNITS and AUNITS, a fitted polyline's thickness and its END SEQUENCE, a closed spline-fit polyline, a 3D polyline's Spline and its area, a closed spline in no plane, ATTDEF tilted, every curve in Z30 and X90, a fitted polyline in Z30 and X90 (p103 en, p104 es only; p105 `.plain`) | console, es and en |
| list/p200–p228 | each dimension kind in Z30 and X90, a hatch off the plane, CW polar and Divide path arrays, the arrays' rows, the header of every type, the primitives and sweeps in Z30 and X90, 2D SOLID, 3DFACE, XLINE, RAY, LEADER, WIPEOUT, INSERT, MINSERT, mesh, regions off the plane, a hatch's angle and origin, a table, an image, a multileader and a gradient in Z30 (p218–p220 and p228 by `runacc.sh -t -i` on the DXF fixtures, p219, p220, p228 en only) | console, es and en |
| inquiry/p400–p446 | LIST's own probes, replayed through the harness in each language they ran in (row K) | console, 10 languages |

## 4. Matrix

### CHP — CHPROP

| Row | State |
| --- | ----- |
| A names, aliases (none in any 2027 acad.pgp), repeat | match · p102 · `chprop.test.ts` |
| A `_.CHPROP` | known (`command-line.md`'s `.` prefix, LINE review) · p102 |
| A `'CHPROP` | match · p15 · `chprop.test.ts:438` |
| B property prompt (2027 lists TRansparency/Material/Annotative, hides Colour, Propertys, Properties) | known · p01, p17 |
| B Color, LAyer, LType, ltScale, LWeight, Thickness: Enter, 0, negative, FOO, other prompts' keywords, `_BYLAYER`, `1/2`, `1e1` | match · p03–p10, p103, p106 · untested for p103 (CHP-04) |
| B `<varies>` | match · p108 · untested |
| C LASTPOINT after two points | match · p107 · untested |
| D dynamic input: keywords listed at once, boxes | match but presentation (CHP-05) · d02 |
| E transparency at each prompt | match · p15, p104 · partly tested |
| F U, UNDO 2, REDO; U undoing a linetype loaded from acad.lin | match · p16, p105 · untested for p105 |
| G Enter, Escape at each prompt, a command typed | match · p21, p106, p110 |
| H each property on every type | differs CHP-01 (words); match otherwise · p11, p100, p101 |
| H locked objects, order | match · p13, p13b, p11e |
| I the palette after the run | owned (Properties review) |
| J n/a | CHPROP makes nothing a file holds apart from the properties (LINE's files) |
| K | match · catalog sweep (§11) and p100, p101 in 10 languages for CHP-01 |
| L history | match · p103–p108 line for line |
| M the set while asking | match · d01 (highlighted, unchanged until Enter) · `chprop.test.ts` (p21) for unchanged; the highlight untested |
| N `chprop.test.ts` | holes CHP-04; nothing always passes |
| O coverage and roadmap | differs CHP-02, CHP-03 |
| P, Q a pick on a locked object | known (Missing) |

### LST — LIST, the command

| Row | State |
| --- | ----- |
| A `LIST`, `LI`, `LS`, es `LS`, `LT`; repeat; `'LIST` | match · p103, p104, inquiry/p425 · `list.test.ts:2039`; the aliases untested |
| A `_.LIST` | known (`command-line.md`) |
| E transparency at `Select objects:` | owned (ERASE) · p106 |
| F U, UNDO 2, REDO, en and es | match · p105 · `list.test.ts:2033` (U in en only) |
| G Escape mid-selection | owned (ERASE) |
| order, preselection, locked | match · inquiry/p420, p421, p426, p435, p440 · `list.test.ts:574`, `:1988`, `:2024`, `:1030` |
| L history | match but the report's findings |
| the desktop's text window and pause | known (Missing) |

### LSR — the report (en, es)

| Type / cell | State |
| ----------- | ----- |
| header (Color, Linetype, LineWeight, Thickness) on every type | match · inquiry/p401, list/p100, p209 |
| header: the object's linetype scale | differs LSR-02 · p100, p102, p123 |
| POINT | differs LSR-01 · p101, p102, p122 |
| LINE, CIRCLE, ARC, ELLIPSE, SPLINE, TEXT, MTEXT, ATTDEF in Z30 and X90 | match · p115, p116 |
| ATTDEF tilted (was unverified) | match · p114 |
| LWPOLYLINE off its plane: arc angles, extrusion | differs LSR-04 (LSR-46 folded in) · p115, p116, p201, p208 |
| LWPOLYLINE drawn in a UCS, listed in the WCS | match · p119 |
| fitted polyline: thickness, END SEQUENCE | differs LSR-06 · p109, p123 |
| fitted polyline: closed spline-fit, last widths (were unverified) | match · p110, p111 |
| fitted polyline off the UCS's plane: `total angle` | differs LSR-05 · p121 |
| 3D polyline: Spline (`Open spline space`, was unverified), planar closed | match · p112, p118 |
| 3D polyline not coplanar: no area, length | differs LSR-03 · p112, p117 |
| 3D polyline Spline's points at a tie | differs LSR-07 (low) · p112 |
| closed spline in no plane (was unverified) | match but the known length · p113 |
| LUNITS 1–5, AUNITS 1–4 | n/a: decimal units and degrees only (`workspace.md`) · p107, p108 kept |
| every dimension kind in Z30 and X90 | match but known (associative, text position) · p200, p226 |
| HATCH, gradient in a turned UCS: angle, origin | differs LSR-40 · p201, p206, p207, p222, p223, p228 |
| HATCH off the UCS's plane (was unverified): no extrusion line | match · p201 |
| ARRAY polar CW (was unverified), path Divide (was unverified) | match · p202, p203 |
| ARRAY polar and path rows | known (arrays' Missing) · p204 |
| primitives, EXTRUDE, REVOLVE, UNION, SLICE, taper in Z30 and X90 | match · p210–p212, p224, p225 |
| a primitive whose X axis is the UCS's Z | differs LSR-43 · p213 |
| REGION off the UCS's plane: bounding box | differs LSR-41 · p215–p217 |
| 2D SOLID, 3DFACE, XLINE, RAY, LEADER, WIPEOUT, INSERT, MINSERT, mesh in Z30 and X90 | match · p214, p215 |
| LEADER's MTEXT flow direction | differs LSR-44 · p209, p214, p215 |
| ACAD_TABLE in Z30: position | differs LSR-42 · p219 |
| MULTILEADER, IMAGE in Z30 | match but LSR-45 · p218, p220 |
| a reference with an attribute in Z30, X90 | match · p227 |
| N `list.test.ts` | strong (whole arrays against cited transcripts); one count at `:2005`; holes in each finding |

### LSK — the report in pt-BR, fr, it, de, ru, pl, cs, hu

The 15 LIST probes each language ran (`--select`) replayed through the harness in that language,
line for line against its transcript (the reviewer's scratch replay, kept for the execution):
fr matches but the known gaps; the others differ in LSK-01 to LSK-03.

## 5. Findings

### High

#### LSR-01 — LIST of a POINT writes nothing

- **Severity:** high · **Row:** H, L · **Status:** verified (reviewer's scratch test)
- **Where:** `cad/application/tools/listReport.ts:181` (`Report.of`: no `case "point"`; the only
  `EntityType` without one, so `ListTool.run` reports an empty line)
- **AutoCAD:** list/p101, p102, p122: `                  POINT     Layer: "0"`, Space, the header
  (Thickness when set), `                at point, X=   3.0000  Y=   4.0000  Z=   0.0000` (es
  `PUNTO     Capa:`, `                en punto, X=…`), in the UCS; off the UCS's plane
  `Extrusion direction relative to UCS:` and its normal (p122)
- **Fix:** a `case "point"`: the header, the vertex's `at point` line (`listVertex3dPoint`'s
  shape) and `sayExtrusion`; `point` in `listObjectName` of every language, its word from p101 run
  in each (`probe.sh --lang <tag> --lang-only list p101`)
- **Regression test:** `list.test.ts`, p101 in en and es; the other languages in LSK's replay

#### LSR-02 — The object's own linetype scale is not listed

- **Severity:** high · **Row:** H · **Status:** verified (reviewer's scratch test)
- **Where:** `listReport.ts` `header()`, `Wearing` (no `linetypeScale`)
- **AutoCAD:** list/p100, p102, p123: `Linetype scaling =    2.0000` (es `Escala para tipo de
  línea =    2.0000`) at column 0, `%9` at LUPREC, after `LineWeight` and before `Thickness`, on
  every type, each VERTEX and END SEQUENCE included; set by CHPROP's ltScale or CELTSCALE; in no
  table, so each language's words come from p100 run in it
- **Fix:** `linetypeScale` in `Wearing`, the line when it is not 1; a message key in every
  language
- **Coverage:** inquiry.md's "per-object linetype scale … what no model here holds" is false

### Medium

#### CHP-01 — Thickness's refusal names most types `BLOCKs`

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `ChPropTool.ts` `apply()` (`refused.add(… "other" …)`) and every catalog's
  `cannotChangeThickness` select (ellipse, spline, polyline3d, mtext, dimension, hatch only)
- **AutoCAD:** chprop/p100, p101 in all 10 consoles, newest first: `Cannot change thickness for
  RAY.`, `XLINE.`, `3D Polygon Meshes.` (20363), `3DFACEs.` (20360), `3DSOLID.`, `REGION.`,
  `BLOCKs.` once for a reference, a MINSERT and an array (20407), `MTEXT.`, `LEADER.`,
  `MULTILEADER.`, `ACAD_TABLE.`, `IMAGE.`, `WIPEOUT.`; the names English in every language but
  20360, 20363, 20407: es `3DCARAs`, `Mallas poligonales 3D`, `BLOQUEs`; pt-BR `FACE3Ds`,
  `Malhas poligonais 3D`, `BLOCOs`; fr `3DFACEs`, `Surfaces maillées 3D`, `BLOCs`; it `FACCE3D`,
  `Mesh poligonali 3D`, `BLOCCHI`; de `3DFLÄCHEn`, `3D Polygon-Netze`, `BLÖCKE`; ru `3D-граней`,
  `полигональных 3D-сетей`, `блоков`; pl `obiektów typu 3WPOW`, `siatek wielokątnych 3D`,
  `bloków`; cs `3D plochy`, `3D mnohoúhelníkové sítě`, `BLOKy`; hu `3DLAPok`, `3D poligonhálók`,
  `BLOKKok`
- **mellowcad:** p100 writes six `BLOCKs` lines; the order already matches
- **Fix:** branches `region`, `solid3d`, `face3d`, `polygonMesh`, `xline`, `ray`, `wipeout`,
  `image`, `table`, `mleader`, `leader` in every catalog's select (CHPROP-D1); `insert` stays
  `other`
- **Regression test:** `chprop.test.ts`: p100's and p101's lines in en, one language's in es

#### LSR-03 — A 3D polyline whose points are not coplanar has no area

- **Severity:** medium · **Status:** verified · **Where:** `listReport.ts` `polyline3d()`
- **AutoCAD:** list/p112, p117: `  Points not coplanar.  No area calculated.` (es `  Puntos no
  coplanares.  No se calcula el área.`), then `length`, closed or not; coplanar ones keep area and
  `perimeter` (p118, inquiry/p410)
- **Fix:** test the curve's points for a plane; without one, the message and `listLength`

#### LSR-04 — A LWPOLYLINE listed in a UCS that is not its plane (LSR-46 folded in)

- **Severity:** medium · **Status:** verified · **Where:** `lwpolyline()`'s arc lines and its
  `sayExtrusion`
- **AutoCAD:** list/p115, p116: each arc's start and end angle in the polyline's OCS, not the UCS
  (Z30: 270 / 0 where we write 240 / 330); p201, p208: its extrusion line is the stored normal, in
  the WCS (`0,0,1` in X90, Y90 and X45; one drawn in X90 listed in Z90 `0,-1,0`), though it says
  "relative to UCS"; a CIRCLE's and a heavy POLYLINE's are in the UCS, as here (p205, p121)
- **Fix:** only the LWPOLYLINE: bulge angles in its OCS, the normal as stored

#### LSR-05 — A fitted polyline's arc vertex off the UCS's plane writes `total angle`

- **Severity:** medium · **Status:** verified · **AutoCAD:** list/p121 (X90): each VERTEX with a
  bulge `       total angle     18` instead of start and end, as an ARC off the plane
  (inquiry/p436); not a LWPOLYLINE's (p115) · **Fix:** the ARC's rule in `heavyPolyline`'s
  vertices

#### LSR-40 — A hatch's angle, a gradient's angle and a hatch's origin are re-read in the UCS

- **Severity:** medium · **Status:** verified · **Where:** `listReport.ts` `hatch()` (`ucsAngle`,
  `at(hatch, hatch.origin)`)
- **AutoCAD:** list/p206, p201 (`Hatch angle 45` in Z30 and X90 for one made at 45 in the WCS),
  p228 (`Gradient Angle 45` in Z30), p222 (HPORIGIN 10,20: `X= 10 Y= 20 Z= 0` in Z30, X90 and a
  moved origin), p223 (raised to 5: Z 0; a vertical one `210, 0, 20`, its OCS point in the WCS,
  no elevation, no UCS)
- **Fix:** the stored angles; the origin through its OCS to the WCS, no elevation, no UCS
  (LIST-D20; a hatch made in a turned UCS, which AutoCAD lists in that UCS's terms, goes to
  Missing)

#### LSR-41 — A region's bounding box off the UCS's plane

- **Severity:** medium · **Status:** verified · **AutoCAD:** list/p215–p217: the extent of its
  projection on the UCS's XY plane, both bounds at one Z, the box centre's (`Z = 45.3553` twice,
  p217) · **mellowcad:** the 3D box in the UCS · **Fix:** project, Z at the box's centre
  (LIST-D21)

#### LSR-42 — A table's position is written in the WCS

- **Severity:** medium · **Status:** verified · **AutoCAD:** list/p219 (Z30): `Position: X=
  1282.435565, Y= -578.756443`, the WCS's 1400,140 in the UCS; normal and horizontal direction
  stay WCS · **Fix:** the position through `ucsPoint` (LIST-D22) · **Coverage:** "its position …
  in the WCS" is false (table/t08 was in the WCS)

#### LSK-02 — pt-BR: a text's start point line is garbled

- **Severity:** medium · **Status:** verified (replay of inquiry/p413 in pt-BR)
- **AutoCAD:** `         início no ponto, X=   0.0000  Y=   0.0000  Z=   0.0000`
- **mellowcad:** `            para o pon       início no, X=   0.0000 …` (a key built from two
  pooled words); also each vertex `em ponto` where the console writes `no ponto` (p430)
- **Fix:** the pt-BR catalog's keys from the transcripts, through the replay

### Low

- **CHP-02** — the CHPROP entry's prompt lists lack ltScale (en, es, pt-BR); its Missing still
  says Truecolor reads back `1 (red)`, which `chprop.test.ts:166` and p05 show fixed. Fix the entry.
- **CHP-03** — the roadmap says CHPROP's ltScale waits for per-object ltscale (its PEDIT
  paragraph and the deferrable list): it exists. Drop both.
- **CHP-04** — `chprop.test.ts` holes: the MTEXT, DIMENSION, HATCH and BLOCKs words (p11, p11d),
  `<255,0,0>` (p05), Escape at a value prompt (p110), U taking back a loaded linetype (p105),
  LASTPOINT after two points (p107), other prompts' keywords and `_BYLAYER` (p103), `'_LINE` at a
  value prompt (p104), the Spanish ltScale words, `<varies>` (p108), the set highlighted while
  asking (d01).
- **CHP-05** — ltScale's dynamic-input box shows the drawing's unit (`mm`), as every `distance`
  box does; AutoCAD's shows none (d02-3). Presentation, the dynamic input's area (LINE review):
  kept (CHPROP-D3); and Color's box shows its default as a placeholder where AutoCAD preloads
  `1 (red)` selected (d02-2): the same area's convention, kept.
- **LSR-06** — a fitted polyline's END SEQUENCE writes `Thickness =`, which AutoCAD's does not
  (p109, p123); AutoCAD writes `PlotStyleName: Color_1` there for an object of its own colour
  (p123), which no model here has (plot styles): to Missing (LIST-D1).
- **LSR-07** — a 3D polyline Spline's points at a tie round one ulp low (`12.9687` for
  `12.9688`, p112): refuted as floating noise unless the curve's evaluation can be exact (LIST-D2).
- **LSR-43** — a primitive whose X axis is the UCS's Z lists `Rotation: 45` for AutoCAD's 0
  (p213): `cad/domain/solids.ts:561`'s `atan2` of two noise components. Zero them under 1e-10.
- **LSR-44** — LEADER's MTEXT lists `Flow direction: ByStyle`, AutoCAD's `LtoR` (es `IZaD`;
  p209, p214, p215): the MTEXT holds no flow direction (DXF 72). To Missing (LIST-D24).
- **LSR-45** — `Material: ByLayer` under Space for a multileader, an image, a hatch or a gradient
  AutoCAD read from a DXF (p218, p220, p228); `image.test.ts:173` and `mleader.test.ts` cut it
  without a note. To Missing, a note at each test (LIST-D23).
- **LSK-01** — pt-BR (28 lines), de (12), pl (12), it (6), cs and hu (1 each) pad a value twice:
  the catalog carries spaces before `{value}` the code's `%9` already adds (de `Objekthöhe =
  2.0000` with three spaces too many, p401; p402, p419, p430, p433, p437, p438, p439), and some
  labels sit a column off (it `iniziale punto`, cs `plocha`, hu `terület`).
- **LSK-03** — wordings: de `3D Länge  =…,  Winkel von XY-Ebene aus=` (ours `3D-Länge … Winkel aus
  XY-Ebene =`, p401) and `Hochzugsrichtung relativ zum BKS:` (ours `Extrusionsrichtung`, p436); ru
  `центр точка` (ours `центральная точка`, p436, p439); pl `Nieplanarny` (ours `Niepłaski`, p428),
  `kąt całkowity` (ours `całkowity kąt`, p436) and its `Długość 3D` line (p401); it `tipo: ruotato`
  (ours `ruotata`, p414) and the zero-width space AutoCAD's `Fattore di scala X:` carries (p439);
  hu an arc dimension's `definíciós pont:  ív mérete` (p415) and `Kihúzási irány az FKR-hez
  viszonyítva:` (p436).

## 6. Decisions

- **CHPROP-D1** CHP-01 in the existing select, keyed by type; names untranslated where the console
  keeps them.
- **CHPROP-D2** `_.CHPROP` and `_.LIST` are the command line's `.` prefix (LINE review), not theirs.
- **CHPROP-D3** CHP-05 kept: the box's unit and placeholder are the dynamic input's convention for
  every command; `distance` is what lets ltScale take two points (p08b).
- **LIST-D1** No `PlotStyleName` line: no plot styles here; to Missing with LSR-06.
- **LIST-D2** LSR-07 not fixed: a tie's last bit, invisible but at exact halves.
- **LIST-D3** The report's new keys (POINT's name, `Linetype scaling`, `Points not coplanar`) take
  each language's words from its console, run with `--lang-only`, never translated.
- **LIST-D20** A hatch lists what it stores; the UCS it was made in is Missing.
- **LIST-D21** A region's box off the plane: the projected extent, Z at the box's centre (a circle
  cannot tell the centroid from it: unverified which).
- **LIST-D22** A table's position in the UCS, its directions in the WCS.
- **LIST-D23** `Material:` to Missing (no materials modelled).
- **LIST-D24** LEADER's MTEXT flow direction to Missing (not modelled).
- **LIST-D25** The it zero-width space is copied: the console's string, invisible either way.
- **LIST-D26** The replay of each language's probes (the reviewer's scratch test) becomes a committed
  test with the expected lines inline (the transcripts are Autodesk's text and gitignored).

## 7. Tests proposed

Each finding's regression test above, first seen failing. Then CHP-04's cells in
`chprop.test.ts`; LIST's aliases, U and REDO in Spanish and UNDO 2 (list/p103–p105) in
`list.test.ts`; the now-verified cells (p110, p111, p112's header, p113, p114, p118, p119, p202,
p203, p214, p215, p227) as tests citing their probe.

## 8. Not tested, and why

The desktop's text window and pause (Missing); LUNITS and AUNITS other than decimal and degrees
(not modelled); the dynamic input's look (presentation, d02).

## 9. Not reviewed, and why

An xref in a UCS; `PlotStyleName` with a true colour or a named plot style table; the region box's
centroid against its centre; the types of LSR-40 onwards in the seven other languages beyond the
inquiry/p4xx replay (run in the execution with `--lang-only` where a new key needs words).

## 10. Refuted in the adversarial pass

- The spline lengths (p406, p428, p429, p113: 33.4024 against 33.3951 for a rational one too), the
  open curve-fit area (p409), the dimensions' text positions and `associative: yes`, DIMANGULAR's
  two-line form: already in LIST's Missing.
- list/p209's Spanish `PORCAPA` and p227's Spanish slip: the probes', not LIST's (the Spanish
  acad.lin has no DASHED; the Spanish -INSERT asked no value).
- p213's pyramid rotation under the console's fixed cursor; the harness's LUPREC 2 default (UNITS'
  area).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

Not holding: LIST's "per-object linetype scale … what no model here holds" (LSR-02), "a table's
position … in the WCS" (LSR-42), "Bounding Box … in the UCS" off the plane (LSR-41), "word for
word" outside en, es and fr (LSK); CHPROP's prompt lists and its Truecolor Missing (CHP-02); the
roadmap's ltScale (CHP-03). Every **unverified** item of LIST's Missing was probed: a hatch off the
UCS's plane, an ATTDEF's extrusion line, a fitted polyline's thickness, a closed spline-fit one's
order, a 3D polyline's Spline, a closed spline in no plane, an open heavy polyline's last widths,
a clockwise ring, a path array's Divide spacing, the rows (known) — each now holds or is a
finding; CHPROP's one (the desktop's set while asking) holds (d01). Rules checked: `cad-tools.md`
(`Select objects:`, transparency, LASTPOINT), `cad-catalogs.md` (messages, `promptKeywords`),
`cad-engine.md` (Z and the normal): no rule broken.

The catalog sweep (`catalog-sweep.mjs --from`) for both commands in the nine languages: no
`lang-2027`, `en-2027`; CHPROP's `lang-differs` and `lang-several` are each prompt's
(`valueMustBeNonzero` from a distance, p08); LIST's 230 `no-source` are its columns, settled by the
replay.

## 12. Order of execution

1. **CHP** (CHP-01 to CHP-04): the catalogs' select in 10 languages, tests, coverage, roadmap.
   Small.
2. **LSR** (LSR-01 to LSR-06, LSR-40 to LSR-45): `listReport.ts`, its new keys in every language
   from p100, p101, p112 run with `--lang-only`, `list.test.ts`, coverage.
3. **LSK** (LSK-01 to LSK-03), after LSR so the new keys are swept too: each language's report keys
   from its transcripts, the replay committed with its lines inline.

## 13. Coverage, rules, catalogs and roadmap

`docs/coverage/inquiry.md` LIST (the findings, every unverified item settled, LSR-06, LSR-40,
LSR-44, LSR-45 in Missing), `docs/coverage/properties.md` CHPROP (CHP-01, CHP-02, d01 verified,
d02's `COlorbook` listed on the desktop), the roadmap (review 32 `done` with the area it owns,
CHP-03), the ten catalogs.

## 14. Template improvements

- From a worktree, `research/` is a link into the main tree: a scratch test there runs the main
  tree's code and an isolated session cannot write it. Keep scratch tests in a gitignored folder of
  the worktree (out/review, with its own vitest config): annex-probes.md §5.
- A language's report replayed through the harness from the probes run in it (`--select`) finds
  padding and wording that `console-pair.mjs` pools away (its keys of one English share their
  console lines): annex-catalogs.md §1.
- A `com send` that leaves a prompt open still lets `shot` capture: a command's look mid-run needs
  the mouse only for the keys that end it (d01): annex-probes.md §4.
