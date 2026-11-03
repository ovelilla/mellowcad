#!/usr/bin/env bash
# d11–d14: BOX's height dragged with the owner's mouse (2026-11-03, en-US launched instance), the
# owner's report that it did not follow the mouse. Needs AutoCAD open (acad.sh launch "" en-US) and a
# drawing of the probe's own (acad.sh com new); OSMODE 4133, AUTOSNAP 55, DYNMODE 3, nothing changed.
# The view window is 2156×1177 at the screen's 2560,182; mpx gives a world point's pixel there.
# Each BOX's corners are typed (`#` keeps the other corner absolute under DYN), the height dragged.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
$A com send "_BOX 0,0,0 100,100 50 _CIRCLE 150,-100,0 20 _POINT 300,100,60 _-VIEW _SEISO _ZOOM _E _ZOOM 0.7X\n"
$A com eval '(defun mpx (p / c s h d) (setq c (trans (getvar "VIEWCTR") 1 2) s (getvar "SCREENSIZE") h (getvar "VIEWSIZE") d (trans p 0 2)) (list (fix (+ 2560 (/ (car s) 2.0) (* (- (car d) (car c)) (/ (cadr s) h)))) (fix (+ 182 (- (/ (cadr s) 2.0) (* (- (cadr d) (cadr c)) (/ (cadr s) h)))))))'
$A com eval '(defun bb (/ a b) (vl-load-com) (vla-getboundingbox (vlax-ename->vla-object (entlast)) (quote a) (quote b)) (list (vlax-safearray->list a) (vlax-safearray->list b)))'
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.5; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 1; }
box_at() { # a BOX from 200,0,0 to 300,100 (its height's base 300,100,0), the height clicked at a pixel
  $A key esc esc >/dev/null; sleep 1
  $A type "_BOX\n" >/dev/null; sleep 0.8; $A type "200,0,0\n" >/dev/null; sleep 0.8
  $A type "#300,100\n" >/dev/null; sleep 0.8
  hover "$1" "$2"; $A shot -hwnd -1 -crop 3500,350,1100,800
  $A click $(($1 + 1)) "$2" left >/dev/null; sleep 1.5; $A com eval '(bb)'
}
# 300,100,0 is pixel 4214,898 (VIEWSIZE 375.158: 0.3187 units a pixel).
# d11 100 px straight up: Z 0 to 39.4598, the cursor read along the Z through the corner (on the
# work plane it would be 55 away)
box_at 4214 798
# d12 100 px straight down: Z -38.6155 to 0, the box downwards; the box shows 38.6155
box_at 4214 998
# d13 Endpoint on the first box's top corner, 100,100,50 (pixel 3771,514): Z 0 to 50, its Z alone
# (the distance is 206.2)
box_at 3771 514
# d14 in plan (-VIEW _TOP, ZOOM E, ZOOM 0.7X; 300,100,0 at 4196,360, 0.2684 a pixel): 100 px right,
# 27.0693; 100 px left, the box shows 26.6317; Endpoint on a line's end at 250,-100,50 (4010,1105):
# 212.132, the distance (console solid/z03)
$A com send "_LINE 200,-100,50 250,-100,50 \n_-VIEW _TOP _ZOOM _E _ZOOM 0.7X\n"
box_at 4296 360
box_at 4096 360
box_at 4010 1105
$A com close
