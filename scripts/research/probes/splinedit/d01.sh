#!/usr/bin/env bash
# d01 (PSD, SPLINEDIT, es-ES): the rollover at `Select spline:`, the look at the main prompt, Fit
# data, Fit data's Move (the band), Edit vertex and its Move; then a double-click on the spline at
# `Command:` (DoubleClickRoot's ^C^C^R_splinedit: what the history echoes). A fit spline through
# 0,0 10,10 20,0 30,10.
OUT=research/probes/splinedit/desk; source "$(dirname "$0")/../pedit/lib.sh"
wipe
$A com send "_SPLINE\n0,0\n10,10\n20,0\n30,10\n\n" >/dev/null
$A com send "_ZOOM _W -10,-10 60,40\n" >/dev/null
defs
read XS YS < <(px 20,0,0); read XV YV < <(px 0,0,0); read XB YB < <(px 4,12,0)
CROP=$((XV-250)),$((YV-500)),1300,700
spe() { focus; $A com send "_SPLINEDIT\n" >/dev/null & sleep 2; }
spe; hover $XS $YS; shot d01-1-rollover $CROP
clk $XS $YS; hover $XB $YB; shot d01-2-main $CROP
typ '_F\n'; hover $XB $YB; shot d01-3-fit-data $CROP
typ '_M\n'; hover $XB $YB; shot d01-4-fit-move $CROP
esc; wait; $A com hist 10
spe; clk $XS $YS; typ '_E\n'; hover $XB $YB; shot d01-5-vertex $CROP
typ '_M\n'; hover $XB $YB; shot d01-6-vertex-move $CROP
esc; wait; $A com hist 8
focus; hover $XS $YS; $A click $XS $YS left 2 >/dev/null; sleep 2; shot d01-7-double-click $CROP
esc; esc; $A com hist 10
