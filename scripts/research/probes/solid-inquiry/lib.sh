#!/usr/bin/env bash
# The desktop probes' helpers (VSD, 2026-11-05; from solid-edits/lib.sh), sourced by each d<id>.sh.
# Needs AutoCAD open (acad.sh launch, es-ES; `launch "" en-US` for the English pass), a drawing of
# the probe's own (acad.sh com new); the view window's screen origin in VX, VY (acad.sh children:
# 0,182 here, 2560x1177). The mouse is the owner's: .claude/skills/autocad-research/gui.md. Shots
# go to research/probes/solid-inquiry/desk/. The owner's es-ES profile read DYNMODE -1, OSMODE 4133,
# PICKFIRST 1, SELECTIONPREVIEW 3, ROLLOVERTIPS 1, LWDISPLAY 0, LAYLOCKFADECTL 50, GRIDMODE 1,
# UCSICON 3, NAVVCUBEDISPLAY 3, CURSORSIZE 5, SHORTCUTMENU 11: each probe puts back what it changes.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
OUT=research/probes/solid-inquiry/desk
VX=${VX:-0} VY=${VY:-182}
defs() {
  $A com eval "(defun mpx (p / c s h d) (setq c (trans (getvar \"VIEWCTR\") 1 2) s (getvar \"SCREENSIZE\") h (getvar \"VIEWSIZE\") d (trans p 0 2)) (list (fix (+ $VX (/ (car s) 2.0) (* (- (car d) (car c)) (/ (cadr s) h)))) (fix (+ $VY (- (/ (cadr s) 2.0) (* (- (cadr d) (car (cdr c))) (/ (cadr s) h)))))))" >/dev/null
}
px() { $A com eval "(mpx (list ${1//,/ }))" | tr -d '()' ; }
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.5; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 1; }
shot() { cp "$($A shot -hwnd -1 -crop "$2" | tail -1)" "$OUT/$1.png"; echo "shot $OUT/$1.png"; }
vshot() { cp "$($A shot "$VIEW" | tail -1)" "$OUT/$1.png"; echo "shot $OUT/$1.png"; }
esc() { $A key esc esc >/dev/null; sleep 0.8; }
typ() { $A type "$1" >/dev/null; sleep 0.8; }
ctrl() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w scripts/research/probes/solid-edits/ctrl.ps1)" "$1" | tr -d '\r'; }
vs() { $A com eval '(list (getvar "VSFACESTYLE") (getvar "VSEDGES") (getvar "VSEDGECOLOR") (getvar "VSSILHEDGES") (getvar "VSSILHWIDTH") (getvar "VSOBSCUREDEDGES") (getvar "VSINTERSECTIONEDGES") (getvar "VSEDGESMOOTH") (getvar "VSFACECOLORMODE") (getvar "VSEDGEJITTER") (getvar "VSEDGEOVERHANG") (getvar "VSISOONTOP") (getvar "VSLIGHTINGQUALITY") (getvar "VSMONOCOLOR") (getvar "VSFACEOPACITY") (getvar "VSMATERIALMODE") (getvar "VSOCCLUDEDEDGES") (getvar "VSHALOGAP") (getvar "VSEDGELEX") (getvar "FACETRES") (getvar "VIEWRES"))'; }
