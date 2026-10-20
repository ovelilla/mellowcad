#!/usr/bin/env bash
# Runs a script of answers through AutoCAD's console and prints its transcript.
#
#   scripts/research/runacc.sh probe.txt [es-ES]
#
# Each line of probe.txt is one answer, as typed at the command line. The
# console is Windows' accoreconsole.exe, run from WSL through interop: it
# wants CRLF, writes Windows-1252 and is quit at the end; its banner is
# dropped, so the output starts at the first prompt. A run that hangs (TEXT's
# text entry, LAYER) is cut after 90 s. See
# .github/instructions/autocad-research.instructions.md.
ACCORE=${ACCORE:-"/mnt/c/Program Files/Autodesk/AutoCAD 2027/accoreconsole.exe"}
L=${2:-es-ES}
{ sed 's/$/\r/' "$1"; printf '_.QUIT\r\n_Y\r\n'; } |
  timeout 90 "$ACCORE" /l "$L" 2>&1 |
  tr -d '\0' | sed 's/\r//g' | iconv -f cp1252 -t utf-8 |
  awk 'f||/AutoCAD menu utilities loaded|Utilidades de men/{f=1;print}' | grep -v "^$"
