# View review (ZOOM, PAN, -PAN, PLAN, VPOINT, -VPOINT, VIEW, -VIEW, 3DORBIT, NAVVCUBE)

> **Status:** plan, 2026-10-27. The twenty-second review of `docs/coverage/roadmap.md`'s order, with
> skill `command-review`. Phases 0–4 were done in one session with console probes only. Blocks ZOM, VUN
> and VDR are executed in that same session. Block VWD (the ViewCube, the viewport controls, the
> navigation bar, the wheel, real-time PAN and 3DORBIT) needs the desktop and the owner's mouse, so it
> is planned here and probed in a session of its own.
>
> It owns **the view and its undo**. That covers which view runs are undo steps, how consecutive
> ZOOMs join, `Regenerating model.` on U and REDO, ZOOM Previous's list, and a transparent view
> change inside the command it ran in. Inquiry left nothing for it.

## Summary

There are no critical and no high findings: 16 medium and 12 low, in three console blocks, plus one
unverified (VDR-25) and a desktop block still to probe.

| Block | Prefix | Medium | Low |
| --- | --- | --- | --- |
| ZOOM | ZOM | 5 (ZOM-01, ZOM-02, ZOM-03, ZOM-05, ZOM-06) | 6 (ZOM-04, ZOM-07 to ZOM-11) |
| The view's undo | VUN | 4 (VUN-01 to VUN-04) | 2 (VUN-05, VUN-06) |
| PAN, PLAN, VPOINT, -VIEW, 3DORBIT, NAVVCUBE | PAN, VDR | 7 (PAN-01, VDR-01, VDR-03, VDR-04, VDR-20, VDR-21, VDR-23) | 4 (VDR-02, VDR-05, VDR-22, VDR-24) |
| Desktop | VWD | to probe | to probe |

The worst three:

- **A view command that changes nothing makes no undo step, so the next U takes back the command
  before it.** `ZOOM P` with no previous view, then U, erases the line drawn before it; AutoCAD's U
  takes back the empty ZOOM (VUN-01, p364, p366).
- **LINE's Undo keyword leaves a transparent `'ZOOM` made after its last segment.** AutoCAD takes
  the zoom back with the segment (VUN-04, p360).
- **`Regenerating model.` is said too often.** ZOOM Extents says it on every run, and U and REDO
  say it after every -VIEW, PLAN and ZOOM Extents step. In 2027, ZOOM Extents says nothing when it
  stays inside what was generated, and U says it only when the line of sight turns back (ZOM-06,
  VUN-02, VUN-03).

**Evidence:** 210 console probes in es-ES and en-US (p100–p169, p200–p269, p300–p369) on AutoCAD
2027 (ACADVER 26.0, X.118); the `acadres` tables of 2026-10-20; `acad.cuix`'s menu macros; the
installed `acad.pgp` of each language. There are 200 scratch tests in `research/review/view/{a,b,c}/`.

## Inventory

At commit `476904a`.

- **Tools:**
  - `cad/application/tools/ZoomTool.ts`, `PanTool.ts`, `DashPanTool.ts`, `PlanTool.ts`,
    `VPointTool.ts`, `ViewTool.ts`, `OrbitTool.ts`, `NavVCubeTool.ts`.
  - Helpers: `viewPresets.ts` (`lookFrom`, `fitExtents`, `VIEW_MENU`), `cad/application/orbit.ts`,
    `cad/application/Viewport.ts` (the camera and ZOOM Previous's list),
    `cad/application/commands/viewCommands.ts` (`ViewChangeCommand`).
  - The view's undo in `CadRuntime.ts`: `recordView`, `typedZoom`, `zoomCombines`,
    `commandStarts`, `regenerate`. The wheel, the wheel button and Shift+wheel button are in
    `CadRuntime.wheel`, `pointerDown`, `wheelButtonClick`.
  - The ViewCube: `viewCube.ts`, `runtimeViewCube.ts`.
- **Registration:** `runtimeTools.ts:164-174`, `CommandLine.ts:306-317` (`TOOL_COMMANDS`),
  `runtimeCommands.ts:35-58` (`TRANSPARENT_COMMANDS`: ZOOM, PAN, -PAN, -VIEW) and `:169-172`
  (-VPOINT, -VIEW).
- **Catalogs:** `cad/locales/{en,es,ar}.json`. Names are at `en.json:513-550`, keywords at
  `:902`, `:970-990`, and the prompts and messages are listed by the sweep below.
- **The object:** none. NAVVCUBEDISPLAY is a drawing setting (`domain/units.ts`,
  `serialization/drawingFile.ts`).
- **UI:**
  - `components/cad/navigation-bar.tsx` (Pan, the Zoom split button, Orbit),
    `components/cad/view-cube.tsx`, `components/cad/viewport-controls.tsx`.
  - The landing's filing is `content/commands.ts:118-136`.
  - acad.cuix's macros: Zoom Extents `'_zoom _e`, In `'_zoom 2x`, Out `'_zoom .5x`, Previous
    `'_zoom _p`, Window `'_zoom _w`, Realtime `'_zoom ;`, Pan `'_pan`, 3D Orbit `'_3dorbit`, the
    views `^C^C_-view _swiso`, Plan `^C^C_plan ;`, ViewCube Display `^C^C_navvcube _on`.
- **Tests:**
  - `cad/application/tools/view.test.ts`, `viewPrompts.test.ts`, `views.test.ts`,
    `viewMenu.test.ts`, `viewPointing.test.ts`.
  - `cad/application/viewUndo.test.ts`, `viewCube.test.ts`, `dashPan.test.ts`,
    `Viewport.test.ts`.
  - The view parts of `transparentCommands.test.ts`, `lastPoint.test.ts`, `undoEcho.test.ts`,
    `undoCommand.test.ts`, `mredoCommand.test.ts`, `englishSurface.test.ts` and
    `locale.test.ts`.
- **Knowledge:** `docs/coverage/view.md`; `command-line.md` and `spanish.md` where they cite views;
  rules `cad-tools.md` ("Ordering and undo"), `cad-runtime.md` ("The view", NAVVCUBE),
  `cad-catalogs.md`.
- **Related:** U, UNDO (Combine), REDO, MREDO after each; LINE as the host of `'ZOOM` and `'-PAN`;
  UCS (PLAN Ucs's names, -VIEW's aligned UCS); LASTPOINT; the preselection.
- **Areas cited:**
  - The command line, transparency, point input and undo: LINE review.
  - `Select objects:` and the preselection (ZOOM Object): ERASE review.
  - The UCS's own prompts: UCS review, next in order.
- **Left out:** LIMITS (not built). Several gaps follow from it (VIEW-D25, VIEW-D50).

## Probes

Inputs are in `scripts/research/probes/view/` (`.plain` untraced, `.es` / `.en` one locale), run
with `scripts/research/probe.sh view <ids>`. Transcripts are in `research/probes/view/`.
p201, p203 and p238 were rewritten after their first versions hung the console in real-time PAN
(VIEW-D24). The first versions' only evidence, that PAN hangs, is also in p200 and p202.

| Id | What it asks |
| --- | --- |
| p100–p103 | ZOOM: the view after Extents and the first prompt's trace; names, `_.`, repeat; `'_ZOOM` at Command:; Enter (real time) |
| p104–p116 | First prompt: `FOO`, `0`, `-2`, `2`, All, `2X`, `2XP`, `.5x`, `2 x`; Scale's `FOO`, `0`, Enter, `-2` |
| p117–p126 | Window: `FOO` and Enter at each corner, a zero window (Window and implied), `@`, polar, `@` alone, `*` in UCS Z 30, `#` |
| p127–p135 | Direct distance at the corners (the 2023 `acc/wn` cases); LASTPOINT after Window, after an implied window, after `@`, polar and a factor |
| p136–p142 | Empty drawing's All and Extents; window fit; Object; 13 Previous; Previous with none; Previous after Extents |
| p143–p152 | `'ZOOM` at LINE with Window, Scale and Previous, Object, a point; a preselection then Object, Extents, 2X, Window; Object's `FOO` and Enter |
| p153–p169 | Center and its refusals; Dynamic; zero width and zero height; `2` keeps the centre; All after a window and beyond the limits; the regeneration pattern; 31 views back; hidden Left and Vmax; a keyword after `FOO`; Enter after `FOO`; a point after `0`; `'_ZOOM` at a corner |
| p200–p203 | PAN's start message; `-E`, `PV`, `DDVPOINT` (es), `-P`, `DDVPOINT` (en); `'_PAN` at LINE; -VPOINT `0,0,0` |
| p204–p229 | -PAN: every point form, Enter at each prompt, `FOO`, LASTPOINT, `'_-PAN` at LINE; `'ZOOM`, `'PAN` and `'ORTHOMODE` at it; `_END`; Ortho; the preselection after -PAN, PLAN, -VPOINT and NAVVCUBE |
| p230–p242 | PLAN: its fit against ZOOM E; `FOO`; UCS Z 30 and X 90; World; Ucs `?`, a missing name, `FOO1`; the empty drawing; `'_PLAN`; `'ZOOM` and `'PAN` at it; PLANTA; LASTPOINT |
| p243–p261 | -VPOINT: its fit, `FOO`, `0,0,0`, `0,0,-1`, `0.01,0,-1`, Rotate's defaults in plan and off it, its refusals, `10,10`, VIEWDIR's sign and as typed, UCS Z 30, WORLDVIEW 0, Tripod, `'ZOOM` and `'PAN` at it, `'_-VPOINT`, the names |
| p262–p269 | NAVVCUBE: OFF and ON with NAVVCUBEDISPLAY, `FOO`, Enter, CUBE (es and en); LASTPOINT after ZOOM W and C, -VIEW and NAVVCUBE; `-ENCUADRE`, `E` |
| p300–p335 | -VIEW: the trace, `FOO`, Enter at each prompt, each preset, `_O _L`; sEttings, `?`, Save, Restore, Delete, Window, Categorize, lAyer, Ucs; `'_-VIEW`; the names (`-VISTA`, `VISTA`, `_VIEW`, `-V`, `V`, `-VI`); 3DORBIT; presets in UCS Z 30; Bottom's axes; the empty drawing |
| p336–p344 | (untraced) U, REDO, U, MREDO 1 and UNDO 2 after ZOOM 2X, ZOOM E, -PAN, PLAN in plan, -VPOINT, VPOINT, -VIEW SWISO, -VIEW FRONT, NAVVCUBE OFF |
| p345–p369 | (untraced; p353 traced) `[LINE][Z][Z]` UNDO 2; UNDO 2 over a joined pair; a U chain; ZOOMs after CIRCLE; VPOINT then PLAN; -VIEW TOP in Top; the UCS name after U; Combine No; the Combine prompt; -PAN twice; ZOOM and -PAN in each order; ZOOM, ID, ZOOM; `'_ZOOM` and `'_-PAN` in LINE; LINE's Undo after `'ZOOM`; `'_ZOOM` at Command:; Previous after U; Previous with none; Extents at the extents; -VIEW Enter; NAVVCUBE Enter; -PAN 0,0 Enter; SWISO twice |

## Matrix

A row that is the same at every prompt takes one cell. The scratch folders
`research/review/view/{a,b,c}/` are cited as `a/`, `b/`, `c/`.

### ZOOM

| Row | First prompt | Window's corners | Scale | Object's `Select objects:` |
| --- | --- | --- | --- | --- |
| A | match · p101, p102 · transparentCommands.test.ts:531, a/zoomInput:28; `_.ZOOM` known (command-line.md) | | | |
| B | match · p100, p104 · viewPrompts.test.ts:24; `0`, `-2` differ ZOM-03 · p105, p106; `2XP` differs ZOM-04 · p110; Enter (real time) known · p103; hidden Left and Vmax differ ZOM-10 (docs) · p163, p164 | `FOO`, Enter: match · p117–p119, p128, p129 · viewPrompts.test.ts:36; a zero window differs ZOM-02 · p120, p121, p156, p157 | `FOO` match · p113 · viewPrompts.test.ts:70; `0`, `-2` differ ZOM-03 · p114, p116; Enter untested · p115 | `FOO`, `L`, the count match · p151 · viewPrompts.test.ts:104; Enter untested · p152 |
| C | `x,y`, `@`, polar untested · p102, p133, p134 | every form untested · p122–p126 · a/zoomViews:75–109; direct distance match · p127–p130 · lastPoint.test.ts:789 | | |
| C LASTPOINT | set by a point: match · p129, p132 · lastPoint.test.ts:132; a factor leaves it: untested · p135 | corners leave it: match · p127, p131 · lastPoint.test.ts:128 | | |
| E | `'ZOOM` at LINE: match · p143, p144, line/p19, p112, p209, p210 · transparentCommands.test.ts:236; Object differs ZOM-01 · p145 | | | |
| F | owned below (VUN) | | | |
| H | `2` keeps the centre: differs ZOM-05 · p158; Extents' margin differs ZOM-09 · p100, p108; Previous's depth differs ZOM-08 · p162; `No previous view saved.` match · p141 | the window's fit untested · p138 | | Object's fit as Extents · p139 |
| Preselection | Object counts it: differs ZOM-07 · p147; every ZOOM drops the set: untested · p147–p150 | | | |
| K | match · p100 es, p113 es, p117 es; the sweep's `es-several` and `no-source` keys are confirmed by the console | | | |
| L | `Regenerating model.` after Extents and All differs ZOM-06 · p100, p108, p161; after Object and Previous match · p139, p142 | | | |
| G, M, P, Q | desktop (VWD) | | | |

### PAN and -PAN

| Row | PAN | -PAN's base point | -PAN's second point |
| --- | --- | --- | --- |
| A | match · p200, p269 · transparentCommands.test.ts:642 | `-P`, `-E` differ PAN-01 · p201; `-ENCUADRE` match · p269 · dashPan.test.ts:141 | |
| B, L | the start message match · p200, p202 | Enter, `FOO` match · p206, p207 · dashPan.test.ts:48 | `FOO` untested · p219 |
| C | n/a | every form match or untested · p204–p218 · dashPan.test.ts:65, :76, b/dashPan | bare number from the base untested · p217 |
| C LASTPOINT | n/a | never moved: match · p204–p218 · dashPan.test.ts:65 | |
| D | n/a | `_END` untested · p224 | a typed point unbent by Ortho: untested · p225 |
| E | `'_PAN` at LINE match · p202 · transparentCommands.test.ts:264 | `'ZOOM E` refused, `'PAN` runs: untested · p221, p222; `'ORTHOMODE` known | |
| G | Enter, Escape, `FOO`: desktop (the console hangs, p200) | | |
| Preselection | | dropped: untested · p226 | |

### PLAN, VPOINT, NAVVCUBE

| Row | PLAN | -VPOINT's view point | Rotate's angles | NAVVCUBE |
| --- | --- | --- | --- | --- |
| A | PLANTA match · p241; `'_PLAN` refused match · p239 · transparentCommands.test.ts:160 | `-VP`, `VP`, `-PTOVISTA`, `-PV`, `PTOVISTA` match · p259, p260; es `PV` and `DDVPOINT` differ VDR-04 · p201 | | `CUBE` en match · p266; es `CUBE` differs VDR-04 · p265 |
| B | trace, `FOO`, Ucs `?`, Enter match · p230, p231, p235, p236 · locale.test.ts:932; es not-found differs VDR-02 · p236 | `FOO` match · p244 · viewPrompts.test.ts:185; `0,0,0` differs VDR-01 · p203, p245; Tripod known · p256 | defaults, `FOO`, `10,10`, `-30` match · p248–p251 | `[ON/OFF]` (Settings known), the default follows the state, `FOO`, Enter match · p262–p264 |
| H | fit, twist, UCS kept in Z 30 and X 90: match · p230, p232–p234, p237; empty drawing frames LIMITS: n/a (VIEW-D25) | fit and twist 0 match · p243, p246, p247 · views.test.ts:119; VIEWDIR as typed known · p254; WORLDVIEW 0 known · p255 | regeneration after the defaults known · p248, p249 | NAVVCUBEDISPLAY 1 when off: VDR-05 · p262 |
| L | match · p230 | the report in a turned UCS differs VDR-03 · p253; no `-0.0000` · p252 · b/negzero | | |
| C LASTPOINT | kept: match · p241, p242 · lastPoint.test.ts:464 | kept · p242 | | n/a |
| Preselection | dropped · p227 | dropped · p228 | | dropped · p229 |

### -VIEW, VIEW, 3DORBIT

| Row | -VIEW's first prompt | Orthographic's prompt | 3DORBIT |
| --- | --- | --- | --- |
| A | `-VIEW`, `-VISTA` match · p300, p325 · viewPrompts.test.ts:140, :171; `-V` untested · p327; es `-VI`, `VI` differ VDR-20 · p335; VIEW unknown to the console, known · p326 | | en names untested; es `3DO`, `ORBIT` differ VDR-20 |
| B | trace, hidden presets, `FOO` match · p300, p301 · viewPrompts.test.ts:141, :156; hidden Categorize, lAyer, Ucs and the named-view prompts not in Missing: VDR-23 · p315–p323 | text, `<Top>`, `FOO`, Enter = Top match · p300, p303 · views.test.ts:106 | start message differs VDR-21 · p329 |
| E | `'_-VIEW` refused for a view: match · p324, p334 · transparentCommands.test.ts:128 | | `'_3dorbit` in acad.cuix: VDR-25 (desktop) |
| H | VIEWDIR, twist, aligned UCS and its name in both languages, Bottom's X, an iso view leaving the UCS: untested match · p304–p313, p330–p332 · views.test.ts:119, c/dashView:40–73; the empty drawing frames LIMITS: VDR-24 · p333 | | desktop |
| L | the menu's echo `_SWiso` against `_swiso`: VDR-22 (desktop) | | |

### The view's undo (owned)

| Command | U's echo | `Regenerating model.` after U | REDO, MREDO | Joined with |
| --- | --- | --- | --- | --- |
| ZOOM 2X | match · p336 · viewUndo.test.ts:36 | none · match | match · p336 | consecutive ZOOMs: match · p347, p348, p357 · viewUndo.test.ts:47, :76; CIRCLE, ID and -PAN part them · p347, p355–p357 |
| ZOOM E | match · p337 | differs VUN-03 · p337, p347 | match | as above |
| A ZOOM that changes nothing | differs VUN-01 · p364 | | | |
| PAN | desktop (the console hangs, p345) | | | |
| -PAN | match · p338 · dashPan.test.ts:83 | none | match · p338 | nothing: match · p354–p356, p368 |
| PLAN, -VPOINT, VPOINT, -VIEW turning the view | match · p340–p343, p349 · viewUndo.test.ts:101–116, undoEcho.test.ts:156 | yes · match | match | none |
| PLAN in plan, -VIEW to the same view | match | differs VUN-02 · p339, p350, p369 | differs VUN-02 | none |
| -VIEW Enter, NAVVCUBE Enter | differs VUN-01 · p366; NAVVCUBE match · p367 | | | |
| NAVVCUBE | match · p344 · viewCube.test.ts:356; U restoring NAVVCUBEDISPLAY known | | match | |
| `'ZOOM` / `'-PAN` in LINE, then U | match · p358, p359 · viewUndo.test.ts:119 | | | |
| LINE's Undo after `'ZOOM` | differs VUN-04 · p360 | | | |
| ZOOM Previous after U | match · p362, p363 · viewUndo.test.ts:89 | | | |
| UNDO 2 over a joined pair | VUN-05 · p346 | | | |
| The UCS name after U of -VIEW Front | VUN-06 · p351 | | | |
| UNDO Combine: its prompt, default Yes, No | match · p352, p353 · undoCommand.test.ts:472–497 | | | |

## Findings

### Medium

#### ZOM-01 — A transparent ZOOM Object frames the objects; AutoCAD refuses with `** Requires a regen, cannot be transparent.`

- **Severity:** medium · **Row:** E · **Status:** verified
- **Where:** `cad/application/tools/ZoomTool.ts:66-70` (the selector's `done`) and `:254-260` (the preselected path)
- **AutoCAD:** p145 (es, en). After `>>Select objects: _L` / `1 found` / `>>Select objects:` comes
  `** Requires a regen, cannot be transparent.` (es `** Regeneración necesaria, no puede ser
  transparente.`), then `Resuming LINE command.`, and VIEWSIZE stays 57.0024. Object always
  regenerates (p139, p161).
- **mellowcad:** `a/zoomViews:223`. The history goes from `>>Select objects:` straight to
  `Resuming LINE command.`, and the view changes.
- **Scenario:** inside LINE, the user types `'Z O`, picks an object and presses Enter. mellowcad
  zooms; AutoCAD refuses and leaves the view.
- **Fix:** when `ctx.runsTransparently()`, Object reports `requiresRegen` and leaves the view, on both
  paths (VIEW-D2).
- **Regression test:** `transparentCommands.test.ts`, citing p145. Its test at `:280` keeps its
  selection assertions and drops the view.
- **Coverage:** view.md, ZOOM's transparent refusals add Object.

#### ZOM-02 — A window of no size keeps ZOOM asking silently; AutoCAD says `*Invalid*` and ends, and it frames a window of no width or no height alone

- **Severity:** medium · **Row:** B, L · **Status:** verified
- **Where:** `ZoomTool.ts:368-373`
- **AutoCAD:**
  - p120 (Window) and p121 (implied) give `Specify opposite corner: 10,10` / `*Invalid*` (es
    `*No válido*`). ZOOM ends with the view unchanged, and LASTPOINT keeps a point given at the
    first prompt.
  - p156 (`10,10` `10,50`) gives VIEWCTR 10,30 and VIEWSIZE 40.
  - p157 (`10,10` `50,10`) gives VIEWCTR 30,10 and VIEWSIZE 22.6567.
- **mellowcad:** `a/zoomPrompts:184` and `a/zoomViews:54` return to the first prompt with no word.
- **Fix:** refuse only when both extents are zero, then report a new message `invalidMarked`
  (`*Invalid*`, es `*No válido*`) and end. A window of one zero extent fits the other.
- **Regression test:** `view.test.ts`, replacing `:57`, which pins the old behaviour; citing p120,
  p121, p156 and p157.

#### ZOM-03 — `0` and negative factors are refused in the wrong words at the first prompt, and silently at Scale's

- **Severity:** medium · **Row:** B, L · **Status:** verified
- **Where:** `ZoomTool.ts:383-401` (`commitFactor`, `zoomBy`) and `:246-251` (Scale's `commit`
  ignores `zoomBy`'s false)
- **AutoCAD:** p105, p106 (first prompt), p114, p116 (Scale). Each says `Value must be positive and
  nonzero.` (es `El valor debe ser positivo y diferente de cero.`) and asks again.
- **mellowcad:** `a/zoomPrompts:44` writes `Requires a distance, numberX, or option keyword.`. At
  `:101` and `:211`, Scale's `-2` is echoed with no message and asked again.
- **Fix:** report `positiveNonzero` (it exists) for a number ≤ 0 at both prompts, and refuse in
  Scale's `commit` when `zoomBy` fails.
- **Regression test:** `viewPrompts.test.ts`, citing p105, p106, p114 and p116. `view.test.ts:111`
  asserts the message too.

#### ZOM-05 — A factor without X moves the view to the drawing's middle; AutoCAD keeps the view's centre

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `ZoomTool.ts:395` (`frame(...)` recentres before `zoomAt`)
- **AutoCAD:** p158. After a window 0,0–20,20, `ZOOM 2` gives VIEWCTR 10,10 and VIEWSIZE 148.5
  (half of All's height). In p135, the empty drawing's centre is kept.
- **mellowcad:** `a/zoomViews:67` sends the centre to 50,25.
- **Fix:** take the scale from All's view times the factor, centred on the current view's centre.
  The WHY (no LIMITS, so relative to All's view) stays.
- **Regression test:** `view.test.ts`, citing p158.
- **Coverage:** "`2` from ZOOM All's" becomes "`2` at ZOOM All's scale, the centre kept".

#### ZOM-06 — `Regenerating model.` follows every Extents and All; 2027 says it only when the view leaves what was generated, or nothing is drawn

- **Severity:** medium · **Row:** L · **Status:** verified
- **Where:** `ZoomTool.ts:234`, `:428-431`
- **AutoCAD:** silent in p100 (Extents of a line drawn in the start view), p108 and p159 (All), and
  p161 (a second Extents). It says it in p161's first Extents (out to ±100000), in p136 and p137
  (nothing drawn), and after Object always (p139, p161).
- **mellowcad:** `a/zoomViews:138`, `:146` write it.
- **Fix:** Extents and All say it only with nothing drawn, the case where a transparent one refuses
  (VIEW-D1).
- **Regression test:** `viewPrompts.test.ts:88` changes, citing p100 and p108. The English surface
  snapshot's ZOOM walk changes too.
- **Coverage:** ZOOM's entry. Missing gains "the regeneration when Extents leaves the generated
  area (no virtual screen)".

#### VUN-01 — A view command that changes neither the view nor ZOOM Previous's list makes no undo step, so U takes back the command before it

- **Severity:** medium · **Row:** F · **Status:** verified
- **Where:** `cad/application/CadRuntime.ts:1118-1124` (`beginGroup(!next.changesView && …)`) and
  `:2743-2761` (`recordView` returns false)
- **AutoCAD:**
  - p364 (es, en): `_ZOOM _P` / `No previous view saved.`, then `_U` / `ZOOM`, and the line stays.
  - p366: `_-VIEW` then Enter, then `_U` / `-VIEW`.
  - Every view run is a step: p365 `ZOOM`, p367 `NAVVCUBE`, p368 `-PAN`, p369 `-VIEW`.
- **mellowcad:** `c/viewUndo:202` gives `["U","LINE"]` and the line is gone; `:220` gives
  `["U","CIRCLE"]`.
- **Scenario:** the user draws a line, runs ZOOM P with nothing saved, then U. mellowcad erases the
  line.
- **Fix:** a `changesView` tool's run is a step like any other (`beginGroup` with steps for empty
  runs). `viewStep` (DashPanTool) goes. `recordView` still adds the `ViewChangeCommand` only when the
  view changed (VIEW-D40).
- **Regression test:** `viewUndo.test.ts`, citing p364 and p366–p369.
- **Rules:** `cad-tools.md` "a view left where it was makes no step unless `viewStep()` says so" is
  stale. `command-line.md` "but not a view left where it was" is false.

#### VUN-02 — U and REDO say `Regenerating model.` after a -VIEW or PLAN step that did not turn the line of sight

- **Severity:** medium · **Row:** F, L · **Status:** verified
- **Where:** `cad/application/commands/Command.ts:498-501`; `ViewTool.ts:118`, `PlanTool.ts:151`
  regenerate whatever happens.
- **AutoCAD:**
  - p350: -VIEW TOP in Top, then U gives `-VIEW` and REDO `-VIEW` / `Everything has been redone`.
  - p369: SWISO twice behaves the same.
  - p339: PLAN in plan gives `PLAN`.
  - It regenerates where the direction turns: p340–p343, p349.
- **mellowcad:** `c/viewUndo:85`, `:238`, `:248` write `… Regenerating model.`
- **Fix:** a view step regenerates on U and REDO only when its line of sight differs before and
  after (VIEW-D41). The run itself still says it, as the console does (p350).
- **Regression test:** `viewUndo.test.ts`, citing p339, p350 and p369.

#### VUN-03 — U after ZOOM Extents says `Regenerating model.`; 2027 never does after a ZOOM

- **Severity:** medium · **Row:** F, L · **Status:** verified
- **Where:** `ZoomTool.ts:430` (`ctx.regenerate()` marks the step), `Command.ts:498-500`
- **AutoCAD:** p337 gives `ZOOM`. p347, U of a joined ZOOM E + 2X back to the start view, gives
  `ZOOM ZOOM`, in es too.
- **mellowcad:** `c/viewUndo:59` gives `ZOOM Regenerating model.`; `:292` gives `ZOOM ZOOM
  Regenerating model.`
- **Fix:** the same rule as VUN-02. A ZOOM never turns the line of sight, so its step never
  regenerates on U or REDO (VIEW-D41).
- **Regression test:** `viewUndo.test.ts:52-55` and `:141`, which pin the 2023 regeneration
  (`acc/z1–z38`), change, citing p337 and p347.

#### VUN-04 — LINE's Undo keyword leaves a transparent `'ZOOM` made after its last segment; AutoCAD takes it back with the segment

- **Severity:** medium · **Row:** F, E · **Status:** verified
- **Where:** `CadRuntime.ts:1257-1260`. The transparent change waits in `viewBefore` until LINE
  ends, so `ctx.undoTo(mark)` (`LineTool.ts:369`) never sees it.
- **AutoCAD:** p360 (es, en): `_LINE 0,0 10,0 '_ZOOM 2X _U`, then Enter. The view is back at
  VIEWSIZE 57.0024 (the zoom gave 28.5012), and the segment is gone.
- **mellowcad:** `c/viewUndo:334` gives a camera scale of 18.4 where 9.2 was expected.
- **Fix:** the transparent command records its `ViewChangeCommand` as an entry of the running group
  as it ends (VIEW-D43). The group still folds it into LINE's step.
- **Regression test:** `viewUndo.test.ts`, citing p360.

#### PAN-01 — `-P` (en) and `-E` (es), acad.pgp's aliases of -PAN, are unknown here

- **Severity:** medium · **Row:** A · **Status:** verified
- **Where:** `cad/locales/en.json:515`, `cad/locales/es.json:481`
- **AutoCAD:** p201.en `-P` → `-PAN`; p201.es `-E` → `-ENCUADRE`. Both are in the installed
  `acad.pgp`.
- **mellowcad:** `b/aliases:17` does not start `dashpan`.
- **Fix:** add the aliases.
- **Regression test:** `locale.test.ts`, citing p201.
- **Coverage:** the headings in view.md, and spanish.md.

#### VDR-01 — `0,0,0` at -VPOINT is refused and asked again; AutoCAD takes it as the WCS plan, fitted

- **Severity:** medium · **Row:** B, C · **Status:** verified
- **Where:** `viewPresets.ts:89` (`lookFrom` refuses a zero point); `VPointTool.ts:148`
- **AutoCAD:** p203, p245. From 1,-1,1, `0,0,0` gives `Regenerating model.` and the command ends,
  with VIEWDIR 0,0,1, VIEWTWIST 0, and the extents fitted (VIEWSIZE 57.0026).
- **mellowcad:** `b/planVpoint:198` writes `Invalid input. Try again.` and the direction, and keeps
  asking.
- **Fix:** VPOINT reads a zero view point as 0,0,1 (VIEW-D20). `lookFrom`'s other callers keep
  refusing it.
- **Regression test:** `views.test.ts`, replacing `:67`, citing p203.

#### VDR-03 — In a UCS that is not the WCS, -VPOINT reports VIEWDIR in the UCS and leaves out AutoCAD's `*** Switching to the WCS ***` / `*** Returning to the UCS ***`

- **Severity:** medium · **Row:** B, L · **Status:** verified
- **Where:** `VPointTool.ts:47-49` (`worldDirectionToUcs`), `:61`
- **AutoCAD:** p253 (VPOINT 1,-1,1, `UCS Z 30`, `_-VPOINT`):
  `*** Switching to the WCS ***` / `Current view direction:  VIEWDIR=1.0000,-1.0000,1.0000` / the
  prompt / `0,0,1` / `*** Returning to the UCS ***` / `Regenerating model.`. In es:
  `*** Cambiando al SCU ***`, `*** Volviendo al SCP ***`.
- **mellowcad:** `b/planVpoint:286` writes only `VIEWDIR=0.8660,-0.5000,0.0000`.
- **Fix:** when the UCS is not the WCS, write `switchingToWcs` before the direction, and give the
  direction in the WCS. After the answer, before the regeneration, write `returningToUcs`. Escape
  is unprobed: VWD settles whether it is written then (VIEW-D22).
- **Regression test:** `viewPrompts.test.ts`, citing p253.
- **Coverage:** view.md's "(in the UCS, as the variable is)" is false.

#### VDR-04 — es `PV`, es `CUBE` and `DDVPOINT` (both languages), acad.pgp's aliases, are unknown here

- **Severity:** medium · **Row:** A, K · **Status:** verified
- **Where:** `cad/locales/es.json:511`, `:516`; `en.json:545`
- **AutoCAD:** p201.es `PV` → `PTOVISTA` and `DDVPOINT` → `PTOVISTA`; p201.en `DDVPOINT` →
  `VPOINT`; p265.es `CUBE` → `NAVVCUBE` (the console refuses bare English names, so CUBE is a
  Spanish alias).
- **Fix:** add them.
- **Regression test:** `locale.test.ts`, citing p201 and p265.
- **Coverage:** `spanish.md` says "`PV` ran PTOVISTA only before 2015" and "no Spanish alias" for
  NAVVCUBE, quoting `Propiedades`. The console says `Parámetros`. Both claims are false.

#### VDR-20 — es `-VI`, `VI`, `3DO` and `ORBIT`, acad.pgp's aliases, are unknown here

- **Severity:** medium · **Row:** A, K · **Status:** verified
- **Where:** `cad/locales/es.json:513-515`
- **AutoCAD:** p335.es `-VI` → `-VISTA`, and `_SWISO` then gives VIEWDIR -1,-1,1. es-es `acad.pgp`
  has `VI,*VISTA`, `-VI,*-VISTA`, `3DO,*3DORBITA`, `ORBIT,*3DORBITA`.
- **mellowcad:** `c/dashView:147`, `:164`.
- **Fix:** add them (VIEW-D46).
- **Regression test:** `locale.test.ts`, citing p335.

#### VDR-21 — 3DORBIT says nothing when it starts

- **Severity:** medium · **Row:** B, L · **Status:** verified
- **Where:** `OrbitTool.ts:21-24`
- **AutoCAD:** p329: `Press ESC or ENTER to exit, or right-click to display shortcut-menu.` (with a
  hyphen, unlike PAN's), es `Pulse ESC o INTRO para salir, o haga clic con el botón derecho para ver
  el menú contextual.`. Neither is in the merged tables, so the console's words stand.
- **mellowcad:** `c/dashView:171` writes only `3DORBIT`.
- **Fix:** a new message `orbitExit`, reported as PAN's is (`"prompt"`) (VIEW-D47).
- **Regression test:** `viewPointing.test.ts`, citing p329.

#### VDR-23 — -VIEW's hidden Categorize, lAyer and Ucs, and the named-view prompts, are missing from the coverage entry

- **Severity:** medium (a gap missing from the entry) · **Row:** B · **Status:** verified
- **AutoCAD:** p315–p323. `?`, `Enter view name(s) to list <*>:`; Save, `Enter view name to save:`
  then `UCSVIEW = 1  UCS will be saved with view`; Restore, `Enter view name to restore:`; Delete,
  `Enter view name(s) to delete:`; Window, the name and two corners; sEttings,
  `[Background/Categorize/Layer snapshot/live Section/Ucs/Visual style]`; the three hidden ones ask
  their own.
- **Fix:** coverage only (VIEW-D49).

### Low

- **ZOM-04 — `2XP` is refused; model space takes it as `2X`.** p110 gives VIEWSIZE 28.5012, the
  same as `2X` (p109). The fix is the `FACTOR` regex at `ZoomTool.ts:56` (VIEW-D6). Missing's
  "`nXP` (no paper space)" item goes.
- **ZOM-07 — ZOOM Object with a preselection writes no `1 found`** and bypasses `preselect`
  (`ZoomTool.ts:254-260`; p147 `_O` / `1 found` / `Regenerating model.`). The fix goes through
  `this.selector.preselect`.
- **ZOM-08 — ZOOM Previous keeps 10 views; 2027's console keeps 20** (p162: 31 views, 20 steps back
  before `No previous view saved.`). The fix is `Viewport.ts:115` `MAX_HISTORY = 20` (VIEW-D5).
- **ZOM-09 — Extents, All and Object leave a 40 px margin; AutoCAD leaves about 3 px a side.**
  p100 gives 57.0024 against an exact 56.6419; p108 gives 300.337 against 297. Both work out to
  about 6 px across a 942 px screen. The fix is `PADDING_PX` 3 in `ZoomTool.ts:53`,
  `viewPresets.ts:9`, `PlanTool.ts:21`, and `zoomToFit`'s default (the wheel's double-click)
  (VIEW-D4). `CadRuntime.test.ts:1110` changes.
- **ZOM-10 — Missing is incomplete.** It lacks the hidden Left (`Lower left corner point:`, es
  `Esquina inferior izquierda:`, then the magnification; p163) and Vmax (p164), Center's prompts,
  refusals and LASTPOINT (p153, p154, p165), and the real-time start message after Enter (p103).
- **ZOM-11 — Tests pin values 2027 contradicts and cite no 2027 source.** These are
  `view.test.ts:57`, `:74` and `viewPrompts.test.ts:88`. `viewPrompts.test.ts:21-23` says "AutoCAD
  2026" and "2023's console"; `ZoomTool.ts:104` and `:289` cite 2023, now p104, p113, p117–p119,
  p127–p130 and p151; `lastPoint.test.ts:784` cites `acc/wn1–wn57`, now p127–p130.
  `lastPoint.test.ts:769` never asserts LASTPOINT (p135). `view.test.ts:111` checks only the scale.
- **VUN-05 — UNDO 2 over `[ZOOM E + 2X joined][CIRCLE][ZOOM 2X]` writes `ZOOM CIRCLE ZOOM`** and
  stops between the joined pair, which U alone takes as one (p346, p347). No rule follows from one
  data point, so it goes to Missing (VIEW-D44).
- **VUN-06 — After U of -VIEW Front from the WCS, AutoCAD's UCS is named `*TOP*`** with the WCS's
  axes (p351). It goes to Missing (VIEW-D45).
- **VDR-02 — PLAN's missing name in Spanish reads `Imposible encontrar el SCP "NONE".`; AutoCAD
  says `No se puede encontrar SCP "NONE".`** (p236.es; en matches). PLAN gets its own message,
  `planUcsNotFound`; UCS Restore's shared `ucsUndefined` stays for the UCS review (VIEW-D23).
- **VDR-05 — NAVVCUBE OFF leaves NAVVCUBEDISPLAY 1 in 2027, not 0** (p262, p265, p266). The
  stored value is not observable, so only the comment and the coverage change (VIEW-D21).
- **VDR-22 — The view menu echoes `_SWiso`; acad.cuix's macro types `_swiso`** (`viewMenu.test.ts:32`).
  Unverified until VWD reads the desktop's history.
- **VDR-24 — A preset with nothing drawn frames LIMITS in AutoCAD** (p333). It goes to Missing
  with PLAN's and VPOINT's (VIEW-D25, VIEW-D50).

### Unverified, for the desktop

- **VDR-25 — 3DORBIT is not transparent here, but acad.cuix runs it as `'_3dorbit`.** The console
  hangs in 3DORBIT, so VWD types `'3DORBIT` at LINE's prompt (VIEW-D51).

## Decisions taken

- **VIEW-D1:** Extents and All say `Regenerating model.` only when nothing is drawn, the case where a
  transparent one refuses. There is no virtual screen here (ZOM-06).
- **VIEW-D2:** Object always regenerates (p139, p161), so it refuses when run transparently (p145).
- **VIEW-D3:** the getdist quirk after a numeric refusal (a point then asks ` Specify second point:`,
  p168) is not reproduced. No muscle memory leans on it.
- **VIEW-D4:** a 3 px margin a side for Extents, All, Object, PLAN, the presets and `zoomToFit`
  (p100, p108).
- **VIEW-D5:** ZOOM Previous keeps 20 views (p162). The desktop's depth is checked in VWD.
- **VIEW-D6:** `nXP` is `nX` in model space (p110).
- **VIEW-D20:** a zero view point at VPOINT is the WCS plan (p203). -VIEW and the ViewCube keep
  refusing one.
- **VIEW-D21:** NAVVCUBEDISPLAY keeps storing 0 off; the comment and the coverage say 2027 writes 1
  under 2D Wireframe (p262).
- **VIEW-D22:** VPOINT's switch notices apply in any UCS that is not the WCS (WORLDVIEW 1, p253);
  PLAN writes none (p232).
- **VIEW-D23:** PLAN's not-found message gets its own id (p236); UCS Restore's is the UCS
  review's.
- **VIEW-D24:** p201, p203 and p238 keep the ids they were rewritten under, as the probe index
  says.
- **VIEW-D25:** with nothing drawn, PLAN, VPOINT and the presets leave the zoom where AutoCAD frames
  LIMITS (p238, p249, p333). This is a gap of LIMITS, in Missing.
- **VIEW-D40:** every run of a view command is an undo step, changed or not (p364–p369). PAN and
  3DORBIT with no drag and a ZOOM cancelled with Escape follow the same rule, checked in VWD.
- **VIEW-D41:** a view step says `Regenerating model.` on U and REDO only if its line of sight
  turned (p337, p339, p349, p350, p369). Whether a twist alone regenerates is unprobed and left as
  is.
- **VIEW-D43:** a transparent command's view change is an entry of its own in the running group,
  so the host's Undo keyword takes it back (p360).
- **VIEW-D44:** UNDO n stopping inside a joined ZOOM pair goes to Missing (p346).
- **VIEW-D45:** the `*TOP*` UCS name after U goes to Missing (p351).
- **VIEW-D46:** the es aliases `-VI`, `VI`, `3DO`, `ORBIT`, `PV`, `CUBE`, `DDVPOINT` and the en
  `-P`, `DDVPOINT` are added (p201, p265, p335).
- **VIEW-D47:** 3DORBIT reports p329's words as it starts.
- **VIEW-D48:** VIEW keeps running -VIEW. The console does not know VIEW, and the View Manager stays
  in Missing.
- **VIEW-D49:** -VIEW's named views and hidden settings go to Missing with p315–p323's words.
- **VIEW-D51:** 3DORBIT stays non-transparent until VWD shows `'3DORBIT` at a prompt.

## Tests proposed

- **Regression tests:** each finding's, in the file it names.
- **Untested cells**, by file:
  - `view.test.ts`: the window's typed forms (p122–p126), Enter at Scale and at an empty Object
    (p115, p152), the set dropped after every ZOOM (p147–p150).
  - `dashPan.test.ts`: `FOO` at the second point, the bare number from the base, `_END`,
    Ortho's typed point, `'ZOOM E` and `'PAN` at it, the preselection (p217, p219, p221, p222,
    p224–p226).
  - `views.test.ts`: every preset's VIEWDIR, aligned UCS and its name in both languages, the fit's
    sizes (p304–p313, p330, p331); PLAN in Z 30 and X 90 (p232, p233).
  - `viewUndo.test.ts`: MREDO after each view step, `-VPOINT CIRCLE` UNDO 2 (p336–p344).
- **Old citations to replace:**
  - `acc/z1–z38` with p336, p345, p347, p348, p357, p358, p361, p362.
  - `acc/z6`, `g1–g25`, `k15` with p204–p220, p338, p354–p356, p368.
  - `acc/wn1–wn57` with p127–p130.
  - `acc/v1`, `y1` with p246, p247, p305, p332.
- **Weak assertions to fix:**
  - `toEqual` on Vec2 and Vec3 (the `-0` risk) at `views.test.ts:113`, `:122`, `:132`,
    `view.test.ts:199`, `:213`, `:234` and `transparentCommands.test.ts:136`.
  - `views.test.ts:100-103`'s 0–1000 range.

## What is not tested and why

- The cursors (hand, orbit), the window's rubber band and the ViewCube's look are presentation. They
  are compared on the desktop (VWD), not asserted.
- The NAVVCUBEDISPLAY value in the file cannot be read by a user (VDR-05).

## What could not be reviewed and why

- Real-time PAN and 3DORBIT hang the console (p200, p329): their Enter, Escape, `FOO`, right-click
  menu and undo are VWD's.
- The ViewCube, the viewport controls, the navigation bar, the wheel, the wheel button, Shift with
  the wheel button, and the macros' echoes and steps need the desktop and the mouse (VWD).
- Not probed: the UNDO Mark parting of ZOOMs, ZOOM All's U echo, `'ZOOM` at -VIEW's prompts, and
  repeating -VIEW with Enter. They are low value; VWD may add them.

## Refuted in the adversarial pass

- **`2 x` taken as `2X`:** a space submits the box here and at the command line, so it cannot be
  typed (p112).
- **`-0.0000` in VIEWDIR (IDP-01's analogue):** neither program writes it (p252, `b/negzero`).
- **A preselection kept (IDP-02's analogue):** every view command drops it in both (p147–p150,
  p226–p229).
- **`'_PLAN` and `'_-VPOINT` refused:** AutoCAD refuses them too (p239, p258).
- **`#x,y` refused at -PAN and ZOOM's corners:** AutoCAD refuses them too, with each prompt's own
  words (p126, p214).
- **Bottom's X axis:** -1,0,0 holds on 2027 (p305, p332).
- **The echo of a refused `'_ZOOM` at a corner, and the console writing `Z` and `ZOOM` on two
  lines:** console layout (p101, p169).

## Coverage ↔ code ↔ AutoCAD

Rows that do not hold:

| Claim | State |
| --- | --- |
| ZOOM: `2` from ZOOM All's | false: it keeps the centre (ZOM-05) |
| ZOOM: a wrong window asks again | false for a window of no size (ZOM-02) |
| ZOOM: Extents and All say `Regenerating model.` | no longer true in 2027 (ZOM-06) |
| ZOOM: transparently, nothing said | false for Object (ZOM-01) |
| ZOOM: U says `Regenerating model.` after them when one regenerated | no longer true in 2027 (VUN-03) |
| ZOOM Previous: a bounded history | holds, but the bound is 20 (ZOM-08) |
| Missing: `nXP` (no paper space) | its reason is false (ZOM-04) |
| PAN: es `-ENCUADRE` unverified | settled (p269, p338) |
| -VPOINT: VIEWDIR in the UCS | false (VDR-03) |
| -VPOINT: what is no point is refused | false for `0,0,0` (VDR-01) |
| PLAN, -VIEW: U says `Regenerating model.` | only when the direction turns (VUN-02) |
| NAVVCUBE: NAVVCUBEDISPLAY 3 or 0 | 2027 writes 1 off (VDR-05) |
| spanish.md: `PV` only before 2015; NAVVCUBE has no es alias; `Propiedades` | false (VDR-04) |
| command-line.md: a view left where it was is no step | false (VUN-01) |

Every other claim of the ZOOM, PAN, -PAN, PLAN, VPOINT, -VIEW and NAVVCUBE entries was checked and
holds. The `2023's console` citations are now 2027's probes.

**Rules ↔ code:**

| Rule | Claim | State |
| --- | --- | --- |
| `cad-tools.md`, Ordering and undo | "a view left where it was makes no step unless `viewStep()` says so (-PAN)" | stale (VUN-01) |
| `cad-tools.md`, Ordering and undo | "a transparent command run since a step goes back with it" | broken for a view change (VUN-04) |
| `cad-runtime.md`, The view | "ZOOM Previous's history" | holds; its depth changes (ZOM-08) |
| `cad-runtime.md`, Settings | NAVVCUBE is a setter U leaves | holds (p344) |
| `cad-catalogs.md`, Keywords | a hidden option not built is noted in the coverage entry | broken for ZOOM's Left and Vmax and -VIEW's Categorize, lAyer and Ucs (ZOM-10, VDR-23) |

## Order of execution and estimate

1. **ZOM**: ZOM-01 to ZOM-11. ZoomTool, Viewport, the padding constants and their tests. About
   two hours.
2. **VUN**: VUN-01 to VUN-06. CadRuntime's group opening and transparent recording, and
   `Command.ts`'s regeneration on U. It follows ZOM, since both touch `regenerate`. About two hours.
3. **VDR + PAN**: PAN-01, VDR-01 to VDR-05, VDR-20 to VDR-24. Catalogs (aliases, three messages),
   VPointTool, OrbitTool, coverage. About an hour and a half.
4. **VWD** (desktop, the owner's mouse): probes d01–d10 below, then their findings. It is a session
   of its own.

The three console blocks share the catalogs and the English surface snapshot, so they go one after
another.

### VWD, the desktop block (planned)

Each probe runs in the English profile (`launch "" en-US`), and the labels again in the Spanish one.
The owner is asked before the session starts and told when the mouse is free.

| Id | What it asks |
| --- | --- |
| d01 | The wheel: one notch's factor (VIEWSIZE before and after, ZOOMFACTOR 60), zoom about the cursor, the history line, U after a burst (a step? its name?), ZOOM Previous after a burst |
| d02 | The wheel button: a drag's pan (step? history?), its double-click (the history's echo, the margin, a step?), Shift with the wheel button (orbit, its undo) |
| d03 | Real-time PAN: the cursor, a drag, Enter and Escape, the right-click menu's items, U after it, two PANs in a row (joined?) |
| d04 | 3DORBIT: the cursor, a drag across and up, Enter and Escape, the right-click menu, U after it, `'3DORBIT` at LINE's prompt (VDR-25) |
| d05 | The ViewCube: a face, edge and corner click (VIEWDIR, fit or not, U after it, the history), a drag, the roll arrows, Home, the compass letters and ring, its menu, its opacity, the cube's Bottom, the UCS after a side face (UCSORTHO) |
| d06 | The viewport controls: the labels `[-][Top][2D Wireframe]`, the view list's order, what a choice echoes (VDR-22), Custom View |
| d07 | The navigation bar: the Zoom split button's members, their order and macros' echoes, whether the face remembers the last member, In and Out's factor, Pan and Orbit, U after each |
| d08 | ZOOM: the window's rubber band (solid or dashed), Object's rollover, Enter's real time, dynamic input at the first prompt, Escape at each prompt and the preselection after it, ZOOM Previous's depth (20?) |
| d09 | -PAN's rubber band, Ortho on a picked second point, dynamic input; VPOINT (no dash) and VIEW opening their dialogs; Escape at VPOINT in a turned UCS (VDR-03's notices) |
| e01 | The Spanish profile: the ViewCube's faces and menu, the viewport controls' labels, the navigation bar's tooltips |

## Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/view.md`: each entry as the findings above say, every **unverified** a probe
  settled marked, and Missing extended (ZOM-10, VDR-23, VDR-24, VUN-05, VUN-06, VIEW-D25).
- `docs/coverage/spanish.md`: the aliases and NAVVCUBE's words (VDR-04, VDR-20).
- `docs/coverage/command-line.md`: a view run is a step (VUN-01).
- `.claude/rules/cad-tools.md`: the `viewStep` sentence goes; a transparent command's view change
  is an entry of the running group (VUN-01, VUN-04).
- `.claude/rules/cad-runtime.md`: ZOOM Previous keeps 20; a view step regenerates on U only when
  its line of sight turned (VUN-02).
- Catalogs:
  - New messages `invalidMarked`, `switchingToWcs`, `returningToUcs`, `orbitExit` and
    `planUcsNotFound`.
  - The aliases of VIEW-D46.
  - en, es and ar.
- `docs/coverage/roadmap.md`: the View row is `plan`, then `done` with VWD executed. It owns the
  view and its undo.

## Template improvements

- **Matrix row A takes the installed `acad.pgp` of each language as a source.** Seven aliases were
  missing (PAN-01, VDR-04, VDR-20), and `spanish.md` claimed the opposite for two of them. Diff the
  names against both files in Phase 1.
- **A probe that hangs keeps its id; the retry takes the next free one** (annex-probes.md §1). Three
  ids were rewritten here after real-time PAN hung them (VIEW-D24).
- **A command that hangs the console goes last in a probe of its own** (annex-probes.md §2). PAN
  and 3DORBIT take every answer after them down with them.
- **Read nothing with `ssget` between U and REDO** (annex-probes.md §2). `(ssget "_X")` there made
  REDO say `Nothing to redo`; read with `getvar` only.
