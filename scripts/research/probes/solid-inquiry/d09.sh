#!/usr/bin/env bash
# d09 (VSD): MASSPROP's Escape and right button at `Write analysis`, typed with the profile's
# dynamic input (es-ES), d08's box in a drawing of its own, kept left of the text window MASSPROP
# opens. Each run: `_MASSPROP` typed, the box's left edge clicked, Enter; the screen shot (pager?),
# Enter to pass `Pulse INTRO para continuar:`, the screen shot at `Write analysis` with the cursor
# on the drawing; then b) Escape, or c) the right button on empty space (its menu shot, then Escape).
source "$(dirname "$0")/lib.sh"
$A com new >/dev/null; $A com netload >/dev/null; defs
$A com send "_BOX 0,0,0 10,20,5\n" >/dev/null; $A com send "_ZOOM _C 40,10 60\n" >/dev/null
read BX BY < <(px 0,10,5); read EX EY < <(px 10,30,0); echo "edge $BX $BY empty $EX $EY"
FULL=0,0,2560,1440
run() {
  $A com send "_GRAPHSCR\n" >/dev/null
  $A click "$EX" "$EY" left >/dev/null; sleep 0.8; esc
  typ "_MASSPROP\n"; sleep 1; hover $((BX+15)) "$BY"; hover "$BX" "$BY"
  $A click "$BX" "$BY" left >/dev/null; sleep 1; typ "\n"; sleep 2; hover "$EX" "$EY"; shot "d09-$1-1-report" $FULL
  typ "\n"; sleep 1.5; hover $((EX+5)) "$EY"; shot "d09-$1-2-write" $FULL
}
run b; typ "\e"; sleep 1.5; shot d09-b-3-escape $FULL
run c; $A click "$EX" "$EY" right >/dev/null; sleep 1.5; shot d09-c-3-right $FULL; esc; sleep 1
$A com send "_GRAPHSCR\n" >/dev/null; $A com hist 70
