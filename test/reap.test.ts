import { describe, expect, it } from "vitest"
import {
  encodeProjectDir,
  findDeferredWork,
  findReactivated,
  getLastEntryMs,
  parseProcStart,
  selectTargets,
} from "../.claude/hooks/reap.mjs"

// The conversation cleanup (.claude/hooks/reap.mjs): it closes only what it
// read and verified, and keeps everything else.
const ROOT = "/home/dev/projects/mellowcad"
const NOW = Date.parse("2026-11-17T20:00:00Z")
const MINUTE = 60_000
const ARCHIVED_ID = "archived-session"

type SessionOverrides = {
  registry?: Record<string, unknown> | null
  procStart?: string | null
  hasBash?: boolean
  transcript?: Record<string, unknown>
  activityMs?: number
}

// An archived extension conversation of this project, idle for 30 min,
// nothing pending.
const makeSession = (overrides: SessionOverrides = {}) => ({
  pid: 4242,
  registry:
    overrides.registry === null
      ? null
      : {
          pid: 4242,
          sessionId: ARCHIVED_ID,
          cwd: ROOT,
          entrypoint: "claude-vscode",
          status: "idle",
          procStart: "1778090",
          startedAt: NOW - 60 * MINUTE,
          statusUpdatedAt: NOW - 30 * MINUTE,
          ...overrides.registry,
        },
  procStart:
    overrides.procStart === undefined ? "1778090" : overrides.procStart,
  hasBash: overrides.hasBash ?? false,
  transcript: {
    exists: true,
    dirExists: true,
    deferred: [],
    ...overrides.transcript,
  },
  activityMs: overrides.activityMs ?? NOW - 30 * MINUTE,
})

const decide = (
  session: ReturnType<typeof makeSession>,
  options: { archived?: Set<string> | null; selfPids?: Set<number> } = {}
) => {
  const { targets, kept } = selectTargets({
    now: NOW,
    root: ROOT,
    selfPids: options.selfPids ?? new Set([1, 3164]),
    archived:
      options.archived === undefined
        ? new Set([ARCHIVED_ID])
        : options.archived,
    sessions: [session],
  })
  return targets.length > 0
    ? { close: true, reason: targets[0].reason }
    : { close: false, reason: kept[0].reason }
}

describe("selectTargets", () => {
  it("closes an archived conversation idle for 5 min or more", () => {
    expect(decide(makeSession({ activityMs: NOW - 5 * MINUTE }))).toEqual({
      close: true,
      reason: "archived",
    })
  })

  it("keeps an archived conversation idle for less than 5 min", () => {
    expect(decide(makeSession({ activityMs: NOW - 4 * MINUTE }))).toEqual({
      close: false,
      reason: "recently archived",
    })
  })

  it("closes an empty conversation idle for 10 min, which never had a turn", () => {
    const session = makeSession({
      registry: {
        sessionId: "empty",
        startedAt: NOW - 20 * MINUTE,
        statusUpdatedAt: NOW - 20 * MINUTE + 2000,
      },
      transcript: { exists: false },
      activityMs: NOW - 20 * MINUTE + 2000,
    })
    expect(decide(session)).toEqual({ close: true, reason: "empty" })
  })

  it("keeps an empty conversation idle for less than 10 min", () => {
    const session = makeSession({
      registry: {
        startedAt: NOW - 9 * MINUTE,
        statusUpdatedAt: NOW - 9 * MINUTE,
      },
      transcript: { exists: false },
      activityMs: NOW - 9 * MINUTE,
    })
    expect(decide(session).reason).toBe("recent empty")
  })

  it("keeps a conversation without transcript whose status moved after start", () => {
    const session = makeSession({ transcript: { exists: false } })
    expect(decide(session).reason).toBe("no transcript but turns")
  })

  it("keeps a conversation without transcript when the project folder is missing", () => {
    const session = makeSession({
      transcript: { exists: false, dirExists: false },
    })
    expect(decide(session).reason).toBe("unreadable project folder")
  })

  it.for([
    [{ registry: null }, "unreadable registry"],
    [{ registry: { entrypoint: "cli" } }, "not the extension's"],
    [{ registry: { cwd: "/home/dev/projects/nubigest" } }, "other project"],
    [{ registry: { cwd: `${ROOT}-copy` } }, "other project"],
    [{ procStart: null }, "unverified registry"],
    [{ procStart: "999" }, "unverified registry"],
    [{ registry: { status: "busy" } }, "busy"],
    [{ hasBash: true }, "background task"],
    [{ transcript: { deferred: null } }, "unreadable transcript"],
    [
      { transcript: { deferred: ["Agent", "CronCreate"] } },
      "deferred work (Agent, CronCreate)",
    ],
  ] as const)("keeps %o: %s", ([overrides, reason]) => {
    expect(decide(makeSession(overrides as SessionOverrides))).toEqual({
      close: false,
      reason,
    })
  })

  it("closes a conversation in a worktree of the project", () => {
    const session = makeSession({
      registry: { cwd: `${ROOT}/.claude/worktrees/feature` },
    })
    expect(decide(session).close).toBe(true)
  })

  it("keeps its own conversation, even while its registry is half written", () => {
    const own = { selfPids: new Set([4242]) }
    expect(decide(makeSession(), own).reason).toBe("own")
    expect(decide(makeSession({ registry: null }), own).reason).toBe("own")
  })

  it("keeps an archived-looking conversation when VS Code's state was unreadable", () => {
    expect(decide(makeSession(), { archived: null }).reason).toBe(
      "unreadable VS Code state"
    )
  })

  it("keeps an open conversation however long it idles", () => {
    expect(
      decide(makeSession({ activityMs: NOW - 24 * 60 * MINUTE }), {
        archived: new Set(),
      }).reason
    ).toBe("open")
  })
})

const toolUseLine = (
  timestamp: string,
  name: string,
  input: Record<string, unknown> = {}
) =>
  JSON.stringify({
    type: "assistant",
    timestamp,
    message: { content: [{ type: "tool_use", name, input }] },
  })

describe("findDeferredWork", () => {
  const startedAt = Date.parse("2026-11-17T19:00:00Z")

  it("finds in-process work since the process started", () => {
    const transcript = [
      toolUseLine("2026-11-17T19:01:00Z", "Read", { file_path: "a" }),
      toolUseLine("2026-11-17T19:02:00Z", "Agent", { run_in_background: true }),
      toolUseLine("2026-11-17T19:03:00Z", "Monitor"),
      toolUseLine("2026-11-17T19:04:00Z", "CronCreate"),
      toolUseLine("2026-11-17T19:05:00Z", "ScheduleWakeup"),
      toolUseLine("2026-11-17T19:06:00Z", "Bash", { run_in_background: true }),
    ].join("\n")
    expect(findDeferredWork(transcript, startedAt)).toEqual([
      "Agent",
      "Monitor",
      "CronCreate",
      "ScheduleWakeup",
      "Bash",
    ])
  })

  it("ignores foreground calls and calls from an earlier process", () => {
    const transcript = [
      toolUseLine("2026-11-17T18:59:00Z", "Monitor"),
      toolUseLine("2026-11-17T19:01:00Z", "Agent", { prompt: "x" }),
      toolUseLine("2026-11-17T19:02:00Z", "Bash", { command: "ls" }),
      JSON.stringify({ type: "attachment", text: '"tool_use"' }),
    ].join("\n")
    expect(findDeferredWork(transcript, startedAt)).toEqual([])
  })

  it("throws on a tool call line it cannot parse, so the caller keeps the process", () => {
    expect(() => findDeferredWork('{"type":"tool_use",', startedAt)).toThrow()
  })
})

describe("parseProcStart", () => {
  it("reads field 22 when the command name holds spaces and parentheses", () => {
    const fields = Array.from({ length: 50 }, (_, index) => String(index + 3))
    expect(parseProcStart(`489763 (node (Main) x) ${fields.join(" ")}`)).toBe(
      "22"
    )
  })
})

describe("encodeProjectDir", () => {
  it("matches the folder names Claude Code writes", () => {
    expect(encodeProjectDir("/home/oveli/projects/mellowcad")).toBe(
      "-home-oveli-projects-mellowcad"
    )
    expect(encodeProjectDir("/tmp/claude-1000/-home-x/f356.probe")).toBe(
      "-tmp-claude-1000--home-x-f356-probe"
    )
  })
})

describe("findReactivated", () => {
  const candidate = (sessionId: string) => ({
    sessionId,
    transcriptPath: `/t/${sessionId}.jsonl`,
    reason: "archived",
  })
  const passes = [
    { at: 1000, candidates: [candidate("a"), candidate("b")] },
    { at: 2000, candidates: [candidate("a"), candidate("c")] },
  ]

  it("reports the candidates whose activity moved after they were first flagged", () => {
    const activity: Record<string, number> = { a: 1500, b: 900, c: 2500 }
    expect(
      findReactivated(passes, ({ sessionId }) => activity[sessionId]).map(
        ({ sessionId, flaggedAt }) => [sessionId, flaggedAt]
      )
    ).toEqual([
      ["a", 1000],
      ["c", 2000],
    ])
  })

  it("treats an unknown activity as none", () => {
    expect(findReactivated(passes, () => null)).toEqual([])
  })
})

describe("getLastEntryMs", () => {
  it("ignores the undated lines a process writes when it exits", () => {
    const transcript = [
      JSON.stringify({
        timestamp: "2026-11-17T20:28:30.890Z",
        type: "assistant",
      }),
      JSON.stringify({ timestamp: "2026-11-17T20:20:00.000Z", type: "user" }),
      JSON.stringify({ type: "last-prompt" }),
      JSON.stringify({ totalCostUSD: 1, type: "cost-state" }),
      '{"timestamp": "2026-11-17T23:',
    ].join("\n")
    expect(getLastEntryMs(transcript)).toBe(
      Date.parse("2026-11-17T20:28:30.890Z")
    )
  })

  it("answers null for a transcript without dated entries", () => {
    expect(getLastEntryMs(JSON.stringify({ type: "cost-state" }))).toBeNull()
  })
})
