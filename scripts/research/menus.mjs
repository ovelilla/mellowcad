/**
 * Prints the menus of a Windows resource DLL as `menu:id<TAB>"text"` (the text JSON-quoted; a
 * separator `menu:-`), each item in its order, a submenu's indented under it, so a language's
 * menu pairs with English's by id. It reads the PE file; nothing runs. adui26res.dll's
 * `PaletteOptionsMenu` is a palette's properties menu (docs/plans/autocad-ui.md §2.8).
 *
 *   node scripts/research/menus.mjs "/mnt/c/Program Files/Autodesk/AutoCAD 2027/es-ES/adui26res.dll"
 *
 * See .claude/skills/autocad-research/SKILL.md.
 */
import { pathToFileURL } from "node:url"
import { resources } from "./strtable.mjs"

const RT_MENU = 4
const MF_POPUP = 0x10
const MF_END = 0x80
const MF_SEPARATOR = 0x800

export function menus(dll) {
  const { pe, entries, isDirectory, below, data, name } = resources(dll)
  const lines = []
  const all = entries(0).find(({ id }) => id === RT_MENU)
  if (!all) return lines
  for (const menu of entries(below(all.offset))) {
    const label = name(menu.id) ?? String(menu.id)
    const [language] = entries(below(menu.offset))
    if (isDirectory(language.offset)) continue
    let at = data(language)
    const word = () => {
      const value = pe.readUInt16LE(at)
      at += 2
      return value
    }
    const text = () => {
      let out = ""
      for (let c = word(); c !== 0; c = word()) out += String.fromCharCode(c)
      return out
    }
    // Only the classic MENU template: MENUEX (version 1) is not read.
    if (word() !== 0) continue
    const header = word()
    at += header
    const level = (depth) => {
      for (;;) {
        const flags = word()
        const id = flags & MF_POPUP ? null : word()
        const caption = text()
        const indent = "  ".repeat(depth)
        if (caption === "" && (id === 0 || flags & MF_SEPARATOR))
          lines.push(`${label}:${indent}-`)
        else lines.push(`${label}:${indent}${id ?? "▸"}\t${JSON.stringify(caption)}`)
        if (flags & MF_POPUP) level(depth + 1)
        if (flags & MF_END) return
      }
    }
    level(0)
  }
  return lines
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const line of menus(process.argv[2])) console.log(line)
}
