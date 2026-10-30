// SessionStart hook: injects the repo state, so a session notices other
// sessions' work in the tree and files a chat checkpoint reverted in silence,
// and picks up an agreed brief. Plain-text stdout becomes context.
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const MAX_STATUS_LINES = 20
const DAY_MS = 86_400_000
// The branch the session running the dependency review works on: while it
// exists, the review is taken (skill deps-review).
const DEPS_BRANCH = "deps-review"

function git(...args) {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd()
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

// The weekly dependency review, dated by docs/deps-review.json, which only
// the review's close moves. "When the task allows" let it slip for good: due,
// it comes before the session's task, and one session takes it.
function depsReview() {
  let state
  try {
    state = JSON.parse(
      readFileSync(join(ROOT, "docs", "deps-review.json"), "utf8")
    )
  } catch {
    return "- docs/deps-review.json is unreadable: the dependency review has no date."
  }
  const days = Math.floor((Date.now() - Date.parse(state.lastReview)) / DAY_MS)
  if (!(days >= state.intervalDays)) return null
  const due = `Dependency review due: the last was ${state.lastReview}, ${days} days ago (every ${state.intervalDays})`
  const claimed = git(
    "log",
    "-g",
    "-1",
    "--date=relative",
    "--format=%gd",
    DEPS_BRANCH,
    "--"
  )
  if (claimed) {
    const since = claimed.match(/\{(.+)\}/)?.[1] ?? "?"
    return `- ${due}. Another session holds it (branch ${DEPS_BRANCH}, last moved ${since}): leave the manifests and the lockfile to it. A branch idle for a day was abandoned: read \`git log main..${DEPS_BRANCH}\`, then finish or delete it.`
  }
  return session === "startup" || session === "clear"
    ? `- ${due}. Do it before the task you are given, unless that task only reads: skill deps-review, on branch ${DEPS_BRANCH} in its own worktree (creating the branch claims the review).`
    : `- ${due}: skill deps-review as soon as the current task is committed.`
}

// Each brief with the first sentence of its status line, so a session tells
// one in progress from one not started without opening them all.
function briefs() {
  try {
    return readdirSync(join(ROOT, "docs"))
      .filter((name) => /^next-.+\.md$/.test(name))
      .map((name) => {
        const quote = readFileSync(join(ROOT, "docs", name), "utf8")
          .split("\n")
          .filter((line) => line.startsWith(">"))
          .map((line) => line.replace(/^>\s*/, ""))
          .join(" ")
        const status = quote.match(/\*\*[^*]+:\*\*\s*([^.]+\.)/)?.[1]
        return status ? `${name} (${status})` : name
      })
  } catch {
    return []
  }
}

const session = source()
const lines = [`Repo state (SessionStart hook, ${session}):`]

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

const review = depsReview()
if (review) lines.push(review)

const open = briefs()
if (open.length > 0) {
  lines.push(
    "- Agreed briefs in docs/; read the one the task belongs to before starting:",
    ...open.map((brief) => `  ${brief}`)
  )
}

console.log(lines.join("\n"))
