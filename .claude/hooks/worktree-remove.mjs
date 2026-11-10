// WorktreeRemove hook: the other half of worktree-create.mjs. Claude Code has
// already refused to remove a worktree holding uncommitted work or commits
// main lacks unless told to discard them; this removes the checkout and its
// branch. With a WorktreeCreate hook configured, Claude Code's own removal
// left the branch behind (probe of 2026-11-10).
import { execFileSync } from "node:child_process"
import { readFileSync, rmSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"

function git(cwd, ...args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd()
  } catch {
    return null
  }
}

let input = {}
try {
  input = JSON.parse(readFileSync(0, "utf8"))
} catch {
  process.exit(0)
}
const path = input.worktree_path
if (typeof path !== "string" || !path.includes(join(".claude", "worktrees"))) {
  process.exit(0)
}
const common = git(path, "rev-parse", "--git-common-dir")
const main = common ? dirname(resolve(path, common)) : null
const branch = git(path, "branch", "--show-current")

// The link first, so nothing ever walks into main's research/.
rmSync(join(path, "research"), { force: true })
if (main) {
  git(main, "worktree", "remove", "--force", path)
  // -D: Claude Code asked before discarding unmerged commits.
  if (branch === `worktree-${basename(path)}`) git(main, "branch", "-D", branch)
  git(main, "worktree", "prune")
}
