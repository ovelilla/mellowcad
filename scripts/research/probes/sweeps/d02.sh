#!/usr/bin/env bash
# d02 (RGD-02's series, SWEEPS-D68): the meridians of a partial turn other than a cylinder's, seen
# in Top (-VPOINT 0,0,1, ZOOM C 0,0,10 30) where each is a radial line: their angles read on a
# circle of 6 units round the axis (radial.py in the session's scratchpad). Through COM and shots
# alone (es-ES, 2D Wireframe; ISOLINES set to $1, put back to 8 by the caller).
#   s<deg> a half disc of r 10 about 0,0,10 (drawn in UCS X 90) turned <deg> about Z: a sphere;
#   t<deg> a circle r 3 at 10,0,10 (UCS X 90) turned <deg>: a torus;
#   v<deg> p308's CV spline profile (10,0 14,3 12,7 16,10 closed by lines to 10,10 and 10,0, a
#   region; UCS X 90) turned <deg>: a surface of revolution beside a cylinder (x = 10).
#   w-ell, w-spl: r04's ellipse (centre 50,0 → 0,0 here: 15,0 axis end 20,0, ratio 2) and p308's
#   region turned whole about Z, shot in SE Isometric (-VPOINT 1,-1,1, ZOOM E): the seam drawn?
#   WV=0,0,1 shoots them in Top at the radial cases' zoom instead.
# Usage: d02.sh <isolines> [cases...]
source "$(dirname "$0")/lib.sh"
N=${1:-4}; shift; CASES=${*:-s180 s90 t180 v180}
inx() { $A com send "_UCS _X 90\n" >/dev/null; local x; for x in "$@"; do $A com send "$x\n" >/dev/null; done; $A com send "_UCS _W\n" >/dev/null; }
build() {
  $A com send "_ERASE _ALL \n" >/dev/null
  case $1 in
    s*) inx "_PLINE 0,0 _A _CE 0,10 0,20 _L _C"; A_=${1#s} ;;
    t*) inx "_CIRCLE 10,10 3"; A_=${1#t} ;;
    v*|w-spl) inx "_SPLINE _M _CV 10,0 14,3 12,7 16,10 " "_PLINE 16,10 10,10 10,0 " "_REGION _ALL "
       A_=${1#v} ;;
    w-ell) inx "_ELLIPSE _C 15,10 20,10 2"; A_=360 ;;
  esac
  [ "$1" = w-spl ] && A_=360
  $A com send "_REVOLVE _L \n0,0,0 0,0,1 $A_\n" >/dev/null
}
$A com set ISOLINES "$N" >/dev/null
for c in $CASES; do
  build "$c"
  case $c in
    w-*) if [ -n "$WV" ]; then $A com send "_-VPOINT $WV\n" >/dev/null; $A com send "_ZOOM _C 0,0,10 30\n" >/dev/null
         else $A com send "_-VPOINT 1,-1,1\n" >/dev/null; $A com send "_ZOOM _E\n" >/dev/null
           $A com send "_ZOOM 0.8x\n" >/dev/null; fi ;;
    *) $A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 0,0,10 30\n" >/dev/null ;;
  esac
  sleep 1; shot "d02-$N-$c" $VX,$VY,2560,1177 >/dev/null
  echo "$c $($A com eval '(list (sslength (ssget "_X")) (cdr (assoc 0 (entget (entlast)))))')"
done
