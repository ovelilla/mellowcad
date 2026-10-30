/**
 * Moves the examples' ranges of our packages to each package's version, after
 * `changeset version` has bumped them (`npm run version-packages`). The
 * examples are not workspaces, so Changesets does not see them, and
 * `test/packages.test.ts` fails until they ask for `^<version>`.
 *
 * Only the range strings are rewritten, so the files keep their formatting.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

function readJson(file: string): { name: string; version: string } {
  return JSON.parse(readFileSync(path.join(ROOT, file), "utf8"))
}

const ours = [
  "cad",
  ...readdirSync(path.join(ROOT, "packages")).map((dir) => `packages/${dir}`),
].map((dir) => readJson(`${dir}/package.json`))

for (const dir of readdirSync(path.join(ROOT, "examples"))) {
  const file = path.join(ROOT, "examples", dir, "package.json")
  const before = readFileSync(file, "utf8")
  let after = before
  for (const { name, version } of ours) {
    after = after.replace(
      new RegExp(`("${name}":\\s*)"[^"]*"`, "g"),
      `$1"^${version}"`
    )
  }
  if (after !== before) {
    writeFileSync(file, after)
    console.log(`examples/${dir}: ranges moved`)
  }
}
