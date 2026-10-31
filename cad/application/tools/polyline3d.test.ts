import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type {
  Entity,
  LineEntity,
  Polyline3dEntity,
  PolylineEntity,
  SplineEntity,
} from "../../domain/entities"
import { lineEndZ, lineStartZ } from "../../domain/entities"
import { es } from "../../locales/es"
import { ptBR } from "../../locales/pt-BR"

// AutoCAD 2027's console is the reference for every prompt, refusal and
// point below: the same answers there, read back with entget (probes
// 3dpoly/p01–p78; TRIM, EXTEND and JOIN p30 on).

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

/** What the drawing holds, each object's points as the probes print them. */
function drawing(cad: CadHarness): (string | number[][])[][] {
  return cad.entities().map((entity) => [entity.type, points(entity)])
}

function points(entity: Entity): number[][] {
  const at = (p: { x: number; y: number; z?: number }) => [
    round(p.x),
    round(p.y),
    round(p.z ?? 0),
  ]
  switch (entity.type) {
    case "polyline3d":
      return entity.vertices.map(at)
    case "line":
      return [
        at({ ...entity.start, z: entity.elevation }),
        at({
          ...entity.end,
          z: (entity.elevation ?? 0) + (entity.deltaZ ?? 0),
        }),
      ]
    case "polyline":
      return entity.vertices.map((v) => at({ ...v, z: entity.elevation }))
    case "spline":
      return entity.points.map(at)
    default:
      return []
  }
}

const RISE = RISING.slice(0, -1)
const CLOSED = ["3DPOLY", "0,0,0", "10,0,5", "10,10,-3", "0,10,2", "C"]
const zoomed = (...answers: string[]) => [...answers, "ZOOM", "E"]
const quick = ["TRIMEXTENDMODE", "1"]
const standard = ["TRIMEXTENDMODE", "0"]

describe("TRIM of a 3D polyline", () => {
  it("cuts it at its own vertices in Quick mode, in two, which U takes back (p30)", () => {
    const cad = typed(
      createHarness(),
      ...quick,
      ...zoomed(...RISE, "20,0,4", "", "LINE", "5,5", "15,5", "")
    )
    typed(cad, "TRIM", "10,7.5", "")
    expect(drawing(cad)).toEqual([
      [
        "polyline3d",
        [
          [0, 0, 0],
          [10, 0, 5],
          [10, 5, 1],
        ],
      ],
      [
        "line",
        [
          [5, 5, 0],
          [15, 5, 0],
        ],
      ],
      [
        "polyline3d",
        [
          [10, 10, -3],
          [20, 10, 0],
          [20, 0, 4],
        ],
      ],
    ])
    typed(cad, "U")
    expect(drawing(cad)[0][1]).toHaveLength(5)
    expect(cad.entities()).toHaveLength(2)
  })

  it("runs past its vertices to the edges' crossings in Standard mode (p31)", () => {
    const cad = typed(
      createHarness(),
      ...standard,
      ...zoomed(...RISE, "20,0,4", "", "LINE", "5,5", "15,5", "")
    )
    typed(cad, "TRIM", "14,5", "", "10,7.5", "")
    expect(drawing(cad)[0]).toEqual([
      "polyline3d",
      [
        [0, 0, 0],
        [10, 0, 5],
        [10, 5, 1],
      ],
    ])
  })

  it("is cut at its own vertices where Standard's edges are everything (p32)", () => {
    const cad = typed(
      createHarness(),
      ...standard,
      ...zoomed(...RISE, "20,0,4", "", "LINE", "5,5", "15,5", "")
    )
    typed(cad, "TRIM", "", "10,7.5", "")
    expect(vertexLists(cad)).toEqual([
      [
        [0, 0, 0],
        [10, 0, 5],
        [10, 5, 1],
      ],
      [
        [10, 10, -3],
        [20, 10, 0],
        [20, 0, 4],
      ],
    ])
  })

  it("is cut back to a vertex where nothing crosses it (p35)", () => {
    const cad = typed(createHarness(), ...quick, ...zoomed(...RISE, ""))
    typed(cad, "TRIM", "5,0", "")
    expect(vertexLists(cad)).toEqual([
      [
        [10, 0, 5],
        [10, 10, -3],
        [20, 10, 0],
      ],
    ])
  })

  it("is never deleted by Quick mode, saying nothing cuts it (p42)", () => {
    const cad = typed(
      createHarness(),
      ...quick,
      ...zoomed("3DPOLY", "0,0,0", "10,0,5", "", "3DPOLY", "0,10,0", "10,10,5"),
      "20,10,0",
      ""
    )
    // Its vertex cuts nothing where its segments run on in plan.
    expect(written(cad, "TRIM", "5,0", "5,10", "")).toEqual([
      "TRIM",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: 5,0",
      "Does not intersect with the cutting edge.",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: 5,10",
      "Does not intersect with the cutting edge.",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:",
    ])
    expect(cad.entities()).toHaveLength(2)
  })

  it("leaves a closed one in two at its first vertex, Quick or Standard (p33, p34)", () => {
    const cut = (inQuick: boolean) => {
      const cad = typed(
        createHarness(),
        ...(inQuick ? quick : standard),
        ...zoomed(...CLOSED, "LINE", "5,-5", "5,15", "")
      )
      return inQuick
        ? typed(cad, "TRIM", "10,5", "")
        : typed(cad, "TRIM", "5,-3", "", "10,5", "")
    }
    expect(vertexLists(cut(true))).toEqual([
      [
        [0, 0, 0],
        [10, 0, 5],
      ],
      [
        [10, 10, -3],
        [0, 10, 2],
        [0, 0, 0],
      ],
    ])
    expect(vertexLists(cut(false))).toEqual([
      [
        [0, 0, 0],
        [5, 0, 2.5],
      ],
      [
        [5, 10, -0.5],
        [0, 10, 2],
        [0, 0, 0],
      ],
    ])
  })

  it("takes a closed one's run round its first vertex whole, one piece left (p58)", () => {
    const cad = typed(
      createHarness(),
      ...standard,
      ...zoomed(...CLOSED, "LINE", "5,-5", "5,15", "")
    )
    typed(cad, "TRIM", "5,-3", "", "0,5", "")
    expect(vertexLists(cad)).toEqual([
      [
        [5, 0, 2.5],
        [10, 0, 5],
        [10, 10, -3],
        [5, 10, -0.5],
      ],
    ])
    expect(cad.entities().every((e) => !("closed" in e) || !e.closed)).toBe(
      true
    )
  })

  it("cuts a closed one crossed once at the crossing and its first vertex (p59, p71)", () => {
    const cut = (pick: string) => {
      const cad = typed(
        createHarness(),
        ...standard,
        ...zoomed(...CLOSED, "LINE", "5,-5", "5,5", "")
      )
      return vertexLists(typed(cad, "TRIM", "5,-3", "", pick, ""))
    }
    expect(cut("10,5")).toEqual([
      [
        [0, 0, 0],
        [5, 0, 2.5],
      ],
    ])
    expect(cut("1,0")).toEqual([
      [
        [5, 0, 2.5],
        [10, 0, 5],
        [10, 10, -3],
        [0, 10, 2],
        [0, 0, 0],
      ],
    ])
  })

  it("trims one in an upright plane, which cuts as an edge too (p36)", () => {
    const cad = typed(
      createHarness(),
      ...quick,
      ...zoomed(
        "3DPOLY",
        "0,0,0",
        "10,0,0",
        "10,0,10",
        "20,0,10",
        "",
        "LINE",
        "15,-5",
        "15,5",
        "",
        "LINE",
        "5,-5",
        "5,5",
        ""
      )
    )
    typed(cad, "TRIM", "18,0", "5,-4", "")
    expect(drawing(cad)).toEqual([
      [
        "polyline3d",
        [
          [0, 0, 0],
          [10, 0, 0],
          [10, 0, 10],
          [15, 0, 10],
        ],
      ],
      [
        "line",
        [
          [15, -5, 0],
          [15, 5, 0],
        ],
      ],
      [
        "line",
        [
          [5, 0, 0],
          [5, 5, 0],
        ],
      ],
    ])
  })

  it("cuts a fitted one as its curve, fitted no more (p72)", () => {
    const cad = typed(
      createHarness(),
      ...standard,
      ...zoomed(...RISE, "", "LINE", "5,-5", "5,15", ""),
      "PEDIT",
      "10,5",
      "S",
      ""
    )
    typed(cad, "TRIM", "5,-3", "", "8.08594,3.16406", "")
    const [poly] = cad.entities().filter((e) => e.type === "polyline3d")
    expect(poly).not.toHaveProperty("fit")
    expect(points(poly)).toEqual([
      [0, 0, 0],
      [3.3203, 0.4297, 1.3125],
      [5, 1.1567, 1.5532],
    ])
  })

  it("is trimmed along a fence (p78)", () => {
    const cad = typed(
      createHarness(),
      ...quick,
      ...zoomed(...RISE, "", "LINE", "7,-5", "7,5", "")
    )
    typed(cad, "TRIM", "5,-2", "5,2", "", "")
    expect(vertexLists(cad)).toEqual([
      [
        [7, 0, 3.5],
        [10, 0, 5],
        [10, 10, -3],
        [20, 10, 0],
      ],
    ])
  })

  it("words its refusal as Spanish and Brazilian AutoCAD do (p42)", () => {
    for (const [locale, words] of [
      [es, "No se interseca con la arista de corte."],
      [ptBR, "Não interseciona com a aresta de corte."],
    ] as const) {
      const cad = typed(
        createHarness({ locale }),
        "_TRIMEXTENDMODE",
        "1",
        "_3DPOLY",
        "0,0,0",
        "10,0,5",
        "",
        "_ZOOM",
        "_E"
      )
      expect(written(cad, "_TRIM", "5,0")).toContain(words)
    }
  })
})

describe("EXTEND of a 3D polyline", () => {
  const SHORT = ["3DPOLY", "0,0,0", "10,0,5", "10,10,-3", "15,10,0", ""]
  const BOUNDS = ["LINE", "20,0", "20,20", "", "LINE", "-5,-5", "-5,5", ""]

  it("grows the end the pick lies nearer, its new end along the segment's slope (p37)", () => {
    const cad = typed(createHarness(), ...quick, ...zoomed(...SHORT, ...BOUNDS))
    typed(cad, "EXTEND", "14,10", "10,3", "")
    expect(vertexLists(cad)).toEqual([
      [
        [-5, 0, -2.5],
        [10, 0, 5],
        [10, 10, -3],
        [20, 10, 3],
      ],
    ])
  })

  it("steps back with Undo, saying when the command is all undone, and U takes it back (p40)", () => {
    const cad = typed(
      createHarness(),
      ...standard,
      ...zoomed(...SHORT, ...BOUNDS)
    )
    const log = written(cad, "EXTEND", "20,15", "", "14,10", "U")
    expect(log.at(-1)).toBe("Command has been completely undone.")
    typed(cad, "14,10", "")
    expect(vertexLists(cad)[0].at(-1)).toEqual([20, 10, 3])
    typed(cad, "U")
    expect(vertexLists(cad)[0].at(-1)).toEqual([15, 10, 0])
  })

  it("refuses a closed one, an upright end and one nothing bounds in their words (p39, p67)", () => {
    const cad = typed(
      createHarness(),
      ...quick,
      ...zoomed(
        ...CLOSED,
        "3DPOLY",
        "30,0,0",
        "40,0,0",
        "40,0,10",
        "",
        "3DPOLY",
        "30,20,0",
        "40,22,3",
        "",
        "3DPOLY",
        "20,30,0",
        "30,30,0",
        "40,30,0",
        "40,30,10",
        "",
        "LINE",
        "50,-5",
        "50,40",
        ""
      )
    )
    const log = written(cad, "EXTEND", "10,5", "36,30", "39,21.8", "")
    expect(log.filter((line) => !line.startsWith("Select"))).toEqual([
      "EXTEND",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Cannot extend a closed polyline.",
      "Path does not intersect with the bounding edge.",
    ])
    expect(vertexLists(cad)[2]).toEqual([
      [30, 20, 0],
      [50, 24, 6],
    ])
  })

  it("grows a fitted one's frame, fitted again (p73)", () => {
    const cad = typed(
      createHarness(),
      ...standard,
      ...zoomed(...RISE, "", "LINE", "30,-5", "30,15", ""),
      "PEDIT",
      "10,5",
      "S",
      ""
    )
    typed(cad, "EXTEND", "30,-3", "", "16.6797,9.57031", "")
    const [poly] = cad.entities().filter((e) => e.type === "polyline3d")
    expect(poly).toHaveProperty("fit")
    expect(points(poly)).toEqual([
      [0, 0, 0],
      [10, 0, 5],
      [10, 10, -3],
      [30, 10, 3],
    ])
  })

  it("runs on from its end segment as an edge under Edge's Extend (p68)", () => {
    const cad = typed(
      createHarness(),
      ...standard,
      ...zoomed(
        "3DPOLY",
        "0,0,0",
        "10,0,5",
        "10,10,-3",
        "",
        "LINE",
        "0,20",
        "20,20",
        ""
      )
    )
    typed(cad, "TRIM", "10,5", "", "E", "E", "15,20", "")
    expect(drawing(cad)[1]).toEqual([
      "line",
      [
        [0, 20, 0],
        [10, 20, 0],
      ],
    ])
  })

  it("words a closed one's refusal as Spanish and Brazilian AutoCAD do (p39)", () => {
    for (const [locale, words] of [
      [es, "Imposible alargar polilínea cerrada."],
      [ptBR, "Não é possível estender uma polilinha fechada."],
    ] as const) {
      const cad = typed(
        createHarness({ locale }),
        "_3DPOLY",
        "0,0,0",
        "10,0,5",
        "10,10,-3",
        "0,10,2",
        "_C",
        "_ZOOM",
        "_E"
      )
      expect(written(cad, "_EXTEND", "10,5")).toContain(words)
    }
  })
})

function vertexLists(cad: CadHarness): number[][][] {
  return cad
    .entities()
    .filter((e) => e.type === "polyline3d")
    .map(points)
}

describe("JOIN with a 3D polyline", () => {
  it("grows a source 3D polyline over lines, rising or not, which U takes back (p44)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(
        ...RISE,
        "",
        "LINE",
        "20,10,0",
        "30,10,0",
        "",
        "LINE",
        "0,0,0",
        "-10,0,10",
        ""
      )
    )
    const [source] = cad.entities()
    const log = written(cad, "JOIN", "10,5", "25,10", "-5,0,5", "")
    expect(log.at(-1)).toBe("2 segments joined into 1 3D polyline")
    expect(cad.entities()).toHaveLength(1)
    expect(cad.entities()[0].id).toBe(source.id)
    expect(vertexLists(cad)).toEqual([
      [
        [-10, 0, 10],
        [0, 0, 0],
        [10, 0, 5],
        [10, 10, -3],
        [20, 10, 0],
        [30, 10, 0],
      ],
    ])
    typed(cad, "U")
    expect(cad.entities()).toHaveLength(3)
  })

  it("keeps the 3D polyline and its direction whatever came first (p45, p47)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed("LINE", "30,10,0", "20,10,0", "", ...RISE, "")
    )
    expect(written(cad, "JOIN", "25,10", "10,5", "").at(-1)).toBe(
      "1 segment joined into 1 3D polyline"
    )
    expect(vertexLists(cad)[0]).toEqual([
      [0, 0, 0],
      [10, 0, 5],
      [10, 10, -3],
      [20, 10, 0],
      [30, 10, 0],
    ])
    const other = typed(
      createHarness(),
      ...zoomed("PLINE", "30,20", "30,10", "20,10", "", ...RISE, "")
    )
    expect(written(other, "JOIN", "30,15", "10,5", "").at(-1)).toBe(
      "2 segments joined into 1 3D polyline"
    )
    expect(vertexLists(other)[0].slice(3)).toEqual([
      [20, 10, 0],
      [30, 10, 0],
      [30, 20, 0],
    ])
  })

  it("joins a polyline's arc segment as its chord (p63)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(...RISE, "", "PLINE", "20,10", "30,10", "A", "30,20", "")
    )
    typed(cad, "JOIN", "10,5", "30,10", "")
    expect(vertexLists(cad)[0].slice(3)).toEqual([
      [20, 10, 0],
      [30, 10, 0],
      [30, 20, 0],
    ])
  })

  it("turns a piece met backwards, and puts one at its start (p54, p70)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(
        ...RISE,
        "",
        "3DPOLY",
        "30,20,0",
        "30,10,5",
        "20,10,0",
        "",
        "3DPOLY",
        "-10,5,3",
        "-10,0,8",
        "0,0,0",
        ""
      )
    )
    expect(written(cad, "JOIN", "10,5", "30,15", "-10,3", "").at(-1)).toBe(
      "4 segments joined into 1 3D polyline"
    )
    expect(vertexLists(cad)).toEqual([
      [
        [-10, 5, 3],
        [-10, 0, 8],
        [0, 0, 0],
        [10, 0, 5],
        [10, 10, -3],
        [20, 10, 0],
        [30, 10, 5],
        [30, 20, 0],
      ],
    ])
  })

  it("closes on a line back to its start (p74)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(...RISE, "", "LINE", "20,10,0", "0,0,0", "")
    )
    expect(written(cad, "JOIN", "15,10", "16,8", "").at(-1)).toBe(
      "1 segment joined into 1 3D polyline"
    )
    const [poly] = cad.entities()
    expect(poly.type === "polyline3d" && poly.closed).toBe(true)
    expect(points(poly)).toHaveLength(4)
  })

  it("joins only what meets its ends in space, the first of a branch (p55, p64)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(
        ...RISE,
        "",
        "LINE",
        "10,0,5",
        "20,0,5",
        "",
        "LINE",
        "20,10,0",
        "30,10,0",
        "",
        "LINE",
        "20,10,0",
        "20,20,0",
        ""
      )
    )
    expect(
      written(cad, "JOIN", "10,5", "15,0", "25,10", "20,15", "").at(-1)
    ).toBe(
      "1 segment joined into 1 3D polyline, 2 objects discarded from the operation"
    )
    const none = typed(
      createHarness(),
      ...zoomed(
        ...RISE,
        "",
        "LINE",
        "20,10,7",
        "30,10,7",
        "",
        "LINE",
        "-1,0,0",
        "-10,0,0",
        "",
        "3DPOLY",
        "50,0,0",
        "60,0,5",
        ""
      )
    )
    expect(
      written(none, "JOIN", "10,5", "25,10", "-5,0", "55,0", "").at(-1)
    ).toBe("0 objects joined, 4 objects discarded from the operation")
  })

  it("grows the newest of a window's 3D polylines, and says how many it made (p62, p77)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(...RISE, "", "3DPOLY", "30,20,0", "30,10,5", "20,10,0", "")
    )
    expect(written(cad, "JOIN", "C", "-5,-5", "35,25", "").at(-1)).toBe(
      "3 segments joined into 1 3D polyline"
    )
    expect(vertexLists(cad)[0][0]).toEqual([30, 20, 0])
    const two = typed(
      createHarness(),
      ...zoomed(
        ...RISE,
        "",
        "LINE",
        "20,10,0",
        "30,10,0",
        "",
        "3DPOLY",
        "0,30,0",
        "10,30,5",
        "10,40,-3",
        "",
        "LINE",
        "10,40,-3",
        "20,40,-3",
        ""
      )
    )
    expect(written(two, "JOIN", "C", "-5,-5", "35,45", "").at(-1)).toBe(
      "2 segments joined into 2 3D polylines"
    )
  })

  it("makes a new spline where an arc joins it, on each object's own parameter (p48)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(...RISE, "", "ARC", "20,10", "25,15", "30,10")
    )
    expect(written(cad, "JOIN", "10,5", "25,15", "").at(-1)).toBe(
      "2 objects converted to 1 spline"
    )
    const [spline] = cad.entities() as SplineEntity[]
    expect(spline.type).toBe("spline")
    expect(spline.knotVector!.map(round)).toEqual([
      0, 0, 0, 1, 1, 2, 2, 3, 3, 4.5708, 4.5708, 6.1416, 6.1416, 6.1416,
    ])
    expect(points(spline)).toEqual([
      [0, 0, 0],
      [5, 0, 2.5],
      [10, 0, 5],
      [10, 5, 1],
      [10, 10, -3],
      [15, 10, -1.5],
      [20, 10, 0],
      [20, 15, 0],
      [25, 15, 0],
      [30, 15, 0],
      [30, 10, 0],
    ])
  })

  it("is joined into a spline it meets, cubic (p49)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(...RISE, "", "SPLINE", "20,10", "25,15", "30,10", "")
    )
    expect(written(cad, "JOIN", "10,5", "25,15", "").at(-1)).toBe(
      "2 objects joined into 1 spline"
    )
    const [spline] = cad.entities() as SplineEntity[]
    expect(spline.knotVector!.slice(0, 13)).toEqual([
      0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3,
    ])
    expect(points(spline).slice(0, 4)).toEqual([
      [0, 0, 0],
      [3.3333, 0, 1.6667],
      [6.6667, 0, 3.3333],
      [10, 0, 5],
    ])
  })

  it("makes a polyline of a level one and what lies in its plane (p50, p60, p69, p75)", () => {
    const level = (z: number, ...more: string[]) =>
      typed(
        createHarness(),
        ...zoomed("3DPOLY", `0,0,${z}`, `10,0,${z}`, `10,10,${z}`, "", ...more)
      )
    const lifted = level(5, "LINE", "10,10,5", "20,10,5", "")
    expect(written(lifted, "JOIN", "C", "-5,-5", "25,15", "").at(-1)).toBe(
      "2 objects converted to 1 polyline"
    )
    const [polyline] = lifted.entities() as PolylineEntity[]
    expect(polyline.type).toBe("polyline")
    expect(points(polyline)).toEqual([
      [0, 0, 5],
      [10, 0, 5],
      [10, 10, 5],
      [20, 10, 5],
    ])
    const arc = level(0, "ARC", "10,10", "15,15", "20,10")
    typed(arc, "JOIN", "5,0", "15,15", "")
    const [curved] = arc.entities() as PolylineEntity[]
    expect(curved.bulges?.map(round)).toEqual([0, 0, -1])
  })

  it("leaves a fitted one its curve's vertices, fitted no more (p66)", () => {
    const cad = typed(
      createHarness(),
      ...zoomed(...RISE, "", "LINE", "20,10,0", "30,10,0", ""),
      "PEDIT",
      "10,5",
      "S",
      ""
    )
    typed(cad, "JOIN", "10,5", "25,10", "")
    const [poly] = cad.entities()
    expect(poly).not.toHaveProperty("fit")
    expect(points(poly)).toHaveLength(10)
    expect(points(poly).at(-1)).toEqual([30, 10, 0])
  })

  it("words its counts as Spanish and Brazilian AutoCAD do (p44, p45, p64, p77)", () => {
    const run = (locale: typeof es, answers: readonly string[]) => {
      const cad = typed(
        createHarness({ locale }),
        "_3DPOLY",
        "0,0,0",
        "10,0,5",
        "10,10,-3",
        "20,10,0",
        "",
        "_LINE",
        "20,10,0",
        "30,10,0",
        "",
        "_3DPOLY",
        "0,30,0",
        "10,30,5",
        "",
        "_LINE",
        "10,30,5",
        "20,30,5",
        "",
        "_LINE",
        "20,30,5",
        "30,30,5",
        "",
        "_ZOOM",
        "_E"
      )
      return written(cad, "_JOIN", ...answers, "").at(-1)
    }
    const one = ["10,5", "25,10"]
    const window = ["_C", "-5,-5", "35,35"]
    expect(run(es, one)).toBe("1 segmento unido a 1 polilínea 3D")
    expect(run(es, window)).toBe("3 segmentos unidos en2 polilíneas 3D")
    expect(run(ptBR, one)).toBe("1 segmento unido em 1 polilinha 3D")
    expect(run(ptBR, window)).toBe("3 segmentos unidos em 2 polilinhas 3D")
  })
})
