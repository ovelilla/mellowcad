import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type {
  Entity,
  LineEntity,
  Polyline3dEntity,
} from "../../domain/entities"
import { lineEndZ, lineStartZ } from "../../domain/entities"
import { es } from "../../locales/es"

// AutoCAD 2027's console is the reference for every prompt, refusal and
// point below: the same answers there, read back with entget (probes
// 3dpoly/p01–p29).

function typed(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function written(cad: CadHarness, ...answers: string[]): string[] {
  const from = cad.commandLog().length
  typed(cad, ...answers)
  return cad.commandLog().slice(from)
}

const round = (n: number) => Math.round(n * 10000) / 10000 + 0

function polylines(cad: CadHarness): Polyline3dEntity[] {
  return cad
    .entities()
    .filter((e): e is Polyline3dEntity => e.type === "polyline3d")
}

function vertices(entity: Entity | undefined): number[][] {
  if (entity?.type !== "polyline3d") return []
  return entity.vertices.map((v) => [round(v.x), round(v.y), round(v.z)])
}

function lineEnds(line: LineEntity): number[][] {
  return [
    [round(line.start.x), round(line.start.y), round(lineStartZ(line))],
    [round(line.end.x), round(line.end.y), round(lineEndZ(line))],
  ]
}

/** The 3D polyline of p09–p29, its view zoomed to it. */
const RISING = ["3DPOLY", "0,0,0", "10,0,5", "10,10,-3", "20,10,0", ""]
const ZOOMED = [...RISING, "ZOOM", "W", "-5,-10", "25,20"]

describe("3DPOLY", () => {
  it("asks its points and closes from the second segment (p01)", () => {
    const cad = createHarness()
    cad.command("3DPOLY")
    expect(
      written(cad, "0,0,0", "10,0,5", "10,10,-3", "C").concat(
        cad.commandLog().slice(-1)
      )
    ).toEqual([
      "Specify start point of polyline: 0,0,0",
      "Specify endpoint of line or [Undo]: 10,0,5",
      "Specify endpoint of line or [Undo]: 10,10,-3",
      "Specify endpoint of line or [Close/Undo]: C",
      "Specify endpoint of line or [Close/Undo]: C",
    ])
    const [poly] = polylines(cad)
    expect(vertices(poly)).toEqual([
      [0, 0, 0],
      [10, 0, 5],
      [10, 10, -3],
    ])
    expect(poly.closed).toBe(true)
  })

  it("refuses Enter at the start and a word later, Close before two segments (p02, p03, p06)", () => {
    const cad = createHarness()
    cad.command("3DPOLY")
    expect(written(cad, "")).toEqual([
      "Specify start point of polyline:",
      "Invalid point.",
    ])
    expect(written(cad, "0,0", "C", "FOO")).toEqual([
      "Specify start point of polyline: 0,0",
      "Specify endpoint of line or [Undo]: C",
      "Point or option keyword required.",
      "Specify endpoint of line or [Undo]: FOO",
      "Point or option keyword required.",
    ])
    expect(cad.activeToolId()).toBe("polyline3d")
  })

  it("keeps the start point alone at Enter, and U takes it back (p05)", () => {
    const cad = createHarness()
    typed(cad, "3DPOLY", "5,5", "")
    expect(vertices(polylines(cad)[0])).toEqual([[5, 5, 0]])
    expect(written(cad, "U")).toEqual(["U", "3DPOLY"])
    expect(polylines(cad)).toEqual([])
  })

  it("steps back one vertex, saying when none is left (p06)", () => {
    const cad = createHarness()
    typed(cad, "3DPOLY", "1,1")
    expect(written(cad, "U", "U")).toEqual([
      "Specify endpoint of line or [Undo]: U",
      "All segments already undone.",
      "Specify endpoint of line or [Undo]: U",
      "All segments already undone.",
    ])
    typed(cad, "3,3", "4,4,4", "U", "")
    expect(vertices(polylines(cad)[0])).toEqual([
      [1, 1, 0],
      [3, 3, 0],
    ])
  })

  it("lays a point without Z at ELEVATION, one with its own (p04)", () => {
    const cad = createHarness()
    typed(cad, "ELEVATION", "5", "3DPOLY", "0,0", "10,0", "10,10,2", "")
    expect(vertices(polylines(cad)[0])).toEqual([
      [0, 0, 5],
      [10, 0, 5],
      [10, 10, 2],
    ])
  })

  it("takes a pick at the elevation it is on, whatever the last vertex's Z", () => {
    const cad = typed(createHarness(), "3DPOLY", "0,0,50")
    cad.click(p(100, 100)).enter()
    expect(vertices(polylines(cad)[0])).toEqual([
      [0, 0, 50],
      [100, 100, 0],
    ])
  })

  it("reads its points in the UCS and keeps them in the WCS (p07)", () => {
    const cad = createHarness()
    typed(cad, "UCS", "X", "90", "3DPOLY", "0,0", "10,0", "10,10", "")
    expect(vertices(polylines(cad)[0])).toEqual([
      [0, 0, 0],
      [10, 0, 0],
      [10, 0, 10],
    ])
  })

  it("is not run transparently (p18)", () => {
    const cad = createHarness()
    typed(cad, "LINE", "0,0")
    expect(written(cad, "'3DPOLY")).toContain(
      "** That command may not be invoked transparently **"
    )
  })

  it("words its prompts and keywords as Spanish AutoCAD does (p01, p06)", () => {
    const cad = createHarness({ locale: es })
    expect(
      written(cad, "3DPOL", "1,1", "H", "3,3", "4,4", "5,5,1", "C")
    ).toEqual([
      "3DPOL",
      "Precise punto inicial de polilínea: 1,1",
      "Precise punto final de línea o [desHacer]: H",
      "Ya se han deshecho todos los segmentos.",
      "Precise punto final de línea o [desHacer]: 3,3",
      "Precise punto final de línea o [desHacer]: 4,4",
      "Precise punto final de línea o [Cerrar/desHacer]: 5,5,1",
      "Precise punto final de línea o [Cerrar/desHacer]: C",
    ])
    expect(polylines(cad)[0].closed).toBe(true)
  })
})

describe("a 3D polyline in the other commands", () => {
  it("explodes into lines at its vertices' Z (p11)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "EXPLODE", "L", "")
    const lines = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
    expect(lines.map(lineEnds)).toEqual([
      [
        [0, 0, 0],
        [10, 0, 5],
      ],
      [
        [10, 0, 5],
        [10, 10, -3],
      ],
      [
        [10, 10, -3],
        [20, 10, 0],
      ],
    ])
  })

  it("breaks in plan, each cut end at its Z there (p12)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "BREAK", "5,0", "10,5")
    expect(polylines(cad).map(vertices)).toEqual([
      [
        [0, 0, 0],
        [5, 0, 2.5],
      ],
      [
        [10, 5, 1],
        [10, 10, -3],
        [20, 10, 0],
      ],
    ])
  })

  it("stretches the vertices the window catches, Z and all (p19)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "STRETCH", "C", "9,-1")
    typed(cad, "11,11", "", "0,0", "0,0,10")
    expect(vertices(polylines(cad)[0])).toEqual([
      [0, 0, 0],
      [10, 0, 15],
      [10, 10, 7],
      [20, 10, 0],
    ])
  })

  it("moves in space (MOVE with a Z)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "MOVE", "L", "", "0,0,0")
    typed(cad, "1,2,3")
    expect(vertices(polylines(cad)[0])).toEqual([
      [1, 2, 3],
      [11, 2, 8],
      [11, 12, 0],
      [21, 12, 3],
    ])
  })

  it("measures only a level one, refusing the rest in its words (p15, p16)", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    expect(written(cad, "AREA", "O", "5,0")).toContain(
      "3D Polyline vertices had differing Z coordinates."
    )
    expect(cad.activeToolId()).not.toBe("area")
    const level = typed(createHarness(), "3DPOLY", "0,0,2", "10,0,2")
    typed(level, "10,10,2", "C", "ZOOM", "W", "-5,-5", "15,15")
    expect(written(level, "AREA", "O", "5,0")).toContain(
      "Area = 50.00, Perimeter = 34.14"
    )
  })

  it("defines no UCS of its own (p22)", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    expect(written(cad, "UCS", "OB", "5,0")).toContain(
      "3D Polyline object does not define a coordinate system"
    )
    expect(cad.activeToolId()).not.toBe("ucs")
  })

  it("is refused by FILLET in its words (p26)", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    expect(written(cad, "FILLET", "10,5")).toContain(
      "  3D Polyline objects may not be filleted."
    )
    expect(cad.activeToolId()).toBe("fillet")
  })

  it("is passed over by OFFSET in silence (p09)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "OFFSET", "1")
    const log = written(cad, "5,0")
    expect(log).toEqual(["Select object to offset or [Exit/Undo] <Exit>: 5,0"])
    expect(cad.entities()).toHaveLength(1)
  })

  it("is where LINE's Continue starts, at its last vertex (p23)", () => {
    const cad = typed(createHarness(), "3DPOLY", "0,0,0", "10,0,5", "10,10,3")
    typed(cad, "", "LINE", "", "5,5", "")
    const line = cad.entities().at(-1) as LineEntity
    expect(lineEnds(line)).toEqual([
      [10, 10, 3],
      [5, 5, 0],
    ])
  })

  it("gives DIMLINEAR the segment picked (p25)", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    expect(written(cad, "DIMLINEAR", "", "5,0", "5,-5")).toContain(
      "Dimension text = 10"
    )
  })

  it("is snapped to at its vertices, middles and nearest points in space (p21)", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    const id = (snap: string, at: string) => written(cad, "ID", snap, at).at(-1)
    expect(id("_END", "10,4")).toBe(" X = 10.00     Y = 0.00     Z = 5.00")
    expect(id("_MID", "5,0.2")).toBe(" X = 5.00     Y = 0.00     Z = 2.50")
    expect(id("_NEA", "10,6")).toBe(" X = 10.00     Y = 6.00     Z = 0.20")
  })

  it("shows and edits its vertices in the Properties palette (desktop d02)", () => {
    const cad = typed(createHarness(), ...RISING)
    cad.select(polylines(cad)[0].id)
    const info = cad.state().properties.info!
    expect(info.title).toBe("3D Polyline")
    expect(
      info.groups.map((g) => [g.title, g.rows.map((r) => [r.label, r.value])])
    ).toEqual([
      [
        "Geometry",
        [
          ["Current Vertex", "1"],
          ["Vertex X", "0.00"],
          ["Vertex Y", "0.00"],
          ["Vertex Z", "0.00"],
          ["Length", "34.43 mm"],
        ],
      ],
      [
        "Misc",
        [
          ["Fit/Smooth", "None"],
          ["Closed", "No"],
        ],
      ],
    ])
    cad.runtime.setSelectionProperty("vertex", "2")
    cad.runtime.setSelectionProperty("vertexZ", "7")
    expect(vertices(polylines(cad)[0])[1]).toEqual([10, 0, 7])
  })
})
