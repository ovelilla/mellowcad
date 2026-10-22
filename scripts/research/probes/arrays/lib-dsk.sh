# Helpers for the Arrays review's desktop session (ARRAYRECT, ARRAYPOLAR, ARRAYPATH): the owner's
# AutoCAD, Spanish profile, a drawing of the review's own, view ZOOM C 50,25 100 on a 2560×1177
# drawing area at the screen's (2560,182) (the second monitor): one drawing unit is 11.77 px.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
O=research/probes/arrays
sx() { python3 -c "print(round(3840+($1-50)*11.77))"; }
sy() { python3 -c "print(round(770.5-($1-25)*11.77))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.8; }
# scr x y name [w h]: the screen around a drawing point (w×h px, 1000×640 by default).
scr() { local w=${4:-1000} h=${5:-640} o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - w / 2)),$(($(sy "$2") - h / 2)),$w,$h" | tail -1); cp "$o" "$O/$3.png"; echo "$3"; }
# cl name [h]: the command line's last lines, below the drawing area.
cl() { local o; o=$($A shot -hwnd -1 -crop "2560,1180,2560,${2:-260}" | tail -1); cp "$o" "$O/$1.png"; echo "$1"; }
# full name: the whole AutoCAD window's screen (palettes included).
full() { local o; o=$($A shot -hwnd -1 -crop "2560,0,2560,1440" | tail -1); cp "$o" "$O/$1.png"; echo "$1"; }
# hov x y name [w h]: rest the cursor on a point (two moves, a pause), then capture around it.
hov() { mv "$1" "$(python3 -c "print($2+0.4)")"; mv "$1" "$2"; sleep 1.5; scr "$1" "$2" "$3" "${4:-900}" "${5:-600}"; }
