import { describe, expect, it } from "vitest"

import nextConfig from "../next.config"

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
})
