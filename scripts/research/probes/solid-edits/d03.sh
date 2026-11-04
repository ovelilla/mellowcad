#!/usr/bin/env bash
# d03 (SED): the right button at each prompt (es-ES, SHORTCUTMENU 11; lib.sh's box): the command
# started through COM, a right-click on nothing, the menu shot, Escape twice.
# Seen: Intro, Cancelar, [Entrada reciente], the prompt's options in its order, [Modificaciones de
# REFENT at a point prompt], Encuadre, Zoom, SteeringWheels, Calculadora rápida: SOLIDEDIT's
# first prompt Cara…Salir, Face's eXtruir…Salir, `Designe caras` desHacer, Eliminar (+ Todas
# once one is taken); FILLETEDGE's pick (no Entrada reciente) Cadena, Bucle, Radio, its accept
# Radio; SLICE's start Objeto plano…3puntos, its side mantener Ambos lados; SECTION's first
# Objeto…3puntos. `Designe objetos para cortar:` empty: no menu, Enter (`No hay ningún objeto
# seleccionado.`).
source "$(dirname "$0")/lib.sh"
rc() { esc; timeout 25 $A com send "$1" >/dev/null 2>&1 & sleep 4; hover 880 620; hover 890 620; sleep 1
  $A click 890 620 right >/dev/null; sleep 1.5; shot "$2" 880,600,520,760; $A key esc >/dev/null; sleep 0.8; esc; }
defs; box
rc "_SOLIDEDIT " d03-a1-solidedit-first; rc "_SOLIDEDIT _F " d03-a2-solidedit-face
rc "_SOLIDEDIT _F _M " d03-a3-select-faces; rc "_SOLIDEDIT _F _M 3,7,10 " d03-a4-select-faces-one
rc "_FILLETEDGE " d03-b1-filletedge-pick; rc "_FILLETEDGE 5,0,10  " d03-b2-filletedge-accept
rc "_SLICE (handent \"$BOXH\")  " d03-c1-slice-plane; rc "_SLICE (handent \"$BOXH\")  _XY 0,0,5 " d03-c2-slice-side
rc "_SECTION (handent \"$BOXH\")  " d03-c3-section-first; rc "_SLICE " d03-c4-slice-empty-select
$A com hist 8
