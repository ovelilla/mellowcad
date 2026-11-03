#!/usr/bin/env bash
# d06: what an Escape halfway keeps (en-US, DYNMODE 0 typed, OSMODE 0, d03's view): U after a BOX
# cancelled at its second prompt, with a LINE before it; PYRAMID's Sides, CONE's top radius,
# CYLINDER's radius and BOX's length answered and then cancelled, read as the next run's default.
# Seen: U echoes BOX, the line kept; the next run offers 4 sides, <0.0000>, <2.0000> and <10.0000>:
# nothing answered in a cancelled run is kept.
source "$(dirname "$0")/lib.sh"
go() { esc; $A click 3300 950 left >/dev/null; esc; typ "$1"; $A key esc >/dev/null; sleep 1; }
esc; $A com send "_ERASE _ALL \n_LINE 0,0 10,10 \n\n" >/dev/null
go "_BOX\n0,0,0\n"
esc; typ "_U\n"; $A com eval '(sslength (ssget "_X"))'
go "_PYRAMID\n_S\n6\n"
go "_PYRAMID\n"
go "_CONE\n0,0,0\n5\n_T\n2\n"
go "_CONE\n0,0,0\n5\n_T\n"
go "_CYLINDER\n0,0,0\n7\n"
go "_CYLINDER\n0,0,0\n"
go "_BOX\n0,0,0\n_L\n12\n"
go "_BOX\n0,0,0\n_L\n"
$A com hist 200 | grep -v 'MPHIST\|^Lines\|^History file\|^Command:\s*$\|opposite corner\|^Command: \*Cancel\*$' | tail -40
