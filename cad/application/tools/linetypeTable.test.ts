import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { createBlockDefinition, createInsert } from "../../domain/entities"
import { es } from "../../locales/es"

/**
 * The drawing's own linetypes, a table as AutoCAD's LTYPE: what PURGE takes
 * out of it, what CHPROP loads into it and sets on objects (LType, ltScale),
 * CELTSCALE, the Properties palette's Linetype scale and what a paste
 * brings in. Probes ltype/p03, p04, p05, p09, p11, p12; chprop/p08, p08b.
 */

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const names = (cad: CadHarness) =>
  cad.runtime.document.getLinetypes().map((linetype) => linetype.name)

describe("PURGE's LTypes", () => {
  it("deletes the unused ones, naming each, but Continuous, the current one and one in use (ltype/p04)", () => {
    const cad = createHarness({
      entities: [{ ...lineOf(p(0, 0), p(10, 0)), linetype: "DASHED" }],
      blocks: [
        createBlockDefinition("B", p(0, 0), [
          { ...lineOf(p(0, 0), p(1, 0), { id: "b1" }), linetype: "PHANTOM" },
        ]),
      ],
    })
    cad.runtime.updateLayer("0", { linetype: "CENTER" })
    cad.runtime.setCurrentLinetype("HIDDEN")

    answer(cad, "-PURGE", "LT", "", "N")

    expect(cad.commandLog().slice(-2)).toEqual([
      'Deleting linetype "DASHDOT".',
      "1 linetype deleted.",
    ])
    expect(names(cad)).toEqual([
      "Continuous",
      "DASHED",
      "HIDDEN",
      "CENTER",
      "PHANTOM",
    ])
    answer(cad, "-PURGE", "LT", "", "N")
    expect(cad.commandLog().at(-1)).toBe("No unreferenced linetypes found.")

    // One undo step puts it back where it was.
    answer(cad, "U", "U")
    expect(names(cad)).toEqual([
      "Continuous",
      "DASHED",
      "HIDDEN",
      "CENTER",
      "PHANTOM",
      "DASHDOT",
    ])
  })

  it("asks each when verifying, and deletes those answered Yes (ltype/p09)", () => {
    const cad = answer(createHarness(), "PURGE", "LT", "D*", "")
    expect(cad.state().commandLine.prompt).toBe(
      'PURGE Purge linetype "DASHED"? <N>'
    )
    answer(cad, "Y", "N")
    expect(names(cad)).toEqual([
      "Continuous",
      "HIDDEN",
      "CENTER",
      "PHANTOM",
      "DASHDOT",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("speaks Spanish AutoCAD's words (ltype/p11, p12)", () => {
    const cad = answer(createHarness({ locale: es }), "-LIMPIA", "L", "", "N")
    expect(cad.commandLog().at(-1)).toBe("5 tipos de línea suprimido(s).")
    answer(cad, "-LIMPIA", "L", "", "N")
    expect(cad.commandLog().at(-1)).toBe(
      "No se ha encontrado ningún elemento sin referencia tipos de línea."
    )
  })
})

describe("CHPROP's linetype", () => {
  it("loads a linetype the drawing lacks from acad.lin, in inches (ltype/p03)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    answer(cad, "CHPROP", "L", "", "LT", "dashed2", "")

    expect(cad.only("line").linetype).toBe("DASHED2")
    expect(cad.runtime.document.getLinetype("DASHED2")?.pattern).toEqual([
      0.25, -0.125,
    ])
    answer(cad, "CHPROP", "L", "", "LT", "NOPE")
    expect(cad.commandLog().at(-1)).toBe(
      'Linetype "NOPE" not found.  Use LINETYPE command to load it.'
    )
  })

  it("sets an object's own scale: a distance, its size, 0 refused (chprop/p08, p08b)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(10, 0), { id: "L1" }),
        lineOf(p(0, 5), p(10, 5), { id: "L2" }),
      ],
    })
    answer(cad, "CHPROP", "L", "", "S")
    expect(cad.state().commandLine.prompt).toBe(
      "CHPROP Specify new linetype scale <1.00>:"
    )
    answer(cad, "0")
    expect(cad.commandLog().at(-1)).toBe("Value must be nonzero.")
    answer(cad, "-2", "")
    expect(cad.entities().find((e) => e.id === "L2")?.linetypeScale).toBe(2)
    expect(cad.entities().find((e) => e.id === "L1")?.linetypeScale).toBe(
      undefined
    )

    answer(cad, "CHPROP", "ALL", "", "S")
    expect(cad.state().commandLine.prompt).toBe(
      "CHPROP Specify new linetype scale <varies>:"
    )
    answer(cad, "1", "")
    expect(cad.entities().every((e) => e.linetypeScale === undefined)).toBe(
      true
    )
  })
})

describe("CELTSCALE", () => {
  it("is the scale each new object takes as its own, above 0 (ltype/p05)", () => {
    const cad = answer(createHarness(), "CELTSCALE")
    expect(cad.state().commandLine.prompt).toBe(
      "CELTSCALE Enter new value for CELTSCALE <1.00>:"
    )
    answer(cad, "0")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Cannot set CELTSCALE to that value.",
      "*Invalid*",
    ])
    answer(cad, "CELTSCALE", "0.5")
    cad.command("LINE").click(p(0, 0)).click(p(10, 0)).escape()
    expect(cad.only("line").linetypeScale).toBe(0.5)
    expect(cad.runtime.document.getSettings().currentLinetypeScale).toBe(0.5)
  })

  it("leaves a 3D solid at 1, as AutoCAD's BOX (primitives/p421)", () => {
    const cad = answer(createHarness(), "CELTSCALE", "2")
    cad
      .command("BOX")
      .type("0,0")
      .enter()
      .type("10,20")
      .enter()
      .type("5")
      .enter()
    expect(cad.only("solid3d").linetypeScale).toBeUndefined()
  })
})

describe("the Properties palette's Linetype scale", () => {
  it("shows an object's own and sets it, a scale above 0", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })],
    })
    cad.select("L1")
    const row = () =>
      cad.state().properties.info?.general.find((r) => r.id === "linetypeScale")
    expect(row()).toMatchObject({ label: "Linetype scale", value: "1.00" })

    expect(cad.runtime.setSelectionProperty("linetypeScale", "3")).toBe(true)
    expect(cad.only("line").linetypeScale).toBe(3)
    expect(row()?.value).toBe("3.00")
    expect(cad.runtime.setSelectionProperty("linetypeScale", "0")).toBe(false)
    expect(cad.only("line").linetypeScale).toBe(3)
  })
})

describe("a paste", () => {
  it("brings the linetypes its objects name, and undo takes them back", async () => {
    const from = createHarness({
      entities: [
        { ...lineOf(p(0, 0), p(10, 0), { id: "L1" }), linetype: "GAS_LINE" },
      ],
    })
    answer(from, "-LINETYPE", "L", "GAS_LINE", "", "")
    const to = createHarness({ clipboard: from.clipboard })
    from.select("L1").command("COPYCLIP")

    await to.runtime.pasteFromClipboard()
    to.click(p(50, 50))
    expect(to.runtime.document.getLinetype("GAS_LINE")?.elements).toHaveLength(
      1
    )
    to.command("U")
    expect(to.runtime.document.getLinetype("GAS_LINE")).toBeUndefined()
  })
})

describe("NEW and a paste", () => {
  it("NEW starts again from the six", () => {
    const cad = answer(createHarness(), "-LINETYPE", "L", "GAS_LINE", "", "")
    answer(cad, "-PURGE", "LT", "DASHED", "N")
    expect(names(cad)).toContain("GAS_LINE")
    cad.runtime.newDrawing()
    expect(names(cad)).toEqual([
      "Continuous",
      "DASHED",
      "HIDDEN",
      "CENTER",
      "PHANTOM",
      "DASHDOT",
    ])
  })

  it("brings no linetype the copied objects do not use, whatever CELTYPE is", async () => {
    const from = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })],
    })
    answer(from, "-LINETYPE", "S", "GAS_LINE", "")
    const to = createHarness({ clipboard: from.clipboard })
    from.select("L1").command("COPYCLIP")

    await to.runtime.pasteFromClipboard()
    to.click(p(50, 50))
    expect(to.runtime.document.getLinetype("GAS_LINE")).toBeUndefined()
  })
})

describe("a reference's objects", () => {
  it("keep their linetypes through a block", () => {
    const cad = createHarness({
      blocks: [
        createBlockDefinition("B", p(0, 0), [
          { ...lineOf(p(0, 0), p(1, 0), { id: "b1" }), linetype: "HIDDEN" },
        ]),
      ],
      entities: [createInsert("B", p(0, 0), { id: "I1" })],
    })
    expect(cad.runtime.document.canRemoveLinetype("HIDDEN")).toBe(false)
    expect(cad.runtime.document.canRemoveLinetype("DASHED")).toBe(true)
    expect(cad.runtime.document.canRemoveLinetype("continuous")).toBe(false)
  })
})
