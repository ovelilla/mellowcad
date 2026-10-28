# Workspace

The research behind these rows and the redesign's — the 2026 help pages by GUID, in English and in
Spanish — is in `git show 423c37c:docs/next-ui-redesign.md`, §5, and the commit that deleted it.

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
format here

**Missing:** Paper Space, Infer Constraints, Dynamic Input, Isometric Drafting, Transparency, 3D
Object Snap, Dynamic UCS, Selection Filtering, Gizmo, the annotation and viewport tools, Workspace
Switching, Annotation Monitor, Quick Properties, Lock UI, Graphics Performance, Isolate Objects; the
menus' "… Settings" items (the Drafting Settings dialog: Snap mode's spacing is typed in its popover
instead), the right-click menus of Grid, Object Snap Tracking and Lineweight, the Coordinates menu
(Relative, Geographic, Specific)

### `UNITS` / `UN` · es `UNIDADES` / `UNS`†

**Implemented:** the Drawing Units dialog (es "Unidades de dibujo"), modal, opened by the command,
the application menu's Drawing Units and the status bar's Units: Length's Type (Decimal, the only
one: LUNITS 2) and Precision (LUPREC, 0 to 8 places, listed as `0.0000`; **unverified** that the
list writes them so), Insertion Scale (INSUNITS: Millimeters, Centimeters, Meters — what a drawing
unit is here, shown by the status bar and the dynamic input), Sample Output (a point as X,Y,Z and as
distance<angle,Z, at the chosen precision, the angle at AUPREC's); OK as one undo step
(**unverified**: no page says whether U undoes UNITS; it undoes what other commands set), Cancel or
Escape changing nothing

**Missing:** the other length types (Architectural, Engineering, Fractional, Scientific), Decimal's
scientific notation for a huge length (`<1.0000E+20>` at OFFSET's distance, offset/p118; from what
size is unprobed), the Angle
group (AUNITS, its Precision list, ANGDIR: angles are decimal degrees, counterclockwise, at AUPREC,
which is typed), INSUNITS' other values (Unitless, Inches…), Lighting (LIGHTINGUNITS), Direction
(ANGBASE), Help, -UNITS; the list's own label, "Units to scale inserted content" (**unverified** in
2026, so the group's title names it)

### `SETVAR` / `SET` · es `MODIVAR` / `MV` · a system variable typed by its name (`AUPREC`…)

**Implemented:** AutoCAD 2027's console's (probes workspace/p100–p169, p203–p222, p410–p415):
`Enter variable name or [?] <ORTHOMODE>:` (es `Indique nombre de variable o [?]`), the default the
last variable named there or typed by its name this session, none at first (Enter then ends), a name
case-blind and global only (`_ORTHOMODE` is `Unknown variable name.  Type SETVAR ? for a list of
variables.`, es on two lines, and ends); `?` asks `Enter variable(s) to list <*>:` and lists those
the wild card matches, the name in 18 columns, a read-only one's value in 36 then `(read only)`, a
string quoted and cut at 60; transparent (`'SETVAR`, es `'MODIVAR`), repeated by Enter, a step U
names `SETVAR` / `MODIVAR`. A variable's name at `Command:` — bare, `_`, `.` or `'` — runs SETVAR
for it unless a command has the name (LTSCALE, FILL, AREA, UCSICON; es `UCSICON` is the variable,
its command being SIMBSCP), and with `'` mid-command unless a transparent command has it ('LTSCALE;
'AREA and 'UCSICON are the variables), echoed and named for U as typed (`ORTHOMODE`, `'AUPREC`),
Enter repeating it. The value prompt is `Enter new value for X <v>:` (es `Indique nuevo valor para
X <v>`), by type: an integer (`Requires 0 or 1 only.` for a switch, es `Requiere 0 o sólo 1.`, else
`Requires an integer between a and b.`, es `Requiere un nº entero entre a y b.`, and the prompt
again; LWDISPLAY's `<ON>` with its ON/OFF/True/False/Yes/No, es ACT/DES/Verdadero/Falso/Sí/No,
`Requires 0 or 1 only, or option keyword.`), a distance at LUPREC's places (`Requires numeric
distance or two points.`), an angle at AUPREC's, a string quoted (`<"0">`), a point
(`Invalid 2D point.`, es `Punto 2D no válido.`); a value the variable refuses writes `Cannot set X to
that value.` and `*Invalid*` (es `Imposible dar a X ese valor.`, `*No válido*`) and ends; a read-only
one writes `AREA = 0.0000 (read only)` and ends; Enter keeps the value, still a step. Another
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
kept, `.` the default), HPSCALE (above 0), HPANG (degrees, `400` is 40), UCSICON; read only AREA,
PERIMETER, DISTANCE, UCSNAME, UCSORG, UCSXDIR, UNDOCTL, CLEANSCREENSTATE

**Missing:** the variables the program or the drawing keeps outside its settings (OSMODE, POLARANG,
POLARDIST, SELECTIONCYCLING, TRIMEXTENDMODE, EDGEMODE, TEXTEDITMODE, SPLMETHOD, SPLKNOTS,
SPLDEGREE, ARRAYASSOCIATIVITY, CLIPROMPTLINES, INSNAME, LASTPOINT, CIRCLERAD, OFFSETDIST, POLYSIDES,
AFLAGS: the review's SVR block); those whose effect is fixed or unmodelled (LUNITS, ATTDIA, ATTREQ,
HPORIGIN, DYNMODE, SHORTCUTMENU, PICKBOX, APERTURE, AUTOSNAP, POLARMODE, MBUTTONPAN, LWDEFAULT,
ZOOMFACTOR, LAYLOCKFADECTL); the DIMxxx variables (typed, AutoCAD makes a style override, which is
not modelled: dimensions.md); `_.SETVAR` (the `.` prefix, command-line.md); values with no
representation here, refused with `Cannot set` where AutoCAD takes them — CECOLOR's and CELTYPE's
ByBlock, CECOLOR 0 and 8–255, CELWEIGHT −2 and −3, INSUNITS but 4, 5 and 6, HPNAME's `USER`;
NAVVCUBEDISPLAY keeps only bit 2, reading back 3 or 1 (WORKSPACE-D39 needs a file-format change),
SNAPMODE 2 reads back 1; the console's `Press ENTER to continue:` every page of `?` (the history
scrolls here; the desktop's page length **unverified**); the Drawing Units dialog's Angle Precision
list; **unverified**: whether a string value takes spaces (USERS1's `a b`, WORKSPACE-D93: here a
Space is Enter), the prompt line's head while one runs transparently, Escape in a nested variable,
whether AutoCAD drops a preselection after one (the console does, p161), and whether U steps back a
read-only variable typed by its name (SETVAR's is a step, p158)

### `CLEANSCREENON` / `CLEANSCREENOFF` / Ctrl+0 · es `LIMPIAPANTACT` / `LIMPIAPANTDES`

**Implemented:** hides the tool palette, the palette panel and the top bar's ribbon parts (the
Layers and Properties groups, the palette toggles) and keeps the application menu, the Quick Access
Toolbar, the command line and the status bar ("Clean screen does not hide the Quick Access toolbar,
the command window, or the status bar"); the status bar's Clean Screen (es Limpiar pantalla) and
Ctrl+0 toggle it; a palette opened meanwhile (LAYER, Ctrl+1) shows the panel again (**unverified**);
not saved (CLEANSCREENSTATE, read only by SETVAR, is Not-saved), so a reload starts without it;
CLEANSCREENOPTIONS, sometimes cited, is BricsCAD's

### Top bar

**Implemented:** the application menu (New, Open, Save, Save As, then Drawing Units, which the help
files under Drawing Utilities > Units, and the page's language, which AutoCAD has no menu for) and
the Quick Access Toolbar in AutoCAD's order — New (QNEW), Open, Save, Save As, Undo, Redo —, each
run as its command by its global name (`_QSAVE`), so it echoes; the Home tab's Layers and Properties
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
slots of their own; Dimension lists Linear, Aligned, Angular, Radius and Diameter, the Annotate
tab's Dimensions list (no 2026 page lists the Home tab's Linear ▾); Ellipse keeps ELLIPSE's order
(the help names Axis, End and Elliptical Arc, Center only as the command's option); Attributes ▾
holds Edit (EATTEDIT), Define and Display — neither ATTDISP nor TEXTEDIT has a documented place on
the ribbon, so Display joins Attributes and Edit Text has a slot; Utilities is Measure ▾ (Distance
and Area, as 2026 names them) and ID Point; under 700 px of height Annotation, Block and Utilities
fold to one drop-down each, the ribbon's "Minimize to Panel Buttons" — WHY a palette: as the top bar

**Missing:** DIM, Arc Length, Jogged and Ordinate in Dimension (the commands do not exist), the
panels' other expanded tools, Edit Attribute's Multiple (**unverified** that it is there)

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

**Implemented:** at the cursor, with what exists here in AutoCAD's order — Default: Repeat ‹last
command›, Clipboard ▸ (Cut, Copy, Copy with Base Point and Paste, with their keys), Undo, Redo, Pan
(labelled as acad.cuix names them, `&Undo` and `Re&do`: only Repeat carries the command,
`&Repeat %s`; Redo runs its macro, `^C^C_mredo 1`, as MREDO 1); Edit: Repeat, Clipboard ▸, Erase,
Move, Copy Selection, Scale, Rotate, Deselect All, Properties; Command: Enter, Cancel, the prompt's
options as its brackets word them ("the command's options (keywords within the square brackets) are
inserted into this menu"), Snap Overrides ▸ (the override menu's entries) only at a prompt that
takes a point (OFFSET's distance has it, desktop offset/d04-1; `Select object to offset` not,
d04-2), in the 2027 desktop's order (Intro, Cancelar, Entrada reciente ▸ · options ·
Modificaciones de REFENT ▸ · Encuadre, Zoom, SteeringWheels · Calculadora rápida, LINE's next
point, probe line/d07); an entry that is a command runs by its global name, echoed, repeated and undone like it, Deselect All is Escape ("Press
Esc to deselect all objects"), and an option is answered as typed; Escape or a click outside closes
the menu, and focus goes back to the drawing; es Repetir, Entrada reciente, Portapapeles, Intro,
Cancelar, Seleccionar similares, Agregar selección (the help's words), Modificaciones de REFENT (the
desktop's, d07: the help says Modificaciones de referencias)

**Missing:** Recent Input (INPUTHISTORYMODE), Isolate, real-time Zoom and the transparent Pan and
Zoom, SteeringWheels, Action Recorder, Subobject Selection Filter, Quick Select, QuickCalc, Find,
Options, Draw Order, Add Selected, Select Similar, Quick Properties, Paste as Block, Paste to
Original Coordinates, the object and command entries merged into them (OBJECT_…, COMMAND_…), the
Command menu's Pan and Zoom (d07); **unverified**: the order of the Default and Edit menus and the
labels Copy Selection and Deselect All (the 2026 help lists no menu whole: each entry is confirmed
apart, in task pages, and the order is the product's)

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
