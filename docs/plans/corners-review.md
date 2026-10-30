# Corners review (FILLET, CHAMFER)

> **Status:** done, 2026-10-22 — reviewed and executed in one session with skill `command-review`,
> the thirteenth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show 8220990:docs/plans/corners-review.md`.

## Summary

2 high, 14 medium and 8 low findings over four blocks, all executed; one more (CRJ-03) refuted in
the execution. The highs: a selection mode found an object on a locked layer and FILLET or CHAMFER
edited it, where AutoCAD says `The object is on a locked layer.` and asks again (CRP-03: p274) —
now no single object's pick takes a locked find, BREAK's, UCS OBject's and ARRAYPATH's included;
the arc and the bevel took the first line's thickness and no lineweight, where AutoCAD gives them
the lineweight and thickness of the object picked second (CRG-01: p229, p313, p332, p334, p360,
p361). Most of TRIM's analogues held on 2027 — the first Enter ends, the preselection is dropped,
Undo is listed from the start and says all undone with nothing left, CHAMFER cuts an arc segment as
its chord —; the picks' did not (typed object snaps, the locked message, the types refused in
words). Evidence: about 290 console probes in es-ES and en-US and a desktop pass in the owner's
Spanish profile (d01–d13).

## Probes

Console inputs are `scripts/research/probes/corners/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh corners <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` (`dsk.sh setup d01 …`). Transcripts and screenshots are in
`research/probes/corners/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version, FILLETRAD, CHAMFERA, CHAMFERB, TRIMMODE, CHAMMODE, FILLETPOLYARC |
| p100–p169 | the command line: names, repeat, every prompt's text, keywords and letters, FOO, 0, −5, Enter, Space, Multiple, transparency, Undo at each depth and after 'LTSCALE, U, REDO, UNDO 2, MREDO, the preselection, the Spanish messages |
| p170–p239, p310–p339, p360–p388 | what they make: lines, ARC and CIRCLE pairs, polylines and arc segments, Polyline on every vertex, the types they refuse, ellipses and splines, layers, overrides, Z and thickness, normals, UCS |
| p240–p309 | the picks: every point form and LASTPOINT, typed object snaps, locked, Off and frozen layers, the newer of two, every selection mode |
| d01–d13 | the desktop: FILLET's, Shift's and CHAMFER's ghosts, the rollovers, Polyline's prompt, a refused pair, the right button, Multiple with Escape and U, dynamic input, Radius by two points with Polar, Ctrl+Z |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| CRS-01 | a negative radius or distance taken | `Value must be positive.`, asked again | `8220990` |
| CRS-02 | the second distance's default after Enter | CHAMFERB, the first only when typed | `8220990` |
| CRS-03 | Undo after 'LTSCALE kept the fillet | back to the step's history depth | `8220990` |
| CRS-04 | Spanish `R` opened the radius | Trim hidden, `R` is Recortar | `8220990` |
| CRS-05, CRS-06 | CHAMFER's Polyline listing; stale †, marks, 2023 wording | the entries | `8220990` |
| CRS-07 | 2023 citations of the command line | 2027's probes | `8220990` |
| CRS-08 | TRIM's message after `Regenerating model.` | before it, as trim/p164 | `8220990` |
| CRP-01 | typed object snaps refused at the object prompts | the snapped point is the pick | `4f5e307` |
| CRP-02 | a locked object picked in silence | `The object is on a locked layer.` | `4f5e307` |
| CRP-03 | a mode's locked find edited | never taken by a single object's pick | `4f5e307` |
| CRG-01 | the first line's thickness, no lineweight | the second object's lineweight and thickness | `dc13439` |
| CRG-02 | Polyline's short corners all dropped | cut in turn | `dc13439` |
| CRG-03 | an open polyline's ends of three diverged | closed where they cross before its start | `dc13439` |
| CRG-04 | an arc–arc vertex rounded on the other side | towards the chords' turn (p362–p365) | `dc13439` |
| CRG-05 | `1 was divergent` | no such count | `dc13439` |
| CRG-06 | text, MTEXT, hatch, block, dimension in silence | the console's refusals per prompt | `dc13439` |
| CRG-07 | ellipses and splines ignored | CHAMFER's refusal, FILLET's `Unable to fillet curves.`; the rest Missing | `dc13439` |
| CRG-08 | a fillet under −Z written at −Z | at +Z | `dc13439` |
| CRG-09 | the geometry's marks, citations, two weak tests | 2027's probes | `dc13439` |
| CRJ-01 | a ghost of three strokes over the originals | the result in the glow, the originals dimmed | `4b0cf13` |
| CRJ-02 | the rollover on a polyline whole | the segment taken | `4b0cf13` |
| CRJ-04 | Polyline's prompt showed the polyline | every corner previewed | `4b0cf13` |
| CRJ-05 | a refused pair showed both highlighted | the circle-and-slash | `4b0cf13` |
| CRJ-03 | a locked object's rollover | refuted: the scratch test never locked the layer; tests kept | `4b0cf13` |

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/modify.md`'s FILLET and CHAMFER
entries; the points worth a later probe:

- Trim, Angle and mEthod (CHAMMODE, TRIMMODE); FILLET of a spline, of an ellipse at radius 0 or
  with an arc, of an elliptical arc; the per-object linetype scale (not modelled);
- the refusal's words in the cursor's tooltip (d06-1: the tooltip carries the prompt only here);
  the padlock and the fade of locked layers (the Properties review);
- CRG-04's rule outside p219, p322, p362–p365; a locked and an unlocked object under one pick; 0°
  against 180° for a circle a mode finds; the English profile's desktop.

Analogues for the reviews that follow (Pieces): BREAK's single object's pick no longer takes a
locked find but says nothing — its words for one are to probe (CRP-03); a typed object snap at its
pick (CRP-01); the type refusals in the console's words (CRG-06); a ghost that is the result in the
glow over the originals dimmed, through one outcome shared with the click (CRJ-01).

## Template improvements

Applied on 2026-10-22 at the review's close (`annex-probes.md` §4, `matrix.md` row Q, template
§4.8): keywords typed in their global form on a Spanish desktop; a prompt that takes spaces in a
`com send`; every refusal hovered on the desktop; probe ranges by block weight; a scratch harness
option checked before trusting its `differs`.
