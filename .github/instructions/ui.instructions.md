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
Failures are reported at the command prompt, not in a bespoke React banner.

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
  positioning. The rest of RTL is the brief's phase 4. See `i18n.instructions.md`.

## File layout

- `components/cad/` is kebab-case, one primary component per file, and the **file name matches
  the component it exports** (`layers-control.tsx` → `LayersControl`).
- Small satellites of that component (rows, fields, local helpers) stay in the same file,
  shadcn-collection style.
- Shared rail/bar atoms live in `toolbar-primitives.tsx`; custom glyphs in `icons.tsx`.

## Colour — one scheme, dark

There is no theme switch, by decision (brief D12): AutoCAD works dark, and so does the whole site.
The tokens in `:root` are the only values, `color-scheme: dark` keeps native controls dark, and
`@custom-variant dark (&)` makes every `dark:` utility — shadcn's included — always apply, so a
component added with the shadcn CLI renders as designed. Don't bring back next-themes, a `.dark`
class or light values.

- `--primary` is near-white, so `bg-primary/N` is glare, not a highlight. Use `bg-accent` for a
  selected/current row (the token designed for it) and `text-primary` for check marks.
- Panels are `bg-card/90` + `backdrop-blur` (8px). Keep popovers at the same blur so surfaces match.

## Base UI gotchas

- Put `z-50` on the **`Positioner`**, not the `Popup`. The positioner is transformed, so it
  creates a stacking context that traps a z-index set inside it.
- `asChild` composition is the `render` prop (`<Tooltip.Trigger render={<Button …/>} />`).
- `Select.Root` needs the `items` prop (a value→label record) for the closed trigger to show the
  label instead of the raw value.
- `onValueChange` can deliver `null` — guard before committing.
- Do not nest a Tooltip and a Popover on the same trigger; the popover stops opening.
- `Panel` (from `toolbar-primitives.tsx`) does **not** forward props, so
  `<PopoverTrigger render={<Panel>…} />` drops the click handler and the popover never opens —
  silently. Render the `Button` as the trigger and wrap the whole `Popover` in the `Panel`.

## Where a control belongs

- **CommandBar** (top) — file, view and palette visibility (AutoCAD's ribbon View → Palettes):
  the view menu (the viewport controls' `[Top]`: `VIEW_MENU`, labelled by `state.view.preset`, run
  through `engine.applyViewPreset`) and Orbit beside Zoom window and Pan.
- **ViewCube** (top right, NAVVCUBELOCATION 0) — `view-cube.tsx` draws `state.viewCube` in SVG
  (the engine's 0–1 box), with Home above, the compass round it and the UCS menu below; its
  right-click menu and the UCS menu are Base UI menus. It keeps only the hovered zone and the
  press it is reading as click or drag; every view, outline and label position comes from the
  engine, and so do its words (`state.names.viewCubeFaces`, `compass`); its menus' are
  `Editor.ViewCube`. The Properties palette sits under it in the same column, its height capped for it.
- **DrawingAids** (status bar) — drafting modes only: Snap, Grid, Ortho, Polar, Osnap, OTRACK,
  lineweight display.
- **ToolRail** (left) — tools, grouped by `RAIL_LAYOUT`. Variant families (Circle, Arc, Array,
  Fillet/Chamfer, Rectangle/Polygon, Break, the attribute commands) are flyouts, named by `Editor.ToolRail.flyouts`;
  icon-only with `side="right"` tooltips. Unlisted tools fall into a trailing "more" group, so a tool that belongs elsewhere in the chrome
  (the view tools, which live in the CommandBar) must be listed in `RAIL_EXCLUDED`.
- **AboutPanel** (bottom-right) — the only non-CAD chrome: what the app is, that drawings never
  leave the browser, a three-key quick start and the contact address. Product/meta copy goes here,
  not into a drafting surface.
- The dynamic-input box is `pointer-events-none` and keyboard-driven — never make it clickable.
  A `paragraphs` field (MTEXT's editor) is a textarea: Enter stays a line break, Ctrl+Enter
  commits, and it is never reselected when focus comes back, or the next key would wipe the text.
- It is also the landing's: the live sketch embeds this very component, and `marketing.css` scans
  the file and maps the tokens it uses (`card`, `foreground`, `muted`, `muted-foreground`,
  `border`). A new token in it needs that mapping too. It reclaims focus only where
  `engine.mayTakeFocus` allows, which for the editor is anywhere. `useCadEngine(options)` passes an
  embed's store and scope through; the editor passes none.

## Palettes that show drawing content

A palette a command can open (the style managers, the Blocks palette) is a **controlled** popover
driven by `EngineState`, never by local `useState` — otherwise typing `DIMSTYLE` cannot open it.
Its trigger sits with the others along the top-left.

Anything that has to **draw drawing content** — a block thumbnail, a future layout preview — asks
the engine for a `Scene` (`engine.buildBlockPreview(...)`) and paints it with
`CanvasScenePresenter`. Never walk entities and draw them in a component: a preview built a second
way is a preview that can disagree with the drawing.

Placing a point on the canvas dismisses an open popover, and the canvas handler runs _before_ the
dismiss — so a guard on "is the command still running?" already reads false. Don't fight it; note
it where AutoCAD's own answer is a separate feature (the palette's Repeat Placement option).

## Icons

Custom CAD glyphs go in `components/cad/icons.tsx` via `createLucideIcon`, matching lucide's
metrics: 24 viewBox, rings at `r=10`, `stroke-width` 2. Point beads need `fill: "currentColor"`
and `stroke: "none"`, otherwise the inherited stroke pushes them past the viewBox and they clip.
Prefer a real lucide icon when one fits — a hand-rolled shape smaller than the viewBox aliases
badly at 16px.
