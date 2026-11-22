#!/usr/bin/env bash
# d01–d04: the grips and the Properties palette of a polygon mesh in the desktop AutoCAD 2027
# (en-US, 2026-11-22), by COM and MellowProbe: MPGRIPS lists the grip points, MPGRIPMOVE drags
# one on a fresh mesh, plain and cubic-smoothed, and the vertices are read back; the palette is
# captured from the screen, of each. Needs AutoCAD open (acad.sh launch "" en-US) and MellowProbe
# netloaded (acad.sh com netload); no mouse.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
$A com new
pts='"0,0,0" "10,0,5" "20,0,5" "30,0,0" "0,10,5" "10,10,20" "20,10,20" "30,10,5" "0,20,5" "10,20,20" "20,20,15" "30,20,5" "0,30,0" "10,30,5" "20,30,5" "30,30,0"'
plain="(progn (setvar \"OSMODE\" 0) (command \"_.ERASE\" \"_ALL\" \"\") (command \"_.3DMESH\" 4 4 $pts) (cdr (assoc 5 (entget (entlast)))))"
smooth="(progn (setvar \"OSMODE\" 0) (setvar \"SURFU\" 4) (setvar \"SURFV\" 3) (setvar \"SURFTYPE\" 6) (command \"_.ERASE\" \"_ALL\" \"\") (command \"_.3DMESH\" 4 4 $pts) (command \"_.PEDIT\" \"_L\" \"_S\" \"_X\") (cdr (assoc 5 (entget (entlast)))))"
dump='(progn (setq v (entnext (entlast)) s "") (while (/= (cdr (assoc 0 (entget v))) "SEQEND") (setq s (strcat s (itoa (cdr (assoc 70 (entget v)))) (vl-princ-to-string (cdr (assoc 10 (entget v)))) " ") v (entnext v))) (strcat (itoa (cdr (assoc 70 (entget (entlast))))) " " (itoa (cdr (assoc 73 (entget (entlast))))) " " s))'
$A com eval '(progn (command "_.ZOOM" "_C" "15,15" "60") "ok")'
for kind in plain smooth; do
  make=${!kind}
  # d01 / d03: the grip points, and grips 0 and 5 dragged by (0,0,7).
  h=$($A com eval "$make" | tr -d '"\r')
  $A com send "MPGRIPS\n" >/dev/null
  echo "== $kind grips: $($A com hist 4 | grep -o 'grips .*')"
  for i in 0 5; do
    h=$($A com eval "$make" | tr -d '"\r')
    $A com send "MPGRIPMOVE\n$h\n$i\n0,0,7\n" >/dev/null
    echo "== $kind grip $i by 0,0,7: $($A com eval "$dump")"
  done
  # d02 / d04: the Properties palette of it, selected.
  h=$($A com eval "$make" | tr -d '"\r')
  $A com eval "(progn (sssetfirst nil (ssadd (handent \"$h\"))) \"ok\")"
  $A shot | tail -1
  $A com send "_PROPERTIES " >/dev/null
  sleep 2
  $A shot -hwnd -1 -crop "${CROP:-0,0,5120,1440}" | tail -1
  $A com eval '(progn (sssetfirst nil nil) "ok")'
done
$A com close
