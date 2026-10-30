#!/usr/bin/env bash
# d01–d03: 3DPOLY's desktop session (2026-10-30), by COM and window captures only: the mouse is
# never moved. Needs AutoCAD open (acad.sh launch "" en-US for d01–d02, es-ES for d03) and a drawing
# of the probe's own (acad.sh com new). Screenshots: research/probes/3dpoly/d<id>.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
# d01 a selected 3D polyline's grips: a square at each vertex, none at the segments' middles
$A com send "_3DPOLY 0,0,0 10,0,5 10,10,-3 20,10,0 \n"
$A com send "_ZOOM _E _ZOOM 0.7X\n"
$A com eval '(progn (sssetfirst nil (ssget "L")) "ok")'
$A shot
# d02 (en-US) and d03 (es-ES) its Properties palette: 3D Polyline; Geometry Current Vertex, Vertex
# X/Y/Z, Length (greyed); Misc Fit/Smooth None, Closed No. Capture the palette's own window.
$A com send "_PROPERTIES\n"
sleep 3
$A shot "$($A wins | awk -F'\t' '$3 == "Properties" || $3 == "Propiedades" { print $1; exit }')"
$A com send "_PROPERTIESCLOSE\n"
$A com close
