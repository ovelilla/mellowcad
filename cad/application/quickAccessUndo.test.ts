import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { es } from "../locales/es"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `run` adds to the history. */
function written(cad: CadHarness, run: () => void): string[] {
  const from = cad.commandLog().length
  run()
  return cad.commandLog().slice(from)
}

const ASK =
  "Enter the number of operations to undo or [Auto/Control/BEgin/End/Mark/Back] <1>:"
const SETTINGS =
  "Current settings: Auto = On, Control = All, Combine = Yes, Layer = Yes"

// The Quick Access Toolbar's Undo ▾ and Redo ▾, desktop 2026-11-25
// (research/ui/2026-11-25): each list names a step by its command, its
// first letter capital, the next step first; the button and the n-th row
// run `_.undo` or `_.mredo` answered n.
describe("the Quick Access Toolbar's Undo and Redo lists", () => {
  it("name each step as AutoCAD's list does, the next first", () => {
    const cad = answer(
      createHarness(),
      ...["L", "0,0", "10,0", ""],
      ...["_LINE", "0,5", "10,5", ""],
      ...["_CIRCLE", "5,5", "2"],
      ...["ZOOM", "2x"],
      ...["ZOOM", "0.5x"],
      ...["UNDO", "_BE"],
      ...["_CIRCLE", "0,0", "1"],
      ...["UNDO", "_E"],
      ...["UNDO", "_M"],
      ...["-LAYER", "_M", "XX", ""],
      ...["_LTSCALE", "2"]
    )
    expect(cad.state().undoSteps).toEqual([
      "Ltscale",
      "Layer",
      "- Mark -",
      "Group of commands",
      "Zoom",
      "Circle",
      "Line",
      "Line",
    ])
    expect(cad.state().redoSteps).toEqual([])
  })

  it("name them in the command language", () => {
    const cad = answer(
      createHarness({ locale: es }),
      ...["LINEA", "0,0", "10,0", ""],
      ...["_CIRCLE", "5,5", "2"],
      ...["DESHACER", "_M"],
      ...["-CAPA", "_M", "XX", ""]
    )
    expect(cad.state().undoSteps).toEqual([
      "Capa",
      "- Marca -",
      "Circulo",
      "Linea",
    ])
  })

  it("run `_.undo` answered with the row's place, and list the redo", () => {
    const cad = answer(
      createHarness(),
      ...["L", "0,0", "10,0", ""],
      ...["_CIRCLE", "5,5", "2"],
      ...["_LTSCALE", "2"]
    )
    expect(written(cad, () => cad.runtime.undoSteps(2))).toEqual([
      "_.undo",
      SETTINGS,
      `${ASK} 2`,
      "LTSCALE CIRCLE Regenerating model.",
    ])
    expect(cad.state().undoSteps).toEqual(["Line"])
    expect(cad.state().redoSteps).toEqual(["Circle", "Ltscale"])
    expect(written(cad, () => cad.runtime.redoSteps(1))).toEqual([
      "_.mredo",
      "Enter number of actions or [All/Last]: 1",
      "CIRCLE",
    ])
    expect(cad.state().redoSteps).toEqual(["Ltscale"])
  })

  it("cancel the running command first, which then goes whole", () => {
    const cad = answer(createHarness(), "_LINE", "0,0", "5,5")
    const lines = written(cad, () => cad.runtime.undoSteps(1))
    expect(lines.at(0)).toMatch(/\*Cancel\*$/)
    expect(lines.slice(1)).toEqual(["_.undo", SETTINGS, `${ASK} 1`, "LINE"])
    expect(cad.entityCount).toBe(0)
  })

  it("list a running command as the one step its cancel leaves", () => {
    const cad = answer(
      createHarness(),
      ...["_CIRCLE", "5,5", "2"],
      ...["_LINE", "0,0", "5,5", "10,0"]
    )
    expect(cad.state().undoSteps).toEqual(["Line", "Circle"])
    cad.runtime.undoSteps(1)
    expect(cad.entityCount).toBe(1)
    expect(cad.state().undoSteps).toEqual(["Circle"])

    // LINE cancelled with nothing drawn is a step too (move/p07), the one
    // the first row takes back.
    const started = answer(createHarness(), ...["_CIRCLE", "5,5", "2"], "_LINE")
    expect(started.state().undoSteps).toEqual(["Line", "Circle"])
    started.runtime.undoSteps(1)
    expect(started.entityCount).toBe(1)
    expect(started.state().undoSteps).toEqual(["Circle"])
  })

  it("stop at the start of a group UNDO BEgin opened", () => {
    const cad = answer(
      createHarness(),
      ...["L", "0,0", "10,0", ""],
      ...["UNDO", "_BE"],
      ...["_CIRCLE", "5,5", "2"]
    )
    expect(cad.state().undoSteps).toEqual(["Circle"])
  })
})
