import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(import.meta.dirname, "..")
const SCRIPT = path.join(ROOT, "scripts/vercel/ignore-build.sh")

describe("vercel.json", () => {
  // WHY: Vercel rejects a vercel.json its schema does not take
  // (https://openapi.vercel.sh/vercel.json) and fails every deployment before
  // it builds. An ignoreCommand of 381 characters did so on 2026-11-05; these
  // are the fields the schema caps at 256.
  const CAPPED = [
    "bulkRedirectsPath",
    "buildCommand",
    "devCommand",
    "ignoreCommand",
    "installCommand",
    "outputDirectory",
  ]

  it("keeps every capped field within 256 characters", () => {
    const config = JSON.parse(
      readFileSync(path.join(ROOT, "vercel.json"), "utf8")
    ) as Record<string, unknown>
    for (const field of CAPPED) {
      const value = config[field]
      if (typeof value === "string")
        expect(value.length, field).toBeLessThanOrEqual(256)
    }
  })
})

describe("the deployment's ignore step", () => {
  // WHY: see test/deps.test.ts — inside the pre-commit hook an inherited
  // GIT_DIR would point the scratch repo's git at the real one.
  const isolated = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))
  ) as NodeJS.ProcessEnv

  // The exit code after a commit that changes `changed`: 0 skips the deployment.
  function exitAfter(changed: string[], previous?: string) {
    const dir = mkdtempSync(path.join(tmpdir(), "vercel-ignore-"))
    const git = (...args: string[]) =>
      spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
        cwd: dir,
        env: isolated,
        encoding: "utf8",
      })
    const write = (file: string, text: string) => {
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
      writeFileSync(path.join(dir, file), text)
    }
    git("init", "-q", "-b", "main")
    for (const file of changed) write(file, "before")
    git("add", "-A")
    git("commit", "-q", "--allow-empty", "-m", "deployed")
    const base = git("rev-parse", "HEAD").stdout.trim()
    for (const file of changed) write(file, "after")
    git("add", "-A")
    git("commit", "-q", "-m", "pushed")
    const env: NodeJS.ProcessEnv = { ...isolated }
    if (previous !== "") env.VERCEL_GIT_PREVIOUS_SHA = previous ?? base
    return spawnSync("sh", [SCRIPT], { cwd: dir, env }).status
  }

  it("skips a push that only touches docs/, .claude/ and Markdown", () => {
    expect(
      exitAfter(["docs/next-seo.md", ".claude/rules/seo.md", "README.md"])
    ).toBe(0)
  })

  it("builds a push that touches the site's code", () => {
    expect(exitAfter(["docs/next-seo.md", "app/page.tsx"])).toBe(1)
  })

  it.each([
    "cad/README.md",
    "cad/api.md",
    "cad/docs/languages.md",
    "packages/editor/README.md",
    "packages/react/api.md",
    "packages/editor/docs/embedding.md",
  ])("builds a push that touches %s, a site page", (file) => {
    expect(exitAfter([file])).toBe(1)
  })

  it("builds when the last deployment is unknown or outside the clone", () => {
    expect(exitAfter(["docs/next-seo.md"], "")).toBe(1)
    expect(
      exitAfter(
        ["docs/next-seo.md"],
        "0123456789abcdef0123456789abcdef01234567"
      )
    ).toBe(1)
  })
})
