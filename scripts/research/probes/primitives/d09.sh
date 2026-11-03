#!/usr/bin/env bash
# d09: the hover and the running snap markers on a solid, SE Isometric (en-US, DYNMODE 0 typed,
# OSMODE 4133 and AUTOSNAP 55, the profile's). A BOX 0,0,0 100,100 50 and a CYLINDER 200,0,0 r 30
# h 60, ZOOM C 100,50,25 260: 100,0,50 at 3477,770, 50,0,50 at 3317,678, 230,0,60 at 3894,973.
# Seen: the rollover thickens the solid's edges with a 3D Solid tooltip; Endpoint's and Center's
# markers and tooltips, Center at the top's centre from its rim.
source "$(dirname "$0")/lib.sh"
dwell() { hover "$1" "$2"; sleep 1.5; shot "$3" 3150,450,900,700; }
esc; $A click 3200 1100 left >/dev/null; esc
dwell 3357 701 d09-rollover
typ "_LINE\n"
dwell 3480 772 d09-end
dwell 3319 680 d09-mid
dwell 3894 975 d09-cyl-rim
dwell 3700 900 d09-cyl-iso
esc
