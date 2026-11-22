#!/usr/bin/env bash
# d02 (22/11/2026, en-US desktop, FILEDIA 1 for the probe, then 0 again as the profile had it):
# whether Save Drawing As warns of what an earlier format or DXF loses. A drawing with a 3DSOLID
# (BOX) and a REGION saved as AutoCAD 2000 DXF, R12/LT2 DXF and AutoCAD 2000 DWG; after each
# Save, the open windows (a task dialog would be one) and the command history.
# Seen: no dialog and no line but `Command: _SAVEAS` after each Save; the files written (the R12
# one 10 KB, its solid and region in anonymous blocks, as x022's).
# A pending dialog locks COM: the command is sent in the background, as below.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
T='C:\Users\oveli\AppData\Local\Temp\mcaddxf'
win() { $A wins | awk -F'\t' -v t="$1" '$3 == t || $2 == t { print $1; exit }'; }
save() { # $1 Files of type index, $2 file name
  (timeout 30 $A com send "_SAVEAS\n" >/dev/null &)
  sleep 5
  S=$(win "Save Drawing As")
  $A dialog "$S" select 13002 "$1"
  sleep 1
  $A dialog "$S" settext 13006 "$T\\$2"
  $A dialog "$S" settext 1001 "$T\\$2"
  $A dialog "$S" click 1
  sleep 6
  echo "== windows after $2"
  $A wins
  $A com hist 6
}
$A com new
$A com netload
$A com eval '(progn (command "_.BOX" "0,0,0" "10,10,10") (command "_.CIRCLE" "30,0" "5") (command "_.REGION" "_L" "") (getvar "FILEDIA"))'
$A com set FILEDIA 1
save 14 d02-2000.dxf
save 15 d02-r12.dxf
save 5 d02-2000.dwg
$A com set FILEDIA 0
$A com close
