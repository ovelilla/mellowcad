# Pieces review (BREAK, BREAKATPOINT, JOIN, EXPLODE)

> **Status:** done, 2026-10-22 — reviewed and executed in one session with skill `command-review`,
> the fourteenth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show a8a20e9:docs/plans/pieces-review.md`.

## Summary

1 critical, 3 high, 16 medium and 14 low findings over seven blocks, all executed. The critical:
JOIN with a line at an inner vertex of a polyline, or at a closed one, chained the polyline's
segments apart and removed it whole, losing a segment in silence, where AutoCAD joins nothing
(JNG-01: p373, p388, p389). The highs: collinear lines joined into a new polyline where AutoCAD
keeps the source LINE (JNG-02: p300); a polyline in JOIN's set never kept its handle and properties
(JNG-03: p343, p378–p380); Enter at BREAK's break points ended it where AutoCAD refuses and asks
again (BRS-01: p146, p149–p151, desktop d15). Corners' analogues: BREAK's pick now says AutoCAD's
locked line, and FILLET's too in a mixed find (BRP-01, BRP-02, BRP-05); typed object snaps answer
BREAK's `Select object:` (BRP-03); its refusals per type held (CRG-06's analogue); its ghost is
the result in the glow over the object faded (BRJ-01). Evidence: about 275 console probes in es-ES
and en-US and a desktop pass in the owner's Spanish profile (d01–d15).

## Probes

Console inputs are `scripts/research/probes/pieces/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh pieces <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` (`dsk.sh setup d01 …`). Transcripts and screenshots are in
`research/probes/pieces/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version, PICKFIRST, PEDITACCEPT, OSMODE |
| p100–p179 | BREAK's command line and picks: locked objects, typed object snaps, every mode, names, FOO and Enter at each prompt, point forms, transparency, undo, the preselection |
| p180–p230 | what BREAK makes: refusals per type, objects not level with the UCS, properties, every type's geometry, handles |
| p240–p265 | EXPLODE: names, polylines, blocks, MTEXT, dimensions, hatches, ellipses, U's order, ERASE then U |
| p300–p390 | JOIN: names, prompts, what each kind of set makes, properties, Z, widths, the source step, Convert to circle, a window's order |
| p395 | FILLET's Window finding a locked and an unlocked line |
| d01–d15 | the desktop: BREAK's rollover and ghost on a line, a circle, a polyline; First point; BREAKATPOINT; locked and refused objects; JOIN and EXPLODE; the right button; dynamic input; Polar and Ortho; running snaps; Enter through COM |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| JNG-01 | a polyline's segment lost at an inner vertex, a closed one opened | joins nothing, whole objects only | `5506f98` |
| JNG-02 | collinear lines into a polyline | the source LINE stretched | `5506f98` |
| JNG-03 | a polyline's handle and properties lost | the set's first polyline kept | `5506f98` |
| JNG-04 | arcs of one circle into a polyline or nothing | the source ARC; Convert to circle | `5506f98` |
| JNG-05 | a window's set read oldest first | newest first, JOIN's only | `5506f98` |
| JNG-06, JNG-08 | splines, elliptical arcs, tilted planes unsaid | Missing, with probes | `5506f98` |
| JNG-07 | a false `WHY` of 3D joins | rewritten with p347, p358 | `5506f98` |
| JNS-01 to JNS-03 | no report, stale citations, the source alone | 2027's reports; cited; Missing | `5506f98` |
| BRS-01 | Enter at a break point ended BREAK | refused in its words, asked again | `e7acc2d` |
| BRS-02 | First at the re-asked second point refused | ends BREAK unchanged | `e7acc2d` |
| BRS-03 | Group, †, 2023 citations | the entry and tests | `e7acc2d` |
| BRP-01, BRP-02 | locked objects passed over in silence | the locked line, the newest under the box | `e7acc2d` |
| BRP-03 | typed object snaps refused at `Select object:` | the snapped point is the pick | `e7acc2d` |
| BRP-04 | a typed pick off the screen finds | Missing (`Select objects:`) | `e7acc2d` |
| BRP-05 | FILLET's mixed locked find silent | one line per locked object | `e7acc2d` |
| BRP-06 | the box read relative at a break point | absolute | `e7acc2d` |
| BRG-01 | tilted and −Z objects refused | polylines cut in their OCS; the rest Missing | `f356c46` |
| BRG-02, BRG-03 | 2023 citations, untested cells | 2027's probes, tests | `f356c46` |
| BRJ-01, BRJ-03 | the whole object glowed, the removed piece dashed red | the outcome: kept in the glow, the object faded | `f356c46` |
| BRJ-02 | a blue rollover | FILLET's, one helper | `f356c46` |
| EXP-01 | a dimension refused | kept, with a `WHY` and Missing (no SOLID) | `ee7e455` |
| EXP-02 | hatches refused at the count | a pattern into lines, a SOLID named | `ee7e455` |
| EXP-03 | an ellipse counted refused | passes, named | `ee7e455` |
| EXP-04 | MTEXT's texts in the attachment's column | Left at each line's left end | `ee7e455` |
| EXP-05 | U put the exploded polyline last | back in its place, ERASE's and BLOCK's too | `ee7e455` |
| EXP-06 | MTEXT's line positions by the font | the Text review | — |
| EXP-07, EXP-08 | citations, untested cells, entry | 2027's probes, tests | `ee7e455` |

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/modify.md`'s BREAK, JOIN and EXPLODE
entries; the points worth a later probe:

- JOIN's single-source step, splines, elliptical arcs, −Z and tilted objects, the order of a
  fence's and the named modes' finds, a run that both grows a polyline and makes new ones;
- BREAK of a tilted or −Z arc, circle or ellipse (the rule p188 alone does not settle), of a spline;
- EXPLODE of a dimension (a SOLID object first), an associative hatch's message, the hatch lines'
  order (`ERASE _L` takes another);
- the English profile's desktop; the browser's look of the new ghost (only the harness's strokes
  were read).

Analogues for the reviews that follow (Arrays): ARRAYPATH's path pick passes no `locked` and says
nothing of one — its words are to probe (BRP-01); a typed object snap at its pick (BRP-03); its
rollover (BRJ-02, `rollover`); a ghost that is the outcome shared with the click (BRJ-01).

## Template improvements

Applied on 2026-10-22 at the review's close (`annex-probes.md` §3–§5): a mixed
locked find probed for every command sharing a pick; a scratch test asserting on what the drawing
holds; the ghost under a far marker; an Enter confirmed through COM between two answers.
