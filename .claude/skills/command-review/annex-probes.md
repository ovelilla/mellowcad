# Annex: probing the matrix

How each cell of the matrix (template §3) gets AutoCAD's answer with an id a test can cite. The
tools themselves (runner, tracer, desktop, tables, help) are skill `autocad-research`; this annex
is how a review uses them.

## 1. Ids, inputs and transcripts

- A probe is `<command>/<id>`: `p01`, `p02`… for the console, `d01`… for the desktop, numbered in
  the order written and never renumbered. A test or a comment cites it as
  `probe line/p07` (adding `es-ES` or `en-US` when only one language shows it).
- **The input is committed**: `scripts/research/probes/<command>/<id>.txt` for the console (one
  answer per line, as `runacc.sh` takes it), `<id>.sh` for the desktop (the `acad.sh` calls, in
  order). It is ours and a few lines long; with it anyone reruns the evidence.
- **The output is not**: transcripts, dumps and screenshots go to `research/probes/<command>/`
  (gitignored: they are Autodesk's text and pictures). The plan quotes the lines that matter.
- The plan's probe index (template §6.3) says what each one asks.

## 2. The console

`scripts/research/probe.sh <command> [id...]` runs each console probe traced (`-t`) in es-ES and
en-US, in parallel, into `research/probes/<command>/<id>.<locale>.txt`, and prints `ok` or the
prompt that swallowed the runner's QUIT. Read a transcript without the tracer's lines, answers
kept, with `sed 's/«MP[^»]*»//g'`; the `«MP …»` lines hold each prompt's keywords in both
languages, AllowNone, the base point and every object appended, modified or erased.

Writing one (the traps of `console.md` hold; these are the review's):

- **One question per probe**, ending back at the command prompt: a refused answer slips every line
  after it by one, and the runner flags the probe.
- Answers in the **underscore form** (`_LINE`, `_U`, `_C`), so one file runs in both languages;
  a probe of the Spanish names (`LINEA`, `H` for undo) runs in es-ES only and says so in its index.
- `_ZOOM _W` around the drawing before any pick or window selection (`console.md`).
- **How far U and UNDO go is probed untraced**: name the file `<id>.plain.txt`. Loading the
  tracer leaves undo steps of its own (SECURELOAD, NETLOAD, MPTRACE), and U took them back
  silently in LINE's first probes.
- **An empty line at `Command:` repeats the last command**: end a probe on the command's own last
  answer, not on an extra Enter (FILLET ran twice in LINE's p60).
- Typed coordinates are taken as typed: with the console's OSMODE 4133 and OSNAPCOORD 2, a point
  typed beside an endpoint was not snapped (checked 2026-10-21). A snap is probed with a typed
  override (`_END`) and a point inside the aperture.
- What a result is: `MPDUMP` with `-` after the command (every property, full precision);
  `(getvar "LASTPOINT")` for LASTPOINT; `QAFLAGS 2` before LIST.
- A setting the cell needs is set inside the probe (`CECOLOR`, `-LAYER`, `_ELEVATION`,
  `_THICKNESS`, `_UCS _Z 30`, `_UCS _X 90`, `-LINETYPE _L`): each run is isolated, so nothing
  needs restoring.

What the console cannot answer, and goes to the desktop: the rubber band and jig, dynamic input,
Escape and the right button, grips, the Properties palette, snap markers and tooltips, the Ctrl
keys. Its cursor is a fixed pixel (`console.md`): a direct distance or a dragged angle there
reads that pixel, so the harness test moves its cursor to the same point.

## 3. The standard probe set of a drawing command

The minimum per prompt of the command, adapted and numbered in the plan:

| Row | Probe                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A   | each name and alias, in each language; the command repeated by an empty line at the command prompt; typed with an apostrophe at another command's prompt                                         |
| B   | each keyword (global form and the local capitals), Enter, `0`, a negative, `FOO`; a keyword of the other prompt                                                                                  |
| C   | `x,y`, `x,y,z`, `@dx,dy`, `d<a`, `@d<a`, `@`, `#x,y`, `*x,y` after a `_UCS _Z 30`, a bare number, `<a` then a number                                                                             |
| D   | each relevant override (`_END`, `_MID`, `_INT`, `_CEN`, `_TAN`, `_PER`, `_NEA`, `_FRO`, `_M2P`) with a point in the aperture; ORTHOMODE 1 with a typed point; deferred Tangent and Perpendicular |
| E   | `'_ZOOM _E`, `'_PAN`, `'ORTHOMODE`, `'_-OSNAP` and a non-transparent command with an apostrophe, at each prompt                                                                                  |
| F   | the command's Undo at each depth and with nothing left; `_U`, `_UNDO 2`, `_REDO`, `_MREDO` after it                                                                                              |
| G   | Enter at each prompt; another command typed at a prompt                                                                                                                                          |
| H   | MPDUMP after the command with CLAYER, CECOLOR, CELTYPE, CELWEIGHT, ELEVATION and THICKNESS set, and in a rotated and a tilted UCS                                                                |
| J   | `_.SAVEAS` to a DWG and a DXF, then a run that opens it (`-i`) and dumps it                                                                                                                      |
| L   | the transcript itself is the history: compared line by line with the harness's `commandLog()`                                                                                                    |

Rows I, M, P and Q, the keys of G (Escape, the right button, SHORTCUTMENU), the tooltip of D and
the modes in combination (matrix.md) are desktop probes.

## 4. The desktop

Rules: `gui.md` of `autocad-research`, always. The owner's AutoCAD may be closed: open it with
`scripts/research/acad.sh launch` and wait for its window (`acad.sh wins`); with no other
instance, COM reaches it. A launch may open another language's profile, with settings of its own:
read and restore them per instance.

- **What is typed at the command line goes through COM** (`com send`): no keystroke, no focus
  needed. d02 of LINE's review answered a whole prompt sequence that way.
- **Keystrokes and the mouse need the owner.** `acad.sh type` reaches AutoCAD only when the
  drawing area holds the keyboard focus, which a real click should give (to confirm) (2026-10-21: in the foreground
  but with the focus on an inner window, no key reached a prompt; SetFocus from outside did not
  move it). `cursor` and a click move the owner's mouse. Ask the owner before such a session, ask
  them not to touch the mouse, and tell them when it is theirs again.

Then, per desktop probe:

1. `acad.sh com new` — a drawing of the review's own.
2. Read every setting the probe will change (`acad.sh com get DYNMODE`) and write the value in
   the probe's `.sh` beside the line that restores it.
3. Show the command line if keys are typed (`com send "_COMMANDLINE\n"`), draw, `type`, `cursor`,
   `shot`; copy each screenshot to `research/probes/<command>/<id>-<n>.png`.
4. Restore the settings, hide the command line again (`_COMMANDLINEHIDE`), `acad.sh com close`.

A probe that only reads the raw `initget` (flags, `control`) loads MellowProbe with
`acad.sh com netload` and reads `com trace` (`tracing.md`).

## 5. The harness side

Scratch tests live in `research/review/<command>/*.test.ts`, gitignored, so no other session's
hook runs them. They need a config there, created once per machine as
`research/review/vitest.config.mts`:

```ts
import base from "../../vitest.config"
import { defineConfig } from "vitest/config"

export default defineConfig({
  ...base,
  root: new URL("../..", import.meta.url).pathname,
  test: {
    ...base.test,
    include: ["research/review/**/*.test.ts"],
    coverage: { enabled: false },
  },
})
```

Run with `npx vitest run --config research/review/vitest.config.mts research/review/<command>`.
Each scratch test names the probe it reproduces; in the execution it moves, as is, into the
command's test file and its citation stays.
