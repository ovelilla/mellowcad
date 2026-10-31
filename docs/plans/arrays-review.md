# Arrays review (ARRAYRECT, ARRAYPOLAR, ARRAYPATH)

> **Status:** done, 2026-10-22 — reviewed in one session with skill `command-review`, the
> fifteenth review of `docs/coverage/roadmap.md`'s order, executed over three sessions. It owns
> **the array object**. The full plan (matrices, findings, decisions ARRAYS-D1 to D78, refuted
> suspicions, coverage and rules ↔ code) is in git: `git show bcfba5e:docs/plans/arrays-review.md`.

## Summary

0 critical, 5 high, 24 medium and 23 low findings over six blocks, all executed. The highs:
AutoCAD 2027 makes **one associative array object** by default (ARRAYASSOCIATIVITY 1, an INSERT of
an anonymous block, the source consumed into it) where mellowcad added loose copies (AYO-01:
p01–p03, p400); Escape at the main prompt keeps the array (AYJ-01: d08); `AR`, `ARRAY`, `MA` and
`MATRIZ` are ARRAY, which asks the array type (ARR-01: p103, p104); ARRAYPATH repeats the source in
place from where it stands (APA-01: p06) and starts at the path's end nearer the pick (APA-02).
Pieces' analogues held at the path pick: a locked curve said, typed snaps taken, the shared
rollover (APA-03, APA-05, APA-15). The array then gained its grips, their default drags and its
palette rows, at `Command:` and at the main prompt (AYG-01 to AYG-03). Evidence: about 260 console
probes in es-ES and en-US (p00–p422), a desktop pass in the owner's Spanish profile (d01–d10) and
one in the English profile (d11–d20).

## Probes

Console inputs are `scripts/research/probes/arrays/<id>.txt` (`.plain` untraced, `.es`/`.en` one
locale), run with `scripts/research/probe.sh arrays <ids>`; the desktop's are `dsk.sh` with
`lib-dsk.sh` (Spanish) and `dsk-en.sh` with `lib-dsk-en.sh` (English). Transcripts and screenshots
are in `research/probes/arrays/` (gitignored).

| Id | What it asks |
| --- | --- |
| p00 | the version, ARRAYASSOCIATIVITY, ARRAYTYPE, ARRAYEDITSTATE, PICKFIRST, OSMODE, MAXARRAY |
| p01–p06 | each command by default (one INSERT `*U2`) and with `_AS _N` (loose copies) |
| p100–p179 | ARRAYRECT and ARRAY: every prompt, keyword and refusal, point forms, snaps, transparency, undo, properties, Z, UCS; the preselection of all three |
| p200–p279 | ARRAYPOLAR: the centre, Items, Angle between, Fill angle, ROTate items, overruns, signs, the cap |
| p300–p379 | ARRAYPATH: where items go, every path kind, the path pick (locked, snaps, modes, Enter), every prompt |
| p400–p422 | the array object: its blocks, LIST, EXPLODE, layers, base points, the path's edits, U, COPY, the file, END, ARRAYEDIT, where ARRAYASSOCIATIVITY lives |
| p430–p444 | ARRAYRECT's Levels (2026-10-31, en, es, pt-BR): the prompts, refusals, Total, defaults, two points, EXPLODE's order, a tilted UCS, ASsociative No, 'ZOOM, Expression, the file (p443b opens p443's DWG with `runacc.sh -i`), MOVE |
| d01–d10 | es-ES desktop: the jig of each command, its grips, a grip dragged mid-command, each array's grips and hover menus, the palette, Escape at the main prompt, the right button, the rollover |
| d11–d20 | en-US desktop: each array's grips, every hover menu, the palette, each grip's default drag read with `LIST`, a typed count, the main prompt's grip, the rollover, palette edits |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| ARR-01 | `AR`, `ARRAY`, `MA`, `MATRIZ` started ARRAYRECT | ARRAY, asking the type | `74d36ae` |
| ARR-02 to ARR-08, ARR-10 | spacing 0, a turned UCS's default, `*x,y`, LASTPOINT, `FOO`'s words, refusals' words, order, trailing zeros | as the console | `74d36ae` |
| ARR-09 | a transparent command at a number box | **refuted** (`'ZOOM` passes) | `74d36ae` |
| ARR-11, ARR-12 | `<eXit>`'s spacing, options unsaid | Missing | `74d36ae` |
| APO-02 to APO-12 | full-turn overlap, clockwise fill, refusals, fill modulo a turn, Enter at the centre, `ROWs or ROTate?`, counts to 32767, words, aliases | as the console | `922c684` |
| APO-13 to APO-15 | `<eXit>`'s spacing, claims, tests | recorded, tested | `922c684` |
| APA-01, APA-02 | the source moved onto the path, always from its start | in place, from the nearer end | `3771678` |
| APA-03 to APA-18 | locked curve, Enter, typed snaps, polylines, 3D paths (Missing), turned UCS, filtered-out words, `Maximum items`, aliases, rollover, Group (Missing), Missing | as the console | `3771678` |
| AYJ-01, AYJ-02 | Escape made nothing; dashed blue copies | Escape commits; items drawn as objects | `613a9db` |
| AYJ-03 | Unit cell's rubber band solid | Missing (**unverified**) | `613a9db` |
| AYO-01 | loose copies, `Associative = No` | one array object, ASsociative kept for the session | `46f9275` |
| AYG-01 | one insertion grip | the array's grips and default drags, typed values | `c6c7d7a` |
| AYG-02 | a block reference's palette rows | the array's Geometry and Misc rows, edits | `c6c7d7a` |
| AYG-03 | no grips at the main prompt | the preview's grips, the same drags | `c6c7d7a` |
| AYG-04 | hover menus, Ctrl cycling, hover values | Missing, with every object's | `c6c7d7a` |

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/modify.md`'s ARRAY, ARRAYRECT,
ARRAYPOLAR and ARRAYPATH entries and the array object's paragraph; the points worth a later probe:

- Escape at ARRAYPOLAR's main prompt and at a value's prompt, Escape and Enter while a grip is hot
  mid-command, a move grip mid-command, the grips with ASsociative No;
- a number typed while a spacing, radius or angle grip is hot; one column or row (the count arrow
  left out); a Divide path array's grips; the path's Items edited in the palette (d20g missed);
- the Spanish palette labels d07 cuts short (ARRAYS-D76);
- the hover menus and Ctrl cycling, with every other object's (drafting-aids.md); the path
  association (ARRAYS-D9); Base point, a polar or path array's Rows and Levels (ARRAYRECT's Levels done, p430–p444); ARRAYEDIT, ARRAYCLOSE.

Analogues for the reviews that follow: the Properties review's object filter still counts an array
with the block references; the Blocks review owns the anonymous blocks' purge on save
(**unverified**) and a block reference's grips; U after a grip edit and a palette edit echoes
nothing here where AutoCAD writes `Grip Edit` and `Modify Property` (d14, d20; drafting-aids.md).

## Template improvements

Applied on 2026-10-22 at the review's close (`annex-probes.md` §4, template §9): a pick kept off the
command line's band and a keyword that writes a registry variable listed and restored; the object's
desktop pass before its plan; a dialog closed with `WM_COMMAND IDCANCEL`; a desktop reading by
`LIST` of the object's handle, two U per case; running snaps off while a drag is measured; keys
typed into the Properties palette through its own window; a case never ended with Enter at
`Command:`.
