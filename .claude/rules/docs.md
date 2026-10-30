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

The plan and its phases: `docs/next-docs.md`. The docs live in the landing's root layout (its
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
  `<include>` of the README or the `api.md`, nothing else; `DOCS_PACKAGES` ties a slug to a
  folder. Never copy a README's words into a page.
- `remarkPackageSource` drops the file's `#` heading (the title is the frontmatter's), sends a
  relative link to its docs page or to the file on GitHub's `main`, reads a block named after an
  example (`tsx examples/…`) from that file, and indexes an API report's exports for search.
  **Every edit is recorded with `replaceSource`**: the `.md` slices the authored source, not the
  tree, so an edit made on the tree alone never reaches it.
- `remarkInclude` always runs first, so no plugin sees which file a node came from:
  `remarkPackageSource` finds the package from the page's path.
- react and the editor say "not published yet" while their `package.json` is `private`; a
  published package's `homepage` is its page.

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

`npm run docs:check`, in the hook and CI: frontmatter and `meta.json`, each package's two pages
and their includes, the links of the package files and of written pages, the examples blocks
name, and the homepage. A README link that leads nowhere fails it. Its own cases are
`lib/docs/check.test.ts`.
