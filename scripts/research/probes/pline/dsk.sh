#!/usr/bin/env bash
# d01–d12: PLINE's desktop session (English profile of a launched instance, 2026-10-21), the gestures in
# the order run. It clicks and types on the owner's screen: ask first, and tell them when it is over.
# Needs AutoCAD open (acad.sh launch), a drawing of the review's own (acad.sh com new) and MellowProbe
# loaded (com netload). View ZOOM C 50,25 100 on a 2144×1169 drawing area at the screen's (6,186):
# one drawing unit is 11.69 px. Settings read before, put back after: DYNMODE 3, OSMODE 4133,
# ORTHOMODE 0, CECOLOR BYLAYER, PLINEWID 0, FILLMODE 1. Screenshots: research/probes/pline/d<id>-*.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
sx() { python3 -c "print(round(1077.5+($1-50)*11.69))"; }
sy() { python3 -c "print(round(771-($1-25)*11.69))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.6; }
scr() { $A shot -hwnd -1 -crop "$(($(sx "$1") - 400)),$(($(sy "$2") - 200)),800,400"; }

$A com send "_ZOOM _C 50,25 100\n"; $A com set OSMODE 0; $A com set DYNMODE 0
# d01 the ribbon's Polyline (window 70,83): `Command: _pline`; the rubber band and the chain in CECOLOR
# red, a small + on the start point; Escape keeps the chain: `*Cancel*`
$A com eval '(setvar "CECOLOR" "1")'; $A click 70 83; at 10 10; mv 40 30; scr 30 25; at 40 30; mv 45 5
scr 30 20; $A key esc; $A com hist 12; $A com dump; $A com eval '(setvar "CECOLOR" "BYLAYER")'
# d02 Width 2 4: the jig is the tapered band, grey; PLINEWID keeps 4 after Escape
ty '_PLINE\n'; at 10 40; ty 'W\n2\n4\n'; mv 30 45; scr 22 42; $A key esc
# d03 arc mode: the wide arc jig with a dashed orange chord from its start; Ctrl held at the pick
# turns it the other way (bulge 2.288)
ty '_PLINE\n'; at 10 40; at 30 45; ty 'A\n'; mv 45 35; scr 30 40; at 45 35.3 left 1 ctrl; ty '\n'; $A com dump
# d04 the right button at the next point and in arc mode (SHORTCUTMENU 11): Enter, Cancel, Recent
# Input ▸ · the prompt's options as listed · Osnap Overrides ▸ · Pan, Zoom, SteeringWheels · QuickCalc
ty '_PLINE\n'; at 60 10; at 75 15; at 85 12 right; scr 85 5; $A key esc; ty 'A\n'; at 85 12 right; scr 85 0; $A key esc
# d05 Ctrl+Z inside PLINE answers `_u`: the arc mode's only segment back to the line prompt, then
# `All segments already undone.`
$A key ctrl+z; $A key ctrl+z; $A key esc; $A com hist 12
# d06 dynamic input (DYNMODE 3): length and angle at the next point, the Down arrow's list, Width's
# box with a dashed band from the last vertex, Length's box, the arc's pointer fields
$A com set DYNMODE 3; mv 20 -5; ty '_PLINE\n'; scr 25 -8; at 20 -5; mv 40 0; scr 35 -3; $A key down; scr 40 -5
$A key esc; ty 'W\n'; mv 40 1; scr 35 -3; ty '\n'; ty '\n'; ty 'L\n'; mv 40 2; scr 35 -3; ty '10\n'; ty 'A\n'
mv 50 5; scr 45 0; $A key esc; $A com hist 16
# d07 a polyline's grips and their menus: vertex (Stretch Vertex, Add Vertex, Remove Vertex, the
# segments' lengths), a line segment's midpoint (Stretch, Add Vertex, Convert to Arc), an arc's
# midpoint (Stretch, Add Vertex, Convert to Line, the radius); the rollover tooltip
$A com send "_PLINE 10,60 30,60 _A 40,70 _L 55,70 \n"; $A key esc esc; at 50 70; mv 30.05 60.05; sleep 2.5; scr 32 58
$A key esc esc; at 50 70; mv 37.07 62.93; sleep 2.5; scr 38 62; $A key esc esc; at 50 70; at 20 60; sleep 2.5; scr 22 58
# d08 the Properties palette of a polyline
$A key esc esc; at 50 70; $A key ctrl+1; $A shot -hwnd -1 -crop "0,0,2560,1400"; $A key ctrl+1; $A key esc esc
# d09 dragging the grips: a line segment's midpoint moves the segment, a vertex moves alone, an arc's
# midpoint bends the arc through the point; U says `Grip Edit`
at 50 70; at 20 60; at 20 55; $A key esc esc; $A com dump; $A com send "_U\n"
at 50 70; at 30.05 60.05; at 30 55; $A key esc esc; $A com dump; $A com send "_U\n"
at 50 70; at 37.07 62.93; at 36 64; $A key esc esc; $A com dump; $A com send "_U\n"
# d10 a double-click on a polyline at Command: opens PEDIT
at 20 60 left 2; $A key esc esc esc
# d11 a double-click at the next point adds one vertex
ty '_PLINE\n'; at 60 50; at 75 50 left 2; at 75 40; ty '\n'; $A com dump
# d12 wide segments mitred where widths meet, square where they change; FILLMODE 0 shows outlines
$A com send "_ERASE _ALL \n"; $A com send "_PLINE 10,10 _W 3 3 40,10 25,35 _W 0 6 50,30 _A 70,30 \n"
$A com send "_PLINEWID 0\n"; mv 95 -10; scr 40 22; $A com set FILLMODE 0; $A com send "_REGEN\n"; scr 40 22
$A com set FILLMODE 1; $A com send "_REGEN\n"
# put the settings back
$A com set OSMODE 4133; $A com set ORTHOMODE 0; $A com set DYNMODE 3; $A com eval '(setvar "CECOLOR" "BYLAYER")'
