# Solid inquiry review (MASSPROP; VSCURRENT's Hidden and Conceptual)

> **Status:** done, 2026-11-05, in two groups: the console blocks (MSP, VSC, VST, with a COM-only
> desktop check, d01), then a desktop session with the owner's mouse (d02–d11) and its block (VSD),
> executed in four commits. What is left is in the coverage entries' **Missing:**
> (`docs/coverage/inquiry.md` MASSPROP; `docs/coverage/view.md` VSCURRENT, -VIEW).
>
> The full plan is in git: `git show 0ce2e08d:docs/plans/solid-inquiry-review.md`. It holds the
> inventory, the probes' index, the matrix of every block, each finding with its evidence, the
> decisions SINQ-D1 to SINQ-D68 and what was refuted.
>
> It owns the visual styles (Hidden and Conceptual: their lines, faces, colours on the screen, the
> locked fade, picking and highlights off 2D Wireframe, the UCS icon there). It cites the LINE review
> (the command line, transparency, undo), ERASE's (`Select objects:`, preselection), View's
> (regeneration, -VIEW), the 3D primitives review (the solid object), the Regions review (the
> booleans), Sweeps and Solid edits (SLC-03's dropped preselection, SED-06's LASTPOINT).

## Summary

**Findings:** 0 critical, 1 high, 12 medium, 13 low, all executed or recorded in Missing.

| Block | What                             | Critical | High | Medium | Low |
| ----- | -------------------------------- | -------- | ---- | ------ | --- |
| MSP   | MASSPROP                         | 0        | 1    | 1      | 3   |
| VSC   | VSCURRENT, the command           | 0        | 0    | 3      | 2   |
| VST   | the visual styles, console side  | 0        | 0    | 2      | 3   |
| VSD   | the visual styles on the desktop | 0        | 0    | 6      | 5   |

The worst:

- **MASSPROP measured a preselection** AutoCAD drops, asking `Select objects:` (MSP-02).
- **Conceptual was fitted to the plot, not the screen**: dark grey faces where AutoCAD shows ivory
  and blue; the light is now found from a sphere's pixels (VSD-01).
- **A click over a hidden edge took the solid behind**, and the rollover drew the edges a style
  hides, at 50 ms a pointer move with 400 solids (VST-02, VSD-02, VSD-03).

**Evidence:** console probes in es-ES and en-US (pt-BR where its words are asked),
`solid-inquiry/p100–p126`, `p200–p222`, `p300–p316`; the earlier `solid/m01–m10`, `region/b02`,
`visualstyle/v01–v06`, `p01–p06`; desktop d01 (COM only) and d02–d11 (es-ES, en-US); on AutoCAD
2027 (ACADVER 26.0, X.118.0.0), the tables of 2026-10-31. The inputs are in
`scripts/research/probes/solid-inquiry/`, the transcripts, plots and screenshots in
`research/probes/solid-inquiry/` (gitignored).

## Index

| Id     | What it was                                                                        | Commit   |
| ------ | ---------------------------------------------------------------------------------- | -------- |
| MSP-01 | two equal moments' axes in the reverse order and sign                              | 860732aa |
| MSP-02 | MASSPROP measured a preselection AutoCAD drops                                     | 860732aa |
| MSP-03 | the Missing said booleans were not measured                                        | 860732aa |
| MSP-04 | a far body's E notation and lost digits (Missing)                                  | 860732aa |
| MSP-05 | tests and citations                                                                | 860732aa |
| VSC-01 | U, UNDO and REDO back to 2D Wireframe were silent                                  | f5877454 |
| VSC-02 | the view commands said `Regenerating model.` in Hidden and Conceptual              | f5877454 |
| VSC-03 | the hidden `3DHIDDEN` was refused                                                  | f5877454 |
| VSC-04 | the saved views' style (-VIEW's Missing)                                           | f5877454 |
| VSC-05 | tests                                                                              | f5877454 |
| VST-01 | Conceptual's shaded regions, wide polylines and thickness (Missing; d07 on screen) | 414c8d1b |
| VST-02 | a click over a hidden edge took the solid behind (d04-c by mouse)                  | 414c8d1b |
| VST-03 | a locked solid's faces not faded (its value redone by VSD-07)                      | 414c8d1b |
| VST-04 | three claims of the Missing                                                        | 414c8d1b |
| VST-05 | tests                                                                              | 414c8d1b |
| VSD-01 | Conceptual's shading took the plot's colours, not the screen's (d02, d03, d06)     | b3fcc7b9 |
| VSD-02 | the rollover and the window's preview drew a solid's hidden edges (d04-a, d05)     | b3fcc7b9 |
| VSD-03 | the rollover off 2D Wireframe cost 50 ms a pointer move with 400 solids            | b3fcc7b9 |
| VSD-04 | a click at `Select objects:` off the plan left LASTPOINT (d10)                     | b3fcc7b9 |
| VSD-05 | no dynamic prompt at `Select objects:` (d10)                                       | b3fcc7b9 |
| VSD-06 | MASSPROP's entry lacked the WHY for its report without the pager (d08, d09, d11)   | b3fcc7b9 |
| VSD-07 | the locked fade in Hidden and Conceptual (d06)                                     | b3fcc7b9 |
| VSD-08 | the UCS icon kept one colour in Hidden and Conceptual (d03)                        | b3fcc7b9 |
| VSD-09 | no face tint under the rollover, the selection, a preview or Ctrl (Missing)        | b3fcc7b9 |
| VSD-10 | LWDISPLAY's widths in the 3D styles (Missing, the scale **unverified**)            | b3fcc7b9 |
| VSD-11 | the 3 px silhouettes clause; the viewport label's `(Fast)` (Missing)               | b3fcc7b9 |

- **VSD-01 grew in the execution:** a ramp fitted to a box's three faces matched them and missed
  the sphere's rim by 70; the light found from 3593 sphere pixels fits it within 0.4 and the boxes
  within 2.
- **Template improvements applied** (2026-11-05): a shading fitted to a sphere on the screen, not a
  plot or a box's three faces (annex-probes.md §2); MASSPROP's and LIST's text window, `_GRAPHSCR`
  before a click (§4).
