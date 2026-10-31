#!/usr/bin/env bash
# The point filters' desktop session (the owner's AutoCAD 2027, Spanish profile, 2026-10-31), the
# gestures in the order run. It clicks and types on the owner's screen: ask first, and tell them
# when it is over. Needs a drawing of its own (acad.sh com new) and MellowProbe loaded for com hist
# (acad.sh com netload). The drawing area was the second monitor's, its centre at (3840,700); the
# menu's and the submenu's positions are read off d03's capture. Screenshots:
# research/probes/filters/d<id>-*.png. Closed with com close and _QUIT (it was launched for this).
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
shot() { local o; o=$($A shot -hwnd -1 -crop "$1" | tail -1); cp "$o" "research/probes/filters/$2.png"; }

# The history as typed (SendCommand): `.XY` / `de 1,2` / `(falta Z): 5`, each on a line of its own.
$A com send '_LINE\n0,0\n.X\n1,2\n3,4\n@5,0\n\n'
$A com send '_LINE\n0,0\n.XY\n1,2\n5\n\n'
# d05, what a filter's `de` refuses: `.X` / `de .Y` / `Punto no válido.` (the console's f54 took
# it); `_END` / `de .X` / `Punto no válido.` (f43 took it); `.X` / `de _FRO` / `Punto no válido.`
# (f32 took it). A snap at `de` is taken: `.X` / `de _END` / `de 99,1` / `(falta YZ): 30,40`.
$A com send '_ZOOM\n_W\n-50,-50\n150,150\n_LINE\n0,0\n100,0\n\n'
$A com send '_LINE\n_END\n99,1\n.X\n_END\n99,1\n30,40\n\n'
$A com send '_LINE\n.X\n.Y\n1,2\n3,4,5\n\n'
$A com send '_LINE\n.X\n1,2\n.X\n5,6\n7,8\n\n'
$A com send '_LINE\n.X\n1,2\n.XY\n5,6\n7\n\n'
$A com send '_LINE\n_END\n.X\n99,1\n3,4\n\n'
$A com send '_LINE\n.X\n_FRO\n10,10\n@5,0\n0,7\n\n'
# d05, what they take: the prompt's keyword at `de` and at `(falta YZ)`, FROM at `(falta YZ)`
# (`Punto base: 10,10`, `<Desfase>: @0,5`), a filter at FROM's `Punto base:` and `<Desfase>:`.
$A com send '_LINE\n0,0\n1,0\n.X\n_U\n5,5\n\n'
$A com send '_LINE\n0,0\n1,0\n.X\n4,4\n_U\n5,5\n\n'
$A com send '_LINE\n.X\n1,2\n_FRO\n10,10\n@0,5\n\n'
$A com send '_LINE\n_FRO\n.X\n10,0\n0,20\n@1,1\n\n'
$A com send '_LINE\n_FRO\n10,10\n.X\n@5,0\n0,0\n\n'
$A com hist 60
# d05, Escape (SendCommand refuses an Esc character: keys, after a click for the focus): at `de`,
# `de *Cancelado*`; at `(falta YZ)`, `(falta YZ): *Cancelado*`; at FROM's `Punto base:`,
# `Punto base: *Cancelado*`. Each ends LINE.
$A click 3840 700 left; $A type '\e\e'
$A type '_LINE\n0,0\n1,0\n.X\n'; $A type '\e'
$A type '_LINE\n0,0\n'; $A type '.X\n'; $A type '#4,4\n'; $A type '\e'
$A type '_LINE\n_FRO\n'; $A type '\e'
$A com hist 20
# d01: at `de`, the tooltip `Precise punto siguiente o de`, its keyword arrow and LINE's own
# distance and angle fields. d02: at `(falta YZ)`, `Precise punto siguiente o (falta YZ):`, the
# coordinate fields (# X Y, `#` because one was typed before).
$A type '_LINE\n0,0\n'; $A click 3900 650 none; $A type '.X\n'; $A click 3910 640 none
shot 3500,350,800,500 d01-of
$A type '#4,4\n'; $A click 3920 630 none
shot 3500,350,800,500 d02-need
# d03: Shift+right-click at LINE's first point: Temporary track point, From, Mid Between 2 Points,
# Point Filters ▸ (es `Filtros para puntos`), then 3D Osnap ▸ and the snaps. d04: its submenu,
# `.X .Y .Z | .XY .XZ .YZ`, and `.XY` chosen: `Precise primer punto: .XY de 1,2`, `(falta Z): 5`.
$A type '\e\e'; $A type '_LINE\n'; $A click 3840 600 right 1 shift
shot 3700,450,700,800 d03-menu
$A click 3920 673 none
shot 3700,450,700,500 d04-submenu
$A click 4165 673 none; $A click 4165 742 left; $A type '1,2\n'; $A type '5\n'; $A type '\n'
$A com hist 10
