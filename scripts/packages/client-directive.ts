/**
 * Fails when a module of a package's `dist` uses React without `"use client"`
 * as its first statement: in a React Server Components host, such a module
 * imported from a server component breaks on its first hook. Run from the
 * package's folder, after its build (`npm run check -w packages/react`).
 *
 * With `--compiled`, for a package built with the React Compiler, it also
 * fails when a module renders JSX without importing the compiler's runtime:
 * the compiler was left out of the build, or skipped every component there,
 * and the host would get them unmemoized.
 */
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const DIST = path.resolve("dist")

/** A value import from React's runtime: hooks, JSX, the compiler's cache. */
const USES_REACT =
  /^import\s+(?!type\s)[^;]*?from\s*["']react(?:\/jsx-runtime|\/compiler-runtime)?["']/m

const CLIENT = /^\s*["']use client["'];?/

const JSX = /^import\s+[^;]*?from\s*["']react\/jsx-runtime["']/m

const COMPILED = /^import\s+[^;]*?from\s*["']react\/compiler-runtime["']/m

const compiled = process.argv.includes("--compiled")

function* modules(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* modules(full)
    else if (entry.name.endsWith(".js")) yield full
  }
}

const problems = [...modules(DIST)].flatMap((file) => {
  const code = readFileSync(file, "utf8")
  const at = path.relative(process.cwd(), file)
  return [
    ...(USES_REACT.test(code) && !CLIENT.test(code)
      ? [`${at}: uses React without "use client"`]
      : []),
    ...(compiled && JSX.test(code) && !COMPILED.test(code)
      ? [`${at}: renders JSX without the React Compiler's runtime`]
      : []),
  ]
})

if (problems.length > 0) {
  for (const problem of problems) console.error(problem)
  process.exit(1)
}
