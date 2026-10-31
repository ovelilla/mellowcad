# Annex: probing the matrix

How each cell of the matrix (template §3) gets AutoCAD's answer with an id a test can cite. The
tools themselves (runner, tracer, desktop, tables, help) are skill `autocad-research`; this annex
is how a review uses them.

## 1. Ids, inputs and transcripts

- A probe is `<command>/<id>`: `p01`, `p02`… for the console, `d01`… for the desktop, numbered in
  the order written and never renumbered; a probe that hangs keeps its id and the retry takes the
  next free one (View's p201, p203, p238 were rewritten). A test or a comment cites it as
  `probe line/p07` (adding `es-ES` or `en-US` when only one language shows it).
- **The input is committed**: `scripts/research/probes/<command>/<id>.txt` for the console (one
  answer per line, as `runacc.sh` takes it), `<id>.sh` for the desktop (the `acad.sh` calls, in
  order). It is ours and a few lines long; with it anyone reruns the evidence.
- **The output is not**: transcripts, dumps and screenshots go to `research/probes/<command>/`
  (gitignored: they are Autodesk's text and pictures). The plan quotes the lines that matter.
- The plan's probe index (template §6.3) says what each one asks.

## 2. The console

`scripts/research/probe.sh [--lang <tag>] <command> [id...]` runs each console probe traced (`-t`)
in a `localized` language's culture (es-ES by default; its pack must be installed) and in en-US,
in parallel, into `research/probes/<command>/<id>.<locale>.txt`, and prints `ok` or the
prompt that swallowed the runner's QUIT. Read a transcript without the tracer's lines, answers
kept, with `sed 's/«MP[^»]*»//g'`; the `«MP …»` lines hold each prompt's keywords in both
languages, AllowNone, the base point and every object appended, modified or erased.

Writing one (the traps of `console.md` hold; these are the review's):

- A probe for one language only is `<id>.es.txt` or `<id>.en.txt` (`.pt.txt`…; `.plain` before it
  when untraced): `probe.sh` runs it in that locale alone (a Spanish name such as `POL` is POLYGON in
  English, and the run slips).
- **One question per probe**, ending back at the command prompt: a refused answer slips every line
  after it by one, and the runner flags the probe.
- Answers in the **underscore form** (`_LINE`, `_U`, `_C`), so one file runs in every language;
  a probe of the Spanish names (`LINEA`, `H` for undo) runs in es-ES only and says so in its index.
- `_ZOOM _W` around the drawing before any pick or window selection (`console.md`).
- **How far U and UNDO go is probed untraced**: name the file `<id>.plain.txt`. Loading the
  tracer leaves undo steps of its own (SECURELOAD, NETLOAD, MPTRACE), and U took them back
  silently in LINE's first probes.
- **An empty line at `Command:` repeats the last command**: end a probe on the command's own last
  answer, not on an extra Enter (FILLET ran twice in LINE's p60).
- A command that hangs the console (real-time PAN, 3DORBIT) goes last, in a probe of its own: every
  answer after it is lost. Between U and REDO read with `getvar` only: an `(ssget "_X")` there left
  REDO `Nothing to redo` (View review).
- Typed coordinates are taken as typed: with the console's OSMODE 4133 and OSNAPCOORD 2, a point
  typed beside an endpoint was not snapped (checked 2026-10-21). A snap is probed with a typed
  override (`_END`) and a point inside the aperture.
- A batched probe's fallback answer is a number: a word that lands at `Command:` can run a command
  (AutoComplete turned `ANGLE` into MEASUREMENT, es `ByLayer` ran SETBYLAYERMODE). The traced
  runner types `_SECURELOAD` itself, which becomes SETVAR's default, and filters its lines: probe
  SETVAR's default untraced. The trace's `AllowSpaces` is false even at -TEXT's `Enter text:`, and
  the console takes each line whole: whether a name takes a space is a desktop cell (Workspace).
- The console's clipboard is not Windows': its COPYCLIP writes nothing there and its PASTECLIP
  pastes whatever text the owner copied, as an MTEXT. What a paste produces is a desktop cell; redact
  the owner's text from a transcript; run clipboard probes with `PROBE_JOBS=1`; a desktop COPYCLIP
  overwrites the owner's clipboard, so ask first. A Lisp command missing a function in the console
  runs with a stub defined first (`AI_SELALL`'s INITCOMMANDVERSION; Clipboard review).
  Its paste is text's, an MTEXT's point: its refusals and its `(ssget "_I")` say nothing of an
  object paste, which is INSERT's jig (p108–p110 and erase/p263 refuted by clipboard/d02, d04).
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

A pick several commands share (`ObjectSelector`'s `one`): a mode's find mixing locked and unlocked
objects, for each of them (pieces/p395 found FILLET's).

Rows I, M, P and Q, the keys of G (Escape, the right button, SHORTCUTMENU), the tooltip of D and
the modes in combination (matrix.md) are desktop probes. So is a pass with DYNMODE 3 at every point prompt: the
dimensional fields are the command's own (RECTANG's other corner shows its sides, rectang/d05).

## 4. The desktop

Rules: `gui.md` of `autocad-research`, always. The owner's AutoCAD may be closed: open it with
`scripts/research/acad.sh launch` (the Spanish profile, as the owner's shortcut opens it; `launch ""
en-US` the English one) and wait for its window (`acad.sh wins`); with no other instance, COM
reaches it. Each language's profile has settings of its own: read and restore them per instance.

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
  read the view again after closing it. When Ctrl+1 does not reach AutoCAD, `com send
"_PROPERTIES\n"`; the palette may float on another monitor: capture it by its handle
  (`acad.sh wins`, `acad.sh shot <hwnd>`) (SPLINE's review).
- A grip's hover menu stays open until Escape, and the cursor moved meanwhile shows nothing new:
  press Escape and select again between two hovers.
- A click sent right after typed keys can be lost while AutoCAD still reads them: wait after
  typing.
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
  answer); -LINETYPE's file needs FILEDIA 0, put back after (CIRCLE's review). A prompt that takes
  spaces (-LAYER's name list) swallows the rest: each answer on a line of its own (`\n`), and a
  Spanish desktop types keywords in their global form (`_R`: FILLET's `R` is Recortar) (Corners).
- Escape with dynamic input's Down list open cancels the command, not the list: close it with
  Enter or the arrows mid-probe. The owner's Spanish profile shows only Spanish labels: plan the
  English ones apart (`ax26res.dll`, or a pass launched with `en-US`) or they stay unverified
  (ELLIPSE's review).
- The console's answer at a jig prompt to Enter or a keyword can be its artefact: SPLINE's p118
  took the fixed cursor as a tangent and p148 asked a tangent the desktop refuses (d11, d12). Check
  it on the desktop through COM alone, with no mouse; COM's space is an Enter, so `_T \n` is two
  answers (SPLINE's review).

- A press and drag (a lasso, a window by drag) needs the button held between screenshots:
  `scripts/research/probes/erase/drag.ps1` presses, moves, sends a key and releases in separate
  calls, the button held between them; a key held across a screenshot (Shift's badge) is a
  SendInput key-down in one process and its key-up in another (ERASE's review).
- `acad.sh click` moves the cursor 3 px off and back before clicking, which restarts selection
  cycling's stack: which candidate a click takes after Shift+Space needs a click without the
  jiggle (ERASE's review).
- A function key sent with `acad.sh key` (F10 for Polar) can open the ribbon's key tips as Alt does,
  and the next digit typed runs a Quick Access Toolbar button: a `5` ran Plot, whose dialog was
  cancelled with WM_COMMAND IDCANCEL. Set the variable through COM instead, for Polar
  `(setvar "AUTOSNAP" 63)`, for Ortho ORTHOMODE. What such an accident writes lands in AutoCAD's
  working directory, the repo's root (`plot.log`): look there afterwards (MOVE's review).
- The harness draws one world unit per pixel: a press within a few units of a short line's end
  lands on its grip, not on the line, so a drag probed in a scratch test uses long geometry.
- `drag.ps1` holds Ctrl (`ctrl`) or the right button (`right`) as `scripts/research/probes/move/`'s
  copy does: Ctrl held from the press is AutoCAD's sub-object pick, not a drag (move/d09).
- What a jig's field reads is not always the plain distance or angle: click at a known distance
  and read the object back (SCALE's factor is the distance over half the set's extents,
  transforms/d06, d07). Wait a second after typing a command before its first pick, or the pick
  can miss and Enter end the command empty (Transforms' review).
- A desktop drawing's variable can start otherwise than the console's: every new desktop drawing
  read OFFSETDIST 1 where the console, isolated, with `-r` and with acadiso.dwt, read −1 (offset/p05,
  d01-1). Read the desktop's value before trusting a default there. Plan each Enter a desktop step
  sends against the prompt it lands on: at a prompt whose Enter is Exit it ends the command, and the
  next click starts a window (OFFSET's review).
- A registry variable a desktop step changes (TRIMEXTENDMODE by mOde) reaches the console's
  isolated runs of that language, which start from the owner's profile: put it back at once and
  read it with `runacc.sh -r`. A key held on the desktop (Shift through `shift.ps1`) reaches the
  console runs going on at that moment (trim/p228 ran as EXTEND): hold none while subagents probe.
- A console answer to Enter at a prompt is checked on the desktop through COM alone, without the
  mouse: `com send "_TRIM\n\n\n"` and `com hist` tell one command asked twice from two commands
  (TRIM/EXTEND's review).

- A ghost under a far Endpoint marker (running END takes the nearer end of whatever the aperture
  crosses) trails the raw cursor while the click takes the marker: read a click's result, not the
  ghost, when a marker shows (pieces/d13). An Enter the console refuses at a jig prompt is checked
  through COM between two answers, `com send "_BREAK\n30,0\n\n60,0\n"`: refused, the second
  answer completes it; taken, it lands at `Command:` (pieces/d15).

- Keep every pick in the middle third of the view: one near its lower edge lands on the command
  line (the English profile's floats over the drawing), a window starts and the keywords typed
  next run as commands (`_AS` → CONEXIONBD). A keyword that writes a registry variable (`_AS _N` →
  ARRAYASSOCIATIVITY 0) is listed in the `dsk.sh` header, read after its case and put back. A
  dialog an accident opens is closed with a posted `WM_COMMAND IDCANCEL` when UIA cannot. End a
  case with Escape, never Enter at `Command:`: it repeats the last command and locks COM.
- A grip drag or palette edit is read back with `LIST` of the object's **handle** (`_L` is the
  last made, not the last edited), then undone with two U (LIST is a step of its own); turn the
  running snaps off (`com set OSMODE 0`, put back) while a drag's value is measured, or the click
  lands on a Center nearby. Keys typed into the Properties palette go to its own window
  (`acad.sh type "<text>" <palette hwnd>`, erasing first with `\b`): to any other, type.ps1 hands
  them to the frame's command line (Arrays review, d14, d20).
- When the command's object is not modelled yet, its desktop pass of grips, menus and palette goes
  in the review's first session anyway: it sizes the object's block before the plan (Arrays).

- Before any desktop click, capture the whole monitor AutoCAD is on: another window can cover it
  and take the click (properties/e01-1). Without the mouse, read a palette by its handle
  (`shot <hwnd>`) and a combo box's items with `CB_GETLBTEXT`. A task dialog's command link
  (`CommandLink_<id>`) is pressed with TDM_CLICK_BUTTON as `uia.ps1` presses its push buttons; a
  dialog whose Cancel UIA cannot invoke closes with a posted `WM_COMMAND IDCANCEL` (Properties review).
- A prompt that takes spaces (-STYLE's font, TEXT's style name) swallows the rest of a `com send`
  and locks COM: type each answer with `type` and `\n`. The English profile's new drawing has
  Standard on txt.shx (the console's has Arial): set `arial.ttf` before measuring text. Buttons UIA
  cannot press (the Text Style dialog's) are clicked at the rectangle `acad.sh children <hwnd>`
  gives. A click on a text off its strokes selects nothing: aim at a stem (Text review).

- When MellowProbe will not NETLOAD on the desktop (`loadmgd` in the command line), AutoCAD's
  own log reads the history: `LOGFILEMODE 1`, put back to 0; it lands in AutoCAD's working
  directory, the repo's root, and is moved to `research/probes/<command>/` at once. An object is
  picked without the mouse by its handle, `(handent "D8")` typed at an entsel or `Select objects:`
  prompt through COM (MATCHPROP's source and destination). A hatch's pattern is compared line for
  line by EXPLODE in the console (hatch/p300–p307) (HATCH review).

- The console skips a dialog a command opens midway: -BLOCK's Convert asked nothing there (p134,
  p305), where the desktop opens Edit Attributes (d00, d01). A console run that ends without a
  prompt after a step that may open a dialog is rerun on the desktop through COM, and `acad.sh wins`
  lists the dialog. A modal dialog locks COM: send its command in the background (`com send … &`),
  read it with `uia` or `shot <hwnd>`, close it with `acad.sh post <hwnd>` (IDCANCEL). Words a
  desktop refusal shows that the merged tables lack are found by their UTF-16 text in the
  install's `en-US/*.dll`, then read with `strtable.mjs` (atteditRes.dll; Blocks review).

- A `com send` ending in a space leaves LINE waiting for its next point: end it with `\n\n`, or
  draw with PLINE. The Properties palette's groups fold by the arrow at the header's right, and the
  fold persists in the profile: unfold them before closing (Dimensions review).

- An overlay's colour is read from the screenshot's pixels (a few lines of Python with `zlib`: PIL
  is not installed) beside the background's, which tells a translucent fill from a solid one
  (AREA's green, inquiry/d03-1). What dynamic input shows depends on the profile's DYNMODE
  features, not only its sign: probe it with DYNMODE 3 too (inquiry/d02-1 against e01-1).

- COM's SendCommand turns DYNMODE negative while it runs and puts it back after: `com set` and
  `(setvar)` do not hold it, and a command sent through COM shows no dynamic input. Set it and start
  the command by typing (`type -text '-1\n'`: a bare `-1` is a PowerShell switch). U names a menu
  entry showing a key with the key glued (`PasteCtrl+V GROUP`): probe one apart (Clipboard, CFD).

- Read U's echo with `com hist` before any `com eval` or `get`: each writes lines of its own and
  pushes the echo out. `click … wheel -count -1` turns the wheel towards the user (a bare `-1`
  reads as a switch); gaps under a second between wheel events come from one process
  (`scripts/research/probes/view/burst.ps1`), never from separate calls (View review, d01).

- Each profile places the view otherwise (the es-ES drawing area was 2560 wide and its view
  lower than `VIEWCTR` says): draw a known rectangle and read its pixels before the first click
  there. A shortcut menu opened from the ViewCube's UCS button can start a command (New UCS) that
  locks COM: a click on the command line gives the keys back for Escape (UCS review).

- A word typed at `Command:` goes through AutoComplete: `AB` + Space ran ABOUT, whose dialog took
  every key after it, and a typed `-BLOCK` was lost. Start the command with `com send` in the
  background and type only the answer. Read U's names in a drawing of their own (`com new`):
  earlier steps mix in. A status-bar click right after `com new` is lost: click the drawing
  first (Workspace review, WSD).

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
A harness option the config does not know is dropped in silence (`layers` locked nothing, and a
`differs` went into the Corners plan): read a scratch test's setup back before trusting it. Each
scratch test names the probe it reproduces; in the execution it moves, as is, into the
command's test file and its citation stays.
