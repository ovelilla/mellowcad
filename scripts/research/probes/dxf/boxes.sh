#!/usr/bin/env bash
# boxes.sh file.dxf… (23/11/2026, x058): AutoCAD 2027's console opens each DXF and prints every
# object of model space with EXTMIN and EXTMAX of it alone (the others deleted with entdel, ZOOM
# Extents, then put back), in the file's order: what each object adds to the drawing's extents,
# set beside entityWorldBox's. The console has no COM, so no vla-getboundingbox.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
tmp=$(mktemp -d)
cat > "$tmp/p.txt" <<'P'
(progn (setq s (ssget "_X" '((410 . "Model"))) i 0 n (if s (sslength s) 0)) (repeat n (setq e (ssname s i) j 0) (repeat n (if (/= j i) (entdel (ssname s j))) (setq j (1+ j))) (command "_.ZOOM" "_E") (princ (strcat "\nBOX " (itoa i) " " (cdr (assoc 0 (entget e))) " ")) (princ (getvar "EXTMIN")) (princ " ") (princ (getvar "EXTMAX")) (setq j 0) (repeat n (if (/= j i) (entdel (ssname s j))) (setq j (1+ j))) (setq i (1+ i))) (princ))
P
for f in "$@"; do
  echo "== $(basename "$f")"
  scripts/research/runacc.sh -i "$f" "$tmp/p.txt" en-US | grep -oE 'BOX .*'
done
rm -rf "$tmp"
