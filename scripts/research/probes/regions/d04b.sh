#!/usr/bin/env bash
# d04 b: the rollover on a region (d04's drawing, plan, ZOOM C 50,0 120, at Command:): the cursor
# on R1's left rim (10,26) → d04-1; on R2's rim (85,25) → d04-2. Crops of the drawing.
source "$(dirname "$0")/lib.sh"
$A com send "_-VPOINT 0,0,1\n" >/dev/null; $A com send "_ZOOM _C 50,0 120\n" >/dev/null
P1=$(px 10,26); P2=$(px 85,25)
hover $P1; shot d04-1 3250,300,1100,500
hover $P2; shot d04-2 3250,300,1100,500
$A click 3839 868 none >/dev/null
