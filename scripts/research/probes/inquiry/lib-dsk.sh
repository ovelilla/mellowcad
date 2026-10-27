# The es-ES pass's helpers: the owner's AutoCAD launched with `acad.sh launch` (the Spanish profile),
# the same view on a 2560×1177 drawing area at the screen's (2560,182); the rest is lib-dsk-en.sh.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk-en.sh"
sx() { python3 -c "print(round(3840+($1-50)*9.80833))"; }
