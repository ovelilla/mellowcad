# Solid inquiry review (MASSPROP; VSCURRENT's Hidden and Conceptual)

> **Status:** console blocks executed, 2026-11-05 (MSP, VSC, VST: §15); block VSD, the visual
> styles' look on the desktop with the owner's mouse, is next, in a session of its own. Phases 0–3
> in one session with three subagents; a COM-only desktop check (d01) settled the two findings the
> console alone could not.

## 1. Summary

**Findings:** 0 critical, 1 high, 6 medium, 8 low.

| Block | What                                         | Critical | High | Medium | Low |
| ----- | -------------------------------------------- | -------- | ---- | ------ | --- |
| MSP   | MASSPROP                                     | 0        | 1    | 1      | 3   |
| VSC   | VSCURRENT, the command                       | 0        | 0    | 3      | 2   |
| VST   | the visual styles (the area), console side   | 0        | 0    | 2      | 3   |
| VSD   | the visual styles' look, desktop (to come)   | –        | –    | –      | –   |

The worst:

- **MASSPROP measures a preselection** that AutoCAD drops, asking `Select objects:` (MSP-02;
  console p124 with LIST and MOVE as controls, desktop d01).
- **`Regenerating model.` is said where AutoCAD is silent and silent where it speaks**: every view
  command in Hidden or Conceptual says it here, and U, UNDO and REDO back to 2D Wireframe do not
  (VSC-01, VSC-02; p205–p207, p219, p220, d01).
- **A click over a hidden edge takes the solid behind** in Hidden and Conceptual; AutoCAD takes
  the one in front (VST-02, p314).

## 2. Inventory

Commit `9c242015`; AutoCAD 2027 (ACADVER 26.0, X.118.0.0); the tables of 2026-10-31.

**MASSPROP** — `cad/application/tools/MassPropTool.ts` (on `SelectionActionTool`, `listReport`'s
`newestFirst`), `cad/domain/massProperties.ts`, `cad/geometry/massProperties.ts` (`brepMoments`,
`faceFlux`, `jacobiEigen`), `cad/geometry/solids.ts` (`brepBox`); registration in
`runtimeTools.ts`; catalogs `massprop`, `MASSPROP` names (no pgp alias in en, es or pt-BR),
keywords Yes/No, prompt `massPropWriteFile`, messages `massProp*` in en, es, pt-BR, ar; the file
port `ctx.writeFile` (`ports.ts`, `browserFileTransport.ts`); the rail excludes it
(`tool-rail.tsx:390`; acad.cuix: `ID_Massprop` is the Inquiry toolbar's and the Tools menu's, no
ribbon button); `content/commands.ts` (inquiry); tests `massProp.test.ts`,
`cad/geometry/massProperties.test.ts`, the English surface walk; coverage
`docs/coverage/inquiry.md` MASSPROP.

**VSCURRENT** — `cad/application/tools/VsCurrentTool.ts`, `UpdateSettingsCommand`,
`DocumentSettings.visualStyle` (`cad/domain/units.ts`), its file field (`drawingFile.ts`);
catalogs `vscurrent`, names VSCURRENT / VS, es ESTVISACTUAL / EVA, pt-BR EVATUAL / EVA (each pgp's
alias), prompt `vscurrentOption` and the three names; the rail excludes it (`tool-rail.tsx:420`;
acad.cuix's menus run `^C^C_vscurrent _H`…, the ribbon's Visual Styles gallery is the 3D
Modeling workspace's and the Visualize tab's); tests `visualStyles.test.ts`; coverage
`docs/coverage/view.md` VSCURRENT.

**The visual styles (the area this review owns)** — `SceneBuilder.ts` (the `visualStyle` path,
`solidViewEntities`, `shadedCells`, colour 7 edges), `cad/geometry/hiddenLines.ts`,
`cad/geometry/faceMesh.ts`, `cad/application/shading.ts`, the presenters (canvas, SVG); the tools
that read it (`SelectTool.ts:926`, `EdgeBlendTool.ts`, `SolideditTool.ts`); picking
(`viewPick.ts`); rules `cad-scene.md` (Hidden's lines from the line of sight alone: holds).

**Related:** SHADEMODE, -VISUALSTYLES, HIDE (Missing); the view commands' regeneration (View
review's area: cited); `Select objects:` (ERASE review: contract only); the solids and their
composites (3D primitives, Regions, Sweeps, Solid edits reviews: cited).

**Areas:** owns the visual styles. Cites the LINE review (command line, transparency, undo), ERASE
(`Select objects:`, preselection), View (regeneration, -VIEW), 3D primitives (the solid object),
Regions (booleans), Sweeps, Solid edits (SLC-03's dropped preselection, SED-06's LASTPOINT).

## 3. Probes

Inputs in `scripts/research/probes/solid-inquiry/`; transcripts and plots in
`research/probes/solid-inquiry/` (gitignored). es-ES and en-US unless marked; earlier evidence:
`solid/m01–m10`, `region/b02`, `visualstyle/v01–v06, p01–p06`.

| Id        | What it asks                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------- |
| p100      | `_.MASSPROP`, Enter's repeat, `'MASSPROP` at LINE's prompt                                     |
| p101–p102 | PROPFIS with bare `S`/`N` (es only), PROPMASS (pt-BR only)                                     |
| p103      | at `Write analysis`: `_C`, `_LINE`, `'_ZOOM _E`, `'ORTHOMODE`, `'_-OSNAP`                      |
| p104–p105 | U and REDO after a run and after runs that reported nothing; UNDO 2 (untraced)                 |
| p106      | what a run leaves: `(ssget "_I")`, AREA, PERIMETER, LASTPOINT after a typed pick               |
| p107–p111 | sets: solid + line + region; a block reference; an array; a surface; ALL on an off layer      |
| p112–p116 | composites: UNION, crossed cylinders, tapered EXTRUDE, REVOLVE 270, FILLETEDGE, SLICE, SOLIDEDIT |
| p118–p119 | the box of a tilted torus and cone, in the UCS and the WCS                                     |
| p120–p121 | regions: a hole, an ellipse, the InSpace form, the ignored count, in pt-BR too                 |
| p122–p123 | LUNITS 5 and 3; a box at 1e6, a box of 0.001                                                    |
| p124      | a preselection: LIST, MASSPROP, MOVE, AREA in one run                                          |
| p125–p126 | redone cells: sphere subtracted, a region with a hole, a spline region (p117's flawed input)   |
| p200–p204 | VSCURRENT's names in three languages, the prompt traced, refusals, local and hidden keywords   |
| p205–p207 | U, UNDO 2, MREDO, REDO across styles and `Regenerating model.` (untraced)                      |
| p208–p211 | preselection, the variables, SAVEAS and reopening (`p211` run by hand with `-i`)               |
| p212–p218 | `-VIEW _S` / `_R` and the style; `'VSCURRENT`; a preselection                                  |
| p219–p222 | view commands in Hidden and their echo; `'ZOOM` in Hidden; es OCULTO3D, pt 3DOCULTO           |
| p300–p305 | plots: every object kind in 2D Wireframe, Hidden, Conceptual (es)                              |
| p306–p308 | plots: a filleted box, sphere, torus, cylinder, cone in Hidden (SW Iso, Top) and Conceptual   |
| p309–p312 | plots: off, frozen and locked layers; colours and a lineweight                                 |
| p313–p314 | `ID _END` at a hidden vertex; `SELECT` over a hidden edge, in the three styles                 |
| p315–p316 | plots: a line under a circle, a region, a wide polyline and a thickness wall                   |
| d01       | desktop through COM only: REGEN, -VIEW, ZOOM in Hidden; MASSPROP after a preselection          |

## 4. Matrix

### MSP — MASSPROP

| Row | Cell                                                                  | State                                                  |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| A   | PROPFIS, PROPMASS; no alias                                           | match · p101, p102 · massProp.test.ts:261, :272        |
| A   | `_.MASSPROP`                                                          | known · p100 · command-line.md (the `.` prefix)        |
| A   | Enter's repeat; `'MASSPROP` refused                                   | untested · p100                                        |
| A   | rail, ribbon                                                          | match · acad.cuix `ID_Massprop` · tool-rail.tsx:390    |
| B   | `Select objects:`                                                     | owned (ERASE) · SelectionActionTool                    |
| B   | Preselection                                                          | differs MSP-02 · p124, d01                             |
| B   | `Write analysis`: keywords, `<N>`, AllowNone, FOO                     | match · m06, trace · massProp.test.ts:208              |
| B   | bare `S`/`N` (es, pt), `_C`, `_LINE`                                  | untested · p101–p103                                   |
| E   | `'_ZOOM`, `'ORTHOMODE`, `'_-OSNAP` at `Write analysis`                | untested · p103                                        |
| F   | U's echo; REDO; U after an empty run; UNDO 2                          | match / untested · p104, p105 · massProp.test.ts:252   |
| G   | Enter, No, Yes end it                                                 | match · m06 · :208; Escape, right button: VSD          |
| H   | leaves no selection; AREA, PERIMETER untouched                        | match · p106                                           |
| H   | solid + line + region; block reference and array refused; off layer   | untested · p107–p109, p111                             |
| H   | surfaces                                                              | n/a · p110 (no surfaces here: EXTRUDE's Missing)       |
| H   | composites and derived solids                                         | untested (match) · p112–p116, p125; MSP-03             |
| H   | PRESSPULL's solid                                                     | unverified · the console cannot pick (SLP-03)          |
| H   | principal axes with two equal moments                                 | differs MSP-01 · p114                                  |
| H   | tilted torus' and cone's box, tight                                   | untested · p118, p119                                  |
| H   | regions: hole, ellipse, spline, InSpace, ignored                      | match / untested · p120, p121, p125, p126 · :137, :164 |
| H   | LUNITS 5 decimals; LUNITS 3's units                                   | untested · p122; known (Missing)                       |
| H   | a body at 1e6                                                         | differs MSP-04 · p123                                  |
| K   | catalogs (sweep `--from`, es and pt-BR consoles)                      | match · p107, p121                                     |
| L   | the history line by line                                              | match · m05–m10, p107                                  |
| N   | tests                                                                 | MSP-05                                                 |

### VSC — VSCURRENT

| Row | Cell                                                                  | State                                             |
| --- | --------------------------------------------------------------------- | ------------------------------------------------- |
| A   | names and aliases in three languages                                  | match · p200 · visualStyles.test.ts:42, :97       |
| A   | `_.VSCURRENT`                                                         | known · p200 · command-line.md                    |
| A   | `'VSCURRENT` refused, then the prompt again                           | match · p213 · :77 (first line only, VSC-05)      |
| A   | rail                                                                  | known · viewport controls' style menu (view.md)   |
| B   | prompt, capitals, `<…>` after each style, AllowNone, Enter            | match · p200, p201 · :42, :97                     |
| B   | local letters and global forms                                        | match · p203, p204                                |
| B   | hidden `3DHIDDEN` (es OCULTO3D, pt 3DOCULTO)                          | differs VSC-03 · p204, p222                       |
| B   | FOO, `0`, `_ON`, `_LINE`                                              | match · p202                                      |
| E   | `'ORTHOMODE`, `'_ZOOM _E` at its prompt                               | match / owned (View) · p202, p221                 |
| F   | each run a named step, Enter's too; UNDO 2, MREDO, REDO               | match · p205–p207                                 |
| F   | `Regenerating model.` on U, UNDO, REDO to 2D Wireframe                | differs VSC-01 · p205–p207                        |
| G   | another command typed; Escape, right button                          | match · p202; VSD                                 |
| H   | a preselection dropped                                                | match · p216 (untested)                           |
| H   | VSCURRENT, SHADEMODE as variables: `Unknown variable name.`           | match · p209                                      |
| H   | view commands in Hidden and Conceptual                                | differs VSC-02 · p219, p220, d01                  |
| J   | saved, reopened as `<Hidden>`; a new drawing in 2D Wireframe          | match · p210, p211 · :86 (the serializer only)    |
| J   | `-VIEW _R` restores the view's style                                  | known + VSC-04 · p212, p214, p217, p218           |
| K   | catalogs                                                              | match · sweep; p200–p203                          |
| L   | history                                                               | match but VSC-01, VSC-02                          |
| N   | tests                                                                 | VSC-05                                            |

### VST — the visual styles, console side

| Row | Cell                                                                      | State                                                 |
| --- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| H   | lines, curves, text, MTEXT, hatch, dimension: unchanged, their colours    | untested (match) · p301, p302                         |
| H   | region in Hidden                                                          | match · p301                                          |
| H   | region, wide polyline, thickness in Conceptual: shaded faces              | differs VST-01 · p302, p316                           |
| H   | primitives: Hidden's edges, no isolines; Conceptual's faces, colour 7     | match · p305, p306 · hiddenLines.test.ts:79, :163     |
| H   | a fillet's tangent edges                                                  | untested (match) · p306                               |
| H   | Hidden in plan (cylinder, cone, sphere, torus)                            | untested (match) · p307                               |
| H   | a block reference's solid                                                 | known · p304, p305                                    |
| H   | an associative array's solids                                             | differs (docs) VST-04 · p304, p305                    |
| H   | swept, composite, blended, sliced solids                                  | match · p304, p305 · hiddenLines.test.ts              |
| H   | interpenetrating solids: no intersection line                             | match · visualstyle/p02                               |
| H   | a solid on an off layer: neither drawn nor hiding                         | untested (match) · p309; settles Missing's unverified |
| H   | frozen                                                                    | n/a (no Freeze; SINQ-D63)                             |
| H   | locked: Hidden's edges faded                                              | match · p309                                          |
| H   | locked: Conceptual's faces                                                | differs VST-03 · p310                                 |
| H   | colours in Conceptual and Hidden                                          | match / known (tints) · p311, p312                    |
| M   | lineweight on Hidden's edges                                              | unverified · p312 (plot scale): VSD                   |
| D   | Endpoint at a hidden vertex                                               | untested (match) · p313                               |
| O   | a pick over a hidden edge                                                 | differs VST-02 · p314                                 |
| O   | Missing's "what hides lines": circles                                     | differs (docs) VST-04 · p315                          |
| N   | tests                                                                     | VST-05                                                |

Rows I, P, Q and the keys of G are block VSD's (§12).

## 5. Findings

### High

#### MSP-02 — MASSPROP measures a preselection; AutoCAD drops it and asks `Select objects:`

- **Severity:** high · **Row:** B (contract with `Select objects:`) · **Status:** verified
- **Where:** `MassPropTool.ts` (SelectionActionTool's preselection path).
- **AutoCAD:** p124 (es-ES, en-US): `(sssetfirst nil (ssget "_X"))` then LIST `1 found`, MOVE
  `1 found` (controls, same run); MASSPROP `Select objects:`, Enter `Nothing selected.`; p106:
  `(ssget "_I")` nil after. d01 (desktop, COM): LIST `1 encontrados`, MASSPROP `Designe objetos:` /
  `No se ha designado nada.`.
- **mellowcad:** `MASSPROP` / `1 found` / the report (massProp.test.ts:242, which cites no probe).
- **Scenario:** a solid selected, MASSPROP typed → mellowcad reports at once → AutoCAD asks for the
  objects → a user's Enter there reads `Nothing selected.`.
- **Fix:** drop the preselection at the start, as SLICE does (SLC-03). **Regression test:**
  massProp.test.ts:242 rewritten to p124. **Coverage:** inquiry.md's "a preselection measured at
  once" becomes "a preselection dropped (p124, d01)".

### Medium

#### MSP-01 — Two equal diagonal moments: the principal axes in the reverse order and sign

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `cad/geometry/massProperties.ts`, `jacobiEigen`'s rotation (`theta`).
- **AutoCAD:** p114, REVOLVE of 5,0–8,4 about the Y axis by 270°: `I: 5484.1888 along [0.7071
  0.0000 -0.7071]` … `K: 10403.9395 along [0.7071 0.0000 0.7071]`.
- **mellowcad:** `I: 10403.9395 along [0.7071 0.0000 0.7071]` … `K: 5484.1888 along [-0.7071
  0.0000 0.7071]`: Izz − Ixx is −3.6e-12, so `theta < 0`; AutoCAD reads the difference as 0.
- **Fix:** a difference within the noise is 0 in the rotation (SINQ-D1). **Tests:** p114 in
  massProp.test.ts; an equal diagonal with a positive off-diagonal in
  `cad/geometry/massProperties.test.ts`.

#### VSC-01 — U, UNDO and REDO back to 2D Wireframe do not say `Regenerating model.`

- **Severity:** medium · **Row:** F, L · **Status:** verified
- **Where:** `VsCurrentTool.ts` (`ctx.regenerate("once")` in the run only).
- **AutoCAD:** p205 `U` → `VSCURRENT Regenerating model.` (from Hidden to 2D); p206 `UNDO 2` →
  `VSCURRENT VSCURRENT Regenerating model.`; p207 REDO to 2D → `VSCURRENT` /
  `Everything has been redone` / `Regenerating model.`; U or MREDO to Hidden or Conceptual: silent.
- **mellowcad:** silent on every U, UNDO and REDO.
- **Fix:** SINQ-D30. **Coverage:** view.md's "its U does not (v02, v06)" and the tool's comment
  are wrong.

#### VSC-02 — In Hidden and Conceptual the view commands say `Regenerating model.`; AutoCAD does not

- **Severity:** medium · **Row:** H, L · **Status:** verified (console p219, p220; desktop d01)
- **AutoCAD:** in Hidden or Conceptual, `-VIEW _SWISO`, `_TOP`, PLAN, ZOOM E, REGEN, `-VPOINT`
  and their U and REDO write nothing; in 2D Wireframe `-VIEW _SWISO` says it (p214, d01).
- **mellowcad:** each says `Regenerating model.`, `-VPOINT`'s U too.
- **Fix:** SINQ-D30.

#### VSC-03 — Hidden's hidden keyword is refused

- **Severity:** medium · **Row:** B · **Status:** verified
- **AutoCAD:** the initget declares `3DHIDDEN` (es `OCULTO3D`, pt-BR `3DOCULTO`), not listed;
  each sets Hidden (p204, p222). `3DWIREFRAME`/`3` (Wireframe) and `EDGES` (Shaded with edges) are
  hidden too, for styles not built.
- **mellowcad:** `Invalid option keyword.` (es `Opción no válida.`, pt `Opção inválida.`).
- **Fix:** a hidden option `3DHIDDEN` → Hidden in the three catalogs (SINQ-D31); the coverage
  names the other two as refused with their styles.

#### VST-01 — Conceptual shades regions, wide polylines and objects with thickness

- **Severity:** medium · **Row:** H, M · **Status:** verified
- **Where:** `SceneBuilder.ts`: `shadedCells` takes solids only, the colour 7 edges `solid3d` only.
- **AutoCAD:** p302: a colour 5 region filled 82,105,177 with black edges; a white wide polyline
  filled 130,130,133; p316: a region, the wide polyline and a thickness circle shaded (a tube); a
  plain circle unfilled.
- **mellowcad:** their lines alone, the same in every style.
- **Fix:** none now (SINQ-D60): shading them needs them hiding too (Hidden's face set and the
  painter's), which is the Missing's gap; the Missing line grows to say they are shaded and their
  edges turn colour 7. **Alternative:** regions as planar faces in both now.

#### VST-02 — In Hidden and Conceptual a click over a hidden edge takes the solid behind

- **Severity:** medium · **Row:** O, P · **Status:** verified (console; the mouse in VSD)
- **Where:** picking reads no visual style (`viewPick.ts`, the selection's pick); only Ctrl+click
  does (`SelectTool.ts:926`).
- **AutoCAD:** p314: box A in front of box B, SW Iso; `SELECT 17,15,0` on B's edge hidden by A:
  2D Wireframe takes B, Hidden and Conceptual take A.
- **mellowcad:** B in every style.
- **Fix:** off 2D Wireframe the pick and the rollover test only what the scene draws
  (`solidLines`); the snaps keep every edge (p313) (SINQ-D61). A click on a face stays in Missing.
  **Test:** p314 in visualStyles.test.ts.

### Low

#### MSP-03 — The Missing says boolean solids are not measured; they are, as AutoCAD measures them

- **Severity:** low · **Row:** O · **Status:** verified (p112, p113, p125)
- **Fix:** the clause goes; Implemented names the composites and derived solids measured (p112–p116,
  p125). **Tests:** p112, p113 (the degenerate axes left out), p114's taper, p115, p116 pinned.

#### MSP-04 — A body at 1e6: AutoCAD writes `-1.0000E+15` and loses digits

- **Severity:** low · **Row:** L · **Status:** verified (p123), the rule unsettled
- **AutoCAD:** `X: 1000020000141667`, `XY: -1.0000E+15`, a principal moment `35416.7500` (exact
  35416.6667). **mellowcad:** every digit, exact.
- **Fix:** Missing (SINQ-D3).

#### MSP-05 — Tests and citations

- **Severity:** low · **Row:** N
- massProp.test.ts:242 asserts what p124 refutes; :252 cites no probe (p104); :234 is the
  platform's case (say so); no test holds the untested cells of the MSP matrix;
  `cad/geometry/massProperties.test.ts`' Jacobi block lacks MSP-01's case.

#### VSC-04 — The saved views' Missing omits their visual style

- **Severity:** low · **Row:** J · **Status:** verified
- **AutoCAD:** `-VIEW _R` restores the style saved with the view (p212, p218); from 2D Wireframe it
  did not (p214, p217: **unverified**, maybe the console's). **Fix:** one line in -VIEW's Missing
  (SINQ-D32).

#### VSC-05 — visualStyles.test.ts' command tests

- **Severity:** low · **Row:** N
- :67's `.slice(0, 2)` hides a missing line and its title states VSC-01's wrong claim; :77 checks
  the first line only (p213); :86 tests the serializer alone (p211's `<Hidden>` on reopening);
  untested: es's refusal (p202), Enter's step (p205), the dropped preselection (p216).

#### VST-03 — A locked solid's faces are not faded in Conceptual

- **Severity:** low · **Row:** M, Q · **Status:** verified on the plot (p310)
- **AutoCAD:** the locked box's faces 184,185,137 / 167,170,139 / 99,108,150 against 130,130,133 /
  122,122,127 / 85,85,101 unlocked; edges 127 grey. **mellowcad:** the fills unchanged, the edges
  at 0.5.
- **Fix:** fade the shaded cells as the edges are (SINQ-D62); VSD reads the screen's factor.

#### VST-04 — Three claims of VSCURRENT's Missing

- **Severity:** low · **Row:** O · **Status:** verified
- A plain circle does not hide (p315): "circles" goes, "a circle with thickness" stays. A solid on
  an off layer neither shows nor hides, as here (p309): out of **unverified**, into Implemented.
  Associative arrays of solids draw in 2D Wireframe here too, with block references (p304, p305).

#### VST-05 — Matched cells no test holds

- **Severity:** low · **Row:** N
- Untested: p309, p302's colours, p306's tangent edges, p307's plan, p313's hidden Endpoint.
  `visualStyles.test.ts:58` counts segments minus 3 (pin the nine edges); `:117` snapshots its own
  output; `hiddenLines.test.ts`' cylinder, sphere and torus can cite p306, p307.

## 6. Decisions

- **SINQ-D1** — MSP-01: a diagonal difference within the noise is 0 in Jacobi's rotation; equal
  moments with a zero off-diagonal are unchanged.
- **SINQ-D2** — MSP-02: MASSPROP drops a preselection at its start, as SLICE (SLC-03); d01 settled
  the desktop, so it is executed without waiting for VSD.
- **SINQ-D3** — MSP-04: E notation and ACIS' lost digits go to Missing, not reproduced.
- **SINQ-D4** — LUNITS 3's forms (`in`, `sq in`, `cu in`, `lb`, `lb sq in`, `sq in sq in`,
  `Principal moments (lb sq in) and …`, p122) are quoted in Missing; LUNITS 5's decimals get a test.
- **SINQ-D30** — `Regenerating model.` is said, by the run and by U, UNDO and REDO, only when the
  style after the step is 2D Wireframe; in Hidden or Conceptual nothing that regenerates says it.
  One rule covers p205–p207, p214, p219, p220 and d01.
- **SINQ-D31** — `3DHIDDEN` becomes Hidden's hidden keyword; `3DWIREFRAME` and `EDGES` stay
  refused, named in the coverage.
- **SINQ-D32** — the views' style goes to -VIEW's Missing, the case from 2D Wireframe
  **unverified**.
- **SINQ-D33** — VSC-02 needed the desktop: d01 confirmed it; executed with VSC-01.
- **SINQ-D60** — VST-01 is recorded, not built (see the finding).
- **SINQ-D61** — VST-02: picks and rollover off 2D Wireframe read the drawn stretches; snaps
  unchanged (p313).
- **SINQ-D62** — VST-03: faces of a locked solid fade by the edges' factor now; VSD may correct
  the value.
- **SINQ-D63** — frozen layers are n/a: the model has on and off only.

## 7. Tests proposed

- **massProp.test.ts:** MSP-02 (p124), MSP-01 (p114), MSP-03's composites (p112, p113, p115,
  p116), p100 (repeat, `'MASSPROP`), p101–p103 (bare letters, `_C`, `_LINE`, transparent
  commands), p104–p105 (REDO, U after an empty run, UNDO 2), p107–p109, p111 (sets), p118–p119
  (boxes), p122 (LUNITS 5); :252 cites p104.
- **cad/geometry/massProperties.test.ts:** an equal diagonal with an off-diagonal (MSP-01).
- **visualStyles.test.ts:** VSC-01 (p205–p207), VSC-02 (p219, p220), VSC-03 (p204, p222), :67,
  :77, :86 tightened, p202 es, p216; VST-02 (p314), VST-03 (p310), VST-05's cells (p302, p306,
  p307, p309, p313); :58 pins the nine edges.

## 8. Not tested, and why

The look (Gooch's colours beyond p03, silhouettes, faceting), the canvas against the SVG presenter
beyond `:117`, and what dynamic input shows: block VSD.

## 9. Not reviewed, and why

PRESSPULL's solid in MASSPROP (the console cannot pick, SLP-03); surfaces (none here); the TEXTSCR
window, Escape and the right button at `Write analysis`, a click at `Select objects:` off the plan
(SED-06's suspect): VSD; `Regen queued.` after a transparent regeneration in a 3D style (not
probed); pt-BR's `Opção inválida.` at VSCURRENT (the shared key).

## 10. Refuted

- **MASSPROP of a box of 0.001** (p123): AutoCAD's centroid 0 and tilted axes come from ACIS'
  resolution; the exact values stay.
- **Degenerate principal pairs** (p113, p119, p125) and **ACIS' last digit** (p114's taper): known.
- **EXTRUDE refuses MOde and a line** (subagents' suspect from p110, p303): MOde is built
  (draw.md's EXTRUDE), surfaces are its Missing.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim                                                         | Probe       | State                         |
| ------------------------------------------------------------- | ----------- | ----------------------------- |
| inquiry.md: "a preselection measured at once"                 | p124, d01   | false (MSP-02)                |
| inquiry.md Missing: booleans not integrated                   | p112, p113  | no longer true (MSP-03)       |
| view.md: "back to 2D Wireframe … its U does not"              | p205–p207   | false (VSC-01)                |
| view.md Missing: circles hide                                 | p315        | false (VST-04)                |
| view.md Missing: an off layer's solid hiding, **unverified**  | p309        | settled (VST-04)              |
| view.md Missing: solids inside block references               | p304        | narrow (VST-04: arrays)       |
| `VsCurrentTool`'s comment: U does not say it                  | p205        | false (VSC-01)                |

Checked and holding: every other claim of both entries (m01–m10, v01–v06, p02, p03 and this
review's probes). `cad-scene.md`'s Hidden lines depend on the line of sight alone: holds
(`SceneBuilder.ts` passes the view direction only). No rule speaks of MASSPROP; none is needed.
No platform deviation is declared but MASSPROP's download (its `WHY` and coverage note hold).

## 12. Order of execution and estimate

1. **MSP** (MSP-01 to MSP-05): one subagent, about an hour; nothing blocks it.
2. **VSC** (VSC-01 to VSC-05): one subagent; shares visualStyles.test.ts with VST, so before it.
3. **VST** (VST-01 to VST-05): one subagent; VST-02 touches picking, the largest.
4. **VSD** (desktop, a session of its own with the owner's mouse), es-ES and en-US profiles:
   each style on the dark background (edge colour, 3 px silhouettes, tangent edges, faceting);
   the grid, UCS icon, ViewCube and crosshair in Hidden and Conceptual; rollover, selection,
   window preview and grips over shaded faces; a click on a face and over a hidden edge (VST-02 by
   mouse); Ctrl+click's highlight in Conceptual; the locked fade on screen (VST-03) and
   lineweights on edges; VST-01's objects; MASSPROP's TEXTSCR, Escape and the right button at
   `Write analysis`, its dynamic input chips; LASTPOINT after a click at `Select objects:` off the
   plan (SED-06's suspect). Its findings take the prefix VSD.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/inquiry.md` MASSPROP: MSP-02, MSP-03, MSP-04, SINQ-D4; the probes cited.
- `docs/coverage/view.md` VSCURRENT: VSC-01, VSC-02, VSC-03, VST-01, VST-02, VST-04; -VIEW's
  Missing: VSC-04.
- Catalogs: `3DHIDDEN` and its es and pt-BR words (hidden option), `npm run locales`.
- `cad-scene.md`: a line on what a pick reads off 2D Wireframe (VST-02), if the fix adds a reader.
- Roadmap: review 30 `plan`, then `done` with the visual styles owned, once VSD is executed.

## 14. Template improvements proposed

- **A COM-only desktop check inside a console session**: a console finding the console alone
  cannot settle (a history line, a preselection) is checked through COM with no mouse or keys, in
  minutes (d01), instead of waiting for the desktop session (annex-probes.md §4).
- **One Enter that answers either branch**: `com send "_MASSPROP\n\n"` ends both when the
  preselection is taken (Write analysis) and when it is not (`Select objects:`), so COM never
  locks on a probe whose branch is the question (annex-probes.md §4).
- **Forks as subagents**: a fork already holds the template, the inventory and the rules; its
  brief is the scope, the ranges and the cells (§4.8).
- **A render area's console eye**: plots As displayed read by their pixels against the scene's
  primitives settled most of VST before the desktop (annex-probes.md §2).

## 15. Execution

| Id     | What it was                                                                     | Commit   |
| ------ | ------------------------------------------------------------------------------- | -------- |
| MSP-01 | two equal moments' axes in the reverse order and sign                            | 860732aa |
| MSP-02 | MASSPROP measured a preselection AutoCAD drops                                   | 860732aa |
| MSP-03 | the Missing said booleans were not measured                                      | 860732aa |
| MSP-04 | a far body's E notation and lost digits (Missing)                                | 860732aa |
| MSP-05 | tests and citations                                                              | 860732aa |
| VSC-01 | U, UNDO and REDO back to 2D Wireframe were silent                                | f5877454 |
| VSC-02 | the view commands said `Regenerating model.` in Hidden and Conceptual            | f5877454 |
| VSC-03 | the hidden `3DHIDDEN` was refused                                                | f5877454 |
| VSC-04 | the saved views' style (-VIEW's Missing)                                         | f5877454 |
| VSC-05 | tests                                                                            | f5877454 |
| VST-01 | Conceptual's shaded regions, wide polylines and thickness (Missing)              | 414c8d1b |
| VST-02 | a click over a hidden edge took the solid behind                                 | 414c8d1b |
| VST-03 | a locked solid's faces not faded                                                 | 414c8d1b |
| VST-04 | three claims of the Missing                                                      | 414c8d1b |
| VST-05 | tests                                                                            | 414c8d1b |

- **VST-02 grew in the execution:** p314's click lands on the front box's face away from its edges,
  so reading the drawn edges alone (SINQ-D61) would have taken nothing; a solid off 2D Wireframe
  is now picked by the face nearest the viewer (`shadedSolidPick`), and "picking a solid by its
  faces" left the Missing. Its cost is a ray through every solid's faces per pointer move, with no
  box to skip the far ones: VSD watches the rollover on a heavy drawing.
- The template improvements of §14 are applied (annex-probes.md §2, §4; template §4.8).
