# The Text review's desktop pass, 2026-10-23: the owner's AutoCAD launched with
# `acad.sh launch "" en-US` (its English profile, acad.dwt: Standard is txt.shx there, set to
# arial.ttf by d01), a drawing of the review's own (`acad.sh com new`), the view ZOOM C 50,22 120
# on a 2144×1169 drawing area at the screen's (6,186). Helpers: lib-dsk-en.sh. Put back at the end:
# OSMODE 4133 (set 0 for the pass); DYNMODE stayed −1, TEXTEDITMODE 0, MTEXTFIXED 2. The calls, in
# order; the screenshots are research/probes/text/<id>-<n>.png.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk-en.sh"
$A com netload
$A com eval '(setvar "OSMODE" 0)'
cs "_ZOOM _C 50,22 120\n"

# d01 TEXT's in-place editor: Enter between lines (txt.shx 5/3, Arial 1.60641), Escape mid-line,
# an empty line ending, the dashed band at height and rotation, an empty run's TEXTSIZE.
at 90 5; ty "\e"; ty "_TEXT\n10,40\n5\n0\n"; ty "AAA\nBBB\n"; scr 30 35 d01-1 900 500; ty "\n"
ty "_TEXT\n40,40\n5\n0\n"; ty "CCC\nDDD"; scr 50 35 d01-2 900 500; ty "\e"   # DDD is dropped
ty "_-STYLE\nStandard\narial.ttf\n0\n1\n0\nN\nN\n"
ty "_TEXT\n70,10\n5\n0\n"; ty "GGG\nHHH\n"; scr 75 8 d01-4 900 500; ty "\n"  # HHH at y 1.96794
ty "_TEXT\n30,50\n"; mv 45 58; scr 38 54 d01-5 700 400; ty "5\n"; mv 45 62; scr 38 56 d01-6 700 400; ty "\e"
$A com eval '(setvar "TEXTSIZE" 2.5)'; ty "_TEXT\n30,50\n7\n20\n"; ty "\e"   # TEXTSIZE stays 2.5

# d02 TEXT grips: Left, Right, MC, BL, TL; a drag of a Right text's DXF 10 grip.
cs '_ERASE _ALL \n'
cs '_-TEXT 10,30 5 0 Agh\n'; cs '_-TEXT _J _R 60,30 5 0 Agh\n'; cs '_-TEXT _J _MC 20,10 5 0 Agh\n'
cs '_-TEXT _J _BL 60,10 5 0 Agh\n'; cs '_-TEXT _J _TL 75,30 5 0 Agh\n'
$A com eval '(sssetfirst nil (ssget "_X"))'; scr 45 20 d02-1 1000 500; ty "\e\e"
$A com eval '(sssetfirst nil (ssadd (handent "8F")))'; at 47.5716 30; at 47.5716 22; ty "\e"

# d03 MTEXT grips: two corners (TL), Width with MC, two corners with BR.
cs '_ERASE _ALL \n'
cs '_-MTEXT 10,40 _H 4 40,25 HHH\nGGG\n\n'; cs '_-MTEXT 60,40 _J _MC _H 4 _W 30 Line one\n\n'
cs '_-MTEXT 20,10 _H 4 _J _BR 40,0 Agh\n\n'
$A com eval '(sssetfirst nil (ssget "_X"))'; scr 45 25 d03-1 1100 560

# d04 the Properties palette on a TEXT (MC, 15°) and on an MTEXT.
ty "\e\e"; cs '_-TEXT _J _MC 30,-10 5 15 Agh\n'; $A com eval '(sssetfirst nil (ssadd (entlast)))'
cs '_PROPERTIES\n'; full d04-1
$A com eval '(sssetfirst nil (ssget "_X" (list (cons 1 "Line one"))))'   # d04-2: the palette's crop
ty "\e\e"; cs '_PROPERTIESCLOSE\n'; cs '_ZOOM _C 50,22 120\n'; cs '_ERASE _ALL \n'

# d05 MTEXT: the jig, the editor, Escape with changes (the Unsaved Changes task dialog, No),
# Enter at the first corner.
at 90 0; ty "\e"; ty "_MTEXT\n"; mv 20 40; scr 30 35 d05-1 700 400; at 20 40; mv 60 20; scr 40 30 d05-2 900 500
at 60 20; full d05-3; ty "Hello world\nSecond"; scr 40 30 d05-4 900 500; ty "\e"; full d05-5
$A uia "<the dialog's hwnd>" "No"
at 90 0; ty "\e"; ty "_MTEXT\n"; ty "\n"; cl d05-6; ty "\e"   # Invalid point.

# d06 picking and double-clicking text; TEXTEDIT's Escape; a double-click on an MTEXT.
cs '_-TEXT 20,30 5 0 HHHH\n'; cs '_-MTEXT 60,35 _H 5 _W 30 MMMM\n\n'   # the TEXT landed at 9.91,27.5
mv 12.9 31.5; scr 20 30 d06-3 500 200; at 12.9 31.5   # inside the box, off the strokes: nothing selected
at 27.5 30.0 left 2; ty "XY"; scr 25 30 d06-5 700 300; ty "\e"; scr 25 30 d06-6 700 300   # HHHH again
ty "\e\e"; at 60.7 32 left 2; ty "\e"   # Command: _mtedit

# d07 STYLE's dialog with a text selected: New… (style1, current), Close, U.
$A com eval '(sssetfirst nil (ssget "_X" (list (cons 0 "TEXT"))))'; ty "_STYLE\n"
$A click 1540 614   # New...; d07-2 the New Text Style dialog
$A click 1370 689   # OK; d07-3
$A click 1456 877   # Close; the preselection is gone
cs '_U\n'           # U echoes STYLE; style1 is gone and Standard current

# d08 MATCHPROP: TEXT→MTEXT, MTEXT→TEXT, TEXT→TEXT (source preselected, destination _L).
cs '_ERASE _ALL \n'; ty "_-STYLE\nS2\nArial\n0\n0.8\n10\nN\nN\n"
ty "_-TEXT\n_S\nS2\n_J\n_MC\n20,30\n7\n15\nSRC\n"; ty "_-STYLE\nStandard\n\n\n\n\n\n\n"; ty "\e"
cs '_-MTEXT 50,40 _H 4 _W 30 DST\n\n'
$A com eval '(sssetfirst nil (ssadd (handent "A1")))'; ty "_MATCHPROP\n"; ty "_L\n\n"
cs '_-MTEXT 50,10 _H 4 _J _BR _W 30 SRCM\n\n'; ty "_-TEXT\n_S\nS2\n_J\n_MC\n20,0\n7\n15\nDSTT\n"
$A com eval '(sssetfirst nil (ssadd (handent "A3")))'; ty "_MATCHPROP\n"; ty "_L\n\n"
cs '_-TEXT 70,20 3 0 TT\n'; $A com eval '(sssetfirst nil (ssadd (handent "A1")))'; ty "_MATCHPROP\n"; ty "_L\n\n"

$A com eval '(setvar "OSMODE" 4133)'; $A com close; $A com send "_QUIT\n"
