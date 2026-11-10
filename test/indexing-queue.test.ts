import { spawn, spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

// The session hook's queue of Google indexing requests (docs/next-seo.md §7):
// a session sends the next batch once Google's daily quota has had a day to
// reset, and says nothing when the queue is empty or absent.

const HOOK = path.resolve(
  import.meta.dirname,
  "../.claude/hooks/session-start.mjs"
)
const DAY = 86_400_000

// WHY without GIT_*: inside the commit gate git exports GIT_DIR, and the hook
// would read the real repository's state (test/deps.test.ts).
const isolated = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))
) as NodeJS.ProcessEnv

function run(
  queue?: { pending: string[]; log: Record<string, string> },
  data = mkdtempSync(path.join(tmpdir(), "queue-data-"))
) {
  const repo = mkdtempSync(path.join(tmpdir(), "queue-repo-"))
  if (queue) {
    mkdirSync(path.join(data, "scripts"), { recursive: true })
    writeFileSync(
      path.join(data, "scripts/gsc-request-pending.txt"),
      `${queue.pending.join("\n")}\n`
    )
    writeFileSync(
      path.join(data, "scripts/gsc-request-log.json"),
      JSON.stringify(queue.log)
    )
  }
  return spawnSync("node", [HOOK], {
    input: JSON.stringify({ source: "startup" }),
    encoding: "utf8",
    env: { ...isolated, CLAUDE_PROJECT_DIR: repo, SEO_DATA: data },
  }).stdout
}

const at = (ago: number) => new Date(Date.now() - ago).toISOString()
const pending = ["https://a.test/1", "https://a.test/2", "https://a.test/3"]
const due = () => ({
  [pending[0]]: `requested (not on Google) ${at(2 * DAY)}`,
  [pending[1]]: `quota (not on Google) ${at(DAY + 60_000)}`,
})

describe("the session hook's indexing queue", () => {
  it("says nothing without a queue, or once every URL is requested", () => {
    expect(run()).not.toMatch(/indexing/i)
    const log = Object.fromEntries(
      pending.map((url) => [url, `requested (on Google) ${at(DAY)}`])
    )
    expect(run({ pending, log })).not.toMatch(/indexing/i)
  })

  it("waits a day after the quota stopped the last batch", () => {
    const log = {
      [pending[0]]: `requested (not on Google) ${at(3_600_000)}`,
      [pending[1]]: `quota (not on Google) ${at(3_600_000)}`,
    }
    expect(run({ pending, log })).toMatch(
      /2 URLs wait to be submitted to Google for indexing until its daily quota resets/
    )
  })

  it("sends the next batch once the day has passed", () => {
    const log = {
      [pending[0]]: `requested (not on Google) ${at(2 * DAY)}`,
      [pending[1]]: `quota (not on Google) ${at(DAY + 60_000)}`,
    }
    expect(run({ pending, log })).toMatch(
      /Indexing requests due: 2 URLs still to submit to Google/
    )
  })

  it("leaves a batch being sent to the session holding its lock", async () => {
    const data = mkdtempSync(path.join(tmpdir(), "queue-data-"))
    mkdirSync(path.join(data, "scripts"))
    const lock = path.join(data, "scripts/.batch.lock")
    const batch = spawn("flock", ["-o", lock, "sleep", "10"], {
      stdio: "ignore",
    })
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(run({ pending, log: due() }, data)).toMatch(
        /Another session is sending today's batch/
      )
      batch.kill()
      await new Promise((resolve) => batch.on("exit", resolve))
      expect(run({ pending, log: due() }, data)).toMatch(
        /Indexing requests due/
      )
    } finally {
      batch.kill()
    }
  })
})
