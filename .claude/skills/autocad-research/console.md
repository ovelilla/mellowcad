# The console

`scripts/research/runacc.sh [-t] [-r] [-i drawing] probe.txt` feeds a file of answers, one per
line, to `accoreconsole.exe` of the AutoCAD 2027 installed on Windows and prints the transcript;
its header says what each flag does. Set `ACCORE` to use another install. A run takes about 2 s,
11 s traced (`-t`, tracing.md).

- A command review keeps its probes as files and runs them in both languages with
  `scripts/research/probe.sh` (skill `command-review`).
- **Each run is isolated**: `/isolate` gives it a registry hive and user folder of its own,
  removed afterwards, and runs can go in parallel. Variables that live in the registry
  (TRIMEXTENDMODE, UNDO's Combine and Layer…) start at the owner's profile of that language, not at
  their defaults: a desktop pass that changes one changes every isolated run after it (trim/p109). `-r` runs in the
  user's real profile instead, where whatever the probe sets persists: restore it.
- **Encoding**: the console reads its input as Windows-1252 and the runner converts the probe;
  `/utf8` makes it write UTF-8 (by default it writes UTF-16).
- **Languages**: Spanish by default, the install's; any other installed pack by its culture,
  `runacc.sh probe.txt en-US` (the packs installed: SKILL.md). The same underscore-form probe runs
  in each: run it in a language and in English to pair each prompt with its translation
  (`probe.sh --lang <tag>` does both, skill `command-review`; `--lang-only` the language alone,
  and `console-pair.mjs` pairs it with the English already run). A run that hangs (pt-BR's `?` at
  UCS Restore, ucs/p235) is stopped after `ACC_TIMEOUT` seconds, the Windows process with it.

## Probes

Verified on the 2027 console, October 2026.

- **Type commands and keywords in their underscore form** (`_LINE`, `_L`, `_Y`): the console
  refuses a bare English name (`Comando "LINE" desconocido`) and takes the local one (`LINEA`);
  the underscore form runs in either language.
- **Keep a probe short.** A refused answer desyncs everything after it.
- **End every probe back at `Comando:`.** A command left open eats the runner's QUIT and the
  console crashes at the end of the input (exit 1, a report in Autodesk's CER folder).
- **Select after `ZOOM E`.** The initial view (VIEWCTR 2630.05,1440.68, VIEWSIZE 2653.73) does not
  contain the origin, and a typed pick or a `W`/`C` window finds only what is on screen. `L`
  needs nothing.
- **Hangs and gaps**: TEXT's text entry and 3DORBIT hang the console (use `-TEXT`); `LAYER`
  kills it at once (use `-LAYER`). VIEW, PROPERTIES, MATCHPROP, BLOCKSPALETTE and EATTEDIT
  are unknown to it; `-VIEW` works, and PURGE runs as `-PURGE` (blocks/p152). Enter after an
  unknown command echoes `_HELP`.
- **Each answer echoes once**, after its prompt. A jig is fed one keystroke at a time (tracing.md
  shows the samples). Lisp typed at a prompt is evaluated and its result taken as the answer
  (`(princ 7)` at CIRCLE's radius makes a radius 7); at a string prompt it is literal text. Read
  state between commands.
- **The console's cursor is a fixed screen pixel**, the view's lower-left corner:
  `289.98397,116.30379` in the initial view, elsewhere after a ZOOM or PAN. A direct distance, a
  dragged angle or distance take it as the cursor; tests that reproduce a console value move the
  harness cursor there.
- Before declaring what a prompt refuses, type `FOO` at it: the words differ per input function
  (`Punto no válido.`, `Requiere una distancia numérica o dos puntos.`, `Sí o No.`…).
  Whether a prompt keeps or sets LASTPOINT: `ID @` after the command.
- `(getvar "VIEWSIZE")` reads the view without making an undo step, and
  `(trans (getvar "LASTPOINT") 1 0)` gives LASTPOINT in the WCS. `QAFLAGS 2` makes LIST stop
  pausing (its `Pulse INTRO para continuar` eats the next answers otherwise).
- **Menu macros** are in `acad.cuix`, a zip (`UserDataCache/es-es/Support/` of the install):
  Ctrl+Z and Edit > Undo are `_u`, the default context menu's Undo is `^C^C_u`, Ctrl+Y and
  Edit > Redo are `^C^C_mredo 1`.

## Rendering a drawing to PNG

The console plots: `_-PLOT` to the `PublishToWeb PNG.pc3` device writes an image of the drawing
as AutoCAD renders it — linetypes, hatches, dimensions, fonts, lineweights. The answers, in
order (the Spanish paper name is why the probe must reach the console as Windows-1252):

```
_-PLOT
_Y
Model
PublishToWeb PNG.pc3
Sun Standard (1152.00 x 900.00 píxeles)
_L
_N
_E
_F
_C
_Y
monochrome.ctb
_Y
_A
C:\Users\<user>\AppData\Local\Temp\plot.png
_N
_Y
```

Detailed setup, layout, device, paper (`?` lists them), landscape, not upside down, Extents, Fit,
centred, plot styles, monochrome, lineweights, shading as displayed, file, do not save the page
setup, proceed. Write the file to a Windows path and Read it from `/mnt/c`.

## Files in and out

- `-i drawing.dxf` opens a DXF as well as a DWG, so a file this app exports can be checked by the
  program that defines the format.
- `_DXFOUT` (`_V`, then the version `2018`, then the precision) and `_.SAVEAS` (`2018`, path)
  write DXF and DWG.

## Switches

The usage line accoreconsole prints lists `/i`, `/s`, `/product`, `/l`, `/isolate`, `/readonly`,
`/p`, `/loadmodule` and `/supportfilesmap`. Its binary holds more; measured on 2027:

- `/utf8` — UTF-8 output.
- `/processedoutput:on` — the raw echo: each keystroke redraws the prompt line with a backspace.
- `/autoisolate` picks a free `AutoIsolate<n>` folder (and reuses it next time); `/cleanisolate`
  and `/cleanautoisolate` remove isolation data.
- `/loadmodule` loads native modules only: a .NET assembly needs `_NETLOAD` in the script, from a
  Windows path (not `\\wsl.localhost`) and with SECURELOAD 0, or a security dialog hangs the run.
- `/noCER` — a crash ends the process without opening the error-report window.
- Seen in the binary, not tried: `/noxref`, `/fonts`, `/suppressGraphics`, `/recover`,
  `/lazyload`, `/logPath`, `/waitForDebugger`.
