#!/usr/bin/env bash
# The desktop probes' helpers of block PSD (PEDIT, SPLINEDIT review, 2026-11-05; from
# solid-inquiry/lib.sh), sourced by pedit/d<id>.sh, 3dpoly/d<id>.sh and splinedit/d<id>.sh. Needs
# AutoCAD open (acad.sh launch, es-ES), a drawing of the probe's own (acad.sh com new); the view
# window's screen origin in VX, VY (acad.sh children: 0,182 here, 2560x1177). The mouse is the
# owner's: .claude/skills/autocad-research/gui.md. Shots go to research/probes/<command>/desk/ (OUT). The
# owner's es-ES profile read DYNMODE -1, OSMODE 4133, PICKFIRST 1, SELECTIONPREVIEW 3,
# ROLLOVERTIPS 1, CLISTATE 0, GRIPS 2, GRIPMULTIFUNCTIONAL 3, ORTHOMODE 0, AUTOSNAP 55, SPLFRAME 0,
# SHORTCUTMENU 11, DYNPROMPT 1, DYNINFOTIPS 1: each probe puts back what it changes.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
OUT=${OUT:-research/probes/pedit/desk}
VX=${VX:-0} VY=${VY:-182}
defs() {
  $A com eval "(defun mpx (p / c s h d) (setq c (trans (getvar \"VIEWCTR\") 1 2) s (getvar \"SCREENSIZE\") h (getvar \"VIEWSIZE\") d (trans p 0 2)) (list (fix (+ $VX (/ (car s) 2.0) (* (- (car d) (car c)) (/ (cadr s) h)))) (fix (+ $VY (- (/ (cadr s) 2.0) (* (- (cadr d) (car (cdr c))) (/ (cadr s) h)))))))" >/dev/null
}
px() { $A com eval "(mpx (list ${1//,/ }))" | tr -d '()' ; }
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.5; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 1; }
clk() { hover "$1" "$2"; $A click "$1" "$2" left >/dev/null; sleep 0.8; }
shot() { cp "$($A shot -hwnd -1 -crop "$2" | tail -1)" "$OUT/$1.png"; echo "shot $OUT/$1.png"; }
esc() { $A key esc esc >/dev/null; sleep 0.8; }
typ() { $A type "$1" >/dev/null; sleep 0.8; }
# Erases everything; `_ERASE _ALL \n` through COM left ERASE asking again (d06).
wipe() { $A com eval '(if (setq s (ssget "_X")) (progn (command "_.ERASE" s "") "wiped") "empty")' >/dev/null; }
# AutoCAD's keyboard focus and hover need a real click in the view (type.ps1 gives the focus back
# to the owner's window): one on empty space near the view's corner, the window it starts escaped.
focus() { clk $((VX + 150)) $((VY + 150)); esc; }
