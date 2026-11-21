import { describe, expect, it, vi } from "vitest"

import nextConfig from "../next.config"
import { localeSegment, routing } from "./routing"

type Rule = { loaders: { loader: string }[] }

describe("next.config.ts", () => {
  it("keeps next-intl's catalog loader beside the docs' JSON loader", () => {
    // createMDX sets Turbopack's `*.json` rule over any other: wrapped the
    // other way round, every message shipped uncompiled.
    const rules = [nextConfig.turbopack?.rules?.["*.json"]].flat() as Rule[]
    const loaders = rules.flatMap((rule) =>
      rule.loaders.map(({ loader }) => loader)
    )
    expect(loaders).toContain("next-intl/extractor/catalogLoader")
    expect(loaders).toContain("fumadocs-mdx/webpack/meta")
  })

  it("routes each language by its prefix, never by a tag that differs", async () => {
    const rewrites = (await nextConfig.rewrites?.()) as Record<
      string,
      { source: string }[]
    >
    const sources = Object.values(rewrites)
      .flat()
      .map(({ source }) => source)
      .join(" ")
    for (const locale of routing.locales.filter(
      (locale) => locale !== routing.defaultLocale
    )) {
      expect(sources, locale).toContain(localeSegment(locale))
      if (localeSegment(locale) !== locale) {
        expect(sources, locale).not.toContain(locale)
      }
    }
  })
})

describe("the production build", () => {
  async function productionConfig() {
    vi.stubEnv("NODE_ENV", "production")
    vi.resetModules()
    try {
      return (await import("../next.config")).default
    } finally {
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  }

  it("is a static export, its 404s left to vercel.json", async () => {
    const config = await productionConfig()
    expect(config.output).toBe("export")
    const rewrites = (await config.rewrites?.()) as Record<string, unknown[]>
    expect(rewrites.fallback).toEqual([])
  })

  it("keeps the server, and its 404 rewrites, in next dev", () => {
    expect(nextConfig.output).toBeUndefined()
  })
})
