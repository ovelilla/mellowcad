#!/usr/bin/env bash
# d01–d09: the 3D interaction review's desktop pass (2026-10-31, en-US), with the owner's mouse.
# Needs AutoCAD open (acad.sh launch "" en-US), MellowProbe loaded (acad.sh com netload) and a
# drawing of the probe's own (acad.sh com new). Reads each result with entget; restore AUTOSNAP,
# OSMODE, ORTHOMODE and SNAPMODE afterwards. A pending prompt locks COM: every pixel is worked out
# before LINE starts. Never press F10 here: Windows takes it for the menu bar and swallows the keys
# typed next; set Polar through AUTOSNAP's bit 8 instead.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
R='(list (cdr (assoc 10 (entget (entlast)))) (cdr (assoc 11 (entget (entlast)))))'
# The screen pixel of a world point: its DCS point against VIEWCTR's, scaled by SCREENSIZE /
# VIEWSIZE, plus the view window's origin (acad.sh children: here 2560,182).
$A com eval '(defun mpx (p / c s h d) (setq c (trans (getvar "VIEWCTR") 1 2) s (getvar "SCREENSIZE") h (getvar "VIEWSIZE") d (trans p 0 2)) (list (fix (+ 2560 (/ (car s) 2.0) (* (- (car d) (car c)) (/ (cadr s) h)))) (fix (+ 182 (- (/ (cadr s) 2.0) (* (- (cadr d) (cadr c)) (/ (cadr s) h)))))))'
px() { $A com eval "(mpx '($1))" | tr -d '()'; }
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.4; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 0.7; }
from_z50() { # LINE from 0,100,50, the mouse on world point $1's pixel, a click there, the result
  set -- $(px "$1")
  $A click 2700 1300 left >/dev/null; $A key esc >/dev/null; sleep 0.5
  $A type "_LINE\n0,100,50\n${PREFIX:-}" >/dev/null; sleep 0.4
  hover "$1" "$2"; $A click $(($1 + 1)) "$2" left >/dev/null; sleep 0.4; $A key esc >/dev/null; sleep 0.4
  $A com eval "$R"
}
$A com send "_LINE 0,0,0 0,100,0 0,100,50 \n"
$A com send "_-VIEW _SEISO\n"
$A com send "_ZOOM _E _ZOOM 0.4X\n"
$A com eval '(setvar "AUTOSNAP" (logior (getvar "AUTOSNAP") 8))'
# d01 Polar: over the 0° guide drawn at Z 50 (Polar: 59.8975 < 0°, 59.8975,100,50); over its
# image at Z 0 nothing engages
from_z50 "60 100 50"
# d02 Polar free: the work plane, 29.97,130.39,0
from_z50 "30 130 0"
# d04 Polar 8 px below its guide at 100,100,50 (add 8 to the pixel's y by hand): 101.648,100,50
# d03 Ortho on 80,100,0's pixel: 129.875,100,50; the sweep moves the pointer 200 px from
# 0,100,50's pixel every 4° to 20°
$A com set ORTHOMODE 1
from_z50 "80 100 0"
# d05 SNAP 10 with Ortho on 83,100,0's pixel: 130,100,50; SNAP alone: 80,100,0; `<0`: 132.849
$A com set SNAPMODE 1; from_z50 "83 100 0"
$A com set ORTHOMODE 0; from_z50 "83 100 0"
$A com set SNAPMODE 0; PREFIX='<0\n' from_z50 "83 100 0"
# d06 a line 200,0,50 → 240,0,50: pick it, its end grip, Ortho, 300,0,0's pixel: −Z (Ortho:
# 79.7743 < -Z). d07 _PLAN _W: Polar on 60,101,0 gives 60.38,100,50; Ortho on 70,115,0 gives
# 70.29,100,50. d08 (command "_VPOINT" "0,-1,0"): a click on 50,0,30's pixel lands at
# 50.23,0,30.2. d09 OTRACK: acquire 0,0,0 and go 150 px straight up: Endpoint: 75.5448 < +Z.
