#!/usr/bin/env bash
# d02: a radius with the mouse, SE Isometric (en-US, DYNMODE 3, OSMODE 0, the view of d01). The
# radius hovered (shot) and clicked 100 px right of the centre's pixel: 300,100,0 is 3638,770,
# 300,100,30 is 3638,674. On the plane through the centre that is 25.53; projected on the UCS's
# XY from 300,100,30 it is 288.05,148.05,0, 57.9 away in space. Then LIST.
# Seen: 25.8846 at z 0 and 25.8839 for CYLINDER, SPHERE, PYRAMID (circumscribed), TORUS at z 30:
# the plane through the centre; CONE's top 28.3120 in the top's plane at the height the cursor read
# when T was typed (the ghost's top there).
source "$(dirname "$0")/lib.sh"
at() { # $1 the command's answers before the pick, $2 $3 the pixel, $4 the shot, $5 what follows
  esc; $A com send "_ERASE _ALL \n" >/dev/null; $A click 3300 700 left >/dev/null; esc
  typ "$1"; hover "$2" "$3"; shot "$4" 3200,300,900,800
  $A click $(($2 + 1)) "$3" left >/dev/null; sleep 1.5
  [ -n "$5" ] && typ "$5"
  esc; $A com send "_LIST _L \n" >/dev/null; $A com hist 14 | grep -i 'radius\|height\|position\|solid type'
}
at "_CYLINDER\n300,100,0\n" 3738 770 d02-cylinder-z0 "10\n"
at "_CYLINDER\n300,100,30\n" 3738 674 d02-cylinder-z30 "10\n"
at "_SPHERE\n300,100,30\n" 3738 674 d02-sphere-z30
at "_PYRAMID\n300,100,30\n" 3738 674 d02-pyramid-z30 "10\n"
at "_TORUS\n300,100,30\n" 3738 674 d02-torus-z30 "5\n"
# CONE's top radius, 100 px right of the top's centre (300,100,30 at 3638,674)
at "_CONE\n300,100,0\n20\n_T\n" 3738 674 d02-cone-top "30\n"
# the tube with the mouse: the ring 40 typed, the tube hovered 40 px right of the ring's point
at "_TORUS\n300,100,30\n40\n" 3778 674 d02-torus-tube
