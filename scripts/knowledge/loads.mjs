// Prints how often each rule was loaded, from the log the InstructionsLoaded
// hook writes (.claude/hooks/instructions-log.mjs): in how many sessions, and
// which files loaded it. A rule loaded in every session and one never loaded
// call for different decisions (docs/next-knowledge-eval.md §3).
// `npm run knowledge:loads -- <rule>` lists every file that loaded that rule.
import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"

// The main tree's log, from whichever worktree this runs in.
const common = execFileSync("git", ["rev-parse", "--git-common-dir"], {
  encoding: "utf8",
}).trim()
const LOG = join(dirname(resolve(common)), ".claude/logs/instructions.jsonl")
if (!existsSync(LOG)) {
  console.log(`${LOG}: nothing logged yet.`)
  process.exit(0)
}
const only = process.argv[2]?.replace(/^(\.claude\/rules\/)?/, "")
const entries = readFileSync(LOG, "utf8")
  .split("\n")
  .flatMap((line) => {
    try {
      return [JSON.parse(line)]
    } catch {
      return [] // a line cut short by two sessions writing at once
    }
  })
// A session whose cwd is a worktree logs the main tree's rule as
// ../../rules/<rule>; one whose cwd is the main tree logs a worktree's file
// under .claude/worktrees/<name>/.
const ruleOf = (file) => basename(file ?? "?")
const inTree = (file) =>
  (file ?? "?").replace(/^\.claude\/worktrees\/[^/]+\//, "")
// A file's area: its folder, two levels deep at most.
const areaOf = (file) => {
  const parts = inTree(file).split("/")
  if (parts.length > 2) return `${parts.slice(0, 2).join("/")}/`
  return parts.length > 1 ? `${parts[0]}/` : parts[0]
}

const sessions = new Set(entries.map((entry) => entry.session))
const byRule = new Map()
for (const entry of entries) {
  const name = ruleOf(entry.file)
  const rule = byRule.get(name) ?? { sessions: new Set(), by: new Map() }
  rule.sessions.add(entry.session)
  const key = only ? inTree(entry.trigger) : areaOf(entry.trigger)
  rule.by.set(key, (rule.by.get(key) ?? new Set()).add(entry.session))
  byRule.set(name, rule)
}
for (const file of readdirSync(".claude/rules"))
  if (!byRule.has(file))
    byRule.set(file, { sessions: new Set(), by: new Map() })

const days = new Set(entries.map((entry) => entry.at.slice(0, 10)))
console.log(
  `${sessions.size} sessions that loaded a rule, on ${days.size} days from ${[...days][0] ?? "?"} to ${[...days].at(-1) ?? "?"}`
)
for (const [name, rule] of [...byRule].sort(
  (a, b) => b[1].sessions.size - a[1].sessions.size
)) {
  if (only && name !== only) continue
  const share = sessions.size ? rule.sessions.size / sessions.size : 0
  const by = [...rule.by]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, only ? Infinity : 4)
    .map(([key, loaded]) => `${key} ${loaded.size}`)
  console.log(
    `${String(rule.sessions.size).padStart(4)} ${(share * 100).toFixed(0).padStart(3)} %  ${name}`
  )
  if (by.length)
    console.log(
      only
        ? by.map((line) => `       ${line}`).join("\n")
        : `       ${by.join(" · ")}`
    )
}
