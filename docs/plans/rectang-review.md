# RECTANG, POLYGON review

> **Status:** done, 2026-10-21 — reviewed and executed in one session with skill `command-review`,
> the fifth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show 8d339c6:docs/plans/rectang-review.md`.

## Summary

2 high, 21 medium and 11 low findings over three blocks, all executed. The highs: Enter at POLYGON's
centre or Edge's first endpoint ended the command where AutoCAD asks again in the prompt's words
(PGN-01, ARC-01's analogue), and TEXT, MTEXT and ATTDEF kept a height each where AutoCAD shares
TEXTSIZE (KEP-01). The area this review owns, the options kept for the session, now follows the
console's OPEN test: what AutoCAD saves in the drawing is on the document and in the file, what it
keeps per drawing unsaved starts again at NEW and OPEN, and what is program-wide or in the registry
lasts the session, noted in the coverage. Of ARC's analogues, Enter (POLYGON), TAN/PER from
LASTPOINT and the jig's colour and dashed lines differed and are fixed; the Ortho base and the
LASTPOINT of a point typed in the box matched. Evidence: about 190 console probes in es-ES and en-US
and one desktop pass with the owner's mouse (d01–d07, the English profile).

## Probes

Console inputs are `scripts/research/probes/rectang/<id>.txt` and
`scripts/research/probes/polygon/<id>.txt`, run with `scripts/research/probe.sh <command> <ids>`;
the desktop's are `scripts/research/probes/rectang/dsk.sh`. Transcripts and screenshots are in
`research/probes/rectang/` and `research/probes/polygon/` (gitignored).

| Id | What it asks |
| --- | --- |
| rectang p00–p12 | the prompts' flags; every option; Enter; `_TAN`, `_PER` from LASTPOINT; `<45`; snaps finding nothing; rectangles of no area |
| rectang p100–p192 | names, refusals, point entry, transparency, undo, properties, UCS, the options' geometry, DXF, the modes line; FILLET's and CHAMFER's corner directions on 2027 |
| rectang p300–p321 | each kept option's storage by the OPEN test; U over the values a command set |
| polygon p00–p12 | the prompts' flags, Enter, Edge, `_TAN`, a point and `@` at the radius, `<45`, LASTPOINT |
| polygon p100–p153 | the start vertex for n = 3–9; UCS, SNAPANG; names; POLYSIDES; point entry; transparency; undo; properties; DXF; refusals |
| d01–d07 | the jigs and Ortho at RECTANG's corner and POLYGON's radius and edge; `<45` at the corner; Pick points; dynamic input; the right button and the Down list |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| REC-01 | a rectangle of no area not made | made, as the console makes it | `d26ed04` |
| REC-02 | `<a` then a distance towards the cursor | along the angle (shared with Edge) | `d26ed04` |
| REC-03 | `_TAN`/`_PER` at the first corner refused | from LASTPOINT | `d26ed04` |
| REC-04 | the ghost in the theme's colour; a line at Pick points | the current colour; none | `d26ed04` |
| REC-05 | the other corner's box a coordinate | the sides' length and width | `d26ed04` |
| REC-06 | `RECTANGLE` unknown | an alias, en and es | `d26ed04` |
| REC-07 | a negative chamfer or fillet taken | `Value must be positive.` | `d26ed04` |
| REC-08 | a negative side at Area, the other side's sign | the given side's | `d26ed04` |
| REC-09 | Rotation after Dimensions kept them | drops them | `d26ed04` |
| REC-10 | the properties read at the end | at the first corner | `d26ed04` |
| REC-11 | Elevation plus the UCS origin's Z | as typed | `d26ed04` |
| REC-12 | Enter at Pick points refused | the cursor's point | `d26ed04` |
| REC-13 | es Area «diferente de cero» | «distinto», an id of its own | `d26ed04` |
| REC-14 | the Rotation prompt written again after a refusal | Missing (RECTANG-D63) | `d26ed04` |
| REC-15 | 2023 citations, stale entry lines | cited to 2027 | `d26ed04` |
| PGN-01 | Enter ended POLYGON | refused in each prompt's words | `9a2eda5` |
| PGN-02 | `_TAN` at the centre and Edge's start refused | from LASTPOINT | `9a2eda5` |
| PGN-03 | the jig white and solid | the current colour, an amber dashed radius | `9a2eda5` |
| PGN-04 | `<a` then a distance at Edge's end | along the angle; the desktop unprobed there | `9a2eda5` |
| PGN-05 | a typed radius's start vertex | AutoCAD's | `9a2eda5` |
| PGN-06 | a radius of 0 or less silent | `Value must be positive and nonzero.` | `9a2eda5` |
| PGN-07 | a zero edge drew nothing | the degenerate polygon | `9a2eda5` |
| PGN-08 | `3.0`, `1e1` taken as a count | refused | `9a2eda5` |
| PGN-09 | Missing's typed point at the radius | it works; tested | `9a2eda5` |
| PGN-10 | 2023 citations, `PG`† | cited to 2027, † gone | `9a2eda5` |
| KEP-01 | three text heights | one TEXTSIZE | `360a1bc` |
| KEP-02 | FILLETRAD, CHAMFERA/B, TEXTSIZE, justification on tools | the document and the file | `360a1bc` |
| KEP-03 | TEXT's Style not current | sets TEXTSTYLE (MTEXT's, ATTDEF's too) | `360a1bc` |
| KEP-04 | Ortho, Snap, Grid session state | the document and the file | `360a1bc` |
| KEP-05 | per-drawing values survived NEW and OPEN | `Tool.onNewDrawing` | `360a1bc` |
| KEP-06 | -MTEXT kept Justify, Rotation, spacing | reset each run | `360a1bc` |
| KEP-07 | U left a command's values | undone with the command | `360a1bc` |
| KEP-08 | the rule on system variables stale | the four storage kinds | `360a1bc` |
| KEP-09 | registry variables unnoted | noted in the coverage | `360a1bc` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- the desktop in the owner's Spanish profile (the launched instance opened the English one a fourth
  time): the dynamic-input labels of RECTANG and POLYGON, with ARC's, CIRCLE's and PLINE's pending
  Spanish items;
- REC-14 and PGN-04 on the desktop; Escape once and twice and whether options set before it stay;
- MDI's NEW on the desktop (the console has none, p300; OPEN stood in), registry against
  program-wide across a restart, whether U takes back an F8 or SNAP's change, CIRCLERAD and
  POLYSIDES under U (RECTANG-D48), GRIDUNIT (none here).

Analogues for the reviews that own them: a command whose prompt the trace marks UseBasePoint false
may still bend under Ortho when it draws its own jig (d01, d02) — ELLIPSE's and SPLINE's later
points are probed on the desktop; any tool keeping an option checks its storage with the OPEN test
(the rule in `cad-tools.md`); a prompt's dynamic-input fields are per command (d05).

## Template improvements

Applied on 2026-10-21 at the review's close (`annex-probes.md`, template §1.3 and §9): UseBasePoint
false does not predict Ortho where the command draws its own jig, and `<a` at such a prompt is
honoured on the desktop though the console ignores it; check a restored DYNMODE with Lisp; a desktop
pass with DYNMODE 3 at every point prompt; an area spanning every command settles storage with the
console's OPEN test.
