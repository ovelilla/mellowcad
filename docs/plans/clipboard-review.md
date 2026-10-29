# Clipboard and files review (COPYCLIP, CUTCLIP, COPYBASE, PASTECLIP, NEW, QNEW, QSAVE, SAVEAS, OPEN)

> **Status:** plan, 2026-10-29. Phases 0–4 in one session with skill `command-review`; the
> twenty-fifth and last review of `docs/coverage/roadmap.md`'s order. Blocks CLP, PST, FSV and CKY
> are console blocks, executed in this session; CFD is a desktop block for a session with the
> owner's mouse **and clipboard** (the desktop's COPYCLIP overwrites the owner's Windows clipboard).
>
> It owns no cross-cutting area. It took the Workspace review's analogues: a chrome start is a menu
> group (the shortcut menu's Clipboard ▸ entries, the QAT, the accelerators), a name prompt
> declares `takesSpaces` (no file name is typed here: n/a), and Ctrl+S / Ctrl+O / Ctrl+Shift+S are
> `^C^C` macros with `GROUP QSAVE` for a cancelled save (desktop workspace/d04).

## Summary

**Findings:** 0 critical, 1 high, 9 medium and 5 low, in four console blocks; the desktop block
(CFD) holds the cells only the desktop answers, three of them suspected differences.

| Block | What | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- | --- |
| CLP | COPYCLIP, CUTCLIP, COPYBASE | 0 | 0 | 2 | 1 |
| PST | PASTECLIP | 0 | 0 | 3 | 1 |
| FSV | QSAVE, SAVEAS, SAVE, OPEN, NEW, QNEW | 0 | 1 | 1 | 2 |
| CKY | Ctrl+C, X, V, Shift+C, A | 0 | 0 | 2 | 0 |
| CFD | the desktop: the paste's result, the jig, the QAT, the keys' U | — | — | — | — |

The worst:

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

Cells, each a desktop probe (`dNN`), en-US, then es-ES for the labels:

1. d01 — COPYCLIP a line and a circle, PASTECLIP at a point: where the set lands (the lower-left
   corner of the extents, the help's rule), LASTPOINT (`ID @`), the set left selected.
2. d02 — COPYBASE with a base at Z 10, paste at a 2D point; and in `_UCS _Z 30`: orientation and Z.
3. d03 — a layer the target lacks (created, with the source's colour) and one it has with another
   colour (the target's wins); a block of the same name.
4. d04 — PASTECLIP's jig: the ghost, the dynamic input box and its fields, the cursor at the base
   point; COPYBASE's base point box. `@`, `@10,0` and `50<90` typed.
5. d05 — Ctrl+C, X, Shift+C, V inside LINE and at `Command:`: echoes and U names (`COPYCLIP GROUP`
   or `GROUP COPYCLIP`; `PASTECLIP GROUP`); the shortcut menu's Paste U.
6. d06 — Ctrl+A: grips shown, the echo, U.
7. d07 — an empty clipboard (and one holding text): what PASTECLIP says (PST-05).
8. d08 — the QAT's New, Open, Save, Save As and the application menu's New, Open, Save, Save As:
   echo, U names, inside LINE; QNEW's template dialog; a completed Ctrl+S on a titled drawing and
   its U.

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

### Medium

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

- **Severity:** low · **Row:** O · **Status:** unverified (CFD d07)
- **Where:** `CadRuntime.pasteFromClipboard`, `commands.messages.clipboardEmpty`.
- `cad-catalogs.md`: "if the exact string cannot be verified, leave the message out". d07 settles
  what 2027 does with an empty clipboard; until then it stays, marked **unverified** in the coverage.

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

The paste's result and look, the QAT's echoes, an empty clipboard: CFD, the desktop with the
owner's clipboard. NEW and QNEW: the console has one document (p208); their tab and template dialog
are Missing.

## Refuted in the adversarial pass

- ~~QSAVE ignores a titled drawing and always downloads~~ — known (Missing: File System Access
  handles; SAVEAS ≡ QSAVE's WHY).
- ~~DXFIN, DXFOUT missing from the names~~ — CLIPBOARD-D5.
- ~~The shortcut menu's Copy in LINE writes no `*Cancel*`~~ — unreachable: the right button inside a
  command opens the Command menu, which has no Clipboard ▸.
- ~~COPYCLIP takes objects on a locked layer~~ — the harness refuses them as p119 does.
- ~~The console's COPYCLIP overwrote the owner's clipboard~~ — it never writes there (p108's paste
  was the owner's own text).

## Coverage ↔ code ↔ AutoCAD; rules ↔ code

| Claim | Probe | State |
| --- | --- | --- |
| PASTECLIP: Enter asking again, as 2023's console | p110 | no longer true in 2027 (PST-02) |
| single undo on paste | p104 | holds, unnamed (PST-01) |
| QSAVE es `GUARDARR` / `GUARDAR` | p214 | false: GUARDAR is SAVE (FSV-02) |
| Ctrl+S a group U names `GROUP QSAVE`, a cancelled save too | d04, p204 | holds for a cancelled dialog; a save made is a step (FSV-01) |
| NEW: one undo step brings the drawing back (WHY) | — | holds (deviation with its WHY) |
| QNEW without a template shows the dialog as NEW does | — | **unverified** (CFD d08) |

| Rule | Claim | State |
| --- | --- | --- |
| `cad-runtime.md` Commands and history | `keepsSelection()` (COPYCLIP, PASTECLIP) | stale after CLP-02: COPYBASE too |
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
5. **CFD**: a session with the owner's mouse and clipboard; PST-05 and D8, D15 settled there.

## Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/clipboard-and-files.md`: COPYBASE's refusals and preselection; PASTECLIP's Enter
  and U; the keys as macros; Ctrl+A's echo, step and set; SAVE as a command; QSAVE's step; the
  aliases; `clipboardEmpty` **unverified**; CFD's cells open.
- `cad-runtime.md`: `keepsSelection`, the clipboard keys, the wait's rule.
- Catalogs: `commands.names.SAVE` (en SAVE, SAVEURL; es GUARDAR, GUARDARURL), OPEN's OPENURL /
  ABREURL; QSAVE's names lose SAVE / GUARDAR; a message `selectingObjectsDone`.
- Roadmap: the review `plan`, then `done` after CFD.

## Template improvements

- annex-probes.md §2: the console's clipboard is not Windows': its COPYCLIP writes nothing there
  and its PASTECLIP pastes the owner's text as an MTEXT — a paste's result is a desktop cell, the
  transcript is redacted, and a desktop clipboard probe overwrites the owner's clipboard (ask).
  Clipboard probes run with `PROBE_JOBS=1`.
- annex-probes.md §2: a Lisp command the console cannot run for a missing function
  (INITCOMMANDVERSION in AI_SELALL) runs with a stub defined first (p122).
- template §4.1: a command whose run awaits a port (the clipboard's read) — probe its U name and
  type another command during the wait (PST-01, PST-03).
