#!/usr/bin/env bash
# The desktop pass of spline-edits (2026-10-31): what TRIM, EXTEND and BREAK draw over a spline
# under the cursor, in the owner's AutoCAD 2027, Spanish profile. It moves the real mouse (asked
# first). Run in a drawing `com new` made, with the k01 fit spline and its line at x = 15, the k10
# CV spline 40 lower and its line at x = 50, and the view `_ZOOM _W -20,-60 70,40`. VIEW is the
# drawing area's hwnd and X0,Y0 its screen origin (`acad.sh children`); PX the pixels a unit takes
# (its height over VIEWSIZE, 100).
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
VIEW=${VIEW:?the view hwnd}; X0=${X0:?}; Y0=${Y0:?}; W=${W:?view width}; H=${H:?view height}; PX=${PX:?}
# World X,Y to the screen, the view's centre at VIEWCTR 25,-10.
at() { awk -v x="$1" -v y="$2" -v x0="$X0" -v y0="$Y0" -v w="$W" -v h="$H" -v px="$PX" \
  'BEGIN { printf "%d %d", x0 + w / 2 + (x - 25) * px, y0 + h / 2 - (y + 10) * px }'; }
shot() { sleep 1.5; cp "$($A shot "$VIEW" | tail -1)" "research/probes/spline-knots/$1.png"; }
# Focus in the drawing area: a click on nothing starts a window, which Escape drops.
$A click $(at 60 30) left; $A type '\e\e'
# d05 TRIM over the fit spline's end piece past the line: the piece it takes away
$A com send "_TRIM "; $A click $(at 30 10) none; shot d05; $A type '\e\e'
# d06 EXTEND over the CV spline's end, the line at x = 50 ahead: the growth
$A com send "_EXTEND "; $A click $(at 39.4 -30.45) none; shot d06; $A type '\e\e'
# d07 BREAK's rollover at Select object, over the fit spline at its fit point 10,10
$A com send "_BREAK "; $A click $(at 10 10) none; shot d07
# d08 the pick there its first point; the cursor at 20,0, its fit point: the ghost of the break
$A click $(at 10 10) left; $A click $(at 20 0) none; shot d08; $A type '\e\e'
