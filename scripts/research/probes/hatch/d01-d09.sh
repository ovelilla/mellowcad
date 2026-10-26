# The HATCH review's desktop pass, 2026-10-26: the owner's AutoCAD launched with
# `acad.sh launch "" en-US` (its English profile), a drawing of the review's own (`acad.sh com new`),
# the view ZOOM C 50,25 120 on a 2144×1169 drawing area at the screen's (6,186). Helpers:
# lib-dsk-en.sh. MellowProbe's NETLOAD failed in this instance (loadmgd), so the history was read
# from AutoCAD's log: LOGFILEMODE 1 (put back to 0), the log written to AutoCAD's working
# directory, the repo's root, and moved to research/probes/hatch/d-session.log. Put back at the end:
# OSMODE 4133 (0 for the pass), HPASSOC 1, HPORIGIN 0,0, LOGFILEMODE 0; DYNMODE stayed −1.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk-en.sh"
$A com eval '(setvar "OSMODE" 0)'; $A com eval '(setvar "LOGFILEMODE" 1)'
cs "_ZOOM _C 50,25 120\n"; cs "_RECTANG 0,0 100,50\n"

# d01 HATCH with the ribbon: `HATCH Pick internal point or [Select objects/Draw/Undo/seTtings]:`,
# the Hatch Creation tab, the quick preview under the cursor before any pick (d01-1); a pick makes
# the hatch at once, its boundary highlighted (d01-2); Escape keeps it (`*Cancel*`, 1 HATCH).
at 120 25; ty "\e"; ty "_HATCH\n"; mv 30 20; mv 30.5 20; full d01-1
at 30 20; mv 130 30; full d01-2; ty "\e"; full d01-3

# d02 -HATCH: the same quick preview (d02-1); after a pick only the boundary is highlighted, no
# pattern (d02-2); Escape discards it (0 HATCH).
cs "_ERASE _ALL \n"; cs "_RECTANG 0,0 100,50\n"; at 120 25; ty "\e"
ty "_-HATCH\n"; mv 30 20; mv 30.5 20; scr 50 25 d02-1 1400 800; at 30 20; scr 50 25 d02-2 1400 800; ty "\e"

# d03 grips: an associative hatch shows one round grip at its extents' centre; a non-associative
# one (HPASSOC 0) also its boundary's vertex (square) and edge-middle (rectangle) grips (d03-1).
# Hover menus: centre `Stretch/Origin Point/Hatch Angle/Hatch Scale` (d03-2), vertex
# `Stretch Vertex/Add Vertex/Remove Vertex` (d03-3), edge `Stretch/Add Vertex/Convert to Arc`
# (d03-4). A traced quadrilateral's centre grip sits at its extents' centre, not its centroid (d03-5).
cs "_ERASE _ALL \n"; cs "_RECTANG 0,5 40,45\n"; cs "_RECTANG 60,5 100,45\n"; cs "_-HATCH\n20,25\n\n"
$A com eval '(setvar "HPASSOC" 0)'; cs "_-HATCH\n80,25\n\n"; $A com eval '(setvar "HPASSOC" 1)'
$A com eval '(sssetfirst nil (ssget "_X" (list (cons 0 "HATCH"))))'; scr 50 25 d03-1 1400 800
mv 80 25.4; mv 80 25; scr 80 25 d03-2 900 600; ty "\e\e"   # and 100,45 (d03-3), 80,45 (d03-4)
cs "_PLINE 10,-20 40,-20 10,10 _C\n"; $A com eval '(setvar "HPASSOC" 0)'; cs "_-HATCH\n15,-15\n\n"
$A com eval '(setvar "HPASSOC" 1)'; $A com eval '(sssetfirst nil (ssadd (entlast)))'; scr 25 -5 d03-5 600 500

# d04 a plain drag of the non-associative hatch's centre grip (80,25 → 80,35) moves the hatch,
# not its boundary: bounding box 60.04,15.06–100.04,55.06; LIST's Origin stays 0,0 (d04-1).
$A com eval '(sssetfirst nil (ssadd (handent "AE")))'; at 80 25; mv 80 30; at 80 35; ty "\e\e"

# d05 the Properties palette on a non-associative ANGLE hatch (d05-1): General; Pattern: Type,
# Pattern name, Annotative, Angle, Scale, Origin X, Origin Y, Spacing, ISO pen width, Double,
# Associative, Island detection style, Background color; Geometry: Elevation, Area, Cumulative Area.
# Selecting a hatch opens the Hatch Editor ribbon tab.
$A com eval '(sssetfirst nil (ssadd (handent "AE")))'; cs "_PROPERTIES\n"; full d05-1
ty "\e\e"; cs "_PROPERTIESCLOSE\n"; cs "_ZOOM _C 50,25 120\n"

# d06 picking: no rollover inside an ANGLE hatch off its lines (d06-1); a click there starts a
# window (d06-2, `Specify opposite corner`); a click on a dash selects it (d06-3, 1 selected); a
# click inside a SOLID hatch selects it (d06-5).
mv 17.46 17.46; scr 20 25 d06-1 700 600; at 17.46 17.46; mv 25 30; scr 20 25 d06-2 700 600; ty "\e"
at 17.46 20.955; scr 20 25 d06-3 700 600; ty "\e\e"
cs "_RECTANG 105,10 125,40\n"; cs "_-HATCH\n_P\n_S\n115,25\n\n"; at 115 25; scr 115 25 d06-5 500 500; ty "\e\e"

# d07 MATCHPROP from an ANSI31 2/30 hatch made at HPORIGIN 5,3 onto an ANGLE hatch at 0,0: name,
# angle and scale copied; the pattern's base (DXF 43/44) stays 0,0; the ACAD xdata origin reads 5,3.
cs "_ERASE _ALL \n"; cs "_RECTANG 0,5 40,45\n"; cs "_RECTANG 60,5 100,45\n"
$A com eval '(setvar "HPORIGIN" (list 5.0 3.0))'; cs "_-HATCH\n_P\nANSI31\n2\n30\n20,25\n\n"
$A com eval '(setvar "HPORIGIN" (list 0.0 0.0))'; cs "_-HATCH\n60.5,25\n\n"
cs "_MATCHPROP\n(handent \"D8\")\n(handent \"DF\")\n\n"

# d08 hover on a hatch line: the rollover tooltip `Hatch` Color/Layer/Linetype (d08-1); a
# double-click opens the Hatch Editor tab and Quick Properties, no command echoed (d08-2).
mv 72.44 25.3; mv 72.44 25; scr 72 25 d08-1 600 500; at 72.44 25 left 2; full d08-2; ty "\e\e"

# d09 running snaps (OSMODE 4133) at -HATCH's internal point: no marker by a corner, the click
# taken raw (LASTPOINT 0.656586,5.5988), the area hatched.
cs "_ERASE _ALL \n"; cs "_RECTANG 0,5 40,45\n"; $A com eval '(setvar "OSMODE" 4133)'
at 120 25; ty "\e"; ty "_-HATCH\n"; mv 0.6 5.5; scr 5 10 d09-1 500 400; at 0.6 5.5; ty "\n"
$A com eval '(setvar "LOGFILEMODE" 0)'
