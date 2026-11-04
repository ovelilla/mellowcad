#!/usr/bin/env bash
# d03 (SWEEPS-D68): an extruded spline side's isolines, through COM and shots alone (es-ES; ISOLINES
# 4, 6 and 8, put back to 8). p308's CV spline (10,0 14,3 12,7 16,10) closed by a PLINE to 10,10 and
# 10,0, a region, extruded 20 along Z; Front (-VPOINT 0,-1,0, ZOOM C 13,0,10 30): the vertical lines'
# columns are the rulings along the spline, the horizontal ones the profiles across (lines.py).
source "$(dirname "$0")/lib.sh"
for n in 4 6 8; do
  $A com set ISOLINES $n >/dev/null; $A com send "_ERASE _ALL \n" >/dev/null
  $A com send "_SPLINE _M _CV 10,0 14,3 12,7 16,10 \n" >/dev/null
  $A com send "_PLINE 16,10 10,10 10,0 \n" >/dev/null; $A com send "_REGION _ALL \n" >/dev/null
  $A com send "_EXTRUDE _L \n20\n" >/dev/null
  $A com send "_-VPOINT 0,-1,0\n" >/dev/null; $A com send "_ZOOM _C 13,0,10 30\n" >/dev/null
  sleep 1; shot "d03-$n" $VX,$VY,2560,1177
done
