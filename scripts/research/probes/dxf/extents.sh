#!/usr/bin/env bash
# extents.sh file.dxf… (23/11/2026, x058): AutoCAD 2027's console opens each DXF this app wrote
# and prints EXTMIN and EXTMAX as opened (the header's), after REGEN and after ZOOM Extents, which
# measures the drawing again, and VIEWCTR there: the box each `$EXTMIN` and *Active view of ours
# is checked against.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
tmp=$(mktemp -d)
show() {
  printf '(progn (princ "\\n%s ") (princ (getvar "EXTMIN")) (princ " ") (princ (getvar "EXTMAX")) (princ " ") (princ (getvar "VIEWCTR")) (princ))\n' "$1"
}
{
  show OPENED
  echo _REGEN
  show REGEN
  echo _ZOOM
  echo _E
  show ZOOMED
} > "$tmp/p.txt"
for f in "$@"; do
  echo "== $(basename "$f")"
  scripts/research/runacc.sh -i "$f" "$tmp/p.txt" en-US | grep -E '^(OPENED|REGEN|ZOOMED) '
done
rm -rf "$tmp"
