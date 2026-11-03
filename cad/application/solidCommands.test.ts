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

/** The point ID takes under the override `mode` at `at`, or its refusal. */
function identified(cad: CadHarness, mode: string, at: string): Vec3 | string {
  answer(cad, "ID", mode, at)
  const log = cad.commandLog()
  const found = log.at(-1)?.match(/X = (\S+)\s+Y = (\S+)\s+Z = (\S+)/)
  if (found) return { x: +found[1], y: +found[2], z: +found[3] }
  cad.escape()
  return log.findLast((line) => line.startsWith("No ")) ?? log.join(" | ")
}

/** LIST of the last object, its own lines. */
function listed(cad: CadHarness): string[] {
  return written(cad, "_LIST", "_L", "")
    .slice(4)
    .flatMap((line) => line.split("\n"))
}

/** LIST of the last object, from its Solid type line on. */
const shape = (cad: CadHarness) => listed(cad).slice(4)

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

  it("turns a box whose other corner lies at a smaller X: Rotation 180 (primitives/p123, p105)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "-10,20", "5")
    expect(shape(cad).slice(1)).toEqual([
      "         Position, X = -5.0000   Y = 10.0000   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 20.0000",
      "           Height: 5.0000",
      "         Rotation: 180",
    ])
    answer(cad, "BOX", "50,0,0", "60,-20", "5")
    expect(shape(cad).at(-1)).toBe("         Rotation: 0")
    answer(cad, "BOX", "100,0,0", "90,-20", "5")
    expect(shape(cad).at(-1)).toBe("         Rotation: 180")
    answer(cad, "BOX", "_C", "200,0,0", "190,-20", "5")
    expect(shape(cad).at(-1)).toBe("         Rotation: 180")
  })

  it("measures Length's width point square to the length's line (p124, p108, p109)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "_L", "10", "0,6", "4")
    expect(shape(cad).slice(1, 4)).toEqual([
      "         Position, X = 3.6042    Y = 4.4455    Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 5.5688",
    ])
    answer(cad, "BOX", "0,0,0", "_L", "10", "@0,6", "4")
    expect(shape(cad)[3]).toBe("            Width: 5.5688")
    answer(cad, "BOX", "100,0,0", "_L", "20<45", "@5<135", "3")
    expect(shape(cad)[3]).toBe("            Width: 2.9139")
  })

  it("measures Length's height from the far corner, not the length's end (p124)", () => {
    const cad = console()
    answer(cad, "BOX", "600,0,0", "_L", "10", "6", "600,0,0")
    expect(shape(cad)[4]).toBe("           Height: 11.6619")
    answer(cad, "BOX", "_C", "800,0,0", "_L", "10", "6", "800,0,0")
    expect(shape(cad).slice(1, 5)).toEqual([
      "         Position, X = 800.0000  Y = 0.0000    Z = -2.9155",
      "           Length: 10.0000",
      "            Width: 6.0000",
      "           Height: 5.8310",
    ])
  })

  it("reads a cube or length from a raised point in plan (p114, p125)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "_C", "0,30,8")
    expect(shape(cad).slice(1)).toEqual([
      "         Position, X = -15.0000  Y = 15.0000   Z = 0.0000",
      "           Length: 30.0000",
      "            Width: 30.0000",
      "           Height: 30.0000",
      "         Rotation: 90",
    ])
    answer(cad, "BOX", "300,0,0", "_L", "300,30,8", "6", "4")
    expect(shape(cad)[2]).toBe("           Length: 30.0000")
    // The next default is the plan length (p114).
    expect(written(cad, "BOX", "50,0,0", "_C", "").at(-1)).toBe(
      "Specify length <30.0000>:"
    )
  })

  it("from its centre, Length by a point is twice its distance, towards it (p500)", () => {
    const cad = console()
    answer(cad, "_BOX", "_C", "1,2,0", "_L", "4,6,0", "6", "5")
    expect(shape(cad).slice(1)).toEqual([
      "         Position, X = 1.0000    Y = 2.0000    Z = -2.5000",
      "           Length: 10.0000",
      "            Width: 6.0000",
      "           Height: 5.0000",
      "         Rotation: 53",
    ])
  })

  it("repeats on an empty line, offering the last height (p103)", () => {
    const cad = console()
    expect(
      written(cad, "BOX", "0,0,0", "10,20", "5", "", "50,0,0", "60,20", "")
    ).toEqual([
      "BOX",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: 10,20",
      "Specify height or [2Point]: 5",
      "BOX",
      "Specify first corner or [Center]: 50,0,0",
      "Specify other corner or [Cube/Length]: 60,20",
      "Specify height or [2Point] <5.0000>:",
    ])
    expect(solids(cad)).toHaveLength(2)
  })

  it("is refused transparently, 'BOX and 'WEDGE at LINE's prompt (p104)", () => {
    const cad = console()
    const out = written(cad, "LINE", "0,0", "'_BOX", "'_WEDGE", "10,0", "")
    expect(out.filter((l) => l.startsWith("**"))).toEqual([
      "** That command may not be invoked transparently **",
      "** That command may not be invoked transparently **",
    ])
    expect(
      out.filter((l) => l === "Point or option keyword required.")
    ).toHaveLength(2)
  })

  it("refuses a keyword of another prompt, in each prompt's words (p106)", () => {
    const cad = console()
    expect(
      written(cad, "BOX", "_L", "_2P", "0,0,0", "_2P", "10,20", "_C", "5")
    ).toEqual([
      "BOX",
      "Specify first corner or [Center]: _L",
      "Point or option keyword required.",
      "Specify first corner or [Center]: _2P",
      "Point or option keyword required.",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: _2P",
      "Point or option keyword required.",
      "Specify other corner or [Cube/Length]: 10,20",
      "Specify height or [2Point]: _C",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point]: 5",
    ])
  })

  it("takes the local keywords, pt-BR's ambiguous C clarified (p107)", () => {
    expect(
      written(
        console(es),
        "PRISMARECT",
        "C",
        "0,0,0",
        "L",
        "10",
        "6",
        "2P",
        "0,0,0",
        "0,0,3"
      )
    ).toEqual([
      "PRISMARECT",
      "Precise primera esquina o [Centro]: C",
      "Precise centro: 0,0,0",
      "Precise esquina o [Cubo/Longitud]: L",
      "Precise longitud: 10",
      "Precise anchura: 6",
      "Precise altura o [2Puntos]: 2P",
      "Precise primer punto: 0,0,0",
      "Precise segundo punto: 0,0,3",
    ])
    expect(written(console(ptBR), "CAIXA", "0,0,0", "C", "CU", "5")).toEqual([
      "CAIXA",
      "Especificar primeiro canto ou [Centro]: 0,0,0",
      "Especificar outro canto ou [CUbo/COmprimento]: C",
      "Resposta ambígua, esclareça...",
      "CUbo ou COmprimento? CU",
      "Especificar comprimento: 5",
    ])
  })

  it("reads `*x,y` in the WCS at every point and length (p125, p111)", () => {
    const cad = console()
    answer(cad, "UCS", "_Z", "30", "BOX", "*10,0", "*40,30", "5")
    expect(shape(cad).slice(1, 4)).toEqual([
      "         Position, X = 29.1506   Y = 0.4904    Z = 0.0000",
      "           Length: 40.9808",
      "            Width: 10.9808",
    ])
    answer(cad, "BOX", "100,0,0", "_L", "*130,30", "6", "4")
    expect(shape(cad)[2]).toBe("           Length: 47.7843")
    expect(shape(cad).at(-1)).toBe("         Rotation: 305")
    // A typed other corner without a Z lies at the first's, `*` at the
    // WCS's 0 (p111).
    answer(cad, "UCS", "_W", "BOX", "0,0,3", "*20,10")
    expect(shape(cad).slice(1, 3)).toEqual([
      "         Position, X = 10.0000   Y = 5.0000    Z = 3.0000",
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000",
    ])
    expect(written(cad, "BOX", "50,0,3", "#70,10")[3]).toBe(
      "Point or option keyword required."
    )
  })

  it("takes `@` and bare numbers at every point prompt (p105, p108, p112)", () => {
    const cad = console()
    answer(cad, "ID", "30,40", "BOX", "@", "@10,20", "@")
    expect(cad.commandLog().at(-1)).toBe("Value must be nonzero.")
    answer(cad, "5")
    expect(shape(cad)[1]).toBe(
      "         Position, X = 35.0000   Y = 50.0000   Z = 0.0000"
    )
    answer(cad, "ID", "30,40", "BOX", "10", "10", "5")
    expect(shape(cad).slice(1, 4)).toEqual([
      "         Position, X = 44.3929   Y = 44.2242   Z = 0.0000",
      "           Length: 9.5953",
      "            Width: 2.8162",
    ])
  })

  it("wears the layer, colour and lineweight set transparently mid-command (p122)", () => {
    const cad = console()
    cad.runtime.createLayer("L2")
    answer(cad, "CLAYER", "0")
    answer(
      cad,
      "BOX",
      "'-COLOR",
      "1",
      "0,0",
      "'CLAYER",
      "L2",
      "10,20",
      "'CELWEIGHT",
      "30",
      "5"
    )
    const box = last(cad)
    expect(cad.runtime.document.getLayer(box.layerId)?.name).toBe("L2")
    expect(box.color).toBe("#ff0000")
    expect(box.lineweight).toBe(0.3)
  })

  it("lies at ELEVATION, in the UCS too, and takes no THICKNESS (p121)", () => {
    const cad = console()
    answer(cad, "THICKNESS", "3", "ELEVATION", "7", "BOX", "0,0", "10,20", "5")
    expect("thickness" in last(cad)).toBe(false)
    answer(
      cad,
      ...["WEDGE", "20,0", "30,20", "5", "UCS", "_Z", "30"],
      ...["BOX", "50,0", "60,20", "5", "UCS", "_X", "90"],
      ...["WEDGE", "0,0", "10,20", "5", "UCS", "_W"]
    )
    // MPDUMP's extents of each.
    expect(
      solids(cad).map(({ brep: { vertices: v } }) =>
        (["x", "y", "z"] as const)
          .flatMap((k) =>
            [Math.min, Math.max].map((f) => f(...v.map((p) => p[k])))
          )
          .map((n) => Math.round(n * 1e4) / 1e4 + 0)
      )
    ).toEqual([
      [0, 10, 0, 20, 7, 12],
      [20, 30, 0, 20, 7, 12],
      [33.3013, 51.9615, 25, 47.3205, 7, 12],
      [3.5, 12.1603, -10.3923, -1.0622, 0, 20],
    ])
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
    const iso = boxed()
    answer(iso, "-VIEW", "_SEISO", "ZOOM", "E")
    expectAt(first(iso, "_END", "10,20,5"), { x: 10, y: 20, z: 5 })
    const line = iso.latest()
    expect(line.type === "line" && lineEndZ(line)).toBe(5)
  })

  it("offers no Intersection or Apparent Intersection on its edges (primitives/p400, p401)", () => {
    // The help's Object Snap tab: they "do not work with edges or corners of
    // 3D solids", against a line, another solid or its own edges.
    const drawn = () => {
      const cad = console()
      answer(cad, "ZOOM", "W", "-10,-10", "40,40")
      answer(cad, "BOX", "0,0,0", "10,20", "5", "BOX", "5,-5,0", "15,5", "5")
      return answer(cad, "LINE", "-5,10", "13,10", "")
    }
    const none = (mode: string) =>
      mode === "_INT"
        ? "No Intersection found for specified point."
        : "No found for specified point."
    const plan: [string, string][] = [
      ["_INT", "0.1,10.1"],
      ["_INT", "10.1,5.1"],
      ["_INT", "10.1,20.1"],
      ["_APP", "0.1,10.1"],
      ["_APP", "10.1,5.1"],
      ["_APP", "10.1,20.1"],
    ]
    for (const [mode, at] of plan) {
      expect(identified(drawn(), mode, at), `${mode} ${at}`).toBe(none(mode))
    }
    const iso: [string, string][] = [
      ["_INT", "10,5,5"],
      ["_INT", "10,5,0"],
      ["_INT", "5,0,5"],
      ["_INT", "0,10,0"],
      ["_INT", "10,15,5"],
      ["_APP", "0,10,0"],
      ["_APP", "10,15,5"],
      ["_APP", "10,5,5"],
    ]
    for (const [mode, at] of iso) {
      const cad = answer(drawn(), "-VIEW", "_SEISO", "ZOOM", "E")
      expect(identified(cad, mode, at), `${mode} ${at}`).toBe(none(mode))
    }
  })

  it("snaps under the running object snaps (primitives/p404)", () => {
    // The console's typed points under OSNAPCOORD 0, here clicks there.
    const cad = createHarness({ width: 942, height: 534, snap: true })
    answer(cad, "LUPREC", "4", "ZOOM", "W", "-10,-10", "40,40")
    answer(cad, "BOX", "0,0,0", "10,20", "5", "CYLINDER", "30,10,0", "5", "8")
    const at = (x: number, y: number, z = 0) => {
      answer(cad, "ID")
      cad.moveTo({ x, y, z }).click({ x, y, z })
      return cad.commandLog().at(-1)!.trim()
    }
    const printed = (x: string, y: string, z: string) =>
      `X = ${x}     Y = ${y}     Z = ${z}`
    expect(at(0.1, 0.1)).toBe(printed("0.0000", "0.0000", "0.0000"))
    expect(at(35.1, 10.1)).toBe(printed("30.0000", "10.0000", "0.0000"))
    expect(at(33.6, 13.6)).toBe(printed("30.0000", "10.0000", "0.0000"))
    answer(cad, "OSMODE", "512")
    expect(at(5.1, 0.1)).toBe(printed("5.1000", "0.0000", "0.0000"))
    expect(at(33.6, 13.6)).toBe(printed("33.5355", "13.5355", "0.0000"))
    answer(cad, "OSMODE", "2")
    expect(at(5.1, 0.1)).toBe(printed("5.0000", "0.0000", "0.0000"))
    answer(cad, "VPOINT", "1,-1,1", "ZOOM", "E", "OSMODE", "4133")
    expect(at(10, 20, 5)).toBe(printed("10.0000", "20.0000", "5.0000"))
    expect(at(35, 10, 8)).toBe(printed("30.0000", "10.0000", "8.0000"))
  })

  it("is picked, windowed, crossed and fenced by what it draws (primitives/p405, p406)", () => {
    const drawn = (height: string) => {
      const cad = createHarness({ width: 942, height: 534 })
      answer(cad, "BOX", "0,0,0", "10,20", "5")
      answer(cad, "CYLINDER", "30,10,0", "5", height, "SPHERE", "50,10,5", "5")
      return answer(
        cad,
        "TORUS",
        "75,10,0",
        "10",
        "2",
        "CONE",
        "100,10,0",
        "5",
        "8"
      )
    }
    /** 1 when `Select objects:` finds something with `answers`, else 0. */
    const finds = (cad: CadHarness, ...answers: string[]) => {
      const lines = written(cad, "ERASE", ...answers)
      cad.escape().escape()
      return /^[1-9]/.test(lines.find((l) => /found/.test(l)) ?? "") ? 1 : 0
    }
    const plan = answer(drawn("8"), "ZOOM", "W", "-5,-5", "105,25")
    const picks = [
      ["10,10", 1],
      ["5,10", 0],
      ["9.5,10", 0],
      ["35,10", 1],
      ["30,10", 0],
      ["32,10", 0],
      ["50,10", 1],
      ["53.5355,10", 1],
      ["54,10", 1],
      ["52,11.5", 0],
      ["75,10", 0],
      ["75,20", 1],
      ["82.7942,14.5", 0],
      ["102.5,10", 1],
      ["101.5,11.5", 0],
    ] as const
    for (const [point, found] of picks) {
      expect(finds(plan, point), point).toBe(found)
    }
    const windows = [
      ["W", "44,4", "56,16", 1],
      ["W", "-1,-1", "11,15", 0],
      ["C", "49.8,9.8", "50.2,10.2", 1],
      ["C", "4,9", "6,11", 0],
      ["C", "51.8,11.3", "52.2,11.7", 0],
      ["C", "74.8,9.8", "75.2,10.2", 0],
    ] as const
    for (const [mode, from, to, found] of windows) {
      expect(finds(plan, mode, from, to), `${mode} ${from}`).toBe(found)
    }
    const fences = [
      ["5,5", "5,15", 0],
      ["22,10", "27,10", 1],
      ["51,8", "51,12", 1],
      ["52,11", "52.5,11.5", 0],
    ] as const
    for (const [from, to, found] of fences) {
      expect(finds(plan, "F", from, to, ""), `F ${from}`).toBe(found)
    }
    const iso = answer(drawn("20"), "VPOINT", "1,-1,1", "ZOOM", "E")
    const clicks = [
      ["10,10,5", 1],
      ["5,10,5", 1],
      ["5,10,0", 1],
      ["35,10,10", 1],
      ["30,10,10", 0],
      ["50,10,5", 0],
      ["50,10,10", 1],
      ["55,10,5", 1],
      ["75,10,0", 0],
      ["85,10,2", 1],
      ["100,10,4", 1],
      ["102.5,10,4", 1],
    ] as const
    for (const [point, found] of clicks) {
      expect(finds(iso, point), point).toBe(found)
    }
    expect(finds(iso, "C", "49.8,9.8,5", "50.2,10.2,5")).toBe(0)
    expect(finds(iso, "C", "4.8,9.8,5", "5.2,10.2,5")).toBe(1)
  })

  it("is picked by a point typed at Select objects: off the plan, as a click there (primitives/p426)", () => {
    const cad = console()
    answer(cad, "SPHERE", "50,10,5", "5", "VPOINT", "1,-1,1", "ZOOM", "E")
    expect(written(cad, "ERASE", "55,10,5", "")).toEqual([
      "ERASE",
      "Select objects: 55,10,5",
      "1 found",
      "Select objects:",
    ])
    expect(solids(cad)).toEqual([])
    answer(cad, "U", "ERASE", "50,10,5")
    expect(cad.state().commandLine.prompt).toBe(
      "ERASE Specify opposite corner:"
    )
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

  it("shows its box in the Properties palette (d03)", () => {
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
