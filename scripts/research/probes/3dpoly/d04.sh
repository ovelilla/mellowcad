#!/usr/bin/env bash
# d04 (TPL-03, es-ES): 3DPOLY's jig with two and three vertices given, the cursor away (is the chain
# the object, the band dashed?), a click on the last vertex again, Escape after three: kept?
OUT=research/probes/3dpoly/desk; source "$(dirname "$0")/../pedit/lib.sh"
defs
read X0 Y0 < <(px 0,0,0); read X1 Y1 < <(px 20,0,0); read X2 Y2 < <(px 20,15,0); read X3 Y3 < <(px 35,15,0)
CROP=$((X0-200)),$((Y2-250)),$((X3-X0+500)),$((Y0-Y2+450))
$A com send "_3DPOLY\n" >/dev/null &
sleep 2
clk $X0 $Y0; clk $X1 $Y1; hover $X2 $Y2; shot d04-1-two $CROP
clk $X2 $Y2; hover $X3 $Y3; shot d04-2-three $CROP
clk $X2 $Y2; hover $X3 $((Y3+40)); shot d04-3-last-again $CROP
esc; shot d04-4-escape $CROP
wait
$A com hist 12
$A com eval '(if (setq e (entlast)) (list (cdr (assoc 0 (entget e))) (length (vl-remove-if-not (quote (lambda (x) (= (car x) 0))) (list (entget e))))) "none")'
$A com eval '(progn (setq n 0 e (entnext (entlast))) (while (and e (= (cdr (assoc 0 (entget e))) "VERTEX")) (setq n (1+ n) e (entnext e))) n)'
