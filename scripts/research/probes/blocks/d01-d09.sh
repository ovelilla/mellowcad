# The Blocks review's desktop pass, 2026-10-26: the owner's AutoCAD launched with
# `acad.sh launch "" en-US` (its English profile), on the second monitor, a drawing of the review's
# own (`acad.sh com new`), the view ZOOM C 50,25 120. Helpers: lib-dsk-en.sh; a dialog COM cannot
# close is closed with post.ps1 (WM_COMMAND IDCANCEL). Read before and put back at the end: OSMODE
# 4133 (0 for the pass), ATTDIA 1, ATTREQ 1 (0 for d02 on); DYNMODE stayed -1. Run step by step:
# a modal dialog or a pending prompt locks COM.
. "$(dirname "${BASH_SOURCE[0]}")/lib-dsk-en.sh"
P="powershell.exe -NoProfile -ExecutionPolicy Bypass -File $(wslpath -w scripts/research/probes/blocks/post.ps1)"
$A com eval '(setvar "OSMODE" 0)'; cs "_ZOOM _C 50,25 120\n"

# d00/d01 -BLOCK's Convert with attribute definitions opens the Edit Attributes dialog, its fields
# in selection order (`_ALL`: Prompt two, then Prompt one), the defaults filled in (d00-2), with
# ATTDIA 1 and with ATTDIA 0 alike; Cancel keeps the reference with the defaults. -INSERT with
# ATTDIA 0 asks at the command line, `-INSERT Prompt two <def2>:` (d01-2).
cs "_RECTANG 0,0 20,10\n"
cs "_-ATTDEF\n\nTAG1\nPrompt one\ndef1\n2,4\n2.5\n0\n"
cs "_-ATTDEF\n_L\n\nTAG2\nPrompt two\ndef2\n2,1\n2.5\n0\n"   # Lock position N
$A com send "_-BLOCK\nB1\n0,0\n_ALL\n\n" &                     # the dialog opens: full d00-2
# $P <hwnd of Edit Attributes> 2
$A com eval '(setvar "ATTDIA" 0)'
cs "_RECTANG 60,0 70,5\n"; cs "_-ATTDEF\n\nTAG3\nPrompt three\ndef3\n61,1\n2.5\n0\n"
$A com send "_-BLOCK\nB2\n60,0\n_W 59,-1 75,8\n\n" &           # the dialog again; $P <hwnd> 2
$A com send "_-INSERT\nB1\n30,30\n1\n1\n0\n" &                 # waits at Prompt two: d01-2
$A click 3500 1346 left 1; ty "\n"; ty "\n"

# d02 grips: a reference shows its insertion point's grip and one more on each attribute whose
# Lock position is N (TAG2), none on a locked one (d02-1, d02-2); hovering either turns it hot,
# no menu (d02-3, d02-4). A reference inserted at X -1 draws its attributes backwards (d02-1).
$A com eval '(setvar "ATTREQ" 0)'; cs "_ERASE _ALL \n"
cs "_-INSERT\nB1\n30,10\n1\n1\n0\n"; cs "_-INSERT\nB1\n80,10\n-1\n1\n0\n"
cs "_RECTANG 0,-30 20,-20\n"; cs "_-ATTDEF\n_L\n\nTAG4\nPrompt four\ndef4\n2,-27\n2.5\n0\n"
cs "_-ATTDEF\n_L\n\nTAG5\nPrompt five\ndef5\n100,-27\n2.5\n0\n"
cs "_-BLOCK\nB3\n0,-30\n_W -1,-31 21,-19\n\n"; cs "_-INSERT\nB3\n30,-20\n1\n1\n0\n"
# handles: 9A B1 at 30,10; 9E B1 at 80,10 mirrored; AD B3 at 30,-20; A4 the loose ATTDEF TAG5
$A com eval '(sssetfirst nil (ssadd (handent "9A")))'; scr 40 15 d02-1 900 500
$A com eval '(sssetfirst nil (ssadd (handent "AD")))'; scr 40 -25 d02-2 900 500
$A com eval '(sssetfirst nil (ssadd (handent "9A")))'; hov 30 10 d02-3; ty "\e\e"
$A com eval '(sssetfirst nil (ssadd (handent "9A")))'; hov 32 11 d02-4; ty "\e\e"

# d03 the Properties palette (captured by its handle): a Block Reference's General, 3D
# Visualization, Geometry (Position X/Y/Z, Scale X/Y/Z), Misc (Name greyed with the block
# editor's button, Rotation, Annotative, Block Unit, Unit factor) and Attributes (one row per tag,
# its value; TAG2 before TAG1) (d03-2); the mirrored one reads Scale X -1 (d03-3). A loose
# Attribute Definition: Text (Tag, Annotative, Prompt, Value, Style, Justify, Height, Rotation,
# Width factor, Obliquing, Direction, Boundary Width, Text alignment X/Y/Z), Misc (Upside down,
# Backward, Invisible, Constant, Verify, Preset, Multiple lines…) (d03-4); one grip at its
# insertion point (d03-5).
$A com eval '(sssetfirst nil (ssadd (handent "9A")))'; cs "_PROPERTIES\n"   # shot <palette hwnd>: d03-2
$A com eval '(sssetfirst nil (ssadd (handent "9E")))'                       # d03-3
$A com eval '(sssetfirst nil (ssadd (handent "A4")))'; scr 105 -25 d03-5 600 400   # d03-4
cs "_PROPERTIESCLOSE\n"

# d04 a double-click on a reference with attributes: `Command: _eattedit` /
# `Select a block: 40.004639,19.953271,0.000000` and the Enhanced Attribute Editor, its Attribute
# tab listing Tag, Prompt, Value (TAG2 first), the Value field, Apply, OK, Cancel (d04-2).
$A com eval '(sssetfirst nil nil)'; at 40 20 left 2            # $P <hwnd> 2; hist 8

# d05 ATTEDIT asks `Select block reference:` and opens Edit Attributes (Block name, one field per
# prompt, OK, Cancel, Previous, Next, Help) (d05-1); EATTEDIT asks `Select a block:`. A line picked:
# `That object is not a block.` (d05-3); a block with no attributes: ATTEDIT `That block has no
# editable attributes.` (d05-4), EATTEDIT `The selected block has no editable attributes.` (d05-5);
# each asks again.
$A com send '_ATTEDIT\n(handent "9A")\n' &                   # $P <hwnd> 2
$A com send '_EATTEDIT\n(handent "AD")\n' &                  # $P <hwnd> 2
cs "_LINE -40,60 -30,60 \n"; $A com send '_ATTEDIT\n(entlast)\n' &      # d05-3, then Escape
cs "_-BLOCK\nB4\n-40,60\n_L\n\n"; cs "_-INSERT\nB4\n-40,50\n1\n1\n0\n"
$A com send '_ATTEDIT\n(entlast)\n' &                        # d05-4, Escape
$A com send '_EATTEDIT\n(entlast)\n' &                       # d05-5, Escape

# d06 INSERT opens the Blocks palette (Recent tab first; Current Drawing, Recent, Favorites,
# Libraries; Options: Insertion Point on, Scale off with X/Y/Z 1, Rotation off with Angle 0,
# Auto-Placement on, Repeat Placement off, Explode off) (d06-2, d06-3). A thumbnail's right-click
# menu: Insert, Insert and Explode, Copy to Favorites — no delete (d06-4). Insert:
# `-INSERT Specify insertion point or [Basepoint/Scale/X/Y/Z/Rotate]:`, the ghost in the block's
# own colours with its attribute defaults (d06-6, d06-7); the history keeps only that prompt line
# (no command echo); U and REDO echo `-INSERT` (d06-9).
cs "_INSERT\n"; $A click 4299 861 left 1                      # the Current Drawing tab
$A click 4365 906 right 1                                     # d06-4
$A click 4420 920 left 1; mv 0 40; mv 0.5 40; scr 5 35 d06-7 700 450; at 0 40
cs "_U\n"; cs "_REDO\n"

# d07 PURGE opens the Purge dialog: Purgeable Items / Find Non-Purgeable Items, Named Items Not
# Used (All items, Blocks, … Text styles, Visual styles), Confirm each item to be purged (on),
# Purge nested items (off), Purge Unnamed Objects, Purge Checked Items, Purge All, Close (d07-1).
$A com send '_PURGE\n' &                                      # $P <hwnd> 2

# d08 BLOCK opens the Block Definition dialog: Objects' Convert to block chosen (d08-1).
$A com send '_BLOCK\n' &                                      # $P <hwnd> 2

# d09 through COM alone: Enter at -BLOCK's name says `Invalid block name.` and asks again; Enter
# at an empty Select objects defines B9 empty. In a UCS turned 30°, -BLOCK converts a line from
# (4.33,2.5) to a reference at (2.5,4.33) turned 30°, EXPLODE giving (2.5,4.33)–(6.83,6.83), as the
# console's p155.
$A com send '_-BLOCK\n\nB9\n-50,0\n\n'; $A com eval '(tblsearch "BLOCK" "B9")'
cs "_UCS _Z 30\n"; cs "_LINE 5,0 10,0 \n"; cs "_-BLOCK\nBU\n5,0\n_L\n\n"
$A com eval '(list (cdr (assoc 10 (entget (entlast)))) (cdr (assoc 50 (entget (entlast)))))'
cs "_UCS _W\n"; cs "_EXPLODE _L \n"

$A com eval '(setvar "ATTDIA" 1)'; $A com eval '(setvar "ATTREQ" 1)'; $A com eval '(setvar "OSMODE" 4133)'
$A com close; cs "_BLOCKSPALETTECLOSE\n"; cs "_QUIT\n"
