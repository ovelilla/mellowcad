// Prints how often each rule was loaded, from the log the InstructionsLoaded
// hook writes (.claude/hooks/instructions-log.mjs): in how many sessions, and
// what loaded it. A rule loaded in every session and one never loaded call
// for different decisions (docs/plans/knowledge-audit.md §2.1).
import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

// The main tree's log, from whichever worktree this runs in.
const common = execFileSync("git", ["rev-parse", "--git-common-dir"], {
  encoding: "utf8",
}).trim()
const LOG = join(dirname(resolve(common)), ".claude/logs/instructions.jsonl")
if (!existsSync(LOG)) {
  console.log(`${LOG}: nothing logged yet.`)
  process.exit(0)
}
const entries = readFileSync(LOG, "utf8")
  .split("\n")
  .flatMap((line) => {
    try {
      return [JSON.parse(line)]
    } catch {
      return [] // a line cut short by two sessions writing at once
    }
  })
const sessions = new Set(entries.map((entry) => entry.session))
const byRule = new Map()
for (const entry of entries) {
  const rule = byRule.get(entry.file) ?? { sessions: new Set(), reasons: {} }
  rule.sessions.add(entry.session)
  rule.reasons[entry.reason] = (rule.reasons[entry.reason] ?? 0) + 1
  byRule.set(entry.file, rule)
}
for (const file of readdirSync(".claude/rules")) {
  const path = `.claude/rules/${file}`
  if (!byRule.has(path)) byRule.set(path, { sessions: new Set(), reasons: {} })
}
const since = entries[0]?.at.slice(0, 10) ?? "?"
console.log(`${sessions.size} sessions since ${since}`)
for (const [file, rule] of [...byRule].sort(
  (a, b) => b[1].sessions.size - a[1].sessions.size
)) {
  const share = sessions.size ? rule.sessions.size / sessions.size : 0
  const reasons = Object.entries(rule.reasons)
    .map(([reason, count]) => `${reason} ${count}`)
    .join(", ")
  console.log(
    `${String(rule.sessions.size).padStart(4)} ${(share * 100).toFixed(0).padStart(3)} %  ${file}${reasons ? `  (${reasons})` : ""}`
  )
}
