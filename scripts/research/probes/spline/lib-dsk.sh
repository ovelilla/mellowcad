# Helpers for SPLINE's desktop session: the owner's AutoCAD, Spanish profile, a drawing of the
# review's own, view ZOOM C 50,25 100 on a 2560×1177 drawing area at the screen's (0,182): one
# drawing unit is 11.77 px.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
sx() { python3 -c "print(round(1280+($1-50)*11.77))"; }
sy() { python3 -c "print(round(770.5-($1-25)*11.77))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
ty() { $A type "$1"; sleep 0.6; }
scr() { local o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - 400)),$(($(sy "$2") - 250)),800,500" | tail -1); cp "$o" "research/probes/spline/$3.png"; echo "$3"; }
