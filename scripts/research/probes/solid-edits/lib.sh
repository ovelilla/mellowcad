#!/usr/bin/env bash
# The desktop probes' helpers (SED, 2026-11-04; from sweeps/lib.sh), sourced by each d<id>.sh. Needs
# AutoCAD open (acad.sh launch, es-ES), a drawing of the probe's own (acad.sh com new); the view
# window's screen origin in VX, VY (acad.sh children: 0,182 here, AutoCAD on the first monitor). The
# mouse is the owner's: .claude/skills/autocad-research/gui.md. Shots go to
# research/probes/solid-edits/desk/. The owner's es-ES profile read DYNMODE -1, OSMODE 4133,
# SHORTCUTMENU 11, SUBOBJSELECTIONMODE 0, LEGACYCTRLPICK 2, SELECTIONCYCLING 0, PICKFIRST 1,
# GRIPSUBOBJMODE 1, SOLIDCHECK 1, PICKBOX 3, AUTOSNAP 55: each probe puts back what it changes.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
OUT=research/probes/solid-edits/desk
VX=${VX:-0} VY=${VY:-182}
# mpx: a world point's screen pixel; bb: the last object's bounding box.
defs() {
  $A com eval "(defun mpx (p / c s h d) (setq c (trans (getvar \"VIEWCTR\") 1 2) s (getvar \"SCREENSIZE\") h (getvar \"VIEWSIZE\") d (trans p 0 2)) (list (fix (+ $VX (/ (car s) 2.0) (* (- (car d) (car c)) (/ (cadr s) h)))) (fix (+ $VY (- (/ (cadr s) 2.0) (* (- (cadr d) (car (cdr c))) (/ (cadr s) h)))))))" >/dev/null
  $A com eval '(defun bb (/ a b) (vl-load-com) (vla-getboundingbox (vlax-ename->vla-object (entlast)) (quote a) (quote b)) (list (vlax-safearray->list a) (vlax-safearray->list b)))' >/dev/null
  $A com eval '(defun vol (h) (vl-load-com) (vla-get-volume (vlax-ename->vla-object (handent h))))' >/dev/null
}
px() { $A com eval "(mpx (list ${1//,/ }))" | tr -d '()' ; }
hover() { $A click "$1" "$2" none >/dev/null; sleep 0.5; $A click $(($1 + 1)) "$2" none >/dev/null; sleep 1; }
shot() { cp "$($A shot -hwnd -1 -crop "$2" | tail -1)" "$OUT/$1.png"; echo "shot $OUT/$1.png"; }
esc() { $A key esc esc >/dev/null; sleep 0.8; }
typ() { $A type "$1" >/dev/null; sleep 0.8; }
ctrl() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w scripts/research/probes/solid-edits/ctrl.ps1)" "$1" | tr -d '\r'; }
# The box every probe starts from: 0,0,0 to 10,10,10 seen from (-1.3,-2.2,1.6), 2D Wireframe.
box() {
  $A com send "_ERASE _ALL \n" >/dev/null
  $A com send "_BOX 0,0,0 10,10,10\n" >/dev/null
  $A com send "_-VPOINT -1.3,-2.2,1.6\n" >/dev/null
  $A com send "_ZOOM _C 5,5,5 30\n" >/dev/null
  BOXH=$($A com eval '(cdr (assoc 5 (entget (entlast))))' | tr -d '"')
}
