#!/usr/bin/env bash
# d02–d05: EXTRUDE's height dragged with the owner's mouse (2026-11-03, en-US), in the drawing and
# view of solid/dsk3.sh (SE Isometric, the circle 150,-100,0 r 20 at pixel 3438,962, 0.3187 units a
# pixel). The circle is selected first (PICKFIRST), each extrusion undone after reading it.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.5; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 1; }
ext_at() {
  $A key esc esc >/dev/null; sleep 1
  $A com eval '(progn (sssetfirst nil (ssget "_X" (quote ((0 . "CIRCLE"))))) "sel")' >/dev/null
  $A type "_EXTRUDE\n" >/dev/null; sleep 1.2
  hover "$1" "$2"; $A shot -hwnd -1 -crop 3100,350,1100,800
  $A click $(($1 + 1)) "$2" left >/dev/null; sleep 1.2; $A com eval '(bb)'; $A com send "_U\n"
}
# d02 100 px above the centre: Z 0 to 39.4757; d03 the same 100 px to the right too: 39.4757, the
# cursor read along the Z through the profile, wherever it is beside it; the box shows the height
ext_at 3438 862
ext_at 3538 862
# d04 100 px below: Z -38.5996 to 0
ext_at 3438 1062
# d05 Endpoint on the box's top corner 100,100,50 (pixel 3771,514): Z 0 to 50 (console solid/z02)
ext_at 3771 514
