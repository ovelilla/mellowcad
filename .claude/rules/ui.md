---
paths:
  - "components/cad/**"
  - "components/ui/**"
  - "app/*/*app*/**"
  - "hooks/**"
---

# UI layer (the editor, `/draw`)

> Verified against **@base-ui/react 1.9.0**, **tailwind-merge 3.7.0**, **lucide-react 1.59.0**.

React is a **dumb presentation shell**. Components read `EngineState` and call `CadEngine`
methods; they never contain CAD logic, geometry or drawing decisions. Import from
`@mellowcad/engine` only. The landing has its own rules (`marketing.md`).

**The chrome renders from `EditorState`** (what `useCadEngine` returns): the engine's state less
`POINTER_KEYS`, which every pointer move changes. A pointer field is read with
`useEngineSelector(engine, select)` in the smallest component that shows it (`Coordinates`,
`DynamicInput`). Passing the whole state down again, or reading a pointer field off it, puts back a
full-editor render per mouse event.

**The React Compiler is on** (`reactCompiler` in `next.config.ts`): no `useMemo`, `useCallback` or
`memo` for speed — only where a stable identity is the contract (a `useSyncExternalStore`
subscribe). A component that breaks the Rules of React is skipped silently by the compiler but
fails `npm run lint`: fix the code, never disable the rule.

**No browser capability in a component**: no `Blob`, file picker, download anchor or global
keyboard listener. If a button needs one, the engine owes it a method (behind a port, implemented
in `cad/adapters/`), or every host has to rewrite it. Failures are reported at the command prompt,
never in a React banner. The exception is the layout, kept on the device as AutoCAD keeps it in
the profile: the palette panel's width and fold (`lib/palette-layout.ts`, read by a `<head>`
script before any bundle) and the status bar's Customization (`lib/status-bar-layout.ts`, read
after mount), each under the host's key (`layoutStorage`; none, not kept), the site's frozen
(`lib/site.test.ts`).

## Text

- **Every label comes from a catalog**; no literals (`i18n.md`). The chrome's own words are its
  catalog, `components/cad/locales/en.json`, read with `useEditorText("<Part>")`; never next-intl,
  which is the site's (`i18n/messages.test.ts`).
- What the engine names is read from the engine, never copied into the catalog: tool labels and
  aliases (`state.tools`), snap, colour and linetype names, the preset views, the ViewCube's faces
  and compass letters (`state.names`), property rows. A shortcut that is a command alias comes from
  `state.tools`; a key combination is `Keys` (keys have local names — `Supr` in Spanish); a
  function key is literal.
- The editor speaks the page's language: `CadWorkspace` takes the catalogs the page loaded
  (`editorLocale`, `engineLocale`) and `useCadEngine({ locale })` hands the engine its own.
- **What speaks the command language carries `lang={state.commandLine.lang}`** — the command line's
  lines, prompt and input, the dynamic input, a prompt option in a menu — so a screen reader reads
  `Command: LINE` in English on an Arabic page. Not a container whose `aria-label` is in the page's
  language.
- `CadWorkspace` takes the page's `dir` and sets it, with its catalog's `lang`, on its root (the
  `<main>` and the popups' node), inside the `DirectionProvider` Base UI reads for keyboard and positioning.

## Right to left

The shell mirrors; the drawing never does — from the page's direction and logical classes, never
a second layout. This file owns the rule for the landing too.

- **Classes are logical**: `ms-`/`me-`, `ps-`/`pe-`, `inset-s-`/`inset-e-`, `text-start`/`text-end`,
  `border-s`/`border-e`. `i18n/logical-properties.test.ts` fails on a physical side in
  `components/**` or `app/**` outside its justified exceptions. `components.json` has `rtl: true`,
  so `shadcn add` writes logical classes; change its `start-*`/`end-*` to `inset-s-*`/`inset-e-*`
  (Tailwind 4.2 deprecated them).
- **Popups take logical sides**: `side="inline-end"` for the tool palette's tooltips and drop-downs
  and the menus at the cursor; `top`/`bottom` need nothing. `Side` (`toolbar-primitives.tsx`) and
  the `ui/` wrappers accept both kinds.
- **LTR islands** (`dir="ltr"`): the canvas, the ViewCube's box (faces, compass, triangles, the
  order of the roll arrows), the command line, the dynamic input, the coordinates, keys
  (`<kbd dir="ltr">`), the contact address. Put `dir` on the element whose children are
  positioned, never on a positioned element alone: the spec resolves a logical inset against the
  containing block, Chrome against the element. The canvas cell is not an island (the ViewCube's
  `inset-e` must follow the page); what is placed in the canvas's pixels uses physical
  `left`/`top`.
- **A technical value in a palette is an island with `text-end`**, so `-12.5` never reads `12.5-`.
  A typeable one is an island with its unit, or the unit lands before the number. A numeric field
  is `DecimalInput` (text, `inputMode="decimal"`, arrows step it), never `type="number"` (ESLint): Chrome
  writes one in the browser's language (`3,75`) whatever the page's `lang`.
- **Icons**: `mirrored` on `IconAction` (elsewhere `rtl:-scale-x-100`) for linear direction or time
  — undo, redo, zoom previous, send, open outside. Never a rotation (orbit, the cube's roll) or a
  CAD glyph (mirror, extend, offset). `rtl:` matches inside an LTR island too (`[dir=rtl] *`).
- The workspace is the page's `<main>`: every control sits in a landmark (axe's `region`).
- A caller's `px-1.5` replaces a component's `ps-2.5 pe-2` (tailwind-merge pairs `px`, `mx` and
  `inset-x` with their logical sides since 3.7; `lib/utils.test.ts` holds it).

## File layout

`components/cad/` is kebab-case, one primary component per file, the file named after its export
(`layers-control.tsx` → `LayersControl`); its small satellites stay in the same file. Shared bar
atoms live in `toolbar-primitives.tsx`, custom glyphs in `icons.tsx`.

## Colour — one scheme, dark

No theme switch, by decision: AutoCAD works dark, and so does the whole site (landing included).
The tokens in `:root` are the only values, `color-scheme: dark` keeps native controls dark, and
`@custom-variant dark (&)` makes every `dark:` utility — shadcn's included — always apply. Never
bring back next-themes, a `.dark` class or light values.

- **One accent, `--active`**, the grips' blue (`THEME.grip`): a tool or mode that is on, a flyout
  whose member runs, the chosen option in a status-bar popover — `Button`'s `variant="active"`
  (`bg-active/15 text-active-foreground`), or those classes off a `Button`. `text-active` is for a
  glyph alone (as text on its own tint it reads 4.1:1). Never `variant="default"` for state:
  `--primary` is near-white, so `bg-primary/N` is glare. `bg-accent` for a selected row,
  `text-primary` for check marks.
- Docked zones are `bg-card`, parted by a `border` on the side facing their neighbour, no radius or
  shadow; a `Panel` or trigger inside adds no surface. Radius, shadow and `bg-card/90` +
  `backdrop-blur` belong to popups and to what floats on the drawing.

## Type

One body, as AutoCAD's Segoe UI at 9 pt: hierarchy is weight and colour, never size. The roles are
tokens in `globals.css` (`@theme`), each one class carrying size, weight and line height; `body`
starts every text — portalled popups too — as `text-ui text-foreground`.

| Role  | Classes                            | Size / weight / line | For                                                                                     |
| ----- | ---------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| value | `text-ui` (inherited)              | 12 / 400 / 16        | values, menu items, list options, buttons, tabs, tooltips                               |
| label | `text-ui text-muted-foreground`    | 12 / 400 / 16        | what names a value: field and row labels, column headers, help, the save state          |
| title | `text-title text-muted-foreground` | 12 / 600 / 16        | a section of a palette or popover, a menu's heading                                     |
| typed | `font-mono` on `text-ui`           | 12 / 400 / 16        | what is typed or read as a figure: command line, dynamic input, coordinates, aliases, keys |

- **Nothing under 12 px.** A new size is a new role, argued here, never a `text-xs` or `text-[Npx]`.
- **Three steps of colour**: `text-foreground`, `text-muted-foreground`, `text-faint-foreground`
  (disabled, placeholders, a layer that is off). Never a fraction (`text-muted-foreground/70`):
  each step keeps AA (4.5) on `card`, `background`, `accent`, the canvas and the active tint. State
  colours: `text-active-foreground`, `text-destructive`, `text-primary` for a check mark.
- **Monospace only for what is typed or read as a figure.** Labels stay sans, or an Arabic page
  draws them in Geist Mono's 0.6 em spaces with Readex Pro behind. No capitals or tracking for
  titles: sentence case.
- **Arabic** (`:lang(ar)`, `globals.css`; this file owns it for the landing too): both roles take
  a 20 px line — Readex Pro reaches 14 px above the baseline and 6 below at 12 px, and a 16 px line
  clips it wherever a text truncates. The command language's islands carry `lang="en"` and keep
  16. Select by attributes, never `:dir()`: Lightning CSS lowers it to `:lang()` lists that match
  inside the islands too.
- **Rhythm**: rows of palettes, menus and lists are 28 px (`h-7`; a menu item's `py-1.5`). Text
  starts 12 px from its surface's edge: `px-3` in a palette, `p-3` in a popover, `p-1` + `ps-2` in a
  menu.
- `lib/type-scale.test.ts` fails on a size, weight, line height or tracking utility, or a text
  colour with an opacity, in `components/cad` or `components/ui`; `cn()` knows the roles as font
  sizes, so `cn("text-ui", "text-muted-foreground")` keeps both. The ViewCube's SVG sets its weight
  as an attribute (a class would size it too); its face names, sized to the face, are the one text
  outside the scale.
- A new zone, palette or menu is checked in Chrome (`getComputedStyle` on every visible text):
  every text on a role and a colour step, nothing truncated or wrapped at 1280×720 in any language.

## Size

One size for everything one presses: **28 px**, with 16 px icons (WCAG 2.2's 2.5.8 asks 24; at 32
the tool palette would fold on a Full HD laptop at 125 %).

| What                                                                       | Size                                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| An icon button (`Button size="icon"`, `IconAction`)                        | 28 × 28, its icon 16                                                                    |
| A text button, a drop-down's trigger, a field, a tab, a row of a list      | 28 high (`Button`'s default, `SelectTrigger`, `h-7`)                                    |
| A mode's settings arrow (`size="icon-flyout"`), Zoom's under its button    | 14 × 28, 28 × 14 — attached, so the 28 px mode is the equivalent target (2.5.8's exception) |
| A docked bar: the top bar, the status bar, the command line, the tab bar   | 36 (`h-9`): the control and 4 px either side; the folded panel is 36 wide                |
| The tool palette                                                           | two columns of 28, 2 px apart: a grid of 58 (`w-14.5`) inside `p-1`                       |

- **A zone sizes its content** (`box-content`): its border lies outside those numbers. A border
  inside the box eats a pixel, every control lands on a half pixel and its icon blurs.
- **In a bar every part has a whole width**: a text part (the palette toggles `w-24`, the save
  state's slot `w-24`, there before the first save, Units `w-9`) gets a fixed one, or its fraction
  of a pixel pushes every icon after it off the pixel grid.
- Outside the system, each for a reason: the ViewCube's Home, roll arrows and UCS menu
  (`size="icon-cube"`, `"cube"`, 24), drawn at the cube's scale; the viewport control `[Top]`, a
  label on the drawing; separators, the product mark and swatches, which are not targets.
- `lib/control-size.test.ts` fails on a height or square size off the system in `components/cad` or
  `components/ui` outside its justified exceptions, and on a `Button` size the table lacks. A new
  size is argued here first.

## Base UI gotchas

- `z-50` goes on the **`Positioner`**, not the `Popup`: the positioner is transformed, so it makes a
  stacking context that traps a z-index set inside it.
- A `Portal` takes `container={usePortalContainer()}` (ESLint): Base UI's default, `<body>`, is
  outside the editor's root, so its tokens, `dir` and `lang` miss the popup.
- Radix's asChild is the `render` prop (`<Tooltip.Trigger render={<Button …/>} />`).
- `Select.Root` needs `items` (a value→label record) for the closed trigger to show the label, not
  the raw value. `onValueChange` can deliver `null`: guard before committing. A drop-down in a bar
  passes `below` (the CAD selects' prop: `alignItemWithTrigger` off), or its list covers its
  trigger.
- Never a Tooltip and a Popover on the same trigger: the popover stops opening.
- `Menu.RadioItem` and `Menu.CheckboxItem` default to `closeOnClick={false}` (`Menu.Item` to
  `true`): a pick that ends the choice passes `closeOnClick` (Polar's angles, the palette's
  flyouts); a checklist leaves it (the object snaps, Customization).
- `Dialog.Popup` sets no `aria-modal`: a modal dialog sets `aria-modal="true"` itself — the engine
  reads it to leave the dialog its keys. While it is open the rest of the page is inert, so a test
  reaches the command line by a CSS selector, not by its role.
- **A menu the engine opens has no trigger**: `ShortcutMenu` is a controlled `Menu.Root` anchored
  to the pointer. Base UI names a trigger-less menu's node in its floating tree itself, so a
  submenu does not close it as a sibling (`sibling-open`).
- **A modal menu leaves the page inert until it has closed**, so a `focusSurface()` run as an item
  acts is lost and Base UI returns focus to the trigger. Give focus back in the popup's
  `finalFocus` (`() => { engine.focusSurface(); return false }`). A dialog: `finalFocus={false}` and
  `focusSurface` on `onOpenChangeComplete`.
- `Panel` (`toolbar-primitives.tsx`) does **not** forward props: `<PopoverTrigger render={<Panel>…} />`
  drops the click handler and the popover silently never opens. Render the `Button` as the trigger
  and wrap the whole `Popover` in the `Panel`.

## Where a control belongs

Each bar's AutoCAD order is in its component's header comment; touch and phones are out of scope.

- **The workspace is a grid of named areas** (`CadWorkspace`): `top`, `tools` · `canvas` · `panel`,
  `command`, `status`. A control goes into a zone, never absolutely over the drawing; the canvas
  takes what is left, so ZOOM Extents frames only what is visible.
- **Every zone has its size in CSS before the engine mounts** (the bars' `h-9`, the palette's
  `w-14.5`, the panel's `w-9` / `palette-open:w-(--palette-width)`, the `short:` variant), never
  from its content: the canvas's first box is its final one, which the landing's view transition
  grows into and the first view is centred in. A zone that resizes with the work makes the drawing
  jump. A size this device remembers is decided by the `<head>` script on `<html>` (`data-palette`,
  `--palette-width`) and handed to the engine at build (`useCadEngine({ paletteOpen })`) — never
  after mount. Clean Screen is never on at the first paint (AutoCAD does not save it).
- **The canvas cell** alone carries the host's `sheet` (`SHEET_TRANSITION`) and holds what is
  placed in the canvas's pixels (the dynamic input, at `state.dynamicInput.screen`). A popup
  anchored there is portalled and placed in the viewport, so its virtual anchor converts with
  `engine.clientFromScreen`; the raw state point lands off by the zones before the canvas.
- **On the drawing only what AutoCAD puts there**: the viewport controls, the ViewCube with the
  navigation bar, the dynamic input, the rollover tooltip, the menus at the cursor. A new control finds its zone. What
  sits there takes the pointer only where it is drawn: the ViewCube's column and SVG box are
  `pointer-events-none` and only its buttons, zones, compass and triangles set
  `pointer-events-auto` — ZOOM Extents frames up to 3 px from the edge, so a grip can land under
  the cube's box and must stay pickable.
- **After acting in a palette or bar, focus returns to the drawing** (`engine.focusSurface()`) — a
  tab, a strip icon, a toggle, a pick in a drop-down — so the next key types a command. Arrow keys
  on tabs keep focus there (`event.detail > 0` tells a click).
- **Buttons run commands by global name** (`engine.runCommand("_QSAVE")`), as AutoCAD's macros
  do, so they echo at the prompt; a `'` macro through an engine method that runs it so
  (`openDrawingUnits`, `navigate`). A tool's button is `engine.setActiveTool(id)`, echoing `_line`,
  repeated by Enter, a menu group U names `LINE GROUP` (`cad-runtime.md`); a menu's own path is an
  engine method of its own (`openDrawingUnitsFromMenu`, `choosePolarAngle`).
- **The tool palette** holds only commands that act on the drawing, grouped by meaning, never to
  save room (no "more" menu). Unlisted tools fall into a trailing group, so a tool that belongs
  elsewhere in the chrome (view tools, Select, Match Properties) must be listed in `RAIL_EXCLUDED`.
  A new slot keeps the palette inside its zone at 720 px of window and, folded (`short:`), at 650.
- **The dynamic input** is `pointer-events-none` and keyboard-driven — never clickable. A
  `paragraphs` field (MTEXT) is a textarea: Enter is a line break, Ctrl+Enter commits, and it is
  never reselected when focus comes back. Nor is a value field with text in it: keys typed on the
  drawing before the box had focus went into it. A value field takes Space as Enter (a space after a
  name or string the question says `takesSpaces`, as the command line does), Tab after a
  point's X as its comma, and Ctrl+Z with nothing typed as `_u` at the prompt (`runUndoMacro`) —
  the drawing's keys, which never reach the runtime from a field. Its keys go first to
  `engine.dynamicOptionKey` (the Down arrow's option list, the chips marked from
  `state.commandOptionList`), which the drawing's `keyDown` asks too. It reclaims focus only where
  `engine.mayTakeFocus` allows (not while another field is being typed in). The command line's
  Space is Enter whatever is typed, but after a name that holds spaces (`takesSpaces`,
  workspace/d06).
- **A dialog** only where AutoCAD has one (UNITS): engine state, opened by the command, applied as
  one undo step through the engine. No command palette (Ctrl+K): the command line is that. No
  product or meta copy in the editor: that is the landing's.

## Palettes that show drawing content

A palette is a **tab of the palette panel**, never a popover: AutoCAD's palettes are modeless, and
a popover closes on the first click on the drawing. Which tab shows, and the Styles table
(`state.stylesTable`), are `EngineState`, never `useState` — or typing `DIMSTYLE` cannot open it. A
new palette is a `PaletteTab` (`PALETTE_TABS`), a command that calls `showPalette`, a branch in
`PalettePanel` and, if the top bar has its trigger, a `PaletteToggle`.

Anything that **draws drawing content** (a block thumbnail) asks the engine for a `Scene`
(`engine.buildBlockPreview(...)`) and paints it with `CanvasScenePresenter`. Never walk entities in
a component: a preview built a second way can disagree with the drawing.

A popover that remains (a status-bar menu) closes on a click on the canvas, and the canvas handler
runs _before_ the dismiss — a guard on "is the command still running?" already reads false. What
must stay up while one draws belongs in the panel.

## Icons

Custom CAD glyphs go in `components/cad/icons.tsx` via `createLucideIcon`, on lucide's metrics: 24
viewBox, rings at `r=10`, `stroke-width` 2. Point beads need `fill: "currentColor"` and
`stroke: "none"`, or the inherited stroke pushes them past the viewBox and they clip. Prefer a real
lucide icon: a hand-rolled shape smaller than the viewBox aliases badly at 16 px.
