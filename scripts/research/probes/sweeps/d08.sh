#!/usr/bin/env bash
# d08: PRESSPULL with the owner's mouse (es-ES, plan, ZOOM C 25,5 60, OSMODE 4133 → 0, put back;
# the command line shown). RECTANG 0,0 10,10; four LINEs bounding 20,0 30,10; BOX 40,0,0 50,10,5.
# Each case starts at Command:, ends there, its history read after (`com hist`), the solids counted.
#   a) a click on the rectangle's side (0,5), 3.   b) inside it (5,5), 3.
#   c) inside the lines (25,5), 3.                 d) on the box's top (45,5), 2.
#   e) on nothing (60,20), Esc.                    f) `_M`, nothing (60,20), the rectangle's side,
#      the box's top, Enter, 3: one line for both?
#   g) the side, then FOO, 0 and Enter at the height.
#   h) `_M`, the side, Esc.                         i) Ctrl+click on the box's top, 1.
#   j) d06-like shots: the cursor over the rectangle's inside and the box's top at the pick prompt
#      without Ctrl (d08-j1, d08-j2): a hover highlight?  Each case undone after (U).
source "$(dirname "$0")/lib.sh"
defs
cnt() { $A com eval '(list (if (setq s (ssget "_X" (quote ((0 . "3DSOLID"))))) (sslength s) 0))'; }
$A com set OSMODE 0 >/dev/null
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 25,5 60\n" >/dev/null
$A com send "_RECTANG 0,0 10,10\n" >/dev/null
$A com send "_LINE 20,0 30,0 30,10 20,10 _C\n" >/dev/null
$A com send "_BOX 40,0,0 50,10,5\n" >/dev/null; $A com send "_COMMANDLINE\n" >/dev/null
PS=$(px 0,5,0); PI=$(px 5,5,0); PA=$(px 25,5,0); PB=$(px 45,5,5); PN=$(px 60,20,0); PP=$(px 70,-15,0)
hist() { sleep 1.5; echo "-- $1"; $A com hist "${2:-8}" | grep -v '^Lines\|^History\|MPHIST'; echo "solids $(cnt)"; }
focus() { $A click $PP left >/dev/null; sleep 0.5; esc; typ "_PRESSPULL\n"; sleep 1; }
ck() { $A click $1 $2 left ${3:-1} ${4:-} >/dev/null; sleep 1; }
focus; ck $PS; typ "3\n\n"; hist a; $A com send "_U\n" >/dev/null
focus; ck $PI; typ "3\n\n"; hist b; $A com send "_U\n" >/dev/null
focus; ck $PA; typ "3\n\n"; hist c; $A com send "_U\n" >/dev/null
focus; ck $PB; typ "2\n\n"; hist d; $A com send "_U\n" >/dev/null
focus; ck $PN; esc; hist e 6
focus; typ "_M\n"; ck $PN; ck $PS; ck $PB; typ "\n3\n\n"; hist f 12; $A com send "_U\n" >/dev/null
focus; ck $PS; typ "FOO\n0\n\n"; esc; hist g 10; $A com send "_U\n" >/dev/null
focus; typ "_M\n"; ck $PS; esc; hist h 6
focus; ck $PB 1 ctrl; typ "1\n\n"; hist i; $A com send "_U\n" >/dev/null
focus; hover $PI; shot d08-j1 $VX,$VY,2560,1177; hover $PB; shot d08-j2 $VX,$VY,2560,1177; esc
$A com send "_U\n" >/dev/null; $A com hist 4 | grep -v '^Lines\|^History\|MPHIST'
$A com set OSMODE 4133 >/dev/null
