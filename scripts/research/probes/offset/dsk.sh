#!/usr/bin/env bash
# The OFFSET review's desktop session (the owner's AutoCAD, Spanish profile, 2026-10-22), the
# gestures in the order run. It clicks and types on the owner's screen: ask first, and tell them
# when it is over. Needs a drawing of the review's own (acad.sh com new) and the command line shown
# (_COMMANDLINE). Settings read before, put back after: ORTHOMODE 0, AUTOSNAP 55 (Polar by setvar
# 63, never F10), CLISTATE 0 (_COMMANDLINEHIDE, its task dialog answered Sí); left as found:
# DYNMODE -1, OSMODE 4133, SHORTCUTMENU 11, PICKFIRST 1, SELECTIONPREVIEW 3, DYNPICOORDS 0.
# OFFSETDIST read 1.0 in every new desktop drawing (setting 7 in one left the next at 1.0), where
# the console reads -1 isolated, with -r and with acadiso.dwt opened (p05): unverified.
# Screenshots: research/probes/offset/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
$A com send "_ZOOM _C 50,25 100\n"
$A com send "_LINE 20,10 45,10 \n"; $A com send "_CIRCLE 30,25 5\n"
$A com send "_PLINE 55,15 55,35 75,35 75,15 \n"
# d01 the distance by two points: the tooltip `Precise distancia de desfase o` with one field
# holding the default; the first point picked, `Designe segundo punto:` draws an amber dashed line
# from it and the field reads the dragged distance; the history writes both on one line. At
# `Designe objeto a desplazar o` the pick box alone, the tooltip with no field, the line under it
# glowing; at `Precise punto en lado de desplazamiento o` the source selected (blue glow), the copy
# dragging at the distance on the cursor's side drawn as the object itself (solid, its colour), the
# tooltip with the X and Y pointer fields
mv 70 5; at 70 5; ty '\e'; ty '_OFFSET\n'; sleep 1; mv 15 40; mv 15.3 40.3; scr 45 22 d01-1
at 15 40; mv 18 44; mv 18.3 44.3; scr 45 22 d01-2; cl 200 d01-cl2; at 15 45; mv 30 18; mv 30.3 18.3
scr 45 22 d01-3; mv 32 10.2; mv 32 10.1; scr 45 22 d01-4; at 32 10.1; mv 34 16; mv 34.3 16.3
scr 45 22 d01-5; cl 200 d01-cl5; at 34.3 16.3; ty '\n'
# d02 Through with the mouse: the copy passes through the cursor, drawn as itself, the source
# selected, X and Y fields; Multiple keeps the same source and its ghost through the cursor
ty '_OFFSET\n'; sleep 1; ty 'A\n'; at 32 15.1; mv 36 20; mv 36.3 20.3; scr 45 22 d02-1; cl 200 d02-cl1
ty 'M\n'; mv 38 6; mv 38.3 6.3; scr 45 22 d02-2; at 38.3 6.3; ty '\n'; ty '\n'
# d03 the circle inward and the open polyline (a U): inside the U, below its open ends (still
# inside: the nearest segment decides) and outside
ty '_OFFSET\n'; sleep 1; ty '3\n'; at 35 25; mv 31 26; mv 31.3 26.3; scr 45 22 d03-1; ty '\e'; ty '\e'
mv 70 5; ty '_OFFSET\n'; sleep 1; ty '\n'; at 65 35; mv 62 30; mv 62.3 30.3; scr 55 22 d03-2
mv 62 12; mv 62.3 12.3; scr 55 22 d03-3; mv 80 25; mv 80.3 25.3; scr 55 22 d03-4; ty '\e'
# d04 the right button: at the distance Intro, Cancelar, Entrada reciente, punto a Atravesar,
# Borrar, Capa, Modificaciones de REFENT, Encuadre, Zoom, SteeringWheels, Calculadora rápida; at
# the object prompt Intro, Cancelar, Entrada reciente, Salir, Deshacer, Encuadre, Zoom,
# SteeringWheels, Calculadora rápida (no REFENT)
ty '\e'; mv 70 5; ty '_OFFSET\n'; sleep 1; at 40 40 right; scr 45 32 d04-1; ty '\e'
ty '_OFFSET\n'; sleep 1; ty '\n'; at 40 40 right; scr 45 32 d04-2; ty '\e'; ty '\e'
# d05 Ortho and Polar on at the through point: nothing bends it, no rubber band
$A com eval '(setvar "ORTHOMODE" 1)'; $A com eval '(setvar "AUTOSNAP" 63)'
mv 70 5; ty '_OFFSET\n'; sleep 1; ty 'A\n'; at 32 10.1; mv 40 18; mv 40.3 18.3; scr 45 22 d05-1
ty '\e'; ty '\e'; $A com eval '(setvar "ORTHOMODE" 0)'; $A com eval '(setvar "AUTOSNAP" 55)'
# d06 Escape after a copy keeps it (5 objects → 6, `*Cancelado*`); U takes the run back (5)
$A com eval '(sslength (ssget "_X"))'; mv 70 5; ty '_OFFSET\n'; sleep 1; ty '\n'; at 32 10.1
at 32 0; at 35 25; ty '\e'; $A com eval '(sslength (ssget "_X"))'; cl 200 d06-cl1
$A com send "_U\n"; $A com eval '(sslength (ssget "_X"))'
