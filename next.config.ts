import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import { routing } from "./i18n/routing"
import {
  fileHeaders,
  localeFallbacks,
  localeRedirects,
  localeRewrites,
  markdownRewrites,
} from "./i18n/rewrites"

// WHY a static export: on Vercel every prerendered page lives in the ISR
// store and each read counts against Hobby's million, where a file costs
// only its CDN request (`docs/next-static-export.md`). `next build` only
// warns that headers, redirects and rewrites are not applied: Vercel's
// builder still emits them from `.next/routes-manifest.json` ("detected
// `next export`"), which a test over `vercel build`'s output holds.
// WHY not in `next dev`: there a rewritten path (`/` onto `/en`) answers 500,
// "missing param in generateStaticParams(), required with output: export".
const isExport = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  // Every change to the engine's state re-renders the editor's chrome: the
  // compiler's memoization takes that from ~7 ms to ~3 ms, for 1.5 KB more on
  // the landing. The Babel plugin, not the Rust port, which is experimental.
  reactCompiler: true,
  experimental: {
    // Two root layouts ((marketing) and (app)) leave no common layout to
    // compose a not-found page from, so URLs outside `[locale]` get this one.
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing opens or embeds the site from another origin: no popups,
          // no OAuth, no iframes.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      ...fileHeaders(routing),
    ]
  },
  async redirects() {
    return localeRedirects(routing)
  },
  async rewrites() {
    return {
      beforeFiles: [
        // The MCP server is a Vercel function outside Next (`api/mcp.js`),
        // which `next dev` does not serve: its tests call the handler.
        { source: "/mcp", destination: "/api/mcp" },
        ...markdownRewrites(routing),
      ],
      afterFiles: localeRewrites(routing),
      // Exported, a language's 404 is `vercel.json`'s (`notFoundRoutes`).
      fallback: isExport ? [] : localeFallbacks(routing),
    }
  },
}

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
  experimental: {
    // Types every message's arguments from the English source, so a call that
    // passes the wrong ones fails to compile.
    createMessagesDeclaration: "./messages/en.json",
    // ICU compiled at build time: the browser gets icu-minify's formatter
    // instead of a message parser.
    messages: {
      path: "./messages",
      format: "json",
      locales: "infer",
      sourceLocale: "en",
      precompile: true,
    },
  },
})

// WHY a file name: Turbopack matches a pattern without `/` against the file's
// name; a path (`lib/docs/**`) never matched, and the macro failed at runtime
// ("this macro was not compiled").
const withMDX = createMDX({ macro: { include: ["docs-source.ts"] } })

// WHY this order: createMDX sets Turbopack's `*.json` rule (its meta files)
// over any other, which dropped next-intl's catalog loader and shipped every
// message uncompiled; next-intl adds its rule beside the one already there.
export default withNextIntl(withMDX(nextConfig))
