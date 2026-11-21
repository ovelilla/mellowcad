#!/usr/bin/env bash
# d01–d03: the grips and the Properties palette of a MINSERT in the desktop AutoCAD 2027 (en-US,
# 2026-11-21), by COM and MellowProbe: MPGRIPS lists the grip points, MPGRIPMOVE drags one on a
# fresh object, entget reads it back; the palette is captured from the screen. Needs AutoCAD open
# (acad.sh launch "" en-US) and MellowProbe netloaded (acad.sh com netload); no mouse.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
$A com new
$A com eval '(progn (setvar "OSMODE" 0) (setvar "ATTDIA" 0) (command "_.CIRCLE" "0,0" "2") (command "_.-ATTDEF" "" "T1" "P1" "D1" "3,0" "1" "0") (command "_.-BLOCK" "B1" "0,0" "_ALL" "") "ok")'
make='(progn (command "_.ERASE" "_ALL" "") (command "_.MINSERT" "B1" "10,10" "1" "1" "30" "2" "3" "10" "20" "VAL") (cdr (assoc 5 (entget (entlast)))))'
$A com eval '(progn (command "_.ZOOM" "_C" "30,20" "80") "ok")'
# d01: the grip points, and each dragged by (0,3).
h=$($A com eval "$make" | tr -d '"\r')
$A com send "MPGRIPS\n" >/dev/null
$A com hist 4 | grep -o 'grips .*'
for i in 0 1; do
  h=$($A com eval "$make" | tr -d '"\r')
  $A com send "MPGRIPMOVE\n$h\n$i\n0,3\n" >/dev/null
  echo "== grip $i by 0,3: $($A com eval '(cdr (assoc 10 (entget (entlast))))') $($A com eval '(cdr (assoc 10 (entget (entnext (entlast)))))')"
done
# d02: the grips seen, selected.
h=$($A com eval "$make" | tr -d '"\r')
$A com eval "(progn (sssetfirst nil (ssadd (handent \"$h\"))) \"ok\")"
$A shot | tail -1
# d03: the Properties palette of it, selected.
$A com send "_PROPERTIES " >/dev/null
sleep 2
$A shot -hwnd -1 -crop "${CROP:-0,0,5120,1440}" | tail -1
$A com eval '(progn (sssetfirst nil nil) "ok")'
$A com close
