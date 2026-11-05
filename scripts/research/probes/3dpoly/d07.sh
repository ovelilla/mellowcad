#!/usr/bin/env bash
# d07 (TPO, row I, es-ES): a selected 3D polyline's grips hovered (d06's drawing): its end vertex
# and a middle one. Does a hover menu open (GRIPMULTIFUNCTIONAL 3)? Escape between the two hovers.
OUT=research/probes/3dpoly/desk; source "$(dirname "$0")/../pedit/lib.sh"
sel3d() { $A com eval '(progn (sssetfirst nil (ssget "_X" (quote ((0 . "POLYLINE") (-4 . "&") (70 . 8))))) "ok")' >/dev/null; sleep 1; }
defs
read XM YM < <(px 100,20,10); read XE YE < <(px 100,40,0); read XS YS < <(px 0,20,0)
focus; sel3d
hover $XM $YM; sleep 1.5; shot d07-1-middle $((XM-500)),$((YM-300)),800,600
focus; sel3d
hover $XE $YE; sleep 1.5; shot d07-2-end $((XE-500)),$((YE-300)),800,600
focus; sel3d
hover $XS $YS; sleep 1.5; shot d07-3-start $((XS-200)),$((YS-300)),800,600
esc
