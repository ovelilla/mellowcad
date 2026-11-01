import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec3 } from "../geometry/Vec3"
import { brepIsClosed, brepVolume } from "../geometry/solids"
import {
  lineEndZ,
  lineStartZ,
  type Entity,
  type RegionEntity,
  type Solid3dEntity,
} from "../domain/entities"
import { regionArea } from "../domain/regions"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { snapshotOf } from "../../test/builders"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const solids = (cad: CadHarness) =>
  cad.entities().filter((e): e is Solid3dEntity => e.type === "solid3d")

const last = (cad: CadHarness) => solids(cad).at(-1)!

/** A box's height, as its primitive keeps it. */
const heightOf = (solid: Solid3dEntity) =>
  solid.primitive?.kind === "box" ? solid.primitive.height : undefined

/** The console's own: LUPREC 4, its cursor at the initial view's corner. */
function console(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  answer(cad, "LUPREC", "4")
  // The console's cursor, a fixed pixel: its initial view's lower-left corner.
  cad.moveTo({ x: 289.98397, y: 116.30379 })
  return cad
}

/** LIST of the last object, its own lines. */
function listed(cad: CadHarness): string[] {
  return written(cad, "_LIST", "_L", "")
    .slice(4)
    .flatMap((line) => line.split("\n"))
}

/** The middle of its vertices: a box's centroid, MASSPROP's. */
function centroid(solid: Solid3dEntity): Vec3 {
  const { vertices } = solid.brep
  const sum = vertices.reduce(
    (s, p) => ({ x: s.x + p.x, y: s.y + p.y, z: s.z + p.z }),
    { x: 0, y: 0, z: 0 }
  )
  const n = vertices.length
  return { x: sum.x / n, y: sum.y / n, z: sum.z / n }
}

function expectAt(actual: Vec3, expected: Vec3) {
  expect(actual.x).toBeCloseTo(expected.x, 5)
  expect(actual.y).toBeCloseTo(expected.y, 5)
  expect(actual.z).toBeCloseTo(expected.z, 5)
}

describe("BOX", () => {
  it("asks for two corners and a height (solid/p01)", () => {
    const cad = console()
    expect(written(cad, "BOX", "0,0,0", "10,20", "5")).toEqual([
      "BOX",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: 10,20",
      "Specify height or [2Point]: 5",
    ])
    const box = last(cad)
    expect(brepIsClosed(box.brep)).toBe(true)
    expect(brepVolume(box.brep)).toBeCloseTo(1000, 9)
    expect(listed(cad)).toEqual([
      '                  3DSOLID   Layer: "0"',
      "                            Space: Model space",
      "         History = None",
      "    Show History = No",
      "      Solid type = Box",
      "         Position, X = 5.0000    Y = 10.0000   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 20.0000",
      "           Height: 5.0000",
      "         Rotation: 0",
    ])
  })

  it("centres the box on Center's point, in height too (p02, p13)", () => {
    const cad = console()
    expect(written(cad, "BOX", "C", "0,0,0", "10,20", "5")).toEqual([
      "BOX",
      "Specify first corner or [Center]: C",
      "Specify center: 0,0,0",
      "Specify corner or [Cube/Length]: 10,20",
      "Specify height or [2Point]: 5",
    ])
    expect(listed(cad).slice(5, 9)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = -2.5000",
      "           Length: 20.0000",
      "            Width: 40.0000",
      "           Height: 5.0000",
    ])
    // A corner at another Z gives twice its rise, about the centre (p13).
    answer(cad, "BOX", "C", "0,0,0", "10,20,4")
    expect(listed(cad).slice(5, 9)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = -4.0000",
      "           Length: 20.0000",
      "            Width: 40.0000",
      "           Height: 8.0000",
    ])
  })

  it("turns Cube and Length towards the cursor, the width to its side (p03, p10)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "C", "10")
    expect(listed(cad).slice(5)).toEqual([
      "         Position, X = 2.7794    Y = 6.5019    Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 10.0000",
      "           Height: 10.0000",
      "         Rotation: 22",
    ])
    expect(written(cad, "BOX", "50,0,0", "L", "10", "6", "4").slice(3)).toEqual(
      [
        "Specify length <10.0000>: 10",
        "Specify width: 6",
        "Specify height or [2Point] <10.0000>: 4",
      ]
    )
    expect(listed(cad).slice(5)).toEqual([
      "         Position, X = 55.8078   Y = -0.5191   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 6.0000",
      "           Height: 4.0000",
      "         Rotation: 26",
    ])
    // A point gives the length and its heading; the width sides with the cursor.
    answer(cad, "BOX", "100,0,0", "L", "110,10", "6", "4")
    expect(listed(cad).slice(5)).toEqual([
      "         Position, X = 107.1213  Y = 2.8787    Z = 0.0000",
      "           Length: 14.1421",
      "            Width: 6.0000",
      "           Height: 4.0000",
      "         Rotation: 45",
    ])
    // A negative length turns it back (p10).
    answer(cad, "BOX", "0,0,0", "C", "-10")
    expect(listed(cad).slice(5)).toEqual([
      "         Position, X = -2.7794   Y = -6.5019   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 10.0000",
      "           Height: 10.0000",
      "         Rotation: 202",
    ])
  })

  it("takes 2Point's distance, and a corner's rise, as the height (p03, p06)", () => {
    const cad = console()
    expect(
      written(cad, "BOX", "200,0,0", "210,20", "2P", "0,0,0", "0,0,7").slice(3)
    ).toEqual([
      "Specify height or [2Point]: 2P",
      "Specify first point: 0,0,0",
      "Specify second point: 0,0,7",
    ])
    expect(heightOf(last(cad))).toBe(7)
    expect(written(cad, "BOX", "300,0,0", "310,10,4")).toHaveLength(3)
    expect(heightOf(last(cad))).toBe(4)
    // A point at the height gives its distance from the corner (p06).
    answer(cad, "BOX", "400,0,0", "410,10", "0,0,0")
    expect(heightOf(last(cad))).toBeCloseTo(Math.hypot(410, 10), 9)
  })

  it("offers the last length, width and height, which Enter takes (p02, p04)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,20", "5")
    expect(written(cad, "BOX", "50,0,0", "60,20", "")).toEqual([
      "BOX",
      "Specify first corner or [Center]: 50,0,0",
      "Specify other corner or [Cube/Length]: 60,20",
      "Specify height or [2Point] <5.0000>:",
    ])
    expect(solids(cad)).toHaveLength(2)
    expect(heightOf(last(cad))).toBe(5)
  })

  it("refuses what makes no box, and asks again (p05, p06, p11, p12)", () => {
    const cad = console()
    expect(
      written(cad, "BOX", "FOO", "", "0,0,0", "FOO", "0,0", "10,0", "10,20")
    ).toEqual([
      "BOX",
      "Specify first corner or [Center]: FOO",
      "Point or option keyword required.",
      "Specify first corner or [Center]:",
      "Point or option keyword required.",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: FOO",
      "Point or option keyword required.",
      "Specify other corner or [Cube/Length]: 0,0",
      "Box of zero length not permitted.",
      "Specify other corner or [Cube/Length]: 10,0",
      "Box of zero width not permitted.",
      "Specify other corner or [Cube/Length]: 10,20",
    ])
    expect(written(cad, "FOO", "", "0", "-5")).toEqual([
      "Specify height or [2Point]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point]: 0",
      "Value must be nonzero.",
      "Specify height or [2Point]: -5",
    ])
    // Down along the UCS's Z: LIST adds its normal (p06).
    expect(listed(cad)[6]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
    expect(
      written(cad, "BOX", "C", "FOO", "0,0,0", "C", "0", "FOO", "8")
    ).toEqual([
      "BOX",
      "Specify first corner or [Center]: C",
      "Specify center: FOO",
      "Point or option keyword required.",
      "Specify center: 0,0,0",
      "Specify corner or [Cube/Length]: C",
      "Specify length: 0",
      "Box of zero length not permitted.",
      "Specify length: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify length: 8",
    ])
    expect(
      written(cad, "BOX", "0,0,0", "10,10", "2P", "5,5,5", "5,5,5", "5,5,8")
    ).toEqual([
      "BOX",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: 10,10",
      "Specify height or [2Point] <8.0000>: 2P",
      "Specify first point: 5,5,5",
      "Specify second point: 5,5,5",
      "Value must be nonzero.",
      "Specify second point: 5,5,8",
    ])
    expect(heightOf(last(cad))).toBe(3)
  })

  it("is one undo step (p08)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,20", "5", "BOX", "50,0,0", "60,20", "5")
    expect(written(cad, "U")).toEqual(["U", "BOX"])
    expect(solids(cad)).toHaveLength(1)
  })

  it("lies in the UCS, at its Z or the ELEVATION (p07)", () => {
    const cad = console()
    answer(cad, "UCS", "X", "30", "BOX", "0,0,0", "10,20", "5")
    expectAt(centroid(last(cad)), { x: 5, y: 7.410254, z: 7.165064 })
    // LIST reads it in the current UCS, where it is upright.
    expect(listed(cad).slice(5, 6)).toEqual([
      "         Position, X = 5.0000    Y = 10.0000   Z = 0.0000",
    ])
    answer(cad, "UCS", "W", "UCS", "Z", "30", "BOX", "50,0,3", "60,20", "5")
    expectAt(centroid(last(cad)), { x: 42.631397, y: 36.160254, z: 5.5 })
    answer(cad, "UCS", "W", "ELEVATION", "2", "BOX", "100,0", "110,10", "4")
    expectAt(centroid(last(cad)), { x: 105, y: 5, z: 4 })
  })

  it("asks in each language, by its own name (n01)", () => {
    const spanish = console(es)
    expect(written(spanish, "PRISMARECT", "0,0,0", "_C", "8")).toEqual([
      "PRISMARECT",
      "Precise primera esquina o [Centro]: 0,0,0",
      "Precise otra esquina o [Cubo/Longitud]: _C",
      "Precise longitud: 8",
    ])
    expect(listed(spanish)[4]).toBe("    Tipo de sólido = Prisma")
    const portuguese = console(ptBR)
    expect(
      written(portuguese, "CAIXA", "0,0,0", "10,20", "2P", "0,0,0", "0,0,3")
    ).toEqual([
      "CAIXA",
      "Especificar primeiro canto ou [Centro]: 0,0,0",
      "Especificar outro canto ou [CUbo/COmprimento]: 10,20",
      "Especificar altura ou [2Pontos]: 2P",
      "Especificar primeiro ponto: 0,0,0",
      "Especificar segundo ponto: 0,0,3",
    ])
    expect(written(portuguese, "CAIXA", "0,0", "0,0")[3]).toBe(
      "Não é permitido uma Caixa de comprimento zero."
    )
  })
})

describe("a 3D solid", () => {
  /** p01's box, in a view of it. */
  function boxed(): CadHarness {
    const cad = console()
    answer(cad, "ZOOM", "W", "-10,-10", "40,40", "BOX", "0,0,0", "10,20", "5")
    return cad
  }

  it("moves, copies, turns, scales and mirrors as a box (t01)", () => {
    const cad = boxed()
    answer(cad, "MOVE", "L", "", "0,0,0", "5,5,3")
    expectAt(centroid(last(cad)), { x: 10, y: 15, z: 5.5 })
    answer(cad, "COPY", "L", "", "0,0,0", "@30,0,0", "")
    answer(cad, "ROTATE", "L", "", "5,5", "30")
    expect(listed(cad).slice(5)).toEqual([
      "         Position, X = 30.3109   Y = 31.1603   Z = 3.0000",
      "           Length: 10.0000",
      "            Width: 20.0000",
      "           Height: 5.0000",
      "         Rotation: 30",
    ])
    answer(cad, "SCALE", "L", "", "5,5,3", "2")
    expectAt(centroid(last(cad)), { x: 55.621778, y: 57.320508, z: 8 })
    expect(brepVolume(last(cad).brep)).toBeCloseTo(8000, 6)
    answer(cad, "MIRROR", "L", "", "0,40", "10,40", "N")
    expectAt(centroid(last(cad)), { x: 55.621778, y: 22.679492, z: 8 })
    expect(listed(cad).slice(5)).toEqual([
      "         Position, X = 55.6218   Y = 22.6795   Z = 3.0000",
      "           Length: 20.0000",
      "            Width: 40.0000",
      "           Height: 10.0000",
      "         Rotation: 330",
    ])
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
  })

  it("turns, mirrors and scales in a tilted UCS (t02)", () => {
    const cad = console()
    answer(cad, "UCS", "Y", "40", "BOX", "0,0,0", "10,20", "5")
    answer(cad, "ROTATE", "L", "", "0,0", "90")
    answer(cad, "MIRROR", "L", "", "0,0", "0,10", "N")
    answer(cad, "SCALE", "L", "", "0,0", "0.5", "UCS", "W")
    const [source, mirrored] = solids(cad)
    expectAt(centroid(source), { x: -6.053475, y: 5, z: 8.342987 })
    expectAt(centroid(mirrored), { x: 4.633707, y: 2.5, z: -2.256382 })
    expect(brepVolume(mirrored.brep)).toBeCloseTo(125, 6)
    expect(listed(cad).slice(5)).toEqual([
      "         Position, X = 3.8302    Y = 2.5000    Z = -3.2139",
      "           Normal: X = 0.6428    Y = 0.0000    Z = 0.7660",
      "           Length: 5.0000",
      "            Width: 10.0000",
      "           Height: 2.5000",
      "         Rotation: 90",
    ])
  })

  it("is stretched whole once the window takes a vertex (t03, t05)", () => {
    const cad = boxed()
    answer(cad, "STRETCH", "C", "4,-1", "6,25", "", "0,0", "5,0")
    expectAt(centroid(last(cad)), { x: 5, y: 10, z: 2.5 })
    answer(cad, "STRETCH", "C", "-1,-1", "5,25", "", "0,0", "5,0")
    expectAt(centroid(last(cad)), { x: 10, y: 10, z: 2.5 })
  })

  it("explodes into a region of each face, facing out (p09)", () => {
    const cad = boxed()
    answer(cad, "EXPLODE", "L", "")
    const regions = cad
      .entities()
      .filter((e): e is RegionEntity => e.type === "region")
    expect(regions.map((r) => r.normal ?? { x: 0, y: 0, z: 1 })).toEqual([
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: -1 },
      { x: 0, y: -1, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
    ])
    expect(regions.map((r) => regionArea(r))).toEqual([
      200, 200, 50, 100, 50, 100,
    ])
    answer(cad, "EXPLODE", "ALL", "")
    expect(cad.typeCounts()).toEqual({ line: 24 })
  })

  it("is refused where AutoCAD refuses it (e01–e10)", () => {
    const refusal = (...texts: string[]) => {
      const cad = boxed()
      return written(cad, ...texts)
    }
    expect(refusal("OFFSET", "1", "10,10", "")).toContain(
      "Cannot offset that object."
    )
    expect(refusal("BREAK", "10,10")).toContain("Object can't be broken")
    expect(refusal("TRIM", "10,10", "")).toContain("Cannot TRIM this object.")
    expect(refusal("EXTEND", "10,10", "")).toContain(
      "Cannot EXTEND this object."
    )
    expect(refusal("PEDIT", "10,10", "")).toContain(
      "Object selected is not a polyline"
    )
    expect(refusal("DIMRADIUS", "10,10", "")).toContain(
      "Object selected is not a circle or arc."
    )
    expect(refusal("REGION", "L", "")).toEqual([
      "REGION",
      "Select objects: L",
      "1 found",
      "Select objects:",
      "1 closed, degenerate or unsupported object rejected.",
      "0 loops extracted.",
      "0 Regions created.",
    ])
    expect(
      refusal("LINE", "30,0", "30,30", "", "ARRAYPATH", "L", "", "10,10").at(-1)
    ).toBe("1 was filtered out")
    expect(refusal("AREA", "O", "L").at(-1)).toBe(
      "Area = 700.0000, Perimeter = 0.0000"
    )
  })

  it("gives the edge picked to DIMLINEAR and UCS OBject (e07, e08)", () => {
    const cad = boxed()
    answer(cad, "DIMLINEAR", "", "10,10", "20,10")
    const dimension = cad.latest()
    if (dimension.type !== "dimension") throw new Error(dimension.type)
    expectAt({ ...dimension.first, z: 0 }, { x: 10, y: 20, z: 0 })
    expectAt({ ...dimension.second, z: 0 }, { x: 10, y: 0, z: 0 })
    const ucs = boxed()
    answer(ucs, "UCS", "OB", "10,10")
    const { origin, xAxis } = ucs.runtime.document.getSettings().ucs
    expectAt(origin, { x: 10, y: 20, z: 0 })
    expectAt(xAxis, { x: 0, y: -1, z: 0 })
  })

  it("snaps at its vertices and the middles and points of its edges (s01, s02)", () => {
    const first = (cad: CadHarness, ...answers: string[]): Vec3 => {
      answer(cad, "LINE", ...answers, "@1,0,0", "")
      const line = cad.latest() as Entity
      if (line.type !== "line") throw new Error(line.type)
      return { ...line.start, z: lineStartZ(line) }
    }
    const cad = boxed()
    expectAt(first(cad, "_END", "0.2,0.1"), { x: 0, y: 0, z: 0 })
    expectAt(first(cad, "_MID", "10.1,9.8"), { x: 10, y: 10, z: 0 })
    expectAt(first(cad, "_NEA", "10.1,9.8"), { x: 10, y: 9.8, z: 0 })
    // No crossing at a vertex of its own: AutoCAD finds none (s01).
    expect(written(cad, "LINE", "_INT", "0.1,0.1").at(-1)).not.toMatch(
      /^Specify next/
    )
    answer(cad, "\u001b")
    const iso = boxed()
    answer(iso, "-VIEW", "_SEISO", "ZOOM", "E")
    const top = iso.toScreen({ x: 10, y: 20, z: 5 })
    void top
    expectAt(first(iso, "_END", "10,20,5"), { x: 10, y: 20, z: 5 })
    const line = iso.latest()
    expect(line.type === "line" && lineEndZ(line)).toBe(5)
  })

  it("is saved and read back, ISOLINES with the drawing (v01–v03)", () => {
    const cad = boxed()
    expect(written(cad, "ISOLINES", "2048", "16")).toEqual([
      "ISOLINES",
      "Enter new value for ISOLINES <4>: 2048",
      "Requires an integer between 0 and 2047.",
      "Enter new value for ISOLINES <4>: 16",
    ])
    const document = cad.runtime.document
    const file = serializeDrawing(
      snapshotOf(document.getEntities(), { settings: document.getSettings() })
    )
    const read = parseDrawingFile(file)
    expect(read.entities).toEqual(document.getEntities())
    expect(read.settings.isolines).toBe(16)
  })

  it("shows its box in the Properties palette, read only (d03)", () => {
    const cad = boxed()
    cad.escape().select(last(cad).id)
    const info = cad.state().properties.info
    const rows = info?.groups.flatMap((g) =>
      g.rows.map((r) => [r.label, r.value])
    )
    expect(info?.title).toBe("3D Solid")
    expect(rows).toEqual([
      ["Solid type", "Box"],
      ["Position X", "5.0000"],
      ["Position Y", "10.0000"],
      ["Position Z", "0.0000"],
      ["Length", "10.0000 mm"],
      ["Width", "20.0000 mm"],
      ["Height", "5.0000 mm"],
      ["Rotation", "0°"],
      ["History", "None"],
      ["Show History", "No"],
    ])
  })
})
