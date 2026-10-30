import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

import type { ReviewState } from "../scripts/deps/check.ts"
import { bumpOf, parseVersion, satisfies } from "../scripts/deps/versions.ts"

// The dependency review's state and the hook that enforces it (skill
// deps-review): a deferral or an acceptance that no longer names anything
// fails here, so docs/deps-review.json cannot drift into fiction.

const ROOT = path.resolve(import.meta.dirname, "..")
const HOOK = path.join(ROOT, ".claude/hooks/session-start.mjs")

const readJson = <T>(file: string) =>
  JSON.parse(readFileSync(path.join(ROOT, file), "utf8")) as T

type Manifest = Record<
  "dependencies" | "devDependencies",
  Record<string, string> | undefined
>

const MANIFESTS = [
  "package.json",
  "cad/package.json",
  "packages/editor/package.json",
  "packages/react/package.json",
]
const direct = new Set(
  MANIFESTS.flatMap((file) => {
    const manifest = readJson<Manifest>(file)
    return Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
    })
  })
)
const installed = (name: string) =>
  existsSync(path.join(ROOT, "node_modules", name, "package.json"))
    ? readJson<{ version: string }>(`node_modules/${name}/package.json`).version
    : null

const state = readJson<ReviewState>("docs/deps-review.json")
const DATE = /^\d{4}-\d{2}-\d{2}$/

describe("the dependency review's state", () => {
  it("is dated, and not in the future", () => {
    expect(state.lastReview).toMatch(DATE)
    expect(Date.parse(state.lastReview)).toBeLessThanOrEqual(Date.now())
    expect(state.intervalDays).toBeGreaterThan(0)
  })

  it("defers only direct dependencies, to versions not yet installed", () => {
    const stale = state.deferred.flatMap(({ name, version, reason }) => {
      if (!direct.has(name)) return [`${name}: not a direct dependency`]
      const current = installed(name)
      if (!reason) return [`${name}: no reason`]
      return current &&
        bumpOf(parseVersion(current)!, parseVersion(version)!) === null
        ? [`${name}: deferred at ${version}, ${current} installed: drop it`]
        : []
    })
    expect(stale).toEqual([])
  })

  it("accepts advisories and unmaintained packages with a reason and a date", () => {
    const broken = [
      ...state.acceptedAdvisories.flatMap(({ id, reason, date }) =>
        /^GHSA(-[\da-z]{4}){3}$/.test(id) && reason && DATE.test(date)
          ? []
          : [id]
      ),
      ...state.keptUnmaintained.flatMap(({ name, reason, date }) =>
        direct.has(name) && reason && DATE.test(date) ? [] : [name]
      ),
    ]
    expect(broken).toEqual([])
  })
})

describe("the review's version arithmetic", () => {
  it("reads a bump as npm's caret does, 0.x included", () => {
    const bump = (a: string, b: string) =>
      bumpOf(parseVersion(a)!, parseVersion(b)!)
    expect(bump("9.39.5", "10.13.0")).toBe("major")
    expect(bump("16.4.2", "16.4.3")).toBe("patch")
    expect(bump("1.59.0", "1.62.0")).toBe("minor")
    expect(bump("0.2.4", "0.3.0")).toBe("major")
    expect(bump("0.23.2", "0.23.4")).toBe("patch")
    expect(bump("0.0.3", "0.0.4")).toBe("major")
    expect(bump("1.0.0", "1.0.0")).toBeNull()
  })

  it.each([
    ["5.9.3", ">=4.8.4 <6.1.0", true],
    ["7.0.2", ">=4.8.4 <6.1.0", false],
    ["10.13.0", "^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7", false],
    ["9.39.5", "^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7", true],
    ["8.0.9", "^7.0.0-0", false],
    ["0.3.0", "^0.2.4", false],
    ["0.2.9", "^0.2.4", true],
    ["16.9.0", "<=16", true],
    ["17.0.0", "<=16", false],
    ["16.5.0", "1.2 - 16.4", false],
    ["4.1.0", "4.x", true],
    ["4.1.12", "4.1.12", true],
    ["4.1.12", "~4.0.1", false],
    ["2.0.0", "*", true],
  ])("%s satisfies %s: %s", (version, range, expected) => {
    expect(satisfies(version, range)).toBe(expected)
  })
})

describe("the session hook", () => {
  // WHY: the commit gate runs this suite inside git's pre-commit hook, which
  // exports GIT_DIR and GIT_INDEX_FILE: inherited, the scratch repo's
  // `git init` and commits land in the real repository (it once set
  // core.bare and committed the staged change as "start").
  const isolated = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))
  ) as NodeJS.ProcessEnv

  function run(source: string, lastReview: string, claim = false) {
    const dir = mkdtempSync(path.join(tmpdir(), "deps-hook-"))
    mkdirSync(path.join(dir, "docs"))
    writeFileSync(
      path.join(dir, "docs/deps-review.json"),
      JSON.stringify({
        lastReview,
        intervalDays: 7,
        deferred: [],
        acceptedAdvisories: [],
      })
    )
    const git = (...args: string[]) =>
      spawnSync("git", args, { cwd: dir, env: isolated })
    git("init", "-q", "-b", "main")
    git(
      "-c",
      "user.name=t",
      "-c",
      "user.email=t@t",
      "commit",
      "-q",
      "--allow-empty",
      "-m",
      "start"
    )
    if (claim) git("branch", "deps-review")
    return spawnSync("node", [HOOK], {
      input: JSON.stringify({ source }),
      encoding: "utf8",
      env: { ...isolated, CLAUDE_PROJECT_DIR: dir },
    }).stdout
  }
  const today = new Date().toISOString().slice(0, 10)

  it("says nothing of a review that is not due", () => {
    expect(run("startup", today)).not.toMatch(/Dependency review/)
  })

  it("puts a due review before the task of a new session", () => {
    expect(run("startup", "2026-01-01")).toMatch(
      /Do it before the task you are given/
    )
  })

  it("leaves it until the task is committed in a resumed one", () => {
    expect(run("compact", "2026-01-01")).toMatch(
      /as soon as the current task is committed/
    )
  })

  it("leaves it to the session whose branch claims it", () => {
    expect(run("startup", "2026-01-01", true)).toMatch(
      /Another session holds it/
    )
  })
})
