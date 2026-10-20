// SessionStart hook: injects the repo state, so a session notices other
// sessions' work in the tree and files a chat checkpoint reverted in silence,
// and picks up an agreed brief. Plain-text stdout becomes context.
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const MAX_STATUS_LINES = 20
const DEPS_REVIEW_DAYS = 30

function git(...args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim()
  } catch {
    return null
  }
}

function source() {
  try {
    return JSON.parse(readFileSync(0, "utf8")).source ?? "startup"
  } catch {
    return "startup"
  }
}

function briefs() {
  try {
    return readdirSync(join(ROOT, "docs")).filter((name) =>
      /^next-.+\.md$/.test(name)
    )
  } catch {
    return []
  }
}

const lines = [`Repo state (SessionStart hook, ${source()}):`]

const branch = git("rev-parse", "--abbrev-ref", "HEAD")
const lastCommit = git("log", "-1", "--format=%h %s (%cr)")
const unpushed = git("rev-list", "--count", "@{u}..HEAD")
lines.push(
  `- Branch ${branch ?? "?"}; last commit ${lastCommit ?? "?"}; ${unpushed ?? "?"} commits not pushed.`
)

const status = git("status", "--short")
if (status === "") {
  lines.push(
    "- Clean tree. If a summary mentions uncommitted changes, they are gone."
  )
} else if (status !== null) {
  const entries = status.split("\n")
  lines.push(
    `- ${entries.length} uncommitted changes. Another session may own them, or a checkpoint reverted files: read \`git diff\` and run \`npm run typecheck\` before answering, and stage only your own work.`,
    ...entries.slice(0, MAX_STATUS_LINES).map((entry) => `  ${entry}`)
  )
  if (entries.length > MAX_STATUS_LINES) {
    lines.push(`  … and ${entries.length - MAX_STATUS_LINES} more.`)
  }
}

// The last review is the last `chore(deps):` commit (skill deps-review).
const lastReview = git(
  "log",
  "-1",
  "--format=%ct",
  "-E",
  "--grep=^chore\\(deps\\):"
)
const days = lastReview
  ? Math.floor((Date.now() / 1000 - Number(lastReview)) / 86400)
  : null
if (days === null || days > DEPS_REVIEW_DAYS) {
  lines.push(
    `- Dependencies ${days === null ? "never reviewed" : `last reviewed ${days} days ago`}: when the task allows, skill deps-review.`
  )
}

const open = briefs()
if (open.length > 0) {
  lines.push(
    `- Agreed briefs in docs/: ${open.join(", ")}. Read the one the task belongs to before starting.`
  )
}

console.log(lines.join("\n"))
