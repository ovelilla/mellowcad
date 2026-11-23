# Clipboard and files

### `COPYCLIP` / `CUTCLIP` / `COPYBASE` / `PASTECLIP` / Ctrl+A · es `COPIAPP` / `CORTAPP` / `COPIARBASE` / `PEGAPP` · pt-BR `COPIACORTE` / `RECORTAT` / `COPIABASE` / `COLARAT` · fr `COPIERPRESS` / `COUPERPRESS` / `COPIERBASE` / `COLLERPRESS` · it `COPIACLIP` / `TAGLIACLIP` / `COPIAPUNTOB` / `INCOLLACLIP` · de `COPYCLIP` / `AUSSCHNEIDEN` / `KOPIEBASISP` / `CLIPEINFÜG` · ru `КБУФЕР` / `ВБУФЕР` / `БТКОПИРОВАТЬ` / `ВСТБУФЕР` · pl `KOPIUJ_S` / `WYTNIJ` / `KOPIUJBAZA` / `WKLEJ` · cs `SKOPIE` / `VYJMIS` / `SKOPIEREF` / `SVLOŽ` · hu `VGMÁSOL` / `VGVÁG` / `ALAPMÁSOL` / `VGBEILL`

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

### `NEW` / `QNEW` · es `NUEVO` / `RNUEVO` · pt-BR `NOVO` / `NOVOR` · fr `NOUVEAU` / `RAPNOUV` · it `NUOVO` / `CNUOVO` · de `NEU` / `SNEU` · ru `НОВЫЙ` / `БСОЗДАТЬ` · pl `NOWY` / `SNOWY` · cs `NOVÝ` / `RNOVÝ` · hu `ÚJ` / `GYÚJ`

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

### `QSAVE` / `SAVEAS` / `SAVE` / `OPEN` (Ctrl+S / Ctrl+Shift+S / Ctrl+O) · es `GUARDARR` / `GUARDARCOMO` / `GUARDAR` / `ABRE` · pt-BR `SALVARR` / `SALVARCOMO` / `SALVAR` / `SALVARURL` / `ABRIR` / `ABRIRURL` / `OPENURL` · fr `SAUVERAP` / `SAUVENOM` / `SAUVEGRD` / `SAUVEURL` / `OUVRIR` / `OUVRIRURL` / `CHRGDXF` · it `SALVAVEL` / `SALVACOME` / `SALVA` / `SALVAURL` / `APRI` / `APRIURL` · de `KSICH` / `SICHALS` / `SICHERN` / `URLSPEICHERN` / `ÖFFNEN` / `URLÖFFNEN` · ru `БСОХРАНИТЬ` / `СОХРАНИТЬКАК` / `СОХРАНИТЬ` / `УРЛСОХРАНИ` / `ОТКРЫТЬ` / `УРЛОТКРОЙ` · pl `SZAPISZ` / `NZAPISZ` / `ZAPISZ` / `ZAPISZURL` / `OTWÓRZ` / `OTWÓRZURL` · cs `RULOŽ` / `ULOŽJAKO` / `ULOŽ` / `ULOŽURL` / `OTEVŘI` / `OTEVŘIURL` · hu `GYMENT` / `MENTMINT` / `URLMENT` / `ELMENT` / `MEGNYIT` / `MNY` / `URLMEGNYIT`

**Implemented:** `FileTransport` port, versioned tolerant JSON, transparent autosave behind the
`DrawingStore` port (this device's localStorage), its state in the top bar, a change still in its
350 ms debounce written at once when the engine is disposed or the page hidden or left (CLOSE
"prompted to save or discard the changes": with nothing to ask, nothing is dropped); the file keeps what
AutoCAD saves in the drawing (FILLETRAD, CHAMFERA/B, TEXTSIZE and TEXT's justification, ORTHOMODE,
SNAPMODE, SNAPUNIT, GRIDMODE: rectang/p302, p304, p311, p316, p321), and OPEN puts what it keeps
per drawing unsaved back to its defaults, as NEW does; SAVE a command of its own (clipboard/p202),
acad.pgp's `SAVEURL` / `OPENURL` (es `GUARDARURL` / `ABREURL`, p212); SAVEAS and SAVE run while
their Save Drawing As dialog shows (FILEDIA 1, desktop dxf/d01), this engine's drawing its first
type, where AutoCAD lists its DWG versions, and the DXF ones after it (DXFOUT's entry), Save writing
the name given with its type's extension, Cancel ending the command with nothing written; QSAVE
writes the same download at once, since nothing here keeps the drawing's name (CLIPBOARD-D4); each save a
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

**Deviations:** Save Drawing As without its folder pane, Save in, Places, Views and Tools' other
entries, WHY: a download goes where the browser puts it; File name and Files of type, Tools ▸
Options… and Save and Cancel are AutoCAD's, its labels the language's (acui26res.dll's dialog 131,
21433)

**Missing:** File System Access API handles (QSAVE on a titled drawing saves silently, p203; SAVE
asks and writes a copy, p215), the `Save drawing as` and SAVEAS's format prompts (FILEDIA 0),
the DWG types and DWG Options, drag-and-drop open, unsaved-changes prompt, the drawing's name
(SAVEAS to a DXF names the drawing after it, x018) and the file tab's unsaved asterisk

### `DXFIN` and OPEN of a DXF · es `CARGADXF` · pt-BR `IMPDXF` · fr `CHARGDXF` · it `DXFIN` · de `DXFIN` · ru `ИМПОРТА` · pl `DXFWE` · cs `ČTIDXF` · hu `DXFBE`

**Implemented:** OPEN's picker, AutoCAD's Select File, offers drawings and DXF, DXFIN's DXF alone
(desktop: its Select File opens on «DXF (*.dxf)»; with FILEDIA 0 both ask `Enter name of drawing
to open <.>:`, probes dxf/x004–x006, and acad.pgp's `DXFIN, *OPEN` loses to the command, x007); a
DXF is told by its name or its first group (a binary one by its sentinel) and replaces the drawing
as one of ours does: a history of its own, the view framed, the autosave written; ASCII and
binary, R12 to 2018, read in AutoCAD 2027's own files of two reference drawings
(`cad/serialization/dxf/fixtures/`, f001–f005), the text up to 2004 in `$DWGCODEPAGE`'s code page
with its `\U+XXXX` escapes; the objects the model has, each with its layer, colour, linetype and
its own linetype scale (48), lineweight, thickness, elevation and normal: LINE, CIRCLE, ARC, ELLIPSE, LWPOLYLINE, the 2D
POLYLINE with PEDIT's Fit arcs and Spline frame as AutoCAD left them, the 3D POLYLINE, SPLINE by
its fit points, end tangents and knot spacing (70's 32, 64, 128, f006) or its control points,
knots and weights (a closed one, which AutoCAD writes on open knots, as that curve), TEXT, MTEXT,
ATTDEF, INSERT with its attributes taken into the block's coordinates and a MINSERT's rows and
columns (70, 71, 44, 45: minsert/m09, AutoCAD's own file; none in the corpus), the linear, aligned,
angular (three points, two lines), radius and diameter DIMENSION from their definition points,
text and moved text, and what it overrides of its style of the variables a style holds here (its
DSTYLE xdata, by the DIMSTYLE table's groups: colors/s01, AutoCAD's DIMOVERRIDE), HATCH with its loops and HPORIGIN (the ACAD xdata), its pattern's name read
without the style code AutoCAD may write after it (`ANSI31,_O`), an unknown one in capitals as
AutoCAD reads it (hatchpat/p06l), its type (76: Predefined, User-defined, Custom) and its pattern
lines (78, 53, 43–46, 79, 49) taken back to pattern units and drawn wherever they are not the
registry's for its name, as AutoCAD draws a hatch from the lines it holds (hatchpat/p05: a MYPAT
AutoCAD has not, a `_U`, plotted alike): HOUND, GRASS, INSUL, P1, `_USER`, `U` and `_U` of 11 of
AutoCAD's samples (37 hatches that drew no pattern) and acad.pat's inch lines of AR-CONC, STEEL,
LINE, ANSI31 and others in metric drawings (408 hatches drawn 25.4 times too sparse before): 445
hatches of 27 samples, and an ANSI31 of 2 other programs' files, drawn as their files say, 3DFACE
with its WCS corners and hidden edges (face3d/f09, AutoCAD's own file; the 30 of 8 of AutoCAD's
samples, the labels' backgrounds of its blocks, and 1 of another program's file), a polygon mesh
(POLYLINE 70 16) with its M × N vertices (71, 72), closed in M (1) and N (32), a smoothed one (4)
by its control vertices (16) and SURFTYPE (75), its fitted mesh (73, 74) derived again from them,
which lands on AutoCAD's own to 9 decimals (mesh/f01, AutoCAD's own file: the one of VBA_Tower, a
ring of 2 × 8 closed in N in a block), XLINE and RAY
with their WCS base point and unit direction (xline/x10, AutoCAD's own file; none in the corpus),
WIPEOUT, the
one-pixel image clipped to its boundary turned into its vertices (10–13, 14/24, a rectangle's 71
1 or a polygon's 71 2; its plane U×V's; wipeout/w15, AutoCAD's own file: the 11 of 3 of AutoCAD's
samples, the masks behind a civil plan's labels), and WIPEOUTFRAME from its drawing variable
(AcDbVariableDictionary's DICTIONARYVAR) or, in an older drawing, WIPEOUTVARIABLES' 70 (w16),
IMAGE as AutoCAD 2027 opens one whose file it cannot find (image/i01: it says nothing but run
EXTERNALREFERENCES): its corner, its pixel's sides and its definition's size (10–12, 340; IMAGEDEF's
10, 20 framing it, as AutoCAD frames one, v3), named by ACAD_IMAGE_DICT or else by its file, its
path (IMAGEDEF 1) and pixel size (11, 281), its display, brightness, contrast, fade and clip boundary
kept to be written back (70, 281–283, 71, 14/24, and 280, the clip on or off), its plane U×V's, a mirrored one in plan in the
WCS; drawn as its frame, shown, hidden or shown and not plotted as IMAGEFRAME says (RASTERVARIABLES'
70: 1 shown, 2 not plotted, i08, i09), with its path across it, as tall as the frame's width over
its characters, centred, its baseline 0.64 of that height below the middle, along U and up V,
never stretched and mirrored with it, in its colour, masking nothing, its clip not applied
(image/i01, v1–v6, r1, r2, c1, c2, the colour and mirror plots; our drawing of i01 and of
VBA_Map2Globe beside AutoCAD's plots); picked by its frame, shown or not, and its path, never
inside it; END, MID, NEA and PER on its frame, CEN its middle, INS its insertion corner
(i02, i04); a grip at each corner, none at a side's middle (desktop objects/d02; the drag
**unverified**); MOVE, COPY, ROTATE, SCALE and
MIRROR map it (MIRROR leaves its normal down: i06e); STRETCH drags one corner, the last caught of
the bottom left, top left, top right and bottom right, the one across staying, scaled by the larger
of the ratios along its width and its height, never moved whole (s1–s11); EXPLODE leaves its
frame's four lines, saying nothing (i06a); OFFSET, AREA, BREAK, DIVIDE and TRIM refuse it with
AutoCAD's words (i07, i15); LIST as each of the ten consoles writes it (i07, i12: its name,
insertion, scale in its image's pixel size, turn or, mirrored, its extrusion, display, and its
whole frame's corners); its Properties its general rows, titled Raster Image (desktop
objects/d09); the 1 of AutoCAD's
samples (VBA_Map2Globe's world map) and LibreCAD's part (its definition named by its file),
ACAD_TABLE as AutoCAD 2027 opens one: its corner, direction and normal (10, 11, 210), its rows'
heights and columns' widths (141, 142), its style (342: TABLESTYLE's margins, flow, title and
header shown or not, and its data, title and header runs' text style, height and alignment, named
by ACAD_TABLESTYLE), the overrides SCALE sets (93 with 40, 41 and three 140s) and each cell (171 on:
text or block, merged, fitted, span, its overrides of alignment, text style and height, 91 or, in a
2000 or 2004 file, 177, its block by its BLOCK_RECORD, 340, 144, its text, 2s and 1, in its
CELL_VALUE from 2007), its `*T` block not read: AutoCAD draws a table from its cells, redrawing
a block left stale or empty (table/t01); drawn as AutoCAD draws it, each text cell's MTEXT at its
alignment inside the margins and as wide as the cell less both, a block cell's block placed so by
its extents, fitted to the cell when 174 says (0.362067, t03), the grid's lines run across then
down, broken where a span covers both sides, each wearing the table's layer and properties, the
same pieces as AutoCAD's own block of each of t10's six tables (a copy scaled by 0.5, one turned,
one mirrored, a red one on another layer, an empty -TABLE); picked and snapped through them (END
and MID on each run of the grid, INS a cell's text, CEN inside a block cell: t07) and at its corner
(INS, **unverified**); a grip at its corner that moves it (desktop objects/d03); MOVE, COPY and
ROTATE carry it, SCALE
scales its rows, columns, margins and texts as AutoCAD writes them (each row kind's height on the
table, each cell a span does not cover given its own, 41 left 1: t00, t02), MIRROR leaves it
unreflected, its corner the image of its far one along its rows, its direction the opposite of
its own's image (t02); STRETCH leaves it, caught in part or whole (t05); EXPLODE leaves its texts,
its block cells' references and its grid's lines, on its layer, in its colour and linetype, and a
grey line of no length at its corner, saying nothing (t06, t06b); OFFSET, AREA, BREAK, DIVIDE,
TRIM, FILLET and CHAMFER refuse it with AutoCAD's words (`… (not Table objects).`, acadres 33496;
t04, t04b, t04c); LIST as each of the ten consoles writes it (t08: its corner, normal and direction,
each `%f` whatever LUPREC, its columns, rows and style); its Properties its general rows, titled
Table (desktop objects/d11); the 1 of other programs' files (ezdxf's, with a block cell and merged cells),
MULTILEADER as AutoCAD 2027 opens one (probes mleader/m00–m15, v1–v23): its context's branches
(LEADER{: its landing, 10, its dogleg's direction, 11, and length, 40) and their leader lines
(LEADER_LINE{: their vertices from the arrowhead's tip), its MTEXT (290 1: 304 with its braces and
words read apart, 340, 12, 13, 41, 43, 45, 170, 171; one in dynamic columns, 173 2, read one unit
wide as AutoCAD reads its own, so each word wraps: v13, v14) or block (296 1: 341, 15, 16, 46),
the arrowhead's size (140) and landing gap (145), its path (170), leader lines' colour (91: an
AcCmColor, 0xC1 ByBlock, 0xC2 a true colour, 0xC3 an index: v18, v21) and dogleg (291), its
style (340: MLEADERSTYLE named by ACAD_MLEADERSTYLE, kept with it), in a plane other than +Z its
OCS's (111 × 112); drawn from these as AutoCAD draws one it opens, whatever the object's own 41
and 42 or its style say (v1–v12): its MTEXT or block, each branch's dogleg from its landing, each
leader line from its arrowhead's base through its vertices to the landing (with the dogleg off
on to where it would end, as a spline always runs: v6, v7), a spline the fit spline through the
same points, along its first segment and ending along the dogleg, and the closed filled
arrowhead 1:6 of 140, drawn when the first segment is at least twice it (v15); the same pieces
as AutoCAD's EXPLODE of each of m12's five (three leaders on two sides, none, a block, a spline,
two lines of text); picked through them; END at its leader lines' vertices, landings and
doglegs' ends and INS at its text (m08), its block's objects as a reference's (CEN, QUA, NEA),
no MID, NEA or PER along its leaders (m08, m09); its grips as AutoCAD's (desktop objects/d04–d07):
a square at each leader line's vertex, dragged as STRETCH moves it, and at each landing, whose
Stretch moves it with its dogleg and content by the drag, and an arrow along each dogleg at its
end, which lengthens it, the content following (a second branch's landing moving its content
**unprobed**); MOVE, COPY and ROTATE carry it, SCALE
scales its arrowhead, landing gap, doglegs, text height and width and block, its own 41 and 42
left (m05); MIRROR reflects its points and lays its text back by its first landing reading as
before (MIRRTEXT 0's half-plane), Top Left turned Top Right where it turns round (m06: about
y = 0 the text stays above its landing, about y = x it reads upward), a block reflected as a
reference is (m07); STRETCH moves a caught vertex, a landing caught alone along its dogleg, which
grows to keep its end, a dogleg's end along it with the content, both together and whole by
the displacement, and never by its text (m06, m07), a dogleg never shorter than none (one end
dragged past the other stops at it: **unprobed**); EXPLODE leaves its MTEXT or reference, each
dogleg a LINE, each leader line a polyline or spline and each arrowhead a 2D solid (m03, m12);
OFFSET, AREA, BREAK, DIVIDE, EXTEND, FILLET and CHAMFER refuse it with AutoCAD's words (m08, m09);
LIST as each of the ten consoles writes it (m10, m12, m14: its type, content, landing, each
leader numbered with its vertices and landing, its style, `Annotative: NO`); its Properties its
general rows, titled ax26res 731 (Multileader, desktop objects/d08) in each language;
the 1 of AutoCAD's samples (in a block of Mechanical - Text and Tables) and the 4 of 2 other
programs' files (dxf-parser's, whose files AutoCAD refuses: m01), a
hatch's gradient (450 1: its name, 470, in capitals; each colour's true colour, 421, or index, 63;
one colour's tint, 452 and 462; its angle, 460, and shift, 461, any but 0 read not centred), drawn
as AutoCAD draws it (HATCH's entry; gradient/g16, AutoCAD's own file: the nine names, two off
centre, one colour), and the 144 of 6 of AutoCAD's samples (the Annotation blocks' arrows and
tags), one of a name AutoCAD has not left out as a HATCH, POINT with its thickness, plane and
DXF 50 (f001's, the 101 of 20 of AutoCAD's samples and 49 of 18 other programs' files), SOLID
with its four corners in their order, thickness and plane, a fourth left out the third (f001's, and
the 2,831 of 67 of AutoCAD's samples, mostly the arrowheads and fills of old blocks, and 8 of 2 other
programs' files: solid2d/p01, p08), LEADER with its vertices from the WCS, arrowhead, spline,
hook, horizontal and its DSTYLE overrides of DIMSCALE, DIMASZ, DIMTAD and DIMGAP, a DIMTAD of 0 its
style's kept as its own, linked by its 340 to the MTEXT or block reference of its space it points
at, its offset from it read off where they stand (f001's, AutoCAD's own leader/p22, and the 823 of
22 of AutoCAD's samples: leader/p22, the corpus), an external reference (BLOCK flag 4, overlaid
8, its path in group 1) as AutoCAD 2027 opens one whose drawing it cannot find: its two lines
before anything else (`Resolve Xref "part": C:\…\part.dwg`, `"part.dwg" cannot be found.`, acdb
7172, 7174, 7235, in the six command languages from their consoles), the reference kept, drawn as
the text AutoCAD draws in its place (`Xref <path>`, acdb 7211, 2.5 high whatever TEXTSIZE or the
units, in Standard, at its insertion point, moved, scaled, stretched and mirrored with it), and
an xref nested in it (flag 16) and its `xref|` layers left out as AutoCAD drops them; PURGE
deletes an unused one, COPY copies one and DIVIDE and MEASURE's Block place one, as AutoCAD's do
(p12, p13, p18; EXPLODE, -INSERT, -BLOCK and LIST in their entries) (probes xref/p01–p06, p14, p16; the 36 references of 16 of AutoCAD's samples, the sheets of its sheet
sets, whose model is in references); the tables: layers (on,
off, locked), the drawing's linetypes (each with its description, its lengths and a complex one's
text or shapes, the text's style or the shape file found by its 340; ACAD_ISO02W100, HIDDEN2,
Spanish AutoCAD's TRAZOS, LibreCAD's K5LT ones, each drawn as its file defines it, a complex one's text too: 49 of the 52 of
AutoCAD's samples and all 28 of other programs' files whose linetypes drew continuous before; an
imperial drawing's DASHED its own 0.5 inches), text and dimension styles (a group left out at the DXF reference's value, not
ISO-25's: f001's Standard), blocks; the header's INSUNITS (mm, cm, m), LUPREC, AUPREC, LTSCALE,
CLAYER, CECOLOR, CELTYPE, CELTSCALE, CELWEIGHT, TEXTSTYLE, DIMSTYLE, TEXTSIZE, FILLETRAD, CHAMFERA and B,
PLINEWID, FILLMODE, ATTMODE, ORTHOMODE, ELEVATION, THICKNESS, SPLINETYPE, SPLINESEGS, ISOLINES,
PDMODE, PDSIZE, the UCS and its name (UCSNAME), the UCS table (every named UCS, for UCS Named to
restore: dxf/x023's ALPHA and beta), the active viewport's snap, grid and UCSICON; what is no DXF said in AutoCAD's three lines
(`Error in drawing header on line 1.`, `<file> is not valid DXF file`, `Invalid or incomplete DXF
input -- drawing discarded.`, x010) and one ending inside a section in its two (`DXF read error on
line 23.`, t-no-eof), the drawing left as it was; what follows EOF unread, as AutoCAD opens ezdxf's
`R12_with_trash_beyond_EOF.dxf`; es and pt-BR's from their consoles (pt-BR's
`online` for "on line" is Autodesk's). A 50,000-object DXF of 7.1 MB reads in 0.2 s

**Deviations:** what the model has no object for is left out and counted at the command line by
its DXF type (`5 objects not opened: 1 MLINE, 1 TOLERANCE, …`), a layout's apart (`1 object in a
layout not opened.`), an object too malformed to make too (`1 object could not be read.`): WHY
words of our own, AutoCAD having an object for all of it and nothing to say (docs/next-dxf.md);
an invisible object (60 1) is not opened, and not counted, WHY: AutoCAD draws and selects none,
and they are the hidden states of a dynamic block's visibility parameter, which the model has
not (13,793 of 43 of AutoCAD's samples: drawn, they piled up over the state shown); an object
HIDEOBJECTS hid, if a drawing saves it so (**unverified**), is lost with them;
tolerant where AutoCAD's reader is strict: an unknown group code or entity, a missing subclass
marker, an EOF missing after the last section or a malformed object discard the whole drawing
there (`Undefined group code 77 for object on line 22.`, t-*), and RECOVER does not take them
either (r-*), WHY: they are what other programs write, and the rest opens; a frozen layer opens off
(no FREEZE here); an index colour (62) opens as that index colour and a true colour (420) as
itself, even one whose RGB is an index colour's (colors/c02); ByBlock opens as ByLayer (not
modelled); the six linetypes every drawing holds
here join the file's when it lacks them (WHY at `LINETYPES`), and a linetype an object names that
the table lacks is added without dashes, drawn continuous; LWDISPLAY stays on, WHY: as every
drawing here starts, the screen being the only place a lineweight shows; TEXT's Align and Fit open left-justified
at their first point with their height and rotation, WHY: the model has neither; a radial
dimension takes its text's middle (11) for the point picked, WHY: AutoCAD keeps that point only in
the text's place; a hatch's elliptical and spline edges are laid as straight runs, WHY: a loop here
is vertices and bulges; units other than mm, cm and m keep their numbers, in millimetres, WHY: the
model has only those three; an external reference and an image are always not found, WHY: a page
reads only the file it is handed, never the folder beside it, so the drawing or the image a
reference names is never there to load (the browser gives no path, and asking for each file would
be a gesture of our own); the xref's label keeps the command language it was opened in, AutoCAD's
following its own; an image's path is picked by its box, where AutoCAD finds its letters' strokes
(a pick between two letters takes nothing, image/i04), WHY: the engine measures text and draws no
outlines; its own corners are no intersection (AutoCAD's INT finds them, i02); Russian LIST gives
its scale under `Масштаб`, where its console gives the frame's width (i07), WHY: a translation takes
English's arguments; a table keeps its style with it, not in a table of the drawing, WHY: nothing
here makes, edits or picks a table style, so the drawing's table would hold only what its tables
name (DXFOUT writes one TABLESTYLE per name), and so does a multileader its MLEADERSTYLE; a
multileader's text and block wear the object's colour, as neither the context's 90 nor the
object's 92 changes what AutoCAD draws (v19, v20), and its leader lines' linetype and lineweight
are the object's (AutoCAD's ByBlock, as its style writes them); its LIST says `Annotative: NO`
whatever it is, and leaves out AutoCAD's `Handle =` and `Material:` lines; no INT at its landing,
where AutoCAD's finds one (m08); a cell's colours, fill, borders and rotation (145,
kept and written back) are not drawn, nor its data type and format but the flag AutoCAD writes
with no value (0x40000, kept); a table flowing up (TABLESTYLE 70 1) is drawn up from its corner,
and a tilted one's direction (11) read in the WCS, its corner (10) in its OCS as a reference's
(**unverified**: no such table probed)

**Missing:** TRACE (none in the corpus; AutoCAD 2027's TRACE is the markup feature, solid2d/p04),
TOLERANCE, MLINE, the polyface mesh (POLYLINE 70 64) and the MESH objects, the ordinate
and arc-length dimensions, the ACIS objects (3DSOLID, REGION, BODY, SURFACE), layouts and what is
in them; of an external reference, its drawing (above), XREF and -XREF (Attach, Overlay, Reload,
Bind, Path…), the External References palette that AutoCAD 2027 opens on a drawing with one it
cannot find (the console runs EXTERNALREFERENCES, p01; the desktop's task dialog *One or more
reference files could not be located or read*, AcTaskDialogs), XREFNOTIFY's balloon and the
xref's own clipping (XCLIP); of an image, its pixels (its file), IMAGE (the External References
palette), -IMAGE (Attach, Detach, Path, Reload, Unload, `?`: image/i00, i01), IMAGEATTACH,
IMAGECLIP, IMAGEADJUST, IMAGEQUALITY, TRANSPARENCY and the frame left out of a plot with
IMAGEFRAME 2 (nothing is plotted here), its palette's rows past General (desktop objects/d09:
Image Adjust's Brightness, Contrast and Fade, Geometry's Position X, Y and Z, Rotation, Width,
Height and Scale, Misc's Name and Saved Path greyed, Show image, Show clipped and Background
transparency); of a table, TABLE and -TABLE (Auto, from Style, data Link,
Style, Layer, Width, Height: table/t00), TABLEDIT and the editing of its cells, its rows and
columns (its grips but the corner's: a square at each column line, arrows for its width, height,
both and its breaking, and the column letters and row numbers shown while selected, desktop
objects/d03; the ribbon's Table Cell tab), its palette's rows past General (d11: Linetype scale
greyed, 3D Visualization's Material, Table's style, rows and columns greyed, direction, width and
height, Geometry's Position X, Y and Z, Table Breaks), TABLESTYLE, TABLEEXPORT,
fields and formulas, data links, a table broken into fragments, a cell's colours, fill, borders
and rotation drawn, a table as an edge TRIM and EXTEND cut or reach to (unprobed); of a
multileader, MLEADER (`Specify leader arrowhead location or [pre enter Text/leader Landing
first/Content first/Options] <Options>:`, AcDimRes 1201–1261, m00, m02, m03), MLEADEREDIT
(1301–1354, m12), MLEADERALIGN, MLEADERCOLLECT, MLEADERSTYLE, its grips' menus (the landing's Stretch, Lengthen
Landing, Add Leader; a vertex's Stretch, Add Vertex, Remove Leader: desktop objects/d05, d06;
42419–42424), its text frame's four grips (d04, d12: the top left moves the content, the top
right by the drag's Y, the bottom left by its X, the bottom right sizes the frame), its
palette's rows past General (d08: Misc's Overall scale, Multileader style, Annotative; Leaders'
type, colour, linetype, lineweight, Arrowhead and its size, Horizontal Landing, Landing distance,
Leader extension; Text's Contents, style, Justify, Direction, Width, Height, Rotation, line
spacing, Background mask, attachments, Landing gap, Text frame), its other arrowheads (none in the corpus: one is drawn and written back
closed filled), a block's attribute values (not read, so not written back), its text's frame and
background, its annotative scales, TRIM taking it (unprobed), and one nested in a block snapped
as itself (it snaps as the pieces it draws, Nearest along its leaders included); a complex linetype's shapes (BATTING, ZIGZAG:
the gaps they stand in are drawn, the shapes need their SHX: 3 of the 154 samples); a 2000
DXF's gradient colours (AutoCAD writes them as `GradientColor1ACI` and `GradientColor2ACI` xdata
and reads the hatch back as a SOLID, g15: here a SOLID too); a dimension's overrides of the
variables a style does not hold here (DIMCLRD 176, DIMUPT 288… in its DSTYLE: dropped), a text
style's font, width and obliquing (text is
measured with Arial's metrics), TEXT's `%%c`, `%%d` and `%%p` drawn as their characters (as TEXT
lacks them typed); named views, the drawing opened at its saved view, its visual style; DXFIN's FILEDIA 0
prompt. **Unverified:** a hatch's clockwise arc edge (73 = 0), read as measured round from −X
(AutoCAD wrote f006's clockwise island as a polyline loop), and an elliptical edge's angles, read
as the ellipse's parameters

### `DXFOUT` and SAVEAS of a DXF · es `SALVADXF` · pt-BR `EXPDXF` · fr `SAUVEDXF` · it `DXFOUT` · de `DXFOUT` · ru `ЭКСПОРТА` · pl `DXFWY` · cs `PIŠDXF` · hu `DXFKI`

**Implemented:** DXFOUT's Save Drawing As, SAVEAS's and SAVE's, on «AutoCAD 2018 DXF (*.dxf)»
(desktop dxf/d01), and their DXF types: 2018, 2013, 2010, 2007, 2004, 2000 and «AutoCAD R12/LT2
DXF (*.dxf)» last (4714 in each language's table), each its `$ACADVER`; Tools ▸ Options…, Saveas Options' DXF Options tab: Format ASCII or BINARY, Select
objects, Decimal places of accuracy (0 to 16), kept for the session whatever type is saved
(x015, x020); with Select objects the command asks `Select objects:` once the dialog closes and
the file holds that set (d01: `Select objects: _L`, `1 found`, `Select objects:`); a precision under
16 warns at the command line as AutoCAD does (`Warning:  You have specified a lower precision…`,
27480, x015, d01), rounding to its places the groups AutoCAD rounds (points, angles, bulges, text
sizes) and leaving whole those it leaves (a radius, an ellipse, a spline, a hatch's boundary and
pattern, a normal: x015, x021), with no exponent and at most 16 significant digits; up to 2004
the text in ANSI_1252 with `\U+XXXX` beyond it, from 2007 UTF-8 (x014); the tables (layers on,
off and locked, with their colour, linetype and lineweight; the drawing's linetypes, each with
its description, lengths and a complex one's text and shapes as AutoCAD writes them, the text's
style and the shape file's STYLE record (name empty, flag 1, `ltypeshp.shx`) by handle, which
AutoCAD 2027's console reads back as its own records of GAS_LINE and BATTING, ltype/p06; text styles; dimension styles, every variable the model holds; the blocks),
the header's settings the reader takes back (`$CELTSCALE` among them), the UCS table (each named
UCS as typed, 70 0, its origin and axes, 79 and 146 0) and `$UCSNAME` (empty for none), the UCS
whole at any precision in the header and the viewport (110–112) and UCSICON in the viewport's 74,
as AutoCAD's DXFOUT (x023, x024: the console reads the 12 files of x023's drawing and of a tilted
UCS named `front wall` with no AUDIT error, lists their tables and restores each by name, ucs.sh),
an object's own linetype scale (48), the active viewport framing the drawing, and every
object the model has, as AutoCAD writes it: a fitted polyline as a POLYLINE with its fit or curve
vertices, a spline with its fit data or its knots, weights and control points (a closed one
clamped, f004), a dimension with its `*D` block drawn as the model draws it and its overrides as
DSTYLE xdata, by group, as AutoCAD's (colors/s01), an index colour as its 62 alone and a true
colour as its nearest index (62) beside itself (420), as AutoCAD's DXFOUT (c02), an array as a
reference to an anonymous block of its items, a MINSERT as AutoCAD's INSERT of class
AcDbMInsertBlock, 70 and 71 always, 44 and 45 when not 0 (minsert/m09: the console opens its 12
files with no AUDIT error and reads the six references as it reads its own file), a hatch with its pattern lines and HPORIGIN (its
own lines too, its type in 76 and a User-defined one's Double in 77, as AutoCAD wrote hatchpat/p00:
the console opens MYPAT and `_U` in the six versions, ASCII and binary, with no AUDIT error and
plots them as it plots its own file), a gradient from 2004 as AutoCAD writes one (450 to 470,
each colour's nearest index beside its true colour, g02, g16) and in 2000, which has none, as
its DXFOUT 2000 does (a SOLID with each colour's index as `GradientColor1ACI` and
`GradientColor2ACI` xdata, their APPID records registered, g15): the console opens g16's drawing
in the six versions, ASCII and binary, with no AUDIT error, reads 2004 on back as its gradients
and plots them as its own file (g17), a
point in the WCS with its thickness, plane and DXF 50, and `$PDMODE` and `$PDSIZE` (point/p04), a
2D solid's corners in its OCS with its thickness and plane (solid2d/p08), a 3D face's WCS corners
and, only when an edge is hidden, its 70 (face3d/f09: the console opens the 12 files of its drawing
with no AUDIT error and plots them as its own), a polygon mesh as AutoCAD writes it, 70 16 with 1,
32 and 4, 71 and 72, a smoothed one's 73, 74 and 75 (left out unsmoothed), each VERTEX 64 and the
object's properties, a smoothed one's first control vertex (80), its fitted mesh (72) and its other
control vertices (80) in that order, `$SURFTYPE`, `$SURFU` and `$SURFV` in the header (mesh/f01:
the console opens the 12 files of its drawing with no AUDIT error, finds its 6 meshes and plots
them as its own), an xline and a ray as AutoCAD
writes them, 10 and 11 in the WCS after AcDbXline or AcDbRay (xline/x10: the console opens the 12
files of its drawing with no AUDIT error, finds its 6 objects and plots them as its own, to the
pixel), a wipeout as AutoCAD writes a new one: a one-pixel
image on the square of its boundary's larger side clipped to its vertices, its WIPEOUT and
WIPEOUTVARIABLES classes in CLASSES (91 from 2004), 290 from 2010, and WIPEOUTFRAME as
WIPEOUTVARIABLES' 70 (0 for OFF, 1 for the rest) and, Display but not plot, as its drawing
variable (wipeout/w01, w14–w16: the console opens the 12 files of w15's drawing with no AUDIT
error, finds its 6 wipeouts, reads WIPEOUTFRAME 2 back from 2004 on and plots them as its own), an
image as AutoCAD's DXFOUT writes one it cannot find: its IMAGEDEF (one per name and path, 280 1; a second of one name, pasted or named by its file, numbered: pic2),
an IMAGEDEF_REACTOR for each image, ACAD_IMAGE_DICT and ACAD_IMAGE_VARS in the root dictionary,
RASTERVARIABLES with IMAGEFRAME (0, 1 or 3), the four classes (91 from 2004), 290 from 2010 and a
clip boundary of its own, or else its whole frame's two corners; a polygon closed back on its
first vertex, as AutoCAD's console fails to open one left open (image/i08, i13, i14: the console
opens the 12 files of i13's drawing with no AUDIT error, finds its 6 images and 2 definitions,
reads them and IMAGEFRAME 2 back as its own, and, the image files beside the paths, loads and
plots them as its own file), a
table as AutoCAD's DXFOUT writes one: its cells (from 2007 each value in a CELL_VALUE, before it
the text alone and 177 for 91, no data type: table/t09; from 2010 its version, 280), the overrides
SCALE set, a reference to a `*T` block of what it draws (ByBlock, as AutoCAD's, t03), a
TABLESTYLE per style (a second of one name numbered, Standard2) with ACAD_TABLESTYLE in the
root dictionary, and the TABLESTYLE and
ACAD_TABLE classes (t00; the console opens the 12 files of t10's drawing with no AUDIT error,
finds its 6 tables, and redraws from ours the very pieces we draw, 214 of them; what it writes
back reads as the tables it wrote, but the scale it stores for a fitted block cell, which it
does not draw by, t11; a cell's text longer than 250 characters written whole in its
CELL_VALUE, **unverified**), a multileader as AutoCAD's DXFOUT writes one (mleader/m02, m11): its
context, branches and leader lines, its MTEXT with no columns (173 0, so AutoCAD reads its width)
or its block with its matrix (47; a block the drawing no longer has, no content), its own
scale, override flags, landing and 41 and 42 as it read them, its leader lines' linetype and
lineweight ByBlock and its text's and block's colours as AutoCAD's Standard writes them, 270 and
271–273 from 2010
and 295 from 2013, before 2010 its version as xdata (ACAD_MLEADERVER, its APPID); a MLEADERSTYLE
per style (a second of one name numbered) with ACAD_MLEADERSTYLE in the root dictionary and the
two classes (the console opens the 12 files of m12's drawing with no AUDIT error and explodes
the 5 multileaders of each into the very 24 pieces it explodes its own into: `same.sh`), a
leader as AutoCAD's
DXFOUT writes it, its groups at their defaults left out, its overrides as DSTYLE xdata, its 340 to
its text or block reference and theirs back to it (ACAD_REACTORS), each pair's handles given
together (leader/p22), an external reference as AutoCAD's DXFOUT keeps one it could not find: its
BLOCK empty, flag 4 (with 8 overlaid) and its path in group 1, the label drawn in its place never
written (xref/p04's host2.dxf; the console reads ours back as its own, `Resolve Xref` and, with the
drawing back beside it, `"part" loaded.`); each
file of the two reference drawings, of one of every other kind, of points flat, thick, turned
and tilted (the console reading back each one's place, DXF 50, thickness, plane and the drawing's
PDMODE 35 and PDSIZE −7) and of 2D solids flat, thick and raised, and tilted (solid2d/p19 the
same drawn by AutoCAD, plotted alike) and of leaders (hooked, to the left, alone, a spline, centred
at DIMSCALE 10 with no arrowhead, to a block reference, facing down: AutoCAD reads each pair
associated and its leader follows the text moved, p23) and of linetypes (ISO, scaled, GAS_LINE's
text and BATTING's shapes, a layer's, an object's own scale, CELTSCALE and CELTYPE) and of an
external reference, in every version, ASCII and binary, opened by AutoCAD 2027's console with
no AUDIT error and plotted as AutoCAD's own
(scripts/research/probes/dxf/audit.sh, plot.sh), and read back here the same; a step U names and
regenerates for (`SAVEAS Regenerating model.`); es, pt-BR, fr and it from their tables (52636,
27480) and dialogs (acui26res.dll's 131, acadres.dll's 2489 and 5103); the file name it offers is the
drawing's, the file opened or the one SAVEAS or DXFOUT last wrote whole (Select objects' set leaves
it), as AutoCAD 2027 offers `plano-prueba.dwg` after opening plano-prueba.dxf and DXFOUT
`plano-prueba.dxf` (desktop point/d01, dxf/d01): here `plano-prueba.ecad.json` for the drawing
type; NEW's is dated again

**R12** (AC1009, as AutoCAD 2027's DXFOUT R12 writes it: probes dxf/r12.sh, which saved each
AutoCAD fixture as R12, x027, x028): no CLASSES or OBJECTS, no subclass markers, owners,
lineweights, true colours (the nearest index alone), linetype scales or version groups; a binary
file's codes in one byte; the header's R12 variables (`$EXTMIN`, `$EXTMAX`, `$HANDLING` 1, no
`$CELTSCALE`, `$CELWEIGHT`, `$LWDISPLAY`, `$INSUNITS` or code page), its tables with R12's groups
(no ByBlock or ByLayer LTYPE; a complex linetype its dashes and gaps alone, x027's GAS_LINE; a
TrueType style's font `txt`; a dimension style's R12 variables, ISO-25's where the model has none);
each name uppercase, every character but a letter, a digit, `$`, `-` and `_` an underscore, at most
26 characters (the help says spaces and 32; x028 cut a 44-character name to 26), one another took
first numbered per stem (`…XY0`, `…XY1`; a letter beyond the code page kept and written as its
`\U+XXXX`, **unverified**); blocks without handles, one with attribute definitions
flag 2, an anonymous one named by its kind and its place among the file's blocks (`*D2`, `*U8`);
a polyline a POLYLINE, its widths the first vertex's and a vertex's own where they differ; a
DIMENSION without 71, 42, 3 or bit 32; and what R12 has no object for converted in silence, as
AutoCAD converts it: an ellipse a 3D polyline of 128 equal steps, an arc of one too (129
vertices); a spline a 3D polyline of 32 points per control point at equal knot steps (not
SPLINESEGS: x027); an XLINE or a RAY the line of it the drawing's extents hold, a direction it does
not move along leaving that extent alone; an MTEXT, a leader, a multileader, a table, a region or a
3D solid of flat faces an INSERT on layer 0 of a `*U` block of what EXPLODE makes of it, flat (an
MTEXT's lines TEXTs, a leader's arrowhead a SOLID and its line a POLYLINE, a box its faces' 24
edges), the pieces with the object's layer and properties (x027); a dimension's text an INSERT of
a `*U` block of its TEXT, ByBlock; a hatch's pattern a `*X` block of its lines on layer 0, ByBlock,
a solid fill a `*U` block of SOLIDs and its outline's lines, Continuous, the reference on the
hatch's layer with its colour and Continuous; an image and a wipeout left out. The console opens
each of the 36 files of the reference drawings and of every kind above, and of
dxfSave.test.ts's, ASCII and binary, with no AUDIT error, and plots each as it plots its own R12
of the same drawing (`audit.sh`, `plot.sh`)

**Deviations:** a page reloaded offers a dated name again, WHY: the autosave keeps the drawing, not
the file it came from; what a DXF of ours cannot hold is left out and counted at the command line by its
DXF type (`1 object not saved: 1 3DSOLID.`), WHY words of our own: AutoCAD writes everything it
has and says nothing of what an earlier version or DXF loses (x022: DXFOUT 2018, 2000 and R12 and
SAVEAS to DWG 2000 and R14 of a 3DSOLID and a REGION, not a line; desktop d02: Save Drawing As
to 2000 DXF, R12 DXF and 2000 DWG, no dialog; its only such task dialogs are for custom objects
and objects over 256 MB, which this model cannot hold), while the ACIS objects (3DSOLID, REGION)
need their SAT, not written here: the line goes with them; an array's
parameters are not written, so AutoCAD opens the array as a block of its items; Save thumbnail preview image shows greyed and off, WHY: no
preview is written yet (AutoCAD greyed it too in the owner's profile, d01)

**Missing:** in R12, a gradient's bands of SOLIDs (counted as not saved:
`1 object not saved: 1 HATCH.`), a 3D solid with a curved face (counted, **unverified** what
AutoCAD's R12 makes of one), the hatch's `HATCH` and `R14_HATCH_DATA` xdata and its boundaries'
`ASC_BOUNDS`, with which AutoCAD reads its own R12 hatch back as one, an attribute's `AcDbAttr`
xdata, the header's `$DIM*` variables, and an angular dimension's text, which AutoCAD's R12
writes horizontal, a TEXT in its `*D` block (f002's *D4, fixture2's *D5); an XLINE or a RAY that
misses the extents is a line of no length at its base point, where AutoCAD writes one of its own
reckoning (r12.sh's xlines); the thumbnail preview; named views; the visual style (the viewport's 281 and 348 and the
VISUALSTYLE objects) and the ViewCube's display (`ACAD_NAV_VCDISPLAY` xdata on the viewport), x023;
DXFOUT's and SAVEAS's FILEDIA 0 prompts
(`Enter decimal places of accuracy (0 to 16) or [Binary/select Objects/Preview/Version] <16>:`,
x002, x003, x016–x019). **Unverified:** whether Select objects starts from a set selected before
the command (here it is dropped)
