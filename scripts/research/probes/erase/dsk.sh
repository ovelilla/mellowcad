#!/usr/bin/env bash
# ERASE's desktop session (the owner's AutoCAD, Spanish profile, 2026-10-21), the gestures in the
# order run. It clicks, drags and types on the owner's screen: ask first, and tell them when it is
# over. Needs a drawing of the review's own (acad.sh com new), the command line shown
# (_COMMANDLINE) and MellowProbe loaded for com hist (acad.sh com netload). Settings read before,
# put back after: SELECTIONCYCLING 0, CLISTATE 0 (hidden again with _COMMANDLINEHIDE, its task
# dialog answered Sí); left as found: DYNMODE 0, OSMODE 4133, PICKADD 2, PICKAUTO 5, PICKDRAG 2,
# PICKFIRST 1, SELECTIONPREVIEW 3, SHORTCUTMENU 11, ROLLOVERTIPS 1, PICKBOX 3.
# Screenshots: research/probes/erase/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
$A com send "_ZOOM _C 50,25 100\n"
$A com send "_LINE 20,10 45,10 \n"; $A com send "_LINE 20,20 45,20 \n"; $A com send "_CIRCLE 70,25 8\n"
$A com send "_LINE 55,40 85,40 \n"; $A com send "_LINE 55,40 85,40 \n"
# d01 at Comando: a hover thickens the line and shows the rollover tooltip (Línea, Color PorCapa,
# Capa 0, Tipo de línea PorCapa); a pick selects it (glow, blue grips) and another adds; each pick
# writes an empty `Comando:` line
mv 90 0; mv 30 10; scr 35 15 d01-1; at 30 10; mv 40 0; scr 35 15 d01-2; at 30 20; mv 40 0
scr 35 15 d01-3; cl 260 d01-cl
# d02 a click on nothing, then the cursor right: a window, blue fill and a solid white outline, what
# it encloses previewed; the prompt `Precise esquina opuesta o [Borde/polígonOV/polígonOC]:`
ty '\e'; at 15 5; mv 50 24; scr 35 15 d02-1; cl 260 d02-cl1; at 50 24; mv 60 0; scr 35 15 d02-2
# d03 leftwards: a crossing, green fill and a dashed white outline; the history line
# `Comando: Precise esquina opuesta o [Borde/polígonOV/polígonOC]:`; Escape `Comando: *Cancelar*`
ty '\e'; at 40 25; mv 25 5; scr 35 15 d03-1; cl 260 d03-cl1; at 25 5; mv 60 0; cl 260 d03-cl2; ty '\e'
# d04 a press and drag rightwards on nothing: a window LASSO along the cursor's path, the line
# `Ventana Forma irregular: pulse la barra espaciadora para recorrer las opciones.`; Space cycles it
# to Borde, then Captura, then Ventana (each a line of its own); released, it selects
dr down 15 5; dr move 18 8; dr move 30 28; dr move 50 24; scr 35 15 d04-1; cl 260 d04-cl1
sp; dr move 49 23; scr 35 15 d04-2; sp; dr move 48 22; scr 35 15 d04-3; cl 260 d04-cl3
sp; dr move 49 23; dr up 50 24; mv 60 0; scr 35 15 d04-4; ty '\e'
# d05 leftwards: a crossing lasso, green and dashed, `Captura Forma irregular: …`; what it crosses
# is selected
dr down 40 25; dr move 37 22; dr move 25 5; scr 35 15 d05-1; dr up 25 5; mv 60 0; scr 35 15 d05-2
cl 260 d05-cl2; ty '\e'
# d06 with no command, a click on nothing then B (Borde): a fence, `Precise punto del borde o
# [desHacer]:`; Enter selects what it crosses
at 15 15; ty 'B\n'; cl 260 d06-cl1; at 32 5; mv 32 30; scr 35 15 d06-1; at 32 30; ty '\n'; mv 60 0
scr 35 15 d06-2; cl 260 d06-cl3
# d07 Shift+pick takes a selected line out; Shift at the first click of a window removes what it
# encloses
at 35 20 left 1 shift; mv 60 0; scr 35 15 d07-1; ty '\e'; at 30 10; at 30 20; at 15 5 left 1 shift
at 50 24 left 1; mv 60 0; scr 35 15 d07-2; ty '\e'
# d08 Escape with a clicked window under way drops the window, keeps the selection: `Comando:
# Precise esquina opuesta o [Borde/polígonOV/polígonOC]: *Cancelado*`
at 30 10; at 15 15; mv 40 24; ty '\e'; mv 60 0; scr 35 15 d08-1; cl 260 d08-cl1; ty '\e'
# d09 ERASE: at `Designe objetos:` the pick box alone, no crosshair; a hovered object fades, a red ×
# beside the cursor; `Designe objetos: 1 encontrados`; a clicked window `Designe objetos: Designe
# esquina opuesta: 1 encontrados, 2 total`; a crossing lasso `Captura Forma irregular: …` then
# `3 encontrados, 5 total` on a line of its own, the set faded; Shift+pick `1 encontrados,
# eliminados 1, 4 total`; the right button ends the set and erases, nothing said after
mv 60 0; ty '_ERASE\n'; mv 40 0; scr 35 15 d09-1; mv 30 10; scr 35 15 d09-2; at 30 10; mv 60 0
at 15 15; mv 50 24; scr 35 15 d09-3; at 50 24; mv 60 0
dr down 66 45; dr move 62 42; dr move 60 15; dr move 80 12; scr 65 25 d09-4; dr up 80 12; mv 60 0
at 35 20 left 1 shift; mv 60 0; at 90 0 right; cl 260 d09-cl7; $A com hist 40
# d10 Escape at `Designe objetos:` after a pick: nothing is left selected ((ssget "_I") nil)
$A com send "_LINE 20,10 45,10 \n"; $A com send "_LINE 20,20 45,20 \n"
$A com send "_LINE 55,40 85,40 \n"; $A com send "_CIRCLE 70,40 5\n"
mv 60 0; ty '_ERASE\n'; at 30 10; mv 60 0; ty '\e'; scr 35 15 d10-1
$A com eval '(if (ssget "_I") (sslength (ssget "_I")) 0)'
# d11 a preselection, then: `B` typed → `Comando: B` / `BORRA 1 encontrados`; `DESPLAZA` →
# `Comando: DESPLAZA` / `1 encontrados`; the Delete key → `Comando: _.erase 1 encontrados`
$A com send "_LINE 20,10 45,10 \n"; $A com send "_LINE 20,20 45,20 \n"
at 30 10; mv 60 0; ty 'B\n'; at 30 20; mv 60 0; ty 'DESPLAZA\n'; ty '\e'
$A com send "_LINE 20,10 45,10 \n"; at 30 10; mv 60 0
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$D" key 46 0; $A com hist 30
# d12 SELECTIONCYCLING 2: over a line and a circle the badge (two squares) and the topmost's
# tooltip; a click opens the `Selección` list (Círculo, Línea, Ninguna), the first previewed with
# its grips; hovering an entry previews it, clicking chooses it; Shift+Space walks the stack
$A com eval '(setvar "SELECTIONCYCLING" 2)'; mv 60 0; mv 65 40; scr 65 35 d12-1; at 65 40
$A shot -hwnd -1 -crop "1100,300,900,600"; $A click 1540 694 none; $A click 1540 694 left
$A com eval '(cdr (assoc 0 (entget (ssname (ssget "_I") 0))))'; ty '\e'; mv 65 40
$A key shift+space; scr 65 35 d12-5; $A key shift+space; scr 65 35 d12-6; at 65 40; scr 65 35 d12-7
# d13 SELECTIONCYCLING 1 and at ERASE's `Designe objetos:` (click.ps1's jiggle restarts the stack:
# which candidate a click takes after Shift+Space stays unverified)
$A key esc; ty '\e\e'; $A com eval '(setvar "SELECTIONCYCLING" 1)'; mv 65 40; at 65 40
ty '\e'; ty '_ERASE\n'; mv 65 40; scr 65 35 d13-2; $A key shift+space; scr 65 35 d13-3; $A key esc esc
$A com eval '(setvar "SELECTIONCYCLING" 0)'
# d14 Shift held (key down from a separate SendInput, screenshots between): no badge over nothing
# at Comando: (d14-1) nor at `Designe objetos:` (d14-2); over a selected line at Comando: a minus
# badge (d14-3); over an unselected one none (d14-5); over a picked one at ERASE's prompt none (d14-6)
