# Sweeps review (EXTRUDE, REVOLVE, PRESSPULL)

> **Status:** done, 2026-11-04, in two groups: four console blocks (EXT, RVL, PPL, SWO), then a
> desktop session with the owner's mouse (d01–d09) and its block (SWD), one commit each. What is
> left is in the coverage entries' **Missing:** (`docs/coverage/draw.md` EXTRUDE, REVOLVE,
> PRESSPULL, BOX for the solid object's isolines).
>
> The full plan is in git: `git show 3f247229:docs/plans/sweeps-review.md`. It holds the
> inventory, the probes' index, the matrix of every block, each finding with its evidence, the
> decisions SWEEPS-D1 to SWEEPS-D101 and what was refuted.
>
> It owns the profiles a sweep takes (their kinds, sift and base), the swept solid (its faces,
> history, LIST, palette rows, transforms, EXPLODE, file), a partial turn's and a spline surface's
> isolines (closing the Regions review's RGD-02) and PRESSPULL's bounded areas. It cites the LINE
> review (object snaps, point input, the command line, undo, transparency, dynamic input), ERASE's
> (`Select objects:`, preselection), Workspace's (the rail's macros), the 3D primitives review (the
> solid object, its LASTPOINT rule), the Regions review (the booleans, a composite's grip), View's
> (`'ZOOM` that needs a regen), LIST's (review 32) and MASSPROP's (review 30).

## Summary

**Findings:** 0 critical, 5 high, 21 medium, 21 low, all executed or recorded in Missing.

| Block | What                                               | Critical | High | Medium | Low |
| ----- | -------------------------------------------------- | -------- | ---- | ------ | --- |
| EXT   | EXTRUDE                                            | 0        | 1    | 5      | 4   |
| RVL   | REVOLVE                                            | 0        | 3    | 5      | 3   |
| SLP   | LASTPOINT in the three                             | 0        | 0    | 2      | 1   |
| PPL   | PRESSPULL, its console cells                       | 0        | 0    | 2      | 4   |
| SWO   | the swept solid as an object                       | 0        | 1    | 5      | 4   |
| SWD   | the desktop: isolines, palette, PRESSPULL's clicks | 0        | 0    | 2      | 5   |

The worst:

- **EXTRUDE measured a picked height from the wrong point**: AutoCAD's base is the mean of 20
  points round a polyline by arc length, of 19 round a spline by parameter, a region's centroid
  (EXT-01; p101–p107, confirmed on the desktop, d05).
- **REVOLVE's Object axis and X/Y/Z, and a click at its angle**: the chord from the end nearer the
  pick, the UCS's axes, and the plan angle from the base (RVL-03, RVL-04, RVL-07; d06).
- **EXTRUDE tapered every run after a tapered one** (SWO-01).

**Evidence:** 176 console probes in es-ES and en-US (pt-BR where its words are asked),
`sweeps/p100–p169`, `p200–p267`, `p300–p336`, `p400`, `p401`, the earlier `extrude/*`,
`revolve/*`, `presspull/p01`, and desktop d01–d09 (es-ES; English labels from `ax26res.dll`); on
AutoCAD 2027 (ACADVER 26.0, X.118.0.0). The inputs are in `scripts/research/probes/sweeps/`, the
transcripts and screenshots in `research/probes/sweeps/` (gitignored).

## Index

| Id     | What it was                                                                          | Commit   |
| ------ | ------------------------------------------------------------------------------------ | -------- |
| EXT-01 | a picked height measured from the middle of the profile's box                        | c3f7a43b |
| EXT-02 | after Expression refused a value the next answer was swallowed                       | c3f7a43b |
| EXT-03 | Enter at `Enter expression:` refused; AutoCAD ends EXTRUDE                           | c3f7a43b |
| EXT-04 | a self-intersecting profile said at the extrusion, not sifted with the set           | c3f7a43b |
| EXT-05 | Direction's prompts refused in a keyword prompt's words                              | c3f7a43b |
| EXT-06 | a negative height listed negative                                                    | c3f7a43b |
| EXT-07 | the height and taper defaults reset with a new drawing                               | c3f7a43b |
| EXT-08 | a point given for the taper: atan(Y / d) from the profile's start (d05)              | 494c8d66 |
| EXT-09 | zero from Expression in a typed zero's words, es and pt-BR                           | c3f7a43b |
| EXT-10 | the rail's EXTRUDE did not run the ribbon's macro                                    | c3f7a43b |
| RVL-01 | a profile across or square to the axis refused after the angle                       | a701ce63 |
| RVL-02 | a self-intersecting profile said `Unable to revolve…` alone, after the angle         | a701ce63 |
| RVL-03 | the Object axis from the line's start, along a polyline's nearest segment            | a701ce63 |
| RVL-04 | X, Y and Z the WCS's axes, through its origin                                        | a701ce63 |
| RVL-05 | Enter at `Enter expression:` refused; AutoCAD goes back to the angle                 | a701ce63 |
| RVL-06 | the axis endpoint refused in a keyword prompt's words                                | a701ce63 |
| RVL-07 | a typed coordinate, then a click, at the angle asked a second point (d06)            | a701ce63, 494c8d66 |
| RVL-08 | a pick on nothing at `Select an object:` said `No object found`                      | a701ce63 |
| RVL-09 | `'ZOOM E` at the angle zoomed; AutoCAD refuses it for a regen (View's, d06)          | a701ce63 |
| RVL-10 | a stale setting and citations                                                        | a701ce63 |
| RVL-11 | the rail's REVOLVE did not run the ribbon's macro                                    | a701ce63 |
| SLP-01 | EXTRUDE never moved LASTPOINT                                                        | c3f7a43b |
| SLP-02 | REVOLVE never moved LASTPOINT                                                        | a701ce63 |
| SLP-03 | a point typed at PRESSPULL's pick: read from the cursor, `Click a face…` (d07)       | a1b5d7e5, 494c8d66 |
| PPL-01 | Enter after Multiple with nothing taken ended PRESSPULL                              | a1b5d7e5 |
| PPL-02 | a failed pick after Multiple said `Click a face…`; AutoCAD nothing (d07, d08)        | 494c8d66 |
| PPL-03 | a bare number said `2D point or option keyword required.` (d07)                      | 494c8d66 |
| PPL-04 | the pick's answer written after a space                                              | a1b5d7e5 |
| PPL-05 | PRESSPULL's tests                                                                    | a1b5d7e5 |
| PPL-06 | a closed object pulled kept silently; AutoCAD says `1 extrusion(s) created`          | a1b5d7e5 |
| SWO-01 | EXTRUDE re-applied the previous run's taper                                          | c3f7a43b |
| SWO-02 | a region of several faces made one solid                                             | 13499e6f |
| SWO-03 | LIST worded a solid's box as a region's in es and pt-BR                              | 13499e6f |
| SWO-04 | a revolution's Direction vector through MIRROR and SCALE                             | 13499e6f |
| SWO-05 | collinear segments and co-circular arcs stayed separate faces                        | 13499e6f |
| SWO-06 | a revolution turned whole had no seam edge                                           | 13499e6f |
| SWO-07 | EXPLODE of an extrusion gave its sides in the other order                            | 13499e6f |
| SWO-08 | draw.md: EXTRUDE "explodes as BOX does" false for a curved side                      | 13499e6f |
| SWO-09 | a swept solid's grips: p305's, their look d04 (Missing)                              | 13499e6f |
| SWO-10 | the object's tests                                                                   | 13499e6f |
| SWD-01 | a partial turn ruled every 360/N from its start; AutoCAD spreads round(N·s/360)      | 494c8d66 |
| SWD-02 | a spline surface took ISOLINES lines; AutoCAD splits each parameter in N − 3         | 494c8d66 |
| SWD-03 | the palette showed a sweep's Solid type alone                                        | 494c8d66 |
| SWD-04 | PRESSPULL's height prompt written once, the answer after a space                     | 494c8d66 |
| SWD-05 | an area pulled said nothing of its loop and region                                   | 494c8d66 |
| SWD-06 | Multiple's picks counted nothing; AutoCAD counts them under `Select object:`         | 494c8d66 |
| SWD-07 | the grips' look, the hover, Enter at the height, a hemisphere's isolines (Missing)   | 494c8d66 |
