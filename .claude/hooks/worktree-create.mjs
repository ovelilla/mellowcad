// WorktreeCreate hook: a session's own checkout (AGENTS.md), made by
// `claude --worktree <name>` or the EnterWorktree tool.
// It replaces Claude Code's own creation, which starts from origin (behind
// the unpushed commits main always holds) and leaves node_modules empty.
// Prints the worktree's path as its last line, as Claude Code expects.
import { execFileSync } from "node:child_process"
import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd()
}

let input = {}
try {
  input = JSON.parse(readFileSync(0, "utf8"))
} catch {
  // No input: the name check below refuses.
}
const name = String(input.name ?? "")
if (!/^[\w.-]+$/.test(name) || name.startsWith(".")) {
  console.error(`worktree-create: refusing the name "${name}"`)
  process.exit(1)
}

// The main tree, wherever the session stands (its own worktree included).
const start = input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const main = dirname(
  resolve(start, git(start, "rev-parse", "--git-common-dir"))
)
const path = join(main, ".claude", "worktrees", name)
const branch = `worktree-${name}`

if (!existsSync(path)) {
  // A worktree whose folder is gone stays registered until pruned.
  git(main, "worktree", "prune")
  const exists = git(main, "branch", "--list", branch) !== ""
  git(
    main,
    "worktree",
    "add",
    ...(exists ? [path, branch] : ["-b", branch, path, "main"])
  )
}
const modules = join(path, "node_modules")
if (!existsSync(modules)) {
  // WHY hard links: npm's workspace links are relative
  // (node_modules/@mellowcad/engine -> ../../cad), so a copy resolves the
  // packages to this worktree's source, where a symlinked node_modules would
  // resolve them to main's. Two seconds and no disk. Copied under another
  // name and renamed, so a copy cut short is never taken for a whole one.
  const partial = `${modules}.partial`
  rmSync(partial, { recursive: true, force: true })
  execFileSync("cp", ["-al", join(main, "node_modules"), partial])
  // What is rewritten in place, which would write through to main's: the
  // caches and npm's hidden lockfile (arborist writes it over its inode).
  // npm ci rebuilds it; every other package file npm replaces whole.
  for (const file of [
    ".package-lock.json",
    ".cache",
    ".vite",
    ".vite-temp",
    ".vitest-cache",
  ]) {
    rmSync(join(partial, file), { recursive: true, force: true })
  }
  renameSync(partial, modules)
}
// AutoCAD's strings and probe outputs, outside git, which the rules cite.
const research = join(path, "research")
if (existsSync(join(main, "research")) && !existsSync(research)) {
  symlinkSync(join(main, "research"), research)
}
console.log(path)
