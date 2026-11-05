#!/usr/bin/env bash
# d10 (VSD): a) MASSPROP's dynamic input with DYNMODE 3 (the profile's -1 is off; typed, as COM's
# SendCommand hides dynamic input; put back with (setvar "DYNMODE" -1)): the cursor at `Select
# objects:` and at `Write analysis`; b) LASTPOINT after a click at `Select objects:` off the plan
# (SED-06's suspect): LASTPOINT set to 7,7,7, a box 0,0,0–10,10,10 in SW Iso clicked on its top
# front edge, the run ended, LASTPOINT read; MASSPROP, then LIST and ERASE (U) as controls (es-ES).
source "$(dirname "$0")/lib.sh"
$A com new >/dev/null; $A com netload >/dev/null; defs
$A com send "_BOX 0,0,0 10,10,10\n" >/dev/null; $A com send "_-VIEW _SWISO\n" >/dev/null
$A com send "_ZOOM _C 5,5,5 40\n" >/dev/null
$A com eval '(getvar "DYNMODE")'
read BX BY < <(px 5,0,10); read EX EY < <(px -12,5,0); echo "edge $BX $BY empty $EX $EY"
FULL=0,0,2560,1440
lp() { $A com eval '(getvar "LASTPOINT")'; }
start() { $A com send "_GRAPHSCR\n" >/dev/null; $A click "$EX" "$EY" left >/dev/null; sleep 0.8; esc; }
start; typ "DYNMODE\n"; typ "3\n"; sleep 0.5
typ "_MASSPROP\n"; sleep 1; hover $((EX+10)) "$EY"; shot d10-a1-select $((EX-200)),$((EY-150)),600,350
hover $((BX+12)) "$BY"; hover "$BX" "$BY"; $A click "$BX" "$BY" left >/dev/null; sleep 1; typ "\n"; sleep 2
typ "\n"; sleep 1.5; hover $((EX+5)) "$EY"; hover $((EX+10)) "$EY"; shot d10-a2-write $FULL; typ "\e"; sleep 1
$A com eval '(setvar "DYNMODE" -1)' >/dev/null; $A com eval '(getvar "DYNMODE")'
for c in _MASSPROP _LIST _ERASE; do
  start; $A com eval '(setvar "LASTPOINT" (list 7 7 7))' >/dev/null
  typ "$c\n"; sleep 1; hover $((BX+12)) "$BY"; hover "$BX" "$BY"; $A click "$BX" "$BY" left >/dev/null; sleep 1
  typ "\n"; sleep 2; esc; sleep 1; $A com send "_GRAPHSCR\n" >/dev/null; echo "$c $(lp)"
  [ "$c" = _ERASE ] && $A com send "_U\n" >/dev/null
done
$A com hist 30 | grep -v "^\s\+[XYZIJK]:"
