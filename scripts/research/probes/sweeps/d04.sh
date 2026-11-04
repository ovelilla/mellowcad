#!/usr/bin/env bash
# d04 (SWO-09, SWEEPS-D67): p305's swept solids gripped and their Properties palette, through COM
# and window captures alone (es-ES; ISOLINES 4, put back to 8 by the caller). The solids: an
# extrusion (RECTANG 0,0 10,10, 5), a tapered one (circle 30,0 r 5, taper 10, 8), a region with a
# hole extruded 4 (50,0 60,10 minus a circle 55,5 r 2), a revolution with STart (RECTANG 100,0
# 110,5 about Y, STart 30, 90), a circle turned whole (150,0 r 5 about Y). d04-<n>-grips: each
# alone gripped in SE Isometric; d04-<n>-pal: the palette by its handle.
source "$(dirname "$0")/lib.sh"
palette() { $A wins | awk -F'\t' '$3 == "Properties" || $3 == "Propiedades" { print $1; exit }'; }
grip() { $A com eval '(progn (sssetfirst nil (ssadd (entlast))) 1)' >/dev/null; sleep 2; }
$A com set ISOLINES 4 >/dev/null
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_PROPERTIES\n" >/dev/null; sleep 3
one() {
  $A com send "_-VPOINT 1,-1,1\n" >/dev/null; $A com send "_ZOOM _O _L \n" >/dev/null
  $A com send "_ZOOM 0.6x\n" >/dev/null; grip
  shot "d04-$1-grips" $VX,$VY,2560,1177 >/dev/null
  cp "$($A shot "$(palette)" | tail -1)" "$OUT/d04-$1-pal.png"; echo "$1 ok"
}
$A com send "_RECTANG 0,0 10,10\n" >/dev/null; $A com send "_EXTRUDE _L \n5\n" >/dev/null; one ext
$A com send "_CIRCLE 30,0 5\n" >/dev/null; $A com send "_EXTRUDE _L \n_T 10 8\n" >/dev/null; one taper
$A com send "_RECTANG 50,0 60,10\n" >/dev/null; $A com send "_REGION _L \n" >/dev/null
H=$($A com eval '(cdr (assoc 5 (entget (entlast))))' | tr -d '"')
$A com send "_CIRCLE 55,5 2\n" >/dev/null; $A com send "_REGION _L \n" >/dev/null
$A com send "_SUBTRACT (handent \"$H\") \n_L \n" >/dev/null
$A com send "_EXTRUDE _L \n4\n" >/dev/null; one hole
$A com send "_RECTANG 100,0 110,5\n" >/dev/null; $A com send "_REVOLVE _L \n_Y _ST 30 90\n" >/dev/null; one rev
$A com send "_CIRCLE 150,0 5\n" >/dev/null; $A com send "_REVOLVE _L \n_Y \n" >/dev/null; one torus
$A com send "_PROPERTIESCLOSE\n" >/dev/null
