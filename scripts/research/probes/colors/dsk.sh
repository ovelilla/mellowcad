#!/usr/bin/env bash
# d01–d06: what the desktop AutoCAD 2027 (en-US, 2026-11-22) shows of an index colour and a true
# colour: the Properties palette's Color row and the ribbon's Object Color list with one line
# selected (index 30, true 255,127,0, index 1, true 255,0,0), then the Layer Properties Manager
# with layers of index 30 and true 10,20,30. Needs AutoCAD open (acad.sh launch "" en-US) and
# MellowProbe netloaded (acad.sh com netload); no mouse.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
$A com new
$A com eval '(progn (setvar "OSMODE" 0) (command "_.-LAYER" "_N" "L30,LT" "_C" "30" "L30" "_C" "_T" "10,20,30" "LT" "") "ok")'
$A com eval '(progn (command "_.-COLOR" "30") (command "_.LINE" "0,0" "10,0" "") (command "_.-COLOR" "_T" "255,127,0") (command "_.LINE" "0,1" "10,1" "") (command "_.-COLOR" "1") (command "_.LINE" "0,2" "10,2" "") (command "_.-COLOR" "_T" "255,0,0") (command "_.LINE" "0,3" "10,3" "") (command "_.-COLOR" "_BYLAYER") (command "_.ZOOM" "_E") "ok")'
$A com send "_PROPERTIES " >/dev/null
sleep 2
n=1
for y in 0 1 2 3; do
  $A com eval "(progn (sssetfirst nil (ssget \"_C\" '(5 $y) '(5 $y))) \"ok\")"
  sleep 1
  echo "d0$n (line at Y=$y): $($A shot -hwnd -1 -crop "${CROP:-0,0,5120,1440}" | tail -1)"
  n=$((n + 1))
done
$A com eval '(progn (sssetfirst nil nil) "ok")'
$A com send "_LAYER " >/dev/null
sleep 4
echo "d05 (layer manager): $($A shot -hwnd -1 -crop "${LAYERCROP:-0,0,5120,1440}" | tail -1)"
$A com close
