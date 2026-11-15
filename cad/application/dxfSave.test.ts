import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  type CadHarness,
  createHarness,
  MemoryFileTransport,
} from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
import { createMText, createText } from "../domain/entities"
import { es } from "../locales/es"
import { fr } from "../locales/fr"
import { parseDxf } from "../serialization/dxf/readDxf"
import { DEFAULT_DXF_SETTINGS } from "./runtimeFiles"
import type { SaveAsChoice } from "./EngineState"
import type { DxfVersion } from "../serialization/dxf/writeDxf"

// SAVEAS, SAVE and DXFOUT through their Save Drawing As dialog, as AutoCAD
// 2027's desktop runs them (desktop dxf/d01, probes dxf/x015–x020).

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

function drawing() {
  const files = new MemoryFileTransport()
  const cad = createHarness({
    entities: [
      lineOf(p(0, 0), p(100, 0), { id: "L1" }),
      circleOf(p(50, 50), 10, { id: "C1" }),
    ],
    files,
  })
  return { cad, files }
}

function dxf(
  overrides: Partial<SaveAsChoice["dxf"]> = {},
  fileType: SaveAsChoice["fileType"] = "dxf2018"
): SaveAsChoice {
  return {
    fileName: "plan",
    fileType,
    dxf: { ...DEFAULT_DXF_SETTINGS, ...overrides },
  }
}

describe("the Save Drawing As dialog", () => {
  it("SAVEAS opens it on the drawing type; Cancel ends it, writing nothing", () => {
    const { cad, files } = drawing()
    expect(typed(cad, "SAVEAS")).toEqual(["SAVEAS"])
    const dialog = cad.state().saveAsDialog
    expect(dialog?.command).toBe("SAVEAS")
    expect(dialog?.fileType).toBe("drawing")
    expect(dialog?.fileName).toMatch(/\.ecad\.json$/)
    expect(dialog?.dxf).toEqual(DEFAULT_DXF_SETTINGS)

    cad.runtime.setSaveAsDialog(false)

    expect(cad.state().saveAsDialog).toBeNull()
    expect(cad.activeToolId()).toBe("select")
    expect(files.saved).toHaveLength(0)
  })

  it("names the drawing as the DXF written whole, as SAVEAS and DXFOUT do (x002)", async () => {
    const { cad } = drawing()
    typed(cad, "DXFOUT")
    await cad.runtime.saveAs(dxf())
    typed(cad, "SAVEAS")
    expect(cad.state().saveAsDialog?.fileName).toBe("plan.ecad.json")
  })

  it("DXFOUT opens it on AutoCAD 2018 DXF, named .dxf", () => {
    const { cad } = drawing()
    typed(cad, "DXFOUT")
    expect(cad.state().saveAsDialog?.fileType).toBe("dxf2018")
    expect(cad.state().saveAsDialog?.fileName).toMatch(/\.dxf$/)
  })

  it("saves the drawing type as this engine's file, under the name given", async () => {
    const { cad, files } = drawing()
    typed(cad, "SAVEAS")
    await cad.runtime.saveAs(dxf({}, "drawing"))
    expect(files.saved).toEqual([
      { text: cad.runtime.serializeDrawing(), fileName: "plan.ecad.json" },
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("writes a DXF the reader opens back, each version its $ACADVER", async () => {
    const versions = {
      dxf2018: "AC1032",
      dxf2013: "AC1027",
      dxf2010: "AC1024",
      dxf2007: "AC1021",
      dxf2004: "AC1018",
      dxf2000: "AC1015",
    } as const
    for (const [type, acadver] of Object.entries(versions)) {
      const { cad, files } = drawing()
      typed(cad, "DXFOUT")
      await cad.runtime.saveAs(dxf({}, type as SaveAsChoice["fileType"]))
      const saved = files.saved[0]
      expect(saved.fileName).toBe("plan.dxf")
      expect(saved.text).toContain(acadver)
      const back = parseDxf(saved.bytes!).drawing.entities
      expect(back.map((e) => e.type)).toEqual(["line", "circle"])
    }
  })

  it("writes binary with Format BINARY", async () => {
    const { cad, files } = drawing()
    typed(cad, "DXFOUT")
    await cad.runtime.saveAs(dxf({ binary: true }))
    expect(files.saved[0].text.startsWith("AutoCAD Binary DXF\r\n\x1a\0")).toBe(
      true
    )
    expect(parseDxf(files.saved[0].bytes!).drawing.entities).toHaveLength(2)
  })

  // 27480: the warning AutoCAD writes for any precision under 16 (x015, d01)
  it("warns below 16 decimal places and keeps DXF Options for the session", async () => {
    const { cad } = drawing()
    expect(typed(cad, "SAVEAS")).toEqual(["SAVEAS"])
    const from = cad.commandLog().length
    await cad.runtime.saveAs(dxf({ precision: 3 }))
    expect(cad.commandLog().slice(from)).toEqual([
      "Warning:  You have specified a lower precision for the DXF file, which may result in loss of drawing accuracy.",
    ])
    typed(cad, "SAVEAS")
    expect(cad.state().saveAsDialog?.dxf.precision).toBe(3)
  })

  // desktop dxf/d01: `Select objects: _L`, `1 found`, `Select objects:`
  it("with Select objects asks for the set and writes only it", async () => {
    const { cad, files } = drawing()
    typed(cad, "SAVEAS")
    await cad.runtime.saveAs(dxf({ selectObjects: true }))
    expect(cad.state().saveAsDialog).toBeNull()
    expect(cad.state().commandLine.prompt).toContain("Select objects:")
    expect(typed(cad, "_L", "")).toEqual([
      "Select objects: _L",
      "1 found",
      "Select objects:",
    ])
    expect(files.saved).toHaveLength(1)
    const back = parseDxf(files.saved[0].bytes!).drawing.entities
    expect(back.map((e) => e.type)).toEqual(["circle"])
    expect(cad.activeToolId()).toBe("select")
  })

  it("says what the file cannot hold", async () => {
    const { cad } = drawing()
    typed(cad, "_BOX", "0,0,0", "10,10,10")
    typed(cad, "DXFOUT")
    const from = cad.commandLog().length
    await cad.runtime.saveAs(dxf())
    expect(cad.commandLog().slice(from)).toEqual([
      "1 object not saved: 1 3DSOLID.",
    ])
  })

  it("is a step U names and regenerates for", async () => {
    const { cad } = drawing()
    typed(cad, "SAVEAS")
    await cad.runtime.saveAs(dxf())
    expect(typed(cad, "_U").at(-1)).toBe("SAVEAS Regenerating model.")
    expect(cad.entityCount).toBe(2)
  })

  it("SAVE opens the same dialog", () => {
    const { cad } = drawing()
    typed(cad, "SAVE")
    expect(cad.state().saveAsDialog?.command).toBe("SAVE")
  })

  // 52636: DXFOUT is SALVADXF in Spanish and SAUVEDXF in French, which the
  // French acad.pgp made an alias of SAVEAS before (x007: the command wins)
  it("is named in each command language", () => {
    for (const [locale, name] of [
      [es, "SALVADXF"],
      [fr, "SAUVEDXF"],
    ] as const) {
      const files = new MemoryFileTransport()
      const cad = createHarness({ locale, files })
      typed(cad, name)
      expect(cad.state().saveAsDialog?.command).toBe("DXFOUT")
    }
  })

  // What the reference drawings lack: arrays (AutoCAD's own is an anonymous
  // block of its items), a plane of its own, a solid fill on an arc, fitted
  // polylines in 2D and 3D, an MTEXT longer than one 250-character group.
  // The file each version writes opened in AutoCAD 2027's console with no
  // AUDIT error (scripts/research/probes/dxf/audit.sh).
  it("writes what the model makes that the reference drawings lack", async () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({
      files,
      entities: [
        createMText(p(0, -50), "Long ".repeat(130).trim(), { width: 80 }),
        createText(p(0, -80), "Middle", { justify: "mc", height: 5 }),
      ],
    })
    typed(cad, "_LINE", "0,0", "10,0", "")
    typed(cad, "_ARRAYRECT", "_L", "", "_X")
    typed(cad, "_CIRCLE", "200,0", "5")
    typed(cad, "_ARRAYPOLAR", "_L", "", "150,0", "_X")
    typed(
      cad,
      "_CIRCLE",
      "300,300",
      "10",
      "-HATCH",
      "P",
      "SOLID",
      "300,300",
      ""
    )
    typed(cad, "_UCS", "_X", "90", "_CIRCLE", "0,0", "5")
    typed(cad, "_DIMLINEAR", "20,0", "30,0", "25,5", "_UCS", "_W")
    typed(cad, "_3DPOLY", "0,0,0", "10,10,10", "20,0,5", "")
    typed(cad, "_PEDIT", "_L", "_S", "")
    typed(cad, "_PLINE", "0,50", "10,50", "20,60", "")
    typed(cad, "_PEDIT", "_L", "_F", "")
    const types = cad.runtime.document.getEntities().map((e) => e.type)
    const dir = process.env.DXF_OUT
    for (const fileType of [
      "dxf2018",
      "dxf2013",
      "dxf2010",
      "dxf2007",
      "dxf2004",
      "dxf2000",
    ] as const) {
      for (const binary of [false, true]) {
        typed(cad, "DXFOUT")
        await cad.runtime.saveAs({
          ...dxf({ binary }, fileType),
          fileName: `kinds-${fileType}${binary ? "b" : ""}`,
        })
        const saved = files.saved.at(-1)!
        if (dir) writeFileSync(join(dir, saved.fileName), saved.bytes!)
        const back = parseDxf(saved.bytes!).drawing
        expect(back.entities.map((e) => e.type)).toEqual(types)
      }
    }
  })

  // DIMENSION's 10, 13, 14 and 15 are the WCS's, its 11 the OCS's.
  it("writes a dimension in a plane of its own where it stands", async () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ files })
    typed(cad, "_UCS", "_X", "90", "_DIMLINEAR", "0,0", "10,0", "5,5")
    typed(cad, "_UCS", "_W", "DXFOUT")
    const made = cad.latest()
    await cad.runtime.saveAs(dxf())
    const back = parseDxf(files.saved[0].bytes!).drawing.entities[0]
    expect(back.type).toBe("dimension")
    if (back.type !== "dimension" || made.type !== "dimension") return
    expect(back.first).toBeCloseToPoint(made.first)
    expect(back.second).toBeCloseToPoint(made.second)
    expect(back.elevation ?? 0).toBeCloseTo(made.elevation ?? 0)
    expect(back.normal?.y).toBeCloseTo(made.normal!.y)
    expect(Math.abs(back.linePoint.y - made.linePoint.y)).toBeLessThan(1e-9)
  })

  it("reports when the host has no file access, as QSAVE does", () => {
    const cad = createHarness()
    typed(cad, "DXFOUT")
    expect(cad.state().saveAsDialog).toBeNull()
    expect(cad.commandLog().join(" ")).toMatch(/not available/i)
  })
})

// What a host writes for itself (an MCP server, a script): what DXFOUT
// writes, with no dialog, no command and nothing in the drawing's history.
describe("writeDxf, with no command", () => {
  it("writes DXFOUT's file, AutoCAD 2018 ASCII at 16 places, and leaves no trace", async () => {
    const { cad, files } = drawing()
    typed(cad, "_CIRCLE", "0,0", "1/3")
    typed(cad, "DXFOUT")
    const dialog = cad.state().saveAsDialog
    cad.runtime.setSaveAsDialog(false)
    const log = cad.commandLog()
    const { bytes, leftOut } = await cad.writeDxf()
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain("AC1032")
    expect(text).toContain("0.3333333333333333")
    expect(leftOut.size).toBe(0)
    expect(parseDxf(bytes).drawing.entities.map((e) => e.type)).toEqual([
      "line",
      "circle",
      "circle",
    ])
    await cad.writeDxf({ version: "2004", binary: true, precision: 3 })
    expect(cad.commandLog()).toEqual(log)
    expect(files.saved).toHaveLength(0)
    // The last step still the DXFOUT cancelled, then the circle; the
    // drawing's name and DXF Options as they were.
    expect(typed(cad, "_U").at(-1)).toBe("DXFOUT")
    typed(cad, "_U")
    expect(cad.entityCount).toBe(2)
    typed(cad, "DXFOUT")
    expect(cad.state().saveAsDialog).toEqual(dialog)
  })

  it("takes a version, binary and decimal places, clamped as DXF Options clamps them", async () => {
    const { cad } = drawing()
    typed(cad, "_LINE", "0,0", "0.123456789,0", "")
    const ascii = async (precision: number) =>
      new TextDecoder().decode((await cad.writeDxf({ precision })).bytes)
    expect(await ascii(3)).toContain("\r\n0.123\r\n")
    expect(await ascii(99)).toBe(await ascii(16))
    expect(await ascii(-5)).toBe(await ascii(0))
    const old = await cad.writeDxf({ version: "2000" })
    expect(new TextDecoder().decode(old.bytes)).toContain("AC1015")
    const binary = await cad.writeDxf({ binary: true })
    const head = new TextDecoder().decode(binary.bytes.slice(0, 22))
    expect(head).toBe("AutoCAD Binary DXF\r\n\x1a\0")
    expect(parseDxf(binary.bytes).drawing.entities).toHaveLength(3)
  })

  it("refuses a version it does not write, by name", async () => {
    const { cad } = drawing()
    const version = "2019" as DxfVersion
    await expect(cad.writeDxf({ version })).rejects.toThrow(
      "No DXF version 2019: one of 2018, 2013, 2010, 2007, 2004, 2000."
    )
  })

  it("counts what the file cannot hold, saying nothing", async () => {
    const { cad } = drawing()
    typed(cad, "_BOX", "0,0,0", "10,10,10")
    const log = cad.commandLog()
    const { leftOut } = await cad.writeDxf()
    expect([...leftOut]).toEqual([["3DSOLID", 1]])
    expect(cad.commandLog()).toEqual(log)
  })

  it("needs no file access", async () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    const { bytes } = await cad.writeDxf()
    expect(parseDxf(bytes).drawing.entities).toHaveLength(1)
  })
})
