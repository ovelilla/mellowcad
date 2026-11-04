#!/usr/bin/env bash
# d09: dynamic input at the sweeps' point prompts, with the owner's mouse (es-ES, SE Isometric,
# DYNMODE −1 → 3 typed (COM forces it negative), put back with (setvar "DYNMODE" -1); OSMODE 0, put
# back to 4133). RECTANG 0,0 10,20 and RECTANG 30,0 40,10.
#   a) EXTRUDE, the first rectangle, the cursor over 20,30,0: d09-a (the height's box);
#      `_D`, the start clicked on 0,0, the cursor over 0,0,10: d09-b (Direction's end); Esc.
#   b) REVOLVE, the second rectangle, the cursor over 20,0: d09-c (the axis start); the click on
#      20,0, the cursor over 20,10: d09-d (the axis endpoint); the click; the cursor over 0,20:
#      d09-e (the angle); Esc. The Down list opened at the first prompt with the down arrow: d09-f.
source "$(dirname "$0")/lib.sh"
defs
$A com set OSMODE 0 >/dev/null
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_RECTANG 0,0 10,20\n" >/dev/null; $A com send "_RECTANG 30,0 40,10\n" >/dev/null
$A com send "_-VPOINT 1,-1,1\n" >/dev/null; $A com send "_ZOOM _C 20,10,0 70\n" >/dev/null
P1=$(px 0,10,0); P2=$(px 40,5,0); PH=$(px 20,30,0); P0=$(px 0,0,0); PZ=$(px 0,0,10)
PA=$(px 20,0,0); PB=$(px 20,10,0); PC=$(px 0,20,0); PP=$(px 70,-30,0)
# DYNMODE typed whole goes through AutoComplete: the command by COM in the background, the value typed.
$A click $PP left >/dev/null; sleep 0.5; esc; ($A com send "DYNMODE\n" >/dev/null 2>&1 &); sleep 1.5; typ "3\n"; sleep 1
typ "_EXTRUDE\n"; sleep 1; $A click $P1 left >/dev/null; sleep 1; typ "\n"
hover $PH; shot d09-a $VX,$VY,2560,1177
typ "_D\n"; $A click $P0 left >/dev/null; sleep 1; hover $PZ; shot d09-b $VX,$VY,2560,1177; esc
typ "_REVOLVE\n"; sleep 1; $A key down >/dev/null; sleep 1; shot d09-f $VX,$VY,2560,1177; $A key esc >/dev/null; sleep 0.5
esc; typ "_REVOLVE\n"; sleep 1; $A click $P2 left >/dev/null; sleep 1; typ "\n"
hover $PA; shot d09-c $VX,$VY,2560,1177; $A click $PA left >/dev/null; sleep 1
hover $PB; shot d09-d $VX,$VY,2560,1177; $A click $PB left >/dev/null; sleep 1
hover $PC; shot d09-e $VX,$VY,2560,1177; esc
$A com eval '(setvar "DYNMODE" -1)' >/dev/null; $A com eval '(getvar "DYNMODE")'; $A com set OSMODE 4133 >/dev/null
