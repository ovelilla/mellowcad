# Helpers for the Workspace review's desktop pass (block WSD): the owner's AutoCAD launched with
# `acad.sh launch "" en-US` (the es-ES profile for e01), on the second monitor at (2560,0), its
# drawing area 2560,182 2156x1177 with the Assistant docked at the right. Screenshot pixels of a
# 2000-wide reading are ×1.28; `p` takes those and clicks the screen. Read before and put back:
# OSMODE 4133, DYNMODE -1, AUTOSNAP 55, POLARDIST 0, SNAPUNIT 10,10, SNAPTYPE 0, SNAPMODE 0,
# GRIDMODE 0, LWDISPLAY 0, SELECTIONCYCLING 0, ORTHOMODE 0, CLEANSCREENSTATE 0, QAFLAGS 0.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
O=research/probes/workspace
mkdir -p "$O"
X() { python3 -c "print(round(2560+$1*1.28))"; }
Y() { python3 -c "print(round($1*1.28))"; }
p() { $A click "$(X "$1")" "$(Y "$2")" "${3:-left}" 1 ${4:-} >/dev/null; sleep 0.8; }
ty() { $A type "$1"; sleep 0.8; }
k() { $A key "$@"; sleep 0.8; }
full() { local o; o=$($A shot -hwnd -1 -crop "2560,0,2560,1440" | tail -1); cp "$o" "$O/$1.png"; echo "$O/$1.png"; }
crop() { local o; o=$($A shot -hwnd -1 -crop "$1" | tail -1); cp "$o" "$O/$2.png"; echo "$O/$2.png"; }
cs() { $A com send "$1" >/dev/null; sleep 0.5; }
hist() { $A com hist "${1:-15}" | grep -v -E 'MPHIST|History file|^Lines'; }
gv() { for v in "$@"; do printf '%s=%s ' "$v" "$($A com eval "(getvar \"$v\")" | tail -1 | tr -d '\r')"; done; echo; }
