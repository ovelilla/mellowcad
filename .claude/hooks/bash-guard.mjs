// PreToolUse hook on Bash: what AGENTS.md says no command may do, held where
// a permission rule cannot (no rule sees `-n` inside `git commit -anm`).
// Refuses skipping the commit gate: each session commits from its own
// worktree, where the gate tests exactly what is committed. A push is not
// asked here (owner, 12/11/2026): AGENTS.md holds it to the owner's word, and
// a dialog on every push only slowed the tasks that already carry that word.
// A guard against slips, not against a determined author: `eval` or a
// script file still get past it.
import { readFileSync } from "node:fs"

const SEPARATORS = new Set(["\n", ";", "&", "|", "(", ")", "`"])

/** Splits a command line into simple commands, each a list of words. */
export function simpleCommands(line) {
  const commands = [[]]
  let word = null
  let quote = null
  let heredoc = null
  const end = () => {
    if (word !== null) {
      if (/^<<-?$/.test(commands.at(-1).at(-1) ?? "")) {
        commands.at(-1).pop()
        heredoc = { delimiter: word, pending: true }
      } else commands.at(-1).push(word)
    }
    word = null
  }
  const split = () => {
    end()
    if (commands.at(-1).length > 0) commands.push([])
  }
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quote) {
      if (c === quote) quote = null
      else if (c === "\\" && quote === '"' && i + 1 < line.length)
        word += line[++i]
      else word += c
    } else if (c === "'" || c === '"') {
      quote = c
      word ??= ""
    } else if (c === "\\" && i + 1 < line.length) {
      word = (word ?? "") + line[++i]
    } else if (c === "<" && line[i + 1] === "<" && line[i + 2] !== "<") {
      // A here-document: its body is text, never commands.
      end()
      const dash = line[i + 2] === "-"
      commands.at(-1).push(dash ? "<<-" : "<<")
      i += dash ? 2 : 1
    } else if (c === "\n") {
      split()
      if (!heredoc?.pending) continue
      const lines = line.slice(i + 1).split("\n")
      let skipped = 0
      for (const body of lines) {
        skipped += body.length + 1
        if (body.replace(/^\t+/, "") === heredoc.delimiter) break
      }
      i += skipped
      heredoc = null
    } else if (c === "$" && line[i + 1] === "(") {
      split()
      i++
    } else if (/\s/.test(c) && c !== "\n") {
      end()
    } else if (SEPARATORS.has(c)) {
      split()
    } else {
      word = (word ?? "") + c
    }
  }
  end()
  return commands.filter((words) => words.length > 0)
}

// git's options before its subcommand; those taking a value take the next word.
const GIT_VALUE_OPTIONS = new Set([
  "-C",
  "-c",
  "--config-env",
  "--git-dir",
  "--work-tree",
  "--namespace",
])
const PREFIXES = new Set([
  "env",
  "command",
  "builtin",
  "time",
  "nohup",
  "sudo",
  "exec",
])
// `git commit`'s short options that take a value: the rest of a cluster, or
// the next word, is that value.
const COMMIT_VALUE_LETTERS = "mFCctu"

/** A git invocation's options, subcommand and arguments, or null. */
function gitCall(words) {
  let i = 0
  const env = []
  for (;;) {
    if (/^\w+=/.test(words[i] ?? "")) env.push(words[i++])
    else if (PREFIXES.has(words[i])) {
      i++
      while ((words[i] ?? "").startsWith("-")) i++
    } else break
  }
  if (!/(^|\/)git$/.test(words[i] ?? "")) return null
  const options = []
  i++
  while (i < words.length && words[i].startsWith("-")) {
    options.push(words[i])
    if (GIT_VALUE_OPTIONS.has(words[i])) options.push(words[++i] ?? "")
    i++
  }
  return { env, options, subcommand: words[i], args: words.slice(i + 1) }
}

function skipsHooks(args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (/^--no-v(e(r(i(fy?)?)?)?)?$/.test(arg)) return true
    if (
      /^--(message|file|reuse-message|reedit-message|template|cleanup|author|date)$/.test(
        arg
      )
    ) {
      i++
      continue
    }
    if (!/^-[a-zA-Z]/.test(arg)) continue
    for (const letter of arg.slice(1)) {
      if (letter === "n") return true
      if (COMMIT_VALUE_LETTERS.includes(letter)) {
        if (arg.endsWith(letter) && letter !== "u") i++
        break
      }
    }
  }
  return false
}

const DENY = {
  decision: "deny",
  reason:
    "The commit gate is never skipped (AGENTS.md): run it in your own worktree, where it tests exactly what you commit, and fix what it reports.",
}
export function verdict(line) {
  for (const words of simpleCommands(line)) {
    // A shell given a script runs it: read the script too.
    if (/(^|\/)(ba|z|da)?sh$/.test(words[0]) && words[1] === "-c") {
      const inner = verdict(words[2] ?? "")
      if (inner) return inner
      continue
    }
    const git = gitCall(words)
    if (!git) continue
    const hooksPath = (text) => /core\.hookspath/i.test(text)
    // Setting or unsetting it, not reading it.
    const key = git.args.findIndex(hooksPath)
    if (
      git.subcommand === "config" &&
      key >= 0 &&
      (git.args.length > key + 1 ||
        git.args.some((arg) => /^--(unset|replace)/.test(arg)))
    )
      return DENY
    if (git.subcommand === "commit") {
      if (skipsHooks(git.args)) return DENY
      if (git.options.some(hooksPath) || git.env.some(hooksPath)) return DENY
    }
  }
  return null
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let command = ""
  try {
    command = JSON.parse(readFileSync(0, "utf8")).tool_input?.command ?? ""
  } catch {
    process.exit(0)
  }
  const found = verdict(String(command))
  if (found) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: found.decision,
          permissionDecisionReason: found.reason,
        },
      })
    )
  }
}
