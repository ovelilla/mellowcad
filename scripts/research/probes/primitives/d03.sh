#!/usr/bin/env bash
# d03: BOX's other corner, length and width with the mouse, in plan (en-US, OSMODE 0; -VIEW _TOP,
# ZOOM C 5,0,0 60: 0,0,0 at 3539,770, 19.62 px a unit), DYNMODE 0 typed (a COM `DYNMODE 0` does
# not hold: SendCommand puts it back) and 3 again at the end. The width's side with the cursor
# exactly on the length's line (SNAPMODE 1, SNAPUNIT 1, put back to 0), Ortho (ORTHOMODE 1, put
# back to 0) at the other corner, the length and the width, `<30` and a bare number at the other
# corner. Each box read with LIST.
# A first run with dynamic input still on (a COM DYNMODE 0 did not hold): c) `10` was the box's
# length, the width the cursor's (10 by 5.0467). Seen: a) 9.7409 x 5.6239 on the 30° line; b)
# 8.6603,5; c) 8.9408,4.4790 (a direct distance), c2) 10,0.0338; d) 10.0742,6.0663 (Ortho not
# applied); e) length 10.0742 along X, width 6.0663; e3) along X, +Y; f) the cursor at 15,0: -Y; at
# 5,0 and -5,0: +Y.
source "$(dirname "$0")/lib.sh"
list() { esc; $A com send "_LIST _L \n" >/dev/null; $A com hist 16 | grep -i 'length\|width\|position\|rotation\|height'; }
start() { # $1 typed
  esc; $A com send "_ERASE _ALL \n" >/dev/null; $A click 3300 950 left >/dev/null; esc; typ "$1"
}
pick() { hover "$1" "$2"; [ -n "$3" ] && shot "$3" 3200,400,900,700; $A click $(($1 + 1)) "$2" left >/dev/null; sleep 1.2; }
look() { hover "$1" "$2"; [ -n "$3" ] && shot "$3" 3200,400,900,700; }
$A click 3300 950 left >/dev/null; esc; typ "DYNMODE\n0\n"
echo "== a: <30 at the other corner, then a click at 10,5"
start "_BOX\n0,0,0\n<30\n"; pick 3736 672 d03-a; typ "5\n"; list
echo "== b: <30 at the other corner, then 10 typed, the cursor at 10,5"
start "_BOX\n0,0,0\n<30\n"; look 3736 672; typ "10\n5\n"; list
echo "== c: 10 typed at the other corner, the cursor at 10,5"
start "_BOX\n0,0,0\n"; look 3736 672 d03-c; typ "10\n5\n"; list
echo "== c2: 10 typed at the other corner, the cursor at 15,0"
start "_BOX\n0,0,0\n"; look 3834 770; typ "10\n5\n"; list
$A com set ORTHOMODE 1 >/dev/null
echo "== d: Ortho, the other corner clicked at 10,6"
start "_BOX\n0,0,0\n"; pick 3736 652 d03-d; typ "5\n"; list
echo "== e: Ortho, Length clicked at 10,3, the width at 12,6"
start "_BOX\n0,0,0\n_L\n"; pick 3736 711 d03-e; pick 3775 652 d03-e2; typ "5\n"; list
echo "== e3: Ortho, Length 10 typed toward 10,3, the width typed 6 with the cursor at 12,6"
start "_BOX\n0,0,0\n_L\n"; look 3736 711; typ "10\n"; look 3775 652 d03-e3; typ "6\n5\n"; list
$A com set ORTHOMODE 0 >/dev/null
$A com set SNAPMODE 1 >/dev/null
for p in "15 3834" "5 3638" "-5 3441"; do set -- $p
  echo "== f: Length 10 typed toward 15,0, width 6 typed with the cursor snapped at $1,0"
  start "_BOX\n0,0,0\n_L\n"; look 3834 770; typ "10\n"; look "$2" 770 "d03-f$1"; typ "6\n5\n"; list
done
$A com set SNAPMODE 0 >/dev/null
$A click 3300 950 left >/dev/null; esc; typ "DYNMODE\n3\n"
