#!/usr/bin/env bash
# d01 (PSD, PEDIT, es-ES): the rollover at `Select polyline or [Multiple]:`, Edit vertex's X, Move's
# band, Escape at Move (does PEDIT end; is a Move made before kept?), Insert's band, Escape at Edit
# vertex's own prompt. A PLINE 0,0 20,0 20,15 40,15.
source "$(dirname "$0")/lib.sh"
wipe
$A com eval '(progn (command "_.PLINE" "0,0" "20,0" "20,15" "40,15" "") (command "_.ZOOM" "_W" "-10,-10" "60,40") "drawn")' >/dev/null
defs
read XA YA < <(px 10,0,0); read XV YV < <(px 0,0,0); read XB YB < <(px 6,9,0); read XC YC < <(px 30,6,0); read XD YD < <(px 20,7,0)
CROP=$((XV-250)),$((YV-500)),1300,700
pedit() { focus; $A com send "_PEDIT\n" >/dev/null & sleep 2; }
pedit; hover $XA $YA; shot d01-1-rollover $CROP
clk $XA $YA; typ '_E\n'; hover $XB $YB; shot d01-2-x $CROP
typ '_M\n'; hover $XB $YB; shot d01-3-move-band $CROP
esc; shot d01-4-move-escaped $CROP
wait; $A com hist 14
pedit; clk $XA $YA; typ '_E\n'; typ '_M\n'; clk $XB $YB; typ '_N\n'; typ '_I\n'; hover $XC $YC; shot d01-5-insert-band $CROP
esc; shot d01-6-insert-escaped $CROP
wait; $A com hist 14
$A com eval '(vl-remove-if-not (quote (lambda (x) (= (car x) 10))) (entget (entlast)))'
pedit; clk $XD $YD; typ '_E\n'; typ '_N\n'; esc; shot d01-7-vertex-escaped $CROP
wait; $A com hist 10
