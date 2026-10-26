# Helpers for the Dimensions review's en-US desktop pass: the owner's AutoCAD launched with
# `acad.sh launch "" en-US`, its own profile, on the second monitor; a drawing of the review's own,
# view ZOOM C 50,25 120 on a 2156×1177 drawing area at the screen's (2560,182): one drawing unit is
# 9.80833 px.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
O=research/probes/dimensions
sx() { python3 -c "print(round(3638+($1-50)*9.80833))"; }
SY() { python3 -c "print(round(770.5-($1-25)*9.80833))"; }
at() { $A click "$(sx "$1")" "$(SY "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(SY "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.8; }
# scr x y name [w h]: the screen around a drawing point (w×h px, 1000×640 by default).
scr() { local w=${4:-1000} h=${5:-640} o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - w / 2)),$(($(SY "$2") - h / 2)),$w,$h" | tail -1); cp "$o" "$O/$3.png"; echo "$3"; }
# full name: the whole second monitor (palettes and dialogs included).
full() { local o; o=$($A shot -hwnd -1 -crop "2560,0,2560,1440" | tail -1); cp "$o" "$O/$1.png"; echo "$1"; }
hov() { mv "$1" "$(python3 -c "print($2+0.4)")"; mv "$1" "$2"; sleep 1.5; scr "$1" "$2" "$3" "${4:-900}" "${5:-600}"; }
cs() { $A com send "$1" >/dev/null; sleep 0.5; }
hist() { $A com hist "${1:-15}" | grep -v -E 'MPHIST|History file|^Lines'; }
