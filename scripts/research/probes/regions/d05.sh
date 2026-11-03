#!/usr/bin/env bash
# d05: a) BSL-03's composite (p348: BOX 0,0,0 10,10 10, CYLINDER 0,5,13 r 3 axis to 10,5,13,
# UNION) in 2D Wireframe, SE Isometric (-VPOINT 1,-1,1, ZOOM E 0.8x): d05-1; is the contact line
# drawn? b) -HATCH ANSI31 1 0 of a region (circle 20,26 r 10) chosen by Select objects, in plan
# (ZOOM C 50,0 120): d05-2.
source "$(dirname "$0")/lib.sh"
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_BOX 0,0,0 10,10 10\n" >/dev/null; $A com send "_CYLINDER 0,5,13 3 _A 10,5,13\n" >/dev/null
$A com send "_UNION _ALL \n" >/dev/null
$A com send "_-VPOINT 1,-1,1\n" >/dev/null; $A com send "_ZOOM _E\n" >/dev/null; $A com send "_ZOOM 0.8x\n" >/dev/null
$A click 3839 868 none >/dev/null; sleep 1; shot d05-1 2560,182,2560,1177
$A com send "_ERASE _ALL \n" >/dev/null; $A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 50,0 120\n" >/dev/null
$A com send "_CIRCLE 20,26 10\n" >/dev/null; $A com send "_REGION _L \n" >/dev/null
$A com send "_-HATCH _P ANSI31\n1\n0\n_S _L \n\n" >/dev/null
$A com eval '(list (cdr (assoc 0 (entget (entlast)))) (cdr (assoc 91 (entget (entlast)))))'
$A click 3839 868 none >/dev/null; sleep 1; shot d05-2 3250,300,1100,500
