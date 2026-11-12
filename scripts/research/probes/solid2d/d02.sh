#!/usr/bin/env bash
# d02 (12/11/2026, after d01 in the same drawing): the solid seen zoomed out, in plan and SW
# Isometric (2D Wireframe), FILLMODE 1 and 0 with a REGEN; a bow tie (points in turn round
# the outline) and a dart (concave) beside it. Seen: in plan each filled as its outline 1, 2, 4, 3
# (the bow tie two triangles meeting, the dart concave); SW Isometric, outlined only, the thick one
# a wire prism (bottom, top, four edges); FILLMODE 0 and REGEN in plan, the outlines.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
W=$($A wins | awk -F'\t' '$2 == "AfxMDIFrame140u" { print $1; exit }')
shot() { $A shot "$1" | tail -1; }
$A com eval '(progn (sssetfirst nil nil) (command "_.SOLID" "20,0" "30,0" "30,6" "20,6" "") (command "_.SOLID" "40,0" "50,0" "45,2" "45,6" "") (command "_.ZOOM" "_E") (command "_.ZOOM" "0.8x") (princ))'
shot "$W"
$A com eval '(progn (command "_.-VIEW" "_SWISO") (princ))'
shot "$W"
$A com eval '(progn (setvar "FILLMODE" 0) (princ))'
shot "$W"
$A com eval '(progn (command "_.REGEN") (princ))'
shot "$W"
$A com eval '(progn (command "_.-VIEW" "_TOP") (command "_.REGEN") (princ))'
shot "$W"
$A com eval '(progn (setvar "FILLMODE" 1) (command "_.REGEN") (princ))'
