# CIRCLE review

> **Status:** done, 2026-10-21 — reviewed and executed in one session with skill `command-review`,
> the third review of `docs/coverage/roadmap.md`'s order, the owner having waived the wait for
> approval. The full plan (matrices, findings, decisions, refuted suspicions, rules ↔ code) is in
> git: `git show 1138a28:docs/plans/circle-review.md`.

## Summary

5 high, 18 medium and 10 low findings over four blocks, all executed but COB-03, handed to the
Inquiry review. The highs: the ribbon's Tan, Tan, Tan refused (CTN-01), 2P with two Tangents and a
Tangent among 2P's or 3P's points drawing a circle that touches nothing (CTN-02, CTN-05), Enter with
no default ending CIRCLE (CIR-05), and a command started from the rail neither repeated by Enter nor
named by U, LINE's too (CIR-09). CIRCLE, its rail entries (run as the ribbon's macros), the circle
object and every tangent construction — Ttr, TTT, the deferred Tangent and Perpendicular at 2P, 3P,
the radius and the centre, solved by a pure Apollonius solver and AutoCAD's least-squares choice —
now behave as AutoCAD 2027's console and desktop show them at every prompt probed. Evidence: 222
console probes in es-ES and en-US and two desktop passes with the owner's mouse (d01–d15); every
test that reproduces AutoCAD cites its probe.

## Probes

Console inputs are `scripts/research/probes/circle/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh circle <ids>` in es-ES and en-US;
the desktop's are `dsk.sh` in the same folder. Transcripts, plots and screenshots are in
`research/probes/circle/` (gitignored). Setup of p01–p10: circle A (0,0) r10, circle B (40,0) r10,
line L (−20,−15)–(60,−15).

| Id | What it asks |
| --- | --- |
| p01, p02 | 3P `_TAN`×3 → (20,−4.5) r10.5; 2P `_TAN` `_TAN` → (10,0) r20 |
| p03, p04, p08, p09, p10 | one Tangent or Perpendicular among 2P's and 3P's points |
| p05, p06, p07 | `_TAN` at the centre (taken), `_TAN` at the radius (the circle tangent to B, r18.2843), `_PER` at the radius (r35) |
| p11–p15 | `'-COLOR`, `'THICKNESS`, `'CLAYER`, `'ELEVATION` mid-CIRCLE: the circle takes them (made at the end) |
| p16, p18, p20 | 2P's second point with a Z or `*`: `Invalid 2D point.` |
| p17, p19 | the radius by a 3D point is its 3D distance (r13); `*20,0` at the radius in UCS Z 30 |
| p21 | `_CIRCLED`, `_CIRCLE2P`, `_CIRCLE3P`: unknown commands |
| p100–p104 | names and aliases (`_C`, `_.CIRCLE`, es `CIRCULO` / `C`), repeat, `'_CIRCLE` at LINE |
| p105–p107, p191, p192 | the ribbon's macros typed: echoes, Enter repeating `CIRCLE` |
| p108–p120 | the centre's, radius's and diameter's answers: `FOO`, `_D`, Enter, `2`, `0`, `-5`, `_3P`, es `D`, CIRCLERAD 0 and 7 |
| p121–p130 | 2P's and 3P's answers: `FOO`, equal and collinear points (`*Invalid*`), Enter at each |
| p131–p134 | `_U` at each prompt; `_LINE` at the radius |
| p135–p149, p163–p168, p172–p179 | point entry: direct distance, `<45`, `@`, `@d<a`, `#`, `*`, LASTPOINT after each prompt, a 2P first point with a Z, a diameter by a 3D point, Ortho with a typed point |
| p150–p156, p169–p171 | overrides at each prompt; `'ZOOM E`, `'-PAN`, `'ORTHOMODE`, `'-OSNAP`, `'LINE` |
| p157–p161, p176, p193 | U, UNDO 2, REDO, MREDO and their echoes (untraced) |
| p162 | CIRCLERAD set by 2P, 3P and the diameter |
| p180–p190 | 3D points at 3P's and 2P's later points, typed (refused) and snapped (flattened) |
| p187, p188 | Ttr's radius in Spanish, `Precise radio del círculo`; POLYGON's `Precise radio de círculo` |
| p194–p196 | Ttr `FOO`; Ortho with a direct distance at 2P and 3P |
| p200–p208 | properties: layer, colours (ACI, true colour), DASHED, lineweight, CELTSCALE, ELEVATION, THICKNESS, rotated and tilted UCS |
| p210–p218 | snaps on a circle: CEN, QUA (and in UCS Z 30), NEA, TAN from a point, INT of two circles |
| p220–p222 | DXF and DWG out and back in; the console's clipboard (none) |
| p230–p233 | plots of DASHED circles of 0.9 to 4.55 periods, a lineweight, a flipped and a tilted circle |
| p240–p242 | MIRROR keeps the normal; AREA Object on a circle, typed point; on a tilted one |
| p300–p310 | Ttr: typed points, the radius's answers, Enter at each prompt, `_TAN` on nothing |
| p311–p329, p378–p380 | Ttr's objects (line, circle, arc as its circle, polyline segment, ellipse, spline, text), which of the fitting circles, heights, UCS Z 30 |
| p330–p337 | TTT, 2P TT, and one Tangent or Perpendicular with points, by pick: the choice rule |
| p338–p347 | Tangent and Perpendicular at the radius, the diameter and the centre (from LASTPOINT) |
| p350–p367 | `_TAN` and `_PER` finding nothing at every point prompt |
| p370–p377 | Tangent on a line at 2P and 3P; Enter with CIRCLERAD 0 at the radius and the diameter |
| d01–d02 | the ribbon's Center, Diameter, 2-Point and 3-Point: echoes; the ghost in CECOLOR, the amber dashed size line; no chord at 2P, nothing after 3P's first point |
| d03–d04 | Tan, Tan, Radius and Tan, Tan, Tan: the Deferred Tangent marker and tooltip, no highlight; `Circle does not exist.`; `Invalid 2D point.` at TTT's third point |
| d05–d07 | dynamic input at the centre and the radius (`• 4.0000` and Diameter in the Down list); the right button's menu at the radius; Ctrl+Z inside CIRCLE |
| d08–d11 | the grips (centre, four quadrants, the radius shown on hover, no menu), a quadrant drag, the palette, a double-click (Quick Properties) |
| d12–d15 | Ortho at the radius but not at 2P's or 3P's picks; Ttr's click on nothing or an ellipse; DASHED circles on screen; grips and a typed radius in UCS Z 30 |


## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| CIR-01 | 2P's and 3P's later points took a Z, `*`, `<a` | 2D prompts, `Invalid 2D point.` | `772cdcd` |
| CIR-02 | a radius or diameter by a point measured in plan | in 3D | `772cdcd` |
| CIR-03 | `'THICKNESS` mid-CIRCLE | refuted: no THICKNESS command here (Workspace's) | — |
| CIR-04 | the rail's modes echoed this app's names | the ribbon's macros, `_circle` `_d` / `_2p` / `_3p` | `772cdcd` |
| CIR-05 | Enter with no default ended CIRCLE | refused in each prompt's words (CTN-09, CTN-10 merged) | `772cdcd` |
| CIR-06 | 3P at different heights tilted | flat in the first point's plane | `772cdcd` |
| CIR-07 | a degenerate 2P or 3P silent | `*Invalid*` and the end | `772cdcd` |
| CIR-08 | Ttr's radius in POLYGON's Spanish words | a prompt of its own (CTN-15 merged) | `772cdcd` |
| CIR-09 | a rail start not repeated, its step unnamed | a command run, LINE's too | `772cdcd` |
| CIR-10 | 3P's 2D prompts | merged into CIR-01 | `772cdcd` |
| CIR-11 | 2P's stale WHY and Missing | p190 | `772cdcd` |
| CIR-12 | Ortho bent 2P's and 3P's picks | no base there | `772cdcd` |
| CTN-01 | TTT refused | solved (Apollonius) | `2af4083` |
| CTN-02 | 2P TT another circle | the line of centres | `2af4083` |
| CTN-03 | the radius's Tangent to the tangent line's touch | the circle tangent to the object | `2af4083` |
| CTN-04 | the centre's Tangent took the raw pick | measured from LASTPOINT | `2af4083` |
| CTN-05 | one Tangent among the points not tangent | deferred and solved | `2af4083` |
| CTN-06 | a Tangent on a line refused at 2P, 3P | taken | `2af4083` |
| CTN-07 | a Perpendicular on a circle at 3P taken | refused | `2af4083` |
| CTN-08 | Ttr chose by the sum of distances | sum of squares | `2af4083` |
| CTN-11 | Ttr refused a typed Tangent and point | taken | `2af4083` |
| CTN-12 | table 20418 never said | said | `2af4083` |
| CTN-13 | Ttr at the elevation | the objects' common height | `2af4083` |
| CTN-14 | the coverage entry on tangents | rewritten | `2af4083` |
| COB-01 | a circle's dashes from screen east, unfitted | from its start, whole periods | `c97a8b2` |
| COB-02 | Quadrant on the WCS in a rotated UCS | along the UCS | `c97a8b2` |
| COB-03 | AREA Object refused a typed point | to the Inquiry review | — |
| COB-04 | the grips' Missing on Ortho | reworded, tested | `c97a8b2` |
| COB-05 | Circumference and Area read-only | editable | `c97a8b2` |
| COB-06 | Center in a group of its own | one Geometry group | `c97a8b2` |
| CDK-01 | the ghost in the theme's colour | the current colour | `1138a28` |
| CDK-02 | the size line solid | amber, dashed | `1138a28` |
| CDK-03 | chords at 2P and 3P | none | `1138a28` |
| CDK-04 | Ttr's pick highlighted | the Deferred Tangent marker and tooltip | `1138a28` |
| CDK-05 | a double-click's Quick Properties | to Missing | `1138a28` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- the desktop in the owner's Spanish profile (the launched instance opened the English one twice):
  the palette's `Centro X`, the deferred markers' tooltips, Quick Properties, and PLINE's pending
  desktop items (`git show 4c9f5e0:docs/plans/pline-review.md`, "Still open");
- Ctrl+Z at the radius with dynamic input on wrote another refusal than the console's (d07);
- TTT with nothing fitting beyond d04's case, the deferral at mixed heights, 2P with two lines or
  concentric circles, a Perpendicular on a circle at 3P's later points; the Tangent marker's place
  over an ellipse; a Quadrant on a tilted circle; Ortho on a quadrant drag on AutoCAD's side.

Analogues for the reviews that own them: ARC lays its linetype and takes its Quadrant snap as the
circle did before COB-01 and COB-02, claims 3P's plane of the three (CIR-06), and its rail modes
are mellowcad's names (CIR-04); every tool without `defersSnap` now refuses a Tangent or
Perpendicular finding nothing where it took the raw pick (ARC's, ELLIPSE's points: probe them);
AREA Object, DIMSPACE and TEXTEDIT refuse a typed point at their `objectOrLast` prompt (COB-03,
p241); a command adding its object at its end takes its properties then, except where AutoCAD fixes
them at the start (PLINE p39 against CIRCLE p11).

## Template improvements

Applied on 2026-10-21 at the review's close (annex-probes.md §2–§5): read the trace's flags before
the desktop; the ribbon's macros from acad.cuix; a choice among solutions as a data table; scratch
tests' output to a file; the desktop traps of a string answer with a space and FILEDIA; quit AutoCAD
when the desktop work is done.
