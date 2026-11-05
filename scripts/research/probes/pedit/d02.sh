#!/usr/bin/env bash
# d02 (PSD, PEDIT, es-ES): PEDIT's main prompt (is the polyline highlighted?); a Fit polyline's
# grips, a hover on a frame vertex's grip and on a middle one, and its Properties palette. A PLINE
# 0,0 20,0 20,15 40,15 fitted (Fit makes it a heavy 2D POLYLINE: select it by _L).
source "$(dirname "$0")/lib.sh"
wipe
$A com send "_PLINE\n0,0\n20,0\n20,15\n40,15\n\n" >/dev/null
$A com send "_ZOOM _W -10,-10 60,40\n" >/dev/null
defs
read XA YA < <(px 10,0,0); read XV YV < <(px 0,0,0); read X1 Y1 < <(px 20,0,0); read XO YO < <(px 50,35,0)
CROP=$((XV-250)),$((YV-500)),1300,700
focus; $A com send "_PEDIT\n" >/dev/null & sleep 2
clk $XA $YA; hover $XO $YO; shot d02-1-main $CROP
esc; wait
$A com send "_PEDIT\n_L\n_F\n\n" >/dev/null
selpl() { $A com eval '(progn (sssetfirst nil (ssget "_L")) "ok")' >/dev/null; sleep 1; }
focus; selpl; hover $XO $YO; shot d02-2-fit-grips $CROP
hover $X1 $Y1; sleep 1.5; shot d02-3-fit-vertex-hover $((X1-400)),$((Y1-300)),800,600
esc; focus; selpl
$A com send "_PROPERTIES\n" >/dev/null; sleep 3
P=$($A wins | awk -F'\t' '$3 == "Propiedades" || $3 == "Properties" { print $1; exit }'); echo "palette $P"
[ -n "$P" ] && cp "$($A shot "$P" | tail -1)" "$OUT/d02-4-fit-palette.png" && echo "shot $OUT/d02-4-fit-palette.png"
$A com send "_PROPERTIESCLOSE\n" >/dev/null
esc
