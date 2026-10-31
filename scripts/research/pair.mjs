/**
 * Prints AutoCAD's English strings that match a pattern, each beside the translated string of
 * the same id, from the tables in `research/strings/`. Spanish unless `--lang` names another.
 *
 *   node scripts/research/pair.mjs "Specify next point"
 *   node scripts/research/pair.mjs --lang pt-BR "Specify next point"
 *
 * See .claude/skills/autocad-research/SKILL.md.
 */
import { readFileSync } from "node:fs"

import { language, strings, translatedFile } from "./tables.mjs"

function load(file) {
  const table = new Map()
  for (const line of readFileSync(new URL(file, strings), "utf8").split("\n")) {
    const tab = line.indexOf("\t")
    if (tab >= 0) table.set(line.slice(0, tab), line.slice(tab + 1).trimEnd())
  }
  return table
}

const { lang, rest } = language(process.argv.slice(2))
const en = load("all_en.tsv")
const translated = load(translatedFile(lang))
const label = lang.toUpperCase()
const pattern = new RegExp(rest[0], "i")
for (const [id, text] of en) {
  if (pattern.test(text)) {
    console.log(`${id}\n  EN ${text}\n  ${label} ${translated.get(id) ?? "-"}`)
  }
}
