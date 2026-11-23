#!/usr/bin/env bash
# getvars.sh file.dxf… (23/11/2026, x053): opens each DXF in AutoCAD 2027's console and prints the
# value it gives each variable of AutoCAD's R12 header (x034-2018-R12.dxf's 133 but the version,
# handles, dates and extents), one "V NAME value" per line, and the current dimension style's
# overrides and variables as DIMSTYLE ▸ Status lists them: what an R12 header of ours sets once opened.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
tmp=$(mktemp -d)
cat > "$tmp/p.txt" <<'P'
(foreach v '("INSBASE" "LIMMIN" "LIMMAX" "ORTHOMODE" "REGENMODE" "FILLMODE" "QTEXTMODE" "MIRRTEXT" "DRAGMODE" "LTSCALE" "OSMODE" "ATTMODE" "TEXTSIZE" "TRACEWID" "TEXTSTYLE" "CLAYER" "CELTYPE" "CECOLOR" "DIMSCALE" "DIMASZ" "DIMEXO" "DIMDLI" "DIMRND" "DIMDLE" "DIMEXE" "DIMTP" "DIMTM" "DIMTXT" "DIMCEN" "DIMTSZ" "DIMTOL" "DIMLIM" "DIMTIH" "DIMTOH" "DIMSE1" "DIMSE2" "DIMTAD" "DIMZIN" "DIMBLK" "DIMASO" "DIMSHO" "DIMPOST" "DIMAPOST" "DIMALT" "DIMALTD" "DIMALTF" "DIMLFAC" "DIMTOFL" "DIMTVP" "DIMTIX" "DIMSOXD" "DIMSAH" "DIMBLK1" "DIMBLK2" "DIMSTYLE" "DIMCLRD" "DIMCLRE" "DIMCLRT" "DIMTFAC" "DIMGAP" "LUNITS" "LUPREC" "SKETCHINC" "FILLETRAD" "AUNITS" "AUPREC" "MENU" "ELEVATION" "PELEVATION" "THICKNESS" "LIMCHECK" "BLIPMODE" "CHAMFERA" "CHAMFERB" "SKPOLY" "USRTIMER" "ANGBASE" "ANGDIR" "PDMODE" "PDSIZE" "PLINEWID" "COORDS" "SPLFRAME" "SPLINETYPE" "SPLINESEGS" "ATTDIA" "ATTREQ" "SURFTAB1" "SURFTAB2" "SURFTYPE" "SURFU" "SURFV" "UCSNAME" "UCSORG" "UCSXDIR" "UCSYDIR" "PUCSNAME" "PUCSORG" "PUCSXDIR" "PUCSYDIR" "USERI1" "USERI2" "USERI3" "USERI4" "USERI5" "USERR1" "USERR2" "USERR3" "USERR4" "USERR5" "WORLDVIEW" "SHADEDGE" "SHADEDIF" "TILEMODE" "MAXACTVP" "PLIMCHECK" "PEXTMIN" "PEXTMAX" "PLIMMIN" "PLIMMAX" "UNITMODE" "VISRETAIN" "PLINEGEN" "PSLTSCALE") (princ (strcat "\nV " v " " (vl-princ-to-string (getvar v))))) (princ)
_-DIMSTYLE
_ST
P
for f in "$@"; do
  echo "== $(basename "$f")"
  scripts/research/runacc.sh -i "$f" "$tmp/p.txt" en-US | grep -E '^(V |DIM| DIM|Current dim)'
done
rm -rf "$tmp"
