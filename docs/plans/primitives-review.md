# 3D primitives review (BOX, WEDGE, CYLINDER, CONE, SPHERE, TORUS, PYRAMID)

> **Status:** done, 2026-11-03, in two groups: ten console blocks (PBX to SFL), then a desktop
> session with the owner's mouse (d01–d13) and its two blocks (PDT, PDJ), one commit each. What is
> left is in the coverage entries' **Missing:** and **unverified** (`docs/coverage/draw.md`, BOX to
> PYRAMID; drafting-aids.md; command-line.md).
>
> The full plan is in git: `git show 54e98171:docs/plans/primitives-review.md`. It holds the
> inventory, the probes' index, the matrix of every block, each finding with its evidence, the
> decisions PRIM-D1 to PRIM-D87 and what was refuted.
>
> It owns the solid object (its B-rep, 2D Wireframe and isolines, picking, snaps, transforms,
> file), a height or radius given with the mouse off the plan, the primitives' grips, palette
> rows, shared defaults and jig. It cites the LINE review (object snaps, point input, the command
> line, undo, dynamic input), ERASE's (`Select objects:`), Arrays', Clipboard's, Workspace's (the
> shortcut menus) and the 3D interaction review's (the aids off the plan).

## Summary

**Findings:** 0 critical, 5 high, 19 medium, 23 low, all executed.

| Block | What                                                     | Critical | High | Medium | Low |
| ----- | -------------------------------------------------------- | -------- | ---- | ------ | --- |
| PBX   | BOX, WEDGE                                               | 0        | 3    | 3      | 1   |
| SHD   | the primitives' shared defaults                          | 0        | 0    | 1      | 0   |
| PCY   | CYLINDER, CONE                                           | 0        | 0    | 2      | 4   |
| PST   | SPHERE, TORUS (and the refusal of the bare point prompts) | 0       | 0    | 1      | 1   |
| PPY   | PYRAMID                                                  | 0        | 0    | 0      | 4   |
| PLP   | LASTPOINT in the seven                                   | 0        | 0    | 3      | 0   |
| SPK   | the solid's snaps and picking                            | 0        | 1    | 2      | 5   |
| STF   | transforms and other commands on a solid                 | 0        | 0    | 1      | 2   |
| SWR   | 2D Wireframe, ISOLINES, REGEN                            | 0        | 0    | 1      | 1   |
| SFL   | file and clipboard                                       | 0        | 0    | 0      | 1   |
| PDT   | the desktop: what the seven read and keep                | 0        | 1    | 2      | 2   |
| PDJ   | the desktop: the jig (dynamic input, rubber band, ghost) | 0        | 0    | 3      | 1   |

The worst:

- **Intersection and Apparent Intersection found points on a solid's edges**, where AutoCAD finds
  none (SPK-01); **BOX towards a smaller X kept Rotation 0**, and after Length its height and
  width were measured from the wrong points (PBX-01 to PBX-03).
- **Under Ortho, BOX by two corners made nothing**: Ortho bent the other corner, which AutoCAD
  leaves as picked (PDT-01, desktop d03).
- **None of the seven moved LASTPOINT as AutoCAD does** (PLP-01 to PLP-03); **the jig read
  nothing in its boxes and drew no rubber band**, and a radius picked off the work plane was
  measured on it (PDJ-01, PDJ-02, PDT-02).

**Evidence:** 167 console probes in es-ES and en-US (pt-BR where its words are asked), p100–p158,
p200–p248, p300–p356, p400–p426, p500–p502, and desktop d01–d13 (en-US, es-ES, pt-BR; plan and
SE Isometric), on AutoCAD 2027 (ACADVER 26.0, X.118.0.0); the inputs in
`scripts/research/probes/primitives/`, the transcripts and screenshots in
`research/probes/primitives/` (gitignored).

## Index

| Id     | What it was                                                                    | Commit   |
| ------ | ------------------------------------------------------------------------------ | -------- |
| PBX-01 | BOX towards a smaller X kept Rotation 0 (AutoCAD 180, as WEDGE)                 | 3f031cad |
| PBX-02 | after Length, the height measured from the length's end (AutoCAD: far corner)  | 3f031cad |
| PBX-03 | a width by a point was its distance from the length's end (AutoCAD: square)    | 3f031cad |
| PBX-04 | Cube or Length from a raised point took the distance in space (AutoCAD: plan)  | 3f031cad |
| PBX-05 | es `CU` unknown                                                                | 3f031cad |
| PBX-06 | WEDGE from its centre, Length by a point, half as long                         | 3f031cad |
| PBX-07 | the width's side on the length's line rested on the console's noise            | 3f031cad |
| SHD-01 | OPEN reset the shared defaults (AutoCAD keeps them but the top radius)         | 13cd770b |
| PCY-01 | a height of 0 said BOX's words in es and pt-BR                                 | 7c7ad69a |
| PCY-02 | Elliptical's distance to the first axis offered no default                    | 7c7ad69a |
| PCY-03 | an elliptical base tilted by Axis endpoint lay turned 90°                      | 7c7ad69a |
| PCY-04 | CONE's Top asked twice offered what was just typed                             | 7c7ad69a |
| PCY-05 | pt-BR's CONE ends at Enter on a height with no default (kept out, PRIM-D20)    | 7c7ad69a |
| PCY-06 | AutoCAD values in tests without a source                                       | 7c7ad69a |
| PST-01 | SPHERE's, TORUS's, PYRAMID's bare point prompts refused in the wrong words     | bb26a486 |
| PST-02 | TORUS's Missing denied an apple's and a lemon's poles as Endpoints             | bb26a486 |
| PPY-01 | PYRAMID's zero refusals in es and pt-BR                                        | bf57cc9b |
| PPY-02 | a point at Top radius measured from a base the cursor moved                    | bf57cc9b |
| PPY-03 | pt-BR's PYRAMID ends at Enter on a height with no default (kept out, PRIM-D40) | bf57cc9b |
| PPY-04 | PYRAMID's coverage: 2Point's refusal, a citation, the es words                 | bf57cc9b |
| PLP-01 | CYLINDER, CONE, SPHERE and TORUS never moved LASTPOINT                         | f80bb46b |
| PLP-02 | PYRAMID's Edge, Axis endpoint and 2Point left LASTPOINT wrong                  | f80bb46b |
| PLP-03 | BOX and WEDGE left LASTPOINT wrong but after two corners                       | f80bb46b |
| SPK-01 | INT and APP found points on a solid's edges                                    | ed93ef45 |
| SPK-02 | `_CEN` at a circle's centre itself took it                                     | ed93ef45 |
| SPK-03 | a typed `x,y,z` at `Select objects:` off the plan dropped its Z                | ed93ef45 |
| SPK-04 | in plan, the edge found under another (END, QUA)                               | ed93ef45 |
| SPK-05 | NEA at a cone's apex found nothing                                             | ed93ef45 |
| SPK-06 | a lemon's Center near its centre, zoomed in, found nothing                     | ed93ef45 |
| SPK-07 | an apple's isoline at its outer equator: as AutoCAD's (desktop d10), refuted   | ed93ef45 |
| SPK-08 | `solidCommands.test.ts`: dead checks, a typed Escape, a stale title            | ed93ef45 |
| STF-01 | STRETCH took a cylinder by its seam (AutoCAD: its base's centre)               | 08fa1e24 |
| STF-02 | ARRAYRECT's base point at Z 0 (AutoCAD: the 3D centre)                         | 08fa1e24 |
| STF-03 | TORUS's Missing: an apple explodes into two POINTs                             | 08fa1e24 |
| SWR-01 | REGEN and REGENALL unknown                                                     | faa3a067 |
| SWR-02 | ISOLINES' refusals untested                                                    | faa3a067 |
| SFL-01 | the file round trip tested for a box only                                      | 9e4ae037 |
| PDT-01 | Ortho bent BOX's and WEDGE's other corner, so no box by two corners            | 03ba17a1 |
| PDT-02 | a radius picked off the work plane was read on it (AutoCAD: the centre's)      | 03ba17a1 |
| PDT-03 | a cancelled run's answers became the next run's defaults                       | 03ba17a1 |
| PDT-04 | a width on the length's line always went right                                 | 03ba17a1 |
| PDT-05 | a wedge's base arrow under its centre (AutoCAD: its tall end)                  | 03ba17a1 |
| PDJ-01 | dynamic input read no distance; BOX's other corner one X,Y field               | b2c27257 |
| PDJ-02 | no dashed rubber band at the round solids' distance prompts                    | b2c27257 |
| PDJ-03 | no ghost at the base radius, ring, ellipse, Top, axis endpoint, length, width  | b2c27257 |
| PDJ-04 | PYRAMID's base ghost without its edges to the centre                           | b2c27257 |

Left open, each in its coverage entry: a box turned 180 runs its edges as a box turned, where ACIS
mirrors them (BOX); a Cube by a point from the centre, doubled as Length's, **unverified**; Polar
at the other corner; the dotted dimensions at the radius, Length, width, other corner, axis and
Elliptical, and WEDGE's, Cube's and PYRAMID's Top ghosts (PDJ); a typed window with no width on
the screen (command-line.md); `Oblique, non-uniformly scaled objects were ignored.` before a
refused Quadrant (drafting-aids.md); an elliptical cylinder's isoline's NEA and CEN (p403);
`20<45` at BOX's Length read as an absolute point (p109), untested. Tracking along a solid edge's
own line, drawn across the view where AutoCAD labels an Extension (desktop d09, unverified), is for
the 3D interaction review; PRIM-D41's suspects are in the roadmap for reviews 27 to 31.
