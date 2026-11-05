#!/usr/bin/env bash
# d05 (TPL, row M, es-ES): 3DPOLY's dynamic input with DYNMODE 3 (owner's -1, put back), started by
# typing (COM's SendCommand turns dynamic input off): the start prompt's tooltip, then the endpoint's
# fields with the cursor off the first point.
OUT=research/probes/3dpoly/desk; source "$(dirname "$0")/../pedit/lib.sh"
wipe
defs
read X0 Y0 < <(px 0,0,0); read X1 Y1 < <(px 12,7,0)
CROP=$((X0-200)),$((Y1-300)),900,600
$A com eval '(setvar "DYNMODE" 3)' >/dev/null
clk $((X0-100)) $((Y0+150)); esc
typ '_3DPOLY\n'; sleep 1
hover $X0 $Y0; shot d05-1-start $CROP
clk $X0 $Y0; hover $X1 $Y1; shot d05-2-endpoint $CROP
esc; esc
$A com eval '(setvar "DYNMODE" -1)' >/dev/null
$A com eval '(getvar "DYNMODE")'
