import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import { routing } from "./i18n/routing"
import {
  localeFallbacks,
  localeRedirects,
  localeRewrites,
} from "./i18n/rewrites"

const nextConfig: NextConfig = {
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
      beforeFiles: [],
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

export default withNextIntl(nextConfig)
