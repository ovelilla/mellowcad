#!/usr/bin/env bash
# d08: the grips of a BOX and a WEDGE turned 180 (drawn towards a smaller X, PBX-01's fix), by COM
# and MellowProbe only (en-US, -VIEW _SWISO): MPGRIPDATA 2 lists them, MPGRIPDRAG drags one on a
# fresh object (solid/g01.sh's way), LIST reads it back.
# Seen: the box's grips 0 -5,10,0; 1 0,0,0; 2 -10,0,0; 3 -10,20,0; 4 0,20,0; 5 0,10,0; 6 -10,10,0;
# 7 -5,0,0; 8 -5,20,0; 9 -5,10,5; 10 -5,10,-0.1; the wedge's the same about 15,10 with 9 and 10 at
# 20,10 (its tall end); each drag moves the face or corner it sits on.
source "$(dirname "$0")/lib.sh"
drag() {
  local make=$1; shift
  for d in "$@"; do
    set -- $d
    $A com send "_ERASE _ALL \n$make\n" >/dev/null
    $A com send "MPGRIPDRAG\nL\n$1\n$2\n" >/dev/null
    $A com send "_LIST\n_L\n\n" >/dev/null
    echo "== grip $1 by $2"; $A com hist 14 | grep -i 'position\|length\|width\|height\|rotation\|normal'
  done
}
esc; $A com send "_-VIEW _SWISO\n" >/dev/null
$A com send "_ERASE _ALL \n_BOX 0,0,0 -10,20 5 _WEDGE 20,0,0 10,20 5 \n" >/dev/null
$A com send "MPGRIPDATA\n2\n" >/dev/null
$A com hist 30 | grep -o '"GripPoint":\[[^]]*\]'
drag "_BOX 0,0,0 -10,20 5" "1 2,3,0" "2 -2,0,0" "5 2,0,0" "6 -2,0,0" "7 0,-2,0" "8 0,2,0" "9 0,0,3" "10 0,0,-2"
drag "_WEDGE 20,0,0 10,20 5" "1 2,3,0" "5 2,0,0" "6 -2,0,0" "7 0,-2,0" "9 0,0,3" "10 0,0,-2"
