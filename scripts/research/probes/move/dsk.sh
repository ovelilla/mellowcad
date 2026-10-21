#!/usr/bin/env bash
# MOVE and COPY's desktop session (the owner's AutoCAD, Spanish profile, 2026-10-21), the gestures
# in the order run. It clicks, drags and types on the owner's screen: ask first, and tell them when
# it is over. Needs a drawing of the review's own (acad.sh com new), the command line shown
# (_COMMANDLINE) and MellowProbe loaded for com hist (acad.sh com netload). Settings read before,
# put back after: AUTOSNAP 55 (Polar set with setvar 63: F10 sent as a key opened the ribbon's key
# tips like Alt, and the next digit ran the Quick Access Toolbar's Plot), ORTHOMODE 0 (F8 twice),
# CLISTATE 0 (_COMMANDLINEHIDE, its task dialog answered Sí); left as found: DYNMODE -1 (the
# tooltip on), OSMODE 4133, DRAGMODE 2, PICKFIRST 1, PICKDRAG 2, SHORTCUTMENU 11, COPYMODE 0,
# DYNPICOORDS 0, SELECTIONPREVIEW 3. Screenshots: research/probes/move/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
$A com send "_ZOOM _C 50,25 100\n"
$A com send "_LINE 20,10 45,10 \n"; $A com send "_CIRCLE 30,25 5\n"; $A com send "_LINE 55,40 85,40 \n"
# d01 MOVE, base on the line's end: the set drags drawn as itself (solid, its own colour) at the
# cursor, the original faded where it was; the rubber band from the base a dashed orange line; the
# cursor's badge a four-way arrow; the tooltip `Precise segundo punto o <usar primer punto como
# desplazamiento>:` with a distance field and an angle field
ty '_MOVE\n'; at 32 10; ty '\n'; at 20 10; mv 40 30; mv 41 31; scr 40 20 d01-1; cl 200 d01-cl1; ty '\e'
# d02, d11 COPY: the originals keep the selection's glow (not faded), the copy drags solid; the
# tooltip `Precise el segundo punto o` with the keyword arrow; the cursor's badge the copy one
mv 70 5; ty '_COPY\n'; at 30 20; ty '\n'; ty '0,0\n'; mv 40 30; mv 41 31; scr 40 20 d02-1
at 41 31; mv 50 30; mv 51 31; scr 40 20 d02-2; cl 200 d02-cl2
# Escape mid-COPY: the copy stays, nothing selected ((0 4))
ty '\e'; $A com eval '(list (if (ssget "_I") (sslength (ssget "_I")) 0) (sslength (ssget "_X")))'
# a preselection, MOVE, Escape at the base point: nothing left selected (0); COPY noun-verb, a copy
# typed in the tooltip (echoed `@5,-12`), Escape: nothing selected ((0 5))
at 35 25; mv 70 5; ty '_MOVE\n'; mv 60 5; ty '\e'; $A com eval '(if (ssget "_I") (sslength (ssget "_I")) 0)'
ty '\e'; at 35 25; mv 70 5; ty '_COPY\n'; ty '0,0\n'; ty '5,-12\n'; ty '\e'
$A com eval '(list (if (ssget "_I") (sslength (ssget "_I")) 0) (sslength (ssget "_X")))'
# d03 Ortho (F8) at MOVE's second point: the drag and the rubber band horizontal, the tooltip
# `Orto: 21.0324 < 0°` alone; 10 typed moves 10 along it (line start 30,10)
$A com send "_ERASE _ALL \n"; $A com send "_LINE 20,10 45,10 \n"; $A com send "_CIRCLE 30,25 5\n"
mv 70 5; at 32 10; mv 70 5; ty '_MOVE\n'; ty '#20,10\n'; $A key f8; mv 40 16; mv 41 17; scr 40 20 d03-1
ty '10\n'; $A key f8; $A com eval '(cdr (assoc 10 (entget (entnext))))'
# d04 Polar: the green dotted path through the base, the × on it, `Polar: 16.0195 < 90°`; 5 typed
# moves 5 along it (line start 30,15)
$A com eval '(setvar "AUTOSNAP" 63)'; mv 70 5; at 40 10; mv 70 5; ty '_MOVE\n'; ty '#30,10\n'
mv 31 25; mv 30.6 26; scr 40 20 d04-1; ty '5\n'; $A com eval '(cdr (assoc 10 (entget (entnext))))'
# d05 the right button at MOVE's second point (no keywords there): Enter, the first point as the
# displacement (line start 60,30), no menu
mv 70 5; at 40 15; mv 70 5; ty '_MOVE\n'; ty '#30,15\n'; mv 40 30; at 40 30 right; $A com hist 8
# d06 the right button at COPY's first second point: a menu, Intro, Cancelar, Entrada reciente,
# Entrada dinámica, Matriz, Modificaciones de REFENT, Encuadre, Zoom, SteeringWheels, Calculadora
# rápida; Intro copies by the first point and ends COPY (3 objects)
$A com send "_ERASE _ALL \n"; $A com send "_LINE 30,15 55,15 \n"; $A com send "_CIRCLE 30,30 5\n"
mv 70 5; at 40 15; mv 70 5; ty '_COPY\n'; ty '#30,15\n'; mv 40 30; at 40 30 right; scr 40 30 d06-1
$A click 3762 725 left; $A com hist 8
# d07 the right button once a copy is placed: Intro, Cancelar, Entrada reciente, Matriz, Salir,
# desHacer, …; desHacer echoes `H` and `Todos los efectos del comando han sido deshechos.`, the
# prompt back to `[Matriz] <usar primer punto como desplazamiento>`
$A com send "_ERASE _L \n"; mv 70 5; at 40 15; mv 70 5; ty '_COPY\n'; ty '#30,15\n'; at 40 22
mv 40 30; at 40 30 right; scr 40 30 d07-1; $A click 3772 834 left; ty '\e'; $A com hist 10
# d08 with no command, a press and drag on a selected line: it drags solid, the original faded, no
# rubber band, no tooltip, nothing written; released, it moves by the drag and nothing stays
# selected; U names it `SOLTARGEOM GRUPO`
mv 70 5; at 36 15; mv 70 5; dr down 36 15; dr move 38 18; dr move 45 25; scr 40 20 d08-1
cl 200 d08-cl1; dr up 45 25; mv 70 5; scr 40 20 d08-2; $A com hist 8
$A com eval '(if (ssget "_I") (sslength (ssget "_I")) 0)'; $A com send "_U\n"; $A com hist 6
# d09 Ctrl held from the press: no drag at all (Ctrl+pick is sub-object selection); a copy by a
# Ctrl drag stays unverified
mv 70 5; at 36 15; mv 70 5; dr down 36 15 ctrl; dr move 38 18; dr move 45 25; scr 40 20 d09-1
dr up 45 25 ctrl; $A com eval '(list (sslength (ssget "_X")) (if (ssget "_I") (sslength (ssget "_I")) 0))'
# d10 a right-button drag: on release the menu Desplazar, Copiar, Pegar como bloque, Cancelar;
# Copiar copies, nothing selected, U names it `SOLTARGEOM GRUPO`
ty '\e'; mv 70 5; at 36 15; mv 70 5; dr down 36 15 right; dr move 38 18; dr move 45 25
dr up 45 25 right; scr 45 25 d10-1; $A click 3836 805 left
$A com eval '(list (sslength (ssget "_X")) (if (ssget "_I") (sslength (ssget "_I")) 0))'
$A com send "_U\n"; $A com hist 8
# d11 COPY near: the selected circle glows, the copy drags solid; after a copy, the next drags
mv 70 5; at 35 30; mv 70 5; ty '_COPY\n'; ty '#30,30\n'; mv 45 33; mv 46 33; scr 40 25 d11-1
at 46 33; mv 45 20; mv 46 20; scr 40 25 d11-2; ty '\e'
$A com eval '(setvar "AUTOSNAP" 55)'
