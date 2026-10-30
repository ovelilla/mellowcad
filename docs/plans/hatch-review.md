# HATCH review (HATCH, -HATCH)

> **Status:** done, 2026-10-26. Reviewed and executed in one session with skill `command-review`,
> the eighteenth review of `docs/coverage/roadmap.md`'s order.
>
> It owns **the hatch object**: its pattern library, geometry, pick, grips, palette rows, render
> and file, and the transforms' contract with it. Commands: HATCH (H, BH, BHATCH), -HATCH (-H,
> -BH, -BHATCH), es SOMBREA, -SOMBREA.
>
> The full plan is in git: `git show d75557e:docs/plans/hatch-review.md`. It holds the matrices,
> the findings, decisions HATCH-D1 to D86, the refuted suspicions, and coverage and rules ↔ code.

## Summary

There were 0 critical, 5 high, 19 medium and 18 low findings over three blocks, and all were
executed.

The highs:

- **The default hatch was not AutoCAD's.** 2027 starts a metric drawing on ANGLE from
  acadiso.pat; mellowcad drew ANSI31 at the imperial 0.125, 848 lines where AutoCAD draws 34
  (HOB-01, p00, p300). The generator was exact: fed acadiso's values it matches AutoCAD's
  exploded lines to 1e-6 (p300–p307).
- **A pattern hatch was picked by its area.** AutoCAD picks it by its lines: a click between them
  starts a window (HOB-02, d06, p322–p327). A SOLID is picked by its area in both.
- **The trace:** a second pick in an area already picked doubled the loop and emptied the hatch
  (HBD-01, p157); text and MTEXT inside the area were not islands (HBD-02, p125, p166).
- **Escape under HATCH keeps the hatch** in AutoCAD, whose ribbon HATCH makes it at each pick;
  -HATCH's discards it (HAT-16, d01, d02). Both discarded here.

The analogues left by earlier reviews: MATCHPROP leaves a hatch's origin alone (d07), as here;
an area object's pick measuring 0 inside it was wrong for a pattern hatch and right for a SOLID
(HOB-02, after TXO-10).

**Evidence:** about 190 console probes in es-ES and en-US (p00–p04, p100–p169, p200–p263,
p300–p369); a desktop pass in the English profile (d01–d09); acadiso.pat and acad.pgp of the
installed 2027; the `acadres` tables.

## Probes

Console inputs are `scripts/research/probes/hatch/<id>.txt` (`.plain` untraced, `.es` / `.en` one
locale), run with `scripts/research/probe.sh hatch <ids>`. The desktop pass is
`scripts/research/probes/hatch/d01-d09.sh` with `lib-dsk-en.sh`. Transcripts, screenshots, plots
and the desktop's history are in `research/probes/hatch/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p04 | the version and the HP variables; HATCH's and -HATCH's console prompts |
| p100–p169 | the internal point: answers, Undo, point forms, snaps, islands, text, heights, the same area twice, U |
| p200–p263 | names, the pattern name, scale and angle prompts, `?`, Select objects, preselection, transparency, U, current properties, ELEVATION |
| p300–p369 | the object: patterns exploded line for line, origin, UCS, too dense, the transforms, picks and crossings, DXF, a plot, FILL |
| d01–d09 | en-US desktop: HATCH and -HATCH (preview, Escape), grips and their menus, the palette, picks inside, MATCHPROP's origin, the double-click, running snaps |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| HOB-01 | imperial ANSI31 the default | 24 acadiso.pat patterns, ANGLE, dots; files before 32 read ANSI31 at scale / 25.4 | `1896e76` |
| HOB-02, HOB-03 | a pattern hatch picked and crossed by its area | by its lines; a SOLID by its area | `1896e76` |
| HOB-04 | MIRROR turned the pattern | angle, origin, scale kept (MIRRHATCH 0) | `1896e76` |
| HOB-05 to HOB-07 | dashed by its linetype; drawn with FILL off; members on an edge | continuous; hidden; left out | `1896e76` |
| HOB-08, HOB-09 | es too-dense words; the cap called HPMAXLINES | the console's words; a safety cap | `1896e76` |
| HOB-13, HOB-14 | one grip; the palette's rows | round centre, vertex and edge grips; AutoCAD's rows | `1896e76` |
| HOB-10 to HOB-12, HOB-15 | a turned UCS's angle, tests, settled coverage, the double-click | Missing, rewritten, settled, Missing | `1896e76` |
| HBD-01, HBD-05 | an area picked twice; a point on an object | refused in AutoCAD's words | `e4c26e7` |
| HBD-02 | text not an island | box islands, by both routes | `e4c26e7` |
| HBD-03 | the analysis lines on every pick | once per run, islands when found | `e4c26e7` |
| HBD-04, HAT-02 | one height traced, the hatch at its boundary's | every height, the hatch at ELEVATION | `e4c26e7` |
| HBD-07, HBD-08 | typed snaps refused; a bare number refused | honoured; direct distance | `e4c26e7` |
| HBD-06, HBD-09, HBD-10 | 2023 citations; ellipse and spline; Outer's third loop | 2027 probes; Missing; recorded | `e4c26e7` |
| HAT-01 | -HATCH unknown | -HATCH, -H, -BH, -BHATCH, BHATCH; es -SOMBREA, -SMB | `d75557e` |
| HAT-16, HAT-17 | Escape by name; no quick preview | as d01 and d02 | `d75557e` |
| HAT-03 to HAT-13 | U of the HP variables, `?`, two points, transparency, Unable to hatch, the Previous set, `_` names, `<%.4f>`, 330°, the listing, es ANSI31 | as the console | `d75557e` |
| HAT-14, HAT-15 | coverage drift; weak tests | fixed; probes cited | `d75557e` |

Decisions added in the execution: HATCH-D75 (a mirrored block reference reflects its hatch's
pattern), D76 (a nameless hatch before version 32 is ANSI31), D77 (the landing's demos name ANSI31
at their old look), D78–D80 (text islands' boxes and where they count), D81–D86 (the HP variables
in `DocumentSettings`, the pattern name's box, the registry's order, the preview's rules, Escape
with Select objects, the scale's unit).

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/draw.md` (HATCH), `modify.md`
(MIRROR, EXPLODE, MATCHPROP) and `properties.md` (FILL). The points worth a later probe:

- the palette's Spanish rows (English pass only); the pickbox of `Point is directly on an object.`
  for a click; a tilted UCS at the internal point;
- text islands: a multi-line MTEXT, an attribute, a text across a boundary, overlapping texts;
- what EXPLODE makes of a pattern's dot; AutoCAD's exact too-dense rule;
- `BHATCH`, `-BHATCH`, `-BH` echo their own names in AutoCAD, here HATCH's and -HATCH's.

**Analogues for the reviews that follow** (roadmap):

- the Blocks review: a hatch inside a block, mirrored with its reference (HATCH-D75), and
  exploded;
- the Inquiry review: LIST of a hatch (p320, p369 hold its words) once LIST exists;
- the Workspace review: HPNAME, HPSCALE, HPANG, HPORIGIN typed as variables (SETVAR).

## Template improvements

Applied on 2026-10-26 at the review's close (`annex-probes.md` §4, `matrix.md` G):

- a command with a ribbon twin gets Escape, the preview and the look after a pick under each name;
- AutoCAD's own log reads the desktop's history when MellowProbe will not NETLOAD;
- objects picked by handle at an entsel prompt through COM;
- a pattern's geometry compared line for line through EXPLODE.
