#!/usr/bin/env bash
# The Arrays review's en-US desktop pass (block AYG, 2026-10-22): `dsk-en.sh <id>…` runs those steps
# in order. It clicks and types on the owner's screen: ask first, and tell them when it is over.
# Needs `acad.sh launch "" en-US`, a drawing of the review's own (acad.sh com new), MellowProbe
# loaded (acad.sh com netload). Settings read before (en-US profile): DYNMODE -1, AUTOSNAP 55,
# ORTHOMODE 0, CLISTATE 1, OSMODE 4133, GRIPS 2, GRIPMULTIFUNCTIONAL 3, ARRAYASSOCIATIVITY 1,
# SELECTIONPREVIEW 3, ROLLOVERTIPS 1 — none is changed here. Each drag is undone with U through
# COM. Screenshots: research/probes/arrays/d<id>-*.png; LIST through `com hist`.
source "$(dirname "$0")/lib-dsk-en.sh"
# The figure: ARRAYRECT of a circle at -30,0 r 2, 4 columns 3 rows at 8 (items -30…-6, 0…16);
# ARRAYPOLAR of a square 20,40–26,46 about 23,25, 6 items; ARRAYPATH of a circle at 62,5 r 2 along
# a line 60,0 → 140,0 picked near its start (spacing 6).
setup() {
  $A com send "_ZOOM _C 50,22 120\n"
  $A com send "_CIRCLE -30,0 2\n"; $A com send "_ARRAYRECT _L  _COU 4 3 _S 8 8 _X\n"
  $A com send "_PLINE 20,40 26,40 26,46 20,46 _C\n"; $A com send "_ARRAYPOLAR _L  23,25 _I 6 _X\n"
  $A com send "_LINE 60,0 140,0 \n"; $A com send "_CIRCLE 62,5 2\n"
  $A com send "_ARRAYPATH 62,7  65,0 _X\n"
}
focus() { mv 120 70; at 120 70; ty '\e'; ty '\e'; }
R=(-14 2) P=(23 46) Q=(74 7)   # a pick on each array: an item's curve
HR=87 HP=AC HQ=C7                # their handles in a drawing set up from scratch
case_d11() { # each array selected at Command: its grips (en-US)
  focus; at "${R[@]}"; sleep 1; mv 0 40; sleep 0.5; scr -18 8 d11-1 700 500; ty '\e'
  at "${P[@]}"; sleep 1; mv 50 60; sleep 0.5; scr 23 25 d11-2 700 600; ty '\e'
  at "${Q[@]}"; sleep 1; mv 100 40; sleep 0.5; scr 100 3 d11-3 1000 300; ty '\e'
}
# grip menu: select the array by a pick at (sx,sy), hover (gx,gy), capture, Escape twice.
gm() { at "$1" "$2"; sleep 1; hov "$3" "$4" "$5" 700 450; ty '\e'; ty '\e'; }
case_d12() { # each grip's hover menu: rectangular (base, column spacing, column count, row
  # spacing, row count, total), polar (base, centre, angle between), path (base, spacing)
  focus
  gm "${R[@]}" -30 0 d12-1; gm "${R[@]}" -22 0 d12-2; gm "${R[@]}" -6 0 d12-3
  gm "${R[@]}" -30 8 d12-4; gm "${R[@]}" -30 16 d12-5; gm "${R[@]}" -6 16 d12-6
  gm "${P[@]}" 23 43 d12-7; gm "${P[@]}" 23 25 d12-8; gm "${P[@]}" 7.412 34 d12-9
  gm "${Q[@]}" 60 0 d12-10; gm "${Q[@]}" 66 0 d12-11
}
# drag tag handle sx sy gx gy tx ty: select, click the grip, move to the target, capture, click;
# LIST the array by its handle, then U twice (LIST is a step of its own) and the history of both.
drag() {
  local t=$1 h=$2; shift 2
  focus; at "$1" "$2"; sleep 1; at "$3" "$4"; sleep 0.8
  mv "$(python3 -c "print($5-0.3)")" "$6"; mv "$5" "$6"; sleep 0.8
  scr "$5" "$6" "$t-1" 900 600; cl "$t-cl"
  at "$5" "$6"; sleep 1; ty '\e'; lst "$t" "$h"
  $A com send "_U\n" >/dev/null; $A com send "_U\n" >/dev/null
  $A com hist 6 | grep -E '^Command: _U|^[A-Z_ ]+$' | sed "s/^/$t undo | /"
}
case_d14() { # the rectangular array's default drags
  drag d14a $HR "${R[@]}" -6 0 13 0; drag d14b $HR "${R[@]}" -6 0 17 0; drag d14c $HR "${R[@]}" -6 0 13 6
  drag d14d $HR "${R[@]}" -22 0 -19 0; drag d14e $HR "${R[@]}" -30 16 -30 35
  drag d14f $HR "${R[@]}" -30 8 -30 11; drag d14g $HR "${R[@]}" -6 16 13 35
  drag d14h $HR "${R[@]}" -30 0 -30 -20
}
case_d14s() { # the spacing drags again with OSMODE 0 (d14d, d14f snapped to an item's Center)
  $A com set OSMODE 0 >/dev/null
  drag d14i $HR "${R[@]}" -22 0 -18 0; drag d14j $HR "${R[@]}" -30 8 -30 12.5
  $A com set OSMODE 4133 >/dev/null
}
case_d15() { # the polar array's default drags (OSMODE 0 meanwhile)
  $A com set OSMODE 0 >/dev/null
  drag d15a $HP "${P[@]}" 23 43 23 50; drag d15b $HP "${P[@]}" 23 25 30 25
  drag d15c $HP "${P[@]}" 7.412 34 5 25
  $A com set OSMODE 4133 >/dev/null
}
case_d16() { # the path array's default drags (OSMODE 0 meanwhile)
  $A com set OSMODE 0 >/dev/null
  drag d16a $HQ "${Q[@]}" 60 0 60 -10; drag d16b $HQ "${Q[@]}" 66 0 70 0
  $A com set OSMODE 4133 >/dev/null
}
case_d15x() { # polar: the radius stretched off the base's direction, the angle between to 45° and
  # past the fill; the column count dragged behind the base (OSMODE 0 meanwhile)
  $A com set OSMODE 0 >/dev/null
  drag d15d $HP "${P[@]}" 23 43 30 48; drag d15e $HP "${P[@]}" 7.412 34 10.272 37.728
  drag d14k $HR "${R[@]}" -6 0 -40 0
  $A com set OSMODE 4133 >/dev/null
  $A com hist 200 | grep -A3 "^ *\*\*" | sed 's/^/d15x | /'
}
case_d17() { # a count typed during the column-count drag, then the history
  focus; at "${R[@]}"; sleep 1; at -6 0; sleep 0.8; ty '6\n'; sleep 1; ty '\e'; lst d17 $HR
  $A com send "_U\n" >/dev/null; $A com hist 12 | sed 's/^/d17h | /'
}
case_d18() { # ARRAYRECT's main prompt: the preview's column-count grip dragged, then Enter
  $A com send "_CIRCLE -30,-30 2\n"; focus; ty '_ARRAYRECT\n'; sleep 1; at -28 -30; ty '\n'; sleep 1
  mv 0 60; sleep 0.5; scr -20 -22 d18-1 700 400; cl d18-cl1
  at -12 -30; sleep 1; mv 2 -30.3; mv 2 -30; sleep 0.8; scr -10 -22 d18-2 800 400; cl d18-cl2
  at 2 -30; sleep 1; cl d18-cl3; ty '\n'; sleep 1; lst d18 "$($A com eval '(cdr (assoc 5 (entget (entlast))))' | tr -d '"')"
}
case_d18b() { # d18 again on its circle, left by a U: the drag clicked home, then Enter, then LIST
  focus; ty '_ARRAYRECT\n'; sleep 1; at -28 -30; ty '\n'; sleep 1.5
  at -12 -30; sleep 1; mv 2 -30.3; mv 2 -30; sleep 1.5; scr -10 -24 d18b-1 800 400
  at 2 -30; sleep 1.5; scr -10 -24 d18b-2 800 400; cl d18b-cl1; ty '\n'; sleep 1.5
  $A com send "_LIST _L \n" >/dev/null; $A com hist 40 | sed -n '/_ARRAYRECT/,$p' | grep -v -E '^Command: *$|MPHIST|^Lines|History file|levels|Level|elevation|Space:' | sed 's/^/d18b | /'
}
case_d18c() { # d18 again, high in the view (d18b's clicks fell on the floating command line):
  # a circle at -30,50; the drag clicked home; Enter; LIST. Then Enter and Escape at the grip's prompt
  $A com send "_CIRCLE -30,50 2\n"; focus; ty '_ARRAYRECT\n'; sleep 1; at -28 50; ty '\n'; sleep 1.5
  at -12 50; sleep 1; mv 2 50.3; mv 2 50; sleep 1.5; scr -14 56 d18c-1 800 400
  at 2 50; sleep 1.5; scr -14 56 d18c-2 800 400; cl d18c-cl1; ty '\n'; sleep 1.5
  $A com send "_LIST _L \n" >/dev/null
  $A com hist 40 | sed -n '/_ARRAYRECT/,$p' | grep -v -E '^Command: *$|MPHIST|^Lines|History file|levels|Level|elevation|Space:' | sed 's/^/d18c | /'
  $A com send "_U\n" >/dev/null; $A com send "_U\n" >/dev/null; $A com send "_U\n" >/dev/null
  $A com send "_CIRCLE -30,50 2\n"; focus; ty '_ARRAYRECT\n'; sleep 1; at -28 50; ty '\n'; sleep 1.5
  at -12 50; sleep 1; ty '\n'; sleep 1; cl d18d-cl1; ty '\e'; sleep 1; cl d18d-cl2; ty '\n'; sleep 1.5
  $A com hist 30 | sed -n '/_ARRAYRECT/,$p' | grep -v -E '^Command: *$|MPHIST|^Lines|History file' | sed 's/^/d18d | /'
}
case_d19() { # the rollover over an item of the rectangular array at Command: (en-US)
  focus; mv -14.6 2.2; mv -14 2; sleep 1.5; scr -10 0 d19-1 700 450
}
case_d13() { # the Properties palette of each array (en-US), its rows read through UIA
  focus; at "${R[@]}"; sleep 1; ty '_PROPERTIES\n'; sleep 2; full d13-1; ty '\e'; ty '\e'
  at "${P[@]}"; sleep 1.5; full d13-2; ty '\e'; ty '\e'
  at "${Q[@]}"; sleep 1.5; full d13-3; ty '\e'; ty '\e'
}
# pe tag handle sx sy row value: with the Properties palette open (d13), select the array, click the
# value of the palette row at display y `row` (d13's 2000-px capture), erase it and type the value
# into the palette's own window (type.ps1 would hand the keys to the frame), Enter; LIST;
# Escape; U twice.
pe() {
  local t=$1 h=$2 y; y=$(python3 -c "print(round($5*1.28))")
  focus; at "$3" "$4"; sleep 1.5; $A click 280 "$y" left 1 >/dev/null; sleep 0.8
  local pw; pw=$($A wins | awk -F'\t' '$3 == "Properties" {print $1; exit}')
  $A type "$(printf '\b%.0s' 1 2 3 4 5 6 7 8 9 10)$6"$'\r' "$pw" >/dev/null; sleep 1.5
  full "$t-1" >/dev/null; ty '\e'; ty '\e'
  lst "$t" "$h"; $A com send "_U\n" >/dev/null; $A com send "_U\n" >/dev/null
  $A com hist 6 | grep -E '^Command: _U|^[A-Za-z_ ]+$' | sed "s/^/$t undo | /"
}
case_d20() { # palette edits: rect Columns 5, Base X -40; polar Items 8, Angle between 30, Fill
  # angle 180, Radius 20, Direction; path Items 10, Item spacing 10
  pe d20a $HR "${R[@]}" 327 5; pe d20b $HR "${R[@]}" 265 -40
  pe d20c $HP "${P[@]}" 401 8; pe d20d $HP "${P[@]}" 416 30; pe d20e $HP "${P[@]}" 431 180
  pe d20f $HP "${P[@]}" 354 20
  pe d20g $HQ "${Q[@]}" 372 10; pe d20h $HQ "${Q[@]}" 387 10
}
for id in "$@"; do if [[ $id == setup ]]; then setup; else "case_$id"; fi; done
