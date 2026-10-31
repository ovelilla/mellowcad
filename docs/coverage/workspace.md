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
CLEANSCREENON / CLEANSCREENOFF (d01) — WHY without AutoCAD's RIBBON and RIBBONCLOSE steps round
it: the ribbon's own commands, not built here

**Missing:** Paper Space, Infer Constraints, Dynamic Input, Isometric Drafting, Transparency, 3D
Object Snap, Dynamic UCS, Selection Filtering, Gizmo, the annotation and viewport tools, Workspace
Switching, Annotation Monitor, Quick Properties, Lock UI, Graphics Performance, Isolate Objects; the
menus' "… Settings" items (the Drafting Settings dialog: Snap mode's spacing is typed in its popover
instead), the right-click menus of Grid, Object Snap Tracking and Lineweight, the Coordinates menu
(Relative, Geographic, Specific)

### `UNITS` / `UN` / `DDUNITS` · es `UNIDADES` / `UNS` / `DDUNITS` · pt-BR `UNIDADES` / `UN` / `UNIDADESD`

**Implemented:** the Drawing Units dialog (es "Unidades de dibujo"), modal, opened by the command
(the aliases from both `acad.pgp` files, en:417, :505, es:284, :513; `DDUNITS` probe
workspace/p311), the application menu's Drawing Units, which cancels the running command, echoes
`_UNITS` and is a group U names `UNITS GROUP` (desktop workspace/d05-4), and the status bar's Units,
which runs UNITS' macro `'_units` (acad.cuix ID_Units: inside a command, transparently; U names
`'UNITS` at `Command:`) — WHY not the application menu's: AutoCAD's status-bar Units is a menu of
length formats, no dialog: Length's Type (Decimal, the only
one: LUNITS 2) and Precision (LUPREC, 0 to 8 places as -UNITS asks them, p300, listed `0` …
`0.00000000`, as the desktop's list, d05-1), Insertion Scale (its list labelled `Units to scale inserted content:`, desktop
workspace/d05-1, es `Unidades para escalar el contenido insertado:` **unverified**; INSUNITS:
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

### `SETVAR` / `SET` · es `MODIVAR` / `MV` · pt-BR `DEFVAR` / `DEF` · a system variable typed by its name (`AUPREC`…)

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
NAVVCUBEDISPLAY (0–3), FILLMODE, PLINEWID, FILLETRAD, CHAMFERA, CHAMFERB (none negative), TEXTSIZE
(a negative taken as its size, 0 refused), ORTHOMODE, SNAPMODE (0–2), SNAPUNIT (both above 0),
GRIDMODE, INSUNITS (0–24), CECOLOR (a number, 256 ByLayer, a name in English or the command
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
SPLDEGREE (1–10), ARRAYASSOCIATIVITY, AFLAGS (0–63); per drawing, which NEW and OPEN put back,
INSNAME (`Enter new value for INSNAME, or . for none <"">:`, es `Indique nuevo valor para INSNAME, o .
para ninguno`, a name no block has taken, `.` none; INSERT finds it case-blind), LASTPOINT (typed in
the UCS, a 2D point at ELEVATION, `@` from itself, kept in the WCS; p212, p224), CIRCLERAD (not
negative; U after CIRCLE leaves it: draw.md), OFFSETDIST (below 0 Through), POLYSIDES (3–1024); the
values the probes show taken and refused (p205, p211–p214, p216, p223); read only AREA, PERIMETER,
DISTANCE, UCSNAME, UCSORG, UCSXDIR, UNDOCTL, CLEANSCREENSTATE. `?` lists them in AutoCAD's order,
the older ones then the newer (p126, p127)

**Missing:** the variables whose effect is fixed or unmodelled (LUNITS, ATTDIA, ATTREQ,
HPORIGIN, DYNMODE, SHORTCUTMENU, PICKBOX, APERTURE, AUTOSNAP, POLARMODE, MBUTTONPAN, LWDEFAULT,
ZOOMFACTOR, LAYLOCKFADECTL); the DIMxxx variables (typed, AutoCAD makes a style override, which is
not modelled: dimensions.md); `_.SETVAR` (the `.` prefix, command-line.md); values with no
representation here, refused with `Cannot set` where AutoCAD takes them — CECOLOR's and CELTYPE's
ByBlock, CECOLOR 0 and 8–255, CELWEIGHT −2 and −3, INSUNITS but 4, 5 and 6, HPNAME's `USER`,
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

### `CLEANSCREENON` / `CLEANSCREENOFF` / Ctrl+0 · es `LIMPIAPANTACT` / `LIMPIAPANTDES` · pt-BR `TELALIMPAATIV` / `TELALIMPADESAT`

**Implemented:** hides the tool palette, the palette panel and the top bar's ribbon parts (the
Layers and Properties groups, the palette toggles) and keeps the application menu, the Quick Access
Toolbar, the command line and the status bar ("Clean screen does not hide the Quick Access toolbar,
the command window, or the status bar"); Ctrl+0 is acad.cuix's `^C^C_CleanScreenON` /
`^C^C_CleanScreenOFF` (ID_CleanScreen, by CLEANSCREENSTATE): the running command cancelled, then
the command run, echoed so (desktop workspace/d04), a group U names `CLEANSCREENON GROUP`; the
status bar's Clean Screen (es Limpiar pantalla) toggles it with no echo, a step U names
`CLEANSCREENON` (d01; see Status bar); a palette opened meanwhile (LAYER, Ctrl+1) shows the
panel again (**unverified**); not saved (CLEANSCREENSTATE, read only by SETVAR, is Not-saved), so a reload starts without it;
CLEANSCREENOPTIONS, sometimes cited, is BricsCAD's. Typed, each is an undo step U names as invoked
(es string tables 52590, 52589) and U and REDO toggle back, one that changes nothing too (probes
workspace/p306, p316); program state, so it leaves the drawing unchanged. Not transparent:
`'CLEANSCREENON` inside a command is refused, `** That command may not be invoked transparently **`
(p305)

### F1 (Help)

**Implemented:** F1 asks the host for Help (Function Key Reference: "Displays Help for the active
tooltip, command, palette or dialog box"; HELP: "Press F1 … when command is active to display Help
for that command"): the running command's global name — a transparent one's inside another
(`'ZOOM` in LINE), `LINE` from `LINEA` — or none at `Command:` (`EngineHost.showHelp`,
`CadEngineOptions.onHelp`); taken from a focused field too, as every function key. `/draw` opens
the command's entry in the docs' reference (`/docs/commands#line`, in the page's language) or, at
rest, Getting started, in a tab of its own, as AutoCAD opens its Help in a browser. A host that
shows no help leaves F1 to the browser. WHY a page may take it: Chrome's F1 is
`IDC_HELP_PAGE_VIA_KEYBOARD`, not in `kReservedCommandIds` (`chrome/browser/ui/accelerator_table.cc`,
main, 2026-10-30)

**Missing:** HELP and `'HELP` as commands; F1 over a tooltip, a palette or a dialog (Help for
that one); a command named in the command line but not run yet; offline Help

### Top bar

**Implemented:** the application menu (New, Open, Save, Save As, then Drawing Units, which the help
files under Drawing Utilities > Units, and the page's language, which AutoCAD has no menu for) and
the Quick Access Toolbar in AutoCAD's order — New (QNEW), Open, Save, Save As, Undo, Redo —, each
run as its command by its global name (`_QSAVE`), so it echoes (Drawing Units as the desktop's
application menu runs it, `^C^C_UNITS`: see UNITS); the Home tab's Layers and Properties
panels beside them (`Object properties`, `Layers`), and at the end View's palette toggles: Styles,
Blocks and the command line — WHY one 36 px row instead of the ribbon: a ribbon costs 70–150 px of
height, which a wide screen is short of

**Missing:** the rest of the application menu and its whole order (**unverified**: the help
documents Create, Open, Save and Units), Undo's and Redo's lists (split buttons in AutoCAD, plain
buttons here), Plot and the Web & Mobile pair, the drawing's name in the title (the file port does
not know the open file's name), the ribbon's tabs and its minimize states

### Tool palette

**Implemented:** the Home tab's Draw, Modify, Annotation, Block and Utilities panels as a palette of
two columns (Continue/Baseline and Adjust Space from the Annotate tab): Circle, Arc,
Rectangle/Polygon, Ellipse, Trim/Extend, Fillet/Chamfer and Array are drop-downs listing each
member's icon, name and alias, as the ribbon's are, and Line, Polyline and Hatch single buttons;
Break, Break at Point and Join (the expanded Modify panel) and Spline (the expanded Draw panel) have
slots of their own; Dimension is the Annotation panel's Dimension drop-down (acad.cuix RibbonRoot:
Linear, Aligned, Angular | Arc Length, Radius, Diameter | Ordinate, Jogged) with what is built;
Ellipse keeps ELLIPSE's order (the help names Axis, End and Elliptical Arc, Center only as the
command's option); Attributes ▾ holds Edit, Define and Display: Edit is the Block panel's Edit
Attributes ▸ Single, `^C^C_eattedit` (ID_EAttEdit: EATTEDIT, advertised by its name; ATTEDIT stays
typed), Define the expanded panel's Define Attributes, and Display ATTDISP, which the ribbon offers
as the Attribute Display drop-down (ATTMODE; Home › Block's expanded part and Insert › Block),
whose macros are transparent, `'_attdisp _n` / `_on` / `_off` (ID_AttdispNo/On/Of): run so, inside
a running command too, which resumes (probe workspace/p313); Edit Text has a slot of its own
(TEXTEDIT's `^C^C_textedit` is on the Text toolbar, not the ribbon); Utilities is Measure ▾
(Distance and Area, as 2026 names them) and ID Point, `'_id` (the panel's expanded part); under
700 px of height Annotation, Block and Utilities fold to one drop-down each, the ribbon's "Minimize to Panel Buttons" — WHY a palette: as the top bar

**Missing:** DIM, Arc Length, Jogged and Ordinate in Dimension (the commands do not exist), the
panels' other expanded tools, Edit Attributes ▸ Multiple (`^C^C_-attedit`, ID_AtteditGlo: -ATTEDIT
is not built), the Attribute Display drop-down's three entries (Display asks ATTDISP's prompt
instead)

### Palette panel

**Implemented:** Properties, Layers, Blocks and Styles as tabs of one modeless panel at the inline
end (AutoCAD's are separate modeless palettes: LAYERDLGMODE 1, "It can remain open as you work"),
open from 1600 px of window and folded below to a strip of their icons, its width (280 to 480 px)
and its fold remembered on this device, as AutoCAD keeps them in the profile; LAYER, PROPERTIES,
DIMSTYLE, STYLE and BLOCKSPALETTE open it on their tab — WHY one docked panel: floating palettes
covered the drawing, and as popovers the first click on it closed them

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
