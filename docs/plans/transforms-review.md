# Transforms review (ROTATE, SCALE, MIRROR, STRETCH)

> **Status:** done, 2026-10-22 — reviewed and executed in one session with skill `command-review`,
> the tenth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show 178a489:docs/plans/transforms-review.md`.

## Summary

5 high, 24 medium and 13 low findings over six blocks, all executed. The highs: a point at
SCALE's factor scaled by its distance from the base, where AutoCAD divides it by half the largest
side of the set's extents, so a click 50 from the base of a 100-long line leaves it as it is
(SCL-03: p219, desktop d06, d07); ROTATE's new angle had no `[Points]` and no `<default>`, and Enter
there ended unturned (REF-01); mirrored TEXT and MTEXT only moved their anchor, where MIRRTEXT 0
mirrors the box and keeps the text reading as before (MIR-01: p283, p290–p294); STRETCH never bent
an arc (STR-01: p271). The Reference options, the area this review owns, now answer as AutoCAD:
ROTATE's reference angle is measured by the runtime as SCALE's reference length is
(` Specify second point:`, LASTPOINT at the base), both commands' defaults are the last run's, 0
and negatives are refused, and a measure survives a transparent command. ROTATE, SCALE and MIRROR
drag the set as itself along the amber dashed line, as MOVE does. The analogues MOVE left held:
STRETCH's look and zero displacement are MOVE's (MOVE-D3, D6), its `Specify displacement` reads from
LASTPOINT (STR-05); the copies of ROTATE, SCALE and MIRROR go in drawing order (CPY-03); U after an
empty run names it (STP-01). Evidence: about 200 console probes in es-ES and en-US and a desktop
pass in the owner's Spanish profile (d01–d12).

## Probes

Console inputs are `scripts/research/probes/transforms/<id>.txt` (`.plain.txt` untraced, `.es.txt`
/ `.en.txt` one locale only), run with `scripts/research/probe.sh transforms <ids>`; the desktop's
are `dsk.sh` with `lib-dsk.sh` (MOVE's `drag.ps1`). Transcripts and screenshots are in
`research/probes/transforms/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | ACADVER, `_VERNUM` |
| p100–p159 | ROTATE: names; Copy; Reference typed, by points, Points, Enter at each prompt; defaults at AUPREC 0 and 4 and after Reference; refusals; point forms, `<30`, snaps, Ortho; transparency; U, REDO, MREDO, zero turns; every type; Copy out of order; properties, Z, UCS, ANGDIR, ANGBASE; selection after |
| p160–p219 | SCALE: names; the factor's refusals and defaults; Copy; Reference and its refusals; Points; point forms and snaps; transparency (p204); undo; every type; Copy out of order; Z, UCS; selection; a point at the factor over ten selections (p219) |
| p220–p294 | MIRROR: names; refusals, Enter, equal points; point forms, snaps, Ortho, transparency; Yes, No, U; every type, text and MTEXT (p283, p290–p294); a set out of order. STRETCH: names; a zero displacement; LASTPOINT; Displacement; every selection mode; every type caught in part. The four commands' selection afterwards |
| d01–d12 | ROTATE's drag, Copy, Reference and Points with the mouse; SCALE's drag, its factor against the distance, Reference; STRETCH's drag; MIRROR's drag and Erase; the right button and Polar, Ortho at ROTATE's angle |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| SCL-01 | 0, a negative or `@` at the factor ended SCALE | refused, asked again | `e2abfcd` |
| SCL-02 | Enter after a Reference run scaled by 1 | every run sets the default | `e2abfcd` |
| SCL-03 | a point at the factor scaled by its distance | its distance over half the set's extents | `e2abfcd` |
| SCL-04 | Copy's copies in pick order | drawing order (`drawingOrder.ts`) | `e2abfcd` |
| SCL-05 | a tiny factor applied in silence | Missing, the threshold unverified | `e2abfcd` |
| SCL-06 | 2023 citations, a false JSDoc | 2027 probes | `e2abfcd` |
| SCL-07 | `ES`† | verified | `e2abfcd` |
| SCL-08 | paths holding untested | under test | `e2abfcd` |
| REF-01 | the new angle without `[Points]` and `<default>` | built | `e57fc57` |
| REF-02 | the reference's `Specify second point:` | the runtime's ` Specify second point:` | `e57fc57` |
| REF-03 | ROTATE's defaults after Reference | the run's | `e57fc57` |
| REF-04 | LASTPOINT after the reference's picks | the base | `e57fc57` |
| REF-05 | a refusal at the reference's second point | the two points start over | `e57fc57` |
| REF-06 | Enter at the reference's second point ended ROTATE | goes on | `e57fc57` |
| REF-07, REF-08 | 0 or a negative reference or new length taken | refused | `e57fc57` |
| REF-09 | a transparent command dropped a measure's first point | kept | `e57fc57` |
| REF-10 | Enter at Points' second point | Missing | `e57fc57` |
| ROT-01 | `<30` at the rotation angle an override | the angle | `5663e1a` |
| ROT-02 | Copy's copies in pick order | drawing order | `5663e1a` |
| ROT-03 | the entry's false claims, `GI`† | corrected | `5663e1a` |
| ROT-04 | tests without probes, no `DERIVED` row | cited, added | `5663e1a` |
| JIG-01, JIG-02 | ROTATE's and SCALE's dashed blue ghost | the set as itself, originals faded (`transformDrag.ts`) | `92356e9` |
| JIG-03 | a line from the base at Reference's first prompt | nothing; the runtime's amber line at the second | `e57fc57`, `92356e9` |
| JIG-04 | the fields showed the dragged reading | the default (SCALE's factor the dragged one) | `92356e9` |
| JIG-05 | MIRROR's dashed ghost, gone at Erase | as itself, kept at Erase | `92356e9` |
| MIR-01 | mirrored text moved only its anchor | MIRRTEXT 0's readable mirror | `59b7642`, `9eb0663` |
| MIR-02 | Enter at a mirror point ended MIRROR | `Invalid 2D point.` | `59b7642` |
| MIR-03 | a line of no length ended in silence | `Points must be distinct.` | `59b7642` |
| MIR-04 | No's copies in pick order | drawing order | `59b7642` |
| MIR-05 | a mirrored hatch's angle | Missing, unverified | `59b7642` |
| MIR-06 | `SI`†, drift | corrected | `59b7642` |
| STR-01 | arcs never bent | one end caught refits, the chord height kept | `9eb0663` |
| STR-02 | a polyline arc segment kept its bulge | its chord height kept | `9eb0663` |
| STR-03, STR-04 | Last and ALL moved whole; duplicates changed the stretch | each object as first added | `9eb0663` |
| STR-05, STR-07 | `Specify displacement` from the UCS origin | from LASTPOINT, with its Displacement | `9eb0663` |
| STR-06 | a dimension's line followed both origins | its own point | `9eb0663` |
| STR-08 | `EI`†, drift | corrected | `9eb0663` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- SCALE's k in a turned UCS; Enter at Points' points and a tiny factor with a real cursor (the
  console reads its fixed one); a block reference's scale after SCALE;
- Escape and the right button at the Reference prompts and at MIRROR's; `<a` at ROTATE's reference
  and new angle; Copy's look under SCALE;
- the runtime's amber second-point line at other commands' measures (FILLET's radius, OFFSET's
  distance): changed with ROTATE's and SCALE's, unprobed there;
- STRETCH: Previous and Group, a preselection's geometry, a 3D displacement on 2027, an arc with
  both ends caught and its centre out, a dimension with both origins caught and its point out;
- MIRROR: a hatch at a non-zero angle, text in a mirrored block, a text reflected onto the
  vertical.

Analogues for the reviews that follow: OFFSET's and FILLET's distances by two points now keep their
first point across a transparent command and draw the amber line (REF-09, JIG-03); a transparent
command's resume asks a measure's second point again (p204).

## Template improvements

Applied on 2026-10-22 at the review's close (`annex-probes.md` §4, template §4.8 and §9): a jig's
reading checked against a click at a known distance; a desktop surprise sent at once to the
subagent owning the prompt; a scratchpad folder per subagent; 70 probe ids for a command with
options; a pause after typing a command before the first desktop pick.
