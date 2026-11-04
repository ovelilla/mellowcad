#!/usr/bin/env bash
# d06 (RVL-07, RVL-09 on the desktop): REVOLVE's angle and start angle by a click, with the owner's
# mouse (es-ES, plan, ZOOM C 10,5 60; OSMODE → 8, Node, each target a POINT; AUPREC 8; both put
# back). RECTANG 20,0 30,10 picked at its right side (30,5), axis `_Y` (the angle's base, SLP-02:
# 0,5,0).
#   a) the cursor on each point of $ANGLES at the angle prompt, d06-a<k>, the click; LIST's angle;
#      two U (LIST is a step).
#   b) `_ST`, the click on 10,15 for the start angle, then 90 typed; LIST.
#   c) RVL-09: the view zoomed in on 50,50 (ZOOM C 50,50 5: the profile outside it), `'_ZOOM _E`
#      typed at the angle prompt, d06-c; 90 typed; the history read.
source "$(dirname "$0")/lib.sh"
defs
ANGLES=${ANGLES:-"10,15 -10,15 10,-5"}
AU=$($A com get AUPREC); $A com set AUPREC 8 >/dev/null; $A com set OSMODE 8 >/dev/null
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 10,5 60\n" >/dev/null
$A com send "_RECTANG 20,0 30,10\n" >/dev/null
for t in $ANGLES; do $A com send "_POINT $t\n" >/dev/null; done; $A com send "_POINT 10,15\n" >/dev/null
PE=$(px 30,5,0); PN=$(px 45,-20,0); PS=$(px 10,15,0)
declare -a PT; for t in $ANGLES; do PT+=("$(px $t,0)"); done
lst() { sleep 1.5; $A com send "_LIST _L \n" >/dev/null; $A com hist 16 | grep -i -E 'ngulo|angle'; }
undo2() { $A com send "_U\n" >/dev/null; $A com send "_U\n" >/dev/null; }
start() { $A click $PN left >/dev/null; sleep 0.5; esc; typ "_REVOLVE\n"; sleep 1; $A click $PE left >/dev/null; sleep 1; typ "\n_Y\n"; }
if [ "${PART:-}" != c ]; then  # PART=c runs c alone
k=0; for t in $ANGLES; do
  start; hover ${PT[$k]}; shot "d06-a$k" $VX,$VY,2560,1177
  $A click ${PT[$k]} left >/dev/null; echo "angle point $t"; lst; undo2; k=$((k + 1))
done
start; typ "_ST\n"; hover $PS; $A click $PS left >/dev/null; sleep 1; typ "90\n"; echo "start point 10,15"; lst; undo2
fi
# c: the rectangle drawn alone again, so `_L` takes it.
$A com send "_ERASE _ALL \n" >/dev/null; $A com send "_RECTANG 20,0 30,10\n" >/dev/null
$A com send "_ZOOM _C 50,50 5\n" >/dev/null
$A click $PN left >/dev/null; sleep 0.5; esc; typ "_REVOLVE\n_L\n\n_Y\n"; sleep 1
typ "'_ZOOM _E\n"; sleep 1.5; shot d06-c $VX,$VY,2560,1177; typ "90\n"; sleep 1
$A com hist 12 | grep -v '^Lines\|^History'; $A com send "_U\n" >/dev/null
$A com set OSMODE 4133 >/dev/null; $A com set AUPREC "$AU" >/dev/null
