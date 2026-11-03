#!/usr/bin/env bash
# d04: Ortho and `<a` at the point prompts whose trace has no base (Edge's second point, the axis
# endpoint, Elliptical's points), in plan (en-US, DYNMODE 0 typed, OSMODE 0; d03's view). Each
# point clicked at 10,3 (pixel 3736,711): under ORTHOMODE 1 (put back to 0), then after `<30`.
# Seen: every prompt bent by Ortho and locked by <30 from its base: the first edge point, the
# base's centre, the first axis endpoint, the ellipse's centre (the second axis: 5.0742 under
# Ortho, 5.9237 at Rotation 30 under <30), Center's centre.
source "$(dirname "$0")/lib.sh"
list() { esc; $A com send "_LIST _L \n" >/dev/null; $A com hist 24 | grep -iv '^command\|^\s*$\|handle\|layer\|space\|history\|bounding\|lower\|upper\|select\|^  *$'; }
start() { esc; $A com send "_ERASE _ALL \n" >/dev/null; $A click 3300 950 left >/dev/null; esc; typ "$1"; }
pick() { hover "$1" "$2"; [ -n "$3" ] && shot "$3" 3200,400,900,700; $A click $(($1 + 1)) "$2" left >/dev/null; sleep 1.2; }
$A click 3300 950 left >/dev/null; esc; typ "DYNMODE\n0\n"
for mode in ortho angle; do
  if [ $mode = ortho ]; then $A com set ORTHOMODE 1 >/dev/null; pre=""; else $A com set ORTHOMODE 0 >/dev/null; pre="<30\n"; fi
  echo "== $mode: PYRAMID Edge's second point"
  start "_PYRAMID\n_E\n0,0,0\n$pre"; pick 3736 711 "d04-$mode-edge"; typ "5\n"; list
  echo "== $mode: CYLINDER's axis endpoint"
  start "_CYLINDER\n0,0,0\n2\n_A\n$pre"; pick 3736 711 "d04-$mode-axis"; list
  echo "== $mode: CYLINDER Elliptical's other endpoint of the first axis, the second axis 4"
  start "_CYLINDER\n_E\n0,0,0\n$pre"; pick 3736 711 "d04-$mode-ell1"; typ "4\n5\n"; list
  echo "== $mode: CYLINDER Elliptical, first axis 0,0 to 10,0 typed, the second axis clicked"
  start "_CYLINDER\n_E\n0,0,0\n10,0,0\n$pre"; pick 3736 711 "d04-$mode-ell2"; typ "5\n"; list
  echo "== $mode: CYLINDER Elliptical Center 0,0, the first axis' end clicked, the second 2"
  start "_CYLINDER\n_E\n_C\n0,0,0\n$pre"; pick 3736 711 "d04-$mode-ellc"; typ "2\n5\n"; list
done
$A com set ORTHOMODE 0 >/dev/null
