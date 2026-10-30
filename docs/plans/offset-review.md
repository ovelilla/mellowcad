# OFFSET review

> **Status:** done, 2026-10-22 — reviewed and executed in one session with skill `command-review`,
> the eleventh review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show 61d320e:docs/plans/offset-review.md`.

## Summary

7 high, 19 medium and 10 low findings over four blocks, all executed. The highs: every point typed
at the side and through prompts was refused, where AutoCAD takes `x,y`, `@` from the object's pick,
polar, a number and the object snaps (OFP-02: p253–p276); one object selected before OFFSET was
asked for again, where AutoCAD goes to its side (OFS-05: p165, p251, p290); a polyline's offset kept
segments that vanished, never split, made nothing when a rounded corner collapsed, jumped where
segments no longer met, and judged its side against arcs' chords (OFG-01 to OFG-05: p183, p187,
p188, p226, p230). A polyline's offset is now `cad/domain/polylineOffset.ts`, OFFSETGAPTYPE 0's
clean-up matched vertex by vertex. The analogues Transforms left held: a two-point distance keeps
its first point across `'ZOOM` and draws the runtime's amber line (REF-09, JIG-03: p01, d01-2); U
after an empty run names it (STP-01: p02, p03); the pieces of one offset go in the source's order
(CPY-03's analogue, OFG-03: p188). Evidence: about 200 console probes in es-ES and en-US and a
desktop pass in the owner's Spanish profile (d01–d06).

## Probes

Console inputs are `scripts/research/probes/offset/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh offset <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh`. Transcripts and screenshots are in `research/probes/offset/`
(gitignored).

| Id | What it asks |
| --- | --- |
| p00–p05 | the version; the analogues: `'ZOOM` at the measure's second point, U after an empty run, Enter at the second point, OFFSETDIST in a blank drawing, the owner's profile and acadiso.dwt |
| p100–p169 | the command line: names, repeat, keywords, Enter, refusals at every prompt; the two-point distance; OFFSETDIST; transparency; the Undo keyword at each depth; U, REDO, UNDO 2, MREDO; preselection; what is left selected |
| p170–p239 | what it produces: every type, polylines straight and with arcs, splits, collapses, widths; Through per type; Multiple with Erase and Layer; properties and thickness; tilted, edge-on and isometric planes |
| p240–p298 | the picks and points: typed picks, misses, modes, a locked layer; every point form at the side and through points, on the object, at a circle's centre and rim; object snaps; Ortho; an override left pending |
| d01–d06 | the distance by two points with the mouse; the rollover, the ghost and the boxes; Through and Multiple; a circle's and a U's ghosts; the right button; Ortho and Polar at the through point; Escape and U |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| OFP-01 | a typed point at the object prompt refused | a pick there, a miss asked again | `4514959` |
| OFP-02 | typed points at the side and through prompts refused | point prompts, every form | `4514959` |
| OFP-03 | the object's pick left LASTPOINT | there, hit or miss | `4514959` |
| OFP-05 | a locked object passed over in silence | `The object is on a locked layer.` | `4514959` |
| OFP-06 | a through point on the object waited or stacked a circle | `Invalid through point.`, `Cannot offset that object.` | `4514959` |
| OFP-07 | no snaps at the side point, `_PER` found nothing | snapped, Perpendicular from the pick | `4514959` |
| OFP-08 | an override outlived its command | cleared at Enter and at the end | `4514959` |
| OFP-09 | `Expects a point or Exit/Undo` | `… or Exit` | `4514959` |
| OFS-01 | 0 and negatives refused in silence | `Value must be positive and nonzero.` | `7ef5b28` |
| OFS-02 | a measure of zero dropped its first point | the second asked again | `7ef5b28` |
| OFS-03 | Undo with nothing said nothing | table 22415's words | `7ef5b28` |
| OFS-04 | Undo stayed at the side or through prompt | the object asked | `7ef5b28` |
| OFS-05 | one preselected object asked again | offset once the distance is given | `7ef5b28` |
| OFS-06 | `M` again in Multiple refused | taken in silence | `7ef5b28` |
| OFS-07 | es `PUN`, `PUNTO` are Node on 2027 | Missing (Node) | `7ef5b28` |
| OFS-08 | `1E20`'s default written in full | Missing (units) | `7ef5b28` |
| OFS-09 | `DF`†, `EQ`†, uncited tests | verified, cited | `7ef5b28` |
| OFG-01 to OFG-06, OFG-13 | polyline collapses, reversals, splits, gaps, chords, zero-length and two-vertex segments | `polylineOffset.ts` | `e12ce3e` |
| OFG-07, OFG-08 | collapses and text, blocks, dimensions, hatches taken in silence | `Cannot offset that object.` | `e12ce3e` |
| OFG-09 | objects tilted to the UCS refused | offset in their plane; edge-on refused | `e12ce3e` |
| OFG-10, OFG-11 | Through past a polyline's end, outside an arc | AutoCAD's measures and refusal | `e12ce3e` |
| OFG-12 | a circle's or arc's copy kept its thickness | none | `e12ce3e` |
| OFG-14 | Erase in Multiple erased at the first copy | on leaving the object | `e12ce3e` |
| OFG-15 | `acc/w9` | p185, p186 | `e12ce3e` |
| OFJ-01 | a grey ghost | the copies as the object | `c819719` |
| OFJ-02 | no X and Y at the side and through points | with OFP-02 | `4514959` |
| OFJ-03 | Snap Overrides in the menu at the object prompt | only where a point is asked | `c819719` |
| OFJ-04 | the rule's offset hover in `THEME.selected` | a set's rollover (d01-4) | `c819719` |

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/modify.md`'s OFFSET entry; the points
worth a later probe:

- the desktop's new drawing reads OFFSETDIST 1 (`<1.0000>`), where the help and the console, isolated,
  with the owner's profile and with acadiso.dwt, read −1 (p05, d01-1);
- which piece Multiple steps on from after a split; Escape and Undo with Erase in Multiple; a line out
  of the UCS's XY plane; an open polyline pinched apart; a preselected object on a locked layer;
- running snaps on a clicked side point; the English menus' labels.

Found while executing, in the Transforms review's area: `entities.test.ts`' property "mirroring twice
across the same line is the identity" fails for a text at 270° mirrored across a 45° line (fast-check
seed −1888588680: the first mirror reads 180°, the second comes back at 90°, MIRRTEXT 0's readable
flip); whether AutoCAD's two mirrors return the text is unprobed. It passed on the next run.

Analogues for the reviews that follow: TRIM's and EXTEND's, FILLET's and BREAK's object picks take a
typed point and set LASTPOINT (OFP-01, OFP-03); a single-object prompt offers no Snap Overrides
(OFJ-03); a command's own ghost is the object as itself (OFJ-01); a collapsing or degenerate result
is said, not waited on (OFG-07, OFP-06).

## Template improvements

Applied on 2026-10-22 at the review's close (`annex-probes.md` §4, template §4.8): a desktop
variable read before trusting a default; each desktop Enter planned against the prompt it lands on;
preselection and the existing tests given to one subagent by name.
