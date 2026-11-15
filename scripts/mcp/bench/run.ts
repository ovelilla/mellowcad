import { spawn } from "node:child_process"
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join, resolve } from "node:path"
import { shapesOfDxf } from "./shapes.ts"
import { TASKS } from "./tasks.ts"
import type { Task } from "./tasks.ts"

/**
 * Runs the bench: each task given to a headless Claude Code (`claude -p`)
 * whose only tools are one condition's, then its drawing checked. Bundle it
 * first (`scripts/mcp/build.ts`), as the server it spawns:
 *
 *   node run.mjs --out <dir> --server <server.mjs> --models haiku,sonnet \
 *     --conditions bare,text,image,stateless,code --python <venv>/bin/python
 *   node run.mjs --out <dir> --report
 *
 * `code` is the baseline with no server at all: the agent writes the DXF with
 * a Python script and ezdxf, which is what it would do today.
 */

const CONDITIONS = ["bare", "text", "image", "stateless", "code"] as const
type Condition = (typeof CONDITIONS)[number]

interface Run {
  readonly task: Task
  readonly condition: Condition
  readonly model: string
  readonly repeat: number
}

interface Result {
  readonly task: string
  readonly condition: Condition
  readonly model: string
  readonly repeat: number
  readonly pass: boolean
  readonly failed: readonly string[]
  readonly checks: number
  readonly toolCalls: number
  readonly turns: number | null
  readonly costUsd: number | null
  readonly seconds: number
  readonly note: string
}

const SYSTEM =
  "You are a precise CAD drafter working alone: never ask a question, decide and draw. " +
  "Coordinates are drawing units. Check your work with the tools you have before you finish, and fix what is wrong."

function option(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`)
  return at < 0 ? undefined : process.argv[at + 1]
}

function prompt(run: Run, dir: string, python: string): string {
  const seed = run.task.seed ? join(dir, "seed.dxf") : null
  if (run.condition === "code") {
    return [
      seed ? `Edit the DXF file ${seed}.` : "Make a DXF drawing.",
      run.task.prompt,
      "Do it with a Python script, script.py in the current directory, that uses the ezdxf library " +
        `and saves the result as drawing.dxf in the current directory (${dir}). ` +
        `The only Python that has ezdxf is the interpreter at ${python}: run the script with exactly \`${python} script.py\`. ` +
        "That file is checked automatically. When it is written and you have verified it, answer DONE.",
    ].join("\n\n")
  }
  return [
    seed
      ? `Open the DXF file ${seed} with the open tool, then edit it.`
      : "Make a drawing with the mellowcad tools.",
    run.task.prompt,
    run.condition === "stateless"
      ? "The drawing your last draw call leaves is checked automatically. When it is right, answer DONE."
      : "The drawing is checked automatically as the tools leave it; you need not save it. When it is right, answer DONE.",
  ].join("\n\n")
}

function claude(
  args: readonly string[],
  cwd: string
): Promise<{ stdout: string; seconds: number; timedOut: boolean }> {
  return new Promise((done) => {
    const started = Date.now()
    const child = spawn("claude", args, {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    })
    let stdout = ""
    let timedOut = false
    child.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString()))
    const timer = setTimeout(
      () => {
        timedOut = true
        child.kill("SIGKILL")
      },
      12 * 60 * 1000
    )
    child.on("close", () => {
      clearTimeout(timer)
      done({ stdout, seconds: (Date.now() - started) / 1000, timedOut })
    })
  })
}

async function execute(
  run: Run,
  out: string,
  server: string,
  python: string
): Promise<Result> {
  const dir = join(
    out,
    run.model,
    run.condition,
    `${run.task.id}-${run.repeat}`
  )
  mkdirSync(dir, { recursive: true })
  if (run.task.seed) writeFileSync(join(dir, "seed.dxf"), await run.task.seed())

  const code = run.condition === "code"
  const config = join(dir, "mcp.json")
  writeFileSync(
    config,
    JSON.stringify({
      mcpServers: code
        ? {}
        : {
            mellowcad: {
              command: "node",
              args: [server],
              env: {
                MELLOWCAD_MCP_FEEDBACK: run.condition,
                MELLOWCAD_MCP_OUT: dir,
                MELLOWCAD_MCP_ROOT: process.cwd(),
              },
            },
          },
    })
  )
  const { stdout, seconds, timedOut } = await claude(
    [
      "-p",
      prompt(run, dir, python),
      "--model",
      run.model,
      "--output-format",
      "json",
      "--max-turns",
      "40",
      "--system-prompt",
      SYSTEM,
      "--setting-sources",
      "",
      "--strict-mcp-config",
      "--mcp-config",
      config,
      "--no-session-persistence",
      "--tools",
      code ? "Bash,Write,Edit,Read" : "",
      "--allowedTools",
      ...(code
        ? [`Bash(${python}:*)`, "Write", "Edit", "Read"]
        : ["mcp__mellowcad"]),
    ],
    dir
  )
  writeFileSync(join(dir, "claude.json"), stdout)

  let turns: number | null = null
  let costUsd: number | null = null
  let note = timedOut ? "timed out" : ""
  try {
    const answer = JSON.parse(stdout) as {
      num_turns?: number
      total_cost_usd?: number
      subtype?: string
      is_error?: boolean
    }
    turns = answer.num_turns ?? null
    costUsd = answer.total_cost_usd ?? null
    if (answer.is_error || (answer.subtype && answer.subtype !== "success")) {
      note = answer.subtype ?? "error"
    }
  } catch {
    note ||= "no answer"
  }

  const calls = join(dir, "calls.jsonl")
  const toolCalls = existsSync(calls)
    ? readFileSync(calls, "utf8").trim().split("\n").length
    : 0
  const dxf = join(dir, "drawing.dxf")
  let failed: string[] = ["no drawing"]
  let checks = 1
  if (existsSync(dxf)) {
    try {
      const all = run.task.checks(shapesOfDxf(readFileSync(dxf)))
      checks = all.length
      failed = all.filter(([, pass]) => !pass).map(([name]) => name)
    } catch (error) {
      failed = [`unreadable DXF: ${String(error)}`]
    }
  }
  return {
    task: run.task.id,
    condition: run.condition,
    model: run.model,
    repeat: run.repeat,
    pass: failed.length === 0,
    failed,
    checks,
    toolCalls,
    turns,
    costUsd,
    seconds: Math.round(seconds),
    note,
  }
}

/** Checks every stored drawing again, after a check changed. */
function recheck(out: string): void {
  const file = join(out, "results.jsonl")
  const results = readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as Result)
    .map((result) => {
      const task = TASKS.find((t) => t.id === result.task)
      const dxf = join(
        out,
        result.model,
        result.condition,
        `${result.task}-${result.repeat}`,
        "drawing.dxf"
      )
      if (!task || !existsSync(dxf)) return result
      const all = task.checks(shapesOfDxf(readFileSync(dxf)))
      const failed = all.filter(([, pass]) => !pass).map(([name]) => name)
      return {
        ...result,
        failed,
        checks: all.length,
        pass: failed.length === 0,
      }
    })
  writeFileSync(file, results.map((r) => JSON.stringify(r)).join("\n") + "\n")
}

function report(out: string): void {
  const results = readFileSync(join(out, "results.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as Result)
  const groups = new Map<string, Result[]>()
  for (const result of results) {
    const key = `${result.model} ${result.condition}`
    groups.set(key, [...(groups.get(key) ?? []), result])
  }
  const tasks = TASKS.map((task) => task.id)
  console.log(
    ["model condition", "passed", ...tasks, "turns", "usd", "s"].join(" | ")
  )
  for (const [key, group] of groups) {
    const mean = (pick: (r: Result) => number | null) =>
      group.reduce((sum, r) => sum + (pick(r) ?? 0), 0) / group.length
    const cells = tasks.map((id) => {
      const runs = group.filter((r) => r.task === id)
      if (runs.length === 0) return "-"
      return runs
        .map((r) =>
          r.pass ? "ok" : `${r.checks - r.failed.length}/${r.checks}`
        )
        .join(" ")
    })
    console.log(
      [
        key,
        `${group.filter((r) => r.pass).length}/${group.length}`,
        ...cells,
        mean((r) => r.turns).toFixed(1),
        mean((r) => r.costUsd).toFixed(3),
        mean((r) => r.seconds).toFixed(0),
      ].join(" | ")
    )
  }
  const total = results.reduce((sum, r) => sum + (r.costUsd ?? 0), 0)
  console.log(`${results.length} runs, ${total.toFixed(2)} USD`)
}

async function main(): Promise<void> {
  const out = resolve(option("out") ?? "bench-out")
  if (process.argv.includes("--recheck")) recheck(out)
  if (process.argv.includes("--recheck") || process.argv.includes("--report")) {
    return report(out)
  }

  const server = resolve(option("server") ?? "server.mjs")
  const python = option("python") ?? "python3"
  const wanted = (name: string, all: readonly string[]) => {
    const value = option(name)
    return value === undefined || value === "all" ? all : value.split(",")
  }
  const conditions = wanted("conditions", CONDITIONS) as Condition[]
  const taskIds = wanted(
    "tasks",
    TASKS.map((task) => task.id)
  )
  const models = wanted("models", ["haiku"])
  const repeats = Number(option("repeat") ?? "1")
  const first = Number(option("first-repeat") ?? "1")

  const runs: Run[] = []
  for (const model of models) {
    for (const condition of conditions) {
      for (const task of TASKS.filter((t) => taskIds.includes(t.id))) {
        // A server that keeps nothing cannot open a file to edit.
        if (condition === "stateless" && task.seed) continue
        for (let repeat = first; repeat < first + repeats; repeat++) {
          runs.push({ task, condition, model, repeat })
        }
      }
    }
  }

  mkdirSync(out, { recursive: true })
  const workers = Number(option("concurrency") ?? "3")
  let next = 0
  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (next < runs.length) {
        const run = runs[next++]
        const result = await execute(run, out, server, python)
        appendFileSync(
          join(out, "results.jsonl"),
          JSON.stringify(result) + "\n"
        )
        console.log(
          `${result.model} ${result.condition} ${result.task}#${result.repeat}: ` +
            (result.pass ? "pass" : `FAIL (${result.failed.join("; ")})`) +
            ` — ${result.toolCalls} calls, ${result.turns} turns, ${result.seconds}s, $${result.costUsd?.toFixed(3)} ${result.note}`
        )
      }
    })
  )
  report(out)
}

await main()
