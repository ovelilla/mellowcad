import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match"
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination"
import { describe, expect, it } from "vitest"

import {
  type LocaleRouting,
  localeFallbacks,
  localeRedirects,
  localeRewrites,
  markdownRewrites,
} from "./rewrites"
import { localeSegment, routing } from "./routing"

type Route = { source: string; destination: string }

function apply(routes: readonly Route[], path: string): string | null {
  for (const { source, destination } of routes) {
    const params = getPathMatch(source)(path)
    if (params) {
      return prepareDestination({
        destination,
        params,
        query: {},
        appendParamsToQuery: false,
      }).newUrl
    }
  }
  return null
}

// What Next serves before `afterFiles`: the pages outside `[locale]`.
const FILES = new Set(["/sitemap.xml", "/robots.txt"])

/** Where a request ends up, the way Next's router orders it. */
function resolve(path: string, scheme: LocaleRouting = routing): string {
  const redirect = apply(localeRedirects(scheme), path)
  if (redirect !== null) return `redirect ${redirect}`
  const markdown = apply(markdownRewrites(scheme), path)
  if (markdown !== null) return `route ${markdown}`
  if (FILES.has(path)) return `file ${path}`
  return `route ${apply(localeRewrites(scheme), path) ?? path}`
}

describe("the locale URL scheme", () => {
  it.each([
    ["/", "route /en"],
    ["/draw", "route /en/draw"],
    ["/privacy", "route /en/privacy"],
    ["/og", "route /en/og"],
    ["/manifest.webmanifest", "route /en/manifest.webmanifest"],
    ["/es", "route /es"],
    ["/es/draw", "route /es/draw"],
    ["/ar", "route /ar"],
    ["/ar/privacy", "route /ar/privacy"],
    // A language whose prefix is not its tag is served under the prefix.
    ["/pt-br", "route /pt-br"],
    ["/pt-br/draw", "route /pt-br/draw"],
    ["/pt-br/docs/engine.md", "route /pt-br/docs-md/engine"],
    ["/en", "redirect /"],
    ["/en/draw", "redirect /draw"],
    ["/opengraph-image", "redirect /og"],
    // Unknown pages reach English's catch-all, which answers 404.
    ["/xx", "route /en/xx"],
    ["/xx/yy", "route /en/xx/yy"],
    // A word that merely starts like a locale is not one.
    ["/espresso", "route /en/espresso"],
    ["/sitemap.xml", "file /sitemap.xml"],
    // A docs page's Markdown, in its own language.
    ["/docs", "route /en/docs"],
    ["/docs/engine", "route /en/docs/engine"],
    ["/docs/engine.md", "route /en/docs-md/engine"],
    ["/docs/engine/api.md", "route /en/docs-md/engine/api"],
    ["/es/docs/engine/api.md", "route /es/docs-md/engine/api"],
    ["/en/docs/engine.md", "redirect /docs/engine.md"],
    // Router requests, as Vercel rewrites them from the `RSC` header.
    ["/index.rsc", "route /en.rsc"],
    [
      "/index.segments/_tree.segment.rsc",
      "route /en.segments/_tree.segment.rsc",
    ],
    [
      "/draw.segments/_tree.segment.rsc",
      "route /en/draw.segments/_tree.segment.rsc",
    ],
    // The framework's own paths are never given a locale.
    ["/_next/static/chunk.js", "route /_next/static/chunk.js"],
    ["/_vercel/insights/script.js", "route /_vercel/insights/script.js"],
  ])("%s → %s", (path, expected) => {
    expect(resolve(path)).toBe(expected)
  })

  it("gives the default locale no prefix and every other one its own", () => {
    for (const locale of routing.locales) {
      const path = `/${localeSegment(locale)}/draw`
      expect(resolve(path)).toBe(
        locale === routing.defaultLocale ? "redirect /draw" : `route ${path}`
      )
    }
  })
})

describe("a prefix that is not the tag", () => {
  // Made up, so the scheme is held to read prefixes whatever routing.ts holds.
  const scheme: LocaleRouting = {
    locales: ["en", "xx-YY"],
    defaultLocale: "en",
    localePrefix: { prefixes: { "xx-YY": "/zz" } },
  }

  it.each([
    ["/zz", "route /zz"],
    ["/zz/draw", "route /zz/draw"],
    ["/zz/docs/engine.md", "route /zz/docs-md/engine"],
    // The tag is no prefix: an English path, which answers 404.
    ["/xx-YY/draw", "route /en/xx-YY/draw"],
  ])("%s → %s", (path, expected) => {
    expect(resolve(path, scheme)).toBe(expected)
  })

  it("sends the prefix's unknown paths to its 404", () => {
    expect(apply(localeFallbacks(scheme), "/zz/nope")).toBe("/zz/404")
    expect(apply(localeFallbacks(scheme), "/xx-YY/nope")).toBeNull()
  })
})
