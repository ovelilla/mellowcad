# Blocks review (BLOCK, INSERT, ATTDEF, -ATTDEF, ATTEDIT, EATTEDIT, ATTDISP, BLOCKSPALETTE, PURGE)

> **Status:** plan, 2026-10-26. The nineteenth review of `docs/coverage/roadmap.md`'s order, with
> skill `command-review`. Its phases 0–4 ran in one session, and the execution follows in that
> session block by block.
>
> It owns **blocks and attributes**: the block table, a block reference, attribute definitions and
> a reference's attributes, their commands, and PURGE of blocks.

## 1. Summary

The review found 2 critical, 8 high, 24 medium and 17 low findings over five blocks of findings
(prefixes BLK, PRG, INS, BOB, ATD, ATE). They are executed in four commits.

The criticals:

- **PRG-01: PURGE removed a block that was in use inside another.** The definition was used only
  by a referenced block's definition, and PURGE and the palette's delete removed it, so the outer
  references drew nothing (p150).
- **BLK-01: redefining a block from its own reference made it reference itself.** Every reference
  then drew nothing. AutoCAD refuses with `Block "B1" references itself` (p117, p119).

The highs, in three lines:

- Enter at -BLOCK's name and at its base point ended the command, where AutoCAD asks again; BLOCK
  dropped the preselection that AutoCAD uses (BLK-02 to BLK-04).
- -INSERT and -I were unknown. The X scale, Y scale and rotation that AutoCAD asks after the point
  were never asked, and the scale and angle carried over to the next insertion. Block names were
  matched case-sensitively (INS-01 to INS-04).
- ATTDEF kept its own justification and rotation where AutoCAD shares them with TEXT (ATD-01).

The analogues left by earlier reviews:

- **TXT-08:** the es `SIZ` holds; ATTDEF's Current line writes `SIZ` where AutoCAD writes `SI`
  (ATD-04).
- **Attributes share TEXT's layout:** the geometry holds (p320, p332, p340). The prompts around
  it do not: TXT-03 to TXT-07 all have analogues in ATTDEF (ATD-02, ATD-03, ATD-05, ATD-06).
- **-BLOCK's `Object conversion=Convert`** holds in both languages (p01); a layer used only inside
  an unused block goes in the same -PURGE All (p144).
- **PURGE's words (ERA-06)** are settled by -PURGE's own prompts (PRG-03).
- **HATCH-D75 was not achieved.** A hatch in a mirrored reference draws unreflected, and EXPLODE
  reflects it where AutoCAD keeps it (BOB-01, BOB-02).

**Evidence:**

- About 150 console probes in es-ES and en-US (p00–p05, p100–p156, p200–p239, p300–p344).
- A desktop pass in the English profile (d00–d09).
- The `acadres` tables, plus `atteditRes.dll` and `AcEAtteditRes.dll` (ATTEDIT's and EATTEDIT's
  words, which the merged tables lack).
- 120 scratch tests in `research/review/blocks/` (a, b, c, r): 52 of them fail, and each failure
  is a `differs` below.

## 2. Inventory

Commit `e777828`. AutoCAD 2027, `ACADVER` 26.0, `_VERNUM` X.118.0.0 (p00). The tables are dated
2026-10-20.

**The commands' own surface:**

- **Tools:** `BlockTool.ts`, `InsertTool.ts`, `AttDefTool.ts` (it reuses TEXT's `POINT_PROMPT`,
  `lineBelow` and `listTextStyles`), `AttEditTool.ts`, `AttDispTool.ts` and `attributeValues.ts`,
  all under `cad/application/tools/`.
- **Commands and runtime:** `cad/application/commands/blockCommands.ts` (CreateBlockCommand,
  PurgeBlocksCommand); `cad/application/runtimeBlocks.ts` (purgeBlocks, buildBlockPreview); the
  registrations in `cad/application/runtimeCommands.ts` (-ATTDEF, EATTEDIT, BLOCKSPALETTE, PURGE,
  ATTDISP transparent); `CadRuntime.doubleClick`, `insertBlock` and `purgeBlocks`.
- **Model:** `cad/domain/blocks.ts`, `attributes.ts`, `entityTypes.ts` (InsertEntity,
  AttributeDefinitionEntity, BlockAttribute), `Document.ts` (`blockInUse`, `removeBlock`),
  `entityTransforms.ts` (mirror with `patternReflected`), `entityProperties.ts`.
- **Grips, palette and file:** `selectToolGrips.ts` (insert: one grip; attdef: none); the palette
  rows in `EngineState.ts` (insert, attdef); the anonymous blocks dropped on save in
  `cad/serialization/drawingFile.ts`.
- **UI:** `components/cad/blocks-control.tsx`, `palette-panel.tsx`; the rail.
- **Catalogs:** names, keywords and prompts in `en`, `es` and `ar`.
- **Tests:** `cad/application/tools/blocks.test.ts`, `attributes.test.ts`, `blockPrompts.test.ts`;
  rows in `currentProperties.test.ts`, `elevation.test.ts`, `ucs.test.ts`, `selection.test.ts`,
  `englishSurface.test.ts` and `locale.test.ts`.
- **Knowledge:** `docs/coverage/draw.md` (BLOCK, INSERT, ATTDEF, ATTEDIT, ATTDISP),
  `docs/coverage/modify.md` (PURGE), `docs/coverage/blocks-palette.md`; the rules `cad-engine.md`
  (Blocks), `cad-tools.md` and `cad-catalogs.md`.

**Related tools, reviewed in their part:**

- TEXT's prompts and settings: TEXTSIZE, the justification and the rotation that ATTDEF shares.
- MIRROR and EXPLODE of a reference.
- The clipboard's block landing.
- The Properties palette and grips of a reference and of an attribute definition.

**Areas owned elsewhere** (contract only):

| Area | Owner |
| --- | --- |
| `Select objects:` and preselection | ERASE |
| placement | MOVE |
| point input, snaps, Ortho, Polar, dynamic input, the command line, undo, current properties, grips, the palette, files, render | LINE |
| the transforms | Transforms |
| EXPLODE | Pieces |
| TEXT's prompts and object | Text |
| the hatch object | HATCH |
| the array's anonymous block | Arrays |
| style tables, locked layers | Properties |

**Areas this review owns:** blocks and attributes. That covers the block table (names, redefinition,
self-reference, in use, purge), a reference (placement, scale, mirror, display, palette rows, grips),
attribute definitions and a reference's attributes, and the attribute value prompts and editors.

## 3. Probes

Console inputs are in `scripts/research/probes/blocks/<id>.txt` (`.plain` runs untraced; `.es` or
`.en` runs in one locale only); run them with `scripts/research/probe.sh blocks <ids>`. The desktop
pass is `scripts/research/probes/blocks/d01-d09.sh`, with `lib-dsk-en.sh` and `post.ps1` (a posted
`WM_COMMAND IDCANCEL` for a modal dialog COM cannot close). Transcripts, plots and screenshots are
in `research/probes/blocks/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | version; ATTDIA 1, ATTREQ 1, ATTMODE 1, AFLAGS 16, ATTMULTI 1, INSUNITS 4, MIRRTEXT 0, TEXTSIZE 2.5 |
| p01–p05 | -BLOCK, -INSERT (`?`, Scale `<1>`, X/Y/rotation), -ATTDEF, ATTDISP and -PURGE in full; the dialog commands in the console |
| p100–p156 | -BLOCK: names, `?`, invalid names, redefinition, self-reference, mOde, Annotative, Enter, base point Z/UCS/`@`, current properties, empty set, preselection, attribute definitions, U; -PURGE: wildcard, verify, nested, All, anonymous, Enter, aliases |
| p200–p239 | -INSERT: names, aliases, repeat, X/Y/rotation, Scale and Rotate (0, negative, two points, `45d30'`), persistence, `?`, case, `*U1`, UCS, ELEVATION, LASTPOINT, U/REDO echo, current properties; a reference mirrored with a hatch or a text (exploded, plotted), STRETCH |
| p300–p344 | ATTDEF aliases, modes, tag/prompt/default, Current line, Justify/Style, stacking, TEXT sharing; INSERT's values (order, Verify, Preset, Constant, ATTREQ 0, backslash, empty default); -ATTEDIT; ATTDISP; ATTRIB layer and colour; a mirrored reference's attributes; Insertion snap |
| d00, d01 | -BLOCK's Convert opens Edit Attributes (ATTDIA 1 and 0; Cancel keeps the defaults); -INSERT with ATTDIA 0 asks at the command line |
| d02 | a reference's grips: the insertion point, plus one per attribute whose Lock position is N; hover is hot with no menu |
| d03 | the Properties palette of a reference, a mirrored one and an attribute definition; the definition's grip |
| d04 | double-click on a reference: `_eattedit`, `Select a block: <point>`, the Enhanced Attribute Editor |
| d05 | ATTEDIT `Select block reference:`, Edit Attributes; refusals of ATTEDIT and EATTEDIT |
| d06 | INSERT opens the Blocks palette; its tabs, Options, right-click menu, insertion prompt, ghost, U/REDO echo |
| d07, d08 | the Purge dialog; the Block Definition dialog |
| d09 | Enter at -BLOCK's name and an empty set (COM); -BLOCK in a turned UCS |

## 4. Matrix

Cells are `state · probe · test`. The scratch tests live in `research/review/blocks/<letter>/`
(`a`: BLOCK and PURGE, `b`: INSERT and the reference, `c`: attributes, `r`: palette rows).

### BLOCK / -BLOCK (BLK)

Columns: name · base point · Redefine? · Select objects.

| Row | State |
| --- | --- |
| A | **BLOCK, B; es BLOQUE, BQ:** match · p151, p152 · englishSurface.test.ts. **-BLOCK, -B, es -BLOQUE, -BQ, BMAKE, BMOD, ACADBLOCKDIALOG, es MODBLQ:** differs BLK-09. **Repeat:** untested · p152. **'BLOCK refused:** untested · p103 |
| B | **Name:** Enter differs BLK-02 · p100–p102, d09; `?` differs BLK-06; invalid characters, 255/256 characters and `*U1` untested · p106–p111; case differs PRG-04 · p115. **Redefine?:** known in Missing, now built for BLK-01 (D7) · p113, p114, p116, p118; self-reference differs BLK-01 · p117, p119. **Base point:** `[Annotative/mOde]` known · p120–p123; FOO differs BLK-07 |
| C | **x,y,z, ELEVATION, `@`:** untested · p126, p127, p129 · elevation.test.ts:380. **Z warning:** differs BLK-10. **Turned UCS:** decided D14 · p128, p155, d09 · ucs.test.ts:383 |
| D, E | owned (LINE); 'ZOOM at the base point untested · p153 |
| F | **U after BLOCK, after a redefinition, after PURGE:** untested · p136–p138 · blocks.test.ts:70, :637. **U after an empty run:** untested · p139 |
| G | **Enter at the name, at the base point, at an empty `Select objects:`:** differs BLK-02, BLK-03, BLK-08 · d09 |
| H | **Current properties on the reference:** match · p130 · currentProperties.test.ts:395. **Preselection:** differs BLK-04 · p132. **Nothing left selected:** match · p133 · selection.test.ts:1613. **Attribute definitions:** differs ATE-01 · p134, p305, d00, d01. **Their order:** match · p307–p309 · attributes.test.ts:183 |
| J | owned · blocks.test.ts:498. **Anonymous blocks dropped on save:** unverified · p148, p149 · drawingFile.test.ts:1494 |
| K | **`conversión de objetos=Convertir`:** match · p01. **es refusal:** differs BLK-11 |
| L | match but the refusals above · p01 · blockPrompts.test.ts:76 |

### PURGE / -PURGE and the block table (PRG)

| Row | State |
| --- | --- |
| A | **-PURGE, -PU; es -LIMPIA, -LI:** differs PRG-02 · p151, p152. **PURGE:** its dialog, d07 |
| B | **Type prompt, names `<*>`, verify, per-name question, report words:** differs PRG-03 · p04, p140, p141, p146, p154, erase/p326, erase/p327 |
| O | **Nested in a used block:** differs PRG-01 · p150. **A nested chain, all unused, in one run:** match · p142. **Anonymous blocks:** differs PRG-05 · p147. **A block in use:** match · p145 · blocks.test.ts:631. **A layer used only in an unused block:** known (layers are Missing) · p144 |
| F | **U:** match · p138 · blocks.test.ts:637 |

### INSERT / -INSERT / BLOCKSPALETTE (INS)

Columns: name · insertion point · Scale · Rotate · X, Y and rotation after the point.

| Row | State |
| --- | --- |
| A | **-INSERT, -I; es -IN, -INSERT:** differs INS-01 · p200, p201. **INSERT, I, IN open the Blocks palette:** differs INS-10 · p05, p200, p201, d06. **Repeat; '-INSERT refused:** match · p202 |
| B | **Name prompt and `<B1>`:** match · p02, p208 · blockPrompts.test.ts:107. **Case:** differs INS-04 · p210. **`?`:** differs INS-05. **Undefined name, `*U1`:** known · p211. **Enter with no default:** differs INS-07 · p217. **Point prompt's keywords:** known · p02. **Enter at the point:** differs INS-06 · p216. **Scale `<1>`:** differs INS-11. **Scale 0 and negative:** differs INS-08 · p205. **Two points at Scale or Rotate:** differs INS-09 · p236. **Rotate:** match · p207, p237. **X, Y and rotation after the point:** differs INS-02 · p02, p203, p205–p207, p219. **Persisting scale:** differs INS-03 · p204. **es point prompt:** differs INS-12 |
| C | **`@`, LASTPOINT, a Z, ELEVATION, a turned UCS:** match · p212–p214 · scratch b |
| F | **U:** match · p215 · blocks.test.ts:237. **U and REDO echo:** differs INS-13 · p225, d06-9 |
| H | **Current properties:** match · p218. **ByBlock:** known in the roadmap, missing from the entry (BOB-03). **Layer 0 inheritance:** match · p343 · blocks.test.ts:263 |
| I | **MOVE, ROTATE, SCALE, MIRROR:** owned · blocks.test.ts:296, :311. **STRETCH:** match · p224. **EXPLODE of a mirrored text:** match · p223, p233. **A hatch in a mirrored reference:** differs BOB-01 (display), BOB-02 (EXPLODE) · p227–p231. **Grips:** the insertion point's matches d02; an attribute whose Lock position is N has its own grip in AutoCAD, known (ATTEDIT Missing). **Palette rows:** differs BOB-04 · d03 |
| J | **Round trip with elevation, colour, mirror and attributes:** untested · scratch b. **Paste:** owned; case under INS-04 |
| M | **The ghost in the block's own colours:** differs INS-16 · d06-7. **Palette insertion writes only the prompt line:** match · d06-6 |
| O | **The palette's per-block delete:** differs INS-15 · d06-4 |

### ATTDEF / -ATTDEF (ATD)

| Row | State |
| --- | --- |
| A | **ATTDEF, ATT; es ATRDEF, AT, -AT, -ATRDEF:** match · p300, p301. **en -ATT, DDATTDEF, DDATTE; es ATR, DDATTE:** differs ATD-10 · p300, p341, p342 |
| B | **The modes prompt's seven keywords:** decided D60 · p03, p319. **Mode letters es/en:** untested · p317, p318. **AFLAGS kept:** untested · p306. **Tag:** Enter, lower case: match · p315 · blockPrompts.test.ts:42; space and `!` differ ATD-07 · p313, p314. **Backslash:** differs ATD-08 · p311, p315, p329. **Constant:** match · p316. **Current line:** es after TL differs ATD-04 · p320; fixed height differs ATD-06 · text/p321; after Style and `?` differs ATD-05 · p325. **Justification and rotation shared with TEXT:** differs ATD-01 · p326, p327. **Height shared:** untested · p326. **Enter at the start point:** differs ATD-02, ATD-03 · p321, p322, p324. **The stack's geometry:** untested · p320 |
| H | **CLAYER and CECOLOR:** match · p328 · currentProperties.test.ts:174 |
| I | **Grip:** differs ATD-09 · d03-5. **Rows:** match in substance · d03-4 · scratch r (the Text group lacks Annotative, Style, Width factor and Obliquing, as TEXT's does: owned by the Text review) |

### ATTEDIT / EATTEDIT / ATTDISP and the values (ATE)

| Row | State |
| --- | --- |
| A | **ATTEDIT, ATE, EATTEDIT, ATTDISP:** match · p342. **-ATTEDIT:** known · p330. **'ATTDISP:** untested · p336 |
| B | **INSERT's values:** match · p303, p304, p306 · attributes.test.ts:206–278. **Empty default:** untested · p344. **ATTREQ 0, ATTDIA 1:** known · p312, d01. **BLOCK's Convert:** differs ATE-01 · d00, d01. **ATTEDIT's and EATTEDIT's pick prompts and refusals:** differs ATE-05 · d04, d05 |
| F | **U of ATTDISP:** differs ATE-02 · p337 |
| J | **ATTMODE saved:** match · p338, p339 · attributes.test.ts:415 |
| L | **The double-click's echo:** differs ATE-03 · d04 |
| H | **An ATTRIB keeps layer 0 and ignores CECOLOR:** untested · p331. **A mirrored reference's attributes stay readable:** match · p332 |
| O | **Insertion snap:** match · p340 · attributes.test.ts:516 |

## 5. Findings

Each finding's full evidence (transcript lines, scratch test) is in the probe and the test it
cites; the format is template §5.1, condensed.

### Critical

#### PRG-01 — PURGE and the palette's delete remove a block used only inside a referenced block

- **Row:** O · **Status:** verified
- **Where:** `cad/domain/Document.ts:292` (`blockInUse` reads model space only),
  `cad/application/runtimeBlocks.ts:24`, `EngineState.ts` `referenceCount`
- **AutoCAD:** p150 says `No unreferenced blocks found.`, and B1 is kept.
- **mellowcad:** scratch a "O nested purge" says `1 block purged.`, and B2's references draw
  nothing.
- **Fix:** D3, "in use" made transitive through the definitions in use.
- **Regression test:** `blocks.test.ts` (p150, p142).

#### BLK-01 — Redefining a block from a set that holds its own reference makes it reference itself

- **Row:** B · **Status:** verified
- **Where:** `BlockTool.ts` `commit`
- **AutoCAD:** p117 and p119 (nested) say `Block "B1" references itself` / `Regenerating model.` /
  `*Invalid*`; es `El bloque "B1" hace referencia a sí mismo`, `*No válido*` (id 20812).
- **mellowcad:** scratch a "B self reference" leaves the definition as `[insert:B1]`.
- **Fix:** D6, with the redefine question (D7).
- **Regression test:** `blockPrompts.test.ts`.

### High

#### BLK-02 — Enter at -BLOCK's name ends the command

- **Status:** verified
- **AutoCAD:** p100–p102 and d09 say `Invalid block name.` and ask again; only Escape leaves.
- **Fix:** D11. The coverage's "Enter ends" is false.

#### BLK-03 — Enter at the base point ends the command

- **Status:** verified
- **Where:** `BlockTool.ts` `enterBase` returns `false`
- **AutoCAD:** p124 says `Point or option keyword required.` and asks again (AllowNone false).
- **Fix:** D11. This breaks a `cad-tools.md` rule (a prompt asked again at Enter returns `true`).

#### BLK-04 — BLOCK drops the preselection

- **Status:** verified
- **Where:** `BlockTool.onActivate`, `ctx.selection.clear()`
- **AutoCAD:** p132: after the base point, `1 found` and the end, with no `Select objects:`.
- **Fix:** D9, through `ObjectSelector.preselect`.

#### INS-01 — -INSERT, -I and es -IN are unknown

- **Status:** verified
- **AutoCAD:** p200, p201; acad.pgp `-I,*-INSERT` (en), `-IN,*-INSERT` (es).
- **Fix:** register -INSERT as the insert tool under its own name, as -ATTDEF is (D30).

#### INS-02 — No X scale, Y scale or rotation is asked after the point

- **Status:** verified
- **Where:** `InsertTool.ts` `place`, and its "WHY" comment
- **The prompts:** `Enter X scale factor, specify opposite corner, or [Corner/XYZ] <1>:` /
  `Enter Y scale factor <use X scale factor>:` / `Specify rotation angle <0>:`
  (es `Indique factor de escala X, precise esquina opuesta, o [Esquina/XYZ] <1>:` /
  `Indique factor de escala Y <usar factor de escala X>:` / `Precise ángulo de rotación <0>:`).
- **What skips them:** Scale given skips X and Y; Rotate given skips the rotation (p02, p203,
  p205–p207).
- **Refusals (p219):** `Requires numeric value.`, `Value must be nonzero.`,
  `X2D corner point, or option keyword.` (es `Xuna esquina 2D o una opción.`), and the angle's.
- **Scenario:** `-I B1 5,5 2 3 45` places at scale 1 and runs `2`, `3` and `45` as unknown
  commands.
- **Coverage:** its Missing row described a reinvented gesture (the session's scale standing in
  for the prompts), which AGENTS.md rules out, so it is a finding.
- **Fix:** D31.

#### INS-03 — The scale and angle carry over into the next INSERT

- **Status:** verified
- **AutoCAD:** p204: each run starts at 1 and 0.
- **The test:** `blocks.test.ts:184` asserts the wrong behaviour.
- **Fix:** D32.

#### INS-04 — Block names are matched case-sensitively

- **Status:** verified
- **Where:** `InsertTool.ts` (`getBlock(name)`), `clipboard.ts` `planPaste`
- **AutoCAD:** p210: `b1` inserts B1.
- **Fix:** D5 and D34, with PRG-04.

#### ATD-01 — ATTDEF keeps its own justification and rotation

- **Status:** verified
- **Where:** `AttDefTool.ts`, the fields `justify` and `rotation`
- **AutoCAD:** p326 and p327: TEXT's MC is ATTDEF's next justification, ATTDEF's TR is TEXT's next,
  and TEXT's 30° is ATTDEF's `<30>`.
- **Fix:** D61, through TEXT's settings (`setCommandSettings`).

### Medium

| Id | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| BLK-06 | `?` lists bare names and asks again; AutoCAD asks `Enter block(s) to list <*>:`, prints `Defined blocks.`, the quoted names and the counts table, and ends | p104, p105, p156 | D12 (with INS-05) |
| BLK-07 | the base point refuses with `Invalid point.`; AutoCAD with `Point or option keyword required.` | p01, p125 | `takes()` |
| BLK-08 | Enter at an empty `Select objects:` defines nothing; AutoCAD defines an empty block | p131, p139, d09 | D10 |
| BLK-09 | -BLOCK, -B, es -BLOQUE, -BQ, BMAKE, BMOD, ACADBLOCKDIALOG and es MODBLQ are unknown | p100, p101, p151, p152, acad.pgp | D1 |
| PRG-02 | -PURGE, -PU, es -LIMPIA, -LI are unknown | p151, p152 | D2 |
| PRG-03 | PURGE asks nothing and reports invented words (`1 block purged.`, `No unused blocks.`) | p04, p140, p141, p146, p154, erase/p326, erase/p327 | D2 |
| PRG-04 | `b1` beside B1 makes a second block; AutoCAD asks to redefine B1 | p115 | D5 |
| ATE-01 | BLOCK's Convert asks each value at the command line, and Escape drops the whole BLOCK; AutoCAD opens Edit Attributes on the new reference (whatever ATTDIA, unless ATTREQ is 0), and its Cancel keeps the defaults. The console, which shows no dialog, asks nothing (p134, p305); that is its artefact | d00, d01 | D90 (it replaces D8 and D65) |
| INS-05 | `?` lists bare names and asks again; see BLK-06 | p02, p208, p209, p238 | D35 |
| INS-06 | Enter at the insertion point ends INSERT; AutoCAD refuses it | p216 | D36 |
| INS-07 | Enter at the name with no default says `Block "" is not defined.` and asks again; AutoCAD says `Invalid block name.` and ends | p217, p238 | the `invalidBlockName` message; the end |
| INS-08 | Scale `0` and a negative are dropped in silence; AutoCAD says `Value must be nonzero.`, and `-2` gives (−2, −2, 2) | p205 | D31 |
| INS-09 | Scale and Rotate take no two points; AutoCAD asks ` Specify second point:` | p236 | D38 |
| INS-10 | INSERT, I and es IN run the command line; 2027 opens the Blocks palette | p05, p200, p201, d06-1 | D30 |
| INS-15 | the Blocks palette deletes a block; AutoCAD's thumbnail menu offers Insert, Insert and Explode, Copy to Favorites, and no delete | d06-4 | D91 |
| BOB-01 | a hatch in a mirrored reference draws with its pattern unreflected (HATCH-D75 not achieved) | p230, p231 plots | D37 |
| BOB-02 | EXPLODE of a mirrored reference reflects its hatch's angle and origin; AutoCAD keeps the pattern | p227, p228 (the origin rule in p234 is **unverified**) | D37 |
| BOB-04 | the palette files a reference under Block (Name, Scale, Rotation) and Position; AutoCAD under Geometry (Position X/Y/Z, Scale X/Y/Z), Misc (Name, Rotation, …) and Attributes | d03-2, d03-3; scratch r | D94 |
| ATD-02 | Enter at ATTDEF's start point with nothing to continue does nothing; AutoCAD refuses it (TXT-03's analogue) | p321, p322 | refuse as TEXT does |
| ATD-03 | Enter continues below a definition that U took back (TXT-04's analogue) | p324 | D62 |
| ATD-05 | after Style and `?`, the Current line is not written again, and `?` asks the style again (TXT-05/06) | p325 | TEXT's Current line and `?` path |
| ATD-07 | the tag refuses a space and `!` in silence; in AutoCAD a space ends the tag and `!` is taken | p313, p314 | D63 |
| ATD-09 | a loose attribute definition shows no grip; AutoCAD shows one at its insertion point | d03-5 | D67 |
| ATE-05 | ATTEDIT and EATTEDIT ask no question (`ATTEDIT:`) and ignore a pick on something else; AutoCAD asks `Select block reference:` / `Select a block:` and refuses with `That object is not a block.`, `That block has no editable attributes.` (EATTEDIT: `The selected entity is not a block.`, `The selected block has no editable attributes.`), then asks again | d05; atteditRes 1, 3, 4; AcEAtteditRes 37, 38, 43 | D92 |

### Low

| Id | Finding | Evidence |
| --- | --- | --- |
| BLK-10 | no `Beware, Z insertion base is not zero.` (es `Cuidado, la base de inserción de Z no es cero.`, id 20799) | p126, p127 |
| BLK-11 | es `Nombre de bloque no válido.`; -BLOCK's console says `Nombre bloque no válido.`, while -INSERT's says `Nombre de bloque no válido.` (20849): two message ids | p100, p106, p217 |
| BLK-12 | U after a redefinition writes `Regenerating model.` in AutoCAD | p137 |
| BLK-13 | tests cite "2023"/"2026" and assert `Invalid point.`; `blocks.test.ts:82` asserts the re-ask | — |
| PRG-05 | -PURGE deletes unused anonymous blocks (`Deleting block "*U1".`); here none (D4) | p147 |
| INS-11 | Scale's default reads `<1.00>`; AutoCAD writes `<1>` | p02, p204 |
| INS-12 | es point prompt `Precise punto de inserción o`; the console says `Especifique un punto de inserción o` | p02, p200 |
| INS-13 | U and REDO echo `INSERT`; AutoCAD echoes `-INSERT` (and so after a palette insertion) | p225, d06-9 |
| INS-16 | the insertion ghost is drawn in the rubber band's colour; AutoCAD draws the block in its own colours with the attribute defaults (D93) | d06-7 |
| BOB-03 | ByBlock is missing from BLOCK's and INSERT's Missing (the roadmap has it) | — |
| ATD-04 | es Current line `Justificar:  SIZ` after TL; AutoCAD `SI` (TXT-08) | p320 |
| ATD-06 | with a fixed-height style the Current line shows TEXTSIZE (TXT-07) | text/p321 |
| ATD-08 | a leading `\` is always dropped; AutoCAD drops it only before `\` or a blank (D64) | p311, p315, p329 |
| ATD-10 | en `-ATT`, `DDATTDEF`, `DDATTE` and es `ATR`, `DDATTE` are unknown (D68) | p300, p341, p342 |
| ATE-02 | U of ATTDISP echoes `ATTDISP Regenerating model.`; AutoCAD `ATTDISP` alone (D66) | p337 |
| ATE-03 | a double-click on a reference writes nothing; AutoCAD writes `Command: _eattedit` and `Select a block: <point>` | d04 |
| ATE-04 | tests: `attributes.test.ts:100` asserts a refusal AutoCAD does not make; 2023/2026 citations; `:183` has no probe; `:543`'s comment misreads pieces/p254 | — |

## 6. Decisions

The owner answers no technical, design or product question (AGENTS.md); each is decided here, the
most standard option, with one line on why.

**BLOCK and the table**

- **D1:** -BLOCK, -B (es -BLOQUE, -BQ) are the block tool under their own name, as -ATTDEF is.
  BMAKE, BMOD and ACADBLOCKDIALOG are BLOCK's aliases, and es MODBLQ (acad.pgp).
- **D2:** PURGE and -PURGE (-PU; es LIMPIA, LI, -LIMPIA, -LI) run one tool asking -PURGE's
  prompts, as HATCH asks -HATCH's (HATCH-D31); the console runs PURGE that way too (p152).
  - The type prompt offers only Blocks, the one type built, and its Enter ends.
  - Then the names `<*>` (`shared/wildcard`), `Verify each name to be purged? [Yes/No] <Y>:`,
    `Purge block "B1"? <N>`, and AutoCAD's report lines. Each run is one undo step.
  - The keys `noUnusedBlocks` and `blocksPurged` stay, unused.
- **D3:** "in use" is transitive: model space, or the definition of a block in use. PURGE removes
  the closure of unused blocks in one run (p142, p150).
- **D4:** `*` takes unused anonymous blocks too, reported by name (p147); their drop on save stays.
- **D5:** block names are matched case-blind and keep their first spelling (p112, p115). Ids are
  unchanged, so the file format does not change.
- **D6:** a set that reaches the block being defined, directly or nested, is refused in AutoCAD's
  three lines and the command starts again (p117, p119).
- **D7:** the redefine question, built for BLK-01:
  - `Block "%s" already exists. Redefine it? [Yes/No] <N>:` (es
    `El bloque "%s" ya existe. ¿Desea redefinirlo? [Sí/No] <N>:`).
  - No or Enter starts the command again (p114). FOO says `Yes or No, please.` and then
    `Redefine it? [Yes/No] <N>:` (p118).
  - After the set it reports `Block "B1" redefined`, and U writes `Regenerating model.` (p137).
- **D8:** replaced by D90.
- **D9:** BLOCK takes a preselection: after the base point, `N found` and the end (p132).
- **D10:** Enter at an empty `Select objects:` defines an empty block, one undo step (p131).
- **D11:** Enter at the name says `Invalid block name.` and asks again. Enter or FOO at the base
  point says `Point or option keyword required.` and asks again.
- **D12:** `?` asks `Enter block(s) to list <*>:`, writes `Defined blocks.`, the quoted names and
  the counts table, and ends. `Press ENTER to continue:` is left out: WHY, the history scrolls here
  and no listing pages.
- **D13:** write the Z warning after a base point whose Z (ELEVATION included) is not 0.
- **D14:** in a turned UCS, AutoCAD 2027 moves the converted objects. Its reference lands at the
  base point turned twice, both in the console (p155) and on the desktop (d09): the line
  (4.33,2.5)–(8.66,5) comes back from EXPLODE at (2.5,4.33)–(6.83,6.83).
  - mellowcad keeps them in place: copying a defect that moves the user's geometry is no muscle
    memory.
  - The deviation gets a `WHY` at `BlockTool` and a line in BLOCK's Missing.

**INSERT, BLOCKSPALETTE and the reference**

- **D30:** INSERT, I and es IN open the Blocks palette, as 2027 does (p05, d06). -INSERT, -I and
  es -IN run the command line.
  - A palette click goes to -INSERT's point prompt, writing only the prompt line (d06-6).
  - The step is named `-INSERT` (d06-9).
- **D31:** after the point, the X scale, Y scale and rotation prompts, skipped as AutoCAD skips
  them.
  - `InsertEntity` stores an X and a Y scale (Z is |X|, p203, p205); `mirrored` becomes
    derivable. The file version is bumped, and an old file's `scale`/`mirrored` are read into
    them.
  - A reference whose |Y| ≠ |X| draws through an affine map for every type that has a closed
    form: line, polyline without arcs, circle → ellipse, arc → elliptical arc, ellipse, spline,
    point, a hatch's loops.
  - Text, attributes and polyline arcs under a non-uniform scale are drawn at X's scale for now.
    That gap goes to INSERT's Missing, worded as a gap, with the probe that shows AutoCAD's.
  - Corner, XYZ, Basepoint, Explode and REpeat stay Missing.
- **D32:** no session scale or angle; each run starts at 1 and 0 (p204).
- **D33:** superseded by D31: a negative factor is a mirrored axis.
- **D34:** INSERT and paste look a name up case-blind (p210).
- **D35:** BLOCK's and INSERT's `?` share one listing (D12).
- **D36:** Enter at the insertion point says `Point or option keyword required.` (p216).
- **D37:** a hatch in a reflected reference is drawn with its pattern reflected; EXPLODE keeps the
  pattern's angle and its lattice (p227, p228, p230). The exploded origin follows p227; p234's
  offset stays **unverified**.
- **D38:** Scale and Rotate take two points through the runtime's ` Specify second point:` (p236).
- **D91:** the palette's per-block delete is removed. AutoCAD's Blocks palette has none (d06-4);
  PURGE deletes. The palette's thumbnail menu is not built (Missing).
- **D93:** the insertion ghost draws the block as the reference will, in its own colours with the
  defaults (d06-7).
- **D94:** a reference's rows follow AutoCAD's sections and order (d03-2):
  - Geometry: Position X/Y/Z, Scale X/Y/Z, each editable.
  - Misc: Name (read-only), Rotation.
  - Attributes: one row per tag.
  - Annotative, Block Unit and Unit factor are not built (Missing). The attribute rows stay
    read-only (ATTEDIT's Missing).

**Attributes**

- **D60:** the modes prompt keeps listing only the five keywords built; the codebase lists only
  what it builds (-INSERT, TEXT's Justify). Missing records 2027's seven and Multiple lines'
  prompts (p319).
- **D61:** ATTDEF shares TEXTSIZE, the justification and the rotation with TEXT through the drawing
  settings.
- **D62:** Enter continues below the newest definition written this session that is still in the
  drawing; otherwise it is refused (p321, p324).
- **D63:** a space submits the tag, `!` is taken, and only an empty tag is refused (p313–p315).
- **D64:** a leading `\` escapes only a `\` or a blank (p311, p315, p329).
- **D65:** replaced by D90.
- **D66:** U of ATTDISP does not repeat the regeneration (p337).
- **D67:** an attribute definition gets TEXT's grips (d03-5: one at a Left one's point).
- **D68:** add en `-ATT`, `DDATTDEF`, `DDATTE` and es `ATR`, `DDATTE`. Keep `-ATE`, `ATTE` and
  `-ATR` for -ATTEDIT, which is still Missing.
- **D90:** BLOCK's Convert asks the values the way Edit Attributes does (d00, d01).
  - The reference is converted with the defaults, and ATTEDIT's editor opens on it: one field per
    attribute, labelled by prompt, in selection order.
  - Enter is OK; Escape is Cancel and keeps the defaults. All of it is one undo step.
  - WHY not the command line: the desktop asks in a dialog whatever ATTDIA (d01), and here that
    dialog's stand-in is ATTEDIT's box.
- **D92:** ATTEDIT asks `Select block reference:` and EATTEDIT `Select a block:` (es
  `Designe referencia a bloque:`, `Designe un bloque:`).
  - A pick on anything else is refused in their own words, and the question is asked again (d05;
    atteditRes 1, 3, 4; AcEAtteditRes 37, 38, 43).
  - A double-click writes `_eattedit` and the prompt with the point (d04).

## 7. Tests proposed

The regression test of each finding goes in its block's file, citing its probe:

| File | Tests |
| --- | --- |
| `blocks.test.ts` | PURGE (nested in use, chain, anonymous); BLOCK (case, empty set, preselection); INSERT (X/Y/rotation, persistence, 0 and negative, two points, case); the mirrored hatch; palette rows |
| `blockPrompts.test.ts` | the transcripts of -BLOCK (Enter, `?`, redefine, self-reference, refusals), -PURGE, -INSERT (`?`, X/Y/rotation), ATTEDIT's prompts, en and es |
| `attributes.test.ts` | the Convert editor, ATTDEF sharing TEXT's settings, the Current line, Enter refusals, tag, backslash, the attdef grip, U of ATTDISP |

The untested cells to hold:

- -BLOCK's invalid names and limits (p106–p111);
- the base point's Z, ELEVATION and `@` (p126–p129);
- 'ZOOM at the base point (p153);
- U of an empty run (p139);
- -INSERT's LASTPOINT, Z and turned UCS (p212–p214);
- STRETCH of a reference (p224);
- the file round trip with elevation, colour, mirror and attributes;
- the mode letters (p317, p318) and AFLAGS kept (p306);
- the stack's −4.01603 (p320);
- ATTDISP's `O` ambiguity, es letters and transparency (p334–p336);
- an ATTRIB's layer (p331);
- the empty default (p344).

Citations to replace with 2027 probes:

- `blockPrompts.test.ts:21–24` → p03, p02, p303.
- `attributes.test.ts:384` → p04, p334.
- `blocks.test.ts` INSERT → p02, p205, p207.

## 8. What is not tested and why

- The Blocks palette's thumbnails' pixels: presentation; the scene is tested.
- The dialogs (Block Definition, Purge, Edit Attributes, Enhanced Attribute Editor): they have no
  equivalent here beyond the stand-ins the decisions name.

## 9. What could not be reviewed and why

- The es modes line of -ATTDEF in full: the console truncates it (p03); the table 14362 has it.
- `Press ENTER to continue:` after `?`: the console's pager or the command's own (D12 leaves it out
  either way).
- The exploded hatch origin of p234.
- Text under a non-uniform scale (D31's Missing).
- The palette rows of an attribute definition below Multiple lines (not scrolled).

## 10. Refuted in the adversarial pass

- **"BLOCK's Convert asks nothing" (BLK-05, ATE-01 as first written).** Refuted: it was the
  console's artefact. The desktop opens Edit Attributes (d00, d01), so it was downgraded to
  ATE-01 as it stands now.
- **"A palette insertion writes no command echo" (INS-14).** AutoCAD writes only the prompt line too
  (d06-6).
- **The turned UCS's displacement.** It is AutoCAD's, on the desktop too (d09); not copied (D14).
- **Not differences:**
  - attribute order: picks in pick order, a window and ALL newest first (p307–p309);
  - MIRRTEXT 0 attributes, which land exactly where AutoCAD puts them (p332);
  - layer 0 attributes (p331, p343);
  - Verify, Preset and Constant (p304, p306);
  - ATTDISP's words (p334–p339);
  - the Insertion snap (p340);
  - the reference's current properties (p130, p218);
  - LASTPOINT and `@` (p214);
  - STRETCH (p224);
  - an exploded mirrored text (p223, p233);
  - `45d30'` (p237);
  - a nested chain purged in one run (p142);
  - a block in use kept (p145).
- **The height `2.50` against `2.5000`:** the declared LUPREC deviation.
- **A reference's grip menu:** none in AutoCAD either (d02-3).

## 11. Coverage ↔ code ↔ AutoCAD; rules ↔ code

What does not hold:

**draw.md, BLOCK**

- "Enter ends" (BLK-02).
- `Invalid point.` (BLK-07).
- es `Nombre de bloque no válido.` (BLK-11).
- "asks their values as INSERT does" (ATE-01).
- The heading names -BLOCK, which is unregistered.
- The `conversión de objetos=Convertir` mark of **unverified** holds (p01).

**draw.md, INSERT**

- The heading's -INSERT and its missing es `-IN`.
- `<1.00>` (INS-11).
- es `Precise punto de inserción o` (INS-12).
- "the session's scale and angle" (INS-03).
- `?` (INS-05).
- The X, Y and rotation in Missing (INS-02).

**draw.md, ATTDEF**

- "as AutoCAD 2023's console prints it".
- "spaces and `!` refused" (ATD-07).
- The stacking (ATD-02, ATD-03).
- It does not say TEXT's settings are shared (ATD-01), and has no grips (ATD-09).

**draw.md, ATTEDIT:** "not asked through the command line's question: the pick's prompt is not in
the string tables extracted" is false: it is in atteditRes.dll (ATE-05).

**draw.md, ATTDISP:** the 2023 citation; U's echo (ATE-02).

**modify.md, PURGE**

- "disabled when in use" is false for nesting (PRG-01).
- "an array's anonymous block is none of them" (PRG-05).
- Missing's "one level at a time" is not 2027's -PURGE (p142).

**modify.md, MIRROR:** Missing on a hatch in a mirrored reference (BOB-01).

**blocks-palette.md:** the per-block delete (INS-15).

**Rules**

- **cad-tools.md "Command shape":** BLOCK's Convert asking through `AttributeValuePrompts` changes
  with D90.
- **cad-tools.md, a prompt asked again at Enter returns `true`:** broken by `BlockTool.ts`'s base
  point (BLK-03) and INSERT's point (INS-06).
- **cad-tools.md, "a distance or an angle takes a point too":** broken at INSERT's Scale and
  Rotate (INS-09).
- **cad-tools.md, `onActivate` resets none AutoCAD keeps:** INSERT keeps what AutoCAD resets
  (INS-03).
- **cad-engine.md, "names are the identity (case-blind)":** not honoured by blocks (PRG-04).
- **cad-engine.md Blocks:** "in use" is transitive (D3).
- **cad-catalogs.md, "never invent a message":** `noBlocks`, `noUnusedBlocks` and `blocksPurged`
  were invented.
- **autocad-research/console.md:** "PURGE … unknown to it" is stale (p151, p152).

What was checked and holds:

- the layer 0 inheritance;
- `MAX_BLOCK_NESTING`;
- an undefined block dropped at parse time;
- `ucsAngleToWorld` for INSERT and ATTDEF;
- LASTPOINT;
- the `AttributeValuePrompts` rule for INSERT;
- the Insertion snap.

## 12. Order of execution and estimate

Each block is one commit, executed by one subagent, in this order; they share the catalogs and the
snapshots.

| # | Block | Findings | Size | Blocks what |
| --- | --- | --- | --- | --- |
| 1 | the block table and PURGE | PRG-01 to PRG-05, INS-04, INS-15; D2–D5, D34, D91 | medium | 2 and 3 (the case-blind lookup, "in use") |
| 2 | BLOCK / -BLOCK | BLK-01 to BLK-13, ATE-01; D1, D6, D7, D9–D14, D35, D90 | large | — |
| 3 | attributes | ATD-01 to ATD-10, ATE-02 to ATE-05; D60–D68, D92 | large | — |
| 4 | INSERT / -INSERT and the reference | INS-01 to INS-03, INS-05 to INS-13, INS-16, BOB-01 to BOB-04; D30–D38, D93, D94 | large (D31 changes the model and the file) | — |

## 13. Changes to coverage, rules, catalogs and roadmap

- **Coverage:** the entries of BLOCK, INSERT, ATTDEF, ATTEDIT and ATTDISP in `draw.md`, PURGE and
  MIRROR in `modify.md`, and `blocks-palette.md` are rewritten to what each block leaves. Missing
  gains:
  - 2027's seven ATTDEF modes;
  - Annotative, Block Unit and Unit factor;
  - the turned-UCS deviation (D14);
  - text under a non-uniform scale (D31);
  - the attribute's grip;
  - ByBlock (BOB-03).
- **Rules:**
  - `cad-engine.md` Blocks: "in use" transitive, names case-blind, the per-axis scale.
  - `cad-tools.md` "Command shape": the Convert editor (D90).
  - `autocad-research/console.md`: PURGE runs as -PURGE in the console.
- **Catalogs:** new prompts and messages in `en`, `es` and `ar`:
  - -PURGE's prompts and reports;
  - the redefine question and self-reference;
  - `?`'s listing;
  - X/Y/rotation and their refusals;
  - ATTEDIT's and EATTEDIT's prompts and refusals;
  - the Z warning;
  - the names and aliases of D1, D2, D30 and D68.
- **Roadmap:** the Blocks review takes **blocks and attributes**; its row goes to `plan`, then
  `done`.

## 14. Template improvements

- **A dialog the console skips mid-command.** The console showed -BLOCK's Convert asking nothing
  (p134, p305); the desktop opens Edit Attributes (d00, d01). Where the console ends a command
  without a prompt after a step that may open a dialog, check it on the desktop through COM:
  `wins` lists the dialog.
- **A modal dialog opened by `com send` locks COM.** Send it in the background (`&`), find it with
  `wins`, read it with `uia` or `shot <hwnd>`, and close it with a posted `WM_COMMAND IDCANCEL`
  (`post.ps1`, now under `scripts/research/probes/blocks/`). It belongs in `scripts/research/acad/`.
- **Words the merged tables lack.** Search the install's DLLs for the UTF-16 text (a perl one-liner
  over `en-US/*.dll`), then read the one that has it with `strtable.mjs`. That is how
  `atteditRes.dll` and `AcEAtteditRes.dll` were found.
- **A path two commands share** (BLOCK's Convert asking INSERT's values) goes to one subagent by
  name: BLK-05 and ATE-01 were found twice.
