#!/usr/bin/env bash
# r12.sh (23/11/2026): what AutoCAD 2027's DXFOUT R12 makes of each object R12 lacks. Each 2018
# fixture copied to mcaddxf\r12 (from cad/serialization/dxf/fixtures) is opened in the console and
# written back as R12, ASCII, at 16 places, beside it as <name>-R12.dxf: the reference each
# conversion of writeDxf's R12 is checked against (probe x027).
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
D=/mnt/c/Users/oveli/AppData/Local/Temp/mcaddxf/r12
W='C:\Users\oveli\AppData\Local\Temp\mcaddxf\r12'
tmp=$(mktemp -d)
files=("$@"); [[ $# -eq 0 ]] && files=("$D"/*-2018.dxf)
for f in "${files[@]}"; do
  [[ $f == *-R12.dxf ]] && continue
  name=$(basename "$f" .dxf)
  rm -f "$D/$name-R12.dxf"
  printf '_DXFOUT\n%s\\%s-R12.dxf\n_V\nR12\n16\n' "$W" "$name" > "$tmp/p.txt"
  scripts/research/runacc.sh -i "$f" "$tmp/p.txt" en-US | grep -iE 'error|invalid' | head -3
  ls "$D/$name-R12.dxf" >/dev/null && echo "$name-R12.dxf"
done
rm -rf "$tmp"
