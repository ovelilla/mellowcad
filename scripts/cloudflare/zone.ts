/**
 * Cloudflare in front of Vercel for mellowcad.com, as code: the zone's
 * settings the site depends on, its rules, the providers' address list and
 * the proxied records (`.claude/rules/cloudflare.md`).
 *
 *   npm run cloudflare                  # what differs from below; nothing changes
 *   npm run cloudflare -- --apply       # makes the zone match
 *   npm run cloudflare -- --purge       # empties the cache (CI does it per deploy)
 *
 * The token is MELLOWCAD_CLOUDFLARE_TOKEN, scoped to this zone (and the
 * account's lists): the shell's CLOUDFLARE_API_TOKEN is another project's.
 */

import { isDeepStrictEqual } from "node:util"
import { fileURLToPath } from "node:url"

export const ZONE = "mellowcad.com"
const API = "https://api.cloudflare.com/client/v4"

/**
 * Cloudflare connects to Vercel over HTTPS and checks its certificate: with
 * Flexible, Vercel's redirect to HTTPS loops. Always Use HTTPS stays off, as
 * Vercel's own redirect does the job and Let's Encrypt must reach
 * `/.well-known/acme-challenge/` over plain HTTP to renew Vercel's certificate.
 */
export const SETTINGS = { ssl: "strict", always_use_https: "off" } as const

/** One request to Vercel per URL and TTL, not one per Cloudflare data centre. */
export const SMART_TIERED_CACHE = "on"

/** The records that serve the site; mail and verification records stay DNS-only. */
export const PROXIED_HOSTS = [ZONE, `www.${ZONE}`]

/**
 * What Cloudflare must never keep: the functions, Vercel's measurements and
 * its validation paths, Next's own assets (they carry their own year-long
 * headers, which Cloudflare's default caching already respects), and the
 * router's requests — Cloudflare ignores `Vary`, so a request with an `RSC`
 * header would leave the router's payload cached under the page's URL.
 */
export const BYPASS_PREFIXES = [
  "/mcp",
  "/api/",
  "/_vercel/",
  "/_next/",
  "/.well-known/",
]

export function cacheExpression(prefixes = BYPASS_PREFIXES): string {
  return [
    `http.host in {"${ZONE}" "www.${ZONE}"}`,
    ...prefixes.map(
      (prefix) => `not starts_with(http.request.uri.path, "${prefix}")`
    ),
    `not any(lower(http.request.headers.names[*])[*] eq "rsc")`,
    `not http.request.uri.query contains "_rsc="`,
  ].join(" and ")
}

/** Every page is prerendered and changes only with a deploy, whose CI job purges. */
export const EDGE_TTL_SECONDS = 7 * 24 * 60 * 60

export interface Rule {
  ref: string
  description?: string
  expression: string
  action: string
  action_parameters?: Record<string, unknown>
  ratelimit?: Record<string, unknown>
  enabled: boolean
  [field: string]: unknown
}

export const CACHE_RULE: Rule = {
  ref: "mellowcad_prerendered_pages",
  description:
    "Prerendered pages: a week at the edge, purged by each production deploy",
  expression: cacheExpression(),
  action: "set_cache_settings",
  action_parameters: {
    cache: true,
    // WHY override: Vercel sends `max-age=0, must-revalidate` on every page.
    edge_ttl: { mode: "override_origin", default: EDGE_TTL_SECONDS },
    browser_ttl: { mode: "respect_origin" },
  },
  enabled: true,
}

/**
 * Claude's and ChatGPT's egress: all their users leave through these, so a
 * limit per address must never count them. Claude's from
 * platform.claude.com/docs/en/api/ip-addresses; ChatGPT's is read live.
 */
export const CLAUDE_EGRESS = ["160.79.104.0/21", "153.61.208.0/20"]
export const CHATGPT_EGRESS = "https://openai.com/chatgpt-connectors.json"
export const PROVIDERS_LIST = "mcp_providers"

const MCP = `http.request.uri.path eq "/mcp"`

/**
 * Crawlers that never send a visitor: SEO tools' backlink indexes, training
 * crawlers, scrapers. WHY at the edge and not only in `robots.txt`: each of
 * their requests is a cache miss read from Vercel's ISR storage, the team's
 * Hobby reads were past their million on 20/11/2026 (`docs/next-vercel-usage.md`),
 * a block costs Vercel nothing, and robots.txt needs a deploy and a day to be
 * reread. Search engines and the AI ones that cite their sources stay
 * (Googlebot, bingbot, Applebot, YandexBot, OAI-SearchBot, Exa, Keenable…).
 */
export const UNWANTED_CRAWLERS = [
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "blexbot",
  "dataforseobot",
  "reflectionbot",
  "amazonbot",
  "bytespider",
  "ccbot",
  "gptbot",
  "meta-externalagent",
  "fontscanbot",
  "kaupr",
]

export const crawlerExpression = (agents = UNWANTED_CRAWLERS) =>
  `(${agents.map((agent) => `lower(http.user_agent) contains "${agent}"`).join(" or ")})`

/**
 * WHY here and not in Vercel's firewall: behind Cloudflare, Vercel sees
 * Cloudflare's addresses (Verified Proxy Lite keeps no client IP), so its
 * per-IP limit on /mcp stopped counting anyone (measured 18/11/2026: 14 in a
 * row through Cloudflare all 200, straight to Vercel 429 from the 11th).
 * Vercel's rules stay, for whoever calls its address directly. The two
 * switches are Vercel's, off until needed (`mcp.md`).
 */
export const FIREWALL_RULES: Rule[] = [
  {
    ref: "mcp_off",
    description: "Switch: /mcp off for everyone",
    expression: MCP,
    action: "block",
    enabled: false,
  },
  {
    ref: "mcp_providers_only",
    description: "Switch: /mcp for Claude and ChatGPT only",
    expression: `${MCP} and not ip.src in $${PROVIDERS_LIST}`,
    action: "block",
    enabled: false,
  },
  {
    ref: "mcp_providers_unlimited",
    description: "Claude and ChatGPT skip the per-address limit on /mcp",
    expression: `${MCP} and ip.src in $${PROVIDERS_LIST}`,
    action: "skip",
    action_parameters: { phases: ["http_ratelimit"] },
    enabled: true,
  },
  {
    ref: "unwanted_crawlers",
    description: "Crawlers that send no visitors, kept off Vercel's ISR reads",
    expression: crawlerExpression(),
    action: "block",
    enabled: true,
  },
]

/**
 * Free allows one rule, a 10-second period and a 10-second block, counted per
 * data centre: 10 calls in 10 s, against Vercel's 10 in 60 s, as close as Free
 * gets.
 */
export const RATE_RULES: Rule[] = [
  {
    ref: "mcp_rate",
    description: "/mcp: 10 requests per 10 s per address",
    expression: MCP,
    action: "block",
    ratelimit: {
      characteristics: ["ip.src", "cf.colo.id"],
      period: 10,
      requests_per_period: 10,
      mitigation_timeout: 10,
    },
    enabled: true,
  },
]

export const PHASES: Record<string, Rule[]> = {
  http_request_cache_settings: [CACHE_RULE],
  http_request_firewall_custom: FIREWALL_RULES,
  http_ratelimit: RATE_RULES,
}

/** The fields of a rule that decide what it does. */
const effect = (rule: Partial<Rule>) => ({
  expression: rule.expression,
  action: rule.action,
  action_parameters: rule.action_parameters,
  ratelimit: rule.ratelimit,
  enabled: rule.enabled,
})

export const sameRule = (a: Partial<Rule>, b: Partial<Rule>) =>
  isDeepStrictEqual(effect(a), effect(b))

/** A phase's rules with ours in place of any earlier copy, others untouched and first. */
export function withRules(
  current: readonly Partial<Rule>[],
  ours: readonly Rule[]
): Partial<Rule>[] {
  const refs = new Set(ours.map((rule) => rule.ref))
  const kept = current
    .filter((rule) => !refs.has(rule.ref ?? ""))
    // The API refuses the fields it computes on the way back in.
    .map((rule) =>
      Object.fromEntries(
        Object.entries(rule).filter(
          ([field]) => field !== "version" && field !== "last_updated"
        )
      )
    )
  return [...kept, ...ours.map((rule) => ({ ...rule }))]
}

/** An address as a list stores it: Cloudflare keeps a single host without its prefix length. */
export const asListed = (ip: string) => ip.replace(/\/(32|128)$/, "")

/** The providers' addresses, as listed, sorted and once each. */
export function providerAddresses(chatgpt: {
  prefixes: { ipv4Prefix?: string; ipv6Prefix?: string }[]
}): string[] {
  const listed = chatgpt.prefixes.flatMap(
    (prefix) => prefix.ipv4Prefix ?? prefix.ipv6Prefix ?? []
  )
  return [...new Set([...CLAUDE_EGRESS, ...listed].map(asListed))].sort()
}

export interface ZoneState {
  settings: Record<string, string>
  smartTieredCache: string
  phases: Record<string, Partial<Rule>[]>
  list: string[] | undefined
  records: { id: string; name: string; type: string; proxied: boolean }[]
}

/** What `--apply` would change, in order: the records last, once the rest holds. */
export function differences(
  state: ZoneState,
  addresses: readonly string[]
): string[] {
  const out: string[] = []
  for (const [name, value] of Object.entries(SETTINGS)) {
    if (state.settings[name] !== value)
      out.push(`setting ${name}: ${state.settings[name]} → ${value}`)
  }
  if (state.smartTieredCache !== SMART_TIERED_CACHE)
    out.push(
      `smart tiered cache: ${state.smartTieredCache} → ${SMART_TIERED_CACHE}`
    )
  if (!state.list) out.push(`list ${PROVIDERS_LIST}: create`)
  else if (!isDeepStrictEqual([...state.list].sort(), [...addresses]))
    out.push(
      `list ${PROVIDERS_LIST}: ${state.list.length} → ${addresses.length} addresses`
    )
  for (const [phase, ours] of Object.entries(PHASES)) {
    const current = state.phases[phase] ?? []
    for (const rule of ours) {
      const found = current.find((candidate) => candidate.ref === rule.ref)
      if (!found || !sameRule(found, rule))
        out.push(`${phase} ${rule.ref}: ${found ? "update" : "create"}`)
    }
  }
  for (const host of PROXIED_HOSTS) {
    const served = state.records.filter(
      (record) =>
        record.name === host && ["A", "AAAA", "CNAME"].includes(record.type)
    )
    if (served.length === 0) out.push(`record ${host}: missing`)
    for (const record of served.filter((record) => !record.proxied))
      out.push(`record ${record.type} ${host}: DNS only → proxied`)
  }
  return out
}

function token(): string {
  const value = process.env.MELLOWCAD_CLOUDFLARE_TOKEN
  if (!value)
    throw new Error(
      "MELLOWCAD_CLOUDFLARE_TOKEN is not set (~/.config/mcp-keys.env)"
    )
  return value
}

interface Envelope<T> {
  success: boolean
  errors: { code: number; message: string }[]
  result: T
  result_info?: { cursors?: { after?: string } }
}

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
  allow: number[] = []
): Promise<Envelope<T> | undefined> {
  const response = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const envelope = (await response.json()) as Envelope<T>
  if (allow.includes(response.status)) return undefined
  if (!envelope.success)
    throw new Error(
      `${init.method ?? "GET"} ${path}: ${envelope.errors.map((e) => `${e.code} ${e.message}`).join("; ")}`
    )
  return envelope
}

const call = async <T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
  allow: number[] = []
) => (await request<T>(path, init, allow))?.result

interface Ids {
  zone: string
  account: string
}

async function ids(): Promise<Ids> {
  const zones = await call<{ id: string; account: { id: string } }[]>(
    `/zones?name=${ZONE}`
  )
  if (!zones?.length) throw new Error(`The token does not see ${ZONE}`)
  return { zone: zones[0].id, account: zones[0].account.id }
}

async function providersList(account: string) {
  const lists = await call<{ id: string; name: string }[]>(
    `/accounts/${account}/rules/lists`
  )
  return lists?.find((list) => list.name === PROVIDERS_LIST)
}

async function listItems(account: string, list: string): Promise<string[]> {
  const items: string[] = []
  let cursor: string | undefined
  do {
    const page = await request<{ ip: string }[]>(
      `/accounts/${account}/rules/lists/${list}/items?per_page=500${cursor ? `&cursor=${cursor}` : ""}`
    )
    items.push(...(page?.result ?? []).map((item) => item.ip))
    cursor = page?.result_info?.cursors?.after
  } while (cursor)
  return items
}

async function read({ zone, account }: Ids): Promise<ZoneState> {
  const settings: Record<string, string> = {}
  for (const name of Object.keys(SETTINGS)) {
    const setting = await call<{ value: string }>(
      `/zones/${zone}/settings/${name}`
    )
    settings[name] = setting!.value
  }
  const tiered = await call<{ value: string }>(
    `/zones/${zone}/cache/tiered_cache_smart_topology_enable`
  )
  const phases: ZoneState["phases"] = {}
  for (const phase of Object.keys(PHASES)) {
    // No entry point yet is a 404: no rules.
    const entry = await call<{ rules?: Partial<Rule>[] }>(
      `/zones/${zone}/rulesets/phases/${phase}/entrypoint`,
      {},
      [404]
    )
    phases[phase] = entry?.rules ?? []
  }
  const list = await providersList(account)
  const records = await call<ZoneState["records"]>(
    `/zones/${zone}/dns_records?per_page=100`
  )
  return {
    settings,
    smartTieredCache: tiered!.value,
    phases,
    list: list ? await listItems(account, list.id) : undefined,
    records: records ?? [],
  }
}

async function fetchAddresses(): Promise<string[]> {
  const response = await fetch(CHATGPT_EGRESS)
  if (!response.ok)
    throw new Error(`${CHATGPT_EGRESS} answered ${response.status}`)
  return providerAddresses(await response.json())
}

/** A list's replacement runs in the background: wait for it before a rule names it. */
async function syncList(account: string, addresses: readonly string[]) {
  const list =
    (await providersList(account)) ??
    (await call<{ id: string }>(`/accounts/${account}/rules/lists`, {
      method: "POST",
      body: {
        name: PROVIDERS_LIST,
        kind: "ip",
        description:
          "Claude's and ChatGPT's egress (scripts/cloudflare/zone.ts)",
      },
    }))!
  const operation = await call<{ operation_id: string }>(
    `/accounts/${account}/rules/lists/${list.id}/items`,
    { method: "PUT", body: addresses.map((ip) => ({ ip })) }
  )
  for (let tries = 0; tries < 30; tries++) {
    const status = await call<{ status: string; error?: string }>(
      `/accounts/${account}/rules/lists/bulk_operations/${operation!.operation_id}`
    )
    if (status!.status === "completed") return
    if (status!.status === "failed") throw new Error(`List: ${status!.error}`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error("The list's replacement did not finish in 30 s")
}

async function apply(
  { zone, account }: Ids,
  state: ZoneState,
  addresses: readonly string[]
) {
  for (const [name, value] of Object.entries(SETTINGS)) {
    if (state.settings[name] !== value)
      await call(`/zones/${zone}/settings/${name}`, {
        method: "PATCH",
        body: { value },
      })
  }
  if (state.smartTieredCache !== SMART_TIERED_CACHE)
    await call(`/zones/${zone}/cache/tiered_cache_smart_topology_enable`, {
      method: "PATCH",
      body: { value: SMART_TIERED_CACHE },
    })
  if (!state.list || !isDeepStrictEqual([...state.list].sort(), [...addresses]))
    await syncList(account, addresses)
  for (const [phase, ours] of Object.entries(PHASES)) {
    const current = state.phases[phase] ?? []
    const stale = ours.some((rule) => {
      const found = current.find((candidate) => candidate.ref === rule.ref)
      return !found || !sameRule(found, rule)
    })
    if (stale)
      await call(`/zones/${zone}/rulesets/phases/${phase}/entrypoint`, {
        method: "PUT",
        body: { rules: withRules(current, ours) },
      })
  }
  // Last: traffic reaches Cloudflare only once the rest is in place.
  for (const record of state.records) {
    if (
      PROXIED_HOSTS.includes(record.name) &&
      ["A", "AAAA", "CNAME"].includes(record.type) &&
      !record.proxied
    )
      await call(`/zones/${zone}/dns_records/${record.id}`, {
        method: "PATCH",
        body: { proxied: true },
      })
  }
}

async function main() {
  const where = await ids()
  if (process.argv.includes("--purge")) {
    await call(`/zones/${where.zone}/purge_cache`, {
      method: "POST",
      body: { purge_everything: true },
    })
    console.log(`Purged everything in ${ZONE}`)
    return
  }
  const addresses = await fetchAddresses()
  const state = await read(where)
  const changes = differences(state, addresses)
  if (changes.length === 0) {
    console.log(`${ZONE} matches scripts/cloudflare/zone.ts`)
    return
  }
  for (const change of changes) console.log(`  ${change}`)
  if (!process.argv.includes("--apply")) {
    console.log("\nNothing changed. To apply: npm run cloudflare -- --apply")
    return
  }
  await apply(where, state, addresses)
  const left = differences(await read(where), addresses)
  console.log(
    left.length ? `Still different:\n  ${left.join("\n  ")}` : "Applied"
  )
  if (left.length) process.exitCode = 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
