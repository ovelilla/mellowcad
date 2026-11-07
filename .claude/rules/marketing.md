---
description: The landing at / — its islands, figures, facts, Open Graph images, sitemap and the 404s
paths:
  - "app/*/*marketing*/**"
  - "app/*/og/**"
  - "app/*/manifest.webmanifest/**"
  - "app/global-not-found.tsx"
  - "app/robots.ts"
  - "app/sitemap.ts"
  - "components/marketing/**"
  - "components/ui/**"
  - "content/**"
  - "lib/site.ts"
  - "lib/plot.ts"
  - "lib/plural.ts"
  - "lib/facts.ts"
  - "lib/og.tsx"
  - "lib/metadata.ts"
  - "lib/structured-data.ts"
  - "lib/brand.ts"
  - "lib/view-transition.ts"
  - "lib/utils.ts"
---

# Landing (`/`)

> Verified against **next 16.4.5**, **next-intl 4.14.9**, **schema-dts 2.1.0**.

The landing and the editor are two **root layouts** under the `[locale]` root param:
`app/[locale]/(marketing)/layout.tsx` owns `<html>`, `marketing.css`, the header, the footer and the
metadata base; `app/[locale]/(app)/layout.tsx` owns the editor and `globals.css`. Crossing between
them is a full page load, so a link to the editor is a plain `<a href={paths.editor}>`, never
`next/link`: its router prefetch would pull the editor's payload into the landing. Links _within_
the landing use `Link`; to the docs, `prefetch={false}` (`docs.md`). Every href is the page's
language's (`sitePaths()`, `localePath()`; `i18n.md`); a client island gets it as a prop. Copy,
claims and tone: `i18n.md`.

**The site exists to be found**: a page that answers a real search (a command, a task, a
comparison, a file format the product opens, a changelog) is welcome, decided on the demand data
at hand, since a page that does not exist cannot show demand of its own. A page of the product's
facts is generated from their source (the engine's catalog, `docs/coverage/`, `lib/facts.ts`) so it
stays true, and every indexable page is in the sitemap, the hreflang set and the internal links:
the practice library is linked from "who it's for" (`Audience.practice`) and the footer.

**`/privacy` is the notice GDPR requires** (Article 13): the host and both Vercel measurements
process personal data (the IP address, a visitor hash kept 24 hours), and so does the contact
address. It names the person responsible (`DATA_CONTROLLER`), the one place the site names anyone.
Anything that starts handling personal data — analytics, a form, an embed, a third party's font or
script — updates it in the same change.

## Rendering

- **Every page is prerendered** (`○`, or `●` per language, in the build output; never `ƒ`, no
  middleware; the docs' search is the one function, and no page: `docs.md`). Nothing here reads
  `cookies()`, `headers()`, `searchParams` or next-intl's `requestLocale`: one such call silently
  turns the page dynamic. The locale comes from `next/root-params`. A route handler serving
  build-time data (OG images, manifests) exports `dynamic = "force-static"`.
- **Server Components by default.** A client island exists only where there is browser state:
  `ContinueDrawing` (the autosave), `HeroControls` (pause), `TransitionSheet` (the sheet's name for
  the trip into the editor), `CommandTry` (the hero's command line), `SendToDesktop` (share sheet),
  `UnknownCommand` (a URL only the browser knows) and `LanguageLinks` (`i18n.md`). It takes its copy
  as props (`i18n.md`).
- **An island imports nothing heavy.** The engine is safe _only_ because `cad/package.json`
  declares it side-effect free (`cad-engine.md`); `cn()` is not — it ships `cn`'s merge engine and its config compiler — and
  `next-intl/navigation` ships next-intl's client runtime.
- **The engine never ships on `/`.** An island takes from it only small pure helpers and types;
  anything reaching `CadEngine` pulls the whole engine into the landing. Check after touching an
  island: the prerendered `.next/server/app/en.html` names no chunk containing `CadRuntime`'s
  strings. A live, editable sketch in the hero was built and removed (weight, and nothing the
  editor one click away does not do): do not bring it back.
- The 404 machinery is `i18n.md`'s; `app/global-not-found.tsx` imports `marketing.css` itself,
  because it bypasses every layout. Both 404s render `NotFoundMessage`.
- A build-time `fs` read (`lib/facts.ts`) takes `/*turbopackIgnore: true*/`, or Turbopack traces the
  whole repository into the server output.

## Figures: the engine draws every illustration

- A figure is a **`DemoScript`** in `content/demos/` (the harness's chained style), registered in
  `content/figures.ts`, rendered at build time by `lib/plot.ts` through `SvgScenePresenter`. Never a
  hand-drawn SVG of drawing content, never a screenshot.
- **Scripts are portable**: a command by its global name with `_` (`.command("_OFFSET")`), a keyword
  by id (`.option("Close")`), as an AutoCAD script written for every language. The transcript shows
  each command as its language names it; code that looks for a command's line asks the engine
  (`engineText(locale).commandNames("OFFSET")`).
- **Every figure is drawn in the page's language**: `pageEngineLocale()` for `renderFigure`,
  `plotDemo`, `commandCatalog`/`autocadCommands` and `engineText(locale)` — never `engineText()`
  bare, which is English. A figure with words of its own (`DIAGRAMS` in `content/figures.ts`) takes
  them from messages as TEXT; to centre a label it uses TEXT justified `MC`, and TEXT keeps the last
  justification (TEXTJUSTIFY), so a left-aligned label comes first.
- **Still or live.** A still frames the finished drawing (`buildDrawingPreview`); a `live` figure is
  the editor's own last frame (cursor, snap marker, tooltip, tracking, selection box), for figures
  _about_ an aid. End a live script mid-gesture (a `moveTo`, a `down` without `up`). A still with
  dimensions sets `frame`: extents know a dimension's definition points, not how far its text runs.
- Scripts are real input: a point after the first is **relative** under dynamic input
  (DYNPICOORDS), so write `@`, or `#` for absolute; HATCH starts on ANGLE, so name the pattern;
  OTRACK acquires by dwelling, so use `hover`, which elapses the engine's dwell at once
  (`elapseDwell`). A recording never waits on a timer: a loaded prerender ran a longer one first.
- `content/figures.test.ts` replays every figure (no error lines, something drawn) and holds the
  hero, both frames, to 8–12 s and ≤ 600 primitives.
- **An exercise is one script of steps** (`content/demos/exercises/`): its pages' figures, each step
  as far as it goes, and the drawing it opens with in the editor, the same steps recorded into a
  store (`recordDemo(…, { store })`, `app/[locale]/drawings`) with its template's layers named in
  the page's language (`Docs.exercise.layers`) and moved left of the origin (`docs.md`).
- The hero plots with CSS only: each element carries `--t` / `--d`, solid strokes have
  `pathLength="1"`, dashed ones and text fade. The transcript is `transcript(recording)`, timed by
  `plotDemo` — **the prompts are the engine's, never typed into the copy**, and so are `Command:` and
  `Unknown command` (`engineText(locale)`); a prompt is drawn from its `segments`, never taken apart.
  Keep animation selectors scoped (`.plot svg …`): a bare `[style*="--t"]` caught the command line.
- **The hero is one script, two phases**: what is drafted (`drafted`) plots in plan; as -VIEW
  answers (`turn`) the editor's last frame (`Plot.turned`) fades in. Its chrome (the view's label,
  the ViewCube) is drawn on the server from the recording's `EngineState` and the engine's names,
  never the editor's components. Its solid stands clear of the 2D objects on the screen: Hidden
  does not hide a line behind a solid yet.
- Drawing colours are `var(--cad-*)`, written from `THEME` by `themeCustomProperties()`. The OG
  image cannot read CSS variables: `lib/og.tsx` uses literal colours and lays the dimension text
  over the drawing itself (the rasteriser has no fonts for SVG text).
- CAD glyphs outside a figure (hover markers, separator arrowheads) come from engine frames too
  (`snapGlyph`, `arrowheadGlyph`). A snap marker is feedback: on hover or focus only, never decor.

## Into the editor

- A cross-document view transition: the hero's sheet grows into the editor's canvas, both named
  `SHEET_TRANSITION`. The opt-in is **inline** in both root layouts' `<head>`
  (`VIEW_TRANSITION_OPT_IN`): in a stylesheet it raced the new page's first style pass and Chrome
  skipped about one transition in five. The group's timing stays in both stylesheets, under
  `prefers-reduced-motion: no-preference`.
- The sheet is named only in `pageswap` (towards `/draw`) and `pagereveal` (back from the bfcache),
  and only while on screen: a named element is a stacking context at all times, and an off-screen
  one would fly in.
- **The editor's first frame waits for its named element** (`<link rel="expect" … blocking="render">`
  in its layout): Chrome may paint before the parser reaches the element, and then the pair never
  forms. Nothing else guarantees the order, so the wait stays.
- `SpeculationRules` prefetches the language's editor on hover or press — the document only, and
  **only in production**: back from the bfcache Chrome serves the next visit from the earlier
  prefetch, and `next dev`'s HTML belongs to the request it answered (the editor served twice never
  hydrated). Never `prerender`: it would run the editor, and count a visit, per hover.

## Facts

- **Every number about the product comes from `lib/facts.ts`**, which reads the engine at build
  time (`commandCatalog()`, `SnapType`, `LINEWEIGHTS`, the test files).
- `content/commands.ts` files each registered command under a ribbon group and marks the ribbon
  options this app names as commands of its own (`variant`) — neither shown nor counted as AutoCAD
  commands; it lists the 3D section's commands and the hero's aliases too. `content/commands.test.ts`
  fails when a command is registered but not filed, or an alias missing in a language.

## Metadata and SEO

- Pages build their metadata with `pageMetadata()` (`lib/metadata.ts`): Next merges `openGraph` and
  `twitter` shallowly, so a page that sets either sets all of it.
- **The landing's title opens with its language's main query**, the description carries the
  rest, and both are written from what that language searches, never translated (its
  `docs/i18n/<tag>.md`, "Search texts"). The H1, `Hero.title`, is the category, and each H2 a
  family its language searches; `Og.tagline`, `Footer.tagline` and `SendToDesktop.shareTitle` say
  the H1, and `Hero.tagline` is the slogan. `i18n/messages.test.ts` holds the
  title to 60 characters with the brand, and the landing's and the editor's descriptions to 155.
- **The OG images and manifests are named route handlers**: the language's `/og`
  (`app/[locale]/og/route.tsx`), the editor's `/og/draw`, referenced by path (`OG_IMAGE_PATH`), and
  `app/[locale]/manifest.webmanifest` per language, so each installs as its own app. A metadata
  image file inside `[locale]` would give English an `/en/…` URL, and one in a route group gets a
  hash structured data cannot cite. `/opengraph-image` redirects to `/og`.
- **A right-to-left card works around three faults of Satori** (`lib/og.tsx`, each with its `WHY`):
  it sets a line's words left to right, so `visualPieces` (bidi-js) hands them over in visual order,
  one sentence per line; it sizes an Arabic word as its isolated letters, so opentype.js gives each
  its shaped width; it answers a contextual form with the last face loaded, so Readex Pro loads
  last — the whole static TTF (`assets/fonts`), as the Arabic subset alone makes the shaper throw.
  Retire them when Satori reorders on its own, and look at the card: a passing build can still draw
  the words backwards.
- Structured data is one `@graph` per page (`lib/structured-data.ts`), typed with `schema-dts`,
  rendered by `JsonLd` with `<` escaped as `"\\u003c"` in source — with one backslash the string
  _is_ `<` and the escape does nothing: the home's site, app and publisher (its `sameAs`, the
  repository and the engine's npm page; its `softwareVersion`, the engine's), and each docs page's
  `BreadcrumbList`, the same steps it draws above the article. No invented ratings, ever.
- `robots.ts` allows everything, `/draw` included (it must be fetchable for its `noindex` to be
  read). `sitemap.ts` lists indexable pages once per live language with their `hreflang` and
  `CONTENT_UPDATED` — bump it with the copy; a docs page, the day of its files' last commit
  (`lastCommitDay`), left out where a shallow clone cannot know it.
- Search Console / Bing tokens come from `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`.
- IndexNow's key is `INDEXNOW_KEY`, served as `public/<key>.txt` (`test/indexnow.test.ts`).
  `npm run indexnow` lists the live sitemap's URLs and `-- --send` submits them: the owner runs it
  after a deploy that adds or changes pages, never a session (it sends data out).
- Google's "Request indexing" of new pages is a queue the owner gave to the sessions
  (2026-11-06): ~/seo-data/scripts/gsc-request-pending.txt, sent a dozen a day by its
  gsc-request.mjs; the session hook says when the next batch is due
  (`test/indexing-queue.test.ts`). A published batch of pages adds its URLs there.
- Icons are generated from `lib/brand.ts` by `node scripts/icons/generate.ts`; the mark and the logo
  component share that geometry.

## Styling

- `marketing.css` is its own Tailwind entry with `source(none)` and explicit `@source` paths, and
  `globals.css` excludes the same folders: a new marketing folder goes in both. Prettier sorts the
  classes against `marketing.css` by an override in `.prettierrc`.
- **Tokens only**: `bg-bg`, `bg-bg-raised`, `bg-bg-sunken`, `border-border`, `text-fg`,
  `text-fg-muted`, `text-fg-subtle`, `bg-accent` / `text-accent-ink`, `text-precision`, and
  `var(--cad-*)` inside drawings. No loose hex in a component (`lib/brand.ts` holds the few literal
  ones, for icons and the OG image). `--text-subtle` is the dimmest text allowed (≈ 5:1). One scheme,
  dark (`ui.md`).
- One accent per view: amber is the call to action and the focus ring; cyan is reserved for
  precision (snap markers, measurements), never a link colour.
- `text-wrap-style`, not the `text-wrap` shorthand, in base styles: the shorthand also resets the
  wrap mode and undoes an inherited `white-space: nowrap`.
- Grid items holding unbreakable content (the command line, transcripts) need `min-w-0`, or they
  widen the column past a phone's viewport.
- Motion is CSS only, inside `prefers-reduced-motion: no-preference`; with reduced motion everything
  is in its final state. Anything that moves for more than five seconds can be paused.
- **Right to left** (`ui.md`): the composition mirrors, the drawings do not. `Drawing` and `Glyph`
  are `direction="ltr"`, their text tagged with the command language (`drawingMarkup(…, lang)` from
  `recording.scene.lang`); the hero sheet, `SheetFrame` and `DimensionDivider` are `dir="ltr"`, and
  so is everything in the command language — transcripts, the hero's command line, the 404's line,
  the final call's `Command:` and the command board's key caps (`-MTEXT` read `MTEXT-`
  in a right-to-left paragraph) — with the command language's `lang`. A page-language label inside
  an LTR island takes `dir="auto"`. A call to action's arrow is `ForwardArrow`: the text's `→`,
  mirrored, since U+2192 has no bidi mirror.
- Arabic's `:lang(ar)` rules in `marketing.css` (running text 1.8, headlines 1.3, calibrated
  display sizes) follow `ui.md`'s; Inter ships without its `opsz` axis, so headlines are tracked
  tighter instead.

## Files

Same conventions as the editor's `packages/editor/src/` (`ui.md`): kebab-case, one primary
component per file, named after its export. The landing has its own `cn` (`lib/utils.ts`) and
`DirectionProvider` (`components/ui/direction.tsx`), the editor its copies: neither imports the
other's.
