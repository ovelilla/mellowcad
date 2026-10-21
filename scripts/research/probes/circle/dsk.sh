#!/usr/bin/env bash
# d01–d11: CIRCLE's desktop session (English profile of a launched instance, 2026-10-21), the gestures
# in the order run. It clicks and types on the owner's screen: ask first, and tell them when it is over.
# Needs AutoCAD open (acad.sh launch), a drawing of the review's own (acad.sh com new) and MellowProbe
# loaded (com netload). View ZOOM C 50,25 100 on a 2144×1169 drawing area at the screen's (6,186):
# one drawing unit is 11.69 px. The ribbon's Circle drop-down opens at (119,120); its items: Center,
# Radius (165,154), Center, Diameter (170,194), 2-Point (155,238), 3-Point (155,278), Tan, Tan, Radius
# (175,323), Tan, Tan, Tan (170,363). Settings read before, put back after: DYNMODE 3, OSMODE 4133,
# ORTHOMODE 0, CECOLOR BYLAYER, CIRCLERAD 0. Screenshots: research/probes/circle/d<id>-*.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
sx() { python3 -c "print(round(1077.5+($1-50)*11.69))"; }
sy() { python3 -c "print(round(771-($1-25)*11.69))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.6; }
scr() { $A shot -hwnd -1 -crop "$(($(sx "$1") - 400)),$(($(sy "$2") - 250)),800,500"; }
menu() { $A click 119 120; sleep 1; $A click "$1" "$2"; sleep 1; }

$A com send "_ZOOM _C 50,25 100\n"; $A com set OSMODE 0; $A com set DYNMODE 0
$A com eval '(setvar "CECOLOR" "1")'
# d01 the ribbon's Center, Diameter: `Command: _circle`, the centre prompt, then
# `Specify radius of circle or [Diameter]: _d Specify diameter of circle:` on one line; the ghost in
# CECOLOR red, an amber dashed line from the centre to the cursor, past the rim
menu 170 194; at 40 25; mv 55 30; scr 40 25; at 55 30; $A com hist 8
# d02 2-Point: only the ghost circle, no chord; 3-Point: nothing after the first point (no line),
# the ghost through both points and the cursor after the second;
# `… [3P/2P/Ttr (tan tan radius)]: _3p Specify first point on circle:` on one line
menu 155 238; at 40 10; mv 55 15; scr 40 10; $A key esc
menu 155 278; at 70 10; mv 80 20; scr 70 10; at 80 20; mv 72 28; scr 70 10; $A key esc; $A com hist 12
# d03 Tan, Tan, Radius over a line and a circle: the green Deferred Tangent marker and its tooltip,
# no highlight of the object; nothing drawn at `Specify radius of circle <7.8882>:` (CIRCLERAD)
$A com send "_LINE 20,40 90,40 \n"; menu 175 323; mv 60 40.2; scr 60 40; at 60 40.2; mv 40.5 32.9
scr 40 33; at 40.5 32.9; mv 50 50; scr 45 40; ty '4\n'; $A com hist 8
# d04 Tan, Tan, Tan: `_3p Specify first point on circle: _tan to`, each point `_tan to`; two picks on
# one line `Circle does not exist.`; a third pick on nothing `No found for specified point.`,
# `Invalid 2D point.` and the third point asked again
menu 170 363; at 25 40.1; at 32.2 25; at 75 39.9; $A com hist 10; $A key esc esc
# d05 dynamic input (DYNMODE 3): the centre's Down list 3P, 2P, Ttr (tan tan radius); at the radius
# an aligned dimension with the radius in its box and the amber dashed radius line; its Down list
# `• 4.0000` (CIRCLERAD) and Diameter; Escape closes the list and keeps the prompt
$A com set DYNMODE 3; ty '_CIRCLE\n'; mv 75.1 0.1; scr 75 0; $A key down; scr 75 0; $A key esc; $A key esc
ty '_CIRCLE\n'; at 75 0; mv 82 3; scr 75 0; $A key down; scr 75 0; $A key esc; mv 82.1 3.1; scr 75 0
$A key esc
# d06 the right button at the radius prompt (SHORTCUTMENU 11): Enter, Cancel, Recent Input ▸ ·
# Diameter · Osnap Overrides ▸ · Pan, Zoom, SteeringWheels · QuickCalc; Enter takes CIRCLERAD
ty '_CIRCLE\n'; at 60 50; mv 66 52; at 66 52 right; sleep 2; scr 66 52; $A key esc esc
# d07 Ctrl+Z answers `_u`: at the radius
# `Requires numeric distance, second point, or option keyword.`, at 3P's second point `Invalid point.`;
# the prompt asked again
ty '_CIRCLE\n'; at 90 50; $A key ctrl+z; $A key esc; ty '_CIRCLE\n_3P\n'; at 90 50; $A key ctrl+z
$A key esc; $A com hist 16
# d08 a circle's grips: the centre and four quadrants; hovering a quadrant shows the radius as a
# dimension from the centre, no menu; hovering the centre, no menu
$A com send "_CIRCLE 20,0 5\n"; at 20 5; scr 20 0; mv 25 0; sleep 2.5; scr 25 0; $A key esc
at 20 5; mv 20 0; sleep 2.5; scr 20 0; $A key esc esc
# d09 dragging a quadrant grip: the radius is the centre's distance to the cursor (8.5158), the
# dynamic input boxes the new radius and the change (3.5158), the centre stays
at 20 5; at 25 0; mv 28 3; scr 22 0; at 28 3; $A key esc esc
$A com eval '(list (cdr (assoc 10 (entget (entlast)))) (cdr (assoc 40 (entget (entlast)))))'
# d10 the Properties palette of a circle: General (Color, Layer, Linetype, Linetype scale, Plot style,
# Lineweight, Transparency, Hyperlink, Thickness), 3D Visualization (Material), Geometry (Center X,
# Center Y, Center Z, Radius, Diameter, Circumference, Area, Normal X/Y/Z greyed)
at 20 8.516; $A key ctrl+1; sleep 2; $A shot -hwnd -1 -crop "0,0,2560,1400"; $A key ctrl+1; $A key esc esc
# d11 a double-click on a circle at Command: opens Quick Properties (Color, Layer, Linetype, Center X,
# Center Y, Radius, Diameter, Circumference, Area)
at 20 8.516 left 2; sleep 2; $A shot -hwnd -1 -crop "0,0,2560,1400"; $A key esc esc
# Second pass, a new drawing (com new, com netload), the same view; DYNMODE 0, OSMODE 0.
# d12 Ortho (ORTHOMODE 1) bends the radius pick (centre 20,40, pick 26,43 → r 5.99) but not 2P's second
# point (40,10 → 55,18: centre 47.52,14.01 r8.48) nor 3P's (70,10, 80,14, 74,25 → centre 72.92,17.27)
$A com set ORTHOMODE 1; ty '_CIRCLE\n_2P\n'; at 40 10; at 55 18; ty '_CIRCLE\n_3P\n'; at 70 10; at 80 14
at 74 25; ty '_CIRCLE\n'; at 20 40; at 26 43; $A com set ORTHOMODE 0
# d13 Ttr: a click on nothing, or on an ellipse (a Tangent marker shows on it), writes
# `*Requires a TAN object-snap and selection of Circle, Arc, or Line.` and asks again
$A com send "_ELLIPSE 60,50 80,50 5\n"; ty '_CIRCLE\n_T\n'; at 30 60; $A key esc; ty '_CIRCLE\n_T\n'; at 60 55
$A key esc; $A com hist 8
# d14 DASHED circles on screen as on the plot (p231): r 2.9713 (k 0.98) solid, 4.2447 (1.4) two
# periods, 7.8829 (2.6) three, from 3 o'clock counter-clockwise; FILEDIA 1 put back
$A com set FILEDIA 0; ty '_-LINETYPE\nL\nDASHED\n\n\n'; $A com set FILEDIA 1; $A com send "_ERASE _ALL \n"
$A com eval '(setvar "CELTYPE" "DASHED")'
$A com send "_CIRCLE 25,10 2.971262\n_CIRCLE 45,10 4.24466\n_CIRCLE 70,10 7.88294\n"
$A com eval '(setvar "CELTYPE" "ByLayer")'; $A com send "_ZOOM _W 15,0 80,20\n"; $A shot -hwnd -1 -crop "6,186,2144,1169"
# d15 in UCS Z 30 a circle's grips stay at its OCS quadrants; 12 typed with a quadrant grip hot
# makes the radius 12, measured from the centre
$A com send "_ERASE _ALL \n_ZOOM _C 50,25 100\n_CIRCLE 50,25 8\n_UCS _Z 30\n"; at 50 33; scr 50 25; at 58 25
ty '12\n'; $A key esc esc; $A com send "_UCS _W\n"
# put the settings back
$A com set OSMODE 4133; $A com set ORTHOMODE 0; $A com set DYNMODE 3
$A com eval '(setvar "CECOLOR" "BYLAYER")'; $A com eval '(setvar "CIRCLERAD" 0.0)'
