# ERASE review

> **Status:** done, 2026-10-21 — reviewed and executed in one session with skill `command-review`,
> the eighth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show ddda433:docs/plans/erase-review.md`.

## Summary

3 high, 16 medium and 14 low findings over four blocks, all executed but ERA-06 (PURGE's words, to
the Blocks review). The highs: the set a command was given stayed selected when it ended or was
cancelled, so the next command took it as its preselection — MOVE then ERASE erased what was just
moved (SEL-43, PRE-01); and a press and drag on nothing drew a rectangle where AutoCAD 2027 draws a
lasso (PRE-02). The areas this review owns now answer as AutoCAD 2027: `Select objects:` says what a
command refuses under each count (EXPLODE's line, the analogue SPLINE left, SOB-11), filters a
preselection the same way, takes whole objects where AutoCAD does, and drops the set at a command's
end; the mouse selects with AutoCAD's lasso, previews what a window would take and shows the minus
badge where AutoCAD does; selection cycling's list ends with None. ERASE itself says nothing at its
end, takes DELETE, runs from the Delete key as acad.cuix's macro and fades what it will erase.
Evidence: about 165 console probes in es-ES and en-US and a desktop pass in the owner's Spanish
profile (d01–d14), with a drag tool of the review's own.

## Probes

Console inputs are `scripts/research/probes/erase/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh erase <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` and `drag.ps1` in the same folder. Transcripts and screenshots are in
`research/probes/erase/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p04 | ACADVER; ERASE's end; a preselection then ERASE, MOVE, EXPLODE; OOPS and U; `'ERASE` |
| p100–p164 | the modes typed at `Select objects:`, their prompts, refusals, counts, `@` and numbers, `_END`, `'ZOOM`, `'ORTHOMODE`; Spanish capitals; MIRROR's `S` |
| p200–p264 | typed points at `Select objects:`, Enter, transparency, `_U`, locked and off layers; the commands' filters; preselection for every set command; Previous after each command and U; `(ssget "_I")` after each command; the refusal lists |
| p300–p331 | ERASE's names and aliases, repeat, U, REDO, MREDO, OOPS, every type erased, locked objects, `-PURGE` and EXPLODE's reports |
| d01–d14 | with no command: hover, pick, clicked windows, the lasso and Space, Fence from the implied window, Shift, Escape; at ERASE's prompt: the cursor, the fade, a lasso, Shift+pick, the right button; Escape after a pick; the Delete key and a preselection's echo; selection cycling; the minus badge |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| ERA-01 | ERASE said `n objects erased.` | silent, as AutoCAD | `3c72260` |
| ERA-02 | no `DELETE` alias | added, en and es | `3c72260` |
| ERA-03 | the Delete key erased outside ERASE | runs ERASE as acad.cuix's `^C^C_erase;` | `3c72260`, `b6785d8` |
| ERA-04 | Backspace erased, no `WHY` | a Mac's Delete key; noted | `3c72260` |
| ERA-05 | EXPLODE's empty set silent | merged into SEL-42 | `75a35df` |
| ERA-06 | PURGE's report words | to the Blocks review | — |
| ERA-07 | stale knowledge | settled | `3c72260` |
| ERA-08 | tests asserting ERA-01, no probes | re-cited | `3c72260` |
| ERA-09 | ERASE's set glowed | faded, as AutoCAD's preview | `3c72260` |
| SEL-01 | `@` at a mode's first point refused | from LASTPOINT | `6d1e433` |
| SEL-03 | Previous back after U of ERASE (SEL-50 merged) | erased objects leave it for good | `6d1e433` |
| SEL-04 | Undo at `Remove objects:` stayed there | back to `Select objects:` | `6d1e433` |
| SEL-05 | a whole-object set's `S` was SIngle | taken, does nothing | `6d1e433` |
| SEL-06 | EXPLODE's set took sub-objects | merged into SEL-44 | `75a35df` |
| SEL-07 | coverage: CLass, SUbobject/Object | settled | `6d1e433` |
| SEL-08 | es clarify prompt after `_S` | the global words | `6d1e433` |
| SEL-40 | EXPLODE's refusal said once, after the set | under each count (`refuse`) | `75a35df` |
| SEL-41 | a refused preselection ended EXPLODE | asks again, closes at the first addition (`preselect`) | `75a35df` |
| SEL-42 | EXPLODE's empty set silent | `None found.` | `75a35df` |
| SEL-43 | the set stayed selected after a command | dropped at its end or Escape | `6d1e433` |
| SEL-44 | six sets took sub-objects | whole objects | `75a35df` |
| SEL-45 | DIMSPACE's filter silent | `0 found`, any dimension found | `75a35df` |
| SEL-46 | HATCH's set left open lines out silently | found, left out when tracing | `75a35df` |
| SEL-47 | "filter the pick" rule wrong | rewritten | `75a35df` |
| SEL-48 | the locked line at `Remove objects:` | silent there | `75a35df` |
| SEL-49 | no Previous after EXPLODE | its pieces | `6d1e433` |
| SEL-51 | DIMSPACE's base refused a typed point | picks there | `75a35df` |
| SEL-52 | PICKFIRST and the locked pick not in Missing | recorded | `75a35df` |
| PRE-01 | Escape at `Select objects:` kept the picks selected | dropped (with SEL-43) | `6d1e433` |
| PRE-02 | a drag was a rectangle | AutoCAD's lasso, Space cycling it | `b6785d8` |
| PRE-03 | no preview of what a window takes | the hover's glow | `b6785d8` |
| PRE-04 | the window's outline blue or green | white | `b6785d8` |
| PRE-05 | the minus badge from Shift alone | over a selected object, no command | `b6785d8` |
| PRE-06 | a preselection's count always on the echo's line | own line after a full name | `b6785d8` |
| CYC-01 | the Selection list lacked None | added | `84503ff` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- whether a cancelled noun-verb command keeps its preselection (dropped here, D22); COPYBASE's set
  and what it leaves selected; MATCHPROP's destination set;
- which candidate a click takes after Shift+Space, and whether the list opens again (the click
  tool's jiggle restarts the stack); Shift+Space or Space held during a lasso;
- where a repeated command (Enter) puts a preselection's count; whether AutoCAD's window preview
  skips locked objects; Backspace in AutoCAD;
- PURGE's report words (`Deleting block "B1".`, `1 block deleted.`, `No unreferenced blocks found.`,
  p326, p327, p330), for the Blocks review.

Analogues for the reviews that follow: MOVE and COPY's `Select objects:` and their preselection now
go through `ObjectSelector.preselect` and drop the set at the end — their review checks only its
placement; a command whose set AutoCAD keeps or selects afterwards says `keepsSelection()` (probe
`(ssget "_I")` after each command, p249–p264); a filter AutoCAD says inside `Select objects:` is a
`refuse`, never a silent `accept`.

## Template improvements

Applied on 2026-10-21 at the review's close (template §4.1, §9; `annex-probes.md` §4): what a
command leaves selected, read with `(ssget "_I")`; the drag tool and the held key; the click tool's
jiggle against selection cycling.
