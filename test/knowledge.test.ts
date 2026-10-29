import { execFileSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { describe, expect, it } from "vitest"

// The knowledge the agents load — AGENTS.md, the scoped rules, the skills and
// the docs — checked against the repo, so a rename or a deleted file turns the
// sentence that cites it red instead of leaving it to mislead. What it checks
// and how to cite is in .claude/rules/knowledge.md.

// Ratchets: lower them as the knowledge slims down, never raise them to pass.
const ALWAYS_LOADED_MAX_KB = 10
const FILE_MAX_KB = 25
const LOAD_P90_MAX_KB = 52

// Cited on purpose without existing in the repo or a declared package.
const ABSENT_CITATIONS: Record<string, { reason: string; values: string[] }> = {
  "README.md": {
    reason: "written by `vercel env pull`, never by the repo",
    values: ["VERCEL_OIDC_TOKEN"],
  },
  "docs/next-launch.md": {
    reason: "the landing's brief, deleted once it shipped; it is in git",
    values: ["docs/next-landing.md"],
  },
}

const ALWAYS_LOADED = ["AGENTS.md"]
const SOURCE_PATTERN =
  /^(AGENTS\.md|README\.md|cad\/README\.md|\.claude\/(rules\/.+|skills\/[^/]+\/.+)\.md|docs\/.+\.md)$/
// The coverage and the glossary cite AutoCAD's names in code spans, which
// read as symbols; only their paths and scripts are checked.
const SYMBOL_SOURCE_PATTERN = /^(?!docs\/)/
const RULE_PATTERN = /^\.claude\/rules\/.+\.md$/
const SKILL_FOLDER_PATTERN = /^\.claude\/skills\/([^/]+)\//
const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const LOAD_SCOPE_PATTERN =
  /^(app|cad|components|content|i18n|lib|messages|packages|scripts|test)\/.+\.(ts|tsx|mjs|css|json)$/
const TEXT_PATTERN = /\.(ts|tsx|mjs|cjs|js|json|css|sh|yml|txt)$/
const LIBRARY_FILE_PATTERN = /\.([cm]?[jt]sx?)$/

const CODE_SPAN = /`([^`]+)`/g
const FENCE = /^\s*```/
const NPM_SCRIPT = /\bnpm run ([\w:.-]+(?: -w [\w/-]+)?)/g
const PLACEHOLDER = /[<>…$]|:\/\//
const GLOB_CHARS = /[*?{]/
const SYMBOL_PATTERNS = [
  /^[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*$/,
  /^[A-Z][a-z0-9]+[A-Z][a-zA-Z0-9]*$/,
  /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/,
]
const VERIFIED_PACKAGE =
  /\*\*(@?[a-z][\w.-]*(?:\/[a-z][\w.-]*)?) (\d+\.\d+\.\d+)\*\*/g
const PATH_SUFFIXES = ["", ".ts", ".tsx", ".mjs", ".json", ".md"]
const LIBRARY_CACHE = "node_modules/.cache/knowledge/library-words.json"

const kilobytes = (text: string) => Buffer.byteLength(text) / 1024

const repoFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" }
)
  .split("\n")
  .filter((file) => file !== "" && existsSync(file))

const roots = new Set(repoFiles.map((file) => file.split("/")[0]))
const sources = repoFiles.filter((file) => SOURCE_PATTERN.test(file))
const read = (file: string) => readFileSync(file, "utf8")

// Claude Code reads `paths:` globs as picomatch does: `[locale]` is a
// character class and `(app)` a group, so neither matches the folder of that
// name. Rules write `app/*/*app*/**` instead, and `bracketsIn` refuses both.
function globToRegExp(glob: string) {
  let source = ""
  let braces = 0
  for (let i = 0; i < glob.length; i++) {
    const rest = glob.slice(i)
    if (rest.startsWith("**/")) {
      source += "(?:[^/]+/)*"
      i += 2
    } else if (rest.startsWith("**")) {
      source += ".*"
      i += 1
    } else if (glob[i] === "*") source += "[^/]*"
    else if (glob[i] === "?") source += "[^/]"
    else if (glob[i] === "{") {
      braces++
      source += "(?:"
    } else if (glob[i] === "}" && braces > 0) {
      braces--
      source += ")"
    } else if (glob[i] === "," && braces > 0) source += "|"
    else source += glob[i].replace(/[.+^$()|[\]\\]/g, "\\$&")
  }
  return new RegExp(`^${source}$`)
}

const bracketsIn = (glob: string) => /[[\]()]/.test(glob)

function frontmatter(content: string) {
  const block = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ""
  const field = (name: string) =>
    block
      .match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, "")
  const paths = block.match(/^paths:\s*\n((?:\s+-\s+.+\n?)+)/m)?.[1]
  return {
    description: field("description"),
    name: field("name"),
    paths: paths
      ?.split("\n")
      .map((line) => line.replace(/^\s+-\s+/, "").trim())
      .filter(Boolean)
      .map((glob) => glob.replace(/^["']|["']$/g, "")),
  }
}

// The header is everything before the first `##`: a rule declares there the
// packages whose symbols it cites, with the version it was verified against.
function verifiedPackages(content: string) {
  const header = content.split(/^## /m)[0]
  return [...header.matchAll(VERIFIED_PACKAGE)].map(([, name, version]) => ({
    name,
    version,
  }))
}

type Citation = {
  kind: "path" | "script" | "symbol"
  line: number
  value: string
}

function citations(content: string): Citation[] {
  const found: Citation[] = []
  let fenced = false
  content.split("\n").forEach((text, index) => {
    const line = index + 1
    const scripts = (part: string) =>
      [...part.matchAll(NPM_SCRIPT)].forEach(([, value]) =>
        found.push({ kind: "script", line, value })
      )
    if (FENCE.test(text)) {
      fenced = !fenced
      return
    }
    if (fenced) {
      scripts(text)
      return
    }
    for (const [, span] of text.matchAll(CODE_SPAN)) {
      scripts(span)
      for (const token of span.split(/\s+/)) {
        const value = pathOf(token)
        if (value) found.push({ kind: "path", line, value })
      }
      span
        .replace(/\(\)$/, "")
        .split(".")
        .filter((part) => SYMBOL_PATTERNS.some((pattern) => pattern.test(part)))
        .forEach((value) => found.push({ kind: "symbol", line, value }))
    }
  })
  return found
}

function pathOf(token: string) {
  const trimmed = token
    .replace(/^["'(]+|["'),.;]+$/g, "")
    .replace(/:\d+(-\d+)?$/, "")
  const value = trimmed.startsWith("@/") ? trimmed.slice(2) : trimmed
  const [root] = value.split("/")
  const isRepoPath =
    roots.has(root) && (value.includes("/") || roots.has(value))
  return isRepoPath && !PLACEHOLDER.test(value)
    ? value.replace(/\/$/, "")
    : null
}

function pathExists(value: string) {
  if (GLOB_CHARS.test(value)) {
    const pattern = globToRegExp(value)
    return repoFiles.some((file) => pattern.test(file))
  }
  return PATH_SUFFIXES.some((suffix) => existsSync(value + suffix))
}

function installedVersion(name: string) {
  const file = join("node_modules", name, "package.json")
  return existsSync(file)
    ? (JSON.parse(read(file)) as { version: string }).version
    : null
}

function wordsOf(text: string, into: Set<string>) {
  for (const [word] of text.matchAll(/[$\w]+/g)) into.add(word)
}

const repoWords = (() => {
  const words = new Set<string>()
  for (const file of repoFiles) {
    if (TEXT_PATTERN.test(file) && file !== "package-lock.json") {
      wordsOf(read(file), words)
    }
  }
  // Browser and language APIs, which rules cite as often as our own symbols.
  const lib = "node_modules/typescript/lib"
  for (const file of readdirSync(lib)) {
    if (/^lib\..*\.d\.ts$/.test(file)) wordsOf(read(join(lib, file)), words)
  }
  return words
})()

// A package's words are cached by version: walking `next` takes seconds.
function libraryWords(name: string, version: string) {
  const key = `${name}@${version}`
  let cache: Record<string, string[]> = {}
  try {
    cache = JSON.parse(read(LIBRARY_CACHE)) as Record<string, string[]>
  } catch {}
  if (cache[key]) return new Set(cache[key])
  const words = new Set<string>()
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (entry === "node_modules") continue
      if (statSync(path).isDirectory()) walk(path)
      else if (LIBRARY_FILE_PATTERN.test(entry)) wordsOf(read(path), words)
    }
  }
  walk(join("node_modules", name))
  cache[key] = [...words]
  mkdirSync(dirname(LIBRARY_CACHE), { recursive: true })
  writeFileSync(LIBRARY_CACHE, JSON.stringify(cache))
  return words
}

type Manifest = { scripts?: Record<string, string>; workspaces?: string[] }
const manifest = (dir: string) =>
  JSON.parse(read(join(dir, "package.json"))) as Manifest
// A workspace's script is cited with its folder, `npm run build -w cad`;
// `packages/*` is each folder in packages/.
const workspaces = (manifest(".").workspaces ?? []).flatMap((workspace) =>
  workspace.endsWith("/*")
    ? readdirSync(workspace.slice(0, -2)).map(
        (folder) => `${workspace.slice(0, -1)}${folder}`
      )
    : [workspace]
)
const scripts = new Set([
  ...Object.keys(manifest(".").scripts ?? {}),
  ...workspaces.flatMap((workspace) =>
    Object.keys(manifest(workspace).scripts ?? {}).map(
      (name) => `${name} -w ${workspace}`
    )
  ),
])

const rules = sources
  .filter((file) => RULE_PATTERN.test(file))
  .map((file) => ({ file, ...frontmatter(read(file)) }))

describe("the agents' knowledge", () => {
  it("cites paths, npm scripts and symbols that exist", () => {
    const broken: string[] = []
    for (const file of sources) {
      const content = read(file)
      const packages = verifiedPackages(content).filter(
        ({ name }) => installedVersion(name) !== null
      )
      const absent = new Set(ABSENT_CITATIONS[file]?.values)
      const known = (word: string) =>
        repoWords.has(word) ||
        packages.some(({ name }) =>
          libraryWords(name, installedVersion(name)!).has(word)
        )
      for (const { kind, line, value } of citations(content)) {
        if (absent.has(value)) continue
        const ok =
          kind === "path"
            ? pathExists(value)
            : kind === "script"
              ? scripts.has(value)
              : !SYMBOL_SOURCE_PATTERN.test(file) || known(value)
        if (!ok) broken.push(`${file}:${line} ${kind} ${value}`)
      }
    }
    expect(broken).toEqual([])
  })

  it("lists in ABSENT_CITATIONS only what is still cited", () => {
    const stale = Object.entries(ABSENT_CITATIONS).flatMap(
      ([file, { values }]) => {
        const cited = existsSync(file)
          ? new Set(citations(read(file)).map(({ value }) => value))
          : new Set<string>()
        return values
          .filter((value) => !cited.has(value))
          .map((v) => `${file} ${v}`)
      }
    )
    expect(stale).toEqual([])
  })

  it("verifies its library claims against the installed versions", () => {
    const stale = sources.flatMap((file) =>
      verifiedPackages(read(file))
        .filter(({ name, version }) => installedVersion(name) !== version)
        .map(
          ({ name, version }) =>
            `${file}: ${name} ${version}, installed ${installedVersion(name) ?? "none"} — re-verify the rule, then update its header`
        )
    )
    expect(stale).toEqual([])
  })

  it("scopes every rule with paths that match tracked files", () => {
    const broken = rules.flatMap(({ file, paths }) => {
      if (!paths?.length)
        return [`${file}: no paths (it would load in every session)`]
      return paths.flatMap((glob) => {
        if (bracketsIn(glob)) return [`${file}: ${glob} has [ ] or ( ): use *`]
        const pattern = globToRegExp(glob)
        return repoFiles.some((repoFile) => pattern.test(repoFile))
          ? []
          : [`${file}: ${glob} matches no file`]
      })
    })
    expect(broken).toEqual([])
  })

  it("names every skill after its folder and describes it", () => {
    const folders = new Set(
      sources.flatMap((file) => file.match(SKILL_FOLDER_PATTERN)?.[1] ?? [])
    )
    const broken = [...folders].flatMap((folder) => {
      const entry = `.claude/skills/${folder}/SKILL.md`
      if (!existsSync(entry)) return [`${entry}: missing`]
      const { description, name } = frontmatter(read(entry))
      return [
        ...(name === folder && SKILL_NAME_PATTERN.test(folder)
          ? []
          : [`${entry}: name ${name ?? "missing"}`]),
        ...(description ? [] : [`${entry}: no description`]),
      ]
    })
    expect(broken).toEqual([])
  })

  it("keeps within the context budget", () => {
    const over = [
      ...ALWAYS_LOADED.filter(
        (file) => kilobytes(read(file)) > ALWAYS_LOADED_MAX_KB
      ).map((file) => `${file} over ${ALWAYS_LOADED_MAX_KB} KB`),
      ...sources
        .filter((file) => /^\.claude\//.test(file))
        .filter((file) => kilobytes(read(file)) > FILE_MAX_KB)
        .map((file) => `${file} over ${FILE_MAX_KB} KB`),
    ]
    const compiled = rules.map(({ file, paths }) => ({
      kb: kilobytes(read(file)),
      patterns: (paths ?? []).map(globToRegExp),
    }))
    const loads = repoFiles
      .filter((file) => LOAD_SCOPE_PATTERN.test(file))
      .map((file) =>
        compiled
          .filter(({ patterns }) =>
            patterns.some((pattern) => pattern.test(file))
          )
          .reduce((total, { kb }) => total + kb, 0)
      )
      .sort((a, b) => a - b)
    const at = (q: number) =>
      loads[Math.max(0, Math.ceil(q * loads.length) - 1)] ?? 0
    const stats = `rules loaded per source file: median ${at(0.5).toFixed(1)} KB, p90 ${at(0.9).toFixed(1)} KB, max ${(loads.at(-1) ?? 0).toFixed(1)} KB`
    if (process.env.KNOWLEDGE_STATS) console.info(stats)
    if (at(0.9) > LOAD_P90_MAX_KB)
      over.push(`${stats}: p90 over ${LOAD_P90_MAX_KB} KB`)
    expect(over).toEqual([])
  })
})
