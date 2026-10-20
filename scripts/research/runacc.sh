#!/usr/bin/env bash
# Runs a script of answers through AutoCAD's console and prints its transcript.
#
#   scripts/research/runacc.sh [-t] [-r] [-i drawing] probe.txt [es-ES]
#
#   -t  trace: load MellowProbe and run MPTRACE Db before the probe, so every prompt prints its
#       options (message, keywords, defaults) and every object the drawing gains or loses.
#       Build it first: scripts/research/mellowprobe/build.sh
#   -r  run in the user's real profile instead of a fresh isolated one (settings then persist)
#   -i  open this drawing (DWG or DXF, a WSL path) instead of a new one
#
# Each line of probe.txt is one answer, as typed at the command line. The console is Windows'
# accoreconsole.exe, run from WSL through interop. It reads its input as Windows-1252 and, with
# /utf8, writes UTF-8 (without it, UTF-16). Each run gets its own /isolate profile, cleaned
# afterwards: registry-backed variables start at their defaults and runs can go in parallel.
# The banner is dropped, so the output starts at the first prompt. A run that hangs (TEXT's
# text entry, LAYER) is cut after ACC_TIMEOUT seconds (90). See
# .claude/skills/autocad-research/console.md.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
ACCORE=${ACCORE:-"/mnt/c/Program Files/Autodesk/AutoCAD 2027/accoreconsole.exe"}
trace= real= dwg=
while getopts "tri:" o; do
  case $o in
    t) trace=1 ;;
    r) real=1 ;;
    i) dwg=$(wslpath -w "$(realpath "$OPTARG")") ;;
    *) exit 2 ;;
  esac
done
shift $((OPTIND - 1))
probe=$1 L=${2:-es-ES}
if [[ $trace && $real ]]; then
  echo "-t sets SECURELOAD 0 to load the plugin: use it only in an isolated run." >&2
  exit 2
fi

# The run's folder is on the Windows disk: the console's working directory (its default save
# paths and log go there) and, with -t, the plugin's copy (NETLOAD refuses \\wsl.localhost).
wtemp=$(cd /mnt/c && cmd.exe /c echo %TEMP% | tr -d '\r')
id=mellowcad-$$-$RANDOM
wdir="$wtemp\\mellowcad-acc\\$id"
dir=$(wslpath "$wdir")
mkdir -p "$dir"
# /noCER: a console that crashes (a probe that ends inside a command) would otherwise leave an
# error-report window open on the desktop, holding the run's folder.
args=(/utf8 /noCER /l "$L")
[[ $real ]] || args+=(/isolate "$id" "$wdir")
[[ $dwg ]] && args+=(/i "$dwg")

{
  if [[ $trace ]]; then
    cp "$here/mellowprobe/bin/out/MellowProbe.dll" "$dir/" || exit 1
    printf '_SECURELOAD\n0\n_NETLOAD\n%s\\MellowProbe.dll\nMPTRACE\nDb\n' "$wdir"
  fi
  cat "$probe"
  printf '_.QUIT\n_Y\n'
} | iconv -f utf-8 -t cp1252 | sed 's/$/\r/' |
  (cd "$dir" && timeout "${ACC_TIMEOUT:-90}" "$ACCORE" "${args[@]}" 2>&1) |
  tr -d '\r' |
  awk -v t="$trace" '
    !f && /AutoCAD menu utilities loaded|Utilidades de men/ { f = 1; if (!t) print; next }
    t && /SECURELOAD|NETLOAD|MellowProbe|MPTRACE|«MP (loaded|clm skipped|trace db)/ { next }
    f { print }' |
  grep -v "^$"

[[ $real ]] || (cd "$dir" && "$ACCORE" /cleanisolate "$id" "$wdir" >/dev/null 2>&1)
rm -rf "$dir" 2>/dev/null
