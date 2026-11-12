#!/usr/bin/env bash
# d01 (12/11/2026, en-US desktop, FILEDIA 1 for the probe, then 0 again as the profile had it):
# SAVEAS's and DXFOUT's Save Drawing As, read with no mouse (uia.ps1, dialog.ps1). Seen:
# - Save Drawing As: File name, Files of type (seven DWG versions, DWS, DWT, then «AutoCAD 2018 DXF
#   (*.dxf)», 2013/LT2013, 2010/LT2010, 2007/LT2007, 2004/LT2004, 2000/LT2000, R12/LT2), Save,
#   Cancel, and Tools ▸ Options… (13110), whose Saveas Options holds DWG Options and DXF Options:
#   Format ASCII / BINARY, Select objects, Save thumbnail preview image (greyed in this profile,
#   whatever the type or format), Decimal places of accuracy (0 to 16) at 16;
# - choosing a DXF type turns `Drawing2.dwg` into `Drawing2.dxf`;
# - Select objects checked, Save asks `Select objects:` at the command line (`_L`, `1 found`,
#   `Select objects:`), writes only that set and leaves the drawing named as it was;
# - precision 3: `Warning:  You have specified a lower precision for the DXF file, which may
#   result in loss of drawing accuracy.` after `_SAVEAS`, the drawing then named d-p3.dxf;
# - DXFOUT opens the same dialog on «AutoCAD 2018 DXF (*.dxf)»; Cancel writes nothing more than
#   `Command: _DXFOUT`.
# A pending dialog locks COM: the command is sent in the background, as below.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
T='C:\Users\oveli\AppData\Local\Temp\mcaddxf\out'
win() { $A wins | awk -F'\t' -v t="$1" '$3 == t || $2 == t { print $1; exit }'; }
$A com new
$A com eval '(progn (command "_.LINE" "0,0" "10,0" "") (getvar "FILEDIA"))'
$A com set FILEDIA 1
(timeout 20 $A com send "_SAVEAS\n" >/dev/null &)
sleep 5
S=$(win "Save Drawing As")
$A uia "$S"
$A dialog "$S" items 13002
$A dialog "$S" select 13002 9
$A dialog "$S" click 13005
sleep 2
$A dialog "$S" menu "$(win "#32768")" Options
sleep 2
O=$(win "Saveas Options")
$A dialog "$O" tab 1665 1
sleep 1
$A shot "$O"
$A dialog "$O" state 1539
$A dialog "$O" check 1403
$A dialog "$O" click 1
sleep 2
$A dialog "$S" settext 13006 "$T\\d-selobj.dxf"
$A dialog "$S" settext 1001 "$T\\d-selobj.dxf"
$A dialog "$S" click 1
sleep 3
$A type '_L\n\n'
sleep 2
$A com hist 8
$A com get DWGNAME
# The same with precision 3 and Select objects off: the warning.
(timeout 20 $A com send "_SAVEAS\n" >/dev/null &)
sleep 5
S=$(win "Save Drawing As")
$A dialog "$S" select 13002 9
$A dialog "$S" click 13005
sleep 2
$A dialog "$S" menu "$(win "#32768")" Options
sleep 2
O=$(win "Saveas Options")
$A dialog "$O" tab 1665 1
$A dialog "$O" uncheck 1403
$A dialog "$O" settext 1019 3
$A dialog "$O" click 1
sleep 2
$A dialog "$S" settext 13006 "$T\\d-p3.dxf"
$A dialog "$S" settext 1001 "$T\\d-p3.dxf"
$A dialog "$S" click 1
sleep 3
$A com hist 6
# DXFOUT, then Cancel.
(timeout 20 $A com send "_DXFOUT\n" >/dev/null &)
sleep 5
S=$(win "Save Drawing As")
$A uia "$S"
$A dialog "$S" click 2
$A com hist 4
$A com set FILEDIA 0
$A com close
