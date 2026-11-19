#!/usr/bin/env bash
# d01–d12: the grips and Properties palette of a wipeout, an image, a table and a multileader, in
# the desktop AutoCAD 2027 (en-US, 2026-11-19). Needs AutoCAD open (acad.sh launch "" en-US),
# MellowProbe netloaded, a 4×3 BMP at %TEMP%\mcaddsk\pic.bmp and the Properties palette floating.
# Screenshots: research/probes/objects/d<id>-*.png. The hovers and drags (d05–d07, d12) move the
# owner's mouse: ask first; the pixels below are this session's (VIEWCTR, VIEWSIZE, SCREENSIZE).
cd "$(dirname "$0")/../../../.." || exit 1
A=scripts/research/acad.sh
$A com new
$A com eval '(progn (setvar "OSMODE" 0) (command "_.WIPEOUT" "0,0" "20,0" "20,10" "0,10" "") "ok")'
$A com eval '(progn (command "_.-IMAGE" "_A" "C:\\Users\\oveli\\AppData\\Local\\Temp\\mcaddsk\\pic.bmp" "30,0" "10" "0") "ok")'
$A com eval '(progn (command "_.-TABLE" "3" "2" "100,40") "ok")'
$A com eval '(progn (command "_.-MTEXT" "60,30" "_J" "_ML" "@30,0" "HELLO" "") "ok")'
$A com eval '(progn (command "_.MLEADER" "_C" "_M" (entlast) "50,10") "ok")'
sel() { $A com eval "(progn (sssetfirst nil (ssadd (handent \"$1\"))) \"ok\")"; }
# d01 the wipeout: a square at each vertex, none at a side's middle. d02 the image: one at each
# corner. d03 the table: a square at its top-left corner (move), squares at the column lines,
# arrows at the top right (width), bottom left (height), bottom right (both) and bottom middle
# (breaking), and the column letters and row numbers beside it.
$A com eval '(progn (command "_.ZOOM" "_W" "-5,-5" "100,40") "ok")'
sel 7F; $A shot
sel 85; $A shot
$A com eval '(progn (sssetfirst nil nil) (command "_.ZOOM" "_W" "95,0" "295,45") "ok")'
sel 86; $A shot
# d04 the multileader: a square at its arrowhead and at its landing, an arrow along the dogleg at
# its end, a square at each corner of its text's frame (30 wide). d05 the landing's hover menu
# (Stretch, Lengthen Landing, Add Leader), d06 the arrowhead's (Stretch, Add Vertex, Remove
# Leader), d07 the dogleg's arrow hot, no menu. Dragged (each undone): the landing's Stretch by
# (+0.5,-1) moves landing, dogleg and text by it; the dogleg's arrow by (+1,-1) lengthens it by 1
# and moves the text along it; the text's top-left square moves all three by the drag; the
# top-right one moves them by its Y, the bottom-left by its X, and the bottom-right sizes the
# text's frame (44, d12).
$A com eval '(progn (command "_.ZOOM" "_C" "60,30" "8") "ok")'
sel 96; $A shot
# d08–d11 the palette of each, captured from the screen where it floats (General collapsed for
# d08, the multileader's Misc, Leaders and Text): the multileader, image, wipeout and table.
for h in 96 85 7F 86; do sel $h; sleep 1; $A shot -hwnd -1 -crop 2880,300,380,740; done
$A com eval '(progn (sssetfirst nil nil) "ok")'
$A com close
