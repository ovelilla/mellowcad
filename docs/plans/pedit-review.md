# PEDIT, SPLINEDIT review (3DPOLY, PEDIT, SPLINEDIT; the 3D polyline object)

> **Status:** done, 2026-11-05, in two groups: the console blocks (TPL, TPO, SPE, PED, LPT), then
> a desktop session with the owner's mouse (3dpoly/d04–d08, pedit/d01–d02, splinedit/d01–d02) and
> its block (PSD), executed in six commits. What is left is in the coverage entries' **Missing:**
> (`docs/coverage/draw.md` 3DPOLY; `docs/coverage/modify.md` PEDIT, SPLINEDIT;
> `docs/coverage/properties.md`).
>
> The full plan is in git: `git show 120be217:docs/plans/pedit-review.md`. It holds the inventory,
> the probes' index, the matrix of every block, each finding with its evidence, the decisions
> PEDIT-D10 to PEDIT-D53 and what was refuted.
>
> It owns the 3D polyline object. It cites the LINE review (the command line, transparency, undo,
> point input, snaps, dynamic input), ERASE's (`Select objects:`, preselection), PLINE's (the
> polyline object), SPLINE's (the spline object), Pieces' (a single object's pick with modes),
> Corners' (CRP-01's locked picks), Solid edits' and Solid inquiry's (SED-06, VSD-04: LASTPOINT at a
> click).

## Summary

**Findings:** 0 critical, 1 high, 23 medium, 20 low, all executed or recorded in Missing.

| Block | What                                              | Critical | High | Medium | Low |
| ----- | ------------------------------------------------- | -------- | ---- | ------ | --- |
| TPL   | 3DPOLY, the command                               | 0        | 0    | 1      | 2   |
| TPO   | the 3D polyline object (the area)                 | 0        | 0    | 1      | 2   |
| LPT   | LASTPOINT and the object picks of the three tools | 0        | 0    | 3      | 2   |
| PED   | PEDIT                                             | 0        | 1    | 4      | 5   |
| SPE   | SPLINEDIT and the spline's conversion             | 0        | 0    | 9      | 6   |
| PSD   | the three on the desktop, and Multiple's fuzz     | 0        | 0    | 5      | 3   |

The worst:

- **`@dx,dy` at Edit vertex's Move and Insert was read from LASTPOINT**, not from the marked
  vertex AutoCAD's traced BasePoint names (PED-01, pedit/p227, p251).
- **PEDIT's Width, Edit vertex's Width and Tangent, and Multiple's fuzz took no point**, typed or
  clicked, where AutoCAD measures one from the X or two (LPT-02, PSD-01, pedit/p303–p305, p340).
- **A 3D polyline was drawn dashed** where AutoCAD draws it continuous whatever its linetype
  (TPO-01, 3dpoly/p118, p122, desktop d06); SPLINEDIT's Moves dragged no ghost and its Edit vertex
  drew no frame (PSD-05, PSD-06).

**Evidence:** console probes in es-ES and en-US (pt-BR where its words are asked),
`3dpoly/p100–p128`, `pedit/p200–p340`, `splinedit/p100–p166`; the earlier `3dpoly/p01–p79`,
`d01–d03`, `pedit/p01–p199`, `spline-knots/k11–k146`, `spline3d/s*`; desktop `3dpoly/d04–d08`,
`pedit/d01–d02`, `splinedit/d01–d02` (es-ES); on AutoCAD 2027 (ACADVER 26.0, X.118.0.0), the
tables of 2026-10-31. The inputs are in `scripts/research/probes/3dpoly/`,
`scripts/research/probes/pedit/` (with the desktop helpers, `lib.sh`) and
`scripts/research/probes/splinedit/`; the transcripts, plots and screenshots in `research/probes/`
(gitignored).

## Index

| Id               | What it was                                                                   | Commit   |
| ---------------- | ----------------------------------------------------------------------------- | -------- |
| TPL-01           | 3DPOLY's Undo took back a transparent command run since                       | 8609726e |
| TPL-02           | its Undo stopped under UNDO Control None                                      | 8609726e |
| TPL-03           | the jig, unverified on the console: confirmed as PSD-02                       | 5ff7260b |
| TPL-04           | tests (p100–p126)                                                             | 8609726e |
| TPO-01           | a 3D polyline drawn with its linetype                                         | 4b468230 |
| TPO-02, TPO-03   | the anchor's type; ROTATE, SCALE, MIRROR tests                                | 4b468230 |
| SPE-01           | no double-click on a spline                                                   | 9727b8f1 |
| SPE-02, SPE-03   | a preselection of several splines, or of none                                 | 9727b8f1 |
| SPE-04           | the conversion's precision not kept nor shared                                | 9727b8f1 |
| SPE-05 to SPE-08 | a closed spline's Delete floor and knot, own knots, the walk                  | 9727b8f1 |
| SPE-09           | a Z typed at Edit vertex's Move (Fit data's **unverified**)                   | 9727b8f1 |
| SPE-10           | a tilted spline converted to a 2D polyline                                    | 9727b8f1 |
| SPE-11 to SPE-15 | the misses' words, After/Before's Undo, Spanish `_E`, pt-BR labels, tests     | 9727b8f1 |
| PED-01           | `@` at Move and Insert from LASTPOINT                                         | 601379bd |
| PED-02 to PED-04 | Multiple's empty set, the fuzz kept, an arc end's Extend                      | 601379bd |
| PED-05           | JOIN of a Fit polyline                                                        | 601379bd |
| PED-06 to PED-10 | Reverse's tangent, Break's empty piece, EXTEND's words, pt-BR, tests          | 601379bd |
| LPT-01 to LPT-05 | LASTPOINT at SPLINEDIT's prompts; Width's points; locked picks; picks' points | b1a995e0 |
| PSD-01           | Multiple Join's fuzz took no point (p340)                                     | 5ff7260b |
| PSD-02           | 3DPOLY's band one solid ghost, not amber and dashed (d04, d05-2)              | 5ff7260b |
| PSD-03, PSD-04   | Edit vertex's X small and red over the glow; its bands' colour (d01, d02-1)   | 5ff7260b |
| PSD-05           | SPLINEDIT's Moves dragged no ghost of the spline (d01-4, d01-6, d02)          | 5ff7260b |
| PSD-06           | SPLINEDIT's Edit vertex drew no control frame (d01-5)                         | 5ff7260b |
| PSD-07           | a click on 3DPOLY's last vertex dropped (d04, p127)                           | 5ff7260b |
| PSD-08           | 3DPOLY's start X, Y and Z fields (Missing, d05-1)                             | 5ff7260b |

- **SPE-14 in part:** pt-BR lists After/Before `[Antes/Depois]`; the catalog has no per-language
  order of a prompt's keywords, so the order stays English's (pt-BR.md's deviations, Missing).
- **SPE-04** became one object `CadRuntime` hands both tools; whether U restores the precision is
  unprobed (Missing).
- **LPT-03** gave both picks' modes the locked refusal too: **unverified** for a window.
- **PSD-05** gives every SPLINEDIT prompt that draws a band the amber one, the desktop showing
  Move's; the `+` AutoCAD draws on the current point stays unexplained (Missing).
- **Template improvements applied** (2026-11-05): matrix.md's A, C and M rows (the console blocks);
  the desktop's traps — an owner's window on top, `type.ps1`'s focus, drawing through Lisp, the
  Spanish linetype names, a shared helper's shot folder — in `autocad-research`'s `gui.md`
  (template.md's and annex-probes.md's budgets are full).
