# Clipboard and files

### `COPYCLIP` / `CUTCLIP` / `COPYBASE` / `PASTECLIP` / Ctrl+A · es `COPIAPP` / `CORTAPP` / `COPIARBASE` / `PEGAPP`

**Implemented:** all four plus select-all; PASTECLIP asks `Specify insertion point:` (es
`Precise punto de inserción`), Enter asking again and what is no point refused with
`Invalid 2D point.`, as AutoCAD 2023's console does; `Clipboard` port with a session fallback, table
reconciliation across drawings (destination name wins), single undo on paste, bounded read timeout,
editable-field guard for Ctrl+C/X/V/A

**Missing:** PASTEBLOCK, PASTEORIG, CUTBASE, PASTESPEC/OLE, drag and drop between windows, a
Clipboard UI panel, foreign text pasted as MTEXT, listening to the native `paste` event

### `NEW` / `QNEW` · es `NUEVO` / `RNUEVO`

**Implemented:** the application menu's New runs NEW and the Quick Access Toolbar's QNEW; both start
a blank drawing — layer 0, the Standard styles, the default settings and view — and a running
command ends first; QNEW without a template (None, its default) shows the Select Template dialog as
NEW does, and there are no templates here, so both are the same; one undo step brings the previous
drawing back (WHY: AutoCAD opens the new drawing in a tab of its own and keeps the old one open;
there is one drawing here)

**Missing:** templates and the Select Template dialog, file tabs (several drawings open), STARTUP's
Create New Drawing, Ctrl+N (the browser keeps it for a new window)

### `QSAVE` / `SAVEAS` / `OPEN` (Ctrl+S / Ctrl+O) · es `GUARDARR` / `GUARDAR` / `GUARDARCOMO` · `ABRE`

**Implemented:** `FileTransport` port, versioned tolerant JSON, transparent autosave behind the
`DrawingStore` port (this device's localStorage), its state in the top bar; SAVEAS writes the same
download as QSAVE, since a browser download always names the file, so saving over the current name
and prompting for a new one cannot be told apart

**Missing:** File System Access API handles, drag-and-drop open, unsaved-changes prompt, the
drawing's name and the file tab's unsaved asterisk, Ctrl+Shift+S as SAVEAS (it runs QSAVE)
