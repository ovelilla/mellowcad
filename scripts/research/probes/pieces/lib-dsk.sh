# Helpers for the Pieces review (BREAK, BREAKATPOINT, JOIN, EXPLODE)'s desktop session: the owner's AutoCAD, Spanish profile, a
# drawing of the review's own, view ZOOM C 50,25 100 on a 2560×1177 drawing area at the screen's
# (2560,182) (the second monitor): one drawing unit is 11.77 px. Press-and-drag steps go through
# MOVE's drag.ps1 (the button held between steps).
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
D=$(wslpath -w scripts/research/probes/move/drag.ps1)
O=research/probes/pieces
sx() { python3 -c "print(round(3840+($1-50)*11.77))"; }
sy() { python3 -c "print(round(770.5-($1-25)*11.77))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
dr() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$D" "$1" "$(sx "$2")" "$(sy "$3")" ${4:-} | tr -d '\r'; }
ty() { $A type "$1"; sleep 0.6; }
scr() { local o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - 500)),$(($(sy "$2") - 320)),1000,640" | tail -1); cp "$o" "$O/$3.png"; echo "$3"; }
cl() { local o; o=$($A shot -hwnd -1 -crop "2560,1180,2560,${1:-260}" | tail -1); cp "$o" "$O/$2.png"; echo "$2"; }
K=$(wslpath -w scripts/research/probes/trim/shift.ps1)
# Shift held across steps (down in one process, up in another), for a hover read with it held.
sh() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$K" "$1" | tr -d '\r'; }
