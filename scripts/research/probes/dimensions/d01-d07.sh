# The Dimensions review's desktop pass, 2026-10-27: the owner's AutoCAD launched with
# `acad.sh launch "" en-US` (its English profile), on the second monitor, a drawing of the review's
# own (`acad.sh com new`), the view ZOOM C 50,25 120. Helpers: lib-dsk-en.sh. Read before and put
# back at the end: OSMODE 4133 (0 for the pass); DYNMODE stayed -1. Run step by step: a pending
# prompt or a modal dialog locks COM. A `com send` ending in a space leaves LINE open: end LINE
# with `\n\n`, or draw with PLINE as below.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk-en.sh"
sel() { $A com eval "(sssetfirst nil (ssadd (handent \"$1\")))" >/dev/null; }
$A com eval '(setvar "OSMODE" 0)'; cs "_ZOOM _C 50,25 120\n"

# d01 grips of every kind, selected through COM: linear and aligned show five (two origins, the
# two ends of the dimension line, the text), radius three (centre, rim, text), diameter three (the
# two rim points, the text), the two-line angular five (vertex, the two picks, the arc, the text).
for c in "_DIMLINEAR 0,0 40,0 20,10\n" "_DIMALIGNED 60,0 90,20 70,25\n" "_CIRCLE 20,40 10\n" \
  "_DIMRADIUS 30,40 40,45\n" "_CIRCLE 70,40 10\n" "_DIMDIAMETER 80,40 75,45\n" \
  "_PLINE 30,-20 0,-20 20,-5\n\n" "_DIMANGULAR 15,-20 10,-12.5 30,-10\n"; do cs "$c"; sleep 1; done
$A com eval '(sssetfirst nil (ssget "_X" (list (cons 0 "DIMENSION"))))'; full d01-1
# handles of that run: FF linear, 10C aligned, 11A radius, 12D diameter, 13E angular

# d02 the hover menus: the text grip's Stretch, Move with Dim Line, Move Text Only, Move with
# Leader, Above Dim Line, Center Vertically, Reset Text Position (d02-1); a dimension line end's
# Stretch, Continue Dimension, Baseline Dimension, Flip Arrow (d02-2); an origin's none (d02-3).
sel FF; hov 20 11.8 d02-1; ty "\e\e"; sel FF; hov 40 10 d02-2; ty "\e\e"; sel FF; hov 40 0 d02-3; ty "\e\e"

# d03 the text grip's plain drag is Move with Dim Line: picked at the text and put at 30,20, the
# line goes through y 20 (DXF 10 (40,20)) and the text stays where it was put (DXF 11 (30.06,20),
# flag 70 gains 128, a user-placed text). U puts it back.
sel FF; at 20 11.8; sleep 0.8; at 30 20; sleep 1; scr 20 10 d03-1 700 500; cs "_U\n"

# d04 the Properties palette (captured by its handle, groups collapsed by their arrows and
# expanded again after): the title names the kind (Rotated, Aligned, Radial, Diametric, Angular
# Dimension); General (… Associative), Misc (Dim style, Annotative), Lines & Arrows, Text (… Text
# position X/Y, Text rotation, Measurement greyed, Text override), Fit, Primary Units (Decimal
# separator `,`, Suppress trailing zeros Yes, Precision 0.00), Alternate Units, Tolerances. No row
# holds a definition point.
sel FF; cs "_PROPERTIES\n"   # shot <palette hwnd>: d04-1 to d04-3; then 10C, 11A, 12D, 13E

# d05 the Dimension Style Manager (Annotative and ISO-25 listed; Set Current, New…, Modify…,
# Override…, Compare…); New… proposes `Copy of ISO-25` Start With ISO-25, Use for All dimensions
# (d05-2); Continue opens New Dimension Style's seven tabs (d05-3); OK makes it current; after
# Close, U echoes `DIMSTYLE`, drops the style and puts ISO-25 back current.
$A com send "_DIMSTYLE\n" &          # buttons by rectangle (`acad.sh children`), UIA cannot press them
cs "_U\n"; hist 8

# d06 DIMLINEAR's direction at the location: H/V from the bands, a corner keeps the last band's
# direction, and the first one is horizontal (d06-1 to d06-3). Enter at DIMRADIUS's location places
# the dimension at the cursor (COM, no mouse).
cs "_ERASE _ALL \n"; at 100 -20; ty "\e\e"; ty "_DIMLINEAR\n"; ty "0,0\n"; ty "40,20\n"
mv 60 30; scr 30 15 d06-1 800 500; mv 20 35; mv 60 30; scr 30 15 d06-2 800 500
mv 60 10; mv 60 30; scr 30 15 d06-3 800 500; ty "\e\e"

# d07 the shortcut menu over a selected dimension: Dimension Style ▸, Precision ▸, Remove Style
# Overrides, Annotative Object Scale ▸ (greyed), then the Edit menu's usual entries.
cs "_DIMLINEAR 0,0 40,0 20,10\n"; $A com eval '(sssetfirst nil (ssadd (entlast)))'; at 30 10 right
full d07-1; ty "\e\e"

$A com eval '(setvar "OSMODE" 4133)'; $A com close
