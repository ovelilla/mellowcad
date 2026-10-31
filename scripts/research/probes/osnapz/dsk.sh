#!/usr/bin/env bash
# d01–d02: OSNAPZ 1 on the desktop, en-US, with the owner's mouse (not run yet: ask first).
# Needs AutoCAD open (acad.sh launch "" en-US), MellowProbe loaded (acad.sh com netload) and a
# drawing of the probe's own (acad.sh com new). Restore OSNAPZ, AUTOSNAP and OSMODE afterwards.
# The helpers are interaction3d/dsk.sh's: the view window's origin (2560,182) is read again with
# acad.sh children before running.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
R='(list (cdr (assoc 10 (entget (entlast)))) (cdr (assoc 11 (entget (entlast)))))'
$A com eval '(defun mpx (p / c s h d) (setq c (trans (getvar "VIEWCTR") 1 2) s (getvar "SCREENSIZE") h (getvar "VIEWSIZE") d (trans p 0 2)) (list (fix (+ 2560 (/ (car s) 2.0) (* (- (car d) (car c)) (/ (cadr s) h)))) (fix (+ 182 (- (/ (cadr s) 2.0) (* (- (cadr d) (cadr c)) (/ (cadr s) h)))))))'
px() { $A com eval "(mpx '($1))" | tr -d '()'; }
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.4; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 0.7; }
$A com send "_LINE 0,0,0 0,100,0 0,100,50 \n"
$A com send "_-VIEW _SEISO\n"
$A com send "_ZOOM _E _ZOOM 0.4X\n"
$A com set OSMODE 1
$A com eval '(setvar "AUTOSNAP" (logior (getvar "AUTOSNAP") 16))'
$A com set OSNAPZ 1
# d01 the marker off the plan: hover 0,100,50's end and capture: is the square on the top end
# (the object) or under it, at Z 0?
set -- $(px "0 100 50")
$A click 2700 1300 left >/dev/null; $A key esc >/dev/null; sleep 0.5
$A type "_LINE\n200,0,0\n" >/dev/null; sleep 0.4
hover "$1" "$2"; $A shot
# d02 OTRACK from it: acquired by that dwell, then along its X guide to 60,100,50's pixel, a
# click: the end's Z is 50 if the acquired point keeps its object's Z, 0 if OSNAPZ projects it.
set -- $(px "60 100 50")
hover "$1" "$2"; $A shot; $A click $(($1 + 1)) "$2" left >/dev/null; sleep 0.4
$A key esc >/dev/null; sleep 0.4
$A com eval "$R"
$A com set OSNAPZ 0
