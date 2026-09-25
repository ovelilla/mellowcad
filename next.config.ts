import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  experimental: {
    // Two root layouts ((marketing) and (app)) leave no common layout to
    // compose a not-found page from, so unmatched URLs get this one.
    globalNotFound: true,
  },
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

export default withNextIntl(nextConfig)
