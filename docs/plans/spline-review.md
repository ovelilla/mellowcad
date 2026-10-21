# SPLINE review

> **Status:** done, 2026-10-21 — reviewed and executed in one session with skill `command-review`,
> the seventh review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show 91f3e97:docs/plans/spline-review.md`.

## Summary

2 high, 21 medium and 11 low findings over three blocks, all executed; one (the 3D spline) went to
Missing. The highs: every fit spline through three or more points was another curve than AutoCAD's,
its free ends following Bessel's parabola where AutoCAD's have zero curvature (SOB-01), and Enter at
the first prompt ended the command where AutoCAD refuses it in the prompt's words (SPL-01,
ELL-01's analogue). The area this review owns, the spline object, now draws AutoCAD's curve, takes a
tangent as the derivative AutoCAD stores, snaps and measures on the curve, dashes, grips and fills the
palette as AutoCAD 2027 does. Every analogue ELLIPSE left was probed first: Enter, the rail's macros,
TAN/PER from LASTPOINT, the jig's colour and dashed lines and the tangents' DYNMODE 3 box differed and
are fixed; `<a` at the next point matched; MIRROR's −Z normal does not apply to a spline (p320).
Evidence: about 200 console probes in es-ES and en-US, a desktop pass in the owner's Spanish profile
(d00–d10) and two COM-only probes (d11, d12). The review also found why launched desktops opened in
English: the launcher passed no `/language` (`e6439e5`).

## Probes

Console inputs are `scripts/research/probes/spline/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh spline <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` in the same folder. Transcripts and screenshots are in
`research/probes/spline/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p02 | ACADVER; a Fit and a CV spline with MPDUMP and every prompt's flags |
| p100–p157 | names, keywords, Enter, refusals, Undo at every depth, transparency, U/REDO/MREDO |
| p200–p277 | point entry, LASTPOINT, snaps at each prompt, TAN/PER from LASTPOINT, the tangents, properties and planes, each changed mid-command |
| p300–p332 | the curve (natural ends, tangents, closed, CV degrees), snaps on the object, measures, transforms, EXPLODE, BREAK, a DASHED plot, DWG/DXF; p332 AutoCAD's length on a straight spline |
| d00–d10 | the jigs and Ortho, `<45`, DYNMODE 3, the Down list, the right button, the grips and their menus, the Properties palette |
| d11, d12 | through COM: Enter at the start tangent; `_T` after Undo back to one point |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| SPL-01 | Enter at the first prompt ended SPLINE | refused in its words | `936d9e6` |
| SPL-02 | Undo to one point went back to `[start Tangency]` | the two-point prompt kept | `936d9e6` |
| SPL-03 | Enter at the start tangent | refuted (d11) | — |
| SPL-04 | Degree's `2.5` silent, hidden keywords refused | the range refusal, the keywords | `936d9e6` |
| SPL-05 | CV's one-point prompt `Invalid point.` | `Point or option keyword required.` | `936d9e6` |
| SPL-06 | a negative direct distance silent | backwards, as LINE | `936d9e6` |
| SPL-07 | one Spline on the rail | Spline Fit and Spline CV, the ribbon's macros | `936d9e6` |
| SPL-08 | 2023's citations | 2027's probes | `936d9e6` |
| SPL-30 | properties read at the end | fixed at the second point | `936d9e6` |
| SPL-31 | flattened to the first point's plane | Missing: no 3D NURBS | `936d9e6` |
| SPL-32 | LASTPOINT the tangent's point | the last fit point | `936d9e6` |
| SPL-33 | `_TAN` at the end tangent aimed at the point | deferred on circles and arcs | `936d9e6` |
| SPL-34 | `_TAN`/`_PER` at the first point refused | from LASTPOINT | `936d9e6` |
| SPL-35 | rows C, D, H untested | tests citing probes | `936d9e6` |
| SPD-01 | the ghost in the theme's colour | the current colour | `f1d961f` |
| SPD-02 | no amber dashed line | from the anchor at every point prompt | `f1d961f` |
| SPD-03 | the tangents' box a coordinate | a length and an angle | `f1d961f` |
| SPD-04 | the CV frame solid | finely dashed, drawing and selected | `f1d961f` |
| SOB-01 | Bessel's free ends | natural ends | `16788d9` |
| SOB-02 | a tangent's length dropped | the derivative as stored; file version 29 | `16788d9` |
| SOB-03 | a closed CV's degree n − 1 | n | `16788d9` |
| SOB-04 | a closed CV's start | AutoCAD's | `16788d9` |
| SOB-05 | Midpoint refused on a closed spline | halfway from the start | `16788d9` |
| SOB-06 | dashes from the start | centred over the length | `16788d9` |
| SOB-07 | a self-crossing spline's net area | the loops' sum | `16788d9` |
| SOB-08 | measures on chords | quadrature; AutoCAD's length overestimates (p332) | `16788d9` |
| SOB-09 | Nearest off the curve | on it | `16788d9` |
| SOB-10 | Intersection on chords | refined | `16788d9` |
| SOB-11 | EXPLODE's count | `Cannot explode SPLINE` | `16788d9` |
| SOB-12 | the coverage stale | rewritten | `16788d9` |
| SOB-13 | tests pinning our curve | AutoCAD's values, `splines.test.ts`, `splineFiles.test.ts` | `16788d9` |
| SOB-14 | a closed fit spline's tangent branch | kept for files | `16788d9` |
| SOB-15 | SCALE's stored tangent | the curve kept per parameterization | `16788d9` |
| SOB-16 | one Misc group in the palette | Data Points and Misc, the current point editable | `16788d9` |
| SOB-17 | square CV grips | round | `16788d9` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- the 3D spline (each point's Z, p200), which needs 3D NURBS in the kernel;
- the deferred Tangent at the end tangent on objects other than circles and arcs; `<a` at the
  tangents and CV's points; Polar, OTRACK and running snaps on the desktop;
- AutoCAD's length integrator (p332); the palette's Area of a self-crossing spline; the CV frame
  row's English label (912 or 1248); a closed CV spline's control point count in the palette;
- the triangle grip, the hover menus, SPLINEDIT, toLerance and Object; EXPLODE's count line placed
  at the end of the selection (modify.md).

Analogues for the reviews that own them: ERASE's `Select objects:` meets EXPLODE's per-object
refusal lines (SOB-11); a ribbon macro whose answer prints a report line opens the next prompt on its
own line (`feedMacro`, SPL-07).

## Template improvements

Applied on 2026-10-21 at the review's close (template §4.8, §9; `annex-probes.md` §4): the
launcher's Spanish profile; subagents return their reports as text; the palette on a second monitor;
a console answer at a jig checked through COM.
