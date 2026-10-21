#!/usr/bin/env bash
# ARC's desktop session (a launched instance, English profile `enu`, 2026-10-21), the gestures in
# the order run. It clicks and types on the owner's screen: ask first, and tell them when it is over.
# Needs AutoCAD open (acad.sh launch), a drawing of the review's own (acad.sh com new) and MellowProbe
# loaded (com netload). View ZOOM C 50,25 100 on a 2144×1169 drawing area at the screen's (6,186):
# one drawing unit is 11.69 px. The ribbon's Arc drop-down opens at (168,118); its items: 3-Point
# (207,153), Start, Center, End (233,198), Center, Start, End (233,448). Settings read before, put
# back after: DYNMODE -1, OSMODE 4133, ORTHOMODE 0, CECOLOR BYLAYER, SHORTCUTMENU 11, POLARMODE 0.
# Screenshots: research/probes/arc/d<id>-*.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
sx() { python3 -c "print(round(1077.5+($1-50)*11.69))"; }
sy() { python3 -c "print(round(771-($1-25)*11.69))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.6; }
scr() { $A shot -hwnd -1 -crop "$(($(sx "$1") - 400)),$(($(sy "$2") - 250)),800,500"; }
menu() { $A click 168 118; sleep 1; $A click "$1" "$2"; sleep 1; }

$A com send "_ZOOM _C 50,25 100\n"; $A com set OSMODE 0; $A com eval '(setvar "CECOLOR" "1")'
# d01 the ribbon's 3-Point with dynamic input on (DYNMODE -1 shows it): `Command: _arc`; at the second
# point an amber dashed line from the start, dimensional input boxes; at the end the ghost in CECOLOR
# red through the three, and dynamic input's dimension and amber line from the second point
menu 207 153; at 40 25; mv 50 30; scr 45 27; at 50 30; mv 60 22; scr 50 25; at 60 22; $A com hist 8
# d02 the same with DYNMODE 0: the amber dashed line at the second point only; at the end the ghost alone
$A com set DYNMODE 0; menu 207 153; at 40 5; mv 50 10; scr 45 7; at 50 10; mv 60 2; scr 50 5; at 60 2
# d03 Start, Center, End: echoed `_arc`, the start, `…[Center/End]: _c`; at the centre an amber dashed
# line from the start; at the end the ghost counter-clockwise and an amber dashed line from the centre
# to the cursor; Ctrl held turns the ghost clockwise, released it turns back; a pick with Ctrl makes
# the clockwise arc (centre 50.04,29.96 r 11.17, 116.8° to 206.4°)
$A com send "_ERASE _ALL \n"; menu 233 198; at 40 25; mv 50 30; scr 45 27; at 50 30; mv 45 40; scr 50 30
mv 45 40 ctrl; scr 50 30; mv 46 40; scr 50 30; at 45 40 left 1 ctrl; $A com hist 8
# d04 Center, Start, End: `_arc` then `…[Center]: _c`; at the start an amber dashed line from the
# centre; at the end the ghost and the amber line from the centre
$A com send "_ERASE _ALL \n"; menu 233 448; at 50 25; mv 60 28; scr 50 25; at 60 28; mv 45 35; scr 50 25
at 45 35
# d05 dynamic input (DYNMODE 3): the Down list at the start Center; at 3P's second Center, End; at the
# centre-mode end Angle, chord Length, the box an angular dimension of the sweep (126°); at SCE's centre
# a length and an angle from the start. Escape on the start's list cancelled ARC
$A com set DYNMODE 3; ty '_ARC\n'; mv 40.1 25.1; $A key down; scr 40 25; $A key esc esc
ty '_ARC\n'; at 40 25; mv 50 30; $A key down; scr 45 27; at 50 30; mv 60 22; scr 50 25; at 60 22
ty '_ARC\n'; at 40 5; ty '_C\n'; mv 50 8; scr 45 7; at 50 8; mv 45 15; $A key down; scr 50 8; $A key esc esc esc
# d06 Ortho (ORTHOMODE 1, DYNMODE 0) bends only the centre modes' end: 3P 20,20 30,24 36,15 is the arc
# through the three as picked; SCE start 50,20 centre 58,23 (not bent) end 55,30 → the end straight
# above the centre; CSE centre 80,20 start 88,23 (not bent) end 84,30 → straight above
$A com set DYNMODE 0; $A com send "_ERASE _ALL \n"; $A com set ORTHOMODE 1
ty '_ARC\n'; at 20 20; at 30 24; at 36 15; ty '_ARC\n'; at 50 20; ty '_C\n'; at 58 23; at 55 30
ty '_ARC\n_C\n'; at 80 20; at 88 23; at 84 30; $A com set ORTHOMODE 0; $A com dump
# the right button at the start (Enter, Cancel, Recent Input, Center, Osnap Overrides, Pan, Zoom,
# SteeringWheels, QuickCalc) and at 3P's second (Center, End)
$A com send "_ERASE _ALL \n"; ty '_ARC\n'; mv 40 25; at 40 25 right; scr 40 25; $A key esc; at 40 25
at 46 27 right; scr 46 27; $A key esc esc esc
# d07 an arc's grips: both ends, the middle, the centre; hovering the middle: Stretch, Radius; an end:
# Stretch, Lengthen; the centre: no menu
$A com send "_ERASE _ALL \n_ARC 40,25 50,30 60,25\n"; at 50 30; scr 50 25; $A key esc esc
at 52 29.85; mv 40 25; sleep 2.5; scr 50 25; $A key esc esc; at 52 29.85; mv 50 17.5; sleep 2.5; scr 50 25
$A key esc esc
# d08 dragging the middle grip: the arc through both ends and the cursor (50,34 → centre 50,23.9245
# r 10.0577), its ghost in the arc's colour
at 52 29.85; at 50 30; mv 50 34; scr 50 27; at 50 34; $A key esc esc
# d09 the Properties palette of an arc: General as a circle's; Geometry Start X/Y/Z (grey), Center
# X/Y/Z, End X/Y/Z (grey), Radius, Start angle, End angle, Total angle, Arc length, Area (grey),
# Normal X/Y/Z (grey)
at 50 33.98; $A key ctrl+1; sleep 2; $A shot -hwnd -1 -crop "0,0,2560,1400"; $A key ctrl+1; $A key esc esc
# d10 DASHED arcs on screen (DASHED 12.7/-6.35): CSE r3 half (9.42 long), r5 quarter (7.85) and 3P r5
# half (15.71) solid; r8 half (25.13) a dash from each end and one gap at the middle
$A com set FILEDIA 0; ty '_-LINETYPE\nL\nDASHED\n\n\n'; $A com set FILEDIA 1; $A com send "_ERASE _ALL \n"
$A com eval '(setvar "CELTYPE" "DASHED")'
$A com send "_ARC _C 25,10 28,10 22,10\n_ARC _C 45,10 50,10 45,15\n_ARC _C 70,10 78,10 62,10\n_ARC 90,10 95,15 100,10\n"
$A com eval '(setvar "CELTYPE" "ByLayer")'; $A com send "_ZOOM _W 15,-2 105,22\n"; $A shot -hwnd -1 -crop "6,186,2144,1169"
# put the settings back (DYNMODE through Lisp: com set reads -1 as a switch)
$A com set OSMODE 4133; $A com set ORTHOMODE 0; $A com eval '(setvar "DYNMODE" -1)'
$A com eval '(setvar "CECOLOR" "BYLAYER")'
