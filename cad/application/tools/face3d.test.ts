import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type { Face3dEntity } from "../../domain/entities"
import { createFace3d, face3dEdges } from "../../domain/entities"
import { es } from "../../locales/es"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { documentSnapshot } from "../runtimeFiles"

// AutoCAD 2027's 3DFACE and its 3D face (probes scripts/research/probes/face3d/).

const faces = (cad: CadHarness): Face3dEntity[] =>
  cad.entities().filter((e): e is Face3dEntity => e.type === "face3d")

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const xyz = (f: Face3dEntity) => f.corners.map((c) => [c.x, c.y, c.z])

describe("3DFACE", () => {
  // f00, f02: the prompts; Enter at the fourth makes a triangle and the
  // command goes on at the third.
  it("asks AutoCAD's prompts and makes a triangle at Enter", () => {
    const cad = createHarness()
    const log = typed(cad, "3DFACE", "0,0,0", "100,0,0", "100,50,10", "")
    expect(log).toEqual([
      "3DFACE",
      "Specify first point or [Invisible]: 0,0,0",
      "Specify second point or [Invisible]: 100,0,0",
      "Specify third point or [Invisible] <exit>: 100,50,10",
      "Specify fourth point or [Invisible] <create three-sided face>:",
    ])
    expect(xyz(faces(cad)[0])).toEqual([
      [0, 0, 0],
      [100, 0, 0],
      [100, 50, 10],
      [100, 50, 10],
    ])
    expect(cad.state().commandLine.prompt).toContain(
      "Specify third point or [Invisible] <exit>:"
    )
    typed(cad, "")
    expect(cad.activeToolId()).toBe("select")
  })

  // f01: the next face starts from the last one's third and fourth corners;
  // Invisible before a point hides the edge from it, the shared edge passes
  // on hidden (70 4, then 9).
  it("chains faces, Invisible hiding the edge that starts at the next point", () => {
    const cad = createHarness()
    typed(cad, "3DFACE", "0,0,0", "100,0,0", "I", "100,50,10", "0,50")
    typed(cad, "200,0", "I", "200,60", "")
    const [first, second] = faces(cad)
    expect(first.invisibleEdges).toBe(4)
    expect(xyz(second)).toEqual([
      [100, 50, 10],
      [0, 50, 0],
      [200, 0, 0],
      [200, 60, 0],
    ])
    expect(second.invisibleEdges).toBe(9)
  })

  // f06: Invisible twice stays; a triangle's fourth edge hides with its
  // third (13). f08: a hidden fourth edge does not pass on.
  it("keeps Invisible typed twice, and a triangle's last edge hides with its third", () => {
    const cad = createHarness()
    typed(
      cad,
      "3DFACE",
      "0,0",
      "I",
      "I",
      "100,0",
      "100,50",
      "I",
      "0,50",
      "0,100",
      "100,100",
      ""
    )
    const [first, second] = faces(cad)
    expect(first.invisibleEdges).toBe(10)
    expect(second.invisibleEdges).toBeUndefined()
    const cad2 = createHarness()
    typed(cad2, "3DFACE", "I", "0,100", "100,100", "I", "100,150", "", "")
    expect(faces(cad2)[0].invisibleEdges).toBe(13)
  })

  // f05: Enter at the second point is refused; at the first it ends.
  it("refuses Enter at the second point", () => {
    const cad = createHarness()
    const log = typed(cad, "3DFACE", "0,0", "")
    expect(log).toContain("Point or option keyword required.")
    expect(cad.state().commandLine.prompt).toContain("Specify second point")
  })

  it("speaks Spanish", () => {
    const cad = createHarness({ locale: es })
    const log = typed(cad, "3DCARA", "0,0", "100,0", "100,50", "")
    expect(log).toEqual([
      "3DCARA",
      "Precise primer punto o [Invisible]: 0,0",
      "Precise segundo punto o [Invisible]: 100,0",
      "Precise tercer punto o [Invisible] <salir>: 100,50",
      "Precise cuarto punto o [Invisible] <crear cara con tres lados>:",
    ])
  })
})

describe("the 3D face", () => {
  const face = createFace3d(
    [p(0, 0), p(100, 0), { x: 100, y: 50, z: 10 }, p(0, 50)],
    1,
    "0",
    "f1"
  )

  it("draws, picks and snaps to its visible edges only (f04, f09)", () => {
    expect(face3dEdges(face)).toHaveLength(3)
    const cad = createHarness({ entities: [face] })
    cad.zoomToFit()
    const segments = cad.scene().primitives.filter((q) => q.kind === "segment")
    expect(segments.length).toBeGreaterThanOrEqual(3)
  })

  // f10, f11: MIRROR reverses its corners, the first edge becoming the third.
  it("MIRROR reverses its corners and their edges, as AutoCAD's does", () => {
    const cad = createHarness({ entities: [face] })
    cad.select("f1")
    typed(cad, "_MIRROR", "0,0", "0,10", "Y")
    const [mirrored] = faces(cad)
    expect(xyz(mirrored)).toEqual(
      [
        [-0, 50, 0],
        [-100, 50, 10],
        [-100, 0, 0],
        [-0, 0, 0],
      ].map(([x, y, z]) => [x === 0 ? expect.closeTo(0) : x, y, z])
    )
    expect(mirrored.invisibleEdges).toBe(4)
  })

  // f10: STRETCH moves the corners caught, Z too.
  it("STRETCH moves the corners it catches, with their Z", () => {
    const cad = createHarness({ entities: [face] })
    typed(cad, "_STRETCH", "C", "90,-10", "110,60", "", "0,0", "10,0,5")
    expect(xyz(faces(cad)[0])).toEqual([
      [0, 0, 0],
      [110, 0, 5],
      [110, 50, 15],
      [0, 50, 0],
    ])
  })

  // f03: LIST, in English.
  it("lists its corners as AutoCAD does", () => {
    const cad = createHarness({ entities: [face] })
    cad.select("f1")
    typed(cad, "LUPREC", "4")
    cad.select("f1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines).toContain('                  3D FACE   Layer: "0"')
    expect(lines).toContain(
      "             first point, X=   0.0000  Y=   0.0000  Z=   0.0000"
    )
    expect(lines).toContain(
      "             third point, X= 100.0000  Y=  50.0000  Z=  10.0000"
    )
  })

  // f07, f13: what the edit commands say of it, as of a 2D solid.
  it("is refused by the commands that cut or measure an edge, as AutoCAD's are", () => {
    const refused = (command: string, ...rest: string[]) => {
      const cad = createHarness({ entities: [face] })
      cad.zoomToFit()
      typed(cad, command, ...rest)
      cad.click(p(100, 25))
      return cad.commandLog().join("\n")
    }
    expect(refused("_BREAK")).toContain("Object can't be broken")
    expect(refused("_FILLET")).toContain(
      "Fillet requires 2 lines, arcs, or circles."
    )
    expect(refused("_CHAMFER")).toContain("Chamfer requires 2 lines.")
    expect(refused("_OFFSET", "5")).toContain("Cannot offset that object.")
  })

  // f01: EXPLODE refuses it as it finds it.
  it("EXPLODE cannot explode it", () => {
    const cad = createHarness({ entities: [face] })
    const log = typed(cad, "_EXPLODE", "_L", "")
    expect(log.join("\n")).toContain("1 was not able to be exploded.")
    expect(faces(cad)).toHaveLength(1)
  })

  it("the drawing file keeps it", () => {
    const cad = createHarness({ entities: [face] })
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    expect(back.entities[0]).toEqual(face)
  })
})
