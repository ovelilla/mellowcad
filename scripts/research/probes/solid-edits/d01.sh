#!/usr/bin/env bash
# d01 (SED): a solid's subobjects at Command: (es-ES, 2D Wireframe; lib.sh's box). Ctrl held by
# ctrl.ps1 (SendInput, held across a shot). Pixels: top face 3,7,10 at 1172,589; top front edge
# 5,0,10 at 1379,693; vertex 10,0,10 at 1548,640; vertical edge 10,0,5 at 1548,807.
# Seen: a) Ctrl pressed with the cursor still lights the face at once, released it goes at once;
# b) Ctrl over an edge: a halo; over a vertex: a light disc; over the front face: its four edges;
# c) Ctrl+click: blue edges and a red grip (a disc at the face's centre, a bar at the edge's
# middle, a dot on the vertex); d) Ctrl+Space over the top: the back, the top, the back...;
# e) a click after Ctrl+Space takes the back; Ctrl+Shift+click takes the top out, the edge stays;
# f) with the face selected LIST `1 encontrados` and the solid's listing, ERASE `1 encontrados`
# and the solid's `Tipo de sólido` gone (volume 1000), MOVE `1 encontrados` then the base point;
# g) the palette: `Cara de sólido` (Color and Material editable), `Arista de sólido` (Color),
# `Vértice de sólido` (all grey), General's rows; h) layer 0 locked: Ctrl over the face shows the
# padlock and no glow, Ctrl+click takes it (blue, no grip); i) SUBOBJSELECTIONMODE 3: a plain click
# inside the face started a window (inconclusive); j) the face's grip hovered: `Alargar las caras
# adyacentes / Mover cara / Permitir triangulación`, the edge's `… / Mover arista / …`.
source "$(dirname "$0")/lib.sh"
C=900,380,800,760
csel() { esc; ctrl down; $A click "$1" "$2" left >/dev/null; sleep 1; ctrl up; hover 400 900; }
defs; box
$A click 400 900 left >/dev/null; esc
hover 1172 589; shot d01-a1-plain $C; ctrl down; sleep 1.2; shot d01-a2-ctrl-still $C
$A click 1173 589 none >/dev/null; sleep 1; shot d01-a3-ctrl-moved $C; ctrl up; sleep 1.2; shot d01-a4-released-still $C
ctrl down; hover 1379 693; shot d01-b1-ctrl-edge $C; hover 1548 640; shot d01-b2-ctrl-vertex $C
hover 1280 1000; shot d01-b3-ctrl-front-face $C; ctrl up; esc
csel 1172 589; shot d01-c1-face-selected $C; csel 1379 693; shot d01-c2-edge-selected $C
csel 1548 640; shot d01-c3-vertex-selected $C; esc
ctrl down; hover 1172 589; shot d01-d0-ctrl-top $C
for n in 1 2 3 4; do $A key space >/dev/null; sleep 1; shot d01-d$n-space$n $C; done; ctrl up
esc; ctrl down; hover 1172 589; $A key space >/dev/null; sleep 1; $A click 1172 589 left >/dev/null; sleep 0.8
ctrl up; hover 400 900; shot d01-e1-space-click $C
esc; ctrl down; $A click 1172 589 left >/dev/null; sleep 0.8; $A click 1548 807 left >/dev/null; sleep 0.8
$A click 1172 589 left 1 shift >/dev/null; sleep 0.8; ctrl up; hover 400 900; shot d01-e2-ctrl-shift $C
for c in _LIST _ERASE _MOVE; do csel 1172 589; typ "$c\n"; sleep 1.5; esc; $A com hist 16; [ $c = _ERASE ] && $A com send "_U\n" >/dev/null; done
csel 1172 589; $A com send "_PROPERTIES\n" >/dev/null; sleep 2 # the palette shot by its handle (acad.sh wins)
csel 1379 693; csel 1548 640; esc; $A com send "_PROPERTIESCLOSE\n" >/dev/null
$A com send "_-LAYER _LO 0\n\n" >/dev/null; $A click 400 900 left >/dev/null; esc; ctrl down; hover 1173 589
shot d01-h1-locked-ctrl-hover $C; $A click 1173 589 left >/dev/null; sleep 1; ctrl up; hover 400 900
shot d01-h2-locked-ctrl-click $C; esc; $A com send "_-LAYER _U 0\n\n" >/dev/null
$A com set SUBOBJSELECTIONMODE 3 >/dev/null; hover 1172 589; $A click 1172 589 left >/dev/null; hover 400 900
shot d01-i2-filter-face-click $C; esc; $A com set SUBOBJSELECTIONMODE 0 >/dev/null
csel 1172 589; hover 1280 604; sleep 1; shot d01-j2-face-grip-menu 1250,580,420,200; esc; esc
csel 1548 807; hover 1548 807; sleep 1; shot d01-j3-edge-grip-menu 1518,787,420,200; esc; esc
