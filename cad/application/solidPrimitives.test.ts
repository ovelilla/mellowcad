import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec3 } from "../geometry/Vec3"
import { brepArea, brepIsClosed, brepVolume } from "../geometry/solids"
import {
  lineStartZ,
  type RegionEntity,
  type Solid3dEntity,
} from "../domain/entities"
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

/** The console's own: LUPREC 4, its cursor at the initial view's corner. */
function console(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  answer(cad, "LUPREC", "4")
  cad.moveTo({ x: 289.98397, y: 116.30379 })
  return cad
}

/** LIST of the last object, from its Solid type line on. */
function listed(cad: CadHarness): string[] {
  return written(cad, "_LIST", "_L", "")
    .slice(4)
    .flatMap((line) => line.split("\n"))
    .slice(4)
}

/** LIST of every object, newest first, each from its Solid type line on. */
function listedAll(cad: CadHarness): string[][] {
  const lines = written(cad, "_LIST", "_ALL", "")
    .slice(4)
    .flatMap((line) => line.split("\n"))
  const out: string[][] = []
  for (const line of lines) {
    if (line.includes("3DSOLID")) out.push([])
    else out.at(-1)?.push(line)
  }
  return out.map((block) => block.slice(3))
}

function expectAt(actual: Vec3, expected: Vec3, digits = 5) {
  expect(actual.x).toBeCloseTo(expected.x, digits)
  expect(actual.y).toBeCloseTo(expected.y, digits)
  expect(actual.z).toBeCloseTo(expected.z, digits)
}

/** The vertices of a solid's edges, start and end, as MPDUMP prints them. */
function edgeEnds(solid: Solid3dEntity): number[][][] {
  const { vertices, edges } = solid.brep
  const at = (i: number) =>
    [vertices[i].x, vertices[i].y, vertices[i].z].map(
      (v) => Math.round(v * 1e4) / 1e4 + 0
    )
  return edges.map((e) => [at(e.start), at(e.end)])
}

describe("WEDGE", () => {
  it("asks BOX's prompts and makes a wedge, its slope down from the first corner (solid/w01)", () => {
    const cad = console()
    expect(written(cad, "WEDGE", "0,0,0", "10,20", "5")).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: 10,20",
      "Specify height or [2Point]: 5",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Wedge",
      "         Position, X = 5.0000    Y = 10.0000   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 20.0000",
      "           Height: 5.0000",
      "         Rotation: 0",
    ])
    const wedge = last(cad)
    expect(brepIsClosed(wedge.brep)).toBe(true)
    expect(brepVolume(wedge.brep)).toBeCloseTo(500, 9)
    // ACIS's edges, in its order and sense (w01's MPDUMP).
    expect(edgeEnds(wedge)).toEqual([
      [
        [10, 20, 0],
        [0, 20, 5],
      ],
      [
        [10, 0, 0],
        [10, 20, 0],
      ],
      [
        [0, 20, 5],
        [0, 20, 0],
      ],
      [
        [0, 0, 5],
        [0, 20, 5],
      ],
      [
        [0, 20, 0],
        [10, 20, 0],
      ],
      [
        [0, 0, 0],
        [0, 20, 0],
      ],
      [
        [0, 0, 0],
        [10, 0, 0],
      ],
      [
        [10, 0, 0],
        [0, 0, 5],
      ],
      [
        [0, 0, 5],
        [0, 0, 0],
      ],
    ])
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 573.6068, Perimeter = 0.0000"
    )
  })

  it("centres, cubes and lengthens along the UCS's X, sharing BOX's defaults (w02, w08)", () => {
    const cad = console()
    answer(cad, "WEDGE", "C", "0,0,0", "10,20", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = -2.5000",
      "           Length: 20.0000",
    ])
    answer(cad, "WEDGE", "50,0,0", "C", "8")
    expect(listed(cad)).toEqual([
      "      Solid type = Wedge",
      "         Position, X = 54.0000   Y = 4.0000    Z = 0.0000",
      "           Length: 8.0000",
      "            Width: 8.0000",
      "           Height: 8.0000",
      "         Rotation: 0",
    ])
    expect(written(cad, "WEDGE", "100,0,0", "L", "10", "6", "")).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 100,0,0",
      "Specify other corner or [Cube/Length]: L",
      "Specify length <8.0000>: 10",
      "Specify width: 6",
      "Specify height or [2Point] <8.0000>:",
    ])
    expect(listed(cad)[1]).toBe(
      "         Position, X = 105.0000  Y = 3.0000    Z = 0.0000"
    )
    // BOX and WEDGE share a height (w02).
    expect(written(cad, "BOX", "200,0,0", "210,10", "3")[3]).toBe(
      "Specify height or [2Point] <8.0000>: 3"
    )
    expect(written(cad, "WEDGE", "300,0,0", "310,10", "")[3]).toBe(
      "Specify height or [2Point] <3.0000>:"
    )
    answer(cad, "WEDGE", "400,0,0", "410,10,-4")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 405.0000  Y = 5.0000    Z = 0.0000",
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000",
    ])
    // A point gives the length, along X all the same (w08).
    answer(cad, "WEDGE", "500,0,0", "L", "510,10", "6", "4")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 507.0711  Y = 3.0000    Z = 0.0000",
      "           Length: 14.1421",
      "            Width: 6.0000",
      "           Height: 4.0000",
      "         Rotation: 0",
    ])
    expect(
      written(cad, "WEDGE", "600,0,0", "L", "-10", "-6", "4").slice(3, 5)
    ).toEqual(["Specify length <14.1421>: -10", "Specify width <6.0000>: -6"])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 595.0000  Y = -3.0000   Z = 0.0000",
      "           Length: 10.0000",
      "            Width: 6.0000",
      "           Height: 4.0000",
      "         Rotation: 180",
    ])
    answer(cad, "WEDGE", "700,0,0", "L", "10", "710,-10", "4")
    expect(listed(cad)[1]).toBe(
      "         Position, X = 705.0000  Y = 5.0000    Z = 0.0000"
    )
    // Its tall end is at the first corner (w08), or opposite the corner
    // given from its centre (w09).
    answer(cad, "WEDGE", "800,0,0", "790,-20", "5")
    expect(listed(cad).at(-1)).toBe("         Rotation: 180")
    // A negative cube is wide back along the UCS's Y too (v04).
    answer(cad, "WEDGE", "1000,0,0", "C", "-8")
    expect(listed(cad)[1]).toBe(
      "         Position, X = 996.0000  Y = -4.0000   Z = 0.0000"
    )
    answer(cad, "WEDGE", "C", "900,0,0", "890,-20", "5")
    const tall = last(cad).brep.vertices.filter((p) => p.z > 0)
    expect(tall.map((p) => p.x)).toEqual([910, 910])
  })

  it("refuses as BOX does, in its own words, and Enter at the width too (w03, w04)", () => {
    const cad = console()
    expect(
      written(cad, "WEDGE", "FOO", "", "0,0,0", "FOO", "0,0", "10,0", "10,20")
    ).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: FOO",
      "Point or option keyword required.",
      "Specify first corner or [Center]:",
      "Point or option keyword required.",
      "Specify first corner or [Center]: 0,0,0",
      "Specify other corner or [Cube/Length]: FOO",
      "Point or option keyword required.",
      "Specify other corner or [Cube/Length]: 0,0",
      "Wedge of zero length not permitted.",
      "Specify other corner or [Cube/Length]: 10,0",
      "Wedge of zero width not permitted.",
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
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
    answer(cad, "WEDGE", "C", "200,0,0", "C", "0", "FOO", "-8")
    // From the centre a negative cube is twice as long (w04, w09).
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 200.0000  Y = 0.0000    Z = -8.0000",
      "           Length: 16.0000",
      "            Width: 16.0000",
      "           Height: 16.0000",
      "         Rotation: 180",
    ])
    expect(
      written(cad, "WEDGE", "300,0,0", "L", "0", "10", "0", "FOO", "", "6", "7")
    ).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 300,0,0",
      "Specify other corner or [Cube/Length]: L",
      "Specify length <16.0000>: 0",
      "Wedge of zero length not permitted.",
      "Specify length <16.0000>: 10",
      "Specify width: 0",
      "Wedge of zero width not permitted.",
      "Specify width: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify width:",
      "Wedge of zero width not permitted.",
      "Specify width: 6",
      "Specify height or [2Point] <16.0000>: 7",
    ])
  })

  it("lies in the UCS and at its Z, LIST reading it there (w05)", () => {
    const cad = console()
    answer(cad, "UCS", "X", "30", "WEDGE", "0,0,0", "10,20", "5")
    expect(listed(cad)[1]).toBe(
      "         Position, X = 5.0000    Y = 10.0000   Z = 0.0000"
    )
    answer(cad, "UCS", "W", "UCS", "Z", "30", "WEDGE", "50,0,3", "60,20", "5")
    answer(cad, "UCS", "W")
    expect(listedAll(cad)).toEqual([
      [
        "      Solid type = Wedge",
        "         Position, X = 42.6314   Y = 36.1603   Z = 3.0000",
        "           Length: 10.0000",
        "            Width: 20.0000",
        "           Height: 5.0000",
        "         Rotation: 30",
      ],
      [
        "      Solid type = Wedge",
        "         Position, X = 5.0000    Y = 8.6603    Z = 5.0000",
        "           Normal: X = 0.0000    Y = -0.5000   Z = 0.8660",
        "           Length: 10.0000",
        "            Width: 20.0000",
        "           Height: 5.0000",
        "         Rotation: 0",
      ],
    ])
  })

  it("moves, turns, mirrors and scales as a wedge (w06)", () => {
    const cad = console()
    answer(cad, "WEDGE", "0,0,0", "10,20", "5")
    answer(
      cad,
      "MOVE",
      "L",
      "",
      "0,0,0",
      "5,5,3",
      "ROTATE",
      "L",
      "",
      "0,0",
      "30"
    )
    expect(listed(cad)[1]).toBe(
      "         Position, X = 1.1603    Y = 17.9904   Z = 3.0000"
    )
    answer(cad, "MIRROR", "L", "", "0,40", "10,40", "N")
    expect(listed(cad).at(-1)).toBe("         Rotation: 330")
    answer(cad, "MIRROR", "L", "", "0,0", "0,10", "Y")
    expect(listed(cad).at(-1)).toBe("         Rotation: 210")
    answer(cad, "SCALE", "L", "", "0,0", "2")
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = -2.3205   Y = 124.0192  Z = 6.0000",
      "           Length: 20.0000",
      "            Width: 40.0000",
      "           Height: 10.0000",
      "         Rotation: 210",
    ])
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
    expect(brepVolume(last(cad).brep)).toBeCloseTo(4000, 6)
  })

  it("explodes into a region of each face (w07)", () => {
    const cad = console()
    answer(cad, "WEDGE", "0,0,0", "10,20", "5", "EXPLODE", "L", "")
    const regions = cad
      .entities()
      .filter((e): e is RegionEntity => e.type === "region")
    expect(regions).toHaveLength(5)
  })

  it("asks in each language, by its own name (n02)", () => {
    const spanish = console(es)
    expect(written(spanish, "CUÑA", "0,0", "0,0")).toEqual([
      "CUÑA",
      "Precise primera esquina o [Centro]: 0,0",
      "Precise otra esquina o [Cubo/Longitud]: 0,0",
      "No puede ser un Cuña de longitud cero.",
    ])
    answer(spanish, "10,20", "5")
    expect(listed(spanish)[0]).toBe("    Tipo de sólido = Cuña")
    const portuguese = console(ptBR)
    expect(written(portuguese, "CN", "0,0", "10,0")[3]).toBe(
      "Não é permitida uma Cunha de largura zero."
    )
  })
})

describe("PYRAMID", () => {
  it("says its sides and Type, and turns its base towards the cursor (solid/y01)", () => {
    const cad = console()
    expect(written(cad, "PYRAMID", "0,0,0", "5", "8")).toEqual([
      "PYRAMID",
      " 4 sides  Circumscribed",
      "Specify center point of base or [Edge/Sides]: 0,0,0",
      "Specify base radius or [Inscribed]: 5",
      "Specify height or [2Point/Axis endpoint/Top radius]: 8",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Pyramid",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "    Inscribed base radius: 7.0711",
      "Circumscribed base radius: 5.0000",
      "     Inscribed top radius: 0.0000",
      " Circumscribed top radius: 0.0000",
      "           Height: 8.0000",
      "         Rotation: 22",
      "  Number of sides: 4",
    ])
    const pyramid = last(cad)
    expect(brepIsClosed(pyramid.brep)).toBe(true)
    expect(brepVolume(pyramid.brep)).toBeCloseTo(800 / 3, 9)
    expect(brepArea(pyramid.brep)).toBeCloseTo(288.679623, 6)
    // A corner half a side round from the cursor's heading (y01's MPDUMP).
    expect(
      pyramid.brep.vertices.some(
        (p) =>
          Math.abs(p.x - 2.779438) < 1e-6 && Math.abs(p.y - 6.501902) < 1e-6
      )
    ).toBe(true)
  })

  it("takes Sides, Inscribed, Edge, Top radius, Axis endpoint and 2Point (y02)", () => {
    const cad = console()
    expect(
      written(cad, "PYRAMID", "S", "6", "50,0,0", "I", "5", "8").slice(1)
    ).toEqual([
      " 4 sides  Circumscribed",
      "Specify center point of base or [Edge/Sides]: S",
      "Enter number of sides <4>: 6",
      "Specify center point of base or [Edge/Sides]: 50,0,0",
      "Specify base radius or [Inscribed]: I",
      "Specify base radius or [Circumscribed]: 5",
      "Specify height or [2Point/Axis endpoint/Top radius]: 8",
    ])
    expect(listed(cad).slice(2, 4)).toEqual([
      "    Inscribed base radius: 5.0000",
      "Circumscribed base radius: 4.3301",
    ])
    expect(listed(cad)[7]).toBe("         Rotation: 56")
    expect(
      written(cad, "PYRAMID", "E", "100,0,0", "110,0", "T", "3", "6").slice(1)
    ).toEqual([
      " 6 sides  Inscribed",
      "Specify center point of base or [Edge/Sides]: E",
      "Specify first endpoint of edge: 100,0,0",
      "Specify second endpoint of edge: 110,0",
      "Specify height or [2Point/Axis endpoint/Top radius] <8.0000>: T",
      "Specify top radius <0.0000>: 3",
      "Specify height or [2Point/Axis endpoint] <8.0000>: 6",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 105.0000  Y = 8.6603    Z = 0.0000",
      "    Inscribed base radius: 10.0000",
      "Circumscribed base radius: 8.6603",
      "     Inscribed top radius: 3.0000",
      " Circumscribed top radius: 2.5981",
      "           Height: 6.0000",
      "         Rotation: 270",
      "  Number of sides: 6",
    ])
    expect(
      written(cad, "PYRAMID", "200,0,0", "5", "A", "200,0,10").slice(2)
    ).toEqual([
      "Specify center point of base or [Edge/Sides]: 200,0,0",
      "Specify base radius or [Circumscribed] <10.0000>: 5",
      "Specify height or [2Point/Axis endpoint/Top radius] <6.0000>: A",
      "Specify axis endpoint: 200,0,10",
    ])
    expect(listed(cad).slice(6, 8)).toEqual([
      "           Height: 10.0000",
      "         Rotation: 82",
    ])
    answer(cad, "PYRAMID", "300,0,0", "5", "2P", "0,0,0", "0,0,7")
    expect(listed(cad).slice(6, 8)).toEqual([
      "           Height: 7.0000",
      "         Rotation: 125",
    ])
  })

  it("refuses what makes no pyramid (y03, y04, y06)", () => {
    const cad = console()
    expect(
      written(cad, "PYRAMID", "S", "FOO", "2", "33", "", "FOO", "", "0,0,0")
    ).toEqual([
      "PYRAMID",
      " 4 sides  Circumscribed",
      "Specify center point of base or [Edge/Sides]: S",
      "Enter number of sides <4>: FOO",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>: 2",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>: 33",
      "Requires an integer between 3 and 32.",
      "Enter number of sides <4>:",
      "Specify center point of base or [Edge/Sides]: FOO",
      "Point or option keyword required.",
      "Specify center point of base or [Edge/Sides]:",
      "Point or option keyword required.",
      "Specify center point of base or [Edge/Sides]: 0,0,0",
    ])
    expect(written(cad, "FOO", "", "0", "-3", "5")).toEqual([
      "Specify base radius or [Inscribed]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Inscribed]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Inscribed]: 0",
      "Value must be positive and nonzero.",
      "Specify base radius or [Inscribed]: -3",
      "Value must be positive and nonzero.",
      "Specify base radius or [Inscribed]: 5",
    ])
    expect(written(cad, "FOO", "", "0", "-4")).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint/Top radius]: 0",
      "Value must be nonzero.",
      "Specify height or [2Point/Axis endpoint/Top radius]: -4",
    ])
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
    expect(
      written(cad, "PYRAMID", "E", "FOO", "0,0,0", "0,0", "10,0", "4").slice(3)
    ).toEqual([
      "Specify first endpoint of edge: FOO",
      "Invalid point.",
      "Specify first endpoint of edge: 0,0,0",
      "Specify second endpoint of edge: 0,0",
      "Value must be positive and nonzero.",
      "Specify second endpoint of edge: 10,0",
      "Specify height or [2Point/Axis endpoint/Top radius] <-4.0000>: 4",
    ])
    expect(listed(cad)[1]).toBe(
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000"
    )
    expect(
      written(
        cad,
        "PYRAMID",
        "50,0,0",
        "5",
        "A",
        "FOO",
        "50,0,0",
        "50,10,10"
      ).slice(5)
    ).toEqual([
      "Specify axis endpoint: FOO",
      "Invalid point.",
      "Specify axis endpoint: 50,0,0",
      "Value must be nonzero.",
      "Specify axis endpoint: 50,10,10",
    ])
    expect(listed(cad).slice(2, 3)).toEqual([
      "           Normal: X = 0.0000    Y = 0.7071    Z = 0.7071",
    ])
  })

  it("takes the top radius and the last ones as defaults, Enter's base unturned (y05, y10)", () => {
    const cad = console()
    expect(
      written(cad, "PYRAMID", "0,0,0", "5", "T", "FOO", "", "-1").slice(5)
    ).toEqual([
      "Specify top radius <0.0000>: FOO",
      "Requires numeric distance or second point.",
      "Specify top radius <0.0000>:",
      "Specify height or [2Point/Axis endpoint]: -1",
    ])
    expect(
      written(cad, "PYRAMID", "50,0,0", "", "T", "5", "7").slice(3)
    ).toEqual([
      "Specify base radius or [Inscribed] <7.0711>:",
      "Specify height or [2Point/Axis endpoint/Top radius] <-1.0000>: T",
      "Specify top radius <0.0000>: 5",
      "Specify height or [2Point/Axis endpoint] <-1.0000>: 7",
    ])
    expect(listed(cad).slice(2)).toEqual([
      "    Inscribed base radius: 7.0711",
      "Circumscribed base radius: 5.0000",
      "     Inscribed top radius: 7.0711",
      " Circumscribed top radius: 5.0000",
      "           Height: 7.0000",
      "         Rotation: 0",
      "  Number of sides: 4",
    ])
    // The top radius is kept as its corners' circle, which Enter gives (y10).
    expect(written(cad, "PYRAMID", "100,0,0", "5", "T", "", "8")[5]).toBe(
      "Specify top radius <7.0711>:"
    )
    expect(listed(cad).slice(4, 6)).toEqual([
      "     Inscribed top radius: 7.0711",
      " Circumscribed top radius: 5.0000",
    ])
  })

  it("turns the base Enter takes to put a corner on the UCS's X, Inscribed (v04)", () => {
    const cad = console()
    answer(
      cad,
      "PYRAMID",
      "50,0,0",
      "I",
      "5",
      "8",
      "PYRAMID",
      "100,0,0",
      "",
      "8"
    )
    expect(listed(cad)[7]).toBe("         Rotation: 45")
    answer(cad, "PYRAMID", "150,0,0", "C", "", "8")
    expect(listed(cad).slice(2, 4)).toEqual([
      "    Inscribed base radius: 5.0000",
      "Circumscribed base radius: 3.5355",
    ])
    expect(listed(cad)[7]).toBe("         Rotation: 0")
  })

  it("lies in the UCS, its base turned in the axis' OCS when tilted (y07, y09)", () => {
    // A radius given by a point turns the base towards it, in the UCS.
    const cad = console()
    answer(cad, "UCS", "X", "30", "PYRAMID", "0,0,0", "3,3", "8")
    expect(listed(cad)[7]).toBe("         Rotation: 45")
    answer(cad, "UCS", "W")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Normal: X = 0.0000    Y = -0.5000   Z = 0.8660",
    ])
    expect(listed(cad)[8]).toBe("         Rotation: 41")
    const tilted = console()
    answer(tilted, "PYRAMID", "S", "3", "0,0,0", "5", "A", "0,10,10")
    expectAt(
      last(tilted).brep.vertices.find((p) => p.z > 6)!,
      { x: -1.416921, y: -6.999726, z: 6.999726 },
      5
    )
    answer(tilted, "PYRAMID", "100,0,0", "5", "A", "100,0,-10")
    expect(
      last(tilted).brep.vertices.some(
        (p) =>
          Math.abs(p.x - 100.257234) < 1e-5 && Math.abs(p.y - 9.996691) < 1e-5
      )
    ).toBe(true)
  })

  it("moves, turns, mirrors and scales as a pyramid (y08)", () => {
    const cad = console()
    answer(cad, "PYRAMID", "0,0,0", "5", "8")
    answer(
      cad,
      "MOVE",
      "L",
      "",
      "0,0,0",
      "5,5,3",
      "ROTATE",
      "L",
      "",
      "0,0",
      "30"
    )
    expect(listed(cad).slice(1, 2)).toEqual([
      "         Position, X = 1.8301    Y = 6.8301    Z = 3.0000",
    ])
    expect(listed(cad)[7]).toBe("         Rotation: 52")
    answer(cad, "MIRROR", "L", "", "0,40", "10,40", "N")
    expect(listed(cad)[7]).toBe("         Rotation: 308")
    answer(cad, "SCALE", "L", "", "0,0", "2")
    expect(listed(cad).slice(1, 4)).toEqual([
      "         Position, X = 3.6603    Y = 146.3397  Z = 6.0000",
      "    Inscribed base radius: 14.1421",
      "Circumscribed base radius: 10.0000",
    ])
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
    answer(cad, "PYRAMID", "100,0,0", "5", "T", "1", "8", "EXPLODE", "L", "")
    expect(cad.typeCounts().region).toBe(6)
  })

  it("is saved and read back with its primitive", () => {
    const cad = console()
    answer(cad, "PYRAMID", "S", "5", "0,0,0", "I", "5", "T", "2", "8")
    answer(cad, "WEDGE", "20,0,0", "30,10", "4")
    const document = cad.runtime.document
    const file = serializeDrawing(
      snapshotOf(document.getEntities(), { settings: document.getSettings() })
    )
    expect(parseDrawingFile(file).entities).toEqual(document.getEntities())
  })

  it("asks in each language, by its own name (n02)", () => {
    const spanish = console(es)
    expect(written(spanish, "PIR", "0,0,0", "5", "8")).toEqual([
      "PIR PIRAMIDE",
      " 4 lados circunscritos",
      "Precise centro de base o [Arista/Lados]: 0,0,0",
      "Precise radio de base o [Inscrito]: 5",
      "Indique altura o [2Puntos/punto final Eje/Radio superior]: 8",
    ])
    expect(listed(spanish).slice(2)).toEqual([
      "   Radio de base inscrito: 7.0711",
      "Radio de base circunscrito: 5.0000",
      "  Radio superior inscrito: 0.0000",
      "Radio superior circunscrito: 0.0000",
      "           Altura: 8.0000",
      "         Rotación: 22",
      "  Número de lados: 4",
    ])
    const portuguese = console(ptBR)
    expect(
      written(portuguese, "PIRAMIDE", "0,0,0", "5", "R", "", "8").slice(1)
    ).toEqual([
      " 4 lados circunscritos",
      "Especificar ponto central da base ou [Aresta/Lados]: 0,0,0",
      "Especificar raio base  ou [Inscrito]: 5",
      "Especificar altura ou [2Pontos/ponto final Eixo/Raio superior]: R",
      "Especificar raio superior <0.0000>:",
      "Especificar altura ou [2Pontos/ponto final Eixo]: 8",
    ])
  })
})

describe("the primitives' defaults", () => {
  it("share a height, a length and a width, kept as made (x06, x07, p10)", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "L", "-10", "-6", "4")
    expect(written(cad, "WEDGE", "50,0,0", "L", "12", "7", "")).toEqual([
      "WEDGE",
      "Specify first corner or [Center]: 50,0,0",
      "Specify other corner or [Cube/Length]: L",
      "Specify length <10.0000>: 12",
      "Specify width <6.0000>: 7",
      "Specify height or [2Point] <4.0000>:",
    ])
    expect(written(cad, "PYRAMID", "100,0,0", "3", "")[4]).toBe(
      "Specify height or [2Point/Axis endpoint/Top radius] <4.0000>:"
    )
    // From the centre a negative length is twice as long, BOX's too (x07).
    answer(cad, "BOX", "C", "150,0,0", "L", "-10", "6", "4")
    const box = last(cad).primitive
    expect(box?.kind === "box" && box.length).toBe(20)
    expect(written(cad, "BOX", "200,0,0", "L", "5")[3]).toBe(
      "Specify length <20.0000>: 5"
    )
  })
})

/** Where a LINE starts snapped by `mode` at `at`, or the refusal it met. */
function snapped(cad: CadHarness, mode: string, at: string): Vec3 | string {
  const out = written(cad, "LINE", mode, at, "@1,0,0", "")
  const line = cad.latest()
  if (line.type !== "line" || out.some((l) => l.startsWith("No "))) {
    answer(cad, "\u001b")
    return out.find((l) => l.startsWith("No ")) ?? out.join(" | ")
  }
  answer(cad, "ERASE", "L", "")
  return { ...line.start, z: lineStartZ(line) }
}

describe("CYLINDER", () => {
  it("asks a base and a height, its seam on the UCS's X (solid/c01)", () => {
    const cad = console()
    expect(written(cad, "CYLINDER", "0,0,0", "5", "8")).toEqual([
      "CYLINDER",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 0,0,0",
      "Specify base radius or [Diameter]: 5",
      "Specify height or [2Point/Axis endpoint]: 8",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Cylinder",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Radius: 5.0000",
      "           Height: 8.0000",
    ])
    const { brep } = last(cad)
    expect(brepIsClosed(brep)).toBe(true)
    // ACIS's: a vertex on each circle, the base's run about -Z (c01's MPDUMP).
    expect(brep.vertices).toEqual([
      { x: 5, y: 0, z: 0 },
      { x: 5, y: 0, z: 8 },
    ])
    expect(brep.edges.map((e) => e.curve.kind)).toEqual(["circle", "circle"])
    const base = brep.edges[0].curve
    expect(base.kind === "circle" && base.normal).toEqual({ x: 0, y: 0, z: -1 })
    expect(brep.faces.map((f) => f.surface.kind)).toEqual([
      "cylinder",
      "plane",
      "plane",
    ])
    expect(brepVolume(brep)).toBeCloseTo(628.318531, 6)
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 408.4070, Perimeter = 0.0000"
    )
  })

  it("takes 3P, 2P and Diameter, a 3P base tilted into its points' plane (c02)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "3P", "0,0,0", "10,0,0", "0,10,0", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 5.0000    Y = 5.0000    Z = 0.0000",
      "           Radius: 7.0711",
    ])
    expect(
      written(cad, "CYLINDER", "2P", "50,0,0", "60,0,0", "5").slice(1, 3)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 2P",
      "Specify first end point of diameter: 50,0,0",
    ])
    expect(listed(cad)[2]).toBe("           Radius: 5.0000")
    expect(
      written(cad, "CYLINDER", "100,0,0", "D", "6", "5").slice(2, 4)
    ).toEqual([
      "Specify base radius or [Diameter] <5.0000>: D",
      "Specify diameter <10.0000>: 6",
    ])
    answer(cad, "CYLINDER", "3P", "200,0,0", "210,0,0", "200,0,10", "5")
    expect(listed(cad).slice(1, 4)).toEqual([
      "         Position, X = 205.0000  Y = 0.0000    Z = 5.0000",
      "           Normal: X = 0.0000    Y = -1.0000   Z = 0.0000",
      "           Radius: 7.0711",
    ])
    // Its seam turned to the plane's arbitrary axis' -X (c02's MPDUMP).
    expectAt(last(cad).brep.vertices[0], { x: 197.928932, y: 0, z: 5 })
    // 2P's second point is read in the first's plane (c02).
    answer(cad, "CYLINDER", "2P", "300,0,0", "310,0,4", "5")
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 305.0000  Y = 0.0000    Z = 0.0000",
      "           Radius: 5.0000",
    ])
  })

  it("makes Ttr's base tangent to two objects picked under TAN (c03, v05)", () => {
    const cad = console()
    answer(cad, "LINE", "0,0", "100,0", "", "LINE", "0,0", "0,100", "")
    answer(cad, "ZOOM", "E")
    expect(
      written(
        cad,
        "CYLINDER",
        "T",
        "FOO",
        "50,0",
        "_TAN",
        "50,0",
        "_TAN",
        "0,50",
        "FOO",
        "",
        "0",
        "10",
        "5"
      )
    ).toEqual([
      "CYLINDER",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: T",
      "Specify point on object for first tangent: FOO",
      "Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "Specify point on object for first tangent: 50,0",
      "*Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "Specify point on object for first tangent: _TAN to 50,0",
      "Specify point on object for second tangent: _TAN to 0,50",
      "Specify radius of circle: FOO",
      "Requires numeric distance or two points.",
      "Specify radius of circle:",
      "Requires numeric distance or two points.",
      "Specify radius of circle: 0",
      "Value must be positive and nonzero.",
      "Specify radius of circle: 10",
      "Specify height or [2Point/Axis endpoint]: 5",
    ])
    expect(listed(cad).slice(1, 3)).toEqual([
      "         Position, X = 10.0000   Y = 10.0000   Z = 0.0000",
      "           Radius: 10.0000",
    ])
    answer(cad, "CIRCLE", "300,300", "5")
    expect(
      written(
        cad,
        "CYLINDER",
        "T",
        "_TAN",
        "50,0",
        "_TAN",
        "305,300",
        "1"
      ).slice(-2)
    ).toEqual([
      "Specify radius of circle <10.0000>: 1",
      "Circle does not exist.",
    ])
  })

  it("takes Elliptical's axes, the second's end giving the seam (c04, v05)", () => {
    const cad = console()
    expect(
      written(cad, "CYLINDER", "E", "0,0,0", "10,0,0", "0,3,0", "8").slice(1, 5)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: E",
      "Specify endpoint of first axis or [Center]: 0,0,0",
      "Specify other endpoint of first axis: 10,0,0",
      "Specify endpoint of second axis: 0,3,0",
    ])
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 5.0000    Y = 0.0000    Z = 0.0000",
      "     Major radius: 5.8310",
      "     Minor radius: 5.0000",
      "           Height: 8.0000",
      "         Rotation: 149",
    ])
    expect(last(cad).brep.vertices[0]).toEqual({ x: 0, y: 3, z: 0 })
    expect(
      written(cad, "CYLINDER", "E", "C", "50,0,0", "5", "3", "8").slice(2, 6)
    ).toEqual([
      "Specify endpoint of first axis or [Center]: C",
      "Specify center point: 50,0,0",
      "Specify distance to first axis: 5",
      "Specify endpoint of second axis: 3",
    ])
    expect(listed(cad).slice(2, 6)).toEqual([
      "     Major radius: 5.0000",
      "     Minor radius: 3.0000",
      "           Height: 8.0000",
      "         Rotation: 26",
    ])
    answer(cad, "CYLINDER", "E", "100,0,0", "100,10,0", "103,5,0", "8")
    expect(listed(cad).at(-1)).toBe("         Rotation: 0")
    expect(
      written(
        cad,
        "CYLINDER",
        "E",
        "C",
        "0,0,0",
        "FOO",
        "",
        "0",
        "-2",
        "5"
      ).slice(4)
    ).toEqual([
      "Specify distance to first axis: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify distance to first axis:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify distance to first axis: 0",
      "Value must be positive and nonzero.",
      "Specify distance to first axis: -2",
      "Value must be positive and nonzero.",
      "Specify distance to first axis: 5",
    ])
    expect(written(cad, "FOO", "0,0,0", "3", "8").slice(0, 4)).toEqual([
      "Specify endpoint of second axis: FOO",
      "Point or option keyword required.",
      "Specify endpoint of second axis: 0,0,0",
      "Ellipse axes lengths must be positive and nonzero",
    ])
    // A first axis of no length refuses every second axis (c07).
    expect(
      written(cad, "CYLINDER", "E", "50,0,0", "50,0,0", "60,0,0").slice(-1)
    ).toEqual(["Ellipse axes lengths must be positive and nonzero"])
    answer(cad, "\u001b")
  })

  it("rises to Axis endpoint or 2Point, down when negative (c05, c07, c13)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "0,0,0", "5", "A", "10,0,10")
    expect(listed(cad).slice(1, 5)).toEqual([
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "           Normal: X = 0.7071    Y = 0.0000    Z = 0.7071",
      "           Radius: 5.0000",
      "           Height: 14.1421",
    ])
    // Its seam at the axis' arbitrary axis' -X (c05's MPDUMP).
    expectAt(last(cad).brep.vertices[0], { x: 0, y: -5, z: 0 })
    answer(cad, "CYLINDER", "50,0,0", "5", "2P", "0,0,0", "0,0,7")
    expect(listed(cad).at(-1)).toBe("           Height: 7.0000")
    answer(cad, "CYLINDER", "100,0,0", "5", "-6")
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
    expect(
      written(
        cad,
        "CYLINDER",
        "0,0,0",
        "5",
        "A",
        "FOO",
        "0,0,0",
        "0,0,9"
      ).slice(3)
    ).toEqual([
      "Specify height or [2Point/Axis endpoint] <-6.0000>: A",
      "Specify axis endpoint: FOO",
      "Point or option keyword required.",
      "Specify axis endpoint: 0,0,0",
      "Value must be nonzero.",
      "Specify axis endpoint: 0,0,9",
    ])
    // Straight up its seam stays on the UCS's X (c15).
    expect(last(cad).brep.vertices[0]).toEqual({ x: 5, y: 0, z: 0 })
    // Center, which the height declares, asks the axis endpoint (c13).
    expect(
      written(cad, "CYLINDER", "0,0,0", "2", "C", "0,0,4").slice(-2)
    ).toEqual([
      "Specify height or [2Point/Axis endpoint] <9.0000>: C",
      "Specify axis endpoint: 0,0,4",
    ])
  })

  it("refuses what makes no cylinder (c06, c08)", () => {
    const cad = console()
    expect(
      written(
        cad,
        "CYLINDER",
        "FOO",
        "",
        "0,0,0",
        "FOO",
        "",
        "0",
        "-2",
        "D",
        "FOO",
        "",
        "0",
        "10",
        "FOO",
        "",
        "0",
        "4"
      ).slice(1)
    ).toEqual([
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: FOO",
      "Point or option keyword required.",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]:",
      "Point or option keyword required.",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 0,0,0",
      "Specify base radius or [Diameter]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Diameter]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify base radius or [Diameter]: 0",
      "Value must be positive and nonzero.",
      "Specify base radius or [Diameter]: -2",
      "Value must be positive and nonzero.",
      "Specify base radius or [Diameter]: D",
      "Specify diameter: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify diameter:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify diameter: 0",
      "Value must be positive and nonzero.",
      "Specify diameter: 10",
      "Specify height or [2Point/Axis endpoint]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]:",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height or [2Point/Axis endpoint]: 0",
      "Value must be nonzero.",
      "Specify height or [2Point/Axis endpoint]: 4",
    ])
    expect(written(cad, "CYLINDER", "50,0,0", "", "").slice(2)).toEqual([
      "Specify base radius or [Diameter] <5.0000>:",
      "Specify height or [2Point/Axis endpoint] <4.0000>:",
    ])
    expect(
      written(
        cad,
        "CYLINDER",
        "3P",
        "0,0,0",
        "0,0,0",
        "10,0,0",
        "20,0,0",
        "0,10,0",
        "5"
      ).slice(3, 8)
    ).toEqual([
      "Specify second point: 0,0,0",
      "Points cannot be collinear. *Invalid*",
      "Specify second point: 10,0,0",
      "Specify third point: 20,0,0",
      "Points cannot be collinear. *Invalid*",
    ])
    expect(
      written(cad, "CYLINDER", "2P", "50,0,0", "50,0,0", "60,0,0", "5").slice(
        3,
        5
      )
    ).toEqual([
      "Specify second end point of diameter: 50,0,0",
      "Points cannot be coincident. *Invalid*",
    ])
  })

  it("lies in the UCS, an ellipse's Rotation read there (c09)", () => {
    const cad = console()
    answer(cad, "UCS", "X", "30", "CYLINDER", "0,0,0", "5", "8")
    answer(cad, "UCS", "W", "UCS", "Z", "30")
    answer(cad, "CYLINDER", "E", "50,0,3", "60,0", "52,3", "5")
    expect(listed(cad).slice(2, 4)).toEqual([
      "     Major radius: 5.0000",
      "     Minor radius: 4.2426",
    ])
    expect(listed(cad).at(-1)).toBe("         Rotation: 135")
    answer(cad, "UCS", "W")
    const [ellipse, tilted] = listedAll(cad)
    expect(ellipse.at(-1)).toBe("         Rotation: 165")
    expect(tilted[2]).toBe(
      "           Normal: X = 0.0000    Y = -0.5000   Z = 0.8660"
    )
    // In a tilted UCS its seam is the UCS's X (c09's MPDUMP).
    expect(solids(cad)[0].brep.vertices[0]).toEqual({ x: 5, y: 0, z: 0 })
  })

  it("moves, turns, mirrors and scales as a cylinder, not exploded (c10, c11)", () => {
    const cad = console()
    answer(cad, "CYLINDER", "0,0,0", "5", "8")
    answer(
      cad,
      "MOVE",
      "L",
      "",
      "0,0,0",
      "5,5,3",
      "ROTATE",
      "L",
      "",
      "0,0",
      "30"
    )
    expect(listed(cad)[1]).toBe(
      "         Position, X = 1.8301    Y = 6.8301    Z = 3.0000"
    )
    answer(
      cad,
      "MIRROR",
      "L",
      "",
      "0,40",
      "10,40",
      "N",
      "SCALE",
      "L",
      "",
      "0,0",
      "2"
    )
    expect(listed(cad).slice(1)).toEqual([
      "         Position, X = 3.6603    Y = 146.3397  Z = 6.0000",
      "           Radius: 10.0000",
      "           Height: 16.0000",
    ])
    answer(cad, "CYLINDER", "E", "100,0,0", "110,0", "102,3", "5")
    answer(
      cad,
      "ROTATE",
      "L",
      "",
      "100,0",
      "30",
      "MIRROR",
      "L",
      "",
      "0,40",
      "10,40",
      "Y"
    )
    expect(listed(cad).at(-1)).toBe("         Rotation: 195")
    for (const solid of solids(cad)) expect(brepIsClosed(solid.brep)).toBe(true)
    expect(brepVolume(solids(cad)[1].brep)).toBeCloseTo(8 * 628.318531, 5)
    // AutoCAD explodes it into regions and a SURFACE: no surface here.
    expect(written(cad, "EXPLODE", "L", "").slice(1, 4)).toEqual([
      "Select objects: L",
      "1 found",
      "1 was not able to be exploded.",
    ])
    answer(cad, "")
  })

  it("snaps at its circles' centres and quadrants, nothing on its isolines (s03, s10)", () => {
    const cad = console()
    answer(
      cad,
      "ZOOM",
      "W",
      "-10,-10",
      "40,40",
      "CYLINDER",
      "10,10,0",
      "5",
      "8"
    )
    expect(snapped(cad, "_END", "15.1,10.1")).toBe(
      "No Endpoint found for specified point."
    )
    expect(snapped(cad, "_CEN", "15.1,10.1")).toEqual({ x: 10, y: 10, z: 0 })
    expectAt(snapped(cad, "_QUA", "10.1,15.1") as Vec3, { x: 10, y: 15, z: 0 })
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    expect(snapped(cad, "_NEA", "10,15,4")).toBe(
      "No Nearest found for specified point."
    )
    expect(snapped(cad, "_CEN", "10,15,4")).toBe(
      "No Center found for specified point."
    )
    expectAt(snapped(cad, "_QUA", "10,15,7.9") as Vec3, { x: 10, y: 15, z: 8 })
    expectAt(snapped(cad, "_CEN", "10,15,7.9") as Vec3, { x: 10, y: 10, z: 8 })
  })
})

describe("CONE", () => {
  it("narrows to an apex, an Endpoint (solid/k01, s10)", () => {
    const cad = console()
    expect(written(cad, "CONE", "0,0,0", "5", "8")).toEqual([
      "CONE",
      "Specify center point of base or [3P/2P/Ttr/Elliptical]: 0,0,0",
      "Specify base radius or [Diameter]: 5",
      "Specify height or [2Point/Axis endpoint/Top radius]: 8",
    ])
    expect(listed(cad)).toEqual([
      "      Solid type = Cone",
      "         Position, X = 0.0000    Y = 0.0000    Z = 0.0000",
      "      Base radius: 5.0000",
      "       Top radius: 0.0000",
      "           Height: 8.0000",
    ])
    const { brep } = last(cad)
    expect(brep.vertices).toEqual([
      { x: 5, y: 0, z: 0 },
      { x: 0, y: 0, z: 8 },
    ])
    expect(brep.edges.map((e) => e.curve.kind)).toEqual(["circle", "point"])
    expect(brepIsClosed(brep)).toBe(true)
    expect(brepVolume(brep)).toBeCloseTo(209.43951, 5)
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 226.7284, Perimeter = 0.0000"
    )
    answer(cad, "-VIEW", "_SEISO", "ZOOM", "E")
    expect(snapped(cad, "_END", "0,0,8")).toEqual({ x: 0, y: 0, z: 8 })
    expect(snapped(cad, "_END", "5,0,0")).toBe(
      "No Endpoint found for specified point."
    )
  })

  it("takes Top radius, kept for the next, a top as wide making a cylinder (k02, k04)", () => {
    const cad = console()
    expect(written(cad, "CONE", "0,0,0", "5", "T", "2", "8").slice(3)).toEqual([
      "Specify height or [2Point/Axis endpoint/Top radius]: T",
      "Specify top radius <0.0000>: 2",
      "Specify height or [2Point/Axis endpoint]: 8",
    ])
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 278.9986, Perimeter = 0.0000"
    )
    expect(written(cad, "CONE", "50,0,0", "5", "T", "5", "8")[4]).toBe(
      "Specify top radius <2.0000>: 5"
    )
    expect(last(cad).brep.faces[0].surface.kind).toBe("cylinder")
    answer(cad, "CONE", "100,0,0", "5", "T", "8", "6")
    expect(listed(cad).slice(2, 4)).toEqual([
      "      Base radius: 5.0000",
      "       Top radius: 8.0000",
    ])
    expect(brepArea(last(cad).brep)).toBeCloseTo(553.569521, 5)
    expect(
      written(cad, "CONE", "150,0,0", "5", "T", "FOO", "-1", "", "-4").slice(4)
    ).toEqual([
      "Specify top radius <8.0000>: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify top radius <8.0000>: -1",
      "Value must be positive.",
      "Specify top radius <8.0000>:",
      "Specify height or [2Point/Axis endpoint] <6.0000>: -4",
    ])
    expect(listed(cad)[2]).toBe(
      "           Normal: X = 0.0000    Y = 0.0000    Z = -1.0000"
    )
  })

  it("takes Elliptical, LIST giving its base's radii and its top's major (k03)", () => {
    const cad = console()
    answer(cad, "CONE", "E", "0,0,0", "10,0,0", "0,3,0", "8")
    expect(listed(cad).slice(2)).toEqual([
      "Base major radius: 5.8310",
      "Base minor radius: 5.0000",
      " Top major radius: 0.0000",
      "           Height: 8.0000",
      "         Rotation: 149",
    ])
    expect(brepVolume(last(cad).brep)).toBeCloseTo(244.246342, 5)
    answer(cad, "CONE", "E", "50,0,0", "60,0,0", "50,3,0", "T", "2", "8")
    expect(listed(cad)[4]).toBe(" Top major radius: 2.0000")
    expect(written(cad, "AREA", "O", "L").at(-1)).toBe(
      "Area = 302.5128, Perimeter = 0.0000"
    )
  })

  it("asks in each language, by its own name (n02)", () => {
    const spanish = console(es)
    expect(written(spanish, "CONO", "0,0,0", "5", "R", "2", "8")).toEqual([
      "CONO",
      "Precise centro de base o [3P/2P/Ttr/Elíptico]: 0,0,0",
      "Precise radio de base o [Diámetro]: 5",
      "Indique altura o [2Puntos/punto final Eje/Radio superior]: R",
      "Precise radio superior <0.0000>: 2",
      "Precise altura o [2Puntos/punto final Eje]: 8",
    ])
    expect(listed(spanish).slice(2, 4)).toEqual([
      "    Radio de base: 5.0000",
      "   Radio superior: 2.0000",
    ])
    const portuguese = console(ptBR)
    expect(
      written(portuguese, "CILINDRO", "E", "0,0,0", "10,0,0", "0,3,0", "8")
    ).toEqual([
      "CILINDRO",
      "Especificar centro do ponto base ou [3P/2P/Ttr/Elíptico]: E",
      "Especificar ponto final do primeiro eixo ou [Centro]: 0,0,0",
      "Especificar outro ponto final do primeiro eixo: 10,0,0",
      "Especificar ponto final do segundo eixo: 0,3,0",
      "Especificar altura ou [2Pontos/ponto final Eixo]: 8",
    ])
    expect(listed(portuguese).slice(2, 4)).toEqual([
      "       Raio maior: 5.8310",
      "       Raio menor: 5.0000",
    ])
  })

  it("is saved and read back, a frustum and an elliptical cone too", () => {
    const cad = console()
    answer(cad, "CONE", "0,0,0", "5", "T", "2", "8")
    answer(cad, "CONE", "E", "50,0,0", "60,0,0", "50,3,0", "8")
    answer(cad, "CYLINDER", "100,0,0", "5", "A", "110,0,10")
    const document = cad.runtime.document
    const file = serializeDrawing(
      snapshotOf(document.getEntities(), { settings: document.getSettings() })
    )
    expect(parseDrawingFile(file).entities).toEqual(document.getEntities())
  })
})
