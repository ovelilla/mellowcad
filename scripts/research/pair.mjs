/**
 * Prints AutoCAD's English strings that match a pattern, each beside the
 * Spanish string of the same id, from the tables in `research/strings/`.
 *
 *   node scripts/research/pair.mjs "Specify next point"
 *
 * See .github/instructions/autocad-research.instructions.md.
 */
import { readFileSync } from "node:fs"

const dir = new URL("../../research/strings/", import.meta.url)

function load(file) {
  const table = new Map()
  for (const line of readFileSync(new URL(file, dir), "utf8").split("\n")) {
    const tab = line.indexOf("\t")
    if (tab >= 0) table.set(line.slice(0, tab), line.slice(tab + 1).trimEnd())
  }
  return table
}

const en = load("all_en.tsv")
const es = load("all_es.tsv")
const pattern = new RegExp(process.argv[2], "i")
for (const [id, text] of en) {
  if (pattern.test(text)) {
    console.log(`${id}\n  EN ${text}\n  ES ${es.get(id) ?? "-"}`)
  }
}
