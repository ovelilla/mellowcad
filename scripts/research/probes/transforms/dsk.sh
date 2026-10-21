#!/usr/bin/env bash
# The Transforms review's desktop session (the owner's AutoCAD, Spanish profile, 2026-10-22), the
# gestures in the order run. It clicks and types on the owner's screen: ask first, and tell them
# when it is over. Needs a drawing of the review's own (acad.sh com new), the command line shown
# (_COMMANDLINE) and MellowProbe loaded for com hist (acad.sh com netload). Settings read before,
# put back after: AUTOSNAP 55 (Polar by setvar 63, never F10), ORTHOMODE 0, CLISTATE 0
# (_COMMANDLINEHIDE, its task dialog answered Sí); left as found: DYNMODE -1, OSMODE 4133,
# DRAGMODE 2, PICKFIRST 1, SHORTCUTMENU 11, ANGDIR 0, ANGBASE 0, AUPREC 0, DYNPICOORDS 0,
# MIRRTEXT 0. Screenshots: research/probes/transforms/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
$A com send "_ZOOM _C 50,25 100\n"
$A com send "_LINE 20,10 45,10 \n"; $A com send "_CIRCLE 30,25 5\n"; $A com send "_LINE 55,40 85,40 \n"
# d01 ROTATE, base on the line's end: the set drags turned, drawn as itself; the original faded;
# an amber dashed line from the base to the cursor; the badge a turning arrow; the tooltip
# `Precise ángulo de rotación o` with one field holding the default 0, not the dragged angle
mv 70 5; at 70 5; ty '\e'; ty '_ROTATE\n'; at 32 10; ty '\n'; at 20 10; mv 40 30; mv 41 31
scr 35 20 d01-1; cl 200 d01-cl1; mv 30 35; mv 30.5 35.5; scr 35 25 d01-3
# d02 the line and the circle about 50,10: both turned as themselves, both originals faded
ty '\e'; mv 70 5; ty '_ROTATE\n'; at 32 10; at 35 25; ty '\n'; ty '50,10\n'; mv 60 25; mv 60.5 25.5
scr 45 18 d02-1
# d03 Copy: `Girando una copia de los objetos seleccionados.`; the originals no longer faded, the
# badge the copy's
ty 'C\n'; mv 60 25; mv 60.5 25.5; scr 45 18 d03-1; cl 200 d03-cl1
# d04 Reference with the mouse: `Precise ángulo de referencia <0>:` draws nothing but the cursor
# (no ghost, no line from the base); its first point picked, `Designe segundo punto:` draws an
# amber dashed line from it, the history `Precise ángulo de referencia <0>:  Designe segundo
# punto:`; then `Precise el nuevo ángulo o [Puntos] <0>:`, the set dragging turned by the new
# angle less the reference, the line from the base, the field the default 0
ty 'R\n'; mv 40 30; mv 40.5 30.5; scr 45 18 d04-1; at 50 10; mv 60 15; mv 60.5 15.5; scr 45 18 d04-2
at 60 15; mv 50 30; mv 50.5 30.5; scr 45 18 d04-3; cl 200 d04-cl3
# d05 Points: `Precise primer punto:` draws nothing; `Designe segundo punto:` a dashed line from
# the first, no ghost; Escape
ty 'P\n'; mv 40 35; mv 40.5 35.5; scr 45 18 d05-1; at 40 35; mv 30 35; mv 30.5 35.5; scr 45 18 d05-2
ty '\e'; $A com hist 12
# d06 SCALE about 50,10: the set as itself, scaled, the originals faded, the dashed line from the
# base; the field shows the dragged factor (0.1397, 0.2057, 0.8058 at 10 units, 1.6010 at 20),
# which is not the distance from the base: a point gives the distance over half the largest
# side of the set's extents (12.5 here)
mv 70 5; ty '_SCALE\n'; at 32 10; at 35 25; ty '\n'; ty '50,10\n'; mv 51 11; mv 51.2 11.2
scr 45 18 d06-1; mv 50 12; mv 50.5 12.5; scr 45 18 d06-2; mv 50 20; scr 50 15 d06-3; mv 50 30
scr 50 20 d06-4; at 50 20
$A com eval '(cdr (assoc 40 (entget (ssname (ssget "_X" (list (cons 0 "CIRCLE"))) 0))))' # 4.02892
$A com send "_U\n"
# d07 the same with the circle alone at ZOOM C 50,25 200 (5.885 px a unit): a click 20 units from
# the base scales by 4.02 (radius 20.0979); typed in the tooltip, `50,20` (relative, DYNPICOORDS
# 0) gives radius 53.8516; `#50,20` with the line alone gives 26,10–46,10 (0.8)
$A com send "_ZOOM _C 50,25 200\n"
X() { python3 -c "print(round(3840+($1-50)*5.885))"; }
Y() { python3 -c "print(round(770.5-($1-25)*5.885))"; }
mv 70 5; ty '_SCALE\n'; $A click "$(X 35)" "$(Y 25)" left; ty '\n'; ty '50,10\n'
$A click "$(X 50)" "$(Y 30)" none; $A click "$(X 50)" "$(Y 30)" left
$A com eval '(cdr (assoc 40 (entget (ssname (ssget "_X" (list (cons 0 "CIRCLE"))) 0))))'
$A com send "_U\n"; mv 70 5; ty '_SCALE\n'; $A click "$(X 35)" "$(Y 25)" left; ty '\n'; ty '50,10\n'
ty '50,20\n'; $A com eval '(cdr (assoc 40 (entget (ssname (ssget "_X" (list (cons 0 "CIRCLE"))) 0))))'
$A com send "_U\n"; mv 70 5; ty '_SCALE\n'; $A click "$(X 32)" "$(Y 10)" left; ty '\n'; ty '50,10\n'
ty '#50,20\n'; $A com send "_U\n"; $A com send "_ZOOM _C 50,25 100\n"
# d08 SCALE Reference: `Precise longitud de referencia <1.0000>:` draws nothing, the field the
# default; its second point `Designe segundo punto:`; `Precise nueva longitud o [Puntos] <1.0000>:`
# drags the set by the distance from the base over the reference (no extents here), the field
# the default 1.0000; Points as ROTATE's
mv 70 5; ty '_SCALE\n'; at 32 10; at 35 25; ty '\n'; ty '50,10\n'; ty 'R\n'; mv 40 30; mv 40.5 30.5
scr 45 18 d08-1; at 20 10; mv 40 15; mv 40.5 15.5; scr 45 18 d08-2; at 45 10; mv 60 30; mv 60.5 30.5
scr 45 18 d08-3; cl 200 d08-cl3; ty 'P\n'; mv 40 35; mv 40.5 35.5; scr 45 18 d08-4; at 40 35
mv 30 35; mv 30.5 35.5; scr 45 18 d08-5; ty '\e'; $A com hist 10
# d09 STRETCH over a rectangle's right side and a line's start: the stretched set drawn as itself,
# the originals faded, the amber dashed line from the base: MOVE's drag (move/d01)
$A com send "_ERASE _ALL \n"; $A com send "_RECTANG 20,10 40,25\n"; $A com send "_LINE 40,30 60,30 \n"
mv 70 5; ty '_STRETCH\n'; ty 'C\n'; ty '35,5\n'; ty '45,35\n'; ty '\n'; ty '40,10\n'; mv 50 15
mv 50.5 15.5; scr 40 20 d09-1; cl 200 d09-cl1
# d10 MIRROR: the originals keep the selection's glow; the reflection drags drawn as itself, the
# amber dashed line from the first point; the tooltip `Especifique segundo punto de línea de
# simetría:` with a length field; at `¿Borrar objetos de origen?` the reflection stays drawn and
# the Down list offers Sí, No (No marked)
ty '\e'; mv 70 5; ty '_MIRROR\n'; at 30 10; at 50 30; ty '\n'; mv 55 5; mv 55.5 5.5; scr 45 20 d10-1
at 55 5; mv 65 30; mv 65.5 30.5; scr 50 20 d10-2; cl 200 d10-cl2; at 65 30; mv 60 20
scr 50 20 d10-3; cl 200 d10-cl3; ty '\e'
# d11 the right button at ROTATE's angle: Intro, Cancelar, Entrada reciente, Copiar, Referencia,
# Modificaciones de REFENT, Encuadre, Zoom, SteeringWheels, Calculadora rápida
mv 70 5; ty '_ROTATE\n'; sleep 1; at 30 10; sleep 0.5; ty '\n'; ty '40,10\n'; mv 55 20
mv 55.3 20.3; at 55.3 20.3 right; scr 55 20 d11-2; ty '\e'; ty '\e'
# d12 Polar (AUTOSNAP 63) at ROTATE's angle: `Polar: 16.0195 < 90°`, the set turned 90°; Ortho:
# `Orto: 12.5361 < 90°`, the larger leg wins
$A com eval '(setvar "AUTOSNAP" 63)'; mv 70 5; ty '_ROTATE\n'; at 30 10; ty '\n'; ty '40,10\n'
mv 41 25; mv 40.6 26; scr 45 20 d12-1; ty '\e'; $A com eval '(setvar "AUTOSNAP" 55)'
$A com eval '(setvar "ORTHOMODE" 1)'; mv 70 5; ty '_ROTATE\n'; at 30 10; ty '\n'; ty '40,10\n'
mv 50 22; mv 50.5 22.5; scr 45 20 d12-2; ty '\e'; $A com eval '(setvar "ORTHOMODE" 0)'
