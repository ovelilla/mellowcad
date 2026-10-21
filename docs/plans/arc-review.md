# ARC review

> **Status:** done, 2026-10-21 — reviewed and executed in one session with skill `command-review`,
> the fourth review of `docs/coverage/roadmap.md`'s order, the owner having waived the wait for
> approval. The full plan (matrices, findings, decisions, refuted suspicions, rules ↔ code) is in
> git: `git show 1fb8351:docs/plans/arc-review.md`.

## Summary

3 high, 10 medium and 9 low findings over three blocks, all executed. The highs: Enter at any ARC
prompt after the first ended the command (ARC-01, CIRCLE's CIR-05 again), a centre mode's end read
`@` from the start instead of the centre (ARC-02), and the arc's middle grip changed the radius
where AutoCAD's Stretch bends the arc through the cursor (AOB-05). Every analogue CIRCLE's review
left held and is fixed: 3P flat in the first point's plane, a Tangent or Perpendicular with no base
from LASTPOINT, a degenerate arc `*Invalid*` and the end, the rail's modes as the ribbon's macros,
the jig in the current colour with amber dashed lines, the arc's linetype and Quadrant laid as the
circle's. ARC and the arc object now behave as AutoCAD 2027's console and desktop show them at every
prompt probed. Evidence: 214 console probes in es-ES and en-US and one desktop pass with the owner's
mouse (d01–d10, the English profile); every test that reproduces AutoCAD cites its probe.

## Probes

Console inputs are `scripts/research/probes/arc/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh arc <ids>` in es-ES and en-US; the
desktop's are `dsk.sh` in the same folder. Transcripts, plots and screenshots are in
`research/probes/arc/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | ACADVER, `_VERNUM` |
| p01–p05 | 3P, CSE, SCE by typed points with MPDUMP; `FOO` at each prompt; the flags |
| p06, p07 | 3P through points at different heights; a Z, `*`, `<45` at the later prompts |
| p08–p17 | `_TAN` and `_PER` at every prompt, from LASTPOINT at the first point and CSE's centre, finding nothing; coincident points |
| p100–p107 | names and aliases, ARCSCE typed, Enter repeating ARC, `'_ARC` at LINE |
| p108–p125 | Enter at every prompt, with and without something to continue; another prompt's keywords; a Z at the 2D prompts |
| p126–p143 | point entry: `@` forms, `@` alone, `#`, `*` in UCS Z 30, `<a` per prompt, LASTPOINT after each mode |
| p144–p149 | transparent commands mid-ARC; `_U` and another command at each prompt; U, REDO, UNDO 2, MREDO |
| p150–p161, p192–p194 | properties, a typed Z, UCS Z 30 and X 90, the same changed mid-command |
| p162–p171, p188–p191 | degenerate arcs: the end on the start ray or at the centre, centre = start, collinear 3P; the sweep always CCW |
| p172–p187 | overrides at the later prompts; ORTHOMODE 1 with typed points |
| p200 | plot of six DASHED arcs, measured along their length |
| p201–p211 | snaps on an arc: QUA in UCS Z 30 and tilted, END, MID, CEN, NEA, INT, TAN and PER off the sweep |
| p212–p215 | MIRROR; a mirrored insert exploded; DXF 2018 written and reopened |
| d01–d04 | the ribbon's 3-Point, Start, Center, End and Center, Start, End: echoes, the ghost and the amber dashed lines, Ctrl |
| d05, d06 | dynamic input's Down lists and boxes; Ortho bending only a centre mode's end; the right button's menu |
| d07–d10 | grips and their hover menus, the middle grip's drag, the Properties palette, DASHED arcs on screen |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| ARC-01 | Enter at a later prompt ended ARC | refused in each prompt's words | `108c53d` |
| ARC-02 | a centre mode's end read `@` from the start | from the centre | `108c53d` |
| ARC-03 | 3P at different heights tilted | flat in the first point's plane | `108c53d` |
| ARC-04 | a Tangent or Perpendicular at the first point refused | from LASTPOINT | `108c53d` |
| ARC-05 | a degenerate arc kept asking or made a zero sweep | `*Invalid*` and the end | `108c53d` |
| ARC-06 | centre = start silent | `Radius must be non-zero.` | `108c53d` |
| ARC-07 | Ortho, Polar and `<a` at prompts with no base | only a centre mode's end | `108c53d` |
| ARC-08 | the rail's SCE and CSE as this app's names | the ribbon's macros | `108c53d` |
| ARC-09 | Enter at the start with nothing to continue silent | `No line or arc to continue.` | `108c53d` |
| ARC-10 | es «del arco» at a centre mode's end | table 8423 | `108c53d` |
| ARC-11 | a centre mode's end refused `Invalid 2D point.` | AutoCAD's words | `108c53d` |
| ARC-12 | tests citing no 2027 probe, the entry's tilted plane | cited, rewritten | `108c53d` |
| ARC-13 | CIRCLE's 2P and 3P box left LASTPOINT at the absolute reading | the point given | `27f9142` |
| ADK-01 | the ghost in the theme's colour | the current colour | `27f9142` |
| ADK-02 | the rubber lines solid white | amber, dashed | `27f9142` |
| AOB-01 | a dashed arc unfitted | centred over its length | `0090913` |
| AOB-02 | Quadrant on the arc's own axes | along the UCS, on the arc | `0090913` |
| AOB-03 | Perpendicular off the arc | on the arc only | `0090913` |
| AOB-04 | the palette's rows | AutoCAD's, one Geometry group | `0090913` |
| AOB-05 | the middle grip changed the radius | Stretch through the cursor | `0090913` |
| AOB-06 | an arc's round trip untested | `arcFiles.test.ts` | `0090913` |
| AOB-07 | LINE's zero-length message in the UCS | the WCS | `0090913` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- the desktop in the owner's Spanish profile (the launched instance opened the English one a third
  time): the arc palette's Spanish labels (`Ángulo total`, `Longitud de arco`, worded here), and
  PLINE's and CIRCLE's pending Spanish items (their plans, "Still open");
- the arc's end grips' Stretch drag, a number typed with a grip hot, Ortho on a grip drag (d07
  shows the ends' Stretch, Lengthen menu, not the drag);
- Polar at ARC's prompts; a Z at a centre mode's end; EXT and APPINT along an arc; a dashed tilted or
  thick arc; a mirrored insert exploded (p213) in the harness.

Analogues for the reviews that own them: a polyline's arc segments still take Quadrant on their own
axes and Perpendicular off the arc, and their dashes are unprobed (AOB-02, AOB-03; PLINE's object,
ARC-D7); ELLIPSE's rail modes are still this app's names (`_ellipsec`, CIR-04, ARC-08); any tool
whose box reads a point relative to one that is no runtime base must set LASTPOINT itself (ARC-07,
ARC-13).

## Template improvements

Applied on 2026-10-21 at the review's close (annex-probes.md §4): a command left open by `com send`
and a negative DYNMODE as desktop traps; a grip's default drag probed apart from its menu; the
Spanish profile planned with the owner's AutoCAD already open in Spanish.
