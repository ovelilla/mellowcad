#!/usr/bin/env bash
# d10: an apple's isolines (SPK-07), by COM and screen captures (en-US): TORUS 40,0,0 r 2 tube 4
# (p407's) and a doughnut 60,0,0 r 8 tube 2 beside it, ISOLINES 4 (put back to the drawing's 8),
# in plan and in SE Isometric, zoomed on the apple.
# Seen: the apple's meridians reach its outer equator in plan and in Front (radius 6); parallels at
# 3.2361 and 5.6542; at 46,0 the hover highlights it and Center gives 40,0,0.
source "$(dirname "$0")/lib.sh"
esc; $A com send "_ERASE _ALL \n_ISOLINES 4 _TORUS 40,0,0 2 4 _TORUS 60,0,0 8 2 _-VIEW _TOP _ZOOM _C 46,0,0 30\n" >/dev/null
shot d10-plan 2560,182,2156,1177
$A com send "_ZOOM _C 40,0,0 14\n" >/dev/null; shot d10-plan-close 2560,182,2156,1177
$A com send "_-VIEW _SEISO _ZOOM _C 40,0,0 16\n" >/dev/null; shot d10-iso 2560,182,2156,1177
$A com send "_-VIEW _FRONT _ZOOM _C 40,0,0 14\n" >/dev/null; shot d10-front 2560,182,2156,1177
$A com send "_ISOLINES 8 _-VIEW _SEISO\n" >/dev/null
# d10 (2): in plan, close, the cursor at the apple's outer equator 46,0 and 45.9,0: idle (the
# rollover) and inside LINE (OSMODE 4133: Center's marker?), Seen below.
$A com send "_ISOLINES 4 _REGEN _-VIEW _TOP _ZOOM _C 40,0,0 14\n" >/dev/null
for p in 46,0,0 45.9,0,0 45.6542,0,0; do
  xy=$(px $p); set -- $xy
  esc; hover "$1" "$2"; sleep 1.2; shot "d10-hover-$p" $(($1 - 300)),$(($2 - 200)),600,400
  typ "_LINE\n"; hover "$1" "$2"; sleep 1.5; shot "d10-line-$p" $(($1 - 300)),$(($2 - 200)),600,400; esc
done
$A com send "_ISOLINES 8\n" >/dev/null
