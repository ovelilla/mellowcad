#!/usr/bin/env bash
# RECTANG's and POLYGON's desktop session (a launched instance, English profile, 2026-10-21), the
# gestures in the order run. It clicks and types on the owner's screen: ask first, and tell them
# when it is over. Needs AutoCAD open (acad.sh launch) and a drawing of the review's own (acad.sh
# com new). View ZOOM C 50,25 100 on a 2144×1169 drawing area at the screen's (6,186): one drawing
# unit is 11.69 px. Settings read before, put back after: DYNMODE -1, OSMODE 4133, ORTHOMODE 0,
# CECOLOR BYLAYER, SHORTCUTMENU 11. Screenshots: research/probes/rectang/d<id>-*.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
sx() { python3 -c "print(round(1077.5+($1-50)*11.69))"; }
sy() { python3 -c "print(round(771-($1-25)*11.69))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.6; }
scr() { $A shot -hwnd -1 -crop "$(($(sx "$1") - 400)),$(($(sy "$2") - 250)),800,500"; }

$A com send "_ZOOM _C 50,25 100\n"; $A com set OSMODE 0; $A com set DYNMODE 0; $A com eval '(setvar "CECOLOR" "1")'
# d01 RECTANG's other corner (DYNMODE 0): the rectangle's ghost in CECOLOR red, no line from the first
# corner; with Ortho (F8) the ghost flattens, tooltip `Ortho: 20.9662 < 0°`, and the pick makes a
# rectangle of no area (four vertices on one line, Area 0)
at 90 45; $A key esc; ty '_RECTANG\n'; at 40 20; mv 60 30; scr 50 25; $A key f8; mv 61 31; scr 50 25
at 60 30; $A key f8; $A com netload; $A com dump
# d02 POLYGON's radius: the ghost in red and an amber dashed line from the centre to the cursor; Edge's
# second endpoint: the ghost alone, and Ortho bends it about the first endpoint (`Ortho: 10.1836 < 0°`)
$A com send "_ERASE _ALL \n"; ty '_POLYGON\n5\n'; at 50 25; ty '_I\n'; mv 58 29; scr 50 25; $A key esc esc
ty '_POLYGON\n5\n_E\n'; at 40 20; mv 50 24; scr 45 25; $A key f8; mv 50.2 24.2; scr 45 25; at 50 24; $A key f8
# d03 `<45` at RECTANG's other corner: `Angle Override: 11.9808 < 45°` and the ghost along 45° from the
# first corner; 10 makes the 7.0711-square (the console, no cursor, ignores it: p08)
$A com send "_ERASE _ALL \n"; ty '_RECTANG\n'; at 40 20; ty '<45\n'; mv 55 22; scr 45 25; ty '10\n'; $A com dump
# d04 Rotation's Pick points: no rubber line at the second point; the corner afterwards turned
ty '_RECTANG\n'; at 40 5; ty '_R\n_P\n'; at 45 5; mv 55 10; scr 50 7; at 55 10; mv 60 15; scr 50 10; $A key esc esc
# d05 dynamic input (DYNMODE 3) at the other corner: the two sides' dimensions, length and width along
# the turned sides; `10,5` typed is relative to the first corner, LASTPOINT the corner given;
# `10` Tab `4` makes 10 × 4
$A com send "_ERASE _ALL \n"; $A com set DYNMODE 3; ty '_RECTANG\n'; mv 40.1 20.1; scr 45 22; at 40 20; mv 55 27
scr 48 24; ty '10,5\n'; $A com dump; ty '_ID\n@\n'; $A com hist 6
$A com send "_ERASE _ALL \n"; ty '_RECTANG\n'; at 30 20; ty '_R\n0\n'; mv 45 28; scr 40 24; ty '10'; $A key tab
ty '4'; scr 40 24; ty '\n'; $A com dump
# d06 POLYGON with dynamic input: the sides box; the radius a lone distance box; Edge's second endpoint a
# distance and an angle, `10,0` relative to the first endpoint
$A com send "_ERASE _ALL \n"; ty '_POLYGON\n'; mv 50 25; scr 50 25; ty '5\n'; at 50 25; mv 51 26; scr 50 25
ty '_I\n'; mv 58 29; scr 50 25; $A key esc esc; ty '_POLYGON\n5\n_E\n'; at 40 20; mv 50 24; scr 45 25
ty '10,0\n'; $A com dump
# d07 the right button at RECTANG's first corner: Enter, Cancel, Recent Input, Dynamic Input, Chamfer,
# Elevation, Fillet, Thickness, Width, Osnap Overrides, Pan, Zoom, SteeringWheels, QuickCalc; the Down
# list at POLYGON's centre: Edge
$A com send "_ERASE _ALL \n"; ty '_RECTANG\n'; at 40 25 right; $A shot -hwnd -1 -crop "911,421,600,800"
$A key esc esc esc; ty '_POLYGON\n\n'; at 50 25; mv 51 26; $A key down; scr 50 25; $A key esc esc esc
# put the settings back (DYNMODE through Lisp; `com get DYNMODE` then read 3 where Lisp read -1)
$A com set OSMODE 4133; $A com set ORTHOMODE 0; $A com eval '(setvar "DYNMODE" -1)'
$A com eval '(setvar "CECOLOR" "BYLAYER")'
