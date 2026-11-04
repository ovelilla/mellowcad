#!/usr/bin/env bash
# d05 (SED): SLICE and SECTION on the desktop (es-ES; lib.sh's box; a CIRCLE 5,5,5 r3 for planar
# Object, at 1381,738). LASTPOINT set to 7,7,7 before each case, read after its Escape.
# Seen: a) the box clicked at Command:, then MOVE `1 encontrados`; SLICE `Designe objetos para
# cortar:` and SECTION `Designe objetos:` (SLC-03's preselection dropped); b) a click at the start
# point is the two-point plane: a dashed amber band from it at the second; at the side prompt no
# preview; a side point on the plane `El punto no puede estar situado en el plano cortante.`, asked
# again, LASTPOINT that point (0,0,10); after two clicks and Escape at the side: the second;
# c) 3points: a band from the first at the second and at the third, LASTPOINT the first after
# Escape at the third; Zaxis: a band from the plane point; d) planar Object: the circle under the
# cursor lit, the box lit over its edge; Surface: the box lit, the circle lit.
source "$(dirname "$0")/lib.sh"
C=900,380,800,760
lp() { $A com eval '(getvar "LASTPOINT")'; }
st() { esc; $A com eval '(setvar "LASTPOINT" (list 7 7 7))' >/dev/null; timeout 40 $A com send "$1" >/dev/null 2>&1 & sleep 4; }
ck() { hover $(($1-6)) $(($2+4)); hover "$1" "$2"; sleep 1.2; $A click "$1" "$2" left >/dev/null; sleep 1.5; }
defs; box
for c in _MOVE _SLICE _SECTION; do $A click 400 900 left >/dev/null; esc; ck 1379 693; hover 400 900; typ "$c\n"; sleep 2; esc; $A com hist 6; done
S="_SLICE (handent \"$BOXH\")  "
st "$S"; ck 1210 1079; hover 1450 900; shot d05-b1-s3-band $C; esc; lp
st "$S"; ck 1210 1079; ck 1548 973; hover 1310 600; shot d05-b2-third $C; esc; lp
st "$S"; ck 1210 1079; ck 1548 973; ck 1210 746; esc; lp; $A com hist 12
st "$S "; ck 1210 1079; hover 1450 900; shot d05-c1-3p-second $C; ck 1548 973; hover 1310 600; shot d05-c2-3p-third $C; esc; lp
st "${S}_Z "; ck 1210 1079; hover 1310 600; shot d05-c3-zaxis-second $C; esc; lp
$A com send "_CIRCLE 5,5,5 3\n" >/dev/null
st "${S}_O "; hover 1381 738; shot d05-d1-object-hover-circle $C; hover 1379 693; shot d05-d2-object-hover-box $C; esc
st "${S}_S "; hover 1379 693; shot d05-d3-surface-hover-box $C; hover 1381 738; shot d05-d4-surface-hover-circle $C; esc
