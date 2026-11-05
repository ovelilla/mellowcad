#!/usr/bin/env bash
# d05 (VSD): the window's and the crossing's preview over shaded faces (es-ES), in d04's drawing
# (A and B, SW Iso): a click on empty space starts the window, the cursor held past A's far corner
# (window, left to right: A inside) and then a crossing from the right over A's faces only.
source "$(dirname "$0")/lib.sh"
sel() { $A com eval '(if (setq s (ssget "_I")) (list (sslength s) (cdr (assoc 5 (entget (ssname s 0))))) "none")'; }
defs; read TX TY < <(px 5,5,10); echo "top $TX $TY"
CROP=$((TX-450)),$((TY-330)),1000,700
for s in H C; do
  $A com send "_VSCURRENT _$s\n" >/dev/null; sleep 2; esc
  hover $((TX-260)) $((TY-150)); $A click $((TX-260)) $((TY-150)) left >/dev/null; sleep 0.8
  hover $((TX+250)) $((TY+360)); sleep 1; shot "d05-$s-a-window" $CROP
  $A click $((TX+250)) $((TY+360)) left >/dev/null; sleep 1; echo "$s window $(sel)"; esc
  hover $((TX+300)) $((TY+200)); $A click $((TX+300)) $((TY+200)) left >/dev/null; sleep 0.8
  hover $((TX-60)) $((TY+60)); sleep 1; shot "d05-$s-b-crossing" $CROP
  $A click $((TX-60)) $((TY+60)) left >/dev/null; sleep 1; echo "$s crossing $(sel)"; esc
done
