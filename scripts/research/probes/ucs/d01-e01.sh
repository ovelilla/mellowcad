# The UCS review's desktop pass (block UCD), 2026-10-28: d01–d07 in the en-US profile
# (`acad.sh launch "" en-US`), e01 in the es-ES one (`acad.sh launch`; its drawing area is 2560
# wide and the view lands lower: sx(x) = 3055 + 9.808x, SY(y) = 1261.5 − 9.808y there).
# A drawing of the review's own (`acad.sh com new`, `com netload` for `hist`), the rectangle
# 0,0–100,50, view ZOOM C 50,25 120. Read before and put back: OSMODE 4133 (0 for the pass),
# NAVVCUBEDISPLAY 1 (3 for d03), DYNMODE -1 (3 for d04's fields). Run step by step.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk.sh"
$A com eval '(setvar "OSMODE" 0)'; cs "_LINE 0,0 100,0 100,50 0,50 _C\n"; home

# d01 The icon: UCSICON's Properties are 3D, line width 1, size 50, White in model space (d07-1).
# White, no arrowheads; the WCS's square at the origin (d01-2), none elsewhere (d01-3); Noorigin
# in the lower-left corner (d01-4). Tilted (UCS X 30) a third arm, Z, with its letter (d01-5);
# with the XY plane edge-on (X 90) the X and Z arms, no broken pencil (d01-6); Y 45 (d01-7).
crop 3110,900,200,140 d01-2; cs "_UCS 20,10 \n\n"; mv 75 50; crop 3250,760,260,200 d01-3
cs "_UCSICON _N\n"; crop 2560,1150,250,200 d01-4; cs "_UCSICON _OR\n"
cs "_UCS _X 30\n"; crop 3250,700,260,260 d01-5; cs "_UCS _X 60\n"; crop 3250,800,260,260 d01-6
cs "_UCS _W\n"; cs "_UCS _Y 45\n"; crop 3110,800,260,260 d01-7; cs "_UCS _W\n"

# d07 UCSICON Properties (modal: sent in the background, read by uia, closed with post).
($A com send "_UCSICON _P\n" &); sleep 3; $A wins; $A shot <hwnd>; $A post <hwnd>

# d02 The icon selected (UCSSELECTMODE 1, a pick on an arm, UCS at 30,25): a square grip at the
# origin, round ones at the arms' ends (d02-1). The origin grip's menu Move and Align · Move
# Origin Only · World (d02-4); X's X Axis Direction · Rotate Around Z Axis · Rotate Around Y Axis
# (d02-3); Y's Y Axis Direction · Rotate Around Z Axis · Rotate Around X Axis (d02-5). The right
# button on it: World, Previous · Named UCS ▸ (Save, the saved ones) · Origin, 3 Point, Rotate
# Axis ▸ (X, Y, Z), Z Axis · View, Face, Object · UCS Icon Settings ▸ (Show UCS Icon at Origin,
# checked; Properties...) (d02-6c to d02-9). World writes `_ucs` … `_w`, U `UCS`. A drag of the
# origin grip writes `** MOVE AND ALIGN **` / `Specify origin point or align to face, surface,
# or mesh:`; U `ACUCSEDITACTION`.
cs "_UCS 30,25 \n\n"; px 3442 740; mv 30 25; px 3442 745 right; full d02-6
px 3442 740; px 3442 770; at 60 40; hist 8; $A com send "_U\n"; hist 2

# d03 The ViewCube's UCS menu (NAVVCUBEDISPLAY 3; its button at 4632,383): ✓ WCS · the saved
# ones · New UCS, a separator after WCS and before New UCS (d03-1). A saved one current: its name
# (d03-3); an unnamed one, *FRONT* or *TOP*: `Unnamed`, listed checked after the saved ones
# (d03-4, d03-5, d03-8, d03-9). Choosing A or WCS writes UCS's prompts without the command's name
# or the answers; U `UCS GROUP`. New UCS writes `_ucs` and asks UCS's first prompt.
$A com set NAVVCUBEDISPLAY 3; cs "_UCS _NA _S A\n"; cs "_UCS _W\n"; px 4632 383; px 4696 434
$A com send "_U\n"; hist 14

# d04 The jig: at every point prompt a dashed amber band from the base — the first prompt's and
# ZAxis's origin from the current UCS's origin (d04-1, d04-5), X, XY and Z from the new origin
# (d04-2, d04-3), the X / Y / Z rotation's angle from the origin (d04-4). The icon follows: at the
# cursor at the origin prompts, turned towards it at X and the rotation, and the crosshair turned
# to the new UCS (red X, green Y) at the XY point. Dynamic input (DYNMODE 3): distance < angle from
# the base at the first prompt and X's (d04-6, d04-8), one angle field at a rotation (d04-9); the
# Down list Face … ZAxis, World marked (d04-7). `30,0` typed in the box is relative: `@30,0` at the
# first prompt (origin 30,0 from the WCS), X along +X from an origin at 20,10.
px 3900 1345; ty "_UCS\n"; mv 60 35; scr 30 20 d04-1 1100 700; at 20 10; mv 60 30; ty "30,0\n\n"

# d05 The right button at the first prompt: the command menu Enter, Cancel, Recent Input ▸,
# Dynamic Input ▸ · Face … ZAxis · Osnap Overrides ▸ · Pan, Zoom, SteeringWheels · QuickCalc
# (d05-1c). Space at NAmed's prompt is Enter: World. A Save name takes a space: `AB CD` typed
# key by key is saved whole (the console's p237 was no artefact), though the trace says
# AllowSpaces false.
ty "_UCS\n_NA\n "; ty "\e"; ty "_UCS\n_NA\n_S\nAB CD\n"; $A com eval '(tblsearch "UCS" "AB CD")'

# d06 OBject's hover (a line, a line on a locked layer, a SOLID hatch): the selection's blue glow,
# the icon placed where the UCS would go, a padlock over the locked one (d06-1 to d06-3); BREAK's
# and ZAxis Object's are the white rollover, a locked one the padlock alone (d06-4 to d06-7). A
# click on nothing at OBject: `No object found`, LASTPOINT there (`ID @` 45.0533,30.0977). A click
# on the hatch: `This object does not define a coordinate system`, once.
ty "_UCS\n_OB\n"; mv 25 42.5; scr 25 42 d06-1 500 300; ty "\e"; ty "_UCS\n_OB\n"; at 45 30; cs "_ID @\n"

# e01 The Spanish profile: the icon's menu Universal, Previo · SCP guardado ▸ (Guardar) · Origen,
# 3 puntos, Girar eje ▸, Eje Z · Vista, Cara, Objeto · Parámetros del icono SCP ▸ (Mostrar icono
# SCP en origen, Propiedades...) (e01-1c to e01-3); the grips' Desplazar y alinear · Mover sólo
# origen · Universal (e01-4), Dirección del eje X · Girar alrededor del eje Z · Girar alrededor del
# eje Y (e01-5); the ViewCube's SCU · A · S-nombre · Nuevo SCP (e01-7, e01-8).
