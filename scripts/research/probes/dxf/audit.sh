#!/usr/bin/env bash
# audit.sh file.dxf [culture]: opens a DXF this app wrote in AutoCAD 2027's console, raw (its reader
# says why it discards a file, which runacc.sh's banner filter hides), lists its objects, AUDITs it
# and saves it as a DWG beside it. The file a check of the DXF writer (writeDxf.test.ts) opens.
f=$1; L=${2:-en-US}
name=$(basename "$f" .dxf)
D=/mnt/c/Users/oveli/AppData/Local/Temp/mcaddxf/out
W='C:\Users\oveli\AppData\Local\Temp\mcaddxf\out'
rm -f "$D/$name-back.dwg"
id=mc-$$-$RANDOM
wtemp='C:\Users\oveli\AppData\Local\Temp'
mkdir -p "/mnt/c/Users/oveli/AppData/Local/Temp/mellowcad-acc/$id"
{
cat <<P
(progn (setq s (ssget "_X") i 0 r "") (if s (repeat (sslength s) (setq r (strcat r " " (cdr (assoc 0 (entget (ssname s i)))))) (setq i (1+ i)))) (princ (strcat "\nOBJECTS:" r)) (princ))
_AUDIT
_N
_SAVEAS
2018
$W\\$name-back.dwg
_.QUIT
_Y
P
} | sed 's/$/\r/' | (cd /mnt/c && timeout 120 "/mnt/c/Program Files/Autodesk/AutoCAD 2027/accoreconsole.exe" /utf8 /noCER /l $L /isolate $id "$wtemp\\mellowcad-acc\\$id" /i "$(wslpath -w "$f")" 2>&1) | tr -d '\r' | grep -v '^$' | sed -n '/CoreHeartBeat/,$p' | grep -v 'CoreHeartBeat\|LogFilePath'
(cd /mnt/c && "/mnt/c/Program Files/Autodesk/AutoCAD 2027/accoreconsole.exe" /cleanisolate $id "$wtemp\\mellowcad-acc\\$id" >/dev/null 2>&1)
rm -rf "/mnt/c/Users/oveli/AppData/Local/Temp/mellowcad-acc/$id"
