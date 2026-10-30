#!/usr/bin/env bash
# The desktop pass of spline-knots (2026-10-30): the Properties palette of the pieces TRIM, BREAK
# and SPLINEDIT leave, in the owner's AutoCAD 2027, Spanish profile, through COM only (no mouse).
# Each shot is the palette's window (`acad.sh wins` names its hwnd); a point typed at TRIM's or
# BREAK's pick selects as a click does. A space ends a prompt; a trailing \n would repeat the
# command.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
P=${PALETTE:?the Properties palette hwnd, from acad.sh wins}
pick() { $A com eval "(sssetfirst nil (ssadd (handent \"$1\")))"; sleep 1; cp "$($A shot "$P" | tail -1)" "research/probes/spline-knots/$2.png"; }
$A com new; $A com send "_ZOOM _W -20,-20 60,40\n"; $A com send "_PROPERTIES\n"
# d01 a fit spline trimmed (k01): Method CV, 5 control points, Weight -1, Closed / Periodic No
$A com send "_SPLINE _M _FIT 0,0 10,10 20,0 30,10  "; $A com send "_LINE 15,-10 15,20  "
$A com send "_TRIM 30,10  "; pick 7F d01
# d02 a fit spline broken (k05): each piece Fit, its fit points, Knot parameterization Custom
# (Personalizado), its start and end tangents the derivatives there (0.7071,1.1785 / 0.7071,-0.8676)
$A com send "_SPLINE _M _FIT 0,0 10,10 20,0 30,10  "; $A com send "_BREAK 0,0 _F 12,6 22,3 "
pick 81 d02-1; pick 82 d02-2
# d03 a CV spline whose first vertex SPLINEDIT weighs 3 (k11): Weight 3, flag 70 12 (rational)
$A com eval '(sssetfirst nil nil)'
$A com send "_SPLINE _M _CV 40,0 45,15 60,-5 80,10  "; $A com send "_SPLINEDIT 40,0 _E _W 3 _X _X _X "
pick 85 d03
# d04 a closed CV spline (4 control points, Periodic Yes, Area) and the piece TRIM leaves of it
# (k04: 6 control points, Closed and Periodic No, no Area)
$A com eval '(sssetfirst nil nil)'; $A com send "_SPLINE _M _CV 30,30 50,30 50,50 30,50 _C "
pick 86 d04-1; $A com eval '(sssetfirst nil nil)'
$A com send "_LINE 40,20 40,60  "; $A com send "_TRIM 46.66666667,33.33333333  "; pick 86 d04-2
$A com eval '(sssetfirst nil nil)'; $A com send "_PROPERTIESCLOSE\n"; $A com close
