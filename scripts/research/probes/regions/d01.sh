#!/usr/bin/env bash
# d01 (REGIONS-D71): a preselection, then REGION, UNION and SUBTRACT through COM; MOVE as the
# control in the same drawing (es-ES, OSMODE 4133 untouched, ZOOM C 50,0 120). Two circles
# 20,25 and 35,25 r 10; (sssetfirst nil (ssget "_X")) before each command; the counts after each
# by (ssget "_X" '((0 . "REGION"))). Then the same preselection gripped, REGION typed: the shot
# shows whether the grips stay.
source "$(dirname "$0")/lib.sh"
cnt() { $A com eval "(list (if (setq s (ssget \"_X\" '((0 . \"$1\")))) (sslength s) 0))"; }
sel() { $A com eval '(progn (sssetfirst nil (ssget "_X")) (sslength (cadr (ssgetfirst))))'; }
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_CIRCLE 20,25 10\n" >/dev/null; $A com send "_CIRCLE 35,25 10\n" >/dev/null
echo "control MOVE"; sel; $A com send "_MOVE\n0,0\n0,1\n" >/dev/null
$A com eval '(cdr (assoc 10 (entget (entlast))))'
echo "REGION"; sel; $A com send "_REGION\n\n" >/dev/null; cnt REGION; cnt CIRCLE
$A com send "_REGION _ALL \n" >/dev/null; cnt REGION
echo "UNION"; sel; $A com send "_UNION\n\n" >/dev/null; cnt REGION
echo "SUBTRACT"; sel; $A com send "_SUBTRACT\n\n" >/dev/null; cnt REGION
$A com hist 40
# Typed: the command line shown, a click on nothing for the focus (then Esc), the preselection
# gripped, a shot; REGION typed, a shot; Esc. d01-1 before, d01-2 at REGION's Select objects:.
$A com send "_COMMANDLINE\n" >/dev/null
$A click 3839 868 left >/dev/null; sleep 0.5; esc
sel; sleep 1; shot d01-1 2560,0,2560,1440
typ "_REGION\n"; sleep 1; shot d01-2 2560,0,2560,1440; esc
$A com eval '(list (ssgetfirst))'
