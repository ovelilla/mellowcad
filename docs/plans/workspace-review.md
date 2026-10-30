# Workspace review (UNITS, AUPREC, SETVAR, CLEANSCREENON, CLEANSCREENOFF; the chrome)

> **Status:** done, 2026-10-29. Phases 0–4 and four console blocks (SVA, SVR, UNT, MAC) in one
> session with skill `command-review`, the desktop block (WSD) in a second with the owner's mouse;
> the twenty-fourth review of `docs/coverage/roadmap.md`'s order.
>
> It owns **system variables typed as commands** (SETVAR included). It took what the roadmap left
> it: TEXTSIZE, TEXTSTYLE, the DIMxxx variables, HPNAME / HPSCALE / HPANG / HPORIGIN, ATTDIA /
> ATTREQ / AFLAGS / ATTMODE / INSNAME, LWDISPLAY / LAYLOCKFADECTL / CECOLOR / CELTYPE / CELWEIGHT
> typed as variables; the rail's apostrophe macros; the toolbar and menu buttons' `<command> GROUP`
> undo names; the chrome menus' echo (UCD-07); every name prompt that may hold spaces (UCD-05).
>
> The full plan is in git: `git show c15d2ec:docs/plans/workspace-review.md`. It holds the
> inventory, the matrices, the findings, decisions WORKSPACE-D1 to D108, the refuted suspicions,
> and coverage and rules ↔ code.

## Summary

There were 0 critical, 1 high, 18 medium and 15 low findings, all executed in six commits.

The worst:

- **A system variable typed by name was `Unknown command`** but for AUPREC, `'AREA` and
  `'UCSICON`, and SETVAR did not exist (SVA-01, SVA-02, SVR-01); 2027 runs SETVAR for each, with a
  prompt and a refusal per data type, transparently anywhere, and every set is an undo step.
- **CLEANSCREENON / OFF, UNITS, Ctrl+1, Ctrl+S, Deselect All and the menu's Properties made no undo
  step**, so U after them took back the edit before (UNT-01, UNT-02, WSD-03).
- **A drafting toggle stayed after U**, where 2027 records it in the step before; F7, F4 and the
  status bar's buttons wrote nothing (WSD-01, WSD-02).
- **Every name prompt ended at a space** (WSD-05); Ctrl+0, 1, 9, S and O acted inside the running
  command, where their macros cancel it (MAC-01).

**Evidence:**

- About 130 console probes in es-ES and en-US (p100–p169, p200–p224, p300–p316, p400–p415) on
  AutoCAD 2027 (ACADVER 26.0, X.118); the tables of 2026-10-20; `acad.cuix`'s AcceleratorRoot,
  PopMenuRoot and RibbonRoot; each language's `acad.pgp`. The AUPREC code's 2023 citations were
  probed again.
- A desktop pass: d01–d08 (en-US) and e01 (es-ES); chromium's reserved accelerators for Ctrl+L.

## Probes

Console inputs are `scripts/research/probes/workspace/<id>.txt` (`.plain` untraced, `.es` / `.en`
one locale), run with `scripts/research/probe.sh workspace <ids>`; the desktop pass is
`scripts/research/probes/workspace/d01-e01.sh` (`lib-dsk.sh`). Transcripts and screenshots are in
`research/probes/workspace/` (gitignored).

| Id | What it asks |
| --- | --- |
| p100–p169 | SETVAR: names, prompts and refusals per type, `?`, transparency, nesting, undo, the default |
| p200–p224 | MPSYSVARS; each modelled variable typed, its values, refusals, storage and undo |
| p300–p316 | -UNITS, UNITS, DDUNITS, transparency and undo; CLEANSCREENON / OFF; `'_attdisp` |
| p400–p415 | names with a space (console); a variable at its own prompt, nested in 'ZOOM |
| d01, e01 | the status bar: echoes, U after a toggle, Clean Screen's steps, the Snap and Polar menus |
| d02 | the ribbon: U's name, Match Properties in LINE, the palettes typed with `'`, Move in a grip edit |
| d03, e01 | the shortcut menus' echoes and U names, the Undo label |
| d04 | Ctrl+0, 1, 9, S inside LINE and their U names |
| d05 | the Drawing Units dialog, Cancel, the application menu's Units |
| d06 | `AB CD` typed key by key at every name prompt |
| d07 | SETVAR's `?` page, Escape nested, dynamic input, the preselection |
| d08 | PolarSnap with POLARDIST 0, 10 and −10 |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| SVA-01, SVA-02 | SETVAR missing; a variable typed by name `Unknown command` | SETVAR (es MODIVAR, `SET`, `MV`) and every modelled variable by name, `'` too | `a66a1bf` |
| SVA-03 | one value prompt and refusal for every type | per data type, re-ask or `Cannot set` | `a66a1bf` |
| SVA-04 | no `?` listing | AutoCAD's format | `a66a1bf` |
| SVA-05 | a variable in a transparent command refused | nested, `Resuming SETVAR command.` | `a66a1bf` |
| SVA-06, SVR-05 | AUPREC's 2023 citations | 2027 probes; the Spanish period settled | `a66a1bf` |
| SVR-01 | the roster `Unknown command` | the drawing's and read-only variables; then the program's and session's | `a66a1bf`, `eba126d` |
| SVR-02 | POLARDIST started at 10 | 0, meaning Snap X spacing (d08 confirmed the stepping) | `eba126d` |
| SVR-03, SVR-04 | values that meant something else; settings not undone | handled per variable; one undo step whatever the storage | `eba126d` |
| UNT-01, UNT-02 | CLEANSCREEN and UNITS no step | named steps; Cancel one too (d05) | `542b047` |
| UNT-03, UNT-05 | DDUNITS; stale coverage | the alias; 2027's facts | `542b047` |
| UNT-04 | Units ran `_UNITS` | the status bar `'_units`; the application menu `^C^C_UNITS`, U `UNITS GROUP` (d05-4) | `542b047`, `8f6d768` |
| MAC-01 | the accelerators acted inside the command | `^C^C`, echoed as the macro (the case settled, d04) | `1415496` |
| MAC-02, MAC-04, MAC-05 | ATTDISP ended the command; Edit attributes ran ATTEDIT; Pan as typed | `'_attdisp`; EATTEDIT; `'_pan` | `1415496` |
| MAC-07, MAC-08 | three labels; coverage against acad.cuix | acad.cuix's | `1415496` |
| MAC-03 | Match Properties ended the command | `'_matchprop`, transparent (d02-1) | `75a6b62` |
| MAC-06 | menu entries echoed local names | `_erase 1 found`, `_properties`, `'_pan`; Deselect All `Everything has been deselected` | `8f6d768` |
| MAC-09 | Ctrl+L unbound | `^O` as F8; chromium does not reserve it | `75a6b62` |
| WSD-01 | U left a drafting toggle | joins the last step (`executeIntoLast`) | `8f6d768` |
| WSD-02 | F7, F4 and the status bar silent | ` <Grid on>`, ` <Selection Cycling on>`, the buttons as the keys | `8f6d768` |
| WSD-03 | chrome starts no step or another name | menu groups: `LINE GROUP`, `Erase GROUP`, `GROUP Properties`, `GROUP QSAVE` | `8f6d768` |
| WSD-04 | `'MATCHPROP`, `'PROPERTIES`, `'LAYER`, `'BLOCKSPALETTE` refused | transparent | `75a6b62` |
| WSD-05 | names ended at a space | `takesSpaces` a question's flag, on every name and string prompt | `75a6b62` |
| WSD-06, WSD-07 | SETVAR's `?` unpaged; its dynamic input empty | 20 per page, `Press ENTER to continue:`; the default as placeholder | `75a6b62` |
| WSD-08, WSD-09 | the dialog's label; the status bar's menus | `Units to scale inserted content:`; AutoCAD's order and eight increments | `75a6b62` |

Decisions added in the execution:

- **SVA, SVR:** AFLAGS 32 and POLARANG 0 refused with their WHY (p223, p224); NAVVCUBEDISPLAY
  keeps its bit 2 only and SNAPMODE 2 reads back 1 (Missing: a file-format change).
- **WSD:** a toggle inside a command joins the command's last entry, so a tool's Undo keyword takes
  back the object, not the toggle (unprobed); a toggle after U leaves the redo stack. The status
  bar's Clean Screen is one silent step, without AutoCAD's RIBBON and RIBBONCLOSE (not built). Ctrl+O
  is no group (the opened drawing starts its own history). SETVAR's name and word values are a
  `"word"` field: typed as text, still reading keywords and transparent commands. A string
  variable's placeholder is quoted as its default is (**unverified**).

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/workspace.md`,
`command-line.md` and `drafting-aids.md`. Worth a later probe: the Default menu's Undo and Redo
labels (`Undo Propertiesclose`, es `Deshacer Grupo de comandos`: the rule for a group's label);
Ctrl+9's confirmation dialog; the transparent prompt's head (`MATCHPROP >>` on the desktop,
`'MATCHPROP >>` here: every transparent command, `command-line.md`); Lineweight's button's echo; a
toggle inside a command and U; the Spanish dialog's Insertion scale label.

**Analogues for the reviews that follow** (roadmap): a chrome start is a menu group, so every
button a later review adds goes through `menuGroup`; a name prompt declares `takesSpaces`.

## Template improvements

Applied on 2026-10-28 after the console blocks: acad.cuix before the desktop (template §4.1); a
batched probe's numeric fallback, SETVAR's default untraced, `AllowSpaces` no evidence
(annex-probes.md §2).

Applied after the desktop block, 2026-10-29: AutoComplete at `Command:` on the desktop, U's names
read in a drawing of their own, a status-bar click after `com new` (annex-probes.md §4); Playwright's
keys never reach Chrome's accelerators, read chromium's reserved list (browser-verify).
