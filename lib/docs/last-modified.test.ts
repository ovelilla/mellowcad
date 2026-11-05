import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { lastCommitDay } from "./last-modified"

// WHY: inside the commit hook git exports GIT_DIR and GIT_INDEX_FILE, which
// would send these commands to the real repository (`testing.md`).
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
) as NodeJS.ProcessEnv
const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function repo(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "last-modified-"))
  dirs.push(dir)
  return dir
}

function run(cwd: string, ...args: string[]) {
  execFileSync("git", args, { cwd, env, stdio: "ignore" })
}

function commit(cwd: string, file: string, day: string) {
  writeFileSync(path.join(cwd, file), day)
  run(cwd, "add", file)
  const date = `${day}T12:00:00Z`
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", file], {
    cwd,
    env: { ...env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
    stdio: "ignore",
  })
}

describe("lastCommitDay", () => {
  it("is the day of the last commit that touched the files", () => {
    const dir = repo()
    run(dir, "init", "-q")
    commit(dir, "a.md", "2026-10-01")
    commit(dir, "b.md", "2026-10-02")
    commit(dir, "a.md", "2026-10-03")
    expect(lastCommitDay(["b.md"], dir)).toBe("2026-10-02")
    expect(lastCommitDay(["a.md", "b.md"], dir)).toBe("2026-10-03")
    expect(lastCommitDay(["none.md"], dir)).toBeUndefined()
  })

  it("leaves a date out where a shallow clone cannot know it", () => {
    const origin = repo()
    run(origin, "init", "-q")
    commit(origin, "old.md", "2026-09-01")
    commit(origin, "new.md", "2026-10-01")
    commit(origin, "newer.md", "2026-10-02")
    const clone = repo()
    run(clone, "clone", "-q", "--depth=2", `file://${origin}`, ".")
    expect(lastCommitDay(["newer.md"], clone)).toBe("2026-10-02")
    // The boundary commit holds every file it did not change itself.
    expect(lastCommitDay(["old.md"], clone)).toBeUndefined()
  })

  it("is unknown outside a repository", () => {
    expect(lastCommitDay(["a.md"], repo())).toBeUndefined()
  })
})
