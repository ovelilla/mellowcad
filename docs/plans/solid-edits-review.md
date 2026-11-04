# Solid edits review (SLICE, SECTION, FILLETEDGE, CHAMFEREDGE, SOLIDEDIT)

> **Status:** done, 2026-11-04, in two groups: the console blocks (SLC, FED, SUB, SOE, with the
> LASTPOINT sweep ELP), then a desktop session with the owner's mouse (d01–d06) and its block
> (SED), executed in six commits. What is left is in the coverage entries' **Missing:**
> (`docs/coverage/modify.md` SLICE, FILLETEDGE / CHAMFEREDGE, SOLIDEDIT; `docs/coverage/draw.md`
> SECTION; `docs/coverage/command-line.md` for the sub-objects).
>
> The full plan is in git: `git show 441a04e4:docs/plans/solid-edits-review.md`. It holds the
> inventory, the probes' index, the matrix of every block, each finding with its evidence, the
> decisions EDITS-D1 to EDITS-D134 and what was refuted.
>
> It owns the sub-objects (Ctrl+click and Ctrl+Space at `Command:`, their highlight, grips and
> selection, `Select objects:`' SUbobject mode on solids) and a command's own grip asked as a nested
> command (`ToolQuestion.nested`). It cites the LINE review (object snaps, point input, the command
> line, undo, transparency), ERASE's (`Select objects:`, preselection), Workspace's (the rail's
> macros), the 3D primitives review (the solid object, PLP, the shared defaults), the Regions review
> (the booleans, RGN-01, BLN-02) and the Sweeps review (EXTRUDE's height and taper, EXT-07).

## Summary

**Findings:** 0 critical, 12 high, 26 medium, 19 low, all executed or recorded in Missing.

| Block | What                                                    | Critical | High | Medium | Low |
| ----- | ------------------------------------------------------- | -------- | ---- | ------ | --- |
| SLC   | SLICE (and SECTION's shared prompts)                    | 0        | 3    | 2      | 3   |
| SEC   | SECTION's own cells                                     | 0        | 0    | 1      | 0   |
| ELP   | LASTPOINT in the three tools                            | 0        | 0    | 2      | 1   |
| FED   | FILLETEDGE, CHAMFEREDGE                                 | 0        | 1    | 5      | 3   |
| SUB   | sub-objects at `Select objects:`                        | 0        | 0    | 1      | 1   |
| SOE   | SOLIDEDIT                                               | 0        | 5    | 10     | 6   |
| SED   | the desktop                                             | 0        | 3    | 5      | 5   |

The worst:

- **The UCS's axes and origin were the frame's**: SLICE's and SECTION's YZ, ZX and `<0,0,0>`,
  SOLIDEDIT Rotate's Xaxis, Yaxis and origin (SLC-01, SLC-02, SOE-12, SOE-20).
- **SOLIDEDIT ended at Enter** where AutoCAD asks again (SOE-01), took one face for an edge
  (SOE-04) and offered `<0>` for the taper (SOE-02); a click at Rotate's axis was not taken
  (SED-02).
- **FILLETEDGE's arrow grip** asked a second point and dragged a radius 2.4 times AutoCAD's, and
  Escape at the accept prompt's sizes cancelled the command (SED-01, SED-03).

**Evidence:** 228 console probes in es-ES and en-US (pt-BR where its words are asked),
`solid-edits/p100–p179`, `p200–p266`, `p300–p374`, `p400–p407`; the earlier `slice/*`,
`section/*`, `filletedge/*`, `chamferedge/*`, `solidedit/*`; desktop d01–d06 (es-ES); on AutoCAD
2027 (ACADVER 26.0, X.118.0.0), the tables of 2026-10-31. The inputs are in
`scripts/research/probes/solid-edits/`, the transcripts and screenshots in
`research/probes/solid-edits/` (gitignored).

## Index

| Id     | What it was                                                                           | Commit             |
| ------ | ------------------------------------------------------------------------------------- | ------------------ |
| SLC-01 | YZ and ZX cut through the frame's axes, not the UCS's                                 | 5671b1ab           |
| SLC-02 | Enter's `<0,0,0>` at View, XY, YZ and ZX was the WCS's origin                         | 5671b1ab           |
| SLC-03 | SLICE and SECTION acted on a preselection AutoCAD drops (d05-a by click)              | 5671b1ab           |
| SLC-04 | Enter on an empty set was silent                                                      | 5671b1ab           |
| SLC-05 | planar Object passed over in silence what AutoCAD refuses with words                  | 5671b1ab           |
| SLC-06 | planar Object's and Surface's picks took other answers than entsel's                  | 5671b1ab           |
| SLC-07 | ALL's halves and regions in drawing order; AutoCAD's newest first                     | 5671b1ab           |
| SLC-08 | tests and citations                                                                   | 5671b1ab           |
| SEC-01 | a region where the plane holds a face faced the plane's normal                        | 5671b1ab           |
| ELP-01 | SLICE and SECTION never moved LASTPOINT                                               | 5671b1ab           |
| ELP-02 | FILLETEDGE's and CHAMFEREDGE's typed edge did not set LASTPOINT                       | ec871bc9           |
| ELP-03 | three SOLIDEDIT answers did not set LASTPOINT                                         | 59a9024f           |
| FED-01 | CHAMFEREDGE's accept Distance asked the pick's prompts and saved them                 | ec871bc9           |
| FED-02 | the sizes saved at the commit (then as answered; at the run's end since SED-04)       | ec871bc9           |
| FED-03 | Enter at `Enter expression:` refused with the syntax message                          | ec871bc9           |
| FED-04 | an expression of 0 or less said `Radius too small. *Invalid*`                         | ec871bc9           |
| FED-05 | the hidden keywords were refused                                                      | ec871bc9           |
| FED-06 | a bare number at the edge pick was refused                                            | ec871bc9           |
| FED-07 | four refusals were silent                                                             | ec871bc9           |
| FED-08 | the rail echoed `_filletedge`; the ribbon's macro is `^C^C_FILLETEDGE`                | ec871bc9           |
| FED-09 | tests and citations                                                                   | ec871bc9           |
| SUB-01 | SUbobject mode finds nothing on a solid (phase 6c, Missing)                           | ec871bc9           |
| SUB-02 | a stale WHY and a false coverage line                                                 | ec871bc9           |
| SOE-01 | Enter at a point or value prompt ended SOLIDEDIT                                      | 59a9024f           |
| SOE-02 | the extrusion's taper always offered `<0>`; AutoCAD EXTRUDE's last                    | f874966c           |
| SOE-03 | Enter at the extrusion's height ended it; AutoCAD the primitives' height              | f874966c           |
| SOE-04 | a pick on an edge took one face; AutoCAD both (d02-c by click)                        | 59a9024f           |
| SOE-05 | a face picked again: the one behind it (d02-a by click)                               | 59a9024f           |
| SOE-06 | its Undo never said `Command has been completely undone.`                             | 59a9024f           |
| SOE-07 | Undo at `Select faces` and `Remove faces`                                             | 59a9024f           |
| SOE-08 | what Remove and ALL say, and when ALL is offered                                      | 59a9024f           |
| SOE-09 | a pick on nothing, or on a locked solid, was silent                                   | 59a9024f           |
| SOE-10 | zero and out-of-range values made an edit                                             | 59a9024f           |
| SOE-11 | the negative offset's bound, −(the largest box side)/2                                | f874966c           |
| SOE-12 | Rotate's Xaxis and Yaxis were the frame's axes                                        | f874966c           |
| SOE-13 | the kernel refuses edits AutoCAD makes (Missing)                                      | f874966c           |
| SOE-14 | SOLIDCHECK did not exist                                                              | f874966c           |
| SOE-15 | a huge offset changes nothing in AutoCAD (Missing)                                    | f874966c           |
| SOE-16 | a rotation axis of no length                                                          | 59a9024f           |
| SOE-17 | Copy's region had no row in `currentProperties.test.ts`                               | f874966c           |
| SOE-18 | `solidedit.test.ts`' pins and citations                                               | f874966c           |
| SOE-19 | Missing's "faces of several solids at once" was no gap                                | f874966c           |
| SOE-20 | Rotate's origin `<0,0,0>` was the WCS's origin                                        | f874966c           |
| SOE-21 | a point at Rotate's angle asked a second point                                        | 59a9024f           |
| SED-01 | FILLETEDGE's arrow grip: a second point asked, the radius 2.4 times AutoCAD's (d04-c) | 18902765           |
| SED-02 | a click at SOLIDEDIT Rotate's axis point was not taken (d02-e)                        | ecc32ac2           |
| SED-03 | Escape at the accept's Radius, Distance or grip cancelled the command (d04-c, d04-d)  | 18902765           |
| SED-04 | Escape kept the sizes and said nothing of the edges (d04-d)                           | 18902765           |
| SED-05 | no rubber band at SOLIDEDIT's and SLICE's second points (d02, d05)                    | ecc32ac2           |
| SED-06 | a click at an object's pick left LASTPOINT (d06)                                      | 18902765, ecc32ac2 |
| SED-07 | Ctrl+Space walked FILLETEDGE's edges, and through the box ended it (d04-e)            | 18902765           |
| SED-08 | a selected sub-object is the preselection of AutoCAD's LIST, MOVE, ERASE (Missing)    | ecc32ac2           |
| SED-09 | SOLIDEDIT's face pick lit faces; AutoCAD the solid over an edge (d02-b)               | ecc32ac2           |
| SED-10 | FILLETEDGE's and CHAMFEREDGE's look at the pick and accept (d04)                      | 18902765           |
| SED-11 | Surface's pick lit nothing (d05-d)                                                    | ecc32ac2           |
| SED-12 | Ctrl with the cursor still, and a locked solid under Ctrl (d01-a, h)                  | ecc32ac2           |
| SED-13 | what the desktop settled for the coverage and the tests (d01)                         | ecc32ac2           |
