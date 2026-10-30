import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import { routing } from "./i18n/routing"
import {
  localeFallbacks,
  localeRedirects,
  localeRewrites,
  markdownRewrites,
} from "./i18n/rewrites"

const nextConfig: NextConfig = {
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
    ]
  },
  async redirects() {
    return localeRedirects(routing)
  },
  async rewrites() {
    return {
      beforeFiles: markdownRewrites(routing),
      afterFiles: localeRewrites(routing),
      fallback: localeFallbacks(routing),
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
