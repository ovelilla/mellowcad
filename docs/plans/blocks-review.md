# Blocks review (BLOCK, INSERT, ATTDEF, -ATTDEF, ATTEDIT, EATTEDIT, ATTDISP, BLOCKSPALETTE, PURGE)

> **Status:** done, 2026-10-27. Reviewed and executed in one session with skill `command-review`,
> the nineteenth review of `docs/coverage/roadmap.md`'s order.
>
> It owns **blocks and attributes**: the block table (names, redefinition, self-reference, in use,
> purge), a block reference (placement, per-axis scale, mirror, display, palette rows, grips),
> attribute definitions and a reference's attributes, and the attribute value prompts and editors.
>
> The full plan is in git: `git show 3d6484e:docs/plans/blocks-review.md`. It holds the matrices,
> the findings, decisions BLOCKS-D1 to D94, the refuted suspicions, and coverage and rules ↔ code.

## Summary

There were 2 critical, 8 high, 24 medium and 17 low findings, and all were executed in five
commits.

The criticals:

- **PURGE removed a block in use inside another.** A block used only by a referenced block's
  definition was purged, and the outer references drew nothing. "In use" is now transitive
  (PRG-01, p150).
- **Redefining a block from its own reference made it reference itself.** It is now refused, as
  AutoCAD refuses it (BLK-01, p117, p119).

The highs:

- Enter at -BLOCK's name and base point ended the command, and BLOCK dropped the preselection
  (BLK-02 to BLK-04).
- -INSERT and -I were unknown (INS-01).
- The X scale, Y scale and rotation after the point were never asked (INS-02). The reference now
  stores X and Y scales.
- The scale carried over to the next insertion (INS-03).
- Block names were matched case-sensitively (INS-04).
- ATTDEF ignored TEXT's justification and rotation (ATD-01).

What the desktop overturned: the console's -BLOCK converts attribute definitions without asking
(p134, p305), but the desktop opens Edit Attributes whatever ATTDIA (d00, d01). The Convert now
opens ATTEDIT's box (D90). In a turned UCS, AutoCAD's -BLOCK moves what it converts, on the desktop
too (p155, d09); mellowcad keeps it in place, a deviation with its WHY (D14).

**Evidence:**

- About 150 console probes in es-ES and en-US: p00–p05, p100–p156, p200–p239, p300–p344.
- A desktop pass in the English profile: d00–d09.
- The `acadres` tables, plus `atteditRes.dll` and `AcEAtteditRes.dll`, which the merged tables
  lack.

## Probes

Console inputs are `scripts/research/probes/blocks/<id>.txt` (`.plain` untraced, `.es` / `.en` one
locale), run with `scripts/research/probe.sh blocks <ids>`. The desktop pass is
`scripts/research/probes/blocks/d01-d09.sh` with `lib-dsk-en.sh`. Transcripts, plots and
screenshots are in `research/probes/blocks/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00–p05 | the version and the variables; -BLOCK, -INSERT, -ATTDEF, ATTDISP, -PURGE in full; the dialog commands in the console |
| p100–p156 | -BLOCK: names, `?`, redefinition, self-reference, mOde, Enter, base point, preselection, attribute definitions, U; -PURGE |
| p200–p239 | -INSERT: names, X/Y/rotation, Scale and Rotate, `?`, case, UCS, LASTPOINT, U; a mirrored reference with a hatch or a text, STRETCH |
| p300–p344 | ATTDEF, INSERT's values, -ATTEDIT, ATTDISP, a reference's attributes |
| d00–d09 | Edit Attributes at -BLOCK's Convert; a reference's grips and palette rows; EATTEDIT and ATTEDIT; the Blocks palette; the Purge and Block Definition dialogs; a turned UCS |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| PRG-01 | a block nested in a used one purged | "in use" transitive (`blocksInUse`) | `0b5e984` |
| PRG-02, PRG-03, PRG-05 | -PURGE unknown; PURGE silent, invented words; anonymous blocks never purged | -PURGE's prompts (Blocks only) and AutoCAD's words, for PURGE too | `0b5e984` |
| PRG-04, INS-04 | names case-sensitive | `findBlockNamed`, at BLOCK, INSERT, -PURGE, paste | `0b5e984` |
| INS-15 | the palette deleted blocks | delete removed | `0b5e984` |
| BLK-01 | a self-referencing block | refused, `*Invalid*` | `06fff9a` |
| BLK-02 to BLK-08 | Enter at the name and base point, the preselection, `?`, `Invalid point.`, the empty set | as the console | `06fff9a` |
| BLK-09 to BLK-13 | -BLOCK and aliases; the Z warning; es words; U's regeneration; tests | as the console; 2027 citations | `06fff9a` |
| ATE-01 | the Convert asked at the command line | ATTEDIT's box; Escape keeps the defaults | `06fff9a` |
| ATD-01 to ATD-06 | TEXT's settings, Enter at the start, the Current line | shared with TEXT, as TEXT | `d782b7d` |
| ATD-07 to ATD-10 | the tag's space and `!`; the backslash; no grip; aliases | as the console; TEXT's grips | `d782b7d` |
| ATE-02 to ATE-05 | ATTDISP's U; the double-click's echo; tests; ATTEDIT's prompts and refusals | as the console and the desktop | `d782b7d` |
| INS-01, INS-10, INS-13 | -INSERT unknown; INSERT ran the command line | -INSERT; INSERT opens the Blocks palette | `97b840e` |
| INS-03, INS-05 to INS-07, INS-09, INS-11, INS-12, INS-16 | scale kept, `?`, Enter, two points, `<1>`, es wording, the ghost | as the console and the desktop | `97b840e` |
| INS-02, INS-08 | no X/Y/rotation; 0 and negatives dropped | asked; X and Y scales stored (file 33) | `3d6484e` |
| BOB-01, BOB-02 | a hatch in a mirrored reference | reflected on display, kept by EXPLODE | `3d6484e` |
| BOB-03, BOB-04 | ByBlock unrecorded; the palette's rows | Missing; Geometry, Misc, Attributes | `3d6484e` |

Decisions added or changed in the execution:

- **D6, D7:** No, Enter and a self-reference end -BLOCK; they do not restart it. The probes'
  inputs show the restart was the repeat of an empty line (p114).
- **D95:** -INSERT's X prompt keeps `[Corner/XYZ]`, which is part of AutoCAD's message
  (table 20819), though neither keyword is built.

## Still open

What stays **unverified** or **Missing** is in:

- `docs/coverage/draw.md`: BLOCK, INSERT, ATTDEF, ATTEDIT, ATTDISP;
- `modify.md`: PURGE, MIRROR, EXPLODE;
- `blocks-palette.md`.

The points worth a later probe:

- text and attributes under a non-uniform scale, drawn here at X's size;
- a negative X typed at INSERT, which AutoCAD draws backwards (d02-1);
- the exploded hatch's origin (p234) and scale;
- `Press ENTER to continue:` after `?`;
- the palette's Spanish rows;
- what Yes at -PURGE's Verify says with nothing to purge;
- ATTEDIT's pick on nothing (` No object found.`, atteditRes 2).

**Analogues for the reviews that follow** (roadmap):

- the Workspace review: ATTDIA, ATTREQ, AFLAGS, ATTMODE and INSNAME typed as variables;
- the Inquiry review: LIST of a block reference and its attributes.

## Template improvements

Applied on 2026-10-27 at the review's close (`annex-probes.md` §4, template §4.8,
`autocad-research/gui.md`, `scripts/research/acad/post.ps1`):

- a dialog the console skips mid-command is checked on the desktop through COM;
- a modal dialog is closed with `acad.sh post`;
- words outside the merged tables are found in the install's DLLs;
- a path two commands share goes to one subagent by name.
