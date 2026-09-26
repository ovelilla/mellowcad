---
applyTo: "app/(marketing)/**,app/global-not-found.tsx,app/opengraph-image.tsx,app/robots.ts,app/sitemap.ts,app/manifest.ts,components/marketing/**,content/**,messages/**,i18n/**,lib/site.ts,lib/plot.ts,lib/facts.ts,lib/og.tsx,lib/metadata.ts,lib/structured-data.ts,lib/brand.ts,lib/changelog.ts,lib/view-transition.ts,CHANGELOG.md"
description: "The landing at / (marketing root layout): static rendering, engine-drawn figures, islands, the live sketch, the view transition into the editor, the changelog, copy in next-intl, tokens, budgets, claims policy and trademark rules."
---

# Landing (`/`)

The landing and the editor are two **root layouts** in one project. `app/(marketing)/layout.tsx`
owns `<html class="dark">`, `marketing.css`, the header and footer and the metadata base;
`app/(app)/layout.tsx` owns the editor, next-themes and `globals.css`. Crossing between them is a
full page load — which is why a link to the editor is a plain `<a href={EDITOR_PATH}>`, never
`next/link`: its router prefetch would pull the editor's payload into the landing (only the
document is prefetched, on intent — see "Into the editor"). Links _within_ the landing use `Link`.

## Rendering

- **Every page is static** (`○` in the build output — check it). Nothing here reads `cookies()`,
  `headers()`, `searchParams` or next-intl's `requestLocale`; one such call silently turns the page
  dynamic. `i18n/request.ts` returns the fixed locale for the same reason. A route handler serving
  build-time data (`sketches/hero.json`) exports `dynamic = "force-static"` — without Cache
  Components that is still how a `GET` is prerendered.
- **Server Components by default.** A client island exists only where there is browser state — the
  autosave to continue (`ContinueDrawing`), the pause button (`HeroControls`), the live sketch
  (`LiveSheet`), the autocomplete (`CommandTry`), the share sheet (`SendToDesktop`), a URL only the
  browser knows (`UnknownCommand`). It receives its copy as props — never wrap the tree in
  `NextIntlClientProvider`.
- **An island imports nothing heavy.** `@/cad` is safe _only_ because `package.json` declares the
  code side-effect free (see `cad-engine.instructions.md`); `cn()` is not — it ships
  `tailwind-merge`. Budget: ≤ 15 KB gz of our own JS on `/` (5.6 KB today). Measure after touching
  one: `npm run build`, then gzip the chunks the prerendered `.next/server/app/index.html`
  references (skip the `noModule` one — modern browsers never fetch it).
- **The engine is never in the first load.** `live-canvas.tsx` is reached only through a dynamic
  `import()` in `LiveSheet` (a `type` import is fine): one static import pulls the whole engine,
  84 KB gz, into `/`. Check that `.next/server/app/index.html` names no chunk containing
  `CadRuntime`'s strings. The chunk is shared with `/draw`, so trying the sketch also warms the
  editor.
- The 404 is `app/global-not-found.tsx` (flag `experimental.globalNotFound`): with two root
  layouts there is no common layout to compose `not-found` from. It imports `marketing.css` and
  sets `class="dark"` itself, because it bypasses every layout.
- A build-time `fs` read (`lib/facts.ts`) takes `/*turbopackIgnore: true*/`, or Turbopack traces the
  whole repository into the server output.

## Figures: the engine draws every illustration

- A figure is a **`DemoScript`** in `content/demos/` (the harness's chained style: `command`, `type`,
  `enter`, `click`, `option`, plus `hover`, `down`/`up`, `press`, `osnap`, `layer`), registered in
  `content/figures.ts`, rendered at build time by `lib/plot.ts` through `SvgScenePresenter`. Never
  hand-draw an SVG of drawing content, never a screenshot.
- **Still or live.** A still frames the finished drawing (`buildDrawingPreview`); a `live` figure is
  the editor's own last frame — cursor, snap marker, tooltip, tracking paths, selection box — for
  figures that are _about_ an aid. End a live script mid-gesture (a `moveTo`, a `down` without `up`).
- **Frame by hand when a dimension is involved**: a drawing's extents know a dimension's definition
  points, not how far its text runs, so a still with dimensions sets `frame`.
- Scripts are real input and meet real behaviour: a point after the first is **relative** under
  dynamic input (DYNPICOORDS), so write `@` explicitly or `#` for absolute; the ANSI31 pattern needs
  HPSCALE in a millimetre drawing; OTRACK acquires by dwelling, so use `hover`, which waits for the
  engine's timer.
- `content/figures.test.ts` replays every figure (no error lines, something drawn) and holds the
  hero to 8–12 s and ≤ 600 primitives. A command that breaks fails here, not on the page.
- The hero plots with CSS only: each element carries `--t` / `--d`, solid strokes have
  `pathLength="1"`, dashed ones and text fade. The transcript is `transcript(recording)`, timed by
  `plotDemo` — **the prompts are the engine's, never typed into the copy**. Keep animation selectors
  scoped (`.plot svg …`): a bare `[style*="--t"]` also caught the command-line rows.
- Drawing colours are `var(--cad-*)`, written from `THEME` into the layout's `<style>` by
  `themeCustomProperties()`. The OG image cannot read CSS variables, so `lib/og.tsx` renders with
  literal colours and lays the dimension text over the drawing itself (the rasteriser has no fonts
  for SVG text).
- CAD glyphs outside a figure — endpoint markers on hover, dimension arrowheads in the separators —
  are taken from engine frames too (`snapGlyph`, `arrowheadGlyph`). A snap marker is feedback: shown
  on hover or focus only, never as decoration.

## The live sketch (`LiveSheet` → `LiveCanvas`)

- On a computer (`pointer-fine:lg:`), "Try it here" makes the hero's sheet live. The still figure
  stays in the flow, invisible and `inert`, holding the sheet's size; the canvas lies over it and
  frames the figure's own `frame` with its padding scaled (`engine.zoomToBounds`), so nothing
  moves as it wakes. A hover or focus on the button fetches the chunk and the drawing ahead of the
  click.
- It is the real engine, embedded: `useCadEngine({ store, scopeRef })`. **The store is
  `createMemoryDrawingStore()`, never the device's** — the sketch must not write over the drawing
  the user keeps in the editor. It lives as long as the page, so a closed sketch reopens as left.
  The scope gives it the keyboard and the wheel only while in use (`cad-runtime.instructions.md`).
- It opens on `/sketches/hero.json`: the hero's replay as a drawing file, layer 0 current.
  `content/figures.test.ts` loads it.
- Behaviour comes from the editor, not from copies: the dynamic-input box _is_
  `components/cad/dynamic-input.tsx`, which `marketing.css` scans and whose shadcn tokens it maps
  inside `.live-sketch`. Another editor component brought in needs both. The docked command line
  only reads `state.commandLine`.
- What does not fit on the sheet is left to the full editor, never faked: the Shift+right-click
  menu is closed if it opens (unseen, it would take the next Escape) and Selection cycling keeps
  the badge without its list box. A new omission goes in `docs/autocad-coverage.md`.
- No keyboard trap: Esc cancels as in AutoCAD and never closes the sketch; Tab and Shift+Tab leave
  it; "Close" is always in view and hands focus back to "Try it here". The canvas is
  `role="application"`, the command line a `role="log"`.
- **"Open in the full editor" never overwrites unasked.** A blank device autosave
  (`isBlankDrawing`, the rule the editor restores by) is replaced and the editor opens. Otherwise
  a native modal `<dialog>` — outside the scope, so its keys stay its own — offers "Download the
  sketch" (first, so focused: it loses nothing), "Replace my drawing" and "Cancel". If storage
  refuses the write, the sketch is downloaded rather than lost.

## Into the editor

- A cross-document view transition: the hero's sheet grows into the editor's canvas, both named
  `SHEET_TRANSITION`. The opt-in is **inline** in both root layouts' `<head>`
  (`VIEW_TRANSITION_OPT_IN`): in a stylesheet it raced the new page's first style pass and Chrome
  skipped about one transition in five ("ViewTransition opt-in disabled"). The group's timing
  stays in both stylesheets, under `prefers-reduced-motion: no-preference`.
- The sheet is named only in `pageswap` (towards `/draw`) and `pagereveal` (back out of the
  bfcache), and only while on screen: the spec makes a named element a stacking context at all
  times, and an off-screen one would fly in. The editor's canvas is named in its own markup.
- `SpeculationRules` in the layout prefetches `/draw` on hover or press — the document only.
  Never `prerender`: it would run the editor, and count a visit, for every hover.

## Changelog

`/changelog` is `CHANGELOG.md` (Keep a Changelog 1.1.0) read by `lib/changelog.ts`; `[Unreleased]`
is not shown, and a heading it cannot read fails the build. `content/changelog.test.ts` requires
the newest release to be `package.json`'s version, so a release bumps both. Entries follow the
claims policy: what people can now do, and no count the code should supply.

## Facts and copy

- **Every number about the product comes from `lib/facts.ts`**, which reads the engine at build time
  (`commandCatalog()`, `SnapType`, `LINEWEIGHTS`, the test files). Never type one into the copy.
- `content/commands.ts` files each registered command under a ribbon group and marks the ribbon
  options this app names as commands of its own (`variant`) — those are neither shown nor counted as
  AutoCAD commands. `content/commands.test.ts` fails when a command is registered but not filed.
- **No literals in components.** Every visible string is in `messages/en.json`, grouped by section,
  read with `getTranslations()`, keyed by type from the JSON (`i18n/global.d.ts`). A string with a
  placeholder the server cannot fill is read with `t.raw()`; a link inside a sentence is a rich tag.
- Split a headline by sentence with `Intl.Segmenter`, never on a hard-coded full stop.
- Tone: calm and precise, with AutoCAD's dry humour. Short sentences. No hype words, no emojis, no
  shouting capitals in the sans.

## Claims (not negotiable)

- Never claim DWG/DXF, printing or PDF, 3D, collaboration, cloud sync, mobile use or an installable
  offline mode until they exist. "Free" yes; "open source" no, and no GitHub link. Never name the
  file extension — it is "MellowCAD's own versioned format".
- Say only what the engine does: its prompts follow AutoCAD's order and keywords, not its wording,
  so a caption says "same order, same option letters", not "same prompts".
- "AutoCAD" only nominatively ("works like AutoCAD", "AutoCAD commands"), with the trademark
  disclaimer in the footer. No Autodesk logos, colours or screenshots.

## Metadata and SEO

- Pages build their metadata with `pageMetadata()` (`lib/metadata.ts`): Next merges `openGraph` and
  `twitter` shallowly, so a page that sets either must set all of it.
- The share image is `app/opengraph-image.tsx`, referenced by path (`OG_IMAGE_PATH`): at the app root
  it is served but not inherited by route groups, and inside a group its URL gets a hash that
  structured data cannot cite. `/draw` keeps its own in `app/(app)/draw/`.
- Structured data is one `@graph` (`lib/structured-data.ts`), typed with `schema-dts`, rendered by
  `JsonLd` with `<` escaped. The replacement is `"\\u003c"` in source: with a single backslash the
  string _is_ `<`, and the escape silently does nothing (it shipped that way once). No invented
  ratings, ever.
- `robots.ts` allows everything, `/draw` included (it must be fetchable for its `noindex` to be
  read). `sitemap.ts` lists indexable pages only, with `CONTENT_UPDATED` — bump it with the copy —
  and `/changelog` with its newest release's date.
- Search Console / Bing tokens come from `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`.
- Icons are generated from `lib/brand.ts` by `node scripts/icons/generate.ts`; the mark and the logo
  component share that geometry.

## Styling

- `marketing.css` is its own Tailwind entry with `source(none)` and explicit `@source` paths; the
  editor's `globals.css` excludes these folders in turn. A new marketing folder must be added to
  both. The one editor file the live sketch embeds (`dynamic-input.tsx`) is scanned too.
- **Tokens only**: `bg-bg`, `bg-bg-raised`, `bg-bg-sunken`, `border-border`, `text-fg`,
  `text-fg-muted`, `text-fg-subtle`, `bg-accent` / `text-accent-ink`, `text-precision`, and
  `var(--cad-*)` inside drawings. No loose hex in a component (`lib/brand.ts` holds the few that must
  be literal, for icons and the OG image). `--text-subtle` is the dimmest text allowed (≈ 5:1).
- Tokens have the editor's `:root` / `.dark` shape but only dark values exist until the editor has
  a light canvas. The theme and language selectors are built but inert (`aria-disabled`, focusable,
  with a tooltip saying why).
- One accent per view: amber is the call to action and the focus ring; cyan is reserved for
  precision (snap markers, measurements) and is never a link colour.
- Use `text-wrap-style`, not the `text-wrap` shorthand, in base styles: the shorthand also resets the
  wrap mode and undoes an inherited `white-space: nowrap`.
- Grid items holding unbreakable content (the command line, transcripts) need `min-w-0`, or they
  widen the column past a phone's viewport.
- Motion is CSS only, inside `prefers-reduced-motion: no-preference`; with reduced motion everything
  is in its final state. Anything that moves for more than five seconds can be paused.
- Inter ships without its `opsz` axis: the Display cut cost ~25 KB the first-load budget (≤ 250 KB,
  Brotli) could not spare beside the framework runtime; headlines are tracked tighter instead.

## Files

Same conventions as `components/cad/`: kebab-case, one primary component per file, file name
matching the export.
