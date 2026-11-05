#!/usr/bin/env bash
# d03 (VSD): the grid, the UCS icon, the ViewCube and the crosshair in 2D Wireframe, Hidden and
# Conceptual (es-ES). A box 0,0,0–10,10,10 in SW Iso, GRIDMODE 1 (the new drawing's 0, put back);
# the cursor still over empty space, then over the box's lit top face; the screen captured.
source "$(dirname "$0")/lib.sh"
$A com new >/dev/null; $A com netload >/dev/null; defs
$A com send "_BOX 0,0,0 10,10,10\n" >/dev/null
$A com send "_-VIEW _SWISO\n" >/dev/null
$A com send "_ZOOM _C 5,5,5 40\n" >/dev/null
$A com eval '(setvar "GRIDMODE" 1)' >/dev/null
read TX TY < <(px 5,5,10); read EX EY < <(px 25,-5,0)
echo "top $TX $TY empty $EX $EY"
for s in 2 H C; do
  $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2
  hover "$EX" "$EY"; shot "d03-$s-empty" 0,182,2560,1177
  hover "$TX" "$TY"; shot "d03-$s-face" $((TX-150)),$((TY-150)),300,300
done
$A com send "_VSCURRENT _2\n" >/dev/null
$A com eval '(setvar "GRIDMODE" 0)'
