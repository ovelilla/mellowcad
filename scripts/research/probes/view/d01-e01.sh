# The View review's desktop pass (block VWD), 2026-10-27: d01–d09 in the en-US profile
# (`acad.sh launch "" en-US`), e01 in the es-ES one (`acad.sh launch`, a 2560 px drawing area:
# redefine sx with 3840 as the centre). A drawing of the review's own (`acad.sh com new`,
# `com netload` for `hist`), the rectangle 0,0–100,50, a circle 50,25 r10, view ZOOM C 50,25 120.
# Read before and put back: OSMODE 4133 (0 for the pass), NAVVCUBEDISPLAY 1 (3 for d05), DYNMODE -1.
# Run step by step; read `hist` without a `gv` in between (its evals push the U echo out).
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk-en.sh"
S=scripts/research/probes/view/burst.ps1
$A com eval '(setvar "OSMODE" 0)'; cs "_LINE 0,0 100,0 100,50 0,50 _C\n"; cs "_CIRCLE 50,25 10\n"; home

# d01 The wheel. One notch (delta 120) at the cursor: VIEWSIZE 120 → 75.102 in, → 191.944 out
# (×1.5978), about the cursor (VIEWCTR 57.5361,28.7755 from 50,25 at 70,35). Each notch is an
# undo step INTELLIZOOM; U takes consecutive ones together with the ZOOMs and pans before them
# (`INTELLIZOOM INTELLIZOOM INTELLIZOOM`, `INTELLIZOOM ZOOM ZOOM`), the LINE before them kept.
# Notches 940 ms apart are one ZOOM Previous step and one INTELLIZOOM, 1000 ms apart two. Inside
# LINE, its Undo takes the zoom back with the segment.
cs "_LINE 200,200 210,200\n\n"; for i in 1 2 3; do at 50 25 wheel 1; sleep 1.2; done; $A com send "_U\n"; hist 3
for ms in 880 940 1000 1300; do home; powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w $S)" 3638 770 2 $ms; sleep 2; cs "_ZOOM _P\n"; gv VIEWSIZE; done
at 90 45; ty "\e\e"; ty "_LINE\n0,0\n10,10\n"; at 50 25 wheel 1; sleep 1.2; ty "_U\n"; ty "\e"; gv VIEWSIZE

# d02 The wheel button. A drag pans with an open hand (d02-1), U `INTELLIPAN`, joined with the
# wheel's and ZOOM's (`INTELLIPAN ZOOM INTELLIPAN ZOOM INTELLIZOOM ZOOM`); a click without a move
# is an INTELLIPAN step and a ZOOM Previous step too. A double-click writes `Command: '_.zoom`,
# ZOOM's first prompt and `_e`; U `'.ZOOM INTELLIPAN`. Shift held with it orbits (d02-2: the
# status bar shows 3DORBIT's words, the visual style turns Fast), writes ` Regenerating model.`
# on release; U `GROUP menu item Regenerating model.` and the plan back.
dr down 50 25 middle; dr move 40 20 middle; scr 40 20 d02-1; dr up 30 15 middle; $A com send "_U\n"; hist 2
at 50 25 middle 1; $A com send "_U\n"; hist 1; at 50 25 middle 2; hist 4; $A com send "_U\n"; hist 1
dr down 50 25 shiftmiddle; dr move 55 25 shiftmiddle; full d02-2; dr up 60 22 shiftmiddle; hist 2; $A com send "_U\n"; hist 1

# d03 Real-time PAN: an open hand; the right button's menu Exit · Pan (checked), Zoom, 3D Orbit ·
# Zoom Window, Zoom Original, Zoom Extents (d03-2); Escape with it open closes it and ends PAN.
# A PAN with or without a drag is a step joined with the ZOOMs round it (`ZOOM PAN ZOOM`,
# `PAN ZOOM`) and with another PAN (`PAN PAN`).
at 90 45; ty "\e\e"; ty "_PAN\n"; dr down 50 25; dr move 40 20; dr up 30 15; at 30 15 right; full d03-2; ty "\e"
cs "_ZOOM 2X\n"; ty "_PAN\n"; dr down 50 25; dr up 40 20; ty "\n"; cs "_ZOOM 0.5X\n"; $A com send "_U\n"; hist 1

# d04 3DORBIT: its menu (d04-2) as the coverage lists; Escape closes the menu and ends it. It
# always ends with `Regenerating model.`, a drag or none, and U says `3DORBIT Regenerating model.`,
# joined with nothing. `'3DORBIT` at LINE's prompt runs (VDR-25): `Press ESC or ENTER to exit,
# or right-click to display shortcut-menu.` with no `>>`, `Regenerating model.`,
# `Resuming LINE command.`; U `LINE Regenerating model.`.
cs "_ZOOM 2X\n"; at 90 45; ty "\e\e"; ty "_3DORBIT\n\n"; $A com send "_U\n"; hist 1
ty "_LINE\n0,0\n10,0\n'3DORBIT\n"; dr down 50 25; dr up 54 26; ty "\n20,0\n\n"; $A com send "_U\n"; hist 1

# d05 The ViewCube (NAVVCUBEDISPLAY 3; the cube's centre at the screen's 4633,287). A face, an
# edge, a corner, Home, a triangle and a compass letter all say ` Regenerating model.` and are an
# undo step `'.VIEWCUBEACTION Regenerating model.`, joined with nothing; inside LINE it is
# transparent (`Resuming LINE command.`) and LINE's Undo takes it back with the segment. Each fits
# the extents' sphere: VIEWSIZE 425.677, the diagonal of EXTMIN 0,0,0 – EXTMAX 301,301,0, from
# Front, Top and Home alike, centred on the box. The UCS stays the WCS after Front (UCSORTHO not
# applied). The roll arrows (counterclockwise left: VIEWTWIST 90; clockwise right: 270) fit too.
# A compass letter gives the level view from that side, from the plan and from SW Isometric alike
# (S: VIEWDIR 0,-1,0). Its menu: Home · Parallel (checked), Perspective, Perspective with Ortho
# Faces · Set Current View as Home · ViewCube Settings... · Help. A vertical drag let go 1.7° and
# 6.6° off Top stays there.
$A com set NAVVCUBEDISPLAY 3; $A click 4633 287 none; $A click 4633 324; $A com send "_U\n"; hist 1
$A click 4676 218; gv VIEWTWIST VIEWSIZE; $A click 4703 241; gv VIEWTWIST; $A click 4633 345; gv VIEWDIR

# d06 The viewport controls: `[-][Top][2D Wireframe]`; the list Custom Model Views ▸ · Top, Bottom,
# Left, Right, Front, Back, SW/SE/NE/NW Isometric (the current one checked) · View Manager... ·
# Parallel (checked), Perspective. A choice writes `Command: '_-view Enter an option [...]:
# _swiso Regenerating model.`; U `'-VIEW Regenerating model.`; Front aligns the UCS (*FRONT*).
# While a command runs the label does not answer: the click is a point of LINE's.
$A click 2598 195; full d06-1; $A click 2675 379; hist 2; $A com send "_U\n"; hist 1

# d07 The navigation bar: the Zoom list Zoom Extents, Window, Previous, Realtime, All, Dynamic,
# Scale, Center, Object, In, Out (d07-3), the last one used shown on its face. In doubles
# (VIEWSIZE 120 → 60), writes ZOOM's first prompt, and is a step U names `'ZOOM GROUP`, joined
# with neither a typed ZOOM nor another In. Pan writes its exit message; U `'PAN GROUP`.
$A click 4695 536; $A click 4780 753; gv VIEWSIZE; $A click 4695 521; $A com send "_U\n"; hist 1

# d08 ZOOM's window: a solid white rectangle, the cursor's magnifier badge (d08-1, d08-2).
# d09 -PAN's band amber and dashed (d09-2). -VPOINT in UCS Z 30: Escape at the view point and at
# Rotate's angle writes `*Cancel*`, then `*** Returning to the UCS ***`. VPOINT opens Viewpoint
# Presets (closed with `acad.sh post`).
ty "_ZOOM\n"; at 30 15; mv 60 35; scr 45 25 d08-1 900 560; ty "\e\e"
ty "_-PAN\n"; at 30 15; mv 60 35; scr 45 25 d09-2 900 560; ty "\e"
cs "_UCS _Z 30\n"; ty "_-VPOINT\n\e"; ty "_-VPOINT\n_R\n\e"; hist 8; cs "_UCS _W\n"

# e01 es-ES: U names INTELLIPAN, INTELLIZOOM and '.VIEWCUBEACTION as in English;
# `GRUPO menu item Regenerando modelo.`, `3DORBITA Regenerando modelo.`, `'-VISTA Regenerando
# modelo.`; the cube SUPERIOR, the compass O, SCU; `[−][Superior][Estructura alámbrica 2D]` and its
# list Superior … Isométrica NO; the bar's Zoom list Extensión, Zoom ventana, Previo, Zoom en tiempo
# real, Zoom todo, Zoom dinámico, Escala de zoom, Zoom centro, Zoom objeto, Acercar, Alejar; its
# tooltips Encuadre, Extensión, Órbita.

$A com eval '(setvar "OSMODE" 4133)'; $A com set NAVVCUBEDISPLAY 1; $A com close
