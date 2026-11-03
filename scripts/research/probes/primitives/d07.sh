#!/usr/bin/env bash
# d07: the right button at the primitives' prompts, SHORTCUTMENU 11 (the profile's), in plan
# (en-US, DYNMODE 0 typed, OSMODE 0, d03's view). The menu shot at 3700,700, closed with Escape
# (which then cancels the command); at a prompt without options, the history after the click.
# Seen: Enter, Cancel, Recent Input, the visible keywords only, Osnap Overrides, Pan, Zoom,
# SteeringWheels, QuickCalc; with no options a right-click is Enter (10 taken, 0 taken).
source "$(dirname "$0")/lib.sh"
menu() { # $1 typed, $2 shot
  esc; $A click 3300 950 left >/dev/null; esc; typ "$1"; $A click 3700 700 right >/dev/null; sleep 1.2
  shot "$2" 3600,500,700,800; esc
}
menu "_BOX\n" d07-box-first
menu "_BOX\n0,0,0\n" d07-box-other
menu "_CYLINDER\n0,0,0\n5\n" d07-cylinder-height
menu "_CONE\n0,0,0\n5\n" d07-cone-height
menu "_CONE\n0,0,0\n5\n_T\n2\n" d07-cone-height-after-top
menu "_PYRAMID\n" d07-pyramid-center
menu "_TORUS\n0,0,0\n5\n" d07-torus-tube
menu "_SPHERE\n0,0,0\n" d07-sphere-radius
# no options: Specify length <10.0000>: and Specify top radius <0.0000>:
for c in "_BOX\n0,0,0\n_L\n" "_CONE\n0,0,0\n5\n_T\n"; do
  esc; $A click 3300 950 left >/dev/null; esc; typ "$c"; $A click 3700 700 right >/dev/null; sleep 1.2
  shot "d07-noopt-$(echo "$c" | cut -c2-4)" 3600,500,700,800; esc
done
$A com hist 60 | grep -v 'MPHIST\|^Lines\|^History file\|^Command:\s*$\|opposite corner\|^Command: \*Cancel\*$' | tail -14
