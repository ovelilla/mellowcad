#!/usr/bin/env bash
# d01 (12/11/2026, en-US desktop launched for the probe, closed after it; no mouse: COM, UIA and
# window messages, FILEDIA 1 for the file dialogs and 0 again as the profile had it). Seen:
# - PTYPE's Point Style (acddptyperes.dll, dialog 101): twenty images in four rows of five (a dot,
#   nothing, +, ×, a tick up; each inside a circle, a square, both), the PDMODE one shown inverted;
#   `Point Size:` 1004 with `%` (1005) after it, `Set Size Relative to Screen` 1001 and `Set Size
#   in Absolute Units` 1002 (`Units` after the size then), OK, Cancel, Help. PDSIZE 0 opens as
#   `5.0000` relative, −7 as `7` relative, 2.5 as `2.5` absolute. OK with Absolute and 5.0000
#   wrote PDSIZE 5 and `Regenerating model.` twice. WM_SETTEXT on 1004 did not reach the dialog
#   (OK kept PDSIZE as it was): how it refuses a size is unverified.
# - After OPEN of plano-prueba.dxf, SAVEAS's Save Drawing As offers `plano-prueba.dwg` on «AutoCAD
#   2018 Drawing (*.dwg)», DXFOUT's `plano-prueba.dxf` on «AutoCAD 2018 DXF (*.dxf)».
# - The figures (PDMODE 2, 3, 4, 34, 66, 98, 100 at PDSIZE 2 against lines at ±0.5, ±1, ±2): the
#   plus's and the cross's arms 2 long, the tick 1 up, the circle's radius and the square's half
#   side 1. A point drawn in UCS Z 30 shows its figure turned 30°.
# - PDSIZE −10 at a view 20 high: a square 1 wide, a plus 2 across; ZOOM 2x keeps it 1 wide in the
#   drawing until REGEN makes it 0.5. PDSIZE 0 and −5 draw alike.
# Screenshots were read from the capture folder, not kept (Autodesk's UI).
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
win() { $A wins | awk -F'\t' -v t="$1" '$3 == t { print $1; exit }'; }
$A launch "" en-US
$A com new
(timeout 15 $A com send "_PTYPE\n" >/dev/null &)
sleep 5
W=$(win "Point Style"); $A uia "$W"; $A shot "$W"
$A dialog "$W" click 1002; $A uia "$W"; $A dialog "$W" click 1
$A com eval '(progn (setvar "PDMODE" 98) (setvar "PDSIZE" -7) (getvar "PDSIZE"))'
(timeout 15 $A com send "_PTYPE\n" >/dev/null &)
sleep 4
W=$(win "Point Style"); $A uia "$W"; $A shot "$W"; $A dialog "$W" click 2
$A com eval '(progn (command "_.ERASE" "_ALL" "") (setvar "PDMODE" 99) (setvar "PDSIZE" 2) (command "_.POINT" "0,0") (command "_.UCS" "_Z" "30") (command "_.POINT" "5,0") (command "_.UCS" "_W") (command "_.ZOOM" "_C" "5,0" "15") (princ))'
$A shot -hwnd -1 -crop "0,0,2560,1400"
$A com eval '(progn (command "_.ERASE" "_ALL" "") (setvar "PDSIZE" 2) (command "_.POINT" "0,0") (command "_.LINE" "-2,1" "2,1" "") (command "_.LINE" "-2,-1" "2,-1" "") (command "_.LINE" "1,-2" "1,2" "") (command "_.LINE" "-1,-2" "-1,2" "") (command "_.LINE" "-2,0.5" "2,0.5" "") (command "_.LINE" "0.5,-2" "0.5,2" "") (command "_.ZOOM" "_C" "0,0" "5") (princ))'
for m in 0 2 3 4 34 35 66 98 100; do
  $A com eval "(progn (setvar \"PDMODE\" $m) (command \"_.REGEN\") (princ))"
  $A shot "$(win "")"
done
$A com eval '(progn (setvar "PDMODE" 66) (setvar "PDSIZE" -10) (command "_.ZOOM" "_C" "0,0" "20") (command "_.REGEN") (princ))'
$A com eval '(progn (command "_.ZOOM" "2x") (princ))'
$A com eval '(progn (command "_.REGEN") (princ))'
$A com close
# Then OPEN of a DXF (FILEDIA 0, the path typed), SAVEAS and DXFOUT with FILEDIA 1 (uia on
# "Save Drawing As": 13006 the name, 13002 the type), Cancel (dialog click 2), FILEDIA 0, com close.
