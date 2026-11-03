#!/usr/bin/env bash
# d03 d: the grip of a turned composite. d03's solid turned 30° about X through 0,0,0 (ROTATE3D),
# then about Z 30° through 0,0,0; the grip seen in Front (d03-6) and Top (d03-7), against the
# WCS bounding box printed. U twice after.
source "$(dirname "$0")/lib.sh"
$A com send "_ROTATE3D _ALL \n_X 0,0,0 30\n" >/dev/null
$A com send "_ROTATE3D _ALL \n_Z 0,0,0 30\n" >/dev/null
$A com eval '(progn (vl-load-com) (vla-getboundingbox (vlax-ename->vla-object (entlast)) (quote a) (quote b)) (list (vlax-safearray->list a) (vlax-safearray->list b)))'
for v in "0,-1,0 d03-6" "0,0,1 d03-7"; do set -- $v
  $A com send "_-VPOINT $1\n" >/dev/null; $A com send "_ZOOM _E\n" >/dev/null; $A com send "_ZOOM 0.8x\n" >/dev/null
  $A com eval '(progn (sssetfirst nil (ssget "_X")) 1)' >/dev/null; sleep 1; shot $2 2560,182,2560,1177
done
