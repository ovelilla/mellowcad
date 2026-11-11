/**
 * Names every command in a language's words in its coverage heading: ` · <tag> NAME / ALIAS`
 * after French's, built from `cad/locales/<tag>.json`'s `names` as each heading groups its
 * English (`, ` and ` · ` kept), French's trailing prose repeated (` · a system variable…`).
 *
 *   node scripts/research/coverage-names.mjs it            adds a language's
 *   node scripts/research/coverage-names.mjs fr --check    rebuilds French's, prints what differs
 *
 * Written for Italian (11/11/2026), checked against French's 106 headings. See skill add-language.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs"

const tag = process.argv[2]
const check = process.argv.includes("--check")
const en = JSON.parse(readFileSync("cad/locales/en.json", "utf8")).commands.names
const names = JSON.parse(readFileSync(`cad/locales/${tag}.json`, "utf8")).commands.names

const segment = (heading) => {
  const english = heading.split(" · es ")[0]
  const parts = english.split(/(, | · )/)
  const out = []
  for (let i = 0; i < parts.length; i += 2) {
    const spans = [...parts[i].matchAll(/`([^`]+)`/g)].map((m) => m[1])
    const words = []
    for (const s of spans)
      if (en[s] && names[s]) for (const w of names[s]) if (!words.includes(w)) words.push(w)
    if (words.length) out.push([i ? parts[i - 1] : "", words.map((w) => `\`${w}\``).join(" / ")])
  }
  return out.map(([sep, w], i) => (i ? sep : "") + w).join("")
}
// French's own text after its names (` · a system variable…`), repeated for the new language.
const extraOf = (fr) => {
  const groups = fr.split(" · ")
  const first = groups.findIndex((g, i) => i > 0 && !g.startsWith("`"))
  return first < 0 ? "" : " · " + groups.slice(first).join(" · ")
}

let changed = 0
for (const file of readdirSync("docs/coverage").filter((f) => f.endsWith(".md"))) {
  const path = `docs/coverage/${file}`
  const lines = readFileSync(path, "utf8").split("\n")
  for (const [i, line] of lines.entries()) {
    if (!line.startsWith("### ") || !line.includes(" · fr ")) continue
    // French's part ends where the next language's names begin (` · it \``).
    const rest = line.slice(line.indexOf(" · fr ") + 6)
    const next = rest.search(/ · [a-z]{2}(-[A-Z]{2})? `/)
    const fr = next < 0 ? rest : rest.slice(0, next)
    const extra = extraOf(fr)
    if (check) {
      const built = segment(line.slice(4))
      if (built !== fr.replace(extra, "")) console.log(`${file}:${i + 1}\n  had   ${fr}\n  built ${built}`)
      continue
    }
    if (line.includes(` · ${tag} `)) continue
    const words = segment(line.slice(4))
    if (!words) {
      console.log(`${file}:${i + 1} no names: ${line}`)
      continue
    }
    lines[i] = `${line} · ${tag} ${words}${extra}`
    changed++
  }
  if (!check) writeFileSync(path, lines.join("\n"))
}
if (!check) console.log(`${changed} headings`)
