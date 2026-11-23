#!/usr/bin/env bash
# x048.sh [-b] [-s] n…: where AutoCAD 2027's R12 stops writing a hatch's R14_HATCH_DATA
# (23/11/2026). For each n, a closed polyline of n vertices (-b: every segment bulged) hatched
# ANSI31 (-s: a solid fill), not associative, and saved as R12 (x048-<n>[b][s].dxf): prints n and
# whether the reference still carries R14_HATCH_DATA. AutoCAD takes the polyline as n line edges
# (bulged, n arc edges). An object's xdata holds 16383 bytes at most: 410 line edges fit and 411 do
# not, 314 arc edges fit and 315 do not, which is every group as its code in one byte and its
# value (a real 8, an integer 2 or 4, a point 24, a string 3 and its length, a brace 1) and 10 for
# each application. Past it AutoCAD writes the HATCH group alone (pattern, scale, angle), which
# CONVERT cannot turn back into a hatch.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
bulge=
pattern=$'ANSI31\n5\n0' solid=
[[ $1 == -b ]] && { bulge=' (cons 42 0.1)'; shift; }
[[ $1 == -s ]] && { pattern=_S solid=s; shift; }
D=/mnt/c/Users/oveli/AppData/Local/Temp/mcaddxf/r12
W='C:\Users\oveli\AppData\Local\Temp\mcaddxf\r12'
tmp=$(mktemp -d)
for n in "$@"; do
  (
    name=x048-$n${bulge:+b}$solid
    rm -f "$D/$name.dxf"
    cat > "$tmp/$n.txt" <<P
(progn (setq l (list '(0 . "LWPOLYLINE") '(100 . "AcDbEntity") '(100 . "AcDbPolyline") '(90 . $n) '(70 . 1)) i 0) (repeat $n (setq a (* i (/ (* 2 pi) $n)) l (append l (list (list 10 (* 100 (cos a)) (* 100 (sin a)))$bulge))) (setq i (1+ i))) (entmake l) (princ))
_ZOOM
_E
_-HATCH
_P
$pattern
_A
_A
_N

_S
_L


_DXFOUT
$W\\$name.dxf
_V
R12
16
P
    ACC_TIMEOUT=25 scripts/research/runacc.sh "$tmp/$n.txt" en-US > /dev/null 2>&1
    echo "$n $(grep -c R14_HATCH_DATA "$D/$name.dxf")"
  ) &
done
wait
rm -rf "$tmp"
