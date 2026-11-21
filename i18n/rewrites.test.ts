import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match"
import {
  compileNonPath,
  prepareDestination,
} from "next/dist/shared/lib/router/utils/prepare-destination"
import { describe, expect, it } from "vitest"

import {
  type LocaleRouting,
  fileHeaders,
  localeFallbacks,
  localeRedirects,
  localeRewrites,
  markdownRewrites,
  notFoundRoutes,
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

// What Next serves before `afterFiles`: the pages outside `[locale]`, and,
// exported, a language's home payload, which the generic rule would
// otherwise send under `/en` (`/es.txt` is no prefix and a slash).
const FILES = new Set(["/sitemap.xml", "/robots.txt", "/es.txt"])

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
    ["/og.png", "route /en/og.png"],
    ["/og/draw.png", "route /en/og/draw.png"],
    ["/es/og.png", "route /es/og.png"],
    ["/manifest.webmanifest", "route /en/manifest.webmanifest"],
    ["/es", "route /es"],
    ["/es/draw", "route /es/draw"],
    ["/ar", "route /ar"],
    ["/ar/privacy", "route /ar/privacy"],
    // A language whose prefix is not its tag is served under the prefix.
    ["/pt-br", "route /pt-br"],
    ["/pt-br/draw", "route /pt-br/draw"],
    ["/pt-br/docs/commands.md", "route /pt-br/docs-md/commands.md"],
    ["/en", "redirect /"],
    ["/en/draw", "redirect /draw"],
    // The share cards' old addresses, kept in the social networks' caches.
    ["/opengraph-image", "redirect /og.png"],
    ["/og", "redirect /og.png"],
    ["/og/draw", "redirect /og/draw.png"],
    ["/es/og", "redirect /es/og.png"],
    ["/pt-br/og/draw", "redirect /pt-br/og/draw.png"],
    ["/en/og", "redirect /og"],
    ["/apple-touch-icon.png", "redirect /apple-icon.png"],
    ["/apple-touch-icon-precomposed.png", "redirect /apple-icon.png"],
    // Unknown pages reach English's catch-all, which answers 404.
    ["/xx", "route /en/xx"],
    ["/xx/yy", "route /en/xx/yy"],
    // A word that merely starts like a locale is not one.
    ["/espresso", "route /en/espresso"],
    ["/sitemap.xml", "file /sitemap.xml"],
    // A docs page's Markdown, in its own language.
    ["/docs", "route /en/docs"],
    ["/docs/engine", "route /en/docs/engine"],
    ["/docs/engine.md", "route /en/docs-md/engine.md"],
    ["/docs/engine/api.md", "route /en/docs-md/engine/api.md"],
    ["/en/docs/engine.md", "redirect /docs/engine.md"],
    // "Build" is English only: one URL per page, whatever the prefix.
    ["/es/docs/engine", "redirect /docs/engine"],
    ["/ar/docs/engine/api", "redirect /docs/engine/api"],
    ["/pt-br/docs/editor/nextjs", "redirect /docs/editor/nextjs"],
    ["/es/docs/react.md", "redirect /docs/react.md"],
    ["/es/docs/engine/api.md", "redirect /docs/engine/api.md"],
    // "Use" is written in every language, and a word that merely starts
    // like a package's folder is no folder.
    ["/es/docs/commands", "route /es/docs/commands"],
    ["/es/docs/commands.md", "route /es/docs-md/commands.md"],
    ["/es/docs/engineering", "route /es/docs/engineering"],
    ["/es/docs", "route /es/docs"],
    // The exported router's requests: a page's payload and its segments.
    ["/index.txt", "route /en.txt"],
    ["/__next._tree.txt", "route /en/__next._tree.txt"],
    ["/__next.$d$locale.txt", "route /en/__next.$d$locale.txt"],
    ["/draw.txt", "route /en/draw.txt"],
    ["/docs/commands/line.txt", "route /en/docs/commands/line.txt"],
    ["/draw/__next._tree.txt", "route /en/draw/__next._tree.txt"],
    ["/es.txt", "file /es.txt"],
    ["/es/draw.txt", "route /es/draw.txt"],
    ["/es/__next._tree.txt", "route /es/__next._tree.txt"],
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

describe("the headers of what is served as a file", () => {
  /** Every header the request gets, its values filled in, as Next does. */
  function headersOf(path: string, scheme: LocaleRouting = routing) {
    const found: Record<string, string> = {}
    for (const { source, headers } of fileHeaders(scheme)) {
      const params = getPathMatch(source)(path)
      if (!params) continue
      for (const { key, value } of headers) {
        found[key] = compileNonPath(value, params)
      }
    }
    return found
  }

  it.each([
    ["/docs/engine.md", "https://mellowcad.com/docs/engine"],
    ["/docs/engine/api.md", "https://mellowcad.com/docs/engine/api"],
    [
      "/es/docs/commands/line.md",
      "https://mellowcad.com/es/docs/commands/line",
    ],
    ["/pt-br/docs/commands.md", "https://mellowcad.com/pt-br/docs/commands"],
  ])("points %s to its page as the canonical", (path, page) => {
    expect(headersOf(path)).toEqual({ Link: `<${page}>; rel="canonical"` })
  })

  it.each([
    "/command-list.json",
    "/es/command-list.json",
    "/pt-br/command-list.json",
    "/search-index.json",
    "/ja/search-index.json",
    "/drawings/gasket.json",
    "/ar/drawings/gasket.json",
  ])("keeps %s out of search", (path) => {
    expect(headersOf(path)).toEqual({ "X-Robots-Tag": "noindex" })
  })

  it.each(["/", "/docs/engine", "/draw", "/xx/command-list.json", "/og.png"])(
    "leaves %s alone",
    (path) => {
      expect(headersOf(path)).toEqual({})
    }
  )

  it("reads the prefix, not the tag", () => {
    const scheme: LocaleRouting = {
      locales: ["en", "xx-YY"],
      defaultLocale: "en",
      localePrefix: { prefixes: { "xx-YY": "/zz" } },
    }
    expect(headersOf("/zz/command-list.json", scheme)).toEqual({
      "X-Robots-Tag": "noindex",
    })
    expect(headersOf("/xx-YY/command-list.json", scheme)).toEqual({})
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
    ["/zz/docs/commands.md", "route /zz/docs-md/commands.md"],
    ["/zz/docs/engine/api", "redirect /docs/engine/api"],
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

describe("a language's 404 on Vercel", () => {
  /**
   * Where Vercel's error phase sends a path no file answered, and with which
   * status, read from `notFoundRoutes` as its router reads `vercel.json`.
   */
  function notFound(path: string, scheme: LocaleRouting = routing) {
    for (const route of notFoundRoutes(scheme)) {
      if ("handle" in route || route.dest === undefined) continue
      const match = new RegExp(route.src).exec(path)
      if (match)
        return `${route.status} ${route.dest.replace(/\$(\d)/g, (_, n: string) => match[Number(n)] ?? "")}`
    }
    return null
  }

  it.each([
    ["/es/nope", "404 /es/404"],
    ["/es", "404 /es/404"],
    ["/pt-br/docs/nope", "404 /pt-br/404"],
    ["/ar/nope", "404 /ar/404"],
    ["/xx/yy", "404 /en/404"],
    ["/espresso", "404 /en/404"],
    ["/nope", "404 /en/404"],
  ])("sends %s to %s", (path, expected) => {
    expect(notFound(path)).toBe(expected)
  })

  it("answers each language's 404 page itself with the status", () => {
    const [own] = notFoundRoutes(routing)
    expect(own).toMatchObject({ status: 404, continue: true })
    for (const path of ["/404", "/es/404", "/pt-br/404", "/ja/404/"]) {
      expect("src" in own && new RegExp(own.src).test(path), path).toBe(true)
    }
    expect("src" in own && new RegExp(own.src).test("/es/404x")).toBe(false)
  })

  it("routes the prefix, never a tag that differs", () => {
    const scheme: LocaleRouting = {
      locales: ["en", "xx-YY"],
      defaultLocale: "en",
      localePrefix: { prefixes: { "xx-YY": "/zz" } },
    }
    expect(notFound("/zz/nope", scheme)).toBe("404 /zz/404")
    expect(notFound("/xx-YY/nope", scheme)).toBe("404 /en/404")
  })
})
