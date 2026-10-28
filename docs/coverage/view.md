# View

### `ZOOM` / `Z` · es `ZOOM` / `Z`

**Implemented:**
`Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]:`
(es
`Precise esquina de ventana, indique un factor de escala (nX o nXP), o [Todo/Extensión/Previo/EScala/Ventana/Objeto]`;
`Requires a distance, numberX, or option keyword.`; a factor of zero or less
`Value must be positive and nonzero.`, es `El valor debe ser positivo y diferente de cero.`, and
asked again, p105, p106): a corner picked or typed there starts a window (`Specify opposite
corner:`, on the line of a picked first corner; a wrong one `Invalid window specification.` and the
same corner again), a factor typed there zooms by it about the view's centre (`2X` from the current
view, `2` at ZOOM All's scale, p158; `nXP` is `nX`, as model space takes it, p110); Window's
`Specify first corner:` / `Specify opposite corner:` (click-click or drag; a wrong corner or Enter
`Invalid window specification.` and the first corner again; a corner typed as `x,y`, `@`, `@`
alone, polar or `*x,y`, `#` refused, p122–p126); a window is framed exactly (p138), one of no width
or no height by the other (p156, p157), one of no size ends ZOOM with `*Invalid*` (es
`*No válido*`) and the view left (p120, p121); a number typed at a corner is a direct distance
towards the cursor, Window's first corner's from LASTPOINT, an opposite corner's from the first
corner, as `@` there is (p127–p130; the corners and a factor leave LASTPOINT, a point at the first
prompt sets it, p121, p131, p135); Extents and All frame what is drawn with about 3 px a side
(p100, p108), silently, since 2027 regenerates only when the view leaves what it generated and
nothing is generated ahead here (p100, p108, p161); with nothing drawn they say
`Regenerating model.` (p136, p137), and transparently refuse with
`** Requires a regen, cannot be transparent.` (es
`** Regeneración necesaria, no puede ser transparente.`) and leave the view (a factor still zooms
then); Previous (20 views back, p162; `No previous view saved.`, p141); Scale's
`Enter a scale factor (nX or nXP):` (es `Indique factor de escala (nX o nXP)`;
`Requires a distance (or numberX).`; zero or less refused as at the first prompt, p114, p116;
Enter ends ZOOM, p115); Object's `Select objects:` with its modes and counts (a set selected
before it counted, `1 found`, and framed at once, p147; Enter with nothing ends it silently, p152;
`Regenerating model.` always, p139; transparently, it refuses with
`** Requires a regen, cannot be transparent.` after its set and leaves the view, p145); every ZOOM
drops a set selected before it (p147–p150); transparent, `'ZOOM` / `'Z` typed mid-command (below,
Command window); every run an undo step, one that leaves the view too (U `ZOOM` after
`No previous view saved.`, p364, p365), consecutive ZOOMs one (UNDO Combine, p347, p348;
`[LINE][ZOOM][ZOOM]` UNDO 2 `ZOOM ZOOM LINE`, p345): U names them last first (`ZOOM 'ZOOM`, p361),
puts back the view and ZOOM Previous's list (p362, p363), and neither it, REDO nor MREDO says
`Regenerating model.` (p336, p337, p347); another command (CIRCLE, ID, -PAN: p347, p355–p357), a
mark, the navigation bar's members (a menu's, never joined: `'ZOOM GROUP`, desktop view/d07) or the
ViewCube parts them, while a typed PAN, the wheel's and the wheel button's steps and its
double-click join them (`INTELLIZOOM ZOOM ZOOM`, `ZOOM PAN ZOOM`, desktop d01–d03); a transparent ZOOM
is an entry of the command it ran in: U takes it back with LINE (p358), LINE's Undo with the
segment before it (p360); Window's rectangle solid white, as AutoCAD's (desktop d08-1)

**Missing:** Realtime (so the first prompt offers no `<real time>`, and its Enter ends ZOOM where
AutoCAD starts it and says `Press ESC or ENTER to exit, or right-click to display shortcut menu.`,
p103) and Dynamic (mitigated by the mouse wheel); Center (`Specify center point:` / es
`Precise centro:`, `FOO` `Invalid point.` / `Punto no válido.`; then `Enter magnification or height
<57.0024>:` / es `Indique factor de ampliación o Altura <57.0024>:`, the view's height as the
default, Enter keeping it, `FOO` `Requires a distance (or numberX).`; the centre point is LASTPOINT,
p153, p154, p165); the hidden Left (`Lower left corner point:` / es `Esquina inferior izquierda:`,
then the same magnification prompt; the corner is LASTPOINT, p163) and Vmax (the widest view
without a regeneration, p164), refused here as any answer; the regeneration when Extents leaves
what was generated (there is no virtual screen); the first prompt written on one line (AutoCAD
breaks it before its keywords); UNDO n stopping inside a joined pair (after
`[ZOOM E + 2X][CIRCLE][ZOOM 2X]`, UNDO 2 writes `ZOOM CIRCLE ZOOM` and leaves the view at Extents',
p346, where U takes the pair whole; here UNDO 2 takes `ZOOM CIRCLE` and stops before the pair)

### `PAN` / `P` / `-PAN` / `-P` · es `ENCUADRE` / `E` / `-ENCUADRE` / `-E`

**Implemented:** `Press ESC or ENTER to exit, or right-click to display shortcut menu.` when it
starts (p200, p202; es
`Pulse Esc o Intro para salir, o haga clic con el botón derecho para activar el menú contextual.`,
p269), and no question after it (the prompt reads `PAN:`); left-drag pan, hand cursor, Previous, Escape; an
undo step (U `PAN`), dragged or not, joined with the typed ZOOMs and PANs round it as consecutive
ZOOMs are (`ZOOM PAN ZOOM`, `PAN ZOOM`, `PAN PAN`, desktop view/d03); the navigation bar's a menu's,
never joined (`'PAN GROUP`, d07); transparent, `'PAN` / `'P` typed mid-command
(`>>Press ESC or ENTER to exit…`; below, Command window). -PAN asks
`Specify base point or displacement:`, then ` Specify second point:` (es
`Precise punto base de desplazamiento`, ` Designe segundo punto`; what is no point, and Enter at the
first, `Requires two points, or a displacement followed by ENTER.`, es
`Requiere dos puntos o un desplazamiento seguido por INTRO.`): the drawing moves by the second point
less the first or, at Enter, by the first read as a displacement in the UCS, `@` from LASTPOINT at
the first and from the first at the second, a bare number at the second from the first towards
the cursor, `*` read in the WCS, a typed object snap, a typed second point unbent by Ortho,
neither point becoming LASTPOINT (p204–p219, p224, p225); transparent
(`>>Specify base point or displacement:`, `Resuming LINE command.`, taken back with LINE, p220,
p359), and `'PAN` and `'ZOOM` run at its prompts (`'ZOOM E` with nothing drawn refused, p221,
p222); the preselection dropped (p226); its own undo step, joined with nothing (p354–p356), by
nothing too (p368): U, REDO and MREDO name it (`-PAN`, `'-PAN` when typed so; es `-ENCUADRE`,
p269, p338) and never say `Regenerating model.` (p338); -PAN's band amber and dashed, as MOVE's
displacement (desktop d09-2)

**Missing:** the real-time shortcut menu (desktop d03-2: Exit · Pan, checked, Zoom, 3D Orbit · Zoom
Window, Zoom Original, Zoom Extents; Escape with it open closes it and ends PAN)

### `PLAN` · es `PLANTA`

**Implemented:** `Enter an option [Current ucs/Ucs/World] <Current>:` (es
`Indique una opción [scp Actual/SCP/Universal] <Actual>`; `Invalid option keyword.`): Current ucs
(Enter's default) / Ucs (`Enter name of UCS or [?]:`, es `Indique nombre de SCP o`: a saved one by
name, spaces typed key by key, `AB CD` whole, desktop workspace/d06; `Cannot find UCS "NAME".`, es `No se puede encontrar SCP "NAME".`, p236; `?` lists as UCS
does, Enter ends) / World: looks down that UCS's Z with its X axis pointing right (VIEWTWIST; UCS
Z 30 and X 90, p232, p233), fits the extents and says `Regenerating model.`, without VPOINT's
switch notices (p232); the UCS stays; ZOOM Previous steps back; U takes it back and REDO and MREDO
do it again, saying `Regenerating model.` (`PLAN Regenerating model.`, REDO's last) only when it
turned the line of sight (p349): PLAN in plan says it as it runs, not on U, REDO or MREDO (p339),
nor here after a view only untwisted (unprobed)

**Missing:** with nothing drawn the zoom stays where it was, where AutoCAD frames LIMITS (p238: no
LIMITS here)

### `-VPOINT` / `VPOINT` / `-VP` / `VP` / `DDVPOINT` · es `-PTOVISTA` / `-PV` / `PTOVISTA` / `PV` / `DDVPOINT`

**Implemented:** `Current view direction:  VIEWDIR=…` (es `Dirección de vista actual:`), then
`Specify a view point or [Rotate]:` (es `Precise un punto de vista o [Rotación]`), a view point
typed in the WCS (WORLDVIEW 1) — the viewer looks from it back at the origin, `0,0,0` the WCS's
plan (p203, p245) — or Rotate's `Enter angle in XY plane from X axis <…>:` and
`Enter angle from XY plane <…>:` (es
`Ángulo a partir del eje X en el plano XY`, `Ángulo a partir del plano XY`), each offering the
current view's (270 / 90 in plan, as AutoCAD's); the view at twist 0, the line of sight's
arbitrary-axis X drawn right (`0,0,-1` has the X to the left, `0.01,0,-1` X = -1,0,-0.01, as UCS
View then reads in the console, p246, p247); in a UCS that is not the WCS,
`*** Switching to the WCS ***` before the direction, given in the WCS, and
`*** Returning to the UCS ***` after the answer (es `*** Cambiando al SCU ***`,
`*** Volviendo al SCP ***`, p253), and after `*Cancel*` when Escape ends it, at the view point and
at Rotate's angles (desktop view/d09); what is no point refused with `Invalid input. Try again.` and the
current direction again (es `Entrada no válida. Vuelva a intentarlo.`), what is no angle with
`Requires valid numeric angle or second point.` (p244, p250); `Regenerating model.`; fits the
extents (p243); ZOOM Previous steps back; VPOINT runs the same sequence; U, REDO and MREDO as
PLAN's (`VPOINT Regenerating model.`, p340, p341)

**Missing:** the compass and tripod (Enter leaves the view, so the prompt shows no
`<display compass and tripod>`; Tripod, which the prompt declares but does not list — es `trípode` —
and which opens them in the console, is refused as any answer), VPOINT's Viewpoint Presets dialog,
VIEWDIR as typed (AutoCAD keeps `1.0000,-1.0000,1.0000`; here the unit direction),
`Regenerating model.` after Rotate's two defaults (AutoCAD leaves the view and says nothing),
WORLDVIEW 0; with
nothing drawn the zoom stays where it was, where AutoCAD frames LIMITS (p249: no LIMITS here)

### `-VIEW` / `VIEW` / `-V` / `V` · es `-VISTA` / `VISTA` / `-VI` / `VI`

**Implemented:** `Enter an option [Orthographic]:` (es `Indique una opción [Ortogonal]`), then
`Enter an option [Top/Bottom/Front/BAck/Left/Right]<Top>:` (es
`[sUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]<sUperior>`; `Invalid option keyword.` at
both); the presets are also answered at the first prompt without being listed, spelled as AutoCAD's
table spells them there (`Top` … `RIght`, `SWIso` / `SEIso` / `NEIso` / `NWIso`; es `sUperior` …
`SOIso`, `NOIso`), as AutoCAD's menus type them (`_-VIEW _SWISO`, which the history writes as
answered); fits the extents and says `Regenerating model.`; an orthographic preset also aligns the
UCS with the view from the WCS (UCSORTHO 1, UCSBASE the WCS), its origin at 0,0,0, in the same undo
step, and names it as UCS orthoGraphic does (`*FRONT*`); each view at twist 0, the line of sight's
arbitrary-axis X drawn right, so Bottom has the X to the left and its UCS X = -1,0,0 (p305, p332);
the UCS names in Spanish `*SUPERIOR*` … `*DERECHA*` (p304–p309); an isometric one leaves the UCS,
also a turned one, looking from the WCS's corner (p310–p313, p331), and an orthographic one aligns
from the WCS whatever the UCS (p330); `'-VIEW` mid-command asks the same, and every view, which
turns the view, says `** Requires a regen, cannot be transparent.` and changes nothing, as the
console does (p324, p334); VIEW runs -VIEW; U takes the view back with its UCS (`-VIEW Regenerating model.`,
p342, p343), REDO and MREDO regenerating last, only when the line of sight turned: the view already
shown says it as it runs, not on U or REDO (Top in Top, SW Isometric twice, p350, p369); Enter at
the first prompt is an undo step too (p366)

**Missing:** the named views, refused as any word: `?` (`Enter view name(s) to list <*>:`,
`Saved views:`, `  No matching views found.`; es `Indique nombre(s) de vista a listar <*>:`,
`Vistas guardadas:`, `  No se han encontrado las vistas.`, p316), Save
(`Enter view name to save:`, then `UCSVIEW = 1  UCS will be saved with view`; es
`Indique nombre de vista a guardar:`, `UCSVIEW = 1  SCP se guardará con la vista`, p317), Restore
(`Enter view name to restore:`, es `Indique nombre de vista a restituir:`, p318), Delete
(`Enter view name(s) to delete:`, es `Indique nombre(s) de vista a suprimir:`, p319), Window (the
name, then `Specify first corner:` and `Specify opposite corner:`, es `Designe primera esquina:`,
`Designe esquina opuesta:`, p320), sEttings
(`Enter an option [Background/Categorize/Layer snapshot/live Section/Ucs/Visual style]:`, es
`[Fondo/Categorizar/Instantánea de capa/sección Automática/Scp/Estilo visual]`, p315); the hidden
Categorize (`Enter view name to Categorize or [?]:`, es
`Indique nombre de vista a categorizar o [?]:`, p321), lAyer
(`Enter view name to edit Layer snapshot or [?]:`, es
`Indique nombre de vista para editar instantánea de capa o [?]:`; both refusing an unknown name
with `No matching view names found.`, es `Nombres de vista no encontrados.`, p322) and Ucs
(`Save current UCS with named views?[Yes/No]<Yes>:`, es
`¿Guardar SCP actual con vistas mencionadas? [Sí/No]<Sí>:`, p323); so the first prompt lists only
`[Orthographic]` where AutoCAD's lists `[?/Delete/Orthographic/Restore/Save/sEttings/Window]`
(es `[?/Suprimir/Ortogonal/Restituir/Guardar/PArámetros/Ventana]`); with nothing drawn a preset
leaves the zoom where AutoCAD frames LIMITS (p333: no LIMITS here); the View Manager (VIEW runs
-VIEW: the console knows no VIEW, p326), UCSORTHO and UCSBASE as variables, the aligned UCS in UCS
Previous's list; the UCS named `*TOP*` after U of an orthographic preset from the WCS (AutoCAD
keeps the WCS's axes under that name, p351, and 2027 still does, ucs/p260; here `*WORLD*`)

### `3DORBIT` / `3DO` / `ORBIT` · es `3DORBITA` / `3DO` / `ORBIT`

**Implemented:** `Press ESC or ENTER to exit, or right-click to display shortcut-menu.` when it
starts, hyphen and all (es
`Pulse ESC o INTRO para salir, o haga clic con el botón derecho para ver el menú contextual.`,
p329); dragging across turns the camera about the WCS's Z, dragging up and down raises or lowers
it, about the middle of the drawing under the centre of the screen, in parallel projection; no
editing while it runs; Enter or Escape ends it, saying `Regenerating model.`, dragged or not; each
drag is a ZOOM Previous step; the run an undo step, with no drag too, joined with nothing, whose U
and REDO always regenerate (`3DORBIT Regenerating model.`, es `3DORBITA Regenerando modelo.`, desktop
view/d04, e01; VIEW-D62); transparent, `'3DORBIT` mid-command: its exit words with no `>>` (a
report, not a prompt), `Regenerating model.` and `Resuming LINE command.`, U after LINE
`LINE Regenerating model.` (d04, VIEW-D63); Shift + the wheel button held orbits from any command
(Wheel and wheel button, `workspace.md`); Orbit on the navigation bar runs acad.cuix's `'_3dorbit`

**Missing:** the right-click menu (projection, visual styles, other navigation modes; Escape with
it open closes it and ends 3DORBIT, d04), orbiting about the selection only, perspective, 3DFORBIT,
3DCORBIT and the rest of 3D navigation

### `NAVVCUBE` / `CUBE` · es `NAVVCUBE` / `CUBE`

**Implemented:** `Enter an option [ON/OFF] <ON>:` (the current value; es
`Indique una opción [ACT/DES] <ACT>`; `CUBE` in both languages, p265, p266),
`Invalid option keyword.` for anything else (es `Opción no válida.`, p262–p264); saved in the
drawing, NAVVCUBEDISPLAY 3 when on (off, 2027 writes 1 under 2D Wireframe, clearing only that
visual style's bit, p262; here the cube is just hidden); an undo step U, REDO and MREDO name, Enter
alone too (move/p238, view/p344, p367), which takes nothing back

**Missing:** Settings (the ViewCube Settings dialog; not offered, so the prompt lists `[ON/OFF]`
where AutoCAD's lists `[ON/OFF/Settings]`, es `[ACT/DES/Parámetros]`, p262, p265), NAVVCUBEDISPLAY
per visual style (none here); U and REDO putting NAVVCUBEDISPLAY back and forth,
as AutoCAD 2027's console does (move/p238)

### ViewCube (top right)

**Implemented:** the 26 parts, oriented to the current UCS (NAVVCUBEORIENT 1): a click looks along
the part with the UCS's Z up (Top and Bottom as -VIEW shows them, Top with the X to the right and
Bottom to the left — the cube's own Bottom is **unverified**), fits the sphere round the 3D box of
the extents or of what is selected — its diameter the box's diagonal across the view's smaller
side, centred on it (desktop view/d05: Front, Top, Home and S leave VIEWSIZE the diagonal; VIEW-D65,
d05 showing a wide view's height only) —, is a ZOOM Previous step, and leaves the UCS as it is
(UCSORTHO not applied, d05; so after `-VIEW` Front, whose UCS faces the view, the cube shows TOP);
every action — a part, a roll arrow, a triangle, a compass letter, Home, a drag — writes
` Regenerating model.` and is an undo step U names `'.VIEWCUBEACTION Regenerating model.` (es the
same, e01), joined with nothing, regenerating on REDO too (VIEW-D62); inside a command it is
transparent: ` Regenerating model.`, `Resuming LINE command.`, an entry of LINE's step that its
Undo takes back with the segment before it (d05; the drag's own undo was not read, VIEW-D64); a
solid outline on one of the 26, dashed off them; dragging orbits as 3DORBIT about the centre of the
view, or of the extents of what is selected, which stays where it is drawn ("About Reorienting the
View"), and stays where it is let go however near a view (d05: 1.7° and 6.6° off Top, VIEW-D67),
one ZOOM Previous step; in a face view the roll arrows (a quarter turn about the line of sight,
counterclockwise left, clockwise right, VIEWTWIST 90 and 270, offered on every face, fitted, d05)
and four triangles pointing at it (the face on that side, a side face upright, the top or bottom
keeping the roll); Home above the cube and in its menu restores the drawing's Home view and fits —
its orientation only, in the WCS, saved in the drawing, Top/Left/Front (SW Isometric) until set
(**unverified**); the compass round its foot, North on the WCS's Y: a letter looks level from that
side, upright, from the plan too (d05: S gives VIEWDIR 0,-1,0 from Top and from SW Isometric), and
dragging the ring turns the azimuth alone; the right-click menu: Home, Parallel (checked, the only
projection), Set Current View as Home (no undo step); the
UCS menu under it: its button the current UCS's name (WCS only for `*WORLD*`), then WCS · the saved
UCSs and an unsaved or orthographic current one, `Unnamed` (es `S-nombre`), checked · New UCS
(ucs/d03-1, d03-5, d03-9, e01-8), run as UCS World / NAmed Restore / UCS, echoed and undone like them
(2027 writes the prompts alone, without `UCS` or the answers, and U names `UCS GROUP`: no macro here
echoes so, UCS-D103); 50 % opacity until the cursor is over it; in a
right-to-left page its column sits top left with the palettes (no AutoCAD is right to left), the
cube itself unmirrored

**Missing:** Perspective and Perspective with Ortho Faces, ViewCube Settings (its Snap to closest
view among them) and Help in the menu (d05: Home · Parallel, Perspective, Perspective with Ortho
Faces · Set Current View as Home · ViewCube Settings... · Help), smooth transitions, NAVVCUBELOCATION / NAVVCUBEOPACITY / NAVVCUBESIZE / NAVVCUBEORIENT as variables
(fixed at top right, 50 %, one size, the current UCS), NORTHDIRECTION, orienting to the WCS

### Viewport controls (top left)

**Implemented:** the view control `[Top]` (VPCONTROL 1; top right in a right-to-left page, opposite
the ViewCube): the ten presets in its order — Top, Bottom, Left, Right, Front, Back, then SW / SE /
NE / NW Isometric ("Have You Tried: Viewing 3D Models", both languages; es Superior … Isométrica NO,
desktop view/e01) — each run as AutoCAD's menu runs it (`'_-view` answered `_swiso`: echoed,
`Regenerating model.`, fitted, an orthographic one aligning the UCS, desktop d06), a step U names
`'-VIEW Regenerating model.` (es `'-VISTA`, e01); while a command runs the label takes no pointer
and the click is the command's (d06, VIEW-D66); its label is the preset the camera looks along (a
turned plan is none), else Custom View / es Vista personalizada (**unverified**); the list opens
downwards (**unverified**)

**Missing:** the `[−]` and visual style controls (`[-][Top][2D Wireframe]`, d06), VPCONTROL as a
variable, Custom Model Views, Parallel / Perspective and the View Manager in the list

### Navigation bar

**Implemented:** vertical, linked under the ViewCube (NAVBARDISPLAY 1): Pan, the Zoom split button
and Orbit, as the 2026 tour orders them; the split button runs the member it shows — the last one
used, Extents at first (d07) — and its arrow lists Extents, Window, Previous, In and Out, in
AutoCAD's order (d07-3; es Extensión, Zoom ventana, Previo, Acercar, Alejar, e01); each runs the
macro AutoCAD's button runs (acad.cuix: `'_pan`, `'_zoom _e`, `'_zoom _w`, `'_zoom _p`,
`'_zoom 2x`, `'_zoom .5x`, `'_3dorbit`): transparently in the middle of a command
(`Specify next point or [Undo]: 'PAN`, then `Resuming LINE command.`), keeping what was typed in the
box, and as the command at the Command prompt, writing ZOOM's first prompt with its answer, a step
U names as a menu's and nothing joins (`'ZOOM GROUP`, `'PAN GROUP`, es `GRUPO`; In doubles the view,
VIEWSIZE 120 → 60, d07; "started from the menu are not combined"); its lists open towards the
middle of the drawing

**Missing:** SteeringWheels and ShowMotion, Realtime, All, Dynamic, Scale, Center and Object in the
Zoom list (AutoCAD's: Zoom Extents, Window, Previous, Realtime, All, Dynamic, Scale, Center, Object,
In, Out; d07-3), the Orbit list (Free and Continuous Orbit), NAVBAR and NAVBARDISPLAY as a command and a
variable, the bar's menu (docking positions, unlinking from the ViewCube, customising its tools)

A view is a parallel projection from any direction (there is no perspective). Window and crossing
selection, ZOOM Window / Extents / Object and HATCH's boundary set work on the rectangle the
screen shows; elevation and thickness are drawn (an object at both heights with the edges joining
them; a circle's two circles without silhouette lines, **unverified**), and text turns with the
view. Off the plan the cursor lies on the work plane (the UCS's XY plane at ELEVATION); seen
edge-on it cannot point there and says `Pointing in edge-on UCS is prohibited.` (**unverified**,
from memory; es ours), and typed points still work. Objects are picked and snapped where they are
drawn; Apparent Intersection is the crossing on the screen. The grid lies on the UCS's XY plane
(not drawn edge-on). The view is not saved in the drawing (no view is yet); the presets and
Pan, Zoom and Orbit are on the navigation bar under the ViewCube, and the preset views on the
viewport controls in the opposite corner.
