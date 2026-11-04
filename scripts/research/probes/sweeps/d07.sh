#!/usr/bin/env bash
# d07 (SLP-03, PPL-02, PPL-03 on the desktop): PRESSPULL's pick answered through COM, the mouse only
# parked (es-ES, plan, ZOOM C 20,10 60, OSMODE 4133 untouched). RECTANG 0,0 10,10 and a circle
# 30,5 r 3. The cursor parked over 40,20 (nothing) before each run, so a pick read from it shows.
#   a) `5,5` typed, then 3, Enter: is the rectangle pulled? LASTPOINT; the solids counted; U.
#   b) `7` typed (a bare number), Enter.  c) `30,5` (inside the circle), 2, Enter.
#   d) `_M`, `40,20` (nothing), Enter, Enter: what a failed pick after Multiple says.
#   e) `@` typed (LASTPOINT 5,5 set first). The history of each read with `com hist`.
source "$(dirname "$0")/lib.sh"
defs
cnt() { $A com eval '(list (if (setq s (ssget "_X" (quote ((0 . "3DSOLID"))))) (sslength s) 0))'; }
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 20,10 60\n" >/dev/null
$A com send "_RECTANG 0,0 10,10\n" >/dev/null; $A com send "_CIRCLE 30,5 3\n" >/dev/null
park() { $A click $(px 40,20,0) none >/dev/null; sleep 0.5; }
run() { echo "== $1"; park; $A com send "$2" >/dev/null; sleep 1; $A com hist 9 | grep -v '^Lines\|^History\|MPHIST'
  echo "solids $(cnt) lastpoint $($A com eval '(getvar "LASTPOINT")')"; }
run a "_PRESSPULL\n5,5\n3\n\n"; $A com send "_U\n" >/dev/null
run b "_PRESSPULL\n7\n\n"
run c "_PRESSPULL\n30,5\n2\n\n"; $A com send "_U\n" >/dev/null
run d "_PRESSPULL\n_M\n40,20\n\n\n"
$A com eval '(setvar "LASTPOINT" (list 5.0 5.0 0.0))' >/dev/null
run e "_PRESSPULL\n@\n3\n\n"; $A com send "_U\n" >/dev/null
