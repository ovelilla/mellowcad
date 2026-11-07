#!/usr/bin/env bash
# Puts the DXF probes' inputs where they read them, Windows' %TEMP%\mcaddxf: the files written
# by hand that the t-* and r-* probes open (what AutoCAD's strict reader discards), a truncated
# DXF (x009), a non-DXF (x010) and AutoCAD's own DXF of the reference drawing (x004–x006, x013),
# from the reader's fixtures, and removes what earlier runs saved. f002 opens the fixture.dwg
# that f001 writes, f005 the fixture2.dwg of f004: run those first.
set -euo pipefail
root=$(cd "$(dirname "$0")/../../../.." && pwd)
dir=$(wslpath "$(cd /mnt/c && cmd.exe /c echo %TEMP% | tr -d '\r')")/mcaddxf
mkdir -p "$dir"
# What earlier runs wrote, which SAVEAS would ask to replace (f001 deletes its own DWG).
rm -f "$dir"/x0*.dxf "$dir"/x0*.dwg "$dir"/fixture-*.dxf "$dir"/fixture2-*.dxf "$dir"/fixture*-back.dwg "$dir"/big*.d* "$dir"/*.bak
# Each file is written with CRLF line ends, as AutoCAD writes a DXF.
put() { printf '%b' "$2" | sed 's/$/\r/' > "$dir/$1"; }
line='  0\nLINE\n  8\n0\n 10\n0.0\n 20\n0.0\n 30\n0.0\n 11\n10.0\n 21\n5.0\n 31\n0.0'
put ent-only.dxf "  0\nSECTION\n  2\nENTITIES\n$line\n  0\nCIRCLE\n  8\nMYLAYER\n 10\n5.0\n 20\n5.0\n 30\n0.0\n 40\n2.5\n  0\nENDSEC\n  0\nEOF"
put no-eof.dxf "  0\nSECTION\n  2\nENTITIES\n$line\n  0\nENDSEC"
put unknown-ent.dxf "  0\nSECTION\n  2\nENTITIES\n  0\nFOOBAR\n  8\n0\n 10\n1.0\n$line\n  0\nENDSEC\n  0\nEOF"
put bad-code.dxf "  0\nSECTION\n  2\nENTITIES\n$line\n 77\n3\n  0\nENDSEC\n  0\nEOF"
put missing-end.dxf "  0\nSECTION\n  2\nENTITIES\n  0\nLINE\n  8\n0\n 10\n3.0\n 20\n4.0\n  0\nCIRCLE\n  8\n0\n 10\n5.0\n 20\n5.0\n  0\nENDSEC\n  0\nEOF"
put min2018.dxf "  0\nSECTION\n  2\nHEADER\n  9\n\$ACADVER\n  1\nAC1032\n  0\nENDSEC\n  0\nSECTION\n  2\nENTITIES\n$line\n  0\nENDSEC\n  0\nEOF"
put bad-number.dxf "  0\nSECTION\n  2\nENTITIES\n  0\nLINE\n  8\n0\n 10\nabc\n 20\n0.0\n 30\n0.0\n 11\n10.0\n 21\n5.0\n 31\n0.0\n  0\nENDSEC\n  0\nEOF"
put garbage.dxf 'hello world\nthis is not a dxf'
gunzip -c "$root/cad/serialization/dxf/fixtures/fixture-2018.dxf.gz" > "$dir/in-2018.dxf"
head -c 60000 "$dir/in-2018.dxf" > "$dir/trunc.dxf"
echo "inputs in $dir"
