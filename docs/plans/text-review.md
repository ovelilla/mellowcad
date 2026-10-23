# Text review (TEXT, MTEXT, -MTEXT, TEXTEDIT, STYLE)

> **Status:** done, 2026-10-23. Reviewed and executed in one session with skill `command-review`,
> the seventeenth review of `docs/coverage/roadmap.md`'s order.
>
> It owns **the text objects and their editors**: TEXT and MTEXT, their layout, grips and palette
> rows, the in-place editors, and the text style table. Commands: TEXT (DTEXT, DT), MTEXT (T, MT),
> -MTEXT, TEXTEDIT (ED, DDEDIT), STYLE (ST).
>
> The full plan is in git: `git show 4936e05:docs/plans/text-review.md`. It holds the matrices,
> the findings, decisions TEXT-D1 to D58, the refuted suspicions, and coverage and rules ↔ code.

## Summary

There were 0 critical, 9 high, 30 medium and 21 low findings over five blocks, and all were
executed.

The highs:

- **TEXT's layout was not AutoCAD's.** AutoCAD scales Arial by the H glyph's ink height, 1466
  units, and places text by its ink and its descent. Here:
  - a Bottom-justified text's box sat 0.296·h below its glyphs (TXO-01, p302);
  - TL, Middle and BL texts were drawn at the browser's em-box anchors (TXO-02);
  - Enter in TEXT went 5/3·h down, where Arial's line is 1.60641·h (TXT-02, p122, d01-4).
- **Escape did the opposite of AutoCAD's.**
  - In TEXT's editor AutoCAD drops the line being typed; it was committed here (TXT-22, d01-2).
  - In TEXTEDIT on a single-line text AutoCAD discards the edit; it was kept here (TED-07, d06).
- **Undo:**
  - text style edits were not undoable (STY-01, p320, d07);
  - the style drop-down over N objects was N undo steps (STY-02);
  - Enter at TEXT's Justify ended the command (TXT-01, p156).
- **Locked layers:** TEXTEDIT's Last edited a text on a locked layer (TED-01, p244).

The analogues left by earlier reviews held, and both were fixed:

- EXPLODE's texts from an MTEXT now land where AutoCAD's do: MTEXT is laid out by ink. This
  closes EXP-06 (TXO-03).
- MATCHPROP's Text property also copies height and rotation, and TEXT's justification (TXO-09,
  d08).

**Evidence:**
- about 190 console probes in es-ES and en-US (p00, p100–p166, p200–p289, p300–p338);
- a desktop pass in the English profile (d01–d08);
- the `acmtedRes`, `texteditRes` and `acadres` tables;
- `acad.pgp`, `DoubleClickRoot.cui`;
- a plot of AutoCAD's text to PNG (p325).

## Probes

Console inputs are `scripts/research/probes/text/<id>.txt`: `.plain` runs untraced, `.es` / `.en`
in one locale. Run them with `scripts/research/probe.sh text <ids>`. The desktop pass is
`scripts/research/probes/text/d01-d08.sh` with `lib-dsk-en.sh`. Transcripts and screenshots are in
`research/probes/text/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version and the text variables |
| p100–p166 | TEXT and -TEXT: every prompt, every justification, refusals, Style and `?`, Enter to continue, the line spacing, U of the settings, an empty run, properties and UCS, points, snaps, transparency, the preselection of the five commands, Spanish |
| p200–p289 | MTEXT and -MTEXT: options and refusals, Columns, U, codes, LUPREC, the declared words. TEXTEDIT: settings, Undo, Mode, Last, locked, TEXTEDITMODE, aliases, MTEDIT |
| p300–p338 | the objects and STYLE: Standard's font, `(textbox)`, the justifications' DXF 10, MTEXT layouts exploded, STRETCH, snaps, -STYLE, -RENAME, -PURGE, U of a style, a plot, MIRROR, the wrap threshold, aliases |
| d01–d08 | en-US desktop: TEXT's editor, text and MTEXT grips, the palette, MTEXT's editor and Escape, picking and double-clicking text, TEXTEDIT's Escape, the Text Style dialog and U, MATCHPROP between texts |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| STY-01, STY-02 | style edits not undoable; the drop-downs N steps | history commands, U names `STYLE`; one step (DIMSTYLE's too) | `b96d772` |
| STY-03 | names neither unique nor case-blind | refused with the table's words | `b96d772` |
| STY-04, STY-06, STY-07 | -STYLE, TEXTSTYLE, Annotative, the Text Style dialog | Missing, with their prompts and controls | `b96d772` |
| STY-05, STY-08, TXT-19 | acad.pgp aliases; `Copy of`; STYLE kept the preselection | DDSTYLE, DST, DIMSTY, DDIM, es ESTILODD, DCOTA; `style1`; dropped | `b96d772` |
| TXT-01, TXT-03, TXT-09 | Enter at Justify and at an empty start; silent height refusals | refused in the console's words | `95931f7` |
| TXT-02 | 5/3 line spacing | Arial's 2355/1466 (MTEXT keeps 5/3) | `95931f7` |
| TXT-04 | continuing across NEW, OPEN and U | per session, read from the document | `95931f7` |
| TXT-05 to TXT-08 | Current line after Style and `?`, a fixed height, es words | as the console | `95931f7` |
| TXT-10, TXT-11, TXT-12 | U of the rotation and style; an empty run; mid-command colour | restored; first line commits; start's properties | `95931f7` |
| TXT-13 to TXT-17 | -TEXT, TEXTODIN, negative rotation, leading spaces, `S` | built; added; normalised; kept; recorded | `95931f7` |
| TXT-20 to TXT-23 | tests, coverage, Escape in the editor, solid bands | rewritten; drops the line; dashed | `95931f7` |
| MTX-01 to MTX-13 | Enter at the corner and Width, numbers' zeros, refusals, spacing by a point, declared words, -MTEXT codes and empty run, labels, Escape's Unsaved Changes dialog, aliases | as the console and d05 | `9e563b2` |
| TED-01 to TED-08, TXT-18 | locked Last, Undo's message, U of the mode, 2027 refusals, silent misses, the double-click (`_textedit`, `_mtedit`), Escape, TEDIT, one preselected text | as the console and d06 | `8611dab` |
| TXO-01, TXO-02, TXO-04 to TXO-06 | the TEXT box, the baselines, 1466, Middle, the insertion grip | ink metrics, alphabetic baseline, two grips | `97a6d8b` |
| TXO-03, TXO-07 to TXO-10 | MTEXT by ink (EXP-06), centred width grips, palette rows, MATCHPROP, picking by strokes | laid out by ink; both sides; Text alignment; d08; Missing | `97a6d8b` |

## Still open

What stays **unverified** or **Missing** is in the coverage: `docs/coverage/draw.md` (TEXT, MTEXT),
`modify.md` (TEXTEDIT, MATCHPROP, MIRROR) and `dimensions.md` (STYLE). The points worth a later
probe:

- the Spanish words of the palette's Text alignment rows and of the Unsaved Changes dialog;
- U's name after a double-click on an MTEXT (`TEXTEDIT` here, MTEDIT not built);
- a click outside the editor in Single mode;
- a TEXT Left's palette;
- MTEXT→MTEXT under MATCHPROP;
- Exactly's ink, and a negative bearing at a centred MTEXT line;
- the canvas presenter's baselines in a browser (the SVG is tested).

**Analogues for the reviews that follow** (roadmap):

- the Blocks review: ATTDEF's Current line still writes es `SIZ` (TXT-08's words) and attributes
  share TEXT's layout;
- the Dimensions review: DIMSTYLE's style edits are still not undoable (only its drop-down was
  fixed);
- the Workspace review: the Styles palette against AutoCAD's Text Style and Dimension Style
  dialogs (TEXT-D58), and TEXTSIZE and TEXTSTYLE typed as variables.

## Template improvements

Applied on 2026-10-23 at the review's close (`annex-probes.md` §4, template §4.1):

- answers to a prompt that takes spaces are typed, not sent through COM;
- the English profile's Standard is txt.shx;
- dialog buttons UIA cannot press are clicked by their rectangle;
- a pick on text needs a stroke;
- an editor's Escape, with and without changes, is a matrix cell of its own.
