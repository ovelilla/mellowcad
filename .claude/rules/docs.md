---
description: The site's /docs — one source per page, languages, Fumadocs and the MDX pipeline, search, llms.txt and the .md routes
paths:
  - "content/docs/**"
  - "lib/docs/**"
  - "components/docs/**"
  - "app/*/*marketing*/docs/**"
  - "app/*/docs-md/**"
  - "app/api/search/**"
  - "app/llms.txt/**"
  - "scripts/docs/**"
---

# Docs (`/docs`)

> Verified against **fumadocs-core 16.17.8**, **fumadocs-mdx 15.4.10**, **next 16.4.3**.

The docs live in the landing's root layout (its
header, footer and `marketing.css`, which names `components/docs` in its `@source`); copy and
claims follow `i18n.md`.

## Languages

- **"Build" is English, served under every prefix.** `/docs/engine` is the page; `/es/docs/engine`
  and `/ar/docs/engine` serve the same English article in that language's chrome — header, menu,
  labels, the language selector staying on the page — with the article `lang="en"` and
  `dir="ltr"`, a notice (`Docs.englishOnly`), the English URL as canonical and no hreflang
  (`pageMetadata`'s `contentLocale`). Only the English URL is in the sitemap, `llms.txt` and the
  `.md`. One indexable URL per text, and nobody is thrown out of their language's site. Fumadocs'
  `fallbackLanguage` does it: a language without the file gets English's.
- `/docs` itself is the site's (messages `Docs`), in every language with its hreflang.
- A page's language is its file's (`name.<tag>.mdx`, none for English); slugs are never
  translated (`i18n.md`).

## One source

- **A "Build" page is its package's file**: frontmatter (`title`, `description`, `type`) and one
  `<include>` of the README, the `api.md` or a guide (`<dir>/docs/<name>.md`, the page
  `<slug>/<name>`), nothing else; `DOCS_PACKAGES` ties a slug to a folder, `packagePageFile` a page
  to its file. A guide is the package's, read on GitHub and npm as the README is. Never copy a
  package file's words into a page.
- `remarkPackageSource` drops the file's `#` heading (the title is the frontmatter's), sends a
  relative link to its docs page or to the file on GitHub's `main`, reads a block named after an
  example (`tsx examples/…`) from that file, and indexes an API report's exports for search.
  **Every edit is recorded with `replaceSource`**: the `.md` slices the authored source, not the
  tree, so an edit made on the tree alone never reaches it.
- `remarkInclude` always runs first, so no plugin sees which file a node came from:
  `remarkPackageSource` finds the package and the file from the page's path, and resolves a
  relative link from that file's folder (a guide's are `cad/docs/`'s).
- react and the editor say "not published yet" while their `package.json` is `private`; a
  published package's `homepage` is its page.

## "Use MellowCAD"

- Pages at the docs' root, each in every language (`commands.mdx`, `commands.es.mdx`…), listed in
  `USE_PAGES` (`lib/docs/use.ts`); the navigation's "Use" is the root pages and "Build" the
  folders (`navSections`). A page in every language has its own canonical, hreflang and sitemap
  alternates (`isTranslated`).
- **A generated page is a file snapshot** of `lib/docs/generate.test.ts` (`generated:` in its
  frontmatter), written from the engine's catalog, the messages and `docs/coverage/`: never edit
  one; change its source and run `npx vitest run lib/docs/generate.test.ts -u`. WHY in Vitest:
  Node resolves `@mellowcad/engine` to its untracked `dist/`, and the macro bundles with packages
  external, so neither `docs:check` nor a remark plugin can read the catalog.
- Every command has a `###` heading in `docs/coverage/` naming it in a code span: the reference
  links to it and fails without one.
- **The reference's anchors are global names in lower case** (`#line`, `#-hatch`), the same in
  every language: F1 in `/draw` opens them (its page's `help`), so renaming one breaks the editor's
  help.
- **A written page never types a command's name**: `<Command id="NEW" />` is the name in the page's
  command language (`NUEVO` in Spanish), read from `cad/locales/*.json` by `remarkCommandNames`,
  which a remark plugin can read without the engine.
- **A figure is a `<Session name="…" />`**, never a screenshot: a `DOCS_SESSIONS` script
  (`content/figures.ts`) the engine draws and writes the history of in the page's language
  (`DocsSession`); the `.md` gives its history as a text block. `lib/docs/sessions.test.ts` holds
  every name to a session and every session to a page.
- **Each difference from AutoCAD quotes why** (`lib/docs/differences.ts`): a `WHY` at the code or
  its coverage entry. A deviation lifted or reworded fails `docs:check` until the page says so; a
  new one gets a section in every language and its quote. No difference without a written reason.
- A hand-written translation carries `sourceHash` (`sourceHash()` of its English file):
  `docs:check` names a stale one and the hash to set once it is brought up to date.
- In a right-to-left page a command's name in a heading is isolated (FSI…PDI) and inline code is
  `dir="ltr"`: `-HATCH` read `HATCH-` in the heading and its table of contents.

## Fumadocs

- Macro API (`fumadocs-mdx/macro`), no `source.config.ts`. **`include` matches by file name**
  (`docs-source.ts`): with a path, Turbopack never ran the macro ("this macro was not compiled").
  `dir` is a literal.
- **`withNextIntl` wraps `createMDX`, never the reverse**: `createMDX` sets Turbopack's `*.json`
  rule over any other, which dropped next-intl's catalog loader and shipped every message
  uncompiled, tags and all; next-intl adds its rule beside it (`i18n/next-config.test.ts`).
- A collection's `mdxOptions` replace the defaults: extend them through `applyMdxPreset`.
- `next dev` keeps the compiled `.mdx` when the collection's options change: restart it.
- Outside the bundler the macro does not exist: `docs:check` and the tests read the files
  (`lib/docs/check.ts`, `lib/docs/schema.ts`), never `docsSource`, and what they import uses
  `.ts` extensions, for Node to run it.
- Code is coloured by Shiki's CSS-variables theme, from the `--syntax-*` tokens of
  `marketing.css`: never a theme's literal colours.
- A block is shadcn's Code Block (`components/docs/code-block.tsx`, its registry's `cn` pointed at
  `lib/utils.ts`), rendered on the server over Shiki's lines; only the copy button is an island,
  announcing the copy in a live region. Its meta is `title="…"`, `lineNumbers[=n]` and `wrap`
  (`parseCodeMeta`); a line is marked by Shiki's notation, `// [!code highlight]`, `++`, `--`.

## Rendering and weight

- Pages are `●`; the `.md` (`[locale]/docs-md`, reached through `markdownRewrites`) and
  `llms.txt` are force-static. **`/api/search` is the one `ƒ`, on purpose**: nubigest's static
  index of three languages passed Vercel's 20 MB limit for a static body
  (`FALLBACK_BODY_TOO_LARGE`) and every reader downloaded it whole. A day of CDN cache answers a
  repeated query.
- **The docs' islands never reach the landing**: their Base UI dialogs are ~22 KB Brotli, and a
  prefetched `/docs` loads its chunks into `/` (measured +27 KB on the first load). The landing
  links the docs with `Link prefetch={false}`.

## `docs:check`

`npm run docs:check`, in the hook and CI: frontmatter and `meta.json`, each package's pages (its
README, `api.md` and every guide) and their includes, each "Use" page in every language and its translations' `sourceHash`, each
`<Command id>`, the differences' quotes and sections, the links of the package files and of
written pages (a fragment to a root page's heading), the examples blocks name, and the homepage.
A README link that leads nowhere fails it. Its own cases are `lib/docs/check.test.ts`.
