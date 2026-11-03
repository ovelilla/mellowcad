#!/usr/bin/env bash
# d03: a composite solid's grips and Properties palette (es-ES). BOX 0,0,0 30,20,10 and CYLINDER
# 30,10,0 r 8 h 10, UNION; gripped by sssetfirst. d03-1 in plan (ZOOM C 15,10 60), d03-2 in SE
# Isometric (-VPOINT 1,-1,1, ZOOM E), d03-3 the palette (PROPERTIES, shot by its handle), then
# the same for a lone BOX (d03-4, d03-5) as the primitive's control. VSCURRENT stays 2D Wireframe.
source "$(dirname "$0")/lib.sh"
grip() { $A com eval '(progn (sssetfirst nil (ssget "_X")) 1)' >/dev/null; sleep 1; }
$A com send "_ERASE _ALL \n" >/dev/null
$A com send "_BOX 0,0,0 30,20,10\n" >/dev/null; $A com send "_CYLINDER 30,10,0 8 10\n" >/dev/null
$A com send "_UNION _ALL \n" >/dev/null
$A com send "_ZOOM _C 15,10 60\n" >/dev/null; grip; shot d03-1 2560,182,2560,1177
$A com send "_-VPOINT 1,-1,1\n" >/dev/null; $A com send "_ZOOM _E\n" >/dev/null; grip; shot d03-2 2560,182,2560,1177
# d03-3 in Front (-VPOINT 0,-1,0): the grip's Z. The bounding box printed for its centre.
$A com send "_-VPOINT 0,-1,0\n" >/dev/null; $A com send "_ZOOM _E\n" >/dev/null; grip; shot d03-3 2560,182,2560,1177
$A com eval '(progn (vl-load-com) (vla-getboundingbox (vlax-ename->vla-object (entlast)) (quote a) (quote b)) (list (vlax-safearray->list a) (vlax-safearray->list b)))'
