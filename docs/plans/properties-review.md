# Properties review (LAYER, COLOR, LINETYPE, LTSCALE, LWEIGHT, PROPERTIES, FILL, MATCHPROP)

> **Status:** done, 2026-10-23 — reviewed and executed in one session with skill `command-review`,
> the sixteenth review of `docs/coverage/roadmap.md`'s order. It owns **the style tables**
> (layers, colours, linetypes, lineweights). Commands: LAYER, LAYERCLOSE, COLOR, -COLOR, LINETYPE,
> -LINETYPE, LTSCALE, LWEIGHT, -LWEIGHT, PROPERTIES, PROPERTIESCLOSE, FILL, MATCHPROP. The full plan
> (matrices, findings, decisions PROPS-D1 to D75, refuted suspicions, coverage and rules ↔ code)
> is in git: `git show db3d4fc:docs/plans/properties-review.md`.

## Summary

0 critical, 3 high, 25 medium and 25 low findings over eight blocks, all executed. The highs:
layer edits and the current layer bypassed the history, so U took back the command before them
where AutoCAD takes back the layer change (LAY-01: p301–p308, desktop d04-2, d05-1); a layer used
only inside a block definition could be deleted (LAY-02: p380); objects on a locked layer could
not be selected at `Command:`, where AutoCAD selects them, refuses their edits and filters them out
of a command's preselection (LKD-01: d02, d03-5, d09, p381). The Arrays review's analogues held
and were fixed: the palette's filter lists an array by its kind (PRP-01), and U names an edit made
outside a command `CHPROP`, `Modify Property` or `Grip Edit` (PRP-03). Evidence: about 190 console
probes in es-ES and en-US (p00–p381), a desktop pass in the English profile (d00–d09) and one in
the Spanish profile without the mouse (e01–e02), MATCHPROP's string table (`acmatchRes.dll`), the
Layer Properties Manager's task dialogs (`AcTaskDialogs.resources.dll`) and `acad.pgp`.

## Probes

Console inputs are `scripts/research/probes/properties/<id>.txt` (`.plain` untraced, `.es`/`.en`
one locale), run with `scripts/research/probe.sh properties <ids>`; the desktop's helpers are
`lib-dsk-en.sh` (English, first monitor) and `lib-dsk.sh` (Spanish, second monitor). Transcripts
and screenshots are in `research/probes/properties/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version and the style variables (CECOLOR … LAYLOCKFADECTL) |
| p100–p139t | -COLOR: numbers, names, words, Truecolor, transparency, U, aliases, layer colours, files |
| p140–p165 | -LWEIGHT: values, ties, words, `?`, aliases, transparency, U, LWDISPLAY |
| p166–p179 | FILL: answers, transparency, U, RELLENAR |
| p200–p260 | -LINETYPE and LTSCALE: options, Set, listings, loaded linetypes, LUPREC, U, aliases |
| p300–p358 | -LAYER: defaults, U, UNDO Layer, current layer off, delete, rename, snaps; MATCHPROP and the palettes in the console |
| p380, p381 | a layer only a block uses; MOVE with a locked preselection |
| d00–d09 | en-US desktop: locked look, picks and palette, the LPM's edits and dialogs, the drop-downs and U, the palette's filter, MATCHPROP |
| e01–e02 | es-ES desktop: the palette's labels and filter, the LPM's columns, MATCHPROP's lines |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| LAY-01, LAY-07 | layer edits and CLAYER not undoable; UNDO Layer unread | commands, LPM edits folded, `'.-LAYER`, `'CLAYER` | `c4d5dcf` |
| LAY-02 | a layer a block uses deleted | in use, nested too | `c4d5dcf` |
| LAY-03, LAY-04, LAY-10 | renames unchecked; current layer off silent; own refusal words | the LPM's task dialogs | `c4d5dcf` |
| LAY-05 | New ignored the selected layer | copies it, current kept | `c4d5dcf` |
| LAY-06 | layer 0 not index 7 | `#ffffff`, drawn as the foreground | `c4d5dcf` |
| LAY-08, LAY-09 | es LAYER, DDLMODES; -LAYER unrecorded | aliases; Missing | `c4d5dcf` |
| LAY-11, LAY-12, LAY-15 | tests; F2; order and colour names | fixed | `c4d5dcf` |
| LKD-01 | locked objects unselectable at `Command:` | selectable, edits refused, preselection filtered | `f9d1ff4` |
| LKD-02 | no fade, no padlock | LAYLOCKFADECTL 50, the badge, the tooltip | `f9d1ff4` |
| COL-01 to COL-05, COL-07 | es `C`, `'ZOOM`, −1, COL / COLOUR, bare English words, tests | as the console | `76a7f05` |
| COL-06 | layer 0's colour | merged into LAY-06 | `c4d5dcf` |
| LWT-01 to LWT-08 | −1, `None`, es BYLAYER, ties, `'ZOOM`, LINEWEIGHT, LWDISPLAY's undo, tests | as the console | `e7db87a` |
| LTY-01 to LTY-09 | aliases, `acad.lin`, `<1.0000>`, loaded linetypes' WHY, listings, ByLayer words, setter, English walk | as the console | `def3fbd` |
| FIL-01 | 2023 citations, holes | 2027 probes, tests | `0ce5457` |
| PRP-01, PRP-02, PRP-04 | an array counted as a block reference; the order | `Array (Rectangular)`, by count | `89f054e` |
| PRP-03 | U named no edit made outside a command | `CHPROP`, `Modify Property`, `Grip Edit` | `89f054e` |
| MAT-01 to MAT-10 | prompts, COPIARPROP, the settings line, special properties, linetype exceptions, locked source and destination, preselection, the paintbrush | as the desktop and acmatchRes | `ad92007` |

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/properties.md` (Layers, Linetypes,
Lineweights, FILL, Colour, the top bar, the palette) and `modify.md`'s MATCHPROP; the points worth
a later probe:

- the drop-downs' answer to a locked selection (only the palette was probed), the padlock and fade
  at the commands' prompts; Set Current's step name in the LPM; the LAYER command's own step;
- the Spanish of `Modify Property`, `'CLAYER` and `'.-CAPA`; the filter's ties;
- MATCHPROP's window over locked destinations, several preselected objects, a hatch's origin,
  TEXT to MTEXT; the blank line under the linetype listings' heading (PROPS-D27).

Analogues for the reviews that follow (roadmap): the Blocks review owns 2027's -BLOCK converting
what it takes into a reference (p380) and a block's layers in PURGE; the Workspace review owns
LWDISPLAY, LAYLOCKFADECTL, CECOLOR, CELTYPE and CELWEIGHT typed as variables.

## Template improvements

Applied on 2026-10-23 at the review's close (`annex-probes.md` §4, template §4.1): a task dialog's
command link clicked by `TDM_CLICK_BUTTON` and a dialog closed by a posted `WM_COMMAND IDCANCEL`;
the whole monitor captured before any desktop click; a pass without the mouse; an edit made
outside a command as a matrix row of its own; MATCHPROP's and the LPM's resource DLLs for the
string tables.
