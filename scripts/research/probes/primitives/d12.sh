#!/usr/bin/env bash
# d12: the es-ES profile (acad.sh launch, the owner's; DYNMODE -1 there, typed 3 and put back),
# SE Isometric, ZOOM C 300,100,0 300 (300,100,0 at 3840,770: the view is 2560 wide). CYLINDER's
# right-button menu at the height, and its radius and height with dynamic input.
# Seen: Intro, Cancelar, Entrada reciente, 2Puntos, punto final Eje, Modificaciones de REFENT,
# Encuadre, Zoom, SteeringWheels, Calculadora rápida; the Down list Arista, Lados.
source "$(dirname "$0")/lib.sh"
esc; $A com send "_ERASE _ALL \n" >/dev/null
$A click 3500 950 left >/dev/null; esc; typ "DYNMODE\n3\n"
esc; typ "_CYLINDER\n300,100,0\n20\n"; $A click 3900 700 right >/dev/null; sleep 1.2; shot d12-menu 3700,500,800,800; esc; esc
esc; typ "_CYLINDER\n300,100,0\n"; hover 3940 770; shot d12-radius 3400,350,1000,800
typ "20\n"; hover 3840 670; shot d12-height 3400,350,1000,800; esc
esc; typ "_PYRAMID\n"; hover 3840 770; $A key down >/dev/null; sleep 1; shot d12-pyramid-down 3400,350,1000,800; $A key enter >/dev/null; esc
esc; $A click 3500 950 left >/dev/null; esc; $A type -text 'DYNMODE\n-1\n' >/dev/null
