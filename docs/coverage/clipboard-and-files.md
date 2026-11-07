# Clipboard and files

### `COPYCLIP` / `CUTCLIP` / `COPYBASE` / `PASTECLIP` / Ctrl+A · es `COPIAPP` / `CORTAPP` / `COPIARBASE` / `PEGAPP` · pt-BR `COPIACORTE` / `RECORTAT` / `COPIABASE` / `COLARAT`

**Implemented:** all four plus select-all; COPYBASE's `Specify base point:` refuses Enter and what
is no point with `Invalid point.` and asks again (clipboard/p106, p107); COPYCLIP and COPYBASE keep
a preselection, CUTCLIP drops it (erase/p250, clipboard/p121, p124); their `Select objects:` takes
whole objects, CUTCLIP's sub-objects too (erase/p259, clipboard/p127); an object on a locked layer
is found and refused, `1 was on a locked layer.` (p119); PASTECLIP asks `Specify insertion point:` (es
`Precise punto de inserción`), INSERT's point (desktop d02): a Z taken (the base point's Z kept off
it), Enter and what is no point refused with `Point or option keyword required.` (es `Se requiere un
punto o una opción.`) and asked again, LASTPOINT the insertion point (d01); the set laid at it by the
lower-left of its extents (COPYCLIP) or COPYBASE's point, in the current UCS as INSERT lays a block,
its WCS coordinates read as the UCS's (d02: turned with a UCS turned 30°; a tilted UCS the same);
the ghost the objects as they land, in their own colours on the layers they bring (d04-3); nothing
selected after, the pasted set the Previous one (d01, d04-5, d04-6); Enter at `Command:` repeating
it (p118), U naming it `PASTECLIP` (es `PEGAPP`, p104); with nothing on the clipboard nothing written,
a typed PASTECLIP an empty step U names `PASTECLIP` (d07); the shortcut menu's Clipboard entries a
group U names by the label and the key as the menu shows it, glued: `PasteCtrl+V GROUP`, `GROUP
PasteCtrl+V` with nothing pasted (d05), es `PegarCtrl+V GRUPO`, `CopiarCtrl+C GRUPO`, `Copiar con
punto baseCtrl+Mayús+C GRUPO` (e01); English `CutCtrl+X`, `CopyCtrl+C` and `Copy with Base
PointCtrl+Shift+C` by that pattern (CLIPBOARD-D21); a paste dropped when a command starts or Escape
is pressed while the clipboard is read (no probe: AutoCAD's read is synchronous); `Clipboard` port
with a session fallback, table
reconciliation across drawings (destination name wins; an array's anonymous block lands under a
fresh `*U<n>`, arrays/p410), single undo on paste, bounded read timeout,
editable-field guard for Ctrl+C/X/V/A; Ctrl+C, Ctrl+X, Ctrl+Shift+C and Ctrl+V are acad.cuix's
`^C^C_copyclip`, `^C^C_cutclip`, `^C^C_copybase` and `^C^C_pasteclip` (ID_Copyclip, ID_Cutclip,
ID_Copybase, ID_Pasteclip): the running command cancelled (`*Cancel*`, as Ctrl+S's: desktop
workspace/d04), the macro echoed, a preselection at `Command:` counted on its line (`_copyclip 1
found`, as erase/d11's macro), a group U names `COPYCLIP GROUP` (`PASTECLIP GROUP` across the
clipboard's read, `GROUP PASTECLIP` with nothing pasted; desktop d05, es `PEGAPP GRUPO` e01);
Ctrl+A is ID_SelAll's `^C^C_ai_selall`: the running command cancelled, `_ai_selall Selecting
objects...done.` on one line (desktop d06-1; es `Designando objetos...terminado.`; no table id: the
console, p122, and `acad2027doc.lsp`'s `c:ai_selall`), what the object selector's ALL takes, objects
on Off and locked layers too (p126; no Freeze here), and a step U names `AI_SELALL GROUP` (es
`AI_SELALL GRUPO`, p123), taking nothing else back; AI_SELALL is not a command here (a Lisp
routine, CLIPBOARD-D7)

**Missing:** PASTEBLOCK and CUTBASE, and so their keys Ctrl+Shift+V and Ctrl+Shift+X (left to the
browser), Ctrl+Shift+A's group toggle (PICKSTYLE; left to the browser too), PASTEORIG, PASTESPEC/OLE, drag and drop between windows, a Clipboard UI panel, foreign
text pasted as MTEXT, listening to the native `paste` event; PASTECLIP's hidden INSERT keywords at
its point (Scale, PScale, Rotate, PRotate, Basepoint, Explode, REpeat: desktop d02's trace), so no
scaled, turned or exploded paste

### `NEW` / `QNEW` · es `NUEVO` / `RNUEVO` · pt-BR `NOVO` / `NOVOR`

**Implemented:** the application menu's New runs NEW and the Quick Access Toolbar's QNEW, as
acad.cuix's `^C^C` macros: the running command cancelled, `_NEW` and `_qnew` echoed, a group U
names `NEW GROUP` / `QNEW GROUP` (desktop clipboard/d08, whose cancelled dialog leaves `GROUP
QNEW`); both start
a blank drawing — layer 0, the Standard styles, the default settings and view — and a running
command ends first; QNEW without a template (None, its default) shows the Select Template dialog as
NEW does (desktop clipboard/d08), and there are no templates here, so both are the same; one undo step brings the previous
drawing back (WHY: AutoCAD opens the new drawing in a tab of its own and keeps the old one open;
there is one drawing here), though not the values AutoCAD keeps per drawing unsaved (CIRCLERAD,
OFFSETDIST, HPNAME, UNDO Control…), which NEW, like OPEN, puts back to their defaults
(rectang/p301–p315, p321; RECTANG-D41, D42); what the drawing saves — FILLETRAD, CHAMFERA/B,
TEXTSIZE, ORTHOMODE, SNAPMODE, SNAPUNIT, GRIDMODE… — comes with the drawing

**Missing:** templates and the Select Template dialog, file tabs (several drawings open), STARTUP's
Create New Drawing, Ctrl+N (the browser keeps it for a new window)

### `QSAVE` / `SAVEAS` / `SAVE` / `OPEN` (Ctrl+S / Ctrl+Shift+S / Ctrl+O) · es `GUARDARR` / `GUARDARCOMO` / `GUARDAR` / `ABRE` · pt-BR `SALVARR` / `SALVARCOMO` / `SALVAR` / `SALVARURL` / `ABRIR` / `ABRIRURL` / `OPENURL`

**Implemented:** `FileTransport` port, versioned tolerant JSON, transparent autosave behind the
`DrawingStore` port (this device's localStorage), its state in the top bar, a change still in its
350 ms debounce written at once when the engine is disposed or the page hidden or left (CLOSE
"prompted to save or discard the changes": with nothing to ask, nothing is dropped); the file keeps what
AutoCAD saves in the drawing (FILLETRAD, CHAMFERA/B, TEXTSIZE and TEXT's justification, ORTHOMODE,
SNAPMODE, SNAPUNIT, GRIDMODE: rectang/p302, p304, p311, p316, p321), and OPEN puts what it keeps
per drawing unsaved back to its defaults, as NEW does; SAVE a command of its own (clipboard/p202),
acad.pgp's `SAVEURL` / `OPENURL` (es `GUARDARURL` / `ABREURL`, p212); SAVEAS and SAVE write the
same download as QSAVE, since a browser download always names the file, so saving over the current
name, prompting for a new one and writing a copy cannot be told apart (CLIPBOARD-D4); each save a
step U and REDO name and regenerate for, `QSAVE Regenerating model.` (es `GUARDARR Regenerando
modelo.`; p204, p205, p214), Enter repeating it (p206); none transparent (p117); Ctrl+S,
Ctrl+Shift+S and Ctrl+O are acad.cuix's `^C^C_qsave`, `^C^C_saveas` and `^C^C_open` (ID_Save,
ID_Saveas, ID_Open): the running command cancelled, then the command run, echoed `_qsave`,
`_saveas`, `_open` (desktop workspace/d04), Ctrl+S a group U names `QSAVE GROUP` (Ctrl+Shift+S
`SAVEAS GROUP`; CLIPBOARD-D2: d04's `GROUP QSAVE` was the dialog cancelled, which a download never
reports; with no file access the save is reported and makes no step, so `GROUP QSAVE`); Ctrl+O's
none, the drawing opened starting its own history; the Quick Access Toolbar's and the application
menu's Open, Save and Save As are `^C^C` macros too (desktop clipboard/d08): the running command
cancelled, the QAT's `_open`, `_QSAVE`, `_SAVEAS` and the menu's `_OPEN`, `_QSave`, `_SAVEAS`
echoed, the same groups as the keys' (a save made `QSAVE GROUP Regenerating model.`, as Ctrl+S on a
titled drawing in d08)

**Missing:** File System Access API handles (QSAVE on a titled drawing saves silently, p203; SAVE
asks and writes a copy, p215), the `Save drawing as` and SAVEAS's format prompts (FILEDIA 0),
SAVEAS's DXF types and its Options (`docs/next-dxf.md`), drag-and-drop open, unsaved-changes
prompt, the drawing's name and the file tab's unsaved asterisk

### `DXFIN` and OPEN of a DXF · es `CARGADXF` · pt-BR `IMPDXF`

**Implemented:** OPEN's picker, AutoCAD's Select File, offers drawings and DXF, DXFIN's DXF alone
(desktop: its Select File opens on «DXF (*.dxf)»; with FILEDIA 0 both ask `Enter name of drawing
to open <.>:`, probes dxf/x004–x006, and acad.pgp's `DXFIN, *OPEN` loses to the command, x007); a
DXF is told by its name or its first group (a binary one by its sentinel) and replaces the drawing
as one of ours does: a history of its own, the view framed, the autosave written; ASCII and
binary, R12 to 2018, read in AutoCAD 2027's own files of two reference drawings
(`cad/serialization/dxf/fixtures/`, f001–f005), the text up to 2004 in `$DWGCODEPAGE`'s code page
with its `\U+XXXX` escapes; the objects the model has, each with its layer, colour, linetype,
lineweight, thickness, elevation and normal: LINE, CIRCLE, ARC, ELLIPSE, LWPOLYLINE, the 2D
POLYLINE with PEDIT's Fit arcs and Spline frame as AutoCAD left them, the 3D POLYLINE, SPLINE by
its fit points, end tangents and knot spacing (70's 32, 64, 128, f006) or its control points,
knots and weights (a closed one, which AutoCAD writes on open knots, as that curve), TEXT, MTEXT,
ATTDEF, INSERT with its attributes taken into the block's coordinates, the linear, aligned,
angular (three points, two lines), radius and diameter DIMENSION from their definition points,
text and moved text, HATCH with its loops and HPORIGIN (the ACAD xdata), its pattern's name read
without the style code AutoCAD may write after it (`ANSI31,_O`); the tables: layers (on,
off, locked), text and dimension styles (a group left out at the DXF reference's value, not
ISO-25's: f001's Standard), blocks; the header's INSUNITS (mm, cm, m), LUPREC, AUPREC, LTSCALE,
CLAYER, CECOLOR, CELTYPE, CELWEIGHT, TEXTSTYLE, DIMSTYLE, TEXTSIZE, FILLETRAD, CHAMFERA and B,
PLINEWID, FILLMODE, ATTMODE, ORTHOMODE, ELEVATION, THICKNESS, SPLINETYPE, SPLINESEGS, ISOLINES,
the UCS and the active viewport's snap and grid; what is no DXF said in AutoCAD's three lines
(`Error in drawing header on line 1.`, `<file> is not valid DXF file`, `Invalid or incomplete DXF
input -- drawing discarded.`, x010) and one ending inside a section in its two (`DXF read error on
line 23.`, t-no-eof), the drawing left as it was; what follows EOF unread, as AutoCAD opens ezdxf's
`R12_with_trash_beyond_EOF.dxf`; es and pt-BR's from their consoles (pt-BR's
`online` for "on line" is Autodesk's). A 50,000-object DXF of 7.1 MB reads in 0.2 s

**Deviations:** what the model has no object for is left out and counted at the command line by
its DXF type (`7 objects not opened: 1 POINT, 1 SOLID, …`), a layout's apart (`1 object in a
layout not opened.`), an object too malformed to make too (`1 object could not be read.`): WHY
words of our own, AutoCAD having an object for all of it and nothing to say (docs/next-dxf.md);
tolerant where AutoCAD's reader is strict: an unknown group code or entity, a missing subclass
marker, an EOF missing after the last section or a malformed object discard the whole drawing
there (`Undefined group code 77 for object on line 22.`, t-*), and RECOVER does not take them
either (r-*), WHY: they are what other programs write, and the rest opens; a frozen layer opens off
(no FREEZE here); an index colour opens as its RGB (AutoCAD 2027's palette, read from its
AcCmColor) and ByBlock as ByLayer (the model has neither); a linetype the six do not name but
whose dashes one of them has opens as that one (WHY: the Spanish AutoCAD's acadiso.lin calls
DASHED `TRAZOS`), any other by its name, drawn continuous; LWDISPLAY stays on, WHY: as every
drawing here starts, the screen being the only place a lineweight shows; a MINSERT opens as one
reference per row and column, WHY: there is no MINSERT; TEXT's Align and Fit open left-justified
at their first point with their height and rotation, WHY: the model has neither; a radial
dimension takes its text's middle (11) for the point picked, WHY: AutoCAD keeps that point only in
the text's place; a hatch's elliptical and spline edges are laid as straight runs, WHY: a loop here
is vertices and bulges; units other than mm, cm and m keep their numbers, in millimetres, WHY: the
model has only those three

**Missing:** saving as DXF (SAVEAS's DXF types, DXFOUT: docs/next-dxf.md); POINT, SOLID, TRACE,
3DFACE, XLINE, RAY, LEADER, MLEADER, TOLERANCE, TABLE, MLINE, IMAGE, WIPEOUT, meshes, the ordinate
and arc-length dimensions, the ACIS objects (3DSOLID, REGION, BODY, SURFACE), layouts and what is
in them, external references; a gradient hatch; a drawing's own linetypes and hatch patterns (one
outside the 24, or user-defined, keeps its name and draws no fill), the index colours as such,
each dimension's style overrides (xdata DSTYLE), a text style's font, width and obliquing (text is
measured with Arial's metrics), TEXT's `%%c`, `%%d` and `%%p` drawn as their characters (as TEXT
lacks them typed); named UCSs and views, the drawing opened at its saved view; DXFIN's FILEDIA 0
prompt. **Unverified:** a hatch's clockwise arc edge (73 = 0), read as measured round from −X
(AutoCAD wrote f006's clockwise island as a polyline loop), and an elliptical edge's angles, read
as the ellipse's parameters
