// SessionStart hook: injects the repo state, so a session in the main tree
// moves to its own worktree before editing (AGENTS.md), notices files a chat
// checkpoint reverted in silence, and picks up an agreed brief. It informs;
// the two periodic chores it names are the owner's standing orders, each
// claimed so that two sessions never take one. Plain-text stdout becomes
// context.
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
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

// Google's indexing requests waiting for its daily quota, a queue the owner
// asked sessions to keep without him (2026-11-06): ~/seo-data/scripts holds
// the URLs (gsc-request-pending.txt) and each answer gsc-request.mjs had
// (gsc-request-log.json). Once a day has passed since the quota stopped the
// last batch, the next session sends the next one. No folder, no queue.
function indexingQueue() {
  const dir = join(
    process.env.SEO_DATA ?? join(homedir(), "seo-data"),
    "scripts"
  )
  let pending, log
  try {
    pending = readFileSync(join(dir, "gsc-request-pending.txt"), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    log = JSON.parse(readFileSync(join(dir, "gsc-request-log.json"), "utf8"))
  } catch {
    return null
  }
  const left = pending.filter(
    (url) => !String(log[url] ?? "").startsWith("requested")
  )
  if (left.length === 0) return null
  // The claim: the lock the proposed command takes, held while it runs.
  // Looked up in the queue's own folder, never machine-wide.
  try {
    execFileSync("flock", ["-n", join(dir, ".batch.lock"), "true"], {
      stdio: "ignore",
    })
  } catch {
    return "- Another session is sending today's batch of Google indexing requests (it holds ~/seo-data/scripts/.batch.lock): leave it."
  }
  const stopped = Math.max(
    0,
    ...Object.values(log)
      .map(String)
      .filter((answer) => answer.startsWith("quota"))
      .map((answer) =>
        Date.parse(answer.match(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/)?.[0] ?? "")
      )
      .filter(Number.isFinite)
  )
  const ready = stopped + DAY_MS
  if (Date.now() < ready) {
    const when = new Date(ready).toISOString().slice(0, 16).replace("T", " ")
    return `- ${left.length} URLs wait to be submitted to Google for indexing until its daily quota resets, after ${when} UTC (docs/next-seo.md §7): not yet.`
  }
  return `- Indexing requests due: ${left.length} URLs still to submit to Google (docs/next-seo.md §7). Send the next batch at the start, in the background, as it touches nothing in the repo: start the owner's Chrome as ~/seo-data/scripts/README.md says (ask the owner only if a tab asks to sign in), then \`flock -n .batch.lock sh -c 'node gsc-prioritize.mjs && node gsc-request.mjs gsc-request-pending.txt'\` there (the lock is the claim; the first rebuilds the queue from the live sitemap, by priority; the second stops at the quota); note what is left in §7 with your next commit.`
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
        // The first sentence ends at a period before a space or the end,
        // not at one inside a file name (`docs/next-seo.md`).
        const status = quote.match(/\*\*[^*]+:\*\*\s*(.+?\.)(?=\s|$)/)?.[1]
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

// A linked worktree's git dir is not the common one.
const inMainTree =
  git("rev-parse", "--git-dir") !== null &&
  git("rev-parse", "--path-format=absolute", "--git-dir") ===
    git("rev-parse", "--path-format=absolute", "--git-common-dir")
if (inMainTree) {
  lines.push(
    "- This is the main tree, the owner's: a task that edits moves to its own worktree before the first edit (EnterWorktree; AGENTS.md), and lands on main as skill finish-feature says."
  )
}

const status = git("status", "--short")
if (status === "") {
  lines.push(
    "- Clean tree. If a summary mentions uncommitted changes, they are gone."
  )
} else if (status !== null) {
  const entries = status.split("\n")
  lines.push(
    `- ${entries.length} uncommitted changes. ${inMainTree ? "In the main tree they are the owner's or a session's still working here: leave them" : "A checkpoint may have reverted files: read \`git diff\` and run \`npm run typecheck\` before going on"}.`,
    ...entries.slice(0, MAX_STATUS_LINES).map((entry) => `  ${entry}`)
  )
  if (entries.length > MAX_STATUS_LINES) {
    lines.push(`  … and ${entries.length - MAX_STATUS_LINES} more.`)
  }
}

// Compacting keeps a skill's SKILL.md but drops the files it had you read.
if (session === "compact") {
  lines.push(
    "- Compacted: if a skill's annexes or plan were open (command-review's template.md and annexes, a docs/plans/ file), read them again before going on."
  )
}

const review = depsReview()
if (review) lines.push(review)

const queue = indexingQueue()
if (queue) lines.push(queue)

const open = briefs()
if (open.length > 0) {
  lines.push(
    "- Agreed briefs in docs/; read the one the task belongs to before starting:",
    ...open.map((brief) => `  ${brief}`)
  )
}

console.log(lines.join("\n"))
