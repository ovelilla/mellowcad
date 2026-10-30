# View review (ZOOM, PAN, -PAN, PLAN, VPOINT, -VPOINT, VIEW, -VIEW, 3DORBIT, NAVVCUBE)

> **Status:** done, 2026-10-27. Phases 0–4 and three console blocks in one session with skill
> `command-review`, the desktop block (VWD) in a second with the owner's mouse; the twenty-second
> review of `docs/coverage/roadmap.md`'s order.
>
> It owns **the view and its undo**: which view runs and navigation gestures are undo steps and
> what U names them, how consecutive ZOOMs, PANs and wheel steps join, `Regenerating model.` on U
> and REDO, ZOOM Previous's list, and a view change made inside another command. Inquiry left
> nothing for it.
>
> The full plan is in git: `git show bc1d280:docs/plans/view-review.md`. It holds the inventory,
> the matrices, the findings, decisions VIEW-D1 to D67, the refuted suspicions, and coverage and
> rules ↔ code.

## Summary

There were 0 critical, 2 high, 27 medium and 17 low findings, all executed in four commits.

The worst:

- **The wheel and the wheel button left no undo step, so U after scrolling took back the command
  before it.** AutoCAD 2027 makes every navigation gesture a named step — `INTELLIZOOM`,
  `INTELLIPAN`, `'.VIEWCUBEACTION`, `'ZOOM GROUP` — joined with the ZOOMs and PANs round it, and an
  entry of the running command inside one (VWD-01, VWD-09, VWD-13).
- **A wheel notch zoomed 1.1×; AutoCAD's zooms 1.5978×** (VWD-02).
- **A view command that changed nothing made no step, and LINE's Undo left a transparent `'ZOOM`**
  (VUN-01, VUN-04).
- **`Regenerating model.` was said too often**, after every Extents and on U of every turning view
  (ZOM-06, VUN-02, VUN-03).

**Evidence:**

- 210 console probes in es-ES and en-US (p100–p169, p200–p269, p300–p369) on AutoCAD 2027
  (ACADVER 26.0, X.118); the `acadres` tables of 2026-10-20; `acad.cuix`'s macros; each language's
  `acad.pgp`.
- A desktop pass: d01–d09 (en-US) and e01 (es-ES).

## Probes

Console inputs are `scripts/research/probes/view/<id>.txt` (`.plain` untraced, `.es` / `.en` one
locale), run with `scripts/research/probe.sh view <ids>`; the desktop pass is
`scripts/research/probes/view/d01-e01.sh` (`lib-dsk-en.sh`, `drag.ps1` for the wheel button,
`burst.ps1` for timed wheel notches). Transcripts and screenshots are in `research/probes/view/`
(gitignored).

| Id | What it asks |
| --- | --- |
| p100–p169 | ZOOM: names, every first-prompt answer, Window's corners and their point forms, Scale, Object, Center, Previous's depth, the regeneration pattern, transparency |
| p200–p269 | PAN and -PAN, PLAN, -VPOINT and Rotate, NAVVCUBE: names and aliases, refusals, point forms, UCS cases, LASTPOINT, the preselection |
| p300–p335 | -VIEW: the trace, each preset and its UCS, the named-view options, transparency, the names |
| p336–p369 | the view's undo: U, REDO, MREDO, UNDO n and Combine after each view command, joined runs, LINE's Undo after `'ZOOM` |
| d01, d02 | the wheel (factor, bursts, undo) and the wheel button (pan, click, double-click, Shift orbit) |
| d03, d04 | real-time PAN and 3DORBIT: menus, Escape, undo, joining; `'3DORBIT` at LINE |
| d05 | the ViewCube: parts, roll, Home, compass, fit, undo, inside LINE, drag, menu, UCSORTHO |
| d06, d07 | the viewport controls' list and echo; the navigation bar's Zoom list, In, Pan, their undo |
| d08, d09 | ZOOM's window band; -PAN's band; -VPOINT's Escape in a turned UCS; VPOINT's dialog |
| e01 | the Spanish profile: U's names, the cube, the viewport list, the navigation bar's words |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| ZOM-01 | a transparent ZOOM Object framed | refused, `** Requires a regen, cannot be transparent.` | `72d08ef` |
| ZOM-02 | a window of no size asked again | `*Invalid*` and the end; no width or no height framed by the other | `72d08ef` |
| ZOM-03 | `0` and negative factors refused in other words | `Value must be positive and nonzero.`, at Scale too | `72d08ef` |
| ZOM-04 | `2XP` refused | `2X` in model space | `72d08ef` |
| ZOM-05 | `2` moved the view to the drawing's middle | the view's centre kept | `72d08ef` |
| ZOM-06 | `Regenerating model.` after every Extents and All | only with nothing drawn | `72d08ef` |
| ZOM-07 | Object's preselection uncounted | through `preselect`, `1 found` | `72d08ef` |
| ZOM-08 | Previous kept 10 views | 20 | `72d08ef` |
| ZOM-09 | a 40 px margin | 3 px a side (`EXTENTS_MARGIN_PX`) | `72d08ef` |
| ZOM-10, ZOM-11 | Missing incomplete; tests citing 2023 | Left, Vmax, Center in Missing; 2027 probes cited | `72d08ef` |
| VUN-01 | a view run changing nothing made no step | every run a step | `9aab9b5` |
| VUN-02, VUN-03 | U regenerated after any -VIEW, PLAN or Extents | only when the line of sight turned (`turns()`) | `9aab9b5` |
| VUN-04 | LINE's Undo left a transparent `'ZOOM` | an entry of the running group | `9aab9b5` |
| VUN-05, VUN-06 | UNDO n inside a joined pair; `*TOP*` after U | Missing | `9aab9b5` |
| PAN-01, VDR-04, VDR-20 | acad.pgp's aliases missing | added in both languages | `fe99ede` |
| VDR-01 | `0,0,0` refused at -VPOINT | the WCS plan, fitted | `fe99ede` |
| VDR-02 | PLAN's Spanish not-found words | `planUcsNotFound` | `fe99ede` |
| VDR-03 | -VPOINT's direction in the UCS, no switch notices | the WCS's, with the notices | `fe99ede` |
| VDR-05, VDR-23, VDR-24 | NAVVCUBEDISPLAY's value; -VIEW's named views; LIMITS framing | coverage and Missing | `fe99ede` |
| VDR-21 | 3DORBIT said nothing as it started | its exit words | `fe99ede` |
| VWD-01, VWD-03 | the wheel and the wheel button no step; a 400 ms burst | `INTELLIZOOM` and `INTELLIPAN` steps, joined; a burst under a second | `223115d` |
| VWD-02 | 1.1× a notch | 1.5978× per 100 px of `deltaY`, lines and pages converted | `223115d` |
| VWD-04, VWD-05 | the wheel button's double-click and Shift orbit silent, no step | `'_.zoom _e` (`'.ZOOM`); ` Regenerating model.` and `GROUP menu item` | `223115d` |
| VWD-06 | PAN never joined | joined with ZOOMs and PANs | `223115d` |
| VWD-07, VWD-08 (VDR-25) | 3DORBIT silent at its end; `'3DORBIT` refused | regenerates always; transparent, no `>>` | `223115d` |
| VWD-09 to VWD-11 | the ViewCube no step, a tight fit, the compass keeping the elevation | `'.VIEWCUBEACTION`, transparent in a command; the extents' sphere; level views | `223115d` |
| VWD-12 (VDR-22) | the viewport control ran `-VIEW` typed and ended the command | `'_-view _swiso`, U `'-VIEW`; inert while a command runs | `223115d` |
| VWD-13 | the bar's Extents, Previous, In, Out acted at once | their macros, `'ZOOM GROUP`, In ×2, Out ×0.5 | `223115d` |
| VWD-14 | -VPOINT's Escape silent in a turned UCS | `*** Returning to the UCS ***` | `223115d` |
| VWD-15, VWD-16 | ZOOM's and -PAN's bands; the Spanish Zoom list | solid white, dashed amber; Extensión, Previo, Acercar, Alejar | `223115d` |
| VWD-17, VWD-18 | the cube's drag landed on a view; coverage gaps | no landing; the coverage settled by d03–d07 | `223115d` |

Decisions added or changed in the execution:

- **VWD-01:** a gesture made inside a command that changes the view itself (PAN, ZOOM, 3DORBIT,
  -VIEW) stays in that command's step, which already takes the view back.
- **VWD-05:** the Shift orbit inside a command says ` Regenerating model.` only; whether AutoCAD
  also writes `Resuming LINE command.` there, as after the ViewCube, is not probed.
- The wheel button let go no longer starts PAN or 3DORBIT again (their words were written twice);
  the tool's cursor is put back instead.

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/view.md` and
`docs/coverage/workspace.md`. Worth a later probe:

- whether a twist alone (PLAN in a turned view) regenerates on U;
- the Shift orbit's words inside a command, and a ViewCube drag's own undo step (VIEW-D64);
- the ViewCube's landing after a drag, if ViewCube Settings is ever built.

Built here only in part: ZOOM's Realtime, Dynamic, Center, Left and Vmax; the real-time menus of
PAN and 3DORBIT; perspective; named views and the View Manager; VPOINT's dialog and tripod; LIMITS.

**Analogues for the reviews that follow** (roadmap): the UCS review takes UCS Restore's
not-found words (`ucsUndefined`, VIEW-D23) and the `*TOP*` name after U (VUN-06); the Workspace
review checks the other toolbar and menu buttons for AutoCAD's `<command> GROUP` undo names.

## Template improvements

Applied on 2026-10-27 after the console blocks (matrix.md A, annex-probes.md §1, §2): the installed
`acad.pgp` of each language as row A's source; a probe that hangs keeps its id; a hanging command
last in its own probe; nothing read with `ssget` between U and REDO.

Applied after the desktop block, the same day:

- matrix.md F: a gesture that runs no command (the wheel, the wheel button, the ViewCube, a
  toolbar's button) is a row of its own — 2027 makes each a named undo step.
- annex-probes.md §4: U's echo read with `com hist` before any `com eval`; the wheel turned towards
  the user with `-count -1`; timed wheel notches from one process (`burst.ps1`).
