#!/usr/bin/env bash
# ELLIPSE's desktop session (the owner's AutoCAD, Spanish profile, 2026-10-21), the gestures in the
# order run. It clicks and types on the owner's screen: ask first, and tell them when it is over.
# Needs a drawing of the review's own (acad.sh com new). Settings read before, put back after:
# DYNMODE 0, OSMODE 4133, ORTHOMODE 0, CECOLOR BYLAYER, SHORTCUTMENU 11, POLARMODE 0.
# Screenshots: research/probes/ellipse/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
$A com send "_ZOOM _C 50,25 100\n"; $A com set OSMODE 0; $A com eval '(setvar "CECOLOR" "1")'
# d01 axis mode (DYNMODE 0): the other endpoint an amber dashed line from the first, no ghost; Ortho
# (F8) flattens it (`Orto: 21.8452 < 0°`); the distance a red ghost (CECOLOR) and an amber dashed
# line from the centre to the cursor, Ortho bending it (`Orto: 10.1105 < 90°`); Rotation the same
at 90 45; $A key esc; ty '_ELLIPSE\n'; at 40 25; mv 62 31.2; scr 50 25 d01-1b; $A key f8; mv 62 31.4
scr 50 25 d01-2; at 62 31.4; mv 52 35.2; scr 50 25 d01-3b; $A key f8; mv 56 33; scr 50 25 d01-4
ty '_R\n'; mv 58 30.2; scr 50 25 d01-5b; $A key esc esc
# d02 the arc: the whole ellipse's ghost and the dashed line at the start angle; the arc's ghost at
# the end angle; Ortho bends the end angle about the centre (`Orto: 8.9210 < 270°`, from the major axis)
ty '_ELLIPSE\n_A\n'; at 40 25; at 62 25; at 51 32; mv 60 33; scr 50 25 d02-1; at 60 33; mv 45 34
scr 50 25 d02-2; $A key f8; mv 44 34; scr 50 25 d02-3; $A key f8; at 45 34
# d03 `<45` at the other endpoint (`Modificación de ángulo: 14.7854 < 45°`), then 10: the axis along
# 45°; `<90` at the distance (`Modo momentáneo de ángulo: 90`), then 4: ratio 0.8
$A com send "_ERASE _ALL \n"; ty '_ELLIPSE\n'; at 40 25; ty '<45\n'; mv 60 26; scr 50 25 d03-1
ty '10\n<90\n'; mv 55 35; scr 50 25 d03-2; ty '4\n'; $A com dump
# d04 DYNMODE 3: the first prompt X and Y; the other endpoint the axis's length and angle; the
# distance one length along the other axis; Rotation an angle arc and no field
$A com send "_ERASE _ALL \n"; $A com set DYNMODE 3; ty '_ELLIPSE\n'; mv 40.1 25.1; scr 45 25 d04-1
at 40 25; mv 60 29; scr 50 25 d04-2; at 60 29; mv 52 33; scr 50 25 d04-3; ty '_R\n'; mv 55 31
scr 50 25 d04-4; $A key esc esc
# d05 the Down list: Arco, Centro at the first prompt; Parámetro at the start angle (no Ángulo);
# Enter there with only the cursor's reading refused, `Requiere un ángulo numérico válido, un
# segundo punto o una opción.`; Escape with the list open cancels the command
ty '_ELLIPSE\n'; mv 40.1 25.1; $A key down; scr 45 25 d05-1; $A key esc
ty '_ELLIPSE\n_A\n'; at 40 25; at 60 25; at 51 31; mv 58 32; scr 50 25 d05-2; $A key down
scr 50 25 d05-3; ty '\n'; mv 58.2 32; scr 50 25 d05-3b; at 58 32; mv 45 33; scr 50 25 d05-4
$A key down; scr 50 25 d05-5; $A key esc
# d06 the right button (SHORTCUTMENU 11): at the first prompt Intro, Cancelar, Entrada reciente,
# Arco, Centro, Modificaciones de REFENT, Encuadre, Zoom, SteeringWheels, Calculadora rápida; at
# the other endpoint (no options) Enter, refused `Punto 2D no válido.` and asked again
$A com set DYNMODE 0; ty '_ELLIPSE\n'; at 40 25 right; $A shot -hwnd -1 -crop "3600,450,700,800"
$A key esc; at 40 25; mv 55 27; at 55 27 right; $A key esc esc; $A com netload; $A com hist 14
# d07 grips: an ellipse has its centre and four quadrants, an elliptical arc those and two arrow
# grips at its ends (the rest of the ellipse drawn faint); no hover menu on any; a quadrant's drag
# sets that half-axis to the cursor's distance from the centre, its direction kept; an end's drag
# moves the end to the cursor's heading from the centre, the ellipse kept
$A com send "_ERASE _ALL \n"; $A com send "_ELLIPSE _C 50,25 60,25 5\n"
$A com send "_ELLIPSE _A 20,25 40,25 4 30 200\n"; at 60 25; scr 45 25 d07-1; mv 50 30; scr 50 28 d07-2
at 50 30; mv 52 33; scr 50 28 d07-3; at 52 33; $A key esc; $A com dump
at 50 33.3; at 60 25; mv 64 28; scr 50 28 d07-4; at 64 28; $A key esc; $A com dump
at 34.16 21.36; scr 30 25 d07-5; mv 37.35 27.65; sleep 1.5; scr 33 25 d07-6; at 37.35 27.65; mv 32 31
scr 30 25 d07-7; at 32 31; $A key esc; $A com dump
# d08 the Properties palette (Ctrl+1): General, then Geometría: Inicio X/Y/Z, Centro X/Y/Z, Fin X/Y/Z,
# Radio mayor, Radio menor, Relación del radio, Ángulo inicial, Ángulo final, Vector de radio mayor
# X/Y/Z, Vector de eje menor X/Y/Z, Área; Inicio, Fin, the vectors and Área read-only
$A com eval '(sssetfirst nil (ssadd (handent "89")))'; $A key ctrl+1
$A shot -hwnd -1 -crop "2560,0,420,400"; $A shot -hwnd -1 -crop "2560,182,700,1177"
$A key esc; $A com eval '(sssetfirst nil (ssadd (handent "8A")))'; $A shot -hwnd -1 -crop "2560,250,420,450"
# put the settings back
$A key esc esc; $A com send "_PROPERTIESCLOSE\n"; $A com set OSMODE 4133; $A com set ORTHOMODE 0
$A com eval '(setvar "DYNMODE" 0)'; $A com eval '(setvar "CECOLOR" "BYLAYER")'; $A com close
