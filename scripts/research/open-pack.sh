#!/usr/bin/env bash
# Extracts a language's string tables and acad.pgp from Autodesk's installers, without installing
# or running anything: 7-Zip opens them, and extract-strings.mjs reads what it takes out.
#
#   scripts/research/open-pack.sh --lang <tag> <update.exe> <pack.exe> [--replace]
#   scripts/research/open-pack.sh --lang <tag> <pack.exe> [--replace]
#
# The tables come from the update (AutoCAD_2027.1_Update.exe carries every culture's resource
# DLLs, whole) and acad.pgp from the language pack, which the update does not carry. A pack alone
# is the release build: 2027.1 rewords 101 strings of pt-BR's (`extremidade` became `ponto
# final`), and its Spanish is the installed one's string for string, so a table from a pack alone
# is not the current product. Both files are linked from the forum thread "2027 Product download
# links" (up1.autodesk.com/prd/2027/ACD/…); docs/i18n/<tag>.md names the ones it used.
#
# Inside each .exe: x64/<culture>/acadlp/acadlp.adix, a zip whose
# VFS/ProgramFilesX64/Autodesk/AutoCAD%202027/<culture>/ holds the DLLs, and (the pack only)
# x64/<culture>/acadps/PF/Root/UserDataCache/Support/acad.pgp. 7-Zip is not in Ubuntu's base
# install: 7-Zip's own Linux build (7-zip.org, `7zz`, no install) works from any folder, named
# by SEVENZIP or found on PATH. See .claude/skills/autocad-research/SKILL.md.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
lang=
args=()
while (($#)); do
  case $1 in
    --lang) lang=${2:?--lang takes a language tag: --lang pt-BR}; shift 2 ;;
    *) args+=("$1"); shift ;;
  esac
done
[[ $lang ]] || { echo "usage: open-pack.sh --lang <tag> [<update.exe>] <pack.exe> [--replace]" >&2; exit 1; }
replace=()
exes=()
for a in "${args[@]}"; do [[ $a == --replace ]] && replace=(--replace) || exes+=("$(realpath "$a")"); done
((${#exes[@]} == 1 || ${#exes[@]} == 2)) || { echo "give the update and the pack, or the pack alone" >&2; exit 1; }
sevenzip=${SEVENZIP:-$(command -v 7zz || command -v 7z || true)}
[[ $sevenzip ]] || { echo "no 7-Zip: get 7-zip.org's Linux build and set SEVENZIP to its 7zz" >&2; exit 1; }
culture=$(node --input-type=module -e '
  const { cultureOf } = await import(process.argv[1])
  console.log(cultureOf(process.argv[2]))
' "$here/tables.mjs" "$lang")

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
dlls_from=${exes[0]}
pack=${exes[-1]}
((${#exes[@]} == 2)) || echo "No update given: the tables are the release build's." >&2

"$sevenzip" x -y -o"$work/dlls" "$dlls_from" "x64/$culture/acadlp/acadlp.adix" >/dev/null
"$sevenzip" e -y -o"$work/$culture" "$work/dlls/x64/$culture/acadlp/acadlp.adix" \
  "VFS/ProgramFilesX64/Autodesk/AutoCAD%202027/$culture/*.dll" >/dev/null
"$sevenzip" e -y -o"$work/pgp" "$pack" \
  "x64/$culture/acadps/PF/Root/UserDataCache/Support/acad.pgp" >/dev/null
node "$here/extract-strings.mjs" --lang "$lang" "$work/$culture" --pgp "$work/pgp/acad.pgp" "${replace[@]}"
