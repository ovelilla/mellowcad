---
applyTo: "app/[locale]/(marketing)/**,app/[locale]/og/**,app/[locale]/manifest.webmanifest/**,app/global-not-found.tsx,app/robots.ts,app/sitemap.ts,components/marketing/**,content/**,messages/**,i18n/**,lib/site.ts,lib/plot.ts,lib/plural.ts,lib/facts.ts,lib/og.tsx,lib/metadata.ts,lib/structured-data.ts,lib/brand.ts,lib/view-transition.ts"
description: "The landing at / (marketing root layout): static rendering, engine-drawn figures, islands, the view transition into the editor, the privacy notice, copy in next-intl, tokens, budgets, claims policy and trademark rules."
---

# Landing (`/`)

The landing and the editor are two **root layouts** in one project, both under the `[locale]` root
param. `app/[locale]/(marketing)/layout.tsx` owns `<html>`, `marketing.css`, the header and footer
and the metadata base; `app/[locale]/(app)/layout.tsx` owns the editor and `globals.css`. Crossing
between them is a full page load — which is why a link to the editor is a plain
`<a href={paths.editor}>`, never `next/link`: its router prefetch would pull the editor's payload
into the landing (only the document is prefetched, on intent — see "Into the editor"). Links
_within_ the landing use `Link`. Every href is the page's language's, from `sitePaths()` or
`localePath()` (`i18n.instructions.md`); a client island gets it as a prop.

**The site is the landing.** Besides it there is the 404 and one support page, `/privacy` — no
changelog, command hub, cheat sheet or comparison pages. That was weighed and decided: they would not improve the landing, only bet on slow organic search, and a changelog would have
to reconstruct a history that was never released as versions. Do not propose a new page without
Search Console data behind it.

**`/privacy` is the notice GDPR requires** (Article 13), not decoration: the host and both Vercel
measurements process personal data, if briefly (the IP address, a visitor hash kept 24 hours), and so
does the contact address. It states what is kept and measured, who handles it and on what grounds,
where it goes and the visitor's rights, and it names the person responsible (`DATA_CONTROLLER`) —
the one place the site names anyone; everything else is signed MellowCAD. Anything that starts
handling personal data — another analytics tool, a form, an embed, a font or script from a third
party — updates it in the same change.

## Rendering

- **Every page is prerendered** (`○`, or `●` for each language of a `[locale]` route, in the build
  output — check it; never `ƒ`, and no middleware). Nothing here reads `cookies()`, `headers()`,
  `searchParams` or next-intl's `requestLocale`; one such call silently turns the page dynamic. The
  locale comes from the root param (`next/root-params`). A route handler serving build-time data
  (the OG images, the manifests) exports `dynamic = "force-static"` — without
  Cache Components that is still how a `GET` is prerendered.
- **Server Components by default.** A client island exists only where there is browser state — the
  autosave to continue (`ContinueDrawing`), the pause button (`HeroControls`), the sheet's name
  for the trip into the editor (`TransitionSheet`), the autocomplete (`CommandTry`), the share sheet
  (`SendToDesktop`), a URL only the browser knows (`UnknownCommand`). It receives its copy as props — never wrap the tree in
  `NextIntlClientProvider`. A count it formats itself arrives as a `pluralMessage()`.
- **An island imports nothing heavy.** `@/cad` is safe _only_ because `package.json` declares the
  code side-effect free (see `cad-engine.instructions.md`); `cn()` is not — it ships
  `tailwind-merge`, and `next-intl/navigation` ships next-intl's client runtime. Budget: ≤ 15 KB gz
  of our own JS on `/` (the islands' 4.7 KB, plus `UnknownCommand`'s 0.5 KB, which the language's
  404 boundary brings into the layout). Measure after touching one: a production build, then gzip
  the chunks the prerendered `.next/server/app/en.html` references (skip the `noModule`
  one — modern browsers never fetch it).
- **The engine never runs on the landing.** An island takes from `@/cad` only small pure helpers
  and types; anything reaching `CadEngine` pulls the whole engine, 88 KB gz, into `/`. Check that
  `.next/server/app/en.html` names no chunk containing `CadRuntime`'s strings. Whoever wants to
  draw goes to the editor: a live, editable sketch in the hero was built and then removed — it
  added weight and complexity and did nothing the real editor, one click away, does not. Do not
  bring it back.
- The 404 of a language is `(marketing)/not-found.tsx`, inside the layout, reached through a
  prerendered `404/page.tsx` and a `fallback` rewrite (`i18n.instructions.md`). Its body arrives
  drawn in the browser, not in the HTML — Next 16.3's way with a page's `notFound()`.
  `app/global-not-found.tsx` (flag `experimental.globalNotFound`) remains for what never reaches a
  language; it imports `marketing.css` itself, because it bypasses every layout. Both render
  `NotFoundMessage`.
- A build-time `fs` read (`lib/facts.ts`) takes `/*turbopackIgnore: true*/`, or Turbopack traces the
  whole repository into the server output.

## Figures: the engine draws every illustration

- Every figure is drawn in the page's language (`pageEngineLocale()`); the two diagrams carry the
  page's words as TEXT, from messages (`DIAGRAMS`, `i18n.instructions.md`).
- A figure is a **`DemoScript`** in `content/demos/` (the harness's chained style: `command` with a
  global name and `_`, `type`,
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
  `plotDemo` — **the prompts are the engine's, never typed into the copy**, and so are `Command:` and
  `Unknown command` (`engineText(locale)`); a prompt is drawn from its `segments`, never taken apart.
  `option(id)` names a keyword by its global id (`"Properties"`) and the transcript shows what its
  user types (`P`). Keep animation selectors
  scoped (`.plot svg …`): a bare `[style*="--t"]` also caught the command-line rows.
- Drawing colours are `var(--cad-*)`, written from `THEME` into the layout's `<style>` by
  `themeCustomProperties()`. The OG image cannot read CSS variables, so `lib/og.tsx` renders with
  literal colours and lays the dimension text over the drawing itself (the rasteriser has no fonts
  for SVG text).
- CAD glyphs outside a figure — endpoint markers on hover, dimension arrowheads in the separators —
  are taken from engine frames too (`snapGlyph`, `arrowheadGlyph`). A snap marker is feedback: shown
  on hover or focus only, never as decoration.

## Into the editor

- A cross-document view transition: the hero's sheet grows into the editor's canvas, both named
  `SHEET_TRANSITION`. The opt-in is **inline** in both root layouts' `<head>`
  (`VIEW_TRANSITION_OPT_IN`): in a stylesheet it raced the new page's first style pass and Chrome
  skipped about one transition in five ("ViewTransition opt-in disabled"). The group's timing
  stays in both stylesheets, under `prefers-reduced-motion: no-preference`.
- The sheet is named only in `pageswap` (towards `/draw`) and `pagereveal` (back out of the
  bfcache), and only while on screen: the spec makes a named element a stacking context at all
  times, and an off-screen one would fly in. The editor's canvas is named in its own markup.
- **The editor's first frame waits for its named element** (`<link rel="expect"
  href="#editor-sheet" blocking="render">` in its layout). Chrome may paint a page before the
  parser reaches an element, and it did: a theme script then ahead of the element held the parser
  until the stylesheet loaded, the pair never formed, and the hero only faded out where it stood.
  Nothing else guarantees the order, so the wait stays.
- `SpeculationRules` in the layout prefetches the language's editor on hover or press — the
  document only, and
  **only in production**. Back out of the bfcache, Chrome serves the next visit from the prefetch
  made before the first: fine for a prerendered page, but `next dev`'s HTML belongs to the request
  it answered, and the editor served twice never hydrated (a blank sheet). Never `prerender`: it
  would run the editor, and count a visit, for every hover.

## Facts and copy

- **The Status section's «Not yet» and «Next up» are claims too**, written by hand: a change that
  ships one of them takes it off in the same commit (SPLINE and UCS stayed «next» after
  they shipped), and bumps `CONTENT_UPDATED`.
- **Every number about the product comes from `lib/facts.ts`**, which reads the engine at build time
  (`commandCatalog()`, `SnapType`, `LINEWEIGHTS`, the test files). Never type one into the copy.
- `content/commands.ts` files each registered command under a ribbon group and marks the ribbon
  options this app names as commands of its own (`variant`) — those are neither shown nor counted as
  AutoCAD commands. `content/commands.test.ts` fails when a command is registered but not filed.
- **No literals in components** (lint-enforced; `i18n.instructions.md`). Every visible string is in
  `messages/en.json`, grouped by section, read with `getTranslations()`, keyed by type from the
  JSON (`i18n/global.d.ts`). A count is an ICU plural; a link inside a sentence is a rich tag.
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
- The share image is the language's `/og` (`app/[locale]/og/route.tsx`), and the editor's `/og/draw`,
  named route handlers referenced by path (`OG_IMAGE_PATH`): a metadata image file inside
  `[locale]` would give English an `/en/…` URL, and one in a route group gets a hash that structured
  data cannot cite. `/opengraph-image` redirects to `/og`. The manifest is per language too
  (`app/[locale]/manifest.webmanifest`), so each installs as its own app.
- **A right-to-left card works around three faults of Satori** (`lib/og.tsx`, each with its
  `WHY`): it sets a line's words left to right, so `visualPieces` (bidi-js) hands them over in
  visual order, one sentence per line; it sizes an Arabic word as its isolated letters, so
  opentype.js gives each its shaped width; and it answers a contextual form with the last face
  loaded, so Readex Pro is loaded last. Readex Pro there is the whole static TTF
  (`assets/fonts`): the Arabic subset alone makes the shaper throw. Retire the workarounds when
  Satori reorders on its own, and look at the card before trusting it — a build that passes can
  still draw the words backwards.
- Structured data is one `@graph` (`lib/structured-data.ts`), typed with `schema-dts`, rendered by
  `JsonLd` with `<` escaped. The replacement is `"\\u003c"` in source: with a single backslash the
  string _is_ `<`, and the escape silently does nothing (it shipped that way once). No invented
  ratings, ever.
- `robots.ts` allows everything, `/draw` included (it must be fetchable for its `noindex` to be
  read). `sitemap.ts` lists indexable pages only, once per live language with their `hreflang`,
  with `CONTENT_UPDATED` — bump it with the copy.
- Search Console / Bing tokens come from `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`.
- Icons are generated from `lib/brand.ts` by `node scripts/icons/generate.ts`; the mark and the logo
  component share that geometry.

## Styling

- `marketing.css` is its own Tailwind entry with `source(none)` and explicit `@source` paths; the
  editor's `globals.css` excludes these folders in turn. A new marketing folder must be added to
  both.
- **Tokens only**: `bg-bg`, `bg-bg-raised`, `bg-bg-sunken`, `border-border`, `text-fg`,
  `text-fg-muted`, `text-fg-subtle`, `bg-accent` / `text-accent-ink`, `text-precision`, and
  `var(--cad-*)` inside drawings. No loose hex in a component (`lib/brand.ts` holds the few that must
  be literal, for icons and the OG image). `--text-subtle` is the dimmest text allowed (≈ 5:1).
- One scheme, dark, like the editor and AutoCAD: the tokens sit on `:root` with
  `color-scheme: dark`, `dark:` always applies, and there is no theme selector. The language
  selector is `LanguageLinks` (`i18n.instructions.md`): a list in the footer's title block, a globe
  menu in the bar on a computer (hung from its button by CSS anchor positioning) and a section of the menu on a phone.
- One accent per view: amber is the call to action and the focus ring; cyan is reserved for
  precision (snap markers, measurements) and is never a link colour.
- Use `text-wrap-style`, not the `text-wrap` shorthand, in base styles: the shorthand also resets the
  wrap mode and undoes an inherited `white-space: nowrap`.
- Grid items holding unbreakable content (the command line, transcripts) need `min-w-0`, or they
  widen the column past a phone's viewport.
- Motion is CSS only, inside `prefers-reduced-motion: no-preference`; with reduced motion everything
  is in its final state. Anything that moves for more than five seconds can be paused.
- **Right to left**: the composition mirrors (logical classes, `ui.instructions.md`) and the
  drawings do not. `Drawing` and `Glyph` are `direction="ltr"`, their text tagged with the command
  language (`drawingMarkup(…, lang)` from `recording.scene.lang`); the hero sheet,
  `SheetFrame` and `DimensionDivider` are `dir="ltr"`, and so is everything in the command
  language — transcripts, the try-it box, the 404's line, the final call's `Command:`, the
  command board's key caps and the toolset's command lists (`-MTEXT` read `MTEXT-` in a
  right-to-left paragraph); those carry the command language's `lang` too. A label inside an LTR
  island that is in the page's language (the divider's) reads in its own direction, `dir="auto"`.
  A call to action's arrow is `ForwardArrow`: the text's own `→`, mirrored, since U+2192 has no
  bidi mirror.
- Inter ships without its `opsz` axis: the Display cut cost ~25 KB the first-load budget (≤ 250 KB,
  Brotli) could not spare beside the framework runtime; headlines are tracked tighter instead.
  Arabic's budget is ≤ 275 KB with its third font (≤ 140 KB of fonts): the document, scripts,
  stylesheets and fonts of the first load, Brotli — not the `?_rsc` prefetches of the page's
  links, which a browser tool counts too.

## Files

Same conventions as `components/cad/`: kebab-case, one primary component per file, file name
matching the export.
