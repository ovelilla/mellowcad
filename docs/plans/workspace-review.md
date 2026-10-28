# Workspace review (UNITS, AUPREC, SETVAR, CLEANSCREENON, CLEANSCREENOFF; the chrome)

> **Status:** plan, 2026-10-28. Phases 0–4 in one session with skill `command-review`, the
> twenty-fourth review of `docs/coverage/roadmap.md`'s order; the console blocks (SVA, SVR, UNT,
> MAC) execute in the same session, the desktop block (WSD) in a later one with the owner's mouse.
>
> It owns **system variables typed as commands** (SETVAR included). It takes what the roadmap left
> it: TEXTSIZE, TEXTSTYLE, the DIMxxx variables, HPNAME / HPSCALE / HPANG / HPORIGIN, ATTDIA /
> ATTREQ / AFLAGS / ATTMODE / INSNAME, LWDISPLAY / LAYLOCKFADECTL / CECOLOR / CELTYPE / CELWEIGHT
> typed as variables; the rail's apostrophe macros (ATTDISP's, MATCHPROP's); the toolbar and menu
> buttons' `<command> GROUP` undo names; the chrome menus' echo (UCD-07); every name prompt that
> may hold spaces (`takesSpaces`, UCD-05).

## 1. Summary

25 findings: 0 critical, 1 high, 12 medium, 12 low.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| SVA | SETVAR and the mechanism of a variable typed by name (prompts and refusals per type, transparency, nesting, undo, `?`), AUPREC | 1 | 3 | 2 |
| SVR | the roster: each variable mellowcad models, its words, values, storage and undo | 0 | 3 | 2 |
| UNT | UNITS, CLEANSCREENON, CLEANSCREENOFF | 0 | 2 | 3 |
| MAC | the chrome's macros against acad.cuix (rail, top bar, keys, shortcut menus) | 0 | 4 | 5 |
| WSD | the desktop: the chrome's look, echoes and undo names, name prompts with spaces | planned, §12 | | |

The worst:

- **A system variable typed by name is `Unknown command`** but for AUPREC, `'AREA` and `'UCSICON`,
  and SETVAR does not exist (SVA-01, SVA-02, SVR-01): `OSMODE`, `FILLETRAD`, `ORTHOMODE`, `CECOLOR`,
  `TEXTSIZE` typed at `Command:` from muscle memory do nothing. 2027 runs SETVAR for each, with a
  prompt and a refusal per data type, transparently anywhere (`'ORTHOMODE` at LINE's point), nesting
  one variable in another's prompt, and every set is an undo step named after it.
- **CLEANSCREENON / OFF and UNITS make no undo step**, so U after Ctrl+0 takes back the line drawn
  before it (UNT-01, UNT-02).
- **Ctrl+0, Ctrl+1, Ctrl+9, Ctrl+S and Ctrl+O act inside the running command**, where AutoCAD's
  accelerators are `^C^C` macros that cancel it first (MAC-01); the rail's Attribute display ends
  the running command though its macro is `'_attdisp` (MAC-02).

AutoCAD 2023 citations in the AUPREC code and tests were re-probed on 2027: every claim holds,
and the **unverified** period of the Spanish refusal is settled (it has one).

## 2. Inventory

- **Commit** `b67d8ed`; AutoCAD 2027, ACADVER 26.0, `_VERNUM` X.118 (p100: the UCS review's build);
  the tables of 2026-10-20; `acad.cuix` of both languages (AcceleratorRoot, PopMenuRoot,
  RibbonRoot, QuickAccessToolbarRoot, MenuGroup); each language's `acad.pgp`; MPSYSVARS (695
  registered variables, p200).
- **The tools:** `cad/application/tools/SystemVariableTool.ts`, `AuPrecTool.ts`, `UcsIconTool.ts`
  (`UcsIconVariableTool`).
- **Registration:** `runtimeCommands.ts` (`variable(...)` for AREA and UCSICON,
  `TRANSPARENT_COMMANDS`, UNITS, CLEANSCREENON / OFF), `CadRuntime.ts` (`variables`,
  `variableNamed`, `runCommandAs`, `runTransparently`, `writeResuming`, `setUnitsDialog`,
  `applyDrawingUnits`, `setCleanScreen`, `keyDown`'s accelerators, `takesSpaces`),
  `CommandLine.ts`, `runtimeShortcutMenu.ts`. SETVAR has a catalog name (en `SETVAR`, es
  `MODIVAR`) but no command; only `Resuming SETVAR command.` reads it.
- **The settings:** `DocumentSettings` (`cad/domain/units.ts`), the runtime's aids (`SnapMode.ts`,
  the constraints, the snaps, selection cycling), the tools' session settings (CIRCLERAD,
  OFFSETDIST, POLYSIDES, the SPL* variables, TRIMEXTENDMODE / EDGEMODE, TEXTEDITMODE, AFLAGS).
- **Catalogs:** `cad/locales/en.json`, `es.json`, `ar.json` (`enterNewValueFor`,
  `requiresIntegerBetween`, `resumingCommand`, `readOnlyVariable`, `notTransparent`, the names).
- **The UI:** `components/cad/status-bar.tsx`, `top-bar.tsx`, `tool-rail.tsx`, `palette-panel.tsx`,
  `shortcut-menu.tsx`, `units-dialog.tsx`; the landing's filing (`content/commands.ts`: AUPREC
  organize; UNITS, CLEANSCREENON / OFF inquiry).
- **Tests:** `workspaceCommands.test.ts`, `tools/settingsPrompts.test.ts`, `shortcutMenu.test.ts`,
  `palettePanel.test.ts`, `transparentCommands.test.ts`, `undoEcho.test.ts`,
  `serialization/drawingFile.test.ts`, the English surface walk.
- **Knowledge:** `docs/coverage/workspace.md` (every entry), `command-line.md` (variables typed
  and SETVAR in Missing), the variables' rows in `drafting-aids.md`, `properties.md`,
  `dimensions.md`, `modify.md`, `draw.md`, `view.md`; `.claude/rules/cad-tools.md` ("System
  variables"), `cad-runtime.md`, `cad-catalogs.md`, `ui.md`.
- **Related tools, in their part:** every command whose setting is a variable (FILLET's FILLETRAD,
  -COLOR's CECOLOR, SNAP's SNAPUNIT…), only for the variable's value; U, REDO, UNDO after each.
- **Areas cited, not reviewed:** the command line (LINE's: echo, repeat, transparency's `>>` and
  resume, the `.` prefix — `command-line.md`); the F keys' echoes (LINE's TRK-03); the view's undo
  (View's); the Properties palette and the style tables (Properties').
- **Old citations:** the AUPREC tool, tests and coverage cite AutoCAD 2023's console (`acc/sv1`)
  and "2026"; each was re-probed (SVA-06).

## 3. Probes

Inputs are `scripts/research/probes/workspace/<id>.txt` (`.plain` untraced, `.es` / `.en` one
locale), run with `scripts/research/probe.sh workspace <ids>`; transcripts in
`research/probes/workspace/` (gitignored). Every probe ran in es-ES and en-US unless its name says
otherwise. Scratch tests are in `research/review/workspace/{a,b,c}/`.

| Id | What it asks |
| --- | --- |
| p100 | ACADVER, `_VERNUM`; `_AUPREC`; `_ORTHOMODE` at SETVAR's prompt |
| p101–p107 | SETVAR: a name in each case, an abbreviation, Enter, `SET` / `MV`, `_.SETVAR`, Enter repeating it |
| p108–p113 | ORTHOMODE bare, `_`, `.`, `'` at `Command:`; `'ORTHOMODE`, `'_ORTHOMODE` at LINE's points |
| p114–p124 | `'_SETVAR` at LINE; `'AUPREC` at LINE, CIRCLE's radius, `Select objects:`; `'_ZOOM` at AUPREC; a variable inside a transparent ZOOM and inside a transparent variable; `_LINE` at the value and the name prompts; es `'MODIVAR`; `FOO` at the name |
| p125–p127 | `?` with `ORTHO*`, `A*`, all (QAFLAGS 2) |
| p128–p147 | the value prompt per type: switch, range, real, string, nullable string, point, read only, bitcode; `~`, `*`, `.` |
| p148, p149, p162, p169 | SETVAR's default: after a bare variable, after `(setvar)`, in es, in a new drawing |
| p150–p159, p167, p168 | (untraced) U, REDO, UNDO 2 after variables; ZOOMFACTOR, EXPERT, SHORTCUTMENU undone; `'AUPREC` inside LINE then LINE's Undo; SETVAR AREA |
| p160, p161, p163–p166 | preselection, LASTPOINT; `'AUPREC` at `Command:`; LTSCALE, FILLMODE / FILL, UCSICON / ELEV clashes |
| p200–p202 | MPSYSVARS; getvar of every capitalised token of the engine |
| p203–p207 | each modelled variable typed bare, its prompt and Enter; the read-only ones; AREA bare |
| p208–p217 | value forms and refusals: CECOLOR, CELTYPE, CELWEIGHT, CLAYER, TEXTSTYLE, HPNAME, INSNAME, distances, angles, points, integer ranges; a LINE and -TEXT after them (p209, p210 slipped; p215, p216 are their reruns) |
| p218, p221 | (untraced) U after each of 54 variables typed; U after CIRCLE, POLYGON, FILLET R |
| p219, p220, p222 | storage (SAVEAS and OPEN); DIMSCALE typed becomes an override; SNAPMODE, INSUNITS ranges, TEXTSIZE −2.5 |
| p300–p311, p314 | -UNITS' prompts, `_UNITS`, `_.UNITS`, `'_UNITS` and `'_-UNITS` at LINE, U after UNITS and -UNITS (with and without change), DDUNITS, `-UN` / `-UNS` |
| p304–p306, p312, p315, p316 | CLEANSCREENON / OFF: echo, `'CLEANSCREENON`, typed at LINE, U and REDO with CLEANSCREENSTATE |
| p313 | `'_attdisp _n` at LINE |
| p400–p407 | a name with a space at -BLOCK, -INSERT, -DIMSTYLE Save / Restore, UCS Save / Delete, PLAN, -LINETYPE Load / Set, -STYLE, -TEXT's style, -PURGE (p404, p405 ended inside a command; p406, p407 are their reruns) |
| p410–p415 | `'AUPREC` at its own prompt (bare and transparent), `'ORTHOMODE` at a bare AUPREC, `'_ZOOM` at a transparent variable, U after `'AUPREC` at `Command:`, es `_SET` |

## 4. Matrix

States as `matrix.md`; `a:`, `b:`, `c:` are `research/review/workspace/{a,b,c}/` scratch tests.

### SVA — SETVAR and a variable typed by name

| Row | SETVAR's name prompt | A variable's value prompt | Typed at `Command:` | Typed with `'` in a command |
| --- | --- | --- | --- | --- |
| A names | SETVAR, es MODIVAR, `SET` (en pgp), `MV` (es pgp), `_.SETVAR` differs SVA-01 · p101, p105, p106 · a:p101 | n/a | bare, `_`, `.`, `'` differ SVA-02 · p108–p111 · a:p108; `.AUPREC` known (command-line.md: the `.` prefix) | differs SVA-02 · p112, p113 · a:p112 |
| A clashes | `ELEV` unknown there · p166 | n/a | command wins (`LTSCALE`, `FILL`, `AREA`, `UCSICON`); `FILLMODE`, `ELEVATION` the variable · p136, p164, p165 · a:p164 | a transparent command wins (`'LTSCALE`) · p164; AREA, UCSICON the variable · inquiry/p324, ucs/p356 |
| A repeat | Enter repeats SETVAR · p107 | n/a | Enter repeats the variable · p169 · a:p169 untested | n/a |
| A `'SETVAR` | differs SVA-01 · p114, p123 | | | |
| B words | `Enter variable name or [?] <LAST>:` (26123) differs SVA-01 · p101 | integer, real, string, point, read only differ SVA-03 · p128–p147; AUPREC match · `settingsPrompts.test.ts:193` | SVA-02 | SVA-02 |
| B default | none in a new drawing, the last named or typed bare · p140, p148, p149, p162, p169 · SVA-01 | Enter keeps · p133 untested | | |
| B refusals | unknown name ends SETVAR (26122) · p100, p103, p122, p124 · SVA-01 | per type, re-ask or end · SVA-03 · `SystemVariableTool.ts:85` hard-codes one | | |
| B `?` | differs SVA-04 · p125–p127 | n/a | | |
| E nesting | | another variable nests at any variable's prompt, `Resuming SETVAR command.` · p114, p120, p414; the same variable is a value, refused · p410, p415 · `settingsPrompts.test.ts:424` match; `'ZOOM` nests in a transparent variable · p411; a variable in a transparent ZOOM · p119 — differs SVA-05 | n/a | `>>` prompts, `Resuming LINE command.`, es `Reanudando el comando BORRA.` · p115–p117 · `settingsPrompts.test.ts:258` match (AUPREC) |
| E `'ZOOM` at a value prompt | | match (`Resuming SETVAR command.`, prompt again without `>>`) · p118 · `settingsPrompts.test.ts:408` (citation SVA-06) | | |
| F undo | U names `SETVAR` / `MODIVAR` · p151 · SVA-01 | Enter with no change a step · p152, p159 · a:p159 untested | U names the variable · p150; REDO, UNDO 2 · p153, p154 · a untested; registry and session variables undone · p155, p156, p167 (SVR-04) | U names `'AUPREC` · p412; LINE's Undo takes it back · p157 · a:p157 untested |
| G another command | `_LINE` refused, ends · p122 | `_LINE` refused by the type, re-ask · p121 · a:p121 untested | | |
| H | | | preselection dropped (console; desktop WSD), LASTPOINT kept · p160, p161 · a:p161 untested | |
| K, L | sweep ok (A's) · history echo as typed known (`command-line.md`) | | | |

### SVR — the roster

One row per group; the full table is in §5 (SVR-01). `b:` is `roster.test.ts` (66 fail, 1 pass) and
`semantics.test.ts`.

| Variables | AutoCAD (probe) | mellowcad | State |
| --- | --- | --- | --- |
| AUPREC | p100, p132, p203 | `settingsPrompts.test.ts:193` | match (citations SVA-06) |
| UCSICON, AREA | p203, p206, p207 | `settingsPrompts.test.ts:283–400` | match |
| LUPREC, LWDISPLAY, ATTMODE, ELEVATION, THICKNESS, NAVVCUBEDISPLAY, FILLMODE, PLINEWID, FILLETRAD, CHAMFERA, CHAMFERB, TEXTSIZE, ORTHOMODE, SNAPMODE, SNAPUNIT, GRIDMODE, INSUNITS, CECOLOR, CELTYPE, CELWEIGHT, CLAYER, TEXTSTYLE | p203, p204, p208–p217, p219, p222 | b:roster | differs SVR-01 |
| HPNAME, HPSCALE, HPANG, INSNAME, LASTPOINT, CIRCLERAD, OFFSETDIST, POLYSIDES, AFLAGS | p211, p212, p213, p216 | b:roster | differs SVR-01 |
| OSMODE, POLARANG, POLARDIST, SELECTIONCYCLING, TRIMEXTENDMODE, EDGEMODE, TEXTEDITMODE, SPLMETHOD, SPLKNOTS, SPLDEGREE, ARRAYASSOCIATIVITY, CLIPROMPTLINES | p205, p211, p214 | b:roster | differs SVR-01; POLARDIST's meaning SVR-02 |
| PERIMETER, DISTANCE, UCSNAME, UCSORG, UCSXDIR, UNDOCTL, CLEANSCREENSTATE (read only) | p207 | b:roster | differs SVR-01 |
| LUNITS, ATTDIA, ATTREQ, HPORIGIN, DYNMODE, SHORTCUTMENU, PICKBOX, APERTURE, AUTOSNAP, POLARMODE, MBUTTONPAN, LWDEFAULT, ZOOMFACTOR, LAYLOCKFADECTL | p205, p212, p213, p214, p219 | — | known after this review (WORKSPACE-D31: their effect is fixed or unmodelled) |
| DIMxxx | p220 (an override) | `setDimScale` edits the style | known (DIMS-D9; WORKSPACE-D32) |
| H value semantics | p204, p208, p209, p211, p212, p215, p217, p222 | b:semantics | SVR-03 |
| F undo of each | p218, p221 | b:semantics | SVR-04 |
| J storage | p219 (CECOLOR, CELTYPE, CELWEIGHT, CLAYER, INSUNITS, LUNITS, NAVVCUBEDISPLAY, HPORIGIN Dwg; LASTPOINT not saved; registry ones) | `drawingFile.test.ts:156, 191, 202, 255` | match where modelled |

### UNT — UNITS, CLEANSCREENON, CLEANSCREENOFF

| Row | UNITS | -UNITS | CLEANSCREENON / OFF |
| --- | --- | --- | --- |
| A names | `UN`, es `UNS` match · pgp en:417, es:284 · `workspaceCommands.test.ts:160`; `_.UNITS` match · p302; `DDUNITS` differs UNT-03 · p311 · c:p311 | known (Missing) · p300, p314 | es `LIMPIAPANTACT` / `LIMPIAPANTDES` match · tables 52590, 52589 · `workspaceCommands.test.ts:101` (uncited) |
| A transparency | `'UNITS` match · p303 · c:p303 untested | `'-UNITS` · p310 (known) | `'CLEANSCREENON` refused match · p305 · c:p305 untested; typed at LINE's point refused · p315 |
| B prompts | the console asks nothing (p301): the dialog is WSD's | `Enter choice, 1 to 5 <2>:`, `(0 to 8) <4>`, angles, direction, clockwise · p300 (UNT-05) | n/a |
| F undo | U after OK names nothing differs UNT-02 · p307, p308 · c:p308; with no change a step · p309 · `workspaceCommands.test.ts:192` contradicts; Cancel: WSD | U `-UNITS` · p308 | differs UNT-01 · p306, p316 · c:p306 |
| H | LUPREC 0–8 · p300 · `workspaceCommands.test.ts:200` untested | | CLEANSCREENSTATE 1 after ON, per session, read only · p312, trim/p147 · `workspaceCommands.test.ts:133` match |
| chrome | the application menu's and status bar's Units run `_UNITS`, its macro is `'_units` UNT-04 (unverified) | | Ctrl+0: MAC-01 |
| K | INSUNITS names match · tables 3404–3406, 7147–7149; dialog labels · help GUID-75419F91, table 796 | | help GUID-8FBF7BAA's quote holds |

### MAC — the chrome's macros

| Entry | AutoCAD macro (acad.cuix) | State |
| --- | --- | --- |
| Rail: Line, Polyline, Circle ×4, Arc ×3, Rectangle / Polygon, Ellipse ×3, Hatch, Spline Fit / CV, Move, Copy, Stretch, Rotate, Mirror, Scale, Trim / Extend, Fillet / Chamfer, Array ×3, Erase, Explode, Offset, Break, Break at Point, Join, Mtext, Text, Dimension ×5, Continue / Baseline, Adjust Space, Edit Text, Create block, Define attributes | `^C^C_line` … (ID_Line … ID_Join), `^C^C_^RSPLINE _M _FIT`, `$M=$(if,…GRIP,_move,^C^C_move)` | match (the grip branch of Move & co. is WSD's) |
| Rail: Edit attributes | `^C^C_eattedit` (Single), `^C^C_-attedit` (Multiple) | differs MAC-04 |
| Rail: Attribute display | `'_attdisp _n` / `_on` / `_off` (ID_AttdispNo/On/Of), p313 | differs MAC-02 |
| Rail: Distance, Area | `^C^C_MEASUREGEOM _distance` / `_area` | match (WHY in `tool-rail.tsx`) |
| Rail: ID Point | `'_id ` | match |
| Rail: Insert | ribbon gallery; menu `'^C^C_blockspalette` | WSD |
| Top bar: Match Properties | `'_matchprop ` (ID_Matchprop) | differs MAC-03 (unverified: WSD) |
| QAT | New, Open, Save, Save As, Plot, Undo, Redo | match (Plot known) |
| Application menu, status bar: Units | `'_units ` (ID_Units) | UNT-04 |
| Ctrl+Z, Ctrl+Y | `_u `, `^C^C_mredo 1 ` | match |
| Ctrl+0, Ctrl+1, Ctrl+9, Ctrl+S, Ctrl+O | `^C^C_CleanScreenON/OFF`, `^C^C_properties/close`, `^C^C_commandline/hide`, `^C^C_qsave`, `^C^C_open` | differs MAC-01 |
| Ctrl+L | `^O` (MM_0005) | MAC-09 |
| Default menu | CMDEFAULT (PM_0006): Repeat %s · Clipboard ▸ · Isolate ▸ · Undo `^C^C_u`, Redo `^C^C_mredo 1`, Pan `'_pan`, Zoom, SteeringWheels · … | order and labels match (the coverage's **unverified** settled); Pan differs MAC-05 |
| Edit menu | CMEDIT (PM_0007): Repeat · Clipboard ▸ · Isolate ▸ · Erase, Move, Copy Selection, Scale, Rotate, Draw Order ▸, Group ▸ · Add Selected · Select Similar, Deselect All · … Properties | order match; es label MAC-07; echoes MAC-06 |
| Command menu | CMCOMMAND: Enter, Cancel · Osnap Overrides · Pan, Zoom, SteeringWheels · QuickCalc | en label MAC-07 |
| Clipboard ▸ | Cut, Cut with Base Point, Copy, Copy with Base Point, Paste, Paste as Block, Paste as Hyperlink, Paste to Original Coordinates, Paste Special | label MAC-07; Missing MAC-08 |

### WSD — name prompts that may hold spaces (from p400–p407)

The console takes every answer line whole, and its trace says `AllowSpaces: false` at every name
prompt — and at -TEXT's `Enter text:` too (p406), which takes spaces: the flag tells nothing, and
each prompt is a desktop cell. 2027 accepts `AB CD` as a name at -BLOCK, -INSERT, -DIMSTYLE Save and
Restore, UCS Save and Delete, PLAN and -STYLE (p400–p402, p406). mellowcad's name prompts:

| Prompt | Command | `takesSpaces` | State |
| --- | --- | --- | --- |
| `Enter name to save current UCS or`, `Enter name of UCS to restore or` | UCS NAmed | yes (UCD-05) | match · ucs/d05 |
| `Enter UCS name(s) to delete`, `… to list` | UCS NAmed | no | WSD |
| `Enter name of UCS or` | PLAN | no | WSD |
| `Enter block name or` | -BLOCK, -INSERT | no | WSD |
| `Enter name(s) to purge` | PURGE | no | WSD |
| `Enter style name or` | TEXT, MTEXT | no | WSD |
| `Enter name for new dimension style or`, `Enter a dimension style name, [?] or` | -DIMSTYLE | no | WSD |
| `Enter linetype(s) to load`, `Specify linetype name or`, list | -LINETYPE | no | WSD |
| `Enter block(s) to list` | -BLOCK, -INSERT `?` | no | WSD |
| a string variable's value (`USERS1`, CLAYER, TEXTSTYLE, INSNAME) | SETVAR | — | WSD (SVA's build gives it `takesSpaces` only if d-probe says so) |

## 5. Findings

### High

#### SVA-02 — A system variable typed by name is `Unknown command`; 2027 runs SETVAR for it at `Command:` and transparently

- **Severity:** high · **Row:** A, E · **Status:** verified (reviewer: p108, p112 read)
- **Where:** `cad/application/runtimeCommands.ts:92-114` registers only AREA and UCSICON as
  variables; AUPREC is a command of its own.
- **AutoCAD:** p108–p111: `ORTHOMODE`, `_ORTHOMODE`, `.ORTHOMODE`, `'ORTHOMODE` at `Command:` all ask
  `Enter new value for ORTHOMODE <0>:` (es `Indique nuevo valor para ORTHOMODE <0>:`), no `>>`, the
  trace ending `CommandEnded SETVAR`. p112, p113, p115–p117: `'ORTHOMODE` / `'_ORTHOMODE` at LINE's
  points, CIRCLE's radius and `Select objects:` ask `>>Enter new value for ORTHOMODE <0>:` and
  write `Resuming LINE command.` (es `Reanudando el comando LINEA.`). Names are never translated. A
  command name wins at `Command:` (LTSCALE, FILL, AREA, UCSICON); with an apostrophe a transparent
  command wins (`'LTSCALE`, p164), else the variable (`'AREA`, `'UCSICON`). U names the variable
  (p150); `'AUPREC` at `Command:` is a step U names `'AUPREC` (p412).
- **mellowcad:** a:p108 `Unknown command "ORTHOMODE".` in all four forms; a:p112 `Invalid point.`
  at LINE.
- **Scenario:** a user types `OSMODE` or `FILLETRAD` or `'ORTHOMODE` mid-LINE → nothing, or a refusal
  → AutoCAD asks the value → the daily keyboard path to a setting is gone.
- **Fix:** one generic system-variable path (WORKSPACE-D1, D2): a declarative registry of the
  variables mellowcad models (name, type, range or check, read, patch, storage), and one tool
  that asks a variable's value; a variable's name typed at `Command:` (bare, `_`, `.`, `'`) or with
  `'` at a prompt runs it, as the existing `variable(…)` path resolves names today. It replaces
  `SystemVariableTool`, `AuPrecTool` and `UcsIconVariableTool`.
- **Regression test:** a:p108, a:p112 → `settingsPrompts.test.ts` (or a new `setvar.test.ts`),
  citing the probes.
- **Coverage, rules, catalogs:** `command-line.md` Missing loses "variables typed by name";
  `workspace.md` gains a SETVAR entry; `cad-tools.md` "System variables" is rewritten for the
  registry.

### Medium

#### SVA-01 — SETVAR (es MODIVAR; `SET`, `MV`) does not exist

- **Severity:** medium · **Row:** A, B, F · **Status:** verified · known (`command-line.md` Missing)
- **Where:** no registration; `CadRuntime.ts:1337` only borrows its name.
- **AutoCAD:** `Enter variable name or [?] <LAST>:` (table 26123; es `Indique nombre de variable o
  [?] <LAST>:`), a getstring. In a new drawing no default, and Enter ends silently (p169); the
  default is the last variable named at SETVAR or typed bare (p140, p148, p162), not one set from
  Lisp (p149). Names case-blind (p101, p102), global only, no `_` (p100); an unknown name or an
  abbreviation writes `Unknown variable name.  Type SETVAR ? for a list of variables.` (26122; es
  `Nombre de variable desconocido. Teclee MODIVAR ?` + new line + `para ver la lista de
  variables.`) and **ends** (p103, p122, p124). `SET` (en acad.pgp:387), `MV` (es acad.pgp:260),
  `_.SETVAR` run it (p105, p106; es `_SET` is unknown, p413). Transparent: `'_SETVAR` at LINE asks
  `>>` prompts (p114, p123). Enter at `Command:` repeats it, echoed `SETVAR` / `MODIVAR` (p107). U
  names `SETVAR` / `MODIVAR` (p151), a read-only one too (p158).
- **mellowcad:** a:p101, a:p105 `Unknown command "SETVAR"` / `"SET"` / `"MV"`.
- **Fix:** SETVAR's name prompt in front of the same value question (WORKSPACE-D1, D3); the
  aliases in both catalogs.
- **Regression test:** a:p101, a:p105.

#### SVA-03 — The value prompt and its refusals are per data type; the base class hard-codes one

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `SystemVariableTool.ts:78-92` (`requiresIntegerBetween` from 0).
- **AutoCAD:**
  - **Integer** (`Enter new value for V <n>:`, table 26127): a getint with no limits; the range is
    SETVAR's. A 0/1 switch says `Requires 0 or 1 only.` (es `Requiere 0 o sólo 1.`; p128–p131,
    p146); a range `Requires an integer between a and b.` (es `Requiere un nº entero entre a y b.`;
    AUPREC p132, p133, OSMODE 0–32767 p145, USERI1 p147). `FOO`, `1.5`, `-1`, `~`, `*`, `.`,
    `_LINE` all get it, and the prompt is asked again; Enter keeps.
  - **Real** (a getdist, `<1.0000>` at four places): `FOO` → `Requires numeric distance or two
    points.`, asked again (p134, p135); a value the variable rejects → `Cannot set LTSCALE to that
    value.` + `*Invalid*` (es `Imposible dar a LTSCALE ese valor.` / `*No válido*`) and SETVAR
    **ends**.
  - **String** (`<"0">`, quoted): a rejected value → `Cannot set CLAYER to that value.` `*Invalid*`,
    ends (p137, p138); a nullable one asks `Enter new value for USERS1, or . for none <"">:` (es
    `…, o . para ninguno <"">:`) and `.` empties it (p139, p140).
  - **Point** (`<10.0000,10.0000>`): `FOO` → `Invalid 2D point.` (es `Punto 2D no válido.`), asked
    again (p141, p142).
  - **Read only:** `AREA = 0.0000 (read only)` (es `(sólo lectura)`) and the end (p143, p144).
  - LWDISPLAY's switch takes keywords too: `<OFF>` / es `<DES>`, `Requires 0 or 1 only, or option
    keyword.` (es `Requiere 0 o sólo 1, o una opción.`; p203, p213).
- **mellowcad:** only AUPREC's integer case exists, and matches (`settingsPrompts.test.ts:193-212`).
- **Fix:** a type per registry entry with its prompt form, refusal and re-ask or end (WORKSPACE-D5).
- **Regression test:** one per type, citing these probes.

#### SVA-05 — A variable typed inside a transparent command or variable is refused; 2027 nests it

- **Severity:** medium · **Row:** E · **Status:** verified
- **Where:** `CadRuntime.ts:1552-1575` (`this.suspended === null`).
- **AutoCAD:** p119: `'ZOOM`, then `'ORTHOMODE` at ZOOM's prompt → `>>Enter new value for ORTHOMODE
  <0>:`, `Resuming ZOOM command.`. p120: LINE, `'AUPREC`, `'ORTHOMODE`, `1` → `Resuming SETVAR
  command.`, then `>>Enter new value for AUPREC <0>:` (es `Reanudando el comando MODIVAR.`). p414:
  the same at a bare AUPREC (the prompt again without `>>`). p411: `'_ZOOM` at a transparent
  `'AUPREC` runs nested and resumes SETVAR. The **same** variable typed at its own prompt is a value,
  refused by its type (p410, p415): `settingsPrompts.test.ts:424` holds that.
- **mellowcad:** a:p119 ZOOM's `Requires a distance, numberX, or option keyword.`; a:p120 `Requires
  an integer between 0 and 8.`.
- **Scenario:** LINE → `'Z` → `'ORTHOMODE` → refused, the user leaves ZOOM to set Ortho.
- **Fix:** a second level of suspension for a variable, or for a transparent command under a
  transparent variable (WORKSPACE-D6); a second transparent command under a transparent command
  stays refused.
- **Regression test:** a:p119, a:p120; p411, p414 written for the review.

#### SVR-01 — Every modelled variable but AUPREC, UCSICON and AREA is `Unknown command`

- **Severity:** medium · **Row:** A, B, H, J · **Status:** verified
- **AutoCAD and mellowcad:** the roster, from subagent B (probes as cited; `b:` scratch tests):

| Variable | AutoCAD: type · range · initial · storage | Forms and refusals | mellowcad |
| --- | --- | --- | --- |
| LUPREC | int 0–8 · 4 · drawing (rectang/p304) | range, re-ask (p213) | `precision`; the host setter is not undone (SVR-04) |
| LWDISPLAY | switch + ON/OFF keywords · 0 · drawing | SVA-03 (p203, p213) | `lwDisplay` (on: WHY) |
| ATTMODE | int 0–2 · 1 · drawing | writes ` Regenerating model.` (p213) | `attributeDisplay` |
| ELEVATION, THICKNESS | distance, negatives · 0 · drawing | (p211) | settings |
| NAVVCUBEDISPLAY | int 0–3 · 3 · drawing (p219) | (p213) | one flag (SVR-03) |
| FILLMODE | switch · 1 · drawing | | `fillMode` |
| PLINEWID, FILLETRAD, CHAMFERA, CHAMFERB | distance ≥ 0 · 0 · drawing | `-1` Cannot set (p211, p222) | settings |
| TEXTSIZE | distance > 0 · 2.5 · drawing | `0` Cannot set; a negative taken as its size (p211, p222) | `textSize` |
| ORTHOMODE, GRIDMODE | switch · 0 / 1 · drawing | (p213) | settings |
| SNAPMODE | int 0–2 · 0 · drawing | `2` taken (p222) | a boolean |
| SNAPUNIT | point, both > 0 · 10,10 · drawing | `0,0`, `-5,5` Cannot set (p212) | `snapUnit` |
| INSUNITS | int 0–24 · 4 · drawing (p219) | 0, 21 Cannot set; 25 range (p213, p222) | `unit` (4, 5, 6) |
| CECOLOR | string · `"BYLAYER"` (es `"PORCAPA"`) · drawing | `1`, `red`, `BYBLOCK`, `0`, `256`, `255,0,0`, `RGB:255,0,0`; es `PORCAPA`, `rojo`; `257`, `FOO` Cannot set (p204, p208, p215, p217) | `currentColor` |
| CELTYPE | string · `"BYLAYER"` shown · drawing | not loaded / `FOO` Cannot set (p215) | `currentLinetype` |
| CELWEIGHT | int −3…211, standard values · −1 · drawing | `0.25`, `-4` range; `26`, `33` Cannot set (p209, p217) | `currentLineweight` in mm |
| CLAYER, TEXTSTYLE | string · `"0"`, `"Standard"` · drawing | an undefined name Cannot set; case-blind (p216) | current layer, style |
| HPNAME | string · `"ANGLE"` · per drawing | keeps `_` and case; `.` resets; `FOO` Cannot set; en `USER`, es `_USER` (p216) | `hatchPatternName` |
| HPSCALE, HPANG | distance > 0; angle · per drawing | (p211; HPANG 400 → 40°) | settings (HPANG matches) |
| INSNAME | nullable string · `""` · per drawing | an undefined name taken; `.` clears (p216) | InsertTool |
| LASTPOINT | point in the UCS · per drawing | `@5,0` from itself (p212) | `lastPoint`, WCS |
| CIRCLERAD, OFFSETDIST, POLYSIDES | distance ≥ 0; < 0 Through; int 3–1024 · per drawing | (p211, p213) | tools' session fields |
| AFLAGS | int 0–63 · 16 · session | (p213) | AttDefTool |
| OSMODE | int 0–32767 · 4133 · registry | (p214) | running snaps |
| POLARANG, POLARDIST | angle 90; distance 0 · registry | (p205, p211) | `polarAngleStep`; SnapMode 10 (SVR-02) |
| SELECTIONCYCLING, TRIMEXTENDMODE, EDGEMODE, TEXTEDITMODE, SPLMETHOD, SPLKNOTS, SPLDEGREE, ARRAYASSOCIATIVITY, CLIPROMPTLINES | int ranges · registry or session | (p214) | session fields, constants |
| PERIMETER, DISTANCE, UCSNAME, UCSORG, UCSXDIR, UNDOCTL, CLEANSCREENSTATE | read only | `X = v (read only)` (p207) | modelled |

- **mellowcad:** b:roster `Unknown command "X".  Press F1 for help.` for each.
- **Fix:** each enters the registry (WORKSPACE-D30), with its cells; LUNITS and the others of
  WORKSPACE-D31 go to Missing.
- **Regression test:** b:roster, per variable, citing its probe.
- **Coverage:** a SETVAR entry in `workspace.md` lists the variables typed; each area's Missing loses
  its variable.

#### SVR-02 — POLARDIST starts at 10 here; in AutoCAD it starts at 0, which means Snap X spacing

- **Severity:** medium · **Row:** D, H · **Status:** verified (help and harness)
- **Where:** `cad/application/SnapMode.ts:27` (`polarDistance = 10`), `:80` (refuses ≤ 1e-6).
- **AutoCAD:** POLARDIST 0 initially (p202, p205), registry (p219), takes −1 (p211); help
  GUID-66D637C9: "If this value is 0, the PolarSnap distance assumes the value for Snap X Spacing."
- **mellowcad:** b:semantics — after `SNAP 5`, the PolarSnap distance is still 10.
- **Scenario:** SNAP 5, PolarSnap on → AutoCAD steps 5, mellowcad 10.
- **Fix:** POLARDIST held as AutoCAD holds it, 0 meaning Snap X (WORKSPACE-D36).
- **Regression test:** b:semantics, citing the help GUID and p205.
- **Coverage:** `drafting-aids.md`, SNAP's entry. The stepping itself is checked on the desktop (WSD).

#### SVR-04 — Settings changed by keys and setters are not undone; a typed variable must be

- **Severity:** medium · **Row:** F · **Status:** verified (harness); AutoCAD's keys' undo unverified
- **Where:** `CadRuntime.toggleOrtho`, `toggleGrid`, `toggleSelectionCycling`, `setPolarAngleStep`,
  `setSnapPolarDistance`, `setDocumentPrecision`.
- **AutoCAD:** p218 (untraced): U takes back each of 54 variables typed, registry ones included.
- **mellowcad:** b:semantics — F8, F7, Ctrl+W, POLARANG, POLARDIST and the LUPREC host setter stay
  after U.
- **Fix:** a typed variable is one undo step whatever its storage: `UpdateSettingsCommand` for the
  drawing's, `SessionSettingCommand` for the program-wide (WORKSPACE-D35). Whether F7 / F8 / Ctrl+W
  are undo steps in AutoCAD is WSD's.

#### UNT-01 — CLEANSCREENON and CLEANSCREENOFF are no undo step: U after them takes back the last edit

- **Severity:** medium · **Row:** F · **Status:** verified
- **Where:** `CadRuntime.ts` `setCleanScreen`; `runtimeCommands.ts:248-249`.
- **AutoCAD:** p306: `_CLEANSCREENON`, `_U` echoes `CLEANSCREENON` (es `LIMPIAPANTACT`), OFF the same
  (`LIMPIAPANTDES`); p316: after U CLEANSCREENSTATE is 0, REDO (`CLEANSCREENON`) sets it to 1.
- **mellowcad:** c:p306 `["CLEANSCREENON", "U", "LINE"]`, the line gone.
- **Scenario:** draw a line → Ctrl+0 → U → the line is erased and the screen stays clean.
- **Fix:** a named step whose undo and redo toggle Clean Screen (WORKSPACE-D60).
- **Regression test:** `workspaceCommands.test.ts`, citing p306, p316.

#### UNT-02 — U after UNITS names nothing, and a run that changes nothing is no step

- **Severity:** medium · **Row:** F · **Status:** verified for OK; Cancel unverified (WSD)
- **Where:** `CadRuntime.ts` `applyDrawingUnits` runs outside the UNITS run that named it;
  `workspaceCommands.test.ts:192` asserts no step.
- **AutoCAD:** p307: `_UNITS`, `_U` echoes `UNITS` / `UNIDADES`; p308: -UNITS changing the
  precision, U echoes `-UNITS` and LUPREC is back; p309: -UNITS with every default still a step.
- **mellowcad:** c:p308 after OK, U writes `U` alone; c:p307 after Cancel, U takes back the LINE
  before.
- **Fix:** UNITS is one run named UNITS until its dialog closes, OK's patch inside it
  (WORKSPACE-D61).
- **Regression test:** `workspaceCommands.test.ts`, citing p307–p309; :192 rewritten.

#### MAC-01 — Ctrl+0, Ctrl+1, Ctrl+9, Ctrl+S and Ctrl+O act inside the running command; their macros cancel it

- **Severity:** medium · **Row:** G, chrome · **Status:** verified from acad.cuix; the echo's case is WSD's
- **Where:** `CadRuntime.keyDown` (the accelerators).
- **AutoCAD:** AcceleratorRoot.cui: CTRL+0 `$M=$(if,$(and,$(getvar,CleanScreenState),1),^C^C_CleanScreenOFF,^C^C_CleanScreenON)`;
  CTRL+1 `…^C^C_propertiesclose,^C^C_properties`; CTRL+9 `…^C^C_commandlinehide,^C^C_commandline`;
  CTRL+S `^C^C_qsave`; CTRL+O `^C^C_open`.
- **mellowcad:** c: Ctrl+0, 1 and 9 inside LINE leave LINE running, nothing written; Ctrl+S saves
  and LINE goes on.
- **Scenario:** in LINE → Ctrl+S → AutoCAD ends LINE and saves; mellowcad saves and LINE continues.
- **Fix:** each key cancels the running command and runs its command echoed as its macro
  (WORKSPACE-D63).
- **Regression test:** `workspaceCommands.test.ts`, citing the cuix ids.

#### MAC-02 — The rail's Attribute display ends the running command; its macros are transparent

- **Severity:** medium · **Row:** E, chrome · **Status:** verified
- **AutoCAD:** p313: `'_attdisp` at LINE asks `>>Enter attribute visibility setting [Normal/ON/OFF]
  <Normal>:` and resumes LINE; acad.cuix `'_attdisp _n` / `_on` / `_off` (ID_AttdispNo/On/Of).
- **mellowcad:** c: inside LINE it echoes `_attdisp` and LINE ends.
- **Fix:** the tool says `transparentMacro` (WORKSPACE-D64); `cad-runtime.md`'s rule then holds.

#### MAC-03 — The top bar's Match Properties ends the running command; its macro is `'_matchprop`

- **Severity:** medium · **Status:** unverified (the console does not know MATCHPROP)
- **AutoCAD:** ID_Matchprop `'_matchprop ` (Home › Properties).
- **mellowcad:** c: `_matchprop` echoed, LINE ended.
- **Fix:** after WSD: run transparently, or refuse in `notTransparent`'s words and keep the
  command, whichever the desktop shows.

#### MAC-04 — The rail's Edit attributes runs ATTEDIT; the ribbon's Single runs EATTEDIT

- **Severity:** medium · **Status:** verified
- **AutoCAD:** RibbonRoot, Block panel, Edit Attributes: Single `^C^C_eattedit`, Multiple
  `^C^C_-attedit`.
- **mellowcad:** c: echo `_attedit`, prompt `ATTEDIT Select block reference:`.
- **Fix:** the rail's member runs EATTEDIT (`useEnhancedEditor`, echo `_eattedit`) (WORKSPACE-D65).
- **Coverage:** "Attributes ▾ holds Edit (EATTEDIT)" is false; Multiple exists (settles the
  **unverified**; -ATTEDIT is not built: Missing).

### Low

#### SVA-04 — SETVAR's `?` listing

- **Severity:** low · **Status:** verified (part of SVA-01)
- **AutoCAD:** p125–p127: `Enter variable(s) to list <*>:` (es `Indique variable(s) a listar <*>:`),
  wildcards; the name padded to 18 columns, then the value; a read-only one padded to 36 then
  ` (read only)` (26125); strings quoted, cut at 60 with `...`; points at four places; values in the
  language (es CECOLOR `"PORCAPA"`); core variables alphabetically, then registered ones; `Press
  ENTER to continue:` pauses (every 4 lines in the console: its window).
- **Fix:** the modelled variables listed so, without the console's pause (WORKSPACE-D7).

#### SVA-06 — AUPREC's coverage, comments and tests cite AutoCAD 2023; the Spanish period is settled

- **Severity:** low · **Status:** verified
- **Where:** `docs/coverage/workspace.md` (AUPREC: "as AutoCAD 2023's console asks it", the
  **unverified** period); `CadRuntime.ts:1333-1335`; `runtimeCommands.ts:26`;
  `settingsPrompts.test.ts:189-191` ("2023", "2026"), `:406` (`acc/sv1.txt`); `undoEcho.test.ts:105`
  (uncited).
- **AutoCAD:** every claim holds on 2027: p100, p115, p118, p132, p133, p153; es `Requiere un nº
  entero entre 0 y 8.` with its period (p132, p133).
- **Fix:** cite the 2027 probes; drop the unverified mark.

#### SVR-03 — Values that would mean something else here: the build handles each

- **Severity:** low (nothing is typable yet) · **Status:** verified per probe
- CECOLOR: BYBLOCK, `0` and indexes 8–255 have no representation here; es takes `PORCAPA`,
  `PORBLOQUE`, `rojo` and shows `<"PORCAPA">`; `RGB:r,g,b` taken (p204, p208, p215).
- CELTYPE: `<"BYLAYER">` in capitals, other linetypes as stored; AutoCAD refuses one not loaded
  (all six are loaded here, WHY in `linetypes.ts`).
- CELWEIGHT: hundredths of a millimetre; −2 and −3 unmodelled; a non-standard value Cannot set,
  where -LWEIGHT rounds (p209, p217).
- TEXTSIZE: a negative is taken as its size (p211, p222). LASTPOINT: typed in the UCS, `@` from
  itself (p212). NAVVCUBEDISPLAY: 0–3 bits against one flag. INSUNITS: 1–24 but 0 and 21. OSMODE:
  bits 8 and 1024 unmodelled, 16384 suspends. AFLAGS: bit 32 unmodelled. SNAPMODE takes 2.
  DIMxxx: an override (p220).
- **Fix:** WORKSPACE-D33, D34, D37–D41.

#### SVR-05 — AUPREC's citations

- **Severity:** low · **Status:** verified · the same cells as SVA-06 (b: p203, p213): executed with
  it.

#### UNT-03 — DDUNITS is not an alias here

- **Severity:** low · **Status:** verified
- **AutoCAD:** en acad.pgp:505 `DDUNITS, *UNITS`; es :513 `DDUNITS, *UNIDADES`; p311 runs UNITS.
- **mellowcad:** c:p311 `Unknown command "DDUNITS".`.
- **Fix:** the alias in both catalogs (WORKSPACE-D62).

#### UNT-04 — The application menu's and the status bar's Units run `_UNITS`, not `'_units`

- **Severity:** low · **Status:** unverified (the application menu is not in acad.cuix)
- **Where:** `components/cad/top-bar.tsx`, `components/cad/status-bar.tsx` (`runCommand("_UNITS")`).
- **AutoCAD:** UNITS' macro is `'_units ` (ID_Units, MM_0578, MM_1470); p303 `Resuming LINE
  command.` after it.
- **mellowcad:** c: inside LINE, `UNITS` echoed and no `Resuming LINE command.`.
- **Fix:** run as its macro (`'_units`) (WORKSPACE-D68); the application menu's macro checked in WSD.

#### UNT-05 — UNITS' and CLEANSCREEN's coverage is stale against 2027

- **Severity:** low · **Status:** verified
- `UNS` is in es acad.pgp (the `†` goes); U after UNITS is probed (p307); -UNITS exists (p300) and
  its prompts belong in Missing; `'UNITS` is transparent (p303); CLEANSCREENON is not (p305).

#### MAC-05 — The Default menu's Pan runs PAN as typed; its macro is `'_pan`

- **Severity:** low · **Status:** verified
- **AutoCAD:** MM_1562 `'_pan` (Default and Command menus).
- **mellowcad:** c: `PAN` echoed, U names `PAN`; the navigation bar's Pan writes `'PAN` and U names
  `'PAN GROUP` (view/d07).
- **Fix:** the menu's Pan through `navigate("PAN")` (WORKSPACE-D66).

#### MAC-06 — Shortcut menu entries echo the command's local name, not their macro

- **Severity:** low · **Status:** unverified (WSD)
- **AutoCAD:** CMEDIT `^C^C_erase `, `^C^C_properties `; Deselect All `^C^C^Pai_deselect ^P`.
- **mellowcad:** c: `ERASE 1 found`, `PROPERTIES`; Deselect All writes `*Cancel*`.
- **Fix:** after WSD, as the desktop echoes them.

#### MAC-07 — Three menu labels differ from acad.cuix

- **Severity:** low · **Status:** verified
- es Deselect All `Deseleccionar todo` → `Anular selección`; en Command menu `Snap Overrides` →
  `Osnap Overrides`; en `Copy with base point` → `Copy with Base Point` (from the `copybase` label).
- **Fix:** WORKSPACE-D67.

#### MAC-08 — The coverage and `tool-rail.tsx` contradict acad.cuix

- **Severity:** low · **Status:** verified
- Home › Annotation has a Dimension drop-down (Linear, Aligned, Angular | Arc Length, Radius,
  Diameter | Ordinate, Jogged); ATTDISP has a ribbon place (the ATTMODE drop-down, Block panel
  expanded, and Insert › Block Definition); Clipboard ▸'s Cut with Base Point, Paste as Hyperlink
  and Paste Special are absent from Missing; ID Point sits in Utilities' expanded part.
- **Fix:** WORKSPACE-D69.

#### MAC-09 — Ctrl+L (Ortho, `^O`) is not handled and not in the coverage

- **Severity:** low · **Status:** unverified (whether Chrome lets a page take Ctrl+L)
- **Fix:** in WSD's browser check: bound if Chrome lets the page take it, else a deviation in
  `drafting-aids.md` with its WHY.

## 6. Decisions taken

- **WORKSPACE-D1:** one generic system-variable path: a declarative registry of the modelled
  variables (name, type, range or check, read, patch, storage, nullable, keywords) and one tool for
  the value prompt, entered by SETVAR or by a variable's name; it replaces `SystemVariableTool`,
  `AuPrecTool` and `UcsIconVariableTool`. AutoCAD has one mechanism (every trace ends SETVAR).
- **WORKSPACE-D2:** names: at `Command:` a command name or alias first, then a variable; with `'` a
  transparent command first, then a variable; variable names global only, `_` and `.` stripped
  (p108–p111, p164) — the rule the runtime already follows for AREA and UCSICON.
- **WORKSPACE-D3:** SETVAR's default is the last variable named or typed bare, per session, not saved;
  none in a new session, Enter then ends (p140, p148, p169).
- **WORKSPACE-D4:** every set through the path is one undo step named as invoked (`ORTHOMODE`,
  `'AUPREC`, `SETVAR`), with no change too (p150–p159, p412).
- **WORKSPACE-D5:** refusals by type as SVA-03: a type's refusal re-asks, a value the variable
  rejects writes `Cannot set X to that value.` + `*Invalid*` and ends.
- **WORKSPACE-D6:** a variable (or a transparent command) typed at a transparent variable's prompt,
  and a variable typed in a transparent command, run nested; a transparent command in a transparent
  command stays refused; the same variable at its own prompt is a value (p119, p120, p410, p411,
  p414, p415).
- **WORKSPACE-D7:** `?` lists the modelled variables in AutoCAD's format, with no pause (the history
  scrolls); the desktop's page length **unverified** in Missing.
- **WORKSPACE-D30:** typable now, each where its effect exists here: LUPREC, AUPREC, LWDISPLAY,
  ATTMODE, ELEVATION, THICKNESS, NAVVCUBEDISPLAY, FILLMODE, PLINEWID, FILLETRAD, CHAMFERA, CHAMFERB,
  TEXTSIZE, ORTHOMODE, SNAPMODE, SNAPUNIT, GRIDMODE, INSUNITS, CECOLOR, CELTYPE, CELWEIGHT, CLAYER,
  TEXTSTYLE, HPNAME, HPSCALE, HPANG, INSNAME, LASTPOINT, CIRCLERAD, OFFSETDIST, POLYSIDES, AFLAGS,
  OSMODE, POLARANG, POLARDIST, SELECTIONCYCLING, TRIMEXTENDMODE, EDGEMODE, TEXTEDITMODE, SPLMETHOD,
  SPLKNOTS, SPLDEGREE, ARRAYASSOCIATIVITY, CLIPROMPTLINES, UCSICON; read only AREA, PERIMETER,
  DISTANCE, UCSNAME, UCSORG, UCSXDIR, UNDOCTL, CLEANSCREENSTATE. The SVA block builds the path with
  the drawing's variables and the read-only ones; the SVR block the program-wide and per-drawing
  ones that live outside `DocumentSettings`.
- **WORKSPACE-D31:** to Missing, their effect fixed or unmodelled: LUNITS, ATTDIA, ATTREQ, HPORIGIN,
  DYNMODE, SHORTCUTMENU, PICKBOX, APERTURE, AUTOSNAP, POLARMODE, MBUTTONPAN, LWDEFAULT, ZOOMFACTOR,
  LAYLOCKFADECTL.
- **WORKSPACE-D32:** the DIMxxx variables stay in Missing: typed, they make an override (p220), which
  is not modelled (DIMS-D9).
- **WORKSPACE-D33:** CECOLOR takes what -COLOR takes plus `RGB:r,g,b`; BYBLOCK, `0` and 8–255 get
  `Cannot set CECOLOR to that value.` with a WHY; es takes its words and shows `<"PORCAPA">`; CELTYPE
  the same.
- **WORKSPACE-D34:** CELWEIGHT in hundredths: −1 and the standard values; −2, −3 and a non-standard
  value Cannot set (WHY for −2, −3); out of range the range refusal.
- **WORKSPACE-D35:** a typed variable is one undo step whatever its storage (p218):
  `UpdateSettingsCommand` or `SessionSettingCommand`.
- **WORKSPACE-D36:** POLARDIST starts at 0, meaning Snap X spacing; program-wide.
- **WORKSPACE-D37:** ranges come from the probes (the trace carries none), per variable as SVR-01.
- **WORKSPACE-D38:** TEXTSIZE takes a negative as its size; `0` is refused.
- **WORKSPACE-D39:** NAVVCUBEDISPLAY keeps the integer; the cube shows while bit 2 is set.
- **WORKSPACE-D40:** OSMODE keeps the integer; NOD and GCEN kept without effect (Missing); 16384
  suspends.
- **WORKSPACE-D41:** LASTPOINT is typed in the UCS, `@` from itself, stored in the WCS.
- **WORKSPACE-D60:** CLEANSCREENON / OFF are named steps U and REDO toggle (p306, p316).
- **WORKSPACE-D61:** UNITS is one run named UNITS, OK's change inside it; Cancel after WSD.
- **WORKSPACE-D62:** DDUNITS in both languages.
- **WORKSPACE-D63:** Ctrl+0, 1, 9, S and O cancel the running command and run their command, echoed
  as the macro writes it (`_qsave`); the echo's case is checked in WSD.
- **WORKSPACE-D64:** ATTDISP's rail member is `transparentMacro`.
- **WORKSPACE-D65:** the rail's Edit attributes runs EATTEDIT.
- **WORKSPACE-D66:** the Default menu's Pan through `navigate("PAN")`.
- **WORKSPACE-D67:** the three labels from acad.cuix.
- **WORKSPACE-D68:** the application menu's and status bar's Units run `'_units`.
- **WORKSPACE-D69:** the coverage and `tool-rail.tsx` corrected (MAC-08, UNT-05).
- **WORKSPACE-D90:** this review owns the area, so the gaps `command-line.md` lists as Missing for
  it (SETVAR, variables typed by name) are findings executed here, not `known`.
- **WORKSPACE-D91:** the name prompts' spaces go to WSD: the console cannot tell (p400–p407).
- **WORKSPACE-D92:** the `<command> GROUP` undo names of the ribbon and menu buttons, the chrome
  menus' echo (UCD-07), MAC-03 and MAC-06 go to WSD: only the desktop runs a macro from a menu.
- **WORKSPACE-D93:** a string variable's value takes no space until WSD shows it does (`USERS1`'s
  `a b`).

## 7. Tests proposed

Regression tests are in each finding. Besides them, the untested cells, by file:

- `settingsPrompts.test.ts` (or `setvar.test.ts`): Enter keeps the value (p133), `_LINE` at the value
  prompt (p121), Enter with no change a named step (p159), REDO's name (p153), `UNDO 2` (p154),
  `'AUPREC` at `Command:` named `'AUPREC` (p412), LINE's Undo after a transparent variable (p157),
  the preselection and LASTPOINT (p161), the Arabic interface (a:p133 ar).
- `workspaceCommands.test.ts`: `'UNITS` resumes LINE (p303), `'CLEANSCREENON` refused (p305), the
  0–8 places cited (p300), the aliases cited (acad.pgp), the es names cited (tables 52589, 52590).
- `shortcutMenu.test.ts`: the Default and Edit orders cited (PM_0006, PM_0007).
- `transparentCommands.test.ts:430-450`: its WHY ("ORTHOMODE is no variable yet") rewritten on
  `'ORTHOMODE` (p112).
- Old citations: `settingsPrompts.test.ts:189, 406` → p100, p118, p132; `undoEcho.test.ts:105` →
  p153.

## 8. What is not tested and why

- The chrome's look (the status bar, the top bar, the palette, the menus' DOM): presentation, the
  desktop's and the browser's (WSD).
- The Drawing Units dialog's layout: `components/cad/units-dialog.tsx` is presentation; what it
  sends is tested through `applyDrawingUnits`.
- Which variables a TypeScript registry entry covers: the type guarantees the fields.

## 9. What could not be reviewed and why

- Everything the desktop alone shows: §12.
- AutoCAD's initial values for registry variables (DYNMODE, SELECTIONCYCLING, AUTOSNAP): the
  isolated console starts at the owner's profile; the help's are taken where needed.
- What SNAPMODE 2 and INSUNITS' refusal of 0 and 21 mean: unprobed, and SNAPMODE 2's effect (polar
  snap) is SNAP's Type, already modelled by SNAP's keyword.

## 10. Refuted in the adversarial pass

- ~~`settingsPrompts.test.ts:424` asserts what 2027 contradicts (`'AUPREC` at AUPREC's prompt)~~ —
  p410, p415: the same variable at its own prompt is a value, refused by its type, as the test holds.
- ~~AUTOSNAP's 63 is wrong (the console reads 55)~~ — the isolated console starts registry
  variables at the owner's profile (console.md); so do DYNMODE 0 and SELECTIONCYCLING 0.
- ~~U leaves CIRCLERAD and POLYSIDES~~ — known (RECTANG-D48), p221 confirms it on 2027.
- ~~The console's `AllowSpaces: false` says a name prompt ends at a space~~ — p406: -TEXT's `Enter
  text:` says the same and takes spaces (and ucs/d05 saved `AB CD`).
- ~~Ctrl+Shift+S, Ctrl+Shift+Z, the QAT's silent Undo and Redo~~ — known
  (`clipboard-and-files.md`, `command-line.md`).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

What does not hold (the rest of `workspace.md` holds, each cell in §4):

| Claim | Probe | State |
| --- | --- | --- |
| AUPREC "as AutoCAD 2023's console asks it"; es period **unverified** | p100, p132, p133 | no longer true in 2027 (SVA-06) |
| UNITS: OK one undo step (**unverified**) | p307–p309 | false: no name, no step without change (UNT-02) |
| UNITS: es `UNS`† | es acad.pgp:284 | false (UNT-05) |
| UNITS Missing: -UNITS | p300 | holds; its prompts to list (UNT-05) |
| CLEANSCREEN: a palette opened shows the panel (**unverified**) | — | WSD |
| Tool palette: Attributes ▾ Edit (EATTEDIT); Multiple **unverified** | RibbonRoot | false (MAC-04) |
| Tool palette: no 2026 page lists the Home tab's Linear ▾; ATTDISP has no ribbon place | RibbonRoot | false (MAC-08) |
| Shortcut menus: Default and Edit order **unverified** | PM_0006, PM_0007 | holds; settled |
| Shortcut menus: Deselect All, Snap Overrides, Copy with base point | PopMenuRoot | false (MAC-07) |
| Shortcut menus: Pan runs PAN | MM_1562 | false (MAC-05) |

| Rule (file, section) | Claim | Code | State |
| --- | --- | --- | --- |
| `cad-runtime.md`, Transparent commands | "a rail tool says `transparentMacro`" for a `'` macro | ATTDISP's does not | broken (MAC-02) |
| `cad-tools.md`, System variables | a variable extends `SystemVariableTool`, refuses with `requiresIntegerBetween` | the registry replaces it | stale after SVA (rewritten in the block) |
| `cad-runtime.md`, Commands and history | the settings U undoes: … AUPREC, UNITS (`applyDrawingUnits`) … | UNITS' step unnamed | broken (UNT-02) |
| `ui.md`, Where a control belongs | "Buttons run commands by global name … so they echo" | Units' `'_units`, the accelerators' `^C^C` | partly (UNT-04, MAC-01) |

Checked and holding: `ui.md`'s Clean Screen at first paint, `takesSpaces` at the command line,
the palette panel's tabs; `cad-runtime.md`'s Ctrl+Z / Ctrl+Y macros, the right button's Enter,
`chooseShortcutMenuAction` closing the menu first; `cad-catalogs.md`'s names of variables never
translated.

## 12. Order of execution and estimate

One subagent per block, one commit each, in this order (they share the catalogs, `CadRuntime.ts`
and the English snapshot):

1. **SVA** (SVA-01 to SVA-06, SVR-05; SVR-01's drawing and read-only variables): the registry, the
   value tool, SETVAR and its `?`, names typed bare and with `'`, the refusals per type, nesting,
   undo naming; AUPREC, UCSICON's variable and AREA moved onto it; the citations. Large.
2. **SVR** (SVR-01's other variables, SVR-02 to SVR-04): the program-wide and per-drawing variables
   kept outside `DocumentSettings`, each as an undoable step; POLARDIST; the value semantics.
   Medium. Blocked by SVA.
3. **UNT** (UNT-01 to UNT-05): Clean Screen's and UNITS' steps, DDUNITS, Units' macro, the coverage.
   Small.
4. **MAC** (MAC-01, MAC-02, MAC-04, MAC-05, MAC-07, MAC-08; MAC-09 to the coverage pending WSD):
   the accelerators' macros, ATTDISP's and EATTEDIT's rail members, the menu's Pan, the labels, the
   coverage. Small to medium.
5. **WSD** — the desktop, in its own session with the owner's mouse; its findings take this prefix.
   Probes, each in `scripts/research/probes/workspace/`:
   - d01 the status bar: each toggle's echo (Grid, Lineweight, Selection Cycling, Clean Screen; F7,
     Ctrl+W), U after each at `Command:`, the menus' order against the coverage.
   - d02 the ribbon and the QAT: U after a ribbon button (`LINE` or `LINE GROUP`), the QAT's Undo
     and Redo (echo, U), Match Properties and the ATTMODE drop-down during LINE (MAC-03), the Insert
     gallery during LINE, Move during a grip edit.
   - d03 the shortcut menus: each entry's echo and U name (Erase, Move, Properties, Pan, Deselect
     All: MAC-06); the echo of a menu's prompts (UCD-07's analogue).
   - d04 the keys: Ctrl+0, Ctrl+1, Ctrl+9, Ctrl+S inside LINE and at `Command:` (MAC-01's echo);
     U after Ctrl+0 restoring the interface; with Clean Screen on, LAYER or Ctrl+1 showing the
     palette (the coverage's **unverified**).
   - d05 UNITS: the dialog in both languages (the Precision list's `0.0000`, the Insertion scale
     list's label, capitals), Cancel and an unchanged OK then U (UNT-02), `'UNITS` in LINE
     resuming after the dialog closes; the application menu's Units during LINE (UNT-04).
   - d06 the name prompts of §4's WSD table typed key by key with a space (`AB CD`), and a string
     variable's value (`USERS1`, `a b`).
   - d07 SETVAR: Escape at its prompts and in a nested variable, the `?` page length, dynamic
     input's tooltip at its prompts, the preselection after a variable typed.
   - d08 PolarSnap stepping with POLARDIST 0 after SNAP 5 (SVR-02).
   - e01 the Spanish profile: d01's and d03's labels and echoes.
   - The browser (skill `browser-verify`): whether Chrome lets the page take Ctrl+L (MAC-09).

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/workspace.md`: a SETVAR entry (its prompts, `?`, the variables typed, the types'
  refusals, nesting, undo); AUPREC's entry folded into it; UNITS (`†`, U, -UNITS' prompts, `'UNITS`,
  DDUNITS), CLEANSCREEN (undo, not transparent), the tool palette (EATTEDIT, Multiple, the
  Dimension drop-down, ATTDISP's place, ID's), the shortcut menus (orders settled, labels, Pan,
  the Clipboard ▸ entries in Missing).
- `command-line.md`: Missing loses SETVAR and the variables typed; each area's Missing loses its
  typed variable (`drafting-aids.md`, `properties.md`, `dimensions.md`, `modify.md`, `draw.md`) and
  gains WORKSPACE-D31's where its own; `drafting-aids.md`: POLARDIST, Ctrl+L.
- Rules: `cad-tools.md` "System variables" rewritten for the registry; `cad-runtime.md`'s settings
  list (Clean Screen, UNITS' step), transparency (a variable nests), the accelerators' `^C^C`.
- Catalogs: SETVAR's prompts and messages (26122, 26123, 26125, 26127, `Requires 0 or 1 only.`,
  `Cannot set X to that value.`, `*Invalid*`, `Invalid 2D point.`, `Requires numeric distance or two
  points.`, the nullable prompt, `(read only)`), the aliases `SET`, `MV`, `DDUNITS`; the labels of
  MAC-07; the English snapshot.
- Roadmap: row 24 `plan`, then `done` once WSD runs; the open lines settled (TEXTSIZE, HPNAME…,
  ATTDIA…, LWDISPLAY…, the rail's apostrophe macros), and those WSD takes named.

## 14. Template improvements

- **The tracer's `AllowSpaces` is no evidence**: false at every name prompt and at -TEXT's
  `Enter text:` (p406). A name prompt's spaces are a desktop cell, always (annex-probes.md §2).
- **The traced runner's own `_SECURELOAD` is SETVAR's default in a traced run**, and the runner
  filters its lines: a probe of SETVAR's default runs untraced (annex-probes.md §2).
- **A batched probe's fallback answer is a number**: a word at `Command:` can run a command
  (AutoComplete turned `ANGLE` into MEASUREMENT; es `ByLayer` ran SETBYLAYERMODE) (annex-probes.md
  §2).
- **acad.cuix settles the chrome before the desktop**: AcceleratorRoot (keys), PopMenuRoot (menus'
  order, labels, macros), RibbonRoot (panels, drop-downs) answered three **unverified** marks and
  found MAC-01 without a click (matrix.md row A, template §1.1's UI line).
