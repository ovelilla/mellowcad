#!/usr/bin/env bash
# d04 (SED): FILLETEDGE and CHAMFEREDGE on the desktop (es-ES; lib.sh's box; FILLETRAD3D, CHAMFERA
# and CHAMFERB set to 1, 0, 0 before each case: the drawing is the probe's own). The arrow grip at
# 1365,704 (radius 1). The plane square to the edge 5,0,10 through its middle maps a pixel to
# (y, z) by lib.sh's mpx, solved backwards (the session's scratch fit).
# Seen: a) the edge under the pickbox glows, a cube badge beside it; b) an edge taken: blue, the
# solid hidden and its result drawn with the fillet's face meshed; at the accept prompt the result
# and a blue arrow at the fillet's middle; c) a click on the arrow: `>>Precise radio o [Salir]:`,
# the radius following the cursor (a line from the arrow); a click: `Reanudando el comando
# ARISTAEMPALME.`, the accept prompt again; Enter there: made, FILLETRAD3D the dragged radius
# (4.64557); the radius is the cursor's distance in along the bisector (clicks at 1320,760,
# 1360,720, 1290,800: 4.64557, 1.61298, 7.13265, each that distance within 0.1%); at the grip's
# prompt Enter `Se requiere un punto o una opción.` and asks again, Escape and `_X` go back to the
# accept prompt with `Reanudando…`; a typed number moves by the cursor (2 inwards 4.34861, 2
# outwards no change, 0.5 inwards 1.10042: its rule unverified); Escape at the accept prompt after
# it: FILLETRAD3D 1; d) Escape at the pick after `_R 3`: `*Cancelado*`, `0 arista(s)
# seleccionadas para empalme.`, `No hay ningún empalme a calcular.`, FILLETRAD3D 1; with an edge
# taken: `1 arista(s)…`, the same, nothing made; CHAMFEREDGE's: `No hay aristas que achaflanar.`,
# CHAMFERA and CHAMFERB kept; Escape at the accept's Radius or Distance goes back to the accept
# prompt; `_R 3` there then Escape: FILLETRAD3D 1; `_R 3` then Enter: 3; e) Ctrl+Space at the pick
# near the corner 10,0,10: nothing (the same edge lit, the command waiting); f) DYNMODE 3 at the
# pick: the prompt at the cursor, no X,Y box; g) CHAMFEREDGE's accept: two blue arrows, one per
# distance.
source "$(dirname "$0")/lib.sh"
C=900,380,800,760
run() { esc; timeout 40 $A com send "$1" >/dev/null 2>&1 & sleep 4; }
reset() { $A com eval '(progn (setvar "FILLETRAD3D" 1.0) (setvar "CHAMFERA" 0.0) (setvar "CHAMFERB" 0.0))' >/dev/null; }
vars() { $A com eval '(list (getvar "FILLETRAD3D") (getvar "CHAMFERA") (getvar "CHAMFERB"))'; }
grip() { hover 1355 710; hover 1365 704; sleep 1.5; $A click 1365 704 left >/dev/null; sleep 1.5; }
defs; box; reset
run "_FILLETEDGE "; hover 1370 690; hover 1379 693; shot d04-a1-hover-edge $C; $A click 1379 693 left >/dev/null
sleep 2; hover 1710 900; shot d04-b1-edge-taken $C; typ "\n"; sleep 2; shot d04-b2-accept $C; esc
run "_FILLETEDGE 5,0,10  "; grip; hover 1320 760; shot d04-c2-arrow-drag $C; $A click 1320 760 left >/dev/null
sleep 2; typ "\n"; sleep 2; vars; $A com hist 12; $A com send "_U\n" >/dev/null; reset
for p in "1360 720" "1290 800"; do set -- $p; run "_FILLETEDGE 5,0,10  "; grip; hover "$1" "$2"
  $A click "$1" "$2" left >/dev/null; sleep 1.5; typ "\n"; sleep 2; vars; $A com send "_U\n" >/dev/null; reset; done
for t in '2\n' '\n' '_X\n'; do run "_FILLETEDGE 5,0,10  "; grip; hover 1330 740; typ "$t"; sleep 1.5; esc; $A com hist 16; vars; reset; done
for c in "1330 740 2" "1400 650 2" "1330 740 0.5"; do set -- $c; run "_FILLETEDGE 5,0,10  "; grip; hover "$1" "$2"
  typ "$3\n"; sleep 1.5; typ "\n"; sleep 2; vars; $A com send "_U\n" >/dev/null; reset; done
esc; timeout 30 $A com send "_FILLETEDGE _R 3 " >/dev/null 2>&1; esc; vars; reset
timeout 30 $A com send "_FILLETEDGE 5,0,10  _R 3 \n" >/dev/null 2>&1; vars; $A com send "_U\n" >/dev/null; reset
timeout 30 $A com send "_CHAMFEREDGE _D 2 3 " >/dev/null 2>&1; esc; vars; reset
timeout 30 $A com send "_CHAMFEREDGE 5,0,10  _D 2 3 " >/dev/null 2>&1; esc; vars; reset
timeout 30 $A com send "_FILLETEDGE _R 2 5,0,10 " >/dev/null 2>&1; esc; vars
timeout 30 $A com send "_CHAMFEREDGE 5,0,10 " >/dev/null 2>&1; esc; $A com hist 30
for s in "_FILLETEDGE _R " "_FILLETEDGE 5,0,10  _R " "_CHAMFEREDGE _D "; do run "$s"; $A key esc >/dev/null; sleep 1.5; esc; done
$A com hist 40
run "_FILLETEDGE "; hover 1530 650; hover 1540 643; shot d04-d0-near-corner 1400,520,300,260; ctrl down
$A key space >/dev/null; sleep 1; shot d04-d2-ctrl-space 1400,520,300,260; $A key space >/dev/null; sleep 1
shot d04-d3-ctrl-space2 1400,520,300,260; ctrl up; esc; $A com hist 8
$A click 400 900 left >/dev/null; esc; typ "DYNMODE\n3\n"; typ "_FILLETEDGE\n"; hover 1370 690; hover 1379 693
shot d04-e1-dyn-pick $C; esc; typ "DYNMODE\n"; $A type -text '-1\n' >/dev/null # put back: the owner's -1
run "_CHAMFEREDGE 5,0,10  "; hover 1710 900; shot d04-f1-chamfer-accept $C; typ "_D\n"; $A key esc >/dev/null; sleep 1.5; esc
$A com hist 12
