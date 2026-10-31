# 3D interaction review (the drafting aids off the plan)

> **Status:** in progress, 2026-10-31. Goal: an AutoCAD user draws in a view that is not the plan
> with clicks and every drafting aid, each doing what AutoCAD 2027 does. The matrix below crosses
> the aids with the objects' attitude and the situations, grouped by class of behaviour; each cell
> is **ok**, **bad** (with the probe that shows it) or **unverified**.

## Probes

Console inputs are `scripts/research/probes/interaction3d/i<nn>.txt`, run untraced with
`scripts/research/runacc.sh <file> en-US` (they read the result with `entget`); transcripts in
`research/probes/interaction3d/` (gitignored). The desktop pass (d01–d09, en-US, 2026-10-31, the
owner's mouse) is `scripts/research/probes/interaction3d/dsk.sh`: SEISO, a reference line
0,0,0 → 0,100,0 → 0,100,50, LINE from 0,100,50, the mouse on world points' pixels.

| Id  | What it asks                                                                              |
| --- | ----------------------------------------------------------------------------------------- |
| i01 | a vertical line in SEISO: END typed at its top and at its line of sight on Z 0, MID, NEA |
| i02 | two lines crossing in plan at Z 0 and Z 30: INT and APP in plan and SEISO                |
| i03 | i02's APP in plan with the objects drawn in the other order                              |
| i04 | PER from Z 50 to a sloped line (plan, SEISO); TAN from Z 50 to a circle at Z 0           |
| i05 | `10,0` and `@10,0` typed after a point at Z 50; ELEVATION 20                             |
| i06 | a vertical line's END in plan; INT of a vertical line, a level line and a circle at Z 25 |
| i07 | a 3D polyline's vertical segment: END at its top, MID                                    |
| i08 | INT of sloped lines meeting in space; PER to a vertical line; PER from Z 50 to a circle  |
| i09 | a circle and an arc in their own plane (UCS X 90): CEN, QUA, MID, in the World UCS       |
| i10 | a block reference at Z 10 holding a line at Z 5: END, INS                                |
| i11 | picking a vertical line and a raised line by their line of sight                         |
| i12 | APP in SEISO at the visual crossing of i02's lines                                       |
| i13 | i12 with the objects drawn in the other order                                            |
| i14 | INT of a vertical line and a level line alone; PER to the vertical line                  |
| d01 | Polar from 0,100,50: the cursor on the 0° guide drawn at Z 50, then on its image at Z 0  |
| d02 | a click with Polar free (no angle engaged) from 0,100,50                                 |
| d03 | Ortho from 0,100,50, and a sweep of 34 directions at 200 px                              |
| d04 | Polar 8 px off its guide; OTRACK from 0,100,50 8 px off its X guide                      |
| d05 | SNAP 10 with Ortho, SNAP alone, and `<0`, from 0,100,50                                  |
| d06 | a raised line's end grip dragged with Ortho                                              |
| d07 | PLAN: Polar and Ortho from 0,100,50                                                      |
| d08 | VPOINT 0,-1,0 (the work plane edge-on): a click                                          |
| d09 | OTRACK's +Z guide from an acquired endpoint                                              |

## What AutoCAD does (the model)

- **The bare cursor is on the work plane** (UCS XY + ELEVATION): a free click from a point at Z 50
  lands at Z 0 (d02, i05).
- **A constraint from a base point reads the cursor on the base point's plane**: the line of sight
  meets the plane through the base point parallel to the UCS's XY, and Ortho, Polar, the grid under
  them and `<angle` work there; their point has the base point's Z. Ortho from 0,100,50 with the
  pointer on 80,100,0's pixel gives 129.875,100,50 (d03): neither the pointer's plan (80) nor its
  foot on the drawn axis (≈105). Polar 8 px below its 0° guide at 100,100,50 gives 101.648 (the
  plane's foot 101.7, the screen's 100.85; d04); the grid with Ortho rounds that cursor (130, d05)
  and alone rounds the work plane's (80,100,0); `<0` gives 132.849,100,50. In plan the same
  (70.29,100,50 and 60.38,100,50, d07). Polar engages only where its guide is drawn: over the guide
  at Z 50, not over its image at Z 0 (d01).
- **OTRACK reads the cursor on the acquired point's plane**: 8 px off the X guide of 0,100,50,
  `Endpoint: 101.6485 < 0°`, the point 101.648,100,50 (d04); and offers the `+Z` guide
  (`Endpoint: 75.5448 < +Z`, d09).
- **Ortho's axis** is the one drawn nearest the cursor, within a few degrees (d03: −Z still at 302°,
  where the screen bisector is 300°; X at 306°; Y at 54°, Z at 60°). A grip uses it too (d06).
- **Edge-on** (VPOINT 0,-1,0, World UCS) a click lands on the plane facing the screen through the
  origin, 50.23,0,30.2 (d08).
- **Snaps** are found where their object is drawn: drafting-aids.md, Object snaps.

## Classes of behaviour

The objects: **level** (in the work plane), **raised** (level, another Z), **sloped** (a line or
3D polyline segment that climbs), **vertical** (along the UCS's Z: a point in plan), **own plane**
(normal ≠ Z: circle, arc, ellipse, polyline, text, spline), **in a block**. The situations: the
base point at another Z, ELEVATION ≠ 0, a tilted UCS, the views (plan, isometric, orthographic
sides, free orbit), objects crossing in plan but not in 3D, the work plane edge-on.

| Id | Class | AutoCAD 2027 | Here | State |
| --- | --- | --- | --- | --- |
| Z-01 | The bare cursor | the work plane (i05, d02) | same | ok |
| Z-02 | A relative typed point, a typed length | the last point's Z (i05) | same | ok |
| Z-03 | Point snaps on level, raised, sloped, own-plane objects, in a block | the object's point, found where drawn (i09 CEN/MID, i10 END) | same | ok |
| Z-04 | END, MID, NEA on a vertical line or 3D polyline segment | its top, middle, the point under the cursor (i01, i07) | nothing: read on its plan, a point | fixed (SNP-01) |
| Z-05 | A vertical line's END in plan | its start (i06) | same | ok |
| Z-06 | INT of objects crossing in plan at different heights | none (i02) | same | ok |
| Z-07 | INT of a vertical line with what it passes through | at that object's height (i06, i14) | none without a third object | fixed (SNP-02) |
| Z-08 | APP of lines at different heights | plan: the newer's height (i02, i03); SEISO: on the older (i12, i13) | plan: the older's | fixed (SNP-03) |
| Z-09 | PER from another height to a sloped or vertical line | the foot in space (i04, i08, i14) | the foot in plan; none on a vertical | fixed (SNP-04) |
| Z-10 | PER and TAN to a circle from another height | in the circle's plane (i04, i08) | same | ok |
| Z-11 | QUA of a circle oblique to the UCS | none, "Oblique, non-uniformly scaled objects were ignored." (i09) | its OCS's | fixed (SNP-05), the line not written |
| Z-12 | INS of a reference | needs the aperture over its geometry (i10) | the point itself | unverified (a plan question; i10's aperture may simply have missed) |
| Z-13 | Picking a vertical or raised line by its line of sight | taken (i11) | same | ok |
| Z-14 | Polar from a base point at another Z | engages where drawn; the cursor on the base plane; the base's Z (d01, d04, d07) | engaged on its image at Z 0; the point on the work plane | fixed (CON-01) |
| Z-15 | Ortho / Shift from a base point at another Z | the base plane's cursor, the base's Z (d03, d07) | the work plane's cursor and Z | fixed (CON-02) |
| Z-16 | Ortho's axis in a 3D view | nearest drawn, ± a few degrees (d03, d06) | nearest drawn | ok (approximate) |
| Z-17 | `<angle` from a base point at another Z | the base plane's cursor (d05) | the work plane's cursor, the base's Z | fixed (CON-03) |
| Z-18 | SNAP under Ortho / Polar from another Z; SNAP alone | the base plane's cursor rounded; alone the work plane's (d05) | the work plane's | fixed (CON-04) |
| Z-19 | OTRACK guides from points at another Z | measured on the point's plane, its Z (d04) | measured on the screen, its Z; dropped by its plan distance | fixed (TRK-01, TRK-02) |
| Z-20 | OTRACK's `+Z` guide | offered (d09) | offered | ok |
| Z-21 | Polar / Ortho's `+Z` guide | offered (help, d03) | offered | ok |
| Z-22 | A line's end grip dragged with Ortho or Polar | bent from where the grip was (d06) | from the line's far end | fixed (GRP-01) |
| Z-23 | The work plane edge-on | the plane facing the screen through the origin (d08) | refused, `Pointing in edge-on UCS is prohibited.` (a string 2027's tables lack) | fixed (EDG-01) |
| Z-24 | Dynamic input: a length typed on a guide | the base's Z plus the length along it | the base's Z | ok (`zTracking.test.ts`) |
| Z-25 | FROM with a base at another Z | `@` from the base keeps its Z | same | ok |
| Z-26 | Tab cycling where snaps stack (a vertical line's ends in plan) | unverified | both ends offered at one point | unverified |
| Z-27 | Window selection off the plan | a screen rectangle | `objectsInWindow` on the screen | ok (by construction) |
| Z-28 | UCSDETECT | only faces of solids, meshes, point clouds ("does not detect … 2D geometry") | none of those exist | n/a (help) |
| Z-29 | OSNAPZ | 0 by default: a snap keeps the object's Z | 0, not exposed | ok (help) |
| Z-30 | Additional polar angles | — | not built (drafting-aids.md) | n/a |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| SNP-01 | A vertical line's (or 3D polyline segment's) END, MID, NEA found nothing: the snap read it in plan | its points in space, read along its image on the screen | snaps |
| SNP-02 | INT of a vertical line with a level line alone found nothing | crossed at the other object's height | snaps |
| SNP-03 | APP in plan took the older object's height | the newer's in plan, the older's off it | snaps |
| SNP-04 | PER to a line from another height was the foot in plan | the foot in space | snaps |
| SNP-05 | QUA of an oblique circle gave its OCS quadrants | none | snaps |
| CON-01 | Polar from a base point at another Z engaged over its path's image on the work plane, and its point dropped to the work plane (the owner's report) | engaged where drawn (measured on the screen), the cursor on the base point's plane, its Z | constraints |
| CON-02 | Ortho and Shift from another Z read the work plane's cursor and gave its Z | the base point's plane and Z, in plan too | constraints |
| CON-03 | `<angle` read the work plane's cursor | the base point's plane | constraints |
| CON-04 | SNAP under Ortho / Polar rounded the work plane's cursor | the base plane's; alone, still the work plane's | constraints |
| TRK-01 | OTRACK's projection onto a guide of the plane was the foot on the screen | the foot on the acquired point's plane | constraints |
| TRK-02 | An acquired point at another height was dropped once the work plane's cursor was a view's diagonal away in plan | measured on the screen off the plan | constraints |
| GRP-01 | A line's end grip bent Ortho and Polar from the line's far end (the code's choice since the first commit, never probed) | from where the grip was | constraints |
| EDG-01 | A click with the work plane edge-on was refused with a message from memory | the point on the plane facing the screen through the origin, its Z kept | edge-on |
