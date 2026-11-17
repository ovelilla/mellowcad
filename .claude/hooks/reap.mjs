// Closes the claude processes of finished VS Code conversations of this
// project. The extension keeps one process, with its MCP servers, per
// conversation until the window reloads (on 2026-11-17, seven of mellowcad's,
// six idle for 13 h): archiving does not end it. SIGINT ends it with exit code
// 0, so the tab shows no error banner, and its descendants with it; writing in
// the tab again resumes the transcript. Ported from nubigest's reap.mjs, which
// measured all this and ran 48 h in shadow before closing anything.
//
// It fails closed: anything it cannot read or verify keeps the process alive,
// and only archived conversations idle for 5 min and empty ones idle for
// 10 min are closed. An idle one that is not archived may be the one the
// owner returns to. Registry `status` reads `idle` while a background agent,
// a Monitor or a pending cron runs, so the transcript is read too.
//
//   --once [--dry-run] [--trigger <name>] [--quiet]   one pass
//   --report [--hours <n>]                            summary of the log
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeSync,
} from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const CLAUDE_DIR = join(homedir(), ".claude")
const LOG_PATH = join(homedir(), ".local/state/mellowcad/reap.jsonl")
// Reloading the window starts every conversation at once: one pass runs, the
// others do nothing. Node has no flock, hence an exclusive file.
const LOCK_PATH = join(
  process.env.XDG_RUNTIME_DIR ?? `/run/user/${process.getuid?.() ?? 0}`,
  "mellowcad-reap.lock"
)
const LOCK_STALE_MS = 60_000
// The extension keeps archived ids in VS Code's globalState, on the Windows
// side: an internal format, so an unreadable one closes nothing that way.
const VSCODE_STATE_GLOB_PARENT = "/mnt/c/Users"
const VSCODE_STATE_SUFFIX =
  "AppData/Roaming/Code/User/globalStorage/state.vscdb"
const VSCODE_STATE_KEY = "Anthropic.claude-code"
const EXTENSION_ENTRYPOINT = "claude-vscode"
const MINUTE_MS = 60_000
const ARCHIVED_IDLE_MS = 5 * MINUTE_MS
const EMPTY_IDLE_MS = 10 * MINUTE_MS
// An empty conversation never had a turn: its status settles right after start.
const EMPTY_MAX_STATUS_AGE_MS = MINUTE_MS
const EXIT_WAIT_MS = 10_000
const EXIT_POLL_MS = 250
const DEFAULT_REPORT_HOURS = 24
// Work that lives inside the claude process and leaves no busy status. A call
// keeps the process until the window reloads, never paired with its end:
// pairing depends on more of an internal format, and its failure costs work.
const ALWAYS_DEFERRED_TOOLS = new Set([
  "Monitor",
  "CronCreate",
  "ScheduleWakeup",
])
const BACKGROUND_TOOLS = new Set(["Agent", "Task", "Bash"])

/** Claude Code names a project folder after its cwd with every other character as "-". */
const encodeProjectDir = (cwd) => cwd.replace(/[^a-zA-Z0-9]/g, "-")

const isInProject = (cwd, root) => cwd === root || cwd.startsWith(`${root}/`)

/** Field 22 of /proc/<pid>/stat; the comm field may hold spaces and parentheses. */
function parseProcStart(statText) {
  const fields = statText.slice(statText.lastIndexOf(")") + 2).split(" ")
  return fields[19] ?? null
}

/**
 * Deferred-work tool calls made since the process started. Throws on a line it
 * cannot parse, so the caller keeps the process.
 * @param {string} transcript
 * @param {number} startedAtMs
 */
function findDeferredWork(transcript, startedAtMs) {
  const found = []
  for (const line of transcript.split("\n")) {
    if (!line.includes('"tool_use"')) continue
    const entry = JSON.parse(line)
    const content = entry.message?.content
    if (!Array.isArray(content)) continue
    if (Date.parse(entry.timestamp) < startedAtMs) continue
    for (const block of content) {
      if (block.type !== "tool_use") continue
      const isDeferred =
        ALWAYS_DEFERRED_TOOLS.has(block.name) ||
        (BACKGROUND_TOOLS.has(block.name) &&
          block.input?.run_in_background === true)
      if (isDeferred) found.push(block.name)
    }
  }
  return [...new Set(found)]
}

/**
 * The pure decision over a snapshot: the first reason that applies wins, and
 * only the last two branches close anything.
 * @param {{ now: number, root: string, selfPids: Set<number>, archived: Set<string> | null, sessions: any[] }} snapshot
 */
function selectTargets({ now, root, selfPids, archived, sessions }) {
  const targets = []
  const kept = []
  for (const session of sessions) {
    const reason = getKeepReason({ now, root, selfPids, archived, session })
    if (reason.close) targets.push({ session, reason: reason.text })
    else kept.push({ session, reason: reason.text })
  }
  return { targets, kept }
}

const keep = (text) => ({ close: false, text })
const close = (text) => ({ close: true, text })

function getKeepReason({ now, root, selfPids, archived, session }) {
  const { registry, procStart, hasBash, transcript } = session
  // Before the registry: at SessionStart the own registry may still be half
  // written.
  if (selfPids.has(session.pid)) return keep("own")
  if (registry === null) return keep("unreadable registry")
  if (registry.entrypoint !== EXTENSION_ENTRYPOINT) {
    return keep("not the extension's")
  }
  if (!isInProject(registry.cwd, root)) return keep("other project")
  // A recycled pid starts at another time.
  if (procStart === null || procStart !== registry.procStart) {
    return keep("unverified registry")
  }
  if (registry.status !== "idle") return keep("busy")
  if (hasBash) return keep("background task")
  if (transcript.deferred === null) return keep("unreadable transcript")
  if (transcript.deferred.length > 0) {
    return keep(`deferred work (${transcript.deferred.join(", ")})`)
  }

  const idleMs = now - session.activityMs
  if (!transcript.exists) {
    if (!transcript.dirExists) return keep("unreadable project folder")
    if (
      registry.statusUpdatedAt - registry.startedAt >
      EMPTY_MAX_STATUS_AGE_MS
    ) {
      return keep("no transcript but turns")
    }
    return idleMs >= EMPTY_IDLE_MS ? close("empty") : keep("recent empty")
  }
  if (archived === null) return keep("unreadable VS Code state")
  if (!archived.has(registry.sessionId)) return keep("open")
  // Idle counts from the last activity, as the archive keeps no date: one
  // archived by mistake may go at the next pass, and resuming covers it.
  return idleMs >= ARCHIVED_IDLE_MS
    ? close("archived")
    : keep("recently archived")
}

/**
 * Sessions first flagged as candidates whose transcript or status moved later:
 * in shadow mode, each one is a close that would have cut real work.
 * @param {{ at: number, candidates: { sessionId: string, transcriptPath: string }[] }[]} passes
 * @param {(candidate: { sessionId: string, transcriptPath: string }) => number | null} getActivityMs
 */
function findReactivated(passes, getActivityMs) {
  const firstSeen = new Map()
  for (const pass of passes) {
    for (const candidate of pass.candidates) {
      if (!firstSeen.has(candidate.sessionId)) {
        firstSeen.set(candidate.sessionId, { at: pass.at, candidate })
      }
    }
  }
  return [...firstSeen.values()]
    .filter(({ at, candidate }) => (getActivityMs(candidate) ?? 0) > at)
    .map(({ at, candidate }) => ({ ...candidate, flaggedAt: at }))
}

/**
 * The time of the transcript's last dated entry. Its mtime is no measure of
 * use: a process writes undated `cost-state` lines when it exits, so closing
 * the window moves every archived transcript at once.
 * @param {string} transcript
 */
function getLastEntryMs(transcript) {
  let latest = null
  for (const line of transcript.split("\n")) {
    if (!line.includes('"timestamp"')) continue
    try {
      const at = Date.parse(JSON.parse(line).timestamp)
      if (Number.isFinite(at) && (latest === null || at > latest)) latest = at
    } catch {
      // A line cut mid-write.
    }
  }
  return latest
}

function readText(path) {
  try {
    return readFileSync(path, "utf8")
  } catch {
    return null
  }
}

function mtimeMs(path) {
  try {
    return statSync(path).mtimeMs
  } catch {
    return null
  }
}

// Subagents write under the session's folder, not in its .jsonl.
function latestMtimeUnder(dir, depth = 2) {
  let latest = mtimeMs(dir) ?? 0
  if (depth === 0) return latest
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      const value = entry.isDirectory()
        ? latestMtimeUnder(path, depth - 1)
        : (mtimeMs(path) ?? 0)
      latest = Math.max(latest, value)
    }
  } catch {
    // A missing folder adds nothing.
  }
  return latest
}

function listChildren() {
  const children = new Map()
  for (const name of readdirSync("/proc")) {
    if (!/^\d+$/.test(name)) continue
    const stat = readText(`/proc/${name}/stat`)
    if (stat === null) continue
    const afterComm = stat.slice(stat.lastIndexOf(")") + 2).split(" ")
    const ppid = Number(afterComm[1])
    const comm = stat.slice(stat.indexOf("(") + 1, stat.lastIndexOf(")"))
    const list = children.get(ppid) ?? []
    list.push({ pid: Number(name), comm })
    children.set(ppid, list)
  }
  return children
}

function getDescendants(pid, children) {
  const result = []
  const queue = [pid]
  while (queue.length > 0) {
    for (const child of children.get(queue.shift()) ?? []) {
      result.push(child)
      queue.push(child.pid)
    }
  }
  return result
}

// PSS shares what processes share; swapped pages count too.
function getPssKb(pids) {
  let total = 0
  for (const pid of pids) {
    const rollup = readText(`/proc/${pid}/smaps_rollup`) ?? ""
    const pss = /^Pss:\s+(\d+)/m.exec(rollup)
    const swap = /^SwapPss:\s+(\d+)/m.exec(rollup)
    total += Number(pss?.[1] ?? 0) + Number(swap?.[1] ?? 0)
  }
  return total
}

// The own conversation is told by the hook's parent chain: environment
// variables are not set alike in every entrypoint.
function getAncestors(pid) {
  const ancestors = new Set()
  let current = pid
  while (current > 1) {
    ancestors.add(current)
    const stat = readText(`/proc/${current}/stat`)
    if (stat === null) break
    current = Number(stat.slice(stat.lastIndexOf(")") + 2).split(" ")[1])
  }
  return ancestors
}

/** hiddenSessionIds of the extension's globalState, or null when unreadable. */
async function readArchived() {
  try {
    const users = readdirSync(VSCODE_STATE_GLOB_PARENT).filter((user) =>
      existsSync(join(VSCODE_STATE_GLOB_PARENT, user, VSCODE_STATE_SUFFIX))
    )
    if (users.length !== 1) return null
    const { DatabaseSync } = await import("node:sqlite")
    const db = new DatabaseSync(
      join(VSCODE_STATE_GLOB_PARENT, users[0], VSCODE_STATE_SUFFIX),
      { readOnly: true }
    )
    try {
      const row = db
        .prepare("SELECT value FROM ItemTable WHERE key = ?")
        .get(VSCODE_STATE_KEY)
      const ids = JSON.parse(String(row?.value)).hiddenSessionIds
      return Array.isArray(ids) ? new Set(ids) : null
    } finally {
      db.close()
    }
  } catch {
    return null
  }
}

function readRegistry(path) {
  try {
    const value = JSON.parse(readFileSync(path, "utf8"))
    const valid =
      Number.isInteger(value.pid) &&
      typeof value.sessionId === "string" &&
      typeof value.cwd === "string" &&
      typeof value.status === "string" &&
      typeof value.procStart === "string" &&
      Number.isFinite(value.startedAt) &&
      Number.isFinite(value.statusUpdatedAt)
    return valid ? value : null
  } catch {
    return null
  }
}

function readTranscript(registry) {
  const dir = join(CLAUDE_DIR, "projects", encodeProjectDir(registry.cwd))
  const path = join(dir, `${registry.sessionId}.jsonl`)
  const dirExists = existsSync(dir)
  const text = existsSync(path) ? readText(path) : ""
  if (text === null) {
    return { path, dirExists, exists: true, deferred: null, mtimeMs: 0 }
  }
  let deferred
  try {
    deferred = findDeferredWork(text, registry.startedAt)
  } catch {
    deferred = null
  }
  return {
    path,
    dirExists,
    exists: existsSync(path),
    deferred,
    mtimeMs: Math.max(
      mtimeMs(path) ?? 0,
      latestMtimeUnder(join(dir, registry.sessionId))
    ),
  }
}

async function takeSnapshot() {
  const sessionsDir = join(CLAUDE_DIR, "sessions")
  const children = listChildren()
  const sessions = []
  const unreadable = []
  const selfPids = getAncestors(process.pid)
  for (const name of readdirSync(sessionsDir)) {
    if (!/^\d+\.json$/.test(name)) continue
    const registry = readRegistry(join(sessionsDir, name))
    if (registry === null) {
      const pid = Number.parseInt(name, 10)
      if (!selfPids.has(pid)) unreadable.push(`registry ${name}`)
      sessions.push({ registry, pid })
      continue
    }
    const stat = readText(`/proc/${registry.pid}/stat`)
    const descendants = getDescendants(registry.pid, children)
    const transcript = readTranscript(registry)
    if (transcript.deferred === null) {
      unreadable.push(`transcript ${registry.sessionId}`)
    }
    sessions.push({
      pid: registry.pid,
      registry,
      procStart: stat === null ? null : parseProcStart(stat),
      hasBash: descendants.some(({ comm }) => comm === "bash"),
      descendants: descendants.map(({ pid }) => pid),
      transcript,
      activityMs: Math.max(registry.statusUpdatedAt, transcript.mtimeMs),
    })
  }
  const archived = await readArchived()
  if (archived === null) unreadable.push("VS Code's state.vscdb")
  return {
    now: Date.now(),
    root: ROOT,
    selfPids,
    archived,
    sessions,
    unreadable,
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Never SIGKILL: a conversation SIGINT does not end may have turned busy, and
// its descendants' cleanup was measured only with SIGINT, SIGTERM and stdin.
async function closeSession(session) {
  const { registry } = session
  const fresh = readRegistry(
    join(CLAUDE_DIR, "sessions", `${registry.pid}.json`)
  )
  const stat = readText(`/proc/${registry.pid}/stat`)
  if (
    fresh === null ||
    fresh.status !== "idle" ||
    fresh.statusUpdatedAt !== registry.statusUpdatedAt ||
    stat === null ||
    parseProcStart(stat) !== registry.procStart
  ) {
    return "changed before the signal"
  }
  process.kill(registry.pid, "SIGINT")
  for (let waited = 0; waited < EXIT_WAIT_MS; waited += EXIT_POLL_MS) {
    await sleep(EXIT_POLL_MS)
    if (readText(`/proc/${registry.pid}/stat`) === null) return "closed"
  }
  return "still alive after SIGINT"
}

function takeLock() {
  mkdirSync(dirname(LOCK_PATH), { recursive: true })
  try {
    const stale =
      Date.now() - (mtimeMs(LOCK_PATH) ?? Date.now()) > LOCK_STALE_MS
    if (stale) unlinkSync(LOCK_PATH)
  } catch {
    // Another pass removed it first.
  }
  try {
    const fd = openSync(LOCK_PATH, "wx")
    writeSync(fd, String(process.pid))
    closeSync(fd)
    return true
  } catch {
    return false
  }
}

function readLog() {
  return (readText(LOG_PATH) ?? "")
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)]
      } catch {
        return []
      }
    })
}

const toMb = (kb) => Math.round(kb / 1024)

async function runOnce({ dryRun, trigger, quiet }) {
  if (!takeLock()) return
  try {
    const snapshot = await takeSnapshot()
    const { targets, kept } = selectTargets(snapshot)
    const keptReasons = {}
    for (const { reason } of kept) {
      keptReasons[reason] = (keptReasons[reason] ?? 0) + 1
    }
    const candidates = []
    for (const { session, reason } of targets) {
      candidates.push({
        pid: session.registry.pid,
        sessionId: session.registry.sessionId,
        reason,
        idleMin: Math.round((snapshot.now - session.activityMs) / MINUTE_MS),
        pssMb: toMb(getPssKb([session.registry.pid, ...session.descendants])),
        transcriptPath: session.transcript.path,
        result: dryRun ? "shadow" : await closeSession(session),
      })
    }
    mkdirSync(dirname(LOG_PATH), { recursive: true })
    appendFileSync(
      LOG_PATH,
      `${JSON.stringify({ at: snapshot.now, trigger, dryRun, candidates, keptReasons, unreadable: snapshot.unreadable })}\n`
    )

    const lines = candidates.map(
      (c) =>
        `- ${c.result}: pid ${c.pid}, ${c.sessionId} (${c.reason}, idle ${c.idleMin} min, ${c.pssMb} MB)`
    )
    if (snapshot.unreadable.length > 0) {
      lines.push(
        `- Unread (nothing closed that way): ${snapshot.unreadable.join(", ")}`
      )
    }
    // At SessionStart the output becomes context: only what was done or
    // could not be read.
    const shown = quiet
      ? lines.filter((line) => !line.startsWith("- shadow"))
      : lines
    if (shown.length > 0) {
      console.log(`Conversation cleanup (reap.mjs${dryRun ? ", shadow" : ""}):`)
      console.log(shown.join("\n"))
    } else if (!quiet) {
      console.log("Conversation cleanup: nothing to close.")
    }
    if (!quiet) {
      const summary = Object.entries(keptReasons)
        .map(([reason, count]) => `${reason} ${count}`)
        .join(", ")
      console.log(`Kept: ${summary || "none"}.`)
    }
  } finally {
    try {
      unlinkSync(LOCK_PATH)
    } catch {
      // Already gone.
    }
  }
}

function runReport({ hours }) {
  const since = Date.now() - hours * 60 * MINUTE_MS
  const passes = readLog().filter((pass) => pass.at >= since)
  const reactivated = findReactivated(passes, (candidate) => {
    const registryActivity = readdirSync(join(CLAUDE_DIR, "sessions"))
      .map((name) => readRegistry(join(CLAUDE_DIR, "sessions", name)))
      .filter((entry) => entry?.sessionId === candidate.sessionId)
      .map((entry) => entry.statusUpdatedAt)
    const transcript = readText(candidate.transcriptPath)
    return Math.max(
      (transcript === null ? null : getLastEntryMs(transcript)) ?? 0,
      ...registryActivity
    )
  })
  const distinct = new Set(
    passes.flatMap((pass) => pass.candidates.map((c) => c.sessionId))
  )
  const unreadable = new Set(passes.flatMap((pass) => pass.unreadable))
  const keptTotals = {}
  for (const pass of passes) {
    for (const [reason, count] of Object.entries(pass.keptReasons ?? {})) {
      keptTotals[reason] = (keptTotals[reason] ?? 0) + count
    }
  }

  console.log(`Passes in the last ${hours} h: ${passes.length}`)
  console.log(`Distinct candidates: ${distinct.size}`)
  for (const sessionId of distinct) {
    const flags = passes.flatMap((pass) =>
      pass.candidates.filter((c) => c.sessionId === sessionId)
    )
    const last = flags.at(-1)
    console.log(
      `- ${sessionId} (${last.reason}): ${flags.length} passes, idle ${flags[0].idleMin}-${last.idleMin} min, ${last.pssMb} MB`
    )
  }
  const keptSummary = Object.entries(keptTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([reason, count]) => `${reason} ${count}`)
    .join(", ")
  console.log(`Kept (times, over all passes): ${keptSummary || "none"}`)
  console.log(`Candidates active later: ${reactivated.length}`)
  for (const c of reactivated) {
    console.log(
      `- ${c.sessionId} (${c.reason}), flagged at ${new Date(c.flaggedAt).toISOString()}`
    )
  }
  if (unreadable.size > 0) {
    console.log(`Unread at some pass: ${[...unreadable].join(", ")}`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const valueOf = (flag) => {
    const index = args.indexOf(flag)
    return index === -1 ? undefined : args[index + 1]
  }
  try {
    if (args.includes("--report")) {
      runReport({ hours: Number(valueOf("--hours") ?? DEFAULT_REPORT_HOURS) })
    } else if (args.includes("--once")) {
      await runOnce({
        dryRun: args.includes("--dry-run"),
        trigger: valueOf("--trigger") ?? "manual",
        quiet: args.includes("--quiet"),
      })
    } else {
      console.error(
        "Usage: reap.mjs --once [--dry-run] [--trigger <name>] [--quiet] | --report [--hours <n>]"
      )
      process.exitCode = 2
    }
  } catch (error) {
    // Fail closed: a pass that errors has signalled nothing after the error.
    console.log(
      `Conversation cleanup: the pass failed without closing anything (${error.message}).`
    )
  }
}

export {
  encodeProjectDir,
  findDeferredWork,
  findReactivated,
  getLastEntryMs,
  parseProcStart,
  selectTargets,
}
