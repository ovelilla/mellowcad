#!/usr/bin/env bash
# d05: the Properties palette of each primitive of 2b (2026-11-01), by COM and window captures
# only: the mouse is never moved. Needs AutoCAD open (acad.sh launch "" en-US) and a drawing of
# the probe's own (acad.sh com new). Screenshots: research/probes/solid/d05-<name>.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
out=research/probes/solid
palette() { $A wins | awk -F'\t' '$3 == "Properties" || $3 == "Propiedades" { print $1; exit }'; }
shot() {
  $A com eval '(progn (sssetfirst nil (ssadd (entlast))) "ok")' >/dev/null
  sleep 2
  cp "$($A shot "$(palette)" | tail -1)" "$out/d05-$1.png"
}
$A com send "_ZOOM _W -20,-20 300,60\n"
$A com send "_WEDGE 0,0,0 10,20 5\n"
$A com send "_PROPERTIES\n"
sleep 3
shot wedge
$A com send "_PYRAMID 30,10,0 5 _T 2 8\n"; shot pyramid
$A com send "_CYLINDER 50,10,0 5 8\n"; shot cylinder
$A com send "_CYLINDER _E 65,10,0 75,10 67,13 8\n"; shot cylinder-elliptical
$A com send "_CONE 90,10,0 5 8\n"; shot cone
$A com send "_CONE 110,10,0 5 _T 2 8\n"; shot frustum
$A com send "_CONE _E 125,10,0 135,10 127,13 _T 1 8\n"; shot cone-elliptical
$A com send "_SPHERE 150,10,5 5\n"; shot sphere
$A com send "_TORUS 180,10,0 10 2\n"; shot torus
$A com send "_PROPERTIESCLOSE\n"
