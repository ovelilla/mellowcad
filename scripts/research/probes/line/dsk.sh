#!/usr/bin/env bash
# d03–d20: LINE's desktop session (Spanish profile, 2026-10-21), the gestures in the order run.
# It clicks and types on the owner's screen: ask first, and tell them when it is over. Needs
# AutoCAD open with a drawing of the review's own (acad.sh com new) and MellowProbe loaded
# (com netload). The view is set to ZOOM C 50,25 100 on a 2560×1177 drawing area whose top-left
# is the screen's (2560,182): one drawing unit is 11.77 px. Settings read before, put back after:
# DYNMODE 0, OSMODE 4133, ORTHOMODE 0, AUTOSNAP 63, POLARANG 90°, CECOLOR BYLAYER, CLISTATE 0.
# Screenshots: research/probes/line/d<id>-*.png.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
sx() { python3 -c "print(round(3840+($1-50)*11.77))"; }
sy() { python3 -c "print(round(770.5-($1-25)*11.77))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" "${5:-}"; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none; }
scr() { $A shot -hwnd -1 -crop "$(($(sx "$1") - 300)),$(($(sy "$2") - 150)),600,300"; }

$A com send "_ZOOM _C 50,25 100\n"
at 50 25; $A key esc                                       # the keyboard focus
# d03 picks with every aid off land where clicked; the rubber band is a solid line
$A com set AUTOSNAP 32; $A com set OSMODE 0
$A type '_LINE\n'; at 10 10; mv 40 30; scr 40 30; at 40 30; at 40 10; $A key enter; $A com dump
# d04 the rubber band wears CECOLOR (red)
$A com eval '(setvar "CECOLOR" "1")'; $A type '_LINE\n'; at 20 0; mv 35 5; scr 28 3; $A key esc esc
$A com eval '(setvar "CECOLOR" "BYLAYER")'
# d05 a running Endpoint under the cursor: the marker, the tooltip, the crosshair on the point
$A com set OSMODE 4133; $A com set AUTOSNAP 63; $A type '_LINE\n'; mv 40.2 29.7; sleep 1.5; scr 40 30
# d06 Shift+right button: the object snap menu
at 60 15 right 1 shift; $A shot -hwnd -1 -crop "3938,238,620,1300"; $A key esc
# d07 the right button at the next point: the command's menu (SHORTCUTMENU 11)
at 60 15; mv 80 20; at 80 20 right; $A shot -hwnd -1 -crop "4173,429,620,900"; $A key esc
# d08 Escape keeps the segments: `*Cancelado*`
at 80 20; at 80 0; $A key esc; $A com hist 10
# d09 Ctrl+Z inside LINE answers `_u` at each prompt
$A type '_LINE\n'; at 0 40; at 20 40; at 20 50; $A key ctrl+z ctrl+z ctrl+z ctrl+z esc; $A com hist 16
# d10 F3, F8, F9, F10, F11, F12 at Command:, each twice: the echo, and Ortho turning Polar off
$A key f3 f3 f8 f8 f9 f9 f10 f10 f11 f11 f12 f12; $A com hist 16
# d11 dynamic input: the first point absolute, the next relative, # absolute, Tab, the Down arrow
$A com send "_ERASE _ALL \n"; $A com set DYNMODE 3; $A com set AUTOSNAP 32; $A com set OSMODE 0
mv 30 20; $A type '_LINE\n'; scr 30 20; $A type '5,5\n'; mv 40 30; $A type '10,0\n'
$A type '#30,30\n'; mv 45 35; $A type '20'; $A key tab; $A type '90\n'; mv 50 45; $A key down; scr 50 45
$A key esc esc; $A com dump; $A com set DYNMODE 0
# d12 Ortho with picks; Polar at 30° with a typed distance
$A com send "_ERASE _ALL \n"; $A com set ORTHOMODE 1; $A type '_LINE\n'; at 10 10; at 40 20; $A key enter
$A com set ORTHOMODE 0; $A com eval '(setvar "POLARANG" (/ pi 6))'; $A com set AUTOSNAP 40
$A type '_LINE\n'; at 10 40; mv 26 49.5; scr 22 46; $A type '20\n\n'; $A com dump
# d14 the angle override with a distance
$A type '_LINE\n'; at 60 10; $A type '<30\n'; mv 70 25; $A type '20\n\n'; $A com dump
# d13 OTRACK from an acquired Endpoint
$A com set OSMODE 1; $A com set AUTOSNAP 48; $A type '_LINE\n'; at 80 40; mv 40.1 10.1; sleep 1.5
mv 55 10.6; scr 48 12; at 55 10.6; $A type '\n'; $A com dump
# d15 a line's grips, the end grip's menu, an end grip dragged off its line
$A key esc esc; at 25 10.05; scr 25 10; mv 40.05 10.05; sleep 2; scr 40 8
$A com set OSMODE 0; at 40.05 10.05; at 50 20; $A key esc esc; $A com dump
# d15 the midpoint grip with two lines selected moves only its line
at 18.67 45.04; at 68.73 15.05; at 68.73 15.0467; at 68.73 30; $A key esc esc; $A com dump
# d16 the Properties palette of a line
at 18.67 45.04; $A key ctrl+1; $A shot -hwnd -1 -crop "2560,0,2560,1400"; $A key ctrl+1 esc esc
# d17 a double-click on one point at the next point
$A type '_LINE\n'; at 30 -5; at 45 -5 left 2; $A type '\n'; $A com dump; $A com hist 10
# d18 the wheel mid-command
$A type '_LINE\n'; at 0 -10; $A click "$(sx 20)" "$(sy -10)" wheel 1; at 20 -12; $A type '\n'
$A com send "_ZOOM _C 50,25 100\n"
# d19 the ribbon's Line button (window pixels 31,90): `Comando: _line`
$A click 2583 82; at 5 -15; at 15 -15; $A key esc; $A com hist 8
# d20 the rollover highlight and tooltip at Command:
mv 18.67 45.04; sleep 1; scr 18 45
# put the settings back
$A com set DYNMODE 0; $A com set OSMODE 4133; $A com set ORTHOMODE 0; $A com set AUTOSNAP 63
$A com eval '(setvar "POLARANG" (/ pi 2))'; $A com eval '(setvar "CECOLOR" "BYLAYER")'

# Second pass (the same night). Objects: lines 0,0–30,0; 40,-10–40,20; 35,5–50,5; 45,30–60,45;
# a circle at 70,20 radius 10. AUTOSNAP 39 (no Polar, no OTRACK), LINE from 60,-5.
$A com set AUTOSNAP 39
snap() { at 95 45; $A key esc esc; $A com set OSMODE "$2"; $A type '_LINE\n60,-5\n'; mv "$3" "$4"
  sleep 1.3; scr "$3" "$4"; at "$3" "$4"; $A key esc; $A com dump; }
# d21 each running snap, hovered then picked
snap end 1 29.6 0.3; snap mid 2 15.3 0.3; snap cen 4 79.7 21; snap qua 16 80.3 20.3
snap int 32 40.3 5.3; snap per 128 40.2 -3; snap tan 256 60.4 19.2; snap nea 512 10.3 0.2
snap app 2048 40.3 5.3
# d22 Midpoint picked from the Shift+right menu (it opens upwards near the screen's bottom: shoot it
# first and click the entry where it shows)
$A com set OSMODE 0; $A type '_LINE\n60,-5\n'; at 5 3 right 1 shift
# d23 snap mode with picks
$A com set SNAPMODE 1; $A type '_LINE\n'; at 13 7; at 27.5 -14; $A key esc; $A com set SNAPMODE 0
# d24 a running snap with Ortho on
$A com set OSMODE 1; $A com set ORTHOMODE 1; $A type '_LINE\n60,-5\n'; at 30.3 0.3; $A key esc
$A com set ORTHOMODE 0
# d25 the aperture: Endpoint at 5, 7, 9, 10, 11, 12, 14 px from 30,0
for px in 5 7 9 10 11 12 14; do $A type '_LINE\n60,-5\n'; $A click "$(sx 30)" "$(($(sy 0) - px))"
  $A key esc; $A com dump; done
# d26 Tab over stacked snaps
$A com set OSMODE 35; $A type '_LINE\n60,-5\n'; mv 40.3 5.4; scr 40 5; $A key tab; scr 40 5
$A key esc esc
# d27 the English profile (acad.exe /language en-US): F3, F8, F9, F10, F11 twice each, Escape
# inside LINE and at Command:
