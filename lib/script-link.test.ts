import { describe, expect, it } from "vitest"

import { MAX_SCRIPT_CHARACTERS } from "./command-script"
import {
  decodeScript,
  encodeScript,
  runDrawing,
  runHref,
  scriptOfHash,
  withRun,
} from "./script-link"

function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  }
}

describe("a link that types a script", () => {
  it("is legible: a space is +, a line break ;", () => {
    expect(runHref("/draw", "CIRCLE 50,25 10\nLINE 0,0 @100<45\n")).toBe(
      "/draw#run=CIRCLE+50,25+10;LINE+0,0+@100%3C45%0A"
    )
  })

  it("carries every character back as it was", () => {
    const script =
      "TEXT 0,0 5 0\nA+B; 50% (rough) it's #1 & done!\r\n-LAYER M WALLS\n\n"
    const href = runHref("/es/draw", script)
    expect(href).toMatch(/^\/es\/draw#run=[^\s()'!*#]*$/)
    expect(scriptOfHash(new URL(href, "https://x.invalid").hash)).toBe(
      script.replace("\r\n", "\n")
    )
  })

  // An autolink drops every punctuation mark it ends on: a script's last
  // Enters (`;;`) would go, and its last command be left asking.
  it("never ends on what a chat would leave out of the link", () => {
    for (const end of [".", ",", ":", "_", "~", ")", "!", "*", "\n", ".\n\n"]) {
      const script = `TEXT 0,0 5 0\nEnd${end}`
      const encoded = encodeScript(script)
      expect(encoded).toMatch(/([A-Za-z0-9+]|%[0-9A-F]{2})$/)
      expect(decodeScript(encoded)).toBe(script)
    }
    expect(encodeScript("ERASE 0,0\n\n")).toBe("ERASE+0,0%0A%0A")
  })

  it("reads the fragment as the browser gives it", () => {
    expect(scriptOfHash("#run=CIRCLE%200,0%2010")).toBe("CIRCLE 0,0 10")
    expect(scriptOfHash("#x=1&run=L+0,0+1,1")).toBe("L 0,0 1,1")
    expect(scriptOfHash("#run=")).toBe("")
    expect(scriptOfHash("")).toBeNull()
    expect(scriptOfHash("#runner=LINE")).toBeNull()
    expect(scriptOfHash("#run=%E0%A4%A")).toBeNull()
    expect(scriptOfHash(`#run=${"x".repeat(MAX_SCRIPT_CHARACTERS + 1)}`)).toBe(
      null
    )
  })

  it("keeps the script in the editor's other languages", () => {
    expect(withRun("/es/draw", "CIRCLE 0,0 5")).toBe(
      "/es/draw#run=CIRCLE+0,0+5"
    )
    expect(withRun("/fr/draw#old", "L")).toBe("/fr/draw#run=L")
  })
})

describe("the drawing a link typed", () => {
  it("never touches the editor's own autosave", () => {
    const storage = memoryStorage()
    storage.setItem("mellowcad:drawing:v1", "mine")
    const run = runDrawing("CIRCLE 0,0 5", () => storage)
    run.store.write("typed")
    expect(storage.getItem("mellowcad:drawing:v1")).toBe("mine")
  })

  it("is typed once: a reload finds it as it was left", () => {
    const storage = memoryStorage()
    const first = runDrawing("CIRCLE 0,0 5", () => storage)
    expect(first.pending).toBe(true)
    expect(first.store.read()).toBeNull()
    first.store.write("drawn and edited")

    const again = runDrawing("CIRCLE 0,0 5", () => storage)
    expect(again.pending).toBe(false)
    expect(again.store.read()).toBe("drawn and edited")
  })

  // Links have no end: one place, or a full storage silences the autosave.
  it("gives way to another link's, in one place", () => {
    const storage = memoryStorage()
    const first = runDrawing("CIRCLE 0,0 5", () => storage)
    first.store.write("circle")

    const other = runDrawing("LINE 0,0 1,1", () => storage)
    expect(other.pending).toBe(true)
    expect(other.store.read()).toBeNull()
    other.store.write("line")
    expect(storage.length).toBe(1)
  })

  // Each link opens a tab: one tab's autosave never lands under another's
  // script, or a reload there shows the wrong drawing as its own.
  it("never shows one link the drawing another tab saved", () => {
    const storage = memoryStorage()
    const tabA = runDrawing("CIRCLE 0,0 5", () => storage)
    const tabB = runDrawing("LINE 0,0 1,1", () => storage)
    tabB.store.write("line")
    tabA.store.write("circle, edited")

    const reloadB = runDrawing("LINE 0,0 1,1", () => storage)
    expect(reloadB.pending).toBe(true)
    expect(reloadB.store.read()).toBeNull()
  })

  it("is typed again when what it kept is no entry of its", () => {
    const storage = memoryStorage()
    storage.setItem("mellowcad:run:v1", "not json")
    expect(runDrawing("L", () => storage).pending).toBe(true)
  })

  it("is typed on each visit where storage is blocked", () => {
    const blocked = () => {
      throw new Error("SecurityError")
    }
    const run = runDrawing("CIRCLE 0,0 5", blocked)
    expect(run.pending).toBe(true)
    expect(() => run.store.write("x")).not.toThrow()
    expect(run.store.read()).toBeNull()
  })
})
