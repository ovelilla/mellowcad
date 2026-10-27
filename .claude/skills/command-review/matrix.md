# The interaction matrix

How the scope of a command is laid out (template §3). Probing each row: annex-probes.md.

The scope of a command is a matrix: **rows** are the interactions below, **columns** the command's
prompts (LINE: first point, next point with `[Undo]`, next point with `[Close/Undo]`, length after
Continue). Every cell gets a state; an empty cell is a hole in the review, not an "n/a". In the
plan each block has its table, a cell reading `match · p07 · LineTool.test.ts:120` or
`differs LIN-03`; a row the same at every prompt takes one cell.

| State          | Meaning                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| **match**      | probe and test agree; both cited                                         |
| **untested**   | AutoCAD's answer is known and mellowcad matches it, but no test holds it |
| **differs**    | a finding (template §5)                                                  |
| **known**      | a gap already in the coverage entry's Missing, cited                     |
| **owned**      | an area another plan owns; only the contract was checked (template §1.3) |
| **n/a**        | does not apply, with the reason                                          |
| **unverified** | no source settles it; what was seen instead                              |

## Rows

**A. Invocation**

- The name, every alias, in `en` and `es` (Spanish names and `acad.pgp` aliases), the `_` global
  form and `_.`; abbreviations that are another command's. The catalog's names are diffed against
  the installed `acad.pgp` of each language in Phase 1: View found seven missing (view/p201, p335).
- Repeating it: Enter or Space at `Command:`, the right button's Repeat, the recent commands.
- Typed transparently (`'LINE`): refused as AutoCAD refuses it, or run as it runs.
- The rail entry and any shortcut key.

**B. Prompts and options** — for each prompt:

- The text in `en` and `es`, against the table id and the console (the console wins).
- The keywords: declared (`initget`) against listed, hidden aliases, their capitals in each
  language, the default keyword, an ambiguous abbreviation.
- Enter, Space, `0`, a negative, `FOO` (the refusal words differ per input function), a keyword of
  another prompt, a keyword typed in the other language's global form.
- The loop: what each answer leads to, and what the command reports.

**C. Point entry** — at every point prompt:

- Absolute `x,y`, `x,y,z`; relative `@dx,dy`; polar `d<a` and `@d<a`; `@` alone; `#x,y` and
  `*x,y` (with and without dynamic input); a bare number (direct distance) along the cursor, along
  Ortho, Polar and an OTRACK guide; the `<a` angle override, then a distance.
- What LASTPOINT is after each answer (`ID @`), and at the first prompt before any point.
- Unit formats other than decimal (UNITS), a typed value with the drawing's precision.

**D. Drafting aids** — at every point prompt:

- Every object snap the command can use — Endpoint, Midpoint, Center, Quadrant, Intersection,
  Apparent Intersection, Extension, Insertion, Perpendicular, Tangent, Nearest, Parallel, None —
  each three ways: running (OSMODE, found under the cursor), picked as an override, and typed as
  one; deferred Tangent and Perpendicular; FROm, MID or M2P and TT where they exist; Tab cycling;
  what an override that finds nothing says.
- Ortho (F8, Shift to override), Polar (F10, increment, relative to the last segment), OTRACK
  (acquire, guides, a distance typed along one), snap mode (F9).
- Dynamic input: pointer and dimensional input, the prompt at the cursor, Tab between fields,
  the Down arrow's options, Enter in a field.

**E. Transparent commands** — at every prompt: `'ZOOM`, `'PAN`, a system variable
(`'ORTHOMODE`), `'-OSNAP`, a non-transparent command typed with an apostrophe; the `>>` prompts
and the command's prompt written again on return.

**F. Undo and redo**

- Inside: the command's Undo keyword (and with nothing to undo), Ctrl+Z, `_U` typed.
- After: one U undoes the whole command; UNDO `n`; REDO and MREDO; the step's name echoed; undo
  after an Escape halfway (what was committed stays); U after a run that changed nothing (an empty
  set, a zero vector, an inquiry): AutoCAD takes back that run and names it (move/p07).
- A gesture that runs no command (the wheel, the wheel button, the ViewCube, a toolbar's button)
  is a row of its own: 2027 makes each a named step (`INTELLIZOOM`, `'.VIEWCUBEACTION`,
  `'ZOOM GROUP`), and inside a command an entry its Undo keyword takes back (view/d01–d07).

**G. Ending and cancelling** — Enter, Space and the right button at each prompt (SHORTCUTMENU
off, and with the menu), Escape (once, twice), another command typed mid-prompt, closing options
(Close, Continue); what is kept and what LASTPOINT is afterwards. A command with a ribbon twin
(HATCH and -HATCH) answers Escape, its preview and the look after a pick under each name
(hatch/d01, d02). Escape also at each prompt a keyword opens: AutoCAD can step back to the prompt
that opened it instead of cancelling (DIST's Length, inquiry/d05).

**H. What it produces** — read with MPDUMP and with the harness's `latest()`:

- The object type, how many, in which order (handles; from a set picked out of drawing order too,
  move/p201), its geometry to full precision.
- Layer (CLAYER), colour (CECOLOR), linetype (CELTYPE), lineweight (CELWEIGHT), linetype scale,
  ELEVATION and the Z of each point, THICKNESS, the normal; drawn in a rotated and in a tilted UCS.
- The read-only system variables the run sets (AREA, PERIMETER, DISTANCE), `(getvar …)` after it.
- The same settings changed mid-command, transparently (`'-COLOR`, `'ELEVATION`): AutoCAD fixes
  them when the object starts (PLINE's p39), not when the command ends.

**I. Editing afterwards** — for its object: the grips (which, where, hover, what a drag does, the
multifunctional grip's menu) and the Properties palette (rows, order, units, which edit, what an
edit does).

**J. Persistence** — save and open, the autosave, a file from an older version, copy and paste;
the object comes back identical.

**K. Languages** — `en` and `es` (the command language: names, prompts, keywords, messages, the
letters typed), `ar` (the interface in Arabic, the command language global; a left-to-right run
inside right-to-left text). The catalog sweep for the command's ids (annex-catalogs.md).

**L. Command history** — every line the history writes, with its answer, as the console writes it:
the echo of options, refusals, reports, `>>` lines, what F2 shows.

**M. Render** — the rubber band and the ghost while asking, the final object; the canvas and the
SVG presenter; linetype dashes and lineweight; hover and selection highlight. The desktop shows
AutoCAD's (template §2).

**P. Pointer gestures** — the command used with the mouse alone, as most users use it: started
from the rail, each point picked, the rubber band following, hover over objects (rollover
highlight, the snap marker and its tooltip, the aperture), a dwell that acquires a tracking point,
a drag, the wheel's zoom and pan and the middle button mid-command, Shift with the right button
(the snap menu), the right button's menus, a double-click. Each gesture is a desktop probe.

**Q. Look** — what an AutoCAD user sees and must recognise on sight (AGENTS.md: a look that slows
them down is a finding): the cursor and pickbox, the snap markers' shapes, the tooltips, the
dynamic-input boxes, the rubber band, grips and their colours, the command line's prompt, where the
command sits in the rail; every refusal hovered before its click (a refused pair shows a badge and
its words at the cursor, corners/d06-1). Compared with the desktop's screenshot; styling may
differ, recognition may not.

## Modes in combination

Rows C, D and P are read with the drawing aids off. Then each kind of input meets each aid, one
pair at a time (pairwise, not the full product), at the command's point prompts:

| Input ↓ · aid →          | running snaps | Ortho (F8) | Polar (F10) | OTRACK (F11) | snap mode (F9) | dynamic input (F12) |
| ------------------------ | ------------- | ---------- | ----------- | ------------ | -------------- | ------------------- |
| a pick                   |               |            |             |              |                |                     |
| a pick under an override |               |            |             |              |                |                     |
| a typed coordinate       |               |            |             |              |                |                     |
| a bare number (distance) |               |            |             |              |                |                     |
| the `<a` angle override  |               |            |             |              |                |                     |
| Shift held               |               |            |             |              |                |                     |

Each cell names what wins and cites its probe; the rules AutoCAD documents ("Ortho is ignored when
you … specify an object snap", a typed coordinate ignores Ortho) are cells too, never assumed.
Combinations of two aids (Ortho with OTRACK, Polar with snap mode) are probed where the command
has a direction to constrain.

## The last rows

**N. Tests** — template §4.5, per test file of the inventory.

**O. Other findings** — whatever fits no row above. Always present.
