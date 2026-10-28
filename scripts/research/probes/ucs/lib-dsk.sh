# Helpers for the UCS review's desktop pass (block UCD): the owner's AutoCAD launched with
# `acad.sh launch "" en-US` (or the es-ES profile for e01), on the second monitor; a drawing of
# the review's own, view ZOOM C 50,25 120 on a 2156×1177 drawing area at the screen's (2560,182):
# one drawing unit is 9.80833 px there. A view that moves invalidates sx/SY: re-centre first.
# Read before and put back: OSMODE 4133, DYNMODE -1, UCSICON 3, UCSSELECTMODE 1, NAVVCUBEDISPLAY 1.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
O=research/probes/ucs
mkdir -p "$O"
sx() { python3 -c "print(round(3638+($1-50)*9.80833))"; }
SY() { python3 -c "print(round(770.5-($1-25)*9.80833))"; }
at() { $A click "$(sx "$1")" "$(SY "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(SY "$2")" none 1 ${3:-}; }
px() { $A click "$1" "$2" "${3:-left}" "${4:-1}"; }
ty() { $A type "$1"; sleep 0.8; }
scr() { local w=${4:-1000} h=${5:-640} o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - w / 2)),$(($(SY "$2") - h / 2)),$w,$h" | tail -1); cp "$o" "$O/$3.png"; echo "$O/$3.png"; }
crop() { local o; o=$($A shot -hwnd -1 -crop "$1" | tail -1); cp "$o" "$O/$2.png"; echo "$O/$2.png"; }
full() { local o; o=$($A shot -hwnd -1 -crop "2560,0,2560,1440" | tail -1); cp "$o" "$O/$1.png"; echo "$O/$1.png"; }
cs() { $A com send "$1" >/dev/null; sleep 0.5; }
hist() { $A com hist "${1:-15}" | grep -v -E 'MPHIST|History file|^Lines'; }
gv() { for v in "$@"; do printf '%s=%s ' "$v" "$($A com eval "(getvar \"$v\")" | tail -1 | tr -d '\r')"; done; echo; }
home() { cs "_ZOOM _C 50,25 120\n"; }
