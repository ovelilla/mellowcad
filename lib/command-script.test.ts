import { describe, expect, it } from "vitest"

import { CadDriver, commandCatalog } from "@mellowcad/engine"

import {
  DIALOG_COMMANDS,
  MAX_SCRIPT_CHARACTERS,
  commandOf,
  MAX_SCRIPT_LINES,
  fitsScriptLimits,
  runScript,
  scriptLines,
  type ScriptTarget,
} from "./command-script"

function target(cad: CadDriver): ScriptTarget {
  return {
    keyIn: (line) => cad.keyIn(line),
    getState: () => cad.state(),
    zoomToFit: () => cad.zoomToFit(),
    cancelCommand: () => cad.cancelCommand(),
    withViewSize: (width, height, work) =>
      cad.withViewSize(width, height, work),
  }
}

describe("a script typed at the command line", () => {
  it("ends an answer at a space but in a text, `0, 0` being one point", () => {
    const cad = new CadDriver()
    const run = runScript(
      target(cad),
      "CIRCLE 50, 25 10\r\n\nTEXT 0,0 5 0\nHello, big world\n"
    )
    expect(run).toEqual({ stopped: null, cancelled: null })
    expect(cad.entities()).toMatchObject([
      { type: "circle", center: { x: 50, y: 25 }, radius: 10 },
      { type: "text", value: "Hello, big world" },
    ])
  })

  it("stops at the first refused answer and cancels what still asks", () => {
    const cad = new CadDriver()
    const run = runScript(target(cad), "LINE 0,0 10,0\nfoo\nCIRCLE 0,0 5")
    expect(run).toEqual({
      stopped: { reason: "refused", line: 2, typed: "foo", linesNotRun: 1 },
      cancelled: "LINE Specify next point or [Undo]:",
    })
    expect(cad.typeCounts()).toEqual({ line: 1 })
    expect(cad.activeToolId()).toBe("select")
  })

  it("starts at Command:, cancelling a command left open", () => {
    const cad = new CadDriver()
    cad.keyIn("LINE 0,0")
    runScript(target(cad), "CIRCLE 0,0 5")
    expect(cad.typeCounts()).toEqual({ circle: 1 })
  })

  // WHY: a typed pick takes what is within a few pixels; on a phone's
  // canvas a 100-wide wall in an 8000-wide plan is a few pixels across.
  it("picks the same objects whatever the size of the screen", () => {
    const script = [
      "RECTANG 0,0 8000,6000",
      "LINE 4000,0 4000,6000",
      "",
      "LINE 4100,0 4100,6000",
      "",
      "ERASE 4010,3000",
      "",
    ].join("\n")
    for (const [width, height] of [
      [2000, 1500],
      [360, 420],
    ]) {
      const cad = new CadDriver({ width, height })
      runScript(target(cad), script)
      expect(cad.entities()).toMatchObject([
        { type: "polyline" },
        { type: "line", start: { x: 4100 } },
      ])
    }
  })
})

describe("a command that opens a dialog box", () => {
  it("stops the script before it, by name or alias", () => {
    for (const typed of ["LAYER", "la", "_LAYER", "'LA"]) {
      const cad = new CadDriver()
      const run = runScript(target(cad), `CIRCLE 0,0 5\n${typed}\nWALLS`)
      expect(run.stopped).toEqual({
        reason: "dialog",
        line: 2,
        typed,
        linesNotRun: 1,
      })
      expect(cad.typeCounts()).toEqual({ circle: 1 })
    }
  })

  it("is known for every command that opens one", () => {
    // What each command does when typed at Command: alone, read off the
    // engine: a palette shown, or a dialog the host would draw.
    const opening = commandCatalog().filter(({ id }) => {
      const cad = new CadDriver()
      const before = cad.state().palette
      cad.keyIn(id)
      const state = cad.state()
      const opens =
        state.palette !== before ||
        state.unitsDialog ||
        state.pointStyleDialog ||
        state.styleDialog !== null ||
        state.saveAsDialog !== null
      cad.dispose()
      return opens
    })
    expect(opening.map(({ id }) => id).sort()).toEqual(
      Object.keys(DIALOG_COMMANDS).sort()
    )
    for (const instead of Object.values(DIALOG_COMMANDS)) {
      if (instead !== null) expect(commandOf(instead)).toBe(instead)
    }
  })

  it("is not looked for inside a command", () => {
    const cad = new CadDriver()
    const run = runScript(target(cad), "-LAYER\nM\nLAYER\n")
    expect(run.stopped).toBeNull()
    expect(cad.state().layers.map((layer) => layer.name)).toEqual([
      "0",
      "LAYER",
    ])
  })
})

describe("a run's limits", () => {
  it("stops before the answer that finds the time run out", () => {
    const cad = new CadDriver()
    // The clock passes the deadline once the first circle is drawn.
    const run = runScript(target(cad), "CIRCLE 0,0 5\nCIRCLE 0,0 6", {
      deadline: 1000,
      now: () => (cad.entityCount > 0 ? 2000 : 0),
    })
    expect(run.stopped).toEqual({
      reason: "time",
      line: 2,
      typed: "CIRCLE",
      linesNotRun: 0,
    })
    expect(cad.typeCounts()).toEqual({ circle: 1 })
  })

  it("stops once the drawing holds more objects than it may", () => {
    const cad = new CadDriver()
    const run = runScript(
      target(cad),
      "LINE 0,0 1,0 2,0 3,0 4,0\nCIRCLE 0,0 5",
      { maxObjects: 2 }
    )
    expect(run).toEqual({
      stopped: { reason: "objects", line: 1, typed: "4,0", linesNotRun: 1 },
      cancelled: "LINE Specify next point or [Close/Undo]:",
    })
    expect(cad.typeCounts()).toEqual({ line: 3 })
  })
})

describe("a script's size", () => {
  it("is held to what one run takes", () => {
    expect(scriptLines("a\r\nb\rc\nd")).toEqual(["a", "b", "c", "d"])
    expect(fitsScriptLimits("CIRCLE 0,0 5")).toBe(true)
    expect(fitsScriptLimits("x".repeat(MAX_SCRIPT_CHARACTERS + 1))).toBe(false)
    expect(fitsScriptLimits("\n".repeat(MAX_SCRIPT_LINES))).toBe(false)
  })
})
