#!/usr/bin/env bash
# The Arrays review's desktop session (ARRAYRECT, ARRAYPOLAR, ARRAYPATH; the owner's AutoCAD,
# Spanish profile, 2026-10-22): `dsk.sh <id>…` runs those steps in order. It clicks and types on
# the owner's screen: ask first, and tell them when it is over. Needs a drawing of the review's
# own (acad.sh com new), MellowProbe loaded for `com hist` (acad.sh com netload) and the command
# line shown (_COMMANDLINE). Settings read before, put back after: DYNMODE -1, AUTOSNAP 55,
# ORTHOMODE 0, CLISTATE 0 (_COMMANDLINEHIDE), OSMODE 4133, GRIPS 2, GRIPMULTIFUNCTIONAL 3,
# ARRAYASSOCIATIVITY 1, SELECTIONPREVIEW 3 — none is changed here. Keywords typed in their global
# form. Screenshots: research/probes/arrays/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
# The figure: a circle R at -40,0 r 3 (ARRAYRECT's source); a square polyline P 20,40–26,46
# (ARRAYPOLAR's, centre 23,25); a line L 60,0 → 150,0 and a circle Q at 62,5 r 2 (ARRAYPATH's).
setup() {
  $A com send "_ZOOM _C 50,25 100\n"
  $A com send "_CIRCLE -40,0 3\n"
  $A com send "_PLINE 20,40 26,40 26,46 20,46 _C\n"
  $A com send "_LINE 60,0 150,0 \n"; $A com send "_CIRCLE 62,5 2\n"
}
focus() { mv 0 60; at 0 60; ty '\e'; ty '\e'; }
case_d01() { # ARRAYRECT: the preview and its grips at the main prompt; a grip hovered
  focus; ty '_ARRAYRECT\n'; sleep 1; at -37 0; ty '\n'; sleep 1; mv -20 30; sleep 0.5
  scr -25 10 d01-1 1400 800; cl d01-cl1
}
case_d02() { # ARRAYPOLAR: the centre prompt's ghost under the cursor, then the main prompt
  focus; ty '_ARRAYPOLAR\n'; sleep 1; at 26 43; ty '\n'; sleep 1; mv 23 22; mv 23 25; sleep 0.5
  scr 23 30 d02-1 1000 900; cl d02-cl1
  at 23 25; sleep 1; mv 60 60; sleep 0.5; scr 23 30 d02-2 1000 900; cl d02-cl2
}
case_d03() { # ARRAYPATH: the path pick's rollover, then the main prompt
  focus; ty '_ARRAYPATH\n'; sleep 1; at 64 5; ty '\n'; sleep 1; mv 100 0.3; mv 100 0.1; sleep 0.5
  scr 100 5 d03-1 1400 500; cl d03-cl1
  at 100 0.1; sleep 1; mv 100 40; sleep 0.5; scr 100 8 d03-2 1400 500; cl d03-cl2
}
case_d01b() { # ARRAYRECT still at its main prompt: each grip of the preview hovered
  hov -13 0 d01b-1; hov -31 0 d01b-2; hov -40 9 d01b-3; hov -40 18 d01b-4; hov -13 18 d01b-5
  hov -40 0 d01b-6
}
case_d01c() { # ARRAYRECT's main prompt: the column-count grip clicked and dragged, then Enter
  at -13 0; sleep 1; mv -2 0.3; mv -2 0; sleep 1; scr -15 10 d01c-1 1400 800; cl d01c-cl1
  at -2 0; sleep 1; mv 0 50; sleep 0.5; scr -15 10 d01c-2 1400 800; cl d01c-cl2
  ty '\n'; sleep 1; cl d01c-cl3
}
# grip menu: select the array by a pick at (sx,sy), hover (gx,gy), capture, Escape twice.
gm() { at "$1" "$2"; sleep 1; hov "$3" "$4" "$5" 1000 700; ty '\e'; ty '\e'; }
case_d04() { # the rectangular array at Command: its grips, then each grip's hover menu
  focus; at -28 9; sleep 1; mv -20 35; sleep 0.5; scr -22 10 d04-1 1300 700; ty '\e'
  gm -28 9 -40 0 d04-2; gm -28 9 -31 0 d04-3; gm -28 9 -4 0 d04-4; gm -28 9 -40 9 d04-5
  gm -28 9 -40 18 d04-6; gm -28 9 -4 18 d04-7
}
case_d05() { # the polar array at Command: its grips, then each grip's hover menu
  focus; at 23 46; sleep 1; mv 60 60; sleep 0.5; scr 23 28 d05-1 1000 800; ty '\e'
  gm 23 46 23 43 d05-2; gm 23 46 23 25 d05-3; gm 23 46 7.412 34 d05-4
}
case_d06() { # the path array at Command: its grips, then each grip's hover menu
  focus; at 64 5; sleep 1; mv 100 40; sleep 0.5; scr 105 5 d06-1 1400 500; ty '\e'
  gm 64 5 60 0 d06-2; gm 64 5 66 0 d06-3
}
case_d07() { # the Properties palette of each array: rectangular, polar, path
  focus; at -28 9; sleep 1; ty '_PROPERTIES\n'; sleep 2; full d07-1; ty '\e'; ty '\e'
  at 23 46; sleep 1.5; full d07-2; ty '\e'; ty '\e'
  at 64 5; sleep 1.5; full d07-3; ty '\e'; ty '\e'
}
CNT='(progn (setq n 0 c 0 ss (ssget "_X")) (repeat (sslength ss) (if (= (cdr (assoc 0 (entget (ssname ss n)))) "INSERT") (setq c (1+ c))) (setq n (1+ n))) (list n c))'
case_d08() { # Escape at ARRAYRECT's main prompt: is the array kept? (objects, inserts before/after)
  $A com send "_PROPERTIESCLOSE\n"; sleep 1
  $A com send "_CIRCLE -40,-15 2\n"; $A com eval "$CNT"
  focus; ty '_ARRAYRECT\n'; sleep 1; at -38 -15; ty '\n'; sleep 1; mv -20 30; ty '\e'; sleep 1
  $A com eval "$CNT"; cl d08-cl1
}
case_d08b() { # Escape at the main prompt after ASsociative No: copies kept or none?
  $A com send "_CIRCLE -45,60 2\n"; $A com eval "$CNT"
  focus; ty '_ARRAYRECT\n'; sleep 1; at -43 60; ty '\n'; sleep 1; cl d08b-cl0; ty '_AS\n'; ty '_N\n'; mv -20 30; ty '\e'
  sleep 1; $A com eval "$CNT"; cl d08b-cl1
}
case_d08c() { # Escape at ARRAYPOLAR's and ARRAYPATH's main prompts (default, associative)
  $A com send "_CIRCLE -30,60 1\n"; $A com send "_CIRCLE -15,60 1\n"; $A com eval "$CNT"
  focus; ty '_ARRAYPOLAR\n'; sleep 1; at -29 60; ty '\n'; sleep 1; ty '-30,66\n'; sleep 1; ty '\e'
  sleep 1; $A com eval "$CNT"
  focus; ty '_ARRAYPATH\n'; sleep 1; at -14 60; ty '\n'; sleep 1; at 130 0.1; sleep 1; ty '\e'
  sleep 1; $A com eval "$CNT"; cl d08c-cl1
}
case_d09() { # the right button at ARRAYRECT's main prompt: the shortcut menu
  $A com send "_CIRCLE -45,68 2\n"
  focus; ty '_ARRAYRECT\n'; sleep 1; at -43 68; ty '\n'; sleep 1; mv -10 45; sleep 0.5; at -10 45 right
  sleep 1; scr -10 45 d09-1 1000 900; ty '\e'; sleep 1; cl d09-cl1
}
case_d10() { # the rollover at Command: over an item of the rectangular array
  focus; mv -31.3 9; mv -28 9; sleep 1; scr -22 10 d10-1 1300 700
}
for id in "$@"; do if [[ $id == setup ]]; then setup; else "case_$id"; fi; done
