#!/usr/bin/env bash
# The Pieces review's desktop session (BREAK, BREAKATPOINT, JOIN, EXPLODE; the owner's AutoCAD,
# Spanish profile, 2026-10-22): `dsk.sh <id>…` runs those steps in order. It clicks and types on
# the owner's screen: ask first, and tell them when it is over. Needs a drawing of the review's
# own (acad.sh com new), MellowProbe loaded for `com hist` (acad.sh com netload) and the command
# line shown (_COMMANDLINE). Settings read before, put back after: DYNMODE -1 (d10 sets 3, put
# back with Lisp), AUTOSNAP 55 (Polar by setvar 63, never F10), ORTHOMODE 0, CLISTATE 0
# (_COMMANDLINEHIDE, its task dialog answered Sí). Keywords typed in their global form (_F).
# Screenshots: research/probes/pieces/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
# The figure: a line H 10,10 → 70,10; a circle C at 95,25 r 8; a closed polyline P with an arc
# segment; a text; a line on a locked layer; a wide polyline W; a chain of two lines and a
# polyline J for JOIN.
setup() {
  $A com send "_ZOOM _C 50,25 100\n"
  $A com send "_LINE 10,10 70,10 \n"; $A com send "_CIRCLE 95,25 8\n"
  $A com send "_PLINE 115,5 140,5 140,20 _A 115,20 _L _C\n"
  $A com send "_-TEXT 20,25 4 0 ABC\n"
  $A com send "_PLINE 45,35 _W 1 1 60,35 60,50 \n"
  $A com send "_LINE 80,45 95,45 \n"; $A com send "_LINE 95,45 95,55 \n"
  $A com send "_PLINE 95,55 80,55 80,50 \n"
  # -LAYER's name list takes spaces: each answer on a line of its own.
  $A com send "_LINE 15,45 35,45 \n"; $A com send "_-LAYER\n_N\nBLQ\n_LO\nBLQ\n\n"
  $A com send "_CHPROP\n_L\n\n_LA\nBLQ\n\n"
}
focus() { mv 5 60; at 5 60; ty '\e'; ty '\e'; }
case_d01() { # BREAK on the line: the rollover, then the second point on and off the object
  focus; ty '_BREAK\n'; sleep 1; mv 25 10.3; mv 25 10.1; scr 40 20 d01-1; cl 200 d01-cl1
  at 25 10.1; mv 45 10.3; mv 45 10.1; scr 40 20 d01-2; cl 200 d01-cl2
  mv 45 18; mv 45.2 18; scr 40 20 d01-3; mv 80 10.2; mv 80 10; scr 40 20 d01-4
  ty '\e'; ty '\e'
}
case_d02() { # BREAK on the circle from 0°, the cursor at 90° and at 180°
  focus; ty '_BREAK\n'; sleep 1; at 103 25.1; mv 95.2 33; mv 95 33; scr 95 25 d02-1
  mv 87 25.2; mv 87 25; scr 95 25 d02-2; ty '\e'; ty '\e'
}
case_d03() { # BREAK on the closed polyline: bottom side, then the right side and the arc
  focus; ty '_BREAK\n'; sleep 1; at 125 5.1; mv 140.2 12; mv 140 12; scr 125 15 d03-1
  mv 127.5 32.7; mv 127.5 32.5; scr 125 15 d03-2; ty '\e'; ty '\e'
}
case_d04() { # BREAK's First point: what each of its two prompts shows
  focus; ty '_BREAK\n'; sleep 1; at 25 10.1; ty '_F\n'; sleep 0.5
  mv 30 10.3; mv 30 10.1; scr 40 20 d04-1; cl 200 d04-cl1; at 30 10.1
  mv 50 10.3; mv 50 10.1; scr 40 20 d04-2; cl 200 d04-cl2; ty '\e'; ty '\e'
}
case_d05() { # BREAKATPOINT on the line: its break point prompt
  focus; ty '_BREAKATPOINT\n'; sleep 1; mv 25 10.3; mv 25 10.1; scr 40 20 d05-1
  at 25 10.1; mv 40 10.3; mv 40 10.1; scr 40 20 d05-2; cl 200 d05-cl1; ty '\e'; ty '\e'
}
case_d06() { # BREAK over the locked line and the text: hovered, then picked
  focus; ty '_BREAK\n'; sleep 1; mv 25 45.3; mv 25 45.1; scr 30 35 d06-1
  mv 22 26.5; mv 22 26.3; scr 30 35 d06-2; at 25 45.1; sleep 0.5; at 22 26.3; sleep 0.5
  cl 200 d06-cl1; ty '\e'; ty '\e'
}
case_d07() { # JOIN: the source's rollover, the set, the result
  focus; ty '_JOIN\n'; sleep 1; mv 85 45.3; mv 85 45.1; scr 85 50 d07-1; cl 200 d07-cl1
  at 85 45.1; mv 95.2 50; mv 95.1 50; scr 85 50 d07-2; cl 200 d07-cl2
  at 95.1 50; at 87 55.1; scr 85 50 d07-3; ty '\n'; sleep 1; mv 70 65; scr 85 50 d07-4
  cl 200 d07-cl3
}
case_d08() { # EXPLODE the wide polyline: the rollover, the set, the result
  focus; ty '_EXPLODE\n'; sleep 1; mv 52 35.3; mv 52 35.1; scr 55 40 d08-1
  at 52 35.1; scr 55 40 d08-2; ty '\n'; sleep 1; mv 70 65; scr 55 40 d08-3; cl 200 d08-cl1
}
case_d09() { # the right button at Select object and at the second break point
  focus; ty '_BREAK\n'; sleep 1; at 40 30 right; sleep 0.5; scr 40 25 d09-1; ty '\e'; ty '\e'
  ty '_BREAK\n'; sleep 1; at 25 10.1; at 45 20 right; sleep 0.5; scr 40 20 d09-2
  ty '\e'; ty '\e'; ty '\e'
}
case_d10() { # dynamic input at each prompt (DYNMODE 3, put back -1)
  $A com eval '(setvar "DYNMODE" 3)'; focus; ty '_BREAK\n'; sleep 1; mv 30 20; mv 30 20.2
  scr 40 20 d10-1; at 25 10.1; mv 45 12; mv 45.2 12; scr 40 20 d10-2
  ty '_F\n'; sleep 0.5; mv 30 12; mv 30.2 12; scr 40 20 d10-3; ty '\e'; ty '\e'
  ty '_BREAKATPOINT\n'; sleep 1; at 25 10.1; mv 45 12; mv 45.2 12; scr 40 20 d10-4
  ty '\e'; ty '\e'; $A com eval '(setvar "DYNMODE" -1)'; $A com eval '(getvar "DYNMODE")'
}
case_d11() { # the second break point under Polar, then Ortho (put back AUTOSNAP 55, ORTHOMODE 0)
  $A com eval '(setvar "AUTOSNAP" 63)'; focus; ty '_BREAK\n'; sleep 1; at 25 10.1
  mv 45 10.8; mv 45 10.6; scr 40 20 d11-1; ty '\e'; ty '\e'; $A com eval '(setvar "AUTOSNAP" 55)'
  $A com eval '(setvar "ORTHOMODE" 1)'; ty '_BREAK\n'; sleep 1; at 25 10.1
  mv 45 18; mv 45.2 18; scr 40 20 d11-2; ty '\e'; ty '\e'; $A com eval '(setvar "ORTHOMODE" 0)'
  $A com eval '(list (getvar "AUTOSNAP") (getvar "ORTHOMODE"))'
}
case_d12() { # running object snaps at Select object and at the second point (OSMODE 4133)
  focus; ty '_BREAK\n'; sleep 1; mv 69.6 10.4; mv 69.7 10.3; scr 60 15 d12-1
  at 25 10.1; mv 69.6 10.4; mv 69.7 10.3; scr 60 15 d12-2; ty '\e'; ty '\e'
}
case_d13() { # where a click lands when an Endpoint marker shows far off (d04-1): First point at 30,
  # then the second at 50, the line read back, then U
  focus; ty '_BREAK\n'; sleep 1; at 25 10.1; ty '_F\n'; sleep 0.5; mv 30 10.3; mv 30 10.1
  scr 40 20 d13-1; at 30 10.1; mv 50 10.3; mv 50 10.1; at 50 10.1; sleep 0.5
  $A com eval '(progn (setq ss (ssget "_X" (list (cons 0 "LINE") (cons 8 "0"))) i 0 r nil) (repeat (sslength ss) (setq e (entget (ssname ss i)) r (cons (list (cdr (assoc 10 e)) (cdr (assoc 11 e))) r) i (1+ i))) r)'
  $A com send "_U\n"
}
case_d14() { # BREAKATPOINT's look with no snap marker: the cursor below the line, out of the aperture
  focus; ty '_BREAKATPOINT\n'; sleep 1; at 25 10.1; mv 45 8.5; mv 45.2 8.5; scr 40 20 d14-1
  ty '\e'; ty '\e'
}
case_d15() { # Enter at BREAK's second point and BREAKATPOINT's point, through COM alone (no mouse):
  # a new drawing with one line 0,0 → 100,0
  $A com send "_ZOOM _C 50,0 200\n"; $A com send "_LINE 0,0 100,0 \n"
  $A com send "_BREAK\n30,0\n\n60,0\n"; $A com send "_BREAKATPOINT\n80,0\n\n90,0\n"; $A com hist 14
}
for id in "$@"; do
  if [[ $id == setup ]]; then setup; else "case_$id"; fi
done
