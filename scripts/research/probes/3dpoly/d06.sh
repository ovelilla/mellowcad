#!/usr/bin/env bash
# d06 (TPO-01, row M, es-ES), COM only: a 3D polyline whose linetype is DASHED (es-ES TRAZOS) on the
# screen, beside a LINE and a PLINE of the same linetype (the plots p118, p122 drew it continuous).
# FILEDIA 1 and CELTYPE ByLayer put back. Drawn through (command) in Lisp: a COM answer ending in
# a space repeated the command and locked COM.
OUT=research/probes/3dpoly/desk; source "$(dirname "$0")/../pedit/lib.sh"
wipe
$A com set FILEDIA 0 >/dev/null
$A com eval '(if (tblsearch "LTYPE" "TRAZOS") "loaded" (progn (command "_.-LINETYPE" "_L" "TRAZOS" "acadiso.lin" "") "loading"))'
$A com set FILEDIA 1 >/dev/null
$A com set CELTYPE TRAZOS >/dev/null
$A com eval '(progn (command "_.LINE" "0,0" "100,0" "") (command "_.3DPOLY" "0,20,0" "100,20,10" "100,40,0" "") (command "_.PLINE" "0,60" "100,60" "") "drawn")'
$A com set CELTYPE ByLayer >/dev/null
$A com eval '(progn (command "_.ZOOM" "_W" "-10,-10" "110,70") (getvar "CELTYPE"))'
sleep 1
shot d06-1-linetypes 0,182,2560,1177
