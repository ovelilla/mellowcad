#!/usr/bin/env bash
# d11 (VSD): the en-US pass (launch "" en-US; AutoCAD on the second monitor, the view at
# 2560,182, 2156 wide): a) the rollover's tooltip over a box in Conceptual; b) MASSPROP typed, the
# box clicked, Enter, the pager's Enter, the right button at `Write analysis` (its menu), Escape.
source "$(dirname "$0")/lib.sh"
$A com netload >/dev/null; defs
$A com send "_BOX 0,0,0 10,10,10\n" >/dev/null; $A com send "_-VIEW _SWISO\n" >/dev/null
$A com send "_ZOOM _C 5,5,5 40\n" >/dev/null; $A com send "_VSCURRENT _C\n" >/dev/null
read TX TY < <(px 5,5,10); read EX EY < <(px -12,5,0); echo "top $TX $TY empty $EX $EY"
SCR=2560,0,2560,1440
$A click "$EX" "$EY" left >/dev/null; sleep 0.8; esc
hover "$EX" "$EY"; hover "$TX" "$TY"; sleep 1.5; shot d11-a-rollover $((TX-300)),$((TY-200)),700,450
typ "MASSPROP\n"; sleep 1; hover $((TX+12)) "$TY"; hover "$TX" "$TY"; $A click "$TX" "$TY" left >/dev/null; sleep 1
typ "\n"; sleep 2; hover "$EX" "$EY"; shot d11-b1-report $SCR
typ "\n"; sleep 1.5; hover "$EX" "$EY"; $A click "$EX" "$EY" right >/dev/null; sleep 1.5; shot d11-b2-right $SCR
esc; sleep 1; $A com send "_GRAPHSCR\n" >/dev/null; $A com send "_VSCURRENT _2\n" >/dev/null
$A com hist 40 | grep -v "^\s\+[XYZIJK]:\|^\s*$" | tail -14
