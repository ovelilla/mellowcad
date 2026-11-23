#!/usr/bin/env bash
# back.sh file.dxf…: what AutoCAD 2027 makes of an R12 DXF's hatches (x034–x045). Its console
# opens each file, where a hatch is still a reference to its anonymous block, LISTs those references
# (it reads the pattern, scale, angle and `Associative` from their HATCH xdata), AUDITs, runs
# CONVERT's Hatch on all of them, which is what turns each into a HATCH from its R14_HATCH_DATA,
# and writes the result as 2018, ASCII, at 16 places, beside the file as <name>-back.dxf.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
tmp=$(mktemp -d)
for f in "$@"; do
  dir=$(dirname "$f") name=$(basename "$f" .dxf)
  rm -f "$dir/$name-back.dxf"
  cat > "$tmp/p.txt" <<P
_QAFLAGS
2
_ZOOM
_E
_LIST
(ssget "_X" '((0 . "INSERT")))

_AUDIT
_N
_CONVERT
_H
_A
_DXFOUT
$(wslpath -w "$dir")\\$name-back.dxf
_V
2018
16
P
  echo "== $name"
  ACC_TIMEOUT=${ACC_TIMEOUT:-25} scripts/research/runacc.sh -i "$f" "$tmp/p.txt" en-US |
    grep -E 'Block Name|Hatch |Associative|errors found|converted|rror|nvalid' |
    grep -v 'Total errors found 0 fixed 0' | sed 's/^ *//' | paste -sd'|' | sed 's/|Block Name/\nBlock Name/g'
  ls "$dir/$name-back.dxf" > /dev/null
done
rm -rf "$tmp"
