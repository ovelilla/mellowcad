/**
 * Fails when a module of a package's `dist` uses React without `"use client"`
 * as its first statement: in a React Server Components host, such a module
 * imported from a server component breaks on its first hook. Run from the
 * package's folder, after its build (`npm run check -w packages/react`).
 */
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const DIST = path.resolve("dist")

/** A value import from React's runtime: hooks, JSX, the compiler's cache. */
const USES_REACT =
  /^import\s+(?!type\s)[^;]*?from\s*["']react(?:\/jsx-runtime|\/compiler-runtime)?["']/m

const CLIENT = /^\s*["']use client["'];?/

function* modules(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* modules(full)
    else if (entry.name.endsWith(".js")) yield full
  }
}

const missing = [...modules(DIST)].filter((file) => {
  const code = readFileSync(file, "utf8")
  return USES_REACT.test(code) && !CLIENT.test(code)
})

if (missing.length > 0) {
  for (const file of missing)
    console.error(
      `${path.relative(process.cwd(), file)}: uses React without "use client"`
    )
  process.exit(1)
}
