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

- A probe for one language only is `<id>.es.txt` or `<id>.en.txt` (`.plain` before it when
  untraced): `probe.sh` runs it in that locale alone (a Spanish name such as `POL` is POLYGON in
  English, and the run slips).
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
reads that pixel, so the harness test moves its cursor to the same point. The trace's flags
predict part of it, so read them first: `UseDashedLine` is a dashed rubber band, `UseBasePoint`
false a prompt Ortho and Polar leave alone (circle/d12). The flag says where to look, the desktop decides:
where the command draws its own jig, Ortho bends a prompt the trace marks UseBasePoint false
(RECTANG's corner, POLYGON's edge: rectang/d01, d02), and `<a` then a number there, ignored by the
console, is honoured on the desktop (rectang/p08, d03).

A command the ribbon runs in modes has its buttons' macros in `acad.cuix`, a zip (read it with
Python's `zipfile`; `unzip` is not installed): `^C^C_circle \_d` is what the history echoes.

**Which of several solutions** AutoCAD takes (Ttr, TTT) is a data table: picks varied to separate
the candidate rules, a script fitting them, and ties kept out of tests, since AutoCAD breaks them
either way (circle/p323, p378).

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
the modes in combination (matrix.md) are desktop probes. So is a pass with DYNMODE 3 at every point prompt: the
dimensional fields are the command's own (RECTANG's other corner shows its sides, rectang/d05).

## 4. The desktop

Rules: `gui.md` of `autocad-research`, always. The owner's AutoCAD may be closed: open it with
`scripts/research/acad.sh launch` and wait for its window (`acad.sh wins`); with no other
instance, COM reaches it. A launch may open another language's profile, with settings of its own:
read and restore them per instance.

- **What is typed at the command line goes through COM** (`com send`): no keystroke, no focus
  needed. d02 of LINE's review answered a whole prompt sequence that way.
- **Keystrokes and the mouse need the owner.** `acad.sh type` reaches AutoCAD only when the
  drawing area holds the keyboard focus, which a real click gives (2026-10-21: in the foreground
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
5. When the session's last desktop probe is done, quit AutoCAD (`gui.md`): the closed window tells
   the owner the mouse is free.

Traps seen on the desktop (PLINE's review, 2026-10-21):

- Ctrl+1 docks the Properties palette and shifts the drawing area: capture the palette last, or
  read the view again after closing it.
- A grip's hover menu stays open until Escape, and the cursor moved meanwhile shows nothing new:
  press Escape and select again between two hovers.
- A click sent right after typed keys can be lost while AutoCAD still reads them: wait after
  typing.
- A launched instance may open the English profile (three reviews running): a cell that needs the
  Spanish labels goes in a session started with the owner's AutoCAD already open in Spanish.
- A Ctrl held only during a move is not read by the jig; held at the pick it is.
- `com send` of a command that leaves its own prompt open locks COM (`_MPHIST 6` took `6` as its
  first answer): read the history with `com hist` only. `com set` cannot write a negative value:
  DYNMODE −1 (dynamic input on in the owner's profile) is put back with
  `com eval '(setvar "DYNMODE" -1)'` (ARC's review).
- A grip's default drag is a probe of its own: the hover menu does not show what a plain drag does
  (arc/d07 against d08).
- `com get DYNMODE` read 3 where Lisp read −1 after a restore: check a restored DYNMODE with
  `com eval '(getvar "DYNMODE")'` (RECTANG's review).
- `com send` with a space inside a string answer sends it whole (`DASHED acadiso.lin` is one
  answer); -LINETYPE's file needs FILEDIA 0, put back after (CIRCLE's review).
- Escape with dynamic input's Down list open cancels the command, not the list: close it with
  Enter or the arrows mid-probe. The owner's Spanish profile shows only Spanish labels: plan the
  English ones apart (`ax26res.dll`, or a pass in the English profile) or they stay unverified
  (ELLIPSE's review).

A probe that only reads the raw `initget` (flags, `control`) loads MellowProbe with
`acad.sh com netload` and reads `com trace` (`tracing.md`).

## 5. The harness side

Scratch tests live in `research/review/<command>/*.test.ts`, gitignored, so no other session's
hook runs them. They need a config there, created once per machine as
`research/review/vitest.config.mts`:

```ts
import base from "../../vitest.config.ts"
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
Their `console.log` is swallowed: write what to read to a scratchpad file (Node's appendFileSync).
Each scratch test names the probe it reproduces; in the execution it moves, as is, into the
command's test file and its citation stays.
