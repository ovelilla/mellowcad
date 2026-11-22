#!/usr/bin/env bash
# ucs.sh (22/11/2026): the named UCSs of a DXF this app wrote, read back by AutoCAD 2027's console.
# For each file of x023's drawing that writeDxf.test.ts writes (DXF_OUT), the UCS table AutoCAD
# reads (x025: each record's name, origin and axes), UCSNAME, the UCS, UCSICON, and beta restored
# by name; then audit.sh on it. Seen: the 12 files read as AutoCAD's own x023-2018.dxf.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
D=/mnt/c/Users/oveli/AppData/Local/Temp/mcaddxf/out
for f in "$D"/ucs-20*.dxf; do
  echo "== $(basename "$f")"
  scripts/research/runacc.sh -i "$f" scripts/research/probes/dxf/x025.txt en-US |
    grep -E '^UCS |^"|^\(|^[0-9]+$|Command: _UCS|restore'
  scripts/research/probes/dxf/audit.sh "$f" | grep -E 'errors found|DXF|Invalid|error' | head -3
done
