#!/usr/bin/env bash
# d01 (12/11/2026, en-US desktop launched for the probe, closed after it; no mouse: COM and UIA).
# The Properties palette of a 2D solid with thickness: its object type and rows. Seen (screenshot,
# not kept): the type `Solid`; General ends in Thickness 2; Geometry: Current Vertex 1, Vertex X 0,
# Vertex Y 0, Elevation 4. Selected in plan, filled, a grip at its corners. `again` reuses the
# drawing (a first run whose SOLID ended in two Enters repeated the command and locked COM).
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
[ "$1" = again ] || $A com new
$A com eval '(progn (setvar "THICKNESS" 2) (command "_.SOLID" "0,0,4" "10,0" "0,6" "10,6" "") (setvar "THICKNESS" 0) (command "_.ZOOM" "_E") (sssetfirst nil (ssget "_L")) (princ))'
(timeout 15 $A com send "_PROPERTIES\n" >/dev/null &)
sleep 4
$A wins
