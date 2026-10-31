/**
 * Extracts a language's string tables and `acad.pgp` into `research/strings/`: each resource
 * DLL's table (`st2027_<tag>.tsv` for acadres, `<dll>_<tag>.tsv` for the others), the merged
 * `all_<tag>.tsv` the other scripts read (acadres' ids bare, the others' prefixed with their
 * DLL), and `acad_<tag>.pgp`. It reads the files; nothing runs.
 *
 *   node scripts/research/extract-strings.mjs --lang pt-BR
 *   node scripts/research/extract-strings.mjs --lang pt-BR <folder> --pgp <acad.pgp>
 *
 * By default the DLLs come from the install's folder of the language's culture (`pt-BR/`, `es-ES/`),
 * which only a language pack fills, and `acad.pgp` from `UserDataCache/<culture>/Support/`. A
 * table that would change is not overwritten: move the old one to `previous/` first (it is what
 * tells an update's rewording apart), or pass `--replace`.
 *
 * See .claude/skills/autocad-research/SKILL.md.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { stringTable } from "./strtable.mjs"
import { cultureOf, language, strings } from "./tables.mjs"

const INSTALL = "/mnt/c/Program Files/Autodesk/AutoCAD 2027"
// The order of the merge, which `all_<tag>.tsv` keeps; TEXTEDIT's two strings stay out of it.
const MERGED = ["acadres", "AcDimRes", "acmtedRes", "AcArrayRes"]
const DLLS = [...MERGED, "texteditRes"]

const { lang, rest } = language(process.argv.slice(2))
const replace = rest.includes("--replace")
const pgpAt = rest.indexOf("--pgp")
const culture = cultureOf(lang)
const folder =
  rest.find((a, i) => !a.startsWith("--") && (pgpAt < 0 || i !== pgpAt + 1)) ??
  join(INSTALL, culture)
const pgp =
  pgpAt >= 0
    ? rest[pgpAt + 1]
    : join(INSTALL, "UserDataCache", culture.toLowerCase(), "Support/acad.pgp")

const missing = DLLS.filter((dll) => !existsSync(join(folder, `${dll}.dll`)))
if (missing.length) {
  console.error(
    `${folder} lacks ${missing.map((dll) => `${dll}.dll`).join(", ")}: is the ${culture} language pack installed?`
  )
  process.exit(1)
}

const fileOf = (dll) =>
  dll === "acadres" ? `st2027_${lang}.tsv` : `${dll}_${lang}.tsv`
const tables = new Map(
  DLLS.map((dll) => [dll, stringTable(join(folder, `${dll}.dll`))])
)
const merged = MERGED.flatMap((dll) =>
  tables.get(dll).map((line) => (dll === "acadres" ? line : `${dll}:${line}`))
)
const lines = (list) => Buffer.from(list.join("\n") + "\n")
const outputs = [
  ...DLLS.map((dll) => [fileOf(dll), lines(tables.get(dll))]),
  [`all_${lang}.tsv`, lines(merged)],
]
if (existsSync(pgp)) outputs.push([`acad_${lang}.pgp`, readFileSync(pgp)])
else console.error(`No ${pgp}: the aliases will not be proposed.`)

const changed = outputs.filter(([file, bytes]) => {
  const url = new URL(file, strings)
  return existsSync(url) && !readFileSync(url).equals(bytes)
})
if (changed.length && !replace) {
  console.error(
    `These would change: ${changed.map(([file]) => file).join(", ")}. Move them to research/strings/previous/ first, or pass --replace.`
  )
  process.exit(1)
}
for (const [file, bytes] of outputs) {
  writeFileSync(new URL(file, strings), bytes)
  console.log(file)
}
