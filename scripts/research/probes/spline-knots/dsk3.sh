#!/usr/bin/env bash
# The desktop pass of OFFSET of an ellipse and a spline (2026-10-31): the owner's AutoCAD 2027,
# Spanish profile, a drawing of its own (acad.sh com new), view ZOOM C 50,25 100 on a 2560×1177
# drawing area at the screen's (2560,182): one drawing unit is 11.77 px. It moves the owner's
# mouse: ask first. Screenshots: research/probes/spline-knots/d09-*.png.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
O=research/probes/spline-knots
sx() { python3 -c "print(round(3840+($1-50)*11.77))"; }
sy() { python3 -c "print(round(770.5-($1-25)*11.77))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" 1 >/dev/null; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 >/dev/null; }
ty() { $A type "$1" >/dev/null; sleep 0.6; }
scr() { local o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - 500)),$(($(sy "$2") - 320)),1000,640" | tail -1); cp "$o" "$O/$3.png"; echo "$3"; }
$A com send "_ZOOM _C 50,25 100\n"
$A com send "_ELLIPSE _C 30,30 50,30 8\n"; $A com send "_CHPROP _L  _C 1 \n"
$A com send "_SPLINE 55,10 70,25 85,10 \n"
# d09-1 at `Designe objeto a desplazar o` the ellipse under the pick box rolls over with the plain
# glow; d09-2 picked, it turns selected and the copy 3 out drags as a curve in its colour (red);
# d09-3 the side inside, 3 in, past its curvature at the ends of its major axis (3.2): the copy's
# pieces, the loops cut out
mv 70 45; at 70 45; ty '\e'; ty '_OFFSET\n'; sleep 1; ty '3\n'; mv 50 30.5; mv 50 30.2; scr 50 25 d09-1
at 50 30.2; mv 52 34; mv 52.3 34.3; scr 50 25 d09-2; mv 30 31; mv 30.3 31.3; scr 50 25 d09-3
ty '\e'; ty '\e'
# d09-4 Through on the fit spline: rolled over, then the copy through the cursor
mv 70 45; at 70 45; ty '\e'; ty '_OFFSET\n'; sleep 1; ty 'A\n'; mv 70 25.5; mv 70 25; scr 60 25 d09-4
at 70 25; mv 70 30; mv 70.3 30.3; scr 60 25 d09-5; ty '\e'; ty '\e'
