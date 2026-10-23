# Properties and tables

### Layers · `LAYER` / `LA` / `DDLMODES` · `LAYERCLOSE` · es `CAPA` / `CA` / `LAYER` / `DDLMODES` · `CERRARCAPA`

**Implemented:** colour, visibility, lock, current layer, ByLayer resolution; an Off layer's
objects are neither drawn, picked nor snapped (p323), and turning a layer off drops them from the
selection (d09-5); a locked layer's are drawn faded half way into the background, as
LAYLOCKFADECTL's default 50 (p00, d00-2; a block reference on one, whole), snapped (p322) and
selected at `Command:` by a pick, a window, a crossing, a lasso and Ctrl+A, drawn selected with no
grips (d02-1, d02-3; the crossing, the lasso and Ctrl+A decided alike), and locking a layer keeps
them selected (d09-4); the cursor over one at `Command:` shows a padlock up and right of the pick
box, no rollover glow, and the rollover tooltip as over any object (d01-1, d01-3); dragging a
selection leaves them where they are, and a double-click opens none for editing; a command given
them in a preselection counts them and leaves them out, `2 found` / `1 was on a locked layer.` (es
`2 encontrados` / `1 estaba en una capa bloqueada.`, p381, `command-line.md`); an edit from the
Properties palette or the drop-downs of a set holding them changes the others, drops them from the
selection and says so in AutoCAD's task dialog, `Properties - Locked objects` / `One or more
selected objects are locked and cannot be updated.` / `Number of objects removed from the selection
set: 1` (d03-5, d03-6; es `Propiedades: objetos bloqueados` / `Uno o varios objetos seleccionados
están bloqueados y no se pueden actualizar.` / `Número de objetos eliminados del conjunto de
selección:`, `AcTaskDialogs.resources.dll`'s TaskDialog_181); layer 0 and a new layer are index colour 7, white, Continuous (p300), drawn in the
screen's foreground as an object set to 7 is (a drawing saved before stored `#e2e8f0` for them,
read as 7); LAYER (and DDLMODES, acad.pgp in both languages) opens the Layer Properties Manager
as a modeless palette ("It can remain open as you work", LAYERDLGMODE 1), a tab of the palette
panel, and LAYERCLOSE closes it — WHY folding the panel only while Layers is the tab shown:
AutoCAD's palettes are separate windows, here they share one panel, so closing the layer manager
leaves another palette where it is; the manager's columns in the reference page's order — Status
(the check mark on the current layer), Name, On, Lock, Color (the swatch and, for an index colour,
its name in lower case, `white`, `red`, es `blanco`, `rojo`: d04-1, e02-1), Linetype, Lineweight —
then the object count, scrolled sideways in the panel; the rows, and the Layers drop-down's, sorted
by name whatever the case, re-sorted after a rename (d04-1, d04-9, d05-1); New makes `Layer1` (es
`Capa1`) with the selected layer's colour, linetype and lineweight, its name open for editing, and
leaves the current layer as it is (d04-4); Delete stays enabled and a layer it cannot delete — 0, the
current one, one holding objects, in a block definition too (p324–p326, p380) — answers with
AutoCAD's `Layer - Not Deleted` (d04-6); Set Current, or a double-click on a row, makes it current
("Select a layer and click Set Current … or double-click the name of the layer", 2026 onboarding);
turning the current layer off asks `Layer - Current Layer Off` first (d04-7); a click on the
selected name, or F2 while the list has the keyboard (the help), renames it, and a name in use in
any case (`Layer - Name Already Exists`, d04-11, d04-14), one with `<>/\":;?*|,=` or a backquote
(`Invalid characters in layer name.`, d04-13) or a rename of layer 0 (`Layer - Rename`, d04-16) is
refused with AutoCAD's dialog and the name stays — the engine refuses them too (p319–p321); the
dialogs' Spanish is `AcTaskDialogs.resources.dll`'s and `AcLayer.resources.dll`'s; every edit in the
manager is a step U takes back, named `'.-LAYER` as the manager runs it (d04-2; es `'.-CAPA`), a
lock or an unlock adding `Regenerating model.` (p302), and with UNDO's Layer on (the default)
consecutive ones are one step, U naming each (`'.-LAYER '.-LAYER '.-LAYER Regenerating model.`,
d04-3; consecutive -LAYER runs fold so too, p303, p306), each its own with Layer No (p315), parted by
any command between (p329); made while a command runs, an edit joins its step; the Layers panel's
drop-down in the top bar shows the selection's layer (empty when it is mixed, as the ribbon's is,
d06-1) or, with nothing selected, the current one; choosing a layer moves the selected objects to
it in one undo step and keeps the current layer, or with nothing selected makes it current
("If no objects are selected, the drop-down lists … display the current settings", 2026), a step U
names `'CLAYER` (d05-1) and never joins the manager's (p308); the Properties palette's Layer with
nothing selected sets it so too

**Missing:** -LAYER (`-LA`, es `-CA`; p300, p314: `Current layer:  "0"` and
`Enter an option [?/Make/Set/New/Rename/ON/OFF/Color/Ltype/LWeight/TRansparency/MATerial/Plot/Freeze/Thaw/LOck/Unlock/stAte/Description/rEconcile/Xref]:`,
es `[?/Establ/Def/CRear/RENombrar/ACT/DES/COlor/Tlínea/Grosorl/tranSParencia/MATerial/TRazar/Inut/Reut/Bloq/desbLoq/eStado/DESCr/REConciliar/refX]`;
its refusals `Cannot rename layer "0".`, `"A<B" is an invalid layer name.`,
`The selected layers could not be deleted.`, p319–p326), LAYDEL, CLAYER typed (SETVAR, roadmap row
24), LAYER as a step of its own, which the manager's edits join (U after LAYER and a lock says
`'.-LAYER LAYER Regenerating model.`, d04-2; here LAYER makes no step), the drop-down's On / Freeze /
Lock icons, Make Object's Layer Current, Match Layer, Layer Previous and the rest of the Layers
panel, freezing, Freeze / Plot / Transparency / Plot Style / New VP Freeze / Description columns,
column reordering, layer filters and the tree, the manager's settings dialog, LAYLOCKFADECTL
typed (SETVAR, roadmap row 24; here always 50), the task dialogs'
look (here a dialog of the editor's with their words; their Show details is left out, the details
shown), the new row placed under the selected one until it is renamed (here sorted at once),
layer 0's lineweight Default (p300: 370 -3; here 0.25 mm, Default is not modelled);
**unverified**: the manager's Set Current named `'.-LAYER` (only an edit's name was seen), es
`'.-CAPA` and `'CLAYER` (the Spanish desktop pass ran without the mouse), the Spanish title
`Capa` of the invalid-characters dialog and `Capa` in `Capa - El nombre ya existe` (the table's
`%ObjectName%`), what a colour that is not an index colour writes beside its swatch (AutoCAD writes
its RGB; here the swatch alone), the Arabic words (worded by the project, `docs/i18n-glossary.md`),
the drop-downs' answer to a set holding locked objects (only the palette's was probed, d03-5: the
same here, PROPS-D61), the padlock and the faded look at `Select objects:` (seen only at
`Command:`; here neither the padlock nor any fade but ERASE's)

### Linetypes · `LTSCALE` / `LTS` · `LINETYPE` / `LT` / `LTYPE` / `DDLTYPE` · `-LINETYPE` / `-LT` / `-LTYPE` · es `ESCALATL` / `EC` · `TIPOLIN` / `TL` / `TLINEA` / `DDLTYPE` · `-TIPOLIN` / `-TL` / `-TLINEA`

**Implemented:** Continuous and acadiso.lin's DASHED, HIDDEN, CENTER, PHANTOM and DASHDOT, the
metric drawing's file (MEASUREMENT 1, line/p202), DASHDOT's dash of 0 drawn as a dot, all six loaded
in every drawing, where AutoCAD's new drawing holds Continuous alone (p221) — WHY (at `LINETYPES`):
there is no Load option or Linetype Manager to load one; ByLayer and
ByObject; a line's pattern laid as AutoCAD lays it (p207): centred, beginning and ending on equal
dashes of `(L − m·period + first dash) / 2` with m whole periods (longer than the first dash when
the remainder is), and solid under one period; a polyline's straight segments each laid so, the
dashes either side of a vertex merging (PLINEGEN 0, pline/p232); a circle's laid from its start
(its OCS X) counter-clockwise about its normal, a dash first, stretched to n whole periods, n =
max(2, round(L / period)), and solid under one period (circle/p230–p232 on the plot, desktop
circle/d14 on the screen alike), so a circle drawn with its normal along −Z runs clockwise in plan
from 180° and a tilted one is laid at true length in its plane (circle/p233) — past 2048 periods
it is left unfitted to the renderer (WHY at `MAX_FITTED_PERIODS`, `SceneBuilder.ts`); an arc's
centred over its length as a line's, each dash a piece of the arc, and solid under one period
(arc/p200 measured on the plot, desktop arc/d10 on the screen alike: r10 0–180° is two dashes of
71.8°),
past 2048 periods unfitted as a circle's; an ellipse's laid as a circle's, from its start
(parameter 0) in whole stretched periods (13 round a 50 by 25 one, level or turned), and an
elliptical arc's centred over its length as an arc's, each dash a piece of the ellipse found along
its length, solid under one period (ellipse/p330 on the plot; the screen **unverified**, as the
arc's was alike); LTSCALE asks
`Enter new linetype scale factor <current>:` (es
`Indique nuevo factor de escala del tipo de línea`), offering the current factor with four
decimals whatever the drawing's precision (`<1.0000>`, `<1.2346>`, table 20988, p234); anything but
a number `Requires numeric value.` (es `Requiere un valor numérico.`); a factor above zero (0 or
less: `Value must be positive and nonzero.`, es `El valor debe ser positivo y diferente de cero.`,
and asked again), `1e3` and `1/2` read (p231, p233); saved in the drawing (initial 1.0000),
`Regenerating model.` when it changes; one undo step U names `LTSCALE Regenerating model.` and
REDO `LTSCALE` / `Everything has been redone` / `Regenerating model.` (es `ESCALATL Regenerando
modelo.`, p236), a step U names even when Enter kept the factor (p237); run transparently inside
LINE, `Regen queued.` and `Regenerating model.` when LINE ends (p235); CELTYPE, the linetype new objects take (saved in the drawing, initial ByLayer; one undo
step, as UNDO steps past "the command or system variable"): -LINETYPE, which LINETYPE runs too (WHY:
the Linetype Manager does not exist), opens with `Current line type:  "ByLayer"` and asks
`Enter an option [?/Set]:` again after each answer until Enter (`Invalid option keyword.`), as
AutoCAD 2027's console does (p205); its `?` lists acadiso.lin's linetypes, a metric drawing's file,
in the file's order and without Continuous, which is no file's (p202), as AutoCAD lays them out
(`Linetypes defined in file acadiso.lin:`, where AutoCAD writes the file's full path; `Name` /
`Description` columns), without asking the file's name (every linetype this build ships is
loaded); Set asks `Specify linetype name or [?] <ByLayer>:`, offering CELTYPE as stored
(`<Continuous>`, p226), Enter going back to the option prompt (p220), and takes a linetype's name
or ByLayer: `BYLayer` (`BYL`), the table's name `ByLayer` whole in any language (p224) and the
global `_BYL` (p229); its `?` asks `Enter linetype name(s) to list <*>:` and lists `ByLayer,
ByBlock, or one of these loaded linetypes:` with their columns, sorted by name whatever the case
(p217), then the option prompt again; no match writes the heading and `No matching linetype names
found.` on the dashes' line (p218); a blank line under the heading, which the console leaves out
(the desktop's **unverified**); a name it does not have says `Linetype "X" not found in acad.lin.` /
`You can use the "Load" option to load it from another file.`, `acad.lin` even in a metric drawing
as 2027 says (p213), and asks the option again; one undo step for the whole run, two Sets
included, U and REDO naming `-LINETYPE` (es `-TIPOLIN`), even a run that changed nothing (p246–p248),
UNDO 2 with LTSCALE `LTSCALE -LINETYPE Regenerating model.` (p249); run transparently inside LINE,
each segment takes the linetype current as it starts (p250, p251); es `Tipo de línea actual:
"PorCapa"`, `Indique una opción [?/Definir]`, `Precise nombre de tipo de línea o [?] <PorCapa>`,
`porCapa` (`C`; the English `BYL` and `POR` are no linetype, p223, p228), `Tipo de línea "X" no
encontrado en acad.lin.`, no match `Tipo de línea no encontrado.`; the acad.pgp aliases (p253): LT,
LTYPE and DDLTYPE run LINETYPE, -LT and -LTYPE -LINETYPE; es TL, TLINEA and DDLTYPE TIPOLIN, -TL and
-TLINEA -TIPOLIN (Spanish LT is LIST, p254, not built)

**Missing:** the listings' descriptions but Continuous's `Solid line` (acadiso.lin's are not
shipped to quote); the first `?`'s `Enter name of linetype file to list <acadiso.lin>:` (es
`Indique nombre de archivo de tipos de líneas que se van a enumerar <acadiso.lin>`) and the
listing's pages, `Press ENTER to continue:` (es `Pulse INTRO para continuar:`, p205); the other
linetypes of acadiso.lin, which Set finds there (the refusal names the file searched, table
20995); Spanish AutoCAD's acadiso.lin, whose linetypes are named in Spanish (`LÍNEAS_OCULTAS`,
`CENTRO`, `TRAZOS`, `TRAZO_Y_PUNTO`, `VALS`, p205): a linetype's name is drawing data, English in
every language here; the names as acadiso.lin writes them, in capitals (Set's `dashed` makes CELTYPE
`DASHED`, which the next run names, p209): the stored ids stay `Dashed`, drawing data; per-object ltscale (CELTSCALE), the Linetype Manager (its Details' Global Scale
Factor is LTSCALE), PSLTSCALE / MSLTSCALE (no paper space), Create and Load (there is no LIN file to
read or write), ByBlock (so Set's `BY` is no `BYBlock or BYLayer?`, p228), the Linetype Manager, the drop-down's Other…; PLINEGEN (a polyline lays
its pattern segment by segment, PLINEGEN 0's; PEDIT's Ltype gen is not built); **unverified**: how
AutoCAD lays a pattern on a polyline's arc segment: ours runs from its start; a dashed tilted or
thick arc (not plotted, laid as in plan); a line off the plan is centred on its length as drawn,
its pattern not foreshortened; a circle's dot is drawn as a line's, a run as long as the stroke is wide

### Lineweights + `LWDISPLAY` · `LWEIGHT` / `LW` / `LINEWEIGHT` · `-LWEIGHT` · es `GROSORLIN` · `-GROSORLIN`

**Implemented:** 24 standard values, ByLayer and ByObject; CELWEIGHT, the lineweight new objects
take (saved in the drawing, initial ByLayer, one undo step U names `-LWEIGHT`, es `-GROSORLIN`,
even when Enter kept it: p155, p156): -LWEIGHT, which LWEIGHT runs too (WHY: the Lineweight
Settings dialog does not exist), shows `Current lineweight: BYLAYER` (or `0.50 mm`, and `None` for
0.00 mm; es `Grosor de línea actual: BYLAYER`, `Ninguno`, the English word as Spanish AutoCAD
writes it: p140, p140b) and asks `Enter default lineweight for new objects or [?]:`, in
millimetres: any other value is set to the nearest valid value (the thinner on a tie: 0.325 is
0.30, 0.07 is 0.05, p143, p161) and says so, `Lineweight rounded to nearest valid value of 0.35 mm`
(es `Grosor de línea redondeado al valor válido más cercano de 0.35 mm`; 0.00 mm, not None, p140b),
a negative one `Invalid lweight number.` (es `Número de grosor de línea no válido.`, p146; −1 was
probed) and asks again, any other word `A weight in lineweight units is required.` (es
`Se precisa un grosor en unidades de grosor de línea.`), `BYLayer` (es `porCapa`: `C`, `PORC`,
p148c, p148d; `_BYLAYER`, p148) is ByLayer, `?` lists ByLayer and the 24 as the console lays them
out (six to a line, spaced in threes; `ByLayer` in Spanish too, p151) and asks again, Enter keeps
it; `'ZOOM` at its prompt runs and -LWEIGHT resumes (p165); run transparently, its heading is
`>>Current lineweight: >>BYLAYER` and each LINE segment takes the lineweight current as it starts
(p154); es `Indique el grosor de línea por defecto para los nuevos objetos o [?]`; LW and
LINEWEIGHT in English (p164, p162; Spanish has no LW, p164, and LINEWEIGHT is **unverified**
there, so not added); "wide polylines display lineweights
only when displayed outside of plan view": in plan their width is drawn, hairline at its edges;
LWDISPLAY starts on, where AutoCAD's starts at 0 (p204) — WHY: with no layouts or plotting here,
the screen is the only place a lineweight shows; the status bar's Lineweight toggles it as a step U
takes back naming `LWDISPLAY`, as it names the variable typed (p157b; after the button
**unverified**)

**Missing:** ByBlock and Default (LWDEFAULT; so the `?` listing's first line names ByLayer alone),
inches, the Lineweight Settings dialog and the drop-down's Lineweight Settings…; LWDISPLAY typed
(`Enter new value for LWDISPLAY <OFF>:`, saved in the drawing, p157, p157c), with SETVAR's other
variables (roadmap row 24)

### `FILL` · es `RELLENAR`

**Implemented:** `Enter mode [ON/OFF] <ON>:` (es `Indique modo [ACT/DES]`, the table's; RELLENAR
runs it in Spanish, p176), offering the current FILLMODE, which the drawing keeps: wide polylines
filled or outlined, each segment's band closed; `1` and `0` (declared, unlisted) are ON and OFF
(p168, p169), `O` asks `ON or OFf?` (p170), FOO `Invalid option keyword.` (es `Opción no válida.`,
p171), transparent (`'FILL`, p178), and U takes it back naming `FILL` (es `RELLENAR`), even when
Enter kept it (p174, p175), as AutoCAD 2027's console does; a wide polyline off the
plan is outlined, as AutoCAD fills one only seen along its extrusion direction

**Missing:** solid hatches and fills stay filled (what a solid hatch shows with FILL off is
**unverified**); the change shows at once rather than at the next regeneration (WHY in the tool:
nothing here keeps a regenerated display apart); FILLMODE typed as a system variable

### Colour · `COLOR` / `COL` / `COLOUR` · `-COLOR` · es `COLOR` / `COL` · `-COLOR`

**Implemented:** ByLayer and ByObject per-object override; CECOLOR, the colour new objects take
(saved in the drawing, initial ByLayer, one undo step that U, UNDO 2 and REDO name, `-COLOR -COLOR`,
properties/p128–p130, also a run that changed nothing): -COLOR, which COLOR runs too (WHY: the
Select Color dialog does not exist), asks `Enter default object color [Truecolor] <BYLAYER>:`
offering the current one as AutoCAD 2027's console does (`BYLAYER`, `1 (red)`, es `1 (rojo)`,
`210,155,95`; p101, p117, p119) and takes an index colour's number (1–7) or name by its keyword
(`Red` / `R` … `White`, `BYLayer`; es `Rojo`, `Amarillo`, `Verde`, `cIán`, `aZul`, `Magenta`,
`bLanco`, `porCapa`: table 26289, whose words are its hidden keywords, so es `C` is porCapa, p113c,
and `BY` asks `BYBlock or BYLayer?`, p139t), in Spanish also the English names whole (`RED`,
`BYLAYER`, p107b, p113b; `BYL` refused, p139t), or with Truecolor `Red,Green,Blue:` three values
from 0 to 255 separated by commas, no space (Space is Enter there, p139s; the box keeps one and
refuses it) (es `Indique el color de objeto por defecto [COlorverdadero]`, `Rojo,Verde,Azul`); a
word it cannot read or a fraction says `A color number or standard color name is required.` (es `Se
necesita un número o nombre de color normalizado.`; p116, p135), 0, a negative number or one past
255 `Invalid color number.` (es `Número de color no válido.`; p100, p105, p106), a bad true colour
or Enter there `Invalid color.  Type three comma separated values from 0 to 255.` (es `Color no
válido. Escriba tres valores separados por comas comprendidos entre 0 y 255.`; p119, p120, p124),
and asks again; Enter keeps it; es offers `<PORCAPA>` (line/p200); transparent (`'-COLOR` mid-LINE
gives each segment the colour current as it starts, p126), and `'ZOOM` runs at its prompt and
resumes it (p134); COL is an alias in both languages (p136), COLOUR in English only (p137, p137b)

**Missing:** the index colours 8–255 (their RGB values are not in the help, p103: asked again),
ByBlock (not modelled: `BYBlock`, es `porBloque`, `BYBLOCK` asked again, p114, p115), a true
colour apart from the index colour of its RGB (`Truecolor` 255,0,0 reads back as `1 (red)`, where
AutoCAD keeps `255,0,0` on the object and in -COLOR's `<255,0,0>`, line/p200: an object stores one
RGB here),
Colorbook, CECOLOR's `RGB:` and HSL forms, the Select Color dialog, typing CECOLOR, CELTYPE or
CELWEIGHT as a system variable (no SETVAR), the per-type defaults HPLAYER and HPCOLOR, DIMLAYER,
TEXTLAYER (all "use current" initially, which is what everything does here), CETRANSPARENCY

### Object properties (top bar)

**Implemented:** the Properties panel's Match Properties, Object Color, Lineweight and Linetype, in
that order: with objects selected they show their value (empty when mixed — **unverified**: the help
documents only the Properties palette's `*VARIES*`) and a choice changes them in one undo step; with
nothing selected they show the current settings, CECOLOR, CELWEIGHT and CELTYPE ("If no objects are
selected, the drop-down lists … display the current settings for the drawing"), and a choice sets
it, one undo step

**Missing:** Select Colors (the swatch beside the colour opens the browser's picker instead), the
linetype list's Other… and the lineweight list's Lineweight Settings…, ByBlock and Default in the
lists, Transparency, the List drop-down

### Properties palette · `PROPERTIES` / `PR` / `CH` / `MO` · `PROPERTIESCLOSE` · es `PROPIEDADES` / `PR` · `CERPROP`
**Implemented:** PROPERTIES opens the Properties palette, a tab of the modeless palette panel, and
PROPERTIESCLOSE closes it while it is the tab shown (as LAYERCLOSE); PR, CH and MO are the aliases
of Autodesk's shortcut guide (the 2026 help names only PR, in both languages; in Spanish CH is
CHAFLAN), and Ctrl+1 shows and hides it, as AutoCAD's does; WHY at the inline end: the 2026 help
documents no default side ("docked to either side of the drawing window"), and AutoCAD does not show
the palette at first start ("not displayed by default"); here it is open from 1600 px of window,
folded below, and the panel's width and fold are remembered; the object type drop-down at its top —
`All (n)` and one entry per type with its count (`Line (5)`), only the type when the selection has
one — narrows what the palette shows and edits ("modify the properties of a single object type at a
time") and keeps the selection; it goes back to All when the selection changes; `No selection`
without one, when General shows the current settings ("When no objects are selected, only the
current settings of general properties are displayed"): the current layer, which can be changed
there, and the current colour, linetype and lineweight, each set there too ("you can view and change
the current properties to be used for all new objects"), one undo step; General's Color, Layer,
Linetype, Lineweight and Thickness in AutoCAD's order (desktop line/d16); geometry rows per entity
type, editable (retype a value), coordinates read and retyped in the current UCS, closed-polyline
area; a line's one Geometry group in AutoCAD's order, Start X, Y, Z and End X, Y, Z retyped, Delta
X, Y, Z, Length and Angle read-only (greyed there; es `Inicio X`, `Fin X`, `Incremento X`,
`Longitud`, `Ángulo`, d16); an end retyped onto the other in plan stands a rising line vertical, and
onto it in space leaves a zero-length line, as LINE draws one (**unverified** in the palette); an
attribute definition's tag, prompt, default and modes, a reference's attributes by tag (read-only);
the Z: Thickness under General (line, circle, arc, polyline), a line's Start Z and End Z (each
retyped alone) and Delta Z (read-only, like Delta X and Y), Center Z (circle, arc, ellipse),
Position Z (text, multiline text, attribute definition, reference) and Elevation (polyline, hatch),
all read and retyped above the UCS's XY plane; a line's Length is its 3D one; with a tilted UCS or
object the position rows are read and moved as points in space; Normal X / Y / Z (read-only) on a
circle and an arc; a circle's one Geometry group as AutoCAD's (desktop circle/d10): Center X, Y and
Z, Radius, Diameter, Circumference, Area, Normal X, Y and Z, only the normal read-only (greyed
there), Circumference and Area setting the radius (0 or less refused, as Radius refuses it); es
`Centro X` as Autodesk's Spanish support names the palette's View rows ("Centro X y Centro Y
dentro de la vista aparecen atenuados en AutoCAD"), the desktop's own **unverified**; an arc's one
Geometry group as AutoCAD's (desktop arc/d09): Start X, Y and Z, Center X, Y and Z, End X, Y and Z,
Radius, Start angle, End angle, Total angle, Arc length, Area (the segment its chord closes) and
Normal X, Y and Z, the ends, Total angle, Arc length, Area and the normal read-only (greyed there),
Thickness under General; es `Ángulo total`, `Longitud de arco` worded from the console's
`ángulo total` (table 20981) and DIMARC's `longitud de arco` (AcDimRes 5345), the desktop's own
**unverified**; an ellipse's and an elliptical arc's one Geometry group as AutoCAD's (desktop
ellipse/d08): Start X, Y and Z, Center X, Y and Z, End X, Y and Z, Major radius, Minor radius,
Radius ratio, Start angle, End angle (0 and 360 on a whole one), Major axis vector X, Y and Z,
Minor axis vector X, Y and Z and Area, the ends, the vectors and Area read-only (greyed there), the
ratio (above 0, at most 1) and an arc's angles retyped, a whole ellipse's angles read-only
(**unverified** what retyping them does there); es `Relación del radio`, `Vector de radio mayor X`,
`Vector de eje menor X` as d08 shows them, the English labels **unverified**; a polyline's rows and groups as AutoCAD's (desktop pline/d08): Geometry's
Current Vertex (typed here where AutoCAD steps it with arrows), Vertex X and Y, Start segment width
and End segment width of the segment it starts (none at an open one's last vertex), Global width,
which sets every segment's, Elevation, Area (an open one's as if closed) and Length, the last two
read-only; Misc's Closed, Yes or No, which closes with a straight segment and no vertex or opens
it (help GUID-94C065AB), one undo step (es `Vértice actual`, `Vértice X`, `Varios`, `Cerrado`,
`Sí` from that page; `Anchura inicial del segmento`, `Anchura final del segmento`, `Grosor global`,
Autodesk's 2027 resources); a spline's Data Points and Misc groups as AutoCAD's (desktop
spline/d10-1–d10-3; the rows and their order in draw.md, SPLINE), its current fit or control point
stepped and moved as a polyline's current vertex, the rest read-only, the English labels
`ax26res.dll`'s by id, the Spanish d10's

**Missing:** General's Linetype scale, Plot style, Transparency and Hyperlink and 3D Visualization's
Material (d16); a polyline's Misc Linetype generation (`Disabled`, d08; PLINEGEN is not built, and
a row is shown only where it can be changed as there); the width a closing segment takes from Closed
(the polyline's constant width here, else none; **unverified**: AutoCAD keeps the last vertex's
widths, which nothing stores here); the Spanish desktop's own labels (**unverified**, only the help
page read); the current vertex's marker in the drawing, what Global width shows where the widths
vary (blank here, **unverified**), the geometry rows of several objects of one type (`*VARIES*`),
text content, editing attribute values, MTEXT's rotation in the UCS
(AutoCAD shows that one row there), a dimension's Z, the Normal rows on the other
types (**unverified** which ones AutoCAD shows), the drop-down's order of types and its wording for
a single object (**unverified**: `All (n)` and `Line (5)` are only in the help's screenshots), Quick
Select, Toggle PICKADD, the Auto-hide and Allow Docking options, floating the palette