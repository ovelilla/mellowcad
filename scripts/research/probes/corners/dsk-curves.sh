#!/usr/bin/env bash
# FILLET of a spline and an elliptical arc on the desktop (the owner's AutoCAD, Spanish profile,
# 2026-10-31): `dsk-curves.sh setup d14 d15 d16`. It clicks and types on the owner's screen: ask
# first, and tell them when it is over. Needs a drawing of its own (acad.sh com new). FILLETRAD is
# the new drawing's own. Screenshots: research/probes/corners/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
# A spline through 10,10 35,25 60,10 85,25 and a line x=47.5 crossing it at 47.5,17.5 (corners/p389
# at half size, moved by 10,10); an elliptical arc, centre 25,40, 15 by 6, 0–180, and a line x=35
# crossing it at 35,44.47.
setup() {
  $A com send "_ZOOM _C 50,25 100\n"
  $A com send "_SPLINE 10,10 35,25 60,10 85,25 \n"; $A com send "_LINE 47.5,0 47.5,40 \n"
  $A com send "_ELLIPSE _A _C 25,40 40,40 6 0 180\n"; $A com send "_LINE 35,30 35,49 \n"
}
focus() { mv 5 48; at 5 48; ty '\e'; ty '\e'; }
case_d14() { # the first prompt's rollover on the spline and on the elliptical arc
  focus; ty '_FILLET\n'; sleep 1; ty '_R\n'; ty '3\n'; sleep 0.5
  mv 60 10.3; mv 60 10; scr 50 20 d14-1; mv 25 46.3; mv 25 46; scr 30 40 d14-2; ty '\e'
}
case_d15() { # the spline picked right of the crossing, the cursor on the line above (the arc the
  # long way round, p389) and below it
  focus; ty '_FILLET\n'; sleep 1; at 60 10; mv 47.5 35.3; mv 47.6 35; scr 50 20 d15-1
  mv 47.5 5.3; mv 47.6 5; scr 50 20 d15-2; ty '\e'; ty '\e'
}
case_d16() { # the elliptical arc picked left of the crossing, the cursor on the line above and below
  focus; ty '_FILLET\n'; sleep 1; at 25 46; mv 35 47.8; mv 35.1 47.5; scr 30 40 d16-1
  mv 35 32.3; mv 35.1 32; scr 30 40 d16-2; ty '\e'; ty '\e'
}
for id in "$@"; do
  if [[ $id == setup ]]; then setup; else "case_$id"; fi
done
