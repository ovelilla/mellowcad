# Helpers for the Properties review's en-US desktop pass: the owner's AutoCAD launched with
# `acad.sh launch "" en-US`, its own profile, on the first monitor; a drawing of the review's own,
# view ZOOM C 50,22 120 on a 2144×1169 drawing area at the screen's (6,186): one drawing unit is
# 9.7417 px.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
O=research/probes/properties
sx() { python3 -c "print(round(1078+($1-50)*9.7417))"; }
SY() { python3 -c "print(round(770.5-($1-22)*9.7417))"; }
at() { $A click "$(sx "$1")" "$(SY "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(SY "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.8; }
# scr x y name [w h]: the screen around a drawing point (w×h px, 1000×640 by default).
scr() { local w=${4:-1000} h=${5:-640} o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - w / 2)),$(($(SY "$2") - h / 2)),$w,$h" | tail -1); cp "$o" "$O/$3.png"; echo "$3"; }
# cl name: the floating command line and the lines above it.
cl() { local o; o=$($A shot -hwnd -1 -crop "400,1180,1400,180" | tail -1); cp "$o" "$O/$1.png"; echo "$1"; }
# full name: the whole first monitor (palettes included).
full() { local o; o=$($A shot -hwnd -1 -crop "0,0,2560,1440" | tail -1); cp "$o" "$O/$1.png"; echo "$1"; }
# hov x y name [w h]: rest the cursor on a point (two moves, a pause), then capture around it.
hov() { mv "$1" "$(python3 -c "print($2+0.4)")"; mv "$1" "$2"; sleep 1.5; scr "$1" "$2" "$3" "${4:-900}" "${5:-600}"; }
# lst tag handle: LIST of the object with that handle into the history, tagged.
lst() { $A com send "_LIST (handent \"$2\") \n" >/dev/null; $A com hist 30 | sed -n '/_LIST/,$p' | grep -v -E '^Command: *$|MPHIST|^Lines|History file' | sed "s/^/$1 | /"; }
