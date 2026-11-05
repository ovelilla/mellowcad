#!/usr/bin/env bash
# d07 (VSD), COM only: VST-01's objects on screen (es-ES), p316's scene: a circle, a region, a wide
# polyline, a circle with thickness 5, a red line behind them at Z -5; SW Iso, the view captured
# in Hidden and Conceptual.
source "$(dirname "$0")/lib.sh"
VIEW=${VIEW:?the view window handle}
$A com new >/dev/null; $A com netload >/dev/null
$A com send "_CIRCLE 0,0 5\n" >/dev/null
$A com send "_CIRCLE 20,0 5\n" >/dev/null; $A com send "_REGION _L \n" >/dev/null
$A com send "_PLINE 35,0 _W 6 6 50,0 \n" >/dev/null
$A com send "_CIRCLE 65,0 5\n" >/dev/null; $A com send "_CHPROP _L  _T 5 \n" >/dev/null
$A com send "_LINE -10,5,-5 80,5,-5 \n" >/dev/null; $A com send "_CHPROP _L  _C 1 \n" >/dev/null
$A com send "_-VIEW _SWISO\n" >/dev/null; $A com send "_ZOOM _E\n" >/dev/null; $A com send "_ZOOM 0.8X\n" >/dev/null
for s in 2 H C; do $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2; vshot "d07-$s"; done
$A com send "_VSCURRENT _2\n" >/dev/null
