#!/usr/bin/env bash
# g01: the primitives' grips and their Properties palette rows, in the desktop (2026-11-01).
# Needs AutoCAD open (acad.sh launch "" en-US), a drawing of the probe's own (acad.sh com new),
# MellowProbe NETLOADed (acad.sh com netload) and -VIEW _SWISO: GetGripPoints leaves a primitive's
# height grips out where the view looks along its axis (in plan). MPGRIPDATA lists each grip as
# the desktop draws it; MPGRIPDRAG L <index> <dx,dy,dz> drags one (the GripData MoveGripPointsAt,
# which the console cannot run: no graphics). The palette (pal) is retyped with the mouse and the
# keyboard: it validates what setpropertyvalue does not (Length 0 there makes a flat box).
# The mouse is the owner's: the desktop rules of .claude/skills/autocad-research/gui.md.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
# One drag on a fresh object, then LIST.
drag() {
  local make=$1; shift
  for d in "$@"; do
    set -- $d
    $A com send "_ERASE _ALL \n$make\n"
    $A com send "MPGRIPDRAG\nL\n$1\n$2\n"
    $A com send "_LIST\n_L\n\n"
    echo "== grip $1 by $2"; $A com hist 40
  done
}
$A com send "-VIEW _SWISO\n"
$A com send "_ERASE _ALL \n_BOX 0,0,0 10,20 5 _WEDGE 20,0,0 30,20 5 _PYRAMID 70,0,0 5 _T 2 8 _CYLINDER 100,0,0 5 10 _CYLINDER _E 120,0,0 130,0,0 125,3,0 10 _CONE 150,0,0 5 10 _CONE 170,0,0 5 _T 2 10 _CONE _E 190,0,0 200,0,0 195,3,0 _T 1 10 _SPHERE 220,0,0 5 _TORUS 250,0,0 10 3 _TORUS 280,0,0 2 4 _TORUS 310,0,0 -4 5 \n"
$A com send "MPGRIPDATA\n2\n"
# Box: base centre, corners, the base's edges, the height (9, top) and the base (10, under it).
drag "_BOX 0,0,0 10,20 5" "0 3,4,0" "0 0,0,3" "1 -2,-3,0" "1 -2,-3,4" "3 2,3,0" "2 2,3,0" "5 -2,0,0" \
  "5 -2,7,4" "5 0,3,0" "6 3,0,0" "6 -15,0,0" "6 -10,0,0" "7 0,-4,0" "8 0,4,0" "1 12,0,0" "1 10,0,0" \
  "9 0,0,3" "9 2,2,3" "9 2,0,0" "9 1,1,0" "9 -2,-2,0" "9 0,0,-5" "9 0,0,-6" "9 0,0,-7" "10 0,0,-3" \
  "10 0,0,3" "10 0,0,6" "10 2,2,0"
drag "_BOX 0,0,0 10,20 5 _ROTATE _L  0,0 30" "6 3,0,0" "1 3,0,0"
drag "_WEDGE 0,0,0 10,20 5" "1 -2,-3,0" "5 -2,0,0" "6 3,0,0" "7 0,-4,0" "0 1,1,1" "9 0,0,3" "10 0,0,-2"
drag "_PYRAMID 0,0,0 5 8" "1 2,0,0" "1 0,2,0" "1 2,2,0" "1 0,0,3" "2 2,0,0" "2 0,3,0" "2 0,0,3" \
  "2 -6,0,0" "9 2,0,0" "9 -2,0,0" "9 0,0,-3" "0 0,0,2"
drag "_CYLINDER 0,0,0 5 10" "2 2,0,0" "2 0,3,0" "2 0,0,3" "5 0,0,3" "5 2,0,0" "6 0,0,-2" "0 1,2,3"
drag "_CONE 0,0,0 5 10" "7 2,0,0" "7 -2,0,0" "7 0,0,-3" "7 -2,0,-3" "5 0,0,3" "1 -2,0,0"
drag "_CONE 0,0,0 5 _T 2 10" "7 -1,0,0" "7 3,0,0" "7 0,2,0" "7 -3,0,0"
drag "_SPHERE 0,0,0 5" "1 2,0,0" "1 0,0,3" "3 0,2,0" "1 -6,0,0"
drag "_TORUS 0,0,0 10 3" "5 -2,0,0" "5 0,0,3" "1 -2,0,0" "2 2,0,0" "3 0,0,-2" "4 0,0,2" "1 0,0,2" "5 12,0,0"
# The palette, at the row's screen y with the palette docked as the owner's profile docks it
# (Position X 618, Y 636, Z 656, then the solid's rows 19 px apart): click it until it edits,
# Ctrl+A, the value, Enter (/tmp/mpx/pal.sh of the session). Box: Length 0, -4, 7; Height -3, 0;
# Position X 2, Z 4. Pyramid: Base radius 0, -1, 6; Top radius -1, 0, 6; Sides 2, 33, 6;
# Height -3. Cone: Base radius 0, -1; Top radius -1, 0, 7, 5; Height -2. Cylinder: Radius 0, 3;
# Height -2; Elliptical Yes. Sphere: Radius 0, -1; Diameter 12. Torus: Torus radius 0, -2, -4, 2;
# Tube radius 0, 12, -1; a lemon's (-4, 5) tube 3 and 4. U after one: `Modify Property`.
