# AutoCAD's interface: inventory and plan

> **Status:** phase 0 (this inventory and plan) done on 2026-11-24; phase 1 done the same day,
> its five blocks (the engine, the frame, Home, the other tabs, minimize and fold); the push that
> ships the ribbon waits for the owner's word; phase 2 under way since 2026-11-25 (its blocks in
> §6); phases 3 to 6 not started.
> The brief is `docs/next-autocad-ui.md`; where its phases and this plan differ, this plan rules
> (the brief says so) and the brief was corrected the same day.

## 1. How it was measured

- **AutoCAD 2027** (26.0s) on the desktop, the English profile (`acad.sh launch "" en-US`),
  workspace Drafting & Annotation (`WSCURRENT`), dark theme (`COLORTHEME 0`), at 96 dpi: a pixel
  below is a CSS pixel. The window was placed at 1920×1080 and at 1280×720 (and nine widths
  between 1760 and 800 for the fold order).
- **A first pass with no mouse and no keys**, the owner working on the other monitor: everything
  read and driven through UI Automation (`acad.sh tree`, `acad.sh act`, `acad.sh place`, written
  for this phase; `.claude/skills/autocad-research/gui.md`), captured from the screen with
  `acad.sh shot`, and the palettes opened by command. **A second pass with the mouse**, on the
  owner's word the same day, for what the first could not open: the application menu, the
  right-click menus, a tooltip, the crosshair, the grips, the viewport controls' menus, the two
  style dialogs.
- **The ribbon's definition** is `RibbonRoot.cui`, `WorkspaceRoot.cui` and `MenuGroup.cui` of the
  installed `acad.cuix`, printed by `node scripts/research/ribbon.mjs` (`--tab Home`, `--tabs`,
  `--panel <id>`, `--built` to mark what the engine has). The desktop agrees with it but for what
  plug-ins add: the Express Tools and Featured Apps tabs, Home's View panel, Manage's Cleanup and
  Performance, Collaborate's Compare.
- **The editor** was measured in Chrome at the same two sizes (skill `browser-verify`): each
  zone's box and every control's.
- The captures, the UI Automation dumps and the editor's measures are in
  `research/ui/2026-11-24/` (gitignored: Autodesk's interface is in them), the second pass's in
  its `autocad-mouse/`.

**What this profile had changed from the shipped state**, so not taken as AutoCAD's default: the
command line hidden (`CLISTATE 0`; shown for the captures and hidden again), dynamic input off
(`DYNMODE 0`), the Properties palette open and floating. The Autodesk Assistant palette docked
at the right is the profile's too, and nothing here stands in for it.

**Still not reached** (the first block of the phase that needs each, §7): the title bar's Help
list, which opened neither through UI Automation nor on a click (nor on four more, 2026-11-25);
a palette docked, anchored or auto-hidden; a profile known to be untouched, for the status bar's
shipped set.

## 2. AutoCAD 2027, zone by zone

### 2.1 The frame

Top to bottom, with the ribbon whole. Heights do not change with the window's size; only the
drawing area does.

| Zone                         | Height | At 1920×1080                     |
| ---------------------------- | ------ | -------------------------------- |
| Title bar                    | 32     | y 0–32                           |
| Ribbon: tab row              | 24     | y 32–56 (the tabs are 20 high)   |
| Ribbon: panels               | 100    | y 56–156                         |
| File tabs                    | 26     | y 156–182, then a 4 px edge      |
| Drawing area                 | rest   | y 186–1043: 857 (501 at 720)     |
| Layout tabs and status bar   | 33     | y 1043–1076, one row for both    |

The command line floats over the bottom of the drawing area and takes no row (§2.6). A docked
palette takes its width from the drawing area only: the ribbon and the bottom row stay whole.

### 2.2 Title bar

Left to right: the application button (some 48 wide); the **Quick Access Toolbar** — New, Open,
Save, Save As, Plot, Undo ▾, Redo ▾, Customize ▾ — then Share; the title, centred
(`Autodesk AutoCAD 2027   Drawing1.dwg`); InfoCenter (search, sign-in, App Store, Stay
Connected, Help ▾, Support Assistant); minimise, maximise, close.

- A Quick Access button is **24×22** with a 16 px icon, on a 24 px pitch; Undo and Redo are split
  buttons, the button 24 and its arrow 13 (36 in all).
- **Undo's arrow lists the steps**, newest first, one per row of 21 (23 pitch) in a popup 150
  wide, the list at most 600 high (26 rows) and then a scroll bar of 17, the first row
  highlighted, a caption of 28 below (`Undo 1 command`; acadres 4853 and 4855, `Undo %d
  commands`). **A row names its step's command in the profile's language, as said, its first
  letter capital and the rest small, without the dash** (`Line` for `L` and `_LINE`, `Layer` for
  `-LAYER`, `Ltscale`, `Id`; es `Linea`, `Circulo`, `Capa`), a group UNDO BEgin and End made
  `Group of commands` (4860, es `Grupo de comandos`), joined ZOOMs one `Zoom`, a mark `- Mark -`
  (4861) as written (2026-11-25, `research/ui/2026-11-25`). **Redo's** lists what the undos took
  back, the next to redo first, under `Redo 1 command` (4854, 4856; es `Repetir %d comando`).
- **The buttons and the rows are macros** (console history, 2026-11-25): Undo runs `_.undo` and
  answers `1`, the running command cancelled first (`*Cancel*`), so the line reads
  `…<1>: 1 LINE`; its list's n-th row answers `n` (`3 LTSCALE ID COLOR Regenerating model.`);
  Redo runs `_.mredo` and answers `1`, its n-th row `n` (`2 COLOR ID`).
- **The title** of a saved drawing is its name alone, no path, and a change leaves it as it is
  (`Planta baja.dwg`, no asterisk); the window's caption reads `… - [Planta baja.dwg]`.
- **Customize ▾** (rows of 21): the caption `Customize Quick Access Toolbar`, then a list —
  New, Open, Save, Save As..., Plot, Undo, Redo, Batch Plot, Layer, Match Properties, Plot
  Preview, Properties, Render, Sheet Set Manager, Workspace — a separator, More Commands..., Show
  Menu Bar, Show Below the Ribbon.
- A right-click on a Quick Access button (rows of 22): Remove from Quick Access Toolbar, Add
  Separator, Customize Quick Access Toolbar, Show Quick Access Toolbar below the Ribbon.

**The application menu** opens under its button, 424×593, in two columns:

- On top, across the right column, a search field (`Search Commands`, 273×20). Above the left
  column, two small toggles: Recent Documents and Open Documents (22×22 each).
- **The left column**, 139 wide, each entry a row of 46 with a 32 px icon and its name, in two
  targets: the name runs the command, an arrow of 20 at its end shows the entry's page (Save has
  no arrow). In order, a line at each `|`: New, Open, Save, Save As, Import, Export | Publish,
  Print, Drawing Utilities | Close.
- **The right column** shows Recent Documents until an entry's page takes it: a heading, `By
  Ordered List ▾` and a view list, then one row of 26 per file with its type's icon and a menu
  button at its end. With Open Documents chosen: its icon and heading (`Open Documents`), the
  view list, and one row of 26 per drawing open, its icon and name, in the order opened
  (desktop, 2026-11-25, es; the menu 459 wide in Spanish, 424 in English: the right column takes
  the longer words).
- **An entry's page** has a heading (Drawing Utilities': `Tools to maintain the drawing`) and its
  items, each a 32 px icon, the name in bold and one to three lines of description, on a pitch
  of some 61; it scrolls by an arrow at its foot.
  - New: Drawing, Sheet Set.
  - Open: Drawing, Sheet Set, DGN, Sample Files ▸.
  - Save As: Drawing, Drawing Template, Drawing Standards, Other Formats, Save Layout as a
    Drawing, DWG Convert.
  - Import: PDF, DGN, Other Formats.
  - Export: DWF, DWFx, 3D DWF, PDF, DGN, Other Formats.
  - Publish: Send to 3D Print Service, Archive, eTransmit, Email, Share Drawing.
  - Print: Plot, Batch Plot, Plot Preview, View Plot and Publish Details, Page Setup, 3D Print,
    Manage Plotters, Manage Plot Styles.
  - Drawing Utilities: Drawing Properties, DWG Compare, Units (`Control coordinate and angle
    display formats and precision.`), Audit, Status, Purge, Recover ▸, Open the Drawing Recovery
    Manager.
  - Close: Current Drawing, All Drawings.
- At the foot of the right column, two buttons: Options and Exit Autodesk AutoCAD 2027.
- The help adds that a double-click on the button closes the program.

### 2.3 Ribbon

**Tabs** of Drafting & Annotation, in order: Home, Insert, Annotate, Parametric, View, Manage,
Output, Add-ins, Collaborate, Express Tools, Featured Apps. The workspace also holds, hidden, 3D
Tools (between Parametric and View), Visualize and Automation; and inside View, hidden, the
panels Visual Styles, Coordinates and Navigate. After the last tab, the minimize button (20×18)
and its menu's arrow (10×18).

**A right-click on the ribbon** (rows of 24): Show Related Tool Palette Group, Tool Palette
Group ▸ | Show Tabs ▸, Show Panels ▸ | Show Panel Titles (checked) | Undock, Close. Show Tabs
lists every tab the workspace holds, each a check: Home, Insert, Annotate, Parametric, 3D Tools,
Visualize, View, Manage, Output, Add-ins, Collaborate, Automation, Express Tools, Featured Apps.
Show Panels lists the panels of the tab in front (on Home: Draw, Modify, Annotation, Layers,
Block, Properties, Groups, Utilities, Clipboard, View).

**Sizes.** A panel is 97 high: 72 of content, then its title bar, 18. In the content:

| Control                                  | Size                                                    |
| ---------------------------------------- | ------------------------------------------------------- |
| Large button (`LargeWithText`)           | 72 high, a 32 px icon over one or two lines of text; as wide as its text (Line 38, Polyline 48, Circle 52, Dimension 63) |
| Large split button                       | the same, in two targets: the icon, 38 high, runs; the text and its arrow, 35, open the list |
| Small button, icon only (`SmallWithoutText`) | 24×22, a 16 px icon                                  |
| Small button with text (`SmallWithText`) | 22 high, the icon's 24 and its text (Move 60, Stretch 67) |
| Small split button                       | its button and a 13 px arrow (Rectangle 24 + 13)        |
| A column of small controls               | three rows on a 24 px pitch (y 62, 86, 110): 72         |
| A combo (layer, colour, lineweight, linetype) | 22 high; the layer's 208 wide, the others 180 after a 20 px icon |
| Panel title bar                          | 18 high, the name centred with ▾ when the panel slides out; a dialog launcher (12×18) at its end in Properties |

The type is Segoe UI at 9 pt, 12 px on a 15 px line: the editor's `text-ui`.

**Drop-downs.** A split button's behaviour is in `acad.cuix`, under the names the CUI editor
words "Split with Recent" and so on: `SplitFollow` shows the member used last and runs it
(Rectangle, Ellipse, Hatch, Trim, Fillet, Dimension's Linear, Leader); `SplitFollowStaticText`
does the same under a text that stays (Circle, Arc, Array, Text, Measure, Edit Attributes);
`SplitNoFollow` always runs its own command (Paste); `DropDownFollow` shows the last member and
a click only opens the list (Cut, Copy: one target, 35×22). The list drops below the button,
left-aligned: each member a row of 38 with a
32 px icon and its name, groups parted by a line (5), the member shown highlighted (Circle's: 137
wide, six members in three groups, 254 high); a small button's list is the same, rows of 38 with
32 px icons (Rectangle's, `autocad-mouse/rect-list.png`). After 2-Point was picked from Circle's list the
button drew 2-Point's icon over the same `Circle`, and ran it; **after a restart it was Center,
Radius again**: the member is the session's, not the profile's. The button of a command that
is running was not lit while it ran (Circle, the pointer over the drawing).

**A tooltip**, a second or so after the pointer rests on a button: a light panel under the
button (Line's some 178×105, over the panel's title bar) with the name in bold, the description
(`Creates straight line segments`), a rule, then the command line's icon and the command in bold
(`LINE`) and, bold too, `Press F1 for more help`. The button under the pointer takes a faint
frame. After a longer rest, some four seconds more, the same panel grows into the extended tooltip:
a paragraph under the description (`With LINE, you can create a series of contiguous line
segments…`) and an illustration, before the rule (`autocad-mouse/tip-long.png`). A button pressed
takes a fill darker than the panel inside a thin frame (`autocad-mouse/press-line.png`).

**Insert** (Block, `AcInsertGalleryControl`) is one target, 38×72: it opens under it a gallery of
the drawing's blocks (empty in a new drawing) and then Recent Blocks..., Favorite Blocks... and
Blocks from Libraries..., rows of 21 (`autocad-mouse/insert-gal.png`).

**A panel's slide-out** (a click on its title bar): the rows after the panel's break drop below
it over the drawing, small controls on the same 24 px pitch starting 22 below where the title bar
was (Draw's at y 158 and 182, its title at 136), a `Spacer` 4 wide, and the title bar moves under
them with a push pin, 16×18, at its start. **It closes as soon as the pointer leaves it**, no
click needed, unless pinned (`autocad-mouse/ds-a.png`: the pointer moved off, it was gone).

**Minimize states**, by the button, in the order of the help's Cycle Through All. Its arrow's
menu (230 × 95, rows of 22, under the arrow): Minimize to Tabs, Minimize to Panel Titles, Minimize
to Panel Buttons | Cycle through All, the last checked in this profile; the button's glyph a box
with ▲, with ▼ in Tabs (research/ui/2026-11-24/block5). Minimized to panel buttons, each 60 × 59
with no ▾, its name cut (`Annotati…`); to panel titles, each 18 high, as wide as its name and 12,
no ▾, the dialog launcher kept after Properties'. RIBBONCLOSE takes the whole ribbon away (`RIBBONSTATE` 0) and
RIBBON brings it back (1), neither asking anything:

| State             | Ribbon below the title bar | Drawing area starts at | What shows                                    |
| ----------------- | -------------------------- | ---------------------- | --------------------------------------------- |
| Full              | 124                        | 186                    | the panels                                    |
| Panel buttons     | 86                         | 148                    | one button per panel, 60×59: a 32 px icon over its name |
| Panel titles      | 45                         | 107                    | one title per panel, a row of 21              |
| Tabs              | 24                         | 86                     | the tab row alone                             |

**Folding as the window narrows** (Home; the content of the tab is 1760 wide whole). First panels
shed text and width, then they fold, from the right, to a button 61 wide (a 32 px icon, the
name, ▾) that opens the whole panel below it, left-aligned with the button and **with its
slide-out's rows already out**, the title bar at its foot:

| Width | Draw | Modify | Annotation | Layers | Block | Properties | Groups | Utilities | Clipboard | View |
| ----- | ---- | ------ | ---------- | ------ | ----- | ---------- | ------ | --------- | --------- | ---- |
| 1760  | 224  | 250    | 189        | 273    | 240   | 255        | 69     | 97        | 91        | 62   |
| 1680  | 224  | 250    | 189        | 273    | 187   | 222        | 69     | 97        | 91        | 62   |
| 1600  | 224  | 216    | 148        | 273    | 159   | 222        | 69     | 97        | 91        | 62   |
| 1536  | 224  | 176    | 148        | 273    | 159   | 222        | 69     | 97        | 91        | 62   |
| 1440  | 224  | 133    | 148        | 273    | 159   | 222        | 69     | fold      | fold      | fold |
| 1366, 1280 | 224 | 133 | 148        | 273    | 159   | fold       | fold   | fold      | fold      | fold |
| 1152, 1024 | 224 | 133 | 148        | fold   | fold  | fold       | fold   | fold      | fold      | fold |
| 900   | 224  | 133    | fold       | fold   | fold  | fold       | fold   | fold      | fold      | fold |
| 800   | 224  | fold   | fold       | fold   | fold  | fold       | fold   | fold      | fold      | fold |

Modify at 133 is its twelve tools as icons; Annotation at 148 keeps Text and Dimension large and
drops the small ones' text; Block at 159 and Layers keep their large buttons. Draw was still
whole at 800. Insert, Annotate and View (block5, `uia-w<width>-<Tab>.txt`) do the same: every
panel sheds width first, then they fold from the right (Insert's Location, Linking & Extraction,
Data and Import at 1024; Annotate's Annotation Scaling, Markup and Tables at 1440; View's Interface
at 1024) — on AutoCAD's whole content, which is far more than is built here.

**What each tab holds that the engine has** (`ribbon.mjs --tabs --built`; a command counts when
its name is in `cad/locales/en.json`, so MEASUREGEOM's Distance and Area, which DIST and AREA
answer here, and the palettes' toggle buttons and the combos, which are no macro, are not in the
count):

| Tab        | Panels with something built                                                                 |
| ---------- | ------------------------------------------------------------------------------------------- |
| Home       | Draw 35 of 42, Modify 21 of 40, Annotation 9 of 21, Block 3 of 11, Properties 2 of 2 and its three combos, Utilities 2 of 10 and Measure, Clipboard 4 of 9; Layers has its button and the layer combo; Groups and View none |
| Insert     | Block 1 of 5 (and the Insert gallery), Block Definition 2 of 7                              |
| Annotate   | Text 2 of 6 and the style combo, Dimensions 9 of 25 and the style combo, Markup 1 of 4 (Wipeout) |
| View       | Named Views 1 of 2 (VIEW, whose View Manager is a dialog not built: block 4 draws nothing of it); Viewport Tools' three toggles (UCS Icon, View Cube, Navigation Bar); Palettes' Properties, Blocks, Command Line and Layer Properties; hidden: Visual Styles (the gallery VSCURRENT answers), Coordinates 13 of 14, Navigate 13 of 17 |
| 3D Tools (hidden) | Modeling 9 of 23, Solid Editing 21 of 25, Coordinates 9 of 9                          |
| Parametric, Manage, Output, Add-ins, Collaborate, Express Tools, Featured Apps | nothing |

### 2.4 File tabs

A row of 26: a menu button (32×24), `Start`, one tab per open drawing with its close button
(`Drawing1 ×`, bold when current, `*` after an unsaved name) and New (`+`, 41×24).

### 2.5 Drawing area

- **Viewport controls**, top left: `[–][Top][2D Wireframe]`, three labels, each a menu; the one
  under the pointer turns yellow. The menus are Windows' own, light, with rows of 22. `[–]`:
  Restore Viewport, Viewport Configuration List ▸ | ViewCube, SteeringWheels, Navigation Bar
  (checks). `[Top]`: `docs/coverage/view.md`. `[2D Wireframe]`: Custom Visual Styles ▸ | 2D
  Wireframe (checked), Conceptual, Hidden, Realistic, Shaded, Shaded with edges, Shades of Gray,
  Sketchy, Wireframe, X-ray | Visual Styles Manager...
- **ViewCube**, top right: at rest only the cube, its ring with N, E, S, W and the `WCS ▾` menu
  under it, translucent. With the pointer on it, opaque, and around it Home (top left), the two
  roll arrows (top right), a triangle at each side of the face and the cube's menu arrow (bottom
  right).
- **Navigation bar**, under the ViewCube and linked to it: Full Navigation Wheel, Pan, Zoom
  Extents ▾, Orbit ▾, ShowMotion.
- **UCS icon** at the bottom left; the MDI child's minimise, restore and close at the top right.
- **Grips**: filled blue squares (`GRIPCOLOR 150`, `GRIPSIZE 5`: some 11 px across), a selected object
  drawn with a light glow (`SELECTIONEFFECT 1`); a polyline's midpoint grips are bars. Under the
  pointer a grip turns pale red (`GRIPHOVER 11`) and, on a line's end, a light menu opens beside
  it (Stretch, Lengthen); clicked it is red (`GRIPHOT 12`) and the stretch shows the line it will
  be and a dashed orange band from the grip to the crosshair.
- **Crosshair**: white, each arm some 64 px (`CURSORSIZE 5`, of a 2560 px screen), with a 7 px
  box at its centre (`PICKBOX 3`); `APERTURE 10`, `CURSORBADGE 2`.

### 2.6 Command line

Floating by default, anchored over the bottom of the drawing area, just above the bottom row and
as wide as the drawing area: **one line, 27 high**, on a light bar. Left to right: a grip, close
(20×20), Customize (a wrench, 20×20), Recent Commands (an icon with ▾, 28×18), the field
(`Type a command` when idle), and at its end the history's arrow (15×25). The temporary prompt
lines (`CLIPROMPTLINES 3`) appear above it over the drawing, each on its own translucent label.
Closing it asks first (`Do you want to close the Command Line window?`, with `Always
close…`). Customize's menu (rows of 22): Input Settings ▸, Lines of Prompt History, Input Search
Options... | Transparency..., Options... Recent Commands lists the commands run, newest first,
by their names in capitals (`CIRCLE`, `PROPERTIES`). It keeps the width it had when hidden: shown
after the window had changed size, it ran past the window's edges.

### 2.7 Layout tabs and status bar

One row of 33. At its start the layout tabs: a menu button (32×24), `Model`, `Layout1`,
`Layout2`, New (`+`). At its end the status bar, then Customization (24×24) alone at the edge.

- A status button is **24×24**; one with a menu has an arrow of 16 beside it (40 in all). A menu's
  row is 24 (Object Snap's: 14 snaps and, last, `Object Snap Settings...`, 165 wide, opening
  upwards). Grid's menu is `Grid Settings...` alone.
- **What shows** in this profile, whose status bar no probe has customised (**unverified** as
  the factory's set): MODEL, Grid, Snap Mode ▾, Ortho Mode, Polar Tracking ▾, Isometric
  Drafting ▾, Object Snap Tracking, 2D Object Snap ▾, Annotation Visibility, AutoScale,
  Annotation Scale ▾, Workspace Switching ▾, Annotation Monitor, Isolate Objects, the System
  Variable Monitor's tray icon and Clean Screen. Coordinates, Dynamic Input, Lineweight,
  Transparency, Selection Cycling, Units, Quick Properties and Graphics Performance are off
  until chosen in Customization.
- **Customization's list**, in order (a separator at each `|`): Coordinates | Model Space | Grid,
  Snap Mode | Infer Constraints | Dynamic Input | Ortho Mode, Polar Tracking, Isometric Drafting
  | Object Snap Tracking, 2D Object Snap | LineWeight | Transparency | Selection Cycling | 3D
  Object Snap | Dynamic UCS, Selection Filtering, Gizmo | Annotation Visibility, AutoScale,
  Annotation Scale | Workspace Switching | Annotation Monitor | Units | Quick Properties | Lock
  UI | Isolate Objects | Graphics Performance | Clean Screen.

### 2.8 Palettes

Each is a window of its own, floating where it was left, with a **vertical title bar** on its
outer edge: close, auto-hide and a properties menu at the top, the name written upwards
(`PROPERTIES`, `LAYER PROPERTIES MANAGER`, `BLOCKS`) and its icon at the foot. Docking,
anchoring and auto-hide were not exercised (§7).

| Palette                  | Size as found | Layout                                                                 |
| ------------------------ | ------------- | ---------------------------------------------------------------------- |
| Properties               | 360×720       | the object type's list with Toggle PICKADD, Select Objects and Quick Select (24×24 each) beside it; categories that fold (General, 3D Visualization, Plot style, View, Misc), rows on a 19 px pitch, label and value in two columns of about half each |
| Layer Properties Manager | 650×350       | a toolbar (read from the capture: filters and layer states, New, New frozen in viewports, Delete, Set Current; Refresh, Settings; a search field), the filter tree at the left with Invert under it, the grid (Status, Name, On, Freeze, Lock, Plot, Color, Linetype, Lineweight, Transparency, New VP Freeze, Description) and a status line |
| Blocks                   | 430×560       | tabs written upwards at its left edge (Current Drawing, Recent, Favorites, Libraries), a filter and view options on top, the thumbnails, and Options at the foot (Insertion Point, Scale ▾ with X, Y, Z, Rotation with its angle, Auto-Placement, Repeat Placement, Explode) |

The ribbon's Layer Properties button stays lit while its palette is open. **STYLE and DIMSTYLE
open modal dialogs** (Text Style, Dimension Style Manager), not a palette; the ribbon also offers
each as a combo in Annotation's slide-out and on the Annotate tab.

### 2.9 Menus, tooltips and dialogs

- The shortcut menus were measured by the workspace review (`docs/coverage/workspace.md`).
- A ribbon tooltip: §2.3. `acad.cuix` gives each button its title and description, and the
  macro its command.
- **A dialog is Windows' own, light, under the dark theme**: a white title bar with the
  program's icon and a close button, grey groups, the buttons at the right or the foot.
  - **Text Style** (616×407): `Current text style:` on top; at the left the Styles list, the
    list's filter (`All styles`) and a preview (`AaBb123`); in the middle three groups — Font
    (Font Name, Font Style, Use Big Font), Size (Annotative, Match text orientation to layout,
    Height) and Effects (Upside down, Backwards, Vertical, Width Factor, Oblique Angle); at the
    right Set Current, New..., Delete; at the foot Apply, Cancel, Help.
  - **Dimension Style Manager** (521×373): `Current dimension style:`; the Styles list with
    `List:` (`All styles`) and `Don't list styles in Xrefs` under it; `Preview of:` with the
    drawing of a dimensioned part, and Description; at the right Set Current, New...,
    Modify..., Override..., Compare...; at the foot Close, Help.
  - **Modify Dimension Style** (566×523): the tabs Lines, Symbols and Arrows, Text, Fit, Primary
    Units, Alternate Units, Tolerances, each with the same preview at its top right; OK, Cancel,
    Help at the foot.
- UNITS, the point style and Save As were captured by their own reviews (their coverage entries
  cite the probes).

## 3. The editor today

Measured at `/draw` (`research/ui/2026-11-24/editor/`). Six zones in a grid:

| Zone      | Size                          | Holds                                                                    |
| --------- | ----------------------------- | ------------------------------------------------------------------------ |
| `top`     | 36 high                       | the application menu, the Quick Access Toolbar (New, Open, Save, Save As, Undo, Redo), then Layers and the layer list, Match Properties, colour, lineweight, linetype, List; at the end Styles, Blocks and the command line's toggle |
| `tools`   | 66 wide                       | 47 slots in two columns of 28 px buttons, in five groups                 |
| `canvas`  | 1176×609 at 720, 1572×969 at 1080 | `[Top]`, the ViewCube, the navigation bar (Pan, Zoom ▾, Orbit)       |
| `panel`   | 36 folded (below 1600), 280 open | Properties, Layers, Blocks and Styles as tabs of one docked panel     |
| `command` | 36 high, full width           | the prompt line and the history's arrow                                  |
| `status`  | 36 high, full width           | the coordinates at its start; at its end MODEL, Grid, Snap ▾, Ortho, Polar ▾, Object Snap Tracking, Object Snap ▾, Lineweight, Selection Cycling ▾, Units, Clean Screen, Customization |

Every control is 28 px with a 16 px icon (`.claude/rules/ui.md`, Size).

**The drawing area's height**, the cost of the change: at 1280×720 the editor has 609 px of
drawing and AutoCAD 501 with the ribbon whole (539 with panel buttons, 580 with titles, 601 with
tabs); at 1920×1080, 969 against 857. The canvas gains the tool palette's 66 px of width, and the
command line's row once it floats.

## 4. The differences

**Revoked**: a choice of ours, made equal to AutoCAD. **Platform**: it stays, with its WHY at the
code and in its coverage entry. **Missing**: the function around it does not exist here; recorded
in `docs/coverage/`, never a dead button.

### The frame and the title bar

| # | AutoCAD | Here | Class | Phase |
| - | ------- | ---- | ----- | ----- |
| F1 | Title bar, ribbon, file tabs, drawing, one bottom row | top bar, tool palette, canvas, panel, command row, status row | Revoked | 1 |
| F2 | The window's own title bar with minimise, maximise and close | none: the browser's window | Platform — a page cannot draw the window's frame; the row is kept for the application button, the Quick Access Toolbar and the title | 1 |
| F3 | The title names the program and the drawing | no title in the page; the tab's title is the site's | Revoked for the drawing's name once the file port knows it; until then `Drawing1.dwg`, as a new drawing's | 2 (block 4, done) |
| F4 | Quick Access: New, Open, Save, Save As, Plot, Undo ▾, Redo ▾, Customize ▾, Share | New, Open, Save, Save As, Undo, Redo, as 28 px buttons | Revoked: 24×22 on a 24 pitch. Plot and Share: Missing. Customize ▾: Missing (5) | 1, 2 |
| F5 | Undo and Redo are split buttons with the list of steps | plain buttons | Revoked | 2 |
| F6 | The application menu: its two columns, recent documents, Options and Exit | New, Open, Save, Save As, Drawing Units, the language, Send Feedback | Revoked: the two columns of §2.2, an entry's page with icon, name and description, and what exists here in its place — New ▸ Drawing, Open ▸ Drawing, Save, Save As ▸ Drawing and Other Formats, Drawing Utilities ▸ Units. Import, Export, Publish, Print, Close, the search, the documents' lists, Options and Exit: Missing. The language stays in it — Platform: AutoCAD is installed in one language and a page chooses its own | 2 (block 2, done) |
| F7 | InfoCenter: search, sign-in, App Store, Help ▾ | nothing | Missing, but Help ▾: Revoked, with Help (F1's page) and Send Feedback, which leaves the application menu, in the order of acad.cuix's Help menu (`ID_MnHelp`; the list itself never opened, so **unverified**, §7) | 2 (block 1, done) |
| F8 | File tabs: Start and one tab per drawing | none | Missing: one drawing at a time, no Start tab | — |

### The ribbon

| # | AutoCAD | Here | Class | Phase |
| - | ------- | ---- | ----- | ----- |
| R1 | Tools on the ribbon's tabs and panels | a palette of two columns at the left | Revoked | 1 |
| R2 | Large buttons with their name, small ones in rows of three | every tool a 28 px icon | Revoked: AutoCAD's sizes (§2.3) | 1 |
| R3 | A split button shows its last member; the list has 32 px icons and names | a menu of 16 px icons, names and aliases; the button shows the member picked last but only opens the menu | Revoked: two targets, one that runs the member and one that lists | 1 |
| R4 | A panel's rarer tools in its slide-out, with a pin | every tool in the palette | Revoked | 1 |
| R5 | Four minimize states, a button and its menu | none (under 700 px three groups fold to a menu) | Revoked | 1 |
| R6 | Panels shed text and fold from the right as the window narrows | none | Revoked, in the measured order | 1 |
| R7 | Layers and Properties are panels of Home | groups of the top bar | Revoked | 1 |
| R8 | Styles, Blocks and the command line are toggled from View › Palettes | toggles at the end of the top bar | Revoked | 1 |
| R9 | 3D Tools is a hidden tab of the workspace; 3D work has the 3D Modeling workspace | the 3D tools in the palette | Platform-like, for now: **the 3D Tools tab shows**, as do View's Visual Styles, Coordinates and Navigate — WHY: there is no workspace switching nor the ribbon's Show Tabs menu yet, and hidden they could not be reached | 1, 5 |
| R10 | Contextual tabs (Hatch Creation, Text Editor, Array) while their command runs | the command's prompts only | Missing | 6 |
| R11 | Tooltips: the name, a description, the command and `Press F1 for more help` | the name and the alias | Revoked: §2.3's four parts, the description from the engine's catalog | 5 |
| R12 | RIBBON and RIBBONCLOSE; Clean Screen closes the ribbon | neither command; Clean Screen hides the palette and the top bar's groups | Revoked | 1 |
| R13 | The ribbon docks at a side or floats; a panel can be dragged off; right-click shows or hides tabs, panels and titles | — | Missing (Show Tabs, Show Panels and Show Panel Titles: 5; Undock and the tool palette groups stay Missing) | 5 |
| R15 | A running command's button is not lit | the running tool's button is lit (`active`) | Revoked: the ribbon keeps the accent for what is a state (Layer Properties while its palette is open, a toggle) | 1 |
| R16 | A split button's last member lasts the session, whichever tab or state the ribbon is in | kept in the flyout's component, lost when it unmounts | Revoked with R3: the engine's, for the session (decision 2) | 1 |
| R14 | Tools with no ribbon button are typed (LEADER, SOLID, 3DFACE…) | the same, listed in `RAIL_EXCLUDED` | Equal; the list moves with the ribbon | 1 |

### The drawing area

| # | AutoCAD | Here | Class | Phase |
| - | ------- | ---- | ----- | ----- |
| D1 | `[–][Top][2D Wireframe]` | `[Top]` | Revoked for the visual style's label and list (VSCURRENT: the owner's request of 2026-11-10, served first by the ribbon's gallery in phase 1); `[–]`: Missing (viewport configurations) | 4 |
| D2 | The ViewCube's Home and roll arrows only with the pointer on it | always drawn | Revoked (§2.5) | 4 |
| D3 | Navigation bar: Wheel, Pan, Zoom ▾, Orbit ▾, ShowMotion | Pan, Zoom ▾, Orbit | Missing: SteeringWheels, ShowMotion, Orbit's list | — |
| D4 | The command line floats over the drawing | a row of its own under it | Revoked | 4 |
| D5 | Grips 11 px, blue 150, pale red under the pointer, red when hot; a glow on what is selected; a 7 px pickbox on arms of 64 | the engine's grips, highlight and crosshair | To compare in phase 4, side by side with §2.5's captures; no difference is assumed | 4 |
| D6 | The viewport controls' and the grips' menus are Windows' own, light | the editor's dark menus | Kept: one scheme, and a page cannot draw the system's menus | — |

### The command line

| # | AutoCAD | Here | Class | Phase |
| - | ------- | ---- | ----- | ----- |
| C1 | One floating line, 27 high, as wide as the drawing area | a docked row of 36, as wide as the window | Revoked | 4 |
| C2 | Close, Customize and Recent Commands at its start | none | Revoked for close (with CTRL+9 back) and Recent Commands; Customize: Missing (Input Settings, Lines of Prompt History, Input Search Options, Transparency, Options) | 4 |
| C3 | `Type a command` when idle | `Command:` and a hint with aliases | Revoked: the hint is ours | 4 |
| C4 | Temporary prompt lines as labels that fade | lines above the prompt that stay while the command runs | Revoked | 4 |
| C5 | It docks at the top or bottom as a window of several lines | — | Missing | — |

### The bottom row

| # | AutoCAD | Here | Class | Phase |
| - | ------- | ---- | ----- | ----- |
| S1 | Layout tabs and the status bar share one row of 33 | the status bar has a row of 36 | Revoked | 4 |
| S2 | Model, Layout1, Layout2 and New | none | Missing: no layouts. **MODEL stays a label** — Platform, as decided: the button would show the last layout | — |
| S3 | Status buttons 24×24, arrows 16 | 28×28, arrows 14 | Revoked | 4 |
| S4 | Coordinates, Lineweight, Selection Cycling and Units are off until chosen (§2.7: this profile's set) | all on | Revoked for the four, once a profile known to be untouched confirms the set: nothing on the platform forces ours, and what a user turned on stays on (the device keeps it) | 4 |
| S5 | The coordinates are the status bar's first tool, at its start | at the row's far start | Revoked | 4 |
| S6 | Dynamic Input, Isometric Drafting, the annotation tools, Workspace Switching, Isolate Objects… | — | Missing (`docs/coverage/workspace.md`, Status bar) | — |
| S7 | Units is a menu of length formats | the unit, opening UNITS | Platform-like, kept with its WHY: Decimal is the only format | — |

### The palettes and the dialogs

| # | AutoCAD | Here | Class | Phase |
| - | ------- | ---- | ----- | ----- |
| P1 | Each palette a window of its own, floating, with a vertical title bar | tabs of one docked panel | Revoked: each its own, floating inside the page by default, dockable at either side, its place and size kept on the device | 3 |
| P2 | Auto-hide and anchoring to a strip | the panel folds to a strip of icons | Revoked: auto-hide per palette | 3 |
| P3 | A palette can leave the program's window, to another monitor | — | Platform: nothing leaves the page | — |
| P4 | Layer Properties Manager: a wide grid with a filter tree and a toolbar | a list in the panel's tab | Revoked for the grid and toolbar of what exists; filters, states and viewport columns: Missing | 3 |
| P5 | Blocks: tabs at its edge and Options | the Current Drawing list | Revoked for its frame; Recent, Favorites, Libraries and Options stay Missing | 3 |
| P6 | Properties: PICKADD, Select Objects and Quick Select beside the list; categories that fold | the list and the rows | Revoked for folding; the three buttons: Missing | 3 |
| P7 | STYLE and DIMSTYLE are modal dialogs; the ribbon has their combos | a Styles tab of the panel | Revoked: the two dialogs, and the combos in Home › Annotation's slide-out and on Annotate | 3 |
| P8 | Quick Properties, Tool Palettes, DesignCenter, Sheet Set Manager… | — | Missing | — |
| P9 | A dialog is Windows' own: light, with the system's title bar | the editor's dark dialogs | Kept in colour (one scheme); each dialog's groups, order and buttons follow AutoCAD's, and UNITS, the point style and Save As are compared again when phase 3 builds the two of §2.9 | 3 |

### Kept from the platform, as the brief lists them

F1 for Help and F4 for selection cycling (the browser keeps Ctrl+W), the wheel button's
double-click at 500 ms, MODEL as a label, the page's language in the application menu, one
colour scheme. Each has its WHY in its coverage entry already.

## 5. Decisions

1. **AutoCAD's sizes, pixel for pixel**, for the ribbon, the title bar and the bottom row: 24×22
   and 24×24 small targets on a 24 px pitch, 72 px large buttons, 32 px icons. They pass WCAG
   2.2's 2.5.8 by its spacing exception (a 24 px circle on each target meets no other). The 28 px
   system stays for palettes, dialogs and menus, where AutoCAD's rows are no smaller (19 to 24)
   and a web form's are expected. `.claude/rules/ui.md` (Size) and `control-size.test.ts` take the
   new sizes in phase 1, from §2.3.
2. **The ribbon's state is the engine's**, as the Styles table's is: whether it shows (RIBBON,
   RIBBONCLOSE, Clean Screen), the tab, and the member each split button shows, which AutoCAD
   keeps for the session and no longer (§2.3) — so a contextual tab can one day follow a
   command, and a button's echo and repeat stay the engine's. The
   minimize state is the device's, as the palettes' fold is (`palette-layout.ts`'s way: read in
   the `<head>`, so the canvas's first box is its final one).
3. **A tab or panel with nothing built is not drawn**; a panel is drawn with what it has, in
   AutoCAD's rows, and its coverage entry lists the rest. So: Home without Groups and View; no
   Parametric, Manage, Output, Add-ins, Collaborate, Express Tools or Featured Apps.
4. **The 3D Tools tab and View's hidden panels show** (R9), until Show Tabs and workspace
   switching exist.
5. **The icons stay ours**, drawn at 16 and at 32 on lucide's metrics; a large button needs the
   32 px drawing of its tool, not the 16 px one scaled.
6. **One block per commit and the gate once per block**, each block leaving the editor whole: the
   ribbon replaces the palette in one commit, never both on screen.
7. **The look is ours; the place, the order, the sizes and the states are AutoCAD's.** The ribbon
   is drawn with the editor's primitives and tokens, in its one dark scheme; what follows AutoCAD
   is where each control is, in what order, at what size and in which state. It does not take the
   28 px system: it has variants of its own at §2.3's measures (decision 1).

## 6. Phases

Each closes with skill `finish-feature`. Each starts with the captures it still needs (§7).

### Phase 1 — the frame and the ribbon

1. **The engine**: the ribbon's state (decision 2), RIBBON and RIBBONCLOSE (skill `new-command`;
   their prompts and U's names probed on the desktop), Clean Screen closing and restoring it.
2. **The frame** (done 2026-11-24): the grid becomes title row (32), ribbon (124), canvas with
   the panel, command row, status row; the application button and the Quick Access Toolbar move
   to the title row at AutoCAD's sizes, with what they hold today, and the slot `TopBar` becomes
   `TitleBar`. The ribbon's zone has its height and follows `state.ribbon.open`, empty; Layers,
   Properties and the palette toggles stay in the title row after the Quick Access Toolbar. **The
   `tools` zone stays** (decision 6: each block leaves the editor whole, and the ribbon replaces
   the palette in one commit), folding below 1016 px of window and scrolling at 720.
3. **Home** (done 2026-11-24): Draw, Modify, Annotation, Layers, Block, Properties, Utilities and
   Clipboard in AutoCAD's rows (`ribbon.mjs --tab Home --built`), large and small buttons, the
   split buttons with their behaviours, the slide-outs with their pin; the title bar's Layers and
   Properties groups moved into their panels, and the `tools` zone went with the tool palette, the
   `short:` variant and the slot `ToolRail`; the ribbon's zone is the slot `Ribbon`. The command
   notes and the pages of `content/docs/` that said "top bar" or "tool palette" say the ribbon, in
   every language, with Undo's Missing in `docs/coverage/command-line.md`.
   - **At 1280 Home does not fit** (decision 6): what is built is 1521 px wide in English, 1632 in
     Spanish (AutoCAD's whole Home is 1760, and its panels fold from 1440). Until block 5 folds them,
     the panels' row scrolls sideways under the wheel or a trackpad, with no bar to take its
     height: at 1280 Properties, Utilities and Clipboard are past the edge. Nothing else of the
     editor changes at 1280.
   - **Left for block 4**, the tools the palette offered that Home does not hold (the list
     `OTHER_TABS`, gone with block 4):
     Continue, Baseline and Adjust Space (Annotate › Dimensions), the 3D primitives, EXTRUDE,
     REVOLVE, PRESSPULL, the booleans, SLICE, Fillet and Chamfer Edge and the face edits (3D Tools).
     TEXTEDIT loses its button for good: no panel of 2027 has one (its `^C^C_textedit` is the Text
     toolbar's); it is typed, or a double-click on a text.
   - **Reviewed 2026-11-24** (blocks 2 and 3: the diff against acad.cuix, the desktop's captures
     and the editor in Chrome); what it fixed is in its commit. What it leaves, each for the block
     named:
     - **Block 4: the Attribute Display drop-down** (done with it). Block's slide-out holds acad.cuix's
       `AcATTMODEDataBoundDropDown` (as Insert's Block panel does): three entries, `'_attdisp _n`,
       `_on` and `_off`, the one ATTMODE holds shown. Home's stand-in, one button that leaves the
       option to ATTDISP's prompt, is a gesture of ours nothing on the platform forces: build the
       drop-down, bound to ATTMODE, its three words each culture's acad.CUIX's.
     - **Block 4: Object Color's picker** (done with it: `More Colors...`, read on the desktop). The 20 px icon before the combo opens the browser's
       colour picker; AutoCAD's icon is no target, and its list ends in a row that opens Select
       Color. The picker goes behind that last row (its wording on the ribbon read on the desktop
       first), in the ribbon and in the Properties palette, which share `ColorSelect`.
     - **Block 5: widths where `calc-size` is missing** (done with it: `roundWidths`). `WHOLE` and `WHOLE_EVEN` round a text's
       width up in Chromium; where the function is not supported the width keeps its fraction and
       every icon after the first text is off the pixel grid (emulated in Chrome with
       `width: auto`: 59 of Home's 60 icons; Firefox and Safari **unverified**, neither is
       installed here). The fold measures the panels anyway: it rounds what CSS did not.
     - **Block 5 goes before the push** (done 2026-11-24). Home is whole from 1521 px of window (1632 in Spanish):
       at 1280, 1366, 1440 and 1536, the usual laptops, Properties, Utilities and Clipboard are
       past the edge with nothing to say so, where the palette showed every tool. The push that
       ships the ribbon waits for the fold, unless the owner says otherwise.
     - **Phase 5: tooltips.** A drop-down that only lists (Cut, Copy) and every list's arrow have
       none: Base UI opens no popup from a trigger that also has a tooltip.
     - **On the desktop, with the owner's word** (`gui.md`): whether a slide-out stays open after
       one of its tools is clicked (here it does, until the pointer leaves), whether a pinned one
       is closed by its title bar, and whether the pin outlives RIBBONCLOSE and Clean Screen (here
       it does not); Layer Properties' echo, and Modify's buttons with a grip hot
       (`docs/coverage/workspace.md`, Ribbon).
4. **The other tabs** (done 2026-11-24): Insert, Annotate, 3D Tools and View, in the workspace's
   order after Home (`RIBBON_TABS`), every tool the palette offered with its button again. What
   the desktop showed (UI Automation, `research/ui/2026-11-24/block4`) changed from what was
   planned:
   - **Attribute Display sets ATTMODE**, with no echo and a step U names `'ATTMODE`: the
     drop-down runs none of its entries' `'_attdisp` macros, so ATTDISP went to the typed tools.
   - **The View Cube toggle** sets NAVVCUBEDISPLAY with no echo (U `'NAVVCUBEDISPLAY`); UCS Icon
     runs `_ucsicon _off`; the palette toggles echo nothing; the gallery's pick runs VSCURRENT
     with no echo, U `VSCURRENT GROUP`.
   - **Not drawn**: Named Views (VIEW here is -VIEW's presets; its View Manager is a dialog not
     built), the Navigation Bar toggle (no NAVBARDISPLAY), a Styles toggle (View's Palettes has
     none: the Styles palette waits for phase 3's dialogs, reached meanwhile by its tab, the style
     buttons and launchers).
   - **3D Tools' Extrude and Revolve** are ID_Extrude2 and ID_Revolve2, `^C^C^R_extrude;` with no
     MOde answered: 3D Modeling's `_MO _SO` stays the tool's own.
   - **The style combos** (Text, Dimensions) stay for phase 3, with the dialogs; Annotate has
     their dialog launchers on its title bars.
   - Left, each in `docs/coverage/workspace.md` (Ribbon): the palette toggles' undo step (`GROUP
     LAYER`); the Define UCS list's `Icon` style; whether UCS Icon cancels a running command.
   - **Found by its second reading, older than it** (block 5, done: `useColorPicker`): a drag in the browser's colour
     picker applies the colour on every `input` event, a step each (`color-select.tsx`'s
     `onChange`, as the swatch did); one pick should be one step, on the field's `change`.
5. **Minimize and fold** (done 2026-11-24): the four states, the button and its menu; the fold in
   the measured order, a folded panel opening whole under its button. The desktop without the
   mouse (research/ui/2026-11-24/block5) confirmed the cycle and the default mode, measured the
   minimized rows and the other tabs' fold; neither the arrow's menu nor a minimized ribbon's
   popups opened that way. Built so:
   - **The state is the device's** (`ribbon-layout.ts`, `layoutStorage.ribbon`, the site's
     `mellowcad:ribbon:v1`), written on the root by a `<head>` script as the palette's is: the
     canvas's first box is its final one in each state (checked in Chrome).
   - **The fold is measured**, never a table: our panels are not AutoCAD's widths (Home is 1521
     whole), so the order is AutoCAD's and the width where each step falls is ours (`HOME_FOLD`;
     the other tabs by the rule, as they fit at 800 here). The row no longer scrolls.
   - **A menu pick only sets the mode**; whether AutoCAD minimizes at once, and how its minimized
     popups open and close, wait for the mouse (`docs/coverage/workspace.md`, Ribbon).
6. **What it leaves false**, corrected in the same commits: `docs/coverage/workspace.md` (Top
   bar and Tool palette become Title bar and Ribbon), `.claude/rules/ui.md` (Size, Where a
   control belongs), `control-size.test.ts`, `cad-editor.test.ts` and the slots (`TitleBar`,
   `ToolRail`), `packages/editor/docs/customizing.md` and the README, step 9 of skill
   `new-command`, skill `browser-verify` (Measuring the workspace), the pages of `content/docs/`
   and the command notes that say "tool palette" or "top bar", and the landing's filing where it
   names the palette.

### Phase 2 — the title bar

The application menu in AutoCAD's layout and order, Undo's and Redo's lists, Help ▾ with Send
Feedback, the drawing's name in the title and in the tab's. Its desktop pass is done (§7). Four
blocks, a commit each, each leaving the editor whole, built 1, 4, 2, 3:

1. **Help ▾** (done 2026-11-25): the split button at the bar's end, F1's question from its
   button, its list Help and Send Feedback, which leaves the application menu (F7).
2. **The application menu** in §2.2's layout: the left column of entries with their pages, the
   right column with Open Documents where AutoCAD shows Recent Documents, Options and Exit left
   out; only what exists here, the rest in the coverage (F6) Done 2026-11-25, third.
3. **Undo ▾ and Redo ▾**: split buttons with the steps listed as §2.2 names them, which needs the
   history's steps in `EngineState`; the button and each row run `_.undo n` / `_.mredo n` (F5).
4. **The drawing's name** in the title and in the tab's, from what the file port knows, else
   `Drawing1.dwg` (F3). Done 2026-11-25, second: the Open Documents list of block 2 shows it.

### Phase 3 — the palettes and the style dialogs

Properties, Layer Properties Manager and Blocks as palettes of their own (P1 to P6); STYLE and
DIMSTYLE as AutoCAD's dialogs, with the ribbon's style combos (P7). The Styles tab and the
single panel go. Starts with captures of a palette docked, anchored and auto-hidden, and of the
dialogs' other pages (New Text Style, and each tab of Modify Dimension Style).

### Phase 4 — the drawing area and the bottom row

The command line floating (C1 to C4, D4); the bottom row at AutoCAD's sizes and defaults (S1,
S3 to S5); the viewport controls' visual style label and list (D1), which closes that row of
VSCURRENT's Missing; the ViewCube at rest (D2); grips and highlight compared (D5).

### Phase 5 — what the ribbon still lacks

Tooltips (R11), the right-click menu with Show Tabs and Show Panels (R13, then decision 4 is
revisited), the Quick Access Toolbar's Customize ▾ (F4).

### Phase 6 — contextual tabs

Hatch Creation, Text Editor and Array as tabs that follow their command (R10). Each is a
command's own interface, so each goes through its command's review and research; listed here so
the ribbon of phase 1 leaves room for a tab the engine opens.

## 7. Desktop blocks still owed

The second pass of 2026-11-24 took most of what needed the mouse. What is left, each at the
start of its phase and with the owner's word first (`gui.md`):

| Phase | To capture |
| ----- | ---------- |
| 1 | done 2026-11-24 (§2.3): a button pressed, the extended tooltip, a small button's list, a slide-out open, the Insert gallery; block 4's toggles, gallery, Attribute Display and Object Color's list without the mouse (`research/ui/2026-11-24/block4`) |
| 2 | done 2026-11-25 (§2.2): Undo's and Redo's lists and what they run, the title of a saved drawing, the Open Documents list (`research/ui/2026-11-25`); the Help list opened on none of four clicks either, so its rows stay **unverified** |
| 3 | a palette docked, anchored and auto-hidden, and its properties menu; New Text Style; each tab of Modify Dimension Style |
| 4 | the status bar of a profile nobody has touched; the navigation bar under the pointer; the command line's history open |

Without the mouse, `acad.sh act` opens a drop-down, a slide-out, a folded panel, the status
bar's menus, Undo's list and the command line's two menus, and `acad.sh tree` reads their rows
and sizes; once a click has opened the application menu, `tree` reads it too, as a window of
its own.
