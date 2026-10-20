#!/usr/bin/env bash
# d02: with dynamic input on, what the command line (not the tooltip) makes of `10,0`, `#30,30`
# and `@5,0` at LINE's next point. COM's SendCommand types at the command line, so no keystroke
# reaches the tooltip. The profile's DYNMODE is read first and put back.
A=scripts/research/acad.sh
$A com new
before=$($A com get DYNMODE)
$A com netload
$A com set DYNMODE 3
$A com send "_LINE\n5,5\n10,0\n#30,30\n@5,0\n\n"
$A com hist 12
$A com dump
$A com set DYNMODE "$before"
$A com close
