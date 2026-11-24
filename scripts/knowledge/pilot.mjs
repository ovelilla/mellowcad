// The knowledge pilot (docs/next-knowledge-eval.md §3, "El piloto"): four real
// tool fixes, each handed to a headless agent at its parent commit, with
// .claude/rules/cad-tools.md and without it, twice, and judged by the fix's
// own tests plus no new failure in the checks. Runs in series, resumable:
// a run already in runs.jsonl is skipped.
//
//   node scripts/knowledge/pilot.mjs [--only <task>/<variant>/<rep>] [--dry]
//
// --dry builds the templates and the baselines and runs no agent. Everything
// lives in ~/.cache/mellowcad-pilot, on the disk of /home: `cp -al` cannot link
// across to /tmp.
import { execFileSync, spawn } from "node:child_process"
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"

const TASKS = [
  {
    id: "spline-preview-ids",
    fix: "a48f037276835bf0a36073fd0267d609601a5534",
    parent: "b0d6379ea3b177ff84c54e7051e671302e7d8e2b",
    tests: ["cad/application/tools/previewIds.test.ts"],
    filter: undefined,
    report:
      "While SPLINE is asking for points, just moving the mouse uses up entity ids. Start SPLINE, click two fit points, then move the cursor around without clicking. Each redraw of the curve's preview takes a new entity id, though nothing is added to the drawing. LINE, CIRCLE, PLINE and the other commands preview without using any. Hovering should use no ids; only the committed spline gets one.",
  },
  {
    id: "3dpoly-undo-control-none",
    fix: "8609726ef6de4ace1a63436f2a6527d2226277f5",
    parent: "dc26a886218ffeeeda7fa06dbe9caec52671a2db",
    tests: ["cad/application/tools/polyline3d.test.ts"],
    // p112 and p117, fixed in the same commit, contradict the parent's rule.
    filter: "UNDO Control None",
    report:
      "3DPOLY's Undo option does nothing when UNDO Control is None. Run UNDO, Control, None. Then 3DPOLY and type 0,0, 10,0 and 10,10. At `Specify endpoint of line or [Close/Undo]:` type U, then press Enter to end. In AutoCAD 2027 the last vertex is taken back, so the polyline is 0,0 to 10,0, just as LINE's Undo still steps back under Control None. Here the 10,10 vertex stays.",
  },
  {
    id: "solidedit-rotate-ucs",
    fix: "a56030638a98a0ca1a2a14e9d165934a303a8a93",
    parent: "d7911c5a0fdf0898f9d14c16934b3fa3d265da56",
    tests: ["cad/application/solidedit.test.ts"],
    // The commit fixed some twenty findings; the task is SOE-12 and SOE-20.
    filter: "Rotate in a UCS",
    report:
      "SOLIDEDIT Face Rotate ignores the current UCS for its axis options. Draw a BOX from 0,0,0 to 10,10 with height 10, then UCS Z 30. Run SOLIDEDIT, Face, Rotate, pick `*5,5,10`, press Enter, choose Xaxis, type `*0,0,10` and angle 10. AutoCAD turns the face about the UCS's X, giving a volume of 1032.2701; here it uses another axis and gives 1088.1635. Yaxis is wrong the same way, and so is Xaxis after UCS Y 90. Enter's `<0,0,0>` at the origin prompt should be the UCS origin (after UCS Origin 10,0,0), not the WCS's.",
  },
  {
    id: "primitive-defaults-new-open",
    fix: "8e79a536d9ec689d79026b576559ff4f11b4fdcd",
    parent: "bdbfe83bcb41588e57fe224df61536c31eb3fdb3",
    tests: ["cad/application/solidPrimitives.test.ts"],
    filter: "the primitives' defaults",
    report:
      "The solid primitives forget their defaults after NEW or OPEN. Draw a BOX by Length (10, 6, 4), a CYLINDER (radius 5, height 8), a TORUS with tube radius 1 and a PYRAMID set to 6 sides Inscribed. Then start a new drawing, or open one, and run BOX by Length again. AutoCAD 2027 still offers <10.0000>, <6.0000> and height <8.0000>, TORUS still offers its tube <1.0000>, and PYRAMID still says 6 sides: these are session values, and only CONE's top radius goes back to 0. Here they are all reset, and TORUS's tube diameter prompt offers no default at all.",
  },
]
// The same line for every run: the clone is the session's checkout, and a
// worktree would leave the judged tree untouched.
const SUFFIX =
  "\n\nWork directly in this checkout: no worktree, no commit, no push."
// The environment overrides are for a cheap smoke run, never the pilot.
const MODEL = process.env.PILOT_MODEL ?? "claude-opus-5-5"
const AGENT_TIMEOUT_S = Number(process.env.PILOT_TIMEOUT_S ?? 3600)
const RULE = ".claude/rules/cad-tools.md"
// With, without, without, with: neither variant always runs first.
const ORDER = { 1: ["with", "without"], 2: ["without", "with"] }

const REPO = dirname(
  resolve(
    execFileSync("git", ["rev-parse", "--git-common-dir"], {
      encoding: "utf8",
    }).trim()
  )
)
const OUT =
  process.env.PILOT_OUT ?? join(homedir(), ".cache", "mellowcad-pilot")
const RUNS = join(OUT, "runs.jsonl")
const args = process.argv.slice(2)
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null
const dry = args.includes("--dry")

// A child of this script must not take itself for a nested Claude Code
// session, nor run git against another repository.
const ENV = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !/^(CLAUDE|GIT_)/.test(key) && key !== "CLAUDECODE"
  )
)

const log = (...line) => console.log(new Date().toISOString(), ...line)
const sh = (cwd, cmd, cmdArgs, options = {}) =>
  execFileSync(cmd, cmdArgs, {
    cwd,
    env: ENV,
    encoding: "utf8",
    maxBuffer: 1 << 28,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  })
const tryRun = (cwd, cmd, cmdArgs) => {
  try {
    sh(cwd, cmd, cmdArgs)
    return { ok: true }
  } catch (error) {
    const out = `${error.stdout ?? ""}${error.stderr ?? ""}`
    return { ok: false, tail: out.slice(-2000) }
  }
}

function gitAt(dir, ...gitArgs) {
  return sh(dir, "git", gitArgs).trim()
}

// The parent's tree as one root commit, under the parent's subject: no
// history, so neither `git log` nor `git show` reaches the fix, nor the rule
// as it was before a variant emptied it.
function checkout(dir, task, edit) {
  mkdirSync(dir, { recursive: true })
  gitAt(dir, "init", "-q")
  gitAt(dir, "fetch", "-q", "--depth", "1", `file://${REPO}`, task.parent)
  gitAt(dir, "checkout", "-q", "FETCH_HEAD")
  const subject = gitAt(dir, "log", "-1", "--format=%s")
  const date = gitAt(dir, "log", "-1", "--format=%aI")
  edit?.(dir)
  gitAt(dir, "checkout", "-q", "--orphan", "main")
  gitAt(dir, "add", "-A")
  sh(dir, "git", ["commit", "-q", "--no-verify", "-m", subject], {
    env: { ...ENV, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
  })
  rmSync(join(dir, ".git", "FETCH_HEAD"), { force: true })
  rmSync(join(dir, ".git", "shallow"), { force: true })
  gitAt(dir, "reflog", "expire", "--expire=now", "--all")
  gitAt(dir, "gc", "-q", "--prune=now")
  // As `npm ci`'s prepare does: a commit runs the gate, as it did then.
  gitAt(dir, "config", "core.hooksPath", ".githooks")
}

// One `npm ci` per lockfile, linked into each run as the worktree hook links
// main's (.claude/hooks/worktree-create.mjs): the parents predate today's.
function template(task) {
  const lock = sh(REPO, "git", [
    "rev-parse",
    `${task.parent}:package-lock.json`,
  ]).trim()
  const dir = join(OUT, "templates", lock.slice(0, 12))
  if (existsSync(join(dir, ".ready"))) return dir
  log(`npm ci for lockfile ${lock.slice(0, 12)}`)
  rmSync(dir, { recursive: true, force: true })
  checkout(dir, task)
  sh(dir, "npm", ["ci", "--no-audit", "--no-fund"])
  writeFileSync(join(dir, ".ready"), "")
  return dir
}

function linkModules(dir, task) {
  const modules = join(dir, "node_modules")
  const partial = `${modules}.partial`
  execFileSync("cp", ["-al", join(template(task), "node_modules"), partial])
  for (const file of [
    ".package-lock.json",
    ".cache",
    ".vite",
    ".vite-temp",
    ".vitest-cache",
  ])
    rmSync(join(partial, file), { recursive: true, force: true })
  renameSync(partial, modules)
}

// The session hook hands out real work (Google's batch in the owner's Chrome,
// the dependency review) and reap.mjs closes processes on this machine; the
// worktree hooks would take the run out of the judged tree. The load log is
// this script's, written beside the run.
function settings(dir, loadsLog) {
  const file = join(dir, ".claude", "settings.json")
  const value = JSON.parse(readFileSync(file, "utf8"))
  for (const hook of ["SessionStart", "WorktreeCreate", "WorktreeRemove"])
    delete value.hooks?.[hook]
  value.hooks = {
    ...value.hooks,
    InstructionsLoaded: [
      {
        hooks: [
          {
            type: "command",
            command: `node ${JSON.stringify(join(OUT, "log-loads.mjs"))} ${JSON.stringify(loadsLog)}`,
          },
        ],
      },
    ],
  }
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

const LOGGER = `import { appendFileSync, readFileSync } from "node:fs"
try {
  const input = JSON.parse(readFileSync(0, "utf8"))
  appendFileSync(process.argv[2], JSON.stringify({
    at: new Date().toISOString(),
    file: input.file_path,
    reason: input.load_reason,
    trigger: input.trigger_file_path,
    globs: input.globs,
  }) + "\\n")
} catch {}
`

// Without the rule: its body emptied, its frontmatter kept, so what cites it
// still resolves and the knowledge test passes as it did.
function emptyRule(dir) {
  const file = join(dir, RULE)
  const text = readFileSync(file, "utf8")
  writeFileSync(file, `${text.match(/^---\n[\s\S]*?\n---\n/)[0]}`)
}

function vitestFailures(dir, files, filter) {
  const report = join(dir, "..", `vitest-${process.pid}-${Date.now()}.json`)
  const result = tryRun(dir, "npx", [
    "vitest",
    "run",
    ...files,
    ...(filter ? ["-t", filter] : []),
    "--reporter=json",
    `--outputFile=${report}`,
  ])
  if (!existsSync(report)) return { crashed: true, tail: result.tail }
  const json = JSON.parse(readFileSync(report, "utf8"))
  rmSync(report)
  const tests = json.testResults.flatMap((file) =>
    file.assertionResults.map((test) => ({
      name: `${file.name.slice(dir.length + 1)} > ${test.fullName}`,
      status: test.status,
    }))
  )
  return {
    failed: tests.filter((test) => test.status === "failed").map((t) => t.name),
    passed: tests.filter((test) => test.status === "passed").map((t) => t.name),
    suiteErrors: json.testResults
      .filter(
        (file) => file.status === "failed" && !file.assertionResults.length
      )
      .map((file) => file.name.slice(dir.length + 1)),
  }
}

// The checks the gate runs, without coverage: what is red before the agent
// starts is the baseline, and a run fails only on something new.
function checks(dir) {
  const typecheck = tryRun(dir, "npm", ["run", "--silent", "typecheck"])
  const build = tryRun(dir, "npm", ["run", "--silent", "build", "-w", "cad"])
  const lint = tryRun(dir, "npm", ["run", "--silent", "lint"])
  const tests = vitestFailures(dir, [], undefined)
  return {
    typecheck: typecheck.ok,
    build: build.ok,
    lint: lint.ok,
    failed: tests.failed ?? ["<the suite crashed>"],
    passedCount: tests.passed?.length ?? 0,
    suiteErrors: tests.suiteErrors ?? [],
    tails: {
      typecheck: typecheck.tail,
      build: build.tail,
      lint: lint.tail,
      tests: tests.tail,
    },
  }
}

// A property draws a new seed each run, and some parents hold one that fails
// now and then: a new failure counts only if its file fails it again.
function confirmed(dir, names) {
  if (!names.length || names.includes("<the suite crashed>")) return names
  const files = [...new Set(names.map((name) => name.split(" > ")[0]))]
  const again = vitestFailures(dir, files, undefined)
  return names.filter((name) => !again.passed?.includes(name))
}

function judgedTests(dir, task) {
  for (const test of task.tests) {
    mkdirSync(dirname(join(dir, test)), { recursive: true })
    writeFileSync(
      join(dir, test),
      sh(REPO, "git", ["show", `${task.fix}:${test}`])
    )
  }
  return vitestFailures(dir, task.tests, task.filter)
}

function baseline(task) {
  const file = join(OUT, "baselines", `${task.id}.json`)
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"))
  log(`baseline ${task.id}`)
  const dir = join(OUT, "work", `baseline-${task.id}`)
  rmSync(dir, { recursive: true, force: true })
  checkout(dir, task)
  linkModules(dir, task)
  const before = checks(dir)
  const judged = judgedTests(dir, task)
  if (!judged.failed?.length)
    throw new Error(`${task.id}: the judge fails nothing at the parent`)
  const value = {
    ...before,
    judgedFailing: judged.failed,
    judgedPassing: judged.passed,
  }
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
  rmSync(dir, { recursive: true, force: true })
  return value
}

function agent(dir, key, task) {
  const stream = join(OUT, "runs", `${key}.stream.jsonl`)
  const mcp = join(OUT, "no-mcp.json")
  writeFileSync(mcp, '{"mcpServers":{}}\n')
  const started = Date.now()
  return new Promise((done) => {
    const child = spawn(
      "timeout",
      [
        "--kill-after=60",
        String(AGENT_TIMEOUT_S),
        "claude",
        "-p",
        task.report + SUFFIX,
        "--model",
        MODEL,
        "--permission-mode",
        "bypassPermissions",
        "--no-session-persistence",
        "--strict-mcp-config",
        "--mcp-config",
        mcp,
        "--disallowedTools",
        "EnterWorktree",
        "--output-format",
        "stream-json",
        "--verbose",
      ],
      { cwd: dir, env: ENV, stdio: ["ignore", "pipe", "pipe"] }
    )
    const out = []
    child.stdout.on("data", (chunk) => {
      out.push(chunk)
      appendFileSync(stream, chunk)
    })
    let errors = ""
    child.stderr.on("data", (chunk) => (errors += chunk))
    child.on("close", (code) => {
      const lines = Buffer.concat(out)
        .toString()
        .split("\n")
        .flatMap((line) => {
          try {
            return [JSON.parse(line)]
          } catch {
            return []
          }
        })
      const result = lines.find((line) => line.type === "result")
      done({
        exit: code,
        timedOut: code === 124 || code === 137,
        seconds: Math.round((Date.now() - started) / 1000),
        turns: result?.num_turns,
        cost: result?.total_cost_usd,
        usage: result?.usage,
        modelUsage: result?.modelUsage,
        // Without a result (a timeout), the assistant messages' own usage.
        partialUsage: result
          ? undefined
          : lines
              .filter((line) => line.type === "assistant")
              .reduce(
                (sum, line) => {
                  const usage = line.message?.usage ?? {}
                  for (const key of Object.keys(sum))
                    sum[key] += usage[key] ?? 0
                  return sum
                },
                {
                  input_tokens: 0,
                  cache_creation_input_tokens: 0,
                  cache_read_input_tokens: 0,
                  output_tokens: 0,
                }
              ),
        stderr: errors.slice(-1000),
      })
    })
  })
}

async function run(task, variant, rep) {
  const key = `${task.id}/${variant}/${rep}`
  const done = existsSync(RUNS)
    ? readFileSync(RUNS, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line).key)
    : []
  if (done.includes(key)) return
  const base = baseline(task)
  if (dry) return
  const slug = key.replaceAll("/", "-")
  mkdirSync(join(OUT, "runs"), { recursive: true })
  mkdirSync(join(OUT, "work"), { recursive: true })
  const dir = join(mkdtempSync(join(OUT, "work", `${slug}-`)), "repo")
  const loads = join(OUT, "runs", `${slug}.loads.jsonl`)
  rmSync(loads, { force: true })
  rmSync(join(OUT, "runs", `${slug}.stream.jsonl`), { force: true })
  checkout(dir, task, (tree) => {
    settings(tree, loads)
    if (variant === "without") emptyRule(tree)
  })
  linkModules(dir, task)
  log(`run ${key}`)
  const result = await agent(dir, slug, task)
  log(`judge ${key} (${result.seconds} s, ${result.turns ?? "?"} turns)`)
  sh(dir, "git", ["add", "-A", "-N"])
  const diff = sh(dir, "git", ["diff", "HEAD", "--", ".", ":!node_modules"])
  writeFileSync(join(OUT, "runs", `${slug}.diff`), diff)
  const after = checks(dir)
  const judged = judgedTests(dir, task)
  const regressions = [
    ...["typecheck", "build", "lint"].filter(
      (check) => base[check] && !after[check]
    ),
    ...confirmed(
      dir,
      after.failed.filter((name) => !base.failed.includes(name))
    ),
    ...after.suiteErrors.filter((name) => !base.suiteErrors.includes(name)),
  ]
  const stillFailing = base.judgedFailing.filter(
    (name) => !judged.passed?.includes(name)
  )
  const loaded = existsSync(loads)
    ? [
        ...new Set(
          readFileSync(loads, "utf8")
            .split("\n")
            .filter(Boolean)
            .map((line) => JSON.parse(line).file?.split("/").pop())
        ),
      ]
    : []
  const judgedNewFailures = (judged.failed ?? ["<the judge crashed>"]).filter(
    (name) => !base.judgedFailing.includes(name)
  )
  const record = {
    key,
    task: task.id,
    variant,
    rep,
    at: new Date().toISOString(),
    success:
      !result.timedOut &&
      stillFailing.length === 0 &&
      judgedNewFailures.length === 0 &&
      regressions.length === 0,
    stillFailing,
    judgedNewFailures,
    regressions,
    ...result,
    diffLines: diff.split("\n").filter((line) => /^[+-](?![+-])/.test(line))
      .length,
    ruleLoaded: loaded.includes("cad-tools.md"),
    rulesLoaded: loaded,
    tails: regressions.length ? after.tails : undefined,
  }
  appendFileSync(RUNS, `${JSON.stringify(record)}\n`)
  log(
    `${key}: ${record.success ? "PASS" : "FAIL"}${stillFailing.length ? `, ${stillFailing.length} judged still failing` : ""}${regressions.length ? `, ${regressions.length} regressions` : ""}`
  )
  rmSync(dirname(dir), { recursive: true, force: true })
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, "log-loads.mjs"), LOGGER)
for (const rep of [1, 2])
  for (const task of TASKS)
    for (const variant of ORDER[rep]) {
      if (only && only !== `${task.id}/${variant}/${rep}`) continue
      try {
        await run(task, variant, rep)
      } catch (error) {
        log(`${task.id}/${variant}/${rep}: ${error.stack ?? error}`)
        process.exitCode = 1
      }
    }
log(dry ? "dry run done" : "pilot done")
