#!/usr/bin/env bash
# d01 (RGD-02's series, SWEEPS-D68): where a partial curved face draws its rulings, through COM and
# shots alone (es-ES, 2D Wireframe; ISOLINES read 8 in the profile's new drawing, set to $1 here
# and put back to 8 by the caller). Each case alone in the drawing, axis along Z, r 10, z 0..20,
# seen in Front (-VPOINT 0,-1,0) and Right (1,0,0) at ZOOM C 0,0,10 30: the vertical lines' screen
# columns give each ruling's x and y (lines.py in the session's scratchpad, 39.2 px a unit).
#   c1 CYLINDER whole; c2 REVOLVE of RECTANG 0,0 10,20 drawn in UCS X 90, 180° about Z;
#   c3 CYLINDER minus a box over x < 0; c4 over y < 0; c5 SLICE at YZ keeping x > 0;
#   c6 EXTRUDE of a half disc x > 0 (PLINE arc from 0,-10 about 0,0 to 0,10, closed);
#   c7 c2 UNION a box far away (50,50,0 60,60,10); c8 c2's curved face offset 2 by SOLIDEDIT
#   (picked at 0,10,10 seen from Back); c8b its flat face at y = 0 offset 2 (picked at 0,0,10
#   from Front: the curved face runs on to y = -2); a<deg> c2's profile turned <deg>.
# Usage: d01.sh <isolines> [cases...]
source "$(dirname "$0")/lib.sh"
N=${1:-4}; shift; CASES=${*:-c1 c2 c3 c4 c5 c6 c7 c8}
hd() { $A com eval '(cdr (assoc 5 (entget (entlast))))' | tr -d '"'; }
rev() {
  $A com send "_UCS _X 90\n" >/dev/null; $A com send "_RECTANG 0,0 10,20\n" >/dev/null
  $A com send "_UCS _W\n" >/dev/null; $A com send "_REVOLVE _L \n0,0,0 0,0,1 ${1:-180}\n" >/dev/null
}
build() {
  $A com send "_ERASE _ALL \n" >/dev/null
  case $1 in
    c1) $A com send "_CYLINDER 0,0,0 10 20\n" >/dev/null ;;
    c2) rev ;;
    c3|c4) $A com send "_CYLINDER 0,0,0 10 20\n" >/dev/null; C=$(hd)
       if [ "$1" = c3 ]; then $A com send "_BOX -20,-20,-1 0,20,21\n" >/dev/null
       else $A com send "_BOX -20,-20,-1 20,0,21\n" >/dev/null; fi; B=$(hd)
       $A com send "_SUBTRACT (handent \"$C\") \n(handent \"$B\") \n" >/dev/null ;;
    c5) $A com send "_CYLINDER 0,0,0 10 20\n" >/dev/null
       $A com send "_SLICE _L \n_YZ 0,0,0 10,0,0\n" >/dev/null ;;
    c6) $A com send "_PLINE 0,-10 _A _CE 0,0 0,10 _L _C\n" >/dev/null
       $A com send "_EXTRUDE _L \n20\n" >/dev/null ;;
    c7) rev; R=$(hd); $A com send "_BOX 50,50,0 60,60,10\n" >/dev/null; B=$(hd)
       $A com send "_UNION (handent \"$R\") (handent \"$B\") \n" >/dev/null ;;
    c8) rev; $A com send "_-VPOINT 0,1,0\n" >/dev/null; $A com send "_ZOOM _C 0,0,10 30\n" >/dev/null
       $A com send "_SOLIDEDIT _F _O 0,10,10\n\n2\n_X _X\n" >/dev/null ;;
    c8b) rev; $A com send "_-VPOINT 0,-1,0\n" >/dev/null; $A com send "_ZOOM _C 0,0,10 30\n" >/dev/null
       $A com send "_SOLIDEDIT _F _O 0,0,10\n\n2\n_X _X\n" >/dev/null ;;
    a*) rev "${1#a}" ;;
  esac
}
$A com set ISOLINES "$N" >/dev/null
for c in $CASES; do
  build "$c"
  for v in "0,-1,0 F" "1,0,0 R"; do set -- $v
    $A com send "_-VPOINT $1\n" >/dev/null; $A com send "_ZOOM _C 0,0,10 30\n" >/dev/null
    sleep 1; shot "d01-$N-$c-$2" $VX,$VY,2560,1177 >/dev/null
  done
  echo "$c $($A com eval '(list (sslength (ssget "_X")))')"
done
