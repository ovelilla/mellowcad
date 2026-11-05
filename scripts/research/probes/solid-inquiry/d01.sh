#!/usr/bin/env bash
# d01 (VSC-02, MSP-02), COM only, no mouse or keys: in Hidden, do REGEN and -VIEW write
# `Regenerating model.` on the desktop as they do not in the console (p219, p220)? And does
# MASSPROP take a preselection there (console p124: no), with LIST as the control?
set -uo pipefail
A="$(dirname "$0")/../../acad.sh"
$A com new
$A com netload >/dev/null
$A com send "_BOX 0,0,0 10,20,5\n"
$A com send "_-VIEW _SWISO\n"
$A com send "_VSCURRENT _H\n"
$A com send "_REGEN\n"
$A com send "_-VIEW _TOP\n"
$A com send "_ZOOM _E\n"
$A com send "_VSCURRENT _2\n"
$A com send "_-VIEW _SWISO\n"
$A com eval '(sssetfirst nil (ssget "_X"))'
$A com send "_LIST\n"
$A com eval '(sssetfirst nil (ssget "_X"))'
$A com send "_MASSPROP\n\n"
$A com hist 60
$A com close
