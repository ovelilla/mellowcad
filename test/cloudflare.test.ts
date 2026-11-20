import { describe, expect, it } from "vitest"

import {
  BYPASS_PREFIXES,
  CACHE_RULE,
  CLAUDE_EGRESS,
  FIREWALL_RULES,
  UNWANTED_CRAWLERS,
  PHASES,
  PROVIDERS_LIST,
  RATE_RULES,
  type Rule,
  type ZoneState,
  cacheExpression,
  differences,
  providerAddresses,
  withRules,
} from "../scripts/cloudflare/zone"

const addresses = providerAddresses({
  prefixes: [{ ipv4Prefix: "1.2.3.4/32" }, { ipv4Prefix: "5.6.7.0/24" }],
})

const matching: ZoneState = {
  settings: { ssl: "strict", always_use_https: "off" },
  smartTieredCache: "on",
  phases: Object.fromEntries(
    Object.entries(PHASES).map(([phase, rules]) => [
      phase,
      rules.map((rule) => ({ ...rule, id: "r", version: "3" })),
    ])
  ),
  list: [...addresses].reverse(),
  records: [
    { id: "a", name: "mellowcad.com", type: "CNAME", proxied: true },
    { id: "b", name: "www.mellowcad.com", type: "CNAME", proxied: true },
    { id: "c", name: "mellowcad.com", type: "MX", proxied: false },
  ],
}

describe("Cloudflare's zone", () => {
  it("keeps the functions, Vercel's paths and the router's requests out of the cache", () => {
    const expression = cacheExpression()
    for (const prefix of ["/mcp", "/api/", "/_vercel/", "/.well-known/"])
      expect(expression).toContain(
        `not starts_with(http.request.uri.path, "${prefix}")`
      )
    expect(BYPASS_PREFIXES).toContain("/_next/")
    expect(expression).toContain(
      `not any(lower(http.request.headers.names[*])[*] eq "rsc")`
    )
    expect(expression).toContain(`not http.request.uri.query contains "_rsc="`)
  })

  it("overrides Vercel's max-age=0 at the edge, never in the browser", () => {
    expect(CACHE_RULE.action_parameters).toMatchObject({
      edge_ttl: { mode: "override_origin" },
      browser_ttl: { mode: "respect_origin" },
    })
  })

  it("limits /mcp per address, and never Claude's or ChatGPT's", () => {
    const [rate] = RATE_RULES
    // The function answers by its own name too (`api/mcp.js`).
    expect(rate.expression).toBe(`http.request.uri.path in {"/mcp" "/api/mcp"}`)
    expect(rate.ratelimit).toMatchObject({ requests_per_period: 10 })
    const skip = FIREWALL_RULES.find((rule) => rule.action === "skip")
    expect(skip).toMatchObject({
      enabled: true,
      expression: `http.request.uri.path in {"/mcp" "/api/mcp"} and ip.src in $${PROVIDERS_LIST}`,
      action_parameters: { phases: ["http_ratelimit"] },
    })
    // The switches exist, off.
    expect(
      FIREWALL_RULES.filter(
        (rule) => rule.action === "block" && rule.expression.includes("/mcp")
      ).map((rule) => rule.enabled)
    ).toEqual([false, false])
  })

  it("blocks the crawlers that send no visitors, never a search engine", () => {
    const rule = FIREWALL_RULES.find((r) => r.ref === "unwanted_crawlers")
    expect(rule).toMatchObject({ action: "block", enabled: true })
    expect(rule?.expression).toContain(
      `lower(http.user_agent) contains "semrushbot"`
    )
    for (const engine of [
      "googlebot",
      "bingbot",
      "applebot",
      "yandex",
      "oai-searchbot",
      "chatgpt-user",
      "claude",
    ])
      expect(rule?.expression).not.toContain(engine)
    // Lowercased, or `contains` on the lowered agent never matches.
    expect(UNWANTED_CRAWLERS.every((a) => a === a.toLowerCase())).toBe(true)
  })

  it("lists the providers as Cloudflare stores them", () => {
    expect(addresses).toEqual(
      [...CLAUDE_EGRESS, "1.2.3.4", "5.6.7.0/24"].sort()
    )
  })

  it("finds nothing to change in a zone that matches, whatever the API adds", () => {
    expect(differences(matching, addresses)).toEqual([])
  })

  it("lists every difference, the records last", () => {
    const state: ZoneState = {
      settings: { ssl: "full", always_use_https: "on" },
      smartTieredCache: "off",
      phases: {},
      list: undefined,
      records: matching.records.map((record) => ({
        ...record,
        proxied: false,
      })),
    }
    expect(differences(state, addresses)).toEqual([
      "setting ssl: full → strict",
      "setting always_use_https: on → off",
      "smart tiered cache: off → on",
      `list ${PROVIDERS_LIST}: create`,
      `http_request_cache_settings ${CACHE_RULE.ref}: create`,
      ...FIREWALL_RULES.map(
        (rule) => `http_request_firewall_custom ${rule.ref}: create`
      ),
      `http_ratelimit ${RATE_RULES[0].ref}: create`,
      "record CNAME mellowcad.com: DNS only → proxied",
      "record CNAME www.mellowcad.com: DNS only → proxied",
    ])
  })

  it("updates a rule that drifted, a stale list, and says when a host has no record", () => {
    const state: ZoneState = {
      ...matching,
      phases: {
        ...matching.phases,
        http_request_cache_settings: [{ ...CACHE_RULE, enabled: false }],
      },
      list: addresses.slice(1),
      records: matching.records.filter((r) => r.name !== "www.mellowcad.com"),
    }
    expect(differences(state, addresses)).toEqual([
      `list ${PROVIDERS_LIST}: ${addresses.length - 1} → ${addresses.length} addresses`,
      `http_request_cache_settings ${CACHE_RULE.ref}: update`,
      "record www.mellowcad.com: missing",
    ])
  })

  it("replaces its own rules and leaves the others first, as they were", () => {
    const other: Partial<Rule> = {
      id: "x",
      ref: "someone_else",
      expression: "true",
      version: "1",
    }
    const rules = withRules(
      [{ ...FIREWALL_RULES[0], enabled: true }, other],
      FIREWALL_RULES
    )
    expect(rules).toEqual([
      { id: "x", ref: "someone_else", expression: "true" },
      ...FIREWALL_RULES,
    ])
  })
})
