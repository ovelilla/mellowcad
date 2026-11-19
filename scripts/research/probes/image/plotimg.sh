#!/usr/bin/env bash
# plotimg.sh <dxf (wsl path)> <png name> [extra answers file]: open, run extras, plot extents hi-res
f=$1; png=$2; extra=${3:-/dev/null}
W='C:\Users\oveli\AppData\Local\Temp\mcaddxf\img'
rm -f /mnt/c/Users/oveli/AppData/Local/Temp/mcaddxf/img/$png.png
p=$(mktemp --suffix=.txt)
{ cat "$extra"; cat <<P
_ZOOM
_E
(princ (getvar "EXTMIN"))
(princ (getvar "EXTMAX"))
_-PLOT
_Y
Model
PublishToWeb PNG.pc3
Sun Hi-Res (1600.00 x 1280.00 Pixels)
_L
_N
_E
_F
_C
_Y
monochrome.ctb
_Y
_A
$W\\$png.png
_N
_Y
P
} > $p
"$(dirname "$0")/../../runacc.sh" -i "$f" $p ${ACCLANG:-en-US} 2>&1 | grep -v '^Command:$'
rm -f $p
