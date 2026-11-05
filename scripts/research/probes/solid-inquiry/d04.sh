#!/usr/bin/env bash
# d04 (VSD): picking and highlights over shaded faces (es-ES), in Hidden then Conceptual. p314's
# boxes, A 0,0,0–10,10,10 in front of B 15,15,0–25,25,10, SW Iso. a) the cursor over A's top face
# (rollover); b) a click there at Comando: (what is selected, its look, its grips); c) a click on
# B's edge at 17,15,0 where A hides it (VST-02 by mouse); d) a window from left to right over A
# only, held open (its preview); e) Ctrl held over A's top face, then Ctrl+click (sub-object).
source "$(dirname "$0")/lib.sh"
DR() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w scripts/research/probes/erase/drag.ps1)" "$@" | tr -d '\r'; }
sel() { $A com eval '(if (setq s (ssget "_I")) (list (sslength s) (cdr (assoc 5 (entget (ssname s 0))))) "none")'; }
$A com new >/dev/null; $A com netload >/dev/null; defs
$A com send "_BOX 0,0,0 10,10,10\n" >/dev/null; echo "A $($A com eval '(cdr (assoc 5 (entget (entlast))))')"
$A com send "_BOX 15,15,0 25,25,10\n" >/dev/null; echo "B $($A com eval '(cdr (assoc 5 (entget (entlast))))')"
$A com send "_-VIEW _SWISO\n" >/dev/null
$A com send "_ZOOM _C 10,10,5 45\n" >/dev/null
read TX TY < <(px 5,5,10); read HX HY < <(px 17,15,0); read EX EY < <(px -15,25,0); read FX FY < <(px 12,-12,0)
read B1X B1Y < <(px 25,25,10)
echo "top $TX $TY hidden-edge $HX $HY empty $EX $EY far $FX $FY"
CROP=$((TX-450)),$((TY-330)),1000,700
for s in H C; do
  $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2
  hover "$EX" "$EY"; hover "$TX" "$TY"; sleep 1; shot "d04-$s-a-rollover" $CROP
  $A click "$TX" "$TY" left >/dev/null; sleep 1.2; hover "$EX" "$EY"; shot "d04-$s-b-selected" $CROP; echo "$s b $(sel)"
  esc; hover "$((HX-3))" "$HY"; hover "$HX" "$HY"; shot "d04-$s-c0-hover-hidden-edge" $CROP
  $A click "$HX" "$HY" left >/dev/null; sleep 1.2; echo "$s c $(sel)"; hover "$EX" "$EY"; shot "d04-$s-c-hidden-edge" $CROP; esc
  DR down "$EX" $((EY-200)); sleep 0.3; DR move $((TX+200)) $((TY+260)); sleep 0.3; DR move $((TX+201)) $((TY+261)); sleep 1
  shot "d04-$s-d-window" $CROP; DR up $((TX+201)) $((TY+261)); sleep 1; echo "$s d $(sel)"; shot "d04-$s-d2-after" $CROP; esc
  hover "$EX" "$EY"; ctrl down; hover "$TX" "$TY"; sleep 1; shot "d04-$s-e-ctrl-hover" $CROP
  $A click "$TX" "$TY" left >/dev/null; sleep 1.2; ctrl up; hover "$EX" "$EY"; shot "d04-$s-e2-ctrl-click" $CROP; echo "$s e $(sel)"; esc
done
$A com send "_VSCURRENT _2\n" >/dev/null
