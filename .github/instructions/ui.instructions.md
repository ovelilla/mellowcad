---
applyTo: "components/cad/**,components/ui/**,components/theme-provider.tsx,app/(app)/**,hooks/**"
description: "React/UI conventions for the CAD editor shell (/draw): file layout, theming tokens, Base UI gotchas, icons and where each control belongs. The landing has its own rules in marketing.instructions.md."
---

# UI layer

React is a **dumb presentation shell**. Components read `EngineState` and call `CadEngine`
methods; they never contain CAD logic, geometry or drawing decisions. Import from `@/cad` only.

That holds for browser capabilities too: **no `Blob`, file picker, download anchor or global
keyboard listener in a component.** If a button needs one, the engine owes it a method (behind a
port, implemented in `cad/adapters/`) — otherwise the behaviour lives in the app rather than in
the package, and every consumer has to rewrite it. A component may keep purely visual state.
Failures are reported at the command prompt, not in a bespoke React banner.

## File layout

- `components/cad/` is kebab-case, one primary component per file, and the **file name matches
  the component it exports** (`layers-control.tsx` → `LayersControl`).
- Small satellites of that component (rows, fields, local helpers) stay in the same file,
  shadcn-collection style.
- Shared rail/bar atoms live in `toolbar-primitives.tsx`; custom glyphs in `icons.tsx`.

## Theming — always check light _and_ dark

Tokens flip between themes, so a colour that reads well in dark can be unusable in light.

- `--primary` is near-black in light and near-white in dark → `bg-primary/N` and
  `var(--primary)` are **not** theme-safe for highlights or bars.
- Use `bg-accent` for a selected/current row (that is the token designed for it), and
  `text-primary` for check marks (visible in both).
- Panels are `bg-card/90` + `backdrop-blur` (8px). Keep popovers at the same blur so surfaces match.
- To force a theme in the browser: set `localStorage.theme` and toggle the `dark` class on `<html>`.

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

- **CommandBar** (top) — file, view and palette visibility (AutoCAD's ribbon View → Palettes).
- **DrawingAids** (status bar) — drafting modes only: Snap, Grid, Ortho, Polar, Osnap, OTRACK,
  lineweight display.
- **ToolRail** (left) — tools, grouped by `RAIL_LAYOUT`. Variant families (Circle, Arc, Array,
  Fillet/Chamfer, Rectangle/Polygon, Break) are flyouts; icon-only with `side="right"` tooltips.
  Unlisted tools fall into a trailing "More" group, so a tool that belongs elsewhere in the chrome
  (the view tools, which live in the CommandBar) must be listed in `RAIL_EXCLUDED`.
- **AboutPanel** (bottom-right) — the only non-CAD chrome: what the app is, that drawings never
  leave the browser, a three-key quick start and the contact address. Product/meta copy goes here,
  not into a drafting surface.
- The dynamic-input box is `pointer-events-none` and keyboard-driven — never make it clickable.

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
