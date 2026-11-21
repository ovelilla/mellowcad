import type { NextConfig } from "next"

import { DOCS_PACKAGES, DOCS_PATH } from "../lib/docs/packages"
import {
  COMMAND_LIST_PATH,
  DRAWINGS_PATH,
  EDITOR_OG_IMAGE_PATH,
  OG_IMAGE_PATH,
  SEARCH_INDEX_PATH,
  SITE_URL,
} from "../lib/site"

type Redirect = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number]
type Rewrite = { source: string; destination: string }
type Header = Awaited<ReturnType<NonNullable<NextConfig["headers"]>>>[number]

/**
 * The `as-needed` URL scheme without a proxy. The default locale's pages are
 * served without a prefix by rewriting them onto `[locale]`, and its prefixed
 * URLs redirect to the unprefixed ones, so each page has one address.
 *
 * WHY no proxy: with detection, the cookie and the Link header off, next-intl's
 * middleware would only do this rewrite and this redirect — and a proxy runs a
 * function on every request that matches it, in front of a site that is
 * entirely static. `rewrites()` and `redirects()` are resolved by the
 * platform's router instead. If the language ever has to be negotiated,
 * `proxy.ts` comes back with the same `routing`.
 */
export interface LocaleRouting {
  readonly locales: readonly string[]
  readonly defaultLocale: string
  readonly localePrefix?:
    | string
    | { readonly prefixes?: Readonly<Partial<Record<string, string>>> }
    | { readonly mode: "never" }
}

/**
 * Each language's first path segment: its prefix without the slash where it
 * has one (`pt-br` for `pt-BR`), else its tag. The rules below match and
 * write segments, never tags.
 */
function segments({ locales, localePrefix }: LocaleRouting): string[] {
  const prefixes =
    typeof localePrefix === "object" && "prefixes" in localePrefix
      ? localePrefix.prefixes
      : undefined
  return locales.map((locale) => prefixes?.[locale]?.slice(1) ?? locale)
}

export function localeRedirects(routing: LocaleRouting): Redirect[] {
  const { defaultLocale } = routing
  return [
    { source: `/${defaultLocale}`, destination: "/", permanent: true },
    {
      source: `/${defaultLocale}/:path*`,
      destination: "/:path*",
      permanent: true,
    },
    ...englishOnlyRedirects(routing),
    ...shareCardRedirects(routing),
    // Some clients ask for the touch icon by its old names without reading
    // the page's `<link rel="apple-touch-icon">`, which is `app/apple-icon.png`.
    {
      source: "/apple-touch-icon:suffix(|-precomposed).png",
      destination: "/apple-icon.png",
      permanent: true,
    },
  ]
}

/**
 * The docs' "Build" pages are written in English only, so each has one URL:
 * under another language's prefix, a page and its Markdown redirect to the
 * English ones (`/es/docs/engine/api` → `/docs/engine/api`). WHY not the page
 * in that language's chrome around English text: it was 45 more URLs for
 * crawlers, each canonical to its English twin, a third of the site's links,
 * and the navigation in one language around content in another, which Google
 * advises against.
 */
function englishOnlyRedirects(routing: LocaleRouting): Redirect[] {
  const prefixed = segments(routing).filter(
    (segment) => segment !== routing.defaultLocale
  )
  if (prefixed.length === 0) return []
  const base = `/:locale(${prefixed.join("|")})${DOCS_PATH}/:folder(${DOCS_PACKAGES.map((pkg) => pkg.slug).join("|")})`
  return [
    { source: base, destination: `${DOCS_PATH}/:folder`, permanent: true },
    {
      source: `${base}.md`,
      destination: `${DOCS_PATH}/:folder.md`,
      permanent: true,
    },
    {
      source: `${base}/:path+`,
      destination: `${DOCS_PATH}/:folder/:path+`,
      permanent: true,
    },
  ]
}

/**
 * The share cards' old addresses, which the social networks keep in their
 * caches: `/opengraph-image`, then `/og` and `/og/draw` in each language,
 * before a static file needed the extension (`docs/next-static-export.md`).
 */
function shareCardRedirects(routing: LocaleRouting): Redirect[] {
  const prefixed = segments(routing).filter(
    (segment) => segment !== routing.defaultLocale
  )
  const cards = [
    ["/og", OG_IMAGE_PATH],
    ["/og/draw", EDITOR_OG_IMAGE_PATH],
  ]
  return [
    { source: "/opengraph-image", destination: OG_IMAGE_PATH, permanent: true },
    ...cards.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    })),
    ...(prefixed.length === 0
      ? []
      : cards.map(([source, destination]) => ({
          source: `/:locale(${prefixed.join("|")})${source}`,
          destination: `/:locale${destination}`,
          permanent: true,
        }))),
  ]
}

/**
 * The headers of what is served as a file. A route handler's own headers
 * are lost once the site is exported (each is a file), so they are named
 * here by the URL the reader asks for: a docs page's Markdown points to its
 * HTML page as the one to index, and what only the site's own scripts fetch
 * (the hero's command list, an exercise's drawing, the docs' search index)
 * is kept out of search.
 */
export function fileHeaders(routing: LocaleRouting): Header[] {
  const prefixed = segments(routing).filter(
    (segment) => segment !== routing.defaultLocale
  )
  const anyLocale =
    prefixed.length === 0 ? "" : `/:locale(${prefixed.join("|")})?`
  const noindex = [{ key: "X-Robots-Tag", value: "noindex" }]
  return [
    {
      source: `${DOCS_PATH}/:slug+.md`,
      headers: [
        {
          key: "Link",
          value: `<${SITE_URL}${DOCS_PATH}/:slug+>; rel="canonical"`,
        },
      ],
    },
    ...(prefixed.length === 0
      ? []
      : [
          {
            source: `/:locale(${prefixed.join("|")})${DOCS_PATH}/:slug+.md`,
            headers: [
              {
                key: "Link",
                value: `<${SITE_URL}/:locale${DOCS_PATH}/:slug+>; rel="canonical"`,
              },
            ],
          },
        ]),
    { source: `${anyLocale}${COMMAND_LIST_PATH}`, headers: noindex },
    { source: `${anyLocale}${SEARCH_INDEX_PATH}`, headers: noindex },
    { source: `${anyLocale}${DRAWINGS_PATH}/:name`, headers: noindex },
  ]
}

/**
 * `beforeFiles`: a docs page's Markdown is its URL with `.md`
 * (`/docs/engine.md`, `/es/docs/…md`), served by `[locale]/docs-md`, a route
 * handler, since a page cannot answer two formats. Its last segment keeps
 * the `.md` there too (the handler's `generateStaticParams`).
 */
export function markdownRewrites(routing: LocaleRouting): Rewrite[] {
  const { defaultLocale } = routing
  const prefixed = segments(routing).filter(
    (segment) => segment !== defaultLocale
  )
  return [
    {
      source: "/docs/:slug+.md",
      destination: `/${defaultLocale}/docs-md/:slug+.md`,
    },
    {
      source: `/:locale(${prefixed.join("|")})/docs/:slug+.md`,
      destination: "/:locale/docs-md/:slug+.md",
    },
  ]
}

/** Where every language sends the paths it does not have (`[locale]/(marketing)/404`). */
export const NOT_FOUND_PATH = "/404"

/**
 * `afterFiles`: after the static files and the pages that are not dynamic
 * (the sitemap, the hero sketch, the icons), before the dynamic routes, which
 * is where `[locale]` lives. A first segment that is a locale, or that starts
 * with `_` (the framework's and the platform's own paths), is left alone.
 */
export function localeRewrites(routing: LocaleRouting): Rewrite[] {
  const { defaultLocale } = routing
  const prefixes = segments(routing).join("|")
  return [
    { source: "/", destination: `/${defaultLocale}` },
    // WHY: the exported site's router asks for files, not headers: a page's
    // payload is `<path>.txt` and its segments `<path>/__next.<segment>.txt`,
    // which the next rule still sends under `/en`. The root's are
    // `/index.txt` and `/__next.…`, a first segment with `_` that rule leaves
    // alone, but `[locale]` exported them as `/en.txt` and `/en/__next.…`, so
    // without these the home page's navigations fall back to full page loads.
    { source: "/index.txt", destination: `/${defaultLocale}.txt` },
    {
      source: "/:file(__next\\.[^/]+\\.txt)",
      destination: `/${defaultLocale}/:file`,
    },
    {
      source: `/:first((?!(?:${prefixes})(?:/|$)|_)[^/]+)/:rest*`,
      destination: `/${defaultLocale}/:first/:rest*`,
    },
  ]
}

/**
 * `fallback`: after every page and file has been tried, before the 404. An
 * unknown path of a language gets that language's prerendered 404 — English
 * ones arrive here already rewritten under `/en`. In `next dev` only: a
 * rewrite onto the exported 404's file would answer 200, so on Vercel
 * `notFoundRoutes` does it, with the status.
 */
export function localeFallbacks(routing: LocaleRouting): Rewrite[] {
  return [
    {
      source: `/:locale(${segments(routing).join("|")})/:path*`,
      destination: `/:locale${NOT_FOUND_PATH}`,
    },
  ]
}

/** A route of Vercel's routing table (`vercel.json`'s `routes`). */
export type VercelRoute =
  | { src: string; status?: number; dest?: string; continue?: boolean }
  | { handle: "error" }

/**
 * A language's 404 on Vercel, written into `vercel.json` (held equal by
 * `test/vercel.test.ts`): each language's `/404` answers with its status,
 * and in the error phase, once no file matched, an unknown path gets its
 * language's 404 page with the status, an unprefixed one English's. WHY not
 * the `fallback` rewrite: onto an exported file it answers 200. Vercel puts
 * these before its own error route, `.* → /404` (the global one).
 */
export function notFoundRoutes(routing: LocaleRouting): VercelRoute[] {
  const all = segments(routing).join("|")
  const prefixed = segments(routing)
    .filter((segment) => segment !== routing.defaultLocale)
    .join("|")
  return [
    {
      src: `^/(?:(?:${all})/)?404/?$`,
      status: 404,
      continue: true,
    },
    { handle: "error" },
    ...(prefixed === ""
      ? []
      : [
          {
            src: `^/(${prefixed})(?:/.*)?$`,
            status: 404,
            dest: `/$1${NOT_FOUND_PATH}`,
          },
        ]),
    {
      src: "^/.*$",
      status: 404,
      dest: `/${routing.defaultLocale}${NOT_FOUND_PATH}`,
    },
  ]
}
