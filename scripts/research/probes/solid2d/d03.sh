#!/usr/bin/env bash
# d03 <culture> (12/11/2026): the 2D solid's object type in the Properties palette's combo, read
# by UIA, in each installed language (desktop launched for the probe and quit after it).
# Seen: en-US `Solid` (d01), es-ES `Sólido`, pt-BR `Sólido`, fr-FR `Solide`, it-IT `Solido`.
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
L=${1:?culture}
$A launch "" "$L" >/dev/null
for _ in $(seq 1 30); do sleep 3; $A com info 2>/dev/null | grep -q quiescent=True && break; done
$A com new >/dev/null
$A com eval '(progn (command "_.SOLID" "0,0" "10,0" "0,6" "10,6" "") (command "_.ZOOM" "_E") (sssetfirst nil (ssget "_L")) (princ))' >/dev/null
(timeout 15 $A com send "_PROPERTIES\n" >/dev/null 2>&1 &)
sleep 5
for w in $($A wins | awk -F'\t' '{print $1}'); do
  $A uia "$w" 2>/dev/null | awk -F'\t' '$4 == "ComboBox" && $3 == "32791" {print "'"$L"'\t" $2}'
done
$A com close >/dev/null
(timeout 20 $A com send "_QUIT\n" >/dev/null 2>&1 &)
sleep 10
