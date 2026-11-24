# Workspace

The research behind these rows and the redesign's — the 2026 help pages by GUID, in English and in
Spanish — is in `git show fe31d76:docs/next-ui-redesign.md`, §5, and the commit that deleted it.

### Status bar

**Implemented:** AutoCAD 2026's order: Coordinates, MODEL, Grid, Snap Mode ▾, Ortho Mode, Polar
Tracking ▾, Object Snap Tracking, 2D Object Snap ▾, Lineweight, Selection Cycling ▾, Units, Clean
Screen and Customization, the right-most; a mode's arrow and a right-click on the mode open the same
menu ("Click on the arrow, or right-click anywhere on the Object Snap icon, to display the
associated menu"): the object snaps and the selection list box as checkboxes, Polar's angles;
Customization's checklist chooses what shows, the coordinates included, remembered on this device
(AutoCAD keeps it in the profile) — WHY MODEL is a label: in model space the button "display[s] the
most recently accessed layout", and there are no layouts; WHY Units shows the unit and opens UNITS:
AutoCAD's shows the length format (LUNITS) and a right-click changes it, and Decimal is the only
format here. The modes' buttons echo as their keys, ` <Grid on>` (es ` <Rejilla activado>`), at
`Command:` on a line of their own and inside a command after the prompt (`Specify next point or
[Undo]:  <Ortho off>`), and their change joins the last undo step as the keys' does (desktop
workspace/d01, d01-2, d01-3, e01; Object Snap's and Object Snap Tracking's by analogy); a Polar
angle chosen writes nothing and turns Polar on (d01-m); Lineweight writes nothing (**unverified**:
it has no key, and its echo is unprobed); Clean Screen echoes nothing and is a step U names
CLEANSCREENON / CLEANSCREENOFF (d01), the ribbon's RIBBONCLOSE or RIBBON after it when it moves the
ribbon, as typed (see CLEANSCREENON; the button's own steps by analogy: it offers no UI Automation
pattern, d13)

**Missing:** Paper Space, Infer Constraints, Dynamic Input, Isometric Drafting, Transparency, 3D
Object Snap, Dynamic UCS, Selection Filtering, Gizmo, the annotation and viewport tools, Workspace
Switching, Annotation Monitor, Quick Properties, Lock UI, Graphics Performance, Isolate Objects; the
menus' "… Settings" items (the Drafting Settings dialog: Snap mode's spacing is typed in its popover
instead), the right-click menus of Grid, Object Snap Tracking and Lineweight, the Coordinates menu
(Relative, Geographic, Specific)

### `UNITS` / `UN` / `DDUNITS` · es `UNIDADES` / `UNS` / `DDUNITS` · pt-BR `UNIDADES` / `UN` / `UNIDADESD` · fr `UNITES` / `UI` / `DDUNITS` · it `UNITA` / `UT` / `DDUNITS` · de `EINHEIT` · ru `ЕДИНИЦЫ` / `ЕД` / `ДИАЛЕДИН` · pl `JEDN` / `JED` / `ODJEDN` · cs `JEDNOTKY` / `JN` / `DIAJEDN` · hu `MÉRTEGYS` / `MES` / `DPMÉRTEGYS`

**Implemented:** the Drawing Units dialog (es "Unidades de dibujo"), modal, opened by the command
(the aliases from both `acad.pgp` files, en:417, :505, es:284, :513; `DDUNITS` probe
workspace/p311), the application menu's Drawing Units, which cancels the running command, echoes
`_UNITS` and is a group U names `UNITS GROUP` (desktop workspace/d05-4), and the status bar's Units,
which runs UNITS' macro `'_units` (acad.cuix ID_Units: inside a command, transparently; U names
`'UNITS` at `Command:`) — WHY not the application menu's: AutoCAD's status-bar Units is a menu of
length formats, no dialog: Length's Type (Decimal, the only
one: LUNITS 2) and Precision (LUPREC, 0 to 8 places as -UNITS asks them, p300, listed `0` …
`0.00000000`, as the desktop's list, d05-1), Insertion Scale (its list labelled `Units to scale inserted content:`, desktop
workspace/d05-1, es `Unidades de escala del contenido insertado:`, unitsRes dialog 500; INSUNITS:
Millimeters, Centimeters, Meters — what a drawing unit is here, shown by the status bar and the dynamic input), Sample Output
(a point as X,Y,Z and as distance<angle,Z, at the chosen precision, the angle at AUPREC's). The run
lasts until the dialog closes, one undo step U names `UNITS` (es `UNIDADES`) with OK's change in it
(p307; -UNITS' change put back, p308), OK with nothing changed a step too (as -UNITS with every
default, p309), Cancel too (desktop workspace/d05) — Cancel or Escape changing nothing. `'UNITS` runs inside a command, which resumes once the dialog closes
(p303); its change joins that command's step

**Missing:** the other length types (Architectural, Engineering, Fractional, Scientific), Decimal's
scientific notation for a huge length (`<1.0000E+20>` at OFFSET's distance, offset/p118; from what
size is unprobed), the Angle
group (AUNITS, its Precision list, ANGDIR: angles are decimal degrees, counterclockwise, at AUPREC,
which is typed), INSUNITS' other values (Unitless, Inches…), Lighting (LIGHTINGUNITS), Direction
(ANGBASE), Help; -UNITS (`-UN`, es `-UNIDADES` / `-UNS`, p300, p314;
transparent, p310; U names it, p308), which asks, after a table of report formats, `Enter choice, 1
to 5 <2>:`, `Enter number of digits to right of decimal point (0 to 8) <4>:` (es `Indique el número
de dígitos a la derecha del punto decimal (de 0 a 8) <4>:`), after a table of angle systems `Enter
choice, 1 to 5 <1>:`, `Enter number of fractional places for display of angles (0 to 8) <0>:`, after
a table of directions `Enter direction for angle 0 <0>:` and `Measure angles clockwise? [Yes/No]
<N>`, and no insertion scale (p309)

### `SETVAR` / `SET` · es `MODIVAR` / `MV` · pt-BR `DEFVAR` / `DEF` · a system variable typed by its name (`AUPREC`…) · fr `MODIFVAR` / `MDV` · a system variable typed by its name (`AUPREC`…) · it `MODIVAR` / `MDV` · a system variable typed by its name (`AUPREC`…) · de `SETVAR` / `SET` · a system variable typed by its name (`AUPREC`…) · ru `УСТПЕРЕМ` / `УП` · a system variable typed by its name (`AUPREC`…) · pl `ZMSYS` / `ZMS` · a system variable typed by its name (`AUPREC`…) · cs `SYSPAR` / `SPA` · a system variable typed by its name (`AUPREC`…) · hu `VÁLTOZÓK` / `VAL` · a system variable typed by its name (`AUPREC`…)

**Implemented:** AutoCAD 2027's console's (probes workspace/p100–p169, p203–p222, p410–p415):
`Enter variable name or [?] <ORTHOMODE>:` (es `Indique nombre de variable o [?]`), the default the
last variable named there or typed by its name this session, none at first (Enter then ends), a name
case-blind and global only (`_ORTHOMODE` is `Unknown variable name.  Type SETVAR ? for a list of
variables.`, es on two lines, and ends); `?` asks `Enter variable(s) to list <*>:` and lists those
the wild card matches, the name in 18 columns, a read-only one's value in 36 then `(read only)`, a
string quoted and cut at 60, 20 at a time with `Press ENTER to continue:` (es `Pulse INTRO para
continuar:`, table 4054) between pages, Enter the next and Escape ending SETVAR (desktop
workspace/d07-1; anything typed there goes on as Enter, **unverified**); transparent (`'SETVAR`, es `'MODIVAR`), repeated by Enter, a step U
names `SETVAR` / `MODIVAR`. A variable's name at `Command:` — bare, `_`, `.` or `'` — runs SETVAR
for it unless a command has the name (LTSCALE, FILL, AREA, UCSICON; es `UCSICON` is the variable,
its command being SIMBSCP), and with `'` mid-command unless a transparent command has it ('LTSCALE;
'AREA and 'UCSICON are the variables), echoed and named for U as typed (`ORTHOMODE`, `'AUPREC`),
Enter repeating it. The value prompt is `Enter new value for X <v>:` (es `Indique nuevo valor para
X <v>`), by type: an integer (`Requires 0 or 1 only.` for a switch, es `Requiere 0 o sólo 1.`, else
`Requires an integer between a and b.`, es `Requiere un nº entero entre a y b.`, and the prompt
again; LWDISPLAY's `<ON>` with its ON/OFF/True/False/Yes/No, es ACT/DES/Verdadero/Falso/Sí/No,
`Requires 0 or 1 only, or option keyword.`), a distance at LUPREC's places (`Requires numeric
distance or two points.`), an angle at AUPREC's, a string quoted (`<"0">`) that takes spaces typed
key by key, Enter ending it (USERS1 `AB CD` set whole, desktop workspace/d06; WORKSPACE-D93
reversed), a point
(`Invalid 2D point.`, es `Punto 2D no válido.`; a 3D one `Invalid point.`, es `Punto no válido.`,
p224); a value the variable refuses writes `Cannot set X to
that value.` and `*Invalid*` (es `Imposible dar a X ese valor.`, `*No válido*`) and ends; a read-only
one writes `AREA = 0.0000 (read only)` and ends; Enter keeps the value, still a step. The dynamic
input's box shows what Enter keeps: the last variable at the name, typed as a word, and the value at
its prompt (desktop workspace/d07-4, d07-5; a string as the prompt writes it, `"0"`, **unverified**). Another
variable typed at a variable's prompt or in a transparent command runs inside it, and so does a
transparent command at a transparent variable's prompt (`Resuming SETVAR command.`, es `Reanudando
el comando MODIVAR.`, `Resuming ZOOM command.`; the prompt again keeps `>>` only inside a command);
the variable asked, typed there, is a value its type refuses; a transparent command in another stays
refused. Inside a command its change is part of the command's step, which the command's Undo takes
back. The variables: AUPREC (0 to 8, 0 in a new drawing, every angle written at its places — a
prompt's `<90>`, DIST's `Angle in XY Plane = 45`, ROTATE's `ANGBASE=0`, the tooltip's and the
Properties palette's), LUPREC, LWDISPLAY, ATTMODE (regenerating), ELEVATION, THICKNESS,
NAVVCUBEDISPLAY (0–3), FILLMODE, WIPEOUTFRAME (0–2, regenerating), IMAGEFRAME (0–2, regenerating; image/i02), PLINEWID, FILLETRAD, CHAMFERA, CHAMFERB (none negative), TEXTSIZE
(a negative taken as its size, 0 refused), ORTHOMODE, SNAPMODE (0–2), SNAPUNIT (both above 0),
GRIDMODE, INSUNITS (0–24), ISOLINES (0–2047, 4 in a new drawing, saved with it; solid/v01–v03:
`Requires an integer between 0 and 2047.`), CECOLOR (a number, 256 ByLayer, a name in English or the command
language, `BYLAYER` / es `PORCAPA`, `r,g,b` and `RGB:r,g,b`; shown `"1"`, `"RGB:255,0,0"`), CELTYPE
(a linetype case-blind or ByLayer, shown `"BYLAYER"`), CELWEIGHT (hundredths of a millimetre, −1
ByLayer, the standard values; −3 to 211), CLAYER and TEXTSTYLE (a name case-blind), HPNAME (its `_`
kept, `.` the default), HPSCALE (above 0), HPANG (degrees, `400` is 40), UCSICON; those kept
outside the drawing's settings, each one undo step though the program keeps it (p218):
program-wide, which NEW and OPEN leave, OSMODE (0–32767, the running snaps; NOD's 8 and GCEN's 1024
kept without a snap, 16384 suspended as F3 does), OSNAPZ (a snap at ELEVATION's Z, drafting-aids.md;
osnapz/o01–o03), POLARANG (degrees, put in 0–360), POLARDIST (any
sign, 0 at first: PolarSnap then steps by Snap X), SELECTIONCYCLING (−2 to 2), CLIPROMPTLINES (0–50,
the temporary prompt lines), TRIMEXTENDMODE, EDGEMODE, TEXTEDITMODE, SPLMETHOD, SPLKNOTS (0–2),
SPLDEGREE (1–10), ARRAYASSOCIATIVITY, AFLAGS (0–63), SOLIDCHECK (SOLIDEDIT's validation lines,
modify.md; solid-edits/p335, p405); per drawing, which NEW and OPEN put back,
INSNAME (`Enter new value for INSNAME, or . for none <"">:`, es `Indique nuevo valor para INSNAME, o .
para ninguno`, a name no block has taken, `.` none; INSERT finds it case-blind), LASTPOINT (typed in
the UCS, a 2D point at ELEVATION, `@` from itself, kept in the WCS; p212, p224), CIRCLERAD (not
negative; U after CIRCLE leaves it: draw.md), OFFSETDIST (below 0 Through), POLYSIDES (3–1024); the
values the probes show taken and refused (p205, p211–p214, p216, p223); read only AREA, PERIMETER,
DISTANCE, UCSNAME, UCSORG, UCSXDIR, UNDOCTL, CLEANSCREENSTATE, RIBBONSTATE (1 at first, the
desktop's and the help's: the console, with no ribbon, reads 0, p127). `?` lists them in AutoCAD's order,
the older ones then the newer (p126, p127)

**Missing:** the variables whose effect is fixed or unmodelled (LUNITS, ATTDIA, ATTREQ,
HPORIGIN, DYNMODE, SHORTCUTMENU, PICKBOX, APERTURE, AUTOSNAP, POLARMODE, MBUTTONPAN, LWDEFAULT,
ZOOMFACTOR, LAYLOCKFADECTL); the DIMxxx variables (typed, AutoCAD makes a style override, which is
not modelled: dimensions.md); `_.SETVAR` (the `.` prefix, command-line.md); values with no
representation here, refused with `Cannot set` where AutoCAD takes them — CECOLOR's and CELTYPE's
ByBlock, CECOLOR 0, CELWEIGHT −2 and −3, INSUNITS but 4, 5 and 6, HPNAME's `USER`,
POLARANG 0 (polar tracking here needs an increment, p223), AFLAGS' Multiple lines bit 32 (-ATTDEF
then asks a multiline attribute's lines, p224);
NAVVCUBEDISPLAY keeps only bit 2, reading back 3 or 1 (WORKSPACE-D39 needs a file-format change),
SNAPMODE 2 reads back 1; USERS1 to USERS5; the Drawing Units dialog's
Angle Precision list; the prompt line's head while one runs transparently, the name without the
apostrophe on the desktop (command-line.md); **unverified**: whether U steps back a read-only
variable typed by its name (SETVAR's is a step, p158), and that a point typed at SNAPUNIT's prompt
becomes LASTPOINT, refused or not (p212), which it does not here. Escape in a nested variable
(`*Cancel*`, `Resuming SETVAR command.`, d07-2), a preselection dropped after one (d07; the console
too, p161) and PolarSnap with a negative POLARDIST stepping by its size (d08) hold as here

### `CLEANSCREENON` / `CLEANSCREENOFF` / Ctrl+0 · es `LIMPIAPANTACT` / `LIMPIAPANTDES` · pt-BR `TELALIMPAATIV` / `TELALIMPADESAT` · fr `NETECRANACTIF` / `NETECRANINACTIF` · it `ATTSCHINT` / `DISATTSCHINT` · de `BILDSCHBEREIN` / `BILDSCHBERAUS` · ru `ЧИСТЭКРВКЛ` / `ЧИСТЭКРОТКЛ` · pl `CZYŚĆEKRANWŁ` / `CZYŚĆEKRANWYŁ` · cs `ČISTÁOBRAZOVKAANO` / `ČISTÁOBRAZOVKANE` · hu `TISZTAKÉPERNYŐBE` / `TISZTAKÉPERNYŐKI`

**Implemented:** hides the palette panel and closes the ribbon (RIBBONSTATE 0: see RIBBON) and
keeps the application menu, the Quick Access Toolbar, the command line and the status bar ("Clean
screen does not hide the Quick Access toolbar, the command window, or the status bar"); off, it
puts the ribbon back as it was when Clean Screen came on, whatever RIBBON or RIBBONCLOSE did
meanwhile (desktop workspace/d11, d13). Each change it makes to the ribbon, run, undone or redone,
is a step of its own after it that U names RIBBONCLOSE or RIBBON and leaves as it is: typed with
the ribbon open, CLEANSCREENON is two steps (`RIBBONCLOSE`, then `CLEANSCREENON`), and U of
CLEANSCREENON makes a RIBBON step, so REDO then finds `Nothing to redo` (d10, d12); with the ribbon
closed before, no step of the ribbon's (d11); one run by Ctrl+0's macro holds it in its group (d04:
U names `CLEANSCREENON GROUP` alone), and a REDO's step is by analogy (unprobed). Once,
CLEANSCREENON followed by RIBBON showed no RIBBONCLOSE step (d12 (b)); twice it did (d10, d12 (a)):
the steps here are those. Ctrl+0 is acad.cuix's `^C^C_CleanScreenON` /
`^C^C_CleanScreenOFF` (ID_CleanScreen, by CLEANSCREENSTATE): the running command cancelled, then
the command run, echoed so (desktop workspace/d04), a group U names `CLEANSCREENON GROUP`; the
status bar's Clean Screen (es Limpiar pantalla) toggles it with no echo, a step U names
`CLEANSCREENON` (d01; see Status bar); a palette opened meanwhile (LAYER, Ctrl+1) shows the
panel again (**unverified**); not saved (CLEANSCREENSTATE, read only by SETVAR, is Not-saved), so a reload starts without it;
CLEANSCREENOPTIONS, sometimes cited, is BricsCAD's. Typed, each is an undo step U names as invoked
(es string tables 52590, 52589) and U and REDO toggle back, one that changes nothing too (probes
workspace/p306, p316, in the console, which has no ribbon: with one open, the ribbon's steps
above come between); program state, so it leaves the drawing unchanged. Not transparent:
`'CLEANSCREENON` inside a command is refused, `** That command may not be invoked transparently **`
(p305)

### `RIBBON` / `RIBBONCLOSE` · es `CINTA` / `CERRARCINTA` · pt-BR `FAIXAOPCOES` / `FECHARFAIXAOPCOES` · fr `RUBAN` / `FERMERUBAN` · it `BARRAMULTIF` / `CHIUDIBARRAMULTIF` · de `MFLEISTE` / `MFLEISTESCHL` · ru `ЛЕНТА` / `ЛЕНТАЗАКР` · pl `WSTĄŻKA` / `WSTĄŻKAZAMKNIJ` · cs `PÁSKARET` / `PÁSKARETZAVŘI` · hu `SZALAG` / `SZALAGBEZÁR`

**Implemented:** RIBBONCLOSE closes the ribbon and RIBBON shows it (RIBBONSTATE, read only and not
saved: a reload starts with it shown), neither asking anything, the names from the 2027 help pages'
titles in each language (GUID-EC71B17B, GUID-A9EE8263); no echo, and each is a step U and REDO name
as invoked and leave as they are, one that changes nothing too: the ribbon stays as the command left
it (desktop workspace/d09); with Clean Screen on, RIBBON shows the ribbon and Clean Screen stays
(d12, d13). Not transparent: `'RIBBON` and `'RIBBONCLOSE` inside a command are refused, `** That
command may not be invoked transparently **` (d09). The engine keeps, for the session, the tab in
front and the member each drop-down shows (`state.ribbon`), as AutoCAD keeps the member for the
session and not after a restart (`docs/plans/autocad-ui.md`, §2.3; the ribbon: below)

**Missing:** its right-click menu's Close and Undock, docking and floating it

### F1 (Help)

**Implemented:** F1 asks the host for Help (Function Key Reference: "Displays Help for the active
tooltip, command, palette or dialog box"; HELP: "Press F1 … when command is active to display Help
for that command"): the running command's global name — a transparent one's inside another
(`'ZOOM` in LINE), `LINE` from `LINEA` — or none at `Command:` (`EngineHost.showHelp`,
`CadEngineOptions.onHelp`); taken from a focused field too, as every function key. `/draw` opens
the command's own page in the docs (`/docs/commands/offset`, in the page's language), its entry in
the reference where it has none (`/docs/commands#line`) or, at rest, Getting started, in a tab of
its own, as AutoCAD opens its Help in a browser. A host that
shows no help leaves F1 to the browser. WHY a page may take it: Chrome's F1 is
`IDC_HELP_PAGE_VIA_KEYBOARD`, not in `kReservedCommandIds` (`chrome/browser/ui/accelerator_table.cc`,
main, 2026-10-30)

**Missing:** HELP and `'HELP` as commands; F1 over a tooltip, a palette or a dialog (Help for
that one); a command named in the command line but not run yet; offline Help

### Title bar

**Implemented:** AutoCAD's frame from the top (`docs/plans/autocad-ui.md`, §2.1): the title bar,
32 px, then the ribbon's band, 124 (its tab row and its panels), shown from the first paint and gone
while RIBBONCLOSE or Clean Screen has closed it, then the drawing. In the title bar the application
button, 48 wide, flush at its start, and the Quick Access Toolbar's buttons at AutoCAD's 24×22 with
16 px icons, one against the next from 56 px (UI Automation at 1280×720, 2026-11-24). The
application menu: New, Open, Save, Save As, then Drawing Units, which the help files under Drawing
Utilities > Units, the page's language, which AutoCAD has no menu for, and last Send Feedback,
which opens the host's page in a new tab — the site's issue forms, filled in — where AutoCAD's
opens its form on Autodesk's site: WHY in the application menu, AutoCAD 2027 has it as the Start
tab's Connect panel's button, «Help us improve our products · Send feedback» (desktop,
2026-11-07), and in the Help menu between Online Resources and Privacy Settings (acad.cuix
`ID_SendFeedback`, `^C^C^P_ai_send_feedback ^P`), and neither exists here: it moves to the title
bar's Help list when the chrome has one, `docs/plans/autocad-ui.md`, F7. The Quick Access Toolbar
in AutoCAD's order — New (QNEW), Open, Save, Save As, Undo, Redo —, each run as its command by its
global name (`_QSAVE`), so it echoes (Drawing Units as the desktop's application menu runs it,
`^C^C_UNITS`: see UNITS); the save state where AutoCAD's title names the drawing

**Missing:** the rest of the application menu and its layout (the 2027 desktop's:
New, Open, Save, Save As, Import, Export | Publish, Print, Drawing Utilities | Close, each but Save
with a page of items, Units one of Drawing Utilities'; a search, the recent and open documents,
Options and Exit; `docs/plans/autocad-ui.md`, §2.2), Undo's and Redo's lists (split buttons in
AutoCAD, 36 wide, plain buttons of 24 here), Plot, Customize ▾ and Share, the title centred and
InfoCenter (Help ▾ comes with phase 2), the drawing's name in the title (the file port does not
know the open file's name), the file tabs (one drawing at a time) — WHY no window buttons
(minimise, maximise, close): a page cannot draw its window's frame

### Ribbon

**Implemented:** the tabs of Drafting & Annotation that hold something built, in its order —
Home, Insert, Annotate, 3D Tools, View — the tab in front the engine's for the session
(`state.ribbon.tab`), 3D Tools and View's Visual Styles, Coordinates and Navigate shown where the
workspace hides them (WHY: no workspace switching nor the ribbon's Show Tabs and Show Panels here to
reach them; `docs/plans/autocad-ui.md`, decision 4, R9). Home (`docs/plans/autocad-ui.md`, §2.3; acad.cuix's
RibbonRoot, `node scripts/research/ribbon.mjs --tab Home --built`): its tab row, 24, and its panels,
100, each 97 high (4, its rows' 72, 3 and a title bar of 18), with what the engine has in acad.cuix's
rows and order — Draw, Modify, Annotation, Layers, Block, Properties, Utilities and Clipboard. Large
buttons 72 high, a 32 px icon drawn for that size over their text on one line, or two parted at the
space nearest its middle (Layer Properties, Match Properties); small ones 22 high, a 16 px icon with
their text or alone, in columns of three on a 24 px pitch, 5 apart; the layer combo 208 × 22, the
colour, lineweight and linetype ones 180 × 22 after a 20 px icon; every word AutoCAD's own in each
language, read from that culture's acad.CUIX by its id (Arabic's ours, `docs/i18n/ar.md`). The split
buttons keep acad.cuix's behaviour: SplitFollow (Rectangle, Ellipse, Hatch, Trim, Fillet,
Dimension's Linear) shows and runs the member picked last, SplitFollowStaticText (Circle, Arc, Text,
Array, Measure, Edit Attributes) does so under a text that stays, SplitNoFollow (Paste) always runs
its first, DropDownFollow (Cut, Copy) shows the member picked last and a click only lists; two
targets, the icon that runs (38 of a large button's 72) and the text with its arrow that lists (35),
a small one's arrow 13 wide; the list under its button, each member a row of 38 with its 32 px icon
and name, groups parted by a line, the member shown marked (a small button's list as a large one's:
desktop 2026-11-24, `autocad-mouse/rect-list.png`); the member is the engine's for the session
(`state.ribbon.members`), as AutoCAD keeps it until a restart. A panel's title bar with ▾ opens its
slide-out over the drawing, its rows on the same pitch and the title bar under them with a push pin
at its start; unpinned it closes as soon as the pointer leaves it (desktop 2026-11-24,
`autocad-mouse/ds-a.png`), pinned it stays until its title bar, moved under the rows, closes it, or the
ribbon closes (RIBBONCLOSE, Clean Screen: whatever the ribbon had open goes with it, and RIBBON brings it
back with no panel pinned — whether AutoCAD keeps the pin across them is **unverified**). Properties' dialog
launcher runs `^C^C_properties` or `^C^C_propertiesclose`, as Ctrl+1; Text Style and Dimension Style
`'_style` and `'_dimstyle`, transparent inside a command, as Annotate's Text and Dimensions
launchers do (ID_Style, ID_Ddim); Layer Properties opens and closes the Layer
Properties Manager, lit while it is open; a running command's button is not lit, as AutoCAD's is not
(§2.3, R15); Insert opens a gallery of the drawing's blocks (AcInsertGalleryControl), a pick starting
-INSERT as the Blocks palette's does; Attribute Display (AcATTMODEDataBoundDropDown), by its icon
in Block's slide-out and with its text on Insert, one target showing the entry ATTMODE holds —
Retain Attribute Display, Display All Attributes, Hide All Attributes, each culture's
AcWindows.resources.dll's words — a pick setting ATTMODE with no echo and no regeneration said, a
step U names `'ATTMODE` (UI Automation, `research/ui/2026-11-24/block4`); Object Color's 20 px
icon no target, its list's last row `More Colors...` (each culture's AcWindows.resources.dll)
opening the browser's colour picker in the place of Select Color; after a button acts, a list is picked from or closed, or a
slide-out's title bar closes it, the drawing has the keys again. Hovered, a
button takes a faint frame; pressed, a darker fill (desktop 2026-11-24,
`autocad-mouse/press-line.png`). **Insert**: Block (Insert, Edit Attribute ▸ Single, Attribute
Display) and Block Definition (Create Block, Define Attributes). **Annotate**: Text (Multiline Text ▸
Single Line, SplitFollow), Dimensions in its three rows (Adjust Space; Update, `^C^C_-dimstyle
_apply`; Linear ▾ and Continue ▾ with Baseline) and Markup (Wipeout); a panel's words its own where
they differ from Home's (Japanese `長さ寸法`). **3D Tools**: Modeling (the solid primitives, Extrude
and Revolve, these two as ID_Extrude2 and ID_Revolve2 run them, `^C^C^R_extrude;` with no MOde
answered), Solid Editing (Presspull, Fillet Edge ▾ with Chamfer Edge, Slice, Union, Subtract,
Intersect; the face edits in its slide-out) and Coordinates (World, the X, Y and Z drop-down, 3
Point ▾ with Previous, View, Face and Object). **View**: Viewport Tools' UCS Icon, `_ucsicon` with
`_off` or `_on` at its prompt, a step U names `UCSICON GROUP`, and View Cube, NAVVCUBEDISPLAY
between 3 and 1 with no echo, a step U names `'NAVVCUBEDISPLAY`, each lit while it shows; Visual
Styles' gallery, a combo of 200 × 22 with the view's style, its gallery cells of 82 × 70 on an 84
pitch with the styles VSCURRENT has, a name wider than its cell cut as AutoCAD cuts `Shaded
wi...` (Spanish `Estructura alámbrica 2D`), a pick setting it with no echo, the running command cancelled,
a step U names `VSCURRENT GROUP` (`Regenerating model.` back into 2D Wireframe); Coordinates' UCS,
World, Rotate UCS ▾ (X, Y, Z), Previous, Origin, Z-Axis Vector, 3 Point and Define UCS ▾ (View,
Object, Face), each `^C^C_ucs` and its option, a step U names `UCS GROUP`; Palettes' Properties,
Blocks, Command Line and Layer Properties, lit while theirs shows, with no echo, as the desktop's
(block4); Navigate's Pan, Orbit and Zoom ▾ (Extents, Window, Previous, In, Out), the navigation
bar's macros. Every word each culture's acad.CUIX's (Arabic's ours) — WHY the panels' row scrolls
sideways where a tab does not fit (Home 1521 px whole in English, 1632 in Spanish, where AutoCAD's
whole Home is 1760): the panels fold as the window narrows in block 5 of `docs/plans/autocad-ui.md`,
§6; until then the wheel or a trackpad scrolls it — WHY TEXTEDIT has no button: its
`^C^C_textedit` is on the Text toolbar, on no ribbon panel of 2027; it is typed, or a double-click
on a text — WHY no Styles toggle: View's Palettes has none, the Styles palette (phase 3's dialogs)
is reached by its tab, the Text Style and Dimension Style buttons and launchers, STYLE and DIMSTYLE

**Missing:** the Parametric, Visualize, Manage, Output, Add-ins, Collaborate, Express Tools and
Featured Apps tabs, nothing of theirs built; the minimize states and the fold (block 5), AutoCAD's tooltips — the name, a description, the command and `Press
F1 for more help`, and after a longer rest the extended one, a paragraph and an illustration added
(desktop 2026-11-24, `autocad-mouse/tip-long.png`; phase 5) —, the right-click menu (phase 5); Groups
and View, with nothing built; what each panel lacks: Draw's Tan, Tan, Radius and Tan, Tan, Tan, Arc's
seven other members and Continue, Gradient, Boundary, Helix, Donut and Revision Cloud; Modify's Set to
ByLayer, Change Space, Lengthen, Edit Hatch, Edit Array, Align, Reverse, Copy Nested Objects, Delete
Duplicate Objects and Draw Order; Annotation's Dimension (DIM), Arc Length, Ordinate, Jogged, the
Multileaders drop-down, Table, the style combos (phase 3), Multileader Style and Table Style; Layers'
small tools and the layer states; Block's Detect and Convert, Edit, Edit Attributes ▸ Multiple,
Replace, Manage and Synchronize Attributes, Set Base Point, the gallery's Recent, Favorite and Library blocks; Properties' Plot Style and Transparency;
Utilities' Quick (MEASUREGEOM), Quick Select, Select All and Quick Calculator; Clipboard's Paste as
Block, as Hyperlink, to Original Coordinates, Paste Special and Cut with Base Point; Object
Color's true colours and Index Colors rows; Insert's Detect and Convert, Edit Attribute ▸
Multiple, Replace, Write Block, Manage Attributes, Block Editor, Set Base Point, Synchronize and
the Reference, Import, Data, Linking & Extraction and Location panels; Annotate's Check Spelling,
Text Align, Justify, Find Text, Text Height, Scale, the style and layer combos (phase 3),
Dimension (DIM), Break, Jog Line, Inspect, Reassociate, Quick, Arc Length, Jogged, Ordinate, the
slide-out's DIMTEDIT and DIMEDIT tools, Tolerance and Override, Revision Cloud, Centerlines,
Leaders, Tables and Annotation Scaling; 3D Tools' Solid History, Polysolid, Loft, Sweep, the mesh
primitives and surfaces, Offset Edge, Interfere, the body edits (Shell, Separate, Clean, Check), the
edges' Extract, Imprint, Copy and Color and Color faces (SOLIDEDIT's Edge and Body), Surfaces,
Mesh, Section and Selection, and Coordinates' UCS dialog launcher; View's Navigation Bar and Show
Motion toggles (no NAVBARDISPLAY here), Named Views (its View Manager, `^C^C_view`, is a dialog,
where VIEW here is -VIEW's presets), Model Viewports, Review, History, Interface, Visual Styles'
edge, face and X-ray controls, Opacity, Smoothing, Save as a New Visual Style and the Visual Styles
Manager, Coordinates' UCSICON drop-down, UCS Icon Properties, Named UCS and its combo, Palettes'
other toggles and slide-out, Navigate's Back and Forward, Free and Continuous Orbit and Zoom's
other members; Define UCS's list drawn as AutoCAD's `Icon` style (here its rows have names,
**unverified** on the desktop); the palette toggles' undo step (U names `GROUP LAYER`, `GROUP
BLOCKSPALETTE`, a bare `GROUP` after Properties closed: block4; none here); whether the UCS Icon
toggle cancels a running command as `^C^C` would (here it does, **unverified**); Layer
Properties' echo, none on the desktop either (block4); Modify's Move, Copy, Stretch, Rotate, Mirror and Scale with a grip hot (acad.cuix
`$M=$(if,$(eq,$(substr,$(getvar,cmdnames),1,4),GRIP),_move,^C^C_move)`: the button answers the grip's
prompt with its mode; here the button starts its command — the desktop's **unverified**)

### Palette panel

**Implemented:** Properties, Layers, Blocks and Styles as tabs of one modeless panel at the inline
end (AutoCAD's are separate modeless palettes: LAYERDLGMODE 1, "It can remain open as you work"),
open from 1600 px of window and folded below to a strip of their icons, its width (280 to 480 px)
and its fold remembered on this device, as AutoCAD keeps them in the profile; LAYER, PROPERTIES,
DIMSTYLE, STYLE and BLOCKSPALETTE open it on their tab — WHY one docked panel: floating palettes
covered the drawing, and as popovers the first click on it closed them (revoked by the owner on 2026-11-07: the chrome follows AutoCAD's layout, `docs/next-autocad-ui.md`)

**Missing:** floating, docking anywhere, auto-hide and anchoring, Tool Palettes, Quick Properties
(QPMODE −1: off by default)

### Right button · SHORTCUTMENU

**Implemented:** SHORTCUTMENU at its initial 11 (Integer, Registry: Options > User Preferences >
Right-Click Customization as it comes) — with no command running a right-click opens the Default
menu, or the Edit menu with objects selected; during a command it opens the Command menu when the
prompt offers options in brackets ("Shortcut Menu: Enabled When Command Options Are Present"), and
otherwise "is the same as pressing Enter": it confirms Select objects (ERASE, MOVE…) and, at LINE's
first point, continues from the last line; answered on the release, as a Windows menu is; Enter
submits what is typed in the dynamic input and with nothing typed is Enter at the prompt, never the
box's live reading; a grip edit counts as a command; Shift+right-click at a point prompt is the
object-snap override menu

**Missing:** the other values (0: always Enter, the Right-Click Customization dialog's Repeat Last
Command for the Default and Edit modes, 4: the Command menu always) and the time-sensitive
right-click (16, with SHORTCUTMENUDURATION's 250 ms: "A quick click is the same as pressing Enter. A
longer click displays a shortcut menu"), the Hot Grip menu (GRIPS) during a grip edit, the menus of
PAN, ZOOM and 3DORBIT while they run, dragging a selection with the right button (Move Here, Copy
Here)

### Shortcut menus

**Implemented:** at the cursor, with what exists here in the order of acad.cuix's CMDEFAULT
(PopMenuRoot PM_0006), CMEDIT (PM_0007) and CMCOMMAND — Default: Repeat ‹last command›,
Clipboard ▸ (Cut, Copy, Copy with Base Point and Paste, with their keys), Undo, Redo, Pan (labelled
as acad.cuix names them, `&Undo` and `Re&do`, Repeat carrying the command, `&Repeat %s`; Undo
runs `^C^C_u`, Redo `^C^C_mredo 1`, as MREDO 1, Pan `'_pan` (MM_1562) as the navigation bar's Pan,
written so, as the navigation bar's `'PAN` is not, desktop workspace/d03); Edit: Repeat, Clipboard ▸, Erase,
Move, Copy Selection, Scale, Rotate, Deselect All, Properties; Command: Enter, Cancel, the prompt's
options as its brackets word them ("the command's options (keywords within the square brackets) are
inserted into this menu"), Osnap Overrides ▸ (the override menu's entries) only at a prompt that
takes a point (OFFSET's distance has it, desktop offset/d04-1; `Select object to offset` not,
d04-2), in the 2027 desktop's order (Intro, Cancelar, Entrada reciente ▸ · options ·
Modificaciones de REFENT ▸ · Encuadre, Zoom, SteeringWheels · Calculadora rápida, LINE's next
point, probe line/d07); any other entry that is a command runs as acad.cuix's macro, echoed so
(`_erase 1 found`, es `_erase 1 encontrados`, `_move 1 found`, `_properties`; desktop
workspace/d03, e01; Copy Selection `_copy`, Scale `_scale`, Rotate `_rotate` and the Clipboard's
`_cutclip`, `_copyclip`, `_copybase`, `_pasteclip` by analogy) and repeated like it, each but Undo
and Redo a group U names by the entry's label — `Erase GROUP`, `Move GROUP`, `Pan GROUP` (es
`Borrar GRUPO`, `Encuadre GRUPO`), and `GROUP` first when its command made no step: `GROUP
Properties` (es `GRUPO Propiedades`); the others by analogy (`Copy Selection GROUP`) —; Deselect
All, `^C^C^Pai_deselect ^P`, writes no echo, only `Everything has been deselected` (es `Se ha
anulado la selección de todo`), a group U names `GROUP Deselect All` (es `GRUPO Anular selección`;
d03, e01); an option is answered as typed; Escape or a click outside closes the menu, and focus goes back to the drawing;
the labels acad.cuix's (Copy with Base Point, Osnap Overrides; es Anular selección, Copiar
selección, Copiar con punto base), es Repetir, Entrada reciente, Portapapeles, Intro, Cancelar,
Seleccionar similares, Agregar selección (the help's words), Modificaciones de REFENT (the
desktop's, d07: the help says Modificaciones de referencias)

**Missing:** Recent Input (INPUTHISTORYMODE), Isolate, real-time Zoom, SteeringWheels, Action
Recorder, Subobject Selection Filter, Quick Select, QuickCalc, Count, Find, Options, Draw Order,
Group ▸, Add Selected, Select Similar, Quick Properties; in Clipboard ▸ Cut with Base Point, Paste
as Block, Paste as Hyperlink, Paste to Original Coordinates and Paste Special; the object and
command entries merged into them (OBJECT_…, COMMAND_…), the Command menu's Pan and Zoom (d07); the
Default menu's Undo and Redo labelled with the step they take or put back, as the desktop writes
them past acad.cuix's `&Undo` (`Undo Propertiesclose`, `Redo Propertiesclose`, `Undo Grip edit`, es
`Deshacer Grupo de comandos`; desktop workspace/d03-2, d03-3, e01-2; the rule for a group's label
is not settled by three readings, WORKSPACE-D105)

### Wheel and wheel button

**Implemented:** the wheel zooms about the cursor, forward to zoom in (ZOOMWHEEL 0), 1.5978× a
notch (ZOOMFACTOR's 60: VIEWSIZE 120 → 75.102 in, → 191.944 out, desktop view/d01), in proportion
to the wheel's `deltaY` — a notch is 100 px, the adapter turning lines (100/3 px) and pages (the
view's height) into pixels, so a trackpad's small events zoom little (VIEW-D60); a burst of it
(notches under a second apart: 940 ms join, 1000 ms part, d01, VIEW-D61) is one ZOOM Previous step
and one undo step U names `INTELLIZOOM`; the wheel button held pans (MBUTTONPAN 1, "panning when you
hold and drag the button or wheel"), one ZOOM Previous step and one undo step `INTELLIPAN` per
press, a click that never moved the view too (d02), and with Shift orbits (the transparent
3DORBIT), saying ` Regenerating model.` on release, a step U names `GROUP menu item Regenerating
model.` (es `GRUPO menu item Regenerando modelo.`, d02, e01) that regenerates on U and REDO always
(VIEW-D62); a double-click of it is ZOOM Extents ("Double-click the wheel button") run as
AutoCAD's mouse macro: `'_.zoom`, ZOOM's first prompt answered `_e`, transparently inside a
command, a step U names `'.ZOOM` (d02) — WHY two clicks within 500 ms: a browser fires `dblclick`
for the primary button only and does not tell the system's double-click time, so Windows' default
stands in; at the Command prompt each step is its own, joined with the typed ZOOMs and PANs and
with one another as consecutive ZOOMs are (`INTELLIZOOM INTELLIZOOM`, `INTELLIZOOM ZOOM ZOOM`,
`INTELLIPAN ZOOM INTELLIPAN ZOOM INTELLIZOOM ZOOM`, `'.ZOOM INTELLIPAN`; the LINE before them stays,
es the same names, d01, d02, e01), none echoed; inside a command an entry of its step, which its
Undo takes back with the segment before it (d01; in a command that changes the view itself, that
command's step); the right button no longer pans

**Missing:** ZOOMFACTOR as a variable (its default, 60, is built), Ctrl and the wheel button
(joystick pan), MBUTTONPAN 0; whether the Shift orbit inside a command says
`Resuming LINE command.` as the ViewCube does (not probed: here only ` Regenerating model.`)
