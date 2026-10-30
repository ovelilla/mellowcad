# MOVE, COPY review

> **Status:** done, 2026-10-22 — reviewed and executed in one session with skill `command-review`,
> the ninth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show ecdd8c9:docs/plans/move-review.md`.

## Summary

3 high, 10 medium and 10 low findings over five blocks, all executed. The highs: U after a command
that changed nothing — ID, an ERASE or MOVE of an empty set, a MOVE by nothing — took back the
command before it, where AutoCAD 2027 takes back the empty run and names it (STP-01, in LINE's undo
area); COPY, Enter, Enter, the in-place copy, did nothing, where AutoCAD leaves a duplicate on top
(PLC-05); and Enter at COPY's first second point copied and kept asking, where AutoCAD ends COPY
(CPY-01). Placement, the area this review owns, now answers as AutoCAD: `Specify displacement` is a
point prompt from the UCS origin (number, `@`, snaps, a pick, `<a`, LASTPOINT there), MOVE's second
point is LASTPOINT however given, the set is placed in drawing order, and it drags drawn as itself
along an amber dashed line, MOVE's originals faded. A selection dragged with no command drops the
set and is U's `DROPGEOM GROUP`. The contract with ERASE's areas held: every variant leaves nothing
selected, and Previous after COPY is the originals. Evidence: about 190 console probes in es-ES and
en-US and a desktop pass in the owner's Spanish profile (d01–d11).

## Probes

Console inputs are `scripts/research/probes/move/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh move <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` and `drag.ps1` (ERASE's, with Ctrl and the right button) in the same
folder. Transcripts and screenshots are in `research/probes/move/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p07 | ACADVER; `(ssget "_I")` after COPY's variants; Previous after COPY and MOVE; COPY's Undo to none then Enter; U after ID and an empty ERASE |
| p100–p149 | names and aliases; the base point and `Specify displacement`: every answer, point form, snap, UCS, transparency; a zero Displacement and U |
| p150–p199 | the second points: Enter, refusals, keywords, every point form, LASTPOINT, snaps, Ortho, transparency, COPY's Undo, U/REDO/MREDO, a zero placement, Spanish `H` and `S` |
| p200–p242 | what they produce: handles, order, properties, Z, UCS, blocks, text, hatch, dimension, splines; U's echoes; settings mid-command; a zero COPY; Enter ending COPY; U after commands that change nothing (p235–p240); ELEVATION at the Displacement (p241); STRETCH's LASTPOINT (p242) |
| d01–d11 | the drag of MOVE and COPY, Escape halfway, Ortho and Polar, the right button and its menus, a selection dragged with the left button, Ctrl and the right button |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| STP-01 | U after a command that changed nothing took back the one before | every run is a step U names, but a view left alone and UNDO, MREDO | `289afa8` |
| PLC-01 | a number at `Specify displacement` refused | from the UCS origin towards the cursor | `877b4d4` |
| PLC-02 | LASTPOINT not the origin at `Specify displacement` | set there as it opens; `@` reads from it | `877b4d4` |
| PLC-03 | no snap, no pick at `Specify displacement` | a point prompt | `877b4d4` |
| PLC-04 | `<a` refused there | `Angle Override:` | `877b4d4` |
| PLC-05 | a placement by nothing skipped | COPY duplicates in place; MOVE's run is STP-01's step | `877b4d4` |
| PLC-06 | a blue dashed ghost | the set as itself, amber rubber band, MOVE's originals faded | `877b4d4` |
| PLC-07 | the tooltip's relative point echoed without `@` | echoed with it | `877b4d4` |
| PLC-08 | the rule's partial hook list | a pointer to the JSDoc | `877b4d4` |
| PLC-09 | 2023 and missing citations | 2027 probes cited | `877b4d4` |
| PLC-10 | paths holding untested | under test | `877b4d4` |
| MOV-01 | `D`† | verified | `4368a3c` |
| MOV-02 | LASTPOINT after a number at MOVE's second point | the destination (STRETCH's too) | `4368a3c` |
| MOV-03 | STRETCH's ellipse clauses in MOVE's entry | moved | `4368a3c` |
| CPY-01 | Enter at COPY's first second point kept asking | copies by the base and ends | `80fe49d` |
| CPY-02 | the last copy's Undo silent | `Command has been completely undone.` | `80fe49d` |
| CPY-03 | copies in selection order | drawing order | `80fe49d` |
| CPY-04 | `Invalid point.` at COPY's first second point | Array's keyword refusal while Array is missing | `80fe49d` |
| CPY-05 | `CP`, `DUP`† | verified | `4368a3c` |
| DRG-01 | a dragged selection stayed selected | dropped | `06614fa` |
| DRG-02 | its U named nothing | `DROPGEOM GROUP` | `06614fa` |
| DRG-03 | dashed, blue, with grips | as itself, originals faded | `06614fa` |
| DRG-04 | the drag not in the coverage | recorded | `06614fa` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- the rubber band at `Specify displacement`, and a number after `<a` there (the console ignores it);
- a copy by a Ctrl drag; a dragged selection let go where it started, and Escape during it; a
  distance typed while dragging (no tooltip shows, d08-1);
- NAVVCUBE's U putting its setting back (p238), and whether commands no tool runs (LAYER,
  PROPERTIES, QSAVE) leave a step when they change nothing;
- the echo `@` of the tooltip at prompts other than COPY's second point (inferred, DYNPICOORDS).

Analogues for the reviews that follow: STRETCH's look, its zero displacement and its LASTPOINT
follow MOVE's until the Transforms review probes them (MOVE-D3, D6); ROTATE's, SCALE's and MIRROR's
copies go in drawing order (CPY-03); U after any command's empty run names it (STP-01, `p07`).

## Template improvements

Applied on 2026-10-22 at the review's close (matrix.md F and H, template §4.8 and §9,
`annex-probes.md` §4): U after a run that changed nothing; the order of what a set out of order
makes; a case every prompt meets given to one subagent; function keys sent as keys reach the
ribbon's key tips; the harness's grips under a short line's end; Ctrl and the right button in
`drag.ps1`.
