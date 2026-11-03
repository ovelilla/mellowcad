#!/usr/bin/env bash
# d02: SUBTRACT typed with picks (es-ES, after d01's drawing: circles 20,26 and 35,26 r 10, 80,25
# r 5, made regions). a) A picked at its left rim, Enter: d02-1 at the second prompt (is A still
# highlighted?); B picked at its right rim: d02-2; Esc: d02-3 and the count (nothing done?).
# b) A picked, Esc at the first set: d02-4. c) A, Enter, Esc at the empty second set: d02-5.
# The cursor parked on nothing (50,-10) before each shot, so no rollover shows.
source "$(dirname "$0")/lib.sh"
cnt() { $A com eval "(list (if (setq s (ssget \"_X\" '((0 . \"REGION\")))) (sslength s) 0))"; }
park() { $A click 3839 868 none >/dev/null; sleep 0.8; }
pick() { $A click $1 $2 left >/dev/null; sleep 0.8; }  # pixels computed before: COM is locked mid-command
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_CIRCLE 20,26 10\n" >/dev/null; $A com send "_CIRCLE 35,26 10\n" >/dev/null
$A com send "_CIRCLE 80,25 5\n" >/dev/null; $A com send "_REGION _ALL \n" >/dev/null; cnt
PA=$(px 10,26); PB=$(px 45,26); echo "A $PA B $PB"
$A click 3839 868 left >/dev/null; sleep 0.5; esc
typ "_SUBTRACT\n"; pick $PA; typ "\n"; park; shot d02-1 2560,0,2560,1440
pick $PB; park; shot d02-2 2560,0,2560,1440
esc; park; shot d02-3 2560,0,2560,1440; cnt
typ "_SUBTRACT\n"; pick $PA; park; esc; park; shot d02-4 2560,0,2560,1440; cnt
typ "_SUBTRACT\n"; pick $PA; typ "\n"; esc; park; shot d02-5 2560,0,2560,1440; cnt
$A com hist 40 > research/probes/regions/desk/d02-hist.txt
