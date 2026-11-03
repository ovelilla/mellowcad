# Regions review (REGION, UNION, SUBTRACT, INTERSECT)

> **Status:** done, 2026-11-03, in two groups: four console blocks (RGN, BLN, BSL, RGO), then a
> desktop session with the owner's mouse (d01–d06) and its block (RGD), one commit each. What is
> left is in the coverage entries' **Missing:** (`docs/coverage/draw.md` REGION, `modify.md`
> UNION / SUBTRACT / INTERSECT, `command-line.md`).
>
> The full plan is in git: `git show 103f0009:docs/plans/regions-review.md`. It holds the
> inventory, the probes' index, the matrix of every block, each finding with its evidence, the
> decisions REGIONS-D1 to REGIONS-D80 and what was refuted.
>
> It owns the region object (loops, plane, drawing, picking, snaps, grips, palette rows,
> transforms, EXPLODE, file) and the booleans of regions and solids. It cites the LINE review
> (object snaps, point input, the command line, undo, transparency), ERASE's (`Select objects:`,
> its modes, Previous, preselection, the rollover glow), Workspace's (the rail's macros), the 3D
> primitives review (the solid object, its isolines), LIST's (review 32) and MASSPROP's (review
> 30).

## Summary

**Findings:** 0 critical, 3 high, 16 medium, 13 low, all executed or recorded in Missing.

| Block | What                                                 | Critical | High | Medium | Low |
| ----- | ---------------------------------------------------- | -------- | ---- | ------ | --- |
| RGN   | REGION                                               | 0        | 1    | 4      | 3   |
| BLN   | UNION, SUBTRACT, INTERSECT: the commands and regions | 0        | 2    | 4      | 2   |
| BSL   | the booleans of solids                               | 0        | 0    | 1      | 3   |
| RGO   | the region object in other commands                  | 0        | 0    | 5      | 2   |
| RGD   | the desktop: grips, palette, look                    | 0        | 0    | 2      | 3   |

The worst:

- **REGION, UNION, SUBTRACT and INTERSECT acted at once on a preselection.** AutoCAD 2027 drops
  it and asks `Select objects:`, while MOVE and EXTRUDE take the same set in the same run
  (RGN-01, BLN-01; p129, p335, p349; the desktop through COM, d01).
- **With a window or ALL, AutoCAD keeps the newest object**; mellowcad kept the oldest (BLN-02).
- **SUBTRACT missed AutoCAD's two refusals** and cut a plane AutoCAD leaves alone (BLN-03,
  BLN-04).

**Evidence:** 136 console probes in es-ES and en-US (pt-BR where its words are asked),
`regions/p100–p137`, `p150`, `p200–p222`, `p300–p349`, `p400`, and desktop d01–d06 (es-ES); the
earlier `region/*` and `union/*`; on AutoCAD 2027 (ACADVER 26.0, X.118.0.0). The inputs are in
`scripts/research/probes/regions/`, the transcripts and screenshots in `research/probes/regions/`
(gitignored).

## Index

| Id     | What it was                                                                       | Commit   |
| ------ | --------------------------------------------------------------------------------- | -------- |
| RGN-01 | REGION acted on a preselection; AutoCAD drops it and asks                         | c3706f83 |
| RGN-02 | `All open edges cannot be colinear.` was never said                               | c3706f83 |
| RGN-03 | a Spline-fit polyline's region was its chord polygon, not its curve               | c3706f83 |
| RGN-04 | regions made in the wrong order (AutoCAD: the chains', then the closed objects')  | c3706f83 |
| RGN-05 | loops meeting only at a vertex reported an extra rejected outline                 | c3706f83 |
| RGN-06 | two coincident circles made two stacked regions; AutoCAD one per place            | c3706f83 |
| RGN-07 | of two coincident lines, the first was used; AutoCAD uses the later               | c3706f83 |
| RGN-08 | REGION's untested cells                                                           | c3706f83 |
| BLN-01 | UNION, SUBTRACT and INTERSECT acted on a preselection                             | 3e4dc75e |
| BLN-02 | a window, a crossing or ALL kept the oldest object; AutoCAD the newest            | 3e4dc75e |
| BLN-03 | SUBTRACT ignored AutoCAD's first-subset rule (22214)                              | 3e4dc75e |
| BLN-04 | SUBTRACT never said `No solids, surfaces, or regions selected.` (22205)           | 3e4dc75e |
| BLN-05 | Previous after SUBTRACT: `No previous selection set.`, AutoCAD `0 found` (Missing) | 3e4dc75e |
| BLN-06 | the region booleans' languages and b10's SUBTRACT untested                        | 3e4dc75e |
| BLN-07 | draw.md's REGION Missing stale on the booleans of solids                          | 3e4dc75e |
| BLN-08 | pt-BR `U`, UNIAO's alias, was an unknown command                                  | 3e4dc75e |
| BSL-01 | a composite's file round trip tested for two boxes only                           | b148a08c |
| BSL-02 | a test pinned the oldest's survival under ALL, citing s07 (the newest)            | 3e4dc75e |
| BSL-03 | a cylinder lying on a box: V10 E16 F9 against ACIS's V10 E17 F10 (Missing)        | b148a08c |
| BSL-04 | k03–k08 cited without counts for k05 and k06                                      | b148a08c |
| RGO-01 | STRETCH left a region caught in part; AutoCAD moves it whole                      | f0e78c57 |
| RGO-02 | QUA on a region's curved edge followed the UCS; AutoCAD the region's axes         | f0e78c57 |
| RGO-03 | FILLET and CHAMFER passed over a region in silence                                | f0e78c57 |
| RGO-04 | -HATCH's Select objects could not take a region                                   | f0e78c57 |
| RGO-05 | Apparent Intersection found nothing between an arc or circle and a line           | f0e78c57 |
| RGO-06 | TRIM and EXTEND Quick on a region's edges, settled                                | f0e78c57 |
| RGO-07 | the "a region in the other commands" tests protected less than their titles       | f0e78c57 |
| RGD-01 | a composite solid showed no grip; AutoCAD one at its box's X-Y centre, lowest Z   | 91b97958 |
| RGD-02 | a boolean-cut curved face's isolines differ (d03-3, d05-1; rule unprobed, Missing) | 91b97958 |
| RGD-03 | one object named `Type (1)` in the palette's drop-down; AutoCAD the type alone    | 91b97958 |
| RGD-04 | the command line's placeholder showed while a command asked                       | 91b97958 |
| RGD-05 | the rollover glow covers the object's colour (Missing, REGIONS-D80)               | 91b97958 |
