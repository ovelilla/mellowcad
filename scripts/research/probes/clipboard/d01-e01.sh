# The Clipboard review's desktop pass (block CFD), 2026-10-29: d01–d08 in the en-US profile
# (`acad.sh launch "" en-US`), e01 in the es-ES one (`acad.sh launch`). The owner's Windows clipboard
# saved first and put back after (a desktop COPYCLIP overwrites it). Drawings of the review's own
# (`acad.sh com new`, `com netload` for `hist`); the en-US drawing area 2560,182 2156x1177 on the
# second monitor, `_ZOOM _C 0,0 400` (2.9425 px a unit). Read before and put back: OSMODE 4133,
# DYNMODE -1, FILEDIA 1. COM's SendCommand turns DYNMODE negative while it runs and puts it back
# after, so `com set`/`(setvar)` of DYNMODE do not hold and a command sent through COM shows no
# dynamic input: type DYNMODE at the prompt (`type -text '-1\n'`: a bare `-1` is a switch to
# PowerShell) and start the command by typing it.
cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." || exit 1
A=scripts/research/acad.sh
H() { $A com hist "${1:-12}" | grep -v -E 'MPHIST|History file|^Lines|^«|setvar'; }
sx() { python3 -c "print(round(2560+1078+$1*2.9425))"; }
sy() { python3 -c "print(round(182+588.5-$1*2.9425))"; }

# d01 COPYCLIP a line 10,10–60,30 and a circle 100,50 r20, PASTECLIP at 200,200: the line lands at
# 200,200–250,220 (the lower-left of the extents is the base), LASTPOINT (200 200 0), nothing left
# selected (no grips, d01-1; `(ssget "_I")` nil).
$A com send "_LINE 10,10 60,30\n\n"; $A com send "_CIRCLE 100,50 20\n"
$A com send "_COPYCLIP _ALL\n\n"; $A com send "_PASTECLIP 200,200\n"; $A com dump

# d02 COPYBASE with the base 0,0,10 of a line 0,0,0–50,0,0, PASTECLIP 100,100: the line at Z -10;
# after `_UCS _Z 30`, PASTECLIP 100,100: (36.6025,136.6025,-10)–(79.9038,161.6025,-10), turned
# with the UCS; `100,100,5` taken (Z -5). FOO and Enter: `Point or option keyword required.`, asked
# again; `@` lands at LASTPOINT. The trace: INSERT's jig, `udKWORD, udDRAG, udGETZ`, the keywords
# Scale PScale Rotate PRotate Basepoint Explode REpeat hidden (not listed in the prompt); a
# temporary block inserted and exploded.
$A com send "_COPYBASE 0,0,10 _L\n\n"; $A com send "_PASTECLIP 100,100\n"
$A com send "_UCS _Z 30\n"; $A com send "_PASTECLIP 100,100\n"; $A com send "_PASTECLIP 100,100,5\n"
$A com send "_PASTECLIP\nFOO\n300,300\n"; $A com send "_PASTECLIP\n\n300,0\n"; H 20

# d03 Source: L1 red with a line, L2 green with a line, a block B1 (a circle) inserted at 100,0;
# COPYCLIP _ALL; a new drawing with L2 blue and B1 a vertical line; PASTECLIP 200,0: L1 added red,
# L2 still blue, B1 still the target's line. Nothing said.
$A com eval '(progn (command "_.-LAYER" "_M" "L1" "_C" "1" "" "_M" "L2" "_C" "3" "" "_S" "0" "") T)'

# d04 The jig (typed PASTECLIP, the mouse moved): the fragment drawn as the objects are, in their
# own colours (a red circle red), the cursor at its base (d04-1, d04-3); with DYNMODE 3 the box
# `Specify insertion point:` with X and Y fields, no ↓ (d04-4). `50<90` in the box lands at 0,50;
# a click places it; nothing selected after (d04-5, d04-6); `(ssget "_P")` is the pasted set.
# COPYBASE's `Specify base point:` box: X and Y (d04-7).
$A type "PASTECLIP\n"; $A click "$(sx 100)" "$(sy -60)" none; $A shot -hwnd -1 -crop "2560,182,2156,1177"

# d05 Ctrl+C at Command: with a preselection `_copyclip 1 found`, U `COPYCLIP GROUP`; inside LINE
# `*Cancel*`, `_copyclip`, `Select objects:`. Ctrl+Shift+C `_copybase`, U `COPYBASE GROUP`; Ctrl+X
# `_cutclip 2 found`, U `CUTCLIP GROUP`; Ctrl+V `_pasteclip Specify insertion point:`, U
# `PASTECLIP GROUP`, inside LINE after `*Cancel*`. The Default menu's Clipboard ▸ Cut, Cut with
# Base Point, Copy, Copy with Base Point, Paste, Paste as Block, Paste as Hyperlink, Paste to
# Original Coordinates, Paste Special... with their keys (d05-2); its Paste: `_pasteclip`, U
# `PasteCtrl+V GROUP`.
$A key ctrl+c; $A key ctrl+shift+c; $A key ctrl+x; $A key ctrl+v; $A click 3300 400 right

# d06 Ctrl+A inside LINE: `*Cancel*`, `_ai_selall Selecting objects...done.` on one line, grips on
# everything (d06-1); U `AI_SELALL GROUP`.
$A key ctrl+a

# d07 Windows' clipboard emptied ([System.Windows.Forms.Clipboard]::Clear() in an -STA PowerShell):
# `_PASTECLIP` writes nothing and ends; U `PASTECLIP`. Ctrl+V `_pasteclip`, U `GROUP PASTECLIP`.

# d08 Inside LINE each cancels it (`*Cancel*`): the QAT's New `_qnew` (Select template, cancelled:
# U `GROUP QNEW`), Open `_open` (`GROUP OPEN`), Save `_QSAVE` on an untitled drawing (Save Drawing
# As, `GROUP QSAVE`), Save As `_SAVEAS` (`GROUP SAVEAS`); the application menu's New `_NEW`, Open
# `_OPEN`, Save `_QSave`, Save As `_SAVEAS`, the same groups. On a titled drawing (`_.SAVEAS` with
# FILEDIA 0 to a temp file) Ctrl+S `_qsave` and the QAT's Save `_QSAVE` save silently, U
# `QSAVE GROUP Regenerating model.`, the edit kept. QAT New 2628,14, Open 2652, Save 2676, Save As
# 2699 (2722 is Plot); the application menu 2582,14, its New 2640,126, Open 172, Save 218, Save As 264.
$A click 2628 14; $A wins; $A post "<hwnd>"; $A com send "_U\n"; H 8

# e01 es-ES: Ctrl+V U `PEGAPP GRUPO`; Portapapeles ▸ Cortar Ctrl+X, Cortar con punto base
# Ctrl+Mayús+X, Copiar Ctrl+C, Copiar con punto base Ctrl+Mayús+C, Pegar Ctrl+V … (e01-2); U after
# Pegar `PegarCtrl+V GRUPO`, Copiar `CopiarCtrl+C GRUPO`, Copiar con punto base `Copiar con punto
# baseCtrl+Mayús+C GRUPO`.
