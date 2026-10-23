# Properties review (LAYER, COLOR, LINETYPE, LTSCALE, LWEIGHT, PROPERTIES, FILL, MATCHPROP)

> **Status:** plan, 2026-10-23 — phases 0–4 in one session with skill `command-review`, the
> sixteenth review of `docs/coverage/roadmap.md`'s order. It owns **the style tables** (layers,
> colours, linetypes, lineweights). Commands: LAYER, LAYERCLOSE, COLOR, -COLOR, LINETYPE,
> -LINETYPE, LTSCALE, LWEIGHT, -LWEIGHT, PROPERTIES, PROPERTIESCLOSE, FILL, MATCHPROP. Executed in
> the same session, block by block (§12).

## 1. Summary

0 critical, 3 high, 25 medium and 25 low findings over eight blocks.

The worst three:

- **Layer edits and the current layer bypass the history** (LAY-01): AutoCAD's U takes back a
  layer's colour, lock, Off, a new layer and CLAYER (p301–p308; the Layer Properties Manager's
  edits, desktop d04-2, d04-3; the drop-down's current layer, d05-1), while mellowcad keeps the
  change and U takes back the command before it.
- **A layer used only inside a block definition can be deleted** (LAY-02): AutoCAD refuses it
  (p380, the LPM help), mellowcad drops it and the block's contents fall to layer 0 for good.
- **Objects on a locked layer cannot be selected at `Command:`** (LKD-01): AutoCAD selects them by
  a pick or a window (glow, no grips), shows them in the palette, refuses an edit there with
  `One or more selected objects are locked and cannot be updated.` and drops them from the set
  (d02, d03-5), and a command given them as a preselection says `1 was on a locked layer.` (p381).

The analogues the Arrays review left all held: the palette's object filter counts an array as a
block reference where AutoCAD lists `Array (Rectangular)` (PRP-01, d06-2); U after a grip or
palette edit, or after the drop-downs, names nothing where AutoCAD writes `Grip Edit`,
`Modify Property`, `CHPROP` and `'CLAYER` (PRP-03, LAY-01). CRP's locked look: the fade and the
padlock (LKD-02, d01).

| Block | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| LAY — the layer table, LAYER, LAYERCLOSE, the Layer Properties Manager, the Layers drop-down | 0 | 2 | 6 | 5 |
| LKD — objects on locked layers at `Command:`, their look | 0 | 1 | 1 | 0 |
| COL — COLOR, -COLOR, CECOLOR, the colour model | 0 | 0 | 4 | 2 |
| LWT — LWEIGHT, -LWEIGHT, CELWEIGHT, LWDISPLAY | 0 | 0 | 3 | 5 |
| LTY — LINETYPE, -LINETYPE, LTSCALE, CELTYPE, the linetype registry | 0 | 0 | 2 | 7 |
| FIL — FILL | 0 | 0 | 0 | 1 |
| PRP — PROPERTIES, PROPERTIESCLOSE, the palette, the drop-downs' undo | 0 | 0 | 2 | 2 |
| MAT — MATCHPROP | 0 | 0 | 7 | 3 |

Evidence: about 190 console probes in es-ES and en-US (p00–p381), a desktop pass in the English
profile (d00–d09) and one in the Spanish profile (e01–e02), MATCHPROP's own string table
(`acmatchRes.dll`), the LPM's task dialogs (`AcTaskDialogs.resources.dll`) and `acad.pgp`.

## 2. Inventory

- **Commit** `9d96b27`; AutoCAD 2027 `26.0`, `X.118.0.0`; tables `research/strings/all_*.tsv` of
  2026-10-20 (the build the Arrays review used).
- **Tools**: `cad/application/tools/ColorTool.ts`, `LinetypeTool.ts`, `LtScaleTool.ts`,
  `LweightTool.ts`, `FillTool.ts`, `MatchPropTool.ts`, `currentProperties.ts`.
- **Runtime**: `runtimeLayers.ts` (`updateLayer`, `nextLayerName`), `runtimeProperties.ts`
  (`setSelectionLayer` / `Color` / `Linetype` / `Lineweight`, `setCurrentProperties`,
  `setSelectionProperty`, `buildPropertiesUi`, `filterByType`), `CadRuntime.ts` (`createLayer`,
  `updateLayer`, `setCurrentLayer`, `removeLayer`, `applyLayerControl`, `setCurrentColor`,
  `toggleLineweightDisplay`, `setPropertiesFilter`), `EngineState.ts` (`generalRows`, `rollover`,
  `layers`), `commands/settingsCommands.ts`, `commands/Command.ts` (`Step.name`, UNDO Layer).
- **Domain**: `layers.ts`, `colors.ts`, `linetypes.ts`, `lineweights.ts`, `Document.ts` (the layer
  table, `removeLayer`, `isEntitySelectable`), `entityOverrides.ts` (`matchEntityProperties`).
- **Registration**: `runtimeCommands.ts` (LAYER, LAYERCLOSE, PROPERTIES, PROPERTIESCLOSE as palette
  commands; COLOR, LINETYPE, LWEIGHT running their dash forms; `TRANSPARENT_COMMANDS`),
  `cad/locales/{en,es,ar}.json` names (`LAYER`: `LA`; `PROPERTIES`: `PR`, `CH`, `MO`; `MATCHPROP`:
  `MA`, `PAINTER`; `LTSCALE`: `LTS`; `COLOR`: `COL`; es `CAPA`, `CA`, `CERRARCAPA`,
  `PROPIEDADES`, `CERPROP`, `IGUALARPROP`, `IP`, `COPARPROP`, `ESCALATL`, `EC`, `TIPOLIN`,
  `GROSORLIN`, `RELLENAR`).
- **UI**: `components/cad/layers-control.tsx` (the LPM and the Layers drop-down),
  `properties-panel.tsx`, `palette-panel.tsx`, `color-select.tsx`, `linetype-select.tsx`,
  `lineweight-select.tsx`, `top-bar.tsx`, `rollover-tooltip.tsx`; `messages/{en,es,ar}.json`
  (Editor.Layers).
- **Tests**: `settingsPrompts.test.ts`, `currentPropertyCommands.test.ts`, `currentProperties.test.ts`,
  `ltscale.test.ts`, `properties.test.ts` (MATCHPROP), `polylineWidths.test.ts:492–557` (FILL),
  `palettePanel.test.ts`, `CadRuntime.test.ts:236–391` (layers), `Document.test.ts:175–310`,
  `undoEcho.test.ts`, `englishSurface.test.ts` and its snapshot, `drawingFile.test.ts:150–184`.
- **Knowledge**: `docs/coverage/properties.md` (every entry), `modify.md` MATCHPROP,
  `command-line.md` UNDO's Layer; rules `cad-runtime.md` ("Settings are split on purpose"),
  `cad-engine.md` (style tables), `cad-tools.md` (current properties, free-text prompts),
  `cad-catalogs.md`, `ui.md`.
- **Related, reviewed for their part**: the drop-downs of the top bar (Layers, Object Color,
  Lineweight, Linetype), U's echo for edits made outside a command, the rollover at `Command:`.
- **Areas owned**: the style tables (layers, colours, linetypes, lineweights). **Cited**: the
  command line, undo, transparency (LINE review); `Select objects:` and the preselection (ERASE
  review); the array object (Arrays review); grips (LINE review).
- **Not built, recorded only**: -LAYER (`-LA`, `-CA`), LAYDEL, the Select Color, Linetype Manager
  and Lineweight Settings dialogs, MATCHPROP's Settings dialog.

## 3. Probes

Console inputs are `scripts/research/probes/properties/<id>.txt` (`.plain` untraced, `.es`/`.en`
one locale), run with `scripts/research/probe.sh properties <ids>`; the desktop's helpers are
`lib-dsk-en.sh` (English, first monitor) and `lib-dsk.sh` (Spanish, second monitor). Transcripts
and screenshots are in `research/probes/properties/` (gitignored). MATCHPROP's strings were read
from `acmatchRes.dll` with `scripts/research/strtable.mjs` (not yet in `research/strings/`).

| Id | What it asks |
| --- | --- |
| p00 | the version and the variables: CLAYER, CECOLOR, CELTYPE, CELWEIGHT, LTSCALE, CELTSCALE, FILLMODE, LWDISPLAY, LWUNITS, LWDEFAULT, LAYLOCKFADECTL, MEASUREMENT, LUPREC |
| p100–p139 | -COLOR: numbers 0–256 and −1, names in both languages, ByLayer and ByBlock words, `FOO`, Truecolor and its refusals, `RGB:`, `HSL:`, Colorbook, COLOR / COL / COLOUR, transparency, U, UNDO 2, REDO, CECOLOR typed, layer 0's and a new layer's colour, SAVEAS and OPEN |
| p140–p165 | -LWEIGHT: every value, ties, negatives, words, `?`, LWEIGHT / LW / LINEWEIGHT / GROSORLIN, transparency, U, LWDISPLAY / LWUNITS / CELWEIGHT typed |
| p166–p179 | FILL: every answer, `O`, transparency, U, RELLENAR, FILLMODE typed |
| p200–p229 | -LINETYPE: the option prompt and its keywords, `?` and its file prompt, Create, Load, Set with every kind of name, Set's `?` with patterns, what a new drawing has loaded, LINETYPE in the console, ByLayer words |
| p230–p245 | LTSCALE: every input, LUPREC against its default, transparency, U and REDO, the aliases, CELTSCALE |
| p246–p260 | -LINETYPE: U and REDO, two Sets, UNDO 2, transparency mid-LINE, repeat, every acad.pgp alias, CELTYPE typed, `'ZOOM` |
| p300–p329 | -LAYER: a new layer's and layer 0's values, U after each edit and CLAYER, UNDO Layer, the current layer off, a locked current layer, DELete, -PURGE, LAYDEL, rename refusals, snaps on locked and off lines |
| p340–p358 | MATCHPROP, PROPERTIES, LAYER and their Spanish names in the console (unknown, or the console dies) |
| p380 | a layer used only inside a block definition, `-LAYER _DEL` |
| p381 | MOVE with a preselection holding a locked object |
| d00 | en-US desktop: the figure (layers Walls, Locked, Off) |
| d01 | hover at `Command:` over a locked line and circle, and an unlocked line: fade, padlock, rollover |
| d02 | a pick and a window on a locked line at `Command:` |
| d03 | the palette on a locked line, a Thickness retyped there; the palette with no selection |
| d04 | the LPM: a lock and U; three edits and U; New with Walls selected; Delete on layer 0; the current layer off; rename to `Walls`, `walls`, an invalid name, layer 0 |
| d05 | the ribbon's Layers, Object Color, Lineweight and Linetype drop-downs; U after each |
| d06 | the palette's object filter with lines, circles, block references and an array |
| d07 | MATCHPROP: its prompts, the settings line, a locked destination, Settings' dialog, U |
| d08 | MATCHPROP with a preselection; a locked source |
| d09 | locking and turning off a layer while its object is selected |
| e01 | es-ES desktop: the palette's rows and object filter (`Todos (7)`, `Matriz (rectangular) (1)`) |
| e02 | es-ES desktop: the LPM's columns and MATCHPROP's Spanish lines through COM |

## 4. Matrix

Rows C (point entry), D (drafting aids), M (render of a jig) and P (pointer gestures of a jig) are
n/a for every command here: none asks a point. MATCHPROP's picks follow `Select objects:` (owned,
ERASE review). The full per-cell detail of each block, with every scratch test, is in the
subagents' reports kept with the transcripts; the plan keeps the states.

### LAY — layers

| Row | Cell | State |
| --- | --- | --- |
| A | LAYER, LA, CAPA, CA, `_LAYER` | match · acad.pgp · `palettePanel.test.ts:23–49` |
| A | es `LAYER`, DDLMODES (en and es) | differs LAY-08 |
| A | `-LA`, `-CA` (-LAYER) | differs LAY-09 (not recorded as missing) |
| A | LAYERCLOSE, CERRARCAPA; `'LAYER` | untested (the console dies, p345, p352); transparency unverified |
| B | a new layer's and layer 0's colour | differs LAY-06 (7, p300; here `#e2e8f0`) |
| B | their linetype; lineweight Default | match Continuous · p300; known (Default not modelled) |
| B | Layer1 / Capa1 | match · table 53391 · `CadRuntime.test.ts:276` |
| B | New takes the selected layer's properties, the current layer kept | differs LAY-05 · d04-4 |
| B | rename: layer 0, a name in use (case-insensitive), invalid characters | differs LAY-03 · d04-11, d04-14, d04-16, p319–p321 |
| B | delete 0, the current layer, a layer in use | match · p324–p326 · `CadRuntime.test.ts:301` |
| B | delete a layer used only in a block | differs LAY-02 · p380 |
| B | the refusal's words (a task dialog on click, the button enabled) | differs LAY-10 · d04-6 |
| B | the current layer turned off | differs LAY-04 · d04-7, p310 |
| B | locking the current layer; drawing on it | match · p313 |
| F | U after any layer edit, New, the current layer | differs LAY-01 · p301–p308, d04-2, d05-1 |
| F | several LPM edits, one U | differs LAY-07 · d04-3, p303, p306, p315 |
| H | `_END` on a locked line taken, on an off line refused | match · p322, p323 |
| J | the table saved | match · `drawingFile.test.ts:150–170` |
| K | the LPM's labels | untested · e02-1 (colour names written beside the swatch: LAY-15) |
| Q | rows sorted by name; colour names | differs LAY-15 · d04-1, d05-1 |
| N | tests | LAY-11 |
| O | F2 to rename | LAY-12 |

### LKD — locked objects at `Command:`

| Row | Cell | State |
| --- | --- | --- |
| I | a pick, a window on a locked object | differs LKD-01 · d02-1, d02-3 · scratch `me/prp` |
| I | the palette on it, an edit refused | differs LKD-01 · d03-1, d03-5, d03-6 |
| I | lock keeps a selection, Off drops it | differs LKD-01 · d09-4, d09-5 |
| G | a preselection with a locked object given to MOVE | differs LKD-01 · p381 |
| Q | the fade (LAYLOCKFADECTL 50), the padlock, no hover glow, the rollover tooltip | differs LKD-02 · d01-1, d01-3 |
| Q | the Layers drop-down's padlock icon | known (Missing: the drop-down's icons) · d05-1 |

### COL — colour

| Row | Cell | State |
| --- | --- | --- |
| A | COLOR, -COLOR, COL (en) | match · p125, p136 · `currentPropertyCommands.test.ts:150, :192` |
| A | COL (es), COLOUR (en) | differs COL-04 · p136, p137 |
| B | the prompt, `<BYLAYER>`, `<1 (red)>`, es `<1 (rojo)>` | match · p101, p117 · `settingsPrompts.test.ts:90` (es untested) |
| B | 1–7, names, `_BYLAYER` | match · scratch `a/color` |
| B | es `C` (porCapa) | differs COL-01 · p113c |
| B | −1 | differs COL-03 · p106 |
| B | es bare `RED`, `BYLAYER`, `BYBLOCK` | differs COL-05 · p107b, p113b, p115 |
| B | 0, 256 `Invalid color number.`; 8–255; ByBlock; Colorbook | untested · p100, p105; known · p103, p114, p123 |
| B | Truecolor and its refusals | match · p118–p120, p124 |
| E | `'ZOOM` at the prompt | differs COL-02 · p134 |
| F | U names `-COLOR`, UNDO 2, REDO | match · p128–p130 · `currentPropertyCommands.test.ts:232` |
| H | each segment of LINE takes the colour current when it starts | untested · p126 |
| J | CECOLOR saved | match · p133 · `drawingFile.test.ts:184` |
| O | the selection dropped | match · p117b |
| N | tests | COL-07 |

### LWT — lineweight

| Row | Cell | State |
| --- | --- | --- |
| A | -LWEIGHT, LWEIGHT, LW, GROSORLIN, -GROSORLIN | match · p153, p163, p164 · `currentPropertyCommands.test.ts:344, :419` |
| A | LINEWEIGHT | differs LWT-06 · p162 |
| B | `Current lineweight:` of 0 (`None`) | differs LWT-02 · p140 |
| B | es `BYLAYER`, `ByLayer` in the listing | differs LWT-03 · p140, p151 |
| B | rounding, the message | match · p142, p145, p160 |
| B | ties to the thinner | differs LWT-04 · p143, p161 |
| B | −1 | differs LWT-01 · p146 |
| B | `?`'s rows; ByBlock, Default | match · p151; known · p149, p150 |
| E | `'ZOOM` at the prompt | differs LWT-05 · p165 |
| F | U names `-LWEIGHT` (es `-GROSORLIN`) | match · p155, p156 · `currentPropertyCommands.test.ts:407` |
| O | LWDISPLAY typed, undoable | differs LWT-07 · p157, p157b, p157c |
| N | tests | LWT-08 |

### LTY — linetypes and LTSCALE

| Row | Cell | State |
| --- | --- | --- |
| A | -LINETYPE, LINETYPE, LT, TIPOLIN, LTSCALE, LTS, ESCALATL, EC | match · p238, p253 · `currentPropertyCommands.test.ts:264, :329`, `ltscale.test.ts:84` |
| A | LTYPE, -LT, -LTYPE, DDLTYPE; es TL, -TL, TLINEA, -TLINEA | differs LTY-01 · p253 |
| B | the option prompt, its words; Create, Load, the file `?` | match · p200; known · p202–p206 |
| B | the listings' order, Continuous in the file's, no matches | differs LTY-05 · p202, p217, p218 |
| B | Set: `_BYL`, es `BYLAYER` | differs LTY-07 · p224, p229 |
| B | Set: a name not loaded | differs LTY-02 (`acad.lin`) · p213 |
| B | LTSCALE's `<1.0000>` | differs LTY-03 · p234 |
| B | LTSCALE's refusals | match · p231 · `ltscale.test.ts:50` |
| E | `'ZOOM`; `'LTSCALE` mid-LINE | match · p242, p258; untested · p235 |
| F | U and REDO name the step, `Regenerating model.` | untested · p236, p246–p249 |
| H | CELTYPE's name in capitals | differs LTY-06 · p209 |
| O | a new drawing loads Continuous only | differs LTY-04 · p221 |
| O | the selection setter takes an unknown linetype | differs LTY-08 |
| N | the English walk types into a keyword prompt | differs LTY-09 |

### FIL — FILL

Every cell matches: names (`FILL`, `RELLENAR` p176), `ON`, `OFF`, `1`, `0`, `A`, `DES`, Enter,
`O`'s `ON or OFf?` (p170), `FOO` (p171), transparency (p173, p178), U naming it (p174, p175),
saved (p133), the selection dropped (p172b); FILLMODE typed is known. FIL-01 is the tests.

### PRP — the palette and the drop-downs

| Row | Cell | State |
| --- | --- | --- |
| A | PROPERTIES, PR, CH, MO, Ctrl+1, PROPERTIESCLOSE | match · `palettePanel.test.ts` (the console does not know them, p343, p344) |
| I | the object filter's entry for an array | differs PRP-01 · d06-2, e01 |
| I | the filter's order (by count, most first) | differs PRP-02 · d06-2, e01 |
| I | `*VARIES*` (es `*VARIOS*`) where values differ | match · d06-1, e01-2 |
| I | no selection: General's rows | known (Missing: Linetype scale, Transparency…) · d03-3 |
| F | U after a drop-down's edit of objects (`CHPROP`), a palette edit (`Modify Property`), a grip (`Grip Edit`) | differs PRP-03 · d05-2, arrays/d14, d20 |
| F | U after the colour drop-down sets CECOLOR (no name) | match · d05-3 · scratch `me/prp` |
| Q | the drop-downs' lists (ByBlock, Default, Other…, Lineweight Settings…) | known · d05-3, d05-4, d05-5 |
| N | tests | PRP-04 |

### MAT — MATCHPROP

| Row | Cell | State |
| --- | --- | --- |
| A | MATCHPROP, MA, PAINTER, IGUALARPROP, IP | match · acad.pgp · `englishSurface.test.ts:1042` |
| A | es COPIARPROP (not COPARPROP) | differs MAT-02 |
| B | the source prompt (en) | match · acmatchRes 15 · d07 |
| B | the Spanish prompts | differs MAT-01 · acmatchRes 15, 13 · e02 |
| B | `Current active settings:` line | differs MAT-03 · d07, e02 |
| B | `[Settings]` | known (the dialog) · d07-6 |
| B | a locked destination's words | differs MAT-06 · d07 |
| B | a locked source | differs MAT-07 · d08-3 |
| G | Enter at the source ends it; Escape | match · e02 · `properties.test.ts:76` |
| G | a preselection is the source | differs MAT-09 · d08-1 |
| F | U names MATCHPROP | untested · d07 · scratch `me/prp` |
| H | the basic properties | match · `properties.test.ts:17–76` |
| H | linetype onto a hatch, MTEXT; Text, Dimension, Hatch special properties | differs MAT-05, MAT-04 (help; Settings' list d07-6) |
| N | tests | MAT-08 |

## 5. Findings

### High

#### LAY-01 — Layer edits and the current layer bypass the history: U never takes them back, and takes back the command before them

- **Severity:** high · **Row:** F · **Status:** verified
- **Where:** `cad/application/runtimeLayers.ts:27`, `CadRuntime.ts:3567–3604` (`createLayer`,
  `setCurrentLayer`, `removeLayer` write the document), `:3630` (`applyLayerControl`).
- **AutoCAD:** p301–p308 (`_U` echoes `-LAYER`, es `-CAPA`, and puts back the colour, the lock, Off,
  a new layer, Make, Set; after `_CLAYER`, `CLAYER`); p329 (U `-LAYER`, then U `LINE`); desktop
  d04-2 (an LPM lock, U `'.-LAYER LAYER Regenerating model.`), d05-1 (the drop-down's current
  layer, U `'CLAYER`).
- **mellowcad:** scratch `c/lay` (every undo case fails); `me/prp` d05-1: U erased the LINE.
- **Scenario:** a layer recoloured or made current, then U → mellowcad takes back the last line
  drawn and keeps the layer change → AutoCAD takes back the layer change.
- **Fix:** every layer-table edit and CLAYER through a `Command` (PROPS-D40, D66). **Regression
  test:** `CadRuntime.test.ts`, citing p301–p308, p329, d04-2, d05-1; `:363` flips.
- **Coverage, rules:** `cad-runtime.md` "Settings are split on purpose" (stale);
  `command-line.md` UNDO's Layer; `properties.md` Layers.

#### LAY-02 — A layer used only inside a block definition can be deleted

- **Severity:** high · **Row:** B · **Status:** verified
- **Where:** `cad/domain/Document.ts:447` (`removeLayer` counts model space only);
  `CadRuntime.ts:5806` (`entityCount`); `layers-control.tsx:76–79`.
- **AutoCAD:** p380: a circle on L1 made a block, every reference erased, `-LAYER _DEL L1` →
  `The selected layers could not be deleted.`, L1 kept; the 2027 LPM help: "Layers used in a block
  definition" cannot be deleted.
- **mellowcad:** scratch `c/lay` "refuses to delete a layer a block definition uses": deleted.
- **Scenario:** a door block drawn on Doors, Doors deleted → the block's lines fall to layer 0 and
  lose its colour, for good (no undo, LAY-01) → AutoCAD refuses.
- **Fix:** a layer is in use when a block definition holds an object on it, nested too
  (PROPS-D42). **Regression test:** `Document.test.ts`, citing p380.

#### LKD-01 — Objects on a locked layer cannot be selected at `Command:`

- **Severity:** high · **Row:** I · **Status:** verified
- **Where:** `cad/domain/Document.ts:486` (`isEntitySelectable`: a locked layer is not
  selectable), `runtimeLayers.ts:45–55` (a lock drops the selection).
- **AutoCAD:** d02-1 (a pick on a locked line at `Command:`: the glow, no grips, `(ssget "_I")` 1),
  d02-3 (a window: the same), d03-1 (the palette shows it, every row), d03-5 / d03-6 (Thickness
  retyped: a task dialog `Properties - Locked objects`, `One or more selected objects are locked
  and cannot be updated.`, `Number of objects removed from the selection set: 1`; nothing
  changes), d09-4 (locking a layer keeps its selected objects selected; Off drops them, d09-5),
  p381 (MOVE given that preselection: `2 found` / `1 was on a locked layer.`, es
  `2 encontrados` / `1 estaba en una capa bloqueada.`, the locked one left out).
- **mellowcad:** scratch `me/prp`: the pick and the window select nothing; a lock drops the set.
- **Scenario:** a user clicks a line on a locked layer to read its layer or length in the palette →
  mellowcad starts a window → AutoCAD shows it.
- **Fix:** PROPS-D60 to D62. **Regression test:** `selection.test.ts` and `CadRuntime.test.ts`,
  citing d02, d03-5, d09, p381.
- **Coverage, rules:** `cad-engine.md`'s layer comment ("cannot be selected/edited"),
  `properties.md` Layers, `command-line.md` (the preselection).

### Medium

#### LAY-03 — A rename to a name in use or with invalid characters is accepted; the engine renames layer 0

- **Severity:** medium · **Status:** verified
- **AutoCAD:** d04-11 (`Layer - Name Already Exists`: `The name, Walls, is already in use.` /
  `You will need to enter a different name.`), d04-14 (`walls` too: case-insensitive), d04-13
  (`Invalid characters in layer name.` / `The following characters are not valid in layer names:`
  `<>/\":;?*|,=`` ` ``), d04-16 (`Layer - Rename`: `The selected layer cannot be renamed.` /
  `The following layers cannot be renamed:` `• Layer 0` `• Xref-dependent layers`); -LAYER p319–p321.
- **mellowcad:** scratch `c/lay`: two layers named L2, `A<B` taken, layer 0 renamed by the engine
  (`layers-control.tsx:422` guards it in the UI alone).
- **Fix:** `updateLayer` refuses each (PROPS-D43); the LPM reverts the name and shows the words.

#### LAY-04 — Turning the current layer off asks nothing

- **Severity:** medium · **Status:** verified
- **AutoCAD:** d04-7: `Layer - Current Layer Off`, `The current layer will be turned off. What do
  you want to do?`, `Turn the current layer off` (`Objects that you create from now on will not be
  displayed in the drawing until you turn the layer back on.`) / `Keep the current layer on`;
  es table `Capa - Capa actual desactivada` (AcTaskDialogs _87).
- **mellowcad:** `layers-control.tsx:437`: off at once. **Fix:** the question (PROPS-D67).

#### LAY-05 — New Layer ignores the selected layer's properties

- **Severity:** medium · **Status:** verified
- **AutoCAD:** d04-4: Walls (red, DASHED) selected, New → `Layer1`, red, DASHED, its name being
  edited; CLAYER stays `0`. **mellowcad:** `layers-control.tsx:98` → `createLayer()` with
  `#e2e8f0`, Continuous, made current. **Fix:** PROPS-D44 (the current layer kept: the coverage's
  Missing gap closes too).

#### LAY-07 — UNDO's Layer option is stored and never read

- **Severity:** medium · **AutoCAD:** p309 (`Combine layer dialog operations? [Yes/No] <Yes>:`),
  p303, p306 (`-LAYER -LAYER` in one U), p315 (Layer No: one each), d04-3 (three LPM edits, one U:
  `'.-LAYER '.-LAYER '.-LAYER Regenerating model.`). **Where:** `commands/Command.ts:79`.
  **Fix:** PROPS-D41, D66.

#### LAY-08 — es `LAYER` and DDLMODES do not open the manager

- **Severity:** medium · **AutoCAD:** acad.pgp en (`DDLMODES, *LAYER`) and es (`LAYER, *CAPA`,
  `DDLMODES, *CAPA`). **Fix:** the names (PROPS-D48).

#### LAY-09 — -LAYER is absent and not recorded

- **Severity:** medium · **AutoCAD:** p300, p314 (its prompts and keywords, en and es). **Fix:**
  recorded in `properties.md` Missing (PROPS-D48).

#### LKD-02 — Locked layers are not faded and show no padlock

- **Severity:** medium · **Row:** Q · **Status:** verified
- **AutoCAD:** p00 (LAYLOCKFADECTL 50), d00-2 and d01 (the locked line and circle drawn faded; the
  cursor over one at `Command:` shows a padlock badge above-right of the pickbox, no rollover glow,
  and the rollover tooltip as usual: `Line`, `Color`, `Layer Locked`, `Linetype`).
- **mellowcad:** no fade (nothing reads a lock in `SceneBuilder.ts`); scratch `me/prp` d01-1:
  `rollover` null over a locked line.
- **Fix:** PROPS-D63. **Regression test:** `SceneBuilder.test.ts` (the faded colour),
  `CadRuntime.test.ts` (the badge, the tooltip).

#### COL-01 — In Spanish, `C` at -COLOR opens Truecolor instead of taking porCapa

- **Severity:** medium · **AutoCAD:** p113c (es: `C` → CECOLOR `BYLAYER`; table 26289 lists
  `porCapa` and `COlorverdadero`). **mellowcad:** scratch `a/color` "es bare C": `Rojo,Verde,Azul:`;
  the dynamic-input box takes it as ByLayer (`CadRuntime.ts:4006` dispatches a keyword from a text
  prompt, `:3779` does not). **Fix:** PROPS-D2.

#### COL-02 — `'ZOOM` at -COLOR's prompt is refused as an answer

- **Severity:** medium · **AutoCAD:** p134 (`>>Specify corner of window…`, `Resuming -COLOR
  command.`). **mellowcad:** `A color number or standard color name is required.` (`ColorTool.ts:84`
  a text field; `CadRuntime.ts:1388`). **Fix:** PROPS-D3.

#### COL-03 — −1 at -COLOR gets the wrong refusal

- **Severity:** medium · **AutoCAD:** p106 `Invalid color number.` **mellowcad:** `A color number or
  standard color name is required.` (`ColorTool.ts:120`). **Fix:** a signed integer is a number.

#### COL-04 — COL is missing in Spanish, COLOUR in English

- **Severity:** medium · **AutoCAD:** p136 (es `COL` runs COLOR), p137 (en `COLOUR`), p137b (es
  `COLOUR` unknown). **Fix:** PROPS-D5.

#### LWT-01 — -LWEIGHT takes −1 as 0.00 mm

- **Severity:** medium · **AutoCAD:** p146 `Invalid lweight number.` (es `Número de grosor de línea
  no válido.`, table 21077), asked again. **mellowcad:** rounds to 0.00 mm and ends
  (`LweightTool.ts:126–131`; `currentPropertyCommands.test.ts:365` pins it).

#### LWT-05 — `'ZOOM` at -LWEIGHT's prompt is refused

- **Severity:** medium · **AutoCAD:** p165 (`Reanudando el comando -GROSORLIN.`). **Fix:** PROPS-D3.

#### LWT-07 — LWDISPLAY cannot be typed and its toggle is not undoable; Missing does not say so

- **Severity:** medium · **AutoCAD:** p157 (`Enter new value for LWDISPLAY <OFF>:`), p157b (U names
  `LWDISPLAY`), p157c (saved). **mellowcad:** `Unknown command`; `toggleLineweightDisplay`
  (`CadRuntime.ts:4237`) writes the document. **Fix:** the toggle through `UpdateSettingsCommand`;
  LWDISPLAY typed recorded in Missing with SETVAR's (roadmap row 24).

#### LTY-01 — LINETYPE's other acad.pgp aliases are missing

- **Severity:** medium · **AutoCAD:** p253 (en `LTYPE`, `-LT`, `-LTYPE`, `DDLTYPE`; es `TL`, `-TL`,
  `TLINEA`, `-TLINEA`, `DDLTYPE`), p254 (es `LT` is LIST). **Fix:** PROPS-D28.

#### LTY-04 — Six linetypes are loaded in a new drawing; AutoCAD's has Continuous only, and no WHY says so

- **Severity:** medium · **AutoCAD:** p221 (`tblnext "LTYPE"`: Continuous alone), p214 (Set's `?`
  lists only Continuous), p222 (Set loads DASHED from the file). **Fix:** PROPS-D20.

#### PRP-01 — The palette's object filter counts an array as a block reference

- **Severity:** medium · **Row:** I · **Status:** verified
- **AutoCAD:** d06-2: `All (10)`, `Line (4)`, `Block Reference (3)`, `Circle (2)`,
  `Array (Rectangular) (1)`; e01: `Todos (7)`, `Línea (3)`, `Referencia a bloque (2)`,
  `Círculo (1)`, `Matriz (rectangular) (1)`.
- **mellowcad:** scratch `me/prp` d06-2: `Block reference (1)` for the array (and `reference` in
  lower case). **Where:** `runtimeProperties.ts:253` (`counts` by `entity.type`).
- **Fix:** PROPS-D64. **Regression test:** `palettePanel.test.ts` or `properties` UI test, citing d06-2.

#### PRP-03 — U after an edit made outside a command names nothing

- **Severity:** medium · **Row:** F · **Status:** verified
- **AutoCAD:** d05-2 (the Layers drop-down moving a selection: U `CHPROP`; the Object Color
  drop-down on a selection: U `CHPROP`, d05-3b), arrays/d20 (a palette edit: `Modify Property`),
  arrays/d14 (a grip drag: `Grip Edit`; es table 6001 `Editar pinzamiento`, `CHPROP` 52586
  `CAMBPROP`).
- **mellowcad:** scratch `me/prp` d05-2: `U` alone. **Where:** `commands/Command.ts` (`Step.name`
  null for an edit made outside a command). **Fix:** PROPS-D65.

#### MAT-02 — The Spanish alias is COPIARPROP, not COPARPROP

- **Severity:** medium · es acad.pgp `COPIARPROP, *IGUALARPROP`; acmatchRes 33. **Fix:** PROPS-D45.

#### MAT-03 — No `Current active settings:` line

- **Severity:** medium · **AutoCAD:** d07: `Current active settings:  Color Layer Ltype Ltscale
  Lineweight Transparency Thickness PlotStyle Dim Text Hatch Polyline Viewport Table Material
  Multileader Center object` after the source; e02: `Parámetros activos actuales:  Color Capa
  Tlínea Escalatl Grosor de línea Transparencia Alt-objeto Estilotraz Acota Texto Sombreado
  Polilinea Ventana Tabla Material Directriz múltiple Objeto de centro` (acmatchRes 18–49).
  **Fix:** PROPS-D68.

#### MAT-04 — The Text, Dimension and Hatch special properties are not matched

- **Severity:** medium · help (Property Settings: on by default), d07-6 (the dialog's list).
  **mellowcad:** scratch `c/mat`: a text keeps `Standard`. **Fix:** PROPS-D69.

#### MAT-05 — MATCHPROP gives a hatch or an MTEXT the source's linetype

- **Severity:** medium · **Status:** verified against the help only ("Linetype: all objects except
  attributes, hatches, multiline text, points, and viewports"). **Fix:** PROPS-D47.

#### MAT-06 — A locked destination's pick says nothing

- **Severity:** medium · **AutoCAD:** d07: `Destination object on a locked layer. Cannot be
  updated.` (es acmatchRes 28 `El objeto de destino no puede actualizarse porque se encuentra en
  una capa bloqueada.`), the prompt again. **mellowcad:** the pick finds nothing and starts a window.
  **Fix:** PROPS-D70.

#### MAT-07 — A source on a locked layer is passed over

- **Severity:** medium · **AutoCAD:** d08-3: taken, `Current active settings:` follows.
  **mellowcad:** scratch `me/prp`: the prompt stays. **Fix:** the source pick takes a locked find.

#### MAT-09 — A preselection is not taken as the source

- **Severity:** medium · **AutoCAD:** d08-1: one object selected, `MATCHPROP` → no source prompt,
  `Current active settings:` and the destination prompt. **mellowcad:** scratch `me/prp`:
  `Select source object:`, the set dropped. **Fix:** PROPS-D71.

### Low

- **LAY-06** — Layer 0 and new layers are `#e2e8f0`, not index 7 (p300: 62 = 7), so `-COLOR 7`
  (`#ffffff`) differs from ByLayer on layer 0 (COL-06 merged here). Fix PROPS-D49.
- **LAY-10** — The delete refusals are worded by mellowcad; AutoCAD's LPM keeps Delete enabled and
  answers with `Layer - Not Deleted`: `The selected layer was not deleted.` / `The following layers
  cannot be deleted:` `• Layers 0 and Defpoints` `• The current layer` `• Layers containing
  objects` `• Xref-dependent layers` (d04-6). Fix PROPS-D67.
- **LAY-11** — Tests: `CadRuntime.test.ts:363` pins U not undoing the drop-down's layer; `:366`
  and `Document.test.ts:218` promise locked and test Off only; no layer test cites a source.
- **LAY-12** — The F2 rename WHY is not forced: the LPM takes F2 when focused (help). Fix PROPS-D72.
- **LAY-15** — The LPM and the Layers drop-down list layers in creation order; AutoCAD sorts them by
  name (d04-1, d05-1), and the LPM writes the colour's name beside its swatch (`white`, `red`,
  `blue`; es `blanco`, `rojo`, e02-1). Fix PROPS-D73.
- **COL-05** — Spanish -COLOR refuses bare `RED`, `BYLAYER`, `BYBLOCK` (p107b, p113b, p115).
- **COL-07** — Tests: `currentPropertyCommands.test.ts:220` puts 0 (refused, p100) with 8 and
  `byblock` (accepted, p103, p114); `:213`'s spaces have no source; the 2023 citations in
  `settingsPrompts.test.ts:16–19` hold on 2027 (p105, p116, p142, p147, p163): cite them.
- **LWT-02** — `Current lineweight: None` (es `Ninguno`, table 21081) for 0 (p140, p140b).
- **LWT-03** — Spanish -LWEIGHT writes `BYLAYER` and `ByLayer` (p140, p147, p151, p154 es), not
  `PORCAPA` / `PorCapa`; `currentPropertyCommands.test.ts:423` pins `PORCAPA` without a source.
- **LWT-04** — A tie rounds to the thicker (0.325 → 0.35, 0.07 → 0.09) where AutoCAD takes the
  thinner (p143, p161): a float comparison. Fix PROPS-D4.
- **LWT-06** — `LINEWEIGHT` runs LWEIGHT (p162).
- **LWT-08** — Tests: `LweightTool.ts:51` and the transparent heading cite 2023 (p154 holds it);
  `:365` pins −1; no U echo test in Spanish.
- **LTY-02** — A name not found names `acad.lin` in 2027, even in a metric drawing (p213, both
  languages). Fix PROPS-D21.
- **LTY-03** — LTSCALE's default is `%.4f` whatever LUPREC (p234, table 20988). Fix PROPS-D22.
- **LTY-05** — The listings: the file's leaves Continuous out (p202), Set's is sorted (p217), no
  match writes the header and the message on the dashes' line (p218). Fix PROPS-D25, D26.
- **LTY-06** — CELTYPE is `DASHED` in AutoCAD (p209); mellowcad's ids are `Dashed`. Fix PROPS-D24.
- **LTY-07** — Set refuses `_BYL` and, in Spanish, `BYLAYER` (p224, p229). Fix PROPS-D23.
- **LTY-08** — `setSelectionLinetype` stores an unknown linetype (`runtimeProperties.ts:112–122`).
- **LTY-09** — The English walk of -LINETYPE types `?` into a keyword prompt, ends the command and
  records STRETCH (`englishSurface.test.ts:1218–1229`).
- **FIL-01** — FILL's tests cite acc/w22, w24 (2023), held on 2027 by p168–p171, p174, p178; no U
  echo test, no Spanish `Opción no válida.`, no English walk.
- **PRP-02** — The object filter lists the types in the order picked; AutoCAD by count, most
  first (d06-2, e01; ties unverified). Fix PROPS-D64.
- **PRP-04** — Tests: the filter's labels and order are not asserted against a probe.
- **MAT-01** — The Spanish prompts are the help's (`Seleccione …`), the program's are
  `Designe objeto de origen:` and `Designe objeto(s) de destino o [PArámetros]:` (acmatchRes 15,
  13; e02).
- **MAT-08** — Tests: `properties.test.ts:114` always passes (the source has no overrides); no
  Spanish test; `:146` cites the 2026 help.
- **MAT-10** — MATCHPROP's cursor is a pickbox with a paintbrush (d07-1); here the crosshair.
  Fix PROPS-D74.

## 6. Decisions taken

From the subagents' reports (A: D1–D6, B: D20–D28, C: D40–D49) and the reviewer's (D60–D75):

- **PROPS-D1** — -LWEIGHT's `?` keeps `ByLayer` alone on its first line, in every language.
- **PROPS-D2** — COL-01 is fixed in ColorTool: table 26289's words as hidden options.
- **PROPS-D3** — -COLOR's and -LWEIGHT's prompts are not content fields (AutoCAD's are integer and
  real prompts), so the shared transparency path runs.
- **PROPS-D4** — Lineweight rounding compares with a 1e-9 tolerance; a tie takes the thinner.
- **PROPS-D5** — Only the aliases a probe showed: es COL, en COLOUR, en LINEWEIGHT.
- **PROPS-D6** — Layer 0's colour belongs to the LAY block (LAY-06).
- **PROPS-D20** — Keep the six linetypes loaded, with a WHY (no Load, no Linetype Manager here) and
  a coverage note citing p221.
- **PROPS-D21** — The not-found message names `acad.lin`.
- **PROPS-D22** — LTSCALE's default is written with four decimals.
- **PROPS-D23** — Set takes the table name `ByLayer` in any language and the global `_` form.
- **PROPS-D24** — The stored ids stay (`Dashed`): file data; Missing notes AutoCAD's capitals.
- **PROPS-D25** — Set's `?` sorted without case; the file's `?` leaves Continuous out.
- **PROPS-D26** — No match: the header and the message on the dashes' line.
- **PROPS-D27** — The blank line under the listings' heading stays (unverified on the desktop).
- **PROPS-D28** — LINETYPE's acad.pgp aliases in both languages.
- **PROPS-D40** — Layer-table edits and CLAYER become undoable, one step per gesture.
- **PROPS-D41** — UNDO's Layer (on by default) folds consecutive layer steps into one.
- **PROPS-D42** — A layer is in use when a block definition holds an object on it.
- **PROPS-D43** — The engine refuses a rename to a name in use (case-insensitive), with an invalid
  character, or of layer 0; the LPM shows the desktop's words.
- **PROPS-D44** — New Layer copies the selected layer's colour, linetype and lineweight and does not
  make it current (d04-4); with none selected, the defaults.
- **PROPS-D45** — es MATCHPROP's names: IGUALARPROP, IP, COPIARPROP; COPARPROP dropped from the
  aliases list (an alias, not a catalog key).
- **PROPS-D46** — MATCHPROP's prompts take acmatchRes 15 and 13 in both languages; `[Settings]`
  stays out while the dialog does not exist (known).
- **PROPS-D47** — MATCHPROP gives a linetype only to the types the help lists.
- **PROPS-D48** — es `LAYER` and DDLMODES join LAYER's names; -LAYER goes to Missing.
- **PROPS-D49** — Layer 0 and new layers take index 7's `#ffffff`, drawn as the theme's
  foreground as `-COLOR 7` objects already are (one colour for both). A file keeps its stored hex.
- **PROPS-D60** — Locked objects are selectable at `Command:` by a pick, a window, a crossing and
  ALL; drawn selected, with no grips (d02-1).
- **PROPS-D61** — A palette or drop-down edit of a set holding locked objects changes none of them,
  drops them from the set and says `One or more selected objects are locked and cannot be updated.`
  / `Number of objects removed from the selection set: n` (d03-6); the palette shows it as a notice,
  the dialog's look in Missing. The drop-downs' answer is **unverified** (only the palette was
  probed). A command given such a preselection says `n found` / `n was on a locked layer.` and
  leaves them out (p381), through `Select objects:`' own filter.
- **PROPS-D62** — A lock keeps the selection; Off drops what it hides (d09).
- **PROPS-D63** — Objects on a locked layer are drawn faded by LAYLOCKFADECTL's 50 % toward the
  background; at `Command:` the cursor over one shows the padlock badge, no rollover glow, and the
  rollover tooltip. LAYLOCKFADECTL typed goes to Missing.
- **PROPS-D64** — The filter names an array `Array (Rectangular)` / `Array (Polar)` /
  `Array (Path)` (es `Matriz (rectangular)`, the polar and path words from the same pattern,
  **unverified**), `Block Reference` with a capital R, and lists the types by count, most first,
  ties in the order picked (**unverified**).
- **PROPS-D65** — U and REDO name an edit made outside a command: `CHPROP` for the drop-downs on
  objects (es `CAMBPROP`), `Modify Property` for the palette (es **unverified**: the English
  word until a probe), `Grip Edit` for a grip (es `Editar pinzamiento`), `CLAYER` for the current
  layer (written `'CLAYER` as d05-1, es **unverified**), nothing for CECOLOR, CELTYPE, CELWEIGHT
  from a drop-down (d05-3).
- **PROPS-D66** — An LPM edit is a step named `-LAYER` (es `-CAPA`), written `'.-LAYER` as d04-2
  shows; consecutive LPM edits fold into one (PROPS-D41); a lock or unlock among them adds
  `Regenerating model.`.
- **PROPS-D67** — The LPM's refusals and the current-layer-off question take the task dialogs'
  words (d04-6, d04-7, d04-11, d04-13, d04-16), in a dialog of the editor's; Spanish from
  `AcTaskDialogs` (subagent C's extraction).
- **PROPS-D68** — MATCHPROP writes `Current active settings:` with the names of what this build
  matches, in AutoCAD's order (d07, e02), after the source is taken.
- **PROPS-D69** — MATCHPROP matches the Text and Dimension styles and a hatch's pattern; the rest
  of the special properties stay in Missing.
- **PROPS-D70** — A locked destination's pick says acmatchRes 28's words and asks again; a window
  leaves locked objects out with the same words (the window's own answer **unverified**).
- **PROPS-D71** — MATCHPROP takes a preselection of one object as the source; of several,
  **unverified** (acmatchRes 11 `Only one entity can be selected as source object.` suggests a
  refusal): it asks the source as now.
- **PROPS-D72** — F2 in the focused LPM renames, as the help says; F2 elsewhere stays the history.
- **PROPS-D73** — The LPM and the Layers drop-down sort by name, case-insensitive (layer 0 first
  as any name sorts it); the LPM's colour cell writes the colour's name for 1–7 beside the swatch.
- **PROPS-D74** — MATCHPROP's cursor is the pickbox with a paintbrush; drawn in the overlay.
- **PROPS-D75** — The Spanish desktop's own palette labels are read from e01-2 (`Escala de tipo
  de lín…`, `Estilo de trazado`, `Transparencia`, `Hipervínculo`), and the coverage drops their
  unverified mark where they match.

## 7. Tests proposed

Regression tests first, in each finding. Then the untested cells: -COLOR's 0 and 256 and es
`<1 (rojo)>` (p100, p105, p101); a LINE segment taking the colour, linetype and lineweight current
when it starts (p126, p154, p250); LTSCALE's U and REDO with `Regenerating model.` (p236);
-LINETYPE's U, REDO, UNDO 2 (p246–p249); FILL's U echo in both languages (p174, p175) and `ON or
OFf?` (p170); MATCHPROP's U echo (d07). Old citations replaced: `settingsPrompts.test.ts:16–19`,
`LweightTool.ts:51`, `FillTool.ts:9`, `polylineWidths.test.ts:500, :530` → the 2027 probes named.

## 8. What is not tested and why

The dialogs' look (presentation); the fade's exact colour (a canvas shade, checked by eye in the
browser once); the padlock's glyph.

## 9. What could not be reviewed and why

LAYER, LAYERCLOSE, PROPERTIES and MATCHPROP in the console (unknown, or the console dies:
p340–p358): their transparency (`'LAYER`, `'MATCHPROP`) stays **unverified**. The desktop's
Spanish pass ran without the mouse (another window covered the second monitor), so the Spanish
dialogs' words come from the tables, not from screenshots. The drop-downs' answer to a locked
selection, MATCHPROP's window over a locked destination, `Modify Property`'s Spanish name.

## 10. Refuted in the adversarial pass

- FILL, -COLOR and -LWEIGHT clearing the selection: AutoCAD does too (p117b, p152b, p172b).
- `RGB:` and `HSL:` at -COLOR's prompt: refused by AutoCAD too (p121, p122).
- Drawing on a locked current layer refused, or locking it asking: neither (p313).
- Off objects snapped: no, in both (p323).
- Layer1 / Capa1: match (table 53391).
- COL-06: a duplicate of LAY-06.
- The Layers drop-down blank for a mixed selection: AutoCAD's is blank too (d06-1): the coverage's
  **unverified** mark goes.

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| Layers: locked objects "cannot be selected" (code and `layers.ts`) | d02, d03, d09 | false (LKD-01) |
| Layers: Delete refused for 0, current, in use | p380 | false for a block's use (LAY-02) |
| Layers Missing: New Layer leaving the current layer | d04-4 | holds; LAY-05 closes it |
| Layers: the drop-down empty when mixed, **unverified** | d06-1 | holds: the mark goes |
| command-line.md UNDO: "each change from the Layers palette stays its own step" | p303, d04-3 | false (LAY-01, LAY-07) |
| Colour: es `1 (rojo)` **unverified** | p101 | holds: the mark goes |
| Colour: COLOUR "could not be verified" | p137 | settled (COL-04) |
| Lineweights: the thinner on a tie | p143 | false (LWT-04) |
| Lineweights: LINEWEIGHT "could not be verified" | p162 | settled (LWT-06) |
| Linetypes: `not found in acadiso.lin` | p213 | no longer true in 2027 (LTY-02) |
| Linetypes: `<1.00>` at the drawing's precision | p234 | false (LTY-03) |
| Linetypes: LTYPE, -LT, -LTYPE "could not be verified; es none"; `EC`† | p253, p238 | settled (LTY-01); EC holds |
| FILL: RELLENAR **unverified** | p176 | holds: the mark goes |
| MATCHPROP: es prompts "the help's words"; COPARPROP†; the settings line "not documented" | acmatchRes, d07, e02 | false (MAT-01, MAT-02, MAT-03) |
| Palette: the filter's labels **unverified** | d06-2, e01 | settled (PRP-01, PRP-02) |

Rules: `cad-runtime.md` "Settings are split on purpose" (layer table edits not undoable) is
**stale** (LAY-01); its table-entries paragraph ("the tables refuse to drop an entry in use") is
**broken** for a block's use (LAY-02); `cad-tools.md`'s free-text prompt ("no keyword is
dispatched from it") is **broken** at the command line (COL-01); `cad-catalogs.md`'s "Spanish is
Spanish AutoCAD's" is broken by LWT-03. Checked and holding: current properties through
`UpdateSettingsCommand`, one step per run named as echoed, transparent settings commands, a
command's end dropping the selection, the LAYERCLOSE fold's WHY, COLOR / LINETYPE / LWEIGHT
running their dash forms (the console does the same, p125, p153, p227), LWDISPLAY on by default.

## 12. Order of execution and estimate

One subagent per block, in this order (each commits alone; they share the catalogs and the
English snapshot):

1. **LAY** (LAY-01 to LAY-12, LAY-15) — the layer table through commands, its undo and UNDO Layer,
   delete, rename, New, the LPM's dialogs and order, aliases. Large.
2. **LKD** (LKD-01, LKD-02) — locked objects selectable at `Command:`, the edits refused, the
   preselection's report, the fade and padlock. Medium; after LAY (the layer's lock is a command).
3. **COL** (COL-01 to COL-07) — small.
4. **LWT** (LWT-01 to LWT-08) — small.
5. **LTY** (LTY-01 to LTY-09) — small.
6. **FIL** (FIL-01) — tests only.
7. **PRP** (PRP-01 to PRP-04) — the filter, U's names for edits outside commands. Medium; after
   LAY (CLAYER's name).
8. **MAT** (MAT-01 to MAT-10) — medium; after LKD (the locked pick).

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/properties.md`: every entry rewritten for what changes; -LAYER, LAYDEL, the task
  dialogs' look, LAYLOCKFADECTL typed, `Modify Property`'s Spanish name, the drop-downs' answer to
  locked objects into Missing; the unverified marks the probes settled dropped.
- `docs/coverage/modify.md` MATCHPROP; `command-line.md` UNDO's Layer and the preselection with
  locked objects.
- Rules: `cad-runtime.md` (layer edits are commands; the table-entries paragraph counts blocks),
  `cad-tools.md` (a value prompt that reads words is not a content field; the free-text prompt's
  dispatch), `cad-engine.md` (locked means not editable, still selectable).
- Catalogs: the aliases; MATCHPROP's prompts and settings line; the LPM's dialogs
  (`messages/{en,es,ar}.json`); -LWEIGHT's and -LINETYPE's messages; undo step names.
- Roadmap: Properties done, owning the style tables; for the Blocks review, 2027's -BLOCK converts
  the selected objects into a reference by default (`Object conversion=Convert`, p380) and
  BLOCK's analogue of LAY-02 (a block's layers); for the Workspace review, LWDISPLAY, LAYLOCKFADECTL,
  CECOLOR, CELTYPE typed (SETVAR).

## 14. Template improvements

- Add `acmatchRes.dll`, `AcTaskDialogs.resources.dll` and `AcLayerTools.resources.dll` to
  `research/strings/` (the sweep could not see MATCHPROP's or the LPM's words).
- annex-probes.md §4: a task dialog's command link (`CommandLink_<id>`) is clicked with
  `TDM_CLICK_BUTTON` as its push buttons are (`uia.ps1` handles only `CommandButton_`); a dialog
  whose Cancel UIA cannot invoke is closed with a posted `WM_COMMAND IDCANCEL`.
- annex-probes.md §4: before any desktop click, capture the whole monitor AutoCAD is on: another
  window can cover it (e01-1), and a click would land there; a pass without the mouse reads a
  palette by its handle (`shot <hwnd>`) and a combo box's items with `CB_GETLBTEXT`.
- template §4.1: an edit made outside a command (a palette, a drop-down, a grip) is a matrix row of
  its own for U's echo.
