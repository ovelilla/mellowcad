# View

### `ZOOM` / `Z` · es `ZOOM` / `Z`

**Implemented:**
`Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]:`
(es
`Precise esquina de ventana, indique un factor de escala (nX o nXP), o [Todo/Extensión/Previo/EScala/Ventana/Objeto]`;
`Requires a distance, numberX, or option keyword.`): a corner picked or typed there starts a window
(`Specify opposite corner:`, on the line of a picked first corner; a wrong one
`Invalid window specification.` and the same corner again), a factor typed there zooms by it (`2X`
from the current view, `2` from ZOOM All's); Window's `Specify first corner:` /
`Specify opposite corner:` (click-click or drag; a wrong corner or Enter
`Invalid window specification.` and the first corner again); a number typed at a corner is a direct
distance towards the cursor, Window's first corner's from LASTPOINT, an opposite corner's from the
first corner, as `@` there is (AutoCAD 2023's console; the corners leave LASTPOINT); Extents and All
(`Regenerating model.`; transparently nothing, as AutoCAD's transparent ZOOM says when it needs no
regeneration — it refuses one with `** Requires a regen, cannot be transparent.` — and nothing is
generated ahead here to leave); Previous (bounded history; `No previous view saved.`); Scale's
`Enter a scale factor (nX or nXP):` (es `Indique factor de escala (nX o nXP)`;
`Requires a distance (or numberX).`); Object's `Select objects:` with its modes and counts (a set
selected before it framed at once; `Regenerating model.`); transparent, `'ZOOM` / `'Z` typed
mid-command (below, Command window); an undo step, consecutive ZOOMs one (UNDO Combine, as AutoCAD
2023's console joins them): U names them last first (`ZOOM 'ZOOM`), puts back the view and ZOOM
Previous's list, and says `Regenerating model.` after them when one regenerated and the view goes
elsewhere (not after Extents and Previous back to the same view); REDO never says it; another
command, a mark or the navigation bar's Window (a menu's, never joined) parts them; a transparent
ZOOM is part of the command it ran in (U of LINE takes it back too)

**Missing:** Realtime (so the first prompt offers no `<real time>`, and its Enter ends ZOOM) and
Dynamic (mitigated by the mouse wheel), Center, `nXP` (no paper space); the first prompt written on
one line (AutoCAD breaks it before its keywords); transparent, its Extents, All and Object still say
`Regenerating model.`, where AutoCAD's transparent ZOOM cannot regenerate (one that would needs it
says `** Requires a regen, cannot be transparent.`)

### `PAN` / `P` / `-PAN` · es `ENCUADRE` / `E`† / `-ENCUADRE`

**Implemented:** `Press ESC or ENTER to exit, or right-click to display shortcut menu.` when it
starts, as AutoCAD 2023's console says it (es
`Pulse Esc o Intro para salir, o haga clic con el botón derecho para activar el menú contextual.`),
and no question after it (the prompt reads `PAN:`); left-drag pan, hand cursor, Previous, Escape; an
undo step (U `PAN`), never joined with ZOOMs (**unverified**: the console cannot drag; its -PAN is a
step of its own, joined with nothing); transparent, `'PAN` / `'P` typed mid-command
(`>>Press ESC or ENTER to exit…`; below, Command window). -PAN asks
`Specify base point or displacement:`, then ` Specify second point:` (es
`Precise punto base de desplazamiento`, ` Designe segundo punto`; what is no point, and Enter at the
first, `Requires two points, or a displacement followed by ENTER.`, es
`Requiere dos puntos o un desplazamiento seguido por INTRO.`): the drawing moves by the second point
less the first or, at Enter, by the first read as a displacement in the UCS, `@` from LASTPOINT at
the first and from the first at the second, neither point becoming LASTPOINT; transparent
(`>>Specify base point or displacement:`, `Resuming LINE command.`, taken back with LINE); its own
undo step, joined with nothing, by nothing too (U `-PAN`, `'-PAN` when typed so), as AutoCAD 2023's
console does; es `-ENCUADRE` **unverified** (no Spanish source names it)

**Missing:** the real-time shortcut menu's Pan / Zoom / 3D Orbit / Zoom Window / Zoom Original /
Zoom Extents items

### `PLAN` · es `PLANTA`

**Implemented:** `Enter an option [Current ucs/Ucs/World] <Current>:` (es
`Indique una opción [scp Actual/SCP/Universal] <Actual>`; `Invalid option keyword.`): Current ucs
(Enter's default) / Ucs (`Enter name of UCS or [?]:`, es `Indique nombre de SCP o`: a saved one by
name, `Cannot find UCS "NAME".`, `?` lists as UCS does, Enter ends) / World: looks down that UCS's Z
with its X axis pointing right (VIEWTWIST), fits the extents and says `Regenerating model.`; the UCS
stays; ZOOM Previous steps back; U takes it back (`PLAN Regenerating model.`) and REDO does it
again, regenerating last

### `-VPOINT` / `VPOINT` / `-VP` / `VP` · es `-PTOVISTA` / `-PV`† / `PTOVISTA`

**Implemented:** `Current view direction:  VIEWDIR=…` (in the UCS, as the variable is), then
`Specify a view point or [Rotate]:` (es `Precise un punto de vista o [Rotación]`), a view point
typed in the WCS (WORLDVIEW 1) — the viewer looks from it back at the origin — or Rotate's
`Enter angle in XY plane from X axis <…>:` and `Enter angle from XY plane <…>:` (es
`Ángulo a partir del eje X en el plano XY`, `Ángulo a partir del plano XY`), each offering the
current view's (270 / 90 in plan, as AutoCAD's); the view at twist 0, the line of sight's
arbitrary-axis X drawn right (`0,0,-1` has the X to the left, `0.01,0,-1` X = -1,0,-0.01, as UCS
View then reads in the console); what is no point refused with `Invalid input. Try again.` and the
current direction again (es `Entrada no válida. Vuelva a intentarlo.`), what is no angle with
`Requires valid numeric angle or second point.`, as AutoCAD 2023's console does;
`Regenerating model.`; fits the extents; ZOOM Previous steps back; VPOINT runs the same sequence; U
and REDO as PLAN's (`VPOINT Regenerating model.`)

**Missing:** the compass and tripod (Enter leaves the view, so the prompt shows no
`<display compass and tripod>`; Tripod, which the prompt declares but does not list — es `trípode` —
and which opens them in the console, is refused as any answer), VPOINT's Viewpoint Presets dialog,
VIEWDIR as typed (AutoCAD keeps `1.0000,-1.0000,1.0000`; here the unit direction),
`Regenerating model.` after Rotate's two defaults (AutoCAD leaves the view and says nothing),
WORLDVIEW 0

### `-VIEW` / `VIEW` / `-V` / `V` · es `-VISTA` / `VISTA`

**Implemented:** `Enter an option [Orthographic]:` (es `Indique una opción [Ortogonal]`), then
`Enter an option [Top/Bottom/Front/BAck/Left/Right]<Top>:` (es
`[sUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]<sUperior>`; `Invalid option keyword.` at
both); the presets are also answered at the first prompt without being listed, spelled as AutoCAD's
table spells them there (`Top` … `RIght`, `SWIso` / `SEIso` / `NEIso` / `NWIso`; es `sUperior` …
`SOIso`, `NOIso`), as AutoCAD's menus type them (`_-VIEW _SWISO`, which the history writes as
answered); fits the extents and says `Regenerating model.`; an orthographic preset also aligns the
UCS with the view from the WCS (UCSORTHO 1, UCSBASE the WCS), its origin at 0,0,0, in the same undo
step, and names it as UCS orthoGraphic does (`*FRONT*`); each view at twist 0, the line of sight's
arbitrary-axis X drawn right, so Bottom has the X to the left and its UCS X = -1,0,0 (AutoCAD 2023's
console); an isometric one leaves the UCS; `'-VIEW` mid-command asks the same, and every view, which
turns the view, says `** Requires a regen, cannot be transparent.` and changes nothing, as the
console does; VIEW runs -VIEW; U takes the view back with its UCS (`-VIEW Regenerating model.`),
REDO regenerating last

**Missing:** `?`, Delete, Restore, Save, sEttings, Window (no saved views), the View Manager,
UCSORTHO and UCSBASE as variables, the aligned UCS in UCS Previous's list

### `3DORBIT` / `3DO` / `ORBIT` · es `3DORBITA`

**Implemented:** dragging across turns the camera about the WCS's Z, dragging up and down raises or
lowers it, about the middle of the drawing under the centre of the screen, in parallel projection;
no editing while it runs; Enter or Escape ends it; each drag is a ZOOM Previous step; the run an
undo step (**unverified**: 3DORBIT stops AutoCAD 2023's console); Shift + the wheel button held
orbits from any command; Orbit on the navigation bar

**Missing:** the right-click menu (projection, visual styles, other navigation modes), orbiting
about the selection only, perspective, 3DFORBIT, 3DCORBIT and the rest of 3D navigation

### `NAVVCUBE` / `CUBE` · es `NAVVCUBE`

**Implemented:** `Enter an option [ON/OFF] <ON>:` (the current value; es
`Indique una opción [ACT/DES] <ACT>`; `CUBE` from Autodesk's shortcut guide),
`Invalid option keyword.` for anything else, as AutoCAD 2023's console says it; saved in the drawing
as NAVVCUBEDISPLAY 3 or 0; no undo step (**unverified** whether U undoes it)

**Missing:** Settings (the ViewCube Settings dialog; not offered, so the prompt lists `[ON/OFF]`),
NAVVCUBEDISPLAY's 1 and 2 (no visual styles)

### ViewCube (top right)

**Implemented:** the 26 parts, oriented to the current UCS (NAVVCUBEORIENT 1): a click looks along
the part with the UCS's Z up (Top and Bottom as -VIEW shows them, Top with the X to the right and
Bottom to the left — the cube's own Bottom is **unverified**), fits the extents or what is selected
(V13 **unverified**), is a ZOOM Previous step and no undo step (a click is no command;
**unverified**) and leaves the UCS as it is (UCSORTHO not applied: **unverified**, sources disagree
— a 2018 forum thread has the plane edge-on after the cube's side views, a 2026 article says it
"may" align — so after `-VIEW` Front, whose UCS faces the view, the cube shows TOP); a solid outline
on one of the 26, dashed off them; dragging orbits as 3DORBIT about the centre of the view, or of
the extents of what is selected, which stays where it is drawn ("About Reorienting the View"),
landing on a part let go within 10° of it (**unverified** threshold), one ZOOM Previous step, no
fit; in a face view the roll arrows (a quarter turn about the line of sight, offered on every face,
no fit: **unverified**) and four triangles pointing at it (the face on that side, a side face
upright, the top or bottom keeping the roll); Home above the cube and in its menu restores the
drawing's Home view and fits — its orientation only, in the WCS, saved in the drawing,
Top/Left/Front (SW Isometric) until set (**unverified**); the compass round its foot, North on the
WCS's Y: a letter looks from that side at the view's elevation (**unverified**), from the plan
turning that letter to the bottom, and dragging the ring turns the azimuth alone; the right-click
menu: Home, Parallel (checked, the only projection), Set Current View as Home (no undo step); the
UCS menu under it: WCS, the saved UCSs, New UCS, run as UCS World / NAmed Restore / UCS, echoed and
undone like them (`*NO NAME*` reads Unnamed); 50 % opacity until the cursor is over it; in a
right-to-left page its column sits top left with the palettes (no AutoCAD is right to left), the
cube itself unmirrored

**Missing:** Perspective and Perspective with Ortho Faces, ViewCube Settings and Help in the menu,
smooth transitions, NAVVCUBELOCATION / NAVVCUBEOPACITY / NAVVCUBESIZE / NAVVCUBEORIENT as variables
(fixed at top right, 50 %, one size, the current UCS), NORTHDIRECTION, orienting to the WCS

### Viewport controls (top left)

**Implemented:** the view control `[Top]` (VPCONTROL 1; top right in a right-to-left page, opposite
the ViewCube): the ten presets in its order — Top, Bottom, Left, Right, Front, Back, then SW / SE /
NE / NW Isometric ("Have You Tried: Viewing 3D Models", both languages) — each run as AutoCAD's
menus run it (`_-VIEW _SWISO`: echoed, fitted, an orthographic one aligning the UCS); its label is
the preset the camera looks along (a turned plan is none), else Custom View / es Vista personalizada
(**unverified**); the list opens downwards (**unverified**)

**Missing:** the `[+]` and visual style controls, VPCONTROL as a variable, Custom Model Views,
Parallel / Perspective and the View Manager in the list

### Navigation bar

**Implemented:** vertical, linked under the ViewCube (NAVBARDISPLAY 1): Pan, the Zoom split button
and Orbit, as the 2026 tour orders them; the split button runs the member it shows — the last one
used, Extents at first (**unverified** that AutoCAD's remembers it) — and its arrow lists Extents,
Window, Previous, In and Out (**unverified** order: the 2026 help names only Extents); Pan and
Window run the macros AutoCAD's buttons run (`'_pan`, `'_zoom _W`, as acad.cuix's Pan Realtime and
Zoom Window): transparently in the middle of a command (`Specify next point or [Undo]: 'PAN`, then
`Resuming LINE command.`), keeping what was typed in the box, and as the command at the Command
prompt, an undo step a typed ZOOM never joins (`'ZOOM`; "started from the menu are not combined");
the others act on the view at once, so they work inside a command as AutoCAD's transparent zooms do;
its lists open towards the middle of the drawing

**Missing:** SteeringWheels and ShowMotion, Realtime, All, Dynamic, Scale, Center and Object in the
Zoom list, the Orbit list (Free and Continuous Orbit), NAVBAR and NAVBARDISPLAY as a command and a
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
