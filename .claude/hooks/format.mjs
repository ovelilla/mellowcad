// PostToolUse hook: formats the TypeScript file an agent just wrote, so
// `format:check` in the commit gate never fails on an edit. Only that file:
// another session may be editing the rest of the tree.
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()

let file
try {
  file = JSON.parse(readFileSync(0, "utf8")).tool_input?.file_path
} catch {
  process.exit(0)
}
if (typeof file !== "string" || !/\.tsx?$/.test(file)) process.exit(0)
const path = relative(ROOT, file)
if (path.startsWith("..")) process.exit(0)

try {
  // Prettier skips what .prettierignore lists; a file that does not parse
  // yet (mid-refactor) is left alone, and the gate reports it later.
  execFileSync(join(ROOT, "node_modules/.bin/prettier"), ["--write", path], {
    cwd: ROOT,
    stdio: "ignore",
  })
} catch {
  // Never block the edit.
}
