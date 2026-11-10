// InstructionsLoaded hook: one line per rule Claude Code loads, so the
// knowledge can be weighed by use (docs/plans/knowledge-audit.md §2.1). Claude
// Code does not fire it for AGENTS.md, which every session reads anyway.
// Written in the main tree, shared by every worktree; never in git.
// `npm run knowledge:loads` reads it.
import { execFileSync } from "node:child_process"
import { appendFileSync, mkdirSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

try {
  const input = JSON.parse(readFileSync(0, "utf8"))
  const cwd = input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
  const common = execFileSync("git", ["rev-parse", "--git-common-dir"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim()
  const main = dirname(resolve(cwd, common))
  const top = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim()
  const inRepo = (file) =>
    typeof file === "string" ? relative(top, file) : undefined
  const log = join(main, ".claude", "logs", "instructions.jsonl")
  mkdirSync(dirname(log), { recursive: true })
  appendFileSync(
    log,
    JSON.stringify({
      at: new Date().toISOString(),
      session: input.session_id,
      file: inRepo(input.file_path),
      reason: input.load_reason,
      trigger: inRepo(input.trigger_file_path),
    }) + "\n"
  )
} catch {
  // A log never blocks a session.
}
