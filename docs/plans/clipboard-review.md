# Clipboard and files review (COPYCLIP, CUTCLIP, COPYBASE, PASTECLIP, NEW, QNEW, QSAVE, SAVEAS, OPEN)

> **Status:** plan, 2026-10-29. Phases 0–4 in one session with skill `command-review`; the
> twenty-fifth and last review of `docs/coverage/roadmap.md`'s order. Blocks CLP, PST, FSV and CKY
> are console blocks, executed in the first session; CFD, the desktop block, was probed with the
> owner's mouse and clipboard in a second session (d01–d08, e01) and executed there.
>
> It owns no cross-cutting area. It took the Workspace review's analogues: a chrome start is a menu
> group (the shortcut menu's Clipboard ▸ entries, the QAT, the accelerators), a name prompt
> declares `takesSpaces` (no file name is typed here: n/a), and Ctrl+S / Ctrl+O / Ctrl+Shift+S are
> `^C^C` macros with `GROUP QSAVE` for a cancelled save (desktop workspace/d04).

## Summary

**Findings:** 0 critical, 2 high, 12 medium and 8 low: 15 in four console blocks, 7 in the desktop
block (CFD), which also verified PST-05 and overturned PST-02's wording (the console's paste is
text's, CFD-03).

| Block | What | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- | --- |
| CLP | COPYCLIP, CUTCLIP, COPYBASE | 0 | 0 | 2 | 1 |
| PST | PASTECLIP | 0 | 0 | 3 | 1 |
| FSV | QSAVE, SAVEAS, SAVE, OPEN, NEW, QNEW | 0 | 1 | 1 | 2 |
| CKY | Ctrl+C, X, V, Shift+C, A | 0 | 0 | 2 | 0 |
| CFD | the desktop: the paste's result, the jig, the QAT, the keys' U | 0 | 1 | 3 | 3 |

The worst:

- **A paste leaves what it pasted selected**: on the desktop nothing is selected after it and the
  pasted set is Previous, so the next command asks (CFD-01, d04). The console's `(ssget "_I")`
  (erase/p263) was its text paste's MTEXT.

- **QSAVE and SAVEAS make no undo step**, so the U after a save takes back the edit before it;
  2027 makes each a step U names `QSAVE` and regenerates (FSV-01, p204, p205).
- **The clipboard keys are not their `^C^C` macros**: Ctrl+C, X, V and Shift+C inside a command
  replace it without `*Cancel*`, nothing is echoed, Ctrl+C makes no step; Ctrl+A selects everything
  while LINE goes on asking (CKY-01, CKY-02).
- **PASTECLIP's step has no name and a menu Paste is two steps**: the read of the clipboard is
  asynchronous, and the step's name and group are lost across it; a command typed meanwhile is
  replaced by the paste (PST-01, PST-03).

**Evidence:**

- About 45 console probes in es-ES and en-US (p100–p127, p200–p215) on AutoCAD 2027 (R26.0); the
  tables of 2026-10-20; `acad.cuix`'s AcceleratorRoot, PopMenuRoot and MenuGroup macros; each
  language's `acad.pgp`; `acad2027doc.lsp`'s `c:ai_selall`.
- **The console's clipboard is not the program's**: its COPYCLIP writes nothing to Windows' and its
  PASTECLIP pastes whatever text is there, as an MTEXT (the traces of p108–p116 append a
  `FONT_TABLE_RECORD` and an MTEXT, never the line copied; so did erase/p263). Every cell about what
  a paste produces — position, LASTPOINT, layers, the UCS, Z — is the desktop's (CFD). The prompts,
  refusals, echoes and U names of the console stand.

## Inventory

- **Tools**: `cad/application/tools/CopyClipTool.ts` (COPYCLIP, CUTCLIP, COPYBASE over
  `SelectionActionTool`), `PasteTool.ts`; `cad/application/clipboard.ts` (`clipboardSnapshot`,
  `planPaste`); `commands/clipboardCommands.ts` (`PasteCommand`); `commands/entityCommands.ts`
  (`NewDrawingCommand`); `runtimeFiles.ts` (serialise, read the clipboard with its timeout,
  `selectAll`); `cad/serialization/clipboardFile.ts`; `ports.ts` (`Clipboard`, `FileTransport`).
- **Runtime**: `CadRuntime.ts` — `newDrawing`, `saveDrawingToFile`, `openDrawingFromFile`,
  `copyToClipboard`, `pasteFromClipboard`, `selectAll`, `runAccelerator`, `keyDown`'s file and
  clipboard keys, `chooseShortcutMenuAction`; `runtimeCommands.ts` (NEW, QNEW, QSAVE, SAVEAS, OPEN,
  PASTECLIP); `runtimeTools.ts`; `runtimeShortcutMenu.ts` (Clipboard ▸); `CommandLine.ts`
  (`TOOL_COMMANDS`).
- **Adapters**: `CadEngine.ts`, `browserFileTransport.ts`, the browser clipboard.
- **Catalogs**: `commands.names` of the nine (es COPIAPP, CORTAPP, COPIARBASE, PEGAPP, NUEVO,
  RNUEVO, GUARDARR, GUARDARCOMO, ABRE; QSAVE's `SAVE` / `GUARDAR`), `clipboardBasePoint`,
  `specifyInsertionPoint`, `clipboardEmpty`, `saveUnavailable`, `openUnavailable`, `openFailed`,
  `fileName`, `menuStep`, `emptyMenuStep`; `en`, `es`, `ar`.
- **UI**: `components/cad/top-bar.tsx` (the QAT's New, Open, Save, Save As; the application menu's),
  `shortcut-menu.tsx` (Clipboard ▸), `tool-rail.tsx` (`RAIL_EXCLUDED`: no Clipboard panel),
  `content/commands.ts` (filed under `files`). acad.cuix: ID_Copyclip `^C^C_copyclip`, ID_Cutclip
  `^C^C_cutclip`, ID_Copybase `^C^C_copybase`, ID_Pasteclip `^C^C_pasteclip`, ID_SelAll
  `^C^C_ai_selall`, ID_New `^C^C_new`, ID_QNew `^C^C_qnew`, ID_Open, ID_Save, ID_Saveas; the
  accelerators Ctrl+A, C, N, O, S, Shift+S, V, Shift+C, Shift+V (PASTEBLOCK), X, Shift+X (CUTBASE).
  The QAT's items are standard (`AcQATNew`…), with no macro in the file.
- **Tests**: `tools/clipboard.test.ts`, `CadRuntime.test.ts` (NEW, QNEW, file save and open),
  `newDrawingResets.test.ts`, `savedSettings.test.ts`, `lineFiles.test.ts` and its siblings,
  `shortcutMenu.test.ts`, `englishSurface.test.ts` (QSAVE and OPEN without files), the English
  snapshot, `content/commands.test.ts`.
- **Knowledge**: `docs/coverage/clipboard-and-files.md`; `cad-runtime.md` (keys, menu groups,
  `keepsSelection`, waiting on the host), `cad-tools.md` (`SelectionActionTool`), `cad-engine.md`
  (fragments, ports).
- **Related**: `Select objects:` and ALL (ERASE review, SEL: owned), the menu group and the
  accelerators (Workspace review, MAC, WSD: owned), files and undo (LINE review: owned), NEW's
  per-drawing values (RECTANG review, RECTANG-D41, D42), the fragment's blocks (Blocks review,
  blocks/p210), arrays' anonymous blocks (arrays/p410).
- Commit `9938a0e`; AutoCAD 2027 R26.0; tables of 2026-10-20.

## Probes

Console inputs are `scripts/research/probes/clipboard/<id>.txt` (`.plain` untraced, `.es` / `.en`
one locale), run with `PROBE_JOBS=1 scripts/research/probe.sh clipboard <ids>` (one at a time: the
runs would share Windows' clipboard). Transcripts in `research/probes/clipboard/` (gitignored; the
owner's clipboard text pasted by p108–p116 is redacted there).

| Id | What it asks |
| --- | --- |
| p100 | the names, es COPIAPP, CORTAPP, PEGAPP, COPIARBASE (es only) and en |
| p101–p104 | U after COPYCLIP, CUTCLIP, COPYBASE, PASTECLIP (untraced) |
| p105 | COPYCLIP, Enter with nothing selected |
| p106, p107 | COPYBASE's base point: FOO, a point and LASTPOINT; Enter |
| p108–p112 | PASTECLIP: FOO, a Z, Enter, `@`, polar, `_END` (prompts only: the paste was the owner's text) |
| p113–p116 | the base corner, a base with Z, a rotated UCS, a purged layer (void: the console pastes text) |
| p117 | each of the nine typed with `'` at LINE's prompt |
| p118 | Enter repeats COPYCLIP and PASTECLIP |
| p119 | COPYCLIP and CUTCLIP of an object on a locked layer |
| p120, p122, p126 | AI_SELALL (Ctrl+A's macro): the console lacks INITCOMMANDVERSION, stubbed in p122; which layers it takes |
| p121, p124, p125 | COPYBASE and CUTCLIP with a preselection; U after the cut |
| p123 | U after AI_SELALL |
| p127 | COPYBASE's `Select objects:` refusal |
| p200–p203 | QSAVE on an untitled drawing, SAVEAS's prompts, SAVE, QSAVE on a titled one |
| p204, p205, p214 | U after QSAVE, SAVEAS, SAVE (untraced) |
| p206 | Enter repeats QSAVE |
| p207, p208 | OPEN's prompt (FILEDIA 0 in the console), QNEW (nothing: no second document) |
| p209–p212 | the pgp's DXFOUT, DXFIN, QSAVE typed bare, SAVEURL |
| p213 | the console's FILEDIA 0, DWGNAME, DWGTITLED |
| p215 | SAVE on a titled drawing: asks, writes a copy, DWGNAME kept |

## Matrix

### CLP — COPYCLIP, CUTCLIP, COPYBASE

Prompts: COPYBASE's `Specify base point:`; each one's `Select objects:`.

| Row | Cell |
| --- | --- |
| A names, es | match · p100 · harness es (scratch) |
| A repeat | match · p118 · scratch `explore` |
| A `'` | match: `** That command may not be invoked transparently **` · p117 · scratch |
| B base point FOO | differs CLP-01 · p106 `Invalid point.` |
| B base point Enter | differs CLP-01 · p107 `Invalid point.`, asked again |
| B Select objects FOO | COPYCLIP, CUTCLIP match (erase/p259); COPYBASE differs CLP-03 · p127 whole objects |
| B Enter, nothing selected | match: ends silently · p105 · `clipboard.test.ts:60` |
| C, D base point | untested: a point prompt like any (owned, LINE); LASTPOINT = the base · p106 · scratch |
| E transparent at the base point | owned (LINE, the command line) |
| F U | match `COPYCLIP`, `CUTCLIP`, `COPYBASE`, es `COPIAPP` · p101–p103 · scratch |
| F CUTCLIP undone | match: the object back, the set not · p125 · `clipboard.test.ts:134` |
| G preselection | COPYCLIP keeps it (erase/p250) match; CUTCLIP drops it match · p124; COPYBASE differs CLP-02 · p121 |
| H locked layer | match `1 was on a locked layer.` · p119 · scratch (untested) |
| H what is copied | CFD |
| K | sweep `--from`: `es-several` settled by the console (`Precise punto base`, p106) · match |
| L history | match · p100–p106 · scratch |
| M, P, Q | CFD (the base point's dynamic input, the rollover at the set prompt is SEL's) |
| N | `clipboard.test.ts`: COPYBASE's refusals untested; the keeps comment says "not probed" (CLP-02) |

### PST — PASTECLIP

Prompt: `Specify insertion point:`.

| Row | Cell |
| --- | --- |
| A names, repeat, `'` | match · p100, p118, p117 · scratch |
| B FOO | match `Invalid 2D point.` · p108 · `clipboard.test.ts:218` (2023 cited) |
| B a Z | match `Invalid 2D point.` · p109 · scratch |
| B Enter | differs PST-02 · p110 `Invalid 2D point.` |
| C `@`, `@dx,dy`, polar | CFD: the console's numbers are the MTEXT's (p111); mellowcad reads LASTPOINT |
| D `_END` | CFD (p112 snapped, x 100, on the MTEXT) |
| F U | differs PST-01 · p104 `PASTECLIP`, es `PEGAPP` |
| F a menu Paste | differs PST-01: two steps (`GROUP Paste` and an unnamed one) |
| G a command typed during the read | differs PST-03 |
| G preselection after | match (erase/p263, the MTEXT left selected) · `clipboard.test.ts:241` |
| H position, layers, styles, blocks, UCS, Z, LASTPOINT | CFD (p113–p116 void) |
| J | owned (LINE, files); the fragment round-trips · `clipboard.test.ts:292–459` |
| K | sweep: `Precise punto de inserción` settled · p110 · match |
| L | match but for Enter (PST-02) |
| M, P, Q | CFD: the ghost, the box, the cursor at the base |
| O empty clipboard | CFD: `clipboardEmpty` is worded without a source (PST-05) |
| N | `clipboard.test.ts:218` named "AutoCAD 2026", cites 2023, asserts Enter silent (PST-04) |

### FSV — QSAVE, SAVEAS, SAVE, OPEN, NEW, QNEW

| Row | Cell |
| --- | --- |
| A names, es | match but SAVE (FSV-02) · p202, p211, p214 |
| A pgp | OPENURL, SAVEURL missing (FSV-03); DXFIN, DXFOUT run DXF's own prompts (p209, p210): CLIPBOARD-D5 |
| A repeat | match `QSAVE` · p206 · scratch |
| A `'` | match: all refused · p117 · scratch |
| B the prompts | `Save drawing as <…>`, SAVEAS's format, OPEN's name are FILEDIA 0's (p200, p201, p207, p213): the dialogs stand in (known: browser) |
| F U after QSAVE, SAVEAS, SAVE | differs FSV-01 · p204, p205, p214 `QSAVE Regenerating model.` |
| F U after NEW | known (the WHY in the coverage: one drawing here) |
| F U after OPEN | owned (LINE: `loadDrawing` clears the history) |
| G QSAVE on a titled drawing | known (Missing: File System Access handles) · p203 silent |
| G SAVE on a titled drawing | p215 asks and writes a copy: FSV-02 |
| H DBMOD after save | n/a (no unsaved state modelled; Missing) |
| K | the names; the Spanish U echo `GUARDARR`, `GUARDARCOMO`, `GUARDAR` · p204, p205, p214 |
| L | match but U (FSV-01) |
| P, Q the QAT and application menu | CFD |

### CKY — the clipboard accelerators

| Row | Cell |
| --- | --- |
| Ctrl+C, X, Shift+C, V inside a command | differs CKY-01: acad.cuix `^C^C_copyclip`… (the `^C^C` case settled by workspace/d04) |
| their echo at `Command:` | differs CKY-01: nothing written |
| their U | differs CKY-01: Ctrl+C makes no step; Ctrl+V's unnamed (PST-01) |
| Ctrl+A inside a command | differs CKY-02: LINE goes on |
| Ctrl+A's echo and U | differs CKY-02 · p122, p123 `Selecting objects...done.`, `AI_SELALL GROUP` |
| Ctrl+A's set | differs CKY-02 · p126: ALL takes Off and locked, not frozen; SELECT `_ALL` here matches (scratch) |
| Ctrl+Shift+V, Ctrl+Shift+X | known (PASTEBLOCK, CUTBASE in Missing); Ctrl+Shift+V left to the browser |
| Ctrl+N | known: the browser keeps it |
| a focused field | owned (`isGlobalShortcut`, cad-runtime) · `clipboard.test.ts:557` |

### CFD — desktop (owner's mouse and clipboard)

Desktop probes `d01-e01.sh` (en-US d01–d08, es-ES e01); scratch `research/review/clipboard/cfd.test.ts`.

| Row | Cell |
| --- | --- |
| H where the set lands | match: the lower-left of the extents at the point · d01 · `clipboard.test.ts:63` |
| H LASTPOINT | match: the insertion point · d01 · scratch |
| G selection after | differs CFD-01 · d01, d04-5, d04-6: nothing selected; Previous the pasted set |
| H base point's Z | match: base Z 10 at a 2D point → Z −10 · d02 · scratch |
| H a turned UCS | differs CFD-02 · d02: the set turns with the UCS |
| B FOO, Enter, a Z | differs CFD-03 · d02: `Point or option keyword required.`; a 3D point taken (`udGETZ`) |
| B hidden keywords | Missing: INSERT's Scale, PScale, Rotate, PRotate, Basepoint, Explode, REpeat (trace d02) |
| C `@`, polar | match: `@` at LASTPOINT, `50<90` absolute · d02, d04 · `clipboard.test.ts:348` |
| H layers, blocks | match: a new layer the source's colour, a name the target has wins · d03 · `clipboard.test.ts:517–669` |
| M, P the ghost | differs CFD-05 · d04-3: the objects in their own colours, the cursor at the base |
| Q the box | match: `Specify insertion point:` X, Y; COPYBASE's `Specify base point:` X, Y · d04-4, d04-7 |
| Ctrl+C, X, Shift+C, V | match CKY-01 and CLIPBOARD-D8 · d05: `_copyclip 1 found`, `COPYCLIP GROUP`… `PASTECLIP GROUP` |
| the menu's Clipboard ▸ U | differs CFD-06 · d05, e01: `PasteCtrl+V GROUP`, es `CopiarCtrl+C GRUPO` |
| Ctrl+A | match but its line · d06: `_ai_selall Selecting objects...done.` one line (CFD-07), `AI_SELALL GROUP` |
| O empty clipboard | differs PST-05 · d07: nothing written; typed U `PASTECLIP`, Ctrl+V `GROUP PASTECLIP` (match) |
| P the QAT, application menu | differs CFD-04 · d08: `^C^C` macros, `_qnew`/`_NEW`…, groups |
| Ctrl+S on a titled drawing | match FSV-01 · d08: `_qsave`, U `QSAVE GROUP Regenerating model.` · scratch |
| QNEW without a template | holds: the Select template dialog, as NEW · d08 |

## Findings

### High

#### FSV-01 — QSAVE and SAVEAS make no undo step, so U after a save takes back the edit before it

- **Severity:** high · **Row:** F · **Status:** verified
- **Where:** `cad/application/runtimeCommands.ts:169-170`, `CadRuntime.saveDrawingToFile`
- **AutoCAD:** p204 `Command: _U` → `QSAVE Regenerating model.` (es `GUARDARR Regenerando
  modelo.`), the line kept; p205 `SAVEAS Regenerating model.`; p214 `SAVE Regenerating model.`.
- **mellowcad:** scratch `cells.test.ts` FSV: `U` → `LINE`, the line gone.
- **Scenario:** draw → QSAVE → U → mellowcad undoes the line; AutoCAD undoes the save's step (the
  drawing unchanged). A user's U U after a save takes back two edits here.
- **Fix:** QSAVE, SAVEAS (and SAVE, FSV-02) run as a step of their own named as said, marked to
  regenerate so U and REDO write `Regenerating model.` (CLIPBOARD-D2, D3). Ctrl+S then gives
  `QSAVE GROUP` through `menuGroup`.
- **Regression test:** `CadRuntime.test.ts` "file save and open": `_QSAVE`, `_U` →
  `QSAVE Regenerating model.`, the line kept (p204); SAVEAS (p205); Ctrl+S U `QSAVE GROUP`.
- **Coverage:** `clipboard-and-files.md` QSAVE entry (U, the regen; d04's `GROUP QSAVE` is the
  cancelled dialog's).

#### CFD-01 — A paste leaves the pasted objects selected; 2027 selects nothing, the set is Previous

- **Severity:** high · **Row:** G · **Status:** verified
- **Where:** `PasteTool.place` (`ctx.selection.set`), `PasteTool.keepsSelection`.
- **AutoCAD:** d01 `(ssget "_I")` nil after `_PASTECLIP 200,200`; d04-5, d04-6 no grips after a
  typed and a clicked paste; `(ssget "_P")` the 2 pasted. erase/p263's set was the console's MTEXT.
- **mellowcad:** scratch: the pasted line selected; `ERASE _P` erases the source (the copy's set).
- **Scenario:** paste → MOVE → here MOVE takes the pasted set at once; AutoCAD asks `Select objects:`.
- **Fix:** nothing selected after the paste; the pasted set becomes Previous (CLIPBOARD-D19).
- **Regression test:** `clipboard.test.ts` "leaves the pasted objects selected" inverted (d04), `_P`.
- **Coverage, rules:** `cad-runtime.md`'s `keepsSelection()` list loses PASTECLIP.

### Medium

#### CFD-02 — A paste in a turned UCS keeps the WCS orientation; 2027 turns the set with the UCS

- **Severity:** medium · **Row:** H · **Status:** verified
- **AutoCAD:** d02 a line 0,0–50,0, COPYBASE 0,0, `_UCS _Z 30`, PASTECLIP 100,100 →
  (36.6025,136.6025)–(79.9038,161.6025): laid in the UCS as INSERT's block is (the trace inserts a
  temporary block and explodes it).
- **mellowcad:** scratch: (36.6025,136.6025)–(86.6025,136.6025).
- **Fix:** the fragment placed in the UCS's frame, its WCS coordinates read as the UCS's (CLIPBOARD-D18);
  the ghost the same (one plan).
- **Regression test:** `clipboard.test.ts`: the d02 numbers.

#### CFD-03 — PASTECLIP's point refuses a Z and words FOO and Enter as `Invalid 2D point.`

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `PasteTool.takes()` (`"point2d"`), its `commitRaw` on Enter.
- **AutoCAD:** d02 `FOO`, Enter → `Point or option keyword required.`, asked again; `100,100,5` taken
  (Z −5 with a base at Z 10). The trace: `udKWORD, udDRAG, udGETZ`, the hidden keywords Scale PScale
  Rotate PRotate Basepoint Explode REpeat. p108–p110 were the console's text paste (an MTEXT's point).
- **Fix:** the point takes a Z; FOO and Enter refused `Point or option keyword required.` (es
  `Se requiere un punto o una opción.`); the keywords stay out (Missing) (CLIPBOARD-D17, over D10).
- **Regression test:** `clipboard.test.ts:363`, `:387` rewritten for d02.

#### CFD-04 — The QAT's and the application menu's file buttons are not their macros

- **Severity:** medium · **Row:** P · **Status:** verified
- **Where:** `components/cad/top-bar.tsx` (`engine.runCommand("_QNEW")`…).
- **AutoCAD:** d08 inside LINE each writes `*Cancel*`, then the QAT's `_qnew`, `_open`, `_QSAVE`,
  `_SAVEAS` and the application menu's `_NEW`, `_OPEN`, `_QSave`, `_SAVEAS`; a dialog cancelled U
  names `GROUP QNEW`…; a save made `QSAVE GROUP Regenerating model.`.
- **mellowcad:** scratch: QAT New in LINE → LINE replaced with no `*Cancel*`, echo `QNEW`; Save `QSAVE`.
- **Fix:** each button runs as `runAccelerator` with its echo (CLIPBOARD-D22, over D15).
- **Regression test:** `CadRuntime.test.ts` "file save and open": each button's echo inside LINE, U.

### Low (desktop)

#### CFD-05 — PASTECLIP's ghost is drawn in the rubber band's colour; 2027 draws the objects

- **Severity:** low · **Row:** M · **Status:** verified (d04-1, d04-3: a red circle ghosts red)
- **Fix:** the ghost through `drawn(ctx, entity, "plain")` over the plan's entities (CLIPBOARD-D20).

#### CFD-06 — The shortcut menu's Clipboard entries' U names lack their key

- **Severity:** low · **Row:** F · **Status:** verified
- **AutoCAD:** d05 `PasteCtrl+V GROUP`; e01 `PegarCtrl+V GRUPO`, `CopiarCtrl+C GRUPO`, `Copiar con
  punto baseCtrl+Mayús+C GRUPO`: the label and the key as the menu shows it, glued.
- **mellowcad:** `Paste GROUP`, `Copiar GRUPO`.
- **Fix:** a message for each entry's key (en `Ctrl+Shift+C`, es `Ctrl+Mayús+C`) joined to the label
  in the group's name (CLIPBOARD-D21).

#### CFD-07 — Ctrl+A writes `Selecting objects...done.` on a line of its own

- **Severity:** low · **Row:** L · **Status:** verified (d06-1: `_ai_selall Selecting objects...done.`)
- **Fix:** the message joins the echo's line (CLIPBOARD-D24).

### Medium (console blocks)

#### CLP-01 — COPYBASE's base point refuses without words, and Enter says nothing

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `CopyClipTool.ts:56-72` (`commitRaw` returns `true` on text it cannot parse), `takes()`
  null while asking the base.
- **AutoCAD:** p106 `FOO` → `Invalid point.` (es `Punto no válido.`); p107 Enter → `Invalid point.`,
  asked again.
- **mellowcad:** scratch: `Specify base point: FOO` and the prompt again, no refusal; Enter the same.
- **Fix:** the base point's question takes `"point"` (the runtime's refusal), `commitRaw` returns
  `false` on unparsed text; Enter refused with `invalidPoint` and asked again (as RECTANG's corners).
- **Regression test:** `clipboard.test.ts` COPYBASE: FOO and Enter (p106, p107).

#### CLP-02 — COPYBASE drops its preselection; 2027 keeps it

- **Severity:** medium · **Row:** G · **Status:** verified
- **Where:** `CopyClipTool.ts:110-114, 120` (`keeps` only for `copy`).
- **AutoCAD:** p121 a preselection, `_COPYBASE 0,0` → `2 found`, `(ssget "_I")` a set.
- **mellowcad:** scratch: `2 found`, the selection empty after.
- **Fix:** `keeps = mode !== "cut" && preselected`; the comment cites p121 (and p124 for CUTCLIP).
- **Regression test:** `clipboard.test.ts` COPYBASE: the preselection stays (p121).

#### PST-01 — PASTECLIP's undo step has no name, and a menu Paste makes two

- **Severity:** medium · **Row:** F · **Status:** verified
- **Where:** `CadRuntime.pasteFromClipboard`: the tool starts after `await`, when `runCommandAs`
  has already cleared `startingName` and `menuGroup` has closed.
- **AutoCAD:** p104 U → `PASTECLIP` (es `PEGAPP`); a menu entry is one group (workspace/d03,
  `Erase GROUP`).
- **mellowcad:** scratch: typed, U writes nothing; the shortcut menu's Paste, the first U takes the
  paste silently and a second writes `GROUP Paste`.
- **Scenario:** right-click → Paste → place → U → AutoCAD one step; here two U's, the first unnamed.
- **Fix:** the paste starts with the name and step it was asked under: `pasteFromClipboard` takes the
  macro (echo, step) and starts the tool through the same path as a typed command once the read
  resolves (CLIPBOARD-D9); the menu group waits for it.
- **Regression test:** `clipboard.test.ts`: typed U `PASTECLIP`, es `PEGAPP` (p104); the menu's
  Paste one step.

#### PST-02 — Enter at the insertion point says nothing; 2027 says `Invalid 2D point.`

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `PasteTool.ts:95-96`.
- **AutoCAD:** p110 Enter → `Invalid 2D point.` (es `Punto 2D no válido.`), asked again. The code and
  the test cite AutoCAD 2023's console, where Enter asked again silently.
- **Fix:** the empty text refused as the prompt's own refusal (`point2d`), the prompt kept.
- **Regression test:** `clipboard.test.ts:218` rewritten for 2027 (p108–p110).

#### PST-03 — A command typed while the clipboard is read is replaced by the paste

- **Severity:** medium · **Row:** G · **Status:** verified (no AutoCAD probe: its PASTECLIP is
  synchronous)
- **Where:** `CadRuntime.pasteFromClipboard`: `startTool("paste")` after the read, whatever started
  meanwhile.
- **mellowcad:** scratch: `_PASTECLIP`, then `_LINE` before the read resolves → LINE echoed, then
  the paste tool replaces it silently.
- **Fix:** the read is abandoned when anything else starts or the user cancels before it resolves
  (a generation counter, CLIPBOARD-D9).
- **Regression test:** `clipboard.test.ts`: a slow clipboard, LINE typed meanwhile → LINE runs.

#### FSV-02 — SAVE (es GUARDAR) is an alias of QSAVE; 2027 has it as a command of its own

- **Severity:** medium · **Row:** A · **Status:** verified
- **AutoCAD:** p202 `_SAVE` asks `Save drawing as`; p215 on a titled drawing it asks again and writes
  a copy (DWGNAME kept); p214 U → `SAVE` (es `GUARDAR`); SAVEURL echoes `SAVE` (p212).
- **mellowcad:** `GUARDAR` echoes `GUARDAR GUARDARR`, U names nothing (FSV-01).
- **Fix:** a SAVE command (es GUARDAR), the same download (CLIPBOARD-D4), out of QSAVE's names.
- **Regression test:** `CadRuntime.test.ts`: `SAVE`, U `SAVE Regenerating model.`; es `GUARDAR`.

#### CKY-01 — Ctrl+C, X, Shift+C and V are not acad.cuix's `^C^C` macros

- **Severity:** medium · **Row:** A, G, F · **Status:** verified (the macros: acad.cuix; the `^C^C`
  behaviour: workspace/d04)
- **Where:** `CadRuntime.keyDown`'s clipboard switch: `startTool` and `pasteFromClipboard` directly.
- **AutoCAD:** ID_Copyclip `^C^C_copyclip`, ID_Cutclip `^C^C_cutclip`, ID_Copybase
  `^C^C_copybase`, ID_Pasteclip `^C^C_pasteclip`.
- **mellowcad:** scratch: Ctrl+C in LINE → the COPYCLIP prompt with no `*Cancel*` and no echo;
  at `Command:` with a preselection only `1 found`, and U then `Everything has been undone`; Ctrl+V
  in LINE replaces it silently.
- **Fix:** each through `runAccelerator` (`_copyclip`, `_cutclip`, `_copybase`, `_pasteclip`), the
  paste's after PST-01.
- **Regression test:** `clipboard.test.ts` "clipboard shortcuts": inside LINE `*Cancel*` then the
  echo; at `Command:` the echo; U one step.

#### CKY-02 — Ctrl+A acts inside the running command, says nothing, makes no step, skips Off layers

- **Severity:** medium · **Row:** A, F, H · **Status:** verified
- **Where:** `CadRuntime.keyDown` → `selectAll` (`runtimeFiles.ts:120`, `isEntitySelectable`).
- **AutoCAD:** ID_SelAll `^C^C_ai_selall`; `c:ai_selall` runs `_.SELECT _ALL` and writes
  `Selecting objects...done.` (es `Designando objetos...terminado.`; p122, p123); U names
  `AI_SELALL GROUP` (es `AI_SELALL GRUPO`, p123); ALL takes the Off and locked layers' objects, not
  the frozen ones (p126).
- **mellowcad:** scratch: in LINE the set is selected and LINE goes on; nothing written; U takes back
  the command before; an object on an Off layer left out (SELECT `_ALL` here takes it).
- **Fix:** `runAccelerator`-like: the command cancelled, `_ai_selall` echoed, the message, the set
  as the selector's ALL, a step U names `AI_SELALL GROUP` (CLIPBOARD-D7).
- **Regression test:** `clipboard.test.ts` "Ctrl+A": in LINE, the echo, U, an Off layer (p122,
  p123, p126); the "never on an Off one" test inverted.

### Low

#### CLP-03 — COPYBASE's `Select objects:` offers sub-objects; 2027 takes whole objects

- **Severity:** low · **Row:** B · **Status:** verified
- **AutoCAD:** p127 `FOO` → `Expects a point or Window/Last/…/AUto/SIngle` (no SUbobject/Object), as
  COPYCLIP's (erase/p259).
- **Fix:** `selectionInput()` `"wholeObjects"` for COPYBASE too; the WHY cites p127.

#### PST-04 — The paste's test and comments cite AutoCAD 2023 and name "2026"

- **Severity:** low · **Row:** N · **Status:** verified
- **Where:** `clipboard.test.ts:217-218`, `PasteTool.ts:47, 95`, the coverage entry.
- **Fix:** the 2027 probes (p108–p110) cited; folded into PST-02's change.

#### PST-05 — `Nothing on the clipboard.` is worded without a source

- **Severity:** low · **Row:** O · **Status:** verified (d07)
- **Where:** `CadRuntime.pasteFromClipboard`, `commands.messages.clipboardEmpty`.
- **AutoCAD:** d07 an empty Windows clipboard: `_PASTECLIP` writes nothing; U `PASTECLIP` (a step);
  Ctrl+V U `GROUP PASTECLIP`.
- **mellowcad:** `Nothing on the clipboard.`; typed, no step (U undoes the command before).
- **Fix:** nothing written (the key stays, unused: README "Versioning"); a typed PASTECLIP with
  nothing to paste makes an empty step U names `PASTECLIP` (CLIPBOARD-D23).

#### FSV-03 — acad.pgp's OPENURL and SAVEURL are missing

- **Severity:** low · **Row:** A · **Status:** verified
- **AutoCAD:** en `OPENURL, *OPEN`, `SAVEURL, *SAVE`; es `ABREURL`, `GUARDARURL`; p212 runs SAVE.
- **Fix:** the aliases in each language (CLIPBOARD-D6).

#### FSV-04 — The coverage entry files GUARDAR under QSAVE and cites 2023's paste

- **Severity:** low · **Row:** N · **Status:** verified
- **Fix:** with FSV-02 and PST-02.

## Decisions taken

- **CLIPBOARD-D1:** what a paste produces waits for the desktop (CFD): the console pastes Windows'
  text (p108–p116).
- **CLIPBOARD-D2:** a save here always completes (a download cannot be seen cancelled), so QSAVE,
  SAVEAS and SAVE always make their step; Ctrl+S gives `QSAVE GROUP` through `menuGroup` — d04's
  `GROUP QSAVE` is a dialog cancelled, which the browser never reports.
- **CLIPBOARD-D3:** U and REDO of a save write `Regenerating model.` as p204 shows, through the
  step's regeneration mark, not a report.
- **CLIPBOARD-D4:** SAVE runs QSAVE's download (WHY as QSAVE ≡ SAVEAS: a download always names
  the file); its own name, echo and step.
- **CLIPBOARD-D5:** DXFIN and DXFOUT stay out: they open and write DXF (p209, p210 ask DXF's own
  prompts), a format this app does not read or write.
- **CLIPBOARD-D6:** OPENURL → OPEN and SAVEURL → SAVE as aliases (`ABREURL`, `GUARDARURL`).
- **CLIPBOARD-D7:** Ctrl+A: the running command cancelled, `_ai_selall` echoed, `Selecting
  objects...done.` (one message; no table id: `acad2027doc.lsp` and the console, p122), the set the
  selector's ALL takes, a step U names `AI_SELALL GROUP`. No AI_SELALL command is registered (it is
  a Lisp routine, not a command a user types).
- **CLIPBOARD-D8:** the clipboard keys run as `runAccelerator` does; their U names follow
  `menuGroup` (`COPYCLIP GROUP`, by d04's pattern) until d05 confirms them.
- **CLIPBOARD-D9:** a paste remembers how it was asked (echo, step, group) across the read and is
  dropped if any command started or Escape was pressed meanwhile.
- **CLIPBOARD-D10:** Enter at PASTECLIP's point is refused with `Invalid 2D point.` (p110).
- **CLIPBOARD-D11:** COPYBASE's base point refuses through the runtime (`Invalid point.`, p106,
  p107).
- **CLIPBOARD-D12:** COPYBASE keeps a preselection, CUTCLIP drops it (p121, p124).
- **CLIPBOARD-D13:** COPYBASE's set is of whole objects (p127).
- **CLIPBOARD-D14:** `clipboardEmpty` stays until d07 (a key is never removed: README "Versioning").
- **CLIPBOARD-D15:** the QAT's and the application menu's file buttons keep `runCommand` until
  d08 shows their echo and U; a menu group then, as WSD-03.
- **CLIPBOARD-D16:** no subagents: the clipboard probes had to run one at a time (Windows' clipboard
  is one), and the cells were few enough for one reviewer.

- **CLIPBOARD-D17:** PASTECLIP's point is INSERT's: a Z taken, `Point or option keyword required.`
  for FOO and Enter; its hidden keywords not offered (Missing: no scaling or rotating paste). D10 is
  superseded (p110 was the console's text paste).
- **CLIPBOARD-D18:** the fragment is laid in the current UCS as INSERT lays a block there: its WCS
  coordinates read as the UCS's (d02).
- **CLIPBOARD-D19:** nothing selected after a paste; the pasted set becomes Previous (d01, d04).
- **CLIPBOARD-D20:** the ghost is the planned objects drawn as the drawing draws them (`drawn`),
  the target's layers resolved, so it shows what lands.
- **CLIPBOARD-D21:** a menu entry that shows a key is a group U names by its label and that key
  glued, in the command language (`Copy with Base PointCtrl+Shift+C GROUP`); English Cut, Copy and
  Copy with Base Point follow d05's Paste and e01's three by that pattern.
- **CLIPBOARD-D22:** the QAT's and application menu's New, Open, Save, Save As run as `runAccelerator`
  with their own echoes (d08); D15 settled. A completed QNEW stays one step here (the WHY of NEW).
- **CLIPBOARD-D23:** an empty clipboard writes nothing (D14 settled); a typed PASTECLIP then makes an
  empty step `PASTECLIP` (d07).
- **CLIPBOARD-D24:** Ctrl+A's message completes its echo's line (d06).
- **CLIPBOARD-D25:** CFD's fixes in one subagent (one block); the desktop probes the reviewer's.

## Tests proposed

Regression tests are in each finding. Untested cells to pin: COPYCLIP's and CUTCLIP's locked-layer
refusal (p119), the transparency refusals of the nine (p117), Enter repeating PASTECLIP and QSAVE
(p118, p206), U after COPYCLIP, CUTCLIP and COPYBASE in both languages (p101–p103), COPYBASE's
LASTPOINT (p106). Old citations to replace: `clipboard.test.ts:217` and `PasteTool.ts`' "2023's
console".

## What is not tested and why

The browser's download and file picker (the adapter's mechanism); the system clipboard's
permissions (`readSystemClipboard`'s timeout is tested with a fake host).

## What could not be reviewed and why

NEW and QNEW completed: the desktop opens a tab of its own (one drawing here, the WHY); the template
dialog is Missing. English Cut, Copy and Copy with Base Point's U names: by the pattern (CLIPBOARD-D21).

## Refuted in the adversarial pass

- ~~QSAVE ignores a titled drawing and always downloads~~ — known (Missing: File System Access
  handles; SAVEAS ≡ QSAVE's WHY).
- ~~DXFIN, DXFOUT missing from the names~~ — CLIPBOARD-D5.
- ~~The shortcut menu's Copy in LINE writes no `*Cancel*`~~ — unreachable: the right button inside a
  command opens the Command menu, which has no Clipboard ▸.
- ~~COPYCLIP takes objects on a locked layer~~ — the harness refuses them as p119 does.
- ~~The console's COPYCLIP overwrote the owner's clipboard~~ — it never writes there (p108's paste
  was the owner's own text).

- ~~PASTECLIP refuses a Z and Enter with `Invalid 2D point.` (p108–p110, PST-02)~~ — the console's
  text paste; the desktop's object paste is INSERT's point (CFD-03).
- ~~PASTECLIP leaves what it pasted selected (erase/p263)~~ — the console's MTEXT; d04 (CFD-01).

## Coverage ↔ code ↔ AutoCAD; rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| PASTECLIP: Enter asking again, as 2023's console | p110 | no longer true in 2027 (PST-02) |
| single undo on paste | p104 | holds, unnamed (PST-01) |
| QSAVE es `GUARDARR` / `GUARDAR` | p214 | false: GUARDAR is SAVE (FSV-02) |
| Ctrl+S a group U names `GROUP QSAVE`, a cancelled save too | d04, p204 | holds for a cancelled dialog; a save made is a step (FSV-01) |
| NEW: one undo step brings the drawing back (WHY) | — | holds (deviation with its WHY) |
| QNEW without a template shows the dialog as NEW does | d08 | holds |
| `clipboardEmpty` (unverified) | d07 | false: nothing is written (PST-05) |

| Rule | Claim | State |
| --- | --- | --- |
| `cad-runtime.md` Commands and history | `keepsSelection()` (COPYCLIP, COPYBASE, PASTECLIP) | stale after CFD-01: not PASTECLIP |
| `cad-runtime.md` Keys and buttons | the `^C^C` keys: S, O, 0, 1, 9, Y | to widen after CKY-01, CKY-02 |
| `cad-runtime.md` Waiting on the host | bound every wait | holds; add: what was asked survives the wait and is dropped when something else starts (PST-01, PST-03) |
| `cad-catalogs.md` Messages | never invent a message | broken by `clipboardEmpty` (PST-05, unverified) |

Checked and holding: `cad-engine.md` fragments (tests, blocks/p210), ports; `cad-tools.md`
`SelectionActionTool`; `cad-runtime.md` `isGlobalShortcut`.

## Order of execution and estimate

1. **CLP** (CLP-01 to 03): `CopyClipTool.ts`, its tests. Small.
2. **PST** (PST-01 to 04): `CadRuntime.pasteFromClipboard`, `PasteTool.ts`, tests. Medium.
3. **FSV** (FSV-01 to 04): `runtimeCommands.ts`, the catalogs (SAVE, the aliases), tests, the
   English snapshot. Small to medium.
4. **CKY** (CKY-01, 02): `CadRuntime.keyDown`, `selectAll`, a message, tests. Medium; after PST
   (the paste's macro) and FSV (`runAccelerator` with a step).
5. **CFD** (CFD-01 to 07, PST-05): `PasteTool.ts`, `CadRuntime.pasteFromClipboard`, the shortcut
   menu's groups, the top bar's buttons, `selectAll`'s line, catalogs; medium. After CKY.

## Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/clipboard-and-files.md`: COPYBASE's refusals and preselection; PASTECLIP's Enter
  and U; the keys as macros; Ctrl+A's echo, step and set; SAVE as a command; QSAVE's step; the
  aliases; `clipboardEmpty` **unverified**; CFD's cells open.
- `cad-runtime.md`: `keepsSelection`, the clipboard keys, the wait's rule.
- Catalogs: `commands.names.SAVE` (en SAVE, SAVEURL; es GUARDAR, GUARDARURL), OPEN's OPENURL /
  ABREURL; QSAVE's names lose SAVE / GUARDAR; a message `selectingObjectsDone`.
- Roadmap: the review `plan`, then `done` after CFD.

## Execution

| Block | Findings | Commit |
| --- | --- | --- |
| CLP | CLP-01 to CLP-03 | `276b45f` |
| PST | PST-01 to PST-04 (PST-05 waits for CFD d07) | `0512bb3` |
| FSV | FSV-01 to FSV-04 | `b5cb8f4` |
| CKY | CKY-01, CKY-02 | `ad04517` |

Added in the execution: a save the host cannot make (no file port) makes no step, so Ctrl+S then
leaves `GROUP QSAVE`, as d04's cancelled dialog; Ctrl+V's group is `PASTECLIP GROUP`, an empty
clipboard's `GROUP PASTECLIP`; Ctrl+Shift+X (CUTBASE) and Ctrl+Shift+A (the group toggle, PICKSTYLE)
are left to the browser as Ctrl+Shift+V is; ALL and Ctrl+A share `allObjects`.

## Template improvements

- annex-probes.md §2: the console's clipboard is not Windows': its COPYCLIP writes nothing there
  and its PASTECLIP pastes the owner's text as an MTEXT — a paste's result is a desktop cell, the
  transcript is redacted, and a desktop clipboard probe overwrites the owner's clipboard (ask).
  Clipboard probes run with `PROBE_JOBS=1`.
- annex-probes.md §2: a Lisp command the console cannot run for a missing function
  (INITCOMMANDVERSION in AI_SELALL) runs with a stub defined first (p122).
- template §4.1: a command whose run awaits a port (the clipboard's read) — probe its U name and
  type another command during the wait (PST-01, PST-03).

Applied on 2026-10-29 after the console blocks. From CFD:

- annex-probes.md §2: a console probe whose input is a stand-in (its PASTECLIP pastes text) settles
  nothing of the real path, its refusals and its selection either: p108–p110 and erase/p263 were the
  MTEXT's; trace the desktop's prompt before trusting them.
- annex-probes.md §4: COM's SendCommand turns DYNMODE negative while it runs and restores it, so
  `com set` and `(setvar)` do not hold it and a command sent by COM shows no dynamic input; set it by
  typing (`type -text '-1\n'`: a bare `-1` is a PowerShell switch) and type the command.
- matrix.md / template §4.1: a menu entry showing a key is named by U with the key glued
  (`PasteCtrl+V GROUP`): probe a menu entry with a key apart from one without.
