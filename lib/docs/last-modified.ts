import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { isAbsolute, join } from "node:path"

// WHY without GIT_*: inside a hook git exports GIT_DIR, which would answer
// for that repository whatever `cwd` says.
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
) as NodeJS.ProcessEnv

const git = (args: string[], cwd: string) =>
  execFileSync("git", args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim()

/**
 * The day `files` (from the repository's root) last changed in a commit, or
 * `undefined` when the history cannot say: no git, or a shallow clone — as
 * Vercel builds — whose boundary commit is the last one touching them,
 * which claims every older file as its own. A sitemap's `lastmod` is only
 * worth something while it is truthful, so an unknown date is left out.
 */
export function lastCommitDay(files: readonly string[], root = process.cwd()): string | undefined {
  try {
    const last = git(["log", "-1", "--format=%H %cs", "--", ...files], root)
    if (!last) return undefined
    const [hash, day] = last.split(" ")
    const shallow = git(["rev-parse", "--git-path", "shallow"], root)
    const boundary = isAbsolute(shallow) ? shallow : join(root, shallow)
    if (existsSync(boundary) && readFileSync(boundary, "utf8").split("\n").includes(hash)) {
      return undefined
    }
    return day
  } catch {
    return undefined
  }
}
