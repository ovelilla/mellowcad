# ELLIPSE review

> **Status:** done, 2026-10-21 — reviewed and executed in one session with skill `command-review`,
> the sixth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show ec4603a:docs/plans/ellipse-review.md`.

## Summary

2 high, 16 medium and 12 low findings over three blocks, all executed but two, which went to
Missing. The highs: Enter (and the right button's) at any ELLIPSE prompt but Included angle ended
the command where AutoCAD refuses in the prompt's words (ELL-01, ARC-01's and PGN-01's analogue),
and Nearest found nothing on an ellipse (EOB-01). The area this review owns, the ellipse object, now
snaps, dashes, grips and fills the palette as AutoCAD 2027 does; MIRROR's −Z normal and STRETCH of
an elliptical arc stay Missing. Every analogue ARC and RECTANG/POLYGON left was probed first: the
rail's macros, Enter, TAN/PER from LASTPOINT, the jig's colour and dashed lines and the DYNMODE 3
box differed and are fixed; Ortho and `<a` on the desktop matched; ELLIPSE keeps no option, so no
OPEN test was due. Evidence: about 240 console probes in es-ES and en-US and one desktop pass in the
owner's Spanish profile (d01–d08), the first review to see the Spanish labels.

## Probes

Console inputs are `scripts/research/probes/ellipse/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh ellipse <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` in the same folder. Transcripts and screenshots are in
`research/probes/ellipse/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p07 | ACADVER; each mode with MPDUMP and its flags; ELLIPSEC and ELLIPSEARC unknown; nothing kept by the next run |
| p100–p199 | names, keywords, Enter, refusals, point entry, LASTPOINT, transparency, undo |
| p200–p299 | the geometry of each mode, the Rotation band, whole-turn arcs, properties, planes, snaps at each prompt, TAN/PER from LASTPOINT, `<45` |
| p300–p338 | snaps on the object, MIRROR, ROTATE, SCALE, STRETCH, BREAK, AREA; a DASHED plot |
| d01–d08 | the jig and Ortho, `<45`, DYNMODE 3, the Down list, the right button, the grips and their drags, the Properties palette |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| ELL-01 | Enter ended ELLIPSE | refused in each prompt's words | `9f3c0a0` |
| ELL-02 | LASTPOINT the last point given | the centre | `9f3c0a0` |
| ELL-03 | a point at Rotation read by its distance | its heading from the centre | `9f3c0a0` |
| ELL-04 | a zero or negative distance silent | `Value must be positive and nonzero.` | `9f3c0a0` |
| ELL-05 | the rail's ELLIPSEC and ELLIPSEARC | the ribbon's `_ellipse _c`, `_a` | `9f3c0a0` |
| ELL-06 | a point at Included taken as the end | its heading as the sweep | `9f3c0a0` |
| ELL-07 | `_TAN`/`_PER` at the first point refused | from LASTPOINT | `9f3c0a0` |
| ELL-08 | an arc's properties read at the end | when its ellipse is fixed | `9f3c0a0` |
| ELL-09 | a zero first axis asked again | `*Invalid*` after the distance | `9f3c0a0` |
| ELL-10 | es `E` (cEntro) refused | the prompt's keyword | `9f3c0a0` |
| ELL-11 | the measure's hidden keyword refused | re-asks | `9f3c0a0` |
| ELL-12 | the centre mode's endpoint refused a Z | taken, projected | `9f3c0a0` |
| ELL-13 | `<45` at the start angle an override | the angle | `9f3c0a0` |
| ELL-14 | a 3D point at the distance in plan | Missing | `9f3c0a0` |
| ELL-15 | 2023 citations | 2027's probes | `9f3c0a0` |
| EDK-01 | the ghost in the theme's colour | the current colour | `d0f622b` |
| EDK-02 | the jig's lines solid | amber, dashed | `d0f622b` |
| EDK-03 | the other endpoint's box a coordinate | the axis's length and angle | `d0f622b` |
| EOB-01 | Nearest found nothing | `closestOnEntity` | `2805161` |
| EOB-02 | Midpoint on an arc refused | halfway along its length | `2805161` |
| EOB-03 | dashes unfitted | the circle's and the arc's rules | `2805161` |
| EOB-04 | MIRROR kept +Z, negated parameters | Missing: a −Z ellipse leaves `readsInPlan` | `2805161` |
| EOB-05 | STRETCH never reshaped an arc | Missing: no rule fits yet | `2805161` |
| EOB-06 | the palette's rows | AutoCAD's, one Geometry group | `2805161` |
| EOB-07 | the centre grip only | quadrants and an arc's ends | `2805161` |
| EOB-08 | a whole turn stored two ways | one whole ellipse | `2805161` |
| EOB-09 | parameters unnormalised | start in [0, 2π) | `2805161` |
| EOB-10 | a tie kept the turned axis | the first | `2805161` |
| EOB-11 | the coverage stale | rewritten | `2805161` |
| EOB-12 | tests uncited | cited, `ellipseFiles.test.ts` | `2805161` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- the palette's and the dynamic input's English labels (the desktop ran in the Spanish profile);
  the end grips drawn square where AutoCAD draws arrows; a whole ellipse's angle rows read-only,
  AutoCAD's edit there unprobed;
- MIRROR's −Z normal, which needs the flat edits (TRIM, EXTEND, BREAK, OFFSET, JOIN, HATCH) to read a
  −Z ellipse first; STRETCH's rule for an elliptical arc (p324–p338, p332 unexplained);
- `<a` at Rotation and Included; Escape mid-ELLIPSE; Polar; EXT along an elliptical arc; a closed
  arc's kept start (p220).

Analogues for the reviews that own them: SPLINE's jig, rail and Enter are probed against ELL-01,
ELL-05, EDK-01/02; a lone angle box that takes `<a` as its answer says `answersAngleOverride()`
(ELL-13); a tool's object mirrored about a line may need a −Z normal in AutoCAD (EOB-04: probe
SPLINE's).

## Template improvements

Applied on 2026-10-21 at the review's close (`annex-probes.md` §4, template §4.8): the English labels
planned apart when the desktop runs in Spanish; Escape with the Down list open cancels the command;
subagents given disjoint prompts as well as rows.
