#!/usr/bin/env bash
# The desktop probes' helpers (PDT, 2026-11-03), sourced by each d<id>.sh. Needs AutoCAD open
# (acad.sh launch "" en-US, or es-ES), a drawing of the probe's own (acad.sh com new); the view
# window's screen origin in VX, VY (acad.sh children: 2560,182 in both profiles here). The mouse is
# the owner's: .claude/skills/autocad-research/gui.md. Shots go to research/probes/primitives/desk/.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
OUT=research/probes/primitives/desk
VX=${VX:-2560} VY=${VY:-182}
# mpx: a world point's screen pixel; bb: the last object's bounding box; ht: its LIST's lines.
defs() {
  $A com eval "(defun mpx (p / c s h d) (setq c (trans (getvar \"VIEWCTR\") 1 2) s (getvar \"SCREENSIZE\") h (getvar \"VIEWSIZE\") d (trans p 0 2)) (list (fix (+ $VX (/ (car s) 2.0) (* (- (car d) (car c)) (/ (cadr s) h)))) (fix (+ $VY (- (/ (cadr s) 2.0) (* (- (cadr d) (car (cdr c))) (/ (cadr s) h)))))))" >/dev/null
  $A com eval '(defun bb (/ a b) (vl-load-com) (vla-getboundingbox (vlax-ename->vla-object (entlast)) (quote a) (quote b)) (list (vlax-safearray->list a) (vlax-safearray->list b)))' >/dev/null
}
px() { $A com eval "(mpx (list ${1//,/ }))" | tr -d '()' ; }
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.5; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 1; }
shot() { cp "$($A shot -hwnd -1 -crop "$2" | tail -1)" "$OUT/$1.png"; echo "shot $OUT/$1.png"; }
esc() { $A key esc esc >/dev/null; sleep 0.8; }
typ() { $A type "$1" >/dev/null; sleep 0.8; }
