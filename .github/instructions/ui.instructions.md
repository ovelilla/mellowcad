---
applyTo: "components/cad/**,components/ui/**,app/[locale]/(app)/**,hooks/**"
description: "React/UI conventions for the CAD editor shell (/draw): file layout, colour tokens (one scheme, dark), Base UI gotchas, icons and where each control belongs. The landing has its own rules in marketing.instructions.md."
---

# UI layer

React is a **dumb presentation shell**. Components read `EngineState` and call `CadEngine`
methods; they never contain CAD logic, geometry or drawing decisions. Import from `@/cad` only.

That holds for browser capabilities too: **no `Blob`, file picker, download anchor or global
keyboard listener in a component.** If a button needs one, the engine owes it a method (behind a
port, implemented in `cad/adapters/`) — otherwise the behaviour lives in the app rather than in
the package, and every consumer has to rewrite it. A component may keep purely visual state.
Failures are reported at the command prompt, not in a bespoke React banner. The exceptions are
the page's own layout, which lives with the page: the palette panel's remembered width and fold
(`lib/palette-layout.ts`, read by an inline `<head>` script before any bundle or engine exists) and
what the status bar's Customization shows (`lib/status-bar-layout.ts`, read after mount — the bar's
height never depends on it). AutoCAD keeps both in the user's profile, not in the drawing.

## Text

- **Every label comes from a catalog.** The chrome's own words are `Editor.*` in
  `messages/en.json`, read with `useTranslations("Editor.<Part>")` — the only messages the editor's
  layout sends to the browser. What the engine names is read from the engine: tool labels and
  aliases (`state.tools`), snap, colour and linetype names, the preset views and the ViewCube's
  faces and compass letters (`state.names`), property rows. A
  shortcut that is a command alias comes from `state.tools` too; a key combination is
  `Editor.Keys` (keys have local names — `Supr` on a Spanish keyboard); a function key is literal.
- The engine speaks the page's language: `CadWorkspace` takes the catalog the page loaded
  (`engineLocale`), and `useCadEngine({ locale })` hands it to the engine.
- `DirectionProvider` wraps the editor with the locale's direction, for Base UI's keyboard and
  positioning. See `i18n.instructions.md`.

## Right to left

The shell mirrors; the drawing never does. In an RTL page the workspace's grid runs the other
way — the tools on the right, the palette panel on the left with the ViewCube in the drawing's
corner beside it — and the bars read right to left, all of it from the page's direction and
logical classes, nothing from a second layout.

- **Classes are logical**: `ms-`/`me-`, `ps-`/`pe-`, `inset-s-`/`inset-e-`, `text-start`/`text-end`,
  `border-s`/`border-e`. `i18n/logical-properties.test.ts` fails on a physical side in
  `components/**` or `app/**` outside its list of justified exceptions. `components.json` has
  `rtl: true`, so `shadcn add` writes logical classes; change its `start-*`/`end-*` to
  `inset-s-*`/`inset-e-*` (Tailwind 4.2 deprecated them).
- **Popups take logical sides**: `side="inline-end"` for the tool palette's tooltips and drop-downs and
  the menus that open at the cursor; `top`/`bottom` need nothing. `Side` (`toolbar-primitives.tsx`)
  and the `ui/` wrappers accept both kinds.
- **LTR islands** (`dir="ltr"`): the canvas, the ViewCube's box (faces, compass, triangles and the
  order of the roll arrows), the command line, the dynamic input, the coordinate readout, keys
  (`<kbd dir="ltr">`) and the contact address. Put `dir` on the element whose children are
  positioned, never on a positioned element alone: the spec resolves a logical inset against the
  containing block, Chrome against the element. The canvas cell itself is not an island: the
  ViewCube's `inset-e` must follow the page there; what is placed in the canvas's pixels uses
  physical `left`/`top`, which no direction moves.
- **A technical value in a palette is an island with `text-end`** — its right in every page — so
  `-12.5` never reads `12.5-`. A typeable one is an island with its unit (the `dd` holding the
  field and the `mm`), or the unit lands before the number. A numeric field is `DecimalInput` (text, `inputMode="decimal"`, a
  point, the arrows step it), never `type="number"`: Chrome writes one in the browser's language
  (`3,75`) whatever the page's `lang`.
- **Icons**: `mirrored` on `IconAction` (elsewhere `rtl:-scale-x-100`) for linear direction or time
  — undo, redo, zoom previous, send, open outside. Never a rotation (orbit, the cube's roll) or a
  CAD glyph (mirror, extend, offset). `rtl:` matches inside an LTR island too (`[dir=rtl] *`).
- What speaks the command language carries `lang={state.commandLine.lang}` — the command line's
  lines, its prompt and input, the dynamic input — so a screen reader reads `Command: LINE` in
  English on an Arabic page. Not the containers whose `aria-label` is in the page's language.
- The workspace is the page's `<main>`: every control sits in a landmark (axe's `region`).
- `cn()` pairs `px`, `mx` and `inset-x` with their logical sides, which tailwind-merge 3.6 does not
  (`lib/utils.ts`): without it a caller's `px-1.5` stops replacing a component's `ps-2.5 pe-2`.

## File layout

- `components/cad/` is kebab-case, one primary component per file, and the **file name matches
  the component it exports** (`layers-control.tsx` → `LayersControl`).
- Small satellites of that component (rows, fields, local helpers) stay in the same file,
  shadcn-collection style.
- Shared rail/bar atoms live in `toolbar-primitives.tsx`; custom glyphs in `icons.tsx`.

## Colour — one scheme, dark

There is no theme switch, by decision: AutoCAD works dark, and so does the whole site.
The tokens in `:root` are the only values, `color-scheme: dark` keeps native controls dark, and
`@custom-variant dark (&)` makes every `dark:` utility — shadcn's included — always apply, so a
component added with the shadcn CLI renders as designed. Don't bring back next-themes, a `.dark`
class or light values.

- **One accent, `--active`**: the grips' blue (`THEME.grip`). A tool or mode that is on, a flyout
  whose member is running and the chosen option in a status-bar popover are `Button`'s
  `variant="active"` (`bg-active/15 text-active-foreground`), or those classes where it is not a
  `Button`. `text-active` is for a glyph alone: as text on its own tint it reads 4.1:1.
  Never `variant="default"` for state: `--primary` is near-white, so `bg-primary/N` is glare, not
  a highlight. Use `bg-accent` for a selected/current row (the token designed for it) and
  `text-primary` for check marks.
- Docked zones are `bg-card`, parted by a `border` on the side facing their neighbour, with no
  radius or shadow; a `Panel` or trigger inside one adds no surface of its own. The radius, the
  shadow and `bg-card/90` + `backdrop-blur` belong to popups and to what floats on the drawing.

## Type

One body, as AutoCAD's Segoe UI at 9 pt: hierarchy is weight and colour, never size. The roles
are tokens in `globals.css` (`@theme`), each a single class carrying size, weight and line height;
`body` starts every text — the portalled popups too — as `text-ui text-foreground`.

| Role  | Classes                            | Size / weight / line | For                                                                                                           |
| ----- | ---------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| value | `text-ui` (inherited)              | 12 / 400 / 16        | values, menu items, list options, buttons, tabs, tooltips                                                     |
| label | `text-ui text-muted-foreground`    | 12 / 400 / 16        | what names a value: field and row labels, column headers, help, the save state                                |
| title | `text-title text-muted-foreground` | 12 / 600 / 16        | a section of a palette or popover, a menu's heading                                                           |
| typed | `font-mono` on `text-ui`           | 12 / 400 / 16        | what is typed or read as a figure: the command line, the dynamic input, coordinates, values, aliases and keys |

- **Nothing under 12 px.** §4 of the redesign allowed 11 for tabular figures; none needed it. A
  new size is a new role, argued here, not a `text-xs` or `text-[Npx]`.
- **Three steps of colour**: `text-foreground`, `text-muted-foreground` and `text-faint-foreground`
  (disabled, placeholders, a layer that is off). Never a fraction (`text-muted-foreground/70`):
  each step keeps WCAG AA (4.5) on `card`, `background`, `accent`, the canvas and the active
  tint, which a fraction does not. State colours besides: `text-active-foreground` (on),
  `text-destructive` (errors), `text-primary` for a check mark.
- **Monospace only for what is typed or read as a figure.** Labels stay sans — the dynamic
  input's `Length`, a property's name — or an Arabic page draws them in Geist Mono's 0.6 em
  spaces with Readex Pro behind.
- **No capitals or tracking for titles**: a title is the title role in sentence case.
- **Arabic** (`:lang(ar)`, `globals.css`): both roles take a 20 px line. Readex Pro reaches 14 px
  above the baseline and 6 below at 12 px, and a 16 px line clips it wherever a text truncates.
  The command language's islands carry `lang="en"` and keep 16.
- **Rhythm**: rows of palettes, menus and lists are 28 px (`h-7`; a menu item's `py-1.5`), the
  height of every control ("Size", below). Text starts 12 px from its surface's edge: `px-3` in a palette, `p-3` in a popover, `p-1` + `ps-2` in a menu.
- `lib/type-scale.test.ts` fails on a size, weight, line height or tracking utility or a text
  colour with an opacity in `components/cad` or `components/ui`; `cn()` knows the roles as font
  sizes, so `cn("text-ui", "text-muted-foreground")` keeps both. The ViewCube's SVG sets its
  weight as an attribute (a class would size it too); its face names are drawn on the cube, sized
  to the face, the one text outside the scale.
- Measured by walking every visible text in Chrome with `getComputedStyle` (the audit of phase 4b,
  `docs/next-ui-redesign.md`); a new zone, palette or menu is checked the same way.

## Size

One size for everything one presses, as the type has one body: **28 px**. Chosen in phase 5b of
the redesign over 32 (with 40 px bars and 20 px icons) for density, not looks — WCAG 2.2's 2.5.8
(AA) asks 24 × 24 and both pass; Fitts's law gives 32 about 5 % on a 400 px reach with a mouse, a
precise pointer. The cost is in height: a browser on the commonest laptop (Full HD at 125 %)
leaves the page about 730 px, and at 32 the tool palette needs about 650 of its room, so it would
fold below some 775 px — on that laptop and every smaller one. At 28 it fits down to 700 (581 px
free for its 576). AutoCAD's own are about 24 at 100 %; at 125 % a 28 px control is 35 physical
pixels. 16 px icons go with 28 px controls (20 would go with 32).

| What                                                                       | Size                                                                                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| An icon button (`Button size="icon"`, `IconAction`)                        | 28 × 28, its icon 16                                                                                                        |
| A text button, a drop-down's trigger, a field, a tab, a row of a list      | 28 high (`Button`'s default, `SelectTrigger`, `h-7`)                                                                        |
| A mode's settings arrow (`size="icon-flyout"`), Zoom's under its button    | half of one: 14 × 28, 28 × 14 — attached, so the right-click on the 28 px mode is its equivalent target (2.5.8's exception) |
| A docked bar of controls: the top bar, the status bar, the panel's tab bar | 36 (`h-9`): the control and 4 px either side; the folded panel is 36 wide for the same reason                               |
| The command line                                                           | a bar of 36 like the others (`h-9`), so the three bars match; its field fills it                                            |
| The tool palette                                                           | two columns of 28, 2 px apart: a grid of 58 (`w-14.5`) inside `p-1`                                                         |

- **A zone sizes its content** (`box-content`): its border lies outside the numbers above, so
  the top bar is 37 px with it and the tool palette 67. A border inside the box eats a pixel, and
  every control then lands on a half pixel, which blurs its icon (the palette's grid measured
  59 px, its columns 28.5).
- **In a bar every part has a whole width**: a text part — the palette toggles (`w-24`), the
  save state's slot (`w-24`, there before the first save), Units (`w-9`) — gets a fixed one, or
  its fraction of a pixel pushes every icon after it off the pixel grid. Measured: every icon
  button of the five zones starts on a whole pixel.
- Outside the system, each for a reason: the ViewCube's Home, roll arrows and UCS menu
  (`size="icon-cube"`, `"cube"`, 24), drawn on the cube at its scale; the viewport control
  `[Top]`, a label on the drawing; the separators, the product mark and swatches, which are not
  targets.
- `lib/control-size.test.ts` fails on a height or square size off the system (`h-8`, `size-6`,
  `h-[30px]`…) in `components/cad` or `components/ui` outside its list of justified exceptions,
  and on a `Button` size the table does not have. A new size is argued here first.
- Measured in Chrome by listing every button, drop-down, field and tab with its box per zone:
  one size per kind.

## Base UI gotchas

- Put `z-50` on the **`Positioner`**, not the `Popup`. The positioner is transformed, so it
  creates a stacking context that traps a z-index set inside it.
- `asChild` composition is the `render` prop (`<Tooltip.Trigger render={<Button …/>} />`).
- `Select.Root` needs the `items` prop (a value→label record) for the closed trigger to show the
  label instead of the raw value.
- `onValueChange` can deliver `null` — guard before committing.
- Do not nest a Tooltip and a Popover on the same trigger; the popover stops opening.
- `Menu.RadioItem` and `Menu.CheckboxItem` leave the menu open on a click: a pick that ends the
  choice passes `closeOnClick` (Polar's angles, the palette's flyouts), a checklist
  `closeOnClick={false}` (the object snaps, Customization).
- `Dialog.Popup` sets no `aria-modal`: a modal dialog sets `aria-modal="true"` itself, or the
  engine hears its keys. While it is open the rest of the page is inert, so a test reaches the
  command line by a CSS selector, not by its role.
- `Panel` (from `toolbar-primitives.tsx`) does **not** forward props, so
  `<PopoverTrigger render={<Panel>…} />` drops the click handler and the popover never opens —
  silently. Render the `Button` as the trigger and wrap the whole `Popover` in the `Panel`.

## Where a control belongs

- **The workspace is a grid of named areas** (`CadWorkspace`): `top` and `status` across the
  window, `tools` · `canvas` · `panel` between them, and `command` above `status`. A control goes
  into a zone; never position one absolutely over the drawing. The canvas takes what the zones
  leave, so ZOOM Extents frames only what is visible.
  - **Every zone has its size in CSS** (the bars' `h-9`, the tool palette's `w-14.5`, the panel's
    `w-9` / `palette-open:w-(--palette-width)`, the command line's `h-9`), not from
    its content, and is rendered before the engine mounts: the canvas's box at the first paint is then the final one,
    which the landing's view transition grows into and the first view is centred in. A zone that
    resizes moves the canvas's edge; one that resizes with the work (the selection, each command)
    makes the drawing jump. A size that depends on what this device remembers is decided by a
    `<head>` script on `<html>` (`data-palette`, `--palette-width`), with a CSS fallback for the
    window's width, and the engine is handed the same answer when it is built
    (`useCadEngine({ paletteOpen })`) — never decided after mount, or the landing's sheet lands in
    the wrong box. Measured in Chrome with the bundles blocked against the box after mount.
  - **The canvas cell** (`#editor-sheet`, `relative`, exactly the canvas's box) carries
    `SHEET_TRANSITION` — no other element may — and holds what is placed in the canvas's pixels:
    the dynamic input and its option chips, at `state.dynamicInput.screen`. A popup anchored there
    (the snap override menu, the Selection list box) is portalled and positioned in the viewport,
    so its virtual anchor converts with `engine.clientFromScreen`; the raw state point lands off
    by the zones before the canvas.
  - On the drawing only what AutoCAD puts there, all in the canvas cell: the viewport controls
    (`ViewportControls`, top left — top right in RTL), the ViewCube with the navigation bar linked
    under it (top right — top left in RTL), the dynamic input, the menus at the cursor. Nothing
    else floats there; a new control finds its zone.
  - What sits on the drawing takes the pointer only where it is drawn: the ViewCube's column and
    SVG box let it through to the canvas, and only the buttons, the cube's zones, the compass and
    the triangles set `pointer-events-auto`. ZOOM Extents frames up to 40 px from the edge, so a
    corner grip can land under the cube's box and must stay pickable there.
- **The top bar** (`TopBar`) is one flex row, AutoCAD's application frame plus the Home tab's
  Layers and Properties panels, in this order:
  - the application menu (the product mark; New, Open, Save, Save As, Drawing Units, then the
    language as a submenu of `useLanguageLinks`), then the Quick Access Toolbar in AutoCAD's order
    — New (QNEW), Open, Save, Save As, Undo, Redo;
  - the auto-save state (`role="status"`, a slot of `w-24` there before the first save, the only
    part that shrinks and truncates);
  - Layers (the Layers tab's trigger) and the layer drop-down (`engine.applyLayerControl`: with a
    selection it moves it in one undo step, else it sets the current layer — two clicks);
  - Match Properties, then the object colour, lineweight and linetype drop-downs, which act on the
    selection and read ByLayer, disabled, with nothing selected until CECOLOR, CELTYPE and
    CELWEIGHT exist;
  - at the end, the palette toggles: Styles, Blocks and the command line (Ctrl+9), AutoCAD's View →
    Palettes. Layers, Styles and Blocks are `PaletteToggle`s: `engine.togglePalette(tab)` opens the
    palette panel on that tab, or folds it when that tab is showing, and reads `active` then.
  - The buttons run the commands by their global name (`engine.runCommand("_QSAVE")`), as
    AutoCAD's macros do, so they echo at the prompt; Undo and Redo call the engine.
  - Every part has a fixed width (`w-40` for the layer, `w-36`/`w-28`/`w-32` for the properties,
    `w-24` for a palette toggle)
    and `shrink-0`, so the row's length never depends on a layer's name or the selection; measured
    to fit 1280 px in `/es/draw` with a 50-character layer name. A wider part needs that
    measurement again. Never place a part at its own fixed offset.
  - Its drop-downs open downwards: a `Select` in a bar passes `below` (`alignItemWithTrigger`
    off), or the list covers its trigger, as it does in a palette.
- **Viewport controls** (`viewport-controls.tsx`, VPCONTROL 1) — only the view control exists:
  `[Top]` (the brackets are CSS, notation not words), labelled by `state.view.preset`, lists
  `VIEW_MENU` downwards and runs the choice through `engine.applyViewPreset`.
- **Navigation bar** (`navigation-bar.tsx`, NAVBARDISPLAY 1) — a vertical `role="toolbar"`
  linked under the ViewCube: Pan, the Zoom split button and Orbit, named by the engine's tools.
  The split button runs the member it shows (the last used, Extents first) and its arrow lists
  Extents, Window, Previous, In and Out. Its menus and tooltips open on the inline start, into the
  drawing. There is no Reset view: the ViewCube's Home does it.
- **ViewCube** (the drawing's top right, NAVVCUBELOCATION 0; top left in RTL, beside the palette
  panel) — `view-cube.tsx` draws `state.viewCube` in SVG
  (the engine's 0–1 box), with Home above, the compass round it and the UCS menu below; its
  right-click menu and the UCS menu are Base UI menus. It keeps only the hovered zone and the
  press it is reading as click or drag; every view, outline and label position comes from the
  engine, and so do its words (`state.names.viewCubeFaces`, `compass`); its menus' are
  `Editor.ViewCube`.
- **The palette panel** (`panel`, the inline end; `PalettePanel`) — Properties, Layers, Blocks and
  Styles as tabs of one docked palette, modeless: nothing on the drawing closes it. 280 px open
  (widened by its inner edge up to 480, `PaletteResizeHandle`; never narrower, or the tabs' names
  stop fitting in Spanish), folded to a 36 px strip of the
  tabs' icons. Open from 1600 px of window, folded below; only the width and the fold are
  remembered, each once the user changes it. Whether it is open and which tab it shows is
  `state.palette` (`showPalette`, `closePalette(tab)`, `togglePalette`, `setPaletteOpen`), so
  LAYER, PROPERTIES, DIMSTYLE, STYLE and BLOCKSPALETTE open it and LAYERCLOSE / PROPERTIESCLOSE
  fold it while their tab shows.
  - **Properties** never appears or disappears with the selection; only its content changes. At
    its top the object type drop-down (`state.properties.filters`: `All (6)`, `Line (5)`…, from
    the engine), `No selection` (`Editor.Properties.noSelection`, disabled) without one. Its
    values and edits are `state.properties` and the `"properties"` scope
    (`engine.setSelectionColor(value, "properties")`); the top bar's drop-downs keep the whole
    selection (`selectionLayerId`…, the default scope). With nothing selected, General shows the
    current settings: the current layer, changeable there (`setCurrentLayer`), and ByLayer,
    disabled, for the rest until CECOLOR, CELTYPE and CELWEIGHT exist.
  - **Layers** is the Layer Properties Manager: a toolbar (New, Delete — disabled with its reason
    as the label —, Set Current) over a table with column headers in AutoCAD's order (Status,
    Name, On, Lock, Color, Linetype, Lineweight, then the object count), scrolled sideways inside
    the panel. A click selects a row; a double-click on it, or Set Current, makes it current. A
    click on the selected row's name renames it after a pause, so a double-click still sets it
    current (F2, AutoCAD's other rename key, is the command history here). A double-click on a
    control of the row is that control's.
  - **After acting in a palette, focus returns to the drawing** (`engine.focusSurface()`) — a
    click on a tab, a strip icon, a toggle, a pick in a drop-down — so the next key types a
    command. The arrow keys on the tabs keep focus there (`event.detail > 0` tells a click).
- **The command line** (`command`, a bar of 36 px, as the status bar under it) is AutoCAD's as it starts: one prompt line. Above it,
  over the drawing, float the running command's temporary prompt lines (`commandLine.recent`,
  CLIPROMPTLINES 3; they fade once it ends — `animate-prompt-fade`, our time, AutoCAD documents
  none — and take no pointer), the whole history expanded up to 12 lines with F2 or the arrow at
  the line's end (`commandLine.historyOpen`; a press on the drawing or Escape collapses it), and
  the suggestions, which win over both. That is why the zone stacks above the canvas cell. Nothing
  of it resizes the zone, so running commands never resizes the drawing; hiding the line (Ctrl+9)
  collapses the zone, and it comes back while something is typed.
- **The status bar** (`status`, 36 px; `StatusBar`) in the order of AutoCAD's 2026 reference:
  the coordinates at its start (`1.5000, 2.0039, 0.0000`, at the drawing's precision, an LTR
  island), then at its end MODEL, Grid, Snap mode ▾, Ortho, Polar ▾, Object snap tracking, Object
  snap ▾, Lineweight, Selection cycling ▾, Units, Clean Screen and Customization (≡), right-most.
  - A mode is an `IconAction` (28 × 28); a mode with settings has its arrow, a half button of
    14 × 28 (`size="icon-flyout"`) attached to it, and a right-click on the mode
    opens the same menu (`IconAction`'s `onContextMenu`). The settings are Base UI menus —
    checkboxes for the object snaps and the list box, radio items for Polar's angles — except Snap
    mode's spacing, which is typed and stays a popover.
  - MODEL is a label, not a button: in model space AutoCAD's shows the last layout, and there are
    none. Units shows the insertion unit (`mm`) and runs `_UNITS`. Clean Screen is
    `engine.toggleCleanScreen` (Ctrl+0).
  - Customization is a menu of checkboxes, one per tool and the coordinates, remembered on this
    device; everything shows until hidden (the coordinates too, COORDS 1).
- **Clean Screen** (`state.cleanScreen`, CLEANSCREENON / CLEANSCREENOFF, Ctrl+0) hides the
  `tools` and `panel` zones (`hidden`, so the grid gives the canvas their room) and the top
  bar's ribbon parts — the Layers and Properties groups and the palette toggles — and keeps the
  application menu, the Quick Access Toolbar, the command line and the status bar. A palette opened
  meanwhile shows the panel again (`cleanScreen.palette`). It is never on at the first paint:
  AutoCAD does not save it, so it needs no head script.
- **ToolRail** (`tools`, the inline start, 67 px with its padding and border) — the tool palette: only commands that act on
  the drawing, two to a row, sectioned by `PALETTE` as the ribbon's Home tab panels (Draw, Modify,
  Annotation, Block, Utilities; Continue/Baseline and Adjust Space come from the Annotate tab), a
  `Separator` between sections. Its buttons are 28 × 28 `IconAction`s, icon-only with
  `side="inline-end"` tooltips.
  - Variant families (Circle, Arc, Rectangle/Polygon, Ellipse, Trim/Extend, Fillet/Chamfer, Break,
    Array, Text, Dimension, Continue/Baseline, Attributes, Measure) are flyouts, named by
    `Editor.ToolRail.flyouts`: a Base UI menu of radio items listing each member's icon, name and
    alias, as the ribbon's drop-downs do — never a strip of bare glyphs. Every drop-down opens on
    the inline end.
  - **Group by meaning, never to save room.** A flyout holds variants of one command or commands
    on one kind of object; a tool that merely does not fit is not hidden in an overflow menu
    (the ribbon's expanded panels are not copied: Join and Break are slots). When the palette
    outgrows its height, the answer is reconsidered then, not folded into a "more" menu.
  - **Folding by height**: in a window under 700 px tall (the `short:` variant, a media query in
    `globals.css`, so the palette has its final height at the first paint) the sections marked
    `folds` — Annotation, Block, Utilities — become one drop-down each, the ribbon's "Minimize to
    Panel Buttons": the button carries the section's first icon and its menu lists every tool of
    the section, a group per drop-down. Unfolded the palette is 17 rows and fits 720 px; folded,
    14 rows fit 650 px. A new slot must keep both, measured in Chrome (no palette button past the
    zone).
  - What is not a command on the drawing lives elsewhere, never nowhere: Undo and Redo in the
    Quick Access Toolbar, Match Properties with the object properties, the view tools on the
    navigation bar and the viewport controls. Select has no button: it is the idle state and
    Escape returns to it. Delete selection became ERASE in Modify (the Delete key still erases
    the selection).
  - Unlisted tools fall into a trailing group, so a tool that belongs elsewhere in the chrome (the
    view tools, Select, Match Properties) must be listed in `RAIL_EXCLUDED`.
- **A dialog** is AutoCAD's modal one, and only where AutoCAD has one: Drawing Units
  (`UnitsDialog`, UNITS) is `state.unitsDialog`, opened by the command — the application menu,
  the status bar's Units and the typed `UN` all run `_UNITS` — and its OK goes through the engine
  as one undo step (`engine.applyDrawingUnits`). A Base UI `Dialog` with `aria-modal="true"`,
  which the engine reads to leave the dialog its keys (a letter or an arrow there must not reach
  the prompt); `finalFocus={false}` and `focusSurface` on `onOpenChangeComplete`, so the next
  key types a command. Its fields start from the drawing each time it opens; it holds only what
  AutoCAD's holds and exists here, and `docs/autocad-coverage.md` lists the rest.
- The editor carries no product or meta copy (an About panel was removed): that belongs to the
  landing.
- The dynamic-input box is `pointer-events-none` and keyboard-driven — never make it clickable.
  A `paragraphs` field (MTEXT's editor) is a textarea: Enter stays a line break, Ctrl+Enter
  commits, and it is never reselected when focus comes back, or the next key would wipe the text.
- It reclaims focus only where
  `engine.mayTakeFocus` allows, which for the editor is anywhere. `useCadEngine(options)` passes an
  embed's store and scope through; the editor passes none.

## Palettes that show drawing content

A palette is a **tab of the palette panel**, never a popover: AutoCAD's palettes are modeless, and
a popover closes on the first click on the drawing. Which tab shows, and the Styles palette's
table (`state.stylesTable`), are `EngineState`, never local `useState` — otherwise typing
`DIMSTYLE` cannot open it. A new palette is a `PaletteTab` (`PALETTE_TABS`), a command that
calls `showPalette`, a branch in `PalettePanel` and, if the top bar has its trigger, a
`PaletteToggle`. Its trigger sits in the top bar with the others: Layers beside the layer
drop-down, Styles and Blocks with the palette toggles at the bar's end. The Layer manager does not
move the selection (a gesture AutoCAD has not): the layer drop-down does.

Anything that has to **draw drawing content** — a block thumbnail, a future layout preview — asks
the engine for a `Scene` (`engine.buildBlockPreview(...)`) and paints it with
`CanvasScenePresenter`. Never walk entities and draw them in a component: a preview built a second
way is a preview that can disagree with the drawing.

A popover that remains (a status-bar menu) still closes on a click on the canvas, and the canvas
handler runs _before_ the dismiss — so a guard on "is the command still running?" already reads
false. Don't fight it: what must stay up while one draws belongs in the panel.

## Icons

Custom CAD glyphs go in `components/cad/icons.tsx` via `createLucideIcon`, matching lucide's
metrics: 24 viewBox, rings at `r=10`, `stroke-width` 2. Point beads need `fill: "currentColor"`
and `stroke: "none"`, otherwise the inherited stroke pushes them past the viewBox and they clip.
Prefer a real lucide icon when one fits — a hand-rolled shape smaller than the viewBox aliases
badly at 16px.
