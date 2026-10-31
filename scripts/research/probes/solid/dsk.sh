#!/usr/bin/env bash
# d02–d03: BOX's desktop session (2026-10-31), by COM and window captures only: the mouse is
# never moved. Needs AutoCAD open (acad.sh launch "" en-US) and a drawing of the probe's own
# (acad.sh com new). Screenshots: research/probes/solid/d<id>.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
out=research/probes/solid
# d02 a selected box in 2D Wireframe, in plan and in an isometric view: its edges and its grips
$A com send "_BOX 0,0,0 10,20 5 _ZOOM _E _ZOOM 0.6X\n"
$A com eval '(progn (sssetfirst nil (ssget "_X")) "ok")'
cp "$($A shot | tail -1)" $out/d02-plan.png
$A com send "_-VIEW _SWISO _ZOOM _E _ZOOM 0.6X\n"
$A com eval '(progn (sssetfirst nil (ssget "_X")) "ok")'
cp "$($A shot | tail -1)" $out/d02-iso.png
# d03 its Properties palette (en-US)
$A com send "_PROPERTIES\n"
sleep 3
cp "$($A shot "$($A wins | awk -F'\t' '$3 == "Properties" || $3 == "Propiedades" { print $1; exit }')" | tail -1)" $out/d03.png
$A com send "_PROPERTIESCLOSE\n"
$A com close
