#!/usr/bin/env bash
# d13: PLINE's own segments with the owner's mouse (2026-11-03, en-US, plan; ZOOM W -50,-350
# 450,0: 0,-300,0 at pixel 2965,1190, 3.36 px a unit). After 0,-300 → 100,-300 → 100,-250, the
# cursor on the start point shows Endpoint; moved up from it, OTRACK's guide `Endpoint: 45.0085 <
# 90°` runs from the start point (console pline/p259: every snap on the chain so far).
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
$A com send "_ZOOM _W -50,-350 450,0\n"
$A type "_PLINE\n" >/dev/null; sleep 1; $A type "0,-300\n" >/dev/null; sleep 0.8
$A type "#100,-300\n" >/dev/null; sleep 0.8; $A type "#100,-250\n" >/dev/null; sleep 0.8
$A click 2967 1188 none >/dev/null; sleep 0.4; $A click 2966 1189 none >/dev/null; sleep 1.5
$A shot -hwnd -1 -crop 2800,850,700,450
$A click 2980 1150 none >/dev/null; sleep 0.3; $A click 2966 1040 none >/dev/null; sleep 1
$A shot -hwnd -1 -crop 2800,850,700,450
$A key esc
