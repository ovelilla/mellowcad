/**
 * Prints the dialogs of a Windows resource DLL as `dialog:control<TAB>"text"` (the text
 * JSON-quoted; `dialog:title` for the caption), so a language's dialog pairs with English's by id:
 * the same dialog and control id hold the same label. It reads the PE file; nothing runs.
 *
 *   node scripts/research/dialogs.mjs "/mnt/c/Program Files/Autodesk/AutoCAD 2027/pt-BR/AcDimRes.dll"
 *
 * The UTF-16 runs of the file read in order pair wrongly: an accented letter splits a run, and
 * pt-BR's `Offset from dim line` came out `Deslocar da linha de cota` that way, where the
 * control says `Deslocar a partir da linha de cota` (the language review of 31/10/2026).
 * See .claude/skills/autocad-research/SKILL.md.
 */
import { pathToFileURL } from "node:url"
import { resources } from "./strtable.mjs"

const RT_DIALOG = 5
const DS_SETFONT = 0x40

export function dialogs(dll) {
  const { pe, entries, isDirectory, below, data } = resources(dll)
  const lines = []
  const all = entries(0).find(({ id }) => id === RT_DIALOG)
  if (!all) return lines
  for (const dialog of entries(below(all.offset))) {
    const [language] = entries(below(dialog.offset))
    if (isDirectory(language.offset)) continue
    const start = data(language)
    let at = start
    const word = () => {
      const value = pe.readUInt16LE(at)
      at += 2
      return value
    }
    // A name or an ordinal: 0 is none, 0xFFFF an ordinal, else a NUL-ended string.
    const nameOrOrdinal = () => {
      const first = pe.readUInt16LE(at)
      if (first === 0) return void (at += 2)
      if (first === 0xffff) return void (at += 4)
      let text = ""
      for (let c = word(); c !== 0; c = word()) text += String.fromCharCode(c)
      return text
    }
    // DLGTEMPLATEEX starts with its version 1 and the signature 0xFFFF; DLGTEMPLATE does not.
    const extended = pe.readUInt16LE(at + 2) === 0xffff
    if (extended) at += 12
    const style = pe.readUInt32LE(at)
    at += extended ? 4 : 8
    const count = word()
    at += 8
    nameOrOrdinal()
    nameOrOrdinal()
    const title = nameOrOrdinal()
    if (title) lines.push(`${dialog.id}:title\t${JSON.stringify(title)}`)
    if (style & DS_SETFONT) {
      at += extended ? 6 : 2
      nameOrOrdinal()
    }
    for (let i = 0; i < count; i++) {
      // Each item starts on a DWORD boundary of the template.
      at = start + ((at - start + 3) & ~3)
      let id
      if (extended) {
        at += 20
        id = pe.readUInt32LE(at)
        at += 4
      } else {
        at += 16
        id = word()
      }
      nameOrOrdinal()
      const text = nameOrOrdinal()
      // Its creation data, skipped. (`at += word()` would read `at` before word() moves it.)
      const extra = word()
      at += extra
      // Static labels share the id -1: they pair by their place in the dialog instead.
      const control = id === 0xffff || id === 0xffffffff ? `s${i}` : id
      if (text) lines.push(`${dialog.id}:${control}\t${JSON.stringify(text)}`)
    }
  }
  return lines
}

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  for (const line of dialogs(process.argv[2])) console.log(line)
