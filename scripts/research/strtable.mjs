/**
 * Prints the string table of a Windows resource DLL as `id<TAB>"text"` (the text JSON-quoted),
 * the format of `research/strings/`. It reads the PE file; nothing runs. extract-strings.mjs runs it
 * over a language's DLLs.
 *
 *   node scripts/research/strtable.mjs "/mnt/c/Program Files/Autodesk/AutoCAD 2027/en-US/acadres.dll"
 *
 * See .claude/skills/autocad-research/SKILL.md.
 */
import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

export function stringTable(dll) {
  const pe = readFileSync(dll)
  const header = pe.readUInt32LE(0x3c)
  const sections = pe.readUInt16LE(header + 6)
  const optional = header + 24
  const optionalSize = pe.readUInt16LE(header + 20)
  // The data directories start after the standard fields, which PE32+ widens by 16 bytes.
  const directories =
    optional + (pe.readUInt16LE(optional) === 0x20b ? 112 : 96)
  const resourceRva = pe.readUInt32LE(directories + 2 * 8)

  const table = []
  for (let i = 0; i < sections; i++) {
    const at = optional + optionalSize + i * 40
    table.push({
      rva: pe.readUInt32LE(at + 12),
      size: Math.max(pe.readUInt32LE(at + 8), pe.readUInt32LE(at + 16)),
      raw: pe.readUInt32LE(at + 20),
    })
  }
  const offsetOf = (rva) => {
    const s = table.find(
      ({ rva: start, size }) => rva >= start && rva < start + size
    )
    return rva - s.rva + s.raw
  }
  const root = offsetOf(resourceRva)

  function entries(directory) {
    const at = root + directory
    const count = pe.readUInt16LE(at + 12) + pe.readUInt16LE(at + 14)
    return Array.from({ length: count }, (_, i) => ({
      id: pe.readUInt32LE(at + 16 + i * 8),
      offset: pe.readUInt32LE(at + 20 + i * 8),
    }))
  }
  const isDirectory = (offset) => (offset & 0x80000000) !== 0
  const below = (offset) => offset & 0x7fffffff

  const RT_STRING = 6
  const lines = []
  const strings = entries(0).find(({ id }) => id === RT_STRING)
  for (const block of entries(below(strings.offset))) {
    // A string table resource holds 16 strings: block N has ids (N - 1) * 16 to N * 16 - 1.
    const [language] = entries(below(block.offset))
    if (isDirectory(language.offset)) continue
    let at = offsetOf(pe.readUInt32LE(root + language.offset))
    for (let i = 0; i < 16; i++) {
      const length = pe.readUInt16LE(at)
      const text = pe.toString("utf16le", at + 2, at + 2 + length * 2)
      at += 2 + length * 2
      if (length > 0)
        lines.push(`${(block.id - 1) * 16 + i}\t${JSON.stringify(text)}`)
    }
  }
  return lines
}

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  for (const line of stringTable(process.argv[2])) console.log(line)
