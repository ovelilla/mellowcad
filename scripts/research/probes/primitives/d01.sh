#!/usr/bin/env bash
# d01: CYLINDER's, CONE's and PYRAMID's height with the mouse, SE Isometric (en-US, DYNMODE 3,
# OSMODE 0; ZOOM C 300,100,0 300: 3.92 px a unit, the Z 3.2). The base's centre 300,100,0 typed
# (pixel 3638,770), the radius 20, the height hovered (the height box's reading shot) and clicked;
# then bb. 100 px up, 100 px down, 100 px up and 100 right. CONE's Top radius: 20 px right of the
# axis at the height. PYRAMID as CYLINDER.
# Seen: up 31.5291, down -30.9048, up and right 31.5291 for all three; the height box reads 31.5291
# / 30.9048 beside a dotted dimension.
source "$(dirname "$0")/lib.sh"
at() { # $1 the command and its answers up to the height, $2 $3 the pixel, $4 the shot's name
  esc; $A com send "_ERASE _ALL \n" >/dev/null; $A click 3300 700 left >/dev/null; esc
  typ "$1"; hover "$2" "$3"; shot "$4" 3200,300,900,800
  $A click $(($2 + 1)) "$3" left >/dev/null; sleep 1.5; $A com eval '(bb)'
}
for c in CYLINDER CONE PYRAMID; do
  at "_$c\n300,100,0\n20\n" 3638 670 "d01-${c,,}-up"
  at "_$c\n300,100,0\n20\n" 3638 870 "d01-${c,,}-down"
  at "_$c\n300,100,0\n20\n" 3738 670 "d01-${c,,}-aside"
done
