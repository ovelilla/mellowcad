#!/usr/bin/env bash
# same.sh <theirs.dxf> <ours.dxf>…: explodes every MULTILEADER of each file in AutoCAD 2027's
# console (m15) and prints how the pieces of each of ours differ from those of theirs, rounded as
# entget prints them. No output past each file's count: AutoCAD draws them alike.
here=$(cd "$(dirname "$0")" && pwd)
run=$here/../../runacc.sh
pieces() {
  "$run" -i "$1" "$here/m15.txt" en-US | grep '^((' |
    grep -o '(0 \. "[A-Z]*")\|(1[0-3] [-0-9.e ]*)\|(1 \. [^)]*)\|(4[0-1] \. [^)]*)\|(7[01] \. [^)]*)\|(2 \. [^)]*)' |
    tr '\n' ' ' | sed 's/(0 \. /\n(0 . /g' | sort
}
theirs=$(pieces "$1")
shift
for f in "$@"; do
  ours=$(pieces "$f")
  echo "== $(basename "$f"): $(wc -l <<<"$ours") pieces, theirs $(wc -l <<<"$theirs")"
  diff <(echo "$theirs") <(echo "$ours") | head -20
done
