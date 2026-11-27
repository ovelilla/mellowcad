# LIST and CHPROP review (review 32)

> **Status:** done, 2026-11-27, in one session: phases 0–4 with three subagents probing the
> console (CHPROP; LIST and the first half of its report; the second half), the reviewer's replay
> of LIST's probes in every command language and a desktop pass (chprop/d01 through COM and one
> click, d02 with keys), executed in three commits, each block read again by a fresh context. What
> is left is in the coverage entries' **Missing:** (`docs/coverage/inquiry.md` LIST;
> `docs/coverage/properties.md` CHPROP).
>
> The full plan is in git: `git show 41495296:docs/plans/list-review.md`. It holds the inventory,
> the probes' index, the matrix of every block, each finding with its evidence, the decisions
> CHPROP-D1 to D3 and LIST-D1 to D3, D20 to D26, and what was refuted.
>
> It owns **LIST's report of every object**, in every command language. It cites the LINE review
> (the command line, transparency, undo, dynamic input), ERASE's (`Select objects:`, preselection,
> locked layers), Properties (the style tables, -COLOR, -LINETYPE, -LWEIGHT), Arrays, 3D
> primitives, Regions, HATCH and Text for their objects, and UCS for LSR-47.

## Summary

**Findings:** 0 critical, 2 high, 10 medium, 12 low, all executed or recorded in Missing.

| Block | What                                   | Critical | High | Medium | Low |
| ----- | -------------------------------------- | -------- | ---- | ------ | --- |
| CHP   | CHPROP                                 | 0        | 0    | 1      | 4   |
| LST   | LIST, the command                      | 0        | 0    | 0      | 0   |
| LSR   | LIST's report, en and es               | 0        | 2    | 8      | 6   |
| LSK   | LIST's report in the other 8 languages | 0        | 0    | 1      | 2   |

The worst:

- **LIST of a POINT wrote nothing**, and **an object's own linetype scale was never listed**
  (LSR-01, LSR-02).
- **What was drawn in a UCS turned upside down was stored with +Z, mirrored** (LSR-47, found by
  the second reading); a -Z 2D solid or wide polyline was outlined in plan.
- **CHPROP's Thickness refusal called a region, a solid, an xline… `BLOCKs`** (CHP-01), and LIST's
  columns were padded twice in pt-BR, de, pl and it, one pt-BR line garbled (LSK-01, LSK-02).

**Evidence:** console probes in es-ES and en-US (all ten languages where words were asked):
`chprop/p100–p110`, `list/p100–p126` (p124 unused), `list/p200–p228`, the replay of
`inquiry/p400–p446`; desktop `chprop/d01`, `d02` (en-US); AutoCAD 2027 (ACADVER 26.0,
X.118.0.0), the tables of 2026-10-31 to 2026-11-22. Inputs in `scripts/research/probes/chprop/`
and `scripts/research/probes/list/`.

## Index

| ID | Finding | Commit |
| -- | ------- | ------ |
| CHP-01 | Thickness's refusal named most types `BLOCKs` | `2eb9f722` |
| CHP-02 | the CHPROP entry's prompt lists and Truecolor gap stale | `2eb9f722` |
| CHP-03 | the roadmap's ltScale waiting for per-object ltscale | `2eb9f722` |
| CHP-04 | `chprop.test.ts`'s untested cells | `2eb9f722` |
| CHP-05 | ltScale's box unit and Color's placeholder: the dynamic input's convention, kept (CHPROP-D3) | — |
| LSR-01 | a POINT listed nothing | `41495296` |
| LSR-02 | the object's linetype scale never listed | `41495296` |
| LSR-03 | a non-coplanar 3D polyline's area | `41495296` |
| LSR-04 | an LWPOLYLINE's arc angles and normal in another UCS (LSR-46 with it) | `41495296` |
| LSR-05 | a fitted polyline's arc vertex off the plane: `total angle` | `41495296` |
| LSR-06 | END SEQUENCE's thickness; `PlotStyleName` to Missing | `41495296` |
| LSR-07 | a tie's last bit: not fixed (LIST-D2) | — |
| LSR-40 | a hatch's angles and origin re-read in the UCS | `41495296` |
| LSR-41 | a region's box off the UCS's plane | `41495296` |
| LSR-42 | a table's position in the WCS | `41495296` |
| LSR-43 | a primitive's rotation from noise | `41495296` |
| LSR-44 | LEADER's MTEXT flow direction: Missing | `41495296` |
| LSR-45 | `Material:` of objects from a DXF: Missing | `41495296` |
| LSR-47 | drawn in a UCS upside down: +Z, mirrored; a -Z 2D solid's fill and pick | `41495296` |
| LSK-01 | values padded twice (pt-BR, de, pl, it, cs, hu) | `9fe51d8e` |
| LSK-02 | pt-BR's garbled text point and `no ponto` | `9fe51d8e` |
| LSK-03 | wordings in de, ru, pl, it, hu, fr | `9fe51d8e` |

## Template improvements applied

annex-probes.md §5 (scratch tests in the worktree's out/review, `research/` being the main
tree's), annex-catalogs.md §1 (a report in columns settled by replaying each language's probes).
A command's look mid-run captured with `shot` while COM waits was already §4's (a dialog's).
