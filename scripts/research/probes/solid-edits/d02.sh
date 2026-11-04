#!/usr/bin/env bash
# d02 (SED): SOLIDEDIT's clicks and rubber bands (es-ES; lib.sh's box). The command is started
# through COM in the background (keys typed right after a typed command were lost) and its clicks
# wait for two moves: the first click after the start was lost twice.
# Seen: a) the top face clicked twice: `1 cara encontrada.` twice, the top then the back (SOE-05);
# c) a click on the top front edge: `2 cara(s) encontrada(s).` (SOE-04); b) at `Designe caras` a
# pickbox and no crosshair, nothing lit inside a face, the whole solid's rollover over an edge;
# the faces taken glow blue; d) Move's second point: a dashed amber band from the base, no ghost;
# e) a click at Rotate's axis point is its first point; a band from it at the second, from the
# second at the angle; f) Taper: a band from the base point at the axis' other point, none at
# the angle; g) Escape at `<Salir>` after a Move keeps it (1200), U `EDITSOLIDO` (1000); h) Escape
# at `Designe caras` with a face taken, then U: `EDITSOLIDO`.
source "$(dirname "$0")/lib.sh"
C=900,380,800,760
run() { esc; timeout 40 $A com send "$1" >/dev/null 2>&1 & sleep 4; }
ck() { hover $(($1-6)) $(($2+4)); hover "$1" "$2"; sleep 1.2; $A click "$1" "$2" left >/dev/null; sleep 1.5; }
defs; box
run "_SOLIDEDIT _F _M "; ck 1172 589; ck 1172 589; esc; $A com hist 8
run "_SOLIDEDIT _F _M "; hover 1300 650; hover 1379 694; shot d02-c2-hover-edge-full $C; ck 1379 694; esc; $A com hist 6
run "_SOLIDEDIT _F _M "; hover 1150 580; hover 1172 589; sleep 1.5; shot d02-d0-hover-face $C; ck 1172 589
typ "\n"; ck 1210 746; hover 1000 500; hover 1010 480; shot d02-d1-move-second $C; esc
run "_SOLIDEDIT _F _R "; ck 1172 589; typ "\n"; ck 1210 746; hover 1500 600; hover 1510 590; shot d02-e1-rotate-a2 $C
ck 1548 640; hover 1300 500; hover 1310 490; shot d02-e2-rotate-angle $C; esc
run "_SOLIDEDIT _F _T "; ck 1172 589; typ "\n"; ck 1210 746; hover 1200 950; hover 1210 960; shot d02-f1-taper-ta $C
ck 1210 1079; hover 1300 900; hover 1310 890; shot d02-f2-taper-angle $C; esc
esc; timeout 25 $A com send "_SOLIDEDIT _F _M 3,7,10  0,0,0 0,0,2 " >/dev/null 2>&1; esc
$A com eval "(vla-get-volume (vlax-ename->vla-object (handent \"$BOXH\")))"; $A com send "_U\n" >/dev/null; $A com hist 12
esc; timeout 25 $A com send "_SOLIDEDIT _F _M 3,7,10 " >/dev/null 2>&1; esc; $A com send "_U\n" >/dev/null; $A com hist 8
