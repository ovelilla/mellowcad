# Clipboard and files review (COPYCLIP, CUTCLIP, COPYBASE, PASTECLIP, NEW, QNEW, QSAVE, SAVEAS, OPEN)

> **Status:** done, 2026-10-29. Phases 0–4 and four console blocks (CLP, PST, FSV, CKY) in one
> session with skill `command-review`, the desktop block (CFD) in a second with the owner's mouse
> and Windows clipboard; the twenty-fifth and last review of `docs/coverage/roadmap.md`'s order.
>
> It owns no cross-cutting area. It took the Workspace review's analogues: a chrome start is a menu
> group, Ctrl+S / Ctrl+O / Ctrl+Shift+S are `^C^C` macros.
>
> The full plan is in git: `git show e9d04c7:docs/plans/clipboard-review.md`. It holds the
> inventory, the matrices, the findings, decisions CLIPBOARD-D1 to D25, the refuted suspicions,
> and coverage and rules ↔ code.

## Summary

There were 0 critical, 2 high, 12 medium and 8 low findings, all executed in five commits.

The worst:

- **QSAVE and SAVEAS made no undo step**, so U after a save took back the edit before it; 2027
  makes each a step U names `QSAVE` and regenerates (FSV-01).
- **A paste left what it pasted selected**: on the desktop nothing is selected after it and the
  pasted set is Previous, so the next command asks (CFD-01). The console's `(ssget "_I")`
  (erase/p263) had been its text paste's MTEXT.
- **The clipboard keys and the top bar's file buttons were not their `^C^C` macros**: they acted
  inside the running command, echoed nothing or the command's name and made no step (CKY-01,
  CKY-02, CFD-04).

**Evidence:**

- About 45 console probes in es-ES and en-US (p100–p127, p200–p215) on AutoCAD 2027 (R26.0); the
  tables of 2026-10-20; `acad.cuix`'s AcceleratorRoot, PopMenuRoot and MenuGroup macros; each
  language's `acad.pgp`; `acad2027doc.lsp`'s `c:ai_selall`.
- A desktop pass: d01–d08 (en-US) and e01 (es-ES), with the owner's clipboard saved and put back.
- **The console's clipboard is not the program's**: its COPYCLIP writes nothing to Windows' and its
  PASTECLIP pastes Windows' text as an MTEXT. Its prompts, echoes and U names stood; its paste's
  refusals and selection did not (p108–p110 and erase/p263, refuted by d02 and d04).

## Probes

Console inputs are `scripts/research/probes/clipboard/<id>.txt` (`.plain` untraced, `.es` / `.en`
one locale), run one at a time (`PROBE_JOBS=1 scripts/research/probe.sh clipboard <ids>`: the runs
share Windows' clipboard); the desktop pass is `scripts/research/probes/clipboard/d01-e01.sh`.
Transcripts and screenshots are in `research/probes/clipboard/` (gitignored; the owner's clipboard
text redacted).

| Id | What it asks |
| --- | --- |
| p100–p107 | the names; U after each copy; COPYCLIP's Enter; COPYBASE's base point |
| p108–p116 | PASTECLIP's prompt (the console's text paste: its refusals refuted by d02) |
| p117–p127 | transparency, repeat, a locked layer, AI_SELALL (stubbed), preselections, U |
| p200–p215 | QSAVE, SAVEAS, SAVE, OPEN, QNEW: prompts, U, repeat, the pgp's URL aliases |
| d01–d03 | the paste's position, LASTPOINT, selection; a base's Z, a turned UCS, the trace; layers and blocks |
| d04 | the jig: the ghost, the box, a typed polar point, COPYBASE's box |
| d05, e01 | Ctrl+C, X, Shift+C, V in LINE and at `Command:`; the shortcut menu's Clipboard ▸ and its U |
| d06 | Ctrl+A in LINE: echo, grips, U |
| d07 | an empty clipboard |
| d08 | the QAT's and application menu's New, Open, Save, Save As; a save made on a titled drawing |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| CLP-01 | COPYBASE's base point refused in silence | `Invalid point.`, Enter too (p106, p107) | `ea9556c` |
| CLP-02 | COPYBASE dropped its preselection | kept (p121) | `ea9556c` |
| CLP-03 | COPYBASE's set took sub-objects | whole objects (p127) | `ea9556c` |
| PST-01 | the paste's step unnamed, a menu Paste two steps | named across the read, one group | `fabd4ee` |
| PST-02, PST-04 | Enter silent; 2023 citations | refused (then reworded by CFD-03) | `fabd4ee` |
| PST-03 | a command typed during the read replaced | the read dropped | `fabd4ee` |
| PST-05 | `Nothing on the clipboard.` invented | nothing written; a typed one still a step (d07) | `5b299b4` |
| FSV-01 | QSAVE and SAVEAS no step | `QSAVE Regenerating model.` (p204, p205) | `39bfb53` |
| FSV-02, FSV-04 | SAVE an alias of QSAVE; stale coverage | a command of its own (p202, p214) | `39bfb53` |
| FSV-03 | OPENURL, SAVEURL missing | aliases, es ABREURL, GUARDARURL | `39bfb53` |
| CKY-01 | Ctrl+C, X, Shift+C, V acted inside the command | `^C^C` macros, `COPYCLIP GROUP` (d05 confirmed) | `6e6976a` |
| CKY-02 | Ctrl+A silent, no step, Off layers left out | `_ai_selall`, `AI_SELALL GROUP`, ALL's set | `6e6976a` |
| CFD-01 | the pasted set left selected | none selected, the set Previous (d01, d04) | `5b299b4` |
| CFD-02 | a paste in a turned UCS kept the WCS's turn | laid in the UCS as INSERT's block (d02) | `5b299b4` |
| CFD-03 | the point refused a Z, `Invalid 2D point.` | a Z taken, `Point or option keyword required.` (d02) | `5b299b4` |
| CFD-04 | the QAT's and application menu's file buttons ran the command | `^C^C` macros, `_qnew`… `_QSave`, groups (d08) | `5b299b4` |
| CFD-05 | the ghost in the rubber band's colour | the objects as they land (d04-3) | `5b299b4` |
| CFD-06 | the menu's Clipboard entries' U names lacked the key | `PasteCtrl+V GROUP`, es `CopiarCtrl+C GRUPO` (d05, e01) | `5b299b4` |
| CFD-07 | Ctrl+A's message on a line of its own | `_ai_selall Selecting objects...done.` (d06) | `5b299b4` |

Decisions added in the execution:

- **FSV, CKY:** a save the host cannot make (no file port) makes no step, so Ctrl+S then leaves
  `GROUP QSAVE`; Ctrl+Shift+X (CUTBASE) and Ctrl+Shift+A (PICKSTYLE) are left to the browser as
  Ctrl+Shift+V is; ALL and Ctrl+A share `allObjects`.
- **CFD:** the paste is planned once as it starts, so the ghost wears the layers it brings and the
  commit moves that very plan; Arabic, with no command catalog of its own, names the menu's keys as
  English does. English Cut, Copy and Copy with Base Point's U names follow d05's and e01's pattern
  (unprobed in English).

## Still open

What stays **Missing** is in `docs/coverage/clipboard-and-files.md`: PASTECLIP's hidden INSERT
keywords (Scale, PScale, Rotate, PRotate, Basepoint, Explode, REpeat), foreign text pasted as MTEXT,
PASTEBLOCK, CUTBASE, PASTEORIG, templates and file tabs (a completed NEW or QNEW opens a tab of its
own in 2027; here one undo step brings the drawing back), File System Access handles.

## Template improvements

Applied on 2026-10-29 after the console blocks: the console's clipboard, a Lisp stub
(annex-probes.md §2); a run that awaits a port (template §4.1).

Applied after the desktop block, 2026-10-29: the console's paste is text's, its refusals and
selection no evidence (annex-probes.md §2); DYNMODE under COM's SendCommand, typing `-1`, a menu
entry's key in U's name (annex-probes.md §4).
