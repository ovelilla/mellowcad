# Inquiry review (DIST, AREA, ID)

> **Status:** done, 2026-10-27. Phases 0–4 and three blocks in one session with skill
> `command-review`, the desktop block (IQD) in a second; the twenty-first review of
> `docs/coverage/roadmap.md`'s order.
>
> It owns no cross-cutting area. It settled the analogues left for it: AREA Object of a hatch
> (hatch/p320) and of a block reference with attributes (Blocks review), and the circle review's
> COB-03 (AREA Object refusing a typed point).
>
> The full plan is in git: `git show 8b95316:docs/plans/inquiry-review.md`. It holds the
> matrices, the findings, decisions INQUIRY-D1 to D44, the refuted suspicions, and coverage and
> rules ↔ code.

## Summary

There were 0 critical, 0 high, 18 medium and 13 low findings, all executed in four commits.

The worst:

- **DIST's Multiple points read `@`, a bare number and Length's point from the run's end**; they
  now read LASTPOINT, which Length and a line's Undo leave where it was (DST-01, DST-02).
- **AREA's `Select objects:` refused a typed point, a bare number and a typed snap, and passed over
  a locked object** (ARE-01, ARE-04; COB-03 closed).
- **`-0.0000` where AutoCAD writes `0.0000`**, in `formatLength`, which every report shares (IDP-01).
- **DIST and AREA drew an invented readout chip and a dashed band**; AutoCAD draws a solid rubber
  band, AREA's corners filled translucent green, and no readout (IQD-01, IQD-02).

**Evidence:**

- About 180 console probes in es-ES and en-US: p100–p172, p200–p258, p300–p361.
- A desktop pass in both profiles: d01–d09 (en-US) and e01–e03 (es-ES).
- The `acadres` tables; `acad.cuix`'s ribbon macros; the catalog sweep for the inquiry ids.

## Probes

Console inputs are `scripts/research/probes/inquiry/<id>.txt` (`.plain` untraced, `.es` one
locale), run with `scripts/research/probe.sh inquiry <ids>`; the desktop passes are
`scripts/research/probes/inquiry/d01-d09.sh` (`lib-dsk-en.sh`) and `e01-e03.sh` (`lib-dsk.sh`).
Transcripts and screenshots are in `research/probes/inquiry/` (gitignored).

| Id | What it asks |
| --- | --- |
| p100–p172 | DIST: names, MEASUREGEOM, refusals, Enter, Length, Undo, Close, Total, every point form, overrides, Ortho, units, UCS, ELEVATION, Arc, LASTPOINT after each |
| p200–p258 | AREA: names, `'AREA`, refusals, Enter and Undo, Add and Subtract, Object of each type, locked, typed picks, Z, UCS, the variables, PERIMETER |
| p300–p318 | ID: names, Enter, refusals, every point form, overrides, Z, spacing, UCS, units |
| p320–p361 | transparency at LINE and CIRCLE; U, `UNDO 2`, REDO; the preselection; LUPREC 0; `'_AREA`; the ribbon's macros |
| d01–d04 | what DIST, Multiple points, AREA and MEASUREGEOM show, with and without dynamic input |
| d05 | Escape at every prompt, Length's and Arc's sub-prompts included |
| d06, d07 | `<30` then a number at DIST and ID; Ortho and Polar at AREA's and Multiple's next point |
| d08, d09 | AREA Object's rollover; the right button at DIST's and AREA's prompts |
| e01–e03 | the Spanish look, Escape at Length, ID's `<45`; the run's total with DYNMODE 3; ID's badge |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| IDP-01 | `-0.0000` | zero written unsigned in `formatLength` | `d9de70d` |
| IDP-02 | ID kept the preselection | dropped as it starts | `d9de70d` |
| INQ-01 | `'_AREA` refused | variables found by `_NAME` | `d9de70d` |
| INQ-03 | AREA Object's highlight `THEME.selected` | the rollover (confirmed by d08-1) | `d9de70d` |
| INQ-04 | the rail's ID ended the running command | apostrophe macros run transparently | `d9de70d` |
| INQ-06 to INQ-08 | a dead `"d"` hint; 2023 citations; tests citing nothing | dropped; 2027 probes cited | `d9de70d` |
| DST-01, DST-02 | Multiple's `@`, number and Length from the run's end; Undo moved LASTPOINT | LASTPOINT, as the console | `65a7baa` |
| DST-03, DST-04 | the first Length along the UCS's X; a number ignored Ortho | the last drawn direction, else east; Ortho bends it | `65a7baa` |
| DST-05, DST-07, DST-08 | MEASUREGEOM, DISTANCE unsaid; stale Missing items | Missing gains them, loses AUPREC and the Spanish report | `65a7baa` |
| DST-06 | Length `0` added a point | none added | `65a7baa` |
| ARE-01, ARE-04, ARE-06 | Object refused typed points and snaps, skipped locked objects, left LASTPOINT | as the console; COB-03 closed | `f36ebf7` |
| ARE-02, ARE-03 | eXit and Enter's total; the AREA variable after a mode | said after a measure only; the running total | `f36ebf7` |
| ARE-05, ARE-07 | corners off the plane; PERIMETER | Missing | `f36ebf7` |
| ARE-08, ARE-10, ARE-12 | the wide polyline's warning; `'AREA` in a mode; stale citations | table 20179; through `onAskAgain`; 2027 probes | `f36ebf7` |
| IQD-01 | the readout chip, ticks and dashed band | the solid rubber band alone | `de3b1df` |
| IQD-02 | AREA unfilled | `THEME.measureAreaFill`, AutoCAD's translucent green | `de3b1df` |
| IQD-03 | Multiple's total on the chip | the dynamic prompt's lead line (`Tool.dynamicPromptLead`) | `de3b1df` |
| IQD-04 | Escape at Length and Arc's sub-prompts ended DIST | steps back, `*Cancel*` on the line left (`Tool.onEscape`) | `de3b1df` |
| IQD-05 | no `?` cursor badge | Missing, with drafting-aids.md's cursor badges | `de3b1df` |

Decisions added or changed in the execution:

- **IQD-04:** Escape steps back from any prompt an Arc option opened, not only the Second pt one
  probed (d05); `ArcSegmentInput` is untouched, PLINE's Escape unchanged.
- **IQD-03:** the lead line shows from the run's first segment on, at Length the run so far
  (unprobed on the desktop).

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/inquiry.md`. The points worth a
later probe:

- where a closed wide polyline's line falls in Add area against `Total area`;
- Escape at a later prompt of an Arc option (`Specify end point of arc:` after Second pt), and the
  dynamic prompt's lead at Length, on the desktop.

Built here only in part: AREA's Arc and Length, MEASUREGEOM's loop, DISTANCE and PERIMETER, corners
off the UCS's XY plane, LIST (INQUIRY-D1).

**Analogues for the reviews that follow** (roadmap): the Workspace review takes the rail's other
apostrophe macros (ATTDISP's, MATCHPROP's).

## Template improvements

Applied on 2026-10-27 (template §1.1, matrix.md H): the ribbon button's macro read in Phase 1; the
read-only variables a command sets as a row H cell.

Applied after the desktop block, the same day (matrix.md G, annex-probes.md §4):

- matrix.md G: Escape at each prompt a keyword opens, not only the command's own — AutoCAD steps
  back there (d05), which a plain `*Cancel*` sweep misses.
- annex-probes.md §4: an overlay's colour is read from the screenshot's pixels with a small zlib
  PNG decoder in Python (no PIL installed), against the background beside it, to tell a solid
  colour from a translucent one (d03-1).
- annex-probes.md §4: a dynamic-input reading can depend on the profile's DYNMODE features, not
  only on DYNMODE's sign (d02-1 against e01-1): probe the value with dimensional input on (3).
