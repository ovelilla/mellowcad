#!/usr/bin/env bash
# The TRIM/EXTEND review's desktop session (the owner's AutoCAD, Spanish profile, 2026-10-22), the
# gestures in the order run. It clicks and types on the owner's screen: ask first, and tell them
# when it is over. Needs a drawing of the review's own (acad.sh com new), MellowProbe loaded for
# `com hist` (acad.sh com netload) and the command line shown (_COMMANDLINE). Settings read before,
# put back after: ORTHOMODE 0, AUTOSNAP 55 (Polar by setvar 63, never F10), TRIMEXTENDMODE 1 (mOde
# Estándar leaves it 0), CLISTATE 0 (_COMMANDLINEHIDE, its task dialog answered Sí); left as found:
# DYNMODE -1, OSMODE 4133, SHORTCUTMENU 11, PICKFIRST 1, SELECTIONPREVIEW 3, EDGEMODE 0, PROJMODE 1,
# PICKBOX 3. Screenshots: research/probes/trim/d<id>-*.png. Shift is held across a hover with
# shift.ps1 (down in one process, up in another).
source "$(dirname "$0")/lib-dsk.sh"
$A com send "_ZOOM _C 50,25 100\n"
$A com send "_LINE 10,25 90,25 \n"; $A com send "_LINE 30,5 30,45 \n"
$A com send "_LINE 60,5 60,45 \n"; $A com send "_LINE 40,38 50,38 \n"
# d01 TRIM's ghost: the piece a click would remove drawn dimmed in place (grey, thin, solid), the
# rest untouched, the pick box with a small red X; a line no edge crosses dimmed whole (Quick
# deletes it). Shift held: the line as it would be extended, whole, in the selection's blue glow,
# no X; Shift+click extends it to the edge (40,38 → 60,38). The prompt lists Proyección.
mv 75 5; at 75 5; ty '\e'; ty '_TRIM\n'; sleep 1; mv 45 25.3; mv 45 25.1; scr 50 25 d01-1
cl 200 d01-cl1; mv 48 38.3; mv 48 38.1; scr 50 30 d01-2
sh down; mv 48.2 38.2; mv 48.2 38.1; scr 50 30 d01-3; sh up
at 48.4 38.1 left 1 shift; ty '\n'
# d02 EXTEND's ghost: the line as it would be, whole, in the blue glow; Shift: TRIM's ghost (the
# whole line dimmed, no edge crossing it), and Shift+click deletes it (5 objects → 4).
$A com send "_LINE 38,15 45,15 \n"; mv 75 5; at 75 5; ty '\e'; ty '_EXTEND\n'; sleep 1
mv 43 15.3; mv 43 15.1; scr 50 22 d02-1; cl 200 d02-cl1
sh down; mv 43.2 15.2; mv 43.2 15.1; scr 50 22 d02-2; sh up
at 43.2 15.1 left 1 shift; ty '\n'
# d03 a click on nothing starts the fence: a dashed white line from its first point, the full
# crosshair with the red X, `Precise punto del borde o` with no field, and what it will trim dimmed
# as it runs; the history writes the object prompt again with desHacer, then the fence prompt
# three or four times (the jig's echo).
ty '_TRIM\n'; sleep 1; mv 70 40.3; at 70 40; mv 70.3 12; mv 70.1 12; scr 55 25 d03-1
cl 200 d03-cl1; at 70.1 12; ty '\n'
# d04 a press and drag on nothing: a freehand dashed fence following the cursor, its trims dimmed
# while dragging, done at the release.
ty '_TRIM\n'; sleep 1; mv 20 40.3; dr down 20 40; dr move 22 30; dr move 18 12; scr 30 25 d04-1
dr up 18 12; scr 30 25 d04-2; ty '\n'
# d05 the right button: at the object prompt Intro, Cancelar, the keywords, Encuadre, Zoom,
# SteeringWheels, Calculadora rápida (no Entrada reciente, no Modificaciones de REFENT); at the
# fence's next point Intro, Cancelar, desHacer, Modificaciones de REFENT, Encuadre, Zoom,
# SteeringWheels, Calculadora rápida.
ty '_TRIM\n'; sleep 1; at 75 40 right; scr 85 30 d05-1; ty '\e'; ty '\e'; ty '\e'
ty '_TRIM\n'; sleep 1.2; mv 75 42.3; at 75 42; mv 76 38; mv 76 37.8; at 76 37.8 right
scr 85 30 d05-2; cl 200 d05-cl2; ty '\e'; ty '\e'; ty '\e'
# d06 mOde Estándar mid-command: no edges asked, the object prompt again with Borde, Arista and
# desHacer; a click on nothing draws a green crossing window (its tooltip `Precise punto del borde
# o`), its trims dimmed, and trims at its far corner.
ty '_TRIM\n'; sleep 1; ty 'MO\n'; ty 'E\n'; cl 200 d06-cl1; mv 30 35.3; mv 30 35.1
scr 40 25 d06-1; at 30 35.1; mv 70 45; at 70 45; mv 55 30; mv 55 30.2; scr 50 30 d06-2
at 55 30.2; scr 40 25 d06-3; cl 200 d06-cl3; ty '\n'; $A com eval '(setvar "TRIMEXTENDMODE" 1)'
# d07 Ortho, then Polar, at the fence's next point: neither bends its line.
$A com eval '(setvar "ORTHOMODE" 1)'; mv 80 40; ty '_TRIM\n'; sleep 1.2; mv 80 42.3; at 80 42
mv 84 10; mv 84 10.2; scr 70 28 d07-1; ty '\e'; ty '\e'; $A com eval '(setvar "ORTHOMODE" 0)'
$A com eval '(setvar "AUTOSNAP" 63)'; mv 80 40; ty '_TRIM\n'; sleep 1.2; mv 80 42.3; at 80 42
mv 70 32; mv 70.2 32.2; scr 70 28 d07-2; ty '\e'; ty '\e'; $A com eval '(setvar "AUTOSNAP" 55)'
# d08 (a new drawing: H, V1, V2) two trims then Escape keeps both; one U, `RECORTA`, puts H back.
$A com close; $A com new; $A com send "_ZOOM _C 50,25 100\n"
$A com send "_LINE 10,25 90,25 \n"; $A com send "_LINE 30,5 30,45 \n"
$A com send "_LINE 60,5 60,45 \n"; mv 80 40; at 80 40; ty '\e'; ty '_TRIM\n'; sleep 1.2
mv 45 25.3; at 45 25; mv 80 25.3; at 80 25; ty '\e'; $A com eval '(sslength (ssget "_X"))'
$A com send "_U\n"; $A com hist 6
# d09 what TRIM cannot change: a circle one line crosses once and a TEXT show the "not allowed"
# badge and no ghost; a click on the text says `Objeto no procesado por RECORTA.`
$A com send "_CIRCLE 75,38 5\n"; $A com send "_LINE 75,38 88,38 \n"; $A com send "_-TEXT 70,8 3 0 Hola\n"
ty '_TRIM\n'; sleep 1.2; mv 70 38.3; mv 70 38.1; scr 75 25 d09-1; mv 73 9.3; mv 73 9.1
scr 75 25 d09-2; at 70 38.1; at 73 9.1; ty '\n'; $A com hist 16
