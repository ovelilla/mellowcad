#!/usr/bin/env bash
# d05 (EXT-01, EXT-08 on the desktop): EXTRUDE's height and taper by a click, with the owner's mouse
# (es-ES, plan view, ZOOM C 20,15 60; OSMODE 4133 → 8, Node, put back: each target is a POINT, so
# the click is exact; the command line shown). RECTANG 0,0 10,20 (base 4.7368,9.4737: p105),
# picked at its left side (0,10). VX=0 when AutoCAD sits on the left monitor.
#   a) the height prompt with the cursor at 20,30: d05-a (rubber band); the click there, LIST's
#      height (p107's 25.5792) and LASTPOINT; U.
#   b) the cursor at 20,30, `_T` typed, the cursor on each taper point of $TAPERS, d05-b<k>, the
#      click, 5 typed for the height; LIST's taper (AUPREC 8); U.
#   c) RECT="0,5 10,25" PICK=0,15 TAPERS=40,10: the start moved up 5 (base 4.7368,14.4737): is the
#      taper's Y the point's own or measured from the profile's start?
source "$(dirname "$0")/lib.sh"
defs
TAPERS=${TAPERS:-"40,10 20,40 4.7368,30"}; RECT=${RECT:-"0,0 10,20"}; PICK=${PICK:-0,10}
AU=$($A com get AUPREC); $A com set AUPREC 8 >/dev/null  # put back at the end
$A com set OSMODE 8 >/dev/null
$A com send "_ERASE _ALL \n" >/dev/null; $A com set ISOLINES 4 >/dev/null
$A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 20,15 60\n" >/dev/null
$A com send "_RECTANG $RECT\n" >/dev/null; $A com send "_COMMANDLINE\n" >/dev/null
$A com send "_POINT 20,30\n" >/dev/null; for t in $TAPERS; do $A com send "_POINT $t\n" >/dev/null; done
REC=$($A com eval '(cdr (assoc 5 (entget (ssname (ssget "_X" (quote ((0 . "LWPOLYLINE")))) 0))))' | tr -d '"')
echo "rectangle $REC"
PE=$(px $PICK,0); PH=$(px 20,30,0); PN=$(px 45,-10,0)
declare -a PT; for t in $TAPERS; do PT+=("$(px $t,0)"); done
lst() { sleep 1.5; $A com send "_LIST _L \n" >/dev/null; $A com hist 14 | grep -i -E 'altura|inclinaci|height|taper'; }
# LIST is an undo step of its own: two U take the extrusion back.
undo2() { $A com send "_U\n" >/dev/null; $A com send "_U\n" >/dev/null; }
start() { $A click $PN left >/dev/null; sleep 0.5; esc; typ "_EXTRUDE\n"; sleep 1; $A click $PE left >/dev/null; sleep 1; typ "\n"; }
start; hover $PH; shot d05-a $VX,$VY,2560,1177; $A click $PH left >/dev/null; lst
$A com eval '(getvar "LASTPOINT")'; undo2
k=0; for t in $TAPERS; do
  start; hover $PH; typ "_T\n"; hover ${PT[$k]}; shot "d05-b$k" $VX,$VY,2560,1177
  $A click ${PT[$k]} left >/dev/null; sleep 1; typ "5\n"; echo "taper point $t"; lst
  undo2; k=$((k + 1))
done
$A com set OSMODE 4133 >/dev/null; $A com set AUPREC "$AU" >/dev/null
