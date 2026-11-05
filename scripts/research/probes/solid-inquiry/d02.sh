#!/usr/bin/env bash
# d02 (VSD), COM only, no mouse or keys: each style on the dark background (es-ES). p306's scene
# (a filleted box, sphere, torus, cylinder, cone) in SW Iso, the view captured in 2D Wireframe,
# Hidden and Conceptual, then a close zoom on the sphere and the fillet (silhouette width, faceting);
# the VS* variables read in each style.
source "$(dirname "$0")/lib.sh"
VIEW=${VIEW:?the view window handle}
$A com new >/dev/null; $A com netload >/dev/null; defs
$A com send "_BOX 0,0,0 20,10 10\n" >/dev/null
$A com send "_-VPOINT -1.3,-2.2,1.6\n" >/dev/null
$A com send "_ZOOM _E\n" >/dev/null
$A com send "_FILLETEDGE _R 3 10,0,10\n\n\n" >/dev/null
$A com send "_SPHERE 40,5,5 5\n" >/dev/null
$A com send "_TORUS 65,5,3 6 2\n" >/dev/null
$A com send "_CYLINDER 90,5,0 5 10\n" >/dev/null
$A com send "_CONE 115,5,0 5 10\n" >/dev/null
$A com send "_-VIEW _SWISO\n" >/dev/null
$A com send "_ZOOM _E\n" >/dev/null
$A com send "_ZOOM 0.8X\n" >/dev/null
for s in 2 H C; do
  $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2
  echo "== $s"; vs; vshot "d02-a-$s"
done
$A com send "_ZOOM _C 40,5,5 14\n" >/dev/null
for s in H C; do $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2; vshot "d02-b-sphere-$s"; done
$A com send "_ZOOM _C 10,0,8 12\n" >/dev/null
for s in H C; do $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2; vshot "d02-c-fillet-$s"; done
$A com send "_VSCURRENT _2\n" >/dev/null
$A com hist 40
