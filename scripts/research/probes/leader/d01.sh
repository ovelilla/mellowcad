#!/usr/bin/env bash
# d01 <culture> (12/11/2026, desktop launched for the probe and quit after it; no mouse: COM, UIA
# and PrintWindow). A leader with a hook and its MTEXT: its grips (selected with sssetfirst, the
# view captured) and its Properties palette (the object type and every row, read by UIA).
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
L=${1:-en-US}
OUT=${OUT:-/tmp}
if [ "${2:-}" != again ]; then
  $A launch "" "$L" >/dev/null
  for _ in $(seq 1 30); do sleep 3; $A com info 2>/dev/null | grep -q quiescent=True && break; done
fi
$A com new >/dev/null
$A com eval '(progn (setvar "OSMODE" 0) (command "_.LEADER" "0,0" "10,10" "" "Hook" "") (setq m (entlast)) (command "_.ZOOM" "_W" "-5,-5" "30,20") (princ))' >/dev/null
$A com eval '(progn (sssetfirst nil (ssadd (cdr (assoc 330 (member (quote (102 . "{ACAD_REACTORS")) (entget m)))))) (princ))' >/dev/null
sleep 2
$A shot
(timeout 15 $A com send "_PROPERTIES\n" >/dev/null 2>&1 &)
sleep 5
for w in $($A wins | awk -F'\t' '{print $1}'); do
  $A uia "$w" 2>/dev/null | grep -v '^\s*$' > "$OUT/d01-$L-$w.txt"
done
grep -l "Arrow\|Flecha\|Leader\|Directriz" "$OUT"/d01-"$L"-*.txt
