/**
 * The dependency review's report (`npm run deps:check`, skill deps-review):
 * every direct dependency of the root, the workspaces and the examples, the
 * MCP servers pinned in `.mcp.json`, the workflows' actions and Node, against
 * the newest stable release past the quarantine of `.npmrc`; the advisories
 * of `npm audit`; and what `docs/deps-review.json` deferred or accepted. It
 * reads the registry itself because `npm outdated --workspaces` stops at
 * ENOVERSIONS while a package of ours is younger than the quarantine.
 *
 * Read-only, network needed, exit 0: a report, not a gate.
 */

import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  type Bump,
  bumpOf,
  compareVersions,
  isStable,
  parseVersion,
  satisfies,
} from "./versions.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const STATE = "docs/deps-review.json"
const DAY_MS = 86_400_000
const ACCEPTANCE_DAYS = 180
const UNMAINTAINED_DAYS = 365
const CONCURRENCY = 8
const BLOCKERS_SHOWN = 3
const CITING = [
  "AGENTS.md",
  "README.md",
  "cad/README.md",
  "packages/*/README.md",
  ".claude",
  "docs",
]
const MCP_CONFIGS = [".mcp.json", ".vscode/mcp.json"]
const DEPENDENCY_FIELDS = ["dependencies", "devDependencies"] as const

export type ReviewState = {
  lastReview: string
  intervalDays: number
  deferred: { name: string; version: string; reason: string }[]
  acceptedAdvisories: { id: string; reason: string; date: string }[]
  keptUnmaintained: { name: string; reason: string; date: string }[]
}

type Manifest = {
  name?: string
  workspaces?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}
type Use = { where: string; spec: string }
type Dependency = { name: string; current: string; uses: Use[] }
type Packument = {
  "dist-tags"?: { latest?: string }
  time?: Record<string, string>
  repository?: { url?: string } | string
  versions?: Record<string, { deprecated?: string }>
}
type Advisory = {
  id: string
  title: string
  severity: string
  packages: Set<string>
  runtime: boolean
}

const read = (file: string) => readFileSync(join(ROOT, file), "utf8")
const readJson = <T>(file: string) => JSON.parse(read(file)) as T
const daysSince = (date: string) =>
  Math.floor((Date.now() - Date.parse(date)) / DAY_MS)
const day = (date: string | undefined) => date?.slice(0, 10) ?? "?"

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  })
  return result.stdout ?? ""
}

function workspaces(root: Manifest) {
  return (root.workspaces ?? []).flatMap((pattern) =>
    pattern.endsWith("/*")
      ? readdirSync(join(ROOT, pattern.slice(0, -2))).map(
          (folder) => `${pattern.slice(0, -1)}${folder}`
        )
      : [pattern]
  )
}

function installedVersion(dir: string, name: string) {
  for (const base of [dir, "."]) {
    const file = join(base, "node_modules", name, "package.json")
    if (existsSync(join(ROOT, file)))
      return readJson<{ version: string }>(file).version
  }
  return null
}

// An example is not installed: its range's floor is what it asks for.
function floorOf(spec: string) {
  const parts = spec
    .replace(/^[\^~>=<\s]+/, "")
    .trim()
    .split(".")
  return [0, 1, 2].map((index) => parts[index] ?? "0").join(".")
}

function directDependencies() {
  const root = readJson<Manifest>("package.json")
  const ours = new Set(
    workspaces(root).map(
      (dir) => readJson<Manifest>(`${dir}/package.json`).name
    )
  )
  const examples = readdirSync(join(ROOT, "examples")).map(
    (folder) => `examples/${folder}`
  )
  const found = new Map<string, Dependency>()
  for (const dir of [".", ...workspaces(root), ...examples]) {
    const file = dir === "." ? "package.json" : `${dir}/package.json`
    if (!existsSync(join(ROOT, file))) continue
    const manifest = readJson<Manifest>(file)
    for (const field of DEPENDENCY_FIELDS) {
      for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
        if (ours.has(name) || !/^[\^~>=<\s]*\d/.test(spec)) continue
        const current =
          installedVersion(dir, name) ??
          (dir.startsWith("examples/") ? floorOf(spec) : null)
        if (!current) continue
        const entry = found.get(name) ?? { name, current, uses: [] }
        if (
          compareVersions(
            parseVersion(current)!,
            parseVersion(entry.current)!
          ) < 0
        )
          entry.current = current
        entry.uses.push({ where: `${file} ${field}`, spec })
        found.set(name, entry)
      }
    }
  }
  for (const config of MCP_CONFIGS) {
    if (!existsSync(join(ROOT, config))) continue
    for (const [, name, version] of read(config).matchAll(
      /"((?:@[\w.-]+\/)?[\w.-]+)@(\d+\.\d+\.\d+)"/g
    )) {
      const entry = found.get(name) ?? { name, current: version, uses: [] }
      entry.uses.push({ where: `${config} (npx)`, spec: version })
      found.set(name, entry)
    }
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name))
}

async function packument(name: string) {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${name.replace("/", "%2F")}`
    )
    return response.ok ? ((await response.json()) as Packument) : null
  } catch {
    return null
  }
}

async function mapLimited<T, R>(items: T[], map: (item: T) => Promise<R>) {
  const results: R[] = []
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await map(items[index])
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return results
}

function changelog(meta: Packument) {
  const url =
    typeof meta.repository === "string" ? meta.repository : meta.repository?.url
  const github = url?.match(
    /(?:github\.com[/:]|^github:)([\w.-]+\/[\w.-]+?)(?:\.git)?(?:#.*)?$/
  )
  return github ? `https://github.com/${github[1]}/releases` : null
}

// Who in the installed tree declares a peer range the new version misses.
function peerBlockers(name: string, version: string) {
  const lock = readJson<{
    packages: Record<
      string,
      { version?: string; peerDependencies?: Record<string, string> }
    >
  }>("package-lock.json")
  const blockers = new Map<string, string[]>()
  for (const [path, entry] of Object.entries(lock.packages)) {
    const range = entry.peerDependencies?.[name]
    if (!range || satisfies(version, range)) continue
    const holder = `${path.replace(/^.*node_modules\//, "") || "mellowcad"}@${entry.version ?? "?"}`
    blockers.set(range, [...(blockers.get(range) ?? []), holder])
  }
  return [...blockers].map(([range, holders]) => {
    const shown = [...new Set(holders)]
    const more = shown.length - BLOCKERS_SHOWN
    return `${shown.slice(0, BLOCKERS_SHOWN).join(", ")}${more > 0 ? ` and ${more} more` : ""} want ${range}`
  })
}

function citations(name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")
  const out = run("git", [
    "grep",
    "-l",
    "-E",
    `(\`${escaped}[\` @]|\\*\\*${escaped} )`,
    "--",
    ...CITING,
  ])
  return out.split("\n").filter(Boolean)
}

function audit(omitDev: boolean) {
  const args = ["audit", "--json", ...(omitDev ? ["--omit=dev"] : [])]
  try {
    return JSON.parse(run("npm", args)) as {
      vulnerabilities?: Record<
        string,
        { via: (string | { url: string; title: string; severity: string })[] }
      >
    }
  } catch {
    return null
  }
}

function advisories() {
  const all = audit(false)
  const runtime = audit(true)
  if (!all) return null
  const runtimeIds = new Set(
    Object.values(runtime?.vulnerabilities ?? {}).flatMap(({ via }) =>
      via.flatMap((v) => (typeof v === "string" ? [] : v.url.split("/").pop()!))
    )
  )
  const found = new Map<string, Advisory>()
  for (const [name, { via }] of Object.entries(all.vulnerabilities ?? {})) {
    for (const v of via) {
      if (typeof v === "string") continue
      const id = v.url.split("/").pop()!
      const entry = found.get(id) ?? {
        id,
        title: v.title,
        severity: v.severity,
        packages: new Set<string>(),
        runtime: runtimeIds.has(id),
      }
      entry.packages.add(name)
      found.set(id, entry)
    }
  }
  return [...found.values()]
}

function actions() {
  const dir = ".github/workflows"
  const uses = new Map<string, Set<string>>()
  for (const file of readdirSync(join(ROOT, dir))) {
    for (const [, action, ref] of read(`${dir}/${file}`).matchAll(
      /uses:\s*([\w.-]+\/[\w.-]+)@(\S+)/g
    )) {
      uses.set(
        `${action}@${ref}`,
        (uses.get(`${action}@${ref}`) ?? new Set()).add(file)
      )
    }
  }
  return [...uses].map(([use, files]) => {
    const [action, ref] = use.split("@")
    const latest = run("gh", [
      "api",
      `repos/${action}/releases/latest`,
      "--jq",
      ".tag_name",
    ]).trim()
    const behind =
      latest && Number(latest.match(/\d+/)?.[0]) > Number(ref.match(/\d+/)?.[0])
    return `  ${use} (${[...files].join(", ")}): latest ${latest || "unknown (gh failed)"}${behind ? "  ← a new major" : ""}`
  })
}

async function node() {
  const ci = read(".github/workflows/ci.yml").match(
    /node-version:\s*(\d+)/
  )?.[1]
  const index = await fetch("https://nodejs.org/dist/index.json")
    .then(
      (response) =>
        response.json() as Promise<
          {
            version: string
            lts: string | false
            security: boolean
            date: string
          }[]
        >
    )
    .catch(() => null)
  const local = process.version
  if (!index) return [`  local ${local}, CI ${ci}: nodejs.org did not answer`]
  const major = local.match(/^v(\d+)/)![1]
  const ours = index.filter(({ version }) => version.startsWith(`v${major}.`))
  const newer = ours.filter(
    ({ version }) =>
      compareVersions(parseVersion(version)!, parseVersion(local)!) > 0
  )
  const lts = index.find(({ lts }) => lts)
  return [
    `  local ${local}, CI ${ci}.x; newest ${major}.x ${ours[0]?.version ?? "?"}${newer.some(({ security }) => security) ? "  ← a security release: install it now" : ""}`,
    `  newest LTS: ${lts?.version} (${lts?.lts}, ${lts?.date})`,
  ]
}

async function main() {
  process.chdir(ROOT)
  const state = readJson<ReviewState>(STATE)
  const quarantine = Number(
    read(".npmrc").match(/^\s*min-release-age\s*=\s*(\d+)/m)?.[1] ?? 0
  )
  const dependencies = directDependencies()
  const metas = await mapLimited(dependencies, ({ name }) => packument(name))
  const age = daysSince(state.lastReview)
  const lines = [
    `Dependency review, ${new Date().toISOString().slice(0, 10)}: ${dependencies.length} direct dependencies, quarantine of ${quarantine} days (.npmrc).`,
    `Last review ${state.lastReview}, ${age} days ago; every ${state.intervalDays}${age >= state.intervalDays ? ": due" : ""}.`,
  ]

  const found = advisories()
  const accepted = new Map(
    state.acceptedAdvisories.map((entry) => [entry.id, entry])
  )
  lines.push("", "## Security (npm audit)")
  if (!found) lines.push("  npm audit failed: run it by hand")
  else if (found.length === 0) lines.push("  none")
  for (const advisory of found ?? []) {
    const acceptance = accepted.get(advisory.id)
    const note = !acceptance
      ? "  ← analyse it (skill deps-review, section 1)"
      : daysSince(acceptance.date) > ACCEPTANCE_DAYS
        ? `  ← accepted ${acceptance.date}, over ${ACCEPTANCE_DAYS} days: weigh it again`
        : `  accepted ${acceptance.date}: ${acceptance.reason}`
    lines.push(
      `  ${advisory.id} (${advisory.severity}, ${advisory.runtime ? "RUNTIME" : "dev"}) ${[...advisory.packages].join(", ")}: ${advisory.title}${note}`
    )
  }
  const present = new Set(found?.map(({ id }) => id))
  for (const { id } of state.acceptedAdvisories)
    if (found && !present.has(id))
      lines.push(`  ${id}: accepted, but gone from the audit: drop the entry`)

  const deferred = new Map(state.deferred.map((entry) => [entry.name, entry]))
  const updates: Record<Bump, string[]> = { major: [], minor: [], patch: [] }
  const quarantined: string[] = []
  const flagged: string[] = []
  const now = Date.now()
  dependencies.forEach((dependency, index) => {
    const meta = metas[index]
    const current = parseVersion(dependency.current)!
    if (!meta?.time) {
      flagged.push(`  ${dependency.name}: the registry did not answer`)
      return
    }
    const stable = Object.keys(meta.versions ?? {})
      .filter(isStable)
      .map((version) => ({ version, parsed: parseVersion(version)! }))
      .sort((a, b) => compareVersions(b.parsed, a.parsed))
    const aged = stable.filter(
      ({ version }) =>
        now - Date.parse(meta.time![version] ?? "") >= quarantine * DAY_MS
    )
    const newer = aged.filter(
      ({ parsed }) => compareVersions(parsed, current) > 0
    )
    const targets = [
      newer[0],
      newer.find(({ parsed }) => bumpOf(current, parsed) !== "major"),
    ].filter((target, i, all) => target && all.indexOf(target) === i)
    for (const target of targets) {
      const bump = bumpOf(current, target!.parsed)!
      const { name } = dependency
      const deferral = deferred.get(name)
      const blockers = peerBlockers(name, target!.version)
      const cited = citations(name)
      const url = meta && changelog(meta)
      updates[bump].push(
        [
          `  ${name} ${dependency.current} → ${target!.version}  [${dependency.uses.map(({ where, spec }) => `${where} ${spec}`).join("; ")}]`,
          url && `      changelog: ${url}`,
          `      diff:      npm diff --diff=${name}@${dependency.current} --diff=${name}@${target!.version}`,
          blockers.length > 0 &&
            `      peers:     ${blockers.join("; ")} (move them together, or wait)`,
          cited.length > 0 && `      cited by:  ${cited.join(", ")}`,
          deferral &&
            (compareVersions(target!.parsed, parseVersion(deferral.version)!) >
            0
              ? `      deferred at ${deferral.version} (${deferral.reason}); ${target!.version} is newer: study it again`
              : bump === "major" && `      deferred: ${deferral.reason}`),
        ]
          .filter(Boolean)
          .join("\n")
      )
    }
    const young = stable.filter(
      ({ parsed, version }) =>
        compareVersions(parsed, current) > 0 &&
        !aged.some((a) => a.version === version)
    )
    for (const pending of new Set([
      young[0],
      young.find(({ parsed }) => bumpOf(current, parsed) !== "major"),
    ]))
      if (pending)
        quarantined.push(
          `  ${dependency.name} ${pending.version} (${day(meta.time[pending.version])})`
        )
    const deprecated = meta.versions?.[dependency.current]?.deprecated
    if (deprecated)
      flagged.push(
        `  ${dependency.name} ${dependency.current} deprecated: ${deprecated}`
      )
    const latest = stable[0]
    const kept = state.keptUnmaintained.find(
      ({ name }) => name === dependency.name
    )
    if (latest && daysSince(meta.time[latest.version]) > UNMAINTAINED_DAYS)
      flagged.push(
        `  ${dependency.name}: no stable release since ${day(meta.time[latest.version])}${
          !kept
            ? "  ← weigh it (skill deps-review, section 3)"
            : daysSince(kept.date) > ACCEPTANCE_DAYS
              ? `  ← kept ${kept.date}, over ${ACCEPTANCE_DAYS} days: weigh it again`
              : `  kept ${kept.date}: ${kept.reason}`
        }`
      )
  })
  lines.push("", "## Deferred")
  if (state.deferred.length === 0) lines.push("  none")
  for (const { name, version, reason } of state.deferred) {
    lines.push(`  ${name} ${version}: ${reason}`)
    const dependency = dependencies.find((d) => d.name === name)
    if (
      dependency &&
      compareVersions(
        parseVersion(dependency.current)!,
        parseVersion(version)!
      ) >= 0
    )
      lines.push(
        `  ${name}: deferred at ${version}, but installed: drop the entry`
      )
  }

  for (const bump of ["major", "minor", "patch"] as const) {
    lines.push(
      "",
      `## Updates: ${bump}`,
      ...(updates[bump].length ? updates[bump] : ["  none"])
    )
  }
  lines.push(
    "",
    `## In quarantine (younger than ${quarantine} days: the next review)`,
    ...(quarantined.length ? quarantined : ["  none"]),
    "",
    "## Deprecated or unmaintained",
    ...(flagged.length ? flagged : ["  none"]),
    "",
    "## GitHub Actions",
    ...actions(),
    "",
    "## Node",
    ...(await node())
  )
  console.log(lines.join("\n"))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
