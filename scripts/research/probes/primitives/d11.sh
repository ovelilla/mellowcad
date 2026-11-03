#!/usr/bin/env bash
# d11: what the seven draw and what dynamic input shows at each prompt (rows M, Q; DYNMODE 3
# typed, OSMODE 0), SE Isometric with d01's view (300,100,0 at 3638,770). Each prompt hovered and
# shot; the command left with Escape. Then the Down arrow's list at CYLINDER's centre, and `10,5`
# typed in the box at BOX's other corner from 5,5,0 (relative, as DYNPICOORDS 0 makes it?).
# Seen: `10,5` typed in the box from 5,5,0 is relative (Position 10,7.5, 10 x 5).
source "$(dirname "$0")/lib.sh"
esc; $A com send "_ERASE _ALL \n_-VIEW _SEISO _ZOOM _C 300,100,0 300\n" >/dev/null
$A click 3300 950 left >/dev/null; esc; typ "DYNMODE\n3\n"
at() { # $1 typed, $2 $3 pixel, $4 shot
  esc; $A click 3300 950 left >/dev/null; esc; typ "$1"; hover "$2" "$3"; sleep 0.5; shot "$4" 3200,350,1000,800; esc
}
at "_BOX\n" 3638 770 d11-box-first
at "_BOX\n300,100,0\n" 3900 800 d11-box-other
at "_BOX\n300,100,0\n#350,160\n" 3638 650 d11-box-height
at "_BOX\n300,100,0\n_L\n" 3800 830 d11-box-length
at "_BOX\n300,100,0\n_L\n40\n" 3800 700 d11-box-width
at "_WEDGE\n300,100,0\n" 3900 800 d11-wedge-other
at "_WEDGE\n300,100,0\n#350,160\n" 3638 650 d11-wedge-height
at "_CYLINDER\n" 3638 770 d11-cylinder-center
at "_CYLINDER\n300,100,0\n" 3738 770 d11-cylinder-radius
at "_CYLINDER\n300,100,0\n20\n" 3638 670 d11-cylinder-height
at "_CYLINDER\n300,100,0\n20\n_A\n" 3738 650 d11-cylinder-axis
at "_CYLINDER\n_E\n300,100,0\n" 3738 770 d11-cylinder-ell1
at "_CYLINDER\n_E\n300,100,0\n#340,100,0\n" 3700 700 d11-cylinder-ell2
at "_CONE\n300,100,0\n20\n" 3638 670 d11-cone-height
at "_CONE\n300,100,0\n20\n_T\n" 3700 700 d11-cone-top
at "_SPHERE\n300,100,0\n" 3738 770 d11-sphere-radius
at "_TORUS\n300,100,0\n" 3738 770 d11-torus-radius
at "_TORUS\n300,100,0\n40\n" 3500 770 d11-torus-tube
at "_PYRAMID\n" 3638 770 d11-pyramid-center
at "_PYRAMID\n300,100,0\n" 3738 770 d11-pyramid-radius
at "_PYRAMID\n300,100,0\n20\n" 3638 670 d11-pyramid-height
at "_PYRAMID\n_E\n300,100,0\n" 3738 770 d11-pyramid-edge
# the Down arrow's list at CYLINDER's centre
esc; $A click 3300 950 left >/dev/null; esc; typ "_CYLINDER\n"; hover 3638 770; $A key down >/dev/null; sleep 1
shot d11-cylinder-down 3200,350,1000,800; $A key enter >/dev/null; sleep 0.5; esc
# `10,5` typed in the box at the other corner from 5,5,0, then height 5
esc; $A com send "_ERASE _ALL \n" >/dev/null; $A click 3300 950 left >/dev/null; esc
typ "_BOX\n5,5,0\n"; hover 3700 800; typ "10,5\n5\n"; esc
$A com send "_LIST _L \n" >/dev/null; $A com hist 14 | grep -i 'position\|length\|width'
