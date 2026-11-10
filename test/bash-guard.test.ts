import { spawnSync } from "node:child_process"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { verdict } from "../.claude/hooks/bash-guard.mjs"

// The PreToolUse hook on Bash (.claude/hooks/bash-guard.mjs): the commit gate
// is never skipped, and every form of push asks first.
const HOOK = path.resolve(
  import.meta.dirname,
  "../.claude/hooks/bash-guard.mjs"
)
const decision = (command: string) =>
  (verdict(command) as { decision: string } | null)?.decision ?? null

describe("the Bash guard", () => {
  it.each([
    "git commit --no-verify -m x",
    "git commit -m x --no-verify",
    "git commit --no-ver -m x",
    "git commit -n -m x",
    "git commit -anm x",
    'cd ../x && git -C . commit -q -n -m "a b"',
    "git -c core.hooksPath=/dev/null commit -m x",
    "GIT_EDITOR=true git commit --no-verify",
    "git --config-env=core.hooksPath=H commit -m x",
    "git --config-env core.hooksPath=H commit -m x",
    "GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/x git commit -m x",
    "git config core.hooksPath /dev/null; git commit -m x",
    "git config --unset core.hooksPath",
    "bash -c 'git commit -n -m x'",
    "sudo git commit -n",
    "env -i git commit -n",
    "/usr/bin/git commit -n",
    "cat <<EOF\nit's\nEOF\ngit commit -n -m x",
  ])("refuses %s", (command) => {
    expect(decision(command)).toBe("deny")
  })

  it.each([
    "git push",
    "git push origin main",
    "git -C . push origin main",
    "npm test && git push",
    "git -c push.default=current push",
    "git commit -F - <<'EOF'\nfix: don't\nEOF\ngit push",
    "echo `git push`",
    "echo $(git push)",
  ])("asks before %s", (command) => {
    expect(decision(command)).toBe("ask")
  })

  it.each([
    "git commit -m 'no -n here'",
    "git commit -q -F - <<'EOF'\nfix: the -n flag of LIST\nEOF",
    "git commit --no-edit --amend",
    "git log --no-verify-signatures",
    "echo git push",
    "git status && npm run lint",
    "git commit -F - <<'EOF'\ngit commit --no-verify\ngit push\nEOF",
    "git commit -mdone",
    "git commit -uno -m x",
    "git commit -m -nothing",
    "git commit --message -n",
    "git config core.hooksPath",
    "git config --get core.hooksPath",
  ])("lets %s through", (command) => {
    expect(decision(command)).toBeNull()
  })

  it("speaks Claude Code's PreToolUse protocol", () => {
    const run = (command: string) =>
      spawnSync("node", [HOOK], {
        input: JSON.stringify({ tool_name: "Bash", tool_input: { command } }),
        encoding: "utf8",
      }).stdout
    expect(JSON.parse(run("git commit -n")).hookSpecificOutput).toMatchObject({
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
    })
    expect(run("git status")).toBe("")
  })
})
