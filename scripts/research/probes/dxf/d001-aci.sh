#!/usr/bin/env bash
# Desktop probe: the RGB of each AutoCAD Color Index, 1 to 255, as AutoCAD 2027's AcCmColor gives
# them (the console has no COM). Launches the English desktop, reads them in a new drawing, closes
# it and quits; prints `index:r,g,b;…`, which cad/serialization/dxf/dxfColors.ts holds.
set -euo pipefail
cd "$(dirname "$0")/../../../.."
R=scripts/research/acad.sh
$R launch "" en-US
for _ in $(seq 1 60); do
  sleep 5
  if timeout 20 $R com info 2>/dev/null | grep -q "quiescent=True"; then break; fi
done
timeout 30 $R com new
timeout 120 $R com eval '(progn (vl-load-com) (setq c (vla-getinterfaceobject (vlax-get-acad-object) "AutoCAD.AcCmColor.26")) (setq out "") (setq i 1) (repeat 255 (vla-put-colorindex c i) (setq out (strcat out (itoa i) ":" (itoa (vla-get-red c)) "," (itoa (vla-get-green c)) "," (itoa (vla-get-blue c)) ";")) (setq i (1+ i))) out)'
timeout 30 $R com close
timeout 40 $R com send "_QUIT\n"
