# Dimensions review (DIMLINEAR, DIMALIGNED, DIMBASELINE, DIMCONTINUE, DIMSPACE, DIMRADIUS, DIMDIAMETER, DIMANGULAR, DIMSTYLE)

> **Status:** done, 2026-10-27. Phases 0–4 in one session with skill `command-review`, the
> execution in a second; the twentieth review of `docs/coverage/roadmap.md`'s order.
>
> It owns **the dimension objects and styles**: the dimension entity of every kind (its
> measurement text, how each kind is drawn, its grips, its palette rows, its shortcut menu), the
> dimension style table (its undo, -DIMSTYLE, the drawing's styles), and the dimension commands'
> shared prompts (Text and Angle, the base-dimension pick, Last).
>
> The full plan is in git: `git show b7afc10:docs/plans/dimensions-review.md`. It holds the
> matrices, the findings, decisions DIMS-D1 to D106, the refuted suspicions, and coverage and
> rules ↔ code.

## Summary

There were 0 critical, 11 high, 38 medium and 14 low findings. All but one were executed in five
commits; DAG-12 was refuted in the execution.

The highs:

- **Every dimension read otherwise than AutoCAD's**: ISO-25's decimal comma and suppressed
  trailing zeros (DIMDSEP, DIMZIN 8) now draw `12,5` and `100`; the report keeps a point (DOB-01).
- **A dimension's grips** are AutoCAD's per kind, with a text grip whose drag is Move with Dim
  Line and a stored text position (DOB-02).
- **Dimension style edits** are undoable, one step each, named DIMSTYLE (DSY-01).
- DIMLINEAR on a circle runs along the measured direction (DLN-01); H/V follows AutoCAD's bands
  with hysteresis (DLN-02).
- Radial dimensions follow DIMTOFL and draw one run from the text to the arrow (DRD-01, DRD-02).
- A line pair's angular dimension measures the sector holding the location (DAG-01), and its
  extension lines run inward too (DAG-06).
- `@` in a chain reads LASTPOINT (DCH-01); an aligned base chains rotated dimensions (DCH-02).

**Evidence:**

- About 180 console probes in es-ES and en-US: p00–p16, p100–p169, p200–p269, p300–p369, and the
  execution's p400–p402.
- A desktop pass in the English profile: d01–d07.
- The `acadres` and `AcDimRes` tables; the catalog sweep for the dimension ids.

## Probes

Console inputs are `scripts/research/probes/dimensions/<id>.txt` (`.plain` untraced, `.es` / `.en`
one locale), run with `scripts/research/probe.sh dimensions <ids>`; the desktop pass is
`scripts/research/probes/dimensions/d01-d07.sh` with `lib-dsk-en.sh`. Transcripts and screenshots
are in `research/probes/dimensions/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version; every DIMxxx variable of the console's ISO-25 |
| p01, p02, p15 | `Dimension text =`, the drawn text (EXPLODE's MTEXT), Text's default: DIMZIN 8 and DIMDSEP |
| p03–p16 | DIMSTYLE in the console; -DIMSTYLE's options, Save, Restore, `?`, STatus, Variables, Apply, case, U; DIMSCALE typed and U; transparency; Standard's values |
| p100–p169 | DIMLINEAR and DIMALIGNED: names, the object pick, H/V, Text, Angle, Rotated, LASTPOINT, ELEVATION, UCS, preselection, exploded geometry; DIMHORIZONTAL/VERTICAL/ROTATED |
| p200–p269 | DIMBASELINE, DIMCONTINUE: the base, Last, the origin, `@`, Undo, DIMDLI, an aligned base; DIMSPACE: base, set, value, preselection, U |
| p300–p369 | DIMRADIUS, DIMDIAMETER, DIMANGULAR: refusals, typed and locked picks, `@`, LASTPOINT, inside and outside layouts exploded, DIMTOFL, the four sectors, circle form, names |
| p400–p402 | Last after a SAVEAS and OPEN; a pick on a radial at DIMBASELINE's and DIMCONTINUE's Select |
| d01–d07 | grips of every kind; their hover menus; the text grip's drag; the Properties palette of every kind; the Dimension Style Manager, New…, U; DIMLINEAR's H/V on the jig; Enter at DIMRADIUS's location; the shortcut menu over a dimension |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| DOB-01 | `12.50`, `100.00` drawn | DIMDSEP and DIMZIN 8 on the style (file 34) | `86f7ce5` |
| DOB-02 | definition-point grips, the text always centred | AutoCAD's grips per kind; a text position mapped by every transform | `86f7ce5` |
| DOB-03 to DOB-05 | the palette's rows; no Dimension Style ▸; hover menus unrecorded | AutoCAD's title and groups; the menu entry; Missing | `86f7ce5` |
| DSY-01 | style edits not undoable | history commands, U names DIMSTYLE | `799a948` |
| DSY-02 | -DIMSTYLE unknown | Save, Restore, `?`, STatus, Variables, Apply | `799a948` |
| DSY-03, DSY-04 | Standard, Annotative; DIMxxx typed | Missing; the variables to the Workspace review | `799a948` |
| DLN-01, DLN-02 | a circle's chord projection; H/V by escape | the resolved direction; AutoCAD's bands and hysteresis | `9be1a50` |
| DLN-03 to DLN-07 | locked, typed, LASTPOINT, the refusal, nested picks | as the console (table 18669) | `9be1a50` |
| DLN-08 | DIMHORIZONTAL, DIMVERTICAL, DIMROTATED absent | modes of the linear tool | `9be1a50` |
| DLN-09 | the location's Z | the current ELEVATION, every dimension | `9be1a50` |
| DLN-10 to DLN-17 | Angle 0, Text's Enter, `<30`, es Angle, Rotated's default, the rollover, tests | as the console; DLN-15 to Missing | `9be1a50` |
| DRD-01, DRD-02 | DIMTOFL 0's picture; the inside runs | DIMTOFL on the style (file 35); one run by the text's ink width | `dcf571a` |
| DRD-03 to DRD-09, DRD-11 | the report's order, refusals, typed and locked picks, `@`, `<>`, rollover, Enter | as the console and d06 | `dcf571a` |
| DRD-10 | Ø for ∅ | kept: the drawing font has no U+2205 (a WHY, a coverage note) | `dcf571a` |
| DAG-01, DAG-06 | the reflex sector; outward-only extension lines | the location's sector; inward and outward | `dcf571a` |
| DAG-02 to DAG-05, DAG-07 to DAG-11 | `°` in the report, refusals, the circle form, a polyline's segments, picks, `@`, es names and prompt | as the console | `dcf571a` |
| DAG-12 | Enter at the location ended with nothing | refuted: so does the console's (p369) | — |
| DCH-01, DCH-02 | `@` from the chain; an aligned chain | LASTPOINT; rotated dimensions at the base's axis | `717731d` |
| DCH-03 to DCH-11 | Undo's silence, spacing, an angular last, typed picks, Last's session and origin, a radial picked, comments, rollover | as the console | `717731d` |
| DSP-01 to DSP-03 | the preselection, silent base picks, the value's field | as the console | `717731d` |

Decisions added or changed in the execution:

- **D69:** Last ranges over the dimensions made since the drawing was opened or started; a
  reopened drawing asks Select (p400). **D70:** a radial or angular picked at Select writes
  `Linear, ordinate, or angular associative dimension required.` and asks again (p401, p402).
- **D11:** only DIMRADIUS and DIMDIAMETER place the dimension at the cursor on Enter (p317, d06);
  DIMANGULAR's Enter ends with nothing, as the console's (p369).
- **D106:** the font has no ∅, so the diameter keeps Ø with its WHY.
- **Ortho and Polar** (the full plan's §9): no location prompt takes an anchor (the trace's
  UseBasePoint false, p01, p340); the desktop is unverified and the coverage says so.

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/dimensions.md`. The points worth a
later probe:

- Ortho and Polar at the location prompts, on the desktop;
- a circle's H/V bands (p109 and p114 stand in);
- what DIMBASELINE and DIMCONTINUE say for a non-dimension picked at Select, and whether a pasted
  or exploded dimension counts as made in the session;
- DIMSPACE's answer to a radial or angular base;
- a line pair whose line does not reach the location's side of the vertex;
- the palette's and the Dimension Style Manager's Spanish labels; U's `ACOESTIL`.

Built here only in part: angular chaining (AutoCAD chains them, p224, p236), a pick inside a block
reference at DIMRADIUS and DIMANGULAR, dimension overrides (Precision ▸, Remove Style Overrides,
the DIMxxx variables typed).

**Analogues for the reviews that follow** (roadmap): the Workspace review takes the DIMxxx
variables typed as commands (DSY-04).

## Template improvements

Applied on 2026-10-27 at the review's close (template §4.3, §4.8, `annex-probes.md` §4):

- the rules' shared contracts swept across all the review's tools by one subagent;
- a scratch test asserts AutoCAD's answer, never only dumps values;
- `com send` ending in a space leaves LINE waiting; the palette's folds persist.
