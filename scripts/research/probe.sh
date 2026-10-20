#!/usr/bin/env bash
# Runs a command review's console probes, traced, in Spanish and English, and keeps each
# transcript where the review cites it.
#
#   scripts/research/probe.sh <command> [id...]
#
# A probe is scripts/research/probes/<command>/<id>.txt, one answer per line as runacc.sh takes
# it; with no ids, every probe of the command runs. Each runs twice, es-ES and en-US, with -t,
# into research/probes/<command>/<id>.<locale>.txt (gitignored: the transcript is Autodesk's
# text). Runs are isolated, so they go in parallel (PROBE_JOBS, 4 by default). Each run prints ok,
# or the prompt that swallowed the runner's QUIT. Read a transcript without the tracer's lines,
# answers kept, with sed 's/«MP[^»]*»//g'. A desktop probe (<id>.sh, driving acad.sh) is not
# run here. See .claude/skills/command-review/annex-probes.md.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../.." && pwd)
command=${1:?usage: probe.sh <command> [id...]}
shift
src="$here/probes/$command"
out="$root/research/probes/$command"
mkdir -p "$out"
if (($#)); then ids=("$@"); else
  ids=()
  for f in "$src"/*.txt; do [[ -e $f ]] && ids+=("$(basename "$f" .txt)"); done
fi
((${#ids[@]})) || { echo "no probes in $src" >&2; exit 1; }

run() {
  local id=$1 locale=$2
  "$here/runacc.sh" -t "$src/$id.txt" "$locale" >"$out/$id.$locale.txt" 2>&1
  # The runner's _.QUIT must land at the command prompt; anywhere else, the probe ended inside a
  # command (or an answer was refused and the rest slipped by one).
  local quit
  quit=$(sed 's/«MP[^»]*»//g' "$out/$id.$locale.txt" | grep -m 1 '_\.QUIT')
  case $quit in
    Command:* | Comando:*) printf '%s %s: ok\n' "$id" "$locale" ;;
    *) printf '%s %s: ENDED INSIDE A COMMAND: %s\n' "$id" "$locale" "${quit:-no prompt}" ;;
  esac
}
export -f run
export here src out
for id in "${ids[@]}"; do
  [[ -e $src/$id.txt ]] || { echo "missing $src/$id.txt" >&2; exit 1; }
  printf '%s es-ES\n%s en-US\n' "$id" "$id"
done | xargs -P "${PROBE_JOBS:-4}" -L 1 bash -c 'run "$0" "$1"' | sort
