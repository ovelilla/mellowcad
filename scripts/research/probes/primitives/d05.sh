#!/usr/bin/env bash
# d05: one Escape at each prompt a keyword opens (does it step back or cancel?), then U after an
# Escape halfway, in plan (en-US, DYNMODE 0 typed, OSMODE 0, d03's view). Each case: the command
# and its answers typed, one Escape, the history read; a second Escape ends what is left.
# Seen: one Escape cancels the command at every prompt (`*Cancel*`), none steps back.
source "$(dirname "$0")/lib.sh"
case1() { # $1 typed
  esc; $A click 3300 950 left >/dev/null; esc; typ "$1"; $A key esc >/dev/null; sleep 1
  $A com hist 4 2>/dev/null || { esc; $A com hist 4; }
  echo ---
}
for c in "_BOX\n_C\n" "_BOX\n0,0,0\n_C\n" "_BOX\n0,0,0\n_L\n" "_BOX\n0,0,0\n_L\n5\n" "_BOX\n0,0,0\n5,5\n_2P\n" "_BOX\n0,0,0\n5,5\n_2P\n0,0\n" \
  "_CYLINDER\n_3P\n" "_CYLINDER\n_2P\n" "_CYLINDER\n_T\n" "_CYLINDER\n_E\n" "_CYLINDER\n_E\n_C\n" "_CYLINDER\n0,0,0\n_D\n" \
  "_CYLINDER\n0,0,0\n5\n_A\n" "_CYLINDER\n0,0,0\n5\n_2P\n" "_CONE\n0,0,0\n5\n_T\n" "_SPHERE\n_3P\n" "_TORUS\n0,0,0\n5\n_2P\n" \
  "_TORUS\n0,0,0\n5\n_D\n" "_PYRAMID\n_S\n" "_PYRAMID\n_E\n" "_PYRAMID\n0,0,0\n_I\n" "_PYRAMID\n0,0,0\n5\n_T\n"; do
  echo "== $c"; case1 "$c"
done
