# Clipboard and files

### `COPYCLIP` / `CUTCLIP` / `COPYBASE` / `PASTECLIP` / Ctrl+A · es `COPIAPP` / `CORTAPP` / `COPIARBASE` / `PEGAPP`

**Implemented:** all four plus select-all; COPYBASE's `Specify base point:` refuses Enter and what
is no point with `Invalid point.` and asks again (clipboard/p106, p107); COPYCLIP and COPYBASE keep
a preselection, CUTCLIP drops it (erase/p250, clipboard/p121, p124); their `Select objects:` takes
whole objects, CUTCLIP's sub-objects too (erase/p259, clipboard/p127); an object on a locked layer
is found and refused, `1 was on a locked layer.` (p119); PASTECLIP asks `Specify insertion point:` (es
`Precise punto de inserción`), Enter asking again and what is no point refused with
`Invalid 2D point.`, as AutoCAD 2023's console does; `Clipboard` port with a session fallback, table
reconciliation across drawings (destination name wins; an array's anonymous block lands under a
fresh `*U<n>`, arrays/p410), single undo on paste, bounded read timeout,
editable-field guard for Ctrl+C/X/V/A

**Missing:** PASTEBLOCK, PASTEORIG, CUTBASE, PASTESPEC/OLE, drag and drop between windows, a
Clipboard UI panel, foreign text pasted as MTEXT, listening to the native `paste` event

### `NEW` / `QNEW` · es `NUEVO` / `RNUEVO`

**Implemented:** the application menu's New runs NEW and the Quick Access Toolbar's QNEW; both start
a blank drawing — layer 0, the Standard styles, the default settings and view — and a running
command ends first; QNEW without a template (None, its default) shows the Select Template dialog as
NEW does, and there are no templates here, so both are the same; one undo step brings the previous
drawing back (WHY: AutoCAD opens the new drawing in a tab of its own and keeps the old one open;
there is one drawing here), though not the values AutoCAD keeps per drawing unsaved (CIRCLERAD,
OFFSETDIST, HPNAME, UNDO Control…), which NEW, like OPEN, puts back to their defaults
(rectang/p301–p315, p321; RECTANG-D41, D42); what the drawing saves — FILLETRAD, CHAMFERA/B,
TEXTSIZE, ORTHOMODE, SNAPMODE, SNAPUNIT, GRIDMODE… — comes with the drawing

**Missing:** templates and the Select Template dialog, file tabs (several drawings open), STARTUP's
Create New Drawing, Ctrl+N (the browser keeps it for a new window)

### `QSAVE` / `SAVEAS` / `OPEN` (Ctrl+S / Ctrl+Shift+S / Ctrl+O) · es `GUARDARR` / `GUARDAR` / `GUARDARCOMO` · `ABRE`

**Implemented:** `FileTransport` port, versioned tolerant JSON, transparent autosave behind the
`DrawingStore` port (this device's localStorage), its state in the top bar; the file keeps what
AutoCAD saves in the drawing (FILLETRAD, CHAMFERA/B, TEXTSIZE and TEXT's justification, ORTHOMODE,
SNAPMODE, SNAPUNIT, GRIDMODE: rectang/p302, p304, p311, p316, p321), and OPEN puts what it keeps
per drawing unsaved back to its defaults, as NEW does; SAVEAS writes the same
download as QSAVE, since a browser download always names the file, so saving over the current name
and prompting for a new one cannot be told apart; Ctrl+S, Ctrl+Shift+S and Ctrl+O are acad.cuix's
`^C^C_qsave`, `^C^C_saveas` and `^C^C_open` (ID_Save, ID_Saveas, ID_Open): the running command
cancelled, then the command run, echoed `_qsave`, `_saveas`, `_open` (desktop workspace/d04), Ctrl+S
a group U names `GROUP QSAVE`, a cancelled save too (d04; Ctrl+Shift+S's `GROUP SAVEAS` by analogy;
Ctrl+O's none, the drawing opened starting its own history)

**Missing:** File System Access API handles, drag-and-drop open, unsaved-changes prompt, the
drawing's name and the file tab's unsaved asterisk
