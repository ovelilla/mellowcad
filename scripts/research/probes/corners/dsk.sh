#!/usr/bin/env bash
# The Corners review's desktop session (FILLET, CHAMFER; the owner's AutoCAD, Spanish profile,
# 2026-10-22): `dsk.sh <id>…` runs those steps in order. It clicks and types on the owner's
# screen: ask first, and tell them when it is over. Needs a drawing of the review's own
# (acad.sh com new), MellowProbe loaded for `com hist` (acad.sh com netload) and the command line
# shown (_COMMANDLINE). Settings read before, put back after: FILLETRAD, CHAMFERA, CHAMFERB (the
# review's drawing only), DYNMODE -1 (d10 sets 3, put back with Lisp), AUTOSNAP 55 (Polar by
# setvar 63, never F10), CLISTATE 0 (_COMMANDLINEHIDE, its task dialog answered Sí). Shift is held
# across a hover with trim's shift.ps1, only while no console probe runs (a held key reaches them).
# Screenshots: research/probes/corners/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
# Keywords typed in their global form (_R, _D, _M, _P): Spanish R is Recortar (Trim), Radius RA.
# The figure: H 10,10 → 70,10 and V 50,0 → 50,45 crossing at 50,10; a polyline P with a corner and
# an arc segment; an ellipse E and a line on a locked layer.
setup() {
  $A com send "_ZOOM _C 50,25 100\n"
  $A com send "_LINE 10,10 70,10 \n"; $A com send "_LINE 50,0 50,45 \n"
  $A com send "_PLINE 75,5 95,5 95,25 _A 85,35 _L 75,35 \n"
  $A com send "_ELLIPSE 20,35 30,35 4\n"
  # -LAYER's name list takes spaces: each answer on a line of its own.
  $A com send "_LINE 15,45 35,45 \n"; $A com send "_-LAYER\n_N\nBLQ\n_LO\nBLQ\n\n"
  $A com send "_CHPROP\n_L\n\n_LA\nBLQ\n\n"
}
focus() { mv 5 48; at 5 48; ty '\e'; ty '\e'; }
case_d01() { # FILLET's ghost, radius 8, with the first line picked and the cursor over the second
  focus; ty '_FILLET\n'; sleep 1; ty '_R\n'; ty '8\n'; sleep 0.5
  mv 20 10.3; mv 20 10.1; scr 40 20 d01-1; cl 200 d01-cl1
  at 20 10.1; mv 50 35.3; mv 50.1 35; scr 40 20 d01-2
  mv 50.1 4; mv 50.1 4.2; scr 40 20 d01-3
  mv 60 30; mv 60.2 30; scr 40 20 d01-4; cl 200 d01-cl2; ty '\e'; ty '\e'
}
case_d02() { # Shift held over the second line: the corner as radius 0 makes it
  focus; ty '_FILLET\n'; sleep 1; at 20 10.1; mv 50 35.3
  sh down; mv 50.1 35.2; mv 50.1 35; scr 40 20 d02-1; sh up; ty '\e'; ty '\e'
}
case_d03() { # CHAMFER's ghost, distances 8 and 5, then Shift
  focus; ty '_CHAMFER\n'; sleep 1; ty '_D\n'; ty '8\n'; ty '5\n'; sleep 0.5
  at 20 10.1; mv 50 35.3; mv 50.1 35; scr 40 20 d03-1; cl 200 d03-cl1
  sh down; mv 50.1 35.2; mv 50.1 35; scr 40 20 d03-2; sh up; ty '\e'; ty '\e'
}
case_d04() { # the first prompt's rollover on a line, on a polyline's segment, on the ellipse and
  # on the locked line; the pickbox
  focus; ty '_FILLET\n'; sleep 1
  mv 30 10.3; mv 30 10.1; scr 40 20 d04-1; mv 95 15.3; mv 95.1 15; scr 80 20 d04-2
  mv 30 35.3; mv 30.1 35; scr 25 35 d04-3; mv 25 45.3; mv 25 45.1; scr 25 35 d04-4
  ty '\e'
}
case_d05() { # Polyline's prompt: the rollover on the polyline and on a line
  focus; ty '_FILLET\n'; sleep 1; ty '_P\n'; sleep 0.5
  mv 95 15.3; mv 95.1 15; scr 80 20 d05-1; cl 200 d05-cl1; mv 30 10.3; mv 30 10.1; scr 40 20 d05-2
  ty '\e'
}
case_d06() { # a line then a polyline's segment: the join's ghost
  # d06-1 the polyline's bottom is parallel to the line: the circle-and-slash and the refusal's
  # words in the tooltip; d06-2 its upright segment, which the line meets
  focus; ty '_FILLET\n'; sleep 1; at 30 10.1; mv 85 5.3; mv 85 5.1; scr 70 15 d06-1
  mv 95 15.3; mv 95.1 15; scr 70 15 d06-2; ty '\e'; ty '\e'
}
case_d07() { # the right button at the first and the second prompt
  focus; ty '_FILLET\n'; sleep 1; at 60 40 right; scr 70 30 d07-1; ty '\e'; ty '\e'
  ty '_FILLET\n'; sleep 1; at 20 10.1; at 60 40 right; scr 70 30 d07-2; ty '\e'; ty '\e'; ty '\e'
}
case_d08() { # Multiple: two fillets, then Escape keeps both; one U takes back the run
  $A com close; $A com new; $A com send "_ZOOM _C 50,25 100\n"
  $A com send "_LINE 10,10 40,10 \n"; $A com send "_LINE 30,0 30,30 \n"
  $A com send "_LINE 60,10 90,10 \n"; $A com send "_LINE 80,0 80,30 \n"
  focus; ty '_FILLET\n'; sleep 1; ty '_M\n'; ty '_R\n'; ty '4\n'
  at 15 10.1; at 30.1 25; at 65 10.1; at 80.1 25; scr 50 15 d08-1; ty '\e'
  $A com eval '(sslength (ssget "_X"))'; $A com send "_U\n"; $A com hist 8
  $A com eval '(sslength (ssget "_X"))'
}
case_d09() { # dynamic input at the first prompt and at Radius's (DYNMODE 3, put back -1)
  $A com eval '(setvar "DYNMODE" 3)'; focus; ty '_FILLET\n'; sleep 1; mv 30 30.3; mv 30 30
  scr 35 25 d09-1; ty '_R\n'; sleep 0.5; mv 31 30; mv 31 30.2; scr 35 25 d09-2
  ty '\e'; ty '\e'; $A com eval '(setvar "DYNMODE" -1)'; $A com eval '(getvar "DYNMODE")'
}
case_d10() { # Radius's prompt by two points: the rubber band from the first, then Polar
  focus; ty '_FILLET\n'; sleep 1; ty '_R\n'; at 20 30; mv 35 33; mv 35 33.2; scr 30 30 d10-1
  ty '\e'; ty '\e'; $A com eval '(setvar "AUTOSNAP" 63)'
  ty '_FILLET\n'; sleep 1; ty '_R\n'; at 20 30; mv 35 30.6; mv 35 30.5; scr 30 30 d10-2
  ty '\e'; ty '\e'; $A com eval '(setvar "AUTOSNAP" 55)'
}
case_d11() { # Escape after the first pick, and after a Multiple fillet: what stays selected
  $A com close; $A com new; $A com send "_ZOOM _C 50,25 100\n"
  $A com send "_LINE 10,10 40,10 \n"; $A com send "_LINE 30,0 30,30 \n"
  focus; ty '_FILLET\n'; sleep 1; at 15 10.1; scr 30 15 d11-1; ty '\e'; scr 30 15 d11-2
  $A com eval '(if (ssget "_I") (sslength (ssget "_I")) 0)'
  ty '_FILLET\n'; sleep 1; ty '_M\n'; at 15 10.1; at 30.1 25; at 15 10.1; ty '\e'; ty '\e'
  $A com eval '(if (ssget "_I") (sslength (ssget "_I")) 0)'; $A com hist 12
}
case_d12() { # Ctrl+Z at FILLET's first prompt in Multiple, after a fillet
  $A com send "_U\n"; focus; ty '_FILLET\n'; sleep 1; ty '_M\n'; at 15 10.1; at 30.1 25
  $A key ctrl+z; sleep 1; cl 200 d12-cl1; ty '\e'; ty '\e'; $A com hist 10
}
case_d13() { # dynamic input's fields at Radius's and Distance's prompts (DYNMODE 3, put back -1)
  $A com eval '(setvar "DYNMODE" 3)'; focus; ty '_FILLET\n'; sleep 1; ty '_R\n'; sleep 0.5
  mv 60 40; mv 60.2 40; scr 60 35 d13-1; ty '\e'; ty '\e'
  ty '_CHAMFER\n'; sleep 1; ty '_D\n'; sleep 0.5; mv 60 40; mv 60.2 40; scr 60 35 d13-2
  ty '7\n'; sleep 0.5; mv 60 40; mv 60.2 40.2; scr 60 35 d13-3; ty '\e'; ty '\e'
  $A com eval '(setvar "DYNMODE" -1)'; $A com eval '(getvar "DYNMODE")'
}
for id in "$@"; do
  if [[ $id == setup ]]; then setup; else "case_$id"; fi
done
