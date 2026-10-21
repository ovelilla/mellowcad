#!/usr/bin/env bash
# SPLINE's desktop session (the owner's AutoCAD, Spanish profile, 2026-10-21), the gestures in the
# order run. It clicks and types on the owner's screen: ask first, and tell them when it is over.
# Needs a drawing of the review's own (acad.sh com new). Settings read before, put back after:
# DYNMODE 0, OSMODE 4133, ORTHOMODE 0, CECOLOR BYLAYER, SHORTCUTMENU 11, POLARMODE 0, SPLMETHOD 0,
# SPLKNOTS 0, SPLDEGREE 3. Screenshots: research/probes/spline/d<id>-*.png.
source "$(dirname "$0")/lib-dsk.sh"
$A com send "_ZOOM _C 50,25 100\n"; $A com set OSMODE 0; $A com eval '(setvar "CECOLOR" "1")'
# d01 Fit (DYNMODE 0): one point, an amber dashed line from it to the cursor; then the ghost in
# CECOLOR through the points and the cursor, and the amber dashed line from the last point; Ortho
# bends the next point from the last one (`Orto: 15.9728 < 90°`)
at 90 45; $A key esc; ty '_SPLINE\n'; at 30 20; mv 40 30; scr 40 25 d01-1; at 40 30; mv 50 15
scr 45 25 d01-2; at 50 15; mv 62 28; scr 50 25 d01-3; $A key f8; mv 62 31; scr 50 25 d01-4
$A key f8; ty '\n'
# d02 the tangents: an amber dashed line from the first point (start) or the last (end) to the
# cursor, the ghost following the tangent; after the start tangent the prompt is again
# `[iniciar Tangencia/toLerancia]`
ty '_SPLINE\n'; at 30 20; ty 'T\n'; mv 32 30; scr 35 25 d02-1; at 32 30; mv 45 22; scr 40 25 d02-2
at 45 22; at 55 30; ty 'T\n'; mv 60 22; scr 50 25 d02-3; $A key f8; mv 60 21; scr 50 25 d02-4
$A key f8; at 60 22; $A com netload; $A com hist 14
# d03 `<45` at the next point (`Modificación de ángulo: 11.9602 < 45°`), then 10: the second fit
# point 10 along 45°
$A com send "_ERASE _ALL \n"; at 90 45; $A key esc; ty '_SPLINE\n'; at 30 20; ty '<45\n'
mv 45 22; scr 40 25 d03-1; ty '10\n'; mv 50 15; scr 40 25 d03-2; ty '\n'; $A com dump
# d04 DYNMODE 3: the first point X and Y; the next points a length and an angle from the last; the
# start and end tangents a length and an angle too
$A com send "_ERASE _ALL \n"; $A com set DYNMODE 3; at 90 45; $A key esc; ty '_SPLINE\n'
mv 30.1 20.1; scr 35 25 d04-1; at 30 20; mv 40 28; scr 35 25 d04-2; at 40 28; mv 50 18
scr 45 25 d04-3; at 50 18; mv 60 26; scr 50 25 d04-4; ty 'T\n'; mv 62 20; scr 55 25 d04-5
$A key esc esc; ty '_SPLINE\n'; at 30 20; ty 'T\n'; mv 33 28; scr 35 25 d04-6; $A key esc esc
# d05 the Down list: Método, Nudos, Objeto; finalizar Tangencia, toLerancia, desHacer, Cerrar;
# Enter at the first prompt refused, `Se requiere un punto o una opción.`
at 90 45; $A key esc; ty '_SPLINE\n'; mv 30.1 20.1; $A key down; scr 35 25 d05-1; ty '\n'
scr 35 25 d05-1b; $A key esc esc; ty '_SPLINE\n'; at 30 20; mv 40 28; $A key down; scr 35 25 d05-2
$A key up; ty '\n'; scr 35 25 d05-2b; $A key esc esc; ty '_SPLINE\n'; at 30 20; at 40 28; at 50 18
mv 60 26; $A key down; scr 50 25 d05-3; $A key up; ty '\n'; $A key esc esc
# d06 the right button (SHORTCUTMENU 11): the menu with each prompt's options; Escape twice
# `*Cancelado*`, nothing kept
$A com send "_ERASE _ALL \n"; $A com set DYNMODE 0; at 90 45; $A key esc; ty '_SPLINE\n'
at 30 20 right; $A shot -hwnd -1 -crop "900,600,700,700"; $A key esc; at 30 20; at 40 28; at 50 18
mv 55 22; at 55 22 right; $A shot -hwnd -1 -crop "1000,500,700,700"; $A key esc esc; $A com hist 12
# d07 CV: the frame a light-grey fine dashed polyline, the ghost in CECOLOR, the amber dashed line
# from the last vertex
at 90 45; $A key esc; ty '_SPLINE\n_M\n_CV\n'; at 30 20; mv 40 30; scr 40 25 d07-1; at 40 30
mv 50 15; scr 45 25 d07-2; at 50 15; mv 62 28; scr 50 25 d07-3; $A key f8; mv 62 31
scr 50 25 d07-4; $A key f8; ty '\n'; scr 50 25 d07-5
# d08 a fit spline's grips: squares at the fit points, a triangle near the start (its menu Ajustar,
# Vértices de control); a fit point's hover menu Estirar / Añadir / Eliminar punto de ajuste, the
# end's adds Dirección de tangente; a plain drag moves the fit point
$A com send "_ERASE _ALL \n"; $A com send "_SPLINE _M _FIT 30,20 40,30 50,15 60,28 \n"
$A com send "_SPLINE _M _CV 30,35 40,45 50,35 60,45 \n"; $A com send "_SPLINE _M _FIT 70,20 80,30 75,40 _C\n"
$A com eval '(sssetfirst nil (ssadd (handent "87")))'; mv 90 45; scr 45 25 d08-1; mv 40 30; sleep 2
scr 45 25 d08-2; $A key esc; $A com eval '(sssetfirst nil (ssadd (handent "87")))'; mv 60 28; sleep 2
scr 45 25 d08-3; $A key esc; $A com eval '(sssetfirst nil (ssadd (handent "87")))'; mv 31.7 18.4
at 31.7 18.4; $A shot -hwnd -1 -crop "880,500,800,600"; $A key esc esc
$A com eval '(sssetfirst nil (ssadd (handent "87")))'; at 40 30; mv 42 34; scr 45 25 d08-6; at 42 34
$A key esc; $A com dump
# d09 a CV spline's grips: round, the frame dashed; a vertex's hover menu Estirar / Insertar
# vértice / Precisar vértices / Eliminar vértice; a plain drag moves the vertex
$A com eval '(sssetfirst nil (ssadd (handent "88")))'; mv 90 45; scr 45 38 d09-1; at 40 45; mv 41 48
scr 45 38 d09-2; at 41 48; $A key esc; $A com dump; $A com eval '(sssetfirst nil (ssadd (handent "88")))'
mv 90 45; $A shot -hwnd -1 -crop "$(($(sx 30) - 40)),$(($(sy 45) - 40)),400,200"; mv 50 35; sleep 2
scr 45 38 d09-4; $A key esc
# d10 the Properties palette (it floats on the second monitor: capture it by its window handle)
$A key esc esc; $A com send "_PROPERTIES\n"; $A com eval '(sssetfirst nil (ssadd (handent "87")))'
$A wins; $A shot "<Propiedades hwnd>"; $A com eval '(sssetfirst nil (ssadd (handent "88")))'
$A shot "<Propiedades hwnd>"; $A com eval '(sssetfirst nil (ssadd (handent "89")))'; $A shot "<Propiedades hwnd>"
# put the settings back
$A com send "_PROPERTIESCLOSE\n"; $A com set OSMODE 4133; $A com set ORTHOMODE 0
$A com eval '(setvar "DYNMODE" 0)'; $A com eval '(setvar "CECOLOR" "BYLAYER")'
$A com eval '(setvar "SPLMETHOD" 0)'; $A com close
# d11, d12 through COM only (an instance launched for them): Enter at the start tangent gives no
# tangent (StartFitTangent 0,0,0; the console's p118 took its fixed cursor); after Undo back to
# one point, `_T` asks the same prompt again (the console's p148 asked the end tangent)
$A com new; $A com send "_SPLINE _M _FIT 30,20 _T \n40,30 50,10 \n"; $A com dump
$A com send "_ERASE _ALL \n"; $A com send "_SPLINE 30,20 40,30 _U _T\n"; $A key esc esc esc
$A com hist 20; $A com close
