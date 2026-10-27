# The Inquiry review's desktop pass, 2026-10-27, en-US: the owner's AutoCAD launched with
# `acad.sh launch "" en-US`, a drawing of the review's own (`acad.sh com new`), view ZOOM C 50,25
# 120. Helpers: lib-dsk-en.sh. Read before and put back at the end: OSMODE 4133 (0 for the pass),
# DYNMODE -1 (Lisp), ORTHOMODE 0, AUTOSNAP 55. Run step by step; `com netload` before `hist`.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk-en.sh"
$A com eval '(setvar "OSMODE" 0)'; cs "_ZOOM _C 50,25 120\n"; at 90 45; ty "\e\e"

# d01 DIST's second point: a solid white rubber band (the trace's UseDashedLine false, p134), the
# `?` cursor badge, no readout of any kind; with dynamic input (DYNMODE -1 here behaves as 3) an
# aligned dimension of the length and the `Specify second point or` tooltip (d01-1, d01-3); with
# DYNMODE 0 the band and the badge alone (d01-2). No marker at the first point.
ty "_DIST\n"; at 20 15; mv 60 35; scr 40 25 d01-1 1100 700; ty "\e\e"
$A com set DYNMODE 0; at 90 45; ty "\e\e"; ty "_DIST\n"; at 20 15; mv 60 35; scr 40 25 d01-2 1100 700; ty "\e\e"
$A com set DYNMODE 3; at 90 45; ty "\e\e"; ty "_DIST\n"; at 20 15; mv 60 35; scr 40 25 d01-3 1100 700; ty "\e\e"

# d02 Multiple points: the run a solid polyline to the cursor, the dimension of the segment under
# the cursor, and the dynamic prompt `Distance = 45.0546` / `Specify next point or`: the run's total
# to the cursor (19.9907 + 25.0639), not a readout.
at 90 45; ty "\e\e"; ty "_DIST\n"; at 20 15; ty "_M\n"; at 40 15; mv 55 35; scr 40 25 d02-1 1100 700; ty "\e\e"

# d03 AREA's corners: the polygon closed through the cursor, filled translucent green ((25,91,37)
# over the background's (33,40,48): #00ff00 at about 24 %) under a solid white outline, no area or
# perimeter shown; the dynamic input's distance and angle from the last corner (d03-1, d03-2); the
# same fill with DYNMODE 0 (d03-3).
at 90 45; ty "\e\e"; ty "_AREA\n"; at 20 15; at 60 15; mv 50 40; scr 40 25 d03-1 1100 700
at 50 40; mv 25 35; scr 40 25 d03-2 1100 700; ty "\e\e"
$A com set DYNMODE 0; at 90 45; ty "\e\e"; ty "_AREA\n"; at 20 15; at 60 15; mv 50 40; scr 40 25 d03-3 1100 700; ty "\e\e"

# d04 MEASUREGEOM's Distance and Area: the same prompts and the same look as DIST and AREA, pixel
# for pixel (d04-1 against d01-3); the green fill is AREA's as much as MEASUREGEOM's.
$A com set DYNMODE 3; at 90 45; ty "\e\e"; ty "_MEASUREGEOM\n_D\n"; at 20 15; mv 60 35; scr 40 25 d04-1 1100 700; ty "\e\e"
at 90 45; ty "\e\e"; ty "_MEASUREGEOM\n_AR\n"; at 20 15; at 60 15; mv 50 40; scr 40 25 d04-2 1100 700; ty "\e\e"
$A com netload; hist 30

# d05 Escape at each prompt (typed with DYNMODE 3, which reads `10,0` as `@10,0`; with DYNMODE 0 in
# the second half): `*Cancel*` and the command ends at DIST's first and second point, Multiple's
# next point, the arc's endpoint, AREA's first corner, next point, `Select objects:`, the Add mode's
# first corner, next point and `(ADD mode) Select objects:` (no total said again) and ID's point;
# at a prompt a keyword opened, `Specify length of line: *Cancel*` (DIST's and AREA's Length) and
# `Specify second point on arc: *Cancel*`, it goes back to the prompt that opened it, DIST saying
# `Distance = 10.0000` again first.
cs "_CIRCLE 80,30 5\n"; at 90 45; ty "\e\e"
ty "_DIST\n"; ty "\e"; ty "_DIST\n0,0\n"; ty "\e"; ty "_DIST\n0,0\n_M\n10,0\n"; ty "\e"; ty "_DIST\n0,0\n_M\n10,0\n_L\n"; ty "\e"
ty "_AREA\n"; ty "\e"; ty "_AREA\n0,0\n10,0\n"; ty "\e"; ty "_AREA\n0,0\n10,0\n10,10\n"; ty "\e"; ty "_AREA\n_O\n"; ty "\e"
ty "_AREA\n_A\n_O\n"; at 85 30; ty "\e"; ty "_AREA\n_A\n_O\n"; at 85 30; ty "\n"; ty "\e"; ty "_AREA\n_A\n0,0\n10,0\n"; ty "\e"; ty "_ID\n"; ty "\e"; hist 60
$A com set DYNMODE 0
ty "_DIST\n0,0\n_M\n10,0\n_A\n"; ty "\e"; ty "\e"; ty "_DIST\n0,0\n_M\n10,0\n_A\n_S\n"; ty "\e"; ty "\e"; ty "\e"
ty "_AREA\n0,0\n10,0\n_L\n"; ty "\e"; ty "\e"; ty "_AREA\n0,0\n10,0\n_A\n_S\n"; ty "\e"; ty "\e"; ty "\e"; hist 60

# d06 `<30` then 10 at DIST's second point: `Angle Override: 49.7381 < 30°` beside the cursor, the
# band along 30°, `Delta X = 8.6603,  Delta Y = 5.0000` (the console ignores it, p134). ID refuses
# `<45` with `Invalid point.`; a bare 50 then runs from LASTPOINT towards the cursor
# (43.3947,24.8375 with the cursor at about 70,40).
cs "_ERASE _ALL \n"; at 90 45; ty "\e\e"; ty "_DIST\n0,0\n<30\n"; mv 40 30; scr 20 15 d06-1 1100 700; ty "10\n"
ty "_ID\n0,0\n"; ty "_ID\n<45\n"; mv 70 40; scr 50 25 d06-2 1100 700; ty "50\n"; hist 16

# d07 Ortho at AREA's next point and at Multiple's (UseBasePoint false in both traces): bent from
# the last point, `Ortho: 20.1020 < 90°`, the click at 14,25 taken at 10,25.1 (Area = 100.5098,
# Perimeter = 58.3028; Distance = 31.2823); Polar the same (AUTOSNAP 63, put back to 55).
$A com set ORTHOMODE 1; at 90 45; ty "\e\e"
ty "_AREA\n0,0\n10,5\n"; mv 14 25; scr 10 15 d07-1 1000 640; at 14 25; ty "\n"
ty "_DIST\n0,0\n_M\n10,5\n"; mv 14 25; scr 10 15 d07-2 1000 640; at 14 25; ty "\n"
$A com set ORTHOMODE 0; $A com eval '(setvar "AUTOSNAP" 63)'; ty "_AREA\n0,0\n10,5\n"; mv 10.3 25; scr 10 15 d07-3 1000 640; at 10.3 25; ty "\n"
$A com eval '(setvar "AUTOSNAP" 55)'; hist 40

# d08 AREA Object's `Select objects:`: the circle under the pick box thickened, the standard
# rollover, with the `?` badge (d08-1); ERASE's for comparison fades it (d08-2).
cs "_ERASE _ALL \n"; cs "_CIRCLE 50,25 10\n"; cs "_LINE 20,10 80,10\n\n"; at 90 45; ty "\e\e"
ty "_AREA\n_O\n"; hov 60 25 d08-1; ty "\e\e"; at 90 45; ty "\e\e"; ty "_ERASE\n"; hov 60 25 d08-2; ty "\e\e"

# d09 the right button at DIST's second point: Enter, Cancel, Recent Input ▸ · Multiple points ·
# Osnap Overrides ▸ · Pan, Zoom, SteeringWheels · QuickCalc; at AREA's next point the same with
# Arc, Length, Undo; at DIST's first point no options.
at 90 45; ty "\e\e"; ty "_DIST\n"; at 20 15; at 40 35 right; full d09-1; ty "\e\e\e"
at 90 45; ty "\e\e"; ty "_AREA\n"; at 20 15; at 40 15; at 40 35 right; full d09-2; ty "\e\e\e"
at 90 45; ty "\e\e"; ty "_DIST\n"; at 40 35 right; full d09-3; ty "\e\e\e"

$A com eval '(setvar "OSMODE" 4133)'; $A com eval '(setvar "DYNMODE" -1)'; $A com close
