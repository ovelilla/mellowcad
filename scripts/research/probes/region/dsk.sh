#!/usr/bin/env bash
# d01–d03: REGION's desktop session (2026-10-31), by COM and window captures only: the mouse is
# never moved. Needs AutoCAD open (acad.sh launch "" en-US) and a drawing of the probe's own
# (acad.sh com new). Screenshots: research/probes/region/d<id>.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
out=research/probes/region
# d01 a selected region with a hole and a circle region: its grips (vertices, the circle's centre)
# and how it draws in 2D Wireframe (its edges only, no fill)
$A com send "_RECTANG 0,0 20,20 _CIRCLE 10,10 5 _REGION _ALL  _SUBTRACT 20,10  15,10  _CIRCLE 35,10 5 _REGION _L  _ZOOM _E _ZOOM 0.8X\n"
$A com eval '(progn (sssetfirst nil (ssget "_X")) "ok")'
cp "$($A shot | tail -1)" $out/d01.png
# d02 its Properties palette (en-US)
$A com eval '(progn (sssetfirst nil (ssget "_X" (list (cons 0 "REGION")))) (sssetfirst nil (ssadd (entlast))) "ok")'
$A com send "_PROPERTIES\n"
sleep 3
cp "$($A shot "$($A wins | awk -F'\t' '$3 == "Properties" || $3 == "Propiedades" { print $1; exit }')" | tail -1)" $out/d02.png
$A com send "_PROPERTIESCLOSE\n"
$A com close
