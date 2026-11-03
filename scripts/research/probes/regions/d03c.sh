#!/usr/bin/env bash
# d03 c: the composite's one grip made hot (plan, ZOOM C 15,10 60, OSMODE 0 then put back to 4133):
# a click on it, d03-5 at its prompt, @10,0 typed; the bounding box after (moved whole?); U.
source "$(dirname "$0")/lib.sh"
$A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 15,10 60\n" >/dev/null
$A com set OSMODE 0 >/dev/null
G=$(px 19,10,0); echo "grip $G"
$A com eval '(progn (sssetfirst nil (ssget "_X")) 1)' >/dev/null; sleep 1
$A click $G left >/dev/null; sleep 1; shot d03-5 2560,0,2560,1440
typ "@10,0\n"; sleep 1
$A com eval '(progn (vl-load-com) (vla-getboundingbox (vlax-ename->vla-object (entlast)) (quote a) (quote b)) (list (vlax-safearray->list a) (vlax-safearray->list b)))'
$A com hist 8; $A com send "_U\n" >/dev/null; $A com set OSMODE 4133 >/dev/null
