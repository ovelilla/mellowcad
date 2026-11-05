#!/usr/bin/env bash
# d08 (TPL, row D, es-ES): with running Endpoint (OSMODE 4133), does the chain 3DPOLY has drawn show
# an Endpoint marker at its start while the endpoint prompt waits (console p79, p128: it finds
# nothing)? A PLINE's chain does (pline/d13). Hover near 10,0.3's segment start 5,0 → 0.5,0.4.
OUT=research/probes/3dpoly/desk; source "$(dirname "$0")/../pedit/lib.sh"
wipe
$A com send "_ZOOM _W -10,-10 60,40\n" >/dev/null
defs
read X0 Y0 < <(px 5,5,0); read X1 Y1 < <(px 25,5,0); read X2 Y2 < <(px 25,20,0); read XN YN < <(px 5.6,5.4,0)
CROP=$((X0-150)),$((Y2-200)),900,600
focus; $A com send "_3DPOLY\n" >/dev/null & sleep 2
clk $X0 $Y0; clk $X1 $Y1; clk $X2 $Y2; hover $XN $YN; sleep 1; shot d08-1-start-end-marker $CROP
esc; wait
esc
