# Helpers for ERASE's desktop session: the owner's AutoCAD, Spanish profile, a drawing of the
# review's own, view ZOOM C 50,25 100 on a 2560×1177 drawing area at the screen's (0,182): one
# drawing unit is 11.77 px. drag steps go through drag.ps1 (the button held between steps).
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
D=$(wslpath -w scripts/research/probes/erase/drag.ps1)
sx() { python3 -c "print(round(1280+($1-50)*11.77))"; }
sy() { python3 -c "print(round(770.5-($1-25)*11.77))"; }
at() { $A click "$(sx "$1")" "$(sy "$2")" "${3:-left}" "${4:-1}" ${5:-}; }
mv() { $A click "$(sx "$1")" "$(sy "$2")" none 1 ${3:-}; }
dr() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$D" "$1" "$(sx "$2")" "$(sy "$3")" ${4:-} | tr -d '\r'; }
sp() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$D" key 32 0 | tr -d '\r'; }
ty() { $A type "$1"; sleep 0.6; }
scr() { local o; o=$($A shot -hwnd -1 -crop "$(($(sx "$1") - 500)),$(($(sy "$2") - 320)),1000,640" | tail -1); cp "$o" "research/probes/erase/$3.png"; echo "$3"; }
cl() { local o; o=$($A shot -hwnd -1 -crop "0,1180,2560,${1:-260}" | tail -1); cp "$o" "research/probes/erase/$2.png"; echo "$2"; }
