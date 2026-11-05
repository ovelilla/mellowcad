#!/usr/bin/env bash
# d08 (VSD): MASSPROP typed (`_MASSPROP`: the es profile knows it as PROPFIS), with the profile's dynamic input (DYNMODE -1) and command line hidden
# (es-ES). A box 0,0,0–10,20,5 in plan. a) MASSPROP typed, the box clicked, Enter: the report's
# window and the `Write analysis` prompt; b) Escape there; c) a run ended by the right button at
# `Write analysis` (SHORTCUTMENU 11); the screen captured at each step, the history read after.
source "$(dirname "$0")/lib.sh"
$A com new >/dev/null; $A com netload >/dev/null; defs
$A com send "_BOX 0,0,0 10,20,5\n" >/dev/null; $A com send "_ZOOM _C 5,10 60\n" >/dev/null
read BX BY < <(px 10,10,5); read EX EY < <(px 25,10,0); echo "edge $BX $BY empty $EX $EY"
FULL=0,0,2560,1440
$A click "$EX" "$EY" left >/dev/null; sleep 0.8; esc
typ "_MASSPROP"; hover "$EX" "$EY"; shot d08-a0-typed $FULL; typ "\n"; sleep 1
hover $((BX-20)) "$BY"; hover "$BX" "$BY"; shot d08-a1-select $FULL
$A click "$BX" "$BY" left >/dev/null; sleep 1; typ "\n"; sleep 2; hover "$EX" "$EY"; shot d08-a2-report $FULL
typ "\e"; sleep 1.5; shot d08-b-escape $FULL
typ "_MASSPROP\n"; sleep 1; hover "$BX" "$BY"; $A click "$BX" "$BY" left >/dev/null; sleep 1; typ "\n"; sleep 2
hover "$EX" "$EY"; $A click "$EX" "$EY" right >/dev/null; sleep 1.5; shot d08-c-right $FULL
esc; sleep 1; $A com hist 60
