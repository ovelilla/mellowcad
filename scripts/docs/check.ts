/**
 * The docs' gate (`npm run docs:check`, in the pre-commit hook and CI): see
 * `checkDocs` for what it holds them to.
 */

import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { checkDocs } from "../../lib/docs/check.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

const problems = checkDocs(ROOT)
for (const problem of problems) console.error(`✗ ${problem}`)
if (problems.length > 0) process.exit(1)
console.log("✓ docs")
