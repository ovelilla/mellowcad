#!/usr/bin/env bash
# d02 (PSD, SPLINEDIT, es-ES): d01 away from the UCS icon — the current point's mark at Fit data
# and at Edit vertex, after Next at each, and Edit vertex's frame. A fit spline through 5,5 15,15
# 25,5 35,15.
OUT=research/probes/splinedit/desk; source "$(dirname "$0")/../pedit/lib.sh"
wipe
$A com send "_SPLINE\n5,5\n15,15\n25,5\n35,15\n\n" >/dev/null
$A com send "_ZOOM _W -5,-5 65,45\n" >/dev/null
defs
read XS YS < <(px 25,5,0); read XA YA < <(px 5,5,0); read XB YB < <(px 15,15,0); read XO YO < <(px 50,40,0)
spe() { focus; $A com send "_SPLINEDIT\n" >/dev/null & sleep 2; }
spe; clk $XS $YS; typ '_F\n'; hover $XO $YO
shot d02-1-fit-first $((XA-60)),$((YA-60)),120,120
typ '_M\n'; hover $XO $YO; shot d02-2-fit-move-first $((XA-60)),$((YA-60)),120,120
typ '_N\n'; hover $XO $YO; shot d02-3-fit-move-next $((XB-60)),$((YB-60)),120,120
esc; wait
spe; clk $XS $YS; typ '_E\n'; hover $XO $YO
shot d02-4-vertex-first $((XA-60)),$((YA-60)),120,120
typ '_M\n'; hover $XO $YO; shot d02-5-vertex-move-first $((XA-60)),$((YA-60)),120,120
typ '_N\n'; hover $XO $YO; read X2 Y2 < <(echo 0 0)
shot d02-6-vertex-move-next $((XA-200)),$((YA-500)),1000,700
esc; wait
