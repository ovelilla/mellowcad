# PLINE review

> **Status:** done, 2026-10-21 — reviewed, approved by the owner and executed in the review's own
> session with skill `command-review`, the second review of `docs/coverage/roadmap.md`'s order. The
> full plan (matrices, findings, decisions, refuted suspicions, rules ↔ code) is in git:
> `git show 84cbabf:docs/plans/pline-review.md`.

## Summary

1 critical, 4 high, 19 medium and 16 low findings over four blocks, all executed. The critical one
was a closed polyline of two vertices losing its closing segment, in the drawing and in the file
(POB-01). PLINE, its arc options and the polyline object now behave as AutoCAD 2027's console and
desktop show them at every prompt probed, and the areas PLINE owns — the polyline object (widths,
bulges, its grips, its palette, how it draws and files) and the polyline's arc prompts, DIST's Arc
too — were reviewed in full. Evidence: about 185 console probes in es-ES and en-US, a desktop pass
with the owner's mouse (d01–d12) and a browser check of the palette's Closed and the jig's colours;
every test that reproduces AutoCAD cites its probe.

## Probes

Console inputs are `scripts/research/probes/pline/<id>.txt` (`.plain.txt` runs untraced; `.es.txt` and `.en.txt` in that locale only), run with
`scripts/research/probe.sh pline <ids>` in es-ES and en-US; the desktop's are `dsk.sh`. Transcripts,
plots and screenshots are in `research/probes/pline/` (gitignored). MPDUMP's LWPOLYLINE `vertices`
are `[x, y, bulge, startWidth, endWidth]`.

| Id | What it asks |
| --- | --- |
| p01 | prompts, `Current line-width is`; the first segment's list has no Close (21321) |
| p02 | Undo to nothing: `All segments already undone.` (es `Ya están deshechos todos los segmentos.`) |
| p03 | Close; LASTPOINT after it is the last vertex |
| p04 | Close after one segment: closed, two vertices, Length 20 |
| p05 | `_C` at the first segment: `2D point or option keyword required.` |
| p06 | Enter at the start point: Continue from a line |
| p07, p08 | Continue and a first arc after a symmetric clockwise arc (inconclusive; p32–p37 replace them) |
| p09 | the first arc after a 45° line: bulge −0.4142 |
| p10 | FOO at each prompt; an arc end straight ahead `*Invalid*` |
| p11–p13 | es only: `POL`, `A`, `N`, `H`, `C`; `MITAD`; `MITADG` at the first prompt re-asks silently |
| p14 | `'_PLINE` at CIRCLE's prompt refused |
| p15 | Enter at `Command:` repeats PLINE |
| p16 | LASTPOINT after PLINE's Undo is the vertex left |
| p17 | typed `@` adds a zero-length vertex |
| p18 | a 3D start sets Elevation; `@0,10,5` and `20,20,7` refused at the next point |
| p19, p20 | `#5,5` and `*20,0` refused at the next point; `d<a`, `@d<a`; UCS Z 30 |
| p21, p22 | a bare number; Ortho ignores a typed point |
| p23 | `'ZOOM E` (regen), `'ORTHOMODE`, `'-OSNAP`, `'CIRCLE`; es `Reanudando el comando POL.` |
| p24ᵖ, p25 | U, REDO, UNDO 2, MREDO after PLINE echo `PLINE` |
| p26, p27 | `'LTSCALE 2` / `'-COLOR 1` then PLINE's Undo: the setting back, the segment gone |
| p28 | END and MID overrides with typed points; an arc after them |
| p29 | `_TAN` at the start point: `No found for specified point.`, `Invalid point.`; `_PER` at the next |
| p30 | `_PL`, `_.PLINE`, `pline` (es `_PL` unknown) |
| p31 | Undo at the first segment, twice |
| p32 | Continue after a clockwise arc (ARC 0,10 7.0710678,7.0710678 10,0) starts at (10,0) |
| p33, p34 | the first arc and Length's first segment after it head (0,−1) |
| p35 | Continue and an arc |
| p36 | Angle 90 after it |
| p37 | Radius → Angle: the chord's default `<270>` |
| p38 | LASTPOINT after a refused arc end stays the start |
| p39, p40, p41 | `'-COLOR`, `'ELEVATION`, `'PLINEWID` mid-PLINE: the polyline keeps the start's |
| p42 | UNDO Control None: PLINE's Undo removes nothing |
| p43, p44 | PLINE's Undo goes back to a mark before each segment, a transparent change after it with it |
| p100–p108 | arc keywords: `S`, `SECOND`, es `SEGUNDO`, `SEGUNDOPTO`, `C` (`CEnter or CLose?`), `CE`, `CEN`, `CENTER`, hidden `ARc` |
| p109–p114 | Angle: ±90, 0 and 360 (`Value must be nonzero.`), CEnter, Radius, the chord's default, `'AUPREC` |
| p115 | DIST's Arc after a clockwise arc; `_T` refused |
| p116–p125 | CEnter, Direction, Radius, Second pt geometry, every `*Invalid*` (back to the arc prompt) |
| p126–p130 | arc CLose, Undo of an arc, `_CL` and `@` at the first arc prompt |
| p131–p136 | each option's path: Enter, FOO, 0, negative, another prompt's keyword |
| p137–p141 | points at sub-prompts: 3D, `*`, `#`, `@` from LASTPOINT, a bare number, two points |
| p142–p144 | transparent commands at sub-prompts; `'LTSCALE` survives the arc's Undo |
| p145–p148 | DIST's Arc: Radius, Angle, CEnter's Angle wording, Line, Total, CLose, Undo |
| p149 | table 21314, `Previous direction not UCS parallel, using 0.` |
| p150, p151 | es `POL`, `PL`; `'_PLINE` at `Command:` |
| p152–p165 | Length: Enter, FOO, a point, −5, 0, after an arc, a line, a closed polyline, a circle, nothing; UCS Z 30; Close variants; U after Close |
| p166–p172 | point forms at the start; UCS X 90; ELEVATION 5; LASTPOINT after Length and Enter |
| p173–p177 | TAN at the next point, FROm, Ortho with a distance, an override finding nothing, Close after a zero segment |
| p178, p184, p186, p191 | Enter at the start with nothing to continue: starts at the WCS origin, silently |
| p179–p183 | Enter at the first next point; `_CIRCLE` / `_LINE` typed; properties before and mid-PLINE |
| p185, p188–p190 | Continue whatever LASTPOINT, after an arc-ended, a closed polyline, a circle |
| p187 | a long transcript against the history |
| p192–p195 | END at Length; the first arc in UCS Z 30; es widths' refusal; direct distance 0 and −5 |
| p250–p258 | block PAC's: CEnter's included 0 and 360 `*Invalid*`; `ID @` after a refused option (the arc's start); a negative radius at the chord, after Angle or Radius; p258 the chord's `<30>` in UCS Z 30 (refuted a suspicion) |
| p200–p207 | Width and Halfwidth: defaults, refusals, a point, arc mode, Close, PLINEWID, U |
| p208–p218 | the width's Undo rule, eleven cases (2023's acc/w3–w7 hold) |
| p219–p227 | THICKNESS and ELEVATION, UCS X 90, back to the start, `@` with a taper, DXF codes, two vertices closed by an arc |
| p230–p236 | plots: wide joins, FILLMODE 0, DASHED along polylines, mitre limits, wide arcs |
| d01–d12 | desktop (`dsk.sh`): the ribbon's Polyline, the rubber band's colour, Escape, a wide and an arc jig, Ctrl at the pick, the right button, Ctrl+Z, dynamic input, the grips and their menus, the palette, grip drags, double-clicks, wide joins on screen |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| POB-01 | a closed polyline of two vertices lost its closing segment, also through the file | closes from two vertices everywhere | `b0705fa` |
| POB-02 | a polyline's linetype ran on from its start | each segment laid as a line (PLINEGEN 0) | `b0705fa` |
| POB-03 | sharp corners mitred up to 50 half-widths | 4, square ends beyond | `b0705fa` |
| POB-04 | a wedge where an arc meets a line | the line's band cut along the radius | `b0705fa` |
| POB-05 | an arc band wider than its diameter crossed the centre | clamped | `b0705fa` |
| POB-06 | a straight segment's midpoint grip inserted a vertex | stretches the segment | `b0705fa` |
| POB-07 | Ctrl+click removed a vertex; no grip menus | gone; menus to Missing | `b0705fa` |
| POB-08 | the palette's rows | AutoCAD's, Closed editable | `b0705fa` |
| POB-09 | no line at the width prompts | dashed from the last vertex | `b0705fa` |
| POB-10 | FILL-off lineweight | left unverified | `b0705fa` |
| POB-11 | 2023 citations, false comments | 2027 probes | `b0705fa` |
| POB-12 | a moved vertex kept the next arc's bulge | bends it through its old midpoint | `b0705fa` |
| PLN-01 | PLINE's Undo left a transparent command's change | history marks, `ctx.undoTo` | `43acdcf` |
| PLN-02 | Continue after a clockwise arc from its far end | its drawn end, off LASTPOINT | `43acdcf` |
| PLN-03 | the chain's heading after a clockwise arc | from its drawn end; DIST too | `43acdcf` |
| PLN-04 | a Z or `*` typed at a 2D point prompt taken | refused at the command line | `43acdcf` |
| PLN-05 | `_TAN` at the start point taken | refused (`defersSnap`) | `43acdcf` |
| PLN-06 | properties set mid-command reached the polyline | those of its start | `43acdcf` |
| PLN-07 | a refused arc end moved LASTPOINT | kept | `43acdcf` |
| PLN-08 | Undo under UNDO Control None removed the segment | keeps the chain | `43acdcf` |
| PLN-20 | Length left LASTPOINT behind | its vertex | `43acdcf` |
| PLN-21 | with nothing drawn, world X | the UCS's X | `43acdcf` |
| PLN-22 | Enter with nothing to continue ended PLINE | the WCS origin | `43acdcf` |
| PLN-23 | a direct distance of 0 or negative ignored | a vertex | `43acdcf` |
| PLN-24 | Length's measuring line | refuted (d06) | — |
| PAC-01 | `*Invalid*` re-asked the option's sub-prompt | back to the arc prompt | `5bf6d45` |
| PAC-02 | an included angle of 0 or 360 taken | `Value must be nonzero.` | `5bf6d45` |
| PAC-03 | a negative radius refused | the major arc | `5bf6d45` |
| PAC-04 | Angle → Radius 0 refused | taken | `5bf6d45` |
| PAC-05 | CEnter's chord 0 `*Invalid*` | `Value must be nonzero.` | `5bf6d45` |
| PAC-06 | Enter at Direction's tangent refused | the chain's heading | `5bf6d45` |
| PAC-07 | `@` at a sub-prompt from the arc's start | from LASTPOINT | `5bf6d45` |
| PAC-08 | es `CE` opened cEntro | Cerrar | `5bf6d45` |
| PAC-09 | es `SEGUNDOPTO` | `Segundo` declared; the first prompt's form to Missing | `5bf6d45` |
| PAC-10 | `'AUPREC` rewrote the chord's default | kept as first formatted | `5bf6d45` |
| PAC-11 | table 21314 never said | said | `5bf6d45` |
| PAC-12 | DIST's Undo left Arc | keeps the mode | `5bf6d45` |
| PAC-13 | DIST's CEnter angle wording | 2027's | `5bf6d45` |
| PDK-01 | the rubber band a fixed colour | the polyline's, from its start | `84cbabf` |
| PDK-02 | no dashed chord in arc mode | amber, as the desktop's | `84cbabf` |
| PDK-03 | a double-click opens PEDIT | to Missing | `84cbabf` |

## Still open

What stays **unverified** or **Missing** is in the coverage entries the commits edited; the points
worth a later probe:

- the desktop in the owner's Spanish profile: the palette's and the grip menus' labels, `*Cancelado*`
  inside PLINE; Ctrl at each arc sub-prompt; the small `+` on the start point while drawing;
- the console: two wide arcs meeting, a linetype along an arc segment, the closing segment's width
  when the palette closes a polyline, Enter with nothing to continue in a tilted UCS, a Z or `*` in
  the dynamic-input box, DIST's CEnter angle read as a point (p145), table 21291.

Analogues for the reviews that own them: ARC, MIRROR, ELLIPSE, POLYGON, HATCH, PASTECLIP and MTEXT
now refuse a Z or `*` typed at their 2D point prompts with PLINE's evidence only (PLN-04);
CIRCLE's 3P/2P and the other first points still let a Tangent through to a tool that does not
defer it (PLN-05); the other ghosts' colours (PDK-01) and the base-point dashed lines (MOVE, the
grips) still in `THEME.preview` where AutoCAD's may be amber (PDK-02); any command adding its object
at its end should take its start's properties (PLN-06; RECTANG, SPLINE); `*Invalid*` returning to
the parent prompt in ARC's options (PAC-01).

## Template improvements

Applied on 2026-10-21 with the plan's approval (template §0, §4.1, §9; matrix.md H;
annex-probes.md §2, §4; `probe.sh`): start from the previous review's analogues; properties
changed mid-command in row H; the desktop's traps; one-locale probes; the execution following in
the review's own session.
