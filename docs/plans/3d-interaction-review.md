# 3D interaction review (the drafting aids off the plan)

> **Status:** done, 2026-10-31, in one session: the matrix, fourteen console probes and a desktop
> pass with the owner's mouse, then three commits (snaps, constraints, edge-on). What is left is in
> the coverage entries' **Missing:** and **unverified** (drafting-aids.md: Object snaps, OTRACK,
> Polar, Ortho, SNAP, Angle override, Grips; coordinate-systems.md: "Where a point's Z comes from";
> view.md).
>
> The full plan is in git: `git show 1939217d:docs/plans/3d-interaction-review.md`. It holds the
> matrix (Z-01 to Z-30: every aid against level, raised, sloped, vertical, own-plane and block
> objects, the base point at another Z, ELEVATION, the views, edge-on) and the model AutoCAD
> follows, with its numbers.

## Summary

Thirteen findings, all executed:

- **Ortho, Polar, the grid under them and `<angle` read the work plane's cursor and dropped their
  point to it**: drawing up a riser and on with Polar went back to Z 0 (the owner's report). AutoCAD
  reads the cursor on the base point's plane and keeps its Z, in a 3D view and in plan (CON-01 to
  CON-04); OTRACK on the acquired point's plane (TRK-01, TRK-02).
- **A vertical line offered no snap** (read in plan, where it is a point); Perpendicular to a line
  from another height was the plan's foot; Apparent Intersection took the wrong object's height in
  plan; an oblique circle offered Quadrants (SNP-01 to SNP-05).
- **A line's end grip bent Ortho and Polar from its far end**, never probed since the first commit
  (GRP-01); **a click edge-on was refused** with a message 2027 does not have (EDG-01).

**Evidence:** console probes i01–i14 (en-US, AutoCAD 2027) and desktop d01–d09 (en-US).

## Probes

Console inputs are `scripts/research/probes/interaction3d/i<nn>.txt`, run untraced with
`scripts/research/runacc.sh <file> en-US`; the desktop pass is `dsk.sh` there. Transcripts are in
`research/probes/interaction3d/` (gitignored).

| Id      | What it asks                                                                       |
| ------- | ---------------------------------------------------------------------------------- |
| i01–i03 | a vertical line's END, MID, NEA in SEISO; INT and APP of lines at Z 0 and Z 30     |
| i04–i08 | PER and TAN from Z 50; typed points after Z 50; a vertical line in plan; 3DPOLY    |
| i09–i11 | an oblique circle's QUA; a raised block reference; picking by the line of sight    |
| i12–i14 | APP in SEISO in both drawing orders; INT and PER on a vertical line alone          |
| d01–d05 | Polar, a free click, Ortho (a sweep of 34 directions), OTRACK, the grid and `<0`   |
| d06–d09 | a raised line's end grip; PLAN; the work plane edge-on; OTRACK's `+Z` guide       |

## Findings

| Id     | What it was                                                               | Commit   |
| ------ | ------------------------------------------------------------------------- | -------- |
| SNP-01 | a vertical line's (and 3D polyline segment's) END, MID, NEA found nothing | 594b9a57 |
| SNP-02 | INT of a vertical line with a level line alone found nothing              | 594b9a57 |
| SNP-03 | APP in plan took the older object's height (AutoCAD: the newer's)         | 594b9a57 |
| SNP-04 | PER to a line from another height was the foot in plan                    | 594b9a57 |
| SNP-05 | QUA of a circle oblique to the UCS gave its OCS quadrants (AutoCAD: none) | 594b9a57 |
| CON-01 | Polar from another Z engaged over its path's image at Z 0, its point too  | cbfb9ada |
| CON-02 | Ortho and Shift from another Z read the work plane's cursor and Z         | cbfb9ada |
| CON-03 | `<angle` read the work plane's cursor                                     | cbfb9ada |
| CON-04 | SNAP under Ortho / Polar rounded the work plane's cursor                  | cbfb9ada |
| TRK-01 | OTRACK's foot on a guide of the plane was the screen's                    | cbfb9ada |
| TRK-02 | a raised acquired point was dropped by its plan distance to the cursor    | cbfb9ada |
| GRP-01 | a line's end grip bent Ortho and Polar from the line's far end            | cbfb9ada |
| EDG-01 | a click with the work plane edge-on was refused                           | 1939217d |
