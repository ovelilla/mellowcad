#!/usr/bin/env bash
# d06: the look of gripped regions for the browser's comparison (plan, ZOOM C 50,0 120): a region
# of RECTANG 0,0 40,20 and one of a circle 70,10 r 10, both selected by sssetfirst: d06-1.
source "$(dirname "$0")/lib.sh"
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_RECTANG 0,0 40,20\n" >/dev/null; $A com send "_CIRCLE 70,10 10\n" >/dev/null
$A com send "_REGION _ALL \n" >/dev/null
$A com eval '(progn (sssetfirst nil (ssget "_X")) 1)' >/dev/null
$A click 3839 868 none >/dev/null; sleep 1; shot d06-1 3250,400,1100,450
