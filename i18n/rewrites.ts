import type { NextConfig } from "next"

import { OG_IMAGE_PATH } from "../lib/site"

type Redirect = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number]
type Rewrite = { source: string; destination: string }

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

export function localeRedirects({ defaultLocale }: LocaleRouting): Redirect[] {
  return [
    { source: `/${defaultLocale}`, destination: "/", permanent: true },
    {
      source: `/${defaultLocale}/:path*`,
      destination: "/:path*",
      permanent: true,
    },
    // The share card moved to a route of its own inside `[locale]`.
    { source: "/opengraph-image", destination: OG_IMAGE_PATH, permanent: true },
  ]
}

/**
 * `beforeFiles`: a docs page's Markdown is its URL with `.md`
 * (`/docs/engine.md`, `/es/docs/…md`), served by `[locale]/docs-md`, a route
 * handler, since a page cannot answer two formats.
 */
export function markdownRewrites(routing: LocaleRouting): Rewrite[] {
  const { defaultLocale } = routing
  const prefixed = segments(routing).filter(
    (segment) => segment !== defaultLocale
  )
  return [
    {
      source: "/docs/:slug+.md",
      destination: `/${defaultLocale}/docs-md/:slug+`,
    },
    {
      source: `/:locale(${prefixed.join("|")})/docs/:slug+.md`,
      destination: "/:locale/docs-md/:slug+",
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
    // WHY: Vercel turns a router request (`RSC` header) into a path before
    // these rules see it: `/draw` becomes `/draw.rsc` or
    // `/draw.segments/<segment>.segment.rsc`, which the next rule still sends
    // under `/en`. The root becomes `/index.…`, but `[locale]` prerendered it
    // as `/en.…`, so without these the home page's prefetch answers 404 and
    // its navigations fall back to full page loads.
    { source: "/index.rsc", destination: `/${defaultLocale}.rsc` },
    {
      source: "/index.segments/:path*",
      destination: `/${defaultLocale}.segments/:path*`,
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
 * ones arrive here already rewritten under `/en`.
 */
export function localeFallbacks(routing: LocaleRouting): Rewrite[] {
  return [
    {
      source: `/:locale(${segments(routing).join("|")})/:path*`,
      destination: `/:locale${NOT_FOUND_PATH}`,
    },
  ]
}
