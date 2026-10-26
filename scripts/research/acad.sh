#!/usr/bin/env bash
# Drives the AutoCAD 2027 that runs on the Windows desktop (acad.exe, the full program), from WSL.
#
#   scripts/research/acad.sh <tool> [args...]
#
# <tool> is a script of scripts/research/acad/ (com, shot, cursor, type, wins, children, uia,
# launch, post); each says its arguments in its first lines. They run in Windows PowerShell 5.1, the
# one with [Marshal]::GetActiveObject. A Windows path the tool prints on a line of its own (a
# screenshot, a dump) comes back as a WSL path, ready to read. See
# .claude/skills/autocad-research/gui.md.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
tool=$1
shift
timeout "${ACAD_TIMEOUT:-60}" powershell.exe -NoProfile -ExecutionPolicy Bypass \
  -File "$(wslpath -w "$here/acad/$tool.ps1")" "$@" |
  tr -d '\r' |
  while IFS= read -r line; do
    if [[ $line =~ ^[A-Za-z]:\\[^\"]*$ ]]; then wslpath "$line"; else printf '%s\n' "$line"; fi
  done
