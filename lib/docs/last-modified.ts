import { execFileSync } from "node:child_process"

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
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  }).trim()

/** A commit as the history lists it, newest first. */
interface Commit {
  readonly day: string
  /** Whether it has a parent here: a shallow clone's boundary has none. */
  readonly parented: boolean
}

/** The history read once: the commits, and each file's newest of them. */
interface History {
  readonly commits: readonly Commit[]
  readonly newest: ReadonlyMap<string, number>
  readonly shallow: boolean
}

const histories = new Map<string, History | null>()

/**
 * The whole history in one `git log`, newest first, each commit with the
 * files it changed. WHY one: the sitemap asks for every docs page in every
 * language, and a `git log` apiece was some 2,400 processes, which on
 * Vercel's build machine passed the 60 s a page may take to generate and
 * failed the deploy of 2026-11-15.
 */
function history(root: string): History | null {
  if (histories.has(root)) return histories.get(root) ?? null
  let read: History | null = null
  try {
    const log = git(
      ["-c", "core.quotePath=false", "log", "--no-renames", "--name-only", "--format=%x00%cs %P"],
      root
    )
    const commits: Commit[] = []
    const newest = new Map<string, number>()
    for (const entry of log.split("\0").slice(1)) {
      const [header = "", ...files] = entry.split("\n")
      const [day, ...parents] = header.split(" ").filter(Boolean)
      const index = commits.push({ day, parented: parents.length > 0 }) - 1
      for (const file of files) {
        if (file !== "" && !newest.has(file)) newest.set(file, index)
      }
    }
    read = {
      commits,
      newest,
      shallow: git(["rev-parse", "--is-shallow-repository"], root) === "true",
    }
  } catch {
    read = null
  }
  histories.set(root, read)
  return read
}

/**
 * The day `files` (from the repository's root) last changed in a commit, or
 * `undefined` when the history cannot say: no git, or a shallow clone — as
 * Vercel builds — whose boundary commit is the last one touching them,
 * which claims every older file as its own. A sitemap's `lastmod` is only
 * worth something while it is truthful, so an unknown date is left out.
 */
export function lastCommitDay(files: readonly string[], root = process.cwd()): string | undefined {
  const read = history(root)
  if (read === null) return undefined
  const indices = files.flatMap((file) => read.newest.get(file) ?? [])
  if (indices.length === 0) return undefined
  const last = read.commits[Math.min(...indices)]
  // The boundary of a shallow clone shows no parents: its date is not the files'.
  if (!last.parented && read.shallow) return undefined
  return last.day
}
