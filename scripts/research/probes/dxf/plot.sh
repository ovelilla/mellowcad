#!/usr/bin/env bash
# plot.sh file.dxf name: AutoCAD 2027's console plots the DXF's extents to mcaddxf\out\<name>.png
# (console.md's -PLOT), to compare the writer's file with AutoCAD's own of the same drawing.
f=$1; png=$2
D=/mnt/c/Users/oveli/AppData/Local/Temp/mcaddxf/out
W='C:\Users\oveli\AppData\Local\Temp\mcaddxf\out'
rm -f "$D/$png.png" "$D/$png-back.dwg"
id=mc-$$-$RANDOM
wtemp='C:\Users\oveli\AppData\Local\Temp'
mkdir -p "/mnt/c/Users/oveli/AppData/Local/Temp/mellowcad-acc/$id"
{
cat <<P
_ZOOM
_E
_-PLOT
_Y
Model
PublishToWeb PNG.pc3
Sun Standard (1152.00 x 900.00 Pixels)
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
_SAVEAS
2018
$W\\$png-back.dwg
_.QUIT
_Y
P
} | sed 's/$/\r/' | (cd /mnt/c && timeout 120 "/mnt/c/Program Files/Autodesk/AutoCAD 2027/accoreconsole.exe" /utf8 /noCER /l en-US /isolate $id "$wtemp\\mellowcad-acc\\$id" /i "$(wslpath -w "$f")" 2>&1) | tr -d '\r' | grep -v '^$' | grep -iE 'error|invalid|plot' | head -5
(cd /mnt/c && "/mnt/c/Program Files/Autodesk/AutoCAD 2027/accoreconsole.exe" /cleanisolate $id "$wtemp\\mellowcad-acc\\$id" >/dev/null 2>&1)
rm -rf "/mnt/c/Users/oveli/AppData/Local/Temp/mellowcad-acc/$id"
ls -la "$D/$png.png"
