# The Workspace review's desktop pass (block WSD), 2026-10-28: d01–d08 in the en-US profile
# (`acad.sh launch "" en-US`), e01 in the es-ES one (`acad.sh launch`, its command line hidden).
# A drawing of the review's own (`acad.sh com new`, `com netload` for `hist`); positions are the
# 2560×1440 second monitor's with the Assistant docked (lib-dsk.sh). Run step by step: a typed
# `-BLOCK` or `AB` + Space at `Command:` runs ABOUT (AutoComplete) and its dialog takes the keys,
# so a command is started with `com send` in the background and only its answer is typed.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk.sh"
cs "_LINE 0,0 100,50\n\n"; cs "_ZOOM _C 50,25 120\n"

# d01 The status bar. Grid (4636,1377), Snap (4660), Ortho (4704), Polar (4732): each click
# echoes as its key, ` <Grid on>`, ` <Ortho on>`, ` <Polar on>`, ` <Snap on>`, at `Command:` and,
# inside LINE, after the prompt (`Specify next point or [Undo]:  <Ortho off>`, d01-2, d01-3).
# F7, F8, Ctrl+W echo ` <Grid on>`, ` <Ortho on>`, ` <Selection Cycling on>`. U after a toggle
# takes it back with the step before: LINE, F7 → U writes `LINE`, the line and the grid gone;
# LINE, Grid, LINE → U the second line only, U again the first and the grid.
# Clean Screen (5078,1377): no echo, and three steps U names RIBBONCLOSE, CLEANSCREENON, RIBBON.
# Snap ▾ (4680): Polar Snap, Grid Snap ✓ | Snap Settings... (d01-m-snap); Polar ▾ (4748): 90, 45,
# 30, 23, 18, 15, 10, 5, each `90, 180, 270, 360...` | Tracking Settings... (d01-m-polar); 45
# chosen writes nothing and turns Polar on (AUTOSNAP 55 → 63, put back).
p 800 500; ty "\e"; k f7; k f8; k ctrl+w; $A com send "_U\n"; hist 20
cs "_LINE 0,0 100,50\n\n"; $A click 5078 1377 >/dev/null; for i in 1 2 3 4; do $A com send "_U\n"; done; hist 30

# d02 The ribbon. Line (2583,83) then U: `LINE GROUP`. Match Properties (3768,90) during LINE:
# `'_matchprop`, `MATCHPROP >>Select source object:` (d02-1); Escape `*Cancel*`, `Resuming LINE
# command.` (d02-3). Typed at LINE's point: `'MATCHPROP`, `'PROPERTIES`, `'LAYER`,
# `'BLOCKSPALETTE` run and resume LINE (the palettes open; d02-4, d02-5, d02-t-*); `'VIEW` and
# `'EATTEDIT` write `** That command may not be invoked transparently **` and `Point or option
# keyword required.`. Ribbon Move during a grip edit: `_move` after the STRETCH prompt, then
# `** MOVE **` (d02-7, d02-8). Close the palettes after: _PROPERTIESCLOSE, _LAYERCLOSE,
# _BLOCKSPALETTECLOSE.
p 18 65; ty "0,0\n100,0\n\n"; $A com send "_U\n"; hist 6
ty "_LINE\n"; ty "10,10\n"; p 944 70; crop 3000,1180,1200,180 d02-1; ty "\e"

# d03 The shortcut menus (a right-click at 3400,700; Edit with the line selected, d03-1; Default,
# d03-2). Erase: `_erase 1 found`, U `Erase GROUP`; Move: `_move 1 found`, U `Move GROUP`;
# Deselect All: no echo, `Everything has been deselected`, U `GROUP Deselect All`; Properties:
# `_properties`, U `GROUP Properties`; Pan: `'_pan`, U `Pan GROUP`; Undo: `_u PROPERTIESCLOSE`.
# The Default menu's Undo and Redo carry the step: `Undo Propertiesclose`, `Redo Propertiesclose`,
# `Undo Grip edit` (d03-3).
$A com eval '(sssetfirst nil (ssget "X"))'; $A click 3400 700 right; $A click 3441 820
$A com send "_U\n"; hist 10

# d04 The keys inside LINE: `*Cancel*`, then `_CleanScreenON` / `_CleanScreenOFF`,
# `_commandlinehide` (a task dialog asks "Do you want to close the Command Line window?", d04-1),
# `_properties` / `_propertiesclose`, `_qsave` (Save Drawing As, closed with post). U after each:
# `GROUP PROPERTIESCLOSE`, `GROUP PROPERTIES`, `RIBBONCLOSE`, `CLEANSCREENON GROUP`, `RIBBON`,
# `GROUP QSAVE`. With Clean Screen on, Ctrl+1 shows the palette and Clean Screen stays (d04-2).
ty "_LINE\n"; ty "10,10\n"; k ctrl+0; k ctrl+0; k ctrl+9; k ctrl+1; k ctrl+1; k ctrl+s

# d05 UNITS (modal: sent in the background, read by uia and CB_GETLBTEXT, closed with post): the
# Precision list 0, 0.0 … 0.00000000; `Units to scale inserted content:` over the Insertion scale
# list (d05-1). Cancel, then U: `UNITS`. The application menu's Drawing Utilities ▸ Units during
# LINE: `*Cancel*`, `_UNITS` (d05-4), U `UNITS GROUP`.
($A com send "_UNITS\n" &); $A wins; $A uia <hwnd>; $A post <hwnd>; $A com send "_U\n"; hist 4

# d06 `AB CD` typed key by key is taken whole at UCS Delete, PLAN's UCS name, -BLOCK's name and
# its `?` list, -INSERT (`"AB CD.dwg"` not found), -PURGE's names, TEXT's Style, -DIMSTYLE Save
# and Restore, -LINETYPE Load (FILEDIA 0, put back to 1) and Set, SETVAR USERS1's value (put back
# to "").
($A com send "_-DIMSTYLE _S\n" &); ty "AB CD"; ty "\n"; ty "\e\e"; hist 8

# d07 SETVAR: `?` with `*` pages 20 variables, then `Press ENTER to continue:` (d07-1); Escape at
# a nested `'AUPREC`: `*Cancel*`, `Resuming SETVAR command.`, ORTHOMODE's prompt again; dynamic
# input `Enter variable name or` ↓ with the last variable in the box (d07-4), `Enter new value
# for ORTHOMODE <0>:` with 0 in it (d07-5); a preselection is gone after ORTHOMODE typed.
($A com send "_SETVAR ?\n" &); ty "\n"; full d07-1

# d08 PolarSnap (SNAPUNIT 5,5, SNAPTYPE 1, SNAPMODE 1, AUTOSNAP 63, OSMODE 0; all put back): LINE
# from 0,0, the cursor at 23.3,0 → (25,0) with POLARDIST 0 (d08-1), (20,0) with 10 and with -10.

# e01 The Spanish profile: ` <Rejilla activado>`, ` <Orto activado>`, ` <Polar activado>`,
# ` <Forzcursor activado>` from the status bar; the Edit menu Borrar, Desplazar, Copiar selección,
# Escala, Girar … Anular selección … Propiedades (e01-1); Default Deshacer Grupo de comandos,
# Rehacer, Encuadre (e01-2); `_erase 1 encontrados`, U `Borrar GRUPO`; `Se ha anulado la
# selección de todo`, U `GRUPO Anular selección`; U `GRUPO Propiedades`; `'_pan`, U `Encuadre
# GRUPO`; Snap ▾ Referencia polar, Referencia a rejilla | Configuración de referencia a objetos...
# (e01-3); Polar ▾ as English's | Parámetros de rastreo... (e01-4).
