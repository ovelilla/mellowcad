#!/usr/bin/env bash
# d01–d07: the grips, the palette and the jigs of an xline and a ray in the desktop AutoCAD 2027
# (en-US, 2026-11-20), by COM and MellowProbe: MPGRIPS lists the grip points, MPGRIPMOVE drags one
# on a fresh object, entget reads it back. Seen:
# - d01 XLINE's grips: its base and base ± VIEWSIZE/10 along it (6 at a view 60 high, 12 at 120,
#   1.5 at 15); the base moves it whole, either other turns it about the base through the point
#   dragged to. RAY's: its start, moving it whole, and start + VIEWSIZE/10, turning it.
# - d02, d03 the palette: `XLine` and `Ray`, General, then Geometry: Basepoint X, Y, Z, Second
#   point X, Y, Z (base + direction, typeable), Direction vector X, Y, Z (greyed).
# - d04–d07 the jigs (the owner's mouse moved for an instant and put back): the whole xline
#   through the base and the cursor, with a dashed rubber band from the base; Hor and Ang the
#   xline through the cursor at their angle; Bisect, after vertex and start, the bisector of the
#   start's direction and the cursor's, with the rubber band from the vertex; RAY the ray from
#   its start through the cursor. Needs AutoCAD open (acad.sh launch "" en-US), a drawing of the probe's own
# (acad.sh com new) and MellowProbe netloaded (acad.sh com netload).
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
make_xline='_ERASE _ALL \n_XLINE 0,0 10,5 \n'
make_ray='_ERASE _ALL \n_RAY 20,20 30,20 \n'
$A com send "_OSMODE 0 _ZOOM _C 10,10 60 " >/dev/null
# MPGRIPS: the grip points (the GripData overload gives none for these two).
for make in "$make_xline" "$make_ray"; do
  $A com send "$make" >/dev/null
  $A com send "MPGRIPS\n" >/dev/null
  $A com hist 4 | grep -o 'grips .*'
done
# Each grip dragged by (0,3) on a fresh object (MPGRIPMOVE, MoveGripPointsAt).
for make in "$make_xline" "$make_ray"; do
  for i in 0 1 2; do
    $A com send "$make" >/dev/null
    h=$($A com eval '(cdr (assoc 5 (entget (entlast))))' | tr -d '"\r')
    $A com send "MPGRIPMOVE\n$h\n$i\n0,3\n" >/dev/null
    echo "== grip $i by 0,3: $($A com eval '(cdr (assoc 10 (entget (entlast))))') $($A com eval '(cdr (assoc 11 (entget (entlast))))')"
  done
done
# The grips along the line stand off the base by a share of the view: 6 at a view 60 high.
for size in 120 15; do
  $A com send "$make_xline" >/dev/null
  $A com send "_ZOOM _C 10,10 $size MPGRIPS\n" >/dev/null
  echo "view $size: $($A com hist 3 | grep -o 'grips .*')"
done
$A com send "_ZOOM _C 10,10 60 " >/dev/null
# d02, d03: the Properties palette of each, selected (PROPERTIES opens it; a screenshot of the
# whole screen, read and not kept: Autodesk's UI).
$A com send "_PROPERTIES " >/dev/null
for make in "$make_xline" "$make_ray"; do
  $A com send "$make" >/dev/null
  $A com send "(sssetfirst nil (ssget \"_L\")) " >/dev/null
  sleep 2
  $A shot -hwnd -1 -crop "${CROP:-0,0,5120,1440}" | tail -1
done
# d04–d07: what is drawn while each asks. The view window's pixels are this session's (acad.sh
# children: 2560,180 to 4718,1362 on the second monitor), the cursor up and right of 0,0.
$A com send "(sssetfirst nil nil) _ERASE _ALL \n_ZOOM _C 0,0 60 " >/dev/null
jig() { $A type "$1" >/dev/null; sleep 1; $A cursor 3940 620 -1 "2560,180,2158,1182" | tail -1; $A type "\\e\\e" >/dev/null; sleep 1; }
jig "_XLINE\n0,0\n"
jig "_XLINE\n_H\n"
jig "_XLINE\n_A\n30\n"
jig "_XLINE\n_B\n0,0\n10,0\n"
jig "_RAY\n0,0\n"
