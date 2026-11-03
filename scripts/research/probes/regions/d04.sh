#!/usr/bin/env bash
# d04 a: MATCHPROP onto and from a region, through COM, the objects by handle (es-ES). R1 a region
# of a circle 20,26 r 10 on L1, colour 1, LW 0.50; LN a line 50,10 60,30 on L2, colour 5,
# thickness 3; R2 a region of a circle 80,25 r 5 on 0. R1 → LN and R2, the props read (8 62 370
# 39); U; LN → R2, read. CLAYER stays 0.
source "$(dirname "$0")/lib.sh"
props() { $A com eval "(mapcar '(lambda (h / e) (setq e (entget (handent h))) (list h (cdr (assoc 0 e)) (cdr (assoc 8 e)) (cdr (assoc 62 e)) (cdr (assoc 370 e)) (cdr (assoc 39 e)))) (list \"$R1\" \"$LN\" \"$R2\"))"; }
hd() { $A com eval '(cdr (assoc 5 (entget (entlast))))' | tr -d '"'; }
$A com send "_ERASE _ALL \n" >/dev/null; $A com send "_-LAYER _N L1,L2\n\n" >/dev/null
$A com send "_CIRCLE 20,26 10\n" >/dev/null; $A com send "_REGION _L \n" >/dev/null; R1=$(hd)
$A com send "_LINE 50,10 60,30 \n" >/dev/null; LN=$(hd)
$A com send "_CIRCLE 80,25 5\n" >/dev/null; $A com send "_REGION _L \n" >/dev/null; R2=$(hd)
$A com send "_CHPROP (handent \"$R1\") \n_LA L1\n_C 1 _LW 0.5 \n" >/dev/null
$A com send "_CHPROP (handent \"$LN\") \n_LA L2\n_C 5 _T 3 \n" >/dev/null
echo "before"; props
$A com send "_MATCHPROP (handent \"$R1\") (handent \"$LN\") (handent \"$R2\") \n" >/dev/null
echo "R1 onto LN, R2"; props; $A com send "_U\n" >/dev/null
$A com send "_MATCHPROP (handent \"$LN\") (handent \"$R2\") \n" >/dev/null
echo "LN onto R2"; props; $A com send "_U\n" >/dev/null
$A com hist 30 > research/probes/regions/desk/d04-hist.txt
