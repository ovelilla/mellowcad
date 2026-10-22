# TRIM / EXTEND review

> **Status:** done, 2026-10-22 — reviewed and executed in one session with skill `command-review`,
> the twelfth review of `docs/coverage/roadmap.md`'s order. The full plan (matrices, findings,
> decisions, refuted suspicions, coverage and rules ↔ code) is in git:
> `git show 03f17b3:docs/plans/trim-review.md`.

## Summary

4 high, 15 medium and 10 low findings over six blocks, all executed. The highs: Quick's first Enter
at a fresh prompt ended TRIM and EXTEND, where AutoCAD takes it once and keeps asking, so `TR ⏎ ⏎`
then picks still trims (TRS-01: p100, p116, p118, and the desktop through COM); a preselection was
dropped, where AutoCAD makes it the only cutting or boundary edges (TRS-02: p141–p144); a
polyline's arc segments cut and bounded at their chords (TRG-01: p171–p173); a block reference and
a text were no edge, so Quick deleted what only they crossed (TRG-02: p237, p238). One model of
what TRIM's Undo counts now fits every probe: the steps are the edits, Undo is listed once the
object prompt has had any answer and refused before. Of the objects a pick finds AutoCAD takes the
newest, at TRIM's prompt and at ERASE's `Select objects:` alike (p400–p403): `Document.pickAll`
dropped distance from its order and the pick's reach became the drawn pick box (ERASE's area,
reopened with that evidence). The MIRROR property test OFFSET saw fail was no flake: MIRRTEXT 0
read texts at right angles otherwise than AutoCAD (TMI-01: p01, p02). Evidence: about 230 console
probes in es-ES and en-US and a desktop pass in the owner's Spanish profile (d01–d09).

## Probes

Console inputs are `scripts/research/probes/trim/<id>.txt` (`.plain.txt` untraced, `.es.txt` /
`.en.txt` one locale only), run with `scripts/research/probe.sh trim <ids>`; the desktop's are
`dsk.sh` with `lib-dsk.sh` and `shift.ps1`. Transcripts and screenshots are in
`research/probes/trim/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p02 | the version; MIRRTEXT 0 at 0°, 90°, 180°, 270° mirrored twice across 45° and 135° lines |
| p100–p164 | the command line: names, repeat, Enter, refusals, mOde, Edge, Project, eRase, Undo at each depth and with nothing, U, REDO, UNDO 2, MREDO, transparency and U after it, preselection, the three variables and their storage |
| p170–p239 | what it produces: every type trimmed and extended, polylines with arcs, widths and their own crossings, splines, text, MTEXT, blocks, hatches, dimensions, normals, planes perpendicular and tilted, Edge=Extend, Undo |
| p240–p309, p380–p389 | the picks: every point form, LASTPOINT, locked and Off layers, two objects in the pickbox, typed overrides, the edges' prompts and their modes, Fence, the implied fence, Crossing, Standard's window, Undo after each |
| p400–p404, p410–p413 | ERASE's and TRIM's pick of the newer of two lines; a second fence point on an object; a hatch extended, a perpendicular edge in EXTEND, MTEXT and an attribute definition as edges |
| d01–d09 | TRIM's, Shift's and EXTEND's ghosts; a fence by clicks and by a drag; the right button; Standard's window; Ortho and Polar at the fence; Escape and U; what cannot be trimmed |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| TMI-01 | MIRRTEXT 0 at right angles read otherwise | one antipodal half-plane, (−90°, 90°] | `2547cf6` |
| TRS-01 | Quick's first Enter ended the command | taken once, Undo listed | `c6dad81` |
| TRS-02 | a preselection dropped | the only edges, `1 found` | `c6dad81` |
| TRS-03 | Undo with nothing taken in silence | refused in the prompt's words | `c6dad81` |
| TRS-04, TRP-05 | answers that change nothing did not list Undo | listed, its message said | `c6dad81` |
| TRS-05 | EXTEND's Expects line without mOde | the declared list but its last | `c6dad81` |
| TRS-06 | Edge's `No extend` | declared `Noextend` (es `No`) | `c6dad81` |
| TRS-07 | Undo after 'LTSCALE kept the trim | back to the step's history depth | `c6dad81` |
| TRS-08 | the † on RR, AL; 2023 citations | 2027's probes | `c6dad81` |
| TRP-04 | an empty implied fence was a step | only edits are | `c6dad81` |
| TRP-01 | typed overrides refused at the object prompt | the snapped point is the pick | `5d3b71b` |
| TRP-02 | the nearer of two objects taken | the newest, every pick | `5d3b71b` |
| TRP-03 | a locked object passed over in silence | `1 was on a locked layer.` | `5d3b71b` |
| TRP-07, EDG-01 | 2023 citations; mOde at a full `Select objects:` | 2027's; `*Invalid*` | `5d3b71b` |
| TRG-01 | arc segments read as chords | read as arcs | `3758a37` |
| TRG-02 | blocks and text no edge | edges; an attribute definition is not (p413) | `3758a37` |
| TRG-03 | normal −Z neither trimmed nor an edge | level for TRIM and EXTEND | `3758a37` |
| TRG-04, TRG-05 | text, MTEXT, blocks, hatches, dimensions in silence | AutoCAD's refusals; a dimension deleted by Quick | `3758a37` |
| TRG-06 | a perpendicular object silent, what it crossed deleted | both messages, kept | `3758a37` |
| TRG-07 | EXTEND ignored its own polyline | grows to its other segments | `3758a37` |
| TRG-08, TRG-09 | EXTEND's Spanish for closed curves; 2023 citations | table 54; 2027's probes | `3758a37` |
| TRJ-01 | a red dashed ghost over a repainted object | the piece faded in place | `3800c7b` |
| TRJ-02 | the extension's added piece dashed | the object whole in the selection's glow | `3800c7b` |
| TRJ-03 | a fence or window previewed nothing | its trims faded as it runs | `3800c7b` |
| TRJ-04 | no cursor badge | the ✕ and the circle-and-slash | `3800c7b` |

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/modify.md`'s TRIM / EXTEND entry; the
points worth a later probe:

- the Spanish console leaves `desHacer` out after a miss or Crossing's window where the English
  lists Undo (p298, p301, p303, p308 es against p241, p382); the English is followed;
- `_INT` at the pick on an arc, a circle or a polyline; the attributes of a block reference as
  edges; a fence crossing a text or a hatch; a click inside a hatch (AutoCAD starts a fence,
  p196, p197);
- EXTEND's fence and window look, the ✕ over a fence crossing nothing, the circle-and-slash on
  EXTEND's refusals; running snaps and Shift+right-click at the object prompt; Shift with a fence
  or window; the English profile's menus;
- a CV spline extended, a dimension as an edge; CIRCLE in a UCS turned X 180 stores +Z where
  AutoCAD stores −Z (CIRCLE's object).

Analogues for the reviews that follow (Corners, Pieces): a single object's pick takes typed object
snap overrides (TRP-01), says `1 was on a locked layer.` (TRP-03) and every type it cannot handle in
the console's words (TRG-04); a polyline's arc segments are arcs, never chords (TRG-01); what a
command's Undo keyword lists and counts (TRS-03, TRS-04); a preselection's role (TRS-02).

## Template improvements

Applied on 2026-10-22 at the review's close (`annex-probes.md` §4, template §4.8,
`.claude/skills/autocad-research/console.md`): a desktop setting and a held key reach the console's
runs; an Enter checked through COM alone; the Undo keyword's listing and steps to one subagent
across every prompt.
