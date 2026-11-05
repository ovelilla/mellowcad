#!/usr/bin/env bash
# d06 (VSD), COM only: a locked layer's solid and a lineweight on a solid's edges, on screen (es-ES).
# Boxes 0,0,0–10,10,10 on 0; 20,0,0 on LCK (locked); 40,0,0 with lineweight 0.80; 60,0,0 colour 1;
# SW Iso, the view captured in 2D Wireframe, Hidden and Conceptual, with LWDISPLAY 0 (the
# profile's) and 1 (put back to 0).
source "$(dirname "$0")/lib.sh"
VIEW=${VIEW:?the view window handle}
$A com new >/dev/null; $A com netload >/dev/null
$A com send "_-LAYER _N LCK\n\n" >/dev/null
$A com send "_BOX 0,0,0 10,10,10\n" >/dev/null
$A com send "_BOX 20,0,0 30,10,10\n" >/dev/null; $A com send "_CHPROP _L  _LA LCK\n\n" >/dev/null
$A com send "_BOX 40,0,0 50,10,10\n" >/dev/null; $A com send "_CHPROP _L  _LW 0.8\n\n" >/dev/null
$A com send "_BOX 60,0,0 70,10,10\n" >/dev/null; $A com send "_CHPROP _L  _C 1\n\n" >/dev/null
$A com send "_-LAYER _LO LCK\n\n" >/dev/null
$A com send "_-VIEW _SWISO\n" >/dev/null; $A com send "_ZOOM _E\n" >/dev/null; $A com send "_ZOOM 0.9X\n" >/dev/null
$A com eval '(list (getvar "LWDISPLAY") (getvar "LAYLOCKFADECTL") (getvar "LWUNITS") (getvar "LWDEFAULT"))'
for lw in 0 1; do
  $A com eval "(setvar \"LWDISPLAY\" $lw)" >/dev/null
  for s in 2 H C; do $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2; vshot "d06-lw$lw-$s"; done
done
$A com eval '(setvar "LWDISPLAY" 0)'; $A com send "_VSCURRENT _2\n" >/dev/null
