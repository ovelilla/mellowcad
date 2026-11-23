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
      dxfR12: "AC1009",
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
      "dxfR12",
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
        // R12 makes its MTEXT a reference to a block of it; its hatch too,
        // which is read back from that reference's xdata as the hatch.
        expect(back.entities.map((e) => e.type)).toEqual(
          fileType === "dxfR12"
            ? types.map((t) => (t === "mtext" ? "insert" : t))
            : types
        )
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
      "No DXF version 2019: one of 2018, 2013, 2010, 2007, 2004, 2000, R12."
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

  // x054–x057: AutoCAD 2027's R12 writes each solid as a reference on its
  // layer to a *U block of its faces' edges, each once per face it bounds, a
  // flat face's in its plane (210).
  it("writes a solid of curved faces in R12 as AutoCAD does, its faces' edges", async () => {
    const cad = createHarness({})
    typed(cad, "_-LAYER", "_M", "SOL", "")
    typed(cad, "_CYLINDER", "0,0,0", "10", "30")
    typed(cad, "_SPHERE", "50,0,0", "10")
    typed(cad, "_CONE", "100,0,0", "10", "30")
    typed(cad, "_TORUS", "160,0,0", "15", "3")
    typed(cad, "_CYLINDER", "_E", "0,60,0", "@20,0", "10,68", "30")
    typed(cad, "_BOX", "100,60,0", "@40,40,20")
    // A spindle torus and a lemon: their poles, x057.
    typed(cad, "_TORUS", "200,0,0", "5", "10")
    typed(cad, "_TORUS", "260,0,0", "-5", "10")
    expect(cad.entityCount).toBe(8)
    const { bytes, leftOut } = await cad.writeDxf({ version: "R12" })
    expect(leftOut.size).toBe(0)
    // The console opens these and plots them as x056-2018-R12.dxf, AutoCAD's
    // R12 of the same commands.
    const dir = process.env.DXF_OUT
    if (dir) {
      writeFileSync(join(dir, "curved-R12.dxf"), bytes)
      const binary = await cad.writeDxf({ version: "R12", binary: true })
      writeFileSync(join(dir, "curved-R12b.dxf"), binary.bytes)
    }
    const lines = new TextDecoder("latin1").decode(bytes).split("\r\n")
    const pairs: [string, string][] = []
    for (let i = 0; i + 1 < lines.length; i += 2) {
      pairs.push([lines[i].trim(), lines[i + 1]])
    }
    // Each *U block's objects, each its type and groups but its handle, and
    // each INSERT's layer and block.
    const blocks = new Map<string, string[]>()
    let block: string[] | null = null
    const inserts: [layer: string, block: string][] = []
    let entities = false
    pairs.forEach(([code, value], i) => {
      if (code === "0" && value === "BLOCK") {
        const name = pairs.slice(i).find(([c]) => c === "2")![1]
        blocks.set(name, (block = []))
      } else if (code === "0" && value === "ENDBLK") block = null
      else if (code === "0" && block) block.push(value)
      else if (block && block.length > 0 && code !== "5") {
        block[block.length - 1] += ` ${code}=${value.trim()}`
      }
      if (code === "2" && value === "ENTITIES") entities = true
      if (entities && code === "0" && value === "INSERT") {
        const groups = new Map(pairs.slice(i + 1, i + 8))
        inserts.push([groups.get("8")!, groups.get("2")!])
      }
    })
    const objects = inserts.map(([, name]) => blocks.get(name) ?? [])
    const counted = (rows: readonly string[], key: (row: string) => string) =>
      Object.entries(Object.groupBy(rows, key)).map(
        ([k, all]) => `${all!.length} ${k}`
      )
    const type = (row: string) => row.split(" ")[0]
    expect(inserts.map(([layer]) => layer)).toEqual(Array(8).fill("SOL"))
    expect(objects.map((rows) => counted(rows, type))).toEqual([
      ["4 CIRCLE"],
      [],
      ["2 CIRCLE", "1 POINT"],
      [],
      ["4 POLYLINE", "516 VERTEX", "4 SEQEND"],
      ["24 LINE"],
      ["2 POINT"],
      ["2 POINT"],
    ])
    // The cone's apex, and each torus' poles (x057: z ±8.660254).
    const points = (rows: readonly string[]) =>
      rows.filter((r) => type(r) === "POINT").map((r) => r.split(" 10=")[1])
    expect(points(objects[2])).toEqual(["100.0 20=0.0 30=30.0"])
    for (const [i, x] of [
      [6, "200.0"],
      [7, "260.0"],
    ] as const) {
      expect(
        points(objects[i]).map((p) => p.replace(/(\.\d{6})\d*/g, "$1"))
      ).toEqual([`${x} 20=0.0 30=8.660254`, `${x} 20=0.0 30=-8.660254`])
    }
    // The box's LINEs in their faces' planes, four in each (x056).
    const plane = (row: string) => row.match(/ 210=.*/)?.[0].trim() ?? "+Z"
    expect(counted(objects[5], plane).sort()).toEqual(
      [
        "4 +Z",
        "4 210=0.0 220=0.0 230=-1.0",
        "4 210=0.0 220=-1.0 230=0.0",
        "4 210=-1.0 220=0.0 230=0.0",
        "4 210=0.0 220=1.0 230=0.0",
        "4 210=1.0 220=0.0 230=0.0",
      ].sort()
    )
  })

  // x058: AutoCAD 2027's EXTMIN and EXTMAX of these objects, the box in
  // space, getvar's and its DXFOUT's alike (its file's to 1e-5: it writes
  // -15.00000321821426). A cone's, a cylinder's and the elliptical one's base
  // edge face down, as do a circle, an arc and an ellipse AutoCAD drew in a
  // UCS turned 180° about X, and their own planes read them mirrored.
  it("writes the box of objects facing down in space, as AutoCAD's EXTMIN and EXTMAX", async () => {
    // x058's own three, as its DXFOUT wrote them: a UCS facing down is the
    // WCS to our tools, so CIRCLE there draws one facing up.
    const down = ["210", "0.0", "220", "-0.0000000000000001", "230", "-1.0"]
    const facingDown = parseDxf(
      [
        ...["0", "SECTION", "2", "ENTITIES"],
        ...["0", "CIRCLE", "8", "0", "10", "0.0", "20", "-100.0", "30", "0.0"],
        ...["40", "15.0", ...down],
        ...["0", "ARC", "8", "0", "10", "-100.0", "20", "-100.0", "30", "0.0"],
        ...["40", "15.0", ...down, "50", "180.0", "51", "90.0"],
        ...["0", "ELLIPSE", "8", "0", "10", "200.0", "20", "-100.0"],
        ...["30", "0.0000000000000122", "11", "20.0", "21", "0.0", "31", "0.0"],
        ...[...down, "40", "0.4", "41", "0.0", "42", "6.283185307179586"],
        ...["0", "ENDSEC", "0", "EOF", ""],
      ].join("\r\n")
    ).drawing.entities
    expect(facingDown.map((e) => [e.type, e.normal?.z])).toEqual([
      ["circle", -1],
      ["arc", -1],
      ["ellipse", -1],
    ])
    const cad = createHarness({ entities: facingDown })
    typed(cad, "_CONE", "100,0,0", "10", "30")
    typed(cad, "_CYLINDER", "0,100,0", "10", "30")
    typed(cad, "_TORUS", "200,50,0", "20", "5")
    typed(cad, "_CYLINDER", "_E", "290,0,0", "310,0,0", "300,6,0", "20")
    expect(cad.entityCount).toBe(7)
    const autocad = { min: [-15, -115, -5], max: [310, 110, 30] }
    const extents = cad.extents()!
    expect(extents.min).toBeCloseToPoint(p(-15, -115))
    expect(extents.max).toBeCloseToPoint(p(310, 110))

    const header = (bytes: Uint8Array, name: string) => {
      const lines = new TextDecoder("latin1").decode(bytes).split("\r\n")
      const at = lines.findIndex((line) => line === name)
      return [2, 4, 6].map((k) => Number(lines[at + k]))
    }
    const r12 = await cad.writeDxf({ version: "R12" })
    const v2018 = await cad.writeDxf({ version: "2018" })
    // The console opens these with no AUDIT error and plots the R12 as its
    // own x058-R12.dxf (audit.sh, plot.sh).
    const dir = process.env.DXF_OUT
    if (dir) {
      writeFileSync(join(dir, "extents-R12.dxf"), r12.bytes)
      writeFileSync(join(dir, "extents-2018.dxf"), v2018.bytes)
    }
    for (const [name, box] of [
      ["$EXTMIN", autocad.min],
      ["$EXTMAX", autocad.max],
    ] as const) {
      header(r12.bytes, name).forEach((value, i) =>
        expect(value).toBeCloseTo(box[i], 5)
      )
    }
    // From 2000 on the extents are only the *Active view's: ZOOM Extents's
    // centre and height of that box.
    const text = new TextDecoder().decode(v2018.bytes).split("\r\n")
    const active = text.indexOf("*Active")
    const group = (code: string) =>
      Number(text[text.indexOf(code, active) + 1].trim())
    expect(group(" 12")).toBeCloseTo(147.5, 9)
    expect(group(" 22")).toBeCloseTo(-2.5, 9)
    expect(group(" 40")).toBeCloseTo(225 * 1.1, 9)
  })

  it("needs no file access", async () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 5)] })
    const { bytes } = await cad.writeDxf()
    expect(parseDxf(bytes).drawing.entities).toHaveLength(1)
  })
})
