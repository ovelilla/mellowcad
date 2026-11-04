#!/usr/bin/env bash
# d06 (SED): LASTPOINT after a click at an object's pick (es-ES; lib.sh's box and d05's circle):
# set to 7,7,7, the command started through COM, one click, Escape, read.
# Seen: the cursor's point on the work plane, Z 0, under the pick: FILLETEDGE's and CHAMFEREDGE's
# edge at 1379,693 (5,0,10) and SOLIDEDIT's face pick there: (13.1528 13.8095 0.0); SOLIDEDIT's
# face at 1172,589: (11.1494 20.7952 0.0); SLICE's planar Object on the circle at 1381,738:
# (12.0971 11.9228 0.0).
source "$(dirname "$0")/lib.sh"
lp() { $A com eval '(getvar "LASTPOINT")'; }
st() { esc; $A com eval '(setvar "LASTPOINT" (list 7 7 7))' >/dev/null; timeout 40 $A com send "$1" >/dev/null 2>&1 & sleep 4; }
ck() { hover $(($1-6)) $(($2+4)); hover "$1" "$2"; sleep 1.2; $A click "$1" "$2" left >/dev/null; sleep 1.5; }
defs; box; $A com send "_CIRCLE 5,5,5 3\n" >/dev/null
st "_FILLETEDGE "; ck 1379 693; esc; lp
st "_CHAMFEREDGE "; ck 1379 693; esc; lp
st "_SOLIDEDIT _F _M "; ck 1172 589; esc; lp
st "_SOLIDEDIT _F _M "; ck 1379 693; esc; lp
st "_SLICE (handent \"$BOXH\")  _O "; ck 1381 738; esc; lp
