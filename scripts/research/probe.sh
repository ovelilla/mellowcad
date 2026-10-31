#!/usr/bin/env bash
# Runs a command review's console probes, traced, in a language with its own AutoCAD and in
# English, and keeps each transcript where the review cites it.
#
#   scripts/research/probe.sh [--lang <tag>] <command> [id...]
#
# A probe is scripts/research/probes/<command>/<id>.txt, one answer per line as runacc.sh takes
# it; with no ids, every probe of the command runs. Each runs twice, in the culture of --lang
# (the catalogs' BCP 47 tag, as the other research scripts take it; es, so es-ES, by default)
# and in en-US, with -t, into research/probes/<command>/<id>.<culture>.txt (gitignored: the
# transcript is Autodesk's text). The language's pack must be installed. A probe named
# <id>.plain.txt runs untraced: loading the tracer leaves undo steps of its own (SECURELOAD,
# NETLOAD, MPTRACE), which a probe of how far U and UNDO go would undo too. A probe named
# <id>[.plain].<language>.txt (es, en, pt…) runs in that language only. Runs are isolated, so
# they go in parallel (PROBE_JOBS, 4 by default). Each run prints ok, or the prompt that
# swallowed the runner's QUIT. Read a transcript without the tracer's lines, answers kept, with
# sed 's/«MP[^»]*»//g'. A desktop probe (<id>.sh, driving acad.sh) is not run here. See
# .claude/skills/command-review/annex-probes.md.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../.." && pwd)
lang=es
if [[ ${1:-} == --lang ]]; then lang=${2:?--lang takes a language tag: --lang pt-BR}; shift 2; fi
command=${1:?usage: probe.sh [--lang <tag>] <command> [id...]}
shift
# The language's culture, and the command prompt the runner's QUIT must answer, worded by its
# table (22843, `Command:`).
{ read -r culture; read -r command_prompt; } < <(node --input-type=module -e '
  const [tables, lang] = process.argv.slice(1)
  const { cultureOf, table, translatedFile } = await import(tables)
  translatedFile(lang)
  console.log(`${cultureOf(lang)}\n${table(`st2027_${lang}.tsv`).get("22843") ?? ""}`)
' "$here/tables.mjs" "$lang") || exit 1
[[ $culture && $command_prompt ]] || { echo "no culture or command prompt for $lang" >&2; exit 1; }
src="$here/probes/$command"
out="$root/research/probes/$command"
mkdir -p "$out"
if (($#)); then ids=("$@"); else
  ids=()
  for f in "$src"/*.txt; do
    [[ -e $f ]] || continue
    id=$(basename "$f" .txt)
    [[ $id =~ ^(.+)\.[a-z]{2,3}$ ]] && id=${BASH_REMATCH[1]}
    ids+=("${id%.plain}")
  done
  mapfile -t ids < <(printf '%s\n' "${ids[@]}" | sort -u)
fi
((${#ids[@]})) || { echo "no probes in $src" >&2; exit 1; }

# The probe file of <id> in <locale>, and whether it runs untraced; nothing if it is not run there.
probe_file() {
  local id=$1 lang=${2%%-*} f
  for f in "$id.txt" "$id.$lang.txt" "$id.plain.txt" "$id.plain.$lang.txt"; do
    [[ -e $src/$f ]] && { echo "$src/$f"; return; }
  done
}
export -f probe_file

run() {
  local id=$1 locale=$2 file
  file=$(probe_file "$id" "$locale")
  [[ $file ]] || return 0
  if [[ $file == *.plain.* ]]; then
    "$here/runacc.sh" "$file" "$locale" >"$out/$id.$locale.txt" 2>&1
  else
    "$here/runacc.sh" -t "$file" "$locale" >"$out/$id.$locale.txt" 2>&1
  fi
  # The runner's _.QUIT must answer the command prompt; anything else, the probe ended inside a
  # command (or an answer was refused and the rest slipped by one). Traced, a prompt is its own
  # line and its answer ends the tracer's next line, so the prompt is the line before.
  local prompt
  prompt=$(sed 's/«MP[^»]*»//g' "$out/$id.$locale.txt" | grep -v '^$' |
    awk '/_\.QUIT/ { sub(/ *_\.QUIT.*/, ""); print ($0 == "" ? last : $0); exit } { last = $0 }')
  case $prompt in
    Command: | "$command_prompt") printf '%s %s: ok\n' "$id" "$locale" ;;
    *) printf '%s %s: ENDED INSIDE A COMMAND: %s\n' "$id" "$locale" "${prompt:-no prompt}" ;;
  esac
}
export -f run
export here src out command_prompt
for id in "${ids[@]}"; do
  [[ $(probe_file "$id" "$culture")$(probe_file "$id" en-US) ]] || { echo "missing $src/$id.txt" >&2; exit 1; }
  printf '%s %s\n%s en-US\n' "$id" "$culture" "$id"
done | xargs -P "${PROBE_JOBS:-4}" -L 1 bash -c 'run "$0" "$1"' | sort
